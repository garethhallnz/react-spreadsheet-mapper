import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';

const Dropzone = ({ accept, setFiles }) => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  useEffect(() => {
    setFiles(acceptedFiles);
  }, [acceptedFiles, setFiles]);

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {`${file.path} - ${file.size} bytes`}
    </li>
  ));

  const {
    onBlur,
    onClick: onClickDropzone,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onFocus,
    onKeyDown,
    ref: refDropzone,
    tabindex: tabindexDropzone,
  } = getRootProps();

  const {
    autoComplete,
    multiple,
    onChange,
    onClick,
    ref,
    style,
    tabindex,
    type,
  } = getInputProps();

  return (
    <section className="container">
      <div
        className="dropzone"
        aria-hidden="true"
        onBlur={onBlur}
        onClick={onClickDropzone}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        ref={refDropzone}
        tabIndex={tabindexDropzone}
      >

        <input
          accept={accept}
          autoComplete={autoComplete}
          multiple={multiple}
          onChange={onChange}
          onClick={onClick}
          ref={ref}
          style={style}
          tabIndex={tabindex}
          type={type}
        />
        <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
      </div>
      {files.length > 0 && (
      <aside>
        <h4>{files.length > 1 ? 'Files' : 'File'}</h4>
        <ul>{files}</ul>
      </aside>
      )}

    </section>
  );
};

Dropzone.propTypes = {
  accept: PropTypes.string,
  setFiles: PropTypes.func,
};

Dropzone.defaultProps = {
  accept: 'text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
  setFiles: () => {},
};

export default Dropzone;
