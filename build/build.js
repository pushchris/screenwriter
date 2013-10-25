
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
require.register("whyohwhyamihere-fountain/index.js", Function("exports, require, module",
"// fountain-js 0.1.10\n\
// http://www.opensource.org/licenses/mit-license.php\n\
// Copyright (c) 2012 Matt Daly\n\
\n\
;(function() {\n\
  'use strict';\n\
\n\
  var regex = {\n\
    title_page: /^((?:title|credit|author[s]?|source|notes|draft date|date|contact|copyright)\\:)/gim,\n\
\n\
    scene_heading: /^((?:\\*{0,3}_?)?(?:(?:int|ext|est|i\\/e)[. ]).+)|^(?:\\.(?!\\.+))(.+)/i,\n\
    scene_number: /( *#(.+)# *)/,\n\
\n\
    transition: /^((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\\.|.+ TO\\:)|^(?:> *)(.+)/,\n\
    \n\
    dialogue: /^([A-Z*_]+[0-9A-Z (._\\-')]*)(\\^?)?(?:\\n\
(?!\\n\
+))([\\s\\S]+)/,\n\
    parenthetical: /^(\\(.+\\))$/,\n\
\n\
    action: /^(.+)/g,\n\
    centered: /^(?:> *)(.+)(?: *<)(\\n\
.+)*/g,\n\
        \n\
    section: /^(#+)(?: *)(.*)/,\n\
    synopsis: /^(?:\\=(?!\\=+) *)(.*)/,\n\
\n\
    note: /^(?:\\[{2}(?!\\[+))(.+)(?:\\]{2}(?!\\[+))$/,\n\
    note_inline: /(?:\\[{2}(?!\\[+))([\\s\\S]+?)(?:\\]{2}(?!\\[+))/g,\n\
    boneyard: /(^\\/\\*|^\\*\\/)$/g,\n\
\n\
    page_break: /^\\={3,}$/,\n\
    line_break: /^ {2}$/,\n\
\n\
    emphasis: /(_|\\*{1,3}|_\\*{1,3}|\\*{1,3}_)(.+)(_|\\*{1,3}|_\\*{1,3}|\\*{1,3}_)/g,\n\
    bold_italic_underline: /(_{1}\\*{3}(?=.+\\*{3}_{1})|\\*{3}_{1}(?=.+_{1}\\*{3}))(.+?)(\\*{3}_{1}|_{1}\\*{3})/g,\n\
    bold_underline: /(_{1}\\*{2}(?=.+\\*{2}_{1})|\\*{2}_{1}(?=.+_{1}\\*{2}))(.+?)(\\*{2}_{1}|_{1}\\*{2})/g,\n\
    italic_underline: /(?:_{1}\\*{1}(?=.+\\*{1}_{1})|\\*{1}_{1}(?=.+_{1}\\*{1}))(.+?)(\\*{1}_{1}|_{1}\\*{1})/g,\n\
    bold_italic: /(\\*{3}(?=.+\\*{3}))(.+?)(\\*{3})/g,\n\
    bold: /(\\*{2}(?=.+\\*{2}))(.+?)(\\*{2})/g,\n\
    italic: /(\\*{1}(?=.+\\*{1}))(.+?)(\\*{1})/g,\n\
    underline: /(_{1}(?=.+_{1}))(.+?)(_{1})/g,\n\
\n\
    splitter: /\\n\
{2,}/g,\n\
    cleaner: /^\\n\
+|\\n\
+$/,\n\
    standardizer: /\\r\\n\
|\\r/g,\n\
    whitespacer: /^\\t+|^ {3,}/gm\n\
  };\n\
\n\
  var lexer = function (script) {\n\
    return script.replace(regex.boneyard, '\\n\
$1\\n\
')\n\
                 .replace(regex.standardizer, '\\n\
')\n\
                 .replace(regex.cleaner, '')\n\
                 .replace(regex.whitespacer, '');\n\
  };\n\
     \n\
  var tokenize = function (script) {\n\
    var src    = lexer(script).split(regex.splitter)\n\
      , i      = src.length, line, match, parts, text, meta, x, xlen, dual\n\
      , tokens = [];\n\
\n\
    while (i--) {\n\
      line = src[i];\n\
      \n\
      // title page\n\
      if (regex.title_page.test(line)) {\n\
        match = line.replace(regex.title_page, '\\n\
$1').split(regex.splitter).reverse();\n\
        for (x = 0, xlen = match.length; x < xlen; x++) {\n\
          parts = match[x].replace(regex.cleaner, '').split(/\\:\\n\
*/);\n\
          tokens.push({ type: parts[0].trim().toLowerCase().replace(' ', '_'), text: parts[1].trim() });\n\
        }\n\
        continue;\n\
      }\n\
\n\
      // scene headings\n\
      if (match = line.match(regex.scene_heading)) {\n\
        text = match[1] || match[2];\n\
\n\
        if (text.indexOf('  ') !== text.length - 2) {\n\
          if (meta = text.match(regex.scene_number)) {\n\
            meta = meta[2];\n\
            text = text.replace(regex.scene_number, '');\n\
          }\n\
          tokens.push({ type: 'scene_heading', text: text, scene_number: meta || undefined });\n\
        }\n\
        continue;\n\
      }\n\
\n\
      // centered\n\
      if (match = line.match(regex.centered)) {\n\
        tokens.push({ type: 'centered', text: match[0].replace(/>|</g, '') });\n\
        continue;\n\
      }\n\
\n\
      // transitions\n\
      if (match = line.match(regex.transition)) {\n\
        tokens.push({ type: 'transition', text: match[1] || match[2] });\n\
        continue;\n\
      }\n\
    \n\
      // dialogue blocks - characters, parentheticals and dialogue\n\
      if (match = line.match(regex.dialogue)) {\n\
        if (match[1].indexOf('  ') !== match[1].length - 2) {\n\
          // we're iterating from the bottom up, so we need to push these backwards\n\
          if (match[2]) {\n\
            tokens.push({ type: 'dual_dialogue_end' });\n\
          }\n\
\n\
          tokens.push({ type: 'dialogue_end' });\n\
\n\
          parts = match[3].split(/(\\(.+\\))(?:\\n\
+)/).reverse();\n\
\n\
          for (x = 0, xlen = parts.length; x < xlen; x++) {\t\n\
            text = parts[x];\n\
\n\
            if (text.length > 0) {\n\
              tokens.push({ type: regex.parenthetical.test(text) ? 'parenthetical' : 'dialogue', text: text });\n\
            }\n\
          }\n\
\n\
          tokens.push({ type: 'character', text: match[1].trim() });\n\
          tokens.push({ type: 'dialogue_begin', dual: match[2] ? 'right' : dual ? 'left' : undefined });\n\
\n\
          if (dual) {\n\
            tokens.push({ type: 'dual_dialogue_begin' });\n\
          }\n\
\n\
          dual = match[2] ? true : false;\n\
          continue;\n\
        }\n\
      }\n\
      \n\
      // section\n\
      if (match = line.match(regex.section)) {\n\
        tokens.push({ type: 'section', text: match[2], depth: match[1].length });\n\
        continue;\n\
      }\n\
      \n\
      // synopsis\n\
      if (match = line.match(regex.synopsis)) {\n\
        tokens.push({ type: 'synopsis', text: match[1] });\n\
        continue;\n\
      }\n\
\n\
      // notes\n\
      if (match = line.match(regex.note)) {\n\
        tokens.push({ type: 'note', text: match[1]});\n\
        continue;\n\
      }      \n\
\n\
      // boneyard\n\
      if (match = line.match(regex.boneyard)) {\n\
        tokens.push({ type: match[0][0] === '/' ? 'boneyard_begin' : 'boneyard_end' });\n\
        continue;\n\
      }      \n\
\n\
      // page breaks\n\
      if (regex.page_break.test(line)) {\n\
        tokens.push({ type: 'page_break' });\n\
        continue;\n\
      }\n\
      \n\
      // line breaks\n\
      if (regex.line_break.test(line)) {\n\
        tokens.push({ type: 'line_break' });\n\
        continue;\n\
      }\n\
\n\
      tokens.push({ type: 'action', text: line });\n\
    }\n\
\n\
    return tokens;\n\
  };\n\
\n\
  var inline = {\n\
    note: '<!-- $1 -->',\n\
\n\
    line_break: '<br />',\n\
\n\
    bold_italic_underline: '<span class=\\\"bold italic underline\\\">$2</span>',\n\
    bold_underline: '<span class=\\\"bold underline\\\">$2</span>',\n\
    italic_underline: '<span class=\\\"italic underline\\\">$2</span>',\n\
    bold_italic: '<span class=\\\"bold italic\\\">$2</span>',\n\
    bold: '<span class=\\\"bold\\\">$2</span>',\n\
    italic: '<span class=\\\"italic\\\">$2</span>',\n\
    underline: '<span class=\\\"underline\\\">$2</span>'\n\
  };\n\
\n\
  inline.lexer = function (s) {\n\
    if (!s) {\n\
      return;\n\
    }  \n\
\n\
    var styles = [ 'underline', 'italic', 'bold', 'bold_italic', 'italic_underline', 'bold_underline', 'bold_italic_underline' ]\n\
           , i = styles.length, style, match;\n\
\n\
    s = s.replace(regex.note_inline, inline.note).replace(/\\\\\\*/g, '[star]').replace(/\\\\_/g, '[underline]').replace(/\\n\
/g, inline.line_break);\n\
\n\
   // if (regex.emphasis.test(s)) {                         // this was causing only every other occurence of an emphasis syntax to be parsed\n\
      while (i--) {\n\
        style = styles[i];\n\
        match = regex[style];\n\
   \n\
        if (match.test(s)) {\n\
          s = s.replace(match, inline[style]);\n\
        }\n\
      }\n\
   // }\n\
\n\
    return s.replace(/\\[star\\]/g, '*').replace(/\\[underline\\]/g, '_').trim();\n\
  };\n\
\n\
  var parse = function (script, toks, callback) {\n\
    if (callback === undefined && typeof toks === 'function') {\n\
      callback = toks;\n\
      toks = undefined;\n\
    }\n\
      \n\
    var tokens = tokenize(script)\n\
      , i      = tokens.length, token\n\
      , title, title_page = [], html = [], output;\n\
\n\
    while (i--) {\n\
      token = tokens[i];\n\
      token.text = inline.lexer(token.text);\n\
\n\
      switch (token.type) {\n\
        case 'title': title_page.push('<h1>' + token.text + '</h1>'); title = token.text.replace('<br />', ' ').replace(/<(?:.|\\n\
)*?>/g, ''); break;\n\
        case 'credit': title_page.push('<p class=\\\"credit\\\">' + token.text + '</p>'); break;\n\
        case 'author': title_page.push('<p class=\\\"authors\\\">' + token.text + '</p>'); break;\n\
        case 'authors': title_page.push('<p class=\\\"authors\\\">' + token.text + '</p>'); break;\n\
        case 'source': title_page.push('<p class=\\\"source\\\">' + token.text + '</p>'); break;\n\
        case 'notes': title_page.push('<p class=\\\"notes\\\">' + token.text + '</p>'); break;\n\
        case 'draft_date': title_page.push('<p class=\\\"draft-date\\\">' + token.text + '</p>'); break;\n\
        case 'date': title_page.push('<p class=\\\"date\\\">' + token.text + '</p>'); break;\n\
        case 'contact': title_page.push('<p class=\\\"contact\\\">' + token.text + '</p>'); break;\n\
        case 'copyright': title_page.push('<p class=\\\"copyright\\\">' + token.text + '</p>'); break;\n\
\n\
        case 'scene_heading': html.push('<h3' + (token.scene_number ? ' id=\\\"' + token.scene_number + '\\\">' : '>') + token.text + '</h3>'); break;\n\
        case 'transition': html.push('<h2>' + token.text + '</h2>'); break;\n\
\n\
        case 'dual_dialogue_begin': html.push('<div class=\\\"dual-dialogue\\\">'); break;\n\
        case 'dialogue_begin': html.push('<div class=\\\"dialogue' + (token.dual ? ' ' + token.dual : '') + '\\\">'); break;\n\
        case 'character': html.push('<h4>' + token.text + '</h4>'); break;\n\
        case 'parenthetical': html.push('<p class=\\\"parenthetical\\\">' + token.text + '</p>'); break;\n\
        case 'dialogue': html.push('<p>' + token.text + '</p>'); break;\n\
        case 'dialogue_end': html.push('</div> '); break;\n\
        case 'dual_dialogue_end': html.push('</div> '); break;\n\
\n\
        case 'section': html.push('<p class=\\\"section\\\" data-depth=\\\"' + token.depth + '\\\">' + token.text + '</p>'); break;\n\
        case 'synopsis': html.push('<p class=\\\"synopsis\\\">' + token.text + '</p>'); break;\n\
\n\
        case 'note': html.push('<!-- ' + token.text + '-->'); break;\n\
        case 'boneyard_begin': html.push('<!-- '); break;\n\
        case 'boneyard_end': html.push(' -->'); break;\n\
\n\
        case 'action': html.push('<p>' + token.text + '</p>'); break;\n\
        case 'centered': html.push('<p class=\\\"centered\\\">' + token.text + '</p>'); break;\n\
        \n\
        case 'page_break': html.push('<hr />'); break;\n\
        case 'line_break': html.push('<br />'); break;\n\
      }\n\
    }\n\
\n\
    output = { title: title, html: { title_page: title_page.join(''), script: html.join('') }, tokens: toks ? tokens.reverse() : undefined };\n\
\n\
    if (typeof callback === 'function') {\n\
      return callback(output);\n\
    }\n\
\n\
    return output;\n\
  };\n\
\n\
  var fountain = function (script, callback) {\n\
    return fountain.parse(script, callback);\n\
  };\n\
    \n\
  fountain.parse = function (script, tokens, callback) {\n\
    return parse(script, tokens, callback);\n\
  };\n\
\n\
  if (typeof module !== 'undefined') {\n\
    module.exports = fountain;\n\
  } else {\n\
    this.fountain = fountain;\n\
  }  \n\
}).call(this);\n\
//@ sourceURL=whyohwhyamihere-fountain/index.js"
));
require.register("yields-isArray/index.js", Function("exports, require, module",
"\n\
/**\n\
 * isArray\n\
 */\n\
\n\
var isArray = Array.isArray;\n\
\n\
/**\n\
 * toString\n\
 */\n\
\n\
var str = Object.prototype.toString;\n\
\n\
/**\n\
 * Whether or not the given `val`\n\
 * is an array.\n\
 *\n\
 * example:\n\
 *\n\
 *        isArray([]);\n\
 *        // > true\n\
 *        isArray(arguments);\n\
 *        // > false\n\
 *        isArray('');\n\
 *        // > false\n\
 *\n\
 * @param {mixed} val\n\
 * @return {bool}\n\
 */\n\
\n\
module.exports = isArray || function (val) {\n\
  return !! val && '[object Array]' == str.call(val);\n\
};\n\
//@ sourceURL=yields-isArray/index.js"
));
require.register("whyohwhyamihere-post/index.js", Function("exports, require, module",
"var dom = require('dom'),\n\
    isArray = require('isArray');\n\
\n\
module.exports = function(url, data, method) {\n\
    if (method == null)\n\
        method = 'POST';\n\
    if (data == null)\n\
        data = {};\n\
\n\
    var form = document.createElement('form');\n\
    dom(form)\n\
        .attr('method', method)\n\
        .attr('action', url);\n\
    dom(form).css('display', 'none');\n\
\n\
    var addData = function(name, data) {\n\
        if (isArray(data)) {\n\
            for (var i = 0; i < data.length; i++) {\n\
                var value = data[i];\n\
                addData(name + '[]', value);\n\
            }\n\
        } else if (typeof data === 'object') {\n\
            for (var key in data) {\n\
                if (data.hasOwnProperty(key)) {\n\
                    addData(name + '[' + key + ']', data[key]);\n\
                }\n\
            }\n\
        } else if (data != null) {\n\
            var input = document.createElement('input');\n\
            dom(input)\n\
              .attr('type', 'hidden')\n\
              .attr('name', String(name))\n\
              .attr('value', String(data));\n\
            dom(form).append(dom(input));\n\
        }\n\
    };\n\
\n\
    for (var key in data) {\n\
        if (data.hasOwnProperty(key)) {\n\
            addData(key, data[key]);\n\
        }\n\
    }\n\
    \n\
    form.submit();\n\
}//@ sourceURL=whyohwhyamihere-post/index.js"
));
require.register("whyohwhyamihere-textarea-height/index.js", Function("exports, require, module",
"module.exports = function(el, setHeight, callback) {\n\
    setHeight = setHeight || false;\n\
    function getHeight() {\n\
        var oldHeight = el.style.height;\n\
        el.style.height = \"\";\n\
        var height = el.scrollHeight;\n\
        if(setHeight)\n\
            el.style.height = height + \"px\";\n\
        else\n\
            el.style.height = oldHeight + \"px\";\n\
        return height;\n\
    }\n\
    if(callback) {\n\
        el.addEventListener('input', function(){\n\
            callback(getHeight());\n\
        }, false); \n\
    } else {\n\
        return getHeight();\n\
    }   \n\
}//@ sourceURL=whyohwhyamihere-textarea-height/index.js"
));
require.register("whyohwhyamihere-is-mobile/index.js", Function("exports, require, module",
"module.exports = function() {\n\
    var check = false;\n\
    (function(a){if(/(android|bb\\d+|meego).+mobile|avantgo|bada\\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\\-(n|u)|c55\\/|capi|ccwa|cdm\\-|cell|chtm|cldc|cmd\\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\\-s|devi|dica|dmob|do(c|p)o|ds(12|\\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\\-|_)|g1 u|g560|gene|gf\\-5|g\\-mo|go(\\.w|od)|gr(ad|un)|haie|hcit|hd\\-(m|p|t)|hei\\-|hi(pt|ta)|hp( i|ip)|hs\\-c|ht(c(\\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\\-(20|go|ma)|i230|iac( |\\-|\\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\\/)|klon|kpt |kwc\\-|kyo(c|k)|le(no|xi)|lg( g|\\/(k|l|u)|50|54|\\-[a-w])|libw|lynx|m1\\-w|m3ga|m50\\/|ma(te|ui|xo)|mc(01|21|ca)|m\\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\\-2|po(ck|rt|se)|prox|psio|pt\\-g|qa\\-a|qc(07|12|21|32|60|\\-[2-7]|i\\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\\-|oo|p\\-)|sdk\\/|se(c(\\-|0|1)|47|mc|nd|ri)|sgh\\-|shar|sie(\\-|m)|sk\\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\\-|v\\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\\-|tdg\\-|tel(i|m)|tim\\-|t\\-mo|to(pl|sh)|ts(70|m\\-|m3|m5)|tx\\-9|up(\\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\\-|your|zeto|zte\\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);\n\
    return check; \n\
}//@ sourceURL=whyohwhyamihere-is-mobile/index.js"
));
require.register("component-debounce/index.js", Function("exports, require, module",
"/**\n\
 * Debounces a function by the given threshold.\n\
 *\n\
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/\n\
 * @param {Function} function to wrap\n\
 * @param {Number} timeout in ms (`100`)\n\
 * @param {Boolean} whether to execute at the beginning (`false`)\n\
 * @api public\n\
 */\n\
\n\
module.exports = function debounce(func, threshold, execAsap){\n\
  var timeout;\n\
\n\
  return function debounced(){\n\
    var obj = this, args = arguments;\n\
\n\
    function delayed () {\n\
      if (!execAsap) {\n\
        func.apply(obj, args);\n\
      }\n\
      timeout = null;\n\
    }\n\
\n\
    if (timeout) {\n\
      clearTimeout(timeout);\n\
    } else if (execAsap) {\n\
      func.apply(obj, args);\n\
    }\n\
\n\
    timeout = setTimeout(delayed, threshold || 100);\n\
  };\n\
};\n\
//@ sourceURL=component-debounce/index.js"
));
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("component-bind/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Slice reference.\n\
 */\n\
\n\
var slice = [].slice;\n\
\n\
/**\n\
 * Bind `obj` to `fn`.\n\
 *\n\
 * @param {Object} obj\n\
 * @param {Function|String} fn or string\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj, fn){\n\
  if ('string' == typeof fn) fn = obj[fn];\n\
  if ('function' != typeof fn) throw new Error('bind() requires a function');\n\
  var args = [].slice.call(arguments, 2);\n\
  return function(){\n\
    return fn.apply(obj, args.concat(slice.call(arguments)));\n\
  }\n\
};\n\
//@ sourceURL=component-bind/index.js"
));
require.register("component-type/index.js", Function("exports, require, module",
"\n\
/**\n\
 * toString ref.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val){\n\
  switch (toString.call(val)) {\n\
    case '[object Function]': return 'function';\n\
    case '[object Date]': return 'date';\n\
    case '[object RegExp]': return 'regexp';\n\
    case '[object Arguments]': return 'arguments';\n\
    case '[object Array]': return 'array';\n\
    case '[object String]': return 'string';\n\
  }\n\
\n\
  if (val === null) return 'null';\n\
  if (val === undefined) return 'undefined';\n\
  if (val && val.nodeType === 1) return 'element';\n\
  if (val === Object(val)) return 'object';\n\
\n\
  return typeof val;\n\
};\n\
//@ sourceURL=component-type/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var matches = require('matches-selector')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    if (matches(e.target, selector)) fn(e);\n\
  }, capture);\n\
  return callback;\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
//@ sourceURL=component-delegate/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"\n\
var indexOf = [].indexOf;\n\
\n\
module.exports = function(arr, obj){\n\
  if (indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  option: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  thead: [1, '<table>', '</table>'],\n\
  tbody: [1, '<table>', '</table>'],\n\
  tfoot: [1, '<table>', '</table>'],\n\
  colgroup: [1, '<table>', '</table>'],\n\
  caption: [1, '<table>', '</table>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
\n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) throw new Error('No elements were generated.');\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  var els = el.children;\n\
  if (1 == els.length) {\n\
    return el.removeChild(els[0]);\n\
  }\n\
\n\
  var fragment = document.createDocumentFragment();\n\
  while (els.length) {\n\
    fragment.appendChild(el.removeChild(els[0]));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.toggle(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (this.has(name)) {\n\
    this.remove(name);\n\
  } else {\n\
    this.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("component-css/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Properties to ignore appending \"px\".\n\
 */\n\
\n\
var ignore = {\n\
  columnCount: true,\n\
  fillOpacity: true,\n\
  fontWeight: true,\n\
  lineHeight: true,\n\
  opacity: true,\n\
  orphans: true,\n\
  widows: true,\n\
  zIndex: true,\n\
  zoom: true\n\
};\n\
\n\
/**\n\
 * Set `el` css values.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Object} obj\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, obj){\n\
  for (var key in obj) {\n\
    var val = obj[key];\n\
    if ('number' == typeof val && !ignore[key]) val += 'px';\n\
    el.style[key] = val;\n\
  }\n\
  return el;\n\
};\n\
//@ sourceURL=component-css/index.js"
));
require.register("component-sort/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `sort`.\n\
 */\n\
\n\
exports = module.exports = sort;\n\
\n\
/**\n\
 * Sort `el`'s children with the given `fn(a, b)`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
function sort(el, fn) {\n\
  var arr = [].slice.call(el.children).sort(fn);\n\
  var frag = document.createDocumentFragment();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    frag.appendChild(arr[i]);\n\
  }\n\
  el.appendChild(frag);\n\
};\n\
\n\
/**\n\
 * Sort descending.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
exports.desc = function(el, fn){\n\
  sort(el, function(a, b){\n\
    return ~fn(a, b) + 1;\n\
  });\n\
};\n\
\n\
/**\n\
 * Sort ascending.\n\
 */\n\
\n\
exports.asc = sort;\n\
//@ sourceURL=component-sort/index.js"
));
require.register("component-value/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var typeOf = require('type');\n\
\n\
/**\n\
 * Set or get `el`'s' value.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Mixed} val\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el, val){\n\
  if (2 == arguments.length) return set(el, val);\n\
  return get(el);\n\
};\n\
\n\
/**\n\
 * Get `el`'s value.\n\
 */\n\
\n\
function get(el) {\n\
  switch (type(el)) {\n\
    case 'checkbox':\n\
    case 'radio':\n\
      if (el.checked) {\n\
        var attr = el.getAttribute('value');\n\
        return null == attr ? true : attr;\n\
      } else {\n\
        return false;\n\
      }\n\
    case 'radiogroup':\n\
      for (var i = 0, radio; radio = el[i]; i++) {\n\
        if (radio.checked) return radio.value;\n\
      }\n\
      break;\n\
    case 'select':\n\
      for (var i = 0, option; option = el.options[i]; i++) {\n\
        if (option.selected) return option.value;\n\
      }\n\
      break;\n\
    default:\n\
      return el.value;\n\
  }\n\
}\n\
\n\
/**\n\
 * Set `el`'s value.\n\
 */\n\
\n\
function set(el, val) {\n\
  switch (type(el)) {\n\
    case 'checkbox':\n\
    case 'radio':\n\
      if (val) {\n\
        el.checked = true;\n\
      } else {\n\
        el.checked = false;\n\
      }\n\
      break;\n\
    case 'radiogroup':\n\
      for (var i = 0, radio; radio = el[i]; i++) {\n\
        radio.checked = radio.value === val;\n\
      }\n\
      break;\n\
    case 'select':\n\
      for (var i = 0, option; option = el.options[i]; i++) {\n\
        option.selected = option.value === val;\n\
      }\n\
      break;\n\
    default:\n\
      el.value = val;\n\
  }\n\
}\n\
\n\
/**\n\
 * Element type.\n\
 */\n\
\n\
function type(el) {\n\
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);\n\
  if (group) el = el[0];\n\
  var name = el.nodeName.toLowerCase();\n\
  var type = el.getAttribute('type');\n\
\n\
  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';\n\
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';\n\
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';\n\
  if ('select' == name) return 'select';\n\
  return name;\n\
}\n\
//@ sourceURL=component-value/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"\n\
function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('query');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matches\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
//@ sourceURL=component-matches-selector/index.js"
));
require.register("yields-traverse/index.js", Function("exports, require, module",
"\n\
/**\n\
 * dependencies\n\
 */\n\
\n\
var matches = require('matches-selector');\n\
\n\
/**\n\
 * Traverse with the given `el`, `selector` and `len`.\n\
 *\n\
 * @param {String} type\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {Number} len\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(type, el, selector, len){\n\
  var el = el[type]\n\
    , n = len || 1\n\
    , ret = [];\n\
\n\
  if (!el) return ret;\n\
\n\
  do {\n\
    if (n == ret.length) break;\n\
    if (1 != el.nodeType) continue;\n\
    if (matches(el, selector)) ret.push(el);\n\
    if (!selector) ret.push(el);\n\
  } while (el = el[type]);\n\
\n\
  return ret;\n\
}\n\
//@ sourceURL=yields-traverse/index.js"
));
require.register("component-trim/index.js", Function("exports, require, module",
"\n\
exports = module.exports = trim;\n\
\n\
function trim(str){\n\
  if (str.trim) return str.trim();\n\
  return str.replace(/^\\s*|\\s*$/g, '');\n\
}\n\
\n\
exports.left = function(str){\n\
  if (str.trimLeft) return str.trimLeft();\n\
  return str.replace(/^\\s*/, '');\n\
};\n\
\n\
exports.right = function(str){\n\
  if (str.trimRight) return str.trimRight();\n\
  return str.replace(/\\s*$/, '');\n\
};\n\
//@ sourceURL=component-trim/index.js"
));
require.register("component-dom/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var matches = require('matches-selector');\n\
var delegate = require('delegate');\n\
var classes = require('classes');\n\
var traverse = require('traverse');\n\
var indexof = require('indexof');\n\
var domify = require('domify');\n\
var events = require('event');\n\
var value = require('value');\n\
var query = require('query');\n\
var type = require('type');\n\
var trim = require('trim');\n\
var css = require('css');\n\
\n\
/**\n\
 * Attributes supported.\n\
 */\n\
\n\
var attrs = [\n\
  'id',\n\
  'src',\n\
  'rel',\n\
  'cols',\n\
  'rows',\n\
  'type',\n\
  'name',\n\
  'href',\n\
  'title',\n\
  'style',\n\
  'width',\n\
  'height',\n\
  'action',\n\
  'method',\n\
  'tabindex',\n\
  'placeholder'\n\
];\n\
\n\
/**\n\
 * Expose `dom()`.\n\
 */\n\
\n\
exports = module.exports = dom;\n\
\n\
/**\n\
 * Expose supported attrs.\n\
 */\n\
\n\
exports.attrs = attrs;\n\
\n\
/**\n\
 * Return a dom `List` for the given\n\
 * `html`, selector, or element.\n\
 *\n\
 * @param {String|Element|List}\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
function dom(selector, context) {\n\
  // array\n\
  if (Array.isArray(selector)) {\n\
    return new List(selector);\n\
  }\n\
\n\
  // List\n\
  if (selector instanceof List) {\n\
    return selector;\n\
  }\n\
\n\
  // node\n\
  if (selector.nodeName) {\n\
    return new List([selector]);\n\
  }\n\
\n\
  if ('string' != typeof selector) {\n\
    throw new TypeError('invalid selector');\n\
  }\n\
\n\
  // html\n\
  var htmlselector = trim.left(selector);\n\
  if ('<' == htmlselector.charAt(0)) {\n\
    return new List([domify(htmlselector)], htmlselector);\n\
  }\n\
\n\
  // selector\n\
  var ctx = context\n\
    ? (context.els ? context.els[0] : context)\n\
    : document;\n\
\n\
  return new List(query.all(selector, ctx), selector);\n\
}\n\
\n\
/**\n\
 * Expose `List` constructor.\n\
 */\n\
\n\
exports.List = List;\n\
\n\
/**\n\
 * Initialize a new `List` with the\n\
 * given array-ish of `els` and `selector`\n\
 * string.\n\
 *\n\
 * @param {Mixed} els\n\
 * @param {String} selector\n\
 * @api private\n\
 */\n\
\n\
function List(els, selector) {\n\
  this.els = els || [];\n\
  this.selector = selector;\n\
}\n\
\n\
/**\n\
 * Enumerable iterator.\n\
 */\n\
\n\
List.prototype.__iterate__ = function(){\n\
  var self = this;\n\
  return {\n\
    length: function(){ return self.els.length },\n\
    get: function(i){ return new List([self.els[i]]) }\n\
  }\n\
};\n\
\n\
/**\n\
 * Remove elements from the DOM.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
List.prototype.remove = function(){\n\
  for (var i = 0; i < this.els.length; i++) {\n\
    var el = this.els[i];\n\
    var parent = el.parentNode;\n\
    if (parent) parent.removeChild(el);\n\
  }\n\
};\n\
\n\
/**\n\
 * Set attribute `name` to `val`, or get attr `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} [val]\n\
 * @return {String|List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.attr = function(name, val){\n\
  // get\n\
  if (1 == arguments.length) {\n\
    return this.els[0] && this.els[0].getAttribute(name);\n\
  }\n\
\n\
  // remove\n\
  if (null == val) {\n\
    return this.removeAttr(name);\n\
  }\n\
\n\
  // set\n\
  return this.forEach(function(el){\n\
    el.setAttribute(name, val);\n\
  });\n\
};\n\
\n\
/**\n\
 * Remove attribute `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.removeAttr = function(name){\n\
  return this.forEach(function(el){\n\
    el.removeAttribute(name);\n\
  });\n\
};\n\
\n\
/**\n\
 * Set property `name` to `val`, or get property `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} [val]\n\
 * @return {Object|List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prop = function(name, val){\n\
  if (1 == arguments.length) {\n\
    return this.els[0] && this.els[0][name];\n\
  }\n\
\n\
  return this.forEach(function(el){\n\
    el[name] = val;\n\
  });\n\
};\n\
\n\
/**\n\
 * Get the first element's value or set selected\n\
 * element values to `val`.\n\
 *\n\
 * @param {Mixed} [val]\n\
 * @return {Mixed}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.val =\n\
List.prototype.value = function(val){\n\
  if (0 == arguments.length) {\n\
    return this.els[0]\n\
      ? value(this.els[0])\n\
      : undefined;\n\
  }\n\
\n\
  return this.forEach(function(el){\n\
    value(el, val);\n\
  });\n\
};\n\
\n\
/**\n\
 * Return a cloned `List` with all elements cloned.\n\
 *\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.clone = function(){\n\
  var arr = [];\n\
  for (var i = 0, len = this.els.length; i < len; ++i) {\n\
    arr.push(this.els[i].cloneNode(true));\n\
  }\n\
  return new List(arr);\n\
};\n\
\n\
/**\n\
 * Prepend `val`.\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} new list\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prepend = function(val){\n\
  var el = this.els[0];\n\
  if (!el) return this;\n\
  val = dom(val);\n\
  for (var i = 0; i < val.els.length; ++i) {\n\
    if (el.children.length) {\n\
      el.insertBefore(val.els[i], el.firstChild);\n\
    } else {\n\
      el.appendChild(val.els[i]);\n\
    }\n\
  }\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Append `val`.\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} new list\n\
 * @api public\n\
 */\n\
\n\
List.prototype.append = function(val){\n\
  var el = this.els[0];\n\
  if (!el) return this;\n\
  val = dom(val);\n\
  for (var i = 0; i < val.els.length; ++i) {\n\
    el.appendChild(val.els[i]);\n\
  }\n\
  return val;\n\
};\n\
\n\
/**\n\
 * Append self's `el` to `val`\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.appendTo = function(val){\n\
  dom(val).append(this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Insert self's `els` after `val`\n\
 *\n\
 * @param {String|Element|List} val\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.insertAfter = function(val){\n\
  val = dom(val).els[0];\n\
  if (!val || !val.parentNode) return this;\n\
  this.forEach(function(el){\n\
    val.parentNode.insertBefore(el, val.nextSibling);\n\
  });\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the element at `i`.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.at = function(i){\n\
  return new List([this.els[i]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the first element.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.first = function(){\n\
  return new List([this.els[0]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return a `List` containing the last element.\n\
 *\n\
 * @param {Number} i\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.last = function(){\n\
  return new List([this.els[this.els.length - 1]], this.selector);\n\
};\n\
\n\
/**\n\
 * Return an `Element` at `i`.\n\
 *\n\
 * @param {Number} i\n\
 * @return {Element}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.get = function(i){\n\
  return this.els[i || 0];\n\
};\n\
\n\
/**\n\
 * Return list length.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.length = function(){\n\
  return this.els.length;\n\
};\n\
\n\
/**\n\
 * Return element text.\n\
 *\n\
 * @param {String} str\n\
 * @return {String|List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.text = function(str){\n\
  // TODO: real impl\n\
  if (1 == arguments.length) {\n\
    this.forEach(function(el){\n\
      el.textContent = str;\n\
    });\n\
    return this;\n\
  }\n\
\n\
  var str = '';\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    str += this.els[i].textContent;\n\
  }\n\
  return str;\n\
};\n\
\n\
/**\n\
 * Return element html.\n\
 *\n\
 * @return {String} html\n\
 * @api public\n\
 */\n\
\n\
List.prototype.html = function(html){\n\
  if (1 == arguments.length) {\n\
    return this.forEach(function(el){\n\
      el.innerHTML = html;\n\
    });\n\
  }\n\
\n\
  // TODO: real impl\n\
  return this.els[0] && this.els[0].innerHTML;\n\
};\n\
\n\
/**\n\
 * Bind to `event` and invoke `fn(e)`. When\n\
 * a `selector` is given then events are delegated.\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [selector]\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.on = function(event, selector, fn, capture){\n\
  if ('string' == typeof selector) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      fn._delegate = delegate.bind(this.els[i], selector, event, fn, capture);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  capture = fn;\n\
  fn = selector;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    events.bind(this.els[i], event, fn, capture);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unbind to `event` and invoke `fn(e)`. When\n\
 * a `selector` is given then delegated event\n\
 * handlers are unbound.\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [selector]\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.off = function(event, selector, fn, capture){\n\
  if ('string' == typeof selector) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      // TODO: add selector support back\n\
      delegate.unbind(this.els[i], event, fn._delegate, capture);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  capture = fn;\n\
  fn = selector;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    events.unbind(this.els[i], event, fn, capture);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Iterate elements and invoke `fn(list, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.each = function(fn){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    fn(new List([this.els[i]], this.selector), i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Iterate elements and invoke `fn(el, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.forEach = function(fn){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    fn(this.els[i], i);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Map elements invoking `fn(list, i)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.map = function(fn){\n\
  var arr = [];\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    arr.push(fn(new List([this.els[i]], this.selector), i));\n\
  }\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Filter elements invoking `fn(list, i)`, returning\n\
 * a new `List` of elements when a truthy value is returned.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.select =\n\
List.prototype.filter = function(fn){\n\
  var el;\n\
  var list = new List([], this.selector);\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    if (fn(new List([el], this.selector), i)) list.els.push(el);\n\
  }\n\
  return list;\n\
};\n\
\n\
/**\n\
 * Filter elements invoking `fn(list, i)`, returning\n\
 * a new `List` of elements when a falsey value is returned.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.reject = function(fn){\n\
  var el;\n\
  var list = new List([], this.selector);\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    if (!fn(new List([el], this.selector), i)) list.els.push(el);\n\
  }\n\
  return list;\n\
};\n\
\n\
/**\n\
 * Add the given class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.addClass = function(name){\n\
  var el;\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes.add(name);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given class `name`.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.removeClass = function(name){\n\
  var el;\n\
\n\
  if ('regexp' == type(name)) {\n\
    for (var i = 0; i < this.els.length; ++i) {\n\
      el = this.els[i];\n\
      el._classes = el._classes || classes(el);\n\
      var arr = el._classes.array();\n\
      for (var j = 0; j < arr.length; j++) {\n\
        if (name.test(arr[j])) {\n\
          el._classes.remove(arr[j]);\n\
        }\n\
      }\n\
    }\n\
    return this;\n\
  }\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes.remove(name);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle the given class `name`,\n\
 * optionally a `bool` may be given\n\
 * to indicate that the class should\n\
 * be added when truthy.\n\
 *\n\
 * @param {String} name\n\
 * @param {Boolean} bool\n\
 * @return {List} self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.toggleClass = function(name, bool){\n\
  var el;\n\
  var fn = 'toggle';\n\
\n\
  // toggle with boolean\n\
  if (2 == arguments.length) {\n\
    fn = bool ? 'add' : 'remove';\n\
  }\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    el._classes[fn](name);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check if the given class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.hasClass = function(name){\n\
  var el;\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    el._classes = el._classes || classes(el);\n\
    if (el._classes.has(name)) return true;\n\
  }\n\
  return false;\n\
};\n\
\n\
/**\n\
 * Set CSS `prop` to `val` or get `prop` value.\n\
 * Also accepts an object (`prop`: `val`)\n\
 *\n\
 * @param {String} prop\n\
 * @param {Mixed} val\n\
 * @return {List|String}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.css = function(prop, val){\n\
  if (2 == arguments.length) {\n\
    var obj = {};\n\
    obj[prop] = val;\n\
    return this.setStyle(obj);\n\
  }\n\
\n\
  if ('object' == type(prop)) {\n\
    return this.setStyle(prop);\n\
  }\n\
\n\
  return this.getStyle(prop);\n\
};\n\
\n\
/**\n\
 * Set CSS `props`.\n\
 *\n\
 * @param {Object} props\n\
 * @return {List} self\n\
 * @api private\n\
 */\n\
\n\
List.prototype.setStyle = function(props){\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    css(this.els[i], props);\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get CSS `prop` value.\n\
 *\n\
 * @param {String} prop\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
List.prototype.getStyle = function(prop){\n\
  var el = this.els[0];\n\
  if (el) return el.style[prop];\n\
};\n\
\n\
/**\n\
 * Find children matching the given `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.find = function(selector){\n\
  return dom(selector, this);\n\
};\n\
\n\
/**\n\
 * Empty the dom list\n\
 *\n\
 * @return self\n\
 * @api public\n\
 */\n\
\n\
List.prototype.empty = function(){\n\
  var elem, el;\n\
\n\
  for (var i = 0; i < this.els.length; ++i) {\n\
    el = this.els[i];\n\
    while (el.firstChild) {\n\
      el.removeChild(el.firstChild);\n\
    }\n\
  }\n\
\n\
  return this;\n\
}\n\
\n\
/**\n\
 * Check if the first element matches `selector`.\n\
 *\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.is = function(selector){\n\
  return matches(this.get(0), selector);\n\
};\n\
\n\
/**\n\
 * Get parent(s) with optional `selector` and `limit`\n\
 *\n\
 * @param {String} selector\n\
 * @param {Number} limit\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.parent = function(selector, limit){\n\
  return new List(traverse('parentNode',\n\
    this.get(0),\n\
    selector,\n\
    limit\n\
    || 1));\n\
};\n\
\n\
/**\n\
 * Get next element(s) with optional `selector` and `limit`.\n\
 *\n\
 * @param {String} selector\n\
 * @param {Number} limit\n\
 * @retrun {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.next = function(selector, limit){\n\
  return new List(traverse('nextSibling',\n\
    this.get(0),\n\
    selector,\n\
    limit\n\
    || 1));\n\
};\n\
\n\
/**\n\
 * Get previous element(s) with optional `selector` and `limit`.\n\
 *\n\
 * @param {String} selector\n\
 * @param {Number} limit\n\
 * @return {List}\n\
 * @api public\n\
 */\n\
\n\
List.prototype.prev =\n\
List.prototype.previous = function(selector, limit){\n\
  return new List(traverse('previousSibling',\n\
    this.get(0),\n\
    selector,\n\
    limit\n\
    || 1));\n\
};\n\
\n\
/**\n\
 * Attribute accessors.\n\
 */\n\
\n\
attrs.forEach(function(name){\n\
  List.prototype[name] = function(val){\n\
    if (0 == arguments.length) return this.attr(name);\n\
    return this.attr(name, val);\n\
  };\n\
});\n\
\n\
//@ sourceURL=component-dom/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  fn._off = on;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var i = index(callbacks, fn._off || fn);\n\
  if (~i) callbacks.splice(i, 1);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("component-event-manager/index.js", Function("exports, require, module",
"\n\
\n\
/**\n\
 * Expose `EventManager`.\n\
 */\n\
\n\
module.exports = EventManager;\n\
\n\
/**\n\
 * Initialize an `EventManager` with the given\n\
 * `target` object which events will be bound to,\n\
 * and the `obj` which will receive method calls.\n\
 *\n\
 * @param {Object} target\n\
 * @param {Object} obj\n\
 * @api public\n\
 */\n\
\n\
function EventManager(target, obj) {\n\
  this.target = target;\n\
  this.obj = obj;\n\
  this._bindings = {};\n\
}\n\
\n\
/**\n\
 * Register bind function.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {EventManager} self\n\
 * @api public\n\
 */\n\
\n\
EventManager.prototype.onbind = function(fn){\n\
  this._bind = fn;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Register unbind function.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {EventManager} self\n\
 * @api public\n\
 */\n\
\n\
EventManager.prototype.onunbind = function(fn){\n\
  this._unbind = fn;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Bind to `event` with optional `method` name.\n\
 * When `method` is undefined it becomes `event`\n\
 * with the \"on\" prefix.\n\
 *\n\
 *    events.bind('login') // implies \"onlogin\"\n\
 *    events.bind('login', 'onLogin')\n\
 *\n\
 * @param {String} event\n\
 * @param {String} [method]\n\
 * @return {EventManager}\n\
 * @api public\n\
 */\n\
\n\
EventManager.prototype.bind = function(event, method){\n\
  var obj = this.obj;\n\
  var method = method || 'on' + event;\n\
  var args = [].slice.call(arguments, 2);\n\
\n\
  // callback\n\
  function callback() {\n\
    var a = [].slice.call(arguments).concat(args);\n\
    obj[method].apply(obj, a);\n\
  }\n\
\n\
  // subscription\n\
  this._bindings[event] = this._bindings[event] || {};\n\
  this._bindings[event][method] = callback;\n\
\n\
  // bind\n\
  this._bind(event, callback);\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Unbind a single binding, all bindings for `event`,\n\
 * or all bindings within the manager.\n\
 *\n\
 *     evennts.unbind('login', 'onLogin')\n\
 *     evennts.unbind('login')\n\
 *     evennts.unbind()\n\
 *\n\
 * @param {String} [event]\n\
 * @param {String} [method]\n\
 * @api public\n\
 */\n\
\n\
EventManager.prototype.unbind = function(event, method){\n\
  if (0 == arguments.length) return this.unbindAll();\n\
  if (1 == arguments.length) return this.unbindAllOf(event);\n\
  var fn = this._bindings[event][method];\n\
  this._unbind(event, fn);\n\
};\n\
\n\
/**\n\
 * Unbind all events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
EventManager.prototype.unbindAll = function(){\n\
  for (var event in this._bindings) {\n\
    this.unbindAllOf(event);\n\
  }\n\
};\n\
\n\
/**\n\
 * Unbind all events for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @api private\n\
 */\n\
\n\
EventManager.prototype.unbindAllOf = function(event){\n\
  var bindings = this._bindings[event];\n\
  if (!bindings) return;\n\
  for (var method in bindings) {\n\
    this.unbind(event, method);\n\
  }\n\
};\n\
//@ sourceURL=component-event-manager/index.js"
));
require.register("component-events/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Manager = require('event-manager')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Return a new event manager.\n\
 */\n\
\n\
module.exports = function(target, obj){\n\
  var manager = new Manager(target, obj);\n\
\n\
  manager.onbind(function(name, fn){\n\
    event.bind(target, name, fn);\n\
  });\n\
\n\
  manager.onunbind(function(name, fn){\n\
    event.unbind(target, name, fn);\n\
  });\n\
\n\
  return manager;\n\
};\n\
//@ sourceURL=component-events/index.js"
));
require.register("enyo-domready/index.js", Function("exports, require, module",
"/*!\n\
 * Copyright (c) 2012 Matias Meno <m@tias.me>\n\
 * \n\
 * Original code (c) by Dustin Diaz 2012 - License MIT\n\
 */\n\
\n\
\n\
/**\n\
 * Expose `domready`.\n\
 */\n\
\n\
module.exports = domready;\n\
\n\
\n\
/**\n\
 *\n\
 * Cross browser implementation of the domready event\n\
 *\n\
 * @param {Function} ready - the callback to be invoked as soon as the dom is fully loaded.\n\
 * @api public\n\
 */\n\
\n\
function domready(ready) {\n\
 var fns = [], fn, f = false\n\
    , doc = document\n\
    , testEl = doc.documentElement\n\
    , hack = testEl.doScroll\n\
    , domContentLoaded = 'DOMContentLoaded'\n\
    , addEventListener = 'addEventListener'\n\
    , onreadystatechange = 'onreadystatechange'\n\
    , readyState = 'readyState'\n\
    , loaded = /^loade|c/.test(doc[readyState])\n\
\n\
  function flush(f) {\n\
    loaded = 1\n\
    while (f = fns.shift()) f()\n\
  }\n\
\n\
  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {\n\
    doc.removeEventListener(domContentLoaded, fn, f)\n\
    flush()\n\
  }, f)\n\
\n\
\n\
  hack && doc.attachEvent(onreadystatechange, fn = function () {\n\
    if (/^c/.test(doc[readyState])) {\n\
      doc.detachEvent(onreadystatechange, fn)\n\
      flush()\n\
    }\n\
  })\n\
\n\
  return (ready = hack ?\n\
    function (fn) {\n\
      self != top ?\n\
        loaded ? fn() : fns.push(fn) :\n\
        function () {\n\
          try {\n\
            testEl.doScroll('left')\n\
          } catch (e) {\n\
            return setTimeout(function() { ready(fn) }, 50)\n\
          }\n\
          fn()\n\
        }()\n\
    } :\n\
    function (fn) {\n\
      loaded ? fn() : fns.push(fn)\n\
    })\n\
}//@ sourceURL=enyo-domready/index.js"
));
require.register("component-inherit/index.js", Function("exports, require, module",
"\n\
module.exports = function(a, b){\n\
  var fn = function(){};\n\
  fn.prototype = b.prototype;\n\
  a.prototype = new fn;\n\
  a.prototype.constructor = a;\n\
};//@ sourceURL=component-inherit/index.js"
));
require.register("timoxley-assert/index.js", Function("exports, require, module",
"// http://wiki.commonjs.org/wiki/Unit_Testing/1.0\n\
//\n\
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!\n\
//\n\
// Originally from narwhal.js (http://narwhaljs.org)\n\
// Copyright (c) 2009 Thomas Robinson <280north.com>\n\
//\n\
// Permission is hereby granted, free of charge, to any person obtaining a copy\n\
// of this software and associated documentation files (the 'Software'), to\n\
// deal in the Software without restriction, including without limitation the\n\
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or\n\
// sell copies of the Software, and to permit persons to whom the Software is\n\
// furnished to do so, subject to the following conditions:\n\
//\n\
// The above copyright notice and this permission notice shall be included in\n\
// all copies or substantial portions of the Software.\n\
//\n\
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n\
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n\
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n\
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN\n\
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION\n\
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.\n\
\n\
\n\
// Adapted for browser components by Tim Oxley\n\
// from https://github.com/joyent/node/blob/72bc4dcda4cfa99ed064419e40d104bd1b2e0e25/lib/assert.js\n\
\n\
// UTILITY\n\
var inherit = require('inherit');\n\
var pSlice = Array.prototype.slice;\n\
\n\
// 1. The assert module provides functions that throw\n\
// AssertionError's when particular conditions are not met. The\n\
// assert module must conform to the following interface.\n\
\n\
var assert = module.exports = ok;\n\
\n\
// 2. The AssertionError is defined in assert.\n\
// new assert.AssertionError({ message: message,\n\
//                             actual: actual,\n\
//                             expected: expected })\n\
\n\
assert.AssertionError = function AssertionError(options) {\n\
  this.name = 'AssertionError';\n\
  this.message = options.message;\n\
  this.actual = options.actual;\n\
  this.expected = options.expected;\n\
  this.operator = options.operator;\n\
  var stackStartFunction = options.stackStartFunction || fail;\n\
\n\
  if (Error.captureStackTrace) {\n\
    Error.captureStackTrace(this, stackStartFunction);\n\
  }\n\
};\n\
\n\
// assert.AssertionError instanceof Error\n\
inherit(assert.AssertionError, Error);\n\
\n\
function replacer(key, value) {\n\
  if (value === undefined) {\n\
    return '' + value;\n\
  }\n\
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {\n\
    return value.toString();\n\
  }\n\
  if (typeof value === 'function' || value instanceof RegExp) {\n\
    return value.toString();\n\
  }\n\
  return value;\n\
}\n\
\n\
function truncate(s, n) {\n\
  if (typeof s == 'string') {\n\
    return s.length < n ? s : s.slice(0, n);\n\
  } else {\n\
    return s;\n\
  }\n\
}\n\
\n\
assert.AssertionError.prototype.toString = function() {\n\
  if (this.message) {\n\
    return [this.name + ':', this.message].join(' ');\n\
  } else {\n\
    return [\n\
      this.name + ':',\n\
      truncate(JSON.stringify(this.actual, replacer), 128),\n\
      this.operator,\n\
      truncate(JSON.stringify(this.expected, replacer), 128)\n\
    ].join(' ');\n\
  }\n\
};\n\
\n\
// At present only the three keys mentioned above are used and\n\
// understood by the spec. Implementations or sub modules can pass\n\
// other keys to the AssertionError's constructor - they will be\n\
// ignored.\n\
\n\
// 3. All of the following functions must throw an AssertionError\n\
// when a corresponding condition is not met, with a message that\n\
// may be undefined if not provided.  All assertion methods provide\n\
// both the actual and expected values to the assertion error for\n\
// display purposes.\n\
\n\
function fail(actual, expected, message, operator, stackStartFunction) {\n\
  throw new assert.AssertionError({\n\
    message: message,\n\
    actual: actual,\n\
    expected: expected,\n\
    operator: operator,\n\
    stackStartFunction: stackStartFunction\n\
  });\n\
}\n\
\n\
// EXTENSION! allows for well behaved errors defined elsewhere.\n\
assert.fail = fail;\n\
\n\
// 4. Pure assertion tests whether a value is truthy, as determined\n\
// by !!guard.\n\
// assert.ok(guard, message_opt);\n\
// This statement is equivalent to assert.equal(true, !!guard,\n\
// message_opt);. To test strictly for the value true, use\n\
// assert.strictEqual(true, guard, message_opt);.\n\
\n\
function ok(value, message) {\n\
  if (!!!value) fail(value, true, message, '==', assert.ok);\n\
}\n\
assert.ok = ok;\n\
\n\
// 5. The equality assertion tests shallow, coercive equality with\n\
// ==.\n\
// assert.equal(actual, expected, message_opt);\n\
\n\
assert.equal = function equal(actual, expected, message) {\n\
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);\n\
};\n\
\n\
// 6. The non-equality assertion tests for whether two objects are not equal\n\
// with != assert.notEqual(actual, expected, message_opt);\n\
\n\
assert.notEqual = function notEqual(actual, expected, message) {\n\
  if (actual == expected) {\n\
    fail(actual, expected, message, '!=', assert.notEqual);\n\
  }\n\
};\n\
\n\
// 7. The equivalence assertion tests a deep equality relation.\n\
// assert.deepEqual(actual, expected, message_opt);\n\
\n\
assert.deepEqual = function deepEqual(actual, expected, message) {\n\
  if (!_deepEqual(actual, expected)) {\n\
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);\n\
  }\n\
};\n\
\n\
function _deepEqual(actual, expected) {\n\
  // 7.1. All identical values are equivalent, as determined by ===.\n\
  if (actual === expected) {\n\
    return true;\n\
\n\
  // 7.2. If the expected value is a Date object, the actual value is\n\
  // equivalent if it is also a Date object that refers to the same time.\n\
  } else if (actual instanceof Date && expected instanceof Date) {\n\
    return actual.getTime() === expected.getTime();\n\
\n\
  // 7.3 If the expected value is a RegExp object, the actual value is\n\
  // equivalent if it is also a RegExp object with the same source and\n\
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).\n\
  } else if (actual instanceof RegExp && expected instanceof RegExp) {\n\
    return actual.source === expected.source &&\n\
           actual.global === expected.global &&\n\
           actual.multiline === expected.multiline &&\n\
           actual.lastIndex === expected.lastIndex &&\n\
           actual.ignoreCase === expected.ignoreCase;\n\
\n\
  // 7.4. Other pairs that do not both pass typeof value == 'object',\n\
  // equivalence is determined by ==.\n\
  } else if (typeof actual != 'object' && typeof expected != 'object') {\n\
    return actual == expected;\n\
\n\
  // 7.5 For all other Object pairs, including Array objects, equivalence is\n\
  // determined by having the same number of owned properties (as verified\n\
  // with Object.prototype.hasOwnProperty.call), the same set of keys\n\
  // (although not necessarily the same order), equivalent values for every\n\
  // corresponding key, and an identical 'prototype' property. Note: this\n\
  // accounts for both named and indexed properties on Arrays.\n\
  } else {\n\
    return objEquiv(actual, expected);\n\
  }\n\
}\n\
\n\
function isUndefinedOrNull(value) {\n\
  return value === null || value === undefined;\n\
}\n\
\n\
function isArguments(object) {\n\
  return Object.prototype.toString.call(object) == '[object Arguments]';\n\
}\n\
\n\
function objEquiv(a, b) {\n\
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))\n\
    return false;\n\
  // an identical 'prototype' property.\n\
  if (a.prototype !== b.prototype) return false;\n\
  //~~~I've managed to break Object.keys through screwy arguments passing.\n\
  //   Converting to array solves the problem.\n\
  if (isArguments(a)) {\n\
    if (!isArguments(b)) {\n\
      return false;\n\
    }\n\
    a = pSlice.call(a);\n\
    b = pSlice.call(b);\n\
    return _deepEqual(a, b);\n\
  }\n\
  try {\n\
    var ka = Object.keys(a),\n\
        kb = Object.keys(b),\n\
        key, i;\n\
  } catch (e) {//happens when one is a string literal and the other isn't\n\
    return false;\n\
  }\n\
  // having the same number of owned properties (keys incorporates\n\
  // hasOwnProperty)\n\
  if (ka.length != kb.length)\n\
    return false;\n\
  //the same set of keys (although not necessarily the same order),\n\
  ka.sort();\n\
  kb.sort();\n\
  //~~~cheap key test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    if (ka[i] != kb[i])\n\
      return false;\n\
  }\n\
  //equivalent values for every corresponding key, and\n\
  //~~~possibly expensive deep test\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    key = ka[i];\n\
    if (!_deepEqual(a[key], b[key])) return false;\n\
  }\n\
  return true;\n\
}\n\
\n\
// 8. The non-equivalence assertion tests for any deep inequality.\n\
// assert.notDeepEqual(actual, expected, message_opt);\n\
\n\
assert.notDeepEqual = function notDeepEqual(actual, expected, message) {\n\
  if (_deepEqual(actual, expected)) {\n\
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);\n\
  }\n\
};\n\
\n\
// 9. The strict equality assertion tests strict equality, as determined by ===.\n\
// assert.strictEqual(actual, expected, message_opt);\n\
\n\
assert.strictEqual = function strictEqual(actual, expected, message) {\n\
  if (actual !== expected) {\n\
    fail(actual, expected, message, '===', assert.strictEqual);\n\
  }\n\
};\n\
\n\
// 10. The strict non-equality assertion tests for strict inequality, as\n\
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);\n\
\n\
assert.notStrictEqual = function notStrictEqual(actual, expected, message) {\n\
  if (actual === expected) {\n\
    fail(actual, expected, message, '!==', assert.notStrictEqual);\n\
  }\n\
};\n\
\n\
function expectedException(actual, expected) {\n\
  if (!actual || !expected) {\n\
    return false;\n\
  }\n\
\n\
  if (expected instanceof RegExp) {\n\
    return expected.test(actual);\n\
  } else if (actual instanceof expected) {\n\
    return true;\n\
  } else if (expected.call({}, actual) === true) {\n\
    return true;\n\
  }\n\
\n\
  return false;\n\
}\n\
\n\
function _throws(shouldThrow, block, expected, message) {\n\
  var actual;\n\
\n\
  if (typeof expected === 'string') {\n\
    message = expected;\n\
    expected = null;\n\
  }\n\
\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    actual = e;\n\
  }\n\
\n\
  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +\n\
            (message ? ' ' + message : '.');\n\
\n\
  if (shouldThrow && !actual) {\n\
    fail(actual, expected, 'Missing expected exception' + message);\n\
  }\n\
\n\
  if (!shouldThrow && expectedException(actual, expected)) {\n\
    fail(actual, expected, 'Got unwanted exception' + message);\n\
  }\n\
\n\
  if ((shouldThrow && actual && expected &&\n\
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {\n\
    throw actual;\n\
  }\n\
}\n\
\n\
// 11. Expected to throw an error:\n\
// assert.throws(block, Error_opt, message_opt);\n\
\n\
assert.throws = function(block, /*optional*/error, /*optional*/message) {\n\
  _throws.apply(this, [true].concat(pSlice.call(arguments)));\n\
};\n\
\n\
// EXTENSION! This is annoying to write outside this module.\n\
assert.doesNotThrow = function(block, /*optional*/message) {\n\
  _throws.apply(this, [false].concat(pSlice.call(arguments)));\n\
};\n\
\n\
assert.ifError = function(err) { if (err) {throw err;}};\n\
//@ sourceURL=timoxley-assert/index.js"
));
require.register("timoxley-dom-support/index.js", Function("exports, require, module",
"var domready = require('domready')()\n\
\n\
module.exports = (function() {\n\
\n\
\tvar support,\n\
\t\tall,\n\
\t\ta,\n\
\t\tselect,\n\
\t\topt,\n\
\t\tinput,\n\
\t\tfragment,\n\
\t\teventName,\n\
\t\ti,\n\
\t\tisSupported,\n\
\t\tclickFn,\n\
\t\tdiv = document.createElement(\"div\");\n\
\n\
\t// Setup\n\
\tdiv.setAttribute( \"className\", \"t\" );\n\
\tdiv.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\
\n\
\t// Support tests won't run in some limited or non-browser environments\n\
\tall = div.getElementsByTagName(\"*\");\n\
\ta = div.getElementsByTagName(\"a\")[ 0 ];\n\
\tif ( !all || !a || !all.length ) {\n\
\t\treturn {};\n\
\t}\n\
\n\
\t// First batch of tests\n\
\tselect = document.createElement(\"select\");\n\
\topt = select.appendChild( document.createElement(\"option\") );\n\
\tinput = div.getElementsByTagName(\"input\")[ 0 ];\n\
\n\
\ta.style.cssText = \"top:1px;float:left;opacity:.5\";\n\
\tsupport = {\n\
\t\t// IE strips leading whitespace when .innerHTML is used\n\
\t\tleadingWhitespace: ( div.firstChild.nodeType === 3 ),\n\
\n\
\t\t// Make sure that tbody elements aren't automatically inserted\n\
\t\t// IE will insert them into empty tables\n\
\t\ttbody: !div.getElementsByTagName(\"tbody\").length,\n\
\n\
\t\t// Make sure that link elements get serialized correctly by innerHTML\n\
\t\t// This requires a wrapper element in IE\n\
\t\thtmlSerialize: !!div.getElementsByTagName(\"link\").length,\n\
\n\
\t\t// Get the style information from getAttribute\n\
\t\t// (IE uses .cssText instead)\n\
\t\tstyle: /top/.test( a.getAttribute(\"style\") ),\n\
\n\
\t\t// Make sure that URLs aren't manipulated\n\
\t\t// (IE normalizes it by default)\n\
\t\threfNormalized: ( a.getAttribute(\"href\") === \"/a\" ),\n\
\n\
\t\t// Make sure that element opacity exists\n\
\t\t// (IE uses filter instead)\n\
\t\t// Use a regex to work around a WebKit issue. See #5145\n\
\t\topacity: /^0.5/.test( a.style.opacity ),\n\
\n\
\t\t// Verify style float existence\n\
\t\t// (IE uses styleFloat instead of cssFloat)\n\
\t\tcssFloat: !!a.style.cssFloat,\n\
\n\
\t\t// Make sure that if no value is specified for a checkbox\n\
\t\t// that it defaults to \"on\".\n\
\t\t// (WebKit defaults to \"\" instead)\n\
\t\tcheckOn: ( input.value === \"on\" ),\n\
\n\
\t\t// Make sure that a selected-by-default option has a working selected property.\n\
\t\t// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)\n\
\t\toptSelected: opt.selected,\n\
\n\
\t\t// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)\n\
\t\tgetSetAttribute: div.className !== \"t\",\n\
\n\
\t\t// Tests for enctype support on a form (#6743)\n\
\t\tenctype: !!document.createElement(\"form\").enctype,\n\
\n\
\t\t// Makes sure cloning an html5 element does not cause problems\n\
\t\t// Where outerHTML is undefined, this still works\n\
\t\thtml5Clone: document.createElement(\"nav\").cloneNode( true ).outerHTML !== \"<:nav></:nav>\",\n\
\n\
\t\t// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode\n\
\t\tboxModel: ( document.compatMode === \"CSS1Compat\" ),\n\
\n\
\t\t// Will be defined later\n\
\t\tsubmitBubbles: true,\n\
\t\tchangeBubbles: true,\n\
\t\tfocusinBubbles: false,\n\
\t\tdeleteExpando: true,\n\
\t\tnoCloneEvent: true,\n\
\t\tinlineBlockNeedsLayout: false,\n\
\t\tshrinkWrapBlocks: false,\n\
\t\treliableMarginRight: true,\n\
\t\tboxSizingReliable: true,\n\
\t\tpixelPosition: false\n\
\t};\n\
\n\
\t// Make sure checked status is properly cloned\n\
\tinput.checked = true;\n\
\tsupport.noCloneChecked = input.cloneNode( true ).checked;\n\
\n\
\t// Make sure that the options inside disabled selects aren't marked as disabled\n\
\t// (WebKit marks them as disabled)\n\
\tselect.disabled = true;\n\
\tsupport.optDisabled = !opt.disabled;\n\
\n\
\t// Test to see if it's possible to delete an expando from an element\n\
\t// Fails in Internet Explorer\n\
\ttry {\n\
\t\tdelete div.test;\n\
\t} catch( e ) {\n\
\t\tsupport.deleteExpando = false;\n\
\t}\n\
\n\
\tif ( !div.addEventListener && div.attachEvent && div.fireEvent ) {\n\
\t\tdiv.attachEvent( \"onclick\", clickFn = function() {\n\
\t\t\t// Cloning a node shouldn't copy over any\n\
\t\t\t// bound event handlers (IE does this)\n\
\t\t\tsupport.noCloneEvent = false;\n\
\t\t});\n\
\t\tdiv.cloneNode( true ).fireEvent(\"onclick\");\n\
\t\tdiv.detachEvent( \"onclick\", clickFn );\n\
\t}\n\
\n\
\t// Check if a radio maintains its value\n\
\t// after being appended to the DOM\n\
\tinput = document.createElement(\"input\");\n\
\tinput.value = \"t\";\n\
\tinput.setAttribute( \"type\", \"radio\" );\n\
\tsupport.radioValue = input.value === \"t\";\n\
\n\
\tinput.setAttribute( \"checked\", \"checked\" );\n\
\n\
\t// #11217 - WebKit loses check when the name is after the checked attribute\n\
\tinput.setAttribute( \"name\", \"t\" );\n\
\n\
\tdiv.appendChild( input );\n\
\tfragment = document.createDocumentFragment();\n\
\tfragment.appendChild( div.lastChild );\n\
\n\
\t// WebKit doesn't clone checked state correctly in fragments\n\
\tsupport.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;\n\
\n\
\t// Check if a disconnected checkbox will retain its checked\n\
\t// value of true after appended to the DOM (IE6/7)\n\
\tsupport.appendChecked = input.checked;\n\
\n\
\tfragment.removeChild( input );\n\
\tfragment.appendChild( div );\n\
\n\
\t// Technique from Juriy Zaytsev\n\
\t// http://perfectionkills.com/detecting-event-support-without-browser-sniffing/\n\
\t// We only care about the case where non-standard event systems\n\
\t// are used, namely in IE. Short-circuiting here helps us to\n\
\t// avoid an eval call (in setAttribute) which can cause CSP\n\
\t// to go haywire. See: https://developer.mozilla.org/en/Security/CSP\n\
\tif ( !div.addEventListener ) {\n\
\t\tfor ( i in {\n\
\t\t\tsubmit: true,\n\
\t\t\tchange: true,\n\
\t\t\tfocusin: true\n\
\t\t}) {\n\
\t\t\teventName = \"on\" + i;\n\
\t\t\tisSupported = ( eventName in div );\n\
\t\t\tif ( !isSupported ) {\n\
\t\t\t\tdiv.setAttribute( eventName, \"return;\" );\n\
\t\t\t\tisSupported = ( typeof div[ eventName ] === \"function\" );\n\
\t\t\t}\n\
\t\t\tsupport[ i + \"Bubbles\" ] = isSupported;\n\
\t\t}\n\
\t}\n\
\n\
\t// Run tests that need a body at doc ready\n\
\tdomready(function() {\n\
\t\tvar container, div, tds, marginDiv,\n\
\t\t\tdivReset = \"padding:0;margin:0;border:0;display:block;overflow:hidden;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;\",\n\
\t\t\tbody = document.getElementsByTagName(\"body\")[0];\n\
\n\
\t\tif ( !body ) {\n\
\t\t\t// Return for frameset docs that don't have a body\n\
\t\t\treturn;\n\
\t\t}\n\
\n\
\t\tcontainer = document.createElement(\"div\");\n\
\t\tcontainer.style.cssText = \"visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px\";\n\
\t\tbody.insertBefore( container, body.firstChild );\n\
\n\
\t\t// Construct the test element\n\
\t\tdiv = document.createElement(\"div\");\n\
\t\tcontainer.appendChild( div );\n\
\n\
    //Check if table cells still have offsetWidth/Height when they are set\n\
    //to display:none and there are still other visible table cells in a\n\
    //table row; if so, offsetWidth/Height are not reliable for use when\n\
    //determining if an element has been hidden directly using\n\
    //display:none (it is still safe to use offsets if a parent element is\n\
    //hidden; don safety goggles and see bug #4512 for more information).\n\
    //(only IE 8 fails this test)\n\
\t\tdiv.innerHTML = \"<table><tr><td></td><td>t</td></tr></table>\";\n\
\t\ttds = div.getElementsByTagName(\"td\");\n\
\t\ttds[ 0 ].style.cssText = \"padding:0;margin:0;border:0;display:none\";\n\
\t\tisSupported = ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\ttds[ 0 ].style.display = \"\";\n\
\t\ttds[ 1 ].style.display = \"none\";\n\
\n\
\t\t// Check if empty table cells still have offsetWidth/Height\n\
\t\t// (IE <= 8 fail this test)\n\
\t\tsupport.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );\n\
\n\
\t\t// Check box-sizing and margin behavior\n\
\t\tdiv.innerHTML = \"\";\n\
\t\tdiv.style.cssText = \"box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;\";\n\
\t\tsupport.boxSizing = ( div.offsetWidth === 4 );\n\
\t\tsupport.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );\n\
\n\
\t\t// NOTE: To any future maintainer, we've window.getComputedStyle\n\
\t\t// because jsdom on node.js will break without it.\n\
\t\tif ( window.getComputedStyle ) {\n\
\t\t\tsupport.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== \"1%\";\n\
\t\t\tsupport.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: \"4px\" } ).width === \"4px\";\n\
\n\
\t\t\t// Check if div with explicit width and no margin-right incorrectly\n\
\t\t\t// gets computed margin-right based on width of container. For more\n\
\t\t\t// info see bug #3333\n\
\t\t\t// Fails in WebKit before Feb 2011 nightlies\n\
\t\t\t// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\
\t\t\tmarginDiv = document.createElement(\"div\");\n\
\t\t\tmarginDiv.style.cssText = div.style.cssText = divReset;\n\
\t\t\tmarginDiv.style.marginRight = marginDiv.style.width = \"0\";\n\
\t\t\tdiv.style.width = \"1px\";\n\
\t\t\tdiv.appendChild( marginDiv );\n\
\t\t\tsupport.reliableMarginRight =\n\
\t\t\t\t!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );\n\
\t\t}\n\
\n\
\t\tif ( typeof div.style.zoom !== \"undefined\" ) {\n\
\t\t\t// Check if natively block-level elements act like inline-block\n\
\t\t\t// elements when setting their display to 'inline' and giving\n\
\t\t\t// them layout\n\
\t\t\t// (IE < 8 does this)\n\
\t\t\tdiv.innerHTML = \"\";\n\
\t\t\tdiv.style.cssText = divReset + \"width:1px;padding:1px;display:inline;zoom:1\";\n\
\t\t\tsupport.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );\n\
\n\
\t\t\t// Check if elements with layout shrink-wrap their children\n\
\t\t\t// (IE 6 does this)\n\
\t\t\tdiv.style.display = \"block\";\n\
\t\t\tdiv.style.overflow = \"visible\";\n\
\t\t\tdiv.innerHTML = \"<div></div>\";\n\
\t\t\tdiv.firstChild.style.width = \"5px\";\n\
\t\t\tsupport.shrinkWrapBlocks = ( div.offsetWidth !== 3 );\n\
\n\
\t\t\tcontainer.style.zoom = 1;\n\
\t\t}\n\
\n\
\t\t// Null elements to avoid leaks in IE\n\
\t\tbody.removeChild( container );\n\
\t\tcontainer = div = tds = marginDiv = null;\n\
\t});\n\
\n\
\t// Null elements to avoid leaks in IE\n\
\tfragment.removeChild( div );\n\
\tall = a = select = opt = input = fragment = div = null;\n\
\n\
\treturn support;\n\
})();\n\
\n\
//@ sourceURL=timoxley-dom-support/index.js"
));
require.register("component-within-document/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Check if `el` is within the document.\n\
 *\n\
 * @param {Element} el\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
module.exports = function(el) {\n\
  var node = el;\n\
  while (node = node.parentNode) {\n\
    if (node == document) return true;\n\
  }\n\
  return false;\n\
};//@ sourceURL=component-within-document/index.js"
));
require.register("timoxley-offset/index.js", Function("exports, require, module",
"var support = require('dom-support')\n\
var contains = require('within-document')\n\
\n\
module.exports = function offset(el) {\n\
\tvar box = { top: 0, left: 0 }\n\
  var doc = el && el.ownerDocument\n\
\n\
\tif (!doc) {\n\
    console.warn('no document!')\n\
\t\treturn\n\
\t}\n\
\n\
\t// Make sure it's not a disconnected DOM node\n\
\tif (!contains(el)) {\n\
\t\treturn box\n\
\t}\n\
\n\
  var body = doc.body\n\
\tif (body === el) {\n\
\t\treturn bodyOffset(el)\n\
\t}\n\
\n\
\tvar docEl = doc.documentElement\n\
\n\
\t// If we don't have gBCR, just use 0,0 rather than error\n\
\t// BlackBerry 5, iOS 3 (original iPhone)\n\
\tif ( typeof el.getBoundingClientRect !== \"undefined\" ) {\n\
\t\tbox = el.getBoundingClientRect()\n\
\t}\n\
\n\
\tvar clientTop  = docEl.clientTop  || body.clientTop  || 0\n\
\tvar clientLeft = docEl.clientLeft || body.clientLeft || 0\n\
\tvar scrollTop  = window.pageYOffset || docEl.scrollTop\n\
\tvar scrollLeft = window.pageXOffset || docEl.scrollLeft\n\
\n\
\treturn {\n\
\t\ttop: box.top  + scrollTop  - clientTop,\n\
\t\tleft: box.left + scrollLeft - clientLeft\n\
\t}\n\
}\n\
\n\
function bodyOffset(body) {\n\
\tvar top = body.offsetTop\n\
\tvar left = body.offsetLeft\n\
\n\
\tif (support.doesNotIncludeMarginInBodyOffset) {\n\
\t\ttop  += parseFloat(body.style.marginTop || 0)\n\
\t\tleft += parseFloat(body.style.marginLeft || 0)\n\
\t}\n\
\n\
\treturn {\n\
    top: top,\n\
    left: left\n\
  }\n\
}\n\
//@ sourceURL=timoxley-offset/index.js"
));
require.register("component-tip/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
var events = require('events');\n\
var query = require('query');\n\
var domify = require('domify');\n\
var classes = require('classes');\n\
var css = require('css');\n\
var html = domify(require('./template'));\n\
var offset = require('offset');\n\
\n\
/**\n\
 * Expose `Tip`.\n\
 */\n\
\n\
module.exports = Tip;\n\
\n\
/**\n\
 * Apply the average use-case of simply\n\
 * showing a tool-tip on `el` hover.\n\
 *\n\
 * Options:\n\
 *\n\
 *  - `delay` hide delay in milliseconds [0]\n\
 *  - `value` defaulting to the element's title attribute\n\
 *\n\
 * @param {Mixed} elem\n\
 * @param {Object|String} options or value\n\
 * @api public\n\
 */\n\
\n\
function tip(elem, options) {\n\
  if ('string' == typeof options) options = { value : options };\n\
  var els = ('string' == typeof elem) ? query.all(elem) : [elem];\n\
  for(var i = 0, el; el = els[i]; i++) {\n\
    var val = options.value || el.getAttribute('title');\n\
    var tip = new Tip(val);\n\
    el.setAttribute('title', '');\n\
    tip.cancelHideOnHover();\n\
    tip.attach(el);\n\
  }\n\
}\n\
\n\
/**\n\
 * Initialize a `Tip` with the given `content`.\n\
 *\n\
 * @param {Mixed} content\n\
 * @api public\n\
 */\n\
\n\
function Tip(content, options) {\n\
  options = options || {};\n\
  if (!(this instanceof Tip)) return tip(content, options);\n\
  Emitter.call(this);\n\
  this.classname = '';\n\
  this.delay = options.delay || 300;\n\
  this.el = html.cloneNode(true);\n\
  this.events = events(this.el, this);\n\
  this.winEvents = events(window, this);\n\
  this.classes = classes(this.el);\n\
  this.inner = query('.tip-inner', this.el);\n\
  this.message(content);\n\
  this.position('south');\n\
  if (Tip.effect) this.effect(Tip.effect);\n\
}\n\
\n\
/**\n\
 * Mixin emitter.\n\
 */\n\
\n\
Emitter(Tip.prototype);\n\
\n\
/**\n\
 * Set tip `content`.\n\
 *\n\
 * @param {String|jQuery|Element} content\n\
 * @return {Tip} self\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.message = function(content){\n\
  this.inner.innerHTML = content;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Attach to the given `el` with optional hide `delay`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {Number} delay\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.attach = function(el){\n\
  var self = this;\n\
  this.target = el;\n\
  this.handleEvents = events(el, this);\n\
  this.handleEvents.bind('mouseover');\n\
  this.handleEvents.bind('mouseout');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * On mouse over\n\
 *\n\
 * @param {Event} e\n\
 * @return {Tip}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.onmouseover = function() {\n\
  this.show(this.target);\n\
  this.cancelHide();\n\
};\n\
\n\
/**\n\
 * On mouse out\n\
 *\n\
 * @param {Event} e\n\
 * @return {Tip}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.onmouseout = function() {\n\
  this.hide(this.delay);\n\
};\n\
\n\
/**\n\
 * Cancel hide on hover, hide with the given `delay`.\n\
 *\n\
 * @param {Number} delay\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.cancelHideOnHover = function(){\n\
  this.events.bind('mouseover', 'cancelHide');\n\
  this.events.bind('mouseout', 'hide');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the effect to `type`.\n\
 *\n\
 * @param {String} type\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.effect = function(type){\n\
  this._effect = type;\n\
  this.classes.add(type);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set position:\n\
 *\n\
 *  - `north`\n\
 *  - `north east`\n\
 *  - `north west`\n\
 *  - `south`\n\
 *  - `south east`\n\
 *  - `south west`\n\
 *  - `east`\n\
 *  - `west`\n\
 *\n\
 * @param {String} pos\n\
 * @param {Object} options\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.position = function(pos, options){\n\
  options = options || {};\n\
  this._position = pos;\n\
  this._auto = false != options.auto;\n\
  this.replaceClass(pos);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Show the tip attached to `el`.\n\
 *\n\
 * Emits \"show\" (el) event.\n\
 *\n\
 * @param {String|Element|Number} el or x\n\
 * @param {Number} [y]\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.show = function(el){\n\
  if ('string' == typeof el) el = query(el);\n\
\n\
  // show it\n\
  this.target = el;\n\
  document.body.appendChild(this.el);\n\
  this.classes.add('tip-' + this._position.replace(/\\s+/g, '-'));\n\
  this.classes.remove('tip-hide');\n\
\n\
  // x,y\n\
  if ('number' == typeof el) {\n\
    var x = arguments[0];\n\
    var y = arguments[1];\n\
    this.emit('show');\n\
    css(this.el, {\n\
      top: y,\n\
      left: x\n\
    });\n\
    this.reposition = false; \n\
    return this;  \n\
  }\n\
\n\
  // el\n\
  this.reposition();\n\
  this.emit('show', this.target);\n\
\n\
  this.winEvents.bind('resize', 'reposition');\n\
  this.winEvents.bind('scroll', 'reposition');\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Reposition the tip if necessary.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.reposition = function(){\n\
  var pos = this._position;\n\
  var off = this.offset(pos);\n\
  var newpos = this._auto && this.suggested(pos, off);\n\
  if (newpos) off = this.offset(pos = newpos);\n\
  this.replaceClass(pos);\n\
  css(this.el, off);\n\
};\n\
\n\
/**\n\
 * Compute the \"suggested\" position favouring `pos`.\n\
 * Returns undefined if no suggestion is made.\n\
 *\n\
 * @param {String} pos\n\
 * @param {Object} offset\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.suggested = function(pos, off){\n\
  var el = this.el;\n\
\n\
  var ew = el.clientWidth;\n\
  var eh = el.clientHeight;\n\
  var top = window.scrollY;\n\
  var left = window.scrollX;\n\
  var w = window.innerWidth;\n\
  var h = window.innerHeight;\n\
\n\
  // too high\n\
  if (off.top < top) return 'north';\n\
\n\
  // too low\n\
  if (off.top + eh > top + h) return 'south';\n\
\n\
  // too far to the right\n\
  if (off.left + ew > left + w) return 'east';\n\
\n\
  // too far to the left\n\
  if (off.left < left) return 'west';\n\
};\n\
\n\
/**\n\
 * Replace position class `name`.\n\
 *\n\
 * @param {String} name\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.replaceClass = function(name){\n\
  name = name.split(' ').join('-');\n\
  this.el.setAttribute('class', this.classname + ' tip tip-' + name + ' ' + this._effect);\n\
};\n\
\n\
/**\n\
 * Compute the offset for `.target`\n\
 * based on the given `pos`.\n\
 *\n\
 * @param {String} pos\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.offset = function(pos){\n\
  var pad = 15;\n\
  var el = this.el;\n\
  var target = this.target;\n\
\n\
  var ew = el.clientWidth;\n\
  var eh = el.clientHeight;\n\
\n\
  var to = offset(target);\n\
  var tw = target.clientWidth;\n\
  var th = target.clientHeight;\n\
\n\
  switch (pos) {\n\
    case 'south':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - ew / 2\n\
      }\n\
    case 'north west':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - pad\n\
      }\n\
    case 'north east':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - ew + pad\n\
      }\n\
    case 'north':\n\
      return {\n\
        top: to.top + th,\n\
        left: to.left + tw / 2 - ew / 2\n\
      }\n\
    case 'south west':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - pad\n\
      }\n\
    case 'south east':\n\
      return {\n\
        top: to.top - eh,\n\
        left: to.left + tw / 2 - ew + pad\n\
      }\n\
    case 'west':\n\
      return {\n\
        top: to.top + th / 2 - eh / 2,\n\
        left: to.left + tw\n\
      }\n\
    case 'east':\n\
      return {\n\
        top: to.top + th / 2 - eh / 2,\n\
        left: to.left - ew\n\
      }\n\
    default:\n\
      throw new Error('invalid position \"' + pos + '\"');\n\
  }\n\
};\n\
\n\
/**\n\
 * Cancel the `.hide()` timeout.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Tip.prototype.cancelHide = function(){\n\
  clearTimeout(this._hide);\n\
};\n\
\n\
/**\n\
 * Hide the tip with optional `ms` delay.\n\
 *\n\
 * Emits \"hide\" event.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Tip}\n\
 * @api public\n\
 */\n\
\n\
Tip.prototype.hide = function(ms){\n\
  var self = this;\n\
\n\
  // duration\n\
  if (ms) {\n\
    this._hide = setTimeout(this.hide.bind(this), ms);\n\
    return this;\n\
  }\n\
\n\
  // hide\n\
  this.classes.add('tip-hide');\n\
  if (this._effect) {\n\
    setTimeout(this.remove.bind(this), 300);\n\
  } else {\n\
    self.remove();\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Hide the tip without potential animation.\n\
 *\n\
 * @return {Tip}\n\
 * @api\n\
 */\n\
\n\
Tip.prototype.remove = function(){\n\
  if(this.reposition) {\n\
    this.winEvents.unbind('resize', 'reposition');\n\
    this.winEvents.unbind('scroll', 'reposition');\n\
}\n\
  this.emit('hide');\n\
\n\
  var parent = this.el.parentNode;\n\
  if (parent) parent.removeChild(this.el);\n\
  return this;\n\
};\n\
//@ sourceURL=component-tip/index.js"
));
require.register("component-tip/template.js", Function("exports, require, module",
"module.exports = '<div class=\"tip tip-hide\">\\n\
  <div class=\"tip-arrow\"></div>\\n\
  <div class=\"tip-inner\"></div>\\n\
</div>';//@ sourceURL=component-tip/template.js"
));
require.register("component-os/index.js", Function("exports, require, module",
"\n\
\n\
module.exports = os();\n\
\n\
function os() {\n\
  var ua = navigator.userAgent;\n\
  if (/mac/i.test(ua)) return 'mac';\n\
  if (/win/i.test(ua)) return 'windows';\n\
  if (/linux/i.test(ua)) return 'linux';\n\
}\n\
//@ sourceURL=component-os/index.js"
));
require.register("RedVentures-reduce/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Reduce `arr` with `fn`.\n\
 *\n\
 * @param {Array} arr\n\
 * @param {Function} fn\n\
 * @param {Mixed} initial\n\
 *\n\
 * TODO: combatible error handling?\n\
 */\n\
\n\
module.exports = function(arr, fn, initial){  \n\
  var idx = 0;\n\
  var len = arr.length;\n\
  var curr = arguments.length == 3\n\
    ? initial\n\
    : arr[idx++];\n\
\n\
  while (idx < len) {\n\
    curr = fn.call(null, curr, arr[idx], ++idx, arr);\n\
  }\n\
  \n\
  return curr;\n\
};//@ sourceURL=RedVentures-reduce/index.js"
));
require.register("visionmedia-superagent/lib/client.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Emitter = require('emitter');\n\
var reduce = require('reduce');\n\
\n\
/**\n\
 * Root reference for iframes.\n\
 */\n\
\n\
var root = 'undefined' == typeof window\n\
  ? this\n\
  : window;\n\
\n\
/**\n\
 * Noop.\n\
 */\n\
\n\
function noop(){};\n\
\n\
/**\n\
 * Check if `obj` is a host object,\n\
 * we don't want to serialize these :)\n\
 *\n\
 * TODO: future proof, move to compoent land\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isHost(obj) {\n\
  var str = {}.toString.call(obj);\n\
\n\
  switch (str) {\n\
    case '[object File]':\n\
    case '[object Blob]':\n\
    case '[object FormData]':\n\
      return true;\n\
    default:\n\
      return false;\n\
  }\n\
}\n\
\n\
/**\n\
 * Determine XHR.\n\
 */\n\
\n\
function getXHR() {\n\
  if (root.XMLHttpRequest\n\
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {\n\
    return new XMLHttpRequest;\n\
  } else {\n\
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}\n\
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}\n\
  }\n\
  return false;\n\
}\n\
\n\
/**\n\
 * Removes leading and trailing whitespace, added to support IE.\n\
 *\n\
 * @param {String} s\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
var trim = ''.trim\n\
  ? function(s) { return s.trim(); }\n\
  : function(s) { return s.replace(/(^\\s*|\\s*$)/g, ''); };\n\
\n\
/**\n\
 * Check if `obj` is an object.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function isObject(obj) {\n\
  return obj === Object(obj);\n\
}\n\
\n\
/**\n\
 * Serialize the given `obj`.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function serialize(obj) {\n\
  if (!isObject(obj)) return obj;\n\
  var pairs = [];\n\
  for (var key in obj) {\n\
    pairs.push(encodeURIComponent(key)\n\
      + '=' + encodeURIComponent(obj[key]));\n\
  }\n\
  return pairs.join('&');\n\
}\n\
\n\
/**\n\
 * Expose serialization method.\n\
 */\n\
\n\
 request.serializeObject = serialize;\n\
\n\
 /**\n\
  * Parse the given x-www-form-urlencoded `str`.\n\
  *\n\
  * @param {String} str\n\
  * @return {Object}\n\
  * @api private\n\
  */\n\
\n\
function parseString(str) {\n\
  var obj = {};\n\
  var pairs = str.split('&');\n\
  var parts;\n\
  var pair;\n\
\n\
  for (var i = 0, len = pairs.length; i < len; ++i) {\n\
    pair = pairs[i];\n\
    parts = pair.split('=');\n\
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);\n\
  }\n\
\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Expose parser.\n\
 */\n\
\n\
request.parseString = parseString;\n\
\n\
/**\n\
 * Default MIME type map.\n\
 *\n\
 *     superagent.types.xml = 'application/xml';\n\
 *\n\
 */\n\
\n\
request.types = {\n\
  html: 'text/html',\n\
  json: 'application/json',\n\
  urlencoded: 'application/x-www-form-urlencoded',\n\
  'form': 'application/x-www-form-urlencoded',\n\
  'form-data': 'application/x-www-form-urlencoded'\n\
};\n\
\n\
/**\n\
 * Default serialization map.\n\
 *\n\
 *     superagent.serialize['application/xml'] = function(obj){\n\
 *       return 'generated xml here';\n\
 *     };\n\
 *\n\
 */\n\
\n\
 request.serialize = {\n\
   'application/x-www-form-urlencoded': serialize,\n\
   'application/json': JSON.stringify\n\
 };\n\
\n\
 /**\n\
  * Default parsers.\n\
  *\n\
  *     superagent.parse['application/xml'] = function(str){\n\
  *       return { object parsed from str };\n\
  *     };\n\
  *\n\
  */\n\
\n\
request.parse = {\n\
  'application/x-www-form-urlencoded': parseString,\n\
  'application/json': JSON.parse\n\
};\n\
\n\
/**\n\
 * Parse the given header `str` into\n\
 * an object containing the mapped fields.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parseHeader(str) {\n\
  var lines = str.split(/\\r?\\n\
/);\n\
  var fields = {};\n\
  var index;\n\
  var line;\n\
  var field;\n\
  var val;\n\
\n\
  lines.pop(); // trailing CRLF\n\
\n\
  for (var i = 0, len = lines.length; i < len; ++i) {\n\
    line = lines[i];\n\
    index = line.indexOf(':');\n\
    field = line.slice(0, index).toLowerCase();\n\
    val = trim(line.slice(index + 1));\n\
    fields[field] = val;\n\
  }\n\
\n\
  return fields;\n\
}\n\
\n\
/**\n\
 * Return the mime type for the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function type(str){\n\
  return str.split(/ *; */).shift();\n\
};\n\
\n\
/**\n\
 * Return header field parameters.\n\
 *\n\
 * @param {String} str\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function params(str){\n\
  return reduce(str.split(/ *; */), function(obj, str){\n\
    var parts = str.split(/ *= */)\n\
      , key = parts.shift()\n\
      , val = parts.shift();\n\
\n\
    if (key && val) obj[key] = val;\n\
    return obj;\n\
  }, {});\n\
};\n\
\n\
/**\n\
 * Initialize a new `Response` with the given `xhr`.\n\
 *\n\
 *  - set flags (.ok, .error, etc)\n\
 *  - parse header\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Aliasing `superagent` as `request` is nice:\n\
 *\n\
 *      request = superagent;\n\
 *\n\
 *  We can use the promise-like API, or pass callbacks:\n\
 *\n\
 *      request.get('/').end(function(res){});\n\
 *      request.get('/', function(res){});\n\
 *\n\
 *  Sending data can be chained:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 *  Or passed to `.send()`:\n\
 *\n\
 *      request\n\
 *        .post('/user')\n\
 *        .send({ name: 'tj' }, function(res){});\n\
 *\n\
 *  Or passed to `.post()`:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' })\n\
 *        .end(function(res){});\n\
 *\n\
 * Or further reduced to a single call for simple cases:\n\
 *\n\
 *      request\n\
 *        .post('/user', { name: 'tj' }, function(res){});\n\
 *\n\
 * @param {XMLHTTPRequest} xhr\n\
 * @param {Object} options\n\
 * @api private\n\
 */\n\
\n\
function Response(req, options) {\n\
  options = options || {};\n\
  this.req = req;\n\
  this.xhr = this.req.xhr;\n\
  this.text = this.xhr.responseText;\n\
  this.setStatusProperties(this.xhr.status);\n\
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());\n\
  // getAllResponseHeaders sometimes falsely returns \"\" for CORS requests, but\n\
  // getResponseHeader still works. so we get content-type even if getting\n\
  // other headers fails.\n\
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');\n\
  this.setHeaderProperties(this.header);\n\
  this.body = this.parseBody(this.text);\n\
}\n\
\n\
/**\n\
 * Get case-insensitive `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.get = function(field){\n\
  return this.header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set header related properties:\n\
 *\n\
 *   - `.type` the content type without params\n\
 *\n\
 * A response of \"Content-Type: text/plain; charset=utf-8\"\n\
 * will provide you with a `.type` of \"text/plain\".\n\
 *\n\
 * @param {Object} header\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setHeaderProperties = function(header){\n\
  // content-type\n\
  var ct = this.header['content-type'] || '';\n\
  this.type = type(ct);\n\
\n\
  // params\n\
  var obj = params(ct);\n\
  for (var key in obj) this[key] = obj[key];\n\
};\n\
\n\
/**\n\
 * Parse the given body `str`.\n\
 *\n\
 * Used for auto-parsing of bodies. Parsers\n\
 * are defined on the `superagent.parse` object.\n\
 *\n\
 * @param {String} str\n\
 * @return {Mixed}\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.parseBody = function(str){\n\
  var parse = request.parse[this.type];\n\
  return parse\n\
    ? parse(str)\n\
    : null;\n\
};\n\
\n\
/**\n\
 * Set flags such as `.ok` based on `status`.\n\
 *\n\
 * For example a 2xx response will give you a `.ok` of __true__\n\
 * whereas 5xx will be __false__ and `.error` will be __true__. The\n\
 * `.clientError` and `.serverError` are also available to be more\n\
 * specific, and `.statusType` is the class of error ranging from 1..5\n\
 * sometimes useful for mapping respond colors etc.\n\
 *\n\
 * \"sugar\" properties are also defined for common cases. Currently providing:\n\
 *\n\
 *   - .noContent\n\
 *   - .badRequest\n\
 *   - .unauthorized\n\
 *   - .notAcceptable\n\
 *   - .notFound\n\
 *\n\
 * @param {Number} status\n\
 * @api private\n\
 */\n\
\n\
Response.prototype.setStatusProperties = function(status){\n\
  var type = status / 100 | 0;\n\
\n\
  // status / class\n\
  this.status = status;\n\
  this.statusType = type;\n\
\n\
  // basics\n\
  this.info = 1 == type;\n\
  this.ok = 2 == type;\n\
  this.clientError = 4 == type;\n\
  this.serverError = 5 == type;\n\
  this.error = (4 == type || 5 == type)\n\
    ? this.toError()\n\
    : false;\n\
\n\
  // sugar\n\
  this.accepted = 202 == status;\n\
  this.noContent = 204 == status || 1223 == status;\n\
  this.badRequest = 400 == status;\n\
  this.unauthorized = 401 == status;\n\
  this.notAcceptable = 406 == status;\n\
  this.notFound = 404 == status;\n\
  this.forbidden = 403 == status;\n\
};\n\
\n\
/**\n\
 * Return an `Error` representative of this response.\n\
 *\n\
 * @return {Error}\n\
 * @api public\n\
 */\n\
\n\
Response.prototype.toError = function(){\n\
  var req = this.req;\n\
  var method = req.method;\n\
  var path = req.path;\n\
\n\
  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';\n\
  var err = new Error(msg);\n\
  err.status = this.status;\n\
  err.method = method;\n\
  err.path = path;\n\
\n\
  return err;\n\
};\n\
\n\
/**\n\
 * Expose `Response`.\n\
 */\n\
\n\
request.Response = Response;\n\
\n\
/**\n\
 * Initialize a new `Request` with the given `method` and `url`.\n\
 *\n\
 * @param {String} method\n\
 * @param {String} url\n\
 * @api public\n\
 */\n\
\n\
function Request(method, url) {\n\
  var self = this;\n\
  Emitter.call(this);\n\
  this._query = this._query || [];\n\
  this.method = method;\n\
  this.url = url;\n\
  this.header = {};\n\
  this._header = {};\n\
  this.on('end', function(){\n\
    var res = new Response(self);\n\
    if ('HEAD' == method) res.text = null;\n\
    self.callback(null, res);\n\
  });\n\
}\n\
\n\
/**\n\
 * Mixin `Emitter`.\n\
 */\n\
\n\
Emitter(Request.prototype);\n\
\n\
/**\n\
 * Set timeout to `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.timeout = function(ms){\n\
  this._timeout = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Clear previous timeout.\n\
 *\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.clearTimeout = function(){\n\
  this._timeout = 0;\n\
  clearTimeout(this._timer);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Abort the request, and clear potential timeout.\n\
 *\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.abort = function(){\n\
  if (this.aborted) return;\n\
  this.aborted = true;\n\
  this.xhr.abort();\n\
  this.clearTimeout();\n\
  this.emit('abort');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set header `field` to `val`, or multiple fields with one object.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      req.get('/')\n\
 *        .set('Accept', 'application/json')\n\
 *        .set('X-API-Key', 'foobar')\n\
 *        .end(callback);\n\
 *\n\
 *      req.get('/')\n\
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })\n\
 *        .end(callback);\n\
 *\n\
 * @param {String|Object} field\n\
 * @param {String} val\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.set = function(field, val){\n\
  if (isObject(field)) {\n\
    for (var key in field) {\n\
      this.set(key, field[key]);\n\
    }\n\
    return this;\n\
  }\n\
  this._header[field.toLowerCase()] = val;\n\
  this.header[field] = val;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Get case-insensitive header `field` value.\n\
 *\n\
 * @param {String} field\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.getHeader = function(field){\n\
  return this._header[field.toLowerCase()];\n\
};\n\
\n\
/**\n\
 * Set Content-Type to `type`, mapping values from `request.types`.\n\
 *\n\
 * Examples:\n\
 *\n\
 *      superagent.types.xml = 'application/xml';\n\
 *\n\
 *      request.post('/')\n\
 *        .type('xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 *      request.post('/')\n\
 *        .type('application/xml')\n\
 *        .send(xmlstring)\n\
 *        .end(callback);\n\
 *\n\
 * @param {String} type\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.type = function(type){\n\
  this.set('Content-Type', request.types[type] || type);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set Authorization field value with `user` and `pass`.\n\
 *\n\
 * @param {String} user\n\
 * @param {String} pass\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.auth = function(user, pass){\n\
  var str = btoa(user + ':' + pass);\n\
  this.set('Authorization', 'Basic ' + str);\n\
  return this;\n\
};\n\
\n\
/**\n\
* Add query-string `val`.\n\
*\n\
* Examples:\n\
*\n\
*   request.get('/shoes')\n\
*     .query('size=10')\n\
*     .query({ color: 'blue' })\n\
*\n\
* @param {Object|String} val\n\
* @return {Request} for chaining\n\
* @api public\n\
*/\n\
\n\
Request.prototype.query = function(val){\n\
  if ('string' != typeof val) val = serialize(val);\n\
  if (val) this._query.push(val);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Send `data`, defaulting the `.type()` to \"json\" when\n\
 * an object is given.\n\
 *\n\
 * Examples:\n\
 *\n\
 *       // querystring\n\
 *       request.get('/search')\n\
 *         .end(callback)\n\
 *\n\
 *       // multiple data \"writes\"\n\
 *       request.get('/search')\n\
 *         .send({ search: 'query' })\n\
 *         .send({ range: '1..5' })\n\
 *         .send({ order: 'desc' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual json\n\
 *       request.post('/user')\n\
 *         .type('json')\n\
 *         .send('{\"name\":\"tj\"})\n\
 *         .end(callback)\n\
 *\n\
 *       // auto json\n\
 *       request.post('/user')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // manual x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send('name=tj')\n\
 *         .end(callback)\n\
 *\n\
 *       // auto x-www-form-urlencoded\n\
 *       request.post('/user')\n\
 *         .type('form')\n\
 *         .send({ name: 'tj' })\n\
 *         .end(callback)\n\
 *\n\
 *       // defaults to x-www-form-urlencoded\n\
  *      request.post('/user')\n\
  *        .send('name=tobi')\n\
  *        .send('species=ferret')\n\
  *        .end(callback)\n\
 *\n\
 * @param {String|Object} data\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.send = function(data){\n\
  var obj = isObject(data);\n\
  var type = this.getHeader('Content-Type');\n\
\n\
  // merge\n\
  if (obj && isObject(this._data)) {\n\
    for (var key in data) {\n\
      this._data[key] = data[key];\n\
    }\n\
  } else if ('string' == typeof data) {\n\
    if (!type) this.type('form');\n\
    type = this.getHeader('Content-Type');\n\
    if ('application/x-www-form-urlencoded' == type) {\n\
      this._data = this._data\n\
        ? this._data + '&' + data\n\
        : data;\n\
    } else {\n\
      this._data = (this._data || '') + data;\n\
    }\n\
  } else {\n\
    this._data = data;\n\
  }\n\
\n\
  if (!obj) return this;\n\
  if (!type) this.type('json');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Invoke the callback with `err` and `res`\n\
 * and handle arity check.\n\
 *\n\
 * @param {Error} err\n\
 * @param {Response} res\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.callback = function(err, res){\n\
  var fn = this._callback;\n\
  if (2 == fn.length) return fn(err, res);\n\
  if (err) return this.emit('error', err);\n\
  fn(res);\n\
};\n\
\n\
/**\n\
 * Invoke callback with x-domain error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.crossDomainError = function(){\n\
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');\n\
  err.crossDomain = true;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Invoke callback with timeout error.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Request.prototype.timeoutError = function(){\n\
  var timeout = this._timeout;\n\
  var err = new Error('timeout of ' + timeout + 'ms exceeded');\n\
  err.timeout = timeout;\n\
  this.callback(err);\n\
};\n\
\n\
/**\n\
 * Enable transmission of cookies with x-domain requests.\n\
 *\n\
 * Note that for this to work the origin must not be\n\
 * using \"Access-Control-Allow-Origin\" with a wildcard,\n\
 * and also must set \"Access-Control-Allow-Credentials\"\n\
 * to \"true\".\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.withCredentials = function(){\n\
  this._withCredentials = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Initiate request, invoking callback `fn(res)`\n\
 * with an instanceof `Response`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Request} for chaining\n\
 * @api public\n\
 */\n\
\n\
Request.prototype.end = function(fn){\n\
  var self = this;\n\
  var xhr = this.xhr = getXHR();\n\
  var query = this._query.join('&');\n\
  var timeout = this._timeout;\n\
  var data = this._data;\n\
\n\
  // store callback\n\
  this._callback = fn || noop;\n\
\n\
  // CORS\n\
  if (this._withCredentials) xhr.withCredentials = true;\n\
\n\
  // state change\n\
  xhr.onreadystatechange = function(){\n\
    if (4 != xhr.readyState) return;\n\
    if (0 == xhr.status) {\n\
      if (self.aborted) return self.timeoutError();\n\
      return self.crossDomainError();\n\
    }\n\
    self.emit('end');\n\
  };\n\
\n\
  // progress\n\
  if (xhr.upload) {\n\
    xhr.upload.onprogress = function(e){\n\
      e.percent = e.loaded / e.total * 100;\n\
      self.emit('progress', e);\n\
    };\n\
  }\n\
\n\
  // timeout\n\
  if (timeout && !this._timer) {\n\
    this._timer = setTimeout(function(){\n\
      self.abort();\n\
    }, timeout);\n\
  }\n\
\n\
  // querystring\n\
  if (query) {\n\
    query = request.serializeObject(query);\n\
    this.url += ~this.url.indexOf('?')\n\
      ? '&' + query\n\
      : '?' + query;\n\
  }\n\
\n\
  // initiate request\n\
  xhr.open(this.method, this.url, true);\n\
\n\
  // body\n\
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {\n\
    // serialize stuff\n\
    var serialize = request.serialize[this.getHeader('Content-Type')];\n\
    if (serialize) data = serialize(data);\n\
  }\n\
\n\
  // set header fields\n\
  for (var field in this.header) {\n\
    if (null == this.header[field]) continue;\n\
    xhr.setRequestHeader(field, this.header[field]);\n\
  }\n\
\n\
  // send stuff\n\
  xhr.send(data);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Expose `Request`.\n\
 */\n\
\n\
request.Request = Request;\n\
\n\
/**\n\
 * Issue a request:\n\
 *\n\
 * Examples:\n\
 *\n\
 *    request('GET', '/users').end(callback)\n\
 *    request('/users').end(callback)\n\
 *    request('/users', callback)\n\
 *\n\
 * @param {String} method\n\
 * @param {String|Function} url or callback\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
function request(method, url) {\n\
  // callback\n\
  if ('function' == typeof url) {\n\
    return new Request('GET', method).end(url);\n\
  }\n\
\n\
  // url first\n\
  if (1 == arguments.length) {\n\
    return new Request('GET', method);\n\
  }\n\
\n\
  return new Request(method, url);\n\
}\n\
\n\
/**\n\
 * GET `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.get = function(url, data, fn){\n\
  var req = request('GET', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.query(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * GET `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.head = function(url, data, fn){\n\
  var req = request('HEAD', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * DELETE `url` with optional callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.del = function(url, fn){\n\
  var req = request('DELETE', url);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PATCH `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.patch = function(url, data, fn){\n\
  var req = request('PATCH', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * POST `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed} data\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.post = function(url, data, fn){\n\
  var req = request('POST', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * PUT `url` with optional `data` and callback `fn(res)`.\n\
 *\n\
 * @param {String} url\n\
 * @param {Mixed|Function} data or fn\n\
 * @param {Function} fn\n\
 * @return {Request}\n\
 * @api public\n\
 */\n\
\n\
request.put = function(url, data, fn){\n\
  var req = request('PUT', url);\n\
  if ('function' == typeof data) fn = data, data = null;\n\
  if (data) req.send(data);\n\
  if (fn) req.end(fn);\n\
  return req;\n\
};\n\
\n\
/**\n\
 * Expose `request`.\n\
 */\n\
\n\
module.exports = request;\n\
//@ sourceURL=visionmedia-superagent/lib/client.js"
));
require.register("screenwriter/components/autocomplete.js", Function("exports, require, module",
"var dom = require('dom');\n\
\n\
function getTags(tags) {\n\
    var goodTags = [];\n\
    for(i in tags)\n\
        goodTags.push(tags[i]);\n\
    return goodTags;\n\
}\n\
    \n\
module.exports.start = function($this) {\n\
    \n\
    var settings = { \n\
        'matchClass' : 'editor-tag-matches', \n\
        'innerMatchClass' : 'editor-tag-matches-inner',\n\
        'tagContainer' : 'span', \n\
        'tagWrap' : 'span', \n\
        'sort' : true,\n\
        'url' : null,\n\
        'delay' : 0,\n\
        'separator' : ' '\n\
    };\n\
\n\
    var i, \n\
        tag = {}, \n\
        userTags = [];\n\
\n\
    var matches, \n\
        fromTab = false;\n\
    var suggestionsShow = false;\n\
    var workingTag = \"\";\n\
    var currentTag = {\"position\": 0, tag: \"\"};\n\
    var tagMatches = dom(document.createElement(settings.tagContainer));\n\
    var innerTagMatches = dom(document.createElement('div'));\n\
    \n\
    tagMatches.addClass(settings.matchClass);\n\
    innerTagMatches.addClass(settings.innerMatchClass);\n\
    tagMatches.append(innerTagMatches);\n\
    \n\
    function showSuggestionsDelayed(el, key) {\n\
        if (settings.delay) {\n\
            if ($this.timer) clearTimeout($this.timer);\n\
            $this.timer = setTimeout(function () {\n\
                showSuggestions(el, key);\n\
            }, settings.delay);\n\
        } else {\n\
            showSuggestions(el, key);\n\
        }\n\
    }\n\
    \n\
    function getCaret(el) { \n\
        if (el.selectionStart) { \n\
            return el.selectionStart; \n\
        } else if (document.selection) { \n\
            el.focus(); \n\
        \n\
            var r = document.selection.createRange(); \n\
            if (r == null) { \n\
                return 0; \n\
            } \n\
        \n\
            var re = el.createTextRange(), \n\
            rc = re.duplicate(); \n\
            re.moveToBookmark(r.getBookmark()); \n\
            rc.setEndPoint('EndToStart', re); \n\
        \n\
            return rc.text.length; \n\
        }  \n\
        return 0; \n\
    }\n\
    function setSelectionRange(el, selectionStart, selectionEnd) {\n\
        if(el.setSelectionRange) {\n\
            el.focus();\n\
            el.setSelectionRange(selectionStart, selectionEnd);\n\
        } else if(el.createTextRange) {\n\
            var range = el.createTextRange();\n\
            range.collapse(true);\n\
            range.moveEnd('character', selectionEnd);\n\
            range.moveStart('character', selectionStart);\n\
            range.select();\n\
        }\n\
    }\n\
    \n\
    function setCaretToPos(el, pos) {\n\
        setSelectionRange(el, pos, pos);\n\
    }\n\
\n\
    function showSuggestions(el, key) {\n\
\n\
        var charPos = getCaret(el),\n\
            foundSpace = false,\n\
            i, \n\
            html = '';\n\
            \n\
        var currPos = charPos,\n\
            currChar;\n\
            \n\
        matches = [];\n\
        workingTag = '';\n\
        \n\
        while(!foundSpace) {\n\
            currChar = el.value.charAt(currPos);\n\
            if(currChar != ' ' && currChar == currChar.toUpperCase()) {\n\
                if(/[a-zA-Z0-9]/.test(currChar))\n\
                    workingTag = currChar + workingTag;\n\
                currPos--;\n\
            } else {\n\
                foundSpace = true;\n\
            }\n\
        }\n\
\n\
        if (workingTag) {\n\
            for (i = 0; i < userTags.length; i++) {\n\
                if (userTags[i].indexOf(workingTag) === 0) {\n\
                    matches.push(userTags[i]);\n\
                }\n\
            }                \n\
\n\
            if (settings.sort) {\n\
                matches = matches.sort(-1);\n\
            }                    \n\
\n\
            for (i = 0; i < matches.length; i++) {\n\
                html += '<' + settings.tagWrap + ' class=\"_tag_suggestion\">' + matches[i].toLowerCase() + '</' + settings.tagWrap + '>';\n\
            }\n\
\n\
            innerTagMatches.html(html);\n\
            \n\
            suggestionsShow = !!(matches.length);\n\
        } else {\n\
            hideSuggestions();\n\
        }\n\
    }\n\
\n\
    function hideSuggestions() {\n\
        innerTagMatches.empty();\n\
        matches = [];\n\
        suggestionsShow = false;\n\
    }\n\
\n\
    function setSelection() {\n\
        var v = dom($this).val();\n\
\n\
        if (v == dom($this).attr('title') && dom($this).hasClass('hint'))\n\
            v = '';\n\
\n\
        currentTags = v.split(settings.separator);\n\
        hideSuggestions();\n\
    }\n\
\n\
    function chooseTag(ev, tag) {\n\
        var toInsert = tag.substr(workingTag.length);\n\
        var corpus = dom($this).val();\n\
        var position = getCaret(dom($this).get(0));\n\
\n\
        dom($this).val(corpus.substr(0, position) + toInsert + corpus.substr(position));\n\
        \n\
        setCaretToPos(dom($this).get(0), position + toInsert.length);\n\
        \n\
        setSelection();\n\
        \n\
        ev.stopPropagation();\n\
        ev.preventDefault();\n\
    }\n\
\n\
    function handleKeys(ev) {\n\
        fromTab = false;\n\
        var type = ev.type;\n\
        var resetSelection = false;\n\
        \n\
        switch (ev.keyCode) {\n\
            case 37: // ignore cases (arrow keys)\n\
            case 38:\n\
            case 39:\n\
            case 40: {\n\
                hideSuggestions();\n\
                return true;\n\
            }\n\
            case 224:\n\
            case 17:\n\
            case 16:\n\
            case 18: {\n\
                return true;\n\
            }\n\
\n\
            case 8: {\n\
                // delete - hide selections if we're empty\n\
                if (this.value == '') {\n\
                    hideSuggestions();\n\
                    setSelection();\n\
                    return true;\n\
                } else {\n\
                    type = 'keyup'; // allow drop through\n\
                    resetSelection = true;\n\
                    showSuggestionsDelayed(this);\n\
                }\n\
                break;\n\
            }\n\
\n\
            case 9: // return and tab\n\
            case 13: {\n\
                if (suggestionsShow) {\n\
                    // complete\n\
                    chooseTag(ev, matches[0]);\n\
                    \n\
                    fromTab = true;\n\
                    return false;\n\
                } else {\n\
                    return true;\n\
                }\n\
            }\n\
            case 27: {\n\
                hideSuggestions();\n\
                setSelection();\n\
                return true;\n\
            }\n\
            case 32: {\n\
                setSelection();\n\
                return true;\n\
            }\n\
        }\n\
\n\
        if (type == 'keyup') {\n\
            switch (ev.charCode) {\n\
                case 9:\n\
                case 13: {\n\
                    return true;\n\
                }\n\
            }\n\
\n\
            if (resetSelection) { \n\
                setSelection();\n\
            }\n\
            showSuggestionsDelayed(this, ev.charCode);            \n\
        }\n\
    }\n\
\n\
    dom($this).on('keypress', handleKeys).on('keyup', handleKeys).on('blur', function() {\n\
        if (fromTab == true || suggestionsShow) {\n\
            fromTab = false;\n\
            //tagsElm.focus();\n\
        }\n\
    });\n\
    tagMatches.insertAfter($this);\n\
\n\
    // initialise\n\
    setSelection();  \n\
    \n\
    tag.setTags = function(tags) {\n\
        userTags = getTags(tags);\n\
    }\n\
    \n\
    return tag;\n\
        \n\
};//@ sourceURL=screenwriter/components/autocomplete.js"
));
require.register("screenwriter/components/index.js", Function("exports, require, module",
"var request = require('superagent'),\n\
    dom = require('dom'),\n\
    fountain = require('fountain'),\n\
    height = require('textarea-height'),\n\
    debounce = require('debounce'),\n\
    post = require('post'),\n\
    Tip = require('tip'),\n\
    mobile = require('is-mobile'),\n\
    autocomplete = require('./autocomplete');\n\
\n\
var charAutocomplete,\n\
    title = \"\",\n\
    characters = {},\n\
    tokens = [],\n\
    height;\n\
    \n\
var $editor = dom('.editor'),\n\
    $viewer = dom('.viewer'),\n\
    $download = dom('.nav-download'),\n\
    $tooltip = dom('.tooltip'),\n\
    $viewerScript = dom('.viewer-script');\n\
\n\
$viewerScript\n\
    .addClass('dpi72')\n\
    .addClass('us-letter');\n\
\n\
charAutocomplete = autocomplete.start($editor.find('textarea'));\n\
\n\
if(mobile())\n\
    height($editor.find('textarea').get(0), true); \n\
\n\
var parseStringForArray = function(string) {\n\
    return string.replace(/ *\\([^)]*\\) */g, \"\").replace(/[^a-z0-9\\s]/gi, '').replace(/[_\\s]/g, '');\n\
}\n\
\n\
var removeParentheticals = function(string) {\n\
    return string.replace(/ *\\([^)]*\\) */g, \"\");\n\
}\n\
var stopEvent = function(e) {\n\
    e.stopPropagation();\n\
    e.preventDefault();\n\
}\n\
var getDimentions = function() {\n\
    var w = window,\n\
        d = document,\n\
        e = d.documentElement,\n\
        g = d.getElementsByTagName('body')[0],\n\
        x = w.innerWidth || e.clientWidth || g.clientWidth,\n\
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;\n\
    return { x: x, y: y };\n\
}\n\
\n\
var resize = function() {\n\
    var dim = getDimentions();\n\
    $viewer.css('height', dim.y);\n\
    $editor.css('height', dim.y);\n\
}\n\
\n\
var dragOver = function(e) {\n\
    dom(this).addClass('over');\n\
    stopEvent(e);\n\
}\n\
var dragLeave = function(e) {\n\
    dom(this).removeClass('over');\n\
    stopEvent(e);\n\
}\n\
var loadScript = function(e) {\n\
    stopEvent(e);\n\
    \n\
    dom(this).removeClass('over');\n\
    \n\
    var file = e.dataTransfer.files[0],\n\
        reader = new FileReader();\n\
    \n\
    if(file) {\n\
        reader.onload = function(evt) {\n\
            $editor.find('textarea').val(evt.target.result);\n\
            generateScript();\n\
        }\n\
    \n\
        reader.readAsText(file);\n\
    }\n\
}\n\
var page = function(html, isTitlePage) {\n\
    var $output = dom(document.createElement('div')).addClass('viewer-script-page').html(html);\n\
    \n\
    if (isTitlePage) {\n\
        $output.addClass('title-page');\n\
    } else {\n\
        /*\n\
$output.find('div.dialogue.dual').each(function() {\n\
            dual = dom(this).prev('div.dialogue');\n\
            dom(this).wrap(dom(document.createElement('div')).addClass('dual-dialogue'));\n\
            dual.prependTo($(this).parent());\n\
        });\n\
*/\n\
    }\n\
    return $output;\n\
}\n\
var generateScript = function() {\n\
    fountain.parse($editor.find('textarea').val(), true, function(result) {\n\
        if(result) {\n\
            tokens = result;\n\
            characters = [];\n\
            $viewerScript.html('');\n\
            if(result.title && result.html.title_page) {\n\
                $viewerScript.append(page(result.html.title_page, true));\n\
                title = result.title || 'Untitled';\n\
            }\n\
            $viewerScript.append(page(result.html.script));\n\
            for(i in result.tokens) {\n\
                if(result.tokens[i].type == 'character') {\n\
                    var char = parseStringForArray(result.tokens[i]['text']);\n\
                    if(!characters[char]) {\n\
                        characters[char] = removeParentheticals(result.tokens[i]['text']);\n\
                    }\n\
                }\n\
            }\n\
            charAutocomplete.setTags(characters);\n\
        } \n\
    });\n\
}\n\
\n\
$editor.find('textarea').on('keyup', debounce(generateScript, 250));\n\
$editor.on('dragleave', dragLeave).on('dragover', dragOver).on('drop', loadScript);\n\
$download.on('click', function() {\n\
    var dim = getDimentions();\n\
    var tip = new Tip($tooltip.html());\n\
    var hide = function() {\n\
        $editor.find('textarea').off(\"click\", hide);\n\
        tip.hide();\n\
    }\n\
    tip.on(\"show\", function() {\n\
        dom('.download-option').on('click', function() {\n\
            post('/download', { type: dom(this).attr('title'), filename: title, tokens: JSON.stringify(tokens), content: $editor.find('textarea').val() });\n\
            tip.hide();\n\
        });\n\
        $editor.find('textarea').on('click', hide);   \n\
    });\n\
    tip.show(75, parseInt(dim.y) - 120);\n\
});\n\
\n\
if (window.File && window.FileReader && window.FileList && window.Blob) {\n\
\n\
} else {\n\
    alert('The File APIs are not fully supported in this browser.');\n\
}\n\
\n\
window.onresize = resize;\n\
resize();\n\
generateScript();//@ sourceURL=screenwriter/components/index.js"
));




















































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
require.alias("whyohwhyamihere-textarea-height/index.js", "screenwriter/deps/textarea-height/index.js");
require.alias("whyohwhyamihere-textarea-height/index.js", "screenwriter/deps/textarea-height/index.js");
require.alias("whyohwhyamihere-textarea-height/index.js", "textarea-height/index.js");
require.alias("whyohwhyamihere-textarea-height/index.js", "whyohwhyamihere-textarea-height/index.js");
require.alias("whyohwhyamihere-is-mobile/index.js", "screenwriter/deps/is-mobile/index.js");
require.alias("whyohwhyamihere-is-mobile/index.js", "screenwriter/deps/is-mobile/index.js");
require.alias("whyohwhyamihere-is-mobile/index.js", "is-mobile/index.js");
require.alias("whyohwhyamihere-is-mobile/index.js", "whyohwhyamihere-is-mobile/index.js");
require.alias("component-debounce/index.js", "screenwriter/deps/debounce/index.js");
require.alias("component-debounce/index.js", "screenwriter/deps/debounce/index.js");
require.alias("component-debounce/index.js", "debounce/index.js");
require.alias("component-debounce/index.js", "component-debounce/index.js");
require.alias("component-event/index.js", "screenwriter/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

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

require.alias("component-tip/index.js", "screenwriter/deps/tip/index.js");
require.alias("component-tip/template.js", "screenwriter/deps/tip/template.js");
require.alias("component-tip/index.js", "tip/index.js");
require.alias("component-emitter/index.js", "component-tip/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-query/index.js", "component-tip/deps/query/index.js");

require.alias("component-events/index.js", "component-tip/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-event-manager/index.js", "component-events/deps/event-manager/index.js");

require.alias("component-domify/index.js", "component-tip/deps/domify/index.js");

require.alias("component-classes/index.js", "component-tip/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-css/index.js", "component-tip/deps/css/index.js");

require.alias("timoxley-offset/index.js", "component-tip/deps/offset/index.js");
require.alias("timoxley-dom-support/index.js", "timoxley-offset/deps/dom-support/index.js");
require.alias("enyo-domready/index.js", "timoxley-dom-support/deps/domready/index.js");

require.alias("timoxley-assert/index.js", "timoxley-dom-support/deps/assert/index.js");
require.alias("component-inherit/index.js", "timoxley-assert/deps/inherit/index.js");

require.alias("component-within-document/index.js", "timoxley-offset/deps/within-document/index.js");

require.alias("component-os/index.js", "screenwriter/deps/os/index.js");
require.alias("component-os/index.js", "os/index.js");

require.alias("visionmedia-superagent/lib/client.js", "screenwriter/deps/superagent/lib/client.js");
require.alias("visionmedia-superagent/lib/client.js", "screenwriter/deps/superagent/index.js");
require.alias("visionmedia-superagent/lib/client.js", "superagent/index.js");
require.alias("component-emitter/index.js", "visionmedia-superagent/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "visionmedia-superagent/deps/reduce/index.js");

require.alias("visionmedia-superagent/lib/client.js", "visionmedia-superagent/index.js");