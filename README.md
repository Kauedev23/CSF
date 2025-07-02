# Gestão de Estoque SPA

Este projeto é uma aplicação web de Gestão de Estoque, desenvolvida como uma Single Page Application (SPA) utilizando HTML, CSS (Tailwind + customizado) e JavaScript puro. O backend é baseado em Supabase, que fornece autenticação, banco de dados e funções RPC.

## Estrutura do Projeto

- **index.html**: Contém a estrutura da interface do usuário, incluindo containers para os diversos módulos como autenticação, dashboard, gestão de estoque e histórico de transações.
- **styles.css**: Inclui estilos personalizados e regras de design responsivo utilizando Tailwind CSS e customizações adicionais para garantir que a aplicação tenha uma boa aparência em dispositivos desktop e mobile.
- **app.js**: Contém toda a lógica do frontend, incluindo autenticação de usuários com Supabase, manipulação do DOM, tratamento de eventos, e integração com Chart.js para exibição de gráficos e SheetJS para exportação de relatórios.
- **DOCUMENTACAO.md**: Fornece documentação detalhada do projeto, explicando as premissas, funcionalidades e estrutura da aplicação, incluindo como configurar e executar o projeto.

## Instalação

1. Clone o repositório:
   ```
   git clone <URL_DO_REPOSITORIO>
   ```
2. Navegue até o diretório do projeto:
   ```
   cd gestao-estoque-spa
   ```
3. Abra o arquivo `index.html` em um navegador para visualizar a aplicação.

## Uso

- **Autenticação**: Os usuários podem se registrar e fazer login utilizando email e senha. Existem dois perfis de usuário: admin (acesso total) e operacional (acesso restrito).
- **Dashboard**: Visualize estatísticas rápidas e gráficos sobre o estoque.
- **Gestão de Estoque**: Adicione, edite e exclua itens do estoque, além de registrar entradas e saídas.
- **Relatórios**: Gere relatórios de itens em estoque baixo e exporte-os para Excel.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para mais detalhes.