# Estoque Fácil - Documentação

## Visão Geral
Sistema de gestão de estoque 100% SPA, responsivo, com backend Supabase, gráficos Chart.js, exportação Excel (SheetJS) e autenticação por perfil (admin/operacional).

## Funcionalidades
- **Login:** Tela de login com fundo customizável (imagem ou vídeo), contraste otimizado, acessível.
- **Dashboard:** Cards coloridos (azul escuro, azul médio, azul claro, laranja), gráficos de barras e pizza (tons de azul), estatísticas em destaque.
- **Menu:**
  - Menu superior (desktop) e menu lateral (drawer) no mobile.
  - Botão hambúrguer visível apenas no mobile, com z-index elevado para máxima visibilidade.
  - Drawer fecha ao clicar fora ou em qualquer aba.
  - Navegação SPA: apenas uma seção visível por vez, sem recarregar a página.
- **Estoque:** Listagem, filtro, status visual, ações rápidas (consumir, editar, excluir), responsivo.
- **Adicionar/Editar Item:** Formulário validado, impede duplicidade, soma quantidade se nome já existe.
- **Consumir Item:** Seleção dinâmica, validação, histórico automático.
- **Relatório:** Estoque baixo, exportação Excel, visualização responsiva.
- **Histórico:** Tabela responsiva, nomes de usuário/item, datas formatadas.
- **Acessibilidade:** Contraste de textos, navegação por teclado, ícones SVG inline, textos alternativos.

## Tecnologias
- **Frontend:** HTML, Tailwind CSS, JavaScript puro
- **Backend:** Supabase (auth, banco, RPC)
- **Gráficos:** Chart.js
- **Exportação Excel:** SheetJS

## Responsividade
- Layout mobile-first, cards e tabelas adaptáveis
- Menu lateral (drawer) só aparece no mobile
- Botão do menu hambúrguer só no mobile, sempre visível
- Tabelas com scroll horizontal em telas pequenas

## Acessibilidade
- Contraste garantido em todos os textos e botões
- Ícones SVG inline com alt/texto acessível
- Navegação SPA sem recarregar página

## Personalização
- Logo customizável (logo.png)
- Fundo da tela de login pode ser imagem ou vídeo
- Paleta de cores baseada em tons de azul e laranja

## Observações
- Substitua as chaves do Supabase no app.js
- Para trocar a logo, basta substituir o arquivo logo.png
- Para trocar o fundo do login, altere o arquivo e o caminho no index.html

---
Dúvidas ou sugestões? Abra uma issue ou entre em contato! 