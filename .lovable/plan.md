## Determinar "vendido por peso" no cadastro do produto

Hoje, o sistema decide se abre o modal de pesagem **olhando para a unidade** (kg, g, L, mL). Isso é frágil: o operador pode cadastrar um produto em "kg" só por costume, ou ter unidades customizadas que confundem o sistema.

A nova lógica torna isso **explícito no produto**: ao cadastrar/editar, o operador escolhe **como o produto é vendido** (por unidade ou por peso/medida). O sistema usa essa flag para decidir o fluxo no PDV.

### O que muda

**1. Modelo de dados (`Product`)**
Adicionar campo `saleMode: "unit" | "weight"` em `src/data/products.ts`.
- `"unit"` → adicionado direto ao carrinho com quantidade 1 (ou +/- inteiros)
- `"weight"` → abre o modal de pesagem para digitar a quantidade

Migração dos produtos mock: produtos cadastrados em `kg` ou `L` recebem `saleMode: "weight"` automaticamente; demais ficam `"unit"`. Backward-compat: se o campo não existir no produto, cair no helper `isWeightUnit(unit)` como hoje.

**2. Cadastro / edição de produto (`StockPage.tsx`)**
Adicionar um seletor visual no modal **Adicionar produto** e no modal **Editar produto**:

```
Como este produto é vendido?
[ 📦 Por unidade ]   [ ⚖️ Por peso/medida ]
```

- Dois cards/botões grandes lado a lado, mutuamente exclusivos.
- Texto de ajuda sob cada um:
  - **Por unidade**: "Vai direto ao carrinho. Ex.: refrigerante, pão, sabonete."
  - **Por peso/medida**: "Pede o peso na hora da venda. Ex.: carnes, frutas a granel, queijos."
- Ao escolher **Por peso/medida**, o seletor de unidade já filtra/sugere unidades de peso (kg, g, L, mL).
- Ao escolher **Por unidade**, sugere un, pç, cx, dz...
- O operador ainda pode escolher qualquer unidade, mas com defaults inteligentes.

**3. PDV (`SalesHome.tsx`, `TableOrderPanel.tsx`)**
Substituir a checagem `isWeightUnit(product.unit)` por:
```ts
const sellsByWeight = product.saleMode === "weight" 
  || (product.saleMode === undefined && isWeightUnit(product.unit)); // fallback
```
- Se `sellsByWeight` → abre `WeightModal`
- Senão → adiciona direto ao carrinho

**4. Indicador visual nos cards de produto (`ProductCard.tsx`)**
Adicionar um pequeno badge `⚖️` no canto do card quando `saleMode === "weight"`, para o operador saber que clicar vai abrir o modal de pesagem (boa para treinamento e clareza).

**5. Carrinho (`CartPanel.tsx`, `CartPage.tsx`)**
Mesma checagem: usar `product.saleMode` em vez de `isWeightUnit(product.unit)` para mostrar o ícone de balança e abrir o modal ao editar.

**6. Recibo (`ReceiptPage.tsx`)**
Formatação de quantidade também passa a usar `saleMode` (3 casas decimais para peso, inteiro para unidade).

### Arquivos alterados
- editado: `src/data/products.ts` (adiciona `saleMode` em `Product` e nos mocks)
- editado: `src/pages/StockPage.tsx` (seletor "Como é vendido?" nos modais de add/edit + sugestão de unidade)
- editado: `src/contexts/ProductContext.tsx` (helper `sellsByWeight(product)` único e centralizado)
- editado: `src/pages/SalesHome.tsx`
- editado: `src/components/pdv/ProductCard.tsx` (badge ⚖️)
- editado: `src/components/pdv/CartPanel.tsx`
- editado: `src/pages/CartPage.tsx`
- editado: `src/components/pdv/TableOrderPanel.tsx`
- editado: `src/pages/ReceiptPage.tsx`

### Detalhes de UX
- Default ao criar novo produto: **Por unidade** (mais comum em mercearia).
- Editar um produto existente: respeita o `saleMode` atual (ou infere pela unidade se ainda não existe).
- O `WeightModal` continua igual; só a forma de decidir quando abri-lo muda.
