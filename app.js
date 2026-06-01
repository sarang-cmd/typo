/**
 * Typo - Premium Technical Typing Speed Game
 * Core Application Logic & Gamified Academy
 */

// Global sound synthesizer class
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  updateCurrencyUI() {
    const coinsEl = document.getElementById('ui-coins');
    const gemsEl = document.getElementById('ui-gems');
    if (coinsEl) coinsEl.textContent = String(this.coins);
    if (gemsEl) gemsEl.textContent = String(this.gems);
  }

  showToast(text, timeout = 3200) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const node = document.createElement('div');
    node.style = 'background:rgba(0,0,0,0.7); color:#fff; padding:0.6rem 0.9rem; border-radius:8px; min-width:180px; box-shadow:0 6px 18px rgba(0,0,0,0.4); font-weight:700;';
    node.textContent = text;
    container.appendChild(node);
    setTimeout(() => {
      node.style.transition = 'opacity 300ms ease, transform 300ms ease';
      node.style.opacity = '0';
      node.style.transform = 'translateY(6px)';
      setTimeout(() => container.removeChild(node), 350);
    }, timeout);
  }

  // --- Friends modal ---
  openFriendsModal() {
    if (!this.friendsModal) return;
    this.renderFriendsList();
    this.friendsModal.showModal();
  }

  renderFriendsList() {
    const listEl = document.getElementById('friends-list');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!this.friends || this.friends.length === 0) {
      listEl.innerHTML = '<div style="color:var(--text-muted)">No friends yet.</div>';
      return;
    }
    this.friends.forEach(f => {
      const row = document.createElement('div');
      row.style = 'display:flex; justify-content:space-between; align-items:center; padding:0.4rem; border-radius:0.35rem; background:rgba(255,255,255,0.02);';
      row.innerHTML = `<div style="display:flex; gap:0.6rem; align-items:center;"><div style="width:28px;height:28px;border-radius:50%;background:${f.color||'#666'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">${(f.name||'').slice(0,1).toUpperCase()}</div><div>${f.name}</div></div><button class="btn view-friend-btn" data-name="${f.name}">View</button>`;
      listEl.appendChild(row);
    });
  }

  addFriend() {
    const input = document.getElementById('friend-add-input');
    if (!input) return;
    const name = input.value.trim();
    if (!name) return;
    const entry = { name, color: '#'+Math.floor(Math.random()*16777215).toString(16) };
    this.friends.push(entry);
    localStorage.setItem('typo_friends', JSON.stringify(this.friends));
    input.value = '';
    this.renderFriendsList();
    try { this.showToast(`Friend added: ${entry.name}`); } catch(e) {}
  }

  openAccountModal() {
    if (!this.accountModal) return;
    // populate fields
    document.getElementById('profile-username').value = this.profile.username || '';
    document.getElementById('profile-color').value = this.profile.color || '#6b46c1';
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
      const initials = (this.profile && this.profile.avatar && this.profile.avatar.initials) || (this.profile && this.profile.username ? this.profile.username.slice(0,2).toUpperCase() : 'TT');
      const color = (this.profile && this.profile.color) || '#6b46c1';
      avatarEl.style.background = color;
      avatarEl.textContent = initials;
    }
    // badges
    const badges = document.getElementById('profile-badges');
    if (badges) {
      badges.innerHTML = '';
      // show achievements and XP milestones
      const ach = this.loadAchievements();
      ach.forEach(a => {
        const el = document.createElement('div');
        el.style = 'padding:0.4rem; border-radius:0.4rem; background:rgba(255,255,255,0.03);';
        el.textContent = a.title + (a.earned ? ' ✓' : '');
        if (a.earned) el.style.boxShadow = '0 0 8px rgba(0,242,254,0.2)';
        badges.appendChild(el);
      });
      const milestones = [100, 500, 1000];
      milestones.forEach(m => {
        const el = document.createElement('div');
        el.style = 'padding:0.4rem; border-radius:0.4rem; background:rgba(255,255,255,0.02);';
        el.textContent = `${m} XP`; if (this.userXP >= m) el.style.boxShadow = '0 0 6px rgba(168,85,247,0.12)';
        badges.appendChild(el);
      });
    }
    this.accountModal.showModal();
  }

  saveProfile() {
    const name = document.getElementById('profile-username').value || 'Player';
    const color = document.getElementById('profile-color').value || '#6b46c1';
    this.profile.username = name;
    this.profile.color = color;
    if (!this.profile.avatar) {
      const initials = name.split(' ').filter(Boolean).map(s => s[0]).slice(0,2).join('').toUpperCase();
      this.profile.avatar = { initials, color };
    } else {
      this.profile.avatar.color = color;
    }
    localStorage.setItem('typo_profile', JSON.stringify(this.profile));
    this.accountModal.close();
    this.updateHeaderAvatar();
    try { this.showToast(`Profile saved: ${name}`); } catch(e) {}
    this.triggerMascotSpeech(`Profile saved. Hello **${name}**!`);
  }

  openChestWithCoins() {
    if (this.coins < 50) {
      document.getElementById('treasure-result').textContent = 'Not enough coins.';
      return;
    }
    this.coins -= 50;
    localStorage.setItem('typo_coins', String(this.coins));
    this.updateCurrencyUI();
    // disable chest buttons briefly to prevent double-clicks
    const openCoinsBtn = document.getElementById('open-chest-coins');
    const openGemsBtn = document.getElementById('open-chest-gems');
    if (openCoinsBtn) openCoinsBtn.disabled = true;
    if (openGemsBtn) openGemsBtn.disabled = true;
    this.resolveChestReward('coin');
    setTimeout(() => { if (openCoinsBtn) openCoinsBtn.disabled = false; if (openGemsBtn) openGemsBtn.disabled = false; }, 1200);
  }

  openChestWithGems() {
    if (this.gems < 1) {
      document.getElementById('treasure-result').textContent = 'Not enough gems.';
      return;
    }
    this.gems -= 1;
    localStorage.setItem('typo_gems', String(this.gems));
    this.updateCurrencyUI();
    const openCoinsBtn = document.getElementById('open-chest-coins');
    const openGemsBtn = document.getElementById('open-chest-gems');
    if (openCoinsBtn) openCoinsBtn.disabled = true;
    if (openGemsBtn) openGemsBtn.disabled = true;
    this.resolveChestReward('gem');
    setTimeout(() => { if (openCoinsBtn) openCoinsBtn.disabled = false; if (openGemsBtn) openGemsBtn.disabled = false; }, 1200);
  }

  watchAdForChest() {
    const btn = document.getElementById('watch-ad-btn');
    if (btn) btn.disabled = true;
    document.getElementById('treasure-result').textContent = 'Watching ad...';
    setTimeout(() => {
      if (btn) btn.disabled = false;
      // show a small toast that ad finished
      this.resolveChestReward('ad');
      this.showToast('Ad finished — chest opened');
    }, 3000);
  }

  resolveChestReward(kind) {
    // simple gacha: reward coins and rare gems
    const rand = Math.random();
    let message = '';
    if (rand < 0.02) { this.gems += 2; message = '🎉 Jackpot! +2 gems'; }
    else if (rand < 0.2) { const c = 200; this.coins += c; message = `+${c} coins`; }
    else { const c = 40 + Math.round(Math.random() * 60); this.coins += c; message = `+${c} coins`; }
    localStorage.setItem('typo_coins', String(this.coins));
    localStorage.setItem('typo_gems', String(this.gems));
    this.updateCurrencyUI();
    document.getElementById('treasure-result').textContent = message;
    // brief toast summary of reward
    try { this.showToast(message); } catch (e) { /* noop */ }
  }

  startVaultPractice() {
    // Begin a focused vault-only practice session
    this.vaultPracticeActive = true;
    this.currentLesson = null;
    this.activeMode = 'spaced-rep';
    this.switchTab('arena');
    // Hide standard category controls for focused practice
    const cfg = document.getElementById('arena-config-panel');
    if (cfg) cfg.style.display = 'none';
    // clear previous injected words and restart
    this.injectedVaultWords = [];
    this.restartRound();
  }

  applyHandTips(enabled) {
    if (!this.handGuideEl) return;
    const arenaCard = document.querySelector('.arena-card');
    if (enabled) {
      // move hand guide next to typing area
      try {
        arenaCard.appendChild(this.handGuideEl);
        this.handGuideEl.style.width = '220px';
        this.handGuideEl.style.float = 'right';
        this.handGuideEl.style.marginLeft = '1rem';
        this.handGuideEl.style.display = 'block';
      } catch (e) {
        console.warn('Could not move hand guide', e);
      }
    } else {
      // restore original location
      try {
        if (this._handGuideOriginalParent) {
          this._handGuideOriginalParent.insertBefore(this.handGuideEl, this._handGuideOriginalNext);
        }
        this.handGuideEl.style.float = '';
        this.handGuideEl.style.marginLeft = '';
        this.handGuideEl.style.width = '';
        this.handGuideEl.style.display = '';
      } catch (e) {
        console.warn('Could not restore hand guide', e);
      }
    }
  }

  lazyInit() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick(isSpacebar = false) {
    if (!this.enabled) return;
    this.lazyInit();
    
    const now = this.ctx.currentTime;
    
    // 1. Noise click component (wood/plastic mechanical feel)
    const bufferSize = this.ctx.sampleRate * 0.02; // 20ms burst
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(isSpacebar ? 600 : 900, now);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isSpacebar ? 0.08 : 0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpacebar ? 0.025 : 0.015));
    
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    
    // 2. Synthesized Pop component for mechanical weight
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isSpacebar ? 150 : 340, now);
    osc.frequency.exponentialRampToValueAtTime(isSpacebar ? 80 : 180, now + 0.012);
    
    oscGain.gain.setValueAtTime(isSpacebar ? 0.06 : 0.08, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isSpacebar ? 0.03 : 0.012));
    
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    noiseNode.start(now);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playError() {
    if (!this.enabled) return;
    this.lazyInit();
    
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    
    oscGain.gain.setValueAtTime(0.15, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playVictory() {
    if (!this.enabled) return;
    this.lazyInit();
    
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      oscGain.gain.setValueAtTime(0.05, now + idx * 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
      
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }
}

// Global WPM Chart management using HTML5 Canvas
class WpmChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.history = [];
    this.enabled = true;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.draw();
  }

  update(history) {
    this.history = history;
    this.draw();
  }

  clear() {
    this.history = [];
    this.draw();
  }

  draw() {
    if (!this.canvas || !this.enabled) return;
    
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;
    const ctx = this.ctx;
    
    ctx.clearRect(0, 0, width, height);
    
    if (this.history.length === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '500 0.9rem Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Live graph plots speed as you type...', width / 2, height / 2);
      return;
    }
    
    const padding = { top: 20, right: 25, bottom: 25, left: 35 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    
    const maxWpm = Math.max(100, ...this.history.map(d => d.wpm)) * 1.15;
    const minWpm = 0;
    const maxSec = Math.max(10, this.history.length);
    
    // Draw Y grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '500 0.7rem Outfit, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const yGridCount = 4;
    for (let i = 0; i <= yGridCount; i++) {
      const val = minWpm + (maxWpm - minWpm) * (i / yGridCount);
      const y = padding.top + plotHeight * (1 - (i / yGridCount));
      
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      ctx.fillText(Math.round(val), padding.left - 8, y);
    }
    
    // Draw X grid
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xGridCount = 5;
    for (let i = 0; i < xGridCount; i++) {
      const sec = Math.round((maxSec * i) / (xGridCount - 1));
      const x = padding.left + (plotWidth * i) / (xGridCount - 1);
      
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
      
      ctx.fillText(`${sec}s`, x, height - padding.bottom + 6);
    }
    
    // Draw curves
    ctx.beginPath();
    this.history.forEach((d, idx) => {
      const x = padding.left + (plotWidth * idx) / (maxSec - 1);
      const y = padding.top + plotHeight * (1 - (d.wpm - minWpm) / (maxWpm - minWpm));
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.save();
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 242, 254, 0.4)';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();
    
    if (this.history.length > 0) {
      const startX = padding.left;
      const endX = padding.left + (plotWidth * (this.history.length - 1)) / (maxSec - 1);
      
      ctx.lineTo(endX, height - padding.bottom);
      ctx.lineTo(startX, height - padding.bottom);
      ctx.closePath();
      
      const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.2)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0.01)');
      
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }
}

// Spaced Repetition LocalStorage Vault Manager
class MistakeVault {
  constructor() {
    this.storageKey = 'typo_mistake_vault';
    this.data = this.load();
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return { words: {}, masteredCount: 0 };
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.words) parsed.words = {};
      if (typeof parsed.masteredCount !== 'number') parsed.masteredCount = 0;
      return parsed;
    } catch (e) {
      console.error("Corrupted vault local storage, resetting.", e);
      return { words: {}, masteredCount: 0 };
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    this.updateUIBadge();
  }

  addWord(word) {
    const clean = this.cleanWord(word);
    if (!clean || clean.length < 2) return;
    
    if (!this.data.words[clean]) {
      this.data.words[clean] = {
        word: clean,
        streak: 0,
        mistakeCount: 1,
        createdAt: Date.now(),
        lastSeen: 0,
        mastered: false
      };
    } else {
      this.data.words[clean].mistakeCount++;
      if (this.data.words[clean].mastered) {
        this.data.words[clean].mastered = false;
        this.data.words[clean].streak = 0;
        this.data.masteredCount = Math.max(0, this.data.masteredCount - 1);
      }
    }
    this.save();
  }

  recordTypingResult(word, flawless) {
    const clean = this.cleanWord(word);
    if (!clean || !this.data.words[clean]) return;
    
    const entry = this.data.words[clean];
    entry.lastSeen = Date.now();
    
    if (flawless) {
      entry.streak++;
      if (entry.streak >= 3) {
        entry.mastered = true;
        this.data.masteredCount++;
      }
    } else {
      entry.streak = 0;
      entry.mistakeCount++;
    }
    this.save();
  }

  removeWord(word) {
    const clean = this.cleanWord(word);
    if (this.data.words[clean]) {
      if (this.data.words[clean].mastered) {
        this.data.masteredCount = Math.max(0, this.data.masteredCount - 1);
      }
      delete this.data.words[clean];
      this.save();
    }
  }

  clearAll() {
    this.data = { words: {}, masteredCount: 0 };
    this.save();
  }

  cleanWord(word) {
    return word.trim().replace(/^[^a-zA-Z0-9#_]+|[^a-zA-Z0-9#_]+$/g, '');
  }

  getActiveMistakes() {
    return Object.values(this.data.words).filter(w => !w.mastered);
  }

  getMasteredWords() {
    return Object.values(this.data.words).filter(w => w.mastered);
  }

  updateUIBadge() {
    const active = this.getActiveMistakes().length;
    const badge = document.getElementById('vault-count-badge');
    if (badge) badge.textContent = active;
    
    const alertBanner = document.getElementById('vault-alert');
    if (alertBanner) {
      alertBanner.style.display = active > 0 ? 'flex' : 'none';
    }
  }

  getPriorityInjectionWords(count = 3) {
    const active = this.getActiveMistakes();
    active.sort((a, b) => {
      if (a.streak !== b.streak) {
        return a.streak - b.streak;
      }
      return b.mistakeCount - a.mistakeCount;
    });
    return active.slice(0, count).map(w => w.word);
  }
}

// Main Typing Game & Academy Engine
class GameEngine {
  constructor() {
    this.vault = new MistakeVault();
    this.synth = new SoundSynthesizer();
    this.chart = new WpmChart('wpm-realtime-chart');
    this.resultsChart = null;
    this.vaultPracticeActive = false;
    
    // HTML Element bindings
    this.targetTextEl = document.getElementById('target-text');
    this.typingCaretEl = document.getElementById('typing-caret');
    this.typingBox = document.getElementById('typing-box');
    this.keyboardCapture = document.getElementById('keyboard-capture');
    
    // Stats displays
    this.wpmEl = document.getElementById('stat-wpm');
    this.accuracyEl = document.getElementById('stat-accuracy');
    this.streakEl = document.getElementById('stat-streak');
    this.levelEl = document.getElementById('stat-level');
    
    // Category / Mode pills
    this.categoryPills = document.getElementById('category-pills');
    this.modePills = document.getElementById('mode-pills');
    
    // Preference switches
    this.soundSwitch = document.getElementById('settings-sound-switch');
    this.chartSwitch = document.getElementById('settings-live-chart-switch');
    this.fontSizeSlider = document.getElementById('settings-font-size-slider');
    this.handTipsSwitch = document.getElementById('settings-hand-tips-switch');
    this.handGuideEl = document.querySelector('.hand-guide-section');
    this._handGuideOriginalParent = this.handGuideEl ? this.handGuideEl.parentElement : null;
    this._handGuideOriginalNext = this.handGuideEl ? this.handGuideEl.nextSibling : null;
    
    // Dialog handles
    this.settingsModal = document.getElementById('settings-modal');
    this.vaultDrawer = document.getElementById('vault-drawer');
    this.lessonPreviewModal = document.getElementById('lesson-preview-modal');
    this.resultsOverlay = document.getElementById('results-overlay');
    this.accountModal = document.getElementById('account-modal');
    this.treasureModal = document.getElementById('treasure-modal');

    // currencies
    this.coins = parseInt(localStorage.getItem('typo_coins') || '0', 10);
    this.gems = parseInt(localStorage.getItem('typo_gems') || '0', 10);
    this.streak = parseInt(localStorage.getItem('typo_streak') || '0', 10);
    this.profile = JSON.parse(localStorage.getItem('typo_profile') || '{}');
    
    // System variables
    this.activeCategory = 'javascript';
    this.activeMode = 'standard';
    this.targetText = '';
    this.currentIndex = 0;
    this.startTime = null;
    
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.currentCorrectChars = 0;
    this.currentStreak = 0;
    
    this.characters = []; // { char: string, element: Element, wordIndex: number }
    this.words = [];
    this.wordIndices = [];
    this.wordErrorFlags = [];
    
    this.timerInterval = null;
    this.secondsElapsed = 0;
    this.wpmHistory = [];
    this.injectedVaultWords = [];
    
    // GAMIFIED CORE STATES
    this.activeTab = 'path'; // 'path' or 'arena'
    this.activeKeyboardLayout = 'qwerty'; // 'qwerty' or 'qwertz'
    this.activePathTrack = 'javascript'; // Track for visual roadmap
    
    // Lesson locks (completed indices stored)
    this.unlockedLevels = this.loadUnlockedLevels();

    // Achievements & social
    this.achievements = this.loadAchievements();
    this.friends = JSON.parse(localStorage.getItem('typo_friends') || '[]');

    // delegated click handler for friend view buttons
    const friendsList = document.getElementById('friends-list');
    if (friendsList) {
      friendsList.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('.view-friend-btn');
        if (btn) {
          const name = btn.getAttribute('data-name');
          const friend = (this.friends || []).find(f => f.name === name);
          if (friend) this.openFriendProfile(friend);
        }
      });
    }

    const genAvatarBtn = document.getElementById('generate-avatar-btn');
    if (genAvatarBtn) genAvatarBtn.addEventListener('click', () => this.generateAvatar());
    this.currentLesson = null; // { track, level, text, title }
    this.completedLessons = Number(localStorage.getItem('typo_completed_lessons') || '0');
    
    // League rival metrics
    this.userXP = parseInt(localStorage.getItem('typo_user_xp') || '450');
    this.leagueIndex = parseInt(localStorage.getItem('typo_league_idx') || '2'); // 2 = Gold League
    this.leagueNameList = ["Bronze League", "Silver League", "Gold League", "Sapphire League", "Ruby League", "Obsidian League", "Diamond League"];
    this.leagueRivals = this.initializeLeagueRivals();
    
    this.initializeEvents();
    this.loadStateFromSettings();
    this.initializeDevMenuEvents();
    this.initializeTutorialEvents();
    
    // Initialize view & panels
    this.switchTab('path');
    this.renderRoadmap();
    this.renderLeagueStandings();
    // Attempt to sync remote leaderboard if configured, otherwise ensure local fake rivals are present
    setTimeout(() => this.syncLeaderboardRemote(), 1200);
  }

  async syncLeaderboardRemote() {
    try {
      // If firebase config was filled by the user, attempt to push/read leaderboard
      if (window.firebaseConfig && window.firebaseConfig.apiKey && !window.firebaseConfig.apiKey.includes('YOUR')) {
        // dynamic imports of Firebase v9 modular
        const [{ initializeApp }, { getFirestore, collection, getDocs, query, orderBy, limit }] = await Promise.all([
          import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js'),
          import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js')
        ]);
        const app = initializeApp(window.firebaseConfig);
        const db = getFirestore(app);
        const q = query(collection(db, 'leaderboard'), orderBy('xp', 'desc'), limit(10));
        const snap = await getDocs(q);
        const rows = [];
        snap.forEach(d => rows.push(d.data()));
        if (rows.length > 0) {
          this.leagueRivals = rows.map(r => ({ name: r.name || 'Anon', xp: r.xp || 0, baseWpm: r.wpm || 0, trend: 'same' }));
          this.renderLeagueStandings();
          return;
        }
      }
    } catch (e) {
      console.warn('Firebase leaderboard sync failed, falling back to local pool.', e);
    }
    // Fallback: use local fake rivals helper
    try {
      const mod = await import('./firebase/multiplayer.js');
      this.leagueRivals = mod.fakeRivalsIfNeeded(this.leagueRivals || [], 10);
      this.renderLeagueStandings();
    } catch (e) {
      console.warn('Could not load multiplayer helper; leaving existing rivals.', e);
    }
  }

  loadUnlockedLevels() {
    const raw = localStorage.getItem('typo_unlocked_levels');
    if (!raw) return { javascript: 1, htmlcss: 1, terminal: 1, symbols: 1 };
    try {
      return JSON.parse(raw);
    } catch(e) {
      return { javascript: 1, htmlcss: 1, terminal: 1, symbols: 1 };
    }
  }

  saveUnlockedLevels() {
    localStorage.setItem('typo_unlocked_levels', JSON.stringify(this.unlockedLevels));
  }

  initializeLeagueRivals() {
    const raw = localStorage.getItem('typo_league_rivals');
    const defaultRivals = [
      { name: "SyntaxError", xp: 620, baseWpm: 48, trend: "up" },
      { name: "ByteSized", xp: 580, baseWpm: 52, trend: "same" },
      { name: "NullPointer", xp: 510, baseWpm: 45, trend: "down" },
      { name: "LinusTypevalds", xp: 420, baseWpm: 85, trend: "up" },
      { name: "GitGud", xp: 350, baseWpm: 40, trend: "down" },
      { name: "CaffeineCoder", xp: 280, baseWpm: 38, trend: "same" }
    ];
    
    if (!raw) {
      // ensure there's a larger pool to simulate competition
      const pool = defaultRivals.slice();
      const fillerNames = ['AsyncAnna','ZeroBugz','StackSeeker','ByteBandit','NullRef','OOMWatcher','DevNinja','PatchPrince','MergeMage','RefactorRex'];
      while (pool.length < 10) {
        const name = fillerNames[Math.floor(Math.random()*fillerNames.length)] + Math.floor(Math.random()*90+10);
        pool.push({ name, xp: Math.floor(Math.random()*700+50), baseWpm: Math.floor(Math.random()*90+20), trend: 'same' });
      }
      localStorage.setItem('typo_league_rivals', JSON.stringify(pool));
      return pool;
    }
    try {
      const parsed = JSON.parse(raw);
      // top up if too few rivals
      if (parsed.length < 8) {
        const fillerNames = ['AsyncAnna','ZeroBugz','StackSeeker','ByteBandit','NullRef','OOMWatcher','DevNinja','PatchPrince','MergeMage','RefactorRex'];
        while (parsed.length < 10) {
          const name = fillerNames[Math.floor(Math.random()*fillerNames.length)] + Math.floor(Math.random()*90+10);
          parsed.push({ name, xp: Math.floor(Math.random()*700+50), baseWpm: Math.floor(Math.random()*90+20), trend: 'same' });
        }
      }
      return parsed;
    } catch(e) {
      return defaultRivals;
    }
  }

  saveLeagueRivals() {
    localStorage.setItem('typo_league_rivals', JSON.stringify(this.leagueRivals));
  }

  openFriendProfile(friend) {
    const modal = document.getElementById('friend-profile-modal');
    if (!modal) return;
    document.getElementById('friend-profile-name').textContent = friend.name || 'Friend';
    document.getElementById('friend-profile-meta').textContent = `XP: ${friend.xp || 0} • WPM: ${friend.baseWpm || 0}`;
    const avatar = document.getElementById('friend-profile-avatar');
    if (avatar) {
      avatar.style.background = friend.color || '#777';
      avatar.textContent = (friend.name || 'F').slice(0,2).toUpperCase();
    }
    const badges = document.getElementById('friend-profile-badges');
    if (badges) {
      badges.innerHTML = '';
      const sample = [ {title:'First Victory'}, {title:'Perfect Accuracy'} ];
      sample.forEach(s => {
        const el = document.createElement('div');
        el.style = 'padding:0.35rem; border-radius:6px; background:rgba(255,255,255,0.02);';
        el.textContent = s.title;
        badges.appendChild(el);
      });
    }
    modal.showModal();
  }

  generateAvatar() {
    const name = (document.getElementById('profile-username').value || 'Player').trim();
    const color = document.getElementById('profile-color').value || '#6b46c1';
    const initials = name.split(' ').filter(Boolean).map(s => s[0]).slice(0,2).join('').toUpperCase() || name.slice(0,2).toUpperCase();
    this.profile = this.profile || {};
    this.profile.username = name;
    this.profile.color = color;
    this.profile.avatar = { initials, color };
    localStorage.setItem('typo_profile', JSON.stringify(this.profile));
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
      avatarEl.style.background = color;
      avatarEl.textContent = initials;
    }
    if (this.triggerMascotSpeech) this.triggerMascotSpeech(`Avatar generated for **${name}**`);
    this.updateHeaderAvatar();
    try { this.showToast('Avatar generated'); } catch(e) {}
  }

  loadStateFromSettings() {
    this.synth.enabled = this.soundSwitch.checked;
    this.chart.enabled = this.chartSwitch.checked;
    
    const localSound = localStorage.getItem('typo_sound_enabled');
    if (localSound !== null) {
      const val = localSound === 'true';
      this.soundSwitch.checked = val;
      this.synth.enabled = val;
    }
    
    const localChart = localStorage.getItem('typo_chart_enabled');
    if (localChart !== null) {
      const val = localChart === 'true';
      this.chartSwitch.checked = val;
      this.chart.enabled = val;
      this.chart.resize();
    }
    
    const localFontSize = localStorage.getItem('typo_font_size');
    if (localFontSize !== null) {
      const val = parseFloat(localFontSize);
      this.fontSizeSlider.value = val;
      document.getElementById('font-size-indicator').textContent = `${val}rem`;
      this.typingBox.style.fontSize = `${val}rem`;
    }
    
    const localLayout = localStorage.getItem('typo_keyboard_layout');
    if (localLayout !== null) {
      this.switchKeyboardLayout(localLayout);
    }

    // Apply hand tips preference if present
    const localHandTips = localStorage.getItem('typo_hand_tips');
    if (this.handTipsSwitch) {
      const hv = localHandTips === 'true';
      this.handTipsSwitch.checked = hv;
      this.applyHandTips(hv);
    }
    
    this.vault.updateUIBadge();
    this.renderHeatmapKeyboard();

    // Init header currency UI and account actions
    this.updateCurrencyUI();
    this.updateHeaderAvatar();
    const accountBtn = document.getElementById('open-account-btn');
    if (accountBtn) accountBtn.addEventListener('click', () => this.openAccountModal());
    const closeAccountBtn = document.getElementById('close-account-btn');
    if (closeAccountBtn) closeAccountBtn.addEventListener('click', () => this.accountModal.close());
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', () => this.saveProfile());
    const viewFriendsBtn = document.getElementById('view-friends-btn');
    if (viewFriendsBtn) viewFriendsBtn.addEventListener('click', () => this.openFriendsModal());
    this.friendsModal = document.getElementById('friends-modal');
    const closeFriendsBtn = document.getElementById('close-friends-btn');
    if (closeFriendsBtn) closeFriendsBtn.addEventListener('click', () => this.friendsModal.close());
    const friendAddBtn = document.getElementById('friend-add-btn');
    if (friendAddBtn) friendAddBtn.addEventListener('click', () => this.addFriend());
    this.friends = JSON.parse(localStorage.getItem('typo_friends') || '[]');
    const closeFriendProfileBtn = document.getElementById('close-friend-profile');
    if (closeFriendProfileBtn) closeFriendProfileBtn.addEventListener('click', () => {
      const m = document.getElementById('friend-profile-modal'); if (m) m.close();
    });

    const treasureBtn = document.getElementById('open-treasure-btn');
    if (treasureBtn) treasureBtn.addEventListener('click', () => this.treasureModal.showModal());
    const closeTreasureBtn = document.getElementById('close-treasure-btn');
    if (closeTreasureBtn) closeTreasureBtn.addEventListener('click', () => this.treasureModal.close());
    const openCoinsBtn = document.getElementById('open-chest-coins');
    if (openCoinsBtn) openCoinsBtn.addEventListener('click', () => this.openChestWithCoins());
    const openGemsBtn = document.getElementById('open-chest-gems');
    if (openGemsBtn) openGemsBtn.addEventListener('click', () => this.openChestWithGems());
    const watchAdBtn = document.getElementById('watch-ad-btn');
    if (watchAdBtn) watchAdBtn.addEventListener('click', () => this.watchAdForChest());

    const achBtn = document.getElementById('open-achievements-btn');
    this.achievementsModal = document.getElementById('achievements-modal');
    if (achBtn) achBtn.addEventListener('click', () => this.openAchievementsModal());
    const closeAchievementsBtn = document.getElementById('close-achievements-btn');
    if (closeAchievementsBtn) closeAchievementsBtn.addEventListener('click', () => { if (this.achievementsModal) this.achievementsModal.close(); });
  }

  openFriendsModal() {
    return this.synth.openFriendsModal.call(this);
  }

  renderFriendsList() {
    return this.synth.renderFriendsList.call(this);
  }

  addFriend() {
    return this.synth.addFriend.call(this);
  }

  openAccountModal() {
    return this.synth.openAccountModal.call(this);
  }

  saveProfile() {
    return this.synth.saveProfile.call(this);
  }

  openChestWithCoins() {
    return this.synth.openChestWithCoins.call(this);
  }

  openChestWithGems() {
    return this.synth.openChestWithGems.call(this);
  }

  watchAdForChest() {
    return this.synth.watchAdForChest.call(this);
  }

  resolveChestReward(kind) {
    return this.synth.resolveChestReward.call(this, kind);
  }

  startVaultPractice() {
    return this.synth.startVaultPractice.call(this);
  }

  applyHandTips(enabled) {
    return this.synth.applyHandTips.call(this, enabled);
  }

  showToast(text, timeout = 3200) {
    return this.synth.showToast.call(this, text, timeout);
  }

  initializeEvents() {
    // Focus capture
    this.typingBox.addEventListener('click', () => {
      this.keyboardCapture.focus();
      this.typingCaretEl.classList.add('typing');
    });
    this.keyboardCapture.addEventListener('focus', () => {
      this.typingCaretEl.classList.add('typing');
    });
    this.keyboardCapture.addEventListener('blur', () => {
      this.typingCaretEl.classList.remove('typing');
    });
    
    // Main key capture
    this.keyboardCapture.addEventListener('input', (e) => this.handleInput(e));
    this.keyboardCapture.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        this.handleBackspace(e);
      }
    });
    
    // Restart controls
    document.getElementById('restart-round-btn').addEventListener('click', () => this.restartRound());
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.openDevMenu();
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        this.restartRound();
      }
      this.handleKeycapHighlight(e, true);
    });
    
    document.addEventListener('keyup', (e) => {
      this.handleKeycapHighlight(e, false);
    });
    
    // Navigation Tabs clicks
    document.getElementById('tab-path').addEventListener('click', () => this.switchTab('path'));
    document.getElementById('tab-arena').addEventListener('click', () => this.switchTab('arena'));
    
    // Layout switches clicks
    document.getElementById('btn-layout-qwerty').addEventListener('click', () => this.switchKeyboardLayout('qwerty'));
    document.getElementById('btn-layout-qwertz').addEventListener('click', () => this.switchKeyboardLayout('qwertz'));
    
    // Academy track select pills
    document.getElementById('path-track-selector').addEventListener('click', (e) => {
      const btn = e.target.closest('.track-btn');
      if (!btn) return;
      
      document.querySelectorAll('#path-track-selector .track-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      
      this.activePathTrack = btn.dataset.track;
      this.renderRoadmap();
      
      // Mascot gives encouraging speech about active track choice
      this.triggerMascotSpeech(`You switched to the **${btn.textContent}** pathway! Let's conquer this track level by level.`);
    });
    
    // Free Practice category select pills
    this.categoryPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      
      this.categoryPills.querySelectorAll('.pill-btn').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      
      this.activeCategory = btn.dataset.cat;
      this.currentLesson = null; // Clear active lesson state
      this.restartRound();
    });
    
    // Mode pills click
    this.modePills.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      
      this.modePills.querySelectorAll('.pill-btn').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      
      this.activeMode = btn.dataset.mode;
      this.currentLesson = null; // Clear active lesson state
      this.restartRound();
    });
    
    // Practice Vault Direct button
    document.getElementById('practice-vault-direct-btn').addEventListener('click', () => {
      this.startVaultPractice();
    });

    const vaultStartBtn = document.getElementById('vault-start-practice-btn');
    if (vaultStartBtn) {
      vaultStartBtn.addEventListener('click', () => {
        this.vaultDrawer.close();
        this.startVaultPractice();
      });
    }
    
    // Settings switches
    this.soundSwitch.addEventListener('change', (e) => {
      this.synth.enabled = e.target.checked;
      localStorage.setItem('typo_sound_enabled', e.target.checked);
    });
    
    this.chartSwitch.addEventListener('change', (e) => {
      this.chart.enabled = e.target.checked;
      localStorage.setItem('typo_chart_enabled', e.target.checked);
      this.chart.resize();
    });

    if (this.handTipsSwitch) {
      this.handTipsSwitch.addEventListener('change', (e) => {
        localStorage.setItem('typo_hand_tips', e.target.checked);
        this.applyHandTips(e.target.checked);
      });
    }
    
    this.fontSizeSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      document.getElementById('font-size-indicator').textContent = `${val}rem`;
      this.typingBox.style.fontSize = `${val}rem`;
      localStorage.setItem('typo_font_size', val);
      setTimeout(() => this.updateCaretPosition(), 50);
    });
    
    document.getElementById('reset-vault-data-btn').addEventListener('click', () => {
      if (confirm("Are you sure you want to clear your Mistake Vault? This will reset all streaks.")) {
        this.vault.clearAll();
        this.renderHeatmapKeyboard();
        this.renderVaultDrawerList();
        this.settingsModal.close();
        this.restartRound();
      }
    });
    
    // Vault Add word quick form
    document.getElementById('vault-add-word-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('vault-add-input');
      const val = input.value.trim();
      if (val) {
        this.vault.addWord(val);
        input.value = '';
        this.renderVaultDrawerList();
        this.renderHeatmapKeyboard();
        this.restartRound();
      }
    });
    
    // Modal toggle commands
    document.getElementById('open-settings-btn').addEventListener('click', () => this.settingsModal.showModal());
    document.getElementById('close-settings-btn').addEventListener('click', () => this.settingsModal.close());
    
    document.getElementById('open-vault-btn').addEventListener('click', () => {
      this.renderVaultDrawerList();
      this.vaultDrawer.showModal();
    });
    document.getElementById('close-vault-btn').addEventListener('click', () => this.vaultDrawer.close());
    
    document.getElementById('close-lesson-preview-btn').addEventListener('click', () => this.lessonPreviewModal.close());
    // Lesson preview navigation buttons
    const prevBtn = document.getElementById('lesson-prev-ex-btn');
    const nextBtn = document.getElementById('lesson-next-ex-btn');
    const skipBtn = document.getElementById('lesson-skip-ex-btn');
    const finishBtn = document.getElementById('lesson-finish-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => {
      if (!this.currentLesson) return;
      this.currentLesson.exerciseIndex = Math.max(0, (this.currentLesson.exerciseIndex || 0) - 1);
      this.openLessonPreview(this.currentLesson.track, this.currentLesson.level);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      if (!this.currentLesson) return;
      const lastIdx = (this.currentLesson.exercises ? this.currentLesson.exercises.length : 1) - 1;
      this.currentLesson.exerciseIndex = Math.min(lastIdx, (this.currentLesson.exerciseIndex || 0) + 1);
      this.openLessonPreview(this.currentLesson.track, this.currentLesson.level);
    });
    if (skipBtn) skipBtn.addEventListener('click', () => {
      if (!this.currentLesson) return;
      const lastIdx = (this.currentLesson.exercises ? this.currentLesson.exercises.length : 1) - 1;
      if ((this.currentLesson.exerciseIndex || 0) < lastIdx) {
        this.currentLesson.exerciseIndex++;
        this.openLessonPreview(this.currentLesson.track, this.currentLesson.level);
      }
    });
    if (finishBtn) finishBtn.addEventListener('click', () => {
      // mark as completed and unlock next if required
      if (!this.currentLesson) return;
      const track = this.currentLesson.track;
      const unlocked = this.unlockedLevels[track] || 1;
      if (this.currentLesson.level === unlocked) {
        this.unlockedLevels[track] = unlocked + 1;
        this.saveUnlockedLevels();
        this.renderRoadmap();
      }
      this.lessonPreviewModal.close();
    });
    // Exit active lesson button
    const exitBtn = document.getElementById('exit-lesson-btn');
    if (exitBtn) exitBtn.addEventListener('click', () => {
      this.currentLesson = null;
      document.getElementById('active-lesson-banner').style.display = 'none';
      document.getElementById('arena-config-panel').style.display = 'flex';
      this.switchTab('path');
      this.triggerMascotSpeech('Exited lesson. Academy view restored.');
    });
    
    // Start lesson node trigger inside modal preview
    document.getElementById('start-lesson-btn').addEventListener('click', () => {
      document.getElementById('lesson-level-title').textContent = `Level ${this.currentLesson.level}: ${this.currentLesson.title}`;
      this.lessonPreviewModal.close();
        if (this.currentLesson) {
          // Toggle view to arena but keep the Academy tab visually active
          this.switchTab('arena');
          // Keep Academy tab visually active while in-lesson
          const pathTab = document.getElementById('tab-path');
          const arenaTab = document.getElementById('tab-arena');
          if (pathTab && arenaTab) {
            arenaTab.classList.remove('active');
            arenaTab.setAttribute('aria-selected', 'false');
            pathTab.classList.add('active');
            pathTab.setAttribute('aria-selected', 'true');
          }

          // Hide standard Category configs during active roadmap lessons
          document.getElementById('arena-config-panel').style.display = 'none';

          // Render lesson top progress banner
          const banner = document.getElementById('active-lesson-banner');
          banner.style.display = 'flex';

          const trackTitle = this.activePathTrack === 'javascript' ? 'JavaScript Explorer' :
                             this.activePathTrack === 'htmlcss' ? 'HTML & CSS Builder' :
                             this.activePathTrack === 'terminal' ? 'Terminal & Git Commander' : 'Symbols Master';

          document.getElementById('lesson-track-name').textContent = trackTitle;
          document.getElementById('lesson-level-title').textContent = `Level ${this.currentLesson.level}: ${this.currentLesson.title}`;
          document.getElementById('lesson-progress-gauge').style.width = '0%';

          // Initialize exercise index and start first exercise
          this.currentLesson.exerciseIndex = 0;
          this.restartRound();
        }
    });
    
    // Results dialog commands
    document.getElementById('results-close-btn').addEventListener('click', () => this.resultsOverlay.close());
    document.getElementById('results-share-btn').addEventListener('click', () => this.exportResultsImageCard());

    
    this.vaultDrawer.addEventListener('click', (e) => {
      if (e.target === this.vaultDrawer) this.vaultDrawer.close();
    });
    this.lessonPreviewModal.addEventListener('click', (e) => {
      if (e.target === this.lessonPreviewModal) this.lessonPreviewModal.close();
    });
    this.resultsOverlay.addEventListener('click', (e) => {
      if (e.target === this.resultsOverlay) this.resultsOverlay.close();
    });
    this.resultsOverlay.addEventListener('close', () => {
      // If lesson finished, cleanup visual markers
      const pathTab = document.getElementById('tab-path');
      if (pathTab && !this.currentLesson) pathTab.classList.remove('active-in-lesson');
      const banner = document.getElementById('active-lesson-banner');
      if (banner && !this.currentLesson) banner.style.display = 'none';
      const cfg = document.getElementById('arena-config-panel');
      if (cfg && !this.currentLesson) cfg.style.display = 'flex';
    });
  }

  handleKeycapHighlight(event, active) {
    const key = (event.key || '').toLowerCase();
    const lookup = key === ' ' ? ' ' : key;
    const cap = document.querySelector(`.keycap[data-key="${lookup}"]`);
    if (!cap) return;
    if (active) {
      cap.classList.add('active-press');
      cap.style.transform = 'translateY(1px)';
      cap.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.4)';
    } else {
      cap.classList.remove('active-press');
      cap.style.transform = '';
      cap.style.boxShadow = '';
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    if (tabId === 'path') {
      document.getElementById('tab-path').classList.add('active');
      document.getElementById('tab-path').setAttribute('aria-selected', 'true');
      document.getElementById('academy-view').classList.add('active');
      
      // Active track preview
      this.renderRoadmap();
    } else {
      document.getElementById('tab-arena').classList.add('active');
      document.getElementById('tab-arena').setAttribute('aria-selected', 'true');
      document.getElementById('arena-view').classList.add('active');
      
      // Auto focus caretaker capture
      setTimeout(() => {
        this.keyboardCapture.focus();
        this.updateCaretPosition();
      }, 50);
    }
  }

  switchKeyboardLayout(layout) {
    this.activeKeyboardLayout = layout;
    localStorage.setItem('typo_keyboard_layout', layout);
    
    // Mark buttons active
    document.getElementById('btn-layout-qwerty').classList.toggle('active', layout === 'qwerty');
    document.getElementById('btn-layout-qwertz').classList.toggle('active', layout === 'qwertz');
    
    // Update virtual keycap labels in UI
    const keyY = document.getElementById('keycap-y');
    const keyZ = document.getElementById('keycap-z');
    
    if (layout === 'qwertz') {
      // QWERTZ swap key values
      keyY.textContent = 'Z';
      keyY.setAttribute('data-key', 'z');
      
      keyZ.textContent = 'Y';
      keyZ.setAttribute('data-key', 'y');
    } else {
      // QWERTY standard
      keyY.textContent = 'Y';
      keyY.setAttribute('data-key', 'y');
      
      keyZ.textContent = 'Z';
      keyZ.setAttribute('data-key', 'z');
    }
    
    // Reload guides & visual heatmaps
    this.renderHeatmapKeyboard();
    this.updateFingerGuides();
  }

  // Winding timeline node generator
  renderRoadmap() {
    const container = document.getElementById('roadmap-path');
    container.innerHTML = '';
    
    const list = window.PATH_SNIPPETS[this.activePathTrack] || window.PATH_SNIPPETS.javascript;
    const unlocked = this.unlockedLevels[this.activePathTrack] || 1;
    
    list.forEach((item, idx) => {
      const nodeWrapper = document.createElement('div');
      
      // Winding alternating layout: left, center, right, center, left...
      const alignments = ['align-left', 'align-center', 'align-right', 'align-center'];
      const alignClass = alignments[idx % 4];
      nodeWrapper.className = `roadmap-node-wrapper ${alignClass}`;
      
      const node = document.createElement('button');
      
      // Identify classes
      let statusClass = 'locked';
      let iconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>`; // Padlock
        
      if (item.level < unlocked) {
        statusClass = 'completed';
        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>`; // Checkmark
      } else if (item.level === unlocked) {
        statusClass = 'active-node';
        iconSvg = `<span style="font-size:1.15rem; font-weight:800;">${item.level}</span>`;
      } else {
        node.disabled = true;
      }
      
      node.className = `roadmap-node ${statusClass}`;
      node.innerHTML = `
        ${iconSvg}
        <span class="node-tooltip">Level ${item.level}: ${item.title}</span>`;
        
      node.addEventListener('click', () => {
        this.openLessonPreview(this.activePathTrack, item.level);
      });
      
      nodeWrapper.appendChild(node);
      container.appendChild(nodeWrapper);
    });
  }

  openLessonPreview(track, level) {
    const list = window.PATH_SNIPPETS[track];
    const item = list.find(l => l.level === level);
    if (!item) return;
    
    // Support legacy single-text items or new lesson objects with exercises
    const exercises = item.exercises || (item.text ? [item.text] : []);
    this.currentLesson = {
      track: track,
      level: level,
      title: item.title,
      desc: item.desc,
      exercises: exercises,
      exerciseIndex: 0
    };
    
    // Set preview details
    document.getElementById('lesson-preview-title').textContent = `Level ${level}: ${item.title}`;
    document.getElementById('lesson-preview-desc').textContent = item.desc;
    const currentIdx = this.currentLesson.exerciseIndex || 0;
    const total = this.currentLesson.exercises ? this.currentLesson.exercises.length : 1;
    document.getElementById('lesson-preview-code').textContent = this.currentLesson.exercises[currentIdx] || item.text || '';
    const countEl = document.getElementById('lesson-preview-count');
    if (countEl) countEl.textContent = `Exercise ${currentIdx + 1} / ${total}`;
    
    this.lessonPreviewModal.showModal();
    
    // Synthesize quick popup tone
    this.synth.playClick(false);
  }

  // Active Mascot Alerts speech updater
  triggerMascotSpeech(text) {
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const speech = document.getElementById('mascot-speech');
    if (speech) {
      speech.innerHTML = formatted;
      speech.style.animation = 'none';
      setTimeout(() => {
        speech.style.animation = 'tab-fade-in 0.25s ease-out forwards';
      }, 5);
    }

    const arenaSpeech = document.getElementById('arena-mascot-speech');
    if (arenaSpeech) {
      arenaSpeech.innerHTML = formatted;
    }
  }

  // Simulated Weekly competitive Leagues standings updating
  renderLeagueStandings() {
    const body = document.getElementById('league-leaderboard-body');
    body.innerHTML = '';
    
    // Sync current league badge
    document.querySelector('#league-current-badge span').textContent = this.leagueNameList[this.leagueIndex];
    
    // Formulate active competitor standings
    const standings = [
      { name: "You", xp: this.userXP, isUser: true },
      ...this.leagueRivals
    ];
    
    // Sort descending by XP
    standings.sort((a,b) => b.xp - a.xp);
    
    // Build HTML rows
    standings.forEach((player, idx) => {
      const row = document.createElement('div');
      
      // Determine promo zone boundary (Top 3 promote)
      let rowClass = 'league-row';
      if (player.isUser) rowClass += ' current-user';
      if (idx === 2) rowClass += ' promo-demarcation'; // Divider below rank 3
      
      row.className = rowClass;
      
      let arrow = '';
      if (player.isUser) {
        arrow = player.xp > 450 ? '<span class="trend-arrow up">▲</span>' : '<span class="trend-arrow same">●</span>';
      } else {
        arrow = player.trend === 'up' ? '<span class="trend-arrow up">▲</span>' :
                player.trend === 'down' ? '<span class="trend-arrow down">▼</span>' : '<span class="trend-arrow same">●</span>';
      }
      
      row.innerHTML = `
        <span class="rank">${idx + 1}</span>
        <span class="name">${player.name}</span>
        <span class="xp">${player.xp} XP</span>
        ${arrow}`;
        
      body.appendChild(row);
    });
  }

  // Tick fake competitor points up to create competition pressure!
  tickLeagueRivals() {
    this.leagueRivals.forEach(rival => {
      // Rivals gain random XP based on their speed
      const wpmFactor = rival.baseWpm / 10;
      const progress = Math.round(Math.random() * wpmFactor * 2.5);
      rival.xp += progress;
      
      // Shuffle trends
      const rand = Math.random();
      rival.trend = rand > 0.65 ? 'up' : rand < 0.3 ? 'down' : 'same';
    });
    
    this.saveLeagueRivals();
    this.renderLeagueStandings();
  }

  // SVG Hands guides highlighting optimal posture fingers
  getOptimalFingerForChar(char) {
    const c = char.toLowerCase();
    if (c === ' ') return { hand: 'right', finger: 'thumb', label: 'Spacebar' };
    
    const leftPinky = "`1qaz~!qaztabcapslockshiftleftcontrol\\";
    const leftRing = "2wsx@wsx";
    const leftMiddle = "3edc#edc";
    const leftIndex = "45rtfgvb$%rtfgvb";
    
    const rightIndex = "67yuhjnm^&yuhjnm";
    const rightMiddle = "8ik,(*ik<";
    const rightRing = "9ol.((ol>";
    const rightPinky = "0p;'[]\\/=-)_+{}|:\"?penterbackspace";
    
    // Swapping visual finger lookups if German QWERTZ layout is active
    let mappedChar = c;
    if (this.activeKeyboardLayout === 'qwertz') {
      if (c === 'y') mappedChar = 'z';
      else if (c === 'z') mappedChar = 'y';
    }
    
    if (leftPinky.includes(mappedChar)) return { hand: 'l', finger: 'pinky', label: 'Left Pinky' };
    if (leftRing.includes(mappedChar)) return { hand: 'l', finger: 'ring', label: 'Left Ring' };
    if (leftMiddle.includes(mappedChar)) return { hand: 'l', finger: 'middle', label: 'Left Middle' };
    if (leftIndex.includes(mappedChar)) return { hand: 'l', finger: 'index', label: 'Left Index' };
    
    if (rightIndex.includes(mappedChar)) return { hand: 'r', finger: 'index', label: 'Right Index' };
    if (rightMiddle.includes(mappedChar)) return { hand: 'r', finger: 'middle', label: 'Right Middle' };
    if (rightRing.includes(mappedChar)) return { hand: 'r', finger: 'ring', label: 'Right Ring' };
    if (rightPinky.includes(mappedChar)) return { hand: 'r', finger: 'pinky', label: 'Right Pinky' };
    
    return { hand: 'r', finger: 'pinky', label: 'Right Pinky' };
  }

  updateFingerGuides() {
    // Clear old highlights on vector SVG fingers
    const fingers = document.querySelectorAll('.cyber-hands line');
    fingers.forEach(fin => {
      fin.classList.remove('active-finger', 'active-finger-secondary');
    });
    
    if (this.currentIndex >= this.characters.length) {
      document.getElementById('finger-instruction').innerHTML = "Post-round summary active!";
      return;
    }
    
    const expected = this.characters[this.currentIndex].char;
    const guide = this.getOptimalFingerForChar(expected);
    
    // Highlight matching vector hand line
    const query = `#f-${guide.hand}-${guide.finger}`;
    const activeLine = document.querySelector(query);
    if (activeLine) {
      if (guide.hand === 'l') {
        activeLine.classList.add('active-finger');
      } else {
        activeLine.classList.add('active-finger-secondary');
      }
    }
    
    // Highlight matching visual keycap too
    const lowercaseKey = expected.toLowerCase();
    document.querySelectorAll('.keycap').forEach(c => c.style.boxShadow = '');
    const activeKeycap = document.querySelector(`.keycap[data-key="${lowercaseKey === ' ' ? ' ' : lowercaseKey}"]`);
    if (activeKeycap) {
      activeKeycap.style.boxShadow = '0 0 10px var(--primary-accent), inset 0 0 5px var(--primary-accent)';
    }
    
    // Render text instruct label
    const labelKey = expected === ' ' ? 'Spacebar' : `"${expected}"`;
    document.getElementById('finger-instruction').innerHTML = `
      Next key: <strong style="color:var(--primary-accent);">${labelKey}</strong> &rarr; 
      Use your <strong style="color:var(--primary-accent);">${guide.label}</strong>`;
  }

  generateText() {
    // Check if loading active lesson text
    if (this.currentLesson) {
      // Return the current exercise text for multi-exercise lessons
      const idx = this.currentLesson.exerciseIndex || 0;
      return (this.currentLesson.exercises && this.currentLesson.exercises[idx]) || '';
    }
    
    const list = window.SNIPPETS[this.activeCategory] || window.SNIPPETS.javascript;
    const activeErrors = this.vault.getActiveMistakes();
    const injectEnabled = this.activeMode === 'spaced-rep' && activeErrors.length > 0 && this.vaultPracticeActive;
    
    if (injectEnabled) {
      this.injectedVaultWords = this.vault.getPriorityInjectionWords(2);
      const w1 = this.injectedVaultWords[0];
      const w2 = this.injectedVaultWords[1] || w1;
      
      const categoryTemplates = {
        javascript: [
          `const ${w1} = async (${w2}) => await fetch(${w2});`,
          `// TODO: refactor ${w1} to increase accuracy\nfunction verify(${w2}) { return ${w1} === ${w2}; }`,
          `const list = [${w1}, ${w2}].filter(word => word !== null);`,
          `import { ${w1}, ${w2} } from './vault-modules';`
        ],
        htmlcss: [
          `.grid-${w1} { grid-area: ${w2}; backdrop-filter: blur(10px); }`,
          `article:has(.${w1}) { border: 2px solid var(--glow-${w2}); }`,
          `<div class="${w1}-container" id="${w2}-button" role="button">`,
          `transition: transform 0.3s ease, outline-${w1} 0.2s;`
        ],
        terminal: [
          `git commit -m "fix(${w1}): correct logic error in ${w2}"`,
          `docker compose exec app grep -rnw './src' -e "${w1}"`,
          `npm install -D @types/${w1} && git checkout -b feature/${w2}`,
          `tar -czvf backup-${w1}.tar.gz ./${w2}/assets`
        ],
        philosophy: [
          `Type ${w1} perfectly, then master ${w2} with continuous focus.`,
          `"Simple typing yields high accuracy: master ${w1} and ${w2}." - Typo`,
          `Complexity is typing ${w1} incorrectly; elegance is typing ${w2} flawlessly.`
        ]
      };
      
      const templates = categoryTemplates[this.activeCategory];
      return templates[Math.floor(Math.random() * templates.length)];
    } else {
      this.injectedVaultWords = [];
      const randomIdx = Math.floor(Math.random() * list.length);
      return list[randomIdx];
    }
  }

  restartRound() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
    
    this.targetText = this.generateText();
    this.currentIndex = 0;
    this.startTime = null;
    
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.currentCorrectChars = 0;
    this.secondsElapsed = 0;
    
    this.wpmHistory = [];
    // Disable live arena chart during lessons to show final progression only
    this.chart.clear();
    this.chart.enabled = !this.currentLesson && this.chartSwitch.checked;

    // If inside a lesson, update progress gauge and preview count
    if (this.currentLesson) {
      const lesson = this.currentLesson;
      const idx = lesson.exerciseIndex || 0;
      const total = lesson.exercises ? lesson.exercises.length : 1;
      const pct = Math.round((idx / total) * 100);
      const gauge = document.getElementById('lesson-progress-gauge');
      if (gauge) gauge.style.width = `${pct}%`;
      const countEl = document.getElementById('lesson-preview-count');
      if (countEl) countEl.textContent = `Exercise ${idx + 1} / ${total}`;
      document.getElementById('lesson-level-title').textContent = `Level ${this.currentLesson.level}: ${this.currentLesson.title}`;
    }
    
    this.updateStatsDisplay();

    // If we're inside a lesson with multiple exercises, advance to next exercise
    if (this.currentLesson) {
      const lesson = this.currentLesson;
      const lastIdx = (lesson.exercises ? lesson.exercises.length : 1) - 1;
      if (lesson.exerciseIndex < lastIdx) {
        // move to next exercise within the same lesson on restart (handled after completion)
        // no-op here — completeRound will handle showing results and advancing the exercise index
      }
    }
    
    this.targetTextEl.innerHTML = '';
    this.characters = [];
    this.keyboardCapture.value = '';
    
    this.words = this.targetText.split(/(\s+)/);
    this.wordIndices = [];
    this.wordErrorFlags = new Array(this.words.length).fill(false);
    
    let cumulativeCharIndex = 0;
    
    this.words.forEach((wordToken, wordIndex) => {
      for (let i = 0; i < wordToken.length; i++) {
        const char = wordToken[i];
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'char char-untyped';
        
        this.targetTextEl.appendChild(span);
        
        this.characters.push({
          char: char,
          element: span,
          wordIndex: wordIndex,
          wordString: wordToken
        });
        
        this.wordIndices[cumulativeCharIndex] = wordIndex;
        cumulativeCharIndex++;
      }
    });
    
    this.typingBox.focus();
    this.keyboardCapture.focus();
    
    if (this.characters.length > 0) {
      this.characters[0].element.className = 'char char-active';
    }
    
    document.getElementById('chart-realtime-wpm').textContent = '0 WPM';
    
    setTimeout(() => {
      this.updateCaretPosition();
      this.updateFingerGuides();
    }, 20);
  }

  handleInput(e) {
    const val = this.keyboardCapture.value;
    
    if (this.currentIndex >= this.characters.length) {
      this.keyboardCapture.value = '';
      return;
    }
    
    if (e.inputType === 'deleteContentBackward') {
      this.keyboardCapture.value = '';
      return;
    }
    
    const typedChar = e.data || (val.length > 0 ? val[val.length - 1] : null);
    if (!typedChar) {
      this.keyboardCapture.value = '';
      return;
    }
    
    this.keyboardCapture.value = '';
    
    if (!this.startTime) {
      this.startTime = Date.now();
      this.startMetricsTimer();
    }
    
    this.totalKeystrokes++;
    
    const expected = this.characters[this.currentIndex];
    
    if (typedChar === expected.char) {
      expected.element.className = 'char char-correct';
      this.correctKeystrokes++;
      this.currentCorrectChars++;
      this.currentIndex++;
      this.synth.playClick(expected.char === ' ');
      
      // Flawless Word Completion check
      if (expected.char === ' ' || this.currentIndex === this.characters.length) {
        const lastWordIdx = expected.wordIndex;
        const hadError = this.wordErrorFlags[lastWordIdx];
        if (!hadError) {
          const rawW = expected.wordString.trim();
          if (rawW.length > 1) {
            this.triggerInlineReward(`✨ Flawless "${rawW}"! +10 XP Streak Bonus!`);
            this.userXP += 10;
            localStorage.setItem('typo_user_xp', this.userXP);
            this.renderLeagueStandings();
          }
        }
      }
      
      // Reactive owl eye-wink on correct letters inside active lesson pathways
      if (this.currentLesson && this.currentIndex % 6 === 0) {
        this.triggerMascotResponse('wink');
      }
    } else {
      expected.element.className = 'char char-incorrect';
      this.wordErrorFlags[expected.wordIndex] = true;
      
      const rawWord = this.words[expected.wordIndex];
      this.vault.addWord(rawWord);
      
      this.synth.playError();
      this.currentIndex++;
      
      // Reactive owl glitch thud alert
      this.triggerMascotResponse('glitch');
    }
    
    if (this.currentIndex < this.characters.length) {
      this.characters[this.currentIndex].element.className = 'char char-active';
      
      // Update active lesson progress gauge
      if (this.currentLesson) {
        const pct = Math.round((this.currentIndex / this.characters.length) * 100);
        document.getElementById('lesson-progress-gauge').style.width = `${pct}%`;
      }
    } else {
      this.completeRound();
    }
    
    this.updateStatsDisplay();
    this.updateCaretPosition();
    this.updateFingerGuides();
  }

  handleBackspace(e) {
    if (this.currentIndex > 0) {
      e.preventDefault();
      
      this.currentIndex--;
      
      const charObj = this.characters[this.currentIndex];
      
      if (charObj.element.classList.contains('char-correct')) {
        this.currentCorrectChars = Math.max(0, this.currentCorrectChars - 1);
      }
      
      charObj.element.className = 'char char-active';
      
      if (this.currentIndex + 1 < this.characters.length) {
        this.characters[this.currentIndex + 1].element.className = 'char char-untyped';
      }
      
      this.synth.playClick(false);
      
      // Update active lesson progress gauge on backspace
      if (this.currentLesson) {
        const pct = Math.round((this.currentIndex / this.characters.length) * 100);
        document.getElementById('lesson-progress-gauge').style.width = `${pct}%`;
      }
      
      this.updateStatsDisplay();
      this.updateCaretPosition();
      this.updateFingerGuides();
    }
  }

  updateCaretPosition() {
    if (this.characters.length === 0) return;
    
    const viewport = this.targetTextEl;
    const viewportRect = viewport.getBoundingClientRect();
    
    if (this.currentIndex < this.characters.length) {
      const activeSpan = this.characters[this.currentIndex].element;
      const rect = activeSpan.getBoundingClientRect();
      
      const x = rect.left - viewportRect.left;
      const y = rect.top - viewportRect.top;
      
      this.typingCaretEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      this.typingCaretEl.style.width = `${rect.width}px`;
      this.typingCaretEl.style.height = `${rect.height}px`;
    } else {
      const lastSpan = this.characters[this.characters.length - 1].element;
      const rect = lastSpan.getBoundingClientRect();
      
      const x = rect.right - viewportRect.left;
      const y = rect.top - viewportRect.top;
      
      this.typingCaretEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      this.typingCaretEl.style.width = '3px';
      this.typingCaretEl.style.height = `${rect.height}px`;
    }
  }

  startMetricsTimer() {
    this.secondsElapsed = 0;
    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      
      const wpm = this.calculateLiveWpm();
      this.wpmHistory.push({ time: this.secondsElapsed, wpm: wpm });

      // Do not update the live chart while an active roadmap lesson is running
      if (!this.currentLesson && this.chart.enabled) {
        this.chart.update(this.wpmHistory);
        document.getElementById('chart-realtime-wpm').textContent = `${wpm} WPM`;
      } else {
        // Keep realtime label stable while in lesson
        document.getElementById('chart-realtime-wpm').textContent = `${wpm} WPM`;
      }
      this.updateStatsDisplay();
    }, 1000);
  }

  calculateLiveWpm() {
    if (!this.startTime) return 0;
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0) return 0;
    
    const wordsCount = this.currentCorrectChars / 5;
    return Math.round(wordsCount / elapsedMinutes);
  }

  updateStatsDisplay() {
    const keystrokeAcc = this.totalKeystrokes > 0 
      ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
      : 100;
      
    const realAcc = this.currentIndex > 0
      ? Math.round((this.currentCorrectChars / this.currentIndex) * 100)
      : 100;
      
    this.accuracyEl.innerHTML = `${realAcc}<span>%</span>`;
    
    const accTrend = document.getElementById('stat-accuracy-trend');
    accTrend.textContent = `Keystroke Acc: ${keystrokeAcc}%`;
    if (realAcc < 90 || keystrokeAcc < 90) {
      accTrend.className = "stat-trend negative";
    } else {
      accTrend.className = "stat-trend positive";
    }
    
    const wpm = this.calculateLiveWpm();
    this.wpmEl.innerHTML = `${wpm} <span>WPM</span>`;
    
    this.streakEl.innerHTML = `${this.currentStreak} <span>words</span>`;
    
    const active = this.vault.getActiveMistakes();
    let totalStreak = 0;
    active.forEach(w => totalStreak += w.streak);
    const avgStreak = active.length > 0 ? (totalStreak / active.length).toFixed(1) : '3.0';
    this.levelEl.innerHTML = `${avgStreak} <span>/ 3</span>`;
  }

  // Reactive mascot alerts depending on action
  triggerMascotResponse(emotion) {
    const avatar = document.getElementById('mascot-avatar');
    if (!avatar) return;
    
    if (emotion === 'wink') {
      avatar.style.filter = 'drop-shadow(0 0 8px var(--correct))';
      setTimeout(() => avatar.style.filter = '', 400);
    } else if (emotion === 'glitch') {
      avatar.style.transform = 'translate3d(4px, -2px, 0) scale(0.95)';
      avatar.style.filter = 'drop-shadow(0 0 10px var(--incorrect))';
      setTimeout(() => {
        avatar.style.transform = '';
        avatar.style.filter = '';
      }, 250);
    }
  }

  completeRound() {
    clearInterval(this.timerInterval);
    this.synth.playVictory();
    this.renderHeatmapKeyboard();
    
    // Standings tick
    this.tickLeagueRivals();
    
    // Injected spaced rep checks
    if (this.injectedVaultWords.length > 0 && !this.currentLesson) {
      this.words.forEach((wordToken, wordIndex) => {
        const clean = this.vault.cleanWord(wordToken);
        if (this.injectedVaultWords.includes(clean)) {
          const hadError = this.wordErrorFlags[wordIndex];
          this.vault.recordTypingResult(wordToken, !hadError);
        }
      });
      this.vault.updateUIBadge();
    }
    // If we were running an explicit vault practice session, turn it off now
    if (this.vaultPracticeActive) {
      this.vaultPracticeActive = false;
      this.injectedVaultWords = [];
    }
    
    // Calculations
    const finalWpm = this.calculateLiveWpm();
    
    const keystrokeAcc = this.totalKeystrokes > 0 
      ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
      : 100;
      
    const realAcc = this.currentIndex > 0
      ? Math.round((this.currentCorrectChars / this.currentIndex) * 100)
      : 100;
      
    if (realAcc === 100) {
      this.currentStreak++;
    } else {
      this.currentStreak = 0;
    }
    
    this.updateStatsDisplay();
    
    // XP Calculation!
    // base XP = finalWpm * Real Accuracy pct
    let earnedXP = Math.round(finalWpm * (realAcc / 100));
    if (realAcc === 100) earnedXP += 20; // Perfect bonus!
    if (this.currentLesson) earnedXP += 50; // Lesson roadmap bonus!
    
    this.userXP += earnedXP;
    localStorage.setItem('typo_user_xp', this.userXP);

    // Award small currency rewards
    const coinReward = Math.max(1, Math.round(finalWpm / 10) + (realAcc === 100 ? 5 : 0));
    this.coins += coinReward;
    // small chance for gem on perfect
    if (realAcc === 100 && Math.random() < 0.25) {
      this.gems += 1;
    }
    localStorage.setItem('typo_coins', String(this.coins));
    localStorage.setItem('typo_gems', String(this.gems));
    // update streak
    localStorage.setItem('typo_streak', String(this.currentStreak));
    this.updateCurrencyUI();
    // Check achievements
    this.checkAchievements(finalWpm, realAcc, earnedXP);
    
    // Check if user promoted in league standing! (If you reach rank 1, advance league)
    let advancedLeague = false;
    if (this.userXP > 1000 && this.leagueIndex < this.leagueNameList.length - 1) {
      this.leagueIndex++;
      localStorage.setItem('typo_league_idx', this.leagueIndex);
      this.userXP = 300; // Reset XP slightly in higher league
      localStorage.setItem('typo_user_xp', this.userXP);
      advancedLeague = true;
      
      // Shuffle rivals for new league
      this.leagueRivals.forEach(rival => rival.xp = Math.round(rival.xp * 0.5));
      this.saveLeagueRivals();
    }
    
    this.renderLeagueStandings();
    
    // Update path locks if a roadmap lesson was completed successfully!
    if (this.currentLesson && realAcc >= 90) {
      const activeTrackUnlocked = this.unlockedLevels[this.currentLesson.track] || 1;
      
      if (this.currentLesson.level === activeTrackUnlocked) {
        // Unlock next node level!
        this.unlockedLevels[this.currentLesson.track] = activeTrackUnlocked + 1;
        this.saveUnlockedLevels();
        this.renderRoadmap();
      }
    }

    // Track completed lessons count for achievements
    if (this.currentLesson && realAcc >= 90) {
      const key = 'typo_completed_lessons';
      const raw = Number(localStorage.getItem(key) || '0');
      const next = raw + 1;
      localStorage.setItem(key, String(next));
      this.completedLessons = next;
    }
    
    // Trigger results screen overlay dialog
    this.showResultsScreen(finalWpm, realAcc, keystrokeAcc, earnedXP, advancedLeague);

    // If this was a multi-exercise lesson and there are more exercises, auto-advance after a short pause
    if (this.currentLesson) {
      const lesson = this.currentLesson;
      const lastIdx = (lesson.exercises ? lesson.exercises.length : 1) - 1;
      if (lesson.exerciseIndex < lastIdx) {
        setTimeout(() => {
          try { this.resultsOverlay.close(); } catch(e) {}
          lesson.exerciseIndex++;
          this.restartRound();
        }, 1400);
      }
    }
  }

  // Achievements system
  loadAchievements() {
    const raw = localStorage.getItem('typo_achievements');
    if (!raw) {
      // seed achievement definitions
      const defs = [
        { id: 'first_win', title: 'First Victory', desc: 'Complete your first round', earned: false },
        { id: 'perfect_one', title: 'Perfect Accuracy', desc: 'Score 100% accuracy in a round', earned: false },
        { id: 'streak_5', title: '5 in a Row', desc: 'Reach a streak of 5 flawless rounds', earned: false },
        { id: 'xp_500', title: '500 XP', desc: 'Accumulate 500 XP total', earned: false },
        { id: 'lesson_1', title: 'Lesson Starter', desc: 'Complete your first lesson', earned: false },
        { id: 'lesson_5', title: 'Lesson Builder', desc: 'Complete 5 lessons', earned: false },
        { id: 'lesson_10', title: 'Lesson Architect', desc: 'Complete 10 lessons', earned: false }
      ];
      localStorage.setItem('typo_achievements', JSON.stringify(defs));
      return defs;
    }
    try { return JSON.parse(raw); } catch(e) { return []; }
  }

  checkAchievements(wpm, realAcc, earnedXP) {
    if (!this.achievements) this.achievements = this.loadAchievements();
    let changed = false;
    // first win
    const firstWin = this.achievements.find(a => a.id === 'first_win');
    if (firstWin && !firstWin.earned) { firstWin.earned = true; changed = true; this.triggerMascotSpeech('🏆 New Achievement: First Victory'); }
    // perfect
    const perfect = this.achievements.find(a => a.id === 'perfect_one');
    if (perfect && !perfect.earned && realAcc === 100) { perfect.earned = true; changed = true; this.triggerMascotSpeech('✨ New Achievement: Perfect Accuracy'); }
    // streak
    const streak = this.achievements.find(a => a.id === 'streak_5');
    if (streak && !streak.earned && this.currentStreak >= 5) { streak.earned = true; changed = true; this.triggerMascotSpeech('🔥 New Achievement: 5 Flawless Streak'); }
    // xp
    const xpAch = this.achievements.find(a => a.id === 'xp_500');
    if (xpAch && !xpAch.earned && this.userXP >= 500) { xpAch.earned = true; changed = true; this.triggerMascotSpeech('🎖 New Achievement: 500 XP'); }

    // lesson completions
    const completed = Number(localStorage.getItem('typo_completed_lessons') || '0');
    const l1 = this.achievements.find(a => a.id === 'lesson_1');
    if (l1 && !l1.earned && completed >= 1) { l1.earned = true; changed = true; this.triggerMascotSpeech('🏅 New Achievement: Lesson Starter'); }
    const l5 = this.achievements.find(a => a.id === 'lesson_5');
    if (l5 && !l5.earned && completed >= 5) { l5.earned = true; changed = true; this.triggerMascotSpeech('🏅 New Achievement: Lesson Builder'); }
    const l10 = this.achievements.find(a => a.id === 'lesson_10');
    if (l10 && !l10.earned && completed >= 10) { l10.earned = true; changed = true; this.triggerMascotSpeech('🏅 New Achievement: Lesson Architect'); }

    if (changed) {
      localStorage.setItem('typo_achievements', JSON.stringify(this.achievements));
      // update profile badges display
      const badges = document.getElementById('profile-badges');
      if (badges) {
        badges.innerHTML = '';
        this.achievements.forEach(a => {
          const el = document.createElement('div');
          el.style = 'padding:0.4rem; border-radius:0.4rem; background:rgba(255,255,255,0.02);';
          el.textContent = a.title + (a.earned ? ' ✓' : '');
          if (a.earned) el.style.boxShadow = '0 0 8px rgba(0,242,254,0.2)';
          badges.appendChild(el);
        });
        // also append completed lesson count
        const completed = Number(localStorage.getItem('typo_completed_lessons') || '0');
        const el2 = document.createElement('div');
        el2.style = 'padding:0.4rem; border-radius:0.4rem; background:rgba(255,255,255,0.01);';
        el2.textContent = `Lessons completed: ${completed}`;
        badges.appendChild(el2);
      }
      this.showToast('New achievement unlocked!');
    }
  }

  openAchievementsModal() {
    if (!this.achievements) this.achievements = this.loadAchievements();
    const container = document.getElementById('achievements-list');
    if (!container) return;
    container.innerHTML = '';
    this.achievements.forEach(a => {
      const el = document.createElement('div');
      el.style = 'padding:0.6rem; min-width:140px; border-radius:8px; background:rgba(255,255,255,0.02); display:flex; flex-direction:column; gap:0.25rem;';
      el.innerHTML = `<div style="font-weight:800">${a.title}</div><div style="font-size:0.85rem; color:var(--text-muted)">${a.desc}</div>`;
      if (a.earned) el.style.boxShadow = '0 0 10px rgba(0,242,254,0.08)';
      container.appendChild(el);
    });
    if (this.achievementsModal) this.achievementsModal.showModal();
  }

  updateHeaderAvatar() {
    const el = document.getElementById('header-avatar');
    if (!el) return;
    const prof = this.profile || {};
    const initials = (prof.avatar && prof.avatar.initials) || (prof.username ? prof.username.slice(0,2).toUpperCase() : 'TT');
    const color = (prof.avatar && prof.avatar.color) || prof.color || '#6b46c1';
    el.style.background = color;
    el.textContent = initials;
  }

  updateCurrencyUI() {
    const coinsEl = document.getElementById('ui-coins');
    const gemsEl = document.getElementById('ui-gems');
    if (coinsEl) coinsEl.textContent = String(this.coins || 0);
    if (gemsEl) gemsEl.textContent = String(this.gems || 0);
  }

  showResultsScreen(wpm, realAcc, keystrokeAcc, xp, advancedLeague) {
    document.getElementById('res-wpm-val').innerHTML = `${wpm} <span>WPM</span>`;
    document.getElementById('res-real-val').innerHTML = `${realAcc}<span>%</span>`;
    document.getElementById('res-key-val').innerHTML = `${keystrokeAcc}<span>%</span>`;
    
    // Dynamic overlay headers
    const titleEl = document.getElementById('results-main-title');
    const subtitleEl = document.getElementById('results-subtitle');
    const nextBtn = document.getElementById('results-next-level-btn');
    
    if (this.currentLesson) {
      titleEl.textContent = realAcc >= 90 ? "Lesson Passed!" : "Try Again!";
      subtitleEl.innerHTML = realAcc >= 90 
        ? `You completed the roadmap level successfully! Gained <strong>+${xp} XP</strong>.`
        : `Roadmap lessons require at least <strong>90% Real Accuracy</strong> to advance. Fix your typos!`;
      
      nextBtn.innerHTML = realAcc >= 90 ? "Next Level &rarr;" : "Retry Lesson";
      if (realAcc < 90) {
        // Force retry level instead of incrementing
        nextBtn.onclick = () => {
          this.resultsOverlay.close();
          this.restartRound();
        };
      } else {
        // Restore standard routing
        nextBtn.onclick = () => { this.resultsOverlay.close(); const nextLevel = this.currentLesson.level + 1; const list = window.PATH_SNIPPETS[this.currentLesson.track]; if (nextLevel <= list.length) { this.openLessonPreview(this.currentLesson.track, nextLevel); } else { this.currentLesson = null; this.switchTab("path"); this.triggerMascotSpeech("🎉 Congratulations! You have fully mastered this learning path! Try another track now."); } };
      }
    } else {
      titleEl.textContent = "Arena Round Complete!";
      subtitleEl.innerHTML = `You completed the practice arena! Gained <strong>+${xp} XP</strong>.`;
      nextBtn.innerHTML = "Back to Roadmap &rarr;";
      nextBtn.onclick = () => {
        this.resultsOverlay.close();
        this.switchTab('path');
      };
    }
    
    if (advancedLeague) {
      subtitleEl.innerHTML += `<br><span style="color:var(--primary-accent); font-weight:800;">🎉 PROMOTED! You advanced to the ${this.leagueNameList[this.leagueIndex]}!</span>`;
    }
    
    // Render tricky keys tips
    const activeMistakes = this.vault.getActiveMistakes();
    const tipsBox = document.getElementById('results-improvement-area');
    if (activeMistakes.length > 0 && realAcc < 100) {
      // Gather tricky keys
      const errors = {};
      activeMistakes.slice(0, 3).forEach(w => {
        for (let char of w.word.toLowerCase()) {
          errors[char] = (errors[char] || 0) + 1;
        }
      });
      const topErrors = Object.keys(errors).slice(0, 2).map(k => k.toUpperCase()).join(', ');
      
      if (topErrors) {
        document.getElementById('results-slow-keys').textContent = topErrors;
        tipsBox.style.display = 'block';
      } else {
        tipsBox.style.display = 'none';
      }
      
      // Render final WPM progression chart on results overlay (disable live chart)
      try {
        if (this.chart) this.chart.enabled = false;
        const resultsCanvas = document.getElementById('results-wpm-chart');
        if (resultsCanvas) {
          if (!this.resultsChart) this.resultsChart = new WpmChart('results-wpm-chart');
          this.resultsChart.enabled = true;
          this.resultsChart.update(this.wpmHistory || []);
        }
      } catch (e) {
        console.warn('Failed to render results chart', e);
      }
    } else {
      tipsBox.style.display = 'none';
    }
    
    // Trigger pop overlay dialog
    this.resultsOverlay.showModal();
    
    // Update mascot speech
    const speech = realAcc === 100 ? "Flawless typing! You are typing code like a seasoned pro." :
                   realAcc >= 90 ? "Great speed and accuracy! Let's lock in and keep climbing." : "Typing code is about precision. Correct your typos to pass!";
    this.triggerMascotSpeech(speech);
  }

  // Hidden HTML5 Canvas share card PNG exporter
  exportResultsImageCard() {
    const canvas = document.getElementById('sharing-canvas');
    const ctx = canvas.getContext('2d');
    
    const wpm = this.wpmEl.textContent.split(' ')[0];
    const realAcc = this.accuracyEl.textContent;
    const keystrokeAcc = document.getElementById('stat-accuracy-trend').textContent.split(': ')[1];
    
    // 1. Draw glowing cyberpunk gradient background
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, '#060b13');
    grad.addColorStop(0.5, '#0c0f1d');
    grad.addColorStop(1, '#060b13');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);
    
    // Draw decorative cyber grid lines
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1200; i += 60) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 630); ctx.stroke();
    }
    for (let j = 0; j < 630; j += 60) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(1200, j); ctx.stroke();
    }
    
    // Draw glowing circles in the corners
    const radialL = ctx.createRadialGradient(200, 200, 10, 200, 200, 300);
    radialL.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
    radialL.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialL;
    ctx.fillRect(0, 0, 1200, 630);
    
    const radialR = ctx.createRadialGradient(1000, 450, 10, 1000, 450, 300);
    radialR.addColorStop(0, 'rgba(0, 242, 254, 0.05)');
    radialR.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialR;
    ctx.fillRect(0, 0, 1200, 630);
    
    // 2. Draw border frame
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1120, 550);
    
    // 3. Draw headers
    ctx.fillStyle = '#00f2fe';
    ctx.font = '800 2.2rem Outfit, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TYPO TYPING CHAMPION', 100, 120);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 1rem Outfit, sans-serif';
    ctx.fillText('TECHNICAL SPEED & PRECISION METRICS', 100, 160);
    
    // 4. Draw Mascot representation
    ctx.save();
    ctx.strokeStyle = '#00f2fe';
    ctx.fillStyle = 'rgba(10, 17, 34, 0.7)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 242, 254, 0.4)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(950, 325, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Simplistic stylized vector owl draw on canvas
    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.arc(910, 310, 25, 0, Math.PI * 2); // left eye
    ctx.arc(990, 310, 25, 0, Math.PI * 2); // right eye
    ctx.fill();
    
    ctx.fillStyle = '#060b13';
    ctx.beginPath();
    ctx.arc(910, 310, 12, 0, Math.PI * 2);
    ctx.arc(990, 310, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.moveTo(950, 335); ctx.lineTo(940, 355); ctx.lineTo(960, 355);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // 5. Draw Stat cards
    const statsList = [
      { label: "SPEED", val: `${wpm} WPM`, desc: "Standard net words speed", color: "#00f2fe" },
      { label: "REAL ACCURACY", val: realAcc, desc: "On-screen final accuracy", color: "#10b981" },
      { label: "KEYSTROKE ACC", val: keystrokeAcc, desc: "Raw keystroke accuracy", color: "#a855f7" }
    ];
    
    statsList.forEach((stat, idx) => {
      const startX = 100;
      const startY = 220 + idx * 115;
      
      // Draw glassy card back
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(startX, startY, 680, 95, 10);
      ctx.fill();
      ctx.stroke();
      
      // Draw label indicator bar
      ctx.fillStyle = stat.color;
      ctx.fillRect(startX + 15, startY + 15, 6, 65);
      
      // Text labels
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '700 0.85rem Outfit, sans-serif';
      ctx.fillText(stat.label, startX + 40, startY + 38);
      
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '500 0.8rem Outfit, sans-serif';
      ctx.fillText(stat.desc, startX + 40, startY + 68);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 2.2rem Outfit, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(stat.val, startX + 650, startY + 62);
      ctx.textAlign = 'left';
    });
    
    // 6. Draw active league rank and footer details
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 0.9rem Outfit, sans-serif';
    ctx.fillText(`${this.leagueNameList[this.leagueIndex]} Competitor | Total: ${this.userXP} XP`, 100, 560);
    
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '500 0.85rem JetBrains Mono, monospace';
    ctx.fillText('typo.dev - climb the developer typing path', 900, 560);
    
    // 7. Trigger PNG file download!
    const link = document.createElement('a');
    link.download = 'typo_typing_metrics.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // --- Typo New Features & Enhancements ---

  triggerInlineReward(msg) {
    const banner = document.getElementById('inline-reward');
    const textEl = document.getElementById('inline-reward-text');
    if (banner && textEl) {
      textEl.textContent = msg;
      banner.style.display = 'flex';
      banner.style.animation = 'none';
      setTimeout(() => {
        banner.style.animation = 'slide-reward 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
      }, 5);
      
      clearTimeout(this.rewardTimeout);
      this.rewardTimeout = setTimeout(() => {
        banner.style.display = 'none';
      }, 2500);
    }
  }

  openDevMenu() {
    const modal = document.getElementById('dev-menu-modal');
    if (modal) {
      modal.showModal();
      this.logDevMessage("DEVELOPMENT CONSOLE ACTIVE.");
    }
  }

  logDevMessage(msg) {
    const logBox = document.querySelector('.dev-log-box');
    if (logBox) {
      logBox.innerHTML += `<br>[SYS] ${msg}`;
      logBox.scrollTop = logBox.scrollHeight;
    }
  }

  initializeDevMenuEvents() {
    const closeBtn = document.getElementById('close-dev-menu-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('dev-menu-modal').close();
      });
    }

    const unlockBtn = document.getElementById('dev-unlock-all-btn');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        this.unlockedLevels = { javascript: 10, htmlcss: 10, terminal: 10, symbols: 10 };
        this.saveUnlockedLevels();
        this.renderRoadmap();
        this.logDevMessage("ALL ROADMAP PATHWAYS FULLY UNLOCKED.");
      });
    }

    const xpBtn = document.getElementById('dev-boost-xp-btn');
    if (xpBtn) {
      xpBtn.addEventListener('click', () => {
        this.userXP += 500;
        localStorage.setItem('typo_user_xp', this.userXP);
        this.renderLeagueStandings();
        this.logDevMessage("GRANTED +500 XP BOOST.");
      });
    }

    const injectBtn = document.getElementById('dev-inject-mistakes-btn');
    if (injectBtn) {
      injectBtn.addEventListener('click', () => {
        this.vault.addWord("const");
        this.vault.addWord("async");
        this.vault.addWord("await");
        this.vault.addWord("function");
        this.vault.addWord("interface");
        this.renderHeatmapKeyboard();
        this.logDevMessage("5 SYNTAX MISTAKES INJECTED INTO VAULT.");
      });
    }

    const maxLeagueBtn = document.getElementById('dev-max-league-btn');
    if (maxLeagueBtn) {
      maxLeagueBtn.addEventListener('click', () => {
        this.leagueIndex = 6; // Diamond
        localStorage.setItem('typo_league_idx', this.leagueIndex);
        this.renderLeagueStandings();
        this.logDevMessage("LEAGUE ELEVATED TO DIAMOND.");
      });
    }

    const triggerSoundBtn = document.getElementById('dev-trigger-sound-btn');
    if (triggerSoundBtn) {
      triggerSoundBtn.addEventListener('click', () => {
        this.synth.playClick(true);
        this.logDevMessage("MECHANICAL SWITCH FREQUENCY PLAYED.");
      });
    }

    const clearLocalBtn = document.getElementById('dev-clear-local-btn');
    if (clearLocalBtn) {
      clearLocalBtn.addEventListener('click', () => {
        localStorage.clear();
        this.logDevMessage("LOCAL DATA ERASED. REBOOTING ENGINE...");
        setTimeout(() => window.location.reload(), 1500);
      });
    }
  }

  initializeTutorialEvents() {
    const modal = document.getElementById('tutorial-modal');
    const startBtn = document.getElementById('start-tutorial-btn');
    const closeBtn = document.getElementById('close-tutorial-btn');
    const prevBtn = document.getElementById('prev-tutorial-btn');
    const nextBtn = document.getElementById('next-tutorial-btn');
    
    if (!modal || !startBtn) return;

    const slides = [
      {
        title: "Welcome to Typo! 🦉",
        desc: "Hi, I'm Typo! I will be your cyber-owl coding companion. Let's learn to type programming commands and syntax at lightspeed!"
      },
      {
        title: "Roadmap pathways 🗺️",
        desc: "Academy Path features specialized, progressive roadmap tracks like JavaScript, HTML & CSS, and Terminal. Master each track level-by-level."
      },
      {
        title: "Mistake Vault & Spaced Repetition 🔒",
        desc: "Any word you mistype is locked into your Mistake Vault. Switch to Spaced Repetition mode to practice and clear your mistakes seamlessly!"
      },
      {
        title: "Interactive Posture Guides ⌨️",
        desc: "Use the real-time visual finger guide at the bottom of the Practice Arena. It highlights which finger is optimal for the next keycap!"
      }
    ];
    
    let currentSlide = 0;
    
    const renderSlide = () => {
      const slide = slides[currentSlide];
      document.getElementById('tutorial-slide-title').textContent = slide.title;
      document.getElementById('tutorial-slide-desc').textContent = slide.desc;
      document.getElementById('tutorial-progress-indicator').textContent = `Slide ${currentSlide + 1} / ${slides.length}`;
      
      prevBtn.disabled = currentSlide === 0;
      nextBtn.textContent = currentSlide === slides.length - 1 ? "Start Practicing!" : "Next →";
    };
    
    startBtn.addEventListener('click', () => {
      currentSlide = 0;
      renderSlide();
      modal.showModal();
      this.synth.playClick(false);
    });
    
    closeBtn.addEventListener('click', () => {
      modal.close();
    });
    
    prevBtn.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        renderSlide();
        this.synth.playClick(false);
      }
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        renderSlide();
        this.synth.playClick(false);
      } else {
        modal.close();
        this.switchTab('arena');
      }
    });
  }

  renderHeatmapKeyboard() {
    // 1. Reset all caps
    document.querySelectorAll('.keycap').forEach(cap => {
      cap.removeAttribute('data-intensity');
      cap.removeAttribute('data-errors');
    });
    
    // 2. Count mistake intensities from the vault data
    const active = this.vault.getActiveMistakes();
    const charErrors = {};
    
    active.forEach(item => {
      const clean = item.word.toLowerCase();
      for (let char of clean) {
        if (/[a-z0-9]/.test(char)) {
          charErrors[char] = (charErrors[char] || 0) + 1;
        }
      }
    });
    
    // 3. Mark keycaps with error counts and heat intensities
    Object.keys(charErrors).forEach(char => {
      const count = charErrors[char];
      const keycap = document.querySelector(`.keycap[data-key="${char}"]`);
      if (keycap) {
        keycap.setAttribute('data-errors', count);
        const intensity = count >= 5 ? 3 : count >= 3 ? 2 : 1;
        keycap.setAttribute('data-intensity', intensity);
      }
    });
  }

  renderVaultDrawerList() {
    const active = this.vault.getActiveMistakes();
    
    // Update stats summary in drawer
    document.getElementById('vault-summary-active').textContent = active.length;
    document.getElementById('vault-summary-mastered').textContent = this.vault.data.masteredCount;
    
    let totalStreak = 0;
    active.forEach(w => totalStreak += w.streak);
    const avgStreak = active.length > 0 ? (totalStreak / active.length).toFixed(1) : '0.0';
    document.getElementById('vault-summary-streak').textContent = avgStreak;
    
    const listContainer = document.getElementById('vault-word-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    if (active.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 2rem 0;">
          Your Mistake Vault is clear! Type flawlessly to keep it empty.
        </div>`;
      return;
    }
    
    active.forEach(item => {
      const row = document.createElement('div');
      row.style = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); font-size: 0.85rem;";
      
      // Build fire/streak indicators
      let streakText = '';
      for(let i=0; i<3; i++) {
        streakText += i < item.streak ? '🔥' : '⚫';
      }
      
      row.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.15rem;">
          <span style="font-family: var(--font-mono); font-weight: 700; color: var(--primary-accent);">${item.word}</span>
          <span style="font-size:0.75rem; color: var(--text-muted);">Streak: ${streakText} | Errors: ${item.mistakeCount}</span>
        </div>
        <button class="btn btn-icon" style="padding:0.35rem; border-radius:var(--radius-sm); border-color:transparent; color: var(--incorrect);" onclick="window.game.removeVaultWord('${item.word}')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>`;
      listContainer.appendChild(row);
    });
  }

  removeVaultWord(word) {
    this.vault.removeWord(word);
    this.renderVaultDrawerList();
    this.renderHeatmapKeyboard();
    this.restartRound();
  }
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
});
