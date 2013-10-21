exports.view = function(req, res) {
    res.render('editor/index');
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