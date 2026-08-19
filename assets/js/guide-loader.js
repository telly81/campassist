(() => {
  const screen = document.getElementById('phoneScreen');
  const scanButton = document.getElementById('scanButton');
  const nameEl = document.getElementById('selectedName');
  const modelEl = document.getElementById('selectedModel');
  const dashboard = document.getElementById('dashboard');
  const components = document.querySelectorAll('.component');

  let selected = {
    name: 'Heizung',
    model: 'Truma Combi 6',
    icon: 'flame',
    guide: 'truma-combi-6'
  };
  let loadedGuide = null;
  let stepIndex = 0;

  function icon(id, cls = 'h-9 w-9') {
    return `<svg class="${cls}"><use href="#i-${id}"></use></svg>`;
  }

  function header(guide) {
    const iconName = guide.icon || selected.icon || 'check';
    return `
      <div class="text-center">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">${guide.vehicleHint || 'Muster Caravan GmbH'}</p>
        <span class="mx-auto mt-5 grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">${icon(iconName)}</span>
        <h3 class="mt-4 text-2xl font-black">${guide.title}</h3>
        <p class="text-sm text-slate-500">${guide.component || selected.name} · ${guide.vehicle || 'WM-007'}</p>
      </div>`;
  }

  async function loadGuide(id) {
    const response = await fetch(`guides/${id}.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Guide nicht gefunden: ${id}`);
    return response.json();
  }

  function renderImage(step) {
    const src = step.image || '';
    return `
      <div class="mt-5 overflow-hidden rounded-2xl bg-slate-100">
        <img src="${src}" alt="${step.title}" class="h-52 w-full object-cover" loading="eager"
          onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden');">
        <div class="hidden grid h-52 place-items-center bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center text-sm text-slate-500">
          <div>
            <div class="text-4xl mb-3">📷</div>
            <b>Bildplatzhalter</b><br>
            ${src || 'Bildpfad fehlt'}
          </div>
        </div>
      </div>`;
  }

  function renderMenu(guide) {
    loadedGuide = guide;
    stepIndex = 0;
    const actions = guide.actions || [{ label: 'Anleitung starten', description: `${guide.steps.length} Schritte`, mode: 'steps' }];
    screen.innerHTML = `
      <div class="screen-in">
        ${header(guide)}
        <div class="mt-5 rounded-xl border-l-4 border-${guide.accent || 'blue'}-500 bg-${guide.accent || 'blue'}-50 p-4 text-sm">
          <b>Direkte Hilfe:</b><br>${guide.description || 'Wählen Sie die gewünschte Anleitung.'}
        </div>
        <div class="mt-5 grid gap-3">
          ${actions.map((action, index) => `
            <button data-action-index="${index}" class="guide-action flex items-center gap-4 rounded-2xl bg-slate-50 p-4 text-left text-slate-900 border border-slate-200">
              <span class="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl">${action.emoji || guide.emoji || '✅'}</span>
              <span><b class="block">${action.label}</b><small class="text-slate-500">${action.description || ''}</small></span>
              <span class="ml-auto text-2xl">›</span>
            </button>`).join('')}
        </div>
        ${(guide.warnings || []).length ? `<div class="mt-5 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-950"><b>Wichtig:</b><ul class="mt-2 list-disc pl-5">${guide.warnings.map(w => `<li>${w}</li>`).join('')}</ul></div>` : ''}
        <p class="mt-5 text-center text-[11px] leading-4 text-slate-400">${guide.disclaimer || 'Fahrzeug- und Herstelleranleitung haben Vorrang.'}</p>
      </div>`;
    document.querySelectorAll('.guide-action').forEach(btn => {
      btn.addEventListener('click', () => renderStep(0));
    });
  }

  function renderStep(index) {
    stepIndex = index;
    const step = loadedGuide.steps[stepIndex];
    const pct = ((stepIndex + 1) / loadedGuide.steps.length) * 100;
    const accent = loadedGuide.accent || 'blue';
    screen.innerHTML = `
      <div class="screen-in">
        <div class="flex items-center justify-between">
          <button id="guideBack" class="font-bold text-blue-600">← Übersicht</button>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">${stepIndex + 1} / ${loadedGuide.steps.length}</span>
        </div>
        <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div class="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-500" style="width:${pct}%"></div>
        </div>
        ${renderImage(step)}
        <p class="mt-5 text-xs font-black uppercase tracking-widest text-slate-500">Schritt ${stepIndex + 1}</p>
        <h3 class="mt-2 text-2xl font-black">${step.title}</h3>
        <p class="mt-3 leading-6 text-slate-600">${step.text}</p>
        ${step.tip ? `<div class="mt-4 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4 text-sm text-amber-950"><b>Wichtig:</b> ${step.tip}</div>` : ''}
        <div class="mt-5 grid grid-cols-2 gap-3">
          <button id="guidePrev" class="rounded-xl border border-slate-200 p-3 font-black ${stepIndex === 0 ? 'pointer-events-none opacity-40' : ''}">Zurück</button>
          <button id="guideNext" class="rounded-xl bg-brand p-3 font-black text-white">${stepIndex === loadedGuide.steps.length - 1 ? 'Abschließen' : 'Weiter'}</button>
        </div>
      </div>`;
    document.getElementById('guideBack').addEventListener('click', () => renderMenu(loadedGuide));
    document.getElementById('guidePrev').addEventListener('click', () => { if (stepIndex > 0) renderStep(stepIndex - 1); });
    document.getElementById('guideNext').addEventListener('click', () => {
      if (stepIndex < loadedGuide.steps.length - 1) renderStep(stepIndex + 1);
      else renderFinished();
    });
  }

  function renderFinished() {
    screen.innerHTML = `
      <div class="screen-in flex min-h-[550px] flex-col items-center justify-center text-center">
        <span class="grid h-24 w-24 place-items-center rounded-full bg-green-100 text-green-600">${icon('check','h-14 w-14')}</span>
        <h3 class="mt-7 text-3xl font-black">${loadedGuide.successTitle || 'Anleitung abgeschlossen.'}</h3>
        <p class="mt-3 max-w-sm text-slate-500">${loadedGuide.successText || 'Die Schritt-für-Schritt-Hilfe wurde erfolgreich abgeschlossen.'}</p>
        ${(loadedGuide.warnings || []).length ? `<div class="mt-6 rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-left text-sm text-red-950"><b>Bitte beachten:</b><ul class="mt-2 list-disc pl-5">${loadedGuide.warnings.map(w => `<li>${w}</li>`).join('')}</ul></div>` : ''}
        <button id="guideAgain" class="mt-7 rounded-xl bg-brand px-6 py-3 font-black text-white">Weitere Hilfe</button>
      </div>`;
    document.getElementById('guideAgain').addEventListener('click', () => renderMenu(loadedGuide));
    if (dashboard) {
      dashboard.classList.remove('hidden');
      setTimeout(() => dashboard.scrollIntoView({behavior:'smooth', block:'center'}), 500);
    }
  }

  function renderScan() {
    screen.innerHTML = `
      <div class="screen-in">
        <div class="text-center">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Muster Caravan GmbH</p>
          <span class="mx-auto mt-5 grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">${icon(selected.icon)}</span>
          <h3 class="mt-4 text-2xl font-black">${selected.model}</h3>
          <p class="text-sm text-slate-500">${selected.name} · WM-007</p>
        </div>
        <div class="relative mx-auto mt-8 h-48 w-48 rounded-3xl bg-slate-50 p-6">
          <div class="grid h-full grid-cols-7 gap-1">${Array.from({length:49},(_,i)=>`<span class="rounded-sm ${i%3?'bg-brand':'bg-slate-200'}"></span>`).join('')}</div>
          <div class="scan-line absolute left-5 right-5 top-5 h-1 bg-teal-400 shadow-[0_0_18px_#14b8a6]"></div>
        </div>
        <div id="jsonGuideRecognition" class="mt-7 space-y-2 text-sm text-slate-400"></div>
      </div>`;
    const lines=['QR-Code erkannt','Fahrzeug WM-007 erkannt', selected.model + ' erkannt','JSON-Anleitung geladen'];
    lines.forEach((x,i)=>setTimeout(()=>{
      const rec=document.getElementById('jsonGuideRecognition');
      if(rec) rec.innerHTML += `<p class="font-bold text-teal-600">✓ ${x}</p>`;
      if(i===lines.length-1) setTimeout(async () => {
        try { renderMenu(await loadGuide(selected.guide)); }
        catch(err) { screen.innerHTML = `<div class="p-6"><b>Guide konnte nicht geladen werden.</b><p class="mt-3 text-sm text-slate-500">${err.message}</p></div>`; }
      }, 300);
    }, 300*(i+1)));
  }

  components.forEach(btn => {
    btn.addEventListener('click', () => {
      selected = {
        name: btn.dataset.name || 'Komponente',
        model: btn.dataset.model || 'Modell',
        icon: btn.dataset.icon || 'check',
        guide: btn.dataset.guide || 'generic'
      };
      if (nameEl) nameEl.textContent = selected.name;
      if (modelEl) modelEl.textContent = selected.model;
      components.forEach(x => x.classList.remove('ring-4','ring-blue-300'));
      btn.classList.add('ring-4','ring-blue-300');
    });
  });

  if (scanButton) {
    scanButton.onclick = (event) => {
      event.preventDefault();
      renderScan();
    };
  }
})();
// ==========================================
// BILDER-PRELOADER (Für lückenloses Laden auf dem Handy)
// ==========================================
(function() {
  function preloadImages(guideKey) {
    if (!window.guides || !window.guides[guideKey]) return;
    const guide = window.guides[guideKey];
    
    // Geht alle Schritte durch und lädt die Bilder im Hintergrund in den Cache
    if (guide.steps && Array.isArray(guide.steps)) {
      guide.steps.forEach(step => {
        if (step.image) {
          const img = new Image();
          img.src = step.image;
        }
      });
    }
  }

  // Hookt sich in den Aufruf von loadGuide ein
  const originalLoadGuide = window.loadGuide;
  window.loadGuide = function(guideKey) {
    if (typeof originalLoadGuide === 'function') {
      originalLoadGuide(guideKey);
    }
    preloadImages(guideKey);
  };
})();
