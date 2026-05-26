'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { generateDemoReadings, getDemoProfile, getDemoDevices, getDemoSubscription, DEMO_DEVICE_ID } from '@/lib/demo';

const DemoContext = createContext(null);

export function DemoProvider({ children, isDemo }) {
  const [demoReadings, setDemoReadings] = useState([]);
  const [demoReady, setDemoReady]       = useState(false);

  useEffect(() => {
    if (!isDemo) { setDemoReady(true); return; }
    fetch('/demo.json')
      .then(r => r.json())
      .then(raw => {
        setDemoReadings(generateDemoReadings(raw));
        setDemoReady(true);
      })
      .catch(() => setDemoReady(true));
  }, [isDemo]);

  return (
    <DemoContext.Provider value={{
      isDemo,
      demoReady,
      demoReadings,
      demoProfile:      isDemo ? getDemoProfile()      : null,
      demoDevices:      isDemo ? getDemoDevices()      : null,
      demoSubscription: isDemo ? getDemoSubscription() : null,
      demoPlan:         isDemo ? 'enterprise'          : null,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}