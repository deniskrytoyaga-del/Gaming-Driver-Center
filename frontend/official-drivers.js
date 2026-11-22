/* Live official-driver workflow. This file deliberately overrides the old preview-only buttons. */
(function () {
  'use strict';
  function el(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);
    });
  }
  function message(text, isError) {
    var box = el('officialDriverStatus');
    if (box) {
      box.textContent = text;
      box.style.color = isError ? 'var(--danger, #ff6b6b)' : 'var(--text-secondary)';
    }
  }
  async function api(url, options) {
    var response = await fetch(url, options || {cache:'no-store'});
    var data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || ('HTTP ' + response.status));
    return data.data || {};
  }
  function addVendorLinks() {
    var box = el('officialVendorLinks');
    if (!box) return;
    var hw = document.querySelectorAll('#hardwareGrid .hw-name, #hardwareGrid .hw-vendor');
    var text = Array.prototype.map.call(hw, function (n) { return n.textContent.toLowerCase(); }).join(' ');
    var links = [];
    if (text.indexOf('amd') >= 0 || text.indexOf('radeon') >= 0) links.push(['AMD official support','https://www.amd.com/en/support']);
    if (text.indexOf('nvidia') >= 0 || text.indexOf('geforce') >= 0) links.push(['NVIDIA official drivers','https://www.nvidia.com/Download/index.aspx']);
    if (text.indexOf('intel') >= 0) links.push(['Intel official support','https://www.intel.com/content/www/us/en/download-center/home.html']);
    box.innerHTML = links.map(function (x) {
      return '<a class="btn-secondary btn-sm" href="' + x[1] + '" target="_blank" rel="noopener noreferrer">' + x[0] + '</a>';
    }).join('');
  }
  async function checkDrivers() {
    var check = el('checkOfficialDriversBtn');
    var install = el('installAllOfficialDriversBtn');
    var list = el('officialDriverResults');
    if (check) check.disabled = true;
    if (install) install.disabled = true;
    if (list) list.innerHTML = '';
    message('Searching Microsoft Windows Update for driver packages matched to this PC…');
    try {
      var data = await api('/api/driver-updates', {cache:'no-store'});
      var items = data.items || [];
      message(data.message || (items.length ? 'Compatible updates found.' : 'No compatible driver updates were offered.'));
      if (list) {
        list.innerHTML = items.length ? items.map(function (item) {
          return '<article class="card-surface" style="padding:14px;">' +
            '<strong>' + esc(item.title || 'Driver update') + '</strong>' +
            '<div style="color:var(--text-secondary);font-size:12px;margin-top:6px;">Provider: ' +
            esc(item.driverProvider || item.driverManufacturer || 'Not reported') +
            ' · Version: ' + esc(item.driverVersion || 'Not reported') +
            ' · Date: ' + esc(item.driverVerDate || 'Not reported') + '</div></article>';
        }).join('') : '<div class="card-surface" style="padding:14px;">No applicable driver updates were returned by Microsoft Windows Update. This does not mean every manufacturer has no newer driver.</div>';
      }
      if (install) install.disabled = items.length === 0;
    } catch (error) {
      message('Driver check failed: ' + error.message, true);
    } finally {
      if (check) check.disabled = false;
    }
  }
  async function installAll() {
    var button = el('installAllOfficialDriversBtn');
    var list = el('officialDriverResults');
    if (!window.confirm('Install all driver updates currently offered by Microsoft Windows Update? Save open work first. Windows may ask for administrator approval or a restart.')) return;
    if (button) button.disabled = true;
    message('Downloading and installing Windows Update driver packages. Do not turn off the PC…');
    try {
      var data = await api('/api/driver-updates/install-all', {
        method:'POST',
        headers:{'X-GDC-Confirm':'1'}
      });
      var items = data.items || [];
      if (list) list.innerHTML = items.map(function (item) {
        return '<article class="card-surface" style="padding:14px;"><strong>' + esc(item.title || 'Driver') +
          '</strong><div style="color:var(--text-secondary);font-size:12px;">Result code: ' +
          esc(item.resultCode) + ' · HRESULT: ' + esc(item.hresult) + '</div></article>';
      }).join('') || '<div class="card-surface" style="padding:14px;">Windows Update returned no per-driver result details.</div>';
      message('Windows Update finished. ' + (data.rebootRequired ? 'A restart is required.' : 'No restart was reported as required.'));
      if (window.GDCFrontend) {
        var state = window.GDCFrontend.getState();
        state.lastCheckLabel = new Date().toLocaleString();
        window.GDCFrontend.loadExternalData(state);
      }
    } catch (error) {
      message('Installation failed: ' + error.message, true);
      if (button) button.disabled = false;
    }
  }
  function stopPreview(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  document.addEventListener('DOMContentLoaded', function () {
    var check = el('checkOfficialDriversBtn');
    var install = el('installAllOfficialDriversBtn');
    if (check) check.addEventListener('click', checkDrivers);
    if (install) install.addEventListener('click', installAll);
    addVendorLinks();
    var scan = el('scanPcBtn');
    if (scan) scan.addEventListener('click', function (event) {
      stopPreview(event);
      scan.disabled = true;
      message('Refreshing live Windows hardware inventory…');
      api('/api/system', {cache:'no-store'}).then(function (data) {
        if (window.GDCFrontend) window.GDCFrontend.loadExternalData(data);
        message('Hardware inventory refreshed. Run CHECK DRIVERS for compatible updates.');
      }).catch(function (error) {
        message('Hardware scan failed: ' + error.message, true);
      }).finally(function () { scan.disabled = false; });
    }, true);
    document.addEventListener('click', function (event) {
      var fakeDriver = event.target.closest('[data-drv-install]');
      var fakeUpdate = event.target.closest('[data-upd-install], #updateAllBtn, #updateSelectedBtn');
      if (fakeDriver || fakeUpdate) {
        stopPreview(event);
        var page = document.getElementById('page-drivers');
        document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.toggle('active', n.getAttribute('data-page') === 'drivers'); });
        document.querySelectorAll('.page').forEach(function (p) { p.classList.toggle('active', p.id === 'page-drivers'); });
        message('Preview installation is disabled. Use CHECK DRIVERS, then INSTALL ALL for updates supplied by Windows Update.');
        if (page) page.scrollTop = 0;
      }
    }, true);
  });
})();