window["cvat"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/api.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = __webpack_require__(/*! ./../defaults */ "./node_modules/axios/lib/defaults.js");
var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, {method: 'get'}, this.defaults, config);
  config.method = config.method.toLowerCase();

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");
var isAbsoluteURL = __webpack_require__(/*! ./../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ./../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
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
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var isBuffer = __webpack_require__(/*! is-buffer */ "./node_modules/is-buffer/index.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};


/***/ }),

/***/ "./node_modules/core-js/internals/a-function.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/a-function.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};


/***/ }),

/***/ "./node_modules/core-js/internals/a-possible-prototype.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/a-possible-prototype.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

module.exports = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};


/***/ }),

/***/ "./node_modules/core-js/internals/add-to-unscopables.js":
/*!**************************************************************!*\
  !*** ./node_modules/core-js/internals/add-to-unscopables.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");
var create = __webpack_require__(/*! ../internals/object-create */ "./node_modules/core-js/internals/object-create.js");
var hide = __webpack_require__(/*! ../internals/hide */ "./node_modules/core-js/internals/hide.js");

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  hide(ArrayPrototype, UNSCOPABLES, create(null));
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};


/***/ }),

/***/ "./node_modules/core-js/internals/advance-string-index.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/advance-string-index.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var charAt = __webpack_require__(/*! ../internals/string-multibyte */ "./node_modules/core-js/internals/string-multibyte.js").charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};


/***/ }),

/***/ "./node_modules/core-js/internals/an-instance.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/an-instance.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  } return it;
};


/***/ }),

/***/ "./node_modules/core-js/internals/an-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/an-object.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};


/***/ }),

/***/ "./node_modules/core-js/internals/array-from.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/array-from.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var bind = __webpack_require__(/*! ../internals/bind-context */ "./node_modules/core-js/internals/bind-context.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");
var callWithSafeIterationClosing = __webpack_require__(/*! ../internals/call-with-safe-iteration-closing */ "./node_modules/core-js/internals/call-with-safe-iteration-closing.js");
var isArrayIteratorMethod = __webpack_require__(/*! ../internals/is-array-iterator-method */ "./node_modules/core-js/internals/is-array-iterator-method.js");
var toLength = __webpack_require__(/*! ../internals/to-length */ "./node_modules/core-js/internals/to-length.js");
var createProperty = __webpack_require__(/*! ../internals/create-property */ "./node_modules/core-js/internals/create-property.js");
var getIteratorMethod = __webpack_require__(/*! ../internals/get-iterator-method */ "./node_modules/core-js/internals/get-iterator-method.js");

// `Array.from` method implementation
// https://tc39.github.io/ecma262/#sec-array.from
module.exports = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject(arrayLike);
  var C = typeof this == 'function' ? this : Array;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var index = 0;
  var iteratorMethod = getIteratorMethod(O);
  var length, result, step, iterator;
  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
    iterator = iteratorMethod.call(O);
    result = new C();
    for (;!(step = iterator.next()).done; index++) {
      createProperty(result, index, mapping
        ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true)
        : step.value
      );
    }
  } else {
    length = toLength(O.length);
    result = new C(length);
    for (;length > index; index++) {
      createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
    }
  }
  result.length = index;
  return result;
};


/***/ }),

/***/ "./node_modules/core-js/internals/array-includes.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/array-includes.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var toLength = __webpack_require__(/*! ../internals/to-length */ "./node_modules/core-js/internals/to-length.js");
var toAbsoluteIndex = __webpack_require__(/*! ../internals/to-absolute-index */ "./node_modules/core-js/internals/to-absolute-index.js");

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),

/***/ "./node_modules/core-js/internals/bind-context.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/bind-context.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var aFunction = __webpack_require__(/*! ../internals/a-function */ "./node_modules/core-js/internals/a-function.js");

// optional / simple context binding
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
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


/***/ }),

/***/ "./node_modules/core-js/internals/call-with-safe-iteration-closing.js":
/*!****************************************************************************!*\
  !*** ./node_modules/core-js/internals/call-with-safe-iteration-closing.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    var returnMethod = iterator['return'];
    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
    throw error;
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/check-correctness-of-iteration.js":
/*!**************************************************************************!*\
  !*** ./node_modules/core-js/internals/check-correctness-of-iteration.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var ITERATOR = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

module.exports = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};


/***/ }),

/***/ "./node_modules/core-js/internals/classof-raw.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/classof-raw.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ "./node_modules/core-js/internals/classof.js":
/*!***************************************************!*\
  !*** ./node_modules/core-js/internals/classof.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var classofRaw = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};


/***/ }),

/***/ "./node_modules/core-js/internals/copy-constructor-properties.js":
/*!***********************************************************************!*\
  !*** ./node_modules/core-js/internals/copy-constructor-properties.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var ownKeys = __webpack_require__(/*! ../internals/own-keys */ "./node_modules/core-js/internals/own-keys.js");
var getOwnPropertyDescriptorModule = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "./node_modules/core-js/internals/object-get-own-property-descriptor.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/correct-prototype-getter.js":
/*!********************************************************************!*\
  !*** ./node_modules/core-js/internals/correct-prototype-getter.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});


/***/ }),

/***/ "./node_modules/core-js/internals/create-iterator-constructor.js":
/*!***********************************************************************!*\
  !*** ./node_modules/core-js/internals/create-iterator-constructor.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var IteratorPrototype = __webpack_require__(/*! ../internals/iterators-core */ "./node_modules/core-js/internals/iterators-core.js").IteratorPrototype;
var create = __webpack_require__(/*! ../internals/object-create */ "./node_modules/core-js/internals/object-create.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");
var setToStringTag = __webpack_require__(/*! ../internals/set-to-string-tag */ "./node_modules/core-js/internals/set-to-string-tag.js");
var Iterators = __webpack_require__(/*! ../internals/iterators */ "./node_modules/core-js/internals/iterators.js");

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};


/***/ }),

/***/ "./node_modules/core-js/internals/create-property-descriptor.js":
/*!**********************************************************************!*\
  !*** ./node_modules/core-js/internals/create-property-descriptor.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "./node_modules/core-js/internals/create-property.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/create-property.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toPrimitive = __webpack_require__(/*! ../internals/to-primitive */ "./node_modules/core-js/internals/to-primitive.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");

module.exports = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};


/***/ }),

/***/ "./node_modules/core-js/internals/define-iterator.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/define-iterator.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var createIteratorConstructor = __webpack_require__(/*! ../internals/create-iterator-constructor */ "./node_modules/core-js/internals/create-iterator-constructor.js");
var getPrototypeOf = __webpack_require__(/*! ../internals/object-get-prototype-of */ "./node_modules/core-js/internals/object-get-prototype-of.js");
var setPrototypeOf = __webpack_require__(/*! ../internals/object-set-prototype-of */ "./node_modules/core-js/internals/object-set-prototype-of.js");
var setToStringTag = __webpack_require__(/*! ../internals/set-to-string-tag */ "./node_modules/core-js/internals/set-to-string-tag.js");
var hide = __webpack_require__(/*! ../internals/hide */ "./node_modules/core-js/internals/hide.js");
var redefine = __webpack_require__(/*! ../internals/redefine */ "./node_modules/core-js/internals/redefine.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "./node_modules/core-js/internals/is-pure.js");
var Iterators = __webpack_require__(/*! ../internals/iterators */ "./node_modules/core-js/internals/iterators.js");
var IteratorsCore = __webpack_require__(/*! ../internals/iterators-core */ "./node_modules/core-js/internals/iterators-core.js");

var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
          hide(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    hide(IterablePrototype, ITERATOR, defaultIterator);
  }
  Iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};


/***/ }),

/***/ "./node_modules/core-js/internals/descriptors.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/descriptors.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

// Thank's IE8 for his funny defineProperty
module.exports = !fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "./node_modules/core-js/internals/document-create-element.js":
/*!*******************************************************************!*\
  !*** ./node_modules/core-js/internals/document-create-element.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ "./node_modules/core-js/internals/dom-iterables.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/dom-iterables.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
module.exports = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};


/***/ }),

/***/ "./node_modules/core-js/internals/enum-bug-keys.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/enum-bug-keys.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),

/***/ "./node_modules/core-js/internals/export.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/export.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var getOwnPropertyDescriptor = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "./node_modules/core-js/internals/object-get-own-property-descriptor.js").f;
var hide = __webpack_require__(/*! ../internals/hide */ "./node_modules/core-js/internals/hide.js");
var redefine = __webpack_require__(/*! ../internals/redefine */ "./node_modules/core-js/internals/redefine.js");
var setGlobal = __webpack_require__(/*! ../internals/set-global */ "./node_modules/core-js/internals/set-global.js");
var copyConstructorProperties = __webpack_require__(/*! ../internals/copy-constructor-properties */ "./node_modules/core-js/internals/copy-constructor-properties.js");
var isForced = __webpack_require__(/*! ../internals/is-forced */ "./node_modules/core-js/internals/is-forced.js");

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      hide(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/fails.js":
/*!*************************************************!*\
  !*** ./node_modules/core-js/internals/fails.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js":
/*!******************************************************************************!*\
  !*** ./node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var hide = __webpack_require__(/*! ../internals/hide */ "./node_modules/core-js/internals/hide.js");
var redefine = __webpack_require__(/*! ../internals/redefine */ "./node_modules/core-js/internals/redefine.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");
var regexpExec = __webpack_require__(/*! ../internals/regexp-exec */ "./node_modules/core-js/internals/regexp-exec.js");

var SPECIES = wellKnownSymbol('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
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

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

module.exports = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };

    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
    }

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
    if (sham) hide(RegExp.prototype[SYMBOL], 'sham', true);
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/forced-string-trim-method.js":
/*!*********************************************************************!*\
  !*** ./node_modules/core-js/internals/forced-string-trim-method.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var whitespaces = __webpack_require__(/*! ../internals/whitespaces */ "./node_modules/core-js/internals/whitespaces.js");

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
module.exports = function (METHOD_NAME) {
  return fails(function () {
    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
  });
};


/***/ }),

/***/ "./node_modules/core-js/internals/function-to-string.js":
/*!**************************************************************!*\
  !*** ./node_modules/core-js/internals/function-to-string.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(/*! ../internals/shared */ "./node_modules/core-js/internals/shared.js");

module.exports = shared('native-function-to-string', Function.toString);


/***/ }),

/***/ "./node_modules/core-js/internals/get-built-in.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/get-built-in.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var path = __webpack_require__(/*! ../internals/path */ "./node_modules/core-js/internals/path.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};


/***/ }),

/***/ "./node_modules/core-js/internals/get-iterator-method.js":
/*!***************************************************************!*\
  !*** ./node_modules/core-js/internals/get-iterator-method.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(/*! ../internals/classof */ "./node_modules/core-js/internals/classof.js");
var Iterators = __webpack_require__(/*! ../internals/iterators */ "./node_modules/core-js/internals/iterators.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),

/***/ "./node_modules/core-js/internals/get-iterator.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/get-iterator.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var getIteratorMethod = __webpack_require__(/*! ../internals/get-iterator-method */ "./node_modules/core-js/internals/get-iterator-method.js");

module.exports = function (it) {
  var iteratorMethod = getIteratorMethod(it);
  if (typeof iteratorMethod != 'function') {
    throw TypeError(String(it) + ' is not iterable');
  } return anObject(iteratorMethod.call(it));
};


/***/ }),

/***/ "./node_modules/core-js/internals/global.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/global.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var O = 'object';
var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == O && globalThis) ||
  check(typeof window == O && window) ||
  check(typeof self == O && self) ||
  check(typeof global == O && global) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/core-js/internals/has.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/internals/has.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ "./node_modules/core-js/internals/hidden-keys.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/hidden-keys.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),

/***/ "./node_modules/core-js/internals/hide.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/internals/hide.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "./node_modules/core-js/internals/host-report-errors.js":
/*!**************************************************************!*\
  !*** ./node_modules/core-js/internals/host-report-errors.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");

module.exports = function (a, b) {
  var console = global.console;
  if (console && console.error) {
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/html.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/internals/html.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),

/***/ "./node_modules/core-js/internals/ie8-dom-define.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/ie8-dom-define.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var createElement = __webpack_require__(/*! ../internals/document-create-element */ "./node_modules/core-js/internals/document-create-element.js");

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});


/***/ }),

/***/ "./node_modules/core-js/internals/indexed-object.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/indexed-object.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;


/***/ }),

/***/ "./node_modules/core-js/internals/internal-state.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/internal-state.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var NATIVE_WEAK_MAP = __webpack_require__(/*! ../internals/native-weak-map */ "./node_modules/core-js/internals/native-weak-map.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var hide = __webpack_require__(/*! ../internals/hide */ "./node_modules/core-js/internals/hide.js");
var objectHas = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "./node_modules/core-js/internals/shared-key.js");
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    hide(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-array-iterator-method.js":
/*!********************************************************************!*\
  !*** ./node_modules/core-js/internals/is-array-iterator-method.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");
var Iterators = __webpack_require__(/*! ../internals/iterators */ "./node_modules/core-js/internals/iterators.js");

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-forced.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-forced.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),

/***/ "./node_modules/core-js/internals/is-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/is-object.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ "./node_modules/core-js/internals/is-pure.js":
/*!***************************************************!*\
  !*** ./node_modules/core-js/internals/is-pure.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),

/***/ "./node_modules/core-js/internals/iterate.js":
/*!***************************************************!*\
  !*** ./node_modules/core-js/internals/iterate.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var isArrayIteratorMethod = __webpack_require__(/*! ../internals/is-array-iterator-method */ "./node_modules/core-js/internals/is-array-iterator-method.js");
var toLength = __webpack_require__(/*! ../internals/to-length */ "./node_modules/core-js/internals/to-length.js");
var bind = __webpack_require__(/*! ../internals/bind-context */ "./node_modules/core-js/internals/bind-context.js");
var getIteratorMethod = __webpack_require__(/*! ../internals/get-iterator-method */ "./node_modules/core-js/internals/get-iterator-method.js");
var callWithSafeIterationClosing = __webpack_require__(/*! ../internals/call-with-safe-iteration-closing */ "./node_modules/core-js/internals/call-with-safe-iteration-closing.js");

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
  var boundFunction = bind(fn, that, AS_ENTRIES ? 2 : 1);
  var iterator, iterFn, index, length, result, step;

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = toLength(iterable.length); length > index; index++) {
        result = AS_ENTRIES
          ? boundFunction(anObject(step = iterable[index])[0], step[1])
          : boundFunction(iterable[index]);
        if (result && result instanceof Result) return result;
      } return new Result(false);
    }
    iterator = iterFn.call(iterable);
  }

  while (!(step = iterator.next()).done) {
    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
    if (result && result instanceof Result) return result;
  } return new Result(false);
};

iterate.stop = function (result) {
  return new Result(true, result);
};


/***/ }),

/***/ "./node_modules/core-js/internals/iterators-core.js":
/*!**********************************************************!*\
  !*** ./node_modules/core-js/internals/iterators-core.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var getPrototypeOf = __webpack_require__(/*! ../internals/object-get-prototype-of */ "./node_modules/core-js/internals/object-get-prototype-of.js");
var hide = __webpack_require__(/*! ../internals/hide */ "./node_modules/core-js/internals/hide.js");
var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "./node_modules/core-js/internals/is-pure.js");

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};


/***/ }),

/***/ "./node_modules/core-js/internals/iterators.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/iterators.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {};


/***/ }),

/***/ "./node_modules/core-js/internals/microtask.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/microtask.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var getOwnPropertyDescriptor = __webpack_require__(/*! ../internals/object-get-own-property-descriptor */ "./node_modules/core-js/internals/object-get-own-property-descriptor.js").f;
var classof = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");
var macrotask = __webpack_require__(/*! ../internals/task */ "./node_modules/core-js/internals/task.js").set;
var userAgent = __webpack_require__(/*! ../internals/user-agent */ "./node_modules/core-js/internals/user-agent.js");

var MutationObserver = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var IS_NODE = classof(process) == 'process';
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor(global, 'queueMicrotask');
var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

var flush, head, last, notify, toggle, node, promise;

// modern engines have queueMicrotask method
if (!queueMicrotask) {
  flush = function () {
    var parent, fn;
    if (IS_NODE && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (error) {
        if (head) notify();
        else last = undefined;
        throw error;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (IS_NODE) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  } else if (MutationObserver && !/(iphone|ipod|ipad).*applewebkit/i.test(userAgent)) {
    toggle = true;
    node = document.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise.resolve(undefined);
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
      macrotask.call(global, flush);
    };
  }
}

module.exports = queueMicrotask || function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify();
  } last = task;
};


/***/ }),

/***/ "./node_modules/core-js/internals/native-symbol.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/native-symbol.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});


/***/ }),

/***/ "./node_modules/core-js/internals/native-url.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/native-url.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "./node_modules/core-js/internals/is-pure.js");

var ITERATOR = wellKnownSymbol('iterator');

module.exports = !fails(function () {
  var url = new URL('b?e=1', 'http://a');
  var searchParams = url.searchParams;
  url.pathname = 'c%20d';
  return (IS_PURE && !url.toJSON)
    || !searchParams.sort
    || url.href !== 'http://a/c%20d?e=1'
    || searchParams.get('e') !== '1'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !searchParams[ITERATOR]
    // throws in Edge
    || new URL('https://a@b').username !== 'a'
    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
    // not punycoded in Edge
    || new URL('http://тест').host !== 'xn--e1aybc'
    // not escaped in Chrome 62-
    || new URL('http://a#б').hash !== '#%D0%B1';
});


/***/ }),

/***/ "./node_modules/core-js/internals/native-weak-map.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/native-weak-map.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var nativeFunctionToString = __webpack_require__(/*! ../internals/function-to-string */ "./node_modules/core-js/internals/function-to-string.js");

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(nativeFunctionToString.call(WeakMap));


/***/ }),

/***/ "./node_modules/core-js/internals/new-promise-capability.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/internals/new-promise-capability.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var aFunction = __webpack_require__(/*! ../internals/a-function */ "./node_modules/core-js/internals/a-function.js");

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
};

// 25.4.1.5 NewPromiseCapability(C)
module.exports.f = function (C) {
  return new PromiseCapability(C);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-assign.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/object-assign.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var objectKeys = __webpack_require__(/*! ../internals/object-keys */ "./node_modules/core-js/internals/object-keys.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "./node_modules/core-js/internals/object-get-own-property-symbols.js");
var propertyIsEnumerableModule = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "./node_modules/core-js/internals/object-property-is-enumerable.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "./node_modules/core-js/internals/indexed-object.js");

var nativeAssign = Object.assign;

// `Object.assign` method
// https://tc39.github.io/ecma262/#sec-object.assign
// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !nativeAssign || fails(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var symbol = Symbol();
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(S, key)) T[key] = S[key];
    }
  } return T;
} : nativeAssign;


/***/ }),

/***/ "./node_modules/core-js/internals/object-create.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/internals/object-create.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var defineProperties = __webpack_require__(/*! ../internals/object-define-properties */ "./node_modules/core-js/internals/object-define-properties.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "./node_modules/core-js/internals/enum-bug-keys.js");
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");
var html = __webpack_require__(/*! ../internals/html */ "./node_modules/core-js/internals/html.js");
var documentCreateElement = __webpack_require__(/*! ../internals/document-create-element */ "./node_modules/core-js/internals/document-create-element.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "./node_modules/core-js/internals/shared-key.js");
var IE_PROTO = sharedKey('IE_PROTO');

var PROTOTYPE = 'prototype';
var Empty = function () { /* empty */ };

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var length = enumBugKeys.length;
  var lt = '<';
  var script = 'script';
  var gt = '>';
  var js = 'java' + script + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = String(js);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + script + gt + 'document.F=Object' + lt + '/' + script + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (length--) delete createDict[PROTOTYPE][enumBugKeys[length]];
  return createDict();
};

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : defineProperties(result, Properties);
};

hiddenKeys[IE_PROTO] = true;


/***/ }),

/***/ "./node_modules/core-js/internals/object-define-properties.js":
/*!********************************************************************!*\
  !*** ./node_modules/core-js/internals/object-define-properties.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var objectKeys = __webpack_require__(/*! ../internals/object-keys */ "./node_modules/core-js/internals/object-keys.js");

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], Properties[key]);
  return O;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-define-property.js":
/*!******************************************************************!*\
  !*** ./node_modules/core-js/internals/object-define-property.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "./node_modules/core-js/internals/ie8-dom-define.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var toPrimitive = __webpack_require__(/*! ../internals/to-primitive */ "./node_modules/core-js/internals/to-primitive.js");

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-descriptor.js":
/*!******************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-descriptor.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var propertyIsEnumerableModule = __webpack_require__(/*! ../internals/object-property-is-enumerable */ "./node_modules/core-js/internals/object-property-is-enumerable.js");
var createPropertyDescriptor = __webpack_require__(/*! ../internals/create-property-descriptor */ "./node_modules/core-js/internals/create-property-descriptor.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var toPrimitive = __webpack_require__(/*! ../internals/to-primitive */ "./node_modules/core-js/internals/to-primitive.js");
var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ../internals/ie8-dom-define */ "./node_modules/core-js/internals/ie8-dom-define.js");

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-names.js":
/*!*************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-names.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(/*! ../internals/object-keys-internal */ "./node_modules/core-js/internals/object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "./node_modules/core-js/internals/enum-bug-keys.js");

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-own-property-symbols.js":
/*!***************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-own-property-symbols.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ "./node_modules/core-js/internals/object-get-prototype-of.js":
/*!*******************************************************************!*\
  !*** ./node_modules/core-js/internals/object-get-prototype-of.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");
var sharedKey = __webpack_require__(/*! ../internals/shared-key */ "./node_modules/core-js/internals/shared-key.js");
var CORRECT_PROTOTYPE_GETTER = __webpack_require__(/*! ../internals/correct-prototype-getter */ "./node_modules/core-js/internals/correct-prototype-getter.js");

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-keys-internal.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/object-keys-internal.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var indexOf = __webpack_require__(/*! ../internals/array-includes */ "./node_modules/core-js/internals/array-includes.js").indexOf;
var hiddenKeys = __webpack_require__(/*! ../internals/hidden-keys */ "./node_modules/core-js/internals/hidden-keys.js");

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-keys.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/object-keys.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var internalObjectKeys = __webpack_require__(/*! ../internals/object-keys-internal */ "./node_modules/core-js/internals/object-keys-internal.js");
var enumBugKeys = __webpack_require__(/*! ../internals/enum-bug-keys */ "./node_modules/core-js/internals/enum-bug-keys.js");

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),

/***/ "./node_modules/core-js/internals/object-property-is-enumerable.js":
/*!*************************************************************************!*\
  !*** ./node_modules/core-js/internals/object-property-is-enumerable.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;


/***/ }),

/***/ "./node_modules/core-js/internals/object-set-prototype-of.js":
/*!*******************************************************************!*\
  !*** ./node_modules/core-js/internals/object-set-prototype-of.js ***!
  \*******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var aPossiblePrototype = __webpack_require__(/*! ../internals/a-possible-prototype */ "./node_modules/core-js/internals/a-possible-prototype.js");

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);


/***/ }),

/***/ "./node_modules/core-js/internals/own-keys.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/internals/own-keys.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");
var getOwnPropertyNamesModule = __webpack_require__(/*! ../internals/object-get-own-property-names */ "./node_modules/core-js/internals/object-get-own-property-names.js");
var getOwnPropertySymbolsModule = __webpack_require__(/*! ../internals/object-get-own-property-symbols */ "./node_modules/core-js/internals/object-get-own-property-symbols.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ "./node_modules/core-js/internals/path.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/internals/path.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");


/***/ }),

/***/ "./node_modules/core-js/internals/perform.js":
/*!***************************************************!*\
  !*** ./node_modules/core-js/internals/perform.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/promise-resolve.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/internals/promise-resolve.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var newPromiseCapability = __webpack_require__(/*! ../internals/new-promise-capability */ "./node_modules/core-js/internals/new-promise-capability.js");

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};


/***/ }),

/***/ "./node_modules/core-js/internals/punycode-to-ascii.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/punycode-to-ascii.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'
var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
var baseMinusTMin = base - tMin;
var floor = Math.floor;
var stringFromCharCode = String.fromCharCode;

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 */
var ucs2decode = function (string) {
  var output = [];
  var counter = 0;
  var length = string.length;
  while (counter < length) {
    var value = string.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // It's a high surrogate, and there is a next character.
      var extra = string.charCodeAt(counter++);
      if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
};

/**
 * Converts a digit/integer into a basic code point.
 */
var digitToBasic = function (digit) {
  //  0..25 map to ASCII a..z or A..Z
  // 26..35 map to ASCII 0..9
  return digit + 22 + 75 * (digit < 26);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 */
var adapt = function (delta, numPoints, firstTime) {
  var k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor(delta / baseMinusTMin);
  }
  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
// eslint-disable-next-line  max-statements
var encode = function (input) {
  var output = [];

  // Convert the input in UCS-2 to an array of Unicode code points.
  input = ucs2decode(input);

  // Cache the length.
  var inputLength = input.length;

  // Initialize the state.
  var n = initialN;
  var delta = 0;
  var bias = initialBias;
  var i, currentValue;

  // Handle the basic code points.
  for (i = 0; i < input.length; i++) {
    currentValue = input[i];
    if (currentValue < 0x80) {
      output.push(stringFromCharCode(currentValue));
    }
  }

  var basicLength = output.length; // number of basic code points.
  var handledCPCount = basicLength; // number of code points that have been handled;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    output.push(delimiter);
  }

  // Main encoding loop:
  while (handledCPCount < inputLength) {
    // All non-basic code points < n have been handled already. Find the next larger one:
    var m = maxInt;
    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }

    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
    var handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      throw RangeError(OVERFLOW_ERROR);
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue < n && ++delta > maxInt) {
        throw RangeError(OVERFLOW_ERROR);
      }
      if (currentValue == n) {
        // Represent delta as a generalized variable-length integer.
        var q = delta;
        for (var k = base; /* no condition */; k += base) {
          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
          if (q < t) break;
          var qMinusT = q - t;
          var baseMinusT = base - t;
          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
          q = floor(qMinusT / baseMinusT);
        }

        output.push(stringFromCharCode(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }

    ++delta;
    ++n;
  }
  return output.join('');
};

module.exports = function (input) {
  var encoded = [];
  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
  }
  return encoded.join('.');
};


/***/ }),

/***/ "./node_modules/core-js/internals/redefine-all.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/redefine-all.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var redefine = __webpack_require__(/*! ../internals/redefine */ "./node_modules/core-js/internals/redefine.js");

module.exports = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};


/***/ }),

/***/ "./node_modules/core-js/internals/redefine.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/internals/redefine.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var shared = __webpack_require__(/*! ../internals/shared */ "./node_modules/core-js/internals/shared.js");
var hide = __webpack_require__(/*! ../internals/hide */ "./node_modules/core-js/internals/hide.js");
var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var setGlobal = __webpack_require__(/*! ../internals/set-global */ "./node_modules/core-js/internals/set-global.js");
var nativeFunctionToString = __webpack_require__(/*! ../internals/function-to-string */ "./node_modules/core-js/internals/function-to-string.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "./node_modules/core-js/internals/internal-state.js");

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(nativeFunctionToString).split('toString');

shared('inspectSource', function (it) {
  return nativeFunctionToString.call(it);
});

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) hide(value, 'name', key);
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else hide(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || nativeFunctionToString.call(this);
});


/***/ }),

/***/ "./node_modules/core-js/internals/regexp-exec-abstract.js":
/*!****************************************************************!*\
  !*** ./node_modules/core-js/internals/regexp-exec-abstract.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var classof = __webpack_require__(/*! ./classof-raw */ "./node_modules/core-js/internals/classof-raw.js");
var regexpExec = __webpack_require__(/*! ./regexp-exec */ "./node_modules/core-js/internals/regexp-exec.js");

// `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classof(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec.call(R, S);
};



/***/ }),

/***/ "./node_modules/core-js/internals/regexp-exec.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/regexp-exec.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var regexpFlags = __webpack_require__(/*! ./regexp-flags */ "./node_modules/core-js/internals/regexp-flags.js");

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;


/***/ }),

/***/ "./node_modules/core-js/internals/regexp-flags.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/regexp-flags.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");

// `RegExp.prototype.flags` getter implementation
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),

/***/ "./node_modules/core-js/internals/require-object-coercible.js":
/*!********************************************************************!*\
  !*** ./node_modules/core-js/internals/require-object-coercible.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ "./node_modules/core-js/internals/set-global.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/set-global.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var hide = __webpack_require__(/*! ../internals/hide */ "./node_modules/core-js/internals/hide.js");

module.exports = function (key, value) {
  try {
    hide(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),

/***/ "./node_modules/core-js/internals/set-species.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/set-species.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");
var definePropertyModule = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");

var SPECIES = wellKnownSymbol('species');

module.exports = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
  var defineProperty = definePropertyModule.f;

  if (DESCRIPTORS && Constructor && !Constructor[SPECIES]) {
    defineProperty(Constructor, SPECIES, {
      configurable: true,
      get: function () { return this; }
    });
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/set-to-string-tag.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/set-to-string-tag.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js").f;
var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};


/***/ }),

/***/ "./node_modules/core-js/internals/shared-key.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/shared-key.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var shared = __webpack_require__(/*! ../internals/shared */ "./node_modules/core-js/internals/shared.js");
var uid = __webpack_require__(/*! ../internals/uid */ "./node_modules/core-js/internals/uid.js");

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ "./node_modules/core-js/internals/shared.js":
/*!**************************************************!*\
  !*** ./node_modules/core-js/internals/shared.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var setGlobal = __webpack_require__(/*! ../internals/set-global */ "./node_modules/core-js/internals/set-global.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "./node_modules/core-js/internals/is-pure.js");

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.1.3',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ "./node_modules/core-js/internals/sloppy-array-method.js":
/*!***************************************************************!*\
  !*** ./node_modules/core-js/internals/sloppy-array-method.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");

module.exports = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !method || !fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};


/***/ }),

/***/ "./node_modules/core-js/internals/species-constructor.js":
/*!***************************************************************!*\
  !*** ./node_modules/core-js/internals/species-constructor.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var aFunction = __webpack_require__(/*! ../internals/a-function */ "./node_modules/core-js/internals/a-function.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var SPECIES = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.github.io/ecma262/#sec-speciesconstructor
module.exports = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? defaultConstructor : aFunction(S);
};


/***/ }),

/***/ "./node_modules/core-js/internals/string-multibyte.js":
/*!************************************************************!*\
  !*** ./node_modules/core-js/internals/string-multibyte.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(/*! ../internals/to-integer */ "./node_modules/core-js/internals/to-integer.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};


/***/ }),

/***/ "./node_modules/core-js/internals/string-trim.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/string-trim.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");
var whitespaces = __webpack_require__(/*! ../internals/whitespaces */ "./node_modules/core-js/internals/whitespaces.js");

var whitespace = '[' + whitespaces + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod = function (TYPE) {
  return function ($this) {
    var string = String(requireObjectCoercible($this));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };
};

module.exports = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
  start: createMethod(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
  end: createMethod(2),
  // `String.prototype.trim` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
  trim: createMethod(3)
};


/***/ }),

/***/ "./node_modules/core-js/internals/task.js":
/*!************************************************!*\
  !*** ./node_modules/core-js/internals/task.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");
var bind = __webpack_require__(/*! ../internals/bind-context */ "./node_modules/core-js/internals/bind-context.js");
var html = __webpack_require__(/*! ../internals/html */ "./node_modules/core-js/internals/html.js");
var createElement = __webpack_require__(/*! ../internals/document-create-element */ "./node_modules/core-js/internals/document-create-element.js");

var location = global.location;
var set = global.setImmediate;
var clear = global.clearImmediate;
var process = global.process;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function (id) {
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};

var runner = function (id) {
  return function () {
    run(id);
  };
};

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global.postMessage(id + '', location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set || !clear) {
  set = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (classof(process) == 'process') {
    defer = function (id) {
      process.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = bind(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts && !fails(post)) {
    defer = post;
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in createElement('script')) {
    defer = function (id) {
      html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(runner(id), 0);
    };
  }
}

module.exports = {
  set: set,
  clear: clear
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-absolute-index.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/to-absolute-index.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(/*! ../internals/to-integer */ "./node_modules/core-js/internals/to-integer.js");

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-indexed-object.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/to-indexed-object.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(/*! ../internals/indexed-object */ "./node_modules/core-js/internals/indexed-object.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-integer.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/to-integer.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-length.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/to-length.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var toInteger = __webpack_require__(/*! ../internals/to-integer */ "./node_modules/core-js/internals/to-integer.js");

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-object.js":
/*!*****************************************************!*\
  !*** ./node_modules/core-js/internals/to-object.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
module.exports = function (argument) {
  return Object(requireObjectCoercible(argument));
};


/***/ }),

/***/ "./node_modules/core-js/internals/to-primitive.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/internals/to-primitive.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "./node_modules/core-js/internals/uid.js":
/*!***********************************************!*\
  !*** ./node_modules/core-js/internals/uid.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};


/***/ }),

/***/ "./node_modules/core-js/internals/user-agent.js":
/*!******************************************************!*\
  !*** ./node_modules/core-js/internals/user-agent.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getBuiltIn = __webpack_require__(/*! ../internals/get-built-in */ "./node_modules/core-js/internals/get-built-in.js");

module.exports = getBuiltIn('navigator', 'userAgent') || '';


/***/ }),

/***/ "./node_modules/core-js/internals/well-known-symbol.js":
/*!*************************************************************!*\
  !*** ./node_modules/core-js/internals/well-known-symbol.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var shared = __webpack_require__(/*! ../internals/shared */ "./node_modules/core-js/internals/shared.js");
var uid = __webpack_require__(/*! ../internals/uid */ "./node_modules/core-js/internals/uid.js");
var NATIVE_SYMBOL = __webpack_require__(/*! ../internals/native-symbol */ "./node_modules/core-js/internals/native-symbol.js");

var Symbol = global.Symbol;
var store = shared('wks');

module.exports = function (name) {
  return store[name] || (store[name] = NATIVE_SYMBOL && Symbol[name]
    || (NATIVE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};


/***/ }),

/***/ "./node_modules/core-js/internals/whitespaces.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/internals/whitespaces.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// a string of all valid unicode whitespaces
// eslint-disable-next-line max-len
module.exports = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';


/***/ }),

/***/ "./node_modules/core-js/modules/es.array.iterator.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/modules/es.array.iterator.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var toIndexedObject = __webpack_require__(/*! ../internals/to-indexed-object */ "./node_modules/core-js/internals/to-indexed-object.js");
var addToUnscopables = __webpack_require__(/*! ../internals/add-to-unscopables */ "./node_modules/core-js/internals/add-to-unscopables.js");
var Iterators = __webpack_require__(/*! ../internals/iterators */ "./node_modules/core-js/internals/iterators.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "./node_modules/core-js/internals/internal-state.js");
var defineIterator = __webpack_require__(/*! ../internals/define-iterator */ "./node_modules/core-js/internals/define-iterator.js");

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.github.io/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.github.io/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.github.io/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.github.io/ecma262/#sec-createarrayiterator
module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
Iterators.Arguments = Iterators.Array;

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),

/***/ "./node_modules/core-js/modules/es.array.sort.js":
/*!*******************************************************!*\
  !*** ./node_modules/core-js/modules/es.array.sort.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var aFunction = __webpack_require__(/*! ../internals/a-function */ "./node_modules/core-js/internals/a-function.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");
var fails = __webpack_require__(/*! ../internals/fails */ "./node_modules/core-js/internals/fails.js");
var sloppyArrayMethod = __webpack_require__(/*! ../internals/sloppy-array-method */ "./node_modules/core-js/internals/sloppy-array-method.js");

var nativeSort = [].sort;
var test = [1, 2, 3];

// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  test.sort(null);
});
// Old WebKit
var SLOPPY_METHOD = sloppyArrayMethod('sort');

var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || SLOPPY_METHOD;

// `Array.prototype.sort` method
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
$({ target: 'Array', proto: true, forced: FORCED }, {
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? nativeSort.call(toObject(this))
      : nativeSort.call(toObject(this), aFunction(comparefn));
  }
});


/***/ }),

/***/ "./node_modules/core-js/modules/es.promise.js":
/*!****************************************************!*\
  !*** ./node_modules/core-js/modules/es.promise.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var IS_PURE = __webpack_require__(/*! ../internals/is-pure */ "./node_modules/core-js/internals/is-pure.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var path = __webpack_require__(/*! ../internals/path */ "./node_modules/core-js/internals/path.js");
var redefineAll = __webpack_require__(/*! ../internals/redefine-all */ "./node_modules/core-js/internals/redefine-all.js");
var setToStringTag = __webpack_require__(/*! ../internals/set-to-string-tag */ "./node_modules/core-js/internals/set-to-string-tag.js");
var setSpecies = __webpack_require__(/*! ../internals/set-species */ "./node_modules/core-js/internals/set-species.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var aFunction = __webpack_require__(/*! ../internals/a-function */ "./node_modules/core-js/internals/a-function.js");
var anInstance = __webpack_require__(/*! ../internals/an-instance */ "./node_modules/core-js/internals/an-instance.js");
var classof = __webpack_require__(/*! ../internals/classof-raw */ "./node_modules/core-js/internals/classof-raw.js");
var iterate = __webpack_require__(/*! ../internals/iterate */ "./node_modules/core-js/internals/iterate.js");
var checkCorrectnessOfIteration = __webpack_require__(/*! ../internals/check-correctness-of-iteration */ "./node_modules/core-js/internals/check-correctness-of-iteration.js");
var speciesConstructor = __webpack_require__(/*! ../internals/species-constructor */ "./node_modules/core-js/internals/species-constructor.js");
var task = __webpack_require__(/*! ../internals/task */ "./node_modules/core-js/internals/task.js").set;
var microtask = __webpack_require__(/*! ../internals/microtask */ "./node_modules/core-js/internals/microtask.js");
var promiseResolve = __webpack_require__(/*! ../internals/promise-resolve */ "./node_modules/core-js/internals/promise-resolve.js");
var hostReportErrors = __webpack_require__(/*! ../internals/host-report-errors */ "./node_modules/core-js/internals/host-report-errors.js");
var newPromiseCapabilityModule = __webpack_require__(/*! ../internals/new-promise-capability */ "./node_modules/core-js/internals/new-promise-capability.js");
var perform = __webpack_require__(/*! ../internals/perform */ "./node_modules/core-js/internals/perform.js");
var userAgent = __webpack_require__(/*! ../internals/user-agent */ "./node_modules/core-js/internals/user-agent.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "./node_modules/core-js/internals/internal-state.js");
var isForced = __webpack_require__(/*! ../internals/is-forced */ "./node_modules/core-js/internals/is-forced.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var SPECIES = wellKnownSymbol('species');
var PROMISE = 'Promise';
var getInternalState = InternalStateModule.get;
var setInternalState = InternalStateModule.set;
var getInternalPromiseState = InternalStateModule.getterFor(PROMISE);
var PromiseConstructor = global[PROMISE];
var TypeError = global.TypeError;
var document = global.document;
var process = global.process;
var $fetch = global.fetch;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var newPromiseCapability = newPromiseCapabilityModule.f;
var newGenericPromiseCapability = newPromiseCapability;
var IS_NODE = classof(process) == 'process';
var DISPATCH_EVENT = !!(document && document.createEvent && global.dispatchEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var Internal, OwnPromiseCapability, PromiseWrapper;

var FORCED = isForced(PROMISE, function () {
  // correct subclassing with @@species support
  var promise = PromiseConstructor.resolve(1);
  var empty = function () { /* empty */ };
  var FakePromise = (promise.constructor = {})[SPECIES] = function (exec) {
    exec(empty, empty);
  };
  // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
  return !((IS_NODE || typeof PromiseRejectionEvent == 'function')
    && (!IS_PURE || promise['finally'])
    && promise.then(empty) instanceof FakePromise
    // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // we can't detect it synchronously, so just check versions
    && v8.indexOf('6.6') !== 0
    && userAgent.indexOf('Chrome/66') === -1);
});

var INCORRECT_ITERATION = FORCED || !checkCorrectnessOfIteration(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};

var notify = function (promise, state, isReject) {
  if (state.notified) return;
  state.notified = true;
  var chain = state.reactions;
  microtask(function () {
    var value = state.value;
    var ok = state.state == FULFILLED;
    var index = 0;
    // variable length - can't use forEach
    while (chain.length > index) {
      var reaction = chain[index++];
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
            state.rejection = HANDLED;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // can throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (error) {
        if (domain && !exited) domain.exit();
        reject(error);
      }
    }
    state.reactions = [];
    state.notified = false;
    if (isReject && !state.rejection) onUnhandled(promise, state);
  });
};

var dispatchEvent = function (name, promise, reason) {
  var event, handler;
  if (DISPATCH_EVENT) {
    event = document.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (handler = global['on' + name]) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
};

var onUnhandled = function (promise, state) {
  task.call(global, function () {
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform(function () {
        if (IS_NODE) {
          process.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (promise, state) {
  task.call(global, function () {
    if (IS_NODE) {
      process.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind = function (fn, promise, state, unwrap) {
  return function (value) {
    fn(promise, state, value, unwrap);
  };
};

var internalReject = function (promise, state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  state.value = value;
  state.state = REJECTED;
  notify(promise, state, true);
};

var internalResolve = function (promise, state, value, unwrap) {
  if (state.done) return;
  state.done = true;
  if (unwrap) state = unwrap;
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask(function () {
        var wrapper = { done: false };
        try {
          then.call(value,
            bind(internalResolve, promise, wrapper, state),
            bind(internalReject, promise, wrapper, state)
          );
        } catch (error) {
          internalReject(promise, wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify(promise, state, false);
    }
  } catch (error) {
    internalReject(promise, { done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance(this, PromiseConstructor, PROMISE);
    aFunction(executor);
    Internal.call(this);
    var state = getInternalState(this);
    try {
      executor(bind(internalResolve, this, state), bind(internalReject, this, state));
    } catch (error) {
      internalReject(this, state, error);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    setInternalState(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: [],
      rejection: false,
      state: PENDING,
      value: undefined
    });
  };
  Internal.prototype = redefineAll(PromiseConstructor.prototype, {
    // `Promise.prototype.then` method
    // https://tc39.github.io/ecma262/#sec-promise.prototype.then
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = IS_NODE ? process.domain : undefined;
      state.parent = true;
      state.reactions.push(reaction);
      if (state.state != PENDING) notify(this, state, false);
      return reaction.promise;
    },
    // `Promise.prototype.catch` method
    // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalState(promise);
    this.promise = promise;
    this.resolve = bind(internalResolve, promise, state);
    this.reject = bind(internalReject, promise, state);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  // wrap fetch result
  if (!IS_PURE && typeof $fetch == 'function') $({ global: true, enumerable: true, forced: true }, {
    // eslint-disable-next-line no-unused-vars
    fetch: function fetch(input) {
      return promiseResolve(PromiseConstructor, $fetch.apply(global, arguments));
    }
  });
}

$({ global: true, wrap: true, forced: FORCED }, {
  Promise: PromiseConstructor
});

setToStringTag(PromiseConstructor, PROMISE, false, true);
setSpecies(PROMISE);

PromiseWrapper = path[PROMISE];

// statics
$({ target: PROMISE, stat: true, forced: FORCED }, {
  // `Promise.reject` method
  // https://tc39.github.io/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    capability.reject.call(undefined, r);
    return capability.promise;
  }
});

$({ target: PROMISE, stat: true, forced: IS_PURE || FORCED }, {
  // `Promise.resolve` method
  // https://tc39.github.io/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve(IS_PURE && this === PromiseWrapper ? PromiseConstructor : this, x);
  }
});

$({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
  // `Promise.all` method
  // https://tc39.github.io/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        $promiseResolve.call(C, promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.error) reject(result.value);
    return capability.promise;
  },
  // `Promise.race` method
  // https://tc39.github.io/ecma262/#sec-promise.race
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      var $promiseResolve = aFunction(C.resolve);
      iterate(iterable, function (promise) {
        $promiseResolve.call(C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});


/***/ }),

/***/ "./node_modules/core-js/modules/es.string.iterator.js":
/*!************************************************************!*\
  !*** ./node_modules/core-js/modules/es.string.iterator.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var charAt = __webpack_require__(/*! ../internals/string-multibyte */ "./node_modules/core-js/internals/string-multibyte.js").charAt;
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "./node_modules/core-js/internals/internal-state.js");
var defineIterator = __webpack_require__(/*! ../internals/define-iterator */ "./node_modules/core-js/internals/define-iterator.js");

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: point, done: false };
});


/***/ }),

/***/ "./node_modules/core-js/modules/es.string.replace.js":
/*!***********************************************************!*\
  !*** ./node_modules/core-js/modules/es.string.replace.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var fixRegExpWellKnownSymbolLogic = __webpack_require__(/*! ../internals/fix-regexp-well-known-symbol-logic */ "./node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var toObject = __webpack_require__(/*! ../internals/to-object */ "./node_modules/core-js/internals/to-object.js");
var toLength = __webpack_require__(/*! ../internals/to-length */ "./node_modules/core-js/internals/to-length.js");
var toInteger = __webpack_require__(/*! ../internals/to-integer */ "./node_modules/core-js/internals/to-integer.js");
var requireObjectCoercible = __webpack_require__(/*! ../internals/require-object-coercible */ "./node_modules/core-js/internals/require-object-coercible.js");
var advanceStringIndex = __webpack_require__(/*! ../internals/advance-string-index */ "./node_modules/core-js/internals/advance-string-index.js");
var regExpExec = __webpack_require__(/*! ../internals/regexp-exec-abstract */ "./node_modules/core-js/internals/regexp-exec-abstract.js");

var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
fixRegExpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative) {
  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible(this);
      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
      return replacer !== undefined
        ? replacer.call(searchValue, O, replaceValue)
        : nativeReplace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = anObject(regexp);
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
        var result = regExpExec(rx, S);
        if (result === null) break;

        results.push(result);
        if (!global) break;

        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = String(result[0]);
        var position = max(min(toInteger(result.index), S.length), 0);
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
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return nativeReplace.call(replacement, symbols, function (match, ch) {
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
            var f = floor(n / 10);
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


/***/ }),

/***/ "./node_modules/core-js/modules/es.string.trim.js":
/*!********************************************************!*\
  !*** ./node_modules/core-js/modules/es.string.trim.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var $trim = __webpack_require__(/*! ../internals/string-trim */ "./node_modules/core-js/internals/string-trim.js").trim;
var forcedStringTrimMethod = __webpack_require__(/*! ../internals/forced-string-trim-method */ "./node_modules/core-js/internals/forced-string-trim-method.js");

// `String.prototype.trim` method
// https://tc39.github.io/ecma262/#sec-string.prototype.trim
$({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});


/***/ }),

/***/ "./node_modules/core-js/modules/es.symbol.description.js":
/*!***************************************************************!*\
  !*** ./node_modules/core-js/modules/es.symbol.description.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// `Symbol.prototype.description` getter
// https://tc39.github.io/ecma262/#sec-symbol.prototype.description

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var defineProperty = __webpack_require__(/*! ../internals/object-define-property */ "./node_modules/core-js/internals/object-define-property.js").f;
var copyConstructorProperties = __webpack_require__(/*! ../internals/copy-constructor-properties */ "./node_modules/core-js/internals/copy-constructor-properties.js");

var NativeSymbol = global.Symbol;

if (DESCRIPTORS && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
    var result = this instanceof SymbolWrapper
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };
  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
  symbolPrototype.constructor = SymbolWrapper;

  var symbolToString = symbolPrototype.toString;
  var native = String(NativeSymbol('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has(EmptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $({ global: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}


/***/ }),

/***/ "./node_modules/core-js/modules/web.dom-collections.iterator.js":
/*!**********************************************************************!*\
  !*** ./node_modules/core-js/modules/web.dom-collections.iterator.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var DOMIterables = __webpack_require__(/*! ../internals/dom-iterables */ "./node_modules/core-js/internals/dom-iterables.js");
var ArrayIteratorMethods = __webpack_require__(/*! ../modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");
var hide = __webpack_require__(/*! ../internals/hide */ "./node_modules/core-js/internals/hide.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var ITERATOR = wellKnownSymbol('iterator');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
      hide(CollectionPrototype, ITERATOR, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR] = ArrayValues;
    }
    if (!CollectionPrototype[TO_STRING_TAG]) hide(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        hide(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
}


/***/ }),

/***/ "./node_modules/core-js/modules/web.url-search-params.js":
/*!***************************************************************!*\
  !*** ./node_modules/core-js/modules/web.url-search-params.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
__webpack_require__(/*! ../modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");
var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var USE_NATIVE_URL = __webpack_require__(/*! ../internals/native-url */ "./node_modules/core-js/internals/native-url.js");
var redefine = __webpack_require__(/*! ../internals/redefine */ "./node_modules/core-js/internals/redefine.js");
var redefineAll = __webpack_require__(/*! ../internals/redefine-all */ "./node_modules/core-js/internals/redefine-all.js");
var setToStringTag = __webpack_require__(/*! ../internals/set-to-string-tag */ "./node_modules/core-js/internals/set-to-string-tag.js");
var createIteratorConstructor = __webpack_require__(/*! ../internals/create-iterator-constructor */ "./node_modules/core-js/internals/create-iterator-constructor.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "./node_modules/core-js/internals/internal-state.js");
var anInstance = __webpack_require__(/*! ../internals/an-instance */ "./node_modules/core-js/internals/an-instance.js");
var hasOwn = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var bind = __webpack_require__(/*! ../internals/bind-context */ "./node_modules/core-js/internals/bind-context.js");
var anObject = __webpack_require__(/*! ../internals/an-object */ "./node_modules/core-js/internals/an-object.js");
var isObject = __webpack_require__(/*! ../internals/is-object */ "./node_modules/core-js/internals/is-object.js");
var getIterator = __webpack_require__(/*! ../internals/get-iterator */ "./node_modules/core-js/internals/get-iterator.js");
var getIteratorMethod = __webpack_require__(/*! ../internals/get-iterator-method */ "./node_modules/core-js/internals/get-iterator-method.js");
var wellKnownSymbol = __webpack_require__(/*! ../internals/well-known-symbol */ "./node_modules/core-js/internals/well-known-symbol.js");

var ITERATOR = wellKnownSymbol('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState = InternalStateModule.set;
var getInternalParamsState = InternalStateModule.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule.getterFor(URL_SEARCH_PARAMS_ITERATOR);

var plus = /\+/g;
var sequences = Array(4);

var percentSequence = function (bytes) {
  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
};

var percentDecode = function (sequence) {
  try {
    return decodeURIComponent(sequence);
  } catch (error) {
    return sequence;
  }
};

var deserialize = function (it) {
  var result = it.replace(plus, ' ');
  var bytes = 4;
  try {
    return decodeURIComponent(result);
  } catch (error) {
    while (bytes) {
      result = result.replace(percentSequence(bytes--), percentDecode);
    }
    return result;
  }
};

var find = /[!'()~]|%20/g;

var replace = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+'
};

var replacer = function (match) {
  return replace[match];
};

var serialize = function (it) {
  return encodeURIComponent(it).replace(find, replacer);
};

var parseSearchParams = function (result, query) {
  if (query) {
    var attributes = query.split('&');
    var index = 0;
    var attribute, entry;
    while (index < attributes.length) {
      attribute = attributes[index++];
      if (attribute.length) {
        entry = attribute.split('=');
        result.push({
          key: deserialize(entry.shift()),
          value: deserialize(entry.join('='))
        });
      }
    }
  }
};

var updateSearchParams = function (query) {
  this.entries.length = 0;
  parseSearchParams(this.entries, query);
};

var validateArgumentsLength = function (passed, required) {
  if (passed < required) throw TypeError('Not enough arguments');
};

var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
  setInternalState(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    iterator: getIterator(getInternalParamsState(params).entries),
    kind: kind
  });
}, 'Iterator', function next() {
  var state = getInternalIteratorState(this);
  var kind = state.kind;
  var step = state.iterator.next();
  var entry = step.value;
  if (!step.done) {
    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
  } return step;
});

// `URLSearchParams` constructor
// https://url.spec.whatwg.org/#interface-urlsearchparams
var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var that = this;
  var entries = [];
  var iteratorMethod, iterator, step, entryIterator, first, second, key;

  setInternalState(that, {
    type: URL_SEARCH_PARAMS,
    entries: entries,
    updateURL: function () { /* empty */ },
    updateSearchParams: updateSearchParams
  });

  if (init !== undefined) {
    if (isObject(init)) {
      iteratorMethod = getIteratorMethod(init);
      if (typeof iteratorMethod === 'function') {
        iterator = iteratorMethod.call(init);
        while (!(step = iterator.next()).done) {
          entryIterator = getIterator(anObject(step.value));
          if (
            (first = entryIterator.next()).done ||
            (second = entryIterator.next()).done ||
            !entryIterator.next().done
          ) throw TypeError('Expected sequence with length 2');
          entries.push({ key: first.value + '', value: second.value + '' });
        }
      } else for (key in init) if (hasOwn(init, key)) entries.push({ key: key, value: init[key] + '' });
    } else {
      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
    }
  }
};

var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

redefineAll(URLSearchParamsPrototype, {
  // `URLSearchParams.prototype.appent` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    validateArgumentsLength(arguments.length, 2);
    var state = getInternalParamsState(this);
    state.entries.push({ key: name + '', value: value + '' });
    state.updateURL();
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var key = name + '';
    var index = 0;
    while (index < entries.length) {
      if (entries[index].key === key) entries.splice(index, 1);
      else index++;
    }
    state.updateURL();
  },
  // `URLSearchParams.prototype.get` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
  get: function get(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = name + '';
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) return entries[index].value;
    }
    return null;
  },
  // `URLSearchParams.prototype.getAll` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
  getAll: function getAll(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = name + '';
    var result = [];
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) result.push(entries[index].value);
    }
    return result;
  },
  // `URLSearchParams.prototype.has` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
  has: function has(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = name + '';
    var index = 0;
    while (index < entries.length) {
      if (entries[index++].key === key) return true;
    }
    return false;
  },
  // `URLSearchParams.prototype.set` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
  set: function set(name, value) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var found = false;
    var key = name + '';
    var val = value + '';
    var index = 0;
    var entry;
    for (; index < entries.length; index++) {
      entry = entries[index];
      if (entry.key === key) {
        if (found) entries.splice(index--, 1);
        else {
          found = true;
          entry.value = val;
        }
      }
    }
    if (!found) entries.push({ key: key, value: val });
    state.updateURL();
  },
  // `URLSearchParams.prototype.sort` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
  sort: function sort() {
    var state = getInternalParamsState(this);
    var entries = state.entries;
    // Array#sort is not stable in some engines
    var slice = entries.slice();
    var entry, entriesIndex, sliceIndex;
    entries.length = 0;
    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
      entry = slice[sliceIndex];
      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
        if (entries[entriesIndex].key > entry.key) {
          entries.splice(entriesIndex, 0, entry);
          break;
        }
      }
      if (entriesIndex === sliceIndex) entries.push(entry);
    }
    state.updateURL();
  },
  // `URLSearchParams.prototype.forEach` method
  forEach: function forEach(callback /* , thisArg */) {
    var entries = getInternalParamsState(this).entries;
    var boundFunction = bind(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
    var index = 0;
    var entry;
    while (index < entries.length) {
      entry = entries[index++];
      boundFunction(entry.value, entry.key, this);
    }
  },
  // `URLSearchParams.prototype.keys` method
  keys: function keys() {
    return new URLSearchParamsIterator(this, 'keys');
  },
  // `URLSearchParams.prototype.values` method
  values: function values() {
    return new URLSearchParamsIterator(this, 'values');
  },
  // `URLSearchParams.prototype.entries` method
  entries: function entries() {
    return new URLSearchParamsIterator(this, 'entries');
  }
}, { enumerable: true });

// `URLSearchParams.prototype[@@iterator]` method
redefine(URLSearchParamsPrototype, ITERATOR, URLSearchParamsPrototype.entries);

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
redefine(URLSearchParamsPrototype, 'toString', function toString() {
  var entries = getInternalParamsState(this).entries;
  var result = [];
  var index = 0;
  var entry;
  while (index < entries.length) {
    entry = entries[index++];
    result.push(serialize(entry.key) + '=' + serialize(entry.value));
  } return result.join('&');
}, { enumerable: true });

setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

$({ global: true, forced: !USE_NATIVE_URL }, {
  URLSearchParams: URLSearchParamsConstructor
});

module.exports = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};


/***/ }),

/***/ "./node_modules/core-js/modules/web.url.js":
/*!*************************************************!*\
  !*** ./node_modules/core-js/modules/web.url.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
__webpack_require__(/*! ../modules/es.string.iterator */ "./node_modules/core-js/modules/es.string.iterator.js");
var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");
var DESCRIPTORS = __webpack_require__(/*! ../internals/descriptors */ "./node_modules/core-js/internals/descriptors.js");
var USE_NATIVE_URL = __webpack_require__(/*! ../internals/native-url */ "./node_modules/core-js/internals/native-url.js");
var global = __webpack_require__(/*! ../internals/global */ "./node_modules/core-js/internals/global.js");
var defineProperties = __webpack_require__(/*! ../internals/object-define-properties */ "./node_modules/core-js/internals/object-define-properties.js");
var redefine = __webpack_require__(/*! ../internals/redefine */ "./node_modules/core-js/internals/redefine.js");
var anInstance = __webpack_require__(/*! ../internals/an-instance */ "./node_modules/core-js/internals/an-instance.js");
var has = __webpack_require__(/*! ../internals/has */ "./node_modules/core-js/internals/has.js");
var assign = __webpack_require__(/*! ../internals/object-assign */ "./node_modules/core-js/internals/object-assign.js");
var arrayFrom = __webpack_require__(/*! ../internals/array-from */ "./node_modules/core-js/internals/array-from.js");
var codeAt = __webpack_require__(/*! ../internals/string-multibyte */ "./node_modules/core-js/internals/string-multibyte.js").codeAt;
var toASCII = __webpack_require__(/*! ../internals/punycode-to-ascii */ "./node_modules/core-js/internals/punycode-to-ascii.js");
var setToStringTag = __webpack_require__(/*! ../internals/set-to-string-tag */ "./node_modules/core-js/internals/set-to-string-tag.js");
var URLSearchParamsModule = __webpack_require__(/*! ../modules/web.url-search-params */ "./node_modules/core-js/modules/web.url-search-params.js");
var InternalStateModule = __webpack_require__(/*! ../internals/internal-state */ "./node_modules/core-js/internals/internal-state.js");

var NativeURL = global.URL;
var URLSearchParams = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var setInternalState = InternalStateModule.set;
var getInternalURLState = InternalStateModule.getterFor('URL');
var floor = Math.floor;
var pow = Math.pow;

var INVALID_AUTHORITY = 'Invalid authority';
var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[A-Za-z]/;
var ALPHANUMERIC = /[\d+\-.A-Za-z]/;
var DIGIT = /\d/;
var HEX_START = /^(0x|0X)/;
var OCT = /^[0-7]+$/;
var DEC = /^\d+$/;
var HEX = /^[\dA-Fa-f]+$/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/;
// eslint-disable-next-line no-control-regex
var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
// eslint-disable-next-line no-control-regex
var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
var EOF;

var parseHost = function (url, input) {
  var result, codePoints, index;
  if (input.charAt(0) == '[') {
    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
    result = parseIPv6(input.slice(1, -1));
    if (!result) return INVALID_HOST;
    url.host = result;
  // opaque host
  } else if (!isSpecial(url)) {
    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
    result = '';
    codePoints = arrayFrom(input);
    for (index = 0; index < codePoints.length; index++) {
      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
    }
    url.host = result;
  } else {
    input = toASCII(input);
    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
    result = parseIPv4(input);
    if (result === null) return INVALID_HOST;
    url.host = result;
  }
};

var parseIPv4 = function (input) {
  var parts = input.split('.');
  var partsLength, numbers, index, part, radix, number, ipv4;
  if (parts.length && parts[parts.length - 1] == '') {
    parts.pop();
  }
  partsLength = parts.length;
  if (partsLength > 4) return input;
  numbers = [];
  for (index = 0; index < partsLength; index++) {
    part = parts[index];
    if (part == '') return input;
    radix = 10;
    if (part.length > 1 && part.charAt(0) == '0') {
      radix = HEX_START.test(part) ? 16 : 8;
      part = part.slice(radix == 8 ? 1 : 2);
    }
    if (part === '') {
      number = 0;
    } else {
      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
      number = parseInt(part, radix);
    }
    numbers.push(number);
  }
  for (index = 0; index < partsLength; index++) {
    number = numbers[index];
    if (index == partsLength - 1) {
      if (number >= pow(256, 5 - partsLength)) return null;
    } else if (number > 255) return null;
  }
  ipv4 = numbers.pop();
  for (index = 0; index < numbers.length; index++) {
    ipv4 += numbers[index] * pow(256, 3 - index);
  }
  return ipv4;
};

// eslint-disable-next-line max-statements
var parseIPv6 = function (input) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

  var char = function () {
    return input.charAt(pointer);
  };

  if (char() == ':') {
    if (input.charAt(1) != ':') return;
    pointer += 2;
    pieceIndex++;
    compress = pieceIndex;
  }
  while (char()) {
    if (pieceIndex == 8) return;
    if (char() == ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (length < 4 && HEX.test(char())) {
      value = value * 16 + parseInt(char(), 16);
      pointer++;
      length++;
    }
    if (char() == '.') {
      if (length == 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while (char()) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (char() == '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!DIGIT.test(char())) return;
        while (DIGIT.test(char())) {
          number = parseInt(char(), 10);
          if (ipv4Piece === null) ipv4Piece = number;
          else if (ipv4Piece == 0) return;
          else ipv4Piece = ipv4Piece * 10 + number;
          if (ipv4Piece > 255) return;
          pointer++;
        }
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
      }
      if (numbersSeen != 4) return;
      break;
    } else if (char() == ':') {
      pointer++;
      if (!char()) return;
    } else if (char()) return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex != 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex != 8) return;
  return address;
};

var findLongestZeroSequence = function (ipv6) {
  var maxIndex = null;
  var maxLength = 1;
  var currStart = null;
  var currLength = 0;
  var index = 0;
  for (; index < 8; index++) {
    if (ipv6[index] !== 0) {
      if (currLength > maxLength) {
        maxIndex = currStart;
        maxLength = currLength;
      }
      currStart = null;
      currLength = 0;
    } else {
      if (currStart === null) currStart = index;
      ++currLength;
    }
  }
  if (currLength > maxLength) {
    maxIndex = currStart;
    maxLength = currLength;
  }
  return maxIndex;
};

var serializeHost = function (host) {
  var result, index, compress, ignore0;
  // ipv4
  if (typeof host == 'number') {
    result = [];
    for (index = 0; index < 4; index++) {
      result.unshift(host % 256);
      host = floor(host / 256);
    } return result.join('.');
  // ipv6
  } else if (typeof host == 'object') {
    result = '';
    compress = findLongestZeroSequence(host);
    for (index = 0; index < 8; index++) {
      if (ignore0 && host[index] === 0) continue;
      if (ignore0) ignore0 = false;
      if (compress === index) {
        result += index ? ':' : '::';
        ignore0 = true;
      } else {
        result += host[index].toString(16);
        if (index < 7) result += ':';
      }
    }
    return '[' + result + ']';
  } return host;
};

var C0ControlPercentEncodeSet = {};
var fragmentPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
});
var pathPercentEncodeSet = assign({}, fragmentPercentEncodeSet, {
  '#': 1, '?': 1, '{': 1, '}': 1
});
var userinfoPercentEncodeSet = assign({}, pathPercentEncodeSet, {
  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
});

var percentEncode = function (char, set) {
  var code = codeAt(char, 0);
  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
};

var specialSchemes = {
  ftp: 21,
  file: null,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

var isSpecial = function (url) {
  return has(specialSchemes, url.scheme);
};

var includesCredentials = function (url) {
  return url.username != '' || url.password != '';
};

var cannotHaveUsernamePasswordPort = function (url) {
  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
};

var isWindowsDriveLetter = function (string, normalized) {
  var second;
  return string.length == 2 && ALPHA.test(string.charAt(0))
    && ((second = string.charAt(1)) == ':' || (!normalized && second == '|'));
};

var startsWithWindowsDriveLetter = function (string) {
  var third;
  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (
    string.length == 2 ||
    ((third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#')
  );
};

var shortenURLsPath = function (url) {
  var path = url.path;
  var pathSize = path.length;
  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
    path.pop();
  }
};

var isSingleDot = function (segment) {
  return segment === '.' || segment.toLowerCase() === '%2e';
};

var isDoubleDot = function (segment) {
  segment = segment.toLowerCase();
  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
};

// States:
var SCHEME_START = {};
var SCHEME = {};
var NO_SCHEME = {};
var SPECIAL_RELATIVE_OR_AUTHORITY = {};
var PATH_OR_AUTHORITY = {};
var RELATIVE = {};
var RELATIVE_SLASH = {};
var SPECIAL_AUTHORITY_SLASHES = {};
var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
var AUTHORITY = {};
var HOST = {};
var HOSTNAME = {};
var PORT = {};
var FILE = {};
var FILE_SLASH = {};
var FILE_HOST = {};
var PATH_START = {};
var PATH = {};
var CANNOT_BE_A_BASE_URL_PATH = {};
var QUERY = {};
var FRAGMENT = {};

// eslint-disable-next-line max-statements
var parseURL = function (url, input, stateOverride, base) {
  var state = stateOverride || SCHEME_START;
  var pointer = 0;
  var buffer = '';
  var seenAt = false;
  var seenBracket = false;
  var seenPasswordToken = false;
  var codePoints, char, bufferCodePoints, failure;

  if (!stateOverride) {
    url.scheme = '';
    url.username = '';
    url.password = '';
    url.host = null;
    url.port = null;
    url.path = [];
    url.query = null;
    url.fragment = null;
    url.cannotBeABaseURL = false;
    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
  }

  input = input.replace(TAB_AND_NEW_LINE, '');

  codePoints = arrayFrom(input);

  while (pointer <= codePoints.length) {
    char = codePoints[pointer];
    switch (state) {
      case SCHEME_START:
        if (char && ALPHA.test(char)) {
          buffer += char.toLowerCase();
          state = SCHEME;
        } else if (!stateOverride) {
          state = NO_SCHEME;
          continue;
        } else return INVALID_SCHEME;
        break;

      case SCHEME:
        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
          buffer += char.toLowerCase();
        } else if (char == ':') {
          if (stateOverride && (
            (isSpecial(url) != has(specialSchemes, buffer)) ||
            (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
            (url.scheme == 'file' && !url.host)
          )) return;
          url.scheme = buffer;
          if (stateOverride) {
            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
            return;
          }
          buffer = '';
          if (url.scheme == 'file') {
            state = FILE;
          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
            state = SPECIAL_RELATIVE_OR_AUTHORITY;
          } else if (isSpecial(url)) {
            state = SPECIAL_AUTHORITY_SLASHES;
          } else if (codePoints[pointer + 1] == '/') {
            state = PATH_OR_AUTHORITY;
            pointer++;
          } else {
            url.cannotBeABaseURL = true;
            url.path.push('');
            state = CANNOT_BE_A_BASE_URL_PATH;
          }
        } else if (!stateOverride) {
          buffer = '';
          state = NO_SCHEME;
          pointer = 0;
          continue;
        } else return INVALID_SCHEME;
        break;

      case NO_SCHEME:
        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
        if (base.cannotBeABaseURL && char == '#') {
          url.scheme = base.scheme;
          url.path = base.path.slice();
          url.query = base.query;
          url.fragment = '';
          url.cannotBeABaseURL = true;
          state = FRAGMENT;
          break;
        }
        state = base.scheme == 'file' ? FILE : RELATIVE;
        continue;

      case SPECIAL_RELATIVE_OR_AUTHORITY:
        if (char == '/' && codePoints[pointer + 1] == '/') {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          pointer++;
        } else {
          state = RELATIVE;
          continue;
        } break;

      case PATH_OR_AUTHORITY:
        if (char == '/') {
          state = AUTHORITY;
          break;
        } else {
          state = PATH;
          continue;
        }

      case RELATIVE:
        url.scheme = base.scheme;
        if (char == EOF) {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
        } else if (char == '/' || (char == '\\' && isSpecial(url))) {
          state = RELATIVE_SLASH;
        } else if (char == '?') {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
          url.fragment = '';
          state = FRAGMENT;
        } else {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.path.pop();
          state = PATH;
          continue;
        } break;

      case RELATIVE_SLASH:
        if (isSpecial(url) && (char == '/' || char == '\\')) {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        } else if (char == '/') {
          state = AUTHORITY;
        } else {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          state = PATH;
          continue;
        } break;

      case SPECIAL_AUTHORITY_SLASHES:
        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
        pointer++;
        break;

      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
        if (char != '/' && char != '\\') {
          state = AUTHORITY;
          continue;
        } break;

      case AUTHORITY:
        if (char == '@') {
          if (seenAt) buffer = '%40' + buffer;
          seenAt = true;
          bufferCodePoints = arrayFrom(buffer);
          for (var i = 0; i < bufferCodePoints.length; i++) {
            var codePoint = bufferCodePoints[i];
            if (codePoint == ':' && !seenPasswordToken) {
              seenPasswordToken = true;
              continue;
            }
            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
            if (seenPasswordToken) url.password += encodedCodePoints;
            else url.username += encodedCodePoints;
          }
          buffer = '';
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url))
        ) {
          if (seenAt && buffer == '') return INVALID_AUTHORITY;
          pointer -= arrayFrom(buffer).length + 1;
          buffer = '';
          state = HOST;
        } else buffer += char;
        break;

      case HOST:
      case HOSTNAME:
        if (stateOverride && url.scheme == 'file') {
          state = FILE_HOST;
          continue;
        } else if (char == ':' && !seenBracket) {
          if (buffer == '') return INVALID_HOST;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PORT;
          if (stateOverride == HOSTNAME) return;
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url))
        ) {
          if (isSpecial(url) && buffer == '') return INVALID_HOST;
          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PATH_START;
          if (stateOverride) return;
          continue;
        } else {
          if (char == '[') seenBracket = true;
          else if (char == ']') seenBracket = false;
          buffer += char;
        } break;

      case PORT:
        if (DIGIT.test(char)) {
          buffer += char;
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url)) ||
          stateOverride
        ) {
          if (buffer != '') {
            var port = parseInt(buffer, 10);
            if (port > 0xFFFF) return INVALID_PORT;
            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
            buffer = '';
          }
          if (stateOverride) return;
          state = PATH_START;
          continue;
        } else return INVALID_PORT;
        break;

      case FILE:
        url.scheme = 'file';
        if (char == '/' || char == '\\') state = FILE_SLASH;
        else if (base && base.scheme == 'file') {
          if (char == EOF) {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
          } else if (char == '?') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = '';
            state = QUERY;
          } else if (char == '#') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
            url.fragment = '';
            state = FRAGMENT;
          } else {
            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
              url.host = base.host;
              url.path = base.path.slice();
              shortenURLsPath(url);
            }
            state = PATH;
            continue;
          }
        } else {
          state = PATH;
          continue;
        } break;

      case FILE_SLASH:
        if (char == '/' || char == '\\') {
          state = FILE_HOST;
          break;
        }
        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);
          else url.host = base.host;
        }
        state = PATH;
        continue;

      case FILE_HOST:
        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
          if (!stateOverride && isWindowsDriveLetter(buffer)) {
            state = PATH;
          } else if (buffer == '') {
            url.host = '';
            if (stateOverride) return;
            state = PATH_START;
          } else {
            failure = parseHost(url, buffer);
            if (failure) return failure;
            if (url.host == 'localhost') url.host = '';
            if (stateOverride) return;
            buffer = '';
            state = PATH_START;
          } continue;
        } else buffer += char;
        break;

      case PATH_START:
        if (isSpecial(url)) {
          state = PATH;
          if (char != '/' && char != '\\') continue;
        } else if (!stateOverride && char == '?') {
          url.query = '';
          state = QUERY;
        } else if (!stateOverride && char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          state = PATH;
          if (char != '/') continue;
        } break;

      case PATH:
        if (
          char == EOF || char == '/' ||
          (char == '\\' && isSpecial(url)) ||
          (!stateOverride && (char == '?' || char == '#'))
        ) {
          if (isDoubleDot(buffer)) {
            shortenURLsPath(url);
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else if (isSingleDot(buffer)) {
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else {
            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
              if (url.host) url.host = '';
              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
            }
            url.path.push(buffer);
          }
          buffer = '';
          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
            while (url.path.length > 1 && url.path[0] === '') {
              url.path.shift();
            }
          }
          if (char == '?') {
            url.query = '';
            state = QUERY;
          } else if (char == '#') {
            url.fragment = '';
            state = FRAGMENT;
          }
        } else {
          buffer += percentEncode(char, pathPercentEncodeSet);
        } break;

      case CANNOT_BE_A_BASE_URL_PATH:
        if (char == '?') {
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
        } break;

      case QUERY:
        if (!stateOverride && char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          if (char == "'" && isSpecial(url)) url.query += '%27';
          else if (char == '#') url.query += '%23';
          else url.query += percentEncode(char, C0ControlPercentEncodeSet);
        } break;

      case FRAGMENT:
        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
        break;
    }

    pointer++;
  }
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance(this, URLConstructor, 'URL');
  var base = arguments.length > 1 ? arguments[1] : undefined;
  var urlString = String(url);
  var state = setInternalState(that, { type: 'URL' });
  var baseState, failure;
  if (base !== undefined) {
    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
    else {
      failure = parseURL(baseState = {}, String(base));
      if (failure) throw TypeError(failure);
    }
  }
  failure = parseURL(state, urlString, null, baseState);
  if (failure) throw TypeError(failure);
  var searchParams = state.searchParams = new URLSearchParams();
  var searchParamsState = getInternalSearchParamsState(searchParams);
  searchParamsState.updateSearchParams(state.query);
  searchParamsState.updateURL = function () {
    state.query = String(searchParams) || null;
  };
  if (!DESCRIPTORS) {
    that.href = serializeURL.call(that);
    that.origin = getOrigin.call(that);
    that.protocol = getProtocol.call(that);
    that.username = getUsername.call(that);
    that.password = getPassword.call(that);
    that.host = getHost.call(that);
    that.hostname = getHostname.call(that);
    that.port = getPort.call(that);
    that.pathname = getPathname.call(that);
    that.search = getSearch.call(that);
    that.searchParams = getSearchParams.call(that);
    that.hash = getHash.call(that);
  }
};

var URLPrototype = URLConstructor.prototype;

var serializeURL = function () {
  var url = getInternalURLState(this);
  var scheme = url.scheme;
  var username = url.username;
  var password = url.password;
  var host = url.host;
  var port = url.port;
  var path = url.path;
  var query = url.query;
  var fragment = url.fragment;
  var output = scheme + ':';
  if (host !== null) {
    output += '//';
    if (includesCredentials(url)) {
      output += username + (password ? ':' + password : '') + '@';
    }
    output += serializeHost(host);
    if (port !== null) output += ':' + port;
  } else if (scheme == 'file') output += '//';
  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
  if (query !== null) output += '?' + query;
  if (fragment !== null) output += '#' + fragment;
  return output;
};

var getOrigin = function () {
  var url = getInternalURLState(this);
  var scheme = url.scheme;
  var port = url.port;
  if (scheme == 'blob') try {
    return new URL(scheme.path[0]).origin;
  } catch (error) {
    return 'null';
  }
  if (scheme == 'file' || !isSpecial(url)) return 'null';
  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
};

var getProtocol = function () {
  return getInternalURLState(this).scheme + ':';
};

var getUsername = function () {
  return getInternalURLState(this).username;
};

var getPassword = function () {
  return getInternalURLState(this).password;
};

var getHost = function () {
  var url = getInternalURLState(this);
  var host = url.host;
  var port = url.port;
  return host === null ? ''
    : port === null ? serializeHost(host)
    : serializeHost(host) + ':' + port;
};

var getHostname = function () {
  var host = getInternalURLState(this).host;
  return host === null ? '' : serializeHost(host);
};

var getPort = function () {
  var port = getInternalURLState(this).port;
  return port === null ? '' : String(port);
};

var getPathname = function () {
  var url = getInternalURLState(this);
  var path = url.path;
  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
};

var getSearch = function () {
  var query = getInternalURLState(this).query;
  return query ? '?' + query : '';
};

var getSearchParams = function () {
  return getInternalURLState(this).searchParams;
};

var getHash = function () {
  var fragment = getInternalURLState(this).fragment;
  return fragment ? '#' + fragment : '';
};

var accessorDescriptor = function (getter, setter) {
  return { get: getter, set: setter, configurable: true, enumerable: true };
};

if (DESCRIPTORS) {
  defineProperties(URLPrototype, {
    // `URL.prototype.href` accessors pair
    // https://url.spec.whatwg.org/#dom-url-href
    href: accessorDescriptor(serializeURL, function (href) {
      var url = getInternalURLState(this);
      var urlString = String(href);
      var failure = parseURL(url, urlString);
      if (failure) throw TypeError(failure);
      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
    }),
    // `URL.prototype.origin` getter
    // https://url.spec.whatwg.org/#dom-url-origin
    origin: accessorDescriptor(getOrigin),
    // `URL.prototype.protocol` accessors pair
    // https://url.spec.whatwg.org/#dom-url-protocol
    protocol: accessorDescriptor(getProtocol, function (protocol) {
      var url = getInternalURLState(this);
      parseURL(url, String(protocol) + ':', SCHEME_START);
    }),
    // `URL.prototype.username` accessors pair
    // https://url.spec.whatwg.org/#dom-url-username
    username: accessorDescriptor(getUsername, function (username) {
      var url = getInternalURLState(this);
      var codePoints = arrayFrom(String(username));
      if (cannotHaveUsernamePasswordPort(url)) return;
      url.username = '';
      for (var i = 0; i < codePoints.length; i++) {
        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
      }
    }),
    // `URL.prototype.password` accessors pair
    // https://url.spec.whatwg.org/#dom-url-password
    password: accessorDescriptor(getPassword, function (password) {
      var url = getInternalURLState(this);
      var codePoints = arrayFrom(String(password));
      if (cannotHaveUsernamePasswordPort(url)) return;
      url.password = '';
      for (var i = 0; i < codePoints.length; i++) {
        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
      }
    }),
    // `URL.prototype.host` accessors pair
    // https://url.spec.whatwg.org/#dom-url-host
    host: accessorDescriptor(getHost, function (host) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      parseURL(url, String(host), HOST);
    }),
    // `URL.prototype.hostname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hostname
    hostname: accessorDescriptor(getHostname, function (hostname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      parseURL(url, String(hostname), HOSTNAME);
    }),
    // `URL.prototype.port` accessors pair
    // https://url.spec.whatwg.org/#dom-url-port
    port: accessorDescriptor(getPort, function (port) {
      var url = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(url)) return;
      port = String(port);
      if (port == '') url.port = null;
      else parseURL(url, port, PORT);
    }),
    // `URL.prototype.pathname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-pathname
    pathname: accessorDescriptor(getPathname, function (pathname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      url.path = [];
      parseURL(url, pathname + '', PATH_START);
    }),
    // `URL.prototype.search` accessors pair
    // https://url.spec.whatwg.org/#dom-url-search
    search: accessorDescriptor(getSearch, function (search) {
      var url = getInternalURLState(this);
      search = String(search);
      if (search == '') {
        url.query = null;
      } else {
        if ('?' == search.charAt(0)) search = search.slice(1);
        url.query = '';
        parseURL(url, search, QUERY);
      }
      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
    }),
    // `URL.prototype.searchParams` getter
    // https://url.spec.whatwg.org/#dom-url-searchparams
    searchParams: accessorDescriptor(getSearchParams),
    // `URL.prototype.hash` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hash
    hash: accessorDescriptor(getHash, function (hash) {
      var url = getInternalURLState(this);
      hash = String(hash);
      if (hash == '') {
        url.fragment = null;
        return;
      }
      if ('#' == hash.charAt(0)) hash = hash.slice(1);
      url.fragment = '';
      parseURL(url, hash, FRAGMENT);
    })
  });
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
redefine(URLPrototype, 'toJSON', function toJSON() {
  return serializeURL.call(this);
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
redefine(URLPrototype, 'toString', function toString() {
  return serializeURL.call(this);
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
    return nativeCreateObjectURL.apply(NativeURL, arguments);
  });
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
    return nativeRevokeObjectURL.apply(NativeURL, arguments);
  });
}

setToStringTag(URLConstructor, 'URL');

$({ global: true, forced: !USE_NATIVE_URL, sham: !DESCRIPTORS }, {
  URL: URLConstructor
});


/***/ }),

/***/ "./node_modules/core-js/modules/web.url.to-json.js":
/*!*********************************************************!*\
  !*** ./node_modules/core-js/modules/web.url.to-json.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var $ = __webpack_require__(/*! ../internals/export */ "./node_modules/core-js/internals/export.js");

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
$({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return URL.prototype.toString.call(this);
  }
});


/***/ }),

/***/ "./node_modules/error-stack-parser/error-stack-parser.js":
/*!***************************************************************!*\
  !*** ./node_modules/error-stack-parser/error-stack-parser.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(/*! stackframe */ "./node_modules/stackframe/stackframe.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return filtered.map(function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame({
                    functionName: functionName,
                    fileName: fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return filtered.map(function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame({
                        functionName: line
                    });
                } else {
                    var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                    var matches = line.match(functionNameRegex);
                    var functionName = matches && matches[1] ? matches[1] : undefined;
                    var locationParts = this.extractLocation(line.replace(functionNameRegex, ''));

                    return new StackFrame({
                        functionName: functionName,
                        fileName: locationParts[0],
                        lineNumber: locationParts[1],
                        columnNumber: locationParts[2],
                        source: line
                    });
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        fileName: match[2],
                        lineNumber: match[1],
                        source: lines[i]
                    }));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame({
                            functionName: match[3] || undefined,
                            fileName: match[2],
                            lineNumber: match[1],
                            source: lines[i]
                        })
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return filtered.map(function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');

                return new StackFrame({
                    functionName: functionName,
                    args: args,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        }
    };
}));


/***/ }),

/***/ "./node_modules/form-data/lib/browser.js":
/*!***********************************************!*\
  !*** ./node_modules/form-data/lib/browser.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* eslint-env browser */
module.exports = typeof self == 'object' ? self.FormData : window.FormData;


/***/ }),

/***/ "./node_modules/is-buffer/index.js":
/*!*****************************************!*\
  !*** ./node_modules/is-buffer/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

module.exports = function isBuffer (obj) {
  return obj != null && obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}


/***/ }),

/***/ "./node_modules/js-cookie/src/js.cookie.js":
/*!*************************************************!*\
  !*** ./node_modules/js-cookie/src/js.cookie.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		registeredInModuleLoader = true;
	}
	if (true) {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!this.json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));


/***/ }),

/***/ "./node_modules/platform/platform.js":
/*!*******************************************!*\
  !*** ./node_modules/platform/platform.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * Platform.js <https://mths.be/platform>
 * Copyright 2014-2018 Benjamin Tan <https://bnjmnt4n.now.sh/>
 * Copyright 2011-2013 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <https://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object. */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object. */
  var oldRoot = root;

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Regular expression to detect Opera. */
  var reOpera = /\bOpera/;

  /** Possible global object. */
  var thisBinding = this;

  /** Used for native method references. */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values. */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // Platform tokens are defined at:
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '10.0': '10',
      '6.4':  '10 Technical Preview',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // Detect Windows version from platform tokens.
    if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
        (data = data[/[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // Correct character case and cleanup string.
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object. */
    var context = root;

    /** Used to flag when a custom context is provided. */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // Juggle arguments.
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object. */
    var nav = context.navigator || {};

    /** Browser user agent string. */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope]. */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome. */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts. */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environments. */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino. */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha. */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta. */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object. */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based).
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]`. */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime. */
    var data;

    /** The CPU architecture. */
    var arch = ua;

    /** Platform description array. */
    var description = [];

    /** Platform alpha/beta indicator. */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform. */
    var useFeatures = ua == userAgent;

    /** The browser/environment version. */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important). */
    var layout = getLayout([
      { 'label': 'EdgeHTML', 'pattern': 'Edge' },
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important). */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Electron',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      { 'label': 'Microsoft Edge', 'pattern': 'Edge' },
      'Midori',
      'Nook Browser',
      'PaleMoon',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      { 'label': 'Samsung Internet', 'pattern': 'SamsungBrowser' },
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'Sunrise',
      'Swiftfox',
      'Waterfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'Firefox for iOS', 'pattern': 'FxiOS' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important). */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      { 'label': 'Galaxy S5', 'pattern': 'SM-G900' },
      { 'label': 'Galaxy S6', 'pattern': 'SM-G920' },
      { 'label': 'Galaxy S6 Edge', 'pattern': 'SM-G925' },
      { 'label': 'Galaxy S7', 'pattern': 'SM-G930' },
      { 'label': 'Galaxy S7 Edge', 'pattern': 'SM-G935' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nexus',
      'Nook',
      'PlayBook',
      'PlayStation Vita',
      'PlayStation',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers. */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Archos': {},
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1, 'Nexus': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable operating systems (order is important). */
    var os = getOS([
      'Windows Phone',
      'Android',
      'CentOS',
      { 'label': 'Chrome OS', 'pattern': 'CrOS' },
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'OpenBSD',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Tizen',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // Lookup the manufacturer by product or scan the UA for the manufacturer.
        return result || (
          value[product] ||
          value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // Split by forward slash and append product version if needed.
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // Correct character case and cleanup string.
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // Convert layout to an array so we can add extra details.
    layout && (layout = [layout]);

    // Detect product names that contain their manufacturer's name.
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // Clean up Google TV.
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // Detect simulators.
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // Detect IE Mobile 11.
    if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
      data = parse(ua.replace(/like iPhone OS/, ''));
      manufacturer = data.manufacturer;
      product = data.product;
    }
    // Detect iOS.
    else if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // Detect Kubuntu.
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // Detect Android browsers.
    else if ((manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
        (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // Detect Silk desktop/accelerated modes.
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // Detect PaleMoon identifying as Firefox.
    else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
      description.push('identifying as Firefox ' + data[1]);
    }
    // Detect Firefox OS and products running Firefox.
    else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
      os || (os = 'Firefox OS');
      product || (product = data[1]);
    }
    // Detect false positives for Firefox/Safari.
    else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // Escape the `/` for Firefox 1.
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // Clear name of false positives.
        name = null;
      }
      // Reassign a generic name.
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // Add Chrome version to description for Electron.
    else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
      description.push('Chromium ' + data);
    }
    // Detect non-Opera (Presto-based) versions (order is important).
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // Detect stubborn layout engines.
    if ((data =
          layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
          layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
        )) {
      layout = [data];
    }
    // Detect Windows Phone 7 desktop mode.
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // Detect Windows Phone 8.x desktop mode.
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8.x';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // Detect IE 11 identifying as other browsers.
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (name) {
        description.push('identifying as ' + name + (version ? ' ' + version : ''));
      }
      name = 'IE';
      version = data[1];
    }
    // Leverage environment features.
    if (useFeatures) {
      // Detect server-side environments.
      // Rhino has a global function while others have a global object.
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (rhino) {
          try {
            version = context.require('ringo/engine').version.join('.');
            name = 'RingoJS';
          } catch(e) {
            if ((data = context.system) && data.global.system == context.system) {
              name = 'Narwhal';
              os || (os = data[0].os || null);
            }
          }
          if (!name) {
            name = 'Rhino';
          }
        }
        else if (
          typeof context.process == 'object' && !context.process.browser &&
          (data = context.process)
        ) {
          if (typeof data.versions == 'object') {
            if (typeof data.versions.electron == 'string') {
              description.push('Node ' + data.versions.node);
              name = 'Electron';
              version = data.versions.electron;
            } else if (typeof data.versions.nw == 'string') {
              description.push('Chromium ' + version, 'Node ' + data.versions.node);
              name = 'NW.js';
              version = data.versions.nw;
            }
          }
          if (!name) {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version);
            version = version ? version[0] : null;
          }
        }
      }
      // Detect Adobe AIR.
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // Detect PhantomJS.
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // Detect IE compatibility modes.
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // We're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode.
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      // Detect IE 11 masking as other browsers.
      else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
        description.push('masking as ' + name + ' ' + version);
        name = 'IE';
        version = '11.0';
        layout = ['Trident'];
        os = 'Windows';
      }
      os = os && format(os);
    }
    // Detect prerelease phases.
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // Detect Firefox Mobile.
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // Obscure Maxthon's unreliable version.
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // Detect Xbox 360 and Xbox One.
    else if (/\bXbox\b/i.test(product)) {
      if (product == 'Xbox 360') {
        os = null;
      }
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // Add mobile postfix.
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // Detect IE platform preview.
    else if (name == 'IE' && useFeatures) {
      try {
        if (context.external === null) {
          description.unshift('platform preview');
        }
      } catch(e) {
        description.unshift('embedded');
      }
    }
    // Detect BlackBerry OS version.
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // Detect Opera identifying/masking itself as another browser.
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && product != 'Wii' && (
          (useFeatures && opera) ||
          (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
          (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
          (name == 'IE' && (
            (os && !/^Win/.test(os) && version > 5.5) ||
            /\bWindows XP\b/.test(os) && version > 8 ||
            version == 8 && !/\bTrident\b/.test(ua)
          ))
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
      // When "identifying", the UA contains both Opera and the other browser's name.
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // When "masking", the UA contains only the other browser's name.
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // Detect WebKit Nightly and approximate Chrome/Safari versions.
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // Correct build number for numeric comparison.
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // Nightly builds are postfixed with a "+".
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // Clear incorrect browser versions.
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // Use the full Chrome version when available.
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // Detect Blink layout engine.
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
        layout = ['Blink'];
      }
      // Detect JavaScriptCore.
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // Add the postfix of ".x" or "+" for approximate versions.
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // Obscure version for some Safari 1-2 releases.
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // Detect Opera desktop modes.
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // Detect Chrome desktop mode.
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // Strip incorrect OS versions.
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // Add layout engine.
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(name) && layout[1])) {
      // Don't add layout details to description if they are falsey.
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // Combine contextual information.
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // Append manufacturer to description.
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // Append product to description.
    if (product) {
      description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
    }
    // Parse the OS into an object.
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // Add browser/OS architecture.
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }
    // Chrome 39 and above on OS X is always 64-bit.
    else if (
        os && /^OS X/.test(os.family) &&
        name == 'Chrome' && parseFloat(version) >= 39
    ) {
      os.architecture = 64;
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * The list of common layout engines include:
     * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * The list of manufacturers include:
     * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
     * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
     * "Nokia", "Samsung" and "Sony"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * The list of common browser names include:
     * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
     * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
     * "Opera Mini" and "Opera"
     *
     * Mobile versions of some browsers have "Mobile" appended to their name:
     * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * The list of common products include:
     *
     * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
     * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // Export platform.
  var platform = parse();

  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (true) {
    // Expose platform on the global object to prevent errors when platform is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    root.platform = platform;

    // Define as an anonymous module so platform can be aliased through path mapping.
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return platform;
    }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else {}
}.call(this));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module), __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/stackframe/stackframe.js":
/*!***********************************************!*\
  !*** ./node_modules/stackframe/stackframe.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {}
}(this, function() {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }

    function _getter(p) {
        return function() {
            return this[p];
        };
    }

    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
    var numericProps = ['columnNumber', 'lineNumber'];
    var stringProps = ['fileName', 'functionName', 'source'];
    var arrayProps = ['args'];

    var props = booleanProps.concat(numericProps, stringProps, arrayProps);

    function StackFrame(obj) {
        if (obj instanceof Object) {
            for (var i = 0; i < props.length; i++) {
                if (obj.hasOwnProperty(props[i]) && obj[props[i]] !== undefined) {
                    this['set' + _capitalize(props[i])](obj[props[i]]);
                }
            }
        }
    }

    StackFrame.prototype = {
        getArgs: function() {
            return this.args;
        },
        setArgs: function(v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        getEvalOrigin: function() {
            return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
            if (v instanceof StackFrame) {
                this.evalOrigin = v;
            } else if (v instanceof Object) {
                this.evalOrigin = new StackFrame(v);
            } else {
                throw new TypeError('Eval Origin must be an Object or StackFrame');
            }
        },

        toString: function() {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function(p) {
            return function(v) {
                this[p] = Boolean(v);
            };
        })(booleanProps[i]);
    }

    for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function(p) {
            return function(v) {
                if (!_isNumber(v)) {
                    throw new TypeError(p + ' must be a Number');
                }
                this[p] = Number(v);
            };
        })(numericProps[j]);
    }

    for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function(p) {
            return function(v) {
                this[p] = String(v);
            };
        })(stringProps[k]);
    }

    return StackFrame;
}));


/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./package.json":
/*!**********************!*\
  !*** ./package.json ***!
  \**********************/
/*! exports provided: name, version, description, main, scripts, author, license, devDependencies, dependencies, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"name\":\"cvat.js\",\"version\":\"0.1.0\",\"description\":\"Part of Computer Vision Tool which presents an interface for client-side integration\",\"main\":\"babel.config.js\",\"scripts\":{\"build\":\"webpack\",\"test\":\"jest --config=jest.config.js --coverage\",\"docs\":\"jsdoc --readme README.md src/*.js -p -c jsdoc.config.js -d docs\",\"coveralls\":\"cat ./reports/coverage/lcov.info | coveralls\"},\"author\":\"Intel\",\"license\":\"MIT\",\"devDependencies\":{\"@babel/cli\":\"^7.4.4\",\"@babel/core\":\"^7.4.4\",\"@babel/preset-env\":\"^7.4.4\",\"babel-eslint\":\"^10.0.1\",\"babel-loader\":\"^8.0.6\",\"core-js\":\"^3.0.1\",\"coveralls\":\"^3.0.5\",\"eslint\":\"^6.1.0\",\"jest\":\"^24.8.0\",\"jest-junit\":\"^6.4.0\",\"jsdoc\":\"^3.6.2\",\"webpack\":\"^4.31.0\",\"webpack-cli\":\"^3.3.2\"},\"dependencies\":{\"axios\":\"^0.18.0\",\"error-stack-parser\":\"^2.0.2\",\"form-data\":\"^2.5.0\",\"jest-config\":\"^24.8.0\",\"js-cookie\":\"^2.2.0\",\"platform\":\"^1.3.5\"}}");

/***/ }),

/***/ "./src/annotations-collection.js":
/*!***************************************!*\
  !*** ./src/annotations-collection.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.array.sort */ "./node_modules/core-js/modules/es.array.sort.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

__webpack_require__(/*! core-js/modules/web.url.to-json */ "./node_modules/core-js/modules/web.url.to-json.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const {
    RectangleShape,
    PolygonShape,
    PolylineShape,
    PointsShape,
    RectangleTrack,
    PolygonTrack,
    PolylineTrack,
    PointsTrack,
    Track,
    Shape,
    Tag,
    objectStateFactory
  } = __webpack_require__(/*! ./annotations-objects */ "./src/annotations-objects.js");

  const {
    checkObjectType
  } = __webpack_require__(/*! ./common */ "./src/common.js");

  const Statistics = __webpack_require__(/*! ./statistics */ "./src/statistics.js");

  const {
    Label
  } = __webpack_require__(/*! ./labels */ "./src/labels.js");

  const {
    DataError,
    ArgumentError,
    ScriptingError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");

  const {
    ObjectShape,
    ObjectType
  } = __webpack_require__(/*! ./enums */ "./src/enums.js");

  const ObjectState = __webpack_require__(/*! ./object-state */ "./src/object-state.js");

  const colors = ['#0066FF', '#AF593E', '#01A368', '#FF861F', '#ED0A3F', '#FF3F34', '#76D7EA', '#8359A3', '#FBE870', '#C5E17A', '#03BB85', '#FFDF00', '#8B8680', '#0A6B0D', '#8FD8D8', '#A36F40', '#F653A6', '#CA3435', '#FFCBA4', '#FF99CC', '#FA9D5A', '#FFAE42', '#A78B00', '#788193', '#514E49', '#1164B4', '#F4FA9F', '#FED8B1', '#C32148', '#01796F', '#E90067', '#FF91A4', '#404E5A', '#6CDAE7', '#FFC1CC', '#006A93', '#867200', '#E2B631', '#6EEB6E', '#FFC800', '#CC99BA', '#FF007C', '#BC6CAC', '#DCCCD7', '#EBE1C2', '#A6AAAE', '#B99685', '#0086A7', '#5E4330', '#C8A2C8', '#708EB3', '#BC8777', '#B2592D', '#497E48', '#6A2963', '#E6335F', '#00755E', '#B5A895', '#0048ba', '#EED9C4', '#C88A65', '#FF6E4A', '#87421F', '#B2BEB5', '#926F5B', '#00B9FB', '#6456B7', '#DB5079', '#C62D42', '#FA9C44', '#DA8A67', '#FD7C6E', '#93CCEA', '#FCF686', '#503E32', '#FF5470', '#9DE093', '#FF7A00', '#4F69C6', '#A50B5E', '#F0E68C', '#FDFF00', '#F091A9', '#FFFF66', '#6F9940', '#FC74FD', '#652DC1', '#D6AEDD', '#EE34D2', '#BB3385', '#6B3FA0', '#33CC99', '#FFDB00', '#87FF2A', '#6EEB6E', '#FFC800', '#CC99BA', '#7A89B8', '#006A93', '#867200', '#E2B631', '#D9D6CF'];

  function shapeFactory(shapeData, clientID, injection) {
    const {
      type
    } = shapeData;
    const color = colors[clientID % colors.length];
    let shapeModel = null;

    switch (type) {
      case 'rectangle':
        shapeModel = new RectangleShape(shapeData, clientID, color, injection);
        break;

      case 'polygon':
        shapeModel = new PolygonShape(shapeData, clientID, color, injection);
        break;

      case 'polyline':
        shapeModel = new PolylineShape(shapeData, clientID, color, injection);
        break;

      case 'points':
        shapeModel = new PointsShape(shapeData, clientID, color, injection);
        break;

      default:
        throw new DataError(`An unexpected type of shape "${type}"`);
    }

    return shapeModel;
  }

  function trackFactory(trackData, clientID, injection) {
    if (trackData.shapes.length) {
      const {
        type
      } = trackData.shapes[0];
      const color = colors[clientID % colors.length];
      let trackModel = null;

      switch (type) {
        case 'rectangle':
          trackModel = new RectangleTrack(trackData, clientID, color, injection);
          break;

        case 'polygon':
          trackModel = new PolygonTrack(trackData, clientID, color, injection);
          break;

        case 'polyline':
          trackModel = new PolylineTrack(trackData, clientID, color, injection);
          break;

        case 'points':
          trackModel = new PointsTrack(trackData, clientID, color, injection);
          break;

        default:
          throw new DataError(`An unexpected type of track "${type}"`);
      }

      return trackModel;
    }

    console.warn('The track without any shapes had been found. It was ignored.');
    return null;
  }

  class Collection {
    constructor(data) {
      this.startFrame = data.startFrame;
      this.stopFrame = data.stopFrame;
      this.frameMeta = data.frameMeta;
      this.labels = data.labels.reduce((labelAccumulator, label) => {
        labelAccumulator[label.id] = label;
        return labelAccumulator;
      }, {});
      this.shapes = {}; // key is a frame

      this.tags = {}; // key is a frame

      this.tracks = [];
      this.objects = {}; // key is a client id

      this.count = 0;
      this.flush = false;
      this.collectionZ = {}; // key is a frame, {max, min} are values

      this.groups = {
        max: 0
      }; // it is an object to we can pass it as an argument by a reference

      this.injection = {
        labels: this.labels,
        collectionZ: this.collectionZ,
        groups: this.groups,
        frameMeta: this.frameMeta
      };
    }

    import(data) {
      for (const tag of data.tags) {
        const clientID = ++this.count;
        const tagModel = new Tag(tag, clientID, this.injection);
        this.tags[tagModel.frame] = this.tags[tagModel.frame] || [];
        this.tags[tagModel.frame].push(tagModel);
        this.objects[clientID] = tagModel;
      }

      for (const shape of data.shapes) {
        const clientID = ++this.count;
        const shapeModel = shapeFactory(shape, clientID, this.injection);
        this.shapes[shapeModel.frame] = this.shapes[shapeModel.frame] || [];
        this.shapes[shapeModel.frame].push(shapeModel);
        this.objects[clientID] = shapeModel;
      }

      for (const track of data.tracks) {
        const clientID = ++this.count;
        const trackModel = trackFactory(track, clientID, this.injection); // The function can return null if track doesn't have any shapes.
        // In this case a corresponded message will be sent to the console

        if (trackModel) {
          this.tracks.push(trackModel);
          this.objects[clientID] = trackModel;
        }
      }

      return this;
    }

    export() {
      const data = {
        tracks: this.tracks.filter(track => !track.removed).map(track => track.toJSON()),
        shapes: Object.values(this.shapes).reduce((accumulator, value) => {
          accumulator.push(...value);
          return accumulator;
        }, []).filter(shape => !shape.removed).map(shape => shape.toJSON()),
        tags: Object.values(this.tags).reduce((accumulator, value) => {
          accumulator.push(...value);
          return accumulator;
        }, []).filter(tag => !tag.removed).map(tag => tag.toJSON())
      };
      return data;
    }

    get(frame) {
      const {
        tracks
      } = this;
      const shapes = this.shapes[frame] || [];
      const tags = this.tags[frame] || [];
      const objects = tracks.concat(shapes).concat(tags).filter(object => !object.removed); // filtering here

      const objectStates = [];

      for (const object of objects) {
        const stateData = object.get(frame);

        if (stateData.outside && !stateData.keyframe) {
          continue;
        }

        const objectState = objectStateFactory.call(object, frame, stateData);
        objectStates.push(objectState);
      }

      return objectStates;
    }

    merge(objectStates) {
      checkObjectType('shapes for merge', objectStates, null, Array);
      if (!objectStates.length) return;
      const objectsForMerge = objectStates.map(state => {
        checkObjectType('object state', state, null, ObjectState);
        const object = this.objects[state.clientID];

        if (typeof object === 'undefined') {
          throw new ArgumentError('The object has not been saved yet. Call ObjectState.put([state]) before you can merge it');
        }

        return object;
      });
      const keyframes = {}; // frame: position

      const {
        label,
        shapeType
      } = objectStates[0];

      if (!(label.id in this.labels)) {
        throw new ArgumentError(`Unknown label for the task: ${label.id}`);
      }

      if (!Object.values(ObjectShape).includes(shapeType)) {
        throw new ArgumentError(`Got unknown shapeType "${shapeType}"`);
      }

      const labelAttributes = label.attributes.reduce((accumulator, attribute) => {
        accumulator[attribute.id] = attribute;
        return accumulator;
      }, {});

      for (let i = 0; i < objectsForMerge.length; i++) {
        // For each state get corresponding object
        const object = objectsForMerge[i];
        const state = objectStates[i];

        if (state.label.id !== label.id) {
          throw new ArgumentError(`All shape labels are expected to be ${label.name}, but got ${state.label.name}`);
        }

        if (state.shapeType !== shapeType) {
          throw new ArgumentError(`All shapes are expected to be ${shapeType}, but got ${state.shapeType}`);
        } // If this object is shape, get it position and save as a keyframe


        if (object instanceof Shape) {
          // Frame already saved and it is not outside
          if (object.frame in keyframes && !keyframes[object.frame].outside) {
            throw new ArgumentError('Expected only one visible shape per frame');
          }

          keyframes[object.frame] = {
            type: shapeType,
            frame: object.frame,
            points: [...object.points],
            occluded: object.occluded,
            zOrder: object.zOrder,
            outside: false,
            attributes: Object.keys(object.attributes).reduce((accumulator, attrID) => {
              // We save only mutable attributes inside a keyframe
              if (attrID in labelAttributes && labelAttributes[attrID].mutable) {
                accumulator.push({
                  spec_id: +attrID,
                  value: object.attributes[attrID]
                });
              }

              return accumulator;
            }, [])
          }; // Push outside shape after each annotation shape
          // Any not outside shape rewrites it

          if (!(object.frame + 1 in keyframes)) {
            keyframes[object.frame + 1] = JSON.parse(JSON.stringify(keyframes[object.frame]));
            keyframes[object.frame + 1].outside = true;
            keyframes[object.frame + 1].frame++;
          }
        } else if (object instanceof Track) {
          // If this object is track, iterate through all its
          // keyframes and push copies to new keyframes
          const attributes = {}; // id:value

          for (const keyframe of Object.keys(object.shapes)) {
            const shape = object.shapes[keyframe]; // Frame already saved and it is not outside

            if (keyframe in keyframes && !keyframes[keyframe].outside) {
              // This shape is outside and non-outside shape already exists
              if (shape.outside) {
                continue;
              }

              throw new ArgumentError('Expected only one visible shape per frame');
            } // We do not save an attribute if it has the same value
            // We save only updates


            let updatedAttributes = false;

            for (const attrID in shape.attributes) {
              if (!(attrID in attributes) || attributes[attrID] !== shape.attributes[attrID]) {
                updatedAttributes = true;
                attributes[attrID] = shape.attributes[attrID];
              }
            }

            keyframes[keyframe] = {
              type: shapeType,
              frame: +keyframe,
              points: [...shape.points],
              occluded: shape.occluded,
              outside: shape.outside,
              zOrder: shape.zOrder,
              attributes: updatedAttributes ? Object.keys(attributes).reduce((accumulator, attrID) => {
                accumulator.push({
                  spec_id: +attrID,
                  value: attributes[attrID]
                });
                return accumulator;
              }, []) : []
            };
          }
        } else {
          throw new ArgumentError(`Trying to merge unknown object type: ${object.constructor.name}. ` + 'Only shapes and tracks are expected.');
        }
      }

      let firstNonOutside = false;

      for (const frame of Object.keys(keyframes).sort((a, b) => +a - +b)) {
        // Remove all outside frames at the begin
        firstNonOutside = firstNonOutside || keyframes[frame].outside;

        if (!firstNonOutside && keyframes[frame].outside) {
          delete keyframes[frame];
        } else {
          break;
        }
      }

      const clientID = ++this.count;
      const track = {
        frame: Math.min.apply(null, Object.keys(keyframes).map(frame => +frame)),
        shapes: Object.values(keyframes),
        group: 0,
        label_id: label.id,
        attributes: Object.keys(objectStates[0].attributes).reduce((accumulator, attrID) => {
          if (!labelAttributes[attrID].mutable) {
            accumulator.push({
              spec_id: +attrID,
              value: objectStates[0].attributes[attrID]
            });
          }

          return accumulator;
        }, [])
      };
      const trackModel = trackFactory(track, clientID, this.injection);
      this.tracks.push(trackModel);
      this.objects[clientID] = trackModel; // Remove other shapes

      for (const object of objectsForMerge) {
        object.removed = true;

        if (typeof object.resetCache === 'function') {
          object.resetCache();
        }
      }
    }

    split(objectState, frame) {
      checkObjectType('object state', objectState, null, ObjectState);
      checkObjectType('frame', frame, 'integer', null);
      const object = this.objects[objectState.clientID];

      if (typeof object === 'undefined') {
        throw new ArgumentError('The object has not been saved yet. Call annotations.put([state]) before');
      }

      if (objectState.objectType !== ObjectType.TRACK) {
        return;
      }

      const keyframes = Object.keys(object.shapes).sort((a, b) => +a - +b);

      if (frame <= +keyframes[0] || frame > keyframes[keyframes.length - 1]) {
        return;
      }

      const labelAttributes = object.label.attributes.reduce((accumulator, attribute) => {
        accumulator[attribute.id] = attribute;
        return accumulator;
      }, {});
      const exported = object.toJSON();
      const position = {
        type: objectState.shapeType,
        points: [...objectState.points],
        occluded: objectState.occluded,
        outside: objectState.outside,
        zOrder: 0,
        attributes: Object.keys(objectState.attributes).reduce((accumulator, attrID) => {
          if (!labelAttributes[attrID].mutable) {
            accumulator.push({
              spec_id: +attrID,
              value: objectState.attributes[attrID]
            });
          }

          return accumulator;
        }, []),
        frame
      };
      const prev = {
        frame: exported.frame,
        group: 0,
        label_id: exported.label_id,
        attributes: exported.attributes,
        shapes: []
      };
      const next = JSON.parse(JSON.stringify(prev));
      next.frame = frame;
      next.shapes.push(JSON.parse(JSON.stringify(position)));
      exported.shapes.map(shape => {
        delete shape.id;

        if (shape.frame < frame) {
          prev.shapes.push(JSON.parse(JSON.stringify(shape)));
        } else if (shape.frame > frame) {
          next.shapes.push(JSON.parse(JSON.stringify(shape)));
        }

        return shape;
      });
      prev.shapes.push(position);
      prev.shapes[prev.shapes.length - 1].outside = true;
      let clientID = ++this.count;
      const prevTrack = trackFactory(prev, clientID, this.injection);
      this.tracks.push(prevTrack);
      this.objects[clientID] = prevTrack;
      clientID = ++this.count;
      const nextTrack = trackFactory(next, clientID, this.injection);
      this.tracks.push(nextTrack);
      this.objects[clientID] = nextTrack; // Remove source object

      object.removed = true;
      object.resetCache();
    }

    group(objectStates, reset) {
      checkObjectType('shapes for group', objectStates, null, Array);
      const objectsForGroup = objectStates.map(state => {
        checkObjectType('object state', state, null, ObjectState);
        const object = this.objects[state.clientID];

        if (typeof object === 'undefined') {
          throw new ArgumentError('The object has not been saved yet. Call annotations.put([state]) before');
        }

        return object;
      });
      const groupIdx = reset ? 0 : ++this.groups.max;

      for (const object of objectsForGroup) {
        object.group = groupIdx;

        if (typeof object.resetCache === 'function') {
          object.resetCache();
        }
      }

      return groupIdx;
    }

    clear() {
      this.shapes = {};
      this.tags = {};
      this.tracks = [];
      this.objects = {}; // by id

      this.count = 0;
      this.flush = true;
    }

    statistics() {
      const labels = {};
      const skeleton = {
        rectangle: {
          shape: 0,
          track: 0
        },
        polygon: {
          shape: 0,
          track: 0
        },
        polyline: {
          shape: 0,
          track: 0
        },
        points: {
          shape: 0,
          track: 0
        },
        tags: 0,
        manually: 0,
        interpolated: 0,
        total: 0
      };
      const total = JSON.parse(JSON.stringify(skeleton));

      for (const label of Object.values(this.labels)) {
        const {
          name
        } = label;
        labels[name] = JSON.parse(JSON.stringify(skeleton));
      }

      for (const object of Object.values(this.objects)) {
        let objectType = null;

        if (object instanceof Shape) {
          objectType = 'shape';
        } else if (object instanceof Track) {
          objectType = 'track';
        } else if (object instanceof Tag) {
          objectType = 'tag';
        } else {
          throw new ScriptingError(`Unexpected object type: "${objectType}"`);
        }

        const label = object.label.name;

        if (objectType === 'tag') {
          labels[label].tags++;
          labels[label].manually++;
          labels[label].total++;
        } else {
          const {
            shapeType
          } = object;
          labels[label][shapeType][objectType]++;

          if (objectType === 'track') {
            const keyframes = Object.keys(object.shapes).sort((a, b) => +a - +b).map(el => +el);
            let prevKeyframe = keyframes[0];
            let visible = false;

            for (const keyframe of keyframes) {
              if (visible) {
                const interpolated = keyframe - prevKeyframe - 1;
                labels[label].interpolated += interpolated;
                labels[label].total += interpolated;
              }

              visible = !object.shapes[keyframe].outside;
              prevKeyframe = keyframe;

              if (visible) {
                labels[label].manually++;
                labels[label].total++;
              }
            }

            const lastKey = keyframes[keyframes.length - 1];

            if (lastKey !== this.stopFrame && !object.shapes[lastKey].outside) {
              const interpolated = this.stopFrame - lastKey;
              labels[label].interpolated += interpolated;
              labels[label].total += interpolated;
            }
          } else {
            labels[label].manually++;
            labels[label].total++;
          }
        }
      }

      for (const label of Object.keys(labels)) {
        for (const key of Object.keys(labels[label])) {
          if (typeof labels[label][key] === 'object') {
            for (const objectType of Object.keys(labels[label][key])) {
              total[key][objectType] += labels[label][key][objectType];
            }
          } else {
            total[key] += labels[label][key];
          }
        }
      }

      return new Statistics(labels, total);
    }

    put(objectStates) {
      checkObjectType('shapes for put', objectStates, null, Array);
      const constructed = {
        shapes: [],
        tracks: [],
        tags: []
      };

      function convertAttributes(accumulator, attrID) {
        const specID = +attrID;
        const value = this.attributes[attrID];
        checkObjectType('attribute id', specID, 'integer', null);
        checkObjectType('attribute value', value, 'string', null);
        accumulator.push({
          spec_id: specID,
          value
        });
        return accumulator;
      }

      for (const state of objectStates) {
        checkObjectType('object state', state, null, ObjectState);
        checkObjectType('state client ID', state.clientID, 'undefined', null);
        checkObjectType('state frame', state.frame, 'integer', null);
        checkObjectType('state attributes', state.attributes, null, Object);
        checkObjectType('state label', state.label, null, Label);
        const attributes = Object.keys(state.attributes).reduce(convertAttributes.bind(state), []);
        const labelAttributes = state.label.attributes.reduce((accumulator, attribute) => {
          accumulator[attribute.id] = attribute;
          return accumulator;
        }, {}); // Construct whole objects from states

        if (state.objectType === 'tag') {
          constructed.tags.push({
            attributes,
            frame: state.frame,
            label_id: state.label.id,
            group: 0
          });
        } else {
          checkObjectType('state occluded', state.occluded, 'boolean', null);
          checkObjectType('state points', state.points, null, Array);

          for (const coord of state.points) {
            checkObjectType('point coordinate', coord, 'number', null);
          }

          if (!Object.values(ObjectShape).includes(state.shapeType)) {
            throw new ArgumentError('Object shape must be one of: ' + `${JSON.stringify(Object.values(ObjectShape))}`);
          }

          if (state.objectType === 'shape') {
            constructed.shapes.push({
              attributes,
              frame: state.frame,
              group: 0,
              label_id: state.label.id,
              occluded: state.occluded || false,
              points: [...state.points],
              type: state.shapeType,
              z_order: 0
            });
          } else if (state.objectType === 'track') {
            constructed.tracks.push({
              attributes: attributes.filter(attr => !labelAttributes[attr.spec_id].mutable),
              frame: state.frame,
              group: 0,
              label_id: state.label.id,
              shapes: [{
                attributes: attributes.filter(attr => labelAttributes[attr.spec_id].mutable),
                frame: state.frame,
                occluded: state.occluded || false,
                outside: false,
                points: [...state.points],
                type: state.shapeType,
                z_order: 0
              }]
            });
          } else {
            throw new ArgumentError('Object type must be one of: ' + `${JSON.stringify(Object.values(ObjectType))}`);
          }
        }
      } // Add constructed objects to a collection


      this.import(constructed);
    }

    select(objectStates, x, y) {
      checkObjectType('shapes for select', objectStates, null, Array);
      checkObjectType('x coordinate', x, 'number', null);
      checkObjectType('y coordinate', y, 'number', null);
      let minimumDistance = null;
      let minimumState = null;

      for (const state of objectStates) {
        checkObjectType('object state', state, null, ObjectState);
        if (state.outside) continue;
        const object = this.objects[state.clientID];

        if (typeof object === 'undefined') {
          throw new ArgumentError('The object has not been saved yet. Call annotations.put([state]) before');
        }

        const distance = object.constructor.distance(state.points, x, y);

        if (distance !== null && (minimumDistance === null || distance < minimumDistance)) {
          minimumDistance = distance;
          minimumState = state;
        }
      }

      return {
        state: minimumState,
        distance: minimumDistance
      };
    }

  }

  module.exports = Collection;
})();

/***/ }),

/***/ "./src/annotations-objects.js":
/*!************************************!*\
  !*** ./src/annotations-objects.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.array.sort */ "./node_modules/core-js/modules/es.array.sort.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const ObjectState = __webpack_require__(/*! ./object-state */ "./src/object-state.js");

  const {
    checkObjectType
  } = __webpack_require__(/*! ./common */ "./src/common.js");

  const {
    ObjectShape,
    ObjectType,
    AttributeType
  } = __webpack_require__(/*! ./enums */ "./src/enums.js");

  const {
    DataError,
    ArgumentError,
    ScriptingError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");

  const {
    Label
  } = __webpack_require__(/*! ./labels */ "./src/labels.js"); // Called with the Annotation context


  function objectStateFactory(frame, data) {
    const objectState = new ObjectState(data);
    objectState.hidden = {
      save: this.save.bind(this, frame, objectState),
      delete: this.delete.bind(this),
      up: this.up.bind(this, frame, objectState),
      down: this.down.bind(this, frame, objectState)
    };
    return objectState;
  }

  function checkNumberOfPoints(shapeType, points) {
    if (shapeType === ObjectShape.RECTANGLE) {
      if (points.length / 2 !== 2) {
        throw new DataError(`Rectangle must have 2 points, but got ${points.length / 2}`);
      }
    } else if (shapeType === ObjectShape.POLYGON) {
      if (points.length / 2 < 3) {
        throw new DataError(`Polygon must have at least 3 points, but got ${points.length / 2}`);
      }
    } else if (shapeType === ObjectShape.POLYLINE) {
      if (points.length / 2 < 2) {
        throw new DataError(`Polyline must have at least 2 points, but got ${points.length / 2}`);
      }
    } else if (shapeType === ObjectShape.POINTS) {
      if (points.length / 2 < 1) {
        throw new DataError(`Points must have at least 1 points, but got ${points.length / 2}`);
      }
    } else {
      throw new ArgumentError(`Unknown value of shapeType has been recieved ${shapeType}`);
    }
  }

  function checkShapeArea(shapeType, points) {
    const MIN_SHAPE_LENGTH = 3;
    const MIN_SHAPE_AREA = 9;

    if (shapeType === ObjectShape.POINTS) {
      return true;
    }

    let xmin = Number.MAX_SAFE_INTEGER;
    let xmax = Number.MIN_SAFE_INTEGER;
    let ymin = Number.MAX_SAFE_INTEGER;
    let ymax = Number.MIN_SAFE_INTEGER;

    for (let i = 0; i < points.length - 1; i += 2) {
      xmin = Math.min(xmin, points[i]);
      xmax = Math.max(xmax, points[i]);
      ymin = Math.min(ymin, points[i + 1]);
      ymax = Math.max(ymax, points[i + 1]);
    }

    if (shapeType === ObjectShape.POLYLINE) {
      const length = Math.max(xmax - xmin, ymax - ymin);
      return length >= MIN_SHAPE_LENGTH;
    }

    const area = (xmax - xmin) * (ymax - ymin);
    return area >= MIN_SHAPE_AREA;
  }

  function validateAttributeValue(value, attr) {
    const {
      values
    } = attr;
    const type = attr.inputType;

    if (typeof value !== 'string') {
      throw new ArgumentError(`Attribute value is expected to be string, but got ${typeof value}`);
    }

    if (type === AttributeType.NUMBER) {
      return +value >= +values[0] && +value <= +values[1] && !((+value - +values[0]) % +values[2]);
    }

    if (type === AttributeType.CHECKBOX) {
      return ['true', 'false'].includes(value.toLowerCase());
    }

    return values.includes(value);
  }

  class Annotation {
    constructor(data, clientID, injection) {
      this.taskLabels = injection.labels;
      this.clientID = clientID;
      this.serverID = data.id;
      this.group = data.group;
      this.label = this.taskLabels[data.label_id];
      this.frame = data.frame;
      this.removed = false;
      this.lock = false;
      this.attributes = data.attributes.reduce((attributeAccumulator, attr) => {
        attributeAccumulator[attr.spec_id] = attr.value;
        return attributeAccumulator;
      }, {});
      this.appendDefaultAttributes(this.label);
      injection.groups.max = Math.max(injection.groups.max, this.group);
    }

    appendDefaultAttributes(label) {
      const labelAttributes = label.attributes;

      for (const attribute of labelAttributes) {
        if (!(attribute.id in this.attributes)) {
          this.attributes[attribute.id] = attribute.defaultValue;
        }
      }
    }

    delete(force) {
      if (!this.lock || force) {
        this.removed = true;
      }

      return true;
    }

  }

  class Drawn extends Annotation {
    constructor(data, clientID, color, injection) {
      super(data, clientID, injection);
      this.frameMeta = injection.frameMeta;
      this.collectionZ = injection.collectionZ;
      this.color = color;
      this.shapeType = null;
    }

    _getZ(frame) {
      this.collectionZ[frame] = this.collectionZ[frame] || {
        max: 0,
        min: 0
      };
      return this.collectionZ[frame];
    }

    save() {
      throw new ScriptingError('Is not implemented');
    }

    get() {
      throw new ScriptingError('Is not implemented');
    }

    toJSON() {
      throw new ScriptingError('Is not implemented');
    } // Increase ZOrder within frame


    up(frame, objectState) {
      const z = this._getZ(frame);

      z.max++;
      objectState.zOrder = z.max;
    } // Decrease ZOrder within frame


    down(frame, objectState) {
      const z = this._getZ(frame);

      z.min--;
      objectState.zOrder = z.min;
    }

  }

  class Shape extends Drawn {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.points = data.points;
      this.occluded = data.occluded;
      this.zOrder = data.z_order;

      const z = this._getZ(this.frame);

      z.max = Math.max(z.max, this.zOrder || 0);
      z.min = Math.min(z.min, this.zOrder || 0);
    } // Method is used to export data to the server


    toJSON() {
      return {
        type: this.shapeType,
        clientID: this.clientID,
        occluded: this.occluded,
        z_order: this.zOrder,
        points: [...this.points],
        attributes: Object.keys(this.attributes).reduce((attributeAccumulator, attrId) => {
          attributeAccumulator.push({
            spec_id: attrId,
            value: this.attributes[attrId]
          });
          return attributeAccumulator;
        }, []),
        id: this.serverID,
        frame: this.frame,
        label_id: this.label.id,
        group: this.group
      };
    } // Method is used to construct ObjectState objects


    get(frame) {
      if (frame !== this.frame) {
        throw new ScriptingError('Got frame is not equal to the frame of the shape');
      }

      return {
        objectType: ObjectType.SHAPE,
        shapeType: this.shapeType,
        clientID: this.clientID,
        serverID: this.serverID,
        occluded: this.occluded,
        lock: this.lock,
        zOrder: this.zOrder,
        points: [...this.points],
        attributes: Object.assign({}, this.attributes),
        label: this.label,
        group: this.group,
        color: this.color
      };
    }

    save(frame, data) {
      if (frame !== this.frame) {
        throw new ScriptingError('Got frame is not equal to the frame of the shape');
      }

      if (this.lock && data.lock) {
        return objectStateFactory.call(this, frame, this.get(frame));
      } // All changes are done in this temporary object


      const copy = this.get(frame);
      const updated = data.updateFlags;

      if (updated.label) {
        checkObjectType('label', data.label, null, Label);
        copy.label = data.label;
        copy.attributes = {};
        this.appendDefaultAttributes.call(copy, copy.label);
      }

      if (updated.attributes) {
        const labelAttributes = copy.label.attributes.reduce((accumulator, value) => {
          accumulator[value.id] = value;
          return accumulator;
        }, {});

        for (const attrID of Object.keys(data.attributes)) {
          const value = data.attributes[attrID];

          if (attrID in labelAttributes && validateAttributeValue(value, labelAttributes[attrID])) {
            copy.attributes[attrID] = value;
          } else {
            throw new ArgumentError(`Trying to save unknown attribute with id ${attrID} and value ${value}`);
          }
        }
      }

      if (updated.points) {
        checkObjectType('points', data.points, null, Array);
        checkNumberOfPoints(this.shapeType, data.points); // cut points

        const {
          width,
          height
        } = this.frameMeta[frame];
        const cutPoints = [];

        for (let i = 0; i < data.points.length - 1; i += 2) {
          const x = data.points[i];
          const y = data.points[i + 1];
          checkObjectType('coordinate', x, 'number', null);
          checkObjectType('coordinate', y, 'number', null);
          cutPoints.push(Math.clamp(x, 0, width), Math.clamp(y, 0, height));
        }

        if (checkShapeArea(this.shapeType, cutPoints)) {
          copy.points = cutPoints;
        }
      }

      if (updated.occluded) {
        checkObjectType('occluded', data.occluded, 'boolean', null);
        copy.occluded = data.occluded;
      }

      if (updated.group) {
        checkObjectType('group', data.group, 'integer', null);
        copy.group = data.group;
      }

      if (updated.zOrder) {
        checkObjectType('zOrder', data.zOrder, 'integer', null);
        copy.zOrder = data.zOrder;
      }

      if (updated.lock) {
        checkObjectType('lock', data.lock, 'boolean', null);
        copy.lock = data.lock;
      }

      if (updated.color) {
        checkObjectType('color', data.color, 'string', null);

        if (/^#[0-9A-F]{6}$/i.test(data.color)) {
          throw new ArgumentError(`Got invalid color value: "${data.color}"`);
        }

        copy.color = data.color;
      } // Reset flags and commit all changes


      updated.reset();

      for (const prop of Object.keys(copy)) {
        if (prop in this) {
          this[prop] = copy[prop];
        }
      }

      return objectStateFactory.call(this, frame, this.get(frame));
    }

  }

  class Track extends Drawn {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.shapes = data.shapes.reduce((shapeAccumulator, value) => {
        shapeAccumulator[value.frame] = {
          serverID: value.id,
          occluded: value.occluded,
          zOrder: value.z_order,
          points: value.points,
          outside: value.outside,
          attributes: value.attributes.reduce((attributeAccumulator, attr) => {
            attributeAccumulator[attr.spec_id] = attr.value;
            return attributeAccumulator;
          }, {})
        };

        const z = this._getZ(value.frame);

        z.max = Math.max(z.max, value.z_order);
        z.min = Math.min(z.min, value.z_order);
        return shapeAccumulator;
      }, {});
      this.cache = {};
    } // Method is used to export data to the server


    toJSON() {
      const labelAttributes = this.label.attributes.reduce((accumulator, attribute) => {
        accumulator[attribute.id] = attribute;
        return accumulator;
      }, {});
      return {
        clientID: this.clientID,
        id: this.serverID,
        frame: this.frame,
        label_id: this.label.id,
        group: this.group,
        attributes: Object.keys(this.attributes).reduce((attributeAccumulator, attrId) => {
          if (!labelAttributes[attrId].mutable) {
            attributeAccumulator.push({
              spec_id: attrId,
              value: this.attributes[attrId]
            });
          }

          return attributeAccumulator;
        }, []),
        shapes: Object.keys(this.shapes).reduce((shapesAccumulator, frame) => {
          shapesAccumulator.push({
            type: this.shapeType,
            occluded: this.shapes[frame].occluded,
            z_order: this.shapes[frame].zOrder,
            points: [...this.shapes[frame].points],
            outside: this.shapes[frame].outside,
            attributes: Object.keys(this.shapes[frame].attributes).reduce((attributeAccumulator, attrId) => {
              if (labelAttributes[attrId].mutable) {
                attributeAccumulator.push({
                  spec_id: attrId,
                  value: this.shapes[frame].attributes[attrId]
                });
              }

              return attributeAccumulator;
            }, []),
            id: this.shapes[frame].serverID,
            frame: +frame
          });
          return shapesAccumulator;
        }, [])
      };
    } // Method is used to construct ObjectState objects


    get(frame) {
      if (!(frame in this.cache)) {
        const interpolation = Object.assign({}, this.getPosition(frame), {
          attributes: this.getAttributes(frame),
          group: this.group,
          objectType: ObjectType.TRACK,
          shapeType: this.shapeType,
          clientID: this.clientID,
          serverID: this.serverID,
          lock: this.lock,
          color: this.color
        });
        this.cache[frame] = interpolation;
      }

      const result = JSON.parse(JSON.stringify(this.cache[frame]));
      result.label = this.label;
      return result;
    }

    neighborsFrames(targetFrame) {
      const frames = Object.keys(this.shapes).map(frame => +frame);
      let lDiff = Number.MAX_SAFE_INTEGER;
      let rDiff = Number.MAX_SAFE_INTEGER;

      for (const frame of frames) {
        const diff = Math.abs(targetFrame - frame);

        if (frame <= targetFrame && diff < lDiff) {
          lDiff = diff;
        } else if (diff < rDiff) {
          rDiff = diff;
        }
      }

      const leftFrame = lDiff === Number.MAX_SAFE_INTEGER ? null : targetFrame - lDiff;
      const rightFrame = rDiff === Number.MAX_SAFE_INTEGER ? null : targetFrame + rDiff;
      return {
        leftFrame,
        rightFrame
      };
    }

    getAttributes(targetFrame) {
      const result = {}; // First of all copy all unmutable attributes

      for (const attrID in this.attributes) {
        if (Object.prototype.hasOwnProperty.call(this.attributes, attrID)) {
          result[attrID] = this.attributes[attrID];
        }
      } // Secondly get latest mutable attributes up to target frame


      const frames = Object.keys(this.shapes).sort((a, b) => +a - +b);

      for (const frame of frames) {
        if (frame <= targetFrame) {
          const {
            attributes
          } = this.shapes[frame];

          for (const attrID in attributes) {
            if (Object.prototype.hasOwnProperty.call(attributes, attrID)) {
              result[attrID] = attributes[attrID];
            }
          }
        }
      }

      return result;
    }

    save(frame, data) {
      if (this.lock && data.lock) {
        return objectStateFactory.call(this, frame, this.get(frame));
      } // All changes are done in this temporary object


      const copy = Object.assign(this.get(frame));
      copy.attributes = Object.assign(copy.attributes);
      copy.points = [...copy.points];
      const updated = data.updateFlags;
      let positionUpdated = false;

      if (updated.label) {
        checkObjectType('label', data.label, null, Label);
        copy.label = data.label;
        copy.attributes = {}; // Shape attributes will be removed later after all checks

        this.appendDefaultAttributes.call(copy, copy.label);
      }

      const labelAttributes = copy.label.attributes.reduce((accumulator, value) => {
        accumulator[value.id] = value;
        return accumulator;
      }, {});

      if (updated.attributes) {
        for (const attrID of Object.keys(data.attributes)) {
          const value = data.attributes[attrID];

          if (attrID in labelAttributes && validateAttributeValue(value, labelAttributes[attrID])) {
            copy.attributes[attrID] = value;
          } else {
            throw new ArgumentError(`Trying to save unknown attribute with id ${attrID} and value ${value}`);
          }
        }
      }

      if (updated.points) {
        checkObjectType('points', data.points, null, Array);
        checkNumberOfPoints(this.shapeType, data.points); // cut points

        const {
          width,
          height
        } = this.frameMeta[frame];
        const cutPoints = [];

        for (let i = 0; i < data.points.length - 1; i += 2) {
          const x = data.points[i];
          const y = data.points[i + 1];
          checkObjectType('coordinate', x, 'number', null);
          checkObjectType('coordinate', y, 'number', null);
          cutPoints.push(Math.clamp(x, 0, width), Math.clamp(y, 0, height));
        }

        if (checkShapeArea(this.shapeType, cutPoints)) {
          copy.points = cutPoints;
          positionUpdated = true;
        }
      }

      if (updated.occluded) {
        checkObjectType('occluded', data.occluded, 'boolean', null);
        copy.occluded = data.occluded;
        positionUpdated = true;
      }

      if (updated.outside) {
        checkObjectType('outside', data.outside, 'boolean', null);
        copy.outside = data.outside;
        positionUpdated = true;
      }

      if (updated.group) {
        checkObjectType('group', data.group, 'integer', null);
        copy.group = data.group;
      }

      if (updated.zOrder) {
        checkObjectType('zOrder', data.zOrder, 'integer', null);
        copy.zOrder = data.zOrder;
        positionUpdated = true;
      }

      if (updated.lock) {
        checkObjectType('lock', data.lock, 'boolean', null);
        copy.lock = data.lock;
      }

      if (updated.color) {
        checkObjectType('color', data.color, 'string', null);

        if (/^#[0-9A-F]{6}$/i.test(data.color)) {
          throw new ArgumentError(`Got invalid color value: "${data.color}"`);
        }

        copy.color = data.color;
      }

      if (updated.keyframe) {
        // Just check here
        checkObjectType('keyframe', data.keyframe, 'boolean', null);
      } // Commit all changes


      for (const prop of Object.keys(copy)) {
        if (prop in this) {
          this[prop] = copy[prop];
        }

        this.cache[frame][prop] = copy[prop];
      }

      if (updated.attributes) {
        // Mutable attributes will be updated below
        for (const attrID of Object.keys(copy.attributes)) {
          if (!labelAttributes[attrID].mutable) {
            this.shapes[frame].attributes[attrID] = data.attributes[attrID];
            this.shapes[frame].attributes[attrID] = data.attributes[attrID];
          }
        }
      }

      if (updated.label) {
        for (const shape of Object.values(this.shapes)) {
          shape.attributes = {};
        }
      } // Remove keyframe


      if (updated.keyframe && !data.keyframe) {
        // Remove all cache after this keyframe because it have just become outdated
        for (const cacheFrame in this.cache) {
          if (+cacheFrame > frame) {
            delete this.cache[cacheFrame];
          }
        }

        this.cache[frame].keyframe = false;
        delete this.shapes[frame];
        updated.reset();
        return objectStateFactory.call(this, frame, this.get(frame));
      } // Add/update keyframe


      if (positionUpdated || updated.keyframe && data.keyframe) {
        // Remove all cache after this keyframe because it have just become outdated
        for (const cacheFrame in this.cache) {
          if (+cacheFrame > frame) {
            delete this.cache[cacheFrame];
          }
        }

        this.cache[frame].keyframe = true;
        data.keyframe = true;
        this.shapes[frame] = {
          frame,
          zOrder: copy.zOrder,
          points: copy.points,
          outside: copy.outside,
          occluded: copy.occluded,
          attributes: {}
        };

        if (updated.attributes) {
          // Unmutable attributes were updated above
          for (const attrID of Object.keys(copy.attributes)) {
            if (labelAttributes[attrID].mutable) {
              this.shapes[frame].attributes[attrID] = data.attributes[attrID];
              this.shapes[frame].attributes[attrID] = data.attributes[attrID];
            }
          }
        }
      }

      updated.reset();
      return objectStateFactory.call(this, frame, this.get(frame));
    }

    getPosition(targetFrame) {
      const {
        leftFrame,
        rightFrame
      } = this.neighborsFrames(targetFrame);
      const rightPosition = Number.isInteger(rightFrame) ? this.shapes[rightFrame] : null;
      const leftPosition = Number.isInteger(leftFrame) ? this.shapes[leftFrame] : null;

      if (leftPosition && leftFrame === targetFrame) {
        return {
          points: [...leftPosition.points],
          occluded: leftPosition.occluded,
          outside: leftPosition.outside,
          zOrder: leftPosition.zOrder,
          keyframe: true
        };
      }

      if (rightPosition && leftPosition) {
        return Object.assign({}, this.interpolatePosition(leftPosition, rightPosition, targetFrame), {
          keyframe: false
        });
      }

      if (rightPosition) {
        return {
          points: [...rightPosition.points],
          occluded: rightPosition.occluded,
          outside: true,
          zOrder: 0,
          keyframe: false
        };
      }

      if (leftPosition) {
        return {
          points: [...leftPosition.points],
          occluded: leftPosition.occluded,
          outside: leftPosition.outside,
          zOrder: 0,
          keyframe: false
        };
      }

      throw new ScriptingError(`No one neightbour frame found for the track with client ID: "${this.id}"`);
    }

    delete(force) {
      if (!this.lock || force) {
        this.removed = true;
        this.resetCache();
      }

      return true;
    }

    resetCache() {
      this.cache = {};
    }

  }

  class Tag extends Annotation {
    constructor(data, clientID, injection) {
      super(data, clientID, injection);
    } // Method is used to export data to the server


    toJSON() {
      return {
        clientID: this.clientID,
        id: this.serverID,
        frame: this.frame,
        label_id: this.label.id,
        group: this.group,
        attributes: Object.keys(this.attributes).reduce((attributeAccumulator, attrId) => {
          attributeAccumulator.push({
            spec_id: attrId,
            value: this.attributes[attrId]
          });
          return attributeAccumulator;
        }, [])
      };
    } // Method is used to construct ObjectState objects


    get(frame) {
      if (frame !== this.frame) {
        throw new ScriptingError('Got frame is not equal to the frame of the shape');
      }

      return {
        objectType: ObjectType.TAG,
        clientID: this.clientID,
        serverID: this.serverID,
        lock: this.lock,
        attributes: Object.assign({}, this.attributes),
        label: this.label,
        group: this.group
      };
    }

    save(frame, data) {
      if (frame !== this.frame) {
        throw new ScriptingError('Got frame is not equal to the frame of the shape');
      }

      if (this.lock && data.lock) {
        return objectStateFactory.call(this, frame, this.get(frame));
      } // All changes are done in this temporary object


      const copy = this.get(frame);
      const updated = data.updateFlags;

      if (updated.label) {
        checkObjectType('label', data.label, null, Label);
        copy.label = data.label;
        copy.attributes = {};
        this.appendDefaultAttributes.call(copy, copy.label);
      }

      if (updated.attributes) {
        const labelAttributes = copy.label.attributes.map(attr => `${attr.id}`);

        for (const attrID of Object.keys(data.attributes)) {
          if (labelAttributes.includes(attrID)) {
            copy.attributes[attrID] = data.attributes[attrID];
          }
        }
      }

      if (updated.group) {
        checkObjectType('group', data.group, 'integer', null);
        copy.group = data.group;
      }

      if (updated.lock) {
        checkObjectType('lock', data.lock, 'boolean', null);
        copy.lock = data.lock;
      } // Reset flags and commit all changes


      updated.reset();

      for (const prop of Object.keys(copy)) {
        if (prop in this) {
          this[prop] = copy[prop];
        }
      }

      return objectStateFactory.call(this, frame, this.get(frame));
    }

  }

  class RectangleShape extends Shape {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.shapeType = ObjectShape.RECTANGLE;
      checkNumberOfPoints(this.shapeType, this.points);
    }

    static distance(points, x, y) {
      const [xtl, ytl, xbr, ybr] = points;

      if (!(x >= xtl && x <= xbr && y >= ytl && y <= ybr)) {
        // Cursor is outside of a box
        return null;
      } // The shortest distance from point to an edge


      return Math.min.apply(null, [x - xtl, y - ytl, xbr - x, ybr - y]);
    }

  }

  class PolyShape extends Shape {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
    }

  }

  class PolygonShape extends PolyShape {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.shapeType = ObjectShape.POLYGON;
      checkNumberOfPoints(this.shapeType, this.points);
    }

    static distance(points, x, y) {
      function position(x1, y1, x2, y2) {
        return (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1);
      }

      let wn = 0;
      const distances = [];

      for (let i = 0, j = points.length - 2; i < points.length - 1; j = i, i += 2) {
        // Current point
        const x1 = points[j];
        const y1 = points[j + 1]; // Next point

        const x2 = points[i];
        const y2 = points[i + 1]; // Check if a point is inside a polygon
        // with a winding numbers algorithm
        // https://en.wikipedia.org/wiki/Point_in_polygon#Winding_number_algorithm

        if (y1 <= y) {
          if (y2 > y) {
            if (position(x1, y1, x2, y2) > 0) {
              wn++;
            }
          }
        } else if (y2 <= y) {
          if (position(x1, y1, x2, y2) < 0) {
            wn--;
          }
        } // Find the shortest distance from point to an edge
        // Get an equation of a line in general


        const aCoef = y1 - y2;
        const bCoef = x2 - x1; // Vector (aCoef, bCoef) is a perpendicular to line
        // Now find the point where two lines
        // (edge and its perpendicular through the point (x,y)) are cross

        const xCross = x - aCoef;
        const yCross = y - bCoef;

        if ((xCross - x1) * (x2 - xCross) >= 0 && (yCross - y1) * (y2 - yCross) >= 0) {
          // Cross point is on segment between p1(x1,y1) and p2(x2,y2)
          distances.push(Math.sqrt(Math.pow(x - xCross, 2) + Math.pow(y - yCross, 2)));
        } else {
          distances.push(Math.min(Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2)), Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2))));
        }
      }

      if (wn !== 0) {
        return Math.min.apply(null, distances);
      }

      return null;
    }

  }

  class PolylineShape extends PolyShape {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.shapeType = ObjectShape.POLYLINE;
      checkNumberOfPoints(this.shapeType, this.points);
    }

    static distance(points, x, y) {
      const distances = [];

      for (let i = 0; i < points.length - 2; i += 2) {
        // Current point
        const x1 = points[i];
        const y1 = points[i + 1]; // Next point

        const x2 = points[i + 2];
        const y2 = points[i + 3]; // Find the shortest distance from point to an edge

        if ((x - x1) * (x2 - x) >= 0 && (y - y1) * (y2 - y) >= 0) {
          // Find the length of a perpendicular
          // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
          distances.push(Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2)));
        } else {
          // The link below works for lines (which have infinit length)
          // There is a case when perpendicular doesn't cross the edge
          // In this case we don't use the computed distance
          // Instead we use just distance to the nearest point
          distances.push(Math.min(Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2)), Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2))));
        }
      }

      return Math.min.apply(null, distances);
    }

  }

  class PointsShape extends PolyShape {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.shapeType = ObjectShape.POINTS;
      checkNumberOfPoints(this.shapeType, this.points);
    }

    static distance(points, x, y) {
      const distances = [];

      for (let i = 0; i < points.length; i += 2) {
        const x1 = points[i];
        const y1 = points[i + 1];
        distances.push(Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2)));
      }

      return Math.min.apply(null, distances);
    }

  }

  class RectangleTrack extends Track {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.shapeType = ObjectShape.RECTANGLE;

      for (const shape of Object.values(this.shapes)) {
        checkNumberOfPoints(this.shapeType, shape.points);
      }
    }

    interpolatePosition(leftPosition, rightPosition, targetFrame) {
      const offset = (targetFrame - leftPosition.frame) / (rightPosition.frame - leftPosition.frame);
      const positionOffset = [rightPosition.points[0] - leftPosition.points[0], rightPosition.points[1] - leftPosition.points[1], rightPosition.points[2] - leftPosition.points[2], rightPosition.points[3] - leftPosition.points[3]];
      return {
        // xtl, ytl, xbr, ybr
        points: [leftPosition.points[0] + positionOffset[0] * offset, leftPosition.points[1] + positionOffset[1] * offset, leftPosition.points[2] + positionOffset[2] * offset, leftPosition.points[3] + positionOffset[3] * offset],
        occluded: leftPosition.occluded,
        outside: leftPosition.outside,
        zOrder: leftPosition.zOrder
      };
    }

  }

  class PolyTrack extends Track {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
    }

    interpolatePosition(leftPosition, rightPosition, targetFrame) {
      function findBox(points) {
        let xmin = Number.MAX_SAFE_INTEGER;
        let ymin = Number.MAX_SAFE_INTEGER;
        let xmax = Number.MIN_SAFE_INTEGER;
        let ymax = Number.MIN_SAFE_INTEGER;

        for (let i = 0; i < points.length; i += 2) {
          if (points[i] < xmin) xmin = points[i];
          if (points[i + 1] < ymin) ymin = points[i + 1];
          if (points[i] > xmax) xmax = points[i];
          if (points[i + 1] > ymax) ymax = points[i + 1];
        }

        return {
          xmin,
          ymin,
          xmax,
          ymax
        };
      }

      function normalize(points, box) {
        const normalized = [];
        const width = box.xmax - box.xmin;
        const height = box.ymax - box.ymin;

        for (let i = 0; i < points.length; i += 2) {
          normalized.push((points[i] - box.xmin) / width, (points[i + 1] - box.ymin) / height);
        }

        return normalized;
      }

      function denormalize(points, box) {
        const denormalized = [];
        const width = box.xmax - box.xmin;
        const height = box.ymax - box.ymin;

        for (let i = 0; i < points.length; i += 2) {
          denormalized.push(points[i] * width + box.xmin, points[i + 1] * height + box.ymin);
        }

        return denormalized;
      }

      function toPoints(array) {
        const points = [];

        for (let i = 0; i < array.length; i += 2) {
          points.push({
            x: array[i],
            y: array[i + 1]
          });
        }

        return points;
      }

      function toArray(points) {
        const array = [];

        for (const point of points) {
          array.push(point.x, point.y);
        }

        return array;
      }

      function computeDistances(source, target) {
        const distances = {};

        for (let i = 0; i < source.length; i++) {
          distances[i] = distances[i] || {};

          for (let j = 0; j < target.length; j++) {
            const dx = source[i].x - target[j].x;
            const dy = source[i].y - target[j].y;
            distances[i][j] = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
          }
        }

        return distances;
      }

      function truncateByThreshold(mapping, threshold) {
        for (const key of Object.keys(mapping)) {
          if (mapping[key].distance > threshold) {
            delete mapping[key];
          }
        }
      } // https://en.wikipedia.org/wiki/Stable_marriage_problem
      // TODO: One of important part of the algorithm is to correctly match
      // "corner" points. Thus it is possible for each of such point calculate
      // a descriptor (d) and use (x, y, d) to calculate the distance. One more
      // idea is to be sure that order or matched points is preserved. For example,
      // if p1 matches q1 and p2 matches q2 and between p1 and p2 we don't have any
      // points thus we should not have points between q1 and q2 as well.


      function stableMarriageProblem(men, women, distances) {
        const menPreferences = {};

        for (const man of men) {
          menPreferences[man] = women.concat().sort((w1, w2) => distances[man][w1] - distances[man][w2]);
        } // Start alghoritm with max N^2 complexity


        const womenMaybe = {}; // id woman:id man,distance

        const menBusy = {}; // id man:boolean

        let prefIndex = 0; // While there is at least one free man

        while (Object.values(menBusy).length !== men.length) {
          // Every man makes offer to the best woman
          for (const man of men) {
            // The man have already found a woman
            if (menBusy[man]) {
              continue;
            }

            const woman = menPreferences[man][prefIndex];
            const distance = distances[man][woman]; // A women chooses the best offer and says "maybe"

            if (woman in womenMaybe && womenMaybe[woman].distance > distance) {
              // A woman got better offer
              const prevChoice = womenMaybe[woman].value;
              delete womenMaybe[woman];
              delete menBusy[prevChoice];
            }

            if (!(woman in womenMaybe)) {
              womenMaybe[woman] = {
                value: man,
                distance
              };
              menBusy[man] = true;
            }
          }

          prefIndex++;
        }

        const result = {};

        for (const woman of Object.keys(womenMaybe)) {
          result[womenMaybe[woman].value] = {
            value: woman,
            distance: womenMaybe[woman].distance
          };
        }

        return result;
      }

      function getMapping(source, target) {
        function sumEdges(points) {
          let result = 0;

          for (let i = 1; i < points.length; i += 2) {
            const distance = Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) + Math.pow(points[i].y - points[i - 1].y, 2));
            result += distance;
          } // Corner case when work with one point
          // Mapping in this case can't be wrong


          if (!result) {
            return Number.MAX_SAFE_INTEGER;
          }

          return result;
        }

        function computeDeviation(points, average) {
          let result = 0;

          for (let i = 1; i < points.length; i += 2) {
            const distance = Math.sqrt(Math.pow(points[i].x - points[i - 1].x, 2) + Math.pow(points[i].y - points[i - 1].y, 2));
            result += Math.pow(distance - average, 2);
          }

          return result;
        }

        const processedSource = [];
        const processedTarget = [];
        const distances = computeDistances(source, target);
        const mapping = stableMarriageProblem(Array.from(source.keys()), Array.from(target.keys()), distances);
        const average = (sumEdges(target) + sumEdges(source)) / (target.length + source.length);
        const meanSquareDeviation = Math.sqrt((computeDeviation(source, average) + computeDeviation(target, average)) / (source.length + target.length));
        const threshold = average + 3 * meanSquareDeviation; // 3 sigma rule

        truncateByThreshold(mapping, threshold);

        for (const key of Object.keys(mapping)) {
          mapping[key] = mapping[key].value;
        } // const receivingOrder = Object.keys(mapping).map(x => +x).sort((a,b) => a - b);


        const receivingOrder = this.appendMapping(mapping, source, target);

        for (const pointIdx of receivingOrder) {
          processedSource.push(source[pointIdx]);
          processedTarget.push(target[mapping[pointIdx]]);
        }

        return [processedSource, processedTarget];
      }

      let leftBox = findBox(leftPosition.points);
      let rightBox = findBox(rightPosition.points); // Sometimes (if shape has one point or shape is line),
      // We can get box with zero area
      // Next computation will be with NaN in this case
      // We have to prevent it

      const delta = 1;

      if (leftBox.xmax - leftBox.xmin < delta || rightBox.ymax - rightBox.ymin < delta) {
        leftBox = {
          xmin: 0,
          xmax: 1024,
          // TODO: Get actual image size
          ymin: 0,
          ymax: 768
        };
        rightBox = leftBox;
      }

      const leftPoints = toPoints(normalize(leftPosition.points, leftBox));
      const rightPoints = toPoints(normalize(rightPosition.points, rightBox));
      let newLeftPoints = [];
      let newRightPoints = [];

      if (leftPoints.length > rightPoints.length) {
        const [processedRight, processedLeft] = getMapping.call(this, rightPoints, leftPoints);
        newLeftPoints = processedLeft;
        newRightPoints = processedRight;
      } else {
        const [processedLeft, processedRight] = getMapping.call(this, leftPoints, rightPoints);
        newLeftPoints = processedLeft;
        newRightPoints = processedRight;
      }

      const absoluteLeftPoints = denormalize(toArray(newLeftPoints), leftBox);
      const absoluteRightPoints = denormalize(toArray(newRightPoints), rightBox);
      const offset = (targetFrame - leftPosition.frame) / (rightPosition.frame - leftPosition.frame);
      const interpolation = [];

      for (let i = 0; i < absoluteLeftPoints.length; i++) {
        interpolation.push(absoluteLeftPoints[i] + (absoluteRightPoints[i] - absoluteLeftPoints[i]) * offset);
      }

      return {
        points: interpolation,
        occluded: leftPosition.occluded,
        outside: leftPosition.outside,
        zOrder: leftPosition.zOrder
      };
    } // mapping is predicted order of points sourse_idx:target_idx
    // some points from source and target can absent in mapping
    // source, target - arrays of points. Target array size >= sourse array size


    appendMapping(mapping, source, target) {
      const targetMatched = Object.values(mapping).map(x => +x);
      const sourceMatched = Object.keys(mapping).map(x => +x);
      const orderForReceive = [];

      function findNeighbors(point) {
        let prev = point;
        let next = point;

        if (!targetMatched.length) {
          // Prevent infinity loop
          throw new ScriptingError('Interpolation mapping is empty');
        }

        while (!targetMatched.includes(prev)) {
          prev--;

          if (prev < 0) {
            prev = target.length - 1;
          }
        }

        while (!targetMatched.includes(next)) {
          next++;

          if (next >= target.length) {
            next = 0;
          }
        }

        return [prev, next];
      }

      function computeOffset(point, prev, next) {
        const pathPoints = [];

        while (prev !== next) {
          pathPoints.push(target[prev]);
          prev++;

          if (prev >= target.length) {
            prev = 0;
          }
        }

        pathPoints.push(target[next]);
        let curveLength = 0;
        let offset = 0;
        let iCrossed = false;

        for (let k = 1; k < pathPoints.length; k++) {
          const p1 = pathPoints[k];
          const p2 = pathPoints[k - 1];
          const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

          if (!iCrossed) {
            offset += distance;
          }

          curveLength += distance;

          if (target[point] === pathPoints[k]) {
            iCrossed = true;
          }
        }

        if (!curveLength) {
          return 0;
        }

        return offset / curveLength;
      }

      for (let i = 0; i < target.length; i++) {
        const index = targetMatched.indexOf(i);

        if (index === -1) {
          // We have to find a neighbours which have been mapped
          const [prev, next] = findNeighbors(i); // Now compute edge offset

          const offset = computeOffset(i, prev, next); // Get point between two neighbors points

          const prevPoint = target[prev];
          const nextPoint = target[next];
          const autoPoint = {
            x: prevPoint.x + (nextPoint.x - prevPoint.x) * offset,
            y: prevPoint.y + (nextPoint.y - prevPoint.y) * offset
          }; // Put it into matched

          source.push(autoPoint);
          mapping[source.length - 1] = i;
          orderForReceive.push(source.length - 1);
        } else {
          orderForReceive.push(sourceMatched[index]);
        }
      }

      return orderForReceive;
    }

  }

  class PolygonTrack extends PolyTrack {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.shapeType = ObjectShape.POLYGON;

      for (const shape of Object.values(this.shapes)) {
        checkNumberOfPoints(this.shapeType, shape.points);
      }
    }

  }

  class PolylineTrack extends PolyTrack {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.shapeType = ObjectShape.POLYLINE;

      for (const shape of Object.values(this.shapes)) {
        checkNumberOfPoints(this.shapeType, shape.points);
      }
    }

  }

  class PointsTrack extends PolyTrack {
    constructor(data, clientID, color, injection) {
      super(data, clientID, color, injection);
      this.shapeType = ObjectShape.POINTS;

      for (const shape of Object.values(this.shapes)) {
        checkNumberOfPoints(this.shapeType, shape.points);
      }
    }

  }

  RectangleTrack.distance = RectangleShape.distance;
  PolygonTrack.distance = PolygonShape.distance;
  PolylineTrack.distance = PolylineShape.distance;
  PointsTrack.distance = PointsShape.distance;
  module.exports = {
    RectangleShape,
    PolygonShape,
    PolylineShape,
    PointsShape,
    RectangleTrack,
    PolygonTrack,
    PolylineTrack,
    PointsTrack,
    Track,
    Shape,
    Tag,
    objectStateFactory
  };
})();

/***/ }),

/***/ "./src/annotations-saver.js":
/*!**********************************!*\
  !*** ./src/annotations-saver.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const serverProxy = __webpack_require__(/*! ./server-proxy */ "./src/server-proxy.js");

  const {
    Task
  } = __webpack_require__(/*! ./session */ "./src/session.js");

  const {
    ScriptingError
  } = './exceptions';

  class AnnotationsSaver {
    constructor(version, collection, session) {
      this.sessionType = session instanceof Task ? 'task' : 'job';
      this.id = session.id;
      this.version = version;
      this.collection = collection;
      this.initialObjects = [];
      this.hash = this._getHash(); // We need use data from export instead of initialData
      // Otherwise we have differ keys order and JSON comparison code incorrect

      const exported = this.collection.export();

      for (const shape of exported.shapes) {
        this.initialObjects[shape.id] = shape;
      }

      for (const track of exported.tracks) {
        this.initialObjects[track.id] = track;
      }

      for (const tag of exported.tags) {
        this.initialObjects[tag.id] = tag;
      }
    }

    _getHash() {
      const exported = this.collection.export();
      return JSON.stringify(exported);
    }

    async _request(data, action) {
      const result = await serverProxy.annotations.updateAnnotations(this.sessionType, this.id, data, action);
      return result;
    }

    async _put(data) {
      const result = await this._request(data, 'put');
      return result;
    }

    async _create(created) {
      const result = await this._request(created, 'create');
      return result;
    }

    async _update(updated) {
      const result = await this._request(updated, 'update');
      return result;
    }

    async _delete(deleted) {
      const result = await this._request(deleted, 'delete');
      return result;
    }

    _split(exported) {
      const splitted = {
        created: {
          shapes: [],
          tracks: [],
          tags: []
        },
        updated: {
          shapes: [],
          tracks: [],
          tags: []
        },
        deleted: {
          shapes: [],
          tracks: [],
          tags: []
        }
      }; // Find created and updated objects

      for (const type of Object.keys(exported)) {
        for (const object of exported[type]) {
          if (object.id in this.initialObjects) {
            const exportedHash = JSON.stringify(object);
            const initialHash = JSON.stringify(this.initialObjects[object.id]);

            if (exportedHash !== initialHash) {
              splitted.updated[type].push(object);
            }
          } else if (typeof object.id === 'undefined') {
            splitted.created[type].push(object);
          } else {
            throw new ScriptingError(`Id of object is defined "${object.id}"` + 'but it absents in initial state');
          }
        }
      } // Now find deleted objects


      const indexes = exported.tracks.concat(exported.shapes).concat(exported.tags).map(object => object.id);

      for (const id of Object.keys(this.initialObjects)) {
        if (!indexes.includes(+id)) {
          const object = this.initialObjects[id];
          let type = null;

          if ('shapes' in object) {
            type = 'tracks';
          } else if ('points' in object) {
            type = 'shapes';
          } else {
            type = 'tags';
          }

          splitted.deleted[type].push(object);
        }
      }

      return splitted;
    }

    _updateCreatedObjects(saved, indexes) {
      const savedLength = saved.tracks.length + saved.shapes.length + saved.tags.length;
      const indexesLength = indexes.tracks.length + indexes.shapes.length + indexes.tags.length;

      if (indexesLength !== savedLength) {
        throw new ScriptingError('Number of indexes is differed by number of saved objects' + `${indexesLength} vs ${savedLength}`);
      } // Updated IDs of created objects


      for (const type of Object.keys(indexes)) {
        for (let i = 0; i < indexes[type].length; i++) {
          const clientID = indexes[type][i];
          this.collection.objects[clientID].serverID = saved[type][i].id;

          if (type === 'tracks') {
            // We have to reset cache because of old value of serverID was saved there
            this.collection.objects[clientID].resetCache();
          }
        }
      }
    }

    _receiveIndexes(exported) {
      // Receive client indexes before saving
      const indexes = {
        tracks: exported.tracks.map(track => track.clientID),
        shapes: exported.shapes.map(shape => shape.clientID),
        tags: exported.tags.map(tag => tag.clientID)
      }; // Remove them from the request body

      exported.tracks.concat(exported.shapes).concat(exported.tags).map(value => {
        delete value.clientID;
        return value;
      });
      return indexes;
    }

    async save(onUpdate) {
      if (typeof onUpdate !== 'function') {
        onUpdate = message => {
          console.log(message);
        };
      }

      try {
        const exported = this.collection.export();
        const {
          flush
        } = this.collection;

        if (flush) {
          onUpdate('New objects are being saved..');

          const indexes = this._receiveIndexes(exported);

          const savedData = await this._put(Object.assign({}, exported, {
            version: this.version
          }));
          this.version = savedData.version;
          this.collection.flush = false;
          onUpdate('Saved objects are being updated in the client');

          this._updateCreatedObjects(savedData, indexes);

          onUpdate('Initial state is being updated');

          for (const object of savedData.shapes.concat(savedData.tracks).concat(savedData.tags)) {
            this.initialObjects[object.id] = object;
          }
        } else {
          const {
            created,
            updated,
            deleted
          } = this._split(exported);

          onUpdate('New objects are being saved..');

          const indexes = this._receiveIndexes(created);

          const createdData = await this._create(Object.assign({}, created, {
            version: this.version
          }));
          this.version = createdData.version;
          onUpdate('Saved objects are being updated in the client');

          this._updateCreatedObjects(createdData, indexes);

          onUpdate('Initial state is being updated');

          for (const object of createdData.shapes.concat(createdData.tracks).concat(createdData.tags)) {
            this.initialObjects[object.id] = object;
          }

          onUpdate('Changed objects are being saved..');

          this._receiveIndexes(updated);

          const updatedData = await this._update(Object.assign({}, updated, {
            version: this.version
          }));
          this.version = createdData.version;
          onUpdate('Initial state is being updated');

          for (const object of updatedData.shapes.concat(updatedData.tracks).concat(updatedData.tags)) {
            this.initialObjects[object.id] = object;
          }

          onUpdate('Changed objects are being saved..');

          this._receiveIndexes(deleted);

          const deletedData = await this._delete(Object.assign({}, deleted, {
            version: this.version
          }));
          this._version = deletedData.version;
          onUpdate('Initial state is being updated');

          for (const object of deletedData.shapes.concat(deletedData.tracks).concat(deletedData.tags)) {
            delete this.initialObjects[object.id];
          }
        }

        this.hash = this._getHash();
        onUpdate('Saving is done');
      } catch (error) {
        onUpdate(`Can not save annotations: ${error.message}`);
        throw error;
      }
    }

    hasUnsavedChanges() {
      return this._getHash() !== this.hash;
    }

  }

  module.exports = AnnotationsSaver;
})();

/***/ }),

/***/ "./src/annotations.js":
/*!****************************!*\
  !*** ./src/annotations.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const serverProxy = __webpack_require__(/*! ./server-proxy */ "./src/server-proxy.js");

  const Collection = __webpack_require__(/*! ./annotations-collection */ "./src/annotations-collection.js");

  const AnnotationsSaver = __webpack_require__(/*! ./annotations-saver */ "./src/annotations-saver.js");

  const {
    checkObjectType
  } = __webpack_require__(/*! ./common */ "./src/common.js");

  const {
    Task
  } = __webpack_require__(/*! ./session */ "./src/session.js");

  const {
    ScriptingError,
    DataError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");

  const jobCache = new WeakMap();
  const taskCache = new WeakMap();

  function getCache(sessionType) {
    if (sessionType === 'task') {
      return taskCache;
    }

    if (sessionType === 'job') {
      return jobCache;
    }

    throw new ScriptingError(`Unknown session type was received ${sessionType}`);
  }

  async function getAnnotationsFromServer(session) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (!cache.has(session)) {
      const rawAnnotations = await serverProxy.annotations.getAnnotations(sessionType, session.id); // Get meta information about frames

      const startFrame = sessionType === 'job' ? session.startFrame : 0;
      const stopFrame = sessionType === 'job' ? session.stopFrame : session.size - 1;
      const frameMeta = {};

      for (let i = startFrame; i <= stopFrame; i++) {
        frameMeta[i] = await session.frames.get(i);
      }

      const collection = new Collection({
        labels: session.labels || session.task.labels,
        startFrame,
        stopFrame,
        frameMeta
      }).import(rawAnnotations);
      const saver = new AnnotationsSaver(rawAnnotations.version, collection, session);
      cache.set(session, {
        collection,
        saver
      });
    }
  }

  async function getAnnotations(session, frame, filter) {
    await getAnnotationsFromServer(session);
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);
    return cache.get(session).collection.get(frame, filter);
  }

  async function saveAnnotations(session, onUpdate) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.has(session)) {
      await cache.get(session).saver.save(onUpdate);
    } // If a collection wasn't uploaded, than it wasn't changed, finally we shouldn't save it

  }

  function mergeAnnotations(session, objectStates) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.has(session)) {
      return cache.get(session).collection.merge(objectStates);
    }

    throw new DataError('Collection has not been initialized yet. Call annotations.get() or annotations.clear(true) before');
  }

  function splitAnnotations(session, objectState, frame) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.has(session)) {
      return cache.get(session).collection.split(objectState, frame);
    }

    throw new DataError('Collection has not been initialized yet. Call annotations.get() or annotations.clear(true) before');
  }

  function groupAnnotations(session, objectStates, reset) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.has(session)) {
      return cache.get(session).collection.group(objectStates, reset);
    }

    throw new DataError('Collection has not been initialized yet. Call annotations.get() or annotations.clear(true) before');
  }

  function hasUnsavedChanges(session) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.has(session)) {
      return cache.get(session).saver.hasUnsavedChanges();
    }

    return false;
  }

  async function clearAnnotations(session, reload) {
    checkObjectType('reload', reload, 'boolean', null);
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.has(session)) {
      cache.get(session).collection.clear();
    }

    if (reload) {
      cache.delete(session);
      await getAnnotationsFromServer(session);
    }
  }

  function annotationsStatistics(session) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.has(session)) {
      return cache.get(session).collection.statistics();
    }

    throw new DataError('Collection has not been initialized yet. Call annotations.get() or annotations.clear(true) before');
  }

  function putAnnotations(session, objectStates) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.has(session)) {
      return cache.get(session).collection.put(objectStates);
    }

    throw new DataError('Collection has not been initialized yet. Call annotations.get() or annotations.clear(true) before');
  }

  function selectObject(session, objectStates, x, y) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const cache = getCache(sessionType);

    if (cache.has(session)) {
      return cache.get(session).collection.select(objectStates, x, y);
    }

    throw new DataError('Collection has not been initialized yet. Call annotations.get() or annotations.clear(true) before');
  }

  async function uploadAnnotations(session, file, format) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    await serverProxy.annotations.uploadAnnotations(sessionType, session.id, file, format);
  }

  async function dumpAnnotations(session, name, format) {
    const sessionType = session instanceof Task ? 'task' : 'job';
    const result = await serverProxy.annotations.dumpAnnotations(sessionType, session.id, name, format);
    return result;
  }

  module.exports = {
    getAnnotations,
    putAnnotations,
    saveAnnotations,
    hasUnsavedChanges,
    mergeAnnotations,
    splitAnnotations,
    groupAnnotations,
    clearAnnotations,
    annotationsStatistics,
    selectObject,
    uploadAnnotations,
    dumpAnnotations
  };
})();

/***/ }),

/***/ "./src/api-implementation.js":
/*!***********************************!*\
  !*** ./src/api-implementation.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

__webpack_require__(/*! core-js/modules/web.url */ "./node_modules/core-js/modules/web.url.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* eslint prefer-arrow-callback: [ "error", { "allowNamedFunctions": true } ] */

/* global
    require:false
*/
(() => {
  const PluginRegistry = __webpack_require__(/*! ./plugins */ "./src/plugins.js");

  const serverProxy = __webpack_require__(/*! ./server-proxy */ "./src/server-proxy.js");

  const {
    isBoolean,
    isInteger,
    isEnum,
    isString,
    checkFilter
  } = __webpack_require__(/*! ./common */ "./src/common.js");

  const {
    TaskStatus,
    TaskMode
  } = __webpack_require__(/*! ./enums */ "./src/enums.js");

  const User = __webpack_require__(/*! ./user */ "./src/user.js");

  const {
    ArgumentError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");

  const {
    Task
  } = __webpack_require__(/*! ./session */ "./src/session.js");

  function implementAPI(cvat) {
    cvat.plugins.list.implementation = PluginRegistry.list;
    cvat.plugins.register.implementation = PluginRegistry.register.bind(cvat);

    cvat.server.about.implementation = async () => {
      const result = await serverProxy.server.about();
      return result;
    };

    cvat.server.share.implementation = async directory => {
      const result = await serverProxy.server.share(directory);
      return result;
    };

    cvat.server.login.implementation = async (username, password) => {
      await serverProxy.server.login(username, password);
    };

    cvat.server.logout.implementation = async () => {
      await serverProxy.server.logout();
    };

    cvat.users.get.implementation = async filter => {
      checkFilter(filter, {
        self: isBoolean
      });
      let users = null;

      if ('self' in filter && filter.self) {
        users = await serverProxy.users.getSelf();
        users = [users];
      } else {
        users = await serverProxy.users.getUsers();
      }

      users = users.map(user => new User(user));
      return users;
    };

    cvat.jobs.get.implementation = async filter => {
      checkFilter(filter, {
        taskID: isInteger,
        jobID: isInteger
      });

      if ('taskID' in filter && 'jobID' in filter) {
        throw new ArgumentError('Only one of fields "taskID" and "jobID" allowed simultaneously');
      }

      if (!Object.keys(filter).length) {
        throw new ArgumentError('Job filter must not be empty');
      }

      let tasks = null;

      if ('taskID' in filter) {
        tasks = await serverProxy.tasks.getTasks(`id=${filter.taskID}`);
      } else {
        const job = await serverProxy.jobs.getJob(filter.jobID);

        if (typeof job.task_id !== 'undefined') {
          tasks = await serverProxy.tasks.getTasks(`id=${job.task_id}`);
        }
      } // If task was found by its id, then create task instance and get Job instance from it


      if (tasks !== null && tasks.length) {
        const task = new Task(tasks[0]);
        return filter.jobID ? task.jobs.filter(job => job.id === filter.jobID) : task.jobs;
      }

      return [];
    };

    cvat.tasks.get.implementation = async filter => {
      checkFilter(filter, {
        page: isInteger,
        name: isString,
        id: isInteger,
        owner: isString,
        assignee: isString,
        search: isString,
        status: isEnum.bind(TaskStatus),
        mode: isEnum.bind(TaskMode)
      });

      if ('search' in filter && Object.keys(filter).length > 1) {
        if (!('page' in filter && Object.keys(filter).length === 2)) {
          throw new ArgumentError('Do not use the filter field "search" with others');
        }
      }

      if ('id' in filter && Object.keys(filter).length > 1) {
        if (!('page' in filter && Object.keys(filter).length === 2)) {
          throw new ArgumentError('Do not use the filter field "id" with others');
        }
      }

      const searchParams = new URLSearchParams();

      for (const field of ['name', 'owner', 'assignee', 'search', 'status', 'mode', 'id', 'page']) {
        if (Object.prototype.hasOwnProperty.call(filter, field)) {
          searchParams.set(field, filter[field]);
        }
      }

      const tasksData = await serverProxy.tasks.getTasks(searchParams.toString());
      const tasks = tasksData.map(task => new Task(task));
      tasks.count = tasksData.count;
      return tasks;
    };

    return cvat;
  }

  module.exports = implementAPI;
})();

/***/ }),

/***/ "./src/api.js":
/*!********************!*\
  !*** ./src/api.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/

/**
    * External API which should be used by for development
    * @module API
*/
function build() {
  const PluginRegistry = __webpack_require__(/*! ./plugins */ "./src/plugins.js");

  const User = __webpack_require__(/*! ./user */ "./src/user.js");

  const ObjectState = __webpack_require__(/*! ./object-state */ "./src/object-state.js");

  const Statistics = __webpack_require__(/*! ./statistics */ "./src/statistics.js");

  const {
    Job,
    Task
  } = __webpack_require__(/*! ./session */ "./src/session.js");

  const {
    Attribute,
    Label
  } = __webpack_require__(/*! ./labels */ "./src/labels.js");

  const {
    ShareFileType,
    TaskStatus,
    TaskMode,
    AttributeType,
    ObjectType,
    ObjectShape,
    LogType,
    EventType
  } = __webpack_require__(/*! ./enums */ "./src/enums.js");

  const {
    Exception,
    ArgumentError,
    DataError,
    ScriptingError,
    PluginError,
    ServerError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");

  const pjson = __webpack_require__(/*! ../package.json */ "./package.json");

  const config = __webpack_require__(/*! ./config */ "./src/config.js");
  /**
      * API entrypoint
      * @namespace cvat
      * @memberof module:API
  */


  const cvat = {
    /**
        * Namespace is used for an interaction with a server
        * @namespace server
        * @package
        * @memberof module:API.cvat
    */
    server: {
      /**
          * @typedef {Object} ServerInfo
          * @property {string} name A name of the tool
          * @property {string} description A description of the tool
          * @property {string} version A version of the tool
          * @global
      */

      /**
          * Method returns some information about the annotation tool
          * @method about
          * @async
          * @memberof module:API.cvat.server
          * @return {ServerInfo}
          * @throws {module:API.cvat.exceptions.ServerError}
          * @throws {module:API.cvat.exceptions.PluginError}
      */
      async about() {
        const result = await PluginRegistry.apiWrapper(cvat.server.about);
        return result;
      },

      /**
          * @typedef {Object} FileInfo
          * @property {string} name A name of a file
          * @property {module:API.cvat.enums.ShareFileType} type
          * A type of a file
          * @global
      */

      /**
          * Method returns a list of files in a specified directory on a share
          * @method share
          * @async
          * @memberof module:API.cvat.server
          * @param {string} [directory=/] - Share directory path
          * @returns {FileInfo[]}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
      */
      async share(directory = '/') {
        const result = await PluginRegistry.apiWrapper(cvat.server.share, directory);
        return result;
      },

      /**
          * Method allows to login on a server
          * @method login
          * @async
          * @memberof module:API.cvat.server
          * @param {string} username An username of an account
          * @param {string} password A password of an account
          * @throws {module:API.cvat.exceptions.ScriptingError}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
      */
      async login(username, password) {
        const result = await PluginRegistry.apiWrapper(cvat.server.login, username, password);
        return result;
      },

      /**
          * Method allows to logout from the server
          * @method logout
          * @async
          * @memberof module:API.cvat.server
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
      */
      async logout() {
        const result = await PluginRegistry.apiWrapper(cvat.server.logout);
        return result;
      }

    },

    /**
        * Namespace is used for getting tasks
        * @namespace tasks
        * @memberof module:API.cvat
    */
    tasks: {
      /**
          * @typedef {Object} TaskFilter
          * @property {string} name Check if name contains this value
          * @property {module:API.cvat.enums.TaskStatus} status
          * Check if status contains this value
          * @property {module:API.cvat.enums.TaskMode} mode
          * Check if mode contains this value
          * @property {integer} id Check if id equals this value
          * @property {integer} page Get specific page
          * (default REST API returns 20 tasks per request.
          * In order to get more, it is need to specify next page)
          * @property {string} owner Check if owner user contains this value
          * @property {string} assignee Check if assigneed contains this value
          * @property {string} search Combined search of contains among all fields
          * @global
      */

      /**
          * Method returns list of tasks corresponding to a filter
          * @method get
          * @async
          * @memberof module:API.cvat.tasks
          * @param {TaskFilter} [filter={}] task filter
          * @returns {module:API.cvat.classes.Task[]}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
      */
      async get(filter = {}) {
        const result = await PluginRegistry.apiWrapper(cvat.tasks.get, filter);
        return result;
      }

    },

    /**
        * Namespace is used for getting jobs
        * @namespace jobs
        * @memberof module:API.cvat
    */
    jobs: {
      /**
          * @typedef {Object} JobFilter
          * Only one of fields is allowed simultaneously
          * @property {integer} taskID filter all jobs of specific task
          * @property {integer} jobID filter job with a specific id
          * @global
      */

      /**
          * Method returns list of jobs corresponding to a filter
          * @method get
          * @async
          * @memberof module:API.cvat.jobs
          * @param {JobFilter} filter job filter
          * @returns {module:API.cvat.classes.Job[]}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
      */
      async get(filter = {}) {
        const result = await PluginRegistry.apiWrapper(cvat.jobs.get, filter);
        return result;
      }

    },

    /**
        * Namespace is used for getting users
        * @namespace users
        * @memberof module:API.cvat
    */
    users: {
      /**
          * @typedef {Object} UserFilter
          * @property {boolean} self get only self
          * @global
      */

      /**
          * Method returns list of users corresponding to a filter
          * @method get
          * @async
          * @memberof module:API.cvat.users
          * @param {UserFilter} [filter={}] user filter
          * @returns {User[]}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
      */
      async get(filter = {}) {
        const result = await PluginRegistry.apiWrapper(cvat.users.get, filter);
        return result;
      }

    },

    /**
        * Namespace is used for plugin management
        * @namespace plugins
        * @memberof module:API.cvat
    */
    plugins: {
      /**
          * @typedef {Object} Plugin
          * A plugin is a Javascript object. It must have properties are listed below. <br>
          * It also mustn't have property 'functions' which is used internally. <br>
          * You can expand any API method including class methods. <br>
          * In order to expand class method just use a class name
          * in a cvat space (example is listed below).
          *
          * @property {string} name A name of a plugin
          * @property {string} description A description of a plugin
          * Example plugin implementation listed below:
          * @example
          * plugin = {
          *   name: 'Example Plugin',
          *   description: 'This example plugin demonstrates how plugin system in CVAT works',
          *   cvat: {
          *     server: {
          *       about: {
          *         // Plugin adds some actions after executing the cvat.server.about()
          *         // For example it adds a field with installed plugins to a result
          *         // An argument "self" is a plugin itself
          *         // An argument "result" is a return value of cvat.server.about()
          *         // All next arguments are arguments of a wrapped function
          *         // (in this case the wrapped function doesn't have any arguments)
          *         async leave(self, result) {
          *           result.plugins = await self.internal.getPlugins();
          *           // Note that a method leave must return "result" (changed or not)
          *           // Otherwise API won't work as expected
          *           return result;
          *         },
          *       },
          *     },
          *     // In this example plugin also wraps a class method
          *     classes: {
          *       Job: {
          *         prototype: {
          *           annotations: {
          *             put: {
          *               // The first argument "self" is a plugin, like in a case above
          *               // The second argument is an argument of the
          *               // Job.annotations.put()
          *               // It contains an array of objects to put
          *               // In this sample we round objects coordinates and save them
          *               enter(self, objects) {
          *                 for (const obj of objects) {
          *                   if (obj.type != 'tag') {
          *                     const points = obj.position.map((point) => {
          *                       const roundPoint = {
          *                         x: Math.round(point.x),
          *                         y: Math.round(point.y),
          *                       };
          *                       return roundPoint;
          *                     });
          *                   }
          *                 }
          *               },
          *             },
          *           },
          *         },
          *       },
          *     },
          *   },
          *   // In general you can add any others members to your plugin
          *   // Members below are only examples
          *   internal: {
          *     async getPlugins() {
          *       // Collect information about installed plugins
          *       const plugins = await cvat.plugins.list();
          *       return plugins.map((el) => {
          *         return {
          *           name: el.name,
          *           description: el.description,
          *         };
          *       });
          *     },
          *   },
          * };
          * @global
      */

      /**
          * Method returns list of installed plugins
          * @method list
          * @async
          * @memberof module:API.cvat.plugins
          * @returns {Plugin[]}
          * @throws {module:API.cvat.exceptions.PluginError}
      */
      async list() {
        const result = await PluginRegistry.apiWrapper(cvat.plugins.list);
        return result;
      },

      /**
          * Install plugin to CVAT
          * @method register
          * @async
          * @memberof module:API.cvat.plugins
          * @param {Plugin} [plugin] plugin for registration
          * @throws {module:API.cvat.exceptions.PluginError}
      */
      async register(plugin) {
        const result = await PluginRegistry.apiWrapper(cvat.plugins.register, plugin);
        return result;
      }

    },

    /**
        * Namespace contains some changeable configurations
        * @namespace config
        * @memberof module:API.cvat
    */
    config: {
      /**
          * @memberof module:API.cvat.config
          * @property {string} backendAPI host with a backend api
          * @memberof module:API.cvat.config
          * @property {string} proxy Axios proxy settings.
          * For more details please read <a href="https://github.com/axios/axios"> here </a>
          * @memberof module:API.cvat.config
          * @property {integer} taskID this value is displayed in a logs if available
          * @memberof module:API.cvat.config
          * @property {integer} jobID this value is displayed in a logs if available
          * @memberof module:API.cvat.config
          * @property {integer} clientID read only auto-generated
          * value which is displayed in a logs
          * @memberof module:API.cvat.config
      */
      get backendAPI() {
        return config.backendAPI;
      },

      set backendAPI(value) {
        config.backendAPI = value;
      },

      get proxy() {
        return config.proxy;
      },

      set proxy(value) {
        config.proxy = value;
      },

      get taskID() {
        return config.taskID;
      },

      set taskID(value) {
        config.taskID = value;
      },

      get jobID() {
        return config.jobID;
      },

      set jobID(value) {
        config.jobID = value;
      },

      get clientID() {
        return config.clientID;
      }

    },

    /**
        * Namespace contains some library information e.g. api version
        * @namespace client
        * @memberof module:API.cvat
    */
    client: {
      /**
          * @property {string} version Client version.
          * Format: <b>{major}.{minor}.{patch}</b>
          * <li style="margin-left: 10px;"> A major number is changed after an API becomes
          * incompatible with a previous version
          * <li style="margin-left: 10px;"> A minor number is changed after an API expands
          * <li style="margin-left: 10px;"> A patch number is changed after an each build
          * @memberof module:API.cvat.client
          * @readonly
      */
      version: `${pjson.version}`
    },

    /**
        * Namespace is used for access to enums
        * @namespace enums
        * @memberof module:API.cvat
    */
    enums: {
      ShareFileType,
      TaskStatus,
      TaskMode,
      AttributeType,
      ObjectType,
      ObjectShape,
      LogType,
      EventType
    },

    /**
        * Namespace is used for access to exceptions
        * @namespace exceptions
        * @memberof module:API.cvat
    */
    exceptions: {
      Exception,
      ArgumentError,
      DataError,
      ScriptingError,
      PluginError,
      ServerError
    },

    /**
        * Namespace is used for access to classes
        * @namespace classes
        * @memberof module:API.cvat
    */
    classes: {
      Task,
      User,
      Job,
      Attribute,
      Label,
      Statistics,
      ObjectState
    }
  };
  cvat.server = Object.freeze(cvat.server);
  cvat.tasks = Object.freeze(cvat.tasks);
  cvat.jobs = Object.freeze(cvat.jobs);
  cvat.users = Object.freeze(cvat.users);
  cvat.plugins = Object.freeze(cvat.plugins);
  cvat.client = Object.freeze(cvat.client);
  cvat.enums = Object.freeze(cvat.enums);

  const implementAPI = __webpack_require__(/*! ./api-implementation */ "./src/api-implementation.js");

  Math.clamp = function (value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  const implemented = Object.freeze(implementAPI(cvat));
  return implemented;
}

module.exports = build();

/***/ }),

/***/ "./src/common.js":
/*!***********************!*\
  !*** ./src/common.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const {
    ArgumentError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");

  function isBoolean(value) {
    return typeof value === 'boolean';
  }

  function isInteger(value) {
    return typeof value === 'number' && Number.isInteger(value);
  } // Called with specific Enum context


  function isEnum(value) {
    for (const key in this) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        if (this[key] === value) {
          return true;
        }
      }
    }

    return false;
  }

  function isString(value) {
    return typeof value === 'string';
  }

  function checkFilter(filter, fields) {
    for (const prop in filter) {
      if (Object.prototype.hasOwnProperty.call(filter, prop)) {
        if (!(prop in fields)) {
          throw new ArgumentError(`Unsupported filter property has been recieved: "${prop}"`);
        } else if (!fields[prop](filter[prop])) {
          throw new ArgumentError(`Received filter property "${prop}" is not satisfied for checker`);
        }
      }
    }
  }

  function checkObjectType(name, value, type, instance) {
    if (type) {
      if (typeof value !== type) {
        // specific case for integers which aren't native type in JS
        if (type === 'integer' && Number.isInteger(value)) {
          return;
        }

        throw new ArgumentError(`"${name}" is expected to be "${type}", but "${typeof value}" has been got.`);
      }
    } else if (instance) {
      if (!(value instanceof instance)) {
        if (value !== undefined) {
          throw new ArgumentError(`"${name}" is expected to be ${instance.name}, but ` + `"${value.constructor.name}" has been got`);
        }

        throw new ArgumentError(`"${name}" is expected to be ${instance.name}, but "undefined" has been got.`);
      }
    }
  }

  module.exports = {
    isBoolean,
    isInteger,
    isEnum,
    isString,
    checkFilter,
    checkObjectType
  };
})();

/***/ }),

/***/ "./src/config.js":
/*!***********************!*\
  !*** ./src/config.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/
module.exports = {
  backendAPI: 'http://localhost:7000/api/v1',
  proxy: false,
  taskID: undefined,
  jobID: undefined,
  clientID: +Date.now().toString().substr(-6)
};

/***/ }),

/***/ "./src/enums.js":
/*!**********************!*\
  !*** ./src/enums.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/
(() => {
  /**
      * Enum for type of server files
      * @enum {string}
      * @name ShareFileType
      * @memberof module:API.cvat.enums
      * @property {string} DIR 'DIR'
      * @property {string} REG 'REG'
      * @readonly
  */
  const ShareFileType = Object.freeze({
    DIR: 'DIR',
    REG: 'REG'
  });
  /**
      * Enum for a status of a task
      * @enum {string}
      * @name TaskStatus
      * @memberof module:API.cvat.enums
      * @property {string} ANNOTATION 'annotation'
      * @property {string} VALIDATION 'validation'
      * @property {string} COMPLETED 'completed'
      * @readonly
  */

  const TaskStatus = Object.freeze({
    ANNOTATION: 'annotation',
    VALIDATION: 'validation',
    COMPLETED: 'completed'
  });
  /**
      * Enum for a mode of a task
      * @enum {string}
      * @name TaskMode
      * @memberof module:API.cvat.enums
      * @property {string} ANNOTATION 'annotation'
      * @property {string} INTERPOLATION 'interpolation'
      * @readonly
  */

  const TaskMode = Object.freeze({
    ANNOTATION: 'annotation',
    INTERPOLATION: 'interpolation'
  });
  /**
      * Enum for type of server files
      * @enum {string}
      * @name AttributeType
      * @memberof module:API.cvat.enums
      * @property {string} CHECKBOX 'checkbox'
      * @property {string} SELECT 'select'
      * @property {string} RADIO 'radio'
      * @property {string} NUMBER 'number'
      * @property {string} TEXT 'text'
      * @readonly
  */

  const AttributeType = Object.freeze({
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    SELECT: 'select',
    NUMBER: 'number',
    TEXT: 'text'
  });
  /**
      * Enum for type of an object
      * @enum {string}
      * @name ObjectType
      * @memberof module:API.cvat.enums
      * @property {string} TAG 'tag'
      * @property {string} SHAPE 'shape'
      * @property {string} TRACK 'track'
      * @readonly
  */

  const ObjectType = Object.freeze({
    TAG: 'tag',
    SHAPE: 'shape',
    TRACK: 'track'
  });
  /**
      * Enum for type of server files
      * @enum {string}
      * @name ObjectShape
      * @memberof module:API.cvat.enums
      * @property {string} RECTANGLE 'rectangle'
      * @property {string} POLYGON 'polygon'
      * @property {string} POLYLINE 'polyline'
      * @property {string} POINTS 'points'
      * @readonly
  */

  const ObjectShape = Object.freeze({
    RECTANGLE: 'rectangle',
    POLYGON: 'polygon',
    POLYLINE: 'polyline',
    POINTS: 'points'
  });
  /**
      * Enum for type of server files
      * @enum {number}
      * @name LogType
      * @memberof module:API.cvat.enums
      * @property {number} pasteObject 0
      * @property {number} changeAttribute 1
      * @property {number} dragObject 2
      * @property {number} deleteObject 3
      * @property {number} pressShortcut 4
      * @property {number} resizeObject 5
      * @property {number} sendLogs 6
      * @property {number} saveJob 7
      * @property {number} jumpFrame 8
      * @property {number} drawObject 9
      * @property {number} changeLabel 10
      * @property {number} sendTaskInfo 11
      * @property {number} loadJob 12
      * @property {number} moveImage 13
      * @property {number} zoomImage 14
      * @property {number} lockObject 15
      * @property {number} mergeObjects 16
      * @property {number} copyObject 17
      * @property {number} propagateObject 18
      * @property {number} undoAction 19
      * @property {number} redoAction 20
      * @property {number} sendUserActivity 21
      * @property {number} sendException 22
      * @property {number} changeFrame 23
      * @property {number} debugInfo 24
      * @property {number} fitImage 25
      * @property {number} rotateImage 26
      * @readonly
  */

  const LogType = {
    pasteObject: 0,
    changeAttribute: 1,
    dragObject: 2,
    deleteObject: 3,
    pressShortcut: 4,
    resizeObject: 5,
    sendLogs: 6,
    saveJob: 7,
    jumpFrame: 8,
    drawObject: 9,
    changeLabel: 10,
    sendTaskInfo: 11,
    loadJob: 12,
    moveImage: 13,
    zoomImage: 14,
    lockObject: 15,
    mergeObjects: 16,
    copyObject: 17,
    propagateObject: 18,
    undoAction: 19,
    redoAction: 20,
    sendUserActivity: 21,
    sendException: 22,
    changeFrame: 23,
    debugInfo: 24,
    fitImage: 25,
    rotateImage: 26
  };
  /**
      * Enum for type of server files
      * @enum {number}
      * @name EventType
      * @memberof module:API.cvat.enums
      * @property {number} frameDownloaded 0
      * @readonly
  */

  const EventType = Object.freeze({
    frameDownloaded: 0
  });
  module.exports = {
    ShareFileType,
    TaskStatus,
    TaskMode,
    AttributeType,
    ObjectType,
    ObjectShape,
    LogType,
    EventType
  };
})();

/***/ }),

/***/ "./src/exceptions.js":
/*!***************************!*\
  !*** ./src/exceptions.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const Platform = __webpack_require__(/*! platform */ "./node_modules/platform/platform.js");

  const ErrorStackParser = __webpack_require__(/*! error-stack-parser */ "./node_modules/error-stack-parser/error-stack-parser.js");

  const config = __webpack_require__(/*! ./config */ "./src/config.js");
  /**
      * Base exception class
      * @memberof module:API.cvat.exceptions
      * @extends Error
      * @ignore
  */


  class Exception extends Error {
    /**
        * @param {string} message - Exception message
    */
    constructor(message) {
      super(message);
      const time = new Date().toISOString();
      const system = Platform.os.toString();
      const client = `${Platform.name} ${Platform.version}`;
      const info = ErrorStackParser.parse(this)[0];
      const filename = `${info.fileName}`;
      const line = info.lineNumber;
      const column = info.columnNumber;
      const {
        jobID,
        taskID,
        clientID
      } = config;
      const projID = undefined; // wasn't implemented

      Object.defineProperties(this, Object.freeze({
        system: {
          /**
              * @name system
              * @type {string}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => system
        },
        client: {
          /**
              * @name client
              * @type {string}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => client
        },
        time: {
          /**
              * @name time
              * @type {string}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => time
        },
        jobID: {
          /**
              * @name jobID
              * @type {integer}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => jobID
        },
        taskID: {
          /**
              * @name taskID
              * @type {integer}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => taskID
        },
        projID: {
          /**
              * @name projID
              * @type {integer}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => projID
        },
        clientID: {
          /**
              * @name clientID
              * @type {integer}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => clientID
        },
        filename: {
          /**
              * @name filename
              * @type {string}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => filename
        },
        line: {
          /**
              * @name line
              * @type {integer}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => line
        },
        column: {
          /**
              * @name column
              * @type {integer}
              * @memberof module:API.cvat.exceptions.Exception
              * @readonly
              * @instance
          */
          get: () => column
        }
      }));
    }
    /**
        * Save an exception on a server
        * @name save
        * @method
        * @memberof Exception
        * @instance
        * @async
    */


    async save() {
      const exceptionObject = {
        system: this.system,
        client: this.client,
        time: this.time,
        job_id: this.jobID,
        task_id: this.taskID,
        proj_id: this.projID,
        client_id: this.clientID,
        message: this.message,
        filename: this.filename,
        line: this.line,
        column: this.column,
        stack: this.stack
      };

      try {
        const serverProxy = __webpack_require__(/*! ./server-proxy */ "./src/server-proxy.js");

        await serverProxy.server.exception(exceptionObject);
      } catch (exception) {// add event
      }
    }

  }
  /**
      * Exceptions are referred with arguments data
      * @memberof module:API.cvat.exceptions
      * @extends module:API.cvat.exceptions.Exception
  */


  class ArgumentError extends Exception {
    /**
        * @param {string} message - Exception message
    */
    constructor(message) {
      super(message);
    }

  }
  /**
      * Unexpected problems with data which are not connected with a user input
      * @memberof module:API.cvat.exceptions
      * @extends module:API.cvat.exceptions.Exception
  */


  class DataError extends Exception {
    /**
        * @param {string} message - Exception message
    */
    constructor(message) {
      super(message);
    }

  }
  /**
      * Unexpected situations in code
      * @memberof module:API.cvat.exceptions
      * @extends module:API.cvat.exceptions.Exception
      */


  class ScriptingError extends Exception {
    /**
        * @param {string} message - Exception message
    */
    constructor(message) {
      super(message);
    }

  }
  /**
      * Plugin-referred exceptions
      * @memberof module:API.cvat.exceptions
      * @extends module:API.cvat.exceptions.Exception
  */


  class PluginError extends Exception {
    /**
        * @param {string} message - Exception message
    */
    constructor(message) {
      super(message);
    }

  }
  /**
      * Exceptions in interaction with a server
      * @memberof module:API.cvat.exceptions
      * @extends module:API.cvat.exceptions.Exception
  */


  class ServerError extends Exception {
    /**
        * @param {string} message - Exception message
        * @param {(string|integer)} code - Response code
    */
    constructor(message, code) {
      super(message);
      Object.defineProperties(this, Object.freeze({
        /**
            * @name code
            * @type {(string|integer)}
            * @memberof module:API.cvat.exceptions.ServerError
            * @readonly
            * @instance
        */
        code: {
          get: () => code
        }
      }));
    }

  }

  module.exports = {
    Exception,
    ArgumentError,
    DataError,
    ScriptingError,
    PluginError,
    ServerError
  };
})();

/***/ }),

/***/ "./src/frames.js":
/*!***********************!*\
  !*** ./src/frames.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

__webpack_require__(/*! core-js/modules/web.url */ "./node_modules/core-js/modules/web.url.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
    global:false
*/
(() => {
  const PluginRegistry = __webpack_require__(/*! ./plugins */ "./src/plugins.js");

  const serverProxy = __webpack_require__(/*! ./server-proxy */ "./src/server-proxy.js");

  const {
    ArgumentError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js"); // This is the frames storage


  const frameDataCache = {};
  const frameCache = {};
  /**
      * Class provides meta information about specific frame and frame itself
      * @memberof module:API.cvat.classes
      * @hideconstructor
  */

  class FrameData {
    constructor(width, height, tid, number) {
      Object.defineProperties(this, Object.freeze({
        /**
            * @name width
            * @type {integer}
            * @memberof module:API.cvat.classes.FrameData
            * @readonly
            * @instance
        */
        width: {
          value: width,
          writable: false
        },

        /**
            * @name height
            * @type {integer}
            * @memberof module:API.cvat.classes.FrameData
            * @readonly
            * @instance
        */
        height: {
          value: height,
          writable: false
        },
        tid: {
          value: tid,
          writable: false
        },
        number: {
          value: number,
          writable: false
        }
      }));
    }
    /**
        * Method returns URL encoded image which can be placed in the img tag
        * @method data
        * @returns {string}
        * @memberof module:API.cvat.classes.FrameData
        * @instance
        * @async
        * @throws {module:API.cvat.exception.ServerError}
        * @throws {module:API.cvat.exception.PluginError}
    */


    async data() {
      const result = await PluginRegistry.apiWrapper.call(this, FrameData.prototype.data);
      return result;
    }

  }

  FrameData.prototype.data.implementation = async function () {
    if (!(this.number in frameCache[this.tid])) {
      const frame = await serverProxy.frames.getData(this.tid, this.number);

      if ( true && module.exports) {
        frameCache[this.tid][this.number] = global.Buffer.from(frame, 'binary').toString('base64');
      } else {
        const url = URL.createObjectURL(new Blob([frame]));
        frameCache[this.tid][this.number] = url;
      }
    }

    return frameCache[this.tid][this.number];
  };

  async function getFrame(taskID, mode, frame) {
    if (!(taskID in frameDataCache)) {
      frameDataCache[taskID] = {};
      frameDataCache[taskID].meta = await serverProxy.frames.getMeta(taskID);
      frameCache[taskID] = {};
    }

    if (!(frame in frameDataCache[taskID])) {
      let size = null;

      if (mode === 'interpolation') {
        [size] = frameDataCache[taskID].meta;
      } else if (mode === 'annotation') {
        if (frame >= frameDataCache[taskID].meta.length) {
          throw new ArgumentError(`Meta information about frame ${frame} can't be received from the server`);
        } else {
          size = frameDataCache[taskID].meta[frame];
        }
      } else {
        throw new ArgumentError(`Invalid mode is specified ${mode}`);
      }

      frameDataCache[taskID][frame] = new FrameData(size.width, size.height, taskID, frame);
    }

    return frameDataCache[taskID][frame];
  }

  module.exports = {
    FrameData,
    getFrame
  };
})();
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/labels.js":
/*!***********************!*\
  !*** ./src/labels.js ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

__webpack_require__(/*! core-js/modules/web.url.to-json */ "./node_modules/core-js/modules/web.url.to-json.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const {
    AttributeType
  } = __webpack_require__(/*! ./enums */ "./src/enums.js");

  const {
    ArgumentError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");
  /**
      * Class representing an attribute
      * @memberof module:API.cvat.classes
      * @hideconstructor
  */


  class Attribute {
    constructor(initialData) {
      const data = {
        id: undefined,
        default_value: undefined,
        input_type: undefined,
        mutable: undefined,
        name: undefined,
        values: undefined
      };

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (Object.prototype.hasOwnProperty.call(initialData, key)) {
            if (Array.isArray(initialData[key])) {
              data[key] = [...initialData[key]];
            } else {
              data[key] = initialData[key];
            }
          }
        }
      }

      if (!Object.values(AttributeType).includes(data.input_type)) {
        throw new ArgumentError(`Got invalid attribute type ${data.input_type}`);
      }

      Object.defineProperties(this, Object.freeze({
        /**
            * @name id
            * @type {integer}
            * @memberof module:API.cvat.classes.Attribute
            * @readonly
            * @instance
        */
        id: {
          get: () => data.id
        },

        /**
            * @name defaultValue
            * @type {(string|integer|boolean)}
            * @memberof module:API.cvat.classes.Attribute
            * @readonly
            * @instance
        */
        defaultValue: {
          get: () => data.default_value
        },

        /**
            * @name inputType
            * @type {module:API.cvat.enums.AttributeType}
            * @memberof module:API.cvat.classes.Attribute
            * @readonly
            * @instance
        */
        inputType: {
          get: () => data.input_type
        },

        /**
            * @name mutable
            * @type {boolean}
            * @memberof module:API.cvat.classes.Attribute
            * @readonly
            * @instance
        */
        mutable: {
          get: () => data.mutable
        },

        /**
            * @name name
            * @type {string}
            * @memberof module:API.cvat.classes.Attribute
            * @readonly
            * @instance
        */
        name: {
          get: () => data.name
        },

        /**
            * @name values
            * @type {(string[]|integer[]|boolean[])}
            * @memberof module:API.cvat.classes.Attribute
            * @readonly
            * @instance
        */
        values: {
          get: () => [...data.values]
        }
      }));
    }

    toJSON() {
      const object = {
        name: this.name,
        mutable: this.mutable,
        input_type: this.inputType,
        default_value: this.defaultValue,
        values: this.values
      };

      if (typeof this.id !== 'undefined') {
        object.id = this.id;
      }

      return object;
    }

  }
  /**
      * Class representing a label
      * @memberof module:API.cvat.classes
      * @hideconstructor
  */


  class Label {
    constructor(initialData) {
      const data = {
        id: undefined,
        name: undefined
      };

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          if (Object.prototype.hasOwnProperty.call(initialData, key)) {
            data[key] = initialData[key];
          }
        }
      }

      data.attributes = [];

      if (Object.prototype.hasOwnProperty.call(initialData, 'attributes') && Array.isArray(initialData.attributes)) {
        for (const attrData of initialData.attributes) {
          data.attributes.push(new Attribute(attrData));
        }
      }

      Object.defineProperties(this, Object.freeze({
        /**
            * @name id
            * @type {integer}
            * @memberof module:API.cvat.classes.Label
            * @readonly
            * @instance
        */
        id: {
          get: () => data.id
        },

        /**
            * @name name
            * @type {string}
            * @memberof module:API.cvat.classes.Label
            * @readonly
            * @instance
        */
        name: {
          get: () => data.name
        },

        /**
            * @name attributes
            * @type {module:API.cvat.classes.Attribute[]}
            * @memberof module:API.cvat.classes.Label
            * @readonly
            * @instance
        */
        attributes: {
          get: () => [...data.attributes]
        }
      }));
    }

    toJSON() {
      const object = {
        name: this.name,
        attributes: [...this.attributes.map(el => el.toJSON())]
      };

      if (typeof this.id !== 'undefined') {
        object.id = this.id;
      }

      return object;
    }

  }

  module.exports = {
    Attribute,
    Label
  };
})();

/***/ }),

/***/ "./src/object-state.js":
/*!*****************************!*\
  !*** ./src/object-state.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const PluginRegistry = __webpack_require__(/*! ./plugins */ "./src/plugins.js");

  const {
    ArgumentError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");
  /**
      * Class representing a state of an object on a specific frame
      * @memberof module:API.cvat.classes
  */


  class ObjectState {
    /**
        * @param {Object} serialized - is an dictionary which contains
        * initial information about an ObjectState;
        * Necessary fields: objectType, shapeType
        * Necessary fields for objects which haven't been added to collection yet: frame
        * Optional fields: points, group, zOrder, outside, occluded,
        * attributes, lock, label, mode, color, keyframe, clientID, serverID
        * These fields can be set later via setters
    */
    constructor(serialized) {
      const data = {
        label: null,
        attributes: {},
        points: null,
        outside: null,
        occluded: null,
        keyframe: null,
        group: null,
        zOrder: null,
        lock: null,
        color: null,
        clientID: serialized.clientID,
        serverID: serialized.serverID,
        frame: serialized.frame,
        objectType: serialized.objectType,
        shapeType: serialized.shapeType,
        updateFlags: {}
      }; // Shows whether any properties updated since last reset() or interpolation

      Object.defineProperty(data.updateFlags, 'reset', {
        value: function reset() {
          this.label = false;
          this.attributes = false;
          this.points = false;
          this.outside = false;
          this.occluded = false;
          this.keyframe = false;
          this.group = false;
          this.zOrder = false;
          this.lock = false;
          this.color = false;
        },
        writable: false
      });
      Object.defineProperties(this, Object.freeze({
        // Internal property. We don't need document it.
        updateFlags: {
          get: () => data.updateFlags
        },
        frame: {
          /**
              * @name frame
              * @type {integer}
              * @memberof module:API.cvat.classes.ObjectState
              * @readonly
              * @instance
          */
          get: () => data.frame
        },
        objectType: {
          /**
              * @name objectType
              * @type {module:API.cvat.enums.ObjectType}
              * @memberof module:API.cvat.classes.ObjectState
              * @readonly
              * @instance
          */
          get: () => data.objectType
        },
        shapeType: {
          /**
              * @name shapeType
              * @type {module:API.cvat.enums.ObjectShape}
              * @memberof module:API.cvat.classes.ObjectState
              * @readonly
              * @instance
          */
          get: () => data.shapeType
        },
        clientID: {
          /**
              * @name clientID
              * @type {integer}
              * @memberof module:API.cvat.classes.ObjectState
              * @readonly
              * @instance
          */
          get: () => data.clientID
        },
        serverID: {
          /**
              * @name serverID
              * @type {integer}
              * @memberof module:API.cvat.classes.ObjectState
              * @readonly
              * @instance
          */
          get: () => data.serverID
        },
        label: {
          /**
              * @name shape
              * @type {module:API.cvat.classes.Label}
              * @memberof module:API.cvat.classes.ObjectState
              * @instance
          */
          get: () => data.label,
          set: labelInstance => {
            data.updateFlags.label = true;
            data.label = labelInstance;
          }
        },
        color: {
          /**
              * @name color
              * @type {string}
              * @memberof module:API.cvat.classes.ObjectState
              * @instance
          */
          get: () => data.color,
          set: color => {
            data.updateFlags.color = true;
            data.color = color;
          }
        },
        points: {
          /**
              * @name points
              * @type {number[]}
              * @memberof module:API.cvat.classes.ObjectState
              * @throws {module:API.cvat.exceptions.ArgumentError}
              * @instance
          */
          get: () => data.points,
          set: points => {
            if (Array.isArray(points)) {
              data.updateFlags.points = true;
              data.points = [...points];
            } else {
              throw new ArgumentError('Points are expected to be an array ' + `but got ${typeof points === 'object' ? points.constructor.name : typeof points}`);
            }
          }
        },
        group: {
          /**
              * @name group
              * @type {integer}
              * @memberof module:API.cvat.classes.ObjectState
              * @instance
          */
          get: () => data.group,
          set: group => {
            data.updateFlags.group = true;
            data.group = group;
          }
        },
        zOrder: {
          /**
              * @name zOrder
              * @type {integer}
              * @memberof module:API.cvat.classes.ObjectState
              * @instance
          */
          get: () => data.zOrder,
          set: zOrder => {
            data.updateFlags.zOrder = true;
            data.zOrder = zOrder;
          }
        },
        outside: {
          /**
              * @name outside
              * @type {boolean}
              * @memberof module:API.cvat.classes.ObjectState
              * @instance
          */
          get: () => data.outside,
          set: outside => {
            data.updateFlags.outside = true;
            data.outside = outside;
          }
        },
        keyframe: {
          /**
              * @name keyframe
              * @type {boolean}
              * @memberof module:API.cvat.classes.ObjectState
              * @instance
          */
          get: () => data.keyframe,
          set: keyframe => {
            data.updateFlags.keyframe = true;
            data.keyframe = keyframe;
          }
        },
        occluded: {
          /**
              * @name occluded
              * @type {boolean}
              * @memberof module:API.cvat.classes.ObjectState
              * @instance
          */
          get: () => data.occluded,
          set: occluded => {
            data.updateFlags.occluded = true;
            data.occluded = occluded;
          }
        },
        lock: {
          /**
              * @name lock
              * @type {boolean}
              * @memberof module:API.cvat.classes.ObjectState
              * @instance
          */
          get: () => data.lock,
          set: lock => {
            data.updateFlags.lock = true;
            data.lock = lock;
          }
        },
        attributes: {
          /**
              * Object is id:value pairs where "id" is an integer
              * attribute identifier and "value" is an attribute value
              * @name attributes
              * @type {Object}
              * @memberof module:API.cvat.classes.ObjectState
              * @throws {module:API.cvat.exceptions.ArgumentError}
              * @instance
          */
          get: () => data.attributes,
          set: attributes => {
            if (typeof attributes !== 'object') {
              throw new ArgumentError('Attributes are expected to be an object ' + `but got ${typeof attributes === 'object' ? attributes.constructor.name : typeof attributes}`);
            }

            for (const attrID of Object.keys(attributes)) {
              data.updateFlags.attributes = true;
              data.attributes[attrID] = attributes[attrID];
            }
          }
        }
      }));
      this.label = serialized.label;
      this.group = serialized.group;
      this.zOrder = serialized.zOrder;
      this.outside = serialized.outside;
      this.keyframe = serialized.keyframe;
      this.occluded = serialized.occluded;
      this.color = serialized.color;
      this.lock = serialized.lock; // It can be undefined in a constructor and it can be defined later

      if (typeof serialized.points !== 'undefined') {
        this.points = serialized.points;
      }

      if (typeof serialized.attributes !== 'undefined') {
        this.attributes = serialized.attributes;
      }

      data.updateFlags.reset();
    }
    /**
        * Method saves/updates an object state in a collection
        * @method save
        * @memberof module:API.cvat.classes.ObjectState
        * @readonly
        * @instance
        * @async
        * @throws {module:API.cvat.exceptions.PluginError}
        * @throws {module:API.cvat.exceptions.ArgumentError}
        * @returns {module:API.cvat.classes.ObjectState} updated state of an object
    */


    async save() {
      const result = await PluginRegistry.apiWrapper.call(this, ObjectState.prototype.save);
      return result;
    }
    /**
        * Method deletes an object from a collection
        * @method delete
        * @memberof module:API.cvat.classes.ObjectState
        * @readonly
        * @instance
        * @param {boolean} [force=false] delete object even if it is locked
        * @async
        * @returns {boolean} true if object has been deleted
        * @throws {module:API.cvat.exceptions.PluginError}
    */


    async delete(force = false) {
      const result = await PluginRegistry.apiWrapper.call(this, ObjectState.prototype.delete, force);
      return result;
    }
    /**
        * Set the highest ZOrder within a frame
        * @method up
        * @memberof module:API.cvat.classes.ObjectState
        * @readonly
        * @instance
        * @async
        * @throws {module:API.cvat.exceptions.PluginError}
    */


    async up() {
      const result = await PluginRegistry.apiWrapper.call(this, ObjectState.prototype.up);
      return result;
    }
    /**
        * Set the lowest ZOrder within a frame
        * @method down
        * @memberof module:API.cvat.classes.ObjectState
        * @readonly
        * @instance
        * @async
        * @throws {module:API.cvat.exceptions.PluginError}
    */


    async down() {
      const result = await PluginRegistry.apiWrapper.call(this, ObjectState.prototype.down);
      return result;
    }

  } // Default implementation saves element in collection


  ObjectState.prototype.save.implementation = async function () {
    if (this.hidden && this.hidden.save) {
      return this.hidden.save();
    }

    return this;
  }; // Default implementation do nothing


  ObjectState.prototype.delete.implementation = async function (force) {
    if (this.hidden && this.hidden.delete) {
      return this.hidden.delete(force);
    }

    return false;
  };

  ObjectState.prototype.up.implementation = async function () {
    if (this.hidden && this.hidden.up) {
      return this.hidden.up();
    }

    return false;
  };

  ObjectState.prototype.down.implementation = async function () {
    if (this.hidden && this.hidden.down) {
      return this.hidden.down();
    }

    return false;
  };

  module.exports = ObjectState;
})();

/***/ }),

/***/ "./src/plugins.js":
/*!************************!*\
  !*** ./src/plugins.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.symbol.description */ "./node_modules/core-js/modules/es.symbol.description.js");

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const {
    PluginError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");

  const plugins = [];

  class PluginRegistry {
    static async apiWrapper(wrappedFunc, ...args) {
      // I have to optimize the wrapper
      const pluginList = await PluginRegistry.list();

      for (const plugin of pluginList) {
        const pluginDecorators = plugin.functions.filter(obj => obj.callback === wrappedFunc)[0];

        if (pluginDecorators && pluginDecorators.enter) {
          try {
            await pluginDecorators.enter.call(this, plugin, ...args);
          } catch (exception) {
            if (exception instanceof PluginError) {
              throw exception;
            } else {
              throw new PluginError(`Exception in plugin ${plugin.name}: ${exception.toString()}`);
            }
          }
        }
      }

      let result = await wrappedFunc.implementation.call(this, ...args);

      for (const plugin of pluginList) {
        const pluginDecorators = plugin.functions.filter(obj => obj.callback === wrappedFunc)[0];

        if (pluginDecorators && pluginDecorators.leave) {
          try {
            result = await pluginDecorators.leave.call(this, plugin, result, ...args);
          } catch (exception) {
            if (exception instanceof PluginError) {
              throw exception;
            } else {
              throw new PluginError(`Exception in plugin ${plugin.name}: ${exception.toString()}`);
            }
          }
        }
      }

      return result;
    } // Called with cvat context


    static async register(plug) {
      const functions = [];

      if (typeof plug !== 'object') {
        throw new PluginError(`Plugin should be an object, but got "${typeof plug}"`);
      }

      if (!('name' in plug) || typeof plug.name !== 'string') {
        throw new PluginError('Plugin must contain a "name" field and it must be a string');
      }

      if (!('description' in plug) || typeof plug.description !== 'string') {
        throw new PluginError('Plugin must contain a "description" field and it must be a string');
      }

      if ('functions' in plug) {
        throw new PluginError('Plugin must not contain a "functions" field');
      }

      (function traverse(plugin, api) {
        const decorator = {};

        for (const key in plugin) {
          if (Object.prototype.hasOwnProperty.call(plugin, key)) {
            if (typeof plugin[key] === 'object') {
              if (Object.prototype.hasOwnProperty.call(api, key)) {
                traverse(plugin[key], api[key]);
              }
            } else if (['enter', 'leave'].includes(key) && typeof api === 'function' && typeof (plugin[key] === 'function')) {
              decorator.callback = api;
              decorator[key] = plugin[key];
            }
          }
        }

        if (Object.keys(decorator).length) {
          functions.push(decorator);
        }
      })(plug, {
        cvat: this
      });

      Object.defineProperty(plug, 'functions', {
        value: functions,
        writable: false
      });
      plugins.push(plug);
    }

    static async list() {
      return plugins;
    }

  }

  module.exports = PluginRegistry;
})();

/***/ }),

/***/ "./src/server-proxy.js":
/*!*****************************!*\
  !*** ./src/server-proxy.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

__webpack_require__(/*! core-js/modules/es.string.replace */ "./node_modules/core-js/modules/es.string.replace.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
    encodeURIComponent:false
*/
(() => {
  const FormData = __webpack_require__(/*! form-data */ "./node_modules/form-data/lib/browser.js");

  const {
    ServerError,
    ScriptingError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");

  const config = __webpack_require__(/*! ./config */ "./src/config.js");

  class ServerProxy {
    constructor() {
      const Cookie = __webpack_require__(/*! js-cookie */ "./node_modules/js-cookie/src/js.cookie.js");

      const Axios = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");

      function setCSRFHeader(header) {
        Axios.defaults.headers.delete['X-CSRFToken'] = header;
        Axios.defaults.headers.patch['X-CSRFToken'] = header;
        Axios.defaults.headers.post['X-CSRFToken'] = header;
        Axios.defaults.headers.put['X-CSRFToken'] = header; // Allows to move authentification headers to backend

        Axios.defaults.withCredentials = true;
      }

      async function about() {
        const {
          backendAPI
        } = config;
        let response = null;

        try {
          response = await Axios.get(`${backendAPI}/server/about`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not get "about" information from the server', code);
        }

        return response.data;
      }

      async function share(directory) {
        const {
          backendAPI
        } = config;
        directory = encodeURIComponent(directory);
        let response = null;

        try {
          response = await Axios.get(`${backendAPI}/server/share?directory=${directory}`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not get "share" information from the server', code);
        }

        return response.data;
      }

      async function exception(exceptionObject) {
        const {
          backendAPI
        } = config;

        try {
          await Axios.post(`${backendAPI}/server/exception`, JSON.stringify(exceptionObject), {
            proxy: config.proxy,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not send an exception to the server', code);
        }
      }

      async function login(username, password) {
        function setCookie(response) {
          if (response.headers['set-cookie']) {
            // Browser itself setup cookie and header is none
            // In NodeJS we need do it manually
            let cookies = '';

            for (let cookie of response.headers['set-cookie']) {
              [cookie] = cookie.split(';'); // truncate extra information

              const name = cookie.split('=')[0];
              const value = cookie.split('=')[1];

              if (name === 'csrftoken') {
                setCSRFHeader(value);
              }

              Cookie.set(name, value);
              cookies += `${cookie};`;
            }

            Axios.defaults.headers.common.Cookie = cookies;
          } else {
            // Browser code. We need set additinal header for authentification
            let csrftoken = response.data.csrf;

            if (csrftoken) {
              setCSRFHeader(csrftoken);
              Cookie.set('csrftoken', csrftoken);
            } else {
              csrftoken = Cookie.get('csrftoken');

              if (csrftoken) {
                setCSRFHeader(csrftoken);
              } else {
                throw new ScriptingError('An environment has been detected as a browser' + ', but CSRF token has not been found in cookies');
              }
            }
          }
        }

        const host = config.backendAPI.slice(0, -7);
        let csrf = null;

        try {
          csrf = await Axios.get(`${host}/auth/csrf`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not get CSRF token from a server', code);
        }

        setCookie(csrf);
        const authentificationData = [`${encodeURIComponent('username')}=${encodeURIComponent(username)}`, `${encodeURIComponent('password')}=${encodeURIComponent(password)}`].join('&').replace(/%20/g, '+');
        let authentificationResponse = null;

        try {
          authentificationResponse = await Axios.post(`${host}/auth/login`, authentificationData, {
            'Content-Type': 'application/x-www-form-urlencoded',
            proxy: config.proxy,
            // do not redirect to a dashboard,
            // otherwise we don't get a session id in a response
            maxRedirects: 0
          });
        } catch (errorData) {
          if (errorData.response.status === 302) {
            // Redirection code expected
            authentificationResponse = errorData.response;
          } else {
            const code = errorData.response ? errorData.response.status : errorData.code;
            throw new ServerError('Could not login on a server', code);
          }
        } // TODO: Perhaps we should redesign the authorization method on the server.


        if (authentificationResponse.data.includes('didn\'t match')) {
          throw new ServerError('The pair login/password is invalid', 403);
        }

        setCookie(authentificationResponse);
      }

      async function logout() {
        const host = config.backendAPI.slice(0, -7);

        try {
          await Axios.get(`${host}/auth/logout`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not logout from the server', code);
        }
      }

      async function getTasks(filter = '') {
        const {
          backendAPI
        } = config;
        let response = null;

        try {
          response = await Axios.get(`${backendAPI}/tasks?${filter}`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not get tasks from a server', code);
        }

        response.data.results.count = response.data.count;
        return response.data.results;
      }

      async function saveTask(id, taskData) {
        const {
          backendAPI
        } = config;

        try {
          await Axios.patch(`${backendAPI}/tasks/${id}`, JSON.stringify(taskData), {
            proxy: config.proxy,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not save the task on the server', code);
        }
      }

      async function deleteTask(id) {
        const {
          backendAPI
        } = config;

        try {
          await Axios.delete(`${backendAPI}/tasks/${id}`);
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          const data = (errorData.response || {}).data || errorData.message;
          throw new ServerError('Could not delete the task from the server' + `${typeof data === 'string' ? data : JSON.stringify(data)}.`, code);
        }
      }

      async function createTask(taskData, files, onUpdate) {
        const {
          backendAPI
        } = config;

        async function wait(id) {
          return new Promise((resolve, reject) => {
            async function checkStatus() {
              try {
                const response = await Axios.get(`${backendAPI}/tasks/${id}/status`);

                if (['Queued', 'Started'].includes(response.data.state)) {
                  if (response.data.message !== '') {
                    onUpdate(response.data.message);
                  }

                  setTimeout(checkStatus, 1000);
                } else if (response.data.state === 'Finished') {
                  resolve();
                } else if (response.data.state === 'Failed') {
                  // If request has been successful, but task hasn't been created
                  // Then passed data is wrong and we can pass code 400
                  reject(new ServerError('Could not create the task on the server. ' + `${response.data.message}.`, 400));
                } else {
                  // If server has another status, it is unexpected
                  // Therefore it is server error and we can pass code 500
                  reject(new ServerError(`Unknown task state has been recieved: ${response.data.state}` + `${response.data.message}.`, 500));
                }
              } catch (errorData) {
                const code = errorData.response ? errorData.response.status : errorData.code;
                const data = (errorData.response || {}).data || errorData.message;
                reject(new ServerError('Data uploading error occured. ' + `${typeof data === 'string' ? data : JSON.stringify(data)}.`, code));
              }
            }

            setTimeout(checkStatus, 1000);
          });
        }

        const batchOfFiles = new FormData();

        for (const key in files) {
          if (Object.prototype.hasOwnProperty.call(files, key)) {
            for (let i = 0; i < files[key].length; i++) {
              batchOfFiles.append(`${key}[${i}]`, files[key][i]);
            }
          }
        }

        let response = null;
        onUpdate('The task is being created on the server..');

        try {
          response = await Axios.post(`${backendAPI}/tasks`, JSON.stringify(taskData), {
            proxy: config.proxy,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          const data = (errorData.response || {}).data || errorData.message;
          throw new ServerError('Could not put data to the server. ' + `${typeof data === 'string' ? data : JSON.stringify(data)}.`, code);
        }

        onUpdate('The data is being uploaded to the server..');

        try {
          await Axios.post(`${backendAPI}/tasks/${response.data.id}/data`, batchOfFiles, {
            proxy: config.proxy
          });
        } catch (errorData) {
          await deleteTask(response.data.id);
          const code = errorData.response ? errorData.response.status : errorData.code;
          const data = (errorData.response || {}).data || errorData.message;
          throw new ServerError('Could not put data to the server. ' + `${typeof data === 'string' ? data : JSON.stringify(data)}.`, code);
        }

        try {
          await wait(response.data.id);
        } catch (createException) {
          await deleteTask(response.data.id);
          throw createException;
        }

        const createdTask = await getTasks(`?id=${response.id}`);
        return createdTask[0];
      }

      async function getJob(jobID) {
        const {
          backendAPI
        } = config;
        let response = null;

        try {
          response = await Axios.get(`${backendAPI}/jobs/${jobID}`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not get jobs from a server', code);
        }

        return response.data;
      }

      async function saveJob(id, jobData) {
        const {
          backendAPI
        } = config;

        try {
          await Axios.patch(`${backendAPI}/jobs/${id}`, JSON.stringify(jobData), {
            proxy: config.proxy,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not save the job on the server', code);
        }
      }

      async function getUsers() {
        const {
          backendAPI
        } = config;
        let response = null;

        try {
          response = await Axios.get(`${backendAPI}/users`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not get users from the server', code);
        }

        return response.data.results;
      }

      async function getSelf() {
        const {
          backendAPI
        } = config;
        let response = null;

        try {
          response = await Axios.get(`${backendAPI}/users/self`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not get users from the server', code);
        }

        return response.data;
      }

      async function register(data) {
        const host = config.backendAPI.slice(0, -7);
        const registrationData = [`${encodeURIComponent('username')}=${encodeURIComponent(data.username)}`, `${encodeURIComponent('first_name')}=${encodeURIComponent(data.firstName)}`, `${encodeURIComponent('last_name')}=${encodeURIComponent(data.lastName)}`, `${encodeURIComponent('email')}=${encodeURIComponent(data.email)}`, `${encodeURIComponent('password1')}=${encodeURIComponent(data.password1)}`, `${encodeURIComponent('password2')}=${encodeURIComponent(data.password2)}`].join('&').replace(/%20/g, '+');
        let response = null;

        try {
          response = await Axios.post(`${host}/auth/register`, registrationData, {
            'Content-Type': 'application/x-www-form-urlencoded',
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError('Could not get users from the server', code);
        }

        return response.data;
      }

      async function getData(tid, frame) {
        const {
          backendAPI
        } = config;
        let response = null;

        try {
          response = await Axios.get(`${backendAPI}/tasks/${tid}/frames/${frame}`, {
            proxy: config.proxy,
            responseType: 'blob'
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError(`Could not get frame ${frame} for the task ${tid} from the server`, code);
        }

        return response.data;
      }

      async function getMeta(tid) {
        const {
          backendAPI
        } = config;
        let response = null;

        try {
          response = await Axios.get(`${backendAPI}/tasks/${tid}/frames/meta`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError(`Could not get frame meta info for the task ${tid} from the server`, code);
        }

        return response.data;
      } // Session is 'task' or 'job'


      async function getAnnotations(session, id) {
        const {
          backendAPI
        } = config;
        let response = null;

        try {
          response = await Axios.get(`${backendAPI}/${session}s/${id}/annotations`, {
            proxy: config.proxy
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError(`Could not get annotations for the ${session} ${id} from the server`, code);
        }

        return response.data;
      } // Session is 'task' or 'job'


      async function updateAnnotations(session, id, data, action) {
        const {
          backendAPI
        } = config;
        let requestFunc = null;
        let url = null;

        if (action.toUpperCase() === 'PUT') {
          requestFunc = Axios.put.bind(Axios);
          url = `${backendAPI}/${session}s/${id}/annotations`;
        } else {
          requestFunc = Axios.patch.bind(Axios);
          url = `${backendAPI}/${session}s/${id}/annotations?action=${action}`;
        }

        let response = null;

        try {
          response = await requestFunc(url, JSON.stringify(data), {
            proxy: config.proxy,
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } catch (errorData) {
          const code = errorData.response ? errorData.response.status : errorData.code;
          throw new ServerError(`Could not updated annotations for the ${session} ${id} on the server`, code);
        }

        return response.data;
      } // Session is 'task' or 'job'


      async function uploadAnnotations(session, id, file, format) {
        const {
          backendAPI
        } = config;
        let annotationData = new FormData();
        annotationData.append('annotation_file', file);
        return new Promise((resolve, reject) => {
          async function request() {
            try {
              const response = await Axios.post(`${backendAPI}/${session}s/${id}/annotations?upload_format=${format}`, annotationData, {
                proxy: config.proxy
              });

              if (response.status === 202) {
                annotationData = new FormData();
                setTimeout(request, 3000);
              } else {
                resolve();
              }
            } catch (errorData) {
              const code = errorData.response ? errorData.response.status : errorData.code;
              const error = new ServerError(`Could not upload annotations for the ${session} ${id}`, code);
              reject(error);
            }
          }

          setTimeout(request);
        });
      } // Session is 'task' or 'job'


      async function dumpAnnotations(id, name, format) {
        const {
          backendAPI
        } = config;
        const filename = name.replace(/\//g, '_');
        let url = `${backendAPI}/tasks/${id}/annotations/${filename}?dump_format=${format}`;
        return new Promise((resolve, reject) => {
          async function request() {
            try {
              const response = await Axios.get(`${url}`, {
                proxy: config.proxy
              });

              if (response.status === 202) {
                setTimeout(request, 3000);
              } else {
                url = `${url}&action=download`;
                resolve(url);
              }
            } catch (errorData) {
              const code = errorData.response ? errorData.response.status : errorData.code;
              const error = new ServerError(`Could not dump annotations for the task ${id} from the server`, code);
              reject(error);
            }
          }

          setTimeout(request);
        });
      } // Set csrftoken header from browser cookies if it exists
      // NodeJS env returns 'undefined'
      // So in NodeJS we need login after each run


      const csrftoken = Cookie.get('csrftoken');

      if (csrftoken) {
        setCSRFHeader(csrftoken);
      }

      Object.defineProperties(this, Object.freeze({
        server: {
          value: Object.freeze({
            about,
            share,
            exception,
            login,
            logout
          }),
          writable: false
        },
        tasks: {
          value: Object.freeze({
            getTasks,
            saveTask,
            createTask,
            deleteTask
          }),
          writable: false
        },
        jobs: {
          value: Object.freeze({
            getJob,
            saveJob
          }),
          writable: false
        },
        users: {
          value: Object.freeze({
            getUsers,
            getSelf,
            register
          }),
          writable: false
        },
        frames: {
          value: Object.freeze({
            getData,
            getMeta
          }),
          writable: false
        },
        annotations: {
          value: Object.freeze({
            updateAnnotations,
            getAnnotations,
            dumpAnnotations,
            uploadAnnotations
          }),
          writable: false
        }
      }));
    }

  }

  const serverProxy = new ServerProxy();
  module.exports = serverProxy;
})();

/***/ }),

/***/ "./src/session.js":
/*!************************!*\
  !*** ./src/session.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.array.iterator */ "./node_modules/core-js/modules/es.array.iterator.js");

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

__webpack_require__(/*! core-js/modules/es.string.trim */ "./node_modules/core-js/modules/es.string.trim.js");

__webpack_require__(/*! core-js/modules/web.dom-collections.iterator */ "./node_modules/core-js/modules/web.dom-collections.iterator.js");

__webpack_require__(/*! core-js/modules/web.url.to-json */ "./node_modules/core-js/modules/web.url.to-json.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const PluginRegistry = __webpack_require__(/*! ./plugins */ "./src/plugins.js");

  const serverProxy = __webpack_require__(/*! ./server-proxy */ "./src/server-proxy.js");

  const {
    getFrame
  } = __webpack_require__(/*! ./frames */ "./src/frames.js");

  const {
    ArgumentError
  } = __webpack_require__(/*! ./exceptions */ "./src/exceptions.js");

  const {
    TaskStatus
  } = __webpack_require__(/*! ./enums */ "./src/enums.js");

  const {
    Label
  } = __webpack_require__(/*! ./labels */ "./src/labels.js");

  function buildDublicatedAPI(prototype) {
    Object.defineProperties(prototype, {
      annotations: Object.freeze({
        value: {
          async upload(file, format) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.upload, file, format);
            return result;
          },

          async save() {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.save);
            return result;
          },

          async clear(reload = false) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.clear, reload);
            return result;
          },

          async dump(name, format) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.dump, name, format);
            return result;
          },

          async statistics() {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.statistics);
            return result;
          },

          async put(arrayOfObjects = []) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.put, arrayOfObjects);
            return result;
          },

          async get(frame, filter = {}) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.get, frame, filter);
            return result;
          },

          async search(filter, frameFrom, frameTo) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.search, filter, frameFrom, frameTo);
            return result;
          },

          async select(objectStates, x, y) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.select, objectStates, x, y);
            return result;
          },

          async hasUnsavedChanges() {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.hasUnsavedChanges);
            return result;
          },

          async merge(objectStates) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.merge, objectStates);
            return result;
          },

          async split(objectState, frame) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.split, objectState, frame);
            return result;
          },

          async group(objectStates, reset = false) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.annotations.group, objectStates, reset);
            return result;
          }

        },
        writable: true
      }),
      frames: Object.freeze({
        value: {
          async get(frame) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.frames.get, frame);
            return result;
          }

        },
        writable: true
      }),
      logs: Object.freeze({
        value: {
          async put(logType, details) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.logs.put, logType, details);
            return result;
          },

          async save(onUpdate) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.logs.save, onUpdate);
            return result;
          }

        },
        writable: true
      }),
      actions: Object.freeze({
        value: {
          async undo(count) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.actions.undo, count);
            return result;
          },

          async redo(count) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.actions.redo, count);
            return result;
          },

          async clear() {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.actions.clear);
            return result;
          }

        },
        writable: true
      }),
      events: Object.freeze({
        value: {
          async subscribe(evType, callback) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.events.subscribe, evType, callback);
            return result;
          },

          async unsubscribe(evType, callback = null) {
            const result = await PluginRegistry.apiWrapper.call(this, prototype.events.unsubscribe, evType, callback);
            return result;
          }

        },
        writable: true
      })
    });
  }
  /**
      * Base abstract class for Task and Job. It contains common members.
      * @hideconstructor
      * @virtual
  */


  class Session {
    constructor() {
      /**
          * An interaction with annotations
          * @namespace annotations
          * @memberof Session
      */

      /**
          * Upload annotations from a dump file
          * You need upload annotations from a server again after successful executing
          * @method upload
          * @memberof Session.annotations
          * @param {File} annotations - a text file with annotations
          * @param {string} format - a format of the file
          * @instance
          * @async
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
      */

      /**
          * Save all changes in annotations on a server
          * Objects which hadn't been saved on a server before,
          * get a serverID after saving. But received object states aren't updated.
          * So, after successful saving it's recommended to update them manually
          * (call the annotations.get() again)
          * @method save
          * @memberof Session.annotations
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
          * @instance
          * @async
          * @param {function} [onUpdate] saving can be long.
          * This callback can be used to notify a user about current progress
          * Its argument is a text string
      */

      /**
          * Remove all annotations and optionally reinitialize it
          * @method clear
          * @memberof Session.annotations
          * @param {boolean} [reload = false] reset all changes and
          * reinitialize annotations by data from a server
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @throws {module:API.cvat.exceptions.ServerError}
          * @instance
          * @async
      */

      /**
          * Dump of annotations to a file.
          * Method always dumps annotations for a whole task.
          * @method dump
          * @memberof Session.annotations
          * @param {string} name - a name of a file with annotations
          * @param {string} format - a format of the file
          * @returns {string} URL which can be used in order to get a dump file
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
          * @instance
          * @async
      */

      /**
          * Collect short statistics about a task or a job.
          * @method statistics
          * @memberof Session.annotations
          * @returns {module:API.cvat.classes.Statistics} statistics object
          * @throws {module:API.cvat.exceptions.PluginError}
          * @instance
          * @async
      */

      /**
          * Create new objects from one-frame states
          * After successful adding you need to update object states on a frame
          * @method put
          * @memberof Session.annotations
          * @param {module:API.cvat.classes.ObjectState[]} data
          * array of objects on the specific frame
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.DataError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @instance
          * @async
      */

      /**
          * @typedef {Object} ObjectFilter
          * @property {string} [label] a name of a label
          * @property {module:API.cvat.enums.ObjectType} [type]
          * @property {module:API.cvat.enums.ObjectShape} [shape]
          * @property {boolean} [occluded] a value of occluded property
          * @property {boolean} [lock] a value of lock property
          * @property {number} [width] a width of a shape
          * @property {number} [height] a height of a shape
          * @property {Object[]} [attributes] dictionary with "name: value" pairs
          * @global
      */

      /**
          * Get annotations for a specific frame
          * @method get
          * @param {integer} frame get objects from the frame
          * @param {ObjectFilter[]} [filter = []]
          * get only objects are satisfied to specific filter
          * @returns {module:API.cvat.classes.ObjectState[]}
          * @memberof Session.annotations
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @instance
          * @async
      */

      /**
          * Find frame which contains at least one object satisfied to a filter
          * @method search
          * @memberof Session.annotations
          * @param {ObjectFilter} [filter = []] filter
          * @param {integer} from lower bound of a search
          * @param {integer} to upper bound of a search
          * @returns {integer} the nearest frame which contains filtered objects
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @instance
          * @async
      */

      /**
          * Select shape under a cursor by using minimal distance
          * between a cursor and a shape edge or a shape point
          * For closed shapes a cursor is placed inside a shape
          * @method select
          * @memberof Session.annotations
          * @param {module:API.cvat.classes.ObjectState[]} objectStates
          * objects which can be selected
          * @param {float} x horizontal coordinate
          * @param {float} y vertical coordinate
          * @returns {Object}
          * a pair of {state: ObjectState, distance: number} for selected object.
          * Pair values can be null if there aren't any sutisfied objects
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @instance
          * @async
      */

      /**
          * Method unites several shapes and tracks into the one
          * All shapes must be the same (rectangle, polygon, etc)
          * All labels must be the same
          * After successful merge you need to update object states on a frame
          * @method merge
          * @memberof Session.annotations
          * @param {module:API.cvat.classes.ObjectState[]} objectStates
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @instance
          * @async
      */

      /**
          * Method splits a track into two parts
          * (start frame: previous frame), (frame, last frame)
          * After successful split you need to update object states on a frame
          * @method split
          * @memberof Session.annotations
          * @param {module:API.cvat.classes.ObjectState} objectState
          * @param {integer} frame
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @instance
          * @async
      */

      /**
          * Method creates a new group and put all passed objects into it
          * After successful split you need to update object states on a frame
          * @method group
          * @memberof Session.annotations
          * @param {module:API.cvat.classes.ObjectState[]} objectStates
          * @param {boolean} reset pass "true" to reset group value (set it to 0)
          * @returns {integer} an ID of created group
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @instance
          * @async
      */

      /**
          * Indicate if there are any changes in
          * annotations which haven't been saved on a server
          * @method hasUnsavedChanges
          * @memberof Session.annotations
          * @returns {boolean}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @instance
          * @async
      */

      /**
          * Namespace is used for an interaction with frames
          * @namespace frames
          * @memberof Session
      */

      /**
          * Get frame by its number
          * @method get
          * @memberof Session.frames
          * @param {integer} frame number of frame which you want to get
          * @returns {module:API.cvat.classes.FrameData}
          * @instance
          * @async
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
      */

      /**
          * Namespace is used for an interaction with logs
          * @namespace logs
          * @memberof Session
      */

      /**
          * Append log to a log collection.
          * Continue logs will have been added after "close" method is called
          * @method put
          * @memberof Session.logs
          * @param {module:API.cvat.enums.LogType} type a type of a log
          * @param {boolean} continuous log is a continuous log
          * @param {Object} details any others data which will be append to log data
          * @returns {module:API.cvat.classes.Log}
          * @instance
          * @async
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
      */

      /**
          * Save accumulated logs on a server
          * @method save
          * @memberof Session.logs
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ServerError}
          * @instance
          * @async
      */

      /**
          * Namespace is used for an interaction with actions
          * @namespace actions
          * @memberof Session
      */

      /**
          * Is a dictionary of pairs "id:action" where "id" is an identifier of an object
          * which has been affected by undo/redo and "action" is what exactly has been
          * done with the object. Action can be: "created", "deleted", "updated".
          * Size of an output array equal the param "count".
          * @typedef {Object} HistoryAction
          * @global
      */

      /**
          * Undo actions
          * @method undo
          * @memberof Session.actions
          * @returns {HistoryAction}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @instance
          * @async
      */

      /**
          * Redo actions
          * @method redo
          * @memberof Session.actions
          * @returns {HistoryAction}
          * @throws {module:API.cvat.exceptions.PluginError}
          * @instance
          * @async
      */

      /**
          * Namespace is used for an interaction with events
          * @namespace events
          * @memberof Session
      */

      /**
          * Subscribe on an event
          * @method subscribe
          * @memberof Session.events
          * @param {module:API.cvat.enums.EventType} type - event type
          * @param {functions} callback - function which will be called on event
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @instance
          * @async
      */

      /**
          * Unsubscribe from an event. If callback is not provided,
          * all callbacks will be removed from subscribers for the event
          * @method unsubscribe
          * @memberof Session.events
          * @param {module:API.cvat.enums.EventType} type - event type
          * @param {functions} [callback = null] - function which is called on event
          * @throws {module:API.cvat.exceptions.PluginError}
          * @throws {module:API.cvat.exceptions.ArgumentError}
          * @instance
          * @async
      */
    }

  }
  /**
      * Class representing a job.
      * @memberof module:API.cvat.classes
      * @hideconstructor
      * @extends Session
  */


  class Job extends Session {
    constructor(initialData) {
      super();
      const data = {
        id: undefined,
        assignee: undefined,
        status: undefined,
        start_frame: undefined,
        stop_frame: undefined,
        task: undefined
      };

      for (const property in data) {
        if (Object.prototype.hasOwnProperty.call(data, property)) {
          if (property in initialData) {
            data[property] = initialData[property];
          }

          if (data[property] === undefined) {
            throw new ArgumentError(`Job field "${property}" was not initialized`);
          }
        }
      }

      Object.defineProperties(this, Object.freeze({
        /**
            * @name id
            * @type {integer}
            * @memberof module:API.cvat.classes.Job
            * @readonly
            * @instance
        */
        id: {
          get: () => data.id
        },

        /**
            * Identifier of a user who is responsible for the job
            * @name assignee
            * @type {integer}
            * @memberof module:API.cvat.classes.Job
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        assignee: {
          get: () => data.assignee,
          set: () => assignee => {
            if (!Number.isInteger(assignee) || assignee < 0) {
              throw new ArgumentError('Value must be a non negative integer');
            }

            data.assignee = assignee;
          }
        },

        /**
            * @name status
            * @type {module:API.cvat.enums.TaskStatus}
            * @memberof module:API.cvat.classes.Job
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        status: {
          get: () => data.status,
          set: status => {
            const type = TaskStatus;
            let valueInEnum = false;

            for (const value in type) {
              if (type[value] === status) {
                valueInEnum = true;
                break;
              }
            }

            if (!valueInEnum) {
              throw new ArgumentError('Value must be a value from the enumeration cvat.enums.TaskStatus');
            }

            data.status = status;
          }
        },

        /**
            * @name startFrame
            * @type {integer}
            * @memberof module:API.cvat.classes.Job
            * @readonly
            * @instance
        */
        startFrame: {
          get: () => data.start_frame
        },

        /**
            * @name stopFrame
            * @type {integer}
            * @memberof module:API.cvat.classes.Job
            * @readonly
            * @instance
        */
        stopFrame: {
          get: () => data.stop_frame
        },

        /**
            * @name task
            * @type {module:API.cvat.classes.Task}
            * @memberof module:API.cvat.classes.Job
            * @readonly
            * @instance
        */
        task: {
          get: () => data.task
        }
      })); // When we call a function, for example: task.annotations.get()
      // In the method get we lose the task context
      // So, we need return it

      this.annotations = {
        get: Object.getPrototypeOf(this).annotations.get.bind(this),
        put: Object.getPrototypeOf(this).annotations.put.bind(this),
        save: Object.getPrototypeOf(this).annotations.save.bind(this),
        dump: Object.getPrototypeOf(this).annotations.dump.bind(this),
        merge: Object.getPrototypeOf(this).annotations.merge.bind(this),
        split: Object.getPrototypeOf(this).annotations.split.bind(this),
        group: Object.getPrototypeOf(this).annotations.group.bind(this),
        clear: Object.getPrototypeOf(this).annotations.clear.bind(this),
        upload: Object.getPrototypeOf(this).annotations.upload.bind(this),
        select: Object.getPrototypeOf(this).annotations.select.bind(this),
        statistics: Object.getPrototypeOf(this).annotations.statistics.bind(this),
        hasUnsavedChanges: Object.getPrototypeOf(this).annotations.hasUnsavedChanges.bind(this)
      };
      this.frames = {
        get: Object.getPrototypeOf(this).frames.get.bind(this)
      };
    }
    /**
        * Method updates job data like status or assignee
        * @method save
        * @memberof module:API.cvat.classes.Job
        * @readonly
        * @instance
        * @async
        * @throws {module:API.cvat.exceptions.ServerError}
        * @throws {module:API.cvat.exceptions.PluginError}
    */


    async save() {
      const result = await PluginRegistry.apiWrapper.call(this, Job.prototype.save);
      return result;
    }

  }
  /**
      * Class representing a task
      * @memberof module:API.cvat.classes
      * @extends Session
  */


  class Task extends Session {
    /**
        * In a fact you need use the constructor only if you want to create a task
        * @param {object} initialData - Object which is used for initalization
        * <br> It can contain keys:
        * <br> <li style="margin-left: 10px;"> name
        * <br> <li style="margin-left: 10px;"> assignee
        * <br> <li style="margin-left: 10px;"> bug_tracker
        * <br> <li style="margin-left: 10px;"> z_order
        * <br> <li style="margin-left: 10px;"> labels
        * <br> <li style="margin-left: 10px;"> segment_size
        * <br> <li style="margin-left: 10px;"> overlap
    */
    constructor(initialData) {
      super();
      const data = {
        id: undefined,
        name: undefined,
        status: undefined,
        size: undefined,
        mode: undefined,
        owner: undefined,
        assignee: undefined,
        created_date: undefined,
        updated_date: undefined,
        bug_tracker: undefined,
        overlap: undefined,
        segment_size: undefined,
        z_order: undefined,
        image_quality: undefined,
        start_frame: undefined,
        stop_frame: undefined,
        frame_filter: undefined
      };

      for (const property in data) {
        if (Object.prototype.hasOwnProperty.call(data, property) && property in initialData) {
          data[property] = initialData[property];
        }
      }

      data.labels = [];
      data.jobs = [];
      data.files = Object.freeze({
        server_files: [],
        client_files: [],
        remote_files: []
      });

      if (Array.isArray(initialData.segments)) {
        for (const segment of initialData.segments) {
          if (Array.isArray(segment.jobs)) {
            for (const job of segment.jobs) {
              const jobInstance = new Job({
                url: job.url,
                id: job.id,
                assignee: job.assignee,
                status: job.status,
                start_frame: segment.start_frame,
                stop_frame: segment.stop_frame,
                task: this
              });
              data.jobs.push(jobInstance);
            }
          }
        }
      }

      if (Array.isArray(initialData.labels)) {
        for (const label of initialData.labels) {
          const classInstance = new Label(label);
          data.labels.push(classInstance);
        }
      }

      Object.defineProperties(this, Object.freeze({
        /**
            * @name id
            * @type {integer}
            * @memberof module:API.cvat.classes.Task
            * @readonly
            * @instance
        */
        id: {
          get: () => data.id
        },

        /**
            * @name name
            * @type {string}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        name: {
          get: () => data.name,
          set: value => {
            if (!value.trim().length) {
              throw new ArgumentError('Value must not be empty');
            }

            data.name = value;
          }
        },

        /**
            * @name status
            * @type {module:API.cvat.enums.TaskStatus}
            * @memberof module:API.cvat.classes.Task
            * @readonly
            * @instance
        */
        status: {
          get: () => data.status
        },

        /**
            * @name size
            * @type {integer}
            * @memberof module:API.cvat.classes.Task
            * @readonly
            * @instance
        */
        size: {
          get: () => data.size
        },

        /**
            * @name mode
            * @type {TaskMode}
            * @memberof module:API.cvat.classes.Task
            * @readonly
            * @instance
        */
        mode: {
          get: () => data.mode
        },

        /**
            * Identificator of a user who has created the task
            * @name owner
            * @type {integer}
            * @memberof module:API.cvat.classes.Task
            * @readonly
            * @instance
        */
        owner: {
          get: () => data.owner
        },

        /**
            * Identificator of a user who is responsible for the task
            * @name assignee
            * @type {integer}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        assignee: {
          get: () => data.assignee,
          set: () => assignee => {
            if (!Number.isInteger(assignee) || assignee < 0) {
              throw new ArgumentError('Value must be a non negative integer');
            }

            data.assignee = assignee;
          }
        },

        /**
            * @name createdDate
            * @type {string}
            * @memberof module:API.cvat.classes.Task
            * @readonly
            * @instance
        */
        createdDate: {
          get: () => data.created_date
        },

        /**
            * @name updatedDate
            * @type {string}
            * @memberof module:API.cvat.classes.Task
            * @readonly
            * @instance
        */
        updatedDate: {
          get: () => data.updated_date
        },

        /**
            * @name bugTracker
            * @type {string}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        bugTracker: {
          get: () => data.bug_tracker,
          set: tracker => {
            data.bug_tracker = tracker;
          }
        },

        /**
            * @name overlap
            * @type {integer}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        overlap: {
          get: () => data.overlap,
          set: overlap => {
            if (!Number.isInteger(overlap) || overlap < 0) {
              throw new ArgumentError('Value must be a non negative integer');
            }

            data.overlap = overlap;
          }
        },

        /**
            * @name segmentSize
            * @type {integer}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        segmentSize: {
          get: () => data.segment_size,
          set: segment => {
            if (!Number.isInteger(segment) || segment < 0) {
              throw new ArgumentError('Value must be a positive integer');
            }

            data.segment_size = segment;
          }
        },

        /**
            * @name zOrder
            * @type {boolean}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        zOrder: {
          get: () => data.z_order,
          set: zOrder => {
            if (typeof zOrder !== 'boolean') {
              throw new ArgumentError('Value must be a boolean');
            }

            data.z_order = zOrder;
          }
        },

        /**
            * @name imageQuality
            * @type {integer}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        imageQuality: {
          get: () => data.image_quality,
          set: quality => {
            if (!Number.isInteger(quality) || quality < 0) {
              throw new ArgumentError('Value must be a positive integer');
            }

            data.image_quality = quality;
          }
        },

        /**
            * After task has been created value can be appended only.
            * @name labels
            * @type {module:API.cvat.classes.Label[]}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        labels: {
          get: () => [...data.labels],
          set: labels => {
            if (!Array.isArray(labels)) {
              throw new ArgumentError('Value must be an array of Labels');
            }

            for (const label of labels) {
              if (!(label instanceof Label)) {
                throw new ArgumentError('Each array value must be an instance of Label. ' + `${typeof label} was found`);
              }
            }

            if (typeof data.id === 'undefined') {
              data.labels = [...labels];
            } else {
              data.labels = data.labels.concat([...labels]);
            }
          }
        },

        /**
            * @name jobs
            * @type {module:API.cvat.classes.Job[]}
            * @memberof module:API.cvat.classes.Task
            * @readonly
            * @instance
        */
        jobs: {
          get: () => [...data.jobs]
        },

        /**
            * List of files from shared resource
            * @name serverFiles
            * @type {string[]}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        serverFiles: {
          get: () => [...data.files.server_files],
          set: serverFiles => {
            if (!Array.isArray(serverFiles)) {
              throw new ArgumentError(`Value must be an array. But ${typeof serverFiles} has been got.`);
            }

            for (const value of serverFiles) {
              if (typeof value !== 'string') {
                throw new ArgumentError(`Array values must be a string. But ${typeof value} has been got.`);
              }
            }

            Array.prototype.push.apply(data.files.server_files, serverFiles);
          }
        },

        /**
            * List of files from client host
            * @name clientFiles
            * @type {File[]}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        clientFiles: {
          get: () => [...data.files.client_files],
          set: clientFiles => {
            if (!Array.isArray(clientFiles)) {
              throw new ArgumentError(`Value must be an array. But ${typeof clientFiles} has been got.`);
            }

            for (const value of clientFiles) {
              if (!(value instanceof File)) {
                throw new ArgumentError(`Array values must be a File. But ${value.constructor.name} has been got.`);
              }
            }

            Array.prototype.push.apply(data.files.client_files, clientFiles);
          }
        },

        /**
            * List of files from remote host
            * @name remoteFiles
            * @type {File[]}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        remoteFiles: {
          get: () => [...data.files.remote_files],
          set: remoteFiles => {
            if (!Array.isArray(remoteFiles)) {
              throw new ArgumentError(`Value must be an array. But ${typeof remoteFiles} has been got.`);
            }

            for (const value of remoteFiles) {
              if (typeof value !== 'string') {
                throw new ArgumentError(`Array values must be a string. But ${typeof value} has been got.`);
              }
            }

            Array.prototype.push.apply(data.files.remote_files, remoteFiles);
          }
        },

        /**
            * The first frame of a video to annotation
            * @name startFrame
            * @type {integer}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        startFrame: {
          get: () => data.start_frame,
          set: frame => {
            if (!Number.isInteger(frame) || frame < 0) {
              throw new ArgumentError('Value must be a not negative integer');
            }

            data.start_frame = frame;
          }
        },

        /**
            * The last frame of a video to annotation
            * @name stopFrame
            * @type {integer}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        stopFrame: {
          get: () => data.stop_frame,
          set: frame => {
            if (!Number.isInteger(frame) || frame < 0) {
              throw new ArgumentError('Value must be a not negative integer');
            }

            data.stop_frame = frame;
          }
        },

        /**
            * Filter to ignore some frames during task creation
            * @name frameFilter
            * @type {string}
            * @memberof module:API.cvat.classes.Task
            * @instance
            * @throws {module:API.cvat.exceptions.ArgumentError}
        */
        frameFilter: {
          get: () => data.frame_filter,
          set: filter => {
            if (typeof filter !== 'string') {
              throw new ArgumentError(`Filter value must be a string. But ${typeof filter} has been got.`);
            }

            data.frame_filter = filter;
          }
        }
      })); // When we call a function, for example: task.annotations.get()
      // In the method get we lose the task context
      // So, we need return it

      this.annotations = {
        get: Object.getPrototypeOf(this).annotations.get.bind(this),
        put: Object.getPrototypeOf(this).annotations.put.bind(this),
        save: Object.getPrototypeOf(this).annotations.save.bind(this),
        dump: Object.getPrototypeOf(this).annotations.dump.bind(this),
        merge: Object.getPrototypeOf(this).annotations.merge.bind(this),
        split: Object.getPrototypeOf(this).annotations.split.bind(this),
        group: Object.getPrototypeOf(this).annotations.group.bind(this),
        clear: Object.getPrototypeOf(this).annotations.clear.bind(this),
        upload: Object.getPrototypeOf(this).annotations.upload.bind(this),
        select: Object.getPrototypeOf(this).annotations.select.bind(this),
        statistics: Object.getPrototypeOf(this).annotations.statistics.bind(this),
        hasUnsavedChanges: Object.getPrototypeOf(this).annotations.hasUnsavedChanges.bind(this)
      };
      this.frames = {
        get: Object.getPrototypeOf(this).frames.get.bind(this)
      };
    }
    /**
        * Method updates data of a created task or creates new task from scratch
        * @method save
        * @returns {module:API.cvat.classes.Task}
        * @memberof module:API.cvat.classes.Task
        * @param {function} [onUpdate] - the function which is used only if task hasn't
        * been created yet. It called in order to notify about creation status.
        * It receives the string parameter which is a status message
        * @readonly
        * @instance
        * @async
        * @throws {module:API.cvat.exceptions.ServerError}
        * @throws {module:API.cvat.exceptions.PluginError}
    */


    async save(onUpdate = () => {}) {
      const result = await PluginRegistry.apiWrapper.call(this, Task.prototype.save, onUpdate);
      return result;
    }
    /**
        * Method deletes a task from a server
        * @method delete
        * @memberof module:API.cvat.classes.Task
        * @readonly
        * @instance
        * @async
        * @throws {module:API.cvat.exceptions.ServerError}
        * @throws {module:API.cvat.exceptions.PluginError}
    */


    async delete() {
      const result = await PluginRegistry.apiWrapper.call(this, Task.prototype.delete);
      return result;
    }

  }

  module.exports = {
    Job,
    Task
  };

  const {
    getAnnotations,
    putAnnotations,
    saveAnnotations,
    hasUnsavedChanges,
    mergeAnnotations,
    splitAnnotations,
    groupAnnotations,
    clearAnnotations,
    selectObject,
    annotationsStatistics,
    uploadAnnotations,
    dumpAnnotations
  } = __webpack_require__(/*! ./annotations */ "./src/annotations.js");

  buildDublicatedAPI(Job.prototype);
  buildDublicatedAPI(Task.prototype);

  Job.prototype.save.implementation = async function () {
    // TODO: Add ability to change an assignee
    if (this.id) {
      const jobData = {
        status: this.status
      };
      await serverProxy.jobs.saveJob(this.id, jobData);
      return this;
    }

    throw new ArgumentError('Can not save job without and id');
  };

  Job.prototype.frames.get.implementation = async function (frame) {
    if (!Number.isInteger(frame) || frame < 0) {
      throw new ArgumentError(`Frame must be a positive integer. Got: "${frame}"`);
    }

    if (frame < this.startFrame || frame > this.stopFrame) {
      throw new ArgumentError(`The frame with number ${frame} is out of the job`);
    }

    const frameData = await getFrame(this.task.id, this.task.mode, frame);
    return frameData;
  }; // TODO: Check filter for annotations


  Job.prototype.annotations.get.implementation = async function (frame, filter) {
    if (frame < this.startFrame || frame > this.stopFrame) {
      throw new ArgumentError(`Frame ${frame} does not exist in the job`);
    }

    const annotationsData = await getAnnotations(this, frame, filter);
    return annotationsData;
  };

  Job.prototype.annotations.save.implementation = async function (onUpdate) {
    const result = await saveAnnotations(this, onUpdate);
    return result;
  };

  Job.prototype.annotations.merge.implementation = async function (objectStates) {
    const result = await mergeAnnotations(this, objectStates);
    return result;
  };

  Job.prototype.annotations.split.implementation = async function (objectState, frame) {
    const result = await splitAnnotations(this, objectState, frame);
    return result;
  };

  Job.prototype.annotations.group.implementation = async function (objectStates, reset) {
    const result = await groupAnnotations(this, objectStates, reset);
    return result;
  };

  Job.prototype.annotations.hasUnsavedChanges.implementation = function () {
    const result = hasUnsavedChanges(this);
    return result;
  };

  Job.prototype.annotations.clear.implementation = async function (reload) {
    const result = await clearAnnotations(this, reload);
    return result;
  };

  Job.prototype.annotations.select.implementation = function (frame, x, y) {
    const result = selectObject(this, frame, x, y);
    return result;
  };

  Job.prototype.annotations.statistics.implementation = function () {
    const result = annotationsStatistics(this);
    return result;
  };

  Job.prototype.annotations.put.implementation = function (objectStates) {
    const result = putAnnotations(this, objectStates);
    return result;
  };

  Job.prototype.annotations.upload.implementation = async function (file, format) {
    const result = await uploadAnnotations(this, file, format);
    return result;
  };

  Job.prototype.annotations.dump.implementation = async function (name, format) {
    const result = await dumpAnnotations(this, name, format);
    return result;
  };

  Task.prototype.save.implementation = async function saveTaskImplementation(onUpdate) {
    // TODO: Add ability to change an owner and an assignee
    if (typeof this.id !== 'undefined') {
      // If the task has been already created, we update it
      const taskData = {
        name: this.name,
        bug_tracker: this.bugTracker,
        z_order: this.zOrder,
        labels: [...this.labels.map(el => el.toJSON())]
      };
      await serverProxy.tasks.saveTask(this.id, taskData);
      return this;
    }

    const taskData = {
      name: this.name,
      labels: this.labels.map(el => el.toJSON()),
      image_quality: this.imageQuality,
      z_order: Boolean(this.zOrder)
    };

    if (this.bugTracker) {
      taskData.bug_tracker = this.bugTracker;
    }

    if (this.segmentSize) {
      taskData.segment_size = this.segmentSize;
    }

    if (this.overlap) {
      taskData.overlap = this.overlap;
    }

    if (this.startFrame) {
      taskData.start_frame = this.startFrame;
    }

    if (this.stopFrame) {
      taskData.stop_frame = this.stopFrame;
    }

    if (this.frameFilter) {
      taskData.frame_filter = this.frameFilter;
    }

    const taskFiles = {
      client_files: this.clientFiles,
      server_files: this.serverFiles,
      remote_files: this.remoteFiles
    };
    const task = await serverProxy.tasks.createTask(taskData, taskFiles, onUpdate);
    return new Task(task);
  };

  Task.prototype.delete.implementation = async function () {
    const result = await serverProxy.tasks.deleteTask(this.id);
    return result;
  };

  Task.prototype.frames.get.implementation = async function (frame) {
    if (!Number.isInteger(frame) || frame < 0) {
      throw new ArgumentError(`Frame must be a positive integer. Got: "${frame}"`);
    }

    if (frame >= this.size) {
      throw new ArgumentError(`The frame with number ${frame} is out of the task`);
    }

    const result = await getFrame(this.id, this.mode, frame);
    return result;
  }; // TODO: Check filter for annotations


  Task.prototype.annotations.get.implementation = async function (frame, filter) {
    if (!Number.isInteger(frame) || frame < 0) {
      throw new ArgumentError(`Frame must be a positive integer. Got: "${frame}"`);
    }

    if (frame >= this.size) {
      throw new ArgumentError(`Frame ${frame} does not exist in the task`);
    }

    const result = await getAnnotations(this, frame, filter);
    return result;
  };

  Task.prototype.annotations.save.implementation = async function (onUpdate) {
    const result = await saveAnnotations(this, onUpdate);
    return result;
  };

  Task.prototype.annotations.merge.implementation = async function (objectStates) {
    const result = await mergeAnnotations(this, objectStates);
    return result;
  };

  Task.prototype.annotations.split.implementation = async function (objectState, frame) {
    const result = await splitAnnotations(this, objectState, frame);
    return result;
  };

  Task.prototype.annotations.group.implementation = async function (objectStates, reset) {
    const result = await groupAnnotations(this, objectStates, reset);
    return result;
  };

  Task.prototype.annotations.hasUnsavedChanges.implementation = function () {
    const result = hasUnsavedChanges(this);
    return result;
  };

  Task.prototype.annotations.clear.implementation = async function (reload) {
    const result = await clearAnnotations(this, reload);
    return result;
  };

  Task.prototype.annotations.select.implementation = function (frame, x, y) {
    const result = selectObject(this, frame, x, y);
    return result;
  };

  Task.prototype.annotations.statistics.implementation = function () {
    const result = annotationsStatistics(this);
    return result;
  };

  Task.prototype.annotations.put.implementation = function (objectStates) {
    const result = putAnnotations(this, objectStates);
    return result;
  };

  Task.prototype.annotations.upload.implementation = async function (file, format) {
    const result = await uploadAnnotations(this, file, format);
    return result;
  };

  Task.prototype.annotations.dump.implementation = async function (name, format) {
    const result = await dumpAnnotations(this, name, format);
    return result;
  };
})();

/***/ }),

/***/ "./src/statistics.js":
/*!***************************!*\
  !*** ./src/statistics.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/
(() => {
  /**
      * Class representing collection statistics
      * @memberof module:API.cvat.classes
      * @hideconstructor
  */
  class Statistics {
    constructor(label, total) {
      Object.defineProperties(this, Object.freeze({
        /**
            * Statistics by labels with a structure:
            * @example
            * {
            *     label: {
            *         boxes: {
            *             tracks: 10,
            *             shapes: 11,
            *         },
            *         polygons: {
            *             tracks: 13,
            *             shapes: 14,
            *         },
            *         polylines: {
            *             tracks: 16,
            *             shapes: 17,
            *         },
            *         points: {
            *             tracks: 19,
            *             shapes: 20,
            *         },
            *         tags: 66,
            *         manually: 186,
            *         interpolated: 500,
            *         total: 608,
            *     }
            * }
            * @name label
            * @type {Object}
            * @memberof module:API.cvat.classes.Statistics
            * @readonly
            * @instance
        */
        label: {
          get: () => JSON.parse(JSON.stringify(label))
        },

        /**
            * Total statistics (covers all labels) with a structure:
            * @example
            * {
            *     boxes: {
            *             tracks: 10,
            *             shapes: 11,
            *     },
            *     polygons: {
            *         tracks: 13,
            *         shapes: 14,
            *     },
            *     polylines: {
            *        tracks: 16,
            *        shapes: 17,
            *    },
            *    points: {
            *        tracks: 19,
            *        shapes: 20,
            *    },
            *    tags: 66,
            *    manually: 186,
            *    interpolated: 500,
            *    total: 608,
            * }
            * @name total
            * @type {Object}
            * @memberof module:API.cvat.classes.Statistics
            * @readonly
            * @instance
        */
        total: {
          get: () => JSON.parse(JSON.stringify(total))
        }
      }));
    }

  }

  module.exports = Statistics;
})();

/***/ }),

/***/ "./src/user.js":
/*!*********************!*\
  !*** ./src/user.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! core-js/modules/es.promise */ "./node_modules/core-js/modules/es.promise.js");

/*
* Copyright (C) 2018 Intel Corporation
* SPDX-License-Identifier: MIT
*/

/* global
    require:false
*/
(() => {
  const PluginRegistry = __webpack_require__(/*! ./plugins */ "./src/plugins.js");

  const serverProxy = __webpack_require__(/*! ./server-proxy */ "./src/server-proxy.js");
  /**
      * Class representing a user
      * @memberof module:API.cvat.classes
      * @hideconstructor
  */


  class User {
    constructor(initialData) {
      const data = {
        id: null,
        username: null,
        email: null,
        first_name: null,
        last_name: null,
        groups: null,
        last_login: null,
        date_joined: null,
        is_staff: null,
        is_superuser: null,
        is_active: null
      };

      for (const property in data) {
        if (Object.prototype.hasOwnProperty.call(data, property) && property in initialData) {
          data[property] = initialData[property];
        }
      }

      Object.defineProperties(this, Object.freeze({
        id: {
          /**
              * @name id
              * @type {integer}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.id
        },
        username: {
          /**
              * @name username
              * @type {string}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.username
        },
        email: {
          /**
              * @name email
              * @type {string}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.email
        },
        firstName: {
          /**
              * @name firstName
              * @type {string}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.first_name
        },
        lastName: {
          /**
              * @name lastName
              * @type {string}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.last_name
        },
        groups: {
          /**
              * @name groups
              * @type {string[]}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => JSON.parse(JSON.stringify(data.groups))
        },
        lastLogin: {
          /**
              * @name lastLogin
              * @type {string}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.last_login
        },
        dateJoined: {
          /**
              * @name dateJoined
              * @type {string}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.date_joined
        },
        isStaff: {
          /**
              * @name isStaff
              * @type {boolean}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.is_staff
        },
        isSuperuser: {
          /**
              * @name isSuperuser
              * @type {boolean}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.is_superuser
        },
        isActive: {
          /**
              * @name isActive
              * @type {boolean}
              * @memberof module:API.cvat.classes.User
              * @readonly
              * @instance
          */
          get: () => data.is_active
        }
      }));
    }
    /**
        * Method creates a new user on a server
        * @method register
        * @returns {module:API.cvat.classes.User}
        * @memberof module:API.cvat.classes.User
        * @readonly
        * @static
        * @async
        * @param data is an object with string fields:
        * username, [firstName = ""], [lastName = ""], email, password1, password2,
        * @throws {module:API.cvat.exceptions.ServerError}
        * @throws {module:API.cvat.exceptions.PluginError}
    */


    static async register(data) {
      const result = await PluginRegistry.apiWrapper.call(this, User.register, data);
      return result;
    }

  }

  User.register.implementation = async function (data) {
    serverProxy.users.register(data);
  };

  module.exports = User;
})();

/***/ })

/******/ });
//# sourceMappingURL=cvat-core.js.map