import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

/**
 * Configuração centralizada de paths do sistema
 * 
 * Durante desenvolvimento: usa ./storage relativo ao projeto
 * Em produção (Docker): usa /app/storage
 */

// Detecta se está rodando em ambiente de produção (Docker)
const isProduction = process.env.NODE_ENV === 'production';

// Root do storage
export const STORAGE_ROOT = isProduction 
  ? '/app/storage'
  : join(process.cwd(), '..', 'storage');

// Diretórios principais
export const JOURNALS_DIR = join(STORAGE_ROOT, 'journals');
export const DATA_DIR = join(STORAGE_ROOT, 'data');

// Arquivo principal do journal
export const JOURNAL_PATH = join(JOURNALS_DIR, 'main.journal');

// Arquivos JSON de dados auxiliares
export const SETTINGS_JSON = join(DATA_DIR, 'settings.json');
export const PROJECTIONS_JSON = join(DATA_DIR, 'projections.json');
export const INVESTMENTS_JSON = join(DATA_DIR, 'investments.json');
export const RULES_JSON = join(DATA_DIR, 'rules.json');

/**
 * Garante que os diretórios de storage existem
 * Cria os diretórios se não existirem
 */
export function ensureStorageDirectories(): void {
  const directories = [
    STORAGE_ROOT,
    JOURNALS_DIR,
    DATA_DIR,
  ];

  for (const dir of directories) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`[Paths] Diretório criado: ${dir}`);
    }
  }

  console.log(`[Paths] Storage root: ${STORAGE_ROOT}`);
  console.log(`[Paths] Journal path: ${JOURNAL_PATH}`);
}

/**
 * Retorna informações sobre os paths configurados
 */
export function getPathsInfo() {
  return {
    environment: isProduction ? 'production' : 'development',
    storageRoot: STORAGE_ROOT,
    journalsDir: JOURNALS_DIR,
    dataDir: DATA_DIR,
    journalPath: JOURNAL_PATH,
    settingsJson: SETTINGS_JSON,
    projectionsJson: PROJECTIONS_JSON,
    investmentsJson: INVESTMENTS_JSON,
    rulesJson: RULES_JSON,
  };
}

/**
 * Objeto agregado com todos os paths (facilita imports)
 */
export const PATHS = {
  STORAGE_ROOT,
  JOURNALS_DIR,
  DATA_DIR,
  JOURNAL_PATH,
  SETTINGS_JSON,
  PROJECTIONS_JSON,
  INVESTMENTS_JSON,
  RULES_JSON,
};
