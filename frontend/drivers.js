(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const status = $('officialDriverStatus');
  const results = $('officialDriverResults');
  const checkBtn = $('checkOfficialDriversBtn');
  const installBtn = $('installAllOfficialDriversBtn');
  let checkedItems = [];

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  function setStatus(message, error = false) {
    if (!status) return;
    status.textContent = message;
    status.style.color = error ? 'var(--error)' : 'var(--text-secondary)';
  }

  async function loadVendorLinks() {
    const host = $('officialVendorLinks');
    if (!host) return;
    try {
      const response = await fetch('/api/system', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok || !payload.ok) return;
      const hardware = payload.data.hardware || [];
      const gpuNames = hardware.filter(x => x.category === 'Graphics Card').map(x => x.name).join(' ').toLowerCase();
      const cpuNames = hardware.filter(x => x.category === 'Processor').map(x => x.name).join(' ').toLowerCase();
      const otherNames = hardware.filter(x => x.category === 'Network').map(x => x.name).join(' ').toLowerCase();
      const links = [];
      // GPU download portals are shown only when that GPU vendor is actually detected.
      if (/nvidia|geforce|quadro|rtx/.test(gpuNames)) {
        links.push(['NVIDIA official drivers', 'https://www.nvidia.com/en-us/drivers/']);
      }
      if (/amd|radeon/.test(gpuNames) || /amd|ryzen/.test(cpuNames)) {
        links.push(['AMD official drivers', 'https://www.amd.com/en/support/download/drivers.html']);
      }
      if (/intel|arc|iris|uhd graphics/.test(gpuNames) || /intel/.test(cpuNames + ' ' + otherNames)) {
        links.push(['Intel official drivers', 'https://www.intel.com/content/www/us/en/support/detect.html']);
      }
      if (!links.length) {
        host.textContent = 'No GPU vendor portal was inferred from the detected inventory. Use the laptop manufacturer support page.';
        return;
      }
      host.innerHTML = links.map(([label, url]) =>
        '<a class="btn-secondary btn-sm" target="_blank" rel="noopener noreferrer" href="' +
        url + '">' + escapeHtml(label) + '</a>').join('');
    } catch (_) {
      host.textContent = 'Manufacturer links will appear after the hardware scan.';
    }
  }

  function renderItems(items) {
    if (!results) return;
    if (!items.length) {
      results.innerHTML = '<div class="card-surface" style="padding:14px;color:var(--success);">No applicable driver updates were found. Your installed drivers may already be current, or the laptop manufacturer may provide newer customized packages.</div>';
      return;
    }
    results.innerHTML = items.map((item) => {
      const name = item.title || 'Unnamed driver update';
      const meta = [item.driverManufacturer, item.driverProvider, item.driverModel, item.driverVersion,
        item.driverVerDate].filter(Boolean).join(' • ');
      return '<article class="card-surface" style="padding:14px;">' +
        '<div style="font-weight:600;">' + escapeHtml(name) + '</div>' +
        '<div style="font-size:12px;color:var(--text-secondary);margin-top:5px;">' +
        escapeHtml(meta || 'Matched by Microsoft Windows Update for this computer') + '</div>' +
        '<div style="font-size:11px;color:var(--success);margin-top:7px;">Official Microsoft driver offer • hardware-matched</div>' +
        '</article>';
    }).join('');
  }

  async function checkDrivers() {
    checkBtn.disabled = true;
    installBtn.disabled = true;
    checkedItems = [];
    setStatus('Checking Windows Update for drivers that match this PC…');
    if (results) results.innerHTML = '';
    try {
      const response = await fetch('/api/driver-updates', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Driver check failed');
      checkedItems = payload.data.items || [];
      renderItems(checkedItems);
      installBtn.disabled = checkedItems.length === 0;
      setStatus(payload.data.message + ' Found: ' + checkedItems.length + '.');
    } catch (error) {
      setStatus('Could not check drivers: ' + error.message, true);
    } finally {
      checkBtn.disabled = false;
    }
  }

  async function installAll() {
    if (!checkedItems.length) return;
    const names = checkedItems.slice(0, 5).map(x => '• ' + (x.title || 'Driver update')).join('\n');
    const more = checkedItems.length > 5 ? '\n…and ' + (checkedItems.length - 5) + ' more.' : '';
    const confirmed = window.confirm(
      'Install ' + checkedItems.length + ' driver update(s) offered by Microsoft Windows Update?\n\n' +
      names + more +
      '\n\nThis downloads and installs the listed drivers. Windows may request administrator approval or a restart. The app will not force a restart.'
    );
    if (!confirmed) return;

    checkBtn.disabled = true;
    installBtn.disabled = true;
    setStatus('Downloading and installing official driver updates. This may take several minutes…');
    try {
      const response = await fetch('/api/driver-updates/install-all', { method: 'POST', headers: { 'X-GDC-Confirm': '1' } });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || 'Driver installation failed');
      const data = payload.data;
      const failed = (data.items || []).filter(x => x.resultCode !== 2 && x.resultCode !== 3);
      const success = (data.items || []).length - failed.length;
      setStatus('Finished. Successful: ' + success + '; needs attention: ' + failed.length +
        (data.rebootRequired ? '. Windows reports that a restart is required.' : '. No restart was requested.') +
        ' Run CHECK DRIVERS again to verify the result.');
      if (results && failed.length) {
        results.innerHTML = failed.map(x => '<article class="card-surface" style="padding:12px;">' +
          '<strong>' + escapeHtml(x.title) + '</strong><div style="color:var(--error);font-size:12px;margin-top:5px;">Installation result: ' +
          escapeHtml(x.resultCode) + ' • ' + escapeHtml(x.hresult) + '</div></article>').join('');
      }
      checkedItems = [];
    } catch (error) {
      setStatus('Installation did not complete: ' + error.message, true);
    } finally {
      checkBtn.disabled = false;
      installBtn.disabled = true;
    }
  }

  if (checkBtn) checkBtn.addEventListener('click', checkDrivers);
  if (installBtn) installBtn.addEventListener('click', installAll);
  loadVendorLinks();
})();
