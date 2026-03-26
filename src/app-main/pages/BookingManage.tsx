import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '../../components/layout';
import { Button, Card } from '../../components/ui';
import type { ManageBookingView } from '../../types';
import { cancelBookingByManageToken, getBookingByManageToken } from '../../services/bookingService';

const BookingManage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<ManageBookingView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!token) {
        setError('Missing management token.');
        setLoading(false);
        return;
      }
      const result = await getBookingByManageToken(token);
      if (!mounted) return;
      if (!result.success || !result.booking) {
        setError(result.error ?? 'Invalid or expired management link.');
      } else {
        setBooking(result.booking);
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [token]);

  const handleCancel = async () => {
    if (!token || !booking?.canCancel) return;
    setCancelling(true);
    setCancelMessage(null);
    const result = await cancelBookingByManageToken(token, 'Cancelled by guest from management link');
    setCancelling(false);
    if (!result.success) {
      setCancelMessage(result.error ?? 'Could not cancel reservation.');
      return;
    }
    setCancelMessage('Reservation cancelled successfully.');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold text-navy mb-6">Manage reservation</h1>
        {loading && <p className="text-charcoal">Loading reservation...</p>}
        {!loading && error && (
          <Card className="rounded-2xl border border-red-200 p-4 bg-red-50">
            <p className="text-red-700">{error}</p>
            <Link to="/search" className="inline-block mt-4">
              <Button variant="outline">Back to search</Button>
            </Link>
          </Card>
        )}
        {!loading && booking && (
          <Card className="space-y-3 rounded-2xl border border-warm-gray p-5">
            <p><span className="font-semibold">Code:</span> {booking.reservationCode}</p>
            <p><span className="font-semibold">Property:</span> {booking.propertyTitle}</p>
            <p><span className="font-semibold">Dates:</span> {booking.checkIn} to {booking.checkOut}</p>
            <p><span className="font-semibold">Guests:</span> {booking.guests}</p>
            <p><span className="font-semibold">Status:</span> {booking.status}</p>
            <div className="pt-2">
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={!booking.canCancel || cancelling}
                onClick={handleCancel}
              >
                {cancelling ? 'Cancelling...' : 'Cancel reservation'}
              </Button>
            </div>
            {cancelMessage && (
              <p className={cancelMessage.includes('success') ? 'text-green-700 text-sm' : 'text-red-700 text-sm'}>
                {cancelMessage}
              </p>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default BookingManage;

