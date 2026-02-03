import React, { useContext } from "react";
import { AppContext } from "../contexts/AppContext";

export const ContextBridge: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const contextValue = useContext(AppContext);

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
