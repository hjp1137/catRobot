module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1784796701941, function(require, module, exports) {

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
require("reflect-metadata");
__exportStar(require("./decorators"), exports);
__exportStar(require("./document-builder"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./swagger-module"), exports);
__exportStar(require("./type-helpers"), exports);
__exportStar(require("./utils"), exports);

}, function(modId) {var map = {"./decorators":1784796701942,"./document-builder":1784796701972,"./interfaces":1784796701976,"./swagger-module":1784796701979,"./type-helpers":1784796702023,"./utils":1784796701985}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701942, function(require, module, exports) {

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
exports.ApiResponseProperty = exports.ApiPropertyOptional = exports.ApiProperty = void 0;
__exportStar(require("./api-basic.decorator"), exports);
__exportStar(require("./api-bearer.decorator"), exports);
__exportStar(require("./api-body.decorator"), exports);
__exportStar(require("./api-consumes.decorator"), exports);
__exportStar(require("./api-cookie.decorator"), exports);
__exportStar(require("./api-default-getter.decorator"), exports);
__exportStar(require("./api-exclude-endpoint.decorator"), exports);
__exportStar(require("./api-exclude-controller.decorator"), exports);
__exportStar(require("./api-extra-models.decorator"), exports);
__exportStar(require("./api-header.decorator"), exports);
__exportStar(require("./api-hide-property.decorator"), exports);
__exportStar(require("./api-link.decorator"), exports);
__exportStar(require("./api-oauth2.decorator"), exports);
__exportStar(require("./api-operation.decorator"), exports);
__exportStar(require("./api-param.decorator"), exports);
__exportStar(require("./api-produces.decorator"), exports);
var api_property_decorator_1 = require("./api-property.decorator");
Object.defineProperty(exports, "ApiProperty", { enumerable: true, get: function () { return api_property_decorator_1.ApiProperty; } });
Object.defineProperty(exports, "ApiPropertyOptional", { enumerable: true, get: function () { return api_property_decorator_1.ApiPropertyOptional; } });
Object.defineProperty(exports, "ApiResponseProperty", { enumerable: true, get: function () { return api_property_decorator_1.ApiResponseProperty; } });
__exportStar(require("./api-query.decorator"), exports);
__exportStar(require("./api-response.decorator"), exports);
__exportStar(require("./api-security.decorator"), exports);
__exportStar(require("./api-use-tags.decorator"), exports);
__exportStar(require("./api-callbacks.decorator"), exports);
__exportStar(require("./api-extension.decorator"), exports);
__exportStar(require("./api-schema.decorator"), exports);

}, function(modId) { var map = {"./api-basic.decorator":1784796701943,"./api-bearer.decorator":1784796701947,"./api-body.decorator":1784796701948,"./api-consumes.decorator":1784796701952,"./api-cookie.decorator":1784796701953,"./api-default-getter.decorator":1784796701954,"./api-exclude-endpoint.decorator":1784796701955,"./api-exclude-controller.decorator":1784796701956,"./api-extra-models.decorator":1784796701957,"./api-header.decorator":1784796701958,"./api-hide-property.decorator":1784796701959,"./api-link.decorator":1784796701960,"./api-oauth2.decorator":1784796701961,"./api-operation.decorator":1784796701962,"./api-param.decorator":1784796701963,"./api-produces.decorator":1784796701964,"./api-property.decorator":1784796701965,"./api-query.decorator":1784796701966,"./api-response.decorator":1784796701967,"./api-security.decorator":1784796701944,"./api-use-tags.decorator":1784796701968,"./api-callbacks.decorator":1784796701969,"./api-extension.decorator":1784796701970,"./api-schema.decorator":1784796701971}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701943, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiBasicAuth = ApiBasicAuth;
const api_security_decorator_1 = require("./api-security.decorator");
function ApiBasicAuth(name = 'basic') {
    return (0, api_security_decorator_1.ApiSecurity)(name);
}

}, function(modId) { var map = {"./api-security.decorator":1784796701944}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701944, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSecurity = ApiSecurity;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const extend_metadata_util_1 = require("../utils/extend-metadata.util");
function ApiSecurity(name, requirements = []) {
    let metadata;
    if ((0, lodash_1.isString)(name)) {
        metadata = [{ [name]: requirements }];
    }
    else {
        metadata = [name];
    }
    return (target, key, descriptor) => {
        if (descriptor) {
            metadata = (0, extend_metadata_util_1.extendMetadata)(metadata, constants_1.DECORATORS.API_SECURITY, descriptor.value);
            Reflect.defineMetadata(constants_1.DECORATORS.API_SECURITY, metadata, descriptor.value);
            return descriptor;
        }
        metadata = (0, extend_metadata_util_1.extendMetadata)(metadata, constants_1.DECORATORS.API_SECURITY, target);
        Reflect.defineMetadata(constants_1.DECORATORS.API_SECURITY, metadata, target);
        return target;
    };
}

}, function(modId) { var map = {"../constants":1784796701945,"../utils/extend-metadata.util":1784796701946}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701945, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.DECORATORS = exports.DECORATORS_PREFIX = void 0;
exports.DECORATORS_PREFIX = 'swagger';
exports.DECORATORS = {
    API_OPERATION: `${exports.DECORATORS_PREFIX}/apiOperation`,
    API_RESPONSE: `${exports.DECORATORS_PREFIX}/apiResponse`,
    API_PRODUCES: `${exports.DECORATORS_PREFIX}/apiProduces`,
    API_CONSUMES: `${exports.DECORATORS_PREFIX}/apiConsumes`,
    API_TAGS: `${exports.DECORATORS_PREFIX}/apiUseTags`,
    API_CALLBACKS: `${exports.DECORATORS_PREFIX}/apiCallbacks`,
    API_PARAMETERS: `${exports.DECORATORS_PREFIX}/apiParameters`,
    API_HEADERS: `${exports.DECORATORS_PREFIX}/apiHeaders`,
    API_MODEL_PROPERTIES: `${exports.DECORATORS_PREFIX}/apiModelProperties`,
    API_MODEL_PROPERTIES_ARRAY: `${exports.DECORATORS_PREFIX}/apiModelPropertiesArray`,
    API_SECURITY: `${exports.DECORATORS_PREFIX}/apiSecurity`,
    API_EXCLUDE_ENDPOINT: `${exports.DECORATORS_PREFIX}/apiExcludeEndpoint`,
    API_EXCLUDE_CONTROLLER: `${exports.DECORATORS_PREFIX}/apiExcludeController`,
    API_EXTRA_MODELS: `${exports.DECORATORS_PREFIX}/apiExtraModels`,
    API_EXTENSION: `${exports.DECORATORS_PREFIX}/apiExtension`,
    API_SCHEMA: `${exports.DECORATORS_PREFIX}/apiSchema`,
    API_DEFAULT_GETTER: `${exports.DECORATORS_PREFIX}/apiDefaultGetter`,
    API_LINK: `${exports.DECORATORS_PREFIX}/apiLink`
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701946, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.extendMetadata = extendMetadata;
require("reflect-metadata");
function extendMetadata(metadata, metakey, target) {
    const existingMetadata = Reflect.getMetadata(metakey, target);
    if (!existingMetadata) {
        return metadata;
    }
    return existingMetadata.concat(metadata);
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701947, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiBearerAuth = ApiBearerAuth;
const api_security_decorator_1 = require("./api-security.decorator");
function ApiBearerAuth(name = 'bearer') {
    return (0, api_security_decorator_1.ApiSecurity)(name);
}

}, function(modId) { var map = {"./api-security.decorator":1784796701944}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701948, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiBody = ApiBody;
const lodash_1 = require("lodash");
const enum_utils_1 = require("../utils/enum.utils");
const helpers_1 = require("./helpers");
const defaultBodyMetadata = {
    type: String,
    required: true
};
function ApiBody(options) {
    const [type, isArray] = (0, helpers_1.getTypeIsArrayTuple)(options.type, options.isArray);
    const param = Object.assign(Object.assign({ in: 'body' }, (0, lodash_1.omit)(options, 'enum')), { type,
        isArray });
    if ((0, enum_utils_1.isEnumArray)(options)) {
        (0, enum_utils_1.addEnumArraySchema)(param, options);
    }
    else if ((0, enum_utils_1.isEnumDefined)(options)) {
        (0, enum_utils_1.addEnumSchema)(param, options);
    }
    return (0, helpers_1.createParamDecorator)(param, defaultBodyMetadata);
}

}, function(modId) { var map = {"../utils/enum.utils":1784796701949,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701949, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnumMetadata = exports.isEnumDefined = exports.isEnumArray = void 0;
exports.getEnumValues = getEnumValues;
exports.getEnumType = getEnumType;
exports.addEnumArraySchema = addEnumArraySchema;
exports.addEnumSchema = addEnumSchema;
const lodash_1 = require("lodash");
function getEnumValues(enumType) {
    if (typeof enumType === 'function') {
        return getEnumValues(enumType());
    }
    if (Array.isArray(enumType)) {
        return enumType;
    }
    if (typeof enumType !== 'object') {
        return [];
    }
    const numericValues = Object.values(enumType)
        .filter((value) => typeof value === 'number')
        .map((value) => value.toString());
    return Object.keys(enumType)
        .filter((key) => !numericValues.includes(key))
        .map((key) => enumType[key]);
}
function getEnumType(values) {
    const hasString = values.filter(lodash_1.isString).length > 0;
    return hasString ? 'string' : 'number';
}
function addEnumArraySchema(paramDefinition, decoratorOptions) {
    const paramSchema = paramDefinition.schema || {};
    paramDefinition.schema = paramSchema;
    paramSchema.type = 'array';
    delete paramDefinition.isArray;
    const enumValues = getEnumValues(decoratorOptions.enum);
    paramSchema.items = {
        type: getEnumType(enumValues),
        enum: enumValues
    };
    if (decoratorOptions.enumName) {
        paramDefinition.enumName = decoratorOptions.enumName;
    }
    if (decoratorOptions.enumSchema) {
        paramDefinition.enumSchema = decoratorOptions.enumSchema;
    }
}
function addEnumSchema(paramDefinition, decoratorOptions) {
    const paramSchema = paramDefinition.schema || {};
    const enumValues = getEnumValues(decoratorOptions.enum);
    paramDefinition.schema = paramSchema;
    paramSchema.enum = enumValues;
    paramSchema.type = getEnumType(enumValues);
    if (decoratorOptions.enumName) {
        paramDefinition.enumName = decoratorOptions.enumName;
    }
    if (decoratorOptions.enumSchema) {
        paramDefinition.enumSchema = decoratorOptions.enumSchema;
    }
}
const isEnumArray = (obj) => obj.isArray && obj.enum;
exports.isEnumArray = isEnumArray;
const isEnumDefined = (obj) => obj.enum;
exports.isEnumDefined = isEnumDefined;
const isEnumMetadata = (metadata) => { var _a; return metadata.enum || (metadata.isArray && ((_a = metadata.items) === null || _a === void 0 ? void 0 : _a['enum'])); };
exports.isEnumMetadata = isEnumMetadata;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701950, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.createMethodDecorator = createMethodDecorator;
exports.createClassDecorator = createClassDecorator;
exports.createPropertyDecorator = createPropertyDecorator;
exports.createMixedDecorator = createMixedDecorator;
exports.createParamDecorator = createParamDecorator;
exports.getTypeIsArrayTuple = getTypeIsArrayTuple;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const plugin_constants_1 = require("../plugin/plugin-constants");
const constants_2 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
function createMethodDecorator(metakey, metadata, { overrideExisting } = { overrideExisting: true }) {
    return (target, key, descriptor) => {
        if (typeof metadata === 'object') {
            const prevValue = Reflect.getMetadata(metakey, descriptor.value);
            if (prevValue && !overrideExisting) {
                return descriptor;
            }
            Reflect.defineMetadata(metakey, Object.assign(Object.assign({}, prevValue), metadata), descriptor.value);
            return descriptor;
        }
        Reflect.defineMetadata(metakey, metadata, descriptor.value);
        return descriptor;
    };
}
function createClassDecorator(metakey, metadata = []) {
    return (target) => {
        const prevValue = Reflect.getMetadata(metakey, target) || [];
        Reflect.defineMetadata(metakey, [...prevValue, ...metadata], target);
        return target;
    };
}
function createPropertyDecorator(metakey, metadata, overrideExisting = true) {
    return (target, propertyKey) => {
        var _a, _b, _c, _d;
        const properties = Reflect.getMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES_ARRAY, target) || [];
        const key = `:${propertyKey}`;
        if (!properties.includes(key)) {
            Reflect.defineMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES_ARRAY, [...properties, `:${propertyKey}`], target);
        }
        const existingMetadata = Reflect.getMetadata(metakey, target, propertyKey);
        if (existingMetadata) {
            const newMetadata = (0, lodash_1.pickBy)(metadata, (0, lodash_1.negate)(lodash_1.isUndefined));
            const metadataToSave = overrideExisting
                ? Object.assign(Object.assign({}, existingMetadata), newMetadata) : Object.assign(Object.assign({}, newMetadata), existingMetadata);
            Reflect.defineMetadata(metakey, metadataToSave, target, propertyKey);
        }
        else {
            const type = (_d = (_c = (_b = (_a = target === null || target === void 0 ? void 0 : target.constructor) === null || _a === void 0 ? void 0 : _a[plugin_constants_1.METADATA_FACTORY_NAME]) === null || _b === void 0 ? void 0 : _b.call(_a)[propertyKey]) === null || _c === void 0 ? void 0 : _c.type) !== null && _d !== void 0 ? _d : Reflect.getMetadata('design:type', target, propertyKey);
            Reflect.defineMetadata(metakey, Object.assign({ type }, (0, lodash_1.pickBy)(metadata, (0, lodash_1.negate)(lodash_1.isUndefined))), target, propertyKey);
        }
    };
}
function createMixedDecorator(metakey, metadata) {
    return (target, key, descriptor) => {
        if (descriptor) {
            let metadatas;
            if (Array.isArray(metadata)) {
                const previousMetadata = Reflect.getMetadata(metakey, descriptor.value) || [];
                metadatas = [...previousMetadata, ...metadata];
            }
            else {
                const previousMetadata = Reflect.getMetadata(metakey, descriptor.value) || {};
                metadatas = Object.assign(Object.assign({}, previousMetadata), metadata);
            }
            Reflect.defineMetadata(metakey, metadatas, descriptor.value);
            return descriptor;
        }
        let metadatas;
        if (Array.isArray(metadata)) {
            const previousMetadata = Reflect.getMetadata(metakey, target) || [];
            metadatas = [...previousMetadata, ...metadata];
        }
        else {
            const previousMetadata = Reflect.getMetadata(metakey, target) || {};
            metadatas = Object.assign(Object.assign({}, previousMetadata), metadata);
        }
        Reflect.defineMetadata(metakey, metadatas, target);
        return target;
    };
}
function createParamDecorator(metadata, initial) {
    return (target, key, descriptor) => {
        const paramOptions = Object.assign(Object.assign({}, initial), (0, lodash_1.pickBy)(metadata, (0, lodash_1.negate)(lodash_1.isUndefined)));
        if (descriptor) {
            const parameters = Reflect.getMetadata(constants_1.DECORATORS.API_PARAMETERS, descriptor.value) || [];
            Reflect.defineMetadata(constants_1.DECORATORS.API_PARAMETERS, [...parameters, paramOptions], descriptor.value);
            return descriptor;
        }
        if (typeof target === 'object') {
            return target;
        }
        const propertyKeys = Object.getOwnPropertyNames(target.prototype);
        for (const propertyKey of propertyKeys) {
            if ((0, shared_utils_1.isConstructor)(propertyKey)) {
                continue;
            }
            const methodDescriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyKey);
            if (!methodDescriptor) {
                continue;
            }
            const isApiMethod = Reflect.hasMetadata(constants_2.METHOD_METADATA, methodDescriptor.value);
            if (!isApiMethod) {
                continue;
            }
            const parameters = Reflect.getMetadata(constants_1.DECORATORS.API_PARAMETERS, methodDescriptor.value) || [];
            Reflect.defineMetadata(constants_1.DECORATORS.API_PARAMETERS, [...parameters, paramOptions], methodDescriptor.value);
        }
    };
}
function getTypeIsArrayTuple(input, isArrayFlag) {
    if (!input) {
        return [input, isArrayFlag];
    }
    if (isArrayFlag) {
        return [input, isArrayFlag];
    }
    const isInputArray = (0, lodash_1.isArray)(input);
    const type = isInputArray ? input[0] : input;
    return [type, isInputArray];
}

}, function(modId) { var map = {"../constants":1784796701945,"../plugin/plugin-constants":1784796701951}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701951, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.METADATA_FACTORY_NAME = exports.OPENAPI_PACKAGE_NAME = exports.OPENAPI_NAMESPACE = void 0;
exports.OPENAPI_NAMESPACE = 'openapi';
exports.OPENAPI_PACKAGE_NAME = '@nestjs/swagger';
exports.METADATA_FACTORY_NAME = '_OPENAPI_METADATA_FACTORY';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701952, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiConsumes = ApiConsumes;
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
function ApiConsumes(...mimeTypes) {
    return (0, helpers_1.createMixedDecorator)(constants_1.DECORATORS.API_CONSUMES, mimeTypes);
}

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701953, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCookieAuth = ApiCookieAuth;
const api_security_decorator_1 = require("./api-security.decorator");
function ApiCookieAuth(name = 'cookie') {
    return (0, api_security_decorator_1.ApiSecurity)(name);
}

}, function(modId) { var map = {"./api-security.decorator":1784796701944}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701954, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDefaultGetter = ApiDefaultGetter;
const constants_1 = require("../constants");
function ApiDefaultGetter(type, parameter) {
    return (prototype, key, descriptor) => {
        if (type.prototype) {
            Reflect.defineMetadata(constants_1.DECORATORS.API_DEFAULT_GETTER, { getter: descriptor.value, parameter, prototype }, type.prototype);
        }
        return descriptor;
    };
}

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701955, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExcludeEndpoint = ApiExcludeEndpoint;
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
function ApiExcludeEndpoint(disable = true) {
    return (0, helpers_1.createMethodDecorator)(constants_1.DECORATORS.API_EXCLUDE_ENDPOINT, {
        disable
    });
}

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701956, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExcludeController = ApiExcludeController;
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
function ApiExcludeController(disable = true) {
    return (0, helpers_1.createClassDecorator)(constants_1.DECORATORS.API_EXCLUDE_CONTROLLER, [disable]);
}

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701957, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExtraModels = ApiExtraModels;
const constants_1 = require("../constants");
function ApiExtraModels(...models) {
    return (target, key, descriptor) => {
        if (descriptor) {
            const extraModels = Reflect.getMetadata(constants_1.DECORATORS.API_EXTRA_MODELS, descriptor.value) ||
                [];
            Reflect.defineMetadata(constants_1.DECORATORS.API_EXTRA_MODELS, [...extraModels, ...models], descriptor.value);
            return descriptor;
        }
        const extraModels = Reflect.getMetadata(constants_1.DECORATORS.API_EXTRA_MODELS, target) || [];
        Reflect.defineMetadata(constants_1.DECORATORS.API_EXTRA_MODELS, [...extraModels, ...models], target);
        return target;
    };
}

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701958, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHeaders = void 0;
exports.ApiHeader = ApiHeader;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const enum_utils_1 = require("../utils/enum.utils");
const helpers_1 = require("./helpers");
const defaultHeaderOptions = {
    name: ''
};
function ApiHeader(options) {
    const param = (0, lodash_1.pickBy)({
        name: (0, lodash_1.isNil)(options.name) ? defaultHeaderOptions.name : options.name,
        in: 'header',
        description: options.description,
        required: options.required,
        examples: options.examples,
        schema: Object.assign({ type: 'string' }, (options.schema || {}))
    }, (0, lodash_1.negate)(lodash_1.isUndefined));
    if (options.enum) {
        const enumValues = (0, enum_utils_1.getEnumValues)(options.enum);
        param.schema = Object.assign(Object.assign({}, param.schema), { enum: enumValues, type: (0, enum_utils_1.getEnumType)(enumValues) });
    }
    return (target, key, descriptor) => {
        if (descriptor) {
            return (0, helpers_1.createParamDecorator)(param, defaultHeaderOptions)(target, key, descriptor);
        }
        return (0, helpers_1.createClassDecorator)(constants_1.DECORATORS.API_HEADERS, [param])(target);
    };
}
const ApiHeaders = (headers) => {
    return (target, key, descriptor) => {
        headers.forEach((options) => ApiHeader(options)(target, key, descriptor));
    };
};
exports.ApiHeaders = ApiHeaders;

}, function(modId) { var map = {"../constants":1784796701945,"../utils/enum.utils":1784796701949,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701959, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHideProperty = ApiHideProperty;
function ApiHideProperty() {
    return (target, propertyKey) => { };
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701960, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLink = ApiLink;
const constants_1 = require("../constants");
function ApiLink({ from, fromField = 'id', routeParam }) {
    return (controllerPrototype, key, descriptor) => {
        var _a;
        const { prototype } = from;
        if (prototype) {
            const links = (_a = Reflect.getMetadata(constants_1.DECORATORS.API_LINK, prototype)) !== null && _a !== void 0 ? _a : [];
            links.push({
                method: descriptor.value,
                prototype: controllerPrototype,
                field: fromField,
                parameter: routeParam
            });
            Reflect.defineMetadata(constants_1.DECORATORS.API_LINK, links, prototype);
        }
        return descriptor;
    };
}

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701961, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiOAuth2 = ApiOAuth2;
const api_security_decorator_1 = require("./api-security.decorator");
function ApiOAuth2(scopes, name = 'oauth2') {
    return (0, api_security_decorator_1.ApiSecurity)(name, scopes);
}

}, function(modId) { var map = {"./api-security.decorator":1784796701944}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701962, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiOperation = ApiOperation;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
const defaultOperationOptions = {
    summary: ''
};
function ApiOperation(options, { overrideExisting } = { overrideExisting: true }) {
    return (0, helpers_1.createMethodDecorator)(constants_1.DECORATORS.API_OPERATION, (0, lodash_1.pickBy)(Object.assign(Object.assign({}, defaultOperationOptions), options), (0, lodash_1.negate)(lodash_1.isUndefined)), { overrideExisting });
}

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701963, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiParam = ApiParam;
const lodash_1 = require("lodash");
const enum_utils_1 = require("../utils/enum.utils");
const helpers_1 = require("./helpers");
const defaultParamOptions = {
    name: '',
    required: true
};
function ApiParam(options) {
    const param = Object.assign({ name: (0, lodash_1.isNil)(options.name) ? defaultParamOptions.name : options.name, in: 'path' }, (0, lodash_1.omit)(options, 'enum'));
    if ((0, enum_utils_1.isEnumDefined)(options)) {
        (0, enum_utils_1.addEnumSchema)(param, options);
    }
    return (0, helpers_1.createParamDecorator)(param, defaultParamOptions);
}

}, function(modId) { var map = {"../utils/enum.utils":1784796701949,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701964, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiProduces = ApiProduces;
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
function ApiProduces(...mimeTypes) {
    return (0, helpers_1.createMixedDecorator)(constants_1.DECORATORS.API_PRODUCES, mimeTypes);
}

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701965, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiProperty = ApiProperty;
exports.createApiPropertyDecorator = createApiPropertyDecorator;
exports.ApiPropertyOptional = ApiPropertyOptional;
exports.ApiResponseProperty = ApiResponseProperty;
const constants_1 = require("../constants");
const enum_utils_1 = require("../utils/enum.utils");
const helpers_1 = require("./helpers");
const isEnumArray = (opts) => opts.isArray && 'enum' in opts;
function ApiProperty(options = {}) {
    return createApiPropertyDecorator(options);
}
function createApiPropertyDecorator(options = {}, overrideExisting = true) {
    const [type, isArray] = (0, helpers_1.getTypeIsArrayTuple)(options.type, options.isArray);
    options = Object.assign(Object.assign({}, options), { type,
        isArray });
    if (isEnumArray(options)) {
        options.type = 'array';
        const enumValues = (0, enum_utils_1.getEnumValues)(options.enum);
        options.items = {
            type: (0, enum_utils_1.getEnumType)(enumValues),
            enum: enumValues
        };
        delete options.enum;
    }
    else if ('enum' in options && options.enum !== undefined) {
        const enumValues = (0, enum_utils_1.getEnumValues)(options.enum);
        options.enum = enumValues;
        options.type = (0, enum_utils_1.getEnumType)(enumValues);
    }
    if (Array.isArray(options.type)) {
        options.type = 'array';
        options.items = {
            type: 'array',
            items: {
                type: options.type[0]
            }
        };
    }
    return (0, helpers_1.createPropertyDecorator)(constants_1.DECORATORS.API_MODEL_PROPERTIES, options, overrideExisting);
}
function ApiPropertyOptional(options = {}) {
    return ApiProperty(Object.assign(Object.assign({}, options), { required: false }));
}
function ApiResponseProperty(options = {}) {
    return ApiProperty(Object.assign({ readOnly: true }, options));
}

}, function(modId) { var map = {"../constants":1784796701945,"../utils/enum.utils":1784796701949,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701966, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiQuery = ApiQuery;
const lodash_1 = require("lodash");
const enum_utils_1 = require("../utils/enum.utils");
const helpers_1 = require("./helpers");
const defaultQueryOptions = {
    name: '',
    required: true
};
function ApiQuery(options) {
    const apiQueryMetadata = options;
    const [type, isArray] = (0, helpers_1.getTypeIsArrayTuple)(apiQueryMetadata.type, apiQueryMetadata.isArray);
    const param = Object.assign(Object.assign({ name: 'name' in options ? options.name : defaultQueryOptions.name, in: 'query' }, (0, lodash_1.omit)(options, 'enum')), { type });
    if ((0, enum_utils_1.isEnumArray)(options)) {
        (0, enum_utils_1.addEnumArraySchema)(param, options);
    }
    else if ((0, enum_utils_1.isEnumDefined)(options)) {
        (0, enum_utils_1.addEnumSchema)(param, options);
    }
    if (isArray) {
        param.isArray = isArray;
    }
    return (0, helpers_1.createParamDecorator)(param, defaultQueryOptions);
}

}, function(modId) { var map = {"../utils/enum.utils":1784796701949,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701967, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDefaultResponse = exports.ApiHttpVersionNotSupportedResponse = exports.ApiGatewayTimeoutResponse = exports.ApiServiceUnavailableResponse = exports.ApiBadGatewayResponse = exports.ApiNotImplementedResponse = exports.ApiInternalServerErrorResponse = exports.ApiTooManyRequestsResponse = exports.ApiPreconditionRequiredResponse = exports.ApiFailedDependencyResponse = exports.ApiUnprocessableEntityResponse = exports.ApiMisdirectedResponse = exports.ApiIAmATeapotResponse = exports.ApiExpectationFailedResponse = exports.ApiRequestedRangeNotSatisfiableResponse = exports.ApiUnsupportedMediaTypeResponse = exports.ApiUriTooLongResponse = exports.ApiPayloadTooLargeResponse = exports.ApiPreconditionFailedResponse = exports.ApiLengthRequiredResponse = exports.ApiGoneResponse = exports.ApiConflictResponse = exports.ApiRequestTimeoutResponse = exports.ApiProxyAuthenticationRequiredResponse = exports.ApiNotAcceptableResponse = exports.ApiMethodNotAllowedResponse = exports.ApiNotFoundResponse = exports.ApiForbiddenResponse = exports.ApiPaymentRequiredResponse = exports.ApiUnauthorizedResponse = exports.ApiBadRequestResponse = exports.ApiPermanentRedirectResponse = exports.ApiTemporaryRedirectResponse = exports.ApiNotModifiedResponse = exports.ApiSeeOtherResponse = exports.ApiFoundResponse = exports.ApiMovedPermanentlyResponse = exports.ApiAmbiguousResponse = exports.ApiPartialContentResponse = exports.ApiResetContentResponse = exports.ApiNoContentResponse = exports.ApiNonAuthoritativeInformationResponse = exports.ApiAcceptedResponse = exports.ApiCreatedResponse = exports.ApiOkResponse = exports.ApiEarlyhintsResponse = exports.ApiProcessingResponse = exports.ApiSwitchingProtocolsResponse = exports.ApiContinueResponse = void 0;
exports.ApiResponse = ApiResponse;
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
function ApiResponse(options, { overrideExisting } = { overrideExisting: true }) {
    const apiResponseMetadata = options;
    const [type, isArray] = (0, helpers_1.getTypeIsArrayTuple)(apiResponseMetadata.type, apiResponseMetadata.isArray);
    apiResponseMetadata.type = type;
    apiResponseMetadata.isArray = isArray;
    options.description = options.description ? options.description : '';
    const groupedMetadata = {
        [options.status || 'default']: (0, lodash_1.omit)(options, 'status')
    };
    return (target, key, descriptor) => {
        if (descriptor) {
            const responses = Reflect.getMetadata(constants_1.DECORATORS.API_RESPONSE, descriptor.value);
            if (responses && !overrideExisting) {
                return descriptor;
            }
            Reflect.defineMetadata(constants_1.DECORATORS.API_RESPONSE, Object.assign(Object.assign({}, responses), groupedMetadata), descriptor.value);
            return descriptor;
        }
        const responses = Reflect.getMetadata(constants_1.DECORATORS.API_RESPONSE, target);
        if (responses && !overrideExisting) {
            return descriptor;
        }
        Reflect.defineMetadata(constants_1.DECORATORS.API_RESPONSE, Object.assign(Object.assign({}, responses), groupedMetadata), target);
        return target;
    };
}
const decorators = {};
const statusList = Object.keys(common_1.HttpStatus)
    .filter((key) => !isNaN(Number(common_1.HttpStatus[key])))
    .map((key) => {
    const functionName = key
        .split('_')
        .map((strToken) => `${strToken[0].toUpperCase()}${strToken.slice(1).toLowerCase()}`)
        .join('');
    return {
        code: Number(common_1.HttpStatus[key]),
        functionName: `Api${functionName}Response`
    };
});
statusList.forEach(({ code, functionName }) => {
    decorators[functionName] = function (options = {}) {
        return ApiResponse(Object.assign(Object.assign({}, options), { status: code }));
    };
});
exports.ApiContinueResponse = decorators.ApiContinueResponse, exports.ApiSwitchingProtocolsResponse = decorators.ApiSwitchingProtocolsResponse, exports.ApiProcessingResponse = decorators.ApiProcessingResponse, exports.ApiEarlyhintsResponse = decorators.ApiEarlyhintsResponse, exports.ApiOkResponse = decorators.ApiOkResponse, exports.ApiCreatedResponse = decorators.ApiCreatedResponse, exports.ApiAcceptedResponse = decorators.ApiAcceptedResponse, exports.ApiNonAuthoritativeInformationResponse = decorators.ApiNonAuthoritativeInformationResponse, exports.ApiNoContentResponse = decorators.ApiNoContentResponse, exports.ApiResetContentResponse = decorators.ApiResetContentResponse, exports.ApiPartialContentResponse = decorators.ApiPartialContentResponse, exports.ApiAmbiguousResponse = decorators.ApiAmbiguousResponse, exports.ApiMovedPermanentlyResponse = decorators.ApiMovedPermanentlyResponse, exports.ApiFoundResponse = decorators.ApiFoundResponse, exports.ApiSeeOtherResponse = decorators.ApiSeeOtherResponse, exports.ApiNotModifiedResponse = decorators.ApiNotModifiedResponse, exports.ApiTemporaryRedirectResponse = decorators.ApiTemporaryRedirectResponse, exports.ApiPermanentRedirectResponse = decorators.ApiPermanentRedirectResponse, exports.ApiBadRequestResponse = decorators.ApiBadRequestResponse, exports.ApiUnauthorizedResponse = decorators.ApiUnauthorizedResponse, exports.ApiPaymentRequiredResponse = decorators.ApiPaymentRequiredResponse, exports.ApiForbiddenResponse = decorators.ApiForbiddenResponse, exports.ApiNotFoundResponse = decorators.ApiNotFoundResponse, exports.ApiMethodNotAllowedResponse = decorators.ApiMethodNotAllowedResponse, exports.ApiNotAcceptableResponse = decorators.ApiNotAcceptableResponse, exports.ApiProxyAuthenticationRequiredResponse = decorators.ApiProxyAuthenticationRequiredResponse, exports.ApiRequestTimeoutResponse = decorators.ApiRequestTimeoutResponse, exports.ApiConflictResponse = decorators.ApiConflictResponse, exports.ApiGoneResponse = decorators.ApiGoneResponse, exports.ApiLengthRequiredResponse = decorators.ApiLengthRequiredResponse, exports.ApiPreconditionFailedResponse = decorators.ApiPreconditionFailedResponse, exports.ApiPayloadTooLargeResponse = decorators.ApiPayloadTooLargeResponse, exports.ApiUriTooLongResponse = decorators.ApiUriTooLongResponse, exports.ApiUnsupportedMediaTypeResponse = decorators.ApiUnsupportedMediaTypeResponse, exports.ApiRequestedRangeNotSatisfiableResponse = decorators.ApiRequestedRangeNotSatisfiableResponse, exports.ApiExpectationFailedResponse = decorators.ApiExpectationFailedResponse, exports.ApiIAmATeapotResponse = decorators.ApiIAmATeapotResponse, exports.ApiMisdirectedResponse = decorators.ApiMisdirectedResponse, exports.ApiUnprocessableEntityResponse = decorators.ApiUnprocessableEntityResponse, exports.ApiFailedDependencyResponse = decorators.ApiFailedDependencyResponse, exports.ApiPreconditionRequiredResponse = decorators.ApiPreconditionRequiredResponse, exports.ApiTooManyRequestsResponse = decorators.ApiTooManyRequestsResponse, exports.ApiInternalServerErrorResponse = decorators.ApiInternalServerErrorResponse, exports.ApiNotImplementedResponse = decorators.ApiNotImplementedResponse, exports.ApiBadGatewayResponse = decorators.ApiBadGatewayResponse, exports.ApiServiceUnavailableResponse = decorators.ApiServiceUnavailableResponse, exports.ApiGatewayTimeoutResponse = decorators.ApiGatewayTimeoutResponse, exports.ApiHttpVersionNotSupportedResponse = decorators.ApiHttpVersionNotSupportedResponse;
const ApiDefaultResponse = (options = {}) => ApiResponse(Object.assign(Object.assign({}, options), { status: 'default' }));
exports.ApiDefaultResponse = ApiDefaultResponse;

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701968, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTags = ApiTags;
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
function ApiTags(...tags) {
    return (0, helpers_1.createMixedDecorator)(constants_1.DECORATORS.API_TAGS, tags);
}

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701969, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiCallbacks = ApiCallbacks;
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
function ApiCallbacks(...callbackObject) {
    return (0, helpers_1.createMixedDecorator)(constants_1.DECORATORS.API_CALLBACKS, callbackObject);
}

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701970, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExtension = ApiExtension;
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
const lodash_1 = require("lodash");
function ApiExtension(extensionKey, extensionProperties) {
    if (!extensionKey.startsWith('x-')) {
        throw new Error('Extension key is not prefixed. Please ensure you prefix it with `x-`.');
    }
    const extensionObject = {
        [extensionKey]: (0, lodash_1.clone)(extensionProperties)
    };
    return (0, helpers_1.createMixedDecorator)(constants_1.DECORATORS.API_EXTENSION, extensionObject);
}

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701971, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSchema = ApiSchema;
const constants_1 = require("../constants");
const helpers_1 = require("./helpers");
function ApiSchema(options) {
    return (0, helpers_1.createClassDecorator)(constants_1.DECORATORS.API_SCHEMA, [options]);
}

}, function(modId) { var map = {"../constants":1784796701945,"./helpers":1784796701950}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701972, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentBuilder = void 0;
const common_1 = require("@nestjs/common");
const lodash_1 = require("lodash");
const document_base_1 = require("./fixtures/document.base");
const global_parameters_storage_1 = require("./storages/global-parameters.storage");
const global_responses_storage_1 = require("./storages/global-responses.storage");
class DocumentBuilder {
    constructor() {
        this.logger = new common_1.Logger(DocumentBuilder.name);
        this.document = (0, document_base_1.buildDocumentBase)();
    }
    setTitle(title) {
        this.document.info.title = title;
        return this;
    }
    setDescription(description) {
        this.document.info.description = description;
        return this;
    }
    setVersion(version) {
        this.document.info.version = version;
        return this;
    }
    setTermsOfService(termsOfService) {
        this.document.info.termsOfService = termsOfService;
        return this;
    }
    setContact(name, url, email) {
        this.document.info.contact = { name, url, email };
        return this;
    }
    setLicense(name, url) {
        this.document.info.license = { name, url };
        return this;
    }
    setOpenAPIVersion(version) {
        if (version.match(/^\d\.\d\.\d$/)) {
            this.document.openapi = version;
        }
        else {
            this.logger.warn('The OpenApi version is invalid. Expecting format "x.x.x"');
        }
        return this;
    }
    addServer(url, description, variables) {
        this.document.servers.push({ url, description, variables });
        return this;
    }
    setExternalDoc(description, url) {
        this.document.externalDocs = { description, url };
        return this;
    }
    setBasePath(path) {
        this.logger.warn('The "setBasePath" method has been deprecated. Now, a global prefix is populated automatically. If you want to ignore it, take a look here: https://docs.nestjs.com/recipes/swagger#global-prefix. Alternatively, you can use "addServer" method to set up multiple different paths.');
        return this;
    }
    addTag(name, description = '', externalDocs) {
        this.document.tags = this.document.tags.concat((0, lodash_1.pickBy)({
            name,
            description,
            externalDocs
        }, (0, lodash_1.negate)(lodash_1.isUndefined)));
        return this;
    }
    addExtension(extensionKey, extensionProperties, location = 'root') {
        if (!extensionKey.startsWith('x-')) {
            throw new Error('Extension key is not prefixed. Please ensure you prefix it with `x-`.');
        }
        if (location === 'root') {
            this.document[extensionKey] = (0, lodash_1.clone)(extensionProperties);
        }
        else {
            this.document[location][extensionKey] = (0, lodash_1.clone)(extensionProperties);
        }
        return this;
    }
    addSecurity(name, options) {
        this.document.components.securitySchemes = Object.assign(Object.assign({}, (this.document.components.securitySchemes || {})), { [name]: options });
        return this;
    }
    addGlobalResponse(...respones) {
        const groupedByStatus = respones.reduce((acc, response) => {
            const { status = 'default' } = response;
            acc[status] = (0, lodash_1.omit)(response, 'status');
            return acc;
        }, {});
        global_responses_storage_1.GlobalResponsesStorage.add(groupedByStatus);
        return this;
    }
    addGlobalParameters(...parameters) {
        global_parameters_storage_1.GlobalParametersStorage.add(...parameters);
        return this;
    }
    addSecurityRequirements(name, requirements = []) {
        let securityRequirement;
        if ((0, lodash_1.isString)(name)) {
            securityRequirement = { [name]: requirements };
        }
        else {
            securityRequirement = name;
        }
        this.document.security = (this.document.security || []).concat(Object.assign({}, securityRequirement));
        return this;
    }
    addBearerAuth(options = {
        type: 'http'
    }, name = 'bearer') {
        this.addSecurity(name, Object.assign({ scheme: 'bearer', bearerFormat: 'JWT' }, options));
        return this;
    }
    addOAuth2(options = {
        type: 'oauth2'
    }, name = 'oauth2') {
        this.addSecurity(name, Object.assign({ type: 'oauth2', flows: {} }, options));
        return this;
    }
    addApiKey(options = {
        type: 'apiKey'
    }, name = 'api_key') {
        this.addSecurity(name, Object.assign({ type: 'apiKey', in: 'header', name }, options));
        return this;
    }
    addBasicAuth(options = {
        type: 'http'
    }, name = 'basic') {
        this.addSecurity(name, Object.assign({ type: 'http', scheme: 'basic' }, options));
        return this;
    }
    addCookieAuth(cookieName = 'connect.sid', options = {
        type: 'apiKey'
    }, securityName = 'cookie') {
        this.addSecurity(securityName, Object.assign({ type: 'apiKey', in: 'cookie', name: cookieName }, options));
        return this;
    }
    build() {
        return this.document;
    }
}
exports.DocumentBuilder = DocumentBuilder;

}, function(modId) { var map = {"./fixtures/document.base":1784796701973,"./storages/global-parameters.storage":1784796701974,"./storages/global-responses.storage":1784796701975}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701973, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDocumentBase = void 0;
const buildDocumentBase = () => ({
    openapi: '3.0.0',
    info: {
        title: '',
        description: '',
        version: '1.0.0',
        contact: {}
    },
    tags: [],
    servers: [],
    components: {}
});
exports.buildDocumentBase = buildDocumentBase;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701974, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalParametersStorage = exports.GlobalParametersStorageHost = void 0;
class GlobalParametersStorageHost {
    constructor() {
        this.parameters = new Array();
    }
    add(...parameters) {
        this.parameters.push(...parameters);
    }
    getAll() {
        return this.parameters;
    }
    clear() {
        this.parameters = [];
    }
}
exports.GlobalParametersStorageHost = GlobalParametersStorageHost;
const globalRef = global;
exports.GlobalParametersStorage = globalRef.SwaggerGlobalParametersStorage ||
    (globalRef.SwaggerGlobalParametersStorage =
        new GlobalParametersStorageHost());

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701975, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalResponsesStorage = exports.GlobalResponsesStorageHost = void 0;
class GlobalResponsesStorageHost {
    constructor() {
        this.responses = {};
    }
    add(responses) {
        this.responses = Object.assign(Object.assign({}, this.responses), responses);
    }
    getAll() {
        return this.responses;
    }
    clear() {
        this.responses = {};
    }
}
exports.GlobalResponsesStorageHost = GlobalResponsesStorageHost;
const globalRef = global;
exports.GlobalResponsesStorage = globalRef.SwaggerGlobalResponsesStorage ||
    (globalRef.SwaggerGlobalResponsesStorage = new GlobalResponsesStorageHost());

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701976, function(require, module, exports) {

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
__exportStar(require("./swagger-custom-options.interface"), exports);
__exportStar(require("./swagger-document-options.interface"), exports);

}, function(modId) { var map = {"./swagger-custom-options.interface":1784796701977,"./swagger-document-options.interface":1784796701978}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701977, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701978, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701979, function(require, module, exports) {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerModule = void 0;
const jsyaml = require("js-yaml");
const metadata_loader_1 = require("./plugin/metadata-loader");
const swagger_scanner_1 = require("./swagger-scanner");
const swagger_ui_1 = require("./swagger-ui");
const assign_two_levels_deep_1 = require("./utils/assign-two-levels-deep");
const get_global_prefix_1 = require("./utils/get-global-prefix");
const normalize_rel_path_1 = require("./utils/normalize-rel-path");
const resolve_path_util_1 = require("./utils/resolve-path.util");
const validate_global_prefix_util_1 = require("./utils/validate-global-prefix.util");
const validate_path_util_1 = require("./utils/validate-path.util");
class SwaggerModule {
    static createDocument(app, config, options = {}) {
        const swaggerScanner = new swagger_scanner_1.SwaggerScanner();
        const document = swaggerScanner.scanApplication(app, options);
        document.components = (0, assign_two_levels_deep_1.assignTwoLevelsDeep)({}, config.components, document.components);
        return Object.assign(Object.assign({ openapi: '3.0.0', paths: {} }, config), document);
    }
    static loadPluginMetadata(metadataFn) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = yield metadataFn();
            return this.metadataLoader.load(metadata);
        });
    }
    static serveStatic(finalPath, app, customStaticPath) {
        const httpAdapter = app.getHttpAdapter();
        const swaggerAssetsPath = customStaticPath
            ? (0, resolve_path_util_1.resolvePath)(customStaticPath)
            : (0, swagger_ui_1.getSwaggerAssetsAbsoluteFSPath)();
        if (httpAdapter && httpAdapter.getType() === 'fastify') {
            app.useStaticAssets({
                root: swaggerAssetsPath,
                prefix: finalPath,
                decorateReply: false
            });
        }
        else {
            app.useStaticAssets(swaggerAssetsPath, {
                prefix: finalPath
            });
        }
    }
    static serveDocuments(finalPath, urlLastSubdirectory, httpAdapter, documentOrFactory, options) {
        let document;
        const getBuiltDocument = () => {
            if (!document) {
                document =
                    typeof documentOrFactory === 'function'
                        ? documentOrFactory()
                        : documentOrFactory;
            }
            return document;
        };
        if (options.ui) {
            this.serveSwaggerUi(finalPath, urlLastSubdirectory, httpAdapter, getBuiltDocument, options.swaggerOptions);
        }
        if (options.raw === true ||
            (Array.isArray(options.raw) && options.raw.length > 0)) {
            const serveJson = options.raw === true || options.raw.includes('json');
            const serveYaml = options.raw === true || options.raw.includes('yaml');
            this.serveDefinitions(httpAdapter, getBuiltDocument, options, {
                serveJson,
                serveYaml
            });
        }
    }
    static serveSwaggerUi(finalPath, urlLastSubdirectory, httpAdapter, getBuiltDocument, swaggerOptions) {
        const baseUrlForSwaggerUI = (0, normalize_rel_path_1.normalizeRelPath)(`./${urlLastSubdirectory}/`);
        let swaggerUiHtml;
        let swaggerUiInitJS;
        httpAdapter.get((0, normalize_rel_path_1.normalizeRelPath)(`${finalPath}/swagger-ui-init.js`), (req, res) => {
            res.type('application/javascript');
            const document = getBuiltDocument();
            if (swaggerOptions.patchDocumentOnRequest) {
                const documentToSerialize = swaggerOptions.patchDocumentOnRequest(req, res, document);
                const swaggerInitJsPerRequest = (0, swagger_ui_1.buildSwaggerInitJS)(documentToSerialize, swaggerOptions);
                return res.send(swaggerInitJsPerRequest);
            }
            if (!swaggerUiInitJS) {
                swaggerUiInitJS = (0, swagger_ui_1.buildSwaggerInitJS)(document, swaggerOptions);
            }
            res.send(swaggerUiInitJS);
        });
        try {
            httpAdapter.get((0, normalize_rel_path_1.normalizeRelPath)(`${finalPath}/${urlLastSubdirectory}/swagger-ui-init.js`), (req, res) => {
                res.type('application/javascript');
                const document = getBuiltDocument();
                if (swaggerOptions.patchDocumentOnRequest) {
                    const documentToSerialize = swaggerOptions.patchDocumentOnRequest(req, res, document);
                    const swaggerInitJsPerRequest = (0, swagger_ui_1.buildSwaggerInitJS)(documentToSerialize, swaggerOptions);
                    return res.send(swaggerInitJsPerRequest);
                }
                if (!swaggerUiInitJS) {
                    swaggerUiInitJS = (0, swagger_ui_1.buildSwaggerInitJS)(document, swaggerOptions);
                }
                res.send(swaggerUiInitJS);
            });
        }
        catch (_a) {
        }
        function serveSwaggerHtml(_, res) {
            res.type('text/html');
            if (!swaggerUiHtml) {
                swaggerUiHtml = (0, swagger_ui_1.buildSwaggerHTML)(baseUrlForSwaggerUI, swaggerOptions);
            }
            res.send(swaggerUiHtml);
        }
        httpAdapter.get(finalPath, serveSwaggerHtml);
        httpAdapter.get(`${finalPath}/index.html`, serveSwaggerHtml);
        try {
            httpAdapter.get((0, normalize_rel_path_1.normalizeRelPath)(`${finalPath}/`), serveSwaggerHtml);
        }
        catch (_b) {
        }
    }
    static serveDefinitions(httpAdapter, getBuiltDocument, options, serveOptions) {
        if (serveOptions.serveJson) {
            httpAdapter.get((0, normalize_rel_path_1.normalizeRelPath)(options.jsonDocumentUrl), (req, res) => {
                res.type('application/json');
                const document = getBuiltDocument();
                const documentToSerialize = options.swaggerOptions
                    .patchDocumentOnRequest
                    ? options.swaggerOptions.patchDocumentOnRequest(req, res, document)
                    : document;
                res.send(JSON.stringify(documentToSerialize));
            });
        }
        if (serveOptions.serveYaml) {
            httpAdapter.get((0, normalize_rel_path_1.normalizeRelPath)(options.yamlDocumentUrl), (req, res) => {
                res.type('text/yaml');
                const document = getBuiltDocument();
                const documentToSerialize = options.swaggerOptions
                    .patchDocumentOnRequest
                    ? options.swaggerOptions.patchDocumentOnRequest(req, res, document)
                    : document;
                const yamlDocument = jsyaml.dump(documentToSerialize, {
                    skipInvalid: true,
                    noRefs: true
                });
                res.send(yamlDocument);
            });
        }
    }
    static setup(path, app, documentOrFactory, options) {
        var _a, _b, _c;
        const globalPrefix = (0, get_global_prefix_1.getGlobalPrefix)(app);
        const finalPath = (0, validate_path_util_1.validatePath)((options === null || options === void 0 ? void 0 : options.useGlobalPrefix) && (0, validate_global_prefix_util_1.validateGlobalPrefix)(globalPrefix)
            ? `${globalPrefix}${(0, validate_path_util_1.validatePath)(path)}`
            : path);
        const urlLastSubdirectory = finalPath.split('/').slice(-1).pop() || '';
        const validatedGlobalPrefix = (options === null || options === void 0 ? void 0 : options.useGlobalPrefix) && (0, validate_global_prefix_util_1.validateGlobalPrefix)(globalPrefix)
            ? (0, validate_path_util_1.validatePath)(globalPrefix)
            : '';
        const finalJSONDocumentPath = (options === null || options === void 0 ? void 0 : options.jsonDocumentUrl)
            ? `${validatedGlobalPrefix}${(0, validate_path_util_1.validatePath)(options.jsonDocumentUrl)}`
            : `${finalPath}-json`;
        const finalYAMLDocumentPath = (options === null || options === void 0 ? void 0 : options.yamlDocumentUrl)
            ? `${validatedGlobalPrefix}${(0, validate_path_util_1.validatePath)(options.yamlDocumentUrl)}`
            : `${finalPath}-yaml`;
        const ui = (_b = (_a = options === null || options === void 0 ? void 0 : options.ui) !== null && _a !== void 0 ? _a : options === null || options === void 0 ? void 0 : options.swaggerUiEnabled) !== null && _b !== void 0 ? _b : true;
        const raw = (_c = options === null || options === void 0 ? void 0 : options.raw) !== null && _c !== void 0 ? _c : true;
        const httpAdapter = app.getHttpAdapter();
        SwaggerModule.serveDocuments(finalPath, urlLastSubdirectory, httpAdapter, documentOrFactory, {
            ui,
            raw,
            jsonDocumentUrl: finalJSONDocumentPath,
            yamlDocumentUrl: finalYAMLDocumentPath,
            swaggerOptions: options || {}
        });
        if (ui) {
            SwaggerModule.serveStatic(finalPath, app, options === null || options === void 0 ? void 0 : options.customSwaggerUiPath);
            const serveStaticSlashEndingPath = `${finalPath}/${urlLastSubdirectory}`;
            if (serveStaticSlashEndingPath !== finalPath) {
                SwaggerModule.serveStatic(serveStaticSlashEndingPath, app);
            }
        }
    }
}
exports.SwaggerModule = SwaggerModule;
SwaggerModule.metadataLoader = new metadata_loader_1.MetadataLoader();

}, function(modId) { var map = {"./plugin/metadata-loader":1784796701980,"./swagger-scanner":1784796701981,"./swagger-ui":1784796702014,"./utils/assign-two-levels-deep":1784796702018,"./utils/get-global-prefix":1784796702012,"./utils/normalize-rel-path":1784796702019,"./utils/resolve-path.util":1784796702020,"./utils/validate-global-prefix.util":1784796702021,"./utils/validate-path.util":1784796702022}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701980, function(require, module, exports) {

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataLoader = void 0;
const plugin_constants_1 = require("./plugin-constants");
class MetadataLoader {
    static addRefreshHook(hook) {
        return MetadataLoader.refreshHooks.push(hook);
    }
    load(metadata) {
        return __awaiter(this, void 0, void 0, function* () {
            const pkgMetadata = metadata['@nestjs/swagger'];
            if (!pkgMetadata) {
                return;
            }
            const { models, controllers } = pkgMetadata;
            if (models) {
                yield this.applyMetadata(models);
            }
            if (controllers) {
                yield this.applyMetadata(controllers);
            }
            this.runHooks();
        });
    }
    applyMetadata(meta) {
        return __awaiter(this, void 0, void 0, function* () {
            const loadPromises = meta.map((_a) => __awaiter(this, [_a], void 0, function* ([fileImport, fileMeta]) {
                const fileRef = yield fileImport;
                Object.keys(fileMeta).map((key) => {
                    const clsRef = fileRef[key];
                    clsRef[plugin_constants_1.METADATA_FACTORY_NAME] = () => fileMeta[key];
                });
            }));
            yield Promise.all(loadPromises);
        });
    }
    runHooks() {
        MetadataLoader.refreshHooks.forEach((hook) => hook());
    }
}
exports.MetadataLoader = MetadataLoader;
MetadataLoader.refreshHooks = new Array();

}, function(modId) { var map = {"./plugin-constants":1784796701951}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701981, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerScanner = void 0;
const constants_1 = require("@nestjs/common/constants");
const lodash_1 = require("lodash");
const model_properties_accessor_1 = require("./services/model-properties-accessor");
const schema_object_factory_1 = require("./services/schema-object-factory");
const swagger_types_mapper_1 = require("./services/swagger-types-mapper");
const swagger_explorer_1 = require("./swagger-explorer");
const swagger_transformer_1 = require("./swagger-transformer");
const get_global_prefix_1 = require("./utils/get-global-prefix");
const strip_last_slash_util_1 = require("./utils/strip-last-slash.util");
class SwaggerScanner {
    constructor() {
        this.transformer = new swagger_transformer_1.SwaggerTransformer();
        this.schemaObjectFactory = new schema_object_factory_1.SchemaObjectFactory(new model_properties_accessor_1.ModelPropertiesAccessor(), new swagger_types_mapper_1.SwaggerTypesMapper());
    }
    scanApplication(app, options) {
        const { deepScanRoutes, include: includedModules = [], extraModels = [], ignoreGlobalPrefix = false, operationIdFactory, linkNameFactory, autoTagControllers = true } = options;
        const untypedApp = app;
        const container = untypedApp.container;
        const internalConfigRef = untypedApp.config;
        const httpAdapterType = app.getHttpAdapter().getType();
        this.initializeSwaggerExplorer(httpAdapterType);
        const modules = this.getModules(container.getModules(), includedModules);
        const globalPrefix = !ignoreGlobalPrefix
            ? (0, strip_last_slash_util_1.stripLastSlash)((0, get_global_prefix_1.getGlobalPrefix)(app))
            : '';
        const denormalizedPaths = modules.map(({ controllers, metatype, imports }) => {
            let result = [];
            if (deepScanRoutes) {
                const isGlobal = (module) => !container.isGlobalModule(module);
                Array.from(imports.values())
                    .filter(isGlobal)
                    .forEach(({ metatype, controllers }) => {
                    const modulePath = this.getModulePathMetadata(container, metatype);
                    result = result.concat(this.scanModuleControllers(controllers, internalConfigRef, {
                        modulePath,
                        globalPrefix,
                        operationIdFactory,
                        linkNameFactory,
                        autoTagControllers
                    }));
                });
            }
            const modulePath = this.getModulePathMetadata(container, metatype);
            return result.concat(this.scanModuleControllers(controllers, internalConfigRef, {
                modulePath,
                globalPrefix,
                operationIdFactory,
                linkNameFactory,
                autoTagControllers
            }));
        });
        const schemas = this.explorer.getSchemas();
        this.addExtraModels(schemas, extraModels);
        return Object.assign(Object.assign({}, this.transformer.normalizePaths((0, lodash_1.flatten)(denormalizedPaths))), { components: {
                schemas: schemas
            } });
    }
    scanModuleControllers(controller, applicationConfig, options) {
        const denormalizedArray = [...controller.values()].map((ctrl) => this.explorer.exploreController(ctrl, applicationConfig, options));
        return (0, lodash_1.flatten)(denormalizedArray);
    }
    getModules(modulesContainer, include) {
        if (!include || (0, lodash_1.isEmpty)(include)) {
            return [...modulesContainer.values()];
        }
        return [...modulesContainer.values()].filter(({ metatype }) => include.some((item) => item === metatype));
    }
    addExtraModels(schemas, extraModels) {
        extraModels.forEach((item) => {
            this.schemaObjectFactory.exploreModelSchema(item, schemas);
        });
    }
    getModulePathMetadata(container, metatype) {
        const modulesContainer = container.getModules();
        const modulePath = Reflect.getMetadata(constants_1.MODULE_PATH + modulesContainer.applicationId, metatype);
        return modulePath !== null && modulePath !== void 0 ? modulePath : Reflect.getMetadata(constants_1.MODULE_PATH, metatype);
    }
    initializeSwaggerExplorer(httpAdapterType) {
        if (this.explorer) {
            return;
        }
        this.explorer = new swagger_explorer_1.SwaggerExplorer(this.schemaObjectFactory, {
            httpAdapterType
        });
    }
}
exports.SwaggerScanner = SwaggerScanner;

}, function(modId) { var map = {"./services/model-properties-accessor":1784796701982,"./services/schema-object-factory":1784796701983,"./services/swagger-types-mapper":1784796701991,"./swagger-explorer":1784796701992,"./swagger-transformer":1784796702010,"./utils/get-global-prefix":1784796702012,"./utils/strip-last-slash.util":1784796702013}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701982, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelPropertiesAccessor = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
require("reflect-metadata");
const constants_1 = require("../constants");
const api_property_decorator_1 = require("../decorators/api-property.decorator");
const plugin_constants_1 = require("../plugin/plugin-constants");
class ModelPropertiesAccessor {
    getModelProperties(prototype) {
        const properties = Reflect.getMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES_ARRAY, prototype) ||
            [];
        return properties
            .filter(shared_utils_1.isString)
            .filter((key) => key.charAt(0) === ':' && !(0, shared_utils_1.isFunction)(prototype[key]))
            .map((key) => key.slice(1));
    }
    applyMetadataFactory(prototype) {
        const classPrototype = prototype;
        do {
            if (!prototype.constructor) {
                return;
            }
            if (!prototype.constructor[plugin_constants_1.METADATA_FACTORY_NAME]) {
                continue;
            }
            const metadata = prototype.constructor[plugin_constants_1.METADATA_FACTORY_NAME]();
            const properties = Object.keys(metadata);
            properties.forEach((key) => {
                (0, api_property_decorator_1.createApiPropertyDecorator)(metadata[key], false)(classPrototype, key);
            });
        } while ((prototype = Reflect.getPrototypeOf(prototype)) &&
            prototype !== Object.prototype &&
            prototype);
    }
}
exports.ModelPropertiesAccessor = ModelPropertiesAccessor;

}, function(modId) { var map = {"../constants":1784796701945,"../decorators/api-property.decorator":1784796701965,"../plugin/plugin-constants":1784796701951}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701983, function(require, module, exports) {

var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaObjectFactory = void 0;
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const helpers_1 = require("../decorators/helpers");
const api_extra_models_explorer_1 = require("../explorers/api-extra-models.explorer");
const utils_1 = require("../utils");
const enum_utils_1 = require("../utils/enum.utils");
const is_body_parameter_util_1 = require("../utils/is-body-parameter.util");
const is_built_in_type_util_1 = require("../utils/is-built-in-type.util");
const is_date_ctor_util_1 = require("../utils/is-date-ctor.util");
class SchemaObjectFactory {
    constructor(modelPropertiesAccessor, swaggerTypesMapper) {
        this.modelPropertiesAccessor = modelPropertiesAccessor;
        this.swaggerTypesMapper = swaggerTypesMapper;
    }
    createFromModel(parameters, schemas) {
        const parameterObjects = parameters.map((param) => {
            if (this.isLazyTypeFunc(param.type)) {
                [param.type, param.isArray] = (0, helpers_1.getTypeIsArrayTuple)(param.type(), undefined);
            }
            if (!(0, is_body_parameter_util_1.isBodyParameter)(param) && param.enumName) {
                return this.createEnumParam(param, schemas);
            }
            if (this.isPrimitiveType(param.type)) {
                return param;
            }
            if (this.isArrayCtor(param.type)) {
                return this.mapArrayCtorParam(param);
            }
            if (!(0, is_body_parameter_util_1.isBodyParameter)(param)) {
                return this.createQueryOrParamSchema(param, schemas);
            }
            return this.getCustomType(param, schemas);
        });
        return (0, lodash_1.flatten)(parameterObjects);
    }
    getCustomType(param, schemas) {
        const modelName = this.exploreModelSchema(param.type, schemas);
        const name = param.name || modelName;
        const schema = Object.assign(Object.assign({}, (param.schema || {})), { $ref: (0, utils_1.getSchemaPath)(modelName) });
        const isArray = param.isArray;
        param = (0, lodash_1.omit)(param, 'isArray');
        if (isArray) {
            return Object.assign(Object.assign({}, param), { name, schema: {
                    type: 'array',
                    items: schema
                } });
        }
        return Object.assign(Object.assign({}, param), { name,
            schema });
    }
    createQueryOrParamSchema(param, schemas) {
        if ((0, is_date_ctor_util_1.isDateCtor)(param.type)) {
            return Object.assign(Object.assign({ format: 'date-time' }, param), { type: 'string' });
        }
        if (this.isBigInt(param.type)) {
            return Object.assign(Object.assign({ format: 'int64' }, param), { type: 'integer' });
        }
        if ((0, lodash_1.isFunction)(param.type)) {
            if (param.name) {
                return this.getCustomType(param, schemas);
            }
            const propertiesWithType = this.extractPropertiesFromType(param.type, schemas);
            if (!propertiesWithType) {
                return param;
            }
            return propertiesWithType.map((property) => {
                const keysToOmit = [
                    'isArray',
                    'enumName',
                    'enumSchema',
                    'selfRequired'
                ];
                const parameterObject = Object.assign(Object.assign({}, (0, lodash_1.omit)(property, keysToOmit)), { in: 'query', required: 'selfRequired' in property
                        ? property.selfRequired
                        : typeof property.required === 'boolean'
                            ? property.required
                            : true });
                const keysToMoveToSchema = [
                    ...this.swaggerTypesMapper.getSchemaOptionsKeys(),
                    'allOf'
                ];
                return keysToMoveToSchema.reduce((acc, key) => {
                    if (key in property) {
                        acc.schema = Object.assign(Object.assign({}, acc.schema), { [key]: property[key] });
                        delete acc[key];
                    }
                    return acc;
                }, parameterObject);
            });
        }
        if (this.isObjectLiteral(param.type)) {
            const schemaFromObjectLiteral = this.createFromObjectLiteral(param.name, param.type, schemas);
            if (param.isArray) {
                return Object.assign(Object.assign({}, param), { schema: {
                        type: 'array',
                        items: (0, lodash_1.omit)(schemaFromObjectLiteral, 'name')
                    }, selfRequired: param.required });
            }
            return Object.assign(Object.assign({}, param), { schema: {
                    type: schemaFromObjectLiteral.type,
                    properties: schemaFromObjectLiteral.properties,
                    required: schemaFromObjectLiteral.required
                }, selfRequired: param.required });
        }
        return param;
    }
    extractPropertiesFromType(type, schemas, pendingSchemasRefs = []) {
        const { prototype } = type;
        if (!prototype) {
            return;
        }
        const extraModels = (0, api_extra_models_explorer_1.exploreGlobalApiExtraModelsMetadata)(type);
        extraModels.forEach((item) => this.exploreModelSchema(item, schemas, pendingSchemasRefs));
        this.modelPropertiesAccessor.applyMetadataFactory(prototype);
        const modelProperties = this.modelPropertiesAccessor.getModelProperties(prototype);
        const propertiesWithType = modelProperties.map((key) => {
            const property = this.mergePropertyWithMetadata(key, prototype, schemas, pendingSchemasRefs);
            const schemaCombinators = ['oneOf', 'anyOf', 'allOf'];
            const declaredSchemaCombinator = schemaCombinators.find((combinator) => combinator in property);
            if (declaredSchemaCombinator) {
                const schemaObjectMetadata = property;
                if ((schemaObjectMetadata === null || schemaObjectMetadata === void 0 ? void 0 : schemaObjectMetadata.type) === 'array' ||
                    schemaObjectMetadata.isArray) {
                    schemaObjectMetadata.items = {};
                    schemaObjectMetadata.items[declaredSchemaCombinator] =
                        property[declaredSchemaCombinator];
                    delete property[declaredSchemaCombinator];
                }
                else {
                    delete schemaObjectMetadata.type;
                }
            }
            return property;
        });
        return propertiesWithType;
    }
    exploreModelSchema(type, schemas, pendingSchemasRefs = []) {
        if (this.isLazyTypeFunc(type)) {
            type = type();
        }
        const propertiesWithType = this.extractPropertiesFromType(type, schemas, pendingSchemasRefs);
        if (!propertiesWithType) {
            return '';
        }
        const extensionProperties = Reflect.getMetadata(constants_1.DECORATORS.API_EXTENSION, type) || {};
        const { schemaName, schemaProperties } = this.getSchemaMetadata(type);
        const typeDefinition = Object.assign(Object.assign({ type: 'object', properties: (0, lodash_1.mapValues)((0, lodash_1.keyBy)(propertiesWithType, 'name'), (property) => {
                const keysToOmit = [
                    'name',
                    'isArray',
                    'enumName',
                    'enumSchema',
                    'selfRequired'
                ];
                if ('required' in property && Array.isArray(property.required)) {
                    return (0, lodash_1.omit)(property, keysToOmit);
                }
                return (0, lodash_1.omit)(property, [...keysToOmit, 'required']);
            }) }, extensionProperties), schemaProperties);
        const typeDefinitionRequiredFields = propertiesWithType
            .filter((property) => 'selfRequired' in property
            ? property.selfRequired != false
            : property.required != false && !Array.isArray(property.required))
            .map((property) => property.name);
        if (typeDefinitionRequiredFields.length > 0) {
            typeDefinition['required'] = typeDefinitionRequiredFields;
        }
        if (schemas[schemaName] && !(0, lodash_1.isEqual)(schemas[schemaName], typeDefinition)) {
            common_1.Logger.error(`Duplicate DTO detected: "${schemaName}" is defined multiple times with different schemas.\n` +
                `Consider using unique class names or applying @ApiExtraModels() decorator with custom schema names.\n` +
                `Note: This will throw an error in the next major version.`);
        }
        schemas[schemaName] = typeDefinition;
        return schemaName;
    }
    getSchemaMetadata(type) {
        var _a, _b;
        const schemas = (_a = Reflect.getOwnMetadata(constants_1.DECORATORS.API_SCHEMA, type)) !== null && _a !== void 0 ? _a : [];
        const _c = (_b = schemas[schemas.length - 1]) !== null && _b !== void 0 ? _b : {}, { name } = _c, schemaProperties = __rest(_c, ["name"]);
        return { schemaName: name !== null && name !== void 0 ? name : type.name, schemaProperties };
    }
    mergePropertyWithMetadata(key, prototype, schemas, pendingSchemaRefs, metadata) {
        if (!metadata) {
            metadata =
                (0, lodash_1.omit)(Reflect.getMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES, prototype, key), 'link') || {};
        }
        if (this.isLazyTypeFunc(metadata.type)) {
            metadata.type = metadata.type();
            [metadata.type, metadata.isArray] = (0, helpers_1.getTypeIsArrayTuple)(metadata.type, metadata.isArray);
        }
        if (Array.isArray(metadata.type)) {
            return this.createFromNestedArray(key, metadata, schemas, pendingSchemaRefs);
        }
        return this.createSchemaMetadata(key, metadata, schemas, pendingSchemaRefs);
    }
    createEnumParam(param, schemas) {
        var _a, _b, _c, _d, _e;
        const enumName = param.enumName;
        const $ref = (0, utils_1.getSchemaPath)(enumName);
        if (!(enumName in schemas)) {
            const _enum = param.enum
                ? param.enum
                : param.schema
                    ? param.schema['items']
                        ? param.schema['items']['enum']
                        : param.schema['enum']
                    : param.isArray && param.items
                        ? param.items.enum
                        : undefined;
            schemas[enumName] = Object.assign(Object.assign({ type: (_d = (param.isArray
                    ? (_b = (_a = param.schema) === null || _a === void 0 ? void 0 : _a['items']) === null || _b === void 0 ? void 0 : _b['type']
                    : (_c = param.schema) === null || _c === void 0 ? void 0 : _c['type'])) !== null && _d !== void 0 ? _d : 'string', enum: _enum }, param.enumSchema), (param['x-enumNames'] ? { 'x-enumNames': param['x-enumNames'] } : {}));
        }
        else {
            if (param.enumSchema) {
                schemas[enumName] = Object.assign(Object.assign({}, schemas[enumName]), param.enumSchema);
            }
        }
        param.schema =
            param.isArray || ((_e = param.schema) === null || _e === void 0 ? void 0 : _e['items'])
                ? { type: 'array', items: { $ref } }
                : { $ref };
        return (0, lodash_1.omit)(param, [
            'isArray',
            'items',
            'enumName',
            'enum',
            'x-enumNames',
            'enumSchema'
        ]);
    }
    createEnumSchemaType(key, metadata, schemas) {
        var _a, _b, _c;
        if (!('enumName' in metadata) || !metadata.enumName) {
            return Object.assign(Object.assign({}, metadata), { name: metadata.name || key });
        }
        const enumName = metadata.enumName;
        const $ref = (0, utils_1.getSchemaPath)(enumName);
        const enumType = (_a = (metadata.isArray ? metadata.items['type'] : metadata.type)) !== null && _a !== void 0 ? _a : 'string';
        if (!schemas[enumName]) {
            schemas[enumName] = Object.assign(Object.assign({ type: enumType }, metadata.enumSchema), { enum: metadata.isArray && metadata.items
                    ? metadata.items['enum']
                    : metadata.enum, description: (_b = metadata.description) !== null && _b !== void 0 ? _b : undefined, 'x-enumNames': (_c = metadata['x-enumNames']) !== null && _c !== void 0 ? _c : undefined });
        }
        else {
            if (metadata.enumSchema) {
                schemas[enumName] = Object.assign(Object.assign({}, schemas[enumName]), metadata.enumSchema);
            }
            if (metadata['x-enumNames']) {
                schemas[enumName]['x-enumNames'] = metadata['x-enumNames'];
            }
        }
        const _schemaObject = Object.assign(Object.assign({}, metadata), { name: metadata.name || key, type: metadata.isArray ? 'array' : 'string' });
        const refHost = metadata.isArray
            ? { items: { $ref } }
            : { allOf: [{ $ref }] };
        const paramObject = Object.assign(Object.assign({}, _schemaObject), refHost);
        const pathsToOmit = ['enum', 'enumName', 'enumSchema', 'x-enumNames'];
        if (!metadata.isArray) {
            pathsToOmit.push('type');
        }
        return (0, lodash_1.omit)(paramObject, pathsToOmit);
    }
    createNotBuiltInTypeReference(key, metadata, trueMetadataType, schemas, pendingSchemaRefs) {
        if ((0, shared_utils_1.isUndefined)(trueMetadataType)) {
            throw new Error(`A circular dependency has been detected (property key: "${key}"). Please, make sure that each side of a bidirectional relationships are using lazy resolvers ("type: () => ClassType").`);
        }
        let { schemaName: schemaObjectName } = this.getSchemaMetadata(trueMetadataType);
        if (!(schemaObjectName in schemas) &&
            !pendingSchemaRefs.includes(schemaObjectName)) {
            schemaObjectName = this.exploreModelSchema(trueMetadataType, schemas, [...pendingSchemaRefs, schemaObjectName]);
        }
        const $ref = (0, utils_1.getSchemaPath)(schemaObjectName);
        if (metadata.isArray) {
            return this.transformToArraySchemaProperty(metadata, key, { $ref });
        }
        const keysToRemove = ['type', 'isArray', 'required', 'name'];
        const validMetadataObject = (0, lodash_1.omit)(metadata, keysToRemove);
        const extraMetadataKeys = Object.keys(validMetadataObject);
        if (extraMetadataKeys.length > 0) {
            return Object.assign(Object.assign({ name: metadata.name || key, required: metadata.required }, validMetadataObject), { allOf: [{ $ref }] });
        }
        return {
            name: metadata.name || key,
            required: metadata.required,
            $ref
        };
    }
    transformToArraySchemaProperty(metadata, key, type) {
        const keysToRemove = ['type', 'enum'];
        const [movedProperties, keysToMove] = this.extractPropertyModifiers(metadata);
        const schemaHost = Object.assign(Object.assign({}, (0, lodash_1.omit)(metadata, [...keysToRemove, ...keysToMove])), { name: metadata.name || key, type: 'array', items: (0, lodash_1.isString)(type)
                ? Object.assign({ type }, movedProperties) : Object.assign(Object.assign({}, type), movedProperties) });
        schemaHost.items = (0, lodash_1.omitBy)(schemaHost.items, shared_utils_1.isUndefined);
        return schemaHost;
    }
    mapArrayCtorParam(param) {
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(param, 'type')), { schema: {
                type: 'array',
                items: {
                    type: 'string'
                }
            } });
    }
    createFromObjectLiteral(key, literalObj, schemas) {
        const objLiteralKeys = Object.keys(literalObj);
        const properties = {};
        const required = [];
        objLiteralKeys.forEach((key) => {
            const propertyCompilerMetadata = literalObj[key];
            if ((0, enum_utils_1.isEnumArray)(propertyCompilerMetadata)) {
                propertyCompilerMetadata.type = 'array';
                const enumValues = (0, enum_utils_1.getEnumValues)(propertyCompilerMetadata.enum);
                propertyCompilerMetadata.items = {
                    type: (0, enum_utils_1.getEnumType)(enumValues),
                    enum: enumValues
                };
                delete propertyCompilerMetadata.enum;
            }
            else if (propertyCompilerMetadata.enum) {
                const enumValues = (0, enum_utils_1.getEnumValues)(propertyCompilerMetadata.enum);
                propertyCompilerMetadata.enum = enumValues;
                propertyCompilerMetadata.type = (0, enum_utils_1.getEnumType)(enumValues);
            }
            const propertyMetadata = this.mergePropertyWithMetadata(key, Object, schemas, [], propertyCompilerMetadata);
            if ('required' in propertyMetadata && propertyMetadata.required) {
                required.push(key);
            }
            const keysToRemove = ['isArray', 'name', 'required'];
            const validMetadataObject = (0, lodash_1.omit)(propertyMetadata, keysToRemove);
            properties[key] = validMetadataObject;
        });
        const schema = {
            name: key,
            type: 'object',
            properties,
            required
        };
        return schema;
    }
    createFromNestedArray(key, metadata, schemas, pendingSchemaRefs) {
        const recurse = (type) => {
            if (!Array.isArray(type)) {
                const schemaMetadata = this.createSchemaMetadata(key, metadata, schemas, pendingSchemaRefs, type);
                return (0, lodash_1.omit)(schemaMetadata, ['isArray', 'name']);
            }
            return {
                name: key,
                type: 'array',
                items: recurse(type[0])
            };
        };
        return recurse(metadata.type);
    }
    createSchemaMetadata(key, metadata, schemas, pendingSchemaRefs, nestedArrayType) {
        const typeRef = nestedArrayType || metadata.type;
        if (this.isObjectLiteral(typeRef)) {
            const schemaFromObjectLiteral = this.createFromObjectLiteral(key, typeRef, schemas);
            if (metadata.isArray) {
                return {
                    name: schemaFromObjectLiteral.name,
                    type: 'array',
                    items: (0, lodash_1.omit)(schemaFromObjectLiteral, 'name'),
                    selfRequired: metadata.required
                };
            }
            return Object.assign(Object.assign({}, schemaFromObjectLiteral), { selfRequired: metadata.required });
        }
        if ((0, lodash_1.isString)(typeRef)) {
            if ((0, enum_utils_1.isEnumMetadata)(metadata)) {
                return this.createEnumSchemaType(key, metadata, schemas);
            }
            if (metadata.isArray) {
                return this.transformToArraySchemaProperty(metadata, key, typeRef);
            }
            return Object.assign(Object.assign({}, metadata), { name: metadata.name || key });
        }
        if ((0, is_date_ctor_util_1.isDateCtor)(typeRef)) {
            if (metadata.isArray) {
                return this.transformToArraySchemaProperty(metadata, key, {
                    format: metadata.format || 'date-time',
                    type: 'string'
                });
            }
            return Object.assign(Object.assign({ format: 'date-time' }, metadata), { type: 'string', name: metadata.name || key });
        }
        if (this.isBigInt(typeRef)) {
            return Object.assign(Object.assign({ format: 'int64' }, metadata), { type: 'integer', name: metadata.name || key });
        }
        if (!(0, is_built_in_type_util_1.isBuiltInType)(typeRef)) {
            return this.createNotBuiltInTypeReference(key, metadata, typeRef, schemas, pendingSchemaRefs);
        }
        const typeName = this.getTypeName(typeRef);
        const itemType = this.swaggerTypesMapper.mapTypeToOpenAPIType(typeName);
        if (metadata.isArray) {
            return this.transformToArraySchemaProperty(metadata, key, {
                type: itemType
            });
        }
        else if (itemType === 'array') {
            const defaultOnArray = 'string';
            const hasSchemaCombinator = ['oneOf', 'anyOf', 'allOf'].some((combinator) => combinator in metadata);
            if (hasSchemaCombinator) {
                return Object.assign(Object.assign({}, metadata), { type: undefined, name: metadata.name || key });
            }
            return this.transformToArraySchemaProperty(metadata, key, {
                type: defaultOnArray
            });
        }
        return Object.assign(Object.assign({}, metadata), { name: metadata.name || key, type: itemType });
    }
    isArrayCtor(type) {
        return type === Array;
    }
    isPrimitiveType(type) {
        return ((0, lodash_1.isFunction)(type) &&
            [String, Boolean, Number].some((item) => item === type));
    }
    isLazyTypeFunc(type) {
        return (0, lodash_1.isFunction)(type) && type.name == 'type';
    }
    getTypeName(type) {
        return type && (0, lodash_1.isFunction)(type) ? type.name : type;
    }
    isObjectLiteral(obj) {
        if (typeof obj !== 'object' || !obj) {
            return false;
        }
        const hasOwnProp = Object.prototype.hasOwnProperty;
        let objPrototype = obj;
        while (Object.getPrototypeOf((objPrototype = Object.getPrototypeOf(objPrototype))) !== null)
            ;
        for (const prop in obj) {
            if (!hasOwnProp.call(obj, prop) && !hasOwnProp.call(objPrototype, prop)) {
                return false;
            }
        }
        return Object.getPrototypeOf(obj) === objPrototype;
    }
    isBigInt(type) {
        return type === BigInt;
    }
    extractPropertyModifiers(metadata) {
        const modifierKeys = [
            'format',
            'maximum',
            'maxLength',
            'minimum',
            'minLength',
            'pattern'
        ];
        return [(0, lodash_1.pick)(metadata, modifierKeys), modifierKeys];
    }
}
exports.SchemaObjectFactory = SchemaObjectFactory;

}, function(modId) { var map = {"../constants":1784796701945,"../decorators/helpers":1784796701950,"../explorers/api-extra-models.explorer":1784796701984,"../utils":1784796701985,"../utils/enum.utils":1784796701949,"../utils/is-body-parameter.util":1784796701987,"../utils/is-built-in-type.util":1784796701988,"../utils/is-date-ctor.util":1784796701990}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701984, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreApiExtraModelsMetadata = exports.exploreGlobalApiExtraModelsMetadata = void 0;
const constants_1 = require("../constants");
const exploreGlobalApiExtraModelsMetadata = (metatype) => {
    const extraModels = Reflect.getMetadata(constants_1.DECORATORS.API_EXTRA_MODELS, metatype);
    return extraModels || [];
};
exports.exploreGlobalApiExtraModelsMetadata = exploreGlobalApiExtraModelsMetadata;
const exploreApiExtraModelsMetadata = (instance, prototype, method) => Reflect.getMetadata(constants_1.DECORATORS.API_EXTRA_MODELS, method) || [];
exports.exploreApiExtraModelsMetadata = exploreApiExtraModelsMetadata;

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701985, function(require, module, exports) {

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
__exportStar(require("./get-schema-path.util"), exports);

}, function(modId) { var map = {"./get-schema-path.util":1784796701986}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701986, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaPath = getSchemaPath;
exports.refs = refs;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const constants_1 = require("../constants");
function getSchemaPath(model) {
    const modelName = (0, shared_utils_1.isString)(model) ? model : getSchemaNameByClass(model);
    return `#/components/schemas/${modelName}`;
}
function getSchemaNameByClass(target) {
    var _a;
    if (!target || typeof target !== 'function') {
        return '';
    }
    const customSchema = Reflect.getOwnMetadata(constants_1.DECORATORS.API_SCHEMA, target);
    if (!customSchema || customSchema.length === 0) {
        return target.name;
    }
    return (_a = customSchema[customSchema.length - 1].name) !== null && _a !== void 0 ? _a : target.name;
}
function refs(...models) {
    return models.map((item) => ({
        $ref: getSchemaPath(item.name)
    }));
}

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701987, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isBodyParameter = isBodyParameter;
function isBodyParameter(param) {
    return param.in === 'body';
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701988, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isBuiltInType = isBuiltInType;
const lodash_1 = require("lodash");
const constants_1 = require("../services/constants");
function isBuiltInType(type) {
    return (0, lodash_1.isFunction)(type) && constants_1.BUILT_IN_TYPES.some((item) => item === type);
}

}, function(modId) { var map = {"../services/constants":1784796701989}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701989, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILT_IN_TYPES = void 0;
exports.BUILT_IN_TYPES = [String, Boolean, Number, Object, Array];

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701990, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.isDateCtor = isDateCtor;
function isDateCtor(type) {
    return type === Date;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701991, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerTypesMapper = void 0;
const lodash_1 = require("lodash");
class SwaggerTypesMapper {
    constructor() {
        this.keysToRemove = [
            'isArray',
            'enum',
            'enumName',
            'enumSchema',
            '$ref',
            'selfRequired',
            ...this.getSchemaOptionsKeys()
        ];
    }
    mapParamTypes(parameters) {
        return parameters.map((param) => {
            if (this.hasSchemaDefinition(param) ||
                this.hasRawContentDefinition(param)) {
                if (Array.isArray(param.required) && 'schema' in param) {
                    param.schema.required = param.required;
                    delete param.required;
                }
                if ('selfRequired' in param) {
                    param.required = param.selfRequired;
                }
                return this.omitParamKeys(param);
            }
            const { type } = param;
            const typeName = type && (0, lodash_1.isFunction)(type)
                ? this.mapTypeToOpenAPIType(type.name)
                : this.mapTypeToOpenAPIType(type);
            const paramWithTypeMetadata = (0, lodash_1.omitBy)(Object.assign(Object.assign({}, param), { type: typeName }), lodash_1.isUndefined);
            if (this.isEnumArrayType(paramWithTypeMetadata)) {
                return this.mapEnumArrayType(paramWithTypeMetadata, this.keysToRemove);
            }
            else if (paramWithTypeMetadata.isArray) {
                return this.mapArrayType(paramWithTypeMetadata, this.keysToRemove);
            }
            return Object.assign(Object.assign({}, (0, lodash_1.omit)(param, this.keysToRemove)), { schema: (0, lodash_1.omitBy)(Object.assign(Object.assign(Object.assign({}, this.getSchemaOptions(param)), (param.schema || {})), { enum: paramWithTypeMetadata.enum, type: paramWithTypeMetadata.type, $ref: paramWithTypeMetadata.$ref }), lodash_1.isUndefined) });
        });
    }
    mapTypeToOpenAPIType(type) {
        if (!(type && type.charAt)) {
            return;
        }
        return type.charAt(0).toLowerCase() + type.slice(1);
    }
    mapEnumArrayType(param, keysToRemove) {
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(param, keysToRemove)), { schema: Object.assign(Object.assign({}, this.getSchemaOptions(param)), { type: 'array', items: param.items }) });
    }
    mapArrayType(param, keysToRemove) {
        const itemsModifierKeys = ['format', 'maximum', 'minimum', 'pattern'];
        const items = param.items ||
            (0, lodash_1.omitBy)(Object.assign(Object.assign({}, (param.schema || {})), { enum: param.enum, type: this.mapTypeToOpenAPIType(param.type) }), lodash_1.isUndefined);
        const modifierProperties = (0, lodash_1.pick)(param, itemsModifierKeys);
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(param, keysToRemove)), { schema: Object.assign(Object.assign({}, (0, lodash_1.omit)(this.getSchemaOptions(param), [...itemsModifierKeys])), { type: 'array', items: (0, lodash_1.isString)(items.type)
                    ? Object.assign({ type: items.type }, modifierProperties) : Object.assign(Object.assign({}, items.type), modifierProperties) }) });
    }
    getSchemaOptionsKeys() {
        return [
            'properties',
            'patternProperties',
            'additionalProperties',
            'minimum',
            'maximum',
            'maxProperties',
            'minItems',
            'minProperties',
            'maxItems',
            'minLength',
            'maxLength',
            'exclusiveMaximum',
            'exclusiveMinimum',
            'uniqueItems',
            'title',
            'format',
            'pattern',
            'nullable',
            'default',
            'example',
            'oneOf',
            'anyOf',
            'type',
            'items'
        ];
    }
    getSchemaOptions(param) {
        const schemaKeys = this.getSchemaOptionsKeys();
        const optionsObject = schemaKeys.reduce((acc, key) => (Object.assign(Object.assign({}, acc), { [key]: param[key] })), {});
        return (0, lodash_1.omitBy)(optionsObject, lodash_1.isUndefined);
    }
    isEnumArrayType(param) {
        return param.isArray && param.items && param.items.enum;
    }
    hasSchemaDefinition(param) {
        return !!param.schema;
    }
    hasRawContentDefinition(param) {
        return 'content' in param;
    }
    omitParamKeys(param) {
        return (0, lodash_1.omit)(param, this.keysToRemove);
    }
}
exports.SwaggerTypesMapper = SwaggerTypesMapper;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701992, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerExplorer = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/common/constants");
const interfaces_1 = require("@nestjs/common/interfaces");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const core_1 = require("@nestjs/core");
const legacy_route_converter_1 = require("@nestjs/core/router/legacy-route-converter");
const route_path_factory_1 = require("@nestjs/core/router/route-path-factory");
const lodash_1 = require("lodash");
const path_to_regexp_1 = require("path-to-regexp");
const constants_2 = require("./constants");
const api_callbacks_explorer_1 = require("./explorers/api-callbacks.explorer");
const api_exclude_controller_explorer_1 = require("./explorers/api-exclude-controller.explorer");
const api_exclude_endpoint_explorer_1 = require("./explorers/api-exclude-endpoint.explorer");
const api_extra_models_explorer_1 = require("./explorers/api-extra-models.explorer");
const api_headers_explorer_1 = require("./explorers/api-headers.explorer");
const api_operation_explorer_1 = require("./explorers/api-operation.explorer");
const api_parameters_explorer_1 = require("./explorers/api-parameters.explorer");
const api_response_explorer_1 = require("./explorers/api-response.explorer");
const api_security_explorer_1 = require("./explorers/api-security.explorer");
const api_use_tags_explorer_1 = require("./explorers/api-use-tags.explorer");
const mimetype_content_wrapper_1 = require("./services/mimetype-content-wrapper");
const is_body_parameter_util_1 = require("./utils/is-body-parameter.util");
const merge_and_uniq_util_1 = require("./utils/merge-and-uniq.util");
class SwaggerExplorer {
    constructor(schemaObjectFactory, options = {}) {
        this.schemaObjectFactory = schemaObjectFactory;
        this.options = options;
        this.mimetypeContentWrapper = new mimetype_content_wrapper_1.MimetypeContentWrapper();
        this.metadataScanner = new core_1.MetadataScanner();
        this.schemas = {};
        this.operationIdFactory = (controllerKey, methodKey, version) => version
            ? controllerKey
                ? `${controllerKey}_${methodKey}_${version}`
                : `${methodKey}_${version}`
            : controllerKey
                ? `${controllerKey}_${methodKey}`
                : methodKey;
        this.linkNameFactory = (controllerKey, methodKey, fieldKey) => controllerKey
            ? `${controllerKey}_${methodKey}_from_${fieldKey}`
            : `${methodKey}_from_${fieldKey}`;
    }
    exploreController(wrapper, applicationConfig, options) {
        const { operationIdFactory, linkNameFactory } = options;
        this.routePathFactory = new route_path_factory_1.RoutePathFactory(applicationConfig);
        if (operationIdFactory) {
            this.operationIdFactory = operationIdFactory;
        }
        if (linkNameFactory) {
            this.linkNameFactory = linkNameFactory;
        }
        const { instance, metatype } = wrapper;
        const prototype = Object.getPrototypeOf(instance);
        const documentResolvers = {
            root: [
                this.exploreRoutePathAndMethod,
                api_operation_explorer_1.exploreApiOperationMetadata,
                api_parameters_explorer_1.exploreApiParametersMetadata.bind(null, this.schemas)
            ],
            security: [api_security_explorer_1.exploreApiSecurityMetadata],
            tags: [api_use_tags_explorer_1.exploreApiTagsMetadata],
            callbacks: [api_callbacks_explorer_1.exploreApiCallbacksMetadata],
            responses: [
                api_response_explorer_1.exploreApiResponseMetadata.bind(null, this.schemas, {
                    operationId: this.operationIdFactory,
                    linkName: this.linkNameFactory
                })
            ]
        };
        return this.generateDenormalizedDocument(metatype, prototype, instance, documentResolvers, applicationConfig, options);
    }
    getSchemas() {
        return this.schemas;
    }
    generateDenormalizedDocument(metatype, prototype, instance, documentResolvers, applicationConfig, options) {
        const self = this;
        const excludeController = (0, api_exclude_controller_explorer_1.exploreApiExcludeControllerMetadata)(metatype);
        if (excludeController) {
            return [];
        }
        const globalMetadata = this.exploreGlobalMetadata(metatype, {
            autoTagControllers: options.autoTagControllers
        });
        const ctrlExtraModels = (0, api_extra_models_explorer_1.exploreGlobalApiExtraModelsMetadata)(metatype);
        this.registerExtraModels(ctrlExtraModels);
        const denormalizedPaths = this.metadataScanner.scanFromPrototype(instance, prototype, (name) => {
            const targetCallback = prototype[name];
            const excludeEndpoint = (0, api_exclude_endpoint_explorer_1.exploreApiExcludeEndpointMetadata)(instance, prototype, targetCallback);
            if (excludeEndpoint && excludeEndpoint.disable) {
                return;
            }
            const ctrlExtraModels = (0, api_extra_models_explorer_1.exploreApiExtraModelsMetadata)(instance, prototype, targetCallback);
            this.registerExtraModels(ctrlExtraModels);
            const methodMetadata = (0, lodash_1.mapValues)(documentResolvers, (explorers) => explorers.reduce((metadata, fn) => {
                const exploredMetadata = fn.call(self, instance, prototype, targetCallback, metatype, options.globalPrefix, options.modulePath, applicationConfig, options.autoTagControllers);
                if (!exploredMetadata) {
                    return metadata;
                }
                if (!(0, lodash_1.isArray)(exploredMetadata)) {
                    if (Array.isArray(metadata)) {
                        return metadata.map((item) => (Object.assign(Object.assign({}, item), exploredMetadata)));
                    }
                    return Object.assign(Object.assign({}, metadata), exploredMetadata);
                }
                return (0, lodash_1.isArray)(metadata)
                    ? [...metadata, ...exploredMetadata]
                    : exploredMetadata;
            }, {}));
            if (Array.isArray(methodMetadata.root)) {
                return methodMetadata.root.map((endpointMetadata) => {
                    endpointMetadata = (0, lodash_1.cloneDeep)(Object.assign(Object.assign({}, methodMetadata), { root: endpointMetadata }));
                    const mergedMethodMetadata = this.mergeMetadata(globalMetadata, (0, lodash_1.omitBy)(endpointMetadata, lodash_1.isEmpty));
                    return this.migrateOperationSchema(Object.assign(Object.assign({ responses: {} }, (0, lodash_1.omit)(globalMetadata, 'chunks')), mergedMethodMetadata), prototype, targetCallback);
                });
            }
            const mergedMethodMetadata = this.mergeMetadata(globalMetadata, (0, lodash_1.omitBy)(methodMetadata, lodash_1.isEmpty));
            return [
                this.migrateOperationSchema(Object.assign(Object.assign({ responses: {} }, (0, lodash_1.omit)(globalMetadata, 'chunks')), mergedMethodMetadata), prototype, targetCallback)
            ];
        });
        return (0, lodash_1.flatten)(denormalizedPaths).filter((path) => { var _a; return (_a = path.root) === null || _a === void 0 ? void 0 : _a.path; });
    }
    exploreGlobalMetadata(metatype, options) {
        const globalExplorers = [
            (0, api_use_tags_explorer_1.exploreGlobalApiTagsMetadata)(options.autoTagControllers),
            api_security_explorer_1.exploreGlobalApiSecurityMetadata,
            api_response_explorer_1.exploreGlobalApiResponseMetadata.bind(null, this.schemas),
            api_headers_explorer_1.exploreGlobalApiHeaderMetadata
        ];
        const globalMetadata = globalExplorers
            .map((explorer) => explorer.call(explorer, metatype))
            .filter((val) => !(0, shared_utils_1.isUndefined)(val))
            .reduce((curr, next) => {
            if (next.depth) {
                return Object.assign(Object.assign({}, curr), { chunks: (curr.chunks || []).concat(next) });
            }
            return Object.assign(Object.assign({}, curr), next);
        }, {});
        return globalMetadata;
    }
    exploreRoutePathAndMethod(instance, prototype, method, metatype, globalPrefix, modulePath, applicationConfig) {
        const methodPath = Reflect.getMetadata(constants_1.PATH_METADATA, method);
        if ((0, shared_utils_1.isUndefined)(methodPath)) {
            return undefined;
        }
        const requestMethod = Reflect.getMetadata(constants_1.METHOD_METADATA, method);
        const methodVersion = Reflect.getMetadata(constants_1.VERSION_METADATA, method);
        const versioningOptions = applicationConfig.getVersioning();
        const controllerVersion = this.getVersionMetadata(metatype, versioningOptions);
        const versionOrVersions = methodVersion !== null && methodVersion !== void 0 ? methodVersion : controllerVersion;
        const versions = this.getRoutePathVersions(versionOrVersions, versioningOptions);
        const allRoutePaths = this.routePathFactory.create({
            methodPath,
            methodVersion,
            modulePath,
            globalPrefix,
            controllerVersion,
            ctrlPath: this.reflectControllerPath(metatype),
            versioningOptions: applicationConfig.getVersioning()
        }, requestMethod);
        return (0, lodash_1.flatten)(allRoutePaths.map((routePath, index) => {
            const fullPath = this.validateRoutePath(routePath);
            const apiExtension = Reflect.getMetadata(constants_2.DECORATORS.API_EXTENSION, method);
            if (requestMethod === common_1.RequestMethod.ALL) {
                const validMethods = [
                    'get',
                    'post',
                    'put',
                    'delete',
                    'patch',
                    'options',
                    'head',
                    'search'
                ];
                return validMethods.map((requestMethod) => (Object.assign({ method: requestMethod, path: fullPath === '' ? '/' : fullPath, operationId: `${this.getOperationId(instance, method.name)}_${requestMethod.toLowerCase()}` }, apiExtension)));
            }
            const pathVersion = versions.find((v) => fullPath.includes(`/${v}/`) || fullPath.endsWith(`/${v}`));
            const isAlias = allRoutePaths.length > 1 && allRoutePaths.length !== versions.length;
            const methodKey = isAlias ? `${method.name}[${index}]` : method.name;
            return Object.assign({ method: common_1.RequestMethod[requestMethod].toLowerCase(), path: fullPath === '' ? '/' : fullPath, operationId: this.getOperationId(instance, methodKey, pathVersion) }, apiExtension);
        }));
    }
    getOperationId(instance, methodKey, version) {
        var _a;
        return this.operationIdFactory(((_a = instance.constructor) === null || _a === void 0 ? void 0 : _a.name) || '', methodKey, version);
    }
    getRoutePathVersions(versionValue, versioningOptions) {
        let versions = [];
        if (!versionValue || (versioningOptions === null || versioningOptions === void 0 ? void 0 : versioningOptions.type) !== common_1.VersioningType.URI) {
            return versions;
        }
        if (Array.isArray(versionValue)) {
            versions = versionValue.filter((v) => v !== interfaces_1.VERSION_NEUTRAL);
        }
        else if (versionValue !== interfaces_1.VERSION_NEUTRAL) {
            versions = [versionValue];
        }
        const prefix = this.routePathFactory.getVersionPrefix(versioningOptions);
        versions = versions.map((v) => `${prefix}${v}`);
        return versions;
    }
    reflectControllerPath(metatype) {
        return Reflect.getMetadata(constants_1.PATH_METADATA, metatype);
    }
    validateRoutePath(path) {
        if ((0, shared_utils_1.isUndefined)(path)) {
            return '';
        }
        if (Array.isArray(path)) {
            path = (0, lodash_1.head)(path);
        }
        let pathWithParams = '';
        try {
            let normalizedPath = legacy_route_converter_1.LegacyRouteConverter.tryConvert(path, {
                logs: this.options.httpAdapterType !== 'fastify'
            });
            normalizedPath = normalizedPath.replace(/::/g, '\\:');
            normalizedPath = normalizedPath.replace(/\[:\]/g, '\\:');
            normalizedPath = normalizedPath.replace(/\(\^([^)]+)\)/g, '');
            const { tokens } = (0, path_to_regexp_1.parse)(normalizedPath);
            for (const item of tokens) {
                if (item.type === 'text') {
                    pathWithParams += item.value;
                }
                else if (item.type === 'param') {
                    pathWithParams += `{${item.name}}`;
                }
                else if (item.type === 'wildcard') {
                    pathWithParams += `{${item.name}}`;
                }
                else if (item.type === 'group') {
                    pathWithParams += item.tokens.reduce((acc, item) => acc +
                        (item.type === 'text'
                            ? item.value
                            : `{${item.name}}`), '');
                }
            }
        }
        catch (err) {
            if (err instanceof TypeError) {
                legacy_route_converter_1.LegacyRouteConverter.printError(path);
            }
            throw err;
        }
        return pathWithParams === '/' ? '' : (0, shared_utils_1.addLeadingSlash)(pathWithParams);
    }
    mergeMetadata(globalMetadata, methodMetadata) {
        if (methodMetadata.root && !methodMetadata.root.parameters) {
            methodMetadata.root.parameters = [];
        }
        const deepMerge = (metadata) => (value, key) => {
            if (!metadata[key]) {
                return value;
            }
            const globalValue = metadata[key];
            if (metadata.depth) {
                return this.deepMergeMetadata(globalValue, value, metadata.depth);
            }
            return this.mergeValues(globalValue, value);
        };
        if (globalMetadata.chunks) {
            const { chunks } = globalMetadata;
            chunks.forEach((chunk) => {
                methodMetadata = (0, lodash_1.mapValues)(methodMetadata, deepMerge(chunk));
            });
        }
        return (0, lodash_1.mapValues)(methodMetadata, deepMerge(globalMetadata));
    }
    deepMergeMetadata(globalValue, methodValue, maxDepth, currentDepthLevel = 0) {
        if (currentDepthLevel === maxDepth) {
            return this.mergeValues(globalValue, methodValue);
        }
        return (0, lodash_1.mapValues)(methodValue, (value, key) => {
            if (key in globalValue) {
                return this.deepMergeMetadata(globalValue[key], methodValue[key], maxDepth, currentDepthLevel + 1);
            }
            return value;
        });
    }
    mergeValues(globalValue, methodValue) {
        if (!(0, lodash_1.isArray)(globalValue)) {
            return Object.assign(Object.assign({}, globalValue), methodValue);
        }
        return [...globalValue, ...methodValue];
    }
    migrateOperationSchema(document, prototype, method) {
        const parametersObject = (0, lodash_1.get)(document, 'root.parameters');
        const requestBodyIndex = (parametersObject || []).findIndex(is_body_parameter_util_1.isBodyParameter);
        if (requestBodyIndex < 0) {
            return document;
        }
        const requestBody = parametersObject[requestBodyIndex];
        parametersObject.splice(requestBodyIndex, 1);
        const classConsumes = Reflect.getMetadata(constants_2.DECORATORS.API_CONSUMES, prototype);
        const methodConsumes = Reflect.getMetadata(constants_2.DECORATORS.API_CONSUMES, method);
        let consumes = (0, merge_and_uniq_util_1.mergeAndUniq)(classConsumes, methodConsumes);
        consumes = (0, lodash_1.isEmpty)(consumes) ? ['application/json'] : consumes;
        const keysToRemove = ['schema', 'in', 'name', 'examples'];
        document.root.requestBody = Object.assign(Object.assign({}, (0, lodash_1.omit)(requestBody, keysToRemove)), this.mimetypeContentWrapper.wrap(consumes, (0, lodash_1.pick)(requestBody, ['schema', 'examples'])));
        return document;
    }
    registerExtraModels(extraModels) {
        extraModels.forEach((item) => this.schemaObjectFactory.exploreModelSchema(item, this.schemas));
    }
    getVersionMetadata(metatype, versioningOptions) {
        var _a;
        if ((versioningOptions === null || versioningOptions === void 0 ? void 0 : versioningOptions.type) === common_1.VersioningType.URI) {
            return ((_a = Reflect.getMetadata(constants_1.VERSION_METADATA, metatype)) !== null && _a !== void 0 ? _a : versioningOptions.defaultVersion);
        }
    }
}
exports.SwaggerExplorer = SwaggerExplorer;

}, function(modId) { var map = {"./constants":1784796701945,"./explorers/api-callbacks.explorer":1784796701993,"./explorers/api-exclude-controller.explorer":1784796701994,"./explorers/api-exclude-endpoint.explorer":1784796701995,"./explorers/api-extra-models.explorer":1784796701984,"./explorers/api-headers.explorer":1784796701996,"./explorers/api-operation.explorer":1784796701997,"./explorers/api-parameters.explorer":1784796701998,"./explorers/api-response.explorer":1784796702002,"./explorers/api-security.explorer":1784796702008,"./explorers/api-use-tags.explorer":1784796702009,"./services/mimetype-content-wrapper":1784796702004,"./utils/is-body-parameter.util":1784796701987,"./utils/merge-and-uniq.util":1784796702007}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701993, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreApiCallbacksMetadata = void 0;
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const exploreApiCallbacksMetadata = (instance, prototype, method) => {
    const callbacksData = Reflect.getMetadata(constants_1.DECORATORS.API_CALLBACKS, method);
    if (!callbacksData)
        return callbacksData;
    return callbacksData.reduce((acc, callbackData) => {
        const { name: eventName, callbackUrl, method: callbackMethod, requestBody, expectedResponse } = callbackData;
        return Object.assign(Object.assign({}, acc), { [eventName]: {
                [callbackUrl]: {
                    [callbackMethod]: {
                        requestBody: {
                            required: true,
                            content: {
                                'application/json': {
                                    schema: {
                                        $ref: (0, utils_1.getSchemaPath)(requestBody.type)
                                    }
                                }
                            }
                        },
                        responses: {
                            [expectedResponse.status]: {
                                description: expectedResponse.description ||
                                    'Your server returns this code if it accepts the callback'
                            }
                        }
                    }
                }
            } });
    }, {});
};
exports.exploreApiCallbacksMetadata = exploreApiCallbacksMetadata;

}, function(modId) { var map = {"../constants":1784796701945,"../utils":1784796701985}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701994, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreApiExcludeControllerMetadata = void 0;
const constants_1 = require("../constants");
const exploreApiExcludeControllerMetadata = (metatype) => {
    var _a;
    return ((_a = Reflect.getMetadata(constants_1.DECORATORS.API_EXCLUDE_CONTROLLER, metatype)) === null || _a === void 0 ? void 0 : _a[0]) ===
        true;
};
exports.exploreApiExcludeControllerMetadata = exploreApiExcludeControllerMetadata;

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701995, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreApiExcludeEndpointMetadata = void 0;
const constants_1 = require("../constants");
const exploreApiExcludeEndpointMetadata = (instance, prototype, method) => Reflect.getMetadata(constants_1.DECORATORS.API_EXCLUDE_ENDPOINT, method);
exports.exploreApiExcludeEndpointMetadata = exploreApiExcludeEndpointMetadata;

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701996, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreGlobalApiHeaderMetadata = void 0;
const constants_1 = require("../constants");
const exploreGlobalApiHeaderMetadata = (metatype) => {
    const headers = Reflect.getMetadata(constants_1.DECORATORS.API_HEADERS, metatype);
    return headers ? { root: { parameters: headers }, depth: 1 } : undefined;
};
exports.exploreGlobalApiHeaderMetadata = exploreGlobalApiHeaderMetadata;

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701997, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreApiOperationMetadata = void 0;
const constants_1 = require("../constants");
const api_operation_decorator_1 = require("../decorators/api-operation.decorator");
const plugin_constants_1 = require("../plugin/plugin-constants");
const exploreApiOperationMetadata = (instance, prototype, method) => {
    applyMetadataFactory(prototype, instance);
    return Reflect.getMetadata(constants_1.DECORATORS.API_OPERATION, method);
};
exports.exploreApiOperationMetadata = exploreApiOperationMetadata;
function applyMetadataFactory(prototype, instance) {
    const classPrototype = prototype;
    do {
        if (!prototype.constructor) {
            return;
        }
        if (!prototype.constructor[plugin_constants_1.METADATA_FACTORY_NAME]) {
            continue;
        }
        const metadata = prototype.constructor[plugin_constants_1.METADATA_FACTORY_NAME]();
        const methodKeys = Object.keys(metadata).filter((key) => typeof instance[key] === 'function');
        methodKeys.forEach((key) => {
            const operationMeta = {};
            const { summary, deprecated, tags, description } = metadata[key];
            applyIfNotNil(operationMeta, 'summary', summary);
            applyIfNotNil(operationMeta, 'deprecated', deprecated);
            applyIfNotNil(operationMeta, 'tags', tags);
            applyIfNotNil(operationMeta, 'description', description);
            if (Object.keys(operationMeta).length === 0) {
                return;
            }
            (0, api_operation_decorator_1.ApiOperation)(operationMeta, { overrideExisting: false })(classPrototype, key, Object.getOwnPropertyDescriptor(classPrototype, key));
        });
    } while ((prototype = Reflect.getPrototypeOf(prototype)) &&
        prototype !== Object.prototype &&
        prototype);
}
function applyIfNotNil(target, key, value) {
    if (value !== undefined && value !== null) {
        target[key] = value;
    }
}

}, function(modId) { var map = {"../constants":1784796701945,"../decorators/api-operation.decorator":1784796701962,"../plugin/plugin-constants":1784796701951}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701998, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreApiParametersMetadata = void 0;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const model_properties_accessor_1 = require("../services/model-properties-accessor");
const parameter_metadata_accessor_1 = require("../services/parameter-metadata-accessor");
const parameters_metadata_mapper_1 = require("../services/parameters-metadata-mapper");
const schema_object_factory_1 = require("../services/schema-object-factory");
const swagger_types_mapper_1 = require("../services/swagger-types-mapper");
const global_parameters_storage_1 = require("../storages/global-parameters.storage");
const parameterMetadataAccessor = new parameter_metadata_accessor_1.ParameterMetadataAccessor();
const modelPropertiesAccessor = new model_properties_accessor_1.ModelPropertiesAccessor();
const parametersMetadataMapper = new parameters_metadata_mapper_1.ParametersMetadataMapper(modelPropertiesAccessor);
const swaggerTypesMapper = new swagger_types_mapper_1.SwaggerTypesMapper();
const schemaObjectFactory = new schema_object_factory_1.SchemaObjectFactory(modelPropertiesAccessor, swaggerTypesMapper);
const exploreApiParametersMetadata = (schemas, instance, prototype, method) => {
    const explicitParameters = Reflect.getMetadata(constants_1.DECORATORS.API_PARAMETERS, method);
    const globalParameters = global_parameters_storage_1.GlobalParametersStorage.getAll();
    const parametersMetadata = parameterMetadataAccessor.explore(instance, prototype, method);
    const noExplicitAndGlobalMetadata = (0, lodash_1.isNil)(explicitParameters) && (0, lodash_1.isNil)(globalParameters);
    if (noExplicitAndGlobalMetadata && (0, lodash_1.isNil)(parametersMetadata)) {
        return undefined;
    }
    const reflectedParametersAsProperties = parametersMetadataMapper.transformModelToProperties(parametersMetadata || {});
    let properties = reflectedParametersAsProperties;
    if (!noExplicitAndGlobalMetadata) {
        const mergeImplicitAndExplicit = (item) => (0, lodash_1.assign)(item, (0, lodash_1.find)(explicitParameters, ['name', item.name]));
        properties = removeBodyMetadataIfExplicitExists(properties, explicitParameters);
        properties = (0, lodash_1.map)(properties, mergeImplicitAndExplicit);
        properties = (0, lodash_1.unionWith)(properties, explicitParameters, globalParameters, (arrVal, othVal) => {
            return arrVal.name === othVal.name && arrVal.in === othVal.in;
        });
    }
    const paramsWithDefinitions = schemaObjectFactory.createFromModel(properties, schemas);
    const parameters = swaggerTypesMapper.mapParamTypes(paramsWithDefinitions);
    return parameters ? { parameters } : undefined;
};
exports.exploreApiParametersMetadata = exploreApiParametersMetadata;
function removeBodyMetadataIfExplicitExists(properties, explicitParams) {
    const isBodyReflected = (0, lodash_1.some)(properties, (p) => p.in === 'body');
    const isBodyDefinedExplicitly = (0, lodash_1.some)(explicitParams, (p) => p.in === 'body');
    if (isBodyReflected && isBodyDefinedExplicitly) {
        return (0, lodash_1.omitBy)(properties, (p) => p.in === 'body');
    }
    return properties;
}

}, function(modId) { var map = {"../constants":1784796701945,"../services/model-properties-accessor":1784796701982,"../services/parameter-metadata-accessor":1784796701999,"../services/parameters-metadata-mapper":1784796702001,"../services/schema-object-factory":1784796701983,"../services/swagger-types-mapper":1784796701991,"../storages/global-parameters.storage":1784796701974}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701999, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ParameterMetadataAccessor = void 0;
const constants_1 = require("@nestjs/common/constants");
const route_paramtypes_enum_1 = require("@nestjs/common/enums/route-paramtypes.enum");
const lodash_1 = require("lodash");
const reverse_object_keys_util_1 = require("../utils/reverse-object-keys.util");
const PARAM_TOKEN_PLACEHOLDER = 'placeholder';
class ParameterMetadataAccessor {
    explore(instance, prototype, method) {
        const types = Reflect.getMetadata(constants_1.PARAMTYPES_METADATA, instance, method.name);
        if (!(types === null || types === void 0 ? void 0 : types.length)) {
            return undefined;
        }
        const routeArgsMetadata = Reflect.getMetadata(constants_1.ROUTE_ARGS_METADATA, instance.constructor, method.name) || {};
        const parametersWithType = (0, lodash_1.mapValues)((0, reverse_object_keys_util_1.reverseObjectKeys)(routeArgsMetadata), (param) => ({
            type: types[param.index],
            name: param.data,
            required: true
        }));
        const excludePredicate = (val) => val.in === PARAM_TOKEN_PLACEHOLDER || (val.name && val.in === 'body');
        const parameters = (0, lodash_1.omitBy)((0, lodash_1.mapValues)(parametersWithType, (val, key) => (Object.assign(Object.assign({}, val), { in: this.mapParamType(key) }))), excludePredicate);
        return !(0, lodash_1.isEmpty)(parameters) ? parameters : undefined;
    }
    mapParamType(key) {
        const keyPair = key.split(':');
        switch (Number(keyPair[0])) {
            case route_paramtypes_enum_1.RouteParamtypes.BODY:
                return 'body';
            case route_paramtypes_enum_1.RouteParamtypes.PARAM:
                return 'path';
            case route_paramtypes_enum_1.RouteParamtypes.QUERY:
                return 'query';
            case route_paramtypes_enum_1.RouteParamtypes.HEADERS:
                return 'header';
            default:
                return PARAM_TOKEN_PLACEHOLDER;
        }
    }
}
exports.ParameterMetadataAccessor = ParameterMetadataAccessor;

}, function(modId) { var map = {"../utils/reverse-object-keys.util":1784796702000}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702000, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseObjectKeys = reverseObjectKeys;
function reverseObjectKeys(originalObject) {
    const reversedObject = {};
    const keys = Object.keys(originalObject).reverse();
    for (const key of keys) {
        reversedObject[key] = originalObject[key];
    }
    return reversedObject;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702001, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametersMetadataMapper = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const is_body_parameter_util_1 = require("../utils/is-body-parameter.util");
class ParametersMetadataMapper {
    constructor(modelPropertiesAccessor) {
        this.modelPropertiesAccessor = modelPropertiesAccessor;
    }
    transformModelToProperties(parameters) {
        const properties = (0, lodash_1.flatMap)(parameters, (param) => {
            if (!param || param.type === Object || !param.type) {
                return undefined;
            }
            if (param.name) {
                return param;
            }
            if ((0, is_body_parameter_util_1.isBodyParameter)(param)) {
                const isCtor = param.type && (0, shared_utils_1.isFunction)(param.type);
                const name = isCtor ? param.type.name : param.type;
                return Object.assign(Object.assign({}, param), { name });
            }
            const { prototype } = param.type;
            this.modelPropertiesAccessor.applyMetadataFactory(prototype);
            const modelProperties = this.modelPropertiesAccessor.getModelProperties(prototype);
            return modelProperties.map((key) => this.mergeImplicitWithExplicit(key, prototype, param));
        });
        return properties.filter(lodash_1.identity);
    }
    mergeImplicitWithExplicit(key, prototype, param) {
        const reflectedParam = Reflect.getMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES, prototype, key) ||
            {};
        return Object.assign(Object.assign(Object.assign({}, param), reflectedParam), { name: reflectedParam.name || key });
    }
}
exports.ParametersMetadataMapper = ParametersMetadataMapper;

}, function(modId) { var map = {"../constants":1784796701945,"../utils/is-body-parameter.util":1784796701987}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702002, function(require, module, exports) {

var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreApiResponseMetadata = exports.exploreGlobalApiResponseMetadata = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/common/constants");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const lodash_1 = require("lodash");
const constants_2 = require("../constants");
const decorators_1 = require("../decorators");
const plugin_constants_1 = require("../plugin/plugin-constants");
const response_object_factory_1 = require("../services/response-object-factory");
const global_responses_storage_1 = require("../storages/global-responses.storage");
const merge_and_uniq_util_1 = require("../utils/merge-and-uniq.util");
const responseObjectFactory = new response_object_factory_1.ResponseObjectFactory();
const exploreGlobalApiResponseMetadata = (schemas, metatype, factories) => {
    const responses = Reflect.getMetadata(constants_2.DECORATORS.API_RESPONSE, metatype);
    const globalResponses = global_responses_storage_1.GlobalResponsesStorage.getAll();
    const mappedGlobalResponsesOrUndefined = globalResponses
        ? mapResponsesToSwaggerResponses(globalResponses, schemas, undefined, factories)
        : undefined;
    const produces = Reflect.getMetadata(constants_2.DECORATORS.API_PRODUCES, metatype);
    return responses
        ? {
            responses: Object.assign(Object.assign({}, mappedGlobalResponsesOrUndefined), mapResponsesToSwaggerResponses(responses, schemas, produces, factories))
        }
        : mappedGlobalResponsesOrUndefined
            ? {
                responses: mappedGlobalResponsesOrUndefined
            }
            : undefined;
};
exports.exploreGlobalApiResponseMetadata = exploreGlobalApiResponseMetadata;
const exploreApiResponseMetadata = (schemas, factories, instance, prototype, method) => {
    applyMetadataFactory(prototype, instance);
    const responses = Reflect.getMetadata(constants_2.DECORATORS.API_RESPONSE, method);
    if (responses) {
        const classProduces = Reflect.getMetadata(constants_2.DECORATORS.API_PRODUCES, prototype);
        const methodProduces = Reflect.getMetadata(constants_2.DECORATORS.API_PRODUCES, method);
        const produces = (0, merge_and_uniq_util_1.mergeAndUniq)((0, lodash_1.get)(classProduces, 'produces'), methodProduces);
        return mapResponsesToSwaggerResponses(responses, schemas, produces, factories);
    }
    const status = getStatusCode(method);
    if (status) {
        return { [status]: { description: '' } };
    }
    return undefined;
};
exports.exploreApiResponseMetadata = exploreApiResponseMetadata;
const getStatusCode = (method) => {
    const status = Reflect.getMetadata(constants_1.HTTP_CODE_METADATA, method);
    if (status) {
        return status;
    }
    const requestMethod = Reflect.getMetadata(constants_1.METHOD_METADATA, method);
    switch (requestMethod) {
        case common_1.RequestMethod.POST:
            return common_1.HttpStatus.CREATED;
        default:
            return common_1.HttpStatus.OK;
    }
};
const omitParamType = (param) => (0, lodash_1.omit)(param, 'type');
const mapResponsesToSwaggerResponses = (responses, schemas, produces = ['application/json'], factories) => {
    produces = (0, shared_utils_1.isEmpty)(produces) ? ['application/json'] : produces;
    const openApiResponses = (0, lodash_1.mapValues)(responses, (response) => responseObjectFactory.create(response, produces, schemas, factories));
    return (0, lodash_1.mapValues)(openApiResponses, omitParamType);
};
function applyMetadataFactory(prototype, instance) {
    const classPrototype = prototype;
    do {
        if (!prototype.constructor) {
            return;
        }
        if (!prototype.constructor[plugin_constants_1.METADATA_FACTORY_NAME]) {
            continue;
        }
        const metadata = prototype.constructor[plugin_constants_1.METADATA_FACTORY_NAME]();
        const methodKeys = Object.keys(metadata).filter((key) => typeof instance[key] === 'function');
        methodKeys.forEach((key) => {
            const _a = metadata[key], { summary, deprecated, tags } = _a, meta = __rest(_a, ["summary", "deprecated", "tags"]);
            if (Object.keys(meta).length === 0) {
                return;
            }
            if (meta.status === undefined) {
                meta.status = getStatusCode(instance[key]);
            }
            (0, decorators_1.ApiResponse)(meta, { overrideExisting: false })(classPrototype, key, Object.getOwnPropertyDescriptor(classPrototype, key));
        });
    } while ((prototype = Reflect.getPrototypeOf(prototype)) &&
        prototype !== Object.prototype &&
        prototype);
}

}, function(modId) { var map = {"../constants":1784796701945,"../decorators":1784796701942,"../plugin/plugin-constants":1784796701951,"../services/response-object-factory":1784796702003,"../storages/global-responses.storage":1784796701975,"../utils/merge-and-uniq.util":1784796702007}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702003, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseObjectFactory = void 0;
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const is_built_in_type_util_1 = require("../utils/is-built-in-type.util");
const mimetype_content_wrapper_1 = require("./mimetype-content-wrapper");
const model_properties_accessor_1 = require("./model-properties-accessor");
const response_object_mapper_1 = require("./response-object-mapper");
const schema_object_factory_1 = require("./schema-object-factory");
const swagger_types_mapper_1 = require("./swagger-types-mapper");
class ResponseObjectFactory {
    constructor() {
        this.mimetypeContentWrapper = new mimetype_content_wrapper_1.MimetypeContentWrapper();
        this.modelPropertiesAccessor = new model_properties_accessor_1.ModelPropertiesAccessor();
        this.swaggerTypesMapper = new swagger_types_mapper_1.SwaggerTypesMapper();
        this.schemaObjectFactory = new schema_object_factory_1.SchemaObjectFactory(this.modelPropertiesAccessor, this.swaggerTypesMapper);
        this.responseObjectMapper = new response_object_mapper_1.ResponseObjectMapper();
    }
    create(response, produces, schemas, factories) {
        var _a;
        const { type, isArray } = response;
        response = (0, lodash_1.omit)(response, ['isArray']);
        if (!type) {
            return this.responseObjectMapper.wrapSchemaWithContent(response, produces);
        }
        if ((0, is_built_in_type_util_1.isBuiltInType)(type)) {
            const typeName = type && (0, lodash_1.isFunction)(type) ? type.name : type;
            const swaggerType = this.swaggerTypesMapper.mapTypeToOpenAPIType(typeName);
            const exampleKeys = ['example', 'examples'];
            if (isArray) {
                const content = this.mimetypeContentWrapper.wrap(produces, {
                    schema: {
                        type: 'array',
                        items: {
                            type: swaggerType
                        }
                    }
                });
                return Object.assign(Object.assign({}, (0, lodash_1.omit)(response, exampleKeys)), content);
            }
            const content = this.mimetypeContentWrapper.wrap(produces, {
                schema: {
                    type: swaggerType
                }
            });
            return Object.assign(Object.assign({}, (0, lodash_1.omit)(response, exampleKeys)), content);
        }
        const name = this.schemaObjectFactory.exploreModelSchema(type, schemas);
        if ((0, lodash_1.isFunction)(type) && type.prototype) {
            const { prototype } = type;
            const links = {};
            const properties = this.modelPropertiesAccessor.getModelProperties(prototype);
            const generateLink = (controllerPrototype, method, parameter, field) => {
                if (!factories) {
                    return;
                }
                const linkName = factories.linkName(controllerPrototype.constructor.name, method.name, field);
                links[linkName] = {
                    operationId: factories.operationId(controllerPrototype.constructor.name, method.name),
                    parameters: {
                        [parameter]: `$response.body#/${field}`
                    }
                };
            };
            for (const key of properties) {
                const metadata = (_a = Reflect.getMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES, prototype, key)) !== null && _a !== void 0 ? _a : {};
                if (!metadata.link) {
                    continue;
                }
                const linkedType = metadata.link();
                const linkedGetterInfo = Reflect.getMetadata(constants_1.DECORATORS.API_DEFAULT_GETTER, linkedType.prototype);
                if (!linkedGetterInfo) {
                    continue;
                }
                const { getter, parameter, prototype: controllerPrototype } = linkedGetterInfo;
                generateLink(controllerPrototype, getter, parameter, key);
            }
            const customLinks = Reflect.getMetadata(constants_1.DECORATORS.API_LINK, prototype);
            for (const customLink of customLinks !== null && customLinks !== void 0 ? customLinks : []) {
                const { method, parameter, field, prototype: controllerPrototype } = customLink;
                generateLink(controllerPrototype, method, parameter, field);
            }
            if (!(0, lodash_1.isEmpty)(links)) {
                response.links = Object.assign(links, response.links);
            }
        }
        if (isArray) {
            return this.responseObjectMapper.toArrayRefObject(response, name, produces);
        }
        return this.responseObjectMapper.toRefObject(response, name, produces);
    }
}
exports.ResponseObjectFactory = ResponseObjectFactory;

}, function(modId) { var map = {"../constants":1784796701945,"../utils/is-built-in-type.util":1784796701988,"./mimetype-content-wrapper":1784796702004,"./model-properties-accessor":1784796701982,"./response-object-mapper":1784796702006,"./schema-object-factory":1784796701983,"./swagger-types-mapper":1784796701991}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702004, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.MimetypeContentWrapper = void 0;
const remove_undefined_keys_1 = require("../utils/remove-undefined-keys");
class MimetypeContentWrapper {
    wrap(mimetype, obj) {
        const content = mimetype.reduce((acc, item) => (Object.assign(Object.assign({}, acc), { [item]: (0, remove_undefined_keys_1.removeUndefinedKeys)(obj) })), {});
        return { content };
    }
}
exports.MimetypeContentWrapper = MimetypeContentWrapper;

}, function(modId) { var map = {"../utils/remove-undefined-keys":1784796702005}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702005, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUndefinedKeys = removeUndefinedKeys;
function removeUndefinedKeys(obj) {
    Object.entries(obj).forEach(([key, value]) => {
        if (value === undefined) {
            delete obj[key];
        }
    });
    return obj;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702006, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseObjectMapper = void 0;
const lodash_1 = require("lodash");
const utils_1 = require("../utils");
const mimetype_content_wrapper_1 = require("./mimetype-content-wrapper");
class ResponseObjectMapper {
    constructor() {
        this.mimetypeContentWrapper = new mimetype_content_wrapper_1.MimetypeContentWrapper();
    }
    toArrayRefObject(response, name, produces) {
        const exampleKeys = ['example', 'examples'];
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(response, exampleKeys)), this.mimetypeContentWrapper.wrap(produces, Object.assign({ schema: {
                type: 'array',
                items: {
                    $ref: (0, utils_1.getSchemaPath)(name)
                }
            } }, (0, lodash_1.pick)(response, exampleKeys))));
    }
    toRefObject(response, name, produces) {
        const exampleKeys = ['example', 'examples'];
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(response, exampleKeys)), this.mimetypeContentWrapper.wrap(produces, Object.assign({ schema: {
                $ref: (0, utils_1.getSchemaPath)(name)
            } }, (0, lodash_1.pick)(response, exampleKeys))));
    }
    wrapSchemaWithContent(response, produces) {
        if (!response.schema &&
            !('example' in response) &&
            !('examples' in response)) {
            return response;
        }
        const exampleKeys = ['example', 'examples'];
        const content = this.mimetypeContentWrapper.wrap(produces, Object.assign({ schema: response.schema }, (0, lodash_1.pick)(response, exampleKeys)));
        const keysToOmit = [...exampleKeys, 'schema'];
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(response, keysToOmit)), content);
    }
}
exports.ResponseObjectMapper = ResponseObjectMapper;

}, function(modId) { var map = {"../utils":1784796701985,"./mimetype-content-wrapper":1784796702004}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702007, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAndUniq = mergeAndUniq;
const lodash_1 = require("lodash");
function mergeAndUniq(a = [], b = []) {
    return (0, lodash_1.uniq)((0, lodash_1.merge)(a, b));
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702008, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreApiSecurityMetadata = exports.exploreGlobalApiSecurityMetadata = void 0;
const constants_1 = require("../constants");
const exploreGlobalApiSecurityMetadata = (metatype) => {
    const security = Reflect.getMetadata(constants_1.DECORATORS.API_SECURITY, metatype);
    return security ? { security } : undefined;
};
exports.exploreGlobalApiSecurityMetadata = exploreGlobalApiSecurityMetadata;
const exploreApiSecurityMetadata = (instance, prototype, method) => {
    return Reflect.getMetadata(constants_1.DECORATORS.API_SECURITY, method);
};
exports.exploreApiSecurityMetadata = exploreApiSecurityMetadata;

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702009, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.exploreApiTagsMetadata = exports.exploreGlobalApiTagsMetadata = void 0;
const constants_1 = require("../constants");
const exploreGlobalApiTagsMetadata = (autoTagControllers) => (metatype) => {
    const decoratorTags = Reflect.getMetadata(constants_1.DECORATORS.API_TAGS, metatype);
    const isEmpty = !decoratorTags || decoratorTags.length === 0;
    if (isEmpty && autoTagControllers) {
        const defaultTag = metatype.name.replace(/Controller$/, '');
        return {
            tags: [defaultTag]
        };
    }
    return isEmpty ? undefined : { tags: decoratorTags };
};
exports.exploreGlobalApiTagsMetadata = exploreGlobalApiTagsMetadata;
const exploreApiTagsMetadata = (instance, prototype, method) => Reflect.getMetadata(constants_1.DECORATORS.API_TAGS, method);
exports.exploreApiTagsMetadata = exploreApiTagsMetadata;

}, function(modId) { var map = {"../constants":1784796701945}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702010, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerTransformer = void 0;
const lodash_1 = require("lodash");
const sort_object_lexicographically_1 = require("./utils/sort-object-lexicographically");
class SwaggerTransformer {
    normalizePaths(denormalizedDoc) {
        const roots = (0, lodash_1.filter)(denormalizedDoc, (r) => r.root);
        const groupedByPath = (0, lodash_1.groupBy)(roots, ({ root }) => root.path);
        const paths = (0, lodash_1.mapValues)(groupedByPath, (routes) => {
            const keyByMethod = (0, lodash_1.keyBy)(routes, ({ root }) => root.method);
            return (0, lodash_1.mapValues)(keyByMethod, (route) => {
                const mergedDefinition = Object.assign(Object.assign({}, (0, lodash_1.omit)(route, 'root')), (0, lodash_1.omit)(route.root, ['method', 'path']));
                return (0, sort_object_lexicographically_1.sortObjectLexicographically)(mergedDefinition);
            });
        });
        return {
            paths
        };
    }
}
exports.SwaggerTransformer = SwaggerTransformer;

}, function(modId) { var map = {"./utils/sort-object-lexicographically":1784796702011}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702011, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.sortObjectLexicographically = sortObjectLexicographically;
function sortObjectLexicographically(obj) {
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj = {};
    for (const key of sortedKeys) {
        sortedObj[key] = obj[key];
    }
    return sortedObj;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702012, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalPrefix = getGlobalPrefix;
function getGlobalPrefix(app) {
    const internalConfigRef = app.config;
    return (internalConfigRef && internalConfigRef.getGlobalPrefix()) || '';
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702013, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.stripLastSlash = stripLastSlash;
function stripLastSlash(path) {
    return path && path[path.length - 1] === '/'
        ? path.slice(0, path.length - 1)
        : path;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702014, function(require, module, exports) {

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
__exportStar(require("./swagger-ui"), exports);

}, function(modId) { var map = {"./swagger-ui":1784796702015}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702015, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSwaggerInitJS = buildSwaggerInitJS;
exports.getSwaggerAssetsAbsoluteFSPath = getSwaggerAssetsAbsoluteFSPath;
exports.buildSwaggerHTML = buildSwaggerHTML;
const constants_1 = require("./constants");
const helpers_1 = require("./helpers");
function buildSwaggerInitJS(swaggerDoc, customOptions = {}) {
    const { swaggerOptions = {}, swaggerUrl } = customOptions;
    const swaggerInitOptions = {
        swaggerDoc,
        swaggerUrl,
        customOptions: swaggerOptions
    };
    const jsInitOptions = (0, helpers_1.buildJSInitOptions)(swaggerInitOptions);
    return constants_1.jsTemplateString.replace('<% swaggerOptions %>', jsInitOptions);
}
let swaggerAssetsAbsoluteFSPath;
function getSwaggerAssetsAbsoluteFSPath() {
    if (!swaggerAssetsAbsoluteFSPath) {
        swaggerAssetsAbsoluteFSPath = require('swagger-ui-dist/absolute-path.js')();
    }
    return swaggerAssetsAbsoluteFSPath;
}
function toExternalScriptTag(url) {
    return `<script src='${url}'></script>`;
}
function toInlineScriptTag(jsCode) {
    return `<script>${jsCode}</script>`;
}
function toExternalStylesheetTag(url) {
    return `<link href='${url}' rel='stylesheet'>`;
}
function toTags(customCode, toScript) {
    if (!customCode) {
        return '';
    }
    if (typeof customCode === 'string') {
        return toScript(customCode);
    }
    else {
        return customCode.map(toScript).join('\n');
    }
}
function buildSwaggerHTML(baseUrl, customOptions = {}) {
    const { customCss = '', customJs = '', customJsStr = '', customfavIcon = false, customSiteTitle = 'Swagger UI', customCssUrl = '', explorer = false } = customOptions;
    const favIconString = customfavIcon
        ? `<link rel='icon' href='${customfavIcon}' />`
        : constants_1.favIconHtml;
    const explorerCss = explorer
        ? ''
        : '.swagger-ui .topbar .download-url-wrapper { display: none }';
    return constants_1.htmlTemplateString
        .replace('<% customCss %>', customCss)
        .replace('<% explorerCss %>', explorerCss)
        .replace('<% favIconString %>', favIconString)
        .replace(/<% baseUrl %>/g, baseUrl)
        .replace('<% customJs %>', toTags(customJs, toExternalScriptTag))
        .replace('<% customJsStr %>', toTags(customJsStr, toInlineScriptTag))
        .replace('<% customCssUrl %>', toTags(customCssUrl, toExternalStylesheetTag))
        .replace('<% title %>', customSiteTitle);
}

}, function(modId) { var map = {"./constants":1784796702016,"./helpers":1784796702017}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702016, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.jsTemplateString = exports.htmlTemplateString = exports.favIconHtml = void 0;
exports.favIconHtml = '<link rel="icon" type="image/png" href="<% baseUrl %>favicon-32x32.png" sizes="32x32" />' +
    '<link rel="icon" type="image/png" href="<% baseUrl %>favicon-16x16.png" sizes="16x16" />';
exports.htmlTemplateString = `
<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><% title %></title>
  <link rel="stylesheet" type="text/css" href="<% baseUrl %>swagger-ui.css" >
  <% favIconString %>
  <style>
    html
    {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *,
    *:before,
    *:after
    {
      box-sizing: inherit;
    }

    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>

<body>

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position:absolute;width:0;height:0">
  <defs>
    <symbol viewBox="0 0 20 20" id="unlocked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V6h2v-.801C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8z"></path>
    </symbol>

    <symbol viewBox="0 0 20 20" id="locked">
      <path d="M15.8 8H14V5.6C14 2.703 12.665 1 10 1 7.334 1 6 2.703 6 5.6V8H4c-.553 0-1 .646-1 1.199V17c0 .549.428 1.139.951 1.307l1.197.387C5.672 18.861 6.55 19 7.1 19h5.8c.549 0 1.428-.139 1.951-.307l1.196-.387c.524-.167.953-.757.953-1.306V9.199C17 8.646 16.352 8 15.8 8zM12 8H8V5.199C8 3.754 8.797 3 10 3c1.203 0 2 .754 2 2.199V8z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="close">
      <path d="M14.348 14.849c-.469.469-1.229.469-1.697 0L10 11.819l-2.651 3.029c-.469.469-1.229.469-1.697 0-.469-.469-.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-.469-.469-.469-1.228 0-1.697.469-.469 1.228-.469 1.697 0L10 8.183l2.651-3.031c.469-.469 1.228-.469 1.697 0 .469.469.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c.469.469.469 1.229 0 1.698z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow">
      <path d="M13.25 10L6.109 2.58c-.268-.27-.268-.707 0-.979.268-.27.701-.27.969 0l7.83 7.908c.268.271.268.709 0 .979l-7.83 7.908c-.268.271-.701.27-.969 0-.268-.269-.268-.707 0-.979L13.25 10z"/>
    </symbol>

    <symbol viewBox="0 0 20 20" id="large-arrow-down">
      <path d="M17.418 6.109c.272-.268.709-.268.979 0s.271.701 0 .969l-7.908 7.83c-.27.268-.707.268-.979 0l-7.908-7.83c-.27-.268-.27-.701 0-.969.271-.268.709-.268.979 0L10 13.25l7.418-7.141z"/>
    </symbol>


    <symbol viewBox="0 0 24 24" id="jump-to">
      <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>
    </symbol>

    <symbol viewBox="0 0 24 24" id="expand">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </symbol>

  </defs>
</svg>

<div id="swagger-ui"></div>

<script src="<% baseUrl %>swagger-ui-bundle.js"> </script>
<script src="<% baseUrl %>swagger-ui-standalone-preset.js"> </script>
<script src="<% baseUrl %>swagger-ui-init.js"> </script>
<% customJs %>
<% customJsStr %>
<% customCssUrl %>
<style>
  <% customCss %>
  <% explorerCss %>
</style>
</body>

</html>
`;
exports.jsTemplateString = `
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  <% swaggerOptions %>
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
`;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702017, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.buildJSInitOptions = buildJSInitOptions;
function buildJSInitOptions(initOptions) {
    const functionPlaceholder = '____FUNCTION_PLACEHOLDER____';
    const fns = [];
    let json = JSON.stringify(initOptions, (key, value) => {
        if (typeof value === 'function') {
            fns.push(value);
            return functionPlaceholder;
        }
        return value;
    }, 2);
    json = json.replace(new RegExp('"' + functionPlaceholder + '"', 'g'), () => fns.shift());
    return `let options = ${json};`;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702018, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTwoLevelsDeep = assignTwoLevelsDeep;
function assignTwoLevelsDeep(_dest, ...args) {
    const dest = _dest;
    for (const arg of args) {
        for (const [key, value] of Object.entries(arg !== null && arg !== void 0 ? arg : {})) {
            dest[key] = Object.assign(Object.assign({}, dest[key]), value);
        }
    }
    return dest;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702019, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRelPath = normalizeRelPath;
function normalizeRelPath(input) {
    const output = input.replace(/\/\/+/g, '/');
    return output;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702020, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePath = resolvePath;
const pathLib = require("path");
function resolvePath(path) {
    return path ? pathLib.resolve(path) : path;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702021, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGlobalPrefix = void 0;
const validateGlobalPrefix = (globalPrefix) => globalPrefix && !globalPrefix.match(/^(\/?)$/);
exports.validateGlobalPrefix = validateGlobalPrefix;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702022, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePath = void 0;
const validatePath = (inputPath) => inputPath.charAt(0) !== '/' ? '/' + inputPath : inputPath;
exports.validatePath = validatePath;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702023, function(require, module, exports) {

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
__exportStar(require("./intersection-type.helper"), exports);
__exportStar(require("./omit-type.helper"), exports);
__exportStar(require("./partial-type.helper"), exports);
__exportStar(require("./pick-type.helper"), exports);

}, function(modId) { var map = {"./intersection-type.helper":1784796702024,"./omit-type.helper":1784796702026,"./partial-type.helper":1784796702027,"./pick-type.helper":1784796702028}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702024, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.IntersectionType = IntersectionType;
const mapped_types_1 = require("@nestjs/mapped-types");
const constants_1 = require("../constants");
const decorators_1 = require("../decorators");
const metadata_loader_1 = require("../plugin/metadata-loader");
const model_properties_accessor_1 = require("../services/model-properties-accessor");
const mapped_types_utils_1 = require("./mapped-types.utils");
const modelPropertiesAccessor = new model_properties_accessor_1.ModelPropertiesAccessor();
function IntersectionType(...classRefs) {
    class IntersectionClassType {
        constructor() {
            classRefs.forEach((classRef) => {
                (0, mapped_types_1.inheritPropertyInitializers)(this, classRef);
            });
        }
    }
    classRefs.forEach((classRef) => {
        const fields = modelPropertiesAccessor.getModelProperties(classRef.prototype);
        (0, mapped_types_1.inheritValidationMetadata)(classRef, IntersectionClassType);
        (0, mapped_types_1.inheritTransformationMetadata)(classRef, IntersectionClassType);
        function applyFields(fields) {
            (0, mapped_types_utils_1.clonePluginMetadataFactory)(IntersectionClassType, classRef.prototype);
            fields.forEach((propertyKey) => {
                const metadata = Reflect.getMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES, classRef.prototype, propertyKey);
                const decoratorFactory = (0, decorators_1.ApiProperty)(metadata);
                decoratorFactory(IntersectionClassType.prototype, propertyKey);
            });
        }
        applyFields(fields);
        metadata_loader_1.MetadataLoader.addRefreshHook(() => {
            const fields = modelPropertiesAccessor.getModelProperties(classRef.prototype);
            applyFields(fields);
        });
    });
    const intersectedNames = classRefs.reduce((prev, ref) => prev + ref.name, '');
    Object.defineProperty(IntersectionClassType, 'name', {
        value: `Intersection${intersectedNames}`
    });
    return IntersectionClassType;
}

}, function(modId) { var map = {"../constants":1784796701945,"../decorators":1784796701942,"../plugin/metadata-loader":1784796701980,"../services/model-properties-accessor":1784796701982,"./mapped-types.utils":1784796702025}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702025, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.clonePluginMetadataFactory = clonePluginMetadataFactory;
const lodash_1 = require("lodash");
const plugin_constants_1 = require("../plugin/plugin-constants");
function clonePluginMetadataFactory(target, parent, transformFn = lodash_1.identity) {
    let targetMetadata = {};
    do {
        if (!parent.constructor) {
            return;
        }
        if (!parent.constructor[plugin_constants_1.METADATA_FACTORY_NAME]) {
            continue;
        }
        const parentMetadata = parent.constructor[plugin_constants_1.METADATA_FACTORY_NAME]();
        targetMetadata = Object.assign(Object.assign({}, parentMetadata), targetMetadata);
    } while ((parent = Reflect.getPrototypeOf(parent)) &&
        parent !== Object.prototype &&
        parent);
    targetMetadata = transformFn(targetMetadata);
    if (target[plugin_constants_1.METADATA_FACTORY_NAME]) {
        const originalFactory = target[plugin_constants_1.METADATA_FACTORY_NAME];
        target[plugin_constants_1.METADATA_FACTORY_NAME] = () => {
            const originalMetadata = originalFactory();
            return Object.assign(Object.assign({}, originalMetadata), targetMetadata);
        };
    }
    else {
        target[plugin_constants_1.METADATA_FACTORY_NAME] = () => targetMetadata;
    }
}

}, function(modId) { var map = {"../plugin/plugin-constants":1784796701951}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702026, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.OmitType = OmitType;
const mapped_types_1 = require("@nestjs/mapped-types");
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const decorators_1 = require("../decorators");
const metadata_loader_1 = require("../plugin/metadata-loader");
const model_properties_accessor_1 = require("../services/model-properties-accessor");
const mapped_types_utils_1 = require("./mapped-types.utils");
const modelPropertiesAccessor = new model_properties_accessor_1.ModelPropertiesAccessor();
function OmitType(classRef, keys) {
    const fields = modelPropertiesAccessor
        .getModelProperties(classRef.prototype)
        .filter((item) => !keys.includes(item));
    const isInheritedPredicate = (propertyKey) => !keys.includes(propertyKey);
    class OmitTypeClass {
        constructor() {
            (0, mapped_types_1.inheritPropertyInitializers)(this, classRef, isInheritedPredicate);
        }
    }
    (0, mapped_types_1.inheritValidationMetadata)(classRef, OmitTypeClass, isInheritedPredicate);
    (0, mapped_types_1.inheritTransformationMetadata)(classRef, OmitTypeClass, isInheritedPredicate);
    function applyFields(fields) {
        (0, mapped_types_utils_1.clonePluginMetadataFactory)(OmitTypeClass, classRef.prototype, (metadata) => (0, lodash_1.omit)(metadata, keys));
        fields.forEach((propertyKey) => {
            const metadata = Reflect.getMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES, classRef.prototype, propertyKey);
            const decoratorFactory = (0, decorators_1.ApiProperty)(metadata);
            decoratorFactory(OmitTypeClass.prototype, propertyKey);
        });
    }
    applyFields(fields);
    metadata_loader_1.MetadataLoader.addRefreshHook(() => {
        const fields = modelPropertiesAccessor
            .getModelProperties(classRef.prototype)
            .filter((item) => !keys.includes(item));
        applyFields(fields);
    });
    return OmitTypeClass;
}

}, function(modId) { var map = {"../constants":1784796701945,"../decorators":1784796701942,"../plugin/metadata-loader":1784796701980,"../services/model-properties-accessor":1784796701982,"./mapped-types.utils":1784796702025}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702027, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialType = PartialType;
const mapped_types_1 = require("@nestjs/mapped-types");
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const decorators_1 = require("../decorators");
const metadata_loader_1 = require("../plugin/metadata-loader");
const plugin_constants_1 = require("../plugin/plugin-constants");
const model_properties_accessor_1 = require("../services/model-properties-accessor");
const mapped_types_utils_1 = require("./mapped-types.utils");
const modelPropertiesAccessor = new model_properties_accessor_1.ModelPropertiesAccessor();
function PartialType(classRef, options = {}) {
    const applyPartialDecoratorFn = options.skipNullProperties === false
        ? mapped_types_1.applyValidateIfDefinedDecorator
        : mapped_types_1.applyIsOptionalDecorator;
    const fields = modelPropertiesAccessor.getModelProperties(classRef.prototype);
    class PartialTypeClass {
        constructor() {
            (0, mapped_types_1.inheritPropertyInitializers)(this, classRef);
        }
    }
    const keysWithValidationConstraints = (0, mapped_types_1.inheritValidationMetadata)(classRef, PartialTypeClass);
    if (keysWithValidationConstraints) {
        keysWithValidationConstraints
            .filter((key) => !fields.includes(key))
            .forEach((key) => applyPartialDecoratorFn(PartialTypeClass, key));
    }
    (0, mapped_types_1.inheritTransformationMetadata)(classRef, PartialTypeClass);
    function applyFields(fields) {
        (0, mapped_types_utils_1.clonePluginMetadataFactory)(PartialTypeClass, classRef.prototype, (metadata) => (0, lodash_1.mapValues)(metadata, (item) => (Object.assign(Object.assign({}, item), { required: false }))));
        if (PartialTypeClass[plugin_constants_1.METADATA_FACTORY_NAME]) {
            const pluginFields = Object.keys(PartialTypeClass[plugin_constants_1.METADATA_FACTORY_NAME]());
            pluginFields.forEach((key) => applyPartialDecoratorFn(PartialTypeClass, key));
        }
        fields.forEach((key) => {
            const metadata = Reflect.getMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES, classRef.prototype, key) || {};
            const decoratorFactory = (0, decorators_1.ApiProperty)(Object.assign(Object.assign({}, metadata), { required: false }));
            decoratorFactory(PartialTypeClass.prototype, key);
            applyPartialDecoratorFn(PartialTypeClass, key);
        });
    }
    applyFields(fields);
    metadata_loader_1.MetadataLoader.addRefreshHook(() => {
        const fields = modelPropertiesAccessor.getModelProperties(classRef.prototype);
        applyFields(fields);
    });
    return PartialTypeClass;
}

}, function(modId) { var map = {"../constants":1784796701945,"../decorators":1784796701942,"../plugin/metadata-loader":1784796701980,"../plugin/plugin-constants":1784796701951,"../services/model-properties-accessor":1784796701982,"./mapped-types.utils":1784796702025}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796702028, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.PickType = PickType;
const mapped_types_1 = require("@nestjs/mapped-types");
const lodash_1 = require("lodash");
const constants_1 = require("../constants");
const decorators_1 = require("../decorators");
const metadata_loader_1 = require("../plugin/metadata-loader");
const model_properties_accessor_1 = require("../services/model-properties-accessor");
const mapped_types_utils_1 = require("./mapped-types.utils");
const modelPropertiesAccessor = new model_properties_accessor_1.ModelPropertiesAccessor();
function PickType(classRef, keys) {
    const fields = modelPropertiesAccessor
        .getModelProperties(classRef.prototype)
        .filter((item) => keys.includes(item));
    const isInheritedPredicate = (propertyKey) => keys.includes(propertyKey);
    class PickTypeClass {
        constructor() {
            (0, mapped_types_1.inheritPropertyInitializers)(this, classRef, isInheritedPredicate);
        }
    }
    (0, mapped_types_1.inheritValidationMetadata)(classRef, PickTypeClass, isInheritedPredicate);
    (0, mapped_types_1.inheritTransformationMetadata)(classRef, PickTypeClass, isInheritedPredicate);
    function applyFields(fields) {
        (0, mapped_types_utils_1.clonePluginMetadataFactory)(PickTypeClass, classRef.prototype, (metadata) => (0, lodash_1.pick)(metadata, keys));
        fields.forEach((propertyKey) => {
            const metadata = Reflect.getMetadata(constants_1.DECORATORS.API_MODEL_PROPERTIES, classRef.prototype, propertyKey);
            const decoratorFactory = (0, decorators_1.ApiProperty)(metadata);
            decoratorFactory(PickTypeClass.prototype, propertyKey);
        });
    }
    applyFields(fields);
    metadata_loader_1.MetadataLoader.addRefreshHook(() => {
        const fields = modelPropertiesAccessor
            .getModelProperties(classRef.prototype)
            .filter((item) => keys.includes(item));
        applyFields(fields);
    });
    return PickTypeClass;
}

}, function(modId) { var map = {"../constants":1784796701945,"../decorators":1784796701942,"../plugin/metadata-loader":1784796701980,"../services/model-properties-accessor":1784796701982,"./mapped-types.utils":1784796702025}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1784796701941);
})()
//miniprogram-npm-outsideDeps=["reflect-metadata","lodash","@nestjs/common/constants","@nestjs/common/utils/shared.utils","@nestjs/common","js-yaml","@nestjs/common/interfaces","@nestjs/core","@nestjs/core/router/legacy-route-converter","@nestjs/core/router/route-path-factory","path-to-regexp","@nestjs/common/enums/route-paramtypes.enum","swagger-ui-dist/absolute-path.js","path","@nestjs/mapped-types"]
//# sourceMappingURL=index.js.map