import { useState, useEffect, useCallback } from 'react';
import { patientsAPI } from '../utils/api';
import { logger } from '../utils/logger';

export const useScans = patientId => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScans = useCallback(async () => {
    if (!patientId) {
      setScans([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await patientsAPI.getScans(patientId);
      setScans(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch scans');
      logger.error('Error fetching scans:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  return { scans, loading, error, refetch: fetchScans };
};
