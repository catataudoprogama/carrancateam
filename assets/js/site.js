/* Carranca Team: comportamento da página (sem dependências) */
(function () {
  'use strict';

  var C = window.CARRANCA || {};
  var UNITS = C.unidades || [];
  var MODS = C.modalidades || [];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var DAYS_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function unitById(id) { for (var i = 0; i < UNITS.length; i++) if (UNITS[i].id === id) return UNITS[i]; return null; }
  function modById(id) { for (var i = 0; i < MODS.length; i++) if (MODS[i].id === id) return MODS[i]; return null; }
  function unitLabel(u) { return u.nome + (u.curto && u.nome.indexOf(u.curto) < 0 ? ' (' + u.curto + ')' : ''); }

  /* ---------- analytics (usa o que o cliente instalar depois) ---------- */
  function track(name, data) {
    data = data || {};
    try {
      if (window.dataLayer) window.dataLayer.push(Object.assign({ event: name }, data));
      if (typeof window.gtag === 'function') window.gtag('event', name, data);
      if (typeof window.fbq === 'function' && (name === 'whatsapp_click' || name === 'generate_lead')) window.fbq('track', name === 'generate_lead' ? 'Lead' : 'Contact');
    } catch (e) { /* analytics nunca derruba a página */ }
  }

  /* ---------- WhatsApp ---------- */
  /* cada unidade tem o próprio número e a própria mensagem pronta (config.js); sem unidade, vale o número padrão */
  function waNumber(unitId) {
    var u = unitId ? unitById(unitId) : null;
    return (u && u.whatsapp) || C.whatsapp;
  }
  function waUrl(msg, unitId, number) {
    return 'https://wa.me/' + (number || waNumber(unitId)) + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }
  function unitMsg(u) { return (u && u.mensagem) || ('Olá! Vim pelo site e quero agendar uma aula experimental na Carranca Team' + (u ? ' ' + u.curto : '') + '.'); }
  function fmtPhone(n) {
    var d = String(n || '').replace(/\D/g, '');
    if (d.indexOf('55') === 0 && d.length > 11) d = d.slice(2);
    return d.length === 11 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7) : (d.length === 10 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6) : d);
  }
  function wireWa(a) {
    var unit = a.getAttribute('data-unit'), u = unit ? unitById(unit) : null;
    var msg = a.getAttribute('data-wa') || a.getAttribute('data-msg') || (u ? unitMsg(u) : '');
    a.href = waUrl(msg, unit, a.getAttribute('data-to') === 'mestre' ? C.contatoMestre : null);
    a.target = '_blank';
    a.rel = 'noopener';
    if (!a.__wa) {
      a.__wa = true;
      a.addEventListener('click', function () { track('whatsapp_click', { location: a.getAttribute('data-where') || '', unit: unit || '' }); });
    }
  }
  function wireAll(root) { $$('[data-wa]', root).forEach(wireWa); }
  wireAll();

  /* rodapé: um botão de WhatsApp por unidade */
  var footZaps = $('#footZaps');
  if (footZaps) {
    footZaps.innerHTML = UNITS.map(function (u) {
      return '<li><a href="#" data-wa="' + esc(unitMsg(u)) + '" data-unit="' + esc(u.id) + '" data-where="rodape-' + esc(u.id) + '"><svg class="ic ic--fill"><use href="#i-wa"/></svg><span><b>' + esc(u.curto) + '</b> ' + esc(fmtPhone(waNumber(u.id))) + '</span></a></li>';
    }).join('');
    wireAll(footZaps);
  }

  /* ---------- tempo (fuso de Salvador/Bahia, UTC-3) ---------- */
  function nowBahia() {
    var d = new Date(), day, h, m, s;
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bahia', weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' }).formatToParts(d);
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday];
      h = parseInt(o.hour, 10) % 24; m = parseInt(o.minute, 10); s = parseInt(o.second, 10);
      if (day === undefined || isNaN(h)) throw new Error('intl');
    } catch (e) {
      var b = new Date(d.getTime() + d.getTimezoneOffset() * 60000 - 3 * 3600000);
      day = b.getDay(); h = b.getHours(); m = b.getMinutes(); s = b.getSeconds();
    }
    return { day: day, min: h * 60 + m, t: h * 3600 + m * 60 + s };
  }
  function fmtH(h) {
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return hh + 'h' + (mm ? pad(mm) : '');
  }
  function fmtDays(days) {
    var d = days.slice().sort(function (a, b) { return a - b; });
    var seq = d.length >= 3;
    for (var i = 1; i < d.length; i++) if (d[i] !== d[i - 1] + 1) seq = false;
    if (seq) return DAYS[d[0]] + ' a ' + DAYS[d[d.length - 1]];
    return d.map(function (x) { return DAYS[x]; }).join(' · ');
  }
  function uniq(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }

  /* ---------- aulas a partir das grades ---------- */
  var MOD_KEYS = [
    ['jiu-jitsu', /jiu-jitsu/i], ['judo', /judô/i], ['muay-thai', /muay\s*(thai|tai)/i],
    ['boxe', /boxe/i], ['luta-livre', /luta livre/i], ['mma', /\bmma\b/i]
  ];
  function periodOf(min) { return min < 720 ? 'manhã' : (min < 1020 ? 'tarde' : 'noite'); }
  function parseName(name) {
    var pub = /kids/i.test(name) ? 'kids' : (/adolescente/i.test(name) ? 'adolescente' : 'adulto');
    var mods = MOD_KEYS.filter(function (k) { return k[1].test(name); }).map(function (k) { return k[0]; });
    if (pub === 'kids' && !mods.length) mods = ['jiu-jitsu'];
    return { pub: pub, mods: mods };
  }
  var CLASSES = [];
  UNITS.forEach(function (u) {
    (u.grade || []).forEach(function (row) {
      var hp = row[0].split(':'), min = parseInt(hp[0], 10) * 60 + parseInt(hp[1], 10);
      row[1].forEach(function (name, i) {
        if (!name) return;
        var p = parseName(name);
        CLASSES.push({ id: CLASSES.length, unit: u.id, day: i + 1, hora: row[0], min: min, name: name, pub: p.pub, mods: p.mods, period: periodOf(min) });
      });
    });
  });

  function nextOf(list, now) {
    var best = null;
    list.forEach(function (c) {
      var delta = ((c.day - now.day + 7) % 7) * 86400 + c.min * 60 - now.t;
      if (delta <= 0) delta += 7 * 86400;
      if (!best || delta < best.delta) best = { c: c, delta: delta };
    });
    return best;
  }
  function whenLabel(c, now, delta) {
    if (c.day === now.day && delta < 86400) return 'hoje às ' + c.hora;
    if (c.day === (now.day + 1) % 7 && delta < 2 * 86400) return 'amanhã às ' + c.hora;
    return DAYS_LONG[c.day].replace('-feira', '') + ' às ' + c.hora;
  }
  function countdown(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  function openInfo(u, now) {
    var F = u.funcionamento || {};
    var h = now.t / 3600, today = F[now.day] || [], i;
    for (i = 0; i < today.length; i++) if (h >= today[i][0] && h < today[i][1]) return { open: true, until: today[i][1] };
    for (i = 0; i < today.length; i++) if (h < today[i][0]) return { open: false, when: 'hoje às ' + fmtH(today[i][0]) };
    for (var k = 1; k <= 7; k++) {
      var d = (now.day + k) % 7, slots = F[d] || [];
      if (slots.length) return { open: false, when: (k === 1 ? 'amanhã' : DAYS_LONG[d].replace('-feira', '')) + ' às ' + fmtH(slots[0][0]) };
    }
    return { open: false, when: '' };
  }
  function unitStatus(u, now) {
    if (u.academia) {
      var o = openInfo(u, now);
      return o.open ? { on: true, txt: 'Aberta agora · fecha às ' + fmtH(o.until) } : { on: false, txt: 'Fechada agora · abre ' + o.when };
    }
    var mine = CLASSES.filter(function (c) { return c.unit === u.id; });
    var n = nextOf(mine, now);
    if (!n) return { on: false, txt: 'Consulte os horários' };
    return { on: n.c.day === now.day && n.delta < 86400, txt: 'Próxima aula ' + whenLabel(n.c, now, n.delta) + ' · ' + n.c.name };
  }

  /* ---------- faixa que evolui ao rolar + header ---------- */
  var belt = $('#belt'), beltFill = belt && $('i', belt);
  var BELTS = ['#f2f2f2', '#1f5fd0', '#8a3fd1', '#8b5a2b', '#0d0d0e'];
  var hdr = $('#hdr'), burger = $('#burger'), nav = $('#nav');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? clamp(y / max, 0, 1) : 0;
    if (beltFill) {
      beltFill.style.setProperty('--p', p.toFixed(4));
      beltFill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      var st = Math.min(4, Math.floor(p * 5));
      beltFill.style.setProperty('--bc', BELTS[st]);
      belt.setAttribute('data-s', st);
    }
    hdr.classList.toggle('is-solid', y > 24);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    hdr.classList.toggle('is-menu', open);
    document.body.classList.toggle('is-locked', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  if ('IntersectionObserver' in window) {
    var links = $$('a[href^="#"]', nav).filter(function (a) { return !a.classList.contains('btn'); });
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var secObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-on'); });
        if (map[e.target.id]) map[e.target.id].classList.add('is-on');   /* seção sem link no menu: nenhum fica marcado */
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section[id]').forEach(function (s) { secObs.observe(s); });
  }

  /* ---------- revelar ao rolar ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    rv.forEach(function (el) {
      var sibs = el.parentElement ? $$(':scope > .rv', el.parentElement) : [];
      el.style.setProperty('--d', Math.max(0, sibs.indexOf(el)));
    });
    var rvObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rvObs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    rv.forEach(function (el) { rvObs.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- setas do teclado nas abas ---------- */
  function roving(container, sel) {
    container.addEventListener('keydown', function (e) {
      var keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
      if (keys.indexOf(e.key) < 0) return;
      var tabs = $$(sel, container), i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var n = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[n].focus();
      tabs[n].click();
    });
  }

  /* ======================================================================
     PRÓXIMO TREINO (hero)
     ====================================================================== */
  var nx = { box: $('#nextClass'), what: $('#nextWhat'), where: $('#nextWhere'), time: $('#nextTime'), cls: null };
  var todayName = $('#todayName');
  function renderNext(force) {
    if (!nx.box) return;
    var now = nowBahia();
    if (todayName) todayName.textContent = DAYS_LONG[now.day];
    var n = nextOf(CLASSES, now);
    if (!n) return;
    var u = unitById(n.c.unit);
    if (force || nx.cls !== n.c.id) {
      nx.cls = n.c.id;
      nx.what.textContent = n.c.name;
      nx.where.textContent = u.curto + ' · ' + whenLabel(n.c, now, n.delta);
      nx.box.hidden = false;
    }
    var same = n.c.day === now.day && n.delta < 86400;
    nx.time.classList.toggle('is-txt', !same);
    nx.time.textContent = same ? countdown(n.delta) : (n.c.day === (now.day + 1) % 7 ? 'amanhã ' : DAYS[n.c.day] + ' ') + n.c.hora;
  }
  renderNext(true);
  setInterval(function () { if (!document.hidden) renderNext(); }, 1000);

  /* ======================================================================
     MODALIDADES
     ====================================================================== */
  var modTabs = $('#modTabs'), modPanel = $('#modPanel'), modSel = 0;
  function whereFor(m) {
    var out = [];
    UNITS.forEach(function (u) {
      var cs = CLASSES.filter(function (c) { return c.unit === u.id && c.mods.indexOf(m.id) > -1; });
      if (!cs.length) {
        if (u.academia && (u.modalidades || []).indexOf(m.id) > -1) out.push({ unit: u, line: 'Seg a Sáb · horários pelo WhatsApp' });
        return;
      }
      var days = uniq(cs.map(function (c) { return c.day; }));
      out.push({ unit: u, line: cs.length + (cs.length === 1 ? ' aula' : ' aulas') + ' por semana · ' + fmtDays(days) });
    });
    return out;
  }
  function renderMod(i, focus) {
    modSel = i;
    var m = MODS[i];
    $$('.mod__tab', modTabs).forEach(function (b, k) {
      b.setAttribute('aria-selected', k === i ? 'true' : 'false');
      b.tabIndex = k === i ? 0 : -1;
    });
    var where = whereFor(m);
    modPanel.setAttribute('aria-labelledby', 'modTab-' + m.id);
    modPanel.innerHTML =
      '<span class="mod__ghost" aria-hidden="true">' + esc(m.nome) + '</span>' +
      '<div class="mod__body">' +
        (m.kanji ? '<span class="mod__kanji kanji" aria-hidden="true">' + esc(m.kanji) + '</span>' : '') +
        '<p class="mod__lema">' + esc(m.lema) + '</p>' +
        '<h3 class="mod__name">' + esc(m.nome) + '</h3>' +
        '<p class="mod__txt">' + esc(m.texto) + '</p>' +
        '<ul class="mod__pts">' + m.pontos.map(function (p) { return '<li><svg class="ic"><use href="#i-check"/></svg>' + esc(p) + '</li>'; }).join('') + '</ul>' +
        '<div class="mod__where"><h4>Onde treinar</h4><ul>' +
          where.map(function (w) { return '<li><b>' + esc(w.unit.curto) + '</b><span>' + esc(w.line) + '</span></li>'; }).join('') +
        '</ul></div>' +
        '<div class="cta-row"><a class="btn btn--red btn--lg" href="#agendar" data-open="agenda" data-mod="' + esc(m.id) + '" data-where="modalidade-' + esc(m.id) + '"><svg class="ic"><use href="#i-cal"/></svg>Quero treinar ' + esc(m.nome) + '</a></div>' +
      '</div>';
    if (focus) track('modality_select', { modality: m.id });
  }
  if (modTabs) {
    modTabs.innerHTML = MODS.map(function (m, i) {
      return '<button class="mod__tab" type="button" role="tab" id="modTab-' + esc(m.id) + '" aria-controls="modPanel" data-i="' + i + '"><span class="n">' + pad(i + 1) + '</span><span><b>' + esc(m.nome) + '</b><small>' + esc(m.lema) + '</small></span></button>';
    }).join('');
    modTabs.addEventListener('click', function (e) {
      var b = e.target.closest('.mod__tab');
      if (b) renderMod(parseInt(b.getAttribute('data-i'), 10), true);
    });
    roving(modTabs, '.mod__tab');
    renderMod(0);
  }

  /* ======================================================================
     AGENDAR (modal + formulário → WhatsApp)
     ====================================================================== */
  var QUEM = { eu: 'Eu', filho: 'Meu filho(a)', adolescente: 'Adolescente', familia: 'Eu e minha família' };
  var dlg = $('#agenda'), dlgCtx = $('#agendaCtx'), tpl = $('#tplForm');
  var lastFocus = null;

  function modLabel(id) {
    if (id === 'kids') return 'Carranca Kids';
    var m = modById(id);
    return m ? m.nome : '';
  }
  function mountForm(host) {
    host.appendChild(tpl.content.cloneNode(true));
    var f = $('form', host);
    var su = f.elements.unidade, si = f.elements.interesse;
    su.innerHTML = '<option value="">Ainda não sei</option>' + UNITS.map(function (u) { return '<option value="' + esc(u.id) + '">' + esc(u.curto) + '</option>'; }).join('');
    si.innerHTML = '<option value="">Ainda não sei</option>' + MODS.map(function (m) { return '<option>' + esc(m.nome) + '</option>'; }).join('') + '<option>Carranca Kids</option><option>Musculação (Carranca Fit)</option>';
    f.__ctx = '';
    f.addEventListener('submit', function (e) { e.preventDefault(); submitForm(f); });
    f.elements.nome.addEventListener('input', function () { f.elements.nome.classList.remove('is-bad'); $('.form__err', f).hidden = true; });
    return f;
  }
  function setRadio(f, name, value) {
    $$('input[name="' + name + '"]', f).forEach(function (r) { r.checked = r.value === value; });
  }
  function prefill(f, o) {
    o = o || {};
    f.elements.unidade.value = o.unit || '';
    f.elements.interesse.value = o.mod ? modLabel(o.mod) : '';
    setRadio(f, 'quem', QUEM[o.quem] || 'Eu');
    setRadio(f, 'periodo', o.periodo || '');
    f.__ctx = o.ctx || '';
    f.__where = o.where || '';
  }
  function buildMsg(f) {
    var nome = f.elements.nome.value.trim();
    var quem = (f.querySelector('input[name="quem"]:checked') || {}).value || '';
    var per = (f.querySelector('input[name="periodo"]:checked') || {}).value || '';
    var u = unitById(f.elements.unidade.value);
    var lines = ['Olá! Meu nome é ' + nome + '. Quero agendar uma aula experimental na Carranca Team.'];
    if (quem) lines.push('• Quem vai treinar: ' + quem);
    if (u) lines.push('• Unidade: ' + unitLabel(u));
    if (f.elements.interesse.value) lines.push('• Modalidade: ' + f.elements.interesse.value);
    if (per) lines.push('• Melhor período: ' + per);
    if (f.__ctx) lines.push('• Turma de interesse: ' + f.__ctx);
    lines.push('Vim pelo site.');
    return lines.join('\n');
  }
  function submitForm(f) {
    var nome = f.elements.nome.value.trim();
    if (nome.length < 2) {
      f.elements.nome.classList.add('is-bad');
      $('.form__err', f).hidden = false;
      f.elements.nome.focus();
      return;
    }
    var url = waUrl(buildMsg(f), f.elements.unidade.value);
    track('generate_lead', { unit: f.elements.unidade.value, modality: f.elements.interesse.value, location: f.__where || 'form' });
    /* clique de âncora: abre em nova aba sem cair no bloqueador de pop-up (window.open com noopener devolve null) */
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (dlg && dlg.open) closeAgenda();
  }

  var dlgForm = null;
  function openAgenda(o) {
    o = o || {};
    if (!dlg || typeof dlg.showModal !== 'function' || !tpl) {
      window.open(waUrl('Olá! Vim pelo site e quero agendar uma aula experimental na Carranca Team.'), '_blank', 'noopener');
      return;
    }
    if (!dlgForm) dlgForm = mountForm($('#dlgForm'));
    prefill(dlgForm, o);
    if (o.ctx) { dlgCtx.innerHTML = 'Turma escolhida: <b>' + esc(o.ctx) + '</b>'; dlgCtx.hidden = false; } else { dlgCtx.hidden = true; }
    lastFocus = document.activeElement;
    dlg.showModal();
    document.body.classList.add('is-locked');
    track('open_agenda', { location: o.where || '' });
    setTimeout(function () { dlgForm.elements.nome.focus(); }, 60);
  }
  function closeAgenda() {
    if (dlg.open) dlg.close();
  }
  if (dlg) {
    dlg.addEventListener('close', function () {
      document.body.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-close]')) closeAgenda();
    });
  }
  var fin = $('#finalForm');
  if (fin && tpl) { var ff = mountForm(fin); ff.__where = 'final'; }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-open="agenda"]');
    if (!a) return;
    e.preventDefault();
    var quem = a.getAttribute('data-quem');
    if (nav.classList.contains('is-open')) setMenu(false);
    openAgenda({
      unit: a.getAttribute('data-unit') || '',
      mod: a.getAttribute('data-mod') || '',
      quem: quem || 'eu',
      periodo: a.getAttribute('data-periodo') || '',
      ctx: a.getAttribute('data-ctx') || '',
      where: a.getAttribute('data-where') || ''
    });
  });

  /* ======================================================================
     QUIZ: qual turma é a minha?
     ====================================================================== */
  var quizEl = $('#quiz');
  var W = {
    defesa: { 'jiu-jitsu': 3, 'muay-thai': 2.5, 'luta-livre': 2, boxe: 1.5, mma: 1.5, judo: 1.5 },
    forma: { 'muay-thai': 3, boxe: 3, 'jiu-jitsu': 2, mma: 2, 'luta-livre': 1.5, judo: 1 },
    competir: { 'jiu-jitsu': 3, 'luta-livre': 3, mma: 3, judo: 2.5, 'muay-thai': 2, boxe: 2 },
    foco: { judo: 3, 'jiu-jitsu': 3, boxe: 2, 'muay-thai': 1.5, 'luta-livre': 1.5, mma: 1 }
  };
  var Q = { who: null, goal: null, per: null, step: 0 };
  var Q_WHO = [
    { k: 'adulto', t: 'Eu mesmo', s: 'Adulto, de iniciante a avançado' },
    { k: 'adolescente', t: 'Meu adolescente', s: 'Jiu-Jitsu para adolescentes' },
    { k: 'kids', t: 'Meu filho(a)', s: 'Carranca Kids' },
    { k: 'familia', t: 'Eu e meu filho(a)', s: 'Treinar em família' }
  ];
  var Q_GOAL = [
    { k: 'defesa', t: 'Defesa pessoal', s: 'Confiança para qualquer situação' },
    { k: 'forma', t: 'Condicionamento', s: 'Emagrecer, ganhar fôlego e energia' },
    { k: 'competir', t: 'Competir e evoluir', s: 'Técnica, faixas e campeonatos' },
    { k: 'foco', t: 'Disciplina e foco', s: 'Mente tranquila e rotina firme' }
  ];
  var Q_PER = [
    { k: 'manhã', t: 'Manhã', s: 'Antes do meio-dia' },
    { k: 'tarde', t: 'Tarde', s: 'De 12h às 17h' },
    { k: 'noite', t: 'Noite', s: 'A partir das 17h' },
    { k: '', t: 'Tanto faz', s: 'Mostre as melhores opções' }
  ];
  /* sequência de perguntas: criança e adolescente só têm turma de Jiu-Jitsu/Judô, então pulam o objetivo */
  function seq() { return (Q.who === 'kids' || Q.who === 'adolescente') ? ['who', 'per'] : ['who', 'goal', 'per']; }

  function groups(list) {
    var map = {}, out = [];
    list.forEach(function (c) {
      var k = c.unit + '|' + c.name + '|' + c.hora;
      if (!map[k]) { map[k] = { unit: c.unit, name: c.name, hora: c.hora, min: c.min, pub: c.pub, mods: c.mods, period: c.period, days: [] }; out.push(map[k]); }
      map[k].days.push(c.day);
    });
    return out;
  }
  function pick(pub, goal, per, relax) {
    var list = CLASSES.filter(function (c) { return c.pub === pub; });
    var gs = groups(list);
    gs.forEach(function (g) {
      var w = 0;
      if (goal && W[goal]) g.mods.forEach(function (m) { w = Math.max(w, W[goal][m] || 0); });
      g.score = w + (g.mods.length > 1 ? 0.4 : 0) + g.days.length * 0.12 + (per && g.period === per ? 4 : 0);
    });
    if (per && !relax) {
      var inPer = gs.filter(function (g) { return g.period === per; });
      if (inPer.length) gs = inPer;
    }
    gs.sort(function (a, b) { return b.score - a.score || a.min - b.min; });
    var seen = {}, res = [];
    gs.forEach(function (g) {
      var k = g.unit + '|' + g.name;
      if (!seen[k]) { seen[k] = 1; res.push(g); }
    });
    return res;
  }
  function recommend() {
    var per = Q.per, out = [], missed = false;
    function take(pub, n, label) {
      var r = pick(pub, Q.goal, per, false).slice(0, n);
      if (per && r.length && r[0].period !== per) missed = true;
      r.forEach(function (g) { g.label = label; out.push(g); });
    }
    if (Q.who === 'kids') take('kids', 3, 'Para o seu filho(a)');
    else if (Q.who === 'adolescente') take('adolescente', 3, 'Para o seu adolescente');
    else if (Q.who === 'familia') { take('adulto', 2, 'Para você'); take('kids', 1, 'Para o seu filho(a)'); }
    else take('adulto', 3, '');
    return { list: out, missed: missed };
  }
  function groupLine(g) {
    var u = unitById(g.unit);
    return u.curto + ' · ' + fmtDays(g.days) + ' · ' + g.hora;
  }
  function ctxOf(g) { return g.name + ' · ' + fmtDays(g.days) + ' ' + g.hora + ' · ' + unitById(g.unit).curto; }
  function quemKey() { return Q.who === 'kids' ? 'filho' : (Q.who === 'adolescente' ? 'adolescente' : (Q.who === 'familia' ? 'familia' : 'eu')); }

  var Q_TITLE = { who: 'Quem vai treinar?', goal: 'O que você mais quer?', per: 'Qual período é melhor?' };
  var Q_OPTS = { who: Q_WHO, goal: Q_GOAL, per: Q_PER };
  function renderQuiz() {
    if (!quizEl) return;
    var steps = seq(), key = steps[Q.step], h;
    if (!key) {
      h = resultHtml();
    } else {
      var bars = '';
      for (var i = 0; i < steps.length; i++) bars += '<i class="' + (i <= Q.step ? 'on' : '') + '"></i>';
      h = '<div class="quiz__top"><div class="quiz__steps">' + bars + '</div><span class="quiz__n">Passo ' + (Q.step + 1) + ' de ' + steps.length + '</span></div>' +
        '<h3 class="quiz__q">' + Q_TITLE[key] + '</h3>' +
        '<div class="opts">' + Q_OPTS[key].map(function (o) {
          return '<button class="opt" type="button" data-q="' + key + '" data-k="' + esc(o.k) + '"><b>' + esc(o.t) + '</b><span>' + esc(o.s) + '</span></button>';
        }).join('') + '</div>' +
        (Q.step > 0 ? '<button class="quiz__back" type="button" data-back>Voltar</button>' : '');
    }
    quizEl.innerHTML = h;
  }
  function resultHtml() {
    var r = recommend();
    var h = '<p class="res__t">Resultado</p><h3 class="res__h">' + (r.list.length ? 'Sua turma ideal' : 'Vamos achar a sua turma') + '</h3>';
    if (r.missed) h += '<p style="margin:-8px 0 16px;color:#d6d6da">Neste período temos poucas turmas para esse perfil. Estas são as mais próximas:</p>';
    h += '<div class="res__list">';
    r.list.forEach(function (g, i) {
      var primary = g.mods[0] || '';
      var mod = g.pub === 'kids' ? 'kids' : primary;
      h += '<div class="rc' + (i === 0 ? ' rc--top' : '') + '"><div>' +
        (i === 0 ? '<span class="rc__badge">Melhor combinação</span>' : (g.label ? '<span class="rc__badge" style="background:var(--steel2)">' + esc(g.label) + '</span>' : '')) +
        (i === 0 && g.label ? '<span style="display:block;font-size:13px;color:var(--mute)">' + esc(g.label) + '</span>' : '') +
        '<b>' + esc(g.name) + '</b><span>' + esc(groupLine(g)) + '</span></div>' +
        '<a class="btn btn--red btn--sm" href="#agendar" data-open="agenda" data-unit="' + esc(g.unit) + '" data-mod="' + esc(mod) + '" data-quem="' + (g.pub === 'kids' ? 'filho' : (g.pub === 'adolescente' ? 'adolescente' : 'eu')) + '" data-periodo="' + esc(g.period) + '" data-ctx="' + esc(ctxOf(g)) + '" data-where="quiz">Quero esta turma</a></div>';
    });
    h += '</div>';
    if ((Q.goal === 'forma') && (Q.who === 'adulto' || Q.who === 'familia')) {
      h += '<div class="res__fit"><b>Quer somar musculação?</b> A Carranca Fit funciona de segunda a sábado e divulga Gympass e TotalPass.</div>';
    }
    h += '<div class="res__acts"><a class="btn btn--wa" href="#" data-wa="Olá! Fiz o quiz no site e quero ajuda para escolher minha turma. ' + esc(quizSummary()) + '" data-where="quiz-result"><svg class="ic ic--fill"><use href="#i-wa"/></svg>Falar com a equipe</a><button class="quiz__back" type="button" data-restart style="margin:0">Refazer o quiz</button></div>';
    return h;
  }
  function quizSummary() {
    var w = Q_WHO.filter(function (o) { return o.k === Q.who; })[0];
    var g = Q_GOAL.filter(function (o) { return o.k === Q.goal; })[0];
    var s = 'Quem treina: ' + (w ? w.t : '-') + '.';
    if (g) s += ' Objetivo: ' + g.t + '.';
    if (Q.per) s += ' Período: ' + Q.per + '.';
    return s;
  }
  if (quizEl) {
    quizEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-q]');
      if (b) {
        var key = b.getAttribute('data-q'), k = b.getAttribute('data-k');
        if (key === 'who') { Q.who = k; Q.goal = null; Q.per = null; }
        else if (key === 'goal') Q.goal = k;
        else Q.per = k;
        Q.step++;
        if (Q.step >= seq().length) track('quiz_complete', { who: Q.who, goal: Q.goal, period: Q.per });
        renderQuiz();
        wireAll(quizEl);
        return;
      }
      if (e.target.closest('[data-back]')) {
        Q.step = Math.max(0, Q.step - 1);
        renderQuiz();
        return;
      }
      if (e.target.closest('[data-restart]')) {
        Q = { who: null, goal: null, per: null, step: 0 };
        renderQuiz();
      }
    });
    renderQuiz();
  }

  /* ======================================================================
     HORÁRIOS
     ====================================================================== */
  var SCH = { unit: 'jardim', filter: 'todos', day: null };
  var FILTERS = [['todos', 'Todos'], ['adulto', 'Adultos'], ['adolescente', 'Adolescentes'], ['kids', 'Kids']];
  var schedUnits = $('#schedUnits'), schedBody = $('#schedBody'), schedFilter = $('#schedFilter'), schedBar = $('#schedBar');

  function clsBtn(c) {
    var dim = SCH.filter !== 'todos' && c.pub !== SCH.filter;
    return '<button class="cls' + (dim ? ' is-dim' : '') + '" type="button" data-c="' + c.id + '" aria-label="' + esc(c.name + ', ' + DAYS_LONG[c.day] + ' às ' + c.hora + '. Agendar aula experimental') + '">' + esc(c.name) + '</button>';
  }
  function infoBar(u) {
    var h = '<div class="sched__info">';
    h += '<span><svg class="ic"><use href="#i-pin"/></svg>' + esc(u.nome) + (u.enderecoPeloZap ? ' · endereço pelo WhatsApp' : ' · ' + esc(u.endereco)) + '</span>';
    /* (a unidade sem ficha no Google Maps não tem rota: o endereço sai pelo WhatsApp) */
    var st = unitStatus(u, nowBahia());
    h += '<span><svg class="ic"><use href="#i-clock"/></svg>' + esc(st.txt) + '</span>';
    if (u.lat) h += '<a href="https://www.google.com/maps/dir/?api=1&destination=' + u.lat + ',' + u.lng + '" target="_blank" rel="noopener" data-track="rota" aria-label="' + esc('Como chegar: ' + u.nome) + '">Como chegar</a>';
    h += '</div>';
    return h;
  }
  function renderSched() {
    var u = unitById(SCH.unit), now = nowBahia();
    $$('.su', schedUnits).forEach(function (b) {
      var on = b.getAttribute('data-u') === SCH.unit;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    schedBody.setAttribute('aria-labelledby', 'schTab-' + SCH.unit);   /* o painel da grade tem o nome da aba escolhida */
    schedBar.hidden = !!u.academia;
    $$('button', schedFilter).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === SCH.filter ? 'true' : 'false'); });
    var h = infoBar(u);

    if (u.academia) {
      var F = u.funcionamento;
      h += '<div class="fitbox"><div class="fitbox__h"><h3>Horário de funcionamento</h3>' +
        '<div class="fh"><span>Segunda a sexta · manhã</span><b>' + fmtH(F[1][0][0]) + ' às ' + fmtH(F[1][0][1]) + '</b></div>' +
        '<div class="fh"><span>Segunda a sexta · tarde e noite</span><b>' + fmtH(F[1][1][0]) + ' às ' + fmtH(F[1][1][1]) + '</b></div>' +
        '<div class="fh"><span>Sábado</span><b>' + fmtH(F[6][0][0]) + ' às ' + fmtH(F[6][0][1]) + '</b></div>' +
        (u.grade && u.grade.length ? '<p class="fitbox__sub">Aulas</p>' + groups(CLASSES.filter(function (c) { return c.unit === u.id; })).map(function (g) {
          return '<div class="fh"><span>' + esc(g.name) + ' · ' + fmtDays(g.days) + '</span><b>' + g.hora + '</b></div>';
        }).join('') : '') + '</div>' +
        '<div class="fitbox__s"><ul class="tags tags--solid"><li>Musculação</li><li>Muay Thai</li></ul>' +
        '<ul class="tags">' + (u.beneficios || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '<li>Todos os níveis</li></ul>' +
        '<p style="color:var(--mute);font-size:15px">Treinos para todos os níveis. Agende uma visita e conheça o espaço.</p>' +
        '<a class="btn btn--red" href="#agendar" data-open="agenda" data-unit="fit" data-mod="" data-where="horarios-fit"><svg class="ic"><use href="#i-cal"/></svg>Agendar visita</a></div></div>';
      schedBody.innerHTML = h;
      return;
    }

    var mine = CLASSES.filter(function (c) { return c.unit === u.id; });
    var rows = uniq((u.grade || []).map(function (r) { return r[0]; }));
    var days = [1, 2, 3, 4, 5, 6];
    var lastDay = mine.reduce(function (m, c) { return Math.max(m, c.day); }, 0);
    if (lastDay < 6) days = [1, 2, 3, 4, 5].slice(0, Math.max(5, lastDay));

    /* grade (desktop) */
    h += '<div class="grid" style="grid-template-columns:86px repeat(' + days.length + ',minmax(0,1fr))"><div class="gh"></div>';
    days.forEach(function (d) { h += '<div class="gh' + (d === now.day ? ' is-today' : '') + '">' + DAYS[d] + '</div>'; });
    rows.forEach(function (hr) {
      h += '<div class="gt">' + hr + '</div>';
      days.forEach(function (d) {
        var cs = mine.filter(function (c) { return c.day === d && c.hora === hr; });
        h += '<div class="gc' + (d === now.day ? ' is-today' : '') + '">' + cs.map(clsBtn).join('') + '</div>';
      });
    });
    h += '</div>';

    /* dia a dia (celular) */
    if (!SCH.day) SCH.day = (now.day >= 1 && now.day <= 6) ? now.day : 1;
    h += '<div class="dayview"><div class="pills" role="group" aria-label="Dia da semana">' + days.map(function (d) {
      return '<button type="button" data-d="' + d + '" aria-pressed="' + (d === SCH.day ? 'true' : 'false') + '" class="' + (d === now.day ? 'is-today' : '') + '">' + DAYS[d] + '</button>';
    }).join('') + '</div><div class="dv" id="dv">' + dayHtml(mine, rows) + '</div></div>';

    if (u.parcial) h += '<p class="sched__partial">Esta é a grade que temos publicada. Para os demais horários de adultos, <a href="#" data-wa="Olá! Quero saber a grade completa de horários da unidade ' + esc(u.curto) + '." data-unit="' + esc(u.id) + '" data-where="grade-parcial" style="color:#fff;font-weight:700">confirme no WhatsApp</a>.</p>';
    schedBody.innerHTML = h;
    wireAll(schedBody);
  }
  function dayHtml(mine, rows) {
    var out = '', any = false;
    rows.forEach(function (hr) {
      var cs = mine.filter(function (c) { return c.day === SCH.day && c.hora === hr; });
      if (!cs.length) return;
      any = true;
      out += '<div class="dv__row"><div class="dv__t">' + hr + '</div><div class="dv__c">' + cs.map(clsBtn).join('') + '</div></div>';
    });
    return any ? out : '<p class="dv__empty">Sem aulas neste dia nesta unidade. Veja outro dia.</p>';
  }
  if (schedUnits) {
    schedUnits.innerHTML = UNITS.map(function (u) {
      return '<button class="su" type="button" role="tab" id="schTab-' + esc(u.id) + '" aria-controls="schedBody" data-u="' + esc(u.id) + '"><b>' + esc(u.curto) + '</b><small>' + esc(u.tag || u.nome) + '</small></button>';
    }).join('');
    schedFilter.innerHTML = FILTERS.map(function (f) { return '<button type="button" data-f="' + f[0] + '" aria-pressed="false">' + f[1] + '</button>'; }).join('');
    schedUnits.addEventListener('click', function (e) {
      var b = e.target.closest('.su');
      if (b) { SCH.unit = b.getAttribute('data-u'); renderSched(); }
    });
    roving(schedUnits, '.su');
    schedFilter.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) { SCH.filter = b.getAttribute('data-f'); renderSched(); }
    });
    schedBody.addEventListener('click', function (e) {
      var p = e.target.closest('.pills button');
      if (p) { SCH.day = parseInt(p.getAttribute('data-d'), 10); renderSched(); return; }
      var b = e.target.closest('.cls');
      if (!b) return;
      var c = CLASSES[parseInt(b.getAttribute('data-c'), 10)];
      track('schedule_class_click', { unit: c.unit, cls: c.name });
      openAgenda({
        unit: c.unit,
        mod: c.pub === 'kids' ? 'kids' : (c.mods[0] || ''),
        quem: c.pub === 'kids' ? 'filho' : (c.pub === 'adolescente' ? 'adolescente' : 'eu'),
        periodo: c.period,
        ctx: c.name + ' · ' + DAYS_LONG[c.day] + ' ' + c.hora + ' · ' + unitById(c.unit).curto,
        where: 'horarios'
      });
    });
    renderSched();
    setInterval(function () { if (!document.hidden) { var info = $('.sched__info', schedBody); if (info) { var u = unitById(SCH.unit); info.outerHTML = infoBar(u); } } }, 60000);
  }

  /* ---------- Kids: horários por unidade ---------- */
  var kh = $('#kidsHours');
  if (kh) {
    kh.innerHTML = UNITS.map(function (u) {
      var cs = CLASSES.filter(function (c) { return c.unit === u.id && c.pub === 'kids'; });
      if (!cs.length) return '';
      var days = uniq(cs.map(function (c) { return c.day; }));
      var times = uniq(cs.map(function (c) { return c.hora; })).sort();
      return '<a class="kh" href="#horarios" data-pick="' + esc(u.id) + '" data-filter="kids" style="text-decoration:none;color:inherit"><b>' + esc(u.curto) + '</b><span>' + fmtDays(days) + ' · ' + times.join(' · ') + '</span></a>';
    }).join('');
  }

  /* ======================================================================
     UNIDADES + MAPA
     ====================================================================== */
  var cards = $('#unitCards'), mapTabs = $('#mapTabs'), mapFrame = $('#mapFrame'), mapRoute = $('#mapRoute');
  var geoUnits = UNITS.filter(function (u) { return u.lat; });
  var MAP = { unit: geoUnits.length ? geoUnits[0].id : null };

  function renderCards() {
    var now = nowBahia();
    cards.innerHTML = UNITS.map(function (u) {
      var st = unitStatus(u, now);
      var acts = '';
      var needAddr = u.enderecoPeloZap && !u.lat;   /* sem pino no mapa: o endereço sai pelo WhatsApp */
      /* aria-label repete o texto visível e acrescenta a unidade, para os links iguais dos 4 cartões não soarem idênticos */
      if (u.lat) acts += '<a class="chip" href="https://www.google.com/maps/dir/?api=1&destination=' + u.lat + ',' + u.lng + '" target="_blank" rel="noopener" data-track="rota" aria-label="' + esc('Como chegar: ' + u.nome) + '"><svg class="ic"><use href="#i-pin"/></svg>Como chegar</a>';
      acts += '<a class="chip chip--wa" href="#" data-wa="' + esc(needAddr ? 'Olá! Vim pelo site e quero saber o endereço e os horários da Carranca Team ' + u.curto + '.' : unitMsg(u)) + '" data-unit="' + esc(u.id) + '" data-where="unidade-' + esc(u.id) + '" aria-label="' + esc((needAddr ? 'Pedir endereço' : 'WhatsApp') + ': ' + u.nome) + '"><svg class="ic ic--fill"><use href="#i-wa"/></svg>' + (needAddr ? 'Pedir endereço' : 'WhatsApp') + '</a>';
      acts += '<a class="chip" href="unidades.html#' + esc(u.id) + '" aria-label="' + esc('Ver fotos: ' + u.nome) + '">Ver fotos</a>';
      return '<article class="uc' + (u.id === MAP.unit ? ' is-on' : '') + '" data-u="' + esc(u.id) + '">' +
        '<h3>' + esc(u.nome) + '</h3><p class="uc__sub">' + esc(u.resumo) + '</p>' +
        '<p class="uc__addr"><svg class="ic"><use href="#i-pin"/></svg><span>' + (needAddr
          ? [u.endereco, u.cidade].filter(Boolean).map(esc).join(' · ') + (u.endereco || u.cidade ? '<br>' : '') + '<small style="color:var(--mute)">Endereço exato pelo WhatsApp</small>'
          : esc(u.endereco) + '<br>' + esc(u.cidade) + ' · CEP ' + esc(u.cep)) + '</span></p>' +
        '<p class="uc__st"><i class="' + (st.on ? 'on' : '') + '"></i>' + esc(st.txt) + '</p>' +
        '<div class="uc__acts">' + acts + '</div></article>';
    }).join('');
    wireAll(cards);
  }
  function renderMap() {
    var u = unitById(MAP.unit);
    $$('button', mapTabs).forEach(function (b) {
      var on = b.getAttribute('data-u') === MAP.unit;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (MAP.unit) mapFrame.setAttribute('aria-labelledby', 'mapTab-' + MAP.unit);   /* o painel do mapa tem o nome da aba escolhida */
    $$('.uc', cards).forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-u') === MAP.unit); });
    if (!u || !u.lat) { mapFrame.innerHTML = ''; mapRoute.hidden = true; return; }
    mapFrame.innerHTML = '<iframe title="Mapa: ' + esc(u.nome) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + u.lat + ',' + u.lng + '&hl=pt-BR&z=16&output=embed"></iframe>';
    mapRoute.hidden = false;
    mapRoute.href = 'https://www.google.com/maps/dir/?api=1&destination=' + u.lat + ',' + u.lng;
  }
  if (cards) {
    renderCards();
    mapTabs.innerHTML = geoUnits.map(function (u) { return '<button type="button" role="tab" id="mapTab-' + esc(u.id) + '" aria-controls="mapFrame" data-u="' + esc(u.id) + '">' + esc(u.curto) + '</button>'; }).join('');
    mapFrame.setAttribute('role', 'tabpanel');
    mapTabs.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) { MAP.unit = b.getAttribute('data-u'); renderMap(); }
    });
    roving(mapTabs, 'button');
    cards.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var c = e.target.closest('.uc');
      var u = c && unitById(c.getAttribute('data-u'));
      if (u && u.lat) { MAP.unit = u.id; renderMap(); }
    });
    renderMap();
    /* só o texto de status muda com o tempo: não recria os cartões (preserva foco e hover) */
    setInterval(function () {
      if (document.hidden) return;
      var now = nowBahia();
      $$('.uc', cards).forEach(function (c) {
        var u = unitById(c.getAttribute('data-u')), st = unitStatus(u, now), p = $('.uc__st', c);
        p.innerHTML = '<i class="' + (st.on ? 'on' : '') + '"></i>' + esc(st.txt);
      });
    }, 60000);
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-track="rota"]')) track('route_click');
  });

  /* ---------- Instagram das unidades ---------- */
  var ig = $('#igRow');
  if (ig) {
    ig.innerHTML = UNITS.map(function (u) {
      return '<li><a href="https://www.instagram.com/' + esc(u.instagram) + '/" target="_blank" rel="noopener"><svg class="ic"><use href="#i-ig"/></svg><span><b>@' + esc(u.instagram) + '</b><small>' + esc(u.curto) + ' · ' + esc(u.seguidores) + ' seguidores</small></span></a></li>';
    }).join('');
  }

  /* ---------- atalhos: data-pick (abre a unidade em Horários ou Unidades) ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-pick]');
    if (!a) return;
    var id = a.getAttribute('data-pick'), href = a.getAttribute('href');
    if (href === '#unidades' && cards) { var u = unitById(id); if (u && u.lat) { MAP.unit = id; renderMap(); } }
    if (href === '#horarios' && schedUnits) {
      SCH.unit = id; SCH.filter = a.getAttribute('data-filter') || 'todos'; SCH.day = null;
      renderSched();
    }
  });

  /* ======================================================================
     DIÁLOGOS: escolha de unidade (WhatsApp) e galeria de fotos
     ====================================================================== */
  function bindDlg(d, extraClose) {
    if (!d) return;
    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('[data-close]') || (extraClose && extraClose(e))) d.close();
    });
    d.addEventListener('close', function () {
      document.body.classList.remove('is-locked');
      if (d.__last && d.__last.focus) d.__last.focus();
    });
  }
  function showDlg(d) {
    d.__last = document.activeElement;
    d.showModal();
    document.body.classList.add('is-locked');
  }

  /* botões genéricos de WhatsApp (hero, flutuante, FAQ...) perguntam a unidade antes */
  var zapDlg = $('#zapPick'), zapList = $('#zapList');
  bindDlg(zapDlg);
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-zap]');
    if (!t) return;
    e.preventDefault();
    var custom = t.getAttribute('data-msg');
    if (nav.classList.contains('is-open')) setMenu(false);
    if (!zapDlg || typeof zapDlg.showModal !== 'function') {
      var a = document.createElement('a');
      a.href = waUrl(custom || 'Olá! Vim pelo site e quero saber mais sobre as aulas da Carranca Team.'); a.target = '_blank'; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      return;
    }
    zapList.innerHTML = UNITS.map(function (u) {
      return '<a class="zap" href="' + esc(waUrl(custom || unitMsg(u), u.id)) + '" target="_blank" rel="noopener" data-unit="' + esc(u.id) + '"><span><b>' + esc(u.curto) + '</b><small>' + esc(fmtPhone(waNumber(u.id))) + ' · ' + esc(u.tag || '') + '</small></span><svg class="ic ic--fill"><use href="#i-wa"/></svg></a>';
    }).join('');
    zapDlg.__where = t.getAttribute('data-where') || '';
    showDlg(zapDlg);
    track('open_zap', { location: zapDlg.__where });
  });
  if (zapList) zapList.addEventListener('click', function (e) {
    var z = e.target.closest('.zap');
    if (z) { track('whatsapp_click', { location: 'zap-' + (zapDlg.__where || ''), unit: z.getAttribute('data-unit') }); setTimeout(function () { zapDlg.close(); }, 150); }
  });

  /* galeria: qualquer elemento com data-full abre em tela cheia; os do mesmo [data-gal] viram um carrossel */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbN = $('#lbN'), LB = { items: [], i: 0 };
  bindDlg(lb, function (e) { return e.target.classList.contains('lb__fig'); });
  function lbShow(i) {
    var n = LB.items.length;
    LB.i = (i + n) % n;
    var it = LB.items[LB.i], im = it.querySelector('img');
    lbImg.src = it.getAttribute('data-full');
    lbImg.alt = im ? im.alt : '';
    lbN.textContent = (LB.i + 1) + ' / ' + n;
    [LB.i + 1, LB.i - 1].forEach(function (k) {
      var x = LB.items[(k + n) % n];
      if (x && n > 1) { var p = new Image(); p.src = x.getAttribute('data-full'); }
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-full]');
    if (!b || !lb || typeof lb.showModal !== 'function') return;
    e.preventDefault();
    var g = b.parentElement && b.parentElement.closest('[data-gal]');
    LB.items = g ? $$('[data-full]', g) : [b];
    lb.classList.toggle('lb--one', LB.items.length < 2);
    showDlg(lb);
    lbShow(LB.items.indexOf(b));
    track('gallery_open');
  });
  if (lb) {
    $('.lb__prev', lb).addEventListener('click', function () { lbShow(LB.i - 1); });
    $('.lb__next', lb).addEventListener('click', function () { lbShow(LB.i + 1); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') lbShow(LB.i - 1);
      else if (e.key === 'ArrowRight') lbShow(LB.i + 1);
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null || LB.items.length < 2) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) lbShow(LB.i + (dx < 0 ? 1 : -1));
      tx = null;
    }, { passive: true });
  }

  /* ======================================================================
     PÁGINA DAS UNIDADES: cartão de informações de cada unidade
     ====================================================================== */
  function uinfoStatus(box, u) {
    var st = unitStatus(u, nowBahia()), el = $('.uinfo__st', box);
    if (el) el.textContent = st.txt;
  }
  $$('[data-uinfo]').forEach(function (box) {
    var u = unitById(box.getAttribute('data-uinfo'));
    if (!u) return;
    var needAddr = u.enderecoPeloZap && !u.lat;
    var addr = needAddr
      ? [u.endereco, u.cidade].filter(Boolean).map(esc).join(' · ') + '<small>Endereço exato pelo WhatsApp</small>'
      : esc(u.endereco) + '<small>' + esc(u.cidade) + ' · CEP ' + esc(u.cep) + '</small>';
    box.innerHTML =
      '<p class="uinfo__r"><svg class="ic"><use href="#i-pin"/></svg><span>' + addr + '</span></p>' +
      '<p class="uinfo__r"><svg class="ic"><use href="#i-clock"/></svg><span class="uinfo__st"></span></p>' +
      '<p class="uinfo__r"><svg class="ic ic--fill"><use href="#i-wa"/></svg><span>WhatsApp da unidade<small>' + esc(fmtPhone(waNumber(u.id))) + '</small></span></p>' +
      '<div class="uinfo__acts">' +
        '<a class="btn btn--wa" href="#" data-wa="' + esc(needAddr ? 'Olá! Vim pelo site e quero saber o endereço e os horários da Carranca Team ' + u.curto + '.' : unitMsg(u)) + '" data-unit="' + esc(u.id) + '" data-where="unidades-' + esc(u.id) + '" aria-label="' + esc((needAddr ? 'Pedir o endereço' : 'Chamar no WhatsApp') + ': ' + u.nome) + '"><svg class="ic ic--fill"><use href="#i-wa"/></svg>' + (needAddr ? 'Pedir o endereço' : 'Chamar no WhatsApp') + '</a>' +
        (u.lat ? '<a class="btn btn--line" href="https://www.google.com/maps/dir/?api=1&destination=' + u.lat + ',' + u.lng + '" target="_blank" rel="noopener" data-track="rota" aria-label="' + esc('Como chegar: ' + u.nome) + '"><svg class="ic"><use href="#i-pin"/></svg>Como chegar</a>' : '') +
        '<a class="btn btn--red" href="index.html#agendar" data-open="agenda" data-unit="' + esc(u.id) + '" data-where="unidades-' + esc(u.id) + '" aria-label="' + esc('Agendar aula experimental: ' + u.nome) + '"><svg class="ic"><use href="#i-cal"/></svg>Agendar aula experimental</a>' +
      '</div>';
    uinfoStatus(box, u);
    wireAll(box);
  });
  if ($$('[data-uinfo]').length) setInterval(function () {
    if (!document.hidden) $$('[data-uinfo]').forEach(function (box) { uinfoStatus(box, unitById(box.getAttribute('data-uinfo'))); });
  }, 60000);

  /* ======================================================================
     PÁGINA DAS FAIXAS BRANCAS: horários (lidos da grade) e botões por unidade
     ====================================================================== */
  var FXC = C.faixasBrancas || {};
  var FX_RE = { iniciante: /inici/i, ouro: /branca de ouro/i };
  function fxClasses(k) { return CLASSES.filter(function (c) { return FX_RE[k].test(c.name); }); }
  $$('[data-fx]').forEach(function (box) {
    var gs = groups(fxClasses(box.getAttribute('data-fx')));
    box.innerHTML = '<p class="when__t">Quando e onde</p>' + (gs.length
      ? gs.map(function (g) { return '<div class="when__i"><b>' + esc(unitById(g.unit).curto) + '</b><span>' + fmtDays(g.days) + ' · ' + g.hora + '</span></div>'; }).join('')
      : '<p class="when__none">O horário deste treino é confirmado direto com a unidade, pelo WhatsApp.</p>');
  });
  $$('[data-fxcta]').forEach(function (box) {
    var k = box.getAttribute('data-fxcta'), cfg = FXC[k] || {};
    var ids = uniq((cfg.unidades || []).concat(fxClasses(k).map(function (c) { return c.unit; })));
    box.innerHTML = '<p class="fxcta__t">Chame a unidade no WhatsApp</p>' + ids.map(function (id) {
      var u = unitById(id);
      var msg = (cfg.mensagem || 'Olá! Quero saber mais sobre o treino ' + (cfg.nome || '') + '.') + ' (Unidade: ' + u.nome + ')';
      return '<a class="btn btn--wa" href="#" data-wa="' + esc(msg) + '" data-unit="' + esc(id) + '" data-where="faixas-' + esc(k) + '-' + esc(id) + '" aria-label="' + esc(u.curto + ': chamar no WhatsApp (' + (cfg.nome || 'treino') + ')') + '"><svg class="ic ic--fill"><use href="#i-wa"/></svg>' + esc(u.curto) + '</a>';
    }).join('');
    wireAll(box);
  });

  /* ---------- exclusivo no FAQ: abre um por vez ---------- */
  var det = $$('.faq__list details');
  det.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) det.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
