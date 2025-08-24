// Script para forçar atualização do cache
// Execute este código no console do navegador para limpar o cache e forçar atualização

console.log('🔄 Iniciando limpeza forçada do cache...');

// Função para limpar todos os caches
async function clearAllCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log('📋 Caches encontrados:', cacheNames);
    
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log('🗑️ Cache removido:', cacheName);
    }
  }
}

// Função para limpar localStorage
function clearLocalStorage() {
  const keysToKeep = ['theme', 'clients_v3', 'jobs_v3', 'finances_v1', 'brand', 'nextJobId']; // Manter dados importantes
  const allKeys = Object.keys(localStorage);
  
  for (const key of allKeys) {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
      console.log('🗑️ localStorage removido:', key);
    }
  }
}

// Função para forçar atualização do service worker
async function forceSWUpdate() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('🔄 Service Worker desregistrado');
      
      // Aguardar um pouco e registrar novamente
      setTimeout(async () => {
        await navigator.serviceWorker.register('service-worker.js');
        console.log('✅ Service Worker registrado novamente');
      }, 1000);
    }
  }
}

// Função principal
async function forceUpdate() {
  try {
    console.log('🚀 Iniciando processo de atualização...');
    
    // 1. Limpar caches
    await clearAllCaches();
    
    // 2. Limpar localStorage (exceto tema)
    clearLocalStorage();
    
    // 3. Forçar atualização do service worker
    await forceSWUpdate();
    
    console.log('✅ Limpeza concluída!');
    console.log('🔄 Recarregando página em 3 segundos...');
    
    // Recarregar a página após 3 segundos
    setTimeout(() => {
      window.location.reload(true);
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  }
}

// Executar automaticamente
forceUpdate();

// Também disponível como função global
window.forceUpdate = forceUpdate;
