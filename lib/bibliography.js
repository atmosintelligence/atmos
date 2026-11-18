// Sources behind the figures on the Atmos site, grouped by the part of the project that uses
// them. To add a new part, add a section; to add a source, add an entry. The page
// /about/bibliography renders this list.
//
// entry: { author, title, year, publisher?, url, usedFor }

import { VERIFIED_ON } from '@/lib/subsidy/schemes';

export const BIBLIOGRAPHY = [
  {
    id: 'subsidy-calculator',
    title: 'Subsidy Calculator',
    intro: 'Scheme rules, rupee figures and the CO₂ factor used by the Subsidy Calculator.',
    accessed: VERIFIED_ON,
    entries: [
      { author: 'Ministry of New and Renewable Energy, Government of India', title: 'PM Surya Ghar: Muft Bijli Yojana (national portal)', year: 'n.d.', url: 'https://pmsuryaghar.gov.in',
        usedFor: 'Central subsidy for homes (₹30,000 per kW for 2 kW, ₹18,000 for the 3rd, maximum ₹78,000), housing societies (₹18,000 per kW) and the collateral-free solar loan.' },
      { author: 'Government of NCT of Delhi', title: 'Delhi Solar Portal and Delhi Solar Energy Policy', year: 'n.d.', url: 'https://solar.delhi.gov.in',
        usedFor: 'Delhi state top-up of up to ₹26,000 per kW for home systems up to 3 kW.' },
      { author: 'Ministry of New and Renewable Energy, Government of India', title: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyaan (PM-KUSUM)', year: 'n.d.',
        url: 'https://mnre.gov.in/en/pradhan-mantri-kisan-urja-suraksha-evam-utthaan-mahabhiyaan-pm-kusum/',
        usedFor: 'Solar pump support: 30% central and at least 30% state share (50% central in special-category states).' },
      { author: 'Ministry of Heavy Industries, Government of India', title: 'PM E-DRIVE scheme', year: 'n.d.', url: 'https://pmedrive.heavyindustries.gov.in',
        usedFor: 'Electric two-wheeler incentive of ₹2,500 per kWh of battery, up to ₹5,000 per vehicle.' },
      { author: 'Ministry of Micro, Small and Medium Enterprises, Government of India', title: 'MSE Green Investment and Financing for Transformation (MSE-GIFT)', year: 'n.d.', url: 'https://msme.gov.in',
        usedFor: '2% interest subvention on loans for energy-efficient technology.' },
      { author: 'Ministry of Micro, Small and Medium Enterprises, Government of India', title: 'Zero Defect Zero Effect (ZED) Certification Scheme', year: 'n.d.', url: 'https://zed.msme.gov.in',
        usedFor: 'Consultancy support up to ₹2 lakh and technology upgrade support up to ₹3 lakh.' },
      { author: 'Small Industries Development Bank of India (SIDBI)', title: 'End-to-End Energy Efficiency (4E) financing', year: 'n.d.', url: 'https://www.sidbi.in',
        usedFor: 'Energy efficiency loans of ₹10 lakh to ₹5 crore at 6.4% to 7.5%, and solar EMI guidance.' },
      { author: 'Bureau of Energy Efficiency, Government of India', title: 'Assistance in Deploying Energy Efficient Technologies in Industries and Establishments (ADEETIE)', year: 'n.d.', url: 'https://adeetie.beeindia.gov.in',
        usedFor: '3% to 5% interest subvention and free energy audits across 60 industrial clusters.' },
      { author: 'Bureau of Energy Efficiency, Government of India', title: 'Energy Service Companies (ESCO) and energy efficiency programmes', year: 'n.d.', url: 'https://beeindia.gov.in',
        usedFor: 'Pay-from-savings (RESCO and ESCO) route for shops, schools, offices and societies.' },
      { author: 'Government of India', title: 'myScheme: Tamil Nadu free electricity units for domestic consumers', year: 'n.d.', url: 'https://www.myscheme.gov.in',
        usedFor: '200 free units every two months for homes using 500 units or fewer.' },
      { author: 'Government of Karnataka', title: 'Seva Sindhu: Gruha Jyothi scheme', year: 'n.d.', url: 'https://sevasindhu.karnataka.gov.in',
        usedFor: 'Up to 200 free units a month for Karnataka households, tenants included.' },
      { author: 'Ministry of Corporate Affairs, Government of India', title: 'Corporate Social Responsibility under Section 135 of the Companies Act, 2013', year: 'n.d.', url: 'https://www.mca.gov.in',
        usedFor: 'CSR sponsorship route for schools, clinics, NGOs and villages.' },
      { author: 'SELCO Foundation', title: 'Energy access for low-income households and livelihoods', year: 'n.d.', url: 'https://selcofoundation.org',
        usedFor: 'Nonprofit route for low-income homes, small shops, farmers and clinics.' },
      { author: 'Central Electricity Authority, Ministry of Power, Government of India', title: 'CO₂ Baseline Database for the Indian Power Sector, User Guide, Version 20.0', year: '2024',
        url: 'https://cea.nic.in/wp-content/uploads/2021/03/User_Guide_Version_20.0.pdf',
        usedFor: 'Grid emission factor of 0.727 kg CO₂ per kWh, used for CO₂ avoided.' },
    ],
  },
];
