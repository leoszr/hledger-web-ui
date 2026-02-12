export class ReportResponseDto {
  success: boolean;
  data: any; // JSON parseado do hledger
  rawOutput?: string; // Output raw opcional
}
