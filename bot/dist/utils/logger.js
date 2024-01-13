"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
class CustomLogger {
    constructor() {
        this.winstonFileLogger = (0, winston_1.createLogger)({
            level: 'info',
            format: winston_1.format.combine(winston_1.format.simple()),
            transports: [
                new winston_1.transports.File({ filename: 'error.log', level: 'error' }),
                new winston_1.transports.File({ filename: 'combined.log' }),
            ],
        });
    }
    async log(message, fromModule = 'global', optionalParam) {
        if (optionalParam) {
            this.winstonFileLogger.info(new Date().toISOString() + ' - ' + message).child(optionalParam);
            return;
        }
        this.winstonFileLogger.info(`[${fromModule}]` + new Date().toISOString() + ' - ' + message);
    }
    async error(message, fromModule = 'global', optionalParam) {
        if (optionalParam) {
            this.winstonFileLogger.error(new Date().toISOString() + ' - ' + message).child(optionalParam);
            return;
        }
        this.winstonFileLogger.error(`[${fromModule}]` + new Date().toISOString() + ' - ' + message);
    }
}
exports.logger = new CustomLogger();
//# sourceMappingURL=logger.js.map