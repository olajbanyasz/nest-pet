import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockGetResponse = jest.fn().mockReturnValue({ status: mockStatus });
  const mockGetRequest = jest.fn().mockReturnValue({ url: '/test' });

  const mockArgumentsHost = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    }),
  } as unknown as ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException', () => {
    const status = HttpStatus.BAD_REQUEST;
    const message = 'Bad Request';
    const exception = new HttpException(message, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: status,
        message: message,
        path: '/test',
      }),
    );
  });

  it('should catch generic Error', () => {
    const message = 'Something went wrong';
    const exception = new Error(message);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: message,
      }),
    );
  });

  it('should catch unknown exception type', () => {
    const exception = 'unknown error';

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'unknown error',
      }),
    );
  });

  it('should handle HttpException with object response', () => {
    const status = HttpStatus.FORBIDDEN;
    const exceptionResponse = { message: 'Custom error', code: 'CUSTOM_CODE' };
    const exception = new HttpException(exceptionResponse, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: status,
        message: 'Custom error',
        code: 'CUSTOM_CODE',
      }),
    );
  });
});
