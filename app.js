(() => {
  'use strict';

  const routes = {
    dashboard: 'index.html',
    'packday-home-dashboard': 'index.html',
    checklist: 'checklist.html',
    schedule: 'schedule.html',
    'gear-radar': 'gear-radar.html',
    'item-finder': 'item-finder.html',
    'profile-settings': 'profile.html',
    'add-gear-item': 'checklist.html?add=1#quickAddInput',
    'quick-add': 'checklist.html?add=1#quickAddInput'
  };
  const storageKeys = {
    checklist: 'packday.checklist.v1',
    dashboard: 'packday.dashboard.v1',
    schedule: 'packday.schedule.v1'
  };

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.error(`PackDay could not read saved data for "${key}".`, error);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`PackDay could not save data for "${key}".`, error);
      showNotice('Changes could not be saved on this device.');
    }
  }

  let noticeTimer;
  function showNotice(message) {
    let notice = document.getElementById('packday-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'packday-notice';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');
      Object.assign(notice.style, {
        position: 'fixed',
        left: '50%',
        bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        transform: 'translateX(-50%)',
        zIndex: '100',
        maxWidth: 'calc(100vw - 32px)',
        padding: '12px 16px',
        borderRadius: '14px',
        background: '#31353c',
        color: '#dfe2eb',
        boxShadow: '0 8px 24px rgba(0,0,0,.4)',
        font: '500 14px/1.4 Inter, sans-serif',
        textAlign: 'center'
      });
      document.body.appendChild(notice);
    }
    notice.textContent = message;
    notice.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 2600);
  }

  function targetForPath(path) {
    return routes[path] || null;
  }

  function connectNavigation() {
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('a[data-path]').forEach((link) => {
      const label = link.textContent.trim().toLocaleLowerCase();
      const target = label.includes('gear radar')
        ? routes['gear-radar']
        : label.includes('item finder')
          ? routes['item-finder']
          : targetForPath(link.dataset.path);
      if (!target) return;
      link.href = target;
      if (target.split('?')[0] === currentPage) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    document.querySelectorAll('header div.w-8.h-8.rounded-full.bg-primary').forEach((avatar) => {
      const profileLink = document.createElement('a');
      profileLink.href = routes['profile-settings'];
      profileLink.className = avatar.className;
      profileLink.setAttribute('aria-label', 'Profile');
      avatar.childNodes.forEach((node) => profileLink.appendChild(node.cloneNode(true)));
      avatar.replaceWith(profileLink);
    });

    const destinations = {
      'btn-bag-checklist': routes.checklist,
      'btn-checklist': routes.checklist,
      'btn-class-schedule': routes.schedule,
      'btn-schedule': routes.schedule
    };
    Object.entries(destinations).forEach(([id, href]) => {
      const button = document.getElementById(id);
      if (button) button.addEventListener('click', () => { location.href = href; });
    });
  }

  function itemKey(card) {
    return (card.querySelector('h3')?.textContent || '').trim().toLocaleLowerCase();
  }

  function setChecklistState(card, checked) {
    const button = card.querySelector('.checkbox-btn');
    const title = card.querySelector('h3');
    const icon = button?.querySelector('.material-symbols-outlined');
    card.classList.toggle('checked', checked);
    if (!button || !title || !icon) return;

    button.className = checked
      ? 'checkbox-btn min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-primary-container text-on-primary-container transition-all active:scale-90'
      : 'checkbox-btn min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant transition-all active:scale-90';
    button.setAttribute('aria-pressed', String(checked));
    icon.textContent = checked ? 'check_box' : 'radio_button_unchecked';
    title.classList.toggle('line-through', checked);
    title.classList.toggle('opacity-80', checked);
    card.classList.toggle('bg-surface-container-low', checked);
    card.classList.toggle('bg-surface-container-high', !checked);
  }

  function makeCustomChecklistCard(item) {
    const card = document.createElement('article');
    card.dataset.category = item.category || 'academic';
    card.dataset.custom = 'true';
    card.className = 'checklist-item flex items-center justify-between p-space-md rounded-2xl bg-surface-container-high transition-all shadow-sm';

    const content = document.createElement('div');
    content.className = 'flex items-start gap-space-sm min-w-0 pr-space-xs';
    const iconBox = document.createElement('div');
    iconBox.className = 'w-10 h-10 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center shrink-0 mt-0.5';
    const backpackIcon = document.createElement('span');
    backpackIcon.className = 'material-symbols-outlined text-[22px]';
    backpackIcon.textContent = 'backpack';
    iconBox.appendChild(backpackIcon);

    const details = document.createElement('div');
    details.className = 'flex flex-col min-w-0';
    const headingRow = document.createElement('div');
    headingRow.className = 'flex items-center gap-space-xs flex-wrap mb-0.5';
    const title = document.createElement('h3');
    title.className = 'font-headline-sm text-headline-sm text-on-surface truncate';
    title.textContent = item.name;
    const badge = document.createElement('span');
    badge.className = 'px-2 py-0.5 rounded-full bg-primary-container/30 text-primary-fixed-dim font-label-sm text-label-sm';
    badge.textContent = 'Custom';
    headingRow.append(title, badge);
    const description = document.createElement('p');
    description.className = 'font-body-sm text-body-sm text-on-surface-variant truncate';
    description.textContent = 'Added for tomorrow';
    details.append(headingRow, description);
    content.append(iconBox, details);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.setAttribute('aria-label', `Toggle ${item.name}`);
    toggle.className = 'checkbox-btn min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant transition-all active:scale-90';
    const checkboxIcon = document.createElement('span');
    checkboxIcon.className = 'material-symbols-outlined text-[24px]';
    checkboxIcon.textContent = 'radio_button_unchecked';
    toggle.appendChild(checkboxIcon);
    toggle.addEventListener('click', () => {
      setChecklistState(card, !card.classList.contains('checked'));
      saveChecklist();
    });
    card.append(content, toggle);
    setChecklistState(card, Boolean(item.checked));
    return card;
  }

  function saveChecklist() {
    const container = document.getElementById('checklistContainer');
    if (!container) return;
    const items = [...container.querySelectorAll('.checklist-item')].map((card) => ({
      name: card.querySelector('h3')?.textContent.trim() || '',
      category: card.dataset.category || 'academic',
      checked: card.classList.contains('checked'),
      custom: card.dataset.custom === 'true'
    }));
    writeStorage(storageKeys.checklist, items);
  }

  function restoreChecklist() {
    const container = document.getElementById('checklistContainer');
    if (!container) return;

    const savedItems = readStorage(storageKeys.checklist, []);
    if (!Array.isArray(savedItems)) {
      console.error('PackDay checklist data is invalid; keeping the page defaults.');
      return;
    }
    const savedByName = new Map(savedItems.map((item) => [String(item.name).toLocaleLowerCase(), item]));
    const existing = new Set();
    container.querySelectorAll('.checklist-item').forEach((card) => {
      const key = itemKey(card);
      const saved = savedByName.get(key);
      existing.add(key);
      if (saved) setChecklistState(card, Boolean(saved.checked));
    });
    savedItems.filter((item) => item.custom && !existing.has(String(item.name).toLocaleLowerCase()))
      .reverse()
      .forEach((item) => container.insertBefore(makeCustomChecklistCard(item), container.firstChild));
  }

  function persistChecklistInteractions() {
    document.addEventListener('click', (event) => {
      if (event.target.closest('.checklist-item .checkbox-btn, #markAllBtn')) saveChecklist();
    });
    const container = document.getElementById('checklistContainer');
    if (container) {
      new MutationObserver(saveChecklist).observe(container, { childList: true });
    }
  }

  function persistDashboardCheckboxes() {
    const checkboxes = [...document.querySelectorAll('.gear-checkbox')];
    if (!checkboxes.length) return;
    const saved = readStorage(storageKeys.dashboard, {});
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = Boolean(saved[index]);
      checkbox.addEventListener('change', () => {
        const values = checkboxes.map((item) => item.checked);
        writeStorage(storageKeys.dashboard, values);
      });
    });
  }

  function persistScheduleToggles() {
    const toggles = [...document.querySelectorAll('article button[aria-label="Toggle deliverable status"]')];
    if (!toggles.length) return;
    const saved = readStorage(storageKeys.schedule, {});
    toggles.forEach((button, index) => {
      const icon = button.querySelector('.material-symbols-outlined');
      const checked = Boolean(saved[index]);
      if (icon && checked !== (icon.textContent.trim() === 'check')) {
        button.click();
      }
      button.addEventListener('click', () => {
        const values = toggles.map((toggle) => toggle.querySelector('.material-symbols-outlined')?.textContent.trim() === 'check');
        writeStorage(storageKeys.schedule, values);
      });
    });
  }

  function connectSearch() {
    const search = document.getElementById('gear-search-input');
    if (!search) return;
    const page = location.pathname.split('/').pop();

    if (page === 'item-finder.html') {
      const rows = [...document.querySelectorAll('main [class*="p-space-sm rounded-2xl bg-surface-container border border-surface-container-high"]')];
      if (!rows.length) {
        console.error('PackDay could not find the item rows for this search.');
        return;
      }
      let selectedStatus = 'all';
      const statusButtons = [...document.querySelectorAll('main button')].filter((button) =>
        /^(all items|packed|missing\s*\/\s*unpacked|in lockers)/i.test(button.textContent.trim())
      );
      const category = new URLSearchParams(location.search).get('category') || '';
      const categoryMatchers = {
        bags: /backpack|bag/i,
        keys: /key|lanyard|id\b/i,
        hardware: /calculator|charger|device|laptop|phone/i,
        stationary: /calculator|notebook|stationery|supplies/i,
        stationery: /calculator|notebook|stationery|supplies/i
      };
      const categoryMatcher = categoryMatchers[category.toLocaleLowerCase()];
      const applyFilters = () => {
        const query = search.value.trim().toLocaleLowerCase();
        rows.forEach((row) => {
          const text = row.textContent.toLocaleLowerCase();
          const matchesQuery = !query || text.includes(query);
          const matchesCategory = !categoryMatcher || categoryMatcher.test(text);
          const matchesStatus = selectedStatus === 'all'
            || (selectedStatus === 'packed' && /\bpacked\b/i.test(text))
            || (selectedStatus === 'missing' && /unpacked|missing/i.test(text))
            || (selectedStatus === 'lockers' && /locker/i.test(text));
          row.style.display = matchesQuery && matchesCategory && matchesStatus ? '' : 'none';
        });
      };

      search.addEventListener('input', applyFilters);
      statusButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const label = button.textContent.trim().toLocaleLowerCase();
          selectedStatus = label.startsWith('packed') ? 'packed'
            : label.startsWith('missing') ? 'missing'
              : label.startsWith('in lockers') ? 'lockers' : 'all';
          statusButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
          applyFilters();
        });
      });
      applyFilters();
      return;
    }

    const cards = [...new Set([...document.querySelectorAll('main h3')]
      .map((heading) => heading.closest('div.bg-surface-container.rounded-2xl.p-space-sm'))
      .filter(Boolean))];
    if (!cards.length) {
      console.error('PackDay could not find the gear cards for this page search.');
      return;
    }

    let selectedCategory = 'All';
    const filters = [...document.querySelectorAll('.category-chip')];
    const matchesCategory = (text) => {
      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Bags') return /backpack|bag/i.test(text);
      if (selectedCategory === 'Keys') return /key|lanyard|id\b/i.test(text);
      if (selectedCategory === 'Devices') return /pixel|smartphone|device|phone/i.test(text);
      return /calculator|notebook|stationery|supplies/i.test(text);
    };
    const applyFilters = () => {
      const query = search.value.trim().toLocaleLowerCase();
      cards.forEach((card) => {
        const text = card.textContent.toLocaleLowerCase();
        card.style.display = (!query || text.includes(query)) && matchesCategory(text) ? '' : 'none';
      });
    };
    search.addEventListener('input', applyFilters);
    filters.forEach((button) => {
      button.addEventListener('click', () => {
        selectedCategory = button.dataset.filter || 'All';
        filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter === button)));
        applyFilters();
      });
    });
    const requestedCategory = new URLSearchParams(location.search).get('category');
    const initialFilter = filters.find((button) => button.dataset.filter.toLocaleLowerCase() === requestedCategory?.toLocaleLowerCase());
    if (initialFilter) initialFilter.click();
    else applyFilters();
  }

  function connectDashboardCategories() {
    if (location.pathname.split('/').pop() !== 'index.html' && location.pathname !== '/') return;
    const categoryByLabel = [
      [/bags/i, 'Bags'],
      [/keys/i, 'Keys'],
      [/hardware/i, 'Devices'],
      [/stationary|stationery/i, 'Stationery'],
      [/all gear/i, 'All']
    ];
    document.querySelectorAll('main button').forEach((button) => {
      const label = button.textContent.trim();
      const match = categoryByLabel.find(([pattern]) => pattern.test(label));
      if (!match) return;
      button.addEventListener('click', () => {
        location.href = `gear-radar.html?category=${encodeURIComponent(match[1])}`;
      });
    });
  }

  function connectNotices() {
    document.querySelectorAll('button[aria-label*="Notifications"]').forEach((button) => {
      button.addEventListener('click', () => showNotice('You’re all caught up.'));
    });
    document.querySelectorAll('a[href="#"]:not([data-path])').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const label = link.textContent.trim().replace(/\s+/g, ' ');
        showNotice(label ? `${label} is not connected yet.` : 'This option is not connected yet.');
      });
    });
    if (!location.pathname.endsWith('/profile.html')) return;
    document.querySelectorAll('button').forEach((button) => {
      if (button.id || button.hasAttribute('aria-label') || button.closest('#checklistContainer')) return;
      if (button.closest('form')) return;
      button.addEventListener('click', () => {
        const label = button.textContent.trim().replace(/\s+/g, ' ');
        if (label) showNotice(`${label} selected.`);
      });
    });
  }

  function connectInstallPrompt() {
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    let installPrompt = null;
    if (isInstalled) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Install PackDay';
    button.setAttribute('aria-label', 'Install PackDay app');
    Object.assign(button.style, {
      position: 'fixed',
      right: '16px',
      bottom: 'calc(92px + env(safe-area-inset-bottom, 0px))',
      zIndex: '60',
      display: 'none',
      minHeight: '44px',
      padding: '0 16px',
      border: '0',
      borderRadius: '22px',
      background: '#c0c1ff',
      color: '#1000a9',
      font: '600 14px Inter, sans-serif',
      boxShadow: '0 4px 16px rgba(0,0,0,.35)'
    });
    document.body.appendChild(button);

    if (isIos) button.style.display = 'block';
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installPrompt = event;
      button.style.display = 'block';
    });
    button.addEventListener('click', async () => {
      if (!installPrompt) {
        showNotice('In Safari, tap Share, then “Add to Home Screen”.');
        return;
      }
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') button.style.display = 'none';
      installPrompt = null;
    });
    window.addEventListener('appinstalled', () => { button.style.display = 'none'; });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.error('PackDay could not register its offline support.', error);
    });
  }

  connectNavigation();
  restoreChecklist();
  persistChecklistInteractions();
  persistDashboardCheckboxes();
  persistScheduleToggles();
  connectSearch();
  connectDashboardCategories();
  connectNotices();
  connectInstallPrompt();
  registerServiceWorker();

  if (new URLSearchParams(location.search).has('add')) {
    document.getElementById('quickAddInput')?.focus();
  }
})();
