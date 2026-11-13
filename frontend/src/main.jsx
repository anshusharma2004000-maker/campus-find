import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Auth from './pages/Auth';
import ReportForm from './pages/ReportForm';
import Detail from './pages/Detail';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Protected from './routes/Protected';
import './styles.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Auth mode="login" />} />
            <Route path="register" element={<Auth mode="register" />} />
            <Route path="items/:id" element={<Detail />} />
            <Route element={<Protected />}>
              <Route path="report" element={<ReportForm />} />
              <Route path="edit/:id" element={<ReportForm />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route element={<Protected admin />}>
                <Route path="admin" element={<Admin />} />
              </Route>
            </Route>
            <Route path="*" element={<div className="empty-state"><h1>Page not found</h1><a href="/">Return home</a></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
