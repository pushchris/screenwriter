var request = require('superagent'),
    dom = require('dom'),
    fountain = require('fountain'),
    height = require('textarea-height'),
    debounce = require('debounce'),
    post = require('post'),
    Tip = require('tip'),
    mobile = require('is-mobile'),
    autocomplete = require('./autocomplete');

var charAutocomplete,
    title = "",
    characters = {},
    tokens = [],
    height;
    
var $editor = dom('.editor'),
    $viewer = dom('.viewer'),
    $download = dom('.nav-download'),
    $tooltip = dom('.tooltip'),
    $viewerScript = dom('.viewer-script');

$viewerScript
    .addClass('dpi72')
    .addClass('us-letter');

charAutocomplete = autocomplete.start($editor.find('textarea'));

if(mobile())
    height($editor.find('textarea').get(0), true); 

var parseStringForArray = function(string) {
    return string.replace(/ *\([^)]*\) */g, "").replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
}

var removeParentheticals = function(string) {
    return string.replace(/ *\([^)]*\) */g, "");
}
var stopEvent = function(e) {
    e.stopPropagation();
    e.preventDefault();
}
var getDimentions = function() {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    return { x: x, y: y };
}

var resize = function() {
    var dim = getDimentions();
    $viewer.css('height', dim.y);
    $editor.css('height', dim.y);
}

var dragOver = function(e) {
    dom(this).addClass('over');
    stopEvent(e);
}
var dragLeave = function(e) {
    dom(this).removeClass('over');
    stopEvent(e);
}
var loadScript = function(e) {
    stopEvent(e);
    
    dom(this).removeClass('over');
    
    var file = e.dataTransfer.files[0],
        reader = new FileReader();
    
    if(file) {
        reader.onload = function(evt) {
            $editor.find('textarea').val(evt.target.result);
            generateScript();
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
            characters = [];
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
            charAutocomplete.setTags(characters);
        } 
    });
}

$editor.find('textarea').on('keyup', debounce(generateScript, 250));
$editor.on('dragleave', dragLeave).on('dragover', dragOver).on('drop', loadScript);
$download.on('click', function() {
    var dim = getDimentions();
    var tip = new Tip($tooltip.html());
    var hide = function() {
        $editor.find('textarea').off("click", hide);
        tip.hide();
    }
    tip.on("show", function() {
        dom('.download-option').on('click', function() {
            post('/download', { type: dom(this).attr('title'), filename: title, tokens: JSON.stringify(tokens), content: $editor.find('textarea').val() });
            tip.hide();
        });
        $editor.find('textarea').on('click', hide);   
    });
    tip.show(75, parseInt(dim.y) - 120);
});

if (window.File && window.FileReader && window.FileList && window.Blob) {

} else {
    alert('The File APIs are not fully supported in this browser.');
}

window.onresize = resize;
resize();
generateScript();