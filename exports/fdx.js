var write_text = function(text) {
    return '<Text>' + text + '</Text>';
}
var write_paragraph = function(text, type, centered) {
    var str = '';
    if(centered) {
        str = '<Paragraph Alignment="Center" Type="'+type+'">';
    } else {
        str = '<Paragraph Type="'+type+'">';
    }
    str += write_text(text);
    str += '</Paragraph>';
    return str;
}

exports.convert = function(tokens) {

    xml = [];
    
    xml.push('<?xml version="1.0" encoding="UTF-8" standalone="no" ?>');
    xml.push('<FinalDraft DocumentType="Script" Template="No" Version="1">');
    xml.push('<Content>');
    
    console.log(tokens);
    
    for(i in tokens) {
        var type = tokens[i].type;
        if(type == "dialogue")
            xml.push(write_paragraph(tokens[i].text, "Dialogue", false));
        else if(type == "action")
            xml.push(write_paragraph(tokens[i].text, "Action", true));
        else if(type == "character")
            xml.push(write_paragraph(tokens[i].text, "Character", false));
        else if(type == "scene_heading")
            xml.push(write_paragraph(tokens[i].text, "Scene Heading", false));
        else if(type == "parenthetical")
            xml.push(write_paragraph(tokens[i].text, "Parenthetical", false));
        else {}
    }
    
    xml.push('</Content>');
    xml.push('</FinalDraft>');
    
    var xml_raw = xml.join('\n');
    return xml_raw;
}