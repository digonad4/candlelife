
# Plano de Correção: Autenticação, Navegação Desktop e Gráfico

## Resumo dos Problemas Identificados

1. **Navegação Desktop Invisível**: O menu lateral não aparece em telas maiores (desktop/web)
2. **Sistema de Autenticação Incompleto**: Falta redirecionamento de email, confirmação e recuperação de senha
3. **Gráfico com Dados Agregados**: O gráfico mostra velas por dia ao invés de uma vela por transação

---

## Parte 1: Corrigir Navegação Desktop

### Problema
O layout `MobileOptimizedLayout.tsx` usa condicionais conflitantes que escondem a sidebar em desktop. A sidebar usa classes `hidden md:block` mas o wrapper aplica transformações que podem sobrescrever isso.

### Solucao
Simplificar o layout para garantir que a sidebar apareça corretamente em desktop:

**Arquivo: `src/components/layout/MobileOptimizedLayout.tsx`**
- Remover a lógica de transformação condicional do wrapper da sidebar
- Usar o componente Sidebar padrão que já tem a lógica de responsividade embutida
- Garantir que em desktop (`!isMobile`) a sidebar esteja sempre visível

---

## Parte 2: Sistema de Autenticacao Completo

### 2.1 Corrigir SignUpForm
**Arquivo: `src/components/auth/SignUpForm.tsx`**
- Adicionar `emailRedirectTo: window.location.origin` nas opções de signup
- Melhorar mensagens de erro para usuários já cadastrados
- Adicionar validação de email com regex

### 2.2 Adicionar Link "Esqueci a Senha"
**Arquivo: `src/components/auth/LoginForm.tsx`**
- Adicionar link "Esqueci minha senha"
- Criar modal ou fluxo de recuperação

### 2.3 Criar Fluxo de Recuperacao de Senha
**Novo arquivo: `src/components/auth/ForgotPasswordForm.tsx`**
- Formulário para solicitar reset de senha
- Chamar `supabase.auth.resetPasswordForEmail()`
- Exibir mensagem de confirmação

### 2.4 Atualizar Pagina de Login
**Arquivo: `src/pages/Login.tsx`**
- Adicionar estado para controlar qual formulário exibir (login/signup/forgot)
- Integrar o novo componente de recuperação de senha

### 2.5 Melhorar Feedback ao Usuario
- Mensagens claras sobre confirmação de email necessária
- Alerta visível quando email de confirmação for enviado
- Tratamento de erros específicos (email já existe, senha fraca, etc.)

---

## Parte 3: Corrigir Grafico de Velas

### Problema
Existem duas funções SQL conflitantes:
1. `refresh_user_ohlc` - Gera uma vela por transação (correto)
2. `recalculate_ohlc_for_date` - Agrega por data (incorreto para o requisito)

O trigger de transações está chamando `recalculate_ohlc_for_date` que agrega por dia.

### Solucao

**Migracao SQL**: Atualizar o trigger para chamar `refresh_user_ohlc` ao invés de `recalculate_ohlc_for_date`

```text
+---------------------+
| Trigger Atual       |
| (por data)          |
+----------+----------+
           |
           v
+---------------------+
| Novo Trigger        |
| (refresh completo)  |
+---------------------+
```

A função `refresh_user_ohlc` já existe e gera uma vela por transação corretamente:
- Income: vela verde (open < close)
- Expense: vela vermelha (open > close)
- Saldo acumulado calculado sequencialmente

---

## Parte 4: Limpeza e Melhorias de Design

### 4.1 Centralizar Pagina de Login
**Arquivo: `src/pages/Login.tsx`**
- Garantir centralização vertical e horizontal
- Melhorar responsividade do card

### 4.2 Remover Arquivos Nao Utilizados
Verificar e remover componentes órfãos após as mudanças.

---

## Ordem de Implementacao

| Etapa | Tarefa | Prioridade |
|-------|--------|------------|
| 1 | Corrigir navegação desktop (MobileOptimizedLayout) | Alta |
| 2 | Adicionar emailRedirectTo no SignUpForm | Alta |
| 3 | Criar ForgotPasswordForm | Media |
| 4 | Atualizar Login.tsx com fluxo completo | Media |
| 5 | Corrigir trigger SQL para velas individuais | Alta |
| 6 | Testar gráfico com novas transações | Alta |

---

## Resultado Esperado

1. Menu lateral visível em desktop com todas as opções de navegação
2. Usuários podem se cadastrar e receberão email de confirmação funcionando
3. Usuários podem recuperar senha esquecida
4. Cada transação aparece como uma vela individual no gráfico:
   - +R$50 = vela verde
   - -R$30 = vela vermelha
   - Saldo acumulado exibido corretamente

