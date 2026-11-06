// What each Analysis tab shows, taken from the engine result.
// To change a tab's data, edit its line here. To add a tab, add a line and
// a page that calls useAnalysis('<name>').
//
// Each function receives the engine result and returns what the page gets as `data`.

const byGroup = (json, ...groups) =>
  (json.optimizations ?? []).filter(o => groups.includes(o.group));

export const SECTIONS = {
  lighting: json => ({
    ...json.analysis.lighting,
    optimizations: byGroup(json, 'Lighting'),
    readings:      json.readings ?? [],
  }),

  temperature: json => ({
    ...json.analysis.hvac,
    optimizations: byGroup(json, 'HVAC', 'Humidity'),
    weatherError:  json.weatherError,
    readings:      json.readings ?? [],
  }),

  power: json => ({
    ...json.analysis.power,
    optimizations: byGroup(json, 'Power'),
    readings:      json.readings ?? [],
  }),

  trends: json => ({
    ...json.analysis.trends,
    optimizations: byGroup(json, 'Trends'),
  }),

  environmental: json => json.analysis.environmental,
};

export const SECTION_NAMES = Object.keys(SECTIONS);
