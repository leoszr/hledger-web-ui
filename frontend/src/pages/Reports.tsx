import { useState } from 'react';
import { reportsApi } from '../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { FileText, Receipt, TrendingDown, ListTree } from 'lucide-react';

type ReportType = 'balance' | 'register' | 'income-statement' | 'accounts';

export default function Reports() {
  const [reportData, setReportData] = useState<{ [key in ReportType]?: string }>({});
  const [loading, setLoading] = useState<{ [key in ReportType]?: boolean }>({});
  const [activeTab, setActiveTab] = useState<ReportType>('balance');

  const loadReport = async (type: ReportType) => {
    // Don't reload if already loaded
    if (reportData[type]) return;
    
    try {
      setLoading({ ...loading, [type]: true });
      let response;
      
      switch (type) {
        case 'balance':
          response = await reportsApi.balance();
          setReportData({ ...reportData, balance: response.data.data });
          break;
        case 'register':
          response = await reportsApi.register();
          setReportData({ ...reportData, register: response.data.data });
          break;
        case 'income-statement':
          response = await reportsApi.incomeStatement();
          setReportData({ ...reportData, 'income-statement': response.data.data });
          break;
        case 'accounts':
          const accountsResponse = await reportsApi.accounts();
          setReportData({ ...reportData, accounts: accountsResponse.data.accounts.join('\n') });
          break;
      }
    } catch (err) {
      console.error('Erro ao carregar relatório:', err);
      setReportData({ ...reportData, [type]: 'Erro ao carregar relatório' });
    } finally {
      setLoading({ ...loading, [type]: false });
    }
  };

  const handleTabChange = (value: string) => {
    const type = value as ReportType;
    setActiveTab(type);
    loadReport(type);
  };

  // Load initial report
  useState(() => {
    loadReport('balance');
  });

  const reports = [
    {
      id: 'balance' as ReportType,
      name: 'Balance Sheet',
      icon: FileText,
      description: 'Visão geral dos saldos de todas as contas',
    },
    {
      id: 'register' as ReportType,
      name: 'Registro',
      icon: Receipt,
      description: 'Histórico detalhado de todas as transações',
    },
    {
      id: 'income-statement' as ReportType,
      name: 'DRE',
      icon: TrendingDown,
      description: 'Demonstração de Resultados (Receitas vs Despesas)',
    },
    {
      id: 'accounts' as ReportType,
      name: 'Contas',
      icon: ListTree,
      description: 'Lista de todas as contas do sistema',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 mt-2">
          Visualize seus dados financeiros em diferentes formatos
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <TabsTrigger key={report.id} value={report.id} className="gap-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{report.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {reports.map((report) => (
          <TabsContent key={report.id} value={report.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <report.icon className="w-6 h-6 text-blue-600" />
                  {report.name}
                </CardTitle>
                <p className="text-sm text-gray-500">{report.description}</p>
              </CardHeader>
              <CardContent>
                {loading[report.id] ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ) : reportData[report.id] ? (
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre">
                    {reportData[report.id]}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <report.icon className="w-12 h-12 mb-4 text-gray-300" />
                    <p>Carregue o relatório para visualizar os dados</p>
                    <Button 
                      onClick={() => loadReport(report.id)} 
                      className="mt-4"
                      variant="outline"
                    >
                      Carregar {report.name}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
