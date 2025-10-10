// 🌿 Serviço para gestão administrativa
// 🌿 Configuração da API
const API_CONFIG = {
    BASE_URL: 'http://localhost:3000/api',
    ENDPOINTS: {
        EVENTOS: '/eventos',
        ADMIN: '/admin'
    }
};

// 🗂️ Serviço para comunicação com a API
class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    // Método genérico para fazer requisições
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na comunicação com a API:', error);
            throw error;
        }
    }

    // 🔹 Buscar todos os eventos
    async getEventos() {
        // Por enquanto, retorna os dados mock
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(eventos);
            }, 500);
        });
    }
}

// 📋 Dados mock
const eventos = [
    {
        id: 1,
        titulo: "Plantio de Mudas no Parque Cesamar",
        data: "2025-11-25",
        local: "Parque Cesamar",
        categoria: "Reflorestamento",
        imagem: "https://i.pinimg.com/1200x/40/68/e9/4068e92c207b1c7fb311ab9b7ccdeab1.jpg",
        participantes: 42,
        descricao: "Participe do plantio de mudas nativas e ajude a reflorestar áreas degradadas.",
        organizador: "Secretaria do Meio Ambiente",
        contato: "meioambiente@palmas.to.gov.br",
        requisitos: "Trazer luvas e protetor solar.",
        status: "ativo"
    },
    {
        id: 2,
        titulo: "Limpeza do Lago de Palmas",
        data: "2025-12-10",
        local: "Orla do Lago",
        categoria: "Limpeza de Rios",
        imagem: "https://i.pinimg.com/1200x/5c/f8/92/5cf8929a03c20807b60a6b0b8cc03357.jpg",
        participantes: 65,
        descricao: "Mutirão de limpeza das margens do Lago de Palmas.",
        organizador: "Projeto Lago Limpo",
        contato: "contato@lagolimpo.org",
        requisitos: "Usar roupas leves e calçado fechado.",
        status: "ativo"
    },
    {
        id: 3,
        titulo: "Palestras Agrotins",
        data: "2025-10-07",
        local: "Unitins",
        categoria: "Palestra",
        imagem: "https://i.pinimg.com/736x/3f/a6/ea/3fa6ea0fb9b9889b651083a27c32fed6.jpg",
        participantes: 29,
        descricao: "Palestras sobre agricultura sustentável e tecnologias ambientais.",
        organizador: "Agrotins",
        contato: "contato@agrotins.to.gov.br",
        requisitos: "Inscrição prévia no site oficial.",
        status: "pendente"
    }
];

// 🌿 Serviço para gestão administrativa
class AdminService {
    constructor() {
        this.apiService = new ApiService();
    }

    async carregarEventos() {
        return await this.apiService.getEventos();
    }

    async criarEvento(dadosEvento) {
        // Simula criação na API
        return new Promise((resolve) => {
            setTimeout(() => {
                const novoEvento = {
                    id: Date.now(),
                    ...dadosEvento,
                    participantes: 0,
                    dataCriacao: new Date().toISOString(),
                    status: 'ativo'
                };
                
                // Salvar no localStorage (em produção seria na API)
                const eventosExistentes = JSON.parse(localStorage.getItem('eventosAdmin') || '[]');
                eventosExistentes.push(novoEvento);
                localStorage.setItem('eventosAdmin', JSON.stringify(eventosExistentes));
                
                resolve({
                    success: true,
                    evento: novoEvento,
                    message: 'Evento criado com sucesso!'
                });
            }, 1000);
        });
    }

    async atualizarEvento(id, dadosEvento) {
        // Simula atualização na API
        return new Promise((resolve) => {
            setTimeout(() => {
                const eventos = JSON.parse(localStorage.getItem('eventosAdmin') || '[]');
                const index = eventos.findIndex(e => e.id === id);
                
                if (index !== -1) {
                    eventos[index] = { ...eventos[index], ...dadosEvento };
                    localStorage.setItem('eventosAdmin', JSON.stringify(eventos));
                    resolve({ success: true, message: 'Evento atualizado com sucesso!' });
                } else {
                    resolve({ success: false, message: 'Evento não encontrado' });
                }
            }, 800);
        });
    }

    async excluirEvento(id) {
        // Simula exclusão na API
        return new Promise((resolve) => {
            setTimeout(() => {
                const eventos = JSON.parse(localStorage.getItem('eventosAdmin') || '[]');
                const eventosFiltrados = eventos.filter(e => e.id !== id);
                localStorage.setItem('eventosAdmin', JSON.stringify(eventosFiltrados));
                resolve({ success: true, message: 'Evento excluído com sucesso!' });
            }, 600);
        });
    }
}

// 🎯 Elementos da página
const elements = {
    totalEventos: document.getElementById('totalEventos'),
    totalParticipantes: document.getElementById('totalParticipantes'),
    eventosAtivos: document.getElementById('eventosAtivos'),
    eventosFuturos: document.getElementById('eventosFuturos'),
    proximosEventos: document.getElementById('proximosEventos'),
    tabelaEventos: document.getElementById('tabelaEventos'),
    formNovoEvento: document.getElementById('formNovoEvento'),
    imagePreview: document.getElementById('imagePreview')
};

// 🚀 Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    const adminService = new AdminService();
    
    inicializarPainel(adminService);
    configurarNavegacao();
    configurarFormularioEvento(adminService);
    configurarPreviewImagem();
});

// 📊 Inicializar painel com dados
async function inicializarPainel(adminService) {
    try {
        const eventos = await adminService.carregarEventos();
        atualizarEstatisticas(eventos);
        carregarProximosEventos(eventos);
        carregarTabelaEventos(eventos);
    } catch (error) {
        console.error('Erro ao carregar dados do painel:', error);
        alert('Erro ao carregar dados do painel');
    }
}

// 📈 Atualizar estatísticas do dashboard
function atualizarEstatisticas(eventos) {
    const totalEventos = eventos.length;
    const totalParticipantes = eventos.reduce((sum, evento) => sum + evento.participantes, 0);
    const eventosAtivos = eventos.filter(e => e.status === 'ativo').length;
    const eventosFuturos = eventos.filter(e => new Date(e.data) > new Date()).length;

    if (elements.totalEventos) elements.totalEventos.textContent = totalEventos;
    if (elements.totalParticipantes) elements.totalParticipantes.textContent = totalParticipantes;
    if (elements.eventosAtivos) elements.eventosAtivos.textContent = eventosAtivos;
    if (elements.eventosFuturos) elements.eventosFuturos.textContent = eventosFuturos;
}

// 📅 Carregar próximos eventos no dashboard
function carregarProximosEventos(eventos) {
    if (!elements.proximosEventos) return;
    
    const eventosFuturos = eventos
        .filter(e => new Date(e.data) > new Date())
        .slice(0, 3);

    elements.proximosEventos.innerHTML = eventosFuturos.map(evento => `
        <div class="col-md-4 mb-3">
            <div class="card evento-card">
                <img src="${evento.imagem}" class="card-img-top evento-image" alt="${evento.titulo}">
                <div class="card-body">
                    <h6 class="card-title">${evento.titulo}</h6>
                    <p class="card-text small text-muted">
                        <i class="bi bi-calendar me-1"></i>${new Date(evento.data).toLocaleDateString('pt-BR')}
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge ${getStatusBadgeClass(evento.status)}">${evento.status}</span>
                        <button class="btn btn-sm btn-outline-primary" onclick="editarEvento(${evento.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 📋 Carregar tabela de eventos
function carregarTabelaEventos(eventos) {
    if (!elements.tabelaEventos) return;
    
    elements.tabelaEventos.innerHTML = eventos.map(evento => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${evento.imagem}" alt="${evento.titulo}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" class="me-3">
                    <div>
                        <strong>${evento.titulo}</strong>
                        <br>
                        <small class="text-muted">${evento.categoria}</small>
                    </div>
                </div>
            </td>
            <td>${new Date(evento.data).toLocaleDateString('pt-BR')}</td>
            <td>${evento.local}</td>
            <td>
                <span class="badge bg-primary">${evento.participantes}</span>
            </td>
            <td>
                <span class="status-badge ${getStatusBadgeClass(evento.status)}">
                    ${evento.status}
                </span>
            </td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" onclick="editarEvento(${evento.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirEvento(${evento.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 🎫 Configurar formulário de novo evento
function configurarFormularioEvento(adminService) {
    if (!elements.formNovoEvento) return;
    
    elements.formNovoEvento.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Mostrar loading
        submitBtn.innerHTML = '<i class="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>Criando...';
        submitBtn.disabled = true;
        
        try {
            const dadosEvento = {
                titulo: document.getElementById('titulo').value,
                descricao: document.getElementById('descricao').value,
                data: document.getElementById('data').value,
                local: document.getElementById('local').value,
                categoria: document.getElementById('categoria').value,
                organizador: document.getElementById('organizador').value,
                contato: document.getElementById('contato').value,
                requisitos: document.getElementById('requisitos').value,
                participantes: parseInt(document.getElementById('participantes').value) || 0,
                imagem: 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80' // Imagem padrão
            };
            
            const resultado = await adminService.criarEvento(dadosEvento);
            
            if (resultado.success) {
                alert('✅ ' + resultado.message);
                this.reset();
                if (elements.imagePreview) elements.imagePreview.innerHTML = '';
                mostrarSecao('eventos');
                // Recarregar dados
                inicializarPainel(adminService);
            } else {
                throw new Error(resultado.message);
            }
            
        } catch (error) {
            alert('❌ Erro ao criar evento: ' + error.message);
        } finally {
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// 🖼️ Configurar preview de imagem
function configurarPreviewImagem() {
    const inputImagem = document.getElementById('imagem');
    
    if (inputImagem && elements.imagePreview) {
        inputImagem.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    elements.imagePreview.innerHTML = `
                        <img src="${e.target.result}" class="img-fluid rounded" style="max-height: 200px;">
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// 🧭 Configurar navegação entre seções
function configurarNavegacao() {
    // Ativar links da sidebar
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            mostrarSecao(target);
            
            // Ativar link clicado
            document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Mostrar dashboard por padrão
    mostrarSecao('dashboard');
}

// 🎯 Mostrar seção específica
function mostrarSecao(secaoId) {
    // Esconder todas as seções
    document.querySelectorAll('.main-content > section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Mostrar seção desejada
    const secao = document.getElementById(secaoId);
    if (secao) {
        secao.style.display = 'block';
    }
}

// ✏️ Editar evento
function editarEvento(id) {
    alert(`📝 Editar evento ${id} - Funcionalidade em desenvolvimento`);
    // Em produção, abriria um formulário de edição
}

// 🗑️ Excluir evento
async function excluirEvento(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        const adminService = new AdminService();
        
        try {
            const resultado = await adminService.excluirEvento(id);
            if (resultado.success) {
                alert('✅ ' + resultado.message);
                // Recarregar dados
                inicializarPainel(adminService);
            }
        } catch (error) {
            alert('❌ Erro ao excluir evento: ' + error.message);
        }
    }
}

// 🏷️ Obter classe do badge de status
function getStatusBadgeClass(status) {
    const classes = {
        'ativo': 'status-ativo',
        'inativo': 'status-inativo',
        'pendente': 'status-pendente'
    };
    return classes[status] || 'status-pendente';
}

// 📊 Funções para a seção de Relatórios
function gerarRelatorioMensal() {
    alert('📊 Relatório mensal será gerado em PDF - Funcionalidade em desenvolvimento');
}

function exportarDadosCompletos() {
    alert('📥 Exportando dados completos - Funcionalidade em desenvolvimento');
}

// 👥 Funções para a seção de Participantes
function exportarParticipantes() {
    alert('📋 Exportando lista de participantes - Funcionalidade em desenvolvimento');
}

function carregarParticipantes() {
    // Em produção, carregaria dados da API
    const participantes = JSON.parse(localStorage.getItem('participacoesEventos') || '[]');
    
    if (participantes.length > 0) {
        // Preencher tabela com participantes
        console.log('Participantes carregados:', participantes);
    }
}

// ⚙️ Funções para a seção de Configurações
function salvarConfiguracoes() {
    const configuracoes = {
        notificacoesEmail: document.getElementById('notificacoesEmail').checked,
        notificacoesNovosEventos: document.getElementById('notificacoesNovosEventos').checked,
        notificacoesParticipantes: document.getElementById('notificacoesParticipantes').checked,
        autenticacaoDupla: document.getElementById('autenticacaoDupla').checked,
        tempoSessao: document.getElementById('tempoSessao').value,
        limiteParticipantes: document.getElementById('limiteParticipantes').value,
        timezone: document.getElementById('timezone').value,
        idioma: document.getElementById('idioma').value,
        formatoData: document.getElementById('formatoData').value
    };
    
    localStorage.setItem('configuracoesAdmin', JSON.stringify(configuracoes));
    alert('✅ Configurações salvas com sucesso!');
}

function carregarConfiguracoes() {
    const configuracoes = JSON.parse(localStorage.getItem('configuracoesAdmin') || '{}');
    
    // Aplicar configurações salvas
    if (configuracoes.notificacoesEmail !== undefined) {
        document.getElementById('notificacoesEmail').checked = configuracoes.notificacoesEmail;
    }
    // ... carregar outras configurações
}

// 🎯 Atualizar a função de inicialização para carregar as novas seções
async function inicializarPainel(adminService) {
    try {
        const eventos = await adminService.carregarEventos();
        atualizarEstatisticas(eventos);
        carregarProximosEventos(eventos);
        carregarTabelaEventos(eventos);
        carregarParticipantes();
        carregarConfiguracoes();
    } catch (error) {
        console.error('Erro ao carregar dados do painel:', error);
        alert('Erro ao carregar dados do painel');
    }
}