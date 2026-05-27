// ============================================================
//  ARENA CLASH — MAIN.JS
//  App bootstrap: state management, screen flow, save/load
// ============================================================

// ─── APP STATE ────────────────────────────────────────────────
const App = (() => {

  let state = {
    screen:         'start',   // start | lobby | battle
    heroes:         [],
    selectedHeroId: 'starter',
    selectedMap:    null,
    currency: {
      cryan:       2500,
      harwok:      80,
      levelPoints: 1200,
    },
    mails:        [],
    matchCount:   0,
    totalScore:   0,
    totalWins:    0,
    shopTab:      'heroes',
    questState: {
      wins:     0,
      damage:   0,
      maxCombo: 0,
      matches:  0,
    },
  };

  const root = document.getElementById('root');

  // ─── INIT ─────────────────────────────────────────────────
  function init() {
    loadState();
    if (!state.selectedMap) state.selectedMap = MAPS_DATA[0];

    Screens.buildStart(root, goToLobby);
  }

  // ─── SAVE / LOAD ──────────────────────────────────────────
  function saveState() {
    try {
      const save = {
        heroes:         state.heroes,
        selectedHeroId: state.selectedHeroId,
        selectedMap:    state.selectedMap?.id || 'arena',
        currency:       state.currency,
        mails:          state.mails,
        matchCount:     state.matchCount,
        totalScore:     state.totalScore,
        totalWins:      state.totalWins,
        questState:     state.questState,
      };
      localStorage.setItem('arenaClashSave', JSON.stringify(save));
    } catch (_) {}
  }

  function loadState() {
    // Start from fresh hero data each time, then overlay save
    state.heroes = JSON.parse(JSON.stringify(HEROES_DATA));

    try {
      const raw = localStorage.getItem('arenaClashSave');
      if (!raw) return;
      const save = JSON.parse(raw);

      // Merge saved hero progress into fresh hero data
      if (save.heroes) {
        save.heroes.forEach(savedHero => {
          const hero = state.heroes.find(h => h.id === savedHero.id);
          if (hero) {
            hero.unlocked = savedHero.unlocked;
            hero.level    = savedHero.level || 1;
            hero.xp       = savedHero.xp    || 0;
          }
        });
      }

      state.selectedHeroId = save.selectedHeroId || 'starter';
      state.selectedMap    = MAPS_DATA.find(m => m.id === (save.selectedMap || 'arena')) || MAPS_DATA[0];
      state.currency       = save.currency  || state.currency;
      state.mails          = save.mails     || [];
      state.matchCount     = save.matchCount || 0;
      state.totalScore     = save.totalScore || 0;
      state.totalWins      = save.totalWins  || 0;
      state.questState     = save.questState || state.questState;
    } catch (_) {}
  }

  // ─── SCREEN FLOW ──────────────────────────────────────────
  function goToLobby() {
    state.screen = 'lobby';
    Screens.buildLobby(root, state, {
      onSelectHero:  selectHero,
      onStartBattle: startBattle,
      onSelectMap:   selectMap,
      onCollectMail: collectMail,
      onLevelUp:     doLevelUp,
      onToggleSound: toggleSound,
    });

    // Refresh mail badge
    UI.renderMail(state, collectMail);
    Screens.showScreen('screen-lobby');
  }

  function startBattle() {
    const hero = state.heroes.find(h => h.id === state.selectedHeroId);
    if (!hero) return;

    state.screen = 'battle';
    Battle.stop();

    Screens.buildBattle(root, hero, state.selectedMap);
    Screens.showScreen('screen-battle');

    Battle.init(hero, state.selectedMap, onBattleEnd);

    // Wire Return button
    const retBtn = document.getElementById('btn-return');
    if (retBtn) retBtn.addEventListener('click', goToLobby);
  }

  function onBattleEnd(won, score, kills, maxCombo, harwok, xp, sessionDmg) {
    // Update currency
    state.currency.harwok += harwok;

    // Update scores
    state.totalScore += score;
    if (won) state.totalWins++;
    state.matchCount++;

    // Quest tracking
    if (won)       state.questState.wins++;
    state.questState.damage  += sessionDmg || 0;
    state.questState.maxCombo = Math.max(state.questState.maxCombo, maxCombo);
    state.questState.matches++;

    // Award XP to selected hero
    const hero = state.heroes.find(h => h.id === state.selectedHeroId);
    if (hero) {
      hero.xp = (hero.xp || 0) + xp;
      // Auto level-up if enough XP
      while (hero.xp >= (hero.level || 1) * XP_PER_LEVEL + XP_PER_LEVEL) {
        hero.level = (hero.level || 1) + 1;
        UI.notify(`${hero.name} auto-leveled to Lv.${hero.level}!`, hero.color);
        Sound.levelup();
      }
    }

    // Welcome mail after first match
    if (state.matchCount === 1) sendWelcomeMail();

    saveState();
    UI.notify(`${won ? '⚔ VICTORY' : 'Defeated'} · +${harwok} Harwok · +${xp} XP`, won ? '#FFD700' : '#FF9800');
  }

  // ─── HERO MANAGEMENT ──────────────────────────────────────
  function selectHero(heroId) {
    state.selectedHeroId = heroId;
    Screens.updateLobby(state, {
      onSelectHero:  selectHero,
      onStartBattle: startBattle,
      onSelectMap:   selectMap,
      onCollectMail: collectMail,
      onLevelUp:     doLevelUp,
      onToggleSound: toggleSound,
    });
    saveState();
  }

  function buyHero(heroId) {
    const hero = state.heroes.find(h => h.id === heroId);
    if (!hero || hero.unlocked) return;
    if (state.currency.cryan < hero.cost) { UI.notify('Not enough Cryan!', '#F44336'); return; }
    state.currency.cryan -= hero.cost;
    hero.unlocked = true;
    Sound.collect();
    UI.notify(`${hero.name} unlocked!`, hero.color);
    UI.renderShop(state);
    Screens.updateLobby(state, getLobbyHandlers());
    saveState();
  }

  function doLevelUp(hero, cost) {
    if (state.currency.levelPoints < cost) { UI.notify('Not enough Level Points!', '#F44336'); return; }
    state.currency.levelPoints -= cost;
    const h = state.heroes.find(hh => hh.id === hero.id);
    if (h) h.level = (h.level || 1) + 1;
    Sound.levelup();
    UI.notify(`${hero.name} → Lv.${(h.level)}!`, hero.color);
    UI.closeModal('modal-levelup');
    Screens.updateLobby(state, getLobbyHandlers());
    saveState();
  }

  // ─── CHEST ────────────────────────────────────────────────
  function openChest(chestKey) {
    UI.openChestModal(chestKey, state, result => {
      if (result.type === 'hero') {
        const locked = state.heroes.filter(h => !h.unlocked && h.id !== 'starter');
        if (locked.length) {
          const pick = locked[Math.floor(Math.random() * locked.length)];
          pick.unlocked = true;
          UI.notify(`${pick.name} UNLOCKED from chest!`, '#FFD700');
        } else {
          state.currency.cryan += 300;
          UI.notify('All heroes owned! Bonus +300 Cryan', '#D4AC0D');
        }
      } else if (result.type === 'levelPoints') {
        state.currency.levelPoints += result.amount || 100;
        UI.notify(`+${result.amount} Level Points!`, '#CE93D8');
      } else if (result.type === 'cryan') {
        state.currency.cryan += result.amount || 100;
        UI.notify(`+${result.amount} Cryan!`, '#D4AC0D');
      }
      Screens.updateLobby(state, getLobbyHandlers());
      saveState();
    });
  }

  // ─── MAIL ─────────────────────────────────────────────────
  function sendWelcomeMail() {
    state.mails.unshift({
      id:      Date.now(),
      subject: '🎉 Welcome to Arena Clash!',
      from:    'Arena Command',
      date:    new Date().toLocaleDateString(),
      body:    'Commander! You\'ve completed your first battle and proven yourself worthy of the Arena. We\'ve prepared a special welcome gift. Open the Epic Chest for a chance at rare heroes, and use the Level Points to strengthen your warriors. Good luck on the battlefield — the leaderboard awaits.',
      attachments: [
        { icon: '💜', name: 'Epic Chest ×1',          desc: '10% hero drop — open from Shop > Chests' },
        { icon: '⭐', name: 'Level Up Points ×500',   desc: 'Use to upgrade your heroes power' },
      ],
      rewards: [
        { type: 'levelPoints', amount: 500 },
      ],
      collected: false,
    });
  }

  // Admin can call this to send custom mail
  function sendAdminMail(subject, body, attachments, rewards) {
    state.mails.unshift({
      id:          Date.now(),
      subject,
      body,
      from:        'Arena Command',
      date:        new Date().toLocaleDateString(),
      attachments: attachments || [],
      rewards:     rewards     || [],
      collected:   false,
    });
    saveState();
    UI.notify('New mail received!', '#F72585');
    // Refresh mail badge
    const badge = document.getElementById('mail-badge');
    const unread = state.mails.filter(m => !m.collected).length;
    if (badge) { badge.textContent = unread; badge.style.display = unread ? 'flex' : 'none'; }
  }

  function collectMail(mail) {
    mail.rewards?.forEach(r => {
      if (r.type === 'levelPoints') { state.currency.levelPoints += r.amount; UI.notify(`+${r.amount} Level Points collected!`, '#CE93D8'); }
      if (r.type === 'cryan')       { state.currency.cryan       += r.amount; UI.notify(`+${r.amount} Cryan collected!`, '#D4AC0D'); }
      if (r.type === 'harwok')      { state.currency.harwok      += r.amount; UI.notify(`+${r.amount} Harwok collected!`, '#4CC9F0'); }
    });
    const m = state.mails.find(mm => mm.id === mail.id);
    if (m) m.collected = true;
    Screens.updateLobby(state, getLobbyHandlers());
    saveState();
  }

  // ─── MAP ──────────────────────────────────────────────────
  function selectMap(map) {
    state.selectedMap = map;
    Screens.updateLobby(state, getLobbyHandlers());
    saveState();
  }

  // ─── SOUND ────────────────────────────────────────────────
  function toggleSound() {
    const muted = !Sound.isMuted();
    Sound.setMuted(muted);
    const btn = document.getElementById('nav-sound');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
    UI.notify(muted ? 'Sound OFF' : 'Sound ON', '#4CC9F0');
  }

  // ─── SHOP TAB (called from HTML onclick) ──────────────────
  function setShopTab(tab) {
    state.shopTab = tab;
    UI.renderShop(state);
  }

  // ─── HELPERS ──────────────────────────────────────────────
  function getLobbyHandlers() {
    return {
      onSelectHero:  selectHero,
      onStartBattle: startBattle,
      onSelectMap:   selectMap,
      onCollectMail: collectMail,
      onLevelUp:     doLevelUp,
      onToggleSound: toggleSound,
    };
  }

  // Wire shop buy/chest buttons via event delegation
  document.addEventListener('click', e => {
    const buyBtn   = e.target.closest('.btn-buy-hero');
    const chestBtn = e.target.closest('.btn-open-chest');
    if (buyBtn)   { Sound.click(); buyHero(buyBtn.dataset.hero); }
    if (chestBtn) { Sound.click(); openChest(chestBtn.dataset.chest); }
  });

  // ─── PUBLIC API (for admin / dev console) ─────────────────
  return {
    init,
    setShopTab,
    sendAdminMail,
    // Dev console helpers:
    addCryan:       (n) => { state.currency.cryan       += n; Screens.updateLobby(state, getLobbyHandlers()); saveState(); UI.notify(`+${n} Cryan`, '#D4AC0D'); },
    addHarwok:      (n) => { state.currency.harwok      += n; Screens.updateLobby(state, getLobbyHandlers()); saveState(); UI.notify(`+${n} Harwok`, '#4CC9F0'); },
    addLevelPoints: (n) => { state.currency.levelPoints += n; Screens.updateLobby(state, getLobbyHandlers()); saveState(); UI.notify(`+${n} Level Points`, '#CE93D8'); },
    unlockAll:      ()  => { state.heroes.forEach(h => h.unlocked = true); Screens.updateLobby(state, getLobbyHandlers()); saveState(); UI.notify('All heroes unlocked!', '#FFD700'); },
    resetSave:      ()  => { localStorage.removeItem('arenaClashSave'); location.reload(); },
    getState:       ()  => state,
  };
})();

// ─── BOOT ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => App.init());

// ─── LOCK SCREEN ORIENTATION (mobile) ─────────────────────────
if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('landscape').catch(() => {});
}
