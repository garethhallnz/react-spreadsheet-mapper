import React, { useEffect, useState } from 'react';
import DataMapper from './DataMapper';
import SpreadSheetService from '../Helpers/SpreadsheetService';

const DataUploadHandler = (props) => {
  const [parsedData, setParsedData] = useState([]);
  const { file, title, onClose } = props;

  useEffect(() => {
    if (file instanceof File) {
      SpreadSheetService(file).then(
        (resolveData) => {
          const output = [];
          resolveData.forEach((object) => {
            if (!object.results || !object.results.data || !object.results.data.length) {
              return false;
            }
            output.push(object);
            return true;
          });
          setParsedData(output);
          return output;
        },
      );
    }
  }, [file]);
  let output = '';
  const {
    model, targetFields, extraFields,
  } = props;

  if (parsedData && parsedData.length > 0) {
    let dataFields = [];
    const sampleData = [];
    const results = [];
    parsedData.forEach((item) => {
      dataFields = item.results.meta.fields.map((field) => ({ field }));
      results.push(item.results);
      sampleData.push(item.results.data);
    });
    output = (
      <>
        <DataMapper
          onClose={onClose}
          title={title}
          initialTargetFields={targetFields}
          initialDataFields={dataFields}
          sampleData={sampleData}
          sampleDataRowSize={3}
          model={model}
          extraFields={extraFields}
        />
      </>
    );
  }

  return output;
};

export default DataUploadHandler;
