"use client";

import React, { createContext, useContext, useState } from "react";

interface ModelContextType {
  isLocalLLM: boolean;
  setIsLocalLLM: (value: boolean) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [isLocalLLM, setIsLocalLLM] = useState(true);

  return (
    <ModelContext.Provider value={{ isLocalLLM, setIsLocalLLM }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModelContext() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
