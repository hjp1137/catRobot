module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1784796701561, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
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
exports.DocNodeTransforms = exports.TSDocParser = exports.TSDocMessageId = exports.TokenSequence = exports.TokenKind = exports.Token = exports.TextRange = exports.ParserMessageLog = exports.ParserMessage = exports.ParserContext = exports.TSDocEmitter = exports.StringBuilder = exports.PlainTextEmitter = exports.ModifierTagSet = exports.StandardModifierTagSet = exports.Standardization = exports.StandardTags = exports.TSDocValidationConfiguration = exports.TSDocTagDefinition = exports.TSDocTagSyntaxKind = exports.TSDocConfiguration = exports.DocNodeManager = void 0;
var DocNodeManager_1 = require("./configuration/DocNodeManager");
Object.defineProperty(exports, "DocNodeManager", { enumerable: true, get: function () { return DocNodeManager_1.DocNodeManager; } });
var TSDocConfiguration_1 = require("./configuration/TSDocConfiguration");
Object.defineProperty(exports, "TSDocConfiguration", { enumerable: true, get: function () { return TSDocConfiguration_1.TSDocConfiguration; } });
var TSDocTagDefinition_1 = require("./configuration/TSDocTagDefinition");
Object.defineProperty(exports, "TSDocTagSyntaxKind", { enumerable: true, get: function () { return TSDocTagDefinition_1.TSDocTagSyntaxKind; } });
Object.defineProperty(exports, "TSDocTagDefinition", { enumerable: true, get: function () { return TSDocTagDefinition_1.TSDocTagDefinition; } });
var TSDocValidationConfiguration_1 = require("./configuration/TSDocValidationConfiguration");
Object.defineProperty(exports, "TSDocValidationConfiguration", { enumerable: true, get: function () { return TSDocValidationConfiguration_1.TSDocValidationConfiguration; } });
var StandardTags_1 = require("./details/StandardTags");
Object.defineProperty(exports, "StandardTags", { enumerable: true, get: function () { return StandardTags_1.StandardTags; } });
var Standardization_1 = require("./details/Standardization");
Object.defineProperty(exports, "Standardization", { enumerable: true, get: function () { return Standardization_1.Standardization; } });
var StandardModifierTagSet_1 = require("./details/StandardModifierTagSet");
Object.defineProperty(exports, "StandardModifierTagSet", { enumerable: true, get: function () { return StandardModifierTagSet_1.StandardModifierTagSet; } });
var ModifierTagSet_1 = require("./details/ModifierTagSet");
Object.defineProperty(exports, "ModifierTagSet", { enumerable: true, get: function () { return ModifierTagSet_1.ModifierTagSet; } });
var PlainTextEmitter_1 = require("./emitters/PlainTextEmitter");
Object.defineProperty(exports, "PlainTextEmitter", { enumerable: true, get: function () { return PlainTextEmitter_1.PlainTextEmitter; } });
var StringBuilder_1 = require("./emitters/StringBuilder");
Object.defineProperty(exports, "StringBuilder", { enumerable: true, get: function () { return StringBuilder_1.StringBuilder; } });
var TSDocEmitter_1 = require("./emitters/TSDocEmitter");
Object.defineProperty(exports, "TSDocEmitter", { enumerable: true, get: function () { return TSDocEmitter_1.TSDocEmitter; } });
__exportStar(require("./nodes"), exports);
var ParserContext_1 = require("./parser/ParserContext");
Object.defineProperty(exports, "ParserContext", { enumerable: true, get: function () { return ParserContext_1.ParserContext; } });
var ParserMessage_1 = require("./parser/ParserMessage");
Object.defineProperty(exports, "ParserMessage", { enumerable: true, get: function () { return ParserMessage_1.ParserMessage; } });
var ParserMessageLog_1 = require("./parser/ParserMessageLog");
Object.defineProperty(exports, "ParserMessageLog", { enumerable: true, get: function () { return ParserMessageLog_1.ParserMessageLog; } });
var TextRange_1 = require("./parser/TextRange");
Object.defineProperty(exports, "TextRange", { enumerable: true, get: function () { return TextRange_1.TextRange; } });
var Token_1 = require("./parser/Token");
Object.defineProperty(exports, "Token", { enumerable: true, get: function () { return Token_1.Token; } });
Object.defineProperty(exports, "TokenKind", { enumerable: true, get: function () { return Token_1.TokenKind; } });
var TokenSequence_1 = require("./parser/TokenSequence");
Object.defineProperty(exports, "TokenSequence", { enumerable: true, get: function () { return TokenSequence_1.TokenSequence; } });
var TSDocMessageId_1 = require("./parser/TSDocMessageId");
Object.defineProperty(exports, "TSDocMessageId", { enumerable: true, get: function () { return TSDocMessageId_1.TSDocMessageId; } });
var TSDocParser_1 = require("./parser/TSDocParser");
Object.defineProperty(exports, "TSDocParser", { enumerable: true, get: function () { return TSDocParser_1.TSDocParser; } });
var DocNodeTransforms_1 = require("./transforms/DocNodeTransforms");
Object.defineProperty(exports, "DocNodeTransforms", { enumerable: true, get: function () { return DocNodeTransforms_1.DocNodeTransforms; } });
//# sourceMappingURL=index.js.map
}, function(modId) {var map = {"./configuration/DocNodeManager":1784796701562,"./configuration/TSDocConfiguration":1784796701564,"./configuration/TSDocTagDefinition":1784796701566,"./configuration/TSDocValidationConfiguration":1784796701568,"./details/StandardTags":1784796701565,"./details/Standardization":1784796701567,"./details/StandardModifierTagSet":1784796701572,"./details/ModifierTagSet":1784796701573,"./emitters/PlainTextEmitter":1784796701574,"./emitters/StringBuilder":1784796701585,"./emitters/TSDocEmitter":1784796701586,"./nodes":1784796701575,"./parser/ParserContext":1784796701608,"./parser/ParserMessage":1784796701611,"./parser/ParserMessageLog":1784796701610,"./parser/TextRange":1784796701609,"./parser/Token":1784796701582,"./parser/TokenSequence":1784796701612,"./parser/TSDocMessageId":1784796701571,"./parser/TSDocParser":1784796701613,"./transforms/DocNodeTransforms":1784796701587}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701562, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocNodeManager = void 0;
var StringChecks_1 = require("../parser/StringChecks");
/**
 * Part of the {@link TSDocConfiguration} object.
 *
 * @remarks
 * If you define your own custom subclasses of `DocNode`, they must be registered with the `DocNodeManager`.
 * Use {@link DocNodeManager.registerAllowableChildren} to specify which {@link DocNodeContainer} subclasses
 * are allowed to contain your nodes.
 */
var DocNodeManager = /** @class */ (function () {
    function DocNodeManager() {
        this._docNodeDefinitionsByKind = new Map();
        this._docNodeDefinitionsByConstructor = new Map();
    }
    /**
     * Registers a list of {@link IDocNodeDefinition} objects to be used with the associated
     * {@link TSDocConfiguration} object.
     */
    DocNodeManager.prototype.registerDocNodes = function (packageName, definitions) {
        var packageNameError = StringChecks_1.StringChecks.explainIfInvalidPackageName(packageName);
        if (packageNameError) {
            throw new Error('Invalid NPM package name: ' + packageNameError);
        }
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var definition = definitions_1[_i];
            if (!DocNodeManager._nodeKindRegExp.test(definition.docNodeKind)) {
                throw new Error("The DocNode kind ".concat(JSON.stringify(definition.docNodeKind), " is not a valid identifier.") +
                    " It must start with an underscore or letter, and be comprised of letters, numbers, and underscores");
            }
            var existingDefinition = this._docNodeDefinitionsByKind.get(definition.docNodeKind);
            if (existingDefinition !== undefined) {
                throw new Error("The DocNode kind \"".concat(definition.docNodeKind, "\" was already registered") +
                    " by ".concat(existingDefinition.packageName));
            }
            existingDefinition = this._docNodeDefinitionsByConstructor.get(definition.constructor);
            if (existingDefinition !== undefined) {
                throw new Error("This DocNode constructor was already registered by ".concat(existingDefinition.packageName) +
                    " as ".concat(existingDefinition.docNodeKind));
            }
            var newDefinition = {
                docNodeKind: definition.docNodeKind,
                constructor: definition.constructor,
                packageName: packageName,
                allowedChildKinds: new Set()
            };
            this._docNodeDefinitionsByKind.set(definition.docNodeKind, newDefinition);
            this._docNodeDefinitionsByConstructor.set(definition.constructor, newDefinition);
        }
    };
    /**
     * Reports an error if the specified DocNode kind has not been registered.
     */
    DocNodeManager.prototype.throwIfNotRegisteredKind = function (docNodeKind) {
        if (!this._docNodeDefinitionsByKind.has(docNodeKind)) {
            throw new Error("The DocNode kind \"".concat(docNodeKind, "\" was not registered with this TSDocConfiguration"));
        }
    };
    /**
     * For the given parent DocNode kind, registers the specified DocNode kinds as being allowable children of
     * the parent.
     *
     * @remarks
     * To prevent mistakes, `DocNodeContainer` will report an error if you try to add node that was not registered
     * as an allowable child of the container.
     */
    DocNodeManager.prototype.registerAllowableChildren = function (parentKind, childKinds) {
        var parentDefinition = this._getDefinition(parentKind);
        for (var _i = 0, childKinds_1 = childKinds; _i < childKinds_1.length; _i++) {
            var childKind = childKinds_1[_i];
            this._getDefinition(childKind);
            parentDefinition.allowedChildKinds.add(childKind);
        }
    };
    /**
     * Returns true if the specified DocNode kind has been registered as an allowable child of the specified
     * parent DocNode kind.
     */
    DocNodeManager.prototype.isAllowedChild = function (parentKind, childKind) {
        var parentDefinition = this._getDefinition(parentKind);
        return parentDefinition.allowedChildKinds.has(childKind);
    };
    DocNodeManager.prototype._getDefinition = function (docNodeKind) {
        var definition = this._docNodeDefinitionsByKind.get(docNodeKind);
        if (definition === undefined) {
            throw new Error("The DocNode kind \"".concat(docNodeKind, "\" was not registered with this TSDocConfiguration"));
        }
        return definition;
    };
    // Matches an ASCII TypeScript-style identifier.
    //
    // Example: "_myIdentifier99"
    DocNodeManager._nodeKindRegExp = /^[_a-z][_a-z0-9]*$/i;
    return DocNodeManager;
}());
exports.DocNodeManager = DocNodeManager;
//# sourceMappingURL=DocNodeManager.js.map
}, function(modId) { var map = {"../parser/StringChecks":1784796701563}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701563, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringChecks = void 0;
/**
 * Helpers for validating various text string formats.
 */
var StringChecks = /** @class */ (function () {
    function StringChecks() {
    }
    /**
     * Tests whether the input string is a valid TSDoc tag name; if not, returns an error message.
     * TSDoc tag names start with an at-sign ("@") followed by ASCII letters using
     * "camelCase" capitalization.
     */
    StringChecks.explainIfInvalidTSDocTagName = function (tagName) {
        if (tagName[0] !== '@') {
            return 'A TSDoc tag name must start with an "@" symbol';
        }
        if (!StringChecks._tsdocTagNameRegExp.test(tagName)) {
            return 'A TSDoc tag name must start with a letter and contain only letters and numbers';
        }
        return undefined;
    };
    /**
     * Throws an exception if the input string is not a valid TSDoc tag name.
     * TSDoc tag names start with an at-sign ("@") followed by ASCII letters using
     * "camelCase" capitalization.
     */
    StringChecks.validateTSDocTagName = function (tagName) {
        var explanation = StringChecks.explainIfInvalidTSDocTagName(tagName);
        if (explanation) {
            throw new Error(explanation);
        }
    };
    /**
     * Tests whether the input string is a URL form supported inside an "@link" tag; if not,
     * returns an error message.
     */
    StringChecks.explainIfInvalidLinkUrl = function (url) {
        if (url.length === 0) {
            return 'The URL cannot be empty';
        }
        if (!StringChecks._urlSchemeRegExp.test(url)) {
            return ('An @link URL must begin with a scheme comprised only of letters and numbers followed by "://".' +
                ' (For general URLs, use an HTML "<a>" tag instead.)');
        }
        if (!StringChecks._urlSchemeAfterRegExp.test(url)) {
            return 'An @link URL must have at least one character after "://"';
        }
        return undefined;
    };
    /**
     * Tests whether the input string is a valid HTML element or attribute name.
     */
    StringChecks.explainIfInvalidHtmlName = function (htmlName) {
        if (!StringChecks._htmlNameRegExp.test(htmlName)) {
            return 'An HTML name must be an ASCII letter followed by zero or more letters, digits, or hyphens';
        }
        return undefined;
    };
    /**
     * Throws an exception if the input string is a not valid HTML element or attribute name.
     */
    StringChecks.validateHtmlName = function (htmlName) {
        var explanation = StringChecks.explainIfInvalidHtmlName(htmlName);
        if (explanation) {
            throw new Error(explanation);
        }
    };
    /**
     * Tests whether the input string is a valid NPM package name.
     */
    StringChecks.explainIfInvalidPackageName = function (packageName) {
        if (packageName.length === 0) {
            return 'The package name cannot be an empty string';
        }
        if (!StringChecks._validPackageNameRegExp.test(packageName)) {
            return "The package name ".concat(JSON.stringify(packageName), " is not a valid package name");
        }
        return undefined;
    };
    /**
     * Tests whether the input string is a valid declaration reference import path.
     */
    StringChecks.explainIfInvalidImportPath = function (importPath, prefixedByPackageName) {
        if (importPath.length > 0) {
            if (importPath.indexOf('//') >= 0) {
                return 'An import path must not contain "//"';
            }
            if (importPath[importPath.length - 1] === '/') {
                return 'An import path must not end with "/"';
            }
            if (!prefixedByPackageName) {
                if (importPath[0] === '/') {
                    return 'An import path must not start with "/" unless prefixed by a package name';
                }
            }
        }
        return undefined;
    };
    /**
     * Returns true if the input string is a TSDoc system selector.
     */
    StringChecks.isSystemSelector = function (selector) {
        return StringChecks._systemSelectors.has(selector);
    };
    /**
     * Tests whether the input string is a valid ECMAScript identifier.
     * A precise check is extremely complicated and highly dependent on the standard version
     * and how faithfully the interpreter implements it, so here we use a conservative heuristic.
     */
    StringChecks.explainIfInvalidUnquotedIdentifier = function (identifier) {
        if (identifier.length === 0) {
            return 'The identifier cannot be an empty string';
        }
        if (StringChecks._identifierBadCharRegExp.test(identifier)) {
            return 'The identifier cannot non-word characters';
        }
        if (StringChecks._identifierNumberStartRegExp.test(identifier)) {
            return 'The identifier must not start with a number';
        }
        return undefined;
    };
    /**
     * Tests whether the input string can be used without quotes as a member identifier in a declaration reference.
     * If not, it should be enclosed in quotes.
     */
    StringChecks.explainIfInvalidUnquotedMemberIdentifier = function (identifier) {
        var explanation = StringChecks.explainIfInvalidUnquotedIdentifier(identifier);
        if (explanation !== undefined) {
            return explanation;
        }
        if (StringChecks.isSystemSelector(identifier)) {
            // We do this to avoid confusion about the declaration reference syntax rules.
            // For example if someone were to see "MyClass.(static:instance)" it would be unclear which
            // side the colon is the selector.
            return "The identifier \"".concat(identifier, "\" must be quoted because it is a TSDoc system selector name");
        }
        return undefined;
    };
    StringChecks._tsdocTagNameRegExp = /^@[a-z][a-z0-9]*$/i;
    StringChecks._urlSchemeRegExp = /^[a-z][a-z0-9]*\:\/\//i;
    StringChecks._urlSchemeAfterRegExp = /^[a-z][a-z0-9]*\:\/\/./i;
    // HTML element definitions:
    // https://spec.commonmark.org/0.29/#tag-name
    // https://www.w3.org/TR/html5/syntax.html#tag-name
    // https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
    //
    // We use the CommonMark spec:
    // "A tag name consists of an ASCII letter followed by zero or more ASCII letters, digits, or hyphens (-)."
    StringChecks._htmlNameRegExp = /^[a-z]+[a-z0-9\-]*$/i;
    // Note: In addition to letters, numbers, underscores, and dollar signs, modern ECMAScript
    // also allows Unicode categories such as letters, combining marks, digits, and connector punctuation.
    // These are mostly supported in all environments except IE11, so if someone wants it, we would accept
    // a PR to allow them (although the test surface might be somewhat large).
    StringChecks._identifierBadCharRegExp = /[^a-z0-9_$]/i;
    // Identifiers most not start with a number.
    StringChecks._identifierNumberStartRegExp = /^[0-9]/;
    // For detailed notes about NPM package name syntax, see:
    // tslint:disable-next-line:max-line-length
    // https://github.com/Microsoft/web-build-tools/blob/a417ca25c63aca31dba43a34d39cc9cd529b9c78/libraries/node-core-library/src/PackageName.ts
    StringChecks._validPackageNameRegExp = /^(?:@[a-z0-9\-_\.]+\/)?[a-z0-9\-_\.]+$/i;
    StringChecks._systemSelectors = new Set([
        // For classes:
        'instance',
        'static',
        'constructor',
        // For merged declarations:
        'class',
        'enum',
        'function',
        'interface',
        'namespace',
        'type',
        'variable'
    ]);
    return StringChecks;
}());
exports.StringChecks = StringChecks;
//# sourceMappingURL=StringChecks.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701564, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSDocConfiguration = void 0;
var StandardTags_1 = require("../details/StandardTags");
var TSDocValidationConfiguration_1 = require("./TSDocValidationConfiguration");
var DocNodeManager_1 = require("./DocNodeManager");
var BuiltInDocNodes_1 = require("../nodes/BuiltInDocNodes");
var TSDocMessageId_1 = require("../parser/TSDocMessageId");
/**
 * Configuration for the TSDocParser.
 */
var TSDocConfiguration = /** @class */ (function () {
    function TSDocConfiguration() {
        this._tagDefinitions = [];
        this._tagDefinitionsByName = new Map();
        this._supportedTagDefinitions = new Set();
        this._validation = new TSDocValidationConfiguration_1.TSDocValidationConfiguration();
        this._docNodeManager = new DocNodeManager_1.DocNodeManager();
        this._supportedHtmlElements = new Set();
        this.clear(false);
        // Register the built-in node kinds
        BuiltInDocNodes_1.BuiltInDocNodes.register(this);
    }
    /**
     * Resets the `TSDocConfiguration` object to its initial empty state.
     * @param noStandardTags - The `TSDocConfiguration` constructor normally adds definitions for the
     * standard TSDoc tags.  Set `noStandardTags` to true for a completely empty `tagDefinitions` collection.
     */
    TSDocConfiguration.prototype.clear = function (noStandardTags) {
        if (noStandardTags === void 0) { noStandardTags = false; }
        this._tagDefinitions.length = 0;
        this._tagDefinitionsByName.clear();
        this._supportedTagDefinitions.clear();
        this._validation.ignoreUndefinedTags = false;
        this._validation.reportUnsupportedTags = false;
        this._validation.reportUnsupportedHtmlElements = false;
        this._supportedHtmlElements.clear();
        if (!noStandardTags) {
            // Define all the standard tags
            this.addTagDefinitions(StandardTags_1.StandardTags.allDefinitions);
        }
    };
    Object.defineProperty(TSDocConfiguration.prototype, "tagDefinitions", {
        /**
         * The TSDoc tags that are defined in this configuration.
         *
         * @remarks
         * The subset of "supported" tags is tracked by {@link TSDocConfiguration.supportedTagDefinitions}.
         */
        get: function () {
            return this._tagDefinitions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TSDocConfiguration.prototype, "supportedTagDefinitions", {
        /**
         * Returns the subset of {@link TSDocConfiguration.tagDefinitions}
         * that are supported in this configuration.
         *
         * @remarks
         * This property is only used when
         * {@link TSDocValidationConfiguration.reportUnsupportedTags} is enabled.
         */
        get: function () {
            var _this = this;
            return this.tagDefinitions.filter(function (x) { return _this.isTagSupported(x); });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TSDocConfiguration.prototype, "validation", {
        /**
         * Enable/disable validation checks performed by the parser.
         */
        get: function () {
            return this._validation;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TSDocConfiguration.prototype, "supportedHtmlElements", {
        /**
         * The HTML element names that are supported in this configuration. Used in conjunction with the `reportUnsupportedHtmlElements` setting.
         */
        get: function () {
            return Array.from(this._supportedHtmlElements.values());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TSDocConfiguration.prototype, "docNodeManager", {
        /**
         * Register custom DocNode subclasses.
         */
        get: function () {
            return this._docNodeManager;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Return the tag that was defined with the specified name, or undefined
     * if not found.
     */
    TSDocConfiguration.prototype.tryGetTagDefinition = function (tagName) {
        return this._tagDefinitionsByName.get(tagName.toUpperCase());
    };
    /**
     * Return the tag that was defined with the specified name, or undefined
     * if not found.
     */
    TSDocConfiguration.prototype.tryGetTagDefinitionWithUpperCase = function (alreadyUpperCaseTagName) {
        return this._tagDefinitionsByName.get(alreadyUpperCaseTagName);
    };
    /**
     * Define a new TSDoc tag to be recognized by the TSDocParser, and mark it as unsupported.
     * Use {@link TSDocConfiguration.setSupportForTag} to mark it as supported.
     *
     * @remarks
     * If a tag is "defined" this means that the parser recognizes it and understands its syntax.
     * Whereas if a tag is "supported", this means it is defined AND the application implements the tag.
     */
    TSDocConfiguration.prototype.addTagDefinition = function (tagDefinition) {
        var existingDefinition = this._tagDefinitionsByName.get(tagDefinition.tagNameWithUpperCase);
        if (existingDefinition === tagDefinition) {
            return;
        }
        if (existingDefinition) {
            throw new Error("A tag is already defined using the name ".concat(existingDefinition.tagName));
        }
        this._tagDefinitions.push(tagDefinition);
        this._tagDefinitionsByName.set(tagDefinition.tagNameWithUpperCase, tagDefinition);
    };
    /**
     * Calls {@link TSDocConfiguration.addTagDefinition} for a list of definitions,
     * and optionally marks them as supported.
     * @param tagDefinitions - the definitions to be added
     * @param supported - if specified, calls the {@link TSDocConfiguration.setSupportForTag}
     *    method to mark the definitions as supported or unsupported
     */
    TSDocConfiguration.prototype.addTagDefinitions = function (tagDefinitions, supported) {
        for (var _i = 0, tagDefinitions_1 = tagDefinitions; _i < tagDefinitions_1.length; _i++) {
            var tagDefinition = tagDefinitions_1[_i];
            this.addTagDefinition(tagDefinition);
            if (supported !== undefined) {
                this.setSupportForTag(tagDefinition, supported);
            }
        }
    };
    /**
     * Returns true if the tag is supported in this configuration.
     */
    TSDocConfiguration.prototype.isTagSupported = function (tagDefinition) {
        this._requireTagToBeDefined(tagDefinition);
        return this._supportedTagDefinitions.has(tagDefinition);
    };
    /**
     * Specifies whether the tag definition is supported in this configuration.
     * The parser may issue warnings for unsupported tags.
     *
     * @remarks
     * If a tag is "defined" this means that the parser recognizes it and understands its syntax.
     * Whereas if a tag is "supported", this means it is defined AND the application implements the tag.
     *
     * This function automatically sets {@link TSDocValidationConfiguration.reportUnsupportedTags}
     * to true.
     */
    TSDocConfiguration.prototype.setSupportForTag = function (tagDefinition, supported) {
        this._requireTagToBeDefined(tagDefinition);
        if (supported) {
            this._supportedTagDefinitions.add(tagDefinition);
        }
        else {
            this._supportedTagDefinitions.delete(tagDefinition);
        }
        this.validation.reportUnsupportedTags = true;
    };
    /**
     * Specifies whether the tag definition is supported in this configuration.
     * This operation sets {@link TSDocValidationConfiguration.reportUnsupportedTags} to `true`.
     *
     * @remarks
     * The parser may issue warnings for unsupported tags.
     * If a tag is "defined" this means that the parser recognizes it and understands its syntax.
     * Whereas if a tag is "supported", this means it is defined AND the application implements the tag.
     */
    TSDocConfiguration.prototype.setSupportForTags = function (tagDefinitions, supported) {
        for (var _i = 0, tagDefinitions_2 = tagDefinitions; _i < tagDefinitions_2.length; _i++) {
            var tagDefinition = tagDefinitions_2[_i];
            this.setSupportForTag(tagDefinition, supported);
        }
    };
    /**
     * Assigns the `supportedHtmlElements` property, replacing any previous elements.
     * This operation sets {@link TSDocValidationConfiguration.reportUnsupportedHtmlElements} to `true`.
     */
    TSDocConfiguration.prototype.setSupportedHtmlElements = function (htmlTags) {
        this._supportedHtmlElements.clear();
        this._validation.reportUnsupportedHtmlElements = true;
        for (var _i = 0, htmlTags_1 = htmlTags; _i < htmlTags_1.length; _i++) {
            var htmlTag = htmlTags_1[_i];
            this._supportedHtmlElements.add(htmlTag);
        }
    };
    /**
     * Returns true if the html element is supported in this configuration.
     */
    TSDocConfiguration.prototype.isHtmlElementSupported = function (htmlTag) {
        return this._supportedHtmlElements.has(htmlTag);
    };
    /**
     * Returns true if the specified {@link TSDocMessageId} string is implemented by this release of the TSDoc parser.
     * This can be used to detect misspelled identifiers.
     *
     * @privateRemarks
     *
     * Why this API is associated with TSDocConfiguration:  In the future, if we enable support for custom extensions
     * of the TSDoc parser, we may provide a way to register custom message identifiers.
     */
    TSDocConfiguration.prototype.isKnownMessageId = function (messageId) {
        return TSDocMessageId_1.allTsdocMessageIdsSet.has(messageId);
    };
    Object.defineProperty(TSDocConfiguration.prototype, "allTsdocMessageIds", {
        /**
         * Returns the list of {@link TSDocMessageId} strings that are implemented by this release of the TSDoc parser.
         *
         * @privateRemarks
         *
         * Why this API is associated with TSDocConfiguration:  In the future, if we enable support for custom extensions
         * of the TSDoc parser, we may provide a way to register custom message identifiers.
         */
        get: function () {
            return TSDocMessageId_1.allTsdocMessageIds;
        },
        enumerable: false,
        configurable: true
    });
    TSDocConfiguration.prototype._requireTagToBeDefined = function (tagDefinition) {
        var matching = this._tagDefinitionsByName.get(tagDefinition.tagNameWithUpperCase);
        if (matching) {
            if (matching === tagDefinition) {
                return;
            }
        }
        throw new Error('The specified TSDocTagDefinition is not defined for this TSDocConfiguration');
    };
    return TSDocConfiguration;
}());
exports.TSDocConfiguration = TSDocConfiguration;
//# sourceMappingURL=TSDocConfiguration.js.map
}, function(modId) { var map = {"../details/StandardTags":1784796701565,"./TSDocValidationConfiguration":1784796701568,"./DocNodeManager":1784796701562,"../nodes/BuiltInDocNodes":1784796701569,"../parser/TSDocMessageId":1784796701571}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701565, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardTags = void 0;
var TSDocTagDefinition_1 = require("../configuration/TSDocTagDefinition");
var Standardization_1 = require("./Standardization");
/**
 * Tags whose meaning is defined by the TSDoc standard.
 */
var StandardTags = /** @class */ (function () {
    function StandardTags() {
    }
    StandardTags._defineTag = function (parameters) {
        return new TSDocTagDefinition_1.TSDocTagDefinition(parameters);
    };
    /**
     * (Discretionary)
     *
     * Suggested meaning: Designates that an API item's release stage is "alpha".
     * It is intended to be used by third-party developers eventually, but has not
     * yet been released.  The tooling may trim the declaration from a public release.
     *
     * @remarks
     * Example implementations: API Extractor
     */
    StandardTags.alpha = StandardTags._defineTag({
        tagName: '@alpha',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Discretionary
    });
    /**
     * (Discretionary)
     *
     * Suggested meaning: Designates that an API item's release stage is "beta".
     * It has been released to third-party developers experimentally for the purpose of
     * collecting feedback.  The API should not be used in production, because its contract may
     * change without notice.  The tooling may trim the declaration from a public release,
     * but may include it in a developer preview release.
     *
     * @remarks
     * Example implementations: API Extractor
     *
     * Synonyms: `@experimental`
     */
    StandardTags.beta = StandardTags._defineTag({
        tagName: '@beta',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Discretionary
    });
    /**
     * (Extended)
     *
     * ECMAScript decorators are sometimes an important part of an API contract.
     * However, today the TypeScript compiler does not represent decorators in the
     * .d.ts output files used by API consumers.  The `@decorator` tag provides a workaround,
     * enabling a decorator expressions to be quoted in a doc comment.
     *
     * @example
     * ```ts
     * class Book {
     *   /**
     *    * The title of the book.
     *    * @decorator `@jsonSerialized`
     *    * @decorator `@jsonFormat(JsonFormats.Url)`
     *    *
     *+/
     *   @jsonSerialized
     *   @jsonFormat(JsonFormats.Url)
     *   public website: string;
     * }
     * ```
     */
    StandardTags.decorator = StandardTags._defineTag({
        tagName: '@decorator',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        allowMultiple: true,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Extended)
     *
     * This block tag is used to document the default value for a field or property,
     * if a value is not assigned explicitly.
     *
     * @remarks
     * This tag should only be used with fields or properties that are members of a class or interface.
     */
    StandardTags.defaultValue = StandardTags._defineTag({
        tagName: '@defaultValue',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Core)
     *
     * This block tag communicates that an API item is no longer supported and may be removed
     * in a future release.  The `@deprecated` tag is followed by a sentence describing
     * the recommended alternative.  It recursively applies to members of the container.
     * For example, if a class is deprecated, then so are all of its members.
     */
    StandardTags.deprecated = StandardTags._defineTag({
        tagName: '@deprecated',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        standardization: Standardization_1.Standardization.Core
    });
    /**
     * (Extended)
     *
     * When applied to a class or interface property, this indicates that the property
     * returns an event object that event handlers can be attached to.  The event-handling
     * API is implementation-defined, but typically the property return type would be a class
     * with members such as `addHandler()` and `removeHandler()`.  A documentation tool can
     * display such properties under an "Events" heading instead of the usual "Properties" heading.
     */
    StandardTags.eventProperty = StandardTags._defineTag({
        tagName: '@eventProperty',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Extended)
     *
     * Indicates a documentation section that should be presented as an example
     * illustrating how to use the API.  It may include a code sample.
     */
    StandardTags.example = StandardTags._defineTag({
        tagName: '@example',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        allowMultiple: true,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Discretionary)
     *
     * Suggested meaning:  Same semantics as `@beta`, but used by tools that don't support
     * an `@alpha` release stage.
     *
     * @remarks
     * Example implementations: Angular API documenter
     *
     * Synonyms: `@beta`
     */
    StandardTags.experimental = StandardTags._defineTag({
        tagName: '@experimental',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Discretionary
    });
    /**
     * (Extended)
     *
     * This inline tag is used to automatically generate an API item's documentation by
     * copying it from another API item.  The inline tag parameter contains a reference
     * to the other item, which may be an unrelated class, or even an import from a
     * separate NPM package.
     *
     * @remarks
     * What gets copied
     *
     * The `@inheritDoc` tag does not copy the entire comment body. Only the following
     * components are copied:
     * - summary section
     * - `@remarks` block
     * - `@params` blocks
     * - `@typeParam` blocks
     * - `@returns` block
     * Other tags such as `@defaultValue` or `@example` are not copied, and need to be
     * explicitly included after the `@inheritDoc` tag.
     *
     * TODO: The notation for API item references is still being standardized.  See this issue:
     * https://github.com/microsoft/tsdoc/issues/9
     */
    StandardTags.inheritDoc = StandardTags._defineTag({
        tagName: '@inheritDoc',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.InlineTag,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Discretionary)
     *
     * Suggested meaning:  Designates that an API item is not planned to be used by
     * third-party developers.  The tooling may trim the declaration from a public release.
     * In some implementations, certain designated packages may be allowed to consume
     * internal API items, e.g. because the packages are components of the same product.
     *
     * @remarks
     * Example implementations: API Extractor
     */
    StandardTags.internal = StandardTags._defineTag({
        tagName: '@internal',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Discretionary
    });
    /**
     * (Core)
     *
     * The `{@label}` inline tag is used to label a declaration, so that it can be referenced
     * using a selector in the TSDoc declaration reference notation.
     *
     * @remarks
     * TODO: The `{@label}` notation is still being standardized.  See this issue:
     * https://github.com/microsoft/tsdoc/issues/9
     */
    StandardTags.label = StandardTags._defineTag({
        tagName: '@label',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.InlineTag,
        standardization: Standardization_1.Standardization.Core
    });
    /**
     * (Core)
     *
     * The `{@link}` inline tag is used to create hyperlinks to other pages in a
     * documentation system or general internet URLs.  In particular, it supports
     * expressions for referencing API items.
     *
     * @remarks
     * TODO: The `{@link}` notation is still being standardized.  See this issue:
     * https://github.com/microsoft/tsdoc/issues/9
     */
    StandardTags.link = StandardTags._defineTag({
        tagName: '@link',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.InlineTag,
        allowMultiple: true,
        standardization: Standardization_1.Standardization.Core
    });
    /**
     * (Extended)
     *
     * This modifier has similar semantics to the `override` keyword in C# or Java.
     * For a member function or property, explicitly indicates that this definition
     * is overriding (i.e. redefining) the definition inherited from the base class.
     * The base class definition would normally be marked as `virtual`.
     *
     * @remarks
     * A documentation tool may enforce that the `@virtual`, `@override`, and/or `@sealed`
     * modifiers are consistently applied, but this is not required by the TSDoc standard.
     */
    StandardTags.override = StandardTags._defineTag({
        tagName: '@override',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Core)
     *
     * Used to indicate a doc comment that describes an entire NPM package (as opposed
     * to an individual API item belonging to that package).  The `@packageDocumentation` comment
     * is found in the *.d.ts file that acts as the entry point for the package, and it
     * should be the first `/**` comment encountered in that file.  A comment containing a
     * `@packageDocumentation` tag should never be used to describe an individual API item.
     */
    StandardTags.packageDocumentation = StandardTags._defineTag({
        tagName: '@packageDocumentation',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Core
    });
    /**
     * (Core)
     *
     * Used to document a function parameter.  The `@param` tag is followed by a parameter
     * name, followed by a hyphen, followed by a description.  The TSDoc parser recognizes
     * this syntax and will extract it into a DocParamBlock node.
     */
    StandardTags.param = StandardTags._defineTag({
        tagName: '@param',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        allowMultiple: true,
        standardization: Standardization_1.Standardization.Core
    });
    /**
     * (Core)
     *
     * Starts a section of additional documentation content that is not intended for a
     * public audience.  A tool must omit this entire section from the API reference web site,
     * generated *.d.ts file, and any other outputs incorporating the content.
     */
    StandardTags.privateRemarks = StandardTags._defineTag({
        tagName: '@privateRemarks',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        standardization: Standardization_1.Standardization.Core
    });
    /**
     * (Discretionary)
     *
     * Suggested meaning: Designates that an API item's release stage is "public".
     * It has been officially released to third-party developers, and its signature is
     * guaranteed to be stable (e.g. following Semantic Versioning rules).
     *
     * @remarks
     * Example implementations: API Extractor
     */
    StandardTags.public = StandardTags._defineTag({
        tagName: '@public',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Discretionary
    });
    /**
     * (Extended)
     *
     * This modifier tag indicates that an API item should be documented as being read-only,
     * even if the TypeScript type system may indicate otherwise.  For example, suppose a
     * class property has a setter function that always throws an exception explaining that
     * the property cannot be assigned; in this situation, the `@readonly` modifier can be
     * added so that the property is shown as read-only in the documentation.
     *
     * @remarks
     * Example implementations: API Extractor
     */
    StandardTags.readonly = StandardTags._defineTag({
        tagName: '@readonly',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Core)
     *
     * The main documentation for an API item is separated into a brief "summary" section,
     * optionally followed by a more detailed "remarks" section.  On a documentation web site,
     * index pages (e.g. showing members of a class) will show only the brief summaries,
     * whereas a detail pages (e.g. describing a single member) will show the summary followed
     * by the remarks.  The `@remarks` block tag ends the summary section, and begins the
     * remarks section for a doc comment.
     */
    StandardTags.remarks = StandardTags._defineTag({
        tagName: '@remarks',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        standardization: Standardization_1.Standardization.Core
    });
    /**
     * (Core)
     *
     * Used to document the return value for a function.
     */
    StandardTags.returns = StandardTags._defineTag({
        tagName: '@returns',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        standardization: Standardization_1.Standardization.Core
    });
    /**
     * (Extended)
     *
     * This modifier has similar semantics to the `sealed` keyword in C# or Java.
     * For a class, indicates that subclasses must not inherit from the class.
     * For a member function or property, indicates that subclasses must not override
     * (i.e. redefine) the member.
     *
     * @remarks
     * A documentation tool may enforce that the `@virtual`, `@override`, and/or `@sealed`
     * modifiers are consistently applied, but this is not required by the TSDoc standard.
     */
    StandardTags.sealed = StandardTags._defineTag({
        tagName: '@sealed',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Extended)
     *
     * Used to build a list of references to an API item or other resource that may be related to the
     * current item.
     *
     * @remarks
     *
     * For example:
     *
     * ```ts
     * /**
     *  * Parses a string containing a Uniform Resource Locator (URL).
     *  * @see {@link ParsedUrl} for the returned data structure
     *  * @see {@link https://tools.ietf.org/html/rfc1738|RFC 1738}
     *  * for syntax
     *  * @see your developer SDK for code samples
     *  * @param url - the string to be parsed
     *  * @returns the parsed result
     *  &#42;/
     * function parseURL(url: string): ParsedUrl;
     * ```
     *
     * `@see` is a block tag.  Each block becomes an item in the list of references.  For example, a documentation
     * system might render the above blocks as follows:
     *
     * ```markdown
     * `function parseURL(url: string): ParsedUrl;`
     *
     * Parses a string containing a Uniform Resource Locator (URL).
     *
     * ## See Also
     * - ParsedUrl for the returned data structure
     * - RFC 1738 for syntax
     * - your developer SDK for code samples
     * ```
     *
     * NOTE: JSDoc attempts to automatically hyperlink the text immediately after `@see`.  Because this is ambiguous
     * with plain text, TSDoc instead requires an explicit `{@link}` tag to make hyperlinks.
     */
    StandardTags.see = StandardTags._defineTag({
        tagName: '@see',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Extended)
     *
     * Used to document an exception type that may be thrown by a function or property.
     *
     * @remarks
     *
     * A separate `@throws` block should be used to document each exception type.  This tag is for informational
     * purposes only, and does not restrict other types from being thrown.  It is suggested, but not required,
     * for the `@throws` block to start with a line containing only the name of the exception.
     *
     * For example:
     *
     * ```ts
     * /**
     *  * Retrieves metadata about a book from the catalog.
     *  *
     *  * @param isbnCode - the ISBN number for the book
     *  * @returns the retrieved book object
     *  *
     *  * @throws {@link IsbnSyntaxError}
     *  * This exception is thrown if the input is not a valid ISBN number.
     *  *
     *  * @throws {@link book-lib#BookNotFoundError}
     *  * Thrown if the ISBN number is valid, but no such book exists in the catalog.
     *  *
     *  * @public
     *  &#42;/
     * function fetchBookByIsbn(isbnCode: string): Book;
     * ```
     */
    StandardTags.throws = StandardTags._defineTag({
        tagName: '@throws',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        allowMultiple: true,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * (Core)
     *
     * Used to document a generic parameter.  The `@typeParam` tag is followed by a parameter
     * name, followed by a hyphen, followed by a description.  The TSDoc parser recognizes
     * this syntax and will extract it into a DocParamBlock node.
     */
    StandardTags.typeParam = StandardTags._defineTag({
        tagName: '@typeParam',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag,
        allowMultiple: true,
        standardization: Standardization_1.Standardization.Core
    });
    /**
     * (Extended)
     *
     * This modifier has similar semantics to the `virtual` keyword in C# or Java.
     * For a member function or property, explicitly indicates that subclasses may override
     * (i.e. redefine) the member.
     *
     * @remarks
     * A documentation tool may enforce that the `@virtual`, `@override`, and/or `@sealed`
     * modifiers are consistently applied, but this is not required by the TSDoc standard.
     */
    StandardTags.virtual = StandardTags._defineTag({
        tagName: '@virtual',
        syntaxKind: TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag,
        standardization: Standardization_1.Standardization.Extended
    });
    /**
     * Returns the full list of all core tags.
     */
    StandardTags.allDefinitions = [
        StandardTags.alpha,
        StandardTags.beta,
        StandardTags.defaultValue,
        StandardTags.decorator,
        StandardTags.deprecated,
        StandardTags.eventProperty,
        StandardTags.example,
        StandardTags.experimental,
        StandardTags.inheritDoc,
        StandardTags.internal,
        StandardTags.label,
        StandardTags.link,
        StandardTags.override,
        StandardTags.packageDocumentation,
        StandardTags.param,
        StandardTags.privateRemarks,
        StandardTags.public,
        StandardTags.readonly,
        StandardTags.remarks,
        StandardTags.returns,
        StandardTags.sealed,
        StandardTags.see,
        StandardTags.throws,
        StandardTags.typeParam,
        StandardTags.virtual
    ];
    return StandardTags;
}());
exports.StandardTags = StandardTags;
//# sourceMappingURL=StandardTags.js.map
}, function(modId) { var map = {"../configuration/TSDocTagDefinition":1784796701566,"./Standardization":1784796701567}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701566, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSDocTagDefinition = exports.TSDocTagSyntaxKind = void 0;
var StringChecks_1 = require("../parser/StringChecks");
var Standardization_1 = require("../details/Standardization");
/**
 * Determines the type of syntax for a TSDocTagDefinition
 */
var TSDocTagSyntaxKind;
(function (TSDocTagSyntaxKind) {
    /**
     * The tag is intended to be an inline tag.  For example: `{@link}`.
     */
    TSDocTagSyntaxKind[TSDocTagSyntaxKind["InlineTag"] = 0] = "InlineTag";
    /**
     * The tag is intended to be a block tag that starts a new documentation
     * section.  For example: `@remarks`
     */
    TSDocTagSyntaxKind[TSDocTagSyntaxKind["BlockTag"] = 1] = "BlockTag";
    /**
     * The tag is intended to be a modifier tag whose presence indicates
     * an aspect of the associated API item.  For example: `@internal`
     */
    TSDocTagSyntaxKind[TSDocTagSyntaxKind["ModifierTag"] = 2] = "ModifierTag";
})(TSDocTagSyntaxKind || (exports.TSDocTagSyntaxKind = TSDocTagSyntaxKind = {}));
/**
 * Defines a TSDoc tag that will be understood by the TSDocParser.
 */
var TSDocTagDefinition = /** @class */ (function () {
    function TSDocTagDefinition(parameters) {
        StringChecks_1.StringChecks.validateTSDocTagName(parameters.tagName);
        this.tagName = parameters.tagName;
        this.tagNameWithUpperCase = parameters.tagName.toUpperCase();
        this.syntaxKind = parameters.syntaxKind;
        this.standardization =
            parameters.standardization || Standardization_1.Standardization.None;
        this.allowMultiple = !!parameters.allowMultiple;
    }
    /**
     * Throws an exception if `tagName` is not a valid TSDoc tag name.
     */
    TSDocTagDefinition.validateTSDocTagName = function (tagName) {
        StringChecks_1.StringChecks.validateTSDocTagName(tagName);
    };
    return TSDocTagDefinition;
}());
exports.TSDocTagDefinition = TSDocTagDefinition;
//# sourceMappingURL=TSDocTagDefinition.js.map
}, function(modId) { var map = {"../parser/StringChecks":1784796701563,"../details/Standardization":1784796701567}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701567, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Standardization = void 0;
/**
 * Used to group the {@link StandardTags} definitions according to the level of support
 * expected from documentation tools that implement the standard.
 */
var Standardization;
(function (Standardization) {
    /**
     * TSDoc tags in the "Core" standardization group are considered essential.
     * Their meaning is standardized, and every documentation tool is expected
     * to recognize them.  The TSDoc parser library typically provides dedicated APIs
     * for accessing these tags.
     */
    Standardization["Core"] = "Core";
    /**
     * TSDoc tags in the "Extended" standardization group are optional.  Documentation tools
     * may or may not support them.  If they do, the syntax and semantics should conform to
     * the TSDoc standard definitions.
     */
    Standardization["Extended"] = "Extended";
    /**
     * TSDoc tags in the "Discretionary" standardization group are optional.  Although the
     * syntax is specified, the semantics for these tags are implementation-specific
     * (and sometimes difficult to describe completely without referring to a specific
     * implementation).  Discretionary tags are included in the TSDoc standard to ensure that
     * if two different popular tools use the same tag name, developers can expect the syntax
     * to be the same, and the semantics to be somewhat similar.
     */
    Standardization["Discretionary"] = "Discretionary";
    /**
     * The tag is not part of the TSDoc standard.  All used-defined tags are assigned to this group.
     */
    Standardization["None"] = "None";
})(Standardization || (exports.Standardization = Standardization = {}));
//# sourceMappingURL=Standardization.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701568, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSDocValidationConfiguration = void 0;
/**
 * Part of the {@link TSDocConfiguration} object.
 */
var TSDocValidationConfiguration = /** @class */ (function () {
    function TSDocValidationConfiguration() {
        /**
         * Set `ignoreUndefinedTags` to true to silently ignore unrecognized tags,
         * instead of reporting a warning.
         *
         * @remarks
         * Normally the parser will issue errors when it encounters tag names that do not
         * have a corresponding definition in {@link TSDocConfiguration.tagDefinitions}.
         * This helps to catch common mistakes such as a misspelled tag.
         *
         * @defaultValue `false`
         */
        this.ignoreUndefinedTags = false;
        /**
         * Set `reportUnsupportedTags` to true to issue a warning for tags that are not
         * supported by your tool.
         *
         * @remarks
         * The TSDoc standard defines may tags.  By default it assumes that if your tool does
         * not implement one of these tags, then it will simply ignore it.  But sometimes this
         * may be misleading for developers. (For example, they might write an `@example` block
         * and then be surprised if it doesn't appear in the documentation output.).
         *
         * For a better experience, you can tell the parser which tags you support, and then it
         * will issue warnings wherever unsupported tags are used.  This is done using
         * {@link TSDocConfiguration.setSupportForTag}.  Note that calling that function
         * automatically sets `reportUnsupportedTags` to true.
         *
         * @defaultValue `false`
         */
        this.reportUnsupportedTags = false;
        /**
         * Set `reportUnsupportedHtmlElements` to true to issue a warning for HTML elements which
         * are not defined in your TSDoc configuration's `supportedHtmlElements` field.
         *
         * @defaultValue `false`
         */
        this.reportUnsupportedHtmlElements = false;
    }
    return TSDocValidationConfiguration;
}());
exports.TSDocValidationConfiguration = TSDocValidationConfiguration;
//# sourceMappingURL=TSDocValidationConfiguration.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701569, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuiltInDocNodes = void 0;
var DocNode_1 = require("./DocNode");
var nodes = __importStar(require(".."));
var BuiltInDocNodes = /** @class */ (function () {
    function BuiltInDocNodes() {
    }
    BuiltInDocNodes.register = function (configuration) {
        var docNodeManager = configuration.docNodeManager;
        docNodeManager.registerDocNodes('@microsoft/tsdoc', [
            { docNodeKind: DocNode_1.DocNodeKind.Block, constructor: nodes.DocBlock },
            { docNodeKind: DocNode_1.DocNodeKind.BlockTag, constructor: nodes.DocBlockTag },
            { docNodeKind: DocNode_1.DocNodeKind.CodeSpan, constructor: nodes.DocCodeSpan },
            { docNodeKind: DocNode_1.DocNodeKind.Comment, constructor: nodes.DocComment },
            { docNodeKind: DocNode_1.DocNodeKind.DeclarationReference, constructor: nodes.DocDeclarationReference },
            { docNodeKind: DocNode_1.DocNodeKind.ErrorText, constructor: nodes.DocErrorText },
            { docNodeKind: DocNode_1.DocNodeKind.EscapedText, constructor: nodes.DocEscapedText },
            { docNodeKind: DocNode_1.DocNodeKind.Excerpt, constructor: nodes.DocExcerpt },
            { docNodeKind: DocNode_1.DocNodeKind.FencedCode, constructor: nodes.DocFencedCode },
            { docNodeKind: DocNode_1.DocNodeKind.HtmlAttribute, constructor: nodes.DocHtmlAttribute },
            { docNodeKind: DocNode_1.DocNodeKind.HtmlEndTag, constructor: nodes.DocHtmlEndTag },
            { docNodeKind: DocNode_1.DocNodeKind.HtmlStartTag, constructor: nodes.DocHtmlStartTag },
            { docNodeKind: DocNode_1.DocNodeKind.InheritDocTag, constructor: nodes.DocInheritDocTag },
            { docNodeKind: DocNode_1.DocNodeKind.InlineTag, constructor: nodes.DocInlineTag },
            { docNodeKind: DocNode_1.DocNodeKind.LinkTag, constructor: nodes.DocLinkTag },
            { docNodeKind: DocNode_1.DocNodeKind.MemberIdentifier, constructor: nodes.DocMemberIdentifier },
            { docNodeKind: DocNode_1.DocNodeKind.MemberReference, constructor: nodes.DocMemberReference },
            { docNodeKind: DocNode_1.DocNodeKind.MemberSelector, constructor: nodes.DocMemberSelector },
            { docNodeKind: DocNode_1.DocNodeKind.MemberSymbol, constructor: nodes.DocMemberSymbol },
            { docNodeKind: DocNode_1.DocNodeKind.Paragraph, constructor: nodes.DocParagraph },
            { docNodeKind: DocNode_1.DocNodeKind.ParamBlock, constructor: nodes.DocParamBlock },
            { docNodeKind: DocNode_1.DocNodeKind.ParamCollection, constructor: nodes.DocParamCollection },
            { docNodeKind: DocNode_1.DocNodeKind.PlainText, constructor: nodes.DocPlainText },
            { docNodeKind: DocNode_1.DocNodeKind.Section, constructor: nodes.DocSection },
            { docNodeKind: DocNode_1.DocNodeKind.SoftBreak, constructor: nodes.DocSoftBreak }
        ]);
        docNodeManager.registerAllowableChildren(DocNode_1.DocNodeKind.Section, [
            DocNode_1.DocNodeKind.FencedCode,
            DocNode_1.DocNodeKind.Paragraph,
            DocNode_1.DocNodeKind.HtmlStartTag,
            DocNode_1.DocNodeKind.HtmlEndTag
        ]);
        docNodeManager.registerAllowableChildren(DocNode_1.DocNodeKind.Paragraph, [
            DocNode_1.DocNodeKind.BlockTag,
            DocNode_1.DocNodeKind.CodeSpan,
            DocNode_1.DocNodeKind.ErrorText,
            DocNode_1.DocNodeKind.EscapedText,
            DocNode_1.DocNodeKind.HtmlStartTag,
            DocNode_1.DocNodeKind.HtmlEndTag,
            DocNode_1.DocNodeKind.InlineTag,
            DocNode_1.DocNodeKind.LinkTag,
            DocNode_1.DocNodeKind.PlainText,
            DocNode_1.DocNodeKind.SoftBreak
        ]);
    };
    return BuiltInDocNodes;
}());
exports.BuiltInDocNodes = BuiltInDocNodes;
//# sourceMappingURL=BuiltInDocNodes.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"..":1784796701561}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701570, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocNode = exports.DocNodeKind = void 0;
/**
 * Indicates the type of {@link DocNode}.
 *
 * @remarks
 * When creating custom subclasses of `DocNode`, it's recommended to create your own enum to identify them.
 * To avoid naming conflicts between projects, the enum value should be a string comprised of your full
 * NPM package name, followed by a "#" symbol, followed by the class name (without the "Doc" prefix).
 */
var DocNodeKind;
(function (DocNodeKind) {
    DocNodeKind["Block"] = "Block";
    DocNodeKind["BlockTag"] = "BlockTag";
    DocNodeKind["Excerpt"] = "Excerpt";
    DocNodeKind["FencedCode"] = "FencedCode";
    DocNodeKind["CodeSpan"] = "CodeSpan";
    DocNodeKind["Comment"] = "Comment";
    DocNodeKind["DeclarationReference"] = "DeclarationReference";
    DocNodeKind["ErrorText"] = "ErrorText";
    DocNodeKind["EscapedText"] = "EscapedText";
    DocNodeKind["HtmlAttribute"] = "HtmlAttribute";
    DocNodeKind["HtmlEndTag"] = "HtmlEndTag";
    DocNodeKind["HtmlStartTag"] = "HtmlStartTag";
    DocNodeKind["InheritDocTag"] = "InheritDocTag";
    DocNodeKind["InlineTag"] = "InlineTag";
    DocNodeKind["LinkTag"] = "LinkTag";
    DocNodeKind["MemberIdentifier"] = "MemberIdentifier";
    DocNodeKind["MemberReference"] = "MemberReference";
    DocNodeKind["MemberSelector"] = "MemberSelector";
    DocNodeKind["MemberSymbol"] = "MemberSymbol";
    DocNodeKind["Paragraph"] = "Paragraph";
    DocNodeKind["ParamBlock"] = "ParamBlock";
    DocNodeKind["ParamCollection"] = "ParamCollection";
    DocNodeKind["PlainText"] = "PlainText";
    DocNodeKind["Section"] = "Section";
    DocNodeKind["SoftBreak"] = "SoftBreak";
})(DocNodeKind || (exports.DocNodeKind = DocNodeKind = {}));
/**
 * The base class for the parser's Abstract Syntax Tree nodes.
 */
var DocNode = /** @class */ (function () {
    function DocNode(parameters) {
        this.configuration = parameters.configuration;
    }
    /**
     * Returns the list of child nodes for this node.  This is useful for visitors that want
     * to scan the tree looking for nodes of a specific type, without having to process
     * intermediary nodes.
     */
    DocNode.prototype.getChildNodes = function () {
        // Do this sanity check here, since the constructor cannot access abstract members
        this.configuration.docNodeManager.throwIfNotRegisteredKind(this.kind);
        return this.onGetChildNodes().filter(function (x) { return x !== undefined; });
    };
    /**
     * Overridden by child classes to implement {@link DocNode.getChildNodes}.
     * @virtual
     */
    DocNode.prototype.onGetChildNodes = function () {
        return [];
    };
    /**
     * A type guard that returns true if the input uses the `IDocNodeParsedParameters` (parser scenario).
     *
     * @remarks
     * There are two scenarios for constructing `DocNode` objects.  The "builder scenario" constructs the object based on
     * literal strings, does NOT create DocExcerpt child nodes, and generally uses the {@link IDocNodeParameters}
     * hierarchy for its constructor parameters.  The "parser scenario" constructs the object by parsing a TypeScript
     * source file, does create DocExcerpt child nodes, and generally uses the {@link IDocNodeParsedParameters} hierarchy.
     */
    DocNode.isParsedParameters = function (parameters) {
        return parameters.parsed === true;
    };
    return DocNode;
}());
exports.DocNode = DocNode;
//# sourceMappingURL=DocNode.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701571, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.allTsdocMessageIdsSet = exports.allTsdocMessageIds = exports.TSDocMessageId = void 0;
/**
 * Unique identifiers for messages reported by the TSDoc parser.
 *
 * @remarks
 *
 * These strings are possible values for the {@link ParserMessage.messageId} property.
 * These identifiers can be used to suppress or configure the reporting of individual messages.
 * They are also useful when searching for help about a particular error.
 *
 * @public
 */
var TSDocMessageId;
(function (TSDocMessageId) {
    /**
     * File not found
     * @remarks
     * Reported by the `@microsoft/tsdoc-config` package when it failed to find a `tsdoc.json` file.
     */
    TSDocMessageId["ConfigFileNotFound"] = "tsdoc-config-file-not-found";
    /**
     * Error parsing JSON input: ___
     * @remarks
     * Reported by the `@microsoft/tsdoc-config` package when the `tsdoc.json` file has invalid JSON syntax.
     */
    TSDocMessageId["ConfigInvalidJson"] = "tsdoc-config-invalid-json";
    /**
     * Unsupported JSON "$schema" value
     * @remarks
     * Reported by the `@microsoft/tsdoc-config` package when the file format is not supported.
     */
    TSDocMessageId["ConfigFileUnsupportedSchema"] = "tsdoc-config-unsupported-schema";
    /**
     * Error loading config file: ___
     * @remarks
     * Reported by the `@microsoft/tsdoc-config` package when the config file doesn't conform to its schema.
     */
    TSDocMessageId["ConfigFileSchemaError"] = "tsdoc-config-schema-error";
    /**
     * Circular reference encountered for "extends" field of "___"
     * @remarks
     * Reported by the `@microsoft/tsdoc-config` package when the "extends" field creates a chain of references
     * that causes a file to indirectly extend itself.
     */
    TSDocMessageId["ConfigFileCyclicExtends"] = "tsdoc-config-cyclic-extends";
    /**
     * Unable to resolve "extends" reference to "___"
     * @remarks
     * Reported by the `@microsoft/tsdoc-config` package when module resolution fails for the "extends" field.
     */
    TSDocMessageId["ConfigFileUnresolvedExtends"] = "tsdoc-config-unresolved-extends";
    /**
     * The "supportForTags" field refers to an undefined tag "___".
     * @remarks
     * Reported by the `@microsoft/tsdoc-config` package when loading the tsdoc.json config file.
     */
    TSDocMessageId["ConfigFileUndefinedTag"] = "tsdoc-config-undefined-tag";
    /**
     * The "tagDefinitions" field specifies more than one tag with the name "___".
     * @remarks
     * Reported by the `@microsoft/tsdoc-config` package when loading the tsdoc.json config file.
     */
    TSDocMessageId["ConfigFileDuplicateTagName"] = "tsdoc-config-duplicate-tag-name";
    /**
     * A TSDoc tag name must start with a letter and contain only letters and numbers.
     * @remarks
     * Reported by the `@microsoft/tsdoc-config` package when loading the tsdoc.json config file.
     */
    TSDocMessageId["ConfigFileInvalidTagName"] = "tsdoc-config-invalid-tag-name";
    /**
     * Expecting a `/**` comment.
     * Unexpected end of input.
     */
    TSDocMessageId["CommentNotFound"] = "tsdoc-comment-not-found";
    /**
     * Expecting a leading `/**`
     */
    TSDocMessageId["CommentOpeningDelimiterSyntax"] = "tsdoc-comment-missing-opening-delimiter";
    /**
     * Unexpected end of input.
     */
    TSDocMessageId["CommentMissingClosingDelimiter"] = "tsdoc-comment-missing-closing-delimiter";
    /**
     * A doc comment cannot have more than one `@inheritDoc` tag
     */
    TSDocMessageId["ExtraInheritDocTag"] = "tsdoc-extra-inheritdoc-tag";
    /**
     * The `}` character should be escaped using a backslash to avoid confusion with a TSDoc inline tag.
     */
    TSDocMessageId["EscapeRightBrace"] = "tsdoc-escape-right-brace";
    /**
     * The `>` character should be escaped using a backslash to avoid confusion with an HTML tag.
     */
    TSDocMessageId["EscapeGreaterThan"] = "tsdoc-escape-greater-than";
    /**
     * The ___ block must include a deprecation message, e.g. describing the recommended alternative.
     */
    TSDocMessageId["MissingDeprecationMessage"] = "tsdoc-missing-deprecation-message";
    /**
     * A ___ block must not be used, because that content is provided by the `@inheritDoc` tag.
     */
    TSDocMessageId["InheritDocIncompatibleTag"] = "tsdoc-inheritdoc-incompatible-tag";
    /**
     * The summary section must not have any content, because that content is provided by the `@inheritDoc` tag.
     */
    TSDocMessageId["InheritDocIncompatibleSummary"] = "tsdoc-inheritdoc-incompatible-summary";
    /**
     * The TSDoc tag ___ is an inline tag; it must be enclosed in `{ }` braces.
     */
    TSDocMessageId["InlineTagMissingBraces"] = "tsdoc-inline-tag-missing-braces";
    /**
     * The TSDoc tag ___ is not an inline tag; it must not be enclosed in `{ }` braces.
     */
    TSDocMessageId["TagShouldNotHaveBraces"] = "tsdoc-tag-should-not-have-braces";
    /**
     * The TSDoc tag ___ is not supported by this tool.
     */
    TSDocMessageId["UnsupportedTag"] = "tsdoc-unsupported-tag";
    /**
     * The TSDoc tag ___ is not defined in this configuration.
     */
    TSDocMessageId["UndefinedTag"] = "tsdoc-undefined-tag";
    /**
     * The `@param` block should not include a JSDoc-style `{type}`.
     */
    TSDocMessageId["ParamTagWithInvalidType"] = "tsdoc-param-tag-with-invalid-type";
    /**
     * The `@param` block should not include a JSDoc-style optional name; it must not be enclosed in `[ ]` brackets.
     */
    TSDocMessageId["ParamTagWithInvalidOptionalName"] = "tsdoc-param-tag-with-invalid-optional-name";
    /**
     * The `@param` block should be followed by a parameter name.
     */
    TSDocMessageId["ParamTagWithInvalidName"] = "tsdoc-param-tag-with-invalid-name";
    /**
     * The `@param` block should be followed by a parameter name and then a hyphen.
     */
    TSDocMessageId["ParamTagMissingHyphen"] = "tsdoc-param-tag-missing-hyphen";
    /**
     * A backslash must precede another character that is being escaped.  OR
     * A backslash can only be used to escape a punctuation character.
     */
    TSDocMessageId["UnnecessaryBackslash"] = "tsdoc-unnecessary-backslash";
    /**
     * Expecting a TSDoc tag starting with `@`.  OR
     * Expecting a TSDoc tag starting with `{`.
     */
    TSDocMessageId["MissingTag"] = "tsdoc-missing-tag";
    /**
     * The `@` character looks like part of a TSDoc tag; use a backslash to escape it.
     */
    TSDocMessageId["AtSignInWord"] = "tsdoc-at-sign-in-word";
    /**
     * Expecting a TSDoc tag name after `@`; if it is not a tag, use a backslash to escape this character.
     */
    TSDocMessageId["AtSignWithoutTagName"] = "tsdoc-at-sign-without-tag-name";
    /**
     * Expecting a TSDoc tag starting with `{@`.  OR
     * Expecting a TSDoc inline tag name after the `{@` characters.
     */
    TSDocMessageId["MalformedInlineTag"] = "tsdoc-malformed-inline-tag";
    /**
     * The token ___ looks like a TSDoc tag but contains an invalid character ___; if it is not a tag,
     * use a backslash to escape the `@`.
     */
    TSDocMessageId["CharactersAfterBlockTag"] = "tsdoc-characters-after-block-tag";
    /**
     * A TSDoc tag name must start with a letter and contain only letters and numbers.
     */
    TSDocMessageId["MalformedTagName"] = "tsdoc-malformed-tag-name";
    /**
     * The character ___ cannot appear after the TSDoc tag name; expecting a space.
     */
    TSDocMessageId["CharactersAfterInlineTag"] = "tsdoc-characters-after-inline-tag";
    /**
     * The TSDoc inline tag name is missing its closing `}`.
     */
    TSDocMessageId["InlineTagMissingRightBrace"] = "tsdoc-inline-tag-missing-right-brace";
    /**
     * The `{` character must be escaped with a backslash when used inside a TSDoc inline tag.
     */
    TSDocMessageId["InlineTagUnescapedBrace"] = "tsdoc-inline-tag-unescaped-brace";
    /**
     * Unexpected character after declaration reference.
     */
    TSDocMessageId["InheritDocTagSyntax"] = "tsdoc-inheritdoc-tag-syntax";
    /**
     * The `@link` tag content is missing.
     */
    TSDocMessageId["LinkTagEmpty"] = "tsdoc-link-tag-empty";
    /**
     * The ___ character may not be used in the link text without escaping it.
     */
    TSDocMessageId["LinkTagUnescapedText"] = "tsdoc-link-tag-unescaped-text";
    /**
     * Unexpected character after link destination.
     */
    TSDocMessageId["LinkTagDestinationSyntax"] = "tsdoc-link-tag-destination-syntax";
    /**
     * The URL cannot be empty.  OR
     * An `@link` URL must begin with a scheme comprised only of letters and numbers followed by `://`.  OR
     * An `@link` URL must have at least one character after `://`.
     */
    TSDocMessageId["LinkTagInvalidUrl"] = "tsdoc-link-tag-invalid-url";
    /**
     * The declaration reference appears to contain a package name or import path, but it is missing the `#` delimiter.
     */
    TSDocMessageId["ReferenceMissingHash"] = "tsdoc-reference-missing-hash";
    /**
     * The hash character must be preceded by a package name or import path.
     */
    TSDocMessageId["ReferenceHashSyntax"] = "tsdoc-reference-hash-syntax";
    /**
     * The package name cannot be an empty string.  OR
     * The package name ___ is not a valid package name.
     */
    TSDocMessageId["ReferenceMalformedPackageName"] = "tsdoc-reference-malformed-package-name";
    /**
     * An import path must not contain `//`.  OR
     * An import path must not end with `/`.  OR
     * An import path must not start with `/` unless prefixed by a package name.
     */
    TSDocMessageId["ReferenceMalformedImportPath"] = "tsdoc-reference-malformed-import-path";
    /**
     * Expecting a declaration reference.
     */
    TSDocMessageId["MissingReference"] = "tsdoc-missing-reference";
    /**
     * Expecting a period before the next component of a declaration reference
     */
    TSDocMessageId["ReferenceMissingDot"] = "tsdoc-reference-missing-dot";
    /**
     * Syntax error in declaration reference: the member selector must be enclosed in parentheses.
     */
    TSDocMessageId["ReferenceSelectorMissingParens"] = "tsdoc-reference-selector-missing-parens";
    /**
     * Expecting a colon after the identifier because the expression is in parentheses.
     */
    TSDocMessageId["ReferenceMissingColon"] = "tsdoc-reference-missing-colon";
    /**
     * Expecting a matching right parenthesis.
     */
    TSDocMessageId["ReferenceMissingRightParen"] = "tsdoc-reference-missing-right-paren";
    /**
     * Missing declaration reference in symbol reference
     */
    TSDocMessageId["ReferenceSymbolSyntax"] = "tsdoc-reference-symbol-syntax";
    /**
     * Missing closing square bracket for symbol reference
     */
    TSDocMessageId["ReferenceMissingRightBracket"] = "tsdoc-reference-missing-right-bracket";
    /**
     * Unexpected end of input inside quoted member identifier.
     */
    TSDocMessageId["ReferenceMissingQuote"] = "tsdoc-reference-missing-quote";
    /**
     * The quoted identifier cannot be empty.
     */
    TSDocMessageId["ReferenceEmptyIdentifier"] = "tsdoc-reference-empty-identifier";
    /**
     * Syntax error in declaration reference: expecting a member identifier.
     */
    TSDocMessageId["ReferenceMissingIdentifier"] = "tsdoc-reference-missing-identifier";
    /**
     * The identifier cannot be an empty string. OR
     * The identifier cannot non-word characters. OR
     * The identifier must not start with a number. OR
     * The identifier ___ must be quoted because it is a TSDoc system selector name.
     */
    TSDocMessageId["ReferenceUnquotedIdentifier"] = "tsdoc-reference-unquoted-identifier";
    /**
     * Expecting a selector label after the colon.
     */
    TSDocMessageId["ReferenceMissingLabel"] = "tsdoc-reference-missing-label";
    /**
     * The selector cannot be an empty string.  OR
     * If the selector begins with a number, it must be a positive integer value.  OR
     * A label selector must be comprised of upper case letters, numbers, and underscores
     * and must not start with a number.  OR
     * The selector ___ is not a recognized TSDoc system selector name.
     */
    TSDocMessageId["ReferenceSelectorSyntax"] = "tsdoc-reference-selector-syntax";
    /**
     * Expecting an attribute or `>` or `/>`.
     */
    TSDocMessageId["HtmlTagMissingGreaterThan"] = "tsdoc-html-tag-missing-greater-than";
    /**
     * Expecting `=` after HTML attribute name.
     */
    TSDocMessageId["HtmlTagMissingEquals"] = "tsdoc-html-tag-missing-equals";
    /**
     * Expecting an HTML string starting with a single-quote or double-quote character.
     */
    TSDocMessageId["HtmlTagMissingString"] = "tsdoc-html-tag-missing-string";
    /**
     * The HTML string is missing its closing quote.
     */
    TSDocMessageId["HtmlStringMissingQuote"] = "tsdoc-html-string-missing-quote";
    /**
     * The next character after a closing quote must be spacing or punctuation.
     */
    TSDocMessageId["TextAfterHtmlString"] = "tsdoc-text-after-html-string";
    /**
     * Expecting an HTML tag starting with `</`.
     */
    TSDocMessageId["MissingHtmlEndTag"] = "tsdoc-missing-html-end-tag";
    /**
     * A space is not allowed here.  OR
     * Expecting an HTML name.  OR
     * An HTML name must be a sequence of letters separated by hyphens.
     */
    TSDocMessageId["MalformedHtmlName"] = "tsdoc-malformed-html-name";
    /**
     * This HTML element name is not defined by your TSDoc configuration.
     */
    TSDocMessageId["UnsupportedHtmlElementName"] = "tsdoc-unsupported-html-name";
    /**
     * The opening backtick for a code fence must appear at the start of the line.
     */
    TSDocMessageId["CodeFenceOpeningIndent"] = "tsdoc-code-fence-opening-indent";
    /**
     * The language specifier cannot contain backtick characters.
     */
    TSDocMessageId["CodeFenceSpecifierSyntax"] = "tsdoc-code-fence-specifier-syntax";
    /**
     * The closing delimiter for a code fence must not be indented.
     */
    TSDocMessageId["CodeFenceClosingIndent"] = "tsdoc-code-fence-closing-indent";
    /**
     * Missing closing delimiter.
     */
    TSDocMessageId["CodeFenceMissingDelimiter"] = "tsdoc-code-fence-missing-delimiter";
    /**
     * Unexpected characters after closing delimiter for code fence.
     */
    TSDocMessageId["CodeFenceClosingSyntax"] = "tsdoc-code-fence-closing-syntax";
    /**
     * A code span must contain at least one character between the backticks.
     */
    TSDocMessageId["CodeSpanEmpty"] = "tsdoc-code-span-empty";
    /**
     * The code span is missing its closing backtick.
     */
    TSDocMessageId["CodeSpanMissingDelimiter"] = "tsdoc-code-span-missing-delimiter";
})(TSDocMessageId || (exports.TSDocMessageId = TSDocMessageId = {}));
// Exposed via TSDocConfiguration.allTsdocMessageIds()
exports.allTsdocMessageIds = [
    // To make comparisons easy, keep these in the same order as the enum above:
    'tsdoc-config-file-not-found',
    'tsdoc-config-invalid-json',
    'tsdoc-config-unsupported-schema',
    'tsdoc-config-schema-error',
    'tsdoc-config-cyclic-extends',
    'tsdoc-config-unresolved-extends',
    'tsdoc-config-undefined-tag',
    'tsdoc-config-duplicate-tag-name',
    'tsdoc-config-invalid-tag-name',
    'tsdoc-comment-not-found',
    'tsdoc-comment-missing-opening-delimiter',
    'tsdoc-comment-missing-closing-delimiter',
    'tsdoc-extra-inheritdoc-tag',
    'tsdoc-escape-right-brace',
    'tsdoc-escape-greater-than',
    'tsdoc-missing-deprecation-message',
    'tsdoc-inheritdoc-incompatible-tag',
    'tsdoc-inheritdoc-incompatible-summary',
    'tsdoc-inline-tag-missing-braces',
    'tsdoc-tag-should-not-have-braces',
    'tsdoc-unsupported-tag',
    'tsdoc-undefined-tag',
    'tsdoc-param-tag-with-invalid-type',
    'tsdoc-param-tag-with-invalid-optional-name',
    'tsdoc-param-tag-with-invalid-name',
    'tsdoc-param-tag-missing-hyphen',
    'tsdoc-unnecessary-backslash',
    'tsdoc-missing-tag',
    'tsdoc-at-sign-in-word',
    'tsdoc-at-sign-without-tag-name',
    'tsdoc-malformed-inline-tag',
    'tsdoc-characters-after-block-tag',
    'tsdoc-malformed-tag-name',
    'tsdoc-characters-after-inline-tag',
    'tsdoc-inline-tag-missing-right-brace',
    'tsdoc-inline-tag-unescaped-brace',
    'tsdoc-inheritdoc-tag-syntax',
    'tsdoc-link-tag-empty',
    'tsdoc-link-tag-unescaped-text',
    'tsdoc-link-tag-destination-syntax',
    'tsdoc-link-tag-invalid-url',
    'tsdoc-reference-missing-hash',
    'tsdoc-reference-hash-syntax',
    'tsdoc-reference-malformed-package-name',
    'tsdoc-reference-malformed-import-path',
    'tsdoc-missing-reference',
    'tsdoc-reference-missing-dot',
    'tsdoc-reference-selector-missing-parens',
    'tsdoc-reference-missing-colon',
    'tsdoc-reference-missing-right-paren',
    'tsdoc-reference-symbol-syntax',
    'tsdoc-reference-missing-right-bracket',
    'tsdoc-reference-missing-quote',
    'tsdoc-reference-empty-identifier',
    'tsdoc-reference-missing-identifier',
    'tsdoc-reference-unquoted-identifier',
    'tsdoc-reference-missing-label',
    'tsdoc-reference-selector-syntax',
    'tsdoc-html-tag-missing-greater-than',
    'tsdoc-html-tag-missing-equals',
    'tsdoc-html-tag-missing-string',
    'tsdoc-html-string-missing-quote',
    'tsdoc-text-after-html-string',
    'tsdoc-missing-html-end-tag',
    'tsdoc-malformed-html-name',
    'tsdoc-code-fence-opening-indent',
    'tsdoc-code-fence-specifier-syntax',
    'tsdoc-code-fence-closing-indent',
    'tsdoc-code-fence-missing-delimiter',
    'tsdoc-code-fence-closing-syntax',
    'tsdoc-code-span-empty',
    'tsdoc-code-span-missing-delimiter'
];
exports.allTsdocMessageIds.sort();
exports.allTsdocMessageIdsSet = new Set(exports.allTsdocMessageIds);
//# sourceMappingURL=TSDocMessageId.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701572, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardModifierTagSet = void 0;
var ModifierTagSet_1 = require("./ModifierTagSet");
var StandardTags_1 = require("./StandardTags");
/**
 * Extends the ModifierTagSet base class with getters for modifiers that
 * are part of the standardized core tags for TSDoc.
 */
var StandardModifierTagSet = /** @class */ (function (_super) {
    __extends(StandardModifierTagSet, _super);
    function StandardModifierTagSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns true if the `@alpha` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isAlpha = function () {
        return this.hasTag(StandardTags_1.StandardTags.alpha);
    };
    /**
     * Returns true if the `@beta` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isBeta = function () {
        return this.hasTag(StandardTags_1.StandardTags.beta);
    };
    /**
     * Returns true if the `@eventProperty` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isEventProperty = function () {
        return this.hasTag(StandardTags_1.StandardTags.eventProperty);
    };
    /**
     * Returns true if the `@experimental` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isExperimental = function () {
        return this.hasTag(StandardTags_1.StandardTags.experimental);
    };
    /**
     * Returns true if the `@internal` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isInternal = function () {
        return this.hasTag(StandardTags_1.StandardTags.internal);
    };
    /**
     * Returns true if the `@override` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isOverride = function () {
        return this.hasTag(StandardTags_1.StandardTags.override);
    };
    /**
     * Returns true if the `@packageDocumentation` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isPackageDocumentation = function () {
        return this.hasTag(StandardTags_1.StandardTags.packageDocumentation);
    };
    /**
     * Returns true if the `@public` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isPublic = function () {
        return this.hasTag(StandardTags_1.StandardTags.public);
    };
    /**
     * Returns true if the `@readonly` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isReadonly = function () {
        return this.hasTag(StandardTags_1.StandardTags.readonly);
    };
    /**
     * Returns true if the `@sealed` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isSealed = function () {
        return this.hasTag(StandardTags_1.StandardTags.sealed);
    };
    /**
     * Returns true if the `@virtual` modifier tag was specified.
     */
    StandardModifierTagSet.prototype.isVirtual = function () {
        return this.hasTag(StandardTags_1.StandardTags.virtual);
    };
    return StandardModifierTagSet;
}(ModifierTagSet_1.ModifierTagSet));
exports.StandardModifierTagSet = StandardModifierTagSet;
//# sourceMappingURL=StandardModifierTagSet.js.map
}, function(modId) { var map = {"./ModifierTagSet":1784796701573,"./StandardTags":1784796701565}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701573, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModifierTagSet = void 0;
var TSDocTagDefinition_1 = require("../configuration/TSDocTagDefinition");
/**
 * Represents a set of modifier tags that were extracted from a doc comment.
 *
 * @remarks
 * TSDoc modifier tags are block tags that do not have any associated rich text content.
 * Instead, their presence or absence acts as an on/off switch, indicating some aspect
 * of the underlying API item.  For example, the `@internal` modifier indicates that a
 * signature is internal (i.e. not part of the public API contract).
 */
var ModifierTagSet = /** @class */ (function () {
    function ModifierTagSet() {
        this._nodes = [];
        // NOTE: To implement case insensitivity, the keys in this set are always upper-case.
        // This convention makes the normalization more obvious (and as a general practice handles
        // the Turkish "i" character correctly).
        this._nodesByName = new Map();
    }
    Object.defineProperty(ModifierTagSet.prototype, "nodes", {
        /**
         * The original block tag nodes that defined the modifiers in this set, excluding duplicates.
         */
        get: function () {
            return this._nodes;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns true if the set contains a DocBlockTag with the specified tag name.
     * Note that synonyms are not considered.  The comparison is case-insensitive.
     * @param modifierTagName - The name of the tag, including the `@` prefix  For example, `@internal`
     */
    ModifierTagSet.prototype.hasTagName = function (modifierTagName) {
        return this._nodesByName.has(modifierTagName.toUpperCase());
    };
    /**
     * Returns true if the set contains a DocBlockTag matching the specified tag definition.
     * Note that synonyms are not considered.  The comparison is case-insensitive.
     * The TSDocTagDefinition must be a modifier tag.
     * @param tagName - The name of the tag, including the `@` prefix  For example, `@internal`
     */
    ModifierTagSet.prototype.hasTag = function (modifierTagDefinition) {
        return !!this.tryGetTag(modifierTagDefinition);
    };
    /**
     * Returns a DocBlockTag matching the specified tag definition, or undefined if no such
     * tag was added to the set.  If there were multiple instances, returned object will be
     * the first one to be added.
     */
    ModifierTagSet.prototype.tryGetTag = function (modifierTagDefinition) {
        if (modifierTagDefinition.syntaxKind !== TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag) {
            throw new Error('The tag definition is not a modifier tag');
        }
        return this._nodesByName.get(modifierTagDefinition.tagNameWithUpperCase);
    };
    /**
     * Adds a new modifier tag to the set.  If a tag already exists with the same name,
     * then no change is made, and the return value is false.
     */
    ModifierTagSet.prototype.addTag = function (blockTag) {
        if (this._nodesByName.has(blockTag.tagNameWithUpperCase)) {
            return false;
        }
        this._nodesByName.set(blockTag.tagNameWithUpperCase, blockTag);
        this._nodes.push(blockTag);
        return true;
    };
    return ModifierTagSet;
}());
exports.ModifierTagSet = ModifierTagSet;
//# sourceMappingURL=ModifierTagSet.js.map
}, function(modId) { var map = {"../configuration/TSDocTagDefinition":1784796701566}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701574, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlainTextEmitter = void 0;
var nodes_1 = require("../nodes");
/**
 * Renders a DocNode tree as plain text, without any rich text formatting or markup.
 */
var PlainTextEmitter = /** @class */ (function () {
    function PlainTextEmitter() {
    }
    PlainTextEmitter.hasAnyTextContent = function (nodeOrNodes, requiredCharacters) {
        if (requiredCharacters === undefined || requiredCharacters < 1) {
            requiredCharacters = 1; // default
        }
        var nodes;
        if (nodeOrNodes instanceof nodes_1.DocNode) {
            nodes = [nodeOrNodes];
        }
        else {
            nodes = nodeOrNodes;
        }
        var foundCharacters = PlainTextEmitter._scanTextContent(nodes, requiredCharacters, 0);
        return foundCharacters >= requiredCharacters;
    };
    PlainTextEmitter._scanTextContent = function (nodes, requiredCharacters, foundCharacters) {
        for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
            var node = nodes_2[_i];
            switch (node.kind) {
                case nodes_1.DocNodeKind.FencedCode:
                    var docFencedCode = node;
                    foundCharacters += PlainTextEmitter._countNonSpaceCharacters(docFencedCode.code);
                    break;
                case nodes_1.DocNodeKind.CodeSpan:
                    var docCodeSpan = node;
                    foundCharacters += PlainTextEmitter._countNonSpaceCharacters(docCodeSpan.code);
                    break;
                case nodes_1.DocNodeKind.EscapedText:
                    var docEscapedText = node;
                    foundCharacters += PlainTextEmitter._countNonSpaceCharacters(docEscapedText.decodedText);
                    break;
                case nodes_1.DocNodeKind.LinkTag:
                    var docLinkTag = node;
                    foundCharacters += PlainTextEmitter._countNonSpaceCharacters(docLinkTag.linkText || '');
                    break;
                case nodes_1.DocNodeKind.PlainText:
                    var docPlainText = node;
                    foundCharacters += PlainTextEmitter._countNonSpaceCharacters(docPlainText.text);
                    break;
            }
            if (foundCharacters >= requiredCharacters) {
                break;
            }
            foundCharacters += PlainTextEmitter._scanTextContent(node.getChildNodes(), requiredCharacters, foundCharacters);
            if (foundCharacters >= requiredCharacters) {
                break;
            }
        }
        return foundCharacters;
    };
    PlainTextEmitter._countNonSpaceCharacters = function (s) {
        var count = 0;
        var length = s.length;
        var i = 0;
        while (i < length) {
            switch (s.charCodeAt(i)) {
                case 32: // space
                case 9: // tab
                case 13: // CR
                case 10: // LF
                    break;
                default:
                    ++count;
            }
            ++i;
        }
        return count;
    };
    return PlainTextEmitter;
}());
exports.PlainTextEmitter = PlainTextEmitter;
//# sourceMappingURL=PlainTextEmitter.js.map
}, function(modId) { var map = {"../nodes":1784796701575}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701575, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
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
__exportStar(require("./DocBlock"), exports);
__exportStar(require("./DocBlockTag"), exports);
__exportStar(require("./DocCodeSpan"), exports);
__exportStar(require("./DocComment"), exports);
__exportStar(require("./DocDeclarationReference"), exports);
__exportStar(require("./DocErrorText"), exports);
__exportStar(require("./DocEscapedText"), exports);
__exportStar(require("./DocExcerpt"), exports);
__exportStar(require("./DocFencedCode"), exports);
__exportStar(require("./DocHtmlAttribute"), exports);
__exportStar(require("./DocHtmlEndTag"), exports);
__exportStar(require("./DocHtmlStartTag"), exports);
__exportStar(require("./DocInheritDocTag"), exports);
__exportStar(require("./DocInlineTag"), exports);
__exportStar(require("./DocInlineTagBase"), exports);
__exportStar(require("./DocLinkTag"), exports);
__exportStar(require("./DocMemberIdentifier"), exports);
__exportStar(require("./DocMemberReference"), exports);
__exportStar(require("./DocMemberSelector"), exports);
__exportStar(require("./DocMemberSymbol"), exports);
__exportStar(require("./DocNode"), exports);
__exportStar(require("./DocNodeContainer"), exports);
__exportStar(require("./DocParagraph"), exports);
__exportStar(require("./DocParamBlock"), exports);
__exportStar(require("./DocParamCollection"), exports);
__exportStar(require("./DocPlainText"), exports);
__exportStar(require("./DocSection"), exports);
__exportStar(require("./DocSoftBreak"), exports);
//# sourceMappingURL=index.js.map
}, function(modId) { var map = {"./DocBlock":1784796701576,"./DocBlockTag":1784796701580,"./DocCodeSpan":1784796701583,"./DocComment":1784796701584,"./DocDeclarationReference":1784796701590,"./DocErrorText":1784796701591,"./DocEscapedText":1784796701592,"./DocExcerpt":1784796701581,"./DocFencedCode":1784796701593,"./DocHtmlAttribute":1784796701594,"./DocHtmlEndTag":1784796701595,"./DocHtmlStartTag":1784796701596,"./DocInheritDocTag":1784796701597,"./DocInlineTag":1784796701599,"./DocInlineTagBase":1784796701598,"./DocLinkTag":1784796701600,"./DocMemberIdentifier":1784796701601,"./DocMemberReference":1784796701602,"./DocMemberSelector":1784796701603,"./DocMemberSymbol":1784796701604,"./DocNode":1784796701570,"./DocNodeContainer":1784796701579,"./DocParagraph":1784796701578,"./DocParamBlock":1784796701605,"./DocParamCollection":1784796701589,"./DocPlainText":1784796701606,"./DocSection":1784796701577,"./DocSoftBreak":1784796701607}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701576, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocBlock = void 0;
var DocNode_1 = require("./DocNode");
var DocSection_1 = require("./DocSection");
/**
 * Represents a section that is introduced by a TSDoc block tag.
 * For example, an `@example` block.
 */
var DocBlock = /** @class */ (function (_super) {
    __extends(DocBlock, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocBlock(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this._blockTag = parameters.blockTag;
        _this._content = new DocSection_1.DocSection({ configuration: _this.configuration });
        return _this;
    }
    Object.defineProperty(DocBlock.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.Block;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocBlock.prototype, "blockTag", {
        /**
         * The TSDoc tag that introduces this section.
         */
        get: function () {
            return this._blockTag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocBlock.prototype, "content", {
        /**
         * The TSDoc tag that introduces this section.
         */
        get: function () {
            return this._content;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocBlock.prototype.onGetChildNodes = function () {
        return [this.blockTag, this._content];
    };
    return DocBlock;
}(DocNode_1.DocNode));
exports.DocBlock = DocBlock;
//# sourceMappingURL=DocBlock.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocSection":1784796701577}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701577, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocSection = void 0;
var DocNode_1 = require("./DocNode");
var DocParagraph_1 = require("./DocParagraph");
var DocNodeContainer_1 = require("./DocNodeContainer");
/**
 * Represents a general block of rich text.
 */
var DocSection = /** @class */ (function (_super) {
    __extends(DocSection, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocSection(parameters, childNodes) {
        return _super.call(this, parameters, childNodes) || this;
    }
    Object.defineProperty(DocSection.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.Section;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * If the last item in DocSection.nodes is not a DocParagraph, a new paragraph
     * is started.  Either way, the provided docNode will be appended to the paragraph.
     */
    DocSection.prototype.appendNodeInParagraph = function (docNode) {
        var paragraphNode = undefined;
        if (this.nodes.length > 0) {
            var lastNode = this.nodes[this.nodes.length - 1];
            if (lastNode.kind === DocNode_1.DocNodeKind.Paragraph) {
                paragraphNode = lastNode;
            }
        }
        if (!paragraphNode) {
            paragraphNode = new DocParagraph_1.DocParagraph({ configuration: this.configuration });
            this.appendNode(paragraphNode);
        }
        paragraphNode.appendNode(docNode);
    };
    DocSection.prototype.appendNodesInParagraph = function (docNodes) {
        for (var _i = 0, docNodes_1 = docNodes; _i < docNodes_1.length; _i++) {
            var docNode = docNodes_1[_i];
            this.appendNodeInParagraph(docNode);
        }
    };
    return DocSection;
}(DocNodeContainer_1.DocNodeContainer));
exports.DocSection = DocSection;
//# sourceMappingURL=DocSection.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocParagraph":1784796701578,"./DocNodeContainer":1784796701579}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701578, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocParagraph = void 0;
var DocNode_1 = require("./DocNode");
var DocNodeContainer_1 = require("./DocNodeContainer");
/**
 * Represents a paragraph of text, similar to a `<p>` element in HTML.
 * Like CommonMark, the TSDoc syntax uses blank lines to delineate paragraphs
 * instead of explicitly notating them.
 */
var DocParagraph = /** @class */ (function (_super) {
    __extends(DocParagraph, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocParagraph(parameters, childNodes) {
        return _super.call(this, parameters, childNodes) || this;
    }
    Object.defineProperty(DocParagraph.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.Paragraph;
        },
        enumerable: false,
        configurable: true
    });
    return DocParagraph;
}(DocNodeContainer_1.DocNodeContainer));
exports.DocParagraph = DocParagraph;
//# sourceMappingURL=DocParagraph.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocNodeContainer":1784796701579}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701579, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocNodeContainer = void 0;
var DocNode_1 = require("./DocNode");
/**
 * DocNodeContainer is the base class for DocNode classes that allow arbitrary child nodes to be added by the consumer.
 * The child classes are {@link DocParagraph} and {@link DocSection}.
 */
var DocNodeContainer = /** @class */ (function (_super) {
    __extends(DocNodeContainer, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocNodeContainer(parameters, childNodes) {
        var _this = _super.call(this, parameters) || this;
        _this._nodes = [];
        if (childNodes !== undefined && childNodes.length > 0) {
            _this.appendNodes(childNodes);
        }
        return _this;
    }
    Object.defineProperty(DocNodeContainer.prototype, "nodes", {
        /**
         * The nodes that were added to this container.
         */
        get: function () {
            return this._nodes;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Append a node to the container.
     */
    DocNodeContainer.prototype.appendNode = function (docNode) {
        if (!this.configuration.docNodeManager.isAllowedChild(this.kind, docNode.kind)) {
            throw new Error("The TSDocConfiguration does not allow a ".concat(this.kind, " node to") +
                " contain a node of type ".concat(docNode.kind));
        }
        this._nodes.push(docNode);
    };
    /**
     * Append nodes to the container.
     */
    DocNodeContainer.prototype.appendNodes = function (docNodes) {
        for (var _i = 0, docNodes_1 = docNodes; _i < docNodes_1.length; _i++) {
            var docNode = docNodes_1[_i];
            this.appendNode(docNode);
        }
    };
    /**
     * Remove all nodes from the container.
     */
    DocNodeContainer.prototype.clearNodes = function () {
        this._nodes.length = 0;
    };
    /** @override */
    DocNodeContainer.prototype.onGetChildNodes = function () {
        return this._nodes;
    };
    return DocNodeContainer;
}(DocNode_1.DocNode));
exports.DocNodeContainer = DocNodeContainer;
//# sourceMappingURL=DocNodeContainer.js.map
}, function(modId) { var map = {"./DocNode":1784796701570}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701580, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocBlockTag = void 0;
var DocNode_1 = require("./DocNode");
var StringChecks_1 = require("../parser/StringChecks");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Represents a TSDoc block tag such as `@param` or `@public`.
 */
var DocBlockTag = /** @class */ (function (_super) {
    __extends(DocBlockTag, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocBlockTag(parameters) {
        var _this = _super.call(this, parameters) || this;
        StringChecks_1.StringChecks.validateTSDocTagName(parameters.tagName);
        _this._tagName = parameters.tagName;
        _this._tagNameWithUpperCase = parameters.tagName.toUpperCase();
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._tagNameExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.BlockTag,
                content: parameters.tagNameExcerpt
            });
        }
        return _this;
    }
    Object.defineProperty(DocBlockTag.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.BlockTag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocBlockTag.prototype, "tagName", {
        /**
         * The TSDoc tag name.  TSDoc tag names start with an at-sign (`@`) followed
         * by ASCII letters using "camelCase" capitalization.
         */
        get: function () {
            return this._tagName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocBlockTag.prototype, "tagNameWithUpperCase", {
        /**
         * The TSDoc tag name in all capitals, which is used for performing
         * case-insensitive comparisons or lookups.
         */
        get: function () {
            return this._tagNameWithUpperCase;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocBlockTag.prototype.onGetChildNodes = function () {
        return [this._tagNameExcerpt];
    };
    DocBlockTag.prototype.getTokenSequence = function () {
        if (!this._tagNameExcerpt) {
            throw new Error('DocBlockTag.getTokenSequence() failed because this object did not originate from a parsed input');
        }
        return this._tagNameExcerpt.content;
    };
    return DocBlockTag;
}(DocNode_1.DocNode));
exports.DocBlockTag = DocBlockTag;
//# sourceMappingURL=DocBlockTag.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"../parser/StringChecks":1784796701563,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701581, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocExcerpt = exports.ExcerptKind = void 0;
var DocNode_1 = require("./DocNode");
var Token_1 = require("../parser/Token");
/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Indicates the type of {@link DocExcerpt}.
 */
var ExcerptKind;
(function (ExcerptKind) {
    ExcerptKind["Spacing"] = "Spacing";
    ExcerptKind["BlockTag"] = "BlockTag";
    ExcerptKind["CodeSpan_OpeningDelimiter"] = "CodeSpan_OpeningDelimiter";
    ExcerptKind["CodeSpan_Code"] = "CodeSpan_Code";
    ExcerptKind["CodeSpan_ClosingDelimiter"] = "CodeSpan_ClosingDelimiter";
    ExcerptKind["DeclarationReference_PackageName"] = "DeclarationReference_PackageName";
    ExcerptKind["DeclarationReference_ImportPath"] = "DeclarationReference_ImportPath";
    ExcerptKind["DeclarationReference_ImportHash"] = "DeclarationReference_ImportHash";
    /**
     * Input characters that were reported as an error and do not appear to be part of a valid expression.
     * A syntax highlighter might display them with an error color (e.g. red).
     */
    ExcerptKind["ErrorText"] = "ErrorText";
    /**
     * Input characters that do not conform to the TSDoc specification, but were recognized by the parser, for example
     * as a known JSDoc pattern.  A syntax highlighter should not display them with an error color (e.g. red)
     * because the error reporting may be suppressed for "lax" parsing of legacy source code.
     */
    ExcerptKind["NonstandardText"] = "NonstandardText";
    ExcerptKind["EscapedText"] = "EscapedText";
    ExcerptKind["FencedCode_OpeningFence"] = "FencedCode_OpeningFence";
    ExcerptKind["FencedCode_Language"] = "FencedCode_Language";
    ExcerptKind["FencedCode_Code"] = "FencedCode_Code";
    ExcerptKind["FencedCode_ClosingFence"] = "FencedCode_ClosingFence";
    ExcerptKind["HtmlAttribute_Name"] = "HtmlAttribute_Name";
    ExcerptKind["HtmlAttribute_Equals"] = "HtmlAttribute_Equals";
    ExcerptKind["HtmlAttribute_Value"] = "HtmlAttribute_Value";
    ExcerptKind["HtmlEndTag_OpeningDelimiter"] = "HtmlEndTag_OpeningDelimiter";
    ExcerptKind["HtmlEndTag_Name"] = "HtmlEndTag_Name";
    ExcerptKind["HtmlEndTag_ClosingDelimiter"] = "HtmlEndTag_ClosingDelimiter";
    ExcerptKind["HtmlStartTag_OpeningDelimiter"] = "HtmlStartTag_OpeningDelimiter";
    ExcerptKind["HtmlStartTag_Name"] = "HtmlStartTag_Name";
    ExcerptKind["HtmlStartTag_ClosingDelimiter"] = "HtmlStartTag_ClosingDelimiter";
    ExcerptKind["InlineTag_OpeningDelimiter"] = "InlineTag_OpeningDelimiter";
    ExcerptKind["InlineTag_TagName"] = "InlineTag_TagName";
    ExcerptKind["InlineTag_TagContent"] = "InlineTag_TagContent";
    ExcerptKind["InlineTag_ClosingDelimiter"] = "InlineTag_ClosingDelimiter";
    ExcerptKind["LinkTag_UrlDestination"] = "LinkTag_UrlDestination";
    ExcerptKind["LinkTag_Pipe"] = "LinkTag_Pipe";
    ExcerptKind["LinkTag_LinkText"] = "LinkTag_LinkText";
    ExcerptKind["MemberIdentifier_LeftQuote"] = "MemberIdentifier_LeftQuote";
    ExcerptKind["MemberIdentifier_Identifier"] = "MemberIdentifier_Identifier";
    ExcerptKind["MemberIdentifier_RightQuote"] = "MemberIdentifier_RightQuote";
    ExcerptKind["MemberReference_Dot"] = "MemberReference_Dot";
    ExcerptKind["MemberReference_LeftParenthesis"] = "MemberReference_LeftParenthesis";
    ExcerptKind["MemberReference_Colon"] = "MemberReference_Colon";
    ExcerptKind["MemberReference_RightParenthesis"] = "MemberReference_RightParenthesis";
    ExcerptKind["MemberSelector"] = "MemberSelector";
    ExcerptKind["DocMemberSymbol_LeftBracket"] = "DocMemberSymbol_LeftBracket";
    ExcerptKind["DocMemberSymbol_RightBracket"] = "DocMemberSymbol_RightBracket";
    ExcerptKind["ParamBlock_ParameterName"] = "ParamBlock_ParameterName";
    ExcerptKind["ParamBlock_Hyphen"] = "ParamBlock_Hyphen";
    ExcerptKind["PlainText"] = "PlainText";
    ExcerptKind["SoftBreak"] = "SoftBreak";
})(ExcerptKind || (exports.ExcerptKind = ExcerptKind = {}));
/**
 * Represents a parsed token sequence.
 *
 * @remarks
 * When a `DocNode` is created by parsing a doc comment, it will have `DocExcerpt` child nodes corresponding to
 * the parsed syntax elements such as names, keywords, punctuation, and spaces.  These excerpts indicate the original
 * coordinates of the syntax element, and thus can be used for syntax highlighting and precise error reporting.
 * They could also be used to rewrite specific words in a source file (e.g. renaming a parameter) without disturbing
 * any other characters in the file.
 *
 * Every parsed character will correspond to at most one DocExcerpt object.  In other words, excerpts never overlap.
 * A given excerpt can span multiple comment lines, and it may contain gaps, for example to skip the `*` character
 * that starts a new TSDoc comment line.
 */
var DocExcerpt = /** @class */ (function (_super) {
    __extends(DocExcerpt, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocExcerpt(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (parameters.excerptKind === ExcerptKind.Spacing) {
            for (var _i = 0, _a = parameters.content.tokens; _i < _a.length; _i++) {
                var token = _a[_i];
                switch (token.kind) {
                    case Token_1.TokenKind.Spacing:
                    case Token_1.TokenKind.Newline:
                    case Token_1.TokenKind.EndOfInput:
                        break;
                    default:
                        throw new Error("The excerptKind=Spacing but the range contains a non-whitespace token");
                }
            }
        }
        _this._excerptKind = parameters.excerptKind;
        _this._content = parameters.content;
        return _this;
    }
    Object.defineProperty(DocExcerpt.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.Excerpt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocExcerpt.prototype, "excerptKind", {
        /**
         * Indicates the kind of DocExcerpt.
         */
        get: function () {
            return this._excerptKind;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocExcerpt.prototype, "content", {
        /**
         * The input token sequence corresponding to this excerpt.
         * @remarks
         * Note that a token sequence can span multiple input lines and may contain gaps, for example to skip the `*`
         * character that starts a new TSDoc comment line.
         */
        get: function () {
            return this._content;
        },
        enumerable: false,
        configurable: true
    });
    return DocExcerpt;
}(DocNode_1.DocNode));
exports.DocExcerpt = DocExcerpt;
//# sourceMappingURL=DocExcerpt.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"../parser/Token":1784796701582}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701582, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = exports.TokenKind = void 0;
/**
 * Distinguishes different types of Token objects.
 */
var TokenKind;
(function (TokenKind) {
    /**
     * A token representing the end of the input.  The Token.range will be an empty range
     * at the end of the provided input.
     */
    TokenKind[TokenKind["EndOfInput"] = 2001] = "EndOfInput";
    /**
     * A token representing a virtual newline.
     * The Token.range will be an empty range, because the actual newline character may
     * be noncontiguous due to the doc comment delimiter trimming.
     */
    TokenKind[TokenKind["Newline"] = 2002] = "Newline";
    /**
     * A token representing one or more spaces and tabs (but not newlines or end of input).
     */
    TokenKind[TokenKind["Spacing"] = 2003] = "Spacing";
    /**
     * A token representing one or more ASCII letters, numbers, and underscores.
     */
    TokenKind[TokenKind["AsciiWord"] = 2004] = "AsciiWord";
    /**
     * A single ASCII character that behaves like punctuation, e.g. doesn't need whitespace
     * around it when adjacent to a letter.  The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["OtherPunctuation"] = 2005] = "OtherPunctuation";
    /**
     * A token representing a sequence of non-ASCII printable characters that are not punctuation.
     */
    TokenKind[TokenKind["Other"] = 2006] = "Other";
    /**
     * The backslash character `\`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Backslash"] = 2007] = "Backslash";
    /**
     * The less-than character `<`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["LessThan"] = 2008] = "LessThan";
    /**
     * The greater-than character `>`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["GreaterThan"] = 2009] = "GreaterThan";
    /**
     * The equals character `=`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Equals"] = 2010] = "Equals";
    /**
     * The single-quote character `'`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["SingleQuote"] = 2011] = "SingleQuote";
    /**
     * The double-quote character `"`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["DoubleQuote"] = 2012] = "DoubleQuote";
    /**
     * The slash character `/`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Slash"] = 2013] = "Slash";
    /**
     * The hyphen character `-`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Hyphen"] = 2014] = "Hyphen";
    /**
     * The at-sign character `@`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["AtSign"] = 2015] = "AtSign";
    /**
     * The left curly bracket character `{`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["LeftCurlyBracket"] = 2016] = "LeftCurlyBracket";
    /**
     * The right curly bracket character `}`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["RightCurlyBracket"] = 2017] = "RightCurlyBracket";
    /**
     * The backtick character.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Backtick"] = 2018] = "Backtick";
    /**
     * The period character.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Period"] = 2019] = "Period";
    /**
     * The colon character.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Colon"] = 2020] = "Colon";
    /**
     * The comma character.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Comma"] = 2021] = "Comma";
    /**
     * The left square bracket character.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["LeftSquareBracket"] = 2022] = "LeftSquareBracket";
    /**
     * The right square bracket character.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["RightSquareBracket"] = 2023] = "RightSquareBracket";
    /**
     * The pipe character `|`.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Pipe"] = 2024] = "Pipe";
    /**
     * The left parenthesis character.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["LeftParenthesis"] = 2025] = "LeftParenthesis";
    /**
     * The right parenthesis character.
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["RightParenthesis"] = 2026] = "RightParenthesis";
    /**
     * The pound character ("#").
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["PoundSymbol"] = 2027] = "PoundSymbol";
    /**
     * The plus character ("+").
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["Plus"] = 2028] = "Plus";
    /**
     * The dollar sign character ("$").
     * The Token.range will always be a string of length 1.
     */
    TokenKind[TokenKind["DollarSign"] = 2029] = "DollarSign";
})(TokenKind || (exports.TokenKind = TokenKind = {}));
/**
 * Represents a contiguous range of characters extracted from one of the doc comment lines
 * being processed by the Tokenizer.  There is a token representing a newline, but otherwise
 * a single token cannot span multiple lines.
 */
var Token = /** @class */ (function () {
    function Token(kind, range, line) {
        this.kind = kind;
        this.range = range;
        this.line = line;
    }
    Token.prototype.toString = function () {
        if (this.kind === TokenKind.Newline) {
            return '\n';
        }
        return this.range.toString();
    };
    return Token;
}());
exports.Token = Token;
//# sourceMappingURL=Token.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701583, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocCodeSpan = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Represents CommonMark-style code span, i.e. code surrounded by
 * backtick characters.
 */
var DocCodeSpan = /** @class */ (function (_super) {
    __extends(DocCodeSpan, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocCodeSpan(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._openingDelimiterExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.CodeSpan_OpeningDelimiter,
                content: parameters.openingDelimiterExcerpt
            });
            _this._codeExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.CodeSpan_Code,
                content: parameters.codeExcerpt
            });
            _this._closingDelimiterExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.CodeSpan_ClosingDelimiter,
                content: parameters.closingDelimiterExcerpt
            });
        }
        else {
            _this._code = parameters.code;
        }
        return _this;
    }
    Object.defineProperty(DocCodeSpan.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.CodeSpan;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocCodeSpan.prototype, "code", {
        /**
         * The text that should be rendered as code, excluding the backtick delimiters.
         */
        get: function () {
            if (this._code === undefined) {
                this._code = this._codeExcerpt.content.toString();
            }
            return this._code;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocCodeSpan.prototype.onGetChildNodes = function () {
        return [this._openingDelimiterExcerpt, this._codeExcerpt, this._closingDelimiterExcerpt];
    };
    return DocCodeSpan;
}(DocNode_1.DocNode));
exports.DocCodeSpan = DocCodeSpan;
//# sourceMappingURL=DocCodeSpan.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701584, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocComment = void 0;
var DocNode_1 = require("./DocNode");
var DocSection_1 = require("./DocSection");
var StandardModifierTagSet_1 = require("../details/StandardModifierTagSet");
var StringBuilder_1 = require("../emitters/StringBuilder");
var TSDocEmitter_1 = require("../emitters/TSDocEmitter");
var DocParamCollection_1 = require("./DocParamCollection");
/**
 * Represents an entire documentation comment conforming to the TSDoc structure.
 * This is the root of the DocNode tree.
 */
var DocComment = /** @class */ (function (_super) {
    __extends(DocComment, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocComment(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this.summarySection = new DocSection_1.DocSection({ configuration: _this.configuration });
        _this.remarksBlock = undefined;
        _this.privateRemarks = undefined;
        _this.deprecatedBlock = undefined;
        _this.params = new DocParamCollection_1.DocParamCollection({ configuration: _this.configuration });
        _this.typeParams = new DocParamCollection_1.DocParamCollection({ configuration: _this.configuration });
        _this.returnsBlock = undefined;
        _this.modifierTagSet = new StandardModifierTagSet_1.StandardModifierTagSet();
        _this._seeBlocks = [];
        _this._customBlocks = [];
        return _this;
    }
    Object.defineProperty(DocComment.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.Comment;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocComment.prototype, "seeBlocks", {
        /**
         * The collection of all `@see` DockBlockTag nodes belonging to this doc comment.
         */
        get: function () {
            return this._seeBlocks;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocComment.prototype, "customBlocks", {
        /**
         * The collection of all DocBlock nodes belonging to this doc comment.
         */
        get: function () {
            return this._customBlocks;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Append an item to the seeBlocks collection.
     * @internal
     */
    DocComment.prototype._appendSeeBlock = function (block) {
        this._seeBlocks.push(block);
    };
    /**
     * Append an item to the customBlocks collection.
     */
    DocComment.prototype.appendCustomBlock = function (block) {
        this._customBlocks.push(block);
    };
    /** @override */
    DocComment.prototype.onGetChildNodes = function () {
        return __spreadArray(__spreadArray(__spreadArray(__spreadArray([
            this.summarySection,
            this.remarksBlock,
            this.privateRemarks,
            this.deprecatedBlock,
            this.params.count > 0 ? this.params : undefined,
            this.typeParams.count > 0 ? this.typeParams : undefined,
            this.returnsBlock
        ], this.customBlocks, true), this.seeBlocks, true), [
            this.inheritDocTag
        ], false), this.modifierTagSet.nodes, true);
    };
    /**
     * Generates a doc comment corresponding to the `DocComment` tree.  The output is in a normalized form,
     * and may ignore formatting/spacing from the original input.
     *
     * @remarks
     * After parsing a string, and possibly modifying the result, `emitAsTsdoc()` can be used to render the result
     * as a doc comment in a normalized format.  It can also be used to emit a `DocComment` tree that was constructed
     * manually.
     *
     * This method is provided as convenience for simple use cases.  To customize the output, or if you need
     * to render into a `StringBuilder`, use the {@link TSDocEmitter} class instead.
     */
    DocComment.prototype.emitAsTsdoc = function () {
        var stringBuilder = new StringBuilder_1.StringBuilder();
        var emitter = new TSDocEmitter_1.TSDocEmitter();
        emitter.renderComment(stringBuilder, this);
        return stringBuilder.toString();
    };
    return DocComment;
}(DocNode_1.DocNode));
exports.DocComment = DocComment;
//# sourceMappingURL=DocComment.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocSection":1784796701577,"../details/StandardModifierTagSet":1784796701572,"../emitters/StringBuilder":1784796701585,"../emitters/TSDocEmitter":1784796701586,"./DocParamCollection":1784796701589}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701585, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringBuilder = void 0;
/**
 * This class allows a large text string to be constructed incrementally by appending small chunks.  The final
 * string can be obtained by calling StringBuilder.toString().
 *
 * @remarks
 * A naive approach might use the `+=` operator to append strings:  This would have the downside of copying
 * the entire string each time a chunk is appended, resulting in `O(n^2)` bytes of memory being allocated
 * (and later freed by the garbage  collector), and many of the allocations could be very large objects.
 * StringBuilder avoids this overhead by accumulating the chunks in an array, and efficiently joining them
 * when `getText()` is finally called.
 */
var StringBuilder = /** @class */ (function () {
    function StringBuilder() {
        this._chunks = [];
    }
    /** {@inheritdoc IStringBuilder.append} */
    StringBuilder.prototype.append = function (text) {
        this._chunks.push(text);
    };
    /** {@inheritdoc IStringBuilder.toString} */
    StringBuilder.prototype.toString = function () {
        if (this._chunks.length === 0) {
            return '';
        }
        if (this._chunks.length > 1) {
            var joined = this._chunks.join('');
            this._chunks.length = 1;
            this._chunks[0] = joined;
        }
        return this._chunks[0];
    };
    return StringBuilder;
}());
exports.StringBuilder = StringBuilder;
//# sourceMappingURL=StringBuilder.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701586, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSDocEmitter = void 0;
var DocNode_1 = require("../nodes/DocNode");
var DocNodeTransforms_1 = require("../transforms/DocNodeTransforms");
var StandardTags_1 = require("../details/StandardTags");
var LineState;
(function (LineState) {
    LineState[LineState["Closed"] = 0] = "Closed";
    LineState[LineState["StartOfLine"] = 1] = "StartOfLine";
    LineState[LineState["MiddleOfLine"] = 2] = "MiddleOfLine";
})(LineState || (LineState = {}));
/**
 * Renders a DocNode tree as a code comment.
 */
var TSDocEmitter = /** @class */ (function () {
    function TSDocEmitter() {
        this.eol = '\n';
        // Whether to emit the /** */ framing
        this._emitCommentFraming = true;
        // This state machine is used by the writer functions to generate the /** */ framing around the emitted lines
        this._lineState = LineState.Closed;
        // State for _ensureLineSkipped()
        this._previousLineHadContent = false;
        // Normally a paragraph is precede by a blank line (unless it's the first thing written).
        // But sometimes we want the paragraph to be attached to the previous element, e.g. when it's part of
        // an "@param" block.  Setting _hangingParagraph=true accomplishes that.
        this._hangingParagraph = false;
    }
    TSDocEmitter.prototype.renderComment = function (output, docComment) {
        this._emitCommentFraming = true;
        this._renderCompleteObject(output, docComment);
    };
    TSDocEmitter.prototype.renderHtmlTag = function (output, htmlTag) {
        this._emitCommentFraming = false;
        this._renderCompleteObject(output, htmlTag);
    };
    TSDocEmitter.prototype.renderDeclarationReference = function (output, declarationReference) {
        this._emitCommentFraming = false;
        this._renderCompleteObject(output, declarationReference);
    };
    TSDocEmitter.prototype._renderCompleteObject = function (output, docNode) {
        this._output = output;
        this._lineState = LineState.Closed;
        this._previousLineHadContent = false;
        this._hangingParagraph = false;
        this._renderNode(docNode);
        this._writeEnd();
    };
    TSDocEmitter.prototype._renderNode = function (docNode) {
        var _this = this;
        if (docNode === undefined) {
            return;
        }
        switch (docNode.kind) {
            case DocNode_1.DocNodeKind.Block:
                var docBlock = docNode;
                this._ensureLineSkipped();
                this._renderNode(docBlock.blockTag);
                if (docBlock.blockTag.tagNameWithUpperCase === StandardTags_1.StandardTags.returns.tagNameWithUpperCase) {
                    this._writeContent(' ');
                    this._hangingParagraph = true;
                }
                this._renderNode(docBlock.content);
                break;
            case DocNode_1.DocNodeKind.BlockTag:
                var docBlockTag = docNode;
                if (this._lineState === LineState.MiddleOfLine) {
                    this._writeContent(' ');
                }
                this._writeContent(docBlockTag.tagName);
                break;
            case DocNode_1.DocNodeKind.CodeSpan:
                var docCodeSpan = docNode;
                this._writeContent('`');
                this._writeContent(docCodeSpan.code);
                this._writeContent('`');
                break;
            case DocNode_1.DocNodeKind.Comment:
                var docComment = docNode;
                this._renderNodes(__spreadArray(__spreadArray(__spreadArray([
                    docComment.summarySection,
                    docComment.remarksBlock,
                    docComment.privateRemarks,
                    docComment.deprecatedBlock,
                    docComment.params,
                    docComment.typeParams,
                    docComment.returnsBlock
                ], docComment.customBlocks, true), docComment.seeBlocks, true), [
                    docComment.inheritDocTag
                ], false));
                if (docComment.modifierTagSet.nodes.length > 0) {
                    this._ensureLineSkipped();
                    this._renderNodes(docComment.modifierTagSet.nodes);
                }
                break;
            case DocNode_1.DocNodeKind.DeclarationReference:
                var docDeclarationReference = docNode;
                this._writeContent(docDeclarationReference.packageName);
                this._writeContent(docDeclarationReference.importPath);
                if (docDeclarationReference.packageName !== undefined ||
                    docDeclarationReference.importPath !== undefined) {
                    this._writeContent('#');
                }
                this._renderNodes(docDeclarationReference.memberReferences);
                break;
            case DocNode_1.DocNodeKind.ErrorText:
                var docErrorText = docNode;
                this._writeContent(docErrorText.text);
                break;
            case DocNode_1.DocNodeKind.EscapedText:
                var docEscapedText = docNode;
                this._writeContent(docEscapedText.encodedText);
                break;
            case DocNode_1.DocNodeKind.FencedCode:
                var docFencedCode = docNode;
                this._ensureAtStartOfLine();
                this._writeContent('```');
                this._writeContent(docFencedCode.language);
                this._writeNewline();
                this._writeContent(docFencedCode.code);
                this._writeContent('```');
                this._writeNewline();
                this._writeNewline();
                break;
            case DocNode_1.DocNodeKind.HtmlAttribute:
                var docHtmlAttribute = docNode;
                this._writeContent(docHtmlAttribute.name);
                this._writeContent(docHtmlAttribute.spacingAfterName);
                this._writeContent('=');
                this._writeContent(docHtmlAttribute.spacingAfterEquals);
                this._writeContent(docHtmlAttribute.value);
                this._writeContent(docHtmlAttribute.spacingAfterValue);
                break;
            case DocNode_1.DocNodeKind.HtmlEndTag:
                var docHtmlEndTag = docNode;
                this._writeContent('</');
                this._writeContent(docHtmlEndTag.name);
                this._writeContent('>');
                break;
            case DocNode_1.DocNodeKind.HtmlStartTag:
                var docHtmlStartTag = docNode;
                this._writeContent('<');
                this._writeContent(docHtmlStartTag.name);
                this._writeContent(docHtmlStartTag.spacingAfterName);
                var needsSpace = docHtmlStartTag.spacingAfterName === undefined || docHtmlStartTag.spacingAfterName.length === 0;
                for (var _i = 0, _a = docHtmlStartTag.htmlAttributes; _i < _a.length; _i++) {
                    var attribute = _a[_i];
                    if (needsSpace) {
                        this._writeContent(' ');
                    }
                    this._renderNode(attribute);
                    needsSpace = attribute.spacingAfterValue === undefined || attribute.spacingAfterValue.length === 0;
                }
                this._writeContent(docHtmlStartTag.selfClosingTag ? '/>' : '>');
                break;
            case DocNode_1.DocNodeKind.InheritDocTag:
                var docInheritDocTag_1 = docNode;
                this._renderInlineTag(docInheritDocTag_1, function () {
                    if (docInheritDocTag_1.declarationReference) {
                        _this._writeContent(' ');
                        _this._renderNode(docInheritDocTag_1.declarationReference);
                    }
                });
                break;
            case DocNode_1.DocNodeKind.InlineTag:
                var docInlineTag_1 = docNode;
                this._renderInlineTag(docInlineTag_1, function () {
                    if (docInlineTag_1.tagContent.length > 0) {
                        _this._writeContent(' ');
                        _this._writeContent(docInlineTag_1.tagContent);
                    }
                });
                break;
            case DocNode_1.DocNodeKind.LinkTag:
                var docLinkTag_1 = docNode;
                this._renderInlineTag(docLinkTag_1, function () {
                    if (docLinkTag_1.urlDestination !== undefined || docLinkTag_1.codeDestination !== undefined) {
                        if (docLinkTag_1.urlDestination !== undefined) {
                            _this._writeContent(' ');
                            _this._writeContent(docLinkTag_1.urlDestination);
                        }
                        else if (docLinkTag_1.codeDestination !== undefined) {
                            _this._writeContent(' ');
                            _this._renderNode(docLinkTag_1.codeDestination);
                        }
                    }
                    if (docLinkTag_1.linkText !== undefined) {
                        _this._writeContent(' ');
                        _this._writeContent('|');
                        _this._writeContent(' ');
                        _this._writeContent(docLinkTag_1.linkText);
                    }
                });
                break;
            case DocNode_1.DocNodeKind.MemberIdentifier:
                var docMemberIdentifier = docNode;
                if (docMemberIdentifier.hasQuotes) {
                    this._writeContent('"');
                    this._writeContent(docMemberIdentifier.identifier); // todo: encoding
                    this._writeContent('"');
                }
                else {
                    this._writeContent(docMemberIdentifier.identifier);
                }
                break;
            case DocNode_1.DocNodeKind.MemberReference:
                var docMemberReference = docNode;
                if (docMemberReference.hasDot) {
                    this._writeContent('.');
                }
                if (docMemberReference.selector) {
                    this._writeContent('(');
                }
                if (docMemberReference.memberSymbol) {
                    this._renderNode(docMemberReference.memberSymbol);
                }
                else {
                    this._renderNode(docMemberReference.memberIdentifier);
                }
                if (docMemberReference.selector) {
                    this._writeContent(':');
                    this._renderNode(docMemberReference.selector);
                    this._writeContent(')');
                }
                break;
            case DocNode_1.DocNodeKind.MemberSelector:
                var docMemberSelector = docNode;
                this._writeContent(docMemberSelector.selector);
                break;
            case DocNode_1.DocNodeKind.MemberSymbol:
                var docMemberSymbol = docNode;
                this._writeContent('[');
                this._renderNode(docMemberSymbol.symbolReference);
                this._writeContent(']');
                break;
            case DocNode_1.DocNodeKind.Section:
                var docSection = docNode;
                this._renderNodes(docSection.nodes);
                break;
            case DocNode_1.DocNodeKind.Paragraph:
                var trimmedParagraph = DocNodeTransforms_1.DocNodeTransforms.trimSpacesInParagraph(docNode);
                if (trimmedParagraph.nodes.length > 0) {
                    if (this._hangingParagraph) {
                        // If it's a hanging paragraph, then don't skip a line
                        this._hangingParagraph = false;
                    }
                    else {
                        this._ensureLineSkipped();
                    }
                    this._renderNodes(trimmedParagraph.nodes);
                    this._writeNewline();
                }
                break;
            case DocNode_1.DocNodeKind.ParamBlock:
                var docParamBlock = docNode;
                this._ensureLineSkipped();
                this._renderNode(docParamBlock.blockTag);
                this._writeContent(' ');
                this._writeContent(docParamBlock.parameterName);
                this._writeContent(' - ');
                this._hangingParagraph = true;
                this._renderNode(docParamBlock.content);
                this._hangingParagraph = false;
                break;
            case DocNode_1.DocNodeKind.ParamCollection:
                var docParamCollection = docNode;
                this._renderNodes(docParamCollection.blocks);
                break;
            case DocNode_1.DocNodeKind.PlainText:
                var docPlainText = docNode;
                this._writeContent(docPlainText.text);
                break;
        }
    };
    TSDocEmitter.prototype._renderInlineTag = function (docInlineTagBase, writeInlineTagContent) {
        this._writeContent('{');
        this._writeContent(docInlineTagBase.tagName);
        writeInlineTagContent();
        this._writeContent('}');
    };
    TSDocEmitter.prototype._renderNodes = function (docNodes) {
        for (var _i = 0, docNodes_1 = docNodes; _i < docNodes_1.length; _i++) {
            var docNode = docNodes_1[_i];
            this._renderNode(docNode);
        }
    };
    // Calls _writeNewline() only if we're not already at the start of a new line
    TSDocEmitter.prototype._ensureAtStartOfLine = function () {
        if (this._lineState === LineState.MiddleOfLine) {
            this._writeNewline();
        }
    };
    // Calls _writeNewline() if needed to ensure that we have skipped at least one line
    TSDocEmitter.prototype._ensureLineSkipped = function () {
        this._ensureAtStartOfLine();
        if (this._previousLineHadContent) {
            this._writeNewline();
        }
    };
    // Writes literal text content.  If it contains newlines, they will automatically be converted to
    // _writeNewline() calls, to ensure that "*" is written at the start of each line.
    TSDocEmitter.prototype._writeContent = function (content) {
        if (content === undefined || content.length === 0) {
            return;
        }
        var splitLines = content.split(/\r?\n/g);
        if (splitLines.length > 1) {
            var firstLine = true;
            for (var _i = 0, splitLines_1 = splitLines; _i < splitLines_1.length; _i++) {
                var line = splitLines_1[_i];
                if (firstLine) {
                    firstLine = false;
                }
                else {
                    this._writeNewline();
                }
                this._writeContent(line);
            }
            return;
        }
        if (this._lineState === LineState.Closed) {
            if (this._emitCommentFraming) {
                this._output.append('/**' + this.eol + ' *');
            }
            this._lineState = LineState.StartOfLine;
        }
        if (this._lineState === LineState.StartOfLine) {
            if (this._emitCommentFraming) {
                this._output.append(' ');
            }
        }
        this._output.append(content);
        this._lineState = LineState.MiddleOfLine;
        this._previousLineHadContent = true;
    };
    // Starts a new line, and inserts "/**" or "*" as appropriate.
    TSDocEmitter.prototype._writeNewline = function () {
        if (this._lineState === LineState.Closed) {
            if (this._emitCommentFraming) {
                this._output.append('/**' + this.eol + ' *');
            }
            this._lineState = LineState.StartOfLine;
        }
        this._previousLineHadContent = this._lineState === LineState.MiddleOfLine;
        if (this._emitCommentFraming) {
            this._output.append(this.eol + ' *');
        }
        else {
            this._output.append(this.eol);
        }
        this._lineState = LineState.StartOfLine;
        this._hangingParagraph = false;
    };
    // Closes the comment, adding the final "*/" delimiter
    TSDocEmitter.prototype._writeEnd = function () {
        if (this._lineState === LineState.MiddleOfLine) {
            if (this._emitCommentFraming) {
                this._writeNewline();
            }
        }
        if (this._lineState !== LineState.Closed) {
            if (this._emitCommentFraming) {
                this._output.append('/' + this.eol);
            }
            this._lineState = LineState.Closed;
        }
    };
    return TSDocEmitter;
}());
exports.TSDocEmitter = TSDocEmitter;
//# sourceMappingURL=TSDocEmitter.js.map
}, function(modId) { var map = {"../nodes/DocNode":1784796701570,"../transforms/DocNodeTransforms":1784796701587,"../details/StandardTags":1784796701565}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701587, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocNodeTransforms = void 0;
var TrimSpacesTransform_1 = require("./TrimSpacesTransform");
/**
 * Helper functions that transform DocNode trees.
 */
var DocNodeTransforms = /** @class */ (function () {
    function DocNodeTransforms() {
    }
    /**
     * trimSpacesInParagraphNodes() collapses extra spacing characters from plain text nodes.
     *
     * @remarks
     * This is useful when emitting HTML, where any number of spaces are equivalent
     * to a single space.  It's also useful when emitting Markdown, where spaces
     * can be misinterpreted as an indented code block.
     *
     * For example, we might transform this:
     *
     * ```
     * nodes: [
     *   { kind: PlainText, text: "   Here   are some   " },
     *   { kind: SoftBreak }
     *   { kind: PlainText, text: "   words" },
     *   { kind: SoftBreak }
     *   { kind: InlineTag, text: "{\@inheritDoc}" },
     *   { kind: PlainText, text: "to process." },
     *   { kind: PlainText, text: "  " },
     *   { kind: PlainText, text: "  " }
     * ]
     * ```
     *
     * ...to this:
     *
     * ```
     * nodes: [
     *   { kind: PlainText, text: "Here are some " },
     *   { kind: PlainText, text: "words " },
     *   { kind: InlineTag, text: "{\@inheritDoc}" },
     *   { kind: PlainText, text: "to process." }
     * ]
     * ```
     *
     * Note that in this example, `"words "` is not merged with the preceding node because
     * its DocPlainText.excerpt cannot span multiple lines.
     *
     * @param docParagraph - a DocParagraph containing nodes to be transformed
     * @returns The transformed child nodes.
     */
    DocNodeTransforms.trimSpacesInParagraph = function (docParagraph) {
        return TrimSpacesTransform_1.TrimSpacesTransform.transform(docParagraph);
    };
    return DocNodeTransforms;
}());
exports.DocNodeTransforms = DocNodeTransforms;
//# sourceMappingURL=DocNodeTransforms.js.map
}, function(modId) { var map = {"./TrimSpacesTransform":1784796701588}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701588, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrimSpacesTransform = void 0;
var nodes_1 = require("../nodes");
/**
 * Implementation of DocNodeTransforms.trimSpacesInParagraphNodes()
 */
var TrimSpacesTransform = /** @class */ (function () {
    function TrimSpacesTransform() {
    }
    TrimSpacesTransform.transform = function (docParagraph) {
        var transformedNodes = [];
        // Whether the next nonempty node to be added needs a space before it
        var pendingSpace = false;
        // The DocPlainText node that we're currently accumulating
        var accumulatedTextChunks = [];
        var accumulatedNodes = [];
        // We always trim leading whitespace for a paragraph.  This flag gets set to true
        // as soon as nonempty content is encountered.
        var finishedSkippingLeadingSpaces = false;
        for (var _i = 0, _a = docParagraph.nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            switch (node.kind) {
                case nodes_1.DocNodeKind.PlainText:
                    var docPlainText = node;
                    var text = docPlainText.text;
                    var startedWithSpace = /^\s/.test(text);
                    var endedWithSpace = /\s$/.test(text);
                    var collapsedText = text.replace(/\s+/g, ' ').trim();
                    if (startedWithSpace && finishedSkippingLeadingSpaces) {
                        pendingSpace = true;
                    }
                    if (collapsedText.length > 0) {
                        if (pendingSpace) {
                            accumulatedTextChunks.push(' ');
                            pendingSpace = false;
                        }
                        accumulatedTextChunks.push(collapsedText);
                        accumulatedNodes.push(node);
                        finishedSkippingLeadingSpaces = true;
                    }
                    if (endedWithSpace && finishedSkippingLeadingSpaces) {
                        pendingSpace = true;
                    }
                    break;
                case nodes_1.DocNodeKind.SoftBreak:
                    if (finishedSkippingLeadingSpaces) {
                        pendingSpace = true;
                    }
                    accumulatedNodes.push(node);
                    break;
                default:
                    if (pendingSpace) {
                        accumulatedTextChunks.push(' ');
                        pendingSpace = false;
                    }
                    // Push the accumulated text
                    if (accumulatedTextChunks.length > 0) {
                        // TODO: We should probably track the accumulatedNodes somehow, e.g. so we can map them back to the
                        // original excerpts.  But we need a developer scenario before we can design this API.
                        transformedNodes.push(new nodes_1.DocPlainText({
                            configuration: docParagraph.configuration,
                            text: accumulatedTextChunks.join('')
                        }));
                        accumulatedTextChunks.length = 0;
                        accumulatedNodes.length = 0;
                    }
                    transformedNodes.push(node);
                    finishedSkippingLeadingSpaces = true;
            }
        }
        // Push the accumulated text
        if (accumulatedTextChunks.length > 0) {
            transformedNodes.push(new nodes_1.DocPlainText({
                configuration: docParagraph.configuration,
                text: accumulatedTextChunks.join('')
            }));
            accumulatedTextChunks.length = 0;
            accumulatedNodes.length = 0;
        }
        var transformedParagraph = new nodes_1.DocParagraph({
            configuration: docParagraph.configuration
        });
        transformedParagraph.appendNodes(transformedNodes);
        return transformedParagraph;
    };
    return TrimSpacesTransform;
}());
exports.TrimSpacesTransform = TrimSpacesTransform;
//# sourceMappingURL=TrimSpacesTransform.js.map
}, function(modId) { var map = {"../nodes":1784796701575}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701589, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocParamCollection = void 0;
var DocNode_1 = require("./DocNode");
/**
 * Represents a collection of DocParamBlock objects and provides efficient operations for looking up the
 * documentation for a specified parameter name.
 */
var DocParamCollection = /** @class */ (function (_super) {
    __extends(DocParamCollection, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocParamCollection(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this._blocks = [];
        return _this;
    }
    Object.defineProperty(DocParamCollection.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.ParamCollection;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Provide an iterator for callers that support it.
     */
    DocParamCollection.prototype[Symbol.iterator] = function () {
        return this._blocks[Symbol.iterator]();
    };
    Object.defineProperty(DocParamCollection.prototype, "blocks", {
        /**
         * Returns the blocks in this collection.
         */
        get: function () {
            return this._blocks;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocParamCollection.prototype, "count", {
        /**
         * Returns the number of blocks in this collection.
         */
        get: function () {
            return this._blocks.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Adds a new block to the collection.
     */
    DocParamCollection.prototype.add = function (docParamBlock) {
        this._blocks.push(docParamBlock);
        // Allocate the map on demand, since most DocComment parameter collections will be empty
        if (this._blocksByName === undefined) {
            this._blocksByName = new Map();
        }
        // The first block to be added takes precedence
        if (!this._blocksByName.has(docParamBlock.parameterName)) {
            this._blocksByName.set(docParamBlock.parameterName, docParamBlock);
        }
    };
    /**
     * Removes all blocks from the collection
     */
    DocParamCollection.prototype.clear = function () {
        this._blocks.length = 0;
        this._blocksByName = undefined;
    };
    /**
     * Returns the first block whose `parameterName` matches the specified string.
     *
     * @remarks
     * If the collection was parsed from an input containing errors, there could potentially be more than
     * one DocParamBlock with the same name.  In this situation, tryGetBlockByName() will return the first match
     * that it finds.
     *
     * This lookup is optimized using a dictionary.
     */
    DocParamCollection.prototype.tryGetBlockByName = function (parameterName) {
        if (this._blocksByName) {
            return this._blocksByName.get(parameterName);
        }
        return undefined;
    };
    /** @override */
    DocParamCollection.prototype.onGetChildNodes = function () {
        return this._blocks;
    };
    return DocParamCollection;
}(DocNode_1.DocNode));
exports.DocParamCollection = DocParamCollection;
//# sourceMappingURL=DocParamCollection.js.map
}, function(modId) { var map = {"./DocNode":1784796701570}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701590, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocDeclarationReference = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
var StringBuilder_1 = require("../emitters/StringBuilder");
var TSDocEmitter_1 = require("../emitters/TSDocEmitter");
/**
 * Represents a declaration reference.
 *
 * @remarks
 * Declaration references are TSDoc expressions used by tags such as `{@link}`
 * or `{@inheritDoc}` that need to refer to another declaration.
 */
var DocDeclarationReference = /** @class */ (function (_super) {
    __extends(DocDeclarationReference, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocDeclarationReference(parameters) {
        var _a;
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            if (parameters.packageNameExcerpt) {
                _this._packageNameExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.DeclarationReference_PackageName,
                    content: parameters.packageNameExcerpt
                });
            }
            if (parameters.importPathExcerpt) {
                _this._importPathExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.DeclarationReference_ImportPath,
                    content: parameters.importPathExcerpt
                });
            }
            if (parameters.importHashExcerpt) {
                _this._importHashExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.DeclarationReference_ImportHash,
                    content: parameters.importHashExcerpt
                });
            }
            if (parameters.spacingAfterImportHashExcerpt) {
                _this._spacingAfterImportHashExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterImportHashExcerpt
                });
            }
        }
        else {
            _this._packageName = parameters.packageName;
            _this._importPath = parameters.importPath;
        }
        _this._memberReferences = [];
        if (parameters.memberReferences) {
            (_a = _this._memberReferences).push.apply(_a, parameters.memberReferences);
        }
        return _this;
    }
    Object.defineProperty(DocDeclarationReference.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.DeclarationReference;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocDeclarationReference.prototype, "packageName", {
        /**
         * The optional package name, which may optionally include an NPM scope.
         *
         * Example: `"@scope/my-package"`
         */
        get: function () {
            if (this._packageName === undefined) {
                if (this._packageNameExcerpt !== undefined) {
                    this._packageName = this._packageNameExcerpt.content.toString();
                }
            }
            return this._packageName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocDeclarationReference.prototype, "importPath", {
        /**
         * The optional import path.  If a package name is provided, then if an import path is provided,
         * the path must start with a "/" delimiter; otherwise paths are resolved relative to the source file
         * containing the reference.
         *
         * Example: `"/path1/path2"`
         * Example: `"./path1/path2"`
         * Example: `"../path2/path2"`
         */
        get: function () {
            if (this._importPath === undefined) {
                if (this._importPathExcerpt !== undefined) {
                    this._importPath = this._importPathExcerpt.content.toString();
                }
            }
            return this._importPath;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocDeclarationReference.prototype, "memberReferences", {
        /**
         * The chain of member references that indicate the declaration being referenced.
         * If this list is empty, then either the packageName or importPath must be provided,
         * because the reference refers to a module.
         */
        get: function () {
            return this._memberReferences;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Generates the TSDoc representation of this declaration reference.
     */
    DocDeclarationReference.prototype.emitAsTsdoc = function () {
        var stringBuilder = new StringBuilder_1.StringBuilder();
        var emitter = new TSDocEmitter_1.TSDocEmitter();
        emitter.renderDeclarationReference(stringBuilder, this);
        return stringBuilder.toString();
    };
    /** @override */
    DocDeclarationReference.prototype.onGetChildNodes = function () {
        return __spreadArray([
            this._packageNameExcerpt,
            this._importPathExcerpt,
            this._importHashExcerpt,
            this._spacingAfterImportHashExcerpt
        ], this._memberReferences, true);
    };
    return DocDeclarationReference;
}(DocNode_1.DocNode));
exports.DocDeclarationReference = DocDeclarationReference;
//# sourceMappingURL=DocDeclarationReference.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581,"../emitters/StringBuilder":1784796701585,"../emitters/TSDocEmitter":1784796701586}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701591, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocErrorText = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Represents a span of text that contained invalid markup.
 * The characters should be rendered as plain text.
 */
var DocErrorText = /** @class */ (function (_super) {
    __extends(DocErrorText, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocErrorText(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this._textExcerpt = new DocExcerpt_1.DocExcerpt({
            configuration: _this.configuration,
            excerptKind: DocExcerpt_1.ExcerptKind.ErrorText,
            content: parameters.textExcerpt
        });
        _this._messageId = parameters.messageId;
        _this._errorMessage = parameters.errorMessage;
        _this._errorLocation = parameters.errorLocation;
        return _this;
    }
    Object.defineProperty(DocErrorText.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.ErrorText;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocErrorText.prototype, "text", {
        /**
         * The characters that should be rendered as plain text because they
         * could not be parsed successfully.
         */
        get: function () {
            if (this._text === undefined) {
                this._text = this._textExcerpt.content.toString();
            }
            return this._text;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocErrorText.prototype, "textExcerpt", {
        get: function () {
            if (this._textExcerpt) {
                return this._textExcerpt.content;
            }
            else {
                return undefined;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocErrorText.prototype, "messageId", {
        /**
         * The TSDoc error message identifier.
         */
        get: function () {
            return this._messageId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocErrorText.prototype, "errorMessage", {
        /**
         * A description of why the character could not be parsed.
         */
        get: function () {
            return this._errorMessage;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocErrorText.prototype, "errorLocation", {
        /**
         * The range of characters that caused the error.  In general these may be
         * somewhat farther ahead in the input stream from the DocErrorText node itself.
         *
         * @remarks
         * For example, for the malformed HTML tag `<a href="123" @ /a>`, the DocErrorText node
         * will correspond to the `<` character that looked like an HTML tag, whereas the
         * error location might be the `@` character that caused the trouble.
         */
        get: function () {
            return this._errorLocation;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocErrorText.prototype.onGetChildNodes = function () {
        return [this._textExcerpt];
    };
    return DocErrorText;
}(DocNode_1.DocNode));
exports.DocErrorText = DocErrorText;
//# sourceMappingURL=DocErrorText.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701592, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocEscapedText = exports.EscapeStyle = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * The style of escaping to be used with DocEscapedText.
 */
var EscapeStyle;
(function (EscapeStyle) {
    /**
     * Use a backslash symbol to escape the character.
     */
    EscapeStyle[EscapeStyle["CommonMarkBackslash"] = 0] = "CommonMarkBackslash";
})(EscapeStyle || (exports.EscapeStyle = EscapeStyle = {}));
/**
 * Represents a text character that should be escaped as a TSDoc symbol.
 * @remarks
 * Note that renders will normally apply appropriate escaping when rendering
 * DocPlainText in a format such as HTML or TSDoc.  The DocEscapedText node
 * forces a specific escaping that may not be the default.
 */
var DocEscapedText = /** @class */ (function (_super) {
    __extends(DocEscapedText, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocEscapedText(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this._escapeStyle = parameters.escapeStyle;
        _this._encodedTextExcerpt = new DocExcerpt_1.DocExcerpt({
            configuration: _this.configuration,
            excerptKind: DocExcerpt_1.ExcerptKind.EscapedText,
            content: parameters.encodedTextExcerpt
        });
        _this._decodedText = parameters.decodedText;
        return _this;
    }
    Object.defineProperty(DocEscapedText.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.EscapedText;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocEscapedText.prototype, "escapeStyle", {
        /**
         * The style of escaping to be performed.
         */
        get: function () {
            return this._escapeStyle;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocEscapedText.prototype, "encodedText", {
        /**
         * The text sequence including escapes.
         */
        get: function () {
            if (this._encodedText === undefined) {
                this._encodedText = this._encodedTextExcerpt.content.toString();
            }
            return this._encodedText;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocEscapedText.prototype, "decodedText", {
        /**
         * The text without escaping.
         */
        get: function () {
            return this._decodedText;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocEscapedText.prototype.onGetChildNodes = function () {
        return [this._encodedTextExcerpt];
    };
    return DocEscapedText;
}(DocNode_1.DocNode));
exports.DocEscapedText = DocEscapedText;
//# sourceMappingURL=DocEscapedText.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701593, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocFencedCode = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Represents CommonMark-style code fence, i.e. a block of program code that
 * starts and ends with a line comprised of three backticks.  The opening delimiter
 * can also specify a language for a syntax highlighter.
 */
var DocFencedCode = /** @class */ (function (_super) {
    __extends(DocFencedCode, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocFencedCode(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._openingFenceExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.FencedCode_OpeningFence,
                content: parameters.openingFenceExcerpt
            });
            if (parameters.spacingAfterOpeningFenceExcerpt) {
                _this._spacingAfterOpeningFenceExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterOpeningFenceExcerpt
                });
            }
            if (parameters.languageExcerpt) {
                _this._languageExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.FencedCode_Language,
                    content: parameters.languageExcerpt
                });
            }
            if (parameters.spacingAfterLanguageExcerpt) {
                _this._spacingAfterLanguageExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterLanguageExcerpt
                });
            }
            _this._codeExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.FencedCode_Code,
                content: parameters.codeExcerpt
            });
            if (parameters.spacingBeforeClosingFenceExcerpt) {
                _this._spacingBeforeClosingFenceExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingBeforeClosingFenceExcerpt
                });
            }
            _this._closingFenceExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.FencedCode_ClosingFence,
                content: parameters.closingFenceExcerpt
            });
            if (parameters.spacingAfterClosingFenceExcerpt) {
                _this._spacingAfterClosingFenceExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterClosingFenceExcerpt
                });
            }
        }
        else {
            _this._code = parameters.code;
            _this._language = parameters.language;
        }
        return _this;
    }
    Object.defineProperty(DocFencedCode.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.FencedCode;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocFencedCode.prototype, "language", {
        /**
         * A name that can optionally be included after the opening code fence delimiter,
         * on the same line as the three backticks.  This name indicates the programming language
         * for the code, which a syntax highlighter may use to style the code block.
         *
         * @remarks
         * The TSDoc standard requires that the language "ts" should be interpreted to mean TypeScript.
         * Other languages names may be supported, but this is implementation dependent.
         *
         * CommonMark refers to this field as the "info string".
         *
         * @privateRemarks
         * Examples of language strings supported by GitHub flavored markdown:
         * https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml
         */
        get: function () {
            if (this._language === undefined) {
                if (this._languageExcerpt !== undefined) {
                    this._language = this._languageExcerpt.content.toString();
                }
                else {
                    this._language = '';
                }
            }
            return this._language;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocFencedCode.prototype, "code", {
        /**
         * The text that should be rendered as code.
         */
        get: function () {
            if (this._code === undefined) {
                if (this._codeExcerpt !== undefined) {
                    this._code = this._codeExcerpt.content.toString();
                }
            }
            return this._code;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocFencedCode.prototype.onGetChildNodes = function () {
        return [
            this._openingFenceExcerpt,
            this._spacingAfterOpeningFenceExcerpt,
            this._languageExcerpt,
            this._spacingAfterLanguageExcerpt,
            this._codeExcerpt,
            this._spacingBeforeClosingFenceExcerpt,
            this._closingFenceExcerpt,
            this._spacingAfterClosingFenceExcerpt
        ];
    };
    return DocFencedCode;
}(DocNode_1.DocNode));
exports.DocFencedCode = DocFencedCode;
//# sourceMappingURL=DocFencedCode.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701594, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocHtmlAttribute = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Represents an HTML attribute inside a DocHtmlStartTag or DocHtmlEndTag.
 *
 * Example: `href="#"` inside `<a href="#" />`
 */
var DocHtmlAttribute = /** @class */ (function (_super) {
    __extends(DocHtmlAttribute, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocHtmlAttribute(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._nameExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.HtmlAttribute_Name,
                content: parameters.nameExcerpt
            });
            if (parameters.spacingAfterNameExcerpt) {
                _this._spacingAfterNameExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterNameExcerpt
                });
            }
            _this._equalsExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.HtmlAttribute_Equals,
                content: parameters.equalsExcerpt
            });
            if (parameters.spacingAfterEqualsExcerpt) {
                _this._spacingAfterEqualsExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterEqualsExcerpt
                });
            }
            _this._valueExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.HtmlAttribute_Value,
                content: parameters.valueExcerpt
            });
            if (parameters.spacingAfterValueExcerpt) {
                _this._spacingAfterValueExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterValueExcerpt
                });
            }
        }
        else {
            _this._name = parameters.name;
            _this._spacingAfterName = parameters.spacingAfterName;
            _this._spacingAfterEquals = parameters.spacingAfterEquals;
            _this._value = parameters.value;
            _this._spacingAfterValue = parameters.spacingAfterValue;
        }
        return _this;
    }
    Object.defineProperty(DocHtmlAttribute.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.HtmlAttribute;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlAttribute.prototype, "name", {
        /**
         * The HTML attribute name.
         */
        get: function () {
            if (this._name === undefined) {
                this._name = this._nameExcerpt.content.toString();
            }
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlAttribute.prototype, "spacingAfterName", {
        /**
         * Explicit whitespace that a renderer should insert after the HTML attribute name.
         * If undefined, then the renderer can use a formatting rule to generate appropriate spacing.
         */
        get: function () {
            if (this._spacingAfterName === undefined) {
                if (this._spacingAfterNameExcerpt !== undefined) {
                    this._spacingAfterName = this._spacingAfterNameExcerpt.content.toString();
                }
            }
            return this._spacingAfterName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlAttribute.prototype, "spacingAfterEquals", {
        /**
         * Explicit whitespace that a renderer should insert after the "=".
         * If undefined, then the renderer can use a formatting rule to generate appropriate spacing.
         */
        get: function () {
            if (this._spacingAfterEquals === undefined) {
                if (this._spacingAfterEqualsExcerpt !== undefined) {
                    this._spacingAfterEquals = this._spacingAfterEqualsExcerpt.content.toString();
                }
            }
            return this._spacingAfterEquals;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlAttribute.prototype, "value", {
        /**
         * The HTML attribute value.
         */
        get: function () {
            if (this._value === undefined) {
                this._value = this._valueExcerpt.content.toString();
            }
            return this._value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlAttribute.prototype, "spacingAfterValue", {
        /**
         * Explicit whitespace that a renderer should insert after the HTML attribute name.
         * If undefined, then the renderer can use a formatting rule to generate appropriate spacing.
         */
        get: function () {
            if (this._spacingAfterValue === undefined) {
                if (this._spacingAfterValueExcerpt !== undefined) {
                    this._spacingAfterValue = this._spacingAfterValueExcerpt.content.toString();
                }
            }
            return this._spacingAfterValue;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocHtmlAttribute.prototype.onGetChildNodes = function () {
        return [
            this._nameExcerpt,
            this._spacingAfterNameExcerpt,
            this._equalsExcerpt,
            this._spacingAfterEqualsExcerpt,
            this._valueExcerpt,
            this._spacingAfterValueExcerpt
        ];
    };
    return DocHtmlAttribute;
}(DocNode_1.DocNode));
exports.DocHtmlAttribute = DocHtmlAttribute;
//# sourceMappingURL=DocHtmlAttribute.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701595, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocHtmlEndTag = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
var StringBuilder_1 = require("../emitters/StringBuilder");
var TSDocEmitter_1 = require("../emitters/TSDocEmitter");
/**
 * Represents an HTML end tag.  Example: `</a>`
 */
var DocHtmlEndTag = /** @class */ (function (_super) {
    __extends(DocHtmlEndTag, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocHtmlEndTag(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._openingDelimiterExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.HtmlEndTag_OpeningDelimiter,
                content: parameters.openingDelimiterExcerpt
            });
            _this._nameExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.HtmlEndTag_Name,
                content: parameters.nameExcerpt
            });
            if (parameters.spacingAfterNameExcerpt) {
                _this._spacingAfterNameExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterNameExcerpt
                });
            }
            _this._closingDelimiterExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.HtmlEndTag_ClosingDelimiter,
                content: parameters.closingDelimiterExcerpt
            });
        }
        else {
            _this._name = parameters.name;
        }
        return _this;
    }
    Object.defineProperty(DocHtmlEndTag.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.HtmlEndTag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlEndTag.prototype, "name", {
        /**
         * The HTML element name.
         */
        get: function () {
            if (this._name === undefined) {
                this._name = this._nameExcerpt.content.toString();
            }
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Generates the HTML for this tag.
     */
    DocHtmlEndTag.prototype.emitAsHtml = function () {
        // NOTE: Here we're assuming that the TSDoc representation for a tag is also a valid HTML expression.
        var stringBuilder = new StringBuilder_1.StringBuilder();
        var emitter = new TSDocEmitter_1.TSDocEmitter();
        emitter.renderHtmlTag(stringBuilder, this);
        return stringBuilder.toString();
    };
    /** @override */
    DocHtmlEndTag.prototype.onGetChildNodes = function () {
        return [
            this._openingDelimiterExcerpt,
            this._nameExcerpt,
            this._spacingAfterNameExcerpt,
            this._closingDelimiterExcerpt
        ];
    };
    return DocHtmlEndTag;
}(DocNode_1.DocNode));
exports.DocHtmlEndTag = DocHtmlEndTag;
//# sourceMappingURL=DocHtmlEndTag.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581,"../emitters/StringBuilder":1784796701585,"../emitters/TSDocEmitter":1784796701586}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701596, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocHtmlStartTag = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
var StringBuilder_1 = require("../emitters/StringBuilder");
var TSDocEmitter_1 = require("../emitters/TSDocEmitter");
/**
 * Represents an HTML start tag, which may or may not be self-closing.
 *
 * Example: `<a href="#" />`
 */
var DocHtmlStartTag = /** @class */ (function (_super) {
    __extends(DocHtmlStartTag, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocHtmlStartTag(parameters) {
        var _a;
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._openingDelimiterExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.HtmlStartTag_OpeningDelimiter,
                content: parameters.openingDelimiterExcerpt
            });
            _this._nameExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.HtmlStartTag_Name,
                content: parameters.nameExcerpt
            });
            if (parameters.spacingAfterNameExcerpt) {
                _this._spacingAfterNameExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterNameExcerpt
                });
            }
            _this._closingDelimiterExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.HtmlStartTag_ClosingDelimiter,
                content: parameters.closingDelimiterExcerpt
            });
        }
        else {
            _this._name = parameters.name;
            _this._spacingAfterName = parameters.spacingAfterName;
        }
        _this._htmlAttributes = [];
        if (parameters.htmlAttributes) {
            (_a = _this._htmlAttributes).push.apply(_a, parameters.htmlAttributes);
        }
        _this._selfClosingTag = !!parameters.selfClosingTag;
        return _this;
    }
    Object.defineProperty(DocHtmlStartTag.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.HtmlStartTag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlStartTag.prototype, "name", {
        /**
         * The HTML element name.
         */
        get: function () {
            if (this._name === undefined) {
                this._name = this._nameExcerpt.content.toString();
            }
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlStartTag.prototype, "htmlAttributes", {
        /**
         * The HTML attributes belonging to this HTML element.
         */
        get: function () {
            return this._htmlAttributes;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlStartTag.prototype, "selfClosingTag", {
        /**
         * If true, then the HTML tag ends with `/>` instead of `>`.
         */
        get: function () {
            return this._selfClosingTag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocHtmlStartTag.prototype, "spacingAfterName", {
        /**
         * Explicit whitespace that a renderer should insert after the HTML element name.
         * If undefined, then the renderer can use a formatting rule to generate appropriate spacing.
         */
        get: function () {
            if (this._spacingAfterName === undefined) {
                if (this._spacingAfterNameExcerpt !== undefined) {
                    this._spacingAfterName = this._spacingAfterNameExcerpt.content.toString();
                }
            }
            return this._spacingAfterName;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Generates the HTML for this tag.
     */
    DocHtmlStartTag.prototype.emitAsHtml = function () {
        // NOTE: Here we're assuming that the TSDoc representation for a tag is also a valid HTML expression.
        var stringBuilder = new StringBuilder_1.StringBuilder();
        var emitter = new TSDocEmitter_1.TSDocEmitter();
        emitter.renderHtmlTag(stringBuilder, this);
        return stringBuilder.toString();
    };
    /** @override */
    DocHtmlStartTag.prototype.onGetChildNodes = function () {
        return __spreadArray(__spreadArray([
            this._openingDelimiterExcerpt,
            this._nameExcerpt,
            this._spacingAfterNameExcerpt
        ], this._htmlAttributes, true), [
            this._closingDelimiterExcerpt
        ], false);
    };
    return DocHtmlStartTag;
}(DocNode_1.DocNode));
exports.DocHtmlStartTag = DocHtmlStartTag;
//# sourceMappingURL=DocHtmlStartTag.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581,"../emitters/StringBuilder":1784796701585,"../emitters/TSDocEmitter":1784796701586}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701597, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocInheritDocTag = void 0;
var DocNode_1 = require("./DocNode");
var DocInlineTagBase_1 = require("./DocInlineTagBase");
/**
 * Represents an `{@inheritDoc}` tag.
 */
var DocInheritDocTag = /** @class */ (function (_super) {
    __extends(DocInheritDocTag, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocInheritDocTag(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (_this.tagNameWithUpperCase !== '@INHERITDOC') {
            throw new Error('DocInheritDocTag requires the tag name to be "{@inheritDoc}"');
        }
        _this._declarationReference = parameters.declarationReference;
        return _this;
    }
    Object.defineProperty(DocInheritDocTag.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.InheritDocTag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocInheritDocTag.prototype, "declarationReference", {
        /**
         * The declaration that the documentation will be inherited from.
         * If omitted, the documentation will be inherited from the parent class.
         */
        get: function () {
            return this._declarationReference;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocInheritDocTag.prototype.getChildNodesForContent = function () {
        // abstract
        return [this._declarationReference];
    };
    return DocInheritDocTag;
}(DocInlineTagBase_1.DocInlineTagBase));
exports.DocInheritDocTag = DocInheritDocTag;
//# sourceMappingURL=DocInheritDocTag.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocInlineTagBase":1784796701598}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701598, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocInlineTagBase = void 0;
var DocNode_1 = require("./DocNode");
var StringChecks_1 = require("../parser/StringChecks");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * The abstract base class for {@link DocInlineTag}, {@link DocLinkTag}, and {@link DocInheritDocTag}.
 */
var DocInlineTagBase = /** @class */ (function (_super) {
    __extends(DocInlineTagBase, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocInlineTagBase(parameters) {
        var _this = _super.call(this, parameters) || this;
        StringChecks_1.StringChecks.validateTSDocTagName(parameters.tagName);
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._openingDelimiterExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.InlineTag_OpeningDelimiter,
                content: parameters.openingDelimiterExcerpt
            });
            _this._tagNameExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.InlineTag_TagName,
                content: parameters.tagNameExcerpt
            });
            if (parameters.spacingAfterTagNameExcerpt) {
                _this._spacingAfterTagNameExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterTagNameExcerpt
                });
            }
            _this._closingDelimiterExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.InlineTag_ClosingDelimiter,
                content: parameters.closingDelimiterExcerpt
            });
        }
        _this._tagName = parameters.tagName;
        _this._tagNameWithUpperCase = parameters.tagName.toUpperCase();
        return _this;
    }
    Object.defineProperty(DocInlineTagBase.prototype, "tagName", {
        /**
         * The TSDoc tag name.  TSDoc tag names start with an at-sign (`@`) followed
         * by ASCII letters using "camelCase" capitalization.
         *
         * @remarks
         * For example, if the inline tag is `{@link Guid.toString | the toString() method}`
         * then the tag name would be `@link`.
         */
        get: function () {
            return this._tagName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocInlineTagBase.prototype, "tagNameWithUpperCase", {
        /**
         * The TSDoc tag name in all capitals, which is used for performing
         * case-insensitive comparisons or lookups.
         */
        get: function () {
            return this._tagNameWithUpperCase;
        },
        enumerable: false,
        configurable: true
    });
    /** @override @sealed */
    DocInlineTagBase.prototype.onGetChildNodes = function () {
        return __spreadArray(__spreadArray([
            this._openingDelimiterExcerpt,
            this._tagNameExcerpt,
            this._spacingAfterTagNameExcerpt
        ], this.getChildNodesForContent(), true), [
            this._closingDelimiterExcerpt
        ], false);
    };
    return DocInlineTagBase;
}(DocNode_1.DocNode));
exports.DocInlineTagBase = DocInlineTagBase;
//# sourceMappingURL=DocInlineTagBase.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"../parser/StringChecks":1784796701563,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701599, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocInlineTag = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
var DocInlineTagBase_1 = require("./DocInlineTagBase");
/**
 * Represents a generic TSDoc inline tag, including custom tags.
 *
 * @remarks
 * NOTE: Certain tags such as `{@link}` and `{@inheritDoc}` have specialized structures and parser rules,
 * and thus are represented using {@link DocLinkTag} or {@link DocInheritDocTag} instead.  However, if the
 * specialized parser rule encounters a syntax error, but the outer framing is correct, then the parser constructs
 * a generic `DocInlineTag` instead of `DocErrorText`.  This means, for example, that it is possible sometimes for
 * `DocInlineTag.tagName` to be `"@link"`.
 */
var DocInlineTag = /** @class */ (function (_super) {
    __extends(DocInlineTag, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocInlineTag(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            if (parameters.tagContentExcerpt) {
                _this._tagContentExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.InlineTag_TagContent,
                    content: parameters.tagContentExcerpt
                });
            }
        }
        else {
            _this._tagContent = parameters.tagContent;
        }
        return _this;
    }
    Object.defineProperty(DocInlineTag.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.InlineTag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocInlineTag.prototype, "tagContent", {
        /**
         * The tag content.
         * @remarks
         * For example, if the tag is `{@myTag x=12.34 y=56.78 }` then the tag content
         * would be `x=12.34 y=56.78 `, including the trailing space but not the leading space.
         */
        get: function () {
            if (this._tagContent === undefined) {
                if (this._tagContentExcerpt) {
                    this._tagContent = this._tagContentExcerpt.content.toString();
                }
                else {
                    return '';
                }
            }
            return this._tagContent;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocInlineTag.prototype.getChildNodesForContent = function () {
        // abstract
        return [this._tagContentExcerpt];
    };
    return DocInlineTag;
}(DocInlineTagBase_1.DocInlineTagBase));
exports.DocInlineTag = DocInlineTag;
//# sourceMappingURL=DocInlineTag.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581,"./DocInlineTagBase":1784796701598}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701600, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocLinkTag = void 0;
var DocNode_1 = require("./DocNode");
var DocInlineTagBase_1 = require("./DocInlineTagBase");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Represents an `{@link}` tag.
 */
var DocLinkTag = /** @class */ (function (_super) {
    __extends(DocLinkTag, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocLinkTag(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (_this.tagNameWithUpperCase !== '@LINK') {
            throw new Error('DocLinkTag requires the tag name to be "{@link}"');
        }
        _this._codeDestination = parameters.codeDestination;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            if (parameters.codeDestination !== undefined && parameters.urlDestinationExcerpt !== undefined) {
                throw new Error('Either the codeDestination or the urlDestination may be specified, but not both');
            }
            if (parameters.urlDestinationExcerpt) {
                _this._urlDestinationExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.LinkTag_UrlDestination,
                    content: parameters.urlDestinationExcerpt
                });
            }
            if (parameters.spacingAfterDestinationExcerpt) {
                _this._spacingAfterDestinationExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterDestinationExcerpt
                });
            }
            if (parameters.pipeExcerpt) {
                _this._pipeExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.LinkTag_Pipe,
                    content: parameters.pipeExcerpt
                });
            }
            if (parameters.spacingAfterPipeExcerpt) {
                _this._spacingAfterPipeExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterPipeExcerpt
                });
            }
            if (parameters.linkTextExcerpt) {
                _this._linkTextExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.LinkTag_LinkText,
                    content: parameters.linkTextExcerpt
                });
            }
            if (parameters.spacingAfterLinkTextExcerpt) {
                _this._spacingAfterLinkTextExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterLinkTextExcerpt
                });
            }
        }
        else {
            if (parameters.codeDestination !== undefined && parameters.urlDestination !== undefined) {
                throw new Error('Either the codeDestination or the urlDestination may be specified, but not both');
            }
            _this._urlDestination = parameters.urlDestination;
            _this._linkText = parameters.linkText;
        }
        return _this;
    }
    Object.defineProperty(DocLinkTag.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.LinkTag;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocLinkTag.prototype, "codeDestination", {
        /**
         * If the link tag refers to a declaration, this returns the declaration reference object;
         * otherwise this property is undefined.
         * @remarks
         * Either the `codeDestination` or the `urlDestination` property will be defined, but never both.
         */
        get: function () {
            return this._codeDestination;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocLinkTag.prototype, "urlDestination", {
        /**
         * If the link tag was an ordinary URI, this returns the URL string;
         * otherwise this property is undefined.
         * @remarks
         * Either the `codeDestination` or the `urlDestination` property will be defined, but never both.
         */
        get: function () {
            if (this._urlDestination === undefined) {
                if (this._urlDestinationExcerpt !== undefined) {
                    this._urlDestination = this._urlDestinationExcerpt.content.toString();
                }
            }
            return this._urlDestination;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocLinkTag.prototype, "linkText", {
        /**
         * An optional text string that is the hyperlink text.  If omitted, the documentation
         * renderer will use a default string based on the link itself (e.g. the URL text
         * or the declaration identifier).
         *
         * @remarks
         *
         * In HTML, the hyperlink can include leading/trailing space characters around the link text.
         * For example, this HTML will cause a web browser to `y` and also the space character before
         * and after it:
         *
         * ```html
         * x<a href="#Button"> y </a> z
         * ```
         *
         * Unlike HTML, TSDoc trims leading/trailing spaces.  For example, this TSDoc will be
         * displayed `xy z` and underline only the `y` character:
         *
         * ```
         * x{@link Button | y } z
         * ```
         */
        get: function () {
            if (this._linkText === undefined) {
                if (this._linkTextExcerpt !== undefined) {
                    this._linkText = this._linkTextExcerpt.content.toString();
                }
            }
            return this._linkText;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocLinkTag.prototype.getChildNodesForContent = function () {
        // abstract
        return [
            this._codeDestination,
            this._urlDestinationExcerpt,
            this._spacingAfterDestinationExcerpt,
            this._pipeExcerpt,
            this._spacingAfterPipeExcerpt,
            this._linkTextExcerpt,
            this._spacingAfterLinkTextExcerpt
        ];
    };
    return DocLinkTag;
}(DocInlineTagBase_1.DocInlineTagBase));
exports.DocLinkTag = DocLinkTag;
//# sourceMappingURL=DocLinkTag.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocInlineTagBase":1784796701598,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701601, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocMemberIdentifier = void 0;
var DocNode_1 = require("./DocNode");
var StringChecks_1 = require("../parser/StringChecks");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * A member identifier is part of a {@link DocMemberReference}.
 */
var DocMemberIdentifier = /** @class */ (function (_super) {
    __extends(DocMemberIdentifier, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocMemberIdentifier(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            if (parameters.leftQuoteExcerpt) {
                _this._leftQuoteExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.MemberIdentifier_LeftQuote,
                    content: parameters.leftQuoteExcerpt
                });
            }
            _this._identifierExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.MemberIdentifier_Identifier,
                content: parameters.identifierExcerpt
            });
            if (parameters.rightQuoteExcerpt) {
                _this._rightQuoteExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.MemberIdentifier_RightQuote,
                    content: parameters.rightQuoteExcerpt
                });
            }
        }
        else {
            _this._identifier = parameters.identifier;
        }
        return _this;
    }
    /**
     * Tests whether the input string can be used without quotes as a member identifier in a declaration reference.
     * If not, {@link DocMemberIdentifier.hasQuotes} will be required.
     *
     * @remarks
     * In order to be used without quotes, the string must follow the identifier syntax for ECMAScript / TypeScript,
     * and it must not be one of the reserved words used for system selectors (such as `instance`, `static`,
     * `constructor`, etc).
     */
    DocMemberIdentifier.isValidIdentifier = function (identifier) {
        return !StringChecks_1.StringChecks.explainIfInvalidUnquotedMemberIdentifier(identifier);
    };
    Object.defineProperty(DocMemberIdentifier.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.MemberIdentifier;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberIdentifier.prototype, "identifier", {
        /**
         * The identifier string without any quote encoding.
         *
         * @remarks
         * If the value is not a valid ECMAScript identifier, it will be quoted as a
         * string literal during rendering.
         */
        get: function () {
            if (this._identifier === undefined) {
                this._identifier = this._identifierExcerpt.content.toString();
            }
            return this._identifier;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberIdentifier.prototype, "hasQuotes", {
        /**
         * Returns true if the identifier will be rendered as a quoted string literal
         * instead of as a programming language identifier.  This is required if the
         * `identifier` property is not a valid ECMAScript identifier.
         */
        get: function () {
            if (this._identifierExcerpt) {
                return !!this._leftQuoteExcerpt;
            }
            else {
                return !DocMemberIdentifier.isValidIdentifier(this.identifier);
            }
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocMemberIdentifier.prototype.onGetChildNodes = function () {
        return [this._leftQuoteExcerpt, this._identifierExcerpt, this._rightQuoteExcerpt];
    };
    return DocMemberIdentifier;
}(DocNode_1.DocNode));
exports.DocMemberIdentifier = DocMemberIdentifier;
//# sourceMappingURL=DocMemberIdentifier.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"../parser/StringChecks":1784796701563,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701602, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocMemberReference = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * A {@link DocDeclarationReference | declaration reference} includes a chain of
 * member references represented using `DocMemberReference` nodes.
 *
 * @remarks
 * For example, `example-library#ui.controls.Button.(render:static)` is a
 * declaration reference that contains three member references:
 * `ui`, `.controls`, and `.Button`, and `.(render:static)`.
 */
var DocMemberReference = /** @class */ (function (_super) {
    __extends(DocMemberReference, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocMemberReference(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._hasDot = !!parameters.dotExcerpt;
            if (parameters.dotExcerpt) {
                _this._dotExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.MemberReference_Dot,
                    content: parameters.dotExcerpt
                });
            }
            if (parameters.spacingAfterDotExcerpt) {
                _this._spacingAfterDotExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterDotExcerpt
                });
            }
            if (parameters.leftParenthesisExcerpt) {
                _this._leftParenthesisExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.MemberReference_LeftParenthesis,
                    content: parameters.leftParenthesisExcerpt
                });
            }
            if (parameters.spacingAfterLeftParenthesisExcerpt) {
                _this._spacingAfterLeftParenthesisExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterLeftParenthesisExcerpt
                });
            }
            if (parameters.spacingAfterMemberExcerpt) {
                _this._spacingAfterMemberExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterMemberExcerpt
                });
            }
            if (parameters.colonExcerpt) {
                _this._colonExcerpt = new DocExcerpt_1.DocExcerpt({
                    excerptKind: DocExcerpt_1.ExcerptKind.MemberReference_Colon,
                    configuration: _this.configuration,
                    content: parameters.colonExcerpt
                });
            }
            if (parameters.spacingAfterColonExcerpt) {
                _this._spacingAfterColonExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterColonExcerpt
                });
            }
            if (parameters.spacingAfterSelectorExcerpt) {
                _this._spacingAfterSelectorExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterSelectorExcerpt
                });
            }
            if (parameters.rightParenthesisExcerpt) {
                _this._rightParenthesisExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.MemberReference_RightParenthesis,
                    content: parameters.rightParenthesisExcerpt
                });
            }
            if (parameters.spacingAfterRightParenthesisExcerpt) {
                _this._spacingAfterRightParenthesisExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterRightParenthesisExcerpt
                });
            }
        }
        else {
            _this._hasDot = parameters.hasDot;
        }
        _this._memberIdentifier = parameters.memberIdentifier;
        _this._memberSymbol = parameters.memberSymbol;
        _this._selector = parameters.selector;
        return _this;
    }
    Object.defineProperty(DocMemberReference.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.MemberReference;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberReference.prototype, "hasDot", {
        /**
         * True if this member reference is preceded by a dot (".") token.
         * It should be false only for the first member in the chain.
         */
        get: function () {
            return this._hasDot;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberReference.prototype, "memberIdentifier", {
        /**
         * The identifier for the referenced member.
         * @remarks
         * Either `memberIdentifier` or `memberSymbol` may be specified, but not both.
         */
        get: function () {
            return this._memberIdentifier;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberReference.prototype, "memberSymbol", {
        /**
         * The ECMAScript 6 symbol expression, which may be used instead of an identifier
         * to indicate the referenced member.
         * @remarks
         * Either `memberIdentifier` or `memberSymbol` may be specified, but not both.
         */
        get: function () {
            return this._memberSymbol;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberReference.prototype, "selector", {
        /**
         * A TSDoc selector, which may be optionally when the identifier or symbol is insufficient
         * to unambiguously determine the referenced declaration.
         */
        get: function () {
            return this._selector;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocMemberReference.prototype.onGetChildNodes = function () {
        return [
            this._dotExcerpt,
            this._spacingAfterDotExcerpt,
            this._leftParenthesisExcerpt,
            this._spacingAfterLeftParenthesisExcerpt,
            this._memberIdentifier,
            this._memberSymbol,
            this._spacingAfterMemberExcerpt,
            this._colonExcerpt,
            this._spacingAfterColonExcerpt,
            this._selector,
            this._spacingAfterSelectorExcerpt,
            this._rightParenthesisExcerpt,
            this._spacingAfterRightParenthesisExcerpt
        ];
    };
    return DocMemberReference;
}(DocNode_1.DocNode));
exports.DocMemberReference = DocMemberReference;
//# sourceMappingURL=DocMemberReference.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701603, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocMemberSelector = exports.SelectorKind = void 0;
var DocNode_1 = require("./DocNode");
var StringChecks_1 = require("../parser/StringChecks");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Kinds of TSDoc selectors.
 */
var SelectorKind;
(function (SelectorKind) {
    /**
     * Used in cases where the parser encounters a string that is incorrect but
     * valid enough that a DocMemberSelector node was created.
     */
    SelectorKind["Error"] = "error";
    /**
     * System selectors are always all lower-case and belong to a set of predefined label names.
     */
    SelectorKind["System"] = "system";
    /**
     * Index selectors are integer numbers.  They provide an alternative way of referencing
     * overloaded functions, based on the order in which the declarations appear in
     * a source file.
     *
     * @remarks
     * Warning:  Index selectors are not recommended; they are intended to provide a temporary
     * workaround for situations where an external library neglected to declare a `{@label}` tag
     * and cannot be easily fixed.
     */
    SelectorKind["Index"] = "index";
    /**
     * Label selectors refer to labels created using the `{@label}` TSDoc tag.
     * The labels are always comprised of upper-case letters or numbers separated by underscores,
     * and the first character cannot be a number.
     */
    SelectorKind["Label"] = "label";
})(SelectorKind || (exports.SelectorKind = SelectorKind = {}));
/**
 */
var DocMemberSelector = /** @class */ (function (_super) {
    __extends(DocMemberSelector, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocMemberSelector(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._selectorExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.MemberSelector,
                content: parameters.selectorExcerpt
            });
            _this._selector = parameters.selectorExcerpt.toString();
        }
        else {
            _this._selector = parameters.selector;
        }
        _this._selectorKind = SelectorKind.Error;
        _this._errorMessage = undefined;
        // The logic below will always either (1) assign selectorKind or (2) else assign an errorMessage
        if (_this._selector.length === 0) {
            _this._errorMessage = 'The selector cannot be an empty string';
        }
        else if (DocMemberSelector._likeIndexSelectorRegExp.test(_this._selector)) {
            // It looks like an index selector
            if (DocMemberSelector._indexSelectorRegExp.test(_this._selector)) {
                _this._selectorKind = SelectorKind.Index;
            }
            else {
                _this._errorMessage = 'If the selector begins with a number, it must be a positive integer value';
            }
        }
        else if (DocMemberSelector._likeLabelSelectorRegExp.test(_this._selector)) {
            // It looks like a label selector
            if (DocMemberSelector._labelSelectorRegExp.test(_this._selector)) {
                _this._selectorKind = SelectorKind.Label;
            }
            else {
                _this._errorMessage =
                    'A label selector must be comprised of upper case letters, numbers,' +
                        ' and underscores and must not start with a number';
            }
        }
        else {
            if (StringChecks_1.StringChecks.isSystemSelector(_this._selector)) {
                _this._selectorKind = SelectorKind.System;
            }
            else if (DocMemberSelector._likeSystemSelectorRegExp.test(_this._selector)) {
                // It looks like a system selector, but is not
                _this._errorMessage =
                    "The selector ".concat(JSON.stringify(_this._selector)) +
                        " is not a recognized TSDoc system selector name";
            }
            else {
                // It doesn't look like anything we recognize
                _this._errorMessage = 'Invalid syntax for selector';
            }
        }
        return _this;
    }
    Object.defineProperty(DocMemberSelector.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.MemberSelector;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberSelector.prototype, "selector", {
        /**
         * The text representation of the selector.
         *
         * @remarks
         * For system selectors, it will be a predefined lower case name.
         * For label selectors, it will be an upper case name defined using the `{@label}` tag.
         * For index selectors, it will be a positive integer.
         */
        get: function () {
            return this._selector;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberSelector.prototype, "selectorKind", {
        /**
         * Indicates the kind of selector.
         */
        get: function () {
            return this._selectorKind;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberSelector.prototype, "errorMessage", {
        /**
         * If the `selectorKind` is `SelectorKind.Error`, this string will be defined and provide
         * more detail about why the string was not valid.
         */
        get: function () {
            return this._errorMessage;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocMemberSelector.prototype.onGetChildNodes = function () {
        return [this._selectorExcerpt];
    };
    DocMemberSelector._likeIndexSelectorRegExp = /^[0-9]/;
    DocMemberSelector._indexSelectorRegExp = /^[1-9][0-9]*$/;
    DocMemberSelector._likeLabelSelectorRegExp = /^[A-Z_]/u;
    DocMemberSelector._labelSelectorRegExp = /^[A-Z_][A-Z0-9_]+$/;
    DocMemberSelector._likeSystemSelectorRegExp = /^[a-z]+$/u;
    return DocMemberSelector;
}(DocNode_1.DocNode));
exports.DocMemberSelector = DocMemberSelector;
//# sourceMappingURL=DocMemberSelector.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"../parser/StringChecks":1784796701563,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701604, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocMemberSymbol = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Represents a reference to an ECMAScript 6 symbol that is used
 * to identify a member declaration.
 *
 * @example
 *
 * In the declaration reference `{@link MyClass.([MySymbols.example]:instance)}`,
 * the member symbol `[MySymbols.example]` might be used to reference a property
 * of the class.
 */
var DocMemberSymbol = /** @class */ (function (_super) {
    __extends(DocMemberSymbol, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocMemberSymbol(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._leftBracketExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.DocMemberSymbol_LeftBracket,
                content: parameters.leftBracketExcerpt
            });
            if (parameters.spacingAfterLeftBracketExcerpt) {
                _this._spacingAfterLeftBracketExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterLeftBracketExcerpt
                });
            }
            _this._rightBracketExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.DocMemberSymbol_RightBracket,
                content: parameters.rightBracketExcerpt
            });
        }
        _this._symbolReference = parameters.symbolReference;
        return _this;
    }
    Object.defineProperty(DocMemberSymbol.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.MemberSymbol;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocMemberSymbol.prototype, "symbolReference", {
        /**
         * The declaration reference for the ECMAScript 6 symbol that will act as
         * the identifier for the member.
         */
        get: function () {
            return this._symbolReference;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocMemberSymbol.prototype.onGetChildNodes = function () {
        return [
            this._leftBracketExcerpt,
            this._spacingAfterLeftBracketExcerpt,
            this._symbolReference,
            this._rightBracketExcerpt
        ];
    };
    return DocMemberSymbol;
}(DocNode_1.DocNode));
exports.DocMemberSymbol = DocMemberSymbol;
//# sourceMappingURL=DocMemberSymbol.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701605, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocParamBlock = void 0;
var DocNode_1 = require("./DocNode");
var DocBlock_1 = require("./DocBlock");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Represents a parsed `@param` or `@typeParam` block, which provides a description for a
 * function parameter.
 */
var DocParamBlock = /** @class */ (function (_super) {
    __extends(DocParamBlock, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocParamBlock(parameters) {
        var _this = _super.call(this, parameters) || this;
        _this._parameterName = parameters.parameterName;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            if (parameters.spacingBeforeParameterNameExcerpt) {
                _this._spacingBeforeParameterNameExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingBeforeParameterNameExcerpt
                });
            }
            if (parameters.unsupportedJsdocTypeBeforeParameterNameExcerpt) {
                _this._unsupportedJsdocTypeBeforeParameterNameExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.NonstandardText,
                    content: parameters.unsupportedJsdocTypeBeforeParameterNameExcerpt
                });
            }
            if (parameters.unsupportedJsdocOptionalNameOpenBracketExcerpt) {
                _this._unsupportedJsdocOptionalNameOpenBracketExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.NonstandardText,
                    content: parameters.unsupportedJsdocOptionalNameOpenBracketExcerpt
                });
            }
            _this._parameterNameExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.ParamBlock_ParameterName,
                content: parameters.parameterNameExcerpt
            });
            if (parameters.unsupportedJsdocOptionalNameRestExcerpt) {
                _this._unsupportedJsdocOptionalNameRestExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.NonstandardText,
                    content: parameters.unsupportedJsdocOptionalNameRestExcerpt
                });
            }
            if (parameters.spacingAfterParameterNameExcerpt) {
                _this._spacingAfterParameterNameExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterParameterNameExcerpt
                });
            }
            if (parameters.unsupportedJsdocTypeAfterParameterNameExcerpt) {
                _this._unsupportedJsdocTypeAfterParameterNameExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.NonstandardText,
                    content: parameters.unsupportedJsdocTypeAfterParameterNameExcerpt
                });
            }
            if (parameters.hyphenExcerpt) {
                _this._hyphenExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.ParamBlock_Hyphen,
                    content: parameters.hyphenExcerpt
                });
            }
            if (parameters.spacingAfterHyphenExcerpt) {
                _this._spacingAfterHyphenExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.Spacing,
                    content: parameters.spacingAfterHyphenExcerpt
                });
            }
            if (parameters.unsupportedJsdocTypeAfterHyphenExcerpt) {
                _this._unsupportedJsdocTypeAfterHyphenExcerpt = new DocExcerpt_1.DocExcerpt({
                    configuration: _this.configuration,
                    excerptKind: DocExcerpt_1.ExcerptKind.NonstandardText,
                    content: parameters.unsupportedJsdocTypeAfterHyphenExcerpt
                });
            }
        }
        return _this;
    }
    Object.defineProperty(DocParamBlock.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.ParamBlock;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocParamBlock.prototype, "parameterName", {
        /**
         * The name of the parameter that is being documented.
         * For example "width" in `@param width - the width of the object`.
         */
        get: function () {
            return this._parameterName;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocParamBlock.prototype.onGetChildNodes = function () {
        return [
            this.blockTag,
            this._spacingBeforeParameterNameExcerpt,
            this._unsupportedJsdocTypeBeforeParameterNameExcerpt,
            this._unsupportedJsdocOptionalNameOpenBracketExcerpt,
            this._parameterNameExcerpt,
            this._unsupportedJsdocOptionalNameRestExcerpt,
            this._spacingAfterParameterNameExcerpt,
            this._unsupportedJsdocTypeAfterParameterNameExcerpt,
            this._hyphenExcerpt,
            this._spacingAfterHyphenExcerpt,
            this._unsupportedJsdocTypeAfterHyphenExcerpt,
            this.content
        ];
    };
    return DocParamBlock;
}(DocBlock_1.DocBlock));
exports.DocParamBlock = DocParamBlock;
//# sourceMappingURL=DocParamBlock.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocBlock":1784796701576,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701606, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocPlainText = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Represents a span of comment text that is considered by the parser
 * to contain no special symbols or meaning.
 *
 * @remarks
 * The text content must not contain newline characters.
 * Use DocSoftBreak to represent manual line splitting.
 */
var DocPlainText = /** @class */ (function (_super) {
    __extends(DocPlainText, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocPlainText(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            _this._textExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.PlainText,
                content: parameters.textExcerpt
            });
        }
        else {
            if (DocPlainText._newlineCharacterRegExp.test(parameters.text)) {
                // Use DocSoftBreak to represent manual line splitting
                throw new Error('The DocPlainText content must not contain newline characters');
            }
            _this._text = parameters.text;
        }
        return _this;
    }
    Object.defineProperty(DocPlainText.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.PlainText;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocPlainText.prototype, "text", {
        /**
         * The text content.
         */
        get: function () {
            if (this._text === undefined) {
                this._text = this._textExcerpt.content.toString();
            }
            return this._text;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DocPlainText.prototype, "textExcerpt", {
        get: function () {
            if (this._textExcerpt) {
                return this._textExcerpt.content;
            }
            else {
                return undefined;
            }
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocPlainText.prototype.onGetChildNodes = function () {
        return [this._textExcerpt];
    };
    // TODO: We should also prohibit "\r", but this requires updating LineExtractor
    // to interpret a lone "\r" as a newline
    DocPlainText._newlineCharacterRegExp = /[\n]/;
    return DocPlainText;
}(DocNode_1.DocNode));
exports.DocPlainText = DocPlainText;
//# sourceMappingURL=DocPlainText.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701607, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocSoftBreak = void 0;
var DocNode_1 = require("./DocNode");
var DocExcerpt_1 = require("./DocExcerpt");
/**
 * Instructs a renderer to insert an explicit newline in the output.
 * (Normally the renderer uses a formatting rule to determine where
 * lines should wrap.)
 *
 * @remarks
 * In HTML, a soft break is represented as an ASCII newline character (which does not
 * affect the web browser's view), whereas the hard break is the `<br />` element
 * (which starts a new line in the web browser's view).
 *
 * TSDoc follows the same conventions, except the renderer avoids emitting
 * two empty lines (because that could start a new CommonMark paragraph).
 */
var DocSoftBreak = /** @class */ (function (_super) {
    __extends(DocSoftBreak, _super);
    /**
     * Don't call this directly.  Instead use {@link TSDocParser}
     * @internal
     */
    function DocSoftBreak(parameters) {
        var _this = _super.call(this, parameters) || this;
        if (DocNode_1.DocNode.isParsedParameters(parameters)) {
            // The type is IDocNodeParsedParameters, which is a base of IDocSoftBreakParsedParameters
            // but not a base of IDocSoftBreakParameters. Therefore the type must be IDocSoftBreakParsedParameters.
            // TypeScript 4 could infer this, but for some reason TypeScript 5 cannot.
            var parsedParameters = parameters;
            _this._softBreakExcerpt = new DocExcerpt_1.DocExcerpt({
                configuration: _this.configuration,
                excerptKind: DocExcerpt_1.ExcerptKind.SoftBreak,
                content: parsedParameters.softBreakExcerpt
            });
        }
        return _this;
    }
    Object.defineProperty(DocSoftBreak.prototype, "kind", {
        /** @override */
        get: function () {
            return DocNode_1.DocNodeKind.SoftBreak;
        },
        enumerable: false,
        configurable: true
    });
    /** @override */
    DocSoftBreak.prototype.onGetChildNodes = function () {
        return [this._softBreakExcerpt];
    };
    return DocSoftBreak;
}(DocNode_1.DocNode));
exports.DocSoftBreak = DocSoftBreak;
//# sourceMappingURL=DocSoftBreak.js.map
}, function(modId) { var map = {"./DocNode":1784796701570,"./DocExcerpt":1784796701581}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701608, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserContext = void 0;
var TextRange_1 = require("./TextRange");
var nodes_1 = require("../nodes");
var ParserMessageLog_1 = require("./ParserMessageLog");
/**
 * An internal data structure that tracks all the state being built up by the various
 * parser stages.
 */
var ParserContext = /** @class */ (function () {
    function ParserContext(configuration, sourceRange) {
        /**
         * The text range starting from the opening `/**` and ending with
         * the closing `*\/` delimiter.
         */
        this.commentRange = TextRange_1.TextRange.empty;
        /**
         * The text ranges corresponding to the lines of content inside the comment.
         */
        this.lines = [];
        /**
         * A complete list of all tokens that were extracted from the input lines.
         */
        this.tokens = [];
        this.configuration = configuration;
        this.sourceRange = sourceRange;
        this.docComment = new nodes_1.DocComment({ configuration: this.configuration });
        this.log = new ParserMessageLog_1.ParserMessageLog();
    }
    return ParserContext;
}());
exports.ParserContext = ParserContext;
//# sourceMappingURL=ParserContext.js.map
}, function(modId) { var map = {"./TextRange":1784796701609,"../nodes":1784796701575,"./ParserMessageLog":1784796701610}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701609, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextRange = void 0;
/**
 * Efficiently references a range of text from a string buffer.
 */
var TextRange = /** @class */ (function () {
    function TextRange(buffer, pos, end) {
        this.buffer = buffer;
        this.pos = pos;
        this.end = end;
        this._validateBounds();
    }
    /**
     * Constructs a TextRange that corresponds to an entire string object.
     */
    TextRange.fromString = function (buffer) {
        return new TextRange(buffer, 0, buffer.length);
    };
    /**
     * Constructs a TextRange that corresponds to an entire string object.
     */
    TextRange.fromStringRange = function (buffer, pos, end) {
        return new TextRange(buffer, pos, end);
    };
    Object.defineProperty(TextRange.prototype, "length", {
        /**
         * Returns the length of the text range.
         * @remarks
         * This value is calculated as the `end` property minus the `pos` property.
         */
        get: function () {
            return this.end - this.pos;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Constructs a TextRange that corresponds to a different range of an existing buffer.
     */
    TextRange.prototype.getNewRange = function (pos, end) {
        return new TextRange(this.buffer, pos, end);
    };
    /**
     * Returns true if the length of the range is zero.  Note that the object reference may not
     * be equal to `TextRange.empty`, and the buffer may be different.
     */
    TextRange.prototype.isEmpty = function () {
        return this.pos === this.end;
    };
    /**
     * Returns the range from the associated string buffer.
     */
    TextRange.prototype.toString = function () {
        return this.buffer.substring(this.pos, this.end);
    };
    /**
     * Returns a debugging dump of the range, indicated via custom delimiters.
     * @remarks
     * For example if the delimiters are "[" and "]", and the range is 3..5 inside "1234567",
     * then the output would be "12[345]67".
     */
    TextRange.prototype.getDebugDump = function (posDelimiter, endDelimiter) {
        return (this.buffer.substring(0, this.pos) +
            posDelimiter +
            this.buffer.substring(this.pos, this.end) +
            endDelimiter +
            this.buffer.substring(this.end));
    };
    /**
     * Calculates the line and column number for the specified offset into the buffer.
     *
     * @remarks
     * This is a potentially expensive operation.
     *
     * @param index - an integer offset
     * @param buffer - the buffer
     */
    TextRange.prototype.getLocation = function (index) {
        if (index < 0 || index > this.buffer.length) {
            // No match
            return { line: 0, column: 0 };
        }
        // TODO: Consider caching or optimizing this somehow
        var line = 1;
        var column = 1;
        var currentIndex = 0;
        while (currentIndex < index) {
            var current = this.buffer[currentIndex];
            ++currentIndex;
            if (current === '\r') {
                // CR
                // Ignore '\r' and assume it will always have an accompanying '\n'
                continue;
            }
            if (current === '\n') {
                // LF
                ++line;
                column = 1;
            }
            else {
                // NOTE: For consistency with the TypeScript compiler, a tab character is assumed
                // to advance by one column
                ++column;
            }
        }
        return { line: line, column: column };
    };
    TextRange.prototype._validateBounds = function () {
        if (this.pos < 0) {
            throw new Error('TextRange.pos cannot be negative');
        }
        if (this.end < 0) {
            throw new Error('TextRange.end cannot be negative');
        }
        if (this.end < this.pos) {
            throw new Error('TextRange.end cannot be smaller than TextRange.pos');
        }
        if (this.pos > this.buffer.length) {
            throw new Error('TextRange.pos cannot exceed the associated text buffer length');
        }
        if (this.end > this.buffer.length) {
            throw new Error('TextRange.end cannot exceed the associated text buffer length');
        }
    };
    /**
     * Used to represent an empty or unknown range.
     */
    TextRange.empty = new TextRange('', 0, 0);
    return TextRange;
}());
exports.TextRange = TextRange;
//# sourceMappingURL=TextRange.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701610, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserMessageLog = void 0;
var ParserMessage_1 = require("./ParserMessage");
/**
 * Used to report errors and warnings that occurred during parsing.
 */
var ParserMessageLog = /** @class */ (function () {
    function ParserMessageLog() {
        this._messages = [];
    }
    Object.defineProperty(ParserMessageLog.prototype, "messages", {
        /**
         * The unfiltered list of all messages.
         */
        get: function () {
            return this._messages;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Append a message to the log.
     */
    ParserMessageLog.prototype.addMessage = function (parserMessage) {
        this._messages.push(parserMessage);
    };
    /**
     * Append a message associated with a TextRange.
     */
    ParserMessageLog.prototype.addMessageForTextRange = function (messageId, messageText, textRange) {
        this.addMessage(new ParserMessage_1.ParserMessage({
            messageId: messageId,
            messageText: messageText,
            textRange: textRange
        }));
    };
    /**
     * Append a message associated with a TokenSequence.
     */
    ParserMessageLog.prototype.addMessageForTokenSequence = function (messageId, messageText, tokenSequence, docNode) {
        this.addMessage(new ParserMessage_1.ParserMessage({
            messageId: messageId,
            messageText: messageText,
            textRange: tokenSequence.getContainingTextRange(),
            tokenSequence: tokenSequence,
            docNode: docNode
        }));
    };
    /**
     * Append a message associated with a TokenSequence.
     */
    ParserMessageLog.prototype.addMessageForDocErrorText = function (docErrorText) {
        var tokenSequence;
        if (docErrorText.textExcerpt) {
            // If there is an excerpt directly associated with the DocErrorText, highlight that:
            tokenSequence = docErrorText.textExcerpt;
        }
        else {
            // Otherwise we can use the errorLocation, but typically that is meant to give additional
            // details, not to indicate the primary location of the problem.
            tokenSequence = docErrorText.errorLocation;
        }
        this.addMessage(new ParserMessage_1.ParserMessage({
            messageId: docErrorText.messageId,
            messageText: docErrorText.errorMessage,
            textRange: tokenSequence.getContainingTextRange(),
            tokenSequence: tokenSequence,
            docNode: docErrorText
        }));
    };
    return ParserMessageLog;
}());
exports.ParserMessageLog = ParserMessageLog;
//# sourceMappingURL=ParserMessageLog.js.map
}, function(modId) { var map = {"./ParserMessage":1784796701611}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701611, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserMessage = void 0;
/**
 * Represents an error or warning that occurred during parsing.
 */
var ParserMessage = /** @class */ (function () {
    function ParserMessage(parameters) {
        this.messageId = parameters.messageId;
        this.unformattedText = parameters.messageText;
        this.textRange = parameters.textRange;
        this.tokenSequence = parameters.tokenSequence;
        this.docNode = parameters.docNode;
        this._text = undefined;
    }
    /**
     * Generates a line/column prefix.  Example with line=2 and column=5
     * and message="An error occurred":
     * ```
     * "(2,5): An error occurred"
     * ```
     */
    ParserMessage._formatMessageText = function (message, range) {
        if (!message) {
            message = 'An unknown error occurred';
        }
        if (range.pos !== 0 || range.end !== 0) {
            // NOTE: This currently a potentially expensive operation, since TSDoc currently doesn't
            // have a full newline analysis for the input buffer.
            var location_1 = range.getLocation(range.pos);
            if (location_1.line) {
                return "(".concat(location_1.line, ",").concat(location_1.column, "): ") + message;
            }
        }
        return message;
    };
    Object.defineProperty(ParserMessage.prototype, "text", {
        /**
         * The message text.
         */
        get: function () {
            if (this._text === undefined) {
                // NOTE: This currently a potentially expensive operation, since TSDoc currently doesn't
                // have a full newline analysis for the input buffer.
                this._text = ParserMessage._formatMessageText(this.unformattedText, this.textRange);
            }
            return this._text;
        },
        enumerable: false,
        configurable: true
    });
    ParserMessage.prototype.toString = function () {
        return this.text;
    };
    return ParserMessage;
}());
exports.ParserMessage = ParserMessage;
//# sourceMappingURL=ParserMessage.js.map
}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701612, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenSequence = void 0;
var TextRange_1 = require("./TextRange");
/**
 * Represents a sequence of tokens extracted from `ParserContext.tokens`.
 * This sequence is defined by a starting index and ending index into that array.
 */
var TokenSequence = /** @class */ (function () {
    function TokenSequence(parameters) {
        this.parserContext = parameters.parserContext;
        this._startIndex = parameters.startIndex;
        this._endIndex = parameters.endIndex;
        this._validateBounds();
    }
    /**
     * Constructs a TokenSequence object with no tokens.
     */
    TokenSequence.createEmpty = function (parserContext) {
        return new TokenSequence({ parserContext: parserContext, startIndex: 0, endIndex: 0 });
    };
    Object.defineProperty(TokenSequence.prototype, "startIndex", {
        /**
         * The starting index into the associated `ParserContext.tokens` list.
         */
        get: function () {
            return this._startIndex;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TokenSequence.prototype, "endIndex", {
        /**
         * The (non-inclusive) ending index into the associated `ParserContext.tokens` list.
         */
        get: function () {
            return this._endIndex;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TokenSequence.prototype, "tokens", {
        get: function () {
            return this.parserContext.tokens.slice(this._startIndex, this._endIndex);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Constructs a TokenSequence that corresponds to a different range of tokens,
     * e.g. a subrange.
     */
    TokenSequence.prototype.getNewSequence = function (startIndex, endIndex) {
        return new TokenSequence({
            parserContext: this.parserContext,
            startIndex: startIndex,
            endIndex: endIndex
        });
    };
    /**
     * Returns a TextRange that includes all tokens in the sequence (including any additional
     * characters between doc comment lines).
     */
    TokenSequence.prototype.getContainingTextRange = function () {
        if (this.isEmpty()) {
            return TextRange_1.TextRange.empty;
        }
        return this.parserContext.sourceRange.getNewRange(this.parserContext.tokens[this._startIndex].range.pos, this.parserContext.tokens[this._endIndex - 1].range.end);
    };
    TokenSequence.prototype.isEmpty = function () {
        return this._startIndex === this._endIndex;
    };
    /**
     * Returns the concatenated text of all the tokens.
     */
    TokenSequence.prototype.toString = function () {
        return this.tokens.map(function (x) { return x.toString(); }).join('');
    };
    TokenSequence.prototype._validateBounds = function () {
        if (this.startIndex < 0) {
            throw new Error('TokenSequence.startIndex cannot be negative');
        }
        if (this.endIndex < 0) {
            throw new Error('TokenSequence.endIndex cannot be negative');
        }
        if (this.endIndex < this.startIndex) {
            throw new Error('TokenSequence.endIndex cannot be smaller than TokenSequence.startIndex');
        }
        if (this.startIndex > this.parserContext.tokens.length) {
            throw new Error('TokenSequence.startIndex cannot exceed the associated token array');
        }
        if (this.endIndex > this.parserContext.tokens.length) {
            throw new Error('TokenSequence.endIndex cannot exceed the associated token array');
        }
    };
    return TokenSequence;
}());
exports.TokenSequence = TokenSequence;
//# sourceMappingURL=TokenSequence.js.map
}, function(modId) { var map = {"./TextRange":1784796701609}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701613, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TSDocParser = void 0;
var TextRange_1 = require("./TextRange");
var ParserContext_1 = require("./ParserContext");
var LineExtractor_1 = require("./LineExtractor");
var Tokenizer_1 = require("./Tokenizer");
var NodeParser_1 = require("./NodeParser");
var TSDocConfiguration_1 = require("../configuration/TSDocConfiguration");
var ParagraphSplitter_1 = require("./ParagraphSplitter");
/**
 * The main API for parsing TSDoc comments.
 */
var TSDocParser = /** @class */ (function () {
    function TSDocParser(configuration) {
        if (configuration) {
            this.configuration = configuration;
        }
        else {
            this.configuration = new TSDocConfiguration_1.TSDocConfiguration();
        }
    }
    TSDocParser.prototype.parseString = function (text) {
        return this.parseRange(TextRange_1.TextRange.fromString(text));
    };
    TSDocParser.prototype.parseRange = function (range) {
        var parserContext = new ParserContext_1.ParserContext(this.configuration, range);
        if (LineExtractor_1.LineExtractor.extract(parserContext)) {
            parserContext.tokens = Tokenizer_1.Tokenizer.readTokens(parserContext.lines);
            var nodeParser = new NodeParser_1.NodeParser(parserContext);
            nodeParser.parse();
            ParagraphSplitter_1.ParagraphSplitter.splitParagraphs(parserContext.docComment);
        }
        return parserContext;
    };
    return TSDocParser;
}());
exports.TSDocParser = TSDocParser;
//# sourceMappingURL=TSDocParser.js.map
}, function(modId) { var map = {"./TextRange":1784796701609,"./ParserContext":1784796701608,"./LineExtractor":1784796701614,"./Tokenizer":1784796701615,"./NodeParser":1784796701616,"../configuration/TSDocConfiguration":1784796701564,"./ParagraphSplitter":1784796701618}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701614, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineExtractor = void 0;
var TSDocMessageId_1 = require("./TSDocMessageId");
// Internal parser state
var State;
(function (State) {
    // Initial state, looking for "/*"
    State[State["BeginComment1"] = 0] = "BeginComment1";
    // Looking for "*" or "* " after "/*"
    State[State["BeginComment2"] = 1] = "BeginComment2";
    // Like State.CollectingLine except immediately after the "/**"
    State[State["CollectingFirstLine"] = 2] = "CollectingFirstLine";
    // Collecting characters until we reach a newline
    State[State["CollectingLine"] = 3] = "CollectingLine";
    // After a newline, looking for the "*" that begins a new line, or the "*/" to end the comment
    State[State["AdvancingLine"] = 4] = "AdvancingLine";
    // Exiting the parser loop
    State[State["Done"] = 5] = "Done";
})(State || (State = {}));
/**
 * The main API for parsing TSDoc comments.
 */
var LineExtractor = /** @class */ (function () {
    function LineExtractor() {
    }
    /**
     * This step parses an entire code comment from slash-star-star until star-slash,
     * and extracts the content lines.  The lines are stored in IDocCommentParameters.lines
     * and the overall text range is assigned to IDocCommentParameters.range.
     */
    LineExtractor.extract = function (parserContext) {
        var range = parserContext.sourceRange;
        var buffer = range.buffer;
        var commentRangeStart = 0;
        var commentRangeEnd = 0;
        // These must be set before entering CollectingFirstLine, CollectingLine, or AdvancingLine
        var collectingLineStart = 0;
        var collectingLineEnd = 0;
        var nextIndex = range.pos;
        var state = State.BeginComment1;
        var lines = [];
        while (state !== State.Done) {
            if (nextIndex >= range.end) {
                // reached the end of the input
                switch (state) {
                    case State.BeginComment1:
                    case State.BeginComment2:
                        parserContext.log.addMessageForTextRange(TSDocMessageId_1.TSDocMessageId.CommentNotFound, 'Expecting a "/**" comment', range);
                        return false;
                    default:
                        parserContext.log.addMessageForTextRange(TSDocMessageId_1.TSDocMessageId.CommentMissingClosingDelimiter, 'Unexpected end of input', range);
                        return false;
                }
            }
            var current = buffer[nextIndex];
            var currentIndex = nextIndex;
            ++nextIndex;
            var next = nextIndex < range.end ? buffer[nextIndex] : '';
            switch (state) {
                case State.BeginComment1:
                    if (current === '/' && next === '*') {
                        commentRangeStart = currentIndex;
                        ++nextIndex; // skip the star
                        state = State.BeginComment2;
                    }
                    else if (!LineExtractor._whitespaceCharacterRegExp.test(current)) {
                        parserContext.log.addMessageForTextRange(TSDocMessageId_1.TSDocMessageId.CommentOpeningDelimiterSyntax, 'Expecting a leading "/**"', range.getNewRange(currentIndex, currentIndex + 1));
                        return false;
                    }
                    break;
                case State.BeginComment2:
                    if (current === '*') {
                        if (next === ' ') {
                            ++nextIndex; // Discard the space after the star
                        }
                        collectingLineStart = nextIndex;
                        collectingLineEnd = nextIndex;
                        state = State.CollectingFirstLine;
                    }
                    else {
                        parserContext.log.addMessageForTextRange(TSDocMessageId_1.TSDocMessageId.CommentOpeningDelimiterSyntax, 'Expecting a leading "/**"', range.getNewRange(currentIndex, currentIndex + 1));
                        return false;
                    }
                    break;
                case State.CollectingFirstLine:
                case State.CollectingLine:
                    if (current === '\n') {
                        // Ignore an empty line if it is immediately after the "/**"
                        if (state !== State.CollectingFirstLine || collectingLineEnd > collectingLineStart) {
                            // Record the line that we collected
                            lines.push(range.getNewRange(collectingLineStart, collectingLineEnd));
                        }
                        collectingLineStart = nextIndex;
                        collectingLineEnd = nextIndex;
                        state = State.AdvancingLine;
                    }
                    else if (current === '*' && next === '/') {
                        if (collectingLineEnd > collectingLineStart) {
                            lines.push(range.getNewRange(collectingLineStart, collectingLineEnd));
                        }
                        collectingLineStart = 0;
                        collectingLineEnd = 0;
                        ++nextIndex; // skip the slash
                        commentRangeEnd = nextIndex;
                        state = State.Done;
                    }
                    else if (!LineExtractor._whitespaceCharacterRegExp.test(current)) {
                        collectingLineEnd = nextIndex;
                    }
                    break;
                case State.AdvancingLine:
                    if (current === '*') {
                        if (next === '/') {
                            collectingLineStart = 0;
                            collectingLineEnd = 0;
                            ++nextIndex; // skip the slash
                            commentRangeEnd = nextIndex;
                            state = State.Done;
                        }
                        else {
                            // Discard the "*" at the start of a line
                            if (next === ' ') {
                                ++nextIndex; // Discard the space after the star
                            }
                            collectingLineStart = nextIndex;
                            collectingLineEnd = nextIndex;
                            state = State.CollectingLine;
                        }
                    }
                    else if (current === '\n') {
                        // Blank line
                        lines.push(range.getNewRange(currentIndex, currentIndex));
                        collectingLineStart = nextIndex;
                    }
                    else if (!LineExtractor._whitespaceCharacterRegExp.test(current)) {
                        // If the star is missing, then start the line here
                        // Example: "/**\nL1*/"
                        // (collectingLineStart was the start of this line)
                        collectingLineEnd = nextIndex;
                        state = State.CollectingLine;
                    }
                    break;
            }
        }
        /**
         * Only fill in these if we successfully scanned a comment
         */
        parserContext.commentRange = range.getNewRange(commentRangeStart, commentRangeEnd);
        parserContext.lines = lines;
        return true;
    };
    LineExtractor._whitespaceCharacterRegExp = /^\s$/;
    return LineExtractor;
}());
exports.LineExtractor = LineExtractor;
//# sourceMappingURL=LineExtractor.js.map
}, function(modId) { var map = {"./TSDocMessageId":1784796701571}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701615, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
var TextRange_1 = require("./TextRange");
var Token_1 = require("./Token");
var Tokenizer = /** @class */ (function () {
    function Tokenizer() {
    }
    /**
     * Given a list of input lines, this returns an array of extracted tokens.
     * The last token will always be TokenKind.EndOfInput.
     */
    Tokenizer.readTokens = function (lines) {
        Tokenizer._ensureInitialized();
        var tokens = [];
        var lastLine = undefined;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            Tokenizer._pushTokensForLine(tokens, line);
            lastLine = line;
        }
        if (lastLine) {
            tokens.push(new Token_1.Token(Token_1.TokenKind.EndOfInput, lastLine.getNewRange(lastLine.end, lastLine.end), lastLine));
        }
        else {
            tokens.push(new Token_1.Token(Token_1.TokenKind.EndOfInput, TextRange_1.TextRange.empty, TextRange_1.TextRange.empty));
        }
        return tokens;
    };
    /**
     * Returns true if the token is a CommonMark punctuation character.
     * These are basically all the ASCII punctuation characters.
     */
    Tokenizer.isPunctuation = function (tokenKind) {
        Tokenizer._ensureInitialized();
        return Tokenizer._punctuationTokens[tokenKind] || false;
    };
    Tokenizer._pushTokensForLine = function (tokens, line) {
        var buffer = line.buffer;
        var end = line.end;
        var bufferIndex = line.pos;
        var tokenKind = undefined;
        var tokenPos = bufferIndex;
        while (bufferIndex < end) {
            // Read a character and determine its kind
            var charCode = buffer.charCodeAt(bufferIndex);
            var characterKind = Tokenizer._charCodeMap[charCode];
            if (characterKind === undefined) {
                characterKind = Token_1.TokenKind.Other;
            }
            // Can we append to an existing token?  Yes if:
            // 1. There is an existing token, AND
            // 2. It is the same kind of token, AND
            // 3. It's not punctuation (which is always one character)
            if (tokenKind !== undefined &&
                characterKind === tokenKind &&
                Tokenizer._isMultiCharacterToken(tokenKind)) {
                // yes, append
            }
            else {
                // Is there a previous completed token to push?
                if (tokenKind !== undefined) {
                    tokens.push(new Token_1.Token(tokenKind, line.getNewRange(tokenPos, bufferIndex), line));
                }
                tokenPos = bufferIndex;
                tokenKind = characterKind;
            }
            ++bufferIndex;
        }
        // Is there a previous completed token to push?
        if (tokenKind !== undefined) {
            tokens.push(new Token_1.Token(tokenKind, line.getNewRange(tokenPos, bufferIndex), line));
        }
        tokens.push(new Token_1.Token(Token_1.TokenKind.Newline, line.getNewRange(line.end, line.end), line));
    };
    /**
     * Returns true if the token can be comprised of multiple characters
     */
    Tokenizer._isMultiCharacterToken = function (kind) {
        switch (kind) {
            case Token_1.TokenKind.Spacing:
            case Token_1.TokenKind.AsciiWord:
            case Token_1.TokenKind.Other:
                return true;
        }
        return false;
    };
    Tokenizer._ensureInitialized = function () {
        if (Tokenizer._charCodeMap) {
            return;
        }
        Tokenizer._charCodeMap = {};
        Tokenizer._punctuationTokens = {};
        // All Markdown punctuation characters
        var punctuation = Tokenizer._commonMarkPunctuationCharacters;
        for (var i = 0; i < punctuation.length; ++i) {
            var charCode = punctuation.charCodeAt(i);
            Tokenizer._charCodeMap[charCode] = Token_1.TokenKind.OtherPunctuation;
        }
        // Special symbols
        // !"#$%&\'()*+,\-.\/:;<=>?@[\\]^_`{|}~
        var specialMap = {
            '\\': Token_1.TokenKind.Backslash,
            '<': Token_1.TokenKind.LessThan,
            '>': Token_1.TokenKind.GreaterThan,
            '=': Token_1.TokenKind.Equals,
            "'": Token_1.TokenKind.SingleQuote,
            '"': Token_1.TokenKind.DoubleQuote,
            '/': Token_1.TokenKind.Slash,
            '-': Token_1.TokenKind.Hyphen,
            '@': Token_1.TokenKind.AtSign,
            '{': Token_1.TokenKind.LeftCurlyBracket,
            '}': Token_1.TokenKind.RightCurlyBracket,
            '`': Token_1.TokenKind.Backtick,
            '.': Token_1.TokenKind.Period,
            ':': Token_1.TokenKind.Colon,
            ',': Token_1.TokenKind.Comma,
            '[': Token_1.TokenKind.LeftSquareBracket,
            ']': Token_1.TokenKind.RightSquareBracket,
            '|': Token_1.TokenKind.Pipe,
            '(': Token_1.TokenKind.LeftParenthesis,
            ')': Token_1.TokenKind.RightParenthesis,
            '#': Token_1.TokenKind.PoundSymbol,
            '+': Token_1.TokenKind.Plus,
            $: Token_1.TokenKind.DollarSign
        };
        for (var _i = 0, _a = Object.getOwnPropertyNames(specialMap); _i < _a.length; _i++) {
            var key = _a[_i];
            Tokenizer._charCodeMap[key.charCodeAt(0)] = specialMap[key];
            Tokenizer._punctuationTokens[specialMap[key]] = true;
        }
        Tokenizer._punctuationTokens[Token_1.TokenKind.OtherPunctuation] = true;
        var word = Tokenizer._wordCharacters;
        for (var i = 0; i < word.length; ++i) {
            var charCode = word.charCodeAt(i);
            Tokenizer._charCodeMap[charCode] = Token_1.TokenKind.AsciiWord;
        }
        Tokenizer._charCodeMap[' '.charCodeAt(0)] = Token_1.TokenKind.Spacing;
        Tokenizer._charCodeMap['\t'.charCodeAt(0)] = Token_1.TokenKind.Spacing;
    };
    Tokenizer._commonMarkPunctuationCharacters = '!"#$%&\'()*+,-./:;<=>?@[\\]^`{|}~';
    Tokenizer._wordCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=Tokenizer.js.map
}, function(modId) { var map = {"./TextRange":1784796701609,"./Token":1784796701582}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701616, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeParser = void 0;
var Token_1 = require("./Token");
var Tokenizer_1 = require("./Tokenizer");
var nodes_1 = require("../nodes");
var TokenSequence_1 = require("./TokenSequence");
var TokenReader_1 = require("./TokenReader");
var StringChecks_1 = require("./StringChecks");
var TSDocTagDefinition_1 = require("../configuration/TSDocTagDefinition");
var StandardTags_1 = require("../details/StandardTags");
var PlainTextEmitter_1 = require("../emitters/PlainTextEmitter");
var TSDocMessageId_1 = require("./TSDocMessageId");
function isFailure(resultOrFailure) {
    return resultOrFailure !== undefined && Object.hasOwnProperty.call(resultOrFailure, 'failureMessage');
}
/**
 * The main parser for TSDoc comments.
 */
var NodeParser = /** @class */ (function () {
    function NodeParser(parserContext) {
        this._parserContext = parserContext;
        this._configuration = parserContext.configuration;
        this._currentSection = parserContext.docComment.summarySection;
    }
    NodeParser.prototype.parse = function () {
        var tokenReader = new TokenReader_1.TokenReader(this._parserContext);
        var done = false;
        while (!done) {
            // Extract the next token
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.EndOfInput:
                    done = true;
                    break;
                case Token_1.TokenKind.Newline:
                    this._pushAccumulatedPlainText(tokenReader);
                    tokenReader.readToken();
                    this._pushNode(new nodes_1.DocSoftBreak({
                        parsed: true,
                        configuration: this._configuration,
                        softBreakExcerpt: tokenReader.extractAccumulatedSequence()
                    }));
                    break;
                case Token_1.TokenKind.Backslash:
                    this._pushAccumulatedPlainText(tokenReader);
                    this._pushNode(this._parseBackslashEscape(tokenReader));
                    break;
                case Token_1.TokenKind.AtSign:
                    this._pushAccumulatedPlainText(tokenReader);
                    this._parseAndPushBlock(tokenReader);
                    break;
                case Token_1.TokenKind.LeftCurlyBracket: {
                    this._pushAccumulatedPlainText(tokenReader);
                    var marker = tokenReader.createMarker();
                    var docNode = this._parseInlineTag(tokenReader);
                    var docComment = this._parserContext.docComment;
                    if (docNode instanceof nodes_1.DocInheritDocTag) {
                        // The @inheritDoc tag is irregular because it looks like an inline tag, but
                        // it actually represents the entire comment body
                        var tagEndMarker = tokenReader.createMarker() - 1;
                        if (docComment.inheritDocTag === undefined) {
                            this._parserContext.docComment.inheritDocTag = docNode;
                        }
                        else {
                            this._pushNode(this._backtrackAndCreateErrorRange(tokenReader, marker, tagEndMarker, TSDocMessageId_1.TSDocMessageId.ExtraInheritDocTag, 'A doc comment cannot have more than one @inheritDoc tag'));
                        }
                    }
                    else {
                        this._pushNode(docNode);
                    }
                    break;
                }
                case Token_1.TokenKind.RightCurlyBracket:
                    this._pushAccumulatedPlainText(tokenReader);
                    this._pushNode(this._createError(tokenReader, TSDocMessageId_1.TSDocMessageId.EscapeRightBrace, 'The "}" character should be escaped using a backslash to avoid confusion with a TSDoc inline tag'));
                    break;
                case Token_1.TokenKind.LessThan:
                    this._pushAccumulatedPlainText(tokenReader);
                    // Look ahead two tokens to see if this is "<a>" or "</a>".
                    if (tokenReader.peekTokenAfterKind() === Token_1.TokenKind.Slash) {
                        this._pushNode(this._parseHtmlEndTag(tokenReader));
                    }
                    else {
                        this._pushNode(this._parseHtmlStartTag(tokenReader));
                    }
                    break;
                case Token_1.TokenKind.GreaterThan:
                    this._pushAccumulatedPlainText(tokenReader);
                    this._pushNode(this._createError(tokenReader, TSDocMessageId_1.TSDocMessageId.EscapeGreaterThan, 'The ">" character should be escaped using a backslash to avoid confusion with an HTML tag'));
                    break;
                case Token_1.TokenKind.Backtick:
                    this._pushAccumulatedPlainText(tokenReader);
                    if (tokenReader.peekTokenAfterKind() === Token_1.TokenKind.Backtick &&
                        tokenReader.peekTokenAfterAfterKind() === Token_1.TokenKind.Backtick) {
                        this._pushNode(this._parseFencedCode(tokenReader));
                    }
                    else {
                        this._pushNode(this._parseCodeSpan(tokenReader));
                    }
                    break;
                default:
                    // If nobody recognized this token, then accumulate plain text
                    tokenReader.readToken();
                    break;
            }
        }
        this._pushAccumulatedPlainText(tokenReader);
        this._performValidationChecks();
    };
    NodeParser.prototype._performValidationChecks = function () {
        var docComment = this._parserContext.docComment;
        if (docComment.deprecatedBlock) {
            if (!PlainTextEmitter_1.PlainTextEmitter.hasAnyTextContent(docComment.deprecatedBlock)) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.MissingDeprecationMessage, "The ".concat(docComment.deprecatedBlock.blockTag.tagName, " block must include a deprecation message,") +
                    " e.g. describing the recommended alternative", docComment.deprecatedBlock.blockTag.getTokenSequence(), docComment.deprecatedBlock);
            }
        }
        if (docComment.inheritDocTag) {
            if (docComment.remarksBlock) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.InheritDocIncompatibleTag, "A \"".concat(docComment.remarksBlock.blockTag.tagName, "\" block must not be used, because that") +
                    " content is provided by the @inheritDoc tag", docComment.remarksBlock.blockTag.getTokenSequence(), docComment.remarksBlock.blockTag);
            }
            if (PlainTextEmitter_1.PlainTextEmitter.hasAnyTextContent(docComment.summarySection)) {
                this._parserContext.log.addMessageForTextRange(TSDocMessageId_1.TSDocMessageId.InheritDocIncompatibleSummary, 'The summary section must not have any content, because that' +
                    ' content is provided by the @inheritDoc tag', this._parserContext.commentRange);
            }
        }
    };
    NodeParser.prototype._validateTagDefinition = function (tagDefinition, tagName, expectingInlineTag, tokenSequenceForErrorContext, nodeForErrorContext) {
        if (tagDefinition) {
            var isInlineTag = tagDefinition.syntaxKind === TSDocTagDefinition_1.TSDocTagSyntaxKind.InlineTag;
            if (isInlineTag !== expectingInlineTag) {
                // The tag is defined, but it is used incorrectly
                if (expectingInlineTag) {
                    this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.TagShouldNotHaveBraces, "The TSDoc tag \"".concat(tagName, "\" is not an inline tag; it must not be enclosed in \"{ }\" braces"), tokenSequenceForErrorContext, nodeForErrorContext);
                }
                else {
                    this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.InlineTagMissingBraces, "The TSDoc tag \"".concat(tagName, "\" is an inline tag; it must be enclosed in \"{ }\" braces"), tokenSequenceForErrorContext, nodeForErrorContext);
                }
            }
            else {
                if (this._parserContext.configuration.validation.reportUnsupportedTags) {
                    if (!this._parserContext.configuration.isTagSupported(tagDefinition)) {
                        // The tag is defined, but not supported
                        this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.UnsupportedTag, "The TSDoc tag \"".concat(tagName, "\" is not supported by this tool"), tokenSequenceForErrorContext, nodeForErrorContext);
                    }
                }
            }
        }
        else {
            // The tag is not defined
            if (!this._parserContext.configuration.validation.ignoreUndefinedTags) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.UndefinedTag, "The TSDoc tag \"".concat(tagName, "\" is not defined in this configuration"), tokenSequenceForErrorContext, nodeForErrorContext);
            }
        }
    };
    NodeParser.prototype._pushAccumulatedPlainText = function (tokenReader) {
        if (!tokenReader.isAccumulatedSequenceEmpty()) {
            this._pushNode(new nodes_1.DocPlainText({
                parsed: true,
                configuration: this._configuration,
                textExcerpt: tokenReader.extractAccumulatedSequence()
            }));
        }
    };
    NodeParser.prototype._parseAndPushBlock = function (tokenReader) {
        var docComment = this._parserContext.docComment;
        var configuration = this._parserContext.configuration;
        var modifierTagSet = docComment.modifierTagSet;
        var parsedBlockTag = this._parseBlockTag(tokenReader);
        if (parsedBlockTag.kind !== nodes_1.DocNodeKind.BlockTag) {
            this._pushNode(parsedBlockTag);
            return;
        }
        var docBlockTag = parsedBlockTag;
        // Do we have a definition for this tag?
        var tagDefinition = configuration.tryGetTagDefinitionWithUpperCase(docBlockTag.tagNameWithUpperCase);
        this._validateTagDefinition(tagDefinition, docBlockTag.tagName, 
        /* expectingInlineTag */ false, docBlockTag.getTokenSequence(), docBlockTag);
        if (tagDefinition) {
            switch (tagDefinition.syntaxKind) {
                case TSDocTagDefinition_1.TSDocTagSyntaxKind.BlockTag:
                    if (docBlockTag.tagNameWithUpperCase === StandardTags_1.StandardTags.param.tagNameWithUpperCase) {
                        var docParamBlock = this._parseParamBlock(tokenReader, docBlockTag, StandardTags_1.StandardTags.param.tagName);
                        this._parserContext.docComment.params.add(docParamBlock);
                        this._currentSection = docParamBlock.content;
                        return;
                    }
                    else if (docBlockTag.tagNameWithUpperCase === StandardTags_1.StandardTags.typeParam.tagNameWithUpperCase) {
                        var docParamBlock = this._parseParamBlock(tokenReader, docBlockTag, StandardTags_1.StandardTags.typeParam.tagName);
                        this._parserContext.docComment.typeParams.add(docParamBlock);
                        this._currentSection = docParamBlock.content;
                        return;
                    }
                    else {
                        var newBlock = new nodes_1.DocBlock({
                            configuration: this._configuration,
                            blockTag: docBlockTag
                        });
                        this._addBlockToDocComment(newBlock);
                        this._currentSection = newBlock.content;
                    }
                    return;
                case TSDocTagDefinition_1.TSDocTagSyntaxKind.ModifierTag:
                    // The block tag was recognized as a modifier, so add it to the modifier tag set
                    // and do NOT call currentSection.appendNode(parsedNode)
                    modifierTagSet.addTag(docBlockTag);
                    return;
            }
        }
        this._pushNode(docBlockTag);
    };
    NodeParser.prototype._addBlockToDocComment = function (block) {
        var docComment = this._parserContext.docComment;
        switch (block.blockTag.tagNameWithUpperCase) {
            case StandardTags_1.StandardTags.remarks.tagNameWithUpperCase:
                docComment.remarksBlock = block;
                break;
            case StandardTags_1.StandardTags.privateRemarks.tagNameWithUpperCase:
                docComment.privateRemarks = block;
                break;
            case StandardTags_1.StandardTags.deprecated.tagNameWithUpperCase:
                docComment.deprecatedBlock = block;
                break;
            case StandardTags_1.StandardTags.returns.tagNameWithUpperCase:
                docComment.returnsBlock = block;
                break;
            case StandardTags_1.StandardTags.see.tagNameWithUpperCase:
                docComment._appendSeeBlock(block);
                break;
            default:
                docComment.appendCustomBlock(block);
        }
    };
    /**
     * Used by `_parseParamBlock()`, this parses a JSDoc expression remainder like `string}` or `="]"]` from
     * an input like `@param {string} [x="]"] - the X value`.  It detects nested balanced pairs of delimiters
     * and escaped string literals.
     */
    NodeParser.prototype._tryParseJSDocTypeOrValueRest = function (tokenReader, openKind, closeKind, startMarker) {
        var quoteKind;
        var openCount = 1;
        while (openCount > 0) {
            var tokenKind = tokenReader.peekTokenKind();
            switch (tokenKind) {
                case openKind:
                    // ignore open bracket/brace inside of a quoted string
                    if (quoteKind === undefined)
                        openCount++;
                    break;
                case closeKind:
                    // ignore close bracket/brace inside of a quoted string
                    if (quoteKind === undefined)
                        openCount--;
                    break;
                case Token_1.TokenKind.Backslash:
                    // ignore backslash outside of quoted string
                    if (quoteKind !== undefined) {
                        // skip the backslash and the next character.
                        tokenReader.readToken();
                        tokenKind = tokenReader.peekTokenKind();
                    }
                    break;
                case Token_1.TokenKind.DoubleQuote:
                case Token_1.TokenKind.SingleQuote:
                case Token_1.TokenKind.Backtick:
                    if (quoteKind === tokenKind) {
                        // exit quoted string if quote character matches.
                        quoteKind = undefined;
                    }
                    else if (quoteKind === undefined) {
                        // start quoted string if not in a quoted string.
                        quoteKind = tokenKind;
                    }
                    break;
            }
            // give up at end of input and backtrack to start.
            if (tokenKind === Token_1.TokenKind.EndOfInput) {
                tokenReader.backtrackToMarker(startMarker);
                return undefined;
            }
            tokenReader.readToken();
        }
        return tokenReader.tryExtractAccumulatedSequence();
    };
    /**
     * Used by `_parseParamBlock()`, this parses a JSDoc expression like `{string}` from
     * an input like `@param {string} x - the X value`.
     */
    NodeParser.prototype._tryParseUnsupportedJSDocType = function (tokenReader, docBlockTag, tagName) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        // do not parse `{@...` as a JSDoc type
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.LeftCurlyBracket ||
            tokenReader.peekTokenAfterKind() === Token_1.TokenKind.AtSign) {
            return undefined;
        }
        var startMarker = tokenReader.createMarker();
        tokenReader.readToken(); // read the "{"
        var jsdocTypeExcerpt = this._tryParseJSDocTypeOrValueRest(tokenReader, Token_1.TokenKind.LeftCurlyBracket, Token_1.TokenKind.RightCurlyBracket, startMarker);
        if (jsdocTypeExcerpt) {
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ParamTagWithInvalidType, 'The ' + tagName + " block should not include a JSDoc-style '{type}'", jsdocTypeExcerpt, docBlockTag);
            var spacingAfterJsdocTypeExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
            if (spacingAfterJsdocTypeExcerpt) {
                jsdocTypeExcerpt = jsdocTypeExcerpt.getNewSequence(jsdocTypeExcerpt.startIndex, spacingAfterJsdocTypeExcerpt.endIndex);
            }
        }
        return jsdocTypeExcerpt;
    };
    /**
     * Used by `_parseParamBlock()`, this parses a JSDoc expression remainder like `=[]]` from
     * an input like `@param {string} [x=[]] - the X value`.
     */
    NodeParser.prototype._tryParseJSDocOptionalNameRest = function (tokenReader) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.EndOfInput) {
            var startMarker = tokenReader.createMarker();
            return this._tryParseJSDocTypeOrValueRest(tokenReader, Token_1.TokenKind.LeftSquareBracket, Token_1.TokenKind.RightSquareBracket, startMarker);
        }
        return undefined;
    };
    NodeParser.prototype._parseParamBlock = function (tokenReader, docBlockTag, tagName) {
        var startMarker = tokenReader.createMarker();
        var spacingBeforeParameterNameExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        // Skip past a JSDoc type (i.e., '@param {type} paramName') if found, and report a warning.
        var unsupportedJsdocTypeBeforeParameterNameExcerpt = this._tryParseUnsupportedJSDocType(tokenReader, docBlockTag, tagName);
        // Parse opening of invalid JSDoc optional parameter name (e.g., '[')
        var unsupportedJsdocOptionalNameOpenBracketExcerpt;
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.LeftSquareBracket) {
            tokenReader.readToken(); // read the "["
            unsupportedJsdocOptionalNameOpenBracketExcerpt = tokenReader.extractAccumulatedSequence();
        }
        var parameterName = '';
        var done = false;
        while (!done) {
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.AsciiWord:
                case Token_1.TokenKind.Period:
                case Token_1.TokenKind.DollarSign:
                    parameterName += tokenReader.readToken();
                    break;
                default:
                    done = true;
                    break;
            }
        }
        var explanation = StringChecks_1.StringChecks.explainIfInvalidUnquotedIdentifier(parameterName);
        if (explanation !== undefined) {
            tokenReader.backtrackToMarker(startMarker);
            var errorParamBlock = new nodes_1.DocParamBlock({
                configuration: this._configuration,
                blockTag: docBlockTag,
                parameterName: ''
            });
            var errorMessage = parameterName.length > 0
                ? 'The ' + tagName + ' block should be followed by a valid parameter name: ' + explanation
                : 'The ' + tagName + ' block should be followed by a parameter name';
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ParamTagWithInvalidName, errorMessage, docBlockTag.getTokenSequence(), docBlockTag);
            return errorParamBlock;
        }
        var parameterNameExcerpt = tokenReader.extractAccumulatedSequence();
        // Parse closing of invalid JSDoc optional parameter name (e.g., ']', '=default]').
        var unsupportedJsdocOptionalNameRestExcerpt;
        if (unsupportedJsdocOptionalNameOpenBracketExcerpt) {
            unsupportedJsdocOptionalNameRestExcerpt = this._tryParseJSDocOptionalNameRest(tokenReader);
            var errorSequence = unsupportedJsdocOptionalNameOpenBracketExcerpt;
            if (unsupportedJsdocOptionalNameRestExcerpt) {
                errorSequence = docBlockTag
                    .getTokenSequence()
                    .getNewSequence(unsupportedJsdocOptionalNameOpenBracketExcerpt.startIndex, unsupportedJsdocOptionalNameRestExcerpt.endIndex);
            }
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ParamTagWithInvalidOptionalName, 'The ' +
                tagName +
                " should not include a JSDoc-style optional name; it must not be enclosed in '[ ]' brackets.", errorSequence, docBlockTag);
        }
        var spacingAfterParameterNameExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        // Skip past a trailing JSDoc type (i.e., '@param paramName {type}') if found, and report a warning.
        var unsupportedJsdocTypeAfterParameterNameExcerpt = this._tryParseUnsupportedJSDocType(tokenReader, docBlockTag, tagName);
        // TODO: Warn if there is no space before or after the hyphen
        var hyphenExcerpt;
        var spacingAfterHyphenExcerpt;
        var unsupportedJsdocTypeAfterHyphenExcerpt;
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.Hyphen) {
            tokenReader.readToken();
            hyphenExcerpt = tokenReader.extractAccumulatedSequence();
            // TODO: Only read one space
            spacingAfterHyphenExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
            // Skip past a JSDoc type (i.e., '@param paramName - {type}') if found, and report a warning.
            unsupportedJsdocTypeAfterHyphenExcerpt = this._tryParseUnsupportedJSDocType(tokenReader, docBlockTag, tagName);
        }
        else {
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ParamTagMissingHyphen, 'The ' + tagName + ' block should be followed by a parameter name and then a hyphen', docBlockTag.getTokenSequence(), docBlockTag);
        }
        return new nodes_1.DocParamBlock({
            parsed: true,
            configuration: this._configuration,
            blockTag: docBlockTag,
            spacingBeforeParameterNameExcerpt: spacingBeforeParameterNameExcerpt,
            unsupportedJsdocTypeBeforeParameterNameExcerpt: unsupportedJsdocTypeBeforeParameterNameExcerpt,
            unsupportedJsdocOptionalNameOpenBracketExcerpt: unsupportedJsdocOptionalNameOpenBracketExcerpt,
            parameterNameExcerpt: parameterNameExcerpt,
            parameterName: parameterName,
            unsupportedJsdocOptionalNameRestExcerpt: unsupportedJsdocOptionalNameRestExcerpt,
            spacingAfterParameterNameExcerpt: spacingAfterParameterNameExcerpt,
            unsupportedJsdocTypeAfterParameterNameExcerpt: unsupportedJsdocTypeAfterParameterNameExcerpt,
            hyphenExcerpt: hyphenExcerpt,
            spacingAfterHyphenExcerpt: spacingAfterHyphenExcerpt,
            unsupportedJsdocTypeAfterHyphenExcerpt: unsupportedJsdocTypeAfterHyphenExcerpt
        });
    };
    NodeParser.prototype._pushNode = function (docNode) {
        if (this._configuration.docNodeManager.isAllowedChild(nodes_1.DocNodeKind.Paragraph, docNode.kind)) {
            this._currentSection.appendNodeInParagraph(docNode);
        }
        else {
            this._currentSection.appendNode(docNode);
        }
    };
    NodeParser.prototype._parseBackslashEscape = function (tokenReader) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        var marker = tokenReader.createMarker();
        tokenReader.readToken(); // read the backslash
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.EndOfInput) {
            return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.UnnecessaryBackslash, 'A backslash must precede another character that is being escaped');
        }
        var escapedToken = tokenReader.readToken(); // read the escaped character
        // In CommonMark, a backslash is only allowed before a punctuation
        // character.  In all other contexts, the backslash is interpreted as a
        // literal character.
        if (!Tokenizer_1.Tokenizer.isPunctuation(escapedToken.kind)) {
            return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.UnnecessaryBackslash, 'A backslash can only be used to escape a punctuation character');
        }
        var encodedTextExcerpt = tokenReader.extractAccumulatedSequence();
        return new nodes_1.DocEscapedText({
            parsed: true,
            configuration: this._configuration,
            escapeStyle: nodes_1.EscapeStyle.CommonMarkBackslash,
            encodedTextExcerpt: encodedTextExcerpt,
            decodedText: escapedToken.toString()
        });
    };
    NodeParser.prototype._parseBlockTag = function (tokenReader) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        var marker = tokenReader.createMarker();
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.AtSign) {
            return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.MissingTag, 'Expecting a TSDoc tag starting with "@"');
        }
        // "@one" is a valid TSDoc tag at the start of a line, but "@one@two" is
        // a syntax error.  For two tags it should be "@one @two", or for literal text it
        // should be "\@one\@two".
        switch (tokenReader.peekPreviousTokenKind()) {
            case Token_1.TokenKind.EndOfInput:
            case Token_1.TokenKind.Spacing:
            case Token_1.TokenKind.Newline:
                break;
            default:
                return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.AtSignInWord, 'The "@" character looks like part of a TSDoc tag; use a backslash to escape it');
        }
        // Include the "@" as part of the tagName
        var tagName = tokenReader.readToken().toString();
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.AsciiWord) {
            return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.AtSignWithoutTagName, 'Expecting a TSDoc tag name after "@"; if it is not a tag, use a backslash to escape this character');
        }
        var tagNameMarker = tokenReader.createMarker();
        while (tokenReader.peekTokenKind() === Token_1.TokenKind.AsciiWord) {
            tagName += tokenReader.readToken().toString();
        }
        switch (tokenReader.peekTokenKind()) {
            case Token_1.TokenKind.Spacing:
            case Token_1.TokenKind.Newline:
            case Token_1.TokenKind.EndOfInput:
                break;
            default:
                var badCharacter = tokenReader.peekToken().range.toString()[0];
                return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.CharactersAfterBlockTag, "The token \"".concat(tagName, "\" looks like a TSDoc tag but contains an invalid character") +
                    " ".concat(JSON.stringify(badCharacter), "; if it is not a tag, use a backslash to escape the \"@\""));
        }
        if (StringChecks_1.StringChecks.explainIfInvalidTSDocTagName(tagName)) {
            var failure = this._createFailureForTokensSince(tokenReader, TSDocMessageId_1.TSDocMessageId.MalformedTagName, 'A TSDoc tag name must start with a letter and contain only letters and numbers', tagNameMarker);
            return this._backtrackAndCreateErrorForFailure(tokenReader, marker, '', failure);
        }
        return new nodes_1.DocBlockTag({
            parsed: true,
            configuration: this._configuration,
            tagName: tagName,
            tagNameExcerpt: tokenReader.extractAccumulatedSequence()
        });
    };
    NodeParser.prototype._parseInlineTag = function (tokenReader) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        var marker = tokenReader.createMarker();
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.LeftCurlyBracket) {
            return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.MissingTag, 'Expecting a TSDoc tag starting with "{"');
        }
        tokenReader.readToken();
        var openingDelimiterExcerpt = tokenReader.extractAccumulatedSequence();
        // For inline tags, if we handle errors by backtracking to the "{"  token, then the main loop
        // will then interpret the "@" as a block tag, which is almost certainly incorrect.  So the
        // DocErrorText needs to include both the "{" and "@" tokens.
        // We will use _backtrackAndCreateErrorRangeForFailure() for that.
        var atSignMarker = tokenReader.createMarker();
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.AtSign) {
            return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.MalformedInlineTag, 'Expecting a TSDoc tag starting with "{@"');
        }
        // Include the "@" as part of the tagName
        var tagName = tokenReader.readToken().toString();
        while (tokenReader.peekTokenKind() === Token_1.TokenKind.AsciiWord) {
            tagName += tokenReader.readToken().toString();
        }
        if (tagName === '@') {
            // This is an unusual case
            var failure = this._createFailureForTokensSince(tokenReader, TSDocMessageId_1.TSDocMessageId.MalformedInlineTag, 'Expecting a TSDoc inline tag name after the "{@" characters', atSignMarker);
            return this._backtrackAndCreateErrorRangeForFailure(tokenReader, marker, atSignMarker, '', failure);
        }
        if (StringChecks_1.StringChecks.explainIfInvalidTSDocTagName(tagName)) {
            var failure = this._createFailureForTokensSince(tokenReader, TSDocMessageId_1.TSDocMessageId.MalformedTagName, 'A TSDoc tag name must start with a letter and contain only letters and numbers', atSignMarker);
            return this._backtrackAndCreateErrorRangeForFailure(tokenReader, marker, atSignMarker, '', failure);
        }
        var tagNameExcerpt = tokenReader.extractAccumulatedSequence();
        var spacingAfterTagNameExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        if (spacingAfterTagNameExcerpt === undefined) {
            // If there were no spaces at all, that's an error unless it's the degenerate "{@tag}" case
            if (tokenReader.peekTokenKind() !== Token_1.TokenKind.RightCurlyBracket) {
                var badCharacter = tokenReader.peekToken().range.toString()[0];
                var failure = this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.CharactersAfterInlineTag, "The character ".concat(JSON.stringify(badCharacter), " cannot appear after the TSDoc tag name; expecting a space"));
                return this._backtrackAndCreateErrorRangeForFailure(tokenReader, marker, atSignMarker, '', failure);
            }
        }
        var done = false;
        while (!done) {
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.EndOfInput:
                    return this._backtrackAndCreateErrorRange(tokenReader, marker, atSignMarker, TSDocMessageId_1.TSDocMessageId.InlineTagMissingRightBrace, 'The TSDoc inline tag name is missing its closing "}"');
                case Token_1.TokenKind.Backslash:
                    // http://usejsdoc.org/about-block-inline-tags.html
                    // "If your tag's text includes a closing curly brace (}), you must escape it with
                    // a leading backslash (\)."
                    tokenReader.readToken(); // discard the backslash
                    // In CommonMark, a backslash is only allowed before a punctuation
                    // character.  In all other contexts, the backslash is interpreted as a
                    // literal character.
                    if (!Tokenizer_1.Tokenizer.isPunctuation(tokenReader.peekTokenKind())) {
                        var failure = this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.UnnecessaryBackslash, 'A backslash can only be used to escape a punctuation character');
                        return this._backtrackAndCreateErrorRangeForFailure(tokenReader, marker, atSignMarker, 'Error reading inline TSDoc tag: ', failure);
                    }
                    tokenReader.readToken();
                    break;
                case Token_1.TokenKind.LeftCurlyBracket: {
                    var failure = this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.InlineTagUnescapedBrace, 'The "{" character must be escaped with a backslash when used inside a TSDoc inline tag');
                    return this._backtrackAndCreateErrorRangeForFailure(tokenReader, marker, atSignMarker, '', failure);
                }
                case Token_1.TokenKind.RightCurlyBracket:
                    done = true;
                    break;
                default:
                    tokenReader.readToken();
                    break;
            }
        }
        var tagContentExcerpt = tokenReader.tryExtractAccumulatedSequence();
        // Read the right curly bracket
        tokenReader.readToken();
        var closingDelimiterExcerpt = tokenReader.extractAccumulatedSequence();
        var docInlineTagParsedParameters = {
            parsed: true,
            configuration: this._configuration,
            openingDelimiterExcerpt: openingDelimiterExcerpt,
            tagNameExcerpt: tagNameExcerpt,
            tagName: tagName,
            spacingAfterTagNameExcerpt: spacingAfterTagNameExcerpt,
            tagContentExcerpt: tagContentExcerpt,
            closingDelimiterExcerpt: closingDelimiterExcerpt
        };
        var tagNameWithUpperCase = tagName.toUpperCase();
        // Create a new TokenReader that will reparse the tokens corresponding to the tagContent.
        var embeddedTokenReader = new TokenReader_1.TokenReader(this._parserContext, tagContentExcerpt ? tagContentExcerpt : TokenSequence_1.TokenSequence.createEmpty(this._parserContext));
        var docNode;
        switch (tagNameWithUpperCase) {
            case StandardTags_1.StandardTags.inheritDoc.tagNameWithUpperCase:
                docNode = this._parseInheritDocTag(docInlineTagParsedParameters, embeddedTokenReader);
                break;
            case StandardTags_1.StandardTags.link.tagNameWithUpperCase:
                docNode = this._parseLinkTag(docInlineTagParsedParameters, embeddedTokenReader);
                break;
            default:
                docNode = new nodes_1.DocInlineTag(docInlineTagParsedParameters);
        }
        // Validate the tag
        var tagDefinition = this._parserContext.configuration.tryGetTagDefinitionWithUpperCase(tagNameWithUpperCase);
        this._validateTagDefinition(tagDefinition, tagName, 
        /* expectingInlineTag */ true, tagNameExcerpt, docNode);
        return docNode;
    };
    NodeParser.prototype._parseInheritDocTag = function (docInlineTagParsedParameters, embeddedTokenReader) {
        // If an error occurs, then return a generic DocInlineTag instead of DocInheritDocTag
        var errorTag = new nodes_1.DocInlineTag(docInlineTagParsedParameters);
        var parameters = __assign({}, docInlineTagParsedParameters);
        if (embeddedTokenReader.peekTokenKind() !== Token_1.TokenKind.EndOfInput) {
            parameters.declarationReference = this._parseDeclarationReference(embeddedTokenReader, docInlineTagParsedParameters.tagNameExcerpt, errorTag);
            if (!parameters.declarationReference) {
                return errorTag;
            }
            if (embeddedTokenReader.peekTokenKind() !== Token_1.TokenKind.EndOfInput) {
                embeddedTokenReader.readToken();
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.InheritDocTagSyntax, 'Unexpected character after declaration reference', embeddedTokenReader.extractAccumulatedSequence(), errorTag);
                return errorTag;
            }
        }
        return new nodes_1.DocInheritDocTag(parameters);
    };
    NodeParser.prototype._parseLinkTag = function (docInlineTagParsedParameters, embeddedTokenReader) {
        // If an error occurs, then return a generic DocInlineTag instead of DocInheritDocTag
        var errorTag = new nodes_1.DocInlineTag(docInlineTagParsedParameters);
        var parameters = __assign({}, docInlineTagParsedParameters);
        if (!docInlineTagParsedParameters.tagContentExcerpt) {
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.LinkTagEmpty, 'The @link tag content is missing', parameters.tagNameExcerpt, errorTag);
            return errorTag;
        }
        // Is the link destination a URL or a declaration reference?
        //
        // The JSDoc "@link" tag allows URLs, however supporting full URLs would be highly
        // ambiguous, for example "microsoft.windows.camera:" is an actual valid URI scheme,
        // and even the common "mailto:example.com" looks suspiciously like a declaration reference.
        // In practice JSDoc URLs are nearly always HTTP or HTTPS, so it seems fairly reasonable to
        // require the URL to have "://" and a scheme without any punctuation in it.  If a more exotic
        // URL is needed, the HTML "<a>" tag can always be used.
        // We start with a fairly broad classifier heuristic, and then the parsers will refine this:
        // 1. Does it start with "//"?
        // 2. Does it contain "://"?
        var looksLikeUrl = embeddedTokenReader.peekTokenKind() === Token_1.TokenKind.Slash &&
            embeddedTokenReader.peekTokenAfterKind() === Token_1.TokenKind.Slash;
        var marker = embeddedTokenReader.createMarker();
        var done = looksLikeUrl;
        while (!done) {
            switch (embeddedTokenReader.peekTokenKind()) {
                // An URI scheme can contain letters, numbers, minus, plus, and periods
                case Token_1.TokenKind.AsciiWord:
                case Token_1.TokenKind.Period:
                case Token_1.TokenKind.Hyphen:
                case Token_1.TokenKind.Plus:
                    embeddedTokenReader.readToken();
                    break;
                case Token_1.TokenKind.Colon:
                    embeddedTokenReader.readToken();
                    // Once we a reach a colon, then it's a URL only if we see "://"
                    looksLikeUrl =
                        embeddedTokenReader.peekTokenKind() === Token_1.TokenKind.Slash &&
                            embeddedTokenReader.peekTokenAfterKind() === Token_1.TokenKind.Slash;
                    done = true;
                    break;
                default:
                    done = true;
            }
        }
        embeddedTokenReader.backtrackToMarker(marker);
        // Is the hyperlink a URL or a declaration reference?
        if (looksLikeUrl) {
            // It starts with something like "http://", so parse it as a URL
            if (!this._parseLinkTagUrlDestination(embeddedTokenReader, parameters, docInlineTagParsedParameters.tagNameExcerpt, errorTag)) {
                return errorTag;
            }
        }
        else {
            // Otherwise, assume it's a declaration reference
            if (!this._parseLinkTagCodeDestination(embeddedTokenReader, parameters, docInlineTagParsedParameters.tagNameExcerpt, errorTag)) {
                return errorTag;
            }
        }
        if (embeddedTokenReader.peekTokenKind() === Token_1.TokenKind.Spacing) {
            // The above parser rules should have consumed any spacing before the pipe
            throw new Error('Unconsumed spacing encountered after construct');
        }
        if (embeddedTokenReader.peekTokenKind() === Token_1.TokenKind.Pipe) {
            // Read the link text
            embeddedTokenReader.readToken();
            parameters.pipeExcerpt = embeddedTokenReader.extractAccumulatedSequence();
            parameters.spacingAfterPipeExcerpt = this._tryReadSpacingAndNewlines(embeddedTokenReader);
            // Read everything until the end
            // NOTE: Because we're using an embedded TokenReader, the TokenKind.EndOfInput occurs
            // when we reach the "}", not the end of the original input
            done = false;
            var spacingAfterLinkTextMarker = undefined;
            while (!done) {
                switch (embeddedTokenReader.peekTokenKind()) {
                    case Token_1.TokenKind.EndOfInput:
                        done = true;
                        break;
                    case Token_1.TokenKind.Pipe:
                    case Token_1.TokenKind.LeftCurlyBracket:
                        var badCharacter = embeddedTokenReader.readToken().toString();
                        this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.LinkTagUnescapedText, "The \"".concat(badCharacter, "\" character may not be used in the link text without escaping it"), embeddedTokenReader.extractAccumulatedSequence(), errorTag);
                        return errorTag;
                    case Token_1.TokenKind.Spacing:
                    case Token_1.TokenKind.Newline:
                        embeddedTokenReader.readToken();
                        break;
                    default:
                        // We found a non-spacing character, so move the spacingAfterLinkTextMarker
                        spacingAfterLinkTextMarker = embeddedTokenReader.createMarker() + 1;
                        embeddedTokenReader.readToken();
                }
            }
            var linkTextAndSpacing = embeddedTokenReader.tryExtractAccumulatedSequence();
            if (linkTextAndSpacing) {
                if (spacingAfterLinkTextMarker === undefined) {
                    // We never found any non-spacing characters, so everything is trailing spacing
                    parameters.spacingAfterLinkTextExcerpt = linkTextAndSpacing;
                }
                else if (spacingAfterLinkTextMarker >= linkTextAndSpacing.endIndex) {
                    // We found no trailing spacing, so everything we found is the text
                    parameters.linkTextExcerpt = linkTextAndSpacing;
                }
                else {
                    // Split the trailing spacing from the link text
                    parameters.linkTextExcerpt = linkTextAndSpacing.getNewSequence(linkTextAndSpacing.startIndex, spacingAfterLinkTextMarker);
                    parameters.spacingAfterLinkTextExcerpt = linkTextAndSpacing.getNewSequence(spacingAfterLinkTextMarker, linkTextAndSpacing.endIndex);
                }
            }
        }
        else if (embeddedTokenReader.peekTokenKind() !== Token_1.TokenKind.EndOfInput) {
            embeddedTokenReader.readToken();
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.LinkTagDestinationSyntax, 'Unexpected character after link destination', embeddedTokenReader.extractAccumulatedSequence(), errorTag);
            return errorTag;
        }
        return new nodes_1.DocLinkTag(parameters);
    };
    NodeParser.prototype._parseLinkTagUrlDestination = function (embeddedTokenReader, parameters, tokenSequenceForErrorContext, nodeForErrorContext) {
        // Simply accumulate everything up to the next space. We won't try to implement a proper
        // URI parser here.
        var urlDestination = '';
        var done = false;
        while (!done) {
            switch (embeddedTokenReader.peekTokenKind()) {
                case Token_1.TokenKind.Spacing:
                case Token_1.TokenKind.Newline:
                case Token_1.TokenKind.EndOfInput:
                case Token_1.TokenKind.Pipe:
                case Token_1.TokenKind.RightCurlyBracket:
                    done = true;
                    break;
                default:
                    urlDestination += embeddedTokenReader.readToken();
                    break;
            }
        }
        if (urlDestination.length === 0) {
            // This should be impossible since the caller ensures that peekTokenKind() === TokenKind.AsciiWord
            throw new Error('Missing URL in _parseLinkTagUrlDestination()');
        }
        var urlDestinationExcerpt = embeddedTokenReader.extractAccumulatedSequence();
        var invalidUrlExplanation = StringChecks_1.StringChecks.explainIfInvalidLinkUrl(urlDestination);
        if (invalidUrlExplanation) {
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.LinkTagInvalidUrl, invalidUrlExplanation, urlDestinationExcerpt, nodeForErrorContext);
            return false;
        }
        parameters.urlDestinationExcerpt = urlDestinationExcerpt;
        parameters.spacingAfterDestinationExcerpt = this._tryReadSpacingAndNewlines(embeddedTokenReader);
        return true;
    };
    NodeParser.prototype._parseLinkTagCodeDestination = function (embeddedTokenReader, parameters, tokenSequenceForErrorContext, nodeForErrorContext) {
        parameters.codeDestination = this._parseDeclarationReference(embeddedTokenReader, tokenSequenceForErrorContext, nodeForErrorContext);
        return !!parameters.codeDestination;
    };
    NodeParser.prototype._parseDeclarationReference = function (tokenReader, tokenSequenceForErrorContext, nodeForErrorContext) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        // The package name can contain characters that look like a member reference.  This means we need to scan forwards
        // to see if there is a "#".  However, we need to be careful not to match a "#" that is part of a quoted expression.
        var marker = tokenReader.createMarker();
        var hasHash = false;
        // A common mistake is to forget the "#" for package name or import path.  The telltale sign
        // of this is mistake is that we see path-only characters such as "@" or "/" in the beginning
        // where this would be a syntax error for a member reference.
        var lookingForImportCharacters = true;
        var sawImportCharacters = false;
        var done = false;
        while (!done) {
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.DoubleQuote:
                case Token_1.TokenKind.EndOfInput:
                case Token_1.TokenKind.LeftCurlyBracket:
                case Token_1.TokenKind.LeftParenthesis:
                case Token_1.TokenKind.LeftSquareBracket:
                case Token_1.TokenKind.Newline:
                case Token_1.TokenKind.Pipe:
                case Token_1.TokenKind.RightCurlyBracket:
                case Token_1.TokenKind.RightParenthesis:
                case Token_1.TokenKind.RightSquareBracket:
                case Token_1.TokenKind.SingleQuote:
                case Token_1.TokenKind.Spacing:
                    done = true;
                    break;
                case Token_1.TokenKind.PoundSymbol:
                    hasHash = true;
                    done = true;
                    break;
                case Token_1.TokenKind.Slash:
                case Token_1.TokenKind.AtSign:
                    if (lookingForImportCharacters) {
                        sawImportCharacters = true;
                    }
                    tokenReader.readToken();
                    break;
                case Token_1.TokenKind.AsciiWord:
                case Token_1.TokenKind.Period:
                case Token_1.TokenKind.Hyphen:
                    // It's a character that looks like part of a package name or import path,
                    // so don't set lookingForImportCharacters = false
                    tokenReader.readToken();
                    break;
                default:
                    // Once we reach something other than AsciiWord and Period, then the meaning of
                    // slashes and at-signs is no longer obvious.
                    lookingForImportCharacters = false;
                    tokenReader.readToken();
            }
        }
        if (!hasHash && sawImportCharacters) {
            // We saw characters that will be a syntax error if interpreted as a member reference,
            // but would make sense as a package name or import path, but we did not find a "#"
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMissingHash, 'The declaration reference appears to contain a package name or import path,' +
                ' but it is missing the "#" delimiter', tokenReader.extractAccumulatedSequence(), nodeForErrorContext);
            return undefined;
        }
        tokenReader.backtrackToMarker(marker);
        var packageNameExcerpt;
        var importPathExcerpt;
        var importHashExcerpt;
        var spacingAfterImportHashExcerpt;
        if (hasHash) {
            // If it starts with a "." then it's a relative path, not a package name
            if (tokenReader.peekTokenKind() !== Token_1.TokenKind.Period) {
                // Read the package name:
                var scopedPackageName = tokenReader.peekTokenKind() === Token_1.TokenKind.AtSign;
                var finishedScope = false;
                done = false;
                while (!done) {
                    switch (tokenReader.peekTokenKind()) {
                        case Token_1.TokenKind.EndOfInput:
                            // If hasHash=true, then we are expecting to stop when we reach the hash
                            throw new Error('Expecting pound symbol');
                        case Token_1.TokenKind.Slash:
                            // Stop at the first slash, unless this is a scoped package, in which case we stop at the second slash
                            if (scopedPackageName && !finishedScope) {
                                tokenReader.readToken();
                                finishedScope = true;
                            }
                            else {
                                done = true;
                            }
                            break;
                        case Token_1.TokenKind.PoundSymbol:
                            done = true;
                            break;
                        default:
                            tokenReader.readToken();
                    }
                }
                if (!tokenReader.isAccumulatedSequenceEmpty()) {
                    packageNameExcerpt = tokenReader.extractAccumulatedSequence();
                    // Check that the packageName is syntactically valid
                    var explanation = StringChecks_1.StringChecks.explainIfInvalidPackageName(packageNameExcerpt.toString());
                    if (explanation) {
                        this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMalformedPackageName, explanation, packageNameExcerpt, nodeForErrorContext);
                        return undefined;
                    }
                }
            }
            // Read the import path:
            done = false;
            while (!done) {
                switch (tokenReader.peekTokenKind()) {
                    case Token_1.TokenKind.EndOfInput:
                        // If hasHash=true, then we are expecting to stop when we reach the hash
                        throw new Error('Expecting pound symbol');
                    case Token_1.TokenKind.PoundSymbol:
                        done = true;
                        break;
                    default:
                        tokenReader.readToken();
                }
            }
            if (!tokenReader.isAccumulatedSequenceEmpty()) {
                importPathExcerpt = tokenReader.extractAccumulatedSequence();
                // Check that the importPath is syntactically valid
                var explanation = StringChecks_1.StringChecks.explainIfInvalidImportPath(importPathExcerpt.toString(), !!packageNameExcerpt);
                if (explanation) {
                    this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMalformedImportPath, explanation, importPathExcerpt, nodeForErrorContext);
                    return undefined;
                }
            }
            // Read the import hash
            if (tokenReader.peekTokenKind() !== Token_1.TokenKind.PoundSymbol) {
                // The above logic should have left us at the PoundSymbol
                throw new Error('Expecting pound symbol');
            }
            tokenReader.readToken();
            importHashExcerpt = tokenReader.extractAccumulatedSequence();
            spacingAfterImportHashExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
            if (packageNameExcerpt === undefined && importPathExcerpt === undefined) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceHashSyntax, 'The hash character must be preceded by a package name or import path', importHashExcerpt, nodeForErrorContext);
                return undefined;
            }
        }
        // Read the member references:
        var memberReferences = [];
        done = false;
        while (!done) {
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.Period:
                case Token_1.TokenKind.LeftParenthesis:
                case Token_1.TokenKind.AsciiWord:
                case Token_1.TokenKind.Colon:
                case Token_1.TokenKind.LeftSquareBracket:
                case Token_1.TokenKind.DoubleQuote:
                    var expectingDot = memberReferences.length > 0;
                    var memberReference = this._parseMemberReference(tokenReader, expectingDot, tokenSequenceForErrorContext, nodeForErrorContext);
                    if (!memberReference) {
                        return undefined;
                    }
                    memberReferences.push(memberReference);
                    break;
                default:
                    done = true;
            }
        }
        if (packageNameExcerpt === undefined &&
            importPathExcerpt === undefined &&
            memberReferences.length === 0) {
            // We didn't find any parts of a declaration reference
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.MissingReference, 'Expecting a declaration reference', tokenSequenceForErrorContext, nodeForErrorContext);
            return undefined;
        }
        return new nodes_1.DocDeclarationReference({
            parsed: true,
            configuration: this._configuration,
            packageNameExcerpt: packageNameExcerpt,
            importPathExcerpt: importPathExcerpt,
            importHashExcerpt: importHashExcerpt,
            spacingAfterImportHashExcerpt: spacingAfterImportHashExcerpt,
            memberReferences: memberReferences
        });
    };
    NodeParser.prototype._parseMemberReference = function (tokenReader, expectingDot, tokenSequenceForErrorContext, nodeForErrorContext) {
        var parameters = {
            parsed: true,
            configuration: this._configuration
        };
        // Read the dot operator
        if (expectingDot) {
            if (tokenReader.peekTokenKind() !== Token_1.TokenKind.Period) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMissingDot, 'Expecting a period before the next component of a declaration reference', tokenSequenceForErrorContext, nodeForErrorContext);
                return undefined;
            }
            tokenReader.readToken();
            parameters.dotExcerpt = tokenReader.extractAccumulatedSequence();
            parameters.spacingAfterDotExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        }
        // Read the left parenthesis if there is one
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.LeftParenthesis) {
            tokenReader.readToken();
            parameters.leftParenthesisExcerpt = tokenReader.extractAccumulatedSequence();
            parameters.spacingAfterLeftParenthesisExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        }
        // Read the member identifier or symbol
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.LeftSquareBracket) {
            parameters.memberSymbol = this._parseMemberSymbol(tokenReader, nodeForErrorContext);
            if (!parameters.memberSymbol) {
                return undefined;
            }
        }
        else {
            parameters.memberIdentifier = this._parseMemberIdentifier(tokenReader, tokenSequenceForErrorContext, nodeForErrorContext);
            if (!parameters.memberIdentifier) {
                return undefined;
            }
        }
        parameters.spacingAfterMemberExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        // Read the colon
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.Colon) {
            tokenReader.readToken();
            parameters.colonExcerpt = tokenReader.extractAccumulatedSequence();
            parameters.spacingAfterColonExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
            if (!parameters.leftParenthesisExcerpt) {
                // In the current TSDoc draft standard, a member reference with a selector requires the parentheses.
                // It would be reasonable to make the parentheses optional, and we are contemplating simplifying the
                // notation in the future.  But for now the parentheses are required.
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceSelectorMissingParens, 'Syntax error in declaration reference: the member selector must be enclosed in parentheses', parameters.colonExcerpt, nodeForErrorContext);
                return undefined;
            }
            // If there is a colon, then read the selector
            parameters.selector = this._parseMemberSelector(tokenReader, parameters.colonExcerpt, nodeForErrorContext);
            if (!parameters.selector) {
                return undefined;
            }
            parameters.spacingAfterSelectorExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        }
        else {
            if (parameters.leftParenthesisExcerpt) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMissingColon, 'Expecting a colon after the identifier because the expression is in parentheses', parameters.leftParenthesisExcerpt, nodeForErrorContext);
                return undefined;
            }
        }
        // Read the right parenthesis
        if (parameters.leftParenthesisExcerpt) {
            if (tokenReader.peekTokenKind() !== Token_1.TokenKind.RightParenthesis) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMissingRightParen, 'Expecting a matching right parenthesis', parameters.leftParenthesisExcerpt, nodeForErrorContext);
                return undefined;
            }
            tokenReader.readToken();
            parameters.rightParenthesisExcerpt = tokenReader.extractAccumulatedSequence();
            parameters.spacingAfterRightParenthesisExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        }
        return new nodes_1.DocMemberReference(parameters);
    };
    NodeParser.prototype._parseMemberSymbol = function (tokenReader, nodeForErrorContext) {
        // Read the "["
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.LeftSquareBracket) {
            // This should be impossible since the caller ensures that peekTokenKind() === TokenKind.LeftSquareBracket
            throw new Error('Expecting "["');
        }
        tokenReader.readToken();
        var leftBracketExcerpt = tokenReader.extractAccumulatedSequence();
        var spacingAfterLeftBracketExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        // Read the declaration reference
        var declarationReference = this._parseDeclarationReference(tokenReader, leftBracketExcerpt, nodeForErrorContext);
        if (!declarationReference) {
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceSymbolSyntax, 'Missing declaration reference in symbol reference', leftBracketExcerpt, nodeForErrorContext);
            return undefined;
        }
        // (We don't need to worry about spacing here since _parseDeclarationReference() absorbs trailing spaces)
        // Read the "]"
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.RightSquareBracket) {
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMissingRightBracket, 'Missing closing square bracket for symbol reference', leftBracketExcerpt, nodeForErrorContext);
            return undefined;
        }
        tokenReader.readToken();
        var rightBracketExcerpt = tokenReader.extractAccumulatedSequence();
        return new nodes_1.DocMemberSymbol({
            parsed: true,
            configuration: this._configuration,
            leftBracketExcerpt: leftBracketExcerpt,
            spacingAfterLeftBracketExcerpt: spacingAfterLeftBracketExcerpt,
            symbolReference: declarationReference,
            rightBracketExcerpt: rightBracketExcerpt
        });
    };
    NodeParser.prototype._parseMemberIdentifier = function (tokenReader, tokenSequenceForErrorContext, nodeForErrorContext) {
        var leftQuoteExcerpt = undefined;
        var rightQuoteExcerpt = undefined;
        // Is this a quoted identifier?
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.DoubleQuote) {
            // Read the opening '"'
            tokenReader.readToken();
            leftQuoteExcerpt = tokenReader.extractAccumulatedSequence();
            // Read the text inside the quotes
            while (tokenReader.peekTokenKind() !== Token_1.TokenKind.DoubleQuote) {
                if (tokenReader.peekTokenKind() === Token_1.TokenKind.EndOfInput) {
                    this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMissingQuote, 'Unexpected end of input inside quoted member identifier', leftQuoteExcerpt, nodeForErrorContext);
                    return undefined;
                }
                tokenReader.readToken();
            }
            if (tokenReader.isAccumulatedSequenceEmpty()) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceEmptyIdentifier, 'The quoted identifier cannot be empty', leftQuoteExcerpt, nodeForErrorContext);
                return undefined;
            }
            var identifierExcerpt = tokenReader.extractAccumulatedSequence();
            // Read the closing '""
            tokenReader.readToken(); // read the quote
            rightQuoteExcerpt = tokenReader.extractAccumulatedSequence();
            return new nodes_1.DocMemberIdentifier({
                parsed: true,
                configuration: this._configuration,
                leftQuoteExcerpt: leftQuoteExcerpt,
                identifierExcerpt: identifierExcerpt,
                rightQuoteExcerpt: rightQuoteExcerpt
            });
        }
        else {
            // Otherwise assume it's a valid TypeScript identifier
            var done = false;
            while (!done) {
                switch (tokenReader.peekTokenKind()) {
                    case Token_1.TokenKind.AsciiWord:
                    case Token_1.TokenKind.DollarSign:
                        tokenReader.readToken();
                        break;
                    default:
                        done = true;
                        break;
                }
            }
            if (tokenReader.isAccumulatedSequenceEmpty()) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMissingIdentifier, 'Syntax error in declaration reference: expecting a member identifier', tokenSequenceForErrorContext, nodeForErrorContext);
                return undefined;
            }
            var identifierExcerpt = tokenReader.extractAccumulatedSequence();
            var identifier = identifierExcerpt.toString();
            var explanation = StringChecks_1.StringChecks.explainIfInvalidUnquotedMemberIdentifier(identifier);
            if (explanation) {
                this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceUnquotedIdentifier, explanation, identifierExcerpt, nodeForErrorContext);
                return undefined;
            }
            return new nodes_1.DocMemberIdentifier({
                parsed: true,
                configuration: this._configuration,
                leftQuoteExcerpt: leftQuoteExcerpt,
                identifierExcerpt: identifierExcerpt,
                rightQuoteExcerpt: rightQuoteExcerpt
            });
        }
    };
    NodeParser.prototype._parseMemberSelector = function (tokenReader, tokenSequenceForErrorContext, nodeForErrorContext) {
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.AsciiWord) {
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceMissingLabel, 'Expecting a selector label after the colon', tokenSequenceForErrorContext, nodeForErrorContext);
        }
        var selector = tokenReader.readToken().toString();
        var selectorExcerpt = tokenReader.extractAccumulatedSequence();
        var docMemberSelector = new nodes_1.DocMemberSelector({
            parsed: true,
            configuration: this._configuration,
            selectorExcerpt: selectorExcerpt,
            selector: selector
        });
        if (docMemberSelector.errorMessage) {
            this._parserContext.log.addMessageForTokenSequence(TSDocMessageId_1.TSDocMessageId.ReferenceSelectorSyntax, docMemberSelector.errorMessage, selectorExcerpt, nodeForErrorContext);
            return undefined;
        }
        return docMemberSelector;
    };
    NodeParser.prototype._parseHtmlStartTag = function (tokenReader) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        var marker = tokenReader.createMarker();
        // Read the "<" delimiter
        var lessThanToken = tokenReader.readToken();
        if (lessThanToken.kind !== Token_1.TokenKind.LessThan) {
            // This would be a parser bug -- the caller of _parseHtmlStartTag() should have verified this while
            // looking ahead
            throw new Error('Expecting an HTML tag starting with "<"');
        }
        // NOTE: CommonMark does not permit whitespace after the "<"
        var openingDelimiterExcerpt = tokenReader.extractAccumulatedSequence();
        // Read the element name
        var nameExcerpt = this._parseHtmlName(tokenReader);
        if (isFailure(nameExcerpt)) {
            return this._backtrackAndCreateErrorForFailure(tokenReader, marker, 'Invalid HTML element: ', nameExcerpt);
        }
        var spacingAfterNameExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        var htmlAttributes = [];
        // Read the attributes until we see a ">" or "/>"
        while (tokenReader.peekTokenKind() === Token_1.TokenKind.AsciiWord) {
            // Read the attribute
            var attributeNode = this._parseHtmlAttribute(tokenReader);
            if (isFailure(attributeNode)) {
                return this._backtrackAndCreateErrorForFailure(tokenReader, marker, 'The HTML element has an invalid attribute: ', attributeNode);
            }
            htmlAttributes.push(attributeNode);
        }
        // Read the closing "/>" or ">" as the Excerpt.suffix
        tokenReader.assertAccumulatedSequenceIsEmpty();
        var endDelimiterMarker = tokenReader.createMarker();
        var selfClosingTag = false;
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.Slash) {
            tokenReader.readToken();
            selfClosingTag = true;
        }
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.GreaterThan) {
            var failure = this._createFailureForTokensSince(tokenReader, TSDocMessageId_1.TSDocMessageId.HtmlTagMissingGreaterThan, 'Expecting an attribute or ">" or "/>"', endDelimiterMarker);
            return this._backtrackAndCreateErrorForFailure(tokenReader, marker, 'The HTML tag has invalid syntax: ', failure);
        }
        tokenReader.readToken();
        var closingDelimiterExcerpt = tokenReader.extractAccumulatedSequence();
        // NOTE: We don't read excerptParameters.separator here, since if there is any it
        // will be represented as DocPlainText.
        return new nodes_1.DocHtmlStartTag({
            parsed: true,
            configuration: this._configuration,
            openingDelimiterExcerpt: openingDelimiterExcerpt,
            nameExcerpt: nameExcerpt,
            spacingAfterNameExcerpt: spacingAfterNameExcerpt,
            htmlAttributes: htmlAttributes,
            selfClosingTag: selfClosingTag,
            closingDelimiterExcerpt: closingDelimiterExcerpt
        });
    };
    NodeParser.prototype._parseHtmlAttribute = function (tokenReader) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        // Read the attribute name
        var nameExcerpt = this._parseHtmlName(tokenReader);
        if (isFailure(nameExcerpt)) {
            return nameExcerpt;
        }
        var spacingAfterNameExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        // Read the equals
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.Equals) {
            return this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.HtmlTagMissingEquals, 'Expecting "=" after HTML attribute name');
        }
        tokenReader.readToken();
        var equalsExcerpt = tokenReader.extractAccumulatedSequence();
        var spacingAfterEqualsExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        // Read the attribute value
        var attributeValue = this._parseHtmlString(tokenReader);
        if (isFailure(attributeValue)) {
            return attributeValue;
        }
        var valueExcerpt = tokenReader.extractAccumulatedSequence();
        var spacingAfterValueExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        return new nodes_1.DocHtmlAttribute({
            parsed: true,
            configuration: this._configuration,
            nameExcerpt: nameExcerpt,
            spacingAfterNameExcerpt: spacingAfterNameExcerpt,
            equalsExcerpt: equalsExcerpt,
            spacingAfterEqualsExcerpt: spacingAfterEqualsExcerpt,
            valueExcerpt: valueExcerpt,
            spacingAfterValueExcerpt: spacingAfterValueExcerpt
        });
    };
    NodeParser.prototype._parseHtmlString = function (tokenReader) {
        var marker = tokenReader.createMarker();
        var quoteTokenKind = tokenReader.peekTokenKind();
        if (quoteTokenKind !== Token_1.TokenKind.DoubleQuote && quoteTokenKind !== Token_1.TokenKind.SingleQuote) {
            return this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.HtmlTagMissingString, 'Expecting an HTML string starting with a single-quote or double-quote character');
        }
        tokenReader.readToken();
        var textWithoutQuotes = '';
        for (;;) {
            var peekedTokenKind = tokenReader.peekTokenKind();
            // Did we find the matching token?
            if (peekedTokenKind === quoteTokenKind) {
                tokenReader.readToken(); // extract the quote
                break;
            }
            if (peekedTokenKind === Token_1.TokenKind.EndOfInput || peekedTokenKind === Token_1.TokenKind.Newline) {
                return this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.HtmlStringMissingQuote, 'The HTML string is missing its closing quote', marker);
            }
            textWithoutQuotes += tokenReader.readToken().toString();
        }
        // The next attribute cannot start immediately after this one
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.AsciiWord) {
            return this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.TextAfterHtmlString, 'The next character after a closing quote must be spacing or punctuation');
        }
        return textWithoutQuotes;
    };
    NodeParser.prototype._parseHtmlEndTag = function (tokenReader) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        var marker = tokenReader.createMarker();
        // Read the "</" delimiter
        var lessThanToken = tokenReader.peekToken();
        if (lessThanToken.kind !== Token_1.TokenKind.LessThan) {
            return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.MissingHtmlEndTag, 'Expecting an HTML tag starting with "</"');
        }
        tokenReader.readToken();
        var slashToken = tokenReader.peekToken();
        if (slashToken.kind !== Token_1.TokenKind.Slash) {
            return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.MissingHtmlEndTag, 'Expecting an HTML tag starting with "</"');
        }
        tokenReader.readToken();
        // NOTE: Spaces are not permitted here
        // https://www.w3.org/TR/html5/syntax.html#end-tags
        var openingDelimiterExcerpt = tokenReader.extractAccumulatedSequence();
        // Read the tag name
        var nameExcerpt = this._parseHtmlName(tokenReader);
        if (isFailure(nameExcerpt)) {
            return this._backtrackAndCreateErrorForFailure(tokenReader, marker, 'Expecting an HTML element name: ', nameExcerpt);
        }
        var spacingAfterNameExcerpt = this._tryReadSpacingAndNewlines(tokenReader);
        // Read the closing ">"
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.GreaterThan) {
            var failure = this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.HtmlTagMissingGreaterThan, 'Expecting a closing ">" for the HTML tag');
            return this._backtrackAndCreateErrorForFailure(tokenReader, marker, '', failure);
        }
        tokenReader.readToken();
        var closingDelimiterExcerpt = tokenReader.extractAccumulatedSequence();
        return new nodes_1.DocHtmlEndTag({
            parsed: true,
            configuration: this._configuration,
            openingDelimiterExcerpt: openingDelimiterExcerpt,
            nameExcerpt: nameExcerpt,
            spacingAfterNameExcerpt: spacingAfterNameExcerpt,
            closingDelimiterExcerpt: closingDelimiterExcerpt
        });
    };
    /**
     * Parses an HTML name such as an element name or attribute name.
     */
    NodeParser.prototype._parseHtmlName = function (tokenReader) {
        var marker = tokenReader.createMarker();
        if (tokenReader.peekTokenKind() === Token_1.TokenKind.Spacing) {
            return this._createFailureForTokensSince(tokenReader, TSDocMessageId_1.TSDocMessageId.MalformedHtmlName, 'A space is not allowed here', marker);
        }
        var done = false;
        while (!done) {
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.Hyphen:
                case Token_1.TokenKind.Period:
                case Token_1.TokenKind.AsciiWord:
                    tokenReader.readToken();
                    break;
                default:
                    done = true;
                    break;
            }
        }
        var excerpt = tokenReader.tryExtractAccumulatedSequence();
        if (!excerpt) {
            return this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.MalformedHtmlName, 'Expecting an HTML name');
        }
        var htmlName = excerpt.toString();
        var explanation = StringChecks_1.StringChecks.explainIfInvalidHtmlName(htmlName);
        if (explanation) {
            return this._createFailureForTokensSince(tokenReader, TSDocMessageId_1.TSDocMessageId.MalformedHtmlName, explanation, marker);
        }
        if (this._configuration.validation.reportUnsupportedHtmlElements &&
            !this._configuration.isHtmlElementSupported(htmlName)) {
            return this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.UnsupportedHtmlElementName, "The HTML element name ".concat(JSON.stringify(htmlName), " is not defined by your TSDoc configuration"), marker);
        }
        return excerpt;
    };
    NodeParser.prototype._parseFencedCode = function (tokenReader) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        var startMarker = tokenReader.createMarker();
        var endOfOpeningDelimiterMarker = startMarker + 2;
        switch (tokenReader.peekPreviousTokenKind()) {
            case Token_1.TokenKind.Newline:
            case Token_1.TokenKind.EndOfInput:
                break;
            default:
                return this._backtrackAndCreateErrorRange(tokenReader, startMarker, 
                // include the three backticks so they don't get reinterpreted as a code span
                endOfOpeningDelimiterMarker, TSDocMessageId_1.TSDocMessageId.CodeFenceOpeningIndent, 'The opening backtick for a code fence must appear at the start of the line');
        }
        // Read the opening ``` delimiter
        var openingDelimiter = '';
        openingDelimiter += tokenReader.readToken();
        openingDelimiter += tokenReader.readToken();
        openingDelimiter += tokenReader.readToken();
        if (openingDelimiter !== '```') {
            // This would be a parser bug -- the caller of _parseFencedCode() should have verified this while
            // looking ahead to distinguish code spans/fences
            throw new Error('Expecting three backticks');
        }
        var openingFenceExcerpt = tokenReader.extractAccumulatedSequence();
        // Read any spaces after the delimiter,
        // but NOT the Newline since that goes with the spacingAfterLanguageExcerpt
        while (tokenReader.peekTokenKind() === Token_1.TokenKind.Spacing) {
            tokenReader.readToken();
        }
        var spacingAfterOpeningFenceExcerpt = tokenReader.tryExtractAccumulatedSequence();
        // Read the language specifier (if present) and newline
        var done = false;
        var startOfPaddingMarker = undefined;
        while (!done) {
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.Spacing:
                case Token_1.TokenKind.Newline:
                    if (startOfPaddingMarker === undefined) {
                        // Starting a new run of spacing characters
                        startOfPaddingMarker = tokenReader.createMarker();
                    }
                    if (tokenReader.peekTokenKind() === Token_1.TokenKind.Newline) {
                        done = true;
                    }
                    tokenReader.readToken();
                    break;
                case Token_1.TokenKind.Backtick:
                    var failure = this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.CodeFenceSpecifierSyntax, 'The language specifier cannot contain backtick characters');
                    return this._backtrackAndCreateErrorRangeForFailure(tokenReader, startMarker, endOfOpeningDelimiterMarker, 'Error parsing code fence: ', failure);
                case Token_1.TokenKind.EndOfInput:
                    var failure2 = this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.CodeFenceMissingDelimiter, 'Missing closing delimiter');
                    return this._backtrackAndCreateErrorRangeForFailure(tokenReader, startMarker, endOfOpeningDelimiterMarker, 'Error parsing code fence: ', failure2);
                default:
                    // more non-spacing content
                    startOfPaddingMarker = undefined;
                    tokenReader.readToken();
                    break;
            }
        }
        // At this point, we must have accumulated at least a newline token.
        // Example: "pov-ray sdl    \n"
        var restOfLineExcerpt = tokenReader.extractAccumulatedSequence();
        // Example: "pov-ray sdl"
        var languageExcerpt = restOfLineExcerpt.getNewSequence(restOfLineExcerpt.startIndex, startOfPaddingMarker);
        // Example: "    \n"
        var spacingAfterLanguageExcerpt = restOfLineExcerpt.getNewSequence(startOfPaddingMarker, restOfLineExcerpt.endIndex);
        // Read the code content until we see the closing ``` delimiter
        var codeEndMarker = -1;
        var closingFenceStartMarker = -1;
        done = false;
        var tokenBeforeDelimiter;
        while (!done) {
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.EndOfInput:
                    var failure2 = this._createFailureForToken(tokenReader, TSDocMessageId_1.TSDocMessageId.CodeFenceMissingDelimiter, 'Missing closing delimiter');
                    return this._backtrackAndCreateErrorRangeForFailure(tokenReader, startMarker, endOfOpeningDelimiterMarker, 'Error parsing code fence: ', failure2);
                case Token_1.TokenKind.Newline:
                    tokenBeforeDelimiter = tokenReader.readToken();
                    codeEndMarker = tokenReader.createMarker();
                    while (tokenReader.peekTokenKind() === Token_1.TokenKind.Spacing) {
                        tokenBeforeDelimiter = tokenReader.readToken();
                    }
                    if (tokenReader.peekTokenKind() !== Token_1.TokenKind.Backtick) {
                        break;
                    }
                    closingFenceStartMarker = tokenReader.createMarker();
                    tokenReader.readToken(); // first backtick
                    if (tokenReader.peekTokenKind() !== Token_1.TokenKind.Backtick) {
                        break;
                    }
                    tokenReader.readToken(); // second backtick
                    if (tokenReader.peekTokenKind() !== Token_1.TokenKind.Backtick) {
                        break;
                    }
                    tokenReader.readToken(); // third backtick
                    done = true;
                    break;
                default:
                    tokenReader.readToken();
                    break;
            }
        }
        if (tokenBeforeDelimiter.kind !== Token_1.TokenKind.Newline) {
            this._parserContext.log.addMessageForTextRange(TSDocMessageId_1.TSDocMessageId.CodeFenceClosingIndent, 'The closing delimiter for a code fence must not be indented', tokenBeforeDelimiter.range);
        }
        // Example: "code 1\ncode 2\n  ```"
        var codeAndDelimiterExcerpt = tokenReader.extractAccumulatedSequence();
        // Example: "code 1\ncode 2\n"
        var codeExcerpt = codeAndDelimiterExcerpt.getNewSequence(codeAndDelimiterExcerpt.startIndex, codeEndMarker);
        // Example: "  "
        var spacingBeforeClosingFenceExcerpt = codeAndDelimiterExcerpt.getNewSequence(codeEndMarker, closingFenceStartMarker);
        // Example: "```"
        var closingFenceExcerpt = codeAndDelimiterExcerpt.getNewSequence(closingFenceStartMarker, codeAndDelimiterExcerpt.endIndex);
        // Read the spacing and newline after the closing delimiter
        done = false;
        while (!done) {
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.Spacing:
                    tokenReader.readToken();
                    break;
                case Token_1.TokenKind.Newline:
                    done = true;
                    tokenReader.readToken();
                    break;
                case Token_1.TokenKind.EndOfInput:
                    done = true;
                    break;
                default:
                    this._parserContext.log.addMessageForTextRange(TSDocMessageId_1.TSDocMessageId.CodeFenceClosingSyntax, 'Unexpected characters after closing delimiter for code fence', tokenReader.peekToken().range);
                    done = true;
                    break;
            }
        }
        // Example: "   \n"
        var spacingAfterClosingFenceExcerpt = tokenReader.tryExtractAccumulatedSequence();
        return new nodes_1.DocFencedCode({
            parsed: true,
            configuration: this._configuration,
            openingFenceExcerpt: openingFenceExcerpt,
            spacingAfterOpeningFenceExcerpt: spacingAfterOpeningFenceExcerpt,
            languageExcerpt: languageExcerpt,
            spacingAfterLanguageExcerpt: spacingAfterLanguageExcerpt,
            codeExcerpt: codeExcerpt,
            spacingBeforeClosingFenceExcerpt: spacingBeforeClosingFenceExcerpt,
            closingFenceExcerpt: closingFenceExcerpt,
            spacingAfterClosingFenceExcerpt: spacingAfterClosingFenceExcerpt
        });
    };
    NodeParser.prototype._parseCodeSpan = function (tokenReader) {
        tokenReader.assertAccumulatedSequenceIsEmpty();
        var marker = tokenReader.createMarker();
        // Parse the opening backtick
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.Backtick) {
            // This would be a parser bug -- the caller of _parseCodeSpan() should have verified this while
            // looking ahead to distinguish code spans/fences
            throw new Error('Expecting a code span starting with a backtick character "`"');
        }
        tokenReader.readToken(); // read the backtick
        var openingDelimiterExcerpt = tokenReader.extractAccumulatedSequence();
        var codeExcerpt = undefined;
        var closingDelimiterExcerpt = undefined;
        // Parse the content backtick
        for (;;) {
            var peekedTokenKind = tokenReader.peekTokenKind();
            // Did we find the matching token?
            if (peekedTokenKind === Token_1.TokenKind.Backtick) {
                if (tokenReader.isAccumulatedSequenceEmpty()) {
                    return this._backtrackAndCreateErrorRange(tokenReader, marker, marker + 1, TSDocMessageId_1.TSDocMessageId.CodeSpanEmpty, 'A code span must contain at least one character between the backticks');
                }
                codeExcerpt = tokenReader.extractAccumulatedSequence();
                tokenReader.readToken();
                closingDelimiterExcerpt = tokenReader.extractAccumulatedSequence();
                break;
            }
            if (peekedTokenKind === Token_1.TokenKind.EndOfInput || peekedTokenKind === Token_1.TokenKind.Newline) {
                return this._backtrackAndCreateError(tokenReader, marker, TSDocMessageId_1.TSDocMessageId.CodeSpanMissingDelimiter, 'The code span is missing its closing backtick');
            }
            tokenReader.readToken();
        }
        return new nodes_1.DocCodeSpan({
            parsed: true,
            configuration: this._configuration,
            openingDelimiterExcerpt: openingDelimiterExcerpt,
            codeExcerpt: codeExcerpt,
            closingDelimiterExcerpt: closingDelimiterExcerpt
        });
    };
    NodeParser.prototype._tryReadSpacingAndNewlines = function (tokenReader) {
        var done = false;
        do {
            switch (tokenReader.peekTokenKind()) {
                case Token_1.TokenKind.Spacing:
                case Token_1.TokenKind.Newline:
                    tokenReader.readToken();
                    break;
                default:
                    done = true;
                    break;
            }
        } while (!done);
        return tokenReader.tryExtractAccumulatedSequence();
    };
    /**
     * Read the next token, and report it as a DocErrorText node.
     */
    NodeParser.prototype._createError = function (tokenReader, messageId, errorMessage) {
        tokenReader.readToken();
        var textExcerpt = tokenReader.extractAccumulatedSequence();
        var docErrorText = new nodes_1.DocErrorText({
            parsed: true,
            configuration: this._configuration,
            textExcerpt: textExcerpt,
            messageId: messageId,
            errorMessage: errorMessage,
            errorLocation: textExcerpt
        });
        this._parserContext.log.addMessageForDocErrorText(docErrorText);
        return docErrorText;
    };
    /**
     * Rewind to the specified marker, read the next token, and report it as a DocErrorText node.
     */
    NodeParser.prototype._backtrackAndCreateError = function (tokenReader, marker, messageId, errorMessage) {
        tokenReader.backtrackToMarker(marker);
        return this._createError(tokenReader, messageId, errorMessage);
    };
    /**
     * Rewind to the errorStartMarker, read the tokens up to and including errorInclusiveEndMarker,
     * and report it as a DocErrorText node.
     */
    NodeParser.prototype._backtrackAndCreateErrorRange = function (tokenReader, errorStartMarker, errorInclusiveEndMarker, messageId, errorMessage) {
        tokenReader.backtrackToMarker(errorStartMarker);
        while (tokenReader.createMarker() !== errorInclusiveEndMarker) {
            tokenReader.readToken();
        }
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.EndOfInput) {
            tokenReader.readToken();
        }
        var textExcerpt = tokenReader.extractAccumulatedSequence();
        var docErrorText = new nodes_1.DocErrorText({
            parsed: true,
            configuration: this._configuration,
            textExcerpt: textExcerpt,
            messageId: messageId,
            errorMessage: errorMessage,
            errorLocation: textExcerpt
        });
        this._parserContext.log.addMessageForDocErrorText(docErrorText);
        return docErrorText;
    };
    /**
     * Rewind to the specified marker, read the next token, and report it as a DocErrorText node
     * whose location is based on an IFailure.
     */
    NodeParser.prototype._backtrackAndCreateErrorForFailure = function (tokenReader, marker, errorMessagePrefix, failure) {
        tokenReader.backtrackToMarker(marker);
        tokenReader.readToken();
        var textExcerpt = tokenReader.extractAccumulatedSequence();
        var docErrorText = new nodes_1.DocErrorText({
            parsed: true,
            configuration: this._configuration,
            textExcerpt: textExcerpt,
            messageId: failure.failureMessageId,
            errorMessage: errorMessagePrefix + failure.failureMessage,
            errorLocation: failure.failureLocation
        });
        this._parserContext.log.addMessageForDocErrorText(docErrorText);
        return docErrorText;
    };
    /**
     * Rewind to the errorStartMarker, read the tokens up to and including errorInclusiveEndMarker,
     * and report it as a DocErrorText node whose location is based on an IFailure.
     */
    NodeParser.prototype._backtrackAndCreateErrorRangeForFailure = function (tokenReader, errorStartMarker, errorInclusiveEndMarker, errorMessagePrefix, failure) {
        tokenReader.backtrackToMarker(errorStartMarker);
        while (tokenReader.createMarker() !== errorInclusiveEndMarker) {
            tokenReader.readToken();
        }
        if (tokenReader.peekTokenKind() !== Token_1.TokenKind.EndOfInput) {
            tokenReader.readToken();
        }
        var textExcerpt = tokenReader.extractAccumulatedSequence();
        var docErrorText = new nodes_1.DocErrorText({
            parsed: true,
            configuration: this._configuration,
            textExcerpt: textExcerpt,
            messageId: failure.failureMessageId,
            errorMessage: errorMessagePrefix + failure.failureMessage,
            errorLocation: failure.failureLocation
        });
        this._parserContext.log.addMessageForDocErrorText(docErrorText);
        return docErrorText;
    };
    /**
     * Creates an IFailure whose TokenSequence is a single token.  If a marker is not specified,
     * then it is the current token.
     */
    NodeParser.prototype._createFailureForToken = function (tokenReader, failureMessageId, failureMessage, tokenMarker) {
        if (!tokenMarker) {
            tokenMarker = tokenReader.createMarker();
        }
        var tokenSequence = new TokenSequence_1.TokenSequence({
            parserContext: this._parserContext,
            startIndex: tokenMarker,
            endIndex: tokenMarker + 1
        });
        return {
            failureMessageId: failureMessageId,
            failureMessage: failureMessage,
            failureLocation: tokenSequence
        };
    };
    /**
     * Creates an IFailure whose TokenSequence starts from the specified marker and
     * encompasses all tokens read since then.  If none were read, then the next token used.
     */
    NodeParser.prototype._createFailureForTokensSince = function (tokenReader, failureMessageId, failureMessage, startMarker) {
        var endMarker = tokenReader.createMarker();
        if (endMarker < startMarker) {
            // This would be a parser bug
            throw new Error('Invalid startMarker');
        }
        if (endMarker === startMarker) {
            ++endMarker;
        }
        var tokenSequence = new TokenSequence_1.TokenSequence({
            parserContext: this._parserContext,
            startIndex: startMarker,
            endIndex: endMarker
        });
        return {
            failureMessageId: failureMessageId,
            failureMessage: failureMessage,
            failureLocation: tokenSequence
        };
    };
    return NodeParser;
}());
exports.NodeParser = NodeParser;
//# sourceMappingURL=NodeParser.js.map
}, function(modId) { var map = {"./Token":1784796701582,"./Tokenizer":1784796701615,"../nodes":1784796701575,"./TokenSequence":1784796701612,"./TokenReader":1784796701617,"./StringChecks":1784796701563,"../configuration/TSDocTagDefinition":1784796701566,"../details/StandardTags":1784796701565,"../emitters/PlainTextEmitter":1784796701574,"./TSDocMessageId":1784796701571}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701617, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenReader = void 0;
var Token_1 = require("./Token");
var TokenSequence_1 = require("./TokenSequence");
/**
 * Manages a stream of tokens that are read by the parser.
 *
 * @remarks
 * Use TokenReader.readToken() to read a token and advance the stream pointer.
 * Use TokenReader.peekToken() to preview the next token.
 * Use TokenReader.createMarker() and backtrackToMarker() to rewind to an earlier point.
 * Whenever readToken() is called, the token is added to an accumulated TokenSequence
 * that can be extracted by calling extractAccumulatedSequence().
 */
var TokenReader = /** @class */ (function () {
    function TokenReader(parserContext, embeddedTokenSequence) {
        this._parserContext = parserContext;
        this.tokens = parserContext.tokens;
        if (embeddedTokenSequence) {
            if (embeddedTokenSequence.parserContext !== this._parserContext) {
                throw new Error('The embeddedTokenSequence must use the same parser context');
            }
            this._readerStartIndex = embeddedTokenSequence.startIndex;
            this._readerEndIndex = embeddedTokenSequence.endIndex;
        }
        else {
            this._readerStartIndex = 0;
            this._readerEndIndex = this.tokens.length;
        }
        this._currentIndex = this._readerStartIndex;
        this._accumulatedStartIndex = this._readerStartIndex;
    }
    /**
     * Extracts and returns the TokenSequence that was accumulated so far by calls to readToken().
     * The next call to readToken() will start a new accumulated sequence.
     */
    TokenReader.prototype.extractAccumulatedSequence = function () {
        if (this._accumulatedStartIndex === this._currentIndex) {
            // If this happens, it indicates a parser bug:
            throw new Error('Parser assertion failed: The queue should not be empty when' +
                ' extractAccumulatedSequence() is called');
        }
        var sequence = new TokenSequence_1.TokenSequence({
            parserContext: this._parserContext,
            startIndex: this._accumulatedStartIndex,
            endIndex: this._currentIndex
        });
        this._accumulatedStartIndex = this._currentIndex;
        return sequence;
    };
    /**
     * Returns true if the accumulated sequence has any tokens yet.  This will be false
     * when the TokenReader starts, and it will be false immediately after a call
     * to extractAccumulatedSequence().  Otherwise, it will become true whenever readToken()
     * is called.
     */
    TokenReader.prototype.isAccumulatedSequenceEmpty = function () {
        return this._accumulatedStartIndex === this._currentIndex;
    };
    /**
     * Like extractAccumulatedSequence(), but returns undefined if nothing has been
     * accumulated yet.
     */
    TokenReader.prototype.tryExtractAccumulatedSequence = function () {
        if (this.isAccumulatedSequenceEmpty()) {
            return undefined;
        }
        return this.extractAccumulatedSequence();
    };
    /**
     * Asserts that isAccumulatedSequenceEmpty() should return false.  If not, an exception
     * is throw indicating a parser bug.
     */
    TokenReader.prototype.assertAccumulatedSequenceIsEmpty = function () {
        if (!this.isAccumulatedSequenceEmpty()) {
            // If this happens, it indicates a parser bug:
            var sequence = new TokenSequence_1.TokenSequence({
                parserContext: this._parserContext,
                startIndex: this._accumulatedStartIndex,
                endIndex: this._currentIndex
            });
            var tokenStrings = sequence.tokens.map(function (x) { return x.toString(); });
            throw new Error('Parser assertion failed: The queue should be empty, but it contains:\n' +
                JSON.stringify(tokenStrings));
        }
    };
    /**
     * Returns the next token that would be returned by _readToken(), without
     * consuming anything.
     */
    TokenReader.prototype.peekToken = function () {
        return this.tokens[this._currentIndex];
    };
    /**
     * Returns the TokenKind for the next token that would be returned by _readToken(), without
     * consuming anything.
     */
    TokenReader.prototype.peekTokenKind = function () {
        if (this._currentIndex >= this._readerEndIndex) {
            return Token_1.TokenKind.EndOfInput;
        }
        return this.tokens[this._currentIndex].kind;
    };
    /**
     * Like peekTokenKind(), but looks ahead two tokens.
     */
    TokenReader.prototype.peekTokenAfterKind = function () {
        if (this._currentIndex + 1 >= this._readerEndIndex) {
            return Token_1.TokenKind.EndOfInput;
        }
        return this.tokens[this._currentIndex + 1].kind;
    };
    /**
     * Like peekTokenKind(), but looks ahead three tokens.
     */
    TokenReader.prototype.peekTokenAfterAfterKind = function () {
        if (this._currentIndex + 2 >= this._readerEndIndex) {
            return Token_1.TokenKind.EndOfInput;
        }
        return this.tokens[this._currentIndex + 2].kind;
    };
    /**
     * Extract the next token from the input stream and return it.
     * The token will also be appended to the accumulated sequence, which can
     * later be accessed via extractAccumulatedSequence().
     */
    TokenReader.prototype.readToken = function () {
        if (this._currentIndex >= this._readerEndIndex) {
            // If this happens, it's a parser bug
            throw new Error('Cannot read past end of stream');
        }
        var token = this.tokens[this._currentIndex];
        if (token.kind === Token_1.TokenKind.EndOfInput) {
            // We don't allow reading the EndOfInput token, because we want _peekToken()
            // to be always guaranteed to return a valid result.
            // If this happens, it's a parser bug
            throw new Error('The EndOfInput token cannot be read');
        }
        this._currentIndex++;
        return token;
    };
    /**
     * Returns the kind of the token immediately before the current token.
     */
    TokenReader.prototype.peekPreviousTokenKind = function () {
        if (this._currentIndex === 0) {
            return Token_1.TokenKind.EndOfInput;
        }
        return this.tokens[this._currentIndex - 1].kind;
    };
    /**
     * Remembers the current position in the stream.
     */
    TokenReader.prototype.createMarker = function () {
        return this._currentIndex;
    };
    /**
     * Rewinds the stream pointer to a previous position in the stream.
     */
    TokenReader.prototype.backtrackToMarker = function (marker) {
        if (marker > this._currentIndex) {
            // If this happens, it's a parser bug
            throw new Error('The marker has expired');
        }
        this._currentIndex = marker;
        if (marker < this._accumulatedStartIndex) {
            this._accumulatedStartIndex = marker;
        }
    };
    return TokenReader;
}());
exports.TokenReader = TokenReader;
//# sourceMappingURL=TokenReader.js.map
}, function(modId) { var map = {"./Token":1784796701582,"./TokenSequence":1784796701612}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1784796701618, function(require, module, exports) {

// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParagraphSplitter = void 0;
var nodes_1 = require("../nodes");
/**
 * The ParagraphSplitter is a secondary stage that runs after the NodeParser has constructed
 * the DocComment.  It splits DocParagraph nodes into multiple paragraphs by looking for
 * paragraph delimiters.  Following CommonMark conventions, paragraphs are delimited by
 * one or more blank lines.  (These lines end with SoftBreak nodes.)  The blank lines are
 * not discarded.  Instead, they are attached to the preceding paragraph.  If the DocParagraph
 * starts with blank lines, they are preserved to avoid creating a paragraph containing only
 * whitespace.
 */
var ParagraphSplitter = /** @class */ (function () {
    function ParagraphSplitter() {
    }
    /**
     * Split all paragraphs belonging to the provided subtree.
     */
    ParagraphSplitter.splitParagraphs = function (node) {
        if (node instanceof nodes_1.DocSection) {
            ParagraphSplitter.splitParagraphsForSection(node);
            // (We don't recurse here, since sections cannot contain subsections)
        }
        else {
            for (var _i = 0, _a = node.getChildNodes(); _i < _a.length; _i++) {
                var childNode = _a[_i];
                ParagraphSplitter.splitParagraphs(childNode);
            }
        }
    };
    /**
     * Split all paragraphs belonging to the provided DocSection.
     */
    ParagraphSplitter.splitParagraphsForSection = function (docSection) {
        var inputNodes = docSection.nodes;
        var outputNodes = [];
        for (var _i = 0, inputNodes_1 = inputNodes; _i < inputNodes_1.length; _i++) {
            var oldNode = inputNodes_1[_i];
            if (oldNode.kind === nodes_1.DocNodeKind.Paragraph) {
                ParagraphSplitter._splitParagraph(oldNode, outputNodes);
            }
            else {
                outputNodes.push(oldNode);
            }
        }
        // Replace the inputNodes with the outputNodes
        docSection.clearNodes();
        docSection.appendNodes(outputNodes);
    };
    ParagraphSplitter._splitParagraph = function (oldParagraph, outputNodes) {
        var inputParagraphNodes = oldParagraph.nodes;
        var currentParagraph = new nodes_1.DocParagraph({ configuration: oldParagraph.configuration });
        outputNodes.push(currentParagraph);
        var SplitterState;
        (function (SplitterState) {
            SplitterState[SplitterState["Start"] = 0] = "Start";
            SplitterState[SplitterState["AwaitingTrailer"] = 1] = "AwaitingTrailer";
            SplitterState[SplitterState["ReadingTrailer"] = 2] = "ReadingTrailer";
        })(SplitterState || (SplitterState = {}));
        var state = SplitterState.Start;
        var currentIndex = 0;
        while (currentIndex < inputParagraphNodes.length) {
            // Scan forwards to the end of the line
            var isBlankLine = true;
            var lineEndIndex = currentIndex; // non-inclusive
            do {
                var node = inputParagraphNodes[lineEndIndex++];
                if (node.kind === nodes_1.DocNodeKind.SoftBreak) {
                    break;
                }
                if (isBlankLine) {
                    if (!this._isWhitespace(node)) {
                        isBlankLine = false;
                    }
                }
            } while (lineEndIndex < inputParagraphNodes.length);
            // At this point, the line and SoftBreak will be in inputParagraphNodes.slice(currentIndex, lineEndIndex)
            switch (state) {
                case SplitterState.Start:
                    // We're skipping any blank lines that start the first paragraph
                    if (!isBlankLine) {
                        state = SplitterState.AwaitingTrailer;
                    }
                    break;
                case SplitterState.AwaitingTrailer:
                    // We already saw some content, so now we're looking for a blank line that starts the trailer
                    // at the end of this paragraph
                    if (isBlankLine) {
                        state = SplitterState.ReadingTrailer;
                    }
                    break;
                case SplitterState.ReadingTrailer:
                    // We already found the trailer, so now we're looking for a non-blank line that will
                    // begin a new paragraph
                    if (!isBlankLine) {
                        // Start a new paragraph
                        currentParagraph = new nodes_1.DocParagraph({ configuration: oldParagraph.configuration });
                        outputNodes.push(currentParagraph);
                        state = SplitterState.AwaitingTrailer;
                    }
                    break;
            }
            // Append the line onto the current paragraph
            for (var i = currentIndex; i < lineEndIndex; ++i) {
                currentParagraph.appendNode(inputParagraphNodes[i]);
            }
            currentIndex = lineEndIndex;
        }
    };
    ParagraphSplitter._isWhitespace = function (node) {
        switch (node.kind) {
            case nodes_1.DocNodeKind.PlainText:
                var docPlainText = node;
                return ParagraphSplitter._whitespaceRegExp.test(docPlainText.text);
            default:
                return false;
        }
    };
    ParagraphSplitter._whitespaceRegExp = /^\s*$/;
    return ParagraphSplitter;
}());
exports.ParagraphSplitter = ParagraphSplitter;
//# sourceMappingURL=ParagraphSplitter.js.map
}, function(modId) { var map = {"../nodes":1784796701575}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1784796701561);
})()
//miniprogram-npm-outsideDeps=[]
//# sourceMappingURL=index.js.map