import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BookingCard from '../../components/BookingCard';
import LoadingSpinner from '../../components/LoadingSpinner';

const OpsBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      if (res.data.success) setBookings(res.data.data.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading operations booking monitor..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Booking Monitoring</h1>
        <p className="text-xs text-slate-500 mt-1">Live tracking for all active platform bookings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {bookings.map((b) => (
          <BookingCard key={b._id} booking={b} userRole="OPERATIONS_MANAGER" />
        ))}
      </div>
    </div>
  );
};

export default OpsBookings;
