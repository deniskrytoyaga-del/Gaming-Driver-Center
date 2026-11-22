/**
 * GAMING DRIVER CENTER (GDC) — FRONTEND APPLICATION CONTROLLER
 * Pure Frontend UI Layer with structured Demo Data & Backend Bridge Hooks.
 */

(function () {
  'use strict';

  /* ========================================================================
     1. STRUCTURED DEMO STATE & BACKEND ADAPTER INTERFACE
     ======================================================================== */

  const INITIAL_DEMO_STATE = {
    activePage: 'dashboard',
    sidebarCollapsed: false,
    driverFilter: 'All',
    driverSearch: '',
    historyFilter: 'all',
    isScanning: false,
    lastCheckLabel: 'Not checked yet',
    settings: {
      accent: 'violet',
      glass: true,
      language: 'en',
      toasts: true,
      whqlAlerts: true,
      autoScan: true,
      scanInterval: 'daily',
      startupLaunch: false,
      minimizeTray: true
    },

    overview: [],
    hardware: [],
    drivers: [],
    updates: [],
    optimizations: [],
    history: [],
  };

  function cloneState(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  let appState = cloneState(INITIAL_DEMO_STATE);

  window.GDCFrontend = {
    getState: () => cloneState(appState),
    setBackendConnected: (connected) => {
      const badge = document.getElementById('backendBridgeBadge');
      const statusText = document.getElementById('engineStatusText');
      if (badge) {
        badge.textContent = connected ? 'Connected (Python IPC)' : 'Disconnected (Demo Mode)';
        badge.style.color = connected ? 'var(--success)' : 'var(--warning)';
      }
      if (statusText) statusText.textContent = connected ? 'Service Connected' : 'UI Ready • Demo Data';
    },
    loadExternalData: (payload) => {
      if (payload && typeof payload === 'object') {
        appState = { ...appState, ...payload };
        renderAll();
      }
    },
    navigateTo: (pageId) => switchPage(pageId)
  };

  document.addEventListener('DOMContentLoaded', () => {
    bindNavigation();
    bindSidebarCollapse();
    bindScanButtons();
    bindDriverFilters();
    bindOfficialDriverCenter();
    bindSettingsControls();
    bindModalControls();
    renderAll();
    refreshIcons();
    connectToLocalBackend();
  });

  async function connectToLocalBackend() {
    const badge = document.querySelector('.demo-pill');
    try {
      const response = await fetch('/api/system', { cache: 'no-store' });
      if (!response.ok) throw new Error('Local system scan failed');
      const result = await response.json();
      if (!result.ok || !result.data) throw new Error(result.error || 'No system data');
      window.GDCFrontend.loadExternalData(result.data);
      window.GDCFrontend.setBackendConnected(true);
      if (badge) {
        badge.innerHTML = '<span class="demo-dot"></span> LOCAL SYSTEM MODE';
        badge.title = 'Live hardware inventory from Windows; driver updates are not yet verified.';
      }
    } catch (error) {
      window.GDCFrontend.setBackendConnected(false);
      if (badge) {
        badge.innerHTML = '<span class="demo-dot"></span> PREVIEW MODE';
        badge.title = 'Run the Windows desktop application to enable local hardware detection.';
      }
    }
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  }

  function bindNavigation() {
    document.querySelectorAll('.nav-item').forEach((btn) => btn.addEventListener('click', () => switchPage(btn.getAttribute('data-page'))));
    document.querySelectorAll('[data-nav-target]').forEach((btn) => btn.addEventListener('click', () => switchPage(btn.getAttribute('data-nav-target'))));
  }

  function switchPage(pageId) {
    if (!pageId) return;
    appState.activePage = pageId;
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.getAttribute('data-page') === pageId));
    document.querySelectorAll('.page').forEach((sec) => sec.classList.toggle('active', sec.id === `page-${pageId}`));
    const breadcrumb = document.getElementById('topBreadcrumb');
    if (breadcrumb) breadcrumb.textContent = pageId.toUpperCase();
    const mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.scrollTop = 0;
  }

  function bindSidebarCollapse() {
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const sidebar = document.getElementById('sidebar');
    if (!collapseBtn || !sidebar) return;
    collapseBtn.addEventListener('click', () => {
      appState.sidebarCollapsed = !appState.sidebarCollapsed;
      sidebar.classList.toggle('collapsed', appState.sidebarCollapsed);
      const icon = document.getElementById('collapseIcon');
      if (icon) {
        icon.setAttribute('data-lucide', appState.sidebarCollapsed ? 'panel-left-open' : 'panel-left-close');
        refreshIcons();
      }
    });
  }

  function renderAll() {
    renderDashboard();
    renderHardware();
    renderDrivers();
    updateNavBadges();
    refreshIcons();
  }

  function updateNavBadges() {
    const activeUpdates = appState.updates.filter((u) => u.state !== 'completed').length;
    const updBadge = document.getElementById('navUpdatesBadge');
    const drvBadge = document.getElementById('navDriversBadge');
    if (updBadge) {
      updBadge.textContent = activeUpdates;
      updBadge.style.display = activeUpdates > 0 ? 'inline-block' : 'none';
    }
    if (drvBadge) drvBadge.textContent = appState.drivers.length;
  }

  function renderDashboard() {
    const grid = document.getElementById('dashboardOverviewGrid');
    if (grid) {
      grid.innerHTML = appState.overview.map((item) => `
        <article class="overview-card card-surface ${item.accentClass}">
          <div class="overview-top"><div class="overview-icon"><i data-lucide="${item.icon}"></i></div><span class="overview-tag">${item.tag}</span></div>
          <div class="overview-main" title="${escapeHtml(item.main)}">${escapeHtml(item.main)}</div>
          <div class="overview-sub" title="${escapeHtml(item.sub)}">${escapeHtml(item.sub)}</div>
        </article>`).join('');
    }
    const checked = appState.driverUpdatesChecked === true;
    const remainingUpdates = Number(appState.pendingDriverUpdates || 0);
    const score = checked ? (remainingUpdates === 0 ? 100 : remainingUpdates === 1 ? 93 : 86) : 0;
    const scoreEl = document.getElementById('healthScoreValue');
    const captionEl = document.getElementById('healthScoreLabel');
    const circleEl = document.getElementById('healthCircle');
    const titleEl = document.getElementById('healthStatusTitle');
    const descEl = document.getElementById('healthStatusDesc');
    const stateEl = document.getElementById('healthDriverState');
    const countEl = document.getElementById('healthUpdatesCount');
    const lastCheckEl = document.getElementById('healthLastCheck');
    if (scoreEl) scoreEl.textContent = checked ? `${score}%` : '—';
    if (captionEl) captionEl.textContent = checked ? (remainingUpdates === 0 ? 'PEAK READY' : 'NEEDS REVIEW') : 'NOT CHECKED';
    if (circleEl) circleEl.style.strokeDashoffset = (414.69 - (score / 100) * 414.69).toFixed(2);
    if (titleEl) titleEl.textContent = !checked ? 'Driver status not checked' : (remainingUpdates === 0 ? 'No pending updates reported' : `${remainingUpdates} Driver Update${remainingUpdates > 1 ? 's' : ''} Found`);
    if (descEl) descEl.textContent = !checked ? 'Open Drivers and press CHECK to look for compatible Windows Update packages.' : (remainingUpdates === 0 ? 'Windows Update did not offer compatible driver updates.' : 'Compatible driver updates are available for review.');
    if (stateEl) {
      stateEl.textContent = !checked ? 'Not checked' : (remainingUpdates === 0 ? 'No updates offered' : 'Action Recommended');
      stateEl.className = `metric-value ${!checked ? '' : (remainingUpdates === 0 ? 'status-ok-text' : 'status-warn-text')}`;
    }
    if (countEl) countEl.textContent = checked ? `${remainingUpdates} Package${remainingUpdates === 1 ? '' : 's'}` : 'Not checked';
    if (lastCheckEl) lastCheckEl.textContent = appState.lastCheckLabel;
    const actList = document.getElementById('dashboardActivityList');
    if (actList) {
      const iconMap = { scan: { icon: 'radar', cls: '' }, download: { icon: 'download', cls: '' }, install: { icon: 'check-circle-2', cls: 'success' }, error: { icon: 'alert-triangle', cls: 'error' } };
      actList.innerHTML = appState.history.slice(0, 4).map((ev) => {
        const meta = iconMap[ev.type] || { icon: 'activity', cls: '' };
        return `<div class="activity-row"><div class="activity-left"><div class="activity-badge-icon ${meta.cls}"><i data-lucide="${meta.icon}"></i></div><div><div class="activity-title">${escapeHtml(ev.title)}</div><div class="activity-sub">${escapeHtml(ev.description)}</div></div></div><span class="activity-time">${escapeHtml(ev.time)}</span></div>`;
      }).join('');
    }
  }

  function bindOfficialDriverCenter() {
    const action = document.getElementById('installAllOfficialDriversBtn');
    const check = document.getElementById('checkOfficialDriversBtn');
    if (action) action.addEventListener('click', runOneClickDriverUpdate);
    if (check) check.addEventListener('click', checkOfficialDrivers);
  }
  function setOfficialStatus(message, error = false) {
    const el = document.getElementById('officialDriverStatus');
    if (el) { el.textContent = message; el.style.color = error ? 'var(--error)' : 'var(--text-secondary)'; }
  }
  function renderOfficialDriverResults(items) {
    const root = document.getElementById('officialDriverResults');
    if (!root) return;
    if (!items || !items.length) { root.innerHTML = '<div class="empty-state-card"><p>Windows Update не предложил совместимых обновлений драйверов для этого компьютера.</p></div>'; return; }
    root.innerHTML = items.map(item => '<article class="card-surface" style="padding:13px 16px;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;"><div><strong>' + escapeHtml(item.title || 'Обновление драйвера') + '</strong><div style="color:var(--text-secondary);font-size:12px;margin-top:5px;">' + escapeHtml([item.driverManufacturer,item.driverModel,item.driverProvider].filter(Boolean).join(' • ') || 'Microsoft Windows Update') + '</div><div style="color:var(--text-muted);font-size:11px;margin-top:4px;">Версия: ' + escapeHtml(item.driverVersion || 'не указана') + '</div></div><span class="status-pill status-update-available">ДОСТУПНО</span></article>').join('');
  }
  async function checkOfficialDrivers() {
    const check = document.getElementById('checkOfficialDriversBtn');
    const action = document.getElementById('installAllOfficialDriversBtn');
    if (check) check.disabled = true; if (action) action.disabled = true;
    setOfficialStatus('Проверяю совместимые драйверы через Microsoft Windows Update…');
    try {
      const response = await fetch('/api/driver-updates', {cache:'no-store'}); const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Не удалось проверить обновления');
      const items = result.data.items || []; renderOfficialDriverResults(items);
      appState.driverUpdatesChecked = true;
      appState.pendingDriverUpdates = items.length;
      renderDashboard();
      setOfficialStatus(items.length ? 'Найдено обновлений: ' + items.length + '. Нажми «НАЙТИ И УСТАНОВИТЬ», чтобы загрузить и установить их.' : 'Проверка завершена: подходящих обновлений драйверов нет.');
      if (action) action.disabled = items.length === 0;
      appState.lastCheckLabel = new Date().toLocaleString('ru-RU');
      showToast('Проверка завершена', items.length ? 'Найдено обновлений: ' + items.length : 'Новых драйверов не найдено', items.length ? 'success' : 'info');
      return items;
    } catch (error) { setOfficialStatus('Ошибка проверки: ' + error.message, true); showToast('Не удалось проверить драйверы', error.message, 'error'); return null; }
    finally { if (check) check.disabled = false; }
  }
  async function runOneClickDriverUpdate() {
    const action = document.getElementById('installAllOfficialDriversBtn'); const check = document.getElementById('checkOfficialDriversBtn');
    if (action) action.disabled = true; if (check) check.disabled = true;
    try {
      let response = await fetch('/api/driver-updates', {cache:'no-store'}); let result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Не удалось проверить драйверы');
      const items = result.data.items || []; renderOfficialDriverResults(items);
      appState.driverUpdatesChecked = true; appState.pendingDriverUpdates = items.length; renderDashboard();
      if (!items.length) { setOfficialStatus('Готово. Windows Update не нашёл подходящих обновлений драйверов для этого ПК.'); showToast('Драйверы актуальны', 'Windows Update не предлагает обновлений.', 'success'); return; }
      const names = items.slice(0,5).map(x => '• ' + (x.title || 'Драйвер')).join('\n');
      if (!window.confirm('Найдено обновлений драйверов: ' + items.length + '.\n\n' + names + (items.length>5?'\n• …':'') + '\n\nУстановить их через Microsoft Windows Update? Попроси родителя или взрослого подтвердить установку. Автоматической перезагрузки не будет.')) { setOfficialStatus('Установка отменена. Драйверы не устанавливались.'); return; }
      setOfficialStatus('Загружаю и устанавливаю драйверы через Microsoft Windows Update. Не закрывай приложение…');
      response = await fetch('/api/driver-updates/install-all', {method:'POST',headers:{'Content-Type':'application/json','X-GDC-Confirm':'1'},body:'{}'}); result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Установка не выполнена');
      const data = result.data || {}; const reboot = data.rebootRequired ? ' Требуется перезагрузка Windows.' : ' Перезагрузка не требуется.';
      setOfficialStatus('Операция завершена. Обработано пакетов: ' + (data.found || 0) + '.' + reboot);
      showToast('Установка завершена', 'Обработано пакетов: ' + (data.found || 0) + '.' + reboot, 'success');
      await checkOfficialDrivers();
    } catch (error) { setOfficialStatus('Ошибка установки: ' + error.message + '. Возможно, нужны права администратора или перезагрузка Windows.', true); showToast('Ошибка установки драйверов', error.message, 'error'); }
    finally { if (action) action.disabled = false; if (check) check.disabled = false; }
  }

  function bindScanButtons() {
    const mainScanBtn = document.getElementById('scanPcBtn');
    const topScanBtn = document.getElementById('quickScanTopBtn');
    if (mainScanBtn) mainScanBtn.addEventListener('click', triggerScanPreview);
    if (topScanBtn) topScanBtn.addEventListener('click', () => { switchPage('dashboard'); triggerScanPreview(); });
  }

  async function triggerScanPreview() {
    if (appState.isScanning) return;
    appState.isScanning = true;
    const panel=document.querySelector('.health-panel');
    const btn=document.getElementById('scanPcBtn');
    const top=document.getElementById('quickScanTopBtn');
    const label=document.getElementById('scanBtnText');
    const hint=document.getElementById('scanSubHint');
    if(panel) panel.classList.add('scanning');
    if(btn) btn.disabled=true;
    if(top) top.disabled=true;
    if(label) label.textContent='СКАНИРОВАНИЕ…';
    if(hint) hint.textContent='Получаю реальные данные Windows…';
    try {
      const response=await fetch('/api/system',{cache:'no-store'});
      const result=await response.json();
      if(!response.ok||!result.ok) throw new Error(result.error||'Ошибка сканирования');
      appState={...appState,...result.data};
      appState.lastCheckLabel=new Date().toLocaleString('ru-RU');
      renderAll();
      showToast('Сканирование завершено','Инвентаризация Windows обновлена.','success');
    } catch(error) { showToast('Ошибка сканирования',error.message,'error'); }
    finally {
      appState.isScanning=false;
      if(panel) panel.classList.remove('scanning');
      if(btn) btn.disabled=false;
      if(top) top.disabled=false;
      if(label) label.textContent='СКАНИРОВАТЬ ПК';
      if(hint) hint.textContent='Данные получены непосредственно из Windows';
    }
  }

  function renderHardware() {
    const grid = document.getElementById('hardwareGrid');
    if (!grid) return;
    grid.innerHTML = appState.hardware.map((hw) => `
      <article class="hw-card card-surface"><div><div class="hw-card-top"><div class="hw-title-group"><div class="hw-icon"><i data-lucide="${hw.icon}"></i></div><div><div class="hw-category">${escapeHtml(hw.category)}</div><div class="hw-name">${escapeHtml(hw.name)}</div><div class="hw-vendor">${escapeHtml(hw.vendor)}</div></div></div>${renderStatusPill(hw.status)}</div>
      <div class="hw-specs" style="margin-top: 14px;">${hw.specs.map((s) => `<div class="hw-spec-item"><span class="hw-spec-label">${escapeHtml(s.label)}</span><span class="hw-spec-val">${escapeHtml(s.value)}</span></div>`).join('')}</div></div>
      <div class="hw-card-footer"><span class="hw-driver-ver">Driver: ${escapeHtml(hw.driverVersion)}</span><button class="link-btn" data-hw-details="${escapeHtml(hw.category)}">Specs <i data-lucide="chevron-right"></i></button></div></article>`).join('');
    grid.querySelectorAll('[data-hw-details]').forEach((btn) => btn.addEventListener('click', () => {
      const hw = appState.hardware.find((h) => h.category === btn.getAttribute('data-hw-details'));
      if (hw) openHardwareModal(hw);
    }));
  }

  function bindDriverFilters() {
    document.querySelectorAll('#page-drivers .filter-tab').forEach((tab) => tab.addEventListener('click', () => {
      document.querySelectorAll('#page-drivers .filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      appState.driverFilter = tab.getAttribute('data-category');
      renderDrivers();
      refreshIcons();
    }));
    const searchInput = document.getElementById('driverSearchInput');
    if (searchInput) searchInput.addEventListener('input', (e) => {
      appState.driverSearch = e.target.value.trim().toLowerCase();
      renderDrivers();
      refreshIcons();
    });
  }

  function driverCategory(drv) {
    const value=(drv.category+' '+drv.device+' '+drv.vendor).toLowerCase();
    if(/display|video|graphics|radeon|geforce|nvidia|intel.*(graphics|arc)/.test(value)) return 'Graphics';
    if(/system|chipset|processor|smbus|pci/.test(value)) return 'Chipset';
    if(/audio|sound|media/.test(value)) return 'Audio';
    if(/net|wireless|wi.?fi|ethernet|bluetooth/.test(value)) return 'Network';
    return 'Other';
  }
  function renderDrivers() {
    const list=document.getElementById('driversList'); if(!list) return;
    const filtered=appState.drivers.filter(drv=>{
      const cat=driverCategory(drv);
      const okCat=appState.driverFilter==='All'||cat===appState.driverFilter;
      const okSearch=!appState.driverSearch||[drv.device,drv.vendor,drv.currentVersion,drv.category].join(' ').toLowerCase().includes(appState.driverSearch);
      return okCat&&okSearch;
    });
    if(!filtered.length) { list.innerHTML='<div class="empty-state-card card-surface" style="padding:22px;">Драйверы не найдены. Измени поиск или запусти сканирование ПК.</div>'; return; }
    list.innerHTML=filtered.map(drv=>'<article class="driver-row-card card-surface"><div class="driver-device-icon"><i data-lucide="cpu"></i></div><div class="driver-main-info"><div class="driver-title-line"><span class="driver-device-name">'+escapeHtml(drv.device)+'</span><span class="driver-cat-tag">'+escapeHtml(driverCategory(drv))+'</span></div><div class="driver-vendor-name">'+escapeHtml(drv.vendor)+'</div></div><div class="driver-versions"><div class="ver-col"><span class="ver-lbl">Установленная версия</span><span class="ver-num">'+escapeHtml(drv.currentVersion)+'</span></div><div class="ver-col"><span class="ver-lbl">Новая версия</span><span class="ver-num">Не проверялась</span></div></div><div class="driver-actions">'+renderStatusPill(drv.status)+'<button class="btn-secondary btn-sm" data-drv-details="'+escapeHtml(drv.id)+'">Подробнее</button></div></article>').join('');
    list.querySelectorAll('[data-drv-details]').forEach(btn=>btn.addEventListener('click',()=>{
      const drv=appState.drivers.find(x=>x.id===btn.getAttribute('data-drv-details'));
      if(drv) openDriverModal(drv);
    }));
  }

  async function persistSettings() {
    try {
      const response=await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(appState.settings)});
      if(!response.ok) throw new Error('Не удалось сохранить настройки');
    } catch(error) { showToast('Ошибка настроек',error.message,'error'); }
  }
  async function loadSettings() {
    try {
      const response=await fetch('/api/settings',{cache:'no-store'});
      if(!response.ok) return;
      const saved=await response.json();
      appState.settings={...appState.settings,...saved};
      document.body.classList.toggle('theme-cyan',appState.settings.accent==='cyan');
      document.body.classList.toggle('no-glass',appState.settings.glass===false);
      document.querySelectorAll('#accentSelector .seg-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.accent===appState.settings.accent));
      const glass=document.getElementById('toggleGlass'); if(glass) glass.checked=appState.settings.glass!==false;
      const lang=document.getElementById('languageSelect'); if(lang) lang.value=appState.settings.language||'ru';
      const toast=document.getElementById('toggleToasts'); if(toast) toast.checked=appState.settings.toasts!==false;
      const startup=document.getElementById('toggleStartup'); if(startup) startup.checked=!!saved.startupLaunch;
      fetch('/api/optimization',{cache:'no-store'}).then(r=>r.json()).then(v=>{const el=document.getElementById('toggleStartup');if(v.ok&&el)el.checked=!!v.data.startup;}).catch(()=>{});
    } catch (_) {}
  }
  function bindSettingsControls() {
    document.querySelectorAll('#accentSelector .seg-btn').forEach(btn=>btn.addEventListener('click',()=>{
      document.querySelectorAll('#accentSelector .seg-btn').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active'); appState.settings.accent=btn.dataset.accent;
      document.body.classList.toggle('theme-cyan',btn.dataset.accent==='cyan');
      persistSettings(); showToast('Настройки сохранены','Цвет интерфейса обновлён.','success');
    }));
    const glass=document.getElementById('toggleGlass');
    if(glass) glass.addEventListener('change',e=>{appState.settings.glass=e.target.checked;document.body.classList.toggle('no-glass',!e.target.checked);persistSettings();});
    const lang=document.getElementById('languageSelect');
    if(lang) lang.addEventListener('change',e=>{appState.settings.language=e.target.value;persistSettings();showToast('Настройки сохранены','Язык интерфейса будет применён после полной локализации.','info');});
    const toast=document.getElementById('toggleToasts');
    if(toast) toast.addEventListener('change',e=>{appState.settings.toasts=e.target.checked;persistSettings();});
    const startup=document.getElementById('toggleStartup');
    if(startup) startup.addEventListener('change',async e=>{
      const enabled=e.target.checked;
      if(!window.confirm((enabled?'Добавить':'Убрать')+' Gaming Driver Center из автозапуска Windows?')){e.target.checked=!enabled;return;}
      startup.disabled=true;
      try{
        const response=await fetch('/api/settings/startup',{method:'POST',headers:{'Content-Type':'application/json','X-GDC-Confirm':'1'},body:JSON.stringify({enabled})});
        const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Не удалось изменить автозапуск');
        appState.settings.startupLaunch=enabled;showToast('Настройка сохранена',result.data.message,'success');
      }catch(error){e.target.checked=!enabled;showToast('Ошибка автозапуска',error.message,'error');}
      finally{startup.disabled=false;}
    });
    const reset=document.getElementById('resetDemoBtn');
    if(reset) reset.addEventListener('click',async()=>{
      appState.settings={accent:'violet',glass:true,language:'ru',toasts:true,startupLaunch:!!appState.settings.startupLaunch};
      document.body.classList.remove('theme-cyan','no-glass');
      await persistSettings(); await loadSettings();
      showToast('Настройки сброшены','Восстановлены стандартные настройки приложения.','success');
    });
    loadSettings();
  }

  function bindModalControls() {
    const modal = document.getElementById('detailsModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal && !modal.hidden) closeModal(); });
  }

  function openDriverModal(drv) {
    setModalContent({
      kicker: 'УСТАНОВЛЕННЫЙ ДРАЙВЕР',
      title: drv.device,
      icon: 'cpu',
      bodyHtml: '<div class="modal-kv-grid"><div class="modal-kv-item"><span>Производитель</span><strong>'+escapeHtml(drv.vendor)+'</strong></div><div class="modal-kv-item"><span>Версия</span><strong>'+escapeHtml(drv.currentVersion)+'</strong></div><div class="modal-kv-item"><span>Класс устройства</span><strong>'+escapeHtml(drv.category)+'</strong></div><div class="modal-kv-item"><span>Дата</span><strong>'+escapeHtml(drv.releaseDate||'Не указана')+'</strong></div></div><div class="modal-notes">'+escapeHtml(drv.notes)+'</div>',
      footerHtml: '<button class="btn-primary btn-sm" id="modalDismissBtn">Закрыть</button>'
    });
  }

  function openHardwareModal(hw) {
    setModalContent({
      kicker: `${hw.category.toUpperCase()} TELEMETRY`, title: hw.name, icon: hw.icon,
      bodyHtml: `<div class="modal-kv-grid"><div class="modal-kv-item"><span>Manufacturer</span><strong>${escapeHtml(hw.vendor)}</strong></div><div class="modal-kv-item"><span>Bound Driver</span><strong>${escapeHtml(hw.driverVersion)}</strong></div>${hw.specs.map((s) => `<div class="modal-kv-item"><span>${escapeHtml(s.label)}</span><strong>${escapeHtml(s.value)}</strong></div>`).join('')}</div><div class="modal-notes">Данные считаны из инвентаризации оборудования Windows.</div>`,
      footerHtml: '<button class="btn-primary btn-sm" id="modalDismissBtn">Done</button>'
    });
  }

  function openOptimizationModal(opt) {
    setModalContent({
      kicker: 'GAMING OPTIMIZATION PROFILE', title: opt.title, icon: opt.icon,
      bodyHtml: `<div class="modal-kv-grid"><div class="modal-kv-item"><span>Current State</span><strong>${escapeHtml(opt.status)}</strong></div><div class="modal-kv-item"><span>Estimated Benefit</span><strong>${escapeHtml(opt.impact)}</strong></div></div><div class="modal-notes">${escapeHtml(opt.details)}</div>`,
      footerHtml: `<button class="btn-secondary btn-sm" id="modalDismissBtn">Close</button>${!opt.optimal ? '<button class="btn-primary btn-sm" id="modalActionBtn">Apply Demo Preset</button>' : ''}`,
      onAction: () => {
        opt.optimal = true; opt.status = 'OPTIMAL'; closeModal(); renderOptimization(); refreshIcons();
        showToast('Optimization Applied', `${opt.title} set to Optimal in demo profile.`, 'success');
      }
    });
  }

  function setModalContent({ kicker, title, icon, bodyHtml, footerHtml, onAction }) {
    const modal = document.getElementById('detailsModal');
    if (!modal) return;
    document.getElementById('modalKicker').textContent = kicker;
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalIconWrap').innerHTML = `<i data-lucide="${escapeHtml(icon)}"></i>`;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalFooter').innerHTML = footerHtml;
    modal.hidden = false;
    refreshIcons();
    const dismissBtn = document.getElementById('modalDismissBtn');
    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);
    const actionBtn = document.getElementById('modalActionBtn');
    if (actionBtn && typeof onAction === 'function') actionBtn.addEventListener('click', onAction);
  }

  function closeModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) modal.hidden = true;
  }

  function showToast(title, message, type = 'info') {
    if (!appState.settings.toasts) return;
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const iconMap = { info: 'info', success: 'check-circle-2', warning: 'alert-triangle', error: 'x-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<div class="toast-icon"><i data-lucide="${iconMap[type] || 'info'}"></i></div><div><div class="toast-title">${escapeHtml(title)}</div><div class="toast-msg">${escapeHtml(message)}</div></div>`;
    container.appendChild(toast);
    refreshIcons();
    setTimeout(() => {
      toast.style.opacity = '0'; toast.style.transform = 'translateX(16px)'; toast.style.transition = 'all 0.22s ease';
      setTimeout(() => toast.remove(), 240);
    }, 3400);
  }

  function renderStatusPill(status) {
    const map = { 'UP TO DATE': 'status-up-to-date', 'UPDATE AVAILABLE': 'status-update-available', 'NOT FOUND': 'status-not-found', INSTALLED: 'status-up-to-date', UNKNOWN: 'status-unknown' };
    return `<span class="status-pill ${map[status] || 'status-unknown'}">${escapeHtml(status)}</span>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
