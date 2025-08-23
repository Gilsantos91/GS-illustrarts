// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBy_YlL0v_1iKb5drHdFyL6h6UI2zaQTM",
  authDomain: "gestor-illustrarts.firebaseapp.com",
  projectId: "gestor-illustrarts",
  storageBucket: "gestor-illustrarts.firebasestorage.app",
  messagingSenderId: "603911658495",
  appId: "1:603911658495:web:4593cd16447b6a2feb25ca"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Configurações do Firestore
const settings = {
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
};
db.settings(settings);

// Habilitar persistência offline
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Persistência falhou - múltiplas abas abertas');
    } else if (err.code == 'unimplemented') {
      console.log('Persistência não suportada pelo navegador');
    }
  });