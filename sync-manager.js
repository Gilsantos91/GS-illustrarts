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
    this.lastSyncTime = null;
    this.syncInterval = null;
    
    // Listeners para mudanças de conectividade
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    console.log('🔄 SyncManager inicializado');
  }

  // Inicializar com ID do usuário
  async init(userId) {
    this.userId = userId;
    console.log('🔄 Inicializando sincronização para usuário:', userId);
    
    // Configurar listeners em tempo real
    this.setupRealtimeListenersWithUserId();
    
    // Carregar dados do cache local primeiro
    await this.loadFromCache();
    
    // Sincronizar com o servidor
    await this.syncWithServer();
    
    // Aplicar mudanças pendentes
    await this.applyPendingChanges();
    
    // Iniciar sincronização periódica
    this.startPeriodicSync();
    
    console.log('✅ Sincronização inicializada');
  }

  // Carregar dados do cache local
  async loadFromCache() {
    try {
      console.log('📱 Carregando dados do cache local...');
      const cached = await db.collection('users').doc(this.userId).get({ source: 'cache' });
      if (cached.exists) {
        const data = cached.data();
        this.updateLocalData(data);
        console.log('✅ Dados carregados do cache');
      } else {
        console.log('⚠️ Nenhum dado encontrado no cache');
      }
    } catch (error) {
      console.log('❌ Erro ao carregar cache:', error);
    }
  }

  // Sincronizar com servidor
  async syncWithServer() {
    if (!this.isOnline) {
      console.log('📴 Offline - pulando sincronização com servidor');
      return;
    }
    
    try {
      console.log('🌐 Sincronizando com servidor...');
      const doc = await db.collection('users').doc(this.userId).get();
      if (doc.exists) {
        const data = doc.data();
        this.updateLocalData(data);
        this.lastSyncTime = new Date();
        localStorage.setItem('lastSync', this.lastSyncTime.toISOString());
        console.log('✅ Dados sincronizados do servidor');
      } else {
        console.log('⚠️ Nenhum dado encontrado no servidor');
      }
    } catch (error) {
      console.log('❌ Erro na sincronização:', error);
    }
  }

  // Aplicar mudanças pendentes
  async applyPendingChanges() {
    if (this.pendingChanges.length === 0) return;
    
    console.log(`📤 Aplicando ${this.pendingChanges.length} mudanças pendentes...`);
    
    for (const change of this.pendingChanges) {
      await this.saveToServer(change);
    }
    this.pendingChanges = [];
    console.log('✅ Mudanças pendentes aplicadas');
  }

  // Salvar dados
  async save(data) {
    console.log('💾 Salvando dados...');
    
    // Salvar localmente primeiro
    this.saveToLocal(data);
    
    // Salvar no servidor
    if (this.isOnline) {
      await this.saveToServer(data);
    } else {
      // Adicionar à fila de mudanças pendentes
      this.pendingChanges.push(data);
      console.log('📤 Mudança adicionada à fila pendente');
    }
    
    // Atualizar status
    this.updateSyncStatus();
  }

  // Salvar localmente
  saveToLocal(data) {
    localStorage.setItem("clients_v3", JSON.stringify(data.clients || []));
    localStorage.setItem("jobs_v3", JSON.stringify(data.jobs || []));
    localStorage.setItem("nextJobId", String(data.nextJobId || 1));
    localStorage.setItem("finances_v1", JSON.stringify(data.finances || []));
    localStorage.setItem("brand", JSON.stringify(data.brand || {}));
    console.log('💾 Dados salvos localmente');
  }

  // Salvar no servidor
  async saveToServer(data) {
    if (!this.userId) return;
    
    try {
      await db.collection('users').doc(this.userId).set({
        ...data,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
      
      this.lastSyncTime = new Date();
      localStorage.setItem('lastSync', this.lastSyncTime.toISOString());
      console.log('🌐 Dados salvos no servidor');
    } catch (error) {
      console.log('❌ Erro ao salvar no servidor:', error);
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
    
    console.log('📱 Dados locais atualizados');
    
    // Notificar a aplicação sobre mudanças
    this.notifyDataChanged();
  }

  // Configurar listeners em tempo real
  setupRealtimeListeners() {
    // Será configurado quando o userId estiver disponível
  }

  // Configurar listeners quando userId estiver disponível
  setupRealtimeListenersWithUserId() {
    if (!this.userId) return;
    
    console.log('👂 Configurando listeners em tempo real...');
    
    db.collection('users').doc(this.userId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          console.log('🔄 Mudança detectada no servidor');
          this.updateLocalData(data);
        }
      }, (error) => {
        console.log('❌ Erro no listener:', error);
      });
  }

  // Notificar mudanças de dados
  notifyDataChanged() {
    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('dataSynced'));
    console.log('📢 Mudança de dados notificada');
  }

  // Handlers de conectividade
  handleOnline() {
    this.isOnline = true;
    console.log('🌐 Conexão restaurada - sincronizando...');
    this.applyPendingChanges();
    this.updateSyncStatus();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('📴 Conexão perdida - usando cache local');
    this.updateSyncStatus();
  }

  // Iniciar sincronização periódica
  startPeriodicSync() {
    // Sincronizar a cada 30 segundos
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncWithServer();
      }
    }, 30000);
    
    console.log('⏰ Sincronização periódica iniciada (30s)');
  }

  // Parar sincronização periódica
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏰ Sincronização periódica parada');
    }
  }

  // Verificar status de sincronização
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingChanges: this.pendingChanges.length,
      lastSync: this.lastSyncTime ? this.lastSyncTime.toISOString() : localStorage.getItem('lastSync'),
      userId: this.userId
    };
  }

  // Atualizar status de sincronização
  updateSyncStatus() {
    const status = this.getSyncStatus();
    console.log('📊 Status de sincronização:', status);
  }

  // Forçar sincronização manual
  async forceSync() {
    console.log('🔄 Forçando sincronização manual...');
    this.syncInProgress = true;
    
    try {
      await this.syncWithServer();
      await this.applyPendingChanges();
      console.log('✅ Sincronização manual concluída');
    } catch (error) {
      console.log('❌ Erro na sincronização manual:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Limpar dados
  clear() {
    this.stopPeriodicSync();
    this.userId = null;
    this.pendingChanges = [];
    console.log('🧹 SyncManager limpo');
  }
}

// Instância global do gerenciador de sincronização
window.syncManager = new SyncManager();
