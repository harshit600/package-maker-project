import React, { useEffect, useState } from 'react';
import config from '../../config';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const editorStyle = {
  height: '200px',
  paddingBottom: '50px',
  borderRadius: '10px',
};

const GlobalMasterData = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ name: '', description: '' });

  // Fetch all entries on mount
  useEffect(() => {
    fetchAllEntries();
  }, []);

  const fetchAllEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_HOST}/api/globalmaster/getall`);
      if (!response.ok) throw new Error('Failed to fetch entries');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      alert('Error fetching entries: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Start editing an entry
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditData({
      name: entries[index].name,
      description: entries[index].description,
    });
  };

  // Update entry in backend
  const handleUpdate = async (id) => {
    try {
      const response = await fetch(`${config.API_HOST}/api/globalmaster/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update entry');
      }
      alert('Entry updated successfully!');
      setEditIndex(null);
      fetchAllEntries();
    } catch (error) {
      alert('Error updating entry: ' + error.message);
    }
  };

  // Delete entry in backend
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const response = await fetch(`${config.API_HOST}/api/globalmaster/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete entry');
      }
      alert('Entry deleted successfully!');
      fetchAllEntries();
    } catch (error) {
      alert('Error deleting entry: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6 border-b pb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-blue-600 rounded-full mr-2"></span>
          Global Master Entries
        </h2>
        {loading ? (
          <div className="text-center text-blue-600 font-semibold py-8">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No entries found.</div>
        ) : (
          <ul className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {entries.map((entry, idx) => (
              <li key={entry._id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm transition hover:shadow-md flex flex-col gap-3">
                {editIndex === idx ? (
                  <>
                    <input
                      className="border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-3 rounded-lg mb-2 text-lg outline-none transition"
                      value={editData.name}
                      onChange={e => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Name"
                    />
                    <div className="mb-2">
                      <ReactQuill
                        theme="snow"
                        modules={modules}
                        style={{ ...editorStyle, border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}
                        value={editData.description}
                        onChange={value => setEditData({ ...editData, description: value })}
                      />
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition" onClick={() => handleUpdate(entry._id)}>Save</button>
                      <button className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg font-semibold shadow transition" onClick={() => setEditIndex(null)}>Cancel</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      
                      <div className="text-2xl font-bold text-blue-800 tracking-tight">{entry.name}</div>
                    </div>
                    <div className="border-b border-blue-100 my-2"></div>
                    <div className="bg-blue-50 rounded-lg p-4 text-gray-800 text-base shadow-inner min-h-[60px]">
                      <span dangerouslySetInnerHTML={{__html: entry.description}} />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition" onClick={() => handleEdit(idx)}>Edit</button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition" onClick={() => handleDelete(entry._id)}>Delete</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GlobalMasterData;