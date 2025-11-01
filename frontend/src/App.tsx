import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import GeneratePage from './pages/GeneratePage';
import FhirExplorerPage from './pages/FhirExplorerPage';
import TestResultsPage from './pages/TestResultsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/explorer" element={<FhirExplorerPage />} />
          <Route path="/results" element={<TestResultsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}
