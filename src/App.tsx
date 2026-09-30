import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { DSASheet } from './components/DSASheet';
import { AptitudeSheet } from './components/AptitudeSheet';
import { MCQTestModule } from './components/MCQTestModule';
import { RecommendedVideos } from './components/RecommendedVideos';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { MockInterviewModule } from './components/MockInterviewModule';
import { AuthModal } from './components/AuthModal';
import { VideoModal } from './components/VideoModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';

const MainContent: React.FC = () => {
  const { currentTab, currentUser, setCurrentTab } = useApp();

  if (!currentUser || currentTab === 'login') {
    return <AuthModal />;
  }

  const isAdmin = String(currentUser?.role || '').toLowerCase() === 'admin';

  return (
    <main className="flex-1">
      {currentTab === 'dashboard' && <StudentDashboard />}
      {currentTab === 'dsa' && <DSASheet />}
      {currentTab === 'aptitude' && <AptitudeSheet />}
      {currentTab === 'mcq' && <MCQTestModule />}
      {currentTab === 'interview' && <MockInterviewModule />}
      {currentTab === 'videos' && <RecommendedVideos />}
      {currentTab === 'progress' && <ProgressDashboard />}
      {currentTab === 'admin' && (
        isAdmin ? (
          <AdminDashboard />
        ) : (
          <div className="max-w-md mx-auto my-20 p-8 bg-white border border-red-200 rounded-2xl text-center shadow-lg">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
              🛡️
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Admin Access Required</h2>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Students cannot access admin pages. Please sign in as an Administrator in the database.
            </p>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Return to Student Dashboard
            </button>
          </div>
        )
      )}
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <MainContent />
        <Footer />
        <VideoModal />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
