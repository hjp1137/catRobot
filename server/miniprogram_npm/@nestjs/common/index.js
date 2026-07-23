module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1784796701619, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION_NEUTRAL = exports.Scope = void 0;
const tslib_1 = require("tslib");
/*
 * Nest @common
 * Copyright(c) 2017 - 2025 Kamil Mysliwiec
 * https://nestjs.com
 * MIT Licensed
 */
require("reflect-metadata");
tslib_1.__exportStar(require("./decorators"), exports);
tslib_1.__exportStar(require("./enums"), exports);
tslib_1.__exportStar(require("./exceptions"), exports);
tslib_1.__exportStar(require("./file-stream"), exports);
var interfaces_1 = require("./interfaces");
Object.defineProperty(exports, "Scope", { enumerable: true, get: function () { return interfaces_1.Scope; } });
Object.defineProperty(exports, "VERSION_NEUTRAL", { enumerable: true, get: function () { return interfaces_1.VERSION_NEUTRAL; } });
tslib_1.__exportStar(require("./module-utils"), exports);
tslib_1.__exportStar(require("./pipes"), exports);
tslib_1.__exportStar(require("./serializer"), exports);
tslib_1.__exportStar(require("./services"), exports);
tslib_1.__exportStar(require("./utils"), exports);

}, function(modId) {var map = {"./decorators":1784796701620,"./enums":1784796701655,"./exceptions":1784796701659,"./file-stream":1784796701704,"./interfaces":1784796701706,"./module-utils":1784796701758,"./pipes":1784796701764,"./serializer":1784796701785,"./services":1784796701791,"./utils":1784796701798}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701620, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./core"), exports);
tslib_1.__exportStar(require("./modules"), exports);
tslib_1.__exportStar(require("./http"), exports);

}, function(modId) { var map = {"./core":1784796701621,"./modules":1784796701640,"./http":1784796701644}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701621, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./bind.decorator"), exports);
tslib_1.__exportStar(require("./catch.decorator"), exports);
tslib_1.__exportStar(require("./controller.decorator"), exports);
tslib_1.__exportStar(require("./dependencies.decorator"), exports);
tslib_1.__exportStar(require("./exception-filters.decorator"), exports);
tslib_1.__exportStar(require("./inject.decorator"), exports);
tslib_1.__exportStar(require("./injectable.decorator"), exports);
tslib_1.__exportStar(require("./optional.decorator"), exports);
tslib_1.__exportStar(require("./set-metadata.decorator"), exports);
tslib_1.__exportStar(require("./use-guards.decorator"), exports);
tslib_1.__exportStar(require("./use-interceptors.decorator"), exports);
tslib_1.__exportStar(require("./use-pipes.decorator"), exports);
tslib_1.__exportStar(require("./apply-decorators"), exports);
tslib_1.__exportStar(require("./version.decorator"), exports);

}, function(modId) { var map = {"./bind.decorator":1784796701622,"./catch.decorator":1784796701623,"./controller.decorator":1784796701625,"./dependencies.decorator":1784796701627,"./exception-filters.decorator":1784796701628,"./injectable.decorator":1784796701632,"./optional.decorator":1784796701633,"./set-metadata.decorator":1784796701634,"./use-guards.decorator":1784796701635,"./use-interceptors.decorator":1784796701636,"./use-pipes.decorator":1784796701637,"./apply-decorators":1784796701638,"./version.decorator":1784796701639}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701622, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Bind = Bind;
/**
 * Decorator that binds *parameter decorators* to the method that follows.
 *
 * Useful when the language doesn't provide a 'Parameter Decorator' feature
 * (i.e., vanilla JavaScript).
 *
 * @param decorators one or more parameter decorators (e.g., `Req()`)
 *
 * @publicApi
 */
function Bind(...decorators) {
    return (target, key, descriptor) => {
        decorators.forEach((fn, index) => fn(target, key, index));
        return descriptor;
    };
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701623, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Catch = Catch;
const constants_1 = require("../../constants");
/**
 * Decorator that marks a class as a Nest exception filter. An exception filter
 * handles exceptions thrown by or not handled by your application code.
 *
 * The decorated class must implement the `ExceptionFilter` interface.
 *
 * @param exceptions one or more exception *types* specifying
 * the exceptions to be caught and handled by this filter.
 *
 * @see [Exception Filters](https://docs.nestjs.com/exception-filters)
 *
 * @usageNotes
 * Exception filters are applied using the `@UseFilters()` decorator, or (globally)
 * with `app.useGlobalFilters()`.
 *
 * @publicApi
 */
function Catch(...exceptions) {
    return (target) => {
        Reflect.defineMetadata(constants_1.CATCH_WATERMARK, true, target);
        Reflect.defineMetadata(constants_1.FILTER_CATCH_EXCEPTIONS, exceptions, target);
    };
}

}, function(modId) { var map = {"../../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701624, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ENTRY_PROVIDER_WATERMARK = exports.CATCH_WATERMARK = exports.CONTROLLER_WATERMARK = exports.INJECTABLE_WATERMARK = exports.VERSION_METADATA = exports.SSE_METADATA = exports.RESPONSE_PASSTHROUGH_METADATA = exports.REDIRECT_METADATA = exports.HEADERS_METADATA = exports.MODULE_PATH = exports.HTTP_CODE_METADATA = exports.RENDER_METADATA = exports.ENHANCER_KEY_TO_SUBTYPE_MAP = exports.EXCEPTION_FILTERS_METADATA = exports.INTERCEPTORS_METADATA = exports.GUARDS_METADATA = exports.PIPES_METADATA = exports.FILTER_CATCH_EXCEPTIONS = exports.CUSTOM_ROUTE_ARGS_METADATA = exports.ROUTE_ARGS_METADATA = exports.METHOD_METADATA = exports.SCOPE_OPTIONS_METADATA = exports.OPTIONAL_PROPERTY_DEPS_METADATA = exports.PROPERTY_DEPS_METADATA = exports.OPTIONAL_DEPS_METADATA = exports.SELF_DECLARED_DEPS_METADATA = exports.PARAMTYPES_METADATA = exports.PATH_METADATA = exports.HOST_METADATA = exports.GLOBAL_MODULE_METADATA = exports.MODULE_METADATA = void 0;
exports.MODULE_METADATA = {
    IMPORTS: 'imports',
    PROVIDERS: 'providers',
    CONTROLLERS: 'controllers',
    EXPORTS: 'exports',
};
exports.GLOBAL_MODULE_METADATA = '__module:global__';
exports.HOST_METADATA = 'host';
exports.PATH_METADATA = 'path';
exports.PARAMTYPES_METADATA = 'design:paramtypes';
exports.SELF_DECLARED_DEPS_METADATA = 'self:paramtypes';
exports.OPTIONAL_DEPS_METADATA = 'optional:paramtypes';
exports.PROPERTY_DEPS_METADATA = 'self:properties_metadata';
exports.OPTIONAL_PROPERTY_DEPS_METADATA = 'optional:properties_metadata';
exports.SCOPE_OPTIONS_METADATA = 'scope:options';
exports.METHOD_METADATA = 'method';
exports.ROUTE_ARGS_METADATA = '__routeArguments__';
exports.CUSTOM_ROUTE_ARGS_METADATA = '__customRouteArgs__';
exports.FILTER_CATCH_EXCEPTIONS = '__filterCatchExceptions__';
exports.PIPES_METADATA = '__pipes__';
exports.GUARDS_METADATA = '__guards__';
exports.INTERCEPTORS_METADATA = '__interceptors__';
exports.EXCEPTION_FILTERS_METADATA = '__exceptionFilters__';
exports.ENHANCER_KEY_TO_SUBTYPE_MAP = {
    [exports.GUARDS_METADATA]: 'guard',
    [exports.INTERCEPTORS_METADATA]: 'interceptor',
    [exports.PIPES_METADATA]: 'pipe',
    [exports.EXCEPTION_FILTERS_METADATA]: 'filter',
};
exports.RENDER_METADATA = '__renderTemplate__';
exports.HTTP_CODE_METADATA = '__httpCode__';
exports.MODULE_PATH = '__module_path__';
exports.HEADERS_METADATA = '__headers__';
exports.REDIRECT_METADATA = '__redirect__';
exports.RESPONSE_PASSTHROUGH_METADATA = '__responsePassthrough__';
exports.SSE_METADATA = '__sse__';
exports.VERSION_METADATA = '__version__';
exports.INJECTABLE_WATERMARK = '__injectable__';
exports.CONTROLLER_WATERMARK = '__controller__';
exports.CATCH_WATERMARK = '__catch__';
exports.ENTRY_PROVIDER_WATERMARK = '__entryProvider__';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701625, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = Controller;
const constants_1 = require("../../constants");
const shared_utils_1 = require("../../utils/shared.utils");
/**
 * Decorator that marks a class as a Nest controller that can receive inbound
 * requests and produce responses.
 *
 * An HTTP Controller responds to inbound HTTP Requests and produces HTTP Responses.
 * It defines a class that provides the context for one or more related route
 * handlers that correspond to HTTP request methods and associated routes
 * for example `GET /api/profile`, `POST /users/resume`
 *
 * A Microservice Controller responds to requests as well as events, running over
 * a variety of transports [(read more here)](https://docs.nestjs.com/microservices/basics).
 * It defines a class that provides a context for one or more message or event
 * handlers.
 *
 * @param prefixOrOptions a `route path prefix` or a `ControllerOptions` object.
 * A `route path prefix` is pre-pended to the path specified in any request decorator
 * in the class. `ControllerOptions` is an options configuration object specifying:
 * - `scope` - symbol that determines the lifetime of a Controller instance.
 * [See Scope](https://docs.nestjs.com/fundamentals/injection-scopes#usage) for
 * more details.
 * - `prefix` - string that defines a `route path prefix`.  The prefix
 * is pre-pended to the path specified in any request decorator in the class.
 * - `version` - string, array of strings, or Symbol that defines the version
 * of all routes in the class. [See Versioning](https://docs.nestjs.com/techniques/versioning)
 * for more details.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 * @see [Controllers](https://docs.nestjs.com/controllers)
 * @see [Microservices](https://docs.nestjs.com/microservices/basics#request-response)
 * @see [Scope](https://docs.nestjs.com/fundamentals/injection-scopes#usage)
 * @see [Versioning](https://docs.nestjs.com/techniques/versioning)
 *
 * @publicApi
 */
function Controller(prefixOrOptions) {
    const defaultPath = '/';
    const [path, host, scopeOptions, versionOptions] = (0, shared_utils_1.isUndefined)(prefixOrOptions)
        ? [defaultPath, undefined, undefined, undefined]
        : (0, shared_utils_1.isString)(prefixOrOptions) || Array.isArray(prefixOrOptions)
            ? [prefixOrOptions, undefined, undefined, undefined]
            : [
                prefixOrOptions.path || defaultPath,
                prefixOrOptions.host,
                { scope: prefixOrOptions.scope, durable: prefixOrOptions.durable },
                Array.isArray(prefixOrOptions.version)
                    ? Array.from(new Set(prefixOrOptions.version))
                    : prefixOrOptions.version,
            ];
    return (target) => {
        Reflect.defineMetadata(constants_1.CONTROLLER_WATERMARK, true, target);
        Reflect.defineMetadata(constants_1.PATH_METADATA, path, target);
        Reflect.defineMetadata(constants_1.HOST_METADATA, host, target);
        Reflect.defineMetadata(constants_1.SCOPE_OPTIONS_METADATA, scopeOptions, target);
        Reflect.defineMetadata(constants_1.VERSION_METADATA, versionOptions, target);
    };
}

}, function(modId) { var map = {"../../constants":1784796701624,"../../utils/shared.utils":1784796701626}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701626, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isSymbol = exports.isEmpty = exports.isNil = exports.isConstructor = exports.isNumber = exports.isString = exports.isFunction = exports.stripEndSlash = exports.normalizePath = exports.addLeadingSlash = exports.isPlainObject = exports.isObject = exports.isUndefined = void 0;
const isUndefined = (obj) => typeof obj === 'undefined';
exports.isUndefined = isUndefined;
const isObject = (fn) => !(0, exports.isNil)(fn) && typeof fn === 'object';
exports.isObject = isObject;
const isPlainObject = (fn) => {
    if (!(0, exports.isObject)(fn)) {
        return false;
    }
    const proto = Object.getPrototypeOf(fn);
    if (proto === null) {
        return true;
    }
    const ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') &&
        proto.constructor;
    return (typeof ctor === 'function' &&
        ctor instanceof ctor &&
        Function.prototype.toString.call(ctor) ===
            Function.prototype.toString.call(Object));
};
exports.isPlainObject = isPlainObject;
const addLeadingSlash = (path) => path && typeof path === 'string'
    ? path.charAt(0) !== '/' && path.substring(0, 2) !== '{/'
        ? '/' + path
        : path
    : '';
exports.addLeadingSlash = addLeadingSlash;
const normalizePath = (path) => path
    ? path.startsWith('/')
        ? ('/' + path.replace(/\/+$/, '')).replace(/\/+/g, '/')
        : '/' + path.replace(/\/+$/, '')
    : '/';
exports.normalizePath = normalizePath;
const stripEndSlash = (path) => path[path.length - 1] === '/' ? path.slice(0, path.length - 1) : path;
exports.stripEndSlash = stripEndSlash;
const isFunction = (val) => typeof val === 'function';
exports.isFunction = isFunction;
const isString = (val) => typeof val === 'string';
exports.isString = isString;
const isNumber = (val) => typeof val === 'number';
exports.isNumber = isNumber;
const isConstructor = (val) => val === 'constructor';
exports.isConstructor = isConstructor;
const isNil = (val) => (0, exports.isUndefined)(val) || val === null;
exports.isNil = isNil;
const isEmpty = (array) => !(array && array.length > 0);
exports.isEmpty = isEmpty;
const isSymbol = (val) => typeof val === 'symbol';
exports.isSymbol = isSymbol;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701627, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Dependencies = void 0;
exports.flatten = flatten;
const constants_1 = require("../../constants");
function flatten(arr) {
    const flat = [].concat(...arr);
    return flat.some(Array.isArray)
        ? flatten(flat)
        : flat;
}
/**
 * Decorator that sets required dependencies (required with a vanilla JavaScript objects)
 *
 * @publicApi
 */
const Dependencies = (...dependencies) => {
    const flattenDeps = flatten(dependencies);
    return (target) => {
        Reflect.defineMetadata(constants_1.PARAMTYPES_METADATA, flattenDeps, target);
    };
};
exports.Dependencies = Dependencies;

}, function(modId) { var map = {"../../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701628, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.UseFilters = void 0;
const constants_1 = require("../../constants");
const extend_metadata_util_1 = require("../../utils/extend-metadata.util");
const shared_utils_1 = require("../../utils/shared.utils");
const validate_each_util_1 = require("../../utils/validate-each.util");
/**
 * Decorator that binds exception filters to the scope of the controller or
 * method, depending on its context.
 *
 * When `@UseFilters` is used at the controller level, the filter will be
 * applied to every handler (method) in the controller.
 *
 * When `@UseFilters` is used at the individual handler level, the filter
 * will apply only to that specific method.
 *
 * @param filters exception filter instance or class, or a list of exception
 * filter instances or classes.
 *
 * @see [Exception filters](https://docs.nestjs.com/exception-filters)
 *
 * @usageNotes
 * Exception filters can also be set up globally for all controllers and routes
 * using `app.useGlobalFilters()`.  [See here for details](https://docs.nestjs.com/exception-filters#binding-filters)
 *
 * @publicApi
 */
const UseFilters = (...filters) => addExceptionFiltersMetadata(...filters);
exports.UseFilters = UseFilters;
function addExceptionFiltersMetadata(...filters) {
    return (target, key, descriptor) => {
        const isFilterValid = (filter) => filter && ((0, shared_utils_1.isFunction)(filter) || (0, shared_utils_1.isFunction)(filter.catch));
        if (descriptor) {
            (0, validate_each_util_1.validateEach)(target.constructor, filters, isFilterValid, '@UseFilters', 'filter');
            (0, extend_metadata_util_1.extendArrayMetadata)(constants_1.EXCEPTION_FILTERS_METADATA, filters, descriptor.value);
            return descriptor;
        }
        (0, validate_each_util_1.validateEach)(target, filters, isFilterValid, '@UseFilters', 'filter');
        (0, extend_metadata_util_1.extendArrayMetadata)(constants_1.EXCEPTION_FILTERS_METADATA, filters, target);
        return target;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624,"../../utils/extend-metadata.util":1784796701629,"../../utils/shared.utils":1784796701626,"../../utils/validate-each.util":1784796701630}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701629, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.extendArrayMetadata = extendArrayMetadata;
function extendArrayMetadata(key, metadata, target) {
    const previousValue = Reflect.getMetadata(key, target) || [];
    const value = [...previousValue, ...metadata];
    Reflect.defineMetadata(key, value, target);
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701630, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidDecoratorItemException = void 0;
exports.validateEach = validateEach;
class InvalidDecoratorItemException extends Error {
    constructor(decorator, item, context) {
        const message = `Invalid ${item} passed to ${decorator}() decorator (${context}).`;
        super(message);
        this.msg = message;
    }
    what() {
        return this.msg;
    }
}
exports.InvalidDecoratorItemException = InvalidDecoratorItemException;
function validateEach(context, arr, predicate, decorator, item) {
    if (!context || !context.name) {
        return true;
    }
    const errors = arr.some(str => !predicate(str));
    if (errors) {
        throw new InvalidDecoratorItemException(decorator, item, context.name);
    }
    return true;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701632, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Injectable = Injectable;
exports.mixin = mixin;
const uid_1 = require("uid");
const constants_1 = require("../../constants");
/**
 * Decorator that marks a class as a [provider](https://docs.nestjs.com/providers).
 * Providers can be injected into other classes via constructor parameter injection
 * using Nest's built-in [Dependency Injection (DI)](https://docs.nestjs.com/providers#dependency-injection)
 * system.
 *
 * When injecting a provider, it must be visible within the module scope (loosely
 * speaking, the containing module) of the class it is being injected into. This
 * can be done by:
 *
 * - defining the provider in the same module scope
 * - exporting the provider from one module scope and importing that module into the
 *   module scope of the class being injected into
 * - exporting the provider from a module that is marked as global using the
 *   `@Global()` decorator
 *
 * Providers can also be defined in a more explicit and imperative form using
 * various [custom provider](https://docs.nestjs.com/fundamentals/custom-providers) techniques that expose
 * more capabilities of the DI system.
 *
 * @param options options specifying scope of injectable
 *
 * @see [Providers](https://docs.nestjs.com/providers)
 * @see [Custom Providers](https://docs.nestjs.com/fundamentals/custom-providers)
 * @see [Injection Scopes](https://docs.nestjs.com/fundamentals/injection-scopes)
 *
 * @publicApi
 */
function Injectable(options) {
    return (target) => {
        Reflect.defineMetadata(constants_1.INJECTABLE_WATERMARK, true, target);
        Reflect.defineMetadata(constants_1.SCOPE_OPTIONS_METADATA, options, target);
    };
}
/**
 * @publicApi
 */
function mixin(mixinClass) {
    Object.defineProperty(mixinClass, 'name', {
        value: (0, uid_1.uid)(21),
    });
    Injectable()(mixinClass);
    return mixinClass;
}

}, function(modId) { var map = {"../../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701633, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Optional = Optional;
const constants_1 = require("../../constants");
const shared_utils_1 = require("../../utils/shared.utils");
/**
 * Parameter decorator for an injected dependency marking the
 * dependency as optional.
 *
 * For example:
 * ```typescript
 * constructor(@Optional() @Inject('HTTP_OPTIONS')private readonly httpClient: T) {}
 * ```
 *
 * @see [Optional providers](https://docs.nestjs.com/providers#optional-providers)
 *
 * @publicApi
 */
function Optional() {
    return (target, key, index) => {
        if (!(0, shared_utils_1.isUndefined)(index)) {
            const args = Reflect.getMetadata(constants_1.OPTIONAL_DEPS_METADATA, target) || [];
            Reflect.defineMetadata(constants_1.OPTIONAL_DEPS_METADATA, [...args, index], target);
            return;
        }
        const properties = Reflect.getMetadata(constants_1.OPTIONAL_PROPERTY_DEPS_METADATA, target.constructor) || [];
        Reflect.defineMetadata(constants_1.OPTIONAL_PROPERTY_DEPS_METADATA, [...properties, key], target.constructor);
    };
}

}, function(modId) { var map = {"../../constants":1784796701624,"../../utils/shared.utils":1784796701626}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701634, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SetMetadata = void 0;
/**
 * Decorator that assigns metadata to the class/function using the
 * specified `key`.
 *
 * Requires two parameters:
 * - `key` - a value defining the key under which the metadata is stored
 * - `value` - metadata to be associated with `key`
 *
 * This metadata can be reflected using the `Reflector` class.
 *
 * Example: `@SetMetadata('roles', ['admin'])`
 *
 * @see [Reflection](https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata)
 *
 * @publicApi
 */
const SetMetadata = (metadataKey, metadataValue) => {
    const decoratorFactory = (target, key, descriptor) => {
        if (descriptor) {
            Reflect.defineMetadata(metadataKey, metadataValue, descriptor.value);
            return descriptor;
        }
        Reflect.defineMetadata(metadataKey, metadataValue, target);
        return target;
    };
    decoratorFactory.KEY = metadataKey;
    return decoratorFactory;
};
exports.SetMetadata = SetMetadata;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701635, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.UseGuards = UseGuards;
const constants_1 = require("../../constants");
const extend_metadata_util_1 = require("../../utils/extend-metadata.util");
const shared_utils_1 = require("../../utils/shared.utils");
const validate_each_util_1 = require("../../utils/validate-each.util");
/**
 * Decorator that binds guards to the scope of the controller or method,
 * depending on its context.
 *
 * When `@UseGuards` is used at the controller level, the guard will be
 * applied to every handler (method) in the controller.
 *
 * When `@UseGuards` is used at the individual handler level, the guard
 * will apply only to that specific method.
 *
 * @param guards a single guard instance or class, or a list of guard instances
 * or classes.
 *
 * @see [Guards](https://docs.nestjs.com/guards)
 *
 * @usageNotes
 * Guards can also be set up globally for all controllers and routes
 * using `app.useGlobalGuards()`.  [See here for details](https://docs.nestjs.com/guards#binding-guards)
 *
 * @publicApi
 */
function UseGuards(...guards) {
    return (target, key, descriptor) => {
        const isGuardValid = (guard) => guard && ((0, shared_utils_1.isFunction)(guard) || (0, shared_utils_1.isFunction)(guard.canActivate));
        if (descriptor) {
            (0, validate_each_util_1.validateEach)(target.constructor, guards, isGuardValid, '@UseGuards', 'guard');
            (0, extend_metadata_util_1.extendArrayMetadata)(constants_1.GUARDS_METADATA, guards, descriptor.value);
            return descriptor;
        }
        (0, validate_each_util_1.validateEach)(target, guards, isGuardValid, '@UseGuards', 'guard');
        (0, extend_metadata_util_1.extendArrayMetadata)(constants_1.GUARDS_METADATA, guards, target);
        return target;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624,"../../utils/extend-metadata.util":1784796701629,"../../utils/shared.utils":1784796701626,"../../utils/validate-each.util":1784796701630}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701636, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.UseInterceptors = UseInterceptors;
const constants_1 = require("../../constants");
const extend_metadata_util_1 = require("../../utils/extend-metadata.util");
const shared_utils_1 = require("../../utils/shared.utils");
const validate_each_util_1 = require("../../utils/validate-each.util");
/**
 * Decorator that binds interceptors to the scope of the controller or method,
 * depending on its context.
 *
 * When `@UseInterceptors` is used at the controller level, the interceptor will
 * be applied to every handler (method) in the controller.
 *
 * When `@UseInterceptors` is used at the individual handler level, the interceptor
 * will apply only to that specific method.
 *
 * @param interceptors a single interceptor instance or class, or a list of
 * interceptor instances or classes.
 *
 * @see [Interceptors](https://docs.nestjs.com/interceptors)
 *
 * @usageNotes
 * Interceptors can also be set up globally for all controllers and routes
 * using `app.useGlobalInterceptors()`.  [See here for details](https://docs.nestjs.com/interceptors#binding-interceptors)
 *
 * @publicApi
 */
function UseInterceptors(...interceptors) {
    return (target, key, descriptor) => {
        const isInterceptorValid = (interceptor) => interceptor &&
            ((0, shared_utils_1.isFunction)(interceptor) || (0, shared_utils_1.isFunction)(interceptor.intercept));
        if (descriptor) {
            (0, validate_each_util_1.validateEach)(target.constructor, interceptors, isInterceptorValid, '@UseInterceptors', 'interceptor');
            (0, extend_metadata_util_1.extendArrayMetadata)(constants_1.INTERCEPTORS_METADATA, interceptors, descriptor.value);
            return descriptor;
        }
        (0, validate_each_util_1.validateEach)(target, interceptors, isInterceptorValid, '@UseInterceptors', 'interceptor');
        (0, extend_metadata_util_1.extendArrayMetadata)(constants_1.INTERCEPTORS_METADATA, interceptors, target);
        return target;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624,"../../utils/extend-metadata.util":1784796701629,"../../utils/shared.utils":1784796701626,"../../utils/validate-each.util":1784796701630}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701637, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.UsePipes = UsePipes;
const constants_1 = require("../../constants");
const extend_metadata_util_1 = require("../../utils/extend-metadata.util");
const shared_utils_1 = require("../../utils/shared.utils");
const validate_each_util_1 = require("../../utils/validate-each.util");
/**
 * Decorator that binds pipes to the scope of the controller or method,
 * depending on its context.
 *
 * When `@UsePipes` is used at the controller level, the pipe will be
 * applied to every handler (method) in the controller.
 *
 * When `@UsePipes` is used at the individual handler level, the pipe
 * will apply only to that specific method.
 *
 * @param pipes a single pipe instance or class, or a list of pipe instances or
 * classes.
 *
 * @see [Pipes](https://docs.nestjs.com/pipes)
 *
 * @usageNotes
 * Pipes can also be set up globally for all controllers and routes
 * using `app.useGlobalPipes()`.  [See here for details](https://docs.nestjs.com/pipes#class-validator)
 *
 * @publicApi
 */
function UsePipes(...pipes) {
    return (target, key, descriptor) => {
        const isPipeValid = (pipe) => pipe && ((0, shared_utils_1.isFunction)(pipe) || (0, shared_utils_1.isFunction)(pipe.transform));
        if (descriptor) {
            (0, extend_metadata_util_1.extendArrayMetadata)(constants_1.PIPES_METADATA, pipes, descriptor.value);
            return descriptor;
        }
        (0, validate_each_util_1.validateEach)(target, pipes, isPipeValid, '@UsePipes', 'pipe');
        (0, extend_metadata_util_1.extendArrayMetadata)(constants_1.PIPES_METADATA, pipes, target);
        return target;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624,"../../utils/extend-metadata.util":1784796701629,"../../utils/shared.utils":1784796701626,"../../utils/validate-each.util":1784796701630}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701638, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDecorators = applyDecorators;
/**
 * Function that returns a new decorator that applies all decorators provided by param
 *
 * Useful to build new decorators (or a decorator factory) encapsulating multiple decorators related with the same feature
 *
 * @param decorators one or more decorators (e.g., `ApplyGuard(...)`)
 *
 * @publicApi
 */
function applyDecorators(...decorators) {
    return (target, propertyKey, descriptor) => {
        for (const decorator of decorators) {
            if (target instanceof Function && !descriptor) {
                decorator(target);
                continue;
            }
            decorator(target, propertyKey, descriptor);
        }
    };
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701639, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = Version;
const constants_1 = require("../../constants");
/**
 * Sets the version of the endpoint to the passed version
 *
 * @publicApi
 */
function Version(version) {
    if (Array.isArray(version)) {
        // Drop duplicated versions
        version = Array.from(new Set(version));
    }
    return (target, key, descriptor) => {
        Reflect.defineMetadata(constants_1.VERSION_METADATA, version, descriptor.value);
        return descriptor;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701640, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./global.decorator"), exports);
tslib_1.__exportStar(require("./module.decorator"), exports);

}, function(modId) { var map = {"./global.decorator":1784796701641,"./module.decorator":1784796701642}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701641, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Global = Global;
const constants_1 = require("../../constants");
/**
 * Decorator that makes a module global-scoped.
 *
 * Once imported into any module, a global-scoped module will be visible
 * in all modules. Thereafter, modules that wish to inject a service exported
 * from a global module do not need to import the provider module.
 *
 * @see [Global modules](https://docs.nestjs.com/modules#global-modules)
 *
 * @publicApi
 */
function Global() {
    return (target) => {
        Reflect.defineMetadata(constants_1.GLOBAL_MODULE_METADATA, true, target);
    };
}

}, function(modId) { var map = {"../../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701642, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = Module;
const validate_module_keys_util_1 = require("../../utils/validate-module-keys.util");
/**
 * Decorator that marks a class as a [module](https://docs.nestjs.com/modules).
 *
 * Modules are used by Nest to organize the application structure into scopes. Controllers
 * and Providers are scoped by the module they are declared in. Modules and their
 * classes (Controllers and Providers) form a graph that determines how Nest
 * performs [Dependency Injection (DI)](https://docs.nestjs.com/providers#dependency-injection).
 *
 * @param metadata module configuration metadata
 *
 * @see [Modules](https://docs.nestjs.com/modules)
 *
 * @publicApi
 */
function Module(metadata) {
    const propsKeys = Object.keys(metadata);
    (0, validate_module_keys_util_1.validateModuleKeys)(propsKeys);
    return (target) => {
        for (const property in metadata) {
            if (Object.hasOwnProperty.call(metadata, property)) {
                Reflect.defineMetadata(property, metadata[property], target);
            }
        }
    };
}

}, function(modId) { var map = {"../../utils/validate-module-keys.util":1784796701643}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701643, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.INVALID_MODULE_CONFIG_MESSAGE = void 0;
exports.validateModuleKeys = validateModuleKeys;
const constants_1 = require("../constants");
const INVALID_MODULE_CONFIG_MESSAGE = (text, property) => `Invalid property '${property}' passed into the @Module() decorator.`;
exports.INVALID_MODULE_CONFIG_MESSAGE = INVALID_MODULE_CONFIG_MESSAGE;
const metadataKeys = [
    constants_1.MODULE_METADATA.IMPORTS,
    constants_1.MODULE_METADATA.EXPORTS,
    constants_1.MODULE_METADATA.CONTROLLERS,
    constants_1.MODULE_METADATA.PROVIDERS,
];
function validateModuleKeys(keys) {
    const validateKey = (key) => {
        if (metadataKeys.includes(key)) {
            return;
        }
        throw new Error((0, exports.INVALID_MODULE_CONFIG_MESSAGE) `${key}`);
    };
    keys.forEach(validateKey);
}

}, function(modId) { var map = {"../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701644, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./request-mapping.decorator"), exports);
tslib_1.__exportStar(require("./route-params.decorator"), exports);
tslib_1.__exportStar(require("./http-code.decorator"), exports);
tslib_1.__exportStar(require("./create-route-param-metadata.decorator"), exports);
tslib_1.__exportStar(require("./render.decorator"), exports);
tslib_1.__exportStar(require("./header.decorator"), exports);
tslib_1.__exportStar(require("./redirect.decorator"), exports);
tslib_1.__exportStar(require("./sse.decorator"), exports);

}, function(modId) { var map = {"./request-mapping.decorator":1784796701645,"./http-code.decorator":1784796701648,"./create-route-param-metadata.decorator":1784796701649,"./render.decorator":1784796701651,"./header.decorator":1784796701652,"./redirect.decorator":1784796701653,"./sse.decorator":1784796701654}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701645, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Unlock = exports.Lock = exports.Move = exports.Copy = exports.Mkcol = exports.Proppatch = exports.Propfind = exports.Search = exports.All = exports.Head = exports.Options = exports.Patch = exports.Put = exports.Delete = exports.Get = exports.Post = exports.RequestMapping = void 0;
const constants_1 = require("../../constants");
const request_method_enum_1 = require("../../enums/request-method.enum");
const defaultMetadata = {
    [constants_1.PATH_METADATA]: '/',
    [constants_1.METHOD_METADATA]: request_method_enum_1.RequestMethod.GET,
};
const RequestMapping = (metadata = defaultMetadata) => {
    const pathMetadata = metadata[constants_1.PATH_METADATA];
    const path = pathMetadata && pathMetadata.length ? pathMetadata : '/';
    const requestMethod = metadata[constants_1.METHOD_METADATA] || request_method_enum_1.RequestMethod.GET;
    return (target, key, descriptor) => {
        Reflect.defineMetadata(constants_1.PATH_METADATA, path, descriptor.value);
        Reflect.defineMetadata(constants_1.METHOD_METADATA, requestMethod, descriptor.value);
        return descriptor;
    };
};
exports.RequestMapping = RequestMapping;
const createMappingDecorator = (method) => (path) => {
    return (0, exports.RequestMapping)({
        [constants_1.PATH_METADATA]: path,
        [constants_1.METHOD_METADATA]: method,
    });
};
/**
 * Route handler (method) Decorator. Routes HTTP POST requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Post = createMappingDecorator(request_method_enum_1.RequestMethod.POST);
/**
 * Route handler (method) Decorator. Routes HTTP GET requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Get = createMappingDecorator(request_method_enum_1.RequestMethod.GET);
/**
 * Route handler (method) Decorator. Routes HTTP DELETE requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Delete = createMappingDecorator(request_method_enum_1.RequestMethod.DELETE);
/**
 * Route handler (method) Decorator. Routes HTTP PUT requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Put = createMappingDecorator(request_method_enum_1.RequestMethod.PUT);
/**
 * Route handler (method) Decorator. Routes HTTP PATCH requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Patch = createMappingDecorator(request_method_enum_1.RequestMethod.PATCH);
/**
 * Route handler (method) Decorator. Routes HTTP OPTIONS requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Options = createMappingDecorator(request_method_enum_1.RequestMethod.OPTIONS);
/**
 * Route handler (method) Decorator. Routes HTTP HEAD requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Head = createMappingDecorator(request_method_enum_1.RequestMethod.HEAD);
/**
 * Route handler (method) Decorator. Routes all HTTP requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.All = createMappingDecorator(request_method_enum_1.RequestMethod.ALL);
/**
 * Route handler (method) Decorator. Routes HTTP SEARCH requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Search = createMappingDecorator(request_method_enum_1.RequestMethod.SEARCH);
/**
 * Route handler (method) Decorator. Routes Webdav PROPFIND requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Propfind = createMappingDecorator(request_method_enum_1.RequestMethod.PROPFIND);
/**
 * Route handler (method) Decorator. Routes Webdav PROPPATCH requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Proppatch = createMappingDecorator(request_method_enum_1.RequestMethod.PROPPATCH);
/**
 * Route handler (method) Decorator. Routes Webdav MKCOL requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Mkcol = createMappingDecorator(request_method_enum_1.RequestMethod.MKCOL);
/**
 * Route handler (method) Decorator. Routes Webdav COPY requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Copy = createMappingDecorator(request_method_enum_1.RequestMethod.COPY);
/**
 * Route handler (method) Decorator. Routes Webdav MOVE requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Move = createMappingDecorator(request_method_enum_1.RequestMethod.MOVE);
/**
 * Route handler (method) Decorator. Routes Webdav LOCK requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Lock = createMappingDecorator(request_method_enum_1.RequestMethod.LOCK);
/**
 * Route handler (method) Decorator. Routes Webdav UNLOCK requests to the specified path.
 *
 * @see [Routing](https://docs.nestjs.com/controllers#routing)
 *
 * @publicApi
 */
exports.Unlock = createMappingDecorator(request_method_enum_1.RequestMethod.UNLOCK);

}, function(modId) { var map = {"../../constants":1784796701624,"../../enums/request-method.enum":1784796701646}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701646, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestMethod = void 0;
var RequestMethod;
(function (RequestMethod) {
    RequestMethod[RequestMethod["GET"] = 0] = "GET";
    RequestMethod[RequestMethod["POST"] = 1] = "POST";
    RequestMethod[RequestMethod["PUT"] = 2] = "PUT";
    RequestMethod[RequestMethod["DELETE"] = 3] = "DELETE";
    RequestMethod[RequestMethod["PATCH"] = 4] = "PATCH";
    RequestMethod[RequestMethod["ALL"] = 5] = "ALL";
    RequestMethod[RequestMethod["OPTIONS"] = 6] = "OPTIONS";
    RequestMethod[RequestMethod["HEAD"] = 7] = "HEAD";
    RequestMethod[RequestMethod["SEARCH"] = 8] = "SEARCH";
    RequestMethod[RequestMethod["PROPFIND"] = 9] = "PROPFIND";
    RequestMethod[RequestMethod["PROPPATCH"] = 10] = "PROPPATCH";
    RequestMethod[RequestMethod["MKCOL"] = 11] = "MKCOL";
    RequestMethod[RequestMethod["COPY"] = 12] = "COPY";
    RequestMethod[RequestMethod["MOVE"] = 13] = "MOVE";
    RequestMethod[RequestMethod["LOCK"] = 14] = "LOCK";
    RequestMethod[RequestMethod["UNLOCK"] = 15] = "UNLOCK";
})(RequestMethod || (exports.RequestMethod = RequestMethod = {}));

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701648, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpCode = HttpCode;
const constants_1 = require("../../constants");
/**
 * Request method Decorator.  Defines the HTTP response status code.  Overrides
 * default status code for the decorated request method.
 *
 * @param statusCode HTTP response code to be returned by route handler.
 *
 * @see [Http Status Codes](https://docs.nestjs.com/controllers#status-code)
 *
 * @publicApi
 */
function HttpCode(statusCode) {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(constants_1.HTTP_CODE_METADATA, statusCode, descriptor.value);
        return descriptor;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701649, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.createParamDecorator = createParamDecorator;
const uid_1 = require("uid");
const constants_1 = require("../../constants");
const assign_custom_metadata_util_1 = require("../../utils/assign-custom-metadata.util");
const shared_utils_1 = require("../../utils/shared.utils");
/**
 * Defines HTTP route param decorator
 *
 * @param factory
 * @param enhancers
 *
 * @publicApi
 */
function createParamDecorator(factory, enhancers = []) {
    const paramtype = (0, uid_1.uid)(21);
    return (data, ...pipes) => (target, key, index) => {
        const args = Reflect.getMetadata(constants_1.ROUTE_ARGS_METADATA, target.constructor, key) ||
            {};
        const isPipe = (pipe) => pipe &&
            (((0, shared_utils_1.isFunction)(pipe) &&
                pipe.prototype &&
                (0, shared_utils_1.isFunction)(pipe.prototype.transform)) ||
                (0, shared_utils_1.isFunction)(pipe.transform));
        const hasParamData = (0, shared_utils_1.isNil)(data) || !isPipe(data);
        const paramData = hasParamData ? data : undefined;
        const paramPipes = hasParamData ? pipes : [data, ...pipes];
        Reflect.defineMetadata(constants_1.ROUTE_ARGS_METADATA, (0, assign_custom_metadata_util_1.assignCustomParameterMetadata)(args, paramtype, index, factory, paramData, ...paramPipes), target.constructor, key);
        enhancers.forEach(fn => fn(target, key, index));
    };
}

}, function(modId) { var map = {"../../constants":1784796701624,"../../utils/assign-custom-metadata.util":1784796701650,"../../utils/shared.utils":1784796701626}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701650, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.assignCustomParameterMetadata = assignCustomParameterMetadata;
const constants_1 = require("../constants");
function assignCustomParameterMetadata(args, paramtype, index, factory, data, ...pipes) {
    return {
        ...args,
        [`${paramtype}${constants_1.CUSTOM_ROUTE_ARGS_METADATA}:${index}`]: {
            index,
            factory,
            data,
            pipes,
        },
    };
}

}, function(modId) { var map = {"../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701651, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Render = Render;
const constants_1 = require("../../constants");
/**
 * Route handler method Decorator.  Defines a template to be rendered by the controller.
 *
 * For example: `@Render('index')`
 *
 * @param template name of the render engine template file
 *
 * @see [Model-View-Controller](https://docs.nestjs.com/techniques/mvc)
 *
 * @publicApi
 */
function Render(template) {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(constants_1.RENDER_METADATA, template, descriptor.value);
        return descriptor;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701652, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = Header;
const constants_1 = require("../../constants");
const extend_metadata_util_1 = require("../../utils/extend-metadata.util");
/**
 * Request method Decorator.  Sets a response header.
 *
 * For example:
 * `@Header('Cache-Control', 'none')`
 * `@Header('Cache-Control', () => 'none')`
 *
 * @param name string to be used for header name
 * @param value string to be used for header value
 *
 * @see [Headers](https://docs.nestjs.com/controllers#headers)
 *
 * @publicApi
 */
function Header(name, value) {
    return (target, key, descriptor) => {
        (0, extend_metadata_util_1.extendArrayMetadata)(constants_1.HEADERS_METADATA, [{ name, value }], descriptor.value);
        return descriptor;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624,"../../utils/extend-metadata.util":1784796701629}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701653, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Redirect = Redirect;
const constants_1 = require("../../constants");
/**
 * Redirects request to the specified URL.
 *
 * @publicApi
 */
function Redirect(url = '', statusCode) {
    return (target, key, descriptor) => {
        Reflect.defineMetadata(constants_1.REDIRECT_METADATA, { statusCode, url }, descriptor.value);
        return descriptor;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701654, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Sse = Sse;
const constants_1 = require("../../constants");
const request_method_enum_1 = require("../../enums/request-method.enum");
/**
 * Declares this route as a Server-Sent-Events endpoint
 *
 * @publicApi
 */
function Sse(path) {
    return (target, key, descriptor) => {
        path = path && path.length ? path : '/';
        Reflect.defineMetadata(constants_1.PATH_METADATA, path, descriptor.value);
        Reflect.defineMetadata(constants_1.METHOD_METADATA, request_method_enum_1.RequestMethod.GET, descriptor.value);
        Reflect.defineMetadata(constants_1.SSE_METADATA, true, descriptor.value);
        return descriptor;
    };
}

}, function(modId) { var map = {"../../constants":1784796701624,"../../enums/request-method.enum":1784796701646}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701655, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./request-method.enum"), exports);
tslib_1.__exportStar(require("./http-status.enum"), exports);
tslib_1.__exportStar(require("./shutdown-signal.enum"), exports);
tslib_1.__exportStar(require("./version-type.enum"), exports);

}, function(modId) { var map = {"./request-method.enum":1784796701646,"./http-status.enum":1784796701656,"./shutdown-signal.enum":1784796701657,"./version-type.enum":1784796701658}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701656, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStatus = void 0;
/**
 * @publicApi
 */
var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["CONTINUE"] = 100] = "CONTINUE";
    HttpStatus[HttpStatus["SWITCHING_PROTOCOLS"] = 101] = "SWITCHING_PROTOCOLS";
    HttpStatus[HttpStatus["PROCESSING"] = 102] = "PROCESSING";
    HttpStatus[HttpStatus["EARLYHINTS"] = 103] = "EARLYHINTS";
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["ACCEPTED"] = 202] = "ACCEPTED";
    HttpStatus[HttpStatus["NON_AUTHORITATIVE_INFORMATION"] = 203] = "NON_AUTHORITATIVE_INFORMATION";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatus[HttpStatus["RESET_CONTENT"] = 205] = "RESET_CONTENT";
    HttpStatus[HttpStatus["PARTIAL_CONTENT"] = 206] = "PARTIAL_CONTENT";
    HttpStatus[HttpStatus["MULTI_STATUS"] = 207] = "MULTI_STATUS";
    HttpStatus[HttpStatus["ALREADY_REPORTED"] = 208] = "ALREADY_REPORTED";
    HttpStatus[HttpStatus["CONTENT_DIFFERENT"] = 210] = "CONTENT_DIFFERENT";
    HttpStatus[HttpStatus["AMBIGUOUS"] = 300] = "AMBIGUOUS";
    HttpStatus[HttpStatus["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
    HttpStatus[HttpStatus["FOUND"] = 302] = "FOUND";
    HttpStatus[HttpStatus["SEE_OTHER"] = 303] = "SEE_OTHER";
    HttpStatus[HttpStatus["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
    HttpStatus[HttpStatus["TEMPORARY_REDIRECT"] = 307] = "TEMPORARY_REDIRECT";
    HttpStatus[HttpStatus["PERMANENT_REDIRECT"] = 308] = "PERMANENT_REDIRECT";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatus[HttpStatus["PAYMENT_REQUIRED"] = 402] = "PAYMENT_REQUIRED";
    HttpStatus[HttpStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    HttpStatus[HttpStatus["NOT_ACCEPTABLE"] = 406] = "NOT_ACCEPTABLE";
    HttpStatus[HttpStatus["PROXY_AUTHENTICATION_REQUIRED"] = 407] = "PROXY_AUTHENTICATION_REQUIRED";
    HttpStatus[HttpStatus["REQUEST_TIMEOUT"] = 408] = "REQUEST_TIMEOUT";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["GONE"] = 410] = "GONE";
    HttpStatus[HttpStatus["LENGTH_REQUIRED"] = 411] = "LENGTH_REQUIRED";
    HttpStatus[HttpStatus["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
    HttpStatus[HttpStatus["PAYLOAD_TOO_LARGE"] = 413] = "PAYLOAD_TOO_LARGE";
    HttpStatus[HttpStatus["URI_TOO_LONG"] = 414] = "URI_TOO_LONG";
    HttpStatus[HttpStatus["UNSUPPORTED_MEDIA_TYPE"] = 415] = "UNSUPPORTED_MEDIA_TYPE";
    HttpStatus[HttpStatus["REQUESTED_RANGE_NOT_SATISFIABLE"] = 416] = "REQUESTED_RANGE_NOT_SATISFIABLE";
    HttpStatus[HttpStatus["EXPECTATION_FAILED"] = 417] = "EXPECTATION_FAILED";
    HttpStatus[HttpStatus["I_AM_A_TEAPOT"] = 418] = "I_AM_A_TEAPOT";
    HttpStatus[HttpStatus["MISDIRECTED"] = 421] = "MISDIRECTED";
    HttpStatus[HttpStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatus[HttpStatus["LOCKED"] = 423] = "LOCKED";
    HttpStatus[HttpStatus["FAILED_DEPENDENCY"] = 424] = "FAILED_DEPENDENCY";
    HttpStatus[HttpStatus["PRECONDITION_REQUIRED"] = 428] = "PRECONDITION_REQUIRED";
    HttpStatus[HttpStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HttpStatus[HttpStatus["UNRECOVERABLE_ERROR"] = 456] = "UNRECOVERABLE_ERROR";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatus[HttpStatus["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    HttpStatus[HttpStatus["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HttpStatus[HttpStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    HttpStatus[HttpStatus["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
    HttpStatus[HttpStatus["HTTP_VERSION_NOT_SUPPORTED"] = 505] = "HTTP_VERSION_NOT_SUPPORTED";
    HttpStatus[HttpStatus["INSUFFICIENT_STORAGE"] = 507] = "INSUFFICIENT_STORAGE";
    HttpStatus[HttpStatus["LOOP_DETECTED"] = 508] = "LOOP_DETECTED";
})(HttpStatus || (exports.HttpStatus = HttpStatus = {}));

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701657, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ShutdownSignal = void 0;
/**
 * System signals which shut down a process
 */
var ShutdownSignal;
(function (ShutdownSignal) {
    ShutdownSignal["SIGHUP"] = "SIGHUP";
    ShutdownSignal["SIGINT"] = "SIGINT";
    ShutdownSignal["SIGQUIT"] = "SIGQUIT";
    ShutdownSignal["SIGILL"] = "SIGILL";
    ShutdownSignal["SIGTRAP"] = "SIGTRAP";
    ShutdownSignal["SIGABRT"] = "SIGABRT";
    ShutdownSignal["SIGBUS"] = "SIGBUS";
    ShutdownSignal["SIGFPE"] = "SIGFPE";
    ShutdownSignal["SIGSEGV"] = "SIGSEGV";
    ShutdownSignal["SIGUSR2"] = "SIGUSR2";
    ShutdownSignal["SIGTERM"] = "SIGTERM";
})(ShutdownSignal || (exports.ShutdownSignal = ShutdownSignal = {}));

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701658, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.VersioningType = void 0;
/**
 * @publicApi
 */
var VersioningType;
(function (VersioningType) {
    VersioningType[VersioningType["URI"] = 0] = "URI";
    VersioningType[VersioningType["HEADER"] = 1] = "HEADER";
    VersioningType[VersioningType["MEDIA_TYPE"] = 2] = "MEDIA_TYPE";
    VersioningType[VersioningType["CUSTOM"] = 3] = "CUSTOM";
})(VersioningType || (exports.VersioningType = VersioningType = {}));

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701659, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./bad-gateway.exception"), exports);
tslib_1.__exportStar(require("./bad-request.exception"), exports);
tslib_1.__exportStar(require("./conflict.exception"), exports);
tslib_1.__exportStar(require("./forbidden.exception"), exports);
tslib_1.__exportStar(require("./gateway-timeout.exception"), exports);
tslib_1.__exportStar(require("./gone.exception"), exports);
tslib_1.__exportStar(require("./http-version-not-supported.exception"), exports);
tslib_1.__exportStar(require("./http.exception"), exports);
tslib_1.__exportStar(require("./im-a-teapot.exception"), exports);
tslib_1.__exportStar(require("./internal-server-error.exception"), exports);
tslib_1.__exportStar(require("./intrinsic.exception"), exports);
tslib_1.__exportStar(require("./method-not-allowed.exception"), exports);
tslib_1.__exportStar(require("./misdirected.exception"), exports);
tslib_1.__exportStar(require("./not-acceptable.exception"), exports);
tslib_1.__exportStar(require("./not-found.exception"), exports);
tslib_1.__exportStar(require("./not-implemented.exception"), exports);
tslib_1.__exportStar(require("./payload-too-large.exception"), exports);
tslib_1.__exportStar(require("./precondition-failed.exception"), exports);
tslib_1.__exportStar(require("./request-timeout.exception"), exports);
tslib_1.__exportStar(require("./service-unavailable.exception"), exports);
tslib_1.__exportStar(require("./unauthorized.exception"), exports);
tslib_1.__exportStar(require("./unprocessable-entity.exception"), exports);
tslib_1.__exportStar(require("./unsupported-media-type.exception"), exports);

}, function(modId) { var map = {"./bad-gateway.exception":1784796701660,"./bad-request.exception":1784796701662,"./conflict.exception":1784796701664,"./forbidden.exception":1784796701666,"./gateway-timeout.exception":1784796701668,"./gone.exception":1784796701670,"./http-version-not-supported.exception":1784796701672,"./im-a-teapot.exception":1784796701675,"./internal-server-error.exception":1784796701677,"./intrinsic.exception":1784796701679,"./method-not-allowed.exception":1784796701680,"./misdirected.exception":1784796701682,"./not-acceptable.exception":1784796701684,"./not-found.exception":1784796701686,"./not-implemented.exception":1784796701688,"./payload-too-large.exception":1784796701690,"./precondition-failed.exception":1784796701692,"./request-timeout.exception":1784796701694,"./service-unavailable.exception":1784796701696,"./unauthorized.exception":1784796701698,"./unprocessable-entity.exception":1784796701700,"./unsupported-media-type.exception":1784796701702}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701660, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.BadGatewayException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Bad Gateway* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class BadGatewayException extends http_exception_1.HttpException {
    /**
     * Instantiate a `BadGatewayException` Exception.
     *
     * @example
     * `throw new BadGatewayException()`
     *
     * @usageNotes
     * The HTTP response status code will be 502.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 502.
     * - `message`: the string `'Bad Gateway'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Bad Gateway') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.BAD_GATEWAY), http_status_enum_1.HttpStatus.BAD_GATEWAY, httpExceptionOptions);
    }
}
exports.BadGatewayException = BadGatewayException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701662, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Bad Request* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class BadRequestException extends http_exception_1.HttpException {
    /**
     * Instantiate a `BadRequestException` Exception.
     *
     * @example
     * `throw new BadRequestException()`
     *
     * @usageNotes
     * The HTTP response status code will be 400.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 400.
     * - `message`: the string `'Bad Request'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Bad Request') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.BAD_REQUEST), http_status_enum_1.HttpStatus.BAD_REQUEST, httpExceptionOptions);
    }
}
exports.BadRequestException = BadRequestException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701664, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Conflict* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class ConflictException extends http_exception_1.HttpException {
    /**
     * Instantiate a `ConflictException` Exception.
     *
     * @example
     * `throw new ConflictException()`
     *
     * @usageNotes
     * The HTTP response status code will be 409.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 409.
     * - `message`: the string `'Conflict'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Conflict') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.CONFLICT), http_status_enum_1.HttpStatus.CONFLICT, httpExceptionOptions);
    }
}
exports.ConflictException = ConflictException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701666, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Forbidden* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class ForbiddenException extends http_exception_1.HttpException {
    /**
     * Instantiate a `ForbiddenException` Exception.
     *
     * @example
     * `throw new ForbiddenException()`
     *
     * @usageNotes
     * The HTTP response status code will be 403.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 403.
     * - `message`: the string `'Forbidden'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Forbidden') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.FORBIDDEN), http_status_enum_1.HttpStatus.FORBIDDEN, httpExceptionOptions);
    }
}
exports.ForbiddenException = ForbiddenException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701668, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayTimeoutException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Gateway Timeout* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class GatewayTimeoutException extends http_exception_1.HttpException {
    /**
     * Instantiate a `GatewayTimeoutException` Exception.
     *
     * @example
     * `throw new GatewayTimeoutException()`
     *
     * @usageNotes
     * The HTTP response status code will be 504.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 504.
     * - `message`: the string `'Gateway Timeout'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Gateway Timeout') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.GATEWAY_TIMEOUT), http_status_enum_1.HttpStatus.GATEWAY_TIMEOUT, httpExceptionOptions);
    }
}
exports.GatewayTimeoutException = GatewayTimeoutException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701670, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.GoneException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Gone* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class GoneException extends http_exception_1.HttpException {
    /**
     * Instantiate a `GoneException` Exception.
     *
     * @example
     * `throw new GoneException()`
     *
     * @usageNotes
     * The HTTP response status code will be 410.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 410.
     * - `message`: the string `'Gone'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Gone') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.GONE), http_status_enum_1.HttpStatus.GONE, httpExceptionOptions);
    }
}
exports.GoneException = GoneException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701672, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpVersionNotSupportedException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Http Version Not Supported* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class HttpVersionNotSupportedException extends http_exception_1.HttpException {
    /**
     * Instantiate a `HttpVersionNotSupportedException` Exception.
     *
     * @example
     * `throw new HttpVersionNotSupportedException()`
     *
     * @usageNotes
     * The HTTP response status code will be 505.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 505.
     * - `message`: the string `'HTTP Version Not Supported'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'HTTP Version Not Supported') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.HTTP_VERSION_NOT_SUPPORTED), http_status_enum_1.HttpStatus.HTTP_VERSION_NOT_SUPPORTED, httpExceptionOptions);
    }
}
exports.HttpVersionNotSupportedException = HttpVersionNotSupportedException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701675, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ImATeapotException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *ImATeapotException* type errors.
 *
 * Any attempt to brew coffee with a teapot should result in the error code
 * "418 I'm a teapot". The resulting entity body MAY be short and stout.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class ImATeapotException extends http_exception_1.HttpException {
    /**
     * Instantiate an `ImATeapotException` Exception.
     *
     * @example
     * `throw new ImATeapotException()`
     *
     * @usageNotes
     * The HTTP response status code will be 418.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 418.
     * - `message`: the string `"I'm a Teapot"` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = `I'm a teapot`) {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.I_AM_A_TEAPOT), http_status_enum_1.HttpStatus.I_AM_A_TEAPOT, httpExceptionOptions);
    }
}
exports.ImATeapotException = ImATeapotException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701677, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerErrorException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Internal Server Error* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class InternalServerErrorException extends http_exception_1.HttpException {
    /**
     * Instantiate an `InternalServerErrorException` Exception.
     *
     * @example
     * `throw new InternalServerErrorException()`
     *
     * @usageNotes
     * The HTTP response status code will be 500.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 500.
     * - `message`: the string `'Internal Server Error'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Internal Server Error') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR), http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR, httpExceptionOptions);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701679, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.IntrinsicException = void 0;
/**
 * Exception that represents an intrinsic error in the application.
 * When thrown, the default exception filter will not log the error message.
 *
 * @publicApi
 */
class IntrinsicException extends Error {
}
exports.IntrinsicException = IntrinsicException;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701680, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodNotAllowedException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Method Not Allowed* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class MethodNotAllowedException extends http_exception_1.HttpException {
    /**
     * Instantiate a `MethodNotAllowedException` Exception.
     *
     * @example
     * `throw new MethodNotAllowedException()`
     *
     * @usageNotes
     * The HTTP response status code will be 405.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 405.
     * - `message`: the string `'Method Not Allowed'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Method Not Allowed') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.METHOD_NOT_ALLOWED), http_status_enum_1.HttpStatus.METHOD_NOT_ALLOWED, httpExceptionOptions);
    }
}
exports.MethodNotAllowedException = MethodNotAllowedException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701682, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.MisdirectedException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Misdirected* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class MisdirectedException extends http_exception_1.HttpException {
    /**
     * Instantiate a `MisdirectedException` Exception.
     *
     * @example
     * `throw new MisdirectedException()`
     *
     * @usageNotes
     * The HTTP response status code will be 421.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 421.
     * - `message`: the string `'Bad Gateway'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Misdirected') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.MISDIRECTED), http_status_enum_1.HttpStatus.MISDIRECTED, httpExceptionOptions);
    }
}
exports.MisdirectedException = MisdirectedException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701684, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.NotAcceptableException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Not Acceptable* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class NotAcceptableException extends http_exception_1.HttpException {
    /**
     * Instantiate a `NotAcceptableException` Exception.
     *
     * @example
     * `throw new NotAcceptableException()`
     *
     * @usageNotes
     * The HTTP response status code will be 406.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 406.
     * - `error`: the string `'Not Acceptable'` by default; override this by supplying
     * a string in the `error` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Not Acceptable') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.NOT_ACCEPTABLE), http_status_enum_1.HttpStatus.NOT_ACCEPTABLE, httpExceptionOptions);
    }
}
exports.NotAcceptableException = NotAcceptableException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701686, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Not Found* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class NotFoundException extends http_exception_1.HttpException {
    /**
     * Instantiate a `NotFoundException` Exception.
     *
     * @example
     * `throw new NotFoundException()`
     *
     * @usageNotes
     * The HTTP response status code will be 404.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 404.
     * - `message`: the string `'Not Found'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Not Found') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.NOT_FOUND), http_status_enum_1.HttpStatus.NOT_FOUND, httpExceptionOptions);
    }
}
exports.NotFoundException = NotFoundException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701688, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Not Implemented* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class NotImplementedException extends http_exception_1.HttpException {
    /**
     * Instantiate a `NotImplementedException` Exception.
     *
     * @example
     * `throw new NotImplementedException()`
     *
     * @usageNotes
     * The HTTP response status code will be 501.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 501.
     * - `message`: the string `'Not Implemented'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     * @param error a short description of the HTTP error.
     */
    constructor(objectOrError, descriptionOrOptions = 'Not Implemented') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.NOT_IMPLEMENTED), http_status_enum_1.HttpStatus.NOT_IMPLEMENTED, httpExceptionOptions);
    }
}
exports.NotImplementedException = NotImplementedException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701690, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadTooLargeException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Payload Too Large* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class PayloadTooLargeException extends http_exception_1.HttpException {
    /**
     * Instantiate a `PayloadTooLargeException` Exception.
     *
     * @example
     * `throw new PayloadTooLargeException()`
     *
     * @usageNotes
     * The HTTP response status code will be 413.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 413.
     * - `message`: the string `'Payload Too Large'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Payload Too Large') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.PAYLOAD_TOO_LARGE), http_status_enum_1.HttpStatus.PAYLOAD_TOO_LARGE, httpExceptionOptions);
    }
}
exports.PayloadTooLargeException = PayloadTooLargeException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701692, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.PreconditionFailedException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Precondition Failed* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class PreconditionFailedException extends http_exception_1.HttpException {
    /**
     * Instantiate a `PreconditionFailedException` Exception.
     *
     * @example
     * `throw new PreconditionFailedException()`
     *
     * @usageNotes
     * The HTTP response status code will be 412.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 412.
     * - `message`: the string `'Precondition Failed'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Precondition Failed') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.PRECONDITION_FAILED), http_status_enum_1.HttpStatus.PRECONDITION_FAILED, httpExceptionOptions);
    }
}
exports.PreconditionFailedException = PreconditionFailedException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701694, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestTimeoutException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Request Timeout* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class RequestTimeoutException extends http_exception_1.HttpException {
    /**
     * Instantiate a `RequestTimeoutException` Exception.
     *
     * @example
     * `throw new RequestTimeoutException()`
     *
     * @usageNotes
     * The HTTP response status code will be 408.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 408.
     * - `message`: the string `'Request Timeout'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Request Timeout') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.REQUEST_TIMEOUT), http_status_enum_1.HttpStatus.REQUEST_TIMEOUT, httpExceptionOptions);
    }
}
exports.RequestTimeoutException = RequestTimeoutException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701696, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Service Unavailable* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class ServiceUnavailableException extends http_exception_1.HttpException {
    /**
     * Instantiate a `ServiceUnavailableException` Exception.
     *
     * @example
     * `throw new ServiceUnavailableException()`
     *
     * @usageNotes
     * The HTTP response status code will be 503.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 503.
     * - `message`: the string `'Service Unavailable'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Service Unavailable') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.SERVICE_UNAVAILABLE), http_status_enum_1.HttpStatus.SERVICE_UNAVAILABLE, httpExceptionOptions);
    }
}
exports.ServiceUnavailableException = ServiceUnavailableException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701698, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Unauthorized* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class UnauthorizedException extends http_exception_1.HttpException {
    /**
     * Instantiate an `UnauthorizedException` Exception.
     *
     * @example
     * `throw new UnauthorizedException()`
     *
     * @usageNotes
     * The HTTP response status code will be 401.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 401.
     * - `message`: the string `'Unauthorized'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Unauthorized') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.UNAUTHORIZED), http_status_enum_1.HttpStatus.UNAUTHORIZED, httpExceptionOptions);
    }
}
exports.UnauthorizedException = UnauthorizedException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701700, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.UnprocessableEntityException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Unprocessable Entity* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class UnprocessableEntityException extends http_exception_1.HttpException {
    /**
     * Instantiate an `UnprocessableEntityException` Exception.
     *
     * @example
     * `throw new UnprocessableEntityException()`
     *
     * @usageNotes
     * The HTTP response status code will be 422.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 422.
     * - `message`: the string `'Unprocessable Entity'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Unprocessable Entity') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.UNPROCESSABLE_ENTITY), http_status_enum_1.HttpStatus.UNPROCESSABLE_ENTITY, httpExceptionOptions);
    }
}
exports.UnprocessableEntityException = UnprocessableEntityException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701702, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsupportedMediaTypeException = void 0;
const http_status_enum_1 = require("../enums/http-status.enum");
const http_exception_1 = require("./http.exception");
/**
 * Defines an HTTP exception for *Unsupported Media Type* type errors.
 *
 * @see [Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)
 *
 * @publicApi
 */
class UnsupportedMediaTypeException extends http_exception_1.HttpException {
    /**
     * Instantiate an `UnsupportedMediaTypeException` Exception.
     *
     * @example
     * `throw new UnsupportedMediaTypeException()`
     *
     * @usageNotes
     * The HTTP response status code will be 415.
     * - The `objectOrError` argument defines the JSON response body or the message string.
     * - The `descriptionOrOptions` argument contains either a short description of the HTTP error or an options object used to provide an underlying error cause.
     *
     * By default, the JSON response body contains two properties:
     * - `statusCode`: this will be the value 415.
     * - `message`: the string `'Unsupported Media Type'` by default; override this by supplying
     * a string in the `objectOrError` parameter.
     *
     * If the parameter `objectOrError` is a string, the response body will contain an
     * additional property, `error`, with a short description of the HTTP error. To override the
     * entire JSON response body, pass an object instead. Nest will serialize the object
     * and return it as the JSON response body.
     *
     * @param objectOrError string or object describing the error condition.
     * @param descriptionOrOptions either a short description of the HTTP error or an options object used to provide an underlying error cause
     */
    constructor(objectOrError, descriptionOrOptions = 'Unsupported Media Type') {
        const { description, httpExceptionOptions } = http_exception_1.HttpException.extractDescriptionAndOptionsFrom(descriptionOrOptions);
        super(http_exception_1.HttpException.createBody(objectOrError, description, http_status_enum_1.HttpStatus.UNSUPPORTED_MEDIA_TYPE), http_status_enum_1.HttpStatus.UNSUPPORTED_MEDIA_TYPE, httpExceptionOptions);
    }
}
exports.UnsupportedMediaTypeException = UnsupportedMediaTypeException;

}, function(modId) { var map = {"../enums/http-status.enum":1784796701656}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701704, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./streamable-file"), exports);

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701706, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./abstract.interface"), exports);
tslib_1.__exportStar(require("./controllers/controller-metadata.interface"), exports);
tslib_1.__exportStar(require("./controllers/controller.interface"), exports);
tslib_1.__exportStar(require("./exceptions/exception-filter.interface"), exports);
tslib_1.__exportStar(require("./exceptions/rpc-exception-filter.interface"), exports);
tslib_1.__exportStar(require("./exceptions/ws-exception-filter.interface"), exports);
tslib_1.__exportStar(require("./external/validation-error.interface"), exports);
tslib_1.__exportStar(require("./features/arguments-host.interface"), exports);
tslib_1.__exportStar(require("./features/can-activate.interface"), exports);
tslib_1.__exportStar(require("./features/custom-route-param-factory.interface"), exports);
tslib_1.__exportStar(require("./features/execution-context.interface"), exports);
tslib_1.__exportStar(require("./features/nest-interceptor.interface"), exports);
tslib_1.__exportStar(require("./features/paramtype.interface"), exports);
tslib_1.__exportStar(require("./features/pipe-transform.interface"), exports);
tslib_1.__exportStar(require("./global-prefix-options.interface"), exports);
tslib_1.__exportStar(require("./hooks"), exports);
tslib_1.__exportStar(require("./http"), exports);
tslib_1.__exportStar(require("./injectable.interface"), exports);
tslib_1.__exportStar(require("./microservices/nest-hybrid-application-options.interface"), exports);
tslib_1.__exportStar(require("./middleware"), exports);
tslib_1.__exportStar(require("./modules"), exports);
tslib_1.__exportStar(require("./nest-application-context.interface"), exports);
tslib_1.__exportStar(require("./nest-application-options.interface"), exports);
tslib_1.__exportStar(require("./nest-application.interface"), exports);
tslib_1.__exportStar(require("./nest-microservice.interface"), exports);
tslib_1.__exportStar(require("./scope-options.interface"), exports);
tslib_1.__exportStar(require("./type.interface"), exports);
tslib_1.__exportStar(require("./version-options.interface"), exports);
tslib_1.__exportStar(require("./websockets/web-socket-adapter.interface"), exports);

}, function(modId) { var map = {"./abstract.interface":1784796701707,"./controllers/controller-metadata.interface":1784796701708,"./controllers/controller.interface":1784796701709,"./exceptions/exception-filter.interface":1784796701710,"./exceptions/rpc-exception-filter.interface":1784796701711,"./exceptions/ws-exception-filter.interface":1784796701712,"./external/validation-error.interface":1784796701713,"./features/arguments-host.interface":1784796701714,"./features/can-activate.interface":1784796701715,"./features/custom-route-param-factory.interface":1784796701716,"./features/execution-context.interface":1784796701717,"./features/nest-interceptor.interface":1784796701718,"./features/paramtype.interface":1784796701719,"./features/pipe-transform.interface":1784796701720,"./global-prefix-options.interface":1784796701721,"./hooks":1784796701722,"./http":1784796701728,"./injectable.interface":1784796701734,"./microservices/nest-hybrid-application-options.interface":1784796701735,"./middleware":1784796701736,"./modules":1784796701741,"./nest-application-context.interface":1784796701750,"./nest-application-options.interface":1784796701751,"./nest-application.interface":1784796701752,"./nest-microservice.interface":1784796701753,"./scope-options.interface":1784796701754,"./type.interface":1784796701755,"./version-options.interface":1784796701756,"./websockets/web-socket-adapter.interface":1784796701757}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701707, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701708, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701709, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701710, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701711, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701712, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701713, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701714, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701715, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701716, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701717, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701718, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701719, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701720, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701721, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701722, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./before-application-shutdown.interface"), exports);
tslib_1.__exportStar(require("./on-application-bootstrap.interface"), exports);
tslib_1.__exportStar(require("./on-application-shutdown.interface"), exports);
tslib_1.__exportStar(require("./on-destroy.interface"), exports);
tslib_1.__exportStar(require("./on-init.interface"), exports);

}, function(modId) { var map = {"./before-application-shutdown.interface":1784796701723,"./on-application-bootstrap.interface":1784796701724,"./on-application-shutdown.interface":1784796701725,"./on-destroy.interface":1784796701726,"./on-init.interface":1784796701727}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701723, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701724, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701725, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701726, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701727, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701728, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./http-exception-body.interface"), exports);
tslib_1.__exportStar(require("./http-redirect-response.interface"), exports);
tslib_1.__exportStar(require("./http-server.interface"), exports);
tslib_1.__exportStar(require("./message-event.interface"), exports);
tslib_1.__exportStar(require("./raw-body-request.interface"), exports);

}, function(modId) { var map = {"./http-exception-body.interface":1784796701729,"./http-redirect-response.interface":1784796701730,"./http-server.interface":1784796701731,"./message-event.interface":1784796701732,"./raw-body-request.interface":1784796701733}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701729, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701730, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701731, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701732, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701733, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701734, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701735, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701736, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./middleware-config-proxy.interface"), exports);
tslib_1.__exportStar(require("./middleware-configuration.interface"), exports);
tslib_1.__exportStar(require("./middleware-consumer.interface"), exports);
tslib_1.__exportStar(require("./nest-middleware.interface"), exports);

}, function(modId) { var map = {"./middleware-config-proxy.interface":1784796701737,"./middleware-configuration.interface":1784796701738,"./middleware-consumer.interface":1784796701739,"./nest-middleware.interface":1784796701740}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701737, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701738, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701739, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701740, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701741, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./dynamic-module.interface"), exports);
tslib_1.__exportStar(require("./forward-reference.interface"), exports);
tslib_1.__exportStar(require("./injection-token.interface"), exports);
tslib_1.__exportStar(require("./introspection-result.interface"), exports);
tslib_1.__exportStar(require("./module-metadata.interface"), exports);
tslib_1.__exportStar(require("./nest-module.interface"), exports);
tslib_1.__exportStar(require("./optional-factory-dependency.interface"), exports);
tslib_1.__exportStar(require("./provider.interface"), exports);

}, function(modId) { var map = {"./dynamic-module.interface":1784796701742,"./forward-reference.interface":1784796701743,"./injection-token.interface":1784796701744,"./introspection-result.interface":1784796701745,"./module-metadata.interface":1784796701746,"./nest-module.interface":1784796701747,"./optional-factory-dependency.interface":1784796701748,"./provider.interface":1784796701749}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701742, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701743, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701744, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701745, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701746, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701747, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701748, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701749, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701750, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701751, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701752, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701753, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701754, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = void 0;
/**
 * @publicApi
 */
var Scope;
(function (Scope) {
    /**
     * The provider can be shared across multiple classes. The provider lifetime
     * is strictly tied to the application lifecycle. Once the application has
     * bootstrapped, all providers have been instantiated.
     */
    Scope[Scope["DEFAULT"] = 0] = "DEFAULT";
    /**
     * A new private instance of the provider is instantiated for every use
     */
    Scope[Scope["TRANSIENT"] = 1] = "TRANSIENT";
    /**
     * A new instance is instantiated for each request processing pipeline
     */
    Scope[Scope["REQUEST"] = 2] = "REQUEST";
})(Scope || (exports.Scope = Scope = {}));

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701755, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701756, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.VERSION_NEUTRAL = void 0;
/**
 * Indicates that this will work for any version passed in the request, or no version.
 *
 * @publicApi
 */
exports.VERSION_NEUTRAL = Symbol('VERSION_NEUTRAL');

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701757, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701758, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./configurable-module.builder"), exports);
tslib_1.__exportStar(require("./interfaces"), exports);

}, function(modId) { var map = {"./interfaces":1784796701760}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701760, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./configurable-module-async-options.interface"), exports);
tslib_1.__exportStar(require("./configurable-module-cls.interface"), exports);
tslib_1.__exportStar(require("./configurable-module-host.interface"), exports);

}, function(modId) { var map = {"./configurable-module-async-options.interface":1784796701761,"./configurable-module-cls.interface":1784796701762,"./configurable-module-host.interface":1784796701763}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701761, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701762, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701763, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701764, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./default-value.pipe"), exports);
tslib_1.__exportStar(require("./file"), exports);
tslib_1.__exportStar(require("./parse-array.pipe"), exports);
tslib_1.__exportStar(require("./parse-bool.pipe"), exports);
tslib_1.__exportStar(require("./parse-date.pipe"), exports);
tslib_1.__exportStar(require("./parse-enum.pipe"), exports);
tslib_1.__exportStar(require("./parse-float.pipe"), exports);
tslib_1.__exportStar(require("./parse-int.pipe"), exports);
tslib_1.__exportStar(require("./parse-uuid.pipe"), exports);
tslib_1.__exportStar(require("./validation.pipe"), exports);

}, function(modId) { var map = {"./default-value.pipe":1784796701765,"./file":1784796701766,"./parse-date.pipe":1784796701778}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701765, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultValuePipe = void 0;
const tslib_1 = require("tslib");
const injectable_decorator_1 = require("../decorators/core/injectable.decorator");
const shared_utils_1 = require("../utils/shared.utils");
/**
 * Defines the built-in DefaultValue Pipe
 *
 * @see [Built-in Pipes](https://docs.nestjs.com/pipes#built-in-pipes)
 *
 * @publicApi
 */
let DefaultValuePipe = class DefaultValuePipe {
    constructor(defaultValue) {
        this.defaultValue = defaultValue;
    }
    transform(value, _metadata) {
        if ((0, shared_utils_1.isNil)(value) ||
            ((0, shared_utils_1.isNumber)(value) && isNaN(value))) {
            return this.defaultValue;
        }
        return value;
    }
};
exports.DefaultValuePipe = DefaultValuePipe;
exports.DefaultValuePipe = DefaultValuePipe = tslib_1.__decorate([
    (0, injectable_decorator_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [Object])
], DefaultValuePipe);

}, function(modId) { var map = {"../decorators/core/injectable.decorator":1784796701632,"../utils/shared.utils":1784796701626}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701766, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./file-type.validator"), exports);
tslib_1.__exportStar(require("./file-validator.interface"), exports);
tslib_1.__exportStar(require("./max-file-size.validator"), exports);
tslib_1.__exportStar(require("./parse-file-options.interface"), exports);
tslib_1.__exportStar(require("./parse-file.pipe"), exports);
tslib_1.__exportStar(require("./parse-file-pipe.builder"), exports);

}, function(modId) { var map = {"./file-validator.interface":1784796701768,"./parse-file-options.interface":1784796701770,"./parse-file-pipe.builder":1784796701772}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701768, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FileValidator = void 0;
/**
 * Interface describing FileValidators, which can be added to a ParseFilePipe
 *
 * @see {ParseFilePipe}
 * @publicApi
 */
class FileValidator {
    constructor(validationOptions) {
        this.validationOptions = validationOptions;
    }
}
exports.FileValidator = FileValidator;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701770, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701772, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseFilePipeBuilder = void 0;
const file_type_validator_1 = require("./file-type.validator");
const max_file_size_validator_1 = require("./max-file-size.validator");
const parse_file_pipe_1 = require("./parse-file.pipe");
/**
 * @publicApi
 */
class ParseFilePipeBuilder {
    constructor() {
        this.validators = [];
    }
    addMaxSizeValidator(options) {
        return this.addValidator(new max_file_size_validator_1.MaxFileSizeValidator(options));
    }
    addFileTypeValidator(options) {
        return this.addValidator(new file_type_validator_1.FileTypeValidator(options));
    }
    addValidator(validator) {
        this.validators.push(validator);
        return this;
    }
    build(additionalOptions) {
        const parseFilePipe = new parse_file_pipe_1.ParseFilePipe({
            ...additionalOptions,
            validators: this.validators,
        });
        this.validators = [];
        return parseFilePipe;
    }
}
exports.ParseFilePipeBuilder = ParseFilePipeBuilder;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701778, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseDatePipe = void 0;
const tslib_1 = require("tslib");
const injectable_decorator_1 = require("../decorators/core/injectable.decorator");
const http_status_enum_1 = require("../enums/http-status.enum");
const http_error_by_code_util_1 = require("../utils/http-error-by-code.util");
const shared_utils_1 = require("../utils/shared.utils");
let ParseDatePipe = class ParseDatePipe {
    constructor(options = {}) {
        this.options = options;
        const { exceptionFactory, errorHttpStatusCode = http_status_enum_1.HttpStatus.BAD_REQUEST } = options;
        this.exceptionFactory =
            exceptionFactory ||
                (error => new http_error_by_code_util_1.HttpErrorByCode[errorHttpStatusCode](error));
    }
    /**
     * Method that accesses and performs optional transformation on argument for
     * in-flight requests.
     *
     * @param value currently processed route argument
     * @param metadata contains metadata about the currently processed route argument
     */
    transform(value) {
        if (this.options.optional && (0, shared_utils_1.isNil)(value)) {
            return this.options.default ? this.options.default() : value;
        }
        if (!value) {
            throw this.exceptionFactory('Validation failed (no Date provided)');
        }
        const transformedValue = new Date(value);
        if (isNaN(transformedValue.getTime())) {
            throw this.exceptionFactory('Validation failed (invalid date format)');
        }
        return transformedValue;
    }
};
exports.ParseDatePipe = ParseDatePipe;
exports.ParseDatePipe = ParseDatePipe = tslib_1.__decorate([
    (0, injectable_decorator_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [Object])
], ParseDatePipe);

}, function(modId) { var map = {"../decorators/core/injectable.decorator":1784796701632,"../enums/http-status.enum":1784796701656,"../utils/http-error-by-code.util":1784796701779,"../utils/shared.utils":1784796701626}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701779, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpErrorByCode = void 0;
const enums_1 = require("../enums");
const exceptions_1 = require("../exceptions");
exports.HttpErrorByCode = {
    [enums_1.HttpStatus.BAD_GATEWAY]: exceptions_1.BadGatewayException,
    [enums_1.HttpStatus.BAD_REQUEST]: exceptions_1.BadRequestException,
    [enums_1.HttpStatus.CONFLICT]: exceptions_1.ConflictException,
    [enums_1.HttpStatus.FORBIDDEN]: exceptions_1.ForbiddenException,
    [enums_1.HttpStatus.GATEWAY_TIMEOUT]: exceptions_1.GatewayTimeoutException,
    [enums_1.HttpStatus.GONE]: exceptions_1.GoneException,
    [enums_1.HttpStatus.I_AM_A_TEAPOT]: exceptions_1.ImATeapotException,
    [enums_1.HttpStatus.INTERNAL_SERVER_ERROR]: exceptions_1.InternalServerErrorException,
    [enums_1.HttpStatus.METHOD_NOT_ALLOWED]: exceptions_1.MethodNotAllowedException,
    [enums_1.HttpStatus.NOT_ACCEPTABLE]: exceptions_1.NotAcceptableException,
    [enums_1.HttpStatus.NOT_FOUND]: exceptions_1.NotFoundException,
    [enums_1.HttpStatus.NOT_IMPLEMENTED]: exceptions_1.NotImplementedException,
    [enums_1.HttpStatus.PAYLOAD_TOO_LARGE]: exceptions_1.PayloadTooLargeException,
    [enums_1.HttpStatus.PRECONDITION_FAILED]: exceptions_1.PreconditionFailedException,
    [enums_1.HttpStatus.REQUEST_TIMEOUT]: exceptions_1.RequestTimeoutException,
    [enums_1.HttpStatus.SERVICE_UNAVAILABLE]: exceptions_1.ServiceUnavailableException,
    [enums_1.HttpStatus.UNAUTHORIZED]: exceptions_1.UnauthorizedException,
    [enums_1.HttpStatus.UNPROCESSABLE_ENTITY]: exceptions_1.UnprocessableEntityException,
    [enums_1.HttpStatus.UNSUPPORTED_MEDIA_TYPE]: exceptions_1.UnsupportedMediaTypeException,
};

}, function(modId) { var map = {"../enums":1784796701655,"../exceptions":1784796701659}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701785, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./class-serializer.interceptor"), exports);
tslib_1.__exportStar(require("./decorators"), exports);
tslib_1.__exportStar(require("./class-serializer.interfaces"), exports);

}, function(modId) { var map = {"./decorators":1784796701787,"./class-serializer.interfaces":1784796701790}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701787, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./serialize-options.decorator"), exports);

}, function(modId) { var map = {"./serialize-options.decorator":1784796701788}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701788, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SerializeOptions = void 0;
const decorators_1 = require("../../decorators");
const class_serializer_constants_1 = require("../class-serializer.constants");
/**
 * @publicApi
 */
const SerializeOptions = (options) => (0, decorators_1.SetMetadata)(class_serializer_constants_1.CLASS_SERIALIZER_OPTIONS, options);
exports.SerializeOptions = SerializeOptions;

}, function(modId) { var map = {"../../decorators":1784796701620,"../class-serializer.constants":1784796701789}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701789, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.CLASS_SERIALIZER_OPTIONS = void 0;
exports.CLASS_SERIALIZER_OPTIONS = 'class_serializer:options';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701790, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701791, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./console-logger.service"), exports);
tslib_1.__exportStar(require("./logger.service"), exports);
tslib_1.__exportStar(require("./utils/filter-log-levels.util"), exports);

}, function(modId) { var map = {"./utils/filter-log-levels.util":1784796701794}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701794, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.filterLogLevels = filterLogLevels;
const logger_service_1 = require("../logger.service");
const is_log_level_util_1 = require("./is-log-level.util");
/**
 * @publicApi
 */
function filterLogLevels(parseableString = '') {
    const sanitizedString = parseableString.replaceAll(' ', '').toLowerCase();
    if (sanitizedString[0] === '>') {
        const orEqual = sanitizedString[1] === '=';
        const logLevelIndex = logger_service_1.LOG_LEVELS.indexOf(sanitizedString.substring(orEqual ? 2 : 1));
        if (logLevelIndex === -1) {
            throw new Error(`parse error (unknown log level): ${sanitizedString}`);
        }
        return logger_service_1.LOG_LEVELS.slice(orEqual ? logLevelIndex : logLevelIndex + 1);
    }
    else if (sanitizedString.includes(',')) {
        return sanitizedString.split(',').filter(is_log_level_util_1.isLogLevel);
    }
    return (0, is_log_level_util_1.isLogLevel)(sanitizedString) ? [sanitizedString] : logger_service_1.LOG_LEVELS;
}

}, function(modId) { var map = {"./is-log-level.util":1784796701796}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701796, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isLogLevel = isLogLevel;
const logger_service_1 = require("../logger.service");
/**
 * @publicApi
 */
function isLogLevel(maybeLogLevel) {
    return logger_service_1.LOG_LEVELS.includes(maybeLogLevel);
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701798, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./forward-ref.util"), exports);

}, function(modId) { var map = {"./forward-ref.util":1784796701799}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701799, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.forwardRef = void 0;
/**
 * @publicApi
 */
const forwardRef = (fn) => ({
    forwardRef: fn,
});
exports.forwardRef = forwardRef;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1784796701619);
})()
//miniprogram-npm-outsideDeps=["tslib","reflect-metadata","./inject.decorator","uid","./route-params.decorator","./http.exception","./streamable-file","./configurable-module.builder","./parse-array.pipe","./parse-bool.pipe","./parse-enum.pipe","./parse-float.pipe","./parse-int.pipe","./parse-uuid.pipe","./validation.pipe","./file-type.validator","./max-file-size.validator","./parse-file.pipe","./class-serializer.interceptor","./console-logger.service","./logger.service","../logger.service"]
//# sourceMappingURL=index.js.map