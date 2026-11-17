'use client';

import { createContext, useContext, useMemo, useState } from 'react';

const NavbarContext = createContext(null);

export function NavbarProvider({ children }) {
  const [forceBorder, setForceBorder] = useState(false);
  const value = useMemo(() => ({ forceBorder, setForceBorder }), [forceBorder]);
  return (
    <NavbarContext.Provider value={value}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  return useContext(NavbarContext);
}