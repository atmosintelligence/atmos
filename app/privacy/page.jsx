import Footer from '@/components/Footer';

export const metadata = { title: 'Privacy Policy • Atmos Intelligence' };

const sections = [
  {
    title: 'What we collect',
    items: [
      {
        subtitle: 'Hardware data',
        body: 'If you have subscribed to a paid plan and are using an Atmos hardware device, we collect the environmental readings it transmits. These include temperature, humidity, CO₂ levels, air quality index, power consumption, voltage, light intensity, and occupancy state.',
      },
      {
        subtitle: 'Location data',
        body: 'Upon registration, we store the approximate longitude and latitude associated with your account in order to provide weather-aware analysis, environmental comparisons, and geographic calibration features. This value can be modified at any time from the Settings page of your dashboard.',
      },
      {
        subtitle: 'Demo mode',
        body: 'Atmos Demo Mode also relies on longitude and latitude data to simulate localised environmental conditions and weather-aware insights, even when you are not signed in or registered.',
      },
      {
        subtitle: 'Account data',
        body: 'When you create an account, we collect your display name, username, email address, and configured location coordinates. Your password is never stored in plain text. It is processed through a one-way cryptographic hash by Supabase\'s authentication system before storage.',
      },
      {
        subtitle: 'Preference data',
        body: 'We store a single entry in your browser\'s local storage to remember your light or dark mode preference. This never leaves your device.',
      },
    ],
  },
  {
    title: 'How we use your data',
    items: [
      {
        subtitle: 'Hardware data',
        body: 'Sensor readings are used exclusively to generate insights, optimisations, and reports for your own space. Your data is always associated with your account and is never used for advertising, profiling, or any purpose beyond the service you have subscribed to.',
      },
      {
        subtitle: 'Location data',
        body: 'Longitude and latitude values are used to retrieve local weather and environmental information through the Open-Meteo API. These coordinates are transmitted anonymously and are not associated with personally identifiable information when sent to third-party weather services.',
      },
      {
        subtitle: 'Account data',
        body: 'Your email address is used to send you service-related communications, including verification emails, plan receipts, and, if enabled, automated reports. We do not send marketing emails without explicit consent.',
      },
      {
        subtitle: 'Third parties',
        body: 'We do not sell, rent, or share your data with any third party.',
      },
    ],
  },
  {
    title: 'Data storage and retention',
    items: [
      {
        subtitle: 'Account data',
        body: 'Account credentials and profile information are stored on Supabase\'s managed infrastructure, hosted on servers located in Mumbai, India. Supabase complies with industry-standard security practices including encryption at rest and in transit.',
      },
      {
        subtitle: 'Hardware data',
        body: 'Sensor readings are processed through Google Apps Script and stored on Google Sheets infrastructure. Data is associated to your account via your username and retained for the duration of your active subscription. If your plan ends or is cancelled, your hardware data is permanently deleted 14 days thereafter unless you renew.',
      },
      {
        subtitle: 'Exporting data',
        body: 'Users on any paid plan may export their hardware and analysis data in both PDF and JSON format directly from the dashboard. Export functionality is unavailable on the free Spark plan.',
      },
      {
        subtitle: 'Deletion requests',
        body: 'You may request deletion of your account or any hardware data at any time by contacting us. Account deletion can also be performed directly from the Settings page of your dashboard. We will process all deletion requests within 7 business days.',
      },
    ],
  },
  {
    title: 'Security',
    items: [
      {
        subtitle: 'Our approach',
        body: 'We take reasonable technical and organisational measures to protect your information against unauthorised access, alteration, disclosure, or destruction. This includes encrypted data transmission (HTTPS), hashed credential storage, and row-level security policies on our database.',
      },
      {
        subtitle: 'API access',
        body: 'Public API access is disabled by default for all accounts and can only be enabled manually upon request. Enabling API access makes selected sensor data publicly accessible via your username and should only be enabled if you explicitly intend to expose this data.',
      },
      {
        subtitle: 'Your responsibility',
        body: 'You are responsible for maintaining the confidentiality of your account credentials. We recommend using a strong, unique password and not sharing your login details with anyone.',
      },
    ],
  },
  {
    title: 'Cookies and local storage',
    items: [
      {
        subtitle: 'What we use',
        body: 'Atmos does not use tracking cookies, advertising cookies, or third-party analytics scripts. The only browser storage we use is a single local storage key that remembers your theme preference, light or dark mode. Session management for authenticated users is handled via secure HTTP-only cookies set by Supabase.',
      },
    ],
  },
  {
    title: 'Your rights',
    items: [
      {
        subtitle: 'Access and portability',
        body: 'You have the right to access the data we hold about you. Paid users can export their hardware data and generated reports at any time from the dashboard in PDF and JSON format.',
      },
      {
        subtitle: 'Correction',
        body: 'You can update your display name and configured location directly from the Settings page. For other corrections, please contact us.',
      },
      {
        subtitle: 'Erasure',
        body: 'You have the right to request erasure of your personal data. You can delete your account from Settings, or contact us to request complete data removal.',
      },
    ],
  },
  {
    title: 'Changes to this policy',
    items: [
      {
        subtitle: '',
        body: 'We may update this Privacy Policy from time to time. When we do, we will revise the date at the top of this page. If changes are material, we will notify you via email. Continued use of the service after any update constitutes acceptance of the revised policy.',
      },
    ],
  },
  {
    title: 'Contact',
    items: [
      {
        subtitle: '',
        body: 'For any privacy-related questions, concerns, or requests, please contact us at atmosintelligence@gmail.com. We aim to respond within 5 business days.',
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 pt-32 pb-24">

        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4ADE80', marginBottom: '1rem' }}>
            Legal
          </div>
          <h1 className="font-heading text-5xl font-semibold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-xl">
            Atmos Intelligence is committed to handling your data with transparency and care. This policy explains what we collect, why we collect it, and how we protect it.
          </p>
          <p style={{ fontSize: '0.72rem', color: '#737373', marginTop: '1rem' }}>
            Last updated: 25 May, 2026
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {sections.map((s, si) => (
            <div
              key={s.title}
              style={{
                padding: '2rem 0',
                borderTop: '1px solid rgba(128,128,128,0.15)',
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '2rem',
              }}
            >
              <div>
                <h2 className="font-heading font-semibold" style={{ fontSize: '0.95rem', color: 'inherit', position: 'sticky', top: '5rem' }}>
                  {String(si + 1).padStart(2, '0')}. {s.title}
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {s.items.map((item, ii) => (
                  <div key={ii}>
                    {item.subtitle && (
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#737373', marginBottom: '0.4rem' }}>
                        {item.subtitle}
                      </div>
                    )}
                    <p className="text-neutral-500 dark:text-neutral-400" style={{ fontSize: '0.875rem', lineHeight: 1.75 }}>
                      {s.title === 'Contact' && item.subtitle === ''
                        ? <>For any privacy-related questions, concerns, or requests, please contact us at <a href="mailto:atmosintelligence@gmail.com" className="link">atmosintelligence@gmail.com</a>. We aim to respond within 5 business days.</>
                        : item.body
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(128,128,128,0.15)' }}>
            <p style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.7 }}>
              This policy applies to all users of Atmos Intelligence products and services, including the Atmos hardware device, the Atmos web dashboard, and any associated APIs. It does not apply to third-party services linked from our platform.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}