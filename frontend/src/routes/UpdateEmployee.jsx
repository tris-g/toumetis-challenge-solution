import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';

const API_URL = import.meta.env.VITE_API_URL;

export default function UpdateEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/employees/${id}`)
      .then(res => res.json())
      .then(data => setEmployee(data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (formData) => {
    const res = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      navigate('/');
    } else {
      alert('Update failed');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Employee</h1>
      {loading ? <p>Loading...</p> : (
        <EmployeeForm initialData={employee} onSubmit={handleUpdate} isEdit={true} />
      )}
    </div>
  );
}