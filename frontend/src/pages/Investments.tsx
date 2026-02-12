import { useEffect, useState } from 'react';
import { investmentsApi } from '../services/api';
import type { InvestmentDto, CreateInvestmentDto } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { TrendingUp, Plus, Trash2, PieChart } from 'lucide-react';

export default function Investments() {
  const [investments, setInvestments] = useState<InvestmentDto[]>([]);
  const [totalPatrimonio, setTotalPatrimonio] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateInvestmentDto>({
    ticker: '',
    quantidade: 0,
    precoMedio: 0,
    tipo: 'acao',
  });

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const response = await investmentsApi.list();
      setInvestments(response.data.investments);
      setTotalPatrimonio(response.data.totalPatrimonio);
    } catch (err) {
      console.error('Erro ao carregar investimentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await investmentsApi.create(formData);
      setFormData({ ticker: '', quantidade: 0, precoMedio: 0, tipo: 'acao' });
      setShowForm(false);
      loadInvestments();
    } catch (err) {
      console.error('Erro ao criar investimento:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este investimento?')) {
      try {
        await investmentsApi.delete(id);
        loadInvestments();
      } catch (err) {
        console.error('Erro ao excluir investimento:', err);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'acao': 'Ação',
      'fii': 'FII',
      'renda-fixa': 'Renda Fixa',
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investimentos</h1>
          <p className="text-gray-500 mt-2">Gerencie sua carteira de investimentos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Novo Investimento
            </>
          )}
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <PieChart className="w-6 h-6 text-blue-600" />
            Patrimônio Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-600">
            {formatCurrency(totalPatrimonio)}
          </div>
          <p className="text-gray-500 mt-2">
            {investments.length} {investments.length === 1 ? 'ativo' : 'ativos'} na carteira
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Investimento</CardTitle>
            <CardDescription>
              Preencha os dados do ativo para adicionar à sua carteira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ticker / Código
                  </label>
                  <input
                    type="text"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: PETR4"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    required
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Preço Médio (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.precoMedio}
                    onChange={(e) => setFormData({ ...formData, precoMedio: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tipo de Ativo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="acao">Ação</option>
                    <option value="fii">FII</option>
                    <option value="renda-fixa">Renda Fixa</option>
                  </select>
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Investimento
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Investments Table */}
      {investments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Minha Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ticker</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Quantidade</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Preço Médio</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Valor Total</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold">{inv.ticker}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          inv.tipo === 'acao' ? 'bg-blue-100 text-blue-700' :
                          inv.tipo === 'fii' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {getTipoLabel(inv.tipo)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right">{inv.quantidade}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(inv.precoMedio)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">
                        {formatCurrency(inv.valorTotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(inv.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="px-4 py-3 text-sm font-bold text-right">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-blue-600">
                      {formatCurrency(totalPatrimonio)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">Nenhum investimento cadastrado</p>
            <p className="text-gray-400 text-sm mb-4">Comece adicionando seus ativos à carteira</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Investimento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
