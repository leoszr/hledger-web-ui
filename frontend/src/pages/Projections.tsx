import { useState } from 'react';
import { projectionsApi } from '../services/api';
import type { RunProjectionDto, ProjectionDto } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar, Activity } from 'lucide-react';

export default function Projections() {
  const [formData, setFormData] = useState<RunProjectionDto>({
    baseMonths: 3,
    horizonMonths: 6,
    method: 'average',
  });
  const [projection, setProjection] = useState<ProjectionDto | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await projectionsApi.run(formData);
      setProjection(response.data.projection);
    } catch (err) {
      console.error('Erro ao criar projeção:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Prepare chart data
  const chartData = projection?.results.map((result) => ({
    month: result.month,
    Receita: result.projectedIncome,
    Despesas: result.projectedExpenses,
    Saldo: result.projectedBalance,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Projeções Financeiras</h1>
        <p className="text-gray-500 mt-2">
          Crie projeções baseadas em dados históricos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Configurar Projeção
          </CardTitle>
          <CardDescription>
            Defina os parâmetros para gerar uma nova projeção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Meses Base (histórico)
                </label>
                <input
                  type="number"
                  value={formData.baseMonths}
                  onChange={(e) => setFormData({ ...formData, baseMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                  max="24"
                />
                <p className="text-xs text-gray-500">
                  Quantos meses usar como base
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Meses Horizonte (projeção)
                </label>
                <input
                  type="number"
                  value={formData.horizonMonths}
                  onChange={(e) => setFormData({ ...formData, horizonMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                  max="24"
                />
                <p className="text-xs text-gray-500">
                  Quantos meses projetar
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Método de Cálculo
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="average">Média Simples</option>
                  <option value="linear">Tendência Linear</option>
                </select>
                <p className="text-xs text-gray-500">
                  Como calcular a projeção
                </p>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? 'Gerando Projeção...' : 'Gerar Projeção'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      )}

      {projection && !loading && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Receita Mensal Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(projection.results[0]?.projectedIncome || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Despesas Mensais Médias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(projection.results[0]?.projectedExpenses || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Saldo Projetado Final
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(projection.results[projection.results.length - 1]?.projectedBalance || 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Projeção ao Longo do Tempo
              </CardTitle>
              <CardDescription>
                Baseado em {projection.parameters.baseMonths} meses de histórico, 
                projetando {projection.parameters.horizonMonths} meses usando método {projection.parameters.method === 'average' ? 'média' : 'linear'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="Receita" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Despesas" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Saldo" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Detalhamento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mês</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Receita</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Despesas</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projection.results.map((result, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{result.month}</td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">
                          {formatCurrency(result.projectedIncome)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">
                          {formatCurrency(result.projectedExpenses)}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-semibold ${
                          result.projectedBalance >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(result.projectedBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
