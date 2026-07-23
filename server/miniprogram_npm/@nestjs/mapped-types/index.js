module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1784796701908, function(require, module, exports) {

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
__export(require("./dist"));

}, function(modId) {var map = {"./dist":1784796701909}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701909, function(require, module, exports) {

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
exports.inheritValidationMetadata = exports.inheritTransformationMetadata = exports.inheritPropertyInitializers = exports.applyValidateIfDefinedDecorator = exports.applyIsOptionalDecorator = void 0;
__exportStar(require("./intersection-type.helper"), exports);
__exportStar(require("./mapped-type.interface"), exports);
__exportStar(require("./omit-type.helper"), exports);
__exportStar(require("./partial-type.helper"), exports);
__exportStar(require("./pick-type.helper"), exports);
var type_helpers_utils_1 = require("./type-helpers.utils");
Object.defineProperty(exports, "applyIsOptionalDecorator", { enumerable: true, get: function () { return type_helpers_utils_1.applyIsOptionalDecorator; } });
Object.defineProperty(exports, "applyValidateIfDefinedDecorator", { enumerable: true, get: function () { return type_helpers_utils_1.applyValidateIfDefinedDecorator; } });
Object.defineProperty(exports, "inheritPropertyInitializers", { enumerable: true, get: function () { return type_helpers_utils_1.inheritPropertyInitializers; } });
Object.defineProperty(exports, "inheritTransformationMetadata", { enumerable: true, get: function () { return type_helpers_utils_1.inheritTransformationMetadata; } });
Object.defineProperty(exports, "inheritValidationMetadata", { enumerable: true, get: function () { return type_helpers_utils_1.inheritValidationMetadata; } });

}, function(modId) { var map = {"./intersection-type.helper":1784796701910,"./mapped-type.interface":1784796701912,"./omit-type.helper":1784796701913,"./partial-type.helper":1784796701915,"./pick-type.helper":1784796701917}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701910, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.IntersectionType = IntersectionType;
const type_helpers_utils_1 = require("./type-helpers.utils");
function IntersectionType(...classRefs) {
    class IntersectionClassType {
        constructor() {
            classRefs.forEach((classRef) => {
                (0, type_helpers_utils_1.inheritPropertyInitializers)(this, classRef);
            });
        }
    }
    classRefs.forEach((classRef) => {
        (0, type_helpers_utils_1.inheritValidationMetadata)(classRef, IntersectionClassType);
        (0, type_helpers_utils_1.inheritTransformationMetadata)(classRef, IntersectionClassType, undefined, false);
    });
    const intersectedNames = classRefs.reduce((prev, ref) => prev + ref.name, '');
    Object.defineProperty(IntersectionClassType, 'name', {
        value: `Intersection${intersectedNames}`,
    });
    return IntersectionClassType;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701912, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701913, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.OmitType = OmitType;
const type_helpers_utils_1 = require("./type-helpers.utils");
function OmitType(classRef, keys) {
    const isInheritedPredicate = (propertyKey) => !keys.includes(propertyKey);
    class OmitClassType {
        constructor() {
            (0, type_helpers_utils_1.inheritPropertyInitializers)(this, classRef, isInheritedPredicate);
        }
    }
    (0, type_helpers_utils_1.inheritValidationMetadata)(classRef, OmitClassType, isInheritedPredicate);
    (0, type_helpers_utils_1.inheritTransformationMetadata)(classRef, OmitClassType, isInheritedPredicate);
    return OmitClassType;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701915, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialType = PartialType;
const type_helpers_utils_1 = require("./type-helpers.utils");
function PartialType(classRef, options = {}) {
    class PartialClassType {
        constructor() {
            (0, type_helpers_utils_1.inheritPropertyInitializers)(this, classRef);
        }
    }
    const propertyKeys = (0, type_helpers_utils_1.inheritValidationMetadata)(classRef, PartialClassType);
    (0, type_helpers_utils_1.inheritTransformationMetadata)(classRef, PartialClassType);
    if (propertyKeys) {
        propertyKeys.forEach((key) => {
            options.skipNullProperties === false
                ? (0, type_helpers_utils_1.applyValidateIfDefinedDecorator)(PartialClassType, key)
                : (0, type_helpers_utils_1.applyIsOptionalDecorator)(PartialClassType, key);
        });
    }
    Object.defineProperty(PartialClassType, 'name', {
        value: `Partial${classRef.name}`,
    });
    return PartialClassType;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701917, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.PickType = PickType;
const type_helpers_utils_1 = require("./type-helpers.utils");
function PickType(classRef, keys) {
    const isInheritedPredicate = (propertyKey) => keys.includes(propertyKey);
    class PickClassType {
        constructor() {
            (0, type_helpers_utils_1.inheritPropertyInitializers)(this, classRef, isInheritedPredicate);
        }
    }
    (0, type_helpers_utils_1.inheritValidationMetadata)(classRef, PickClassType, isInheritedPredicate);
    (0, type_helpers_utils_1.inheritTransformationMetadata)(classRef, PickClassType, isInheritedPredicate);
    return PickClassType;
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1784796701908);
})()
//miniprogram-npm-outsideDeps=["./type-helpers.utils"]
//# sourceMappingURL=index.js.map