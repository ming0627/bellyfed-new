// Type declarations for app modules
declare module '@/app/actions/imports' {
  export function createImportJob(formData: FormData): Promise<any>;
  export function createImportBatch(formData: FormData): Promise<any>;
  export function processImportData(formData: FormData): Promise<any>;
  export function getImportJobStatus(formData: FormData): Promise<any>;
}
