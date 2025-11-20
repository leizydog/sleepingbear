import { useState, useEffect } from 'react';

// A custom hook that delays updating a value until a set time has passed 
// since the last change.
const useDebounce = (value, delay) => {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer that updates the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: If the value (or the delay) changes before the timeout, 
    // clear the previous timer and start a new one. This is the core of debouncing.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-run if value or delay changes

  return debouncedValue;
};

export default useDebounce;