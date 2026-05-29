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
  } else {
    y += 7;
  }

  setRule(doc);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 12;

  if (environmental) {
    y = sectionTitle(doc, y, 'Summary');
    y = intro(doc, y,
      `This device consumed ${environmental.actualKwh} kWh this month against a BEE benchmark of ${environmental.baselineKwh} kWh — saving ${environmental.savedKwh} kWh, preventing ${environmental.co2KgSaved} kg of CO₂, and saving ₹${environmental.moneySavedINR}. This is equivalent to ${environmental.treesEquiv} ${environmental.treesEquiv === '1' ? 'tree' : 'trees'} absorbing carbon for a year.`
    );

    y = sectionTitle(doc, y, 'Environmental impact this month');
    y = statBlock(doc, y, [
      { value: `${environmental.savedKwh} kWh`, label: 'Energy saved',      sub: `vs benchmark of ${environmental.baselineKwh} kWh` },
      { value: `${environmental.co2KgSaved} kg`, label: 'CO₂ prevented',    sub: 'At 0.727 kg per kWh' },
      { value: `₹${environmental.moneySavedINR}`, label: 'Money saved',     sub: 'Per your tariff rate' },
      { value: `${environmental.treesEquiv}`,     label: 'Trees equivalent', sub: 'FAO: 24 kg CO₂/yr'  },
    ]);
    y += 6;
  }

  if (optimizations?.length) {
    y = checkY(doc, y, 20);
    y = sectionTitle(doc, y, `${optimizations.length} recommendation${optimizations.length !== 1 ? 's' : ''} detected`);
    const crit = optimizations.filter(o => o.severity === 'critical').length;
    const warn = optimizations.filter(o => o.severity === 'warning').length;
    const info = optimizations.filter(o => o.severity === 'info').length;
    setBody(doc, 8.5);
    doc.setTextColor(FG_DIM);
    doc.text(`${crit} critical   ${warn} warnings   ${info} informational`, MARGIN, y);
    y += 8;

    const legendItems = [
      { label: 'Critical', color: SEVERITY_COLOR.critical },
      { label: 'Warning',  color: SEVERITY_COLOR.warning  },
      { label: 'Info',     color: SEVERITY_COLOR.info     },
    ];
    legendItems.forEach((item, i) => {
      const x = MARGIN + i * 55;
      doc.setFillColor(...item.color);
      doc.roundedRect(x, y, 6, 4, 1, 1, 'F');
      setBody(doc, 7.5);
      doc.setTextColor(FG_DIM);
      doc.text(item.label, x + 8, y + 3.5);
    });
    y += 10;
  }

  y = addPage(doc);
  y = sectionTitle(doc, y, 'Recommendations');
  y = intro(doc, y, 'The following recommendations were generated by the Atmos Intelligence engine based on your sensor data. Each recommendation includes the affected category, severity level, a plain-English explanation, and an estimated saving where applicable.');
  y += 2;

  if (!optimizations?.length) {
    y = noDataNote(doc, y, 'No recommendations fired for this device based on available data.');
  } else {
    const grouped = {};
    for (const opt of optimizations) {
      if (!grouped[opt.group]) grouped[opt.group] = [];
      grouped[opt.group].push(opt);
    }
    for (const [group, opts] of Object.entries(grouped)) {
      y = checkY(doc, y, 16);
      setBold(doc, 9);
      doc.setTextColor(...(GROUP_COLOR[group] ?? [150, 150, 150]));
      doc.text(group, MARGIN, y);
      y += 6;
      for (const opt of opts) {
        y = optimizationBlock(doc, y, opt);
        y += 2;
      }
      y += 6;
    }
  }

  if (analysis?.lighting) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Lighting analysis');
    y = intro(doc, y, 'Lighting systems were analysed using occupancy signals, ambient lux readings, and power usage to identify unnecessary energy consumption and daylight optimisation opportunities. The idle baseline represents the average power draw during unoccupied night-time hours when no lights are on, used as a reference to detect abnormal loads.');

    const { l1Events, l2Events, idleBaseline } = analysis.lighting;
    const l1Waste = l1Events.reduce((a, e) => a + parseFloat(e.waste || 0), 0);
    const l2Save  = l2Events.reduce((a, e) => a + parseFloat(e.saving || 0), 0);

    y = statBlock(doc, y, [
      { value: `${idleBaseline.toFixed(0)} W`, label: 'Idle baseline',        sub: 'Night-time base load'      },
      { value: String(l1Events.length),         label: 'Empty room events',    sub: 'Lights on whilst vacant'   },
      { value: String(l2Events.length),         label: 'Daylight opportunities', sub: 'Artificial light redundant' },
      { value: `₹${l1Waste.toFixed(2)}`,        label: 'Total L1 waste est.',  sub: 'Across all empty events'  },
    ]);
    y += 6;

    if (l1Events.length) {
      y = checkY(doc, y, 30);
      y = sectionSubtitle(doc, y, 'Empty room events (L1)');
      y = intro(doc, y, `Detected ${l1Events.length} instance${l1Events.length !== 1 ? 's' : ''} where the room was unoccupied for three or more consecutive readings whilst power draw remained significantly above the idle baseline, suggesting lights or non-essential equipment were left running.`);
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Vacant for', 'Power draw', 'Idle baseline', 'Estimated waste']],
        body: l1Events.map(e => [
          fmtTimestamp(e.timestamp),
          `${e.vacantMins} min`,
          `${e.power} W`,
          `${idleBaseline.toFixed(0)} W`,
          `₹${e.waste}`,
        ]),
        ...atStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
      setBold(doc, 8);
      doc.setTextColor(BRAND);
      doc.text(`Total estimated waste across all L1 events: ₹${l1Waste.toFixed(2)}`, MARGIN, y);
      y += 8;
    } else {
      y = noDataNote(doc, y, 'No empty-room lighting events detected during the analysis period.');
    }

    y = checkY(doc, y, 30);
    if (l2Events.length) {
      y = sectionSubtitle(doc, y, 'Daylight harvesting opportunities (L2)');
      y = intro(doc, y, `Detected ${l2Events.length} instance${l2Events.length !== 1 ? 's' : ''} where ambient light exceeded 400 lux — sufficient for comfortable work — whilst artificial lighting remained active. Switching off artificial lights during these periods could reduce energy consumption.`);
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Natural light', 'Power draw', 'Potential saving']],
        body: l2Events.map(e => [
          fmtTimestamp(e.timestamp),
          `${e.lux} lux`,
          `${e.power} W`,
          `₹${e.saving}`,
        ]),
        ...atStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
      setBold(doc, 8);
      doc.setTextColor(BRAND);
      doc.text(`Total potential saving from daylight harvesting: ₹${l2Save.toFixed(2)}`, MARGIN, y);
      y += 8;
    } else {
      y = noDataNote(doc, y, 'No daylight harvesting opportunities detected.');
    }
  }

  if (analysis?.hvac) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Temperature & humidity');
    y = intro(doc, y, 'Temperature, humidity, and HVAC behaviour were evaluated to detect inefficient conditioning patterns, natural ventilation opportunities, and indoor comfort anomalies. The comfort band used is 22–30°C for temperature and 30–70% for relative humidity, aligned with Indian building comfort standards.');

    const { t1Events, t2Events, t3Events } = analysis.hvac;
    const readings = analysis.hvac.readings ?? [];
    const sorted   = [...readings].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const latestTemp = parseFloat(sorted.at(-1)?.temperature ?? 0);
    const latestHum  = parseFloat(sorted.at(-1)?.humidity ?? 0);
    const avgTemp    = sorted.length ? sorted.reduce((a, r) => a + parseFloat(r.temperature || 0), 0) / sorted.length : 0;
    const avgHum     = sorted.length ? sorted.reduce((a, r) => a + parseFloat(r.humidity || 0), 0) / sorted.length : 0;

    y = statBlock(doc, y, [
      { value: `${latestTemp.toFixed(1)}°C`, label: 'Latest temperature', sub: latestTemp < 22 ? 'Below comfort band' : latestTemp > 30 ? 'Above comfort band' : 'Within comfort band' },
      { value: `${avgTemp.toFixed(1)}°C`,    label: 'Average temperature' },
      { value: `${latestHum.toFixed(0)}%`,   label: 'Latest humidity', sub: latestHum > 72 ? 'Too humid' : latestHum < 28 ? 'Too dry' : 'Comfortable' },
      { value: `${avgHum.toFixed(0)}%`,      label: 'Average humidity' },
    ]);
    y += 6;

    if (t1Events.length) {
      y = checkY(doc, y, 30);
      y = sectionSubtitle(doc, y, 'HVAC conditioning empty room (T1)');
      y = intro(doc, y, `Detected ${t1Events.length} instance${t1Events.length !== 1 ? 's' : ''} where the room was unoccupied for three or more readings whilst temperature sat outside the 22–30°C comfort band, suggesting active conditioning of an empty space.`);
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Temperature', 'Comfort band']],
        body: t1Events.map(e => [fmtTimestamp(e.timestamp), `${e.temp} °C`, parseFloat(e.temp) < 22 ? 'Below (< 22°C)' : 'Above (> 30°C)']),
        ...atStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      y = noDataNote(doc, y, 'No empty-room HVAC conditioning events detected.');
    }

    y = checkY(doc, y, 30);
    if (t2Events.length) {
      const t2Save = t2Events.reduce((a, e) => a + parseFloat(e.estimatedSaving || 0), 0);
      y = sectionSubtitle(doc, y, 'Natural ventilation opportunities (T2)');
      y = intro(doc, y, `Detected ${t2Events.length} instance${t2Events.length !== 1 ? 's' : ''} where outdoor conditions were cooler and dry whilst indoor temperature exceeded 27°C and active cooling was inferred from power draw. Opening windows could have replaced air conditioning during these periods.`);
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Indoor temp', 'Outdoor temp', 'Power draw', 'Est. saving/hr']],
        body: t2Events.map(e => [fmtTimestamp(e.timestamp), `${e.indoorTemp} °C`, `${e.outdoorTemp} °C`, `${e.power} W`, `₹${e.estimatedSaving}`]),
        ...atStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
      setBold(doc, 8);
      doc.setTextColor(BRAND);
      doc.text(`Total potential saving from natural ventilation: ₹${t2Save.toFixed(2)}`, MARGIN, y);
      y += 8;
    } else {
      y = noDataNote(doc, y, 'No natural ventilation opportunities detected.');
    }

    y = checkY(doc, y, 30);
    if (t3Events.length) {
      y = sectionSubtitle(doc, y, 'Humidity anomalies (T3)');
      y = intro(doc, y, `Detected ${t3Events.length} humidity reading${t3Events.length !== 1 ? 's' : ''} outside the comfortable 30–70% range. High humidity increases the cooling load required to maintain thermal comfort, whilst low humidity causes discomfort and static build-up.`);
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Humidity', 'Condition', 'Impact']],
        body: t3Events.map(e => [
          fmtTimestamp(e.timestamp),
          `${e.humidity} %`,
          e.high ? 'Too humid' : 'Too dry',
          e.high ? 'Increased AC load' : 'Discomfort, static build-up',
        ]),
        ...atStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      y = noDataNote(doc, y, 'No humidity anomalies detected.');
    }
  }

  if (analysis?.power) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Power usage');
    y = intro(doc, y, 'Power consumption data was assessed to identify phantom loads, statistical anomalies, voltage irregularities, and opportunities to reduce unnecessary electrical usage. The standby floor of 80 W is used as a baseline — any sustained consumption above this level in an empty room is considered indicative of active waste.');

    const { p1Events, p2Events, p3Events, avgPower, maxPower, totalEnergy } = analysis.power;
    const p2Cost = p2Events.reduce((a, e) => a + parseFloat(e.cost || 0), 0);

    y = statBlock(doc, y, [
      { value: `${avgPower.toFixed(0)} W`,      label: 'Average power'   },
      { value: `${maxPower.toFixed(0)} W`,      label: 'Peak power'      },
      { value: `${totalEnergy.toFixed(2)} kWh`, label: 'Total energy'    },
      { value: String(p2Events.length),          label: 'Phantom load events', sub: 'Room empty >4 hrs, >80 W' },
    ]);
    y += 6;

    if (p1Events.length) {
      y = checkY(doc, y, 25);
      y = sectionSubtitle(doc, y, 'Power spike anomalies (P1)');
      y = intro(doc, y, `Detected ${p1Events.length} statistically unusual power spike${p1Events.length !== 1 ? 's' : ''} with a z-score exceeding 2.5 standard deviations above the historical average for that hour of the week. This may indicate unexpected appliance activation or a circuit fault.`);
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Current power', 'Historical avg', 'Z-score']],
        body: p1Events.map(e => [fmtTimestamp(e.timestamp), `${e.power} W`, `${e.avg} W`, e.z]),
        ...atStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      y = noDataNote(doc, y, 'No statistical power spikes detected.');
    }

    y = checkY(doc, y, 30);
    if (p2Events.length) {
      y = sectionSubtitle(doc, y, 'Phantom load events (P2)');
      y = intro(doc, y, `Detected ${p2Events.length} period${p2Events.length !== 1 ? 's' : ''} where the room remained unoccupied for more than four hours whilst consuming above 80 W, suggesting appliances were left running unnecessarily.`);
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Empty for', 'Power draw', 'Estimated cost']],
        body: p2Events.map(e => [fmtTimestamp(e.timestamp), `${e.emptyHours} hr`, `${e.power} W`, `₹${e.cost}`]),
        ...atStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
      setBold(doc, 8);
      doc.setTextColor(BRAND);
      doc.text(`Total estimated phantom load cost: ₹${p2Cost.toFixed(2)}`, MARGIN, y);
      y += 8;
    } else {
      y = noDataNote(doc, y, 'No phantom load events detected.');
    }

    y = checkY(doc, y, 30);
    if (p3Events.length) {
      y = sectionSubtitle(doc, y, 'Voltage irregularities (P3)');
      y = intro(doc, y, `Detected ${p3Events.length} voltage reading${p3Events.length !== 1 ? 's' : ''} outside the stable Indian range of 210–245 V. Supply irregularities reduce appliance efficiency and shorten equipment lifespan.`);
      autoTable(doc, {
        startY: y,
        head: [['Detected at', 'Voltage', 'Condition', 'Risk']],
        body: p3Events.map(e => [
          fmtTimestamp(e.timestamp),
          `${e.voltage} V`,
          e.low ? 'Too low (< 210 V)' : 'Too high (> 245 V)',
          'Appliance degradation',
        ]),
        ...atStyles(),
      });
      y = doc.lastAutoTable.finalY + 8;
    } else {
      y = noDataNote(doc, y, 'No voltage irregularities detected.');
    }
  }

  if (analysis?.trends) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Trends & predictions');
    y = intro(doc, y, 'Historical power consumption was analysed to identify week-over-week changes and long-term degradation signals. Week-over-week consumption is flagged when it rises more than 8% without a corresponding change in occupancy patterns. Predictive degradation uses linear regression over 14 days of occupied-hours data, with an R² threshold of 0.6 to filter noise.');

    const { trend1, trend2, avgPowerThisWeek, avgPowerLastWeek, dailyBreakdown } = analysis.trends;

    y = statBlock(doc, y, [
      { value: `${avgPowerThisWeek.toFixed(0)} W`,  label: 'This week avg power' },
      { value: `${avgPowerLastWeek.toFixed(0)} W`,  label: 'Last week avg power' },
      { value: trend1 ? `${trend1.changePct > 0 ? '+' : ''}${trend1.changePct}%` : '—', label: 'Week-on-week change', sub: trend1?.rising ? 'Above 8% threshold' : 'Within normal range' },
      { value: trend2 ? `${trend2.slope} W/day` : '—', label: 'Degradation rate', sub: trend2 ? `R² = ${trend2.r2}` : 'No consistent signal' },
    ]);
    y += 6;

    if (trend1) {
      y = checkY(doc, y, 25);
      y = sectionSubtitle(doc, y, 'Week-over-week comparison');
      y = intro(doc, y, trend1.rising
        ? `Consumption this week (${trend1.thisKwh} kWh) is ${trend1.changePct}% higher than last week (${trend1.lastKwh} kWh) — an increase of ${trend1.delta} kWh. No corresponding change in occupancy was detected, suggesting a new high-draw appliance or equipment inefficiency.`
        : `Week-over-week consumption is within the normal 8% variance threshold. This week: ${trend1.thisKwh} kWh, last week: ${trend1.lastKwh} kWh.`
      );
    }

    if (trend2) {
      y = checkY(doc, y, 20);
      y = sectionSubtitle(doc, y, 'Predictive degradation signal');
      y = intro(doc, y, `Power draw during occupied hours has increased at a consistent rate of ${trend2.slope} W per day over the past 14 days (R² = ${trend2.r2}). This statistically consistent upward trend is characteristic of equipment degradation. Maintenance is recommended.`);
    }

    y = checkY(doc, y, 30);
    y = sectionSubtitle(doc, y, 'Daily breakdown — last 7 days');
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Average power', 'Energy consumed', 'No. of readings']],
      body: dailyBreakdown.map(d => [d.date, `${d.avgPower} W`, `${d.kwh} kWh`, String(d.readings)]),
      ...atStyles(),
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (environmental) {
    y = addPage(doc);
    y = sectionTitle(doc, y, 'Environmental savings');
    y = intro(doc, y, `Energy performance was benchmarked against the Bureau of Energy Efficiency (BEE) standard of 180 kWh/m²/year for a 20 m² room, which equates to ${environmental.baselineKwh} kWh per month. CO₂ calculations use the Central Electricity Authority grid emission factor of 0.727 kg per kWh. Carbon equivalence uses the FAO figure of 24 kg CO₂ absorbed per mature urban tree per year.`);

    y = statBlock(doc, y, [
      { value: `${environmental.actualKwh} kWh`,    label: 'Consumed',        sub: `Benchmark: ${environmental.baselineKwh} kWh` },
      { value: `${environmental.savedKwh} kWh`,     label: 'Saved',           sub: 'vs BEE benchmark'     },
      { value: `${environmental.co2KgSaved} kg`,    label: 'CO₂ prevented',   sub: 'At 0.727 kg per kWh' },
      { value: `₹${environmental.moneySavedINR}`,   label: 'Money saved',     sub: 'At your tariff rate'  },
    ]);
    y += 6;

    y = sectionSubtitle(doc, y, 'Weekly breakdown');
    autoTable(doc, {
      startY: y,
      head: [['Week', 'Consumed (kWh)', 'Saved (kWh)', 'CO₂ prevented (kg)', 'Money saved (₹)']],
      body: environmental.weeklyData.map(w => [w.week, w.kwh, w.saved, w.co2, w.money]),
      ...atStyles(),
    });
    y = doc.lastAutoTable.finalY + 10;

    y = checkY(doc, y, 20);
    setBody(doc, 8.5);
    doc.setTextColor(FG_DIM);
    const impact = `Trees equivalent: ${environmental.treesEquiv} mature urban tree${environmental.treesEquiv !== '1' ? 's' : ''} worth of CO₂ absorption per year. Tariff rate applied from your account settings.`;
    doc.text(doc.splitTextToSize(impact, COL_W), MARGIN, y);
  }

  if (readings?.length) {
    y = addPage(doc);
    y = sectionTitle(doc, y, `Sensor history — ${readings.length} readings`);
    y = intro(doc, y, 'Complete sensor reading log for the selected device, sorted from most recent to oldest. All values are as transmitted by the hardware device with no post-processing applied.');

    const sorted = [...readings].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    autoTable(doc, {
      startY: y,
      head: [[
        'Timestamp',
        'Temp (°C)',
        'Humidity (%)',
        'Power (W)',
        'Energy (kWh)',
        'Voltage (V)',
        'Light (lux)',
        'Occupied'
      ]],
      body: sorted.map(r => [
        fmtTimestamp(r.timestamp),
        r.temperature ?? '—',
        r.humidity    ?? '—',
        r.power       ?? '—',
        r.energy      ?? '—',
        r.voltage     ?? '—',
        r.light       ?? '—',
        (r.occupancy === 'true' || r.occupancy === true) ? 'Yes' : 'No',
      ]),
      ...atStyles(doc),
      styles: {
        ...atStyles(doc).styles,
        fontSize: 7.2,
        cellPadding: 2.2,
        lineWidth: 0,
      },
      headStyles: {
        ...atStyles(doc).headStyles,
        fontSize: 7,
        lineWidth: 0,
      },
      columnStyles: {
        0: { cellWidth: 38 },
      },
    });
  }

  addFooter(doc, doc.getNumberOfPages());
  doc.save(`Atmos Intelligence Report for ${deviceId}.pdf`);
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
      group:      opt.group,
      severity:   opt.severity,
      title:      opt.title,
      message:    opt.message,
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