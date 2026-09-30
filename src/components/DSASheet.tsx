import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  ExternalLink,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  Code2,
  Check,
  Sparkles,
  LayoutGrid,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Building2,
  Flame,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Difficulty, DSAProblem } from '../types';
import { curiousTracks } from '../data/curiousCodingSheetData';
import confetti from 'canvas-confetti';

export const DSASheet: React.FC = () => {
  const { dsaProblems, toggleDSAProblemSolved, currentUser } = useApp();

  const [viewMode, setViewMode] = useState<'roadmap' | 'table'>('roadmap');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const userId = currentUser?.id || 'user-nivitha';

  // Distinct tracks
  const tracksList = useMemo(() => {
    const list = curiousTracks.map((t) => t.name);
    // Include any custom track if present
    dsaProblems.forEach((p) => {
      const tr = p.track || p.topic;
      if (tr && !list.includes(tr)) list.push(tr);
    });
    return ['All', ...list];
  }, [dsaProblems]);

  // Distinct companies
  const companiesList = useMemo(() => {
    const set = new Set<string>();
    dsaProblems.forEach((p) => {
      p.companies?.forEach((c) => set.add(c));
    });
    return ['All', ...Array.from(set).sort()];
  }, [dsaProblems]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return dsaProblems.filter((p) => {
      const pTrack = p.track || p.topic;
      const matchesTrack = selectedTrack === 'All' || pTrack === selectedTrack;
      const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;
      const isSolved = p.solvedByUsers?.includes(userId);
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Solved' && isSolved) ||
        (selectedStatus === 'Unsolved' && !isSolved);
      const matchesCompany =
        selectedCompany === 'All' || p.companies?.includes(selectedCompany);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.problem_name.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        (p.track && p.track.toLowerCase().includes(q)) ||
        (p.pattern && p.pattern.toLowerCase().includes(q)) ||
        (p.companies && p.companies.some((c) => c.toLowerCase().includes(q)));

      return matchesTrack && matchesDiff && matchesStatus && matchesCompany && matchesSearch;
    });
  }, [
    dsaProblems,
    selectedTrack,
    selectedDifficulty,
    selectedStatus,
    selectedCompany,
    searchQuery,
    userId,
  ]);

  // Global sheet stats
  const stats = useMemo(() => {
    const total = dsaProblems.length;
    const solved = dsaProblems.filter((p) => p.solvedByUsers?.includes(userId)).length;
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

    const easyTotal = dsaProblems.filter((p) => p.difficulty === 'Easy').length;
    const easySolved = dsaProblems.filter(
      (p) => p.difficulty === 'Easy' && p.solvedByUsers?.includes(userId)
    ).length;

    const medTotal = dsaProblems.filter((p) => p.difficulty === 'Medium').length;
    const medSolved = dsaProblems.filter(
      (p) => p.difficulty === 'Medium' && p.solvedByUsers?.includes(userId)
    ).length;

    const hardTotal = dsaProblems.filter((p) => p.difficulty === 'Hard').length;
    const hardSolved = dsaProblems.filter(
      (p) => p.difficulty === 'Hard' && p.solvedByUsers?.includes(userId)
    ).length;

    return {
      total,
      solved,
      percentage,
      easyTotal,
      easySolved,
      medTotal,
      medSolved,
      hardTotal,
      hardSolved,
    };
  }, [dsaProblems, userId]);

  const handleToggle = (id: string, currentlySolved: boolean) => {
    toggleDSAProblemSolved(id);
    if (!currentlySolved) {
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.8 },
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setActiveSectionId((prev) => (prev === sectionId ? null : sectionId));
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Hard':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. DSA PRACTICE SHEET HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-indigo-400" />
                Placement DSA Practice Roadmap
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Placement DSA Practice Sheet
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Master algorithmic problem-solving with 12 comprehensive phases covering fundamental
              math, arrays, matrix, strings, binary search, linked lists, stacks, trees, graphs, and
              dynamic programming with company tags and pattern breakdowns.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 min-w-[260px] space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Total Completion</span>
              <span className="text-lg font-bold font-mono text-indigo-400">
                {stats.solved} / {stats.total}
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>

            {/* Breakdown by difficulty */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/60 text-center text-xs">
              <div>
                <span className="text-emerald-400 font-mono font-bold block">
                  {stats.easySolved}/{stats.easyTotal}
                </span>
                <span className="text-[10px] text-slate-400">Easy</span>
              </div>
              <div>
                <span className="text-amber-400 font-mono font-bold block">
                  {stats.medSolved}/{stats.medTotal}
                </span>
                <span className="text-[10px] text-slate-400">Medium</span>
              </div>
              <div>
                <span className="text-rose-400 font-mono font-bold block">
                  {stats.hardSolved}/{stats.hardTotal}
                </span>
                <span className="text-[10px] text-slate-400">Hard</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher and Roadmap Stats */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">View Mode:</span>
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setViewMode('roadmap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                  viewMode === 'roadmap'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Track Roadmap</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>12 Complete Tracks</span>
            <span>·</span>
            <span>430+ Pattern Concepts</span>
            <span>·</span>
            <span>Direct LeetCode Splicing</span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problem, pattern (e.g. Kadane, Two Pointers), or company (e.g. Amazon, Google)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
              {(['All', 'Solved', 'Unsolved'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedStatus === status
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedDifficulty === diff
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Company Filter Dropdown */}
            <div className="flex items-center bg-slate-100 px-2 py-1 rounded-lg text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                {companiesList.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp === 'All' ? 'All Companies' : comp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tracks Horizontal Segment Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400 mr-2 shrink-0">Track Filter:</span>
          {tracksList.map((t) => {
            const trackProblems = dsaProblems.filter((p) => {
              const tr = p.track || p.topic;
              return t === 'All' || tr === t;
            });
            const trackSolved = trackProblems.filter((p) =>
              p.solvedByUsers?.includes(userId)
            ).length;
            const isSelected = selectedTrack === t;

            return (
              <button
                key={t}
                onClick={() => {
                  setSelectedTrack(t);
                  if (t !== 'All') {
                    const matchedTrack = curiousTracks.find((ct) => ct.name === t);
                    setActiveSectionId(matchedTrack ? matchedTrack.id : t);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{t}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {trackSolved}/{trackProblems.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VIEW MODE A: TRACK ROADMAP ACCORDION VIEW */}
      {viewMode === 'roadmap' && (
        <div className="space-y-4">
          {curiousTracks.map((track, trackIdx) => {
            // Find problems in this track
            const trackProblems = filteredProblems.filter(
              (p) => (p.track || p.topic) === track.name
            );
            const allTrackProblems = dsaProblems.filter(
              (p) => (p.track || p.topic) === track.name
            );

            // If user has filtered by another track and this track has 0 matches, skip
            if (selectedTrack !== 'All' && selectedTrack !== track.name) {
              return null;
            }

            // If user searched and this track has no matching problems, hide
            if (searchQuery && trackProblems.length === 0) {
              return null;
            }

            const isExpanded = activeSectionId === track.id || activeSectionId === track.name;
            const solvedInTrack = allTrackProblems.filter((p) =>
              p.solvedByUsers?.includes(userId)
            ).length;
            const trackPct =
              allTrackProblems.length > 0
                ? Math.round((solvedInTrack / allTrackProblems.length) * 100)
                : 0;

            return (
              <div
                key={track.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-400 shadow-md ring-1 ring-indigo-500/10'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Track Card Header */}
                <div
                  onClick={() => toggleSection(track.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSection(track.id);
                    }
                  }}
                  className={`p-5 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none ${
                    isExpanded
                      ? 'bg-indigo-50/50 border-b border-indigo-100'
                      : 'bg-slate-50/70 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* LeetCode Roadmap Arrow Indicator (▶ Collapsed / ▼ Expanded) */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300 shrink-0 ${
                        isExpanded
                          ? 'rotate-90 bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                      }`}
                      title={isExpanded ? 'Collapse Section' : 'Expand Section'}
                    >
                      <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                    </div>

                    <span
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center font-mono shrink-0 transition-colors ${
                        isExpanded ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {trackIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-base font-bold transition-colors ${
                            isExpanded ? 'text-indigo-950' : 'text-slate-900'
                          }`}
                        >
                          {track.name}
                        </h3>
                        <span className="text-xs text-slate-500 font-mono">
                          ({allTrackProblems.length} problems)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{track.description}</p>
                    </div>
                  </div>

                  {/* Track Progress and Collapse Trigger */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="min-w-[140px] text-right">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-400">Track Progress</span>
                        <span className="font-mono font-bold text-slate-800">
                          {solvedInTrack}/{allTrackProblems.length} ({trackPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${trackPct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`p-1.5 rounded-lg transition-colors ${
                        isExpanded
                          ? 'text-indigo-600 bg-indigo-100/70'
                          : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                      }`}
                      title={isExpanded ? 'Collapse Section' : 'Expand Section'}
                      aria-expanded={isExpanded}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Smooth Animated Accordion Problems Content */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="divide-y divide-slate-100">
                    {trackProblems.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No problems in this track match your active filters.
                      </div>
                    ) : (
                      trackProblems.map((prob) => {
                        const isSolved = prob.solvedByUsers?.includes(userId) || false;

                        return (
                          <div
                            key={prob.id}
                            className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors ${
                              isSolved ? 'bg-indigo-50/20' : ''
                            }`}
                          >
                            <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                              {/* Checkbox */}
                              <button
                                onClick={() => handleToggle(prob.id, isSolved)}
                                className={`w-6 h-6 mt-0.5 md:mt-0 rounded-md flex items-center justify-center transition-all shrink-0 ${
                                  isSolved
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'border border-slate-300 hover:border-indigo-500 text-transparent hover:text-slate-300'
                                }`}
                                title={isSolved ? 'Mark as Not Solved' : 'Mark as Solved'}
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`text-sm font-semibold truncate ${
                                      isSolved
                                        ? 'line-through text-slate-400 font-normal'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {prob.problem_name}
                                  </span>

                                  {/* Difficulty */}
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.2 rounded border ${getDifficultyColor(
                                      prob.difficulty
                                    )}`}
                                  >
                                    {prob.difficulty}
                                  </span>

                                  {/* Pattern Tag */}
                                  {prob.pattern && (
                                    <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded">
                                      {prob.pattern}
                                    </span>
                                  )}
                                </div>

                                {/* Company Tags */}
                                {prob.companies && prob.companies.length > 0 && (
                                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-500">
                                    <span className="text-slate-400 font-medium">Asked in:</span>
                                    {prob.companies.map((c) => (
                                      <span
                                        key={c}
                                        className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200"
                                      >
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                              <a
                                href={prob.leetcode_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                              >
                                <span>LeetCode</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>

                              <button
                                onClick={() => handleToggle(prob.id, isSolved)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                                  isSolved
                                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                    : 'text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                              >
                                {isSolved ? 'Solved ✓' : 'Mark Solved'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* 3. VIEW MODE B: COMPREHENSIVE TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Status</th>
                  <th className="py-3.5 px-4">Problem Name</th>
                  <th className="py-3.5 px-4 w-36">Track</th>
                  <th className="py-3.5 px-4 w-44">Pattern</th>
                  <th className="py-3.5 px-4 w-28 text-center">Difficulty</th>
                  <th className="py-3.5 px-4">Companies</th>
                  <th className="py-3.5 px-4 w-32 text-center">Practice</th>
                  <th className="py-3.5 px-4 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No problems match your selected filters or search query.
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((prob) => {
                    const isSolved = prob.solvedByUsers?.includes(userId) || false;
                    return (
                      <tr
                        key={prob.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSolved ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggle(prob.id, isSolved)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                              isSolved
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'border border-slate-300 hover:border-indigo-500 text-transparent hover:text-slate-300'
                            }`}
                            title={isSolved ? 'Mark as Not Solved' : 'Mark as Solved'}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </td>

                        {/* Problem Name */}
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <span
                            className={
                              isSolved ? 'line-through text-slate-400 font-normal' : 'text-slate-900'
                            }
                          >
                            {prob.problem_name}
                          </span>
                        </td>

                        {/* Track */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                          {prob.track || prob.topic}
                        </td>

                        {/* Pattern */}
                        <td className="py-3.5 px-4 text-xs">
                          {prob.pattern ? (
                            <span className="font-medium text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded">
                              {prob.pattern}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* Difficulty */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded border ${getDifficultyColor(
                              prob.difficulty
                            )}`}
                          >
                            {prob.difficulty}
                          </span>
                        </td>

                        {/* Companies */}
                        <td className="py-3.5 px-4 text-xs">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {prob.companies && prob.companies.length > 0 ? (
                              prob.companies.map((c) => (
                                <span
                                  key={c}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[10px]"
                                >
                                  {c}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>

                        {/* LeetCode link */}
                        <td className="py-3.5 px-4 text-center">
                          <a
                            href={prob.leetcode_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                          >
                            <span>LeetCode</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>

                        {/* Mark Solved Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggle(prob.id, isSolved)}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                              isSolved
                                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                : 'text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                          >
                            {isSolved ? 'Solved ✓' : 'Mark Solved'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
