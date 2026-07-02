"use client";

import { useState, useEffect } from "react";

/**
 * Returns a debounced version of `value` that only updates after
 * `delay` ms have passed without `value` changing. Useful for
 * search inputs to avoid firing an API call on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
