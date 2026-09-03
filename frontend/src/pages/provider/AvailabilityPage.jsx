import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import AvailabilityCalendar from '../../components/AvailabilityCalendar';
import LoadingSpinner from '../../components/LoadingSpinner';

const AvailabilityPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await api.get('/providers/availability');
      if (res.data.success) setSlots(res.data.data.slots || []);
    } catch (err) {
      console.error('Failed to fetch availability slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (slotData) => {
    setActionLoading(true);
    try {
      const res = await api.post('/providers/availability', slotData);
      if (res.data.success) {
        setSlots((prev) => [...prev, res.data.data.slot]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add availability slot.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await api.delete(`/providers/availability/${id}`);
      setSlots((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert('Failed to delete slot.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading availability schedule..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">Manage Availability Calendar</h1>
        <p className="text-xs text-slate-500 mt-1">Set open slots to prevent double-booking and receive customer requests.</p>
      </div>

      <AvailabilityCalendar
        slots={slots}
        onAddSlot={handleAddSlot}
        onDeleteSlot={handleDeleteSlot}
        loading={actionLoading}
      />
    </div>
  );
};

export default AvailabilityPage;
