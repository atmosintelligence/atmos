// Builds a PDF or JSON export for one device. Used from the Devices page.
import { fetchEngine } from '@/lib/engineFetch';
import { exportPDF, exportJSON } from '@/lib/pdf/export';
import { summariseSavings } from '@/lib/savings';

async function gather({ device, settings, isDemo, demoReadings, alerts }) {
  const json = await fetchEngine({
    isDemo,
    readings: isDemo ? demoReadings : null,
    deviceId: device.device_id,
    settings,
  });
  return {
    json,
    savings: summariseSavings(alerts ?? [], settings.tariff),
  };
}

export async function exportDevicePDF(ctx) {
  const { json, savings } = await gather(ctx);
  await exportPDF({
    deviceId:      ctx.device.device_id,
    deviceName:    settingsName(ctx),
    settings:      ctx.settings,
    profile:       ctx.profile,
    readings:      json.readings ?? [],
    optimizations: json.optimizations ?? [],
    environmental: json.environmental ?? null,
    analysis:      json.analysis ?? null,
    savings,
  });
}

export async function exportDeviceJSON(ctx) {
  const { json, savings } = await gather(ctx);
  exportJSON({
    deviceId:      ctx.device.device_id,
    deviceName:    settingsName(ctx),
    settings:      ctx.settings,
    readings:      json.readings ?? [],
    optimizations: json.optimizations ?? [],
    savings,
  });
}

const settingsName = ({ settings, device }) => settings?.name || device.device_id;
