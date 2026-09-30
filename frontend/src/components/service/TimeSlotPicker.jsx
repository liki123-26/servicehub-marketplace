import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function TimeSlotPicker({
  merchantId,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime
}) {
  const [slots, setSlots] = useState([]);
  const [isOpenDay, setIsOpenDay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Default to today's date formatted YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(todayStr);
    }
  }, []);

  useEffect(() => {
    if (merchantId && selectedDate) {
      fetchAvailableSlots();
    }
  }, [merchantId, selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setSelectedTime(''); // Reset selection on date change
      const res = await api.get('/orders/slots/available', {
        params: { merchant_id: merchantId, date: selectedDate }
      });

      if (res.success) {
        setIsOpenDay(res.isOpen);
        setSlots(res.slots || []);
        setMessage(res.message || '');
      }
    } catch (err) {
      console.error('Failed to fetch available slots:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
      {/* Date Picker Row */}
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-600" />
          Select Appointment Date:
        </label>
        <input
          type="date"
          min={todayStr}
          value={selectedDate || todayStr}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
        />
      </div>

      {/* Available Slots Grid */}
      <div>
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
          Available Time Slots
        </label>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
            Checking provider schedule & booked slots...
          </div>
        ) : !isOpenDay ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{message || 'Provider is closed on this selected day. Please select another date.'}</span>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-3.5 bg-slate-100 rounded-xl text-xs text-slate-500 text-center font-medium">
            No working slots available for this date.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isAvailable = slot.isAvailable;

              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                    !isAvailable
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through opacity-70'
                      : isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30 ring-2 ring-blue-600/40'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <span>{slot.label}</span>
                  {!isAvailable && <span className="text-[9px] font-semibold text-rose-500 no-underline">Booked</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedTime && (
        <div className="p-2.5 bg-blue-50 border border-blue-200/80 rounded-xl text-xs text-blue-900 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Selected Slot: {selectedDate} at {slots.find(s => s.time === selectedTime)?.label || selectedTime}</span>
        </div>
      )}
    </div>
  );
}
