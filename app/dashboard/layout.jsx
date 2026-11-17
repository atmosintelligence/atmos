import DashboardRoot from './DashboardRoot';

export const metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }) {
  return <DashboardRoot>{children}</DashboardRoot>;
}
