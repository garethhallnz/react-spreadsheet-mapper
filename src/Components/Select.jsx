import React from 'react';
import PropTypes from 'prop-types';
import Select2 from 'react-select';

const Select = (props) => {
  const { className } = props;

  const classes = `${className} form-control m-input m-input--solid m-select`;

  const theProps = {
    ...props,
    className: classes,
  };

  const {
    defaultValue, isDisabled, onChange, options, value,
  } = theProps;
  return (
    <Select2
      classNamePrefix="m-select"
      className={classes}
      defaultValue={defaultValue}
      isDisabled={isDisabled}
      onChange={onChange}
      options={options}
      value={value}
    />
  );
};

Select.propTypes = {
  className: PropTypes.string.isRequired,
};

export default Select;
