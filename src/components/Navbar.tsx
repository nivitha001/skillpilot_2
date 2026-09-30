import React from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Calculator,
  HelpCircle,
  BarChart3,
  Video,
  Shield,
  LogOut,
  UserCheck,
  CheckCircle2,
  Flame,
  Sparkles,
} from 'lucide-react';
import appLogo from '../assets/images/skillpilot_app_logo_1790488682563.jpg';

export const Navbar: React.FC = () => {
  const { currentUser, currentTab, setCurrentTab, logout, userStreak } = useApp();

  const isStudent = String(currentUser?.role || '').toLowerCase() === 'student';
  const isAdmin = String(currentUser?.role || '').toLowerCase() === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: SkillPilot Brand Logo Mark & Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab(isAdmin ? 'admin' : 'dashboard')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <img
                src={appLogo}
                alt="SkillPilot Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-contain shadow-xs border border-slate-200/90 group-hover:scale-105 group-hover:border-sky-400 group-hover:shadow-md transition-all bg-white p-0.5"
                referrerPolicy="no-referrer"
              />
              <div className="flex items-baseline">
                <span className="text-xl font-black tracking-tight text-[#0A1931]">
                  Skill
                </span>
                <span className="text-xl font-black tracking-tight text-[#0084FF] ml-0.5">
                  Pilot
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {isStudent && (
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'dashboard'
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentTab('dsa')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'dsa'
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>DSA Sheet</span>
                </button>
                <button
                  onClick={() => setCurrentTab('aptitude')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'aptitude'
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span>Aptitude Sheet</span>
                </button>
                <button
                  onClick={() => setCurrentTab('mcq')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'mcq'
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>MCQ Tests</span>
                </button>
                <button
                  onClick={() => setCurrentTab('interview')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'interview'
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Mock Interview</span>
                </button>
                <button
                  onClick={() => setCurrentTab('progress')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'progress'
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>My Progress</span>
                </button>
                <button
                  onClick={() => setCurrentTab('videos')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'videos'
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Recommended Videos</span>
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    currentTab === 'admin'
                      ? 'text-indigo-600 bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Control Center</span>
                </button>
                <button
                  onClick={() => setCurrentTab('dsa')}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg whitespace-nowrap"
                >
                  DSA Preview
                </button>
                <button
                  onClick={() => setCurrentTab('aptitude')}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg whitespace-nowrap"
                >
                  Aptitude Preview
                </button>
                <button
                  onClick={() => setCurrentTab('mcq')}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg whitespace-nowrap"
                >
                  MCQ Preview
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Top-right actions (Daily Streak Counter, User Profile, Logout) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Daily Streak Counter - ONLY in top navigation bar */}
            {currentUser && (
              <div
                className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300 text-amber-900 text-xs font-semibold select-none cursor-default shadow-2xs hover:bg-orange-50 transition-colors"
                title="Visit SkillPilot every day to maintain your streak."
                role="status"
                aria-label={`Daily Streak: Day ${userStreak?.currentStreak ?? 1}`}
              >
                <span className="text-sm leading-none select-none" role="img" aria-label="flame">
                  🔥
                </span>
                <span className="font-bold text-amber-950 tracking-tight whitespace-nowrap">
                  Day {userStreak?.currentStreak ?? 1}
                </span>

                {/* Sleek Tooltip on hover */}
                <div className="absolute right-0 top-full mt-2 hidden group-hover:flex flex-col items-end z-50 pointer-events-none drop-shadow-md">
                  <div className="bg-slate-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap border border-slate-700 shadow-xl">
                    Visit SkillPilot every day to maintain your streak.
                  </div>
                </div>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs border border-slate-300">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-semibold text-slate-800 leading-tight truncate max-w-[110px]">
                    {currentUser.name}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded leading-none ${
                      isAdmin ? 'text-purple-700 bg-purple-100' : 'text-emerald-700 bg-emerald-100'
                    }`}
                  >
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center justify-between gap-1 overflow-x-auto text-xs bg-slate-50">
        {isStudent ? (
          <>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-2 py-1 font-medium whitespace-nowrap ${
                currentTab === 'dashboard' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('dsa')}
              className={`px-2 py-1 font-medium whitespace-nowrap ${
                currentTab === 'dsa' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              DSA
            </button>
            <button
              onClick={() => setCurrentTab('aptitude')}
              className={`px-2 py-1 font-medium whitespace-nowrap ${
                currentTab === 'aptitude' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              Aptitude
            </button>
            <button
              onClick={() => setCurrentTab('mcq')}
              className={`px-2 py-1 font-medium whitespace-nowrap ${
                currentTab === 'mcq' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              MCQ Tests
            </button>
            <button
              onClick={() => setCurrentTab('progress')}
              className={`px-2 py-1 font-medium whitespace-nowrap ${
                currentTab === 'progress' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              Progress
            </button>
            <button
              onClick={() => setCurrentTab('videos')}
              className={`px-2 py-1 font-medium whitespace-nowrap ${
                currentTab === 'videos' ? 'text-indigo-600 font-semibold' : 'text-slate-600'
              }`}
            >
              Videos
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentTab('admin')}
              className="px-2 py-1 font-medium text-indigo-600 whitespace-nowrap font-semibold"
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('dsa')}
              className="px-2 py-1 font-medium text-slate-600 whitespace-nowrap"
            >
              DSA Preview
            </button>
            <button
              onClick={() => setCurrentTab('aptitude')}
              className="px-2 py-1 font-medium text-slate-600 whitespace-nowrap"
            >
              Aptitude Preview
            </button>
          </>
        )}
      </div>
    </header>
  );
};
