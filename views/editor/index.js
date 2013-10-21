var fs = require('fs');

exports.view = function(req, res) {
    fs.readFile(__dirname + '/../../sample/Screenwriter.fountain', function (err, data) {
        if (err) throw err;
        res.render('editor/index', {
            screenplay: data
        });
    });
}
exports.download = function(req, res) {

    console.log(req.body.filename);
    var filename = req.param("filename");
    console.log(filename);
    var content = req.param("content");
    console.log(content);
    var type = req.param("type") || "fountain";

    res.attachment(filename + "." + type);
    res.end(content, 'UTF-8');

}