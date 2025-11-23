import React from 'react';

const DataTable = ({ columns, data, actions }) => {
  return (
    // Added: white background, larger shadow, rounded-xl
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {/* Added: Gray background for header */}
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, rowIndex) => (
              // Added: hover effect, transition
              <tr key={rowIndex} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap font-medium">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                
                {actions && (
                  <td className="px-6 py-4 text-sm text-right whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Added: Empty State handling */}
      {data.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm">No records found.</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;