module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1784796701800, function(require, module, exports) {

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
__export(require("./dist"));

}, function(modId) {var map = {"./dist":1784796701801}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701801, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./conditional.module"), exports);
__exportStar(require("./config.module"), exports);
__exportStar(require("./config.service"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./utils"), exports);
__exportStar(require("./interfaces"), exports);

}, function(modId) { var map = {"./config.module":1784796701803,"./types":1784796701813,"./utils":1784796701818,"./interfaces":1784796701820}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701803, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var ConfigModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigModule = void 0;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const dotenv = __importStar(require("dotenv"));
const dotenv_expand_1 = require("dotenv-expand");
const fs = __importStar(require("fs"));
const path_1 = require("path");
const config_host_module_1 = require("./config-host.module");
const config_constants_1 = require("./config.constants");
const config_service_1 = require("./config.service");
const create_config_factory_util_1 = require("./utils/create-config-factory.util");
const get_registration_token_util_1 = require("./utils/get-registration-token.util");
const merge_configs_util_1 = require("./utils/merge-configs.util");
/**
 * @publicApi
 */
let ConfigModule = ConfigModule_1 = class ConfigModule {
    /**
     * This promise resolves when "dotenv" completes loading environment variables.
     * When "ignoreEnvFile" is set to true, then it will resolve immediately after the
     * "ConfigModule#forRoot" method is called.
     */
    static get envVariablesLoaded() {
        return this._envVariablesLoaded;
    }
    /**
     * Loads environment variables based on the "ignoreEnvFile" flag and "envFilePath" value.
     * Additionally, registers custom configurations globally.
     * @param options
     */
    static async forRoot(options = {}) {
        const envFilePaths = Array.isArray(options.envFilePath)
            ? options.envFilePath
            : [options.envFilePath || (0, path_1.resolve)(process.cwd(), '.env')];
        let validatedEnvConfig = undefined;
        let config = options.ignoreEnvFile
            ? {}
            : this.loadEnvFile(envFilePaths, options);
        if (!options.ignoreEnvVars && options.validatePredefined !== false) {
            config = {
                ...config,
                ...process.env,
            };
        }
        if (options.validate) {
            const validatedConfig = options.validate(config);
            validatedEnvConfig = validatedConfig;
            this.assignVariablesToProcess(validatedConfig);
        }
        else if (options.validationSchema) {
            const validationOptions = this.getSchemaValidationOptions(options);
            const { error, value: validatedConfig } = options.validationSchema.validate(config, validationOptions);
            if (error) {
                throw new Error(`Config validation error: ${error.message}`);
            }
            validatedEnvConfig = validatedConfig;
            this.assignVariablesToProcess(validatedConfig);
        }
        else {
            this.assignVariablesToProcess(config);
        }
        const isConfigToLoad = options.load && options.load.length;
        const configFactory = await Promise.all(options.load || []);
        const providers = configFactory
            .map(factory => (0, create_config_factory_util_1.createConfigProvider)(factory))
            .filter(item => item);
        const configProviderTokens = providers.map(item => item.provide);
        const configServiceProvider = {
            provide: config_service_1.ConfigService,
            useFactory: (configService) => {
                const untypedConfigService = configService;
                if (options.cache) {
                    untypedConfigService.isCacheEnabled = true;
                }
                if (options.skipProcessEnv) {
                    untypedConfigService.skipProcessEnv = true;
                }
                configService.setEnvFilePaths(envFilePaths);
                return configService;
            },
            inject: [config_constants_1.CONFIGURATION_SERVICE_TOKEN, ...configProviderTokens],
        };
        providers.push(configServiceProvider);
        if (validatedEnvConfig) {
            const validatedEnvConfigLoader = {
                provide: config_constants_1.VALIDATED_ENV_LOADER,
                useFactory: (host) => {
                    host[config_constants_1.VALIDATED_ENV_PROPNAME] = validatedEnvConfig;
                },
                inject: [config_constants_1.CONFIGURATION_TOKEN],
            };
            providers.push(validatedEnvConfigLoader);
        }
        this.environmentVariablesLoadedSignal();
        return {
            module: ConfigModule_1,
            global: options.isGlobal,
            providers: isConfigToLoad
                ? [
                    ...providers,
                    {
                        provide: config_constants_1.CONFIGURATION_LOADER,
                        useFactory: (host, ...configurations) => {
                            configurations.forEach((item, index) => this.mergePartial(host, item, providers[index]));
                        },
                        inject: [config_constants_1.CONFIGURATION_TOKEN, ...configProviderTokens],
                    },
                ]
                : providers,
            exports: [config_service_1.ConfigService, ...configProviderTokens],
        };
    }
    /**
     * Registers configuration object (partial registration).
     * @param config
     */
    static forFeature(config) {
        const configProvider = (0, create_config_factory_util_1.createConfigProvider)(config);
        const serviceProvider = {
            provide: config_service_1.ConfigService,
            useFactory: (configService) => configService,
            inject: [config_constants_1.CONFIGURATION_SERVICE_TOKEN, configProvider.provide],
        };
        return {
            module: ConfigModule_1,
            providers: [
                configProvider,
                serviceProvider,
                {
                    provide: config_constants_1.CONFIGURATION_LOADER,
                    useFactory: (host, partialConfig) => {
                        this.mergePartial(host, partialConfig, configProvider);
                    },
                    inject: [config_constants_1.CONFIGURATION_TOKEN, configProvider.provide],
                },
            ],
            exports: [config_service_1.ConfigService, configProvider.provide],
        };
    }
    static loadEnvFile(envFilePaths, options) {
        let config = {};
        for (const envFilePath of envFilePaths) {
            if (fs.existsSync(envFilePath)) {
                config = Object.assign(dotenv.parse(fs.readFileSync(envFilePath)), config);
                if (options.expandVariables) {
                    const expandOptions = typeof options.expandVariables === 'object'
                        ? options.expandVariables
                        : {};
                    config =
                        (0, dotenv_expand_1.expand)({ ...expandOptions, parsed: config }).parsed || config;
                }
            }
        }
        return config;
    }
    static assignVariablesToProcess(config) {
        if (!(0, shared_utils_1.isObject)(config)) {
            return;
        }
        const keys = Object.keys(config).filter(key => !(key in process.env));
        keys.forEach(key => {
            const value = config[key];
            if (typeof value === 'string') {
                process.env[key] = value;
            }
            else if (typeof value === 'boolean' || typeof value === 'number') {
                process.env[key] = `${value}`;
            }
        });
    }
    static mergePartial(host, item, provider) {
        const factoryRef = provider.useFactory;
        const token = (0, get_registration_token_util_1.getRegistrationToken)(factoryRef);
        (0, merge_configs_util_1.mergeConfigObject)(host, item, token);
    }
    static getSchemaValidationOptions(options) {
        if (options.validationOptions) {
            if (typeof options.validationOptions.allowUnknown === 'undefined') {
                options.validationOptions.allowUnknown = true;
            }
            return options.validationOptions;
        }
        return {
            abortEarly: false,
            allowUnknown: true,
        };
    }
};
exports.ConfigModule = ConfigModule;
ConfigModule._envVariablesLoaded = new Promise(resolve => (ConfigModule_1.environmentVariablesLoadedSignal = resolve));
exports.ConfigModule = ConfigModule = ConfigModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [config_host_module_1.ConfigHostModule],
        providers: [
            {
                provide: config_service_1.ConfigService,
                useExisting: config_constants_1.CONFIGURATION_SERVICE_TOKEN,
            },
        ],
        exports: [config_host_module_1.ConfigHostModule, config_service_1.ConfigService],
    })
], ConfigModule);

}, function(modId) { var map = {"./config-host.module":1784796701804,"./config.constants":1784796701805,"./utils/create-config-factory.util":1784796701808,"./utils/get-registration-token.util":1784796701810,"./utils/merge-configs.util":1784796701811}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701804, function(require, module, exports) {

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigHostModule = void 0;
const common_1 = require("@nestjs/common");
const config_constants_1 = require("./config.constants");
const config_service_1 = require("./config.service");
/**
 * @publicApi
 */
let ConfigHostModule = class ConfigHostModule {
};
exports.ConfigHostModule = ConfigHostModule;
exports.ConfigHostModule = ConfigHostModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: config_constants_1.CONFIGURATION_TOKEN,
                useFactory: () => ({}),
            },
            {
                provide: config_constants_1.CONFIGURATION_SERVICE_TOKEN,
                useClass: config_service_1.ConfigService,
            },
        ],
        exports: [config_constants_1.CONFIGURATION_TOKEN, config_constants_1.CONFIGURATION_SERVICE_TOKEN],
    })
], ConfigHostModule);

}, function(modId) { var map = {"./config.constants":1784796701805}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701805, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.AS_PROVIDER_METHOD_KEY = exports.VALIDATED_ENV_PROPNAME = exports.PARTIAL_CONFIGURATION_PROPNAME = exports.PARTIAL_CONFIGURATION_KEY = exports.VALIDATED_ENV_LOADER = exports.CONFIGURATION_LOADER = exports.CONFIGURATION_TOKEN = exports.CONFIGURATION_SERVICE_TOKEN = void 0;
/**
 * Injection tokens
 */
exports.CONFIGURATION_SERVICE_TOKEN = Symbol('CONFIG_SERVICE');
exports.CONFIGURATION_TOKEN = 'CONFIGURATION_TOKEN';
exports.CONFIGURATION_LOADER = 'CONFIGURATION_LOADER';
exports.VALIDATED_ENV_LOADER = 'VALIDATED_ENV_LOADER';
exports.PARTIAL_CONFIGURATION_KEY = 'PARTIAL_CONFIGURATION_KEY';
exports.PARTIAL_CONFIGURATION_PROPNAME = 'KEY';
exports.VALIDATED_ENV_PROPNAME = '_PROCESS_ENV_VALIDATED';
exports.AS_PROVIDER_METHOD_KEY = 'asProvider';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701808, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfigProvider = createConfigProvider;
const get_config_token_util_1 = require("./get-config-token.util");
const crypto_1 = require("crypto");
/**
 * @publicApi
 */
function createConfigProvider(factory) {
    return {
        provide: factory.KEY || (0, get_config_token_util_1.getConfigToken)((0, crypto_1.randomUUID)()),
        useFactory: factory,
        inject: [],
    };
}

}, function(modId) { var map = {"./get-config-token.util":1784796701809}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701809, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigToken = getConfigToken;
/**
 * @publicApi
 */
function getConfigToken(token) {
    return `CONFIGURATION(${token.toString()})`;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701810, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistrationToken = getRegistrationToken;
const config_constants_1 = require("../config.constants");
/**
 * @publicApi
 */
function getRegistrationToken(config) {
    return config[config_constants_1.PARTIAL_CONFIGURATION_KEY];
}

}, function(modId) { var map = {"../config.constants":1784796701805}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701811, function(require, module, exports) {

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeConfigObject = mergeConfigObject;
const set_1 = __importDefault(require("lodash/set"));
/**
 * @publicApi
 */
function mergeConfigObject(host, partial, token) {
    if (token) {
        (0, set_1.default)(host, token, partial);
        return partial;
    }
    Object.assign(host, partial);
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701813, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./config-object.type"), exports);
__exportStar(require("./config.type"), exports);
__exportStar(require("./no-infer.type"), exports);
__exportStar(require("./path-value.type"), exports);

}, function(modId) { var map = {"./config-object.type":1784796701814,"./config.type":1784796701815,"./no-infer.type":1784796701816,"./path-value.type":1784796701817}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701814, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701815, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701816, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701817, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701818, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./register-as.util"), exports);
__exportStar(require("./get-config-token.util"), exports);

}, function(modId) { var map = {"./register-as.util":1784796701819,"./get-config-token.util":1784796701809}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701819, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAs = registerAs;
const __1 = require("..");
const config_constants_1 = require("../config.constants");
const get_config_token_util_1 = require("./get-config-token.util");
/**
 * @publicApi
 *
 * Registers the configuration object behind a specified token.
 */
function registerAs(token, configFactory) {
    const defineProperty = (key, value) => {
        Object.defineProperty(configFactory, key, {
            configurable: false,
            enumerable: false,
            value,
            writable: false,
        });
    };
    defineProperty(config_constants_1.PARTIAL_CONFIGURATION_KEY, token);
    defineProperty(config_constants_1.PARTIAL_CONFIGURATION_PROPNAME, (0, get_config_token_util_1.getConfigToken)(token));
    defineProperty(config_constants_1.AS_PROVIDER_METHOD_KEY, () => ({
        imports: [__1.ConfigModule.forFeature(configFactory)],
        useFactory: (config) => config,
        inject: [(0, get_config_token_util_1.getConfigToken)(token)],
    }));
    return configFactory;
}

}, function(modId) { var map = {"..":1784796701801,"../config.constants":1784796701805,"./get-config-token.util":1784796701809}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701820, function(require, module, exports) {

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./config-change-event.interface"), exports);
__exportStar(require("./config-factory.interface"), exports);
__exportStar(require("./config-module-options.interface"), exports);

}, function(modId) { var map = {"./config-change-event.interface":1784796701821,"./config-factory.interface":1784796701822,"./config-module-options.interface":1784796701823}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701821, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701822, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701823, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1784796701800);
})()
//miniprogram-npm-outsideDeps=["./conditional.module","./config.service","@nestjs/common","@nestjs/common/utils/shared.utils","dotenv","dotenv-expand","fs","path","crypto","lodash/set"]
//# sourceMappingURL=index.js.map