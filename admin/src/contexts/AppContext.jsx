import { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const value = useMemo(
    () => ({
      isLoading,
      setIsLoading,
    }),
    [isLoading],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
};
