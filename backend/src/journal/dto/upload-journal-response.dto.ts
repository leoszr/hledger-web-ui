export class UploadJournalResponseDto {
  success: boolean;
  message: string;
  journal: {
    path: string;
    originalName: string;
    sizeBytes: number;
    sha256: string;
    uploadedAt: string;
  };
}
