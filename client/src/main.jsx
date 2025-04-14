import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AlertProvider } from './context/AlertContext.jsx'
import setupAxios from './utils/axiosConfig.js'
import './index.css'

// Setup axios with default configuration
setupAxios();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/task_management_system">
      <AlertProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AlertProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
