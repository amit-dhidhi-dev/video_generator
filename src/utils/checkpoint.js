// src/utils/checkpoint.js
import { videoDB } from './db.js';

export class CheckpointManager {
  constructor(jobId) {
    this.jobId = jobId;
    this.checkpoints = [];
    this.autoSaveInterval = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (!this.isInitialized) {
      await videoDB.ready();
      this.isInitialized = true;
    }
  }

  async saveCheckpoint(status, progress, data = {}, error = null) {
    await this.initialize();
    
    const checkpoint = {
      jobId: this.jobId,
      status,
      progress,
      data,
      error,
      timestamp: Date.now()
    };

    this.checkpoints.push(checkpoint);
    
    // Keep only recent checkpoints (last 20)
    if (this.checkpoints.length > 20) {
      this.checkpoints = this.checkpoints.slice(-20);
    }

    // Save to IndexedDB
    const jobData = {
      ...checkpoint,
      checkpoints: [...this.checkpoints]
    };

    await videoDB.saveJob(this.jobId, jobData);

    // Save to localStorage for quick access
    try {
      localStorage.setItem(`checkpoint_${this.jobId}`, JSON.stringify(checkpoint));
      localStorage.setItem('lastActiveJob', this.jobId);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    return checkpoint;
  }

  async getLastCheckpoint() {
    await this.initialize();
    
    // First try localStorage (faster)
    try {
      const saved = localStorage.getItem(`checkpoint_${this.jobId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('LocalStorage read failed:', e);
    }
    
    // Then try IndexedDB
    const job = await videoDB.getJob(this.jobId);
    return job || null;
  }

  async getAllCheckpoints() {
    await this.initialize();
    const job = await videoDB.getJob(this.jobId);
    return job?.checkpoints || [];
  }

  async resumeFromLastCheckpoint() {
    const checkpoint = await this.getLastCheckpoint();
    
    if (!checkpoint) {
      throw new Error('No checkpoint found for this job');
    }

    // Calculate how old the checkpoint is
    const age = Date.now() - checkpoint.timestamp;
    const MAX_AGE = 60 * 60 * 1000; // 1 hour
    
    if (age > MAX_AGE) {
      await this.clearCheckpoints();
      throw new Error('Checkpoint is too old (older than 1 hour). Please start again.');
    }

    // Load all checkpoints
    const job = await videoDB.getJob(this.jobId);
    this.checkpoints = job?.checkpoints || [];

    return checkpoint;
  }

  async clearCheckpoints() {
    await this.initialize();
    
    try {
      localStorage.removeItem(`checkpoint_${this.jobId}`);
      localStorage.removeItem('lastActiveJob');
    } catch (e) {
      console.warn('LocalStorage clear failed:', e);
    }
    
    await videoDB.deleteJob(this.jobId);
    this.checkpoints = [];
  }

  async saveBlob(blobId, blob, type) {
    await this.initialize();
    return await videoDB.saveBlob(blobId, this.jobId, blob, type);
  }

  async getBlobs() {
    await this.initialize();
    return await videoDB.getBlobsByJobId(this.jobId);
  }

  async getBlob(blobId) {
    await this.initialize();
    return await videoDB.getBlob(blobId);
  }

  async getBlobsByType(type) {
    await this.initialize();
    const allBlobs = await this.getBlobs();
    return allBlobs.filter(blob => blob.type === type);
  }

  startAutoSave(callback, interval = 10000) {
    this.stopAutoSave();
    
    this.autoSaveInterval = setInterval(async () => {
      try {
        const state = callback();
        await this.saveCheckpoint(
          state.status,
          state.progress,
          state.data
        );
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, interval);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  async exportCheckpoints() {
    const job = await videoDB.getJob(this.jobId);
    const blobs = await this.getBlobs();
    
    return {
      job,
      blobs: blobs.map(b => ({
        id: b.id,
        type: b.type,
        size: b.blob.size,
        timestamp: b.timestamp
      }))
    };
  }

  async importCheckpoints(data) {
    await this.clearCheckpoints();
    
    if (data.job) {
      await videoDB.saveJob(this.jobId, data.job);
    }
    
    if (data.blobs && Array.isArray(data.blobs)) {
      for (const blobInfo of data.blobs) {
        // Note: Actual blob data would need to be provided separately
        console.log('Would import blob:', blobInfo);
      }
    }
  }
}