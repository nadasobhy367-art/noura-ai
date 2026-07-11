import { useState } from 'react';
import { scansAPI } from '../utils/api';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const upload = async (file, patientId) => {
    try {
      setUploading(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('patientId', patientId);

      const data = await scansAPI.upload(formData);

      setResult(data);
      return data;
    } catch (err) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setUploading(false);
    setResult(null);
    setError(null);
  };

  return { upload, uploading, result, error, reset };
};
