const xlsx = require('xlsx');
const path = require('path');

let iitData = [];
let iiitData = [];
let nitData = [];
let gftiData = [];

function loadExcelData() {
    const filePath = path.join(__dirname, '../data/JoSAA-2024.xlsx');
    const workbook = xlsx.readFile(filePath);
    
    iitData = xlsx.utils.sheet_to_json(workbook.Sheets['IITs_2024']);
    iiitData = xlsx.utils.sheet_to_json(workbook.Sheets['IIITs_2024']);
    nitData = xlsx.utils.sheet_to_json(workbook.Sheets['NITs_2024']);
    gftiData = xlsx.utils.sheet_to_json(workbook.Sheets['GFTIs_2024']);

    console.log("Excel data loaded successfully");
}

module.exports = {
    loadExcelData,
    getIITData: () => iitData,
    getIIITData: () => iiitData,
    getNITData: () => nitData,
    getGFTIData: () => gftiData
};
