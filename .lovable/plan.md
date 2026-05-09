# Plano: Transformação em App Mobile Nativo (Android + iOS)

## Objetivo
Manter 100% das funcionalidades atuais (transações, clientes, despesas, faturadas, analytics com candles, notificações, auth, 2FA, temas) e transformar a experiência visual e de navegação em um app **mobile-first nativo**, otimizado para Capacitor (Android/iOS), pronto para compilação.

---

## 1. Redesign Mobile-First (UI/UX nativa)

### 1.1 Shell do App
- Substituir `MobileOptimizedLayout` por um shell **100% mobile** (sem sidebar desktop como base — sidebar vira apenas fallback para tablet/desktop opcional).
- Header nativo fixo com `safe-area-top`, título da rota atual e ações contextuais (busca/filtro/+).
- Bottom tab bar nativa (já existe `ProfessionalMobileNav`) — refinar com:
  - Ícones maiores (24px), labels 11px, indicador de aba ativa (pill animada).
  - Botão central FAB destacado para "+ Nova Transação" (ação primária).
  - Haptic feedback em cada toque (já existe `useNative`).
  - Respeito total a `safe-area-bottom` (gesture bar iOS / nav Android).

### 1.2 Padrões nativos por página
- **Dashboard**: cards roláveis horizontais (carousel) para resumo, lista vertical de transações recentes, pull-to-refresh.
- **Transações**: lista virtualizada full-screen, swipe-actions (editar/excluir/confirmar), filtros em bottom-sheet (Drawer), busca em header colapsável.
- **Analytics**: gráfico de candles ocupando viewport completo, seletor de período em chips horizontais (diário/semanal/mensal/transação), gestos de pinça/pan.
- **Clientes**: lista com avatar + nome + saldo, swipe para ações, detalhe em tela cheia com transações do cliente.
- **Despesas / Faturadas**: mesma linguagem (lista + swipe + bottom-sheet de filtros).
- **Settings**: agrupamento estilo iOS (seções com cards arredondados, chevrons à direita).

### 1.3 Tokens visuais (mantém tema Supabase dark)
- Reforçar `bg #000000`, accent `#3FCF8E`, cards `#0A0A0A` com border `#1F1F1F`.
- Raios `rounded-2xl` em cards, `rounded-full` em botões primários.
- Tipografia: SF Pro / Inter — tamanhos mobile (title 20, body 14, caption 11).
- Animações com `framer-motion`: fade+slide entre rotas, spring em bottom-sheets.
- Estados de loading com skeletons no formato dos cards reais.

### 1.4 Componentes nativos a criar/refinar
- `NativeHeader` (substitui headers atuais de página).
- `NativeBottomSheet` (wrapper sobre Drawer p/ filtros e ações).
- `SwipeableListItem` (swipe-actions reutilizável).
- `NativePageTransition` (transição entre rotas).
- `FAB` (Floating Action Button central da tab bar).

---

## 2. Ajustes Capacitor (compilação Android + iOS)

### 2.1 `capacitor.config.ts`
- Remover `server.url` de hot-reload (modo produção empacotado).
- Confirmar `appId: com.candlelife.app`, `appName: candle-life`, `webDir: dist`.
- `StatusBar`: style `Dark`, background `#000000`, overlay `false`.
- `Keyboard`: `resize: 'native'`, `style: 'dark'`.
- `SplashScreen`: 1500ms, background `#000000`, sem spinner.
- `App`: `backButtonExitsApp: false` (controla via router).

### 2.2 Plugins (já instalados — apenas configurar)
StatusBar, Keyboard, Haptics, SplashScreen, PushNotifications, LocalNotifications, Network, Share, Toast, Device, Camera.

### 2.3 Android
- `AndroidManifest.xml`: adicionar permissões faltantes (POST_NOTIFICATIONS, VIBRATE, CAMERA, INTERNET ✓).
- `styles.xml`: tema dark edge-to-edge, status bar transparente.
- `colors.xml`: cores do brand.

### 2.4 iOS
- `Info.plist`: `UIStatusBarStyle = UIStatusBarStyleLightContent`, `UIViewControllerBasedStatusBarAppearance = false`, descrições de uso (camera, notifications), `UIBackgroundModes` para push.
- `LaunchScreen.storyboard`: fundo preto + logo centralizado.

### 2.5 Build & Sync
- Garantir `npm run build` + `npx cap sync` limpos.
- Documentar no README os passos: export GitHub → `npm i` → `npx cap add ios/android` → `npx cap sync` → `npx cap run ios|android`.

---

## 3. Safe-Areas e gestos
- CSS global: variáveis `--sat`, `--sab`, `--sal`, `--sar` via `env(safe-area-inset-*)`.
- Aplicar em header (top) e tab bar (bottom).
- Desabilitar zoom de pinça em inputs (viewport meta já correto).
- Desabilitar text-selection acidental em UI chrome (manter em conteúdo).

---

## 4. Funcionalidades preservadas (regressão zero)
Auth + 2FA, transações (CRUD + confirmar pagamento + swipe), clientes + dívidas, despesas, faturadas, analytics OHLC com 4 períodos, notificações push/local, temas, perfil, sessões. Todos os hooks (`useTransactionsPage`, `useOHLCData`, `useClientDebts`, etc.) permanecem intactos — só a camada de apresentação muda.

---

## 5. Arquivos afetados (resumo)

| # | Arquivo | Mudança |
|---|---|---|
| 1 | `capacitor.config.ts` | Config produção + plugins |
| 2 | `src/components/layout/MobileOptimizedLayout.tsx` | Shell mobile-first |
| 3 | `src/components/layout/ProfessionalMobileNav.tsx` | Tab bar + FAB |
| 4 | `src/components/layout/NativeHeader.tsx` | **novo** |
| 5 | `src/components/ui/native-bottom-sheet.tsx` | **novo** |
| 6 | `src/components/ui/swipeable-list-item.tsx` | **novo** |
| 7 | `src/components/ui/fab.tsx` | **novo** |
| 8 | `src/index.css` | Safe-areas + tokens nativos |
| 9 | `src/pages/Dashboard.tsx` | Layout mobile redesenhado |
| 10 | `src/pages/Transactions.tsx` + `TransactionsContent.tsx` | Lista nativa + swipe + bottom-sheet filtros |
| 11 | `src/pages/Analytics.tsx` | Chart full-screen + chips de período |
| 12 | `src/pages/Clients.tsx` + `ClientsList.tsx` | Lista + swipe |
| 13 | `src/pages/Expenses.tsx` + `ExpensesManagement.tsx` | Mesma linguagem |
| 14 | `src/pages/InvoicedTransactions.tsx` | Mesma linguagem |
| 15 | `src/pages/Settings.tsx` | Agrupamento iOS-like |
| 16 | `android/app/src/main/AndroidManifest.xml` | Permissões |
| 17 | `android/app/src/main/res/values/styles.xml` | Tema dark edge-to-edge |
| 18 | `ios/App/App/Info.plist` | Status bar + permissões |

---

## Pergunta antes de implementar
Manter sidebar como opção em tablet/desktop, ou remover totalmente e deixar **só tab bar mobile** em qualquer viewport (app puro, sem layout web)?
