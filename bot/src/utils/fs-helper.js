import * as fs from "fs/promises";
import { logger } from "./logger.js";

export async function checkPathExist(path) {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

writeFile;

export async function mkdir(path) {
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (e) {
    logger.error(e, "FS");
  }
}

export async function writeFile(path, data) {
  try {
    await fs.writeFile(path, data);
  } catch (e) {
    logger.error(e, "FS");
  }
}
