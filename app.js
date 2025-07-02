// ===============================
// Configuração do Supabase
// ===============================
const SUPABASE_URL = 'https://vaiakixfumwglgyveerh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhaWFraXhmdW13Z2xneXZlZXJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTc3NDMsImV4cCI6MjA2Njk3Mzc0M30.ZnvUmL1GtQ2A7jtgjX9l9Y6eSD8ifdIAPs2GxhBBdiI';
const supabase = window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

// ===============================
// Controle de Containers SPA
// ===============================
const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const userRoleSpan = document.getElementById('user-role');
const navBar = document.querySelector('nav');

function showLogin() {
  loginContainer.classList.remove('hidden');
  mainContainer.classList.add('hidden');
  if (navBar) navBar.classList.add('hidden');
}

function showMain(role) {
  loginContainer.classList.add('hidden');
  mainContainer.classList.remove('hidden');
  if (navBar) navBar.classList.remove('hidden');
  userRoleSpan.textContent = role === 'admin' ? 'Administrador' : 'Operacional';
  ajustarMenuPorPerfil(role);
  showSection('dashboard');
  loadDashboard();
}

// ===============================
// Autenticação
// ===============================
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showToast('Erro ao fazer login: ' + error.message, 'error');
    return;
  }
  // Após login, checar perfil e exibir main
  checkSession();
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  showLogin();
});

// ===============================
// Checagem de Sessão e Perfil
// ===============================
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    showLogin();
    return;
  }
  // Buscar perfil do usuário
  const { data: { user } } = await supabase.auth.getUser();
  let role = 'operacional';
  // Exemplo: buscar role em tabela 'profiles' (ajuste conforme seu schema)
  const { data: perfil } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (perfil && perfil.role) role = perfil.role;
  showMain(role);
  // Carregar dados iniciais do sistema
  // loadDashboard();
  // loadEstoque();
  // loadHistorico();
}

// ===============================
// Inicialização
// ===============================
window.addEventListener('DOMContentLoaded', () => {
  checkSession();
});

// ===============================
// Placeholders para funções principais
// ===============================
// function loadDashboard() {}
// function loadEstoque() {}
// function loadHistorico() {}
// function exportarExcel() {}
// function adicionarItem() {}
// function editarItem() {}
// function consumirItem() {}
// ...

// ===============================
// Função para carregar o Dashboard
// ===============================
async function loadDashboard() {
  // Buscar todos os itens
  const { data: itens, error } = await supabase.from('itens').select('*');
  if (error) {
    showToast('Erro ao carregar itens: ' + error.message, 'error');
    return;
  }
  // Estatísticas
  const totalItens = itens.length;
  const baixo = itens.filter(item => item.quantidade > 0 && item.quantidade <= item.quantidade_minima).length;
  const critico = itens.filter(item => item.quantidade === 0).length;

  // Consumo mensal (somar saídas do mês atual)
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0,0,0,0);
  const { data: historico, error: histError } = await supabase
    .from('historico')
    .select('*')
    .eq('tipo', 'saida')
    .gte('data', inicioMes.toISOString());
  let consumoMensal = 0;
  if (!histError && historico) {
    consumoMensal = historico.reduce((soma, h) => soma + h.quantidade, 0);
  }

  // Atualizar cards
  document.getElementById('stat-total-itens').textContent = totalItens;
  document.getElementById('stat-baixo').textContent = baixo;
  document.getElementById('stat-critico').textContent = critico;
  document.getElementById('stat-consumo-mensal').textContent = consumoMensal;

  // Gráfico de barras: itens mais consumidos
  let dadosBar = {};
  if (!histError && historico) {
    historico.forEach(h => {
      if (!dadosBar[h.item_id]) dadosBar[h.item_id] = 0;
      dadosBar[h.item_id] += h.quantidade;
    });
  }
  // Buscar nomes dos itens consumidos
  const idsConsumidos = Object.keys(dadosBar);
  let nomesItens = {};
  if (idsConsumidos.length > 0) {
    const { data: itensConsumidos } = await supabase
      .from('itens')
      .select('id, nome')
      .in('id', idsConsumidos);
    itensConsumidos.forEach(i => { nomesItens[i.id] = i.nome; });
  }
  const labelsBar = Object.keys(dadosBar).map(id => nomesItens[id] || id);
  const dataBar = Object.values(dadosBar);

  // Gráfico de pizza: status do estoque
  const normal = itens.filter(item => item.quantidade > item.quantidade_minima).length;
  const dataPie = [normal, baixo, critico];
  const labelsPie = ['Normal', 'Baixo', 'Crítico'];
  const colorsPie = ['#2563eb', '#60a5fa', '#1e3a8a']; // Tons de azul

  // Renderizar gráficos
  renderBarChart(labelsBar, dataBar);
  renderPieChart(labelsPie, dataPie, colorsPie);
}

// Função para renderizar gráfico de barras
function renderBarChart(labels, data) {
  const ctx = document.getElementById('chart-bar').getContext('2d');
  if (window.barChart) window.barChart.destroy();
  window.barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Mais Consumidos',
        data,
        backgroundColor: '#2563eb',
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

// Função para renderizar gráfico de pizza
function renderPieChart(labels, data, colors) {
  const ctx = document.getElementById('chart-pie').getContext('2d');
  if (window.pieChart) window.pieChart.destroy();
  window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// ===============================
// Função para carregar e exibir o Estoque
// ===============================
async function loadEstoque() {
  // Buscar filtros
  const filtroNome = document.getElementById('filtro-nome').value.toLowerCase();
  const filtroStatus = document.getElementById('filtro-status').value;
  const filtroFornecedor = document.getElementById('filtro-fornecedor').value.toLowerCase();

  // Buscar itens
  const { data: itens, error } = await supabase.from('itens').select('*');
  if (error) {
    showToast('Erro ao carregar itens: ' + error.message, 'error');
    return;
  }

  // Filtrar itens
  let itensFiltrados = itens.filter(item => {
    let match = true;
    if (filtroNome && !item.nome.toLowerCase().includes(filtroNome)) match = false;
    if (filtroFornecedor && !item.fornecedor.toLowerCase().includes(filtroFornecedor)) match = false;
    // Status visual
    let status = 'normal';
    if (item.quantidade === 0) status = 'critico';
    else if (item.quantidade <= item.quantidade_minima) status = 'baixo';
    if (filtroStatus && filtroStatus !== status) match = false;
    return match;
  });

  renderEstoqueTabela(itensFiltrados);
  renderEstoqueCards(itensFiltrados);
}

// Renderizar tabela (desktop)
function renderEstoqueTabela(itens) {
  const container = document.getElementById('estoque-tabela');
  if (!container) return;
  if (itens.length === 0) {
    container.innerHTML = '<div class="p-4 text-center text-gray-500">Nenhum item encontrado.</div>';
    return;
  }
  let html = `<table class="min-w-full bg-white rounded shadow text-center">
    <thead><tr>
      <th class="px-4 py-2 text-left">Nome</th>
      <th class="px-4 py-2 text-center">Quantidade</th>
      <th class="px-4 py-2 text-center">Mínima</th>
      <th class="px-4 py-2 text-center">Unidade</th>
      <th class="px-4 py-2 text-left">Fornecedor</th>
      <th class="px-4 py-2 text-center">Status</th>
      <th class="px-4 py-2 text-center">Ações</th>
    </tr></thead><tbody>`;
  itens.forEach(item => {
    let status = 'normal';
    let statusIcon = '<svg class="w-4 h-4">';
    if (item.quantidade === 0) { status = 'critico'; statusIcon += '<use href="#heroicon-o-x-circle" /></svg>'; }
    else if (item.quantidade <= item.quantidade_minima) { status = 'baixo'; statusIcon += '<use href="#heroicon-o-exclamation-triangle" /></svg>'; }
    else { statusIcon += '<use href="#heroicon-o-check-circle" /></svg>'; }
    html += `<tr>
      <td class="px-4 py-2 text-left">${item.nome}</td>
      <td class="px-4 py-2 text-center">${item.quantidade}</td>
      <td class="px-4 py-2 text-center">${item.quantidade_minima}</td>
      <td class="px-4 py-2 text-center">${item.unidade}</td>
      <td class="px-4 py-2 text-left">${item.fornecedor}</td>
      <td class="px-4 py-2 text-center status-${status}">${statusIcon}${status.charAt(0).toUpperCase() + status.slice(1)}</td>
      <td class="px-4 py-2 text-center">
        <button class="text-green-600 hover:underline mr-2" onclick="abrirFormConsumir(${item.id})">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-4 h-4 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          Consumir
        </button>
        <button class="text-blue-600 hover:underline mr-2" onclick="editarItem(${item.id})">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-4 h-4 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
          Editar
        </button>
        <button class="text-red-600 hover:underline" onclick="excluirItem(${item.id})">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-4 h-4 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0\" /></svg>
          Excluir
        </button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

// Renderizar cards (mobile)
function renderEstoqueCards(itens) {
  const container = document.getElementById('estoque-cards');
  if (!container) return;
  if (itens.length === 0) {
    container.innerHTML = '<div class="p-4 text-center text-gray-500">Nenhum item encontrado.</div>';
    return;
  }
  let html = '';
  itens.forEach(item => {
    let status = 'normal';
    let statusIcon = '<svg class="w-4 h-4">';
    if (item.quantidade === 0) { status = 'critico'; statusIcon += '<use href="#heroicon-o-x-circle" /></svg>'; }
    else if (item.quantidade <= item.quantidade_minima) { status = 'baixo'; statusIcon += '<use href="#heroicon-o-exclamation-triangle" /></svg>'; }
    else { statusIcon += '<use href="#heroicon-o-check-circle" /></svg>'; }
    html += `<div class="bg-white rounded shadow p-4 mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="font-bold text-lg">${item.nome}</span>
        <span class="status-${status}">${statusIcon}${status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
      <div class="mb-1">Quantidade: <b>${item.quantidade}</b> (${item.unidade})</div>
      <div class="mb-1">Mínima: <b>${item.quantidade_minima}</b></div>
      <div class="mb-1">Fornecedor: <b>${item.fornecedor}</b></div>
      <div class="flex gap-2 mt-2">
        <button class="text-green-600 hover:underline" onclick="abrirFormConsumir(${item.id})">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-4 h-4 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          Consumir
        </button>
        <button class="text-blue-600 hover:underline" onclick="editarItem(${item.id})">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-4 h-4 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
          Editar
        </button>
        <button class="text-red-600 hover:underline" onclick="excluirItem(${item.id})">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline w-4 h-4 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0\" /></svg>
          Excluir
        </button>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

// Eventos dos filtros
['filtro-nome', 'filtro-status', 'filtro-fornecedor'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', loadEstoque);
});

// Chamar loadEstoque ao exibir a tela de estoque
const estoqueSection = document.getElementById('estoque');
if (estoqueSection) {
  estoqueSection.addEventListener('show', loadEstoque);
}

// ===============================
// Adicionar/Editar Item - Abrir formulário
// ===============================
const addItemBtn = document.getElementById('add-item-btn');
const formItemSection = document.getElementById('form-item-section');
const formItem = document.getElementById('form-item');
const formItemTitle = document.getElementById('form-item-title');
const cancelarItemBtn = document.getElementById('cancelar-item-btn');

let editandoItemId = null;

if (addItemBtn) {
  addItemBtn.addEventListener('click', () => abrirFormItem());
}

function abrirFormItem(item = null) {
  formItemSection.classList.remove('hidden');
  document.getElementById('estoque').classList.add('hidden');
  if (item) {
    formItemTitle.textContent = 'Editar Item';
    formItem['item-id'].value = item.id;
    formItem['item-nome'].value = item.nome;
    formItem['item-quantidade'].value = item.quantidade;
    formItem['item-minima'].value = item.quantidade_minima;
    formItem['item-unidade'].value = item.unidade;
    formItem['item-fornecedor'].value = item.fornecedor;
    editandoItemId = item.id;
  } else {
    formItemTitle.textContent = 'Adicionar Item';
    formItem.reset();
    editandoItemId = null;
  }
}

if (cancelarItemBtn) {
  cancelarItemBtn.addEventListener('click', () => {
    formItemSection.classList.add('hidden');
    document.getElementById('estoque').classList.remove('hidden');
  });
}

// ===============================
// Submissão do formulário de item
// ===============================
formItem.addEventListener('submit', async (e) => {
  e.preventDefault();
  // Validação
  const nome = formItem['item-nome'].value.trim();
  const quantidade = parseInt(formItem['item-quantidade'].value, 10);
  const minima = parseInt(formItem['item-minima'].value, 10);
  const unidade = formItem['item-unidade'].value.trim();
  const fornecedor = formItem['item-fornecedor'].value.trim();
  if (!nome || isNaN(quantidade) || isNaN(minima) || !unidade || !fornecedor) {
    showToast('Preencha todos os campos corretamente.', 'error');
    return;
  }
  if (quantidade < 0 || minima < 0) {
    showToast('Quantidade e mínima devem ser maiores ou iguais a zero.', 'error');
    return;
  }
  // Verificar nome duplicado
  const { data: itensExistentes, error: erroBusca } = await supabase.from('itens').select('id, nome, quantidade');
  if (erroBusca) {
    showToast('Erro ao verificar nomes duplicados: ' + erroBusca.message, 'error');
    return;
  }
  const nomeLower = nome.toLowerCase();
  const itemDuplicado = itensExistentes.find(item => item.nome.toLowerCase() === nomeLower);
  if (!editandoItemId && itemDuplicado) {
    // Se for adição e já existe, somar quantidade
    const novaQuantidade = (parseInt(itemDuplicado.quantidade, 10) || 0) + quantidade;
    const { error: erroUpdate } = await supabase
      .from('itens')
      .update({ quantidade: novaQuantidade })
      .eq('id', itemDuplicado.id);
    if (erroUpdate) {
      showToast('Erro ao atualizar quantidade do item existente: ' + erroUpdate.message, 'error');
      return;
    }
    showToast('Quantidade somada ao item já existente!', 'success');
    formItemSection.classList.add('hidden');
    document.getElementById('estoque').classList.remove('hidden');
    loadEstoque();
    return;
  } else if (editandoItemId) {
    // Se for edição, não permitir nome duplicado em outro item
    const duplicado = itensExistentes.some(item => item.nome.toLowerCase() === nomeLower && item.id !== editandoItemId);
    if (duplicado) {
      showToast('Já existe um produto com esse nome.', 'error');
      return;
    }
  }
  // Inserir ou atualizar
  if (editandoItemId) {
    // Atualizar item
    const { error } = await supabase
      .from('itens')
      .update({ nome, quantidade, quantidade_minima: minima, unidade, fornecedor })
      .eq('id', editandoItemId);
    if (error) {
      showToast('Erro ao atualizar item: ' + error.message, 'error');
      return;
    }
    showToast('Item atualizado com sucesso!', 'success');
  } else {
    // Adicionar item
    const { data, error } = await supabase
      .from('itens')
      .insert([{ nome, quantidade, quantidade_minima: minima, unidade, fornecedor }])
      .select();
    if (error) {
      showToast('Erro ao adicionar item: ' + error.message, 'error');
      return;
    }
    // Registrar entrada no histórico
    if (data && data[0]) {
      const user = await supabase.auth.getUser();
      await supabase.from('historico').insert([{
        tipo: 'entrada',
        item_id: data[0].id,
        quantidade,
        usuario_id: user.data.user.id,
        fornecedor,
        unidade
      }]);
    }
    showToast('Item adicionado com sucesso!', 'success');
  }
  formItemSection.classList.add('hidden');
  document.getElementById('estoque').classList.remove('hidden');
  loadEstoque();
});

// ===============================
// Funções globais para editar/excluir
// ===============================
window.editarItem = async function(id) {
  // Buscar item e abrir formulário preenchido
  const { data, error } = await supabase.from('itens').select('*').eq('id', id).single();
  if (error) {
    showToast('Erro ao buscar item: ' + error.message, 'error');
    return;
  }
  abrirFormItem(data);
};

window.excluirItem = async function(id) {
  if (confirm('Tem certeza que deseja excluir este item?')) {
    const { error } = await supabase.from('itens').delete().eq('id', id);
    if (error) {
      showToast('Erro ao excluir item: ' + error.message, 'error');
      return;
    }
    // Registrar exclusão no histórico
    const user = await supabase.auth.getUser();
    await supabase.from('historico').insert([{
      tipo: 'exclusao',
      item_id: id,
      quantidade: 0,
      usuario_id: user.data.user.id
    }]);
    showToast('Item excluído com sucesso!', 'success');
    loadEstoque();
  }
};

// ===============================
// Consumir Item - Abrir formulário (agora com select de itens)
// ===============================
const formConsumirSection = document.getElementById('form-consumir-section');
const formConsumir = document.getElementById('form-consumir');
const cancelarConsumirBtn = document.getElementById('cancelar-consumir-btn');
const consumirItemSelect = document.getElementById('consumir-item-select');
const consumirQuantidadeInput = document.getElementById('consumir-quantidade');

// Popular select de itens ao abrir o formulário
async function abrirFormConsumir() {
  consumirItemSelect.innerHTML = '<option value="">Carregando...</option>';
  consumirQuantidadeInput.value = '';
  consumirQuantidadeInput.max = '';
  // Buscar itens disponíveis
  const { data: itens, error } = await supabase.from('itens').select('*').order('nome');
  if (error) {
    showToast('Erro ao carregar itens: ' + error.message, 'error');
    return;
  }
  if (!itens || itens.length === 0) {
    consumirItemSelect.innerHTML = '<option value="">Nenhum item disponível</option>';
    return;
  }
  consumirItemSelect.innerHTML = '<option value="">Selecione um item</option>' +
    itens.map(item => `<option value="${item.id}" data-qtd="${item.quantidade}">${item.nome} (${item.quantidade} ${item.unidade})</option>`).join('');
  formConsumirSection.classList.remove('hidden');
  document.getElementById('estoque').classList.add('hidden');
}

// Atualizar max do campo quantidade ao selecionar item
consumirItemSelect.addEventListener('change', function() {
  const selected = consumirItemSelect.options[consumirItemSelect.selectedIndex];
  const qtd = selected.getAttribute('data-qtd');
  consumirQuantidadeInput.max = qtd || '';
});

if (cancelarConsumirBtn) {
  cancelarConsumirBtn.addEventListener('click', () => {
    formConsumirSection.classList.add('hidden');
    document.getElementById('estoque').classList.remove('hidden');
  });
}

// Submissão do formulário de consumo
formConsumir.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = consumirItemSelect.value;
  const quantidade = parseInt(consumirQuantidadeInput.value, 10);
  if (!id || isNaN(quantidade) || quantidade <= 0) {
    showToast('Selecione um item e informe uma quantidade válida.', 'error');
    return;
  }
  // Buscar item atual
  const { data: item, error } = await supabase.from('itens').select('*').eq('id', id).single();
  if (error) {
    showToast('Erro ao buscar item: ' + error.message, 'error');
    return;
  }
  if (quantidade > item.quantidade) {
    showToast('Não é possível consumir mais do que disponível.', 'error');
    return;
  }
  // Atualizar estoque
  const { error: updateError } = await supabase
    .from('itens')
    .update({ quantidade: item.quantidade - quantidade })
    .eq('id', id);
  if (updateError) {
    showToast('Erro ao atualizar estoque: ' + updateError.message, 'error');
    return;
  }
  // Registrar saída no histórico
  const user = await supabase.auth.getUser();
  await supabase.from('historico').insert([{
    tipo: 'saida',
    item_id: id,
    quantidade,
    usuario_id: user.data.user.id,
    fornecedor: item.fornecedor,
    unidade: item.unidade
  }]);
  showToast('Consumo registrado com sucesso!', 'success');
  formConsumirSection.classList.add('hidden');
  // Redirecionar para dashboard se perfil for operacional
  const role = userRoleSpan.textContent.toLowerCase();
  if (role === 'operacional') {
    showSection('dashboard');
  } else {
    document.getElementById('estoque').classList.remove('hidden');
    loadEstoque();
  }
});

// ===============================
// Relatório de Estoque Baixo
// ===============================
async function loadRelatorioBaixo() {
  const { data: itens, error } = await supabase.from('itens').select('*');
  if (error) {
    showToast('Erro ao carregar itens: ' + error.message, 'error');
    return;
  }
  // Filtrar itens abaixo do mínimo
  const itensBaixo = itens.filter(item => item.quantidade <= item.quantidade_minima);
  // Calcular sugestão de compra
  const relatorio = itensBaixo.map(item => ({
    nome: item.nome,
    quantidade_atual: item.quantidade,
    quantidade_minima: item.quantidade_minima,
    unidade: item.unidade,
    fornecedor: item.fornecedor,
    sugestao_compra: Math.max(item.quantidade_minima - item.quantidade, 0)
  }));
  renderRelatorioTabela(relatorio);
}

function renderRelatorioTabela(relatorio) {
  const container = document.getElementById('relatorio-tabela');
  if (!container) return;
  if (relatorio.length === 0) {
    container.innerHTML = '<div class="p-4 text-center text-gray-500">Nenhum item abaixo do mínimo.</div>';
    return;
  }
  let html = `<table class="min-w-full bg-white rounded shadow text-center">
    <thead><tr>
      <th class="px-4 py-2 text-left">Nome</th>
      <th class="px-4 py-2 text-center">Qtd. Atual</th>
      <th class="px-4 py-2 text-center">Qtd. Mínima</th>
      <th class="px-4 py-2 text-center">Unidade</th>
      <th class="px-4 py-2 text-left">Fornecedor</th>
      <th class="px-4 py-2 text-center">Sugestão de Compra</th>
    </tr></thead><tbody>`;
  relatorio.forEach(item => {
    html += `<tr>
      <td class="px-4 py-2 text-left">${item.nome}</td>
      <td class="px-4 py-2 text-center">${item.quantidade_atual}</td>
      <td class="px-4 py-2 text-center">${item.quantidade_minima}</td>
      <td class="px-4 py-2 text-center">${item.unidade}</td>
      <td class="px-4 py-2 text-left">${item.fornecedor}</td>
      <td class="px-4 py-2 text-center font-bold text-green-700">${item.sugestao_compra}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

// Exportar relatório para Excel
const exportarExcelBtn = document.getElementById('exportar-excel-btn');
if (exportarExcelBtn) {
  exportarExcelBtn.addEventListener('click', async () => {
    const { data: itens } = await supabase.from('itens').select('*');
    const itensBaixo = itens.filter(item => item.quantidade <= item.quantidade_minima);
    const relatorio = itensBaixo.map(item => ({
      Nome: item.nome,
      'Qtd. Atual': item.quantidade,
      'Qtd. Mínima': item.quantidade_minima,
      Unidade: item.unidade,
      Fornecedor: item.fornecedor,
      'Sugestão de Compra': Math.max(item.quantidade_minima - item.quantidade, 0)
    }));
    if (relatorio.length === 0) {
      showToast('Nenhum item abaixo do mínimo para exportar.', 'error');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(relatorio);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estoque Baixo');
    XLSX.writeFile(wb, 'relatorio_estoque_baixo.xlsx');
  });
}

// Chamar loadRelatorioBaixo ao exibir a seção
const relatorioSection = document.getElementById('relatorio-baixo');
if (relatorioSection) {
  relatorioSection.addEventListener('show', loadRelatorioBaixo);
}

// ===============================
// Histórico de Transações
// ===============================
async function loadHistorico() {
  // Buscar histórico, itens e usuários
  const { data: historico, error } = await supabase.from('historico').select('*').order('data', { ascending: false });
  if (error) {
    showToast('Erro ao carregar histórico: ' + error.message, 'error');
    return;
  }
  // Buscar nomes dos itens
  const itemIds = [...new Set(historico.map(h => h.item_id))];
  let nomesItens = {};
  if (itemIds.length > 0) {
    const { data: itens } = await supabase.from('itens').select('id, nome').in('id', itemIds);
    itens.forEach(i => { nomesItens[i.id] = i.nome; });
  }
  // Buscar nomes dos usuários
  const usuarioIds = [...new Set(historico.map(h => h.usuario_id).filter(Boolean))];
  let nomesUsuarios = {};
  if (usuarioIds.length > 0) {
    const { data: perfis } = await supabase.from('profiles').select('id, nome').in('id', usuarioIds);
    perfis.forEach(u => { nomesUsuarios[u.id] = u.nome; });
  }
  renderHistoricoTabela(historico, nomesItens, nomesUsuarios);
}

function renderHistoricoTabela(historico, nomesItens, nomesUsuarios) {
  const container = document.getElementById('historico-tabela');
  if (!container) return;
  if (!historico || historico.length === 0) {
    container.innerHTML = '<div class="p-4 text-center text-gray-500">Nenhuma transação encontrada.</div>';
    return;
  }
  let html = `<table class="min-w-full bg-white rounded shadow text-center">
    <thead><tr>
      <th class="px-4 py-2 text-center">Data</th>
      <th class="px-4 py-2 text-left">Item</th>
      <th class="px-4 py-2 text-center">Tipo</th>
      <th class="px-4 py-2 text-center">Quantidade</th>
      <th class="px-4 py-2 text-left">Usuário</th>
      <th class="px-4 py-2 text-left">Fornecedor</th>
      <th class="px-4 py-2 text-center">Unidade</th>
    </tr></thead><tbody>`;
  historico.forEach(h => {
    const data = new Date(h.data).toLocaleString('pt-BR');
    const item = nomesItens[h.item_id] || h.item_id || '-';
    const usuario = nomesUsuarios[h.usuario_id] || h.usuario_id || '-';
    let tipo = h.tipo;
    if (tipo === 'entrada') tipo = 'Entrada';
    else if (tipo === 'saida') tipo = 'Saída';
    else if (tipo === 'exclusao') tipo = 'Exclusão';
    html += `<tr>
      <td class="px-4 py-2 text-center">${data}</td>
      <td class="px-4 py-2 text-left">${item}</td>
      <td class="px-4 py-2 text-center">${tipo}</td>
      <td class="px-4 py-2 text-center">${h.quantidade}</td>
      <td class="px-4 py-2 text-left">${usuario}</td>
      <td class="px-4 py-2 text-left">${h.fornecedor || '-'}</td>
      <td class="px-4 py-2 text-center">${h.unidade || '-'}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

// Chamar loadHistorico ao exibir a seção
const historicoSection = document.getElementById('historico');
if (historicoSection) {
  historicoSection.addEventListener('show', loadHistorico);
}

// ===============================
// Navegação SPA pelo menu
// ===============================
const menuBtns = document.querySelectorAll('.menu-btn');
const sections = [
  'dashboard',
  'estoque',
  'form-consumir-section',
  'form-item-section',
  'relatorio-baixo',
  'historico'
].map(id => document.getElementById(id));

function showSection(sectionId) {
  sections.forEach(sec => {
    if (sec) sec.classList.add('hidden');
  });
  const sec = document.getElementById(sectionId);
  if (sec) {
    sec.classList.remove('hidden');
    // Dispara evento customizado para carregar dados se necessário
    sec.dispatchEvent(new Event('show'));
  }
  // Atualiza menu ativo
  menuBtns.forEach(btn => {
    if (btn.dataset.section === sectionId) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

// ===============================
// Controle de visibilidade do menu por perfil
// ===============================
function ajustarMenuPorPerfil(role) {
  const menuDashboard = document.querySelector('.menu-btn[data-section="dashboard"]');
  const menuEstoque = document.querySelector('.menu-btn[data-section="estoque"]');
  const menuConsumir = document.querySelector('.menu-btn[data-section="form-consumir-section"]');
  const menuAdicionar = document.querySelector('.menu-btn[data-section="form-item-section"]');
  const menuRelatorio = document.querySelector('.menu-btn[data-section="relatorio-baixo"]');
  const menuHistorico = document.querySelector('.menu-btn[data-section="historico"]');
  if (role === 'operacional') {
    if (menuEstoque) menuEstoque.style.display = 'none';
    if (menuAdicionar) menuAdicionar.style.display = 'none';
    if (menuRelatorio) menuRelatorio.style.display = 'none';
    if (menuHistorico) menuHistorico.style.display = 'none';
  } else {
    if (menuEstoque) menuEstoque.style.display = '';
    if (menuAdicionar) menuAdicionar.style.display = '';
    if (menuRelatorio) menuRelatorio.style.display = '';
    if (menuHistorico) menuHistorico.style.display = '';
  }
}

// Bloquear acesso direto às seções restritas para operacional
const sectionsRestritas = ['estoque', 'form-item-section', 'relatorio-baixo', 'historico'];
menuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const role = userRoleSpan.textContent.toLowerCase();
    if (role === 'operacional' && sectionsRestritas.includes(btn.dataset.section)) {
      showToast('Acesso restrito para este perfil.', 'error');
      showSection('dashboard');
      return;
    }
    showSection(btn.dataset.section);
    // Fechar drawer se estiver aberto
    if (drawerMenu && !drawerMenu.classList.contains('-translate-x-full')) {
      closeDrawer();
    }
  });
});

// Exibir dashboard por padrão ao logar
function showMain(role) {
  loginContainer.classList.add('hidden');
  mainContainer.classList.remove('hidden');
  if (navBar) navBar.classList.remove('hidden');
  userRoleSpan.textContent = role === 'admin' ? 'Administrador' : 'Operacional';
  ajustarMenuPorPerfil(role);
  showSection('dashboard');
  loadDashboard();
}

// ===============================
// Toasts
// ===============================
function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `px-4 py-3 rounded-lg shadow-lg text-white font-semibold flex items-center gap-2 mb-2 ` +
    (type === 'success' ? 'bg-green-600' : 'bg-red-600');
  toast.innerHTML = `<svg class=\"w-5 h-5\">${type === 'success'
    ? '<use href=\"#heroicon-o-check-circle\" />'
    : '<use href=\"#heroicon-o-x-circle\" />'}<\/svg>${msg}`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ===============================
// Observação
// ===============================
// Substitua SUPABASE_URL e SUPABASE_KEY pelos valores do seu projeto.
// Implemente as funções de carregamento e manipulação conforme o schema do seu Supabase.

// ===============================
// Menu hambúrguer responsivo (drawer)
// ===============================
const menuToggle = document.getElementById('menu-toggle');
const drawerMenu = document.getElementById('drawer-menu');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerClose = document.getElementById('drawer-close');
const mainMenu = document.getElementById('main-menu');

function openDrawer() {
  drawerMenu.classList.remove('-translate-x-full');
  drawerBackdrop.classList.add('show');
}
function closeDrawer() {
  drawerMenu.classList.add('-translate-x-full');
  setTimeout(() => {
    drawerBackdrop.classList.remove('show');
  }, 200);
}
if (menuToggle) menuToggle.addEventListener('click', openDrawer);
if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
// Também fecha o drawer ao clicar fora dele (em qualquer lugar fora do drawer-menu)
document.addEventListener('mousedown', function(e) {
  if (!drawerMenu.classList.contains('-translate-x-full')) {
    if (!drawerMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      closeDrawer();
    }
  }
});
// Sincronizar seleção de abas entre drawer e menu desktop
function setActiveMenu(sectionId) {
  document.querySelectorAll('.menu-btn').forEach(btn => {
    if (btn.dataset.section === sectionId) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

// Chamar abrirFormConsumir ao exibir a aba Consumir
const consumirSection = document.getElementById('form-consumir-section');
if (consumirSection) {
  consumirSection.addEventListener('show', abrirFormConsumir);
}

// Fechar drawer ao selecionar uma aba
const drawerBtns = drawerMenu.querySelectorAll('.menu-btn');
drawerBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    closeDrawer();
  });
});
