import {Request as ExpressRequest} from 'express';
// import winston from 'winston';
import RepositoryLocator from '../RepositoryLocator';
import IServices from '../services';
import UserSchema from '../../entities/schemas/User.schema';

declare module 'express' {
  export interface Request extends ExpressRequest {
    user?: UserSchema; // Define the type for your authenticated user
    repositories?: RepositoryLocator;
    services?: IServices;
  }

  // export interface Response extends ExpressResponse {
  //   // success?(data: {
  //   //     code?: number = 201;
  //   //     message?: unknown = 'Successfully made request';
  //   //     data?: unknown = {};
  //   // }): this;
  //   // internalServerError?(data: {
  //   //     code?: number = 201;
  //   //     message?: unknown = 'Internal server error';
  //   //     data?: unknown = {};
  //   // }): this;
  //   // badRequest?(data: {
  //   //     code?: number = 201;
  //   //     message?: unknown = 'Invalid request';
  //   //     data?: unknown = {};
  //   // }): this;
  //   // unAuthorised?(data: {
  //   //     code?: number = 201;
  //   //     message?: unknown = 'Unauthorised to access resource';
  //   //     data?: unknown = {};
  //   // }): this;
  //   // pageNotFound?(data: {
  //   //     code?: number = 201;
  //   //     message?: unknown = 'Sorry page not found';
  //   //     data?: unknown = {};
  //   // }): this;
  // }
}
