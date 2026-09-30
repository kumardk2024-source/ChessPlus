import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'normal' | 'dark' | 'futuristic';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'futuristic',
  setTheme: () => {},
  toggleTheme: () => {},
  cycleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('chessplus-theme');
    return (saved === 'dark' || saved === 'normal' || saved === 'futuristic') ? (saved as ThemeMode) : 'futuristic';
  });

  useEffect(() => {
    localStorage.setItem('chessplus-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'futuristic' ? 'normal' : 'futuristic'));
  };

  const cycleTheme = () => {
    setTheme((prev) => {
      if (prev === 'futuristic') return 'normal';
      if (prev === 'normal') return 'dark';
      return 'futuristic';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
