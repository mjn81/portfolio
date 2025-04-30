import { useEffect } from 'react';

// Debounce hook implementation
function useDebounce(callback: () => void, delay: number, dependencies: any[]) {
  useEffect(() => {
    // Set up the timeout.
    const handler = setTimeout(() => {
      callback();
    }, delay);

    // Clean up the timeout if the component unmounts or dependencies change.
    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, delay, callback]); // Re-run effect if delay or callback changes
}

export default useDebounce; 