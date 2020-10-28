import dataMapperConstants from './DataMapper.constants';

function resetImporter() {
  return { type: dataMapperConstants.RESET_IMPORTER };
}

function initFields(targetFields, dataFields) {
  return {
    type: dataMapperConstants.INIT_DATA_MAPPER_FIELDS,
    targetFields,
    dataFields,
  };
}

function autoSelectFields(targetFields, dataFields) {
  return {
    type: dataMapperConstants.AUTO_SELECT_DATA_MAPPER_FIELDS,
    targetFields,
    dataFields,
  };
}

function initialise(targetFields, dataFields) {
  return (dispatch) => {
    dispatch(resetImporter());
    dispatch(initFields(targetFields, dataFields));
    dispatch(autoSelectFields(targetFields, dataFields));
  };
}

function mapTargetFieldToDataField(targetFieldValue, dataFieldField) {
  return {
    type: dataMapperConstants.MAP_TARGET_FIELD_TO_DATA_FIELD,
    targetFieldValue,
    dataFieldField,
  };
}

function unMapTargetFieldToDataField(targetFieldValue, dataFieldField) {
  return {
    type: dataMapperConstants.UN_MAP_TARGET_FIELD_TO_DATA_FIELD,
    targetFieldValue,
    dataFieldField,
  };
}

function setFile(file) {
  return { type: dataMapperConstants.SET_FILE, file };
}

function setModel(model) {
  return { type: dataMapperConstants.SET_MODEL, model };
}

function setImportAccount(id) {
  return { type: dataMapperConstants.IMPORT_TO_ACCOUNT, accountId: id };
}

function setExtraField(key, value) {
  return { type: dataMapperConstants.SET_EXTRA_FIELD, key, value };
}

const dataMapperActions = {
  initialise,
  initFields,
  autoSelectFields,
  mapTargetFieldToDataField,
  unMapTargetFieldToDataField,
  setFile,
  setModel,
  setImportAccount,
  setExtraField,
};

export default dataMapperActions;
