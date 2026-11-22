(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = {items: [], query: '', category: 'all', busy: false};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labels = {runtime:'Компонент Windows',utility:'Программа',gaming:'Игры', 'driver-tool':'Утилита драйверов'};
  function status(message, error=false) {
    const el=$('catalogStatus');
    if (el) { el.textContent=message; el.style.color=error?'var(--danger, #ff6b6b)':'var(--text-secondary)'; }
  }
  async function api(url, options={}) {
    const response=await fetch(url,{cache:'no-store',...options});
    const data=await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || ('HTTP '+response.status));
    return data.data || {};
  }
  function render() {
    const grid=$('catalogGrid'); if (!grid) return;
    const q=state.query.toLocaleLowerCase('ru-RU');
    const items=state.items.filter(x => (state.category==='all'||x.kind===state.category) &&
      [x.name,x.publisher,x.description,x.applies,x.id].join(' ').toLocaleLowerCase('ru-RU').includes(q));
    if (!items.length) {
      grid.innerHTML='<div class="empty-state-card card-surface" style="padding:24px;">Ничего не найдено. Измени запрос или категорию.</div>';
      return;
    }
    grid.innerHTML=items.map(x => {
      const installed=x.installed===true, unknown=x.installed===null;
      const badge=installed?'УСТАНОВЛЕНО':unknown?'СТАТУС НЕИЗВЕСТЕН':'НЕ УСТАНОВЛЕНО';
      const button=installed
        ? '<button class="btn-secondary btn-sm" disabled>Уже установлено</button>'
        : '<button class="btn-primary btn-sm" data-catalog-install="'+esc(x.id)+'" '+(state.busy||!x.installSupported?'disabled':'')+'>Скачать и запустить установщик</button>';
      return '<article class="opt-card card-surface" style="min-height:250px;"><div><div class="opt-top"><div class="opt-icon"><i data-lucide="'+(x.kind==='runtime'?'component':x.kind==='gaming'?'gamepad-2':x.kind==='driver-tool'?'settings':'package')+'"></i></div><span class="status-pill '+(installed?'status-up-to-date':'status-unknown')+'">'+badge+'</span></div>'+
        '<h3 class="opt-title">'+esc(x.name)+'</h3><p class="opt-desc">'+esc(x.description||'')+'</p>'+
        '<p style="font-size:11px;color:var(--text-muted);margin-top:10px;">Издатель: '+esc(x.publisher)+'<br>Для чего: '+esc(x.applies)+
        (x.installedVersion?'<br>Установленная версия: '+esc(x.installedVersion):'')+'</p></div>'+
        '<div class="opt-footer"><span class="opt-impact">'+esc(labels[x.kind]||'Программа')+'</span>'+button+'</div></article>';
    }).join('');
    grid.querySelectorAll('[data-catalog-install]').forEach(btn=>btn.addEventListener('click',()=>install(btn.dataset.catalogInstall)));
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }
  async function load() {
    const refresh=$('catalogRefreshBtn'); if (refresh) refresh.disabled=true;
    status('Проверяю реестр установленных программ Windows…');
    try {
      const data=await api('/api/software-catalog');
      state.items=data.items||[];
      status((data.checked?'Проверка установленных программ завершена. ':'Для проверки нужен Windows.')+
        'В каталоге: '+state.items.length+'. Источники — официальные сайты производителей. '+(data.note||''));
      render();
    } catch(error) { status('Не удалось загрузить каталог: '+error.message,true); }
    finally { if(refresh) refresh.disabled=false; }
  }
  async function install(id) {
    const item=state.items.find(x=>x.id===id); if(!item||state.busy) return;
    const ok=window.confirm('Скачать официальный установщик «'+item.name+'» и проверить его цифровую подпись издателя?\n\nПосле проверки откроется обычное окно установки Windows. Ничего не будет установлено без твоих действий в этом окне. Перед установкой системных компонентов попроси взрослого помочь.');
    if(!ok) return;
    state.busy=true; render(); status('Скачиваю установщик с официального сайта и проверяю цифровую подпись…');
    try {
      const data=await api('/api/software-catalog/install',{method:'POST',headers:{'Content-Type':'application/json','X-GDC-Confirm':'1'},body:JSON.stringify({id})});
      status(data.message+' Издатель: '+data.signer+'. SHA-256: '+data.sha256);
    } catch(error) { status('Установщик не запущен: '+error.message,true); }
    finally { state.busy=false; render(); }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const search=$('catalogSearch'), category=$('catalogCategory'), refresh=$('catalogRefreshBtn');
    if(search) search.addEventListener('input',()=>{state.query=search.value;render();});
    if(category) category.addEventListener('change',()=>{state.category=category.value;render();});
    if(refresh) refresh.addEventListener('click',load);
    load();
  });
})();