(function ($) {
    var globalTags = [];

    window.setGlobalTags = function(tags) {
        globalTags = getTags(tags);
    };
    
    function getTags(tags) {
        var goodTags = [];
        for(tag in tags)
            goodTags.push(tags[tag]);
        return goodTags;
    }
    
    $.fn.tagSuggest = function(options) {
        
        var defaults = { 
            'matchClass' : 'editor-tag-matches', 
            'innerMatchClass' : 'editor-tag-matches-inner',
            'tagContainer' : 'span', 
            'tagWrap' : 'span', 
            'sort' : true,
            'tags' : null,
            'url' : null,
            'delay' : 0,
            'separator' : ' '
        };

        var i, tag, userTags = [], settings = $.extend({}, defaults, options);

        if (settings.tags) {
            userTags = getTags(settings.tags);
        } else {
            userTags = globalTags;
        }

        var tagsElm = $(this);
        var elm = this;
        var matches, fromTab = false;
        var suggestionsShow = false;
        var workingTag = "";
        var currentTag = {"position": 0, tag: ""};
        var tagMatches = document.createElement(settings.tagContainer);
        var innerTagMatches = document.createElement('div');
        
        $(innerTagMatches).addClass(settings.innerMatchClass);
        tagMatches.appendChild(innerTagMatches);
        
        innerTagMatches = $(innerTagMatches);
        
        function showSuggestionsDelayed(el, key) {
            if (settings.delay) {
                if (elm.timer) clearTimeout(elm.timer);
                elm.timer = setTimeout(function () {
                    showSuggestions(el, key);
                }, settings.delay);
            } else {
                showSuggestions(el, key);
            }
        }
        
        function getCaret(el) { 
            if (el.selectionStart) { 
                return el.selectionStart; 
            } else if (document.selection) { 
                el.focus(); 
            
                var r = document.selection.createRange(); 
                if (r == null) { 
                    return 0; 
                } 
            
                var re = el.createTextRange(), 
                rc = re.duplicate(); 
                re.moveToBookmark(r.getBookmark()); 
                rc.setEndPoint('EndToStart', re); 
            
                return rc.text.length; 
            }  
            return 0; 
        }
        function setSelectionRange(el, selectionStart, selectionEnd) {
            if(el.setSelectionRange) {
                el.focus();
                el.setSelectionRange(selectionStart, selectionEnd);
            } else if(el.createTextRange) {
                var range = el.createTextRange();
                range.collapse(true);
                range.moveEnd('character', selectionEnd);
                range.moveStart('character', selectionStart);
                range.select();
            }
        }
        
        function setCaretToPos(el, pos) {
            setSelectionRange(el, pos, pos);
        }

        function showSuggestions(el, key) {

            var charPos = getCaret(el),
                foundSpace = false,
                i, 
                html = '';
                
            var currPos = charPos,
                currChar;
                
            matches = [];
            workingTag = '';
            
            while(!foundSpace) {
                currChar = el.value.charAt(currPos);
                if(currChar != ' ' && currChar == currChar.toUpperCase()) {
                    if(/[a-zA-Z0-9]/.test(currChar))
                        workingTag = currChar + workingTag;
                    currPos--;
                } else {
                    foundSpace = true;
                }
            }

            if (workingTag) {
                for (i = 0; i < userTags.length; i++) {
                    if (userTags[i].indexOf(workingTag) === 0) {
                        matches.push(userTags[i]);
                    }
                }                

                if (settings.sort) {
                    matches = matches.sort(-1);
                }                    

                for (i = 0; i < matches.length; i++) {
                    html += '<' + settings.tagWrap + ' class="_tag_suggestion">' + matches[i].toLowerCase() + '</' + settings.tagWrap + '>';
                }

                innerTagMatches.html(html);
                suggestionsShow = !!(matches.length);
            } else {
                hideSuggestions();
            }
        }

        function hideSuggestions() {
            innerTagMatches.empty();
            matches = [];
            suggestionsShow = false;
        }

        function setSelection() {
            var v = tagsElm.val();

            if (v == tagsElm.attr('title') && tagsElm.is('.hint')) v = '';

            currentTags = v.split(settings.separator);
            hideSuggestions();
        }

        function chooseTag(tag) {
            var toInsert = tag.substr(workingTag.length);
            var corpus = tagsElm.val();
            var position = getCaret(tagsElm[0]);
            tagsElm.val(corpus.substr(0, position) + toInsert + corpus.substr(position));
            
            setCaretToPos(tagsElm[0], position + toInsert.length);
            
            setSelection();
        }

        function handleKeys(ev) {
            fromTab = false;
            var type = ev.type;
            var resetSelection = false;
            
            switch (ev.keyCode) {
                case 37: // ignore cases (arrow keys)
                case 38:
                case 39:
                case 40: {
                    hideSuggestions();
                    return true;
                }
                case 224:
                case 17:
                case 16:
                case 18: {
                    return true;
                }

                case 8: {
                    // delete - hide selections if we're empty
                    if (this.value == '') {
                        hideSuggestions();
                        setSelection();
                        return true;
                    } else {
                        type = 'keyup'; // allow drop through
                        resetSelection = true;
                        showSuggestionsDelayed(this);
                    }
                    break;
                }

                case 9: // return and tab
                case 13: {
                    if (suggestionsShow) {
                        // complete
                        chooseTag(matches[0]);
                        
                        fromTab = true;
                        return false;
                    } else {
                        return true;
                    }
                }
                case 27: {
                    hideSuggestions();
                    setSelection();
                    return true;
                }
                case 32: {
                    setSelection();
                    return true;
                }
            }

            if (type == 'keyup') {
                switch (ev.charCode) {
                    case 9:
                    case 13: {
                        return true;
                    }
                }

                if (resetSelection) { 
                    setSelection();
                }
                showSuggestionsDelayed(this, ev.charCode);            
            }
        }

        tagsElm.after(tagMatches).keypress(handleKeys).keyup(handleKeys).blur(function () {
            if (fromTab == true || suggestionsShow) {
                fromTab = false;
                tagsElm.focus();
            }
        });

        // replace with jQuery version
        tagMatches = $(tagMatches).click(function (ev) {
            if (ev.target.nodeName == settings.tagWrap.toUpperCase() && $(ev.target).is('._tag_suggestion')) {
                chooseTag(ev.target.innerHTML);
            }                
        }).addClass(settings.matchClass);

        // initialise
        setSelection();  
        
        var tag = {};
        
        tag.setTags = function(tags) {
            userTags = getTags(tags);
        }
        
        return tag;
            
    };
})(jQuery);