import { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';

export default function Dashboard() {
  const [papers, setPapers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPaper, setNewPaper] = useState({ 
    title: '', 
    abstract: '', 
    status: 'Ideation',
    journalName: '',
    link: '',
    authors: '',
    submittedAt: ''
  });
  const [editingPaper, setEditingPaper] = useState<any>(null);

  const fetchPapers = async () => {
    try {
      const { data } = await api.get('/papers');
      setPapers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleAddPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/papers', { ...newPaper, order: papers.length });
      setShowAddModal(false);
      setNewPaper({ title: '', abstract: '', status: 'Ideation', journalName: '', link: '', authors: '', submittedAt: '' });
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/papers/${editingPaper.id}`, editingPaper);
      setShowEditModal(false);
      setEditingPaper(null);
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePaper = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/papers/${id}`);
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const movePaper = async (index: number, direction: 'up' | 'down') => {
    const newPapers = [...papers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= papers.length) return;

    [newPapers[index], newPapers[targetIndex]] = [newPapers[targetIndex], newPapers[index]];
    
    // Update local state for immediate feedback
    setPapers(newPapers);

    // Save to server
    try {
      const orders = newPapers.map((p, i) => ({ id: p.id, order: i }));
      await api.post('/papers/reorder', { orders });
    } catch (err) {
      console.error(err);
      fetchPapers(); // Revert on error
    }
  };

  const calculatePassedTime = (date: string) => {
    if (!date) return null;
    const submitted = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - submitted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} months`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} years`;
  };

  const filteredPapers = useMemo(() => {
    return papers.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.abstract && p.abstract.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.journalName && p.journalName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.authors && p.authors.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [papers, searchQuery]);

  const statusColors: any = {
    'Ideation': 'bg-surface-container-high text-on-surface-variant',
    'Drafting': 'bg-primary-fixed text-on-primary-fixed-variant',
    'Submitted': 'bg-secondary-container text-on-secondary-container',
    'Under Review': 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    'Published': 'bg-[#d1fadf] text-[#027a48]'
  };

  const statusIcons: any = {
    'Ideation': 'lightbulb',
    'Drafting': 'edit_note',
    'Submitted': 'send',
    'Under Review': 'visibility',
    'Published': 'verified'
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-black mb-1">Active Pipeline</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Manuscript Progress</h1>
        </div>
        <div className="flex space-x-3">
          <div className="px-4 py-2 bg-surface-container-low rounded-xl flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider">{papers.length} Total Projects</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-primary text-white px-6 py-2.5 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>New Research</span>
          </button>
        </div>
      </section>

      {/* Search Bar */}
      <div className="relative group max-w-xl">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">search</span>
        <input 
          type="text" 
          placeholder="Search projects by title, journal, authors, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/40 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPapers.map((paper, index) => (
          <div 
            key={paper.id} 
            className={`bg-surface-container-lowest p-6 rounded-2xl shadow-[0_12px_32px_rgba(25,28,30,0.06)] border border-outline-variant/5 hover:border-primary/20 transition-all group flex flex-col ${index === 0 && filteredPapers.length > 1 && !searchQuery ? 'md:col-span-2' : ''}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[paper.status]}`}>
                  {paper.status}
                </span>
                {paper.submittedAt && (
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider bg-surface-container-low px-2 py-1 rounded-full">
                    {calculatePassedTime(paper.submittedAt)} in journal
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex flex-col -space-y-1 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => movePaper(index, 'up')} className="material-symbols-outlined text-lg text-outline hover:text-primary leading-none">keyboard_arrow_up</button>
                  <button onClick={() => movePaper(index, 'down')} className="material-symbols-outlined text-lg text-outline hover:text-primary leading-none">keyboard_arrow_down</button>
                </div>
                <button 
                  onClick={() => {
                    const paperToEdit = { ...paper };
                    if (paperToEdit.submittedAt) {
                      paperToEdit.submittedAt = new Date(paperToEdit.submittedAt).toISOString().split('T')[0];
                    }
                    setEditingPaper(paperToEdit);
                    setShowEditModal(true);
                  }}
                  className="material-symbols-outlined text-xl text-primary/40 hover:text-primary transition-colors cursor-pointer"
                >
                  edit
                </button>
                <button 
                  onClick={() => handleDeletePaper(paper.id)}
                  className="material-symbols-outlined text-xl text-error/40 hover:text-error transition-colors cursor-pointer"
                >
                  delete
                </button>
              </div>
            </div>

            <h3 className={`font-headline font-bold text-on-surface mb-2 leading-tight ${index === 0 && filteredPapers.length > 1 && !searchQuery ? 'text-2xl' : 'text-lg'}`}>
              {paper.title}
            </h3>

            {paper.authors && (
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3 italic">
                {paper.authors}
              </p>
            )}

            {paper.journalName && (
              <div className="flex items-center space-x-2 mb-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">auto_stories</span>
                <span className="text-xs font-bold">{paper.journalName}</span>
                {paper.link && (
                  <a href={paper.link} target="_blank" rel="noopener noreferrer" className="material-symbols-outlined text-sm text-primary hover:scale-110 transition-transform">link</a>
                )}
              </div>
            )}

            <p className="text-on-surface-variant text-sm line-clamp-3 mb-8 flex-1">
              {paper.abstract || 'No abstract provided for this editorial project.'}
            </p>

            <div className="pt-6 border-t border-outline-variant/10 flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                    {paper.user?.name?.[0] || 'U'}
                  </div>
                  <span className="text-[9px] font-bold text-outline uppercase tracking-wider">
                    Recent Change: {new Date(paper.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {paper.submittedAt && (
                  <span className="text-[9px] font-bold text-secondary uppercase tracking-wider ml-7">
                    Submitted: {new Date(paper.submittedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <span className={`material-symbols-outlined text-xl ${paper.status === 'Under Review' ? 'animate-pulse text-tertiary' : 'text-primary/40'}`}>
                {statusIcons[paper.status]}
              </span>
            </div>
          </div>
        ))}

        {/* New Entry Slot */}
        <div 
          onClick={() => setShowAddModal(true)}
          className="bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center justify-center p-12 group cursor-pointer hover:bg-surface-container-high hover:border-primary/40 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-surface-container-high group-hover:bg-primary-container flex items-center justify-center mb-4 transition-all group-hover:scale-110 shadow-sm">
            <span className="material-symbols-outlined text-outline group-hover:text-white transition-colors">add</span>
          </div>
          <p className="font-headline font-extrabold text-on-surface-variant group-hover:text-primary transition-colors">Start New Research</p>
          <p className="text-[10px] text-outline mt-1 uppercase tracking-[0.2em] font-bold opacity-60">Collaborate with peers</p>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-on-background/10 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300 border border-outline-variant/10 max-h-[90vh] overflow-y-auto">
            <div className="mb-10 text-center">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-black mb-2 block">New Project</span>
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Initialize Research</h2>
            </div>
            <form onSubmit={handleAddPaper} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Research Paper Title</label>
                <input
                  type="text"
                  value={newPaper.title}
                  onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-outline-variant/50"
                  placeholder="e.g., Quantum Computing in Neural Networks"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Journal Name</label>
                  <input
                    type="text"
                    value={newPaper.journalName}
                    onChange={(e) => setNewPaper({ ...newPaper, journalName: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Journal Link</label>
                  <input
                    type="url"
                    value={newPaper.link}
                    onChange={(e) => setNewPaper({ ...newPaper, link: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Authors</label>
                <input
                  type="text"
                  value={newPaper.authors}
                  onChange={(e) => setNewPaper({ ...newPaper, authors: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="e.g., Jane Doe, John Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Current Stage</label>
                  <select
                    value={newPaper.status}
                    onChange={(e) => setNewPaper({ ...newPaper, status: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option>Ideation</option>
                    <option>Drafting</option>
                    <option>Submitted</option>
                    <option>Under Review</option>
                    <option>Published</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Submitted Date</label>
                  <input
                    type="date"
                    value={newPaper.submittedAt}
                    onChange={(e) => setNewPaper({ ...newPaper, submittedAt: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 text-on-surface-variant font-bold uppercase tracking-widest text-xs hover:bg-surface-container-low rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-2xl font-headline font-extrabold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPaper && (
        <div className="fixed inset-0 bg-on-background/10 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300 border border-outline-variant/10 max-h-[90vh] overflow-y-auto">
            <div className="mb-10 text-center">
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary font-black mb-2 block">Edit Project</span>
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Update Research</h2>
            </div>
            <form onSubmit={handleEditPaper} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Research Paper Title</label>
                <input
                  type="text"
                  value={editingPaper.title}
                  onChange={(e) => setEditingPaper({ ...editingPaper, title: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-outline-variant/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Journal Name</label>
                  <input
                    type="text"
                    value={editingPaper.journalName || ''}
                    onChange={(e) => setEditingPaper({ ...editingPaper, journalName: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Journal Link</label>
                  <input
                    type="url"
                    value={editingPaper.link || ''}
                    onChange={(e) => setEditingPaper({ ...editingPaper, link: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Authors</label>
                <input
                  type="text"
                  value={editingPaper.authors || ''}
                  onChange={(e) => setEditingPaper({ ...editingPaper, authors: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Abstract</label>
                <textarea
                  value={editingPaper.abstract || ''}
                  onChange={(e) => setEditingPaper({ ...editingPaper, abstract: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all placeholder:text-outline-variant/50 h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Current Stage</label>
                  <select
                    value={editingPaper.status}
                    onChange={(e) => setEditingPaper({ ...editingPaper, status: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option>Ideation</option>
                    <option>Drafting</option>
                    <option>Submitted</option>
                    <option>Under Review</option>
                    <option>Published</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Submitted Date</label>
                  <input
                    type="date"
                    value={editingPaper.submittedAt || ''}
                    onChange={(e) => setEditingPaper({ ...editingPaper, submittedAt: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPaper(null);
                  }}
                  className="flex-1 py-4 text-on-surface-variant font-bold uppercase tracking-widest text-xs hover:bg-surface-container-low rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-2xl font-headline font-extrabold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
