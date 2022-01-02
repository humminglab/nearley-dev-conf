input -> _ templates _ 
    {% 
        (data) => {
            return { templates: data[1] };
        } 
    %}

templates 
    -> template {% (data) => [data[0]] %}
    | template _ templates {% (data) => [data[0], ...data[2]] %}

template 
    -> key _ "{" _ statements _ "}"
    {% 
        (data) => { return {type: "TEMPLATE", name: data[0], data: data[4]}; }
    %}

statements 
    -> statement {% (data) => [data[0]] %}
    | statement _ statements {% (data) => [data[0], ...data[2]] %}

statement 
    -> key _ basic_data_type _ ";" 
    {% 
        (data) => {
            data[2]['name'] = data[0];
            return data[2];
        }
    %}
    | key _ "{" _ statements _ "}" _ ";"
    {%
        (data) => {
            return {type: "OBJECT", name: data[0], data: data[4]}; 
        }
    %}
    | key _ "[" _ number _ "]" _ "{" _ statements _ "}" _ ";" 
    {% 
        (data) => {
            return {type: "ARRAY", name: data[0], length: data[4], data: data[10]};
        }
    %}

basic_data_type
    -> basic_type {% (data) => { return {type: data[0][0], length: 0}; } %}
    | basic_type _ "(" _ number _ ")" {% (data) => { return {type: data[0][0], length: Number(data[4])}; } %}
    | fixed_type_prefix _ "[" _ number _ "]" {% (data) => { data[0].length = Number(data[4]); return data[0]; } %}

fixed_type_prefix
    -> "STR" {% () => { return {type: "FIX_STR"}; } %}

basic_type
    -> "I8"
    | "U8"
    | "I16"
    | "U16"
    | "I32"
    | "U32"

key -> key_character_first key_character:*  {% (data) => data[0] + data[1].join("") %}
key_character_first -> [_\-a-zA-Z]   {% id %}
key_character -> [_\-a-zA-Z0-9/] {% id %}

number 
    -> digits {% (data) => Number(data[0])  %}
    | digits "." digits {% (data) => Number(data[0] + "." + data[2]) %}
    | "0" [xX] hexs {% (data) => parseInt(data[2], 16) %}

hexs 
    -> hex {% id %}
    | hex hexs {% (data) => data.join("") %}

hex -> [0-9a-fA-F] {% (data) => data[0].toLowerCase() %}

digits 
    -> digit {% id %}
    | digit digits {% (data) => data.join("") %}

digit -> [0-9]   {% id %}

_ 
    -> [ \t\r\n]:*
    | _ "#" [^\r\n]:* "\n" _
    | _ "#" [^\r\n]:* "\r" _