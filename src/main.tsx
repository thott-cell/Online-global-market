import React from 'react';
import {createRoot}from 'react-dom/client';
import App from './App';
import './index.css';
import {SearchProvider} from "./context/SearchContext";
import {BrowserRouter} from "react-router-dom";

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SearchProvider>
        <App />
      </SearchProvider>
    </BrowserRouter>
  </React.StrictMode>
);