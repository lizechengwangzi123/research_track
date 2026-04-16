import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function NatureFeed() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNature = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/nature/latest');
      setArticles(data);
    } catch (err) {
      console.error('Failed to fetch nature articles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNature();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black mb-1">Global Research Intelligence</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface flex items-center">
            Nature Journal
            <span className="ml-4 px-2 py-0.5 bg-error text-white text-[10px] rounded-md font-black uppercase tracking-widest">Live Feed</span>
          </h1>
        </div>
        <button 
          onClick={fetchNature}
          disabled={loading}
          className="bg-surface-container-low text-primary px-6 py-2.5 rounded-full font-headline font-bold text-sm hover:bg-primary-container hover:text-white transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
          <span>{loading ? 'Fetching...' : 'Refresh Feed'}</span>
        </button>
      </section>

      {loading && articles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-outline-variant/5 animate-pulse h-80"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article, index) => (
            <div key={index} className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-outline-variant/5 hover:border-primary/30 transition-all group flex flex-col hover:shadow-2xl hover:-translate-y-1 duration-300">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-4 py-1.5 rounded-full">
                  {article.category}
                </span>
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{article.date}</span>
              </div>
              <h3 className="font-headline font-bold text-2xl text-on-surface mb-4 group-hover:text-primary transition-colors leading-tight">
                {article.title}
              </h3>
              <p className="text-[11px] font-black text-on-surface-variant/60 uppercase tracking-widest mb-6 italic">
                By {article.authors}
              </p>
              <p className="text-on-surface-variant/80 mb-10 flex-1 leading-relaxed font-medium line-clamp-4">
                {article.description}
              </p>
              <a 
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-surface-container-low rounded-[1.5rem] group-hover:bg-primary transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-white">Access Full Publication</span>
                <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">arrow_outward</span>
              </a>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-surface-container-low/40 p-16 rounded-[4rem] text-center space-y-6 border border-outline-variant/5 shadow-inner">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">rss_feed</span>
        </div>
        <h3 className="font-headline text-3xl font-black text-on-surface tracking-tighter">Live Intelligence Engine</h3>
        <p className="max-w-xl mx-auto text-on-surface-variant/70 font-medium leading-relaxed">
          Our system is now connected to the official Nature RSS feed, providing you with real-time updates directly from the source.
        </p>
      </div>
    </div>
  );
}
