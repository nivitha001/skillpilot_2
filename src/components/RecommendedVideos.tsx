import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Video,
  PlayCircle,
  Search,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';

export const RecommendedVideos: React.FC = () => {
  const { videos, studentStats, openVideoModal } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const subjects = ['All', 'Weak Topics', 'Java', 'SQL', 'DSA', 'OS', 'Networking', 'Aptitude'];

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const isWeak = studentStats.weak_topics.some(
        (wt) => wt.toLowerCase() === v.topic.toLowerCase() || v.title.toLowerCase().includes(wt.toLowerCase())
      );

      if (selectedSubject === 'Weak Topics' && !isWeak) return false;
      if (selectedSubject !== 'All' && selectedSubject !== 'Weak Topics' && v.subject !== selectedSubject)
        return false;

      const matchesSearch =
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.channel.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [videos, selectedSubject, searchQuery, studentStats.weak_topics]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Video className="w-4 h-4" />
            <span>Curated Video Learning</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Placement Video Masterclasses</h1>
          <p className="text-slate-500 text-sm mt-1">
            Hand-picked YouTube lectures aligned with common placement interview pitfalls and your
            identified weak topics.
          </p>
        </div>

        {/* Weak Topic Count Card */}
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 min-w-[220px]">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Target Weak Areas</span>
          </div>
          <p className="text-xs text-amber-900 font-medium">
            {studentStats.weak_topics.join(', ')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutorials by topic, title, or channel..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400 mr-2 shrink-0">Filter by:</span>
          {subjects.map((subj) => {
            const isSelected = selectedSubject === subj;
            const isSpecialWeak = subj === 'Weak Topics';

            return (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? isSpecialWeak
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'bg-purple-600 text-white font-semibold shadow-xs'
                    : isSpecialWeak
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {isSpecialWeak && <Sparkles className="w-3 h-3" />}
                <span>{subj}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            No video tutorials found matching your search.
          </div>
        ) : (
          filteredVideos.map((video) => {
            const isWeakTopic = studentStats.weak_topics.some(
              (wt) =>
                wt.toLowerCase() === video.topic.toLowerCase() ||
                video.title.toLowerCase().includes(wt.toLowerCase())
            );

            return (
              <div
                key={video.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Video Card Header / Thumbnail Mock */}
                <div
                  onClick={() => openVideoModal(video)}
                  className="relative aspect-video bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 cursor-pointer overflow-hidden flex items-center justify-center p-4 text-center"
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  {/* Play Button Overlay */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all">
                    <PlayCircle className="w-8 h-8 fill-indigo-600 text-white" />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                      {video.subject}
                    </span>
                    {isWeakTopic && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs">
                        Weak Area Match
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 z-10 text-[11px] font-mono text-white bg-black/70 px-2 py-0.5 rounded">
                    {video.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                      <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                        {video.topic}
                      </span>
                      <span>·</span>
                      <span>{video.channel}</span>
                    </div>

                    <h3
                      onClick={() => openVideoModal(video)}
                      className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors cursor-pointer text-sm sm:text-base leading-snug line-clamp-2"
                    >
                      {video.title}
                    </h3>
                  </div>

                  {/* Footer CTAs */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => openVideoModal(video)}
                      className="font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Watch in App</span>
                    </button>

                    <a
                      href={video.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-700 p-1 transition-colors"
                      title="Open on YouTube"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
