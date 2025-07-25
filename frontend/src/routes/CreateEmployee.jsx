import { useNavigate } from 'react-router-dom';
import EmployeeForm from '../components/EmployeeForm';

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateEmployee() {
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    const res = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.log(errorData)
    }

    if (res.ok) {
      navigate('/');
    } else {
      alert('Creation failed');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create New Employee</h1>
      <EmployeeForm onSubmit={handleCreate} />
    </div>
  );
}
