## Banner da loja no cabeçalho

Adicionar suporte a um **banner/logo personalizado da loja** que aparece no cabeçalho do PDV (e demais telas), configurável pelo lojista nas Configurações. Se nenhum banner for enviado, o cabeçalho continua exatamente como está hoje (sem atrapalhar o layout atual).

### O que o usuário verá

1. **Em Admin → Configurações da Loja**
   - Novo campo "Banner / Logo da Loja"
   - Botão "Enviar imagem" (aceita PNG, JPG, WEBP)
   - Preview da imagem atual com botão "Remover"
   - Dica de tamanho recomendado (ex: 600x120px, até 1MB)

2. **No cabeçalho das telas (PDV, Restaurante, Bar, Estoque, etc.)**
   - Se houver banner: exibe a imagem à esquerda do título, com altura limitada (~40px no desktop, ~32px no mobile) para não aumentar o cabeçalho
   - Se não houver banner: cabeçalho continua idêntico ao atual
   - Mantém responsividade — em telas pequenas o banner reduz proporcionalmente

3. **Tela de Login (PIN)**
   - Se houver banner, substitui o ícone genérico de loja pelo banner da loja
   - Mantém o nome da loja abaixo

4. **Recibo (impressão/WhatsApp)**
   - Banner aparece no topo do recibo, centralizado, acima do nome da loja

### Detalhes técnicos

- **StoreContext** (`src/contexts/StoreContext.tsx`)
  - Adicionar campo `storeBanner: string` (data URL base64) ao `StoreSettings`
  - Função `setStoreBanner(file: File | null)` que converte para base64 e persiste
  - Persistir junto com as demais configurações da loja

- **Novo componente** `src/components/pdv/StoreBanner.tsx`
  - Props: `size?: "sm" | "md" | "lg"`, `className?`
  - Renderiza `<img>` com `object-contain`, ou `null` se não houver banner
  - Reutilizado em todos os cabeçalhos

- **Sidebar** (`src/components/pdv/Sidebar.tsx`)
  - Substituir/complementar o título com o `<StoreBanner size="md" />` no topo
  - Fallback: nome da loja em texto (atual)

- **Cabeçalhos de página** (`SalesHome.tsx`, `RestaurantPage.tsx`, `BarPage.tsx`, `StockPage.tsx`, etc.)
  - Adicionar `<StoreBanner size="sm" />` à esquerda do título da página (apenas quando existir)

- **AdminPage** (`src/pages/AdminPage.tsx`)
  - Nova seção dentro de "Configurações da Loja":
    - Input `<input type="file" accept="image/*">` escondido + botão estilizado
    - Validação: máx 1MB, formatos PNG/JPG/WEBP
    - Preview com botão remover
    - Toast de sucesso/erro

- **LoginPin** (`src/pages/LoginPin.tsx`)
  - Substituir o div com ícone `<Store />` pelo `<StoreBanner size="lg" />` quando existir

- **ReceiptPage** (`src/pages/ReceiptPage.tsx`)
  - Adicionar banner no topo do recibo (centralizado, max-height controlado)

### Garantias de "não atrapalhar"

- Sem banner cadastrado → **zero mudança visual** no app
- Altura máxima fixa por breakpoint → cabeçalho não cresce
- `object-contain` → preserva proporção sem distorcer
- Fallback gracioso em todas as telas
