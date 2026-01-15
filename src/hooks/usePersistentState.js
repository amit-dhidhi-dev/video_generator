import { useState, useEffect, useCallback } from 'react';
import { videoDB } from '../utils/db';

export const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export const useVideoGenerationState = () => {
  const [jobState, setJobState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveState = useCallback(async (jobId, state) => {
    try {
      await videoDB.saveJob(jobId, {
        ...state,
        timestamp: Date.now()
      });
      setJobState(state);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, []);

  const loadState = useCallback(async (jobId) => {
    setIsLoading(true);
    try {
      const state = await videoDB.getJob(jobId);
      setJobState(state);
      return state;
    } catch (error) {
      console.error('Error loading state:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    jobState,
    isLoading,
    saveState,
    loadState,
    setJobState
  };
};