
// 🌿 Lista de eventos do site
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
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(eventos);
      }, 500);
    });
  }

  // 🔹 Buscar evento por ID
  async getEventoById(id) {
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
    descricao: "Participe do plantio de mudas nativas e ajude a reflorestar áreas degradadas.",
    organizador: "Secretaria do Meio Ambiente",
    contato: "meioambiente@palmas.to.gov.br",
    requisitos: "Trazer luvas e protetor solar."
  },
  {
    id: 2,
    titulo: "Limpeza do Lago de Palmas",
    data: "2025-12-10",
    local: "Orla do Lago",
    categoria: "Limpeza de Rios",
    imagem: "https://i.pinimg.com/1200x/5c/f8/92/5cf8929a03c20807b60a6b0b8cc03357.jpg",
    participantes: 65,
    descricao: "Mutirão de limpeza das margens do Lago de Palmas. Vamos cuidar das nossas águas!",
    organizador: "Projeto Lago Limpo",
    contato: "contato@lagolimpo.org",
    requisitos: "Usar roupas leves e calçado fechado."
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
    requisitos: "Inscrição prévia no site oficial."
  },
  {
    id: 4,
    titulo: "Workshop de Compostagem Doméstica",
    data: "2024-09-15",
    local: "Horto Florestal",
    categoria: "Workshop",
    imagem: "https://i.pinimg.com/736x/f0/7e/a6/f07ea6238bcbffc1e7df0aeb8bf7cdc1.jpg",
    participantes: 35,
    descricao: "Aprenda a fazer compostagem em casa e reduza seu lixo orgânico.",
    organizador: "Instituto EcoVida",
    contato: "contato@ecovida.org",
    requisitos: "Trazer caderno para anotações."
  },
  {
    id: 5,
    titulo: "Mutirão de Coleta de Lixo Eletrônico",
    data: "2024-08-20",
    local: "Praça dos Girassóis",
    categoria: "Coleta Seletiva",
    imagem: "https://i.pinimg.com/1200x/5e/e1/a5/5ee1a531f6dd777b4cf5628bbc51621c.jpg",
    participantes: 120,
    descricao: "Descarte correto de lixo eletrônico com orientação de especialistas.",
    organizador: "Green Eletronic",
    contato: "contato@greeneletronic.org",
    requisitos: "Trazer equipamentos eletrônicos quebrados ou sem uso."
  }

];

// 🎯 Instância do serviço da API
const apiService = new ApiService();

// 🗓️ Função que formata a data
function formatarData(dataString) {
  const data = new Date(dataString);
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return { dia: data.getDate(), mes: meses[data.getMonth()] };
}

function criarCardEventoEstatico(evento, isEventoPassado = false) {
  const { dia, mes } = formatarData(evento.data);
  
  const cardClasses = isEventoPassado ? 'event-card clickable-card' : 'event-card';
  
  return `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card h-100 shadow-sm ${cardClasses}" ${isEventoPassado ? `onclick="redirecionarParaDetalhes(${evento.id})"` : ''}>
        <div class="event-image-container">
          <img src="${evento.imagem}" class="card-img-top event-image" alt="${evento.titulo}">
          <span class="badge ${isEventoPassado ? 'bg-secondary' : 'bg-success'} status-badge">
            ${isEventoPassado ? 'Realizado' : 'Em breve'}
          </span>
        </div>
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="event-date bg-success text-white text-center rounded p-2">
              <div class="event-day fw-bold">${dia}</div>
              <div class="event-month small">${mes}</div>
            </div>
            <span class="badge bg-light text-dark border">${evento.categoria}</span>
          </div>
          <h5 class="card-title">${evento.titulo}</h5>
          <p class="card-text text-muted flex-grow-1">
            <i class="bi bi-geo-alt"></i> ${evento.local}
          </p>
          <div class="mt-auto">
            ${isEventoPassado ? 
              `<button class="btn btn-outline-success w-100 btn-detalhes" data-id="${evento.id}">
                <i class="bi bi-info-circle me-2"></i>Ver Detalhes
              </button>` : 
              `<button class="btn btn-success w-100" disabled>
                <i class="bi bi-clock me-2"></i>Em Breve
              </button>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

// 🎯 Função para renderizar eventos em containers estáticos
async function renderizarEventosEstaticos() {
  // Mostrar loading
  const containerFuturos = document.getElementById('proximos-eventos-container');
  const containerConcluidos = document.getElementById('eventos-concluidos-container');
  
  if (containerFuturos) containerFuturos.innerHTML = criarLoadingCards(4);
  if (containerConcluidos) containerConcluidos.innerHTML = criarLoadingCards(4);

  try {
    const eventos = await apiService.getEventos();
    const hoje = new Date();
    
    // Separar eventos
    const eventosFuturos = eventos.filter(evento => new Date(evento.data) >= hoje);
    const eventosConcluidos = eventos.filter(evento => new Date(evento.data) < hoje);
    
    // Ordenar eventos futuros por data (mais próximos primeiro)
    eventosFuturos.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    // Ordenar eventos concluídos por data (mais recentes primeiro)
    eventosConcluidos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
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
        
        // Adicionar eventos aos botões "Ver Detalhes" dos eventos concluídos
        setTimeout(() => {
          document.querySelectorAll("#eventos-concluidos-container .btn-detalhes").forEach(btn => {
            btn.addEventListener("click", e => {
              e.stopPropagation(); // Prevenir duplo clique
              const id = parseInt(btn.getAttribute("data-id"));
              redirecionarParaDetalhes(id);
            });
          });
        }, 100);
      } else {
        containerConcluidos.innerHTML = criarMensagemVazia('eventos realizados');
      }
    }

  } catch (error) {
    console.error('Erro ao carregar eventos:', error);
    
    if (containerFuturos) containerFuturos.innerHTML = criarMensagemErro();
    if (containerConcluidos) containerConcluidos.innerHTML = criarMensagemErro();
  }
}

//Criar Loadings cards
function criarLoadingCards(quantidade) {
  return Array(quantidade).fill(0).map(() => `
    <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
      <div class="card h-100 shadow-sm">
        <div class="card-skeleton" style="height: 180px;"></div>
        <div class="card-body">
          <div class="card-skeleton" style="height: 20px; width: 80%; margin-bottom: 10px;"></div>
          <div class="card-skeleton" style="height: 15px; width: 60%;"></div>
        </div>
      </div>
    </div>
  `).join('');
}

// 🎯 Função para criar mensagem de lista vazia
function criarMensagemVazia(tipo) {
  return `
    <div class="col-12 text-center py-5">
      <i class="bi bi-calendar-x display-1 text-muted"></i>
      <h4 class="mt-3 text-muted">Nenhum ${tipo}</h4>
      <p class="text-muted">Volte em breve para conferir novas programações.</p>
    </div>
  `;
}

// 🎯 Função para criar mensagem de erro
function criarMensagemErro() {
  return `
    <div class="col-12 text-center py-5">
      <i class="bi bi-exclamation-triangle display-1 text-danger"></i>
      <h3 class="mt-3">Erro ao carregar eventos</h3>
      <p class="text-muted">Tente recarregar a página.</p>
      <button class="btn btn-outline-success" onclick="renderizarEventosEstaticos()">
        <i class="bi bi-arrow-clockwise me-2"></i>Tentar Novamente
      </button>
    </div>
  `;
}

// 🌐 Função para redirecionar para detalhes do evento
function redirecionarParaDetalhes(id) {
  window.location.href = `evento.html?id=${id}`;
}

// 🌿 Botão "Voltar ao topo"
const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });

  backToTop.addEventListener("click", e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// 🚀 Quando o site carrega, mostra os eventos
document.addEventListener("DOMContentLoaded", function() {
  renderizarEventosEstaticos(); // CORRIGIDO: Chamar a função correta
  
  // Adicionar CSS para os cards clicáveis
  if (!document.querySelector('#cardsStyles')) {
    const style = document.createElement('style');
    style.id = 'cardsStyles';
    style.textContent = `
      .clickable-card {
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .clickable-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.15);
      }
      .event-image-container {
        position: relative;
        overflow: hidden;
      }
      .event-image {
        height: 200px;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
      .clickable-card:hover .event-image {
        transform: scale(1.05);
      }
      .status-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 2;
      }
      .card-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 8px;
      }
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .section-title {
        color: #2E8B57;
        margin-bottom: 30px;
        font-weight: 700;
        border-left: 5px solid #2E8B57;
        padding-left: 15px;
      }
    `;
    document.head.appendChild(style);
  }
});