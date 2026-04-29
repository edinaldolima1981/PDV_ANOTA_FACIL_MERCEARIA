
# Profissionalização do Módulo Bar

Objetivo: transformar o Bar atual (mesas + pedidos básicos) em um sistema profissional com fluxos reais de operação de bar — comandas individuais, garçons, pagamento integrado, transferências, taxa de serviço, couvert e relatórios específicos.

---

## 1. Comandas individuais por mesa (multi-comanda)

Hoje cada mesa tem **um único pedido coletivo**. No bar real, cada cliente tem sua própria comanda mesmo sentado na mesma mesa.

- Cada mesa pode ter **N comandas** (ex: "Comanda 01 — João", "Comanda 02 — Maria")
- Adicionar item: escolhe a comanda destino (ou "mesa toda")
- Ver totais por comanda + total geral da mesa
- Fechar comandas individualmente (cliente vai embora antes dos outros)
- Cada comanda tem número sequencial impresso (útil para identificação física com cartão/pulseira)

## 2. Garçom responsável

- Cadastro simples de garçons em Admin (nome + PIN curto)
- Ao abrir mesa: selecionar garçom responsável
- Cada pedido registra qual garçom lançou
- Comissão configurável por garçom (% sobre vendas) — visível no relatório

## 3. Fluxo de pagamento integrado (sem sair do Bar)

Hoje "Fechar Mesa" só limpa. Vamos integrar com o checkout existente:

- Botão **"Pagar"** abre modal de pagamento dentro do painel da mesa
- Formas: Dinheiro / Pix / Cartão / **Fiado (A Prazo)** — usa `CustomerContext` e regras de crédito existentes
- Pagamento parcial: "cliente pagou R$ 50, restante na conta"
- Pagamento dividido por forma (R$ 30 dinheiro + R$ 20 pix)
- Após pagamento confirmado → mesa fecha e gera recibo (reusa `ReceiptPage`)
- Venda entra no histórico financeiro normal (Dashboard / Relatórios)

## 4. Taxa de serviço (10% garçom) e Couvert

- Toggle por mesa: "Incluir taxa de serviço 10%" (padrão configurável em Admin)
- **Couvert artístico**: valor fixo por pessoa (configurável), aplicado automaticamente quando a mesa abre
- Ambos aparecem destacados na conta impressa e no recibo

## 5. Transferências

- **Transferir item** entre comandas da mesma mesa
- **Transferir item** entre mesas (cliente trocou de mesa)
- **Juntar mesas**: mescla todas as comandas de 2+ mesas em uma só
- **Dividir mesa**: separa comandas para mesas diferentes
- Toda transferência logada com hora + garçom

## 6. Status estendidos da mesa

Ampliar de 3 para 5 estados, com cores distintas no `TableMap`:

```text
Livre        verde
Ocupada      âmbar
Aguardando   amarelo  (pediu a conta — sinal pro garçom)
Reservada    azul
Suja         cinza    (cliente foi embora, falta limpar)
```

Botão "Pedir a conta" muda mesa para *Aguardando*; após pagamento vira *Suja*; garçom marca "Limpa" → volta a *Livre*.

## 7. Categorias rápidas e favoritos do bar

- Painel de produtos com **abas/atalhos**: Chopp, Cervejas, Drinks, Destilados, Petiscos, Não-alcoólicos
- "Favoritos do Bar" (top 12 mais vendidos) como primeira aba
- Botões grandes (touch-friendly) com preço — 1 toque adiciona à comanda ativa

## 8. Happy Hour

- Configurável em Admin: período (ex: 18h–20h, seg–sex) + desconto (% ou preço fixo) por categoria/produto
- Indicador visível no header da BarPage quando ativo: "🍻 HAPPY HOUR ATIVO"
- Preço aplicado automaticamente nos lançamentos durante a janela

## 9. Observações e modificadores rápidos

- Ao adicionar item, abrir mini-modal com:
  - Observações livres ("sem gelo", "bem gelada")
  - Tags rápidas pré-definidas (configuráveis): "sem gelo", "com limão", "para viagem", "dose dupla"
- Tags aparecem na comanda impressa para o bar/cozinha

## 10. Impressão profissional

Separar dois fluxos de impressão:

- **Pedido (KDS-like)**: imprime apenas itens novos, agrupado por destino (Bar / Cozinha) — produto cadastrado define destino
- **Conta do cliente**: layout caprichado com taxa, couvert, descontos, divisão e Pix

Cada impressão preserva: nº comanda, mesa, garçom, hora.

## 11. Histórico e auditoria da mesa

- Linha do tempo dentro do painel: "20:14 João abriu mesa → 20:18 Maria adicionou Heineken → 20:45 transferiu p/ comanda 02 → 21:30 pagou"
- Útil para resolver contestações ("não pedi isso")

## 12. Relatório do Bar (nova aba no Dashboard)

- Vendas do dia/semana/mês do módulo Bar
- Top 10 produtos mais vendidos
- Faturamento por garçom + comissão calculada
- Tempo médio de mesa ocupada
- Ticket médio por mesa / por comanda
- Horários de pico

---

## Detalhes técnicos

**Modelo de dados (`TableContext`)**
```text
Table {
  ...campos atuais
  status: 'free'|'occupied'|'awaiting_payment'|'reserved'|'dirty'
  waiterId?: string
  serviceFeeEnabled: boolean
  couvertPerPerson: number
  comandas: Comanda[]        // substitui orders[] direto
  history: TableEvent[]
}

Comanda {
  id, number, customerName?, openedAt, closedAt?,
  orders: TableOrder[],
  payments: Payment[]
}

TableOrder { ...atuais, waiterId, modifiers: string[], destination: 'bar'|'kitchen' }
Payment    { method, amount, at, by }
TableEvent { at, type, description, by }
```

**Novos contextos / arquivos**
- `src/contexts/WaiterContext.tsx` — CRUD garçons + comissão
- `src/contexts/HappyHourContext.tsx` — regras + função `applyHappyHour(product, now)`
- Migração `TableContext` para `comandas[]` (com fallback de leitura para mesas antigas)

**Novos componentes**
- `src/components/pdv/ComandaTabs.tsx` — abas de comandas dentro da mesa
- `src/components/pdv/PaymentModal.tsx` — pagamento integrado (reaproveita lógica de `CheckoutPage`)
- `src/components/pdv/TransferModal.tsx` — transferir item / juntar / dividir mesa
- `src/components/pdv/QuickModifiersModal.tsx` — observações + tags rápidas
- `src/components/pdv/BarFavoritesGrid.tsx` — grid touch de produtos favoritos
- `src/components/pdv/TableTimeline.tsx` — histórico/auditoria
- `src/pages/admin/WaitersSection.tsx`, `HappyHourSection.tsx`, `BarSettingsSection.tsx` (couvert padrão, taxa padrão, destinos de impressão)

**Refatorações**
- `TableOrderPanel.tsx` reescrito em torno de `ComandaTabs`
- `TableMap.tsx` ganha 2 cores novas + ação rápida "Marcar como limpa"
- `Product` ganha `printDestination?: 'bar'|'kitchen'` (default 'bar')
- `Dashboard` ganha aba "Bar" com os relatórios

**Persistência**
- Tudo via `localStorage` (mantém padrão atual offline-first do projeto)
- Eventos de auditoria limitados aos últimos 90 dias por mesa para não inchar storage

**Memórias a atualizar após implementação**
- `mem://features/restaurant-bar-modules` (expandir com comandas, pagamento, transferências)
- Nova `mem://features/bar-professional` com regras de happy hour, couvert e taxa

---

## Sugestão de ordem de entrega (em fases)

1. **Fase 1 — Base**: comandas múltiplas + status estendidos + transferência simples
2. **Fase 2 — Operação**: garçons + pagamento integrado + couvert/taxa
3. **Fase 3 — Vendas**: favoritos do bar + happy hour + modificadores rápidos
4. **Fase 4 — Gestão**: histórico/auditoria + relatórios do bar

Posso entregar tudo de uma vez ou fase a fase — me diga sua preferência. Algo a remover, adicionar (ex.: integração com totem de autoatendimento, QR code na mesa para o cliente pedir pelo celular) ou ajustar?
