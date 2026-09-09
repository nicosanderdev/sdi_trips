import { Navigate, useSearchParams } from 'react-router-dom';

/**
 * Legacy `/booking/manage?token=…` URLs redirect to the unified reservation page.
 */
export default function BookingManageRedirect() {
  const [params] = useSearchParams();
  const token = params.get('token')?.trim();
  const search = token ? `?token=${encodeURIComponent(token)}` : '';
  return <Navigate to={`/reservation-lookup${search}`} replace />;
}
