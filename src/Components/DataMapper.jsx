import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DataFieldMapper from './DataFieldMapper';
import dataMapperActions from '../Store/DataMapper/DataMapper.action';
import dataSourceActions from '../Store/DataSource/DataSource.action';

const DataMapper = (props) => {
  const {
    onClose,
    dispatch,
    initialTargetFields,
    initialDataFields,
    dataMapper,
    sampleData,
    sampleDataRowSize,
  } = props;
  useEffect(() => {
    dispatch(
      dataMapperActions.initialise(
        initialTargetFields,
        initialDataFields,
      ),
    );
  }, [dispatch, initialDataFields, initialTargetFields]);

  const saveMappingsHandler = (event, targetField, dataField) => {
    event.preventDefault();
    if (targetField === undefined) {
      return false;
    }

    dispatch(
      dataMapperActions.mapTargetFieldToDataField(
        targetField.value,
        dataField.field,
      ),
    );
    return true;
  };

  const editMappingsHandler = (event, targetField, dataField) => {
    dispatch(
      dataMapperActions.unMapTargetFieldToDataField(
        targetField.value,
        dataField.field,
      ),
    );
    event.preventDefault();
  };

  const getUnmappedFields = () => {
    const { dataFields } = dataMapper;
    return dataFields.filter((field) => !(field.confirmedField));
  };

  const getFieldsFailedValidation = () => {
    const { targetFields, dataFields } = dataMapper;
    return targetFields.filter((field) => {
      if (field.required !== true) {
        return false;
      }

      return dataFields.reduce((current, dataField) => {
        if (!current) {
          return current;
        }

        if (dataField.confirmedField === field.value) {
          return false;
        }

        return current;
      }, true);
    });
  };

  const submitHandler = () => {
    const {
      dataFields,
    } = dataMapper;
    const errorFields = getFieldsFailedValidation;
    const unmappedFields = getUnmappedFields;
    const messages = [];

    if (errorFields.length > 0) {
      messages.push(
        errorFields.reduce(
          (current, field) => `${current + field.label}<br>`,
          'In order to import a file the following fields are required:<br>',
        ),
      );
    }

    if (unmappedFields.length > 0) {
      messages.push('You must allocate every column in your file by choosing the "Skip" or "Save" button.');
    }

    if (messages.length) {
      return true;
    }

    const map = {};

    dataFields.map((field) => {
      if (field.confirmedField) {
        map[field.field] = field.confirmedField;
      }
      return true;
    });

    const dataSourceData = {
      ...dataMapper,
      type: 'File',
      fileData: sampleData,
    };
    dispatch(
      dataSourceActions.save(dataSourceData),
    );
    onClose();
    return true;
  };

  const sampleDataFunc = (field) => {
    const data = sampleData[0].filter((item, index) => {
      const rowSize = sampleDataRowSize !== undefined ? sampleDataRowSize : 5;
      return index < rowSize;
    });

    return data.map((item, index) => {
      const uniqueKey = `${field}-data-row--${index}`;
      const length = 32;
      let string = item[field];
      if (string) {
        if (string.length > length) {
          string = `${item[field].substring(0, length - 3)}...`;
        }
        return <p key={uniqueKey}>{string}</p>;
      }
      return null;
    });
  };

  let dataColumns = 'loading';

  const { targetFields, dataFields } = dataMapper;

  if (targetFields) {
    const updatedTargetFields = [
      ...targetFields,
      { label: 'Skip', value: 'skip' },
    ];

    dataColumns = dataFields.map((dataField, index) => {
      const { field } = dataField;
      const uniqueKey = `${field}-${index}`;
      return (
        <DataFieldMapper
          key={uniqueKey}
          field={field}
          index={index}
          options={updatedTargetFields}
          sampleData={sampleDataFunc(field, index)}
          defaultOption={dataField.currentSelection}
          confirmedField={dataField.confirmedField}
          isDisabled={dataField.isDisabled}
          saveMappingsHandler={saveMappingsHandler}
          editMappingsHandler={editMappingsHandler}
          dispatch={dispatch}
        >
          {field}
        </DataFieldMapper>
      );
    });
  }

  return (
    <section className="spreadsheet-map-section">
      <div className="spreadsheet-columns">
        {dataColumns}
      </div>

      <button
        onClick={submitHandler}
        type="button"
      >
        Import
      </button>
    </section>
  );
};

DataMapper.defaultProps = {
  dataMapper: undefined,
  initialTargetFields: undefined,
};

DataMapper.propTypes = {
  onClose: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  initialTargetFields: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      values: PropTypes.string,
      required: PropTypes.bool,
    }),
  ),
  initialDataFields: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
    }),
  ).isRequired,
  sampleData: PropTypes.arrayOf(Array).isRequired,
  sampleDataRowSize: PropTypes.number.isRequired,
  dataMapper: PropTypes.shape({
    accountEmail: PropTypes.string,
    dataFields: PropTypes.arrayOf(
      PropTypes.shape({
        field: PropTypes.string,
        currentSelection: PropTypes.objectOf,
      }),
    ),
    targetFields: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        values: PropTypes.string,
        required: PropTypes.bool,
      }),
    ),
  }),
};

const mapStateToProps = (state) => ({
  targetFields: state.dataMapper.targetFields,
  dataFields: state.dataMapper.dataFields,
  dataMapper: state.dataMapper,
  dataSource: state.dataSource,
});

export default connect(mapStateToProps)(DataMapper);
