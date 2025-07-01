# Documentação do Sistema de Gestão de Estoque

## Premissas

Este projeto é uma aplicação de Gestão de Estoque desenvolvida como uma Single Page Application (SPA) utilizando HTML, CSS (Tailwind + customizado) e JavaScript puro. O backend é baseado em Supabase, que fornece autenticação, banco de dados e funções RPC. O sistema é responsivo, funcionando bem em dispositivos desktop e mobile, e permite a exportação de relatórios para Excel.

## Funcionalidades

### 1. Autenticação de Usuário
- **Login**: Usuários podem fazer login utilizando email e senha através do Supabase Auth.
- **Perfis**: Existem dois perfis de usuário: admin (acesso total) e operacional (acesso restrito).
- **Logout**: Funcionalidade para logout do sistema.

### 2. Dashboard
- Exibição de estatísticas rápidas, incluindo:
  - Total de itens
  - Itens em estoque baixo
  - Itens críticos
  - Consumo mensal
- Gráficos:
  - Gráfico de barras com os itens mais consumidos.
  - Gráfico de pizza com o status do estoque (normal, baixo, crítico).

### 3. Gestão de Estoque
- Visualização dos itens em tabela (desktop) e cards (mobile).
- Filtros disponíveis por nome, status e fornecedor.
- O admin pode adicionar, editar e excluir itens.
- Exibição do status visual dos itens (normal, baixo, crítico) conforme a quantidade.

### 4. Adicionar/Editar Item
- Formulário para criar ou editar itens, com validação dos campos.
- Campos obrigatórios: nome, quantidade, quantidade mínima, unidade, fornecedor.
- Registro de entrada no histórico ao adicionar um item.

### 5. Consumir Item
- Formulário para registrar a saída de itens do estoque.
- Validação para não permitir a saída de mais itens do que o disponível.
- Registro da saída no histórico.

### 6. Relatório de Estoque Baixo
- Listagem de itens que estão abaixo do mínimo.
- Cálculo de sugestão de compra.
- Opção de exportação para Excel.

### 7. Histórico de Transações
- Tabela com todas as transações (entrada, saída, exclusão).
- Campos: data, item, tipo, quantidade, usuário, fornecedor, unidade.

## Tecnologias Utilizadas
- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript puro.
- **Backend**: Supabase (autenticação, banco de dados, funções RPC).
- **Gráficos**: Chart.js para visualização de dados.
- **Exportação de Relatórios**: SheetJS (XLSX) para exportação de relatórios.

## Estrutura do Projeto
- **index.html**: Estrutura da interface e containers dos módulos.
- **styles.css**: Estilos customizados e regras de responsividade.
- **app.js**: Lógica de frontend, integração com Supabase, manipulação de DOM e eventos.
- **DOCUMENTACAO.md**: Documentação detalhada do projeto.
- **README.md**: Visão geral do projeto, incluindo instruções de instalação e uso.

## Como Configurar e Executar o Projeto
1. Clone o repositório.
2. Instale as dependências necessárias.
3. Configure o Supabase com as credenciais apropriadas.
4. Abra o arquivo `index.html` em um navegador para visualizar a aplicação.

## Conclusão
Este sistema de Gestão de Estoque é projetado para ser facilmente expansível, permitindo a adição de novos módulos e funcionalidades no futuro. O código segue boas práticas de segurança e organização, garantindo uma base sólida para desenvolvimentos futuros.