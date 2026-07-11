import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Phone, Plus, X, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const AppointmentsPage = () => {
  const { isArabic } = useLanguage();
  const content = isArabic
    ? {
        title: 'المواعيد',
        subtitle: 'إدارة مواعيدك الطبية',
        newAppointment: 'موعد جديد',
        upcoming: 'المواعيد القادمة',
        noAppointments: 'لا توجد مواعيد',
        noAppointmentsSub: 'ليس لديك أي مواعيد قادمة',
        scheduleAppointment: 'حجز موعد',
        joinCall: 'انضمام للمكالمة',
        call: 'اتصال',
        modalTitle: 'موعد جديد',
        date: 'التاريخ',
        time: 'الوقت',
        appointmentType: 'نوع الموعد',
        selectType: 'اختر النوع',
        doctor: 'الطبيب',
        selectDoctor: 'اختر الطبيب',
        types: ['متابعة', 'فحص دوري', 'استشارة', 'تحليل مخبري'],
        doctors: ['د. أحمد محمود', 'د. ندا صبحي', 'د. روضة محمد', 'د. محمد عبدالله'],
        status: {
          confirmed: 'مؤكد',
          pending: 'قيد الانتظار',
          cancelled: 'ملغي',
        },
        seedTypes: ['متابعة', 'فحص دوري'],
      }
    : {
        title: 'Appointments',
        subtitle: 'Manage your medical appointments',
        newAppointment: 'New Appointment',
        upcoming: 'Upcoming Appointments',
        noAppointments: 'No appointments',
        noAppointmentsSub: "You don't have any upcoming appointments",
        scheduleAppointment: 'Schedule Appointment',
        joinCall: 'Join Video Call',
        call: 'Call',
        modalTitle: 'New Appointment',
        date: 'Date',
        time: 'Time',
        appointmentType: 'Appointment Type',
        selectType: 'Select type',
        doctor: 'Doctor',
        selectDoctor: 'Select doctor',
        types: ['Follow-up', 'Routine Check-up', 'Consultation', 'Lab Test'],
        doctors: [
          'Dr. Ahmed Mahmoud',
          'Dr. Nada Sobhy',
          'Dr. Rawda Mohamed',
          'Dr. Mohamed Abdullah',
        ],
        status: {
          confirmed: 'confirmed',
          pending: 'pending',
          cancelled: 'cancelled',
        },
        seedTypes: ['Follow-up', 'Routine Check-up'],
      };

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      date: '2026-02-25',
      time: '10:00',
      type: content.seedTypes[0],
      doctor: 'Dr. Ahmed Mahmoud',
      location: 'Cairo Medical Center',
      status: 'confirmed',
      icon: '🧠',
    },
    {
      id: 2,
      date: '2026-03-01',
      time: '14:30',
      type: content.seedTypes[1],
      doctor: 'Dr. Nada Sobhy',
      location: 'Cairo Medical Center',
      status: 'pending',
      icon: '📋',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    type: '',
    doctor: '',
    location: '',
  });

  const addAppointment = () => {
    if (newAppointment.date && newAppointment.time && newAppointment.type) {
      setAppointments([
        ...appointments,
        { ...newAppointment, id: Date.now(), status: 'pending', icon: '📋' },
      ]);
      setShowModal(false);
      setNewAppointment({ date: '', time: '', type: '', doctor: '', location: '' });
    }
  };

  const cancelAppointment = id => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  const getStatusColor = status => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{content.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{content.subtitle}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {content.newAppointment}
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {content.upcoming}
          </h2>
          {appointments.map(appointment => (
            <div
              key={appointment.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center text-2xl">
                    {appointment.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{appointment.type}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{appointment.doctor}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {appointment.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}
                  >
                    {content.status[appointment.status]}
                  </span>
                  <button
                    onClick={() => cancelAppointment(appointment.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                  <Video className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {content.joinCall}
                </button>
                <button className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Phone className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} /> {content.call}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {appointments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {content.noAppointments}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{content.noAppointmentsSub}</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {content.scheduleAppointment}
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {content.modalTitle}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {content.date}
                </label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {content.time}
                </label>
                <input
                  type="time"
                  value={newAppointment.time}
                  onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {content.appointmentType}
                </label>
                <select
                  value={newAppointment.type}
                  onChange={e => setNewAppointment({ ...newAppointment, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{content.selectType}</option>
                  {content.types.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {content.doctor}
                </label>
                <select
                  value={newAppointment.doctor}
                  onChange={e => setNewAppointment({ ...newAppointment, doctor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{content.selectDoctor}</option>
                  {content.doctors.map(doctor => (
                    <option key={doctor} value={doctor}>
                      {doctor}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={addAppointment}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center"
              >
                <Check className={`w-4 h-4 ${isArabic ? 'ml-2' : 'mr-2'}`} />{' '}
                {content.scheduleAppointment}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
