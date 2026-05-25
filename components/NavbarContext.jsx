'use client';

import { createContext, useContext, useState } from 'react';

const NavbarContext = createContext(null);

export function NavbarProvider({ children }) {
  const [forceBorder, setForceBorder] = useState(false);
  return (
    <NavbarContext.Provider value={{ forceBorder, setForceBorder }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  return useContext(NavbarContext);
}