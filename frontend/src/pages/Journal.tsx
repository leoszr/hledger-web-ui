import { useEffect, useState } from 'react';
import { journalApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Upload, FileText, CheckCircle, XCircle, Calendar, HardDrive } from 'lucide-react';

export default function Journal() {
  const [status, setStatus] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await journalApi.status();
      setStatus(response.data);
    } catch (err) {
      console.error('Erro ao carregar status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await journalApi.upload(selectedFile);
      alert('Journal enviado com sucesso!');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      loadStatus();
    } catch (err) {
      console.error('Erro ao enviar journal:', err);
      alert('Erro ao enviar journal');
    } finally {
      setUploading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
        <p className="text-gray-500 mt-2">
          Gerencie o arquivo journal principal do hledger
        </p>
      </div>

      {/* Status Card */}
      <Card className={`border-l-4 ${status?.exists ? 'border-l-green-600' : 'border-l-red-600'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.exists ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            Status do Journal
          </CardTitle>
          <CardDescription>
            Informações sobre o arquivo journal atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-gray-600">Caminho do Arquivo</div>
              <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                {status?.path}
              </div>
            </div>
          </div>

          {status?.originalName && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-600">Nome Original</div>
                <div className="text-sm text-gray-900 mt-1">{status.originalName}</div>
              </div>
            </div>
          )}

          {status?.lastUploadAt && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-600">Último Upload</div>
                <div className="text-sm text-gray-900 mt-1">
                  {new Date(status.lastUploadAt).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          )}

          {status?.sizeBytes && (
            <div className="flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-gray-600">Tamanho do Arquivo</div>
                <div className="text-sm text-gray-900 mt-1">
                  {formatBytes(status.sizeBytes)}
                </div>
              </div>
            </div>
          )}

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            status?.exists 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {status?.exists ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Arquivo Ativo
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Arquivo Não Encontrado
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Upload de Journal
          </CardTitle>
          <CardDescription>
            Envie um novo arquivo journal (.journal ou .txt)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".journal,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Clique para selecionar um arquivo
              </p>
              <p className="text-xs text-gray-500">
                Arquivos .journal ou .txt
              </p>
            </label>
          </div>

          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Atenção</p>
                <p className="text-xs">
                  O upload de um novo journal irá substituir o arquivo atual. 
                  Certifique-se de fazer backup antes de prosseguir.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
