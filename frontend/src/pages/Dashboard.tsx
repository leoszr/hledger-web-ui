import { useEffect, useState } from 'react';
import { healthApi, chartsApi, investmentsApi } from '../services/api';
import type { HealthResponse, ExpensesByAccountResponse, InvestmentListResponseDto } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, Wallet, DollarSign, PiggyBank } from 'lucide-react';

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [expenses, setExpenses] = useState<ExpensesByAccountResponse | null>(null);
  const [investments, setInvestments] = useState<InvestmentListResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [healthRes, expensesRes, investmentsRes] = await Promise.all([
        healthApi.check(),
        chartsApi.expensesByAccount(),
        investmentsApi.list(),
      ]);
      
      setHealth(healthRes.data);
      setExpenses(expensesRes.data);
      setInvestments(investmentsRes.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error(err);
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

  // Calculate totals
  const totalExpenses = expenses?.data.reduce((sum, item) => sum + Math.abs(item.amount), 0) || 0;
  const totalInvestments = investments?.totalPatrimonio || 0;
  
  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {health && health.status === 'ok' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Sistema Online
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Investimentos
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalInvestments)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {investments?.investments.length || 0} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Despesas Totais
            </CardTitle>
            <Wallet className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {expenses?.data.length || 0} categorias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              hledger
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {health?.hledger.available ? 'Ativo' : 'Inativo'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              v{health?.hledger.version}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Journal
            </CardTitle>
            <PiggyBank className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {health?.journal.exists ? 'OK' : 'Ausente'}
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {health?.journal.path.split('/').pop()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart - Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses && expenses.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenses.data.map(item => ({
                      name: item.account.replace('expenses:', ''),
                      value: Math.abs(item.amount),
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenses.data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Sem dados de despesas
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Maiores Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses && expenses.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={expenses.data
                    .map(item => ({
                      category: item.account.replace('expenses:', '').replace(/:/g, ' > '),
                      value: Math.abs(item.amount),
                    }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 8)
                  }
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={150} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Sem dados de despesas
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/reports"
              className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                📊
              </div>
              <div>
                <div className="font-medium">Ver Relatórios</div>
                <div className="text-sm text-gray-500">Balance, registro, etc</div>
              </div>
            </a>

            <a
              href="/investments"
              className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                💰
              </div>
              <div>
                <div className="font-medium">Investimentos</div>
                <div className="text-sm text-gray-500">Gerenciar carteira</div>
              </div>
            </a>

            <a
              href="/projections"
              className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                📈
              </div>
              <div>
                <div className="font-medium">Criar Projeção</div>
                <div className="text-sm text-gray-500">Planejar futuro</div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
