var request = require('superagent'),
    dom = require('dom'),
    fountain = require('fountain'),
    debounce = require('debounce')
    post = require('post');


var autocomplete,
    change = false,
    title = "",
    characters = {},
    tokens = [];

var height;
    
var $editor = dom('.editor'),
    $viewer = dom('.viewer'),
    $download = dom('.nav-download'),
    $viewerScript = dom('.viewer-script');
    
    

$viewerScript
    .addClass('dpi72')
    .addClass('us-letter');

//autocomplete = $editor.find('textarea').tagSuggest({ tags: characters });

var parseStringForArray = function(string) {
    return string.replace(/ *\([^)]*\) */g, "").replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
}

var removeParentheticals = function(string) {
    return string.replace(/ *\([^)]*\) */g, "");
}

var resize = function() {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
        
    $viewer.css('height', y);
    $editor.css('height', y);
}

var dragOver = function(e) {
    dom(this).addClass('over');
    e.stopPropagation();
    e.preventDefault();
}
var dragLeave = function(e) {
    dom(this).removeClass('over');
    e.stopPropagation();
    e.preventDefault();
}
var loadScript = function(e) {
    e.preventDefault();
    e.stopPropagation();
    e = e.originalEvent;
    
    dom(this).removeClass('over');
    
    var file = e.dataTransfer.files[0],
        reader = new FileReader();
    
    if(file) {
        reader.onload = function(evt) {
            $editor.find('textarea').val(evt.target.result);
            change = true;
        }
    
        reader.readAsText(file);
    }
}
var page = function(html, isTitlePage) {
    var $output = dom(document.createElement('div')).addClass('viewer-script-page').html(html);
    
    if (isTitlePage) {
        $output.addClass('title-page');
    } else {
        /*
$output.find('div.dialogue.dual').each(function() {
            dual = dom(this).prev('div.dialogue');
            dom(this).wrap(dom(document.createElement('div')).addClass('dual-dialogue'));
            dual.prependTo($(this).parent());
        });
*/
    }
    return $output;
}
var generateScript = function() {
    fountain.parse($editor.find('textarea').val(), true, function(result) {
        if(result) {
            tokens = result;
            $viewerScript.html('');
            if(result.title && result.html.title_page) {
                $viewerScript.append(page(result.html.title_page, true));
                title = result.title || 'Untitled';
            }
            $viewerScript.append(page(result.html.script));
            for(i in result.tokens) {
                if(result.tokens[i].type == 'character') {
                    var char = parseStringForArray(result.tokens[i]['text']);
                    if(!characters[char]) {
                        characters[char] = removeParentheticals(result.tokens[i]['text']);
                    }
                }
            }
            //autocomplete.setTags(characters);
        } 
    });
}

$editor.find('textarea').on('keyup', debounce(generateScript, 250));
$editor.on('dragleave', dragLeave).on('dragover', dragOver).on('drop', loadScript);
$download.on('click', function() {
    post('/download', { type: "fountain", filename: title, tokens: JSON.stringify(tokens), content: $editor.find('textarea').val() });
});

if (window.File && window.FileReader && window.FileList && window.Blob) {

} else {
    alert('The File APIs are not fully supported in this browser.');
}

window.onresize = resize;
resize();
generateScript();