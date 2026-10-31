import React from 'react';import {createRoot} from 'react-dom/client';import {BrowserRouter} from 'react-router-dom';
import App from './App.jsx';import {ShopProvider} from './shop.jsx';import './styles.css';
createRoot(document.getElementById('root')).render(<BrowserRouter><ShopProvider><App/></ShopProvider></BrowserRouter>);
