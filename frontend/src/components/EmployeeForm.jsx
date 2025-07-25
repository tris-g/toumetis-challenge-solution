import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Component for rendering a form that can create or update an employee.
 */
export default function EmployeeForm({ initialData = {}, isEdit = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    surname: '',
    contact_number: '',
    department_id: '',
    rank_id: '',
    division_id: '',
    position_id: '',
    salary_band_id: '',
    start_date: '',
    ...initialData,
  });

  const [options, setOptions] = useState({ divisions: [], ranks: [], positions: [], departments: [], salaryBands: [] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [optionLoading, setOptionLoading] = useState(true);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [divRes, rankRes, posRes, depRes, bandRes] = await Promise.all([
          fetch(`${API_URL}/divisions/`),
          fetch(`${API_URL}/ranks/`),
          fetch(`${API_URL}/positions/`),
          fetch(`${API_URL}/departments/`),
          fetch(`${API_URL}/bands/`),
        ]);
        const [divisions, ranks, positions, departments, salaryBands] = await Promise.all([
          divRes.json(), rankRes.json(), posRes.json(), depRes.json(), bandRes.json(),
        ]);
        setOptions({ divisions, ranks, positions, departments, salaryBands });
      } catch (e) {
        console.error('Failed to load options:', e);
      } finally {
        setOptionLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined })); // Clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    const requiredFields = [
      { key: 'first_name', label: 'first name' },
      { key: 'surname', label: 'surname' },
      { key: 'rank_id', label: 'rank' },
      { key: 'department_id', label: 'department' },
      { key: 'division_id', label: 'division' },
      { key: 'position_id', label: 'position' },
      { key: 'salary_band_id', label: 'salary band' },
      { key: 'contact_number', label: 'contact number' },
      { key: 'start_date', label: 'start date' },
    ];

    const localErrors = {};
    requiredFields.forEach(({ key, label }) => {
      if (!form[key]) {
        localErrors[key] = `Please select a ${label}.`;
      }
    });

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      setLoading(false);
      return;
    }

    const parsedForm = {
      ...form,
      department_id: Number(form.department_id),
      rank_id: Number(form.rank_id),
      position_id: Number(form.position_id),
      division_id: Number(form.division_id),
      salary_band_id: Number(form.salary_band_id),
    };

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `${API_URL}/employees/${form.id}` : `${API_URL}/employees`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedForm),
      });

      if (!res.ok) {
        const errorData = await res.json();

        if (res.status === 422 && Array.isArray(errorData.detail)) {
          const fieldErrors = {};
          errorData.detail.forEach((err) => {
            const field = err.loc?.[1];
            if (field) fieldErrors[field] = err.msg;
          });
          setErrors(fieldErrors);
        } else {
          throw new Error(errorData.detail || 'Unknown error');
        }
      } else {
        navigate('/');
      }
    } catch (err) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (optionLoading) return <p className="p-4">Loading form options...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {generalError && <p className="text-red-500">{generalError}</p>}

      {['first_name', 'surname', 'contact_number'].map(field => (
        <div key={field}>
          <label className="block font-medium capitalize">{field.replace('_', ' ')}</label>
          <input
            type="text"
            name={field}
            value={form[field]}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors[field] ? 'border-red-500' : ''}`}
          />
          {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
        </div>
      ))}

      {/* Dropdowns */}
      <div>
        <label className="block font-medium">Department</label>
        <select
          name="department_id"
          value={form.department_id}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.department_id ? 'border-red-500' : ''}`}
        >
          <option value="">Select department</option>
          {options.departments.map(dep => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
        {errors.department_id && <p className="text-red-500 text-sm">{errors.department_id}</p>}
      </div>

      <div>
        <label className="block font-medium">Rank</label>
        <select
          name="rank_id"
          value={form.rank_id}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.rank_id ? 'border-red-500' : ''}`}
        >
          <option value="">Select rank</option>
          {options.ranks.map(rank => (
            <option key={rank.id} value={rank.id}>{rank.name}</option>
          ))}
        </select>
        {errors.rank_id && <p className="text-red-500 text-sm">{errors.rank_id}</p>}
      </div>

      <div>
        <label className="block font-medium">Position</label>
        <select
          name="position_id"
          value={form.position_id}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.position_id ? 'border-red-500' : ''}`}
        >
          <option value="">Select position</option>
          {options.positions.map(pos => (
            <option key={pos.id} value={pos.id}>{pos.name}</option>
          ))}
        </select>
        {errors.position_id && <p className="text-red-500 text-sm">{errors.position_id}</p>}
      </div>

      <div>
        <label className="block font-medium">Division</label>
        <select
          name="division_id"
          value={form.division_id}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.division_id ? 'border-red-500' : ''}`}
        >
          <option value="">Select division</option>
          {options.divisions.map(div => (
            <option key={div.id} value={div.id}>{div.id}</option>
          ))}
        </select>
        {errors.division_id && <p className="text-red-500 text-sm">{errors.division_id}</p>}
      </div>

      <div>
        <label className="block font-medium">Salary Band</label>
        <select
          name="salary_band_id"
          value={form.salary_band_id}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.salary_band_id ? 'border-red-500' : ''}`}
        >
          <option value="">Select salary band</option>
          {options.salaryBands.map(band => (
            <option key={band.id} value={band.id}>{band.id}</option>
          ))}
        </select>
        {errors.salary_band_id && <p className="text-red-500 text-sm">{errors.salary_band_id}</p>}
      </div>

      <div>
        <label className="block font-medium">Start Date</label>
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          className={`w-full p-2 border rounded ${errors.start_date ? 'border-red-500' : ''}`}
        />
        {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
      </button>
    </form>
  );
}
