import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdFileUpload, MdDelete } from "react-icons/md";

import useEmployeesData from '../hooks/useEmployeesData';
import EmployeeTable from '../components/EmployeeTable';
import FilterSelect from '../components/FilterSelect';

const API_URL = import.meta.env.VITE_API_URL;

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  
  const {
    employees,
    setEmployees,
    loading,
    setLoading,
    meta: { divisions, ranks, positions, departments, salaryBands },
  } = useEmployeesData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    division: '',
    rank: '',
    position: '',
    department: '',
    salaryBand: '',
  });

  const [selectedIds, setSelectedIds] = useState([]);

  const filteredEmployees = useMemo(() => {
    const qClean = searchQuery.trim();
    const isIDSearch = qClean.startsWith('#');
    const q = qClean.replace('#', '').toLowerCase();

    return employees.filter(employee => {
      const matchesSearch = isIDSearch
        ? String(employee.id) === q
        : [
            `${employee.first_name} ${employee.surname}`,
            new Date(employee.start_date).toLocaleDateString('en-GB'),
            employee.rank,
            employee.position,
            employee.department,
            employee.division_id,
            employee.salary_band_id,
            employee.contact_number,
          ]
            .map(val => String(val).toLowerCase())
            .some(val => val.includes(q));

      const matchesFilters =
        (!filters.rank || employee.rank === filters.rank) &&
        (!filters.position || employee.position === filters.position) &&
        (!filters.department || employee.department === filters.department) &&
        (!filters.division || String(employee.division_id) === filters.division) &&
        (!filters.salaryBand || String(employee.salary_band_id) === filters.salaryBand);

      return matchesSearch && matchesFilters;
    });
  }, [searchQuery, employees, filters]);

  /**
   * Deletes employees based on selected IDs.
   */
  const handleDeleteSelectedEmployees = async () => {
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected employee(s)?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map(id =>
          fetch(`${API_URL}/employees/${id}/`, {
            method: 'DELETE',
          })
        )
      );

      const res = await fetch(`${API_URL}/employees/`);
      const newEmployeeData = await res.json();

      const rankMap = Object.fromEntries(ranks.map(r => [r.id, r.name]));
      const positionMap = Object.fromEntries(positions.map(p => [p.id, p.name]));
      const departmentMap = Object.fromEntries(departments.map(d => [d.id, d.name]));

      const enriched = newEmployeeData.map(employee => ({
        ...employee,
        rank: rankMap[employee.rank_id],
        position: positionMap[employee.position_id],
        department: departmentMap[employee.department_id],
        salary_band: employee.salary_band_id,
        division: employee.division_id,
      }));

      setEmployees(enriched);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error deleting employees:', err);
      alert('An error occurred while deleting employees.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-300 p-4 sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="space-y-4">
          <FilterSelect
            label="Division"
            value={filters.division}
            onChange={val => setFilters(prev => ({ ...prev, division: val }))}
            options={divisions.map(d => ({ label: d.id, value: d.id }))}
          />
          <FilterSelect
            label="Rank"
            value={filters.rank}
            onChange={val => setFilters(prev => ({ ...prev, rank: val }))}
            options={ranks.map(r => ({ label: r.name, value: r.name }))}
          />
          <FilterSelect
            label="Position"
            value={filters.position}
            onChange={val => setFilters(prev => ({ ...prev, position: val }))}
            options={positions.map(p => ({ label: p.name, value: p.name }))}
          />
          <FilterSelect
            label="Department"
            value={filters.department}
            onChange={val => setFilters(prev => ({ ...prev, department: val }))}
            options={departments.map(d => ({ label: d.name, value: d.name }))}
          />
          <FilterSelect
            label="Salary Band"
            value={filters.salaryBand}
            onChange={val => setFilters(prev => ({ ...prev, salaryBand: val }))}
            options={salaryBands.map(b => ({ label: b.id, value: b.id }))}
          />
          <button onClick={() =>
              setFilters({
                division: '',
                rank: '',
                position: '',
                department: '',
                salaryBand: '',
              })
            }
            className="mt-2 w-full py-2 px-4 text-sm bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search"
            className="flex-1 min-w-[200px] max-w-[600px] p-2 border border-gray-300 rounded"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              disabled={loading}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded disabled:opacity-50 cursor-pointer"
              onClick={() => navigate("/employees/new")}
            >
              <MdAdd className="w-6 h-6" />
            </button>
            <button
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded disabled:opacity-50 cursor-pointer"
              onClick={() => navigate("/employees/upload-csv")}
            >
              <MdFileUpload  className="w-6 h-6" />
            </button>
            <button
              disabled={selectedIds.length === 0 || loading}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded disabled:opacity-50 cursor-pointer"
              onClick={handleDeleteSelectedEmployees}
            >
              <MdDelete className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <EmployeeTable employees={filteredEmployees} selectedIds={selectedIds} setSelectedIds={setSelectedIds} loading={loading} onRowClick={(id) => {navigate(`/employees/${id}`)}} />
        </div>
      </main>
    </div>
  );
}