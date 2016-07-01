"use strict";
var parser = require("odata-v4-parser");
var visitor_1 = require("./visitor");
var pattern = /function[^(]*\(([^)]*)\)/;
function ODataController(ctrl, metadata) {
    return function (req, res, next) {
        var visitor = new visitor_1.Visitor();
        visitor.Visit(parser.odataUri(req.url, { metadata: metadata.edmx || metadata }));
        req.odata = visitor;
        var fnCaller = function (fn, params) {
            var fnParams;
            var paramsArray = Object.keys(params);
            if (paramsArray.length == 1) {
                fnParams = [params[paramsArray[0]]];
            }
            else {
                fnParams = fn.toString().match(pattern)[1].split(/,\s*/);
                for (var i = 0; i < fnParams.length; i++) {
                    fnParams[i] = params[fnParams[i]];
                }
            }
            return fn.apply(this, fnParams);
        };
        var instance = new ctrl(req, res, next);
        var nav = visitor.navigation.slice();
        var navFn = function (context) {
            var current = nav.shift();
            if (current && typeof instance[current.name] == 'function') {
                var fn = instance[current.name];
                var params = {};
                if (current.key)
                    current.key.forEach(function (key) { return params[key.name] = key.value; });
                var value = fnCaller.call(context, fn, params);
                if (typeof value != 'undefined') {
                    if (typeof value.then == 'function')
                        value.then(navFn, errorFn);
                    else
                        navFn(value);
                }
                else
                    navFn(context);
            }
            else
                callFn(context);
        };
        var callFn = function (context) {
            if (visitor.call) {
                if (typeof instance[visitor.call] == 'function') {
                    var fn = instance[visitor.call];
                    var params = req.method.toLowerCase() == 'get' ? visitor.params || {} : req.body || {};
                    var value = fnCaller.call(context, fn, params);
                    if (typeof value != 'undefined') {
                        if (typeof value.then == 'function')
                            value.then(res.send, errorFn);
                        else
                            res.send(value);
                    }
                }
                else
                    errorFn();
            }
            else if (context != instance) {
                res.json(context);
            }
            else
                errorFn();
        };
        var errorFn = function (err) {
            if (!err)
                res.status(404);
            if (!res.statusCode || (res.statusCode - 200 < 100))
                res.status(500);
            res.json({
                error: {
                    code: '' + res.statusCode,
                    message: err || 'Resource not found.'
                }
            });
        };
        if (visitor.singleton && typeof instance[visitor.singleton] != 'undefined' && typeof instance[visitor.singleton] != 'function') {
            var result = instance[visitor.singleton];
            if (typeof result.then == 'function')
                result.then(res.send, errorFn);
            else
                res.send(instance);
        }
        else
            navFn(instance);
    };
}
exports.ODataController = ODataController;
function createServiceOperationCall(odataUri, metadata) {
    return new visitor_1.Visitor().Visit(parser.odataUri(odataUri, { metadata: metadata.edmx || metadata }));
}
exports.createServiceOperationCall = createServiceOperationCall;
function createODataPath(odataUri, metadata) {
    var visitor = new visitor_1.Visitor();
    visitor.Visit(parser.odataUri(odataUri, { metadata: metadata.edmx || metadata }));
    return visitor.path;
}
exports.createODataPath = createODataPath;
//# sourceMappingURL=index.js.map