import {
    Response as ExpressResponse,
    Request as ExpressRequest,
} from "express";
import winston from "winston";
import RepositoryLocator from "../RepositoryLocator";

declare module "express" {
    export interface Request extends ExpressRequest {
        user?: any; // Define the type for your authenticated user
        dbConn?: mongoose.Connection;
        repositories?: RepositoryLocator;
    }

    export interface Response extends ExpressResponse {
        success?(data: {
            code?: number = 201;
            message?: any = "Successfully made request";
            data?: any = {};
        }): this;
        internalServerError?(data: {
            code?: number = 201;
            message?: any = "Internal server error";
            data?: any = {};
        }): this;
        badRequest?(data: {
            code?: number = 201;
            message?: any = "Invalid request";
            data?: any = {};
        }): this;
        unAuthorised?(data: {
            code?: number = 201;
            message?: any = "Unauthorised to access resource";
            data?: any = {};
        }): this;
        pageNotFound?(data: {
            code?: number = 201;
            message?: any = "Sorry page not found";
            data?: any = {};
        }): this;
    }
}
