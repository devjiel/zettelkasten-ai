import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

// Default context value
const defaultContext: ThemeContextType = {
  darkMode: false,
  toggleDarkMode: () => {},
};

// Create context
const ThemeContext = createContext<ThemeContextType>(defaultContext);

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize darkMode from localStorage or default to false
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Save darkMode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const value = {
    darkMode,
    toggleDarkMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext; 