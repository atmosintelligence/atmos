'use client';

import { useEffect } from 'react';
import { useNavbar } from './NavbarContext';

export default function NavbarBorderOverride() {
  const { setForceBorder } = useNavbar();
  useEffect(() => {
    setForceBorder(true);
    return () => setForceBorder(false);
  }, []);
  return null;
}