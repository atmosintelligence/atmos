import { redirect } from 'next/navigation';

// Subscription now lives at the top of Settings. Old links and bookmarks still work.
export default function SubscriptionRedirect() {
  redirect('/dashboard/settings');
}
