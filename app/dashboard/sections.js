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
