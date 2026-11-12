'use client';

import { createContext, useContext, useMemo } from 'react';
import {
  generateDemoReadings, getDemoProfile, getDemoDevices, getDemoSubscription,
  DEMO_DEVICE_ID, DEMO_DEVICE_ID_2,
} from '@/lib/demo';

const DemoContext = createContext(null);

export function DemoProvider({ children, isDemo }) {
  const value = useMemo(() => ({
    isDemo,
    demoReady:        true,
    demoReadings:     isDemo ? generateDemoReadings(DEMO_DEVICE_ID)   : [],
    demoReadings2:    isDemo ? generateDemoReadings(DEMO_DEVICE_ID_2) : [],
    demoProfile:      isDemo ? getDemoProfile()      : null,
    demoDevices:      isDemo ? getDemoDevices()      : null,
    demoSubscription: isDemo ? getDemoSubscription() : null,
    demoPlan:         isDemo ? 'enterprise'          : null,
  }), [isDemo]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  return useContext(DemoContext);
}
