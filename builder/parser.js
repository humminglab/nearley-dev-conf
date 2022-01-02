// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "input", "symbols": ["_", "templates", "_"], "postprocess":  
        (data) => {
            return { templates: data[1] };
        } 
            },
    {"name": "templates", "symbols": ["template"], "postprocess": (data) => [data[0]]},
    {"name": "templates", "symbols": ["template", "_", "templates"], "postprocess": (data) => [data[0], ...data[2]]},
    {"name": "template", "symbols": ["key", "_", {"literal":"{"}, "_", "statements", "_", {"literal":"}"}], "postprocess":  
        (data) => { return {type: "TEMPLATE", name: data[0], data: data[4]}; }
            },
    {"name": "statements", "symbols": ["statement"], "postprocess": (data) => [data[0]]},
    {"name": "statements", "symbols": ["statement", "_", "statements"], "postprocess": (data) => [data[0], ...data[2]]},
    {"name": "statement", "symbols": ["key", "_", "basic_data_type", "_", {"literal":";"}], "postprocess":  
        (data) => {
            data[2]['name'] = data[0];
            return data[2];
        }
            },
    {"name": "statement", "symbols": ["key", "_", {"literal":"{"}, "_", "statements", "_", {"literal":"}"}, "_", {"literal":";"}], "postprocess": 
        (data) => {
            return {type: "OBJECT", name: data[0], data: data[4]}; 
        }
            },
    {"name": "statement", "symbols": ["key", "_", {"literal":"["}, "_", "number", "_", {"literal":"]"}, "_", {"literal":"{"}, "_", "statements", "_", {"literal":"}"}, "_", {"literal":";"}], "postprocess":  
        (data) => {
            return {type: "ARRAY", name: data[0], length: data[4], data: data[10]};
        }
            },
    {"name": "basic_data_type", "symbols": ["basic_type"], "postprocess": (data) => { return {type: data[0][0], length: 0}; }},
    {"name": "basic_data_type", "symbols": ["basic_type", "_", {"literal":"("}, "_", "number", "_", {"literal":")"}], "postprocess": (data) => { return {type: data[0][0], length: Number(data[4])}; }},
    {"name": "basic_data_type", "symbols": ["fixed_type_prefix", "_", {"literal":"["}, "_", "number", "_", {"literal":"]"}], "postprocess": (data) => { data[0].length = Number(data[4]); return data[0]; }},
    {"name": "fixed_type_prefix$string$1", "symbols": [{"literal":"S"}, {"literal":"T"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "fixed_type_prefix", "symbols": ["fixed_type_prefix$string$1"], "postprocess": () => { return {type: "FIX_STR"}; }},
    {"name": "basic_type$string$1", "symbols": [{"literal":"I"}, {"literal":"8"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "basic_type", "symbols": ["basic_type$string$1"]},
    {"name": "basic_type$string$2", "symbols": [{"literal":"U"}, {"literal":"8"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "basic_type", "symbols": ["basic_type$string$2"]},
    {"name": "basic_type$string$3", "symbols": [{"literal":"I"}, {"literal":"1"}, {"literal":"6"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "basic_type", "symbols": ["basic_type$string$3"]},
    {"name": "basic_type$string$4", "symbols": [{"literal":"U"}, {"literal":"1"}, {"literal":"6"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "basic_type", "symbols": ["basic_type$string$4"]},
    {"name": "basic_type$string$5", "symbols": [{"literal":"I"}, {"literal":"3"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "basic_type", "symbols": ["basic_type$string$5"]},
    {"name": "basic_type$string$6", "symbols": [{"literal":"U"}, {"literal":"3"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "basic_type", "symbols": ["basic_type$string$6"]},
    {"name": "key$ebnf$1", "symbols": []},
    {"name": "key$ebnf$1", "symbols": ["key$ebnf$1", "key_character"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "key", "symbols": ["key_character_first", "key$ebnf$1"], "postprocess": (data) => data[0] + data[1].join("")},
    {"name": "key_character_first", "symbols": [/[_\-a-zA-Z]/], "postprocess": id},
    {"name": "key_character", "symbols": [/[_\-a-zA-Z0-9/]/], "postprocess": id},
    {"name": "number", "symbols": ["digits"], "postprocess": (data) => Number(data[0])},
    {"name": "number", "symbols": ["digits", {"literal":"."}, "digits"], "postprocess": (data) => Number(data[0] + "." + data[2])},
    {"name": "number", "symbols": [{"literal":"0"}, /[xX]/, "hexs"], "postprocess": (data) => parseInt(data[2], 16)},
    {"name": "hexs", "symbols": ["hex"], "postprocess": id},
    {"name": "hexs", "symbols": ["hex", "hexs"], "postprocess": (data) => data.join("")},
    {"name": "hex", "symbols": [/[0-9a-fA-F]/], "postprocess": (data) => data[0].toLowerCase()},
    {"name": "digits", "symbols": ["digit"], "postprocess": id},
    {"name": "digits", "symbols": ["digit", "digits"], "postprocess": (data) => data.join("")},
    {"name": "digit", "symbols": [/[0-9]/], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[ \t\r\n]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "_$ebnf$2", "symbols": []},
    {"name": "_$ebnf$2", "symbols": ["_$ebnf$2", /[^\r\n]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_", {"literal":"#"}, "_$ebnf$2", {"literal":"\n"}, "_"]},
    {"name": "_$ebnf$3", "symbols": []},
    {"name": "_$ebnf$3", "symbols": ["_$ebnf$3", /[^\r\n]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_", {"literal":"#"}, "_$ebnf$3", {"literal":"\r"}, "_"]}
]
  , ParserStart: "input"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
