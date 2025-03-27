const xlsx = require('xlsx');

const loadUsersFromExcel = () => {
    const workbook = xlsx.readFile('../users.xlsx');  
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(sheet);
};

module.exports = loadUsersFromExcel;