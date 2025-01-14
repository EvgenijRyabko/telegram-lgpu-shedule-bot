import { createLogger, format, transports } from 'winston';

class CustomLogger {
  winstonFileLogger = createLogger({
    level: 'info',
    format: format.combine(format.simple()),
    transports: [
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      //
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.File({ filename: 'combined.log' }),
    ],
  });

  async log(message: string, fromModule: string = 'global', optionalParam?: any) {
    const dateString = new Date().toISOString();

    if (optionalParam) {
      this.winstonFileLogger.info(`${dateString} - ${message}`).child(optionalParam);
      return;
    }
    this.winstonFileLogger.info(`[${fromModule}] ${dateString} - ${message}`);
  }

  async error(message: string, fromModule: string = 'global', optionalParam?: any) {
    const dateString = new Date().toISOString();

    if (optionalParam) {
      this.winstonFileLogger.error(`${dateString} - ${message}`).child(optionalParam);
      return;
    }
    this.winstonFileLogger.error(`[${fromModule}] ${dateString} - ${message}`);
  }
}

export const logger = new CustomLogger();
