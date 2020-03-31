(function () {
	'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

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

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var toString = {}.toString;

	var _cof = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = { version: '2.6.11' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
	});
	var _core_1 = _core.version;

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
	});

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

	var _anObject = function (it) {
	  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
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

	// 22.1.3.31 Array.prototype[@@unscopables]
	var UNSCOPABLES = _wks('unscopables');
	var ArrayProto = Array.prototype;
	if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});
	var _addToUnscopables = function (key) {
	  ArrayProto[UNSCOPABLES][key] = true;
	};

	var _iterStep = function (done, value) {
	  return { value: value, done: !!done };
	};

	var _iterators = {};

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

	var ITERATOR = _wks('iterator');
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
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
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
	      if ( typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if ( (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
	    _hide(proto, ITERATOR, $default);
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

	var ITERATOR$1 = _wks('iterator');
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
	  var NAME = collections[i];
	  var explicit = DOMIterables[NAME];
	  var Collection = _global[NAME];
	  var proto = Collection && Collection.prototype;
	  var key;
	  if (proto) {
	    if (!proto[ITERATOR$1]) _hide(proto, ITERATOR$1, ArrayValues);
	    if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
	    _iterators[NAME] = ArrayValues;
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

	// check on default Array iterator

	var ITERATOR$2 = _wks('iterator');
	var ArrayProto$1 = Array.prototype;

	var _isArrayIter = function (it) {
	  return it !== undefined && (_iterators.Array === it || ArrayProto$1[ITERATOR$2] === it);
	};

	var ITERATOR$3 = _wks('iterator');

	var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$3]
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

	var dP$1 = _objectDp.f;









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
	    if (_descriptors) dP$1(C.prototype, 'size', {
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

	var ITERATOR$4 = _wks('iterator');
	var SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR$4]();
	  riter['return'] = function () { SAFE_CLOSING = true; };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(riter, function () { throw 2; });
	} catch (e) { /* empty */ }

	var _iterDetect = function (exec, skipClosing) {
	  if (!skipClosing && !SAFE_CLOSING) return false;
	  var safe = false;
	  try {
	    var arr = [7];
	    var iter = arr[ITERATOR$4]();
	    iter.next = function () { return { done: safe = true }; };
	    arr[ITERATOR$4] = function () { return iter; };
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

	var f$3 = function (C) {
	  return new PromiseCapability(C);
	};

	var _newPromiseCapability = {
		f: f$3
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

	function loadScript(url) {
	  return new Promise(function (resolve, reject) {
	    var script = document.createElement('script');

	    script.onload = function () {
	      resolve();
	    };

	    script.onerror = function (e) {
	      var error = new Error("The script " + e.target.src + " didn't load correctly.");
	      reject(error);
	    };

	    script.src = url;
	    script.async = true;
	    script.type = 'text/javascript';
	    document.head.appendChild(script);
	  });
	}

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

	var dP$2 = _objectDp.f;
	var FProto = Function.prototype;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME$1 = 'name';

	// 19.2.4.2 name
	NAME$1 in FProto || _descriptors && dP$2(FProto, NAME$1, {
	  configurable: true,
	  get: function () {
	    try {
	      return ('' + this).match(nameRE)[1];
	    } catch (e) {
	      return '';
	    }
	  }
	});

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
	    ERROR_PLOT_URL_DOESNT_MATCH_DATA = 17;
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
	    ISSUE_URL_PLOT_DOESNT_MATCH_DATA = 17;

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

	    case ERROR_PLOT_URL_DOESNT_MATCH_DATA:
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

	    case ERROR_PLOT_URL_DOESNT_MATCH_DATA:
	      return ISSUE_URL_PLOT_DOESNT_MATCH_DATA;

	    default:
	      return -1;
	  }
	}

	function isAuthIssue(error) {
	  if (!isKnownError(error)) return false;
	  var code = parseErrorCode(error);
	  if (code < 0) return false;
	  return code == ERROR_SPREADSHEET_UNAUTHORIZED;
	}

	function makeKnownError(code, error) {
	  var known_error = new Error();
	  known_error.name = "KnownError-" + code;
	  known_error.message = error.message;
	  return known_error;
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

	var clientId = '610692011464-m1oi9ddi7u31h92e09lg5s970luvak9a.apps.googleusercontent.com',
	    apiKey = 'AIzaSyDCdKkMRyLWNjtTaUBYRcJFLqLEWEGDgg8',
	    discoveryDocs = ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
	    scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

	function gapi_doesnt_exist() {
	  var error = new Error("gapi library wasn't created");
	  return makeKnownError(ERROR_GOOGLE_RESOURCE_DOESNT_EXIST, error);
	}

	function gapi_client_doesnt_exist() {
	  var error = new Error("gapi.client library wasn't created");
	  return makeKnownError(ERROR_GOOGLE_RESOURCE_DOESNT_EXIST, error);
	}

	function gapi_client_sheets_doesnt_exist() {
	  var error = new Error("gapi.client.sheets library wasn't created");
	  return makeKnownError(ERROR_GOOGLE_RESOURCE_DOESNT_EXIST, error);
	}

	function gapi_auth_doesnt_exist() {
	  var error = new Error("gapi.auth library wasn't created");
	  return makeKnownError(ERROR_GOOGLE_RESOURCE_DOESNT_EXIST, error);
	}

	function gapi_auth_instance_doesnt_exist() {
	  var error = new Error("gapi.auth.getAuthInstance() is null");
	  return makeKnownError(ERROR_GOOGLE_RESOURCE_DOESNT_EXIST, error);
	}

	function load_script() {
	  return new Promise(function (resolve, reject) {
	    loadScript("https://apis.google.com/js/api.js").then(resolve).catch(function (error) {
	      error = makeKnownError(ERROR_CANT_GET_GOOGLE_FILE, error);
	      reject(error);
	    });
	  });
	}

	function load_client() {
	  return new Promise(function (resolve, reject) {
	    if (!gapi) return reject(gapi_doesnt_exist());
	    gapi.load('client:auth2', {
	      callback: resolve,
	      onerror: function onerror(error) {
	        error = makeKnownError(ERROR_GOOGLE_RESOURCE_DOESNT_EXIST, error);
	        reject(error);
	      }
	    });
	  });
	}

	function init_client() {
	  return new Promise(function (resolve, reject) {
	    if (!gapi) return reject(gapi_doesnt_exist());
	    if (!gapi.client) return reject(gapi_client_doesnt_exist());
	    var config = {
	      clientId: clientId,
	      apiKey: apiKey,
	      discoveryDocs: discoveryDocs,
	      scope: scopes.join(' ')
	    };

	    try {
	      gapi.client.init(config).then(function () {
	        if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
	          throw new Error("config: " + JSON.stringify(config, null, 2));
	        }

	        resolve();
	      }).catch(function (error) {
	        if (!gapi.auth2 || !gapi.auth2.getAuthInstance()) {
	          error = makeKnownError(ERROR_GOOGLE_CLIENT_MISCONFIGURED, error);
	        } else {
	          error = makeKnownError(ERROR_GOOGLE_CLIENT_INIT, error);
	        }

	        reject(error);
	      });
	    } catch (error) {
	      error = makeKnownError(ERROR_GOOGLE_CLIENT_INIT, error);
	      reject(error);
	    }
	  });
	}

	function initialize(loader) {
	  return new Promise(function (resolve, reject) {
	    if (loader) {
	      loader.desc.textContent = "Loading apis";
	    }

	    load_script().then(function () {
	      if (loader) {
	        loader.bar.style.width = 10 + "%";
	        loader.desc.textContent = "Initializing";
	      }

	      load_client().then(function () {
	        if (loader) {
	          loader.bar.style.width = 20 + "%";
	          loader.desc.textContent = "Authenticating";
	        }

	        init_client().then(function () {
	          if (loader) {
	            loader.bar.style.width = 30 + "%";
	          }

	          resolve();
	        }).catch(reject);
	      }).catch(reject);
	    }).catch(reject);
	  });
	}

	function setup_auth(config) {
	  var clicked = null;

	  var update = function update(isSignedIn) {
	    if (clicked && clicked.afterAuth) {
	      clicked.afterAuth();
	    }

	    clicked = null;
	  };

	  if (config.signin) {
	    config.signin.forEach(function (button) {
	      button.element.addEventListener('click', function () {
	        if (button.beforeAuth) {
	          button.beforeAuth();
	        }

	        clicked = button;
	        gapi.auth2.getAuthInstance().signIn();
	      });
	    });
	  }

	  if (config.signout) {
	    config.signout.forEach(function (button) {
	      button.element.addEventListener('click', function () {
	        if (button.beforeAuth) {
	          button.beforeAuth();
	        }

	        clicked = button;
	        gapi.auth2.getAuthInstance().signOut();
	      });
	    });
	  }

	  gapi.auth2.getAuthInstance().isSignedIn.listen(update);
	  update(gapi.auth2.getAuthInstance().isSignedIn.get());
	}

	var api = {
	  isSignedIn: function isSignedIn() {
	    return gapi.auth2.getAuthInstance().isSignedIn.get();
	  },
	  getSpreadsheetMetadata: function getSpreadsheetMetadata(id) {
	    return new Promise(function (resolve, reject) {
	      if (!gapi) return reject(gapi_doesnt_exist());
	      if (!gapi.client) return reject(gapi_client_doesnt_exist());
	      if (!gapi.client.sheets) return reject(gapi_client_sheets_doesnt_exist());
	      var config = {
	        spreadsheetId: id
	      };

	      try {
	        gapi.client.sheets.spreadsheets.get(config).then(function (response) {
	          resolve(response.result);
	        }).catch(function (response) {
	          var error_msg = response.result.error.message,
	              error = new Error(error_msg + " config: " + JSON.stringify(config, null, 2));

	          switch (response.result.error.status) {
	            case "NOT_FOUND":
	              error = makeKnownError(ERROR_NO_SPREADSHEET, error);
	              break;

	            default:
	              if (response.result.error.code >= 500) {
	                error = makeKnownError(ERROR_GOOGLE_SERVER_ISSUE, error);
	              } else {
	                error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
	              }

	              break;
	          }

	          reject(error);
	        });
	      } catch (error) {
	        error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
	        reject(error);
	      }
	    });
	  },
	  getSpreadsheetValues: function getSpreadsheetValues(id, range) {
	    return new Promise(function (resolve, reject) {
	      if (!gapi) return reject(gapi_doesnt_exist());
	      if (!gapi.client) return reject(gapi_client_doesnt_exist());
	      if (!gapi.client.sheets) return reject(gapi_client_sheets_doesnt_exist());
	      var config = {
	        spreadsheetId: id,
	        range: range
	      };

	      try {
	        gapi.client.sheets.spreadsheets.values.get(config).then(function (response) {
	          resolve(response.result.values);
	        }).catch(function (response) {
	          // Handle weird case when range is messed up
	          if (response.result == false) {
	            var error = new Error("config: " + JSON.stringify(config, null, 2));

	            if (response.status == 404) {
	              error = makeKnownError(ERROR_BAD_SPREADSHEET_RANGE, error);
	            } else {
	              error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
	            }

	            reject(error);
	            return;
	          } // Handle the common case


	          var error_msg = response.result.error.message,
	              error = new Error(error_msg + " config: " + JSON.stringify(config, null, 2));

	          switch (response.result.error.status) {
	            case "NOT_FOUND":
	              error = makeKnownError(ERROR_NO_SPREADSHEET, error);
	              break;

	            default:
	              if (response.result.error.code >= 500) {
	                error = makeKnownError(ERROR_GOOGLE_SERVER_ISSUE, error);
	              } else {
	                error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
	              }

	              break;
	          }

	          reject(error);
	        });
	      } catch (error) {
	        error = makeKnownError(ERROR_SPREADSHEET_VALUES_API_GET, error);
	        reject(error);
	      }
	    });
	  }
	}; // Whether the client has been initialized or not

	var initialized = false;

	function get_api(auth_config, loader) {
	  return new Promise(function (resolve, reject) {
	    if (initialized) {
	      return resolve(api);
	    }

	    initialize(loader).then(function (timing) {
	      if (!gapi) return reject(gapi_doesnt_exist());
	      if (!gapi.auth2) return reject(gapi_auth_doesnt_exist());
	      if (!gapi.auth2.getAuthInstance()) return reject(gapi_auth_instance_doesnt_exist());
	      setup_auth(auth_config);
	      initialized = true;
	      resolve(api);
	    }).catch(reject);
	  });
	} // Helper functions, no API needed

	// most Object methods by ES6 should accept primitives



	var _objectSap = function (KEY, exec) {
	  var fn = (_core.Object || {})[KEY] || Object[KEY];
	  var exp = {};
	  exp[KEY] = exec(fn);
	  _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
	};

	// 19.1.2.14 Object.keys(O)



	_objectSap('keys', function () {
	  return function keys(it) {
	    return _objectKeys(_toObject(it));
	  };
	});

	var _createProperty = function (object, index, value) {
	  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
	  else object[index] = value;
	};

	_export(_export.S + _export.F * !_iterDetect(function (iter) { Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	    var O = _toObject(arrayLike);
	    var C = typeof this == 'function' ? this : Array;
	    var aLen = arguments.length;
	    var mapfn = aLen > 1 ? arguments[1] : undefined;
	    var mapping = mapfn !== undefined;
	    var index = 0;
	    var iterFn = core_getIteratorMethod(O);
	    var length, result, step, iterator;
	    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
	      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
	        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
	      }
	    } else {
	      length = _toLength(O.length);
	      for (result = new C(length); length > index; index++) {
	        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	      }
	    }
	    result.length = index;
	    return result;
	  }
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

	function iteration_data_xy(i, fields, data) {
	  var x = fields.get(i.x),
	      y = fields.get(i.y);
	  var points = data.map(function (row) {
	    return {
	      x: +row[x.index],
	      y: +row[y.index]
	    };
	  }).filter(function (p) {
	    return p.x != 0 && p.y != 0;
	  });
	  return {
	    points: points,
	    x: x.description,
	    y: y.description
	  };
	}

	function iteration_titles_xy(i, fields) {
	  return [fields.get(i.x).description + " \u2A2F", fields.get(i.y).description];
	}

	function make_query_vars_xy(i, fields) {
	  return ["x=" + i.x, "xlabel=" + fields.get(i.x).description, "y=" + i.y, "ylabel=" + fields.get(i.y).description];
	}

	function parse_vars_xy(query_vars, header) {
	  var x = query_vars.get("x"),
	      y = query_vars.get("y"),
	      x_desc = query_vars.get("xlabel"),
	      y_desc = query_vars.get("ylabel");

	  if (!x || !x_desc) {
	    var error = new Error("Need query string variables 'x' and 'xlabel'");
	    throw makeKnownError(ERROR_WITH_PLOT_URL, error);
	  }

	  if (!y || !y_desc) {
	    var error = new Error("Need query string variables 'y' and 'ylabel'");
	    throw makeKnownError(ERROR_WITH_PLOT_URL, error);
	  }

	  var x_index = -1,
	      y_index = 1;

	  for (var i = 0; i < header.length; i++) {
	    if (header[i] === x) {
	      x_index = i;
	      continue;
	    }

	    if (header[i] === y) {
	      y_index = i;
	    }
	  }

	  if (x_index < 0 || y_index < 0) {
	    var error = new Error("Query var not in header");
	    throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
	  }

	  return {
	    x: x,
	    x_index: x_index,
	    x_desc: x_desc,
	    y: y,
	    y_index: y_index,
	    y_desc: y_desc
	  };
	}

	function plot_data_xy(vars, data) {
	  var points = data.slice(1).map(function (row) {
	    return {
	      x: +row[vars.x_index],
	      y: +row[vars.y_index]
	    };
	  }).filter(function (p) {
	    return p.x != 0 && p.y != 0;
	  });
	  return {
	    points: points,
	    x: vars.x_desc,
	    y: vars.y_desc
	  };
	}

	function plot_title_xy(vars) {
	  return vars.x_desc + " \u2A2F " + vars.y_desc;
	}

	var visualizations = {
	  "basic-scatterplot": {
	    // Position and data formats
	    position: 1,
	    dataFormats: ["combo:numerical-random"],
	    // Script and render function
	    script: "/assets/plots/basic-scatterplot.js",
	    render: function render(data) {
	      if (!window.basic_scatterplot) {
	        throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST, new Error("basic_scatterplot function isn't defined"));
	      }

	      return basic_scatterplot(data);
	    },
	    // Iterating through the report graphics
	    iterationData: iteration_data_xy,
	    iterationTitles: iteration_titles_xy,
	    // Handling query vars for single plot
	    makeQueryVars: make_query_vars_xy,
	    parseQueryVars: parse_vars_xy,
	    // Making the single plot
	    plotData: plot_data_xy,
	    plotTitle: plot_title_xy
	  }
	};

	function choose_single_sheet(sheets) {
	  var sheet_names = sheets.map(function (sheet) {
	    return sheet.properties.title;
	  });
	  var sheet_set = new Set(sheet_names);

	  for (var i = 0; i < sheet_names.length; i++) {
	    var sheet = sheet_names[i];

	    if (sheet_set.has(sheet + ".fields")) {
	      return sheet;
	    }
	  }

	  return null;
	}

	function organize_fields(fields) {
	  // Need at least 2 rows
	  if (fields.length < 1) {
	    return {
	      isMalformed: true
	    };
	  } // Header needs to look like this:
	  // Field, Description, Caption, Type, Distribution


	  var header = fields[0];

	  if (header.length < 5) {
	    return {
	      isMalformed: true
	    };
	  }

	  if (header[0] !== "Field" || header[1] !== "Description" || header[2] !== "Caption" || header[3] !== "Type" || header[4] !== "Distribution") {
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
	      index: -1
	    };
	  }); // Collect all numerical random fields

	  var numerical_random = fields.filter(function (field) {
	    return field.type === "numerical" && field.distribution === "random";
	  }).map(function (field) {
	    return field.field;
	  });
	  return {
	    all: fields,
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


	  return {
	    all: fields.all,
	    get: function get(field) {
	      return fields_map.get(field);
	    },
	    numericalRandom: fields.numericalRandom
	  };
	}

	function combinations(array) {
	  var results = [];

	  for (var i = 0; i < array.length - 1; i++) {
	    // This is where you'll capture that last value
	    for (var j = i + 1; j < array.length; j++) {
	      results.push([array[i], array[j]]);
	    }
	  }

	  return results;
	}

	function load_designs(_x, _x2) {
	  return _load_designs.apply(this, arguments);
	}

	function _load_designs() {
	  _load_designs = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(fields, loader) {
	    var scripts, chosen, combos_numerical_random, _i, _Object$keys, key, v, distributions, error;

	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            // Scripts to load
	            scripts = new Set(), chosen = []; // Cache data manipulations

	            combos_numerical_random = null; // Choosing visualizations

	            loader.desc.textContent = "Choosing visualizations";

	            for (_i = 0, _Object$keys = Object.keys(visualizations); _i < _Object$keys.length; _i++) {
	              key = _Object$keys[_i];
	              v = visualizations[key]; // Handle each data format

	              v.dataFormats.forEach(function (format) {
	                switch (format) {
	                  case "combo:numerical-random":
	                    if (!fields.numericalRandom || fields.numericalRandom.length < 2) {
	                      break;
	                    }

	                    if (!combos_numerical_random) {
	                      combos_numerical_random = combinations(fields.numericalRandom);
	                    }

	                    console.assert(combos_numerical_random.length > 0); // Add a group of visualizations

	                    chosen.push({
	                      type: key,
	                      position: v.position,
	                      iterations: combos_numerical_random.map(function (combo) {
	                        return {
	                          x: combo[0],
	                          y: combo[1]
	                        };
	                      }),
	                      iterationData: v.iterationData,
	                      iterationTitles: v.iterationTitles,
	                      makeQueryVars: v.makeQueryVars,
	                      render: v.render
	                    }); // Make sure the script gets loaded

	                    scripts.add(v.script);
	                }
	              });
	            }

	            loader.bar.style.width = 20 + "%"; // Handle no visulizations

	            if (!(chosen.length == 0)) {
	              _context.next = 9;
	              break;
	            }

	            distributions = fields.all.map(function (field) {
	              return field.field + ":" + field.distribution;
	            });
	            error = new Error("fields: " + JSON.stringify(distributions, null, 2));
	            throw makeKnownError(ERROR_NO_VISUALIZATIONS, error);

	          case 9:
	            _context.next = 11;
	            return load_scripts(Array.from(scripts.values()), loader);

	          case 11:
	            return _context.abrupt("return", chosen);

	          case 12:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee);
	  }));
	  return _load_designs.apply(this, arguments);
	}

	function load_scripts(_x3, _x4) {
	  return _load_scripts.apply(this, arguments);
	}

	function _load_scripts() {
	  _load_scripts = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(scripts, loader) {
	    var total, interval, i;
	    return regeneratorRuntime.wrap(function _callee2$(_context2) {
	      while (1) {
	        switch (_context2.prev = _context2.next) {
	          case 0:
	            total = scripts.length, interval = 80 / total;
	            i = 1;

	          case 2:
	            if (!(i <= total)) {
	              _context2.next = 16;
	              break;
	            }

	            loader.desc.textContent = i + "/" + total;
	            _context2.prev = 4;
	            _context2.next = 7;
	            return loadScript(scripts[i - 1]);

	          case 7:
	            _context2.next = 12;
	            break;

	          case 9:
	            _context2.prev = 9;
	            _context2.t0 = _context2["catch"](4);
	            throw makeKnownError(ERROR_CANT_GET_APP_FILE, _context2.t0);

	          case 12:
	            loader.bar.style.width = (i == total ? 100 : 20 + interval * i) + "%";

	          case 13:
	            i++;
	            _context2.next = 2;
	            break;

	          case 16:
	          case "end":
	            return _context2.stop();
	        }
	      }
	    }, _callee2, null, [[4, 9]]);
	  }));
	  return _load_scripts.apply(this, arguments);
	}

	function render_visualizations(_x5, _x6) {
	  return _render_visualizations.apply(this, arguments);
	}

	function _render_visualizations() {
	  _render_visualizations = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(config, loader) {
	    var total, interval, pn, i, v, plots, n, j, iter, input, svg, plot, titles, url, extraQueryVars;
	    return regeneratorRuntime.wrap(function _callee3$(_context3) {
	      while (1) {
	        switch (_context3.prev = _context3.next) {
	          case 0:
	            total = 0;
	            config.visualizations.map(function (v) {
	              total += v.iterations.length;
	            });
	            interval = 100 / total; // Sort visualizations by position

	            config.visualizations.sort(function (a, b) {
	              return a.position - b.position;
	            }); // Render each visualization

	            pn = 1;
	            i = 0;

	          case 6:
	            if (!(i < config.visualizations.length)) {
	              _context3.next = 53;
	              break;
	            }

	            v = config.visualizations[i]; // Plots container

	            plots = plots_container(); // Choose n value

	            n = choose_n(v.iterations.length); // Iterate through visualization

	            j = 0;

	          case 11:
	            if (!(j < v.iterations.length)) {
	              _context3.next = 49;
	              break;
	            }

	            iter = v.iterations[j], input = null, svg = null, plot = null;
	            loader.desc.textContent = pn + "/" + total; // Get the data needed for this iteration

	            _context3.prev = 14;
	            input = v.iterationData(iter, config.fields, config.data.slice(1));
	            _context3.next = 21;
	            break;

	          case 18:
	            _context3.prev = 18;
	            _context3.t0 = _context3["catch"](14);
	            throw makeKnownError(ERROR_PREPARING_VISUALIZATION_INPUT, _context3.t0);

	          case 21:
	            _context3.prev = 21;
	            _context3.next = 24;
	            return v.render(input);

	          case 24:
	            svg = _context3.sent;
	            _context3.next = 32;
	            break;

	          case 27:
	            _context3.prev = 27;
	            _context3.t1 = _context3["catch"](21);

	            if (!isKnownError(_context3.t1)) {
	              _context3.next = 31;
	              break;
	            }

	            throw _context3.t1;

	          case 31:
	            throw makeKnownError(ERROR_RENDERING_VISUALIZATION, _context3.t1);

	          case 32:
	            _context3.prev = 32;
	            // Get a title to describe the visualization
	            titles = v.iterationTitles(iter, config.fields); // Make the plot url

	            url = "/plot?id=" + config.id + "&sheet=" + config.sheet + "&pn=" + pn + "&v=" + v.type;
	            extraQueryVars = v.makeQueryVars(iter, config.fields);

	            if (extraQueryVars.length > 0) {
	              url += "&" + extraQueryVars.join("&");
	            } // Put the plot into a DOM element


	            plot = format_plot(pn, url, n, titles, svg);
	            _context3.next = 43;
	            break;

	          case 40:
	            _context3.prev = 40;
	            _context3.t2 = _context3["catch"](32);
	            throw makeKnownError(ERROR_FORMATTING_VISUALIZATION, _context3.t2);

	          case 43:
	            // Add the plot element to the container
	            plots.appendChild(plot); // Update loader

	            loader.bar.style.width = (pn == total ? 100 : interval * pn) + "%"; // Increment the plot number

	            pn += 1;

	          case 46:
	            j++;
	            _context3.next = 11;
	            break;

	          case 49:
	            // Add the plot to the root
	            config.root.appendChild(plots);

	          case 50:
	            i++;
	            _context3.next = 6;
	            break;

	          case 53:
	            // If all that worked, then fill in the report title
	            set_title(config.title, config.url);

	          case 54:
	          case "end":
	            return _context3.stop();
	        }
	      }
	    }, _callee3, null, [[14, 18], [21, 27], [32, 40]]);
	  }));
	  return _render_visualizations.apply(this, arguments);
	}

	function set_title(title, url) {
	  var title_element = document.getElementById("report-spreadsheet-title"),
	      link_element = document.getElementById("report-spreadsheet-url");
	  title_element.textContent = title;
	  link_element.href = url;
	}

	function plots_container() {
	  var div = document.createElement("div");
	  div.classList.add("report-plots-container");
	  return div;
	}

	function choose_n(num_iterations) {
	  return 4;
	}

	function format_plot(plot_number, url, n, titles, svg) {
	  // Create <div class="svg-wrap">
	  var wrap = document.createElement("a");
	  wrap.id = "pn-" + plot_number;
	  wrap.classList.add("report-svg-wrap");
	  wrap.href = url;
	  wrap.target = "_blank";
	  wrap.rel = "noopener noreferrer";
	  titles.forEach(function (title) {
	    wrap.appendChild(format_plot_title(title));
	  });
	  wrap.appendChild(svg); // Create <div class="plot-n">

	  var container = document.createElement("div");
	  container.classList.add("report-plot-" + n);
	  container.appendChild(wrap);
	  return container;
	}

	function format_plot_title(title) {
	  var div = document.createElement("div");
	  div.classList.add("report-plot-title");
	  div.appendChild(document.createTextNode(title));
	  return div;
	}

	// Loading report

	var processing = document.getElementById("report-processing");
	var part1 = document.getElementById("report-loader-part1"),
	    load_part1_bar = part1.querySelector(".report-loader-bar-complete"),
	    load_part1_desc = part1.querySelector(".report-loader-part-desc");
	var part2 = document.getElementById("report-loader-part2"),
	    load_part2_bar = part2.querySelector(".report-loader-bar-complete"),
	    load_part2_desc = part2.querySelector(".report-loader-part-desc");
	var part3 = document.getElementById("report-loader-part3"),
	    load_part3_bar = part3.querySelector(".report-loader-bar-complete"),
	    load_part3_desc = part3.querySelector(".report-loader-part-desc"); // Sign in message

	var authorize_message = document.getElementById("authorize-container"),
	    signin_button = document.getElementById("signin"); // Contains the report

	var report = document.getElementById("report"); // Request channels ---------------------------

	var request_channel = null,
	    response_channels = new Map(); // Define the processing steps ---------------

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
	} // Execute ------------------------------------
	// TODO: Cancel and re-process on submitting new URL


	var spreadsheetId = refresh_id();

	if (spreadsheetId) {
	  process$3(spreadsheetId, STEP_BEFORE_AUTH);
	} // Initialize top bar ------------------------


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

	function refresh_id() {
	  var id = query_var("id");

	  if (id.length == 0) {
	    return null;
	  }

	  return id;
	} // Actally do processing steps ---------------


	function showIssue(step, error) {
	  if (!showLoadingKnownIssue(null, error)) {
	    showLoadingBug(stepToString(step), error);
	  }
	}

	function showBug(step, error) {
	  showLoadingBug(stepToString(step), error);
	}

	function process$3(_x, _x2) {
	  return _process.apply(this, arguments);
	}

	function _process() {
	  _process = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(id, firstStep) {
	    var api, metadata, sheet, fields, designs, data, auth, render_config;
	    return regeneratorRuntime.wrap(function _callee$(_context) {
	      while (1) {
	        switch (_context.prev = _context.next) {
	          case 0:
	            console.log("processing [" + id + "]");
	            api = null, metadata = null, sheet = null, fields = null, designs = null, data = null; // Make auth config (signin / signout buttons)

	            auth = {
	              signin: [{
	                element: signin_button,
	                afterAuth: function afterAuth() {
	                  authorize_message.classList.add("hidden");
	                  process$3(id, STEP_AFTER_AUTH);
	                }
	              }]
	            }; // Part 1 --------------------------------------
	            // Authenticating

	            _context.prev = 3;
	            _context.next = 6;
	            return get_api(auth, {
	              bar: load_part1_bar,
	              desc: load_part1_desc
	            });

	          case 6:
	            api = _context.sent;
	            _context.next = 13;
	            break;

	          case 9:
	            _context.prev = 9;
	            _context.t0 = _context["catch"](3);
	            showIssue(firstStep, _context.t0);
	            return _context.abrupt("return");

	          case 13:
	            // Getting metadata
	            load_part1_desc.textContent = "Getting metadata";
	            _context.prev = 14;
	            _context.next = 17;
	            return api.getSpreadsheetMetadata(id);

	          case 17:
	            metadata = _context.sent;
	            _context.next = 31;
	            break;

	          case 20:
	            _context.prev = 20;
	            _context.t1 = _context["catch"](14);

	            if (!isAuthIssue(_context.t1)) {
	              _context.next = 29;
	              break;
	            }

	            if (!(firstStep == STEP_BEFORE_AUTH)) {
	              _context.next = 26;
	              break;
	            }

	            authorize_message.classList.remove("hidden");
	            return _context.abrupt("return");

	          case 26:
	            if (!(firstStep == STEP_AFTER_AUTH)) {
	              _context.next = 29;
	              break;
	            }

	            showLoadingKnownIssue(ISSUE_SPREADSHEET_ACCESS);
	            return _context.abrupt("return");

	          case 29:
	            showIssue(STEP_GET_METADATA, _context.t1);
	            return _context.abrupt("return");

	          case 31:
	            load_part1_bar.style.width = 45 + "%"; // Choosing sheet

	            load_part1_desc.textContent = "Choosing sheet";
	            _context.prev = 33;
	            sheet = choose_single_sheet(metadata.sheets);

	            if (sheet) {
	              _context.next = 38;
	              break;
	            }

	            showLoadingKnownIssue(ISSUE_NO_FIELDS_SHEET);
	            return _context.abrupt("return");

	          case 38:
	            _context.next = 44;
	            break;

	          case 40:
	            _context.prev = 40;
	            _context.t2 = _context["catch"](33);
	            showBug(STEP_CHOOSE_SHEET, _context.t2);
	            return _context.abrupt("return");

	          case 44:
	            load_part1_bar.style.width = 50 + "%"; // Reading fields

	            load_part1_desc.textContent = "Reading spreadsheet fields";
	            _context.prev = 46;
	            _context.next = 49;
	            return api.getSpreadsheetValues(id, sheet + ".fields");

	          case 49:
	            fields = _context.sent;
	            _context.next = 56;
	            break;

	          case 52:
	            _context.prev = 52;
	            _context.t3 = _context["catch"](46);
	            showIssue(STEP_DOWNLOAD_FIELDS, _context.t3);
	            return _context.abrupt("return");

	          case 56:
	            load_part1_bar.style.width = 70 + "%"; // Reading data

	            load_part1_desc.textContent = "Reading spreadsheet data";
	            _context.prev = 58;
	            _context.next = 61;
	            return api.getSpreadsheetValues(id, sheet);

	          case 61:
	            data = _context.sent;
	            _context.next = 68;
	            break;

	          case 64:
	            _context.prev = 64;
	            _context.t4 = _context["catch"](58);
	            showIssue(STEP_DOWNLOAD_DATA, _context.t4);
	            return _context.abrupt("return");

	          case 68:
	            load_part1_bar.style.width = 90 + "%"; // Validating

	            load_part1_desc.textContent = "Checking consistency";
	            _context.prev = 70;
	            fields = organize_fields(fields);

	            if (!fields.isMalformed) {
	              _context.next = 75;
	              break;
	            }

	            showLoadingKnownIssue(ISSUE_BAD_FIELDS_SHEET);
	            return _context.abrupt("return");

	          case 75:
	            _context.next = 81;
	            break;

	          case 77:
	            _context.prev = 77;
	            _context.t5 = _context["catch"](70);
	            showBug(STEP_ORGANIZE_FIELDS, _context.t5);
	            return _context.abrupt("return");

	          case 81:
	            _context.prev = 81;
	            fields = match_header_to_fields(fields, data[0]);

	            if (fields) {
	              _context.next = 86;
	              break;
	            }

	            showLoadingKnownIssue(ISSUE_FIELDS_SHEET_SYNC);
	            return _context.abrupt("return");

	          case 86:
	            _context.next = 92;
	            break;

	          case 88:
	            _context.prev = 88;
	            _context.t6 = _context["catch"](81);
	            showBug(STEP_MATCH_FIELDS, _context.t6);
	            return _context.abrupt("return");

	          case 92:
	            load_part1_bar.style.width = 100 + "%"; // Part 2 --------------------------------------

	            _context.prev = 93;
	            _context.next = 96;
	            return load_designs(fields, {
	              bar: load_part2_bar,
	              desc: load_part2_desc
	            });

	          case 96:
	            designs = _context.sent;
	            _context.next = 103;
	            break;

	          case 99:
	            _context.prev = 99;
	            _context.t7 = _context["catch"](93);
	            showIssue(STEP_CHOOSE_VISUALIZATIONS, _context.t7);
	            return _context.abrupt("return");

	          case 103:
	            // Part 3 --------------------------------------
	            render_config = {
	              root: report,
	              id: id,
	              sheet: sheet,
	              title: metadata.properties.title,
	              url: metadata.spreadsheetUrl,
	              fields: fields,
	              visualizations: designs,
	              data: data
	            };
	            _context.prev = 104;
	            _context.next = 107;
	            return render_visualizations(render_config, {
	              bar: load_part3_bar,
	              desc: load_part3_desc
	            });

	          case 107:
	            _context.next = 113;
	            break;

	          case 109:
	            _context.prev = 109;
	            _context.t8 = _context["catch"](104);
	            showIssue(STEP_MAKE_VISUALIZATIONS, _context.t8);
	            return _context.abrupt("return");

	          case 113:
	            finish(id, sheet);

	          case 114:
	          case "end":
	            return _context.stop();
	        }
	      }
	    }, _callee, null, [[3, 9], [14, 20], [33, 40], [46, 52], [58, 64], [70, 77], [81, 88], [93, 99], [104, 109]]);
	  }));
	  return _process.apply(this, arguments);
	}

	function finish(id, sheet) {
	  request_channel = new BroadcastChannel("request_channel:" + spreadsheetId + ":" + sheet);
	  request_channel.onmessage = handle_channel_request;
	  processing.classList.add("hidden");
	  report.classList.remove("invisible");
	}

	function handle_channel_request(e) {
	  console.log("Report received message:", e.data);

	  switch (e.data.type) {
	    case "CloseChannel":
	      var response_channel_name = e.data.params.response_channel,
	          response_channel = response_channels.get(response_channel_name);

	      if (response_channel) {
	        response_channels.delete(response_channel_name);
	        response_channel.close();
	      }

	      break;

	    case "ResourceRequest":
	      var response_channel_name = e.data.params.response_channel,
	          response_channel = response_channels.get(response_channel_name);

	      if (!response_channel) {
	        response_channel = new BroadcastChannel(response_channel_name);
	        response_channels.set(response_channel_name, response_channel);
	      }

	      var plot = get_plot_from_report(e.data.params.plot_number);

	      if (!plot) {
	        response_channel.postMessage({
	          type: "ResourceResponse",
	          params: {
	            hasResource: false
	          }
	        });
	      } else {
	        response_channel.postMessage({
	          type: "ResourceResponse",
	          params: {
	            hasResource: true,
	            spreadsheet: get_spreadsheet_info(),
	            title: plot.title,
	            resource: plot.svg.outerHTML
	          }
	        });
	      }

	      break;

	    default:
	      console.log("Can't handle message:", e);
	  }
	}

	function get_spreadsheet_info() {
	  return {
	    title: document.getElementById("report-spreadsheet-title").textContent,
	    url: document.getElementById("report-spreadsheet-url").href
	  };
	}

	function join_titles(collection) {
	  var output = [];

	  for (var i = 0; i < collection.length; i++) {
	    var div = collection.item(i);
	    output.push(div.textContent);
	  }

	  return output.join(" ");
	}

	function get_plot_from_report(plot_number) {
	  var link = document.getElementById("pn-" + plot_number);

	  if (!link) {
	    return null;
	  }

	  var svg = link.querySelector("svg");

	  if (!svg) {
	    return null;
	  }

	  var titles = link.getElementsByClassName("report-plot-title");

	  if (titles.length == 0) {
	    return null;
	  }

	  return {
	    title: join_titles(titles),
	    svg: svg
	  };
	}

}());
