import { Telegram } from 'telegraf';
import 'dotenv/config';
declare const startReportJob: (info: {
    counter: number;
    errors: Error[] | string[];
}, status: boolean, telegram: Telegram) => Promise<void>;
declare const stopReportJob: () => Promise<void>;
declare const getReportJobStatus: () => Promise<boolean>;
export { startReportJob, stopReportJob, getReportJobStatus };
