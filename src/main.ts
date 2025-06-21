import * as fs from 'node:fs';

import * as XLSX from 'xlsx';

import type { CTCAE_DATABASE } from './CTCAE/CtcaeManager.ts';
import { fillModelsAndCategoriesFromJsonData, loadMapAndWriteTerms } from './transform';


const EXCEL_SPREADSHEET_CTCAE = "./data/CTCAE_v5.0_2017-11-27.xlsx";
//const CTCAE_JSON_OUTFILE = "output/ctae.json";
//const CATEGORIES_JSON_OUTFILE = "output/categories.json";
//export const CATEGORIES_TERM_TEXT_OUTFILE = "output/categories.txt";
//export const TERMS_TERM_TEXT_OUTFILE = "output/terms.txt";

export type OutputFileDefinitions = {
  ctcaeJsonOUtfile: string,
  /**
   * Where to write the generated Excel JSON file 
   */
  categoriesJsonOUtfile: string,
  categoriesTermTextOUtfile: string,
  termsTermTextOUtfile: string

}
export type OutputFlags = {
  write_excel_json: boolean;
  write_terminologies: boolean;
}



doTheWork({
  ctcaeJsonOUtfile: "output/ctae.json",
  categoriesJsonOUtfile: "output/categories.json",
  categoriesTermTextOUtfile: "output/categories.txt",
  termsTermTextOUtfile: "output/terms.txt"
}, {
  write_excel_json: true,
  write_terminologies: true

}).then(() => { }).catch(() => { })

async function doTheWork(options: OutputFileDefinitions, outputFlags: OutputFlags) {
  console.log("|- starting the work");

  const excelFile = loadExcelFile(EXCEL_SPREADSHEET_CTCAE);
  const excelAsJsonObject = XLSX.utils.sheet_to_json(excelFile.Sheets[excelFile.SheetNames[0]]);
  const excelAsJsonString = JSON.stringify(excelAsJsonObject, null, 1);

  const db = createDatabaseModel(excelAsJsonString);
  fs.writeFileSync(options.categoriesJsonOUtfile, JSON.stringify(db, null, 1), { encoding: "utf-8" });

  if (outputFlags.write_excel_json) {
    const outFileJson = options.ctcaeJsonOUtfile
    console.log(`Writing Excel json to file ${outFileJson}`);
    fs.writeFileSync(outFileJson, excelAsJsonString, { encoding: 'utf-8' });
  }

  if (outputFlags.write_terminologies) {
    console.log("Writing terminologies as text files ");
    loadMapAndWriteTerms(excelAsJsonString, options);
  }

  

  console.log("|-- All finished");
  
  
  
}


function loadExcelFile(filename: string) {
    console.log(`Loading CTCAE codes from Excel file ${filename}`);
    return XLSX.readFile(filename);
  }

  function createDatabaseModel(json: string) {
    const categoriesAndModels = fillModelsAndCategoriesFromJsonData(json);
    const db: CTCAE_DATABASE = {
      categories: [],
      models: categoriesAndModels.models,
    };
    let n = 1000;
    if (!categoriesAndModels.categories) {
      throw new Error("No categories defined - whats up?");
    }
    Object.keys(categoriesAndModels.categories).forEach((k) => {
      n = categoriesAndModels.categories[k];
      db.categories.push({ id: n, name: k });
    });
    //console.log(db.categories);
    return db;
  }