# Plano de implementação — minimacli

## Propósito

Roadmap de fases de implementação com critérios de pronto — sem detalhar
estrutura do workspace.

## Escopo

TUI e watcher (CLI), começando pelo TUI. Extensão VS Code fica fora por
enquanto.

## Fases

### Fase 1 — TUI mínimo de ponta a ponta

Critério de pronto: abrir, conectar, enviar prompt, receber resposta e
responder uma aprovação — loop completo.

### Fase 2 — Watcher

Critério de pronto: client morto sem aviso tem o turn cancelado; último client
fecha → web morre (prune + kill).

### Fase 3 — Lifecycle completo do CLI

Critério de pronto: boot A–E correto em todos os ramos; Ctrl+C cancela e
desregistra; duas sessões simultâneas no mesmo workspace.

### Fase 4 — UX avançada do TUI

Critério de pronto: trocar de sessão pelo TUI; histórico persiste entre
aberturas; atalhos funcionam.

### Fase 5 — Polimento final

Critério de pronto: testes cobrindo o que foi feito; docs atualizadas;
empacotamento (ex.: binário global instalável).
