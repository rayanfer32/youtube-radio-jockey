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
  if (mod && typeof mod === "object" || typeof mod === "function") {
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: __accessProp.bind(mod, key),
          enumerable: true
        });
  }
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
var require_assertInputTypes = __commonJS(function(exports) {
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
var require_splitLongText = __commonJS(function(exports) {
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
  URL: () => URL,
  URLSearchParams: () => URLSearchParams2,
  Url: () => Url,
  default: () => url_default,
  format: () => urlFormat,
  parse: () => urlParse,
  resolve: () => urlResolve,
  resolveObject: () => urlResolveObject
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
  unsafeProtocol = { __proto__: null, javascript: true, "javascript:": true };
  hostlessProtocol = { __proto__: null, javascript: true, "javascript:": true };
  slashedProtocol = { __proto__: null, http: true, https: true, ftp: true, gopher: true, file: true, "http:": true, "https:": true, "ftp:": true, "gopher:": true, "file:": true };
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
      if (slashes && !(proto && hostlessProtocol[lowerProto]))
        rest = rest.substr(2), this.slashes = true;
    }
    if (!hostlessProtocol[lowerProto] && (slashes || lowerProto && !slashedProtocol[lowerProto])) {
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
var require_getAudioUrl = __commonJS(function(exports) {
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
var require_bind = __commonJS(function(exports, module) {
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
var require_utils = __commonJS(function(exports, module) {
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
var require_buildURL = __commonJS(function(exports, module) {
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
var require_InterceptorManager = __commonJS(function(exports, module) {
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
var require_normalizeHeaderName = __commonJS(function(exports, module) {
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
var require_enhanceError = __commonJS(function(exports, module) {
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
var require_createError = __commonJS(function(exports, module) {
  var enhanceError = require_enhanceError();
  module.exports = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };
});

// node_modules/axios/lib/core/settle.js
var require_settle = __commonJS(function(exports, module) {
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
var require_cookies = __commonJS(function(exports, module) {
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
var require_isAbsoluteURL = __commonJS(function(exports, module) {
  module.exports = function isAbsoluteURL(url) {
    return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
  };
});

// node_modules/axios/lib/helpers/combineURLs.js
var require_combineURLs = __commonJS(function(exports, module) {
  module.exports = function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
  };
});

// node_modules/axios/lib/core/buildFullPath.js
var require_buildFullPath = __commonJS(function(exports, module) {
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
var require_parseHeaders = __commonJS(function(exports, module) {
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
var require_isURLSameOrigin = __commonJS(function(exports, module) {
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
var require_xhr = __commonJS(function(exports, module) {
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
var require_defaults = __commonJS(function(exports, module) {
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
var require_transformData = __commonJS(function(exports, module) {
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
var require_isCancel = __commonJS(function(exports, module) {
  module.exports = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };
});

// node_modules/axios/lib/core/dispatchRequest.js
var require_dispatchRequest = __commonJS(function(exports, module) {
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
var require_mergeConfig = __commonJS(function(exports, module) {
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
var require_package = __commonJS(function(exports, module) {
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
var require_validator = __commonJS(function(exports, module) {
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
var require_Axios = __commonJS(function(exports, module) {
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
var require_Cancel = __commonJS(function(exports, module) {
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
var require_CancelToken = __commonJS(function(exports, module) {
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
var require_spread = __commonJS(function(exports, module) {
  module.exports = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };
});

// node_modules/axios/lib/helpers/isAxiosError.js
var require_isAxiosError = __commonJS(function(exports, module) {
  module.exports = function isAxiosError(payload) {
    return typeof payload === "object" && payload.isAxiosError === true;
  };
});

// node_modules/axios/lib/axios.js
var require_axios = __commonJS(function(exports, module) {
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
var require_getAudioBase64 = __commonJS(function(exports, module) {
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
var require_dist = __commonJS(function(exports) {
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
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get();
  chrome.storage.sync.set({
    commentaryLength: existing.commentaryLength ?? "short",
    rjStyle: existing.rjStyle ?? "sarcastic",
    voiceGender: existing.voiceGender ?? "male",
    volumeDucking: existing.volumeDucking ?? 50,
    loggingEnabled: existing.loggingEnabled ?? true,
    logLevel: existing.logLevel ?? "warn",
    darkMode: existing.darkMode ?? false,
    autoStart: existing.autoStart ?? false,
    ttsProvider: existing.ttsProvider ?? "fish-audio",
    fishApiKey: existing.fishApiKey ?? "",
    geminiApiKey: existing.geminiApiKey ?? "",
    murfApiKey: existing.murfApiKey ?? "",
    voiceId: existing.voiceId ?? "ba1a38946dea44609fc4a8fe6113ed88",
    hostName: existing.hostName ?? "Alexis",
    radioStation: existing.radioStation ?? "97.7 Youtube FM",
    llmProvider: existing.llmProvider ?? "openrouter",
    openRouterApiKey: existing.openRouterApiKey ?? "",
    openRouterModel: existing.openRouterModel ?? "recursive/flint-v1.0:free"
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
  } else if (request.action === "callFishAudio") {
    const { text: text2, referenceId, apiKey } = request;
    fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model: "s2.1-pro-free"
      },
      body: JSON.stringify({
        text: text2,
        reference_id: referenceId || "ba1a38946dea44609fc4a8fe6113ed88",
        format: "mp3"
      })
    }).then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Fish Audio API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0;i < uint8Array.byteLength; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      const base64 = btoa(binary);
      sendResponse({ success: true, audioBase64: base64 });
    }).catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  } else if (request.action === "callOpenRouter") {
    const { apiKey, model, messages } = request;
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://youtube-rj-mode.extension",
        "X-Title": "YouTube RJ Mode"
      },
      body: JSON.stringify({
        model: model || "recursive/flint-v1.0:free",
        messages
      })
    }).then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }
      return response.json();
    }).then((data) => {
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No response text returned by OpenRouter model");
      }
      sendResponse({ success: true, data: content });
    }).catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

//# debugId=AF1DCA86073A70D064756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL2dvb2dsZS10dHMtYXBpL2Rpc3QvYXNzZXJ0SW5wdXRUeXBlcy5qcyIsICIuLi9ub2RlX21vZHVsZXMvZ29vZ2xlLXR0cy1hcGkvZGlzdC9zcGxpdExvbmdUZXh0LmpzIiwgIm5vZGU6dXJsIiwgIi4uL25vZGVfbW9kdWxlcy9nb29nbGUtdHRzLWFwaS9kaXN0L2dldEF1ZGlvVXJsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9iaW5kLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvdXRpbHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2J1aWxkVVJMLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY29yZS9JbnRlcmNlcHRvck1hbmFnZXIuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2VuaGFuY2VFcnJvci5qcyIsICIuLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvY3JlYXRlRXJyb3IuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3NldHRsZS5qcyIsICIuLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29va2llcy5qcyIsICIuLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNBYnNvbHV0ZVVSTC5qcyIsICIuLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvY29tYmluZVVSTHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2J1aWxkRnVsbFBhdGguanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3BhcnNlSGVhZGVycy5qcyIsICIuLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2hlbHBlcnMvaXNVUkxTYW1lT3JpZ2luLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvYWRhcHRlcnMveGhyLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvZGVmYXVsdHMuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL3RyYW5zZm9ybURhdGEuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvaXNDYW5jZWwuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jb3JlL2Rpc3BhdGNoUmVxdWVzdC5qcyIsICIuLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvbWVyZ2VDb25maWcuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL3ZhbGlkYXRvci5qcyIsICIuLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2NvcmUvQXhpb3MuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9jYW5jZWwvQ2FuY2VsLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvY2FuY2VsL0NhbmNlbFRva2VuLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9heGlvcy9saWIvaGVscGVycy9zcHJlYWQuanMiLCAiLi4vbm9kZV9tb2R1bGVzL2F4aW9zL2xpYi9oZWxwZXJzL2lzQXhpb3NFcnJvci5qcyIsICIuLi9ub2RlX21vZHVsZXMvYXhpb3MvbGliL2F4aW9zLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9nb29nbGUtdHRzLWFwaS9kaXN0L2dldEF1ZGlvQmFzZTY0LmpzIiwgIi4uL25vZGVfbW9kdWxlcy9nb29nbGUtdHRzLWFwaS9kaXN0L2luZGV4LmpzIiwgIi4uL3NyYy9iYWNrZ3JvdW5kLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIGFzc2VydElucHV0VHlwZXMgPSBmdW5jdGlvbiAodGV4dCwgbGFuZywgc2xvdywgaG9zdCkge1xuICAgIGlmICh0eXBlb2YgdGV4dCAhPT0gJ3N0cmluZycgfHwgdGV4dC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGV4dCBzaG91bGQgYmUgYSBzdHJpbmcnKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBsYW5nICE9PSAnc3RyaW5nJyB8fCBsYW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdsYW5nIHNob3VsZCBiZSBhIHN0cmluZycpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHNsb3cgIT09ICdib29sZWFuJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdzbG93IHNob3VsZCBiZSBhIGJvb2xlYW4nKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBob3N0ICE9PSAnc3RyaW5nJyB8fCBob3N0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdob3N0IHNob3VsZCBiZSBhIHN0cmluZycpO1xuICAgIH1cbn07XG5leHBvcnRzLmRlZmF1bHQgPSBhc3NlcnRJbnB1dFR5cGVzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXNzZXJ0SW5wdXRUeXBlcy5qcy5tYXAiLAogICAgIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nL1RyaW1cbnZhciBTUEFDRV9SRUdFWCA9ICdcXFxcc1xcXFx1RkVGRlxcXFx4QTAnO1xuLy8gaHR0cHM6Ly9yZW1hcmthYmxlbWFyay5vcmcvYmxvZy8yMDE5LzA5LzI4L2phdmFzY3JpcHQtcmVtb3ZlLXB1bmN0dWF0aW9uL1xudmFyIERFRkFVTFRfUFVOQ1RVQVRJT05fUkVHRVggPSAnIVwiIyQlJlxcJygpKissLS4vOjs8PT4/QFtcXFxcXV5fYHt8fX4nO1xuLyoqXG4gKiBzcGxpdCB0aGUgbG9uZyB0ZXh0IHRvIHNob3J0IHRleHRzXG4gKiBUaW1lIENvbXBsZXhpdHk6IE8obilcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gIHRleHRcbiAqIEBwYXJhbSB7b2JqZWN0P30gb3B0aW9uXG4gKiBAcGFyYW0ge251bWJlcj99IG9wdGlvbi5tYXhMZW5ndGggIGRlZmF1bHQgaXMgMjAwXG4gKiBAcGFyYW0ge3N0cmluZz99IG9wdGlvbi5zcGxpdFB1bmN0IGRlZmF1bHQgaXMgJydcbiAqIEByZXR1cm5zIHtzdHJpbmdbXX0gc2hvcnQgdGV4dCBsaXN0XG4gKi9cbnZhciBzcGxpdExvbmdUZXh0ID0gZnVuY3Rpb24gKHRleHQsIF9hKSB7XG4gICAgdmFyIF9iID0gX2EgPT09IHZvaWQgMCA/IHt9IDogX2EsIF9jID0gX2IubWF4TGVuZ3RoLCBtYXhMZW5ndGggPSBfYyA9PT0gdm9pZCAwID8gMjAwIDogX2MsIF9kID0gX2Iuc3BsaXRQdW5jdCwgc3BsaXRQdW5jdCA9IF9kID09PSB2b2lkIDAgPyAnJyA6IF9kO1xuICAgIHZhciBpc1NwYWNlT3JQdW5jdCA9IGZ1bmN0aW9uIChzLCBpKSB7XG4gICAgICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAoJ1snICsgU1BBQ0VfUkVHRVggKyBERUZBVUxUX1BVTkNUVUFUSU9OX1JFR0VYICsgc3BsaXRQdW5jdCArICddJyk7XG4gICAgICAgIHJldHVybiByZWdleC50ZXN0KHMuY2hhckF0KGkpKTtcbiAgICB9O1xuICAgIHZhciBsYXN0SW5kZXhPZlNwYWNlT3JQdW5jdCA9IGZ1bmN0aW9uIChzLCBsZWZ0LCByaWdodCkge1xuICAgICAgICBmb3IgKHZhciBpID0gcmlnaHQ7IGkgPj0gbGVmdDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAoaXNTcGFjZU9yUHVuY3QocywgaSkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xOyAvLyBub3QgZm91bmRcbiAgICB9O1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYWRkUmVzdWx0ID0gZnVuY3Rpb24gKHRleHQsIHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgcmVzdWx0LnB1c2godGV4dC5zbGljZShzdGFydCwgZW5kICsgMSkpO1xuICAgIH07XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDs7KSB7XG4gICAgICAgIC8vIGNoZWNrIHRleHQncyBsZW5ndGhcbiAgICAgICAgaWYgKHRleHQubGVuZ3RoIC0gc3RhcnQgPD0gbWF4TGVuZ3RoKSB7XG4gICAgICAgICAgICBhZGRSZXN1bHQodGV4dCwgc3RhcnQsIHRleHQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICBicmVhazsgLy8gZW5kIG9mIHRleHRcbiAgICAgICAgfVxuICAgICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSB3b3JkIGlzIGN1dCBpbiB0aGUgbWlkZGxlLlxuICAgICAgICB2YXIgZW5kID0gc3RhcnQgKyBtYXhMZW5ndGggLSAxO1xuICAgICAgICBpZiAoaXNTcGFjZU9yUHVuY3QodGV4dCwgZW5kKSB8fCBpc1NwYWNlT3JQdW5jdCh0ZXh0LCBlbmQgKyAxKSkge1xuICAgICAgICAgICAgYWRkUmVzdWx0KHRleHQsIHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgc3RhcnQgPSBlbmQgKyAxO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZmluZCBsYXN0IGluZGV4IG9mIHNwYWNlXG4gICAgICAgIGVuZCA9IGxhc3RJbmRleE9mU3BhY2VPclB1bmN0KHRleHQsIHN0YXJ0LCBlbmQpO1xuICAgICAgICBpZiAoZW5kID09PSAtMSkge1xuICAgICAgICAgICAgdmFyIHN0ciA9IHRleHQuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgbWF4TGVuZ3RoKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHdvcmQgaXMgdG9vIGxvbmcgdG8gc3BsaXQgaW50byBhIHNob3J0IHRleHQ6JyArXG4gICAgICAgICAgICAgICAgKFwiXFxuXCIgKyBzdHIgKyBcIiAuLi5cIikgK1xuICAgICAgICAgICAgICAgICdcXG5cXG5UcnkgdGhlIG9wdGlvbiBcInNwbGl0UHVuY3RcIiB0byBzcGxpdCB0aGUgdGV4dCBieSBwdW5jdHVhdGlvbi4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhZGQgcmVzdWx0XG4gICAgICAgIGFkZFJlc3VsdCh0ZXh0LCBzdGFydCwgZW5kKTtcbiAgICAgICAgc3RhcnQgPSBlbmQgKyAxO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbmV4cG9ydHMuZGVmYXVsdCA9IHNwbGl0TG9uZ1RleHQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zcGxpdExvbmdUZXh0LmpzLm1hcCIsCiAgICAidmFye1VSTCxVUkxTZWFyY2hQYXJhbXN9PWdsb2JhbFRoaXM7ZnVuY3Rpb24gdXRpbF9pc1N0cmluZyhhcmcpe3JldHVybiB0eXBlb2YgYXJnPT09XCJzdHJpbmdcIn1mdW5jdGlvbiB1dGlsX2lzT2JqZWN0KGFyZyl7cmV0dXJuIHR5cGVvZiBhcmc9PT1cIm9iamVjdFwiJiZhcmchPT1udWxsfWZ1bmN0aW9uIHV0aWxfaXNOdWxsKGFyZyl7cmV0dXJuIGFyZz09PW51bGx9ZnVuY3Rpb24gdXRpbF9pc051bGxPclVuZGVmaW5lZChhcmcpe3JldHVybiBhcmc9PW51bGx9ZnVuY3Rpb24gVXJsKCl7dGhpcy5wcm90b2NvbD1udWxsLHRoaXMuc2xhc2hlcz1udWxsLHRoaXMuYXV0aD1udWxsLHRoaXMuaG9zdD1udWxsLHRoaXMucG9ydD1udWxsLHRoaXMuaG9zdG5hbWU9bnVsbCx0aGlzLmhhc2g9bnVsbCx0aGlzLnNlYXJjaD1udWxsLHRoaXMucXVlcnk9bnVsbCx0aGlzLnBhdGhuYW1lPW51bGwsdGhpcy5wYXRoPW51bGwsdGhpcy5ocmVmPW51bGx9dmFyIHByb3RvY29sUGF0dGVybj0vXihbYS16MC05ListXSs6KS9pLHBvcnRQYXR0ZXJuPS86WzAtOV0qJC8sc2ltcGxlUGF0aFBhdHRlcm49L14oXFwvXFwvPyg/IVxcLylbXlxcP1xcc10qKShcXD9bXlxcc10qKT8kLyxkZWxpbXM9W1wiPFwiLFwiPlwiLCdcIicsXCJgXCIsXCIgXCIsXCJcXHJcIixgXG5gLFwiXFx0XCJdLHVud2lzZT1bXCJ7XCIsXCJ9XCIsXCJ8XCIsXCJcXFxcXCIsXCJeXCIsXCJgXCJdLmNvbmNhdChkZWxpbXMpLGF1dG9Fc2NhcGU9W1wiJ1wiXS5jb25jYXQodW53aXNlKSxub25Ib3N0Q2hhcnM9W1wiJVwiLFwiL1wiLFwiP1wiLFwiO1wiLFwiI1wiXS5jb25jYXQoYXV0b0VzY2FwZSksaG9zdEVuZGluZ0NoYXJzPVtcIi9cIixcIj9cIixcIiNcIl0saG9zdG5hbWVNYXhMZW49MjU1LGhvc3RuYW1lUGFydFBhdHRlcm49L15bK2EtejAtOUEtWl8tXXswLDYzfSQvLGhvc3RuYW1lUGFydFN0YXJ0PS9eKFsrYS16MC05QS1aXy1dezAsNjN9KSguKikkLyx1bnNhZmVQcm90b2NvbD17X19wcm90b19fOm51bGwsamF2YXNjcmlwdDohMCxcImphdmFzY3JpcHQ6XCI6ITB9LGhvc3RsZXNzUHJvdG9jb2w9e19fcHJvdG9fXzpudWxsLGphdmFzY3JpcHQ6ITAsXCJqYXZhc2NyaXB0OlwiOiEwfSxzbGFzaGVkUHJvdG9jb2w9e19fcHJvdG9fXzpudWxsLGh0dHA6ITAsaHR0cHM6ITAsZnRwOiEwLGdvcGhlcjohMCxmaWxlOiEwLFwiaHR0cDpcIjohMCxcImh0dHBzOlwiOiEwLFwiZnRwOlwiOiEwLFwiZ29waGVyOlwiOiEwLFwiZmlsZTpcIjohMH0scXVlcnlzdHJpbmc9e3BhcnNlKHN0cil7dmFyIGRlY29kZT1kZWNvZGVVUklDb21wb25lbnQ7cmV0dXJuKHN0citcIlwiKS5yZXBsYWNlKC9cXCsvZyxcIiBcIikuc3BsaXQoXCImXCIpLmZpbHRlcihCb29sZWFuKS5yZWR1Y2UoZnVuY3Rpb24ob2JqLGl0ZW0saW5kZXgpe3ZhciByZWY9aXRlbS5zcGxpdChcIj1cIiksa2V5PWRlY29kZShyZWZbMF18fFwiXCIpLHZhbD1kZWNvZGUocmVmWzFdfHxcIlwiKSxwcmV2PW9ialtrZXldO3JldHVybiBvYmpba2V5XT1wcmV2PT09dm9pZCAwP3ZhbDpbXS5jb25jYXQocHJldix2YWwpLG9ian0se30pfSxzdHJpbmdpZnkob2JqKXt2YXIgZW5jb2RlPWVuY29kZVVSSUNvbXBvbmVudDtyZXR1cm4gT2JqZWN0LmtleXMob2JqfHx7fSkucmVkdWNlKGZ1bmN0aW9uKGFycixrZXkpe3JldHVybltdLmNvbmNhdChvYmpba2V5XSkuZm9yRWFjaChmdW5jdGlvbih2KXthcnIucHVzaChlbmNvZGUoa2V5KStcIj1cIitlbmNvZGUodikpfSksYXJyfSxbXSkuam9pbihcIiZcIikucmVwbGFjZSgvXFxzL2csXCIrXCIpfX07ZnVuY3Rpb24gdXJsUGFyc2UodXJsLHBhcnNlUXVlcnlTdHJpbmcsc2xhc2hlc0Rlbm90ZUhvc3Qpe2lmKHVybCYmdXRpbF9pc09iamVjdCh1cmwpJiZ1cmwgaW5zdGFuY2VvZiBVcmwpcmV0dXJuIHVybDt2YXIgdT1uZXcgVXJsO3JldHVybiB1LnBhcnNlKHVybCxwYXJzZVF1ZXJ5U3RyaW5nLHNsYXNoZXNEZW5vdGVIb3N0KSx1fVVybC5wcm90b3R5cGUucGFyc2U9ZnVuY3Rpb24odXJsLHBhcnNlUXVlcnlTdHJpbmcsc2xhc2hlc0Rlbm90ZUhvc3Qpe2lmKCF1dGlsX2lzU3RyaW5nKHVybCkpdGhyb3cgVHlwZUVycm9yKFwiUGFyYW1ldGVyICd1cmwnIG11c3QgYmUgYSBzdHJpbmcsIG5vdCBcIit0eXBlb2YgdXJsKTt2YXIgcXVlcnlJbmRleD11cmwuaW5kZXhPZihcIj9cIiksc3BsaXR0ZXI9cXVlcnlJbmRleCE9PS0xJiZxdWVyeUluZGV4PHVybC5pbmRleE9mKFwiI1wiKT9cIj9cIjpcIiNcIix1U3BsaXQ9dXJsLnNwbGl0KHNwbGl0dGVyKSxzbGFzaFJlZ2V4PS9cXFxcL2c7dVNwbGl0WzBdPXVTcGxpdFswXS5yZXBsYWNlKHNsYXNoUmVnZXgsXCIvXCIpLHVybD11U3BsaXQuam9pbihzcGxpdHRlcik7dmFyIHJlc3Q9dXJsO2lmKHJlc3Q9cmVzdC50cmltKCksIXNsYXNoZXNEZW5vdGVIb3N0JiZ1cmwuc3BsaXQoXCIjXCIpLmxlbmd0aD09PTEpe3ZhciBzaW1wbGVQYXRoPXNpbXBsZVBhdGhQYXR0ZXJuLmV4ZWMocmVzdCk7aWYoc2ltcGxlUGF0aCl7aWYodGhpcy5wYXRoPXJlc3QsdGhpcy5ocmVmPXJlc3QsdGhpcy5wYXRobmFtZT1zaW1wbGVQYXRoWzFdLHNpbXBsZVBhdGhbMl0paWYodGhpcy5zZWFyY2g9c2ltcGxlUGF0aFsyXSxwYXJzZVF1ZXJ5U3RyaW5nKXRoaXMucXVlcnk9cXVlcnlzdHJpbmcucGFyc2UodGhpcy5zZWFyY2guc3Vic3RyKDEpKTtlbHNlIHRoaXMucXVlcnk9dGhpcy5zZWFyY2guc3Vic3RyKDEpO2Vsc2UgaWYocGFyc2VRdWVyeVN0cmluZyl0aGlzLnNlYXJjaD1cIlwiLHRoaXMucXVlcnk9e307cmV0dXJuIHRoaXN9fXZhciBwcm90bz1wcm90b2NvbFBhdHRlcm4uZXhlYyhyZXN0KTtpZihwcm90byl7cHJvdG89cHJvdG9bMF07dmFyIGxvd2VyUHJvdG89cHJvdG8udG9Mb3dlckNhc2UoKTt0aGlzLnByb3RvY29sPWxvd2VyUHJvdG8scmVzdD1yZXN0LnN1YnN0cihwcm90by5sZW5ndGgpfWlmKHNsYXNoZXNEZW5vdGVIb3N0fHxwcm90b3x8cmVzdC5tYXRjaCgvXlxcL1xcL1teQFxcL10rQFteQFxcL10rLykpe3ZhciBzbGFzaGVzPXJlc3Quc3Vic3RyKDAsMik9PT1cIi8vXCI7aWYoc2xhc2hlcyYmIShwcm90byYmaG9zdGxlc3NQcm90b2NvbFtsb3dlclByb3RvXSkpcmVzdD1yZXN0LnN1YnN0cigyKSx0aGlzLnNsYXNoZXM9ITB9aWYoIWhvc3RsZXNzUHJvdG9jb2xbbG93ZXJQcm90b10mJihzbGFzaGVzfHxsb3dlclByb3RvJiYhc2xhc2hlZFByb3RvY29sW2xvd2VyUHJvdG9dKSl7dmFyIGhvc3RFbmQ9LTE7Zm9yKHZhciBpPTA7aTxob3N0RW5kaW5nQ2hhcnMubGVuZ3RoO2krKyl7dmFyIGhlYz1yZXN0LmluZGV4T2YoaG9zdEVuZGluZ0NoYXJzW2ldKTtpZihoZWMhPT0tMSYmKGhvc3RFbmQ9PT0tMXx8aGVjPGhvc3RFbmQpKWhvc3RFbmQ9aGVjfXZhciBhdXRoLGF0U2lnbjtpZihob3N0RW5kPT09LTEpYXRTaWduPXJlc3QubGFzdEluZGV4T2YoXCJAXCIpO2Vsc2UgYXRTaWduPXJlc3QubGFzdEluZGV4T2YoXCJAXCIsaG9zdEVuZCk7aWYoYXRTaWduIT09LTEpYXV0aD1yZXN0LnNsaWNlKDAsYXRTaWduKSxyZXN0PXJlc3Quc2xpY2UoYXRTaWduKzEpLHRoaXMuYXV0aD1kZWNvZGVVUklDb21wb25lbnQoYXV0aCk7aG9zdEVuZD0tMTtmb3IodmFyIGk9MDtpPG5vbkhvc3RDaGFycy5sZW5ndGg7aSsrKXt2YXIgaGVjPXJlc3QuaW5kZXhPZihub25Ib3N0Q2hhcnNbaV0pO2lmKGhlYyE9PS0xJiYoaG9zdEVuZD09PS0xfHxoZWM8aG9zdEVuZCkpaG9zdEVuZD1oZWN9aWYoaG9zdEVuZD09PS0xKWhvc3RFbmQ9cmVzdC5sZW5ndGg7dGhpcy5ob3N0PXJlc3Quc2xpY2UoMCxob3N0RW5kKSxyZXN0PXJlc3Quc2xpY2UoaG9zdEVuZCksdGhpcy5wYXJzZUhvc3QoKSx0aGlzLmhvc3RuYW1lPXRoaXMuaG9zdG5hbWV8fFwiXCI7dmFyIGlwdjZIb3N0bmFtZT10aGlzLmhvc3RuYW1lWzBdPT09XCJbXCImJnRoaXMuaG9zdG5hbWVbdGhpcy5ob3N0bmFtZS5sZW5ndGgtMV09PT1cIl1cIjtpZighaXB2Nkhvc3RuYW1lKXt2YXIgaG9zdHBhcnRzPXRoaXMuaG9zdG5hbWUuc3BsaXQoL1xcLi8pO2Zvcih2YXIgaT0wLGw9aG9zdHBhcnRzLmxlbmd0aDtpPGw7aSsrKXt2YXIgcGFydD1ob3N0cGFydHNbaV07aWYoIXBhcnQpY29udGludWU7aWYoIXBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpe3ZhciBuZXdwYXJ0PVwiXCI7Zm9yKHZhciBqPTAsaz1wYXJ0Lmxlbmd0aDtqPGs7aisrKWlmKHBhcnQuY2hhckNvZGVBdChqKT4xMjcpbmV3cGFydCs9XCJ4XCI7ZWxzZSBuZXdwYXJ0Kz1wYXJ0W2pdO2lmKCFuZXdwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKXt2YXIgdmFsaWRQYXJ0cz1ob3N0cGFydHMuc2xpY2UoMCxpKSxub3RIb3N0PWhvc3RwYXJ0cy5zbGljZShpKzEpLGJpdD1wYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFN0YXJ0KTtpZihiaXQpdmFsaWRQYXJ0cy5wdXNoKGJpdFsxXSksbm90SG9zdC51bnNoaWZ0KGJpdFsyXSk7aWYobm90SG9zdC5sZW5ndGgpcmVzdD1cIi9cIitub3RIb3N0LmpvaW4oXCIuXCIpK3Jlc3Q7dGhpcy5ob3N0bmFtZT12YWxpZFBhcnRzLmpvaW4oXCIuXCIpO2JyZWFrfX19fWlmKHRoaXMuaG9zdG5hbWUubGVuZ3RoPmhvc3RuYW1lTWF4TGVuKXRoaXMuaG9zdG5hbWU9XCJcIjtlbHNlIHRoaXMuaG9zdG5hbWU9dGhpcy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO2lmKCFpcHY2SG9zdG5hbWUpdGhpcy5ob3N0bmFtZT1uZXcgVVJMKGBodHRwczovLyR7dGhpcy5ob3N0bmFtZX1gKS5ob3N0bmFtZTt2YXIgcD10aGlzLnBvcnQ/XCI6XCIrdGhpcy5wb3J0OlwiXCIsaD10aGlzLmhvc3RuYW1lfHxcIlwiO2lmKHRoaXMuaG9zdD1oK3AsdGhpcy5ocmVmKz10aGlzLmhvc3QsaXB2Nkhvc3RuYW1lKXtpZih0aGlzLmhvc3RuYW1lPXRoaXMuaG9zdG5hbWUuc3Vic3RyKDEsdGhpcy5ob3N0bmFtZS5sZW5ndGgtMikscmVzdFswXSE9PVwiL1wiKXJlc3Q9XCIvXCIrcmVzdH19aWYoIXVuc2FmZVByb3RvY29sW2xvd2VyUHJvdG9dKWZvcih2YXIgaT0wLGw9YXV0b0VzY2FwZS5sZW5ndGg7aTxsO2krKyl7dmFyIGFlPWF1dG9Fc2NhcGVbaV07aWYocmVzdC5pbmRleE9mKGFlKT09PS0xKWNvbnRpbnVlO3ZhciBlc2M9ZW5jb2RlVVJJQ29tcG9uZW50KGFlKTtpZihlc2M9PT1hZSllc2M9ZXNjYXBlKGFlKTtyZXN0PXJlc3Quc3BsaXQoYWUpLmpvaW4oZXNjKX12YXIgaGFzaD1yZXN0LmluZGV4T2YoXCIjXCIpO2lmKGhhc2ghPT0tMSl0aGlzLmhhc2g9cmVzdC5zdWJzdHIoaGFzaCkscmVzdD1yZXN0LnNsaWNlKDAsaGFzaCk7dmFyIHFtPXJlc3QuaW5kZXhPZihcIj9cIik7aWYocW0hPT0tMSl7aWYodGhpcy5zZWFyY2g9cmVzdC5zdWJzdHIocW0pLHRoaXMucXVlcnk9cmVzdC5zdWJzdHIocW0rMSkscGFyc2VRdWVyeVN0cmluZyl0aGlzLnF1ZXJ5PXF1ZXJ5c3RyaW5nLnBhcnNlKHRoaXMucXVlcnkpO3Jlc3Q9cmVzdC5zbGljZSgwLHFtKX1lbHNlIGlmKHBhcnNlUXVlcnlTdHJpbmcpdGhpcy5zZWFyY2g9XCJcIix0aGlzLnF1ZXJ5PXt9O2lmKHJlc3QpdGhpcy5wYXRobmFtZT1yZXN0O2lmKHNsYXNoZWRQcm90b2NvbFtsb3dlclByb3RvXSYmdGhpcy5ob3N0bmFtZSYmIXRoaXMucGF0aG5hbWUpdGhpcy5wYXRobmFtZT1cIi9cIjtpZih0aGlzLnBhdGhuYW1lfHx0aGlzLnNlYXJjaCl7dmFyIHA9dGhpcy5wYXRobmFtZXx8XCJcIixzPXRoaXMuc2VhcmNofHxcIlwiO3RoaXMucGF0aD1wK3N9cmV0dXJuIHRoaXMuaHJlZj10aGlzLmZvcm1hdCgpLHRoaXN9O2Z1bmN0aW9uIHVybEZvcm1hdChvYmope2lmKHV0aWxfaXNTdHJpbmcob2JqKSlvYmo9dXJsUGFyc2Uob2JqKTtpZighKG9iaiBpbnN0YW5jZW9mIFVybCkpcmV0dXJuIFVybC5wcm90b3R5cGUuZm9ybWF0LmNhbGwob2JqKTtyZXR1cm4gb2JqLmZvcm1hdCgpfVVybC5wcm90b3R5cGUuZm9ybWF0PWZ1bmN0aW9uKCl7dmFyIGF1dGg9dGhpcy5hdXRofHxcIlwiO2lmKGF1dGgpYXV0aD1lbmNvZGVVUklDb21wb25lbnQoYXV0aCksYXV0aD1hdXRoLnJlcGxhY2UoLyUzQS9pLFwiOlwiKSxhdXRoKz1cIkBcIjt2YXIgcHJvdG9jb2w9dGhpcy5wcm90b2NvbHx8XCJcIixwYXRobmFtZT10aGlzLnBhdGhuYW1lfHxcIlwiLGhhc2g9dGhpcy5oYXNofHxcIlwiLGhvc3Q9ITEscXVlcnk9XCJcIjtpZih0aGlzLmhvc3QpaG9zdD1hdXRoK3RoaXMuaG9zdDtlbHNlIGlmKHRoaXMuaG9zdG5hbWUpe2lmKGhvc3Q9YXV0aCsodGhpcy5ob3N0bmFtZS5pbmRleE9mKFwiOlwiKT09PS0xP3RoaXMuaG9zdG5hbWU6XCJbXCIrdGhpcy5ob3N0bmFtZStcIl1cIiksdGhpcy5wb3J0KWhvc3QrPVwiOlwiK3RoaXMucG9ydH1pZih0aGlzLnF1ZXJ5JiZ1dGlsX2lzT2JqZWN0KHRoaXMucXVlcnkpJiZPYmplY3Qua2V5cyh0aGlzLnF1ZXJ5KS5sZW5ndGgpcXVlcnk9cXVlcnlzdHJpbmcuc3RyaW5naWZ5KHRoaXMucXVlcnkpO3ZhciBzZWFyY2g9dGhpcy5zZWFyY2h8fHF1ZXJ5JiZcIj9cIitxdWVyeXx8XCJcIjtpZihwcm90b2NvbCYmcHJvdG9jb2wuc3Vic3RyKC0xKSE9PVwiOlwiKXByb3RvY29sKz1cIjpcIjtpZih0aGlzLnNsYXNoZXN8fCghcHJvdG9jb2x8fHNsYXNoZWRQcm90b2NvbFtwcm90b2NvbF0pJiZob3N0IT09ITEpe2lmKGhvc3Q9XCIvL1wiKyhob3N0fHxcIlwiKSxwYXRobmFtZSYmcGF0aG5hbWUuY2hhckF0KDApIT09XCIvXCIpcGF0aG5hbWU9XCIvXCIrcGF0aG5hbWV9ZWxzZSBpZighaG9zdClob3N0PVwiXCI7aWYoaGFzaCYmaGFzaC5jaGFyQXQoMCkhPT1cIiNcIiloYXNoPVwiI1wiK2hhc2g7aWYoc2VhcmNoJiZzZWFyY2guY2hhckF0KDApIT09XCI/XCIpc2VhcmNoPVwiP1wiK3NlYXJjaDtyZXR1cm4gcGF0aG5hbWU9cGF0aG5hbWUucmVwbGFjZSgvWz8jXS9nLGZ1bmN0aW9uKG1hdGNoKXtyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KG1hdGNoKX0pLHNlYXJjaD1zZWFyY2gucmVwbGFjZShcIiNcIixcIiUyM1wiKSxwcm90b2NvbCtob3N0K3BhdGhuYW1lK3NlYXJjaCtoYXNofTtmdW5jdGlvbiB1cmxSZXNvbHZlKHNvdXJjZSxyZWxhdGl2ZSl7cmV0dXJuIHVybFBhcnNlKHNvdXJjZSwhMSwhMCkucmVzb2x2ZShyZWxhdGl2ZSl9VXJsLnByb3RvdHlwZS5yZXNvbHZlPWZ1bmN0aW9uKHJlbGF0aXZlKXtyZXR1cm4gdGhpcy5yZXNvbHZlT2JqZWN0KHVybFBhcnNlKHJlbGF0aXZlLCExLCEwKSkuZm9ybWF0KCl9O2Z1bmN0aW9uIHVybFJlc29sdmVPYmplY3Qoc291cmNlLHJlbGF0aXZlKXtpZighc291cmNlKXJldHVybiByZWxhdGl2ZTtyZXR1cm4gdXJsUGFyc2Uoc291cmNlLCExLCEwKS5yZXNvbHZlT2JqZWN0KHJlbGF0aXZlKX1VcmwucHJvdG90eXBlLnJlc29sdmVPYmplY3Q9ZnVuY3Rpb24ocmVsYXRpdmUpe2lmKHV0aWxfaXNTdHJpbmcocmVsYXRpdmUpKXt2YXIgcmVsPW5ldyBVcmw7cmVsLnBhcnNlKHJlbGF0aXZlLCExLCEwKSxyZWxhdGl2ZT1yZWx9dmFyIHJlc3VsdD1uZXcgVXJsLHRrZXlzPU9iamVjdC5rZXlzKHRoaXMpO2Zvcih2YXIgdGs9MDt0azx0a2V5cy5sZW5ndGg7dGsrKyl7dmFyIHRrZXk9dGtleXNbdGtdO3Jlc3VsdFt0a2V5XT10aGlzW3RrZXldfWlmKHJlc3VsdC5oYXNoPXJlbGF0aXZlLmhhc2gscmVsYXRpdmUuaHJlZj09PVwiXCIpcmV0dXJuIHJlc3VsdC5ocmVmPXJlc3VsdC5mb3JtYXQoKSxyZXN1bHQ7aWYocmVsYXRpdmUuc2xhc2hlcyYmIXJlbGF0aXZlLnByb3RvY29sKXt2YXIgcmtleXM9T2JqZWN0LmtleXMocmVsYXRpdmUpO2Zvcih2YXIgcms9MDtyazxya2V5cy5sZW5ndGg7cmsrKyl7dmFyIHJrZXk9cmtleXNbcmtdO2lmKHJrZXkhPT1cInByb3RvY29sXCIpcmVzdWx0W3JrZXldPXJlbGF0aXZlW3JrZXldfWlmKHNsYXNoZWRQcm90b2NvbFtyZXN1bHQucHJvdG9jb2xdJiZyZXN1bHQuaG9zdG5hbWUmJiFyZXN1bHQucGF0aG5hbWUpcmVzdWx0LnBhdGg9cmVzdWx0LnBhdGhuYW1lPVwiL1wiO3JldHVybiByZXN1bHQuaHJlZj1yZXN1bHQuZm9ybWF0KCkscmVzdWx0fWlmKHJlbGF0aXZlLnByb3RvY29sJiZyZWxhdGl2ZS5wcm90b2NvbCE9PXJlc3VsdC5wcm90b2NvbCl7aWYoIXNsYXNoZWRQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pe3ZhciBrZXlzPU9iamVjdC5rZXlzKHJlbGF0aXZlKTtmb3IodmFyIHY9MDt2PGtleXMubGVuZ3RoO3YrKyl7dmFyIGs9a2V5c1t2XTtyZXN1bHRba109cmVsYXRpdmVba119cmV0dXJuIHJlc3VsdC5ocmVmPXJlc3VsdC5mb3JtYXQoKSxyZXN1bHR9aWYocmVzdWx0LnByb3RvY29sPXJlbGF0aXZlLnByb3RvY29sLCFyZWxhdGl2ZS5ob3N0JiYhaG9zdGxlc3NQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pe3ZhciByZWxQYXRoPShyZWxhdGl2ZS5wYXRobmFtZXx8XCJcIikuc3BsaXQoXCIvXCIpO3doaWxlKHJlbFBhdGgubGVuZ3RoJiYhKHJlbGF0aXZlLmhvc3Q9cmVsUGF0aC5zaGlmdCgpKSk7aWYoIXJlbGF0aXZlLmhvc3QpcmVsYXRpdmUuaG9zdD1cIlwiO2lmKCFyZWxhdGl2ZS5ob3N0bmFtZSlyZWxhdGl2ZS5ob3N0bmFtZT1cIlwiO2lmKHJlbFBhdGhbMF0hPT1cIlwiKXJlbFBhdGgudW5zaGlmdChcIlwiKTtpZihyZWxQYXRoLmxlbmd0aDwyKXJlbFBhdGgudW5zaGlmdChcIlwiKTtyZXN1bHQucGF0aG5hbWU9cmVsUGF0aC5qb2luKFwiL1wiKX1lbHNlIHJlc3VsdC5wYXRobmFtZT1yZWxhdGl2ZS5wYXRobmFtZTtpZihyZXN1bHQuc2VhcmNoPXJlbGF0aXZlLnNlYXJjaCxyZXN1bHQucXVlcnk9cmVsYXRpdmUucXVlcnkscmVzdWx0Lmhvc3Q9cmVsYXRpdmUuaG9zdHx8XCJcIixyZXN1bHQuYXV0aD1yZWxhdGl2ZS5hdXRoLHJlc3VsdC5ob3N0bmFtZT1yZWxhdGl2ZS5ob3N0bmFtZXx8cmVsYXRpdmUuaG9zdCxyZXN1bHQucG9ydD1yZWxhdGl2ZS5wb3J0LHJlc3VsdC5wYXRobmFtZXx8cmVzdWx0LnNlYXJjaCl7dmFyIHA9cmVzdWx0LnBhdGhuYW1lfHxcIlwiLHM9cmVzdWx0LnNlYXJjaHx8XCJcIjtyZXN1bHQucGF0aD1wK3N9cmV0dXJuIHJlc3VsdC5zbGFzaGVzPXJlc3VsdC5zbGFzaGVzfHxyZWxhdGl2ZS5zbGFzaGVzLHJlc3VsdC5ocmVmPXJlc3VsdC5mb3JtYXQoKSxyZXN1bHR9dmFyIGlzU291cmNlQWJzPXJlc3VsdC5wYXRobmFtZSYmcmVzdWx0LnBhdGhuYW1lLmNoYXJBdCgwKT09PVwiL1wiLGlzUmVsQWJzPXJlbGF0aXZlLmhvc3R8fHJlbGF0aXZlLnBhdGhuYW1lJiZyZWxhdGl2ZS5wYXRobmFtZS5jaGFyQXQoMCk9PT1cIi9cIixtdXN0RW5kQWJzPWlzUmVsQWJzfHxpc1NvdXJjZUFic3x8cmVzdWx0Lmhvc3QmJnJlbGF0aXZlLnBhdGhuYW1lLHJlbW92ZUFsbERvdHM9bXVzdEVuZEFicyxzcmNQYXRoPXJlc3VsdC5wYXRobmFtZSYmcmVzdWx0LnBhdGhuYW1lLnNwbGl0KFwiL1wiKXx8W10scmVsUGF0aD1yZWxhdGl2ZS5wYXRobmFtZSYmcmVsYXRpdmUucGF0aG5hbWUuc3BsaXQoXCIvXCIpfHxbXSxwc3ljaG90aWM9cmVzdWx0LnByb3RvY29sJiYhc2xhc2hlZFByb3RvY29sW3Jlc3VsdC5wcm90b2NvbF07aWYocHN5Y2hvdGljKXtpZihyZXN1bHQuaG9zdG5hbWU9XCJcIixyZXN1bHQucG9ydD1udWxsLHJlc3VsdC5ob3N0KWlmKHNyY1BhdGhbMF09PT1cIlwiKXNyY1BhdGhbMF09cmVzdWx0Lmhvc3Q7ZWxzZSBzcmNQYXRoLnVuc2hpZnQocmVzdWx0Lmhvc3QpO2lmKHJlc3VsdC5ob3N0PVwiXCIscmVsYXRpdmUucHJvdG9jb2wpe2lmKHJlbGF0aXZlLmhvc3RuYW1lPW51bGwscmVsYXRpdmUucG9ydD1udWxsLHJlbGF0aXZlLmhvc3QpaWYocmVsUGF0aFswXT09PVwiXCIpcmVsUGF0aFswXT1yZWxhdGl2ZS5ob3N0O2Vsc2UgcmVsUGF0aC51bnNoaWZ0KHJlbGF0aXZlLmhvc3QpO3JlbGF0aXZlLmhvc3Q9bnVsbH1tdXN0RW5kQWJzPW11c3RFbmRBYnMmJihyZWxQYXRoWzBdPT09XCJcInx8c3JjUGF0aFswXT09PVwiXCIpfWlmKGlzUmVsQWJzKXJlc3VsdC5ob3N0PXJlbGF0aXZlLmhvc3R8fHJlbGF0aXZlLmhvc3Q9PT1cIlwiP3JlbGF0aXZlLmhvc3Q6cmVzdWx0Lmhvc3QscmVzdWx0Lmhvc3RuYW1lPXJlbGF0aXZlLmhvc3RuYW1lfHxyZWxhdGl2ZS5ob3N0bmFtZT09PVwiXCI/cmVsYXRpdmUuaG9zdG5hbWU6cmVzdWx0Lmhvc3RuYW1lLHJlc3VsdC5zZWFyY2g9cmVsYXRpdmUuc2VhcmNoLHJlc3VsdC5xdWVyeT1yZWxhdGl2ZS5xdWVyeSxzcmNQYXRoPXJlbFBhdGg7ZWxzZSBpZihyZWxQYXRoLmxlbmd0aCl7aWYoIXNyY1BhdGgpc3JjUGF0aD1bXTtzcmNQYXRoLnBvcCgpLHNyY1BhdGg9c3JjUGF0aC5jb25jYXQocmVsUGF0aCkscmVzdWx0LnNlYXJjaD1yZWxhdGl2ZS5zZWFyY2gscmVzdWx0LnF1ZXJ5PXJlbGF0aXZlLnF1ZXJ5fWVsc2UgaWYoIXV0aWxfaXNOdWxsT3JVbmRlZmluZWQocmVsYXRpdmUuc2VhcmNoKSl7aWYocHN5Y2hvdGljKXtyZXN1bHQuaG9zdG5hbWU9cmVzdWx0Lmhvc3Q9c3JjUGF0aC5zaGlmdCgpO3ZhciBhdXRoSW5Ib3N0PXJlc3VsdC5ob3N0JiZyZXN1bHQuaG9zdC5pbmRleE9mKFwiQFwiKT4wP3Jlc3VsdC5ob3N0LnNwbGl0KFwiQFwiKTohMTtpZihhdXRoSW5Ib3N0KXJlc3VsdC5hdXRoPWF1dGhJbkhvc3Quc2hpZnQoKSxyZXN1bHQuaG9zdD1yZXN1bHQuaG9zdG5hbWU9YXV0aEluSG9zdC5zaGlmdCgpfWlmKHJlc3VsdC5zZWFyY2g9cmVsYXRpdmUuc2VhcmNoLHJlc3VsdC5xdWVyeT1yZWxhdGl2ZS5xdWVyeSwhdXRpbF9pc051bGwocmVzdWx0LnBhdGhuYW1lKXx8IXV0aWxfaXNOdWxsKHJlc3VsdC5zZWFyY2gpKXJlc3VsdC5wYXRoPShyZXN1bHQucGF0aG5hbWU/cmVzdWx0LnBhdGhuYW1lOlwiXCIpKyhyZXN1bHQuc2VhcmNoP3Jlc3VsdC5zZWFyY2g6XCJcIik7cmV0dXJuIHJlc3VsdC5ocmVmPXJlc3VsdC5mb3JtYXQoKSxyZXN1bHR9aWYoIXNyY1BhdGgubGVuZ3RoKXtpZihyZXN1bHQucGF0aG5hbWU9bnVsbCxyZXN1bHQuc2VhcmNoKXJlc3VsdC5wYXRoPVwiL1wiK3Jlc3VsdC5zZWFyY2g7ZWxzZSByZXN1bHQucGF0aD1udWxsO3JldHVybiByZXN1bHQuaHJlZj1yZXN1bHQuZm9ybWF0KCkscmVzdWx0fXZhciBsYXN0PXNyY1BhdGguc2xpY2UoLTEpWzBdLGhhc1RyYWlsaW5nU2xhc2g9KHJlc3VsdC5ob3N0fHxyZWxhdGl2ZS5ob3N0fHxzcmNQYXRoLmxlbmd0aD4xKSYmKGxhc3Q9PT1cIi5cInx8bGFzdD09PVwiLi5cIil8fGxhc3Q9PT1cIlwiLHVwPTA7Zm9yKHZhciBpPXNyY1BhdGgubGVuZ3RoO2k+PTA7aS0tKWlmKGxhc3Q9c3JjUGF0aFtpXSxsYXN0PT09XCIuXCIpc3JjUGF0aC5zcGxpY2UoaSwxKTtlbHNlIGlmKGxhc3Q9PT1cIi4uXCIpc3JjUGF0aC5zcGxpY2UoaSwxKSx1cCsrO2Vsc2UgaWYodXApc3JjUGF0aC5zcGxpY2UoaSwxKSx1cC0tO2lmKCFtdXN0RW5kQWJzJiYhcmVtb3ZlQWxsRG90cylmb3IoO3VwLS07dXApc3JjUGF0aC51bnNoaWZ0KFwiLi5cIik7aWYobXVzdEVuZEFicyYmc3JjUGF0aFswXSE9PVwiXCImJighc3JjUGF0aFswXXx8c3JjUGF0aFswXS5jaGFyQXQoMCkhPT1cIi9cIikpc3JjUGF0aC51bnNoaWZ0KFwiXCIpO2lmKGhhc1RyYWlsaW5nU2xhc2gmJnNyY1BhdGguam9pbihcIi9cIikuc3Vic3RyKC0xKSE9PVwiL1wiKXNyY1BhdGgucHVzaChcIlwiKTt2YXIgaXNBYnNvbHV0ZT1zcmNQYXRoWzBdPT09XCJcInx8c3JjUGF0aFswXSYmc3JjUGF0aFswXS5jaGFyQXQoMCk9PT1cIi9cIjtpZihwc3ljaG90aWMpe3Jlc3VsdC5ob3N0bmFtZT1yZXN1bHQuaG9zdD1pc0Fic29sdXRlP1wiXCI6c3JjUGF0aC5sZW5ndGg/c3JjUGF0aC5zaGlmdCgpOlwiXCI7dmFyIGF1dGhJbkhvc3Q9cmVzdWx0Lmhvc3QmJnJlc3VsdC5ob3N0LmluZGV4T2YoXCJAXCIpPjA/cmVzdWx0Lmhvc3Quc3BsaXQoXCJAXCIpOiExO2lmKGF1dGhJbkhvc3QpcmVzdWx0LmF1dGg9YXV0aEluSG9zdC5zaGlmdCgpLHJlc3VsdC5ob3N0PXJlc3VsdC5ob3N0bmFtZT1hdXRoSW5Ib3N0LnNoaWZ0KCl9aWYobXVzdEVuZEFicz1tdXN0RW5kQWJzfHxyZXN1bHQuaG9zdCYmc3JjUGF0aC5sZW5ndGgsbXVzdEVuZEFicyYmIWlzQWJzb2x1dGUpc3JjUGF0aC51bnNoaWZ0KFwiXCIpO2lmKCFzcmNQYXRoLmxlbmd0aClyZXN1bHQucGF0aG5hbWU9bnVsbCxyZXN1bHQucGF0aD1udWxsO2Vsc2UgcmVzdWx0LnBhdGhuYW1lPXNyY1BhdGguam9pbihcIi9cIik7aWYoIXV0aWxfaXNOdWxsKHJlc3VsdC5wYXRobmFtZSl8fCF1dGlsX2lzTnVsbChyZXN1bHQuc2VhcmNoKSlyZXN1bHQucGF0aD0ocmVzdWx0LnBhdGhuYW1lP3Jlc3VsdC5wYXRobmFtZTpcIlwiKSsocmVzdWx0LnNlYXJjaD9yZXN1bHQuc2VhcmNoOlwiXCIpO3JldHVybiByZXN1bHQuYXV0aD1yZWxhdGl2ZS5hdXRofHxyZXN1bHQuYXV0aCxyZXN1bHQuc2xhc2hlcz1yZXN1bHQuc2xhc2hlc3x8cmVsYXRpdmUuc2xhc2hlcyxyZXN1bHQuaHJlZj1yZXN1bHQuZm9ybWF0KCkscmVzdWx0fTtVcmwucHJvdG90eXBlLnBhcnNlSG9zdD1mdW5jdGlvbigpe3ZhciBob3N0PXRoaXMuaG9zdCxwb3J0PXBvcnRQYXR0ZXJuLmV4ZWMoaG9zdCk7aWYocG9ydCl7aWYocG9ydD1wb3J0WzBdLHBvcnQhPT1cIjpcIil0aGlzLnBvcnQ9cG9ydC5zdWJzdHIoMSk7aG9zdD1ob3N0LnN1YnN0cigwLGhvc3QubGVuZ3RoLXBvcnQubGVuZ3RoKX1pZihob3N0KXRoaXMuaG9zdG5hbWU9aG9zdH07dmFyIHVybF9kZWZhdWx0PXtwYXJzZTp1cmxQYXJzZSxyZXNvbHZlOnVybFJlc29sdmUscmVzb2x2ZU9iamVjdDp1cmxSZXNvbHZlT2JqZWN0LGZvcm1hdDp1cmxGb3JtYXQsVXJsLFVSTCxVUkxTZWFyY2hQYXJhbXN9O2V4cG9ydHt1cmxSZXNvbHZlT2JqZWN0IGFzIHJlc29sdmVPYmplY3QsdXJsUmVzb2x2ZSBhcyByZXNvbHZlLHVybFBhcnNlIGFzIHBhcnNlLHVybEZvcm1hdCBhcyBmb3JtYXQsdXJsX2RlZmF1bHQgYXMgZGVmYXVsdCxVcmwsVVJMU2VhcmNoUGFyYW1zLFVSTH07IiwKICAgICJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0QWxsQXVkaW9VcmxzID0gZXhwb3J0cy5nZXRBdWRpb1VybCA9IHZvaWQgMDtcbnZhciBhc3NlcnRJbnB1dFR5cGVzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vYXNzZXJ0SW5wdXRUeXBlc1wiKSk7XG52YXIgc3BsaXRMb25nVGV4dF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3NwbGl0TG9uZ1RleHRcIikpO1xudmFyIHVybF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJ1cmxcIikpO1xuLyoqXG4gKiBHZW5lcmF0ZSBcIkdvb2dsZSBUVFNcIiBhdWRpbyBVUkxcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gICB0ZXh0ICAgICAgICAgbGVuZ3RoIHNob3VsZCBiZSBsZXNzIHRoYW4gMjAwIGNoYXJhY3RlcnNcbiAqIEBwYXJhbSB7b2JqZWN0P30gIG9wdGlvblxuICogQHBhcmFtIHtzdHJpbmc/fSAgb3B0aW9uLmxhbmcgIGRlZmF1bHQgaXMgXCJlblwiXG4gKiBAcGFyYW0ge2Jvb2xlYW4/fSBvcHRpb24uc2xvdyAgZGVmYXVsdCBpcyBmYWxzZVxuICogQHBhcmFtIHtzdHJpbmc/fSAgb3B0aW9uLmhvc3QgIGRlZmF1bHQgaXMgXCJodHRwczovL3RyYW5zbGF0ZS5nb29nbGUuY29tXCJcbiAqIEByZXR1cm4ge3N0cmluZ30gdXJsXG4gKi9cbnZhciBnZXRBdWRpb1VybCA9IGZ1bmN0aW9uICh0ZXh0LCBfYSkge1xuICAgIHZhciBfYiA9IF9hID09PSB2b2lkIDAgPyB7fSA6IF9hLCBfYyA9IF9iLmxhbmcsIGxhbmcgPSBfYyA9PT0gdm9pZCAwID8gJ2VuJyA6IF9jLCBfZCA9IF9iLnNsb3csIHNsb3cgPSBfZCA9PT0gdm9pZCAwID8gZmFsc2UgOiBfZCwgX2UgPSBfYi5ob3N0LCBob3N0ID0gX2UgPT09IHZvaWQgMCA/ICdodHRwczovL3RyYW5zbGF0ZS5nb29nbGUuY29tJyA6IF9lO1xuICAgIGFzc2VydElucHV0VHlwZXNfMS5kZWZhdWx0KHRleHQsIGxhbmcsIHNsb3csIGhvc3QpO1xuICAgIGlmICh0ZXh0Lmxlbmd0aCA+IDIwMCkge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcInRleHQgbGVuZ3RoIChcIiArIHRleHQubGVuZ3RoICsgXCIpIHNob3VsZCBiZSBsZXNzIHRoYW4gMjAwIGNoYXJhY3RlcnMuIFRyeSBcXFwiZ2V0QWxsQXVkaW9VcmxzKHRleHQsIFtvcHRpb25dKVxcXCIgZm9yIGxvbmcgdGV4dC5cIik7XG4gICAgfVxuICAgIHJldHVybiAoaG9zdCArXG4gICAgICAgICcvdHJhbnNsYXRlX3R0cycgK1xuICAgICAgICB1cmxfMS5kZWZhdWx0LmZvcm1hdCh7XG4gICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgIGllOiAnVVRGLTgnLFxuICAgICAgICAgICAgICAgIHE6IHRleHQsXG4gICAgICAgICAgICAgICAgdGw6IGxhbmcsXG4gICAgICAgICAgICAgICAgdG90YWw6IDEsXG4gICAgICAgICAgICAgICAgaWR4OiAwLFxuICAgICAgICAgICAgICAgIHRleHRsZW46IHRleHQubGVuZ3RoLFxuICAgICAgICAgICAgICAgIGNsaWVudDogJ3R3LW9iJyxcbiAgICAgICAgICAgICAgICBwcmV2OiAnaW5wdXQnLFxuICAgICAgICAgICAgICAgIHR0c3NwZWVkOiBzbG93ID8gMC4yNCA6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG59O1xuZXhwb3J0cy5nZXRBdWRpb1VybCA9IGdldEF1ZGlvVXJsO1xuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBSZXN1bHRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzaG9ydFRleHRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB1cmxcbiAqL1xuLyoqXG4gKiBTcGxpdCB0aGUgbG9uZyB0ZXh0IGludG8gbXVsdGlwbGUgc2hvcnQgdGV4dCBhbmQgZ2VuZXJhdGUgYXVkaW8gVVJMIGxpc3RcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gICB0ZXh0XG4gKiBAcGFyYW0ge29iamVjdD99ICBvcHRpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gIG9wdGlvbi5sYW5nICAgICAgICBkZWZhdWx0IGlzIFwiZW5cIlxuICogQHBhcmFtIHtib29sZWFuP30gb3B0aW9uLnNsb3cgICAgICAgIGRlZmF1bHQgaXMgZmFsc2VcbiAqIEBwYXJhbSB7c3RyaW5nP30gIG9wdGlvbi5ob3N0ICAgICAgICBkZWZhdWx0IGlzIFwiaHR0cHM6Ly90cmFuc2xhdGUuZ29vZ2xlLmNvbVwiXG4gKiBAcGFyYW0ge3N0cmluZz99ICBvcHRpb24uc3BsaXRQdW5jdCAgc3BsaXQgcHVuY3R1YXRpb25cbiAqIEByZXR1cm4ge1Jlc3VsdFtdfSB0aGUgbGlzdCB3aXRoIHNob3J0IHRleHQgYW5kIGF1ZGlvIHVybFxuICovXG52YXIgZ2V0QWxsQXVkaW9VcmxzID0gZnVuY3Rpb24gKHRleHQsIF9hKSB7XG4gICAgdmFyIF9iID0gX2EgPT09IHZvaWQgMCA/IHt9IDogX2EsIF9jID0gX2IubGFuZywgbGFuZyA9IF9jID09PSB2b2lkIDAgPyAnZW4nIDogX2MsIF9kID0gX2Iuc2xvdywgc2xvdyA9IF9kID09PSB2b2lkIDAgPyBmYWxzZSA6IF9kLCBfZSA9IF9iLmhvc3QsIGhvc3QgPSBfZSA9PT0gdm9pZCAwID8gJ2h0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZS5jb20nIDogX2UsIF9mID0gX2Iuc3BsaXRQdW5jdCwgc3BsaXRQdW5jdCA9IF9mID09PSB2b2lkIDAgPyAnJyA6IF9mO1xuICAgIGFzc2VydElucHV0VHlwZXNfMS5kZWZhdWx0KHRleHQsIGxhbmcsIHNsb3csIGhvc3QpO1xuICAgIGlmICh0eXBlb2Ygc3BsaXRQdW5jdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignc3BsaXRQdW5jdCBzaG91bGQgYmUgYSBzdHJpbmcnKTtcbiAgICB9XG4gICAgcmV0dXJuIHNwbGl0TG9uZ1RleHRfMS5kZWZhdWx0KHRleHQsIHsgc3BsaXRQdW5jdDogc3BsaXRQdW5jdCB9KS5tYXAoZnVuY3Rpb24gKHNob3J0VGV4dCkgeyByZXR1cm4gKHtcbiAgICAgICAgc2hvcnRUZXh0OiBzaG9ydFRleHQsXG4gICAgICAgIHVybDogZXhwb3J0cy5nZXRBdWRpb1VybChzaG9ydFRleHQsIHsgbGFuZzogbGFuZywgc2xvdzogc2xvdywgaG9zdDogaG9zdCB9KSxcbiAgICB9KTsgfSk7XG59O1xuZXhwb3J0cy5nZXRBbGxBdWRpb1VybHMgPSBnZXRBbGxBdWRpb1VybHM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1nZXRBdWRpb1VybC5qcy5tYXAiLAogICAgIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBiaW5kKGZuLCB0aGlzQXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB3cmFwKCkge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICB9O1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG5cbi8vIHV0aWxzIGlzIGEgbGlicmFyeSBvZiBnZW5lcmljIGhlbHBlciBmdW5jdGlvbnMgbm9uLXNwZWNpZmljIHRvIGF4aW9zXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXkodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgdW5kZWZpbmVkXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQnVmZmVyKHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmICFpc1VuZGVmaW5lZCh2YWwpICYmIHZhbC5jb25zdHJ1Y3RvciAhPT0gbnVsbCAmJiAhaXNVbmRlZmluZWQodmFsLmNvbnN0cnVjdG9yKVxuICAgICYmIHR5cGVvZiB2YWwuY29uc3RydWN0b3IuaXNCdWZmZXIgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyKHZhbCk7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gQXJyYXlCdWZmZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIodmFsKSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXSc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBGb3JtRGF0YVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGFuIEZvcm1EYXRhLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGb3JtRGF0YSh2YWwpIHtcbiAgcmV0dXJuICh0eXBlb2YgRm9ybURhdGEgIT09ICd1bmRlZmluZWQnKSAmJiAodmFsIGluc3RhbmNlb2YgRm9ybURhdGEpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgdmlldyBvbiBhbiBBcnJheUJ1ZmZlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3KHZhbCkge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpICYmIChBcnJheUJ1ZmZlci5pc1ZpZXcpKSB7XG4gICAgcmVzdWx0ID0gQXJyYXlCdWZmZXIuaXNWaWV3KHZhbCk7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0ID0gKHZhbCkgJiYgKHZhbC5idWZmZXIpICYmICh2YWwuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBTdHJpbmdcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIFN0cmluZywgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZyc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBOdW1iZXJcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIE51bWJlciwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ251bWJlcic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYW4gT2JqZWN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbCBUaGUgdmFsdWUgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgaXMgYW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCc7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGEgdmFsdWUgaXMgYSBwbGFpbiBPYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgcGxhaW4gT2JqZWN0LCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWwpIHtcbiAgaWYgKHRvU3RyaW5nLmNhbGwodmFsKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbCk7XG4gIHJldHVybiBwcm90b3R5cGUgPT09IG51bGwgfHwgcHJvdG90eXBlID09PSBPYmplY3QucHJvdG90eXBlO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRGF0ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRGF0ZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRmlsZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgRmlsZSwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRmlsZSh2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRmlsZV0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgQmxvYlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgQmxvYiwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQmxvYih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQmxvYl0nO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgRnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBpcyBhIEZ1bmN0aW9uLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmUgaWYgYSB2YWx1ZSBpcyBhIFN0cmVhbVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgU3RyZWFtLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTdHJlYW0odmFsKSB7XG4gIHJldHVybiBpc09iamVjdCh2YWwpICYmIGlzRnVuY3Rpb24odmFsLnBpcGUpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiBhIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWwgVGhlIHZhbHVlIHRvIHRlc3RcbiAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIGlzIGEgVVJMU2VhcmNoUGFyYW1zIG9iamVjdCwgb3RoZXJ3aXNlIGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzVVJMU2VhcmNoUGFyYW1zKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIFVSTFNlYXJjaFBhcmFtcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgVVJMU2VhcmNoUGFyYW1zO1xufVxuXG4vKipcbiAqIFRyaW0gZXhjZXNzIHdoaXRlc3BhY2Ugb2ZmIHRoZSBiZWdpbm5pbmcgYW5kIGVuZCBvZiBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHIgVGhlIFN0cmluZyB0byB0cmltXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgU3RyaW5nIGZyZWVkIG9mIGV4Y2VzcyB3aGl0ZXNwYWNlXG4gKi9cbmZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gIHJldHVybiBzdHIudHJpbSA/IHN0ci50cmltKCkgOiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG4vKipcbiAqIERldGVybWluZSBpZiB3ZSdyZSBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudFxuICpcbiAqIFRoaXMgYWxsb3dzIGF4aW9zIHRvIHJ1biBpbiBhIHdlYiB3b3JrZXIsIGFuZCByZWFjdC1uYXRpdmUuXG4gKiBCb3RoIGVudmlyb25tZW50cyBzdXBwb3J0IFhNTEh0dHBSZXF1ZXN0LCBidXQgbm90IGZ1bGx5IHN0YW5kYXJkIGdsb2JhbHMuXG4gKlxuICogd2ViIHdvcmtlcnM6XG4gKiAgdHlwZW9mIHdpbmRvdyAtPiB1bmRlZmluZWRcbiAqICB0eXBlb2YgZG9jdW1lbnQgLT4gdW5kZWZpbmVkXG4gKlxuICogcmVhY3QtbmF0aXZlOlxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdSZWFjdE5hdGl2ZSdcbiAqIG5hdGl2ZXNjcmlwdFxuICogIG5hdmlnYXRvci5wcm9kdWN0IC0+ICdOYXRpdmVTY3JpcHQnIG9yICdOUydcbiAqL1xuZnVuY3Rpb24gaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiAobmF2aWdhdG9yLnByb2R1Y3QgPT09ICdSZWFjdE5hdGl2ZScgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05hdGl2ZVNjcmlwdCcgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ05TJykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlIG92ZXIgYW4gQXJyYXkgb3IgYW4gT2JqZWN0IGludm9raW5nIGEgZnVuY3Rpb24gZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiBgb2JqYCBpcyBhbiBBcnJheSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCBwYXNzaW5nXG4gKiB0aGUgdmFsdWUsIGluZGV4LCBhbmQgY29tcGxldGUgYXJyYXkgZm9yIGVhY2ggaXRlbS5cbiAqXG4gKiBJZiAnb2JqJyBpcyBhbiBPYmplY3QgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWQgcGFzc2luZ1xuICogdGhlIHZhbHVlLCBrZXksIGFuZCBjb21wbGV0ZSBvYmplY3QgZm9yIGVhY2ggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IG9iaiBUaGUgb2JqZWN0IHRvIGl0ZXJhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBjYWxsYmFjayB0byBpbnZva2UgZm9yIGVhY2ggaXRlbVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKG9iaiwgZm4pIHtcbiAgLy8gRG9uJ3QgYm90aGVyIGlmIG5vIHZhbHVlIHByb3ZpZGVkXG4gIGlmIChvYmogPT09IG51bGwgfHwgdHlwZW9mIG9iaiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGb3JjZSBhbiBhcnJheSBpZiBub3QgYWxyZWFkeSBzb21ldGhpbmcgaXRlcmFibGVcbiAgaWYgKHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB7XG4gICAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gICAgb2JqID0gW29ial07XG4gIH1cblxuICBpZiAoaXNBcnJheShvYmopKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFycmF5IHZhbHVlc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgZm4uY2FsbChudWxsLCBvYmpbaV0sIGksIG9iaik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEl0ZXJhdGUgb3ZlciBvYmplY3Qga2V5c1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIGZuLmNhbGwobnVsbCwgb2JqW2tleV0sIGtleSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBY2NlcHRzIHZhcmFyZ3MgZXhwZWN0aW5nIGVhY2ggYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0LCB0aGVuXG4gKiBpbW11dGFibHkgbWVyZ2VzIHRoZSBwcm9wZXJ0aWVzIG9mIGVhY2ggb2JqZWN0IGFuZCByZXR1cm5zIHJlc3VsdC5cbiAqXG4gKiBXaGVuIG11bHRpcGxlIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBrZXkgdGhlIGxhdGVyIG9iamVjdCBpblxuICogdGhlIGFyZ3VtZW50cyBsaXN0IHdpbGwgdGFrZSBwcmVjZWRlbmNlLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogYGBganNcbiAqIHZhciByZXN1bHQgPSBtZXJnZSh7Zm9vOiAxMjN9LCB7Zm9vOiA0NTZ9KTtcbiAqIGNvbnNvbGUubG9nKHJlc3VsdC5mb28pOyAvLyBvdXRwdXRzIDQ1NlxuICogYGBgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iajEgT2JqZWN0IHRvIG1lcmdlXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXN1bHQgb2YgYWxsIG1lcmdlIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gbWVyZ2UoLyogb2JqMSwgb2JqMiwgb2JqMywgLi4uICovKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZnVuY3Rpb24gYXNzaWduVmFsdWUodmFsLCBrZXkpIHtcbiAgICBpZiAoaXNQbGFpbk9iamVjdChyZXN1bHRba2V5XSkgJiYgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHJlc3VsdFtrZXldLCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IG1lcmdlKHt9LCB2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWwpKSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbC5zbGljZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRba2V5XSA9IHZhbDtcbiAgICB9XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBmb3JFYWNoKGFyZ3VtZW50c1tpXSwgYXNzaWduVmFsdWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogRXh0ZW5kcyBvYmplY3QgYSBieSBtdXRhYmx5IGFkZGluZyB0byBpdCB0aGUgcHJvcGVydGllcyBvZiBvYmplY3QgYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgb2JqZWN0IHRvIGJlIGV4dGVuZGVkXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gdGhpc0FyZyBUaGUgb2JqZWN0IHRvIGJpbmQgZnVuY3Rpb24gdG9cbiAqIEByZXR1cm4ge09iamVjdH0gVGhlIHJlc3VsdGluZyB2YWx1ZSBvZiBvYmplY3QgYVxuICovXG5mdW5jdGlvbiBleHRlbmQoYSwgYiwgdGhpc0FyZykge1xuICBmb3JFYWNoKGIsIGZ1bmN0aW9uIGFzc2lnblZhbHVlKHZhbCwga2V5KSB7XG4gICAgaWYgKHRoaXNBcmcgJiYgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYVtrZXldID0gYmluZCh2YWwsIHRoaXNBcmcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhW2tleV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGE7XG59XG5cbi8qKlxuICogUmVtb3ZlIGJ5dGUgb3JkZXIgbWFya2VyLiBUaGlzIGNhdGNoZXMgRUYgQkIgQkYgKHRoZSBVVEYtOCBCT00pXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgd2l0aCBCT01cbiAqIEByZXR1cm4ge3N0cmluZ30gY29udGVudCB2YWx1ZSB3aXRob3V0IEJPTVxuICovXG5mdW5jdGlvbiBzdHJpcEJPTShjb250ZW50KSB7XG4gIGlmIChjb250ZW50LmNoYXJDb2RlQXQoMCkgPT09IDB4RkVGRikge1xuICAgIGNvbnRlbnQgPSBjb250ZW50LnNsaWNlKDEpO1xuICB9XG4gIHJldHVybiBjb250ZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNBcnJheTogaXNBcnJheSxcbiAgaXNBcnJheUJ1ZmZlcjogaXNBcnJheUJ1ZmZlcixcbiAgaXNCdWZmZXI6IGlzQnVmZmVyLFxuICBpc0Zvcm1EYXRhOiBpc0Zvcm1EYXRhLFxuICBpc0FycmF5QnVmZmVyVmlldzogaXNBcnJheUJ1ZmZlclZpZXcsXG4gIGlzU3RyaW5nOiBpc1N0cmluZyxcbiAgaXNOdW1iZXI6IGlzTnVtYmVyLFxuICBpc09iamVjdDogaXNPYmplY3QsXG4gIGlzUGxhaW5PYmplY3Q6IGlzUGxhaW5PYmplY3QsXG4gIGlzVW5kZWZpbmVkOiBpc1VuZGVmaW5lZCxcbiAgaXNEYXRlOiBpc0RhdGUsXG4gIGlzRmlsZTogaXNGaWxlLFxuICBpc0Jsb2I6IGlzQmxvYixcbiAgaXNGdW5jdGlvbjogaXNGdW5jdGlvbixcbiAgaXNTdHJlYW06IGlzU3RyZWFtLFxuICBpc1VSTFNlYXJjaFBhcmFtczogaXNVUkxTZWFyY2hQYXJhbXMsXG4gIGlzU3RhbmRhcmRCcm93c2VyRW52OiBpc1N0YW5kYXJkQnJvd3NlckVudixcbiAgZm9yRWFjaDogZm9yRWFjaCxcbiAgbWVyZ2U6IG1lcmdlLFxuICBleHRlbmQ6IGV4dGVuZCxcbiAgdHJpbTogdHJpbSxcbiAgc3RyaXBCT006IHN0cmlwQk9NXG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gZW5jb2RlKHZhbCkge1xuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICByZXBsYWNlKC8lMjAvZywgJysnKS5cbiAgICByZXBsYWNlKC8lNUIvZ2ksICdbJykuXG4gICAgcmVwbGFjZSgvJTVEL2dpLCAnXScpO1xufVxuXG4vKipcbiAqIEJ1aWxkIGEgVVJMIGJ5IGFwcGVuZGluZyBwYXJhbXMgdG8gdGhlIGVuZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgVGhlIGJhc2Ugb2YgdGhlIHVybCAoZS5nLiwgaHR0cDovL3d3dy5nb29nbGUuY29tKVxuICogQHBhcmFtIHtvYmplY3R9IFtwYXJhbXNdIFRoZSBwYXJhbXMgdG8gYmUgYXBwZW5kZWRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmb3JtYXR0ZWQgdXJsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYnVpbGRVUkwodXJsLCBwYXJhbXMsIHBhcmFtc1NlcmlhbGl6ZXIpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIGlmICghcGFyYW1zKSB7XG4gICAgcmV0dXJuIHVybDtcbiAgfVxuXG4gIHZhciBzZXJpYWxpemVkUGFyYW1zO1xuICBpZiAocGFyYW1zU2VyaWFsaXplcikge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXNTZXJpYWxpemVyKHBhcmFtcyk7XG4gIH0gZWxzZSBpZiAodXRpbHMuaXNVUkxTZWFyY2hQYXJhbXMocGFyYW1zKSkge1xuICAgIHNlcmlhbGl6ZWRQYXJhbXMgPSBwYXJhbXMudG9TdHJpbmcoKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcblxuICAgIHV0aWxzLmZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiBzZXJpYWxpemUodmFsLCBrZXkpIHtcbiAgICAgIGlmICh2YWwgPT09IG51bGwgfHwgdHlwZW9mIHZhbCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAodXRpbHMuaXNBcnJheSh2YWwpKSB7XG4gICAgICAgIGtleSA9IGtleSArICdbXSc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWwgPSBbdmFsXTtcbiAgICAgIH1cblxuICAgICAgdXRpbHMuZm9yRWFjaCh2YWwsIGZ1bmN0aW9uIHBhcnNlVmFsdWUodikge1xuICAgICAgICBpZiAodXRpbHMuaXNEYXRlKHYpKSB7XG4gICAgICAgICAgdiA9IHYudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdCh2KSkge1xuICAgICAgICAgIHYgPSBKU09OLnN0cmluZ2lmeSh2KTtcbiAgICAgICAgfVxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZShrZXkpICsgJz0nICsgZW5jb2RlKHYpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgc2VyaWFsaXplZFBhcmFtcyA9IHBhcnRzLmpvaW4oJyYnKTtcbiAgfVxuXG4gIGlmIChzZXJpYWxpemVkUGFyYW1zKSB7XG4gICAgdmFyIGhhc2htYXJrSW5kZXggPSB1cmwuaW5kZXhPZignIycpO1xuICAgIGlmIChoYXNobWFya0luZGV4ICE9PSAtMSkge1xuICAgICAgdXJsID0gdXJsLnNsaWNlKDAsIGhhc2htYXJrSW5kZXgpO1xuICAgIH1cblxuICAgIHVybCArPSAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgc2VyaWFsaXplZFBhcmFtcztcbiAgfVxuXG4gIHJldHVybiB1cmw7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcblxuZnVuY3Rpb24gSW50ZXJjZXB0b3JNYW5hZ2VyKCkge1xuICB0aGlzLmhhbmRsZXJzID0gW107XG59XG5cbi8qKlxuICogQWRkIGEgbmV3IGludGVyY2VwdG9yIHRvIHRoZSBzdGFja1xuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bGZpbGxlZCBUaGUgZnVuY3Rpb24gdG8gaGFuZGxlIGB0aGVuYCBmb3IgYSBgUHJvbWlzZWBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlamVjdGVkIFRoZSBmdW5jdGlvbiB0byBoYW5kbGUgYHJlamVjdGAgZm9yIGEgYFByb21pc2VgXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBBbiBJRCB1c2VkIHRvIHJlbW92ZSBpbnRlcmNlcHRvciBsYXRlclxuICovXG5JbnRlcmNlcHRvck1hbmFnZXIucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uIHVzZShmdWxmaWxsZWQsIHJlamVjdGVkLCBvcHRpb25zKSB7XG4gIHRoaXMuaGFuZGxlcnMucHVzaCh7XG4gICAgZnVsZmlsbGVkOiBmdWxmaWxsZWQsXG4gICAgcmVqZWN0ZWQ6IHJlamVjdGVkLFxuICAgIHN5bmNocm9ub3VzOiBvcHRpb25zID8gb3B0aW9ucy5zeW5jaHJvbm91cyA6IGZhbHNlLFxuICAgIHJ1bldoZW46IG9wdGlvbnMgPyBvcHRpb25zLnJ1bldoZW4gOiBudWxsXG4gIH0pO1xuICByZXR1cm4gdGhpcy5oYW5kbGVycy5sZW5ndGggLSAxO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYW4gaW50ZXJjZXB0b3IgZnJvbSB0aGUgc3RhY2tcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaWQgVGhlIElEIHRoYXQgd2FzIHJldHVybmVkIGJ5IGB1c2VgXG4gKi9cbkludGVyY2VwdG9yTWFuYWdlci5wcm90b3R5cGUuZWplY3QgPSBmdW5jdGlvbiBlamVjdChpZCkge1xuICBpZiAodGhpcy5oYW5kbGVyc1tpZF0pIHtcbiAgICB0aGlzLmhhbmRsZXJzW2lkXSA9IG51bGw7XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBpbnRlcmNlcHRvcnNcbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIGZvciBza2lwcGluZyBvdmVyIGFueVxuICogaW50ZXJjZXB0b3JzIHRoYXQgbWF5IGhhdmUgYmVjb21lIGBudWxsYCBjYWxsaW5nIGBlamVjdGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGZ1bmN0aW9uIHRvIGNhbGwgZm9yIGVhY2ggaW50ZXJjZXB0b3JcbiAqL1xuSW50ZXJjZXB0b3JNYW5hZ2VyLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gZm9yRWFjaChmbikge1xuICB1dGlscy5mb3JFYWNoKHRoaXMuaGFuZGxlcnMsIGZ1bmN0aW9uIGZvckVhY2hIYW5kbGVyKGgpIHtcbiAgICBpZiAoaCAhPT0gbnVsbCkge1xuICAgICAgZm4oaCk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSW50ZXJjZXB0b3JNYW5hZ2VyO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShoZWFkZXJzLCBub3JtYWxpemVkTmFtZSkge1xuICB1dGlscy5mb3JFYWNoKGhlYWRlcnMsIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXIodmFsdWUsIG5hbWUpIHtcbiAgICBpZiAobmFtZSAhPT0gbm9ybWFsaXplZE5hbWUgJiYgbmFtZS50b1VwcGVyQ2FzZSgpID09PSBub3JtYWxpemVkTmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICBoZWFkZXJzW25vcm1hbGl6ZWROYW1lXSA9IHZhbHVlO1xuICAgICAgZGVsZXRlIGhlYWRlcnNbbmFtZV07XG4gICAgfVxuICB9KTtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBVcGRhdGUgYW4gRXJyb3Igd2l0aCB0aGUgc3BlY2lmaWVkIGNvbmZpZywgZXJyb3IgY29kZSwgYW5kIHJlc3BvbnNlLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSBlcnJvciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIFRoZSBjb25maWcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2NvZGVdIFRoZSBlcnJvciBjb2RlIChmb3IgZXhhbXBsZSwgJ0VDT05OQUJPUlRFRCcpLlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXF1ZXN0XSBUaGUgcmVxdWVzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbcmVzcG9uc2VdIFRoZSByZXNwb25zZS5cbiAqIEByZXR1cm5zIHtFcnJvcn0gVGhlIGVycm9yLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSkge1xuICBlcnJvci5jb25maWcgPSBjb25maWc7XG4gIGlmIChjb2RlKSB7XG4gICAgZXJyb3IuY29kZSA9IGNvZGU7XG4gIH1cblxuICBlcnJvci5yZXF1ZXN0ID0gcmVxdWVzdDtcbiAgZXJyb3IucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgZXJyb3IuaXNBeGlvc0Vycm9yID0gdHJ1ZTtcblxuICBlcnJvci50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFN0YW5kYXJkXG4gICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2UsXG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAvLyBNaWNyb3NvZnRcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgbnVtYmVyOiB0aGlzLm51bWJlcixcbiAgICAgIC8vIE1vemlsbGFcbiAgICAgIGZpbGVOYW1lOiB0aGlzLmZpbGVOYW1lLFxuICAgICAgbGluZU51bWJlcjogdGhpcy5saW5lTnVtYmVyLFxuICAgICAgY29sdW1uTnVtYmVyOiB0aGlzLmNvbHVtbk51bWJlcixcbiAgICAgIHN0YWNrOiB0aGlzLnN0YWNrLFxuICAgICAgLy8gQXhpb3NcbiAgICAgIGNvbmZpZzogdGhpcy5jb25maWcsXG4gICAgICBjb2RlOiB0aGlzLmNvZGVcbiAgICB9O1xuICB9O1xuICByZXR1cm4gZXJyb3I7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2VuaGFuY2VFcnJvcicpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBFcnJvciB3aXRoIHRoZSBzcGVjaWZpZWQgbWVzc2FnZSwgY29uZmlnLCBlcnJvciBjb2RlLCByZXF1ZXN0IGFuZCByZXNwb25zZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSBUaGUgZXJyb3IgbWVzc2FnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgVGhlIGNvbmZpZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbY29kZV0gVGhlIGVycm9yIGNvZGUgKGZvciBleGFtcGxlLCAnRUNPTk5BQk9SVEVEJykuXG4gKiBAcGFyYW0ge09iamVjdH0gW3JlcXVlc3RdIFRoZSByZXF1ZXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtyZXNwb25zZV0gVGhlIHJlc3BvbnNlLlxuICogQHJldHVybnMge0Vycm9yfSBUaGUgY3JlYXRlZCBlcnJvci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGVFcnJvcihtZXNzYWdlLCBjb25maWcsIGNvZGUsIHJlcXVlc3QsIHJlc3BvbnNlKSB7XG4gIHZhciBlcnJvciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgcmV0dXJuIGVuaGFuY2VFcnJvcihlcnJvciwgY29uZmlnLCBjb2RlLCByZXF1ZXN0LCByZXNwb25zZSk7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBjcmVhdGVFcnJvciA9IHJlcXVpcmUoJy4vY3JlYXRlRXJyb3InKTtcblxuLyoqXG4gKiBSZXNvbHZlIG9yIHJlamVjdCBhIFByb21pc2UgYmFzZWQgb24gcmVzcG9uc2Ugc3RhdHVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlc29sdmUgQSBmdW5jdGlvbiB0aGF0IHJlc29sdmVzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVqZWN0IEEgZnVuY3Rpb24gdGhhdCByZWplY3RzIHRoZSBwcm9taXNlLlxuICogQHBhcmFtIHtvYmplY3R9IHJlc3BvbnNlIFRoZSByZXNwb25zZS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCByZXNwb25zZSkge1xuICB2YXIgdmFsaWRhdGVTdGF0dXMgPSByZXNwb25zZS5jb25maWcudmFsaWRhdGVTdGF0dXM7XG4gIGlmICghcmVzcG9uc2Uuc3RhdHVzIHx8ICF2YWxpZGF0ZVN0YXR1cyB8fCB2YWxpZGF0ZVN0YXR1cyhyZXNwb25zZS5zdGF0dXMpKSB7XG4gICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gIH0gZWxzZSB7XG4gICAgcmVqZWN0KGNyZWF0ZUVycm9yKFxuICAgICAgJ1JlcXVlc3QgZmFpbGVkIHdpdGggc3RhdHVzIGNvZGUgJyArIHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgIHJlc3BvbnNlLmNvbmZpZyxcbiAgICAgIG51bGwsXG4gICAgICByZXNwb25zZS5yZXF1ZXN0LFxuICAgICAgcmVzcG9uc2VcbiAgICApKTtcbiAgfVxufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKFxuICB1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpID9cblxuICAvLyBTdGFuZGFyZCBicm93c2VyIGVudnMgc3VwcG9ydCBkb2N1bWVudC5jb29raWVcbiAgICAoZnVuY3Rpb24gc3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKG5hbWUsIHZhbHVlLCBleHBpcmVzLCBwYXRoLCBkb21haW4sIHNlY3VyZSkge1xuICAgICAgICAgIHZhciBjb29raWUgPSBbXTtcbiAgICAgICAgICBjb29raWUucHVzaChuYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNOdW1iZXIoZXhwaXJlcykpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdleHBpcmVzPScgKyBuZXcgRGF0ZShleHBpcmVzKS50b0dNVFN0cmluZygpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgICAgICAgIGNvb2tpZS5wdXNoKCdwYXRoPScgKyBwYXRoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmcoZG9tYWluKSkge1xuICAgICAgICAgICAgY29va2llLnB1c2goJ2RvbWFpbj0nICsgZG9tYWluKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VjdXJlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBjb29raWUucHVzaCgnc2VjdXJlJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZG9jdW1lbnQuY29va2llID0gY29va2llLmpvaW4oJzsgJyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVhZDogZnVuY3Rpb24gcmVhZChuYW1lKSB7XG4gICAgICAgICAgdmFyIG1hdGNoID0gZG9jdW1lbnQuY29va2llLm1hdGNoKG5ldyBSZWdFeHAoJyhefDtcXFxccyopKCcgKyBuYW1lICsgJyk9KFteO10qKScpKTtcbiAgICAgICAgICByZXR1cm4gKG1hdGNoID8gZGVjb2RlVVJJQ29tcG9uZW50KG1hdGNoWzNdKSA6IG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgICAgICAgICB0aGlzLndyaXRlKG5hbWUsICcnLCBEYXRlLm5vdygpIC0gODY0MDAwMDApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKCkgOlxuXG4gIC8vIE5vbiBzdGFuZGFyZCBicm93c2VyIGVudiAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd3JpdGU6IGZ1bmN0aW9uIHdyaXRlKCkge30sXG4gICAgICAgIHJlYWQ6IGZ1bmN0aW9uIHJlYWQoKSB7IHJldHVybiBudWxsOyB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGVcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gdGVzdFxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHNwZWNpZmllZCBVUkwgaXMgYWJzb2x1dGUsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQWJzb2x1dGVVUkwodXJsKSB7XG4gIC8vIEEgVVJMIGlzIGNvbnNpZGVyZWQgYWJzb2x1dGUgaWYgaXQgYmVnaW5zIHdpdGggXCI8c2NoZW1lPjovL1wiIG9yIFwiLy9cIiAocHJvdG9jb2wtcmVsYXRpdmUgVVJMKS5cbiAgLy8gUkZDIDM5ODYgZGVmaW5lcyBzY2hlbWUgbmFtZSBhcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgYmVnaW5uaW5nIHdpdGggYSBsZXR0ZXIgYW5kIGZvbGxvd2VkXG4gIC8vIGJ5IGFueSBjb21iaW5hdGlvbiBvZiBsZXR0ZXJzLCBkaWdpdHMsIHBsdXMsIHBlcmlvZCwgb3IgaHlwaGVuLlxuICByZXR1cm4gL14oW2Etel1bYS16XFxkXFwrXFwtXFwuXSo6KT9cXC9cXC8vaS50ZXN0KHVybCk7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBVUkwgYnkgY29tYmluaW5nIHRoZSBzcGVjaWZpZWQgVVJMc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlVVJMIFRoZSBiYXNlIFVSTFxuICogQHBhcmFtIHtzdHJpbmd9IHJlbGF0aXZlVVJMIFRoZSByZWxhdGl2ZSBVUkxcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBVUkxcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjb21iaW5lVVJMcyhiYXNlVVJMLCByZWxhdGl2ZVVSTCkge1xuICByZXR1cm4gcmVsYXRpdmVVUkxcbiAgICA/IGJhc2VVUkwucmVwbGFjZSgvXFwvKyQvLCAnJykgKyAnLycgKyByZWxhdGl2ZVVSTC5yZXBsYWNlKC9eXFwvKy8sICcnKVxuICAgIDogYmFzZVVSTDtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQWJzb2x1dGVVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2lzQWJzb2x1dGVVUkwnKTtcbnZhciBjb21iaW5lVVJMcyA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvY29tYmluZVVSTHMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IFVSTCBieSBjb21iaW5pbmcgdGhlIGJhc2VVUkwgd2l0aCB0aGUgcmVxdWVzdGVkVVJMLFxuICogb25seSB3aGVuIHRoZSByZXF1ZXN0ZWRVUkwgaXMgbm90IGFscmVhZHkgYW4gYWJzb2x1dGUgVVJMLlxuICogSWYgdGhlIHJlcXVlc3RVUkwgaXMgYWJzb2x1dGUsIHRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgcmVxdWVzdGVkVVJMIHVudG91Y2hlZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVSTCBUaGUgYmFzZSBVUkxcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXF1ZXN0ZWRVUkwgQWJzb2x1dGUgb3IgcmVsYXRpdmUgVVJMIHRvIGNvbWJpbmVcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21iaW5lZCBmdWxsIHBhdGhcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBidWlsZEZ1bGxQYXRoKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCkge1xuICBpZiAoYmFzZVVSTCAmJiAhaXNBYnNvbHV0ZVVSTChyZXF1ZXN0ZWRVUkwpKSB7XG4gICAgcmV0dXJuIGNvbWJpbmVVUkxzKGJhc2VVUkwsIHJlcXVlc3RlZFVSTCk7XG4gIH1cbiAgcmV0dXJuIHJlcXVlc3RlZFVSTDtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG4vLyBIZWFkZXJzIHdob3NlIGR1cGxpY2F0ZXMgYXJlIGlnbm9yZWQgYnkgbm9kZVxuLy8gYy5mLiBodHRwczovL25vZGVqcy5vcmcvYXBpL2h0dHAuaHRtbCNodHRwX21lc3NhZ2VfaGVhZGVyc1xudmFyIGlnbm9yZUR1cGxpY2F0ZU9mID0gW1xuICAnYWdlJywgJ2F1dGhvcml6YXRpb24nLCAnY29udGVudC1sZW5ndGgnLCAnY29udGVudC10eXBlJywgJ2V0YWcnLFxuICAnZXhwaXJlcycsICdmcm9tJywgJ2hvc3QnLCAnaWYtbW9kaWZpZWQtc2luY2UnLCAnaWYtdW5tb2RpZmllZC1zaW5jZScsXG4gICdsYXN0LW1vZGlmaWVkJywgJ2xvY2F0aW9uJywgJ21heC1mb3J3YXJkcycsICdwcm94eS1hdXRob3JpemF0aW9uJyxcbiAgJ3JlZmVyZXInLCAncmV0cnktYWZ0ZXInLCAndXNlci1hZ2VudCdcbl07XG5cbi8qKlxuICogUGFyc2UgaGVhZGVycyBpbnRvIGFuIG9iamVjdFxuICpcbiAqIGBgYFxuICogRGF0ZTogV2VkLCAyNyBBdWcgMjAxNCAwODo1ODo0OSBHTVRcbiAqIENvbnRlbnQtVHlwZTogYXBwbGljYXRpb24vanNvblxuICogQ29ubmVjdGlvbjoga2VlcC1hbGl2ZVxuICogVHJhbnNmZXItRW5jb2Rpbmc6IGNodW5rZWRcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWFkZXJzIEhlYWRlcnMgbmVlZGluZyB0byBiZSBwYXJzZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IEhlYWRlcnMgcGFyc2VkIGludG8gYW4gb2JqZWN0XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGFyc2VIZWFkZXJzKGhlYWRlcnMpIHtcbiAgdmFyIHBhcnNlZCA9IHt9O1xuICB2YXIga2V5O1xuICB2YXIgdmFsO1xuICB2YXIgaTtcblxuICBpZiAoIWhlYWRlcnMpIHsgcmV0dXJuIHBhcnNlZDsgfVxuXG4gIHV0aWxzLmZvckVhY2goaGVhZGVycy5zcGxpdCgnXFxuJyksIGZ1bmN0aW9uIHBhcnNlcihsaW5lKSB7XG4gICAgaSA9IGxpbmUuaW5kZXhPZignOicpO1xuICAgIGtleSA9IHV0aWxzLnRyaW0obGluZS5zdWJzdHIoMCwgaSkpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdXRpbHMudHJpbShsaW5lLnN1YnN0cihpICsgMSkpO1xuXG4gICAgaWYgKGtleSkge1xuICAgICAgaWYgKHBhcnNlZFtrZXldICYmIGlnbm9yZUR1cGxpY2F0ZU9mLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09ICdzZXQtY29va2llJykge1xuICAgICAgICBwYXJzZWRba2V5XSA9IChwYXJzZWRba2V5XSA/IHBhcnNlZFtrZXldIDogW10pLmNvbmNhdChbdmFsXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJzZWRba2V5XSA9IHBhcnNlZFtrZXldID8gcGFyc2VkW2tleV0gKyAnLCAnICsgdmFsIDogdmFsO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHBhcnNlZDtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgdXRpbHMuaXNTdGFuZGFyZEJyb3dzZXJFbnYoKSA/XG5cbiAgLy8gU3RhbmRhcmQgYnJvd3NlciBlbnZzIGhhdmUgZnVsbCBzdXBwb3J0IG9mIHRoZSBBUElzIG5lZWRlZCB0byB0ZXN0XG4gIC8vIHdoZXRoZXIgdGhlIHJlcXVlc3QgVVJMIGlzIG9mIHRoZSBzYW1lIG9yaWdpbiBhcyBjdXJyZW50IGxvY2F0aW9uLlxuICAgIChmdW5jdGlvbiBzdGFuZGFyZEJyb3dzZXJFbnYoKSB7XG4gICAgICB2YXIgbXNpZSA9IC8obXNpZXx0cmlkZW50KS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgdXJsUGFyc2luZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICB2YXIgb3JpZ2luVVJMO1xuXG4gICAgICAvKipcbiAgICAqIFBhcnNlIGEgVVJMIHRvIGRpc2NvdmVyIGl0J3MgY29tcG9uZW50c1xuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSB1cmwgVGhlIFVSTCB0byBiZSBwYXJzZWRcbiAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgKi9cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVVUkwodXJsKSB7XG4gICAgICAgIHZhciBocmVmID0gdXJsO1xuXG4gICAgICAgIGlmIChtc2llKSB7XG4gICAgICAgIC8vIElFIG5lZWRzIGF0dHJpYnV0ZSBzZXQgdHdpY2UgdG8gbm9ybWFsaXplIHByb3BlcnRpZXNcbiAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBocmVmKTtcbiAgICAgICAgICBocmVmID0gdXJsUGFyc2luZ05vZGUuaHJlZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybFBhcnNpbmdOb2RlLnNldEF0dHJpYnV0ZSgnaHJlZicsIGhyZWYpO1xuXG4gICAgICAgIC8vIHVybFBhcnNpbmdOb2RlIHByb3ZpZGVzIHRoZSBVcmxVdGlscyBpbnRlcmZhY2UgLSBodHRwOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jdXJsdXRpbHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBocmVmOiB1cmxQYXJzaW5nTm9kZS5ocmVmLFxuICAgICAgICAgIHByb3RvY29sOiB1cmxQYXJzaW5nTm9kZS5wcm90b2NvbCA/IHVybFBhcnNpbmdOb2RlLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgICAgaG9zdDogdXJsUGFyc2luZ05vZGUuaG9zdCxcbiAgICAgICAgICBzZWFyY2g6IHVybFBhcnNpbmdOb2RlLnNlYXJjaCA/IHVybFBhcnNpbmdOb2RlLnNlYXJjaC5yZXBsYWNlKC9eXFw/LywgJycpIDogJycsXG4gICAgICAgICAgaGFzaDogdXJsUGFyc2luZ05vZGUuaGFzaCA/IHVybFBhcnNpbmdOb2RlLmhhc2gucmVwbGFjZSgvXiMvLCAnJykgOiAnJyxcbiAgICAgICAgICBob3N0bmFtZTogdXJsUGFyc2luZ05vZGUuaG9zdG5hbWUsXG4gICAgICAgICAgcG9ydDogdXJsUGFyc2luZ05vZGUucG9ydCxcbiAgICAgICAgICBwYXRobmFtZTogKHVybFBhcnNpbmdOb2RlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nKSA/XG4gICAgICAgICAgICB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZSA6XG4gICAgICAgICAgICAnLycgKyB1cmxQYXJzaW5nTm9kZS5wYXRobmFtZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBvcmlnaW5VUkwgPSByZXNvbHZlVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcblxuICAgICAgLyoqXG4gICAgKiBEZXRlcm1pbmUgaWYgYSBVUkwgc2hhcmVzIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCBsb2NhdGlvblxuICAgICpcbiAgICAqIEBwYXJhbSB7U3RyaW5nfSByZXF1ZXN0VVJMIFRoZSBVUkwgdG8gdGVzdFxuICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgVVJMIHNoYXJlcyB0aGUgc2FtZSBvcmlnaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgICovXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaXNVUkxTYW1lT3JpZ2luKHJlcXVlc3RVUkwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9ICh1dGlscy5pc1N0cmluZyhyZXF1ZXN0VVJMKSkgPyByZXNvbHZlVVJMKHJlcXVlc3RVUkwpIDogcmVxdWVzdFVSTDtcbiAgICAgICAgcmV0dXJuIChwYXJzZWQucHJvdG9jb2wgPT09IG9yaWdpblVSTC5wcm90b2NvbCAmJlxuICAgICAgICAgICAgcGFyc2VkLmhvc3QgPT09IG9yaWdpblVSTC5ob3N0KTtcbiAgICAgIH07XG4gICAgfSkoKSA6XG5cbiAgLy8gTm9uIHN0YW5kYXJkIGJyb3dzZXIgZW52cyAod2ViIHdvcmtlcnMsIHJlYWN0LW5hdGl2ZSkgbGFjayBuZWVkZWQgc3VwcG9ydC5cbiAgICAoZnVuY3Rpb24gbm9uU3RhbmRhcmRCcm93c2VyRW52KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGlzVVJMU2FtZU9yaWdpbigpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH0pKClcbik7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi8uLi91dGlscycpO1xudmFyIHNldHRsZSA9IHJlcXVpcmUoJy4vLi4vY29yZS9zZXR0bGUnKTtcbnZhciBjb29raWVzID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2Nvb2tpZXMnKTtcbnZhciBidWlsZFVSTCA9IHJlcXVpcmUoJy4vLi4vaGVscGVycy9idWlsZFVSTCcpO1xudmFyIGJ1aWxkRnVsbFBhdGggPSByZXF1aXJlKCcuLi9jb3JlL2J1aWxkRnVsbFBhdGgnKTtcbnZhciBwYXJzZUhlYWRlcnMgPSByZXF1aXJlKCcuLy4uL2hlbHBlcnMvcGFyc2VIZWFkZXJzJyk7XG52YXIgaXNVUkxTYW1lT3JpZ2luID0gcmVxdWlyZSgnLi8uLi9oZWxwZXJzL2lzVVJMU2FtZU9yaWdpbicpO1xudmFyIGNyZWF0ZUVycm9yID0gcmVxdWlyZSgnLi4vY29yZS9jcmVhdGVFcnJvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHhockFkYXB0ZXIoY29uZmlnKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiBkaXNwYXRjaFhoclJlcXVlc3QocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHJlcXVlc3REYXRhID0gY29uZmlnLmRhdGE7XG4gICAgdmFyIHJlcXVlc3RIZWFkZXJzID0gY29uZmlnLmhlYWRlcnM7XG4gICAgdmFyIHJlc3BvbnNlVHlwZSA9IGNvbmZpZy5yZXNwb25zZVR5cGU7XG5cbiAgICBpZiAodXRpbHMuaXNGb3JtRGF0YShyZXF1ZXN0RGF0YSkpIHtcbiAgICAgIGRlbGV0ZSByZXF1ZXN0SGVhZGVyc1snQ29udGVudC1UeXBlJ107IC8vIExldCB0aGUgYnJvd3NlciBzZXQgaXRcbiAgICB9XG5cbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgLy8gSFRUUCBiYXNpYyBhdXRoZW50aWNhdGlvblxuICAgIGlmIChjb25maWcuYXV0aCkge1xuICAgICAgdmFyIHVzZXJuYW1lID0gY29uZmlnLmF1dGgudXNlcm5hbWUgfHwgJyc7XG4gICAgICB2YXIgcGFzc3dvcmQgPSBjb25maWcuYXV0aC5wYXNzd29yZCA/IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChjb25maWcuYXV0aC5wYXNzd29yZCkpIDogJyc7XG4gICAgICByZXF1ZXN0SGVhZGVycy5BdXRob3JpemF0aW9uID0gJ0Jhc2ljICcgKyBidG9hKHVzZXJuYW1lICsgJzonICsgcGFzc3dvcmQpO1xuICAgIH1cblxuICAgIHZhciBmdWxsUGF0aCA9IGJ1aWxkRnVsbFBhdGgoY29uZmlnLmJhc2VVUkwsIGNvbmZpZy51cmwpO1xuICAgIHJlcXVlc3Qub3Blbihjb25maWcubWV0aG9kLnRvVXBwZXJDYXNlKCksIGJ1aWxkVVJMKGZ1bGxQYXRoLCBjb25maWcucGFyYW1zLCBjb25maWcucGFyYW1zU2VyaWFsaXplciksIHRydWUpO1xuXG4gICAgLy8gU2V0IHRoZSByZXF1ZXN0IHRpbWVvdXQgaW4gTVNcbiAgICByZXF1ZXN0LnRpbWVvdXQgPSBjb25maWcudGltZW91dDtcblxuICAgIGZ1bmN0aW9uIG9ubG9hZGVuZCgpIHtcbiAgICAgIGlmICghcmVxdWVzdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBQcmVwYXJlIHRoZSByZXNwb25zZVxuICAgICAgdmFyIHJlc3BvbnNlSGVhZGVycyA9ICdnZXRBbGxSZXNwb25zZUhlYWRlcnMnIGluIHJlcXVlc3QgPyBwYXJzZUhlYWRlcnMocmVxdWVzdC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkgOiBudWxsO1xuICAgICAgdmFyIHJlc3BvbnNlRGF0YSA9ICFyZXNwb25zZVR5cGUgfHwgcmVzcG9uc2VUeXBlID09PSAndGV4dCcgfHwgIHJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nID9cbiAgICAgICAgcmVxdWVzdC5yZXNwb25zZVRleHQgOiByZXF1ZXN0LnJlc3BvbnNlO1xuICAgICAgdmFyIHJlc3BvbnNlID0ge1xuICAgICAgICBkYXRhOiByZXNwb25zZURhdGEsXG4gICAgICAgIHN0YXR1czogcmVxdWVzdC5zdGF0dXMsXG4gICAgICAgIHN0YXR1c1RleHQ6IHJlcXVlc3Quc3RhdHVzVGV4dCxcbiAgICAgICAgaGVhZGVyczogcmVzcG9uc2VIZWFkZXJzLFxuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgcmVxdWVzdDogcmVxdWVzdFxuICAgICAgfTtcblxuICAgICAgc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgcmVzcG9uc2UpO1xuXG4gICAgICAvLyBDbGVhbiB1cCByZXF1ZXN0XG4gICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoJ29ubG9hZGVuZCcgaW4gcmVxdWVzdCkge1xuICAgICAgLy8gVXNlIG9ubG9hZGVuZCBpZiBhdmFpbGFibGVcbiAgICAgIHJlcXVlc3Qub25sb2FkZW5kID0gb25sb2FkZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMaXN0ZW4gZm9yIHJlYWR5IHN0YXRlIHRvIGVtdWxhdGUgb25sb2FkZW5kXG4gICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uIGhhbmRsZUxvYWQoKSB7XG4gICAgICAgIGlmICghcmVxdWVzdCB8fCByZXF1ZXN0LnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgcmVxdWVzdCBlcnJvcmVkIG91dCBhbmQgd2UgZGlkbid0IGdldCBhIHJlc3BvbnNlLCB0aGlzIHdpbGwgYmVcbiAgICAgICAgLy8gaGFuZGxlZCBieSBvbmVycm9yIGluc3RlYWRcbiAgICAgICAgLy8gV2l0aCBvbmUgZXhjZXB0aW9uOiByZXF1ZXN0IHRoYXQgdXNpbmcgZmlsZTogcHJvdG9jb2wsIG1vc3QgYnJvd3NlcnNcbiAgICAgICAgLy8gd2lsbCByZXR1cm4gc3RhdHVzIGFzIDAgZXZlbiB0aG91Z2ggaXQncyBhIHN1Y2Nlc3NmdWwgcmVxdWVzdFxuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDAgJiYgIShyZXF1ZXN0LnJlc3BvbnNlVVJMICYmIHJlcXVlc3QucmVzcG9uc2VVUkwuaW5kZXhPZignZmlsZTonKSA9PT0gMCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmVhZHlzdGF0ZSBoYW5kbGVyIGlzIGNhbGxpbmcgYmVmb3JlIG9uZXJyb3Igb3Igb250aW1lb3V0IGhhbmRsZXJzLFxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgY2FsbCBvbmxvYWRlbmQgb24gdGhlIG5leHQgJ3RpY2snXG4gICAgICAgIHNldFRpbWVvdXQob25sb2FkZW5kKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIGJyb3dzZXIgcmVxdWVzdCBjYW5jZWxsYXRpb24gKGFzIG9wcG9zZWQgdG8gYSBtYW51YWwgY2FuY2VsbGF0aW9uKVxuICAgIHJlcXVlc3Qub25hYm9ydCA9IGZ1bmN0aW9uIGhhbmRsZUFib3J0KCkge1xuICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdSZXF1ZXN0IGFib3J0ZWQnLCBjb25maWcsICdFQ09OTkFCT1JURUQnLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgbG93IGxldmVsIG5ldHdvcmsgZXJyb3JzXG4gICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gaGFuZGxlRXJyb3IoKSB7XG4gICAgICAvLyBSZWFsIGVycm9ycyBhcmUgaGlkZGVuIGZyb20gdXMgYnkgdGhlIGJyb3dzZXJcbiAgICAgIC8vIG9uZXJyb3Igc2hvdWxkIG9ubHkgZmlyZSBpZiBpdCdzIGEgbmV0d29yayBlcnJvclxuICAgICAgcmVqZWN0KGNyZWF0ZUVycm9yKCdOZXR3b3JrIEVycm9yJywgY29uZmlnLCBudWxsLCByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBIYW5kbGUgdGltZW91dFxuICAgIHJlcXVlc3Qub250aW1lb3V0ID0gZnVuY3Rpb24gaGFuZGxlVGltZW91dCgpIHtcbiAgICAgIHZhciB0aW1lb3V0RXJyb3JNZXNzYWdlID0gJ3RpbWVvdXQgb2YgJyArIGNvbmZpZy50aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJztcbiAgICAgIGlmIChjb25maWcudGltZW91dEVycm9yTWVzc2FnZSkge1xuICAgICAgICB0aW1lb3V0RXJyb3JNZXNzYWdlID0gY29uZmlnLnRpbWVvdXRFcnJvck1lc3NhZ2U7XG4gICAgICB9XG4gICAgICByZWplY3QoY3JlYXRlRXJyb3IoXG4gICAgICAgIHRpbWVvdXRFcnJvck1lc3NhZ2UsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgY29uZmlnLnRyYW5zaXRpb25hbCAmJiBjb25maWcudHJhbnNpdGlvbmFsLmNsYXJpZnlUaW1lb3V0RXJyb3IgPyAnRVRJTUVET1VUJyA6ICdFQ09OTkFCT1JURUQnLFxuICAgICAgICByZXF1ZXN0KSk7XG5cbiAgICAgIC8vIENsZWFuIHVwIHJlcXVlc3RcbiAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgIH07XG5cbiAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAvLyBUaGlzIGlzIG9ubHkgZG9uZSBpZiBydW5uaW5nIGluIGEgc3RhbmRhcmQgYnJvd3NlciBlbnZpcm9ubWVudC5cbiAgICAvLyBTcGVjaWZpY2FsbHkgbm90IGlmIHdlJ3JlIGluIGEgd2ViIHdvcmtlciwgb3IgcmVhY3QtbmF0aXZlLlxuICAgIGlmICh1dGlscy5pc1N0YW5kYXJkQnJvd3NlckVudigpKSB7XG4gICAgICAvLyBBZGQgeHNyZiBoZWFkZXJcbiAgICAgIHZhciB4c3JmVmFsdWUgPSAoY29uZmlnLndpdGhDcmVkZW50aWFscyB8fCBpc1VSTFNhbWVPcmlnaW4oZnVsbFBhdGgpKSAmJiBjb25maWcueHNyZkNvb2tpZU5hbWUgP1xuICAgICAgICBjb29raWVzLnJlYWQoY29uZmlnLnhzcmZDb29raWVOYW1lKSA6XG4gICAgICAgIHVuZGVmaW5lZDtcblxuICAgICAgaWYgKHhzcmZWYWx1ZSkge1xuICAgICAgICByZXF1ZXN0SGVhZGVyc1tjb25maWcueHNyZkhlYWRlck5hbWVdID0geHNyZlZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBoZWFkZXJzIHRvIHRoZSByZXF1ZXN0XG4gICAgaWYgKCdzZXRSZXF1ZXN0SGVhZGVyJyBpbiByZXF1ZXN0KSB7XG4gICAgICB1dGlscy5mb3JFYWNoKHJlcXVlc3RIZWFkZXJzLCBmdW5jdGlvbiBzZXRSZXF1ZXN0SGVhZGVyKHZhbCwga2V5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVxdWVzdERhdGEgPT09ICd1bmRlZmluZWQnICYmIGtleS50b0xvd2VyQ2FzZSgpID09PSAnY29udGVudC10eXBlJykge1xuICAgICAgICAgIC8vIFJlbW92ZSBDb250ZW50LVR5cGUgaWYgZGF0YSBpcyB1bmRlZmluZWRcbiAgICAgICAgICBkZWxldGUgcmVxdWVzdEhlYWRlcnNba2V5XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBPdGhlcndpc2UgYWRkIGhlYWRlciB0byB0aGUgcmVxdWVzdFxuICAgICAgICAgIHJlcXVlc3Quc2V0UmVxdWVzdEhlYWRlcihrZXksIHZhbCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEFkZCB3aXRoQ3JlZGVudGlhbHMgdG8gcmVxdWVzdCBpZiBuZWVkZWRcbiAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKGNvbmZpZy53aXRoQ3JlZGVudGlhbHMpKSB7XG4gICAgICByZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9ICEhY29uZmlnLndpdGhDcmVkZW50aWFscztcbiAgICB9XG5cbiAgICAvLyBBZGQgcmVzcG9uc2VUeXBlIHRvIHJlcXVlc3QgaWYgbmVlZGVkXG4gICAgaWYgKHJlc3BvbnNlVHlwZSAmJiByZXNwb25zZVR5cGUgIT09ICdqc29uJykge1xuICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBwcm9ncmVzcyBpZiBuZWVkZWRcbiAgICBpZiAodHlwZW9mIGNvbmZpZy5vbkRvd25sb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBjb25maWcub25Eb3dubG9hZFByb2dyZXNzKTtcbiAgICB9XG5cbiAgICAvLyBOb3QgYWxsIGJyb3dzZXJzIHN1cHBvcnQgdXBsb2FkIGV2ZW50c1xuICAgIGlmICh0eXBlb2YgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicgJiYgcmVxdWVzdC51cGxvYWQpIHtcbiAgICAgIHJlcXVlc3QudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgY29uZmlnLm9uVXBsb2FkUHJvZ3Jlc3MpO1xuICAgIH1cblxuICAgIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICAgIC8vIEhhbmRsZSBjYW5jZWxsYXRpb25cbiAgICAgIGNvbmZpZy5jYW5jZWxUb2tlbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gb25DYW5jZWxlZChjYW5jZWwpIHtcbiAgICAgICAgaWYgKCFyZXF1ZXN0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICByZWplY3QoY2FuY2VsKTtcbiAgICAgICAgLy8gQ2xlYW4gdXAgcmVxdWVzdFxuICAgICAgICByZXF1ZXN0ID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghcmVxdWVzdERhdGEpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByZXF1ZXN0XG4gICAgcmVxdWVzdC5zZW5kKHJlcXVlc3REYXRhKTtcbiAgfSk7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBub3JtYWxpemVIZWFkZXJOYW1lID0gcmVxdWlyZSgnLi9oZWxwZXJzL25vcm1hbGl6ZUhlYWRlck5hbWUnKTtcbnZhciBlbmhhbmNlRXJyb3IgPSByZXF1aXJlKCcuL2NvcmUvZW5oYW5jZUVycm9yJyk7XG5cbnZhciBERUZBVUxUX0NPTlRFTlRfVFlQRSA9IHtcbiAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG5mdW5jdGlvbiBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgdmFsdWUpIHtcbiAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzKSAmJiB1dGlscy5pc1VuZGVmaW5lZChoZWFkZXJzWydDb250ZW50LVR5cGUnXSkpIHtcbiAgICBoZWFkZXJzWydDb250ZW50LVR5cGUnXSA9IHZhbHVlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldERlZmF1bHRBZGFwdGVyKCkge1xuICB2YXIgYWRhcHRlcjtcbiAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBGb3IgYnJvd3NlcnMgdXNlIFhIUiBhZGFwdGVyXG4gICAgYWRhcHRlciA9IHJlcXVpcmUoJy4vYWRhcHRlcnMveGhyJyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nKSB7XG4gICAgLy8gRm9yIG5vZGUgdXNlIEhUVFAgYWRhcHRlclxuICAgIGFkYXB0ZXIgPSByZXF1aXJlKCcuL2FkYXB0ZXJzL2h0dHAnKTtcbiAgfVxuICByZXR1cm4gYWRhcHRlcjtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5U2FmZWx5KHJhd1ZhbHVlLCBwYXJzZXIsIGVuY29kZXIpIHtcbiAgaWYgKHV0aWxzLmlzU3RyaW5nKHJhd1ZhbHVlKSkge1xuICAgIHRyeSB7XG4gICAgICAocGFyc2VyIHx8IEpTT04ucGFyc2UpKHJhd1ZhbHVlKTtcbiAgICAgIHJldHVybiB1dGlscy50cmltKHJhd1ZhbHVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZS5uYW1lICE9PSAnU3ludGF4RXJyb3InKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChlbmNvZGVyIHx8IEpTT04uc3RyaW5naWZ5KShyYXdWYWx1ZSk7XG59XG5cbnZhciBkZWZhdWx0cyA9IHtcblxuICB0cmFuc2l0aW9uYWw6IHtcbiAgICBzaWxlbnRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBmb3JjZWRKU09OUGFyc2luZzogdHJ1ZSxcbiAgICBjbGFyaWZ5VGltZW91dEVycm9yOiBmYWxzZVxuICB9LFxuXG4gIGFkYXB0ZXI6IGdldERlZmF1bHRBZGFwdGVyKCksXG5cbiAgdHJhbnNmb3JtUmVxdWVzdDogW2Z1bmN0aW9uIHRyYW5zZm9ybVJlcXVlc3QoZGF0YSwgaGVhZGVycykge1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0FjY2VwdCcpO1xuICAgIG5vcm1hbGl6ZUhlYWRlck5hbWUoaGVhZGVycywgJ0NvbnRlbnQtVHlwZScpO1xuXG4gICAgaWYgKHV0aWxzLmlzRm9ybURhdGEoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQXJyYXlCdWZmZXIoZGF0YSkgfHxcbiAgICAgIHV0aWxzLmlzQnVmZmVyKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc1N0cmVhbShkYXRhKSB8fFxuICAgICAgdXRpbHMuaXNGaWxlKGRhdGEpIHx8XG4gICAgICB1dGlscy5pc0Jsb2IoZGF0YSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNBcnJheUJ1ZmZlclZpZXcoZGF0YSkpIHtcbiAgICAgIHJldHVybiBkYXRhLmJ1ZmZlcjtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzVVJMU2VhcmNoUGFyYW1zKGRhdGEpKSB7XG4gICAgICBzZXRDb250ZW50VHlwZUlmVW5zZXQoaGVhZGVycywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04Jyk7XG4gICAgICByZXR1cm4gZGF0YS50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAodXRpbHMuaXNPYmplY3QoZGF0YSkgfHwgKGhlYWRlcnMgJiYgaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPT09ICdhcHBsaWNhdGlvbi9qc29uJykpIHtcbiAgICAgIHNldENvbnRlbnRUeXBlSWZVbnNldChoZWFkZXJzLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgcmV0dXJuIHN0cmluZ2lmeVNhZmVseShkYXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1dLFxuXG4gIHRyYW5zZm9ybVJlc3BvbnNlOiBbZnVuY3Rpb24gdHJhbnNmb3JtUmVzcG9uc2UoZGF0YSkge1xuICAgIHZhciB0cmFuc2l0aW9uYWwgPSB0aGlzLnRyYW5zaXRpb25hbDtcbiAgICB2YXIgc2lsZW50SlNPTlBhcnNpbmcgPSB0cmFuc2l0aW9uYWwgJiYgdHJhbnNpdGlvbmFsLnNpbGVudEpTT05QYXJzaW5nO1xuICAgIHZhciBmb3JjZWRKU09OUGFyc2luZyA9IHRyYW5zaXRpb25hbCAmJiB0cmFuc2l0aW9uYWwuZm9yY2VkSlNPTlBhcnNpbmc7XG4gICAgdmFyIHN0cmljdEpTT05QYXJzaW5nID0gIXNpbGVudEpTT05QYXJzaW5nICYmIHRoaXMucmVzcG9uc2VUeXBlID09PSAnanNvbic7XG5cbiAgICBpZiAoc3RyaWN0SlNPTlBhcnNpbmcgfHwgKGZvcmNlZEpTT05QYXJzaW5nICYmIHV0aWxzLmlzU3RyaW5nKGRhdGEpICYmIGRhdGEubGVuZ3RoKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChzdHJpY3RKU09OUGFyc2luZykge1xuICAgICAgICAgIGlmIChlLm5hbWUgPT09ICdTeW50YXhFcnJvcicpIHtcbiAgICAgICAgICAgIHRocm93IGVuaGFuY2VFcnJvcihlLCB0aGlzLCAnRV9KU09OX1BBUlNFJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGF0YTtcbiAgfV0sXG5cbiAgLyoqXG4gICAqIEEgdGltZW91dCBpbiBtaWxsaXNlY29uZHMgdG8gYWJvcnQgYSByZXF1ZXN0LiBJZiBzZXQgdG8gMCAoZGVmYXVsdCkgYVxuICAgKiB0aW1lb3V0IGlzIG5vdCBjcmVhdGVkLlxuICAgKi9cbiAgdGltZW91dDogMCxcblxuICB4c3JmQ29va2llTmFtZTogJ1hTUkYtVE9LRU4nLFxuICB4c3JmSGVhZGVyTmFtZTogJ1gtWFNSRi1UT0tFTicsXG5cbiAgbWF4Q29udGVudExlbmd0aDogLTEsXG4gIG1heEJvZHlMZW5ndGg6IC0xLFxuXG4gIHZhbGlkYXRlU3RhdHVzOiBmdW5jdGlvbiB2YWxpZGF0ZVN0YXR1cyhzdGF0dXMpIHtcbiAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDA7XG4gIH1cbn07XG5cbmRlZmF1bHRzLmhlYWRlcnMgPSB7XG4gIGNvbW1vbjoge1xuICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJ1xuICB9XG59O1xuXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJ10sIGZ1bmN0aW9uIGZvckVhY2hNZXRob2ROb0RhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHt9O1xufSk7XG5cbnV0aWxzLmZvckVhY2goWydwb3N0JywgJ3B1dCcsICdwYXRjaCddLCBmdW5jdGlvbiBmb3JFYWNoTWV0aG9kV2l0aERhdGEobWV0aG9kKSB7XG4gIGRlZmF1bHRzLmhlYWRlcnNbbWV0aG9kXSA9IHV0aWxzLm1lcmdlKERFRkFVTFRfQ09OVEVOVF9UWVBFKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vLi4vdXRpbHMnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJy4vLi4vZGVmYXVsdHMnKTtcblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIGRhdGEgZm9yIGEgcmVxdWVzdCBvciBhIHJlc3BvbnNlXG4gKlxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBkYXRhIFRoZSBkYXRhIHRvIGJlIHRyYW5zZm9ybWVkXG4gKiBAcGFyYW0ge0FycmF5fSBoZWFkZXJzIFRoZSBoZWFkZXJzIGZvciB0aGUgcmVxdWVzdCBvciByZXNwb25zZVxuICogQHBhcmFtIHtBcnJheXxGdW5jdGlvbn0gZm5zIEEgc2luZ2xlIGZ1bmN0aW9uIG9yIEFycmF5IG9mIGZ1bmN0aW9uc1xuICogQHJldHVybnMgeyp9IFRoZSByZXN1bHRpbmcgdHJhbnNmb3JtZWQgZGF0YVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRyYW5zZm9ybURhdGEoZGF0YSwgaGVhZGVycywgZm5zKSB7XG4gIHZhciBjb250ZXh0ID0gdGhpcyB8fCBkZWZhdWx0cztcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIHV0aWxzLmZvckVhY2goZm5zLCBmdW5jdGlvbiB0cmFuc2Zvcm0oZm4pIHtcbiAgICBkYXRhID0gZm4uY2FsbChjb250ZXh0LCBkYXRhLCBoZWFkZXJzKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGRhdGE7XG59O1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNDYW5jZWwodmFsdWUpIHtcbiAgcmV0dXJuICEhKHZhbHVlICYmIHZhbHVlLl9fQ0FOQ0VMX18pO1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgdHJhbnNmb3JtRGF0YSA9IHJlcXVpcmUoJy4vdHJhbnNmb3JtRGF0YScpO1xudmFyIGlzQ2FuY2VsID0gcmVxdWlyZSgnLi4vY2FuY2VsL2lzQ2FuY2VsJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCcuLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIFRocm93cyBhIGBDYW5jZWxgIGlmIGNhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuXG4gKi9cbmZ1bmN0aW9uIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKSB7XG4gIGlmIChjb25maWcuY2FuY2VsVG9rZW4pIHtcbiAgICBjb25maWcuY2FuY2VsVG9rZW4udGhyb3dJZlJlcXVlc3RlZCgpO1xuICB9XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgdXNpbmcgdGhlIGNvbmZpZ3VyZWQgYWRhcHRlci5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIFRoZSBjb25maWcgdGhhdCBpcyB0byBiZSB1c2VkIGZvciB0aGUgcmVxdWVzdFxuICogQHJldHVybnMge1Byb21pc2V9IFRoZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRpc3BhdGNoUmVxdWVzdChjb25maWcpIHtcbiAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gIC8vIEVuc3VyZSBoZWFkZXJzIGV4aXN0XG4gIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG5cbiAgLy8gVHJhbnNmb3JtIHJlcXVlc3QgZGF0YVxuICBjb25maWcuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICBjb25maWcsXG4gICAgY29uZmlnLmRhdGEsXG4gICAgY29uZmlnLmhlYWRlcnMsXG4gICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3RcbiAgKTtcblxuICAvLyBGbGF0dGVuIGhlYWRlcnNcbiAgY29uZmlnLmhlYWRlcnMgPSB1dGlscy5tZXJnZShcbiAgICBjb25maWcuaGVhZGVycy5jb21tb24gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNbY29uZmlnLm1ldGhvZF0gfHwge30sXG4gICAgY29uZmlnLmhlYWRlcnNcbiAgKTtcblxuICB1dGlscy5mb3JFYWNoKFxuICAgIFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ3Bvc3QnLCAncHV0JywgJ3BhdGNoJywgJ2NvbW1vbiddLFxuICAgIGZ1bmN0aW9uIGNsZWFuSGVhZGVyQ29uZmlnKG1ldGhvZCkge1xuICAgICAgZGVsZXRlIGNvbmZpZy5oZWFkZXJzW21ldGhvZF07XG4gICAgfVxuICApO1xuXG4gIHZhciBhZGFwdGVyID0gY29uZmlnLmFkYXB0ZXIgfHwgZGVmYXVsdHMuYWRhcHRlcjtcblxuICByZXR1cm4gYWRhcHRlcihjb25maWcpLnRoZW4oZnVuY3Rpb24gb25BZGFwdGVyUmVzb2x1dGlvbihyZXNwb25zZSkge1xuICAgIHRocm93SWZDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoY29uZmlnKTtcblxuICAgIC8vIFRyYW5zZm9ybSByZXNwb25zZSBkYXRhXG4gICAgcmVzcG9uc2UuZGF0YSA9IHRyYW5zZm9ybURhdGEuY2FsbChcbiAgICAgIGNvbmZpZyxcbiAgICAgIHJlc3BvbnNlLmRhdGEsXG4gICAgICByZXNwb25zZS5oZWFkZXJzLFxuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlc3BvbnNlXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZTtcbiAgfSwgZnVuY3Rpb24gb25BZGFwdGVyUmVqZWN0aW9uKHJlYXNvbikge1xuICAgIGlmICghaXNDYW5jZWwocmVhc29uKSkge1xuICAgICAgdGhyb3dJZkNhbmNlbGxhdGlvblJlcXVlc3RlZChjb25maWcpO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gcmVzcG9uc2UgZGF0YVxuICAgICAgaWYgKHJlYXNvbiAmJiByZWFzb24ucmVzcG9uc2UpIHtcbiAgICAgICAgcmVhc29uLnJlc3BvbnNlLmRhdGEgPSB0cmFuc2Zvcm1EYXRhLmNhbGwoXG4gICAgICAgICAgY29uZmlnLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5kYXRhLFxuICAgICAgICAgIHJlYXNvbi5yZXNwb25zZS5oZWFkZXJzLFxuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXNwb25zZVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChyZWFzb24pO1xuICB9KTtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuLyoqXG4gKiBDb25maWctc3BlY2lmaWMgbWVyZ2UtZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhIG5ldyBjb25maWctb2JqZWN0XG4gKiBieSBtZXJnaW5nIHR3byBjb25maWd1cmF0aW9uIG9iamVjdHMgdG9nZXRoZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZzFcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBOZXcgb2JqZWN0IHJlc3VsdGluZyBmcm9tIG1lcmdpbmcgY29uZmlnMiB0byBjb25maWcxXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWVyZ2VDb25maWcoY29uZmlnMSwgY29uZmlnMikge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgY29uZmlnMiA9IGNvbmZpZzIgfHwge307XG4gIHZhciBjb25maWcgPSB7fTtcblxuICB2YXIgdmFsdWVGcm9tQ29uZmlnMktleXMgPSBbJ3VybCcsICdtZXRob2QnLCAnZGF0YSddO1xuICB2YXIgbWVyZ2VEZWVwUHJvcGVydGllc0tleXMgPSBbJ2hlYWRlcnMnLCAnYXV0aCcsICdwcm94eScsICdwYXJhbXMnXTtcbiAgdmFyIGRlZmF1bHRUb0NvbmZpZzJLZXlzID0gW1xuICAgICdiYXNlVVJMJywgJ3RyYW5zZm9ybVJlcXVlc3QnLCAndHJhbnNmb3JtUmVzcG9uc2UnLCAncGFyYW1zU2VyaWFsaXplcicsXG4gICAgJ3RpbWVvdXQnLCAndGltZW91dE1lc3NhZ2UnLCAnd2l0aENyZWRlbnRpYWxzJywgJ2FkYXB0ZXInLCAncmVzcG9uc2VUeXBlJywgJ3hzcmZDb29raWVOYW1lJyxcbiAgICAneHNyZkhlYWRlck5hbWUnLCAnb25VcGxvYWRQcm9ncmVzcycsICdvbkRvd25sb2FkUHJvZ3Jlc3MnLCAnZGVjb21wcmVzcycsXG4gICAgJ21heENvbnRlbnRMZW5ndGgnLCAnbWF4Qm9keUxlbmd0aCcsICdtYXhSZWRpcmVjdHMnLCAndHJhbnNwb3J0JywgJ2h0dHBBZ2VudCcsXG4gICAgJ2h0dHBzQWdlbnQnLCAnY2FuY2VsVG9rZW4nLCAnc29ja2V0UGF0aCcsICdyZXNwb25zZUVuY29kaW5nJ1xuICBdO1xuICB2YXIgZGlyZWN0TWVyZ2VLZXlzID0gWyd2YWxpZGF0ZVN0YXR1cyddO1xuXG4gIGZ1bmN0aW9uIGdldE1lcmdlZFZhbHVlKHRhcmdldCwgc291cmNlKSB7XG4gICAgaWYgKHV0aWxzLmlzUGxhaW5PYmplY3QodGFyZ2V0KSAmJiB1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh0YXJnZXQsIHNvdXJjZSk7XG4gICAgfSBlbHNlIGlmICh1dGlscy5pc1BsYWluT2JqZWN0KHNvdXJjZSkpIHtcbiAgICAgIHJldHVybiB1dGlscy5tZXJnZSh7fSwgc291cmNlKTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoc291cmNlKSkge1xuICAgICAgcmV0dXJuIHNvdXJjZS5zbGljZSgpO1xuICAgIH1cbiAgICByZXR1cm4gc291cmNlO1xuICB9XG5cbiAgZnVuY3Rpb24gbWVyZ2VEZWVwUHJvcGVydGllcyhwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUoY29uZmlnMVtwcm9wXSwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9XG5cbiAgdXRpbHMuZm9yRWFjaCh2YWx1ZUZyb21Db25maWcyS2V5cywgZnVuY3Rpb24gdmFsdWVGcm9tQ29uZmlnMihwcm9wKSB7XG4gICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChjb25maWcyW3Byb3BdKSkge1xuICAgICAgY29uZmlnW3Byb3BdID0gZ2V0TWVyZ2VkVmFsdWUodW5kZWZpbmVkLCBjb25maWcyW3Byb3BdKTtcbiAgICB9XG4gIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gobWVyZ2VEZWVwUHJvcGVydGllc0tleXMsIG1lcmdlRGVlcFByb3BlcnRpZXMpO1xuXG4gIHV0aWxzLmZvckVhY2goZGVmYXVsdFRvQ29uZmlnMktleXMsIGZ1bmN0aW9uIGRlZmF1bHRUb0NvbmZpZzIocHJvcCkge1xuICAgIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMltwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMltwcm9wXSk7XG4gICAgfSBlbHNlIGlmICghdXRpbHMuaXNVbmRlZmluZWQoY29uZmlnMVtwcm9wXSkpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKHVuZGVmaW5lZCwgY29uZmlnMVtwcm9wXSk7XG4gICAgfVxuICB9KTtcblxuICB1dGlscy5mb3JFYWNoKGRpcmVjdE1lcmdlS2V5cywgZnVuY3Rpb24gbWVyZ2UocHJvcCkge1xuICAgIGlmIChwcm9wIGluIGNvbmZpZzIpIHtcbiAgICAgIGNvbmZpZ1twcm9wXSA9IGdldE1lcmdlZFZhbHVlKGNvbmZpZzFbcHJvcF0sIGNvbmZpZzJbcHJvcF0pO1xuICAgIH0gZWxzZSBpZiAocHJvcCBpbiBjb25maWcxKSB7XG4gICAgICBjb25maWdbcHJvcF0gPSBnZXRNZXJnZWRWYWx1ZSh1bmRlZmluZWQsIGNvbmZpZzFbcHJvcF0pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGF4aW9zS2V5cyA9IHZhbHVlRnJvbUNvbmZpZzJLZXlzXG4gICAgLmNvbmNhdChtZXJnZURlZXBQcm9wZXJ0aWVzS2V5cylcbiAgICAuY29uY2F0KGRlZmF1bHRUb0NvbmZpZzJLZXlzKVxuICAgIC5jb25jYXQoZGlyZWN0TWVyZ2VLZXlzKTtcblxuICB2YXIgb3RoZXJLZXlzID0gT2JqZWN0XG4gICAgLmtleXMoY29uZmlnMSlcbiAgICAuY29uY2F0KE9iamVjdC5rZXlzKGNvbmZpZzIpKVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gZmlsdGVyQXhpb3NLZXlzKGtleSkge1xuICAgICAgcmV0dXJuIGF4aW9zS2V5cy5pbmRleE9mKGtleSkgPT09IC0xO1xuICAgIH0pO1xuXG4gIHV0aWxzLmZvckVhY2gob3RoZXJLZXlzLCBtZXJnZURlZXBQcm9wZXJ0aWVzKTtcblxuICByZXR1cm4gY29uZmlnO1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcGtnID0gcmVxdWlyZSgnLi8uLi8uLi9wYWNrYWdlLmpzb24nKTtcblxudmFyIHZhbGlkYXRvcnMgPSB7fTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGZ1bmMtbmFtZXNcblsnb2JqZWN0JywgJ2Jvb2xlYW4nLCAnbnVtYmVyJywgJ2Z1bmN0aW9uJywgJ3N0cmluZycsICdzeW1ib2wnXS5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUsIGkpIHtcbiAgdmFsaWRhdG9yc1t0eXBlXSA9IGZ1bmN0aW9uIHZhbGlkYXRvcih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09IHR5cGUgfHwgJ2EnICsgKGkgPCAxID8gJ24gJyA6ICcgJykgKyB0eXBlO1xuICB9O1xufSk7XG5cbnZhciBkZXByZWNhdGVkV2FybmluZ3MgPSB7fTtcbnZhciBjdXJyZW50VmVyQXJyID0gcGtnLnZlcnNpb24uc3BsaXQoJy4nKTtcblxuLyoqXG4gKiBDb21wYXJlIHBhY2thZ2UgdmVyc2lvbnNcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZXJzaW9uXG4gKiBAcGFyYW0ge3N0cmluZz99IHRoYW5WZXJzaW9uXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNPbGRlclZlcnNpb24odmVyc2lvbiwgdGhhblZlcnNpb24pIHtcbiAgdmFyIHBrZ1ZlcnNpb25BcnIgPSB0aGFuVmVyc2lvbiA/IHRoYW5WZXJzaW9uLnNwbGl0KCcuJykgOiBjdXJyZW50VmVyQXJyO1xuICB2YXIgZGVzdFZlciA9IHZlcnNpb24uc3BsaXQoJy4nKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICBpZiAocGtnVmVyc2lvbkFycltpXSA+IGRlc3RWZXJbaV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAocGtnVmVyc2lvbkFycltpXSA8IGRlc3RWZXJbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFRyYW5zaXRpb25hbCBvcHRpb24gdmFsaWRhdG9yXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW4/fSB2YWxpZGF0b3JcbiAqIEBwYXJhbSB7c3RyaW5nP30gdmVyc2lvblxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAqIEByZXR1cm5zIHtmdW5jdGlvbn1cbiAqL1xudmFsaWRhdG9ycy50cmFuc2l0aW9uYWwgPSBmdW5jdGlvbiB0cmFuc2l0aW9uYWwodmFsaWRhdG9yLCB2ZXJzaW9uLCBtZXNzYWdlKSB7XG4gIHZhciBpc0RlcHJlY2F0ZWQgPSB2ZXJzaW9uICYmIGlzT2xkZXJWZXJzaW9uKHZlcnNpb24pO1xuXG4gIGZ1bmN0aW9uIGZvcm1hdE1lc3NhZ2Uob3B0LCBkZXNjKSB7XG4gICAgcmV0dXJuICdbQXhpb3MgdicgKyBwa2cudmVyc2lvbiArICddIFRyYW5zaXRpb25hbCBvcHRpb24gXFwnJyArIG9wdCArICdcXCcnICsgZGVzYyArIChtZXNzYWdlID8gJy4gJyArIG1lc3NhZ2UgOiAnJyk7XG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZnVuYy1uYW1lc1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG9wdCwgb3B0cykge1xuICAgIGlmICh2YWxpZGF0b3IgPT09IGZhbHNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZm9ybWF0TWVzc2FnZShvcHQsICcgaGFzIGJlZW4gcmVtb3ZlZCBpbiAnICsgdmVyc2lvbikpO1xuICAgIH1cblxuICAgIGlmIChpc0RlcHJlY2F0ZWQgJiYgIWRlcHJlY2F0ZWRXYXJuaW5nc1tvcHRdKSB7XG4gICAgICBkZXByZWNhdGVkV2FybmluZ3Nbb3B0XSA9IHRydWU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRNZXNzYWdlKFxuICAgICAgICAgIG9wdCxcbiAgICAgICAgICAnIGhhcyBiZWVuIGRlcHJlY2F0ZWQgc2luY2UgdicgKyB2ZXJzaW9uICsgJyBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZWFyIGZ1dHVyZSdcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsaWRhdG9yID8gdmFsaWRhdG9yKHZhbHVlLCBvcHQsIG9wdHMpIDogdHJ1ZTtcbiAgfTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IG9iamVjdCdzIHByb3BlcnRpZXMgdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7b2JqZWN0fSBzY2hlbWFcbiAqIEBwYXJhbSB7Ym9vbGVhbj99IGFsbG93VW5rbm93blxuICovXG5cbmZ1bmN0aW9uIGFzc2VydE9wdGlvbnMob3B0aW9ucywgc2NoZW1hLCBhbGxvd1Vua25vd24pIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBhbiBvYmplY3QnKTtcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tID4gMCkge1xuICAgIHZhciBvcHQgPSBrZXlzW2ldO1xuICAgIHZhciB2YWxpZGF0b3IgPSBzY2hlbWFbb3B0XTtcbiAgICBpZiAodmFsaWRhdG9yKSB7XG4gICAgICB2YXIgdmFsdWUgPSBvcHRpb25zW29wdF07XG4gICAgICB2YXIgcmVzdWx0ID0gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWxpZGF0b3IodmFsdWUsIG9wdCwgb3B0aW9ucyk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiAnICsgb3B0ICsgJyBtdXN0IGJlICcgKyByZXN1bHQpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChhbGxvd1Vua25vd24gIT09IHRydWUpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmtub3duIG9wdGlvbiAnICsgb3B0KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzT2xkZXJWZXJzaW9uOiBpc09sZGVyVmVyc2lvbixcbiAgYXNzZXJ0T3B0aW9uczogYXNzZXJ0T3B0aW9ucyxcbiAgdmFsaWRhdG9yczogdmFsaWRhdG9yc1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLy4uL3V0aWxzJyk7XG52YXIgYnVpbGRVUkwgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2J1aWxkVVJMJyk7XG52YXIgSW50ZXJjZXB0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9JbnRlcmNlcHRvck1hbmFnZXInKTtcbnZhciBkaXNwYXRjaFJlcXVlc3QgPSByZXF1aXJlKCcuL2Rpc3BhdGNoUmVxdWVzdCcpO1xudmFyIG1lcmdlQ29uZmlnID0gcmVxdWlyZSgnLi9tZXJnZUNvbmZpZycpO1xudmFyIHZhbGlkYXRvciA9IHJlcXVpcmUoJy4uL2hlbHBlcnMvdmFsaWRhdG9yJyk7XG5cbnZhciB2YWxpZGF0b3JzID0gdmFsaWRhdG9yLnZhbGlkYXRvcnM7XG4vKipcbiAqIENyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnN0YW5jZUNvbmZpZyBUaGUgZGVmYXVsdCBjb25maWcgZm9yIHRoZSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBBeGlvcyhpbnN0YW5jZUNvbmZpZykge1xuICB0aGlzLmRlZmF1bHRzID0gaW5zdGFuY2VDb25maWc7XG4gIHRoaXMuaW50ZXJjZXB0b3JzID0ge1xuICAgIHJlcXVlc3Q6IG5ldyBJbnRlcmNlcHRvck1hbmFnZXIoKSxcbiAgICByZXNwb25zZTogbmV3IEludGVyY2VwdG9yTWFuYWdlcigpXG4gIH07XG59XG5cbi8qKlxuICogRGlzcGF0Y2ggYSByZXF1ZXN0XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyBUaGUgY29uZmlnIHNwZWNpZmljIGZvciB0aGlzIHJlcXVlc3QgKG1lcmdlZCB3aXRoIHRoaXMuZGVmYXVsdHMpXG4gKi9cbkF4aW9zLnByb3RvdHlwZS5yZXF1ZXN0ID0gZnVuY3Rpb24gcmVxdWVzdChjb25maWcpIHtcbiAgLyplc2xpbnQgbm8tcGFyYW0tcmVhc3NpZ246MCovXG4gIC8vIEFsbG93IGZvciBheGlvcygnZXhhbXBsZS91cmwnWywgY29uZmlnXSkgYSBsYSBmZXRjaCBBUElcbiAgaWYgKHR5cGVvZiBjb25maWcgPT09ICdzdHJpbmcnKSB7XG4gICAgY29uZmlnID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuICAgIGNvbmZpZy51cmwgPSBhcmd1bWVudHNbMF07XG4gIH0gZWxzZSB7XG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9O1xuICB9XG5cbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcblxuICAvLyBTZXQgY29uZmlnLm1ldGhvZFxuICBpZiAoY29uZmlnLm1ldGhvZCkge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kLnRvTG93ZXJDYXNlKCk7XG4gIH0gZWxzZSBpZiAodGhpcy5kZWZhdWx0cy5tZXRob2QpIHtcbiAgICBjb25maWcubWV0aG9kID0gdGhpcy5kZWZhdWx0cy5tZXRob2QudG9Mb3dlckNhc2UoKTtcbiAgfSBlbHNlIHtcbiAgICBjb25maWcubWV0aG9kID0gJ2dldCc7XG4gIH1cblxuICB2YXIgdHJhbnNpdGlvbmFsID0gY29uZmlnLnRyYW5zaXRpb25hbDtcblxuICBpZiAodHJhbnNpdGlvbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YWxpZGF0b3IuYXNzZXJ0T3B0aW9ucyh0cmFuc2l0aW9uYWwsIHtcbiAgICAgIHNpbGVudEpTT05QYXJzaW5nOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpLFxuICAgICAgZm9yY2VkSlNPTlBhcnNpbmc6IHZhbGlkYXRvcnMudHJhbnNpdGlvbmFsKHZhbGlkYXRvcnMuYm9vbGVhbiwgJzEuMC4wJyksXG4gICAgICBjbGFyaWZ5VGltZW91dEVycm9yOiB2YWxpZGF0b3JzLnRyYW5zaXRpb25hbCh2YWxpZGF0b3JzLmJvb2xlYW4sICcxLjAuMCcpXG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLy8gZmlsdGVyIG91dCBza2lwcGVkIGludGVyY2VwdG9yc1xuICB2YXIgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4gPSBbXTtcbiAgdmFyIHN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycyA9IHRydWU7XG4gIHRoaXMuaW50ZXJjZXB0b3JzLnJlcXVlc3QuZm9yRWFjaChmdW5jdGlvbiB1bnNoaWZ0UmVxdWVzdEludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIGlmICh0eXBlb2YgaW50ZXJjZXB0b3IucnVuV2hlbiA9PT0gJ2Z1bmN0aW9uJyAmJiBpbnRlcmNlcHRvci5ydW5XaGVuKGNvbmZpZykgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzID0gc3luY2hyb25vdXNSZXF1ZXN0SW50ZXJjZXB0b3JzICYmIGludGVyY2VwdG9yLnN5bmNocm9ub3VzO1xuXG4gICAgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4udW5zaGlmdChpbnRlcmNlcHRvci5mdWxmaWxsZWQsIGludGVyY2VwdG9yLnJlamVjdGVkKTtcbiAgfSk7XG5cbiAgdmFyIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbiA9IFtdO1xuICB0aGlzLmludGVyY2VwdG9ycy5yZXNwb25zZS5mb3JFYWNoKGZ1bmN0aW9uIHB1c2hSZXNwb25zZUludGVyY2VwdG9ycyhpbnRlcmNlcHRvcikge1xuICAgIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5wdXNoKGludGVyY2VwdG9yLmZ1bGZpbGxlZCwgaW50ZXJjZXB0b3IucmVqZWN0ZWQpO1xuICB9KTtcblxuICB2YXIgcHJvbWlzZTtcblxuICBpZiAoIXN5bmNocm9ub3VzUmVxdWVzdEludGVyY2VwdG9ycykge1xuICAgIHZhciBjaGFpbiA9IFtkaXNwYXRjaFJlcXVlc3QsIHVuZGVmaW5lZF07XG5cbiAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjaGFpbiwgcmVxdWVzdEludGVyY2VwdG9yQ2hhaW4pO1xuICAgIGNoYWluID0gY2hhaW4uY29uY2F0KHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbik7XG5cbiAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGNvbmZpZyk7XG4gICAgd2hpbGUgKGNoYWluLmxlbmd0aCkge1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihjaGFpbi5zaGlmdCgpLCBjaGFpbi5zaGlmdCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG5cbiAgdmFyIG5ld0NvbmZpZyA9IGNvbmZpZztcbiAgd2hpbGUgKHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHZhciBvbkZ1bGZpbGxlZCA9IHJlcXVlc3RJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCk7XG4gICAgdmFyIG9uUmVqZWN0ZWQgPSByZXF1ZXN0SW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpO1xuICAgIHRyeSB7XG4gICAgICBuZXdDb25maWcgPSBvbkZ1bGZpbGxlZChuZXdDb25maWcpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBvblJlamVjdGVkKGVycm9yKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHRyeSB7XG4gICAgcHJvbWlzZSA9IGRpc3BhdGNoUmVxdWVzdChuZXdDb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cblxuICB3aGlsZSAocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLmxlbmd0aCkge1xuICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4ocmVzcG9uc2VJbnRlcmNlcHRvckNoYWluLnNoaWZ0KCksIHJlc3BvbnNlSW50ZXJjZXB0b3JDaGFpbi5zaGlmdCgpKTtcbiAgfVxuXG4gIHJldHVybiBwcm9taXNlO1xufTtcblxuQXhpb3MucHJvdG90eXBlLmdldFVyaSA9IGZ1bmN0aW9uIGdldFVyaShjb25maWcpIHtcbiAgY29uZmlnID0gbWVyZ2VDb25maWcodGhpcy5kZWZhdWx0cywgY29uZmlnKTtcbiAgcmV0dXJuIGJ1aWxkVVJMKGNvbmZpZy51cmwsIGNvbmZpZy5wYXJhbXMsIGNvbmZpZy5wYXJhbXNTZXJpYWxpemVyKS5yZXBsYWNlKC9eXFw/LywgJycpO1xufTtcblxuLy8gUHJvdmlkZSBhbGlhc2VzIGZvciBzdXBwb3J0ZWQgcmVxdWVzdCBtZXRob2RzXG51dGlscy5mb3JFYWNoKFsnZGVsZXRlJywgJ2dldCcsICdoZWFkJywgJ29wdGlvbnMnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZE5vRGF0YShtZXRob2QpIHtcbiAgLyplc2xpbnQgZnVuYy1uYW1lczowKi9cbiAgQXhpb3MucHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbih1cmwsIGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLnJlcXVlc3QobWVyZ2VDb25maWcoY29uZmlnIHx8IHt9LCB7XG4gICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZGF0YTogKGNvbmZpZyB8fCB7fSkuZGF0YVxuICAgIH0pKTtcbiAgfTtcbn0pO1xuXG51dGlscy5mb3JFYWNoKFsncG9zdCcsICdwdXQnLCAncGF0Y2gnXSwgZnVuY3Rpb24gZm9yRWFjaE1ldGhvZFdpdGhEYXRhKG1ldGhvZCkge1xuICAvKmVzbGludCBmdW5jLW5hbWVzOjAqL1xuICBBeGlvcy5wcm90b3R5cGVbbWV0aG9kXSA9IGZ1bmN0aW9uKHVybCwgZGF0YSwgY29uZmlnKSB7XG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdChtZXJnZUNvbmZpZyhjb25maWcgfHwge30sIHtcbiAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBkYXRhOiBkYXRhXG4gICAgfSkpO1xuICB9O1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXhpb3M7XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBBIGBDYW5jZWxgIGlzIGFuIG9iamVjdCB0aGF0IGlzIHRocm93biB3aGVuIGFuIG9wZXJhdGlvbiBpcyBjYW5jZWxlZC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSBUaGUgbWVzc2FnZS5cbiAqL1xuZnVuY3Rpb24gQ2FuY2VsKG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbn1cblxuQ2FuY2VsLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICByZXR1cm4gJ0NhbmNlbCcgKyAodGhpcy5tZXNzYWdlID8gJzogJyArIHRoaXMubWVzc2FnZSA6ICcnKTtcbn07XG5cbkNhbmNlbC5wcm90b3R5cGUuX19DQU5DRUxfXyA9IHRydWU7XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FuY2VsO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbnZhciBDYW5jZWwgPSByZXF1aXJlKCcuL0NhbmNlbCcpO1xuXG4vKipcbiAqIEEgYENhbmNlbFRva2VuYCBpcyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byByZXF1ZXN0IGNhbmNlbGxhdGlvbiBvZiBhbiBvcGVyYXRpb24uXG4gKlxuICogQGNsYXNzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBleGVjdXRvciBUaGUgZXhlY3V0b3IgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIENhbmNlbFRva2VuKGV4ZWN1dG9yKSB7XG4gIGlmICh0eXBlb2YgZXhlY3V0b3IgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdleGVjdXRvciBtdXN0IGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgcmVzb2x2ZVByb21pc2U7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIHByb21pc2VFeGVjdXRvcihyZXNvbHZlKSB7XG4gICAgcmVzb2x2ZVByb21pc2UgPSByZXNvbHZlO1xuICB9KTtcblxuICB2YXIgdG9rZW4gPSB0aGlzO1xuICBleGVjdXRvcihmdW5jdGlvbiBjYW5jZWwobWVzc2FnZSkge1xuICAgIGlmICh0b2tlbi5yZWFzb24pIHtcbiAgICAgIC8vIENhbmNlbGxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIHJlcXVlc3RlZFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRva2VuLnJlYXNvbiA9IG5ldyBDYW5jZWwobWVzc2FnZSk7XG4gICAgcmVzb2x2ZVByb21pc2UodG9rZW4ucmVhc29uKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVGhyb3dzIGEgYENhbmNlbGAgaWYgY2FuY2VsbGF0aW9uIGhhcyBiZWVuIHJlcXVlc3RlZC5cbiAqL1xuQ2FuY2VsVG9rZW4ucHJvdG90eXBlLnRocm93SWZSZXF1ZXN0ZWQgPSBmdW5jdGlvbiB0aHJvd0lmUmVxdWVzdGVkKCkge1xuICBpZiAodGhpcy5yZWFzb24pIHtcbiAgICB0aHJvdyB0aGlzLnJlYXNvbjtcbiAgfVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIGEgbmV3IGBDYW5jZWxUb2tlbmAgYW5kIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsXG4gKiBjYW5jZWxzIHRoZSBgQ2FuY2VsVG9rZW5gLlxuICovXG5DYW5jZWxUb2tlbi5zb3VyY2UgPSBmdW5jdGlvbiBzb3VyY2UoKSB7XG4gIHZhciBjYW5jZWw7XG4gIHZhciB0b2tlbiA9IG5ldyBDYW5jZWxUb2tlbihmdW5jdGlvbiBleGVjdXRvcihjKSB7XG4gICAgY2FuY2VsID0gYztcbiAgfSk7XG4gIHJldHVybiB7XG4gICAgdG9rZW46IHRva2VuLFxuICAgIGNhbmNlbDogY2FuY2VsXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbmNlbFRva2VuO1xuIiwKICAgICIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU3ludGFjdGljIHN1Z2FyIGZvciBpbnZva2luZyBhIGZ1bmN0aW9uIGFuZCBleHBhbmRpbmcgYW4gYXJyYXkgZm9yIGFyZ3VtZW50cy5cbiAqXG4gKiBDb21tb24gdXNlIGNhc2Ugd291bGQgYmUgdG8gdXNlIGBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHlgLlxuICpcbiAqICBgYGBqc1xuICogIGZ1bmN0aW9uIGYoeCwgeSwgeikge31cbiAqICB2YXIgYXJncyA9IFsxLCAyLCAzXTtcbiAqICBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICogIGBgYFxuICpcbiAqIFdpdGggYHNwcmVhZGAgdGhpcyBleGFtcGxlIGNhbiBiZSByZS13cml0dGVuLlxuICpcbiAqICBgYGBqc1xuICogIHNwcmVhZChmdW5jdGlvbih4LCB5LCB6KSB7fSkoWzEsIDIsIDNdKTtcbiAqICBgYGBcbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybnMge0Z1bmN0aW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNwcmVhZChjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gd3JhcChhcnIpIHtcbiAgICByZXR1cm4gY2FsbGJhY2suYXBwbHkobnVsbCwgYXJyKTtcbiAgfTtcbn07XG4iLAogICAgIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHBheWxvYWQgaXMgYW4gZXJyb3IgdGhyb3duIGJ5IEF4aW9zXG4gKlxuICogQHBhcmFtIHsqfSBwYXlsb2FkIFRoZSB2YWx1ZSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgcGF5bG9hZCBpcyBhbiBlcnJvciB0aHJvd24gYnkgQXhpb3MsIG90aGVyd2lzZSBmYWxzZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQXhpb3NFcnJvcihwYXlsb2FkKSB7XG4gIHJldHVybiAodHlwZW9mIHBheWxvYWQgPT09ICdvYmplY3QnKSAmJiAocGF5bG9hZC5pc0F4aW9zRXJyb3IgPT09IHRydWUpO1xufTtcbiIsCiAgICAiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJy4vaGVscGVycy9iaW5kJyk7XG52YXIgQXhpb3MgPSByZXF1aXJlKCcuL2NvcmUvQXhpb3MnKTtcbnZhciBtZXJnZUNvbmZpZyA9IHJlcXVpcmUoJy4vY29yZS9tZXJnZUNvbmZpZycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuXG4vKipcbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiBBeGlvc1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0Q29uZmlnIFRoZSBkZWZhdWx0IGNvbmZpZyBmb3IgdGhlIGluc3RhbmNlXG4gKiBAcmV0dXJuIHtBeGlvc30gQSBuZXcgaW5zdGFuY2Ugb2YgQXhpb3NcbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoZGVmYXVsdENvbmZpZykge1xuICB2YXIgY29udGV4dCA9IG5ldyBBeGlvcyhkZWZhdWx0Q29uZmlnKTtcbiAgdmFyIGluc3RhbmNlID0gYmluZChBeGlvcy5wcm90b3R5cGUucmVxdWVzdCwgY29udGV4dCk7XG5cbiAgLy8gQ29weSBheGlvcy5wcm90b3R5cGUgdG8gaW5zdGFuY2VcbiAgdXRpbHMuZXh0ZW5kKGluc3RhbmNlLCBBeGlvcy5wcm90b3R5cGUsIGNvbnRleHQpO1xuXG4gIC8vIENvcHkgY29udGV4dCB0byBpbnN0YW5jZVxuICB1dGlscy5leHRlbmQoaW5zdGFuY2UsIGNvbnRleHQpO1xuXG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuLy8gQ3JlYXRlIHRoZSBkZWZhdWx0IGluc3RhbmNlIHRvIGJlIGV4cG9ydGVkXG52YXIgYXhpb3MgPSBjcmVhdGVJbnN0YW5jZShkZWZhdWx0cyk7XG5cbi8vIEV4cG9zZSBBeGlvcyBjbGFzcyB0byBhbGxvdyBjbGFzcyBpbmhlcml0YW5jZVxuYXhpb3MuQXhpb3MgPSBBeGlvcztcblxuLy8gRmFjdG9yeSBmb3IgY3JlYXRpbmcgbmV3IGluc3RhbmNlc1xuYXhpb3MuY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGluc3RhbmNlQ29uZmlnKSB7XG4gIHJldHVybiBjcmVhdGVJbnN0YW5jZShtZXJnZUNvbmZpZyhheGlvcy5kZWZhdWx0cywgaW5zdGFuY2VDb25maWcpKTtcbn07XG5cbi8vIEV4cG9zZSBDYW5jZWwgJiBDYW5jZWxUb2tlblxuYXhpb3MuQ2FuY2VsID0gcmVxdWlyZSgnLi9jYW5jZWwvQ2FuY2VsJyk7XG5heGlvcy5DYW5jZWxUb2tlbiA9IHJlcXVpcmUoJy4vY2FuY2VsL0NhbmNlbFRva2VuJyk7XG5heGlvcy5pc0NhbmNlbCA9IHJlcXVpcmUoJy4vY2FuY2VsL2lzQ2FuY2VsJyk7XG5cbi8vIEV4cG9zZSBhbGwvc3ByZWFkXG5heGlvcy5hbGwgPSBmdW5jdGlvbiBhbGwocHJvbWlzZXMpIHtcbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbn07XG5heGlvcy5zcHJlYWQgPSByZXF1aXJlKCcuL2hlbHBlcnMvc3ByZWFkJyk7XG5cbi8vIEV4cG9zZSBpc0F4aW9zRXJyb3JcbmF4aW9zLmlzQXhpb3NFcnJvciA9IHJlcXVpcmUoJy4vaGVscGVycy9pc0F4aW9zRXJyb3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBheGlvcztcblxuLy8gQWxsb3cgdXNlIG9mIGRlZmF1bHQgaW1wb3J0IHN5bnRheCBpbiBUeXBlU2NyaXB0XG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gYXhpb3M7XG4iLAogICAgIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0QWxsQXVkaW9CYXNlNjQgPSBleHBvcnRzLmdldEF1ZGlvQmFzZTY0ID0gdm9pZCAwO1xudmFyIGFzc2VydElucHV0VHlwZXNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9hc3NlcnRJbnB1dFR5cGVzXCIpKTtcbnZhciBheGlvc18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJheGlvc1wiKSk7XG52YXIgc3BsaXRMb25nVGV4dF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3NwbGl0TG9uZ1RleHRcIikpO1xuLyoqXG4gKiBHZXQgXCJHb29nbGUgVFRTXCIgYXVkaW8gYmFzZTY0IHRleHRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gICB0ZXh0ICAgICAgICAgICBsZW5ndGggc2hvdWxkIGJlIGxlc3MgdGhhbiAyMDAgY2hhcmFjdGVyc1xuICogQHBhcmFtIHtvYmplY3Q/fSAgb3B0aW9uXG4gKiBAcGFyYW0ge3N0cmluZz99ICBvcHRpb24ubGFuZyAgICBkZWZhdWx0IGlzIFwiZW5cIlxuICogQHBhcmFtIHtib29sZWFuP30gb3B0aW9uLnNsb3cgICAgZGVmYXVsdCBpcyBmYWxzZVxuICogQHBhcmFtIHtzdHJpbmc/fSAgb3B0aW9uLmhvc3QgICAgZGVmYXVsdCBpcyBcImh0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZS5jb21cIlxuICogQHBhcmFtIHtudW1iZXI/fSAgb3B0aW9uLnRpbWVvdXQgZGVmYXVsdCBpcyAxMDAwMCAobXMpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSB1cmxcbiAqL1xudmFyIGdldEF1ZGlvQmFzZTY0ID0gZnVuY3Rpb24gKHRleHQsIF9hKSB7XG4gICAgdmFyIF9iID0gX2EgPT09IHZvaWQgMCA/IHt9IDogX2EsIF9jID0gX2IubGFuZywgbGFuZyA9IF9jID09PSB2b2lkIDAgPyAnZW4nIDogX2MsIF9kID0gX2Iuc2xvdywgc2xvdyA9IF9kID09PSB2b2lkIDAgPyBmYWxzZSA6IF9kLCBfZSA9IF9iLmhvc3QsIGhvc3QgPSBfZSA9PT0gdm9pZCAwID8gJ2h0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZS5jb20nIDogX2UsIF9mID0gX2IudGltZW91dCwgdGltZW91dCA9IF9mID09PSB2b2lkIDAgPyAxMDAwMCA6IF9mO1xuICAgIHJldHVybiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmVzLCByZXN1bHQ7XG4gICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2cpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoX2cubGFiZWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydElucHV0VHlwZXNfMS5kZWZhdWx0KHRleHQsIGxhbmcsIHNsb3csIGhvc3QpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRpbWVvdXQgIT09ICdudW1iZXInIHx8IHRpbWVvdXQgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGltZW91dCBzaG91bGQgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGV4dC5sZW5ndGggPiAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwidGV4dCBsZW5ndGggKFwiICsgdGV4dC5sZW5ndGggKyBcIikgc2hvdWxkIGJlIGxlc3MgdGhhbiAyMDAgY2hhcmFjdGVycy4gVHJ5IFxcXCJnZXRBbGxBdWRpb0Jhc2U2NCh0ZXh0LCBbb3B0aW9uXSlcXFwiIGZvciBsb25nIHRleHQuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIGF4aW9zXzEuZGVmYXVsdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZVVSTDogaG9zdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICcvXy9UcmFuc2xhdGVXZWJzZXJ2ZXJVaS9kYXRhL2JhdGNoZXhlY3V0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiAnZi5yZXE9JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbWydqUTFvbGMnLCBKU09OLnN0cmluZ2lmeShbdGV4dCwgbGFuZywgc2xvdyA/IHRydWUgOiBudWxsLCAnbnVsbCddKSwgbnVsbCwgJ2dlbmVyaWMnXV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIHJlcyA9IF9nLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGV2YWwocmVzLmRhdGEuc2xpY2UoNSkpWzBdWzJdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwYXJzZSByZXNwb25zZSBmYWlsZWQ6XFxuXCIgKyByZXMuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIHJlc3VsdC4gVGhlIHJlc3VsdCB3aWxsIGJlIG51bGwgaWYgZ2l2ZW4gdGhlIGxhbmcgZG9lc24ndCBleGlzdFxuICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibGFuZyBcXFwiXCIgKyBsYW5nICsgXCJcXFwiIG1pZ2h0IG5vdCBleGlzdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyAyLiBjb250aW51ZSB0byBwYXJzZSBhdWRpbyBiYXNlNjQgc3RyaW5nXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBldmFsKHJlc3VsdClbMF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInBhcnNlIHJlc3BvbnNlIGZhaWxlZDpcXG5cIiArIHJlcy5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgcmVzdWx0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuZXhwb3J0cy5nZXRBdWRpb0Jhc2U2NCA9IGdldEF1ZGlvQmFzZTY0O1xuLyoqXG4gKiBAdHlwZWRlZiB7b2JqZWN0fSBSZXN1bHRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzaG9ydFRleHRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBiYXNlNjRcbiAqL1xuLyoqXG4gKiBTcGxpdCB0aGUgbG9uZyB0ZXh0IGludG8gbXVsdGlwbGUgc2hvcnQgdGV4dCBhbmQgZ2VuZXJhdGUgYXVkaW8gYmFzZTY0IGxpc3RcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gICB0ZXh0XG4gKiBAcGFyYW0ge29iamVjdD99ICBvcHRpb25cbiAqIEBwYXJhbSB7c3RyaW5nP30gIG9wdGlvbi5sYW5nICAgICAgICBkZWZhdWx0IGlzIFwiZW5cIlxuICogQHBhcmFtIHtib29sZWFuP30gb3B0aW9uLnNsb3cgICAgICAgIGRlZmF1bHQgaXMgZmFsc2VcbiAqIEBwYXJhbSB7c3RyaW5nP30gIG9wdGlvbi5ob3N0ICAgICAgICBkZWZhdWx0IGlzIFwiaHR0cHM6Ly90cmFuc2xhdGUuZ29vZ2xlLmNvbVwiXG4gKiBAcGFyYW0ge3N0cmluZz99ICBvcHRpb24uc3BsaXRQdW5jdCAgc3BsaXQgcHVuY3R1YXRpb25cbiAqIEBwYXJhbSB7bnVtYmVyP30gIG9wdGlvbi50aW1lb3V0ICAgICBkZWZhdWx0IGlzIDEwMDAwIChtcylcbiAqIEByZXR1cm4ge1Jlc3VsdFtdfSB0aGUgbGlzdCB3aXRoIHNob3J0IHRleHQgYW5kIGF1ZGlvIGJhc2U2NFxuICovXG52YXIgZ2V0QWxsQXVkaW9CYXNlNjQgPSBmdW5jdGlvbiAodGV4dCwgX2EpIHtcbiAgICB2YXIgX2IgPSBfYSA9PT0gdm9pZCAwID8ge30gOiBfYSwgX2MgPSBfYi5sYW5nLCBsYW5nID0gX2MgPT09IHZvaWQgMCA/ICdlbicgOiBfYywgX2QgPSBfYi5zbG93LCBzbG93ID0gX2QgPT09IHZvaWQgMCA/IGZhbHNlIDogX2QsIF9lID0gX2IuaG9zdCwgaG9zdCA9IF9lID09PSB2b2lkIDAgPyAnaHR0cHM6Ly90cmFuc2xhdGUuZ29vZ2xlLmNvbScgOiBfZSwgX2YgPSBfYi5zcGxpdFB1bmN0LCBzcGxpdFB1bmN0ID0gX2YgPT09IHZvaWQgMCA/ICcnIDogX2YsIF9nID0gX2IudGltZW91dCwgdGltZW91dCA9IF9nID09PSB2b2lkIDAgPyAxMDAwMCA6IF9nO1xuICAgIHJldHVybiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2hvcnRUZXh0TGlzdCwgYmFzZTY0TGlzdCwgcmVzdWx0LCBpLCBzaG9ydFRleHQsIGJhc2U2NDtcbiAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfaCkge1xuICAgICAgICAgICAgc3dpdGNoIChfaC5sYWJlbCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0SW5wdXRUeXBlc18xLmRlZmF1bHQodGV4dCwgbGFuZywgc2xvdywgaG9zdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3BsaXRQdW5jdCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NwbGl0UHVuY3Qgc2hvdWxkIGJlIGEgc3RyaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aW1lb3V0ICE9PSAnbnVtYmVyJyB8fCB0aW1lb3V0IDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RpbWVvdXQgc2hvdWxkIGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2hvcnRUZXh0TGlzdCA9IHNwbGl0TG9uZ1RleHRfMS5kZWZhdWx0KHRleHQsIHsgc3BsaXRQdW5jdDogc3BsaXRQdW5jdCB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgUHJvbWlzZS5hbGwoc2hvcnRUZXh0TGlzdC5tYXAoZnVuY3Rpb24gKHNob3J0VGV4dCkgeyByZXR1cm4gZXhwb3J0cy5nZXRBdWRpb0Jhc2U2NChzaG9ydFRleHQsIHsgbGFuZzogbGFuZywgc2xvdzogc2xvdywgaG9zdDogaG9zdCwgdGltZW91dDogdGltZW91dCB9KTsgfSkpXTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIGJhc2U2NExpc3QgPSBfaC5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc2hvcnRUZXh0TGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvcnRUZXh0ID0gc2hvcnRUZXh0TGlzdFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NExpc3RbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7IHNob3J0VGV4dDogc2hvcnRUZXh0LCBiYXNlNjQ6IGJhc2U2NCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qLywgcmVzdWx0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuZXhwb3J0cy5nZXRBbGxBdWRpb0Jhc2U2NCA9IGdldEFsbEF1ZGlvQmFzZTY0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Z2V0QXVkaW9CYXNlNjQuanMubWFwIiwKICAgICJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZ2V0QWxsQXVkaW9CYXNlNjQgPSBleHBvcnRzLmdldEF1ZGlvQmFzZTY0ID0gZXhwb3J0cy5nZXRBbGxBdWRpb1VybHMgPSBleHBvcnRzLmdldEF1ZGlvVXJsID0gdm9pZCAwO1xudmFyIGdldEF1ZGlvVXJsXzEgPSByZXF1aXJlKFwiLi9nZXRBdWRpb1VybFwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdldEF1ZGlvVXJsXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBnZXRBdWRpb1VybF8xLmdldEF1ZGlvVXJsOyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiZ2V0QWxsQXVkaW9VcmxzXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBnZXRBdWRpb1VybF8xLmdldEFsbEF1ZGlvVXJsczsgfSB9KTtcbnZhciBnZXRBdWRpb0Jhc2U2NF8xID0gcmVxdWlyZShcIi4vZ2V0QXVkaW9CYXNlNjRcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJnZXRBdWRpb0Jhc2U2NFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZ2V0QXVkaW9CYXNlNjRfMS5nZXRBdWRpb0Jhc2U2NDsgfSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImdldEFsbEF1ZGlvQmFzZTY0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBnZXRBdWRpb0Jhc2U2NF8xLmdldEFsbEF1ZGlvQmFzZTY0OyB9IH0pO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwKICAgICIvLyBCYWNrZ3JvdW5kIHNjcmlwdCBmb3IgaGFuZGxpbmcgZXh0ZW5zaW9uIGxpZmVjeWNsZSBhbmQgQVBJIG1hbmFnZW1lbnRcclxuaW1wb3J0ICogYXMgZ29vZ2xlVFRTIGZyb20gXCJnb29nbGUtdHRzLWFwaVwiO1xyXG5cclxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoYXN5bmMgKCkgPT4ge1xyXG4gIC8vIFByZXNlcnZlIGV4aXN0aW5nIHNldHRpbmdzIGFjcm9zcyByZWxvYWRzL3VwZGF0ZXM7IG9ubHkgZmlsbCBpbiBtaXNzaW5nIGZpZWxkc1xyXG4gIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoKTtcclxuICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7XHJcbiAgICBjb21tZW50YXJ5TGVuZ3RoOiBleGlzdGluZy5jb21tZW50YXJ5TGVuZ3RoID8/IFwic2hvcnRcIixcclxuICAgIHJqU3R5bGU6IGV4aXN0aW5nLnJqU3R5bGUgPz8gXCJzYXJjYXN0aWNcIixcclxuICAgIHZvaWNlR2VuZGVyOiBleGlzdGluZy52b2ljZUdlbmRlciA/PyBcIm1hbGVcIixcclxuICAgIHZvbHVtZUR1Y2tpbmc6IGV4aXN0aW5nLnZvbHVtZUR1Y2tpbmcgPz8gNTAsXHJcbiAgICBsb2dnaW5nRW5hYmxlZDogZXhpc3RpbmcubG9nZ2luZ0VuYWJsZWQgPz8gdHJ1ZSxcclxuICAgIGxvZ0xldmVsOiBleGlzdGluZy5sb2dMZXZlbCA/PyBcIndhcm5cIixcclxuICAgIGRhcmtNb2RlOiBleGlzdGluZy5kYXJrTW9kZSA/PyBmYWxzZSxcclxuICAgIGF1dG9TdGFydDogZXhpc3RpbmcuYXV0b1N0YXJ0ID8/IGZhbHNlLFxyXG4gICAgdHRzUHJvdmlkZXI6IGV4aXN0aW5nLnR0c1Byb3ZpZGVyID8/IFwiZmlzaC1hdWRpb1wiLFxyXG4gICAgZmlzaEFwaUtleTogZXhpc3RpbmcuZmlzaEFwaUtleSA/PyBcIlwiLFxyXG4gICAgZ2VtaW5pQXBpS2V5OiBleGlzdGluZy5nZW1pbmlBcGlLZXkgPz8gXCJcIixcclxuICAgIG11cmZBcGlLZXk6IGV4aXN0aW5nLm11cmZBcGlLZXkgPz8gXCJcIixcclxuICAgIHZvaWNlSWQ6IGV4aXN0aW5nLnZvaWNlSWQgPz8gXCJiYTFhMzg5NDZkZWE0NDYwOWZjNGE4ZmU2MTEzZWQ4OFwiLFxyXG4gICAgaG9zdE5hbWU6IGV4aXN0aW5nLmhvc3ROYW1lID8/IFwiQWxleGlzXCIsXHJcbiAgICByYWRpb1N0YXRpb246IGV4aXN0aW5nLnJhZGlvU3RhdGlvbiA/PyBcIjk3LjcgWW91dHViZSBGTVwiLFxyXG4gICAgbGxtUHJvdmlkZXI6IGV4aXN0aW5nLmxsbVByb3ZpZGVyID8/IFwib3BlbnJvdXRlclwiLFxyXG4gICAgb3BlblJvdXRlckFwaUtleTogZXhpc3Rpbmcub3BlblJvdXRlckFwaUtleSA/PyBcIlwiLFxyXG4gICAgb3BlblJvdXRlck1vZGVsOiBleGlzdGluZy5vcGVuUm91dGVyTW9kZWwgPz8gXCJyZWN1cnNpdmUvZmxpbnQtdjEuMDpmcmVlXCIsXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuLy8gSGFuZGxlIG1lc3NhZ2VzIGZyb20gY29udGVudCBzY3JpcHRcclxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xyXG4gIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJsb2dDb21tZW50YXJ5XCIpIHtcclxuICAgIC8vIFN0b3JlIGNvbW1lbnRhcnkgbG9nc1xyXG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcImNvbW1lbnRhcnlMb2dzXCJdLCAocmVzdWx0KSA9PiB7XHJcbiAgICAgIGNvbnN0IGxvZ3MgPSByZXN1bHQuY29tbWVudGFyeUxvZ3MgfHwgW107XHJcbiAgICAgIGxvZ3MucHVzaCh7XHJcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICAgICAgY3VycmVudFNvbmc6IHJlcXVlc3QuY3VycmVudFNvbmcsXHJcbiAgICAgICAgbmV4dFNvbmc6IHJlcXVlc3QubmV4dFNvbmcsXHJcbiAgICAgICAgc2NyaXB0OiByZXF1ZXN0LnNjcmlwdCxcclxuICAgICAgICB1cmw6IHNlbmRlcj8udGFiPy51cmwsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gS2VlcCBvbmx5IGxhc3QgMTAwIGxvZ3NcclxuICAgICAgaWYgKGxvZ3MubGVuZ3RoID4gMTAwKSB7XHJcbiAgICAgICAgbG9ncy5zcGxpY2UoMCwgbG9ncy5sZW5ndGggLSAxMDApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBjb21tZW50YXJ5TG9nczogbG9ncyB9KTtcclxuICAgIH0pO1xyXG4gIH0gZWxzZSBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwiY2FsbENoYXRKaW1teVwiKSB7XHJcbiAgICBmZXRjaChcImh0dHBzOi8vY2hhdGppbW15LmFpL2FwaS9jaGF0XCIsIHtcclxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICB9LFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXF1ZXN0LnBheWxvYWQpLFxyXG4gICAgfSlcclxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGF0SmltbXkgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oKHRleHQpID0+IHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IHRleHQgfSkpXHJcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICByZXR1cm4gdHJ1ZTsgLy8gS2VlcCBtZXNzYWdlIGNoYW5uZWwgb3BlbiBmb3IgYXN5bmMgcmVzcG9uc2VcclxuICB9IGVsc2UgaWYgKHJlcXVlc3QuYWN0aW9uID09PSBcImdldFRUU0F1ZGlvXCIpIHtcclxuICAgIGNvbnN0IHsgdGV4dCwgbGFuZyB9ID0gcmVxdWVzdC5wYXlsb2FkO1xyXG4gICAgXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXN1bHRzID0gZ29vZ2xlVFRTLmdldEFsbEF1ZGlvVXJscyh0ZXh0LCB7XHJcbiAgICAgICAgbGFuZzogbGFuZyxcclxuICAgICAgICBzbG93OiBmYWxzZSxcclxuICAgICAgICBob3N0OiBcImh0dHBzOi8vdHJhbnNsYXRlLmdvb2dsZS5jb21cIixcclxuICAgICAgICBzcGxpdFB1bmN0OiBcIi4gXCIsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgUHJvbWlzZS5hbGwoXHJcbiAgICAgICAgcmVzdWx0cy5tYXAoYXN5bmMgKGl0ZW0pID0+IHtcclxuICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goaXRlbS51cmwpO1xyXG4gICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBhdWRpbzogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCByZXNwb25zZS5hcnJheUJ1ZmZlcigpO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICAvLyBDb252ZXJ0IEFycmF5QnVmZmVyIHRvIEJhc2U2NFxyXG4gICAgICAgICAgY29uc3QgdWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcclxuICAgICAgICAgIGxldCBiaW5hcnkgPSBcIlwiO1xyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1aW50OEFycmF5LmJ5dGVMZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1aW50OEFycmF5W2ldKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBidG9hKGJpbmFyeSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgKVxyXG4gICAgICAgIC50aGVuKChiYXNlNjRDaHVua3MpID0+IHtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGJhc2U2NENodW5rcyB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcclxuICAgICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXR1cm4gdHJ1ZTsgLy8gS2VlcCBtZXNzYWdlIGNoYW5uZWwgb3BlbiBmb3IgYXN5bmMgcmVzcG9uc2VcclxuICB9IGVsc2UgaWYgKHJlcXVlc3QuYWN0aW9uID09PSBcImNhbGxMeXJpY3NcIikge1xyXG4gICAgZmV0Y2goYGh0dHBzOi8vbHJjbGliLm5ldC9hcGkvc2VhcmNoP3E9JHtlbmNvZGVVUklDb21wb25lbnQocmVxdWVzdC5xdWVyeSl9YCwge1xyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIG1ldGhvZDogXCJHRVRcIixcclxuICAgIH0pXHJcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTHlyaWNzIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKChkYXRhKSA9PiBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiB0cnVlLCBkYXRhIH0pKVxyXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgcmV0dXJuIHRydWU7IC8vIEtlZXAgbWVzc2FnZSBjaGFubmVsIG9wZW4gZm9yIGFzeW5jIHJlc3BvbnNlXHJcbiAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJjYWxsR2VtaW5pXCIpIHtcclxuICAgIGZldGNoKFxyXG4gICAgICBcImh0dHBzOi8vZ2VuZXJhdGl2ZWxhbmd1YWdlLmdvb2dsZWFwaXMuY29tL3YxYmV0YS9tb2RlbHMvZ2VtaW5pLTIuMC1mbGFzaDpnZW5lcmF0ZUNvbnRlbnRcIixcclxuICAgICAge1xyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBcIlgtZ29vZy1hcGkta2V5XCI6IHJlcXVlc3QuYXBpS2V5LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocmVxdWVzdC5wYXlsb2FkKSxcclxuICAgICAgfVxyXG4gICAgKVxyXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEdlbWluaSBBUEkgZXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbigoZGF0YSkgPT4gc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YSB9KSlcclxuICAgICAgLmNhdGNoKChlcnJvcikgPT4gc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gZWxzZSBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwiY2FsbE11cmZcIikge1xyXG4gICAgZmV0Y2goXCJodHRwczovL2FwaS5tdXJmLmFpL3YxL3NwZWVjaC9nZW5lcmF0ZVwiLCB7XHJcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICBcImFwaS1rZXlcIjogcmVxdWVzdC5hcGlLZXksXHJcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlcXVlc3QucGF5bG9hZCksXHJcbiAgICB9KVxyXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpLnRoZW4oKGVycikgPT4ge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyLm1lc3NhZ2UgfHwgYE11cmYgQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihhc3luYyAoZGF0YSkgPT4ge1xyXG4gICAgICAgIGlmICghZGF0YS5hdWRpb0ZpbGUpIHRocm93IG5ldyBFcnJvcihcIk5vIGF1ZGlvIGZpbGUgcmV0dXJuZWRcIik7XHJcbiAgICAgICAgY29uc3QgYXVkaW9SZXNwb25zZSA9IGF3YWl0IGZldGNoKGRhdGEuYXVkaW9GaWxlKTtcclxuICAgICAgICBpZiAoIWF1ZGlvUmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmZXRjaCBhdWRpbyBmaWxlXCIpO1xyXG4gICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCBhdWRpb1Jlc3BvbnNlLmJsb2IoKTtcclxuICAgICAgICAvLyBDb252ZXJ0IGJsb2IgdG8gYmFzZTY0IHRvIHNlbmQgYmFja1xyXG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9ICgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IChyZWFkZXIucmVzdWx0IGFzIHN0cmluZykuc3BsaXQoXCIsXCIpWzFdO1xyXG4gICAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgZGF0YSwgYXVkaW9CYXNlNjQ6IGJhc2U2NCB9KTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGJsb2IpO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goKGVycm9yKSA9PiBzZW5kUmVzcG9uc2UoeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgfSkpO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gXCJjYWxsRmlzaEF1ZGlvXCIpIHtcclxuICAgIGNvbnN0IHsgdGV4dCwgcmVmZXJlbmNlSWQsIGFwaUtleSB9ID0gcmVxdWVzdDtcclxuICAgIGZldGNoKFwiaHR0cHM6Ly9hcGkuZmlzaC5hdWRpby92MS90dHNcIiwge1xyXG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FwaUtleX1gLFxyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIG1vZGVsOiBcInMyLjEtcHJvLWZyZWVcIixcclxuICAgICAgfSxcclxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xyXG4gICAgICAgIHRleHQ6IHRleHQsXHJcbiAgICAgICAgcmVmZXJlbmNlX2lkOiByZWZlcmVuY2VJZCB8fCBcImJhMWEzODk0NmRlYTQ0NjA5ZmM0YThmZTYxMTNlZDg4XCIsXHJcbiAgICAgICAgZm9ybWF0OiBcIm1wM1wiLFxyXG4gICAgICB9KSxcclxuICAgIH0pXHJcbiAgICAgIC50aGVuKGFzeW5jIChyZXNwb25zZSkgPT4ge1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICAgIGNvbnN0IGVycm9yVGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKS5jYXRjaCgoKSA9PiBcIlwiKTtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgYEZpc2ggQXVkaW8gQVBJIGVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fSAtICR7ZXJyb3JUZXh0fWBcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKTtcclxuICAgICAgICBjb25zdCB1aW50OEFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpO1xyXG4gICAgICAgIGxldCBiaW5hcnkgPSBcIlwiO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdWludDhBcnJheS5ieXRlTGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVpbnQ4QXJyYXlbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBiYXNlNjQgPSBidG9hKGJpbmFyeSk7XHJcbiAgICAgICAgc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogdHJ1ZSwgYXVkaW9CYXNlNjQ6IGJhc2U2NCB9KTtcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKChlcnJvcikgPT4gc2VuZFJlc3BvbnNlKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlIH0pKTtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH0gZWxzZSBpZiAocmVxdWVzdC5hY3Rpb24gPT09IFwiY2FsbE9wZW5Sb3V0ZXJcIikge1xyXG4gICAgY29uc3QgeyBhcGlLZXksIG1vZGVsLCBtZXNzYWdlcyB9ID0gcmVxdWVzdDtcclxuICAgIGZldGNoKFwiaHR0cHM6Ly9vcGVucm91dGVyLmFpL2FwaS92MS9jaGF0L2NvbXBsZXRpb25zXCIsIHtcclxuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHthcGlLZXl9YCxcclxuICAgICAgICBcIkhUVFAtUmVmZXJlclwiOiBcImh0dHBzOi8veW91dHViZS1yai1tb2RlLmV4dGVuc2lvblwiLFxyXG4gICAgICAgIFwiWC1UaXRsZVwiOiBcIllvdVR1YmUgUkogTW9kZVwiLFxyXG4gICAgICB9LFxyXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XHJcbiAgICAgICAgbW9kZWw6IG1vZGVsIHx8IFwicmVjdXJzaXZlL2ZsaW50LXYxLjA6ZnJlZVwiLFxyXG4gICAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlcyxcclxuICAgICAgfSksXHJcbiAgICB9KVxyXG4gICAgICAudGhlbihhc3luYyAocmVzcG9uc2UpID0+IHtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICBjb25zdCBlcnJvclRleHQgPSBhd2FpdCByZXNwb25zZS50ZXh0KCkuY2F0Y2goKCkgPT4gXCJcIik7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgIGBPcGVuUm91dGVyIEFQSSBlcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9IC0gJHtlcnJvclRleHR9YFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oKGRhdGEpID0+IHtcclxuICAgICAgICBjb25zdCBjb250ZW50ID0gZGF0YS5jaG9pY2VzPy5bMF0/Lm1lc3NhZ2U/LmNvbnRlbnQ7XHJcbiAgICAgICAgaWYgKCFjb250ZW50KSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZXNwb25zZSB0ZXh0IHJldHVybmVkIGJ5IE9wZW5Sb3V0ZXIgbW9kZWxcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IHRydWUsIGRhdGE6IGNvbnRlbnQgfSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHNlbmRSZXNwb25zZSh7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSB9KSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn0pO1xyXG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUNBLE9BQU8sZUFBZSxTQUFTLGNBQWMsRUFBRSxPQUFPLEtBQUssQ0FBQztBQUFBLEVBQzVELElBQUksbUJBQW1CLFFBQVMsQ0FBQyxPQUFNLE9BQU0sT0FBTSxPQUFNO0FBQUEsSUFDckQsSUFBSSxPQUFPLFVBQVMsWUFBWSxNQUFLLFdBQVcsR0FBRztBQUFBLE1BQy9DLE1BQU0sSUFBSSxVQUFVLHlCQUF5QjtBQUFBLElBQ2pEO0FBQUEsSUFDQSxJQUFJLE9BQU8sVUFBUyxZQUFZLE1BQUssV0FBVyxHQUFHO0FBQUEsTUFDL0MsTUFBTSxJQUFJLFVBQVUseUJBQXlCO0FBQUEsSUFDakQ7QUFBQSxJQUNBLElBQUksT0FBTyxVQUFTLFdBQVc7QUFBQSxNQUMzQixNQUFNLElBQUksVUFBVSwwQkFBMEI7QUFBQSxJQUNsRDtBQUFBLElBQ0EsSUFBSSxPQUFPLFVBQVMsWUFBWSxNQUFLLFdBQVcsR0FBRztBQUFBLE1BQy9DLE1BQU0sSUFBSSxVQUFVLHlCQUF5QjtBQUFBLElBQ2pEO0FBQUE7QUFBQSxFQUVJLGtCQUFVO0FBQUE7Ozs7RUNmbEIsT0FBTyxlQUFlLFNBQVMsY0FBYyxFQUFFLE9BQU8sS0FBSyxDQUFDO0FBQUEsRUFFNUQsSUFBSSxjQUFjO0FBQUEsRUFFbEIsSUFBSSw0QkFBNEI7QUFBQSxFQVdoQyxJQUFJLGdCQUFnQixRQUFTLENBQUMsT0FBTSxLQUFJO0FBQUEsSUFDcEMsSUFBSSxNQUFLLFFBQVksWUFBSSxDQUFDLElBQUksS0FBSSxNQUFLLElBQUcsV0FBVyxZQUFZLFFBQVksWUFBSSxNQUFNLEtBQUksTUFBSyxJQUFHLFlBQVksYUFBYSxRQUFZLFlBQUksS0FBSztBQUFBLElBQ2pKLElBQUksaUJBQWlCLFFBQVMsQ0FBQyxHQUFHLEdBQUc7QUFBQSxNQUNqQyxJQUFJLFFBQVEsSUFBSSxPQUFPLE1BQU0sY0FBYyw0QkFBNEIsYUFBYSxHQUFHO0FBQUEsTUFDdkYsT0FBTyxNQUFNLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztBQUFBO0FBQUEsSUFFakMsSUFBSSwwQkFBMEIsUUFBUyxDQUFDLEdBQUcsTUFBTSxPQUFPO0FBQUEsTUFDcEQsU0FBUyxJQUFJLE1BQU8sS0FBSyxNQUFNLEtBQUs7QUFBQSxRQUNoQyxJQUFJLGVBQWUsR0FBRyxDQUFDO0FBQUEsVUFDbkIsT0FBTztBQUFBLE1BQ2Y7QUFBQSxNQUNBLE9BQU87QUFBQTtBQUFBLElBRVgsSUFBSSxVQUFTLENBQUM7QUFBQSxJQUNkLElBQUksWUFBWSxRQUFTLENBQUMsT0FBTSxRQUFPLE1BQUs7QUFBQSxNQUN4QyxRQUFPLEtBQUssTUFBSyxNQUFNLFFBQU8sT0FBTSxDQUFDLENBQUM7QUFBQTtBQUFBLElBRTFDLElBQUksUUFBUTtBQUFBLElBQ1osVUFBUztBQUFBLE1BRUwsSUFBSSxNQUFLLFNBQVMsU0FBUyxXQUFXO0FBQUEsUUFDbEMsVUFBVSxPQUFNLE9BQU8sTUFBSyxTQUFTLENBQUM7QUFBQSxRQUN0QztBQUFBLE1BQ0o7QUFBQSxNQUVBLElBQUksTUFBTSxRQUFRLFlBQVk7QUFBQSxNQUM5QixJQUFJLGVBQWUsT0FBTSxHQUFHLEtBQUssZUFBZSxPQUFNLE1BQU0sQ0FBQyxHQUFHO0FBQUEsUUFDNUQsVUFBVSxPQUFNLE9BQU8sR0FBRztBQUFBLFFBQzFCLFFBQVEsTUFBTTtBQUFBLFFBQ2Q7QUFBQSxNQUNKO0FBQUEsTUFFQSxNQUFNLHdCQUF3QixPQUFNLE9BQU8sR0FBRztBQUFBLE1BQzlDLElBQUksUUFBUSxJQUFJO0FBQUEsUUFDWixJQUFJLE1BQU0sTUFBSyxNQUFNLE9BQU8sUUFBUSxTQUFTO0FBQUEsUUFDN0MsTUFBTSxJQUFJLE1BQU0sc0RBQ1g7QUFBQSxJQUFPLE1BQU0sVUFDZDtBQUFBO0FBQUEsOERBQW1FO0FBQUEsTUFDM0U7QUFBQSxNQUVBLFVBQVUsT0FBTSxPQUFPLEdBQUc7QUFBQSxNQUMxQixRQUFRLE1BQU07QUFBQSxJQUNsQjtBQUFBLElBQ0EsT0FBTztBQUFBO0FBQUEsRUFFSCxrQkFBVTtBQUFBOzs7Ozs7Ozs7Ozs7OztBQzdEa0IsU0FBUyxhQUFhLENBQUMsS0FBSTtBQUFBLEVBQUMsT0FBTyxPQUFPLFFBQU07QUFBQTtBQUFTLFNBQVMsYUFBYSxDQUFDLEtBQUk7QUFBQSxFQUFDLE9BQU8sT0FBTyxRQUFNLFlBQVUsUUFBTTtBQUFBO0FBQUssU0FBUyxXQUFXLENBQUMsS0FBSTtBQUFBLEVBQUMsT0FBTyxRQUFNO0FBQUE7QUFBSyxTQUFTLHNCQUFzQixDQUFDLEtBQUk7QUFBQSxFQUFDLE9BQU8sT0FBSztBQUFBO0FBQUssU0FBUyxHQUFHLEdBQUU7QUFBQSxFQUFDLEtBQUssV0FBUyxNQUFLLEtBQUssVUFBUSxNQUFLLEtBQUssT0FBSyxNQUFLLEtBQUssT0FBSyxNQUFLLEtBQUssT0FBSyxNQUFLLEtBQUssV0FBUyxNQUFLLEtBQUssT0FBSyxNQUFLLEtBQUssU0FBTyxNQUFLLEtBQUssUUFBTSxNQUFLLEtBQUssV0FBUyxNQUFLLEtBQUssT0FBSyxNQUFLLEtBQUssT0FBSztBQUFBO0FBQ21sQixTQUFTLFFBQVEsQ0FBQyxLQUFJLGtCQUFpQixtQkFBa0I7QUFBQSxFQUFDLElBQUcsT0FBSyxjQUFjLEdBQUcsS0FBRyxlQUFlO0FBQUEsSUFBSSxPQUFPO0FBQUEsRUFBSSxJQUFJLElBQUUsSUFBSTtBQUFBLEVBQUksT0FBTyxFQUFFLE1BQU0sS0FBSSxrQkFBaUIsaUJBQWlCLEdBQUU7QUFBQTtBQUEya0gsU0FBUyxTQUFTLENBQUMsS0FBSTtBQUFBLEVBQUMsSUFBRyxjQUFjLEdBQUc7QUFBQSxJQUFFLE1BQUksU0FBUyxHQUFHO0FBQUEsRUFBRSxJQUFHLEVBQUUsZUFBZTtBQUFBLElBQUssT0FBTyxJQUFJLFVBQVUsT0FBTyxLQUFLLEdBQUc7QUFBQSxFQUFFLE9BQU8sSUFBSSxPQUFPO0FBQUE7QUFBNmdDLFNBQVMsVUFBVSxDQUFDLFFBQU8sVUFBUztBQUFBLEVBQUMsT0FBTyxTQUFTLFFBQU8sT0FBRyxJQUFFLEVBQUUsUUFBUSxRQUFRO0FBQUE7QUFBeUcsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFPLFVBQVM7QUFBQSxFQUFDLElBQUcsQ0FBQztBQUFBLElBQU8sT0FBTztBQUFBLEVBQVMsT0FBTyxTQUFTLFFBQU8sT0FBRyxJQUFFLEVBQUUsY0FBYyxRQUFRO0FBQUE7QUFBQSxJQUQzdk0sS0FBSSxrQkFBcWQsaUJBQW9DLGFBQXVCLG1CQUF1RCxRQUN2a0IsUUFBaUQsWUFBZ0MsY0FBc0QsaUJBQThCLGlCQUFlLEtBQUkscUJBQTZDLG1CQUFpRCxnQkFBK0Qsa0JBQWlFLGlCQUFvSSxhQUFpdlY7QUFBQTtBQUFBLEdBRGh4VyxFQUFDLEtBQUksc0NBQWlCO0FBQUEsRUFBb2Msa0JBQWdCO0FBQUEsRUFBb0IsY0FBWTtBQUFBLEVBQVcsb0JBQWtCO0FBQUEsRUFBcUMsU0FBTyxDQUFDLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxNQUFLO0FBQUEsR0FDOW1CLElBQUk7QUFBQSxFQUFFLFNBQU8sQ0FBQyxLQUFJLEtBQUksS0FBSSxNQUFLLEtBQUksR0FBRyxFQUFFLE9BQU8sTUFBTTtBQUFBLEVBQUUsYUFBVyxDQUFDLEdBQUcsRUFBRSxPQUFPLE1BQU07QUFBQSxFQUFFLGVBQWEsQ0FBQyxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUcsRUFBRSxPQUFPLFVBQVU7QUFBQSxFQUFFLGtCQUFnQixDQUFDLEtBQUksS0FBSSxHQUFHO0FBQUEsRUFBcUIsc0JBQW9CO0FBQUEsRUFBeUIsb0JBQWtCO0FBQUEsRUFBK0IsaUJBQWUsRUFBQyxXQUFVLE1BQUssWUFBVyxNQUFHLGVBQWMsS0FBRTtBQUFBLEVBQUUsbUJBQWlCLEVBQUMsV0FBVSxNQUFLLFlBQVcsTUFBRyxlQUFjLEtBQUU7QUFBQSxFQUFFLGtCQUFnQixFQUFDLFdBQVUsTUFBSyxNQUFLLE1BQUcsT0FBTSxNQUFHLEtBQUksTUFBRyxRQUFPLE1BQUcsTUFBSyxNQUFHLFNBQVEsTUFBRyxVQUFTLE1BQUcsUUFBTyxNQUFHLFdBQVUsTUFBRyxTQUFRLEtBQUU7QUFBQSxFQUFFLGNBQVksRUFBQyxLQUFLLENBQUMsS0FBSTtBQUFBLElBQUMsSUFBSSxTQUFPO0FBQUEsSUFBbUIsUUFBTyxNQUFJLElBQUksUUFBUSxPQUFNLEdBQUcsRUFBRSxNQUFNLEdBQUcsRUFBRSxPQUFPLE9BQU8sRUFBRSxPQUFPLFFBQVEsQ0FBQyxLQUFJLE1BQUssT0FBTTtBQUFBLE1BQUMsSUFBSSxNQUFJLEtBQUssTUFBTSxHQUFHLEdBQUUsTUFBSSxPQUFPLElBQUksTUFBSSxFQUFFLEdBQUUsTUFBSSxPQUFPLElBQUksTUFBSSxFQUFFLEdBQUUsT0FBSyxJQUFJO0FBQUEsTUFBSyxPQUFPLElBQUksT0FBSyxTQUFZLFlBQUUsTUFBSSxDQUFDLEVBQUUsT0FBTyxNQUFLLEdBQUcsR0FBRTtBQUFBLE9BQUssQ0FBQyxDQUFDO0FBQUEsS0FBRyxTQUFTLENBQUMsS0FBSTtBQUFBLElBQUMsSUFBSSxTQUFPO0FBQUEsSUFBbUIsT0FBTyxPQUFPLEtBQUssT0FBSyxDQUFDLENBQUMsRUFBRSxPQUFPLFFBQVEsQ0FBQyxLQUFJLEtBQUk7QUFBQSxNQUFDLE9BQU0sQ0FBQyxFQUFFLE9BQU8sSUFBSSxJQUFJLEVBQUUsUUFBUSxRQUFRLENBQUMsR0FBRTtBQUFBLFFBQUMsSUFBSSxLQUFLLE9BQU8sR0FBRyxJQUFFLE1BQUksT0FBTyxDQUFDLENBQUM7QUFBQSxPQUFFLEdBQUU7QUFBQSxPQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFLFFBQVEsT0FBTSxHQUFHO0FBQUEsSUFBRTtBQUFBLEVBQTZMLElBQUksVUFBVSxRQUFNLFFBQVEsQ0FBQyxLQUFJLGtCQUFpQixtQkFBa0I7QUFBQSxJQUFDLElBQUcsQ0FBQyxjQUFjLEdBQUc7QUFBQSxNQUFFLE1BQU0sVUFBVSwyQ0FBeUMsT0FBTyxHQUFHO0FBQUEsSUFBRSxJQUFJLGFBQVcsSUFBSSxRQUFRLEdBQUcsR0FBRSxXQUFTLGVBQWEsTUFBSSxhQUFXLElBQUksUUFBUSxHQUFHLElBQUUsTUFBSSxLQUFJLFNBQU8sSUFBSSxNQUFNLFFBQVEsR0FBRSxhQUFXO0FBQUEsSUFBTSxPQUFPLEtBQUcsT0FBTyxHQUFHLFFBQVEsWUFBVyxHQUFHLEdBQUUsTUFBSSxPQUFPLEtBQUssUUFBUTtBQUFBLElBQUUsSUFBSSxPQUFLO0FBQUEsSUFBSSxJQUFHLE9BQUssS0FBSyxLQUFLLEdBQUUsQ0FBQyxxQkFBbUIsSUFBSSxNQUFNLEdBQUcsRUFBRSxXQUFTLEdBQUU7QUFBQSxNQUFDLElBQUksYUFBVyxrQkFBa0IsS0FBSyxJQUFJO0FBQUEsTUFBRSxJQUFHLFlBQVc7QUFBQSxRQUFDLElBQUcsS0FBSyxPQUFLLE1BQUssS0FBSyxPQUFLLE1BQUssS0FBSyxXQUFTLFdBQVcsSUFBRyxXQUFXO0FBQUEsVUFBRyxJQUFHLEtBQUssU0FBTyxXQUFXLElBQUc7QUFBQSxZQUFpQixLQUFLLFFBQU0sWUFBWSxNQUFNLEtBQUssT0FBTyxPQUFPLENBQUMsQ0FBQztBQUFBLFVBQU87QUFBQSxpQkFBSyxRQUFNLEtBQUssT0FBTyxPQUFPLENBQUM7QUFBQSxRQUFPLFNBQUc7QUFBQSxVQUFpQixLQUFLLFNBQU8sSUFBRyxLQUFLLFFBQU0sQ0FBQztBQUFBLFFBQUUsT0FBTztBQUFBLE1BQUk7QUFBQSxJQUFDO0FBQUEsSUFBQyxJQUFJLFFBQU0sZ0JBQWdCLEtBQUssSUFBSTtBQUFBLElBQUUsSUFBRyxPQUFNO0FBQUEsTUFBQyxRQUFNLE1BQU07QUFBQSxNQUFHLElBQUksYUFBVyxNQUFNLFlBQVk7QUFBQSxNQUFFLEtBQUssV0FBUyxZQUFXLE9BQUssS0FBSyxPQUFPLE1BQU0sTUFBTTtBQUFBLElBQUM7QUFBQSxJQUFDLElBQUcscUJBQW1CLFNBQU8sS0FBSyxNQUFNLHNCQUFzQixHQUFFO0FBQUEsTUFBQyxJQUFJLFVBQVEsS0FBSyxPQUFPLEdBQUUsQ0FBQyxNQUFJO0FBQUEsTUFBSyxJQUFHLFdBQVMsRUFBRSxTQUFPLGlCQUFpQjtBQUFBLFFBQWEsT0FBSyxLQUFLLE9BQU8sQ0FBQyxHQUFFLEtBQUssVUFBUTtBQUFBLElBQUU7QUFBQSxJQUFDLElBQUcsQ0FBQyxpQkFBaUIsZ0JBQWMsV0FBUyxjQUFZLENBQUMsZ0JBQWdCLGNBQWE7QUFBQSxNQUFDLElBQUksVUFBUTtBQUFBLE1BQUcsU0FBUSxJQUFFLEVBQUUsSUFBRSxnQkFBZ0IsUUFBTyxLQUFJO0FBQUEsUUFBQyxJQUFJLE1BQUksS0FBSyxRQUFRLGdCQUFnQixFQUFFO0FBQUEsUUFBRSxJQUFHLFFBQU0sT0FBSyxZQUFVLE1BQUksTUFBSTtBQUFBLFVBQVMsVUFBUTtBQUFBLE1BQUc7QUFBQSxNQUFDLElBQUksTUFBSztBQUFBLE1BQU8sSUFBRyxZQUFVO0FBQUEsUUFBRyxTQUFPLEtBQUssWUFBWSxHQUFHO0FBQUEsTUFBTztBQUFBLGlCQUFPLEtBQUssWUFBWSxLQUFJLE9BQU87QUFBQSxNQUFFLElBQUcsV0FBUztBQUFBLFFBQUcsT0FBSyxLQUFLLE1BQU0sR0FBRSxNQUFNLEdBQUUsT0FBSyxLQUFLLE1BQU0sU0FBTyxDQUFDLEdBQUUsS0FBSyxPQUFLLG1CQUFtQixJQUFJO0FBQUEsTUFBRSxVQUFRO0FBQUEsTUFBRyxTQUFRLElBQUUsRUFBRSxJQUFFLGFBQWEsUUFBTyxLQUFJO0FBQUEsUUFBQyxJQUFJLE1BQUksS0FBSyxRQUFRLGFBQWEsRUFBRTtBQUFBLFFBQUUsSUFBRyxRQUFNLE9BQUssWUFBVSxNQUFJLE1BQUk7QUFBQSxVQUFTLFVBQVE7QUFBQSxNQUFHO0FBQUEsTUFBQyxJQUFHLFlBQVU7QUFBQSxRQUFHLFVBQVEsS0FBSztBQUFBLE1BQU8sS0FBSyxPQUFLLEtBQUssTUFBTSxHQUFFLE9BQU8sR0FBRSxPQUFLLEtBQUssTUFBTSxPQUFPLEdBQUUsS0FBSyxVQUFVLEdBQUUsS0FBSyxXQUFTLEtBQUssWUFBVTtBQUFBLE1BQUcsSUFBSSxlQUFhLEtBQUssU0FBUyxPQUFLLE9BQUssS0FBSyxTQUFTLEtBQUssU0FBUyxTQUFPLE9BQUs7QUFBQSxNQUFJLElBQUcsQ0FBQyxjQUFhO0FBQUEsUUFBQyxJQUFJLFlBQVUsS0FBSyxTQUFTLE1BQU0sSUFBSTtBQUFBLFFBQUUsU0FBUSxJQUFFLEdBQUUsSUFBRSxVQUFVLE9BQU8sSUFBRSxHQUFFLEtBQUk7QUFBQSxVQUFDLElBQUksT0FBSyxVQUFVO0FBQUEsVUFBRyxJQUFHLENBQUM7QUFBQSxZQUFLO0FBQUEsVUFBUyxJQUFHLENBQUMsS0FBSyxNQUFNLG1CQUFtQixHQUFFO0FBQUEsWUFBQyxJQUFJLFVBQVE7QUFBQSxZQUFHLFNBQVEsSUFBRSxHQUFFLElBQUUsS0FBSyxPQUFPLElBQUUsR0FBRTtBQUFBLGNBQUksSUFBRyxLQUFLLFdBQVcsQ0FBQyxJQUFFO0FBQUEsZ0JBQUksV0FBUztBQUFBLGNBQVM7QUFBQSwyQkFBUyxLQUFLO0FBQUEsWUFBRyxJQUFHLENBQUMsUUFBUSxNQUFNLG1CQUFtQixHQUFFO0FBQUEsY0FBQyxJQUFJLGFBQVcsVUFBVSxNQUFNLEdBQUUsQ0FBQyxHQUFFLFVBQVEsVUFBVSxNQUFNLElBQUUsQ0FBQyxHQUFFLE1BQUksS0FBSyxNQUFNLGlCQUFpQjtBQUFBLGNBQUUsSUFBRztBQUFBLGdCQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUUsR0FBRSxRQUFRLFFBQVEsSUFBSSxFQUFFO0FBQUEsY0FBRSxJQUFHLFFBQVE7QUFBQSxnQkFBTyxPQUFLLE1BQUksUUFBUSxLQUFLLEdBQUcsSUFBRTtBQUFBLGNBQUssS0FBSyxXQUFTLFdBQVcsS0FBSyxHQUFHO0FBQUEsY0FBRTtBQUFBLFlBQUs7QUFBQSxVQUFDO0FBQUEsUUFBQztBQUFBLE1BQUM7QUFBQSxNQUFDLElBQUcsS0FBSyxTQUFTLFNBQU87QUFBQSxRQUFlLEtBQUssV0FBUztBQUFBLE1BQVE7QUFBQSxhQUFLLFdBQVMsS0FBSyxTQUFTLFlBQVk7QUFBQSxNQUFFLElBQUcsQ0FBQztBQUFBLFFBQWEsS0FBSyxXQUFTLElBQUksSUFBSSxXQUFXLEtBQUssVUFBVSxFQUFFO0FBQUEsTUFBUyxJQUFJLElBQUUsS0FBSyxPQUFLLE1BQUksS0FBSyxPQUFLLElBQUcsSUFBRSxLQUFLLFlBQVU7QUFBQSxNQUFHLElBQUcsS0FBSyxPQUFLLElBQUUsR0FBRSxLQUFLLFFBQU0sS0FBSyxNQUFLLGNBQWE7QUFBQSxRQUFDLElBQUcsS0FBSyxXQUFTLEtBQUssU0FBUyxPQUFPLEdBQUUsS0FBSyxTQUFTLFNBQU8sQ0FBQyxHQUFFLEtBQUssT0FBSztBQUFBLFVBQUksT0FBSyxNQUFJO0FBQUEsTUFBSTtBQUFBLElBQUM7QUFBQSxJQUFDLElBQUcsQ0FBQyxlQUFlO0FBQUEsTUFBWSxTQUFRLElBQUUsR0FBRSxJQUFFLFdBQVcsT0FBTyxJQUFFLEdBQUUsS0FBSTtBQUFBLFFBQUMsSUFBSSxLQUFHLFdBQVc7QUFBQSxRQUFHLElBQUcsS0FBSyxRQUFRLEVBQUUsTUFBSTtBQUFBLFVBQUc7QUFBQSxRQUFTLElBQUksTUFBSSxtQkFBbUIsRUFBRTtBQUFBLFFBQUUsSUFBRyxRQUFNO0FBQUEsVUFBRyxNQUFJLE9BQU8sRUFBRTtBQUFBLFFBQUUsT0FBSyxLQUFLLE1BQU0sRUFBRSxFQUFFLEtBQUssR0FBRztBQUFBLE1BQUM7QUFBQSxJQUFDLElBQUksT0FBSyxLQUFLLFFBQVEsR0FBRztBQUFBLElBQUUsSUFBRyxTQUFPO0FBQUEsTUFBRyxLQUFLLE9BQUssS0FBSyxPQUFPLElBQUksR0FBRSxPQUFLLEtBQUssTUFBTSxHQUFFLElBQUk7QUFBQSxJQUFFLElBQUksS0FBRyxLQUFLLFFBQVEsR0FBRztBQUFBLElBQUUsSUFBRyxPQUFLLElBQUc7QUFBQSxNQUFDLElBQUcsS0FBSyxTQUFPLEtBQUssT0FBTyxFQUFFLEdBQUUsS0FBSyxRQUFNLEtBQUssT0FBTyxLQUFHLENBQUMsR0FBRTtBQUFBLFFBQWlCLEtBQUssUUFBTSxZQUFZLE1BQU0sS0FBSyxLQUFLO0FBQUEsTUFBRSxPQUFLLEtBQUssTUFBTSxHQUFFLEVB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RyxDQUFDLFNBQVM7QUFBQSxVQUFLLFNBQVMsT0FBSztBQUFBLFFBQUcsSUFBRyxDQUFDLFNBQVM7QUFBQSxVQUFTLFNBQVMsV0FBUztBQUFBLFFBQUcsSUFBRyxRQUFRLE9BQUs7QUFBQSxVQUFHLFFBQVEsUUFBUSxFQUFFO0FBQUEsUUFBRSxJQUFHLFFBQVEsU0FBTztBQUFBLFVBQUUsUUFBUSxRQUFRLEVBQUU7QUFBQSxRQUFFLFFBQU8sV0FBUyxRQUFRLEtBQUssR0FBRztBQUFBLE1BQUMsRUFBTTtBQUFBLGdCQUFPLFdBQVMsU0FBUztBQUFBLE1BQVMsSUFBRyxRQUFPLFNBQU8sU0FBUyxRQUFPLFFBQU8sUUFBTSxTQUFTLE9BQU0sUUFBTyxPQUFLLFNBQVMsUUFBTSxJQUFHLFFBQU8sT0FBSyxTQUFTLE1BQUssUUFBTyxXQUFTLFNBQVMsWUFBVSxTQUFTLE1BQUssUUFBTyxPQUFLLFNBQVMsTUFBSyxRQUFPLFlBQVUsUUFBTyxRQUFPO0FBQUEsUUFBQyxJQUFJLElBQUUsUUFBTyxZQUFVLElBQUcsSUFBRSxRQUFPLFVBQVE7QUFBQSxRQUFHLFFBQU8sT0FBSyxJQUFFO0FBQUEsTUFBQztBQUFBLE1BQUMsT0FBTyxRQUFPLFVBQVEsUUFBTyxXQUFTLFNBQVMsU0FBUSxRQUFPLE9BQUssUUFBTyxPQUFPLEdBQUU7QUFBQSxJQUFNO0FBQUEsSUFBQyxJQUFJLGNBQVksUUFBTyxZQUFVLFFBQU8sU0FBUyxPQUFPLENBQUMsTUFBSSxLQUFJLFdBQVMsU0FBUyxRQUFNLFNBQVMsWUFBVSxTQUFTLFNBQVMsT0FBTyxDQUFDLE1BQUksS0FBSSxhQUFXLFlBQVUsZUFBYSxRQUFPLFFBQU0sU0FBUyxVQUFTLGdCQUFjLFlBQVcsVUFBUSxRQUFPLFlBQVUsUUFBTyxTQUFTLE1BQU0sR0FBRyxLQUFHLENBQUMsR0FBRSxVQUFRLFNBQVMsWUFBVSxTQUFTLFNBQVMsTUFBTSxHQUFHLEtBQUcsQ0FBQyxHQUFFLFlBQVUsUUFBTyxZQUFVLENBQUMsZ0JBQWdCLFFBQU87QUFBQSxJQUFVLElBQUcsV0FBVTtBQUFBLE1BQUMsSUFBRyxRQUFPLFdBQVMsSUFBRyxRQUFPLE9BQUssTUFBSyxRQUFPO0FBQUEsUUFBSyxJQUFHLFFBQVEsT0FBSztBQUFBLFVBQUcsUUFBUSxLQUFHLFFBQU87QUFBQSxRQUFVO0FBQUEsa0JBQVEsUUFBUSxRQUFPLElBQUk7QUFBQSxNQUFFLElBQUcsUUFBTyxPQUFLLElBQUcsU0FBUyxVQUFTO0FBQUEsUUFBQyxJQUFHLFNBQVMsV0FBUyxNQUFLLFNBQVMsT0FBSyxNQUFLLFNBQVM7QUFBQSxVQUFLLElBQUcsUUFBUSxPQUFLO0FBQUEsWUFBRyxRQUFRLEtBQUcsU0FBUztBQUFBLFVBQVU7QUFBQSxvQkFBUSxRQUFRLFNBQVMsSUFBSTtBQUFBLFFBQUUsU0FBUyxPQUFLO0FBQUEsTUFBSTtBQUFBLE1BQUMsYUFBVyxlQUFhLFFBQVEsT0FBSyxNQUFJLFFBQVEsT0FBSztBQUFBLElBQUc7QUFBQSxJQUFDLElBQUc7QUFBQSxNQUFTLFFBQU8sT0FBSyxTQUFTLFFBQU0sU0FBUyxTQUFPLEtBQUcsU0FBUyxPQUFLLFFBQU8sTUFBSyxRQUFPLFdBQVMsU0FBUyxZQUFVLFNBQVMsYUFBVyxLQUFHLFNBQVMsV0FBUyxRQUFPLFVBQVMsUUFBTyxTQUFPLFNBQVMsUUFBTyxRQUFPLFFBQU0sU0FBUyxPQUFNLFVBQVE7QUFBQSxJQUFhLFNBQUcsUUFBUSxRQUFPO0FBQUEsTUFBQyxJQUFHLENBQUM7QUFBQSxRQUFRLFVBQVEsQ0FBQztBQUFBLE1BQUUsUUFBUSxJQUFJLEdBQUUsVUFBUSxRQUFRLE9BQU8sT0FBTyxHQUFFLFFBQU8sU0FBTyxTQUFTLFFBQU8sUUFBTyxRQUFNLFNBQVM7QUFBQSxJQUFLLEVBQU0sU0FBRyxDQUFDLHVCQUF1QixTQUFTLE1BQU0sR0FBRTtBQUFBLE1BQUMsSUFBRyxXQUFVO0FBQUEsUUFBQyxRQUFPLFdBQVMsUUFBTyxPQUFLLFFBQVEsTUFBTTtBQUFBLFFBQUUsSUFBSSxhQUFXLFFBQU8sUUFBTSxRQUFPLEtBQUssUUFBUSxHQUFHLElBQUUsSUFBRSxRQUFPLEtBQUssTUFBTSxHQUFHLElBQUU7QUFBQSxRQUFHLElBQUc7QUFBQSxVQUFXLFFBQU8sT0FBSyxXQUFXLE1BQU0sR0FBRSxRQUFPLE9BQUssUUFBTyxXQUFTLFdBQVcsTUFBTTtBQUFBLE1BQUM7QUFBQSxNQUFDLElBQUcsUUFBTyxTQUFPLFNBQVMsUUFBTyxRQUFPLFFBQU0sU0FBUyxPQUFNLENBQUMsWUFBWSxRQUFPLFFBQVEsS0FBRyxDQUFDLFlBQVksUUFBTyxNQUFNO0FBQUEsUUFBRSxRQUFPLFFBQU0sUUFBTyxXQUFTLFFBQU8sV0FBUyxPQUFLLFFBQU8sU0FBTyxRQUFPLFNBQU87QUFBQSxNQUFJLE9BQU8sUUFBTyxPQUFLLFFBQU8sT0FBTyxHQUFFO0FBQUEsSUFBTTtBQUFBLElBQUMsSUFBRyxDQUFDLFFBQVEsUUFBTztBQUFBLE1BQUMsSUFBRyxRQUFPLFdBQVMsTUFBSyxRQUFPO0FBQUEsUUFBTyxRQUFPLE9BQUssTUFBSSxRQUFPO0FBQUEsTUFBWTtBQUFBLGdCQUFPLE9BQUs7QUFBQSxNQUFLLE9BQU8sUUFBTyxPQUFLLFFBQU8sT0FBTyxHQUFFO0FBQUEsSUFBTTtBQUFBLElBQUMsSUFBSSxPQUFLLFFBQVEsTUFBTSxFQUFFLEVBQUUsSUFBRyxvQkFBa0IsUUFBTyxRQUFNLFNBQVMsUUFBTSxRQUFRLFNBQU8sT0FBSyxTQUFPLE9BQUssU0FBTyxTQUFPLFNBQU8sSUFBRyxLQUFHO0FBQUEsSUFBRSxTQUFRLElBQUUsUUFBUSxPQUFPLEtBQUcsR0FBRTtBQUFBLE1BQUksSUFBRyxPQUFLLFFBQVEsSUFBRyxTQUFPO0FBQUEsUUFBSSxRQUFRLE9BQU8sR0FBRSxDQUFDO0FBQUEsTUFBTyxTQUFHLFNBQU87QUFBQSxRQUFLLFFBQVEsT0FBTyxHQUFFLENBQUMsR0FBRTtBQUFBLE1BQVUsU0FBRztBQUFBLFFBQUcsUUFBUSxPQUFPLEdBQUUsQ0FBQyxHQUFFO0FBQUEsSUFBSyxJQUFHLENBQUMsY0FBWSxDQUFDO0FBQUEsTUFBYyxNQUFLLE1BQUs7QUFBQSxRQUFHLFFBQVEsUUFBUSxJQUFJO0FB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QUEsTUFDckQsUUFBUTtBQUFBLE1BQ1IsU0FBUztBQUFBLFFBQ1AsZ0JBQWdCO0FBQUEsUUFDaEIsZUFBZSxVQUFVO0FBQUEsUUFDekIsZ0JBQWdCO0FBQUEsUUFDaEIsV0FBVztBQUFBLE1BQ2I7QUFBQSxNQUNBLE1BQU0sS0FBSyxVQUFVO0FBQUEsUUFDbkIsT0FBTyxTQUFTO0FBQUEsUUFDaEI7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNILENBQUMsRUFDRSxLQUFLLE9BQU8sYUFBYTtBQUFBLE1BQ3hCLElBQUksQ0FBQyxTQUFTLElBQUk7QUFBQSxRQUNoQixNQUFNLFlBQVksTUFBTSxTQUFTLEtBQUssRUFBRSxNQUFNLE1BQU0sRUFBRTtBQUFBLFFBQ3RELE1BQU0sSUFBSSxNQUNSLHlCQUF5QixTQUFTLFlBQVksV0FDaEQ7QUFBQSxNQUNGO0FBQUEsTUFDQSxPQUFPLFNBQVMsS0FBSztBQUFBLEtBQ3RCLEVBQ0EsS0FBSyxDQUFDLFNBQVM7QUFBQSxNQUNkLE1BQU0sVUFBVSxLQUFLLFVBQVUsSUFBSSxTQUFTO0FBQUEsTUFDNUMsSUFBSSxDQUFDLFNBQVM7QUFBQSxRQUNaLE1BQU0sSUFBSSxNQUFNLCtDQUErQztBQUFBLE1BQ2pFO0FBQUEsTUFDQSxhQUFhLEVBQUUsU0FBUyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBQUEsS0FDOUMsRUFDQSxNQUFNLENBQUMsVUFBVSxhQUFhLEVBQUUsU0FBUyxPQUFPLE9BQU8sTUFBTSxRQUFRLENBQUMsQ0FBQztBQUFBLElBQzFFLE9BQU87QUFBQSxFQUNUO0FBQUEsQ0FDRDsiLAogICJkZWJ1Z0lkIjogIkFGMURDQTg2MDczQTcwRDA2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
