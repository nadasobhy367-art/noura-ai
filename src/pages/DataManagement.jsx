import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DataManagement = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState('patients');
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Female',
    riskLevel: 'Low',
  });

  // Load sample data
  useEffect(() => {
    setPatients([
      {
        id: 1,
        patientId: 'PT-2026-001',
        name: 'فاطمة علي',
        age: 42,
        gender: 'Female',
        riskLevel: 'Low',
        lastScan: '2026-03-15',
        status: 'active',
      },
      {
        id: 2,
        patientId: 'PT-2026-002',
        name: 'مريم حسين',
        age: 38,
        gender: 'Female',
        riskLevel: 'Medium',
        lastScan: '2026-03-20',
        status: 'active',
      },
    ]);

    setDoctors([
      {
        id: 1,
        doctorId: 'DR-2026-001',
        name: 'د. أحمد محمود',
        specialization: 'General Oncology',
        patientsCount: 12,
        status: 'active',
      },
      {
        id: 2,
        doctorId: 'DR-2026-002',
        name: 'د. محمد عبدالله',
        specialization: 'Lung Cancer',
        patientsCount: 10,
        status: 'active',
      },
      {
        id: 3,
        doctorId: 'DR-2026-003',
        name: 'د. ندا صبحي',
        specialization: 'Brain Cancer',
        patientsCount: 8,
        status: 'active',
      },
      {
        id: 4,
        doctorId: 'DR-2026-004',
        name: 'د. روضة محمد',
        specialization: 'Skin Cancer',
        patientsCount: 9,
        status: 'active',
      },
    ]);
  }, []);

  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.age) {
      alert('Please fill in name and age');
      return;
    }

    const newId = patients.length + 1;
    const newPatientObj = {
      id: newId,
      patientId: `PT-2026-${newId.toString().padStart(3, '0')}`,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      riskLevel: newPatient.riskLevel,
      lastScan: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setPatients([...patients, newPatientObj]);
    setNewPatient({ name: '', age: '', gender: 'Female', riskLevel: 'Low' });
    alert(`Patient ${newPatient.name} added with ID: ${newPatientObj.patientId}`);
  };

  const exportData = type => {
    const data = type === 'patients' ? patients : doctors;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Data Management</h1>
                <p className="text-xs text-gray-500">View and manage system data</p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('patients')}
                  className={`py-3 px-1 font-medium border-b-2 ${
                    activeTab === 'patients'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  👥 Patients ({patients.length})
                </button>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className={`py-3 px-1 font-medium border-b-2 ${
                    activeTab === 'doctors'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  👨‍⚕️ Doctors ({doctors.length})
                </button>
                <button
                  onClick={() => setActiveTab('add')}
                  className={`py-3 px-1 font-medium border-b-2 ${
                    activeTab === 'add'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  ➕ Add New
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'patients' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Patients Data</h3>
                <button
                  onClick={() => exportData('patients')}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium"
                >
                  📥 Export JSON
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Age</th>
                      <th className="text-left py-3 px-4">Gender</th>
                      <th className="text-left py-3 px-4">Risk Level</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(patient => (
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono">{patient.patientId}</td>
                        <td className="py-3 px-4">{patient.name}</td>
                        <td className="py-3 px-4">{patient.age}</td>
                        <td className="py-3 px-4">{patient.gender}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              patient.riskLevel === 'Low'
                                ? 'bg-green-100 text-green-800'
                                : patient.riskLevel === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {patient.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => {
                              const newName = prompt('Edit name:', patient.name);
                              if (newName) {
                                setPatients(
                                  patients.map(p =>
                                    p.id === patient.id ? { ...p, name: newName } : p
                                  )
                                );
                              }
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${patient.name}?`)) {
                                setPatients(patients.filter(p => p.id !== patient.id));
                              }
                            }}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                Data stored in React state | Changes persist until page refresh
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Add New Patient</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newPatient.name}
                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Patient name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Gender</label>
                  <select
                    value={newPatient.gender}
                    onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Risk Level</label>
                  <select
                    value={newPatient.riskLevel}
                    onChange={e => setNewPatient({ ...newPatient, riskLevel: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddPatient}
                className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                Add Patient to System
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-700">
                  💡 <strong>Note:</strong> This data is stored in React state. To connect to
                  backend, replace state updates with API calls.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DataManagement;
