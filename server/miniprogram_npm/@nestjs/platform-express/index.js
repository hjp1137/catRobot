module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1784796701920, function(require, module, exports) {

/*
 * Nest @platform-express
 * Copyright(c) 2017 - 2025 Kamil Mysliwiec
 * https://nestjs.com
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./adapters"), exports);
tslib_1.__exportStar(require("./interfaces"), exports);
tslib_1.__exportStar(require("./multer"), exports);

}, function(modId) {var map = {"./adapters":1784796701921,"./interfaces":1784796701923,"./multer":1784796701926}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701921, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./express-adapter"), exports);

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701923, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./nest-express-application.interface"), exports);
tslib_1.__exportStar(require("./nest-express-body-parser.interface"), exports);

}, function(modId) { var map = {"./nest-express-application.interface":1784796701924,"./nest-express-body-parser.interface":1784796701925}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701924, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701925, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701926, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./interceptors"), exports);
tslib_1.__exportStar(require("./interfaces"), exports);
tslib_1.__exportStar(require("./multer.module"), exports);

}, function(modId) { var map = {"./interceptors":1784796701927,"./interfaces":1784796701936,"./multer.module":1784796701938}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701927, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./any-files.interceptor"), exports);
tslib_1.__exportStar(require("./file-fields.interceptor"), exports);
tslib_1.__exportStar(require("./file.interceptor"), exports);
tslib_1.__exportStar(require("./files.interceptor"), exports);
tslib_1.__exportStar(require("./no-files.interceptor"), exports);

}, function(modId) { var map = {"./any-files.interceptor":1784796701928,"./file-fields.interceptor":1784796701932,"./file.interceptor":1784796701933,"./files.interceptor":1784796701934,"./no-files.interceptor":1784796701935}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701928, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyFilesInterceptor = AnyFilesInterceptor;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const multer = require("multer");
const files_constants_1 = require("../files.constants");
const multer_utils_1 = require("../multer/multer.utils");
/**
 * @param localOptions
 *
 * @publicApi
 */
function AnyFilesInterceptor(localOptions) {
    let MixinInterceptor = class MixinInterceptor {
        constructor(options = {}) {
            this.multer = multer({
                ...options,
                ...localOptions,
            });
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            await new Promise((resolve, reject) => this.multer.any()(ctx.getRequest(), ctx.getResponse(), (err) => {
                if (err) {
                    const error = (0, multer_utils_1.transformException)(err);
                    return reject(error);
                }
                resolve();
            }));
            return next.handle();
        }
    };
    MixinInterceptor = tslib_1.__decorate([
        tslib_1.__param(0, (0, common_1.Optional)()),
        tslib_1.__param(0, (0, common_1.Inject)(files_constants_1.MULTER_MODULE_OPTIONS)),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], MixinInterceptor);
    const Interceptor = (0, common_1.mixin)(MixinInterceptor);
    return Interceptor;
}

}, function(modId) { var map = {"../files.constants":1784796701929,"../multer/multer.utils":1784796701930}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701929, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.MULTER_MODULE_OPTIONS = void 0;
exports.MULTER_MODULE_OPTIONS = 'MULTER_MODULE_OPTIONS';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701930, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.transformException = transformException;
const common_1 = require("@nestjs/common");
const multer_constants_1 = require("./multer.constants");
// Multer may add in a 'field' property to the error
// https://github.com/expressjs/multer/blob/aa42bea6ac7d0cb8fcb279b15a7278cda805dc63/lib/multer-error.js#L19
function transformException(error) {
    if (!error || error instanceof common_1.HttpException) {
        return error;
    }
    switch (error.message) {
        case multer_constants_1.multerExceptions.LIMIT_FILE_SIZE:
            return new common_1.PayloadTooLargeException(error.message);
        case multer_constants_1.multerExceptions.LIMIT_FILE_COUNT:
        case multer_constants_1.multerExceptions.LIMIT_FIELD_KEY:
        case multer_constants_1.multerExceptions.LIMIT_FIELD_VALUE:
        case multer_constants_1.multerExceptions.LIMIT_FIELD_COUNT:
        case multer_constants_1.multerExceptions.LIMIT_UNEXPECTED_FILE:
        case multer_constants_1.multerExceptions.LIMIT_PART_COUNT:
        case multer_constants_1.multerExceptions.MISSING_FIELD_NAME:
            if (error.field) {
                return new common_1.BadRequestException(`${error.message} - ${error.field}`);
            }
            return new common_1.BadRequestException(error.message);
        case multer_constants_1.busboyExceptions.MULTIPART_BOUNDARY_NOT_FOUND:
            return new common_1.BadRequestException(error.message);
        case multer_constants_1.busboyExceptions.MULTIPART_MALFORMED_PART_HEADER:
        case multer_constants_1.busboyExceptions.MULTIPART_UNEXPECTED_END_OF_FORM:
        case multer_constants_1.busboyExceptions.MULTIPART_UNEXPECTED_END_OF_FILE:
            return new common_1.BadRequestException(`Multipart: ${error.message}`);
    }
    return error;
}

}, function(modId) { var map = {"./multer.constants":1784796701931}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701931, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.busboyExceptions = exports.multerExceptions = void 0;
exports.multerExceptions = {
    // from https://github.com/expressjs/multer/blob/master/lib/multer-error.js
    LIMIT_PART_COUNT: 'Too many parts',
    LIMIT_FILE_SIZE: 'File too large',
    LIMIT_FILE_COUNT: 'Too many files',
    LIMIT_FIELD_KEY: 'Field name too long',
    LIMIT_FIELD_VALUE: 'Field value too long',
    LIMIT_FIELD_COUNT: 'Too many fields',
    LIMIT_UNEXPECTED_FILE: 'Unexpected field',
    MISSING_FIELD_NAME: 'Field name missing',
};
exports.busboyExceptions = {
    // from https://github.com/mscdex/busboy/blob/master/lib/types/multipart.js
    MULTIPART_BOUNDARY_NOT_FOUND: 'Multipart: Boundary not found',
    MULTIPART_MALFORMED_PART_HEADER: 'Malformed part header',
    MULTIPART_UNEXPECTED_END_OF_FORM: 'Unexpected end of form',
    MULTIPART_UNEXPECTED_END_OF_FILE: 'Unexpected end of file',
};

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701932, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FileFieldsInterceptor = FileFieldsInterceptor;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const multer = require("multer");
const files_constants_1 = require("../files.constants");
const multer_utils_1 = require("../multer/multer.utils");
/**
 * @param uploadFields
 * @param localOptions
 * @publicApi
 */
function FileFieldsInterceptor(uploadFields, localOptions) {
    let MixinInterceptor = class MixinInterceptor {
        constructor(options = {}) {
            this.multer = multer({
                ...options,
                ...localOptions,
            });
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            await new Promise((resolve, reject) => this.multer.fields(uploadFields)(ctx.getRequest(), ctx.getResponse(), (err) => {
                if (err) {
                    const error = (0, multer_utils_1.transformException)(err);
                    return reject(error);
                }
                resolve();
            }));
            return next.handle();
        }
    };
    MixinInterceptor = tslib_1.__decorate([
        tslib_1.__param(0, (0, common_1.Optional)()),
        tslib_1.__param(0, (0, common_1.Inject)(files_constants_1.MULTER_MODULE_OPTIONS)),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], MixinInterceptor);
    const Interceptor = (0, common_1.mixin)(MixinInterceptor);
    return Interceptor;
}

}, function(modId) { var map = {"../files.constants":1784796701929,"../multer/multer.utils":1784796701930}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701933, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FileInterceptor = FileInterceptor;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const multer = require("multer");
const files_constants_1 = require("../files.constants");
const multer_utils_1 = require("../multer/multer.utils");
/**
 * @param fieldName
 * @param localOptions
 *
 * @publicApi
 */
function FileInterceptor(fieldName, localOptions) {
    let MixinInterceptor = class MixinInterceptor {
        constructor(options = {}) {
            this.multer = multer({
                ...options,
                ...localOptions,
            });
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            await new Promise((resolve, reject) => this.multer.single(fieldName)(ctx.getRequest(), ctx.getResponse(), (err) => {
                if (err) {
                    const error = (0, multer_utils_1.transformException)(err);
                    return reject(error);
                }
                resolve();
            }));
            return next.handle();
        }
    };
    MixinInterceptor = tslib_1.__decorate([
        tslib_1.__param(0, (0, common_1.Optional)()),
        tslib_1.__param(0, (0, common_1.Inject)(files_constants_1.MULTER_MODULE_OPTIONS)),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], MixinInterceptor);
    const Interceptor = (0, common_1.mixin)(MixinInterceptor);
    return Interceptor;
}

}, function(modId) { var map = {"../files.constants":1784796701929,"../multer/multer.utils":1784796701930}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701934, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesInterceptor = FilesInterceptor;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const multer = require("multer");
const files_constants_1 = require("../files.constants");
const multer_utils_1 = require("../multer/multer.utils");
/**
 *
 * @param fieldName
 * @param maxCount
 * @param localOptions
 *
 * @publicApi
 */
function FilesInterceptor(fieldName, maxCount, localOptions) {
    let MixinInterceptor = class MixinInterceptor {
        constructor(options = {}) {
            this.multer = multer({
                ...options,
                ...localOptions,
            });
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            await new Promise((resolve, reject) => this.multer.array(fieldName, maxCount)(ctx.getRequest(), ctx.getResponse(), (err) => {
                if (err) {
                    const error = (0, multer_utils_1.transformException)(err);
                    return reject(error);
                }
                resolve();
            }));
            return next.handle();
        }
    };
    MixinInterceptor = tslib_1.__decorate([
        tslib_1.__param(0, (0, common_1.Optional)()),
        tslib_1.__param(0, (0, common_1.Inject)(files_constants_1.MULTER_MODULE_OPTIONS)),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], MixinInterceptor);
    const Interceptor = (0, common_1.mixin)(MixinInterceptor);
    return Interceptor;
}

}, function(modId) { var map = {"../files.constants":1784796701929,"../multer/multer.utils":1784796701930}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701935, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.NoFilesInterceptor = NoFilesInterceptor;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const multer = require("multer");
const files_constants_1 = require("../files.constants");
const multer_utils_1 = require("../multer/multer.utils");
/**
 *
 * @param localOptions
 * @publicApi
 */
function NoFilesInterceptor(localOptions) {
    let MixinInterceptor = class MixinInterceptor {
        constructor(options = {}) {
            this.multer = multer({
                ...options,
                ...localOptions,
            });
        }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            await new Promise((resolve, reject) => this.multer.none()(ctx.getRequest(), ctx.getResponse(), (err) => {
                if (err) {
                    const error = (0, multer_utils_1.transformException)(err);
                    return reject(error);
                }
                resolve();
            }));
            return next.handle();
        }
    };
    MixinInterceptor = tslib_1.__decorate([
        tslib_1.__param(0, (0, common_1.Optional)()),
        tslib_1.__param(0, (0, common_1.Inject)(files_constants_1.MULTER_MODULE_OPTIONS)),
        tslib_1.__metadata("design:paramtypes", [Object])
    ], MixinInterceptor);
    const Interceptor = (0, common_1.mixin)(MixinInterceptor);
    return Interceptor;
}

}, function(modId) { var map = {"../files.constants":1784796701929,"../multer/multer.utils":1784796701930}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701936, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./files-upload-module.interface"), exports);

}, function(modId) { var map = {"./files-upload-module.interface":1784796701937}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701937, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701938, function(require, module, exports) {

var MulterModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MulterModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const random_string_generator_util_1 = require("@nestjs/common/utils/random-string-generator.util");
const files_constants_1 = require("./files.constants");
const multer_constants_1 = require("./multer.constants");
/**
 * @publicApi
 */
let MulterModule = MulterModule_1 = class MulterModule {
    static register(options = {}) {
        return {
            module: MulterModule_1,
            providers: [
                { provide: files_constants_1.MULTER_MODULE_OPTIONS, useFactory: () => options },
                {
                    provide: multer_constants_1.MULTER_MODULE_ID,
                    useValue: (0, random_string_generator_util_1.randomStringGenerator)(),
                },
            ],
            exports: [files_constants_1.MULTER_MODULE_OPTIONS],
        };
    }
    static registerAsync(options) {
        return {
            module: MulterModule_1,
            imports: options.imports,
            providers: [
                ...this.createAsyncProviders(options),
                {
                    provide: multer_constants_1.MULTER_MODULE_ID,
                    useValue: (0, random_string_generator_util_1.randomStringGenerator)(),
                },
            ],
            exports: [files_constants_1.MULTER_MODULE_OPTIONS],
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: files_constants_1.MULTER_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: files_constants_1.MULTER_MODULE_OPTIONS,
            useFactory: async (optionsFactory) => optionsFactory.createMulterOptions(),
            inject: [options.useExisting || options.useClass],
        };
    }
};
exports.MulterModule = MulterModule;
exports.MulterModule = MulterModule = MulterModule_1 = tslib_1.__decorate([
    (0, common_1.Module)({})
], MulterModule);

}, function(modId) { var map = {"./files.constants":1784796701929,"./multer.constants":1784796701939}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701939, function(require, module, exports) {

Object.defineProperty(exports, "__esModule", { value: true });
exports.MULTER_MODULE_ID = void 0;
exports.MULTER_MODULE_ID = 'MULTER_MODULE_ID';

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1784796701920);
})()
//miniprogram-npm-outsideDeps=["tslib","./express-adapter","@nestjs/common","multer","@nestjs/common/utils/random-string-generator.util"]
//# sourceMappingURL=index.js.map