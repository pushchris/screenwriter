var autocomplete,
            change = false,
            title = "",
            characters = {},
            tokens = [];
        
        var height;
            
        var $editor = $('.editor'),
            $viewer = $('.viewer'),
            $download = $('.nav-download'),
            $viewerScript = $('.viewer-script');
            
        $viewerScript.addClass('dpi72').addClass('us-letter');
        autocomplete = $editor.find('textarea').tagSuggest({ tags: characters });
        
        var parseStringForArray = function(string) {
            return string.replace(/ *\([^)]*\) */g, "").replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '');
        }
        var removeParentheticals = function(string) {
            return string.replace(/ *\([^)]*\) */g, "");
        }
        var resize = function() {
            height = $(window).innerHeight();
            $viewer.height(height);
            $editor.height(height);
        }
        var dragOver = function (e) {
            $(this).addClass('over');
            e.stopPropagation();
            e.preventDefault();
        }
        var dragLeave = function (e) {
            $(this).removeClass('over');
            e.stopPropagation();
            e.preventDefault();
        }
        var loadScript = function (e) {
            e.preventDefault();
            e.stopPropagation();
            e = e.originalEvent;
            
            $(this).removeClass('over');
            
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
            var $output = $(document.createElement('div')).addClass('viewer-script-page').html(html);
            
            if (isTitlePage) {
                $output.addClass('title-page');
            } else {
                $output.children('div.dialogue.dual').each(function() {
                    dual = $(this).prev('div.dialogue');
                    $(this).wrap($(document.createElement('div')).addClass('dual-dialogue'));
                    dual.prependTo($(this).parent());
                });
            }
            return $output;
        }
        var backgroundFunctions = function() {
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
                    autocomplete.setTags(characters);
                } 
            });
        }
        
        $editor.find('textarea').on('change keyup', $.debounce(250, backgroundFunctions));
        $editor.on('dragleave', dragLeave).on('dragover', dragOver).on('drop', loadScript);
        $download.on('click', function() {
            $.form('/download', { type: "fountain", filename: title, tokens: JSON.stringify(tokens), content: $editor.find('textarea').val() }).submit();
        });
        
        if (window.File && window.FileReader && window.FileList && window.Blob) {

        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
        
        $(window).resize(resize);
        resize();
        setInterval(backgroundFunctions, 3000);