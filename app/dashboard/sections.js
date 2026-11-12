// What each analysis page gets from the engine result. Every page shows its numbers and
// graphs first and its recommendations last.

const byGroup = (json, ...groups) =>
  (json.optimizations ?? []).filter(o => groups.includes(o.group));

export const SECTIONS = {
  lighting: json => ({
    ...json.analysis.lighting,
    loads:         json.loads,
    optimizations: byGroup(json, 'Lighting'),
    readings:      json.readings ?? [],
  }),

  temperature: json => ({
    ...json.analysis.hvac,
    loads:         json.loads,
    optimizations: byGroup(json, 'HVAC', 'Humidity'),
    weatherError:  json.weatherError,
    readings:      json.readings ?? [],
  }),

  standby: json => ({
    ...json.analysis.standby,
    loads:         json.loads,
    daily:         json.analysis.trends.dailyBreakdown,
    optimizations: byGroup(json, 'Standby'),
    readings:      json.readings ?? [],
  }),

  trends: json => ({
    ...json.analysis.trends,
    optimizations: byGroup(json, 'Trends'),
  }),

  environmental: json => json.analysis.environmental,
};

export const SECTION_NAMES = Object.keys(SECTIONS);
