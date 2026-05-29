'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { generateDemoReadings, generateDemoReadings2, getDemoProfile, getDemoDevices, getDemoSubscription, DEMO_DEVICE_ID } from '@/lib/demo';

const DemoContext = createContext(null);

export function DemoProvider({ children, isDemo }) {
  const [demoReady, setDemoReady]         = useState(false);
  const [demoReadings, setDemoReadings]   = useState([]);
  const [demoReadings2, setDemoReadings2] = useState([]);

  useEffect(() => {
    if (!isDemo) { setDemoReady(true); return; }
    Promise.all([
      fetch('/demo.json').then(r => r.json()),
      fetch('/demo_2.json').then(r => r.json()),
    ]).then(([raw1, raw2]) => {
      setDemoReadings(generateDemoReadings(raw1));
      setDemoReadings2(generateDemoReadings2(raw2));
      setDemoReady(true);
    }).catch(() => setDemoReady(true));
  }, [isDemo]);

  return (
    <DemoContext.Provider value={{
      isDemo,
      demoReady,
      demoReadings,
      demoReadings2,
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