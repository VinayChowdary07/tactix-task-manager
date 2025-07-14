
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth';

import Auth from './pages/Auth';
import Index from './pages/Index';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import Calendar from './pages/Calendar';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';
import WeeklyReview from './pages/WeeklyReview';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="projects" element={<Projects />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="goals" element={<Goals />} />
                <Route path="weekly-review" element={<WeeklyReview />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
