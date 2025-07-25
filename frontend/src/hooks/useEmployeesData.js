import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches employees and related metadata (divisions, ranks, etc.).
 * Returns enriched data ready for display and filtering.
 * @returns {Object} employees, setEmployees, loading, setLoading
 */
export default function useEmployeesData() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    divisions: [],
    ranks: [],
    positions: [],
    departments: [],
    salaryBands: []
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [employeeRes, divisionRes, rankRes, positionRes, departmentRes, bandRes] = await Promise.all([
          fetch(`${API_URL}/employees/`),
          fetch(`${API_URL}/divisions/`),
          fetch(`${API_URL}/ranks/`),
          fetch(`${API_URL}/positions/`),
          fetch(`${API_URL}/departments/`),
          fetch(`${API_URL}/bands/`)
        ]);
        const [employeeData, divisions, ranks, positions, departments, bands] = await Promise.all([
          employeeRes.json(), divisionRes.json(), rankRes.json(), positionRes.json(), departmentRes.json(), bandRes.json()
        ]);

        const rankMap = Object.fromEntries(ranks.map(r => [r.id, r.name]));
        const positionMap = Object.fromEntries(positions.map(p => [p.id, p.name]));
        const departmentMap = Object.fromEntries(departments.map(d => [d.id, d.name]));

        const enriched = employeeData.map(e => ({
          ...e,
          division: e.division_id,
          rank: rankMap[e.rank_id],
          position: positionMap[e.position_id],
          department: departmentMap[e.department_id],
          salary_band: e.salary_band_id
        }));

        setEmployees(enriched);
        setMeta({ divisions, ranks, positions, departments, salaryBands: bands });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { employees, setEmployees, meta, loading, setLoading };
}