// 🎯 Elementos da página (mantido)
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
    btnParticipar: document.getElementById('btnParticipar')
};

// 🚀 Inicialização da página (ATUALIZADO)
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventoId = parseInt(urlParams.get('id'));

    if (!eventoId) {
        mostrarErro();
        return;
    }

    carregarEvento(eventoId);
    configurarBotoesParticipar(eventoId);
    configurarBotaoVoltarTopo();
});

// 📖 Carregar dados do evento da API (ATUALIZADO)
async function carregarEvento(id) {
    try {
        const evento = await eventoService.buscarEventoPorId(id);
        exibirEvento(evento);
    } catch (error) {
        console.error('Erro ao carregar evento:', error);
        mostrarErro();
    }
}

// 🎨 Exibir dados do evento na página (ATUALIZADO)
function exibirEvento(evento) {

      let imagemHero = evento.imagem;
    if (imagemHero && !imagemHero.startsWith('http')) {
        imagemHero = `http://localhost:8080/arquivos/${imagemHero}`;
    }
    
    // 🆕 CORREÇÃO PARA IMAGEM PRINCIPAL
    let imagemPrincipal = evento.imagem;
    if (imagemPrincipal && !imagemPrincipal.startsWith('http')) {
        imagemPrincipal = `http://localhost:8080/arquivos/${imagemPrincipal}`;
    }
    
    // Configurar background do hero com URL corrigida
    elements.hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${imagemHero}')`;
    
    // Preencher imagem principal com URL corrigida
    elements.imagem.src = imagemPrincipal;

    const dataEvento = new Date(evento.dataHora);
    const hoje = new Date();
    const isConcluido = dataEvento < hoje;
    
    // Configurar background do hero com overlay de status
    elements.hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${evento.imagem}')`;
    
    // 🆕 ADICIONAR BADGE DE STATUS NO HERO
    const statusBadge = isConcluido ? 
        '<span class="badge bg-secondary fs-6 mb-3">Evento Realizado</span>' :
        '<span class="badge bg-success fs-6 mb-3">Em Breve</span>';
    
    elements.hero.innerHTML = `
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    ${statusBadge}
                    <span class="categoria-badge mb-3">${evento.categoria}</span>
                    <h1 class="display-5 fw-bold mb-3">${evento.titulo}</h1>
                    <p class="lead mb-4">${evento.descricao?.substring(0, 150)}${evento.descricao?.length > 150 ? '...' : ''}</p>
                    <div class="d-flex flex-wrap gap-3 align-items-center">
                        <span class="participantes-count">
                            <i class="bi bi-people-fill me-2"></i>
                            ${evento.participantes} participantes
                        </span>
                        ${!isConcluido ? `
                            <button class="btn btn-participar" id="btnParticipar">
                                <i class="bi bi-calendar-plus me-2"></i>Quero Participar
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
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
    elements.data.textContent = new Date(evento.dataHora).toLocaleDateString('pt-BR');
    elements.local.textContent = evento.local;
    elements.organizador.textContent = evento.organizador;
    elements.contato.textContent = evento.contato;
    
    // Mostrar conteúdo e esconder loading
    elements.loading.style.display = 'none';
    elements.content.style.display = 'block';
    
    // Atualizar título da página
    document.title = `${evento.titulo} - EcoEventos Palmas`;
}

// 🎫 Configurar botões de participação (ATUALIZADO)


// ⬆️ Configurar botão voltar ao topo (mantido)
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

// ❌ Mostrar estado de erro (mantido)
function mostrarErro() {
    if (elements.loading) elements.loading.style.display = 'none';
    if (elements.error) elements.error.style.display = 'block';
    if (elements.content) elements.content.style.display = 'none';
}