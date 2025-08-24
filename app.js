// ================== ESTADO ==================
let clients = JSON.parse(localStorage.getItem("clients_v3") || "[]");
let jobs = JSON.parse(localStorage.getItem("jobs_v3") || "[]");
let finances = JSON.parse(localStorage.getItem("finances_v1") || "[]");
let brand = JSON.parse(localStorage.getItem("brand") || "null") || {
  primary: "#F0535B",
  logoPref: "auto", // auto | light | dark
  name: "",
  email: "",
  phone: "",
  address: ""
};
let theme = localStorage.getItem("theme") || "light";
let nextJobId = parseInt(localStorage.getItem("nextJobId") || "1", 10); // numeração
let authUser = JSON.parse(localStorage.getItem("authUser") || "null"); // {user} or null

// ================== HELPERS / ELEMENTOS ==================
const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);

document.documentElement.setAttribute("data-theme", theme);

// Login
const loginScreen = $("#login-screen");
const loginForm = $("#login-form");
const appRoot = $("#app-root");

// Top
const themeToggle = $("#theme-toggle");
const forceUpdateBtn = $("#force-update");
const tabs = document.querySelectorAll('.nav-tabs .tab');

// Dashboard
const dashActive = $("#dash-active");
const dashDone = $("#dash-done");
const dashReceived = $("#dash-received");
const dashPending = $("#dash-pending");

// Clientes
const clientForm = $("#client-form");
const clientList = $("#client-list");
const toggleClientsBtn = $("#toggle-clients");
const clientsArea = $("#clients-area");

// Jobs
const jobForm = $("#job-form");
const jobClientSelect = $("#job-client");
const jobActive = $("#jobs-active");
const jobDone = $("#jobs-done");
const jobTemplate = document.querySelector('#job-template');

// Filtros
const searchInput = $("#search");
const filterPriority = $("#filter-priority");
const filterPaid = $("#filter-paid");
const filterStatus = $("#filter-status");

// Modais
const modalClient = $("#modal-client");
const modalJob = $("#modal-job");
const reportModal = $("#modal-report");
const confirmModal = $("#modal-confirm");
const modalSettings = $("#modal-settings");
const openSettingsBtn = $("#open-settings");

// Relatório
const openReportBtn = $("#open-report");
const closeReportBtn = $("#close-report");
const reportMonth = $("#report-month");
const reportClient = $("#report-client");
const mReceived = $("#m-received");
const mPending = $("#m-pending");
const mTotal = $("#m-total");
const mCount = $("#m-count");
const exportPdfBtn = $("#export-pdf");
let chart;
let finChart;

// Calendário
const calEl = $("#calendar");
const calMonth = $("#cal-month");
const prevMonthBtn = $("#prev-month");
const nextMonthBtn = $("#next-month");
const dayListEl = $("#calendar-day-list");
let currentMonth = new Date();

// Financeiro
const finForm = $("#finance-form");
const finType = $("#fin-type");
const finDate = $("#fin-date");
const finDesc = $("#fin-desc");
const finAmount = $("#fin-amount");
const finJob = $("#fin-job");
const finIn = $("#fin-in");
const finOut = $("#fin-out");
const finBalance = $("#fin-balance");
const finTableBody = document.querySelector('#fin-table tbody');

// Settings
const sPrimary = $("#brand-primary");
const sLogoPref = $("#brand-logo-pref");
const sName = $("#brand-name");
const sEmail = $("#brand-email");
const sPhone = $("#brand-phone");
const sAddress = $("#brand-address");
const saveSettingsBtn = $("#save-settings");

// ================== STORAGE ==================
async function save(){
  // Salvar localmente
  localStorage.setItem("clients_v3", JSON.stringify(clients));
  localStorage.setItem("jobs_v3", JSON.stringify(jobs));
  localStorage.setItem("nextJobId", String(nextJobId));
  localStorage.setItem("finances_v1", JSON.stringify(finances));
  localStorage.setItem("brand", JSON.stringify(brand));
  
  // Sincronizar com servidor
  if (window.syncManager) {
    await window.syncManager.save({
      clients,
      jobs,
      nextJobId,
      finances,
      brand
    });
  }
}

// ================== SINCRONIZAÇÃO ==================
function updateSyncStatus() {
  if (!window.syncManager) return;
  
  const status = window.syncManager.getSyncStatus();
  const indicator = $("#sync-indicator");
  const text = $("#sync-text");
  
  if (status.isOnline) {
    if (status.pendingChanges > 0) {
      indicator.textContent = "⏳";
      text.textContent = `${status.pendingChanges} mudanças pendentes`;
    } else {
      indicator.textContent = "✅";
      text.textContent = "Sincronizado";
    }
  } else {
    indicator.textContent = "📴";
    text.textContent = "Offline";
  }
}

// Listener para mudanças de dados sincronizados
window.addEventListener('dataSynced', () => {
  // Recarregar dados do localStorage
  clients = JSON.parse(localStorage.getItem("clients_v3") || "[]");
  jobs = JSON.parse(localStorage.getItem("jobs_v3") || "[]");
  finances = JSON.parse(localStorage.getItem("finances_v1") || "[]");
  brand = JSON.parse(localStorage.getItem("brand") || "null") || {
    primary: "#F0535B",
    logoPref: "auto",
    name: "",
    email: "",
    phone: "",
    address: ""
  };
  nextJobId = parseInt(localStorage.getItem("nextJobId") || "1", 10);
  
  // Re-renderizar interface
  renderClients();
  renderJobs();
  renderCalendar();
  renderDashboard();
  renderFinance();
  updateSyncStatus();
});

// ================== UTILS ==================
function money(n){ return (n || 0).toLocaleString("pt-BR",{style:"currency", currency:"BRL"}); }
function onlyDigits(s){ return (s||"").replace(/\D/g,""); }
function formatWhatsAppLink(phone){
  const clean = onlyDigits(phone);
  const withCountry = clean.startsWith("55") ? clean : ("55"+clean);
  return `https://wa.me/${withCountry}`;
}
function waIcon(){
  return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#25D366" d="M19.11 17.54a3.37 3.37 0 0 1-1.48-.37c-.47-.24-1.08-.52-1.86-1.22-.65-.58-1.06-1.29-1.23-1.51-.26-.36-.52-.75-.52-1.37s.32-1 .44-1.14c.12-.14.26-.32.45-.32.2 0 .3 0 .43.01.14 0 .33-.05.52.4.2.49.67 1.69.73 1.81.06.12.1.27.02.43-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.25-.1.5.14.24.64 1.06 1.37 1.72.94.83 1.73 1.08 1.98 1.2.24.12.4.1.55-.06.16-.16.66-.77.83-1.04.18-.26.34-.22.55-.13.22.1 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.14 1.13-.2.55-1.12 1.07-1.55 1.14-.38.06-.87.09-1.42-.1Z"/><path fill="#25D366" d="M26.1 5.92A12.93 12.93 0 0 0 16.07 2 13 13 0 0 0 4.04 21.35L2 30l8.84-2a12.93 12.93 0 0 0 5.23 1.1h.01a13 13 0 0 0 10.02-21.18Zm-10 .73a9.9 9.9 0 0 1 6.98 2.9 9.85 9.85 0 0 1-13.9 13.96l-.5-.45-5.15 1.19 1.24-4.9-.48-.5A9.85 9.85 0 0 1 16.09 6.65Z"/></svg>`;
}
function pad3(n){ return String(n).padStart(3,"0"); }
function daysUntil(dateStr){
  if(!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr+"T00:00:00");
  d.setHours(0,0,0,0);
  const diff = Math.round((d - today) / (1000*60*60*24));
  return diff;
}
function deadlineBadge(due){
  const diff = daysUntil(due);
  if (diff === null) return "";
  if (diff < 0) return `<span class="badge deadline">Atrasado</span>`;
  if (diff === 0) return `<span class="badge deadline">Hoje</span>`;
  if (diff === 1) return `<span class="badge deadline">Amanhã</span>`;
  return `<span class="badge deadline">Em ${diff} dias</span>`;
}
function payLabel(p){
  if(p==="paid") return "Pago ✅";
  if(p==="half") return "Sinal 50% ⏳";
  return "Não pago ⏳";
}
function payClass(p){
  if(p==="paid") return "pay-paid";
  if(p==="half") return "pay-half";
  return "pay-unpaid";
}
function payFraction(p){
  return p==="paid" ? 1 : (p==="half" ? 0.5 : 0);
}

function escapeHtml(s){
  return String(s||"")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hexToRgb(hex){
  const h = hex.replace('#','');
  const bigint = parseInt(h,16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return {r,g,b};
}

function applyBrand(){
  if(brand?.primary){
    document.documentElement.style.setProperty('--primary', brand.primary);
  }
}

function updateFinJobOptions(){
  if(!finJob) return;
  finJob.innerHTML = '<option value="">Vincular a um trabalho (opcional)</option>';
  jobs.forEach(j=>{
    const opt = document.createElement('option');
    opt.value = String(j.id);
    opt.textContent = `#${pad3(j.id)} ${j.title}`;
    finJob.appendChild(opt);
  });
}

function renderFinance(){
  if(!finTableBody) return;
  // Totais
  const totalIn = finances.filter(f=>f.type==='receita').reduce((s,f)=>s+f.amount,0);
  const totalOut = finances.filter(f=>f.type==='despesa').reduce((s,f)=>s+f.amount,0);
  const balance = totalIn - totalOut;
  finIn && (finIn.textContent = money(totalIn));
  finOut && (finOut.textContent = money(totalOut));
  finBalance && (finBalance.textContent = money(balance));

  // Tabela
  finTableBody.innerHTML = '';
  finances.sort((a,b)=> (a.date||'').localeCompare(b.date||''));
  finances.forEach((f,idx)=>{
    const tr = document.createElement('tr');
    const job = jobs.find(j=>String(j.id)===String(f.jobId));
    tr.innerHTML = `<td>${f.date||'—'}</td><td>${f.type}</td><td>${f.desc}</td><td>${money(f.amount)}</td><td>${job?`#${pad3(job.id)} ${job.title}`:'—'}</td><td><button class="danger" data-findel="${idx}">Excluir</button></td>`;
    finTableBody.appendChild(tr);
  });
  finTableBody.querySelectorAll('[data-findel]').forEach(btn=>{
    btn.addEventListener('click', async()=>{
      const ok = await uiConfirm({title:'Excluir lançamento', message:'Deseja excluir este lançamento?', okText:'Excluir', danger:true});
      if(!ok) return;
      finances.splice(+btn.dataset.findel,1);
      save(); renderFinance();
    });
  });

  // Gráfico simples Entradas vs Saídas
  const ctx = document.getElementById('fin-chart');
  if(ctx){
    if(finChart) finChart.destroy();
    finChart = new Chart(ctx, { type:'bar', data:{ labels:['Entradas','Saídas','Saldo'], datasets:[{ data:[totalIn, totalOut, balance], backgroundColor:[brand.primary, '#ef4444', '#6b7280'] }] }, options:{ plugins:{legend:{display:false}}, responsive:true } });
  }
}

function openSettings(){
  if(!modalSettings) return;
  sPrimary && (sPrimary.value = brand.primary || '#25D366');
  sLogoPref && (sLogoPref.value = brand.logoPref || 'auto');
  sName && (sName.value = brand.name || '');
  sEmail && (sEmail.value = brand.email || '');
  sPhone && (sPhone.value = brand.phone || '');
  sAddress && (sAddress.value = brand.address || '');
  modalSettings.showModal();
}

function applyBrandLogos(){
  const themeMode = document.documentElement.getAttribute('data-theme') || 'light';
  const pref = brand.logoPref || 'auto';
  const wantDark = pref==='dark' ? true : (pref==='light' ? false : themeMode==='dark');
  const src = wantDark ? 'icons/logo-dark.png' : 'icons/logo-light.png';
  const appLogo = document.getElementById('brand-logo');
  const loginLogo = document.getElementById('login-logo');
  if(appLogo) appLogo.src = src;
  if(loginLogo) loginLogo.src = src;
}

async function rasterizeSvgToPngDataUrl(url, width, height){
  const svgText = await fetch(url).then(r=>{ if(!r.ok) throw new Error('no svg'); return r.text(); });
  const svgBlob = new Blob([svgText], {type:'image/svg+xml'});
  const blobUrl = URL.createObjectURL(svgBlob);
  try{
    const img = new Image();
    const dataUrl = await new Promise((resolve, reject)=>{
      img.onload = ()=>{
        const w = width || img.width || 160;
        const h = height || img.height || 40;
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = blobUrl;
    });
    return dataUrl;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

// Modal confirm estilizado (Promise)
function uiConfirm({title="Confirmar", message="Tem certeza?", okText="Confirmar", cancelText="Cancelar", danger=false}={}){
  return new Promise((resolve)=>{
    $("#confirm-title").textContent = title;
    $("#confirm-message").textContent = message;
    const okBtn = $("#confirm-ok");
    okBtn.textContent = okText;
    okBtn.classList.toggle("danger", !!danger);

    const cancelBtn = $("#confirm-cancel");

    function cleanup(res){
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      confirmModal.close();
      resolve(res);
    }
    function onOk(){ cleanup(true); }
    function onCancel(){ cleanup(false); }

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    confirmModal.showModal();
  });
}

// ================== AUTENTICAÇÃO COM FIREBASE ==================
async function renderAuth(){
  const isAuth = window.authManager ? window.authManager.isLoggedIn() : false;
  (loginScreen || {}).style && (loginScreen.style.display = isAuth ? "none" : "flex");
  (appRoot || {}).style && (appRoot.style.display = isAuth ? "block" : "none");
  
  // Inicializar sincronização se autenticado
  if (isAuth && window.syncManager && window.authManager) {
    try {
      const userId = window.authManager.getCurrentUserId();
      if (userId) {
        await window.syncManager.init(userId);
        updateSyncStatus();
      }
    } catch (error) {
      console.log('Erro ao inicializar sincronização:', error);
    }
  }
}

if(loginForm){
  loginForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const email = $("#login-user").value.trim();
    const password = $("#login-pass").value.trim();
    
    if (!email || !password) {
      alert("Preencha email e senha.");
      return;
    }
    
    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    
    // Mostrar loading
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Entrando...";
    submitBtn.disabled = true;
    
    try {
      // Tentar fazer login primeiro
      console.log('Tentando fazer login...');
      await window.authManager.login(email, password);
      console.log('Login realizado com sucesso!');
      await renderAuth();
    } catch (loginError) {
      console.error('Erro no login:', loginError);
      
      // Se não conseguir fazer login, tentar criar conta
      try {
        console.log('Tentando criar conta...');
        await window.authManager.signup(email, password);
        console.log('Conta criada com sucesso!');
        await renderAuth();
        alert("Conta criada com sucesso! Você está logado.");
      } catch (signupError) {
        console.error('Erro no cadastro:', signupError);
        
        // Mostrar erro específico
        let errorMessage = "Erro na autenticação. ";
        if (signupError.code === 'auth/email-already-in-use') {
          errorMessage += "Este email já está em uso. Tente fazer login.";
        } else if (signupError.code === 'auth/invalid-email') {
          errorMessage += "Email inválido.";
        } else if (signupError.code === 'auth/weak-password') {
          errorMessage += "Senha muito fraca. Use pelo menos 6 caracteres.";
        } else if (signupError.code === 'auth/network-request-failed') {
          errorMessage += "Erro de conexão. Verifique sua internet.";
        } else {
          errorMessage += "Verifique se a autenticação está configurada no Firebase.";
        }
        
        alert(errorMessage);
      }
    } finally {
      // Restaurar botão
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ================== RENDER CLIENTES ==================
function renderClients(){
  if(!clientList) return;
  clientList.innerHTML = "";
  if(jobClientSelect) jobClientSelect.innerHTML = `<option value="">Selecione um cliente</option>`;
  clients.forEach((c, i) => {
    const el = document.createElement("div");
    el.className = "client";
    el.innerHTML = `
      <div class="meta">
        <strong>${c.name}</strong>
        <small>
          ${c.company ? c.company + " · " : ""}
          <a class="wa" href="${formatWhatsAppLink(c.phone)}" target="_blank" title="Abrir WhatsApp">${waIcon()} <span>WhatsApp</span></a>
          · ${c.phone}
        </small>
      </div>
      <div class="actions">
        <button class="ghost" data-client-edit="${i}">✏️</button>
        <button class="danger" data-client-del="${i}">Excluir</button>
      </div>
    `;
    clientList.appendChild(el);

    const opt = document.createElement("option");
    opt.value = c.name; opt.textContent = c.name;
    jobClientSelect.appendChild(opt);
  });

  // eventos
  clientList.querySelectorAll("[data-client-edit]").forEach(btn => {
    btn.onclick = () => openClientModal(+btn.dataset.clientEdit);
  });
  clientList.querySelectorAll("[data-client-del]").forEach(btn => {
    btn.onclick = async () => {
      const ok = await uiConfirm({
        title:"Excluir cliente",
        message:"Excluir este cliente? Os jobs vinculados serão mantidos.",
        okText:"Excluir", danger:true
      });
      if(!ok) return;
      clients.splice(+btn.dataset.clientDel,1);
      save(); renderClients(); renderJobs(); renderReportClientOptions();
    };
  });

  renderReportClientOptions();
}

function openClientModal(index){
  const c = clients[index];
  $("#edit-client-id").value = index;
  $("#edit-client-name").value = c.name;
  $("#edit-client-company").value = c.company || "";
  $("#edit-client-phone").value = c.phone;
  modalClient.showModal();
}

$("#save-client") && $("#save-client").addEventListener("click", (e)=>{
  e.preventDefault();
  const idx = +$("#edit-client-id").value;
  clients[idx].name = $("#edit-client-name").value.trim();
  clients[idx].company = $("#edit-client-company").value.trim();
  clients[idx].phone = $("#edit-client-phone").value.trim();
  save(); modalClient.close(); renderClients(); renderJobs(); renderCalendar();
});

clientForm && clientForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const name = $("#client-name").value.trim();
  const company = $("#client-company").value.trim();
  const phone = $("#client-phone").value.trim();
  if(!name || !phone) return;
  clients.push({name, company, phone});
  save(); clientForm.reset(); renderClients();
});

// recolher clientes
toggleClientsBtn && toggleClientsBtn.addEventListener("click", ()=>{
  const open = clientsArea.classList.toggle("open");
  toggleClientsBtn.setAttribute("aria-expanded", open ? "true" : "false");
  toggleClientsBtn.textContent = open ? "⯆" : "⯈";
});

// ================== RENDER JOBS ==================
function jobPriorityClass(p){
  if(p === "alta") return "prio-high";
  if(p === "média") return "prio-med";
  return "prio-low";
}

function renderJobs(){
  if(!jobActive || !jobDone) return;
  jobActive.innerHTML = "";
  jobDone.innerHTML = "";

  // filtros
  const q = (searchInput?.value || "").toLowerCase();
  const fp = filterPriority?.value || "__all__";
  const fpaid = filterPaid?.value || "__all__";  // __all__, paid, half, unpaid
  const fstatus = filterStatus?.value || "active"; // active, done, all

  // ordenar ativos por 'order' (drag & drop), default index
  const sorted = [...jobs].sort((a,b)=>{
    const ao = a.order ?? 999999;
    const bo = b.order ?? 999999;
    if(a.done !== b.done) return a.done ? 1 : -1; // ativos primeiro
    if(!a.done && !b.done){ return ao - bo; }
    return (a.due || "").localeCompare(b.due || "");
  });

  sorted.forEach((j) => {
    // filtros
    if(q){
      const hay = (j.title+" "+(j.desc||"")+" "+j.client).toLowerCase();
      if(!hay.includes(q)) return;
    }
    if(fp !== "__all__" && j.priority !== fp) return;
    if(fpaid !== "__all__" && (j.pay||"unpaid") !== fpaid) return;
    if(fstatus !== "all"){
      const wantDone = (fstatus === "done");
      if(!!j.done !== wantDone) return;
    }

    const jobEl = document.createElement("div");
    jobEl.className = "job";
    jobEl.dataset.id = j.id;

    // header
    const prioClass = jobPriorityClass(j.priority);
    jobEl.innerHTML = `
      <div class="job-header">
        <div class="job-title">
          <span>#${pad3(j.id)}</span>
          <span>${j.title}</span>
        </div>
        <div class="job-meta">
          <span class="badge ${prioClass}">Prioridade: ${j.priority}</span>
          ${deadlineBadge(j.due)}
          <span class="badge">${j.client}</span>
          <span class="badge">Entrega: ${j.due || "—"}</span>
          <span class="badge ${payClass(j.pay)}">${payLabel(j.pay)}</span>
          <div class="job-actions">
            <button class="ghost" data-edit="${j.id}">✏️</button>
            <button class="ghost" data-os="${j.id}">📄 OS</button>
            <button class="danger" data-del="${j.id}">Excluir</button>
          </div>
        </div>
      </div>
      <div class="job-content">
        <div class="job-price">Valor cobrado: ${money(j.price)}</div>
        <p style="margin:6px 0 10px;">${escapeHtml(j.desc || "")}</p>
        <div class="steps" id="steps-${j.id}"></div>
        <div class="step">
          <input type="text" placeholder="Nova etapa..." id="new-step-${j.id}">
          <button class="ghost" data-addstep="${j.id}">Adicionar etapa</button>
        </div>
        <div class="row-2" style="margin-top:8px;">
          <select data-pay="${j.id}">
            <option value="unpaid" ${j.pay==="unpaid"?"selected":""}>Não pago</option>
            <option value="half" ${j.pay==="half"?"selected":""}>Sinal 50%</option>
            <option value="paid" ${j.pay==="paid"?"selected":""}>Pago</option>
          </select>
          <label class="checkbox"><input type="checkbox" data-done="${j.id}" ${j.done ? "checked":""}> Marcar como concluído</label>
        </div>
        <div class="row-2" style="margin-top:8px;">
          <button class="ghost" data-os="${j.id}">Gerar OS (PDF)</button>
          <button class="primary" data-share-os="${j.id}">Compartilhar OS</button>
        </div>
      </div>
    `;

    // montar steps
    const stepsEl = jobEl.querySelector("#steps-"+j.id);
    (j.steps||[]).forEach((s, si) => {
      const line = document.createElement("div");
      line.className = "step"+(s.done?" done":"");
      // Caixa visual semelhante ao resumo: checkbox + texto sempre visível e editável
      line.innerHTML = `
        <input type="checkbox" data-stepchk="${j.id}:${si}" ${s.done?"checked":""}>
        <span class="step-text" contenteditable="true" data-steptext="${j.id}:${si}">${escapeHtml(s.text)}</span>
        <div style="display:flex; gap:6px;">
          <button class="ghost move-up" data-stepup="${j.id}:${si}" aria-label="Mover para cima">▲</button>
          <button class="ghost move-down" data-stepdown="${j.id}:${si}" aria-label="Mover para baixo">▼</button>
          <button class="ghost remove-step" data-delstep="${j.id}:${si}" aria-label="Remover etapa">🗑️</button>
        </div>
      `;
      stepsEl.appendChild(line);
    });

    // expand/colapse
    jobEl.querySelector(".job-header").addEventListener("click", (ev)=>{
      if(ev.target.closest(".job-actions")) return;
      jobEl.classList.toggle("open");
    });

    if(!j.done){
      jobEl.setAttribute("draggable", "true");
      jobEl.addEventListener("dragstart", (e)=>{
        jobEl.classList.add("dragging");
        e.dataTransfer.setData("text/plain", String(j.id));
      });
      jobEl.addEventListener("dragend", ()=>{
        jobEl.classList.remove("dragging");
      });
      jobActive.appendChild(jobEl);
    } else {
      jobDone.appendChild(jobEl);
    }
  });

  function findJobIndexById(id){ return jobs.findIndex(x=>x.id===id); }

  // editar
  $$("[data-edit]").forEach(b => b.onclick = () => {
    const id = +b.dataset.edit;
    openJobModalById(id);
  });

  // gerar OS
  $$("[data-os]").forEach(b => b.onclick = async () => {
    const id = +b.dataset.os;
    await generateOS(id, false);
  });
  $$("[data-share-os]").forEach(b => b.onclick = async () => {
    const id = +b.dataset.shareOs;
    await generateOS(id, true);
  });

  // excluir
  $$("[data-del]").forEach(b => b.onclick = async () => {
    const id = +b.dataset.del;
    const idx = findJobIndexById(id);
    const ok = await uiConfirm({title:"Excluir trabalho", message:`Excluir o trabalho #${pad3(id)}?`, okText:"Excluir", danger:true});
    if(!ok) return;
    jobs.splice(idx,1); save(); renderJobs(); renderCalendar(); renderDashboard();
  });

  // pay/done
  $$("[data-pay]").forEach(sel => sel.onchange = () => {
    const id = +sel.dataset.pay;
    const idx = findJobIndexById(id);
    jobs[idx].pay = sel.value;
    save(); renderJobs(); renderCalendar(); renderDashboard();
  });
  $$("[data-done]").forEach(chk => chk.onchange = () => {
    const id = +chk.dataset.done;
    const idx = findJobIndexById(id);
    jobs[idx].done = chk.checked; save(); renderJobs(); renderCalendar(); renderDashboard();
  });

  // steps
  $$("[data-addstep]").forEach(btn => btn.onclick = (ev) => {
    const id = +btn.dataset.addstep;
    const jidx = jobs.findIndex(x=>x.id===id);
    const inp = $("#new-step-"+id);
    const text = (inp.value||"").trim();
    if(!text) return;
    jobs[jidx].steps = jobs[jidx].steps || [];
    jobs[jidx].steps.push({text, done:false});
    save();
    // append new line without re-render
    const card = ev.target.closest('.job');
    const stepsEl = card?.querySelector('#steps-'+id);
    if(stepsEl){
      const si = jobs[jidx].steps.length - 1;
      const line = document.createElement('div');
      line.className = 'step';
      line.innerHTML = `
        <input type="checkbox" data-stepchk="${id}:${si}">
        <span class="step-text" contenteditable="true" data-steptext="${id}:${si}">${escapeHtml(text)}</span>
        <div style="display:flex; gap:6px;">
          <button class="ghost move-up" data-stepup="${id}:${si}" aria-label="Mover para cima">▲</button>
          <button class="ghost move-down" data-stepdown="${id}:${si}" aria-label="Mover para baixo">▼</button>
          <button class="ghost remove-step" data-delstep="${id}:${si}" aria-label="Remover etapa">🗑️</button>
        </div>`;
      stepsEl.appendChild(line);
      // bind listeners for the new elements
      const chk = line.querySelector('[data-stepchk]');
      chk.onchange = ()=>{
        const [jid, sidx] = chk.dataset.stepchk.split(":").map(Number);
        const jx = jobs.findIndex(x=>x.id===jid);
        jobs[jx].steps[sidx].done = chk.checked; save();
        line.classList.toggle('done', chk.checked);
      };
      const txt = line.querySelector('[data-steptext]');
      txt.addEventListener('input', ()=>{
        const [jid, sidx] = txt.dataset.steptext.split(":").map(Number);
        const jx = jobs.findIndex(x=>x.id===jid);
        jobs[jx].steps[sidx].text = txt.textContent; save();
      });
      const del = line.querySelector('[data-delstep]');
      del.onclick = ()=>{
        const [jid, sidx] = del.dataset.delstep.split(":").map(Number);
        const jx = jobs.findIndex(x=>x.id===jid);
        jobs[jx].steps.splice(sidx,1); save();
        line.remove();
      };
      const up = line.querySelector('[data-stepup]');
      up.onclick = ()=>{
        const [jid, sidx] = up.dataset.stepup.split(":").map(Number);
        const jx = jobs.findIndex(x=>x.id===jid);
        if(sidx <= 0) return;
        const arr = jobs[jx].steps;
        [arr[sidx-1], arr[sidx]] = [arr[sidx], arr[sidx-1]];
        save();
        renderJobs();
        const idStr = String(jid);
        const newCard = [...document.querySelectorAll('.job')].find(el=>el.dataset.id===idStr);
        newCard && newCard.classList.add('open');
      };
      const down = line.querySelector('[data-stepdown]');
      down.onclick = ()=>{
        const [jid, sidx] = down.dataset.stepdown.split(":").map(Number);
        const jx = jobs.findIndex(x=>x.id===jid);
        const arr = jobs[jx].steps;
        if(sidx >= arr.length-1) return;
        [arr[sidx+1], arr[sidx]] = [arr[sidx], arr[sidx+1]];
        save();
        renderJobs();
        const idStr = String(jid);
        const newCard = [...document.querySelectorAll('.job')].find(el=>el.dataset.id===idStr);
        newCard && newCard.classList.add('open');
      };
    }
    // clear input
    inp.value = '';
  });
  $$("[data-stepchk]").forEach(chk => chk.onchange = (ev) => {
    const [id, si] = chk.dataset.stepchk.split(":").map(Number);
    const jidx = jobs.findIndex(x=>x.id===id);
    jobs[jidx].steps[si].done = chk.checked; save();

    const stepLine = chk.closest(".step");
    stepLine.classList.toggle("done", chk.checked);
  });
  $$("[data-steptext]").forEach(el => {
    el.addEventListener('input', ()=>{
      const [id, si] = el.dataset.steptext.split(":").map(Number);
      const jidx = jobs.findIndex(x=>x.id===id);
      jobs[jidx].steps[si].text = el.textContent; save();
    });
  });
  $$("[data-delstep]").forEach(btn => btn.onclick = (ev) => {
    const [id, si] = btn.dataset.delstep.split(":").map(Number);
    const jidx = jobs.findIndex(x=>x.id===id);
    jobs[jidx].steps.splice(si,1); save();
    // remove line only
    const line = ev.target.closest('.step');
    line && line.remove();
  });

  // mover etapas
  $$("[data-stepup]").forEach(btn => btn.onclick = (ev) => {
    const [id, si] = btn.dataset.stepup.split(":").map(Number);
    const jidx = jobs.findIndex(x=>x.id===id);
    if(si <= 0) return;
    const arr = jobs[jidx].steps;
    [arr[si-1], arr[si]] = [arr[si], arr[si-1]];
    save();
    // re-render somente a lista do card aberto
    const card = ev.target.closest('.job');
    if(card){
      renderJobs();
      // reabrir o card atual
      const idStr = String(id);
      const newCard = [...document.querySelectorAll('.job')].find(el=>el.dataset.id===idStr);
      newCard && newCard.classList.add('open');
    }
  });
  $$("[data-stepdown]").forEach(btn => btn.onclick = (ev) => {
    const [id, si] = btn.dataset.stepdown.split(":").map(Number);
    const jidx = jobs.findIndex(x=>x.id===id);
    const arr = jobs[jidx].steps;
    if(si >= arr.length-1) return;
    [arr[si+1], arr[si]] = [arr[si], arr[si+1]];
    save();
    const card = ev.target.closest('.job');
    if(card){
      renderJobs();
      const idStr = String(id);
      const newCard = [...document.querySelectorAll('.job')].find(el=>el.dataset.id===idStr);
      newCard && newCard.classList.add('open');
    }
  });

  setupDragAndDrop();
}

// abrir modal de job por ID
function openJobModalById(id){
  const i = jobs.findIndex(x=>x.id===id);
  openJobModal(i);
}

function openJobModal(index){
  const j = jobs[index];
  $("#edit-job-id").value = index;
  $("#edit-job-title").value = j.title;
  $("#edit-job-desc").value = j.desc || "";
  $("#edit-job-price").value = j.price || 0;
  $("#edit-job-due").value = j.due || "";
  $("#edit-job-priority").value = j.priority || "baixa";
  $("#edit-job-pay").value = j.pay || "unpaid";
  $("#edit-job-done").checked = !!j.done;

  // select de clientes
  const sel = $("#edit-job-client");
  sel.innerHTML = "";
  clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.name; opt.textContent = c.name;
    sel.appendChild(opt);
  });
  sel.value = j.client;

  modalJob.showModal();
}

$("#save-job") && $("#save-job").addEventListener("click", (e)=>{
  e.preventDefault();
  const i = +$("#edit-job-id").value;
  const j = jobs[i];
  j.title = $("#edit-job-title").value.trim();
  j.desc = $("#edit-job-desc").value.trim();
  j.client = $("#edit-job-client").value;
  j.price = parseFloat($("#edit-job-price").value || "0");
  j.due = $("#edit-job-due").value;
  j.priority = $("#edit-job-priority").value;
  j.pay = $("#edit-job-pay").value;
  j.done = $("#edit-job-done").checked;
  save(); modalJob.close(); renderJobs(); renderCalendar(); renderDashboard();
});

jobForm && jobForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const title = $("#job-title").value.trim();
  const desc = $("#job-desc").value.trim();
  const client = $("#job-client").value;
  const price = parseFloat($("#job-price").value || "0");
  const due = $("#job-due").value;
  const priority = $("#job-priority").value;
  const pay = $("#job-pay").value; // tri-state
  const templateKey = (jobTemplate?.value || 'default');
  if(!title || !client || !due) return;

  const id = nextJobId++;
  const orderMax = Math.max(0, ...jobs.filter(j=>!j.done).map(j=>j.order || 0));
  const templates = {
    default: [
      {text:'Briefing', done:false},
      {text:'Conceito/Proposta', done:false},
      {text:'Rascunhos', done:false},
      {text:'Revisões', done:false},
      {text:'Finalização', done:false},
      {text:'Entrega', done:false},
    ],
    social: [
      {text:'Briefing', done:false},
      {text:'Planejamento de posts', done:false},
      {text:'Criação artes', done:false},
      {text:'Aprovação', done:false},
      {text:'Agendamento', done:false},
      {text:'Relatório', done:false},
    ],
    identidade: [
      {text:'Briefing', done:false},
      {text:'Pesquisa & Referências', done:false},
      {text:'Propostas de logo', done:false},
      {text:'Revisões', done:false},
      {text:'Manual de marca', done:false},
      {text:'Entrega de arquivos', done:false},
    ],
    website: [
      {text:'Briefing', done:false},
      {text:'Wireframes', done:false},
      {text:'Layout UI', done:false},
      {text:'Desenvolvimento', done:false},
      {text:'Testes', done:false},
      {text:'Publicação', done:false},
    ],
  };
  const steps = (templates[templateKey] || templates.default).map(s=>({...s}));
  jobs.push({ id, order: orderMax + 1, title, desc, client, price, due, priority, pay, done:false, steps });
  save(); jobForm.reset(); renderJobs(); renderCalendar(); renderDashboard();
  updateFinJobOptions();
});

// Busca e filtros
[searchInput, filterPriority, filterPaid, filterStatus].forEach(el=>{
  if(!el) return;
  el.addEventListener("input", renderJobs);
  el.addEventListener("change", renderJobs);
});

// ================== DRAG & DROP ==================
function setupDragAndDrop(){
  const list = jobActive;
  if(!list) return;
  let placeholder = null;

  function createPlaceholder(){
    const ph = document.createElement("div");
    ph.className = "placeholder";
    return ph;
  }

  list.addEventListener("dragover", (e)=>{
    e.preventDefault();
    const after = getDragAfterElement(list, e.clientY);
    if(!placeholder) placeholder = createPlaceholder();
    if(after == null){
      list.appendChild(placeholder);
    } else {
      list.insertBefore(placeholder, after);
    }
  });

  list.addEventListener("drop", (e)=>{
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("text/plain"), 10);
    const dragged = [...list.querySelectorAll(".job")].find(el=>parseInt(el.dataset.id,10)===id);
    if(placeholder){
      list.insertBefore(dragged, placeholder);
      placeholder.remove(); placeholder = null;
    }
    const ids = [...list.querySelectorAll(".job")].map(el=>parseInt(el.dataset.id,10));
    ids.forEach((jid, idx)=>{
      const j = jobs.find(x=>x.id===jid);
      if(j) j.order = idx + 1;
    });
    save();
  });

  list.addEventListener("dragleave", (e)=>{
    if(e.target === list && placeholder){
      placeholder.remove(); placeholder = null;
    }
  });

  function getDragAfterElement(container, y){
    const els = [...container.querySelectorAll(".job:not(.dragging)")];
    return els.reduce((closest, child)=>{
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height/2;
      if(offset < 0 && offset > closest.offset){
        return {offset, element: child};
      } else {
        return closest;
      }
    }, {offset: Number.NEGATIVE_INFINITY}).element;
  }
}

// ================== CALENDÁRIO ==================
function renderCalendar(){
  if(!calEl) return;
  const week = ["S","T","Q","Q","S","S","D"];
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month+1, 0);
  const startDay = first.getDay();

  const monthStr = currentMonth.toLocaleDateString("pt-BR", {month:"long", year:"numeric"});
  calMonth.textContent = monthStr[0].toUpperCase()+monthStr.slice(1);

  calEl.innerHTML = "";
  week.forEach(w=>{
    const h = document.createElement("div");
    h.style.textAlign="center"; h.style.fontWeight="600";
    h.textContent = w; calEl.appendChild(h);
  });

  for(let i=0;i<startDay;i++){
    const empty = document.createElement("div");
    calEl.appendChild(empty);
  }

  for(let d=1; d<=last.getDate(); d++){
    const cell = document.createElement("div");
    cell.className = "day";
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    cell.innerHTML = `<div class="d">${d}</div>`;

    const dayJobs = jobs.filter(j => j.due === dateStr);
    dayJobs.forEach(j=>{
      const b = document.createElement("div");
      b.className = "badge";
      b.textContent = `#${pad3(j.id)} ${j.title}`;
      cell.appendChild(b);
    });

    cell.addEventListener("click", ()=>{
      dayListEl.innerHTML = `<h4 style="margin:6px 0;">${d}/${month+1}/${year}</h4>`;
      if(dayJobs.length===0){
        dayListEl.innerHTML += `<div class="item">Sem trabalhos para esta data.</div>`;
      } else {
        dayJobs.forEach(j=>{
          const it = document.createElement("div");
          it.className = "item";
          it.innerHTML = `
            <div>
              <strong>#${pad3(j.id)} ${j.title}</strong>
              <div style="color:var(--muted); font-size:13px;">${j.client} · ${money(j.price)} · ${j.priority}</div>
            </div>
            <div>${payLabel(j.pay)}</div>
          `;
          dayListEl.appendChild(it);
        });
      }
    });

    calEl.appendChild(cell);
  }
}

prevMonthBtn && prevMonthBtn.addEventListener("click", ()=>{
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1);
  renderCalendar();
});
nextMonthBtn && nextMonthBtn.addEventListener("click", ()=>{
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1);
  renderCalendar();
});

// ================== RELATÓRIO (resumo) ==================
function renderReportClientOptions(){
  if(!reportClient) return;
  reportClient.innerHTML = `<option value="__all__">Todos os clientes</option>`;
  clients.forEach(c=>{
    const opt = document.createElement("option");
    opt.value = c.name; opt.textContent = c.name;
    reportClient.appendChild(opt);
  });
}

openReportBtn && openReportBtn.addEventListener("click", ()=>{
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  reportMonth.value = ym;
  renderReport(); reportModal.showModal();
});
$("#close-report") && $("#close-report").addEventListener("click", ()=> reportModal.close());
reportMonth && reportMonth.addEventListener("change", renderReport);
reportClient && reportClient.addEventListener("change", renderReport);

function renderReport(){
  const ym = reportMonth.value || "";
  const clientFilter = reportClient.value || "__all__";
  const list = jobs.filter(j=>{
    const sameMonth = (j.due||"").startsWith(ym);
    const byClient = clientFilter==="__all__" || j.client===clientFilter;
    return sameMonth && byClient;
  });

  const received = list.reduce((s,j)=> s + (j.price||0) * payFraction(j.pay), 0);
  const total = list.reduce((s,j)=> s + (j.price||0), 0);
  const pending = total - received;
  mReceived.textContent = money(received);
  mPending.textContent = money(pending);
  mTotal.textContent = money(total);
  mCount.textContent = String(list.length);

  const tbody = $("#report-table tbody");
  tbody.innerHTML = "";
  list.sort((a,b)=> (a.due||"").localeCompare(b.due||""));
  list.forEach(j=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>#${pad3(j.id)}</td><td>${j.due||"—"}</td><td>${j.client}</td><td>${j.title}</td><td>${money(j.price)}</td><td>${payLabel(j.pay)}</td>`;
    tbody.appendChild(tr);
  });

  const ctx = $("#report-chart");
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Recebido", "Pendente"],
      datasets: [{ data: [received, pending] }]
    },
    options: { responsive:true, plugins:{ legend:{display:false} } }
  });
}

// exportar PDF (relatório)
exportPdfBtn && exportPdfBtn.addEventListener("click", async ()=>{
  const node = $("#report-view");
  const canvas = await html2canvas(node, {scale:2, backgroundColor:null});
  const img = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit:"pt", format:"a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const ratio = canvas.width / canvas.height;
  const w = pageW - 40; const h = w / ratio;
  pdf.addImage(img, "PNG", 20, 20, w, h);
  pdf.save("relatorio.pdf");
});

// -------- ORDEM DE SERVIÇO (PDF + Compartilhar) --------
async function generateOS(jobId, share=false){
  const j = jobs.find(x=>x.id===jobId);
  if(!j) return;
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit:"pt", format:"a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  // Header com logo e informações da empresa
  const {r,g,b} = hexToRgb(brand.primary || '#F0535B');
  pdf.setFillColor(r,g,b);
  pdf.rect(0, 0, pageW, 120, 'F');

  // Logo centralizado no header
  try{
    const themeMode = document.documentElement.getAttribute('data-theme') || 'light';
    const pref = brand.logoPref || 'auto';
    const wantDark = pref==='dark' ? true : (pref==='light' ? false : themeMode==='dark');
    const pngPath = wantDark ? 'icons/logo-dark.png' : 'icons/logo-light.png';
    let dataUrl;
    try{
      dataUrl = await rasterizeSvgToPngDataUrl('icons/logo.svg', 200, 60);
    }catch(_){
      dataUrl = await fetch(pngPath).then(r=>r.blob()).then(b=>new Promise(res=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.readAsDataURL(b); }));
    }
    pdf.addImage(dataUrl, 'PNG', (pageW-200)/2, 30, 200, 60);
  }catch(e){ /* ignore logo errors */ }

  // Informações da empresa no header
  pdf.setTextColor(255,255,255);
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  if(brand.name) pdf.text(brand.name, pageW - margin, 50, { align: 'right' });
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'normal');
  if(brand.email) pdf.text(brand.email, pageW - margin, 70, { align: 'right' });
  if(brand.phone) pdf.text(brand.phone, pageW - margin, 85, { align: 'right' });
  if(brand.address) pdf.text(brand.address, pageW - margin, 100, { align: 'right' });

  // Título da OS
  y = 160;
  pdf.setTextColor(0,0,0);
  pdf.setFontSize(24);
  pdf.setFont(undefined, 'bold');
  pdf.text("ORDEM DE SERVIÇO", pageW/2, y, { align: 'center' });

  // Informações principais em grid
  y += 40;
  const infoW = (pageW - 2*margin) / 2;
  
  // Coluna esquerda - Dados do trabalho
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'bold');
  pdf.text("DADOS DO TRABALHO", margin, y);
  y += 20;
  pdf.setFont(undefined, 'normal');
  pdf.text(`Número: #${pad3(j.id)}`, margin, y);
  y += 18;
  pdf.text(`Título: ${j.title}`, margin, y);
  y += 18;
  pdf.text(`Data de Criação: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
  y += 18;
  pdf.text(`Data Prevista: ${j.due ? new Date(j.due).toLocaleDateString('pt-BR') : '—'}`, margin, y);
  y += 18;
  pdf.text(`Valor: ${money(j.price)}`, margin, y);
  y += 18;
  pdf.text(`Status: ${payLabel(j.pay)}`, margin, y);

  // Coluna direita - Dados do cliente
  y = 200;
  pdf.setFont(undefined, 'bold');
  pdf.text("DADOS DO CLIENTE", margin + infoW, y);
  y += 20;
  pdf.setFont(undefined, 'normal');
  pdf.text(`Nome: ${j.client}`, margin + infoW, y);
  y += 18;
  
  // Buscar dados completos do cliente
  const client = clients.find(c => c.name === j.client);
  if(client){
    if(client.company) {
      pdf.text(`Empresa: ${client.company}`, margin + infoW, y);
      y += 18;
    }
    if(client.phone) {
      pdf.text(`Telefone: ${client.phone}`, margin + infoW, y);
      y += 18;
    }
  }

  // Descrição do trabalho
  y = Math.max(y + 20, 380);
  pdf.setFont(undefined, 'bold');
  pdf.text("DESCRIÇÃO DO TRABALHO", margin, y);
  y += 20;
  pdf.setFont(undefined, 'normal');
  const desc = (j.desc || "Sem descrição detalhada.");
  const splitDesc = pdf.splitTextToSize(desc, pageW - 2*margin);
  pdf.text(splitDesc, margin, y);
  y += splitDesc.length * 16 + 20;

  // Etapas do trabalho
  pdf.setFont(undefined, 'bold');
  pdf.text("ETAPAS DO TRABALHO", margin, y);
  y += 20;
  pdf.setFont(undefined, 'normal');
  
  if(j.steps && j.steps.length > 0){
    j.steps.forEach((s, i) => {
      const stepText = `${i+1}. ${s.done ? "✅" : "⬜"} ${s.text}`;
      const lines = pdf.splitTextToSize(stepText, pageW - 2*margin - 40);
      pdf.text(lines, margin + 20, y);
      y += lines.length * 16;
    });
  } else {
    pdf.text("Nenhuma etapa definida.", margin + 20, y);
    y += 20;
  }

  // Footer com assinaturas
  y = Math.max(y + 40, pageH - 120);
  pdf.setDrawColor(r,g,b);
  pdf.setLineWidth(1);
  pdf.line(margin, y, pageW - margin, y);
  y += 20;
  
  // Área de assinaturas
  const sigW = (pageW - 2*margin) / 2;
  pdf.setFontSize(10);
  pdf.setFont(undefined, 'bold');
  pdf.text("ASSINATURA DO CLIENTE", margin, y);
  pdf.text("ASSINATURA DA EMPRESA", margin + sigW, y);
  y += 40;
  
  // Linhas para assinatura
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, margin + sigW - 20, y);
  pdf.line(margin + sigW + 20, y, pageW - margin, y);
  
  // Informações adicionais no footer
  y += 30;
  pdf.setFontSize(8);
  pdf.setFont(undefined, 'normal');
  pdf.setTextColor(100,100,100);
  pdf.text(`OS gerada em ${new Date().toLocaleString('pt-BR')}`, pageW/2, y, { align: 'center' });

  const filename = `OS_${pad3(j.id)}_${(j.title||"").replace(/\s+/g,"_")}.pdf`;

  if(share && navigator.canShare){
    const blob = pdf.output("blob");
    const file = new File([blob], filename, {type: "application/pdf"});
    try{
      await navigator.share({ files:[file], title:"Ordem de Serviço", text:`OS #${pad3(j.id)} - ${j.title}` });
    }catch(e){ console.warn("share cancel/err", e); }
  }else{
    pdf.save(filename);
  }
}

// ================== DASHBOARD ==================
function renderDashboard(){
  if(!dashActive) return;
  const active = jobs.filter(j=>!j.done);
  const done = jobs.filter(j=>j.done);
  dashActive.textContent = String(active.length);
  dashDone.textContent = String(done.length);

  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const inMonth = jobs.filter(j => (j.due||"").startsWith(ym));
  const total = inMonth.reduce((s,j)=> s + (j.price||0), 0);
  const received = inMonth.reduce((s,j)=> s + (j.price||0) * payFraction(j.pay), 0);
  const pending = total - received;
  dashReceived.textContent = money(received);
  dashPending.textContent = money(pending);
}

// ================== TEMA ==================
themeToggle && themeToggle.addEventListener("click", ()=>{
  theme = (theme === "dark") ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  renderJobs();
  applyBrandLogos();
});

// ================== TABS ==================
tabs.forEach(tab=>{
  tab.addEventListener('click', ()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const sec = tab.getAttribute('data-section');
    document.querySelectorAll('.section').forEach(s=>{
      s.style.display = (s.getAttribute('data-section')===sec) ? '' : 'none';
    });
    // refresh per section
    if(sec==='dashboard') renderDashboard();
    if(sec==='crm') renderClients();
    if(sec==='jobs') { renderJobs(); updateFinJobOptions(); }
    if(sec==='calendar') renderCalendar();
    if(sec==='finance') { renderFinance(); updateFinJobOptions(); }
  });
});

// ================== SETTINGS ==================
openSettingsBtn && openSettingsBtn.addEventListener('click', openSettings);
saveSettingsBtn && saveSettingsBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  brand.primary = sPrimary?.value || brand.primary;
  brand.logoPref = sLogoPref?.value || 'auto';
  brand.name = sName?.value || '';
  brand.email = sEmail?.value || '';
  brand.phone = sPhone?.value || '';
  brand.address = sAddress?.value || '';
  save();
  applyBrand();
  applyBrandLogos();
  modalSettings && modalSettings.close();
  // refresh visuals
  renderJobs(); renderDashboard(); renderFinance();
});

// ================== FINANCE ==================
finForm && finForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = {
    type: finType.value,
    date: finDate.value,
    desc: finDesc.value.trim(),
    amount: parseFloat(finAmount.value || '0'),
    jobId: finJob.value || ''
  };
  if(!f.desc || !f.date || !f.amount) return;
  finances.push(f);
  save();
  finForm.reset();
  renderFinance();
});

// ================== FORCE UPDATE ==================
if(forceUpdateBtn){
  forceUpdateBtn.addEventListener("click", async () => {
    if(confirm("Isso irá limpar o cache e forçar uma atualização completa do app. Continuar?")){
      try {
        // Limpar caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            await caches.delete(cacheName);
          }
        }
        
        // Limpar localStorage (exceto dados importantes)
        const keysToKeep = ['theme', 'authUser', 'clients_v3', 'jobs_v3', 'finances_v1', 'brand', 'nextJobId'];
        const allKeys = Object.keys(localStorage);
        for (const key of allKeys) {
          if (!keysToKeep.includes(key)) {
            localStorage.removeItem(key);
          }
        }
        
        // Forçar atualização do service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.unregister();
            setTimeout(async () => {
              await navigator.serviceWorker.register('service-worker.js');
              window.location.reload(true);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Erro ao forçar atualização:', error);
        alert('Erro ao forçar atualização. Tente novamente.');
      }
    }
  });
}

// ================== LOGOUT ==================
const logoutBtn = $("#logout-btn");
if(logoutBtn){
  logoutBtn.addEventListener("click", async () => {
    try {
      await window.authManager.logout();
      renderAuth();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  });
}

// ================== SERVICE WORKER UPDATE ==================
function checkForSWUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
    
    // Listener para atualizações do service worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker atualizado!');
      // Recarregar a página para aplicar as atualizações
      window.location.reload();
    });
  }
}

// ================== VERIFICAR DADOS ==================
function checkAndRestoreData() {
  // Verificar se os dados principais existem
  const hasClients = localStorage.getItem('clients_v3');
  const hasJobs = localStorage.getItem('jobs_v3');
  const hasFinances = localStorage.getItem('finances_v1');
  
  console.log('📊 Verificando dados:', {
    clients: !!hasClients,
    jobs: !!hasJobs,
    finances: !!hasFinances
  });
  
  // Se algum dado estiver faltando, tentar restaurar do backup
  if (!hasClients || !hasJobs || !hasFinances) {
    console.log('⚠️ Alguns dados estão faltando, verificando backups...');
    
    // Tentar restaurar de versões anteriores
    const oldClients = localStorage.getItem('clients_v2') || localStorage.getItem('clients');
    const oldJobs = localStorage.getItem('jobs_v2') || localStorage.getItem('jobs');
    const oldFinances = localStorage.getItem('finances');
    
    if (oldClients && !hasClients) {
      localStorage.setItem('clients_v3', oldClients);
      console.log('✅ Clientes restaurados de backup');
    }
    
    if (oldJobs && !hasJobs) {
      localStorage.setItem('jobs_v3', oldJobs);
      console.log('✅ Jobs restaurados de backup');
    }
    
    if (oldFinances && !hasFinances) {
      localStorage.setItem('finances_v1', oldFinances);
      console.log('✅ Finanças restauradas de backup');
    }
  }
}

// ================== INIT ==================
function migrateOldStorage(){
  // migrate v2 -> v3 (paid boolean -> pay tri-state)
  const oldJobs = JSON.parse(localStorage.getItem("jobs_v2") || "null");
  if(oldJobs && !localStorage.getItem("jobs_v3")){
    jobs = oldJobs.map(j=> ({...j, pay: j.paid ? "paid" : "unpaid"}));
    localStorage.setItem("jobs_v3", JSON.stringify(jobs));
  }
  const oldClients = JSON.parse(localStorage.getItem("clients_v2") || "null");
  if(oldClients && !localStorage.getItem("clients_v3")){
    clients = oldClients;
    localStorage.setItem("clients_v3", JSON.stringify(clients));
  }
}

migrateOldStorage();
applyBrand();

// Inicializar autenticação e sincronização
async function initializeApp() {
  try {
    // Verificar atualizações do service worker
    checkForSWUpdate();
    
    // Verificar e restaurar dados se necessário
    checkAndRestoreData();
    
    // Inicializar autenticação
    if (window.authManager) {
      await window.authManager.init();
      
      // Tentar restaurar autenticação se necessário
      if (!window.authManager.isLoggedIn() && window.authManager.hasStoredAuth()) {
        console.log('Tentando restaurar autenticação...');
        window.authManager.restoreAuth();
      }
    }
    
    // Renderizar interface baseada no estado de autenticação
    renderAuth();
    
    // Se estiver logado, renderizar dados
    if (window.authManager && window.authManager.isLoggedIn()) {
      renderClients();
      renderJobs();
      renderCalendar();
      renderReportClientOptions();
      renderDashboard();
      updateFinJobOptions();
      updateSyncStatus();
    }
  } catch (error) {
    console.error('Erro na inicialização:', error);
  }
}

applyBrandLogos();
initializeApp();
