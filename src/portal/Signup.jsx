import { Navigate } from 'react-router-dom';

// Signup now lives in a modal on the login screen (AXIS-22). This route is kept
// so old/deep links to /portal/signup still work — it lands on the login page
// with the signup modal auto-opened.
export default function Signup() {
  return <Navigate to="/portal/login" replace state={{ signup: true }} />;
}
