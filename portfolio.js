/* Rendering only. Edit content in data/site.js and data/projects.js. */
(() => {
  'use strict';
  const site = window.PORTFOLIO_SITE;
  const projects = window.PORTFOLIO_PROJECTS;
  if (!site || !Array.isArray(projects)) {
    const message = document.createElement('p');
    message.className = 'not-found editorial';
    message.textContent = '作品数据未能加载。请检查 data 文件中的引号、逗号和括号。';
    document.querySelector('main').append(message);
    return;
  }
  const siteName = site.name || 'KuAKuA';
  const page = document.body.dataset.page;
  const query = new URLSearchParams(location.search);
  const categories = [...new Set((site.categories || []).filter(value => value && value !== 'All'))];
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const videoStates = new Map();
  const gallery = [];
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const lines = value => (Array.isArray(value) ? value : [value]).filter(value => typeof value === 'string' && value.trim());
  const addParagraphs = (parent, value, className) => lines(value).forEach(line => parent.append(el('p', className, line)));
  const safeURL = value => {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value, location.href);
      return ['http:', 'https:', 'file:', 'mailto:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const projectURL = (project, category = '') => `project.html?id=${encodeURIComponent(project.id)}${category && category !== 'All' ? `&category=${encodeURIComponent(category)}` : ''}`;
  const worksURL = category => `index.html${category && categories.includes(category) ? `?category=${encodeURIComponent(category)}` : ''}#works`;
  document.querySelectorAll('.identity').forEach(identity => {
    identity.replaceChildren(document.createTextNode(siteName), el('span', '', site.nameEnglish || ''));
    identity.setAttribute('aria-label', `${siteName}，返回首页`);
  });
  document.title = siteName;
  if (page !== 'home') document.querySelectorAll('.work-link').forEach(link => { link.href = worksURL(query.get('category')); });

  // Videos get a src only near the viewport; only visible automatic videos play.
  const canAutoplay = () => !motionPreference.matches && !navigator.connection?.saveData;
  function syncVideo(video, state) {
    if (!state.visible || document.hidden || document.body.classList.contains('lightbox-open')) { video.pause(); return; }
    if (!state.auto || !canAutoplay() || !video.getAttribute('src')) return;
    video.play().then(() => {
      if (!state.visible || document.hidden) video.pause();
    }).catch(() => {
      // Native playback is a stable fallback for blocked autoplay in detail pages.
      if (!state.preview) video.controls = true;
      else if (!state.hint) {
        state.hint = el('span', 'video-play-fallback', '查看影像 →');
        video.parentElement.append(state.hint);
      }
    });
  }
  const loadVideos = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      const state = videoStates.get(video);
      if (!entry.isIntersecting || !state) return;
      video.preload = 'metadata';
      video.src = state.src;
      video.load();
      loadVideos.unobserve(video);
      syncVideo(video, state);
    });
  }, { rootMargin: '250px 0px' });
  const visibleVideos = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = videoStates.get(entry.target);
      if (!state) return;
      state.visible = entry.isIntersecting;
      syncVideo(entry.target, state);
    });
  }, { threshold: .08 });
  document.addEventListener('visibilitychange', () => videoStates.forEach((state, video) => syncVideo(video, state)));
  motionPreference.addEventListener('change', () => videoStates.forEach((state, video) => {
    if (!canAutoplay()) { video.pause(); if (!state.preview) video.controls = true; }
    else syncVideo(video, state);
  }));
  function clearVideos() {
    videoStates.forEach((state, video) => {
      video.pause(); loadVideos.unobserve(video); visibleVideos.unobserve(video);
      video.removeAttribute('src'); video.load();
    });
    videoStates.clear();
  }
  function mediaFigure(media, { preview = false } = {}) {
    const figure = el('figure', 'media-figure');
    if (!media || !['image', 'video'].includes(media.type)) return figure;
    const width = Number(media.width) || 1600;
    const height = Number(media.height) || 1000;
    figure.style.setProperty('--media-ratio', `${width} / ${height}`);
    if (media.type === 'image') {
      const img = el('img');
      img.alt = media.alt || media.caption || '作品图像';
      img.loading = 'lazy'; img.decoding = 'async';
      img.width = width; img.height = height;
      let button;
      if (!preview) {
        button = el('button', 'image-open'); button.type = 'button';
        button.setAttribute('aria-label', `放大：${img.alt}`);
        const index = gallery.push(media) - 1;
        button.addEventListener('click', () => openLightbox(index, button));
        button.append(img); figure.append(button);
      } else figure.append(img);
      img.addEventListener('error', () => {
        img.hidden = true;
        if (button) button.hidden = true;
        figure.append(el('span', 'media-fallback', `图片暂不可用：${media.alt || '作品图像'}`));
      }, { once: true });
      img.src = safeURL(media.src);
    } else {
      const video = el('video');
      video.width = width; video.height = height;
      video.playsInline = true; video.preload = 'none';
      video.muted = preview || Boolean(media.muted) || Boolean(media.autoplay);
      video.loop = preview || Boolean(media.loop);
      const auto = preview || Boolean(media.autoplay);
      // Automatic loops are scheduled by IntersectionObserver rather than the
      // autoplay attribute, so off-screen metadata loading cannot start playback.
      video.controls = !preview && (media.controls !== false || !canAutoplay());
      video.setAttribute('aria-label', media.alt || media.caption || '项目视频');
      if (media.poster) video.poster = safeURL(media.poster);
      video.append(document.createTextNode('浏览器不支持此视频格式。'));
      figure.append(video);
      videoStates.set(video, { src: safeURL(media.src), auto, preview, visible: false });
      video.addEventListener('error', () => {
        if (!video.getAttribute('src')) return;
        const fallback = el('a', 'media-fallback', '视频暂不可用 · 打开视频文件');
        fallback.href = safeURL(media.src); figure.append(fallback);
      }, { once: true });
      loadVideos.observe(video); visibleVideos.observe(video);
    }
    if (!preview && media.caption) figure.append(el('figcaption', '', media.caption));
    return figure;
  }

  function setupHome() {
    const root = document.documentElement;
    if (safeURL(site.heroImage)) root.style.setProperty('--photograph', `url(${JSON.stringify(safeURL(site.heroImage))})`);
    root.style.setProperty('--hero-position', site.heroPosition || '50% 50%');
    root.style.setProperty('--hero-position-mobile', site.heroPositionMobile || site.heroPosition || '50% 50%');
    const footer = document.querySelector('.scene .footer');
    footer.querySelector('.work-number').textContent = site.heroNumber || '';
    footer.querySelector('.work-number + span').textContent = site.heroTitle || '';
    footer.querySelector('.english-title').textContent = site.heroTitleEnglish || '';
    footer.querySelector('.edition').textContent = site.heroEdition || '';
    document.querySelector('.scene').setAttribute('aria-label', `摄影作品：${site.heroTitle || site.name}`);
    const grid = document.querySelector('.works-grid');
    const filters = document.querySelector('.filters');
    let active = categories.includes(query.get('category')) ? query.get('category') : 'All';
    const buttons = new Map();
    function renderWorks() {
      clearVideos(); grid.replaceChildren();
      buttons.forEach((button, category) => button.setAttribute('aria-pressed', String(category === active)));
      const visible = projects.filter(project => active === 'All' || project.category.includes(active));
      document.querySelector('.project-count').textContent = `${String(visible.length).padStart(2, '0')} ${visible.length === 1 ? 'project' : 'projects'}`;
      document.querySelector('.empty-state').hidden = visible.length > 0;
      visible.forEach(project => {
        const article = el('article', 'work-item');
        const link = el('a', 'work-link-content');
        link.href = projectURL(project, active); link.setAttribute('aria-label', `查看项目：${project.title}`);
        const cover = el('div', 'work-cover');
        const covers = (Array.isArray(project.cover) ? project.cover : [project.cover]).slice(0, 3);
        if (covers.length > 1) { cover.classList.add('is-multiple'); cover.style.setProperty('--cover-count', String(covers.length)); }
        covers.forEach(media => cover.append(mediaFigure(media, { preview: true })));
        const label = el('div', 'work-label');
        label.append(el('span', 'work-number-label', project.number), el('span', 'work-title', project.title), el('span', 'work-year', project.year));
        link.append(cover, label, el('p', 'work-category', project.category.join(' / ')));
        article.append(link); grid.append(article);
      });
    }
    ['All', ...categories].forEach(category => {
      const button = el('button', '', category); button.type = 'button';
      button.addEventListener('click', () => {
        if (active === category) return;
        active = category; renderWorks();
        const url = new URL(location.href);
        if (active === 'All') url.searchParams.delete('category'); else url.searchParams.set('category', active);
        url.hash = 'works';
        try { history.replaceState(null, '', url); } catch { /* file:// can restrict history updates */ }
        // Keep category changes at the Works start even when the new list is short.
        window.scrollTo({ top: document.querySelector('#works').offsetTop, behavior: 'instant' });
      });
      buttons.set(category, button); filters.append(button);
    });
    renderWorks();
    const scene = document.querySelector('.scene');
    const nav = document.querySelector('.work-link');
    let scheduled = false;
    const headerTheme = () => {
      scheduled = false;
      const beyondHero = scene.getBoundingClientRect().bottom <= 85;
      document.body.classList.toggle('hero-offscreen', beyondHero);
      if (beyondHero) nav.setAttribute('aria-current', 'location'); else nav.removeAttribute('aria-current');
    };
    window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(headerTheme); } }, { passive: true });
    window.addEventListener('resize', headerTheme, { passive: true });
    headerTheme();
  }

  function renderProject() {
    const parent = document.querySelector('.project-page');
    const projectIndex = projects.findIndex(project => project.id === query.get('id'));
    const project = projects[projectIndex];
    const back = el('a', 'back-link', '← All works'); back.href = worksURL(query.get('category')); parent.append(back);
    if (!project) {
      const missing = el('section', 'not-found');
      missing.append(el('h1', '', '项目尚未加入'), el('p', '', '这个地址没有对应作品。请返回 Works 查看现有项目。'));
      parent.append(missing); document.title = siteName; return;
    }
    document.title = siteName;
    document.querySelector('meta[name="description"]').content = `${siteName} — ${lines(project.description).join(' ')}`.slice(0, 180);
    const intro = el('section', 'project-intro');
    const meta = el('div', 'project-meta');
    meta.append(el('p', 'project-number', project.number), el('h1', '', project.title), el('p', '', project.year), el('p', '', project.category.join(' / ')));
    const description = el('div', 'project-description');
    addParagraphs(description, project.description);
    addParagraphs(description, project.credits, 'credits');
    intro.append(meta, description); parent.append(intro);
    const supported = new Set(['full', 'landscape', 'portrait', 'pair', 'triple', 'small', 'asymmetric', 'text-media', 'video']);
    (project.media || []).forEach(block => {
      const layout = supported.has(block.layout) ? block.layout : 'landscape';
      const section = el('section', `media-block ${layout}`);
      if (block.text) { const text = el('div', 'media-text'); addParagraphs(text, block.text); section.append(text); }
      const items = el('div', 'media-items');
      (block.items || [block]).forEach(media => items.append(mediaFigure(media)));
      section.append(items);
      // Single-media captions are rendered by mediaFigure, grouped ones here.
      if (block.items && block.caption) section.append(el('p', 'block-caption', block.caption));
      parent.append(section);
    });
    if (projects.length > 1) {
      const next = projects[(projectIndex + 1) % projects.length];
      const nextSection = el('nav', 'next-project'); nextSection.setAttribute('aria-label', '继续浏览');
      const link = el('a', '', `${next.title} →`); link.href = projectURL(next);
      nextSection.append(el('span', '', 'NEXT PROJECT'), link); parent.append(nextSection);
    }
  }

  function renderAbout() {
    const about = site.about || {};
    const parent = document.querySelector('.about-page');
    const title = el('div', 'about-title');
    title.append(el('h1', '', about.name || site.name), el('p', '', 'About'));
    const copy = el('div', 'about-copy'); addParagraphs(copy, about.biography);
    const labels = { education: 'Education / 教育', experience: 'Experience / 经历', clients: 'Clients / 合作', exhibitions: 'Exhibitions / 展览', awards: 'Awards / 奖项' };
    Object.entries(labels).forEach(([key, label]) => {
      if (!lines(about[key]).length) return;
      const group = el('section', 'about-group'); group.append(el('h2', '', label)); addParagraphs(group, about[key]); copy.append(group);
    });
    if (about.email || about.instagram) {
      const group = el('section', 'about-group'); group.append(el('h2', '', 'Contact / 联系'));
      if (about.email) { const p = el('p'); const a = el('a', '', about.email); a.href = safeURL(`mailto:${about.email}`); p.append(a); group.append(p); }
      if (about.instagram) { const p = el('p'); const a = el('a', '', 'Instagram ↗'); a.href = safeURL(about.instagram); a.target = '_blank'; a.rel = 'noopener noreferrer'; p.append(a); group.append(p); }
      copy.append(group);
    }
    if (about.credits?.length) {
      const credits = el('div', 'asset-credits');
      about.credits.forEach(credit => { const a = el('a', '', credit.text); a.href = safeURL(credit.url); a.target = '_blank'; a.rel = 'noopener noreferrer'; credits.append(a); });
      copy.append(credits);
    }
    parent.append(title, copy);
  }

  const dialog = document.querySelector('.lightbox');
  let galleryIndex = 0, lightboxOpener = null, touchStart = null;
  function showImage() {
    const media = gallery[galleryIndex];
    const img = dialog.querySelector('.lightbox-image');
    img.alt = media.alt || '作品大图';
    img.src = safeURL(media.fullSrc || media.src);
    dialog.querySelector('#lightbox-caption').textContent = `${galleryIndex + 1} / ${gallery.length}${media.caption || media.alt ? ` — ${media.caption || media.alt}` : ''}`;
    dialog.querySelector('.lightbox-prev').hidden = gallery.length < 2;
    dialog.querySelector('.lightbox-next').hidden = gallery.length < 2;
  }
  function openLightbox(index, opener) {
    if (!dialog || !gallery.length) return;
    galleryIndex = index; lightboxOpener = opener; showImage();
    document.body.classList.add('lightbox-open'); dialog.showModal();
    videoStates.forEach((state, video) => video.pause());
    dialog.querySelector('.lightbox-close').focus();
  }
  function step(direction) { galleryIndex = (galleryIndex + direction + gallery.length) % gallery.length; showImage(); }
  if (dialog) {
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.lightbox-prev').addEventListener('click', () => step(-1));
    dialog.querySelector('.lightbox-next').addEventListener('click', () => step(1));
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('lightbox-open');
      dialog.querySelector('.lightbox-image').removeAttribute('src');
      lightboxOpener?.focus({ preventScroll: true });
      videoStates.forEach((state, video) => syncVideo(video, state));
    });
    dialog.addEventListener('touchstart', event => { if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY }; else touchStart = null; }, { passive: true });
    dialog.addEventListener('touchend', event => {
      if (!touchStart || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
      touchStart = null;
    }, { passive: true });
    dialog.querySelector('.lightbox-image').addEventListener('error', () => {
      if (dialog.open) dialog.querySelector('#lightbox-caption').textContent = '大图暂不可用。可切换其他图片或关闭。';
    });
  }
  if (page === 'home') setupHome();
  if (page === 'project') renderProject();
  if (page === 'about') renderAbout();
})();
