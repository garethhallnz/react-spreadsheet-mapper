import dataSourceConstants from './DataSource.constants';

function save(dataSource) {
  return {
    type: dataSourceConstants.SAVE_DATA_SOURCE,
    dataSource,
  };
}

function erase(row) {
  return {
    type: dataSourceConstants.ERASE_DATA_SOURCE,
    row,
  };
}

function update(newData) {
  return {
    type: dataSourceConstants.UPDATE_DATA_SOURCE,
    newData,
  };
}

function updateReportable(row) {
  return {
    type: dataSourceConstants.UPDATE_REPORTABLE,
    row,
  };
}

const dataSourceActions = {
  erase,
  save,
  update,
  updateReportable,
};

export default dataSourceActions;
