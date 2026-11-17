// Scheme directory for the Subsidy Calculator.
// Every entry records where the figure came from and how sure we are about it.
//   basis: 'official'  read from a government page or notification
//          'reported'  from a news or policy-tracker page that quotes a notification
//          'general'   a well-known pathway with no fixed rupee figure
// Schemes change often. The page tells people to confirm on the official portal before applying.

export const VERIFIED_ON = '17 November 2026';

export const KINDS = {
  central: { en: 'Central govt', hi: 'केंद्र सरकार', color: '#4ADE80' },
  state:   { en: 'State govt',   hi: 'राज्य सरकार',  color: '#38bdf8' },
  finance: { en: 'Cheaper loans', hi: 'सस्ता कर्ज़', color: '#fbbf24' },
  third:   { en: 'Third party',  hi: 'अन्य संस्थाएँ', color: '#c084fc' },
};

export const SCHEMES = {
  surya_ghar: {
    kind: 'central', basis: 'official',
    name: { en: 'PM Surya Ghar: Muft Bijli Yojana', hi: 'पीएम सूर्य घर: मुफ़्त बिजली योजना' },
    benefit: { en: '₹30,000 per kW for the first 2 kW, ₹18,000 for the 3rd kW. Maximum ₹78,000.', hi: 'पहले 2 kW पर ₹30,000 प्रति kW, तीसरे kW पर ₹18,000। अधिकतम ₹78,000।' },
    who: { en: 'Homes with their own roof and a domestic connection.', hi: 'अपनी छत और घरेलू कनेक्शन वाले घर।' },
    how: { en: 'Register on the national portal, pick a listed vendor, and the subsidy comes to your bank account after inspection.', hi: 'राष्ट्रीय पोर्टल पर रजिस्टर करें, सूचीबद्ध विक्रेता चुनें; निरीक्षण के बाद सब्सिडी बैंक खाते में आती है।' },
    link: 'https://pmsuryaghar.gov.in',
  },
  surya_ghar_rwa: {
    kind: 'central', basis: 'official',
    name: { en: 'PM Surya Ghar for housing societies', hi: 'पीएम सूर्य घर: हाउसिंग सोसाइटी' },
    benefit: { en: '₹18,000 per kW for lifts, corridor lights, pumps and EV charging. Up to 500 kW (3 kW per home).', hi: 'लिफ़्ट, गलियारे की बत्ती, पंप और EV चार्जिंग के लिए ₹18,000 प्रति kW। 500 kW तक (3 kW प्रति घर)।' },
    who: { en: 'Resident welfare associations and group housing societies.', hi: 'रेज़िडेंट वेलफ़ेयर एसोसिएशन और ग्रुप हाउसिंग सोसाइटी।' },
    how: { en: 'The society applies once, for common areas, on the same national portal.', hi: 'सोसाइटी एक बार, साझा क्षेत्रों के लिए, उसी पोर्टल पर आवेदन करती है।' },
    link: 'https://pmsuryaghar.gov.in',
  },
  surya_ghar_loan: {
    kind: 'finance', basis: 'reported',
    name: { en: 'Collateral-free solar loan', hi: 'बिना गारंटी का सोलर लोन' },
    benefit: { en: 'Around 7% interest for systems up to 3 kW, as announced with the scheme. Banks set the final terms.', hi: '3 kW तक के सिस्टम पर लगभग 7% ब्याज, योजना की घोषणा के अनुसार। अंतिम शर्तें बैंक तय करते हैं।' },
    who: { en: 'Home owners installing under PM Surya Ghar.', hi: 'पीएम सूर्य घर में सोलर लगाने वाले घर मालिक।' },
    how: { en: 'Ask your bank for a written sanction before you pay the vendor.', hi: 'विक्रेता को भुगतान से पहले बैंक से लिखित मंज़ूरी लें।' },
    link: 'https://pmsuryaghar.gov.in',
  },
  delhi_solar: {
    kind: 'state', basis: 'reported',
    name: { en: 'Delhi Solar Energy Policy (2026 amendment)', hi: 'दिल्ली सौर ऊर्जा नीति (2026 संशोधन)' },
    benefit: { en: 'Up to ₹26,000 per kW for systems up to 3 kW, on top of the central subsidy. State cap ₹78,000.', hi: '3 kW तक के सिस्टम पर केंद्र की सब्सिडी के ऊपर ₹26,000 प्रति kW तक। राज्य की सीमा ₹78,000।' },
    who: { en: 'Delhi homes. The policy also describes free solar up to 3 kW for homes using 400 units a month or less.', hi: 'दिल्ली के घर। नीति में 400 यूनिट प्रति माह या कम खपत वाले घरों के लिए 3 kW तक मुफ़्त सोलर का भी ज़िक्र है।' },
    how: { en: 'Apply through your DISCOM or the Delhi solar portal.', hi: 'अपनी बिजली कंपनी या दिल्ली सोलर पोर्टल से आवेदन करें।' },
    link: 'https://solar.delhi.gov.in',
  },
  gujarat_solar: {
    kind: 'state', basis: 'reported',
    name: { en: 'Surya Gujarat top-up', hi: 'सूर्य गुजरात अतिरिक्त सब्सिडी' },
    benefit: { en: 'The state pays what is left after the central subsidy. You pay 10% of the benchmark cost (5% for SC/ST homes). Systems up to 2.18 kW.', hi: 'केंद्र की सब्सिडी के बाद बचा खर्च राज्य देता है। आप बेंचमार्क लागत का 10% देते हैं (SC/ST परिवार 5%)। 2.18 kW तक के सिस्टम।' },
    who: { en: 'Residential consumers of the Gujarat power companies and Torrent Power.', hi: 'गुजरात की बिजली कंपनियों और टोरेंट पावर के घरेलू उपभोक्ता।' },
    how: { en: 'Register for PM Surya Ghar first, then apply on the Surya Gujarat portal.', hi: 'पहले पीएम सूर्य घर में रजिस्टर करें, फिर सूर्य गुजरात पोर्टल पर आवेदन करें।' },
    link: 'https://pmsuryaghar.gov.in',
  },
  e_drive: {
    kind: 'central', basis: 'reported',
    name: { en: 'PM E-DRIVE: electric two-wheelers', hi: 'पीएम ई-ड्राइव: इलेक्ट्रिक दोपहिया' },
    benefit: { en: '₹2,500 per kWh of battery, up to ₹5,000 per vehicle. Open till 31 March 2028 or until funds run out.', hi: 'बैटरी के प्रति kWh पर ₹2,500, प्रति वाहन अधिकतम ₹5,000। 31 मार्च 2028 तक या फ़ंड ख़त्म होने तक।' },
    who: { en: 'Buyers of eligible electric two-wheelers priced up to ₹1.5 lakh ex-factory.', hi: '₹1.5 लाख तक (एक्स-फ़ैक्ट्री) के पात्र इलेक्ट्रिक दोपहिया के खरीदार।' },
    how: { en: 'The dealer applies the discount at purchase. Ask for the PM E-DRIVE price.', hi: 'डीलर खरीद के समय छूट लगाता है। पीएम ई-ड्राइव वाली क़ीमत माँगें।' },
    link: 'https://pmedrive.heavyindustries.gov.in',
  },
  kusum_b: {
    kind: 'central', basis: 'official',
    name: { en: 'PM-KUSUM: solar pumps', hi: 'पीएम-कुसुम: सोलर पंप' },
    benefit: { en: 'Centre pays 30% and the state at least 30%, so the farmer pays about 40%. In hill, island and north-eastern states the centre pays 50%.', hi: 'केंद्र 30% और राज्य कम से कम 30% देता है, यानी किसान लगभग 40%। पहाड़ी, द्वीपीय और पूर्वोत्तर राज्यों में केंद्र 50% देता है।' },
    who: { en: 'Farmers with an agricultural pump. Up to 30% of your share can be a bank loan.', hi: 'कृषि पंप वाले किसान। आपके हिस्से का 30% तक बैंक लोन हो सकता है।' },
    how: { en: 'Apply through your state nodal agency. State windows open at different times.', hi: 'अपने राज्य की नोडल एजेंसी से आवेदन करें। राज्यों की खिड़की अलग-अलग समय पर खुलती है।' },
    link: 'https://mnre.gov.in/en/pradhan-mantri-kisan-urja-suraksha-evam-utthaan-mahabhiyaan-pm-kusum/',
  },
  mse_gift: {
    kind: 'central', basis: 'reported',
    name: { en: 'MSE-GIFT: green technology', hi: 'MSE-GIFT: हरित तकनीक' },
    benefit: { en: '2% interest subvention on loans for energy-efficient technology.', hi: 'ऊर्जा-कुशल तकनीक के लोन पर 2% ब्याज छूट।' },
    who: { en: 'Micro and small enterprises.', hi: 'सूक्ष्म और लघु उद्यम।' },
    how: { en: 'Apply through a bank or lender taking part in the MSME Ministry scheme.', hi: 'MSME मंत्रालय की योजना में शामिल बैंक या ऋणदाता के ज़रिए आवेदन करें।' },
    link: 'https://msme.gov.in',
  },
  sidbi_4e: {
    kind: 'finance', basis: 'official',
    name: { en: 'SIDBI 4E energy efficiency loan', hi: 'SIDBI 4E ऊर्जा दक्षता लोन' },
    benefit: { en: '₹10 lakh to ₹5 crore at 6.4% to 7.5%.', hi: '₹10 लाख से ₹5 करोड़ तक, 6.4% से 7.5% पर।' },
    who: { en: 'MSMEs improving energy efficiency.', hi: 'ऊर्जा दक्षता सुधारने वाले MSME।' },
    how: { en: 'Apply to SIDBI or a partner bank with an energy audit or quotation.', hi: 'ऊर्जा ऑडिट या कोटेशन के साथ SIDBI या साझेदार बैंक में आवेदन करें।' },
    link: 'https://www.sidbi.in',
  },
  zed: {
    kind: 'central', basis: 'reported',
    name: { en: 'ZED certification support', hi: 'ZED प्रमाणन सहायता' },
    benefit: { en: 'Consultancy cost covered up to ₹2 lakh per unit, and up to ₹3 lakh for technology upgrades.', hi: 'प्रति इकाई ₹2 लाख तक परामर्श खर्च, और तकनीक उन्नयन के लिए ₹3 लाख तक।' },
    who: { en: 'MSMEs going for Zero Defect Zero Effect certification.', hi: 'ज़ीरो डिफ़ेक्ट ज़ीरो इफ़ेक्ट प्रमाणन चाहने वाले MSME।' },
    how: { en: 'Register on the ZED portal and pick a consultant.', hi: 'ZED पोर्टल पर रजिस्टर करें और सलाहकार चुनें।' },
    link: 'https://zed.msme.gov.in',
  },
  adeetie: {
    kind: 'central', basis: 'reported',
    name: { en: 'ADEETIE (BEE)', hi: 'ADEETIE (बीईई)' },
    benefit: { en: '3% to 5% interest subvention and free energy audits, in 14 sectors across 60 industrial clusters.', hi: '14 क्षेत्रों के 60 औद्योगिक क्लस्टरों में 3% से 5% ब्याज छूट और मुफ़्त ऊर्जा ऑडिट।' },
    who: { en: 'Industrial units in the listed clusters.', hi: 'सूचीबद्ध क्लस्टरों की औद्योगिक इकाइयाँ।' },
    how: { en: 'Check if your cluster is listed on the BEE site, then apply through SIDBI.', hi: 'बीईई साइट पर देखें कि आपका क्लस्टर सूचीबद्ध है या नहीं, फिर SIDBI से आवेदन करें।' },
    link: 'https://adeetie.beeindia.gov.in',
  },
  tn_free_units: {
    kind: 'state', basis: 'reported',
    name: { en: 'Tamil Nadu free units', hi: 'तमिलनाडु मुफ़्त यूनिट' },
    benefit: { en: '200 free units every two months if you use 500 units or fewer. Go over, and you drop to 100.', hi: 'दो महीने में 500 यूनिट या कम खपत पर 200 यूनिट मुफ़्त। इससे ऊपर जाने पर सिर्फ़ 100।' },
    who: { en: 'Domestic consumers in Tamil Nadu.', hi: 'तमिलनाडु के घरेलू उपभोक्ता।' },
    how: { en: 'Applied on your bill. Staying under 500 units is what counts.', hi: 'बिल में अपने आप लगता है। 500 यूनिट से नीचे रहना ज़रूरी है।' },
    link: 'https://www.myscheme.gov.in',
  },
  ka_gruha_jyothi: {
    kind: 'state', basis: 'reported',
    name: { en: 'Karnataka Gruha Jyothi', hi: 'कर्नाटक गृह ज्योति' },
    benefit: { en: 'Up to 200 units free each month. Tenants can apply too.', hi: 'हर महीने 200 यूनिट तक मुफ़्त। किराएदार भी आवेदन कर सकते हैं।' },
    who: { en: 'Households with a domestic connection in Karnataka.', hi: 'कर्नाटक में घरेलू कनेक्शन वाले परिवार।' },
    how: { en: 'Apply on the Seva Sindhu portal with Aadhaar linked to your account.', hi: 'आधार जुड़े खाते के साथ सेवा सिंधु पोर्टल पर आवेदन करें।' },
    link: 'https://sevasindhu.karnataka.gov.in',
  },
  csr: {
    kind: 'third', basis: 'general',
    name: { en: 'Corporate CSR sponsorship', hi: 'कॉर्पोरेट सीएसआर प्रायोजन' },
    benefit: { en: 'A company can fund clean energy for a school, clinic or village under its CSR budget. Amounts depend on the sponsor.', hi: 'कंपनी अपने सीएसआर बजट से स्कूल, क्लिनिक या गाँव में स्वच्छ ऊर्जा का खर्च उठा सकती है। राशि प्रायोजक पर निर्भर।' },
    who: { en: 'Schools, NGOs, clinics and village groups.', hi: 'स्कूल, एनजीओ, क्लिनिक और ग्राम समूह।' },
    how: { en: 'Write a one-page proposal with the cost, the saving and the CO₂ avoided. Atmos reports can supply the numbers.', hi: 'लागत, बचत और बची CO₂ के साथ एक पन्ने का प्रस्ताव लिखें। Atmos की रिपोर्ट से ये आँकड़े मिल सकते हैं।' },
    link: 'https://www.mca.gov.in',
  },
  resco: {
    kind: 'third', basis: 'general',
    name: { en: 'Pay-from-savings (RESCO / ESCO)', hi: 'बचत से भुगतान (RESCO / ESCO)' },
    benefit: { en: 'A company installs and owns the equipment, and you pay from what you save. Little or no upfront cost.', hi: 'कंपनी उपकरण लगाती और उसकी मालिक रहती है; आप बचत से भुगतान करते हैं। शुरुआती खर्च कम या शून्य।' },
    who: { en: 'Shops, schools, offices and societies with a steady bill.', hi: 'स्थिर बिल वाली दुकानें, स्कूल, दफ़्तर और सोसाइटी।' },
    how: { en: 'Get two or three quotes. Check the contract length and what happens at the end.', hi: 'दो-तीन कोटेशन लें। अनुबंध की अवधि और अंत में क्या होगा, यह देखें।' },
    link: 'https://beeindia.gov.in',
  },
  nbfc: {
    kind: 'third', basis: 'general',
    name: { en: 'Solar EMI from banks and NBFCs', hi: 'बैंक और NBFC से सोलर EMI' },
    benefit: { en: 'Spread the cost over 3 to 7 years. Rates vary by lender, so compare before you sign.', hi: 'लागत को 3 से 7 साल में बाँटें। दरें ऋणदाता के हिसाब से अलग होती हैं, हस्ताक्षर से पहले तुलना करें।' },
    who: { en: 'Anyone with a regular income.', hi: 'नियमित आय वाला कोई भी व्यक्ति।' },
    how: { en: 'Ask for the total interest in rupees, not just the rate.', hi: 'सिर्फ़ दर नहीं, रुपयों में कुल ब्याज पूछें।' },
    link: 'https://www.sidbi.in',
  },
  ngo: {
    kind: 'third', basis: 'general',
    name: { en: 'Energy-access nonprofits', hi: 'ऊर्जा-पहुँच वाले गैर-लाभकारी संगठन' },
    benefit: { en: 'Groups such as SELCO Foundation help low-income households and small livelihoods with design, finance and support.', hi: 'SELCO Foundation जैसे संगठन कम आय वाले परिवारों और छोटी आजीविकाओं को डिज़ाइन, फ़ाइनेंस और सहयोग देते हैं।' },
    who: { en: 'Low-income households, small shops, farmers and clinics.', hi: 'कम आय वाले परिवार, छोटी दुकानें, किसान और क्लिनिक।' },
    how: { en: 'Contact them with your location, your bill and what you want to power.', hi: 'अपने स्थान, बिल और ज़रूरत के साथ उनसे संपर्क करें।' },
    link: 'https://selcofoundation.org',
  },
};

// States and union territories. `special` states get the higher central rate.
export const STATES = [
  ['Andaman & Nicobar Islands', true], ['Andhra Pradesh'], ['Arunachal Pradesh', true], ['Assam', true], ['Bihar'],
  ['Chandigarh'], ['Chhattisgarh'], ['Dadra & Nagar Haveli and Daman & Diu'], ['Delhi'], ['Goa'], ['Gujarat'],
  ['Haryana'], ['Himachal Pradesh', true], ['Jammu & Kashmir', true], ['Jharkhand'], ['Karnataka'], ['Kerala'],
  ['Ladakh', true], ['Lakshadweep', true], ['Madhya Pradesh'], ['Maharashtra'], ['Manipur', true], ['Meghalaya', true],
  ['Mizoram', true], ['Nagaland', true], ['Odisha'], ['Puducherry'], ['Punjab'], ['Rajasthan'], ['Sikkim', true],
  ['Tamil Nadu'], ['Telangana'], ['Tripura', true], ['Uttar Pradesh'], ['Uttarakhand', true], ['West Bengal'],
].map(([name, special]) => ({ name, special: Boolean(special) }));
