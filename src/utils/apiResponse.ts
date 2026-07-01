export class ApiResponse {
  static success(data: any, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  static error(message: string, statusCode = 500, errors?: any) {
    return {
      success: false,
      statusCode,
      message,
      errors,
    };
  }
}

export class ApiError extends Error {
  statusCode: number;
  errors: any;

  constructor(statusCode: number, message: string, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
