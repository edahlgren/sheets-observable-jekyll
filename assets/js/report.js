(function () {
  'use strict';

  var _isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  var _anObject = function (it) {
    if (!_isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var _fails = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var _descriptors = !_fails(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _global = createCommonjsModule(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math
    ? window : typeof self != 'undefined' && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var document$1 = _global.document;
  // typeof document.createElement is 'object' in old IE
  var is = _isObject(document$1) && _isObject(document$1.createElement);
  var _domCreate = function (it) {
    return is ? document$1.createElement(it) : {};
  };

  var _ie8DomDefine = !_descriptors && !_fails(function () {
    return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
  });

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var _toPrimitive = function (it, S) {
    if (!_isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var dP = Object.defineProperty;

  var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    _anObject(O);
    P = _toPrimitive(P, true);
    _anObject(Attributes);
    if (_ie8DomDefine) try {
      return dP(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var _objectDp = {
  	f: f
  };

  var dP$1 = _objectDp.f;
  var FProto = Function.prototype;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = 'name';

  // 19.2.4.2 name
  NAME in FProto || _descriptors && dP$1(FProto, NAME, {
    configurable: true,
    get: function () {
      try {
        return ('' + this).match(nameRE)[1];
      } catch (e) {
        return '';
      }
    }
  });

  var toString = {}.toString;

  var _cof = function (it) {
    return toString.call(it).slice(8, -1);
  };

  var _core = createCommonjsModule(function (module) {
  var core = module.exports = { version: '2.6.11' };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });
  var _core_1 = _core.version;

  var _library = false;

  var _shared = createCommonjsModule(function (module) {
  var SHARED = '__core-js_shared__';
  var store = _global[SHARED] || (_global[SHARED] = {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: _core.version,
    mode:  'global',
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
  });
  });

  var id = 0;
  var px = Math.random();
  var _uid = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };

  var _wks = createCommonjsModule(function (module) {
  var store = _shared('wks');

  var Symbol = _global.Symbol;
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] =
      USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
  };

  $exports.store = store;
  });

  // 7.2.8 IsRegExp(argument)


  var MATCH = _wks('match');
  var _isRegexp = function (it) {
    var isRegExp;
    return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
  };

  var _aFunction = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };

  // 7.3.20 SpeciesConstructor(O, defaultConstructor)


  var SPECIES = _wks('species');
  var _speciesConstructor = function (O, D) {
    var C = _anObject(O).constructor;
    var S;
    return C === undefined || (S = _anObject(C)[SPECIES]) == undefined ? D : _aFunction(S);
  };

  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;
  var _toInteger = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };

  // 7.2.1 RequireObjectCoercible(argument)
  var _defined = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };

  // true  -> String#at
  // false -> String#codePointAt
  var _stringAt = function (TO_STRING) {
    return function (that, pos) {
      var s = String(_defined(that));
      var i = _toInteger(pos);
      var l = s.length;
      var a, b;
      if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };

  var at = _stringAt(true);

   // `AdvanceStringIndex` abstract operation
  // https://tc39.github.io/ecma262/#sec-advancestringindex
  var _advanceStringIndex = function (S, index, unicode) {
    return index + (unicode ? at(S, index).length : 1);
  };

  // 7.1.15 ToLength

  var min = Math.min;
  var _toLength = function (it) {
    return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  // getting tag from 19.1.3.6 Object.prototype.toString()

  var TAG = _wks('toStringTag');
  // ES3 wrong here
  var ARG = _cof(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (e) { /* empty */ }
  };

  var _classof = function (it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
      // builtinTag case
      : ARG ? _cof(O)
      // ES3 arguments fallback
      : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };

  var builtinExec = RegExp.prototype.exec;

   // `RegExpExec` abstract operation
  // https://tc39.github.io/ecma262/#sec-regexpexec
  var _regexpExecAbstract = function (R, S) {
    var exec = R.exec;
    if (typeof exec === 'function') {
      var result = exec.call(R, S);
      if (typeof result !== 'object') {
        throw new TypeError('RegExp exec method returned something other than an Object or null');
      }
      return result;
    }
    if (_classof(R) !== 'RegExp') {
      throw new TypeError('RegExp#exec called on incompatible receiver');
    }
    return builtinExec.call(R, S);
  };

  // 21.2.5.3 get RegExp.prototype.flags

  var _flags = function () {
    var that = _anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  var nativeExec = RegExp.prototype.exec;
  // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.
  var nativeReplace = String.prototype.replace;

  var patchedExec = nativeExec;

  var LAST_INDEX = 'lastIndex';

  var UPDATES_LAST_INDEX_WRONG = (function () {
    var re1 = /a/,
        re2 = /b*/g;
    nativeExec.call(re1, 'a');
    nativeExec.call(re2, 'a');
    return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
  })();

  // nonparticipating capturing group, copied from es5-shim's String#split patch.
  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;

      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
      }
      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

      match = nativeExec.call(re, str);

      if (UPDATES_LAST_INDEX_WRONG && match) {
        re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
      }
      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        // eslint-disable-next-line no-loop-func
        nativeReplace.call(match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var _regexpExec = patchedExec;

  var _propertyDesc = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _hide = _descriptors ? function (object, key, value) {
    return _objectDp.f(object, key, _propertyDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var hasOwnProperty = {}.hasOwnProperty;
  var _has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var _functionToString = _shared('native-function-to-string', Function.toString);

  var _redefine = createCommonjsModule(function (module) {
  var SRC = _uid('src');

  var TO_STRING = 'toString';
  var TPL = ('' + _functionToString).split(TO_STRING);

  _core.inspectSource = function (it) {
    return _functionToString.call(it);
  };

  (module.exports = function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
    if (O[key] === val) return;
    if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
    if (O === _global) {
      O[key] = val;
    } else if (!safe) {
      delete O[key];
      _hide(O, key, val);
    } else if (O[key]) {
      O[key] = val;
    } else {
      _hide(O, key, val);
    }
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && this[SRC] || _functionToString.call(this);
  });
  });

  // optional / simple context binding

  var _ctx = function (fn, that, length) {
    _aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
    var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
    var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
    var key, own, out, exp;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      // export native or passed
      out = (own ? target : source)[key];
      // bind timers to global for call from export context
      exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
      // extend global
      if (target) _redefine(target, key, out, type & $export.U);
      // export
      if (exports[key] != out) _hide(exports, key, exp);
      if (IS_PROTO && expProto[key] != out) expProto[key] = out;
    }
  };
  _global.core = _core;
  // type bitmap
  $export.F = 1;   // forced
  $export.G = 2;   // global
  $export.S = 4;   // static
  $export.P = 8;   // proto
  $export.B = 16;  // bind
  $export.W = 32;  // wrap
  $export.U = 64;  // safe
  $export.R = 128; // real proto method for `library`
  var _export = $export;

  _export({
    target: 'RegExp',
    proto: true,
    forced: _regexpExec !== /./.exec
  }, {
    exec: _regexpExec
  });

  var SPECIES$1 = _wks('species');

  var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
    // #replace needs built-in support for named groups.
    // #match works fine because it just return the exec results, even if it has
    // a "grops" property.
    var re = /./;
    re.exec = function () {
      var result = [];
      result.groups = { a: '7' };
      return result;
    };
    return ''.replace(re, '$<a>') !== '7';
  });

  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
    // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
    var re = /(?:)/;
    var originalExec = re.exec;
    re.exec = function () { return originalExec.apply(this, arguments); };
    var result = 'ab'.split(re);
    return result.length === 2 && result[0] === 'a' && result[1] === 'b';
  })();

  var _fixReWks = function (KEY, length, exec) {
    var SYMBOL = _wks(KEY);

    var DELEGATES_TO_SYMBOL = !_fails(function () {
      // String methods call symbol-named RegEp methods
      var O = {};
      O[SYMBOL] = function () { return 7; };
      return ''[KEY](O) != 7;
    });

    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
      // Symbol-named RegExp methods call .exec
      var execCalled = false;
      var re = /a/;
      re.exec = function () { execCalled = true; return null; };
      if (KEY === 'split') {
        // RegExp[@@split] doesn't call the regex's exec method, but first creates
        // a new one. We need to return the patched regex when creating the new one.
        re.constructor = {};
        re.constructor[SPECIES$1] = function () { return re; };
      }
      re[SYMBOL]('');
      return !execCalled;
    }) : undefined;

    if (
      !DELEGATES_TO_SYMBOL ||
      !DELEGATES_TO_EXEC ||
      (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
      (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
    ) {
      var nativeRegExpMethod = /./[SYMBOL];
      var fns = exec(
        _defined,
        SYMBOL,
        ''[KEY],
        function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
          if (regexp.exec === _regexpExec) {
            if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
              // The native String method already delegates to @@method (this
              // polyfilled function), leasing to infinite recursion.
              // We avoid it by directly calling the native @@method method.
              return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
            }
            return { done: true, value: nativeMethod.call(str, regexp, arg2) };
          }
          return { done: false };
        }
      );
      var strfn = fns[0];
      var rxfn = fns[1];

      _redefine(String.prototype, KEY, strfn);
      _hide(RegExp.prototype, SYMBOL, length == 2
        // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
        // 21.2.5.11 RegExp.prototype[@@split](string, limit)
        ? function (string, arg) { return rxfn.call(string, this, arg); }
        // 21.2.5.6 RegExp.prototype[@@match](string)
        // 21.2.5.9 RegExp.prototype[@@search](string)
        : function (string) { return rxfn.call(string, this); }
      );
    }
  };

  var $min = Math.min;
  var $push = [].push;
  var $SPLIT = 'split';
  var LENGTH = 'length';
  var LAST_INDEX$1 = 'lastIndex';
  var MAX_UINT32 = 0xffffffff;

  // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
  var SUPPORTS_Y = !_fails(function () { RegExp(MAX_UINT32, 'y'); });

  // @@split logic
  _fixReWks('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
    var internalSplit;
    if (
      'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
      'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
      'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
      '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
      '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
      ''[$SPLIT](/.?/)[LENGTH]
    ) {
      // based on es5-shim implementation, need to rework it
      internalSplit = function (separator, limit) {
        var string = String(this);
        if (separator === undefined && limit === 0) return [];
        // If `separator` is not a regex, use native split
        if (!_isRegexp(separator)) return $split.call(string, separator, limit);
        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') +
                    (separator.multiline ? 'm' : '') +
                    (separator.unicode ? 'u' : '') +
                    (separator.sticky ? 'y' : '');
        var lastLastIndex = 0;
        var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
        // Make `global` and avoid `lastIndex` issues by working with a copy
        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var match, lastIndex, lastLength;
        while (match = _regexpExec.call(separatorCopy, string)) {
          lastIndex = separatorCopy[LAST_INDEX$1];
          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
            lastLength = match[0][LENGTH];
            lastLastIndex = lastIndex;
            if (output[LENGTH] >= splitLimit) break;
          }
          if (separatorCopy[LAST_INDEX$1] === match.index) separatorCopy[LAST_INDEX$1]++; // Avoid an infinite loop
        }
        if (lastLastIndex === string[LENGTH]) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));
        return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
      };
    // Chakra, V8
    } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
      internalSplit = function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
      };
    } else {
      internalSplit = $split;
    }

    return [
      // `String.prototype.split` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.split
      function split(separator, limit) {
        var O = defined(this);
        var splitter = separator == undefined ? undefined : separator[SPLIT];
        return splitter !== undefined
          ? splitter.call(separator, O, limit)
          : internalSplit.call(String(O), separator, limit);
      },
      // `RegExp.prototype[@@split]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
      //
      // NOTE: This cannot be properly polyfilled in engines that don't support
      // the 'y' flag.
      function (regexp, limit) {
        var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
        if (res.done) return res.value;

        var rx = _anObject(regexp);
        var S = String(this);
        var C = _speciesConstructor(rx, RegExp);

        var unicodeMatching = rx.unicode;
        var flags = (rx.ignoreCase ? 'i' : '') +
                    (rx.multiline ? 'm' : '') +
                    (rx.unicode ? 'u' : '') +
                    (SUPPORTS_Y ? 'y' : 'g');

        // ^(? + rx + ) is needed, in combination with some S slicing, to
        // simulate the 'y' flag.
        var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (S.length === 0) return _regexpExecAbstract(splitter, S) === null ? [S] : [];
        var p = 0;
        var q = 0;
        var A = [];
        while (q < S.length) {
          splitter.lastIndex = SUPPORTS_Y ? q : 0;
          var z = _regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
          var e;
          if (
            z === null ||
            (e = $min(_toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
          ) {
            q = _advanceStringIndex(S, q, unicodeMatching);
          } else {
            A.push(S.slice(p, q));
            if (A.length === lim) return A;
            for (var i = 1; i <= z.length - 1; i++) {
              A.push(z[i]);
              if (A.length === lim) return A;
            }
            q = p = e;
          }
        }
        A.push(S.slice(p));
        return A;
      }
    ];
  });

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] =
      GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        prototype[method] = function(arg) {
          return this._invoke(method, arg);
        };
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports 
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _taggedTemplateLiteral(strings, raw) {
    if (!raw) {
      raw = strings.slice(0);
    }

    return Object.freeze(Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    }));
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  function hideOnClickOutside(container, popup) {
    function outsideClickListener(event) {
      var hidden = container.classList.contains("hidden");

      if (!hidden && !popup.contains(event.target)) {
        container.classList.add("hidden");
        document.removeEventListener('click', outsideClickListener);
      }
    }

    document.addEventListener('click', outsideClickListener);
  }

  function setup_modal(button, container, popup, close) {
    button.addEventListener('click', function (event) {
      container.classList.remove("hidden");
      event.stopPropagation();
      hideOnClickOutside(container, popup);
    });
    close.addEventListener('click', function (event) {
      container.classList.add("hidden");
    });
  }

  function setup_modals(modals) {
    modals.forEach(function (m) {
      setup_modal(m.button, m.container, m.popup, m.close);
    });
  }

  function setup_top_nav() {
    setup_modals([{
      button: document.getElementById("saved-reports-button"),
      container: document.getElementById("saved-reports-popup"),
      popup: document.getElementById("saved-reports-popup").querySelector(".popup"),
      close: document.getElementById("saved-reports-popup").querySelector(".popup-close")
    }, {
      button: document.getElementById("settings-button"),
      container: document.getElementById("settings-popup"),
      popup: document.getElementById("settings-popup").querySelector(".popup"),
      close: document.getElementById("settings-popup").querySelector(".popup-close")
    }]);
  }

  function hideAll(dropdowns) {
    dropdowns.forEach(function (d) {
      d.menu.classList.add("invisible");
      d.button.classList.remove("dd-button-highlight");
    });
  }

  function hideOnClickOutside$1(menu, button) {
    function outsideClickListener(event) {
      var hidden = menu.classList.contains("invisible");

      if (!hidden && !menu.contains(event.target)) {
        menu.classList.add("invisible");
        button.classList.remove("dd-button-highlight");
        document.removeEventListener('click', outsideClickListener);
      }
    }

    document.addEventListener('click', outsideClickListener);
  }

  function setup_dropdown(dropdowns, button, menu) {
    var button_width = button.offsetWidth + 8,
        menu_width = menu.offsetWidth;
    menu.style.left = button_width - menu_width + "px";
    button.addEventListener('click', function (event) {
      if (menu.classList.contains("invisible")) {
        hideAll(dropdowns);
        button.classList.add("dd-button-highlight");
        menu.classList.remove("invisible");
        event.stopPropagation();
        hideOnClickOutside$1(menu, button);
      } else {
        menu.classList.add("invisible");
        button.classList.remove("dd-button-highlight");
      }
    });
  }

  function setup_dropdowns(dropdowns) {
    dropdowns.forEach(function (d) {
      setup_dropdown(dropdowns, d.button, d.menu);
    });
  }

  var tests = {
    diseases: {
      name: "Chronic disease statistics",
      fieldsFile: "/assets/static/chronic_diseases.fields.csv",
      dataFile: "/assets/static/chronic_diseases.csv"
    }
  };

  var part1 = document.getElementById("report-loader-part1"),
      load_part1_bar = part1.querySelector(".report-loader-bar-complete"),
      load_part1_desc = part1.querySelector(".report-loader-part-desc"),
      loader_part1 = {
    bar: load_part1_bar,
    desc: load_part1_desc
  };
  var part2 = document.getElementById("report-loader-part2"),
      load_part2_bar = part2.querySelector(".report-loader-bar-complete"),
      load_part2_desc = part2.querySelector(".report-loader-part-desc"),
      loader_part2 = {
    bar: load_part2_bar,
    desc: load_part2_desc
  };
  var part3 = document.getElementById("report-loader-part3"),
      load_part3_bar = part3.querySelector(".report-loader-bar-complete"),
      load_part3_desc = part3.querySelector(".report-loader-part-desc"),
      loader_part3 = {
    bar: load_part3_bar,
    desc: load_part3_desc
  };

  // 7.2.9 SameValue(x, y)
  var _sameValue = Object.is || function is(x, y) {
    // eslint-disable-next-line no-self-compare
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  };

  // @@search logic
  _fixReWks('search', 1, function (defined, SEARCH, $search, maybeCallNative) {
    return [
      // `String.prototype.search` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.search
      function search(regexp) {
        var O = defined(this);
        var fn = regexp == undefined ? undefined : regexp[SEARCH];
        return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
      },
      // `RegExp.prototype[@@search]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@search
      function (regexp) {
        var res = maybeCallNative($search, regexp, this);
        if (res.done) return res.value;
        var rx = _anObject(regexp);
        var S = String(this);
        var previousLastIndex = rx.lastIndex;
        if (!_sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
        var result = _regexpExecAbstract(rx, S);
        if (!_sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
        return result === null ? -1 : result.index;
      }
    ];
  });

  function query_var(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');

      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }

    return "";
  }

  // fallback for non-array-like ES3 and non-enumerable old V8 strings

  // eslint-disable-next-line no-prototype-builtins
  var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return _cof(it) == 'String' ? it.split('') : Object(it);
  };

  // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject = function (it) {
    return _iobject(_defined(it));
  };

  var max = Math.max;
  var min$1 = Math.min;
  var _toAbsoluteIndex = function (index, length) {
    index = _toInteger(index);
    return index < 0 ? max(index + length, 0) : min$1(index, length);
  };

  // false -> Array#indexOf
  // true  -> Array#includes



  var _arrayIncludes = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = _toIobject($this);
      var length = _toLength(O.length);
      var index = _toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var shared = _shared('keys');

  var _sharedKey = function (key) {
    return shared[key] || (shared[key] = _uid(key));
  };

  var arrayIndexOf = _arrayIncludes(false);
  var IE_PROTO = _sharedKey('IE_PROTO');

  var _objectKeysInternal = function (object, names) {
    var O = _toIobject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };

  // IE 8- don't enum bug keys
  var _enumBugKeys = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)



  var _objectKeys = Object.keys || function keys(O) {
    return _objectKeysInternal(O, _enumBugKeys);
  };

  var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    _anObject(O);
    var keys = _objectKeys(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
    return O;
  };

  var document$2 = _global.document;
  var _html = document$2 && document$2.documentElement;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



  var IE_PROTO$1 = _sharedKey('IE_PROTO');
  var Empty = function () { /* empty */ };
  var PROTOTYPE$1 = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = _domCreate('iframe');
    var i = _enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    _html.appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
    return createDict();
  };

  var _objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE$1] = _anObject(O);
      result = new Empty();
      Empty[PROTOTYPE$1] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = createDict();
    return Properties === undefined ? result : _objectDps(result, Properties);
  };

  var _redefineAll = function (target, src, safe) {
    for (var key in src) _redefine(target, key, src[key], safe);
    return target;
  };

  var _anInstance = function (it, Constructor, name, forbiddenField) {
    if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
      throw TypeError(name + ': incorrect invocation!');
    } return it;
  };

  // call something on iterator step with safe closing on error

  var _iterCall = function (iterator, fn, value, entries) {
    try {
      return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
    // 7.4.6 IteratorClose(iterator, completion)
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined) _anObject(ret.call(iterator));
      throw e;
    }
  };

  var _iterators = {};

  // check on default Array iterator

  var ITERATOR = _wks('iterator');
  var ArrayProto = Array.prototype;

  var _isArrayIter = function (it) {
    return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR] === it);
  };

  var ITERATOR$1 = _wks('iterator');

  var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
    if (it != undefined) return it[ITERATOR$1]
      || it['@@iterator']
      || _iterators[_classof(it)];
  };

  var _forOf = createCommonjsModule(function (module) {
  var BREAK = {};
  var RETURN = {};
  var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
    var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
    var f = _ctx(fn, that, entries ? 2 : 1);
    var index = 0;
    var length, step, iterator, result;
    if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
    // fast case for arrays with default iterator
    if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
      result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      if (result === BREAK || result === RETURN) return result;
    } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
      result = _iterCall(iterator, f, step.value, entries);
      if (result === BREAK || result === RETURN) return result;
    }
  };
  exports.BREAK = BREAK;
  exports.RETURN = RETURN;
  });

  var def = _objectDp.f;

  var TAG$1 = _wks('toStringTag');

  var _setToStringTag = function (it, tag, stat) {
    if (it && !_has(it = stat ? it : it.prototype, TAG$1)) def(it, TAG$1, { configurable: true, value: tag });
  };

  var IteratorPrototype = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  _hide(IteratorPrototype, _wks('iterator'), function () { return this; });

  var _iterCreate = function (Constructor, NAME, next) {
    Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
    _setToStringTag(Constructor, NAME + ' Iterator');
  };

  // 7.1.13 ToObject(argument)

  var _toObject = function (it) {
    return Object(_defined(it));
  };

  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


  var IE_PROTO$2 = _sharedKey('IE_PROTO');
  var ObjectProto = Object.prototype;

  var _objectGpo = Object.getPrototypeOf || function (O) {
    O = _toObject(O);
    if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  };

  var ITERATOR$2 = _wks('iterator');
  var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
  var FF_ITERATOR = '@@iterator';
  var KEYS = 'keys';
  var VALUES = 'values';

  var returnThis = function () { return this; };

  var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    _iterCreate(Constructor, NAME, next);
    var getMethod = function (kind) {
      if (!BUGGY && kind in proto) return proto[kind];
      switch (kind) {
        case KEYS: return function keys() { return new Constructor(this, kind); };
        case VALUES: return function values() { return new Constructor(this, kind); };
      } return function entries() { return new Constructor(this, kind); };
    };
    var TAG = NAME + ' Iterator';
    var DEF_VALUES = DEFAULT == VALUES;
    var VALUES_BUG = false;
    var proto = Base.prototype;
    var $native = proto[ITERATOR$2] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
    var $default = $native || getMethod(DEFAULT);
    var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    var methods, key, IteratorPrototype;
    // Fix native
    if ($anyNative) {
      IteratorPrototype = _objectGpo($anyNative.call(new Base()));
      if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
        // Set @@toStringTag to native iterators
        _setToStringTag(IteratorPrototype, TAG, true);
        // fix for some old engines
        if ( typeof IteratorPrototype[ITERATOR$2] != 'function') _hide(IteratorPrototype, ITERATOR$2, returnThis);
      }
    }
    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEF_VALUES && $native && $native.name !== VALUES) {
      VALUES_BUG = true;
      $default = function values() { return $native.call(this); };
    }
    // Define iterator
    if ( (BUGGY || VALUES_BUG || !proto[ITERATOR$2])) {
      _hide(proto, ITERATOR$2, $default);
    }
    // Plug for library
    _iterators[NAME] = $default;
    _iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: $entries
      };
      if (FORCED) for (key in methods) {
        if (!(key in proto)) _redefine(proto, key, methods[key]);
      } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };

  var _iterStep = function (done, value) {
    return { value: value, done: !!done };
  };

  var SPECIES$2 = _wks('species');

  var _setSpecies = function (KEY) {
    var C = _global[KEY];
    if (_descriptors && C && !C[SPECIES$2]) _objectDp.f(C, SPECIES$2, {
      configurable: true,
      get: function () { return this; }
    });
  };

  var _meta = createCommonjsModule(function (module) {
  var META = _uid('meta');


  var setDesc = _objectDp.f;
  var id = 0;
  var isExtensible = Object.isExtensible || function () {
    return true;
  };
  var FREEZE = !_fails(function () {
    return isExtensible(Object.preventExtensions({}));
  });
  var setMeta = function (it) {
    setDesc(it, META, { value: {
      i: 'O' + ++id, // object ID
      w: {}          // weak collections IDs
    } });
  };
  var fastKey = function (it, create) {
    // return primitive with prefix
    if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F';
      // not necessary to add metadata
      if (!create) return 'E';
      // add missing metadata
      setMeta(it);
    // return object ID
    } return it[META].i;
  };
  var getWeak = function (it, create) {
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true;
      // not necessary to add metadata
      if (!create) return false;
      // add missing metadata
      setMeta(it);
    // return hash weak collections IDs
    } return it[META].w;
  };
  // add metadata on freeze-family methods calling
  var onFreeze = function (it) {
    if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
    return it;
  };
  var meta = module.exports = {
    KEY: META,
    NEED: false,
    fastKey: fastKey,
    getWeak: getWeak,
    onFreeze: onFreeze
  };
  });
  var _meta_1 = _meta.KEY;
  var _meta_2 = _meta.NEED;
  var _meta_3 = _meta.fastKey;
  var _meta_4 = _meta.getWeak;
  var _meta_5 = _meta.onFreeze;

  var _validateCollection = function (it, TYPE) {
    if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
    return it;
  };

  var dP$2 = _objectDp.f;









  var fastKey = _meta.fastKey;

  var SIZE = _descriptors ? '_s' : 'size';

  var getEntry = function (that, key) {
    // fast case
    var index = fastKey(key);
    var entry;
    if (index !== 'F') return that._i[index];
    // frozen object case
    for (entry = that._f; entry; entry = entry.n) {
      if (entry.k == key) return entry;
    }
  };

  var _collectionStrong = {
    getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
      var C = wrapper(function (that, iterable) {
        _anInstance(that, C, NAME, '_i');
        that._t = NAME;         // collection type
        that._i = _objectCreate(null); // index
        that._f = undefined;    // first entry
        that._l = undefined;    // last entry
        that[SIZE] = 0;         // size
        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
      });
      _redefineAll(C.prototype, {
        // 23.1.3.1 Map.prototype.clear()
        // 23.2.3.2 Set.prototype.clear()
        clear: function clear() {
          for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
            entry.r = true;
            if (entry.p) entry.p = entry.p.n = undefined;
            delete data[entry.i];
          }
          that._f = that._l = undefined;
          that[SIZE] = 0;
        },
        // 23.1.3.3 Map.prototype.delete(key)
        // 23.2.3.4 Set.prototype.delete(value)
        'delete': function (key) {
          var that = _validateCollection(this, NAME);
          var entry = getEntry(that, key);
          if (entry) {
            var next = entry.n;
            var prev = entry.p;
            delete that._i[entry.i];
            entry.r = true;
            if (prev) prev.n = next;
            if (next) next.p = prev;
            if (that._f == entry) that._f = next;
            if (that._l == entry) that._l = prev;
            that[SIZE]--;
          } return !!entry;
        },
        // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
        // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
        forEach: function forEach(callbackfn /* , that = undefined */) {
          _validateCollection(this, NAME);
          var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
          var entry;
          while (entry = entry ? entry.n : this._f) {
            f(entry.v, entry.k, this);
            // revert to the last existing entry
            while (entry && entry.r) entry = entry.p;
          }
        },
        // 23.1.3.7 Map.prototype.has(key)
        // 23.2.3.7 Set.prototype.has(value)
        has: function has(key) {
          return !!getEntry(_validateCollection(this, NAME), key);
        }
      });
      if (_descriptors) dP$2(C.prototype, 'size', {
        get: function () {
          return _validateCollection(this, NAME)[SIZE];
        }
      });
      return C;
    },
    def: function (that, key, value) {
      var entry = getEntry(that, key);
      var prev, index;
      // change existing entry
      if (entry) {
        entry.v = value;
      // create new entry
      } else {
        that._l = entry = {
          i: index = fastKey(key, true), // <- index
          k: key,                        // <- key
          v: value,                      // <- value
          p: prev = that._l,             // <- previous entry
          n: undefined,                  // <- next entry
          r: false                       // <- removed
        };
        if (!that._f) that._f = entry;
        if (prev) prev.n = entry;
        that[SIZE]++;
        // add to index
        if (index !== 'F') that._i[index] = entry;
      } return that;
    },
    getEntry: getEntry,
    setStrong: function (C, NAME, IS_MAP) {
      // add .keys, .values, .entries, [@@iterator]
      // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
      _iterDefine(C, NAME, function (iterated, kind) {
        this._t = _validateCollection(iterated, NAME); // target
        this._k = kind;                     // kind
        this._l = undefined;                // previous
      }, function () {
        var that = this;
        var kind = that._k;
        var entry = that._l;
        // revert to the last existing entry
        while (entry && entry.r) entry = entry.p;
        // get next entry
        if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
          // or finish the iteration
          that._t = undefined;
          return _iterStep(1);
        }
        // return step by kind
        if (kind == 'keys') return _iterStep(0, entry.k);
        if (kind == 'values') return _iterStep(0, entry.v);
        return _iterStep(0, [entry.k, entry.v]);
      }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

      // add [@@species], 23.1.2.2, 23.2.2.2
      _setSpecies(NAME);
    }
  };

  var ITERATOR$3 = _wks('iterator');
  var SAFE_CLOSING = false;

  try {
    var riter = [7][ITERATOR$3]();
    riter['return'] = function () { SAFE_CLOSING = true; };
    // eslint-disable-next-line no-throw-literal
    Array.from(riter, function () { throw 2; });
  } catch (e) { /* empty */ }

  var _iterDetect = function (exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING) return false;
    var safe = false;
    try {
      var arr = [7];
      var iter = arr[ITERATOR$3]();
      iter.next = function () { return { done: safe = true }; };
      arr[ITERATOR$3] = function () { return iter; };
      exec(arr);
    } catch (e) { /* empty */ }
    return safe;
  };

  var f$1 = {}.propertyIsEnumerable;

  var _objectPie = {
  	f: f$1
  };

  var gOPD = Object.getOwnPropertyDescriptor;

  var f$2 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
    O = _toIobject(O);
    P = _toPrimitive(P, true);
    if (_ie8DomDefine) try {
      return gOPD(O, P);
    } catch (e) { /* empty */ }
    if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
  };

  var _objectGopd = {
  	f: f$2
  };

  // Works with __proto__ only. Old v8 can't work with null proto objects.
  /* eslint-disable no-proto */


  var check = function (O, proto) {
    _anObject(O);
    if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
  };
  var _setProto = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
      function (test, buggy, set) {
        try {
          set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
          set(test, []);
          buggy = !(test instanceof Array);
        } catch (e) { buggy = true; }
        return function setPrototypeOf(O, proto) {
          check(O, proto);
          if (buggy) O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }({}, false) : undefined),
    check: check
  };

  var setPrototypeOf = _setProto.set;
  var _inheritIfRequired = function (that, target, C) {
    var S = target.constructor;
    var P;
    if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf) {
      setPrototypeOf(that, P);
    } return that;
  };

  var _collection = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
    var Base = _global[NAME];
    var C = Base;
    var ADDER = IS_MAP ? 'set' : 'add';
    var proto = C && C.prototype;
    var O = {};
    var fixMethod = function (KEY) {
      var fn = proto[KEY];
      _redefine(proto, KEY,
        KEY == 'delete' ? function (a) {
          return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
        } : KEY == 'has' ? function has(a) {
          return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
        } : KEY == 'get' ? function get(a) {
          return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
        } : KEY == 'add' ? function add(a) { fn.call(this, a === 0 ? 0 : a); return this; }
          : function set(a, b) { fn.call(this, a === 0 ? 0 : a, b); return this; }
      );
    };
    if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
      new C().entries().next();
    }))) {
      // create collection constructor
      C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
      _redefineAll(C.prototype, methods);
      _meta.NEED = true;
    } else {
      var instance = new C();
      // early implementations not supports chaining
      var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
      var THROWS_ON_PRIMITIVES = _fails(function () { instance.has(1); });
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      var ACCEPT_ITERABLES = _iterDetect(function (iter) { new C(iter); }); // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same
      var BUGGY_ZERO = !IS_WEAK && _fails(function () {
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C();
        var index = 5;
        while (index--) $instance[ADDER](index, index);
        return !$instance.has(-0);
      });
      if (!ACCEPT_ITERABLES) {
        C = wrapper(function (target, iterable) {
          _anInstance(target, C, NAME);
          var that = _inheritIfRequired(new Base(), target, C);
          if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
          return that;
        });
        C.prototype = proto;
        proto.constructor = C;
      }
      if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
        fixMethod('delete');
        fixMethod('has');
        IS_MAP && fixMethod('get');
      }
      if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
      // weak collections should not contains .clear method
      if (IS_WEAK && proto.clear) delete proto.clear;
    }

    _setToStringTag(C, NAME);

    O[NAME] = C;
    _export(_export.G + _export.W + _export.F * (C != Base), O);

    if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

    return C;
  };

  var MAP = 'Map';

  // 23.1 Map Objects
  var es6_map = _collection(MAP, function (get) {
    return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
  }, {
    // 23.1.3.6 Map.prototype.get(key)
    get: function get(key) {
      var entry = _collectionStrong.getEntry(_validateCollection(this, MAP), key);
      return entry && entry.v;
    },
    // 23.1.3.9 Map.prototype.set(key, value)
    set: function set(key, value) {
      return _collectionStrong.def(_validateCollection(this, MAP), key === 0 ? 0 : key, value);
    }
  }, _collectionStrong, true);

  // 22.1.3.31 Array.prototype[@@unscopables]
  var UNSCOPABLES = _wks('unscopables');
  var ArrayProto$1 = Array.prototype;
  if (ArrayProto$1[UNSCOPABLES] == undefined) _hide(ArrayProto$1, UNSCOPABLES, {});
  var _addToUnscopables = function (key) {
    ArrayProto$1[UNSCOPABLES][key] = true;
  };

  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
    this._t = _toIobject(iterated); // target
    this._i = 0;                   // next index
    this._k = kind;                // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var kind = this._k;
    var index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return _iterStep(1);
    }
    if (kind == 'keys') return _iterStep(0, index);
    if (kind == 'values') return _iterStep(0, O[index]);
    return _iterStep(0, [index, O[index]]);
  }, 'values');

  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  _iterators.Arguments = _iterators.Array;

  _addToUnscopables('keys');
  _addToUnscopables('values');
  _addToUnscopables('entries');

  var ITERATOR$4 = _wks('iterator');
  var TO_STRING_TAG = _wks('toStringTag');
  var ArrayValues = _iterators.Array;

  var DOMIterables = {
    CSSRuleList: true, // TODO: Not spec compliant, should be false.
    CSSStyleDeclaration: false,
    CSSValueList: false,
    ClientRectList: false,
    DOMRectList: false,
    DOMStringList: false,
    DOMTokenList: true,
    DataTransferItemList: false,
    FileList: false,
    HTMLAllCollection: false,
    HTMLCollection: false,
    HTMLFormElement: false,
    HTMLSelectElement: false,
    MediaList: true, // TODO: Not spec compliant, should be false.
    MimeTypeArray: false,
    NamedNodeMap: false,
    NodeList: true,
    PaintRequestList: false,
    Plugin: false,
    PluginArray: false,
    SVGLengthList: false,
    SVGNumberList: false,
    SVGPathSegList: false,
    SVGPointList: false,
    SVGStringList: false,
    SVGTransformList: false,
    SourceBufferList: false,
    StyleSheetList: true, // TODO: Not spec compliant, should be false.
    TextTrackCueList: false,
    TextTrackList: false,
    TouchList: false
  };

  for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
    var NAME$1 = collections[i];
    var explicit = DOMIterables[NAME$1];
    var Collection = _global[NAME$1];
    var proto = Collection && Collection.prototype;
    var key;
    if (proto) {
      if (!proto[ITERATOR$4]) _hide(proto, ITERATOR$4, ArrayValues);
      if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME$1);
      _iterators[NAME$1] = ArrayValues;
      if (explicit) for (key in es6_array_iterator) if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
    }
  }

  // 19.1.3.6 Object.prototype.toString()

  var test = {};
  test[_wks('toStringTag')] = 'z';
  if (test + '' != '[object z]') {
    _redefine(Object.prototype, 'toString', function toString() {
      return '[object ' + _classof(this) + ']';
    }, true);
  }

  var $at = _stringAt(true);

  // 21.1.3.27 String.prototype[@@iterator]()
  _iterDefine(String, 'String', function (iterated) {
    this._t = String(iterated); // target
    this._i = 0;                // next index
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var index = this._i;
    var point;
    if (index >= O.length) return { value: undefined, done: true };
    point = $at(O, index);
    this._i += point.length;
    return { value: point, done: false };
  });

  var SET = 'Set';

  // 23.2 Set Objects
  var es6_set = _collection(SET, function (get) {
    return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
  }, {
    // 23.2.3.1 Set.prototype.add(value)
    add: function add(value) {
      return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
    }
  }, _collectionStrong);

  function organize_fields(fields) {
    // Need at least 2 rows
    if (fields.length < 1) {
      return {
        isMalformed: true
      };
    } // Header needs to look like this:
    // Field, Description, Caption, Type, Distribution


    var header = fields[0];

    if (header.length < 9) {
      return {
        isMalformed: true
      };
    }

    if (header[0] !== "Field" || header[1] !== "Description" || header[2] !== "Caption" || header[3] !== "Type" || header[4] !== "Distribution" || header[5] !== "TotalUnique" || header[6] !== "Avg" || header[7] !== "Min" || header[8] !== "Max") {
      return {
        isMalformed: true
      };
    } // Create a map of the fields


    fields = fields.slice(1).map(function (field) {
      return {
        field: field[0],
        description: field[1],
        caption: field[2],
        type: field[3],
        distribution: field[4],
        totalUnique: +field[5],
        avg: field[6] !== "" ? +field[6] : null,
        min: field[7] !== "" ? +field[7] : null,
        max: field[8] !== "" ? +field[8] : null,
        index: -1
      };
    }); // Collect all categorical (grouped) fields

    var categorical = fields.filter(function (field) {
      return field.distribution === "grouped";
    }).map(function (field) {
      return field.field;
    }); // Collect all numerical random fields

    var numerical_random = fields.filter(function (field) {
      var numerical = field.type === "numerical" || field.type === "percent";
      return numerical && field.distribution === "random";
    }).map(function (field) {
      return field.field;
    });
    return {
      all: fields,
      categorical: categorical,
      numericalRandom: numerical_random,
      isMalformed: false
    };
  }

  function match_header_to_fields(fields, header) {
    // Map all of the fields
    var fields_map = new Map(fields.all.map(function (field) {
      return [field.field, field];
    })); // Match each non-empty column to a field description

    for (var i = 0; i < header.length; i++) {
      var col = header[i];
      if (col.length == 0) continue;
      if (!fields_map.has(col)) return null;
      var field = fields_map.get(col);
      field.index = i;
      fields_map.set(col, field);
    } // Return new format


    fields.get = function (field) {
      return fields_map.get(field);
    };

    return fields;
  }

  function canUseOne(fields, templates) {
    for (var i = 0; i < templates.length; i++) {
      if (templates[i].canUse(fields)) return true;
    }

    return false;
  }

  function usableSections(fields, sections) {
    return sections.filter(function (s) {
      return s.canUse(fields);
    });
  }

  function insertSections(root, sections) {
    var elements = root.getElementsByClassName("section");

    for (var i = 0; i < sections.length; i++) {
      var element = elements[i];
      element.appendChild(sections[i]);
      element.classList.remove("hide");
    }

    return root;
  }

  var lib = {
    canUseOne: canUseOne,
    filterForUsable: usableSections,
    insertAll: insertSections
  };

  var parser = new DOMParser();

  function parse(templateText) {
    var doc = parser.parseFromString(templateText, "text/html");
    return doc.body.firstChild;
  }

  var lib_template = {
    parseTemplate: parse
  };

  function canUseAny(fields, templates) {
    for (var i = 0; i < templates.length; i++) {
      if (templates[i].canUse(fields)) return true;
    }

    return false;
  }

  function usableTemplates(fields, templates) {
    return templates.filter(function (t) {
      return t.canUse(fields);
    });
  }

  function insertTemplates(root, templates) {
    var elements = root.getElementsByClassName("template");

    for (var i = 0; i < templates.length; i++) {
      var element = elements[i];
      element.appendChild(templates[i]);
      element.classList.remove("hide");
    }

    return root;
  }

  var lib$1 = {
    canUseAny: canUseAny,
    filterForUsable: usableTemplates,
    insertAll: insertTemplates
  };

  var f$3 = Object.getOwnPropertySymbols;

  var _objectGops = {
  	f: f$3
  };

  // 19.1.2.1 Object.assign(target, source, ...)






  var $assign = Object.assign;

  // should work with symbols and should have deterministic property order (V8 bug)
  var _objectAssign = !$assign || _fails(function () {
    var A = {};
    var B = {};
    // eslint-disable-next-line no-undef
    var S = Symbol();
    var K = 'abcdefghijklmnopqrst';
    A[S] = 7;
    K.split('').forEach(function (k) { B[k] = k; });
    return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
  }) ? function assign(target, source) { // eslint-disable-line no-unused-vars
    var T = _toObject(target);
    var aLen = arguments.length;
    var index = 1;
    var getSymbols = _objectGops.f;
    var isEnum = _objectPie.f;
    while (aLen > index) {
      var S = _iobject(arguments[index++]);
      var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
      var length = keys.length;
      var j = 0;
      var key;
      while (length > j) {
        key = keys[j++];
        if (!_descriptors || isEnum.call(S, key)) T[key] = S[key];
      }
    } return T;
  } : $assign;

  // 19.1.3.1 Object.assign(target, source)


  _export(_export.S + _export.F, 'Object', { assign: _objectAssign });

  _export(_export.S, 'String', {
    // 21.1.2.4 String.raw(callSite, ...substitutions)
    raw: function raw(callSite) {
      var tpl = _toIobject(callSite.raw);
      var len = _toLength(tpl.length);
      var aLen = arguments.length;
      var res = [];
      var i = 0;
      while (len > i) {
        res.push(String(tpl[i++]));
        if (i < aLen) res.push(String(arguments[i]));
      } return res.join('');
    }
  });

  // helper for String#{startsWith, endsWith, includes}



  var _stringContext = function (that, searchString, NAME) {
    if (_isRegexp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
    return String(_defined(that));
  };

  var MATCH$1 = _wks('match');
  var _failsIsRegexp = function (KEY) {
    var re = /./;
    try {
      '/./'[KEY](re);
    } catch (e) {
      try {
        re[MATCH$1] = false;
        return !'/./'[KEY](re);
      } catch (f) { /* empty */ }
    } return true;
  };

  var STARTS_WITH = 'startsWith';
  var $startsWith = ''[STARTS_WITH];

  _export(_export.P + _export.F * _failsIsRegexp(STARTS_WITH), 'String', {
    startsWith: function startsWith(searchString /* , position = 0 */) {
      var that = _stringContext(this, searchString, STARTS_WITH);
      var index = _toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
      var search = String(searchString);
      return $startsWith
        ? $startsWith.call(that, search, index)
        : that.slice(index, index + search.length) === search;
    }
  });

  // fast apply, http://jsperf.lnkit.com/fast-apply/5
  var _invoke = function (fn, args, that) {
    var un = that === undefined;
    switch (args.length) {
      case 0: return un ? fn()
                        : fn.call(that);
      case 1: return un ? fn(args[0])
                        : fn.call(that, args[0]);
      case 2: return un ? fn(args[0], args[1])
                        : fn.call(that, args[0], args[1]);
      case 3: return un ? fn(args[0], args[1], args[2])
                        : fn.call(that, args[0], args[1], args[2]);
      case 4: return un ? fn(args[0], args[1], args[2], args[3])
                        : fn.call(that, args[0], args[1], args[2], args[3]);
    } return fn.apply(that, args);
  };

  var process = _global.process;
  var setTask = _global.setImmediate;
  var clearTask = _global.clearImmediate;
  var MessageChannel = _global.MessageChannel;
  var Dispatch = _global.Dispatch;
  var counter = 0;
  var queue = {};
  var ONREADYSTATECHANGE = 'onreadystatechange';
  var defer, channel, port;
  var run = function () {
    var id = +this;
    // eslint-disable-next-line no-prototype-builtins
    if (queue.hasOwnProperty(id)) {
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  };
  var listener = function (event) {
    run.call(event.data);
  };
  // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
  if (!setTask || !clearTask) {
    setTask = function setImmediate(fn) {
      var args = [];
      var i = 1;
      while (arguments.length > i) args.push(arguments[i++]);
      queue[++counter] = function () {
        // eslint-disable-next-line no-new-func
        _invoke(typeof fn == 'function' ? fn : Function(fn), args);
      };
      defer(counter);
      return counter;
    };
    clearTask = function clearImmediate(id) {
      delete queue[id];
    };
    // Node.js 0.8-
    if (_cof(process) == 'process') {
      defer = function (id) {
        process.nextTick(_ctx(run, id, 1));
      };
    // Sphere (JS game engine) Dispatch API
    } else if (Dispatch && Dispatch.now) {
      defer = function (id) {
        Dispatch.now(_ctx(run, id, 1));
      };
    // Browsers with MessageChannel, includes WebWorkers
    } else if (MessageChannel) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = listener;
      defer = _ctx(port.postMessage, port, 1);
    // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
      defer = function (id) {
        _global.postMessage(id + '', '*');
      };
      _global.addEventListener('message', listener, false);
    // IE8-
    } else if (ONREADYSTATECHANGE in _domCreate('script')) {
      defer = function (id) {
        _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
          _html.removeChild(this);
          run.call(id);
        };
      };
    // Rest old browsers
    } else {
      defer = function (id) {
        setTimeout(_ctx(run, id, 1), 0);
      };
    }
  }
  var _task = {
    set: setTask,
    clear: clearTask
  };

  var macrotask = _task.set;
  var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
  var process$1 = _global.process;
  var Promise$1 = _global.Promise;
  var isNode = _cof(process$1) == 'process';

  var _microtask = function () {
    var head, last, notify;

    var flush = function () {
      var parent, fn;
      if (isNode && (parent = process$1.domain)) parent.exit();
      while (head) {
        fn = head.fn;
        head = head.next;
        try {
          fn();
        } catch (e) {
          if (head) notify();
          else last = undefined;
          throw e;
        }
      } last = undefined;
      if (parent) parent.enter();
    };

    // Node.js
    if (isNode) {
      notify = function () {
        process$1.nextTick(flush);
      };
    // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
    } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
      var toggle = true;
      var node = document.createTextNode('');
      new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
      notify = function () {
        node.data = toggle = !toggle;
      };
    // environments with maybe non-completely correct, but existent Promise
    } else if (Promise$1 && Promise$1.resolve) {
      // Promise.resolve without an argument throws an error in LG WebOS 2
      var promise = Promise$1.resolve(undefined);
      notify = function () {
        promise.then(flush);
      };
    // for other environments - macrotask based on:
    // - setImmediate
    // - MessageChannel
    // - window.postMessag
    // - onreadystatechange
    // - setTimeout
    } else {
      notify = function () {
        // strange IE + webpack dev server bug - use .call(global)
        macrotask.call(_global, flush);
      };
    }

    return function (fn) {
      var task = { fn: fn, next: undefined };
      if (last) last.next = task;
      if (!head) {
        head = task;
        notify();
      } last = task;
    };
  };

  // 25.4.1.5 NewPromiseCapability(C)


  function PromiseCapability(C) {
    var resolve, reject;
    this.promise = new C(function ($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = _aFunction(resolve);
    this.reject = _aFunction(reject);
  }

  var f$4 = function (C) {
    return new PromiseCapability(C);
  };

  var _newPromiseCapability = {
  	f: f$4
  };

  var _perform = function (exec) {
    try {
      return { e: false, v: exec() };
    } catch (e) {
      return { e: true, v: e };
    }
  };

  var navigator = _global.navigator;

  var _userAgent = navigator && navigator.userAgent || '';

  var _promiseResolve = function (C, x) {
    _anObject(C);
    if (_isObject(x) && x.constructor === C) return x;
    var promiseCapability = _newPromiseCapability.f(C);
    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var task = _task.set;
  var microtask = _microtask();




  var PROMISE = 'Promise';
  var TypeError$1 = _global.TypeError;
  var process$2 = _global.process;
  var versions = process$2 && process$2.versions;
  var v8 = versions && versions.v8 || '';
  var $Promise = _global[PROMISE];
  var isNode$1 = _classof(process$2) == 'process';
  var empty = function () { /* empty */ };
  var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
  var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

  var USE_NATIVE = !!function () {
    try {
      // correct subclassing with @@species support
      var promise = $Promise.resolve(1);
      var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
        exec(empty, empty);
      };
      // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
      return (isNode$1 || typeof PromiseRejectionEvent == 'function')
        && promise.then(empty) instanceof FakePromise
        // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
        // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
        // we can't detect it synchronously, so just check versions
        && v8.indexOf('6.6') !== 0
        && _userAgent.indexOf('Chrome/66') === -1;
    } catch (e) { /* empty */ }
  }();

  // helpers
  var isThenable = function (it) {
    var then;
    return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
  };
  var notify = function (promise, isReject) {
    if (promise._n) return;
    promise._n = true;
    var chain = promise._c;
    microtask(function () {
      var value = promise._v;
      var ok = promise._s == 1;
      var i = 0;
      var run = function (reaction) {
        var handler = ok ? reaction.ok : reaction.fail;
        var resolve = reaction.resolve;
        var reject = reaction.reject;
        var domain = reaction.domain;
        var result, then, exited;
        try {
          if (handler) {
            if (!ok) {
              if (promise._h == 2) onHandleUnhandled(promise);
              promise._h = 1;
            }
            if (handler === true) result = value;
            else {
              if (domain) domain.enter();
              result = handler(value); // may throw
              if (domain) {
                domain.exit();
                exited = true;
              }
            }
            if (result === reaction.promise) {
              reject(TypeError$1('Promise-chain cycle'));
            } else if (then = isThenable(result)) {
              then.call(result, resolve, reject);
            } else resolve(result);
          } else reject(value);
        } catch (e) {
          if (domain && !exited) domain.exit();
          reject(e);
        }
      };
      while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
      promise._c = [];
      promise._n = false;
      if (isReject && !promise._h) onUnhandled(promise);
    });
  };
  var onUnhandled = function (promise) {
    task.call(_global, function () {
      var value = promise._v;
      var unhandled = isUnhandled(promise);
      var result, handler, console;
      if (unhandled) {
        result = _perform(function () {
          if (isNode$1) {
            process$2.emit('unhandledRejection', value, promise);
          } else if (handler = _global.onunhandledrejection) {
            handler({ promise: promise, reason: value });
          } else if ((console = _global.console) && console.error) {
            console.error('Unhandled promise rejection', value);
          }
        });
        // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
        promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
      } promise._a = undefined;
      if (unhandled && result.e) throw result.v;
    });
  };
  var isUnhandled = function (promise) {
    return promise._h !== 1 && (promise._a || promise._c).length === 0;
  };
  var onHandleUnhandled = function (promise) {
    task.call(_global, function () {
      var handler;
      if (isNode$1) {
        process$2.emit('rejectionHandled', promise);
      } else if (handler = _global.onrejectionhandled) {
        handler({ promise: promise, reason: promise._v });
      }
    });
  };
  var $reject = function (value) {
    var promise = this;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap
    promise._v = value;
    promise._s = 2;
    if (!promise._a) promise._a = promise._c.slice();
    notify(promise, true);
  };
  var $resolve = function (value) {
    var promise = this;
    var then;
    if (promise._d) return;
    promise._d = true;
    promise = promise._w || promise; // unwrap
    try {
      if (promise === value) throw TypeError$1("Promise can't be resolved itself");
      if (then = isThenable(value)) {
        microtask(function () {
          var wrapper = { _w: promise, _d: false }; // wrap
          try {
            then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
          } catch (e) {
            $reject.call(wrapper, e);
          }
        });
      } else {
        promise._v = value;
        promise._s = 1;
        notify(promise, false);
      }
    } catch (e) {
      $reject.call({ _w: promise, _d: false }, e); // wrap
    }
  };

  // constructor polyfill
  if (!USE_NATIVE) {
    // 25.4.3.1 Promise(executor)
    $Promise = function Promise(executor) {
      _anInstance(this, $Promise, PROMISE, '_h');
      _aFunction(executor);
      Internal.call(this);
      try {
        executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
      } catch (err) {
        $reject.call(this, err);
      }
    };
    // eslint-disable-next-line no-unused-vars
    Internal = function Promise(executor) {
      this._c = [];             // <- awaiting reactions
      this._a = undefined;      // <- checked in isUnhandled reactions
      this._s = 0;              // <- state
      this._d = false;          // <- done
      this._v = undefined;      // <- value
      this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
      this._n = false;          // <- notify
    };
    Internal.prototype = _redefineAll($Promise.prototype, {
      // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
      then: function then(onFulfilled, onRejected) {
        var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
        reaction.fail = typeof onRejected == 'function' && onRejected;
        reaction.domain = isNode$1 ? process$2.domain : undefined;
        this._c.push(reaction);
        if (this._a) this._a.push(reaction);
        if (this._s) notify(this, false);
        return reaction.promise;
      },
      // 25.4.5.1 Promise.prototype.catch(onRejected)
      'catch': function (onRejected) {
        return this.then(undefined, onRejected);
      }
    });
    OwnPromiseCapability = function () {
      var promise = new Internal();
      this.promise = promise;
      this.resolve = _ctx($resolve, promise, 1);
      this.reject = _ctx($reject, promise, 1);
    };
    _newPromiseCapability.f = newPromiseCapability = function (C) {
      return C === $Promise || C === Wrapper
        ? new OwnPromiseCapability(C)
        : newGenericPromiseCapability(C);
    };
  }

  _export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
  _setToStringTag($Promise, PROMISE);
  _setSpecies(PROMISE);
  Wrapper = _core[PROMISE];

  // statics
  _export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
    // 25.4.4.5 Promise.reject(r)
    reject: function reject(r) {
      var capability = newPromiseCapability(this);
      var $$reject = capability.reject;
      $$reject(r);
      return capability.promise;
    }
  });
  _export(_export.S + _export.F * ( !USE_NATIVE), PROMISE, {
    // 25.4.4.6 Promise.resolve(x)
    resolve: function resolve(x) {
      return _promiseResolve( this, x);
    }
  });
  _export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
    $Promise.all(iter)['catch'](empty);
  })), PROMISE, {
    // 25.4.4.1 Promise.all(iterable)
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      var result = _perform(function () {
        var values = [];
        var index = 0;
        var remaining = 1;
        _forOf(iterable, false, function (promise) {
          var $index = index++;
          var alreadyCalled = false;
          values.push(undefined);
          remaining++;
          C.resolve(promise).then(function (value) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[$index] = value;
            --remaining || resolve(values);
          }, reject);
        });
        --remaining || resolve(values);
      });
      if (result.e) reject(result.v);
      return capability.promise;
    },
    // 25.4.4.4 Promise.race(iterable)
    race: function race(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var reject = capability.reject;
      var result = _perform(function () {
        _forOf(iterable, false, function (promise) {
          C.resolve(promise).then(capability.resolve, reject);
        });
      });
      if (result.e) reject(result.v);
      return capability.promise;
    }
  });

  var max$1 = Math.max;
  var min$2 = Math.min;
  var floor$1 = Math.floor;
  var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
  var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

  var maybeToString = function (it) {
    return it === undefined ? it : String(it);
  };

  // @@replace logic
  _fixReWks('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
    return [
      // `String.prototype.replace` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.replace
      function replace(searchValue, replaceValue) {
        var O = defined(this);
        var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
        return fn !== undefined
          ? fn.call(searchValue, O, replaceValue)
          : $replace.call(String(O), searchValue, replaceValue);
      },
      // `RegExp.prototype[@@replace]` method
      // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
      function (regexp, replaceValue) {
        var res = maybeCallNative($replace, regexp, this, replaceValue);
        if (res.done) return res.value;

        var rx = _anObject(regexp);
        var S = String(this);
        var functionalReplace = typeof replaceValue === 'function';
        if (!functionalReplace) replaceValue = String(replaceValue);
        var global = rx.global;
        if (global) {
          var fullUnicode = rx.unicode;
          rx.lastIndex = 0;
        }
        var results = [];
        while (true) {
          var result = _regexpExecAbstract(rx, S);
          if (result === null) break;
          results.push(result);
          if (!global) break;
          var matchStr = String(result[0]);
          if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
        }
        var accumulatedResult = '';
        var nextSourcePosition = 0;
        for (var i = 0; i < results.length; i++) {
          result = results[i];
          var matched = String(result[0]);
          var position = max$1(min$2(_toInteger(result.index), S.length), 0);
          var captures = [];
          // NOTE: This is equivalent to
          //   captures = result.slice(1).map(maybeToString)
          // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
          // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
          // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
          for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
          var namedCaptures = result.groups;
          if (functionalReplace) {
            var replacerArgs = [matched].concat(captures, position, S);
            if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
            var replacement = String(replaceValue.apply(undefined, replacerArgs));
          } else {
            replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
          }
          if (position >= nextSourcePosition) {
            accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
            nextSourcePosition = position + matched.length;
          }
        }
        return accumulatedResult + S.slice(nextSourcePosition);
      }
    ];

      // https://tc39.github.io/ecma262/#sec-getsubstitution
    function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
      var tailPos = position + matched.length;
      var m = captures.length;
      var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
      if (namedCaptures !== undefined) {
        namedCaptures = _toObject(namedCaptures);
        symbols = SUBSTITUTION_SYMBOLS;
      }
      return $replace.call(replacement, symbols, function (match, ch) {
        var capture;
        switch (ch.charAt(0)) {
          case '$': return '$';
          case '&': return matched;
          case '`': return str.slice(0, position);
          case "'": return str.slice(tailPos);
          case '<':
            capture = namedCaptures[ch.slice(1, -1)];
            break;
          default: // \d\d?
            var n = +ch;
            if (n === 0) return match;
            if (n > m) {
              var f = floor$1(n / 10);
              if (f === 0) return match;
              if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
              return match;
            }
            capture = captures[n - 1];
        }
        return capture === undefined ? '' : capture;
      });
    }
  });

  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

  var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

  var f$5 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return _objectKeysInternal(O, hiddenKeys);
  };

  var _objectGopn = {
  	f: f$5
  };

  var dP$3 = _objectDp.f;
  var gOPN = _objectGopn.f;


  var $RegExp = _global.RegExp;
  var Base = $RegExp;
  var proto$1 = $RegExp.prototype;
  var re1 = /a/g;
  var re2 = /a/g;
  // "new" creates a new object, old webkit buggy here
  var CORRECT_NEW = new $RegExp(re1) !== re1;

  if (_descriptors && (!CORRECT_NEW || _fails(function () {
    re2[_wks('match')] = false;
    // RegExp constructor can alter flags and IsRegExp works correct with @@match
    return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
  }))) {
    $RegExp = function RegExp(p, f) {
      var tiRE = this instanceof $RegExp;
      var piRE = _isRegexp(p);
      var fiU = f === undefined;
      return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
        : _inheritIfRequired(CORRECT_NEW
          ? new Base(piRE && !fiU ? p.source : p, f)
          : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? _flags.call(p) : f)
        , tiRE ? this : proto$1, $RegExp);
    };
    var proxy = function (key) {
      key in $RegExp || dP$3($RegExp, key, {
        configurable: true,
        get: function () { return Base[key]; },
        set: function (it) { Base[key] = it; }
      });
    };
    for (var keys = gOPN(Base), i$1 = 0; keys.length > i$1;) proxy(keys[i$1++]);
    proto$1.constructor = $RegExp;
    $RegExp.prototype = proto$1;
    _redefine(_global, 'RegExp', $RegExp);
  }

  _setSpecies('RegExp');

  // all object keys, includes non-enumerable and symbols



  var Reflect$1 = _global.Reflect;
  var _ownKeys = Reflect$1 && Reflect$1.ownKeys || function ownKeys(it) {
    var keys = _objectGopn.f(_anObject(it));
    var getSymbols = _objectGops.f;
    return getSymbols ? keys.concat(getSymbols(it)) : keys;
  };

  var _createProperty = function (object, index, value) {
    if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
    else object[index] = value;
  };

  // https://github.com/tc39/proposal-object-getownpropertydescriptors






  _export(_export.S, 'Object', {
    getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
      var O = _toIobject(object);
      var getDesc = _objectGopd.f;
      var keys = _ownKeys(O);
      var result = {};
      var i = 0;
      var key, desc;
      while (keys.length > i) {
        desc = getDesc(O, key = keys[i++]);
        if (desc !== undefined) _createProperty(result, key, desc);
      }
      return result;
    }
  });

  // 7.2.2 IsArray(argument)

  var _isArray = Array.isArray || function isArray(arg) {
    return _cof(arg) == 'Array';
  };

  var SPECIES$3 = _wks('species');

  var _arraySpeciesConstructor = function (original) {
    var C;
    if (_isArray(original)) {
      C = original.constructor;
      // cross-realm fallback
      if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
      if (_isObject(C)) {
        C = C[SPECIES$3];
        if (C === null) C = undefined;
      }
    } return C === undefined ? Array : C;
  };

  // 9.4.2.3 ArraySpeciesCreate(originalArray, length)


  var _arraySpeciesCreate = function (original, length) {
    return new (_arraySpeciesConstructor(original))(length);
  };

  // 0 -> Array#forEach
  // 1 -> Array#map
  // 2 -> Array#filter
  // 3 -> Array#some
  // 4 -> Array#every
  // 5 -> Array#find
  // 6 -> Array#findIndex





  var _arrayMethods = function (TYPE, $create) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    var create = $create || _arraySpeciesCreate;
    return function ($this, callbackfn, that) {
      var O = _toObject($this);
      var self = _iobject(O);
      var f = _ctx(callbackfn, that, 3);
      var length = _toLength(self.length);
      var index = 0;
      var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
      var val, res;
      for (;length > index; index++) if (NO_HOLES || index in self) {
        val = self[index];
        res = f(val, index, O);
        if (TYPE) {
          if (IS_MAP) result[index] = res;   // map
          else if (res) switch (TYPE) {
            case 3: return true;             // some
            case 5: return val;              // find
            case 6: return index;            // findIndex
            case 2: result.push(val);        // filter
          } else if (IS_EVERY) return false; // every
        }
      }
      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
    };
  };

  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)

  var $find = _arrayMethods(5);
  var KEY = 'find';
  var forced = true;
  // Shouldn't skip holes
  if (KEY in []) Array(1)[KEY](function () { forced = false; });
  _export(_export.P + _export.F * forced, 'Array', {
    find: function find(callbackfn /* , that = undefined */) {
      return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });
  _addToUnscopables(KEY);

  var f$6 = _wks;

  var _wksExt = {
  	f: f$6
  };

  var defineProperty = _objectDp.f;
  var _wksDefine = function (name) {
    var $Symbol = _core.Symbol || (_core.Symbol =  _global.Symbol || {});
    if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: _wksExt.f(name) });
  };

  _wksDefine('asyncIterator');

  // all enumerable object keys, includes symbols



  var _enumKeys = function (it) {
    var result = _objectKeys(it);
    var getSymbols = _objectGops.f;
    if (getSymbols) {
      var symbols = getSymbols(it);
      var isEnum = _objectPie.f;
      var i = 0;
      var key;
      while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
    } return result;
  };

  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

  var gOPN$1 = _objectGopn.f;
  var toString$1 = {}.toString;

  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
    ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function (it) {
    try {
      return gOPN$1(it);
    } catch (e) {
      return windowNames.slice();
    }
  };

  var f$7 = function getOwnPropertyNames(it) {
    return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN$1(_toIobject(it));
  };

  var _objectGopnExt = {
  	f: f$7
  };

  // ECMAScript 6 symbols shim





  var META = _meta.KEY;





















  var gOPD$1 = _objectGopd.f;
  var dP$4 = _objectDp.f;
  var gOPN$2 = _objectGopnExt.f;
  var $Symbol = _global.Symbol;
  var $JSON = _global.JSON;
  var _stringify = $JSON && $JSON.stringify;
  var PROTOTYPE$2 = 'prototype';
  var HIDDEN = _wks('_hidden');
  var TO_PRIMITIVE = _wks('toPrimitive');
  var isEnum = {}.propertyIsEnumerable;
  var SymbolRegistry = _shared('symbol-registry');
  var AllSymbols = _shared('symbols');
  var OPSymbols = _shared('op-symbols');
  var ObjectProto$1 = Object[PROTOTYPE$2];
  var USE_NATIVE$1 = typeof $Symbol == 'function' && !!_objectGops.f;
  var QObject = _global.QObject;
  // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
  var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

  // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
  var setSymbolDesc = _descriptors && _fails(function () {
    return _objectCreate(dP$4({}, 'a', {
      get: function () { return dP$4(this, 'a', { value: 7 }).a; }
    })).a != 7;
  }) ? function (it, key, D) {
    var protoDesc = gOPD$1(ObjectProto$1, key);
    if (protoDesc) delete ObjectProto$1[key];
    dP$4(it, key, D);
    if (protoDesc && it !== ObjectProto$1) dP$4(ObjectProto$1, key, protoDesc);
  } : dP$4;

  var wrap = function (tag) {
    var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
    sym._k = tag;
    return sym;
  };

  var isSymbol = USE_NATIVE$1 && typeof $Symbol.iterator == 'symbol' ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    return it instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(it, key, D) {
    if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
    _anObject(it);
    key = _toPrimitive(key, true);
    _anObject(D);
    if (_has(AllSymbols, key)) {
      if (!D.enumerable) {
        if (!_has(it, HIDDEN)) dP$4(it, HIDDEN, _propertyDesc(1, {}));
        it[HIDDEN][key] = true;
      } else {
        if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
        D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
      } return setSymbolDesc(it, key, D);
    } return dP$4(it, key, D);
  };
  var $defineProperties = function defineProperties(it, P) {
    _anObject(it);
    var keys = _enumKeys(P = _toIobject(P));
    var i = 0;
    var l = keys.length;
    var key;
    while (l > i) $defineProperty(it, key = keys[i++], P[key]);
    return it;
  };
  var $create = function create(it, P) {
    return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
  };
  var $propertyIsEnumerable = function propertyIsEnumerable(key) {
    var E = isEnum.call(this, key = _toPrimitive(key, true));
    if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
    return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
  };
  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
    it = _toIobject(it);
    key = _toPrimitive(key, true);
    if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
    var D = gOPD$1(it, key);
    if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
    return D;
  };
  var $getOwnPropertyNames = function getOwnPropertyNames(it) {
    var names = gOPN$2(_toIobject(it));
    var result = [];
    var i = 0;
    var key;
    while (names.length > i) {
      if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
    } return result;
  };
  var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
    var IS_OP = it === ObjectProto$1;
    var names = gOPN$2(IS_OP ? OPSymbols : _toIobject(it));
    var result = [];
    var i = 0;
    var key;
    while (names.length > i) {
      if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
    } return result;
  };

  // 19.4.1.1 Symbol([description])
  if (!USE_NATIVE$1) {
    $Symbol = function Symbol() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
      var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
      var $set = function (value) {
        if (this === ObjectProto$1) $set.call(OPSymbols, value);
        if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDesc(this, tag, _propertyDesc(1, value));
      };
      if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
      return wrap(tag);
    };
    _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
      return this._k;
    });

    _objectGopd.f = $getOwnPropertyDescriptor;
    _objectDp.f = $defineProperty;
    _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
    _objectPie.f = $propertyIsEnumerable;
    _objectGops.f = $getOwnPropertySymbols;

    if (_descriptors && !_library) {
      _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
    }

    _wksExt.f = function (name) {
      return wrap(_wks(name));
    };
  }

  _export(_export.G + _export.W + _export.F * !USE_NATIVE$1, { Symbol: $Symbol });

  for (var es6Symbols = (
    // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), j = 0; es6Symbols.length > j;)_wks(es6Symbols[j++]);

  for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

  _export(_export.S + _export.F * !USE_NATIVE$1, 'Symbol', {
    // 19.4.2.1 Symbol.for(key)
    'for': function (key) {
      return _has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = $Symbol(key);
    },
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
      for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
    },
    useSetter: function () { setter = true; },
    useSimple: function () { setter = false; }
  });

  _export(_export.S + _export.F * !USE_NATIVE$1, 'Object', {
    // 19.1.2.2 Object.create(O [, Properties])
    create: $create,
    // 19.1.2.4 Object.defineProperty(O, P, Attributes)
    defineProperty: $defineProperty,
    // 19.1.2.3 Object.defineProperties(O, Properties)
    defineProperties: $defineProperties,
    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: $getOwnPropertyNames,
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: $getOwnPropertySymbols
  });

  // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
  // https://bugs.chromium.org/p/v8/issues/detail?id=3443
  var FAILS_ON_PRIMITIVES = _fails(function () { _objectGops.f(1); });

  _export(_export.S + _export.F * FAILS_ON_PRIMITIVES, 'Object', {
    getOwnPropertySymbols: function getOwnPropertySymbols(it) {
      return _objectGops.f(_toObject(it));
    }
  });

  // 24.3.2 JSON.stringify(value [, replacer [, space]])
  $JSON && _export(_export.S + _export.F * (!USE_NATIVE$1 || _fails(function () {
    var S = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    // WebKit converts symbol values to JSON as null
    // V8 throws on boxed symbols
    return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
  })), 'JSON', {
    stringify: function stringify(it) {
      var args = [it];
      var i = 1;
      var replacer, $replacer;
      while (arguments.length > i) args.push(arguments[i++]);
      $replacer = replacer = args[1];
      if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!_isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return _stringify.apply($JSON, args);
    }
  });

  // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
  $Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
  // 19.4.3.5 Symbol.prototype[@@toStringTag]
  _setToStringTag($Symbol, 'Symbol');
  // 20.2.1.9 Math[@@toStringTag]
  _setToStringTag(Math, 'Math', true);
  // 24.3.3 JSON[@@toStringTag]
  _setToStringTag(_global.JSON, 'JSON', true);

  // 21.2.5.3 get RegExp.prototype.flags()
  if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
    configurable: true,
    get: _flags
  });

  var TO_STRING = 'toString';
  var $toString = /./[TO_STRING];

  var define = function (fn) {
    _redefine(RegExp.prototype, TO_STRING, fn, true);
  };

  // 21.2.5.14 RegExp.prototype.toString()
  if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
    define(function toString() {
      var R = _anObject(this);
      return '/'.concat(R.source, '/',
        'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
    });
  // FF44- RegExp#toString has a wrong name
  } else if ($toString.name != TO_STRING) {
    define(function toString() {
      return $toString.call(this);
    });
  }

  var TYPED = _uid('typed_array');
  var VIEW = _uid('view');
  var ABV = !!(_global.ArrayBuffer && _global.DataView);
  var CONSTR = ABV;
  var i$2 = 0;
  var l = 9;
  var Typed;

  var TypedArrayConstructors = (
    'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
  ).split(',');

  while (i$2 < l) {
    if (Typed = _global[TypedArrayConstructors[i$2++]]) {
      _hide(Typed.prototype, TYPED, true);
      _hide(Typed.prototype, VIEW, true);
    } else CONSTR = false;
  }

  var _typed = {
    ABV: ABV,
    CONSTR: CONSTR,
    TYPED: TYPED,
    VIEW: VIEW
  };

  // https://tc39.github.io/ecma262/#sec-toindex


  var _toIndex = function (it) {
    if (it === undefined) return 0;
    var number = _toInteger(it);
    var length = _toLength(number);
    if (number !== length) throw RangeError('Wrong length!');
    return length;
  };

  var _arrayFill = function fill(value /* , start = 0, end = @length */) {
    var O = _toObject(this);
    var length = _toLength(O.length);
    var aLen = arguments.length;
    var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
    var end = aLen > 2 ? arguments[2] : undefined;
    var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);
    while (endPos > index) O[index++] = value;
    return O;
  };

  var _typedBuffer = createCommonjsModule(function (module, exports) {











  var gOPN = _objectGopn.f;
  var dP = _objectDp.f;


  var ARRAY_BUFFER = 'ArrayBuffer';
  var DATA_VIEW = 'DataView';
  var PROTOTYPE = 'prototype';
  var WRONG_LENGTH = 'Wrong length!';
  var WRONG_INDEX = 'Wrong index!';
  var $ArrayBuffer = _global[ARRAY_BUFFER];
  var $DataView = _global[DATA_VIEW];
  var Math = _global.Math;
  var RangeError = _global.RangeError;
  // eslint-disable-next-line no-shadow-restricted-names
  var Infinity = _global.Infinity;
  var BaseBuffer = $ArrayBuffer;
  var abs = Math.abs;
  var pow = Math.pow;
  var floor = Math.floor;
  var log = Math.log;
  var LN2 = Math.LN2;
  var BUFFER = 'buffer';
  var BYTE_LENGTH = 'byteLength';
  var BYTE_OFFSET = 'byteOffset';
  var $BUFFER = _descriptors ? '_b' : BUFFER;
  var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
  var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET;

  // IEEE754 conversions based on https://github.com/feross/ieee754
  function packIEEE754(value, mLen, nBytes) {
    var buffer = new Array(nBytes);
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
    var i = 0;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    var e, m, c;
    value = abs(value);
    // eslint-disable-next-line no-self-compare
    if (value != value || value === Infinity) {
      // eslint-disable-next-line no-self-compare
      m = value != value ? 1 : 0;
      e = eMax;
    } else {
      e = floor(log(value) / LN2);
      if (value * (c = pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * pow(2, eBias - 1) * pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
    buffer[--i] |= s * 128;
    return buffer;
  }
  function unpackIEEE754(buffer, mLen, nBytes) {
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = eLen - 7;
    var i = nBytes - 1;
    var s = buffer[i--];
    var e = s & 127;
    var m;
    s >>= 7;
    for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : s ? -Infinity : Infinity;
    } else {
      m = m + pow(2, mLen);
      e = e - eBias;
    } return (s ? -1 : 1) * m * pow(2, e - mLen);
  }

  function unpackI32(bytes) {
    return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
  }
  function packI8(it) {
    return [it & 0xff];
  }
  function packI16(it) {
    return [it & 0xff, it >> 8 & 0xff];
  }
  function packI32(it) {
    return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
  }
  function packF64(it) {
    return packIEEE754(it, 52, 8);
  }
  function packF32(it) {
    return packIEEE754(it, 23, 4);
  }

  function addGetter(C, key, internal) {
    dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
  }

  function get(view, bytes, index, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = store.slice(start, start + bytes);
    return isLittleEndian ? pack : pack.reverse();
  }
  function set(view, bytes, index, conversion, value, isLittleEndian) {
    var numIndex = +index;
    var intIndex = _toIndex(numIndex);
    if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
    var store = view[$BUFFER]._b;
    var start = intIndex + view[$OFFSET];
    var pack = conversion(+value);
    for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
  }

  if (!_typed.ABV) {
    $ArrayBuffer = function ArrayBuffer(length) {
      _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
      var byteLength = _toIndex(length);
      this._b = _arrayFill.call(new Array(byteLength), 0);
      this[$LENGTH] = byteLength;
    };

    $DataView = function DataView(buffer, byteOffset, byteLength) {
      _anInstance(this, $DataView, DATA_VIEW);
      _anInstance(buffer, $ArrayBuffer, DATA_VIEW);
      var bufferLength = buffer[$LENGTH];
      var offset = _toInteger(byteOffset);
      if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
      byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
      if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
      this[$BUFFER] = buffer;
      this[$OFFSET] = offset;
      this[$LENGTH] = byteLength;
    };

    if (_descriptors) {
      addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
      addGetter($DataView, BUFFER, '_b');
      addGetter($DataView, BYTE_LENGTH, '_l');
      addGetter($DataView, BYTE_OFFSET, '_o');
    }

    _redefineAll($DataView[PROTOTYPE], {
      getInt8: function getInt8(byteOffset) {
        return get(this, 1, byteOffset)[0] << 24 >> 24;
      },
      getUint8: function getUint8(byteOffset) {
        return get(this, 1, byteOffset)[0];
      },
      getInt16: function getInt16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
      },
      getUint16: function getUint16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments[1]);
        return bytes[1] << 8 | bytes[0];
      },
      getInt32: function getInt32(byteOffset /* , littleEndian */) {
        return unpackI32(get(this, 4, byteOffset, arguments[1]));
      },
      getUint32: function getUint32(byteOffset /* , littleEndian */) {
        return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
      },
      getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
      },
      getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
      },
      setInt8: function setInt8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setUint8: function setUint8(byteOffset, value) {
        set(this, 1, byteOffset, packI8, value);
      },
      setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
        set(this, 2, byteOffset, packI16, value, arguments[2]);
      },
      setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packI32, value, arguments[2]);
      },
      setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
        set(this, 4, byteOffset, packF32, value, arguments[2]);
      },
      setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
        set(this, 8, byteOffset, packF64, value, arguments[2]);
      }
    });
  } else {
    if (!_fails(function () {
      $ArrayBuffer(1);
    }) || !_fails(function () {
      new $ArrayBuffer(-1); // eslint-disable-line no-new
    }) || _fails(function () {
      new $ArrayBuffer(); // eslint-disable-line no-new
      new $ArrayBuffer(1.5); // eslint-disable-line no-new
      new $ArrayBuffer(NaN); // eslint-disable-line no-new
      return $ArrayBuffer.name != ARRAY_BUFFER;
    })) {
      $ArrayBuffer = function ArrayBuffer(length) {
        _anInstance(this, $ArrayBuffer);
        return new BaseBuffer(_toIndex(length));
      };
      var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
      for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
        if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
      }
      ArrayBufferProto.constructor = $ArrayBuffer;
    }
    // iOS Safari 7.x bug
    var view = new $DataView(new $ArrayBuffer(2));
    var $setInt8 = $DataView[PROTOTYPE].setInt8;
    view.setInt8(0, 2147483648);
    view.setInt8(1, 2147483649);
    if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
      setInt8: function setInt8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      },
      setUint8: function setUint8(byteOffset, value) {
        $setInt8.call(this, byteOffset, value << 24 >> 24);
      }
    }, true);
  }
  _setToStringTag($ArrayBuffer, ARRAY_BUFFER);
  _setToStringTag($DataView, DATA_VIEW);
  _hide($DataView[PROTOTYPE], _typed.VIEW, true);
  exports[ARRAY_BUFFER] = $ArrayBuffer;
  exports[DATA_VIEW] = $DataView;
  });

  var _arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
    var O = _toObject(this);
    var len = _toLength(O.length);
    var to = _toAbsoluteIndex(target, len);
    var from = _toAbsoluteIndex(start, len);
    var end = arguments.length > 2 ? arguments[2] : undefined;
    var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
    var inc = 1;
    if (from < to && to < from + count) {
      inc = -1;
      from += count - 1;
      to += count - 1;
    }
    while (count-- > 0) {
      if (from in O) O[to] = O[from];
      else delete O[to];
      to += inc;
      from += inc;
    } return O;
  };

  var _typedArray = createCommonjsModule(function (module) {
  if (_descriptors) {
    var LIBRARY = _library;
    var global = _global;
    var fails = _fails;
    var $export = _export;
    var $typed = _typed;
    var $buffer = _typedBuffer;
    var ctx = _ctx;
    var anInstance = _anInstance;
    var propertyDesc = _propertyDesc;
    var hide = _hide;
    var redefineAll = _redefineAll;
    var toInteger = _toInteger;
    var toLength = _toLength;
    var toIndex = _toIndex;
    var toAbsoluteIndex = _toAbsoluteIndex;
    var toPrimitive = _toPrimitive;
    var has = _has;
    var classof = _classof;
    var isObject = _isObject;
    var toObject = _toObject;
    var isArrayIter = _isArrayIter;
    var create = _objectCreate;
    var getPrototypeOf = _objectGpo;
    var gOPN = _objectGopn.f;
    var getIterFn = core_getIteratorMethod;
    var uid = _uid;
    var wks = _wks;
    var createArrayMethod = _arrayMethods;
    var createArrayIncludes = _arrayIncludes;
    var speciesConstructor = _speciesConstructor;
    var ArrayIterators = es6_array_iterator;
    var Iterators = _iterators;
    var $iterDetect = _iterDetect;
    var setSpecies = _setSpecies;
    var arrayFill = _arrayFill;
    var arrayCopyWithin = _arrayCopyWithin;
    var $DP = _objectDp;
    var $GOPD = _objectGopd;
    var dP = $DP.f;
    var gOPD = $GOPD.f;
    var RangeError = global.RangeError;
    var TypeError = global.TypeError;
    var Uint8Array = global.Uint8Array;
    var ARRAY_BUFFER = 'ArrayBuffer';
    var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
    var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
    var PROTOTYPE = 'prototype';
    var ArrayProto = Array[PROTOTYPE];
    var $ArrayBuffer = $buffer.ArrayBuffer;
    var $DataView = $buffer.DataView;
    var arrayForEach = createArrayMethod(0);
    var arrayFilter = createArrayMethod(2);
    var arraySome = createArrayMethod(3);
    var arrayEvery = createArrayMethod(4);
    var arrayFind = createArrayMethod(5);
    var arrayFindIndex = createArrayMethod(6);
    var arrayIncludes = createArrayIncludes(true);
    var arrayIndexOf = createArrayIncludes(false);
    var arrayValues = ArrayIterators.values;
    var arrayKeys = ArrayIterators.keys;
    var arrayEntries = ArrayIterators.entries;
    var arrayLastIndexOf = ArrayProto.lastIndexOf;
    var arrayReduce = ArrayProto.reduce;
    var arrayReduceRight = ArrayProto.reduceRight;
    var arrayJoin = ArrayProto.join;
    var arraySort = ArrayProto.sort;
    var arraySlice = ArrayProto.slice;
    var arrayToString = ArrayProto.toString;
    var arrayToLocaleString = ArrayProto.toLocaleString;
    var ITERATOR = wks('iterator');
    var TAG = wks('toStringTag');
    var TYPED_CONSTRUCTOR = uid('typed_constructor');
    var DEF_CONSTRUCTOR = uid('def_constructor');
    var ALL_CONSTRUCTORS = $typed.CONSTR;
    var TYPED_ARRAY = $typed.TYPED;
    var VIEW = $typed.VIEW;
    var WRONG_LENGTH = 'Wrong length!';

    var $map = createArrayMethod(1, function (O, length) {
      return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
    });

    var LITTLE_ENDIAN = fails(function () {
      // eslint-disable-next-line no-undef
      return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
    });

    var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
      new Uint8Array(1).set({});
    });

    var toOffset = function (it, BYTES) {
      var offset = toInteger(it);
      if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
      return offset;
    };

    var validate = function (it) {
      if (isObject(it) && TYPED_ARRAY in it) return it;
      throw TypeError(it + ' is not a typed array!');
    };

    var allocate = function (C, length) {
      if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
        throw TypeError('It is not a typed array constructor!');
      } return new C(length);
    };

    var speciesFromList = function (O, list) {
      return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
    };

    var fromList = function (C, list) {
      var index = 0;
      var length = list.length;
      var result = allocate(C, length);
      while (length > index) result[index] = list[index++];
      return result;
    };

    var addGetter = function (it, key, internal) {
      dP(it, key, { get: function () { return this._d[internal]; } });
    };

    var $from = function from(source /* , mapfn, thisArg */) {
      var O = toObject(source);
      var aLen = arguments.length;
      var mapfn = aLen > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var iterFn = getIterFn(O);
      var i, length, values, result, step, iterator;
      if (iterFn != undefined && !isArrayIter(iterFn)) {
        for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
          values.push(step.value);
        } O = values;
      }
      if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
      for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
        result[i] = mapping ? mapfn(O[i], i) : O[i];
      }
      return result;
    };

    var $of = function of(/* ...items */) {
      var index = 0;
      var length = arguments.length;
      var result = allocate(this, length);
      while (length > index) result[index] = arguments[index++];
      return result;
    };

    // iOS Safari 6.x fails here
    var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

    var $toLocaleString = function toLocaleString() {
      return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
    };

    var proto = {
      copyWithin: function copyWithin(target, start /* , end */) {
        return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
      },
      every: function every(callbackfn /* , thisArg */) {
        return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
        return arrayFill.apply(validate(this), arguments);
      },
      filter: function filter(callbackfn /* , thisArg */) {
        return speciesFromList(this, arrayFilter(validate(this), callbackfn,
          arguments.length > 1 ? arguments[1] : undefined));
      },
      find: function find(predicate /* , thisArg */) {
        return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      findIndex: function findIndex(predicate /* , thisArg */) {
        return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
      },
      forEach: function forEach(callbackfn /* , thisArg */) {
        arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      indexOf: function indexOf(searchElement /* , fromIndex */) {
        return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      includes: function includes(searchElement /* , fromIndex */) {
        return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
      },
      join: function join(separator) { // eslint-disable-line no-unused-vars
        return arrayJoin.apply(validate(this), arguments);
      },
      lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
        return arrayLastIndexOf.apply(validate(this), arguments);
      },
      map: function map(mapfn /* , thisArg */) {
        return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
        return arrayReduce.apply(validate(this), arguments);
      },
      reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
        return arrayReduceRight.apply(validate(this), arguments);
      },
      reverse: function reverse() {
        var that = this;
        var length = validate(that).length;
        var middle = Math.floor(length / 2);
        var index = 0;
        var value;
        while (index < middle) {
          value = that[index];
          that[index++] = that[--length];
          that[length] = value;
        } return that;
      },
      some: function some(callbackfn /* , thisArg */) {
        return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      },
      sort: function sort(comparefn) {
        return arraySort.call(validate(this), comparefn);
      },
      subarray: function subarray(begin, end) {
        var O = validate(this);
        var length = O.length;
        var $begin = toAbsoluteIndex(begin, length);
        return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
          O.buffer,
          O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
          toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
        );
      }
    };

    var $slice = function slice(start, end) {
      return speciesFromList(this, arraySlice.call(validate(this), start, end));
    };

    var $set = function set(arrayLike /* , offset */) {
      validate(this);
      var offset = toOffset(arguments[1], 1);
      var length = this.length;
      var src = toObject(arrayLike);
      var len = toLength(src.length);
      var index = 0;
      if (len + offset > length) throw RangeError(WRONG_LENGTH);
      while (index < len) this[offset + index] = src[index++];
    };

    var $iterators = {
      entries: function entries() {
        return arrayEntries.call(validate(this));
      },
      keys: function keys() {
        return arrayKeys.call(validate(this));
      },
      values: function values() {
        return arrayValues.call(validate(this));
      }
    };

    var isTAIndex = function (target, key) {
      return isObject(target)
        && target[TYPED_ARRAY]
        && typeof key != 'symbol'
        && key in target
        && String(+key) == String(key);
    };
    var $getDesc = function getOwnPropertyDescriptor(target, key) {
      return isTAIndex(target, key = toPrimitive(key, true))
        ? propertyDesc(2, target[key])
        : gOPD(target, key);
    };
    var $setDesc = function defineProperty(target, key, desc) {
      if (isTAIndex(target, key = toPrimitive(key, true))
        && isObject(desc)
        && has(desc, 'value')
        && !has(desc, 'get')
        && !has(desc, 'set')
        // TODO: add validation descriptor w/o calling accessors
        && !desc.configurable
        && (!has(desc, 'writable') || desc.writable)
        && (!has(desc, 'enumerable') || desc.enumerable)
      ) {
        target[key] = desc.value;
        return target;
      } return dP(target, key, desc);
    };

    if (!ALL_CONSTRUCTORS) {
      $GOPD.f = $getDesc;
      $DP.f = $setDesc;
    }

    $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
      getOwnPropertyDescriptor: $getDesc,
      defineProperty: $setDesc
    });

    if (fails(function () { arrayToString.call({}); })) {
      arrayToString = arrayToLocaleString = function toString() {
        return arrayJoin.call(this);
      };
    }

    var $TypedArrayPrototype$ = redefineAll({}, proto);
    redefineAll($TypedArrayPrototype$, $iterators);
    hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
    redefineAll($TypedArrayPrototype$, {
      slice: $slice,
      set: $set,
      constructor: function () { /* noop */ },
      toString: arrayToString,
      toLocaleString: $toLocaleString
    });
    addGetter($TypedArrayPrototype$, 'buffer', 'b');
    addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
    addGetter($TypedArrayPrototype$, 'byteLength', 'l');
    addGetter($TypedArrayPrototype$, 'length', 'e');
    dP($TypedArrayPrototype$, TAG, {
      get: function () { return this[TYPED_ARRAY]; }
    });

    // eslint-disable-next-line max-statements
    module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
      CLAMPED = !!CLAMPED;
      var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
      var GETTER = 'get' + KEY;
      var SETTER = 'set' + KEY;
      var TypedArray = global[NAME];
      var Base = TypedArray || {};
      var TAC = TypedArray && getPrototypeOf(TypedArray);
      var FORCED = !TypedArray || !$typed.ABV;
      var O = {};
      var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
      var getter = function (that, index) {
        var data = that._d;
        return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
      };
      var setter = function (that, index, value) {
        var data = that._d;
        if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
        data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
      };
      var addElement = function (that, index) {
        dP(that, index, {
          get: function () {
            return getter(this, index);
          },
          set: function (value) {
            return setter(this, index, value);
          },
          enumerable: true
        });
      };
      if (FORCED) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME, '_d');
          var index = 0;
          var offset = 0;
          var buffer, byteLength, length, klass;
          if (!isObject(data)) {
            length = toIndex(data);
            byteLength = length * BYTES;
            buffer = new $ArrayBuffer(byteLength);
          } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            buffer = data;
            offset = toOffset($offset, BYTES);
            var $len = data.byteLength;
            if ($length === undefined) {
              if ($len % BYTES) throw RangeError(WRONG_LENGTH);
              byteLength = $len - offset;
              if (byteLength < 0) throw RangeError(WRONG_LENGTH);
            } else {
              byteLength = toLength($length) * BYTES;
              if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
            }
            length = byteLength / BYTES;
          } else if (TYPED_ARRAY in data) {
            return fromList(TypedArray, data);
          } else {
            return $from.call(TypedArray, data);
          }
          hide(that, '_d', {
            b: buffer,
            o: offset,
            l: byteLength,
            e: length,
            v: new $DataView(buffer)
          });
          while (index < length) addElement(that, index++);
        });
        TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
        hide(TypedArrayPrototype, 'constructor', TypedArray);
      } else if (!fails(function () {
        TypedArray(1);
      }) || !fails(function () {
        new TypedArray(-1); // eslint-disable-line no-new
      }) || !$iterDetect(function (iter) {
        new TypedArray(); // eslint-disable-line no-new
        new TypedArray(null); // eslint-disable-line no-new
        new TypedArray(1.5); // eslint-disable-line no-new
        new TypedArray(iter); // eslint-disable-line no-new
      }, true)) {
        TypedArray = wrapper(function (that, data, $offset, $length) {
          anInstance(that, TypedArray, NAME);
          var klass;
          // `ws` module bug, temporarily remove validation length for Uint8Array
          // https://github.com/websockets/ws/pull/645
          if (!isObject(data)) return new Base(toIndex(data));
          if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
            return $length !== undefined
              ? new Base(data, toOffset($offset, BYTES), $length)
              : $offset !== undefined
                ? new Base(data, toOffset($offset, BYTES))
                : new Base(data);
          }
          if (TYPED_ARRAY in data) return fromList(TypedArray, data);
          return $from.call(TypedArray, data);
        });
        arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
          if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
        });
        TypedArray[PROTOTYPE] = TypedArrayPrototype;
        if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
      }
      var $nativeIterator = TypedArrayPrototype[ITERATOR];
      var CORRECT_ITER_NAME = !!$nativeIterator
        && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
      var $iterator = $iterators.values;
      hide(TypedArray, TYPED_CONSTRUCTOR, true);
      hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
      hide(TypedArrayPrototype, VIEW, true);
      hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

      if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
        dP(TypedArrayPrototype, TAG, {
          get: function () { return NAME; }
        });
      }

      O[NAME] = TypedArray;

      $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

      $export($export.S, NAME, {
        BYTES_PER_ELEMENT: BYTES
      });

      $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
        from: $from,
        of: $of
      });

      if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

      $export($export.P, NAME, proto);

      setSpecies(NAME);

      $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

      $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

      if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

      $export($export.P + $export.F * fails(function () {
        new TypedArray(1).slice();
      }), NAME, { slice: $slice });

      $export($export.P + $export.F * (fails(function () {
        return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
      }) || !fails(function () {
        TypedArrayPrototype.toLocaleString.call([1, 2]);
      })), NAME, { toLocaleString: $toLocaleString });

      Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
      if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
    };
  } else module.exports = function () { /* empty */ };
  });

  _typedArray('Float64', 8, function (init) {
    return function Float64Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Float32', 4, function (init) {
    return function Float32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint32', 4, function (init) {
    return function Uint32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint16', 2, function (init) {
    return function Uint16Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Uint8', 1, function (init) {
    return function Uint8ClampedArray(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  }, true);

  _typedArray('Uint8', 1, function (init) {
    return function Uint8Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Int32', 4, function (init) {
    return function Int32Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Int16', 2, function (init) {
    return function Int16Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  _typedArray('Int8', 1, function (init) {
    return function Int8Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  var _marked16 = /*#__PURE__*/regeneratorRuntime.mark(Ve);

  function ce(_x) {
    return _ce.apply(this, arguments);
  }

  function _ce() {
    _ce = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(e) {
      var t;
      return regeneratorRuntime.wrap(function _callee12$(_context31) {
        while (1) {
          switch (_context31.prev = _context31.next) {
            case 0:
              _context31.t0 = fetch;
              _context31.next = 3;
              return e.url();

            case 3:
              _context31.t1 = _context31.sent;
              _context31.next = 6;
              return (0, _context31.t0)(_context31.t1);

            case 6:
              t = _context31.sent;

              if (t.ok) {
                _context31.next = 9;
                break;
              }

              throw new Error("Unable to load file: ".concat(e.name));

            case 9:
              return _context31.abrupt("return", t);

            case 10:
            case "end":
              return _context31.stop();
          }
        }
      }, _callee12);
    }));
    return _ce.apply(this, arguments);
  }

  var FileAttachment = /*#__PURE__*/function () {
    function FileAttachment(e, t) {
      _classCallCheck(this, FileAttachment);

      Object.defineProperties(this, {
        _url: {
          value: e
        },
        name: {
          value: t,
          enumerable: !0
        }
      });
    }

    _createClass(FileAttachment, [{
      key: "url",
      value: function () {
        var _url = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  return _context16.abrupt("return", this._url);

                case 1:
                case "end":
                  return _context16.stop();
              }
            }
          }, _callee, this);
        }));

        function url() {
          return _url.apply(this, arguments);
        }

        return url;
      }()
    }, {
      key: "blob",
      value: function () {
        var _blob = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  _context17.next = 2;
                  return ce(this);

                case 2:
                  return _context17.abrupt("return", _context17.sent.blob());

                case 3:
                case "end":
                  return _context17.stop();
              }
            }
          }, _callee2, this);
        }));

        function blob() {
          return _blob.apply(this, arguments);
        }

        return blob;
      }()
    }, {
      key: "arrayBuffer",
      value: function () {
        var _arrayBuffer = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context18) {
            while (1) {
              switch (_context18.prev = _context18.next) {
                case 0:
                  _context18.next = 2;
                  return ce(this);

                case 2:
                  return _context18.abrupt("return", _context18.sent.arrayBuffer());

                case 3:
                case "end":
                  return _context18.stop();
              }
            }
          }, _callee3, this);
        }));

        function arrayBuffer() {
          return _arrayBuffer.apply(this, arguments);
        }

        return arrayBuffer;
      }()
    }, {
      key: "text",
      value: function () {
        var _text = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          return regeneratorRuntime.wrap(function _callee4$(_context19) {
            while (1) {
              switch (_context19.prev = _context19.next) {
                case 0:
                  _context19.next = 2;
                  return ce(this);

                case 2:
                  return _context19.abrupt("return", _context19.sent.text());

                case 3:
                case "end":
                  return _context19.stop();
              }
            }
          }, _callee4, this);
        }));

        function text() {
          return _text.apply(this, arguments);
        }

        return text;
      }()
    }, {
      key: "json",
      value: function () {
        var _json = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
          return regeneratorRuntime.wrap(function _callee5$(_context20) {
            while (1) {
              switch (_context20.prev = _context20.next) {
                case 0:
                  _context20.next = 2;
                  return ce(this);

                case 2:
                  return _context20.abrupt("return", _context20.sent.json());

                case 3:
                case "end":
                  return _context20.stop();
              }
            }
          }, _callee5, this);
        }));

        function json() {
          return _json.apply(this, arguments);
        }

        return json;
      }()
    }, {
      key: "stream",
      value: function () {
        var _stream = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
          return regeneratorRuntime.wrap(function _callee6$(_context21) {
            while (1) {
              switch (_context21.prev = _context21.next) {
                case 0:
                  _context21.next = 2;
                  return ce(this);

                case 2:
                  return _context21.abrupt("return", _context21.sent.body);

                case 3:
                case "end":
                  return _context21.stop();
              }
            }
          }, _callee6, this);
        }));

        function stream() {
          return _stream.apply(this, arguments);
        }

        return stream;
      }()
    }, {
      key: "image",
      value: function () {
        var _image = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
          var _this = this;

          var e;
          return regeneratorRuntime.wrap(function _callee7$(_context22) {
            while (1) {
              switch (_context22.prev = _context22.next) {
                case 0:
                  _context22.next = 2;
                  return this.url();

                case 2:
                  e = _context22.sent;
                  return _context22.abrupt("return", new Promise(function (t, n) {
                    var r = new Image();
                    new URL(e, document.baseURI).origin !== new URL(location).origin && (r.crossOrigin = "anonymous"), r.onload = function () {
                      return t(r);
                    }, r.onerror = function () {
                      return n(new Error("Unable to load file: ".concat(_this.name)));
                    }, r.src = e;
                  }));

                case 4:
                case "end":
                  return _context22.stop();
              }
            }
          }, _callee7, this);
        }));

        function image() {
          return _image.apply(this, arguments);
        }

        return image;
      }()
    }]);

    return FileAttachment;
  }();

  function de(e) {
    throw new Error("File not found: ".concat(e));
  }

  var fe = new Map(),
      he = [],
      pe = he.map,
      me = he.some,
      ve = he.hasOwnProperty,
      be = "https://cdn.jsdelivr.net/npm/",
      _e = /^((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(?:\/(.*))?$/,
      we = /^\d+\.\d+\.\d+(-[\w-.+]+)?$/,
      ge = /\.[^\/]*$/,
      ye = ["unpkg", "jsdelivr", "browser", "main"];

  var RequireError = /*#__PURE__*/function (_Error) {
    _inherits(RequireError, _Error);

    function RequireError(e) {
      _classCallCheck(this, RequireError);

      return _possibleConstructorReturn(this, _getPrototypeOf(RequireError).call(this, e));
    }

    return RequireError;
  }( /*#__PURE__*/_wrapNativeSuper(Error));

  function xe(e) {
    var t = _e.exec(e);

    return t && {
      name: t[1],
      version: t[2],
      path: t[3]
    };
  }

  function Ee(e) {
    var t = "".concat(be).concat(e.name).concat(e.version ? "@".concat(e.version) : "", "/package.json");
    var n = fe.get(t);
    return n || fe.set(t, n = fetch(t).then(function (e) {
      if (!e.ok) throw new RequireError("unable to load package.json");
      return e.redirected && !fe.has(e.url) && fe.set(e.url, n), e.json();
    })), n;
  }

  RequireError.prototype.name = RequireError.name;
  var Ce = Ne( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(e, t) {
      var n, _e5, r;

      return regeneratorRuntime.wrap(function _callee8$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              if (!(e.startsWith(be) && (e = e.substring(be.length)), /^(\w+:)|\/\//i.test(e))) {
                _context23.next = 2;
                break;
              }

              return _context23.abrupt("return", e);

            case 2:
              if (!/^[.]{0,2}\//i.test(e)) {
                _context23.next = 4;
                break;
              }

              return _context23.abrupt("return", new URL(e, null == t ? location : t).href);

            case 4:
              if (!(!e.length || /^[\s._]/.test(e) || /\s$/.test(e))) {
                _context23.next = 6;
                break;
              }

              throw new RequireError("illegal name");

            case 6:
              n = xe(e);

              if (n) {
                _context23.next = 9;
                break;
              }

              return _context23.abrupt("return", "".concat(be).concat(e));

            case 9:
              if (!(!n.version && null != t && t.startsWith(be))) {
                _context23.next = 14;
                break;
              }

              _context23.next = 12;
              return Ee(xe(t.substring(be.length)));

            case 12:
              _e5 = _context23.sent;
              n.version = _e5.dependencies && _e5.dependencies[n.name] || _e5.peerDependencies && _e5.peerDependencies[n.name];

            case 14:
              if (!(n.path && !ge.test(n.path) && (n.path += ".js"), n.path && n.version && we.test(n.version))) {
                _context23.next = 16;
                break;
              }

              return _context23.abrupt("return", "".concat(be).concat(n.name, "@").concat(n.version, "/").concat(n.path));

            case 16:
              _context23.next = 18;
              return Ee(n);

            case 18:
              r = _context23.sent;
              return _context23.abrupt("return", "".concat(be).concat(r.name, "@").concat(r.version, "/").concat(n.path || function (e) {
                var _iteratorNormalCompletion14 = true;
                var _didIteratorError14 = false;
                var _iteratorError14 = undefined;

                try {
                  for (var _iterator14 = ye[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                    var _t25 = _step14.value;
                    var _n12 = e[_t25];
                    if ("string" == typeof _n12) return ge.test(_n12) ? _n12 : "".concat(_n12, ".js");
                  }
                } catch (err) {
                  _didIteratorError14 = true;
                  _iteratorError14 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
                      _iterator14.return();
                    }
                  } finally {
                    if (_didIteratorError14) {
                      throw _iteratorError14;
                    }
                  }
                }
              }(r) || "index.js"));

            case 20:
            case "end":
              return _context23.stop();
          }
        }
      }, _callee8);
    }));

    return function (_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }());

  function Ne(e) {
    var t = new Map(),
        n = i(null);

    function r(e) {
      if ("string" != typeof e) return e;
      var n = t.get(e);
      return n || t.set(e, n = new Promise(function (t, n) {
        var r = document.createElement("script");
        r.onload = function () {
          try {
            t(he.pop()(i(e)));
          } catch (e) {
            n(new RequireError("invalid module"));
          }

          r.remove();
        }, r.onerror = function () {
          n(new RequireError("unable to load module")), r.remove();
        }, r.async = !0, r.src = e, window.define = Me, document.head.appendChild(r);
      })), n;
    }

    function i(t) {
      return function (n) {
        return Promise.resolve(e(n, t)).then(r);
      };
    }

    function o(e) {
      return arguments.length > 1 ? Promise.all(pe.call(arguments, n)).then(Se) : n(e);
    }

    return o.alias = function (t) {
      return Ne(function (n, r) {
        return n in t && (r = null, "string" != typeof (n = t[n])) ? n : e(n, r);
      });
    }, o.resolve = e, o;
  }

  function Se(e) {
    var t = {};
    var _iteratorNormalCompletion15 = true;
    var _didIteratorError15 = false;
    var _iteratorError15 = undefined;

    try {
      for (var _iterator15 = e[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
        var _n13 = _step15.value;

        for (var _e6 in _n13) {
          ve.call(_n13, _e6) && (null == _n13[_e6] ? Object.defineProperty(t, _e6, {
            get: Pe(_n13, _e6)
          }) : t[_e6] = _n13[_e6]);
        }
      }
    } catch (err) {
      _didIteratorError15 = true;
      _iteratorError15 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion15 && _iterator15.return != null) {
          _iterator15.return();
        }
      } finally {
        if (_didIteratorError15) {
          throw _iteratorError15;
        }
      }
    }

    return t;
  }

  function Pe(e, t) {
    return function () {
      return e[t];
    };
  }

  function qe(e) {
    return "exports" === (e += "") || "module" === e;
  }

  function Me(e, t, n) {
    var r = arguments.length;
    r < 2 ? (n = e, t = []) : r < 3 && (n = t, t = "string" == typeof e ? [] : e), he.push(me.call(t, qe) ? function (e) {
      var r = {},
          i = {
        exports: r
      };
      return Promise.all(pe.call(t, function (t) {
        return "exports" === (t += "") ? r : "module" === t ? i : e(t);
      })).then(function (e) {
        return n.apply(null, e), i.exports;
      });
    } : function (e) {
      return Promise.all(pe.call(t, e)).then(function (e) {
        return "function" == typeof n ? n.apply(null, e) : n;
      });
    });
  }

  function $e(e) {
    return function () {
      return e;
    };
  }

  Me.amd = {};
  var Le = {
    math: "http://www.w3.org/1998/Math/MathML",
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };
  var je = 0;

  function ke(e) {
    this.id = e, this.href = new URL("#".concat(e), location) + "";
  }

  ke.prototype.toString = function () {
    return "url(" + this.href + ")";
  };

  var Te = {
    canvas: function canvas(e, t) {
      var n = document.createElement("canvas");
      return n.width = e, n.height = t, n;
    },
    context2d: function context2d(e, t, n) {
      null == n && (n = devicePixelRatio);
      var r = document.createElement("canvas");
      r.width = e * n, r.height = t * n, r.style.width = e + "px";
      var i = r.getContext("2d");
      return i.scale(n, n), i;
    },
    download: function download(e) {
      var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "untitled";
      var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "Save";
      var r = document.createElement("a"),
          i = r.appendChild(document.createElement("button"));

      function o() {
        return _o3.apply(this, arguments);
      }

      function _o3() {
        _o3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
          return regeneratorRuntime.wrap(function _callee10$(_context25) {
            while (1) {
              switch (_context25.prev = _context25.next) {
                case 0:
                  _context25.next = 2;
                  return new Promise(requestAnimationFrame);

                case 2:
                  URL.revokeObjectURL(r.href);
                  r.removeAttribute("href");
                  i.textContent = n;
                  i.disabled = !1;

                case 6:
                case "end":
                  return _context25.stop();
              }
            }
          }, _callee10);
        }));
        return _o3.apply(this, arguments);
      }

      return i.textContent = n, r.download = t, r.onclick = /*#__PURE__*/function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(t) {
          var _t26;

          return regeneratorRuntime.wrap(function _callee9$(_context24) {
            while (1) {
              switch (_context24.prev = _context24.next) {
                case 0:
                  if (!(i.disabled = !0, r.href)) {
                    _context24.next = 2;
                    break;
                  }

                  return _context24.abrupt("return", o());

                case 2:
                  i.textContent = "Saving…";
                  _context24.prev = 3;
                  _context24.next = 6;
                  return "function" == typeof e ? e() : e;

                case 6:
                  _t26 = _context24.sent;
                  i.textContent = "Download", r.href = URL.createObjectURL(_t26);
                  _context24.next = 13;
                  break;

                case 10:
                  _context24.prev = 10;
                  _context24.t0 = _context24["catch"](3);
                  i.textContent = n;

                case 13:
                  if (!t.eventPhase) {
                    _context24.next = 15;
                    break;
                  }

                  return _context24.abrupt("return", o());

                case 15:
                  i.disabled = !1;

                case 16:
                case "end":
                  return _context24.stop();
              }
            }
          }, _callee9, null, [[3, 10]]);
        }));

        return function (_x4) {
          return _ref3.apply(this, arguments);
        };
      }(), r;
    },
    element: function element(e, t) {
      var n,
          r = e += "",
          i = r.indexOf(":");
      i >= 0 && "xmlns" !== (r = e.slice(0, i)) && (e = e.slice(i + 1));
      var o = Le.hasOwnProperty(r) ? document.createElementNS(Le[r], e) : document.createElement(e);
      if (t) for (var a in t) {
        i = (r = a).indexOf(":"), n = t[a], i >= 0 && "xmlns" !== (r = a.slice(0, i)) && (a = a.slice(i + 1)), Le.hasOwnProperty(r) ? o.setAttributeNS(Le[r], a, n) : o.setAttribute(a, n);
      }
      return o;
    },
    input: function input(e) {
      var t = document.createElement("input");
      return null != e && (t.type = e), t;
    },
    range: function range(e, t, n) {
      1 === arguments.length && (t = e, e = null);
      var r = document.createElement("input");
      return r.min = e = null == e ? 0 : +e, r.max = t = null == t ? 1 : +t, r.step = null == n ? "any" : n = +n, r.type = "range", r;
    },
    select: function select(e) {
      var t = document.createElement("select");
      return Array.prototype.forEach.call(e, function (e) {
        var n = document.createElement("option");
        n.value = n.textContent = e, t.appendChild(n);
      }), t;
    },
    svg: function svg(e, t) {
      var n = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      return n.setAttribute("viewBox", [0, 0, e, t]), n.setAttribute("width", e), n.setAttribute("height", t), n;
    },
    text: function text(e) {
      return document.createTextNode(e);
    },
    uid: function uid(e) {
      return new ke("O-" + (null == e ? "" : e + "-") + ++je);
    }
  };
  var Ae = {
    buffer: function buffer(e) {
      return new Promise(function (t, n) {
        var r = new FileReader();
        r.onload = function () {
          t(r.result);
        }, r.onerror = n, r.readAsArrayBuffer(e);
      });
    },
    text: function text(e) {
      return new Promise(function (t, n) {
        var r = new FileReader();
        r.onload = function () {
          t(r.result);
        }, r.onerror = n, r.readAsText(e);
      });
    },
    url: function url(e) {
      return new Promise(function (t, n) {
        var r = new FileReader();
        r.onload = function () {
          t(r.result);
        }, r.onerror = n, r.readAsDataURL(e);
      });
    }
  };

  function Oe() {
    return this;
  }

  function Ue(e, t) {
    var _ref4;

    var n = !1;
    return _ref4 = {}, _defineProperty(_ref4, Symbol.iterator, Oe), _defineProperty(_ref4, "next", function next() {
      return n ? {
        done: !0
      } : (n = !0, {
        done: !1,
        value: e
      });
    }), _defineProperty(_ref4, "return", function _return() {
      return n = !0, t(e), {
        done: !0
      };
    }), _defineProperty(_ref4, "throw", function _throw() {
      return {
        done: n = !0
      };
    }), _ref4;
  }

  function Re(e) {
    var _ref5;

    var t,
        n,
        r = !1;
    var i = e(function (e) {
      n ? (n(e), n = null) : r = !0;
      return t = e;
    });
    return _ref5 = {}, _defineProperty(_ref5, Symbol.iterator, Oe), _defineProperty(_ref5, "throw", function _throw() {
      return {
        done: !0
      };
    }), _defineProperty(_ref5, "return", function _return() {
      return null != i && i(), {
        done: !0
      };
    }), _defineProperty(_ref5, "next", function next() {
      return {
        done: !1,
        value: r ? (r = !1, Promise.resolve(t)) : new Promise(function (e) {
          return n = e;
        })
      };
    }), _ref5;
  }

  function De(e) {
    switch (e.type) {
      case "range":
      case "number":
        return e.valueAsNumber;

      case "date":
        return e.valueAsDate;

      case "checkbox":
        return e.checked;

      case "file":
        return e.multiple ? e.files : e.files[0];

      default:
        return e.value;
    }
  }

  var Fe = {
    disposable: Ue,
    filter: /*#__PURE__*/regeneratorRuntime.mark(function filter(e, t) {
      var n, r;
      return regeneratorRuntime.wrap(function filter$(_context26) {
        while (1) {
          switch (_context26.prev = _context26.next) {
            case 0:
              r = -1;

            case 1:
              if ((n = e.next()).done) {
                _context26.next = 8;
                break;
              }

              _context26.t0 = t(n.value, ++r);

              if (!_context26.t0) {
                _context26.next = 6;
                break;
              }

              _context26.next = 6;
              return n.value;

            case 6:
              _context26.next = 1;
              break;

            case 8:
            case "end":
              return _context26.stop();
          }
        }
      }, filter);
    }),
    input: function input(e) {
      return Re(function (t) {
        var n = function (e) {
          switch (e.type) {
            case "button":
            case "submit":
            case "checkbox":
              return "click";

            case "file":
              return "change";

            default:
              return "input";
          }
        }(e),
            r = De(e);

        function i() {
          t(De(e));
        }

        return e.addEventListener(n, i), void 0 !== r && t(r), function () {
          e.removeEventListener(n, i);
        };
      });
    },
    map: /*#__PURE__*/regeneratorRuntime.mark(function map(e, t) {
      var n, r;
      return regeneratorRuntime.wrap(function map$(_context27) {
        while (1) {
          switch (_context27.prev = _context27.next) {
            case 0:
              r = -1;

            case 1:
              if ((n = e.next()).done) {
                _context27.next = 6;
                break;
              }

              _context27.next = 4;
              return t(n.value, ++r);

            case 4:
              _context27.next = 1;
              break;

            case 6:
            case "end":
              return _context27.stop();
          }
        }
      }, map);
    }),
    observe: Re,
    queue: function queue(e) {
      var _ref6;

      var t;
      var n = [],
          r = e(function (e) {
        n.push(e), t && (t(n.shift()), t = null);
        return e;
      });
      return _ref6 = {}, _defineProperty(_ref6, Symbol.iterator, Oe), _defineProperty(_ref6, "throw", function _throw() {
        return {
          done: !0
        };
      }), _defineProperty(_ref6, "return", function _return() {
        return null != r && r(), {
          done: !0
        };
      }), _defineProperty(_ref6, "next", function next() {
        return {
          done: !1,
          value: n.length ? Promise.resolve(n.shift()) : new Promise(function (e) {
            return t = e;
          })
        };
      }), _ref6;
    },
    range: /*#__PURE__*/regeneratorRuntime.mark(function range(e, t, n) {
      var r,
          i,
          _args28 = arguments;
      return regeneratorRuntime.wrap(function range$(_context28) {
        while (1) {
          switch (_context28.prev = _context28.next) {
            case 0:
              e = +e, t = +t, n = (i = _args28.length) < 2 ? (t = e, e = 0, 1) : i < 3 ? 1 : +n;
              r = -1, i = 0 | Math.max(0, Math.ceil((t - e) / n));

            case 2:
              if (!(++r < i)) {
                _context28.next = 7;
                break;
              }

              _context28.next = 5;
              return e + r * n;

            case 5:
              _context28.next = 2;
              break;

            case 7:
            case "end":
              return _context28.stop();
          }
        }
      }, range);
    }),
    valueAt: function valueAt(e, t) {
      if (!(!isFinite(t = +t) || t < 0 || t != t | 0)) for (var n, r = -1; !(n = e.next()).done;) {
        if (++r === t) return n.value;
      }
    },
    worker: function worker(e) {
      var t = URL.createObjectURL(new Blob([e], {
        type: "text/javascript"
      })),
          n = new Worker(t);
      return Ue(n, function () {
        n.terminate(), URL.revokeObjectURL(t);
      });
    }
  };

  function Ie(e, t) {
    return function (n) {
      var r,
          i,
          o,
          a,
          s,
          l,
          u,
          c,
          d = n[0],
          f = [],
          h = null,
          p = -1;

      for (s = 1, l = arguments.length; s < l; ++s) {
        if ((r = arguments[s]) instanceof Node) f[++p] = r, d += "\x3c!--o:" + p + "--\x3e";else if (Array.isArray(r)) {
          for (u = 0, c = r.length; u < c; ++u) {
            (i = r[u]) instanceof Node ? (null === h && (f[++p] = h = document.createDocumentFragment(), d += "\x3c!--o:" + p + "--\x3e"), h.appendChild(i)) : (h = null, d += i);
          }

          h = null;
        } else d += r;
        d += n[s];
      }

      if (h = e(d), ++p > 0) {
        for (o = new Array(p), a = document.createTreeWalker(h, NodeFilter.SHOW_COMMENT, null, !1); a.nextNode();) {
          i = a.currentNode, /^o:/.test(i.nodeValue) && (o[+i.nodeValue.slice(2)] = i);
        }

        for (s = 0; s < p; ++s) {
          (i = o[s]) && i.parentNode.replaceChild(f[s], i);
        }
      }

      return 1 === h.childNodes.length ? h.removeChild(h.firstChild) : 11 === h.nodeType ? ((i = t()).appendChild(h), i) : h;
    };
  }

  var ze = Ie(function (e) {
    var t = document.createElement("template");
    return t.innerHTML = e.trim(), document.importNode(t.content, !0);
  }, function () {
    return document.createElement("span");
  });
  var Be = "https://cdn.jsdelivr.net/npm/@observablehq/highlight.js@2.0.0/";

  function He(e) {
    return function () {
      return e("marked@0.3.12/marked.min.js").then(function (t) {
        return Ie(function (n) {
          var r = document.createElement("div");
          r.innerHTML = t(n, {
            langPrefix: ""
          }).trim();
          var i = r.querySelectorAll("pre code[class]");
          return i.length > 0 && e(Be + "highlight.min.js").then(function (t) {
            i.forEach(function (n) {
              function r() {
                t.highlightBlock(n), n.parentNode.classList.add("observablehq--md-pre");
              }

              t.getLanguage(n.className) ? r() : e(Be + "async-languages/index.js").then(function (r) {
                if (r.has(n.className)) return e(Be + "async-languages/" + r.get(n.className)).then(function (e) {
                  t.registerLanguage(n.className, e);
                });
              }).then(r, r);
            });
          }), r;
        }, function () {
          return document.createElement("div");
        });
      });
    };
  }

  function We(e) {
    var t;
    Object.defineProperties(this, {
      generator: {
        value: Re(function (e) {
          return void (t = e);
        })
      },
      value: {
        get: function get() {
          return e;
        },
        set: function set(n) {
          return t(e = n);
        }
      }
    }), void 0 !== e && t(e);
  }

  function Ve() {
    return regeneratorRuntime.wrap(function Ve$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            _context29.next = 2;
            return Date.now();

          case 2:
            _context29.next = 0;
            break;

          case 4:
          case "end":
            return _context29.stop();
        }
      }
    }, _marked16);
  }

  var Ge = new Map();

  function Ke(e, t) {
    var n;
    return (n = Ge.get(e = +e)) ? n.then($e(t)) : (n = Date.now()) >= e ? Promise.resolve(t) : function (e, t) {
      var n = new Promise(function (n) {
        Ge.delete(t);
        var r = t - e;
        if (!(r > 0)) throw new Error("invalid time");
        if (r > 2147483647) throw new Error("too long to wait");
        setTimeout(n, r);
      });
      return Ge.set(t, n), n;
    }(n, e).then($e(t));
  }

  var Ye = {
    delay: function delay(e, t) {
      return new Promise(function (n) {
        setTimeout(function () {
          n(t);
        }, e);
      });
    },
    tick: function tick(e, t) {
      return Ke(Math.ceil((Date.now() + 1) / e) * e, t);
    },
    when: Ke
  };

  function Je(e, t) {
    if (/^(\w+:)|\/\//i.test(e)) return e;
    if (/^[.]{0,2}\//i.test(e)) return new URL(e, null == t ? location : t).href;
    if (!e.length || /^[\s._]/.test(e) || /\s$/.test(e)) throw new Error("illegal name");
    return "https://unpkg.com/" + e;
  }

  function Xe(e) {
    return null == e ? Ce : Ne(e);
  }

  var Qe = Ie(function (e) {
    var t = document.createElementNS("http://www.w3.org/2000/svg", "g");
    return t.innerHTML = e.trim(), t;
  }, function () {
    return document.createElementNS("http://www.w3.org/2000/svg", "g");
  }),
      Ze = String.raw;

  function et(e) {
    return new Promise(function (t, n) {
      var r = document.createElement("link");
      r.rel = "stylesheet", r.href = e, r.onerror = n, r.onload = t, document.head.appendChild(r);
    });
  }

  function tt(e) {
    return function () {
      return Promise.all([e("@observablehq/katex@0.11.1/dist/katex.min.js"), e.resolve("@observablehq/katex@0.11.1/dist/katex.min.css").then(et)]).then(function (e) {
        var t = e[0],
            n = r();

        function r(e) {
          return function () {
            var n = document.createElement("div");
            return t.render(Ze.apply(String, arguments), n, e), n.removeChild(n.firstChild);
          };
        }

        return n.options = r, n.block = r({
          displayMode: !0
        }), n;
      });
    };
  }

  function nt() {
    return Re(function (e) {
      var t = e(document.body.clientWidth);

      function n() {
        var n = document.body.clientWidth;
        n !== t && e(t = n);
      }

      return window.addEventListener("resize", n), function () {
        window.removeEventListener("resize", n);
      };
    });
  }

  var rt = Object.assign(function (e) {
    var t = Xe(e);
    Object.defineProperties(this, {
      DOM: {
        value: Te,
        writable: !0,
        enumerable: !0
      },
      FileAttachment: {
        value: $e(de),
        writable: !0,
        enumerable: !0
      },
      Files: {
        value: Ae,
        writable: !0,
        enumerable: !0
      },
      Generators: {
        value: Fe,
        writable: !0,
        enumerable: !0
      },
      html: {
        value: $e(ze),
        writable: !0,
        enumerable: !0
      },
      md: {
        value: He(t),
        writable: !0,
        enumerable: !0
      },
      Mutable: {
        value: $e(We),
        writable: !0,
        enumerable: !0
      },
      now: {
        value: Ve,
        writable: !0,
        enumerable: !0
      },
      Promises: {
        value: Ye,
        writable: !0,
        enumerable: !0
      },
      require: {
        value: $e(t),
        writable: !0,
        enumerable: !0
      },
      resolve: {
        value: $e(Je),
        writable: !0,
        enumerable: !0
      },
      svg: {
        value: $e(Qe),
        writable: !0,
        enumerable: !0
      },
      tex: {
        value: tt(t),
        writable: !0,
        enumerable: !0
      },
      width: {
        value: nt,
        writable: !0,
        enumerable: !0
      }
    });
  }, {
    resolve: Ce.resolve
  });

  function it(e, t) {
    this.message = e + "", this.input = t;
  }

  it.prototype = Object.create(Error.prototype), it.prototype.name = "RuntimeError", it.prototype.constructor = it;
  var ot = Array.prototype,
      at$1 = ot.map,
      st = ot.forEach;

  function lt(e) {
    return function () {
      return e;
    };
  }

  function ut(e) {
    return e;
  }

  function ct() {}

  var dt = 1,
      ft = 2,
      ht = 3,
      pt = {};

  function mt(e, t, n) {
    var r;
    null == n && (n = pt), Object.defineProperties(this, {
      _observer: {
        value: n,
        writable: !0
      },
      _definition: {
        value: _t,
        writable: !0
      },
      _duplicate: {
        value: void 0,
        writable: !0
      },
      _duplicates: {
        value: void 0,
        writable: !0
      },
      _indegree: {
        value: NaN,
        writable: !0
      },
      _inputs: {
        value: [],
        writable: !0
      },
      _invalidate: {
        value: ct,
        writable: !0
      },
      _module: {
        value: t
      },
      _name: {
        value: null,
        writable: !0
      },
      _outputs: {
        value: new Set(),
        writable: !0
      },
      _promise: {
        value: Promise.resolve(void 0),
        writable: !0
      },
      _reachable: {
        value: n !== pt,
        writable: !0
      },
      _rejector: {
        value: (r = this, function (e) {
          if (e === _t) throw new it(r._name + " is not defined", r._name);
          throw new it(r._name + " could not be resolved", r._name);
        })
      },
      _type: {
        value: e
      },
      _value: {
        value: void 0,
        writable: !0
      },
      _version: {
        value: 0,
        writable: !0
      }
    });
  }

  function vt(e) {
    e._module._runtime._dirty.add(e), e._outputs.add(this);
  }

  function bt(e) {
    e._module._runtime._dirty.add(e), e._outputs.delete(this);
  }

  function _t() {
    throw _t;
  }

  function wt(e) {
    return function () {
      throw new it(e + " is defined more than once");
    };
  }

  function gt(e, t, n) {
    var r = this._module._scope,
        i = this._module._runtime;
    if (this._inputs.forEach(bt, this), t.forEach(vt, this), this._inputs = t, this._definition = n, this._value = void 0, n === ct ? i._variables.delete(this) : i._variables.add(this), e == this._name && r.get(e) === this) this._outputs.forEach(i._updates.add, i._updates);else {
      var o, a;
      if (this._name) if (this._outputs.size) r.delete(this._name), (a = this._module._resolve(this._name))._outputs = this._outputs, this._outputs = new Set(), a._outputs.forEach(function (e) {
        e._inputs[e._inputs.indexOf(this)] = a;
      }, this), a._outputs.forEach(i._updates.add, i._updates), i._dirty.add(a).add(this), r.set(this._name, a);else if ((a = r.get(this._name)) === this) r.delete(this._name);else {
        if (a._type !== ht) throw new Error();
        a._duplicates.delete(this), this._duplicate = void 0, 1 === a._duplicates.size && (a = a._duplicates.keys().next().value, o = r.get(this._name), a._outputs = o._outputs, o._outputs = new Set(), a._outputs.forEach(function (e) {
          e._inputs[e._inputs.indexOf(o)] = a;
        }), a._definition = a._duplicate, a._duplicate = void 0, i._dirty.add(o).add(a), i._updates.add(a), r.set(this._name, a));
      }
      if (this._outputs.size) throw new Error();
      e && ((a = r.get(e)) ? a._type === ht ? (this._definition = wt(e), this._duplicate = n, a._duplicates.add(this)) : a._type === ft ? (this._outputs = a._outputs, a._outputs = new Set(), this._outputs.forEach(function (e) {
        e._inputs[e._inputs.indexOf(a)] = this;
      }, this), i._dirty.add(a).add(this), r.set(e, this)) : (a._duplicate = a._definition, this._duplicate = n, (o = new mt(ht, this._module))._name = e, o._definition = this._definition = a._definition = wt(e), o._outputs = a._outputs, a._outputs = new Set(), o._outputs.forEach(function (e) {
        e._inputs[e._inputs.indexOf(a)] = o;
      }), o._duplicates = new Set([this, a]), i._dirty.add(a).add(o), i._updates.add(a).add(o), r.set(e, o)) : r.set(e, this)), this._name = e;
    }
    return i._updates.add(this), i._compute(), this;
  }

  function yt(e) {
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    Object.defineProperties(this, {
      _runtime: {
        value: e
      },
      _scope: {
        value: new Map()
      },
      _builtins: {
        value: new Map([["invalidation", Ct], ["visibility", Nt]].concat(_toConsumableArray(t)))
      },
      _source: {
        value: null,
        writable: !0
      }
    });
  }

  function xt(e) {
    return e._name;
  }

  Object.defineProperties(mt.prototype, {
    _pending: {
      value: function value() {
        this._observer.pending && this._observer.pending();
      },
      writable: !0,
      configurable: !0
    },
    _fulfilled: {
      value: function value(e) {
        this._observer.fulfilled && this._observer.fulfilled(e, this._name);
      },
      writable: !0,
      configurable: !0
    },
    _rejected: {
      value: function value(e) {
        this._observer.rejected && this._observer.rejected(e, this._name);
      },
      writable: !0,
      configurable: !0
    },
    define: {
      value: function value(e, t, n) {
        switch (arguments.length) {
          case 1:
            n = e, e = t = null;
            break;

          case 2:
            n = t, "string" == typeof e ? t = null : (t = e, e = null);
        }

        return gt.call(this, null == e ? null : e + "", null == t ? [] : at$1.call(t, this._module._resolve, this._module), "function" == typeof n ? n : lt(n));
      },
      writable: !0,
      configurable: !0
    },
    delete: {
      value: function value() {
        return gt.call(this, null, [], ct);
      },
      writable: !0,
      configurable: !0
    },
    import: {
      value: function value(e, t, n) {
        arguments.length < 3 && (n = t, t = e);
        return gt.call(this, t + "", [n._resolve(e + "")], ut);
      },
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperties(yt.prototype, {
    _copy: {
      value: function value(e, t) {
        e._source = this, t.set(this, e);
        var _iteratorNormalCompletion16 = true;
        var _didIteratorError16 = false;
        var _iteratorError16 = undefined;

        try {
          for (var _iterator16 = this._scope[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var _step16$value = _slicedToArray(_step16.value, 2),
                _o4 = _step16$value[0],
                _a3 = _step16$value[1];

            var n = e._scope.get(_o4);

            if (!n || n._type !== dt) if (_a3._definition === ut) {
              var r = _a3._inputs[0],
                  i = r._module;
              e.import(r._name, _o4, t.get(i) || (i._source ? i._copy(new yt(e._runtime, e._builtins), t) : i));
            } else e.define(_o4, _a3._inputs.map(xt), _a3._definition);
          }
        } catch (err) {
          _didIteratorError16 = true;
          _iteratorError16 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion16 && _iterator16.return != null) {
              _iterator16.return();
            }
          } finally {
            if (_didIteratorError16) {
              throw _iteratorError16;
            }
          }
        }

        return e;
      },
      writable: !0,
      configurable: !0
    },
    _resolve: {
      value: function value(e) {
        var t,
            n = this._scope.get(e);

        if (!n) if (n = new mt(ft, this), this._builtins.has(e)) n.define(e, lt(this._builtins.get(e)));else if (this._runtime._builtin._scope.has(e)) n.import(e, this._runtime._builtin);else {
          try {
            t = this._runtime._global(e);
          } catch (t) {
            return n.define(e, (r = t, function () {
              throw r;
            }));
          }

          void 0 === t ? this._scope.set(n._name = e, n) : n.define(e, lt(t));
        }
        var r;
        return n;
      },
      writable: !0,
      configurable: !0
    },
    redefine: {
      value: function value(e) {
        var t = this._scope.get(e);

        if (!t) throw new it(e + " is not defined");
        if (t._type === ht) throw new it(e + " is defined more than once");
        return t.define.apply(t, arguments);
      },
      writable: !0,
      configurable: !0
    },
    define: {
      value: function value() {
        var e = new mt(dt, this);
        return e.define.apply(e, arguments);
      },
      writable: !0,
      configurable: !0
    },
    derive: {
      value: function value(e, t) {
        var _this2 = this;

        var n = new yt(this._runtime, this._builtins);
        return n._source = this, st.call(e, function (e) {
          "object" != _typeof(e) && (e = {
            name: e + ""
          }), null == e.alias && (e.alias = e.name), n.import(e.name, e.alias, t);
        }), Promise.resolve().then(function () {
          var e = new Set([_this2]);
          var _iteratorNormalCompletion17 = true;
          var _didIteratorError17 = false;
          var _iteratorError17 = undefined;

          try {
            for (var _iterator17 = e[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
              var _t27 = _step17.value;
              var _iteratorNormalCompletion18 = true;
              var _didIteratorError18 = false;
              var _iteratorError18 = undefined;

              try {
                for (var _iterator18 = _t27._scope.values()[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                  var _n14 = _step18.value;

                  if (_n14._definition === ut) {
                    var _t28 = _n14._inputs[0]._module,
                        _r3 = _t28._source || _t28;

                    if (_r3 === _this2) return void console.warn("circular module definition; ignoring");
                    e.add(_r3);
                  }
                }
              } catch (err) {
                _didIteratorError18 = true;
                _iteratorError18 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion18 && _iterator18.return != null) {
                    _iterator18.return();
                  }
                } finally {
                  if (_didIteratorError18) {
                    throw _iteratorError18;
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError17 = true;
            _iteratorError17 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion17 && _iterator17.return != null) {
                _iterator17.return();
              }
            } finally {
              if (_didIteratorError17) {
                throw _iteratorError17;
              }
            }
          }

          _this2._copy(n, new Map());
        }), n;
      },
      writable: !0,
      configurable: !0
    },
    import: {
      value: function value() {
        var e = new mt(dt, this);
        return e.import.apply(e, arguments);
      },
      writable: !0,
      configurable: !0
    },
    value: {
      value: function () {
        var _value = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(e) {
          var t;
          return regeneratorRuntime.wrap(function _callee11$(_context30) {
            while (1) {
              switch (_context30.prev = _context30.next) {
                case 0:
                  t = this._scope.get(e);

                  if (t) {
                    _context30.next = 3;
                    break;
                  }

                  throw new it(e + " is not defined");

                case 3:
                  t._observer === pt && (t._observer = !0, this._runtime._dirty.add(t));
                  _context30.next = 6;
                  return this._runtime._compute();

                case 6:
                  return _context30.abrupt("return", t._promise);

                case 7:
                case "end":
                  return _context30.stop();
              }
            }
          }, _callee11, this);
        }));

        function value(_x5) {
          return _value.apply(this, arguments);
        }

        return value;
      }(),
      writable: !0,
      configurable: !0
    },
    variable: {
      value: function value(e) {
        return new mt(dt, this, e);
      },
      writable: !0,
      configurable: !0
    },
    builtin: {
      value: function value(e, t) {
        this._builtins.set(e, t);
      },
      writable: !0,
      configurable: !0
    }
  });
  var Et = "function" == typeof requestAnimationFrame ? requestAnimationFrame : setImmediate;
  var Ct = {},
      Nt = {};

  function St() {
    var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new rt();
    var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (e) {
      return window[e];
    };
    var n = this.module();
    if (Object.defineProperties(this, {
      _dirty: {
        value: new Set()
      },
      _updates: {
        value: new Set()
      },
      _computing: {
        value: null,
        writable: !0
      },
      _init: {
        value: null,
        writable: !0
      },
      _modules: {
        value: new Map()
      },
      _variables: {
        value: new Set()
      },
      _disposed: {
        value: !1,
        writable: !0
      },
      _builtin: {
        value: n
      },
      _global: {
        value: t
      }
    }), e) for (var r in e) {
      new mt(ft, n).define(r, [], e[r]);
    }
  }

  function Pt(e) {
    var t = new Set(e._inputs);
    var _iteratorNormalCompletion19 = true;
    var _didIteratorError19 = false;
    var _iteratorError19 = undefined;

    try {
      for (var _iterator19 = t[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
        var _n15 = _step19.value;
        if (_n15 === e) return !0;

        _n15._inputs.forEach(t.add, t);
      }
    } catch (err) {
      _didIteratorError19 = true;
      _iteratorError19 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion19 && _iterator19.return != null) {
          _iterator19.return();
        }
      } finally {
        if (_didIteratorError19) {
          throw _iteratorError19;
        }
      }
    }

    return !1;
  }

  function qt(e) {
    ++e._indegree;
  }

  function Mt(e) {
    --e._indegree;
  }

  function $t(e) {
    return e._promise.catch(e._rejector);
  }

  function Lt(e) {
    return new Promise(function (t) {
      e._invalidate = t;
    });
  }

  function jt(e, t) {
    var n,
        r,
        i = "function" == typeof IntersectionObserver && t._observer && t._observer._node,
        o = !i,
        a = ct,
        s = ct;
    return i && ((r = new IntersectionObserver(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 1),
          e = _ref8[0];

      return (o = e.isIntersecting) && (n = null, a());
    })).observe(i), e.then(function () {
      return r.disconnect(), r = null, s();
    })), function (e) {
      return o ? Promise.resolve(e) : r ? (n || (n = new Promise(function (e, t) {
        return a = e, s = t;
      })), n.then(function () {
        return e;
      })) : Promise.reject();
    };
  }

  function kt(e) {
    e._invalidate(), e._invalidate = ct, e._pending();
    var t = e._value,
        n = ++e._version,
        r = null,
        i = e._promise = Promise.all(e._inputs.map($t)).then(function (i) {
      if (e._version === n) {
        for (var o = 0, a = i.length; o < a; ++o) {
          switch (i[o]) {
            case Ct:
              i[o] = r = Lt(e);
              break;

            case Nt:
              r || (r = Lt(e)), i[o] = jt(r, e);
          }
        }

        return e._definition.apply(t, i);
      }
    }).then(function (t) {
      return function (e) {
        return e && "function" == typeof e.next && "function" == typeof e.return;
      }(t) ? e._version !== n ? void t.return() : ((r || Lt(e)).then((o = t, function () {
        o.return();
      })), function (e, t, n, r) {
        function i() {
          var n = new Promise(function (e) {
            e(r.next());
          }).then(function (r) {
            return r.done ? void 0 : Promise.resolve(r.value).then(function (r) {
              if (e._version === t) return Tt(e, r, n).then(i), e._fulfilled(r), r;
            });
          });
          n.catch(function (r) {
            e._version === t && (Tt(e, void 0, n), e._rejected(r));
          });
        }

        return new Promise(function (e) {
          e(r.next());
        }).then(function (e) {
          if (!e.done) return n.then(i), e.value;
        });
      }(e, n, i, t)) : t;
      var o;
    });
    i.then(function (t) {
      e._version === n && (e._value = t, e._fulfilled(t));
    }, function (t) {
      e._version === n && (e._value = void 0, e._rejected(t));
    });
  }

  function Tt(e, t, n) {
    var r = e._module._runtime;
    return e._value = t, e._promise = n, e._outputs.forEach(r._updates.add, r._updates), r._compute();
  }

  function At(e, t) {
    e._invalidate(), e._invalidate = ct, e._pending(), ++e._version, e._indegree = NaN, (e._promise = Promise.reject(t)).catch(ct), e._value = void 0, e._rejected(t);
  }

  Object.defineProperties(St, {
    load: {
      value: function value(e, t, n) {
        if ("function" == typeof t && (n = t, t = null), "function" != typeof n) throw new Error("invalid observer");
        null == t && (t = new rt());
        var r = e.modules,
            i = e.id,
            o = new Map(),
            a = new St(t),
            s = l(i);

        function l(e) {
          var t = o.get(e);
          return t || o.set(e, t = a.module()), t;
        }

        var _iteratorNormalCompletion20 = true;
        var _didIteratorError20 = false;
        var _iteratorError20 = undefined;

        try {
          for (var _iterator20 = r[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
            var _e7 = _step20.value;

            var _t29 = l(_e7.id);

            var _r4 = 0;
            var _iteratorNormalCompletion21 = true;
            var _didIteratorError21 = false;
            var _iteratorError21 = undefined;

            try {
              for (var _iterator21 = _e7.variables[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
                var _i2 = _step21.value;
                _i2.from ? _t29.import(_i2.remote, _i2.name, l(_i2.from)) : _t29 === s ? _t29.variable(n(_i2, _r4, _e7.variables)).define(_i2.name, _i2.inputs, _i2.value) : _t29.define(_i2.name, _i2.inputs, _i2.value), ++_r4;
              }
            } catch (err) {
              _didIteratorError21 = true;
              _iteratorError21 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion21 && _iterator21.return != null) {
                  _iterator21.return();
                }
              } finally {
                if (_didIteratorError21) {
                  throw _iteratorError21;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError20 = true;
          _iteratorError20 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion20 && _iterator20.return != null) {
              _iterator20.return();
            }
          } finally {
            if (_didIteratorError20) {
              throw _iteratorError20;
            }
          }
        }

        return a;
      },
      writable: !0,
      configurable: !0
    }
  }), Object.defineProperties(St.prototype, {
    _compute: {
      value: function value() {
        return this._computing || (this._computing = this._computeSoon());
      },
      writable: !0,
      configurable: !0
    },
    _computeSoon: {
      value: function value() {
        var e = this;
        return new Promise(function (t) {
          Et(function () {
            t(), e._disposed || e._computeNow();
          });
        });
      },
      writable: !0,
      configurable: !0
    },
    _computeNow: {
      value: function value() {
        var e,
            t,
            n = [];
        (e = new Set(this._dirty)).forEach(function (t) {
          t._inputs.forEach(e.add, e);

          var n = function (e) {
            if (e._observer !== pt) return !0;
            var t = new Set(e._outputs);
            var _iteratorNormalCompletion22 = true;
            var _didIteratorError22 = false;
            var _iteratorError22 = undefined;

            try {
              for (var _iterator22 = t[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                var _e8 = _step22.value;
                if (_e8._observer !== pt) return !0;

                _e8._outputs.forEach(t.add, t);
              }
            } catch (err) {
              _didIteratorError22 = true;
              _iteratorError22 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion22 && _iterator22.return != null) {
                  _iterator22.return();
                }
              } finally {
                if (_didIteratorError22) {
                  throw _iteratorError22;
                }
              }
            }

            return !1;
          }(t);

          n > t._reachable ? this._updates.add(t) : n < t._reachable && t._invalidate(), t._reachable = n;
        }, this), (e = new Set(this._updates)).forEach(function (t) {
          t._reachable ? (t._indegree = 0, t._outputs.forEach(e.add, e)) : (t._indegree = NaN, e.delete(t));
        }), this._computing = null, this._updates.clear(), this._dirty.clear(), e.forEach(function (e) {
          e._outputs.forEach(qt);
        });

        do {
          for (e.forEach(function (e) {
            0 === e._indegree && n.push(e);
          }); t = n.pop();) {
            kt(t), t._outputs.forEach(r), e.delete(t);
          }

          e.forEach(function (t) {
            Pt(t) && (At(t, new it("circular definition")), t._outputs.forEach(Mt), e.delete(t));
          });
        } while (e.size);

        function r(e) {
          0 == --e._indegree && n.push(e);
        }
      },
      writable: !0,
      configurable: !0
    },
    dispose: {
      value: function value() {
        this._computing = Promise.resolve(), this._disposed = !0, this._variables.forEach(function (e) {
          e._invalidate(), e._version = NaN;
        });
      },
      writable: !0,
      configurable: !0
    },
    module: {
      value: function value(e) {
        var t = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ct;
        var n;
        if (void 0 === e) return (n = this._init) ? (this._init = null, n) : new yt(this);
        if (n = this._modules.get(e)) return n;
        this._init = n = new yt(this), this._modules.set(e, n);

        try {
          e(this, t);
        } finally {
          this._init = null;
        }

        return n;
      },
      writable: !0,
      configurable: !0
    },
    fileAttachments: {
      value: function value(e) {
        return function (t) {
          var n = e(t += "");
          if (null == n) throw new Error("File not found: ".concat(t));
          return new FileAttachment(n, t);
        };
      },
      writable: !0,
      configurable: !0
    }
  });

  function runNotebook(notebook, config, cell) {
    var main = new St().module(notebook);
    main.redefine("config", config);
    return main.value(cell);
  }

  function getFieldNames(fields, list) {
    var m = {};
    list.forEach(function (d) {
      m[d] = fields.get(d).description;
    });
    return m;
  }

  function validateFields(fields, vars) {
    for (var i = 0; i < vars.length; i++) {
      var field = fields.get(vars[i]);

      if (!field) {
        var error = new Error("Field in query var '" + vars[i] + "' isn't a field in the spreadsheet");
        throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
      }
    }
  } // columns: ["a", "b", "c", "d"]
  // returns: [{"a": 23.4, "b", 34.5, "c", 12.3}, ...]


  function filterByNumericColumns(fields, data, columns) {
    return data.map(function (row) {
      var m = {};

      for (var i = 0; i < columns.length; i++) {
        var d = columns[i];
        var index = fields.get(d).index;

        if (row[index] === "") {
          // check for empty cells
          return null;
        }

        m[d] = +row[index];
      }

      return m;
    }).filter(function (p) {
      return p ? true : false;
    });
  }

  function filterByNumericVariables(fields, data, variables) {
    var indices = [];

    for (var key in variables) {
      if (variables.hasOwnProperty(key)) {
        var index = fields.get(variables[key]).index;
        indices.push({
          key: key,
          index: index
        });
      }
    }

    return data.map(function (row) {
      var m = {};

      for (var i = 0; i < indices.length; i++) {
        var idx = indices[i];

        if (row[idx.index].length == 0) {
          // check for empty cells
          return null;
        }

        m[idx.key] = +row[idx.index];
      }

      return m;
    }).filter(function (p) {
      return p ? true : false;
    });
  }

  var lib$2 = {
    runNotebook: runNotebook,
    getFieldNames: getFieldNames,
    validateFields: validateFields,
    filterByNumericColumns: filterByNumericColumns,
    filterByNumericVariables: filterByNumericVariables
  };

  function _templateObject() {
    var data = _taggedTemplateLiteral(["# Set defaults"]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }

  // https://observablehq.com/d/9821d94b209bcc62@6
  function define$1(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject());
    });
    main.variable(observer("setDefaults")).define("setDefaults", function () {
      return function (config, defaults) {
        for (var key in defaults) {
          if (defaults.hasOwnProperty(key) && !config.hasOwnProperty(key)) {
            config[key] = defaults[key];
          }
        }
      };
    });
    return main;
  }

  function _templateObject$1() {
    var data = _taggedTemplateLiteral(["# Pearson correlation code"]);

    _templateObject$1 = function _templateObject() {
      return data;
    };

    return data;
  }

  // https://observablehq.com/d/3f2a225750ecdcdd@60
  function define$2(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject$1());
    });
    main.variable(observer("correlationMatrix")).define("correlationMatrix", ["calcArrays", "pearson"], function (calcArrays, pearson) {
      return function correlationMatrix(data, cols) {
        var out = [];
        cols.forEach(function (colx) {
          cols.forEach(function (coly) {
            var arrays = calcArrays(data, colx, coly);
            var obj = {
              column_x: colx,
              column_y: coly,
              correlation: pearson(arrays[0], arrays[1])
            };
            out.push(obj);
          });
        });
        return out;
      };
    });
    main.variable(observer("calcArrays")).define("calcArrays", ["pluck"], function (pluck) {
      return function calcArrays(data, column_a, column_b) {
        var array_a = pluck(data, column_a);
        var array_b = pluck(data, column_b);
        return [array_a, array_b];
      };
    });
    main.variable(observer("pluck")).define("pluck", function () {
      return function pluck(arr, mapper) {
        return arr.map(function (d) {
          return typeof mapper === "string" ? d[mapper] : mapper(d);
        });
      };
    });
    main.variable(observer("pearson")).define("pearson", function () {
      return function pearson(x, y) {
        var shortestArrayLength = 0;

        if (x.length == y.length) {
          shortestArrayLength = x.length;
        } else if (x.length > y.length) {
          shortestArrayLength = y.length;
          console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
        } else {
          shortestArrayLength = x.length;
          console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
        }

        var xy = [];
        var x2 = [];
        var y2 = [];

        for (var i = 0; i < shortestArrayLength; i++) {
          xy.push(x[i] * y[i]);
          x2.push(x[i] * x[i]);
          y2.push(y[i] * y[i]);
        }

        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_x2 = 0;
        var sum_y2 = 0;

        for (var i = 0; i < shortestArrayLength; i++) {
          sum_x += x[i];
          sum_y += y[i];
          sum_xy += xy[i];
          sum_x2 += x2[i];
          sum_y2 += y2[i];
        }

        var step1 = shortestArrayLength * sum_xy - sum_x * sum_y;
        var step2 = shortestArrayLength * sum_x2 - sum_x * sum_x;
        var step3 = shortestArrayLength * sum_y2 - sum_y * sum_y;
        var step4 = Math.sqrt(step2 * step3);
        var answer = step1 / step4;
        return answer;
      };
    });
    return main;
  }

  function _templateObject$2() {
    var data = _taggedTemplateLiteral(["# Half correlation matrix"]);

    _templateObject$2 = function _templateObject() {
      return data;
    };

    return data;
  }
  function define$3(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject$2());
    });
    main.variable(observer("chart")).define("chart", ["make"], function (make) {
      var svg = make();
      return svg.node();
    });
    main.variable(observer("config")).define("config", function () {
      return {};
    });
    main.variable(observer("defaults")).define("defaults", function () {
      return {
        // {kidney_disease: 3.5, pulmonary_disease: 5.3, diabetes: 9.5, ...}
        data: [],
        // ["kidney_disease", "pulmonary_disease", "diabetes", ...]
        columns: [],
        // 65
        binSize: 65
      };
    });
    var child1 = runtime.module(define$1);
    main.import("setDefaults", child1);
    main.variable(observer("make")).define("make", ["setDefaults", "config", "defaults", "d3", "getDimensions", "correlationMatrix", "halfMatrix", "makeScaleX", "makeAxisX", "makeAxisY", "makeBoxes", "scaleColor", "annotateBoxes"], function (setDefaults, config, defaults, d3, getDimensions, correlationMatrix, halfMatrix, makeScaleX, makeAxisX, makeAxisY, makeBoxes, scaleColor, annotateBoxes) {
      return function () {
        setDefaults(config, defaults);

        if (config.data.length == 0) {
          return d3.create("svg");
        }

        var _getDimensions = getDimensions(),
            margin = _getDimensions.margin,
            w = _getDimensions.w,
            h = _getDimensions.h,
            fw = _getDimensions.fw,
            fh = _getDimensions.fh;

        var correlations = correlationMatrix(config.data, config.columns),
            matrix = halfMatrix(config.columns, correlations),
            scaleX = makeScaleX(config.columns, w),
            scaleY = makeScaleX(config.columns, h);
        var svg = d3.create("svg").attr("viewBox", [0, 0, fw, fh]).attr("color", "rgba(5, 5, 38, 0.5)");
        var axisX = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(h, ")"));
        makeAxisX(axisX, scaleX);
        var axisY = svg.append("g").attr("transform", "translate(".concat(margin.left - 1, ",0)"));
        makeAxisY(axisY, scaleY);
        var boxesLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",0)"));
        makeBoxes(boxesLayer, matrix, scaleX, scaleY, scaleColor);
        var textLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",0)"));
        annotateBoxes(textLayer, matrix, scaleX, scaleY);
        return svg;
      };
    });
    main.variable(observer("makeBoxes")).define("makeBoxes", function () {
      return function (g, matrix, scaleX, scaleY, scaleColor) {
        g.attr("fill", "none").attr("pointer-events", "all").selectAll("rect").data(matrix.filter(function (d) {
          return d.column_x != d.column_y;
        })).join("rect").attr("x", function (d) {
          return scaleX(d.column_x);
        }).attr("y", function (d) {
          return scaleY(d.column_y);
        }).attr("width", scaleX.bandwidth()).attr("height", scaleX.bandwidth()).attr("fill", function (d) {
          return scaleColor(d.correlation);
        }).attr("stroke", "none");
        g.append("g").attr("fill", "none").attr("pointer-events", "all").selectAll("rect").data(matrix.filter(function (d) {
          return d.column_x == d.column_y;
        })).join("rect").attr("x", function (d) {
          return scaleX(d.column_x);
        }).attr("y", function (d) {
          return scaleY(d.column_y);
        }).attr("width", scaleX.bandwidth()).attr("height", scaleX.bandwidth()).attr("fill", "#ffffff").attr("stroke", "#999999").attr("stroke-width", 0.5);
      };
    });
    main.variable(observer("annotateBoxes")).define("annotateBoxes", function () {
      return function (g, matrix, scaleX, scaleY) {
        g.attr("fill", "none").attr("pointer-events", "all").selectAll("text").data(matrix).join("text").text(function (d) {
          return d.correlation.toFixed(2);
        }).attr('dominant-baseline', 'middle').attr('fill', function (d) {
          if (d.column_x == d.column_y) return "none";
          return 'rgba(0, 0, 0, 0.7)';
        }).attr('font-family', 'sans-serif').attr('font-size', '11px').attr('font-weight', 'bold').attr('text-anchor', 'middle').attr('transform', function (d) {
          var x = scaleX(d.column_x),
              y = scaleY(d.column_y);
          return "translate(".concat(x + scaleX.bandwidth() / 2, ", ").concat(y + scaleY.bandwidth() / 2, ")");
        });
      };
    });
    main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function (d3) {
      return function (g, scaleY) {
        g.call(d3.axisLeft(scaleY).tickPadding(8).tickSize(0)).call(function (g) {
          return g.select(".domain").remove();
        }).call(function (g) {
          return g.selectAll("text").attr("font-size", 10);
        });
      };
    });
    main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function (d3) {
      return function (g, scaleX) {
        g.call(d3.axisBottom(scaleX).tickPadding(8).tickSize(0)).call(function (g) {
          return g.select(".domain").remove();
        }).call(function (g) {
          return g.selectAll("text").attr("font-size", 10).style("text-anchor", "start").attr("dx", "1em").attr("dy", "0.6em").attr("transform", function (d) {
            return "rotate(40)";
          });
        });
      };
    });
    main.variable(observer("scaleColor")).define("scaleColor", ["d3"], function (d3) {
      return function (correlation) {
        var lightReds = d3.scaleLinear().domain([-1.0, 0.0]).range([0.35, 0.0]);
        var lightBlues = d3.scaleLinear().domain([0.0, 1.0]).range([0.0, 0.35]);

        if (correlation >= 0) {
          return d3.interpolateBlues(lightBlues(correlation));
        }

        return d3.interpolateReds(lightReds(correlation));
      };
    });
    main.variable(observer("makeScaleY")).define("makeScaleY", ["d3"], function (d3) {
      return function (columns, h) {
        return d3.scaleBand().domain(columns).range([0, h]);
      };
    });
    main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function (d3) {
      return function (columns, w) {
        return d3.scaleBand().domain(columns).range([0, w]);
      };
    });
    main.variable(observer("getDimensions")).define("getDimensions", ["config"], function (config) {
      return function () {
        var margin = {
          left: 100,
          top: 0,
          right: 20,
          bottom: 100
        };
        var w = config.columns.length * config.binSize,
            h = w;
        return {
          margin: margin,
          w: w,
          h: h,
          fw: margin.left + w + margin.right,
          fh: margin.top + h + margin.bottom
        };
      };
    });
    main.variable(observer("halfMatrix")).define("halfMatrix", function () {
      return function (columns, matrix) {
        var indices = {};
        columns.map(function (d, i) {
          indices[d] = i;
        });
        return matrix.filter(function (d) {
          var ix = indices[d.column_x],
              iy = indices[d.column_y];
          return ix <= iy;
        });
      };
    });
    var child2 = runtime.module(define$2);
    main.import("correlationMatrix", child2);
    main.variable(observer("d3")).define("d3", ["require"], function (require) {
      return require("d3@5");
    });
    return main;
  }

  //
  // context: {
  //   columns: ["a", "b", "c", "d"]
  // }
  // config: {
  //   data: [{"a": 23.4, "b", 34.5, "c", 12.3}, ...]
  // }

  var correlationMatrix = {
    make: function make(fields, data, ctx) {
      var df = lib$2.filterByNumericColumns(fields, data, ctx.columns);
      var config = {
        data: df,
        columns: ctx.columns
      };
      return lib$2.runNotebook(define$3, config, "chart");
    },
    checkContext: function checkContext(fields, ctx) {
      return lib$2.validateFields(fields, ctx.columns);
    },
    toQuery: function toQuery(ctx) {
      return ["columns=" + ctx.columns.join(',')];
    },
    fromQuery: function fromQuery(fields, qvars) {
      var columns = qvars.get("columns").split(',');
      return {
        columns: columns
      };
    },
    describe: function describe(fields, ctx) {
      return {
        plot: "Correlation matrix",
        variables: lib$2.getFieldNames(fields, ctx.columns)
      };
    }
  };
   //export { notebookURL };

  var template = "<div class=\"flex-between\"><div class=\"w-65 contains-object\"></div><div class=\"about w-35\"><p>Strong and weak relationships between pairs of variables (columns) in your spreadsheet.</p><p><svg viewBox=\"0,0,50,50\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect x=\"0\" y=\"0\" width=\"50\" height=\"50\" fill=\"rgb(165, 204, 228)\" stroke=\"none\"></rect></svg> means that when one variable increases, the other usually does as well. <svg viewBox=\"0,0,50,50\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect x=\"0\" y=\"0\" width=\"50\" height=\"50\" fill=\"rgb(252, 154, 124)\" stroke=\"none\"></rect></svg> is the opposite of <svg viewBox=\"0,0,50,50\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect x=\"0\" y=\"0\" width=\"50\" height=\"50\" fill=\"rgb(165, 204, 228)\" stroke=\"none\"></rect></svg>. When one variable increases, the other usually decreases. <svg viewBox=\"0,0,50,50\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect x=\"0\" y=\"0\" width=\"50\" height=\"50\" fill=\"rgb(230, 240, 249)\" stroke=\"none\"></rect></svg> or <svg viewBox=\"0,0,50,50\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect x=\"0\" y=\"0\" width=\"50\" height=\"50\" fill=\"rgb(254, 229, 218)\" stroke=\"none\"></rect></svg> means a weak relationship, so these variables may not have much to do with each other, or you may need more data to be sure.</p><p>Numbers -1 <svg viewBox=\"0,0,100,15\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><path stroke=\"none\" fill=\"rgb(252, 154, 124)\" d=\"M0 0 1 0 1 15 0 15 0 0\"></path><path stroke=\"none\" fill=\"rgb(252, 157, 127)\" d=\"M1 0 2 0 2 15 1 15 1 0\"></path><path stroke=\"none\" fill=\"rgb(252, 159, 129)\" d=\"M2 0 3 0 3 15 2 15 2 0\"></path><path stroke=\"none\" fill=\"rgb(252, 161, 132)\" d=\"M3 0 4 0 4 15 3 15 3 0\"></path><path stroke=\"none\" fill=\"rgb(252, 163, 134)\" d=\"M4 0 5 0 5 15 4 15 4 0\"></path><path stroke=\"none\" fill=\"rgb(252, 166, 137)\" d=\"M5 0 6 0 6 15 5 15 5 0\"></path><path stroke=\"none\" fill=\"rgb(252, 168, 139)\" d=\"M6 0 7 0 7 15 6 15 6 0\"></path><path stroke=\"none\" fill=\"rgb(252, 170, 142)\" d=\"M7 0 8 0 8 15 7 15 7 0\"></path><path stroke=\"none\" fill=\"rgb(252, 172, 145)\" d=\"M8 0 9 0 9 15 8 15 8 0\"></path><path stroke=\"none\" fill=\"rgb(252, 175, 147)\" d=\"M9 0 10 0 10 15 9 15 9 0\"></path><path stroke=\"none\" fill=\"rgb(252, 177, 150)\" d=\"M10 0 11 0 11 15 10 15 10 0\"></path><path stroke=\"none\" fill=\"rgb(252, 179, 153)\" d=\"M11 0 12 0 12 15 11 15 11 0\"></path><path stroke=\"none\" fill=\"rgb(252, 181, 155)\" d=\"M12 0 13 0 13 15 12 15 12 0\"></path><path stroke=\"none\" fill=\"rgb(252, 184, 158)\" d=\"M13 0 14 0 14 15 13 15 13 0\"></path><path stroke=\"none\" fill=\"rgb(252, 186, 161)\" d=\"M14 0 15 0 15 15 14 15 14 0\"></path><path stroke=\"none\" fill=\"rgb(252, 188, 163)\" d=\"M15 0 16 0 16 15 15 15 15 0\"></path><path stroke=\"none\" fill=\"rgb(252, 190, 166)\" d=\"M16 0 17 0 17 15 16 15 16 0\"></path><path stroke=\"none\" fill=\"rgb(253, 192, 169)\" d=\"M17 0 18 0 18 15 17 15 17 0\"></path><path stroke=\"none\" fill=\"rgb(253, 194, 171)\" d=\"M18 0 19 0 19 15 18 15 18 0\"></path><path stroke=\"none\" fill=\"rgb(253, 196, 174)\" d=\"M19 0 20 0 20 15 19 15 19 0\"></path><path stroke=\"none\" fill=\"rgb(253, 199, 177)\" d=\"M20 0 21 0 21 15 20 15 20 0\"></path><path stroke=\"none\" fill=\"rgb(253, 201, 179)\" d=\"M21 0 22 0 22 15 21 15 21 0\"></path><path stroke=\"none\" fill=\"rgb(253, 203, 182)\" d=\"M22 0 23 0 23 15 22 15 22 0\"></path><path stroke=\"none\" fill=\"rgb(253, 205, 185)\" d=\"M23 0 24 0 24 15 23 15 23 0\"></path><path stroke=\"none\" fill=\"rgb(253, 207, 187)\" d=\"M24 0 25 0 25 15 24 15 24 0\"></path><path stroke=\"none\" fill=\"rgb(253, 209, 190)\" d=\"M25 0 26 0 26 15 25 15 25 0\"></path><path stroke=\"none\" fill=\"rgb(253, 210, 192)\" d=\"M26 0 27 0 27 15 26 15 26 0\"></path><path stroke=\"none\" fill=\"rgb(253, 212, 195)\" d=\"M27 0 28 0 28 15 27 15 27 0\"></path><path stroke=\"none\" fill=\"rgb(253, 214, 197)\" d=\"M28 0 29 0 29 15 28 15 28 0\"></path><path stroke=\"none\" fill=\"rgb(254, 216, 200)\" d=\"M29 0 30 0 30 15 29 15 29 0\"></path><path stroke=\"none\" fill=\"rgb(254, 218, 202)\" d=\"M30 0 31 0 31 15 30 15 30 0\"></path><path stroke=\"none\" fill=\"rgb(254, 219, 204)\" d=\"M31 0 32 0 32 15 31 15 31 0\"></path><path stroke=\"none\" fill=\"rgb(254, 221, 207)\" d=\"M32 0 33 0 33 15 32 15 32 0\"></path><path stroke=\"none\" fill=\"rgb(254, 223, 209)\" d=\"M33 0 34 0 34 15 33 15 33 0\"></path><path stroke=\"none\" fill=\"rgb(254, 224, 211)\" d=\"M34 0 35 0 35 15 34 15 34 0\"></path><path stroke=\"none\" fill=\"rgb(254, 226, 213)\" d=\"M35 0 36 0 36 15 35 15 35 0\"></path><path stroke=\"none\" fill=\"rgb(254, 227, 215)\" d=\"M36 0 37 0 37 15 36 15 36 0\"></path><path stroke=\"none\" fill=\"rgb(254, 229, 217)\" d=\"M37 0 38 0 38 15 37 15 37 0\"></path><path stroke=\"none\" fill=\"rgb(254, 230, 219)\" d=\"M38 0 39 0 39 15 38 15 38 0\"></path><path stroke=\"none\" fill=\"rgb(254, 231, 221)\" d=\"M39 0 40 0 40 15 39 15 39 0\"></path><path stroke=\"none\" fill=\"rgb(254, 233, 223)\" d=\"M40 0 41 0 41 15 40 15 40 0\"></path><path stroke=\"none\" fill=\"rgb(254, 234, 224)\" d=\"M41 0 42 0 42 15 41 15 41 0\"></path><path stroke=\"none\" fill=\"rgb(255, 235, 226)\" d=\"M42 0 43 0 43 15 42 15 42 0\"></path><path stroke=\"none\" fill=\"rgb(255, 237, 228)\" d=\"M43 0 44 0 44 15 43 15 43 0\"></path><path stroke=\"none\" fill=\"rgb(255, 238, 230)\" d=\"M44 0 45 0 45 15 44 15 44 0\"></path><path stroke=\"none\" fill=\"rgb(255, 239, 232)\" d=\"M45 0 46 0 46 15 45 15 45 0\"></path><path stroke=\"none\" fill=\"rgb(255, 240, 233)\" d=\"M46 0 47 0 47 15 46 15 46 0\"></path><path stroke=\"none\" fill=\"rgb(255, 241, 235)\" d=\"M47 0 48 0 48 15 47 15 47 0\"></path><path stroke=\"none\" fill=\"rgb(255, 243, 237)\" d=\"M48 0 49 0 49 15 48 15 48 0\"></path><path stroke=\"none\" fill=\"rgb(255, 244, 238)\" d=\"M49 0 50 0 50 15 49 15 49 0\"></path><path stroke=\"none\" fill=\"rgb(247, 251, 255)\" d=\"M50 0 51 0 51 15 50 15 50 0\"></path><path stroke=\"none\" fill=\"rgb(246, 250, 255)\" d=\"M51 0 52 0 52 15 51 15 51 0\"></path><path stroke=\"none\" fill=\"rgb(244, 249, 254)\" d=\"M52 0 53 0 53 15 52 15 52 0\"></path><path stroke=\"none\" fill=\"rgb(243, 248, 254)\" d=\"M53 0 54 0 54 15 53 15 53 0\"></path><path stroke=\"none\" fill=\"rgb(241, 247, 253)\" d=\"M54 0 55 0 55 15 54 15 54 0\"></path><path stroke=\"none\" fill=\"rgb(240, 247, 253)\" d=\"M55 0 56 0 56 15 55 15 55 0\"></path><path stroke=\"none\" fill=\"rgb(239, 246, 252)\" d=\"M56 0 57 0 57 15 56 15 56 0\"></path><path stroke=\"none\" fill=\"rgb(237, 245, 252)\" d=\"M57 0 58 0 58 15 57 15 57 0\"></path><path stroke=\"none\" fill=\"rgb(236, 244, 251)\" d=\"M58 0 59 0 59 15 58 15 58 0\"></path><path stroke=\"none\" fill=\"rgb(234, 243, 251)\" d=\"M59 0 60 0 60 15 59 15 59 0\"></path><path stroke=\"none\" fill=\"rgb(233, 242, 251)\" d=\"M60 0 61 0 61 15 60 15 60 0\"></path><path stroke=\"none\" fill=\"rgb(232, 241, 250)\" d=\"M61 0 62 0 62 15 61 15 61 0\"></path><path stroke=\"none\" fill=\"rgb(230, 240, 250)\" d=\"M62 0 63 0 63 15 62 15 62 0\"></path><path stroke=\"none\" fill=\"rgb(229, 239, 249)\" d=\"M63 0 64 0 64 15 63 15 63 0\"></path><path stroke=\"none\" fill=\"rgb(227, 238, 249)\" d=\"M64 0 65 0 65 15 64 15 64 0\"></path><path stroke=\"none\" fill=\"rgb(226, 238, 248)\" d=\"M65 0 66 0 66 15 65 15 65 0\"></path><path stroke=\"none\" fill=\"rgb(225, 237, 248)\" d=\"M66 0 67 0 67 15 66 15 66 0\"></path><path stroke=\"none\" fill=\"rgb(223, 236, 247)\" d=\"M67 0 68 0 68 15 67 15 67 0\"></path><path stroke=\"none\" fill=\"rgb(222, 235, 247)\" d=\"M68 0 69 0 69 15 68 15 68 0\"></path><path stroke=\"none\" fill=\"rgb(221, 234, 246)\" d=\"M69 0 70 0 70 15 69 15 69 0\"></path><path stroke=\"none\" fill=\"rgb(219, 233, 246)\" d=\"M70 0 71 0 71 15 70 15 70 0\"></path><path stroke=\"none\" fill=\"rgb(218, 232, 246)\" d=\"M71 0 72 0 72 15 71 15 71 0\"></path><path stroke=\"none\" fill=\"rgb(216, 231, 245)\" d=\"M72 0 73 0 73 15 72 15 72 0\"></path><path stroke=\"none\" fill=\"rgb(215, 230, 245)\" d=\"M73 0 74 0 74 15 73 15 73 0\"></path><path stroke=\"none\" fill=\"rgb(214, 229, 244)\" d=\"M74 0 75 0 75 15 74 15 74 0\"></path><path stroke=\"none\" fill=\"rgb(212, 229, 244)\" d=\"M75 0 76 0 76 15 75 15 75 0\"></path><path stroke=\"none\" fill=\"rgb(211, 228, 243)\" d=\"M76 0 77 0 77 15 76 15 76 0\"></path><path stroke=\"none\" fill=\"rgb(209, 227, 243)\" d=\"M77 0 78 0 78 15 77 15 77 0\"></path><path stroke=\"none\" fill=\"rgb(208, 226, 242)\" d=\"M78 0 79 0 79 15 78 15 78 0\"></path><path stroke=\"none\" fill=\"rgb(206, 225, 242)\" d=\"M79 0 80 0 80 15 79 15 79 0\"></path><path stroke=\"none\" fill=\"rgb(205, 224, 241)\" d=\"M80 0 81 0 81 15 80 15 80 0\"></path><path stroke=\"none\" fill=\"rgb(203, 223, 241)\" d=\"M81 0 82 0 82 15 81 15 81 0\"></path><path stroke=\"none\" fill=\"rgb(202, 222, 240)\" d=\"M82 0 83 0 83 15 82 15 82 0\"></path><path stroke=\"none\" fill=\"rgb(200, 221, 240)\" d=\"M83 0 84 0 84 15 83 15 83 0\"></path><path stroke=\"none\" fill=\"rgb(198, 220, 239)\" d=\"M84 0 85 0 85 15 84 15 84 0\"></path><path stroke=\"none\" fill=\"rgb(197, 219, 238)\" d=\"M85 0 86 0 86 15 85 15 85 0\"></path><path stroke=\"none\" fill=\"rgb(195, 219, 238)\" d=\"M86 0 87 0 87 15 86 15 86 0\"></path><path stroke=\"none\" fill=\"rgb(193, 218, 237)\" d=\"M87 0 88 0 88 15 87 15 87 0\"></path><path stroke=\"none\" fill=\"rgb(191, 217, 237)\" d=\"M88 0 89 0 89 15 88 15 88 0\"></path><path stroke=\"none\" fill=\"rgb(189, 216, 236)\" d=\"M89 0 90 0 90 15 89 15 89 0\"></path><path stroke=\"none\" fill=\"rgb(187, 215, 235)\" d=\"M90 0 91 0 91 15 90 15 90 0\"></path><path stroke=\"none\" fill=\"rgb(185, 214, 235)\" d=\"M91 0 92 0 92 15 91 15 91 0\"></path><path stroke=\"none\" fill=\"rgb(183, 213, 234)\" d=\"M92 0 93 0 93 15 92 15 92 0\"></path><path stroke=\"none\" fill=\"rgb(181, 212, 233)\" d=\"M93 0 94 0 94 15 93 15 93 0\"></path><path stroke=\"none\" fill=\"rgb(179, 211, 232)\" d=\"M94 0 95 0 95 15 94 15 94 0\"></path><path stroke=\"none\" fill=\"rgb(177, 210, 232)\" d=\"M95 0 96 0 96 15 95 15 95 0\"></path><path stroke=\"none\" fill=\"rgb(174, 209, 231)\" d=\"M96 0 97 0 97 15 96 15 96 0\"></path><path stroke=\"none\" fill=\"rgb(172, 208, 230)\" d=\"M97 0 98 0 98 15 97 15 97 0\"></path><path stroke=\"none\" fill=\"rgb(170, 207, 230)\" d=\"M98 0 99 0 99 15 98 15 98 0\"></path><path stroke=\"none\" fill=\"rgb(167, 206, 229)\" d=\"M99 0 100 0 100 15 99 15 99 0\"></path><path stroke=\"none\" fill=\"rgb(165, 204, 228)\" d=\"M100 0 101 0 101 15 100 15 100 0\"></path></svg> 1 are scores. Use them to find the strongest relationships (close to 1 or -1) and the weakest ones (close to 0). <a href=\"https://en.wikipedia.org/wiki/Pearson_correlation_coefficient\">Learn more</a></p></div></div>";
  var correlation1 = {
    canUse: function canUse(fields) {
      var fs = fields.numericalRandom;
      return fs && fs.length > 1;
    },
    visualization: correlationMatrix,
    variations: function variations(fields) {
      var fs = fields.numericalRandom;
      return [{
        columns: fs
      }];
    },
    compile: function compile(svgRoots) {
      var root = lib_template.parseTemplate(template);
      var object = root.querySelector(".contains-object");
      object.appendChild(svgRoots[0]);
      return root;
    }
  };

  function _templateObject$3() {
    var data = _taggedTemplateLiteral(["# Regression code"]);

    _templateObject$3 = function _templateObject() {
      return data;
    };

    return data;
  }

  // https://observablehq.com/d/bba258fd25367b55@16
  function define$4(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject$3());
    });
    main.variable(observer("makeRegression")).define("makeRegression", ["r", "d3", "correlation"], function (r, d3, correlation) {
      return function (points, xScale, yScale) {
        var loess = r.regressionLoess().x(function (d) {
          return d.x;
        }).y(function (d) {
          return d.y;
        }).bandwidth(0.9);
        var lineLoess = d3.line().x(function (d) {
          return xScale(d[0]);
        }).y(function (d) {
          return yScale(d[1]);
        });

        if (points.length == 0) {
          return {
            points: [],
            lineGenerator: lineLoess,
            correlated: 0
          };
        }

        var ps = loess(points);
        return {
          points: ps,
          lineGenerator: lineLoess,
          correlated: correlation(points, ps)
        };
      };
    });
    main.variable(observer("correlation")).define("correlation", ["d3"], function (d3) {
      return function (ds, rpoints) {
        var regressFirst = rpoints[0];
        var regressLast = rpoints[rpoints.length - 1];
        var slope = (regressLast[1] - regressFirst[1]) / (regressLast[0] - regressFirst[0]);
        var xEnds = d3.extent(ds, function (d) {
          return d.x;
        });
        var yEnds = d3.extent(ds, function (d) {
          return d.y;
        });
        var perfectSlope = (yEnds[1] - yEnds[0]) / (xEnds[1] - xEnds[0]);
        var positive = [perfectSlope / 2, perfectSlope * 2];
        var negative = [-positive[0], -positive[1]];

        if (slope >= positive[0] && slope <= positive[1]) {
          return 1;
        }

        if (slope >= negative[1] && slope <= negative[0]) {
          return -1;
        }

        return 0;
      };
    });
    main.variable(observer("r")).define("r", ["require"], function (require) {
      return require.alias({
        "d3-regression": "d3-regression@1"
      })("d3-regression");
    });
    main.variable(observer("d3")).define("d3", ["require"], function (require) {
      return require("d3@5");
    });
    return main;
  }

  function _templateObject$4() {
    var data = _taggedTemplateLiteral(["# Scatterplot with loess regression"]);

    _templateObject$4 = function _templateObject() {
      return data;
    };

    return data;
  }
  function define$5(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject$4());
    });
    main.variable(observer("chart")).define("chart", ["make"], function (make) {
      var svg = make();
      return svg.node();
    });
    main.variable(observer("config")).define("config", function () {
      return {};
    });
    main.variable(observer("defaults")).define("defaults", function () {
      return {
        // data: [{ x: 5.67, y: 10.45}]
        data: [],
        // "diabetes"
        labelX: "",
        // "obese"
        labelY: ""
      };
    });
    var child1 = runtime.module(define$1);
    main.import("setDefaults", child1);
    main.variable(observer("make")).define("make", ["setDefaults", "config", "defaults", "d3", "getDimensions", "makeScaleX", "makeScaleY", "makeRegression", "makeBackground", "makeAxisX", "makeAxisY", "plotPoints", "scaleColor", "makeRegressionLine"], function (setDefaults, config, defaults, d3, getDimensions, makeScaleX, makeScaleY, makeRegression, makeBackground, makeAxisX, makeAxisY, plotPoints, scaleColor, makeRegressionLine) {
      return function () {
        setDefaults(config, defaults);

        if (config.data.length == 0) {
          return d3.create("svg");
        }

        var _getDimensions = getDimensions(),
            margin = _getDimensions.margin,
            w = _getDimensions.w,
            h = _getDimensions.h,
            fw = _getDimensions.fw,
            fh = _getDimensions.fh;

        var scaleX = makeScaleX(config.data, w),
            scaleY = makeScaleY(config.data, h),
            regression = makeRegression(config.data, scaleX, scaleY);
        var svg = d3.create("svg").attr("viewBox", [0, 0, fw, fh]).attr("color", "rgba(5, 5, 38, 0.5)");
        var backgroundLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(margin.top - 15, ")"));
        makeBackground(backgroundLayer, w + 15, h + 15);
        var axisX = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(fh - margin.bottom, ")"));
        makeAxisX(axisX, scaleX, w, config.labelX);
        var axisY = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(margin.top, ")"));
        makeAxisY(axisY, scaleY, config.labelY);
        var pointsLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(margin.top, ")"));
        plotPoints(pointsLayer, config.data, regression.correlated, scaleX, scaleY, scaleColor);
        var lineLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(margin.top, ")"));
        makeRegressionLine(lineLayer, regression, scaleColor);
        return svg;
      };
    });
    main.variable(observer("makeRegressionLine")).define("makeRegressionLine", function () {
      return function (g, regression, scaleColor) {
        g.append("path").attr("fill", "none").attr("stroke", scaleColor(regression.correlated, 0.8)).attr("stroke-width", 2).datum(regression.points).attr("d", regression.lineGenerator);
      };
    });
    main.variable(observer("plotPoints")).define("plotPoints", function () {
      return function (g, points, correlated, scaleX, scaleY, scaleColor) {
        g.selectAll("cirlce").data(points).join("circle").attr("r", 3).attr("cx", function (d) {
          return scaleX(d.x);
        }).attr("cy", function (d) {
          return scaleY(d.y);
        }).attr("stroke", "none").attr("fill", scaleColor(correlated, 0.4));
      };
    });
    main.variable(observer("makeBackground")).define("makeBackground", function () {
      return function (g, w, h) {
        g.append("rect").attr("fill", "#F7FBFB").attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);
      };
    });
    main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function (d3) {
      return function (g, scaleY, labelY) {
        g.call(d3.axisLeft(scaleY)).call(function (g) {
          return g.select(".domain").remove();
        }).call(function (g) {
          return g.selectAll("text").attr("font-size", 12);
        }).call(function (g) {
          return g.select(".tick:last-of-type text").clone().attr("x", 8).attr("fill", "rgba(5, 5, 38, 0.5)").attr("text-anchor", "start").attr("font-weight", "bold").attr("font-size", 12).text(labelY);
        });
      };
    });
    main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function (d3) {
      return function (g, scaleX, endX, labelX) {
        g.call(d3.axisBottom(scaleX)).call(function (g) {
          return g.select(".domain").remove();
        }).call(function (g) {
          return g.selectAll("text").attr("font-size", 12);
        }).call(function (g) {
          return g.append("text").attr("fill", "rgba(5, 5, 38, 0.5)").attr("font-weight", "bold").attr("text-anchor", "end").attr("font-size", 12).attr("x", endX).attr("y", -12).text(labelX);
        });
      };
    });
    main.variable(observer("scaleColor")).define("scaleColor", function () {
      return function (correlation, alpha) {
        if (correlation < 0) {
          return "rgba(232, 108, 9, " + alpha + ")";
        }

        if (correlation > 0) {
          return "rgba(39, 181, 234, " + alpha + ")";
        }

        return "rgba(111, 214, 214, " + alpha + ")";
      };
    });
    main.variable(observer("makeScaleY")).define("makeScaleY", ["d3"], function (d3) {
      return function (points, h) {
        return d3.scaleLinear().domain(d3.extent(points, function (d) {
          return d.y;
        })).nice().range([h, 0]);
      };
    });
    main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function (d3) {
      return function (points, w) {
        return d3.scaleLinear().domain(d3.extent(points, function (d) {
          return d.x;
        })).nice().range([0, w]);
      };
    });
    main.variable(observer("getDimensions")).define("getDimensions", function () {
      return function () {
        var margin = {
          top: 20,
          right: 30,
          bottom: 30,
          left: 40
        };
        var fw = 900,
            fh = 800;
        return {
          margin: margin,
          w: fw - margin.left - margin.right,
          h: fh - margin.top - margin.bottom,
          fw: fw,
          fh: fh
        };
      };
    });
    var child2 = runtime.module(define$4);
    main.import("makeRegression", child2);
    main.variable(observer("d3")).define("d3", ["require"], function (require) {
      return require("d3@5");
    });
    return main;
  }

  //
  // context: {
  //   x: "diabetes",
  //   y: "pulmonary_disease"
  // }
  // config: {
  //   data: [{ x: 5.67, y: 10.45}],
  //   labelX: "Diabetes",
  //   labelY: "Pulmonary disease"
  // }

  var scatterplot = {
    make: function make(fields, data, ctx) {
      var df = lib$2.filterByNumericVariables(fields, data, ctx);
      var config = {
        data: df,
        labelX: fields.get(ctx.x).description,
        labelY: fields.get(ctx.y).description
      };
      return lib$2.runNotebook(define$5, config, "chart");
    },
    checkContext: function checkContext(fields, ctx) {
      return lib$2.validateFields(fields, [ctx.x, ctx.y]);
    },
    toQuery: function toQuery(ctx) {
      return ["x=" + ctx.x, "y=" + ctx.y];
    },
    fromQuery: function fromQuery(fields, qvars) {
      var x = qvars.get("x"),
          y = qvars.get("y");
      return {
        x: x,
        y: y
      };
    },
    describe: function describe(fields, ctx) {
      return {
        plot: "Scatterplot with trend line",
        variables: lib$2.getFieldNames(fields, [ctx.x, ctx.y])
      };
    }
  };
   //export { notebookURL };

  var template$1 = "<div class=\"flex-between\"><div class=\"w-65 contains-object\"></div><div class=\"about w-35\"><p> How two variables (columns) in your spreadsheet are related in detail.</p><p> A line close to <svg viewBox=\"0,0,100,100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect fill=\"#edf5f5\" x=\"0\" y=\"0\" width=\"100\" height=\"100\"></rect><path fill=\"none\" stroke=\"rgba(39, 181, 234, 1)\" stroke-width=\"7\" d=\"M10 90 90 10\"></path></svg> means positive correlation,<svg viewBox=\"0,0,100,100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect fill=\"#edf5f5\" x=\"0\" y=\"0\" width=\"100\" height=\"100\"></rect><path fill=\"none\" stroke=\"rgba(232, 108, 9, 1)\" stroke-width=\"7\" d=\"M10 10 90 90\"></path></svg> means negative correlation, and <svg viewBox=\"0,0,100,100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect fill=\"#edf5f5\" x=\"0\" y=\"0\" width=\"100\" height=\"100\"></rect><path fill=\"none\" stroke=\"rgba(111, 214, 214, 1)\" stroke-width=\"8\" d=\"M10 60 90 40\"></path></svg> or <svg viewBox=\"0,0,100,100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect fill=\"#edf5f5\" x=\"0\" y=\"0\" width=\"100\" height=\"100\"></rect><path fill=\"none\" stroke=\"rgba(111, 214, 214, 1)\" stroke-width=\"8\" d=\"M10 40 90 60\"></path></svg> means that the variables are weakly correlated or not correlated at all.</p><p> Clustered points <svg viewBox=\"0,0,100,100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect fill=\"#edf5f5\" x=\"0\" y=\"0\" width=\"100\" height=\"100\"></rect><circle r=\"4\" cx=\"20\" cy=\"20\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"30\" cy=\"30\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"40\" cy=\"30\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"40\" cy=\"40\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"50\" cy=\"50\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"70\" cy=\"60\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"60\" cy=\"60\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"60\" cy=\"70\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"70\" cy=\"70\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"80\" cy=\"80\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle></svg> mean that the line is a strong trend, while scattered points <svg viewBox=\"0,0,100,100\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" class=\"inline\"><rect fill=\"#edf5f5\" x=\"0\" y=\"0\" width=\"100\" height=\"100\"></rect><circle r=\"4\" cx=\"20\" cy=\"20\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"20\" cy=\"40\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"20\" cy=\"70\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"40\" cy=\"10\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"40\" cy=\"50\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"40\" cy=\"60\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"40\" cy=\"80\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"60\" cy=\"30\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"60\" cy=\"60\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"60\" cy=\"90\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"70\" cy=\"20\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"70\" cy=\"90\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"80\" cy=\"30\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"80\" cy=\"50\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle><circle r=\"4\" cx=\"80\" cy=\"70\" stroke=\"none\" fill=\"rgba(232, 108, 9, 1)\"></circle></svg> mean that the trend is weak or questionable. <a href=\"https://en.wikipedia.org/wiki/Local_regression\">Learn more</a></p></div></div><div class=\"flex-between\"><div class=\"w-20 contains-object hide\"></div><div class=\"w-20 contains-object hide\"></div><div class=\"w-20 contains-object hide\"></div><div class=\"w-20 contains-object hide\"></div><div class=\"w-20 contains-object hide\"></div></div>";
  var correlation2 = {
    canUse: function canUse(fields) {
      var fs = fields.numericalRandom;
      return fs && fs.length > 1;
    },
    visualization: scatterplot,
    variations: function variations(fields) {
      var fs = fields.numericalRandom;
      return fs.slice(1).map(function (other) {
        return {
          x: fs[0],
          y: other
        };
      });
    },
    compile: function compile(svgRoots) {
      // TODO: add data-correlation property to svg to
      // showcase the variables with the highest correlation
      var root = lib_template.parseTemplate(template$1);
      var objects = root.querySelectorAll(".contains-object");
      objects.forEach(function (object, i) {
        if (i >= svgRoots.length) {
          return;
        }

        object.appendChild(svgRoots[i]);
        object.classList.remove("hide");
      });
      return root;
    }
  };

  var template$2 = "<div class=\"section-md\">\n  <div class=\"flex-between\">\n    <h2>Correlation <span class=\"subh2\">How columns in your spreadsheet are related</span></h2> <hr>\n  </div>\n  <div class=\"template hide\"></div>\n  <div class=\"template hide\"></div>\n</div>\n";
  var _templates = [correlation1, correlation2];
  var correlation = {
    canUse: function canUse(fields) {
      return lib$1.canUseAny(fields, _templates);
    },
    templates: function templates(fields) {
      return lib$1.filterForUsable(fields, _templates);
    },
    compile: function compile(templateRoots) {
      var root = lib_template.parseTemplate(template$2);
      return lib$1.insertAll(root, templateRoots);
    },
    name: "Correlation",
    shortDescription: "How one column predicts another"
  };

  var template$3 = "<div id=\"report-root\">\n  <!-- Put TOC here -->\n  <div class=\"section hide\"></div>\n  <div class=\"section hide\"></div>\n  <div class=\"section hide\"></div>\n  <div class=\"section hide\"></div>\n</div>\n";
  var analytical1 = {
    canUse: function canUse(fields) {
      // Test only
      return correlation.canUse(fields);
      /**
      var canUseTrend = lib.canUseOne(fields, [
        trendsByValue,
        trendsOverTime
      ]);
      return (correlation.canUse(fields) && canUseTrend);
      **/
    },
    computeScore: function computeScore(fields) {
      return 1;
    },
    sections: function sections(fields) {
      // Test only
      return [correlation];
      /**
      return lib.filterForUsable(fields, sections);
      **/
    },
    compile: function compile(sectionRoots) {
      var root = lib_template.parseTemplate(template$3);
      return lib.insertAll(root, sectionRoots);
    }
  };

  var reports = [analytical1];

  function bestReport(fields) {
    var selection = null,
        selectionScore = 0;
    reports.forEach(function (report) {
      if (report.canUse(fields)) {
        var score = report.computeScore(fields);

        if (score > selectionScore) {
          selection = report;
          selectionScore = score;
        }
      }
    });
    return enableMake(selection);
  }

  function enableMake(report) {
    report.make = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fields, data, progress) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", make(report, fields, data, progress));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      };
    }();

    return report;
  }

  function make(_x4, _x5, _x6, _x7) {
    return _make.apply(this, arguments);
  }

  function _make() {
    _make = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(report, fields, data, progress) {
      var all, sections, total, bands, i, sectionRoots, j, templates, section, templateRoots, k, variations, template, svgRoots, l, ctx, svgRoot, templateRoot, sectionRoot;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              progress.desc.textContent = "Finding best variations to show";
              all = getVariations(report, fields);
              progress.bar.style.width = "20%";
              sections = all.sections, total = all.total, bands = progressBands(20, total), i = 0;
              console.log("total variations", total);
              sectionRoots = [];
              j = 0;

            case 7:
              if (!(j < sections.length)) {
                _context2.next = 37;
                break;
              }

              templates = sections[j].templates, section = sections[j].section;
              templateRoots = [];
              k = 0;

            case 11:
              if (!(k < templates.length)) {
                _context2.next = 32;
                break;
              }

              variations = templates[k].variations, template = templates[k].template;
              svgRoots = [];
              l = 0;

            case 15:
              if (!(l < variations.length)) {
                _context2.next = 27;
                break;
              }

              ctx = variations[l]; // Make visualization

              _context2.next = 19;
              return template.visualization.make(fields, data, ctx);

            case 19:
              svgRoot = _context2.sent;
              svgRoots.push(svgRoot); // Increment progress bar

              progress.desc.textContent = i + 1 + "/" + total;
              progress.bar.style.width = (i + 1 == total ? 100 : bands[i]) + "%";
              i += 1;

            case 24:
              l++;
              _context2.next = 15;
              break;

            case 27:
              // Make template
              templateRoot = template.compile(svgRoots);
              templateRoots.push(templateRoot);

            case 29:
              k++;
              _context2.next = 11;
              break;

            case 32:
              // Make section
              sectionRoot = section.compile(templateRoots);
              sectionRoots.push(sectionRoot);

            case 34:
              j++;
              _context2.next = 7;
              break;

            case 37:
              return _context2.abrupt("return", report.compile(sectionRoots));

            case 38:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _make.apply(this, arguments);
  }

  function getVariations(report, fields) {
    var sections = report.sections(fields);
    var total = 0;
    var ss = sections.map(function (section) {
      var templates = section.templates(fields);
      var ts = templates.map(function (template) {
        var variations = template.variations(fields);
        total += variations.length;
        return {
          template: template,
          variations: variations
        };
      });
      return {
        section: section,
        templates: ts
      };
    });
    return {
      sections: ss,
      total: total
    };
  }

  function progressBands(start, total) {
    var bandwidth = 1.0 * (100 - start) / (1.0 * total);
    var bands = [];

    for (var i = 0; i < total; i++) {
      bands.push(Math.floor(start + (i + 1) * bandwidth));
    }

    return bands;
  }

  var ERROR_CANT_GET_GOOGLE_FILE = 0,
      ERROR_GOOGLE_RESOURCE_DOESNT_EXIST = 1,
      ERROR_CANT_GET_APP_FILE = 2,
      ERROR_APP_RESOURCE_DOESNT_EXIST = 3,
      ERROR_GOOGLE_SERVER_ISSUE = 4,
      ERROR_GOOGLE_CLIENT_INIT = 5,
      ERROR_GOOGLE_CLIENT_MISCONFIGURED = 6,
      ERROR_SPREADSHEET_UNAUTHORIZED = 7,
      ERROR_NO_SPREADSHEET = 8,
      ERROR_SPREADSHEET_API_GET = 9,
      ERROR_SPREADSHEET_VALUES_API_GET = 10,
      ERROR_BAD_SPREADSHEET_RANGE = 11,
      ERROR_NO_VISUALIZATIONS = 12,
      ERROR_PREPARING_VISUALIZATION_INPUT = 13,
      ERROR_RENDERING_VISUALIZATION = 14,
      ERROR_FORMATTING_VISUALIZATION = 15,
      ERROR_WITH_PLOT_URL = 16,
      ERROR_PLOT_URL_DOESNT_MATCH_DATA$1 = 17;
  var ISSUE_GOOGLE_FILE = 0,
      ISSUE_GOOGLE_SETUP = 1,
      ISSUE_GOOGLE_API = 2,
      ISSUE_APP_FILE = 3,
      ISSUE_APP_SETUP = 4,
      ISSUE_SPREADSHEET_ACCESS = 5,
      ISSUE_SPREADSHEET_DOESNT_EXIST = 6,
      ISSUE_NO_SHEET = 7,
      ISSUE_NO_FIELDS_SHEET = 8,
      ISSUE_BAD_FIELDS_SHEET = 9,
      ISSUE_FIELDS_SHEET_SYNC = 10,
      ISSUE_NO_VISUALIZATIONS = 11,
      ISSUE_URL_NO_SPREADSHEET_ID = 12,
      ISSUE_URL_NO_SPREADSHEET_SHEET = 13,
      ISSUE_URL_NO_VISUALIZATION = 14,
      ISSUE_URL_VISUALIZATION_NOT_SUPPORTED = 15,
      ISSUE_URL_PLOT_GENERAL = 16,
      ISSUE_URL_PLOT_DOESNT_MATCH_DATA = 17,
      ISSUE_NO_TEST_DATA = 18;

  function errorToString(error_code) {
    switch (error_code) {
      case ERROR_CANT_GET_GOOGLE_FILE:
        return "Can't get Google file";

      case ERROR_GOOGLE_RESOURCE_DOESNT_EXIST:
        return "Google resource doesn't exit";

      case ERROR_CANT_GET_APP_FILE:
        return "Can't get App file";

      case ERROR_APP_RESOURCE_DOESNT_EXIST:
        return "App resource doesn't exit";

      case ERROR_GOOGLE_SERVER_ISSUE:
        return "Google API server issue";

      case ERROR_GOOGLE_CLIENT_INIT:
        return "Problem using the Google API client";

      case ERROR_GOOGLE_CLIENT_MISCONFIGURED:
        return "The Google API client was misconfigured";

      case ERROR_SPREADSHEET_UNAUTHORIZED:
        return "Unauthorized access to spreadsheet";

      case ERROR_NO_SPREADSHEET:
        return "Spreadsheet doesn't exist";

      case ERROR_SPREADSHEET_API_GET:
        return "Issue making API request sheets.spreadsheets.get";

      case ERROR_SPREADSHEET_VALUES_API_GET:
        return "Issue making API request sheets.spreadsheets.values.get";

      case ERROR_BAD_SPREADSHEET_RANGE:
        return "Bad spreadsheet range";

      case ERROR_NO_VISUALIZATIONS:
        return "No visualizations for this spreadsheet";

      case ERROR_PREPARING_VISUALIZATION_INPUT:
        return "Issue preparing visualization input";

      case ERROR_RENDERING_VISUALIZATION:
        return "Issue rendering visualization";

      case ERROR_FORMATTING_VISUALIZATION:
        return "Issue formatting visualization for the web";

      case ERROR_WITH_PLOT_URL:
        return "Plot url isn't formatted correctly";

      case ERROR_PLOT_URL_DOESNT_MATCH_DATA$1:
        return "Plot url doesn't match data header";

      default:
        return "App code general issue";
    }
  }

  function issueToString(issue_code) {
    switch (issue_code) {
      case ISSUE_GOOGLE_FILE:
        return "A necessary file provided by Google can't be downloaded right now. The best thing to do is to check your internet connection or try again in 15 minutes.";

      case ISSUE_GOOGLE_SETUP:
        return "A necessary API provided by Google can't be set up right now. The best thing to do is to check your internet connection or try again in 15 minutes.";

      case ISSUE_GOOGLE_API:
        return "A Google API needed by this demo isn't working right now. This type of issue is usually fixed by Google fairly quickly. The best thing to do is to try again in 15 minutes.";

      case ISSUE_APP_FILE:
        return "Part of this demo can't be downloaded right now. The best thing to do is to check your internet connection and try again.";

      case ISSUE_SPREADSHEET_ACCESS:
        return "It looks like you don't have access to this spreadsheet. Make sure the owner of this spreadsheet has shared it with you and then try again.";

      case ISSUE_SPREADSHEET_DOESNT_EXIST:
        return "It looks like this doesn't refer to a Google spreadsheet. That can happen if you accidently changed the 'id' in the url above, or if you used an unsupported spreadsheet. The best thing to do is to click the 'New Spreadsheet' button above, choose one of the supported sample spreadsheets, and try again.";

      case ISSUE_NO_FIELDS_SHEET:
      case ISSUE_BAD_FIELDS_SHEET:
      case ISSUE_FIELDS_SHEET_SYNC:
        return "It looks like you're trying to visualize a spreadsheet that isn't supported yet. The best thing to do is to click the 'New Spreadsheet' button above and choose one of the supported sample spreadsheets.";

      case ISSUE_NO_VISUALIZATIONS:
        return "This is very unusual, but it looks like there are no visualizations for your data. This can happen if your spreadsheet doesn't have enough data. This shouldn't happen with the supported sample spreadsheets. So the best thing to do is to click the 'New Spreadsheet' button above and choose one of the sample spreadsheets.";

      case ISSUE_NO_SHEET:
        return "The sheet in the url above doesn't seem to exist in the spreadsheet anymore. The best thing to do is to click 'Back to Report' and refresh the page to regenerate the report and select a visualization again.";

      case ISSUE_URL_NO_SPREADSHEET_ID:
        return "It looks like there's something wrong with the url above. This can happen if you accidently changed the url above or if you opened a broken link. The best thing to do is to click the 'New Spreadsheet' button above and visualize the spreadsheet you're interested in again.";

      case ISSUE_URL_NO_SPREADSHEET_SHEET:
      case ISSUE_URL_NO_VISUALIZATION:
      case ISSUE_URL_VISUALIZATION_NOT_SUPPORTED:
      case ISSUE_URL_PLOT_GENERAL:
        return "It looks like there's something wrong with the url above. This can happen if you accidently changed the url above or if you opened a broken link. The best thing to do is to click 'Back to Report' and try selecting this visualization again.";

      case ISSUE_URL_PLOT_DOESNT_MATCH_DATA:
        return "It looks like some of columns in this spreadsheet were renamed or removed so this visualization can't be generated anymore. The best thing to do is to click 'Back to Report' and refresh the page to regenerate the report so all visualizations are based on what the spreadsheet looks right now.";

      case ISSUE_NO_TEST_DATA:
        return "There's no test data for this test id. Try using 'diseases' instead.";

      default:
        return "";
    }
  }

  function errorToIssue(error_code) {
    switch (error_code) {
      case ERROR_CANT_GET_GOOGLE_FILE:
        return ISSUE_GOOGLE_FILE;

      case ERROR_GOOGLE_RESOURCE_DOESNT_EXIST:
        return ISSUE_GOOGLE_SETUP;

      case ERROR_CANT_GET_APP_FILE:
        return ISSUE_APP_FILE;

      case ERROR_APP_RESOURCE_DOESNT_EXIST:
        return ISSUE_APP_SETUP;

      case ERROR_GOOGLE_SERVER_ISSUE:
      case ERROR_GOOGLE_CLIENT_INIT:
        return ISSUE_GOOGLE_API;

      case ERROR_SPREADSHEET_UNAUTHORIZED:
        return ISSUE_SPREADSHEET_ACCESS;

      case ERROR_NO_SPREADSHEET:
        return ISSUE_SPREADSHEET_DOESNT_EXIST;

      case ERROR_NO_VISUALIZATIONS:
        return ISSUE_NO_VISUALIZATIONS;

      case ERROR_WITH_PLOT_URL:
        return ISSUE_URL_PLOT_GENERAL;

      case ERROR_PLOT_URL_DOESNT_MATCH_DATA$1:
        return ISSUE_URL_PLOT_DOESNT_MATCH_DATA;

      default:
        return -1;
    }
  }

  function isKnownError(error) {
    return error.name.startsWith("KnownError-");
  }

  function parseErrorCode(error) {
    var parts = error.name.split("-"),
        code = parseInt(parts[1], 10);
    return isNaN(code) ? -1 : code;
  }

  function showLoadingKnownIssue(issue_code, error) {
    var issue = document.getElementById("loading-issue"),
        issue_container = issue.querySelector(".issue-help-container"),
        issue_help = issue.querySelector(".issue-help"),
        bug_report = issue.querySelector(".bug-report");

    if (!issue_code) {
      var error_code = parseErrorCode(error);
      issue_code = errorToIssue(error_code);
    }

    var issue_message = issueToString(issue_code);

    if (issue_message === "") {
      return false;
    }

    issue_help.textContent = issue_message;
    bug_report.classList.add("hidden");
    issue_container.classList.remove("hidden");
    issue.classList.remove("hidden");
    if (error) console.error("[known error]", error);
    return true;
  }

  function showLoadingBug(step, error) {
    var issue = document.getElementById("loading-issue"),
        bug_report = issue.querySelector(".bug-report"),
        step_message = issue.querySelector(".step-description"),
        issue_message = issue.querySelector(".issue-description"),
        details_message = issue.querySelector(".details-description");
    step_message.textContent = step;
    var error_code = -1;

    if (isKnownError(error)) {
      error_code = parseErrorCode(error);
    }

    issue_message.textContent = errorToString(error_code);
    details_message.textContent = error.message;
    bug_report.classList.remove("hidden");
    issue.classList.remove("hidden");
  } // Export error codes

  var processingView = document.getElementById("report-processing");
  var useCaseDropdown = {
    button: document.getElementById("use-case-button"),
    menu: document.getElementById("use-case-menu")
  };
  var templateDropdown = {
    button: document.getElementById("template-button"),
    menu: document.getElementById("template-menu")
  };
  var saveDropdown = {
    button: document.getElementById("save-button"),
    menu: document.getElementById("save-menu")
  };
  var reportContainer = document.getElementById("report"),
      reportTitle = document.getElementById("report-spreadsheet-title"),
      reportLink = document.getElementById("report-spreadsheet-url"); // Execute ------------------------------------

  exec(); // Implementation -----------------------------

  function exec() {
    setup_top_nav();
    setup_dropdowns([useCaseDropdown, templateDropdown, saveDropdown]);
    var test = query_var("test");

    if (test) {
      processStatic(test);
    } else {
      showLoadingKnownIssue(ISSUE_SPREADSHEET_DOESNT_EXIST);
    }
  }

  function processStatic(_x) {
    return _processStatic.apply(this, arguments);
  }

  function _processStatic() {
    _processStatic = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(testId) {
      var fields, data, report, reportRoot, spec, response, text;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              fields = null, data = null, report = null, reportRoot = null;
              console.log("processing test [" + testId + "]");

              if (tests.hasOwnProperty(testId)) {
                _context.next = 5;
                break;
              }

              showLoadingKnownIssue(ISSUE_NO_TEST_DATA);
              return _context.abrupt("return");

            case 5:
              spec = tests[testId]; // Step 1: Load the spreadsheet fields and data

              loader_part1.desc.textContent = "Reading spreadsheet fields";
              _context.prev = 7;
              _context.next = 10;
              return fetch(spec.fieldsFile);

            case 10:
              response = _context.sent;

              if (response.ok) {
                _context.next = 13;
                break;
              }

              throw new Error(response.statusText);

            case 13:
              _context.next = 15;
              return response.text();

            case 15:
              text = _context.sent;
              fields = text.split('\n').map(function (d) {
                return d.split(',').map(function (d0) {
                  return d0.trim();
                });
              });
              _context.next = 24;
              break;

            case 19:
              _context.prev = 19;
              _context.t0 = _context["catch"](7);
              console.error(_context.t0);
              showIssue(STEP_DOWNLOAD_FIELDS, _context.t0);
              return _context.abrupt("return");

            case 24:
              loader_part1.bar.style.width = 30 + "%";
              loader_part1.desc.textContent = "Reading spreadsheet data";
              _context.prev = 26;
              _context.next = 29;
              return fetch(spec.dataFile);

            case 29:
              response = _context.sent;

              if (response.ok) {
                _context.next = 32;
                break;
              }

              throw new Error(response.statusText);

            case 32:
              _context.next = 34;
              return response.text();

            case 34:
              text = _context.sent;
              data = text.split('\n').map(function (d) {
                return d.split(',').map(function (d0) {
                  return d0.trim();
                });
              });
              _context.next = 43;
              break;

            case 38:
              _context.prev = 38;
              _context.t1 = _context["catch"](26);
              console.error(_context.t1);
              showIssue(STEP_DOWNLOAD_DATA, _context.t1);
              return _context.abrupt("return");

            case 43:
              loader_part1.bar.style.width = 60 + "%";
              loader_part1.desc.textContent = "Checking consistency";
              _context.prev = 45;
              fields = organize_fields(fields);

              if (!fields.isMalformed) {
                _context.next = 50;
                break;
              }

              showLoadingKnownIssue(ISSUE_BAD_FIELDS_SHEET);
              return _context.abrupt("return");

            case 50:
              _context.next = 57;
              break;

            case 52:
              _context.prev = 52;
              _context.t2 = _context["catch"](45);
              console.error(_context.t2);
              showBug(STEP_ORGANIZE_FIELDS, _context.t2);
              return _context.abrupt("return");

            case 57:
              _context.prev = 57;
              fields = match_header_to_fields(fields, data[0]);

              if (fields) {
                _context.next = 62;
                break;
              }

              showLoadingKnownIssue(ISSUE_FIELDS_SHEET_SYNC);
              return _context.abrupt("return");

            case 62:
              _context.next = 69;
              break;

            case 64:
              _context.prev = 64;
              _context.t3 = _context["catch"](57);
              console.error(_context.t3);
              showBug(STEP_MATCH_FIELDS, _context.t3);
              return _context.abrupt("return");

            case 69:
              loader_part1.bar.style.width = 100 + "%"; // Step 2: Choose visualizations

              loader_part2.desc.textContent = "Choosing visualizations";
              loader_part2.bar.style.width = 20 + "%";
              _context.prev = 72;
              report = bestReport(fields);

              if (!report) {
                showIssue(STEP_CHOOSE_VISUALIZATIONS, new Error("No report for data"));
              }

              _context.next = 82;
              break;

            case 77:
              _context.prev = 77;
              _context.t4 = _context["catch"](72);
              console.error(_context.t4);
              showBug(STEP_CHOOSE_VISUALIZATIONS, _context.t4);
              return _context.abrupt("return");

            case 82:
              loader_part2.bar.style.width = 100 + "%"; // Step 3: Make the visualizations

              _context.prev = 83;
              _context.next = 86;
              return report.make(fields, data.slice(1), loader_part3);

            case 86:
              reportRoot = _context.sent;

              if (!reportRoot) {
                showIssue(STEP_MAKE_VISUALIZATIONS, new Error("No root"));
              }

              _context.next = 95;
              break;

            case 90:
              _context.prev = 90;
              _context.t5 = _context["catch"](83);
              console.error(_context.t5);
              showBug(STEP_MAKE_VISUALIZATIONS, _context.t5);
              return _context.abrupt("return");

            case 95:
              // Step 4: Add to DOM
              reportContainer.appendChild(reportRoot);
              reportTitle.textContent = spec.name;
              reportLink.href = spec.dataFile; // Step 5: Reveal

              processingView.classList.add("hidden");
              reportContainer.classList.remove("invisible");

            case 100:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[7, 19], [26, 38], [45, 52], [57, 64], [72, 77], [83, 90]]);
    }));
    return _processStatic.apply(this, arguments);
  }

  var STEP_BEFORE_AUTH = 0,
      STEP_AFTER_AUTH = 1,
      STEP_GET_METADATA = 2,
      STEP_CHOOSE_SHEET = 3,
      STEP_DOWNLOAD_FIELDS = 4,
      STEP_DOWNLOAD_DATA = 5,
      STEP_ORGANIZE_FIELDS = 6,
      STEP_MATCH_FIELDS = 7,
      STEP_CHOOSE_VISUALIZATIONS = 8,
      STEP_MAKE_VISUALIZATIONS = 9;

  function stepToString(step) {
    switch (step) {
      case STEP_BEFORE_AUTH:
        return "Before authorization";

      case STEP_AFTER_AUTH:
        return "After authorization";

      case STEP_GET_METADATA:
        return "Getting spreadsheet metadata";

      case STEP_CHOOSE_SHEET:
        return "Choosing sheet";

      case STEP_DOWNLOAD_FIELDS:
        return "Downloading fields";

      case STEP_DOWNLOAD_DATA:
        return "Downloading data";

      case STEP_ORGANIZE_FIELDS:
        return "Organizing fields";

      case STEP_MATCH_FIELDS:
        return "Matching header to fields";

      case STEP_CHOOSE_VISUALIZATIONS:
        return "Choosing visualizations";

      case STEP_MAKE_VISUALIZATIONS:
        return "Making visualizations";

      default:
        return "unknown";
    }
  }

  function showIssue(step, error) {
    if (!showLoadingKnownIssue(null, error)) {
      showLoadingBug(stepToString(step), error);
    }
  }

  function showBug(step, error) {
    showLoadingBug(stepToString(step), error);
  }

}());
