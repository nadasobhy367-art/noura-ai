import { useState, useEffect } from 'react';
import { patientsAPI } from '../utils/api';
import { logger } from '../utils/logger';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientsAPI.getAll();
      setPatients(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch patients');
      logger.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return { patients, loading, error, refetch: fetchPatients };
};
