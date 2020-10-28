import dataMapperConstants from './DataMapper.constants';

const initialState = {
  targetFields: null,
  dataFields: null,
  file: null,
  model: null,
  accountId: null,
  extra: [],
};

export default function dataMapperReducer(state = initialState, action) {
  if (action.type === dataMapperConstants.INIT_DATA_MAPPER_FIELDS) {
    return {
      ...state,
      targetFields: action.targetFields,
      dataFields: action.dataFields,
    };
  }
  if (action.type === dataMapperConstants.AUTO_SELECT_DATA_MAPPER_FIELDS) {
    const updatedAutoSelectDataFields = action.dataFields.map((field) => {
      const theField = { ...field };

      const currentSelection = action.targetFields.find((target) => {
        if (theField.currentSelection === undefined) {
          theField.currentSelection = null;
        }

        return theField.field === target.value && !theField.currentSelection;
      });

      return {
        ...field,
        currentSelection,
      };
    });

    return {
      ...state,
      dataFields: updatedAutoSelectDataFields,
    };
  }
  if (action.type === dataMapperConstants.CHANGE_DATA_FIELD_MAPPER) {
    const updatedDataFields = state.dataFields.map((field) => {
      if (field.field === action.field) {
        return {
          ...field,
          currentSelection: action.selectedOption,
        };
      }

      if (field.currentSelection === action.selectedOption) {
        return {
          ...field,
          currentSelection: null,
        };
      }

      return field;
    });

    return {
      ...state,
      dataFields: updatedDataFields,
    };
  }
  if (action.type === dataMapperConstants.MAP_TARGET_FIELD_TO_DATA_FIELD) {
    const updatedTargetFieldList = state.targetFields.map((targetField) => {
      if (targetField.value === action.targetFieldValue) {
        return {
          ...targetField,
          dataFieldField: action.dataFieldField,
          isDisabled: true,
        };
      }

      return targetField;
    });

    const updatedMappedDataFields = state.dataFields.map((dataField) => {
      if (dataField.field === action.dataFieldField) {
        return {
          ...dataField,
          confirmedField: action.targetFieldValue,
          isDisabled: true,
        };
      }

      if (dataField.isDisabled !== undefined && dataField.isDisabled) {
        return {
          ...dataField,
          isDisabled: true,
        };
      }

      return {
        ...dataField,
        isDisabled: false,
      };
    });

    return {
      ...state,
      targetFields: updatedTargetFieldList,
      dataFields: updatedMappedDataFields,
    };
  }
  if (action.type === dataMapperConstants.UN_MAP_TARGET_FIELD_TO_DATA_FIELD) {
    const releaseTargetList = state.targetFields.map((targetField) => {
      if (targetField.value === action.targetFieldValue) {
        return {
          ...targetField,
          isDisabled: false,
        };
      }

      return targetField;
    });

    const updatedUnMappedDataFields = state.dataFields.map((dataField) => {
      if (dataField.field === action.dataFieldField) {
        return {
          ...dataField,
          confirmedField: null,
          isDisabled: false,
        };
      }

      if (dataField.isDisabled) {
        return {
          ...dataField,
        };
      }

      return {
        ...dataField,
        isDisabled: false,
      };
    });

    return {
      ...state,
      targetFields: releaseTargetList,
      dataFields: updatedUnMappedDataFields,
    };
  }

  if (action.type === dataMapperConstants.SET_FILE) {
    return {
      ...state,
      file: action.file,
    };
  }

  if (action.type === dataMapperConstants.SET_MODEL) {
    return {
      ...state,
      model: action.model,
    };
  }

  if (action.type === dataMapperConstants.IMPORT_TO_ACCOUNT) {
    return {
      ...state,
      accountId: action.accountId,
    };
  }
  if (action.type === dataMapperConstants.SET_EXTRA_FIELD) {
    const newState = state;
    newState.extra[action.key] = action.value;
    return newState;
  }
  if (action.type === dataMapperConstants.RESET_IMPORTER) {
    return initialState;
  }

  return state;
}
