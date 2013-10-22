var fs = require('fs'),
    fdx = require('../../exports/fdx'),
    fountain = require('../../exports/fountain');

exports.view = function(req, res) {
    fs.readFile(__dirname + '/../../sample/Screenwriter.fountain', function (err, data) {
        if (err) throw err;
        res.render('editor/index', {
            screenplay: data
        });
    });
}
exports.download = function(req, res) {

    var toExport;

    var filename = req.param("filename"),
        content = req.param("content"),
        tokens = req.param("tokens"),
        type = req.param("type") || "fountain";
    
    if(type == "fdx")
        toExport = fdx.convert(JSON.parse(tokens).tokens);
    else
        toExport = fountain.convert(content);


    res.attachment(filename + "." + type);
    res.end(toExport, 'UTF-8');

}