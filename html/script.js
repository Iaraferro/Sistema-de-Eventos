// 📁 script.js (CORRETO E COMPLETO)
// 🌿 Substituir dados mock pela API real

// 🎯 Funções auxiliares para UI
// 🎯 Funções auxiliares para UI
// 🎯 Funções auxiliares para UI
function criarLoadingCards(quantidade) {
    return Array.from({ length: quantidade }, (_, index) => `
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="card event-card h-100">
                <div class="card-skeleton" style="height: 200px; border-radius: 8px 8px 0 0;"></div>
                <div class="card-body">
                    <div class="card-skeleton" style="height: 20px; width: 80%; margin-bottom: 10px;"></div>
                    <div class="card-skeleton" style="height: 16px; width: 60%; margin-bottom: 15px;"></div>
                    <div class="card-skeleton" style="height: 14px; width: 90%; margin-bottom: 8px;"></div>
                    <div class="card-skeleton" style="height: 14px; width: 70%;"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function criarMensagemVazia(tipo) {
    return `
        <div class="col-12 text-center py-5">
            <i class="bi bi-calendar-x display-1 text-muted"></i>
            <h4 class="mt-3 text-muted">Nenhum ${tipo} encontrado</h4>
            <p class="text-muted">Aguardando novos eventos serem cadastrados.</p>
        </div>
    `;
}

function criarMensagemErro() {
    return `
        <div class="col-12 text-center py-5">
            <i class="bi bi-exclamation-triangle display-1 text-danger"></i>
            <h4 class="mt-3 text-danger">Erro ao carregar eventos</h4>
            <p class="text-muted">Não foi possível carregar os eventos. Tente novamente mais tarde.</p>
            <button class="btn btn-success mt-3" onclick="renderizarEventosEstaticos()">
                <i class="bi bi-arrow-repeat me-2"></i>Tentar Novamente
            </button>
        </div>
    `;
}


function criarCardEventoEstatico(evento, isConcluido) {
    // 🆕 CORREÇÃO IDÊNTICA AO evento.js
    let imagemUrl = evento.imagem || evento.imagemPrincipal;
    
    // Converter nome do arquivo para URL completa (igual ao evento.js)
    if (imagemUrl && !imagemUrl.startsWith('http')) {
        imagemUrl = `http://localhost:8080/arquivos/${imagemUrl}`;
    }
    
    // Se ainda não tem imagem, usar primeiro arquivo
    if ((!imagemUrl || imagemUrl === 'undefined') && 
        evento.arquivos && evento.arquivos.length > 0) {
        let primeiroArquivo = evento.arquivos[0];
        // Converter também o primeiro arquivo para URL completa
        if (primeiroArquivo && !primeiroArquivo.startsWith('http')) {
            primeiroArquivo = `http://localhost:8080/arquivos/${primeiroArquivo}`;
        }
        imagemUrl = primeiroArquivo;
    }
    
    // Fallback final
    if (!imagemUrl || imagemUrl === 'undefined' || imagemUrl === 'null') {
        imagemUrl = 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80';
    }

    console.log('🎯 URL da imagem no card:', imagemUrl);
    
    const dataEvento = new Date(evento.dataHora);
    const hoje = new Date();
    
    const isFuturo = dataEvento > hoje;
    const status = isConcluido ? 'Realizado' : (isFuturo ? 'Em Breve' : 'Hoje');
    const statusClass = isConcluido ? 'bg-secondary' : (isFuturo ? 'bg-warning' : 'bg-success');
    
    return `
        <div class="col-md-6 col-lg-3 mb-4">
            <div class="card event-card h-100 clickable-card" onclick="redirecionarParaDetalhes(${evento.id})">
                <div class="event-image-container">
                    <img src="${imagemUrl}" class="card-img-top event-image" alt="${evento.nome || evento.titulo}">
                    <span class="badge status-badge ${statusClass}">
                        ${status}
                    </span>
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex align-items-start mb-3">
                        <div class="event-date me-3">
                            <div class="event-day">${dataEvento.getDate()}</div>
                            <div class="event-month">${dataEvento.toLocaleDateString('pt-BR', { month: 'short' })}</div>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="card-title mb-1">${evento.nome || evento.titulo}</h6>
                            <small class="text-muted">${evento.categoria}</small>
                        </div>
                    </div>
                    
                    <p class="card-text small text-muted flex-grow-1">
                        ${evento.descricao?.substring(0, 100)}${evento.descricao?.length > 100 ? '...' : ''}
                    </p>
                    
                    <div class="event-info mt-auto">
                        <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
                            <span><i class="bi bi-geo-alt me-1"></i>${evento.local}</span>
                            <span><i class="bi bi-people me-1"></i>${evento.participantes || 0}</span>
                        </div>
                        
                        <div class="text-center">
                            <small class="text-muted">Clique para ver detalhes</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


// 🌐 Função para redirecionar para detalhes do evento
function redirecionarParaDetalhes(id) {
    window.location.href = `evento.html?id=${id}`;
}

// 🎯 Função principal para renderizar eventos da API REAL
// 🎯 Função principal para renderizar eventos (CORRIGIDA)
async function renderizarEventosEstaticos() {
    const containerFuturos = document.getElementById('proximos-eventos-container');
    const containerConcluidos = document.getElementById('eventos-concluidos-container');
    
    if (containerFuturos) containerFuturos.innerHTML = criarLoadingCards(4);
    if (containerConcluidos) containerConcluidos.innerHTML = criarLoadingCards(4);

    try {
        console.log('📡 Buscando eventos da API...');
        let eventos = await eventoService.listarEventos();
        
        // 🆕 SE API ESTIVER VAZIA, BUSCAR EVENTOS SINCRONIZADOS
        if (!eventos || eventos.length === 0) {
            console.log('🔄 API vazia, buscando eventos sincronizados...');
            eventos = JSON.parse(localStorage.getItem('eventosUsuario') || '[]');
            
            // Se ainda estiver vazio, buscar do admin como último recurso
            if (eventos.length === 0) {
                console.log('🔄 Buscando eventos do admin...');
                const eventosAdmin = JSON.parse(localStorage.getItem('eventosAdmin') || '[]');
                
                // Converter formato do admin para formato do usuário
                eventos = eventosAdmin.map(evento => ({
                    id: evento.id,
                    titulo: evento.titulo,
                    descricao: evento.descricao,
                    dataHora: evento.data,
                    local: evento.local,
                    categoria: evento.categoria,
                    organizador: evento.organizador,
                    contato: evento.contato,
                    requisitos: evento.requisitos,
                    participantes: evento.participantes,
                    imagem: evento.imagem
                }));
            }
        }
        
        console.log('✅ Eventos carregados:', eventos);
        
        const hoje = new Date();
        
        // Separar eventos
        const eventosFuturos = eventos.filter(evento => {
            try {
                return new Date(evento.dataHora) >= hoje;
            } catch (error) {
                console.warn('⚠️ Data inválida:', evento.dataHora);
                return false;
            }
        });
        
        const eventosConcluidos = eventos.filter(evento => {
            try {
                return new Date(evento.dataHora) < hoje;
            } catch (error) {
                console.warn('⚠️ Data inválida:', evento.dataHora);
                return false;
            }
        });
        
        // Ordenar
        eventosFuturos.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
        eventosConcluidos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
        
        // Renderizar eventos futuros
        if (containerFuturos) {
            if (eventosFuturos.length > 0) {
                containerFuturos.innerHTML = eventosFuturos.map(evento => 
                    criarCardEventoEstatico(evento, false)
                ).join('');
            } else {
                containerFuturos.innerHTML = criarMensagemVazia('próximos eventos');
            }
        }
        
        // Renderizar eventos concluídos
        if (containerConcluidos) {
            if (eventosConcluidos.length > 0) {
                containerConcluidos.innerHTML = eventosConcluidos.map(evento => 
                    criarCardEventoEstatico(evento, true)
                ).join('');
            } else {
                containerConcluidos.innerHTML = criarMensagemVazia('eventos realizados');
            }
        }

    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
        
        if (containerFuturos) containerFuturos.innerHTML = criarMensagemErro();
        if (containerConcluidos) containerConcluidos.innerHTML = criarMensagemErro();
    }
}

// 🔧 Função para adicionar link do painel admin se usuário estiver logado
function adicionarLinkPainelAdmin() {
    const navbar = document.querySelector('.navbar-nav');
    if (navbar) {
        const linkAdmin = document.createElement('li');
        linkAdmin.className = 'nav-item';
        linkAdmin.innerHTML = `
            <a class="nav-link" href="painel-admin.html">
                <i class="bi bi-speedometer2 me-1"></i>Painel Admin
            </a>
        `;
        navbar.appendChild(linkAdmin);
    }
}

// 🚀 Quando o site carrega, mostra os eventos DA API REAL
document.addEventListener("DOMContentLoaded", function() {
    console.log('🚀 Inicializando página principal...');
    renderizarEventosEstaticos(); // AGORA USA API REAL!
    
    // Verificar se usuário está logado para mostrar opções admin
    if (authService && authService.isAuthenticated()) {
        console.log('👤 Usuário logado - adicionando link admin');
        adicionarLinkPainelAdmin();
    } else {
        console.log('👤 Usuário não logado');
    }
});