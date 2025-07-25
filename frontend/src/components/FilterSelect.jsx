/**
 * Component for rendering a select field that acts as a filter.
 */
export default function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        className="w-full p-2 border border-gray-300 rounded"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">All {label}s</option>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </div>
  );
}