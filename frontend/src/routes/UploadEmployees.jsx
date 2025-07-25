import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function UploadEmployees() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [divisionId, setDivisionId] = useState('');
  const [divisions, setDivisions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/divisions/`)
      .then(res => res.json())
      .then(data => setDivisions(data))
      .catch(err => {
        console.error('Failed to fetch divisions:', err);
        setError('Could not load division options.');
      });
  }, []);

  const handleFileChange = (e) => {
    const uploaded = e.target.files?.[0];
    if (uploaded && uploaded.type !== 'text/csv') {
      setError('Please upload a valid CSV file');
      setFile(null);
      return;
    }
    setError('');
    setFile(uploaded || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) return setError('Please select a CSV file');
    if (!divisionId) return setError('Please select a division');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('division_id', divisionId);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Upload failed');
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Employees (CSV)</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block font-medium mb-1">Division</label>
          <select
            className="w-full p-2 border rounded"
            value={divisionId}
            onChange={(e) => setDivisionId(e.target.value)}
          >
            <option value="">Select a division</option>
            {divisions.map((div) => (<option key={div.id} value={div.id}>{div.id}</option>))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full p-2 border rounded"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}