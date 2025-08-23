// Gerenciador de Autenticação com Firebase
class AuthManager {
  constructor() {
    // Verificar se Firebase está carregado
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.error('Firebase não está carregado corretamente');
      return;
    }
    
    this.auth = firebase.auth();
    this.currentUser = null;
    
    // Listener para mudanças de autenticação
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.handleAuthStateChange(user);
    });
  }

  // Inicializar autenticação
  async init() {
    // Verificar se há usuário logado
    const user = this.auth.currentUser;
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  }

  // Fazer login com email e senha
  async login(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      return userCredential.user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  // Criar conta
  async signup(email, password) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      return userCredential.user;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  }

  // Fazer logout
  async logout() {
    try {
      await this.auth.signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // Handler para mudanças de estado de autenticação
  handleAuthStateChange(user) {
    if (user) {
      console.log('Usuário logado:', user.email);
      // Inicializar sincronização com o ID do usuário
      if (window.syncManager) {
        window.syncManager.init(user.uid);
      }
    } else {
      console.log('Usuário deslogado');
      // Limpar dados locais
      localStorage.removeItem("clients_v3");
      localStorage.removeItem("jobs_v3");
      localStorage.removeItem("finances_v1");
      localStorage.removeItem("brand");
      localStorage.removeItem("nextJobId");
    }
  }

  // Verificar se está logado
  isLoggedIn() {
    return !!this.currentUser;
  }

  // Obter ID do usuário atual
  getCurrentUserId() {
    return this.currentUser ? this.currentUser.uid : null;
  }

  // Obter email do usuário atual
  getCurrentUserEmail() {
    return this.currentUser ? this.currentUser.email : null;
  }
}

// Instância global do gerenciador de autenticação
window.authManager = new AuthManager();
