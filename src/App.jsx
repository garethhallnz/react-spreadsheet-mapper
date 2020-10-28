import React from 'react';
import { Provider } from 'react-redux';
import SpreadsheetMapper from './Components/SpreadsheetMapper';
import store from './Store/Store';

const App = () => {
  const fields = [
    { label: 'ID', value: 'id', required: true },
    { label: 'Name', value: 'name', required: true },
    { label: 'Description', value: 'description', required: true },
  ];

  return (
    <Provider store={store}>
      <SpreadsheetMapper fields={fields} />
    </Provider>
  );
};

export default App;
