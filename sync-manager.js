// Gerenciador de Sincronização com Firebase
class SyncManager {
  constructor() {
    // Verificar se Firebase está carregado
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.error('Firebase não está carregado corretamente');
      return;
    }
    
    this.userId = null;
    this.isOnline = navigator.onLine;
    this.pendingChanges = [];
    this.syncInProgress = false;
    
    // Listeners para mudanças de conectividade
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Listener para mudanças no Firestore
    this.setupRealtimeListeners();
  }

  // Inicializar com ID do usuário
  async init(userId) {
    this.userId = userId;
    
    // Configurar listeners em tempo real
    this.setupRealtimeListenersWithUserId();
    
    // Carregar dados do cache local primeiro
    await this.loadFromCache();
    
    // Sincronizar com o servidor
    await this.syncWithServer();
    
    // Aplicar mudanças pendentes
    await this.applyPendingChanges();
  }

  // Carregar dados do cache local
  async loadFromCache() {
    try {
      const cached = await db.collection('users').doc(this.userId).get({ source: 'cache' });
      if (cached.exists) {
        const data = cached.data();
        this.updateLocalData(data);
      }
    } catch (error) {
      console.log('Erro ao carregar cache:', error);
    }
  }

  // Sincronizar com servidor
  async syncWithServer() {
    if (!this.isOnline) return;
    
    try {
      const doc = await db.collection('users').doc(this.userId).get();
      if (doc.exists) {
        const data = doc.data();
        this.updateLocalData(data);
      }
    } catch (error) {
      console.log('Erro na sincronização:', error);
    }
  }

  // Aplicar mudanças pendentes
  async applyPendingChanges() {
    if (this.pendingChanges.length === 0) return;
    
    for (const change of this.pendingChanges) {
      await this.saveToServer(change);
    }
    this.pendingChanges = [];
  }

  // Salvar dados
  async save(data) {
    // Salvar localmente primeiro
    this.saveToLocal(data);
    
    // Salvar no servidor
    if (this.isOnline) {
      await this.saveToServer(data);
    } else {
      // Adicionar à fila de mudanças pendentes
      this.pendingChanges.push(data);
    }
  }

  // Salvar localmente
  saveToLocal(data) {
    localStorage.setItem("clients_v3", JSON.stringify(data.clients || []));
    localStorage.setItem("jobs_v3", JSON.stringify(data.jobs || []));
    localStorage.setItem("nextJobId", String(data.nextJobId || 1));
    localStorage.setItem("finances_v1", JSON.stringify(data.finances || []));
    localStorage.setItem("brand", JSON.stringify(data.brand || {}));
  }

  // Salvar no servidor
  async saveToServer(data) {
    if (!this.userId) return;
    
    try {
      await db.collection('users').doc(this.userId).set({
        ...data,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.log('Erro ao salvar no servidor:', error);
      // Adicionar à fila de mudanças pendentes
      this.pendingChanges.push(data);
    }
  }

  // Atualizar dados locais
  updateLocalData(data) {
    if (data.clients) localStorage.setItem("clients_v3", JSON.stringify(data.clients));
    if (data.jobs) localStorage.setItem("jobs_v3", JSON.stringify(data.jobs));
    if (data.nextJobId) localStorage.setItem("nextJobId", String(data.nextJobId));
    if (data.finances) localStorage.setItem("finances_v1", JSON.stringify(data.finances));
    if (data.brand) localStorage.setItem("brand", JSON.stringify(data.brand));
  }

  // Configurar listeners em tempo real
  setupRealtimeListeners() {
    // Será configurado quando o userId estiver disponível
  }

  // Configurar listeners quando userId estiver disponível
  setupRealtimeListenersWithUserId() {
    if (!this.userId) return;
    
    db.collection('users').doc(this.userId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          this.updateLocalData(data);
          
          // Notificar a aplicação sobre mudanças
          this.notifyDataChanged();
        }
      }, (error) => {
        console.log('Erro no listener:', error);
      });
  }

  // Notificar mudanças de dados
  notifyDataChanged() {
    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('dataSynced'));
  }

  // Handlers de conectividade
  handleOnline() {
    this.isOnline = true;
    console.log('Conexão restaurada - sincronizando...');
    this.applyPendingChanges();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('Conexão perdida - usando cache local');
  }

  // Verificar status de sincronização
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingChanges: this.pendingChanges.length,
      lastSync: localStorage.getItem('lastSync')
    };
  }

  // Forçar sincronização manual
  async forceSync() {
    await this.syncWithServer();
    await this.applyPendingChanges();
  }
}

// Instância global do gerenciador de sincronização
window.syncManager = new SyncManager();
