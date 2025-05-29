// Type declarations for lib modules
declare module '@/lib/utils' {
  export function cn(...inputs: any[]): string;
}

declare module '@/lib/db' {
  export const prisma: any;
}

declare module '@/lib/db/index.js' {
  export const prisma: any;
}

declare module '@/lib/auth' {
  export const auth: () => Promise<any>;
}

declare module '@/lib/auth/index.js' {
  export const auth: () => Promise<any>;
}

declare module '@/lib/outbox' {
  export function createOutboxEvent(type: string, payload: any, aggregateId: string): Promise<any>;
}

declare module '@/lib/outbox/index.js' {
  export function createOutboxEvent(type: string, payload: any, aggregateId: string): Promise<any>;
  export function createOutboxEventInTransaction(type: string, payload: any, aggregateId: string): Promise<any>;
  export enum ImportEventType {
    IMPORT_JOB_CREATED = 'IMPORT_JOB_CREATED',
    IMPORT_BATCH_CREATED = 'IMPORT_BATCH_CREATED',
    IMPORT_DATA_PROCESSED = 'IMPORT_DATA_PROCESSED',
  }
}
