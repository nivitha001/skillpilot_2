import React from 'react';
import { useApp } from '../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentTab, switchRole, currentUser } = useApp();

  return (
    <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.jpg"
            alt="SkillPilot"
            className="w-6 h-6 rounded-md object-contain border border-slate-200 p-0.5 bg-white shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div className="flex items-baseline">
            <span className="font-black text-slate-900 text-sm">Skill</span>
            <span className="font-black text-sky-600 text-sm ml-0.5">Pilot</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Placement Preparation & Learning Analytics</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <button
            onClick={() => setCurrentTab('dsa')}
            className="hover:text-slate-900 transition-colors"
          >
            DSA Sheet
          </button>
          <button
            onClick={() => setCurrentTab('aptitude')}
            className="hover:text-slate-900 transition-colors"
          >
            Aptitude Sheet
          </button>
          <button
            onClick={() => setCurrentTab('mcq')}
            className="hover:text-slate-900 transition-colors"
          >
            MCQ Diagnostic
          </button>
          <button
            onClick={() => setCurrentTab('videos')}
            className="hover:text-slate-900 transition-colors"
          >
            Video Tutorials
          </button>
          <span className="text-slate-300">|</span>
          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => switchRole('student')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Switch to Student View
            </button>
          ) : (
            <button
              onClick={() => switchRole('admin')}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Admin Portal
            </button>
          )}
        </div>

        <p className="text-slate-400">© 2026 SkillPilot. All rights reserved.</p>
      </div>
    </footer>
  );
};
