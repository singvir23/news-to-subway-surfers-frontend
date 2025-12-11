import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

export interface JobMetadata {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  text: string;
  createdAt: number;
  videoUrl?: string;
  error?: string;
  progress?: string;
}

const JOBS_DIR = path.join(process.cwd(), 'public', 'jobs');

// Ensure jobs directory exists
function ensureJobsDir() {
  if (!existsSync(JOBS_DIR)) {
    mkdirSync(JOBS_DIR, { recursive: true });
  }
}

// Get path for a job metadata file
function getJobPath(jobId: string): string {
  return path.join(JOBS_DIR, `${jobId}.json`);
}

// Save job metadata to local filesystem
export function saveJobMetadata(jobId: string, metadata: JobMetadata): void {
  ensureJobsDir();
  const jobPath = getJobPath(jobId);
  writeFileSync(jobPath, JSON.stringify(metadata, null, 2), 'utf-8');
}

// Read job metadata from local filesystem
export function getJobMetadata(jobId: string): JobMetadata | null {
  const jobPath = getJobPath(jobId);

  if (!existsSync(jobPath)) {
    return null;
  }

  try {
    const data = readFileSync(jobPath, 'utf-8');
    return JSON.parse(data) as JobMetadata;
  } catch (error) {
    console.error(`Failed to read job metadata for ${jobId}:`, error);
    return null;
  }
}

// Update job metadata (merge with existing)
export function updateJobMetadata(jobId: string, updates: Partial<JobMetadata>): void {
  const currentMetadata = getJobMetadata(jobId);

  if (!currentMetadata) {
    throw new Error(`Job ${jobId} not found`);
  }

  const updatedMetadata = { ...currentMetadata, ...updates };
  saveJobMetadata(jobId, updatedMetadata);
}
