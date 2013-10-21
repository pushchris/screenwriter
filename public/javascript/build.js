jQuery(function($) { 
            $.extend({
                form: function(url, data, method) {
                    if (method == null) method = 'POST';
                    if (data == null) data = {};
            
                    var form = $('<form>').attr({
                        method: method,
                        action: url
                     }).css({
                        display: 'none'
                     });
            
                    var addData = function(name, data) {
                        if ($.isArray(data)) {
                            for (var i = 0; i < data.length; i++) {
                                var value = data[i];
                                addData(name + '[]', value);
                            }
                        } else if (typeof data === 'object') {
                            for (var key in data) {
                                if (data.hasOwnProperty(key)) {
                                    addData(name + '[' + key + ']', data[key]);
                                }
                            }
                        } else if (data != null) {
                            form.append($('<input>').attr({
                              type: 'hidden',
                              name: String(name),
                              value: String(data)
                            }));
                        }
                    };
            
                    for (var key in data) {
                        if (data.hasOwnProperty(key)) {
                            addData(key, data[key]);
                        }
                    }
            
                    return form.appendTo('body');
                }
            }); 
        });
        
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

/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
// 
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
// 
// About: Release History
// 
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
// 
// Topic: Note for non-jQuery users
// 
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
// 
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function(window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Since jQuery really isn't required for this plugin, use `jQuery` as the
  // namespace only if it already exists, otherwise use the `Cowboy` namespace,
  // creating it if necessary.
  var $ = window.jQuery || window.Cowboy || ( window.Cowboy = {} ),
    
    // Internal method reference.
    jq_throttle;
  
  // Method: jQuery.throttle
  // 
  // Throttle execution of a function. Especially useful for rate limiting
  // execution of handlers on events like resize and scroll. If you want to
  // rate-limit execution of a function to a single time, see the
  // <jQuery.debounce> method.
  // 
  // In this visualization, | is a throttled-function call and X is the actual
  // callback execution:
  // 
  // > Throttled with `no_trailing` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X    X        X    X    X    X    X    X
  // > 
  // > Throttled with `no_trailing` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X             X    X    X    X    X
  // 
  // Usage:
  // 
  // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', throttled );
  // > jQuery('selector').unbind( 'someevent', throttled );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
  //    true, callback will only execute every `delay` milliseconds while the
  //    throttled-function is being called. If no_trailing is false or
  //    unspecified, callback will be executed one final time after the last
  //    throttled-function call. (After the throttled-function has not been
  //    called for `delay` milliseconds, the internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the throttled-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, throttled, function.
  
  $.throttle = jq_throttle = function( delay, no_trailing, callback, debounce_mode ) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,
      
      // Keep track of the last time `callback` was executed.
      last_exec = 0;
    
    // `no_trailing` defaults to falsy.
    if ( typeof no_trailing !== 'boolean' ) {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }
    
    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;
      
      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply( that, args );
      };
      
      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      };
      
      if ( debounce_mode && !timeout_id ) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }
      
      // Clear any existing timeout.
      timeout_id && clearTimeout( timeout_id );
      
      if ( debounce_mode === undefined && elapsed > delay ) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();
        
      } else if ( no_trailing !== true ) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        // 
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        // 
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
      }
    };
    
    // Set the guid of `wrapper` function to the same of original callback, so
    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
    // callback as a reference.
    if ( $.guid ) {
      wrapper.guid = callback.guid = callback.guid || $.guid++;
    }
    
    // Return the wrapper function.
    return wrapper;
  };
  
  // Method: jQuery.debounce
  // 
  // Debounce execution of a function. Debouncing, unlike throttling,
  // guarantees that a function is only executed a single time, either at the
  // very beginning of a series of calls, or at the very end. If you want to
  // simply rate-limit execution of a function, see the <jQuery.throttle>
  // method.
  // 
  // In this visualization, | is a debounced-function call and X is the actual
  // callback execution:
  // 
  // > Debounced with `at_begin` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // >                          X                                 X
  // > 
  // > Debounced with `at_begin` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X                                 X
  // 
  // Usage:
  // 
  // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', debounced );
  // > jQuery('selector').unbind( 'someevent', debounced );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
  //    unspecified, callback will only be executed `delay` milliseconds after
  //    the last debounced-function call. If at_begin is true, callback will be
  //    executed only at the first debounced-function call. (After the
  //    throttled-function has not been called for `delay` milliseconds, the
  //    internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the debounced-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, debounced, function.
  
  $.debounce = function( delay, at_begin, callback ) {
    return callback === undefined
      ? jq_throttle( delay, at_begin, false )
      : jq_throttle( delay, callback, at_begin !== false );
  };
  
})(this);


var autocomplete,
            change = false,
            title = "",
            characters = {};
        
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
            $.form('/download', { type: "fountain", filename: title, content: $editor.find('textarea').val() }).submit();
        });
        
        if (window.File && window.FileReader && window.FileList && window.Blob) {

        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
        
        $(window).resize(resize);
        resize();
        setInterval(backgroundFunctions, 3000);