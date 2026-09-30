import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ExternalLink, Play, Sparkles } from 'lucide-react';

export const VideoModal: React.FC = () => {
  const { activeVideo, closeVideoModal } = useApp();

  if (!activeVideo) return null;

  // Extract YouTube video ID
  const getEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      let videoId = '';
      if (parsed.hostname.includes('youtube.com')) {
        videoId = parsed.searchParams.get('v') || '';
      } else if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1);
      }
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1` : url;
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(activeVideo.youtube_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              {activeVideo.topic}
            </span>
            <h3 className="text-base font-semibold text-slate-900 truncate max-w-md">
              {activeVideo.title}
            </h3>
          </div>
          <button
            onClick={closeVideoModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-slate-900">
          <iframe
            src={embedUrl}
            title={activeVideo.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Footer Info */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <p className="text-sm font-semibold text-slate-900">{activeVideo.title}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{activeVideo.channel}</span>
              <span aria-hidden="true">·</span>
              <span>{activeVideo.duration}</span>
              <span aria-hidden="true">·</span>
              <span>Curated Placement Resource</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={activeVideo.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <span>Open on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={closeVideoModal}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Done Watching
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
