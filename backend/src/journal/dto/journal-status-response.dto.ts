export class JournalStatusResponseDto {
  exists: boolean;
  path?: string;
  originalName?: string;
  lastUploadAt?: string;
  sizeBytes?: number;
  sha256?: string;
}
