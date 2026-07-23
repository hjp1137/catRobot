module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1784796701824, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.NestFactory = exports.APP_PIPE = exports.APP_INTERCEPTOR = exports.APP_GUARD = exports.APP_FILTER = void 0;
const tslib_1 = require("tslib");
/*
 * Nest @core
 * Copyright(c) 2017 - 2025 Kamil Mysliwiec
 * https://nestjs.com
 * MIT Licensed
 */
require("reflect-metadata");
tslib_1.__exportStar(require("./adapters"), exports);
tslib_1.__exportStar(require("./application-config"), exports);
var constants_1 = require("./constants");
Object.defineProperty(exports, "APP_FILTER", { enumerable: true, get: function () { return constants_1.APP_FILTER; } });
Object.defineProperty(exports, "APP_GUARD", { enumerable: true, get: function () { return constants_1.APP_GUARD; } });
Object.defineProperty(exports, "APP_INTERCEPTOR", { enumerable: true, get: function () { return constants_1.APP_INTERCEPTOR; } });
Object.defineProperty(exports, "APP_PIPE", { enumerable: true, get: function () { return constants_1.APP_PIPE; } });
tslib_1.__exportStar(require("./discovery"), exports);
tslib_1.__exportStar(require("./exceptions"), exports);
tslib_1.__exportStar(require("./helpers"), exports);
tslib_1.__exportStar(require("./injector"), exports);
tslib_1.__exportStar(require("./inspector"), exports);
tslib_1.__exportStar(require("./metadata-scanner"), exports);
tslib_1.__exportStar(require("./middleware"), exports);
tslib_1.__exportStar(require("./nest-application"), exports);
tslib_1.__exportStar(require("./nest-application-context"), exports);
var nest_factory_1 = require("./nest-factory");
Object.defineProperty(exports, "NestFactory", { enumerable: true, get: function () { return nest_factory_1.NestFactory; } });
tslib_1.__exportStar(require("./repl"), exports);
tslib_1.__exportStar(require("./router"), exports);
tslib_1.__exportStar(require("./services"), exports);

}, function(modId) {var map = {"./adapters":1784796701825,"./application-config":1784796701827,"./constants":1784796701828,"./discovery":1784796701829,"./exceptions":1784796701834,"./helpers":1784796701836,"./injector":1784796701864,"./inspector":1784796701871,"./metadata-scanner":1784796701831,"./middleware":1784796701876,"./repl":1784796701882,"./router":1784796701893,"./services":1784796701899}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701825, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./http-adapter"), exports);

}, function(modId) { var map = {"./http-adapter":1784796701826}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701826, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractHttpAdapter = void 0;
/**
 * @publicApi
 */
class AbstractHttpAdapter {
    constructor(instance) {
        this.instance = instance;
    }
    async init() { }
    use(...args) {
        return this.instance.use(...args);
    }
    get(...args) {
        return this.instance.get(...args);
    }
    post(...args) {
        return this.instance.post(...args);
    }
    head(...args) {
        return this.instance.head(...args);
    }
    delete(...args) {
        return this.instance.delete(...args);
    }
    put(...args) {
        return this.instance.put(...args);
    }
    patch(...args) {
        return this.instance.patch(...args);
    }
    propfind(...args) {
        return this.instance.propfind(...args);
    }
    proppatch(...args) {
        return this.instance.proppatch(...args);
    }
    mkcol(...args) {
        return this.instance.mkcol(...args);
    }
    copy(...args) {
        return this.instance.copy(...args);
    }
    move(...args) {
        return this.instance.move(...args);
    }
    lock(...args) {
        return this.instance.lock(...args);
    }
    unlock(...args) {
        return this.instance.unlock(...args);
    }
    all(...args) {
        return this.instance.all(...args);
    }
    search(...args) {
        return this.instance.search(...args);
    }
    options(...args) {
        return this.instance.options(...args);
    }
    listen(port, hostname, callback) {
        return this.instance.listen(port, hostname, callback);
    }
    getHttpServer() {
        return this.httpServer;
    }
    setHttpServer(httpServer) {
        this.httpServer = httpServer;
    }
    setInstance(instance) {
        this.instance = instance;
    }
    getInstance() {
        return this.instance;
    }
    normalizePath(path) {
        return path;
    }
    setOnRouteTriggered(onRouteTriggered) {
        this.onRouteTriggered = onRouteTriggered;
    }
    getOnRouteTriggered() {
        return this.onRouteTriggered;
    }
    setOnRequestHook(onRequestHook) { }
    setOnResponseHook(onResponseHook) { }
}
exports.AbstractHttpAdapter = AbstractHttpAdapter;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701827, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationConfig = void 0;
class ApplicationConfig {
    constructor(ioAdapter = null) {
        this.ioAdapter = ioAdapter;
        this.globalPrefix = '';
        this.globalPrefixOptions = {};
        this.globalPipes = [];
        this.globalFilters = [];
        this.globalInterceptors = [];
        this.globalGuards = [];
        this.globalRequestPipes = [];
        this.globalRequestFilters = [];
        this.globalRequestInterceptors = [];
        this.globalRequestGuards = [];
    }
    setGlobalPrefix(prefix) {
        this.globalPrefix = prefix;
    }
    getGlobalPrefix() {
        return this.globalPrefix;
    }
    setGlobalPrefixOptions(options) {
        this.globalPrefixOptions = options;
    }
    getGlobalPrefixOptions() {
        return this.globalPrefixOptions;
    }
    setIoAdapter(ioAdapter) {
        this.ioAdapter = ioAdapter;
    }
    getIoAdapter() {
        return this.ioAdapter;
    }
    addGlobalPipe(pipe) {
        this.globalPipes.push(pipe);
    }
    useGlobalPipes(...pipes) {
        this.globalPipes = this.globalPipes.concat(pipes);
    }
    getGlobalFilters() {
        return this.globalFilters;
    }
    addGlobalFilter(filter) {
        this.globalFilters.push(filter);
    }
    useGlobalFilters(...filters) {
        this.globalFilters = this.globalFilters.concat(filters);
    }
    getGlobalPipes() {
        return this.globalPipes;
    }
    getGlobalInterceptors() {
        return this.globalInterceptors;
    }
    addGlobalInterceptor(interceptor) {
        this.globalInterceptors.push(interceptor);
    }
    useGlobalInterceptors(...interceptors) {
        this.globalInterceptors = this.globalInterceptors.concat(interceptors);
    }
    getGlobalGuards() {
        return this.globalGuards;
    }
    addGlobalGuard(guard) {
        this.globalGuards.push(guard);
    }
    useGlobalGuards(...guards) {
        this.globalGuards = this.globalGuards.concat(guards);
    }
    addGlobalRequestInterceptor(wrapper) {
        this.globalRequestInterceptors.push(wrapper);
    }
    getGlobalRequestInterceptors() {
        return this.globalRequestInterceptors;
    }
    addGlobalRequestPipe(wrapper) {
        this.globalRequestPipes.push(wrapper);
    }
    getGlobalRequestPipes() {
        return this.globalRequestPipes;
    }
    addGlobalRequestFilter(wrapper) {
        this.globalRequestFilters.push(wrapper);
    }
    getGlobalRequestFilters() {
        return this.globalRequestFilters;
    }
    addGlobalRequestGuard(wrapper) {
        this.globalRequestGuards.push(wrapper);
    }
    getGlobalRequestGuards() {
        return this.globalRequestGuards;
    }
    enableVersioning(options) {
        if (Array.isArray(options.defaultVersion)) {
            // Drop duplicated versions
            options.defaultVersion = Array.from(new Set(options.defaultVersion));
        }
        this.versioningOptions = options;
    }
    getVersioning() {
        return this.versioningOptions;
    }
}
exports.ApplicationConfig = ApplicationConfig;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701828, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ENHANCER_TOKEN_TO_SUBTYPE_MAP = exports.APP_FILTER = exports.APP_GUARD = exports.APP_PIPE = exports.APP_INTERCEPTOR = exports.MESSAGES = void 0;
exports.MESSAGES = {
    APPLICATION_START: `Starting Nest application...`,
    APPLICATION_READY: `Nest application successfully started`,
    MICROSERVICE_READY: `Nest microservice successfully started`,
    UNKNOWN_EXCEPTION_MESSAGE: 'Internal server error',
    ERROR_DURING_SHUTDOWN: 'Error happened during shutdown',
    CALL_LISTEN_FIRST: 'app.listen() needs to be called before calling app.getUrl()',
};
exports.APP_INTERCEPTOR = 'APP_INTERCEPTOR';
exports.APP_PIPE = 'APP_PIPE';
exports.APP_GUARD = 'APP_GUARD';
exports.APP_FILTER = 'APP_FILTER';
exports.ENHANCER_TOKEN_TO_SUBTYPE_MAP = {
    [exports.APP_GUARD]: 'guard',
    [exports.APP_INTERCEPTOR]: 'interceptor',
    [exports.APP_PIPE]: 'pipe',
    [exports.APP_FILTER]: 'filter',
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701829, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./discovery-module"), exports);
tslib_1.__exportStar(require("./discovery-service"), exports);

}, function(modId) { var map = {"./discovery-module":1784796701830}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701830, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const metadata_scanner_1 = require("../metadata-scanner");
const discovery_service_1 = require("./discovery-service");
/**
 * @publicApi
 */
let DiscoveryModule = class DiscoveryModule {
};
exports.DiscoveryModule = DiscoveryModule;
exports.DiscoveryModule = DiscoveryModule = tslib_1.__decorate([
    (0, common_1.Module)({
        providers: [metadata_scanner_1.MetadataScanner, discovery_service_1.DiscoveryService],
        exports: [metadata_scanner_1.MetadataScanner, discovery_service_1.DiscoveryService],
    })
], DiscoveryModule);

}, function(modId) { var map = {"../metadata-scanner":1784796701831}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701831, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataScanner = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
class MetadataScanner {
    constructor() {
        this.cachedScannedPrototypes = new Map();
    }
    /**
     * @deprecated
     * @see {@link getAllMethodNames}
     * @see getAllMethodNames
     */
    scanFromPrototype(instance, prototype, callback) {
        if (!prototype) {
            return [];
        }
        const visitedNames = new Map();
        const result = [];
        do {
            for (const property of Object.getOwnPropertyNames(prototype)) {
                if (visitedNames.has(property)) {
                    continue;
                }
                visitedNames.set(property, true);
                // reason: https://github.com/nestjs/nest/pull/10821#issuecomment-1411916533
                const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
                if (descriptor.set ||
                    descriptor.get ||
                    (0, shared_utils_1.isConstructor)(property) ||
                    !(0, shared_utils_1.isFunction)(prototype[property])) {
                    continue;
                }
                const value = callback(property);
                if ((0, shared_utils_1.isNil)(value)) {
                    continue;
                }
                result.push(value);
            }
        } while ((prototype = Reflect.getPrototypeOf(prototype)) &&
            prototype !== Object.prototype);
        return result;
    }
    /**
     * @deprecated
     * @see {@link getAllMethodNames}
     * @see getAllMethodNames
     */
    *getAllFilteredMethodNames(prototype) {
        yield* this.getAllMethodNames(prototype);
    }
    getAllMethodNames(prototype) {
        if (!prototype) {
            return [];
        }
        if (this.cachedScannedPrototypes.has(prototype)) {
            return this.cachedScannedPrototypes.get(prototype);
        }
        const visitedNames = new Map();
        const result = [];
        this.cachedScannedPrototypes.set(prototype, result);
        do {
            for (const property of Object.getOwnPropertyNames(prototype)) {
                if (visitedNames.has(property)) {
                    continue;
                }
                visitedNames.set(property, true);
                // reason: https://github.com/nestjs/nest/pull/10821#issuecomment-1411916533
                const descriptor = Object.getOwnPropertyDescriptor(prototype, property);
                if (descriptor.set ||
                    descriptor.get ||
                    (0, shared_utils_1.isConstructor)(property) ||
                    !(0, shared_utils_1.isFunction)(prototype[property])) {
                    continue;
                }
                result.push(property);
            }
        } while ((prototype = Reflect.getPrototypeOf(prototype)) &&
            prototype !== Object.prototype);
        return result;
    }
}
exports.MetadataScanner = MetadataScanner;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701834, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./base-exception-filter"), exports);

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701836, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./context-id-factory"), exports);
tslib_1.__exportStar(require("./external-context-creator"), exports);
tslib_1.__exportStar(require("./http-adapter-host"), exports);

}, function(modId) { var map = {"./external-context-creator":1784796701838,"./http-adapter-host":1784796701863}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701838, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalContextCreator = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const rxjs_1 = require("rxjs");
const external_exception_filter_context_1 = require("../exceptions/external-exception-filter-context");
const guards_1 = require("../guards");
const constants_2 = require("../guards/constants");
const constants_3 = require("../injector/constants");
const interceptors_1 = require("../interceptors");
const pipes_1 = require("../pipes");
const context_utils_1 = require("./context-utils");
const external_proxy_1 = require("./external-proxy");
const handler_metadata_storage_1 = require("./handler-metadata-storage");
class ExternalContextCreator {
    constructor(guardsContextCreator, guardsConsumer, interceptorsContextCreator, interceptorsConsumer, modulesContainer, pipesContextCreator, pipesConsumer, filtersContextCreator) {
        this.guardsContextCreator = guardsContextCreator;
        this.guardsConsumer = guardsConsumer;
        this.interceptorsContextCreator = interceptorsContextCreator;
        this.interceptorsConsumer = interceptorsConsumer;
        this.modulesContainer = modulesContainer;
        this.pipesContextCreator = pipesContextCreator;
        this.pipesConsumer = pipesConsumer;
        this.filtersContextCreator = filtersContextCreator;
        this.contextUtils = new context_utils_1.ContextUtils();
        this.externalErrorProxy = new external_proxy_1.ExternalErrorProxy();
        this.handlerMetadataStorage = new handler_metadata_storage_1.HandlerMetadataStorage();
    }
    static fromContainer(container) {
        const guardsContextCreator = new guards_1.GuardsContextCreator(container, container.applicationConfig);
        const guardsConsumer = new guards_1.GuardsConsumer();
        const interceptorsContextCreator = new interceptors_1.InterceptorsContextCreator(container, container.applicationConfig);
        const interceptorsConsumer = new interceptors_1.InterceptorsConsumer();
        const pipesContextCreator = new pipes_1.PipesContextCreator(container, container.applicationConfig);
        const pipesConsumer = new pipes_1.PipesConsumer();
        const filtersContextCreator = new external_exception_filter_context_1.ExternalExceptionFilterContext(container, container.applicationConfig);
        const externalContextCreator = new ExternalContextCreator(guardsContextCreator, guardsConsumer, interceptorsContextCreator, interceptorsConsumer, container.getModules(), pipesContextCreator, pipesConsumer, filtersContextCreator);
        externalContextCreator.container = container;
        return externalContextCreator;
    }
    create(instance, callback, methodName, metadataKey, paramsFactory, contextId = constants_3.STATIC_CONTEXT, inquirerId, options = {
        interceptors: true,
        guards: true,
        filters: true,
    }, contextType = 'http') {
        const moduleKey = this.getContextModuleKey(instance.constructor);
        const { argsLength, paramtypes, getParamsMetadata } = this.getMetadata(instance, methodName, metadataKey, paramsFactory, contextType);
        const pipes = this.pipesContextCreator.create(instance, callback, moduleKey, contextId, inquirerId);
        const guards = this.guardsContextCreator.create(instance, callback, moduleKey, contextId, inquirerId);
        const exceptionFilter = this.filtersContextCreator.create(instance, callback, moduleKey, contextId, inquirerId);
        const interceptors = options.interceptors
            ? this.interceptorsContextCreator.create(instance, callback, moduleKey, contextId, inquirerId)
            : [];
        const paramsMetadata = getParamsMetadata(moduleKey, contextId, inquirerId);
        const paramsOptions = paramsMetadata
            ? this.contextUtils.mergeParamsMetatypes(paramsMetadata, paramtypes)
            : [];
        const fnCanActivate = options.guards
            ? this.createGuardsFn(guards, instance, callback, contextType)
            : null;
        const fnApplyPipes = this.createPipesFn(pipes, paramsOptions);
        const handler = (initialArgs, ...args) => async () => {
            if (fnApplyPipes) {
                await fnApplyPipes(initialArgs, ...args);
                return callback.apply(instance, initialArgs);
            }
            return callback.apply(instance, args);
        };
        const target = async (...args) => {
            const initialArgs = this.contextUtils.createNullArray(argsLength);
            fnCanActivate && (await fnCanActivate(args));
            const result = await this.interceptorsConsumer.intercept(interceptors, args, instance, callback, handler(initialArgs, ...args), contextType);
            return this.transformToResult(result);
        };
        return options.filters
            ? this.externalErrorProxy.createProxy(target, exceptionFilter, contextType)
            : target;
    }
    getMetadata(instance, methodName, metadataKey, paramsFactory, contextType) {
        const cacheMetadata = this.handlerMetadataStorage.get(instance, methodName);
        if (cacheMetadata) {
            return cacheMetadata;
        }
        const metadata = this.contextUtils.reflectCallbackMetadata(instance, methodName, metadataKey || '') || {};
        const keys = Object.keys(metadata);
        const argsLength = this.contextUtils.getArgumentsLength(keys, metadata);
        const paramtypes = this.contextUtils.reflectCallbackParamtypes(instance, methodName);
        const contextFactory = this.contextUtils.getContextFactory(contextType, instance, instance[methodName]);
        const getParamsMetadata = (moduleKey, contextId = constants_3.STATIC_CONTEXT, inquirerId) => paramsFactory
            ? this.exchangeKeysForValues(keys, metadata, moduleKey, paramsFactory, contextId, inquirerId, contextFactory)
            : null;
        const handlerMetadata = {
            argsLength,
            paramtypes,
            getParamsMetadata: getParamsMetadata,
        };
        this.handlerMetadataStorage.set(instance, methodName, handlerMetadata);
        return handlerMetadata;
    }
    getContextModuleKey(moduleCtor) {
        const emptyModuleKey = '';
        if (!moduleCtor) {
            return emptyModuleKey;
        }
        const moduleContainerEntries = this.modulesContainer.entries();
        for (const [key, moduleRef] of moduleContainerEntries) {
            if (moduleRef.hasProvider(moduleCtor)) {
                return key;
            }
        }
        return emptyModuleKey;
    }
    exchangeKeysForValues(keys, metadata, moduleContext, paramsFactory, contextId = constants_3.STATIC_CONTEXT, inquirerId, contextFactory = this.contextUtils.getContextFactory('http')) {
        this.pipesContextCreator.setModuleContext(moduleContext);
        return keys.map(key => {
            const { index, data, pipes: pipesCollection } = metadata[key];
            const pipes = this.pipesContextCreator.createConcreteContext(pipesCollection, contextId, inquirerId);
            const type = this.contextUtils.mapParamType(key);
            if (key.includes(constants_1.CUSTOM_ROUTE_ARGS_METADATA)) {
                const { factory } = metadata[key];
                const customExtractValue = this.contextUtils.getCustomFactory(factory, data, contextFactory);
                return { index, extractValue: customExtractValue, type, data, pipes };
            }
            const numericType = Number(type);
            const extractValue = (...args) => paramsFactory.exchangeKeyForValue(numericType, data, args);
            return { index, extractValue, type: numericType, data, pipes };
        });
    }
    createPipesFn(pipes, paramsOptions) {
        const pipesFn = async (args, ...params) => {
            const resolveParamValue = async (param) => {
                const { index, extractValue, type, data, metatype, pipes: paramPipes, } = param;
                const value = extractValue(...params);
                args[index] = await this.getParamValue(value, { metatype, type, data }, pipes.concat(paramPipes));
            };
            await Promise.all(paramsOptions.map(resolveParamValue));
        };
        return paramsOptions.length ? pipesFn : null;
    }
    async getParamValue(value, { metatype, type, data }, pipes) {
        return (0, shared_utils_1.isEmpty)(pipes)
            ? value
            : this.pipesConsumer.apply(value, { metatype, type, data }, pipes);
    }
    async transformToResult(resultOrDeferred) {
        if ((0, rxjs_1.isObservable)(resultOrDeferred)) {
            return (0, rxjs_1.lastValueFrom)(resultOrDeferred);
        }
        return resultOrDeferred;
    }
    createGuardsFn(guards, instance, callback, contextType) {
        const canActivateFn = async (args) => {
            const canActivate = await this.guardsConsumer.tryActivate(guards, args, instance, callback, contextType);
            if (!canActivate) {
                throw new common_1.ForbiddenException(constants_2.FORBIDDEN_MESSAGE);
            }
        };
        return guards.length ? canActivateFn : null;
    }
    registerRequestProvider(request, contextId) {
        this.container.registerRequestProvider(request, contextId);
    }
}
exports.ExternalContextCreator = ExternalContextCreator;

}, function(modId) { var map = {"../exceptions/external-exception-filter-context":1784796701839,"../guards":1784796701848,"../guards/constants":1784796701849,"../injector/constants":1784796701840,"../interceptors":1784796701853,"../pipes":1784796701856,"./context-utils":1784796701860,"./external-proxy":1784796701861,"./handler-metadata-storage":1784796701862}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701839, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalExceptionFilterContext = void 0;
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const iterare_1 = require("iterare");
const constants_2 = require("../injector/constants");
const base_exception_filter_context_1 = require("./base-exception-filter-context");
const external_exceptions_handler_1 = require("./external-exceptions-handler");
class ExternalExceptionFilterContext extends base_exception_filter_context_1.BaseExceptionFilterContext {
    constructor(container, config) {
        super(container);
        this.config = config;
    }
    create(instance, callback, module, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        this.moduleContext = module;
        const exceptionHandler = new external_exceptions_handler_1.ExternalExceptionsHandler();
        const filters = this.createContext(instance, callback, constants_1.EXCEPTION_FILTERS_METADATA, contextId, inquirerId);
        if ((0, shared_utils_1.isEmpty)(filters)) {
            return exceptionHandler;
        }
        exceptionHandler.setCustomFilters(filters.reverse());
        return exceptionHandler;
    }
    getGlobalMetadata(contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        if (!this.config) {
            return [];
        }
        const globalFilters = this.config.getGlobalFilters();
        if (contextId === constants_2.STATIC_CONTEXT && !inquirerId) {
            return globalFilters;
        }
        const scopedFilterWrappers = this.config.getGlobalRequestFilters();
        const scopedFilters = (0, iterare_1.iterate)(scopedFilterWrappers)
            .map(wrapper => wrapper.getInstanceByContextId(contextId, inquirerId))
            .filter(host => !!host)
            .map(host => host.instance)
            .toArray();
        return globalFilters.concat(scopedFilters);
    }
}
exports.ExternalExceptionFilterContext = ExternalExceptionFilterContext;

}, function(modId) { var map = {"../injector/constants":1784796701840,"./base-exception-filter-context":1784796701841,"./external-exceptions-handler":1784796701843}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701840, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.STATIC_CONTEXT = exports.CONTROLLER_ID_KEY = void 0;
exports.CONTROLLER_ID_KEY = 'CONTROLLER_ID';
const STATIC_CONTEXT_ID = 1;
exports.STATIC_CONTEXT = Object.freeze({
    id: STATIC_CONTEXT_ID,
});

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701841, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseExceptionFilterContext = void 0;
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const iterare_1 = require("iterare");
const context_creator_1 = require("../helpers/context-creator");
const constants_2 = require("../injector/constants");
class BaseExceptionFilterContext extends context_creator_1.ContextCreator {
    constructor(container) {
        super();
        this.container = container;
    }
    createConcreteContext(metadata, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        if ((0, shared_utils_1.isEmpty)(metadata)) {
            return [];
        }
        return (0, iterare_1.iterate)(metadata)
            .filter(instance => instance && ((0, shared_utils_1.isFunction)(instance.catch) || instance.name))
            .map(filter => this.getFilterInstance(filter, contextId, inquirerId))
            .filter(item => !!item)
            .map(instance => ({
            func: instance.catch.bind(instance),
            exceptionMetatypes: this.reflectCatchExceptions(instance),
        }))
            .toArray();
    }
    getFilterInstance(filter, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        const isObject = !!filter.catch;
        if (isObject) {
            return filter;
        }
        const instanceWrapper = this.getInstanceByMetatype(filter);
        if (!instanceWrapper) {
            return null;
        }
        const instanceHost = instanceWrapper.getInstanceByContextId(this.getContextId(contextId, instanceWrapper), inquirerId);
        return instanceHost && instanceHost.instance;
    }
    getInstanceByMetatype(metatype) {
        if (!this.moduleContext) {
            return;
        }
        const collection = this.container.getModules();
        const moduleRef = collection.get(this.moduleContext);
        if (!moduleRef) {
            return;
        }
        return moduleRef.injectables.get(metatype);
    }
    reflectCatchExceptions(instance) {
        const prototype = Object.getPrototypeOf(instance);
        return (Reflect.getMetadata(constants_1.FILTER_CATCH_EXCEPTIONS, prototype.constructor) || []);
    }
}
exports.BaseExceptionFilterContext = BaseExceptionFilterContext;

}, function(modId) { var map = {"../helpers/context-creator":1784796701842,"../injector/constants":1784796701840}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701842, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextCreator = void 0;
const constants_1 = require("../injector/constants");
class ContextCreator {
    createContext(instance, callback, metadataKey, contextId = constants_1.STATIC_CONTEXT, inquirerId) {
        const globalMetadata = this.getGlobalMetadata &&
            this.getGlobalMetadata(contextId, inquirerId);
        const classMetadata = this.reflectClassMetadata(instance, metadataKey);
        const methodMetadata = this.reflectMethodMetadata(callback, metadataKey);
        return [
            ...this.createConcreteContext(globalMetadata || [], contextId, inquirerId),
            ...this.createConcreteContext(classMetadata, contextId, inquirerId),
            ...this.createConcreteContext(methodMetadata, contextId, inquirerId),
        ];
    }
    reflectClassMetadata(instance, metadataKey) {
        const prototype = Object.getPrototypeOf(instance);
        return Reflect.getMetadata(metadataKey, prototype.constructor);
    }
    reflectMethodMetadata(callback, metadataKey) {
        return Reflect.getMetadata(metadataKey, callback);
    }
    getContextId(contextId, instanceWrapper) {
        return contextId.getParent
            ? contextId.getParent({
                token: instanceWrapper.token,
                isTreeDurable: instanceWrapper.isDependencyTreeDurable(),
            })
            : contextId;
    }
}
exports.ContextCreator = ContextCreator;

}, function(modId) { var map = {"../injector/constants":1784796701840}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701843, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalExceptionsHandler = void 0;
const select_exception_filter_metadata_util_1 = require("@nestjs/common/utils/select-exception-filter-metadata.util");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const invalid_exception_filter_exception_1 = require("../errors/exceptions/invalid-exception-filter.exception");
const external_exception_filter_1 = require("./external-exception-filter");
class ExternalExceptionsHandler extends external_exception_filter_1.ExternalExceptionFilter {
    constructor() {
        super(...arguments);
        this.filters = [];
    }
    next(exception, host) {
        const result = this.invokeCustomFilters(exception, host);
        if (result) {
            return result;
        }
        return super.catch(exception, host);
    }
    setCustomFilters(filters) {
        if (!Array.isArray(filters)) {
            throw new invalid_exception_filter_exception_1.InvalidExceptionFilterException();
        }
        this.filters = filters;
    }
    invokeCustomFilters(exception, host) {
        if ((0, shared_utils_1.isEmpty)(this.filters)) {
            return null;
        }
        const filter = (0, select_exception_filter_metadata_util_1.selectExceptionFilterMetadata)(this.filters, exception);
        return filter ? filter.func(exception, host) : null;
    }
}
exports.ExternalExceptionsHandler = ExternalExceptionsHandler;

}, function(modId) { var map = {"../errors/exceptions/invalid-exception-filter.exception":1784796701844,"./external-exception-filter":1784796701847}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701844, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidExceptionFilterException = void 0;
const runtime_exception_1 = require("./runtime.exception");
const messages_1 = require("../messages");
class InvalidExceptionFilterException extends runtime_exception_1.RuntimeException {
    constructor() {
        super(messages_1.INVALID_EXCEPTION_FILTER);
    }
}
exports.InvalidExceptionFilterException = InvalidExceptionFilterException;

}, function(modId) { var map = {"./runtime.exception":1784796701845}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701845, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeException = void 0;
class RuntimeException extends Error {
    constructor(message = ``) {
        super(message);
    }
    what() {
        return this.message;
    }
}
exports.RuntimeException = RuntimeException;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701847, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
class ExternalExceptionFilter {
    catch(exception, host) {
        if (exception instanceof Error &&
            !(exception instanceof common_1.IntrinsicException)) {
            ExternalExceptionFilter.logger.error(exception);
        }
        throw exception;
    }
}
exports.ExternalExceptionFilter = ExternalExceptionFilter;
ExternalExceptionFilter.logger = new common_1.Logger('ExceptionsHandler');

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701848, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./constants"), exports);
tslib_1.__exportStar(require("./guards-consumer"), exports);
tslib_1.__exportStar(require("./guards-context-creator"), exports);

}, function(modId) { var map = {"./constants":1784796701849,"./guards-consumer":1784796701850,"./guards-context-creator":1784796701852}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701849, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FORBIDDEN_MESSAGE = void 0;
exports.FORBIDDEN_MESSAGE = 'Forbidden resource';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701850, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardsConsumer = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const rxjs_1 = require("rxjs");
const execution_context_host_1 = require("../helpers/execution-context-host");
class GuardsConsumer {
    async tryActivate(guards, args, instance, callback, type) {
        if (!guards || (0, shared_utils_1.isEmpty)(guards)) {
            return true;
        }
        const context = this.createContext(args, instance, callback);
        context.setType(type);
        for (const guard of guards) {
            const result = guard.canActivate(context);
            if (typeof result === 'boolean') {
                if (!result) {
                    return false;
                }
                continue;
            }
            if (await this.pickResult(result)) {
                continue;
            }
            return false;
        }
        return true;
    }
    createContext(args, instance, callback) {
        return new execution_context_host_1.ExecutionContextHost(args, instance.constructor, callback);
    }
    async pickResult(result) {
        if (result instanceof rxjs_1.Observable) {
            return (0, rxjs_1.lastValueFrom)(result);
        }
        return result;
    }
}
exports.GuardsConsumer = GuardsConsumer;

}, function(modId) { var map = {"../helpers/execution-context-host":1784796701851}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701851, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionContextHost = void 0;
class ExecutionContextHost {
    constructor(args, constructorRef = null, handler = null) {
        this.args = args;
        this.constructorRef = constructorRef;
        this.handler = handler;
        this.contextType = 'http';
    }
    setType(type) {
        type && (this.contextType = type);
    }
    getType() {
        return this.contextType;
    }
    getClass() {
        return this.constructorRef;
    }
    getHandler() {
        return this.handler;
    }
    getArgs() {
        return this.args;
    }
    getArgByIndex(index) {
        return this.args[index];
    }
    switchToRpc() {
        return Object.assign(this, {
            getData: () => this.getArgByIndex(0),
            getContext: () => this.getArgByIndex(1),
        });
    }
    switchToHttp() {
        return Object.assign(this, {
            getRequest: () => this.getArgByIndex(0),
            getResponse: () => this.getArgByIndex(1),
            getNext: () => this.getArgByIndex(2),
        });
    }
    switchToWs() {
        return Object.assign(this, {
            getClient: () => this.getArgByIndex(0),
            getData: () => this.getArgByIndex(1),
            getPattern: () => this.getArgByIndex(this.getArgs().length - 1),
        });
    }
}
exports.ExecutionContextHost = ExecutionContextHost;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701852, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardsContextCreator = void 0;
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const iterare_1 = require("iterare");
const context_creator_1 = require("../helpers/context-creator");
const constants_2 = require("../injector/constants");
class GuardsContextCreator extends context_creator_1.ContextCreator {
    constructor(container, config) {
        super();
        this.container = container;
        this.config = config;
    }
    create(instance, callback, module, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        this.moduleContext = module;
        return this.createContext(instance, callback, constants_1.GUARDS_METADATA, contextId, inquirerId);
    }
    createConcreteContext(metadata, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        if ((0, shared_utils_1.isEmpty)(metadata)) {
            return [];
        }
        return (0, iterare_1.iterate)(metadata)
            .filter((guard) => guard && (guard.name || guard.canActivate))
            .map(guard => this.getGuardInstance(guard, contextId, inquirerId))
            .filter((guard) => !!guard && (0, shared_utils_1.isFunction)(guard.canActivate))
            .toArray();
    }
    getGuardInstance(metatype, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        const isObject = !!metatype.canActivate;
        if (isObject) {
            return metatype;
        }
        const instanceWrapper = this.getInstanceByMetatype(metatype);
        if (!instanceWrapper) {
            return null;
        }
        const instanceHost = instanceWrapper.getInstanceByContextId(this.getContextId(contextId, instanceWrapper), inquirerId);
        return instanceHost && instanceHost.instance;
    }
    getInstanceByMetatype(metatype) {
        if (!this.moduleContext) {
            return;
        }
        const collection = this.container.getModules();
        const moduleRef = collection.get(this.moduleContext);
        if (!moduleRef) {
            return;
        }
        const injectables = moduleRef.injectables;
        return injectables.get(metatype);
    }
    getGlobalMetadata(contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        if (!this.config) {
            return [];
        }
        const globalGuards = this.config.getGlobalGuards();
        if (contextId === constants_2.STATIC_CONTEXT && !inquirerId) {
            return globalGuards;
        }
        const scopedGuardWrappers = this.config.getGlobalRequestGuards();
        const scopedGuards = (0, iterare_1.iterate)(scopedGuardWrappers)
            .map(wrapper => wrapper.getInstanceByContextId(this.getContextId(contextId, wrapper), inquirerId))
            .filter(host => !!host)
            .map(host => host.instance)
            .toArray();
        return globalGuards.concat(scopedGuards);
    }
}
exports.GuardsContextCreator = GuardsContextCreator;

}, function(modId) { var map = {"../helpers/context-creator":1784796701842,"../injector/constants":1784796701840}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701853, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./interceptors-consumer"), exports);
tslib_1.__exportStar(require("./interceptors-context-creator"), exports);

}, function(modId) { var map = {"./interceptors-consumer":1784796701854,"./interceptors-context-creator":1784796701855}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701854, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.InterceptorsConsumer = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const async_hooks_1 = require("async_hooks");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const execution_context_host_1 = require("../helpers/execution-context-host");
class InterceptorsConsumer {
    async intercept(interceptors, args, instance, callback, next, type) {
        if ((0, shared_utils_1.isEmpty)(interceptors)) {
            return next();
        }
        const context = this.createContext(args, instance, callback);
        context.setType(type);
        const nextFn = async (i = 0) => {
            if (i >= interceptors.length) {
                return (0, rxjs_1.defer)(async_hooks_1.AsyncResource.bind(() => this.transformDeferred(next)));
            }
            const handler = {
                handle: () => (0, rxjs_1.defer)(async_hooks_1.AsyncResource.bind(() => nextFn(i + 1))).pipe((0, operators_1.mergeAll)()),
            };
            return interceptors[i].intercept(context, handler);
        };
        return (0, rxjs_1.defer)(() => nextFn()).pipe((0, operators_1.mergeAll)());
    }
    createContext(args, instance, callback) {
        return new execution_context_host_1.ExecutionContextHost(args, instance.constructor, callback);
    }
    transformDeferred(next) {
        return (0, rxjs_1.from)(next()).pipe((0, operators_1.switchMap)(res => {
            const isDeferred = res instanceof Promise || res instanceof rxjs_1.Observable;
            return isDeferred ? res : Promise.resolve(res);
        }));
    }
}
exports.InterceptorsConsumer = InterceptorsConsumer;

}, function(modId) { var map = {"../helpers/execution-context-host":1784796701851}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701855, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.InterceptorsContextCreator = void 0;
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const iterare_1 = require("iterare");
const context_creator_1 = require("../helpers/context-creator");
const constants_2 = require("../injector/constants");
class InterceptorsContextCreator extends context_creator_1.ContextCreator {
    constructor(container, config) {
        super();
        this.container = container;
        this.config = config;
    }
    create(instance, callback, module, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        this.moduleContext = module;
        return this.createContext(instance, callback, constants_1.INTERCEPTORS_METADATA, contextId, inquirerId);
    }
    createConcreteContext(metadata, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        if ((0, shared_utils_1.isEmpty)(metadata)) {
            return [];
        }
        return (0, iterare_1.iterate)(metadata)
            .filter(interceptor => interceptor && (interceptor.name || interceptor.intercept))
            .map(interceptor => this.getInterceptorInstance(interceptor, contextId, inquirerId))
            .filter((interceptor) => interceptor ? (0, shared_utils_1.isFunction)(interceptor.intercept) : false)
            .toArray();
    }
    getInterceptorInstance(metatype, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        const isObject = !!metatype.intercept;
        if (isObject) {
            return metatype;
        }
        const instanceWrapper = this.getInstanceByMetatype(metatype);
        if (!instanceWrapper) {
            return null;
        }
        const instanceHost = instanceWrapper.getInstanceByContextId(this.getContextId(contextId, instanceWrapper), inquirerId);
        return instanceHost && instanceHost.instance;
    }
    getInstanceByMetatype(metatype) {
        if (!this.moduleContext) {
            return;
        }
        const collection = this.container.getModules();
        const moduleRef = collection.get(this.moduleContext);
        if (!moduleRef) {
            return;
        }
        return moduleRef.injectables.get(metatype);
    }
    getGlobalMetadata(contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        if (!this.config) {
            return [];
        }
        const globalInterceptors = this.config.getGlobalInterceptors();
        if (contextId === constants_2.STATIC_CONTEXT && !inquirerId) {
            return globalInterceptors;
        }
        const scopedInterceptorWrappers = this.config.getGlobalRequestInterceptors();
        const scopedInterceptors = (0, iterare_1.iterate)(scopedInterceptorWrappers)
            .map(wrapper => wrapper.getInstanceByContextId(this.getContextId(contextId, wrapper), inquirerId))
            .filter(host => !!host)
            .map(host => host.instance)
            .toArray();
        return globalInterceptors.concat(scopedInterceptors);
    }
}
exports.InterceptorsContextCreator = InterceptorsContextCreator;

}, function(modId) { var map = {"../helpers/context-creator":1784796701842,"../injector/constants":1784796701840}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701856, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./params-token-factory"), exports);
tslib_1.__exportStar(require("./pipes-consumer"), exports);
tslib_1.__exportStar(require("./pipes-context-creator"), exports);

}, function(modId) { var map = {"./params-token-factory":1784796701857,"./pipes-consumer":1784796701858,"./pipes-context-creator":1784796701859}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701857, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamsTokenFactory = void 0;
const route_paramtypes_enum_1 = require("@nestjs/common/enums/route-paramtypes.enum");
class ParamsTokenFactory {
    exchangeEnumForString(type) {
        switch (type) {
            case route_paramtypes_enum_1.RouteParamtypes.BODY:
                return 'body';
            case route_paramtypes_enum_1.RouteParamtypes.PARAM:
                return 'param';
            case route_paramtypes_enum_1.RouteParamtypes.QUERY:
                return 'query';
            default:
                return 'custom';
        }
    }
}
exports.ParamsTokenFactory = ParamsTokenFactory;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701858, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.PipesConsumer = void 0;
const params_token_factory_1 = require("./params-token-factory");
class PipesConsumer {
    constructor() {
        this.paramsTokenFactory = new params_token_factory_1.ParamsTokenFactory();
    }
    async apply(value, { metatype, type, data }, pipes) {
        const token = this.paramsTokenFactory.exchangeEnumForString(type);
        return this.applyPipes(value, { metatype, type: token, data }, pipes);
    }
    async applyPipes(value, { metatype, type, data }, transforms) {
        return transforms.reduce(async (deferredValue, pipe) => {
            const val = await deferredValue;
            const result = pipe.transform(val, { metatype, type, data });
            return result;
        }, Promise.resolve(value));
    }
}
exports.PipesConsumer = PipesConsumer;

}, function(modId) { var map = {"./params-token-factory":1784796701857}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701859, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.PipesContextCreator = void 0;
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const iterare_1 = require("iterare");
const context_creator_1 = require("../helpers/context-creator");
const constants_2 = require("../injector/constants");
class PipesContextCreator extends context_creator_1.ContextCreator {
    constructor(container, config) {
        super();
        this.container = container;
        this.config = config;
    }
    create(instance, callback, moduleKey, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        this.moduleContext = moduleKey;
        return this.createContext(instance, callback, constants_1.PIPES_METADATA, contextId, inquirerId);
    }
    createConcreteContext(metadata, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        if ((0, shared_utils_1.isEmpty)(metadata)) {
            return [];
        }
        return (0, iterare_1.iterate)(metadata)
            .filter((pipe) => pipe && (pipe.name || pipe.transform))
            .map(pipe => this.getPipeInstance(pipe, contextId, inquirerId))
            .filter(pipe => !!pipe && pipe.transform && (0, shared_utils_1.isFunction)(pipe.transform))
            .toArray();
    }
    getPipeInstance(pipe, contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        const isObject = !!pipe.transform;
        if (isObject) {
            return pipe;
        }
        const instanceWrapper = this.getInstanceByMetatype(pipe);
        if (!instanceWrapper) {
            return null;
        }
        const instanceHost = instanceWrapper.getInstanceByContextId(this.getContextId(contextId, instanceWrapper), inquirerId);
        return instanceHost && instanceHost.instance;
    }
    getInstanceByMetatype(metatype) {
        if (!this.moduleContext) {
            return;
        }
        const collection = this.container.getModules();
        const moduleRef = collection.get(this.moduleContext);
        if (!moduleRef) {
            return;
        }
        return moduleRef.injectables.get(metatype);
    }
    getGlobalMetadata(contextId = constants_2.STATIC_CONTEXT, inquirerId) {
        if (!this.config) {
            return [];
        }
        const globalPipes = this.config.getGlobalPipes();
        if (contextId === constants_2.STATIC_CONTEXT && !inquirerId) {
            return globalPipes;
        }
        const scopedPipeWrappers = this.config.getGlobalRequestPipes();
        const scopedPipes = (0, iterare_1.iterate)(scopedPipeWrappers)
            .map(wrapper => wrapper.getInstanceByContextId(this.getContextId(contextId, wrapper), inquirerId))
            .filter(host => !!host)
            .map(host => host.instance)
            .toArray();
        return globalPipes.concat(scopedPipes);
    }
    setModuleContext(context) {
        this.moduleContext = context;
    }
}
exports.PipesContextCreator = PipesContextCreator;

}, function(modId) { var map = {"../helpers/context-creator":1784796701842,"../injector/constants":1784796701840}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701860, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextUtils = void 0;
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const execution_context_host_1 = require("./execution-context-host");
class ContextUtils {
    mapParamType(key) {
        const keyPair = key.split(':');
        return keyPair[0];
    }
    reflectCallbackParamtypes(instance, methodName) {
        return Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, instance, methodName);
    }
    reflectCallbackMetadata(instance, methodName, metadataKey) {
        return Reflect.getMetadata(metadataKey, instance.constructor, methodName);
    }
    reflectPassthrough(instance, methodName) {
        return Reflect.getMetadata(constants_1.RESPONSE_PASSTHROUGH_METADATA, instance.constructor, methodName);
    }
    getArgumentsLength(keys, metadata) {
        return keys.length
            ? Math.max(...keys.map(key => metadata[key].index)) + 1
            : 0;
    }
    createNullArray(length) {
        const a = new Array(length);
        for (let i = 0; i < length; ++i)
            a[i] = undefined;
        return a;
    }
    mergeParamsMetatypes(paramsProperties, paramtypes) {
        if (!paramtypes) {
            return paramsProperties;
        }
        return paramsProperties.map(param => ({
            ...param,
            metatype: paramtypes[param.index],
        }));
    }
    getCustomFactory(factory, data, contextFactory) {
        return (0, shared_utils_1.isFunction)(factory)
            ? (...args) => factory(data, contextFactory(args))
            : () => null;
    }
    getContextFactory(contextType, instance, callback) {
        const type = instance && instance.constructor;
        return (args) => {
            const ctx = new execution_context_host_1.ExecutionContextHost(args, type, callback);
            ctx.setType(contextType);
            return ctx;
        };
    }
}
exports.ContextUtils = ContextUtils;

}, function(modId) { var map = {"./execution-context-host":1784796701851}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701861, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalErrorProxy = void 0;
const execution_context_host_1 = require("../helpers/execution-context-host");
class ExternalErrorProxy {
    createProxy(targetCallback, exceptionsHandler, type) {
        return async (...args) => {
            try {
                return await targetCallback(...args);
            }
            catch (e) {
                const host = new execution_context_host_1.ExecutionContextHost(args);
                host.setType(type);
                return exceptionsHandler.next(e, host);
            }
        };
    }
}
exports.ExternalErrorProxy = ExternalErrorProxy;

}, function(modId) { var map = {"../helpers/execution-context-host":1784796701851}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701862, function(require, module, exports) {

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerMetadataStorage = exports.HANDLER_METADATA_SYMBOL = void 0;
const constants_1 = require("../injector/constants");
exports.HANDLER_METADATA_SYMBOL = Symbol.for('handler_metadata:cache');
class HandlerMetadataStorage {
    constructor() {
        this[_a] = new Map();
    }
    set(controller, methodName, metadata) {
        const metadataKey = this.getMetadataKey(controller, methodName);
        this[exports.HANDLER_METADATA_SYMBOL].set(metadataKey, metadata);
    }
    get(controller, methodName) {
        const metadataKey = this.getMetadataKey(controller, methodName);
        return this[exports.HANDLER_METADATA_SYMBOL].get(metadataKey);
    }
    getMetadataKey(controller, methodName) {
        const ctor = controller.constructor;
        const controllerKey = ctor && (ctor[constants_1.CONTROLLER_ID_KEY] || ctor.name);
        return controllerKey + methodName;
    }
}
exports.HandlerMetadataStorage = HandlerMetadataStorage;
_a = exports.HANDLER_METADATA_SYMBOL;

}, function(modId) { var map = {"../injector/constants":1784796701840}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701863, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpAdapterHost = void 0;
const rxjs_1 = require("rxjs");
/**
 * Defines the `HttpAdapterHost` object.
 *
 * `HttpAdapterHost` wraps the underlying
 * platform-specific `HttpAdapter`.  The `HttpAdapter` is a wrapper around the underlying
 * native HTTP server library (e.g., Express).  The `HttpAdapterHost` object
 * provides methods to `get` and `set` the underlying HttpAdapter.
 *
 * @see [Http adapter](https://docs.nestjs.com/faq/http-adapter)
 *
 * @publicApi
 */
class HttpAdapterHost {
    constructor() {
        this._listen$ = new rxjs_1.Subject();
        this._init$ = new rxjs_1.ReplaySubject();
        this.isListening = false;
    }
    /**
     * Accessor for the underlying `HttpAdapter`
     *
     * @param httpAdapter reference to the `HttpAdapter` to be set
     */
    set httpAdapter(httpAdapter) {
        this._httpAdapter = httpAdapter;
        this._init$.next();
        this._init$.complete();
    }
    /**
     * Accessor for the underlying `HttpAdapter`
     *
     * @example
     * `const httpAdapter = adapterHost.httpAdapter;`
     */
    get httpAdapter() {
        return this._httpAdapter;
    }
    /**
     * Observable that allows to subscribe to the `listen` event.
     * This event is emitted when the HTTP application is listening for incoming requests.
     */
    get listen$() {
        return this._listen$.asObservable();
    }
    /**
     * Observable that allows to subscribe to the `init` event.
     * This event is emitted when the HTTP application is initialized.
     */
    get init$() {
        return this._init$.asObservable();
    }
    /**
     * Sets the listening state of the application.
     */
    set listening(listening) {
        this.isListening = listening;
        if (listening) {
            this._listen$.next();
            this._listen$.complete();
        }
    }
    /**
     * Returns a boolean indicating whether the application is listening for incoming requests.
     */
    get listening() {
        return this.isListening;
    }
}
exports.HttpAdapterHost = HttpAdapterHost;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701864, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./container"), exports);
tslib_1.__exportStar(require("./inquirer"), exports);
tslib_1.__exportStar(require("./lazy-module-loader/lazy-module-loader"), exports);
tslib_1.__exportStar(require("./module-ref"), exports);
tslib_1.__exportStar(require("./modules-container"), exports);

}, function(modId) { var map = {"./inquirer":1784796701866,"./modules-container":1784796701870}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701866, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./inquirer-constants"), exports);

}, function(modId) { var map = {"./inquirer-constants":1784796701867}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701867, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.INQUIRER = void 0;
exports.INQUIRER = 'INQUIRER';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701870, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesContainer = void 0;
const rxjs_1 = require("rxjs");
const uid_1 = require("uid");
class ModulesContainer extends Map {
    constructor() {
        super(...arguments);
        this._applicationId = (0, uid_1.uid)(21);
        this._rpcTargetRegistry$ = new rxjs_1.ReplaySubject();
    }
    /**
     * Unique identifier of the application instance.
     */
    get applicationId() {
        return this._applicationId;
    }
    /**
     * Retrieves a module by its identifier.
     * @param id The identifier of the module to retrieve.
     * @returns The module instance if found, otherwise undefined.
     */
    getById(id) {
        return Array.from(this.values()).find(moduleRef => moduleRef.id === id);
    }
    /**
     * Returns the RPC target registry as an observable.
     * This registry contains all RPC targets registered in the application.
     * @returns An observable that emits the RPC target registry.
     */
    getRpcTargetRegistry() {
        return this._rpcTargetRegistry$.asObservable();
    }
    /**
     * Adds an RPC target to the registry.
     * @param target The RPC target to add.
     */
    addRpcTarget(target) {
        this._rpcTargetRegistry$.next(target);
    }
}
exports.ModulesContainer = ModulesContainer;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701871, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./graph-inspector"), exports);
tslib_1.__exportStar(require("./initialize-on-preview.allowlist"), exports);
tslib_1.__exportStar(require("./partial-graph.host"), exports);
tslib_1.__exportStar(require("./serialized-graph"), exports);

}, function(modId) { var map = {"./initialize-on-preview.allowlist":1784796701873}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701873, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeOnPreviewAllowlist = void 0;
class InitializeOnPreviewAllowlist {
    static add(type) {
        this.allowlist.set(type, true);
    }
    static has(type) {
        return this.allowlist.has(type);
    }
}
exports.InitializeOnPreviewAllowlist = InitializeOnPreviewAllowlist;
InitializeOnPreviewAllowlist.allowlist = new WeakMap();

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701876, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./builder"), exports);

}, function(modId) { var map = {"./builder":1784796701877}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701877, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareBuilder = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const iterare_1 = require("iterare");
const utils_1 = require("./utils");
class MiddlewareBuilder {
    constructor(routesMapper, httpAdapter, routeInfoPathExtractor) {
        this.routesMapper = routesMapper;
        this.httpAdapter = httpAdapter;
        this.routeInfoPathExtractor = routeInfoPathExtractor;
        this.middlewareCollection = new Set();
    }
    apply(...middleware) {
        return new MiddlewareBuilder.ConfigProxy(this, middleware.flat(), this.routeInfoPathExtractor);
    }
    build() {
        return [...this.middlewareCollection];
    }
    getHttpAdapter() {
        return this.httpAdapter;
    }
}
exports.MiddlewareBuilder = MiddlewareBuilder;
MiddlewareBuilder.ConfigProxy = class {
    constructor(builder, middleware, routeInfoPathExtractor) {
        this.builder = builder;
        this.middleware = middleware;
        this.routeInfoPathExtractor = routeInfoPathExtractor;
        this.excludedRoutes = [];
    }
    getExcludedRoutes() {
        return this.excludedRoutes;
    }
    exclude(...routes) {
        this.excludedRoutes = [
            ...this.excludedRoutes,
            ...this.getRoutesFlatList(routes).reduce((excludedRoutes, route) => {
                for (const routePath of this.routeInfoPathExtractor.extractPathFrom(route)) {
                    excludedRoutes.push({
                        ...route,
                        path: routePath,
                    });
                }
                return excludedRoutes;
            }, []),
        ];
        return this;
    }
    forRoutes(...routes) {
        const { middlewareCollection } = this.builder;
        const flattedRoutes = this.getRoutesFlatList(routes);
        const forRoutes = this.removeOverlappedRoutes(flattedRoutes);
        const configuration = {
            middleware: (0, utils_1.filterMiddleware)(this.middleware, this.excludedRoutes, this.builder.getHttpAdapter()),
            forRoutes,
        };
        middlewareCollection.add(configuration);
        return this.builder;
    }
    getRoutesFlatList(routes) {
        const { routesMapper } = this.builder;
        return (0, iterare_1.iterate)(routes)
            .map(route => routesMapper.mapRouteToRouteInfo(route))
            .flatten()
            .toArray();
    }
    removeOverlappedRoutes(routes) {
        const regexMatchParams = /(:[^/]*)/g;
        const wildcard = '([^/]*)';
        const routesWithRegex = routes
            .filter(route => route.path.includes(':'))
            .map(route => ({
            method: route.method,
            path: route.path,
            regex: new RegExp('^(' + route.path.replace(regexMatchParams, wildcard) + ')$', 'g'),
        }));
        return routes.filter(route => {
            const isOverlapped = (item) => {
                if (route.method !== item.method) {
                    return false;
                }
                const normalizedRoutePath = (0, shared_utils_1.stripEndSlash)(route.path);
                return (normalizedRoutePath !== item.path &&
                    item.regex.test(normalizedRoutePath));
            };
            const routeMatch = routesWithRegex.find(isOverlapped);
            return routeMatch === undefined;
        });
    }
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701882, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./repl"), exports);

}, function(modId) { var map = {"./repl":1784796701883}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701883, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.repl = repl;
const common_1 = require("@nestjs/common");
const cli_colors_util_1 = require("@nestjs/common/utils/cli-colors.util");
const nest_factory_1 = require("../nest-factory");
const assign_to_object_util_1 = require("./assign-to-object.util");
const constants_1 = require("./constants");
const repl_context_1 = require("./repl-context");
const repl_logger_1 = require("./repl-logger");
const repl_native_commands_1 = require("./repl-native-commands");
async function repl(module, replOptions = {}) {
    const app = await nest_factory_1.NestFactory.createApplicationContext(module, {
        abortOnError: false,
        logger: new repl_logger_1.ReplLogger(),
    });
    await app.init();
    const replContext = new repl_context_1.ReplContext(app);
    common_1.Logger.log(constants_1.REPL_INITIALIZED_MESSAGE);
    const _repl = await Promise.resolve().then(() => require('repl'));
    const replServer = _repl.start({
        prompt: cli_colors_util_1.clc.green('> '),
        ignoreUndefined: true,
        ...replOptions,
    });
    (0, assign_to_object_util_1.assignToObject)(replServer.context, replContext.globalScope);
    (0, repl_native_commands_1.defineDefaultCommandsOnRepl)(replServer);
    replServer.on('exit', async () => {
        await app.close();
    });
    return replServer;
}

}, function(modId) { var map = {"./assign-to-object.util":1784796701885,"./constants":1784796701886,"./repl-logger":1784796701888,"repl":1784796701883}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701885, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.assignToObject = assignToObject;
/**
 * Similar to `Object.assign` but copying properties descriptors from `source`
 * as well.
 */
function assignToObject(target, source) {
    Object.defineProperties(target, Object.keys(source).reduce((descriptors, key) => {
        descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
        return descriptors;
    }, Object.create(null)));
    return target;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701886, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.REPL_INITIALIZED_MESSAGE = void 0;
exports.REPL_INITIALIZED_MESSAGE = 'REPL initialized';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701888, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplLogger = void 0;
const common_1 = require("@nestjs/common");
const nest_application_1 = require("../nest-application");
const router_explorer_1 = require("../router/router-explorer");
const routes_resolver_1 = require("../router/routes-resolver");
class ReplLogger extends common_1.ConsoleLogger {
    log(_message, context) {
        if (ReplLogger.ignoredContexts.includes(context)) {
            return;
        }
        // eslint-disable-next-line
        return super.log.apply(this, Array.from(arguments));
    }
}
exports.ReplLogger = ReplLogger;
ReplLogger.ignoredContexts = [
    routes_resolver_1.RoutesResolver.name,
    router_explorer_1.RouterExplorer.name,
    nest_application_1.NestApplication.name,
];

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701893, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.RouterModule = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./interfaces"), exports);
tslib_1.__exportStar(require("./request"), exports);
var router_module_1 = require("./router-module");
Object.defineProperty(exports, "RouterModule", { enumerable: true, get: function () { return router_module_1.RouterModule; } });

}, function(modId) { var map = {"./interfaces":1784796701894,"./request":1784796701896}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701894, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./routes.interface"), exports);

}, function(modId) { var map = {"./routes.interface":1784796701895}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701895, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701896, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST = void 0;
var request_constants_1 = require("./request-constants");
Object.defineProperty(exports, "REQUEST", { enumerable: true, get: function () { return request_constants_1.REQUEST; } });

}, function(modId) { var map = {"./request-constants":1784796701897}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701897, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_CONTEXT_ID = exports.REQUEST = void 0;
exports.REQUEST = 'REQUEST';
exports.REQUEST_CONTEXT_ID = Symbol('REQUEST_CONTEXT_ID');

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701899, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./reflector.service"), exports);

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1784796701824);
})()
//miniprogram-npm-outsideDeps=["tslib","reflect-metadata","./nest-application","./nest-application-context","./nest-factory","./discovery-service","@nestjs/common","@nestjs/common/utils/shared.utils","./base-exception-filter","./context-id-factory","@nestjs/common/constants","rxjs","iterare","@nestjs/common/utils/select-exception-filter-metadata.util","../messages","async_hooks","rxjs/operators","@nestjs/common/enums/route-paramtypes.enum","./container","./lazy-module-loader/lazy-module-loader","./module-ref","uid","./graph-inspector","./partial-graph.host","./serialized-graph","./utils","@nestjs/common/utils/cli-colors.util","../nest-factory","./repl-context","./repl-native-commands","../nest-application","../router/router-explorer","../router/routes-resolver","./router-module","./reflector.service"]
//# sourceMappingURL=index.js.map