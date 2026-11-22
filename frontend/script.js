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
    bindHistoryFilters();
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
    renderUpdates();
    renderOptimization();
    renderHistory();
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
    const remainingUpdates = appState.updates.filter((u) => u.state !== 'completed').length;
    const score = remainingUpdates === 0 ? 100 : remainingUpdates === 1 ? 93 : 86;
    const scoreEl = document.getElementById('healthScoreValue');
    const captionEl = document.getElementById('healthScoreLabel');
    const circleEl = document.getElementById('healthCircle');
    const titleEl = document.getElementById('healthStatusTitle');
    const descEl = document.getElementById('healthStatusDesc');
    const stateEl = document.getElementById('healthDriverState');
    const countEl = document.getElementById('healthUpdatesCount');
    const lastCheckEl = document.getElementById('healthLastCheck');
    if (scoreEl) scoreEl.textContent = `${score}%`;
    if (captionEl) captionEl.textContent = remainingUpdates === 0 ? 'PEAK READY' : 'OPTIMAL';
    if (circleEl) circleEl.style.strokeDashoffset = (414.69 - (score / 100) * 414.69).toFixed(2);
    if (titleEl) titleEl.textContent = appState.updates.length === 0 ? 'Driver status not checked' : (remainingUpdates === 0 ? 'No pending updates reported' : `${remainingUpdates} Driver Update${remainingUpdates > 1 ? 's' : ''} Found`);
    if (descEl) descEl.textContent = appState.updates.length === 0 ? 'Run CHECK DRIVERS to look for compatible updates from Windows Update.' : (remainingUpdates === 0 ? 'No pending driver updates are currently listed.' : 'Compatible driver updates are available for review.');
    if (stateEl) {
      stateEl.textContent = remainingUpdates === 0 ? 'All Up To Date' : 'Action Recommended';
      stateEl.className = `metric-value ${remainingUpdates === 0 ? 'status-ok-text' : 'status-warn-text'}`;
    }
    if (countEl) countEl.textContent = `${remainingUpdates} Package${remainingUpdates === 1 ? '' : 's'}`;
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
      if (!items.length) { setOfficialStatus('Готово. Windows Update не нашёл подходящих обновлений драйверов для этого ПК.'); showToast('Драйверы актуальны', 'Windows Update не предлагает обновлений.', 'success'); return; }
      const names = items.slice(0,5).map(x => '• ' + (x.title || 'Драйвер')).join('\n');
      if (!window.confirm('Найдено обновлений драйверов: ' + items.length + '.\n\n' + names + (items.length>5?'\n• …':'') + '\n\nЗагрузить и установить их через Microsoft Windows Update? Автоматической перезагрузки не будет.')) { setOfficialStatus('Установка отменена. Драйверы не устанавливались.'); return; }
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
    if(/audio|sound/.test(value)) return 'Audio';
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

  function handleDriverInstallTrigger(drv) {
    const existingUpdate = appState.updates.find((u) => u.driverId === drv.id);
    if (existingUpdate && existingUpdate.state !== 'completed') {
      switchPage('updates');
      simulateUpdateProgress(existingUpdate.id);
      return;
    }
    const newUpd = { id: `upd-${drv.id}-${Date.now()}`, driverId: drv.id, name: `${drv.device} Package`, version: drv.latestVersion === '—' ? drv.currentVersion : drv.latestVersion, size: drv.size, releaseDate: drv.releaseDate, selected: true, state: 'ready', progress: 0 };
    appState.updates.unshift(newUpd);
    switchPage('updates');
    renderUpdates();
    refreshIcons();
    simulateUpdateProgress(newUpd.id);
  }

  function bindUpdateBulkActions() {
    const selBtn = document.getElementById('updateSelectedBtn');
    const allBtn = document.getElementById('updateAllBtn');
    if (selBtn) selBtn.addEventListener('click', () => {
      const selected = appState.updates.filter((u) => u.selected && u.state === 'ready');
      if (selected.length === 0) { showToast('No Packages Selected', 'Select at least one ready update package first.', 'warning'); return; }
      selected.forEach((u) => simulateUpdateProgress(u.id));
    });
    if (allBtn) allBtn.addEventListener('click', () => {
      const readyList = appState.updates.filter((u) => u.state === 'ready');
      if (readyList.length === 0) { showToast('Queue Clear', 'No pending updates remain in the demo queue.', 'info'); return; }
      readyList.forEach((u) => simulateUpdateProgress(u.id));
    });
  }

  function renderUpdates() {
    const list = document.getElementById('updatesList');
    const bigNum = document.getElementById('updatesAvailableBig');
    const heroTitle = document.getElementById('updatesHeroTitle');
    const heroSub = document.getElementById('updatesHeroSubtitle');
    const pendingCount = appState.updates.filter((u) => u.state !== 'completed').length;
    if (bigNum) bigNum.textContent = pendingCount;
    if (heroTitle && heroSub) {
      if (pendingCount === 0) { heroTitle.textContent = 'No verified updates listed'; heroSub.textContent = 'Run CHECK DRIVERS to check updates offered for this PC.'; }
      else { heroTitle.textContent = `${pendingCount} Driver Update Package${pendingCount > 1 ? 's' : ''} Available`; heroSub.textContent = 'Select individual packages or deploy all queued updates simultaneously.'; }
    }
    if (!list) return;
    if (appState.updates.length === 0) {
      list.innerHTML = `<div class="empty-state-card card-surface"><div class="empty-state-icon"><i data-lucide="check-circle-2"></i></div><h3>No Verified Updates</h3><p style="color: var(--text-secondary);">No verified updates are listed. Run CHECK DRIVERS to search Windows Update.</p></div>`;
      return;
    }
    list.innerHTML = appState.updates.map((upd) => {
      const isBusy = upd.state === 'downloading' || upd.state === 'installing';
      const isDone = upd.state === 'completed';
      let stageLabel = 'Ready to download';
      if (upd.state === 'downloading') stageLabel = 'Downloading package (UI Preview)...';
      if (upd.state === 'installing') stageLabel = 'Applying driver configuration (UI Preview)...';
      if (isDone) stageLabel = 'Installed (Demo State)';
      return `<article class="update-item-card card-surface"><div class="update-item-top"><div class="update-item-left"><input type="checkbox" class="custom-checkbox" data-upd-check="${escapeHtml(upd.id)}" ${upd.selected ? 'checked' : ''} ${isBusy || isDone ? 'disabled' : ''} aria-label="Select ${escapeHtml(upd.name)}" /><div><div class="driver-device-name">${escapeHtml(upd.name)}</div><div class="update-meta-row"><span class="update-meta-chip"><i data-lucide="tag"></i> v${escapeHtml(upd.version)}</span><span class="update-meta-chip"><i data-lucide="hard-drive"></i> ${escapeHtml(upd.size)}</span><span class="update-meta-chip"><i data-lucide="calendar"></i> ${escapeHtml(upd.releaseDate)}</span></div></div></div><div>${isDone ? '<span class="status-pill status-up-to-date">INSTALLED</span>' : `<button class="btn-primary btn-sm" data-upd-install="${escapeHtml(upd.id)}" ${isBusy ? 'disabled' : ''}><i data-lucide="${isBusy ? 'loader-2' : 'download'}"></i><span>${isBusy ? 'Processing...' : 'Install Update'}</span></button>`}</div></div>
      ${isBusy || isDone ? `<div class="update-progress-wrap"><div class="progress-header"><span class="progress-stage">${stageLabel}</span><span class="progress-pct">${upd.progress}%</span></div><div class="progress-track"><div class="progress-fill" style="width: ${upd.progress}%;"></div></div></div>` : ''}</article>`;
    }).join('');
    list.querySelectorAll('[data-upd-check]').forEach((cb) => cb.addEventListener('change', () => {
      const upd = appState.updates.find((u) => u.id === cb.getAttribute('data-upd-check'));
      if (upd) upd.selected = cb.checked;
    }));
    list.querySelectorAll('[data-upd-install]').forEach((btn) => btn.addEventListener('click', () => simulateUpdateProgress(btn.getAttribute('data-upd-install'))));
  }

  function simulateUpdateProgress(updateId) {
    const upd = appState.updates.find((u) => u.id === updateId);
    if (!upd || upd.state !== 'ready') return;
    upd.state = 'downloading';
    upd.progress = 8;
    renderUpdates();
    refreshIcons();
    const timer = setInterval(() => {
      if (upd.progress < 60) upd.progress += 14;
      else if (upd.progress < 95) { upd.state = 'installing'; upd.progress += 12; }
      else {
        upd.progress = 100;
        upd.state = 'completed';
        clearInterval(timer);
        const drv = appState.drivers.find((d) => d.id === upd.driverId);
        if (drv) { drv.currentVersion = drv.latestVersion !== '—' ? drv.latestVersion : drv.currentVersion; drv.status = 'UP TO DATE'; }
        const pendingLeft = appState.updates.filter((u) => u.state !== 'completed').length;
        const drvOverview = appState.overview.find((o) => o.id === 'drivers');
        if (drvOverview) {
          drvOverview.main = `${6 - pendingLeft} / 6 Packages Current`;
          drvOverview.sub = pendingLeft === 0 ? 'Demo • All Packages Up To Date' : `Demo • ${pendingLeft} Recommended Update`;
        }
        appState.history.unshift({ id: `h-${Date.now()}`, type: 'install', title: `${upd.name} Installed (Demo)`, description: `Simulated deployment of v${upd.version} completed successfully.`, time: 'Just now', badge: 'INSTALLED' });
        renderAll();
        showToast('Update Preview Complete', `${upd.name} marked as up to date.`, 'success');
        return;
      }
      renderUpdates();
      refreshIcons();
    }, 260);
  }

  function renderOptimization() {
    const grid = document.getElementById('optimizationGrid');
    const chip = document.getElementById('optActiveCountChip');
    if (!grid) return;
    const optimalCount = appState.optimizations.filter((o) => o.optimal).length;
    if (chip) chip.innerHTML = `<i data-lucide="zap"></i> ${optimalCount} / ${appState.optimizations.length} Profiles Optimal`;
    grid.innerHTML = appState.optimizations.map((opt) => `
      <article class="opt-card card-surface"><div><div class="opt-top"><div class="opt-icon"><i data-lucide="${opt.icon}"></i></div><span class="status-pill ${opt.optimal ? 'status-up-to-date' : 'status-unknown'}">${escapeHtml(opt.status)}</span></div><h3 class="opt-title">${escapeHtml(opt.title)}</h3><p class="opt-desc">${escapeHtml(opt.description)}</p></div>
      <div class="opt-footer"><span class="opt-impact">${escapeHtml(opt.impact)}</span><button class="btn-secondary btn-sm" data-opt-details="${escapeHtml(opt.id)}">Details</button></div></article>`).join('');
    grid.querySelectorAll('[data-opt-details]').forEach((btn) => btn.addEventListener('click', () => {
      const opt = appState.optimizations.find((o) => o.id === btn.getAttribute('data-opt-details'));
      if (opt) openOptimizationModal(opt);
    }));
  }

  function bindHistoryFilters() {
    document.querySelectorAll('#historyFilterBar .filter-tab').forEach((tab) => tab.addEventListener('click', () => {
      document.querySelectorAll('#historyFilterBar .filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      appState.historyFilter = tab.getAttribute('data-history-type');
      renderHistory();
    }));
  }

  function renderHistory() {
    const container = document.getElementById('historyTimeline');
    if (!container) return;
    const filtered = appState.history.filter((item) => appState.historyFilter === 'all' || item.type === appState.historyFilter);
    container.innerHTML = `<div class="timeline-list">${filtered.map((ev) => `
      <div class="timeline-item type-${escapeHtml(ev.type)}"><span class="timeline-dot"></span><div class="timeline-content"><h4>${escapeHtml(ev.title)}</h4><p>${escapeHtml(ev.description)}</p></div>
      <div class="timeline-meta"><span class="status-pill ${ev.type === 'error' ? 'status-not-found' : ev.type === 'install' ? 'status-up-to-date' : 'status-update-available'}">${escapeHtml(ev.badge)}</span><span class="timeline-time">${escapeHtml(ev.time)}</span></div></div>`).join('')}</div>`;
  }

  function bindSettingsControls() {
    document.querySelectorAll('#accentSelector .seg-btn').forEach((btn) => btn.addEventListener('click', () => {
      document.querySelectorAll('#accentSelector .seg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const accent = btn.getAttribute('data-accent');
      appState.settings.accent = accent;
      document.body.classList.toggle('theme-cyan', accent === 'cyan');
      showToast('Appearance Updated', `Switched primary highlight to ${accent.toUpperCase()}.`, 'info');
    }));
    const glassToggle = document.getElementById('toggleGlass');
    if (glassToggle) glassToggle.addEventListener('change', (e) => {
      appState.settings.glass = e.target.checked;
      document.body.classList.toggle('no-glass', !e.target.checked);
    });
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) langSelect.addEventListener('change', (e) => {
      appState.settings.language = e.target.value;
      showToast('Language Preference Saved', `UI locale set to "${e.target.options[e.target.selectedIndex].text}".`, 'info');
    });
    const toastToggle = document.getElementById('toggleToasts');
    if (toastToggle) toastToggle.addEventListener('change', (e) => { appState.settings.toasts = e.target.checked; });
    const resetBtn = document.getElementById('resetDemoBtn');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      const currentPage = appState.activePage;
      appState = cloneState(INITIAL_DEMO_STATE);
      appState.activePage = currentPage;
      document.body.classList.remove('theme-cyan', 'no-glass');
      document.querySelectorAll('#accentSelector .seg-btn').forEach((b) => b.classList.toggle('active', b.getAttribute('data-accent') === 'violet'));
      const gt = document.getElementById('toggleGlass');
      if (gt) gt.checked = true;
      renderAll();
      showToast('Demo State Restored', 'All simulated updates and counters reset to initial values.', 'info');
    });
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
      kicker: `${drv.category.toUpperCase()} DRIVER PACKAGE`, title: drv.device, icon: drv.icon,
      bodyHtml: `<div class="modal-kv-grid"><div class="modal-kv-item"><span>Vendor</span><strong>${escapeHtml(drv.vendor)}</strong></div><div class="modal-kv-item"><span>Status</span><strong>${escapeHtml(drv.status)}</strong></div><div class="modal-kv-item"><span>Installed Version</span><strong>${escapeHtml(drv.currentVersion)}</strong></div><div class="modal-kv-item"><span>Latest Release</span><strong>${escapeHtml(drv.latestVersion)}</strong></div><div class="modal-kv-item"><span>Release Date</span><strong>${escapeHtml(drv.releaseDate)}</strong></div><div class="modal-kv-item"><span>Package Size</span><strong>${escapeHtml(drv.size)}</strong></div></div><div class="modal-notes">${escapeHtml(drv.notes)}</div>`,
      footerHtml: `<button class="btn-secondary btn-sm" id="modalDismissBtn">Close</button>${drv.status !== 'UNKNOWN' ? '<button class="btn-primary btn-sm" id="modalActionBtn">Queue Package</button>' : ''}`,
      onAction: () => { closeModal(); handleDriverInstallTrigger(drv); }
    });
  }

  function openHardwareModal(hw) {
    setModalContent({
      kicker: `${hw.category.toUpperCase()} TELEMETRY`, title: hw.name, icon: hw.icon,
      bodyHtml: `<div class="modal-kv-grid"><div class="modal-kv-item"><span>Manufacturer</span><strong>${escapeHtml(hw.vendor)}</strong></div><div class="modal-kv-item"><span>Bound Driver</span><strong>${escapeHtml(hw.driverVersion)}</strong></div>${hw.specs.map((s) => `<div class="modal-kv-item"><span>${escapeHtml(s.label)}</span><strong>${escapeHtml(s.value)}</strong></div>`).join('')}</div><div class="modal-notes">Hardware specification displayed from frontend demo profile. Ready to bind live WMI/PCIe telemetry via Python backend.</div>`,
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
    const map = { 'UP TO DATE': 'status-up-to-date', 'UPDATE AVAILABLE': 'status-update-available', 'NOT FOUND': 'status-not-found', UNKNOWN: 'status-unknown' };
    return `<span class="status-pill ${map[status] || 'status-unknown'}">${escapeHtml(status)}</span>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
