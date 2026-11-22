(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let statusData = null;
  const say = (message, error=false) => { const el=$('optimizationStatus'); if(el){el.textContent=message;el.style.color=error?'var(--error)':'var(--text-secondary)';} };
  async function api(path, method='GET', body=null) {
    const response=await fetch(path,{method,cache:'no-store',headers:body?{'Content-Type':'application/json','X-GDC-Confirm':'1'}:{},body:body?JSON.stringify(body):undefined});
    const data=await response.json();
    if(!response.ok||!data.ok) throw new Error(data.error||('HTTP '+response.status));
    return data.data||{};
  }
  function render() {
    if(!statusData) return;
    const badge=$('gameModeStatus'), button=$('toggleGameModeBtn');
    if(badge) { badge.textContent=statusData.gameMode===null?'Недоступно':statusData.gameMode?'Включён':'Выключен'; badge.className='status-pill '+(statusData.gameMode?'status-up-to-date':'status-unknown'); }
    if(button) { button.textContent=statusData.gameMode?'Выключить':'Включить'; button.disabled=statusData.gameMode===null; }
  }
  async function load() {
    say('Читаю фактические настройки Windows…');
    try { statusData=await api('/api/optimization'); render(); say('Состояние получено из реестра Windows. Временная папка: '+statusData.tempPath); }
    catch(e) { say('Не удалось прочитать настройки: '+e.message,true); }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const game=$('toggleGameModeBtn'), clean=$('cleanTempBtn');
    if(game) game.addEventListener('click',async()=>{
      if(!statusData||statusData.gameMode===null)return;
      const enabled=!statusData.gameMode;
      if(!confirm((enabled?'Включить':'Выключить')+' игровой режим Windows? Изменится системная настройка текущего пользователя.'))return;
      game.disabled=true;
      try { const result=await api('/api/optimization/game-mode','POST',{enabled}); say(result.message); await load(); }
      catch(e){say('Не удалось изменить игровой режим: '+e.message,true);}
      finally{game.disabled=false;}
    });
    if(clean) clean.addEventListener('click',async()=>{
      if(!confirm('Очистить временные файлы текущего пользователя? Занятые файлы будут пропущены.'))return;
      clean.disabled=true; say('Очищаю временную папку…');
      try { const result=await api('/api/optimization/clean-temp','POST',{}); say(result.message); }
      catch(e){say('Очистка не выполнена: '+e.message,true);}
      finally{clean.disabled=false;}
    });
    load();
  });
})();
