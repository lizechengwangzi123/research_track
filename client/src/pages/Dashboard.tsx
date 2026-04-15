import { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2, Edit2, ChevronRight } from 'lucide-react';
import api from '../utils/api';

export default function Dashboard() {
  const [papers, setPapers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPaper, setNewPaper] = useState({ title: '', abstract: '', status: 'Ideation' });

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
      await api.post('/papers', newPaper);
      setShowAddModal(false);
      setNewPaper({ title: '', abstract: '', status: 'Ideation' });
      fetchPapers();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePaper = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this paper?')) {
      try {
        await api.delete(`/papers/${id}`);
        fetchPapers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const statusColors: any = {
    'Ideation': 'bg-gray-100 text-gray-600',
    'Drafting': 'bg-blue-100 text-blue-600',
    'Submitted': 'bg-purple-100 text-purple-600',
    'Under Review': 'bg-yellow-100 text-yellow-600',
    'Published': 'bg-green-100 text-green-600'
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Papers</h1>
          <p className="text-gray-500 mt-1">Track and manage your research progress.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
        >
          <Plus size={20} />
          <span>Add Paper</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {papers.map((paper) => (
          <div key={paper.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group">
            <div className="flex items-start justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[paper.status]}`}>
                {paper.status}
              </span>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => deletePaper(paper.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{paper.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">{paper.abstract || 'No abstract provided.'}</p>
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">Updated: {new Date(paper.updatedAt).toLocaleDateString()}</span>
              <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition" size={20} />
            </div>
          </div>
        ))}
      </div>

      {papers.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">No papers yet</h3>
          <p className="text-gray-500">Click the button above to start tracking your research.</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-6">Track New Paper</h2>
            <form onSubmit={handleAddPaper} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newPaper.title}
                  onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                <textarea
                  value={newPaper.abstract}
                  onChange={(e) => setNewPaper({ ...newPaper, abstract: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newPaper.status}
                  onChange={(e) => setNewPaper({ ...newPaper, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Ideation</option>
                  <option>Drafting</option>
                  <option>Submitted</option>
                  <option>Under Review</option>
                  <option>Published</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Track Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
