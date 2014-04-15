/*
 2013 http://101.ru
 @version 1.0
 @author Vlasov Alexey <lexa1278@gmail.com> / https://www.facebook.com/vlasovalexey
*/
if ("undefined" == typeof uppod_show_advertasing) var uppod_show_advertasing = !1;
if ("object" != typeof playerAPI || !playerAPI instanceof "object") var playerAPI = {};
playerAPI.Uppod = new function () {
    var c = this,
        b = {}, l = {}, v = !1,
        E = {
            playerid: "",
            swf: "/static/js/uppod/uppod.swf",
            flashVers: "10.0.0",
            width: 200,
            height: 50,
            showPlayer: !1,
            classPlay: "classPlay",
            classStop: "classStop",
            classPause: "classPause",
            element: "",
            heightParent: 18,
            stopEvent: "pause",
            advertising: !1,
            checkplay: !1
        };
    this.swfObj || (this.swfObj = function () {
        function a() {
            if (!A) {
                try {
                    var p = h.getElementsByTagName("body")[0].appendChild(h.createElement("span"));
                    p.parentNode.removeChild(p)
                } catch (a) {
                    return
                }
                A = !0;
                for (var p = H.length,
                        m = 0; m < p; m++) H[m]()
            }
        }

        function b(p) {
            A ? p() : H[H.length] = p
        }

        function c(p) {
            if (typeof r.addEventListener != n) r.addEventListener("load", p, !1);
            else if (typeof h.addEventListener != n) h.addEventListener("load", p, !1);
            else if (typeof r.attachEvent != n) W(r, "onload", p);
            else if ("function" == typeof r.onload) {
                var a = r.onload;
                r.onload = function () {
                    a();
                    p()
                }
            } else r.onload = p
        }

        function k() {
            var p = h.getElementsByTagName("body")[0],
                a = h.createElement(z);
            a.setAttribute("type", I);
            var m = p.appendChild(a);
            if (m) {
                var b = 0;
                (function () {
                    if (typeof m.GetVariable !=
                        n) {
                        var c = m.GetVariable("$version");
                        c && (c = c.split(" ")[1].split(","), f.pv = [parseInt(c[0], 10), parseInt(c[1], 10), parseInt(c[2], 10)])
                    } else if (10 > b) {
                        b++;
                        setTimeout(arguments.callee, 10);
                        return
                    }
                    p.removeChild(a);
                    m = null;
                    g()
                })()
            } else g()
        }

        function g() {
            var p = w.length;
            if (0 < p)
                for (var a = 0; a < p; a++) {
                    var m = w[a].id,
                        b = w[a].callbackFn,
                        c = {
                            success: !1,
                            id: m
                        };
                    if (0 < f.pv[0]) {
                        var d = t(m);
                        if (d)
                            if (!J(w[a].swfVersion) || f.wk && 312 > f.wk)
                                if (w[a].expressInstall && v()) {
                                    c = {};
                                    c.data = w[a].expressInstall;
                                    c.width = d.getAttribute("width") || "0";
                                    c.height = d.getAttribute("height") || "0";
                                    d.getAttribute("class") && (c.styleclass = d.getAttribute("class"));
                                    d.getAttribute("align") && (c.align = d.getAttribute("align"));
                                    for (var e = {}, d = d.getElementsByTagName("param"), h = d.length, g = 0; g < h; g++) "movie" != d[g].getAttribute("name").toLowerCase() && (e[d[g].getAttribute("name")] = d[g].getAttribute("value"));
                                    y(c, e, m, b)
                                } else G(d), b && b(c);
                                else B(m, !0), b && (c.success = !0, c.ref = l(m), b(c))
                    } else B(m, !0), b && ((m = l(m)) && typeof m.SetVariable != n && (c.success = !0, c.ref = m), b(c))
                }
        }

        function l(a) {
            var q =
                null;
            (a = t(a)) && "OBJECT" == a.nodeName && (typeof a.SetVariable != n ? q = a : (a = a.getElementsByTagName(z)[0]) && (q = a));
            return q
        }

        function v() {
            return !K && J("6.0.65") && (f.win || f.mac) && !(f.wk && 312 > f.wk)
        }

        function y(a, q, m, c) {
            K = !0;
            N = c || null;
            Q = {
                success: !1,
                id: m
            };
            var b = t(m);
            if (b) {
                "OBJECT" == b.nodeName ? (F = C(b), L = null) : (F = b, L = m);
                a.id = R;
                if (typeof a.width == n || !/%$/.test(a.width) && 310 > parseInt(a.width, 10)) a.width = "310";
                if (typeof a.height == n || !/%$/.test(a.height) && 137 > parseInt(a.height, 10)) a.height = "137";
                h.title = h.title.slice(0,
                    47) + " - Flash Player Installation";
                c = f.ie && f.win ? "ActiveX" : "PlugIn";
                c = "MMredirectURL=" + r.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + c + "&MMdoctitle=" + h.title;
                q.flashvars = typeof q.flashvars != n ? q.flashvars + ("&" + c) : c;
                f.ie && f.win && 4 != b.readyState && (c = h.createElement("div"), m += "SWFObjectNew", c.setAttribute("id", m), b.parentNode.insertBefore(c, b), b.style.display = "none", function () {
                    4 == b.readyState ? b.parentNode.removeChild(b) : setTimeout(arguments.callee, 10)
                }());
                O(a, q, m)
            }
        }

        function G(a) {
            if (f.ie &&
                f.win && 4 != a.readyState) {
                var q = h.createElement("div");
                a.parentNode.insertBefore(q, a);
                q.parentNode.replaceChild(C(a), q);
                a.style.display = "none";
                (function () {
                    4 == a.readyState ? a.parentNode.removeChild(a) : setTimeout(arguments.callee, 10)
                })()
            } else a.parentNode.replaceChild(C(a), a)
        }

        function C(a) {
            var q = h.createElement("div");
            if (f.win && f.ie) q.innerHTML = a.innerHTML;
            else if (a = a.getElementsByTagName(z)[0])
                if (a = a.childNodes)
                    for (var c = a.length, b = 0; b < c; b++) 1 == a[b].nodeType && "PARAM" == a[b].nodeName || 8 == a[b].nodeType ||
                        q.appendChild(a[b].cloneNode(!0));
            return q
        }

        function O(a, b, c) {
            var d, e = t(c);
            if (f.wk && 312 > f.wk) return d;
            if (e)
                if (typeof a.id == n && (a.id = c), f.ie && f.win) {
                    var g = "",
                        s;
                    for (s in a) a[s] != Object.prototype[s] && ("data" == s.toLowerCase() ? b.movie = a[s] : "styleclass" == s.toLowerCase() ? g += ' class="' + a[s] + '"' : "classid" != s.toLowerCase() && (g += " " + s + '="' + a[s] + '"'));
                    s = "";
                    for (var k in b) b[k] != Object.prototype[k] && (s += '<param name="' + k + '" value="' + b[k] + '" />');
                    e.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' +
                        g + ">" + s + "</object>";
                    M[M.length] = a.id;
                    d = t(a.id)
                } else {
                    k = h.createElement(z);
                    k.setAttribute("type", I);
                    for (var l in a) a[l] != Object.prototype[l] && ("styleclass" == l.toLowerCase() ? k.setAttribute("class", a[l]) : "classid" != l.toLowerCase() && k.setAttribute(l, a[l]));
                    for (g in b) b[g] != Object.prototype[g] && "movie" != g.toLowerCase() && (a = k, s = g, l = b[g], c = h.createElement("param"), c.setAttribute("name", s), c.setAttribute("value", l), a.appendChild(c));
                    e.parentNode.replaceChild(k, e);
                    d = k
                }
            return d
        }

        function E(a) {
            var b = t(a);
            b && "OBJECT" ==
                b.nodeName && (f.ie && f.win ? (b.style.display = "none", function () {
                    if (4 == b.readyState) {
                        var c = t(a);
                        if (c) {
                            for (var d in c) "function" == typeof c[d] && (c[d] = null);
                            c.parentNode.removeChild(c)
                        }
                    } else setTimeout(arguments.callee, 10)
                }()) : b.parentNode.removeChild(b))
        }

        function t(a) {
            var b = null;
            try {
                b = h.getElementById(a)
            } catch (c) {}
            return b
        }

        function W(a, b, c) {
            a.attachEvent(b, c);
            D[D.length] = [a, b, c]
        }

        function J(a) {
            var b = f.pv;
            a = a.split(".");
            a[0] = parseInt(a[0], 10);
            a[1] = parseInt(a[1], 10) || 0;
            a[2] = parseInt(a[2], 10) || 0;
            return b[0] >
                a[0] || b[0] == a[0] && b[1] > a[1] || b[0] == a[0] && b[1] == a[1] && b[2] >= a[2] ? !0 : !1
        }

        function S(a, b, c, d) {
            if (!f.ie || !f.mac) {
                var g = h.getElementsByTagName("head")[0];
                g && (c = c && "string" == typeof c ? c : "screen", d && (P = u = null), u && P == c || (d = h.createElement("style"), d.setAttribute("type", "text/css"), d.setAttribute("media", c), u = g.appendChild(d), f.ie && f.win && typeof h.styleSheets != n && 0 < h.styleSheets.length && (u = h.styleSheets[h.styleSheets.length - 1]), P = c), f.ie && f.win ? u && typeof u.addRule == z && u.addRule(a, b) : u && typeof h.createTextNode !=
                    n && u.appendChild(h.createTextNode(a + " {" + b + "}")))
            }
        }

        function B(a, b) {
            if (T) {
                var c = b ? "visible" : "hidden";
                A && t(a) ? t(a).style.visibility = c : S("#" + a, "visibility:" + c)
            }
        }

        function U(a) {
            return null != /[\\\"<>\.;]/.exec(a) && typeof encodeURIComponent != n ? encodeURIComponent(a) : a
        }
        var n = "undefined",
            z = "object",
            I = "application/x-shockwave-flash",
            R = "SWFObjectExprInst",
            r = window,
            h = document,
            x = navigator,
            V = !1,
            H = [
                function () {
                    V ? k() : g()
                }
            ],
            w = [],
            M = [],
            D = [],
            F, L, N, Q, A = !1,
            K = !1,
            u, P, T = !0,
            f = function () {
                var a = typeof h.getElementById != n && typeof h.getElementsByTagName !=
                    n && typeof h.createElement != n,
                    b = x.userAgent.toLowerCase(),
                    c = x.platform.toLowerCase(),
                    d = c ? /win/.test(c) : /win/.test(b),
                    c = c ? /mac/.test(c) : /mac/.test(b),
                    b = /webkit/.test(b) ? parseFloat(b.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : !1,
                    g = !+"\v1",
                    f = [0, 0, 0],
                    e = null;
                if (typeof x.plugins != n && typeof x.plugins["Shockwave Flash"] == z)!(e = x.plugins["Shockwave Flash"].description) || typeof x.mimeTypes != n && x.mimeTypes[I] && !x.mimeTypes[I].enabledPlugin || (V = !0, g = !1, e = e.replace(/^.*\s+(\S+\s+\S+$)/, "$1"), f[0] = parseInt(e.replace(/^(.*)\..*$/,
                    "$1"), 10), f[1] = parseInt(e.replace(/^.*\.(.*)\s.*$/, "$1"), 10), f[2] = /[a-zA-Z]/.test(e) ? parseInt(e.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0);
                else if (typeof r.ActiveXObject != n) try {
                    var k = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
                    k && (e = k.GetVariable("$version")) && (g = !0, e = e.split(" ")[1].split(","), f = [parseInt(e[0], 10), parseInt(e[1], 10), parseInt(e[2], 10)])
                } catch (l) {}
                return {
                    w3: a,
                    pv: f,
                    wk: b,
                    ie: g,
                    win: d,
                    mac: c
                }
            }();
        (function () {
            f.w3 && ((typeof h.readyState != n && "complete" == h.readyState || typeof h.readyState ==
                n && (h.getElementsByTagName("body")[0] || h.body)) && a(), A || (typeof h.addEventListener != n && h.addEventListener("DOMContentLoaded", a, !1), f.ie && f.win && (h.attachEvent("onreadystatechange", function () {
                "complete" == h.readyState && (h.detachEvent("onreadystatechange", arguments.callee), a())
            }), r == top && function () {
                if (!A) {
                    try {
                        h.documentElement.doScroll("left")
                    } catch (b) {
                        setTimeout(arguments.callee, 0);
                        return
                    }
                    a()
                }
            }()), f.wk && function () {
                A || (/loaded|complete/.test(h.readyState) ? a() : setTimeout(arguments.callee, 0))
            }(), c(a)))
        })();
        (function () {
            f.ie && f.win && window.attachEvent("onunload", function () {
                for (var a = D.length, b = 0; b < a; b++) D[b][0].detachEvent(D[b][1], D[b][2]);
                a = M.length;
                for (b = 0; b < a; b++) E(M[b]);
                for (var c in f) f[c] = null;
                f = null;
                for (var d in swfobject) swfobject[d] = null;
                swfobject = null
            })
        })();
        return {
            registerObject: function (a, b, c, d) {
                if (f.w3 && a && b) {
                    var e = {};
                    e.id = a;
                    e.swfVersion = b;
                    e.expressInstall = c;
                    e.callbackFn = d;
                    w[w.length] = e;
                    B(a, !1)
                } else d && d({
                    success: !1,
                    id: a
                })
            },
            getObjectById: function (a) {
                if (f.w3) return l(a)
            },
            embedSWF: function (a,
                c, e, g, h, k, l, r, t, u) {
                var w = {
                    success: !1,
                    id: c
                };
                f.w3 && !(f.wk && 312 > f.wk) && a && c && e && g && h ? (B(c, !1), b(function () {
                    e += "";
                    g += "";
                    var b = {};
                    if (t && typeof t === z)
                        for (var d in t) b[d] = t[d];
                    b.data = a;
                    b.width = e;
                    b.height = g;
                    d = {};
                    if (r && typeof r === z)
                        for (var f in r) d[f] = r[f];
                    if (l && typeof l === z)
                        for (var x in l) d.flashvars = typeof d.flashvars != n ? d.flashvars + ("&" + x + "=" + l[x]) : x + "=" + l[x];
                    if (J(h)) f = O(b, d, c), b.id == c && B(c, !0), w.success = !0, w.ref = f;
                    else {
                        if (k && v()) {
                            b.data = k;
                            y(b, d, c, u);
                            return
                        }
                        B(c, !0)
                    }
                    u && u(w)
                })) : u && u(w)
            },
            switchOffAutoHideShow: function () {
                T = !1
            },
            ua: f,
            getFlashPlayerVersion: function () {
                return {
                    major: f.pv[0],
                    minor: f.pv[1],
                    release: f.pv[2]
                }
            },
            hasFlashPlayerVersion: J,
            createSWF: function (a, b, c) {
                if (f.w3) return O(a, b, c)
            },
            showExpressInstall: function (a, b, c, d) {
                f.w3 && v() && y(a, b, c, d)
            },
            removeSWF: function (a) {
                f.w3 && E(a)
            },
            createCSS: function (a, b, c, d) {
                f.w3 && S(a, b, c, d)
            },
            addDomLoadEvent: b,
            addLoadEvent: c,
            getQueryParamValue: function (a) {
                var b = h.location.search || h.location.hash;
                if (b) {
                    /\?/.test(b) && (b = b.split("?")[1]);
                    if (null == a) return U(b);
                    for (var b = b.split("&"),
                            c = 0; c < b.length; c++)
                        if (b[c].substring(0, b[c].indexOf("=")) == a) return U(b[c].substring(b[c].indexOf("=") + 1))
                }
                return ""
            },
            expressInstallCallback: function () {
                if (K) {
                    var a = t(R);
                    a && F && (a.parentNode.replaceChild(F, a), L && (B(L, !0), f.ie && f.win && (F.style.display = "block")), N && N(Q));
                    K = !1
                }
            }
        }
    }());
    this.checkFlashPlugin = function () {
        v = !1;
        if ("undefined" != typeof navigator.plugins && "object" == typeof navigator.plugins["Shockwave Flash"]) v = !0;
        else if ("undefined" != typeof window.ActiveXObject) try {
            new ActiveXObject("ShockwaveFlash.ShockwaveFlash") &&
                (v = !0)
        } catch (a) {}
    };
    v = c.checkFlashPlugin();
    this.ShowError = function (a) {
        return !1
    };
    this.AddParamPlayer = function (a, d, e, k) {
        e = c.mergeParams(E, e);
        "undefined" != typeof e.element && "" != e.element && (e.playerid = e.element, jQuery(e.element).live("click", function () {
            var a = jQuery(this).attr("playerid");
            if ("undefined" != typeof a && null != a) {
                if ("undefined" != typeof l[a] && null != l[a]) return c.StopPlayer(a);
                if (!1 === c.CheckAccessPlay(a)) return !1;
                c.StopAllPlayer(a);
                c.PlayerPlay(a);
                return !1
            }!1 == c.CheckUppodObject(a) && "undefined" !=
                typeof l[a] && delete l[a];
            var d = c.getAttributPlayer(this, "setting"),
                e = c.getAttributPlayer(this, "flashvars"),
                k = c.getAttributPlayer(this, "params"),
                v = c.getAttributPlayer(this, "event");
            jQuery(this).attr("playerid", d.playerid).attr("id", "player_" + d.playerid);
            "undefined" == typeof b[a] && c.RecordParam(e, k, d, v);
            c.PlayerPlay(d.playerid);
            return !1
        }));
        return c.RecordParam(a, d, e, k)
    };
    this.getAttributPlayer = function (a, d) {
        var e = jQuery(a).attr("element");
        if ("undefined" == typeof e || null == e) return c.ShowError('Not found attribute "element"');
        if ("undefined" == typeof b[e] || null == b[e]) return c.ShowError('Default settings for element "' + e + '" undefined');
        var k = jQuery(a).attr(d);
        if ("undefined" != k && null != k) try {
            k = jQuery.parseJSON(k), k = c.mergeParams(b[e][d], k)
        } catch (g) {
            c.ShowError('Error parse params "' + d + '" to JSON format'), k = "undefined" != typeof b[e][d] ? b[e][d] : {}
        } else k = b[e][d];
        return k
    };
    this.mergeParams = function (a, b) {
        var c = {};
        jQuery.each(a, function (a, b) {
            c[a] = b
        });
        jQuery.each(b, function (a, b) {
            c[a] = b
        });
        return c
    };
    this.RecordParam = function (a, d, e,
        k) {
        if ("object" == typeof b[e.playerid]) return !0;
        if ("undefined" == typeof e.playerid || null == e.playerid || "" == e.playerid) return c.ShowError('Player ID "' + e.playerid + '" is undefined');
        var g = e.playerid;
        "undefined" == typeof b[g] && (b[g] = {});
        a.uid = g;
        b[g].flashvars = "undefined" == typeof a ? {} : a;
        b[g].params = "undefined" == typeof d ? {} : d;
        b[g].setting = "undefined" == typeof e ? {} : e;
        b[g].event = "undefined" == typeof k ? {} : k;
        return !0
    };
    this.CreatePlayer = function (a) {
        jQuery("#" + a).text("\u0418\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f \u043f\u043b\u0435\u0435\u0440\u0430...");
        if (!1 === v) return jQuery("#" + a).html('\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u0435 <a href="http://get.adobe.com/ru/flashplayer/" target="_blank">Adobe Flash Player</a>'), !1;
        if ("undefined" == typeof b[a]) return c.ShowError('Player "' + a + "\" doesn't have setting");
        try {
            new c.swfObj.embedSWF(b[a].setting.swf, b[a].setting.playerid, b[a].setting.width, b[a].setting.height, b[a].setting.flashVers, !1, b[a].flashvars, b[a].params), b[a].setting.heightParent = jQuery("#" + b[a].setting.playerid).parent().css("height"),
            b[a].setting.heightParent && "0px" != b[a].setting.heightParent || (b[a].setting.heightParent = E.heightParent + "px")
        } catch (d) {
            return c.ShowError('Error create player "' + a + '". ' + d.message)
        }
        return !0
    };
    var G = 0;
    this.ExecuteComandAfterInit = function (a) {
        return 9 < G ? (G = 0, c.ShowError('Init player "' + a + '" is fail')) : !0 !== b[a].setting.init ? (G++, setTimeout(function () {
            c.ExecuteComandAfterInit(a)
        }, 600), !1) : c.PlayerPlay(a)
    };
    this.CheckUppodObject = function (a) {
        for (var c = document.getElementsByTagName("object"), e = 0; e < c.length; e++)
            if (c[e].id ==
                a) return b[a].setting.init = !0;
        return !1
    };
    this.CheckAccessPlay = function (a) {
        return !0 === window.uppod_show_advertasing ? "undefined" != typeof b[a].setting && !0 == b[a].setting.advertising ? !0 : !1 : !0
    };
    this.PlayerPlay = function (a) {
        if ("undefined" == typeof b[a]) return c.ShowError('Player "' + a + '" is undefined');
        if (!1 === c.CheckAccessPlay(a)) return !1;
        if (!1 === c.CheckUppodObject(a)) return c.ShowError('Player "' + a + '" does not exist'), b[a].setting.init = !1, !0 === c.CreatePlayer(a) ? setTimeout(function () {
                c.CheckPlayerPlay(a, 1)
            },
            2E3) : c.ShowError('Error make player with ID "' + a + '"'), !1;
        if (1 == c.uppodGet(a, "getstatus")) return !0;
        !0 === b[a].setting.showPlayer && jQuery("#" + b[a].setting.playerid).css("visibility", "visible").parent().css({
            height: b[a].setting.heightParent
        });
        c.uppodSend(a, "play");
        return !0
    };
    this.StopPlayer = function (a) {
        if (1 > c.uppodGet(a, "getstatus")) return !0;
        !0 === b[a].setting.showPlayer && jQuery("#" + b[a].setting.playerid).css("visibility", "hidden").parent().css({
            height: "0px"
        });
        c.uppodSend(a, "undefined" != typeof b[a].setting.stopEvent ?
            b[a].setting.stopEvent : "stop");
        l[a] = null;
        return !1
    };
    this.StopAllPlayer = function (a) {
        if (1 > l.length) return !0;
        jQuery.each(l, function (b, e) {
            a != b && c.StopPlayer(b)
        });
        return !0
    };
    this.CheckPlayerPlay = function (a, d) {
        if (!1 == b[a].setting.checkplay && 0 == d) return !0;
        if (!1 === c.CheckAccessPlay(a)) return !1;
        if (1 < c.uppodGet(a, "getime")) return !0;
        c.uppodSend(a, "stop");
        sessionStorage.setItem("trycounterstartplayer", "1");
        return c.uppodSend(a, "play")
    };
    this.ChangeIconPlayer = function (a, c) {
        if ("play" == c) jQuery("#player_" + a).addClass(b[a].setting.classStop),
        jQuery("#player_" + a).removeClass(b[a].setting.classPlay);
        else if ("stop" == c || "pause" == c || "end" == c) jQuery("#player_" + a).removeClass(b[a].setting.classStop), jQuery("#player_" + a).addClass(b[a].setting.classPlay)
    };
    this.uppodInit = function (a) {
        b[a].setting.init = !0;
        return !1
    };
    this.uppodSend = function (a, b, e) {
        try {
            document.getElementById(a).sendToUppod(b, e ? e : ""), "play" == b && "function" == typeof sessionStorage.getItem && sessionStorage.removeItem("countreloadpage"), sessionStorage.removeItem("countertrysendcommand")
        } catch (k) {
            if (-1 <
                k.message.indexOf("NPObject") && "function" == typeof sessionStorage.getItem) return c.ShowError("Exeption: " + k.message), !1;
            if ("function" == typeof sessionStorage.getItem || "object" == typeof sessionStorage.getItem) {
                var g = parseInt(sessionStorage.getItem("countertrysendcommand"));
                if (null == g || isNaN(g)) g = 0;
                if (5 < g) return !1;
                g++;
                sessionStorage.setItem("countertrysendcommand", g);
                setTimeout(function () {
                    c.uppodSend(a, b, e)
                }, 1E3)
            }
        }
        return !1
    };
    this.uppodGet = function (a, b, e) {
        try {
            return document.getElementById(a).getUppod(b,
                e ? e : "")
        } catch (k) {
            return c.ShowError(k.message), !1
        }
    };
    this.uppodEvent = function (a, d) {
        c.ShowError(a + ":" + d);
        switch (d) {
        case "init":
            b[a].setting.init = !0;
            break;
        case "start":
            setTimeout(function () {
                c.CheckPlayerPlay(a, 0)
            }, 5E3);
            break;
        case "play":
            l[a] = 1;
            !0 === b[a].setting.showPlayer && jQuery("#" + b[a].setting.playerid).css("visibility", "visible").parent().css({
                height: b[a].setting.heightParent
            });
            c.StopAllPlayer(a);
            break;
        case "pause":
            delete l[a];
            break;
        case "stop":
            !0 === b[a].setting.showPlayer && jQuery("#" + b[a].setting.playerid).css("visibility",
                "hidden").parent().css({
                height: "0px"
            });
            delete l[a];
            break;
        case "end":
            !0 === b[a].setting.showPlayer && jQuery("#" + b[a].setting.playerid).css("visibility", "hidden").parent().css({
                height: "0px"
            });
            delete l[a];
            break;
            break;
        case "volume":
            console.log( 'Uppod' + a );
            break;
        case "error":
            delete l[a], d = "stop"
        }
        if ("function" == typeof b[a].event[d] || "object" == typeof b[a].event[d]) b[a].event[d](a, d, "undefined" == typeof b[a].event.param ? "" : b[a].event.param);
        c.ChangeIconPlayer(a, d);
        return !0
    };
    var y = 0,
        C = 0;
    this.RefreshCountertimer = function () {
        if (0 < y) var a = parseInt(y / 60),
        b = parseInt(y %
            60);
        else b = a = 0;
        10 > b && (b = "0" + b);
        jQuery("#duration").html(a + ":" + b);
        if (0 > y) return clearInterval(C), !1
    };
    this.TitleSong = function (a) {
        clearInterval(C);
        if ("jingle101" == a.module) return jQuery("#titlesong").html("\u041e\u0436\u0438\u0434\u0430\u0435\u043c \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u0442\u0440\u0435\u043a..."), !1;
        jQuery("#titlesong").html(a.title);
        jQuery("#addfavoritetracksfromair").attr("favid", a.id ? a.id : 0).attr("favmodule", a.module ? a.module : "").show();
        y = a.duration;
        0 < y && (C = setInterval(function () {
            y--;
            c.RefreshCountertimer()
        }, 1E3))
    }
};

function uppodGet(c, b) {
    try {
        return document.getElementById(c).getUppod(b)
    } catch (l) {
        playerAPI.Uppod.ShowError(l.message)
    }
}

function uppodInit(c) {
    playerAPI.Uppod.players[c].setting.init = !0
}

function uppodSend(c, b, l) {
    try {
        return document.getElementById(c).sendToUppod(b, l ? l : "")
    } catch (v) {
        playerAPI.Uppod.ShowError(v.message)
    }
}

function uppodEvent(c, b) {
    playerAPI.Uppod.uppodEvent(c, b)
}

function _setTitles(c) {
    playerAPI.Uppod.TitleSong(c)
};