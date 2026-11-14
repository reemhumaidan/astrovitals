import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './Portal.jsx';
import './styles.css';
import './portal.css';
import './space-apps-brand.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);