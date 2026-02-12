import { Injectable, Logger } from '@nestjs/common';
import { readFile, writeFile, rename, unlink } from 'fs/promises';
import { existsSync } from 'fs';

/**
 * Serviço para leitura e escrita atômica de arquivos JSON
 * 
 * Garante que:
 * - Leituras retornam fallback se o arquivo não existir
 * - Escritas são atômicas (escreve em tmp e depois renomeia)
 * - Dados são sempre válidos (parse/stringify com validação)
 */
@Injectable()
export class JsonStorageService {
  private readonly logger = new Logger(JsonStorageService.name);

  /**
   * Lê um arquivo JSON do disco
   * 
   * @param filePath Caminho absoluto do arquivo
   * @param fallback Valor padrão se o arquivo não existir
   * @returns Dados parseados ou fallback
   */
  async readJson<T>(filePath: string, fallback: T): Promise<T> {
    try {
      // Verifica se o arquivo existe
      if (!existsSync(filePath)) {
        this.logger.log(`Arquivo não encontrado: ${filePath}, usando fallback`);
        return fallback;
      }

      // Lê e faz parse do JSON
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as T;
      
      this.logger.debug(`JSON lido com sucesso: ${filePath}`);
      return data;
    } catch (error) {
      this.logger.error(`Erro ao ler JSON: ${filePath}`, error);
      this.logger.warn(`Retornando fallback devido ao erro`);
      return fallback;
    }
  }

  /**
   * Escreve um arquivo JSON no disco de forma atômica
   * 
   * Processo:
   * 1. Serializa os dados para JSON
   * 2. Escreve em arquivo temporário (.tmp)
   * 3. Renomeia o arquivo temporário para o nome final
   * 
   * Isso garante que o arquivo nunca fica em estado inválido,
   * mesmo se houver falha durante a escrita.
   * 
   * @param filePath Caminho absoluto do arquivo
   * @param data Dados a serem escritos
   */
  async writeJsonAtomic<T>(filePath: string, data: T): Promise<void> {
    const tmpPath = `${filePath}.tmp`;

    try {
      // Serializa para JSON com indentação
      const content = JSON.stringify(data, null, 2);

      // Escreve no arquivo temporário
      await writeFile(tmpPath, content, 'utf-8');
      this.logger.debug(`Arquivo temporário escrito: ${tmpPath}`);

      // Renomeia (operação atômica no filesystem)
      await rename(tmpPath, filePath);
      this.logger.log(`JSON escrito com sucesso: ${filePath}`);
    } catch (error) {
      this.logger.error(`Erro ao escrever JSON: ${filePath}`, error);

      // Tenta limpar o arquivo temporário se houver erro
      try {
        if (existsSync(tmpPath)) {
          await unlink(tmpPath);
          this.logger.debug(`Arquivo temporário removido: ${tmpPath}`);
        }
      } catch (cleanupError) {
        this.logger.warn(`Não foi possível remover arquivo temporário: ${tmpPath}`);
      }

      throw error;
    }
  }

  /**
   * Verifica se um arquivo JSON existe
   * 
   * @param filePath Caminho absoluto do arquivo
   * @returns true se o arquivo existe
   */
  fileExists(filePath: string): boolean {
    return existsSync(filePath);
  }

  /**
   * Inicializa um arquivo JSON com valor padrão se não existir
   * 
   * @param filePath Caminho absoluto do arquivo
   * @param defaultValue Valor padrão para inicialização
   */
  async ensureJsonFile<T>(filePath: string, defaultValue: T): Promise<void> {
    if (!this.fileExists(filePath)) {
      this.logger.log(`Inicializando arquivo JSON: ${filePath}`);
      await this.writeJsonAtomic(filePath, defaultValue);
    }
  }
}
