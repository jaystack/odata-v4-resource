"use strict";
var odata_v4_literal_1 = require("odata-v4-literal");
var Visitor = (function () {
    function Visitor() {
        this.navigation = [];
        this.path = '';
    }
    Visitor.prototype.Visit = function (node, context) {
        this.ast = this.ast || node;
        context = context || {};
        if (node) {
            var visitor;
            switch (node.type) {
                case 'PrimitiveFunctionImportCall':
                case 'PrimitiveCollectionFunctionImportCall':
                case 'ComplexFunctionImportCall':
                case 'ComplexCollectionFunctionImportCall':
                case 'EntityFunctionImportCall':
                case 'EntityCollectionFunctionImportCall':
                    visitor = this.VisitFunctionImportCall;
                    break;
                case 'BoundPrimitiveFunctionCall':
                case 'BoundPrimitiveCollectionFunctionCall':
                case 'BoundComplexFunctionCall':
                case 'BoundComplexCollectionFunctionCall':
                case 'BoundEntityFunctionCall':
                case 'BoundEntityCollectionFunctionCall':
                    visitor = this.VisitBoundFunctionCall;
                    break;
                default:
                    visitor = this[("Visit" + node.type)];
            }
            if (visitor)
                visitor.call(this, node, context);
            else
                console.log("Unhandled node type: " + node.type);
        }
        return {
            navigation: this.navigation,
            call: this.call,
            params: this.params
        };
    };
    Visitor.prototype.VisitODataUri = function (node, context) {
        this.Visit(node.value.query, context);
        this.Visit(node.value.resource, context);
    };
    Visitor.prototype.VisitQueryOptions = function (node, context) {
        var _this = this;
        var self = this;
        this.alias = {};
        node.value.options.forEach(function (option) { return _this.Visit(option, context); });
    };
    Visitor.prototype.VisitAliasAndValue = function (node, context) {
        this.Visit(node.value.value.value, context);
        this.alias[node.value.alias.value.name] = context.literal;
        delete context.literal;
    };
    Visitor.prototype.VisitResourcePath = function (node, context) {
        this.Visit(node.value.resource, context);
        this.Visit(node.value.navigation, context);
    };
    Visitor.prototype.VisitSingletonEntity = function (node, context) {
        this.singleton = node.raw;
    };
    Visitor.prototype.VisitEntitySetName = function (node, context) {
        this.navigation.push({ name: node.value.name, type: node.type });
        this.path += '/' + node.value.name;
    };
    Visitor.prototype.VisitCollectionNavigation = function (node, context) {
        this.Visit(node.value.path, context);
    };
    Visitor.prototype.VisitCollectionNavigationPath = function (node, context) {
        this.Visit(node.value.predicate, context);
        this.Visit(node.value.navigation, context);
    };
    Visitor.prototype.VisitSimpleKey = function (node, context) {
        var lastNavigationPart = this.navigation[this.navigation.length - 1];
        lastNavigationPart.key = [{
                name: node.value.key,
                value: odata_v4_literal_1.Literal.convert(node.value.value.value, node.value.value.raw)
            }];
        this.path += '(\\(([^,]+)\\))';
    };
    Visitor.prototype.VisitCompoundKey = function (node, context) {
        var _this = this;
        this.path += '(\\(';
        var lastNavigationPart = this.navigation[this.navigation.length - 1];
        lastNavigationPart.key = node.value.map(function (pair, i) {
            _this.path += i == node.value.length - 1 ? '([^,]+)' : '([^,]+,)';
            return {
                name: pair.value.key.value.name,
                value: odata_v4_literal_1.Literal.convert(pair.value.value.value, pair.value.value.raw)
            };
        });
        this.path += '\\))';
    };
    Visitor.prototype.VisitSingleNavigation = function (node, context) {
        this.Visit(node.value.path, context);
    };
    Visitor.prototype.VisitPropertyPath = function (node, context) {
        this.Visit(node.value.path, context);
        this.Visit(node.value.navigation, context);
    };
    Visitor.prototype.VisitEntityNavigationProperty = function (node, context) {
        this.navigation.push({ name: node.value.name, type: node.type });
        this.path += '/' + node.value.name;
    };
    Visitor.prototype.VisitEntityCollectionNavigationProperty = function (node, context) {
        this.navigation.push({ name: node.value.name, type: node.type });
        this.path += '/' + node.value.name;
    };
    Visitor.prototype.VisitValueExpression = function (node, context) {
        this.call = '$value';
        this.params = {};
    };
    Visitor.prototype.VisitRefExpression = function (node, context) {
        this.call = '$ref';
        this.params = {};
    };
    Visitor.prototype.VisitBoundOperation = function (node, context) {
        this.Visit(node.value.operation, context);
    };
    Visitor.prototype.VisitBoundActionCall = function (node, context) {
        this.call = node.raw;
    };
    Visitor.prototype.VisitBoundFunctionCall = function (node, context) {
        var _this = this;
        this.call = node.value.call.value.namespace + "." + node.value.call.value.name;
        this.path += '/' + this.call;
        this.path += '(\\(';
        this.params = {};
        node.value.params.value.forEach(function (param, i) {
            _this.Visit(param, context);
            if (i < node.value.params.value.length - 1)
                _this.path += ',';
        });
        this.path += '\\))';
    };
    Visitor.prototype.VisitFunctionImportCall = function (node, context) {
        var _this = this;
        this.call = node.value.import.value.name;
        this.params = {};
        node.value.params.forEach(function (param) { return _this.Visit(param, context); });
    };
    Visitor.prototype.VisitFunctionParameter = function (node, context) {
        this.Visit(node.value.value, context);
        this.params[node.value.name.value.name] = context.literal;
        this.path += node.value.name.value.name + '=([^,]+)';
        delete context.literal;
    };
    Visitor.prototype.VisitActionImportCall = function (node, context) {
        this.call = node.value.value.name;
    };
    Visitor.prototype.VisitParameterAlias = function (node, context) {
        context.literal = this.alias[node.value.name];
    };
    Visitor.prototype.VisitLiteral = function (node, context) {
        context.literal = odata_v4_literal_1.Literal.convert(node.value, node.raw);
    };
    return Visitor;
}());
exports.Visitor = Visitor;
//# sourceMappingURL=visitor.js.map