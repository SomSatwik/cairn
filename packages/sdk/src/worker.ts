import { hashBuffer } from './hash';

export interface WorkerHashRequest {
  id: string;
  type: 'HASH_FILE';
  file: File;
}

export interface WorkerHashProgress {
  id: string;
  type: 'HASH_PROGRESS';
  progress: number;
}

export interface WorkerHashResponse {
  id: string;
  type: 'HASH_COMPLETE';
  hash: string;
}

export interface WorkerHashError {
  id: string;
  type: 'HASH_ERROR';
  error: string;
}

export type WorkerMessage =
  | WorkerHashProgress
  | WorkerHashResponse
  | WorkerHashError;

if (typeof self !== 'undefined') {
  self.onmessage = async (event: MessageEvent<WorkerHashRequest>) => {
    const { id, type, file } = event.data;
    if (type !== 'HASH_FILE' || !file) return;

    try {
      const buffer = await file.arrayBuffer();
      const hash = await hashBuffer(buffer);
      self.postMessage({ id, type: 'HASH_COMPLETE', hash } satisfies WorkerHashResponse);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      self.postMessage({ id, type: 'HASH_ERROR', error: message } satisfies WorkerHashError);
    }
  };
}
