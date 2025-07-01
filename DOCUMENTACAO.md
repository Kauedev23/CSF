# Sistema de Gestão de Estoque - SPA

## Premissas
- SPA (Single Page Application) usando HTML, CSS (Tailwind + customizado) e JavaScript puro.
- Backend baseado em Supabase (autenticação, banco de dados e funções RPC).
- Responsivo para desktop e mobile.
- Exportação de relatórios para Excel (SheetJS).
- Gráficos com Chart.js.
- Código e interface em português.
- Estrutura de arquivos separada: `index.html`, `styles.css`, `app.js`, `DOCUMENTACAO.md`.

## Estrutura de Arquivos
- **index.html**: Estrutura da interface, containers dos módulos e inclusão de bibliotecas externas.
- **styles.css**: Estilos customizados, responsividade e integração com Tailwind.
- **app.js**: Lógica de frontend, integração com Supabase, manipulação de DOM e eventos.
- **DOCUMENTACAO.md**: Documentação detalhada do projeto.

## Visão Geral das Funcionalidades
- **Autenticação de Usuário**: Login, logout, perfis admin e operacional.
- **Dashboard**: Estatísticas rápidas e gráficos.
- **Gestão de Estoque**: Visualização, filtros, adição, edição e exclusão de itens.
- **Adicionar/Editar Item**: Formulário com validação e histórico de entrada.
- **Consumir Item**: Registro de saída e validação de quantidade.
- **Relatório de Estoque Baixo**: Listagem, sugestão de compra e exportação para Excel.
- **Histórico de Transações**: Tabela de todas as transações.

## Expansibilidade
O sistema foi projetado para ser facilmente expansível para novos módulos, seguindo boas práticas de organização e segurança.

## Como iniciar
1. Configure o projeto no Supabase (tabelas, autenticação e funções RPC).
2. Atualize as chaves de API no `app.js`.
3. Abra o `index.html` em seu navegador.

## Detalhamento de cada módulo e integração com Supabase será descrito nas próximas seções. 