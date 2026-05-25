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
  Power:    [239, 68,  68 ],
  Trends:   [167, 139, 250],
};

let fontsLoaded = false;

async function loadFont(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  let binary = '';

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

async function registerFonts(doc) {
  if (fontsLoaded) return;

  const inter = await loadFont('/api/fonts/inter');
  const syne  = await loadFont('/api/fonts/syne');

  doc.addFileToVFS('Inter.ttf', inter);
  doc.addFont('Inter.ttf', 'Inter', 'normal');
  doc.addFont('Inter.ttf', 'Inter', 'bold');

  doc.addFileToVFS('Syne.ttf', syne);
  doc.addFont('Syne.ttf', 'Syne', 'bold');

  fontsLoaded = true;
}

function setHeading(doc, size = 14) {
  doc.setFontSize(size);
  doc.setFont(fontsLoaded ? 'Syne' : 'helvetica', 'bold');
}

function setBody(doc, size = 10) {
  doc.setFontSize(size);
  doc.setFont(fontsLoaded ? 'Inter' : 'helvetica', 'normal');
}

function setBold(doc, size = 10) {
  doc.setFontSize(size);
  doc.setFont(fontsLoaded ? 'Inter' : 'helvetica', 'bold');
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
  const upper = text.toUpperCase();
  doc.text(upper, MARGIN, y);
  return y + 7;
}

function checkY(doc, y, needed = 20) {
  if (y + needed > PAGE_H - 20) return addPage(doc);
  return y;
}

function statBlock(doc, y, stats) {
  const colW = COL_W / stats.length;

  stats.forEach((s, i) => {
    const x = MARGIN + i * colW;

    doc.setFillColor(25, 25, 25);
    doc.roundedRect(x, y, colW - 3, 28, 3, 3, 'F');

    setHeading(doc, 16);
    doc.setTextColor(FG);

    doc.text(s.value, x + 5, y + 11);

    setBody(doc, 8.5);
    doc.setTextColor(FG_DIM);

    doc.text(s.label, x + 5, y + 18);

    if (s.sub) {
      doc.setFontSize(7);
      doc.setTextColor(FG_MUTED);

      const subLines = doc.splitTextToSize(s.sub, colW - 10);
      doc.text(subLines, x + 5, y + 23);
    }
  });

  return y + 33;
}

function optimizationBlock(doc, y, opt) {
  y = checkY(doc, y, 28);
  const sc = SEVERITY_COLOR[opt.severity] ?? [150, 150, 150];
  const gc = GROUP_COLOR[opt.group] ?? [150, 150, 150];

  doc.setFillColor(20, 20, 20);
  doc.roundedRect(MARGIN, y, COL_W, 26, 2, 2, 'F');

  doc.setFillColor(...sc);
  doc.roundedRect(MARGIN, y, 2, 26, 1, 1, 'F');

  setBold(doc, 7);
  doc.setTextColor(...gc);
  doc.text(opt.group.toUpperCase(), MARGIN + 6, y + 6);

  setBold(doc, 8.5);
  doc.setTextColor(FG);
  doc.text(opt.title, MARGIN + 6, y + 12);

  setBody(doc, 7.5);
  doc.setTextColor(FG_DIM);
  const lines = doc.splitTextToSize(opt.message, COL_W - 12);
  const linesCapped = lines.slice(0, 2);
  doc.text(linesCapped, MARGIN + 6, y + 18);

  if (opt.saving?.inr) {
    setBody(doc, 7);
    doc.setTextColor(BRAND);
    doc.text(`Estimated saving: ₹${opt.saving.inr}`, PAGE_W - MARGIN - 2, y + 6, { align: 'right' });
  }

  setBold(doc, 6.5);
  doc.setTextColor(...sc);
  doc.text(opt.severity.toUpperCase(), PAGE_W - MARGIN - 2, y + 12, { align: 'right' });

  return y + 30;
}

async function loadLogo() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width  = img.width;
      canvas.height = img.height;
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

export async function exportPDF({ deviceId, profile, readings, optimizations, environmental, analysis }) {
  const doc  = new jsPDF({ unit: 'mm', format: 'a4' });
  await registerFonts(doc);

  doc.setProperties({
    title:    `Atmos Intelligence Report for ${deviceId}`,
    subject:  'Environmental sensor data report generated by Atmos Intelligence',
    author:   profile?.display_name ? `${profile.display_name} (@${profile.username})` : 'Atmos Intelligence',
    keywords: 'atmos, energy, environment, sensors, optimisation, sustainability, India',
    creator:  'Atmos Intelligence',
  });

  const logo = await loadLogo();
  fillPage(doc);

  // ── PAGE 1: COVER ──────────────────────────────────────────────
  let y = MARGIN;

  if (logo) {
    const logoH = 8;
    const logoW = (logo.w / logo.h) * logoH;
    doc.addImage(logo.data, 'PNG', MARGIN, y, logoW, logoH);
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
  doc.text('Intelligence Report', MARGIN, y);
  y += 14;

  setBold(doc, 9);
  doc.setTextColor(FG);
  doc.text('Device:', MARGIN, y);
  setBody(doc, 9);
  doc.setTextColor(FG_DIM);
  doc.text(` ${deviceId}`, MARGIN + 16, y);
  y += 7;

  if (profile?.display_name) {
    setBold(doc, 9);
    doc.setTextColor(FG);
    doc.text('For:', MARGIN, y);
    setBody(doc, 9);
    doc.setTextColor(FG_DIM);
    doc.text(` ${profile.display_name} (@${profile.username ?? ''})`, MARGIN + 8, y);
    y += 14;
  }

  setRule(doc);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 12;

  // cover summary paragraph
  if (environmental) {
    setHeading(doc, 11);
    doc.setTextColor(FG);
    doc.text('Summary', MARGIN, y);
    y += 7;

    setBody(doc, 8.5);
    doc.setTextColor(FG_DIM);
    const summary = `This device consumed ${environmental.actualKwh} kWh this month against a BEE benchmark of ${environmental.baselineKwh} kWh — saving ${environmental.savedKwh} kWh, preventing ${environmental.co2KgSaved} kg of CO₂, and saving ₹${environmental.moneySavedINR}. This is equivalent to ${environmental.treesEquiv} ${environmental.treesEquiv === '1' ? 'tree' : 'trees'} absorbing carbon for a year.`;
    const summaryLines = doc.splitTextToSize(summary, COL_W);
    doc.text(summaryLines, MARGIN, y);
    y += summaryLines.length * 5 + 10;

    y = sectionTitle(doc, y, 'Environmental impact this month');
    y = statBlock(doc, y, [
      { value: `${environmental.savedKwh} kWh`, label: 'Energy saved',     sub: `vs BEE benchmark of ${environmental.baselineKwh} kWh` },
      { value: `${environmental.co2KgSaved} kg`, label: 'CO₂ prevented',   sub: 'At 0.727 kg per kWh'   },
      { value: `₹${environmental.moneySavedINR}`, label: 'Money saved',    sub: 'Per your tariff rate'   },
      { value: `${environmental.treesEquiv}`,     label: 'Trees equivalent', sub: 'FAO: 24 kg CO₂/yr'   },
    ]);
  }

  if (optimizations?.length) {
    y += 6;
    y = sectionTitle(doc, y, `${optimizations.length} active recommendation${optimizations.length !== 1 ? 's' : ''} detected`);
    const crit = optimizations.filter(o => o.severity === 'critical').length;
    const warn = optimizations.filter(o => o.severity === 'warning').length;
    const info = optimizations.filter(o => o.severity === 'info').length;
    setBody(doc, 8);
    doc.setTextColor(FG_DIM);
    doc.text(`${crit} critical   ${warn} warnings   ${info} informational`, MARGIN, y);
    y += 8;
  }

  // ── PAGE 2: RECOMMENDATIONS ─────────────────────────────────────
  y = addPage(doc);
  y = sectionTitle(doc, y, 'Recommendations');
  y += 2;

  if (!optimizations?.length) {
    setBody(doc, 8.5);
    doc.setTextColor(FG_DIM);
    doc.text('No recommendations fired for this device based on available data.', MARGIN, y);
    y += 10;
  } else {
    const grouped = {};
    for (const opt of optimizations) {
      if (!grouped[opt.group]) grouped[opt.group] = [];
      grouped[opt.group].push(opt);
    }
    for (const [group, opts] of Object.entries(grouped)) {
      y = checkY(doc, y, 12);
      setBold(doc, 8);
      doc.setTextColor(...(GROUP_COLOR[group] ?? [150, 150, 150]));
      doc.text(group, MARGIN, y);
      y += 5;
      for (const opt of opts) {
        y = optimizationBlock(doc, y, opt);
        y += 2;
      }
      y += 4;
    }
  }

  // ── PAGE 3: LIGHTING ─────────────────────────────────────────────
  if (analysis?.lighting) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Lighting analysis');
    y += 2;

    setBody(doc, 9);
    doc.setTextColor(FG_DIM);
    const lightingIntro =
      'Lighting systems were analyzed using occupancy signals, ambient lux readings, and real-time power usage to identify unnecessary energy consumption and daylight optimization opportunities.';
    const lightingLines = doc.splitTextToSize(lightingIntro, COL_W);
    doc.text(lightingLines, MARGIN, y);
    y += lightingLines.length * 5 + 8;

    const { l1Events, l2Events, idleBaseline } = analysis.lighting;

    y = statBlock(doc, y, [
      { value: `${idleBaseline.toFixed(0)} W`, label: 'Idle baseline',         sub: 'Night-time base load' },
      { value: String(l1Events.length),        label: 'Empty room events',      sub: 'Lights on whilst vacant' },
      { value: String(l2Events.length),        label: 'Daylight opportunities', sub: 'Artificial light redundant' },
      { value: `₹${l1Events.reduce((a, e) => a + parseFloat(e.waste), 0).toFixed(2)}`, label: 'Total L1 waste' },
    ]);
    y += 6;

    if (l1Events.length) {
      y = sectionTitle(doc, y, 'Empty room events');
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Vacant for', 'Power', 'Estimated waste']],
        body: l1Events.map(e => [fmtTimestamp(e.timestamp), `${e.vacantMins} min`, `${e.power} W`, `₹${e.waste}`]),
        ...autoTableStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (l2Events.length) {
      y = checkY(doc, y, 20);
      y = sectionTitle(doc, y, 'Daylight harvesting opportunities');
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Natural light', 'Power draw', 'Potential saving']],
        body: l2Events.map(e => [fmtTimestamp(e.timestamp), `${e.lux} lux`, `${e.power} W`, `₹${e.saving}`]),
        ...autoTableStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // ── PAGE 4: TEMPERATURE ──────────────────────────────────────────
  if (analysis?.hvac) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Temperature & humidity analysis');
    y += 2;

    setBody(doc, 9);
    doc.setTextColor(FG_DIM);
    const hvacIntro =
      'Temperature, humidity, and HVAC behaviour were evaluated to detect inefficient cooling patterns, ventilation opportunities, and indoor comfort anomalies.';
    const hvacLines = doc.splitTextToSize(hvacIntro, COL_W);
    doc.text(hvacLines, MARGIN, y);
    y += hvacLines.length * 5 + 8;

    const { t1Events, t2Events, t3Events } = analysis.hvac;

    if (t1Events.length) {
      y = sectionTitle(doc, y, 'HVAC running in empty room');
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Temperature']],
        body: t1Events.map(e => [fmtTimestamp(e.timestamp), `${e.temp} °C`]),
        ...autoTableStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (t2Events.length) {
      y = checkY(doc, y, 20);
      y = sectionTitle(doc, y, 'Natural ventilation opportunities');
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Indoor temp', 'Outdoor temp', 'Power draw', 'Est. saving/hr']],
        body: t2Events.map(e => [fmtTimestamp(e.timestamp), `${e.indoorTemp} °C`, `${e.outdoorTemp} °C`, `${e.power} W`, `₹${e.estimatedSaving}`]),
        ...autoTableStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (t3Events.length) {
      y = checkY(doc, y, 20);
      y = sectionTitle(doc, y, 'Humidity anomalies');
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Humidity', 'Condition']],
        body: t3Events.map(e => [fmtTimestamp(e.timestamp), `${e.humidity} %`, e.high ? 'Too humid' : 'Too dry']),
        ...autoTableStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (!t1Events.length && !t2Events.length && !t3Events.length) {
      setBody(doc, 8.5);
      doc.setTextColor(FG_DIM);
      doc.text('No temperature or humidity anomalies detected.', MARGIN, y);
    }
  }

  // ── PAGE 5: POWER ────────────────────────────────────────────────
  if (analysis?.power) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Power usage analysis');
    y += 2;

    setBody(doc, 9);
    doc.setTextColor(FG_DIM);
    const powerIntro =
      'Power consumption trends were assessed to identify phantom loads, abnormal voltage behaviour, and opportunities to reduce unnecessary electrical usage.';
    const powerLines = doc.splitTextToSize(powerIntro, COL_W);
    doc.text(powerLines, MARGIN, y);
    y += powerLines.length * 5 + 8;

    const { p1Events, p2Events, p3Events, avgPower, maxPower, totalEnergy } = analysis.power;

    y = statBlock(doc, y, [
      { value: `${avgPower.toFixed(0)} W`,     label: 'Average power'  },
      { value: `${maxPower.toFixed(0)} W`,     label: 'Peak power'     },
      { value: `${totalEnergy.toFixed(2)} kWh`, label: 'Total energy'  },
      { value: String(p2Events.length),         label: 'Phantom events' },
    ]);
    y += 6;

    if (p2Events.length) {
      y = sectionTitle(doc, y, 'Phantom load events');
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Empty for', 'Power draw', 'Estimated cost']],
        body: p2Events.map(e => [fmtTimestamp(e.timestamp), `${e.emptyHours} hr`, `${e.power} W`, `₹${e.cost}`]),
        ...autoTableStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    if (p3Events.length) {
      y = checkY(doc, y, 20);
      y = sectionTitle(doc, y, 'Voltage irregularities');
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Voltage', 'Condition']],
        body: p3Events.map(e => [fmtTimestamp(e.timestamp), `${e.voltage} V`, e.low ? 'Too low' : 'Too high']),
        ...autoTableStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // ── PAGE 6: TRENDS ───────────────────────────────────────────────
  if (analysis?.trends) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Trends & predictions');
    y += 2;

    setBody(doc, 9);
    doc.setTextColor(FG_DIM);
    const trendsIntro =
      'Historical sensor data was processed to evaluate consumption trends, behavioural shifts, and potential long-term degradation patterns across monitored systems.';
    const trendsLines = doc.splitTextToSize(trendsIntro, COL_W);
    doc.text(trendsLines, MARGIN, y);
    y += trendsLines.length * 5 + 8;

    const { trend1, trend2, avgPowerThisWeek, avgPowerLastWeek, dailyBreakdown } = analysis.trends;

    y = statBlock(doc, y, [
      { value: `${avgPowerThisWeek.toFixed(0)} W`, label: 'This week avg power' },
      { value: `${avgPowerLastWeek.toFixed(0)} W`, label: 'Last week avg power' },
      { value: trend1 ? `${trend1.changePct > 0 ? '+' : ''}${trend1.changePct}%` : '—', label: 'Week-on-week change', sub: trend1?.rising ? 'Above 8% threshold' : 'Within normal range' },
      { value: trend2 ? `${trend2.slope} W/day` : '—', label: 'Degradation rate', sub: trend2 ? `R² = ${trend2.r2}` : 'No signal detected' },
    ]);
    y += 6;

    y = sectionTitle(doc, y, 'Daily breakdown — last 7 days');
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Avg power', 'Energy', 'Readings']],
      body: dailyBreakdown.map(d => [d.date, `${d.avgPower} W`, `${d.kwh} kWh`, String(d.readings)]),
      ...autoTableStyles(),
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── PAGE 7: ENVIRONMENTAL SAVINGS ────────────────────────────────
  if (environmental) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Environmental savings');
    y += 2;

    setBody(doc, 9);
    doc.setTextColor(FG_DIM);
    const envIntro =
      'Environmental impact metrics were calculated against BEE efficiency benchmarks to estimate energy savings, carbon reduction, and sustainability equivalence.';
    const envLines = doc.splitTextToSize(envIntro, COL_W);
    doc.text(envLines, MARGIN, y);
    y += envLines.length * 5 + 8;

    y = statBlock(doc, y, [
      { value: `${environmental.actualKwh} kWh`,    label: 'Consumed',      sub: `Benchmark: ${environmental.baselineKwh} kWh` },
      { value: `${environmental.savedKwh} kWh`,     label: 'Saved'          },
      { value: `${environmental.co2KgSaved} kg`,    label: 'CO₂ prevented', sub: 'At 0.727 kg per kWh' },
      { value: `₹${environmental.moneySavedINR}`,   label: 'Money saved'    },
    ]);
    y += 6;

    y = sectionTitle(doc, y, 'Weekly breakdown');
    autoTable(doc, {
      startY: y,
      head: [['Week', 'Consumed', 'Saved', 'CO₂ prevented', 'Money saved']],
      body: environmental.weeklyData.map(w => [w.week, `${w.kwh} kWh`, `${w.saved} kWh`, `${w.co2} kg`, `₹${w.money}`]),
      ...autoTableStyles(),
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // ── PAGE 8: SENSOR HISTORY ───────────────────────────────────────
  if (readings?.length) {
    y = addPage(doc);
    y = sectionTitle(doc, y, `Sensor history — ${readings.length} recorded readings`);

    setBody(doc, 9);
    doc.setTextColor(FG_DIM);
    const sensorIntro =
      'Recent sensor readings captured by the Atmos Intelligence engine.';
    const sensorLines = doc.splitTextToSize(sensorIntro, COL_W);
    doc.text(sensorLines, MARGIN, y);
    y += sensorLines.length * 5 + 6;

    const sorted = [...readings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    autoTable(doc, {
      startY: y + 2,
      head: [['Timestamp', 'Temp', 'Humidity', 'Power', 'Energy', 'Voltage', 'Light', 'Occupancy']],
      body: sorted.map(r => [
        fmtTimestamp(r.timestamp),
        r.temperature != null ? `${r.temperature} °C`  : '—',
        r.humidity    != null ? `${r.humidity} %`      : '—',
        r.power       != null ? `${r.power} W`         : '—',
        r.energy      != null ? `${r.energy} kWh`      : '—',
        r.voltage     != null ? `${r.voltage} V`       : '—',
        r.light       != null ? `${r.light} lux`       : '—',
        (r.occupancy === 'true' || r.occupancy === true) ? 'Yes' : 'No',
      ]),
      ...autoTableStyles(),
    });
  }

  addFooter(doc, doc.getNumberOfPages());
  doc.save(`Atmos Intelligence Report for ${deviceId}.pdf`);
}

function autoTableStyles() {
  return {
    styles: {
      fillColor:   [15, 15, 15],
      textColor:   [200, 200, 200],
      fontSize:    8.5,
      cellPadding: 4,
      lineColor:   [50, 50, 50],
      lineWidth:   0.2,
      font:        fontsLoaded ? 'Inter' : 'helvetica',
    },
    headStyles: {
      fillColor:  [20, 20, 20],
      textColor:  [74, 222, 128],
      fontStyle:  'bold',
      fontSize:   8,
      font:       fontsLoaded ? 'Inter' : 'helvetica',
    },
    alternateRowStyles: {
      fillColor: [18, 18, 18],
    },
    margin: { left: MARGIN, right: MARGIN },
  };
}

export function exportJSON({ deviceId, readings, optimizations }) {
  const sorted = [...readings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const payload = {
    meta: {
      device_id:    deviceId,
      exported_at:  new Date().toISOString(),
      record_count: sorted.length,
      generated_by: 'Atmos Intelligence',
    },
    optimizations: (optimizations ?? []).map(opt => ({
      group:    opt.group,
      severity: opt.severity,
      title:    opt.title,
      message:  opt.message,
      saving_inr: opt.saving?.inr ? parseFloat(opt.saving.inr) : null,
      timestamp:  opt.timestamp,
    })),
    readings: sorted.map(r => ({
      timestamp:   r.timestamp,
      temperature: r.temperature != null ? parseFloat(r.temperature) : null,
      humidity:    r.humidity    != null ? parseFloat(r.humidity)    : null,
      power:       r.power       != null ? parseFloat(r.power)       : null,
      energy:      r.energy      != null ? parseFloat(r.energy)      : null,
      voltage:     r.voltage     != null ? parseFloat(r.voltage)     : null,
      light:       r.light       != null ? parseFloat(r.light)       : null,
      current:     r.current     != null ? parseFloat(r.current)     : null,
      led:         r.led         != null ? parseFloat(r.led)         : null,
      fan:         r.fan         != null ? parseFloat(r.fan)         : null,
      occupancy:   r.occupancy === 'true' || r.occupancy === true,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `Atmos Data Export for ${deviceId}.json`;
  a.click();
  URL.revokeObjectURL(url);
}