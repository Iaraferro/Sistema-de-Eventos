class ArquivoService {
    constructor() {
        this.apiService = apiService;
    }

    // 📤 Upload de arquivo genérico
    async uploadArquivo(arquivo) {
        try {
            const formData = new FormData();
            formData.append('arquivo', arquivo);
            formData.append('nomeArquivo', arquivo.name);

            const nomeSalvo = await this.apiService.upload(`${API_CONFIG.ENDPOINTS.ARQUIVOS}/upload`, formData);
            return { 
                success: true, 
                nomeArquivo: nomeSalvo,
                url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARQUIVOS}/${nomeSalvo}`
            };
        } catch (error) {
            console.error('Erro no upload:', error);
            return { success: false, message: error.message };
        }
    }

    // 📤 Upload de arquivo vinculado a evento
    async uploadArquivoEvento(idEvento, arquivo) {
        try {
            const formData = new FormData();
            formData.append('arquivo', arquivo);
            formData.append('nomeArquivo', arquivo.name);
            formData.append('idEvento', idEvento.toString());

            const resultado = await this.apiService.upload(`${API_CONFIG.ENDPOINTS.EVENTOS}/${idEvento}/arquivos`, formData);
            return { success: true, arquivo: resultado };
        } catch (error) {
            console.error('Erro no upload para evento:', error);
            return { success: false, message: error.message };
        }
    }

    // 📥 Download de arquivo
    async baixarArquivo(nomeArquivo) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ARQUIVOS}/${nomeArquivo}`);
            
            if (!response.ok) {
                throw new Error('Arquivo não encontrado');
            }

            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            throw error;
        }
    }

    // 🗑️ Deletar arquivo
    async deletarArquivo(nomeArquivo) {
        try {
            await this.apiService.delete(`${API_CONFIG.ENDPOINTS.ARQUIVOS}/${nomeArquivo}`);
            return { success: true, message: 'Arquivo deletado com sucesso' };
        } catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            throw error;
        }
    }

    // 🖼️ Upload de imagem para evento (uso comum)
    async uploadImagemEvento(idEvento, arquivoImagem) {
        // Validar se é imagem
        if (!arquivoImagem.type.startsWith('image/')) {
            return { success: false, message: 'Arquivo deve ser uma imagem' };
        }

        return await this.uploadArquivoEvento(idEvento, arquivoImagem);
    }
}

// Instância global do serviço de arquivos
const arquivoService = new ArquivoService();