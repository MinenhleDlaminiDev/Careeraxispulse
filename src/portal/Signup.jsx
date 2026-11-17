import { Navigate, useSearchParams } from 'react-router-dom';

// Signup lives in a modal on the login screen (AXIS-22). This route is kept so
// old/deep links to /portal/signup still work — it lands on the login page with
// the signup modal auto-opened.
//
// ?buy=<thing> is forwarded as router state so the login screen can say WHY the
// person was sent here. Someone arriving from the Interview Code "Get Access"
// button is mid-purchase: access is granted to a profile, so they need one
// before they can buy, and the screen has to make that obvious rather than
// silently showing a signup form.
export default function Signup() {
  const [params] = useSearchParams();
  const buy = params.get('buy');
  return <Navigate to="/portal/login" replace state={{ signup: true, buy }} />;
}
