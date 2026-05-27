import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DataProvider } from "./contexts/DataContext";
import { BudgetsProvider } from "./contexts/BudgetsContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DataProvider>
      <BudgetsProvider>
        <App />
      </BudgetsProvider>
    </DataProvider>
  </React.StrictMode>
);


reportWebVitals();
