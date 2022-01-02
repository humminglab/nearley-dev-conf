const yargs = require('yargs');
const nearley = require('nearley');
const fs = require("fs");
const readline = require('readline');
const stream = require('stream');
const r = require('restructure');
const concat = require('concat-stream');
const polycrc = require('polycrc');

const grammar = require('./parser.js');
const fsPromises = fs.promises;

const argv = yargs
.usage("$0 IN_FILE OUT_FILE")
.help()
.alias('help', 'h')
.argv;

// input 에서 주석 문장 제거
async function removeComment(input) {
    let buf = Buffer.from(input);
    let bufferStream = new stream.PassThrough();
    let output = [];
    bufferStream.end(buf);
    let rl = readline.createInterface({
        input: bufferStream,
    })

    for await (const line of rl) {
        let re = /^\s*#.*/;
        let result = re.exec(line);
        if (result) {
            output.push('');
            continue;
        }

        re = /(.*)(#[^'"]*)$/;
        result = re.exec(line);
        if (result)
            output.push(result[1]);
        else 
            output.push(line);
    }
    return output.join('\n');
}

// nearley 로 parsing 하기
async function parseFile(inputFile) {
    let input = (await fsPromises.readFile(inputFile)).toString();
    input = await removeComment(input);

    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    parser.reportError = function(token) {
        var message = this.lexer.formatError(token, 'invalid syntax') + '\n';
        message += 'Unexpected ' + (token.type ? token.type + ' token: ' : '');
        message += JSON.stringify(token.value !== undefined ? token.value : token) + '\n';
        return message;
    };
    parser.feed(input);
    return parser;
}

// template 내의 string 추출
function addObjectStr(s, o)
{
    for (const elem of o) {
        if (elem.type == 'OBJECT' || elem.type == 'ARRAY') {
            s.add(elem.name);
            addObjectStr(s, elem.data);
        } else {
            s.add(elem.name);
        }
    }
}

// string만 추려서 정렬된 array로 리턴
function buildStringTable(templates)
{
    let s = new Set();

    for (const t of templates) {
        s.add(t.name);
        addObjectStr(s, t.data);
    }
    return [...s].sort();
}

function getByteLength(s) 
{
    for (b=i=0; c=s.charCodeAt(i++); b += c>>11 ? 3 : c>>7 ? 2 : 1);
    return b;
}

// string만 index 와 string table로 만들기
function packStrings(strings)
{
    return new Promise(function(resolve) {
        let stream = new r.EncodeStream();
        stream.pipe(concat((buf) => resolve(buf)));
        let Index = r.uint16le;
        let offset = 0;
        Index.encode(stream, offset);
        for (const s of strings) {
            offset += s.length + 1;
            if (s.length != getByteLength(s)) {
                throw(`Support Only ascii characters: ${s}`);
            }
            Index.encode(stream, offset);
        }

        for (const s of strings) {
            let Str = new r.String(null);
            Str.encode(stream, s);
        }
        stream.end();
    });
}

function fillElements(template, strings, stream, data, count)
{
    const d = {
        'I8': {id: 1, hasLen: true},
        'U8': {id: 2, hasLen: true},
        'I16': {id: 3, hasLen: true},
        'U16': {id: 4, hasLen: true},
        'I32': {id: 5, hasLen: true},
        'U32': {id: 6, hasLen: true},
        'OBJECT': {id: 7, hasLen: false}, 
        'ARRAY': {id: 8, hasLen: true},
        'FIX_STR': {id: 9, hasLen: true},
        'END': {id: 100, hasLen: false}
    };

    let Body = new r.Struct({
        name: r.uint16le,
        type: r.uint8,
        pad: r.uint8,
        len: r.uint16le
    });

    if (data.length == 0)
        throw(`Template '${template.name}' has no data`);

    for (const elem of data) {
        Body.encode(stream, {
            name: strings.indexOf(elem.name),
            type: d[elem.type].id, 
            pad: 0,
            len: (d[elem.type].hasLen) ? elem.length : 0
        });
        count++;
        
        if (elem.type == 'OBJECT' || elem.type == 'ARRAY') {
            count = fillElements(template, strings, stream, elem.data, count);
            count++;
            Body.encode(stream, {
                name: strings.indexOf(elem.name),
                type: d['END'].id, 
                pad: 0,
                len: (d[elem.type].hasLen) ? elem.length : 0
            });
        }
    }
    return count;
}

function packTemplateBody(template, strings, data)
{
    let count = 0;
    return new Promise(function(resolve) {
        let stream = new r.EncodeStream();
        stream.pipe(concat((buf) => resolve({buf: buf, num: count})));
        count = fillElements(template, strings, stream, data, count);
        stream.end();
   });
}

function packTemplateHeader(template, strings, numFields)
{
    return new Promise(function(resolve) {
        let stream = new r.EncodeStream();
        stream.pipe(concat((buf) => resolve(buf)));

        let Header = new r.Struct({
            name: r.uint16le, 
            num: r.uint16le
        });

        Header.encode(stream, {
            name: strings.indexOf(template.name), 
            num: numFields
        });
        stream.end();
   });
}

async function packTemplate(template, strings)
{
    let body = await packTemplateBody(template, strings, template.data);
    let hd = await packTemplateHeader(template, strings, body.num);
    return Buffer.concat([hd, body.buf]);
}

function packTemplatesIndex(binTemplates)
{
    return new Promise(function(resolve) {
        let stream = new r.EncodeStream();
        stream.pipe(concat((buf) => resolve(buf)));
        let Index = r.uint16le;
        let offset = 0; 
        Index.encode(stream, offset);
        for (const t of binTemplates) {
            offset += t.length;
            Index.encode(stream, offset);
        }    
        stream.end();
    });
}

async function packTemplates(templates, strings)
{
    let binTemplates = [];
    for (const t of templates) {
        binTemplates.push(await packTemplate(t, strings));
    }
    let index = await packTemplatesIndex(binTemplates);
    return Buffer.concat([index, ...binTemplates]);
}

function packHeader(templates, strings, binStrings, binTemplates)
{
    return new Promise(function(resolve) {
        let stream = new r.EncodeStream();
        stream.pipe(concat((buf) => resolve(buf)));
        let Header = new r.Struct({
            header: r.uint16le,
            total_size: r.uint16le,
            crc16: r.uint16le,
            numStrings: r.uint16le,
            numTemplates: r.uint16le,
            offsetStringIndex: r.uint16le,
            offsetStringTable: r.uint16le,
            offsetTemplateIndex: r.uint16le,
            offsetTemplateTable: r.uint16le
        });
        Header.encode(stream, {
            header: 0x5aa5,
            total_size: Header.size() + binStrings.length + binTemplates.length,
            crc16: 0,   // calc later
            numStrings: strings.length,
            numTemplates: templates.length,
            offsetStringIndex: Header.size(),
            offsetStringTable: Header.size() + (strings.length + 1) * 2,
            offsetTemplateIndex: Header.size()  + binStrings.length,
            offsetTemplateTable: Header.size()  + binStrings.length + (templates.length + 1) * 2
        })
        stream.end();
    });
}

async function buildResult(templates) {
    let strings = buildStringTable(templates)
    let binStrings = await packStrings(strings);
    let binTemplates = await packTemplates(templates, strings);
    let binHeader = await packHeader(templates, strings, binStrings, binTemplates);

    let data = Buffer.concat([binHeader, binStrings, binTemplates]);
    let crc16 = polycrc.crc(16, 0x1021, 0x00, 0x00, false);
    let crc16_val = crc16(data);
    data[4] = crc16_val & 0xff;
    data[5] = (crc16_val >> 8) & 0xff;

    return data;
}

async function main() {
    console.log('Parser v1.0');

    if (argv._.length != 2) {
        console.log('No Input or Output file specified');
        process.exit(1);
    }

    const inputFile = argv._[0];
    const outputFile = argv._[1];
    let parser;

    try {
        parser = await parseFile(inputFile);
    } catch (e) {
        console.log('Parser Error: ', e.message);
    }
    console.log('Finished Parsing');
    // console.dir(parser.results, {depth: null});
    let data = await buildResult(parser.results[0].templates);
    let writer = fs.createWriteStream(outputFile);
    writer.write(data);
    writer.end();
}

main()
    .catch(err => console.error(err));