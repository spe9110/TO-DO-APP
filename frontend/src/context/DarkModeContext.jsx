import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext(undefined);

export const DarkModeContextProvider = ({ children }) => {
  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') || 'light'
  );

    useEffect(() => {
        const root = document.documentElement;
        localStorage.setItem('theme', theme);

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

  const handleThemeChange = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };
  
  return (
    <DarkModeContext.Provider value={{ theme, handleThemeChange }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useTheme = () => useContext(DarkModeContext);
