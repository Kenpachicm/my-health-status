import { Navigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  memberId: string;
  role: string;
  hospitalId: string | null;
}

interface HospitalAdminRouteProps {
  user: User | null;
  children: React.ReactNode;
}

export default function HospitalAdminRoute({ user, children }: HospitalAdminRouteProps) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'hospital_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
