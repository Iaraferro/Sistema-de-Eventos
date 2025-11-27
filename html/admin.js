// 🌿 Serviço para gestão administrativa - VERSÃO REFATORADA
// 🌿 Configuração da API
// 🌿 Serviço para gestão administrativa - VERSÃO REFATORADA
// 🌿 Configuração da API
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
        EVENTOS: '/eventos',
        ADMIN: '/admin'
    }
};

// 🗂️ Serviço para comunicação com a API
class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        console.log('🔧 ApiService configurado com baseUrl:', this.baseUrl);

        if (!this.baseUrl || this.baseUrl.includes('undefined')) {
            console.error('❌ URL da API está indefinida!');
            this.baseUrl = 'http://localhost:8080'; // Forçar valor correto
        }
    }

    // Método genérico para fazer requisições
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            console.log('🌐 Fazendo requisição para:', url);

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
        console.log('🌐 Buscando eventos da API REAL...');
        try {
            const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.EVENTOS}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const eventos = await response.json();
            console.log('✅ Eventos da API:', eventos);
            return this.validateEventData(eventos);
            
        } catch (error) {
            console.error('❌ Erro ao buscar eventos da API:', error);
            console.log('🔄 Usando dados mock como fallback...');
            return this.getEventosMock();
        }
    }

    // ✅ VALIDAR ESTRUTURA DOS DADOS
   validateEventData(eventos) {
    console.log('🔍 Validando dados dos eventos:', eventos);
    
    if (!eventos) {
        console.warn('⚠️ Eventos é null ou undefined');
        return [];
    }
    
    if (!Array.isArray(eventos)) {
        console.warn('⚠️ Dados não são array, tentando converter:', typeof eventos);
        // Tentar converter para array
        if (typeof eventos === 'object' && eventos !== null) {
            eventos = [eventos];
        } else {
            return [];
        }
    }
    
    return eventos.map(evento => {
        // 🎯 ACEITAR TANTO 'nome' QUANTO 'titulo'
        const titulo = evento.nome || evento.titulo || 'Sem título';
        const dataHora = evento.dataHora || evento.data || new Date().toISOString();
        
        return {
            id: evento.id || Date.now() + Math.random(),
            titulo: titulo,
            nome: titulo, // ← MANTER COMPATIBILIDADE
            descricao: evento.descricao || '',
            dataHora: dataHora,
            data: dataHora.split('T')[0], // ← PARA COMPATIBILIDADE
            local: evento.local || 'Local não definido',
            categoria: evento.categoria || 'Geral',
            organizador: evento.organizador || 'Organizador não definido',
            contato: evento.contato || '',
            requisitos: evento.requisitos || '',
            participantes: parseInt(evento.participantes) || 0,
            imagem: evento.imagem || this._construirUrlImagem(evento.arquivos),
            status: evento.status || 'ativo',
            dataCriacao: evento.dataCriacao || new Date().toISOString(),
            arquivos: evento.arquivos || []
        };
    });
}

// 🆕 ADICIONAR MÉTODO PARA CONSTRUIR URL DA IMAGEM NO ADMIN TAMBÉM
_construirUrlImagem(arquivos) {
    const fallbackImage = 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80';
    
    try {
        if (!arquivos || !Array.isArray(arquivos) || arquivos.length === 0) {
            return fallbackImage;
        }
        
        const primeiroArquivo = arquivos[0];
        let nomeArquivo = primeiroArquivo;
        
        if (typeof primeiroArquivo === 'object' && primeiroArquivo.nomeArquivo) {
            nomeArquivo = primeiroArquivo.nomeArquivo;
        }
        
        if (!nomeArquivo || typeof nomeArquivo !== 'string' || nomeArquivo.trim() === '') {
            return fallbackImage;
        }
        
        const nomeArquivoLimpo = nomeArquivo.trim();
        
        if (nomeArquivoLimpo.startsWith('http')) {
            return nomeArquivoLimpo;
        }
        
        return `http://localhost:8080/arquivos/${encodeURIComponent(nomeArquivoLimpo)}`;
        
    } catch (error) {
        console.error('❌ Erro ao construir URL da imagem:', error);
        return fallbackImage;
    }
}

    // 🔹 Dados mock para fallback
    getEventosMock() {
        return [
            {
                id: 1,
                titulo: 'Plantio de Árvores Nativas',
                descricao: 'Evento comunitário para plantio de mudas nativas',
                data: new Date(Date.now() + 86400000).toISOString(),
                local: 'Parque do Povo',
                categoria: 'Reflorestamento',
                organizador: 'Prefeitura de Palmas',
                participantes: 45,
                imagem: 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80',
                status: 'ativo'
            },
            {
                id: 2,
                titulo: 'Limpeza do Lago',
                descricao: 'Mutirão de limpeza das margens do lago',
                data: new Date(Date.now() + 172800000).toISOString(),
                local: 'Lago de Palmas',
                categoria: 'Limpeza',
                organizador: 'Comunidade Local',
                participantes: 32,
                imagem: 'https://images.unsplash.com/photo-1570804433301-a1853a99a9dc?auto=format&fit=crop&w=1350&q=80',
                status: 'ativo'
            }
        ];
    }
}

// 🌿 Serviço para gestão administrativa
class AdminService {
    constructor() {
        this.apiService = new ApiService();
        this.eventosKey = 'eventosAdmin';
    }

    async uploadImagemParaEvento(idEvento, arquivoImagem) {
    try {
        console.log(`🖼️ Fazendo upload de imagem para evento ${idEvento}`);
        
        const formData = new FormData();
        formData.append('arquivo', arquivoImagem);
        formData.append('nomeArquivo', arquivoImagem.name);

        const response = await fetch(`http://localhost:8080/eventos/${idEvento}/arquivos`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro no upload: ${response.status}`);
        }

        const resultado = await response.json();
        console.log('✅ Upload realizado:', resultado);
        
        return {
            success: true,
            nomeArquivo: resultado.nomeSalvo,
            arquivo: resultado
        };
        
    } catch (error) {
        console.error('❌ Erro no upload da imagem:', error);
        return {
            success: false,
            message: error.message
        };
    }
}
     async cadastrarUsuarioAPI(dadosUsuario) {
        try {
            const usuarioDTO = {
                nome: dadosUsuario.nome,
                email: dadosUsuario.email,
                username: dadosUsuario.email, // usando email como username
                senha: dadosUsuario.senha,
                id_perfil: 1 // Admin - verifique se é 1 ou 2 no seu sistema
            };

            console.log('📝 Cadastrando usuário na API:', usuarioDTO);

            const response = await fetch('http://localhost:8080/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuarioDTO)
            });

            console.log('📡 Status do cadastro:', response.status);

            if (response.ok) {
                const usuarioCriado = await response.json();
                console.log('✅ Usuário cadastrado na API:', usuarioCriado);
                return { success: true, message: 'Usuário cadastrado na API', usuario: usuarioCriado };
            } else {
                const errorText = await response.text();
                console.error('❌ Erro no cadastro API:', errorText);
                return { success: false, message: errorText };
            }
        } catch (error) {
            console.error('❌ Erro ao cadastrar usuário na API:', error);
            return { success: false, message: error.message };
        }

        
    }

   

   async carregarEventos() {
    try {
        // Primeiro tenta carregar da API
        console.log('🌐 Buscando eventos da API...');
        const eventosAPI = await this.apiService.getEventos();
        
        const eventosLocais = this.getEventosLocais();
        const todosEventos = this.mergeEventos(eventosAPI, eventosLocais);
        
        console.log(`✅ Eventos carregados: ${todosEventos.length} (API: ${eventosAPI.length}, Locais: ${eventosLocais.length})`);
        return todosEventos;
        
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
        // Fallback para dados locais
        const eventosLocais = this.getEventosLocais();
        console.log(`🔄 Usando ${eventosLocais.length} eventos locais`);
        return this.getEventosLocais();
    }
}
    getEventosLocais() {
        return JSON.parse(localStorage.getItem(this.eventosKey) || '[]');
    }

    mergeEventos(apiEventos, localEventos) {
        const merged = [...apiEventos];
        localEventos.forEach(localEvento => {
            if (!merged.find(e => e.id === localEvento.id)) {
                merged.push(localEvento);
            }
        });
        return merged;
    }

    // No arquivo admin.js, substitua o método criarEvento:

async criarEvento(dadosEvento) {
    try {
        console.log('📝 Iniciando criação de evento:', dadosEvento);
        
        // 🆕 PRIMEIRO FAZER UPLOAD DA IMAGEM SE EXISTIR
        let imagemUrl = null;
        const inputImagem = document.getElementById('imagem');
        if (inputImagem && inputImagem.files[0]) {
            console.log('🖼️ Fazendo upload da imagem primeiro...');
            // Fazer upload para /arquivos/upload
            const formData = new FormData();
            formData.append('arquivo', inputImagem.files[0]);
            formData.append('nomeArquivo', inputImagem.files[0].name);
            
            const uploadResponse = await fetch('http://localhost:8080/arquivos/upload', {
                method: 'POST',
                body: formData
            });
            
            if (uploadResponse.ok) {
                imagemUrl = await uploadResponse.text();
                console.log('✅ Imagem uploadada:', imagemUrl);
            }
        }

        // 1. Criar o evento na API COM A IMAGEM
        const eventoDTO = {
            nome: dadosEvento.titulo,
            descricao: dadosEvento.descricao,
            dataHora: dadosEvento.data + 'T10:00:00',
            local: dadosEvento.local,
            categoria: dadosEvento.categoria,
            contato: dadosEvento.contato,
            requisitos: dadosEvento.requisitos,
            participantes: dadosEvento.participantes || 0,
            arquivos: imagemUrl ? [imagemUrl] : [], // 🆕 INCLUIR IMAGEM NOS ARQUIVOS
            imagem: imagemUrl // 🆕 INCLUIR NO CAMPO IMAGEM
        };

        console.log('🌐 Criando evento na API com imagem...', eventoDTO);
        
        const response = await fetch('http://localhost:8080/eventos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventoDTO)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }

        const eventoCriado = await response.json();
        console.log('✅ Evento criado na API:', eventoCriado);
        
        
        
        return {
            success: true,
            evento: eventoCriado,
            message: 'Evento criado com sucesso!'
        };

    } catch (error) {
        console.error('❌ Erro ao criar evento:', error);
        return {
            success: false,
            message: 'Erro ao criar evento: ' + error.message
        };
    }
}

// Método para vincular imagem ao evento
async vincularImagemAoEvento(idEvento, arquivoImagem) {
    try {
        console.log(`🖼️ Vinculando imagem ao evento ${idEvento} (SEM AUTENTICAÇÃO)`, arquivoImagem);
        
        const formData = new FormData();
        formData.append('arquivo', arquivoImagem);
        formData.append('nomeArquivo', arquivoImagem.name);
        
        const response = await fetch(`http://localhost:8080/eventos/${idEvento}/arquivos`, {
            method: 'POST',
            // REMOVER Authorization header temporariamente
            body: formData
        });

        if (!response.ok) {
            // Se der erro 401, apenas logue e continue sem a imagem
            if (response.status === 401) {
                console.warn('⚠️ Upload de imagem falhou (sem autenticação), continuando sem imagem...');
                return null;
            }
            throw new Error(`Erro no upload: ${response.status}`);
        }

        const resultado = await response.json();
        console.log('✅ Imagem vinculada com sucesso:', resultado);
        return resultado;
        
    } catch (error) {
        console.error('❌ Erro ao vincular imagem:', error);
        // Não lance o erro, apenas retorne null para continuar
        return null;
    }
}
// 🆕 MÉTODO PARA SINCRONIZAR COM USUÁRIO
sincronizarComUsuario(eventoAPI) {
    try {
        // Converter formato da API para formato do frontend
        const eventoUsuario = {
            id: eventoAPI.id,
            titulo: eventoAPI.nome, // API usa 'nome', front usa 'titulo'
            descricao: eventoAPI.descricao,
            dataHora: eventoAPI.dataHora,
            local: eventoAPI.local,
            categoria: eventoAPI.categoria,
            organizador: eventoAPI.organizador,
            contato: eventoAPI.contato,
            requisitos: eventoAPI.requisitos,
            participantes: eventoAPI.participantes,
            imagem: this._construirUrlImagem(eventoAPI.arquivos),
            arquivos: eventoAPI.arquivos || []
        };

        console.log('🔄 Sincronizando evento com usuário:', eventoUsuario);

        // Salvar em localStorage que o usuário usa
        const eventosUsuario = JSON.parse(localStorage.getItem('eventosUsuario') || '[]');
        
        // Remover evento existente se houver
        const eventosAtualizados = eventosUsuario.filter(e => e.id !== eventoUsuario.id);
        eventosAtualizados.push(eventoUsuario);
        
        localStorage.setItem('eventosUsuario', JSON.stringify(eventosAtualizados));
        console.log('✅ Evento sincronizado com área do usuário');
        
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
    }
}

// 🆕 MÉTODO AUXILIAR PARA CONSTRUIR URL DA IMAGEM COM SEGURANÇA
_construirUrlImagem(arquivos) {
    // Fallback seguro
    const fallbackImage = 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80';
    
    try {
        if (!arquivos || !Array.isArray(arquivos) || arquivos.length === 0) {
            return fallbackImage;
        }
        
        const primeiroArquivo = arquivos[0];
        
        // Validar se o arquivo é uma string não vazia
        if (!primeiroArquivo || typeof primeiroArquivo !== 'string' || primeiroArquivo.trim() === '') {
            return fallbackImage;
        }
        
        const nomeArquivo = primeiroArquivo.trim();
        
        if (nomeArquivo.startsWith('http')) {
            return nomeArquivo;
        }
        
        // Construir URL segura
        return `http://localhost:8080/arquivos/${encodeURIComponent(nomeArquivo)}`;
        
    } catch (error) {
        console.error('❌ Erro ao construir URL da imagem:', error);
        return fallbackImage;
    }
}


getToken() {
    // Verificar em todas as possíveis localizações do token
    let token = localStorage.getItem('jwtToken');
    
    console.log('🔐 DEBUG - Buscando token...');
    console.log('📍 localStorage jwtToken:', token);
    console.log('📍 Todas as chaves:', Object.keys(localStorage));
    
    // Se não encontrou, tentar outras chaves possíveis
    if (!token) {
        token = localStorage.getItem('authToken') || 
                sessionStorage.getItem('jwtToken') ||
                sessionStorage.getItem('authToken');
    }
    
    // DEBUG: Mostrar todos os valores do localStorage
    Object.keys(localStorage).forEach(key => {
        console.log(`📦 ${key}:`, localStorage.getItem(key));
    });
    
    if (!token) {
        console.warn('❌ NENHUM token JWT encontrado!');
        return null;
    }
    
    console.log('✅ Token encontrado:', token.substring(0, 30) + '...');
    return token;
}



// Fallback local (mantido para compatibilidade)
criarEventoLocal(dadosEvento) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const novoEvento = {
                id: Date.now() + Math.random(),
                ...dadosEvento,
                participantes: dadosEvento.participantes || 0,
                dataCriacao: new Date().toISOString(),
                status: 'ativo'
            };
            
            const eventosExistentes = this.getEventosLocais();
            eventosExistentes.push(novoEvento);
            localStorage.setItem(this.eventosKey, JSON.stringify(eventosExistentes));
            
            resolve({
                success: true,
                evento: novoEvento,
                message: 'Evento criado localmente (fallback)!'
            });
        }, 1000);
    });
}

    async atualizarEvento(id, dadosEvento) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const eventos = this.getEventosLocais();
                const index = eventos.findIndex(e => e.id === id);
                
                if (index !== -1) {
                    eventos[index] = { ...eventos[index], ...dadosEvento };
                    localStorage.setItem(this.eventosKey, JSON.stringify(eventos));
                    resolve({ success: true, message: 'Evento atualizado com sucesso!' });
                } else {
                    resolve({ success: false, message: 'Evento não encontrado' });
                }
            }, 800);
        });
    }

   async excluirEvento(id) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) {
        return{ success: false, message: 'Exclusão cancelada' };
    }

    try {
        console.log('🗑️ Tentando excluir evento ID:', id);
        
        // 🆕 TENTAR EXCLUIR DA API PRIMEIRO
        const response = await fetch(`http://localhost:8080/eventos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log('✅ Evento excluído da API');
        } else {
            console.warn('⚠️ Não foi possível excluir da API, continuando...');
        }
       

        // 🆕 EXCLUIR LOCALMENTE TAMBÉM (PARA GARANTIR)
        const eventosLocais = this.getEventosLocais();
        const eventosAtualizados = eventosLocais.filter(e => e.id != id);
        localStorage.setItem(this.eventosKey, JSON.stringify(eventosAtualizados));
        console.log(`✅ Evento ${id} excluído localmente. Restantes: ${eventosAtualizados.length}`);
        
        // 🆕 ATUALIZAR A TABELA
        if (window.app && window.app.loadInitialData) {
            await window.app.loadInitialData();
            console.log('✅ Interface atualizada');
        } else {
            console.log('🔄 Recarregando página...');
            setTimeout(() => location.reload(), 500);
        }
        
        return { success: true, message: 'Evento excluído com sucesso!' };
        
    } catch (error) {
        console.error('❌ Erro ao excluir evento:', error);
        return { success: false, message: 'Erro ao excluir evento: ' + error.message };
    }
}

    // No admin.js - Adicionar esta função
async fazerLoginAdmin(username, senha) {
    try {
        const authData = {
            username: username,
            senha: senha
        };

        const response = await fetch('http://localhost:8080/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(authData)
        });

        if (response.ok) {
            const token = await response.text();
            localStorage.setItem('jwtToken', token);
            return { success: true, token };
        } else {
            return { success: false, message: 'Credenciais inválidas' };
        }
    } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, message: error.message };
    }
}
}


// 🎯 Gerenciador de Interface
class UIManager {
    constructor(adminService) {
        this.adminService = adminService;
        this.elements = this.initializeElements();
    }

    initializeElements() {
        return {
            totalEventos: document.getElementById('totalEventos'),
            totalParticipantes: document.getElementById('totalParticipantes'),
            eventosAtivos: document.getElementById('eventosAtivos'),
            eventosFuturos: document.getElementById('eventosFuturos'),
            proximosEventos: document.getElementById('proximosEventos'),
            tabelaEventos: document.getElementById('tabelaEventos'),
            formNovoEvento: document.getElementById('formNovoEvento'),
            imagePreview: document.getElementById('imagePreview')
        };
    }

    // 📊 Atualizar estatísticas do dashboard
    atualizarEstatisticas(eventos) {
        if (!eventos || !Array.isArray(eventos)) {
            console.warn('⚠️ Eventos não é um array válido:', eventos);
            eventos = [];
        }
        
        const totalEventos = eventos.length;
        const totalParticipantes = eventos.reduce((sum, evento) => {
            const participantes = evento.participantes || 0;
            return sum + (typeof participantes === 'number' ? participantes : 0);
        }, 0);
        
        const eventosAtivos = eventos.filter(e => e.status === 'ativo').length;
        const eventosFuturos = eventos.filter(e => {
            try {
                return new Date(e.data) > new Date();
            } catch (error) {
                console.warn('⚠️ Data inválida:', e.data);
                return false;
            }
        }).length;

        this.updateElementText(this.elements.totalEventos, totalEventos);
        this.updateElementText(this.elements.totalParticipantes, totalParticipantes);
        this.updateElementText(this.elements.eventosAtivos, eventosAtivos);
        this.updateElementText(this.elements.eventosFuturos, eventosFuturos);
    }

    updateElementText(element, value) {
        if (element) element.textContent = value;
    }

    // 📅 Carregar próximos eventos no dashboard
    carregarProximosEventos(eventos) {
        if (!this.elements.proximosEventos) return;
        
        const eventosFuturos = eventos
            .filter(e => new Date(e.data) > new Date())
            .slice(0, 3);

        this.elements.proximosEventos.innerHTML = eventosFuturos.map(evento => `
            <div class="col-md-4 mb-3">
                <div class="card evento-card">
                    <img src="${evento.imagem}" class="card-img-top evento-image" alt="${evento.titulo}">
                    <div class="card-body">
                        <h6 class="card-title">${evento.titulo}</h6>
                        <p class="card-text small text-muted">
                            <i class="bi bi-calendar me-1"></i>${new Date(evento.data).toLocaleDateString('pt-BR')}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge ${this.getStatusBadgeClass(evento.status)}">${evento.status}</span>
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
    carregarTabelaEventos(eventos) {
        if (!this.elements.tabelaEventos) return;
        
        this.elements.tabelaEventos.innerHTML = eventos.map(evento => `
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
                    <span class="status-badge ${this.getStatusBadgeClass(evento.status)}">
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

    getStatusBadgeClass(status) {
        const classes = {
            'ativo': 'bg-success',
            'inativo': 'bg-secondary',
            'pendente': 'bg-warning'
        };
        return classes[status] || 'bg-warning';
    }
}

// 🎯 Gerenciador de Formulários
class FormManager {
    constructor(adminService, uiManager) {
        this.adminService = adminService;
        this.uiManager = uiManager;
    }

    configurarFormularioEvento() {
        const form = document.getElementById('formNovoEvento');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit(form);
        });
    }

    async handleFormSubmit(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        this.showLoading(submitBtn, 'Criando...');

        try {
            const dadosEvento = this.collectFormData();
            const resultado = await this.adminService.criarEvento(dadosEvento);
            
            if (resultado.success) {
                this.showSuccess(resultado.message);
                form.reset();
                this.clearImagePreview();
                mostrarSecao('eventos');
                await this.reloadData();
            } else {
                throw new Error(resultado.message);
            }
            
        } catch (error) {
            this.showError('Erro ao criar evento: ' + error.message);
        } finally {
            this.restoreButton(submitBtn, originalText);
        }
    }

    collectFormData() {
        return {
            titulo: document.getElementById('titulo').value,
            descricao: document.getElementById('descricao').value,
            data: document.getElementById('data').value,
            local: document.getElementById('local').value,
            categoria: document.getElementById('categoria').value,
            organizador: document.getElementById('organizador').value,
            contato: document.getElementById('contato').value,
            requisitos: document.getElementById('requisitos').value,
            participantes: parseInt(document.getElementById('participantes').value) || 0,
            imagem: 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80'
        };
    }

    showLoading(button, text) {
        button.innerHTML = `<i class="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>${text}`;
        button.disabled = true;
    }

    restoreButton(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }

    showSuccess(message) {
        alert('✅ ' + message);
    }

    showError(message) {
        alert('❌ ' + message);
    }

    clearImagePreview() {
        const preview = document.getElementById('imagePreview');
        if (preview) preview.innerHTML = '';
    }

    async reloadData() {
        const eventos = await this.adminService.carregarEventos();
        this.uiManager.atualizarEstatisticas(eventos);
        this.uiManager.carregarProximosEventos(eventos);
        this.uiManager.carregarTabelaEventos(eventos);
    }

    configurarPreviewImagem() {
        const inputImagem = document.getElementById('imagem');
        const imagePreview = document.getElementById('imagePreview');
        
        if (inputImagem && imagePreview) {
            inputImagem.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imagePreview.innerHTML = `
                            <img src="${e.target.result}" class="img-fluid rounded" style="max-height: 200px;">
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
}

// 🧭 Gerenciador de Navegação
class NavigationManager {
    constructor() {
        this.currentSection = 'dashboard';
    }

    configurarNavegacao() {
        // Ativar links da sidebar
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = this.getTargetSection(e.target);
                this.mostrarSecao(target);
                this.activateLink(e.target);
            });
        });
        
        // Mostrar dashboard por padrão
        this.mostrarSecao('dashboard');
    }

    getTargetSection(element) {
        return element.getAttribute('href').substring(1);
    }

    mostrarSecao(secaoId) {
        // Esconder todas as seções
        document.querySelectorAll('.main-content > section').forEach(sec => {
            sec.style.display = 'none';
        });
        
        // Mostrar seção desejada
        const secao = document.getElementById(secaoId);
        if (secao) {
            secao.style.display = 'block';
            this.currentSection = secaoId;
        }
    }

    activateLink(clickedLink) {
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        clickedLink.classList.add('active');
    }
}

// 🚀 INICIALIZAÇÃO PRINCIPAL
class App {
    constructor() {
        this.adminService = new AdminService();
        this.uiManager = new UIManager(this.adminService);
        this.formManager = new FormManager(this.adminService, this.uiManager);
        this.navigationManager = new NavigationManager();
    }

    async initialize() {
        console.log('🚀 Inicializando aplicação...');
        
        try {
            await this.loadInitialData();
            this.setupEventListeners();
            this.navigationManager.configurarNavegacao();
            
            console.log('✅ Aplicação inicializada com sucesso!');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    }

    async loadInitialData() {
        console.log('📦 Carregando dados iniciais...');
        const eventos = await this.adminService.carregarEventos();
        
        console.log('📊 Dados carregados:', eventos);
        console.log('🔢 Total de eventos:', eventos.length);
        
        this.uiManager.atualizarEstatisticas(eventos);
        this.uiManager.carregarProximosEventos(eventos);
        this.uiManager.carregarTabelaEventos(eventos);
        
        // Inicializar outras seções
        this.carregarConfiguracoes();
        this.carregarParticipantes();
    }

    setupEventListeners() {
        this.formManager.configurarFormularioEvento();
        this.formManager.configurarPreviewImagem();
        
        // Configurar eventos de relatórios
        this.setupReportEvents();
    }

    setupReportEvents() {
        // Configurar data atual como padrão
        const dataRelatorio = document.getElementById('dataRelatorio');
        if (dataRelatorio) {
            dataRelatorio.value = new Date().toISOString().split('T')[0];
        }
        
        // Atualizar preview quando os campos mudarem
        const camposRelatorio = [
            'tituloRelatorio', 'dataRelatorio', 'periodoRelatorio', 'objetivoRelatorio',
            'atividadesRealizadas', 'resultadosAlcancados', 'dificuldadesEncontradas',
            'proximasAcoes', 'observacoes'
        ];
        
        camposRelatorio.forEach(campo => {
            const element = document.getElementById(campo);
            if (element) {
                element.addEventListener('input', atualizarPreviewRelatorio);
            }
        });
    }

    carregarConfiguracoes() {
        const configuracoes = JSON.parse(localStorage.getItem('configuracoesAdmin') || '{}');
        
        // Aplicar configurações salvas
        if (configuracoes.notificacoesEmail !== undefined) {
            const element = document.getElementById('notificacoesEmail');
            if (element) element.checked = configuracoes.notificacoesEmail;
        }
        // ... carregar outras configurações
    }

    carregarParticipantes() {
        // Em produção, carregaria dados da API
        const participantes = JSON.parse(localStorage.getItem('participacoesEventos') || '[]');
        
        if (participantes.length > 0) {
            console.log('Participantes carregados:', participantes);
        }
    }
}

// 🎯 FUNÇÕES GLOBAIS (mantidas para compatibilidade)
function mostrarSecao(secaoId) {
    // Delegar para o navigation manager se disponível
    if (window.app && window.app.navigationManager) {
        window.app.navigationManager.mostrarSecao(secaoId);
    } else {
        // Fallback
        document.querySelectorAll('.main-content > section').forEach(sec => {
            sec.style.display = 'none';
        });
        const secao = document.getElementById(secaoId);
        if (secao) secao.style.display = 'block';
    }
}

async function editarEvento(id) {
     abrirModalRelatorio(id);
    // Em produção, abriria um formulário de edição
}

async function excluirEvento(id) {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
        const adminService = new AdminService();
        
        try {
            const resultado = await adminService.excluirEvento(id);
            if (resultado.success) {
                alert('✅ ' + resultado.message);
                // Recarregar dados
                if (window.app) {
                    await window.app.loadInitialData();
                }
            }
        } catch (error) {
            alert('❌ Erro ao excluir evento: ' + error.message);
        }
    }
}

// 📊 FUNÇÕES DE RELATÓRIOS (mantidas da versão original)
function carregarModeloRelatorio() {
    const hoje = new Date();
    const mesAno = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    document.getElementById('tituloRelatorio').value = `Relatório de Atividades - ${mesAno}`;
    document.getElementById('dataRelatorio').value = hoje.toISOString().split('T')[0];
    document.getElementById('periodoRelatorio').value = mesAno;
    document.getElementById('objetivoRelatorio').value = 'Relatório mensal das atividades ambientais realizadas, com análise dos resultados e planejamento das próximas ações.';
    document.getElementById('atividadesRealizadas').value = '• Plantio de mudas nativas\n• Limpeza de áreas verdes\n• Palestras de conscientização\n• Workshops educativos';
    document.getElementById('resultadosAlcancados').value = '• Aumento na participação da comunidade\n• Melhoria na preservação das áreas verdes\n• Fortalecimento das parcerias locais';
    document.getElementById('proximasAcoes').value = '• Expandir para novas áreas da cidade\n• Aumentar a frequência dos eventos\n• Buscar novas parcerias';
    
    atualizarPreviewRelatorio();
    alert('✅ Modelo carregado! Agora personalize as informações.');
}

function atualizarPreviewRelatorio() {
    const preview = document.getElementById('previewRelatorio');
    if (!preview) return;

    const titulo = document.getElementById('tituloRelatorio').value || 'Sem título';
    const data = document.getElementById('dataRelatorio').value ? 
        new Date(document.getElementById('dataRelatorio').value).toLocaleDateString('pt-BR') : 'Data não informada';
    const periodo = document.getElementById('periodoRelatorio').value || 'Período não definido';
    const objetivo = document.getElementById('objetivoRelatorio').value || 'Não informado';
    const atividades = document.getElementById('atividadesRealizadas').value || 'Não informado';
    const resultados = document.getElementById('resultadosAlcancados').value || 'Não informado';
    
    preview.innerHTML = `
        <div class="border-bottom pb-2 mb-2">
            <h6 class="text-success">${titulo}</h6>
            <small class="text-muted">Data: ${data} | Período: ${periodo}</small>
        </div>
        
        <div class="mb-3">
            <strong>Objetivo:</strong>
            <p class="mb-1 small">${objetivo.substring(0, 100)}${objetivo.length > 100 ? '...' : ''}</p>
        </div>
        
        <div class="mb-3">
            <strong>Atividades:</strong>
            <p class="mb-1 small">${atividades.substring(0, 100)}${atividades.length > 100 ? '...' : ''}</p>
        </div>
        
        <div class="mb-3">
            <strong>Resultados:</strong>
            <p class="mb-1 small">${resultados.substring(0, 100)}${resultados.length > 100 ? '...' : ''}</p>
        </div>
        
        <div class="text-center mt-3">
            <small class="text-muted">Preview - Relatório completo será gerado em PDF</small>
        </div>
    `;
}

function gerarRelatorioPersonalizado() {
    // ... (manter função original)
}

function gerarRelatorioMensal() {
    // ... (manter função original)
}

function exportarDadosCompletos() {
    // ... (manter função original)
}

function salvarConfiguracoes() {
    // ... (manter função original)
}

// 🚀 INICIALIZAR APLICAÇÃO
document.addEventListener('DOMContentLoaded', function() {
    window.app = new App();
    window.app.initialize();
});

// 📋 FUNÇÕES PARA EDIÇÃO E RELATÓRIOS DE EVENTOS

// Dados de exemplo atualizados
const eventosMock = [
    { 
        id: 1, 
        titulo: "Qualquer coisa", 
        descricao: "Evento de limpeza de rios",
        categoria: "Limpeza de Rios", 
        data: "2025-11-25", 
        local: "Palmas", 
        participantes: 50, 
        organizador: "Prefeitura",
        contato: "contato@exemplo.com",
        status: "ativo",
        temRelatorio: false,
        imagem: 'https://via.placeholder.com/40'
    },
    { 
        id: 2, 
        titulo: "Palmas mais limpa", 
        descricao: "Mutirão de limpeza",
        categoria: "Limpeza de Rios", 
        data: "2025-11-23", 
        local: "Palmas", 
        participantes: 12, 
        organizador: "Comunidade",
        contato: "comunidade@exemplo.com",
        status: "ativo",
        temRelatorio: false,
        imagem: 'https://via.placeholder.com/40'
    }
];

// Carrega a tabela com ambas as funcionalidades
function carregarTabelaCompleta(eventos) {
    const tbody = document.getElementById('tabelaEventos');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    const eventosParaExibir = eventos && eventos.length > 0 ? eventos : [];

     if (eventosParaExibir.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="bi bi-calendar-x display-6"></i>
                    <p class="mt-2">Nenhum evento cadastrado</p>
                </td>
            </tr>
        `;
        return;
    }

    eventosParaExibir.forEach(evento => {
        let imagemUrl = evento.imagem || evento.imagemPrincipal;
        
        // Converter para URL completa se for apenas nome do arquivo
        if (imagemUrl && !imagemUrl.startsWith('http')) {
            imagemUrl = `http://localhost:8080/arquivos/${imagemUrl}`;
        }
        
        // 🆕 FALLBACK PARA IMAGEM VÁLIDA
        if (!imagemUrl || imagemUrl.includes('via.placeholder.com')) {
            imagemUrl = 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80';
        }
        // Botão de relatório (ícone de documento)
        const btnRelatorio = evento.temRelatorio 
            ? `<button class="btn btn-sm btn-relatorio-concluido" title="Relatório Gerado" onclick="abrirModalRelatorio(${evento.id})">
                 <i class="bi bi-file-earmark-check"></i>
               </button>`
            : `<button class="btn btn-sm btn-outline-success btn-relatorio" title="Criar Relatório" onclick="abrirModalRelatorio(${evento.id})">
                 <i class="bi bi-file-earmark-text"></i>
               </button>`;

        // Botão de edição (lápis)
        const btnEditar = `<button class="btn btn-sm btn-outline-primary" title="Editar Evento" onclick="abrirModalEditarEvento(${evento.id})">
                             <i class="bi bi-pencil"></i>
                           </button>`;

        // Botão de excluir
        const btnExcluir = `<button class="btn btn-sm btn-outline-danger" title="Excluir Evento" onclick="excluirEvento(${evento.id})">
                              <i class="bi bi-trash"></i>
                            </button>`;

        const tr = `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${imagemUrl}" alt="${evento.nome || evento.titulo}" 
                             style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" class="me-3">
                        <div>
                            <strong>${evento.nome || evento.titulo}</strong>
                            <br>
                            <small class="text-muted">${evento.categoria || 'Sem categoria'}</small>
                        </div>
                    </div>
                </td>
                <td>${evento.dataHora ? new Date(evento.dataHora).toLocaleDateString('pt-BR') : 'Data não definida'}</td>
                <td>${evento.local || 'Local não definido'}</td>
                <td>
                    <span class="badge bg-primary">${evento.participantes || 0}</span>
                </td>
                <td>
                    <span class="badge bg-success">${evento.status || 'ativo'}</span>
                </td>
                <td>
                    <div class="btn-group">
                        ${btnRelatorio}
                        <button class="btn btn-sm btn-outline-primary" onclick="abrirModalEditarEvento(${evento.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="excluirEvento(${evento.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
        tbody.innerHTML += tr;
    
    });
}

// 🎯 FUNÇÕES PARA EDIÇÃO DE EVENTOS

// Abre modal para editar evento
function abrirModalEditarEvento(id) {
    let evento = eventosMock.find(e => e.id === id);
    
    // Tenta encontrar nos dados da API
    if (window.app && window.app.adminService) {
        window.app.adminService.carregarEventos().then(eventos => {
            const eventoAPI = eventos.find(e => e.id === id);
            if (eventoAPI) {
                evento = eventoAPI;
                preencherModalEdicao(evento);
            }
        }).catch(() => {
            preencherModalEdicao(evento);
        });
    } else {
        preencherModalEdicao(evento);
    }
}

function preencherModalEdicao(evento) {
    if (!evento) {
        console.error('Evento não encontrado');
        return;
    }
    
    document.getElementById('eventIdEditar').value = evento.id;
    document.getElementById('editarTitulo').value = evento.titulo || '';
    document.getElementById('editarDescricao').value = evento.descricao || '';
    document.getElementById('editarData').value = evento.data ? evento.data.split('T')[0] : '';
    document.getElementById('editarLocal').value = evento.local || '';
    document.getElementById('editarCategoria').value = evento.categoria || '';
    document.getElementById('editarOrganizador').value = evento.organizador || '';
    document.getElementById('editarParticipantes').value = evento.participantes || '';
    document.getElementById('editarContato').value = evento.contato || '';
    document.getElementById('editarStatus').value = evento.status || 'ativo';
    
    // Preview da imagem atual
    const preview = document.getElementById('editarImagePreview');
    if (preview && evento.imagem) {
        preview.innerHTML = `<img src="${evento.imagem}" class="img-fluid rounded" style="max-height: 100px;">`;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('modalEditarEvento'));
    modal.show();
}


// 🆕 FUNÇÕES PARA UPLOAD DE IMAGEM
function previewImagem(input) {
    const preview = document.getElementById('imagePreview');
    const status = document.createElement('div');
    status.className = 'upload-status';
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validar tamanho do arquivo (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            status.innerHTML = '<span class="text-danger">Arquivo muito grande. Máx: 5MB</span>';
            preview.innerHTML = '';
            preview.appendChild(status);
            input.value = '';
            return;
        }
        
        // Validar tipo do arquivo
        if (!file.type.match('image.*')) {
            status.innerHTML = '<span class="text-danger">Apenas imagens são permitidas</span>';
            preview.innerHTML = '';
            preview.appendChild(status);
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" class="img-fluid rounded">
            `;
            preview.appendChild(status);
            status.innerHTML = `<span class="text-success">Pronto para upload: ${file.name}</span>`;
        };
        
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<div class="text-muted">Preview da imagem aparecerá aqui</div>';
    }
}





// Salva as edições do evento
async function salvarEdicaoEvento() {
    const id = parseInt(document.getElementById('eventIdEditar').value);
    const dadosAtualizados = {
        titulo: document.getElementById('editarTitulo').value,
        descricao: document.getElementById('editarDescricao').value,
        data: document.getElementById('editarData').value,
        local: document.getElementById('editarLocal').value,
        categoria: document.getElementById('editarCategoria').value,
        organizador: document.getElementById('editarOrganizador').value,
        participantes: parseInt(document.getElementById('editarParticipantes').value) || 0,
        contato: document.getElementById('editarContato').value,
        status: document.getElementById('editarStatus').value
    };

    // Validação básica
    if (!dadosAtualizados.titulo || !dadosAtualizados.data || !dadosAtualizados.local) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const btn = document.querySelector('#modalEditarEvento .btn-primary');
    const textoAntigo = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>Salvando...';
    btn.disabled = true;

    try {
        // Simula salvamento (em produção, chamaria a API)
        setTimeout(() => {
            // Atualiza nos dados mock
            const eventoIndex = eventosMock.findIndex(e => e.id === id);
            if (eventoIndex !== -1) {
                eventosMock[eventoIndex] = { ...eventosMock[eventoIndex], ...dadosAtualizados };
            }

            // Atualiza a tabela
            if (window.app && window.app.uiManager) {
                window.app.adminService.carregarEventos().then(eventos => {
                    carregarTabelaCompleta(eventos);
                });
            } else {
                carregarTabelaCompleta(eventosMock);
            }

            alert('Evento atualizado com sucesso!');
            
            // Fecha modal
            const modalEl = document.getElementById('modalEditarEvento');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) {
                modalInstance.hide();
            }
            
            btn.innerHTML = textoAntigo;
            btn.disabled = false;
        }, 1000);

    } catch (error) {
        alert('Erro ao atualizar evento: ' + error.message);
        btn.innerHTML = textoAntigo;
        btn.disabled = false;
    }
}

// 🎯 FUNÇÕES PARA RELATÓRIOS (mantidas com pequenas melhorias)

function abrirModalRelatorio(id) {
    let evento = eventosMock.find(e => e.id === id);
    
    if (window.app && window.app.adminService) {
        window.app.adminService.carregarEventos().then(eventos => {
            const eventoAPI = eventos.find(e => e.id === id);
            if (eventoAPI) {
                evento = eventoAPI;
                preencherModalRelatorio(evento);
            }
        }).catch(() => {
            preencherModalRelatorio(evento);
        });
    } else {
        preencherModalRelatorio(evento);
    }
}

function preencherModalRelatorio(evento) {
    if (!evento) return;
    
    document.getElementById('eventIdRelatorio').value = evento.id;
    document.getElementById('nomeEventoRelatorio').value = evento.titulo;
    document.getElementById('dataEventoRelatorio').value = evento.data ? new Date(evento.data).toLocaleDateString('pt-BR') : 'Data não definida';
    document.getElementById('objetivoRelatorio').value = evento.descricao || '';
    document.getElementById('publicoAlvoRelatorio').value = '';
    document.getElementById('resultadosRelatorio').value = '';
    document.getElementById('previewFotosArea').innerHTML = '';
    
    const modal = new bootstrap.Modal(document.getElementById('modalRelatorioFinal'));
    modal.show();
}

function gerarRelatorioDownload() {
    const id = parseInt(document.getElementById('eventIdRelatorio').value);
    const objetivo = document.getElementById('objetivoRelatorio').value;
    const publicoAlvo = document.getElementById('publicoAlvoRelatorio').value;
    const resultados = document.getElementById('resultadosRelatorio').value;
    
    if (!objetivo.trim() || !resultados.trim()) {
        alert('Por favor, preencha os campos "Objetivo" e "Resultados" antes de gerar o relatório.');
        return;
    }
    
    const btn = document.querySelector('#modalRelatorioFinal .btn-success');
    const textoAntigo = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-arrow-repeat spinner-border spinner-border-sm me-2"></i>Gerando...';
    btn.disabled = true;

    setTimeout(() => {
        console.log('Gerando relatório para evento:', {
            id: id,
            objetivo: objetivo,
            publicoAlvo: publicoAlvo,
            resultados: resultados
        });
        
        alert("Relatório gerado e baixado com sucesso!");
        
        // Marca que tem relatório
        const eventoIndex = eventosMock.findIndex(e => e.id === id);
        if (eventoIndex !== -1) {
            eventosMock[eventoIndex].temRelatorio = true;
        }
        
        // Atualiza a tabela
        if (window.app && window.app.uiManager) {
            window.app.adminService.carregarEventos().then(eventos => {
                carregarTabelaCompleta(eventos);
            });
        } else {
            carregarTabelaCompleta(eventosMock);
        }
        
        // Fecha modal
        const modalEl = document.getElementById('modalRelatorioFinal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }
        btn.innerHTML = textoAntigo;
        btn.disabled = false;
    }, 2000);
}




// 🆕 FUNÇÕES PARA UPLOAD DE IMAGEM
function previewImagem(input) {
    const preview = document.getElementById('imagePreview');
    const status = document.createElement('div');
    status.className = 'upload-status';
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validar tamanho do arquivo (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            status.innerHTML = '<span class="text-danger">Arquivo muito grande. Máx: 5MB</span>';
            preview.innerHTML = '';
            preview.appendChild(status);
            input.value = '';
            return;
        }
        
        // Validar tipo do arquivo
        if (!file.type.match('image.*')) {
            status.innerHTML = '<span class="text-danger">Apenas imagens são permitidas</span>';
            preview.innerHTML = '';
            preview.appendChild(status);
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" class="img-fluid rounded">
            `;
            preview.appendChild(status);
            status.innerHTML = `<span class="text-success">Pronto para upload: ${file.name}</span>`;
        };
        
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<div class="text-muted">Preview da imagem aparecerá aqui</div>';
    }
}

// 🆕 MÉTODO PARA UPLOAD DE IMAGEM PARA A API
async function uploadImagem(arquivo) {
    try {
        console.log('📤 Enviando imagem para API...');
        
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        formData.append('nomeArquivo', arquivo.name);
        
        const response = await fetch('http://localhost:8080/arquivos/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Erro no upload: ${response.status}`);
        }
        
        const nomeArquivoSalvo = await response.text();
        console.log('✅ Imagem salva:', nomeArquivoSalvo);
        
        // Retornar URL para acessar a imagem
        return `http://localhost:8080/arquivos/${nomeArquivoSalvo}`;
        
    } catch (error) {
        console.error('❌ Erro no upload da imagem:', error);
        // Fallback para imagem padrão
        return 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80';
    }
}


// Preview de fotos (mantida)
function previewFotos(input) {
    const container = document.getElementById('previewFotosArea');
    container.innerHTML = '';
    
    if (input.files && input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'foto-preview';
                    img.alt = 'Preview da foto';
                    container.appendChild(img);
                }
                reader.readAsDataURL(file);
            }
        });
    }
}

// Substitui a função original de carregar tabela
function substituirCarregarTabelaEventos() {
    const originalCarregarTabelaEventos = window.app.uiManager.carregarTabelaEventos;
    
    window.app.uiManager.carregarTabelaEventos = function(eventos) {
        carregarTabelaCompleta(eventos);
    };
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.app && window.app.uiManager) {
            substituirCarregarTabelaEventos();
        }
    }, 1000);
});






// Atualiza a função global editarEvento para usar o novo modal
async function editarEvento(id) {
    abrirModalEditarEvento(id);
}




