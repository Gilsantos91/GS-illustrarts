# 🔥 Configuração do Firebase para Sincronização

Para que seus dados sejam sincronizados entre dispositivos, você precisa configurar o Firebase. Siga estes passos:

## 1. Criar projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em "Criar projeto"
3. Digite um nome para seu projeto (ex: "gestor-design-illustrarts")
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

## 2. Configurar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste" (para desenvolvimento)
4. Escolha a localização mais próxima (ex: "us-central1")
5. Clique em "Próximo" e depois "Ativar"

## 3. Configurar regras de segurança

1. Na aba "Regras", substitua o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso apenas aos próprios dados do usuário
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

2. Clique em "Publicar"

## 4. Obter configuração do projeto

1. No menu lateral, clique em "Configurações do projeto" (ícone de engrenagem)
2. Role para baixo até "Seus aplicativos"
3. Clique em "Adicionar aplicativo" e escolha "Web"
4. Digite um nome (ex: "gestor-design-web")
5. Clique em "Registrar aplicativo"
6. Copie a configuração que aparece

## 5. Atualizar arquivo de configuração

1. Abra o arquivo `firebase-config.js`
2. Substitua a configuração de exemplo pela sua configuração real:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key-aqui",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 6. Configurar autenticação (opcional)

Para maior segurança, você pode configurar autenticação:

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Em "Sign-in method", habilite "Email/Password"
4. Clique em "Salvar"

## 7. Testar a sincronização

1. Faça upload dos arquivos para o Netlify
2. Acesse o site em dois dispositivos diferentes
3. Faça login com o mesmo usuário
4. Adicione ou edite dados em um dispositivo
5. Verifique se as mudanças aparecem no outro dispositivo

## 🔧 Funcionalidades da Sincronização

- **Tempo real**: Mudanças aparecem instantaneamente em todos os dispositivos
- **Offline**: Funciona mesmo sem internet, sincronizando quando voltar
- **Cache local**: Dados ficam salvos localmente para acesso rápido
- **Indicador visual**: Mostra status da sincronização na interface
- **Segurança**: Cada usuário só acessa seus próprios dados

## 📱 Como funciona

1. **Login**: Quando você faz login, o sistema inicializa a sincronização
2. **Salvamento**: Cada mudança é salva localmente e no servidor
3. **Sincronização**: Mudanças são enviadas automaticamente para outros dispositivos
4. **Offline**: Sem internet, mudanças ficam em fila e sincronizam quando voltar

## 🚨 Importante

- Mantenha suas chaves do Firebase seguras
- Não compartilhe a configuração do Firebase publicamente
- Para produção, configure regras de segurança mais restritivas
- O Firebase tem limite gratuito generoso para uso pessoal

## 💡 Dicas

- Use o mesmo usuário em todos os dispositivos
- O indicador de sincronização mostra o status atual
- Dados são sincronizados automaticamente em segundo plano
- Funciona em desktop, tablet e celular
