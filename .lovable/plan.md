## Melhorar venda de produtos por peso (balcão)

Hoje, ao clicar em um produto vendido por peso (ex.: kg, g), ele entra direto no carrinho com quantidade 1, e o ajuste fino só acontece pelos botões +/- (passo de 0.1). Isso é ruim para açougue, padaria, frutas a granel, queijos etc., onde o operador precisa **digitar o peso lido na balança** na hora.

### O que vou criar

**1. Modal "Pesagem do Produto"** (`src/components/pdv/WeightModal.tsx`)
Abre automaticamente quando o operador clica em um produto cuja unidade é de peso (kg, g) ou volume fracionado (L, mL). Mostra:

- Nome do produto + foto/emoji
- Preço por unidade (R$ X,XX / kg)
- **Campo grande para digitar o peso** (teclado numérico em mobile, com vírgula)
- **Teclado numérico on-screen** (0–9, vírgula, apagar) para uso em tablet de balcão sem teclado físico
- **Atalhos rápidos**: 100g, 250g, 500g, 1kg, 1,5kg, 2kg (configurável conforme unidade)
- **Tara**: campo opcional para descontar peso da embalagem
- **Cálculo do total em tempo real**: peso × preço unitário = R$ XX,XX (destaque grande)
- **Alternar unidade de entrada**: digitar em **gramas** ou em **kg** (botão toggle), sistema converte automaticamente para a unidade cadastrada do produto
- Botões: "Cancelar" / "Adicionar ao carrinho"

**2. Detecção automática de produto por peso**
Em `SalesHome.tsx`, ao clicar no `ProductCard`:
- Se a unidade do produto for de peso/volume fracionado (kg, g, L, mL) → abrir o `WeightModal`
- Se for unidade inteira (un, pç, cx, dz...) → mantém o comportamento atual (adiciona direto com quantidade 1)

A lista de unidades "fracionadas" será derivada de uma propriedade nova nos `units` do `ProductContext` (`isWeight: boolean`), com defaults para kg, g, L e mL. Assim, o admin pode marcar qualquer unidade customizada como "vendida por peso/medida".

**3. Edição de peso no carrinho**
- No `CartPanel.tsx` e `CartPage.tsx`, ao clicar no peso do item (ou em um ícone de "balança"), reabrir o `WeightModal` em modo **editar**, permitindo redigitar o peso em vez de incrementar de 0,1 em 0,1.
- Botões +/- continuam disponíveis para ajustes finos.

**4. Exibição do peso na comanda**
- No carrinho e no recibo (`ReceiptPage.tsx`): mostrar peso formatado de forma clara, ex.: `0,485 kg × R$ 49,90/kg = R$ 24,20` (3 casas decimais para kg, sem casas para gramas).

**5. Aplicar também no módulo Restaurante/Bar**
- Em `TableOrderPanel.tsx`, ao adicionar um produto por peso à comanda da mesa, abrir o mesmo `WeightModal` (útil para rodízio por kg, buffet a quilo).

### Detalhes técnicos

- Precisão: peso armazenado com 3 casas decimais (gramas exatas). Subtotal arredondado para 2 casas (centavos).
- O `QuantityModal.tsx` existente continua para produtos por unidade; o novo `WeightModal` é específico para peso/volume.
- Validações: peso > 0, peso máximo configurável (ex.: 50 kg) para evitar erros de digitação.
- Acessibilidade: input com `inputMode="decimal"` para abrir teclado numérico em mobile/tablet.
- Sem dependências novas; usa componentes shadcn já existentes (Dialog, Button, Input).

### Arquivos alterados
- **novo**: `src/components/pdv/WeightModal.tsx`
- editado: `src/pages/SalesHome.tsx` (detecta produto por peso e abre modal)
- editado: `src/contexts/ProductContext.tsx` (flag `isWeight` em unidades)
- editado: `src/components/pdv/CartPanel.tsx` (editar peso clicando no valor)
- editado: `src/pages/CartPage.tsx` (idem, versão mobile)
- editado: `src/pages/ReceiptPage.tsx` (formatação do peso no recibo)
- editado: `src/components/pdv/TableOrderPanel.tsx` (suporte no restaurante/bar)

### Fora do escopo (posso fazer depois se quiser)
- Integração real com balança via porta serial/USB/bluetooth (requer backend ou Web Serial API e hardware).
- Leitura de etiqueta de balança com código de barras EAN-13 contendo peso embutido (padrão "2XXXXXPPPPPC").
