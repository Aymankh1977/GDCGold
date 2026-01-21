import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import Dashboard from '@/pages/Dashboard';
import Documents from '@/pages/Documents';
import Analysis from '@/pages/Analysis';
import Questionnaire from '@/pages/Questionnaire';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
  );
}

export default App;