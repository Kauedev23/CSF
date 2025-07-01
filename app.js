// app.js

// Supabase configuration
const { createClient } = supabase;
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const dashboard = document.getElementById('dashboard');
const inventoryTable = document.getElementById('inventory-table');
const addItemForm = document.getElementById('add-item-form');
const consumeItemForm = document.getElementById('consume-item-form');
const reportButton = document.getElementById('report-button');

// Event Listeners
loginForm.addEventListener('submit', handleLogin);
logoutButton.addEventListener('click', handleLogout);
addItemForm.addEventListener('submit', handleAddItem);
consumeItemForm.addEventListener('submit', handleConsumeItem);
reportButton.addEventListener('click', generateReport);

// Authentication Functions
async function handleLogin(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const { user, error } = await supabase.auth.signIn({ email, password });
    if (error) {
        alert('Erro ao fazer login: ' + error.message);
    } else {
        loadDashboard();
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
    location.reload();
}

// Dashboard Functions
async function loadDashboard() {
    const { data, error } = await supabase.from('estoque').select('*');
    if (error) {
        console.error('Erro ao carregar o dashboard:', error);
        return;
    }
    displayDashboardStats(data);
}

// Inventory Management Functions
async function handleAddItem(event) {
    event.preventDefault();
    const itemData = {
        nome: event.target.nome.value,
        quantidade: event.target.quantidade.value,
        quantidade_minima: event.target.quantidade_minima.value,
        unidade: event.target.unidade.value,
        fornecedor: event.target.fornecedor.value,
    };

    const { error } = await supabase.from('estoque').insert([itemData]);
    if (error) {
        alert('Erro ao adicionar item: ' + error.message);
    } else {
        loadInventory();
    }
}

async function handleConsumeItem(event) {
    event.preventDefault();
    const itemId = event.target.item_id.value;
    const quantidade = event.target.quantidade.value;

    const { data, error } = await supabase
        .from('estoque')
        .select('quantidade')
        .eq('id', itemId)
        .single();

    if (data.quantidade < quantidade) {
        alert('Quantidade insuficiente!');
        return;
    }

    const { error: consumeError } = await supabase
        .from('estoque')
        .update({ quantidade: data.quantidade - quantidade })
        .eq('id', itemId);

    if (consumeError) {
        alert('Erro ao consumir item: ' + consumeError.message);
    } else {
        loadInventory();
    }
}

// Report Generation
function generateReport() {
    // Logic to generate and export report using SheetJS
}

// Utility Functions
function displayDashboardStats(data) {
    // Logic to display statistics and charts using Chart.js
}

function loadInventory() {
    // Logic to load and display inventory items
}

// Initialize application
async function init() {
    const { data: user } = await supabase.auth.getUser();
    if (user) {
        loadDashboard();
    }
}

init();