import { Telegram } from 'telegraf';
import 'dotenv/config';
declare const startSheduleJob: (info: {
    counter: number;
    errors: Error[] | string[];
}, telegram: Telegram) => Promise<void>;
declare const stopSheduleJob: () => Promise<void>;
declare const getSheduleJobStatus: () => Promise<boolean>;
export { startSheduleJob, stopSheduleJob, getSheduleJobStatus };
