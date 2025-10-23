import { Logger as NestLogger } from '@nestjs/common';

export class Logger {
  private readonly nestLogger: NestLogger;

  constructor(context?: string) {
    this.nestLogger = new NestLogger(context);
  }

  log(message: string, context?: string) {
    this.nestLogger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.nestLogger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.nestLogger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.nestLogger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.nestLogger.verbose(message, context);
  }
}