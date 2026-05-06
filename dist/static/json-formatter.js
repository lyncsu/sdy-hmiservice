/*!
 * json-formatter.js v1.0.0
 * A lightweight JSON syntax highlighter & formatter — Chrome DevTools style.
 * UMD build — works with CommonJS, AMD, and browser globals.
 *
 * Usage (browser):
 *   JsonFormatter.render(data, container)
 *   JsonFormatter.renderString(jsonString, container)
 *
 * Usage (Node / CommonJS):
 *   const { render, renderString } = require('./json-formatter.js')
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.JsonFormatter = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /* ─── default theme (Chrome DevTools light) ─── */
    var THEMES = {
        light: {
            key: '#881391',
            string: '#1a6e3c',
            number: '#1c00cf',
            boolean: '#1c00cf',
            null: '#808080',
            punctuation: 'inherit',
            background: 'none',
            text: '#000000',
        },
        dark: {
            key: '#c792ea',
            string: '#89ddff',
            number: '#f78c6c',
            boolean: '#ff9cac',
            null: '#888888',
            punctuation: 'inherit',
            background: '#1e1e1e',
            text: '#d4d4d4',
        },
    };

    /* ─── helpers ─── */
    function esc(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    /**
     * Colorize a pretty-printed JSON string with <span> tags.
     * @param {string} json   Already-stringified JSON text.
     * @param {object} colors Color map (keys: key, string, number, boolean, null).
     * @returns {string}      HTML string with syntax highlighting.
     */
    function colorize(json, colors) {
        var c = Object.assign({}, THEMES.light, colors || {});
        return esc(json).replace(
            /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,
            function (match, _str, colon) {
                if (match.charAt(0) === '"') {
                    var color = colon ? c.key : c.string;
                    return '<span style="color:' + color + '">' + match + '</span>';
                }
                if (match === 'null') return '<span style="color:' + c.null + '">null</span>';
                if (match === 'true' || match === 'false')
                    return '<span style="color:' + c.boolean + '">' + match + '</span>';
                return '<span style="color:' + c.number + '">' + match + '</span>';
            },
        );
    }

    /**
     * Build the complete HTML string for a JSON value.
     * @param {*}      data    Any JSON-serialisable value.
     * @param {object} options See `render()` for option details.
     * @returns {string}
     */
    function toHTML(data, options) {
        var opts = options || {};
        var indent = typeof opts.indent === 'number' ? opts.indent : 2;
        var colors = opts.colors || (opts.theme === 'dark' ? THEMES.dark : THEMES.light);
        var bg = opts.background || colors.background || '#ffffff';
        var text = opts.color || colors.text || '#000000';

        var pretty = JSON.stringify(data, null, indent);
        var inner = colorize(pretty, colors);

        return (
            '<pre style="' +
            'margin:0;' +
            'padding:10px 14px;' +
            'font-family:monospace;' +
            'font-size:12px;' +
            'line-height:1.6;' +
            'white-space:pre;' +
            'overflow:auto;' +
            'background:' +
            bg +
            ';' +
            'color:' +
            text +
            ';' +
            '">' +
            inner +
            '</pre>'
        );
    }

    /* ─── public API ─── */

    /**
     * Render a JS value into a DOM container.
     *
     * @param {*}           data      Any JSON-serialisable value.
     * @param {Element}     container DOM element to write into.
     * @param {object}      [options]
     * @param {number}      [options.indent=2]        Spaces per indent level.
     * @param {'light'|'dark'} [options.theme='light'] Built-in colour theme.
     * @param {object}      [options.colors]          Custom colour overrides:
     *                        { key, string, number, boolean, null, background, color }
     */
    function render(data, container, options) {
        if (!container || typeof container.innerHTML === 'undefined') {
            throw new Error('JsonFormatter.render: `container` must be a DOM element.');
        }
        container.innerHTML = toHTML(data, options);
    }

    /**
     * Parse a JSON string, then render it into a DOM container.
     * Throws a SyntaxError if the string is invalid JSON.
     *
     * @param {string}  jsonString  Raw JSON text.
     * @param {Element} container   DOM element to write into.
     * @param {object}  [options]   Same as `render()`.
     */
    function renderString(jsonString, container, options) {
        var data = JSON.parse(jsonString); // let native error propagate
        render(data, container, options);
    }

    /**
     * Return the highlighted HTML string without touching the DOM.
     * Useful for server-side rendering or custom insertion.
     *
     * @param {*}      data     Any JSON-serialisable value.
     * @param {object} [options] Same as `render()`.
     * @returns {string}
     */
    function toHTMLString(data, options) {
        return toHTML(data, options);
    }

    return {
        render: render,
        renderString: renderString,
        toHTMLString: toHTMLString,
        themes: THEMES,
        VERSION: '1.0.0',
    };
});
