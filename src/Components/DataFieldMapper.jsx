import React from 'react';
import PropTypes from 'prop-types';
import Select from './Select';
import dataMapperConstants from '../Store/DataMapper/DataMapper.constants';

const DataFieldMapper = (props) => {
  const {
    defaultOption, isDisabled, confirmedField, children, options, sampleData, dispatch, field,
  } = props;

  let selectedOption = defaultOption;
  const onChangeHandler = (value) => {
    selectedOption = value;
    dispatch({ type: dataMapperConstants.CHANGE_DATA_FIELD_MAPPER, field, selectedOption: value });
  };

  const wrapperClasses = ['spreadsheet-map-wrapper'];

  if (isDisabled) {
    wrapperClasses.push('disabled');
  }

  if (confirmedField !== null) {
    wrapperClasses.push(confirmedField);
  }

  const actionButtons = () => {
    let btnText = 'Save';
    let callback = (event) => props.saveMappingsHandler(event, selectedOption, props);

    if (isDisabled) {
      btnText = 'Edit';
      callback = (event) => props.editMappingsHandler(event, selectedOption, props);
    }
    return (
      <button
        className="btn btn-primary"
        onClick={callback}
        type="button"
      >
        {btnText}
      </button>
    );
  };

  const columnName = children || 'Unnamed column';

  return (
    <div className={wrapperClasses.join(' ')}>
      <div className="spreadsheet-map-header">
        <h4 className="spreadsheet-map-title">{columnName}</h4>
        <Select
          className="form-control"
          options={options}
          defaultValue={defaultOption}
          value={defaultOption}
          onChange={onChangeHandler}
          isDisabled={isDisabled}
        />
        {actionButtons()}
      </div>
      <div className="spreadsheet-map-data">
        {sampleData}
      </div>
    </div>
  );
};

DataFieldMapper.defaultProps = {
  isDisabled: false,
  defaultOption: {
    label: undefined,
    required: false,
    value: undefined,
  },
  confirmedField: undefined,
};

DataFieldMapper.propTypes = {
  defaultOption: PropTypes.shape({
    label: PropTypes.string,
    required: PropTypes.bool,
    value: PropTypes.string,
  }),
  isDisabled: PropTypes.bool,
  confirmedField: PropTypes.string,
  children: PropTypes.node.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      values: PropTypes.string,
      required: PropTypes.bool,
    }),
  ).isRequired,
  dispatch: PropTypes.func.isRequired,
  field: PropTypes.string.isRequired,
  saveMappingsHandler: PropTypes.func.isRequired,
  editMappingsHandler: PropTypes.func.isRequired,
  sampleData: PropTypes.arrayOf(
    PropTypes.shape({
      $$typeof: PropTypes.symbol,
      key: PropTypes.string,
      ref: PropTypes.string,
      type: PropTypes.string,
      _store: PropTypes.shape({
        validated: PropTypes.bool,
      }),
      props: PropTypes.shape({
        children: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
      }),
    }),
  ).isRequired,
};

export default DataFieldMapper;
