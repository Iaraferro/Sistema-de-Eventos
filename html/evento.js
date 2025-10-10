// 🌿 Serviço para carregar detalhes do evento
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

    // 🔹 Buscar evento por ID
    async getEventoById(id) {
        // Por enquanto, busca nos dados mock
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const evento = eventos.find(e => e.id === id);
                if (evento) {
                    resolve(evento);
                } else {
                    reject(new Error('Evento não encontrado'));
                }
            }, 300);
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
        descricao: "Participe do plantio de mudas nativas e ajude a reflorestar áreas degradadas. Este evento tem como objetivo recuperar áreas verdes do Parque Cesamar, promovendo a conscientização ambiental e a preservação da biodiversidade local. Será uma manhã dedicada à natureza, com orientação de especialistas em reflorestamento.",
        descricaoCurta: "Participe do plantio de mudas nativas e ajude a reflorestar áreas degradadas.",
        organizador: "Secretaria do Meio Ambiente",
        contato: "meioambiente@palmas.to.gov.br",
        requisitos: "Trazer luvas de jardinagem, protetor solar, garrafa de água reutilizável e usar roupas confortáveis. O evento acontecerá mesmo em caso de chuva leve."
    },
    {
        id: 2,
        titulo: "Limpeza do Lago de Palmas",
        data: "2025-12-10",
        local: "Orla do Lago",
        categoria: "Limpeza de Rios",
        imagem: "https://i.pinimg.com/1200x/5c/f8/92/5cf8929a03c20807b60a6b0b8cc03357.jpg",
        participantes: 65,
        descricao: "Mutirão de limpeza das margens do Lago de Palmas. Vamos cuidar das nossas águas! Este evento visa remover resíduos sólidos das margens do lago, conscientizar a população sobre a importância da preservação dos recursos hídricos e promover a educação ambiental.",
        descricaoCurta: "Mutirão de limpeza das margens do Lago de Palmas. Vamos cuidar das nossas águas!",
        organizador: "Projeto Lago Limpo",
        contato: "contato@lagolimpo.org",
        requisitos: "Usar roupas leves, calçado fechado resistente, boné ou chapéu. Luvas e sacos de lixo serão fornecidos pela organização."
    },
    {
        id: 3,
        titulo: "Palestras Agrotins",
        data: "2025-10-07",
        local: "Unitins",
        categoria: "Palestra",
        imagem: "https://i.pinimg.com/736x/3f/a6/ea/3fa6ea0fb9b9889b651083a27c32fed6.jpg",
        participantes: 29,
        descricao: "Palestras sobre agricultura sustentável e tecnologias ambientais. Evento com especialistas nacionais discutindo inovações tecnológicas, práticas agrícolas sustentáveis e políticas públicas para o desenvolvimento rural com preservação ambiental.",
        descricaoCurta: "Palestras sobre agricultura sustentável e tecnologias ambientais.",
        organizador: "Agrotins",
        contato: "contato@agrotins.to.gov.br",
        requisitos: "Inscrição prévia no site oficial. Trazer documento de identificação para credenciamento."
    }
];

// 🌿 Serviço para carregar detalhes do evento
class EventoService {
    constructor() {
        this.apiService = new ApiService();
    }

    async carregarEvento(id) {
        try {
            return await this.apiService.getEventoById(id);
        } catch (error) {
            throw error;
        }
    }

    async participarEvento(eventoId, dadosParticipante) {
        // Simula envio para API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Salvar no localStorage (em produção seria na API)
                const participacoes = JSON.parse(localStorage.getItem('participacoesEventos') || '[]');
                participacoes.push({
                    eventoId,
                    ...dadosParticipante,
                    dataInscricao: new Date().toISOString()
                });
                localStorage.setItem('participacoesEventos', JSON.stringify(participacoes));
                
                resolve({
                    success: true,
                    message: 'Inscrição realizada com sucesso!'
                });
            }, 1000);
        });
    }
}

// 🎯 Elementos da página
const elements = {
    loading: document.getElementById('loadingEvento'),
    content: document.getElementById('eventoContent'),
    error: document.getElementById('errorEvento'),
    hero: document.getElementById('eventoHero'),
    titulo: document.getElementById('eventoTitulo'),
    descricaoCurta: document.getElementById('eventoDescricaoCurta'),
    categoria: document.getElementById('eventoCategoria'),
    participantes: document.getElementById('eventoParticipantes'),
    imagem: document.getElementById('eventoImagem'),
    descricao: document.getElementById('eventoDescricao'),
    requisitos: document.getElementById('eventoRequisitos'),
    data: document.getElementById('eventoData'),
    local: document.getElementById('eventoLocal'),
    organizador: document.getElementById('eventoOrganizador'),
    contato: document.getElementById('eventoContato'),
    btnParticipar: document.getElementById('btnParticipar'),
    btnParticiparSidebar: document.getElementById('btnParticiparSidebar')
};

// 🚀 Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    const eventoService = new EventoService();
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = parseInt(urlParams.get('id'));

    if (!eventoId) {
        mostrarErro();
        return;
    }

    carregarEvento(eventoId, eventoService);
    configurarBotoesParticipar(eventoId, eventoService);
    configurarBotaoVoltarTopo();
});

// 📖 Carregar dados do evento
async function carregarEvento(id, eventoService) {
    try {
        const evento = await eventoService.carregarEvento(id);
        exibirEvento(evento);
    } catch (error) {
        console.error('Erro ao carregar evento:', error);
        mostrarErro();
    }
}

// 🎨 Exibir dados do evento na página
function exibirEvento(evento) {
    // Configurar background do hero
    elements.hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${evento.imagem}')`;
    
    // Preencher dados básicos
    elements.titulo.textContent = evento.titulo;
    elements.descricaoCurta.textContent = evento.descricaoCurta;
    elements.categoria.textContent = evento.categoria;
    elements.participantes.textContent = evento.participantes;
    
    // Preencher imagem e descrições
    elements.imagem.src = evento.imagem;
    elements.imagem.alt = evento.titulo;
    elements.descricao.textContent = evento.descricao;
    elements.requisitos.textContent = evento.requisitos;
    
    // Preencher informações
    elements.data.textContent = new Date(evento.data).toLocaleDateString('pt-BR');
    elements.local.textContent = evento.local;
    elements.organizador.textContent = evento.organizador;
    elements.contato.textContent = evento.contato;
    
    // Mostrar conteúdo e esconder loading
    elements.loading.style.display = 'none';
    elements.content.style.display = 'block';
    
    // Atualizar título da página
    document.title = `${evento.titulo} - EcoEventos Palmas`;
}

// 🎫 Configurar botões de participação
function configurarBotoesParticipar(eventoId, eventoService) {
    const handleParticipar = async () => {
        const btn = elements.btnParticipar;
        const originalText = btn.innerHTML;
        
        // Mostrar loading
        btn.innerHTML = '<i class="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>Processando...';
        btn.disabled = true;
        
        try {
            const resultado = await eventoService.participarEvento(eventoId, {
                nome: 'Usuário', // Em produção, pegaria do formulário de login
                email: 'usuario@exemplo.com'
            });
            
            alert('✅ ' + resultado.message);
            
            // Atualizar contador de participantes
            const participantesElement = elements.participantes;
            const participantesAtuais = parseInt(participantesElement.textContent);
            participantesElement.textContent = participantesAtuais + 1;
            
        } catch (error) {
            alert('❌ Erro ao realizar inscrição: ' + error.message);
        } finally {
            // Restaurar botão
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };
    
    if (elements.btnParticipar) {
        elements.btnParticipar.addEventListener('click', handleParticipar);
    }
    
    if (elements.btnParticiparSidebar) {
        elements.btnParticiparSidebar.addEventListener('click', handleParticipar);
    }
}

// ⬆️ Configurar botão voltar ao topo
function configurarBotaoVoltarTopo() {
    const backToTop = document.querySelector('.back-to-top');
    
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        });
        
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ❌ Mostrar estado de erro
function mostrarErro() {
    if (elements.loading) elements.loading.style.display = 'none';
    if (elements.error) elements.error.style.display = 'block';
    if (elements.content) elements.content.style.display = 'none';
}