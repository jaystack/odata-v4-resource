import { RequestHandler } from "express";
import { ODataResource } from "./visitor";
export declare function ODataController(ctrl: any, metadata: any): RequestHandler;
export declare function createServiceOperationCall(odataUri: string, metadata: any): ODataResource;
export declare function createODataPath(odataUri: string, metadata: any): string;
