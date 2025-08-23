# 🎨 Gestor de Design - ERP Lite

Sistema completo para gerenciar pedidos freelancer de design, com **sincronização automática entre dispositivos**.

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral de jobs ativos e concluídos
- Resumo financeiro mensal
- Métricas em tempo real

### 👥 CRM
- Cadastro de clientes
- Informações de contato
- Integração com WhatsApp

### 📝 Gestão de Trabalhos
- Criação e edição de jobs
- Sistema de prioridades
- Controle de pagamentos
- Etapas personalizáveis
- Drag & drop para ordenação
- Templates de etapas por tipo de projeto

### 📅 Calendário
- Visualização de entregas
- Filtros por data
- Detalhes dos trabalhos

### 💰 Financeiro
- Controle de receitas e despesas
- Vinculação com jobs
- Gráficos e relatórios
- Cálculo de saldo

### 📊 Relatórios
- Relatório mensal completo
- Filtros por cliente
- Exportação para PDF
- Gráficos interativos

### 🔄 Sincronização Multi-dispositivo
- **Sincronização em tempo real** entre todos os dispositivos
- **Funciona offline** - dados sincronizam quando voltar a conexão
- **Cache local** para acesso rápido
- **Indicador visual** de status da sincronização
- **Segurança** - cada usuário acessa apenas seus dados

## 🚀 Como usar

### 1. Configurar Firebase (para sincronização)
Siga o guia em `CONFIGURACAO-FIREBASE.md` para configurar a sincronização.

### 2. Acessar o sistema
- **Usuário padrão**: `admin`
- **Senha padrão**: `admin`
- Você pode alterar as credenciais nas configurações

### 3. Usar em múltiplos dispositivos
- Faça login com o mesmo usuário em todos os dispositivos
- As mudanças sincronizam automaticamente
- O indicador de sincronização mostra o status atual

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase Firestore
- **Sincronização**: Firebase Realtime Database
- **PWA**: Service Worker para funcionamento offline
- **PDF**: jsPDF + html2canvas
- **Gráficos**: Chart.js

## 📱 PWA (Progressive Web App)

- Instalável como app nativo
- Funciona offline
- Notificações push (futuro)
- Interface responsiva

## 🔧 Configuração

### Desenvolvimento local
1. Clone o repositório
2. Configure o Firebase (veja `CONFIGURACAO-FIREBASE.md`)
3. Abra `index.html` no navegador

### Deploy no Netlify
1. Faça upload dos arquivos
2. Configure o Firebase
3. Acesse o site publicado

## 📊 Estrutura de dados

### Clientes
```javascript
{
  name: "Nome do Cliente",
  company: "Empresa (opcional)",
  phone: "WhatsApp com DDD"
}
```

### Jobs
```javascript
{
  id: 1,
  title: "Nome do Trabalho",
  desc: "Descrição",
  client: "Nome do Cliente",
  price: 1000,
  due: "2024-01-15",
  priority: "alta|média|baixa",
  pay: "paid|half|unpaid",
  done: false,
  steps: [
    { text: "Etapa 1", done: false }
  ]
}
```

### Financeiro
```javascript
{
  type: "receita|despesa",
  date: "2024-01-15",
  desc: "Descrição",
  amount: 1000,
  jobId: "1" // opcional
}
```

## 🔄 Sincronização

### Como funciona
1. **Login**: Inicializa sincronização com Firebase
2. **Salvamento**: Dados salvos localmente e no servidor
3. **Tempo real**: Mudanças aparecem instantaneamente
4. **Offline**: Funciona sem internet, sincroniza depois

### Status da sincronização
- ✅ **Sincronizado**: Dados atualizados
- ⏳ **Mudanças pendentes**: Aguardando sincronização
- 📴 **Offline**: Sem conexão com internet
- 🔄 **Sincronizando**: Processando mudanças

## 🎨 Personalização

### Marca
- Cor primária personalizável
- Logo da empresa
- Informações de contato
- Preferência de tema do logo

### Templates de etapas
- **Padrão**: Briefing → Conceito → Rascunhos → Revisões → Finalização → Entrega
- **Social Media**: Briefing → Planejamento → Criação → Aprovação → Agendamento → Relatório
- **Identidade Visual**: Briefing → Pesquisa → Propostas → Revisões → Manual → Entrega
- **Website**: Briefing → Wireframes → Layout → Desenvolvimento → Testes → Publicação

## 📈 Próximas funcionalidades

- [ ] Notificações push
- [ ] Backup automático
- [ ] Integração com WhatsApp Business API
- [ ] Relatórios avançados
- [ ] Múltiplos usuários
- [ ] API REST
- [ ] Integração com calendário externo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- **Documentação**: Veja `CONFIGURACAO-FIREBASE.md`
- **Issues**: Abra uma issue no GitHub
- **Email**: Entre em contato para suporte

---

**Feito para designers produtivos ✨**
