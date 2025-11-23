export const Text = ({ children, variant = 'body', className = '' }) => {
  const variants = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    small: 'text-sm',
    caption: 'text-xs text-gray-500'
  };
  
  return <p className={`${variants[variant]} ${className}`}>{children}</p>;
};

// src/components/atoms/Badge.jsx
export const Badge = ({ children, status = 'default' }) => {
  const statusColors = {
    default: 'bg-gray-200 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {children}
    </span>
  );
};