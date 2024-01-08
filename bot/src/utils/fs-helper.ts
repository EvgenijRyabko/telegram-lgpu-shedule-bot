import * as fs from 'fs/promises';
import { logger } from './logger';

export async function checkPathExist(path: string) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function mkdir(path: string) {
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (e: any) {
    logger.error(e instanceof Error ? e.message : e, 'FS');
  }
}

export async function dropFile(path: string, handler = (e: any) => e) {
  await fs
    .unlink(path)
    .then(handler)
    .catch((e: any) => {
      logger.error(e instanceof Error ? e.message : e, 'FS');
    });
}

export async function clearFile(path: string) {
  try {
    await fs.truncate(path);
  } catch (e: any) {
    logger.error(e instanceof Error ? e.message : e, 'FS');
  }
}

export async function writeFile(path: string, data: Buffer) {
  try {
    await fs.writeFile(path, data);
  } catch (e: any) {
    logger.error(e instanceof Error ? e.message : e, 'FS');
  }
}
