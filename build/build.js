
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("whyohwhyamihere-fountain/index.js", function(exports, require, module){
// fountain-js 0.1.10
// http://www.opensource.org/licenses/mit-license.php
// Copyright (c) 2012 Matt Daly

;(function() {
  'use strict';

  var regex = {
    title_page: /^((?:title|credit|author[s]?|source|notes|draft date|date|contact|copyright)\:)/gim,

    scene_heading: /^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+)/i,
    scene_number: /( *#(.+)# *)/,

    transition: /^((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO\:)|^(?:> *)(.+)/,
    
    dialogue: /^([A-Z*_]+[0-9A-Z (._\-')]*)(\^?)?(?:\n(?!\n+))([\s\S]+)/,
    parenthetical: /^(\(.+\))$/,

    action: /^(.+)/g,
    centered: /^(?:> *)(.+)(?: *<)(\n.+)*/g,
        
    section: /^(#+)(?: *)(.*)/,
    synopsis: /^(?:\=(?!\=+) *)(.*)/,

    note: /^(?:\[{2}(?!\[+))(.+)(?:\]{2}(?!\[+))$/,
    note_inline: /(?:\[{2}(?!\[+))([\s\S]+?)(?:\]{2}(?!\[+))/g,
    boneyard: /(^\/\*|^\*\/)$/g,

    page_break: /^\={3,}$/,
    line_break: /^ {2}$/,

    emphasis: /(_|\*{1,3}|_\*{1,3}|\*{1,3}_)(.+)(_|\*{1,3}|_\*{1,3}|\*{1,3}_)/g,
    bold_italic_underline: /(_{1}\*{3}(?=.+\*{3}_{1})|\*{3}_{1}(?=.+_{1}\*{3}))(.+?)(\*{3}_{1}|_{1}\*{3})/g,
    bold_underline: /(_{1}\*{2}(?=.+\*{2}_{1})|\*{2}_{1}(?=.+_{1}\*{2}))(.+?)(\*{2}_{1}|_{1}\*{2})/g,
    italic_underline: /(?:_{1}\*{1}(?=.+\*{1}_{1})|\*{1}_{1}(?=.+_{1}\*{1}))(.+?)(\*{1}_{1}|_{1}\*{1})/g,
    bold_italic: /(\*{3}(?=.+\*{3}))(.+?)(\*{3})/g,
    bold: /(\*{2}(?=.+\*{2}))(.+?)(\*{2})/g,
    italic: /(\*{1}(?=.+\*{1}))(.+?)(\*{1})/g,
    underline: /(_{1}(?=.+_{1}))(.+?)(_{1})/g,

    splitter: /\n{2,}/g,
    cleaner: /^\n+|\n+$/,
    standardizer: /\r\n|\r/g,
    whitespacer: /^\t+|^ {3,}/gm
  };

  var lexer = function (script) {
    return script.replace(regex.boneyard, '\n$1\n')
                 .replace(regex.standardizer, '\n')
                 .replace(regex.cleaner, '')
                 .replace(regex.whitespacer, '');
  };
     
  var tokenize = function (script) {
    var src    = lexer(script).split(regex.splitter)
      , i      = src.length, line, match, parts, text, meta, x, xlen, dual
      , tokens = [];

    while (i--) {
      line = src[i];
      
      // title page
      if (regex.title_page.test(line)) {
        match = line.replace(regex.title_page, '\n$1').split(regex.splitter).reverse();
        for (x = 0, xlen = match.length; x < xlen; x++) {
          parts = match[x].replace(regex.cleaner, '').split(/\:\n*/);
          tokens.push({ type: parts[0].trim().toLowerCase().replace(' ', '_'), text: parts[1].trim() });
        }
        continue;
      }

      // scene headings
      if (match = line.match(regex.scene_heading)) {
        text = match[1] || match[2];

        if (text.indexOf('  ') !== text.length - 2) {
          if (meta = text.match(regex.scene_number)) {
            meta = meta[2];
            text = text.replace(regex.scene_number, '');
          }
          tokens.push({ type: 'scene_heading', text: text, scene_number: meta || undefined });
        }
        continue;
      }

      // centered
      if (match = line.match(regex.centered)) {
        tokens.push({ type: 'centered', text: match[0].replace(/>|</g, '') });
        continue;
      }

      // transitions
      if (match = line.match(regex.transition)) {
        tokens.push({ type: 'transition', text: match[1] || match[2] });
        continue;
      }
    
      // dialogue blocks - characters, parentheticals and dialogue
      if (match = line.match(regex.dialogue)) {
        if (match[1].indexOf('  ') !== match[1].length - 2) {
          // we're iterating from the bottom up, so we need to push these backwards
          if (match[2]) {
            tokens.push({ type: 'dual_dialogue_end' });
          }

          tokens.push({ type: 'dialogue_end' });

          parts = match[3].split(/(\(.+\))(?:\n+)/).reverse();

          for (x = 0, xlen = parts.length; x < xlen; x++) {	
            text = parts[x];

            if (text.length > 0) {
              tokens.push({ type: regex.parenthetical.test(text) ? 'parenthetical' : 'dialogue', text: text });
            }
          }

          tokens.push({ type: 'character', text: match[1].trim() });
          tokens.push({ type: 'dialogue_begin', dual: match[2] ? 'right' : dual ? 'left' : undefined });

          if (dual) {
            tokens.push({ type: 'dual_dialogue_begin' });
          }

          dual = match[2] ? true : false;
          continue;
        }
      }
      
      // section
      if (match = line.match(regex.section)) {
        tokens.push({ type: 'section', text: match[2], depth: match[1].length });
        continue;
      }
      
      // synopsis
      if (match = line.match(regex.synopsis)) {
        tokens.push({ type: 'synopsis', text: match[1] });
        continue;
      }

      // notes
      if (match = line.match(regex.note)) {
        tokens.push({ type: 'note', text: match[1]});
        continue;
      }      

      // boneyard
      if (match = line.match(regex.boneyard)) {
        tokens.push({ type: match[0][0] === '/' ? 'boneyard_begin' : 'boneyard_end' });
        continue;
      }      

      // page breaks
      if (regex.page_break.test(line)) {
        tokens.push({ type: 'page_break' });
        continue;
      }
      
      // line breaks
      if (regex.line_break.test(line)) {
        tokens.push({ type: 'line_break' });
        continue;
      }

      tokens.push({ type: 'action', text: line });
    }

    return tokens;
  };

  var inline = {
    note: '<!-- $1 -->',

    line_break: '<br />',

    bold_italic_underline: '<span class=\"bold italic underline\">$2</span>',
    bold_underline: '<span class=\"bold underline\">$2</span>',
    italic_underline: '<span class=\"italic underline\">$2</span>',
    bold_italic: '<span class=\"bold italic\">$2</span>',
    bold: '<span class=\"bold\">$2</span>',
    italic: '<span class=\"italic\">$2</span>',
    underline: '<span class=\"underline\">$2</span>'
  };

  inline.lexer = function (s) {
    if (!s) {
      return;
    }  

    var styles = [ 'underline', 'italic', 'bold', 'bold_italic', 'italic_underline', 'bold_underline', 'bold_italic_underline' ]
           , i = styles.length, style, match;

    s = s.replace(regex.note_inline, inline.note).replace(/\\\*/g, '[star]').replace(/\\_/g, '[underline]').replace(/\n/g, inline.line_break);

   // if (regex.emphasis.test(s)) {                         // this was causing only every other occurence of an emphasis syntax to be parsed
      while (i--) {
        style = styles[i];
        match = regex[style];
   
        if (match.test(s)) {
          s = s.replace(match, inline[style]);
        }
      }
   // }

    return s.replace(/\[star\]/g, '*').replace(/\[underline\]/g, '_').trim();
  };

  var parse = function (script, toks, callback) {
    if (callback === undefined && typeof toks === 'function') {
      callback = toks;
      toks = undefined;
    }
      
    var tokens = tokenize(script)
      , i      = tokens.length, token
      , title, title_page = [], html = [], output;

    while (i--) {
      token = tokens[i];
      token.text = inline.lexer(token.text);

      switch (token.type) {
        case 'title': title_page.push('<h1>' + token.text + '</h1>'); title = token.text.replace('<br />', ' ').replace(/<(?:.|\n)*?>/g, ''); break;
        case 'credit': title_page.push('<p class=\"credit\">' + token.text + '</p>'); break;
        case 'author': title_page.push('<p class=\"authors\">' + token.text + '</p>'); break;
        case 'authors': title_page.push('<p class=\"authors\">' + token.text + '</p>'); break;
        case 'source': title_page.push('<p class=\"source\">' + token.text + '</p>'); break;
        case 'notes': title_page.push('<p class=\"notes\">' + token.text + '</p>'); break;
        case 'draft_date': title_page.push('<p class=\"draft-date\">' + token.text + '</p>'); break;
        case 'date': title_page.push('<p class=\"date\">' + token.text + '</p>'); break;
        case 'contact': title_page.push('<p class=\"contact\">' + token.text + '</p>'); break;
        case 'copyright': title_page.push('<p class=\"copyright\">' + token.text + '</p>'); break;

        case 'scene_heading': html.push('<h3' + (token.scene_number ? ' id=\"' + token.scene_number + '\">' : '>') + token.text + '</h3>'); break;
        case 'transition': html.push('<h2>' + token.text + '</h2>'); break;

        case 'dual_dialogue_begin': html.push('<div class=\"dual-dialogue\">'); break;
        case 'dialogue_begin': html.push('<div class=\"dialogue' + (token.dual ? ' ' + token.dual : '') + '\">'); break;
        case 'character': html.push('<h4>' + token.text + '</h4>'); break;
        case 'parenthetical': html.push('<p class=\"parenthetical\">' + token.text + '</p>'); break;
        case 'dialogue': html.push('<p>' + token.text + '</p>'); break;
        case 'dialogue_end': html.push('</div> '); break;
        case 'dual_dialogue_end': html.push('</div> '); break;

        case 'section': html.push('<p class=\"section\" data-depth=\"' + token.depth + '\">' + token.text + '</p>'); break;
        case 'synopsis': html.push('<p class=\"synopsis\">' + token.text + '</p>'); break;

        case 'note': html.push('<!-- ' + token.text + '-->'); break;
        case 'boneyard_begin': html.push('<!-- '); break;
        case 'boneyard_end': html.push(' -->'); break;

        case 'action': html.push('<p>' + token.text + '</p>'); break;
        case 'centered': html.push('<p class=\"centered\">' + token.text + '</p>'); break;
        
        case 'page_break': html.push('<hr />'); break;
        case 'line_break': html.push('<br />'); break;
      }
    }

    output = { title: title, html: { title_page: title_page.join(''), script: html.join('') }, tokens: toks ? tokens.reverse() : undefined };

    if (typeof callback === 'function') {
      return callback(output);
    }

    return output;
  };

  var fountain = function (script, callback) {
    return fountain.parse(script, callback);
  };
    
  fountain.parse = function (script, tokens, callback) {
    return parse(script, tokens, callback);
  };

  if (typeof module !== 'undefined') {
    module.exports = fountain;
  } else {
    this.fountain = fountain;
  }  
}).call(this);

});
require.register("yields-isArray/index.js", function(exports, require, module){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

});
require.register("whyohwhyamihere-post/index.js", function(exports, require, module){
var dom = require('dom'),
    isArray = require('isArray');

module.exports = function(url, data, method) {
    if (method == null)
        method = 'POST';
    if (data == null)
        data = {};

    var form = document.createElement('form');
    dom(form)
        .attr('method', method)
        .attr('action', url);
    dom(form).css('display', 'none');

    var addData = function(name, data) {
        if (isArray(data)) {
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
            var input = document.createElement('input');
            dom(input)
              .attr('type', 'hidden')
              .attr('name', String(name))
              .attr('value', String(data));
            dom(form).append(dom(input));
        }
    };

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            addData(key, data[key]);
        }
    }
    
    form.submit();
}
});
require.register("component-debounce/index.js", function(exports, require, module){
/**
 * Debounces a function by the given threshold.
 *
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, threshold, execAsap){
  var timeout;

  return function debounced(){
    var obj = this, args = arguments;

    function delayed () {
      if (!execAsap) {
        func.apply(obj, args);
      }
      timeout = null;
    }

    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(obj, args);
    }

    timeout = setTimeout(delayed, threshold || 100);
  };
};

});
require.register("component-bind/index.js", function(exports, require, module){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("component-type/index.js", function(exports, require, module){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-delegate/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var matches = require('matches-selector')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    if (matches(e.target, selector)) fn(e);
  }, capture);
  return callback;
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-domify/index.js", function(exports, require, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

});
require.register("component-classes/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("component-css/index.js", function(exports, require, module){

/**
 * Properties to ignore appending "px".
 */

var ignore = {
  columnCount: true,
  fillOpacity: true,
  fontWeight: true,
  lineHeight: true,
  opacity: true,
  orphans: true,
  widows: true,
  zIndex: true,
  zoom: true
};

/**
 * Set `el` css values.
 *
 * @param {Element} el
 * @param {Object} obj
 * @return {Element}
 * @api public
 */

module.exports = function(el, obj){
  for (var key in obj) {
    var val = obj[key];
    if ('number' == typeof val && !ignore[key]) val += 'px';
    el.style[key] = val;
  }
  return el;
};

});
require.register("component-sort/index.js", function(exports, require, module){

/**
 * Expose `sort`.
 */

exports = module.exports = sort;

/**
 * Sort `el`'s children with the given `fn(a, b)`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

function sort(el, fn) {
  var arr = [].slice.call(el.children).sort(fn);
  var frag = document.createDocumentFragment();
  for (var i = 0; i < arr.length; i++) {
    frag.appendChild(arr[i]);
  }
  el.appendChild(frag);
};

/**
 * Sort descending.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

exports.desc = function(el, fn){
  sort(el, function(a, b){
    return ~fn(a, b) + 1;
  });
};

/**
 * Sort ascending.
 */

exports.asc = sort;

});
require.register("component-value/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var typeOf = require('type');

/**
 * Set or get `el`'s' value.
 *
 * @param {Element} el
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

module.exports = function(el, val){
  if (2 == arguments.length) return set(el, val);
  return get(el);
};

/**
 * Get `el`'s value.
 */

function get(el) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (el.checked) {
        var attr = el.getAttribute('value');
        return null == attr ? true : attr;
      } else {
        return false;
      }
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        if (radio.checked) return radio.value;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        if (option.selected) return option.value;
      }
      break;
    default:
      return el.value;
  }
}

/**
 * Set `el`'s value.
 */

function set(el, val) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (val) {
        el.checked = true;
      } else {
        el.checked = false;
      }
      break;
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        radio.checked = radio.value === val;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        option.selected = option.value === val;
      }
      break;
    default:
      el.value = val;
  }
}

/**
 * Element type.
 */

function type(el) {
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
  if (group) el = el[0];
  var name = el.nodeName.toLowerCase();
  var type = el.getAttribute('type');

  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
  if ('select' == name) return 'select';
  return name;
}

});
require.register("component-query/index.js", function(exports, require, module){

function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("yields-traverse/index.js", function(exports, require, module){

/**
 * dependencies
 */

var matches = require('matches-selector');

/**
 * Traverse with the given `el`, `selector` and `len`.
 *
 * @param {String} type
 * @param {Element} el
 * @param {String} selector
 * @param {Number} len
 * @return {Array}
 * @api public
 */

module.exports = function(type, el, selector, len){
  var el = el[type]
    , n = len || 1
    , ret = [];

  if (!el) return ret;

  do {
    if (n == ret.length) break;
    if (1 != el.nodeType) continue;
    if (matches(el, selector)) ret.push(el);
    if (!selector) ret.push(el);
  } while (el = el[type]);

  return ret;
}

});
require.register("component-trim/index.js", function(exports, require, module){

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

});
require.register("component-dom/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var matches = require('matches-selector');
var delegate = require('delegate');
var classes = require('classes');
var traverse = require('traverse');
var indexof = require('indexof');
var domify = require('domify');
var events = require('event');
var value = require('value');
var query = require('query');
var type = require('type');
var trim = require('trim');
var css = require('css');

/**
 * Attributes supported.
 */

var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'type',
  'name',
  'href',
  'title',
  'style',
  'width',
  'height',
  'action',
  'method',
  'tabindex',
  'placeholder'
];

/**
 * Expose `dom()`.
 */

exports = module.exports = dom;

/**
 * Expose supported attrs.
 */

exports.attrs = attrs;

/**
 * Return a dom `List` for the given
 * `html`, selector, or element.
 *
 * @param {String|Element|List}
 * @return {List}
 * @api public
 */

function dom(selector, context) {
  // array
  if (Array.isArray(selector)) {
    return new List(selector);
  }

  // List
  if (selector instanceof List) {
    return selector;
  }

  // node
  if (selector.nodeName) {
    return new List([selector]);
  }

  if ('string' != typeof selector) {
    throw new TypeError('invalid selector');
  }

  // html
  var htmlselector = trim.left(selector);
  if ('<' == htmlselector.charAt(0)) {
    return new List([domify(htmlselector)], htmlselector);
  }

  // selector
  var ctx = context
    ? (context.els ? context.els[0] : context)
    : document;

  return new List(query.all(selector, ctx), selector);
}

/**
 * Expose `List` constructor.
 */

exports.List = List;

/**
 * Initialize a new `List` with the
 * given array-ish of `els` and `selector`
 * string.
 *
 * @param {Mixed} els
 * @param {String} selector
 * @api private
 */

function List(els, selector) {
  this.els = els || [];
  this.selector = selector;
}

/**
 * Enumerable iterator.
 */

List.prototype.__iterate__ = function(){
  var self = this;
  return {
    length: function(){ return self.els.length },
    get: function(i){ return new List([self.els[i]]) }
  }
};

/**
 * Remove elements from the DOM.
 *
 * @api public
 */

List.prototype.remove = function(){
  for (var i = 0; i < this.els.length; i++) {
    var el = this.els[i];
    var parent = el.parentNode;
    if (parent) parent.removeChild(el);
  }
};

/**
 * Set attribute `name` to `val`, or get attr `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {String|List} self
 * @api public
 */

List.prototype.attr = function(name, val){
  // get
  if (1 == arguments.length) {
    return this.els[0] && this.els[0].getAttribute(name);
  }

  // remove
  if (null == val) {
    return this.removeAttr(name);
  }

  // set
  return this.forEach(function(el){
    el.setAttribute(name, val);
  });
};

/**
 * Remove attribute `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

List.prototype.removeAttr = function(name){
  return this.forEach(function(el){
    el.removeAttribute(name);
  });
};

/**
 * Set property `name` to `val`, or get property `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {Object|List} self
 * @api public
 */

List.prototype.prop = function(name, val){
  if (1 == arguments.length) {
    return this.els[0] && this.els[0][name];
  }

  return this.forEach(function(el){
    el[name] = val;
  });
};

/**
 * Get the first element's value or set selected
 * element values to `val`.
 *
 * @param {Mixed} [val]
 * @return {Mixed}
 * @api public
 */

List.prototype.val =
List.prototype.value = function(val){
  if (0 == arguments.length) {
    return this.els[0]
      ? value(this.els[0])
      : undefined;
  }

  return this.forEach(function(el){
    value(el, val);
  });
};

/**
 * Return a cloned `List` with all elements cloned.
 *
 * @return {List}
 * @api public
 */

List.prototype.clone = function(){
  var arr = [];
  for (var i = 0, len = this.els.length; i < len; ++i) {
    arr.push(this.els[i].cloneNode(true));
  }
  return new List(arr);
};

/**
 * Prepend `val`.
 *
 * @param {String|Element|List} val
 * @return {List} new list
 * @api public
 */

List.prototype.prepend = function(val){
  var el = this.els[0];
  if (!el) return this;
  val = dom(val);
  for (var i = 0; i < val.els.length; ++i) {
    if (el.children.length) {
      el.insertBefore(val.els[i], el.firstChild);
    } else {
      el.appendChild(val.els[i]);
    }
  }
  return val;
};

/**
 * Append `val`.
 *
 * @param {String|Element|List} val
 * @return {List} new list
 * @api public
 */

List.prototype.append = function(val){
  var el = this.els[0];
  if (!el) return this;
  val = dom(val);
  for (var i = 0; i < val.els.length; ++i) {
    el.appendChild(val.els[i]);
  }
  return val;
};

/**
 * Append self's `el` to `val`
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

List.prototype.appendTo = function(val){
  dom(val).append(this);
  return this;
};

/**
 * Insert self's `els` after `val`
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

List.prototype.insertAfter = function(val){
  val = dom(val).els[0];
  if (!val || !val.parentNode) return this;
  this.forEach(function(el){
    val.parentNode.insertBefore(el, val.nextSibling);
  });
  return this;
};

/**
 * Return a `List` containing the element at `i`.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

List.prototype.at = function(i){
  return new List([this.els[i]], this.selector);
};

/**
 * Return a `List` containing the first element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

List.prototype.first = function(){
  return new List([this.els[0]], this.selector);
};

/**
 * Return a `List` containing the last element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

List.prototype.last = function(){
  return new List([this.els[this.els.length - 1]], this.selector);
};

/**
 * Return an `Element` at `i`.
 *
 * @param {Number} i
 * @return {Element}
 * @api public
 */

List.prototype.get = function(i){
  return this.els[i || 0];
};

/**
 * Return list length.
 *
 * @return {Number}
 * @api public
 */

List.prototype.length = function(){
  return this.els.length;
};

/**
 * Return element text.
 *
 * @param {String} str
 * @return {String|List}
 * @api public
 */

List.prototype.text = function(str){
  // TODO: real impl
  if (1 == arguments.length) {
    this.forEach(function(el){
      el.textContent = str;
    });
    return this;
  }

  var str = '';
  for (var i = 0; i < this.els.length; ++i) {
    str += this.els[i].textContent;
  }
  return str;
};

/**
 * Return element html.
 *
 * @return {String} html
 * @api public
 */

List.prototype.html = function(html){
  if (1 == arguments.length) {
    return this.forEach(function(el){
      el.innerHTML = html;
    });
  }

  // TODO: real impl
  return this.els[0] && this.els[0].innerHTML;
};

/**
 * Bind to `event` and invoke `fn(e)`. When
 * a `selector` is given then events are delegated.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

List.prototype.on = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    for (var i = 0; i < this.els.length; ++i) {
      fn._delegate = delegate.bind(this.els[i], selector, event, fn, capture);
    }
    return this;
  }

  capture = fn;
  fn = selector;

  for (var i = 0; i < this.els.length; ++i) {
    events.bind(this.els[i], event, fn, capture);
  }

  return this;
};

/**
 * Unbind to `event` and invoke `fn(e)`. When
 * a `selector` is given then delegated event
 * handlers are unbound.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

List.prototype.off = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    for (var i = 0; i < this.els.length; ++i) {
      // TODO: add selector support back
      delegate.unbind(this.els[i], event, fn._delegate, capture);
    }
    return this;
  }

  capture = fn;
  fn = selector;

  for (var i = 0; i < this.els.length; ++i) {
    events.unbind(this.els[i], event, fn, capture);
  }
  return this;
};

/**
 * Iterate elements and invoke `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

List.prototype.each = function(fn){
  for (var i = 0; i < this.els.length; ++i) {
    fn(new List([this.els[i]], this.selector), i);
  }
  return this;
};

/**
 * Iterate elements and invoke `fn(el, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

List.prototype.forEach = function(fn){
  for (var i = 0; i < this.els.length; ++i) {
    fn(this.els[i], i);
  }
  return this;
};

/**
 * Map elements invoking `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

List.prototype.map = function(fn){
  var arr = [];
  for (var i = 0; i < this.els.length; ++i) {
    arr.push(fn(new List([this.els[i]], this.selector), i));
  }
  return arr;
};

/**
 * Filter elements invoking `fn(list, i)`, returning
 * a new `List` of elements when a truthy value is returned.
 *
 * @param {Function} fn
 * @return {List}
 * @api public
 */

List.prototype.select =
List.prototype.filter = function(fn){
  var el;
  var list = new List([], this.selector);
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    if (fn(new List([el], this.selector), i)) list.els.push(el);
  }
  return list;
};

/**
 * Filter elements invoking `fn(list, i)`, returning
 * a new `List` of elements when a falsey value is returned.
 *
 * @param {Function} fn
 * @return {List}
 * @api public
 */

List.prototype.reject = function(fn){
  var el;
  var list = new List([], this.selector);
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    if (!fn(new List([el], this.selector), i)) list.els.push(el);
  }
  return list;
};

/**
 * Add the given class `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

List.prototype.addClass = function(name){
  var el;
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    el._classes.add(name);
  }
  return this;
};

/**
 * Remove the given class `name`.
 *
 * @param {String|RegExp} name
 * @return {List} self
 * @api public
 */

List.prototype.removeClass = function(name){
  var el;

  if ('regexp' == type(name)) {
    for (var i = 0; i < this.els.length; ++i) {
      el = this.els[i];
      el._classes = el._classes || classes(el);
      var arr = el._classes.array();
      for (var j = 0; j < arr.length; j++) {
        if (name.test(arr[j])) {
          el._classes.remove(arr[j]);
        }
      }
    }
    return this;
  }

  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    el._classes.remove(name);
  }

  return this;
};

/**
 * Toggle the given class `name`,
 * optionally a `bool` may be given
 * to indicate that the class should
 * be added when truthy.
 *
 * @param {String} name
 * @param {Boolean} bool
 * @return {List} self
 * @api public
 */

List.prototype.toggleClass = function(name, bool){
  var el;
  var fn = 'toggle';

  // toggle with boolean
  if (2 == arguments.length) {
    fn = bool ? 'add' : 'remove';
  }

  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    el._classes[fn](name);
  }

  return this;
};

/**
 * Check if the given class `name` is present.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

List.prototype.hasClass = function(name){
  var el;
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    if (el._classes.has(name)) return true;
  }
  return false;
};

/**
 * Set CSS `prop` to `val` or get `prop` value.
 * Also accepts an object (`prop`: `val`)
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {List|String}
 * @api public
 */

List.prototype.css = function(prop, val){
  if (2 == arguments.length) {
    var obj = {};
    obj[prop] = val;
    return this.setStyle(obj);
  }

  if ('object' == type(prop)) {
    return this.setStyle(prop);
  }

  return this.getStyle(prop);
};

/**
 * Set CSS `props`.
 *
 * @param {Object} props
 * @return {List} self
 * @api private
 */

List.prototype.setStyle = function(props){
  for (var i = 0; i < this.els.length; ++i) {
    css(this.els[i], props);
  }
  return this;
};

/**
 * Get CSS `prop` value.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

List.prototype.getStyle = function(prop){
  var el = this.els[0];
  if (el) return el.style[prop];
};

/**
 * Find children matching the given `selector`.
 *
 * @param {String} selector
 * @return {List}
 * @api public
 */

List.prototype.find = function(selector){
  return dom(selector, this);
};

/**
 * Empty the dom list
 *
 * @return self
 * @api public
 */

List.prototype.empty = function(){
  var elem, el;

  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  return this;
}

/**
 * Check if the first element matches `selector`.
 *
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

List.prototype.is = function(selector){
  return matches(this.get(0), selector);
};

/**
 * Get parent(s) with optional `selector` and `limit`
 *
 * @param {String} selector
 * @param {Number} limit
 * @return {List}
 * @api public
 */

List.prototype.parent = function(selector, limit){
  return new List(traverse('parentNode',
    this.get(0),
    selector,
    limit
    || 1));
};

/**
 * Get next element(s) with optional `selector` and `limit`.
 *
 * @param {String} selector
 * @param {Number} limit
 * @retrun {List}
 * @api public
 */

List.prototype.next = function(selector, limit){
  return new List(traverse('nextSibling',
    this.get(0),
    selector,
    limit
    || 1));
};

/**
 * Get previous element(s) with optional `selector` and `limit`.
 *
 * @param {String} selector
 * @param {Number} limit
 * @return {List}
 * @api public
 */

List.prototype.prev =
List.prototype.previous = function(selector, limit){
  return new List(traverse('previousSibling',
    this.get(0),
    selector,
    limit
    || 1));
};

/**
 * Attribute accessors.
 */

attrs.forEach(function(name){
  List.prototype[name] = function(val){
    if (0 == arguments.length) return this.attr(name);
    return this.attr(name, val);
  };
});


});
require.register("component-os/index.js", function(exports, require, module){


module.exports = os();

function os() {
  var ua = navigator.userAgent;
  if (/mac/i.test(ua)) return 'mac';
  if (/win/i.test(ua)) return 'windows';
  if (/linux/i.test(ua)) return 'linux';
}

});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("RedVentures-reduce/index.js", function(exports, require, module){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
});
require.register("visionmedia-superagent/lib/client.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key)
      + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.parseBody(this.text);
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var path = req.path;

  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.path = path;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

});
require.register("screenwriter/components/index.js", function(exports, require, module){
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
});




















require.alias("whyohwhyamihere-fountain/index.js", "screenwriter/deps/fountain/index.js");
require.alias("whyohwhyamihere-fountain/index.js", "fountain/index.js");

require.alias("whyohwhyamihere-post/index.js", "screenwriter/deps/post/index.js");
require.alias("whyohwhyamihere-post/index.js", "screenwriter/deps/post/index.js");
require.alias("whyohwhyamihere-post/index.js", "post/index.js");
require.alias("component-dom/index.js", "whyohwhyamihere-post/deps/dom/index.js");
require.alias("component-type/index.js", "component-dom/deps/type/index.js");

require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "component-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");

require.alias("component-sort/index.js", "component-dom/deps/sort/index.js");

require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("component-trim/index.js", "component-dom/deps/trim/index.js");

require.alias("yields-isArray/index.js", "whyohwhyamihere-post/deps/isArray/index.js");

require.alias("whyohwhyamihere-post/index.js", "whyohwhyamihere-post/index.js");
require.alias("component-debounce/index.js", "screenwriter/deps/debounce/index.js");
require.alias("component-debounce/index.js", "screenwriter/deps/debounce/index.js");
require.alias("component-debounce/index.js", "debounce/index.js");
require.alias("component-debounce/index.js", "component-debounce/index.js");
require.alias("component-bind/index.js", "screenwriter/deps/bind/index.js");
require.alias("component-bind/index.js", "bind/index.js");

require.alias("component-dom/index.js", "screenwriter/deps/dom/index.js");
require.alias("component-dom/index.js", "dom/index.js");
require.alias("component-type/index.js", "component-dom/deps/type/index.js");

require.alias("component-event/index.js", "component-dom/deps/event/index.js");

require.alias("component-delegate/index.js", "component-dom/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-indexof/index.js", "component-dom/deps/indexof/index.js");

require.alias("component-domify/index.js", "component-dom/deps/domify/index.js");

require.alias("component-classes/index.js", "component-dom/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-dom/deps/css/index.js");

require.alias("component-sort/index.js", "component-dom/deps/sort/index.js");

require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-value/index.js", "component-dom/deps/value/index.js");
require.alias("component-type/index.js", "component-value/deps/type/index.js");

require.alias("component-value/index.js", "component-value/index.js");
require.alias("component-query/index.js", "component-dom/deps/query/index.js");

require.alias("component-matches-selector/index.js", "component-dom/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "component-dom/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("component-trim/index.js", "component-dom/deps/trim/index.js");

require.alias("component-os/index.js", "screenwriter/deps/os/index.js");
require.alias("component-os/index.js", "os/index.js");

require.alias("visionmedia-superagent/lib/client.js", "screenwriter/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "screenwriter/deps/superagent/index.js");
require.alias("visionmedia-superagent/lib/client.js", "superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");