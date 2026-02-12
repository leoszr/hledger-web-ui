import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { JOURNAL_PATH } from '../config/paths';

const execFileAsync = promisify(execFile);

/**
 * Opções para execução de comandos hledger
 */
export interface RunOptions {
  /** Timeout em milissegundos (padrão: 5000ms) */
  timeout?: number;
  /** Tamanho máximo do buffer de saída em bytes (padrão: 10MB) */
  maxBuffer?: number;
}

/**
 * Serviço para execução segura de comandos hledger
 * 
 * Garante:
 * - Apenas comandos permitidos são executados
 * - Sempre usa o journal configurado
 * - Timeout para evitar travamento
 * - Limite de buffer para evitar overflow
 * - Validação de parâmetros
 */
@Injectable()
export class HledgerRunnerService {
  private readonly logger = new Logger(HledgerRunnerService.name);
  private readonly DEFAULT_TIMEOUT = 5000; // 5 segundos
  private readonly DEFAULT_MAX_BUFFER = 10 * 1024 * 1024; // 10 MB

  /**
   * Comandos hledger permitidos
   * Lista branca de comandos seguros
   */
  private readonly ALLOWED_COMMANDS = [
    'balance',
    'register',
    'is', // income statement
    'bs', // balance sheet
    'cf', // cash flow
    'accounts',
    'commodities',
    'stats',
    '--version',
  ];

  /**
   * Executa um comando hledger de forma segura
   * 
   * @param command Comando hledger (ex: 'balance', 'register')
   * @param args Argumentos adicionais
   * @param options Opções de execução
   * @returns Saída do comando
   * @throws Error se comando não for permitido ou houver erro na execução
   */
  async runCommand(
    command: string,
    args: string[] = [],
    options: RunOptions = {},
  ): Promise<string> {
    // Valida comando
    if (!this.ALLOWED_COMMANDS.includes(command)) {
      const error = `Comando não permitido: ${command}`;
      this.logger.error(error);
      throw new Error(error);
    }

    // Prepara argumentos
    const hledgerArgs = this.buildArguments(command, args);

    // Opções de execução
    const execOptions = {
      timeout: options.timeout || this.DEFAULT_TIMEOUT,
      maxBuffer: options.maxBuffer || this.DEFAULT_MAX_BUFFER,
    };

    this.logger.debug(`Executando: hledger ${hledgerArgs.join(' ')}`);

    try {
      const { stdout, stderr } = await execFileAsync(
        'hledger',
        hledgerArgs,
        execOptions,
      );

      if (stderr) {
        this.logger.warn(`hledger stderr: ${stderr}`);
      }

      this.logger.debug(`Comando executado com sucesso: ${command}`);
      return stdout;
    } catch (error) {
      this.logger.error(`Erro ao executar hledger ${command}:`, error.message);
      
      // Trata timeout
      if (error.killed) {
        throw new Error(`Timeout ao executar comando hledger: ${command}`);
      }

      // Trata outros erros
      throw new Error(`Erro ao executar hledger: ${error.message}`);
    }
  }

  /**
   * Constrói a lista de argumentos para o hledger
   * Sempre inclui -f journal_path
   * 
   * @param command Comando principal
   * @param args Argumentos adicionais
   * @returns Array de argumentos
   */
  private buildArguments(command: string, args: string[]): string[] {
    const allArgs = ['-f', JOURNAL_PATH];

    // Adiciona o comando (se não for --version)
    if (!command.startsWith('--')) {
      allArgs.push(command);
    } else {
      allArgs.push(command);
      return allArgs; // --version não precisa de mais argumentos
    }

    // Adiciona argumentos adicionais (já validados)
    allArgs.push(...args);

    return allArgs;
  }

  /**
   * Verifica se o hledger está disponível no sistema
   * 
   * @returns Promise<boolean>
   */
  async isHledgerAvailable(): Promise<boolean> {
    try {
      await execFileAsync('which', ['hledger'], { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém a versão do hledger instalado
   * 
   * @returns Versão (ex: "1.51.2") ou null se não disponível
   */
  async getVersion(): Promise<string | null> {
    try {
      const output = await this.runCommand('--version', [], { timeout: 2000 });
      // Extrai versão da saída (ex: "hledger 1.51.2")
      const match = output.match(/hledger\s+([\d.]+)/);
      return match ? match[1] : null;
    } catch (error) {
      this.logger.error('Erro ao obter versão do hledger:', error.message);
      return null;
    }
  }

  /**
   * Verifica se o arquivo journal existe
   * 
   * @returns boolean
   */
  journalExists(): boolean {
    return existsSync(JOURNAL_PATH);
  }

  /**
   * Obtém o caminho do journal configurado
   * 
   * @returns string
   */
  getJournalPath(): string {
    return JOURNAL_PATH;
  }

  /**
   * Valida e sanitiza parâmetros comuns de filtros
   * 
   * @param params Parâmetros a validar
   * @returns Array de argumentos sanitizados
   */
  buildFilterArgs(params: {
    from?: string;
    to?: string;
    account?: string;
  }): string[] {
    const args: string[] = [];

    // Data inicial
    if (params.from) {
      const date = this.validateDate(params.from);
      if (date) {
        args.push('--begin', date);
      }
    }

    // Data final
    if (params.to) {
      const date = this.validateDate(params.to);
      if (date) {
        args.push('--end', date);
      }
    }

    // Filtro de conta
    if (params.account) {
      const account = this.sanitizeAccountName(params.account);
      if (account) {
        args.push(account);
      }
    }

    return args;
  }

  /**
   * Valida formato de data (YYYY-MM-DD)
   * 
   * @param date Data para validar
   * @returns Data válida ou null
   */
  private validateDate(date: string): string | null {
    // Aceita formato ISO: YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      this.logger.warn(`Data inválida: ${date}`);
      return null;
    }
    return date;
  }

  /**
   * Sanitiza nome de conta para evitar injeção
   * 
   * @param account Nome da conta
   * @returns Nome sanitizado ou null
   */
  private sanitizeAccountName(account: string): string | null {
    // Permite apenas letras, números, : e _
    const sanitized = account.replace(/[^a-zA-Z0-9:_-]/g, '');
    if (sanitized !== account) {
      this.logger.warn(`Conta sanitizada: ${account} -> ${sanitized}`);
    }
    return sanitized || null;
  }
}
