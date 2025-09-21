import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import GeneratePage from './pages/GeneratePage';
import FhirExplorer from './pages/FhirExplorer';
import TestResultsPage from './pages/TestResultsPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

export default function App() {
  // Set dark mode as the default theme
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/explorer" element={<FhirExplorer />} />
        <Route path="/results" element={<TestResultsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}
