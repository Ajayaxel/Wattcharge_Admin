import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, AlertTriangle, Eye, Edit2, Loader2, ArrowRight } from 'lucide-react';
import api from '../../../core/api/axios';
import Modal from '../../../shared/components/Modal/Modal';
import Button from '../../../shared/components/Button/Button';
import { showToastNotification } from '../../dashboard/dashboardSlice';

const DEMO_BOOKINGS = [
  {
    _id: 'demo_bk_1',
    userId: {
      name: 'Ajay K',
      email: 'ajay@gmail.com',
      phone: '+91 9876543210',
    },
    serviceType: 'instant_boost',
    serviceName: 'Instant Charge Boost',
    status: 'pending',
    location: {
      latitude: 11.2588,
      longitude: 75.7804,
      address: 'Hanover St 24, New York',
    },
    payment: {
      method: 'wallet',
      amount: 16.56,
      status: 'paid',
    },
    details: {
      chargeAmountKWh: 36,
      vehicleId: 'demo_car_1',
    },
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo_bk_2',
    userId: {
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      phone: '+1 555-0199',
    },
    serviceType: 'roadside_help',
    serviceName: 'Mechanical Issue',
    status: 'assigned',
    location: {
      latitude: 11.2612,
      longitude: 75.7820,
      address: 'Jail Rd, Kozhikode',
    },
    payment: {
      method: 'cod',
      amount: 75.00,
      status: 'unpaid',
    },
    details: {
      description: 'The engine is overheated and smoke is coming out.',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { isDemoMode } = useSelector((state) => state.auth);

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFormData, setStatusFormData] = useState({ status: 'pending', paymentStatus: 'unpaid' });
  const [isUpdating, setIsUpdating] = useState(false);

  // Load Bookings
  const loadBookings = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setBookings(DEMO_BOOKINGS);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/bookings/admin');
      if (response.data && response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      dispatch(showToastNotification({ 
        message: err.response?.data?.message || 'Error loading booking records.', 
        isError: true 
      }));
      setBookings(DEMO_BOOKINGS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [isDemoMode]);

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setStatusFormData({
      status: booking.status,
      paymentStatus: booking.payment?.status || 'unpaid',
    });
    setShowDetailModal(true);
  };

  const closeDetails = () => {
    setShowDetailModal(false);
    setSelectedBooking(null);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsUpdating(true);

    if (isDemoMode) {
      setBookings(prev => prev.map(b => b._id === selectedBooking._id ? {
        ...b,
        status: statusFormData.status,
        payment: { ...b.payment, status: statusFormData.paymentStatus }
      } : b));
      dispatch(showToastNotification({ message: 'Ticket updated successfully (Demo).', isError: false }));
      closeDetails();
      setIsUpdating(false);
      return;
    }

    try {
      const response = await api.patch(`/bookings/admin/${selectedBooking._id}`, statusFormData);
      if (response.data && response.data.success) {
        dispatch(showToastNotification({ message: 'Ticket status updated successfully.', isError: false }));
        loadBookings();
      }
      closeDetails();
    } catch (err) {
      dispatch(showToastNotification({ message: 'Error updating ticket status.', isError: true }));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 1. Header Card */}
      <div className="bg-appCard border border-white/5 p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold tracking-tight">Active Customer Bookings</h2>
        <p className="text-xs text-appTextGray mt-1">Monitor live requests, coordinate roadside assistance dispatches, and verify payment settlements.</p>
      </div>

      {/* 2. Bookings Logs Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-appSecondary" />
        </div>
      ) : (
        <div className="bg-appCard border border-white/5 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="p-4 text-xs font-bold text-appTextGray uppercase tracking-wider">User</th>
                  <th className="p-4 text-xs font-bold text-appTextGray uppercase tracking-wider">Service</th>
                  <th className="p-4 text-xs font-bold text-appTextGray uppercase tracking-wider">Location</th>
                  <th className="p-4 text-xs font-bold text-appTextGray uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-bold text-appTextGray uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-appTextGray uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-appTextGray uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-white/[0.01] transition-all">
                    <td className="p-4">
                      <div className="font-bold text-appTextLight">{booking.userId?.name || 'Customer'}</div>
                      <div className="text-[10px] text-appTextGray mt-0.5">{booking.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded border mb-1 ${
                        booking.serviceType === 'instant_boost' 
                          ? 'bg-appSecondary/10 border-appSecondary/20 text-appSecondary' 
                          : booking.serviceType === 'slot_booking'
                            ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {booking.serviceType.replace('_', ' ')}
                      </span>
                      <div className="font-semibold text-xs text-appTextLight">{booking.serviceName}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      <div className="truncate text-xs font-medium text-appTextLight">{booking.location?.address}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-appSecondary">AED {booking.payment?.amount?.toFixed(2)}</div>
                      <span className={`text-[9px] font-black uppercase ${
                        booking.payment?.status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {booking.payment?.status} · {booking.payment?.method?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                        booking.status === 'pending'
                          ? 'bg-yellow-950/40 border border-yellow-500/20 text-yellow-400'
                          : booking.status === 'assigned'
                            ? 'bg-sky-950/40 border border-sky-500/20 text-sky-400'
                            : booking.status === 'completed'
                              ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-400'
                              : 'bg-red-950/40 border border-red-500/20 text-red-400'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-appTextGray">
                      {new Date(booking.createdAt).toLocaleDateString()} {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openDetails(booking)}
                        className="inline-flex items-center gap-1 bg-white/5 border border-white/10 hover:bg-appSecondary hover:text-black hover:border-appSecondary transition-all text-xs font-extrabold px-3 py-1.5 rounded-lg cursor-pointer text-appTextLight"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-appTextGray text-xs">No customer booking records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Details / Dispatch Management Modal */}
      {selectedBooking && (
        <Modal
          show={showDetailModal}
          onClose={closeDetails}
          title="Booking Details & Dispatch Control"
        >
          <div className="space-y-6">
            {/* User Profile Info */}
            <div className="bg-appBg border border-white/5 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-black text-appSecondary uppercase tracking-wider">Customer Profile</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-appTextGray">Name:</span>
                  <p className="font-bold mt-0.5 text-appTextLight">{selectedBooking.userId?.name}</p>
                </div>
                <div>
                  <span className="text-appTextGray">Contact Phone:</span>
                  <p className="font-bold mt-0.5 text-appTextLight">{selectedBooking.userId?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Service & Location Specs */}
            <div className="bg-appBg border border-white/5 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-black text-appSecondary uppercase tracking-wider">Service Specs</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-appTextGray">Request type:</span>
                  <p className="font-bold mt-0.5 text-appTextLight capitalize">{selectedBooking.serviceType.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-appTextGray">Price Rate:</span>
                  <p className="font-bold mt-0.5 text-appSecondary">AED {selectedBooking.payment?.amount?.toFixed(2)}</p>
                </div>
              </div>
              <div className="pt-2 text-xs">
                <span className="text-appTextGray">Target Address:</span>
                <p className="font-bold mt-0.5 text-appTextLight">{selectedBooking.location?.address || 'N/A'}</p>
              </div>
              {/* Coordinates */}
              {(selectedBooking.location?.latitude || selectedBooking.location?.longitude) && (
                <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-black/40 border border-white/5 rounded-lg p-2.5">
                    <span className="text-appTextGray block text-[10px] mb-1 font-semibold uppercase tracking-wider">Latitude</span>
                    <p className="font-black text-appSecondary font-mono text-[11px]">{selectedBooking.location.latitude?.toFixed(6)}</p>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-lg p-2.5">
                    <span className="text-appTextGray block text-[10px] mb-1 font-semibold uppercase tracking-wider">Longitude</span>
                    <p className="font-black text-appSecondary font-mono text-[11px]">{selectedBooking.location.longitude?.toFixed(6)}</p>
                  </div>
                  <div className="col-span-2">
                    <a
                      href={`https://www.google.com/maps?q=${selectedBooking.location.latitude},${selectedBooking.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-appSecondary hover:underline"
                    >
                      <span>📍</span> Open in Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Contextual payload details */}
            <div className="bg-appBg border border-white/5 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-black text-appSecondary uppercase tracking-wider">Service Context / Notes</h4>
              {selectedBooking.serviceType === 'instant_boost' && (
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-appTextGray">Boost Charge target:</span>
                    <span className="font-bold text-appTextLight">{selectedBooking.details?.chargeAmountKWh} kWh</span>
                  </div>
                </div>
              )}
              {selectedBooking.serviceType === 'roadside_help' && (
                <div className="text-xs">
                  <span className="text-appTextGray">Issue Description:</span>
                  <p className="font-medium text-appTextLight mt-1 bg-black/35 p-3 rounded-lg border border-white/5 italic">
                    "{selectedBooking.details?.description || 'No user notes provided.'}"
                  </p>
                </div>
              )}
              {selectedBooking.serviceType === 'slot_booking' && (
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-appTextGray">Hub Location:</span>
                    <span className="font-bold text-appTextLight">{selectedBooking.details?.hubName || 'Wattcharge Hub'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-appTextGray">Time Slot:</span>
                    <span className="font-bold text-appTextLight">{selectedBooking.details?.timeSlot}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status updates control form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-xs font-black text-appTextLight uppercase tracking-wider">Ticket Management Controls</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-appTextGray uppercase mb-1.5 tracking-wider">Ticket Status</label>
                  <select
                    value={statusFormData.status}
                    onChange={(e) => setStatusFormData({ ...statusFormData, status: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-appTextLight focus:outline-none focus:border-appSecondary transition-all appearance-none cursor-pointer"
                  >
                    <option value="pending" className="bg-appBg text-appTextLight">Pending Dispatch</option>
                    <option value="assigned" className="bg-appBg text-appTextLight">Technician Assigned</option>
                    <option value="completed" className="bg-appBg text-appTextLight">Service Completed</option>
                    <option value="cancelled" className="bg-appBg text-appTextLight">Ticket Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-appTextGray uppercase mb-1.5 tracking-wider">Payment Status</label>
                  <select
                    value={statusFormData.paymentStatus}
                    onChange={(e) => setStatusFormData({ ...statusFormData, paymentStatus: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-appTextLight focus:outline-none focus:border-appSecondary transition-all appearance-none cursor-pointer"
                  >
                    <option value="unpaid" className="bg-appBg text-appTextLight">Unpaid / Awaiting COD</option>
                    <option value="paid" className="bg-appBg text-appTextLight">Settled / Paid</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="flex-1 py-3 bg-appCard hover:bg-white/5 border border-white/10 text-appTextLight text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-appSecondary hover:bg-appSecondary/90 disabled:opacity-60 text-black text-sm font-extrabold rounded-xl transition-all cursor-pointer shadow-lg shadow-appSecondary/20"
                >
                  {isUpdating ? 'Saving...' : 'Apply Status Update'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
