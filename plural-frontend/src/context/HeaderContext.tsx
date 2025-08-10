'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type HeaderContextType = {
  isTopicPage: boolean;
  setIsTopicPage: (isTopic: boolean) => void;
  topicActions: ReactNode | null;
  setTopicActions: (actions: ReactNode | null) => void;
};

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [isTopicPage, setIsTopicPage] = useState(false);
  const [topicActions, setTopicActions] = useState<ReactNode | null>(null);

  const value = { isTopicPage, setIsTopicPage, topicActions, setTopicActions };

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader deve ser usado dentro de um HeaderProvider');
  }
  return context;
}