/**
 * DTO de resposta do endpoint de health
 */
export class HealthResponseDto {
  /** Status geral da API */
  status: 'ok' | 'error';

  /** Timestamp da verificação */
  timestamp: string;

  /** Informações sobre o hledger */
  hledger: {
    /** Se o hledger está disponível no sistema */
    available: boolean;
    /** Versão do hledger (se disponível) */
    version: string | null;
  };

  /** Informações sobre o journal */
  journal: {
    /** Se o arquivo journal existe */
    exists: boolean;
    /** Caminho do arquivo journal */
    path: string;
  };
}
