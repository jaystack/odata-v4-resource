import * as parser from "odata-v4-parser";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { Visitor, ODataResource } from "./visitor";

const pattern = /function[^(]*\(([^)]*)\)/;
export function ODataController(ctrl:any, metadata:any):RequestHandler{
    return function(req:Request, res:Response, next:NextFunction){
        var visitor = new Visitor();
        visitor.Visit(parser.odataUri(req.url, { metadata: metadata.edmx || metadata }));
        (<any>req).odata = visitor;

        var fnCaller = function(fn, params){
            var fnParams;
            var paramsArray = Object.keys(params);
            if (paramsArray.length == 1){
                fnParams = [params[paramsArray[0]]];
            }else{
                fnParams = fn.toString().match(pattern)[1].split(/,\s*/);
                for (var i = 0; i < fnParams.length; i++){
                    fnParams[i] = params[fnParams[i]];
                }
            }
            
            return fn.apply(this, fnParams);
        };
        
        var instance = new ctrl(req, res, next);
        var nav = visitor.navigation.slice();
        var navFn = function(context){
            var current = nav.shift();
            if (current && typeof instance[current.name] == 'function'){
                var fn = instance[current.name];
                var params = {};
                if (current.key) current.key.forEach((key) => params[key.name] = key.value);

                var value = fnCaller.call(context, fn, params);
                if (typeof value != 'undefined'){
                    if (typeof value.then == 'function') value.then(navFn, errorFn);
                    else navFn(value);
                }else navFn(context);
            }else callFn(context);
        };

        var callFn = function(context){
            if (visitor.call){
                if (typeof instance[visitor.call] == 'function'){
                    var fn = instance[visitor.call];
                    var params = req.method.toLowerCase() == 'get' ? visitor.params || {} : req.body || {};
                    
                    var value = fnCaller.call(context, fn, params);
                    if (typeof value != 'undefined'){
                        if (typeof value.then == 'function') value.then(res.send, errorFn);
                        else res.send(value);
                    }
                }else errorFn();
            }else if (context != instance){
                res.json(context);
            }else errorFn();
        };

        var errorFn = function(err?:Error){
            if (!err) res.status(404);
            if (!res.statusCode || (res.statusCode - 200 < 100)) res.status(500);
            res.json({
                error: {
                    code: '' + res.statusCode,
                    message: err || 'Resource not found.'
                }
            });
        };

        if (visitor.singleton && typeof instance[visitor.singleton] != 'undefined' && typeof instance[visitor.singleton] != 'function'){
            var result = instance[visitor.singleton];
            if (typeof result.then == 'function') result.then(res.send, errorFn);
            else res.send(instance);
        }else navFn(instance);
    };
}

export function createServiceOperationCall(odataUri:string, metadata:any):ODataResource{
    return new Visitor().Visit(parser.odataUri(odataUri, { metadata: metadata.edmx || metadata }));
}

export function createODataPath(odataUri:string, metadata:any):string{
    let visitor = new Visitor();
    visitor.Visit(parser.odataUri(odataUri, { metadata: metadata.edmx || metadata }));
    return visitor.path;
}