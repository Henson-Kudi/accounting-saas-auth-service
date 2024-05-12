import Joi from '@hapi/joi';

export default class ResponseMessage {
  constructor(
    public message: string,
    public statusCode: number
  ) {}
}

export class SuccessMessage extends ResponseMessage {
  constructor(
    public data: unknown,
    message = 'Success',
    statusCode = 201
  ) {
    super(message, statusCode);
  }
}

export class UnhandledErrorMessage extends ResponseMessage {
  constructor(
    public error: any,
    message = 'Unhandled Error',
    statusCode = 500
  ) {
    super(message, statusCode);
    this.error.message && (this.message = this.error.message);
  }
}

export class NotFoundMessage extends ResponseMessage {
  constructor(
    public message: string = 'Not Found',
    statusCode = 404
  ) {
    super(message, statusCode);
  }
}

export class BadRequestMessage extends ResponseMessage {
  constructor(
    public message: string = 'Bad Request',
    statusCode = 400
  ) {
    super(message, statusCode);
  }
}

export class ValidationMessage extends ResponseMessage {
  constructor(
    public errors: unknown,
    message = 'Validation Failed',
    statusCode = 422
  ) {
    super(message, statusCode);

    if (Joi.isError(errors)) {
      this.message = errors.message;
      this.errors = errors.details;
    }
  }
}

export class UnauthorizedMessage extends ResponseMessage {
  constructor(
    public message: string = 'Unauthorized',
    statusCode = 401
  ) {
    super(message, statusCode);
  }
}

export class ForbiddenMessage extends ResponseMessage {
  constructor(
    public message: string = 'Forbidden',
    statusCode = 403
  ) {
    super(message, statusCode);
  }
}

export class ServiceUnavailableMessage extends ResponseMessage {
  constructor(
    public message: string = 'Service Unavailable',
    statusCode = 503
  ) {
    super(message, statusCode);
  }
}

export class GatewayTimeoutMessage extends ResponseMessage {
  constructor(
    public message: string = 'Gateway Timeout',
    statusCode = 504
  ) {
    super(message, statusCode);
  }
}

export class RequestTimeoutMessage extends ResponseMessage {
  constructor(
    public message: string = 'Request Timeout',
    statusCode = 408
  ) {
    super(message, statusCode);
  }
}
