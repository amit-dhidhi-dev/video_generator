// db.js - IndexedDB setup
const DB_NAME = 'VideoGeneratorDB';
const DB_VERSION = 1;
const STORE_NAME = 'videoJobs';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'jobId' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

export const saveToIndexedDB = async (jobId, data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ jobId, ...data });
    
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e);
  });
};

export const loadFromIndexedDB = async (jobId) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(jobId);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
};