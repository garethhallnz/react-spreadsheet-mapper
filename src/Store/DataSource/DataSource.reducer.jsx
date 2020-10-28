import dataSourceConstants from './DataSource.constants';

const initialState = [];

export default function dataSourceReducer(state = initialState, action) {
  if (action.type === dataSourceConstants.SAVE_DATA_SOURCE) {
    const data = action.dataSource;
    return [...state,
      {
        id: data.id,
        createdAt: data.createdAt,
        title: data.title,
        type: data.type,
        accountId: data.accountId,
        dataFields: data.dataFields,
        extra: data.extra,
        model: data.model,
        targetField: data.targetField,
        fileData: data.fileData,
        email: data.email,
        isReportable: false,
      },
    ];
  }

  if (action.type === dataSourceConstants.ERASE_DATA_SOURCE) {
    const oldData = [...state];
    const beErased = action.row;
    const currentData = oldData.filter(
      (item) => item.id !== beErased.id,
    );
    return currentData;
  }

  if (action.type === dataSourceConstants.UPDATE_REPORTABLE) {
    const oldData = [...state];
    const beUpdated = action.row;
    const currentData = oldData.map(
      (item) => ((item.id === beUpdated.id) ? { ...item, isReportable: true } : item),
    );
    return currentData;
  }

  if (action.type === dataSourceConstants.UPDATE_DATA_SOURCE) {
    const oldData = [...state];
    const beUpdated = action.newData;

    const currentData = oldData.map(
      (item) => ((item.id === beUpdated.id) ? { ...beUpdated } : item),
    );
    return currentData;
  }

  return state;
}
