export const Radio = ({ label, checked, onChange, name, value }) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        name={name}
        value={value}
        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};