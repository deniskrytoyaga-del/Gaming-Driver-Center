(() => {
  'use strict';
  const map = {
    'LOCAL WINDOWS APP':'ЛОКАЛЬНОЕ ПРИЛОЖЕНИЕ WINDOWS','LOCAL SYSTEM MODE':'ЛОКАЛЬНЫЙ РЕЖИМ WINDOWS','PREVIEW MODE':'РЕЖИМ ПРЕДПРОСМОТРА',
    'DASHBOARD':'ГЛАВНАЯ','MY HARDWARE':'МОЁ ОБОРУДОВАНИЕ','DRIVERS':'ДРАЙВЕРЫ','SETTINGS':'НАСТРОЙКИ','OPTIMIZATION':'ОПТИМИЗАЦИЯ',
    'Quick Scan':'Быстрое сканирование','Collapse Menu':'Свернуть меню','DRIVER MANAGEMENT':'УПРАВЛЕНИЕ ДРАЙВЕРАМИ',
    'Welcome back, Gamer.':'С возвращением!','Your gaming system at a glance.':'Состояние игрового компьютера.','SYSTEM HEALTH':'СОСТОЯНИЕ СИСТЕМЫ',
    'RECENT ACTIVITY':'ПОСЛЕДНИЕ ДЕЙСТВИЯ','View Drivers':'К драйверам','My Hardware':'Моё оборудование',
    'Detailed component architecture and bound driver revisions (Live Windows Hardware).':'Сведения о компонентах и установленных драйверах из Windows.',
    'Driver Management':'Управление драйверами','Inspect installed versions, release deltas, and package status across devices.':'Просмотр установленных версий и состояния драйверов устройств.',
    'Filter by device or vendor...':'Поиск по устройству или производителю…','Search drivers':'Поиск драйверов',
    'All':'Все','Graphics':'Графика','Chipset':'Чипсет','Audio':'Звук','Network':'Сеть','Other':'Другое',
    'OFFICIAL DRIVER CENTER':'ЦЕНТР ОБНОВЛЕНИЯ ДРАЙВЕРОВ','CHECK':'ПРОВЕРИТЬ','UPDATES':'ОБНОВЛЕНИЯ',
    'SCAN MY PC':'СКАНИРОВАТЬ ПК','SCAN MY PC':'СКАНИРОВАТЬ ПК','SCAN':'СКАНИРОВАТЬ','SCAN MY PC':'СКАНИРОВАТЬ ПК',
    'Appearance':'Внешний вид','Customize visual contrast, accent highlights, and motion intensity.':'Настройка оформления приложения.',
    'Accent Glow Highlight':'Цвет подсветки','Choose primary highlight emphasis across cards':'Основной цвет выделения элементов',
    'Nebula Violet':'Фиолетовый','Cyber Cyan':'Голубой','Glass Surface Transparency':'Эффект стекла',
    'Enable translucent backdrop blur on panels':'Полупрозрачные панели с размытием фона','Language':'Язык',
    'Interface localization preference for menus and driver notes.':'Язык меню и описаний драйверов.',
    'Display Language':'Язык интерфейса','Applied across navigation and component labels':'Применяется ко всем разделам приложения',
    'Notifications':'Уведомления','Control in-app toast alerts and Game-Ready release banners.':'Настройка уведомлений приложения.',
    'Toast Notifications':'Всплывающие уведомления','Show floating status confirmations for UI actions':'Показывать сообщения о выполненных действиях',
    'About Application':'О приложении','Architecture readiness and frontend module diagnostics.':'Сведения о версии и состоянии приложения.',
    'Application':'Приложение','Frontend Version':'Версия интерфейса','Backend Bridge':'Связь с системой',
    'Disconnected (Demo Mode)':'Нет подключения','Connected (Python IPC)':'Подключено','Service Connected':'Служба подключена',
    'Close':'Закрыть','Done':'Готово','Specs':'Характеристики','Driver:':'Драйвер:',
    'UP TO DATE':'АКТУАЛЬНО','UPDATE AVAILABLE':'ЕСТЬ ОБНОВЛЕНИЕ','NOT FOUND':'НЕ НАЙДЕНО','INSTALLED':'УСТАНОВЛЕНО','UNKNOWN':'НЕИЗВЕСТНО',
    'Not checked':'Не проверено','Not checked yet':'Ещё не проверялось','NOT CHECKED':'НЕ ПРОВЕРЕНО',
    'Driver status not checked':'Состояние драйверов не проверено','No pending updates reported':'Ожидающих обновлений нет',
    'No updates offered':'Обновления не предложены','Action Recommended':'Требуется внимание',
    'Installed version':'Установленная версия','New version':'Новая версия','Не проверялась':'Не проверялась',
    'Component Details':'Сведения о компоненте','PACKAGE SPECIFICATION':'СВЕДЕНИЯ О ПАКЕТЕ',
    'Current State':'Текущее состояние','Estimated Benefit':'Ожидаемый эффект','Manufacturer':'Производитель',
    'Bound Driver':'Установленный драйвер','Driver Status':'Состояние драйверов','Available Updates':'Доступные обновления','Last Check':'Последняя проверка',
    'OPTIMAL':'ОПТИМАЛЬНО','PEAK READY':'ВСЁ В ПОРЯДКЕ','NEEDS REVIEW':'НУЖНА ПРОВЕРКА',
    'Update Available':'Доступно обновление','Not Found':'Не найдено','Installed':'Установлено'
  };
  const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
  function translateText(node){
    let value=node.nodeValue;
    for(const key of keys) value=value.split(key).join(map[key]);
    if(value!==node.nodeValue) node.nodeValue=value;
  }
  function translate(root){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;while((node=walker.nextNode()))translateText(node);
    if(root.querySelectorAll) root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el=>{
      for(const attr of ['placeholder','title','aria-label']) if(el.hasAttribute(attr)){
        let v=el.getAttribute(attr);for(const key of keys)v=v.split(key).join(map[key]);el.setAttribute(attr,v);
      }
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{
    translate(document.body);
    new MutationObserver(records=>records.forEach(r=>{
      r.addedNodes.forEach(n=>{if(n.nodeType===Node.TEXT_NODE)translateText(n);else if(n.nodeType===Node.ELEMENT_NODE)translate(n);});
      if(r.type==='characterData')translateText(r.target);
    })).observe(document.body,{subtree:true,childList:true,characterData:true});
  });
})();
