/**
 * Component for rendering a table that displays employee data.
 */
export default function EmployeeTable({employees, selectedIds, setSelectedIds, loading, onRowClick}) {
  const toggleCheckbox = (id, checked) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(existingId => existingId !== id)
    );
  };

  const allSelected = employees.length > 0 && selectedIds.length === employees.length;

  return (
    <table className="min-w-full bg-white border border-gray-300 shadow rounded">
      <thead className="bg-blue-200">
        <tr>
          <th className="p-2 text-left border-b w-10">
            <input
              className="w-4 h-4"
              type="checkbox"
              checked={allSelected}
              onChange={e => setSelectedIds(e.target.checked ? employees.map(e => e.id) : [])}
            />
          </th>
          <th className="p-2 text-left border-b">Name</th>
          <th className="p-2 text-left border-b">Division</th>
          <th className="p-2 text-left border-b">Position</th>
          <th className="p-2 text-left border-b">Department</th>
          <th className="p-2 text-left border-b">Salary Band</th>
          <th className="p-2 text-left border-b">Start Date</th>
          <th className="p-2 text-left border-b">Contact</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="p-2 border-b"></td>
              {Array.from({ length: 7 }).map((_, j) => (
                <td key={j} className="p-2 border-b">
                  <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                </td>
              ))}
            </tr>
          ))
        ) : (
          employees.map(employee => (
            <tr
              key={employee.id}
              className="hover:bg-blue-50 cursor-pointer"
              onClick={() => onRowClick(employee.id)}
            >
              <td className="p-2 border-b w-10">
                <input
                  className="w-4 h-4"
                  type="checkbox"
                  checked={selectedIds.includes(employee.id)}
                  onChange={e =>
                    toggleCheckbox(employee.id, e.target.checked)
                  }
                  onClick={e => e.stopPropagation()}
                />
              </td>
              <td className="p-2 border-b">
                <div className="flex items-center gap-2">
                  <span>{employee.first_name} {employee.surname}</span>
                  <span className="text-sm text-gray-600">#{employee.id}</span>
                </div>
              </td>
              <td className="p-2 border-b">{employee.division}</td>
              <td className="p-2 border-b">{employee.rank} {employee.position}</td>
              <td className="p-2 border-b">{employee.department}</td>
              <td className="p-2 border-b">{employee.salary_band}</td>
              <td className="p-2 border-b">
                {new Date(employee.start_date).toLocaleDateString('en-GB')}
              </td>
              <td className="p-2 border-b">{employee.contact_number}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}