module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1784796701901, function(require, module, exports) {

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
__export(require("./dist"));

}, function(modId) {var map = {"./dist":1784796701902}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701902, function(require, module, exports) {

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
exports.JsonWebTokenError = exports.NotBeforeError = exports.TokenExpiredError = void 0;
__exportStar(require("./interfaces"), exports);
__exportStar(require("./jwt.errors"), exports);
__exportStar(require("./jwt.module"), exports);
__exportStar(require("./jwt.service"), exports);
var jsonwebtoken_1 = require("jsonwebtoken");
Object.defineProperty(exports, "TokenExpiredError", { enumerable: true, get: function () { return jsonwebtoken_1.TokenExpiredError; } });
Object.defineProperty(exports, "NotBeforeError", { enumerable: true, get: function () { return jsonwebtoken_1.NotBeforeError; } });
Object.defineProperty(exports, "JsonWebTokenError", { enumerable: true, get: function () { return jsonwebtoken_1.JsonWebTokenError; } });

}, function(modId) { var map = {"./interfaces":1784796701903,"./jwt.errors":1784796701905}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701903, function(require, module, exports) {

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
__exportStar(require("./jwt-module-options.interface"), exports);

}, function(modId) { var map = {"./jwt-module-options.interface":1784796701904}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701904, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtSecretRequestType = void 0;
var JwtSecretRequestType;
(function (JwtSecretRequestType) {
    JwtSecretRequestType[JwtSecretRequestType["SIGN"] = 0] = "SIGN";
    JwtSecretRequestType[JwtSecretRequestType["VERIFY"] = 1] = "VERIFY";
})(JwtSecretRequestType || (exports.JwtSecretRequestType = JwtSecretRequestType = {}));

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701905, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.WrongSecretProviderError = void 0;
class WrongSecretProviderError extends Error {
}
exports.WrongSecretProviderError = WrongSecretProviderError;

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1784796701901);
})()
//miniprogram-npm-outsideDeps=["./jwt.module","./jwt.service","jsonwebtoken"]
//# sourceMappingURL=index.js.map