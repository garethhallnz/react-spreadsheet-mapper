import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Dropzone from './Dropzone';
import DataUploadHandler from './DataUploadHandler';

const SpreadsheetMapper = ({ fields }) => {
  const [files, setFiles] = useState([]);

  const onChange = (items) => {
    if (items.length) {
      const { 0: file } = items;
      setFiles(file);
    }
  };

  console.log({ files });

  return (
    <div className="App">
      <Dropzone setFiles={onChange} />
      <DataUploadHandler
        onClose={(event) => console.log({ close: event })}
        targetFields={fields}
        file={files}
      />
    </div>
  );
};

SpreadsheetMapper.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      required: PropTypes.bool,
    }),
  ),
};

SpreadsheetMapper.defaultProps = {
  fields: [],
};

export default SpreadsheetMapper;
