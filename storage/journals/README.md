# Arquivo Journal de Teste

## 📄 Localização
`storage/journals/test.journal`

## 📊 Conteúdo

Este arquivo contém **3 meses de transações financeiras pessoais** (Janeiro a Março de 2026) com dados realistas:

### Receitas (Income)
- **Salário mensal:** R$ 8.500,00
- **Freelance:** R$ 2.500,00 (Jan), R$ 1.800,00 (Fev)
- **Dividendos de investimentos:** R$ 45,80 - R$ 78,50

### Despesas Fixas
- **Aluguel:** R$ 1.800,00/mês
- **Condomínio:** R$ 450,00/mês
- **Plano de Saúde:** R$ 380,00/mês
- **Internet:** R$ 119,90/mês

### Despesas Variáveis
- **Luz:** R$ 142,80 - R$ 158,90
- **Água:** R$ 78,50 - R$ 82,30
- **Supermercado:** R$ 387,50 - R$ 456,80
- **Restaurantes:** R$ 89,90 - R$ 285,00
- **Combustível:** R$ 250,00 - R$ 280,00
- **Uber:** R$ 25,50 - R$ 67,80
- **Streaming (Netflix + Spotify):** R$ 71,80
- **Cinema:** R$ 78,00
- **Farmácia:** R$ 127,30
- **Roupas:** R$ 456,90
- **Curso Udemy:** R$ 149,90
- **Viagem:** R$ 1.200,00

### Investimentos
- **Ações:** R$ 4.500,00 acumulado
- **FIIs:** R$ 2.000,00 acumulado

### Contas e Cartões
- **assets:banco:nubank** - Conta corrente principal
- **assets:banco:inter** - Conta secundária
- **liabilities:cartao:nubank** - Cartão de crédito Nubank
- **liabilities:cartao:inter** - Cartão de crédito Inter

## 🧪 Como Usar para Testes

### 1. Via Interface Web

Acesse http://localhost:5173 e vá até a página **Journal**:

1. Clique em "Escolher arquivo"
2. Selecione `storage/journals/test.journal`
3. Clique em "Enviar"

Ou simplesmente copie o arquivo para o journal principal:
```bash
cp storage/journals/test.journal storage/journals/main.journal
```

### 2. Via Linha de Comando

```bash
# Ver balance
hledger -f storage/journals/test.journal balance

# Ver income statement mensal
hledger -f storage/journals/test.journal incomestatement --monthly

# Ver register de uma conta específica
hledger -f storage/journals/test.journal register expenses:alimentacao

# Ver todas as transações
hledger -f storage/journals/test.journal register
```

### 3. Testar Relatórios na Interface

Depois de fazer upload do arquivo, você pode:

1. **Dashboard** - Ver status do journal carregado
2. **Relatórios** - Visualizar:
   - Balance Sheet
   - Register
   - Income Statement
   - Lista de Contas
3. **Projeções** - Gerar projeções baseadas nos 3 meses de histórico

## 📈 Resumo Financeiro do Arquivo

**Janeiro 2026:**
- Receitas: R$ 11.045,80
- Despesas: R$ 4.607,90
- **Saldo positivo: R$ 6.437,90**

**Fevereiro 2026:**
- Receitas: R$ 10.378,50
- Despesas: R$ 6.091,30
- **Saldo positivo: R$ 4.287,20**

**Março 2026 (parcial):**
- Receitas: R$ 8.500,00
- Despesas: R$ 2.900,70
- **Saldo positivo: R$ 5.599,30**

## 🎯 Perfeito Para Testar

- ✅ Upload de arquivo journal
- ✅ Visualização de relatórios
- ✅ Projeções financeiras (3 meses de base)
- ✅ Análise de despesas por categoria
- ✅ Income statement mensal
- ✅ Balance sheet
- ✅ Registro de transações

## 💡 Dica

Para criar suas próprias transações, use este formato:

```journal
2026-03-15 * Descrição da Transação
    expenses:categoria:subcategoria    100.00 BRL
    assets:banco:conta                -100.00 BRL
```

Ou para compras no cartão de crédito:

```journal
2026-03-15 * Compra no Cartão
    expenses:categoria                 100.00 BRL
    liabilities:cartao:nome
```
