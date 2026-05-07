var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __toCommonJS = (from) => {
  var entry = (__moduleCache ??= new WeakMap).get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function") {
    for (var key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(entry, key))
        __defProp(entry, key, {
          get: __accessProp.bind(from, key),
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  __moduleCache.set(from, entry);
  return entry;
};
var __moduleCache;
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res2) => () => (fn && (res2 = fn(fn = 0)), res2);

// node_modules/google-tts-api/dist/assertInputTypes.js
var require_assertInputTypes = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var assertInputTypes = function(text2, lang2, slow2, host2) {
    if (typeof text2 !== "string" || text2.length === 0) {
      throw new TypeError("text should be a string");
    }
    if (typeof lang2 !== "string" || lang2.length === 0) {
      throw new TypeError("lang should be a string");
    }
    if (typeof slow2 !== "boolean") {
      throw new TypeError("slow should be a boolean");
    }
    if (typeof host2 !== "string" || host2.length === 0) {
      throw new TypeError("host should be a string");
    }
  };
  exports.default = assertInputTypes;
});

// node_modules/google-tts-api/dist/splitLongText.js
var require_splitLongText = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  var SPACE_REGEX = "\\s\\uFEFF\\xA0";
  var DEFAULT_PUNCTUATION_REGEX = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
  var splitLongText = function(text2, _a2) {
    var _b2 = _a2 === undefined ? {} : _a2, _c2 = _b2.maxLength, maxLength = _c2 === undefined ? 200 : _c2, _d2 = _b2.splitPunct, splitPunct = _d2 === undefined ? "" : _d2;
    var isSpaceOrPunct = function(s, i) {
      var regex = new RegExp("[" + SPACE_REGEX + DEFAULT_PUNCTUATION_REGEX + splitPunct + "]");
      return regex.test(s.charAt(i));
    };
    var lastIndexOfSpaceOrPunct = function(s, left, right) {
      for (var i = right;i >= left; i--) {
        if (isSpaceOrPunct(s, i))
          return i;
      }
      return -1;
    };
    var result2 = [];
    var addResult = function(text3, start2, end2) {
      result2.push(text3.slice(start2, end2 + 1));
    };
    var start = 0;
    for (;; ) {
      if (text2.length - start <= maxLength) {
        addResult(text2, start, text2.length - 1);
        break;
      }
      var end = start + maxLength - 1;
      if (isSpaceOrPunct(text2, end) || isSpaceOrPunct(text2, end + 1)) {
        addResult(text2, start, end);
        start = end + 1;
        continue;
      }
      end = lastIndexOfSpaceOrPunct(text2, start, end);
      if (end === -1) {
        var str = text2.slice(start, start + maxLength);
        throw new Error("The word is too long to split into a short text:" + (`
` + str + " ...") + `

Try the option "splitPunct" to split the text by punctuation.`);
      }
      addResult(text2, start, end);
      start = end + 1;
    }
    return result2;
  };
  exports.default = splitLongText;
});

// node:url
var exports_url = {};
__export(exports_url, {
  resolveObject: () => urlResolveObject,
  resolve: () => urlResolve,
  parse: () => urlParse,
  format: () => urlFormat,
  default: () => url_default,
  Url: () => Url,
  URLSearchParams: () => URLSearchParams2,
  URL: () => URL
});
function util_isString(arg) {
  return typeof arg === "string";
}
function util_isObject(arg) {
  return typeof arg === "object" && arg !== null;
}
function util_isNull(arg) {
  return arg === null;
}
function util_isNullOrUndefined(arg) {
  return arg == null;
}
function Url() {
  this.protocol = null, this.slashes = null, this.auth = null, this.host = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.query = null, this.pathname = null, this.path = null, this.href = null;
}
function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util_isObject(url) && url instanceof Url)
    return url;
  var u = new Url;
  return u.parse(url, parseQueryString, slashesDenoteHost), u;
}
function urlFormat(obj) {
  if (util_isString(obj))
    obj = urlParse(obj);
  if (!(obj instanceof Url))
    return Url.prototype.format.call(obj);
  return obj.format();
}
function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}
function urlResolveObject(source, relative) {
  if (!source)
    return relative;
  return urlParse(source, false, true).resolveObject(relative);
}
var URL, URLSearchParams2, protocolPattern, portPattern, simplePathPattern, delims, unwise, autoEscape, nonHostChars, hostEndingChars, hostnameMaxLen = 255, hostnamePartPattern, hostnamePartStart, unsafeProtocol, hostlessProtocol, slashedProtocol, querystring, url_default;
var init_url = __esm(() => {
  ({ URL, URLSearchParams: URLSearchParams2 } = globalThis);
  protocolPattern = /^([a-z0-9.+-]+:)/i;
  portPattern = /:[0-9]*$/;
  simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
  delims = ["<", ">", '"', "`", " ", "\r", `
`, "\t"];
  unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims);
  autoEscape = ["'"].concat(unwise);
  nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape);
  hostEndingChars = ["/", "?", "#"];
  hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
  hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
  unsafeProtocol = { javascript: true, "javascript:": true };
  hostlessProtocol = { javascript: true, "javascript:": true };
  slashedProtocol = { http: true, https: true, ftp: true, gopher: true, file: true, "http:": true, "https:": true, "ftp:": true, "gopher:": true, "file:": true };
  querystring = { parse(str) {
    var decode = decodeURIComponent;
    return (str + "").replace(/\+/g, " ").split("&").filter(Boolean).reduce(function(obj, item, index) {
      var ref = item.split("="), key = decode(ref[0] || ""), val = decode(ref[1] || ""), prev = obj[key];
      return obj[key] = prev === undefined ? val : [].concat(prev, val), obj;
    }, {});
  }, stringify(obj) {
    var encode = encodeURIComponent;
    return Object.keys(obj || {}).reduce(function(arr, key) {
      return [].concat(obj[key]).forEach(function(v) {
        arr.push(encode(key) + "=" + encode(v));
      }), arr;
    }, []).join("&").replace(/\s/g, "+");
  } };
  Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
    if (!util_isString(url))
      throw TypeError("Parameter 'url' must be a string, not " + typeof url);
    var queryIndex = url.indexOf("?"), splitter = queryIndex !== -1 && queryIndex < url.indexOf("#") ? "?" : "#", uSplit = url.split(splitter), slashRegex = /\\/g;
    uSplit[0] = uSplit[0].replace(slashRegex, "/"), url = uSplit.join(splitter);
    var rest = url;
    if (rest = rest.trim(), !slashesDenoteHost && url.split("#").length === 1) {
      var simplePath = simplePathPattern.exec(rest);
      if (simplePath) {
        if (this.path = rest, this.href = rest, this.pathname = simplePath[1], simplePath[2])
          if (this.search = simplePath[2], parseQueryString)
            this.query = querystring.parse(this.search.substr(1));
          else
            this.query = this.search.substr(1);
        else if (parseQueryString)
          this.search = "", this.query = {};
        return this;
      }
    }
    var proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      var lowerProto = proto.toLowerCase();
      this.protocol = lowerProto, rest = rest.substr(proto.length);
    }
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      var slashes = rest.substr(0, 2) === "//";
      if (slashes && !(proto && hostlessProtocol[proto]))
        rest = rest.substr(2), this.slashes = true;
    }
    if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
      var hostEnd = -1;
      for (var i = 0;i < hostEndingChars.length; i++) {
        var hec = rest.indexOf(hostEndingChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
          hostEnd = hec;
      }
      var auth, atSign;
      if (hostEnd === -1)
        atSign = rest.lastIndexOf("@");
      else
        atSign = rest.lastIndexOf("@", hostEnd);
      if (atSign !== -1)
        auth = rest.slice(0, atSign), rest = rest.slice(atSign + 1), this.auth = decodeURIComponent(auth);
      hostEnd = -1;
      for (var i = 0;i < nonHostChars.length; i++) {
        var hec = rest.indexOf(nonHostChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
          hostEnd = hec;
      }
      if (hostEnd === -1)
        hostEnd = rest.length;
      this.host = rest.slice(0, hostEnd), rest = rest.slice(hostEnd), this.parseHost(), this.hostname = this.hostname || "";
      var ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
      if (!ipv6Hostname) {
        var hostparts = this.hostname.split(/\./);
        for (var i = 0, l = hostparts.length;i < l; i++) {
          var part = hostparts[i];
          if (!part)
            continue;
          if (!part.match(hostnamePartPattern)) {
            var newpart = "";
            for (var j = 0, k = part.length;j < k; j++)
              if (part.charCodeAt(j) > 127)
                newpart += "x";
              else
                newpart += part[j];
            if (!newpart.match(hostnamePartPattern)) {
              var validParts = hostparts.slice(0, i), notHost = hostparts.slice(i + 1), bit = part.match(hostnamePartStart);
              if (bit)
                validParts.push(bit[1]), notHost.unshift(bit[2]);
              if (notHost.length)
                rest = "/" + notHost.join(".") + rest;
              this.hostname = validParts.join(".");
              break;
            }
          }
        }
      }
      if (this.hostname.length > hostnameMaxLen)
        this.hostname = "";
      else
        this.hostname = this.hostname.toLowerCase();
      if (!ipv6Hostname)
        this.hostname = new URL(`https://${this.hostname}`).hostname;
      var p = this.port ? ":" + this.port : "", h = this.hostname || "";
      if (this.host = h + p, this.href += this.host, ipv6Hostname) {
        if (this.hostname = this.hostname.substr(1, this.hostname.length - 2), rest[0] !== "/")
          rest = "/" + rest;
      }
    }
    if (!unsafeProtocol[lowerProto])
      for (var i = 0, l = autoEscape.length;i < l; i++) {
        var ae = autoEscape[i];
        if (rest.indexOf(ae) === -1)
          continue;
        var esc = encodeURIComponent(ae);
        if (esc === ae)
          esc = escape(ae);
        rest = rest.split(ae).join(esc);
      }
    var hash = rest.indexOf("#");
    if (hash !== -1)
      this.hash = rest.substr(hash), rest = rest.slice(0, hash);
    var qm = rest.indexOf("?");
    if (qm !== -1) {
      if (this.search = rest.substr(qm), this.query = rest.substr(qm + 1), parseQueryString)
        this.query = querystring.parse(this.query);
      rest = rest.slice(0, qm);
    } else if (parseQueryString)
      this.search = "", this.query = {};
    if (rest)
      this.pathname = rest;
    if (slashedProtocol[lowerProto] && this.hostname && !this.pathname)
      this.pathname = "/";
    if (this.pathname || this.search) {
      var p = this.pathname || "", s = this.search || "";
      this.path = p + s;
    }
    return this.href = this.format(), this;
  };
  Url.prototype.format = function() {
    var auth = this.auth || "";
    if (auth)
      auth = encodeURIComponent(auth), auth = auth.replace(/%3A/i, ":"), auth += "@";
    var protocol = this.protocol || "", pathname = this.pathname || "", hash = this.hash || "", host2 = false, query = "";
    if (this.host)
      host2 = auth + this.host;
    else if (this.hostname) {
      if (host2 = auth + (this.hostname.indexOf(":") === -1 ? this.hostname : "[" + this.hostname + "]"), this.port)
        host2 += ":" + this.port;
    }
    if (this.query && util_isObject(this.query) && Object.keys(this.query).length)
      query = querystring.stringify(this.query);
    var search = this.search || query && "?" + query || "";
    if (protocol && protocol.substr(-1) !== ":")
      protocol += ":";
    if (this.slashes || (!protocol || slashedProtocol[protocol]) && host2 !== false) {
      if (host2 = "//" + (host2 || ""), pathname && pathname.charAt(0) !== "/")
        pathname = "/" + pathname;
    } else if (!host2)
      host2 = "";
    if (hash && hash.charAt(0) !== "#")
      hash = "#" + hash;
    if (search && search.charAt(0) !== "?")
      search = "?" + search;
    return pathname = pathname.replace(/[?#]/g, function(match) {
      return encodeURIComponent(match);
    }), search = search.replace("#", "%23"), protocol + host2 + pathname + search + hash;
  };
  Url.prototype.resolve = function(relative) {
    return this.resolveObject(urlParse(relative, false, true)).format();
  };
  Url.prototype.resolveObject = function(relative) {
    if (util_isString(relative)) {
      var rel = new Url;
      rel.parse(relative, false, true), relative = rel;
    }
    var result2 = new Url, tkeys = Object.keys(this);
    for (var tk = 0;tk < tkeys.length; tk++) {
      var tkey = tkeys[tk];
      result2[tkey] = this[tkey];
    }
    if (result2.hash = relative.hash, relative.href === "")
      return result2.href = result2.format(), result2;
    if (relative.slashes && !relative.protocol) {
      var rkeys = Object.keys(relative);
      for (var rk = 0;rk < rkeys.length; rk++) {
        var rkey = rkeys[rk];
        if (rkey !== "protocol")
          result2[rkey] = relative[rkey];
      }
      if (slashedProtocol[result2.protocol] && result2.hostname && !result2.pathname)
        result2.path = result2.pathname = "/";
      return result2.href = result2.format(), result2;
    }
    if (relative.protocol && relative.protocol !== result2.protocol) {
      if (!slashedProtocol[relative.protocol]) {
        var keys = Object.keys(relative);
        for (var v = 0;v < keys.length; v++) {
          var k = keys[v];
          result2[k] = relative[k];
        }
        return result2.href = result2.format(), result2;
      }
      if (result2.protocol = relative.protocol, !relative.host && !hostlessProtocol[relative.protocol]) {
        var relPath = (relative.pathname || "").split("/");
        while (relPath.length && !(relative.host = relPath.shift()))
          ;
        if (!relative.host)
          relative.host = "";
        if (!relative.hostname)
          relative.hostname = "";
        if (relPath[0] !== "")
          relPath.unshift("");
        if (relPath.length < 2)
          relPath.unshift("");
        result2.pathname = relPath.join("/");
      } else
        result2.pathname = relative.pathname;
      if (result2.search = relative.search, result2.query = relative.query, result2.host = relative.host || "", result2.auth = relative.auth, result2.hostname = relative.hostname || relative.host, result2.port = relative.port, result2.pathname || result2.search) {
        var p = result2.pathname || "", s = result2.search || "";
        result2.path = p + s;
      }
      return result2.slashes = result2.slashes || relative.slashes, result2.href = result2.format(), result2;
    }
    var isSourceAbs = result2.pathname && result2.pathname.charAt(0) === "/", isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === "/", mustEndAbs = isRelAbs || isSourceAbs || result2.host && relative.pathname, removeAllDots = mustEndAbs, srcPath = result2.pathname && result2.pathname.split("/") || [], relPath = relative.pathname && relative.pathname.split("/") || [], psychotic = result2.protocol && !slashedProtocol[result2.protocol];
    if (psychotic) {
      if (result2.hostname = "", result2.port = null, result2.host)
        if (srcPath[0] === "")
          srcPath[0] = result2.host;
        else
          srcPath.unshift(result2.host);
      if (result2.host = "", relative.protocol) {
        if (relative.hostname = null, relative.port = null, relative.host)
          if (relPath[0] === "")
            relPath[0] = relative.host;
          else
            relPath.unshift(relative.host);
        relative.host = null;
      }
      mustEndAbs = mustEndAbs && (relPath[0] === "" || srcPath[0] === "");
    }
    if (isRelAbs)
      result2.host = relative.host || relative.host === "" ? relative.host : result2.host, result2.hostname = relative.hostname || relative.hostname === "" ? relative.hostname : result2.hostname, result2.search = relative.search, result2.query = relative.query, srcPath = relPath;
    else if (relPath.length) {
      if (!srcPath)
        srcPath = [];
      srcPath.pop(), srcPath = srcPath.concat(relPath), result2.search = relative.search, result2.query = relative.query;
    } else if (!util_isNullOrUndefined(relative.search)) {
      if (psychotic) {
        result2.hostname = result2.host = srcPath.shift();
        var authInHost = result2.host && result2.host.indexOf("@") > 0 ? result2.host.split("@") : false;
        if (authInHost)
          result2.auth = authInHost.shift(), result2.host = result2.hostname = authInHost.shift();
      }
      if (result2.search = relative.search, result2.query = relative.query, !util_isNull(result2.pathname) || !util_isNull(result2.search))
        result2.path = (result2.pathname ? result2.pathname : "") + (result2.search ? result2.search : "");
      return result2.href = result2.format(), result2;
    }
    if (!srcPath.length) {
      if (result2.pathname = null, result2.search)
        result2.path = "/" + result2.search;
      else
        result2.path = null;
      return result2.href = result2.format(), result2;
    }
    var last = srcPath.slice(-1)[0], hasTrailingSlash = (result2.host || relative.host || srcPath.length > 1) && (last === "." || last === "..") || last === "", up = 0;
    for (var i = srcPath.length;i >= 0; i--)
      if (last = srcPath[i], last === ".")
        srcPath.splice(i, 1);
      else if (last === "..")
        srcPath.splice(i, 1), up++;
      else if (up)
        srcPath.splice(i, 1), up--;
    if (!mustEndAbs && !removeAllDots)
      for (;up--; up)
        srcPath.unshift("..");
    if (mustEndAbs && srcPath[0] !== "" && (!srcPath[0] || srcPath[0].charAt(0) !== "/"))
      srcPath.unshift("");
    if (hasTrailingSlash && srcPath.join("/").substr(-1) !== "/")
      srcPath.push("");
    var isAbsolute = srcPath[0] === "" || srcPath[0] && srcPath[0].charAt(0) === "/";
    if (psychotic) {
      result2.hostname = result2.host = isAbsolute ? "" : srcPath.length ? srcPath.shift() : "";
      var authInHost = result2.host && result2.host.indexOf("@") > 0 ? result2.host.split("@") : false;
      if (authInHost)
        result2.auth = authInHost.shift(), result2.host = result2.hostname = authInHost.shift();
    }
    if (mustEndAbs = mustEndAbs || result2.host && srcPath.length, mustEndAbs && !isAbsolute)
      srcPath.unshift("");
    if (!srcPath.length)
      result2.pathname = null, result2.path = null;
    else
      result2.pathname = srcPath.join("/");
    if (!util_isNull(result2.pathname) || !util_isNull(result2.search))
      result2.path = (result2.pathname ? result2.pathname : "") + (result2.search ? result2.search : "");
    return result2.auth = relative.auth || result2.auth, result2.slashes = result2.slashes || relative.slashes, result2.href = result2.format(), result2;
  };
  Url.prototype.parseHost = function() {
    var host2 = this.host, port = portPattern.exec(host2);
    if (port) {
      if (port = port[0], port !== ":")
        this.port = port.substr(1);
      host2 = host2.substr(0, host2.length - port.length);
    }
    if (host2)
      this.hostname = host2;
  };
  url_default = { parse: urlParse, resolve: urlResolve, resolveObject: urlResolveObject, format: urlFormat, Url, URL, URLSearchParams: URLSearchParams2 };
});

// node_modules/google-tts-api/dist/getAudioUrl.js
var require_getAudioUrl = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getAllAudioUrls = exports.getAudioUrl = undefined;
  var assertInputTypes_1 = __importDefault(require_assertInputTypes());
  var splitLongText_1 = __importDefault(require_splitLongText());
  var url_1 = __importDefault((init_url(), __toCommonJS(exports_url)));
  var getAudioUrl = function(text2, _a2) {
    var _b2 = _a2 === undefined ? {} : _a2, _c2 = _b2.lang, lang2 = _c2 === undefined ? "en" : _c2, _d2 = _b2.slow, slow2 = _d2 === undefined ? false : _d2, _e2 = _b2.host, host2 = _e2 === undefined ? "https://translate.google.com" : _e2;
    assertInputTypes_1.default(text2, lang2, slow2, host2);
    if (text2.length > 200) {
      throw new RangeError("text length (" + text2.length + ') should be less than 200 characters. Try "getAllAudioUrls(text, [option])" for long text.');
    }
    return host2 + "/translate_tts" + url_1.default.format({
      query: {
        ie: "UTF-8",
        q: text2,
        tl: lang2,
        total: 1,
        idx: 0,
        textlen: text2.length,
        client: "tw-ob",
        prev: "input",
        ttsspeed: slow2 ? 0.24 : 1
      }
    });
  };
  exports.getAudioUrl = getAudioUrl;
  var getAllAudioUrls = function(text2, _a2) {
    var _b2 = _a2 === undefined ? {} : _a2, _c2 = _b2.lang, lang2 = _c2 === undefined ? "en" : _c2, _d2 = _b2.slow, slow2 = _d2 === undefined ? false : _d2, _e2 = _b2.host, host2 = _e2 === undefined ? "https://translate.google.com" : _e2, _f2 = _b2.splitPunct, splitPunct = _f2 === undefined ? "" : _f2;
    assertInputTypes_1.default(text2, lang2, slow2, host2);
    if (typeof splitPunct !== "string") {
      throw new TypeError("splitPunct should be a string");
    }
    return splitLongText_1.default(text2, { splitPunct }).map(function(shortText) {
      return {
        shortText,
        url: exports.getAudioUrl(shortText, { lang: lang2, slow: slow2, host: host2 })
      };
    });
  };
  exports.getAllAudioUrls = getAllAudioUrls;
});

// node_modules/axios/lib/helpers/bind.js
var require_bind = __commonJS((exports, module) => {
  module.exports = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0;i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };
});

// node_modules/axios/lib/utils.js
var require_utils = __commonJS((exports, module) => {
  var bind = require_bind();
  var toString = Object.prototype.toString;
  function isArray(val) {
    return toString.call(val) === "[object Array]";
  }
  function isUndefined(val) {
    return typeof val === "undefined";
  }
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && typeof val.constructor.isBuffer === "function" && val.constructor.isBuffer(val);
  }
  function isArrayBuffer(val) {
    return toString.call(val) === "[object ArrayBuffer]";
  }
  function isFormData(val) {
    return typeof FormData !== "undefined" && val instanceof FormData;
  }
  function isArrayBufferView(val) {
    var result2;
    if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
      result2 = ArrayBuffer.isView(val);
    } else {
      result2 = val && val.buffer && val.buffer instanceof ArrayBuffer;
    }
    return result2;
  }
  function isString(val) {
    return typeof val === "string";
  }
  function isNumber(val) {
    return typeof val === "number";
  }
  function isObject(val) {
    return val !== null && typeof val === "object";
  }
  function isPlainObject(val) {
    if (toString.call(val) !== "[object Object]") {
      return false;
    }
    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
  }
  function isDate(val) {
    return toString.call(val) === "[object Date]";
  }
  function isFile(val) {
    return toString.call(val) === "[object File]";
  }
  function isBlob(val) {
    return toString.call(val) === "[object Blob]";
  }
  function isFunction(val) {
    return toString.call(val) === "[object Function]";
  }
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== "undefined" && val instanceof URLSearchParams;
  }
  function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
  }
  function isStandardBrowserEnv() {
    if (typeof navigator !== "undefined" && (navigator.product === "ReactNative" || navigator.product === "NativeScript" || navigator.product === "NS")) {
      return false;
    }
    return typeof window !== "undefined" && typeof document !== "undefined";
  }
  function forEach(obj, fn) {
    if (obj === null || typeof obj === "undefined") {
      return;
    }
    if (typeof obj !== "object") {
      obj = [obj];
    }
    if (isArray(obj)) {
      for (var i = 0, l = obj.length;i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }
  function merge() {
    var result2 = {};
    function assignValue(val, key) {
      if (isPlainObject(result2[key]) && isPlainObject(val)) {
        result2[key] = merge(result2[key], val);
      } else if (isPlainObject(val)) {
        result2[key] = merge({}, val);
      } else if (isArray(val)) {
        result2[key] = val.slice();
      } else {
        result2[key] = val;
      }
    }
    for (var i = 0, l = arguments.length;i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result2;
  }
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === "function") {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }
  function stripBOM(content) {
    if (content.charCodeAt(0) === 65279) {
      content = content.slice(1);
    }
    return content;
  }
  module.exports = {
    isArray,
    isArrayBuffer,
    isBuffer,
    isFormData,
    isArrayBufferView,
    isString,
    isNumber,
    isObject,
    isPlainObject,
    isUndefined,
    isDate,
    isFile,
    isBlob,
    isFunction,
    isStream,
    isURLSearchParams,
    isStandardBrowserEnv,
    forEach,
    merge,
    extend,
    trim,
    stripBOM
  };
});

// node_modules/axios/lib/helpers/buildURL.js
var require_buildURL = __commonJS((exports, module) => {
  var utils = require_utils();
  function encode(val) {
    return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
  }
  module.exports = function buildURL(url, params, paramsSerializer) {
    if (!params) {
      return url;
    }
    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];
      utils.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === "undefined") {
          return;
        }
        if (utils.isArray(val)) {
          key = key + "[]";
        } else {
          val = [val];
        }
        utils.forEach(val, function parseValue(v) {
          if (utils.isDate(v)) {
            v = v.toISOString();
          } else if (utils.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + "=" + encode(v));
        });
      });
      serializedParams = parts.join("&");
    }
    if (serializedParams) {
      var hashmarkIndex = url.indexOf("#");
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }
      url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
    }
    return url;
  };
});

// node_modules/axios/lib/core/InterceptorManager.js
var require_InterceptorManager = __commonJS((exports, module) => {
  var utils = require_utils();
  function InterceptorManager() {
    this.handlers = [];
  }
  InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  };
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };
  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };
  module.exports = InterceptorManager;
});

// node_modules/axios/lib/helpers/normalizeHeaderName.js
var require_normalizeHeaderName = __commonJS((exports, module) => {
  var utils = require_utils();
  module.exports = function normalizeHeaderName(headers, normalizedName) {
    utils.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };
});

// node_modules/axios/lib/core/enhanceError.js
var require_enhanceError = __commonJS((exports, module) => {
  module.exports = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }
    error.request = request;
    error.response = response;
    error.isAxiosError = true;
    error.toJSON = function toJSON() {
      return {
        message: this.message,
        name: this.name,
        description: this.description,
        number: this.number,
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        config: this.config,
        code: this.code
      };
    };
    return error;
  };
});

// node_modules/axios/lib/core/createError.js
var require_createError = __commonJS((exports, module) => {
  var enhanceError = require_enhanceError();
  module.exports = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };
});

// node_modules/axios/lib/core/settle.js
var require_settle = __commonJS((exports, module) => {
  var createError = require_createError();
  module.exports = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError("Request failed with status code " + response.status, response.config, null, response.request, response));
    }
  };
});

// node_modules/axios/lib/helpers/cookies.js
var require_cookies = __commonJS((exports, module) => {
  var utils = require_utils();
  module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + "=" + encodeURIComponent(value));
        if (utils.isNumber(expires)) {
          cookie.push("expires=" + new Date(expires).toGMTString());
        }
        if (utils.isString(path)) {
          cookie.push("path=" + path);
        }
        if (utils.isString(domain)) {
          cookie.push("domain=" + domain);
        }
        if (secure === true) {
          cookie.push("secure");
        }
        document.cookie = cookie.join("; ");
      },
      read: function read(name) {
        var match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
        return match ? decodeURIComponent(match[3]) : null;
      },
      remove: function remove(name) {
        this.write(name, "", Date.now() - 86400000);
      }
    };
  }() : function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() {
        return null;
      },
      remove: function remove() {}
    };
  }();
});

// node_modules/axios/lib/helpers/isAbsoluteURL.js
var require_isAbsoluteURL = __commonJS((exports, module) => {
  module.exports = function isAbsoluteURL(url) {
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };
});

// node_modules/axios/lib/helpers/combineURLs.js
var require_combineURLs = __commonJS((exports, module) => {
  module.exports = function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
  };
});

// node_modules/axios/lib/core/buildFullPath.js
var require_buildFullPath = __commonJS((exports, module) => {
  var isAbsoluteURL = require_isAbsoluteURL();
  var combineURLs = require_combineURLs();
  module.exports = function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  };
});

// node_modules/axios/lib/helpers/parseHeaders.js
var require_parseHeaders = __commonJS((exports, module) => {
  var utils = require_utils();
  var ignoreDuplicateOf = [
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent"
  ];
  module.exports = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;
    if (!headers) {
      return parsed;
    }
    utils.forEach(headers.split(`
`), function parser(line) {
      i = line.indexOf(":");
      key = utils.trim(line.substr(0, i)).toLowerCase();
      val = utils.trim(line.substr(i + 1));
      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === "set-cookie") {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
        }
      }
    });
    return parsed;
  };
});

// node_modules/axios/lib/helpers/isURLSameOrigin.js
var require_isURLSameOrigin = __commonJS((exports, module) => {
  var utils = require_utils();
  module.exports = utils.isStandardBrowserEnv() ? function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement("a");
    var originURL;
    function resolveURL(url) {
      var href = url;
      if (msie) {
        urlParsingNode.setAttribute("href", href);
        href = urlParsingNode.href;
      }
      urlParsingNode.setAttribute("href", href);
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, "") : "",
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, "") : "",
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, "") : "",
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: urlParsingNode.pathname.charAt(0) === "/" ? urlParsingNode.pathname : "/" + urlParsingNode.pathname
      };
    }
    originURL = resolveURL(window.location.href);
    return function isURLSameOrigin(requestURL) {
      var parsed = utils.isString(requestURL) ? resolveURL(requestURL) : requestURL;
      return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
    };
  }() : function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  }();
});

// node_modules/axios/lib/adapters/xhr.js
var require_xhr = __commonJS((exports, module) => {
  var utils = require_utils();
  var settle = require_settle();
  var cookies = require_cookies();
  var buildURL = require_buildURL();
  var buildFullPath = require_buildFullPath();
  var parseHeaders = require_parseHeaders();
  var isURLSameOrigin = require_isURLSameOrigin();
  var createError = require_createError();
  module.exports = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;
      var responseType = config.responseType;
      if (utils.isFormData(requestData)) {
        delete requestHeaders["Content-Type"];
      }
      var request = new XMLHttpRequest;
      if (config.auth) {
        var username = config.auth.username || "";
        var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : "";
        requestHeaders.Authorization = "Basic " + btoa(username + ":" + password);
      }
      var fullPath = buildFullPath(config.baseURL, config.url);
      request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
      request.timeout = config.timeout;
      function onloadend() {
        if (!request) {
          return;
        }
        var responseHeaders = "getAllResponseHeaders" in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        };
        settle(resolve, reject, response);
        request = null;
      }
      if ("onloadend" in request) {
        request.onloadend = onloadend;
      } else {
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf("file:") === 0)) {
            return;
          }
          setTimeout(onloadend);
        };
      }
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }
        reject(createError("Request aborted", config, "ECONNABORTED", request));
        request = null;
      };
      request.onerror = function handleError() {
        reject(createError("Network Error", config, null, request));
        request = null;
      };
      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = "timeout of " + config.timeout + "ms exceeded";
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(createError(timeoutErrorMessage, config, config.transitional && config.transitional.clarifyTimeoutError ? "ETIMEDOUT" : "ECONNABORTED", request));
        request = null;
      };
      if (utils.isStandardBrowserEnv()) {
        var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : undefined;
        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }
      if ("setRequestHeader" in request) {
        utils.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === "undefined" && key.toLowerCase() === "content-type") {
            delete requestHeaders[key];
          } else {
            request.setRequestHeader(key, val);
          }
        });
      }
      if (!utils.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }
      if (responseType && responseType !== "json") {
        request.responseType = config.responseType;
      }
      if (typeof config.onDownloadProgress === "function") {
        request.addEventListener("progress", config.onDownloadProgress);
      }
      if (typeof config.onUploadProgress === "function" && request.upload) {
        request.upload.addEventListener("progress", config.onUploadProgress);
      }
      if (config.cancelToken) {
        config.cancelToken.promise.then(function onCanceled(cancel) {
          if (!request) {
            return;
          }
          request.abort();
          reject(cancel);
          request = null;
        });
      }
      if (!requestData) {
        requestData = null;
      }
      request.send(requestData);
    });
  };
});

// node_modules/axios/lib/defaults.js
var require_defaults = __commonJS((exports, module) => {
  var utils = require_utils();
  var normalizeHeaderName = require_normalizeHeaderName();
  var enhanceError = require_enhanceError();
  var DEFAULT_CONTENT_TYPE = {
    "Content-Type": "application/x-www-form-urlencoded"
  };
  function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers["Content-Type"])) {
      headers["Content-Type"] = value;
    }
  }
  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== "undefined") {
      adapter = require_xhr();
    } else if (typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]") {
      adapter = require_xhr();
    }
    return adapter;
  }
  function stringifySafely(rawValue, parser, encoder) {
    if (utils.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils.trim(rawValue);
      } catch (e) {
        if (e.name !== "SyntaxError") {
          throw e;
        }
      }
    }
    return (encoder || JSON.stringify)(rawValue);
  }
  var defaults = {
    transitional: {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false
    },
    adapter: getDefaultAdapter(),
    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, "Accept");
      normalizeHeaderName(headers, "Content-Type");
      if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isBuffer(data) || utils.isStream(data) || utils.isFile(data) || utils.isBlob(data)) {
        return data;
      }
      if (utils.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, "application/x-www-form-urlencoded;charset=utf-8");
        return data.toString();
      }
      if (utils.isObject(data) || headers && headers["Content-Type"] === "application/json") {
        setContentTypeIfUnset(headers, "application/json");
        return stringifySafely(data);
      }
      return data;
    }],
    transformResponse: [function transformResponse(data) {
      var transitional = this.transitional;
      var silentJSONParsing = transitional && transitional.silentJSONParsing;
      var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
      var strictJSONParsing = !silentJSONParsing && this.responseType === "json";
      if (strictJSONParsing || forcedJSONParsing && utils.isString(data) && data.length) {
        try {
          return JSON.parse(data);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === "SyntaxError") {
              throw enhanceError(e, this, "E_JSON_PARSE");
            }
            throw e;
          }
        }
      }
      return data;
    }],
    timeout: 0,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    maxContentLength: -1,
    maxBodyLength: -1,
    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    }
  };
  defaults.headers = {
    common: {
      Accept: "application/json, text/plain, */*"
    }
  };
  utils.forEach(["delete", "get", "head"], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });
  utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
  });
  module.exports = defaults;
});

// node_modules/axios/lib/core/transformData.js
var require_transformData = __commonJS((exports, module) => {
  var utils = require_utils();
  var defaults = require_defaults();
  module.exports = function transformData(data, headers, fns) {
    var context = this || defaults;
    utils.forEach(fns, function transform(fn) {
      data = fn.call(context, data, headers);
    });
    return data;
  };
});

// node_modules/axios/lib/cancel/isCancel.js
var require_isCancel = __commonJS((exports, module) => {
  module.exports = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };
});

// node_modules/axios/lib/core/dispatchRequest.js
var require_dispatchRequest = __commonJS((exports, module) => {
  var utils = require_utils();
  var transformData = require_transformData();
  var isCancel = require_isCancel();
  var defaults = require_defaults();
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }
  }
  module.exports = function dispatchRequest(config) {
    throwIfCancellationRequested(config);
    config.headers = config.headers || {};
    config.data = transformData.call(config, config.data, config.headers, config.transformRequest);
    config.headers = utils.merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers);
    utils.forEach(["delete", "get", "head", "post", "put", "patch", "common"], function cleanHeaderConfig(method) {
      delete config.headers[method];
    });
    var adapter = config.adapter || defaults.adapter;
    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);
      response.data = transformData.call(config, response.data, response.headers, config.transformResponse);
      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);
        if (reason && reason.response) {
          reason.response.data = transformData.call(config, reason.response.data, reason.response.headers, config.transformResponse);
        }
      }
      return Promise.reject(reason);
    });
  };
});

// node_modules/axios/lib/core/mergeConfig.js
var require_mergeConfig = __commonJS((exports, module) => {
  var utils = require_utils();
  module.exports = function mergeConfig(config1, config2) {
    config2 = config2 || {};
    var config = {};
    var valueFromConfig2Keys = ["url", "method", "data"];
    var mergeDeepPropertiesKeys = ["headers", "auth", "proxy", "params"];
    var defaultToConfig2Keys = [
      "baseURL",
      "transformRequest",
      "transformResponse",
      "paramsSerializer",
      "timeout",
      "timeoutMessage",
      "withCredentials",
      "adapter",
      "responseType",
      "xsrfCookieName",
      "xsrfHeaderName",
      "onUploadProgress",
      "onDownloadProgress",
      "decompress",
      "maxContentLength",
      "maxBodyLength",
      "maxRedirects",
      "transport",
      "httpAgent",
      "httpsAgent",
      "cancelToken",
      "socketPath",
      "responseEncoding"
    ];
    var directMergeKeys = ["validateStatus"];
    function getMergedValue(target, source) {
      if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
        return utils.merge(target, source);
      } else if (utils.isPlainObject(source)) {
        return utils.merge({}, source);
      } else if (utils.isArray(source)) {
        return source.slice();
      }
      return source;
    }
    function mergeDeepProperties(prop) {
      if (!utils.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(config1[prop], config2[prop]);
      } else if (!utils.isUndefined(config1[prop])) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    }
    utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
      if (!utils.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(undefined, config2[prop]);
      }
    });
    utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);
    utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
      if (!utils.isUndefined(config2[prop])) {
        config[prop] = getMergedValue(undefined, config2[prop]);
      } else if (!utils.isUndefined(config1[prop])) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    });
    utils.forEach(directMergeKeys, function merge(prop) {
      if (prop in config2) {
        config[prop] = getMergedValue(config1[prop], config2[prop]);
      } else if (prop in config1) {
        config[prop] = getMergedValue(undefined, config1[prop]);
      }
    });
    var axiosKeys = valueFromConfig2Keys.concat(mergeDeepPropertiesKeys).concat(defaultToConfig2Keys).concat(directMergeKeys);
    var otherKeys = Object.keys(config1).concat(Object.keys(config2)).filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });
    utils.forEach(otherKeys, mergeDeepProperties);
    return config;
  };
});

// node_modules/axios/package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "axios",
    version: "0.21.4",
    description: "Promise based HTTP client for the browser and node.js",
    main: "index.js",
    scripts: {
      test: "grunt test",
      start: "node ./sandbox/server.js",
      build: "NODE_ENV=production grunt build",
      preversion: "npm test",
      version: "npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json",
      postversion: "git push && git push --tags",
      examples: "node ./examples/server.js",
      coveralls: "cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js",
      fix: "eslint --fix lib/**/*.js"
    },
    repository: {
      type: "git",
      url: "https://github.com/axios/axios.git"
    },
    keywords: [
      "xhr",
      "http",
      "ajax",
      "promise",
      "node"
    ],
    author: "Matt Zabriskie",
    license: "MIT",
    bugs: {
      url: "https://github.com/axios/axios/issues"
    },
    homepage: "https://axios-http.com",
    devDependencies: {
      coveralls: "^3.0.0",
      "es6-promise": "^4.2.4",
      grunt: "^1.3.0",
      "grunt-banner": "^0.6.0",
      "grunt-cli": "^1.2.0",
      "grunt-contrib-clean": "^1.1.0",
      "grunt-contrib-watch": "^1.0.0",
      "grunt-eslint": "^23.0.0",
      "grunt-karma": "^4.0.0",
      "grunt-mocha-test": "^0.13.3",
      "grunt-ts": "^6.0.0-beta.19",
      "grunt-webpack": "^4.0.2",
      "istanbul-instrumenter-loader": "^1.0.0",
      "jasmine-core": "^2.4.1",
      karma: "^6.3.2",
      "karma-chrome-launcher": "^3.1.0",
      "karma-firefox-launcher": "^2.1.0",
      "karma-jasmine": "^1.1.1",
      "karma-jasmine-ajax": "^0.1.13",
      "karma-safari-launcher": "^1.0.0",
      "karma-sauce-launcher": "^4.3.6",
      "karma-sinon": "^1.0.5",
      "karma-sourcemap-loader": "^0.3.8",
      "karma-webpack": "^4.0.2",
      "load-grunt-tasks": "^3.5.2",
      minimist: "^1.2.0",
      mocha: "^8.2.1",
      sinon: "^4.5.0",
      "terser-webpack-plugin": "^4.2.3",
      typescript: "^4.0.5",
      "url-search-params": "^0.10.0",
      webpack: "^4.44.2",
      "webpack-dev-server": "^3.11.0"
    },
    browser: {
      "./lib/adapters/http.js": "./lib/adapters/xhr.js"
    },
    jsdelivr: "dist/axios.min.js",
    unpkg: "dist/axios.min.js",
    typings: "./index.d.ts",
    dependencies: {
      "follow-redirects": "^1.14.0"
    },
    bundlesize: [
      {
        path: "./dist/axios.min.js",
        threshold: "5kB"
      }
    ]
  };
});

// node_modules/axios/lib/helpers/validator.js
var require_validator = __commonJS((exports, module) => {
  var pkg = require_package();
  var validators = {};
  ["object", "boolean", "number", "function", "string", "symbol"].forEach(function(type, i) {
    validators[type] = function validator(thing) {
      return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
    };
  });
  var deprecatedWarnings = {};
  var currentVerArr = pkg.version.split(".");
  function isOlderVersion(version, thanVersion) {
    var pkgVersionArr = thanVersion ? thanVersion.split(".") : currentVerArr;
    var destVer = version.split(".");
    for (var i = 0;i < 3; i++) {
      if (pkgVersionArr[i] > destVer[i]) {
        return true;
      } else if (pkgVersionArr[i] < destVer[i]) {
        return false;
      }
    }
    return false;
  }
  validators.transitional = function transitional(validator, version, message) {
    var isDeprecated = version && isOlderVersion(version);
    function formatMessage(opt, desc) {
      return "[Axios v" + pkg.version + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
    }
    return function(value, opt, opts) {
      if (validator === false) {
        throw new Error(formatMessage(opt, " has been removed in " + version));
      }
      if (isDeprecated && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        console.warn(formatMessage(opt, " has been deprecated since v" + version + " and will be removed in the near future"));
      }
      return validator ? validator(value, opt, opts) : true;
    };
  };
  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== "object") {
      throw new TypeError("options must be an object");
    }
    var keys = Object.keys(options);
    var i = keys.length;
    while (i-- > 0) {
      var opt = keys[i];
      var validator = schema[opt];
      if (validator) {
        var value = options[opt];
        var result2 = value === undefined || validator(value, opt, options);
        if (result2 !== true) {
          throw new TypeError("option " + opt + " must be " + result2);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw Error("Unknown option " + opt);
      }
    }
  }
  module.exports = {
    isOlderVersion,
    assertOptions,
    validators
  };
});

// node_modules/axios/lib/core/Axios.js
var require_Axios = __commonJS((exports, module) => {
  var utils = require_utils();
  var buildURL = require_buildURL();
  var InterceptorManager = require_InterceptorManager();
  var dispatchRequest = require_dispatchRequest();
  var mergeConfig = require_mergeConfig();
  var validator = require_validator();
  var validators = validator.validators;
  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager,
      response: new InterceptorManager
    };
  }
  Axios.prototype.request = function request(config) {
    if (typeof config === "string") {
      config = arguments[1] || {};
      config.url = arguments[0];
    } else {
      config = config || {};
    }
    config = mergeConfig(this.defaults, config);
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = "get";
    }
    var transitional = config.transitional;
    if (transitional !== undefined) {
      validator.assertOptions(transitional, {
        silentJSONParsing: validators.transitional(validators.boolean, "1.0.0"),
        forcedJSONParsing: validators.transitional(validators.boolean, "1.0.0"),
        clarifyTimeoutError: validators.transitional(validators.boolean, "1.0.0")
      }, false);
    }
    var requestInterceptorChain = [];
    var synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
        return;
      }
      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });
    var responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });
    var promise;
    if (!synchronousRequestInterceptors) {
      var chain = [dispatchRequest, undefined];
      Array.prototype.unshift.apply(chain, requestInterceptorChain);
      chain = chain.concat(responseInterceptorChain);
      promise = Promise.resolve(config);
      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }
      return promise;
    }
    var newConfig = config;
    while (requestInterceptorChain.length) {
      var onFulfilled = requestInterceptorChain.shift();
      var onRejected = requestInterceptorChain.shift();
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected(error);
        break;
      }
    }
    try {
      promise = dispatchRequest(newConfig);
    } catch (error) {
      return Promise.reject(error);
    }
    while (responseInterceptorChain.length) {
      promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
    }
    return promise;
  };
  Axios.prototype.getUri = function getUri(config) {
    config = mergeConfig(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, "");
  };
  utils.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
    Axios.prototype[method] = function(url, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        url,
        data: (config || {}).data
      }));
    };
  });
  utils.forEach(["post", "put", "patch"], function forEachMethodWithData(method) {
    Axios.prototype[method] = function(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        url,
        data
      }));
    };
  });
  module.exports = Axios;
});

// node_modules/axios/lib/cancel/Cancel.js
var require_Cancel = __commonJS((exports, module) => {
  function Cancel(message) {
    this.message = message;
  }
  Cancel.prototype.toString = function toString() {
    return "Cancel" + (this.message ? ": " + this.message : "");
  };
  Cancel.prototype.__CANCEL__ = true;
  module.exports = Cancel;
});

// node_modules/axios/lib/cancel/CancelToken.js
var require_CancelToken = __commonJS((exports, module) => {
  var Cancel = require_Cancel();
  function CancelToken(executor) {
    if (typeof executor !== "function") {
      throw new TypeError("executor must be a function.");
    }
    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });
    var token = this;
    executor(function cancel(message) {
      if (token.reason) {
        return;
      }
      token.reason = new Cancel(message);
      resolvePromise(token.reason);
    });
  }
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  };
  module.exports = CancelToken;
});

// node_modules/axios/lib/helpers/spread.js
var require_spread = __commonJS((exports, module) => {
  module.exports = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };
});

// node_modules/axios/lib/helpers/isAxiosError.js
var require_isAxiosError = __commonJS((exports, module) => {
  module.exports = function isAxiosError(payload) {
    return typeof payload === "object" && payload.isAxiosError === true;
  };
});

// node_modules/axios/lib/axios.js
var require_axios = __commonJS((exports, module) => {
  var utils = require_utils();
  var bind = require_bind();
  var Axios = require_Axios();
  var mergeConfig = require_mergeConfig();
  var defaults = require_defaults();
  function createInstance(defaultConfig) {
    var context = new Axios(defaultConfig);
    var instance = bind(Axios.prototype.request, context);
    utils.extend(instance, Axios.prototype, context);
    utils.extend(instance, context);
    return instance;
  }
  var axios = createInstance(defaults);
  axios.Axios = Axios;
  axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(axios.defaults, instanceConfig));
  };
  axios.Cancel = require_Cancel();
  axios.CancelToken = require_CancelToken();
  axios.isCancel = require_isCancel();
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = require_spread();
  axios.isAxiosError = require_isAxiosError();
  module.exports = axios;
  module.exports.default = axios;
});

// node_modules/google-tts-api/dist/getAudioBase64.js
var require_getAudioBase64 = __commonJS((exports, module) => {
  var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result2) {
        result2.done ? resolve(result2.value) : adopt(result2.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator = exports && exports.__generator || function(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1)
        throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), throw: verb(1), return: verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f)
        throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
            return t;
          if (y = 0, t)
            op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : undefined, done: true };
    }
  };
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getAllAudioBase64 = exports.getAudioBase64 = undefined;
  var assertInputTypes_1 = __importDefault(require_assertInputTypes());
  var axios_1 = __importDefault(require_axios());
  var splitLongText_1 = __importDefault(require_splitLongText());
  var getAudioBase64 = function(text, _a) {
    var _b = _a === undefined ? {} : _a, _c = _b.lang, lang = _c === undefined ? "en" : _c, _d = _b.slow, slow = _d === undefined ? false : _d, _e = _b.host, host = _e === undefined ? "https://translate.google.com" : _e, _f = _b.timeout, timeout = _f === undefined ? 1e4 : _f;
    return __awaiter(undefined, undefined, undefined, function() {
      var res, result;
      return __generator(this, function(_g) {
        switch (_g.label) {
          case 0:
            assertInputTypes_1.default(text, lang, slow, host);
            if (typeof timeout !== "number" || timeout <= 0) {
              throw new TypeError("timeout should be a positive number");
            }
            if (text.length > 200) {
              throw new RangeError("text length (" + text.length + ') should be less than 200 characters. Try "getAllAudioBase64(text, [option])" for long text.');
            }
            return [4, axios_1.default({
              method: "post",
              baseURL: host,
              url: "/_/TranslateWebserverUi/data/batchexecute",
              timeout,
              data: "f.req=" + encodeURIComponent(JSON.stringify([
                [["jQ1olc", JSON.stringify([text, lang, slow ? true : null, "null"]), null, "generic"]]
              ]))
            })];
          case 1:
            res = _g.sent();
            try {
              result = eval(res.data.slice(5))[0][2];
            } catch (e) {
              throw new Error(`parse response failed:
` + res.data);
            }
            if (!result) {
              throw new Error('lang "' + lang + '" might not exist');
            }
            try {
              result = eval(result)[0];
            } catch (e) {
              throw new Error(`parse response failed:
` + res.data);
            }
            return [2, result];
        }
      });
    });
  };
  exports.getAudioBase64 = getAudioBase64;
  var getAllAudioBase64 = function(text2, _a2) {
    var _b2 = _a2 === undefined ? {} : _a2, _c2 = _b2.lang, lang2 = _c2 === undefined ? "en" : _c2, _d2 = _b2.slow, slow2 = _d2 === undefined ? false : _d2, _e2 = _b2.host, host2 = _e2 === undefined ? "https://translate.google.com" : _e2, _f2 = _b2.splitPunct, splitPunct = _f2 === undefined ? "" : _f2, _g2 = _b2.timeout, timeout2 = _g2 === undefined ? 1e4 : _g2;
    return __awaiter(undefined, undefined, undefined, function() {
      var shortTextList, base64List, result2, i, shortText, base64;
      return __generator(this, function(_h) {
        switch (_h.label) {
          case 0:
            assertInputTypes_1.default(text2, lang2, slow2, host2);
            if (typeof splitPunct !== "string") {
              throw new TypeError("splitPunct should be a string");
            }
            if (typeof timeout2 !== "number" || timeout2 <= 0) {
              throw new TypeError("timeout should be a positive number");
            }
            shortTextList = splitLongText_1.default(text2, { splitPunct });
            return [4, Promise.all(shortTextList.map(function(shortText2) {
              return exports.getAudioBase64(shortText2, { lang: lang2, slow: slow2, host: host2, timeout: timeout2 });
            }))];
          case 1:
            base64List = _h.sent();
            result2 = [];
            for (i = 0;i < shortTextList.length; i++) {
              shortText = shortTextList[i];
              base64 = base64List[i];
              result2.push({ shortText, base64 });
            }
            return [2, result2];
        }
      });
    });
  };
  exports.getAllAudioBase64 = getAllAudioBase64;
});

// node_modules/google-tts-api/dist/index.js
var require_dist = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getAllAudioBase64 = exports.getAudioBase64 = exports.getAllAudioUrls = exports.getAudioUrl = undefined;
  var getAudioUrl_1 = require_getAudioUrl();
  Object.defineProperty(exports, "getAudioUrl", { enumerable: true, get: function() {
    return getAudioUrl_1.getAudioUrl;
  } });
  Object.defineProperty(exports, "getAllAudioUrls", { enumerable: true, get: function() {
    return getAudioUrl_1.getAllAudioUrls;
  } });
  var getAudioBase64_1 = require_getAudioBase64();
  Object.defineProperty(exports, "getAudioBase64", { enumerable: true, get: function() {
    return getAudioBase64_1.getAudioBase64;
  } });
  Object.defineProperty(exports, "getAllAudioBase64", { enumerable: true, get: function() {
    return getAudioBase64_1.getAllAudioBase64;
  } });
});

// src/background.ts
var googleTTS = __toESM(require_dist(), 1);
chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube RJ Mode extension installed");
  chrome.storage.sync.set({
    commentaryLength: "short",
    rjStyle: "sarcastic",
    voiceGender: "male",
    volumeDucking: 70,
    darkMode: false,
    autoStart: false
  });
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "logCommentary") {
    chrome.storage.local.get(["commentaryLogs"], (result2) => {
      const logs = result2.commentaryLogs || [];
      logs.push({
        timestamp: new Date().toISOString(),
        currentSong: request.currentSong,
        nextSong: request.nextSong,
        script: request.script,
        url: sender?.tab?.url
      });
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      chrome.storage.local.set({ commentaryLogs: logs });
    });
  } else if (request.action === "callChatJimmy") {
    fetch("https://chatjimmy.ai/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request.payload)
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`ChatJimmy API error: ${response.status}`);
      }
      return response.text();
    }).then((text2) => sendResponse({ success: true, data: text2 })).catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "getTTSAudio") {
    const { text: text2, lang: lang2 } = request.payload;
    try {
      const results = googleTTS.getAllAudioUrls(text2, {
        lang: lang2,
        slow: false,
        host: "https://translate.google.com",
        splitPunct: ". "
      });
      Promise.all(results.map(async (item) => {
        const response = await fetch(item.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0;i < uint8Array.byteLength; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
      })).then((base64Chunks) => {
        sendResponse({ success: true, data: base64Chunks });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
    return true;
  } else if (request.action === "callLyrics") {
    fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(request.query)}`, {
      headers: {
        "Content-Type": "application/json"
      },
      method: "GET"
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Lyrics API error: ${response.status}`);
      }
      return response.json();
    }).then((data) => sendResponse({ success: true, data })).catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "callGemini") {
    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": request.apiKey
      },
      body: JSON.stringify(request.payload)
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      return response.json();
    }).then((data) => sendResponse({ success: true, data })).catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "callMurf") {
    fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "api-key": request.apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request.payload)
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((err) => {
          throw new Error(err.message || `Murf API error: ${response.status}`);
        });
      }
      return response.json();
    }).then(async (data) => {
      if (!data.audioFile)
        throw new Error("No audio file returned");
      const audioResponse = await fetch(data.audioFile);
      if (!audioResponse.ok)
        throw new Error("Failed to fetch audio file");
      const blob = await audioResponse.blob();
      const reader = new FileReader;
      reader.onloadend = () => {
        const base64 = reader.result.split(",")[1];
        sendResponse({ success: true, data, audioBase64: base64 });
      };
      reader.readAsDataURL(blob);
    }).catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

//# debugId=2FE8D93DB840433B64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi5cXG5vZGVfbW9kdWxlc1xcZ29vZ2xlLXR0cy1hcGlcXGRpc3RcXGFzc2VydElucHV0VHlwZXMuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcZ29vZ2xlLXR0cy1hcGlcXGRpc3RcXHNwbGl0TG9uZ1RleHQuanMiLCAibm9kZTp1cmwiLCAiLi5cXG5vZGVfbW9kdWxlc1xcZ29vZ2xlLXR0cy1hcGlcXGRpc3RcXGdldEF1ZGlvVXJsLmpzIiwgIi4uXFxub2RlX21vZHVsZXNcXGF4aW9zXFxsaWJcXGhlbHBlcnNcXGJpbmQuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcdXRpbHMuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcaGVscGVyc1xcYnVpbGRVUkwuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcY29yZVxcSW50ZXJjZXB0b3JNYW5hZ2VyLmpzIiwgIi4uXFxub2RlX21vZHVsZXNcXGF4aW9zXFxsaWJcXGhlbHBlcnNcXG5vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcY29yZVxcZW5oYW5jZUVycm9yLmpzIiwgIi4uXFxub2RlX21vZHVsZXNcXGF4aW9zXFxsaWJcXGNvcmVcXGNyZWF0ZUVycm9yLmpzIiwgIi4uXFxub2RlX21vZHVsZXNcXGF4aW9zXFxsaWJcXGNvcmVcXHNldHRsZS5qcyIsICIuLlxcbm9kZV9tb2R1bGVzXFxheGlvc1xcbGliXFxoZWxwZXJzXFxjb29raWVzLmpzIiwgIi4uXFxub2RlX21vZHVsZXNcXGF4aW9zXFxsaWJcXGhlbHBlcnNcXGlzQWJzb2x1dGVVUkwuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcaGVscGVyc1xcY29tYmluZVVSTHMuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcY29yZVxcYnVpbGRGdWxsUGF0aC5qcyIsICIuLlxcbm9kZV9tb2R1bGVzXFxheGlvc1xcbGliXFxoZWxwZXJzXFxwYXJzZUhlYWRlcnMuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcaGVscGVyc1xcaXNVUkxTYW1lT3JpZ2luLmpzIiwgIi4uXFxub2RlX21vZHVsZXNcXGF4aW9zXFxsaWJcXGFkYXB0ZXJzXFx4aHIuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcZGVmYXVsdHMuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcY29yZVxcdHJhbnNmb3JtRGF0YS5qcyIsICIuLlxcbm9kZV9tb2R1bGVzXFxheGlvc1xcbGliXFxjYW5jZWxcXGlzQ2FuY2VsLmpzIiwgIi4uXFxub2RlX21vZHVsZXNcXGF4aW9zXFxsaWJcXGNvcmVcXGRpc3BhdGNoUmVxdWVzdC5qcyIsICIuLlxcbm9kZV9tb2R1bGVzXFxheGlvc1xcbGliXFxjb3JlXFxtZXJnZUNvbmZpZy5qcyIsICIuLlxcbm9kZV9tb2R1bGVzXFxheGlvc1xcbGliXFxoZWxwZXJzXFx2YWxpZGF0b3IuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcY29yZVxcQXhpb3MuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcY2FuY2VsXFxDYW5jZWwuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcY2FuY2VsXFxDYW5jZWxUb2tlbi5qcyIsICIuLlxcbm9kZV9tb2R1bGVzXFxheGlvc1xcbGliXFxoZWxwZXJzXFxzcHJlYWQuanMiLCAiLi5cXG5vZGVfbW9kdWxlc1xcYXhpb3NcXGxpYlxcaGVscGVyc1xcaXNBeGlvc0Vycm9yLmpzIiwgIi4uXFxub2RlX21vZHVsZXNcXGF4aW9zXFxsaWJcXGF4aW9zLmpzIiwgIi4uXFxub2RlX21vZHVsZXNcXGdvb2dsZS10dHMtYXBpXFxkaXN0XFxnZXRBdWRpb0Jhc2U2NC5qcyIsICIuLlxcbm9kZV9tb2R1bGVzXFxnb29nbGUtdHRzLWFwaVxcZGlzdFxcaW5kZXguanMiLCAiLi5cXHNyY1xcYmFja2dyb3VuZC50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBhc3NlcnRJbnB1dFR5cGVzID0gZnVuY3Rpb24gKHRleHQsIGxhbmcsIHNsb3csIGhvc3QpIHtcbiAgICBpZiAodHlwZW9mIHRleHQgIT09ICdzdHJpbmcnIHx8IHRleHQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RleHQgc2hvdWxkIGJlIGEgc3RyaW5nJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGFuZyAhPT0gJ3N0cmluZycgfHwgbGFuZy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbGFuZyBzaG91bGQgYmUgYSBzdHJpbmcnKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzbG93ICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc2xvdyBzaG91bGQgYmUgYSBib29sZWFuJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgaG9zdCAhPT0gJ3N0cmluZycgfHwgaG9zdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaG9zdCBzaG91bGQgYmUgYSBzdHJpbmcnKTtcbiAgICB9XG59O1xuZXhwb3J0cy5kZWZhdWx0ID0gYXNzZXJ0SW5wdXRUeXBlcztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFzc2VydElucHV0VHlwZXMuanMubWFwIiwKICAgICJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N0cmluZy9UcmltXG52YXIgU1BBQ0VfUkVHRVggPSAnXFxcXHNcXFxcdUZFRkZcXFxceEEwJztcbi8vIGh0dHBzOi8vcmVtYXJrYWJsZW1hcmsub3JnL2Jsb2cvMjAxOS8wOS8yOC9qYXZhc2NyaXB0LXJlbW92ZS1wdW5jdHVhdGlvbi9cbnZhciBERUZBVUxUX1BVTkNUVUFUSU9OX1JFR0VYID0gJyFcIiMkJSZcXCcoKSorLC0uLzo7PD0+P0BbXFxcXF1eX2B7fH1+Jztcbi8qKlxuICogc3BsaXQgdGhlIGxvbmcgdGV4dCB0byBzaG9ydCB0ZXh0c1xuICogVGltZSBDb21wbGV4aXR5OiBPKG4pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9ICB0ZXh0XG4gKiBAcGFyYW0ge29iamVjdD99IG9wdGlvblxuICogQHBhcmFtIHtudW1iZXI/fSBvcHRpb24ubWF4TGVuZ3RoICBkZWZhdWx0IGlzIDIwMFxuICogQHBhcmFtIHtzdHJpbmc/fSBvcHRpb24uc3BsaXRQdW5jdCBkZWZhdWx0IGlzICcnXG4gKiBAcmV0dXJucyB7c3RyaW5nW119IHNob3J0IHRleHQgbGlzdFxuICovXG52YXIgc3BsaXRMb25nVGV4dCA9IGZ1bmN0aW9uICh0ZXh0LCBfYSkge1xuICAgIHZhciBfYiA9IF9hID09PSB2b2lkIDAgPyB7fSA6IF9hLCBfYyA9IF9iLm1heExlbmd0aCwgbWF4TGVuZ3RoID0gX2MgPT09IHZvaWQgMCA/IDIwMCA6IF9jLCBfZCA9IF9iLnNwbGl0UHVuY3QsIHNwbGl0UHVuY3QgPSBfZCA9PT0gdm9pZCAwID8gJycgOiBfZDtcbiAgICB2YXIgaXNTcGFjZU9yUHVuY3QgPSBmdW5jdGlvbiAocywgaSkge1xuICAgICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCdbJyArIFNQQUNFX1JFR0VYICsgREVGQVVMVF9QVU5DVFVBVElPTl9SRUdFWCArIHNwbGl0UHVuY3QgKyAnXScpO1xuICAgICAgICByZXR1cm4gcmVnZXgudGVzdChzLmNoYXJBdChpKSk7XG4gICAgfTtcbiAgICB2YXIgbGFzdEluZGV4T2ZTcGFjZU9yUHVuY3QgPSBmdW5jdGlvbiAocywgbGVmdCwgcmlnaHQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IHJpZ2h0OyBpID49IGxlZnQ7IGktLSkge1xuICAgICAgICAgICAgaWYgKGlzU3BhY2VPclB1bmN0KHMsIGkpKVxuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTsgLy8gbm90IGZvdW5kXG4gICAgfTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGFkZFJlc3VsdCA9IGZ1bmN0aW9uICh0ZXh0LCBzdGFydCwgZW5kKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRleHQuc2xpY2Uoc3RhcnQsIGVuZCArIDEpKTtcbiAgICB9O1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgZm9yICg7Oykge1xuICAgICAgICAvLyBjaGVjayB0ZXh0J3MgbGVuZ3RoXG4gICAgICAgIGlmICh0ZXh0Lmxlbmd0aCAtIHN0YXJ0IDw9IG1heExlbmd0aCkge1xuICAgICAgICAgICAgYWRkUmVzdWx0KHRleHQsIHN0YXJ0LCB0ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgYnJlYWs7IC8vIGVuZCBvZiB0ZXh0XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2hlY2sgd2hldGhlciB0aGUgd29yZCBpcyBjdXQgaW4gdGhlIG1pZGRsZS5cbiAgICAgICAgdmFyIGVuZCA9IHN0YXJ0ICsgbWF4TGVuZ3RoIC0gMTtcbiAgICAgICAgaWYgKGlzU3BhY2VPclB1bmN0KHRleHQsIGVuZCkgfHwgaXNTcGFjZU9yUHVuY3QodGV4dCwgZW5kICsgMSkpIHtcbiAgICAgICAgICAgIGFkZFJlc3VsdCh0ZXh0LCBzdGFydCwgZW5kKTtcbiAgICAgICAgICAgIHN0YXJ0ID0gZW5kICsgMTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGZpbmQgbGFzdCBpbmRleCBvZiBzcGFjZVxuICAgICAgICBlbmQgPSBsYXN0SW5kZXhPZlNwYWNlT3JQdW5jdCh0ZXh0LCBzdGFydCwgZW5kKTtcbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcbiAgICAgICAgICAgIHZhciBzdHIgPSB0ZXh0LnNsaWNlKHN0YXJ0LCBzdGFydCArIG1heExlbmd0aCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSB3b3JkIGlzIHRvbyBsb25nIHRvIHNwbGl0IGludG8gYSBzaG9ydCB0ZXh0OicgK1xuICAgICAgICAgICAgICAgIChcIlxcblwiICsgc3RyICsgXCIgLi4uXCIpICtcbiAgICAgICAgICAgICAgICAnXFxuXFxuVHJ5IHRoZSBvcHRpb24gXCJzcGxpdFB1bmN0XCIgdG8gc3BsaXQgdGhlIHRleHQgYnkgcHVuY3R1YXRpb24uJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYWRkIHJlc3VsdFxuICAgICAgICBhZGRSZXN1bHQodGV4dCwgc3RhcnQsIGVuZCk7XG4gICAgICAgIHN0YXJ0ID0gZW5kICsgMTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBzcGxpdExvbmdUZXh0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3BsaXRMb25nVGV4dC5qcy5tYXAiLAogICAgInZhcntVUkwsVVJMU2VhcmNoUGFyYW1zfT1nbG9iYWxUaGlzO2Z1bmN0aW9uIHV0aWxfaXNTdHJpbmcoYXJnKXtyZXR1cm4gdHlwZW9mIGFyZz09PVwic3RyaW5nXCJ9ZnVuY3Rpb24gdXRpbF9pc09iamVjdChhcmcpe3JldHVybiB0eXBlb2YgYXJnPT09XCJvYmplY3RcIiYmYXJnIT09bnVsbH1mdW5jdGlvbiB1dGlsX2lzTnVsbChhcmcpe3JldHVybiBhcmc9PT1udWxsfWZ1bmN0aW9uIHV0aWxfaXNOdWxsT3JVbmRlZmluZWQoYXJnKXtyZXR1cm4gYXJnPT1udWxsfWZ1bmN0aW9uIFVybCgpe3RoaXMucHJvdG9jb2w9bnVsbCx0aGlzLnNsYXNoZXM9bnVsbCx0aGlzLmF1dGg9bnVsbCx0aGlzLmhvc3Q9bnVsbCx0aGlzLnBvcnQ9bnVsbCx0aGlzLmhvc3RuYW1lPW51bGwsdGhpcy5oYXNoPW51bGwsdGhpcy5zZWFyY2g9bnVsbCx0aGlzLnF1ZXJ5PW51bGwsdGhpcy5wYXRobmFtZT1udWxsLHRoaXMucGF0aD1udWxsLHRoaXMuaHJlZj1udWxsfXZhciBwcm90b2NvbFBhdHRlcm49L14oW2EtejAtOS4rLV0rOikvaSxwb3J0UGF0dGVybj0vOlswLTldKiQvLHNpbXBsZVBhdGhQYXR0ZXJuPS9eKFxcL1xcLz8oPyFcXC8pW15cXD9cXHNdKikoXFw/W15cXHNdKik/JC8sZGVsaW1zPVtcIjxcIixcIj5cIiwnXCInLFwiYFwiLFwiIFwiLFwiXFxyXCIsYFxuYCxcIlxcdFwiXSx1bndpc2U9W1wie1wiLFwifVwiLFwifFwiLFwiXFxcXFwiLFwiXlwiLFwiYFwiXS5jb25jYXQoZGVsaW1zKSxhdXRvRXNjYXBlPVtcIidcIl0uY29uY2F0KHVud2lzZSksbm9uSG9zdENoYXJzPVtcIiVcIixcIi9cIixcIj9cIixcIjtcIixcIiNcIl0uY29uY2F0KGF1dG9Fc2NhcGUpLGhvc3RFbmRpbmdDaGFycz1bXCIvXCIsXCI/XCIsXCIjXCJdLGhvc3RuYW1lTWF4TGVuPTI1NSxob3N0bmFtZVBhcnRQYXR0ZXJuPS9eWythLXowLTlBLVpfLV17MCw2M30kLyxob3N0bmFtZVBhcnRTdGFydD0vXihbK2EtejAtOUEtWl8tXXswLDYzfSkoLiopJC8sdW5zYWZlUHJvdG9jb2w9e2phdmFzY3JpcHQ6ITAsXCJqYXZhc2NyaXB0OlwiOiEwfSxob3N0bGVzc1Byb3RvY29sPXtqYXZhc2NyaXB0OiEwLFwiamF2YXNjcmlwdDpcIjohMH0sc2xhc2hlZFByb3RvY29sPXtodHRwOiEwLGh0dHBzOiEwLGZ0cDohMCxnb3BoZXI6ITAsZmlsZTohMCxcImh0dHA6XCI6ITAsXCJodHRwczpcIjohMCxcImZ0cDpcIjohMCxcImdvcGhlcjpcIjohMCxcImZpbGU6XCI6ITB9LHF1ZXJ5c3RyaW5nPXtwYXJzZShzdHIpe3ZhciBkZWNvZGU9ZGVjb2RlVVJJQ29tcG9uZW50O3JldHVybihzdHIrXCJcIikucmVwbGFjZSgvXFwrL2csXCIgXCIpLnNwbGl0KFwiJlwiKS5maWx0ZXIoQm9vbGVhbikucmVkdWNlKGZ1bmN0aW9uKG9iaixpdGVtLGluZGV4KXt2YXIgcmVmPWl0ZW0uc3BsaXQoXCI9XCIpLGtleT1kZWNvZGUocmVmWzBdfHxcIlwiKSx2YWw9ZGVjb2RlKHJlZlsxXXx8XCJcIikscHJldj1vYmpba2V5XTtyZXR1cm4gb2JqW2tleV09cHJldj09PXZvaWQgMD92YWw6W10uY29uY2F0KHByZXYsdmFsKSxvYmp9LHt9KX0sc3RyaW5naWZ5KG9iail7dmFyIGVuY29kZT1lbmNvZGVVUklDb21wb25lbnQ7cmV0dXJuIE9iamVjdC5rZXlzKG9ianx8e30pLnJlZHVjZShmdW5jdGlvbihhcnIsa2V5KXtyZXR1cm5bXS5jb25jYXQob2JqW2tleV0pLmZvckVhY2goZnVuY3Rpb24odil7YXJyLnB1c2goZW5jb2RlKGtleSkrXCI9XCIrZW5jb2RlKHYpKX0pLGFycn0sW10pLmpvaW4oXCImXCIpLnJlcGxhY2UoL1xccy9nLFwiK1wiKX19O2Z1bmN0aW9uIHVybFBhcnNlKHVybCxwYXJzZVF1ZXJ5U3RyaW5nLHNsYXNoZXNEZW5vdGVIb3N0KXtpZih1cmwmJnV0aWxfaXNPYmplY3QodXJsKSYmdXJsIGluc3RhbmNlb2YgVXJsKXJldHVybiB1cmw7dmFyIHU9bmV3IFVybDtyZXR1cm4gdS5wYXJzZSh1cmwscGFyc2VRdWVyeVN0cmluZyxzbGFzaGVzRGVub3RlSG9zdCksdX1VcmwucHJvdG90eXBlLnBhcnNlPWZ1bmN0aW9uKHVybCxwYXJzZVF1ZXJ5U3RyaW5nLHNsYXNoZXNEZW5vdGVIb3N0KXtpZighdXRpbF9pc1N0cmluZyh1cmwpKXRocm93IFR5cGVFcnJvcihcIlBhcmFtZXRlciAndXJsJyBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIrdHlwZW9mIHVybCk7dmFyIHF1ZXJ5SW5kZXg9dXJsLmluZGV4T2YoXCI/XCIpLHNwbGl0dGVyPXF1ZXJ5SW5kZXghPT0tMSYmcXVlcnlJbmRleDx1cmwuaW5kZXhPZihcIiNcIik/XCI/XCI6XCIjXCIsdVNwbGl0PXVybC5zcGxpdChzcGxpdHRlciksc2xhc2hSZWdleD0vXFxcXC9nO3VTcGxpdFswXT11U3BsaXRbMF0ucmVwbGFjZShzbGFzaFJlZ2V4LFwiL1wiKSx1cmw9dVNwbGl0LmpvaW4oc3BsaXR0ZXIpO3ZhciByZXN0PXVybDtpZihyZXN0PXJlc3QudHJpbSgpLCFzbGFzaGVzRGVub3RlSG9zdCYmdXJsLnNwbGl0KFwiI1wiKS5sZW5ndGg9PT0xKXt2YXIgc2ltcGxlUGF0aD1zaW1wbGVQYXRoUGF0dGVybi5leGVjKHJlc3QpO2lmKHNpbXBsZVBhdGgpe2lmKHRoaXMucGF0aD1yZXN0LHRoaXMuaHJlZj1yZXN0LHRoaXMucGF0aG5hbWU9c2ltcGxlUGF0aFsxXSxzaW1wbGVQYXRoWzJdKWlmKHRoaXMuc2VhcmNoPXNpbXBsZVBhdGhbMl0scGFyc2VRdWVyeVN0cmluZyl0aGlzLnF1ZXJ5PXF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMuc2VhcmNoLnN1YnN0cigxKSk7ZWxzZSB0aGlzLnF1ZXJ5PXRoaXMuc2VhcmNoLnN1YnN0cigxKTtlbHNlIGlmKHBhcnNlUXVlcnlTdHJpbmcpdGhpcy5zZWFyY2g9XCJcIix0aGlzLnF1ZXJ5PXt9O3JldHVybiB0aGlzfX12YXIgcHJvdG89cHJvdG9jb2xQYXR0ZXJuLmV4ZWMocmVzdCk7aWYocHJvdG8pe3Byb3RvPXByb3RvWzBdO3ZhciBsb3dlclByb3RvPXByb3RvLnRvTG93ZXJDYXNlKCk7dGhpcy5wcm90b2NvbD1sb3dlclByb3RvLHJlc3Q9cmVzdC5zdWJzdHIocHJvdG8ubGVuZ3RoKX1pZihzbGFzaGVzRGVub3RlSG9zdHx8cHJvdG98fHJlc3QubWF0Y2goL15cXC9cXC9bXkBcXC9dK0BbXkBcXC9dKy8pKXt2YXIgc2xhc2hlcz1yZXN0LnN1YnN0cigwLDIpPT09XCIvL1wiO2lmKHNsYXNoZXMmJiEocHJvdG8mJmhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dKSlyZXN0PXJlc3Quc3Vic3RyKDIpLHRoaXMuc2xhc2hlcz0hMH1pZighaG9zdGxlc3NQcm90b2NvbFtwcm90b10mJihzbGFzaGVzfHxwcm90byYmIXNsYXNoZWRQcm90b2NvbFtwcm90b10pKXt2YXIgaG9zdEVuZD0tMTtmb3IodmFyIGk9MDtpPGhvc3RFbmRpbmdDaGFycy5sZW5ndGg7aSsrKXt2YXIgaGVjPXJlc3QuaW5kZXhPZihob3N0RW5kaW5nQ2hhcnNbaV0pO2lmKGhlYyE9PS0xJiYoaG9zdEVuZD09PS0xfHxoZWM8aG9zdEVuZCkpaG9zdEVuZD1oZWN9dmFyIGF1dGgsYXRTaWduO2lmKGhvc3RFbmQ9PT0tMSlhdFNpZ249cmVzdC5sYXN0SW5kZXhPZihcIkBcIik7ZWxzZSBhdFNpZ249cmVzdC5sYXN0SW5kZXhPZihcIkBcIixob3N0RW5kKTtpZihhdFNpZ24hPT0tMSlhdXRoPXJlc3Quc2xpY2UoMCxhdFNpZ24pLHJlc3Q9cmVzdC5zbGljZShhdFNpZ24rMSksdGhpcy5hdXRoPWRlY29kZVVSSUNvbXBvbmVudChhdXRoKTtob3N0RW5kPS0xO2Zvcih2YXIgaT0wO2k8bm9uSG9zdENoYXJzLmxlbmd0aDtpKyspe3ZhciBoZWM9cmVzdC5pbmRleE9mKG5vbkhvc3RDaGFyc1tpXSk7aWYoaGVjIT09LTEmJihob3N0RW5kPT09LTF8fGhlYzxob3N0RW5kKSlob3N0RW5kPWhlY31pZihob3N0RW5kPT09LTEpaG9zdEVuZD1yZXN0Lmxlbmd0aDt0aGlzLmhvc3Q9cmVzdC5zbGljZSgwLGhvc3RFbmQpLHJlc3Q9cmVzdC5zbGljZShob3N0RW5kKSx0aGlzLnBhcnNlSG9zdCgpLHRoaXMuaG9zdG5hbWU9dGhpcy5ob3N0bmFtZXx8XCJcIjt2YXIgaXB2Nkhvc3RuYW1lPXRoaXMuaG9zdG5hbWVbMF09PT1cIltcIiYmdGhpcy5ob3N0bmFtZVt0aGlzLmhvc3RuYW1lLmxlbmd0aC0xXT09PVwiXVwiO2lmKCFpcHY2SG9zdG5hbWUpe3ZhciBob3N0cGFydHM9dGhpcy5ob3N0bmFtZS5zcGxpdCgvXFwuLyk7Zm9yKHZhciBpPTAsbD1ob3N0cGFydHMubGVuZ3RoO2k8bDtpKyspe3ZhciBwYXJ0PWhvc3RwYXJ0c1tpXTtpZighcGFydCljb250aW51ZTtpZighcGFydC5tYXRjaChob3N0bmFtZVBhcnRQYXR0ZXJuKSl7dmFyIG5ld3BhcnQ9XCJcIjtmb3IodmFyIGo9MCxrPXBhcnQubGVuZ3RoO2o8aztqKyspaWYocGFydC5jaGFyQ29kZUF0KGopPjEyNyluZXdwYXJ0Kz1cInhcIjtlbHNlIG5ld3BhcnQrPXBhcnRbal07aWYoIW5ld3BhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpe3ZhciB2YWxpZFBhcnRzPWhvc3RwYXJ0cy5zbGljZSgwLGkpLG5vdEhvc3Q9aG9zdHBhcnRzLnNsaWNlKGkrMSksYml0PXBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0U3RhcnQpO2lmKGJpdCl2YWxpZFBhcnRzLnB1c2goYml0WzFdKSxub3RIb3N0LnVuc2hpZnQoYml0WzJdKTtpZihub3RIb3N0Lmxlbmd0aClyZXN0PVwiL1wiK25vdEhvc3Quam9pbihcIi5cIikrcmVzdDt0aGlzLmhvc3RuYW1lPXZhbGlkUGFydHMuam9pbihcIi5cIik7YnJlYWt9fX19aWYodGhpcy5ob3N0bmFtZS5sZW5ndGg+aG9zdG5hbWVNYXhMZW4pdGhpcy5ob3N0bmFtZT1cIlwiO2Vsc2UgdGhpcy5ob3N0bmFtZT10aGlzLmhvc3RuYW1lLnRvTG93ZXJDYXNlKCk7aWYoIWlwdjZIb3N0bmFtZSl0aGlzLmhvc3RuYW1lPW5ldyBVUkwoYGh0dHBzOi8vJHt0aGlzLmhvc3RuYW1lfWApLmhvc3RuYW1lO3ZhciBwPXRoaXMucG9ydD9cIjpcIit0aGlzLnBvcnQ6XCJcIixoPXRoaXMuaG9zdG5hbWV8fFwiXCI7aWYodGhpcy5ob3N0PWgrcCx0aGlzLmhyZWYrPXRoaXMuaG9zdCxpcHY2SG9zdG5hbWUpe2lmKHRoaXMuaG9zdG5hbWU9dGhpcy5ob3N0bmFtZS5zdWJzdHIoMSx0aGlzLmhvc3RuYW1lLmxlbmd0aC0yKSxyZXN0WzBdIT09XCIvXCIpcmVzdD1cIi9cIityZXN0fX1pZighdW5zYWZlUHJvdG9jb2xbbG93ZXJQcm90b10pZm9yKHZhciBpPTAsbD1hdXRvRXNjYXBlLmxlbmd0aDtpPGw7aSsrKXt2YXIgYWU9YXV0b0VzY2FwZVtpXTtpZihyZXN0LmluZGV4T2YoYWUpPT09LTEpY29udGludWU7dmFyIGVzYz1lbmNvZGVVUklDb21wb25lbnQoYWUpO2lmKGVzYz09PWFlKWVzYz1lc2NhcGUoYWUpO3Jlc3Q9cmVzdC5zcGxpdChhZSkuam9pbihlc2MpfXZhciBoYXNoPXJlc3QuaW5kZXhPZihcIiNcIik7aWYoaGFzaCE9PS0xKXRoaXMuaGFzaD1yZXN0LnN1YnN0cihoYXNoKSxyZXN0PXJlc3Quc2xpY2UoMCxoYXNoKTt2YXIgcW09cmVzdC5pbmRleE9mKFwiP1wiKTtpZihxbSE9PS0xKXtpZih0aGlzLnNlYXJjaD1yZXN0LnN1YnN0cihxbSksdGhpcy5xdWVyeT1yZXN0LnN1YnN0cihxbSsxKSxwYXJzZVF1ZXJ5U3RyaW5nKXRoaXMucXVlcnk9cXVlcnlzdHJpbmcucGFyc2UodGhpcy5xdWVyeSk7cmVzdD1yZXN0LnNsaWNlKDAscW0pfWVsc2UgaWYocGFyc2VRdWVyeVN0cmluZyl0aGlzLnNlYXJjaD1cIlwiLHRoaXMucXVlcnk9e307aWYocmVzdCl0aGlzLnBhdGhuYW1lPXJlc3Q7aWYoc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dJiZ0aGlzLmhvc3RuYW1lJiYhdGhpcy5wYXRobmFtZSl0aGlzLnBhdGhuYW1lPVwiL1wiO2lmKHRoaXMucGF0aG5hbWV8fHRoaXMuc2VhcmNoKXt2YXIgcD10aGlzLnBhdGhuYW1lfHxcIlwiLHM9dGhpcy5zZWFyY2h8fFwiXCI7dGhpcy5wYXRoPXArc31yZXR1cm4gdGhpcy5ocmVmPXRoaXMuZm9ybWF0KCksdGhpc307ZnVuY3Rpb24gdXJsRm9ybWF0KG9iail7aWYodXRpbF9pc1N0cmluZyhvYmopKW9iaj11cmxQYXJzZShvYmopO2lmKCEob2JqIGluc3RhbmNlb2YgVXJsKSlyZXR1cm4gVXJsLnByb3RvdHlwZS5mb3JtYXQuY2FsbChvYmopO3JldHVybiBvYmouZm9ybWF0KCl9VXJsLnByb3RvdHlwZS5mb3JtYXQ9ZnVuY3Rpb24oKXt2YXIgYXV0aD10aGlzLmF1dGh8fFwiXCI7aWYoYXV0aClhdXRoPWVuY29kZVVSSUNvbXBvbmVudChhdXRoKSxhdXRoPWF1dGgucmVwbGFjZSgvJTNBL2ksXCI6XCIpLGF1dGgrPVwiQFwiO3ZhciBwcm90b2NvbD10aGlzLnByb3RvY29sfHxcIlwiLHBhdGhuYW1lPXRoaXMucGF0aG5hbWV8fFwiXCIsaGFzaD10aGlzLmhhc2h8fFwiXCIsaG9zdD0hMSxxdWVyeT1cIlwiO2lmKHRoaXMuaG9zdClob3N0PWF1dGgrdGhpcy5ob3N0O2Vsc2UgaWYodGhpcy5ob3N0bmFtZSl7aWYoaG9zdD1hdXRoKyh0aGlzLmhvc3RuYW1lLmluZGV4T2YoXCI6XCIpPT09LTE/dGhpcy5ob3N0bmFtZTpcIltcIit0aGlzLmhvc3RuYW1lK1wiXVwiKSx0aGlzLnBvcnQpaG9zdCs9XCI6XCIrdGhpcy5wb3J0fWlmKHRoaXMucXVlcnkmJnV0aWxfaXNPYmplY3QodGhpcy5xdWVyeSkmJk9iamVjdC5rZXlzKHRoaXMucXVlcnkpLmxlbmd0aClxdWVyeT1xdWVyeXN0cmluZy5zdHJpbmdpZnkodGhpcy5xdWVyeSk7dmFyIHNlYXJjaD10aGlzLnNlYXJjaHx8cXVlcnkmJlwiP1wiK3F1ZXJ5fHxcIlwiO2lmKHByb3RvY29sJiZwcm90b2NvbC5zdWJzdHIoLTEpIT09XCI6XCIpcHJvdG9jb2wrPVwiOlwiO2lmKHRoaXMuc2xhc2hlc3x8KCFwcm90b2NvbHx8c2xhc2hlZFByb3RvY29sW3Byb3RvY29sXSkmJmhvc3QhPT0hMSl7aWYoaG9zdD1cIi8vXCIrKGhvc3R8fFwiXCIpLHBhdGhuYW1lJiZwYXRobmFtZS5jaGFyQXQoMCkhPT1cIi9cIilwYXRobmFtZT1cIi9cIitwYXRobmFtZX1lbHNlIGlmKCFob3N0KWhvc3Q9XCJcIjtpZihoYXNoJiZoYXNoLmNoYXJBdCgwKSE9PVwiI1wiKWhhc2g9XCIjXCIraGFzaDtpZihzZWFyY2gmJnNlYXJjaC5jaGFyQXQoMCkhPT1cIj9cIilzZWFyY2g9XCI/XCIrc2VhcmNoO3JldHVybiBwYXRobmFtZT1wYXRobmFtZS5yZXBsYWNlKC9bPyNdL2csZnVuY3Rpb24obWF0Y2gpe3JldHVybiBlbmNvZGVVUklDb21wb25lbnQobWF0Y2gpfSksc2VhcmNoPXNlYXJjaC5yZXBsYWNlKFwiI1wiLFwiJTIzXCIpLHByb3RvY29sK2hvc3QrcGF0aG5hbWUrc2VhcmNoK2hhc2h9O2Z1bmN0aW9uIHVybFJlc29sdmUoc291cmNlLHJlbGF0aXZlKXtyZXR1cm4gdXJsUGFyc2Uoc291cmNlLCExLCEwKS5yZXNvbHZlKHJlbGF0aXZlKX1VcmwucHJvdG90eXBlLnJlc29sdmU9ZnVuY3Rpb24ocmVsYXRpdmUpe3JldHVybiB0aGlzLnJlc29sdmVPYmplY3QodXJsUGFyc2UocmVsYXRpdmUsITEsITApKS5mb3JtYXQoKX07ZnVuY3Rpb24gdXJsUmVzb2x2ZU9iamVjdChzb3VyY2UscmVsYXRpdmUpe2lmKCFzb3VyY2UpcmV0dXJuIHJlbGF0aXZlO3JldHVybiB1cmxQYXJzZShzb3VyY2UsITEsITApLnJlc29sdmVPYmplY3QocmVsYXRpdmUpfVVybC5wcm90b3R5cGUucmVzb2x2ZU9iamVjdD1mdW5jdGlvbihyZWxhdGl2ZSl7aWYodXRpbF9pc1N0cmluZyhyZWxhdGl2ZSkpe3ZhciByZWw9bmV3IFVybDtyZWwucGFyc2UocmVsYXRpdmUsITEsITApLHJlbGF0aXZlPXJlbH12YXIgcmVzdWx0PW5ldyBVcmwsdGtleXM9T2JqZWN0LmtleXModGhpcyk7Zm9yKHZhciB0az0wO3RrPHRrZXlzLmxlbmd0aDt0aysrKXt2YXIgdGtleT10a2V5c1t0a107cmVzdWx0W3RrZXldPXRoaXNbdGtleV19aWYocmVzdWx0Lmhhc2g9cmVsYXRpdmUuaGFzaCxyZWxhdGl2ZS5ocmVmPT09XCJcIilyZXR1cm4gcmVzdWx0LmhyZWY9cmVzdWx0LmZvcm1hdCgpLHJlc3VsdDtpZihyZWxhdGl2ZS5zbGFzaGVzJiYhcmVsYXRpdmUucHJvdG9jb2wpe3ZhciBya2V5cz1PYmplY3Qua2V5cyhyZWxhdGl2ZSk7Zm9yKHZhciByaz0wO3JrPHJrZXlzLmxlbmd0aDtyaysrKXt2YXIgcmtleT1ya2V5c1tya107aWYocmtleSE9PVwicHJvdG9jb2xcIilyZXN1bHRbcmtleV09cmVsYXRpdmVbcmtleV19aWYoc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF0mJnJlc3VsdC5ob3N0bmFtZSYmIXJlc3VsdC5wYXRobmFtZSlyZXN1bHQucGF0aD1yZXN1bHQucGF0aG5hbWU9XCIvXCI7cmV0dXJuIHJlc3VsdC5ocmVmPXJlc3VsdC5mb3JtYXQoKSxyZXN1bHR9aWYocmVsYXRpdmUucHJvdG9jb2wmJnJlbGF0aXZlLnByb3RvY29sIT09cmVzdWx0LnByb3RvY29sKXtpZighc2xhc2hlZFByb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSl7dmFyIGtleXM9T2JqZWN0LmtleXMocmVsYXRpdmUpO2Zvcih2YXIgdj0wO3Y8a2V5cy5sZW5ndGg7disrKXt2YXIgaz1rZXlzW3ZdO3Jlc3VsdFtrXT1yZWxhdGl2ZVtrXX1yZXR1cm4gcmVzdWx0LmhyZWY9cmVzdWx0LmZvcm1hdCgpLHJlc3VsdH1pZihyZXN1bHQucHJvdG9jb2w9cmVsYXRpdmUucHJvdG9jb2wsIXJlbGF0aXZlLmhvc3QmJiFob3N0bGVzc1Byb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSl7dmFyIHJlbFBhdGg9KHJlbGF0aXZlLnBhdGhuYW1lfHxcIlwiKS5zcGxpdChcIi9cIik7d2hpbGUocmVsUGF0aC5sZW5ndGgmJiEocmVsYXRpdmUuaG9zdD1yZWxQYXRoLnNoaWZ0KCkpKTtpZighcmVsYXRpdmUuaG9zdClyZWxhdGl2ZS5ob3N0PVwiXCI7aWYoIXJlbGF0aXZlLmhvc3RuYW1lKXJlbGF0aXZlLmhvc3RuYW1lPVwiXCI7aWYocmVsUGF0aFswXSE9PVwiXCIpcmVsUGF0aC51bnNoaWZ0KFwiXCIpO2lmKHJlbFBhdGgubGVuZ3RoPDIpcmVsUGF0aC51bnNoaWZ0KFwiXCIpO3Jlc3VsdC5wYXRobmFtZT1yZWxQYXRoLmpvaW4oXCIvXCIpfWVsc2UgcmVzdWx0LnBhdGhuYW1lPXJlbGF0aXZlLnBhdGhuYW1lO2lmKHJlc3VsdC5zZWFyY2g9cmVsYXRpdmUuc2VhcmNoLHJlc3VsdC5xdWVyeT1yZWxhdGl2ZS5xdWVyeSxyZXN1bHQuaG9zdD1yZWxhdGl2ZS5ob3N0fHxcIlwiLHJlc3VsdC5hdXRoPXJlbGF0aXZlLmF1dGgscmVzdWx0Lmhvc3RuYW1lPXJlbGF0aXZlLmhvc3RuYW1lfHxyZWxhdGl2ZS5ob3N0LHJlc3VsdC5wb3J0PXJlbGF0aXZlLnBvcnQscmVzdWx0LnBhdGhuYW1lfHxyZXN1bHQuc2VhcmNoKXt2YXIgcD1yZXN1bHQucGF0aG5hbWV8fFwiXCIscz1yZXN1bHQuc2VhcmNofHxcIlwiO3Jlc3VsdC5wYXRoPXArc31yZXR1cm4gcmVzdWx0LnNsYXNoZXM9cmVzdWx0LnNsYXNoZXN8fHJlbGF0aXZlLnNsYXNoZXMscmVzdWx0LmhyZWY9cmVzdWx0LmZvcm1hdCgpLHJlc3VsdH12YXIgaXNTb3VyY2VBYnM9cmVzdWx0LnBhdGhuYW1lJiZyZXN1bHQucGF0aG5hbWUuY2hhckF0KDApPT09XCIvXCIsaXNSZWxBYnM9cmVsYXRpdmUuaG9zdHx8cmVsYXRpdmUucGF0aG5hbWUmJnJlbGF0aXZlLnBhdGhuYW1lLmNoYXJBdCgwKT09PVwiL1wiLG11c3RFbmRBYnM9aXNSZWxBYnN8fGlzU291cmNlQWJzfHxyZXN1bHQuaG9zdCYmcmVsYXRpdmUucGF0aG5hbWUscmVtb3ZlQWxsRG90cz1tdXN0RW5kQWJzLHNyY1BhdGg9cmVzdWx0LnBhdGhuYW1lJiZyZXN1bHQucGF0aG5hbWUuc3BsaXQoXCIvXCIpfHxbXSxyZWxQYXRoPXJlbGF0aXZlLnBhdGhuYW1lJiZyZWxhdGl2ZS5wYXRobmFtZS5zcGxpdChcIi9cIil8fFtdLHBzeWNob3RpYz1yZXN1bHQucHJvdG9jb2wmJiFzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXTtpZihwc3ljaG90aWMpe2lmKHJlc3VsdC5ob3N0bmFtZT1cIlwiLHJlc3VsdC5wb3J0PW51bGwscmVzdWx0Lmhvc3QpaWYoc3JjUGF0aFswXT09PVwiXCIpc3JjUGF0aFswXT1yZXN1bHQuaG9zdDtlbHNlIHNyY1BhdGgudW5zaGlmdChyZXN1bHQuaG9zdCk7aWYocmVzdWx0Lmhvc3Q9XCJcIixyZWxhdGl2ZS5wcm90b2NvbCl7aWYocmVsYXRpdmUuaG9zdG5hbWU9bnVsbCxyZWxhdGl2ZS5wb3J0PW51bGwscmVsYXRpdmUuaG9zdClpZihyZWxQYXRoWzBdPT09XCJcIilyZWxQYXRoWzBdPXJlbGF0aXZlLmhvc3Q7ZWxzZSByZWxQYXRoLnVuc2hpZnQocmVsYXRpdmUuaG9zdCk7cmVsYXRpdmUuaG9zdD1udWxsfW11c3RFbmRBYnM9bXVzdEVuZEFicyYmKHJlbFBhdGhbMF09PT1cIlwifHxzcmNQYXRoWzBdPT09XCJcIil9aWYoaXNSZWxBYnMpcmVzdWx0Lmhvc3Q9cmVsYXRpdmUuaG9zdHx8cmVsYXRpdmUuaG9zdD09PVwiXCI/cmVsYXRpdmUuaG9zdDpyZXN1bHQuaG9zdCxyZXN1bHQuaG9zdG5hbWU9cmVsYXRpdmUuaG9zdG5hbWV8fHJlbGF0aXZlLmhvc3RuYW1lPT09XCJcIj9yZWxhdGl2ZS5ob3N0bmFtZTpyZXN1bHQuaG9zdG5hbWUscmVzdWx0LnNlYXJjaD1yZWxhdGl2ZS5zZWFyY2gscmVzdWx0LnF1ZXJ5PXJlbGF0aXZlLnF1ZXJ5LHNyY1BhdGg9cmVsUGF0aDtlbHNlIGlmKHJlbFBhdGgubGVuZ3RoKXtpZighc3JjUGF0aClzcmNQYXRoPVtdO3NyY1BhdGgucG9wKCksc3JjUGF0aD1zcmNQYXRoLmNvbmNhdChyZWxQYXRoKSxyZXN1bHQuc2VhcmNoPXJlbGF0aXZlLnNlYXJjaCxyZXN1bHQucXVlcnk9cmVsYXRpdmUucXVlcnl9ZWxzZSBpZighdXRpbF9pc051bGxPclVuZGVmaW5lZChyZWxhdGl2ZS5zZWFyY2gpKXtpZihwc3ljaG90aWMpe3Jlc3VsdC5ob3N0bmFtZT1yZXN1bHQuaG9zdD1zcmNQYXRoLnNoaWZ0KCk7dmFyIGF1dGhJbkhvc3Q9cmVzdWx0Lmhvc3QmJnJlc3VsdC5ob3N0LmluZGV4T2YoXCJAXCIpPjA/cmVzdWx0Lmhvc3Quc3BsaXQoXCJAXCIpOiExO2lmKGF1dGhJbkhvc3QpcmVzdWx0LmF1dGg9YXV0aEluSG9zdC5zaGlmdCgpLHJlc3VsdC5ob3N0PXJlc3VsdC5ob3N0bmFtZT1hdXRoSW5Ib3N0LnNoaWZ0KCl9aWYocmVzdWx0LnNlYXJjaD1yZWxhdGl2ZS5zZWFyY2gscmVzdWx0LnF1ZXJ5PXJlbGF0aXZlLnF1ZXJ5LCF1dGlsX2lzTnVsbChyZXN1bHQucGF0aG5hbWUpfHwhdXRpbF9pc051bGwocmVzdWx0LnNlYXJjaCkpcmVzdWx0LnBhdGg9KHJlc3VsdC5wYXRobmFtZT9yZXN1bHQucGF0aG5hbWU6XCJcIikrKHJlc3VsdC5zZWFyY2g/cmVzdWx0LnNlYXJjaDpcIlwiKTtyZXR1cm4gcmVzdWx0LmhyZWY9cmVzdWx0LmZvcm1hdCgpLHJlc3VsdH1pZighc3JjUGF0aC5sZW5ndGgpe2lmKHJlc3VsdC5wYXRobmFtZT1udWxsLHJlc3VsdC5zZWFyY2gpcmVzdWx0LnBhdGg9XCIvXCIrcmVzdWx0LnNlYXJjaDtlbHNlIHJlc3VsdC5wYXRoPW51bGw7cmV0dXJuIHJlc3VsdC5ocmVmPXJlc3VsdC5mb3JtYXQoKSxyZXN1bHR9dmFyIGxhc3Q9c3JjUGF0aC5zbGljZSgtMSlbMF0saGFzVHJhaWxpbmdTbGFzaD0ocmVzdWx0Lmhvc3R8fHJlbGF0aXZlLmhvc3R8fHNyY1BhdGgubGVuZ3RoPjEpJiYobGFzdD09PVwiLlwifHxsYXN0PT09XCIuLlwiKXx8bGFzdD09PVwiXCIsdXA9MDtmb3IodmFyIGk9c3JjUGF0aC5sZW5ndGg7aT49MDtpLS0paWYobGFzdD1zcmNQYXRoW2ldLGxhc3Q9PT1cIi5cIilzcmNQYXRoLnNwbGljZShpLDEpO2Vsc2UgaWYobGFzdD09PVwiLi5cIilzcmNQYXRoLnNwbGljZShpLDEpLHVwKys7ZWxzZSBpZih1cClzcmNQYXRoLnNwbGljZShpLDEpLHVwLS07aWYoIW11c3RFbmRBYnMmJiFyZW1vdmVBbGxEb3RzKWZvcig7dXAtLTt1cClzcmNQYXRoLnVuc2hpZnQoXCIuLlwiKTtpZihtdXN0RW5kQWJzJiZzcmNQYXRoWzBdIT09XCJcIiYmKCFzcmNQYXRoWzBdfHxzcmNQYXRoWzBdLmNoYXJBdCgwKSE9PVwiL1wiKSlzcmNQYXRoLnVuc2hpZnQoXCJcIik7aWYoaGFzVHJhaWxpbmdTbGFzaCYmc3JjUGF0aC5qb2luKFwiL1wiKS5zdWJzdHIoLTEpIT09XCIvXCIpc3JjUGF0aC5wdXNoKFwiXCIpO3ZhciBpc0Fic29sdXRlPXNyY1BhdGhbMF09PT1cIlwifHxzcmNQYXRoWzBdJiZzcmNQYXRoWzBdLmNoYXJBdCgwKT09PVwiL1wiO2lmKHBzeWNob3RpYyl7cmVzdWx0Lmhvc3RuYW1lPXJlc3VsdC5ob3N0PWlzQWJzb2x1dGU/XCJcIjpzcmNQYXRoLmxlbmd0aD9zcmNQYXRoLnNoaWZ0KCk6XCJcIjt2YXIgYXV0aEluSG9zdD1yZXN1bHQuaG9zdCYmcmVzdWx0Lmhvc3QuaW5kZXhPZihcIkBcIik+MD9yZXN1bHQuaG9zdC5zcGxpdChcIkBcIik6ITE7aWYoYXV0aEluSG9zdClyZXN1bHQuYXV0aD1hdXRoSW5Ib3N0LnNoaWZ0KCkscmVzdWx0Lmhvc3Q9cmVzdWx0Lmhvc3RuYW1lPWF1dGhJbkhvc3Quc2hpZnQoKX1pZihtdXN0RW5kQWJzPW11c3RFbmRBYnN8fHJlc3VsdC5ob3N0JiZzcmNQYXRoLmxlbmd0aCxtdXN0RW5kQWJzJiYhaXNBYnNvbHV0ZSlzcmNQYXRoLnVuc2hpZnQoXCJcIik7aWYoIXNyY1BhdGgubGVuZ3RoKXJlc3VsdC5wYXRobmFtZT1udWxsLHJlc3VsdC5wYXRoPW51bGw7ZWxzZSByZXN1bHQucGF0aG5hbWU9c3JjUGF0aC5qb2luKFwiL1wiKTtpZighdXRpbF9pc051bGwocmVzdWx0LnBhdGhuYW1lKXx8IXV0aWxfaXNOdWxsKHJlc3VsdC5zZWFyY2gpKXJlc3VsdC5wYXRoPShyZXN1bHQucGF0aG5hbWU/cmVzdWx0LnBhdGhuYW1lOlwiXCIpKyhyZXN1bHQuc2VhcmNoP3Jlc3VsdC5zZWFyY2g6XCJcIik7cmV0dXJuIHJlc3VsdC5hdXRoPXJlbGF0aXZlLmF1dGh8fHJlc3VsdC5hdXRoLHJlc3VsdC5zbGFzaGVzPXJlc3VsdC5zbGFzaGVzfHxyZWxhdGl2ZS5zbGFzaGVzLHJlc3VsdC5ocmVmPXJlc3VsdC5mb3JtYXQoKSxyZXN1bHR9O1VybC5wcm90b3R5cGUucGFyc2VIb3N0PWZ1bmN0aW9uKCl7dmFyIGhvc3Q9dGhpcy5ob3N0LHBvcnQ9cG9ydFBhdHRlcm4uZXhlYyhob3N0KTtpZihwb3J0KXtpZihwb3J0PXBvcnRbMF0scG9ydCE9PVwiOlwiKXRoaXMucG9ydD1wb3J0LnN1YnN0cigxKTtob3N0PWhvc3Quc3Vic3RyKDAsaG9zdC5sZW5ndGgtcG9ydC5sZW5ndGgpfWlmKGhvc3QpdGhpcy5ob3N0bmFtZT1ob3N0fTt2YXIgdXJsX2RlZmF1bHQ9e3BhcnNlOnVybFBhcnNlLHJlc29sdmU6dXJsUmVzb2x2ZSxyZXNvbHZlT2JqZWN0OnVybFJlc29sdmVPYmplY3QsZm9ybWF0OnVybEZvcm1hdCxVcmwsVVJMLFVSTFNlYXJjaFBhcmFtc307ZXhwb3J0e3VybFJlc29sdmVPYmplY3QgYXMgcmVzb2x2ZU9iamVjdCx1cmxSZXNvbHZlIGFzIHJlc29sdmUsdXJsUGFyc2UgYXMgcGFyc2UsdXJsRm9ybWF0IGFzIGZvcm1hdCx1cmxfZGVmYXVsdCBhcyBkZWZhdWx0LFVybCxVUkxTZWFyY2hQYXJhbXMsVVJMfTsiLAogICAgIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRBbGxBdWRpb1VybHMgPSBleHBvcnRzLmdldEF1ZGlvVXJsID0gdm9pZCAwO1xudmFyIGFzc2VydElucHV0VHlwZXNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9hc3NlcnRJbnB1dFR5cGVzXCIpKTtcbnZhciBzcGxpdExvbmdUZXh0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vc3BsaXRMb25nVGV4dFwiKSk7XG52YXIgdXJsXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcInVybFwiKSk7XG4vKipcbiAqIEdlbmVyYXRlIFwiR29vZ2xlIFRUU1wiIGF1ZGlvIFVSTFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSAgIHRleHQgICAgICAgICBsZW5ndGggc2hvdWxkIGJlIGxlc3MgdGhhbiAyMDAgY2hhcmFjdGVyc1xuICogQHBhcmFtIHtvYmplY3Q/fSAgb3B0aW9uXG4gKiBAcGFyYW0ge3N0cmluZz99ICBvcHRpb24ubGFuZyAgZGVmYXVsdCBpcyBcImVuXCJcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IG9wdGlvbi5zbG93ICBkZWZhdWx0IGlzIGZhbHNlXG4gKiBAcGFyYW0ge3N0cmluZz99ICBvcHRpb24uaG9zdCAgZGVmYXVsdCBpcyBcImh0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZS5jb21cIlxuICogQHJldHVybiB7c3RyaW5nfSB1cmxcbiAqL1xudmFyIGdldEF1ZGlvVXJsID0gZnVuY3Rpb24gKHRleHQsIF9hKSB7XG4gICAgdmFyIF9iID0gX2EgPT09IHZvaWQgMCA/IHt9IDogX2EsIF9jID0gX2IubGFuZywgbGFuZyA9IF9jID09PSB2b2lkIDAgPyAnZW4nIDogX2MsIF9kID0gX2Iuc2xvdywgc2xvdyA9IF9kID09PSB2b2lkIDAgPyBmYWxzZSA6IF9kLCBfZSA9IF9iLmhvc3QsIGhvc3QgPSBfZSA9PT0gdm9pZCAwID8gJ2h0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZS5jb20nIDogX2U7XG4gICAgYXNzZXJ0SW5wdXRUeXBlc18xLmRlZmF1bHQodGV4dCwgbGFuZywgc2xvdywgaG9zdCk7XG4gICAgaWYgKHRleHQubGVuZ3RoID4gMjAwKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwidGV4dCBsZW5ndGggKFwiICsgdGV4dC5sZW5ndGggKyBcIikgc2hvdWxkIGJlIGxlc3MgdGhhbiAyMDAgY2hhcmFjdGVycy4gVHJ5IFxcXCJnZXRBbGxBdWRpb1VybHModGV4dCwgW29wdGlvbl0pXFxcIiBmb3IgbG9uZyB0ZXh0LlwiKTtcbiAgICB9XG4gICAgcmV0dXJuIChob3N0ICtcbiAgICAgICAgJy90cmFuc2xhdGVfdHRzJyArXG4gICAgICAgIHVybF8xLmRlZmF1bHQuZm9ybWF0KHtcbiAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgaWU6ICdVVEYtOCcsXG4gICAgICAgICAgICAgICAgcTogdGV4dCxcbiAgICAgICAgICAgICAgICB0bDogbGFuZyxcbiAgICAgICAgICAgICAgICB0b3RhbDogMSxcbiAgICAgICAgICAgICAgICBpZHg6IDAsXG4gICAgICAgICAgICAgICAgdGV4dGxlbjogdGV4dC5sZW5ndGgsXG4gICAgICAgICAgICAgICAgY2xpZW50OiAndHctb2InLFxuICAgICAgICAgICAgICAgIHByZXY6ICdpbnB1dCcsXG4gICAgICAgICAgICAgICAgdHRzc3BlZWQ6IHNsb3cgPyAwLjI0IDogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbn07XG5leHBvcnRzLmdldEF1ZGlvVXJsID0gZ2V0QXVkaW9Vcmw7XG4vKipcbiAqIEB0eXBlZGVmIHtvYmplY3R9IFJlc3VsdFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNob3J0VGV4dFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHVybFxuICovXG4vKipcbiAqIFNwbGl0IHRoZSBsb25nIHRleHQgaW50byBtdWx0aXBsZSBzaG9ydCB0ZXh0IGFuZCBnZW5lcmF0ZSBhdWRpbyBVUkwgbGlzdFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSAgIHRleHRcbiAqIEBwYXJhbSB7b2JqZWN0P30gIG9wdGlvblxuICogQHBhcmFtIHtzdHJpbmc/fSAgb3B0aW9uLmxhbmcgICAgICAgIGRlZmF1bHQgaXMgXCJlblwiXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBvcHRpb24uc2xvdyAgICAgICAgZGVmYXVsdCBpcyBmYWxzZVxuICogQHBhcmFtIHtzdHJpbmc/fSAgb3B0aW9uLmhvc3QgICAgICAgIGRlZmF1bHQgaXMgXCJodHRwczovL3RyYW5zbGF0ZS5nb29nbGUuY29tXCJcbiAqIEBwYXJhbSB7c3RyaW5nP30gIG9wdGlvbi5zcGxpdFB1bmN0ICBzcGxpdCBwdW5jdHVhdGlvblxuICogQHJldHVybiB7UmVzdWx0W119IHRoZSBsaXN0IHdpdGggc2hvcnQgdGV4dCBhbmQgYXVkaW8gdXJsXG4gKi9cbnZhciBnZXRBbGxBdWRpb1VybHMgPSBmdW5jdGlvbiAodGV4dCwgX2EpIHtcbiAgICB2YXIgX2IgPSBfYSA9PT0gdm9pZCAwID8ge30gOiBfYSwgX2MgPSBfYi5sYW5nLCBsYW5nID0gX2MgPT09IHZvaWQgMCA/ICdlbicgOiBfYywgX2QgPSBfYi5zbG93LCBzbG93ID0gX2QgPT09IHZvaWQgMCA/IGZhbHNlIDogX2QsIF9lID0gX2IuaG9zdCwgaG9zdCA9IF9lID09PSB2b2lkIDAgPyAnaHR0cHM6Ly90cmFuc2xhdGUuZ29vZ2xlLmNvbScgOiBfZSwgX2YgPSBfYi5zcGxpdFB1bmN0LCBzcGxpdFB1bmN0ID0gX2YgPT09IHZvaWQgMCA/ICcnIDogX2Y7XG4gICAgYXNzZXJ0SW5wdXRUeXBlc18xLmRlZmF1bHQodGV4dCwgbGFuZywgc2xvdywgaG9zdCk7XG4gICAgaWYgKHR5cGVvZiBzcGxpdFB1bmN0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzcGxpdFB1bmN0IHNob3VsZCBiZSBhIHN0cmluZycpO1xuICAgIH1cbiAgICByZXR1cm4gc3BsaXRMb25nVGV4dF8xLmRlZmF1bHQodGV4dCwgeyBzcGxpdFB1bmN0OiBzcGxpdFB1bmN0IH0pLm1hcChmdW5jdGlvbiAoc2hvcnRUZXh0KSB7IHJldHVybiAoe1xuICAgICAgICBzaG9ydFRleHQ6IHNob3J0VGV4dCxcbiAgICAgICAgdXJsOiBleHBvcnRzLmdldEF1ZGlvVXJsKHNob3J0VGV4dCwgeyBsYW5nOiBsYW5nLCBzbG93OiBzbG93LCBob3N0OiBob3N0IH0pLFxuICAgIH0pOyB9KTtcbn07XG5leHBvcnRzLmdldEFsbEF1ZGlvVXJscyA9IGdldEFsbEF1ZGlvVXJscztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWdldEF1ZGlvVXJsLmpzLm1hcCIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHdyYXAoKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpc0FyZywgYXJncyk7XG4gIH07XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcblxuLy8gdXRpbHMgaXMgYSBsaWJyYXJ5IG9mIGdlbmVyaWMgaGVscGVyIGZ1bmN0aW9ucyBub24tc3BlY2lmaWMgdG8gYXhpb3NcblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdW5kZWZpbmVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCdWZmZXIodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgIWlzVW5kZWZpbmVkKHZhbCkgJiYgdmFsLmNvbnN0cnVjdG9yICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwuY29uc3RydWN0b3IpXG4gICAgJiYgdHlwZW9mIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIodmFsKTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlcih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIEZvcm1EYXRhXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gRm9ybURhdGEsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Zvcm1EYXRhKHZhbCkge1xuICByZXR1cm4gKHR5cGVvZiBGb3JtRGF0YSAhPT0gJ3VuZGVmaW5lZCcpICYmICh2YWwgaW5zdGFuY2VvZiBGb3JtRGF0YSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSB2aWV3IG9uIGFuIEFycmF5QnVmZmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmICgodHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJykgJiYgKEFycmF5QnVmZmVyLmlzVmlldykpIHtcbiAgICByZXN1bHQgPSBBcnJheUJ1ZmZlci5pc1ZpZXcodmFsKTtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHQgPSAodmFsKSAmJiAodmFsLmJ1ZmZlcikgJiYgKHZhbC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmluZ1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyaW5nLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnc3RyaW5nJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIE51bWJlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgTnVtYmVyLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsID09PSAnbnVtYmVyJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIHBsYWluIE9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3QsIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbCkge1xuICBpZiAodG9TdHJpbmcuY2FsbCh2YWwpICE9PSAnW29iamVjdCBPYmplY3RdJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsKTtcbiAgcmV0dXJuIHByb3RvdHlwZSA9PT0gbnVsbCB8fCBwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGU7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBEYXRlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBEYXRlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNEYXRlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGaWxlXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBGaWxlLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGaWxlKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGaWxlXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCbG9iXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBCbG9iLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCbG9iKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBCbG9iXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGdW5jdGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRnVuY3Rpb24sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgU3RyZWFtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBTdHJlYW0sIG90aGVyd2lzZSBmYWxzZVxuICovXG5mdW5jdGlvbiBpc1N0cmVhbSh2YWwpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHZhbCkgJiYgaXNGdW5jdGlvbih2YWwucGlwZSk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYSBVUkxTZWFyY2hQYXJhbXMgb2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNVUkxTZWFyY2hQYXJhbXModmFsKSB7XG4gIHJldHVybiB0eXBlb2YgVVJMU2VhcmNoUGFyYW1zICE9PSAndW5kZWZpbmVkJyAmJiB2YWwgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXM7XG59XG5cbi8qKlxuICogVHJpbSBleGNlc3Mgd2hpdGVzcGFjZSBvZmYgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIGEgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0ciBUaGUgU3RyaW5nIHRvIHRyaW1cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBTdHJpbmcgZnJlZWQgb2YgZXhjZXNzIHdoaXRlc3BhY2VcbiAqL1xuZnVuY3Rpb24gdHJpbShzdHIpIHtcbiAgcmV0dXJuIHN0ci50cmltID8gc3RyLnRyaW0oKSA6IHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50XG4gKlxuICogVGhpcyBhbGxvd3MgYXhpb3MgdG8gcnVuIGluIGEgd2ViIHdvcmtlciwgYW5kIHJlYWN0LW5hdGl2ZS5cbiAqIEJvdGggZW52aXJvbm1lbnRzIHN1cHBvcnQgWE1MSHR0cFJlcXVlc3QsIGJ1dCBub3QgZnVsbHkgc3RhbmRhcmQgZ2xvYmFscy5cbiAqXG4gKiB3ZWIgd29ya2VyczpcbiAqICB0eXBlb2Ygd2luZG93IC0+IHVuZGVmaW5lZFxuICogIHR5cGVvZiBkb2N1bWVudCAtPiB1bmRlZmluZWRcbiAqXG4gKiByZWFjdC1uYXRpdmU6XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ1JlYWN0TmF0aXZlJ1xuICogbmF0aXZlc2NyaXB0XG4gKiAgbmF2aWdhdG9yLnByb2R1Y3QgLT4gJ05hdGl2ZVNjcmlwdCcgb3IgJ05TJ1xuICovXG5mdW5jdGlvbiBpc1N0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIChuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTmF0aXZlU2NyaXB0JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5wcm9kdWN0ID09PSAnTlMnKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gKFxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICApO1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgb3ZlciBhbiBBcnJheSBvciBhbiBPYmplY3QgaW52b2tpbmcgYSBmdW5jdGlvbiBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmIGBvYmpgIGlzIGFuIEFycmF5IGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIHBhc3NpbmdcbiAqIHRoZSB2YWx1ZSwgaW5kZXgsIGFuZCBjb21wbGV0ZSBhcnJheSBmb3IgZWFjaCBpdGVtLlxuICpcbiAqIElmICdvYmonIGlzIGFuIE9iamVjdCBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGtleSwgYW5kIGNvbXBsZXRlIG9iamVjdCBmb3IgZWFjaCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gb2JqIFRoZSBvYmplY3QgdG8gaXRlcmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGNhbGxiYWNrIHRvIGludm9rZSBmb3IgZWFjaCBpdGVtXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2gob2JqLCBmbikge1xuICAvLyBEb24ndCBib3RoZXIgaWYgbm8gdmFsdWUgcHJvdmlkZWRcbiAgaWYgKG9iaiA9PT0gbnVsbCB8fCB0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEZvcmNlIGFuIGFycmF5IGlmIG5vdCBhbHJlYWR5IHNvbWV0aGluZyBpdGVyYWJsZVxuICBpZiAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcpIHtcbiAgICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgICBvYmogPSBbb2JqXTtcbiAgfVxuXG4gIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAvLyBJdGVyYXRlIG92ZXIgYXJyYXkgdmFsdWVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBmbi5jYWxsKG51bGwsIG9ialtpXSwgaSwgb2JqKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIG9iamVjdCBrZXlzXG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHtcbiAgICAgICAgZm4uY2FsbChudWxsLCBvYmpba2V5XSwga2V5LCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFjY2VwdHMgdmFyYXJncyBleHBlY3RpbmcgZWFjaCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3QsIHRoZW5cbiAqIGltbXV0YWJseSBtZXJnZXMgdGhlIHByb3BlcnRpZXMgb2YgZWFjaCBvYmplY3QgYW5kIHJldHVybnMgcmVzdWx0LlxuICpcbiAqIFdoZW4gbXVsdGlwbGUgb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIGtleSB0aGUgbGF0ZXIgb2JqZWN0IGluXG4gKiB0aGUgYXJndW1lbnRzIGxpc3Qgd2lsbCB0YWtlIHByZWNlZGVuY2UuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiBgYGBqc1xuICogdmFyIHJlc3VsdCA9IG1lcmdlKHtmb286IDEyM30sIHtmb286IDQ1Nn0pO1xuICogY29uc29sZS5sb2cocmVzdWx0LmZvbyk7IC8vIG91dHB1dHMgNDU2XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqMSBPYmplY3QgdG8gbWVyZ2VcbiAqIEByZXR1cm5zIHtPYmplY3R9IFJlc3VsdCBvZiBhbGwgbWVyZ2UgcHJvcGVydGllc1xuICovXG5mdW5jdGlvbiBtZXJnZSgvKiBvYmoxLCBvYmoyLCBvYmozLCAuLi4gKi8pIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmdW5jdGlvbiBhc3NpZ25WYWx1ZSh2YWwsIGtleSkge1xuICAgIGlmIChpc1BsYWluT2JqZWN0KHJlc3VsdFtrZXldKSAmJiBpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2UocmVzdWx0W2tleV0sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gbWVyZ2Uoe30sIHZhbCk7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbCkpIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsLnNsaWNlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdFtrZXldID0gdmFsO1xuICAgIH1cbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGZvckVhY2goYXJndW1lbnRzW2ldLCBhc3NpZ25WYWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBFeHRlbmRzIG9iamVjdCBhIGJ5IG11dGFibHkgYWRkaW5nIHRvIGl0IHRoZSBwcm9wZXJ0aWVzIG9mIG9iamVjdCBiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBvYmplY3QgdG8gYmUgZXh0ZW5kZWRcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIEBwYXJhbSB7T2JqZWN0fSB0aGlzQXJnIFRoZSBvYmplY3QgdG8gYmluZCBmdW5jdGlvbiB0b1xuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcmVzdWx0aW5nIHZhbHVlIG9mIG9iamVjdCBhXG4gKi9cbmZ1bmN0aW9uIGV4dGVuZChhLCBiLCB0aGlzQXJnKSB7XG4gIGZvckVhY2goYiwgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAodGhpc0FyZyAmJiB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhW2tleV0gPSBiaW5kKHZhbCwgdGhpc0FyZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFba2V5XSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYTtcbn1cblxuLyoqXG4gKiBSZW1vdmUgYnl0ZSBvcmRlciBtYXJrZXIuIFRoaXMgY2F0Y2hlcyBFRiBCQiBCRiAodGhlIFVURi04IEJPTSlcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCB3aXRoIEJPTVxuICogQHJldHVybiB7c3RyaW5nfSBjb250ZW50IHZhbHVlIHdpdGhvdXQgQk9NXG4gKi9cbmZ1bmN0aW9uIHN0cmlwQk9NKGNvbnRlbnQpIHtcbiAgaWYgKGNvbnRlbnQuY2hhckNvZGVBdCgwKSA9PT0gMHhGRUZGKSB7XG4gICAgY29udGVudCA9IGNvbnRlbnQuc2xpY2UoMSk7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc0FycmF5OiBpc0FycmF5LFxuICBpc0FycmF5QnVmZmVyOiBpc0FycmF5QnVmZmVyLFxuICBpc0J1ZmZlcjogaXNCdWZmZXIsXG4gIGlzRm9ybURhdGE6IGlzRm9ybURhdGEsXG4gIGlzQXJyYXlCdWZmZXJWaWV3OiBpc0FycmF5QnVmZmVyVmlldyxcbiAgaXNTdHJpbmc6IGlzU3RyaW5nLFxuICBpc051bWJlcjogaXNOdW1iZXIsXG4gIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgaXNQbGFpbk9iamVjdDogaXNQbGFpbk9iamVjdCxcbiAgaXNVbmRlZmluZWQ6IGlzVW5kZWZpbmVkLFxuICBpc0RhdGU6IGlzRGF0ZSxcbiAgaXNGaWxlOiBpc0ZpbGUsXG4gIGlzQmxvYjogaXNCbG9iLFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICBpc1N0cmVhbTogaXNTdHJlYW0sXG4gIGlzVVJMU2VhcmNoUGFyYW1zOiBpc1VSTFNlYXJjaFBhcmFtcyxcbiAgaXNTdGFuZGFyZEJyb3dzZXJFbnY6IGlzU3RhbmRhcmRCcm93c2VyRW52LFxuICBmb3JFYWNoOiBmb3JFYWNoLFxuICBtZXJnZTogbWVyZ2UsXG4gIGV4dGVuZDogZXh0ZW5kLFxuICB0cmltOiB0cmltLFxuICBzdHJpcEJPTTogc3RyaXBCT01cbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsKSB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgIHJlcGxhY2UoLyUyMC9nLCAnKycpLlxuICAgIHJlcGxhY2UoLyU1Qi9naSwgJ1snKS5cbiAgICByZXBsYWNlKC8lNUQvZ2ksICddJyk7XG59XG5cbi8qKlxuICogQnVpbGQgYSBVUkwgYnkgYXBwZW5kaW5nIHBhcmFtcyB0byB0aGUgZW5kXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgYmFzZSBvZiB0aGUgdXJsIChlLmcuLCBodHRwOi8vd3d3Lmdvb2dsZS5jb20pXG4gKiBAcGFyYW0ge29iamVjdH0gW3BhcmFtc10gVGhlIHBhcmFtcyB0byBiZSBhcHBlbmRlZFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGZvcm1hdHRlZCB1cmxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZFVSTCh1cmwsIHBhcmFtcywgcGFyYW1zU2VyaWFsaXplcikge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgdmFyIHNlcmlhbGl6ZWRQYXJhbXM7XG4gIGlmIChwYXJhbXNTZXJpYWxpemVyKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtc1NlcmlhbGl6ZXIocGFyYW1zKTtcbiAgfSBlbHNlIGlmICh1dGlscy5pc1VSTFNlYXJjaFBhcmFtcyhwYXJhbXMpKSB7XG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcmFtcy50b1N0cmluZygpO1xuICB9IGVsc2Uge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuXG4gICAgdXRpbHMuZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh1dGlscy5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAga2V5ID0ga2V5ICsgJ1tdJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IFt2YWxdO1xuICAgICAgfVxuXG4gICAgICB1dGlscy5mb3JFYWNoKHZhbCwgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KSB7XG4gICAgICAgIGlmICh1dGlscy5pc0RhdGUodikpIHtcbiAgICAgICAgICB2ID0gdi50b0lTT1N0cmluZygpO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgdiA9IEpTT04uc3RyaW5naWZ5KHYpO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUodikpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzZXJpYWxpemVkUGFyYW1zID0gcGFydHMuam9pbignJicpO1xuICB9XG5cbiAgaWYgKHNlcmlhbGl6ZWRQYXJhbXMpIHtcbiAgICB2YXIgaGFzaG1hcmtJbmRleCA9IHVybC5pbmRleE9mKCcjJyk7XG4gICAgaWYgKGhhc2htYXJrSW5kZXggIT09IC0xKSB7XG4gICAgICB1cmwgPSB1cmwuc2xpY2UoMCwgaGFzaG1hcmtJbmRleCk7XG4gICAgfVxuXG4gICAgdXJsICs9ICh1cmwuaW5kZXhPZignPycpID09PSAtMSA/ICc/JyA6ICcmJykgKyBzZXJpYWxpemVkUGFyYW1zO1xuICB9XG5cbiAgcmV0dXJuIHVybDtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5mdW5jdGlvbiBJbnRlcmNlcHRvck1hbmFnZXIoKSB7XG4gIHRoaXMuaGFuZGxlcnMgPSBbXTtcbn1cblxuLyoqXG4gKiBBZGQgYSBuZXcgaW50ZXJjZXB0b3IgdG8gdGhlIHN0YWNrXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVsZmlsbGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHRoZW5gIGZvciBhIGBQcm9taXNlYFxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0ZWQgVGhlIGZ1bmN0aW9uIHRvIGhhbmRsZSBgcmVqZWN0YCBmb3IgYSBgUHJvbWlzZWBcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IEFuIElEIHVzZWQgdG8gcmVtb3ZlIGludGVyY2VwdG9yIGxhdGVyXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24gdXNlKGZ1bGZpbGxlZCwgcmVqZWN0ZWQsIG9wdGlvbnMpIHtcbiAgdGhpcy5oYW5kbGVycy5wdXNoKHtcbiAgICBmdWxmaWxsZWQ6IGZ1bGZpbGxlZCxcbiAgICByZWplY3RlZDogcmVqZWN0ZWQsXG4gICAgc3luY2hyb25vdXM6IG9wdGlvbnMgPyBvcHRpb25zLnN5bmNocm9ub3VzIDogZmFsc2UsXG4gICAgcnVuV2hlbjogb3B0aW9ucyA/IG9wdGlvbnMucnVuV2hlbiA6IG51bGxcbiAgfSk7XG4gIHJldHVybiB0aGlzLmhhbmRsZXJzLmxlbmd0aCAtIDE7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbiBpbnRlcmNlcHRvciBmcm9tIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpZCBUaGUgSUQgdGhhdCB3YXMgcmV0dXJuZWQgYnkgYHVzZWBcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5lamVjdCA9IGZ1bmN0aW9uIGVqZWN0KGlkKSB7XG4gIGlmICh0aGlzLmhhbmRsZXJzW2lkXSkge1xuICAgIHRoaXMuaGFuZGxlcnNbaWRdID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYWxsIHRoZSByZWdpc3RlcmVkIGludGVyY2VwdG9yc1xuICpcbiAqIFRoaXMgbWV0aG9kIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHNraXBwaW5nIG92ZXIgYW55XG4gKiBpbnRlcmNlcHRvcnMgdGhhdCBtYXkgaGF2ZSBiZWNvbWUgYG51bGxgIGNhbGxpbmcgYGVqZWN0YC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgZnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCBpbnRlcmNlcHRvclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiBmb3JFYWNoKGZuKSB7XG4gIHV0aWxzLmZvckVhY2godGhpcy5oYW5kbGVycywgZnVuY3Rpb24gZm9yRWFjaEhhbmRsZXIoaCkge1xuICAgIGlmIChoICE9PSBudWxsKSB7XG4gICAgICBmbihoKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJbnRlcmNlcHRvck1hbmFnZXI7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBub3JtYWxpemVIZWFkZXJOYW1lKGhlYWRlcnMsIG5vcm1hbGl6ZWROYW1lKSB7XG4gIHV0aWxzLmZvckVhY2goaGVhZGVycywgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcih2YWx1ZSwgbmFtZSkge1xuICAgIGlmIChuYW1lICE9PSBub3JtYWxpemVkTmFtZSAmJiBuYW1lLnRvVXBwZXJDYXNlKCkgPT09IG5vcm1hbGl6ZWROYW1lLnRvVXBwZXJDYXNlKCkpIHtcbiAgICAgIGhlYWRlcnNbbm9ybWFsaXplZE5hbWVdID0gdmFsdWU7XG4gICAgICBkZWxldGUgaGVhZGVyc1tuYW1lXTtcbiAgICB9XG4gIH0pO1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVwZGF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgY29uZmlnLCBlcnJvciBjb2RlLCBhbmQgcmVzcG9uc2UuXG4gKlxuICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIGVycm9yIHRvIHVwZGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgZXJyb3IuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIGVycm9yLmNvbmZpZyA9IGNvbmZpZztcbiAgaWYgKGNvZGUpIHtcbiAgICBlcnJvci5jb2RlID0gY29kZTtcbiAgfVxuXG4gIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuICBlcnJvci5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICBlcnJvci5pc0F4aW9zRXJyb3IgPSB0cnVlO1xuXG4gIGVycm9yLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gU3RhbmRhcmRcbiAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIC8vIE1pY3Jvc29mdFxuICAgICAgZGVzY3JpcHRpb246IHRoaXMuZGVzY3JpcHRpb24sXG4gICAgICBudW1iZXI6IHRoaXMubnVtYmVyLFxuICAgICAgLy8gTW96aWxsYVxuICAgICAgZmlsZU5hbWU6IHRoaXMuZmlsZU5hbWUsXG4gICAgICBsaW5lTnVtYmVyOiB0aGlzLmxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW5OdW1iZXI6IHRoaXMuY29sdW1uTnVtYmVyLFxuICAgICAgc3RhY2s6IHRoaXMuc3RhY2ssXG4gICAgICAvLyBBeGlvc1xuICAgICAgY29uZmlnOiB0aGlzLmNvbmZpZyxcbiAgICAgIGNvZGU6IHRoaXMuY29kZVxuICAgIH07XG4gIH07XG4gIHJldHVybiBlcnJvcjtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vZW5oYW5jZUVycm9yJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIEVycm9yIHdpdGggdGhlIHNwZWNpZmllZCBtZXNzYWdlLCBjb25maWcsIGVycm9yIGNvZGUsIHJlcXVlc3QgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnLlxuICogQHBhcmFtIHtzdHJpbmd9IFtjb2RlXSBUaGUgZXJyb3IgY29kZSAoZm9yIGV4YW1wbGUsICdFQ09OTkFCT1JURUQnKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVxdWVzdF0gVGhlIHJlcXVlc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW3Jlc3BvbnNlXSBUaGUgcmVzcG9uc2UuXG4gKiBAcmV0dXJucyB7RXJyb3J9IFRoZSBjcmVhdGVkIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZUVycm9yKG1lc3NhZ2UsIGNvbmZpZywgY29kZSwgcmVxdWVzdCwgcmVzcG9uc2UpIHtcbiAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICByZXR1cm4gZW5oYW5jZUVycm9yKGVycm9yLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKTtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi9jcmVhdGVFcnJvcicpO1xuXG4vKipcbiAqIFJlc29sdmUgb3IgcmVqZWN0IGEgUHJvbWlzZSBiYXNlZCBvbiByZXNwb25zZSBzdGF0dXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzb2x2ZSBBIGZ1bmN0aW9uIHRoYXQgcmVzb2x2ZXMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWplY3QgQSBmdW5jdGlvbiB0aGF0IHJlamVjdHMgdGhlIHByb21pc2UuXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzcG9uc2UgVGhlIHJlc3BvbnNlLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHJlc3BvbnNlKSB7XG4gIHZhciB2YWxpZGF0ZVN0YXR1cyA9IHJlc3BvbnNlLmNvbmZpZy52YWxpZGF0ZVN0YXR1cztcbiAgaWYgKCFyZXNwb25zZS5zdGF0dXMgfHwgIXZhbGlkYXRlU3RhdHVzIHx8IHZhbGlkYXRlU3RhdHVzKHJlc3BvbnNlLnN0YXR1cykpIHtcbiAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgfSBlbHNlIHtcbiAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAnUmVxdWVzdCBmYWlsZWQgd2l0aCBzdGF0dXMgY29kZSAnICsgcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgcmVzcG9uc2UuY29uZmlnLFxuICAgICAgbnVsbCxcbiAgICAgIHJlc3BvbnNlLnJlcXVlc3QsXG4gICAgICByZXNwb25zZVxuICAgICkpO1xuICB9XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoXG4gIHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkgP1xuXG4gIC8vIFN0YW5kYXJkIGJyb3dzZXIgZW52cyBzdXBwb3J0IGRvY3VtZW50LmNvb2tpZVxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUobmFtZSwgdmFsdWUsIGV4cGlyZXMsIHBhdGgsIGRvbWFpbiwgc2VjdXJlKSB7XG4gICAgICAgICAgdmFyIGNvb2tpZSA9IFtdO1xuICAgICAgICAgIGNvb2tpZS5wdXNoKG5hbWUgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcblxuICAgICAgICAgIGlmICh1dGlscy5pc051bWJlcihleHBpcmVzKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2V4cGlyZXM9JyArIG5ldyBEYXRlKGV4cGlyZXMpLnRvR01UU3RyaW5nKCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhwYXRoKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ3BhdGg9JyArIHBhdGgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICh1dGlscy5pc1N0cmluZyhkb21haW4pKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnZG9tYWluPScgKyBkb21haW4pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWN1cmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdzZWN1cmUnKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBkb2N1bWVudC5jb29raWUgPSBjb29raWUuam9pbignOyAnKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWFkOiBmdW5jdGlvbiByZWFkKG5hbWUpIHtcbiAgICAgICAgICB2YXIgbWF0Y2ggPSBkb2N1bWVudC5jb29raWUubWF0Y2gobmV3IFJlZ0V4cCgnKF58O1xcXFxzKikoJyArIG5hbWUgKyAnKT0oW147XSopJykpO1xuICAgICAgICAgIHJldHVybiAobWF0Y2ggPyBkZWNvZGVVUklDb21wb25lbnQobWF0Y2hbM10pIDogbnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICAgICAgICAgIHRoaXMud3JpdGUobmFtZSwgJycsIERhdGUubm93KCkgLSA4NjQwMDAwMCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52ICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3cml0ZTogZnVuY3Rpb24gd3JpdGUoKSB7fSxcbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZCgpIHsgcmV0dXJuIG51bGw7IH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIFVSTCB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIFVSTCBpcyBhYnNvbHV0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBYnNvbHV0ZVVSTCh1cmwpIHtcbiAgLy8gQSBVUkwgaXMgY29uc2lkZXJlZCBhYnNvbHV0ZSBpZiBpdCBiZWdpbnMgd2l0aCBcIjxzY2hlbWU+Oi8vXCIgb3IgXCIvL1wiIChwcm90b2NvbC1yZWxhdGl2ZSBVUkwpLlxuICAvLyBSRkMgMzk4NiBkZWZpbmVzIHNjaGVtZSBuYW1lIGFzIGEgc2VxdWVuY2Ugb2YgY2hhcmFjdGVycyBiZWdpbm5pbmcgd2l0aCBhIGxldHRlciBhbmQgZm9sbG93ZWRcbiAgLy8gYnkgYW55IGNvbWJpbmF0aW9uIG9mIGxldHRlcnMsIGRpZ2l0cywgcGx1cywgcGVyaW9kLCBvciBoeXBoZW4uXG4gIHJldHVybiAvXihbYS16XVthLXpcXGRcXCtcXC1cXC5dKjopP1xcL1xcLy9pLnRlc3QodXJsKTtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIHNwZWNpZmllZCBVUkxzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVUkwgVGhlIGJhc2UgVVJMXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVsYXRpdmVVUkwgVGhlIHJlbGF0aXZlIFVSTFxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIFVSTFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlbGF0aXZlVVJMKSB7XG4gIHJldHVybiByZWxhdGl2ZVVSTFxuICAgID8gYmFzZVVSTC5yZXBsYWNlKC9cXC8rJC8sICcnKSArICcvJyArIHJlbGF0aXZlVVJMLnJlcGxhY2UoL15cXC8rLywgJycpXG4gICAgOiBiYXNlVVJMO1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBYnNvbHV0ZVVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTCcpO1xudmFyIGNvbWJpbmVVUkxzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jb21iaW5lVVJMcycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgVVJMIGJ5IGNvbWJpbmluZyB0aGUgYmFzZVVSTCB3aXRoIHRoZSByZXF1ZXN0ZWRVUkwsXG4gKiBvbmx5IHdoZW4gdGhlIHJlcXVlc3RlZFVSTCBpcyBub3QgYWxyZWFkeSBhbiBhYnNvbHV0ZSBVUkwuXG4gKiBJZiB0aGUgcmVxdWVzdFVSTCBpcyBhYnNvbHV0ZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSByZXF1ZXN0ZWRVUkwgdW50b3VjaGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RlZFVSTCBBYnNvbHV0ZSBvciByZWxhdGl2ZSBVUkwgdG8gY29tYmluZVxuICogQHJldHVybnMge3N0cmluZ30gVGhlIGNvbWJpbmVkIGZ1bGwgcGF0aFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJ1aWxkRnVsbFBhdGgoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKSB7XG4gIGlmIChiYXNlVVJMICYmICFpc0Fic29sdXRlVVJMKHJlcXVlc3RlZFVSTCkpIHtcbiAgICByZXR1cm4gY29tYmluZVVSTHMoYmFzZVVSTCwgcmVxdWVzdGVkVVJMKTtcbiAgfVxuICByZXR1cm4gcmVxdWVzdGVkVVJMO1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbi8vIEhlYWRlcnMgd2hvc2UgZHVwbGljYXRlcyBhcmUgaWdub3JlZCBieSBub2RlXG4vLyBjLmYuIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvaHR0cC5odG1sI2h0dHBfbWVzc2FnZV9oZWFkZXJzXG52YXIgaWdub3JlRHVwbGljYXRlT2YgPSBbXG4gICdhZ2UnLCAnYXV0aG9yaXphdGlvbicsICdjb250ZW50LWxlbmd0aCcsICdjb250ZW50LXR5cGUnLCAnZXRhZycsXG4gICdleHBpcmVzJywgJ2Zyb20nLCAnaG9zdCcsICdpZi1tb2RpZmllZC1zaW5jZScsICdpZi11bm1vZGlmaWVkLXNpbmNlJyxcbiAgJ2xhc3QtbW9kaWZpZWQnLCAnbG9jYXRpb24nLCAnbWF4LWZvcndhcmRzJywgJ3Byb3h5LWF1dGhvcml6YXRpb24nLFxuICAncmVmZXJlcicsICdyZXRyeS1hZnRlcicsICd1c2VyLWFnZW50J1xuXTtcblxuLyoqXG4gKiBQYXJzZSBoZWFkZXJzIGludG8gYW4gb2JqZWN0XG4gKlxuICogYGBgXG4gKiBEYXRlOiBXZWQsIDI3IEF1ZyAyMDE0IDA4OjU4OjQ5IEdNVFxuICogQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9qc29uXG4gKiBDb25uZWN0aW9uOiBrZWVwLWFsaXZlXG4gKiBUcmFuc2Zlci1FbmNvZGluZzogY2h1bmtlZFxuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlcnMgSGVhZGVycyBuZWVkaW5nIHRvIGJlIHBhcnNlZFxuICogQHJldHVybnMge09iamVjdH0gSGVhZGVycyBwYXJzZWQgaW50byBhbiBvYmplY3RcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwYXJzZUhlYWRlcnMoaGVhZGVycykge1xuICB2YXIgcGFyc2VkID0ge307XG4gIHZhciBrZXk7XG4gIHZhciB2YWw7XG4gIHZhciBpO1xuXG4gIGlmICghaGVhZGVycykgeyByZXR1cm4gcGFyc2VkOyB9XG5cbiAgdXRpbHMuZm9yRWFjaChoZWFkZXJzLnNwbGl0KCdcXG4nKSwgZnVuY3Rpb24gcGFyc2VyKGxpbmUpIHtcbiAgICBpID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAga2V5ID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cigwLCBpKSkudG9Mb3dlckNhc2UoKTtcbiAgICB2YWwgPSB1dGlscy50cmltKGxpbmUuc3Vic3RyKGkgKyAxKSk7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICBpZiAocGFyc2VkW2tleV0gJiYgaWdub3JlRHVwbGljYXRlT2YuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGtleSA9PT0gJ3NldC1jb29raWUnKSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gKHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gOiBbXSkuY29uY2F0KFt2YWxdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnNlZFtrZXldID0gcGFyc2VkW2tleV0gPyBwYXJzZWRba2V5XSArICcsICcgKyB2YWwgOiB2YWw7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcGFyc2VkO1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgaGF2ZSBmdWxsIHN1cHBvcnQgb2YgdGhlIEFQSXMgbmVlZGVkIHRvIHRlc3RcbiAgLy8gd2hldGhlciB0aGUgcmVxdWVzdCBVUkwgaXMgb2YgdGhlIHNhbWUgb3JpZ2luIGFzIGN1cnJlbnQgbG9jYXRpb24uXG4gICAgKGZ1bmN0aW9uIHN0YW5kYXJkQnJvd3NlckVudigpIHtcbiAgICAgIHZhciBtc2llID0gLyhtc2llfHRyaWRlbnQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciB1cmxQYXJzaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgIHZhciBvcmlnaW5VUkw7XG5cbiAgICAgIC8qKlxuICAgICogUGFyc2UgYSBVUkwgdG8gZGlzY292ZXIgaXQncyBjb21wb25lbnRzXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIHRvIGJlIHBhcnNlZFxuICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVVSTCh1cmwpIHtcbiAgICAgICAgdmFyIGhyZWYgPSB1cmw7XG5cbiAgICAgICAgaWYgKG1zaWUpIHtcbiAgICAgICAgLy8gSUUgbmVlZHMgYXR0cmlidXRlIHNldCB0d2ljZSB0byBub3JtYWxpemUgcHJvcGVydGllc1xuICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuICAgICAgICAgIGhyZWYgPSB1cmxQYXJzaW5nTm9kZS5ocmVmO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsUGFyc2luZ05vZGUuc2V0QXR0cmlidXRlKCdocmVmJywgaHJlZik7XG5cbiAgICAgICAgLy8gdXJsUGFyc2luZ05vZGUgcHJvdmlkZXMgdGhlIFVybFV0aWxzIGludGVyZmFjZSAtIGh0dHA6Ly91cmwuc3BlYy53aGF0d2cub3JnLyN1cmx1dGlsc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGhyZWY6IHVybFBhcnNpbmdOb2RlLmhyZWYsXG4gICAgICAgICAgcHJvdG9jb2w6IHVybFBhcnNpbmdOb2RlLnByb3RvY29sID8gdXJsUGFyc2luZ05vZGUucHJvdG9jb2wucmVwbGFjZSgvOiQvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0OiB1cmxQYXJzaW5nTm9kZS5ob3N0LFxuICAgICAgICAgIHNlYXJjaDogdXJsUGFyc2luZ05vZGUuc2VhcmNoID8gdXJsUGFyc2luZ05vZGUuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgICBoYXNoOiB1cmxQYXJzaW5nTm9kZS5oYXNoID8gdXJsUGFyc2luZ05vZGUuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICAgIGhvc3RuYW1lOiB1cmxQYXJzaW5nTm9kZS5ob3N0bmFtZSxcbiAgICAgICAgICBwb3J0OiB1cmxQYXJzaW5nTm9kZS5wb3J0LFxuICAgICAgICAgIHBhdGhuYW1lOiAodXJsUGFyc2luZ05vZGUucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpID9cbiAgICAgICAgICAgIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lIDpcbiAgICAgICAgICAgICcvJyArIHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIG9yaWdpblVSTCA9IHJlc29sdmVVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgICAvKipcbiAgICAqIERldGVybWluZSBpZiBhIFVSTCBzaGFyZXMgdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9IHJlcXVlc3RVUkwgVGhlIFVSTCB0byB0ZXN0XG4gICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiwgb3RoZXJ3aXNlIGZhbHNlXG4gICAgKi9cbiAgICAgIHJldHVybiBmdW5jdGlvbiBpc1VSTFNhbWVPcmlnaW4ocmVxdWVzdFVSTCkge1xuICAgICAgICB2YXIgcGFyc2VkID0gKHV0aWxzLmlzU3RyaW5nKHJlcXVlc3RVUkwpKSA/IHJlc29sdmVVUkwocmVxdWVzdFVSTCkgOiByZXF1ZXN0VVJMO1xuICAgICAgICByZXR1cm4gKHBhcnNlZC5wcm90b2NvbCA9PT0gb3JpZ2luVVJMLnByb3RvY29sICYmXG4gICAgICAgICAgICBwYXJzZWQuaG9zdCA9PT0gb3JpZ2luVVJMLmhvc3QpO1xuICAgICAgfTtcbiAgICB9KSgpIDpcblxuICAvLyBOb24gc3RhbmRhcmQgYnJvd3NlciBlbnZzICh3ZWIgd29ya2VycywgcmVhY3QtbmF0aXZlKSBsYWNrIG5lZWRlZCBzdXBwb3J0LlxuICAgIChmdW5jdGlvbiBub25TdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSkoKVxuKTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgc2V0dGxlID0gcmVxdWlyZSgnLi8uLi9jb3JlL3NldHRsZScpO1xudmFyIGNvb2tpZXMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvY29va2llcycpO1xudmFyIGJ1aWxkVVJMID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgYnVpbGRGdWxsUGF0aCA9IHJlcXVpcmUoJy4uL2NvcmUvYnVpbGRGdWxsUGF0aCcpO1xudmFyIHBhcnNlSGVhZGVycyA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9wYXJzZUhlYWRlcnMnKTtcbnZhciBpc1VSTFNhbWVPcmlnaW4gPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luJyk7XG52YXIgY3JlYXRlRXJyb3IgPSByZXF1aXJlKCcuLi9jb3JlL2NyZWF0ZUVycm9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24geGhyQWRhcHRlcihjb25maWcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGRpc3BhdGNoWGhyUmVxdWVzdChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdERhdGEgPSBjb25maWcuZGF0YTtcbiAgICB2YXIgcmVxdWVzdEhlYWRlcnMgPSBjb25maWcuaGVhZGVycztcbiAgICB2YXIgcmVzcG9uc2VUeXBlID0gY29uZmlnLnJlc3BvbnNlVHlwZTtcblxuICAgIGlmICh1dGlscy5pc0Zvcm1EYXRhKHJlcXVlc3REYXRhKSkge1xuICAgICAgZGVsZXRlIHJlcXVlc3RIZWFkZXJzWydDb250ZW50LVR5cGUnXTsgLy8gTGV0IHRoZSBicm93c2VyIHNldCBpdFxuICAgIH1cblxuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAvLyBIVFRQIGJhc2ljIGF1dGhlbnRpY2F0aW9uXG4gICAgaWYgKGNvbmZpZy5hdXRoKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBjb25maWcuYXV0aC51c2VybmFtZSB8fCAnJztcbiAgICAgIHZhciBwYXNzd29yZCA9IGNvbmZpZy5hdXRoLnBhc3N3b3JkID8gdW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGNvbmZpZy5hdXRoLnBhc3N3b3JkKSkgOiAnJztcbiAgICAgIHJlcXVlc3RIZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmFzaWMgJyArIGJ0b2EodXNlcm5hbWUgKyAnOicgKyBwYXNzd29yZCk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bGxQYXRoID0gYnVpbGRGdWxsUGF0aChjb25maWcuYmFzZVVSTCwgY29uZmlnLnVybCk7XG4gICAgcmVxdWVzdC5vcGVuKGNvbmZpZy5tZXRob2QudG9VcHBlckNhc2UoKSwgYnVpbGRVUkwoZnVsbFBhdGgsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKSwgdHJ1ZSk7XG5cbiAgICAvLyBTZXQgdGhlIHJlcXVlc3QgdGltZW91dCBpbiBNU1xuICAgIHJlcXVlc3QudGltZW91dCA9IGNvbmZpZy50aW1lb3V0O1xuXG4gICAgZnVuY3Rpb24gb25sb2FkZW5kKCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIFByZXBhcmUgdGhlIHJlc3BvbnNlXG4gICAgICB2YXIgcmVzcG9uc2VIZWFkZXJzID0gJ2dldEFsbFJlc3BvbnNlSGVhZGVycycgaW4gcmVxdWVzdCA/IHBhcnNlSGVhZGVycyhyZXF1ZXN0LmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSA6IG51bGw7XG4gICAgICB2YXIgcmVzcG9uc2VEYXRhID0gIXJlc3BvbnNlVHlwZSB8fCByZXNwb25zZVR5cGUgPT09ICd0ZXh0JyB8fCAgcmVzcG9uc2VUeXBlID09PSAnanNvbicgP1xuICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVGV4dCA6IHJlcXVlc3QucmVzcG9uc2U7XG4gICAgICB2YXIgcmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHJlc3BvbnNlRGF0YSxcbiAgICAgICAgc3RhdHVzOiByZXF1ZXN0LnN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dDogcmVxdWVzdC5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiByZXNwb25zZUhlYWRlcnMsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICByZXF1ZXN0OiByZXF1ZXN0XG4gICAgICB9O1xuXG4gICAgICBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICgnb25sb2FkZW5kJyBpbiByZXF1ZXN0KSB7XG4gICAgICAvLyBVc2Ugb25sb2FkZW5kIGlmIGF2YWlsYWJsZVxuICAgICAgcmVxdWVzdC5vbmxvYWRlbmQgPSBvbmxvYWRlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExpc3RlbiBmb3IgcmVhZHkgc3RhdGUgdG8gZW11bGF0ZSBvbmxvYWRlbmRcbiAgICAgIHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gaGFuZGxlTG9hZCgpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSByZXF1ZXN0IGVycm9yZWQgb3V0IGFuZCB3ZSBkaWRuJ3QgZ2V0IGEgcmVzcG9uc2UsIHRoaXMgd2lsbCBiZVxuICAgICAgICAvLyBoYW5kbGVkIGJ5IG9uZXJyb3IgaW5zdGVhZFxuICAgICAgICAvLyBXaXRoIG9uZSBleGNlcHRpb246IHJlcXVlc3QgdGhhdCB1c2luZyBmaWxlOiBwcm90b2NvbCwgbW9zdCBicm93c2Vyc1xuICAgICAgICAvLyB3aWxsIHJldHVybiBzdGF0dXMgYXMgMCBldmVuIHRob3VnaCBpdCdzIGEgc3VjY2Vzc2Z1bCByZXF1ZXN0XG4gICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCAmJiAhKHJlcXVlc3QucmVzcG9uc2VVUkwgJiYgcmVxdWVzdC5yZXNwb25zZVVSTC5pbmRleE9mKCdmaWxlOicpID09PSAwKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWFkeXN0YXRlIGhhbmRsZXIgaXMgY2FsbGluZyBiZWZvcmUgb25lcnJvciBvciBvbnRpbWVvdXQgaGFuZGxlcnMsXG4gICAgICAgIC8vIHNvIHdlIHNob3VsZCBjYWxsIG9ubG9hZGVuZCBvbiB0aGUgbmV4dCAndGljaydcbiAgICAgICAgc2V0VGltZW91dChvbmxvYWRlbmQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgYnJvd3NlciByZXF1ZXN0IGNhbmNlbGxhdGlvbiAoYXMgb3Bwb3NlZCB0byBhIG1hbnVhbCBjYW5jZWxsYXRpb24pXG4gICAgcmVxdWVzdC5vbmFib3J0ID0gZnVuY3Rpb24gaGFuZGxlQWJvcnQoKSB7XG4gICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ1JlcXVlc3QgYWJvcnRlZCcsIGNvbmZpZywgJ0VDT05OQUJPUlRFRCcsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSBsb3cgbGV2ZWwgbmV0d29yayBlcnJvcnNcbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIC8vIFJlYWwgZXJyb3JzIGFyZSBoaWRkZW4gZnJvbSB1cyBieSB0aGUgYnJvd3NlclxuICAgICAgLy8gb25lcnJvciBzaG91bGQgb25seSBmaXJlIGlmIGl0J3MgYSBuZXR3b3JrIGVycm9yXG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoJ05ldHdvcmsgRXJyb3InLCBjb25maWcsIG51bGwsIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEhhbmRsZSB0aW1lb3V0XG4gICAgcmVxdWVzdC5vbnRpbWVvdXQgPSBmdW5jdGlvbiBoYW5kbGVUaW1lb3V0KCkge1xuICAgICAgdmFyIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSAndGltZW91dCBvZiAnICsgY29uZmlnLnRpbWVvdXQgKyAnbXMgZXhjZWVkZWQnO1xuICAgICAgaWYgKGNvbmZpZy50aW1lb3V0RXJyb3JNZXNzYWdlKSB7XG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UgPSBjb25maWcudGltZW91dEVycm9yTWVzc2FnZTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChjcmVhdGVFcnJvcihcbiAgICAgICAgdGltZW91dEVycm9yTWVzc2FnZSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBjb25maWcudHJhbnNpdGlvbmFsICYmIGNvbmZpZy50cmFuc2l0aW9uYWwuY2xhcmlmeVRpbWVvdXRFcnJvciA/ICdFVElNRURPVVQnIDogJ0VDT05OQUJPUlRFRCcsXG4gICAgICAgIHJlcXVlc3QpKTtcblxuICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgcmVxdWVzdCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgIC8vIFRoaXMgaXMgb25seSBkb25lIGlmIHJ1bm5pbmcgaW4gYSBzdGFuZGFyZCBicm93c2VyIGVudmlyb25tZW50LlxuICAgIC8vIFNwZWNpZmljYWxseSBub3QgaWYgd2UncmUgaW4gYSB3ZWIgd29ya2VyLCBvciByZWFjdC1uYXRpdmUuXG4gICAgaWYgKHV0aWxzLmlzU3RhbmRhcmRCcm93c2VyRW52KCkpIHtcbiAgICAgIC8vIEFkZCB4c3JmIGhlYWRlclxuICAgICAgdmFyIHhzcmZWYWx1ZSA9IChjb25maWcud2l0aENyZWRlbnRpYWxzIHx8IGlzVVJMU2FtZU9yaWdpbihmdWxsUGF0aCkpICYmIGNvbmZpZy54c3JmQ29va2llTmFtZSA/XG4gICAgICAgIGNvb2tpZXMucmVhZChjb25maWcueHNyZkNvb2tpZU5hbWUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuXG4gICAgICBpZiAoeHNyZlZhbHVlKSB7XG4gICAgICAgIHJlcXVlc3RIZWFkZXJzW2NvbmZpZy54c3JmSGVhZGVyTmFtZV0gPSB4c3JmVmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRkIGhlYWRlcnMgdG8gdGhlIHJlcXVlc3RcbiAgICBpZiAoJ3NldFJlcXVlc3RIZWFkZXInIGluIHJlcXVlc3QpIHtcbiAgICAgIHV0aWxzLmZvckVhY2gocmVxdWVzdEhlYWRlcnMsIGZ1bmN0aW9uIHNldFJlcXVlc3RIZWFkZXIodmFsLCBrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0RGF0YSA9PT0gJ3VuZGVmaW5lZCcgJiYga2V5LnRvTG93ZXJDYXNlKCkgPT09ICdjb250ZW50LXR5cGUnKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIENvbnRlbnQtVHlwZSBpZiBkYXRhIGlzIHVuZGVmaW5lZFxuICAgICAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1trZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgaGVhZGVyIHRvIHRoZSByZXF1ZXN0XG4gICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgdmFsKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHdpdGhDcmVkZW50aWFscyB0byByZXF1ZXN0IGlmIG5lZWRlZFxuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnLndpdGhDcmVkZW50aWFscykpIHtcbiAgICAgIHJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID0gISFjb25maWcud2l0aENyZWRlbnRpYWxzO1xuICAgIH1cblxuICAgIC8vIEFkZCByZXNwb25zZVR5cGUgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAocmVzcG9uc2VUeXBlICYmIHJlc3BvbnNlVHlwZSAhPT0gJ2pzb24nKSB7XG4gICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByb2dyZXNzIGlmIG5lZWRlZFxuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uRG93bmxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIC8vIE5vdCBhbGwgYnJvd3NlcnMgc3VwcG9ydCB1cGxvYWQgZXZlbnRzXG4gICAgaWYgKHR5cGVvZiBjb25maWcub25VcGxvYWRQcm9ncmVzcyA9PT0gJ2Z1bmN0aW9uJyAmJiByZXF1ZXN0LnVwbG9hZCkge1xuICAgICAgcmVxdWVzdC51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25VcGxvYWRQcm9ncmVzcyk7XG4gICAgfVxuXG4gICAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgICAgLy8gSGFuZGxlIGNhbmNlbGxhdGlvblxuICAgICAgY29uZmlnLmNhbmNlbFRva2VuLnByb21pc2UudGhlbihmdW5jdGlvbiBvbkNhbmNlbGVkKGNhbmNlbCkge1xuICAgICAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0LmFib3J0KCk7XG4gICAgICAgIHJlamVjdChjYW5jZWwpO1xuICAgICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0RGF0YSkge1xuICAgICAgcmVxdWVzdERhdGEgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFNlbmQgdGhlIHJlcXVlc3RcbiAgICByZXF1ZXN0LnNlbmQocmVxdWVzdERhdGEpO1xuICB9KTtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xudmFyIG5vcm1hbGl6ZUhlYWRlck5hbWUgPSByZXF1aXJlKCcuL2hlbHBlcnMvbm9ybWFsaXplSGVhZGVyTmFtZScpO1xudmFyIGVuaGFuY2VFcnJvciA9IHJlcXVpcmUoJy4vY29yZS9lbmhhbmNlRXJyb3InKTtcblxudmFyIERFRkFVTFRfQ09OVEVOVF9UWVBFID0ge1xuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbmZ1bmN0aW9uIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCB2YWx1ZSkge1xuICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnMpICYmIHV0aWxzLmlzVW5kZWZpbmVkKGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddKSkge1xuICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdEFkYXB0ZXIoKSB7XG4gIHZhciBhZGFwdGVyO1xuICBpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vIEZvciBicm93c2VycyB1c2UgWEhSIGFkYXB0ZXJcbiAgICBhZGFwdGVyID0gcmVxdWlyZSgnLi9hZGFwdGVycy94aHInKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXScpIHtcbiAgICAvLyBGb3Igbm9kZSB1c2UgSFRUUCBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMvaHR0cCcpO1xuICB9XG4gIHJldHVybiBhZGFwdGVyO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlTYWZlbHkocmF3VmFsdWUsIHBhcnNlciwgZW5jb2Rlcikge1xuICBpZiAodXRpbHMuaXNTdHJpbmcocmF3VmFsdWUpKSB7XG4gICAgdHJ5IHtcbiAgICAgIChwYXJzZXIgfHwgSlNPTi5wYXJzZSkocmF3VmFsdWUpO1xuICAgICAgcmV0dXJuIHV0aWxzLnRyaW0ocmF3VmFsdWUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgIT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gKGVuY29kZXIgfHwgSlNPTi5zdHJpbmdpZnkpKHJhd1ZhbHVlKTtcbn1cblxudmFyIGRlZmF1bHRzID0ge1xuXG4gIHRyYW5zaXRpb25hbDoge1xuICAgIHNpbGVudEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGZvcmNlZEpTT05QYXJzaW5nOiB0cnVlLFxuICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IGZhbHNlXG4gIH0sXG5cbiAgYWRhcHRlcjogZ2V0RGVmYXVsdEFkYXB0ZXIoKSxcblxuICB0cmFuc2Zvcm1SZXF1ZXN0OiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVxdWVzdChkYXRhLCBoZWFkZXJzKSB7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQWNjZXB0Jyk7XG4gICAgbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCAnQ29udGVudC1UeXBlJyk7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNBcnJheUJ1ZmZlcihkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzU3RyZWFtKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0ZpbGUoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQmxvYihkYXRhKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc0FycmF5QnVmZmVyVmlldyhkYXRhKSkge1xuICAgICAgcmV0dXJuIGRhdGEuYnVmZmVyO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMoZGF0YSkpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnKTtcbiAgICAgIHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSB8fCAoaGVhZGVycyAmJiBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9PT0gJ2FwcGxpY2F0aW9uL2pzb24nKSkge1xuICAgICAgc2V0Q29udGVudFR5cGVJZlVuc2V0KGhlYWRlcnMsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICByZXR1cm4gc3RyaW5naWZ5U2FmZWx5KGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgdHJhbnNmb3JtUmVzcG9uc2U6IFtmdW5jdGlvbiB0cmFuc2Zvcm1SZXNwb25zZShkYXRhKSB7XG4gICAgdmFyIHRyYW5zaXRpb25hbCA9IHRoaXMudHJhbnNpdGlvbmFsO1xuICAgIHZhciBzaWxlbnRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuc2lsZW50SlNPTlBhcnNpbmc7XG4gICAgdmFyIGZvcmNlZEpTT05QYXJzaW5nID0gdHJhbnNpdGlvbmFsICYmIHRyYW5zaXRpb25hbC5mb3JjZWRKU09OUGFyc2luZztcbiAgICB2YXIgc3RyaWN0SlNPTlBhcnNpbmcgPSAhc2lsZW50SlNPTlBhcnNpbmcgJiYgdGhpcy5yZXNwb25zZVR5cGUgPT09ICdqc29uJztcblxuICAgIGlmIChzdHJpY3RKU09OUGFyc2luZyB8fCAoZm9yY2VkSlNPTlBhcnNpbmcgJiYgdXRpbHMuaXNTdHJpbmcoZGF0YSkgJiYgZGF0YS5sZW5ndGgpKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKHN0cmljdEpTT05QYXJzaW5nKSB7XG4gICAgICAgICAgaWYgKGUubmFtZSA9PT0gJ1N5bnRheEVycm9yJykge1xuICAgICAgICAgICAgdGhyb3cgZW5oYW5jZUVycm9yKGUsIHRoaXMsICdFX0pTT05fUEFSU0UnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XSxcblxuICAvKipcbiAgICogQSB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyB0byBhYm9ydCBhIHJlcXVlc3QuIElmIHNldCB0byAwIChkZWZhdWx0KSBhXG4gICAqIHRpbWVvdXQgaXMgbm90IGNyZWF0ZWQuXG4gICAqL1xuICB0aW1lb3V0OiAwLFxuXG4gIHhzcmZDb29raWVOYW1lOiAnWFNSRi1UT0tFTicsXG4gIHhzcmZIZWFkZXJOYW1lOiAnWC1YU1JGLVRPS0VOJyxcblxuICBtYXhDb250ZW50TGVuZ3RoOiAtMSxcbiAgbWF4Qm9keUxlbmd0aDogLTEsXG5cbiAgdmFsaWRhdGVTdGF0dXM6IGZ1bmN0aW9uIHZhbGlkYXRlU3RhdHVzKHN0YXR1cykge1xuICAgIHJldHVybiBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcbiAgfVxufTtcblxuZGVmYXVsdHMuaGVhZGVycyA9IHtcbiAgY29tbW9uOiB7XG4gICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L3BsYWluLCAqLyonXG4gIH1cbn07XG5cbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0ge307XG59KTtcblxudXRpbHMuZm9yRWFjaChbJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2RXaXRoRGF0YShtZXRob2QpIHtcbiAgZGVmYXVsdHMuaGVhZGVyc1ttZXRob2RdID0gdXRpbHMubWVyZ2UoREVGQVVMVF9DT05URU5UX1RZUEUpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmYXVsdHM7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi8uLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRyYW5zZm9ybSB0aGUgZGF0YSBmb3IgYSByZXF1ZXN0IG9yIGEgcmVzcG9uc2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IGRhdGEgVGhlIGRhdGEgdG8gYmUgdHJhbnNmb3JtZWRcbiAqIEBwYXJhbSB7QXJyYXl9IGhlYWRlcnMgVGhlIGhlYWRlcnMgZm9yIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlXG4gKiBAcGFyYW0ge0FycmF5fEZ1bmN0aW9ufSBmbnMgQSBzaW5nbGUgZnVuY3Rpb24gb3IgQXJyYXkgb2YgZnVuY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn0gVGhlIHJlc3VsdGluZyB0cmFuc2Zvcm1lZCBkYXRhXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShkYXRhLCBoZWFkZXJzLCBmbnMpIHtcbiAgdmFyIGNvbnRleHQgPSB0aGlzIHx8IGRlZmF1bHRzO1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgdXRpbHMuZm9yRWFjaChmbnMsIGZ1bmN0aW9uIHRyYW5zZm9ybShmbikge1xuICAgIGRhdGEgPSBmbi5jYWxsKGNvbnRleHQsIGRhdGEsIGhlYWRlcnMpO1xuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpc0NhbmNlbCh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWUuX19DQU5DRUxfXyk7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciB0cmFuc2Zvcm1EYXRhID0gcmVxdWlyZSgnLi90cmFuc2Zvcm1EYXRhJyk7XG52YXIgaXNDYW5jZWwgPSByZXF1aXJlKCcuLi9jYW5jZWwvaXNDYW5jZWwnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4uL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuZnVuY3Rpb24gdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpIHtcbiAgaWYgKGNvbmZpZy5jYW5jZWxUb2tlbikge1xuICAgIGNvbmZpZy5jYW5jZWxUb2tlbi50aHJvd0lmUmVxdWVzdGVkKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlciB1c2luZyB0aGUgY29uZmlndXJlZCBhZGFwdGVyLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZyB0aGF0IGlzIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIFByb21pc2UgdG8gYmUgZnVsZmlsbGVkXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGlzcGF0Y2hSZXF1ZXN0KGNvbmZpZykge1xuICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgLy8gRW5zdXJlIGhlYWRlcnMgZXhpc3RcbiAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAvLyBUcmFuc2Zvcm0gcmVxdWVzdCBkYXRhXG4gIGNvbmZpZy5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgIGNvbmZpZyxcbiAgICBjb25maWcuZGF0YSxcbiAgICBjb25maWcuaGVhZGVycyxcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdFxuICApO1xuXG4gIC8vIEZsYXR0ZW4gaGVhZGVyc1xuICBjb25maWcuaGVhZGVycyA9IHV0aWxzLm1lcmdlKFxuICAgIGNvbmZpZy5oZWFkZXJzLmNvbW1vbiB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1tjb25maWcubWV0aG9kXSB8fCB7fSxcbiAgICBjb25maWcuaGVhZGVyc1xuICApO1xuXG4gIHV0aWxzLmZvckVhY2goXG4gICAgWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAncG9zdCcsICdwdXQnLCAncGF0Y2gnLCAnY29tbW9uJ10sXG4gICAgZnVuY3Rpb24gY2xlYW5IZWFkZXJDb25maWcobWV0aG9kKSB7XG4gICAgICBkZWxldGUgY29uZmlnLmhlYWRlcnNbbWV0aG9kXTtcbiAgICB9XG4gICk7XG5cbiAgdmFyIGFkYXB0ZXIgPSBjb25maWcuYWRhcHRlciB8fCBkZWZhdWx0cy5hZGFwdGVyO1xuXG4gIHJldHVybiBhZGFwdGVyKGNvbmZpZykudGhlbihmdW5jdGlvbiBvbkFkYXB0ZXJSZXNvbHV0aW9uKHJlc3BvbnNlKSB7XG4gICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgLy8gVHJhbnNmb3JtIHJlc3BvbnNlIGRhdGFcbiAgICByZXNwb25zZS5kYXRhID0gdHJhbnNmb3JtRGF0YS5jYWxsKFxuICAgICAgY29uZmlnLFxuICAgICAgcmVzcG9uc2UuZGF0YSxcbiAgICAgIHJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICBjb25maWcudHJhbnNmb3JtUmVzcG9uc2VcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9LCBmdW5jdGlvbiBvbkFkYXB0ZXJSZWplY3Rpb24ocmVhc29uKSB7XG4gICAgaWYgKCFpc0NhbmNlbChyZWFzb24pKSB7XG4gICAgICB0aHJvd0lmQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKGNvbmZpZyk7XG5cbiAgICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgICBpZiAocmVhc29uICYmIHJlYXNvbi5yZXNwb25zZSkge1xuICAgICAgICByZWFzb24ucmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEsXG4gICAgICAgICAgcmVhc29uLnJlc3BvbnNlLmhlYWRlcnMsXG4gICAgICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KHJlYXNvbik7XG4gIH0pO1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG4vKipcbiAqIENvbmZpZy1zcGVjaWZpYyBtZXJnZS1mdW5jdGlvbiB3aGljaCBjcmVhdGVzIGEgbmV3IGNvbmZpZy1vYmplY3RcbiAqIGJ5IG1lcmdpbmcgdHdvIGNvbmZpZ3VyYXRpb24gb2JqZWN0cyB0b2dldGhlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnMVxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzJcbiAqIEByZXR1cm5zIHtPYmplY3R9IE5ldyBvYmplY3QgcmVzdWx0aW5nIGZyb20gbWVyZ2luZyBjb25maWcyIHRvIGNvbmZpZzFcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZUNvbmZpZyhjb25maWcxLCBjb25maWcyKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICBjb25maWcyID0gY29uZmlnMiB8fCB7fTtcbiAgdmFyIGNvbmZpZyA9IHt9O1xuXG4gIHZhciB2YWx1ZUZyb21Db25maWcyS2V5cyA9IFsndXJsJywgJ21ldGhvZCcsICdkYXRhJ107XG4gIHZhciBtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cyA9IFsnaGVhZGVycycsICdhdXRoJywgJ3Byb3h5JywgJ3BhcmFtcyddO1xuICB2YXIgZGVmYXVsdFRvQ29uZmlnMktleXMgPSBbXG4gICAgJ2Jhc2VVUkwnLCAndHJhbnNmb3JtUmVxdWVzdCcsICd0cmFuc2Zvcm1SZXNwb25zZScsICdwYXJhbXNTZXJpYWxpemVyJyxcbiAgICAndGltZW91dCcsICd0aW1lb3V0TWVzc2FnZScsICd3aXRoQ3JlZGVudGlhbHMnLCAnYWRhcHRlcicsICdyZXNwb25zZVR5cGUnLCAneHNyZkNvb2tpZU5hbWUnLFxuICAgICd4c3JmSGVhZGVyTmFtZScsICdvblVwbG9hZFByb2dyZXNzJywgJ29uRG93bmxvYWRQcm9ncmVzcycsICdkZWNvbXByZXNzJyxcbiAgICAnbWF4Q29udGVudExlbmd0aCcsICdtYXhCb2R5TGVuZ3RoJywgJ21heFJlZGlyZWN0cycsICd0cmFuc3BvcnQnLCAnaHR0cEFnZW50JyxcbiAgICAnaHR0cHNBZ2VudCcsICdjYW5jZWxUb2tlbicsICdzb2NrZXRQYXRoJywgJ3Jlc3BvbnNlRW5jb2RpbmcnXG4gIF07XG4gIHZhciBkaXJlY3RNZXJnZUtleXMgPSBbJ3ZhbGlkYXRlU3RhdHVzJ107XG5cbiAgZnVuY3Rpb24gZ2V0TWVyZ2VkVmFsdWUodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICBpZiAodXRpbHMuaXNQbGFpbk9iamVjdCh0YXJnZXQpICYmIHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHRhcmdldCwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3Qoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHV0aWxzLm1lcmdlKHt9LCBzb3VyY2UpO1xuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNBcnJheShzb3VyY2UpKSB7XG4gICAgICByZXR1cm4gc291cmNlLnNsaWNlKCk7XG4gICAgfVxuICAgIHJldHVybiBzb3VyY2U7XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZURlZXBQcm9wZXJ0aWVzKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZShjb25maWcxW3Byb3BdLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH1cblxuICB1dGlscy5mb3JFYWNoKHZhbHVlRnJvbUNvbmZpZzJLZXlzLCBmdW5jdGlvbiB2YWx1ZUZyb21Db25maWcyKHByb3ApIHtcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZzJbcHJvcF0pKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzJbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cywgbWVyZ2VEZWVwUHJvcGVydGllcyk7XG5cbiAgdXRpbHMuZm9yRWFjaChkZWZhdWx0VG9Db25maWcyS2V5cywgZnVuY3Rpb24gZGVmYXVsdFRvQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9IGVsc2UgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcxW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcxW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2goZGlyZWN0TWVyZ2VLZXlzLCBmdW5jdGlvbiBtZXJnZShwcm9wKSB7XG4gICAgaWYgKHByb3AgaW4gY29uZmlnMikge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmIChwcm9wIGluIGNvbmZpZzEpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB2YXIgYXhpb3NLZXlzID0gdmFsdWVGcm9tQ29uZmlnMktleXNcbiAgICAuY29uY2F0KG1lcmdlRGVlcFByb3BlcnRpZXNLZXlzKVxuICAgIC5jb25jYXQoZGVmYXVsdFRvQ29uZmlnMktleXMpXG4gICAgLmNvbmNhdChkaXJlY3RNZXJnZUtleXMpO1xuXG4gIHZhciBvdGhlcktleXMgPSBPYmplY3RcbiAgICAua2V5cyhjb25maWcxKVxuICAgIC5jb25jYXQoT2JqZWN0LmtleXMoY29uZmlnMikpXG4gICAgLmZpbHRlcihmdW5jdGlvbiBmaWx0ZXJBeGlvc0tleXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXhpb3NLZXlzLmluZGV4T2Yoa2V5KSA9PT0gLTE7XG4gICAgfSk7XG5cbiAgdXRpbHMuZm9yRWFjaChvdGhlcktleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHJldHVybiBjb25maWc7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBwa2cgPSByZXF1aXJlKCcuLy4uLy4uL3BhY2thZ2UuanNvbicpO1xuXG52YXIgdmFsaWRhdG9ycyA9IHt9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuWydvYmplY3QnLCAnYm9vbGVhbicsICdudW1iZXInLCAnZnVuY3Rpb24nLCAnc3RyaW5nJywgJ3N5bWJvbCddLmZvckVhY2goZnVuY3Rpb24odHlwZSwgaSkge1xuICB2YWxpZGF0b3JzW3R5cGVdID0gZnVuY3Rpb24gdmFsaWRhdG9yKHRoaW5nKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZyA9PT0gdHlwZSB8fCAnYScgKyAoaSA8IDEgPyAnbiAnIDogJyAnKSArIHR5cGU7XG4gIH07XG59KTtcblxudmFyIGRlcHJlY2F0ZWRXYXJuaW5ncyA9IHt9O1xudmFyIGN1cnJlbnRWZXJBcnIgPSBwa2cudmVyc2lvbi5zcGxpdCgnLicpO1xuXG4vKipcbiAqIENvbXBhcmUgcGFja2FnZSB2ZXJzaW9uc1xuICogQHBhcmFtIHtzdHJpbmd9IHZlcnNpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gdGhhblZlcnNpb25cbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc09sZGVyVmVyc2lvbih2ZXJzaW9uLCB0aGFuVmVyc2lvbikge1xuICB2YXIgcGtnVmVyc2lvbkFyciA9IHRoYW5WZXJzaW9uID8gdGhhblZlcnNpb24uc3BsaXQoJy4nKSA6IGN1cnJlbnRWZXJBcnI7XG4gIHZhciBkZXN0VmVyID0gdmVyc2lvbi5zcGxpdCgnLicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgIGlmIChwa2dWZXJzaW9uQXJyW2ldID4gZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChwa2dWZXJzaW9uQXJyW2ldIDwgZGVzdFZlcltpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogVHJhbnNpdGlvbmFsIG9wdGlvbiB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbj99IHZhbGlkYXRvclxuICogQHBhcmFtIHtzdHJpbmc/fSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICogQHJldHVybnMge2Z1bmN0aW9ufVxuICovXG52YWxpZGF0b3JzLnRyYW5zaXRpb25hbCA9IGZ1bmN0aW9uIHRyYW5zaXRpb25hbCh2YWxpZGF0b3IsIHZlcnNpb24sIG1lc3NhZ2UpIHtcbiAgdmFyIGlzRGVwcmVjYXRlZCA9IHZlcnNpb24gJiYgaXNPbGRlclZlcnNpb24odmVyc2lvbik7XG5cbiAgZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShvcHQsIGRlc2MpIHtcbiAgICByZXR1cm4gJ1tBeGlvcyB2JyArIHBrZy52ZXJzaW9uICsgJ10gVHJhbnNpdGlvbmFsIG9wdGlvbiBcXCcnICsgb3B0ICsgJ1xcJycgKyBkZXNjICsgKG1lc3NhZ2UgPyAnLiAnICsgbWVzc2FnZSA6ICcnKTtcbiAgfVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLW5hbWVzXG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3B0LCBvcHRzKSB7XG4gICAgaWYgKHZhbGlkYXRvciA9PT0gZmFsc2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRNZXNzYWdlKG9wdCwgJyBoYXMgYmVlbiByZW1vdmVkIGluICcgKyB2ZXJzaW9uKSk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGVwcmVjYXRlZCAmJiAhZGVwcmVjYXRlZFdhcm5pbmdzW29wdF0pIHtcbiAgICAgIGRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdID0gdHJ1ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdE1lc3NhZ2UoXG4gICAgICAgICAgb3B0LFxuICAgICAgICAgICcgaGFzIGJlZW4gZGVwcmVjYXRlZCBzaW5jZSB2JyArIHZlcnNpb24gKyAnIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIG5lYXIgZnV0dXJlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxpZGF0b3IgPyB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0cykgOiB0cnVlO1xuICB9O1xufTtcblxuLyoqXG4gKiBBc3NlcnQgb2JqZWN0J3MgcHJvcGVydGllcyB0eXBlXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtvYmplY3R9IHNjaGVtYVxuICogQHBhcmFtIHtib29sZWFuP30gYWxsb3dVbmtub3duXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0T3B0aW9ucyhvcHRpb25zLCBzY2hlbWEsIGFsbG93VW5rbm93bikge1xuICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0aW9ucyk7XG4gIHZhciBpID0ga2V5cy5sZW5ndGg7XG4gIHdoaWxlIChpLS0gPiAwKSB7XG4gICAgdmFyIG9wdCA9IGtleXNbaV07XG4gICAgdmFyIHZhbGlkYXRvciA9IHNjaGVtYVtvcHRdO1xuICAgIGlmICh2YWxpZGF0b3IpIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9wdGlvbnNbb3B0XTtcbiAgICAgIHZhciByZXN1bHQgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbGlkYXRvcih2YWx1ZSwgb3B0LCBvcHRpb25zKTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uICcgKyBvcHQgKyAnIG11c3QgYmUgJyArIHJlc3VsdCk7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYgKGFsbG93VW5rbm93biAhPT0gdHJ1ZSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ1Vua25vd24gb3B0aW9uICcgKyBvcHQpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNPbGRlclZlcnNpb246IGlzT2xkZXJWZXJzaW9uLFxuICBhc3NlcnRPcHRpb25zOiBhc3NlcnRPcHRpb25zLFxuICB2YWxpZGF0b3JzOiB2YWxpZGF0b3JzXG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvYnVpbGRVUkwnKTtcbnZhciBJbnRlcmNlcHRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0ludGVyY2VwdG9yTWFuYWdlcicpO1xudmFyIGRpc3BhdGNoUmVxdWVzdCA9IHJlcXVpcmUoJy4vZGlzcGF0Y2hSZXF1ZXN0Jyk7XG52YXIgbWVyZ2VDb25maWcgPSByZXF1aXJlKCcuL21lcmdlQ29uZmlnJyk7XG52YXIgdmFsaWRhdG9yID0gcmVxdWlyZSgnLi4vaGVscGVycy92YWxpZGF0b3InKTtcblxudmFyIHZhbGlkYXRvcnMgPSB2YWxpZGF0b3IudmFsaWRhdG9ycztcbi8qKlxuICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGluc3RhbmNlQ29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIEF4aW9zKGluc3RhbmNlQ29uZmlnKSB7XG4gIHRoaXMuZGVmYXVsdHMgPSBpbnN0YW5jZUNvbmZpZztcbiAgdGhpcy5pbnRlcmNlcHRvcnMgPSB7XG4gICAgcmVxdWVzdDogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpLFxuICAgIHJlc3BvbnNlOiBuZXcgSW50ZXJjZXB0b3JNYW5hZ2VyKClcbiAgfTtcbn1cblxuLyoqXG4gKiBEaXNwYXRjaCBhIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcgc3BlY2lmaWMgZm9yIHRoaXMgcmVxdWVzdCAobWVyZ2VkIHdpdGggdGhpcy5kZWZhdWx0cylcbiAqL1xuQXhpb3MucHJvdG90eXBlLnJlcXVlc3QgPSBmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZykge1xuICAvKmVzbGludCBuby1wYXJhbS1yZWFzc2lnbjowKi9cbiAgLy8gQWxsb3cgZm9yIGF4aW9zKCdleGFtcGxlL3VybCdbLCBjb25maWddKSBhIGxhIGZldGNoIEFQSVxuICBpZiAodHlwZW9mIGNvbmZpZyA9PT0gJ3N0cmluZycpIHtcbiAgICBjb25maWcgPSBhcmd1bWVudHNbMV0gfHwge307XG4gICAgY29uZmlnLnVybCA9IGFyZ3VtZW50c1swXTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcgPSBjb25maWcgfHwge307XG4gIH1cblxuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuXG4gIC8vIFNldCBjb25maWcubWV0aG9kXG4gIGlmIChjb25maWcubWV0aG9kKSB7XG4gICAgY29uZmlnLm1ldGhvZCA9IGNvbmZpZy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIGlmICh0aGlzLmRlZmF1bHRzLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSB0aGlzLmRlZmF1bHRzLm1ldGhvZC50b0xvd2VyQ2FzZSgpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZpZy5tZXRob2QgPSAnZ2V0JztcbiAgfVxuXG4gIHZhciB0cmFuc2l0aW9uYWwgPSBjb25maWcudHJhbnNpdGlvbmFsO1xuXG4gIGlmICh0cmFuc2l0aW9uYWwgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhbGlkYXRvci5hc3NlcnRPcHRpb25zKHRyYW5zaXRpb25hbCwge1xuICAgICAgc2lsZW50SlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJyksXG4gICAgICBmb3JjZWRKU09OUGFyc2luZzogdmFsaWRhdG9ycy50cmFuc2l0aW9uYWwodmFsaWRhdG9ycy5ib29sZWFuLCAnMS4wLjAnKSxcbiAgICAgIGNsYXJpZnlUaW1lb3V0RXJyb3I6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJylcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICAvLyBmaWx0ZXIgb3V0IHNraXBwZWQgaW50ZXJjZXB0b3JzXG4gIHZhciByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB2YXIgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gdHJ1ZTtcbiAgdGhpcy5pbnRlcmNlcHRvcnMucmVxdWVzdC5mb3JFYWNoKGZ1bmN0aW9uIHVuc2hpZnRSZXF1ZXN0SW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgaWYgKHR5cGVvZiBpbnRlcmNlcHRvci5ydW5XaGVuID09PSAnZnVuY3Rpb24nICYmIGludGVyY2VwdG9yLnJ1bldoZW4oY29uZmlnKSA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgPSBzeW5jaHJvbm91c1JlcXVlc3RJbnRlcmNlcHRvcnMgJiYgaW50ZXJjZXB0b3Iuc3luY2hyb25vdXM7XG5cbiAgICByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi51bnNoaWZ0KGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluID0gW107XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlc3BvbnNlLmZvckVhY2goZnVuY3Rpb24gcHVzaFJlc3BvbnNlSW50ZXJjZXB0b3JzKGludGVyY2VwdG9yKSB7XG4gICAgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnB1c2goaW50ZXJjZXB0b3IuZnVsZmlsbGVkLCBpbnRlcmNlcHRvci5yZWplY3RlZCk7XG4gIH0pO1xuXG4gIHZhciBwcm9taXNlO1xuXG4gIGlmICghc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzKSB7XG4gICAgdmFyIGNoYWluID0gW2Rpc3BhdGNoUmVxdWVzdCwgdW5kZWZpbmVkXTtcblxuICAgIEFycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGNoYWluLCByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbik7XG4gICAgY2hhaW4gPSBjaGFpbi5jb25jYXQocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluKTtcblxuICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoY29uZmlnKTtcbiAgICB3aGlsZSAoY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGNoYWluLnNoaWZ0KCksIGNoYWluLnNoaWZ0KCkpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cblxuICB2YXIgbmV3Q29uZmlnID0gY29uZmlnO1xuICB3aGlsZSAocmVxdWVzdEludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgdmFyIG9uRnVsZmlsbGVkID0gcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKTtcbiAgICB2YXIgb25SZWplY3RlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0NvbmZpZyA9IG9uRnVsZmlsbGVkKG5ld0NvbmZpZyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIG9uUmVqZWN0ZWQoZXJyb3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdHJ5IHtcbiAgICBwcm9taXNlID0gZGlzcGF0Y2hSZXF1ZXN0KG5ld0NvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxuXG4gIHdoaWxlIChyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4ubGVuZ3RoKSB7XG4gICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihyZXNwb25zZUludGVyY2VwdG9yQ2hhaW4uc2hpZnQoKSwgcmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCkpO1xuICB9XG5cbiAgcmV0dXJuIHByb21pc2U7XG59O1xuXG5BeGlvcy5wcm90b3R5cGUuZ2V0VXJpID0gZnVuY3Rpb24gZ2V0VXJpKGNvbmZpZykge1xuICBjb25maWcgPSBtZXJnZUNvbmZpZyh0aGlzLmRlZmF1bHRzLCBjb25maWcpO1xuICByZXR1cm4gYnVpbGRVUkwoY29uZmlnLnVybCwgY29uZmlnLnBhcmFtcywgY29uZmlnLnBhcmFtc1NlcmlhbGl6ZXIpLnJlcGxhY2UoL15cXD8vLCAnJyk7XG59O1xuXG4vLyBQcm92aWRlIGFsaWFzZXMgZm9yIHN1cHBvcnRlZCByZXF1ZXN0IG1ldGhvZHNcbnV0aWxzLmZvckVhY2goWydkZWxldGUnLCAnZ2V0JywgJ2hlYWQnLCAnb3B0aW9ucyddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kTm9EYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiAoY29uZmlnIHx8IHt9KS5kYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIC8qZXNsaW50IGZ1bmMtbmFtZXM6MCovXG4gIEF4aW9zLnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odXJsLCBkYXRhLCBjb25maWcpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0KG1lcmdlQ29uZmlnKGNvbmZpZyB8fCB7fSwge1xuICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IGRhdGFcbiAgICB9KSk7XG4gIH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBeGlvcztcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEEgYENhbmNlbGAgaXMgYW4gb2JqZWN0IHRoYXQgaXMgdGhyb3duIHdoZW4gYW4gb3BlcmF0aW9uIGlzIGNhbmNlbGVkLlxuICpcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtzdHJpbmc9fSBtZXNzYWdlIFRoZSBtZXNzYWdlLlxuICovXG5mdW5jdGlvbiBDYW5jZWwobWVzc2FnZSkge1xuICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xufVxuXG5DYW5jZWwucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiAnQ2FuY2VsJyArICh0aGlzLm1lc3NhZ2UgPyAnOiAnICsgdGhpcy5tZXNzYWdlIDogJycpO1xufTtcblxuQ2FuY2VsLnByb3RvdHlwZS5fX0NBTkNFTF9fID0gdHJ1ZTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW5jZWw7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIENhbmNlbCA9IHJlcXVpcmUoJy4vQ2FuY2VsJyk7XG5cbi8qKlxuICogQSBgQ2FuY2VsVG9rZW5gIGlzIGFuIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIGFuIG9wZXJhdGlvbi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGV4ZWN1dG9yIFRoZSBleGVjdXRvciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsVG9rZW4oZXhlY3V0b3IpIHtcbiAgaWYgKHR5cGVvZiBleGVjdXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V4ZWN1dG9yIG11c3QgYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciByZXNvbHZlUHJvbWlzZTtcbiAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gcHJvbWlzZUV4ZWN1dG9yKHJlc29sdmUpIHtcbiAgICByZXNvbHZlUHJvbWlzZSA9IHJlc29sdmU7XG4gIH0pO1xuXG4gIHZhciB0b2tlbiA9IHRoaXM7XG4gIGV4ZWN1dG9yKGZ1bmN0aW9uIGNhbmNlbChtZXNzYWdlKSB7XG4gICAgaWYgKHRva2VuLnJlYXNvbikge1xuICAgICAgLy8gQ2FuY2VsbGF0aW9uIGhhcyBhbHJlYWR5IGJlZW4gcmVxdWVzdGVkXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdG9rZW4ucmVhc29uID0gbmV3IENhbmNlbChtZXNzYWdlKTtcbiAgICByZXNvbHZlUHJvbWlzZSh0b2tlbi5yZWFzb24pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBUaHJvd3MgYSBgQ2FuY2VsYCBpZiBjYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLlxuICovXG5DYW5jZWxUb2tlbi5wcm90b3R5cGUudGhyb3dJZlJlcXVlc3RlZCA9IGZ1bmN0aW9uIHRocm93SWZSZXF1ZXN0ZWQoKSB7XG4gIGlmICh0aGlzLnJlYXNvbikge1xuICAgIHRocm93IHRoaXMucmVhc29uO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgYSBuZXcgYENhbmNlbFRva2VuYCBhbmQgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCxcbiAqIGNhbmNlbHMgdGhlIGBDYW5jZWxUb2tlbmAuXG4gKi9cbkNhbmNlbFRva2VuLnNvdXJjZSA9IGZ1bmN0aW9uIHNvdXJjZSgpIHtcbiAgdmFyIGNhbmNlbDtcbiAgdmFyIHRva2VuID0gbmV3IENhbmNlbFRva2VuKGZ1bmN0aW9uIGV4ZWN1dG9yKGMpIHtcbiAgICBjYW5jZWwgPSBjO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICB0b2tlbjogdG9rZW4sXG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsVG9rZW47XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBTeW50YWN0aWMgc3VnYXIgZm9yIGludm9raW5nIGEgZnVuY3Rpb24gYW5kIGV4cGFuZGluZyBhbiBhcnJheSBmb3IgYXJndW1lbnRzLlxuICpcbiAqIENvbW1vbiB1c2UgY2FzZSB3b3VsZCBiZSB0byB1c2UgYEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseWAuXG4gKlxuICogIGBgYGpzXG4gKiAgZnVuY3Rpb24gZih4LCB5LCB6KSB7fVxuICogIHZhciBhcmdzID0gWzEsIDIsIDNdO1xuICogIGYuYXBwbHkobnVsbCwgYXJncyk7XG4gKiAgYGBgXG4gKlxuICogV2l0aCBgc3ByZWFkYCB0aGlzIGV4YW1wbGUgY2FuIGJlIHJlLXdyaXR0ZW4uXG4gKlxuICogIGBgYGpzXG4gKiAgc3ByZWFkKGZ1bmN0aW9uKHgsIHksIHopIHt9KShbMSwgMiwgM10pO1xuICogIGBgYFxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3ByZWFkKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKGFycikge1xuICAgIHJldHVybiBjYWxsYmFjay5hcHBseShudWxsLCBhcnIpO1xuICB9O1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3NcbiAqXG4gKiBAcGFyYW0geyp9IHBheWxvYWQgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSBwYXlsb2FkIGlzIGFuIGVycm9yIHRocm93biBieSBBeGlvcywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBeGlvc0Vycm9yKHBheWxvYWQpIHtcbiAgcmV0dXJuICh0eXBlb2YgcGF5bG9hZCA9PT0gJ29iamVjdCcpICYmIChwYXlsb2FkLmlzQXhpb3NFcnJvciA9PT0gdHJ1ZSk7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnLi9oZWxwZXJzL2JpbmQnKTtcbnZhciBBeGlvcyA9IHJlcXVpcmUoJy4vY29yZS9BeGlvcycpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9jb3JlL21lcmdlQ29uZmlnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuL2RlZmF1bHRzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGFuIGluc3RhbmNlIG9mIEF4aW9zXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRDb25maWcgVGhlIGRlZmF1bHQgY29uZmlnIGZvciB0aGUgaW5zdGFuY2VcbiAqIEByZXR1cm4ge0F4aW9zfSBBIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICovXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShkZWZhdWx0Q29uZmlnKSB7XG4gIHZhciBjb250ZXh0ID0gbmV3IEF4aW9zKGRlZmF1bHRDb25maWcpO1xuICB2YXIgaW5zdGFuY2UgPSBiaW5kKEF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0LCBjb250ZXh0KTtcblxuICAvLyBDb3B5IGF4aW9zLnByb3RvdHlwZSB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIEF4aW9zLnByb3RvdHlwZSwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBjb250ZXh0IHRvIGluc3RhbmNlXG4gIHV0aWxzLmV4dGVuZChpbnN0YW5jZSwgY29udGV4dCk7XG5cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG4vLyBDcmVhdGUgdGhlIGRlZmF1bHQgaW5zdGFuY2UgdG8gYmUgZXhwb3J0ZWRcbnZhciBheGlvcyA9IGNyZWF0ZUluc3RhbmNlKGRlZmF1bHRzKTtcblxuLy8gRXhwb3NlIEF4aW9zIGNsYXNzIHRvIGFsbG93IGNsYXNzIGluaGVyaXRhbmNlXG5heGlvcy5BeGlvcyA9IEF4aW9zO1xuXG4vLyBGYWN0b3J5IGZvciBjcmVhdGluZyBuZXcgaW5zdGFuY2VzXG5heGlvcy5jcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaW5zdGFuY2VDb25maWcpIHtcbiAgcmV0dXJuIGNyZWF0ZUluc3RhbmNlKG1lcmdlQ29uZmlnKGF4aW9zLmRlZmF1bHRzLCBpbnN0YW5jZUNvbmZpZykpO1xufTtcblxuLy8gRXhwb3NlIENhbmNlbCAmIENhbmNlbFRva2VuXG5heGlvcy5DYW5jZWwgPSByZXF1aXJlKCcuL2NhbmNlbC9DYW5jZWwnKTtcbmF4aW9zLkNhbmNlbFRva2VuID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsVG9rZW4nKTtcbmF4aW9zLmlzQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvaXNDYW5jZWwnKTtcblxuLy8gRXhwb3NlIGFsbC9zcHJlYWRcbmF4aW9zLmFsbCA9IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xufTtcbmF4aW9zLnNwcmVhZCA9IHJlcXVpcmUoJy4vaGVscGVycy9zcHJlYWQnKTtcblxuLy8gRXhwb3NlIGlzQXhpb3NFcnJvclxuYXhpb3MuaXNBeGlvc0Vycm9yID0gcmVxdWlyZSgnLi9oZWxwZXJzL2lzQXhpb3NFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGF4aW9zO1xuXG4vLyBBbGxvdyB1c2Ugb2YgZGVmYXVsdCBpbXBvcnQgc3ludGF4IGluIFR5cGVTY3JpcHRcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBheGlvcztcbiIsCiAgICAiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRBbGxBdWRpb0Jhc2U2NCA9IGV4cG9ydHMuZ2V0QXVkaW9CYXNlNjQgPSB2b2lkIDA7XG52YXIgYXNzZXJ0SW5wdXRUeXBlc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2Fzc2VydElucHV0VHlwZXNcIikpO1xudmFyIGF4aW9zXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImF4aW9zXCIpKTtcbnZhciBzcGxpdExvbmdUZXh0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vc3BsaXRMb25nVGV4dFwiKSk7XG4vKipcbiAqIEdldCBcIkdvb2dsZSBUVFNcIiBhdWRpbyBiYXNlNjQgdGV4dFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSAgIHRleHQgICAgICAgICAgIGxlbmd0aCBzaG91bGQgYmUgbGVzcyB0aGFuIDIwMCBjaGFyYWN0ZXJzXG4gKiBAcGFyYW0ge29iamVjdD99ICBvcHRpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gIG9wdGlvbi5sYW5nICAgIGRlZmF1bHQgaXMgXCJlblwiXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBvcHRpb24uc2xvdyAgICBkZWZhdWx0IGlzIGZhbHNlXG4gKiBAcGFyYW0ge3N0cmluZz99ICBvcHRpb24uaG9zdCAgICBkZWZhdWx0IGlzIFwiaHR0cHM6Ly90cmFuc2xhdGUuZ29vZ2xlLmNvbVwiXG4gKiBAcGFyYW0ge251bWJlcj99ICBvcHRpb24udGltZW91dCBkZWZhdWx0IGlzIDEwMDAwIChtcylcbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IHVybFxuICovXG52YXIgZ2V0QXVkaW9CYXNlNjQgPSBmdW5jdGlvbiAodGV4dCwgX2EpIHtcbiAgICB2YXIgX2IgPSBfYSA9PT0gdm9pZCAwID8ge30gOiBfYSwgX2MgPSBfYi5sYW5nLCBsYW5nID0gX2MgPT09IHZvaWQgMCA/ICdlbicgOiBfYywgX2QgPSBfYi5zbG93LCBzbG93ID0gX2QgPT09IHZvaWQgMCA/IGZhbHNlIDogX2QsIF9lID0gX2IuaG9zdCwgaG9zdCA9IF9lID09PSB2b2lkIDAgPyAnaHR0cHM6Ly90cmFuc2xhdGUuZ29vZ2xlLmNvbScgOiBfZSwgX2YgPSBfYi50aW1lb3V0LCB0aW1lb3V0ID0gX2YgPT09IHZvaWQgMCA/IDEwMDAwIDogX2Y7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXMsIHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfZykge1xuICAgICAgICAgICAgc3dpdGNoIChfZy5sYWJlbCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0SW5wdXRUeXBlc18xLmRlZmF1bHQodGV4dCwgbGFuZywgc2xvdywgaG9zdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGltZW91dCAhPT0gJ251bWJlcicgfHwgdGltZW91dCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd0aW1lb3V0IHNob3VsZCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJ0ZXh0IGxlbmd0aCAoXCIgKyB0ZXh0Lmxlbmd0aCArIFwiKSBzaG91bGQgYmUgbGVzcyB0aGFuIDIwMCBjaGFyYWN0ZXJzLiBUcnkgXFxcImdldEFsbEF1ZGlvQmFzZTY0KHRleHQsIFtvcHRpb25dKVxcXCIgZm9yIGxvbmcgdGV4dC5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgYXhpb3NfMS5kZWZhdWx0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlVVJMOiBob3N0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogJy9fL1RyYW5zbGF0ZVdlYnNlcnZlclVpL2RhdGEvYmF0Y2hleGVjdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6ICdmLnJlcT0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtbJ2pRMW9sYycsIEpTT04uc3RyaW5naWZ5KFt0ZXh0LCBsYW5nLCBzbG93ID8gdHJ1ZSA6IG51bGwsICdudWxsJ10pLCBudWxsLCAnZ2VuZXJpYyddXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSldO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gX2cuc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gZXZhbChyZXMuZGF0YS5zbGljZSg1KSlbMF1bMl07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcnNlIHJlc3BvbnNlIGZhaWxlZDpcXG5cIiArIHJlcy5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayB0aGUgcmVzdWx0LiBUaGUgcmVzdWx0IHdpbGwgYmUgbnVsbCBpZiBnaXZlbiB0aGUgbGFuZyBkb2Vzbid0IGV4aXN0XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJsYW5nIFxcXCJcIiArIGxhbmcgKyBcIlxcXCIgbWlnaHQgbm90IGV4aXN0XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIDIuIGNvbnRpbnVlIHRvIHBhcnNlIGF1ZGlvIGJhc2U2NCBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGV2YWwocmVzdWx0KVswXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicGFyc2UgcmVzcG9uc2UgZmFpbGVkOlxcblwiICsgcmVzLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCByZXN1bHRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5leHBvcnRzLmdldEF1ZGlvQmFzZTY0ID0gZ2V0QXVkaW9CYXNlNjQ7XG4vKipcbiAqIEB0eXBlZGVmIHtvYmplY3R9IFJlc3VsdFxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNob3J0VGV4dFxuICogQHByb3BlcnR5IHtzdHJpbmd9IGJhc2U2NFxuICovXG4vKipcbiAqIFNwbGl0IHRoZSBsb25nIHRleHQgaW50byBtdWx0aXBsZSBzaG9ydCB0ZXh0IGFuZCBnZW5lcmF0ZSBhdWRpbyBiYXNlNjQgbGlzdFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSAgIHRleHRcbiAqIEBwYXJhbSB7b2JqZWN0P30gIG9wdGlvblxuICogQHBhcmFtIHtzdHJpbmc/fSAgb3B0aW9uLmxhbmcgICAgICAgIGRlZmF1bHQgaXMgXCJlblwiXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBvcHRpb24uc2xvdyAgICAgICAgZGVmYXVsdCBpcyBmYWxzZVxuICogQHBhcmFtIHtzdHJpbmc/fSAgb3B0aW9uLmhvc3QgICAgICAgIGRlZmF1bHQgaXMgXCJodHRwczovL3RyYW5zbGF0ZS5nb29nbGUuY29tXCJcbiAqIEBwYXJhbSB7c3RyaW5nP30gIG9wdGlvbi5zcGxpdFB1bmN0ICBzcGxpdCBwdW5jdHVhdGlvblxuICogQHBhcmFtIHtudW1iZXI/fSAgb3B0aW9uLnRpbWVvdXQgICAgIGRlZmF1bHQgaXMgMTAwMDAgKG1zKVxuICogQHJldHVybiB7UmVzdWx0W119IHRoZSBsaXN0IHdpdGggc2hvcnQgdGV4dCBhbmQgYXVkaW8gYmFzZTY0XG4gKi9cbnZhciBnZXRBbGxBdWRpb0Jhc2U2NCA9IGZ1bmN0aW9uICh0ZXh0LCBfYSkge1xuICAgIHZhciBfYiA9IF9hID09PSB2b2lkIDAgPyB7fSA6IF9hLCBfYyA9IF9iLmxhbmcsIGxhbmcgPSBfYyA9PT0gdm9pZCAwID8gJ2VuJyA6IF9jLCBfZCA9IF9iLnNsb3csIHNsb3cgPSBfZCA9PT0gdm9pZCAwID8gZmFsc2UgOiBfZCwgX2UgPSBfYi5ob3N0LCBob3N0ID0gX2UgPT09IHZvaWQgMCA/ICdodHRwczovL3RyYW5zbGF0ZS5nb29nbGUuY29tJyA6IF9lLCBfZiA9IF9iLnNwbGl0UHVuY3QsIHNwbGl0UHVuY3QgPSBfZiA9PT0gdm9pZCAwID8gJycgOiBfZiwgX2cgPSBfYi50aW1lb3V0LCB0aW1lb3V0ID0gX2cgPT09IHZvaWQgMCA/IDEwMDAwIDogX2c7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzaG9ydFRleHRMaXN0LCBiYXNlNjRMaXN0LCByZXN1bHQsIGksIHNob3J0VGV4dCwgYmFzZTY0O1xuICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9oKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKF9oLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICBhc3NlcnRJbnB1dFR5cGVzXzEuZGVmYXVsdCh0ZXh0LCBsYW5nLCBzbG93LCBob3N0KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzcGxpdFB1bmN0ICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3BsaXRQdW5jdCBzaG91bGQgYmUgYSBzdHJpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRpbWVvdXQgIT09ICdudW1iZXInIHx8IHRpbWVvdXQgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGltZW91dCBzaG91bGQgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzaG9ydFRleHRMaXN0ID0gc3BsaXRMb25nVGV4dF8xLmRlZmF1bHQodGV4dCwgeyBzcGxpdFB1bmN0OiBzcGxpdFB1bmN0IH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBQcm9taXNlLmFsbChzaG9ydFRleHRMaXN0Lm1hcChmdW5jdGlvbiAoc2hvcnRUZXh0KSB7IHJldHVybiBleHBvcnRzLmdldEF1ZGlvQmFzZTY0KHNob3J0VGV4dCwgeyBsYW5nOiBsYW5nLCBzbG93OiBzbG93LCBob3N0OiBob3N0LCB0aW1lb3V0OiB0aW1lb3V0IH0pOyB9KSldO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgYmFzZTY0TGlzdCA9IF9oLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzaG9ydFRleHRMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaG9ydFRleHQgPSBzaG9ydFRleHRMaXN0W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZTY0ID0gYmFzZTY0TGlzdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHsgc2hvcnRUZXh0OiBzaG9ydFRleHQsIGJhc2U2NDogYmFzZTY0IH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCByZXN1bHRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5leHBvcnRzLmdldEFsbEF1ZGlvQmFzZTY0ID0gZ2V0QWxsQXVkaW9CYXNlNjQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZXRBdWRpb0Jhc2U2NC5qcy5tYXAiLAogICAgIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXRBbGxBdWRpb0Jhc2U2NCA9IGV4cG9ydHMuZ2V0QXVkaW9CYXNlNjQgPSBleHBvcnRzLmdldEFsbEF1ZGlvVXJscyA9IGV4cG9ydHMuZ2V0QXVkaW9VcmwgPSB2b2lkIDA7XG52YXIgZ2V0QXVkaW9VcmxfMSA9IHJlcXVpcmUoXCIuL2dldEF1ZGlvVXJsXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZ2V0QXVkaW9VcmxcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGdldEF1ZGlvVXJsXzEuZ2V0QXVkaW9Vcmw7IH0gfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJnZXRBbGxBdWRpb1VybHNcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGdldEF1ZGlvVXJsXzEuZ2V0QWxsQXVkaW9VcmxzOyB9IH0pO1xudmFyIGdldEF1ZGlvQmFzZTY0XzEgPSByZXF1aXJlKFwiLi9nZXRBdWRpb0Jhc2U2NFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdldEF1ZGlvQmFzZTY0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBnZXRBdWRpb0Jhc2U2NF8xLmdldEF1ZGlvQmFzZTY0OyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZ2V0QWxsQXVkaW9CYXNlNjRcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGdldEF1ZGlvQmFzZTY0XzEuZ2V0QWxsQXVkaW9CYXNlNjQ7IH0gfSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiLAogICAgIi8vIEJhY2tncm91bmQgc2NyaXB0IGZvciBoYW5kbGluZyBleHRlbnNpb24gbGlmZWN5Y2xlIGFuZCBBUEkgbWFuYWdlbWVudFxyXG5pbXBvcnQgKiBhcyBnb29nbGVUVFMgZnJvbSBcImdvb2dsZS10dHMtYXBpXCI7XHJcblxyXG5jaHJvbWUucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XHJcbiAgY29uc29sZS5sb2coXCJZb3VUdWJlIFJKIE1vZGUgZXh0ZW5zaW9uIGluc3RhbGxlZFwiKTtcclxuXHJcbiAgLy8gU2V0IGRlZmF1bHQgc2V0dGluZ3NcclxuICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7XHJcbiAgICBjb21tZW50YXJ5TGVuZ3RoOiBcInNob3J0XCIsXHJcbiAgICByalN0eWxlOiBcInNhcmNhc3RpY1wiLFxyXG4gICAgdm9pY2VHZW5kZXI6IFwibWFsZVwiLFxyXG4gICAgdm9sdW1lRHVja2luZzogNzAsXHJcbiAgICBkYXJrTW9kZTogZmFsc2UsXHJcbiAgICBhdXRvU3RhcnQ6IGZhbHNlLFxyXG4gIH0pO1xyXG59KTtcclxuXHJcbi8vIEhhbmRsZSBtZXNzYWdlcyBmcm9tIGNvbnRlbnQgc2NyaXB0XHJcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcclxuICBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwibG9nQ29tbWVudGFyeVwiKSB7XHJcbiAgICAvLyBTdG9yZSBjb21tZW50YXJ5IGxvZ3NcclxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJjb21tZW50YXJ5TG9nc1wiXSwgKHJlc3VsdCkgPT4ge1xyXG4gICAgICBjb25zdCBsb2dzID0gcmVzdWx0LmNvbW1lbnRhcnlMb2dzIHx8IFtdO1xyXG4gICAgICBsb2dzLnB1c2goe1xyXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgICAgIGN1cnJlbnRTb25nOiByZXF1ZXN0LmN1cnJlbnRTb25nLFxyXG4gICAgICAgIG5leHRTb25nOiByZXF1ZXN0Lm5leHRTb25nLFxyXG4gICAgICAgIHNjcmlwdDogcmVxdWVzdC5zY3JpcHQsXHJcbiAgICAgICAgdXJsOiBzZW5kZXI/LnRhYj8udXJsLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIEtlZXAgb25seSBsYXN0IDEwMCBsb2dzXHJcbiAgICAgIGlmIChsb2dzLmxlbmd0aCA+IDEwMCkge1xyXG4gICAgICAgIGxvZ3Muc3BsaWNlKDAsIGxvZ3MubGVuZ3RoIC0gMTAwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgY29tbWVudGFyeUxvZ3M6IGxvZ3MgfSk7XHJcbiAgICB9KTtcclxuICB9IGVsc2UgaWYgKHJlcXVlc3QuYWN0aW9uID09PSBcImNhbGxDaGF0SmltbXlcIikge1xyXG4gICAgZmV0Y2goXCJodHRwczovL2NoYXRqaW1teS5haS9hcGkvY2hhdFwiLCB7XHJcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdC5wYXlsb2FkKSxcclxuICAgIH0pXHJcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2hhdEppbW15IEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKCh0ZXh0KSA9PiBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiB0ZXh0IH0pKVxyXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlXHJcbiAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJnZXRUVFNBdWRpb1wiKSB7XHJcbiAgICBjb25zdCB7IHRleHQsIGxhbmcgfSA9IHJlcXVlc3QucGF5bG9hZDtcclxuICAgIFxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzdWx0cyA9IGdvb2dsZVRUUy5nZXRBbGxBdWRpb1VybHModGV4dCwge1xyXG4gICAgICAgIGxhbmc6IGxhbmcsXHJcbiAgICAgICAgc2xvdzogZmFsc2UsXHJcbiAgICAgICAgaG9zdDogXCJodHRwczovL3RyYW5zbGF0ZS5nb29nbGUuY29tXCIsXHJcbiAgICAgICAgc3BsaXRQdW5jdDogXCIuIFwiLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIFByb21pc2UuYWxsKFxyXG4gICAgICAgIHJlc3VsdHMubWFwKGFzeW5jIChpdGVtKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGl0ZW0udXJsKTtcclxuICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggYXVkaW86ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gQ29udmVydCBBcnJheUJ1ZmZlciB0byBCYXNlNjRcclxuICAgICAgICAgIGNvbnN0IHVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcik7XHJcbiAgICAgICAgICBsZXQgYmluYXJ5ID0gXCJcIjtcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdWludDhBcnJheS5ieXRlTGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodWludDhBcnJheVtpXSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gYnRvYShiaW5hcnkpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgIClcclxuICAgICAgICAudGhlbigoYmFzZTY0Q2h1bmtzKSA9PiB7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBkYXRhOiBiYXNlNjRDaHVua3MgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIChlcnJvcjogYW55KSB7XHJcbiAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlXHJcbiAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJjYWxsTHlyaWNzXCIpIHtcclxuICAgIGZldGNoKGBodHRwczovL2xyY2xpYi5uZXQvYXBpL3NlYXJjaD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHJlcXVlc3QucXVlcnkpfWAsIHtcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICB9LFxyXG4gICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICB9KVxyXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEx5cmljcyBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbigoZGF0YSkgPT4gc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YSB9KSlcclxuICAgICAgLmNhdGNoKChlcnJvcikgPT4gc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcclxuICAgIHJldHVybiB0cnVlOyAvLyBLZWVwIG1lc3NhZ2UgY2hhbm5lbCBvcGVuIGZvciBhc3luYyByZXNwb25zZVxyXG4gIH0gZWxzZSBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwiY2FsbEdlbWluaVwiKSB7XHJcbiAgICBmZXRjaChcclxuICAgICAgXCJodHRwczovL2dlbmVyYXRpdmVsYW5ndWFnZS5nb29nbGVhcGlzLmNvbS92MWJldGEvbW9kZWxzL2dlbWluaS0yLjAtZmxhc2g6Z2VuZXJhdGVDb250ZW50XCIsXHJcbiAgICAgIHtcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgXCJYLWdvb2ctYXBpLWtleVwiOiByZXF1ZXN0LmFwaUtleSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3QucGF5bG9hZCksXHJcbiAgICAgIH1cclxuICAgIClcclxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBHZW1pbmkgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oKGRhdGEpID0+IHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGEgfSkpXHJcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9IGVsc2UgaWYgKHJlcXVlc3QuYWN0aW9uID09PSBcImNhbGxNdXJmXCIpIHtcclxuICAgIGZldGNoKFwiaHR0cHM6Ly9hcGkubXVyZi5haS92MS9zcGVlY2gvZ2VuZXJhdGVcIiwge1xyXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgXCJhcGkta2V5XCI6IHJlcXVlc3QuYXBpS2V5LFxyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICB9LFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0LnBheWxvYWQpLFxyXG4gICAgfSlcclxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKS50aGVuKChlcnIpID0+IHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyci5tZXNzYWdlIHx8IGBNdXJmIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oYXN5bmMgKGRhdGEpID0+IHtcclxuICAgICAgICBpZiAoIWRhdGEuYXVkaW9GaWxlKSB0aHJvdyBuZXcgRXJyb3IoXCJObyBhdWRpbyBmaWxlIHJldHVybmVkXCIpO1xyXG4gICAgICAgIGNvbnN0IGF1ZGlvUmVzcG9uc2UgPSBhd2FpdCBmZXRjaChkYXRhLmF1ZGlvRmlsZSk7XHJcbiAgICAgICAgaWYgKCFhdWRpb1Jlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggYXVkaW8gZmlsZVwiKTtcclxuICAgICAgICBjb25zdCBibG9iID0gYXdhaXQgYXVkaW9SZXNwb25zZS5ibG9iKCk7XHJcbiAgICAgICAgLy8gQ29udmVydCBibG9iIHRvIGJhc2U2NCB0byBzZW5kIGJhY2tcclxuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBiYXNlNjQgPSAocmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcpLnNwbGl0KFwiLFwiKVsxXTtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGEsIGF1ZGlvQmFzZTY0OiBiYXNlNjQgfSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTtcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKChlcnJvcikgPT4gc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufSk7XHJcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUNBLE9BQU8sZUFBZSxTQUFTLGNBQWMsRUFBRSxPQUFPLEtBQUssQ0FBQztBQUFBLEVBQzVELElBQUksbUJBQW1CLFFBQVMsQ0FBQyxPQUFNLE9BQU0sT0FBTSxPQUFNO0FBQUEsSUFDckQsSUFBSSxPQUFPLFVBQVMsWUFBWSxNQUFLLFdBQVcsR0FBRztBQUFBLE1BQy9DLE1BQU0sSUFBSSxVQUFVLHlCQUF5QjtBQUFBLElBQ2pEO0FBQUEsSUFDQSxJQUFJLE9BQU8sVUFBUyxZQUFZLE1BQUssV0FBVyxHQUFHO0FBQUEsTUFDL0MsTUFBTSxJQUFJLFVBQVUseUJBQXlCO0FBQUEsSUFDakQ7QUFBQSxJQUNBLElBQUksT0FBTyxVQUFTLFdBQVc7QUFBQSxNQUMzQixNQUFNLElBQUksVUFBVSwwQkFBMEI7QUFBQSxJQUNsRDtBQUFBLElBQ0EsSUFBSSxPQUFPLFVBQVMsWUFBWSxNQUFLLFdBQVcsR0FBRztBQUFBLE1BQy9DLE1BQU0sSUFBSSxVQUFVLHlCQUF5QjtBQUFBLElBQ2pEO0FBQUE7QUFBQSxFQUVJLGtCQUFVO0FBQUE7Ozs7RUNmbEIsT0FBTyxlQUFlLFNBQVMsY0FBYyxFQUFFLE9BQU8sS0FBSyxDQUFDO0FBQUEsRUFFNUQsSUFBSSxj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QztBQUFBLE1BQUMsSUFBRyxLQUFLLFNBQVMsU0FBTztBQUFBLFFBQWUsS0FBSyxXQUFTO0FBQUEsTUFBUTtBQUFBLGFBQUssV0FBUyxLQUFLLFNBQVMsWUFBWTtBQUFBLE1BQUUsSUFBRyxDQUFDO0FBQUEsUUFBYSxLQUFLLFdBQVMsSUFBSSxJQUFJLFdBQVcsS0FBSyxVQUFVLEVBQUU7QUFBQSxNQUFTLElBQUksSUFBRSxLQUFLLE9BQUssTUFBSSxLQUFLLE9BQUssSUFBRyxJQUFFLEtBQUssWUFBVTtBQUFBLE1BQUcsSUFBRyxLQUFLLE9BQUssSUFBRSxHQUFFLEtBQUssUUFBTSxLQUFLLE1BQUssY0FBYTtBQUFBLFFBQUMsSUFBRyxLQUFLLFdBQVMsS0FBSyxTQUFTLE9BQU8sR0FBRSxLQUFLLFNBQVMsU0FBTyxDQUFDLEdBQUUsS0FBSyxPQUFLO0FBQUEsVUFBSSxPQUFLLE1BQUk7QUFBQSxNQUFJO0FBQUEsSUFBQztBQUFBLElBQUMsSUFBRyxDQUFDLGVBQWU7QUFBQSxNQUFZLFNBQVEsSUFBRSxHQUFFLElBQUUsV0FBVyxPQUFPLElBQUUsR0FBRSxLQUFJO0FBQUEsUUFBQyxJQUFJLEtBQUcsV0FBVztBQUFBLFFBQUcsSUFBRyxLQUFLLFFBQVEsRUFBRSxNQUFJO0FBQUEsVUFBRztBQUFBLFFBQVMsSUFBSSxNQUFJLG1CQUFtQixFQUFFO0FBQUEsUUFBRSxJQUFHLFFBQU07QUFBQSxVQUFHLE1BQUksT0FBTyxFQUFFO0FBQUEsUUFBRSxPQUFLLEtBQUssTUFBTSxFQUFFLEVBQUUsS0FBSyxHQUFHO0FBQUEsTUFBQztBQUFBLElBQUMsSUFBSSxPQUFLLEtBQUssUUFBUSxHQUFHO0FBQUEsSUFBRSxJQUFHLFNBQU87QUFBQSxNQUFHLEtBQUssT0FBSyxLQUFLLE9BQU8sSUFBSSxHQUFFLE9BQUssS0FBSyxNQUFNLEdBQUUsSUFBSTtBQUFBLElBQUUsSUFBSSxLQUFHLEtBQUssUUFBUSxHQUFHO0FBQUEsSUFBRSxJQUFHLE9BQUssSUFBRztBQUFBLE1BQUMsSUFBRyxLQUFLLFNBQU8sS0FBSyxP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QUMsSUFBSSxVQUFPLElBQUksS0FBSSxRQUFNLE9BQU8sS0FBSyxJQUFJO0FBQUEsSUFBRSxTQUFRLEtBQUcsRUFBRSxLQUFHLE1BQU0sUUFBTyxNQUFLO0FBQUEsTUFBQyxJQUFJLE9BQUssTUFBTTtBQUFBLE1BQUksUUFBTyxRQUFNLEtBQUs7QUFBQSxJQUFLO0FBQUEsSUFBQyxJQUFHLFFBQU8sT0FBSyxTQUFTLE1BQUssU0FBUyxTQUFPO0FBQUEsTUFBRyxPQUFPLFFBQU8sT0FBSyxRQUFPLE9BQU8sR0FBRTtBQUFBLElBQU8sSUFBRyxTQUFTLFdBQVMsQ0FBQyxTQUFTLFVBQVM7QUFBQSxNQUFDLElBQUksUUFBTSxPQUFPLEtBQUssUUFBUTtBQUFBLE1BQUUsU0FBUSxLQUFHLEVBQUUsS0FBRyxNQUFNLFFBQU8sTUFBSztBQUFBLFFBQUMsSUFBSSxPQUFLLE1BQU07QUFBQSxRQUFJLElBQUcsU0FBTztBQUFBLFVBQVcsUUFBTyxRQUFNLFNBQVM7QUFBQSxNQUFLO0FBQUEsTUFBQyxJQUFHLGdCQUFnQixRQUFPLGFBQVcsUUFBTyxZQUFVLENBQUMsUUFBTztBQUFBLFFBQVMsUUFBTyxPQUFLLFFBQU8sV0FBUztBQUFBLE1BQUksT0FBTyxRQUFPLE9BQUssUUFBTyxPQUFPLEdBQUU7QUFBQSxJQUFNO0FBQUEsSUFBQyxJQUFHLFNBQVMsWUFBVSxTQUFTLGFBQVcsUUFBTyxVQUFTO0FBQUEsTUFBQyxJQUFHLENBQUMsZ0JBQWdCLFNBQVMsV0FBVTtBQUFBLFFBQUMsSUFBSSxPQUFLLE9BQU8sS0FBSyxRQUFRO0FBQUEsUUFBRSxTQUFRLElBQUUsRUFBRSxJQUFFLEtBQUssUUFBTyxLQUFJO0FBQUEsVUFBQyxJQUFJLElBQUUsS0FBSztBQUFBLFVBQUcsUUFBTyxLQUFHLFNBQVM7QUFBQSxRQUFFO0FBQUEsUUFBQyxPQUFPLFFBQU8sT0FBSyxRQUFPLE9BQU8sR0FBRTtBQUFBLE1BQU07QUFBQSxNQUFDLElBQUcsUUFBTyxXQUFTLFNBQVMsVUFBUyxDQUFDLFNBQVMsUUFBTSxDQUFDLGlCQUFpQixTQUFTLFdBQVU7QUFBQSxRQUFDLElBQUksV0FBUyxTQUFTLFlBQVUsSUFBSSxNQUFNLEdBQUc7QUFBQSxRQUFFLE9BQU0sUUFBUSxVQUFRLEVBQUUsU0FBUyxPQUFLLFFBQVEsTUFBTTtBQUFBO0FBQUEsUUFBSSxJQUFHLENBQUMsU0FBUztBQUFBLFVBQUssU0FBUyxPQUFLO0FBQUEsUUFBRyxJQUFHLENBQUMsU0FBUztBQUFBLFVBQVMsU0FBUyxXQUFTO0FBQUEsUUFBRyxJQUFHLFFBQVEsT0FBSztBQUFBLFVBQUcsUUFBUSxRQUFRLEVBQUU7QUFBQSxRQUFFLElBQUcsUUFBUSxTQUFPO0FBQUEsVUFBRSxRQUFRLFFBQVEsRUFBRTtBQUFBLFFBQUUsUUFBTyxXQUFTLFFBQVEsS0FBSyxHQUFHO0FBQUEsTUFBQyxFQUFNO0FBQUEsZ0JBQU8sV0FBUyxTQUFTO0FBQUEsTUFBUyxJQUFHLFFBQU8sU0FBTyxTQUFTLFFBQU8sUUFBTyxRQUFNLFNBQVMsT0FBTSxRQUFPLE9BQUssU0FBUyxRQUFNLElBQUcsUUFBTyxPQUFLLFNBQVMsTUFBSyxRQUFPLFdBQVMsU0FBUyxZQUFVLFNBQVMsTUFBSyxRQUFPLE9BQUssU0FBUyxNQUFLLFFBQU8sWUFBVSxRQUFPLFFBQU87QUFBQSxRQUFDLElBQUksSUFBRSxRQUFPLFlBQVUsSUFBRyxJQUFFLFFBQU8sVUFBUTtBQUFBLFFBQUcsUUFBTyxPQUFLLElBQUU7QUFBQSxNQUFDO0FBQUEsTUFBQyxPQUFPLFFBQU8sVUFBUSxRQUFPLFdBQVMsU0FBUyxTQUFRLFFBQU8sT0FBSyxRQUFPLE9BQU8sR0FBRTtBQUFBLElBQU07QUFBQSxJQUFDLElBQUksY0FBWSxRQUFPLFlBQVUsUUFBTyxTQUFTLE9BQU8sQ0FBQyxNQUFJLEtBQUksV0FBUyxTQUFTLFFBQU0sU0FBUyxZQUFVLFNBQVMsU0FBUyxPQUFPLENBQUMsTUFBSSxLQUFJLGFBQVcsWUFBVSxlQUFhLFFBQU8sUUFBTSxTQUFTLFVBQVMsZ0JBQWMsWUFBVyxVQUFRLFFBQU8sWUFBVSxRQUFPLFNBQVMsTUFBTSxHQUFHLEtBQUcsQ0FBQyxHQUFFLFVBQVEsU0FBUyxZQUFVLFNBQVMsU0FBUyxNQUFNLEdBQUcsS0FBRyxDQUFDLEdBQUUsWUFBVSxRQUFPLFlBQVUsQ0FBQyxnQkFBZ0IsUUFBTztBQUFBLElBQVUsSUFBRyxXQUFVO0FBQUEsTUFBQyxJQUFHLFFBQU8sV0FBUyxJQUFHLFFBQU8sT0FBSyxNQUFLLFFBQU87QUFBQSxRQUFLLElBQUcsUUFBUSxPQUFLO0FBQUEsVUFBRyxRQUFRLEtBQUcsUUFBTztBQUFBLFFBQVU7QUFBQSxrQkFBUSxRQUFRLFFBQU8sSUFBSTtBQUFBLE1BQUUsSUFBRyxRQUFPLE9BQUssSUFBRyxTQUFTLFVBQVM7QUFBQSxRQUFDLElBQUcsU0FBUyxXQUFTLE1BQUssU0FBUyxPQUFLLE1BQUssU0FBUztBQUFBLFVBQUssSUFBRyxRQUFRLE9BQUs7QUFBQSxZQUFHLFFBQVEsS0FBRyxTQUFTO0FBQUEsVUFBVTtBQUFBLG9CQUFRLFFBQVEsU0FBUyxJQUFJO0FBQUEsUUFBRSxTQUFTLE9BQUs7QUFBQSxNQUFJO0FBQUEsTUFBQyxhQUFXLGVBQWEsUUFBUSxPQUFLLE1BQUksUUFBUSxPQUFLO0FBQUEsSUFBRztBQUFBLElBQUMsSUFBRztBQUFBLE1BQVMsUUFBTyxPQUFLLFNBQVMsUUFBTSxTQUFTLFNBQU8sS0FBRyxTQUFTLE9BQUssUUFBTyxNQUFLLFFBQU8sV0FBUyxTQUFTLFlBQVUsU0FBUyxhQUFXLEtBQUcsU0FBUyxXQUFTLFFBQU8sVUFBUyxRQUFPLFNBQU8sU0FBUyxRQUFPLFFBQU8sUUFBTSxTQUFTLE9BQU0sVUFBUTtBQUFBLElBQWEsU0FBRyxRQUFRLFFBQU87QUFBQSxNQUFDLElBQUcsQ0FBQztBQUFBLFFBQVEsVUFBUSxDQUFDO0FBQUEsTUFBRSxRQUFRLElBQUksR0FBRSxVQUFRLFFBQVEsT0FBTyxPQUFPLEdBQUUsUUFBTyxTQUFPLFNBQVMsUUFBTyxRQUFPLFFBQU0sU0FBUztBQUFBLElBQUssRUFBTSxTQUFHLENBQUMsdUJBQXVCLFNBQVMsTUFBTSxHQUFFO0FBQUEsTUFBQyxJQUFHLFdBQVU7QUFBQSxRQUFDLFFBQU8sV0FBUyxRQUFPLE9BQUssUUFBUSxNQUFNO0FBQUEsUUFBRSxJQUFJLGFBQVcsUUFBTyxRQUFNLFFBQU8sS0FBSyxRQUFRLEdBQUcsSUFBRSxJQUFFLFFBQU8sS0FBSyxNQUFNLEdBQUcsSUFBRTtBQUFBLFFBQUcsSUFBRztBQUFBLFVBQVcsUUFBTyxPQUFLLFdBQVcsTUFBTSxHQUFFLFFBQU8sT0FBSyxRQUFPLFdBQVMsV0FBVyxNQUFNO0FBQUEsTUFBQztBQUFBLE1BQUMsSUFBRyxRQUFPLFNBQU8sU0FBUyxRQUFPLFFBQU8sUUFBTSxTQUFTLE9BQU0sQ0FBQyxZQUFZLFFBQU8sUUFBUSxLQUFHLENBQUMsWUFBWSxRQUFPLE1BQU07QUFBQSxRQUFFLFFBQU8sUUFBTSxRQUFPLFdBQVMsUUFBTyxXQUFTLE9BQUssUUFBTyxTQUFPLFFBQU8sU0FBTztBQUFBLE1BQUksT0FBTyxRQUFPLE9BQUssUUFBTyxPQUFPLEdBQUU7QUFBQSxJQUFNO0FBQUEsSUFBQyxJQUFHLENBQUMsUUFBUSxRQUFPO0FBQUEsTUFBQyxJQUFHLFFBQU8sV0FBUyxNQUFLLFFBQU87QUFBQSxRQUFPLFFBQU8sT0FBSyxNQUFJLFFBQU87QUFBQSxNQUFZO0FBQUEsZ0JBQU8sT0FBSztBQUFBLE1BQUssT0FBTyxRQUFPLE9BQUssUUFBTyxPQUFPLEdBQUU7QUFBQSxJQUFNO0FBQUEsSUFBQyxJQUFJLE9BQUssUUFBUSxNQUFNLEVBQUUsRUFBRSxJQUFHLG9CQUFrQixRQUFPLFFBQU0sU0FBUyxRQUFNLFFBQVEsU0FBTyxPQUFLLFNBQU8sT0FBSyxTQUFPLFNBQU8sU0FBTyxJQUFHLEtBQUc7QUFBQSxJQUFFLFNBQVEsSUFBRSxRQUFRLE9BQU8sS0FBRyxHQUFFO0FBQUEsTUFBSSxJQUFHLE9BQUssUUFBUSxJQUFHLFNBQU87QUFBQSxRQUFJLFFBQVEsT0FBTyxHQUFFLENBQUM7QUFBQSxNQUFPLFNBQUcsU0FBTztBQUFBLFFBQUssUUFBUSxPQUFPLEdBQUUsQ0FBQyxHQUFFO0FBQUEs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Q25DLE1BQU0sSUFBSSxNQUFNLElBQUksV0FBVyxtQkFBbUIsU0FBUyxRQUFRO0FBQUEsU0FDcEU7QUFBQSxNQUNIO0FBQUEsTUFDQSxPQUFPLFNBQVMsS0FBSztBQUFBLEtBQ3RCLEVBQ0EsS0FBSyxPQUFPLFNBQVM7QUFBQSxNQUNwQixJQUFJLENBQUMsS0FBSztBQUFBLFFBQVcsTUFBTSxJQUFJLE1BQU0sd0JBQXdCO0FBQUEsTUFDN0QsTUFBTSxnQkFBZ0IsTUFBTSxNQUFNLEtBQUssU0FBUztBQUFBLE1BQ2hELElBQUksQ0FBQyxjQUFjO0FBQUEsUUFBSSxNQUFNLElBQUksTUFBTSw0QkFBNEI7QUFBQSxNQUNuRSxNQUFNLE9BQU8sTUFBTSxjQUFjLEtBQUs7QUFBQSxNQUV0QyxNQUFNLFNBQVMsSUFBSTtBQUFBLE1BQ25CLE9BQU8sWUFBWSxNQUFNO0FBQUEsUUFDdkIsTUFBTSxTQUFVLE9BQU8sT0FBa0IsTUFBTSxHQUFHLEVBQUU7QUFBQSxRQUNwRCxhQUFhLEVBQUUsU0FBUyxNQUFNLE1BQU0sYUFBYSxPQUFPLENBQUM7QUFBQTtBQUFBLE1BRTNELE9BQU8sY0FBYyxJQUFJO0FBQUEsS0FDMUIsRUFDQSxNQUFNLENBQUMsVUFBVSxhQUFhLEVBQUUsU0FBUyxPQUFPLE9BQU8sTUFBTSxRQUFRLENBQUMsQ0FBQztBQUFBLElBQzFFLE9BQU87QUFBQSxFQUNUO0FBQUEsQ0FDRDsiLAogICJkZWJ1Z0lkIjogIjJGRThEOTNEQjg0MDQzM0I2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
