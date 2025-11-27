// 📁 auth-service.js
// 🌿 Serviço de autenticação e gestão de usuários

class AuthService {
    constructor() {
        this.apiService = apiService;
    }

    // 🔑 Login de usuário
    async login(username, senha) {
        try {
            const authData = {
                username: username,
                senha: senha
            };

            const token = await this.apiService.post(API_CONFIG.ENDPOINTS.AUTH, authData);
            
            if (token) {
                this.apiService.setToken(token);
                return { success: true, token };
            } else {
                return { success: false, message: 'Credenciais inválidas' };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return { 
                success: false, 
                message: error.message || 'Erro ao fazer login' 
            };
        }
    }

    // 👤 Cadastro de novo usuário
    async cadastrar(usuarioData) {
        try {
            // Converter para o formato esperado pela API
            const dadosParaAPI = {
                nome: usuarioData.nome,
                email: usuarioData.email,
                username: usuarioData.username,
                senha: usuarioData.senha,
                id_perfil: 2 // USER por padrão
            };

            const resultado = await this.apiService.post(API_CONFIG.ENDPOINTS.USUARIOS, dadosParaAPI);
            return { success: true, usuario: resultado };
        } catch (error) {
            console.error('Erro no cadastro:', error);
            return { 
                success: false, 
                message: error.message || 'Erro ao cadastrar usuário' 
            };
        }
    }

    // 🚪 Logout
    logout() {
        this.apiService.removeToken();
        window.location.href = 'index.html';
    }

    // 🔍 Verificar se usuário está autenticado
    isAuthenticated() {
        return !!this.apiService.token;
    }

    // 👤 Buscar perfil do usuário logado
    async getPerfilUsuario() {
        try {
            if (!this.isAuthenticated()) {
                return null;
            }

            const perfil = await this.apiService.get(`${API_CONFIG.ENDPOINTS.USUARIOS}/perfil`);
            return perfil;
        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            return null;
        }
    }

    // 🛡️ Verificar se usuário é administrador
    async isAdmin() {
        try {
            const perfil = await this.getPerfilUsuario();
            return perfil && perfil.perfil && perfil.perfil.nome === 'Adm';
        } catch (error) {
            return false;
        }
    }
}



// Instância global do serviço de autenticação
const authService = new AuthService();