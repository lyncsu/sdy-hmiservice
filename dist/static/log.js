/*!
 * LogPanel.js v1.0.0
 * A draggable, resizable, minimizable/maximizable floating LogPanel console.
 * UMD build — works as <script>, CommonJS, or AMD.
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.LogPanel = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ─── CSS ────────────────────────────────────────────────────────────────────
    var CSS = [
        '.lc-backdrop{}',
        '.lc-win{position:absolute;display:flex;flex-direction:column;background:#0d1117;border-radius:10px;',
        'overflow:hidden;font-family:Menlo,Monaco,"Courier New",monospace;',
        'border:.5px solid rgba(255,255,255,.12);box-shadow:0 8px 32px rgba(0,0,0,.45)}',
        '.lc-win.lc-maximized{border-radius:0!important;box-shadow:none!important}',
        '.lc-win.lc-maximized .lc-rh{display:none}',
        '.lc-titlebar{display:flex;align-items:center;gap:8px;padding:10px 14px;',
        'background:#161b22;border-bottom:.5px solid rgba(255,255,255,.06);',
        'flex-shrink:0;user-select:none;-webkit-user-select:none}',
        '.lc-dot{width:12px;height:12px;border-radius:50%;cursor:pointer;flex-shrink:0;position:relative}',
        '.lc-dot:hover{filter:brightness(1.25)}',
        '.lc-dot-icon{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
        'font-size:8px;opacity:0;transition:opacity .15s;color:rgba(0,0,0,.65);font-weight:700;line-height:1}',
        '.lc-dot:hover .lc-dot-icon{opacity:1}',
        '.lc-title{font-size:13px;color:rgba(255,255,255,.4);margin-left:4px;flex:1;',
        'white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
        '.lc-badge{font-size:11px;padding:2px 8px;border-radius:20px;white-space:nowrap;',
        'background:rgba(30,215,96,.15);color:#1ed760;border:.5px solid rgba(30,215,96,.3)}',
        '.lc-badge.lc-paused{background:rgba(226,179,65,.15);color:#e3b341;border-color:rgba(226,179,65,.3)}',
        '.lc-body{flex:1;display:flex;flex-direction:column;overflow:hidden}',
        '.lc-body.lc-hidden{flex:0;height:0;overflow:hidden;opacity:0;pointer-events:none}',
        '.lc-filterrow{display:flex;gap:6px;align-items:center;padding:7px 14px;',
        'border-bottom:.5px solid rgba(255,255,255,.06);flex-shrink:0}',
        '.lc-search{flex:1;background:rgba(255,255,255,.05);border:.5px solid rgba(255,255,255,.1);',
        'border-radius:6px;padding:4px 10px;font-size:12px;color:rgba(255,255,255,.7);',
        'font-family:inherit;outline:none}',
        '.lc-search:focus{border-color:rgba(88,166,255,.4);background:rgba(88,166,255,.05)}',
        '.lc-search::placeholder{color:rgba(255,255,255,.2)}',
        '.lc-cnt{font-size:11px;color:rgba(255,255,255,.3);white-space:nowrap}',
        '.lc-LogPanelarea{flex:1;overflow-y:auto;padding:8px 0;min-height:0}',
        '.lc-LogPanelarea::-webkit-scrollbar{width:4px}',
        '.lc-LogPanelarea::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}',
        '.lc-row{display:flex;align-items:flex-start;padding:1px 14px;font-size:12px;line-height:1.65}',
        '.lc-row:hover{background:rgba(255,255,255,.03)}',
        '.lc-ts{color:rgba(255,255,255,.22);min-width:86px;user-select:none;flex-shrink:0;font-size:11px}',
        '.lc-lvl{min-width:52px;font-weight:500;flex-shrink:0;text-align:right;padding-right:10px;font-size:11px}',
        '.lc-lvl-INFO{color:#58a6ff}.lc-lvl-WARN{color:#e3b341}.lc-lvl-ERROR{color:#f85149}',
        '.lc-lvl-DEBUG{color:#8b949e}.lc-lvl-SUCCESS{color:#3fb950}',
        '.lc-msg{color:rgba(255,255,255,.75);word-break:break-all}',
        '.lc-cursor{display:inline-block;width:6px;height:12px;background:rgba(255,255,255,.5);',
        'vertical-align:middle;animation:lc-blink 1s step-end infinite;margin-left:2px}',
        '@keyframes lc-blink{0%,100%{opacity:1}50%{opacity:0}}',
        '.lc-speedrow{display:flex;align-items:center;gap:10px;padding:6px 14px;font-size:12px;',
        'color:rgba(255,255,255,.3);flex-shrink:0;border-top:.5px solid rgba(255,255,255,.06)}',
        '.lc-speedrow input[type=range]{flex:1;accent-color:#58a6ff}',
        '.lc-toolbar{display:flex;align-items:center;gap:5px;padding:7px 14px;flex-wrap:wrap;flex-shrink:0;',
        'border-top:.5px solid rgba(255,255,255,.06);background:#161b22}',
        '.lc-btn{font-size:11px;padding:3px 9px;border-radius:5px;border:.5px solid rgba(255,255,255,.15);',
        'background:transparent;color:rgba(255,255,255,.5);cursor:pointer;font-family:inherit;transition:all .15s}',
        '.lc-btn:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.85)}',
        '.lc-btn.lc-active{background:rgba(88,166,255,.15);border-color:rgba(88,166,255,.4);color:#58a6ff}',
        '.lc-btn.lc-danger{border-color:rgba(248,81,73,.3);color:rgba(248,81,73,.7)}',
        '.lc-btn.lc-danger:hover{background:rgba(248,81,73,.1);color:#f85149}',
        '.lc-minbar{display:none;align-items:center;gap:8px;padding:5px 12px;',
        'background:#161b22;border-top:.5px solid rgba(255,255,255,.06);cursor:pointer;flex-shrink:0}',
        '.lc-minbar:hover{background:rgba(255,255,255,.04)}',
        '.lc-minbar span{font-size:12px;color:rgba(255,255,255,.35)}',
        '.lc-minbadge{font-size:11px;padding:1px 7px;border-radius:20px;',
        'background:rgba(88,166,255,.15);color:#58a6ff;border:.5px solid rgba(88,166,255,.3)}',
        '.lc-rh{position:absolute;z-index:10}',
        '.lc-rh-n{top:0;left:8px;right:8px;height:5px;cursor:n-resize}',
        '.lc-rh-s{bottom:0;left:8px;right:8px;height:5px;cursor:s-resize}',
        '.lc-rh-e{right:0;top:8px;bottom:8px;width:5px;cursor:e-resize}',
        '.lc-rh-w{left:0;top:8px;bottom:8px;width:5px;cursor:w-resize}',
        '.lc-rh-nw{top:0;left:0;width:12px;height:12px;cursor:nw-resize}',
        '.lc-rh-ne{top:0;right:0;width:12px;height:12px;cursor:ne-resize}',
        '.lc-rh-sw{bottom:0;left:0;width:12px;height:12px;cursor:sw-resize}',
        '.lc-rh-se{bottom:0;right:0;width:12px;height:12px;cursor:se-resize}',
    ].join('');

    var LEVELS = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'SUCCESS'];
    var TITLEBAR_H = 36;

    // ─── inject styles once ─────────────────────────────────────────────────────
    var _styleInjected = false;
    function injectStyles() {
        if (_styleInjected) return;
        var el = document.createElement('style');
        el.textContent = CSS;
        document.head.appendChild(el);
        _styleInjected = true;
    }

    // ─── helpers ────────────────────────────────────────────────────────────────
    function el(tag, cls, extra) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (extra) Object.assign(e, extra);
        return e;
    }
    function ts() {
        var n = new Date();
        return n.toTimeString().slice(0, 8) + '.' + String(n.getMilliseconds()).padStart(3, '0');
    }

    // ─── LogPanel constructor ─────────────────────────────────────────────────
    /**
     * @param {HTMLElement|string} container  mount target or CSS selector
     * @param {object}             [opts]
     * @param {number}  opts.backdropHeight   px height of the backdrop (default 560)
     * @param {number}  opts.x                initial left (default 30)
     * @param {number}  opts.y                initial top  (default 30)
     * @param {number}  opts.width            initial width (default 520)
     * @param {number}  opts.height           initial height (default 360)
     * @param {string}  opts.title            window title (default 'LogPanel')
     * @param {boolean} opts.toolbar          show filter toolbar (default true)
     * @param {boolean} opts.speedControl     show speed slider (default true)
     * @param {number}  opts.maxLines         max retained LogPanel entries (default 2000)
     */
    function LogPanel(container, opts) {
        if (typeof container === 'string') container = document.querySelector(container);
        if (!container) throw new Error('LogPanel: invalid container');

        injectStyles();
        opts = Object.assign(
            {
                backdropHeight: 560,
                x: window.innerWidth - 520 - 40,
                y: 25,
                width: 520,
                height: 360,
                title: '实时日志',
                toolbar: true,
                speedControl: false,
                maxLines: 2000,
            },
            opts || {},
        );

        this._opts = opts;
        this._LogPanels = [];
        this._filter = 'ALL';
        this._query = '';
        this._minimized = false;
        this._maximized = false;
        this._prevRect = null;
        this._listeners = {};

        this._build(container);
    }

    LogPanel.prototype._build = function (container) {
        var self = this,
            o = this._opts;

        // backdrop
        var bd = el('div', 'lc-backdrop');
        bd.style.height = o.backdropHeight + 'px';
        container.appendChild(bd);
        this._backdrop = bd;

        // window
        var win = el('div', 'lc-win');
        Object.assign(win.style, {
            left: o.x + 'px',
            top: o.y + 'px',
            width: o.width + 'px',
            height: o.height + 'px',
        });
        bd.appendChild(win);
        this._win = win;

        // resize handles
        ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].forEach(function (d) {
            var rh = el('div', 'lc-rh lc-rh-' + d);
            rh.dataset.dir = d;
            win.appendChild(rh);
        });
        this._initResize();

        // titlebar
        var tb = el('div', 'lc-titlebar');
        this._titlebar = tb;

        var dotRed = this._makeDot('#ff5f57', '✕', function () {
            self.destroy();
        });
        var dotYellow = this._makeDot('#febc2e', '—', function () {
            self.toggleMin();
        });
        var dotGreen = this._makeDot('#28c840', '+', function () {
            self.toggleMax();
        });
        this._maxIcon = dotGreen.querySelector('.lc-dot-icon');

        tb.appendChild(dotRed);
        tb.appendChild(dotYellow);
        tb.appendChild(dotGreen);

        var titleEl = el('span', 'lc-title');
        titleEl.textContent = o.title;
        this._titleEl = titleEl;
        tb.appendChild(titleEl);

        var badge = el('span', 'lc-badge');
        badge.textContent = '● 运行中';
        this._badge = badge;
        tb.appendChild(badge);

        win.appendChild(tb);
        this._initDrag();

        // body
        var body = el('div', 'lc-body');
        this._body = body;

        // filter row
        var fr = el('div', 'lc-filterrow');
        var search = el('input', 'lc-search');
        search.placeholder = '搜索消息...';
        search.addEventListener('input', function () {
            self._query = search.value.toLowerCase();
            self._render();
        });
        this._search = search;
        var cnt = el('span', 'lc-cnt');
        cnt.textContent = '0 条';
        this._cnt = cnt;
        fr.appendChild(search);
        fr.appendChild(cnt);
        body.appendChild(fr);

        // LogPanel area
        var la = el('div', 'lc-LogPanelarea');
        this._LogPanelarea = la;
        body.appendChild(la);

        // speed control
        if (o.speedControl) {
            var sr = el('div', 'lc-speedrow');
            sr.innerHTML = '<span>速度</span>';
            var slider = el('input');
            slider.type = 'range';
            slider.min = 200;
            slider.max = 5000;
            slider.value = 1000;
            slider.step = 100;
            var sliderLbl = el('span');
            sliderLbl.textContent = '1.0s';
            slider.addEventListener('input', function () {
                sliderLbl.textContent = (slider.value / 1000).toFixed(1) + 's';
                self._emit('speedChange', parseInt(slider.value));
            });
            this._slider = slider;
            sr.appendChild(slider);
            sr.appendChild(sliderLbl);
            body.appendChild(sr);
        }

        // toolbar
        if (o.toolbar) {
            var toolbar = el('div', 'lc-toolbar');
            var filterBtns = {};
            var allBtn = this._makeBtn('全部', true, function () {
                self._setFilter('ALL', allBtn, filterBtns);
            });
            filterBtns['ALL'] = allBtn;
            toolbar.appendChild(allBtn);

            LEVELS.forEach(function (lvl) {
                var btn = self._makeBtn(lvl, false, function () {
                    self._setFilter(lvl, btn, filterBtns);
                });
                filterBtns[lvl] = btn;
                toolbar.appendChild(btn);
            });

            // var pauseBtn = this._makeBtn('⏸ 暂停', false, function () {
            //     self.togglePause();
            // });
            // this._pauseBtn = pauseBtn;
            // toolbar.appendChild(pauseBtn);

            toolbar.appendChild(
                this._makeBtn('↓ 底部', false, function () {
                    self.scrollToBottom();
                }),
            );

            toolbar.appendChild(
                this._makeBtn(
                    '清空',
                    false,
                    function () {
                        self.clear();
                    },
                    true,
                ),
            );

            this._filterBtns = filterBtns;
            body.appendChild(toolbar);
        }

        win.appendChild(body);

        // minimized bar
        var minbar = el('div', 'lc-minbar');
        var mbTitle = el('span');
        mbTitle.textContent = o.title;
        var mbBadge = el('span', 'lc-minbadge');
        mbBadge.textContent = '0 条';
        this._minBadge = mbBadge;
        var mbHint = el('span');
        mbHint.textContent = '点击展开 ↑';
        mbHint.style.cssText = 'margin-left:auto;font-size:11px;color:rgba(255,255,255,.25)';
        minbar.appendChild(mbTitle);
        minbar.appendChild(mbBadge);
        minbar.appendChild(mbHint);
        minbar.addEventListener('click', function () {
            self.toggleMin();
        });
        this._minbar = minbar;
        win.appendChild(minbar);
    };

    LogPanel.prototype._makeDot = function (color, icon, onClick) {
        var dot = el('div', 'lc-dot');
        dot.style.background = color;
        var ic = el('span', 'lc-dot-icon');
        ic.textContent = icon;
        dot.appendChild(ic);
        dot.addEventListener('click', onClick);
        return dot;
    };

    LogPanel.prototype._makeBtn = function (label, active, onClick, danger) {
        var btn = el('button', 'lc-btn' + (active ? ' lc-active' : '') + (danger ? ' lc-danger' : ''));
        btn.textContent = label;
        btn.addEventListener('click', onClick);
        return btn;
    };

    LogPanel.prototype._setFilter = function (lvl, btn, all) {
        this._filter = lvl;
        Object.values(all).forEach(function (b) {
            b.classList.remove('lc-active');
        });
        btn.classList.add('lc-active');
        this._render();
    };

    // ─── drag to move ────────────────────────────────────────────────────────────
    LogPanel.prototype._initDrag = function () {
        var self = this,
            tb = this._titlebar;
        var drag = false,
            dsx,
            dsy,
            dsl,
            dst;

        tb.addEventListener('mousedown', function (e) {
            if (e.target.closest('.lc-dot')) return;
            if (self._maximized || self._minimized) return;
            e.preventDefault();
            drag = true;
            dsx = e.clientX;
            dsy = e.clientY;
            dsl = self._win.offsetLeft;
            dst = self._win.offsetTop;
            tb.classList.add('lc-dragging');
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });

        tb.addEventListener('dblclick', function (e) {
            if (e.target.closest('.lc-dot')) return;
            self.toggleMax();
        });

        function move(e) {
            if (!drag) return;
            var bw = self._backdrop.offsetWidth,
                bh = self._backdrop.offsetHeight;
            var nx = Math.max(0, Math.min(dsl + e.clientX - dsx, bw - self._win.offsetWidth));
            var ny = Math.max(0, Math.min(dst + e.clientY - dsy, bh - TITLEBAR_H));
            self._win.style.left = nx + 'px';
            self._win.style.top = ny + 'px';
        }
        function up() {
            drag = false;
            tb.classList.remove('lc-dragging');
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
        }
    };

    // ─── resize handles ──────────────────────────────────────────────────────────
    LogPanel.prototype._initResize = function () {
        var self = this,
            win = this._win;
        var MIN_W = 280,
            MIN_H = 160;

        win.querySelectorAll('.lc-rh').forEach(function (rh) {
            var dir, rsx, rsy, rsl, rst, rsw, rsh;
            rh.addEventListener('mousedown', function (e) {
                e.preventDefault();
                e.stopPropagation();
                dir = rh.dataset.dir;
                rsx = e.clientX;
                rsy = e.clientY;
                rsl = win.offsetLeft;
                rst = win.offsetTop;
                rsw = win.offsetWidth;
                rsh = win.offsetHeight;
                document.addEventListener('mousemove', move);
                document.addEventListener('mouseup', up);
            });

            function move(e) {
                var bw = self._backdrop.offsetWidth,
                    bh = self._backdrop.offsetHeight;
                var dx = e.clientX - rsx,
                    dy = e.clientY - rsy;
                var l = rsl,
                    t = rst,
                    w = rsw,
                    h = rsh;
                if (dir.includes('e')) w = Math.max(MIN_W, Math.min(rsw + dx, bw - l));
                if (dir.includes('s')) h = Math.max(MIN_H, Math.min(rsh + dy, bh - t));
                if (dir.includes('w')) {
                    var nw = Math.max(MIN_W, Math.min(rsw - dx, rsl + rsw));
                    l = rsl + rsw - nw;
                    w = nw;
                }
                if (dir.includes('n')) {
                    var nh = Math.max(MIN_H, Math.min(rsh - dy, rst + rsh));
                    t = rst + rsh - nh;
                    h = nh;
                }
                win.style.left = l + 'px';
                win.style.top = t + 'px';
                win.style.width = w + 'px';
                win.style.height = h + 'px';
            }
            function up() {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            }
        });
    };

    // ─── window state ────────────────────────────────────────────────────────────
    LogPanel.prototype.toggleMax = function () {
        if (this._minimized) return;
        this._maximized = !this._maximized;
        var win = this._win,
            bd = this._backdrop;
        if (this._maximized) {
            this._prevRect = { l: win.offsetLeft, t: win.offsetTop, w: win.offsetWidth, h: win.offsetHeight };
            this._applyRect(0, 0, bd.offsetWidth, bd.offsetHeight, true);
            win.classList.add('lc-maximized');
            win.style.borderRadius = '0';
        } else {
            var r = this._prevRect;
            this._applyRect(r.l, r.t, r.w, r.h, true);
            win.classList.remove('lc-maximized');
            win.style.borderRadius = '10px';
        }
        this._maxIcon.textContent = this._maximized ? '⤡' : '+';
        this._emit('maximize', this._maximized);
    };

    LogPanel.prototype.toggleMin = function () {
        this._minimized = !this._minimized;
        if (this._minimized && this._maximized) {
            this._maximized = false;
            this._win.classList.remove('lc-maximized');
        }
        this._body.classList.toggle('lc-hidden', this._minimized);
        this._minbar.style.display = this._minimized ? 'flex' : 'none';
        this._titleEl.textContent = this._minimized ? this._opts.title : this._opts.title;
        this._emit('minimize', this._minimized);
    };

    LogPanel.prototype.togglePause = function () {
        this._paused = !this._paused;
        if (this._pauseBtn) {
            this._pauseBtn.textContent = this._paused ? '▶ 继续' : '⏸ 暂停';
            this._pauseBtn.classList.toggle('lc-active', this._paused);
        }
        this._badge.textContent = this._paused ? '● 已暂停' : '● 运行中';
        this._badge.classList.toggle('lc-paused', this._paused);
        this._emit('pause', this._paused);
    };

    LogPanel.prototype._applyRect = function (l, t, w, h, animate) {
        var win = this._win;
        if (animate) win.style.transition = 'left .2s,top .2s,width .2s,height .2s';
        win.style.left = l + 'px';
        win.style.top = t + 'px';
        win.style.width = w + 'px';
        win.style.height = h + 'px';
        if (animate)
            setTimeout(function () {
                win.style.transition = '';
            }, 220);
    };

    // ─── LogPanel API ─────────────────────────────────────────────────────────────────
    /**
     * Append a LogPanel entry.
     * @param {string} level   INFO | WARN | ERROR | DEBUG | SUCCESS
     * @param {string} message LogPanel text
     */
    LogPanel.prototype.log = function (message, level) {
        level = (level || 'INFO').toUpperCase();
        if (LEVELS.indexOf(level) === -1) level = 'INFO';
        this._LogPanels.push({ lvl: level, msg: String(message), time: ts() });
        if (this._LogPanels.length > this._opts.maxLines) this._LogPanels.shift();
        this._render();
        this._emit('LogPanel', { level: level, message: message });
        return this;
    };

    // Shorthand helpers
    ['info', 'warn', 'error', 'debug', 'success'].forEach(function (lvl) {
        LogPanel.prototype[lvl] = function (msg) {
            return this.LogPanel(lvl.toUpperCase(), msg);
        };
    });

    LogPanel.prototype.clear = function () {
        this._LogPanels = [];
        this._render();
        this._emit('clear');
        return this;
    };

    LogPanel.prototype.scrollToBottom = function () {
        this._LogPanelarea.scrollTop = this._LogPanelarea.scrollHeight;
        return this;
    };

    LogPanel.prototype._render = function () {
        var self = this;
        var q = this._query;
        var f = this._filter;
        var filtered = this._LogPanels.filter(function (l) {
            if (f !== 'ALL' && l.lvl !== f) return false;
            if (q && l.msg.toLowerCase().indexOf(q) === -1 && l.lvl.toLowerCase().indexOf(q) === -1) return false;
            return true;
        });
        var total = filtered.length;
        this._cnt.textContent = total + ' 条';
        if (this._minBadge) this._minBadge.textContent = total + ' 条';

        this._LogPanelarea.innerHTML = '';
        filtered.forEach(function (l, i) {
            var row = el('div', 'lc-row');
            var isLast = i === filtered.length - 1;
            var tsEl = el('span', 'lc-ts');
            tsEl.textContent = l.time;
            var lvlEl = el('span', 'lc-lvl lc-lvl-' + l.lvl);
            lvlEl.textContent = l.lvl;
            var msgEl = el('span', 'lc-msg');
            msgEl.textContent = l.msg;
            if (isLast) {
                var cur = el('span', 'lc-cursor');
                msgEl.appendChild(cur);
            }
            row.appendChild(tsEl);
            row.appendChild(lvlEl);
            row.appendChild(msgEl);
            self._LogPanelarea.appendChild(row);
        });
        this._LogPanelarea.scrollTop = this._LogPanelarea.scrollHeight;
    };

    // ─── event emitter ───────────────────────────────────────────────────────────
    LogPanel.prototype.on = function (event, fn) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
        return this;
    };
    LogPanel.prototype.off = function (event, fn) {
        if (!this._listeners[event]) return this;
        this._listeners[event] = this._listeners[event].filter(function (f) {
            return f !== fn;
        });
        return this;
    };
    LogPanel.prototype._emit = function (event, data) {
        var fns = this._listeners[event] || [];
        fns.forEach(function (fn) {
            fn(data);
        });
    };

    // ─── destroy ─────────────────────────────────────────────────────────────────
    LogPanel.prototype.destroy = function () {
        this._backdrop.remove();
        this._emit('destroy');
        this._listeners = {};
    };

    return LogPanel;
});
