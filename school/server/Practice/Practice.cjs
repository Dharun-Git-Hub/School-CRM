const xlsx = require('xlsx');

async function importExcelToMongoDB(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        console.log(data)
    } catch (error) {
        console.error('Error importing data:', error);
    }
}

importExcelToMongoDB('../../xlxs/Book1.xlsx');

// const xlsx = require('xlsx');

// const workbook = xlsx.readFile('../../xlxs/Book1.xlsx');

// const sheetName = workbook.SheetNames[0];
// const worksheet = workbook.Sheets[sheetName];

// let jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// const defaultHeaders = ['Roll', 'Name', 'Grade'];
// if (jsonData.length > 0 && jsonData[0].some(cell => cell === undefined || cell === null)) {
//   jsonData[0] = defaultHeaders;
// }
// const result = xlsx.utils.sheet_to_json(worksheet, { header: jsonData[0] });

// console.log(result);
