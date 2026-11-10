(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const routes = ['tradicional', 'propia'];
  const routeSelect = document.getElementById('route-select');
  const map = document.getElementById('map-dialog');
  const curriculum = document.getElementById('deck-curriculum');
  const curriculumOpen = document.getElementById('deck-open-curriculum');
  const menu = document.getElementById('slide-menu');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const status = document.getElementById('deck-status');
  const progress = document.getElementById('deck-progress');
  const position = document.getElementById('position');
  const full = document.getElementById('fullscreen');
  const saved = {tradicional: 0, propia: 0};
  let route = 'tradicional';
  let index = 0;
  let printing = false;
  const currentSlides = () => slides.filter(s => s.dataset.route === route || s.dataset.route === 'comun');
  function menuItems() {
    menu.replaceChildren();
    currentSlides().forEach((slide, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      const number = document.createElement('span');
      number.textContent = String(i + 1).padStart(2, '0');
      button.append(number, document.createTextNode(slide.dataset.title));
      if (i === index) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => { map.close(); go(i); });
      menu.append(button);
    });
  }
  function render(focus = false) {
    const list = currentSlides();
    index = Math.max(0, Math.min(list.length - 1, Math.floor(index)));
    slides.forEach(s => { s.hidden = s !== list[index]; });
    routeSelect.value = route;
    saved[route] = index;
    previous.disabled = index === 0;
    next.disabled = index === list.length - 1;
    next.innerHTML = index === list.length - 1 ? 'Completado <span aria-hidden="true">✓</span>' : 'Siguiente <span aria-hidden="true">→</span>';
    position.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
    progress.style.width = ((index + 1) / list.length * 100) + '%';
    progress.setAttribute('aria-valuemax', String(list.length));
    progress.setAttribute('aria-valuenow', String(index + 1));
    progress.setAttribute('aria-valuetext', (index + 1) + ' de ' + list.length + ': ' + list[index].dataset.title);
    document.title = list[index].dataset.title + ' · Práctica INGECO';
    menuItems();
    if (focus) {
      list[index].querySelector('h1').focus({preventScroll: true});
      window.scrollTo({top: 0, behavior: 'instant'});
    }
  }
  function saveHash() {
    const hash = '#' + new URLSearchParams({ruta: route, pantalla: String(index + 1)}).toString();
    if (location.hash !== hash) history.pushState(null, '', hash);
  }
  function go(i, focus = true) { index = i; render(focus); saveHash(); }
  function switchRoute(value, start = false) {
    if (!routes.includes(value)) return;
    saved[route] = index;
    route = value;
    index = start ? 0 : saved[route];
    render(true);
    saveHash();
  }
  function restore() {
    const params = new URLSearchParams(location.hash.slice(1));
    route = routes.includes(params.get('ruta')) ? params.get('ruta') : 'tradicional';
    const value = Number(params.get('pantalla'));
    index = Number.isFinite(value) && value >= 1 ? Math.floor(value) - 1 : 0;
    render(false);
  }
  previous.addEventListener('click', () => { if (index > 0) go(index - 1); });
  next.addEventListener('click', () => { if (index < currentSlides().length - 1) go(index + 1); });
  document.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => go(index + 1)));
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(Number(b.dataset.go))));
  document.querySelectorAll('[data-route-go]').forEach(b => b.addEventListener('click', () => switchRoute(b.dataset.routeGo, true)));
  routeSelect.addEventListener('change', () => switchRoute(routeSelect.value));
  document.getElementById('open-map').addEventListener('click', () => { menuItems(); map.showModal(); });
  document.getElementById('close-map').addEventListener('click', () => map.close());
  map.addEventListener('click', e => { if (e.target === map) { const r = map.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) map.close(); } });
  const curriculumViewport = document.getElementById('deck-curriculum-viewport');
  const curriculumPicture = document.getElementById('deck-curriculum-picture');
  const curriculumImage = document.getElementById('deck-curriculum-image');
  const curriculumHighlights = document.getElementById('deck-curriculum-highlights');
  const curriculumToggle = document.getElementById('deck-toggle-highlights');
  const curriculumZoom = document.getElementById('deck-zoom-curriculum');
  const curriculumCaption = document.getElementById('deck-curriculum-caption');
  let curriculumZoomed = false;
  function fitCurriculum() {
    if (!curriculum.open) return;
    const width = Math.max(0, curriculumViewport.clientWidth - 2);
    const height = Math.max(0, curriculumViewport.clientHeight - 2);
    if (!width || !height) return;
    curriculumPicture.style.width = (curriculumZoomed ? Math.max(1900, width) : Math.min(width, height * 2384 / 1684)) + 'px';
  }
  function updateCurriculumZoom() {
    curriculumZoom.setAttribute('aria-pressed', String(curriculumZoomed));
    curriculumZoom.textContent = curriculumZoomed ? 'Ajustar a la ventana' : 'Ampliar para leer';
    curriculumImage.src = curriculumZoomed ? 'assets/malla-ingeco-2027.png' : 'assets/malla-ingeco-preview.webp';
    curriculumCaption.textContent = curriculumZoomed ? 'Malla ampliada. Desplázate para leer las asignaturas.' : 'Malla ajustada a la ventana. Amplía para leer las asignaturas.';
    fitCurriculum();
    curriculumViewport.scrollTo({top: 0, left: 0, behavior: 'instant'});
  }
  curriculumOpen.addEventListener('click', e => {
    e.preventDefault();
    curriculumZoomed = false;
    curriculumToggle.checked = true;
    curriculumHighlights.style.display = '';
    curriculum.showModal();
    updateCurriculumZoom();
  });
  document.getElementById('deck-close-curriculum').addEventListener('click', () => {
    curriculum.close();
    curriculumOpen.focus({preventScroll: true});
  });
  curriculumZoom.addEventListener('click', () => { curriculumZoomed = !curriculumZoomed; updateCurriculumZoom(); });
  curriculumToggle.addEventListener('change', () => { curriculumHighlights.style.display = curriculumToggle.checked ? '' : 'none'; });
  curriculum.addEventListener('click', e => {
    if (e.target !== curriculum) return;
    const r = curriculum.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) curriculum.close();
  });
  window.addEventListener('resize', fitCurriculum);
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fitCurriculum).observe(curriculumViewport);
  document.querySelectorAll('[data-sequence]').forEach(sequence => {
    const items = [...sequence.querySelectorAll('li')];
    const reveal = sequence.querySelector('[data-reveal]');
    const caption = sequence.querySelector('[data-sequence-status]');
    let visible = 1;
    function update() {
      items.forEach((item, i) => { item.classList.toggle('is-pending', i >= visible); item.setAttribute('aria-hidden', String(i >= visible)); });
      reveal.disabled = visible === items.length;
      reveal.textContent = visible === items.length ? 'Secuencia completa' : 'Mostrar el siguiente paso';
      caption.textContent = 'Paso ' + visible + ' de ' + items.length;
    }
    reveal.addEventListener('click', () => { visible = Math.min(items.length, visible + 1); update(); });
    sequence.querySelector('[data-reset-sequence]').addEventListener('click', () => { visible = 1; update(); });
    update();
  });
  document.querySelectorAll('[data-check-group]').forEach(group => {
    const checks = [...group.querySelectorAll('input[type="checkbox"]')];
    const caption = group.querySelector('[data-check-status]');
    const label = group.closest('.slide').id === 'tradicional-1' ? 'requisitos' : 'puntos';
    const update = () => { caption.textContent = checks.filter(c => c.checked).length + ' de ' + checks.length + ' ' + label + ' revisados'; };
    checks.forEach(check => check.addEventListener('change', update));
    update();
  });
  document.querySelectorAll('[data-quiz]').forEach(quiz => {
    const buttons = [...quiz.querySelectorAll('[data-answer]')];
    const feedback = quiz.querySelector('.feedback');
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        const correct = button.dataset.correct === 'true';
        feedback.dataset.result = correct ? 'correcto' : 'revisar';
        feedback.textContent = (correct ? 'Correcto. ' : 'Revisemos. ') + button.dataset.feedback;
        feedback.hidden = false;
      });
    });
  });
  const caseButtons = [...document.querySelectorAll('[data-case]')];
  const cases = [...document.querySelectorAll('[data-case-result]')];
  function selectCase(name) {
    caseButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.case === name)));
    cases.forEach(panel => { panel.hidden = panel.dataset.caseResult !== name; });
  }
  caseButtons.forEach(b => b.addEventListener('click', () => selectCase(b.dataset.case)));
  selectCase('espera');
  if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
    full.hidden = false;
    full.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch (_) { status.textContent = 'El navegador no habilitó la pantalla completa. Puedes continuar con la presentación.'; }
    });
    document.addEventListener('fullscreenchange', () => { full.textContent = document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa'; });
  }
  document.addEventListener('keydown', e => {
    if (map.open || curriculum.open || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (e.target.closest('input,select,textarea,button,a,summary,[contenteditable="true"]')) return;
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); if (index < currentSlides().length - 1) go(index + 1); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); if (index > 0) go(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(currentSlides().length - 1); }
    else if (e.key.toLowerCase() === 'm') { e.preventDefault(); menuItems(); map.showModal(); }
  });
  const cleanupPrint = () => { document.body.classList.remove('printing-summary'); printing = false; };
  document.querySelectorAll('[data-print-summary]').forEach(b => b.addEventListener('click', () => {
    if (printing) return;
    printing = true;
    document.body.classList.add('printing-summary');
    try { window.print(); } catch (_) { cleanupPrint(); status.textContent = 'Abre la opción Imprimir del navegador para guardar la lista.'; }
  }));
  window.addEventListener('afterprint', cleanupPrint);
  window.addEventListener('hashchange', restore);
  window.addEventListener('popstate', restore);
  restore();
  document.body.classList.add('js');
})();
