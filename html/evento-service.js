class EventoService {
    constructor(apiService) { // ← RECEBE apiService como parâmetro
        this.apiService = apiService;
        console.log('🔧 EventoService configurado com API Service');
    }

    // 📋 Listar todos os eventos
    async listarEventos() {
        try {
            console.log('🌐 Buscando eventos da API...');
            const eventos = await this.apiService.get(API_CONFIG.ENDPOINTS.EVENTOS);
            
            // Converter para o formato esperado pelo frontend
            const eventosFormatados = eventos.map(evento => this._formatarEventoParaFrontend(evento));
            console.log(`✅ ${eventosFormatados.length} eventos carregados`);
            return eventosFormatados;
        } catch (error) {
            console.error('❌ Erro ao listar eventos:', error);
            // Fallback para dados mock
            console.log('🔄 Usando dados mock como fallback...');
            return this.getEventosMock();
        }
    }

    // 🔍 Buscar evento por ID
    async buscarEventoPorId(id) {
        try {
            console.log(`🔍 Buscando evento ID: ${id}`);
            const evento = await this.apiService.get(`${API_CONFIG.ENDPOINTS.EVENTOS}/${id}`);
            return this._formatarEventoParaFrontend(evento);
        } catch (error) {
            console.error('❌ Erro ao buscar evento:', error);
            throw error;
        }
    }

    // ➕ Criar novo evento
    async criarEvento(dadosEvento) {
        try {
            // Converter do formato frontend para API
            const dadosParaAPI = this._formatarEventoParaAPI(dadosEvento);
            
            console.log('📝 Criando novo evento...', dadosParaAPI);
            const eventoCriado = await this.apiService.post(API_CONFIG.ENDPOINTS.EVENTOS, dadosParaAPI);
            return this._formatarEventoParaFrontend(eventoCriado);
        } catch (error) {
            console.error('❌ Erro ao criar evento:', error);
            throw error;
        }
    }

    // ✏️ Atualizar evento
    async atualizarEvento(id, dadosEvento) {
        try {
            const dadosParaAPI = this._formatarEventoParaAPI(dadosEvento);
            console.log(`✏️ Atualizando evento ID: ${id}`, dadosParaAPI);
            const eventoAtualizado = await this.apiService.put(`${API_CONFIG.ENDPOINTS.EVENTOS}/${id}`, dadosParaAPI);
            return this._formatarEventoParaFrontend(eventoAtualizado);
        } catch (error) {
            console.error('❌ Erro ao atualizar evento:', error);
            throw error;
        }
    }

    // 🗑️ Deletar evento
    async deletarEvento(id) {
        try {
            console.log(`🗑️ Deletando evento ID: ${id}`);
            await this.apiService.delete(`${API_CONFIG.ENDPOINTS.EVENTOS}/${id}`);
            return { success: true, message: 'Evento deletado com sucesso' };
        } catch (error) {
            console.error('❌ Erro ao deletar evento:', error);
            throw error;
        }
    }
_formatarEventoParaFrontend(evento) {
    console.log('🖼️ Formatando evento para frontend:', evento);
    
    // 🆕 MANTER PROPRIEDADES ORIGINAIS DA API E ADICIONAR CAMPOS COMPATÍVEIS
    const eventoFormatado = {
        // 🎯 MANTER ESTRUTURA ORIGINAL DA API
        id: evento.id,
        nome: evento.nome || 'Evento sem título', // ← MANTER 'nome'
        descricao: evento.descricao || 'Descrição não disponível',
        dataHora: evento.dataHora || new Date().toISOString(),
        local: evento.local || 'Local não definido',
        categoria: evento.categoria || 'Evento Ambiental',
        organizador: evento.organizador || 'Organizador',
        contato: evento.contato || 'contato@example.com',
        requisitos: evento.requisitos || 'Trazer disposição e vontade de ajudar!',
        participantes: evento.participantes || 0,
        arquivos: evento.arquivos || [],
        
        // 🎯 ADICIONAR CAMPOS COMPATÍVEIS COM O FRONTEND
        titulo: evento.nome || 'Evento sem título', // ← DUPLICAR PARA COMPATIBILIDADE
        descricaoCurta: (evento.descricao?.substring(0, 100) || 'Descrição não disponível') + '...',
        data: evento.dataHora ? evento.dataHora.split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'ativo'
    };

    // 🖼️ LÓGICA DE IMAGEM (manter sua implementação atual)
    eventoFormatado.imagem = this._construirUrlImagem(evento.arquivos);
    
    console.log('✅ Evento formatado:', eventoFormatado);
    return eventoFormatado;
}

// 🆕 MÉTODO AUXILIAR PARA CONSTRUIR URL DA IMAGEM
_construirUrlImagem(arquivos) {
    const fallbackImage = 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80';
    
    try {
        if (!arquivos || !Array.isArray(arquivos) || arquivos.length === 0) {
            return fallbackImage;
        }
        
        const primeiroArquivo = arquivos[0];
        let nomeArquivo = primeiroArquivo;
        
        // Se for objeto, extrair nomeArquivo
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

    // 🔄 Formatar evento do Frontend para a API
    _formatarEventoParaAPI(eventoFrontend) {
        return {
            nome: eventoFrontend.titulo,
            descricao: eventoFrontend.descricao,
            dataHora: eventoFrontend.dataHora || `${eventoFrontend.data}T10:00:00`,
            local: eventoFrontend.local,
            arquivos: eventoFrontend.arquivos || []
        };
    }

    // 🖼️ Obter imagem padrão ou primeira imagem dos arquivos
    _obterImagemPadrao(arquivos) {
    // Se não há arquivos, usar imagem padrão
    if (!arquivos || arquivos.length === 0) {
        return 'https://images.unsplash.com/photo-1542603833994-03f327ac79f9?auto=format&fit=crop&w=1350&q=80';
    }
    
    // Se há arquivos, construir URL para o primeiro
    // ⚠️ ASSUMINDO que o primeiro arquivo é a imagem principal
    const primeiroArquivo = arquivos[0];
    
    // Verificar se já é uma URL completa
    if (primeiroArquivo.startsWith('http')) {
        return primeiroArquivo;
    }
    
    // Se for apenas um nome de arquivo, construir URL do endpoint de download
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARQUIVOS}/${primeiroArquivo}`;
}

    // Adicione este método de teste
async testarConexao() {
    try {
        const response = await fetch('http://localhost:8080/eventos');
        console.log('🔍 Teste de conexão - Status:', response.status);
        return response.ok;
    } catch (error) {
        console.error('❌ Erro no teste de conexão:', error);
        return false;
    }
}

// E modifique o listarEventos para debug:
async listarEventos() {
    try {
        console.log('🌐 Buscando eventos da API...');
        const response = await fetch('http://localhost:8080/eventos');
        
        console.log('📊 Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }
        
        const eventos = await response.json();
        console.log('✅ Eventos recebidos da API:', eventos);
        
        return eventos;
    } catch (error) {
        console.error('❌ Erro ao buscar eventos:', error);
        return [];
    }
}

    // 🔹 Dados mock para fallback
    getEventosMock() {
        console.log('🔄 Carregando eventos mock...');
        return [
            {
                id: 1,
                titulo: 'Plantio de Árvores Nativas',
                descricao: 'Evento comunitário para plantio de mudas nativas na região do Parque do Povo. Venha contribuir para uma Palmas mais verde!',
                data: new Date(Date.now() + 86400000).toISOString(),
                dataHora: new Date(Date.now() + 86400000).toISOString(),
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
                descricao: 'Mutirão de limpeza das margens do lago. Traga sua família e amigos para ajudar a preservar nosso patrimônio natural.',
                data: new Date(Date.now() + 172800000).toISOString(),
                dataHora: new Date(Date.now() + 172800000).toISOString(),
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

// Instância global do serviço de eventos
const eventoService = new EventoService(apiService);