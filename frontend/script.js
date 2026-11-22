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
    lastCheckLabel: 'Today, 14:20 (Demo)',
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

    overview: [
      { id: 'gpu', tag: 'GPU', icon: 'monitor', accentClass: 'cyan-accent', main: 'NVIDIA GeForce RTX 4070 Ti', sub: 'Demo • 12 GB GDDR6X • Game Ready' },
      { id: 'cpu', tag: 'CPU', icon: 'cpu', accentClass: '', main: 'AMD Ryzen 7 7800X3D', sub: 'Demo • 8 Cores / 16 Threads • 5.0 GHz' },
      { id: 'ram', tag: 'RAM', icon: 'memory-stick', accentClass: '', main: '32 GB DDR5 Dual-Channel', sub: 'Demo • 6000 MT/s • EXPO Enabled' },
      { id: 'drivers', tag: 'DRIVERS', icon: 'shield-check', accentClass: 'green-accent', main: '4 / 6 Packages Current', sub: 'Demo • 2 Recommended Updates' }
    ],

    hardware: [
      { category: 'Graphics Card', icon: 'monitor', name: 'NVIDIA GeForce RTX 4070 Ti', vendor: 'ASUS ROG Strix Edition (Demo)', driverVersion: '566.14 WHQL', status: 'UPDATE AVAILABLE', specs: [{ label: 'VRAM', value: '12 GB GDDR6X' }, { label: 'Bus Interface', value: 'PCIe 4.0 x16' }, { label: 'Boost Clock', value: '2760 MHz' }, { label: 'DirectX', value: '12 Ultimate' }] },
      { category: 'Processor', icon: 'cpu', name: 'AMD Ryzen 7 7800X3D', vendor: 'Advanced Micro Devices (Demo)', driverVersion: '6.10.17.152', status: 'UP TO DATE', specs: [{ label: 'Architecture', value: 'Zen 4 + 3D V-Cache' }, { label: 'Cores / Threads', value: '8C / 16T' }, { label: 'L3 Cache', value: '96 MB' }, { label: 'Socket', value: 'AM5' }] },
      { category: 'Motherboard', icon: 'circuit-board', name: 'ROG STRIX B650E-F GAMING WIFI', vendor: 'ASUSTeK Computer Inc. (Demo)', driverVersion: 'BIOS 3042', status: 'UP TO DATE', specs: [{ label: 'Chipset', value: 'AMD B650E' }, { label: 'PCIe Slot', value: 'Gen 5.0 Ready' }, { label: 'Form Factor', value: 'ATX' }, { label: 'TPM Module', value: 'TPM 2.0 Active' }] },
      { category: 'Memory', icon: 'memory-stick', name: 'G.Skill Trident Z5 Neo RGB 32GB', vendor: 'G.Skill International (Demo)', driverVersion: 'SPD Rev 1.2', status: 'UP TO DATE', specs: [{ label: 'Capacity', value: '2 × 16 GB DDR5' }, { label: 'Speed', value: '6000 MT/s' }, { label: 'Timings', value: 'CL30-38-38-96' }, { label: 'Profile', value: 'AMD EXPO I' }] },
      { category: 'Storage', icon: 'hard-drive', name: 'Samsung SSD 990 PRO 2TB', vendor: 'Samsung Electronics (Demo)', driverVersion: '4B2QJXD7', status: 'UP TO DATE', specs: [{ label: 'Protocol', value: 'NVMe 2.0 PCIe 4.0' }, { label: 'Sequential Read', value: '7,450 MB/s' }, { label: 'Health Status', value: '99% (Demo)' }, { label: 'DirectStorage', value: 'Supported' }] },
      { category: 'Network', icon: 'wifi', name: 'Intel Wi-Fi 6E AX210 + 2.5GbE LAN', vendor: 'Intel Corporation (Demo)', driverVersion: '23.80.0.3', status: 'UP TO DATE', specs: [{ label: 'Wi-Fi Band', value: '2.4 / 5 / 6 GHz' }, { label: 'Ethernet Link', value: '2500 Mbps Full' }, { label: 'Low Latency', value: 'QoS Enabled' }, { label: 'Bluetooth', value: 'v5.3' }] },
      { category: 'Audio', icon: 'volume-2', name: 'ROG SupremeFX ALC4080 HD Audio', vendor: 'Realtek / ASUS (Demo)', driverVersion: '6.3.9600.2368', status: 'UPDATE AVAILABLE', specs: [{ label: 'Codec', value: 'ALC4080 + Savitech' }, { label: 'Sample Rate', value: '32-bit / 384 kHz' }, { label: 'Spatial Audio', value: 'DTS Sound Unbound' }, { label: 'Interface', value: 'USB Audio Bus' }] }
    ],

    drivers: [
      { id: 'drv-gpu', category: 'Graphics', icon: 'monitor', device: 'NVIDIA GeForce RTX 4070 Ti', vendor: 'NVIDIA Corporation', currentVersion: '566.14', latestVersion: '572.42 WHQL', status: 'UPDATE AVAILABLE', releaseDate: '2026-11-12', size: '684 MB', notes: 'Game-Ready support for latest AAA titles, DLSS Frame Generation latency improvements, and Reflex stability fixes (Demo Entry).' },
      { id: 'drv-chipset', category: 'Chipset', icon: 'cpu', device: 'AMD B650E PCIe & GPIO Chipset Suite', vendor: 'AMD Inc.', currentVersion: '6.10.17.152', latestVersion: '6.10.17.152', status: 'UP TO DATE', releaseDate: '2026-10-04', size: '62 MB', notes: '3D V-Cache Performance Optimizer and Ryzen Power Plan scheduler definitions are current (Demo Entry).' },
      { id: 'drv-audio', category: 'Audio', icon: 'volume-2', device: 'ROG SupremeFX ALC4080 USB Audio', vendor: 'Realtek Semiconductor', currentVersion: '6.3.9600.2368', latestVersion: '6.3.9600.2410', status: 'UPDATE AVAILABLE', releaseDate: '2026-11-05', size: '148 MB', notes: 'Reduces voice chat buffer jitter and updates Sonic Studio virtual surround routing (Demo Entry).' },
      { id: 'drv-network', category: 'Network', icon: 'wifi', device: 'Intel Wi-Fi 6E AX210 160MHz', vendor: 'Intel Corporation', currentVersion: '23.80.0.3', latestVersion: '23.80.0.3', status: 'UP TO DATE', releaseDate: '2026-09-21', size: '44 MB', notes: '6 GHz channel stability and reduced packet jitter under competitive gaming loads (Demo Entry).' },
      { id: 'drv-peripheral', category: 'Other', icon: 'gamepad-2', device: 'HID Gaming Wireless Receiver', vendor: 'Generic Peripheral Bus', currentVersion: '1.0.4.2', latestVersion: '—', status: 'UNKNOWN', releaseDate: '2026-06-15', size: '12 MB', notes: 'Custom vendor polling driver detected. Manual verification recommended once backend service connects (Demo Entry).' },
      { id: 'drv-capture', category: 'Other', icon: 'usb', device: 'PCIe Capture Bridge Controller', vendor: 'Unassigned Device', currentVersion: 'Not Installed', latestVersion: '2.1.0.8', status: 'NOT FOUND', releaseDate: '2026-08-19', size: '28 MB', notes: 'Hardware ID detected without an active vendor driver package bound in demo profile.' }
    ],

    updates: [
      { id: 'upd-gpu', driverId: 'drv-gpu', name: 'NVIDIA GeForce Game Ready Driver', version: '572.42 WHQL', size: '684 MB', releaseDate: 'Nov 12, 2026', selected: true, state: 'ready', progress: 0 },
      { id: 'upd-audio', driverId: 'drv-audio', name: 'ROG SupremeFX ALC4080 Audio Package', version: '6.3.9600.2410', size: '148 MB', releaseDate: 'Nov 05, 2026', selected: true, state: 'ready', progress: 0 }
    ],

    optimizations: [
      { id: 'opt-gamemode', title: 'Windows Game Mode', icon: 'gamepad-2', description: 'Prioritizes game thread scheduling and suppresses background Windows Update restarts during full-screen play.', status: 'ENABLED', optimal: true, impact: '+4% Frame Consistency', details: 'Windows Game Mode allocates dedicated CPU core affinity and stabilizes frame delivery in DirectX 12 titles (Demo Telemetry).' },
      { id: 'opt-gpu-pref', title: 'Graphics Preferences', icon: 'sparkles', description: 'Hardware-Accelerated GPU Scheduling (HAGS) and High-Performance discrete GPU routing for detected games.', status: 'ENABLED', optimal: true, impact: '-2.4 ms Render Latency', details: 'Offloads frame queue management directly to the RTX 4070 Ti dedicated scheduling processor (Demo Telemetry).' },
      { id: 'opt-power', title: 'Power Mode', icon: 'zap', description: 'High Performance processor state preventing aggressive core parking during sudden scene transitions.', status: 'BALANCED', optimal: false, impact: 'Recommended: High Performance', details: 'Current demo profile uses Balanced power plan. Switching to High Performance keeps boost clocks responsive.' },
      { id: 'opt-startup', title: 'Startup Applications', icon: 'rocket', description: 'Manages non-essential background launchers and overlays that consume RAM at Windows login.', status: '4 HIGH IMPACT', optimal: false, impact: 'Save ~640 MB RAM', details: '4 background updaters are flagged as high startup impact in the current demo snapshot.' },
      { id: 'opt-storage', title: 'Storage Management', icon: 'hard-drive', description: 'NVMe TRIM optimization and DirectStorage pipeline readiness across primary game libraries.', status: 'OPTIMAL', optimal: true, impact: '7,450 MB/s Ready', details: 'Samsung 990 PRO NVMe controller has TRIM active and 412 GB free headroom for shader caches (Demo Telemetry).' }
    ],

    history: [
      { id: 'h-1', type: 'scan', title: 'Full System Hardware & Driver Scan', description: 'Scanned 7 hardware subsystems; identified 2 available driver updates (Demo Log).', time: 'Today, 14:20', badge: 'SCAN COMPLETE' },
      { id: 'h-2', type: 'download', title: 'Release Manifest Synchronized', description: 'Fetched WHQL catalog metadata for NVIDIA RTX 40 Series & AMD AM5 (Demo Log).', time: 'Today, 14:19', badge: 'CATALOG SYNC' },
      { id: 'h-3', type: 'install', title: 'AMD B650E Chipset Suite Updated', description: 'Package v6.10.17.152 verified and applied cleanly (Demo Log).', time: 'Nov 18, 19:45', badge: 'INSTALLED' },
      { id: 'h-4', type: 'error', title: 'PCIe Capture Bridge Driver Missing', description: 'No bound driver package detected for secondary capture device (Demo Alert).', time: 'Nov 15, 11:12', badge: 'ATTENTION' },
      { id: 'h-5', type: 'install', title: 'Intel Wi-Fi 6E AX210 Driver Installed', description: 'Updated wireless adapter firmware & driver to v23.80.0.3 (Demo Log).', time: 'Nov 10, 21:04', badge: 'INSTALLED' }
    ]
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
    bindUpdateBulkActions();
    bindHistoryFilters();
    bindSettingsControls();
    bindModalControls();
    renderAll();
    refreshIcons();
  });

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
    if (titleEl) titleEl.textContent = remainingUpdates === 0 ? 'All Demo Drivers Synchronized' : `${remainingUpdates} Driver Update${remainingUpdates > 1 ? 's' : ''} Recommended`;
    if (descEl) descEl.textContent = remainingUpdates === 0 ? 'Every tracked gaming subsystem is running the latest verified demo revision.' : 'Core chipset and storage controllers are synchronized. Updating remaining packages will unlock latest game-ready optimizations.';
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

  function bindScanButtons() {
    const mainScanBtn = document.getElementById('scanPcBtn');
    const topScanBtn = document.getElementById('quickScanTopBtn');
    if (mainScanBtn) mainScanBtn.addEventListener('click', triggerScanPreview);
    if (topScanBtn) topScanBtn.addEventListener('click', () => { switchPage('dashboard'); triggerScanPreview(); });
  }

  function triggerScanPreview() {
    if (appState.isScanning) return;
    appState.isScanning = true;
    const panel = document.querySelector('.health-panel');
    const btn = document.getElementById('scanPcBtn');
    const btnText = document.getElementById('scanBtnText');
    const hint = document.getElementById('scanSubHint');
    if (panel) panel.classList.add('scanning');
    if (btn) { btn.disabled = true; btn.classList.add('is-scanning'); }
    if (btnText) btnText.textContent = 'SCANNING...';
    if (hint) hint.textContent = 'Inspecting demo hardware registry...';
    setTimeout(() => {
      appState.isScanning = false;
      appState.lastCheckLabel = 'Just now (Demo)';
      if (panel) panel.classList.remove('scanning');
      if (btn) { btn.disabled = false; btn.classList.remove('is-scanning'); }
      if (btnText) btnText.textContent = 'SCAN MY PC';
      if (hint) hint.textContent = 'Simulated frontend diagnostic';
      appState.history.unshift({ id: `h-${Date.now()}`, type: 'scan', title: 'Manual UI Diagnostic Scan Completed', description: 'Verified 7 hardware modules against demo catalog snapshot.', time: 'Just now', badge: 'SCAN COMPLETE' });
      renderDashboard();
      renderHistory();
      refreshIcons();
      showToast('Scan Preview Complete', 'Demo hardware status refreshed across all modules.', 'info');
    }, 1500);
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

  function renderDrivers() {
    const list = document.getElementById('driversList');
    if (!list) return;
    const filtered = appState.drivers.filter((drv) => {
      const matchesCat = appState.driverFilter === 'All' || drv.category === appState.driverFilter;
      const matchesSearch = !appState.driverSearch || drv.device.toLowerCase().includes(appState.driverSearch) || drv.vendor.toLowerCase().includes(appState.driverSearch);
      return matchesCat && matchesSearch;
    });
    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state-card card-surface"><div class="empty-state-icon"><i data-lucide="search-x"></i></div><h3>No matching drivers in current filter</h3><p style="color: var(--text-secondary);">Try clearing your search query or selecting the "All" category tab.</p></div>`;
      return;
    }
    list.innerHTML = filtered.map((drv) => {
      const canInstall = drv.status === 'UPDATE AVAILABLE' || drv.status === 'NOT FOUND';
      const installLabel = drv.status === 'UP TO DATE' ? 'Reinstall' : 'Install';
      return `<article class="driver-row-card card-surface"><div class="driver-device-icon"><i data-lucide="${drv.icon}"></i></div><div class="driver-main-info"><div class="driver-title-line"><span class="driver-device-name">${escapeHtml(drv.device)}</span><span class="driver-cat-tag">${escapeHtml(drv.category)}</span></div><div class="driver-vendor-name">${escapeHtml(drv.vendor)}</div></div>
      <div class="driver-versions"><div class="ver-col"><span class="ver-lbl">Current</span><span class="ver-num">${escapeHtml(drv.currentVersion)}</span></div><div class="ver-col"><span class="ver-lbl">Available</span><span class="ver-num ${canInstall ? 'highlight' : ''}">${escapeHtml(drv.latestVersion)}</span></div></div>
      <div class="driver-actions">${renderStatusPill(drv.status)}<button class="btn-secondary btn-sm" data-drv-details="${escapeHtml(drv.id)}">Details</button><button class="${canInstall ? 'btn-primary' : 'btn-secondary'} btn-sm" data-drv-install="${escapeHtml(drv.id)}" ${drv.status === 'UNKNOWN' ? 'disabled' : ''}>${installLabel}</button></div></article>`;
    }).join('');
    list.querySelectorAll('[data-drv-details]').forEach((btn) => btn.addEventListener('click', () => {
      const drv = appState.drivers.find((d) => d.id === btn.getAttribute('data-drv-details'));
      if (drv) openDriverModal(drv);
    }));
    list.querySelectorAll('[data-drv-install]').forEach((btn) => btn.addEventListener('click', () => {
      const drv = appState.drivers.find((d) => d.id === btn.getAttribute('data-drv-install'));
      if (drv) handleDriverInstallTrigger(drv);
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
      if (pendingCount === 0) { heroTitle.textContent = 'All Queued Packages Deployed'; heroSub.textContent = 'Your demo system has completed all available driver installations.'; }
      else { heroTitle.textContent = `${pendingCount} Driver Update Package${pendingCount > 1 ? 's' : ''} Available`; heroSub.textContent = 'Select individual packages or deploy all queued updates simultaneously.'; }
    }
    if (!list) return;
    if (appState.updates.length === 0) {
      list.innerHTML = `<div class="empty-state-card card-surface"><div class="empty-state-icon"><i data-lucide="check-circle-2"></i></div><h3>Everything is Up to Date</h3><p style="color: var(--text-secondary);">No pending driver updates in the current demo profile.</p></div>`;
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
