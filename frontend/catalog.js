(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = {items:[], query:'', category:'all', busy:false};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function status(message, error=false) {
    const el=$('catalogStatus'); if (!el) return;
    el.textContent=message; el.style.color=error?'var(--danger, #ff6b6b)':'var(--text-secondary)';
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
      grid.innerHTML='<div class="empty-state-card card-surface" style="padding:24px;">Ничего не найдено. Попробуй изменить запрос или категорию.</div>';
      return;
    }
    grid.innerHTML=items.map(x => {
      const installed=x.installed===true;
      const unknown=x.installed===null;
      const badge=installed?'УСТАНОВЛЕНО':unknown?'СТАТУС НЕИЗВЕСТЕН':'НЕ УСТАНОВЛЕНО';
      const disabled=state.busy||installed||!x.installSupported;
      return '<article class="opt-card card-surface" style="min-height:230px;"><div><div class="opt-top"><div class="opt-icon"><i data-lucide="'+(x.kind==='runtime'?'component':x.kind==='gaming'?'gamepad-2':'package')+'"></i></div><span class="status-pill '+(installed?'status-up-to-date':'status-unknown')+'">'+badge+'</span></div>'+
        '<h3 class="opt-title">'+esc(x.name)+'</h3><p class="opt-desc">'+esc(x.description||'')+'</p>'+
        '<p style="font-size:11px;color:var(--text-muted);margin-top:10px;">Издатель: '+esc(x.publisher)+'<br>Для чего: '+esc(x.applies)+
        (x.installedVersion?'<br>Версия: '+esc(x.installedVersion):'')+'</p></div>'+
        '<div class="opt-footer"><span class="opt-impact">'+esc(x.kind==='runtime'?'Компонент':x.kind==='gaming'?'Игры':'Программа')+'</span>'+
        (installed?'<button class="btn-secondary btn-sm" disabled>Установлено</button>':'<button class="btn-primary btn-sm" data-catalog-install="'+esc(x.id)+'" '+(disabled?'disabled':'')+'>'+(x.installSupported?'Установить':'winget недоступен')+'</button>')+
        '</div></article>';
    }).join('');
    grid.querySelectorAll('[data-catalog-install]').forEach(btn=>btn.addEventListener('click',()=>install(btn.dataset.catalogInstall)));
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }
  async function load() {
    const refresh=$('catalogRefreshBtn'); if (refresh) refresh.disabled=true;
    status('Проверяю установленные программы и загружаю каталог из winget…');
    try {
      const data=await api('/api/software-catalog');
      state.items=data.items||[];
      status((data.checked?'Проверка установленных программ завершена. ':'winget не найден — установка из каталога недоступна. ')+
        'В каталоге: '+state.items.length+'. Поиск работает по названию, издателю и назначению.');
      render();
    } catch(error) { status('Не удалось загрузить каталог: '+error.message,true); }
    finally { if(refresh) refresh.disabled=false; }
  }
  async function install(id) {
    const item=state.items.find(x=>x.id===id); if(!item||state.busy) return;
    const ok=window.confirm('Установить «'+item.name+'» через Windows Package Manager?\n\nПеред установкой проверь это с родителем или взрослым. Программа будет скачана из настроенных источников winget и установлена в Windows.');
    if(!ok) return;
    state.busy=true; render(); status('Устанавливаю '+item.name+'… Это может занять несколько минут.');
    try {
      const data=await api('/api/software-catalog/install',{method:'POST',headers:{'Content-Type':'application/json','X-GDC-Confirm':'1'},body:JSON.stringify({id})});
      status(data.message||('Установка завершена: '+item.name));
      await load();
    } catch(error) { status('Установка не выполнена: '+error.message,true); }
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