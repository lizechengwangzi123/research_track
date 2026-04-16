import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';

export default function Statistics() {
  const [papers, setPapers] = useState<any[]>([]);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const { data } = await api.get('/papers');
        setPapers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPapers();
  }, []);

  const stats = useMemo(() => {
    const total = papers.length;
    const byStatus = papers.reduce((acc: any, paper: any) => {
      acc[paper.status] = (acc[paper.status] || 0) + 1;
      return acc;
    }, {});
    
    const statusOrder = ['Ideation', 'Drafting', 'Submitted', 'Under Review', 'Published'];
    const timelineData = statusOrder.map(status => ({
      name: status,
      count: byStatus[status] || 0
    }));

    return {
      total,
      byStatus,
      timelineData,
      published: byStatus['Published'] || 0,
      underReview: byStatus['Under Review'] || 0,
      completionRate: total ? Math.round(((byStatus['Published'] || 0) / total) * 100) : 0
    };
  }, [papers]);

  const statusColors: any = {
    'Ideation': '#64748b',
    'Drafting': '#3b82f6',
    'Submitted': '#2563eb',
    'Under Review': '#d97706',
    'Published': '#059669'
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <section className="relative overflow-hidden bg-primary p-12 rounded-[3rem] shadow-2xl text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <span className="font-label text-[10px] uppercase tracking-[0.4em] text-white/60 font-black mb-3 block">Laboratory Analytics</span>
          <h1 className="font-headline text-5xl font-black tracking-tighter mb-4">Pipeline Intelligence</h1>
          <p className="text-white/80 max-w-xl font-medium leading-relaxed">
            Visualizing the transition of your intellectual property from initial ideation through the rigorous editorial review phases.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard label="Total Portfolio" value={stats.total} unit="Papers" color="bg-blue-600" icon="database" />
        <MetricCard label="Success Rate" value={stats.completionRate} unit="%" color="bg-green-600" icon="verified" />
        <MetricCard label="Active Review" value={stats.underReview} unit="Ongoing" color="bg-amber-600" icon="visibility" />
        <MetricCard label="Archive Size" value={stats.published} unit="Items" color="bg-indigo-600" icon="inventory" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Scientific Funnel Chart */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-outline-variant/5">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-headline font-black text-2xl text-on-surface">Submission Funnel</h3>
            <span className="material-symbols-outlined text-outline">filter_list</span>
          </div>
          
          <div className="space-y-4">
            {stats.timelineData.map((data, idx) => {
              const maxWidth = 100 - (idx * 15);
              const countWidth = stats.total ? (data.count / stats.total) * maxWidth : 0;
              return (
                <div key={data.name} className="relative h-14 group">
                  {/* Background Funnel Shape */}
                  <div 
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-surface-container-low/40 rounded-xl transition-all group-hover:bg-surface-container-low/60"
                    style={{ width: `${maxWidth}%` }}
                  ></div>
                  {/* Active Value Shape */}
                  <div 
                    className="absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-xl transition-all duration-1000 shadow-sm flex items-center justify-center overflow-hidden"
                    style={{ 
                      width: data.count > 0 ? `${Math.max(countWidth, 10)}%` : '0%', 
                      backgroundColor: statusColors[data.name],
                      opacity: 0.8 + (idx * 0.05)
                    }}
                  >
                    {data.count > 0 && (
                      <span className="text-white font-black text-xs">{data.count}</span>
                    )}
                  </div>
                  {/* Label */}
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">{data.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-[10px] text-outline text-center uppercase tracking-widest font-bold">Standard Editorial Progression Model</p>
        </div>

        {/* Status Distribution Pie-ish Chart */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-outline-variant/5 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-headline font-black text-2xl text-on-surface">Allocation Heatmap</h3>
            <span className="material-symbols-outlined text-outline">donut_large</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
             <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {stats.timelineData.map((data, idx) => {
                    const prevCounts = stats.timelineData.slice(0, idx).reduce((sum, d) => sum + d.count, 0);
                    const strokeDasharray = `${(data.count / stats.total) * 283} 283`;
                    const strokeDashoffset = `-${(prevCounts / stats.total) * 283}`;
                    
                    return stats.total > 0 && data.count > 0 ? (
                      <circle
                        key={data.name}
                        cx="50"
                        cy="50"
                        r="45"
                        fill="transparent"
                        stroke={statusColors[data.name]}
                        strokeWidth="10"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 hover:stroke-width-[12px] cursor-help"
                        style={{ strokeLinecap: 'round' }}
                      />
                    ) : null;
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black text-on-surface">{stats.total}</span>
                  <span className="text-[10px] font-black text-outline uppercase tracking-widest">Global Ops</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-10">
            {stats.timelineData.map(data => (
              <div key={data.name} className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[data.name] }}></div>
                <span className="text-[9px] font-bold text-on-surface-variant truncate uppercase tracking-tighter">{data.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-low/40 p-12 rounded-[3.5rem] border border-outline-variant/10 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
             <span className="material-symbols-outlined text-3xl">insights</span>
          </div>
          <h3 className="font-headline text-3xl font-black text-on-surface tracking-tighter">Strategic Optimization</h3>
          <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
            Your current research output shows a <span className="text-primary font-black">{stats.completionRate}% completion rate</span>. 
            To optimize your laboratory's impact, focus on transitioning the <span className="text-amber-600 font-black">{stats.underReview} manuscripts</span> currently under review.
          </p>
          <div className="pt-6 flex justify-center gap-4">
             <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-outline-variant/10">
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Inertia</p>
                <p className="text-xl font-black text-on-surface">{stats.byStatus['Ideation'] || 0}</p>
             </div>
             <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-outline-variant/10">
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Momentum</p>
                <p className="text-xl font-black text-primary">{stats.byStatus['Drafting'] || 0}</p>
             </div>
             <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-outline-variant/10">
                <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Terminal</p>
                <p className="text-xl font-black text-green-600">{stats.published}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, color, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-outline-variant/5 group hover:scale-[1.02] transition-all">
      <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-black/5`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <p className="text-[11px] font-black text-outline uppercase tracking-[0.2em] mb-2">{label}</p>
      <div className="flex items-baseline space-x-2">
        <span className="text-4xl font-black text-on-surface tracking-tighter">{value}</span>
        <span className="text-xs font-bold text-outline uppercase tracking-widest">{unit}</span>
      </div>
    </div>
  );
}
