// import Excel from "exceljs";
import * as xlsx from "xlsx";
import { logger } from "../utils/logger.js";

export const generateShortGroupShedule = async (buffer) => {
  try {
    //  const workbook = new Excel.Workbook();
    //  await workbook.xlsx.load(Buffer.from(buffer), {
    //    ignoreNodes: [
    //      "dataValidations", // ignores the workbook's Data Validations
    //    ],
    //  });

    const workbook = xlsx.read(Buffer.from(buffer));

    const data = xlsx.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );

    const newData = [];

    let searchCol = undefined;
    let dayCol = undefined;
    let timeCol = undefined;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const keys = Object.keys(row);

      if (searchCol) {
        if (row[searchCol]) {
          const rowKeys = Object.keys(row);

          const searchColIndex = rowKeys.findIndex((el) => el === searchCol);

          const time = row[rowKeys[searchColIndex - 1]];

          const day = row[rowKeys[searchColIndex - 2]];

          console.log(day, time, row[searchCol]);

          //  console.log(row[searchCol]);
        }
      }

      for (let j = 0; j < keys.length; j++) {
        if (
          row[keys[j]]
            .toString()
            .trim()
            .split(" ")
            .join("")
            .toLowerCase()
            .includes("1по(ксор)")
        ) {
          searchCol = keys[j];
        }
      }
      // for (const el of row) {
      //   if (el.toLowerCase().trim().includes("1ксор")) console.log(el);
      // }
    }

    //  console.log(data[3]);

    // Printing data
    //  console.log(workbook);
  } catch (e) {
    logger.error(e, "Excel-generator");
  }
};
