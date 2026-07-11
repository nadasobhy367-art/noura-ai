import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors, getAllNurses, getPatientsByDoctor } from '../utils/dataStore';
import { logger } from '../utils/logger';

const TeamManagement = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientCounts, setPatientCounts] = useState({});

  // Load data from localStorage or defaults
  useEffect(() => {
    const loadData = async () => {
      let docs = (await getAllDoctors()).map(doc => ({ ...doc }));
      let nrs = (await getAllNurses()).map(n => ({ ...n }));
      const validNurseIds = new Set(nrs.map(nurse => nurse.id));
      const validDoctorIds = new Set(docs.map(doc => doc.id));

      const normalizeAssignments = assignments => {
        const normalized = {};

        docs.forEach(doc => {
          const nurseIds = Array.isArray(assignments[doc.id]) ? assignments[doc.id] : [];
          normalized[doc.id] = [...new Set(nurseIds)]
            .filter(nurseId => validNurseIds.has(nurseId))
            .slice(0, 2);
        });

        return normalized;
      };

      const liveAssignments = normalizeAssignments(
        nrs.reduce((acc, nurse) => {
          if (!validDoctorIds.has(nurse.assignedDoctorId) || !validNurseIds.has(nurse.id))
            return acc;
          acc[nurse.assignedDoctorId] = [...(acc[nurse.assignedDoctorId] || []), nurse.id];
          return acc;
        }, {})
      );

      // This page is read-only for assignments right now, so always trust live API data.
      localStorage.removeItem('noura_team_assignments');

      docs = docs.map(doc => ({
        ...doc,
        assignedNurses: liveAssignments[doc.id] || [],
      }));

      nrs = nrs.map(nurse => {
        if (!validDoctorIds.has(nurse.assignedDoctorId)) {
          return {
            ...nurse,
            assignedDoctorId: null,
            assignedDoctorName: null,
          };
        }

        return {
          ...nurse,
          assignedDoctorName:
            docs.find(doc => doc.id === nurse.assignedDoctorId)?.name || nurse.assignedDoctorName,
        };
      });

      setDoctors(docs);
      setNurses(nrs);
      setSelectedDoctor(docs[0] || null);

      const countsEntries = await Promise.all(
        docs.map(async doc => {
          const patients = await getPatientsByDoctor(doc.id);
          return [doc.id, patients.length];
        })
      );
      setPatientCounts(Object.fromEntries(countsEntries));
    };

    loadData().catch(error => {
      logger.error('Error loading team management data:', error);
    });
  }, []);

  const assignNurse = () => {
    if (!selectedDoctor) return;
    alert(
      'Team assignment changes are currently read-only until a backend endpoint is implemented.'
    );
  };

  const unassignNurse = () => {
    if (!selectedDoctor) return;
    alert(
      'Team assignment changes are currently read-only until a backend endpoint is implemented.'
    );
  };

  const resetToDefaults = () => {
    alert('Reset is disabled because team assignments are currently read-only.');
  };

  const assignedNurses = nurses.filter(n => n.assignedDoctorId === selectedDoctor?.id);
  const availableNurses = nurses.filter(n => !n.assignedDoctorId);
  const getDoctorAssignedCount = doctorId =>
    nurses.filter(n => n.assignedDoctorId === doctorId).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Team Management</h1>
          <div className="flex space-x-2">
            <button
              onClick={resetToDefaults}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
            >
              Reset to Defaults
            </button>
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              ← Back to Admin
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Team assignments are currently displayed from live user data, but editing assignments
          still needs dedicated backend endpoints before it can be enabled safely.
        </div>

        {/* Stats Overview */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600">Total Doctors</h3>
            <p className="text-2xl font-bold text-blue-600">{doctors.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600">Assigned Nurses</h3>
            <p className="text-2xl font-bold text-green-600">
              {nurses.filter(n => n.assignedDoctorId).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600">Available Nurses</h3>
            <p className="text-2xl font-bold text-orange-600">
              {nurses.filter(n => !n.assignedDoctorId).length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Doctors</h2>
            <ul className="space-y-2">
              {doctors.map(doc => (
                <li
                  key={doc.id}
                  className={`p-3 rounded-lg border cursor-pointer ${
                    selectedDoctor?.id === doc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedDoctor(doc)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.specialtyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        {getDoctorAssignedCount(doc.id)}/2 nurses
                      </p>
                      <p className="text-xs text-gray-600">{patientCounts[doc.id] || 0} patients</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">
              {selectedDoctor ? `${selectedDoctor.name} Team` : 'Select a doctor'}
            </h2>

            {!selectedDoctor ? (
              <p className="text-gray-500">Select a doctor to manage nurse assignments.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="font-semibold mb-2">
                    Assigned Nurses ({assignedNurses.length}/2)
                  </h3>
                  {assignedNurses.length === 0 ? (
                    <p className="text-gray-500">No nurses currently assigned.</p>
                  ) : (
                    <ul className="space-y-2">
                      {assignedNurses.map(n => (
                        <li key={n.id} className="flex justify-between items-center">
                          <span>{n.name}</span>
                          <button
                            onClick={() => unassignNurse(n.id)}
                            className="text-red-500 text-xs hover:underline"
                          >
                            Unassign
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h3 className="font-semibold mb-2">Available Nurses</h3>
                  {selectedDoctor && assignedNurses.length >= 2 ? (
                    <p className="text-red-500 text-sm">
                      This doctor already has 2 nurses assigned.
                    </p>
                  ) : availableNurses.length === 0 ? (
                    <p className="text-gray-500">No free nurses available.</p>
                  ) : (
                    <ul className="space-y-2">
                      {availableNurses.map(n => (
                        <li key={n.id} className="flex justify-between items-center">
                          <span>{n.name}</span>
                          <button
                            onClick={() => assignNurse(n.id)}
                            className="bg-indigo-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Assign
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamManagement;
