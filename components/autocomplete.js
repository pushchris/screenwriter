var dom = require('dom');

function getTags(tags) {
    var goodTags = [];
    for(i in tags)
        goodTags.push(tags[i]);
    return goodTags;
}
    
module.exports.start = function($this) {
    
    var settings = { 
        'matchClass' : 'editor-tag-matches', 
        'innerMatchClass' : 'editor-tag-matches-inner',
        'tagContainer' : 'span', 
        'tagWrap' : 'span', 
        'sort' : true,
        'url' : null,
        'delay' : 0,
        'separator' : ' '
    };

    var i, 
        tag = {}, 
        userTags = [];

    var matches, 
        fromTab = false;
    var suggestionsShow = false;
    var workingTag = "";
    var currentTag = {"position": 0, tag: ""};
    var tagMatches = dom(document.createElement(settings.tagContainer));
    var innerTagMatches = dom(document.createElement('div'));
    
    tagMatches.addClass(settings.matchClass);
    innerTagMatches.addClass(settings.innerMatchClass);
    tagMatches.append(innerTagMatches);
    
    function showSuggestionsDelayed(el, key) {
        if (settings.delay) {
            if ($this.timer) clearTimeout($this.timer);
            $this.timer = setTimeout(function () {
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
        var v = dom($this).val();

        if (v == dom($this).attr('title') && dom($this).hasClass('hint'))
            v = '';

        currentTags = v.split(settings.separator);
        hideSuggestions();
    }

    function chooseTag(ev, tag) {
        var toInsert = tag.substr(workingTag.length);
        var corpus = dom($this).val();
        var position = getCaret(dom($this).get(0));

        dom($this).val(corpus.substr(0, position) + toInsert + corpus.substr(position));
        
        setCaretToPos(dom($this).get(0), position + toInsert.length);
        
        setSelection();
        
        ev.stopPropagation();
        ev.preventDefault();
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
                    chooseTag(ev, matches[0]);
                    
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

    dom($this).on('keypress', handleKeys).on('keyup', handleKeys).on('blur', function() {
        if (fromTab == true || suggestionsShow) {
            fromTab = false;
            //tagsElm.focus();
        }
    });
    tagMatches.insertAfter($this);

    // initialise
    setSelection();  
    
    tag.setTags = function(tags) {
        userTags = getTags(tags);
    }
    
    return tag;
        
};