# 🔍 Diagnóstico de Problemas de Autenticação

## 🚨 Erro: "Email ou senha inválidos"

### ✅ Passo 1: Verificar Configuração do Firebase

#### 1.1 Autenticação Habilitada
1. **Acesse** [console.firebase.google.com](https://console.firebase.google.com)
2. **Selecione** seu projeto "gestor-illustrarts"
3. **Menu lateral** → **"Authentication"**
4. **Verifique** se aparece "Email/Password" habilitado
5. **Se não estiver habilitado**:
   - Clique em **"Começar"**
   - Aba **"Sign-in method"**
   - Habilite **"Email/Password"**
   - Clique em **"Salvar"**

#### 1.2 Regras do Firestore
1. **Menu lateral** → **"Firestore Database"**
2. **Aba "Regras"**
3. **Verifique** se as regras estão assim:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
4. **Clique em "Publicar"** se necessário

### ✅ Passo 2: Verificar Console do Navegador

1. **Abra** o site
2. **Pressione F12** (ou Ctrl+Shift+I)
3. **Aba "Console"**
4. **Tente fazer login**
5. **Verifique** se aparecem erros

### ✅ Passo 3: Teste de Conexão

#### 3.1 Verificar se Firebase está carregando
No console do navegador, digite:
```javascript
console.log('Firebase:', typeof firebase);
console.log('Auth:', typeof firebase.auth);
console.log('Firestore:', typeof firebase.firestore);
```

**Resultado esperado:**
- `Firebase: object`
- `Auth: function`
- `Firestore: function`

#### 3.2 Verificar configuração
```javascript
console.log('Config:', firebase.app().options);
```

**Deve mostrar** sua configuração do Firebase.

### ✅ Passo 4: Teste de Autenticação

#### 4.1 Criar conta manualmente
```javascript
firebase.auth().createUserWithEmailAndPassword('teste@exemplo.com', '123456')
  .then((user) => {
    console.log('Conta criada:', user);
  })
  .catch((error) => {
    console.error('Erro:', error);
  });
```

#### 4.2 Fazer login manualmente
```javascript
firebase.auth().signInWithEmailAndPassword('teste@exemplo.com', '123456')
  .then((user) => {
    console.log('Login realizado:', user);
  })
  .catch((error) => {
    console.error('Erro:', error);
  });
```

## 🚨 Problemas Comuns e Soluções

### ❌ "Firebase not initialized"
**Solução:**
- Verifique se `firebase-config.js` está correto
- Confirme se os scripts do Firebase estão carregando

### ❌ "Permission denied"
**Solução:**
- Verifique as regras do Firestore
- Use as regras de desenvolvimento por enquanto

### ❌ "auth/email-already-in-use"
**Solução:**
- Este email já existe
- Use outro email ou faça login com a senha correta

### ❌ "auth/invalid-email"
**Solução:**
- Use um formato de email válido (ex: usuario@exemplo.com)

### ❌ "auth/weak-password"
**Solução:**
- Use senha com pelo menos 6 caracteres

### ❌ "auth/network-request-failed"
**Solução:**
- Verifique conexão com internet
- Confirme se o projeto Firebase está ativo

## 🔧 Configuração Completa

### 1. Firebase Console
- ✅ Projeto criado
- ✅ Firestore Database ativado
- ✅ Authentication habilitado
- ✅ Regras de segurança publicadas

### 2. Arquivos do Projeto
- ✅ `firebase-config.js` com configuração correta
- ✅ Scripts do Firebase carregando
- ✅ `auth-manager.js` funcionando
- ✅ `sync-manager.js` funcionando

### 3. Teste Final
1. **Limpe** o cache do navegador
2. **Recarregue** a página
3. **Tente** fazer login com email/senha
4. **Verifique** o console para erros

## 💡 Dicas

- **Use email real** que você tenha acesso
- **Senha mínima** 6 caracteres
- **Teste primeiro** com dados simples
- **Monitore** o console do navegador
- **Verifique** a conexão com internet

---

**🔍 Se ainda não funcionar, compartilhe os erros do console para diagnóstico mais detalhado.**

