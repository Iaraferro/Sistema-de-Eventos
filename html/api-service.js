// 📁 api-service.js
// 🌿 Serviço base para comunicação com a API Quarkus
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
        AUTH: '/auth',
        USUARIOS: '/usuarios',
        EVENTOS: '/eventos',
        ARQUIVOS: '/arquivos'
    }
};

class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.token = localStorage.getItem('jwtToken');
    }

    // 🔐 Método para definir o token JWT
    setToken(token) {
        this.token = token;
        localStorage.setItem('jwtToken', token);
    }

    // 🚪 Método para remover token (logout)
    removeToken() {
        this.token = null;
        localStorage.removeItem('jwtToken');
    }

    // 📞 Método genérico para requisições
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Adicionar token JWT se existir
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Tratar resposta não autorizada
            if (response.status === 401) {
                this.removeToken();
                window.location.href = 'index.html';
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }

            // Se for resposta de texto (como login)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/plain')) {
                return await response.text();
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na comunicação com a API:', error);
            throw error;
        }
    }

    async testarConexao() {
    try {
        console.log('🔍 Testando conexão com a API...');
        const response = await fetch(`${this.baseUrl}/eventos/health`);
        
        if (response.ok) {
            const health = await response.text();
            console.log('✅ API está respondendo:', health);
            return true;
        } else {
            console.log('❌ API não está respondendo corretamente');
            return false;
        }
    } catch (error) {
        console.error('❌ Não foi possível conectar com a API:', error);
        return false;
    }
}

    // 🔹 Métodos HTTP específicos
    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // 📤 Upload de arquivos (multipart/form-data)
    async upload(endpoint, formData) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            method: 'POST',
            body: formData
        };

        if (this.token) {
            config.headers = {
                'Authorization': `Bearer ${this.token}`
            };
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro no upload:', error);
            throw error;
        }
    }
}

// Método para testar conexão com a API

// Instância global do serviço
const apiService = new ApiService();