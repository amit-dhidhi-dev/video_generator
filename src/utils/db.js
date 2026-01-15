// // src/utils/db.js
// const DB_NAME = 'VideoGeneratorDB';
// const DB_VERSION = 2;
// const STORE_NAME = 'videoJobs';
// const BLOB_STORE_NAME = 'videoBlobs';

// class VideoDB {
//   constructor() {
//     this.db = null;
//     this.initPromise = this.init();
//   }

//   async init() {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(DB_NAME, DB_VERSION);
      
//       request.onupgradeneeded = (event) => {
//         const db = event.target.result;
        
//         // Main jobs store
//         if (!db.objectStoreNames.contains(STORE_NAME)) {
//           const store = db.createObjectStore(STORE_NAME, { keyPath: 'jobId' });
//           store.createIndex('status', 'status', { unique: false });
//           store.createIndex('timestamp', 'timestamp', { unique: false });
//           store.createIndex('progress', 'progress', { unique: false });
//         }
        
//         // Blob store for large data
//         if (!db.objectStoreNames.contains(BLOB_STORE_NAME)) {
//           const blobStore = db.createObjectStore(BLOB_STORE_NAME, { keyPath: 'id' });
//           blobStore.createIndex('jobId', 'jobId', { unique: false });
//           blobStore.createIndex('type', 'type', { unique: false });
//         }
//       };
      
//       request.onsuccess = (event) => {
//         this.db = event.target.result;
//         resolve(this.db);
//       };
      
//       request.onerror = (event) => {
//         reject(event.target.error);
//       };
//     });
//   }

//   async ready() {
//     return this.initPromise;
//   }

//   // Save job metadata
//   async saveJob(jobId, data) {
//     await this.ready();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([STORE_NAME], 'readwrite');
//       const store = transaction.objectStore(STORE_NAME);
      
//       const jobData = {
//         jobId,
//         ...data,
//         updatedAt: Date.now()
//       };
      
//       const request = store.put(jobData);
      
//       request.onsuccess = () => resolve(jobData);
//       request.onerror = (e) => reject(e);
//     });
//   }

//   // Get job by ID
//   async getJob(jobId) {
//     await this.ready();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([STORE_NAME], 'readonly');
//       const store = transaction.objectStore(STORE_NAME);
//       const request = store.get(jobId);
      
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = (e) => reject(e);
//     });
//   }

//   // Get all incomplete jobs
//   async getIncompleteJobs() {
//     await this.ready();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([STORE_NAME], 'readonly');
//       const store = transaction.objectStore(STORE_NAME);
//       const statusIndex = store.index('status');
      
//       const incompleteStatuses = ['preparing', 'generating_slides', 'slides_generated', 'encoding', 'processing', 'paused'];
//       const allRequests = incompleteStatuses.map(status => 
//         new Promise((res) => {
//           const request = statusIndex.getAll(status);
//           request.onsuccess = () => res(request.result || []);
//           request.onerror = () => res([]);
//         })
//       );
      
//       Promise.all(allRequests).then(results => {
//         const allJobs = results.flat();
//         // Sort by timestamp (newest first)
//         allJobs.sort((a, b) => b.timestamp - a.timestamp);
//         resolve(allJobs);
//       }).catch(reject);
//     });
//   }

//   // Save blob data (images, audio, video)
//   async saveBlob(id, jobId, blob, type) {
//     await this.ready();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([BLOB_STORE_NAME], 'readwrite');
//       const store = transaction.objectStore(BLOB_STORE_NAME);
      
//       const reader = new FileReader();
//       reader.onload = () => {
//         const blobData = {
//           id,
//           jobId,
//           data: reader.result,
//           type,
//           timestamp: Date.now()
//         };
        
//         const request = store.put(blobData);
//         request.onsuccess = () => resolve(blobData);
//         request.onerror = (e) => reject(e);
//       };
      
//       reader.onerror = () => reject(reader.error);
//       reader.readAsDataURL(blob);
//     });
//   }

//   // Get blob by ID
//   async getBlob(id) {
//     await this.ready();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([BLOB_STORE_NAME], 'readonly');
//       const store = transaction.objectStore(BLOB_STORE_NAME);
//       const request = store.get(id);
      
//       request.onsuccess = () => {
//         if (request.result) {
//           const dataURL = request.result.data;
//           // Convert data URL back to blob
//           fetch(dataURL)
//             .then(res => res.blob())
//             .then(blob => resolve({ blob, type: request.result.type }))
//             .catch(reject);
//         } else {
//           resolve(null);
//         }
//       };
      
//       request.onerror = (e) => reject(e);
//     });
//   }

//   // Get all blobs for a job
//   async getBlobsByJobId(jobId) {
//     await this.ready();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([BLOB_STORE_NAME], 'readonly');
//       const store = transaction.objectStore(BLOB_STORE_NAME);
//       const jobIdIndex = store.index('jobId');
//       const request = jobIdIndex.getAll(jobId);
      
//       request.onsuccess = async () => {
//         const blobs = [];
//         const items = request.result || [];
        
//         for (const item of items) {
//           try {
//             const response = await fetch(item.data);
//             const blob = await response.blob();
//             blobs.push({
//               id: item.id,
//               jobId: item.jobId,
//               type: item.type,
//               blob,
//               timestamp: item.timestamp
//             });
//           } catch (error) {
//             console.warn(`Failed to load blob ${item.id}:`, error);
//           }
//         }
        
//         resolve(blobs);
//       };
      
//       request.onerror = (e) => reject(e);
//     });
//   }

//   // Get blobs by type
//   async getBlobsByType(jobId, type) {
//     const allBlobs = await this.getBlobsByJobId(jobId);
//     return allBlobs.filter(blob => blob.type === type);
//   }

//   // Delete job and related data
//   async deleteJob(jobId) {
//     await this.ready();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([STORE_NAME, BLOB_STORE_NAME], 'readwrite');
      
//       // Delete from jobs store
//       const jobStore = transaction.objectStore(STORE_NAME);
//       jobStore.delete(jobId);
      
//       // Delete related blobs
//       const blobStore = transaction.objectStore(BLOB_STORE_NAME);
//       const jobIdIndex = blobStore.index('jobId');
//       const request = jobIdIndex.getAllKeys(jobId);
      
//       request.onsuccess = () => {
//         request.result.forEach(key => {
//           blobStore.delete(key);
//         });
//       };
      
//       transaction.oncomplete = () => resolve();
//       transaction.onerror = (e) => reject(e);
//     });
//   }

//   // Delete all jobs (for cleanup)
//   async deleteAllJobs() {
//     await this.ready();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([STORE_NAME, BLOB_STORE_NAME], 'readwrite');
      
//       const jobStore = transaction.objectStore(STORE_NAME);
//       jobStore.clear();
      
//       const blobStore = transaction.objectStore(BLOB_STORE_NAME);
//       blobStore.clear();
      
//       transaction.oncomplete = () => resolve();
//       transaction.onerror = (e) => reject(e);
//     });
//   }

//   // Get job statistics
//   async getStats() {
//     await this.ready();
    
//     return new Promise((resolve, reject) => {
//       const transaction = this.db.transaction([STORE_NAME], 'readonly');
//       const store = transaction.objectStore(STORE_NAME);
//       const request = store.getAll();
      
//       request.onsuccess = () => {
//         const jobs = request.result || [];
//         const stats = {
//           total: jobs.length,
//           completed: jobs.filter(j => j.status === 'completed').length,
//           incomplete: jobs.filter(j => j.status !== 'completed').length,
//           errors: jobs.filter(j => j.status === 'error').length,
//           oldest: jobs.length > 0 ? Math.min(...jobs.map(j => j.timestamp)) : null,
//           newest: jobs.length > 0 ? Math.max(...jobs.map(j => j.timestamp)) : null
//         };
//         resolve(stats);
//       };
      
//       request.onerror = (e) => reject(e);
//     });
//   }
// }

// // Create singleton instance
// export const videoDB = new VideoDB();

// src/utils/db.js
const DB_NAME = 'VideoGeneratorDB';
const DB_VERSION = 3; // Increased version for schema update
const STORE_NAME = 'videoJobs';
const BLOB_STORE_NAME = 'videoBlobs';

class VideoDB {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
    this.activeTransactions = new Set();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Main jobs store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'jobId' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('progress', 'progress', { unique: false });
        }
        
        // Blob store for large data
        if (!db.objectStoreNames.contains(BLOB_STORE_NAME)) {
          const blobStore = db.createObjectStore(BLOB_STORE_NAME, { keyPath: 'id' });
          blobStore.createIndex('jobId', 'jobId', { unique: false });
          blobStore.createIndex('type', 'type', { unique: false });
          blobStore.createIndex('jobId_type', ['jobId', 'type'], { unique: false });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        
        // Add transaction cleanup handlers
        this.db.addEventListener('versionchange', () => {
          this.db.close();
        });
        
        resolve(this.db);
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  async ready() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  // Save job metadata
  async saveJob(jobId, data) {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      
      transaction.oncomplete = () => {
        this.activeTransactions.delete(transaction);
        resolve(jobData);
      };
      
      transaction.onerror = (e) => {
        this.activeTransactions.delete(transaction);
        reject(e.target.error);
      };
      
      transaction.onabort = (e) => {
        this.activeTransactions.delete(transaction);
        reject(e.target.error || new Error('Transaction aborted'));
      };
      
      this.activeTransactions.add(transaction);
      const store = transaction.objectStore(STORE_NAME);
      
      const jobData = {
        jobId,
        ...data,
        updatedAt: Date.now()
      };
      
      const request = store.put(jobData);
      
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  // Get job by ID
  async getJob(jobId) {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      
      transaction.onerror = (e) => {
        reject(e.target.error);
      };
      
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(jobId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Get all incomplete jobs
  async getIncompleteJobs() {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      
      transaction.onerror = (e) => reject(e.target.error);
      
      const store = transaction.objectStore(STORE_NAME);
      const statusIndex = store.index('status');
      
      const incompleteStatuses = ['preparing', 'generating_slides', 'slides_generated', 'encoding', 'processing', 'paused'];
      const allRequests = [];
      
      for (const status of incompleteStatuses) {
        const request = statusIndex.getAll(status);
        allRequests.push(
          new Promise((res) => {
            request.onsuccess = () => res(request.result || []);
            request.onerror = () => res([]);
          })
        );
      }
      
      Promise.all(allRequests).then(results => {
        const allJobs = results.flat();
        // Sort by timestamp (newest first)
        allJobs.sort((a, b) => b.timestamp - a.timestamp);
        resolve(allJobs);
      }).catch(reject);
    });
  }

  // Save blob data (images, audio, video) - FIXED VERSION
  async saveBlob(id, jobId, blob, type) {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      // First, read the blob as ArrayBuffer
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          // Create a new transaction for the actual save
          const transaction = db.transaction([BLOB_STORE_NAME], 'readwrite');
          
          transaction.oncomplete = () => {
            this.activeTransactions.delete(transaction);
            resolve({
              id,
              jobId,
              type,
              size: blob.size,
              timestamp: Date.now()
            });
          };
          
          transaction.onerror = (e) => {
            this.activeTransactions.delete(transaction);
            reject(e.target.error);
          };
          
          this.activeTransactions.add(transaction);
          const store = transaction.objectStore(BLOB_STORE_NAME);
          
          // Store as ArrayBuffer instead of DataURL to avoid size issues
          const blobData = {
            id,
            jobId,
            data: reader.result, // ArrayBuffer
            type,
            size: blob.size,
            timestamp: Date.now()
          };
          
          const request = store.put(blobData);
          
          request.onerror = (e) => {
            reject(e.target.error);
          };
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob); // Use ArrayBuffer instead of DataURL
    });
  }

  // Get blob by ID - FIXED VERSION
  async getBlob(id) {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOB_STORE_NAME], 'readonly');
      
      transaction.onerror = (e) => reject(e.target.error);
      
      const store = transaction.objectStore(BLOB_STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          // Convert ArrayBuffer back to blob
          const blob = new Blob([request.result.data], { 
            type: this.getMimeType(request.result.type) 
          });
          resolve({
            blob,
            type: request.result.type,
            size: request.result.size,
            timestamp: request.result.timestamp
          });
        } else {
          resolve(null);
        }
      };
      
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Helper to get MIME type from stored type
  getMimeType(type) {
    const typeMap = {
      'slide': 'image/png',
      'audio': 'audio/mpeg',
      'video': 'video/mp4',
      'image': 'image/png'
    };
    return typeMap[type] || 'application/octet-stream';
  }

  // Get all blobs for a job - OPTIMIZED VERSION
  async getBlobsByJobId(jobId) {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOB_STORE_NAME], 'readonly');
      
      transaction.onerror = (e) => reject(e.target.error);
      
      const store = transaction.objectStore(BLOB_STORE_NAME);
      const jobIdIndex = store.index('jobId');
      const request = jobIdIndex.getAll(jobId);
      
      request.onsuccess = () => {
        const items = request.result || [];
        const blobs = items.map(item => {
          try {
            const blob = new Blob([item.data], { 
              type: this.getMimeType(item.type) 
            });
            return {
              id: item.id,
              jobId: item.jobId,
              type: item.type,
              blob,
              size: item.size,
              timestamp: item.timestamp
            };
          } catch (error) {
            console.warn(`Failed to create blob ${item.id}:`, error);
            return null;
          }
        }).filter(item => item !== null);
        
        resolve(blobs);
      };
      
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Get blobs by type
  async getBlobsByType(jobId, type) {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOB_STORE_NAME], 'readonly');
      
      transaction.onerror = (e) => reject(e.target.error);
      
      const store = transaction.objectStore(BLOB_STORE_NAME);
      const compoundIndex = store.index('jobId_type');
      const request = compoundIndex.getAll([jobId, type]);
      
      request.onsuccess = () => {
        const items = request.result || [];
        const blobs = items.map(item => {
          try {
            const blob = new Blob([item.data], { 
              type: this.getMimeType(item.type) 
            });
            return {
              id: item.id,
              jobId: item.jobId,
              type: item.type,
              blob,
              size: item.size,
              timestamp: item.timestamp
            };
          } catch (error) {
            console.warn(`Failed to create blob ${item.id}:`, error);
            return null;
          }
        }).filter(item => item !== null);
        
        resolve(blobs);
      };
      
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Delete job and related data - IMPROVED VERSION
  async deleteJob(jobId) {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME, BLOB_STORE_NAME], 'readwrite');
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = (e) => reject(e.target.error);
      transaction.onabort = (e) => reject(e.target.error || new Error('Delete transaction aborted'));
      
      // Delete from jobs store
      const jobStore = transaction.objectStore(STORE_NAME);
      jobStore.delete(jobId);
      
      // Delete related blobs using range
      const blobStore = transaction.objectStore(BLOB_STORE_NAME);
      const jobIdIndex = blobStore.index('jobId');
      const range = IDBKeyRange.only(jobId);
      const request = jobIdIndex.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          blobStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
      
      request.onerror = (e) => {
        // Continue even if cursor fails
        console.warn('Error deleting blobs:', e.target.error);
      };
    });
  }

  // Delete all jobs (for cleanup)
  async deleteAllJobs() {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME, BLOB_STORE_NAME], 'readwrite');
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = (e) => reject(e.target.error);
      
      const jobStore = transaction.objectStore(STORE_NAME);
      jobStore.clear();
      
      const blobStore = transaction.objectStore(BLOB_STORE_NAME);
      blobStore.clear();
    });
  }

  // Get job statistics
  async getStats() {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      
      transaction.onerror = (e) => reject(e.target.error);
      
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const jobs = request.result || [];
        const stats = {
          total: jobs.length,
          completed: jobs.filter(j => j.status === 'completed').length,
          incomplete: jobs.filter(j => j.status !== 'completed').length,
          errors: jobs.filter(j => j.status === 'error').length,
          paused: jobs.filter(j => j.status === 'paused').length,
          oldest: jobs.length > 0 ? Math.min(...jobs.map(j => j.timestamp)) : null,
          newest: jobs.length > 0 ? Math.max(...jobs.map(j => j.timestamp)) : null,
          totalSize: jobs.reduce((sum, job) => sum + (job.fileSize || 0), 0)
        };
        resolve(stats);
      };
      
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // Cleanup method to close all transactions
  async cleanup() {
    for (const transaction of this.activeTransactions) {
      if (transaction) {
        try {
          transaction.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }
    }
    this.activeTransactions.clear();
    
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Batch save blobs (for better performance with multiple slides)
  async saveBlobsBatch(blobs) {
    const db = await this.ready();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([BLOB_STORE_NAME], 'readwrite');
      
      transaction.oncomplete = () => {
        this.activeTransactions.delete(transaction);
        resolve(blobs.length);
      };
      
      transaction.onerror = (e) => {
        this.activeTransactions.delete(transaction);
        reject(e.target.error);
      };
      
      this.activeTransactions.add(transaction);
      const store = transaction.objectStore(BLOB_STORE_NAME);
      
      let completed = 0;
      let errors = 0;
      
      const processNextBlob = (index) => {
        if (index >= blobs.length) {
          if (errors > 0) {
            reject(new Error(`${errors} blobs failed to save`));
          }
          return;
        }
        
        const { id, jobId, blob, type } = blobs[index];
        const reader = new FileReader();
        
        reader.onload = () => {
          try {
            const blobData = {
              id,
              jobId,
              data: reader.result,
              type,
              size: blob.size,
              timestamp: Date.now()
            };
            
            const request = store.put(blobData);
            request.onsuccess = () => {
              completed++;
              if (completed + errors === blobs.length) {
                // All blobs processed
              }
              processNextBlob(index + 1);
            };
            request.onerror = () => {
              errors++;
              console.warn(`Failed to save blob ${id}`);
              processNextBlob(index + 1);
            };
          } catch (error) {
            errors++;
            console.warn(`Error processing blob ${id}:`, error);
            processNextBlob(index + 1);
          }
        };
        
        reader.onerror = () => {
          errors++;
          console.warn(`Failed to read blob ${id}`);
          processNextBlob(index + 1);
        };
        
        reader.readAsArrayBuffer(blob);
      };
      
      // Start processing
      processNextBlob(0);
    });
  }

  // Check if database is healthy
  async checkHealth() {
    try {
      await this.ready();
      
      // Try a simple operation
      const stats = await this.getStats();
      
      return {
        healthy: true,
        stats,
        dbVersion: DB_VERSION,
        stores: [STORE_NAME, BLOB_STORE_NAME]
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        dbVersion: DB_VERSION
      };
    }
  }

  // Migrate old data if needed
  async migrateOldData() {
    try {
      const db = await this.ready();
      
      // Check if we need to migrate from old schema
      const transaction = db.transaction([BLOB_STORE_NAME], 'readonly');
      const store = transaction.objectStore(BLOB_STORE_NAME);
      const request = store.getAll();
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const items = request.result || [];
          let migrated = 0;
          
          // Check if any items have old data format
          for (const item of items) {
            if (typeof item.data === 'string' && item.data.startsWith('data:')) {
              // This is old DataURL format, needs migration
              migrated++;
            }
          }
          
          resolve({
            needsMigration: migrated > 0,
            itemsToMigrate: migrated,
            totalItems: items.length
          });
        };
        
        request.onerror = () => resolve({
          needsMigration: false,
          error: 'Could not check migration status'
        });
      });
    } catch (error) {
      return {
        needsMigration: false,
        error: error.message
      };
    }
  }
}

// Create singleton instance with error handling
let videoDBInstance = null;

export const getVideoDB = () => {
  if (!videoDBInstance) {
    videoDBInstance = new VideoDB();
    
    // Add error recovery
    const originalSaveBlob = videoDBInstance.saveBlob.bind(videoDBInstance);
    videoDBInstance.saveBlob = async function(...args) {
      try {
        return await originalSaveBlob(...args);
      } catch (error) {
        if (error.name === 'TransactionInactiveError' || 
            error.message.includes('transaction has finished')) {
          // Retry once
          console.log('Retrying saveBlob after transaction error...');
          return await originalSaveBlob(...args);
        }
        throw error;
      }
    };
  }
  return videoDBInstance;
};

export const videoDB = getVideoDB();

// Helper function for blob storage with retry
export const saveBlobWithRetry = async (id, jobId, blob, type, maxRetries = 2) => {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await videoDB.saveBlob(id, jobId, blob, type);
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed for blob ${id}:`, error.message);
      
      if (i < maxRetries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
      }
    }
  }
  
  throw lastError || new Error('Failed to save blob after retries');
};

// Export for testing
export const resetVideoDB = async () => {
  if (videoDBInstance) {
    await videoDBInstance.cleanup();
  }
  videoDBInstance = null;
  return getVideoDB();
};