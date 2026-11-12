-- Per-device settings (display name, rate per kWh, location, monthly usage).
-- Run once in the Supabase SQL editor. Safe to run again.

alter table public.devices
  add column if not exists display_name text,
  add column if not exists tariff_rate  numeric check (tariff_rate is null or (tariff_rate >= 0.5 and tariff_rate <= 100)),
  add column if not exists latitude     double precision check (latitude  is null or (latitude  between -90  and 90)),
  add column if not exists longitude    double precision check (longitude is null or (longitude between -180 and 180)),
  add column if not exists monthly_kwh  numeric check (monthly_kwh is null or monthly_kwh > 0);

-- Power, energy and voltage are no longer sensor readings. The columns can stay (old rows
-- keep their values and new readings leave them empty), so nothing needs to be dropped.
-- To remove them for good, uncomment:
-- alter table public.readings
--   drop column if exists power,
--   drop column if exists current,
--   drop column if exists energy,
--   drop column if exists voltage;
