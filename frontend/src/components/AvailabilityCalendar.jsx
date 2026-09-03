import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const AvailabilityCalendar = ({ slots = [], onAddSlot, onDeleteSlot, loading = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !startTime || !endTime) return;
    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    if (end <= start) {
      alert('End time must be after start time.');
      return;
    }
    onAddSlot({ startTime: start.toISOString(), endTime: end.toISOString() });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            Availability Slots
          </h3>
          <p className="text-xs text-slate-500">Define your working schedule so customers can book open slots.</p>
        </div>
      </div>

      {/* Add new slot form */}
      <form onSubmit={handleSubmit} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 bg-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 h-[38px] disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </button>
      </form>

      {/* Slots List */}
      <div className="space-y-2">
        <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Scheduled Slots</h4>
        {slots.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
            No availability slots added yet. Add a slot above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slots.filter(Boolean).map((slot) => (
              <div
                key={slot._id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    {new Date(slot.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      slot.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {slot.isAvailable ? 'Available' : 'Booked'}
                  </span>
                  {onDeleteSlot && (
                    <button
                      onClick={() => onDeleteSlot(slot._id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
