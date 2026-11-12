import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BG       = '#0f0f0f';
const FG       = '#e8e8e8';
const FG_DIM   = '#909090';
const FG_MUTED = '#606060';
const BRAND    = '#4ADE80';
const PAGE_W   = 210;
const PAGE_H   = 297;
const MARGIN   = 18;
const COL_W    = PAGE_W - MARGIN * 2;
const FOOTER_Y = PAGE_H - 10;
const FOOTER_TEXT = 'Information has been intelligently driven by Atmos Intelligence';
const RULE_COLOR  = [70, 70, 70];

const SEVERITY_COLOR = {
  critical: [239, 68,  68 ],
  warning:  [234, 179, 8  ],
  info:     [96,  165, 250],
};

const GROUP_COLOR = {
  Lighting: [234, 179, 8  ],
  HVAC:     [96,  165, 250],
  Humidity: [96,  165, 250],
  Standby:  [236, 72,  153],
  Power:    [236, 72,  153],
  Trends:   [167, 139, 250],
};

async function loadFont(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load font: ${url}`);
  const buffer = await response.arrayBuffer();
  const bytes  = new Uint8Array(buffer);
  let binary   = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function registerFonts(doc) {
  const inter = await loadFont('/api/fonts/inter');
  const syne  = await loadFont('/api/fonts/syne');
  doc.addFileToVFS('Inter.ttf', inter);
  doc.addFont('Inter.ttf', 'Inter', 'normal');
  doc.addFont('Inter.ttf', 'Inter', 'bold');
  doc.addFileToVFS('Syne.ttf', syne);
  doc.addFont('Syne.ttf', 'Syne', 'bold');
}

function setHeading(doc, size = 14) {
  doc.setFontSize(size);
  doc.setFont('Syne', 'bold');
}

function setBody(doc, size = 10) {
  doc.setFontSize(size);
  doc.setFont('Inter', 'normal');
}

function setBold(doc, size = 10) {
  doc.setFontSize(size);
  doc.setFont('Inter', 'bold');
}

function setRule(doc) {
  doc.setDrawColor(...RULE_COLOR);
  doc.setLineWidth(0.3);
}

function fillPage(doc) {
  doc.setFillColor(BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
}

function addPage(doc) {
  doc.addPage();
  fillPage(doc);
  return MARGIN;
}

function addFooter(doc, pageCount) {
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(BG);
    doc.rect(0, PAGE_H - 16, PAGE_W, 16, 'F');
    setBody(doc, 7);
    doc.setTextColor(FG_MUTED);
    doc.text(FOOTER_TEXT, PAGE_W / 2, FOOTER_Y, { align: 'center' });
    doc.text(`${i} / ${pageCount}`, PAGE_W - MARGIN, FOOTER_Y, { align: 'right' });
  }
}

function sectionTitle(doc, y, text) {
  setBold(doc, 16);
  doc.setTextColor(BRAND);
  doc.text(text.toUpperCase(), MARGIN, y);
  return y + 7;
}

function sectionSubtitle(doc, y, text) {
  setBold(doc, 9);
  doc.setTextColor(FG_DIM);
  doc.text(text.toUpperCase(), MARGIN, y);
  return y + 6;
}

function checkY(doc, y, needed = 20) {
  if (y + needed > PAGE_H - 20) return addPage(doc);
  return y;
}

function intro(doc, y, text) {
  setBody(doc, 9);
  doc.setTextColor(FG_DIM);
  const lines = doc.splitTextToSize(text, COL_W);
  doc.text(lines, MARGIN, y);
  return y + lines.length * 5 + 6;
}

function statBlock(doc, y, stats) {
  const colW = COL_W / stats.length;
  stats.forEach((s, i) => {
    const x = MARGIN + i * colW;
    doc.setFillColor(25, 25, 25);
    doc.roundedRect(x, y, colW - 3, 28, 3, 3, 'F');
    setHeading(doc, 16);
    doc.setTextColor(FG);
    doc.text(String(s.value), x + 5, y + 11);
    setBody(doc, 8.5);
    doc.setTextColor(FG_DIM);
    doc.text(s.label, x + 5, y + 18);
    if (s.sub) {
      doc.setFontSize(7);
      doc.setTextColor(FG_MUTED);
      doc.text(doc.splitTextToSize(s.sub, colW - 10), x + 5, y + 23);
    }
  });
  return y + 33;
}

function optimizationBlock(doc, y, opt) {
  const msgLines   = doc.splitTextToSize(opt.message, COL_W - 14);
  const blockH     = Math.max(30, 18 + msgLines.length * 4.5);
  y = checkY(doc, y, blockH + 4);

  const sc = SEVERITY_COLOR[opt.severity] ?? [150, 150, 150];
  const gc = GROUP_COLOR[opt.group]       ?? [150, 150, 150];

  doc.setFillColor(20, 20, 20);
  doc.roundedRect(MARGIN, y, COL_W, blockH, 2, 2, 'F');
  doc.setFillColor(...sc);
  doc.roundedRect(MARGIN, y, 2, blockH, 1, 1, 'F');

  setBold(doc, 7);
  doc.setTextColor(...gc);
  doc.text(opt.group.toUpperCase(), MARGIN + 6, y + 6);

  setBold(doc, 8.5);
  doc.setTextColor(FG);
  doc.text(opt.title, MARGIN + 6, y + 12);

  setBody(doc, 7.5);
  doc.setTextColor(FG_DIM);
  doc.text(msgLines, MARGIN + 6, y + 18);

  if (opt.saving?.inr) {
    setBody(doc, 7);
    doc.setTextColor(BRAND);
    doc.text(`Estimated saving: ₹${opt.saving.inr}`, PAGE_W - MARGIN - 2, y + 6, { align: 'right' });
  }

  setBold(doc, 6.5);
  doc.setTextColor(...sc);
  doc.text(opt.severity.toUpperCase(), PAGE_W - MARGIN - 2, y + 12, { align: 'right' });

  return y + blockH + 3;
}

function noDataNote(doc, y, text = 'No events detected for this category.') {
  setBody(doc, 8.5);
  doc.setTextColor(FG_MUTED);
  doc.text(text, MARGIN, y);
  return y + 8;
}

async function loadLogo() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve({ data: canvas.toDataURL('image/png'), w: img.width, h: img.height });
    };
    img.onerror = () => resolve(null);
    img.src = '/logo.png';
  });
}

function fmtDate() {
  return new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace('am', 'AM').replace('pm', 'PM IST');
}

function fmtTimestamp(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).replace('am', 'AM').replace('pm', 'PM');
}

function atStyles(doc) {
  return {
    styles: {
      fillColor:   [15, 15, 15],
      textColor:   [200, 200, 200],
      fontSize:    8.5,
      cellPadding: 4,
      lineWidth:   0,
      font:        'Inter',
    },
    headStyles: {
      fillColor: [20, 20, 20],
      textColor: [74, 222, 128],
      fontStyle: 'bold',
      fontSize:  8,
      lineWidth: 0,
      font:      'Inter',
    },
    alternateRowStyles: {
      fillColor: [18, 18, 18],
    },
    margin: {
      left: MARGIN,
      right: MARGIN,
    },
    willDrawPage: (data) => {
      if (data.pageNumber > 1) {
        fillPage(data.doc);
      }
    },
  };
}

const rupees = n => `₹${Number(n).toFixed(Number(n) < 10 ? 2 : 0)}`;
const sumOf  = (list, key) => list.reduce((a, e) => a + parseFloat(e[key] || 0), 0);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const MAX_HISTORY_ROWS = 500;

function table(doc, y, head, body) {
  autoTable(doc, { startY: y, head: [head], body, ...atStyles(doc) });
  return doc.lastAutoTable.finalY + 8;
}

function total(doc, y, text) {
  setBold(doc, 8);
  doc.setTextColor(BRAND);
  doc.text(text, MARGIN, y);
  return y + 8;
}

export async function exportPDF({ deviceId, deviceName, settings, profile, readings, optimizations, environmental, analysis, savings }) {
  const name = deviceName && deviceName !== deviceId ? `${deviceName} (${deviceId})` : deviceId;
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  await registerFonts(doc);

  doc.setProperties({
    title:    `Atmos report for ${name}`,
    subject:  'Room report generated by Atmos Intelligence',
    author:   profile?.display_name ? `${profile.display_name} (@${profile.username})` : 'Atmos Intelligence',
    keywords: 'atmos, energy, optimization, sensors, sustainability, India',
    creator:  'Atmos Intelligence',
  });

  const logo = await loadLogo();
  fillPage(doc);
  let y = MARGIN;

  if (logo) {
    const logoH = 8;
    doc.addImage(logo.data, 'PNG', MARGIN, y, (logo.w / logo.h) * logoH, logoH);
    setBody(doc, 7);
    doc.setTextColor(FG_DIM);
    doc.text(fmtDate(), PAGE_W - MARGIN, y + 5, { align: 'right' });
    y += logoH + 10;
  } else {
    setBody(doc, 7);
    doc.setTextColor(FG_DIM);
    doc.text(fmtDate(), PAGE_W - MARGIN, y + 5, { align: 'right' });
    y += 16;
  }

  setRule(doc);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 12;

  setHeading(doc, 26);
  doc.setTextColor(FG);
  doc.text('Room report', MARGIN, y);
  y += 12;

  const meta = [
    ['Device', name],
    profile?.display_name ? ['Prepared for', `${profile.display_name}${profile.username ? ` (@${profile.username})` : ''}`] : null,
    settings ? ['Electricity rate', `₹${settings.tariff} per kWh${settings.own?.tariff ? '' : ' (default)'}`] : null,
    settings ? ['Monthly use', settings.monthlyKwh != null ? `${settings.monthlyKwh} kWh, entered by the owner` : `${settings.monthlyKwhDefault} kWh, typical for a 20 m² room (assumed)`] : null,
    settings?.latitude != null ? ['Location', 'Set, rounded for weather lookups'] : null,
  ].filter(Boolean);
  for (const [label, value] of meta) {
    setBold(doc, 9);
    doc.setTextColor(FG);
    doc.text(`${label}:`, MARGIN, y);
    setBody(doc, 9);
    doc.setTextColor(FG_DIM);
    doc.text(String(value), MARGIN + 34, y);
    y += 6.5;
  }
  y += 4;

  setRule(doc);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 12;

  // What you have saved (only recommendations marked as done)
  y = sectionTitle(doc, y, 'What you have saved');
  y = intro(doc, y, savings?.count
    ? `You have marked ${plural(savings.count, 'recommendation')} as done. Their estimated saving is counted below.`
    : 'No recommendations have been marked as done yet. Savings appear here once you act on a recommendation and mark it as done.');
  y = statBlock(doc, y, [
    { value: rupees(savings?.inr ?? 0),                  label: 'Money saved',  sub: `At ₹${settings?.tariff ?? 10} per kWh` },
    { value: `${(savings?.kwh ?? 0).toFixed(1)} kWh`,     label: 'Energy saved', sub: 'Estimated' },
    { value: `${(savings?.co2Kg ?? 0).toFixed(1)} kg`,    label: 'CO₂ avoided',  sub: '0.727 kg per kWh' },
    { value: String(savings?.trees ?? 0),                 label: 'Trees’ worth', sub: '24 kg CO₂ per tree a year' },
  ]);

  setBody(doc, 8);
  doc.setTextColor(FG_MUTED);
  const note = 'About these numbers: Atmos sensors measure temperature, humidity, light and whether the room is occupied. They do not measure electricity. Energy and rupee figures are estimates built from typical appliance loads, scaled to the monthly use above.';
  const noteLines = doc.splitTextToSize(note, COL_W);
  doc.text(noteLines, MARGIN, y);
  y += noteLines.length * 4.2 + 8;

  if (optimizations?.length) {
    y = checkY(doc, y, 20);
    y = sectionTitle(doc, y, `${plural(optimizations.length, 'recommendation')} right now`);
    const count = sev => optimizations.filter(o => o.severity === sev).length;
    setBody(doc, 8.5);
    doc.setTextColor(FG_DIM);
    doc.text(`${count('critical')} critical   ${count('warning')} warnings   ${count('info')} informational`, MARGIN, y);
    y += 8;
  }

  // Recommendations
  y = addPage(doc);
  y = sectionTitle(doc, y, 'Recommendations');
  y = intro(doc, y, 'What Atmos suggests you do, grouped by area. Each one has a severity and, where it applies, an estimated saving.');
  y += 2;

  if (!optimizations?.length) {
    y = noDataNote(doc, y, 'Nothing to act on right now.');
  } else {
    const grouped = {};
    for (const opt of optimizations) (grouped[opt.group] ??= []).push(opt);
    for (const [group, opts] of Object.entries(grouped)) {
      y = checkY(doc, y, 16);
      setBold(doc, 9);
      doc.setTextColor(...(GROUP_COLOR[group] ?? [150, 150, 150]));
      doc.text(group, MARGIN, y);
      y += 6;
      for (const opt of opts) y = optimizationBlock(doc, y, opt) + 2;
      y += 6;
    }
  }

  // Lighting
  if (analysis?.lighting) {
    const { l1Events, l2Events } = analysis.lighting;
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Lighting');
    y = intro(doc, y, 'Atmos compares light levels and occupancy to find lights left on in an empty room after dark, and daytime hours when daylight alone is enough. Wattage is assumed, not measured.');
    y = statBlock(doc, y, [
      { value: String(l1Events.length), label: 'Empty-room events', sub: 'Lights likely on, nobody in' },
      { value: String(l2Events.length), label: 'Daylight events',   sub: 'Bright enough to switch off' },
      { value: rupees(sumOf(l1Events, 'waste')),  label: 'Waste estimate',   sub: 'Empty-room events' },
      { value: rupees(sumOf(l2Events, 'saving')), label: 'Saving estimate',  sub: 'Daylight events' },
    ]);
    y += 4;

    y = checkY(doc, y, 30);
    y = sectionSubtitle(doc, y, 'Lights on in an empty room');
    if (l1Events.length) {
      y = table(doc, y, ['When', 'Empty for', 'Daylight', 'Estimated waste'],
        l1Events.map(e => [fmtTimestamp(e.timestamp), `${e.vacantMins} min`, `${e.lux} lux`, rupees(e.waste)]));
    } else y = noDataNote(doc, y, 'None found.');

    y = checkY(doc, y, 30);
    y = sectionSubtitle(doc, y, 'Daylight is enough');
    if (l2Events.length) {
      y = table(doc, y, ['When', 'Daylight', 'Possible saving'],
        l2Events.map(e => [fmtTimestamp(e.timestamp), `${e.lux} lux`, rupees(e.saving)]));
    } else y = noDataNote(doc, y, 'None found.');
  }

  // Temperature and humidity
  if (analysis?.hvac) {
    const { t1Events, t2Events, t3Events } = analysis.hvac;
    const list = [...(readings ?? [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const avg = key => {
      const v = list.map(r => parseFloat(r[key])).filter(Number.isFinite);
      return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
    };
    const lastOf = key => { const n = parseFloat(list.at(-1)?.[key]); return Number.isFinite(n) ? n : null; };
    const f = (n, d = 1, u = '') => (n == null ? '—' : `${n.toFixed(d)}${u}`);

    y = addPage(doc);
    y = sectionTitle(doc, y, 'Temperature and humidity');
    y = intro(doc, y, 'Atmos looks for an AC that seems to be cooling an empty room, times when the air outside could do the job, and humidity outside 30–70%. The comfort band for temperature is 22–30 °C.');
    y = statBlock(doc, y, [
      { value: f(lastOf('temperature'), 1, ' °C'), label: 'Temperature now',     sub: `Average ${f(avg('temperature'), 1, ' °C')}` },
      { value: f(lastOf('humidity'), 0, ' %'),     label: 'Humidity now',        sub: `Average ${f(avg('humidity'), 0, ' %')}` },
      { value: String(t1Events.length),            label: 'AC in empty room',    sub: 'Likely events' },
      { value: String(t2Events.length),            label: 'Open-window chances', sub: 'Cooler and dry outside' },
    ]);
    y += 4;

    y = checkY(doc, y, 30);
    y = sectionSubtitle(doc, y, 'AC apparently running in an empty room');
    if (t1Events.length) {
      y = table(doc, y, ['When', 'Empty for', 'Room temperature', 'Estimated waste'],
        t1Events.map(e => [fmtTimestamp(e.timestamp), `${e.vacantMins} min`, `${e.temp} °C`, rupees(e.waste)]));
      y = total(doc, y - 2, `Estimated waste across these events: ${rupees(sumOf(t1Events, 'waste'))}`);
    } else y = noDataNote(doc, y, 'None found.');

    y = checkY(doc, y, 30);
    y = sectionSubtitle(doc, y, 'Open a window instead');
    if (t2Events.length) {
      y = table(doc, y, ['When', 'Inside', 'Outside', 'Saving per hour'],
        t2Events.map(e => [fmtTimestamp(e.timestamp), `${e.indoorTemp} °C`, `${e.outdoorTemp} °C`, rupees(e.estimatedSaving)]));
    } else y = noDataNote(doc, y, 'None found. This check only uses fresh readings.');

    y = checkY(doc, y, 30);
    y = sectionSubtitle(doc, y, 'Humidity outside 30–70%');
    if (t3Events.length) {
      y = table(doc, y, ['When', 'Humidity', 'Too'],
        t3Events.map(e => [fmtTimestamp(e.timestamp), `${e.humidity} %`, e.high ? 'Humid' : 'Dry']));
    } else y = noDataNote(doc, y, 'None found.');
  }

  // Standby
  if (analysis?.standby) {
    const { s1Events } = analysis.standby;
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Standby');
    y = intro(doc, y, 'Devices such as chargers, monitors and printers keep drawing a little power when nobody uses them. Atmos flags daytime stretches where the room stayed empty for several hours. The load is assumed at about 45 W, not measured.');
    y = statBlock(doc, y, [
      { value: String(s1Events.length),                 label: 'Long empty stretches', sub: 'Daytime only' },
      { value: rupees(sumOf(s1Events, 'intervalCost')), label: 'Estimated cost',       sub: 'While the room sat empty' },
    ]);
    y += 4;
    if (s1Events.length) {
      const rows = s1Events.slice(-60).reverse().map(e => [fmtTimestamp(e.timestamp), `${e.emptyHours} h`, rupees(e.intervalCost)]);
      y = table(doc, y, ['When', 'Empty for', 'Estimated cost'], rows);
      if (s1Events.length > 60) y = noDataNote(doc, y - 4, `Showing the latest 60 of ${s1Events.length} events.`);
    } else y = noDataNote(doc, y, 'None found.');
  }

  // Trends
  if (analysis?.trends) {
    const { trend1, trend2, dailyBreakdown } = analysis.trends;
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Trends');
    y = intro(doc, y, 'Is avoidable energy going up or down, and at what hour does most of it happen? Avoidable energy is what the rules above flagged, summed per day, so it is an estimate.');
    y = statBlock(doc, y, [
      { value: trend1 ? `${trend1.thisKwh} kWh` : '—', label: 'Avoidable this week', sub: trend1 ? `Last week ${trend1.lastKwh} kWh` : 'Needs two weeks of data' },
      { value: trend1 ? `${Number(trend1.changePct) > 0 ? '+' : ''}${trend1.changePct}%` : '—', label: 'Week on week' },
      { value: trend2 ? `${trend2.hour % 12 || 12} ${trend2.hour >= 12 ? 'PM' : 'AM'}` : '—', label: 'Waste peaks at', sub: trend2 ? `${trend2.share}% of the waste` : undefined },
    ]);
    y += 4;
    if (dailyBreakdown?.length) {
      y = sectionSubtitle(doc, y, 'Last 7 days');
      y = table(doc, y, ['Day', 'Occupied', 'Empty', 'Avoidable energy', 'Readings'],
        [...dailyBreakdown].reverse().map(d => [d.date, `${d.occupiedH} h`, `${d.emptyH} h`, `${Number(d.wasteKwh).toFixed(2)} kWh`, String(d.readings)]));
    }
  }

  // Against the benchmark
  if (environmental) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Against the benchmark');
    y = intro(doc, y, `The Bureau of Energy Efficiency (BEE) benchmark is 180 kWh per m² a year, about ${environmental.benchmarkMonthlyKwh} kWh a month for a 20 m² room. Your estimate uses ${environmental.monthlyKwhKnown ? `the ${environmental.monthlyKwh} kWh a month you entered` : 'an assumed monthly figure, because none was entered'}. CO₂ uses the grid factor of 0.727 kg per kWh.`);
    y = statBlock(doc, y, [
      { value: `${environmental.estimatedKwh} kWh`, label: 'Estimated use', sub: `Last ${environmental.periodDays} days` },
      { value: `${environmental.benchmarkKwh} kWh`, label: 'BEE benchmark', sub: 'Same days' },
      { value: `${environmental.avoidableKwh} kWh`, label: 'Avoidable',     sub: 'Flagged by the rules' },
    ]);
    y += 4;
    y = sectionSubtitle(doc, y, 'Week by week');
    y = table(doc, y, ['Week', 'Estimated use (kWh)', 'Benchmark (kWh)', 'Avoidable (kWh)'],
      (environmental.weeklyData ?? []).map(w => [w.week, w.hasData ? w.kwh : '—', w.hasData ? w.baseline : '—', w.hasData ? w.avoidable : '—']));
  }

  // Readings
  if (readings?.length) {
    const sorted = [...readings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const shown  = sorted.slice(0, MAX_HISTORY_ROWS);
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Sensor history');
    y = intro(doc, y, shown.length < sorted.length
      ? `The latest ${shown.length} of ${sorted.length} readings, newest first. Download the JSON export for all of them.`
      : `All ${sorted.length} readings, newest first, exactly as the device sent them.`);
    autoTable(doc, {
      startY: y,
      head: [['Time', 'Temperature (°C)', 'Humidity (%)', 'Light (lux)', 'Occupancy']],
      body: shown.map(r => [
        fmtTimestamp(r.timestamp),
        r.temperature ?? '—',
        r.humidity    ?? '—',
        r.light       ?? '—',
        (r.occupancy === 'true' || r.occupancy === true) ? 'Occupied' : 'Empty',
      ]),
      ...atStyles(doc),
      styles:     { ...atStyles(doc).styles, fontSize: 7.5, cellPadding: 2.2 },
      headStyles: { ...atStyles(doc).headStyles, fontSize: 7.2 },
      columnStyles: { 0: { cellWidth: 42 } },
    });
  }

  addFooter(doc, doc.getNumberOfPages());
  doc.save(`Atmos report for ${deviceName || deviceId}.pdf`);
}

export function exportJSON({ deviceId, deviceName, settings, readings, optimizations, savings }) {
  const sorted = [...(readings ?? [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const num = v => (v != null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

  const payload = {
    meta: {
      device_id:    deviceId,
      name:         deviceName ?? deviceId,
      exported_at:  new Date().toISOString(),
      record_count: sorted.length,
      generated_by: 'Atmos Intelligence',
      note:         'Atmos sensors report temperature, humidity, light and occupancy. Energy and rupee figures are estimates.',
    },
    settings: settings ? {
      rate_per_kwh: settings.tariff,
      monthly_kwh:  settings.monthlyKwh,
      has_location: settings.latitude != null,
    } : undefined,
    savings_confirmed: savings ? {
      recommendations_done: savings.count,
      money_inr:  Number(savings.inr.toFixed(2)),
      energy_kwh: Number(savings.kwh.toFixed(2)),
      co2_kg:     Number(savings.co2Kg.toFixed(2)),
    } : undefined,
    optimizations: (optimizations ?? []).map(opt => ({
      group:      opt.group,
      severity:   opt.severity,
      title:      opt.title,
      message:    opt.message,
      saving_inr: num(opt.saving?.inr),
      timestamp:  opt.timestamp,
    })),
    readings: sorted.map(r => ({
      timestamp:   r.timestamp,
      temperature: num(r.temperature),
      humidity:    num(r.humidity),
      light:       num(r.light),
      occupancy:   r.occupancy === 'true' || r.occupancy === true || r.occupancy === 1,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `Atmos data for ${deviceName || deviceId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
