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
    
    // Configurar persistência de sessão
    this.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    
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
      // Salvar no localStorage para persistência
      localStorage.setItem('authUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }));
      return user;
    }
    return null;
  }

  // Fazer login com email e senha
  async login(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      this.currentUser = userCredential.user;
      
      // Salvar no localStorage
      localStorage.setItem('authUser', JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      }));
      
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
      
      // Salvar no localStorage
      localStorage.setItem('authUser', JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL
      }));
      
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
      
      // Limpar dados de autenticação e todos os dados do app
      localStorage.removeItem('authUser');
      localStorage.removeItem("clients_v3");
      localStorage.removeItem("jobs_v3");
      localStorage.removeItem("finances_v1");
      localStorage.removeItem("brand");
      localStorage.removeItem("nextJobId");
      
      console.log('Logout realizado - todos os dados foram limpos');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  }

  // Handler para mudanças de estado de autenticação
  handleAuthStateChange(user) {
    if (user) {
      console.log('Usuário logado:', user.email);
      // Salvar no localStorage
      localStorage.setItem('authUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }));
      
      // Inicializar sincronização com o ID do usuário
      if (window.syncManager) {
        window.syncManager.init(user.uid);
      }
    } else {
      console.log('Usuário deslogado');
      // Em caso de logout automático (refresh), manter os dados
      // Os dados só serão limpos no logout manual
      localStorage.removeItem('authUser');
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

  // Verificar se há dados de autenticação salvos
  hasStoredAuth() {
    return !!localStorage.getItem('authUser');
  }

  // Restaurar autenticação do localStorage (para casos de refresh)
  restoreAuth() {
    const storedAuth = localStorage.getItem('authUser');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        // Verificar se o usuário ainda está autenticado no Firebase
        if (this.auth.currentUser && this.auth.currentUser.uid === authData.uid) {
          this.currentUser = this.auth.currentUser;
          return true;
        } else {
          // Se não há usuário atual no Firebase, aguardar um pouco e tentar novamente
          // Isso é necessário porque o Firebase pode demorar para restaurar a sessão
          return new Promise((resolve) => {
            setTimeout(() => {
              if (this.auth.currentUser && this.auth.currentUser.uid === authData.uid) {
                this.currentUser = this.auth.currentUser;
                resolve(true);
              } else {
                resolve(false);
              }
            }, 1000); // Aguardar 1 segundo
          });
        }
      } catch (error) {
        console.error('Erro ao restaurar autenticação:', error);
        localStorage.removeItem('authUser');
        return false;
      }
    }
    return false;
  }
}

// Instância global do gerenciador de autenticação
window.authManager = new AuthManager();
