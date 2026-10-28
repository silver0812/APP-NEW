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
    schedule: 'packday.schedule.v1',
    profile: 'packday.profile.v1',
    events: 'packday.events.v1',
    freshStart: 'packday.fresh-start.v2'
  };
  const defaultProfilePhoto = './icons/profile-placeholder.svg';

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
      return true;
    } catch (error) {
      console.error(`PackDay could not save data for "${key}".`, error);
      showNotice('Changes could not be saved on this device.');
      return false;
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
      const image = document.createElement('img');
      image.className = 'w-8 h-8 rounded-full object-cover';
      image.dataset.profileAvatar = '';
      image.src = defaultProfilePhoto;
      image.alt = 'Default profile photo';
      profileLink.appendChild(image);
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

  function resetSavedDataForFreshStart() {
    try {
      if (localStorage.getItem(storageKeys.freshStart) === 'done') return;
      [storageKeys.checklist, storageKeys.dashboard, storageKeys.schedule, storageKeys.profile, storageKeys.events]
        .forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(storageKeys.freshStart, 'done');
    } catch (error) {
      console.error('PackDay could not reset the previous saved app data.', error);
      showNotice('Previous app data could not be cleared on this device.');
    }
  }

  function loadProfile() {
    const saved = readStorage(storageKeys.profile, {});
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return { name: '', photo: '', accountUid: '', email: '' };
    return {
      name: typeof saved.name === 'string' ? saved.name : '',
      photo: typeof saved.photo === 'string' ? saved.photo : '',
      accountUid: typeof saved.accountUid === 'string' ? saved.accountUid : '',
      email: typeof saved.email === 'string' ? saved.email : ''
    };
  }

  resetSavedDataForFreshStart();
  let profile = loadProfile();
  let googleUser = null;
  let authConfigured = false;

  function renderProfile() {
    const name = profile.name.trim();
    const nameLabel = name || 'Your name';
    const shortName = name ? name.split(/\s+/)[0] : 'Profile';
    document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = nameLabel; });
    document.querySelectorAll('[data-profile-short-name]').forEach((element) => { element.textContent = shortName; });
    document.querySelectorAll('[data-profile-avatar]').forEach((image) => {
      image.src = profile.photo || defaultProfilePhoto;
      image.alt = name ? `${name}'s profile photo` : 'Default profile photo';
    });

    const status = document.querySelector('[data-profile-status]');
    if (status) status.textContent = googleUser ? 'Google account' : authConfigured ? 'Not signed in' : 'Local profile';
    const email = document.querySelector('[data-profile-email]');
    if (email) email.textContent = googleUser?.email || 'Saved on this device';
    const accountNote = document.querySelector('[data-profile-account-note]');
    if (accountNote) {
      accountNote.textContent = googleUser
        ? 'Google account connected'
        : authConfigured ? 'Sign in to connect your account' : 'Google sign-in setup is required';
    }

    const signInButton = document.getElementById('googleSignInBtn');
    const setupHint = document.querySelector('[data-google-setup-hint]');
    if (setupHint) setupHint.hidden = authConfigured;
    const signInLabel = document.querySelector('[data-google-sign-in-label]');
    if (signInLabel) signInLabel.textContent = googleUser ? 'Switch Google account' : 'Sign up or sign in with Google';
    if (signInButton) signInButton.disabled = false;
    const signOutButton = document.getElementById('signOutBtn');
    if (signOutButton) {
      signOutButton.disabled = !googleUser;
      signOutButton.setAttribute('aria-disabled', String(!googleUser));
    }
  }

  function profileImageData(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Choose an image file for your profile photo.'));
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        reject(new Error('Choose a photo smaller than 8 MB.'));
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          if (!image.naturalWidth || !image.naturalHeight) throw new Error('This photo could not be opened.');
          const canvas = document.createElement('canvas');
          const size = 320;
          const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight, 1);
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext('2d');
          if (!context) throw new Error('This photo could not be processed on your device.');
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch (error) {
          reject(error);
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('This photo could not be opened.'));
      };
      image.src = objectUrl;
    });
  }

  function connectProfile() {
    const editButton = document.getElementById('editProfileBtn');
    const dialog = document.getElementById('profileEditDialog');
    const form = document.getElementById('profileEditForm');
    const nameInput = document.getElementById('profileNameInput');
    const photoInput = document.getElementById('profilePhotoInput');
    const photoPreview = document.getElementById('profileEditPreview');
    const removePhotoButton = document.getElementById('removeProfilePhotoBtn');
    const saveButton = form?.querySelector('button[type="submit"]');
    let editedPhoto = profile.photo;
    let photoLoading = false;

    if (editButton && dialog && form && nameInput && photoInput && removePhotoButton) {
      editButton.addEventListener('click', () => {
        nameInput.value = profile.name;
        photoInput.value = '';
        editedPhoto = profile.photo;
        if (photoPreview) photoPreview.src = editedPhoto || defaultProfilePhoto;
        dialog.showModal();
      });
      photoInput.addEventListener('change', async () => {
        const file = photoInput.files?.[0];
        if (!file) return;
        photoLoading = true;
        if (saveButton) saveButton.disabled = true;
        try {
          editedPhoto = await profileImageData(file);
          if (photoPreview) photoPreview.src = editedPhoto;
        } catch (error) {
          console.error('PackDay could not load the selected profile photo.', error);
          showNotice(error.message);
          photoInput.value = '';
          if (photoPreview) photoPreview.src = editedPhoto || defaultProfilePhoto;
        } finally {
          photoLoading = false;
          if (saveButton) saveButton.disabled = false;
        }
      });
      removePhotoButton.addEventListener('click', () => {
        editedPhoto = '';
        photoInput.value = '';
        if (photoPreview) photoPreview.src = defaultProfilePhoto;
        showNotice('The default profile photo will be used.');
      });
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (photoLoading) {
          showNotice('Wait for the profile photo to finish loading.');
          return;
        }
        const nextName = nameInput.value.trim();
        if (!nextName) {
          nameInput.setCustomValidity('Enter a name for your profile.');
          nameInput.reportValidity();
          return;
        }
        nameInput.setCustomValidity('');
        profile = { ...profile, name: nextName, photo: editedPhoto };
        if (writeStorage(storageKeys.profile, profile)) {
          renderProfile();
          dialog.close();
          showNotice('Profile saved on this device.');
        }
      });
      dialog.querySelector('[data-close-profile]')?.addEventListener('click', () => dialog.close());
    }

    document.getElementById('googleSignInBtn')?.addEventListener('click', async () => {
      if (!authConfigured || !window.packdayAuth) {
        showNotice('Google sign-in needs Firebase setup before it can be used.');
        return;
      }
      try {
        await window.packdayAuth.signIn();
      } catch (error) {
        console.error('PackDay Google sign-in failed.', error);
        showNotice(error.code === 'auth/popup-closed-by-user' ? 'Google sign-in was cancelled.' : 'Google sign-in failed. Check your connection and account settings.');
      }
    });

    document.getElementById('signOutBtn')?.addEventListener('click', async () => {
      if (!googleUser || !window.packdayAuth) {
        showNotice('No Google account is signed in.');
        return;
      }
      try {
        await window.packdayAuth.signOut();
      } catch (error) {
        console.error('PackDay could not sign out of Google.', error);
        showNotice('Sign out failed. Please try again.');
      }
    });

    window.addEventListener('packday-auth-state', (event) => {
      authConfigured = Boolean(event.detail?.configured);
      googleUser = event.detail?.user || null;
      if (googleUser) {
        if (profile.accountUid !== googleUser.uid) {
          profile = {
            name: googleUser.displayName || '',
            photo: googleUser.photoURL || '',
            accountUid: googleUser.uid,
            email: googleUser.email || ''
          };
        } else {
          profile.email = googleUser.email || '';
          if (!profile.name) profile.name = googleUser.displayName || '';
          if (!profile.photo) profile.photo = googleUser.photoURL || '';
        }
        writeStorage(storageKeys.profile, profile);
      } else if (authConfigured && profile.accountUid) {
        profile = { name: '', photo: '', accountUid: '', email: '' };
        writeStorage(storageKeys.profile, profile);
      }
      renderProfile();
    });
    renderProfile();
  }

  function initializeAuth() {
    const config = window.PACKDAY_FIREBASE_CONFIG;
    if (!config || !config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      window.dispatchEvent(new CustomEvent('packday-auth-state', {
        detail: { configured: false, user: null }
      }));
      return;
    }
    import('./firebase-auth.js')
      .then(({ initializePackDayAuth }) => initializePackDayAuth(config))
      .catch((error) => {
        console.error('PackDay could not initialize Google sign-in.', error);
        showNotice('Google sign-in could not start. Check the Firebase configuration and internet connection.');
      });
  }

  function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function dateFromKey(key) {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function localMonthRange(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { start, end };
  }

  function getLocalEvents() {
    const events = readStorage(storageKeys.events, []);
    return Array.isArray(events) ? events.filter((event) =>
      event && typeof event.id === 'string'
      && typeof event.title === 'string'
      && typeof event.date === 'string'
      && typeof event.start === 'string'
      && typeof event.end === 'string'
    ) : [];
  }

  let localEvents = getLocalEvents();
  let googleCalendarEvents = [];
  let selectedCalendarDate = dateKey(new Date());
  let displayedCalendarMonth = new Date();
  let liveCalendarToday = selectedCalendarDate;

  function setDisplayedCalendarMonth(date) {
    const nextMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const changed = nextMonth.getFullYear() !== displayedCalendarMonth.getFullYear()
      || nextMonth.getMonth() !== displayedCalendarMonth.getMonth();
    displayedCalendarMonth = nextMonth;
    if (changed) {
      googleCalendarEvents = [];
      const status = document.getElementById('calendarConnectionStatus');
      if (authConfigured && status) status.textContent = 'Sync Google Calendar to load events for this month.';
    }
  }

  function eventDate(event) {
    if (event.source === 'google' && event.dateTime) return dateKey(new Date(event.dateTime));
    return event.date;
  }

  function formatEventTime(event) {
    if (event.allDay) return 'All day';
    const format = (value) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
      .format(new Date(value));
    if (event.dateTime) return `${format(event.dateTime)}${event.endDateTime ? `–${format(event.endDateTime)}` : ''}`;
    const formatLocal = (value) => {
      const [hour, minute] = value.split(':').map(Number);
      return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
        .format(new Date(2000, 0, 1, hour, minute));
    };
    return `${formatLocal(event.start)}–${formatLocal(event.end)}`;
  }

  function renderCalendarEvents() {
    const list = document.getElementById('calendarEvents');
    const selectedLabel = document.getElementById('selectedCalendarDay');
    if (!list || !selectedLabel) return;
    selectedLabel.textContent = new Intl.DateTimeFormat(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }).format(dateFromKey(selectedCalendarDate));
    list.replaceChildren();

    const events = [...localEvents, ...googleCalendarEvents]
      .filter((event) => eventDate(event) === selectedCalendarDate)
      .sort((left, right) => (left.dateTime || `${left.date}T${left.start || '00:00'}`)
        .localeCompare(right.dateTime || `${right.date}T${right.start || '00:00'}`));
    if (!events.length) {
      const empty = document.createElement('p');
      empty.className = 'rounded-xl bg-surface-container-low p-space-md text-body-sm text-body-sm text-on-surface-variant';
      empty.textContent = 'No events for this day. Add an event or sync Google Calendar.';
      list.appendChild(empty);
      return;
    }

    events.forEach((event) => {
      const card = document.createElement('article');
      card.className = 'flex items-start justify-between gap-space-sm rounded-xl bg-surface-container-low p-space-md';
      const detail = document.createElement('div');
      detail.className = 'min-w-0';
      const title = document.createElement('h3');
      title.className = 'font-label-lg text-label-lg text-on-surface break-words';
      title.textContent = event.title;
      const time = document.createElement('p');
      time.className = 'font-body-sm text-body-sm text-secondary mt-1';
      time.textContent = `${formatEventTime(event)}${event.source === 'google' ? ' · Google Calendar' : ''}`;
      detail.append(title, time);
      if (event.location) {
        const location = document.createElement('p');
        location.className = 'font-body-sm text-body-sm text-on-surface-variant mt-1';
        location.textContent = event.location;
        detail.appendChild(location);
      }
      card.appendChild(detail);
      if (event.source !== 'google') {
        const remove = document.createElement('button');
        remove.className = 'min-w-10 min-h-10 rounded-lg bg-surface-container-high text-error';
        remove.type = 'button';
        remove.setAttribute('aria-label', `Delete ${event.title}`);
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.textContent = 'delete';
        remove.appendChild(icon);
        remove.addEventListener('click', () => {
          localEvents = localEvents.filter((item) => item.id !== event.id);
          if (writeStorage(storageKeys.events, localEvents)) renderCalendar();
        });
        card.appendChild(remove);
      }
      list.appendChild(card);
    });
  }

  function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const monthLabel = document.getElementById('calendarMonthLabel');
    const dateLabel = document.getElementById('liveCalendarDate');
    if (!grid || !monthLabel || !dateLabel) return;
    const today = new Date();
    dateLabel.textContent = new Intl.DateTimeFormat(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }).format(today);
    monthLabel.textContent = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
      .format(displayedCalendarMonth);
    grid.replaceChildren();

    const first = new Date(displayedCalendarMonth.getFullYear(), displayedCalendarMonth.getMonth(), 1);
    const daysInMonth = new Date(displayedCalendarMonth.getFullYear(), displayedCalendarMonth.getMonth() + 1, 0).getDate();
    for (let blank = 0; blank < first.getDay(); blank += 1) {
      const spacer = document.createElement('span');
      spacer.setAttribute('aria-hidden', 'true');
      grid.appendChild(spacer);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(displayedCalendarMonth.getFullYear(), displayedCalendarMonth.getMonth(), day);
      const key = dateKey(date);
      const button = document.createElement('button');
      const isSelected = key === selectedCalendarDate;
      const isToday = key === dateKey(today);
      button.type = 'button';
      button.className = `relative min-h-11 rounded-xl flex flex-col items-center justify-center font-label-md text-label-md ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'} ${isToday && !isSelected ? 'ring-1 ring-secondary' : ''}`;
      button.setAttribute('role', 'gridcell');
      button.setAttribute('aria-label', new Intl.DateTimeFormat(undefined, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      }).format(date));
      button.setAttribute('aria-pressed', String(isSelected));
      button.textContent = String(day);
      const hasEvents = [...localEvents, ...googleCalendarEvents].some((event) => eventDate(event) === key);
      if (hasEvents) {
        const dot = document.createElement('span');
        dot.className = `absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-on-primary' : 'bg-secondary'}`;
        dot.setAttribute('aria-hidden', 'true');
        button.appendChild(dot);
      }
      button.addEventListener('click', () => {
        selectedCalendarDate = key;
        document.getElementById('calendarDatePicker').value = key;
        renderCalendar();
      });
      grid.appendChild(button);
    }
    renderCalendarEvents();
  }

  function updateLiveClock() {
    const now = new Date();
    const clock = document.getElementById('liveClock');
    const timeZone = document.getElementById('calendarTimeZone');
    const dateLabel = document.getElementById('liveCalendarDate');
    if (clock) {
      clock.dateTime = now.toISOString();
      clock.textContent = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric', minute: '2-digit', second: '2-digit'
      }).format(now);
    }
    if (timeZone) timeZone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
    if (dateLabel) {
      dateLabel.textContent = new Intl.DateTimeFormat(undefined, {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      }).format(now);
    }
    const todayKey = dateKey(now);
    if (todayKey !== liveCalendarToday) {
      const previousToday = liveCalendarToday;
      liveCalendarToday = todayKey;
      if (selectedCalendarDate === previousToday) {
        selectedCalendarDate = todayKey;
        setDisplayedCalendarMonth(now);
        const datePicker = document.getElementById('calendarDatePicker');
        if (datePicker) datePicker.value = todayKey;
      }
      renderCalendar();
    }
  }

  function connectCalendar() {
    const section = document.getElementById('liveCalendarSection');
    if (!section) return;
    const datePicker = document.getElementById('calendarDatePicker');
    const eventDialog = document.getElementById('calendarEventDialog');
    const eventForm = document.getElementById('calendarEventForm');
    const connectionStatus = document.getElementById('calendarConnectionStatus');

    document.getElementById('calendarPrevMonth').addEventListener('click', () => {
      setDisplayedCalendarMonth(new Date(displayedCalendarMonth.getFullYear(), displayedCalendarMonth.getMonth() - 1, 1));
      selectedCalendarDate = dateKey(displayedCalendarMonth);
      datePicker.value = selectedCalendarDate;
      renderCalendar();
    });
    document.getElementById('calendarNextMonth').addEventListener('click', () => {
      setDisplayedCalendarMonth(new Date(displayedCalendarMonth.getFullYear(), displayedCalendarMonth.getMonth() + 1, 1));
      selectedCalendarDate = dateKey(displayedCalendarMonth);
      datePicker.value = selectedCalendarDate;
      renderCalendar();
    });
    document.getElementById('calendarTodayBtn').addEventListener('click', () => {
      const today = new Date();
      selectedCalendarDate = dateKey(today);
      setDisplayedCalendarMonth(today);
      datePicker.value = selectedCalendarDate;
      renderCalendar();
    });
    datePicker.addEventListener('change', () => {
      if (!datePicker.value) return;
      selectedCalendarDate = datePicker.value;
      const date = dateFromKey(selectedCalendarDate);
      setDisplayedCalendarMonth(date);
      renderCalendar();
    });
    document.getElementById('calendarAddEventBtn').addEventListener('click', () => {
      const date = dateFromKey(selectedCalendarDate);
      const start = new Date();
      start.setHours(start.getHours() + 1, 0, 0, 0);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const timeValue = (value) => `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
      document.getElementById('eventDateInput').value = dateKey(date);
      document.getElementById('eventStartInput').value = timeValue(start);
      document.getElementById('eventEndInput').value = timeValue(end);
      eventDialog.showModal();
    });
    eventDialog.querySelector('[data-close-event]')?.addEventListener('click', () => eventDialog.close());
    eventForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const title = document.getElementById('eventTitleInput').value.trim();
      const date = document.getElementById('eventDateInput').value;
      const start = document.getElementById('eventStartInput').value;
      const end = document.getElementById('eventEndInput').value;
      if (!title || !date || !start || !end || end <= start) {
        showNotice('Enter an event name and a valid start and end time.');
        return;
      }
      localEvents.push({
        id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        title,
        date,
        start,
        end,
        location: document.getElementById('eventLocationInput').value.trim(),
        source: 'local'
      });
      if (writeStorage(storageKeys.events, localEvents)) {
        selectedCalendarDate = date;
        setDisplayedCalendarMonth(dateFromKey(date));
        datePicker.value = date;
        eventForm.reset();
        eventDialog.close();
        renderCalendar();
        showNotice('Event saved on this device.');
      }
    });
    document.getElementById('calendarSyncGoogleBtn').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      if (!authConfigured || !window.packdayAuth) {
        showNotice('Google Calendar sync needs Firebase setup first.');
        if (connectionStatus) connectionStatus.textContent = 'Set up Google sign-in to connect your calendar. Events you add here are saved on this device.';
        return;
      }
      button.disabled = true;
      if (connectionStatus) connectionStatus.textContent = 'Connect your Google account and approve read-only Calendar access.';
      try {
        const token = await window.packdayAuth.getCalendarAccessToken();
        const { start, end } = localMonthRange(displayedCalendarMonth);
        const params = new URLSearchParams({
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '250'
        });
        const items = [];
        let pageToken = '';
        do {
          if (pageToken) params.set('pageToken', pageToken);
          const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) throw new Error(`Google Calendar returned HTTP ${response.status}.`);
          const data = await response.json();
          items.push(...(data.items || []));
          pageToken = data.nextPageToken || '';
        } while (pageToken);
        googleCalendarEvents = items
          .filter((item) => item.status !== 'cancelled' && item.start && (item.start.dateTime || item.start.date))
          .map((item) => ({
            id: item.id,
            title: item.summary || 'Untitled event',
            location: item.location || '',
            source: 'google',
            date: item.start.date || dateKey(new Date(item.start.dateTime)),
            dateTime: item.start.dateTime || '',
            endDateTime: item.end?.dateTime || '',
            allDay: Boolean(item.start.date)
          }));
        renderCalendar();
        if (connectionStatus) connectionStatus.textContent = `${googleCalendarEvents.length} Google Calendar event${googleCalendarEvents.length === 1 ? '' : 's'} loaded for this month.`;
      } catch (error) {
        console.error('PackDay could not sync Google Calendar.', error);
        showNotice(error.message.includes('HTTP 403')
          ? 'Google Calendar access is not enabled for this project yet.'
          : 'Google Calendar sync failed. Check permissions and try again.');
        if (connectionStatus) connectionStatus.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });

    datePicker.value = selectedCalendarDate;
    updateLiveClock();
    renderCalendar();
    window.setInterval(updateLiveClock, 1000);
    window.addEventListener('packday-auth-state', (event) => {
      if (connectionStatus && !event.detail?.configured) {
        connectionStatus.textContent = 'Set up Google sign-in to connect your calendar. Events you add here are saved on this device.';
      }
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
  connectProfile();
  connectCalendar();
  initializeAuth();
  connectInstallPrompt();
  registerServiceWorker();

  if (new URLSearchParams(location.search).has('add')) {
    document.getElementById('quickAddInput')?.focus();
  }
})();
