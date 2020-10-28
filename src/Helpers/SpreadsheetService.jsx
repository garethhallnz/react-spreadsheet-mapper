import * as XLSX from 'xlsx';

const SpreadSheetService = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  const isBinaryString = Boolean(reader.readAsBinaryString);
  let output;
  reader.onload = (event) => {
    const binaryString = event.target.result;
    const workbook = XLSX.read(binaryString, { type: isBinaryString ? 'binary' : 'array' });
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    const fields = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
    workbook.SheetNames.forEach((sheet) => {
      const rowObjectArray = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
      output = [{ file, results: { data: rowObjectArray, meta: { fields } } }];
    });
    resolve(output);
  };
  if (isBinaryString) reader.readAsBinaryString(file); else reader.readAsArrayBuffer(file);
});

export default SpreadSheetService;
