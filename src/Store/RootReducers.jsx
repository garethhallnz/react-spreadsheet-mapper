import { combineReducers } from 'redux';
import dataMapperReducer from './DataMapper/DataMapper.reducer';
import dataSourceReducer from './DataSource/DataSource.reducer';

const rootReducer = combineReducers({
  dataMapper: dataMapperReducer,
  dataSource: dataSourceReducer,
});

export default rootReducer;
