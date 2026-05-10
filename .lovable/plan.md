
## Problemas identificados

Após inspecionar `MobileOptimizedLayout`, `index.css`, `NativeHeader` e as páginas (`Dashboard`, `Transactions`, `Analytics`, `Clients`, `InvoicedTransactions`):

1. **Largura**: As páginas usam `max-w-7xl mx-auto` mas dentro de um `<main>` com `px-3` que não está expandindo corretamente em todas as rotas. Algumas páginas têm wrappers extras (`Card`, divs internas) que limitam a largura.
2. **Scroll quebrado**: Em `index.css` há `body { position: fixed; inset: 0; overflow: hidden }` e `#root { overflow: hidden }`. Isso bloqueia a rolagem nativa no navegador móvel — o `<main>` tem `overflow-y-auto`, mas o conteúdo não rola por causa do bloqueio global e da combinação com `overscroll-behavior-y: none` + `user-select: none` no body.
3. **Títulos duplicados**: O `NativeHeader` já renderiza o título da rota ("Dashboard", "Trading", "Análise", "Clientes", "Faturadas"), mas cada página também renderiza o próprio `<h1>` interno → título aparece duas vezes.
4. **Google Auth**: Não existe nenhum botão OAuth no `LoginForm` / `SignUpForm`.
5. **Capacitor**: Está em `^7.4.4` (todos os pacotes `@capacitor/*`). Bumpar para a última versão estável.

---

## Plano de execução

### 1. Corrigir scroll e largura (CSS global + layout)

**`src/index.css`**
- Remover `body { position: fixed; inset: 0; overflow: hidden }` e `#root { overflow: hidden }` — esses bloqueios estão impedindo o scroll natural no navegador móvel.
- Substituir por: `html, body, #root { height: 100%; width: 100%; }` e manter apenas `overscroll-behavior-y: none` no body para evitar pull-to-refresh do browser.
- Manter `user-select: none` apenas em elementos UI (botões/nav), não no body inteiro.

**`src/components/layout/MobileOptimizedLayout.tsx`**
- Garantir `<main>` com `w-full`, `min-h-0` correto e `flex-1`.
- Reduzir `px-3` para `px-0` no main e deixar cada página controlar seu próprio padding (`px-3`/`px-4`), evitando duplicação.
- Wrapper interno passa de `max-w-7xl` para `w-full` em mobile (o `max-w-7xl` continua válido só em desktop).

### 2. Remover títulos duplicados

Remover o `<h1>` interno (e o "header" próprio das páginas) quando `useIsMobile()` for `true`, já que o `NativeHeader` já mostra o título:
- `src/pages/Dashboard.tsx` — já está condicional, OK.
- `src/pages/Transactions.tsx` → ajustar `TransactionsHeader` para esconder o `<h1>` em mobile.
- `src/pages/Analytics.tsx` → esconder o `<h1>` "Análise" em mobile (mantém apenas seletor de mês).
- `src/pages/Clients.tsx` → esconder `<h1>` "Clientes" em mobile, manter o botão "Novo" (eventualmente como `rightAction` do `NativeHeader`).
- `src/pages/Expenses.tsx`, `InvoicedTransactions.tsx`, `Settings.tsx` → mesma lógica.

Opcional: passar `rightAction` ao `NativeHeader` via Context ou prop drilling para acomodar botões como "Novo cliente".

### 3. Garantir conteúdo full-width

Revisar cada página para que o container raiz seja `w-full flex flex-col` sem `max-w-*` em mobile. Cards internos (`<Card>`) devem usar `w-full`. Confirmar que `TransactionsContent`, `ClientsList`, `ClientDebtsList`, `RecentTransactions` não tenham `max-w` próprio que limite a tela.

### 4. Adicionar Google Auth

**Pré-requisito de configuração** (instruir usuário): habilitar Google Provider no Supabase Dashboard com Client ID/Secret do Google Cloud, e configurar Site URL + Redirect URL.

**Código:**
- Criar componente `GoogleSignInButton` em `src/components/auth/GoogleSignInButton.tsx` que chama:
  ```ts
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/` }
  })
  ```
- Inserir o botão no topo de `LoginForm.tsx` e `SignUpForm.tsx` com separador "ou".
- Para o app nativo (Capacitor), o OAuth abrirá o navegador padrão do dispositivo; sem deep-link adicional já que o redirect cai no domínio Lovable e o session sync ocorre via `onAuthStateChange`. (Observação: deep-link nativo completo exigiria plugin `@capacitor/browser` + custom URL scheme — pode ser uma melhoria futura.)

### 5. Atualizar Capacitor

Atualizar para a última versão (atualmente 7.4.4 → checar latest, geralmente 7.x mais recente):
```
bun add @capacitor/core@latest @capacitor/cli@latest @capacitor/android@latest @capacitor/ios@latest \
  @capacitor/camera@latest @capacitor/device@latest @capacitor/haptics@latest \
  @capacitor/keyboard@latest @capacitor/local-notifications@latest @capacitor/network@latest \
  @capacitor/push-notifications@latest @capacitor/share@latest @capacitor/status-bar@latest \
  @capacitor/toast@latest
```
Após o usuário fazer git pull localmente, ele deve rodar `npm install && npx cap sync` para sincronizar com Android/iOS.

---

## Detalhes técnicos

**Arquivos a modificar:**
- `src/index.css` (remover position:fixed do body)
- `src/components/layout/MobileOptimizedLayout.tsx` (padding/width)
- `src/components/layout/NativeHeader.tsx` (suporte opcional a `rightAction` via context)
- `src/pages/Dashboard.tsx`, `Transactions.tsx`, `Analytics.tsx`, `Clients.tsx`, `Expenses.tsx`, `InvoicedTransactions.tsx`, `Settings.tsx` (esconder h1 em mobile)
- `src/components/transactions/TransactionsHeader.tsx` (mesma)
- `src/components/auth/LoginForm.tsx`, `SignUpForm.tsx` (botão Google)
- `src/components/auth/GoogleSignInButton.tsx` (novo)
- `package.json` (bump Capacitor)

**Funcionalidade preservada:** apenas camada de apresentação + auth (OAuth additivo). Nenhum hook ou lógica de transações/charts é tocado.
