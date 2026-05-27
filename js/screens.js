// ============================================================
//  ARENA CLASH — SCREENS.JS
//  Builds and manages all game screens (Start, Lobby, Battle)
// ============================================================

const Screens = (() => {

  // ─── BUILD START SCREEN ───────────────────────────────────
  function buildStart(root, onPlay) {
    root.innerHTML = `
      <!-- Landscape warning -->
      <div class="landscape-warning">
        <div class="rotate-icon">📱</div>
        <h2>Rotate Your Device</h2>
        <p>Arena Clash is best played in <strong>landscape</strong> mode.<br>Please rotate your phone sideways.</p>
      </div>

      <div id="screen-start" class="screen active">
        <!-- Starfield bg -->
        <div class="bg-layer" id="starfield"></div>
        <!-- Radial glows -->
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 10%,rgba(247,37,133,0.15) 0%,transparent 65%);pointer-events:none"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 80%,rgba(155,93,229,0.1) 0%,transparent 55%);pointer-events:none"></div>

        <div class="start-content">
          <div style="font-size:10px;letter-spacing:12px;color:#F72585;font-family:var(--font-body);margin-bottom:12px;opacity:0.7;text-transform:uppercase">Ancient Worlds · Alpha</div>

          <div class="game-title">
            <div class="title-arena">ARENA</div>
            <div class="title-clash">CLASH</div>
          </div>
          <div class="title-sub">3 v s 3 · R e a l - T i m e · B a t t l e</div>

          <!-- Hero showcase row -->
          <div class="hero-row" id="start-hero-row"></div>

          <button class="btn-play" id="btn-play">▶ &nbsp; PLAY</button>
          <div class="version-tag">Arena Clash v2.0 · All rights reserved</div>
        </div>
      </div>
    `;

    // Stars
    const sf = document.getElementById('starfield');
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const colors = ['#F72585','#7B2FBE','#4CC9F0','#D4AC0D','#52B788','#FF6B35'];
      s.style.cssText = `
        left:${Math.random()*100}%;top:${Math.random()*100}%;
        width:${Math.random()*2+0.5}px;height:${Math.random()*2+0.5}px;
        background:${colors[i%colors.length]};opacity:${0.15+Math.random()*0.3};
        animation:starFloat ${4+Math.random()*6}s ease-in-out infinite;
        animation-delay:${Math.random()*4}s;
      `;
      sf.appendChild(s);
    }

    // Hero row
    const row = document.getElementById('start-hero-row');
    HEROES_DATA.filter(h => h.id !== 'starter').forEach((h, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'hero-thumb';
      wrap.style.animationDelay = `${i * 0.3}s`;
      const heroEl = HeroRenderer.createHeroElement(h.id, 78, true);
      wrap.appendChild(heroEl);
      wrap.innerHTML += `
        <div class="hero-thumb-name" style="color:${h.color}">${h.name}</div>
        <div class="hero-thumb-rarity">${h.rarity}</div>`;
      row.appendChild(wrap);
    });

    document.getElementById('btn-play').addEventListener('click', () => {
      Sound.click();
      onPlay();
    });
  }

  // ─── BUILD LOBBY SCREEN ───────────────────────────────────
  function buildLobby(root, appState, handlers) {
    // Inject lobby HTML (only once)
    if (!document.getElementById('screen-lobby')) {
      root.insertAdjacentHTML('beforeend', lobbyHTML());
      buildModals(root);
    }
    updateLobby(appState, handlers);
  }

  function lobbyHTML() {
    return `
    <div id="screen-lobby" class="screen">
      <div class="grid-overlay"></div>

      <!-- TOP NAV BAR -->
      <div class="lobby-topbar">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <div class="lobby-logo">ARENA CLASH</div>
          <div class="nav-btns">
            <button class="nav-btn" id="nav-shop"   style="background:#D4AC0D18;border:1px solid #D4AC0D44;color:#D4AC0D">🏪 SHOP</button>
            <button class="nav-btn" id="nav-mail"   style="background:#F7258518;border:1px solid #F7258544;color:#F72585;position:relative">
              📬 MAIL <span id="mail-badge" style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:#F72585;border-radius:50%;font-size:9px;display:none;align-items:center;justify-content:center;font-family:var(--font-hud)"></span>
            </button>
            <button class="nav-btn" id="nav-ranks"  style="background:#4CC9F018;border:1px solid #4CC9F044;color:#4CC9F0">🏆 RANKS</button>
            <button class="nav-btn" id="nav-levelup" style="background:#CE93D818;border:1px solid #CE93D844;color:#CE93D8">⬆ LEVEL UP</button>
            <button class="nav-btn" id="nav-quests" style="background:#52B78818;border:1px solid #52B78844;color:#52B788">📋 QUESTS</button>
            <button class="nav-btn" id="nav-sound"  style="background:transparent;border:1px solid #333;color:#555">🔊</button>
          </div>
        </div>
        <div class="currency-bar">
          <div class="currency-chip" id="chip-cryan"  style="background:#D4AC0D11;border:1px solid #D4AC0D33">
            <div class="c-icon">💎</div><div class="c-val" style="color:#D4AC0D" id="c-cryan">0</div><div class="c-label">Cryan</div>
          </div>
          <div class="currency-chip" id="chip-harwok" style="background:#4CC9F011;border:1px solid #4CC9F033">
            <div class="c-icon">🪙</div><div class="c-val" style="color:#4CC9F0" id="c-harwok">0</div><div class="c-label">Harwok</div>
          </div>
          <div class="currency-chip" id="chip-lp"     style="background:#CE93D811;border:1px solid #CE93D833">
            <div class="c-icon">⭐</div><div class="c-val" style="color:#CE93D8" id="c-lp">0</div><div class="c-label">Lv.Pts</div>
          </div>
        </div>
      </div>

      <!-- MAIN 2-COL LAYOUT -->
      <div class="lobby-main">
        <!-- LEFT: Roster -->
        <div class="roster-panel">
          <div class="panel-label">HERO ROSTER</div>
          <div id="roster-list"></div>
        </div>

        <!-- CENTER: Showcase -->
        <div class="showcase-panel">
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%">
            <!-- Hero aura + display -->
            <div class="showcase-hero-wrap" id="showcase-wrap">
              <div class="aura-ring" id="aura-outer" style="inset:-60px;border-radius:50%"></div>
              <div class="spin-ring" id="spin-ring"  style="inset:-28px;border-radius:50%;border:1px solid transparent"></div>
              <div id="showcase-hero-el"></div>
            </div>

            <div class="hero-name-big" id="showcase-name"></div>
            <div class="hero-badges">
              <div style="font-size:11px;color:var(--muted);letter-spacing:4px;font-family:var(--font-body);text-transform:uppercase" id="showcase-rarity"></div>
              <div class="badge" id="showcase-level" style="font-family:var(--font-hud);font-size:11px;letter-spacing:2px"></div>
            </div>

            <!-- XP bar -->
            <div class="xp-track">
              <div class="xp-track-label">
                <span>XP TO NEXT LEVEL</span>
                <span id="xp-label">0 / 500</span>
              </div>
              <div class="xp-track-bar">
                <div class="xp-track-fill" id="xp-fill"></div>
              </div>
            </div>

            <div class="hero-lore" id="showcase-lore"></div>

            <!-- Abilities -->
            <div class="ability-row" id="ability-row"></div>

            <!-- Stats -->
            <div class="stats-box">
              <div class="stats-box-label" id="stats-label">BASE STATS</div>
              <div id="stats-bars"></div>
            </div>
          </div>

          <!-- Player session stats -->
          <div class="player-stats-row" id="player-stats-row"></div>

          <!-- Map + Battle buttons -->
          <div class="battle-row">
            <button class="btn-map" id="btn-map-select" style="border:1px solid transparent"></button>
            <button class="btn-battle" id="btn-battle">⚔ BATTLE</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function updateLobby(appState, handlers) {
    const s = document.getElementById('screen-lobby');
    if (!s) return;

    const hero = appState.heroes.find(h => h.id === appState.selectedHeroId) || appState.heroes[0];
    const lvl  = hero.level || 1;
    const xp   = hero.xp   || 0;
    const bonus = getStatBonus(lvl);
    const XP_NEEDED = XP_PER_LEVEL;

    // Currency chips
    document.getElementById('c-cryan').textContent  = appState.currency.cryan.toLocaleString();
    document.getElementById('c-harwok').textContent = appState.currency.harwok;
    document.getElementById('c-lp').textContent     = appState.currency.levelPoints.toLocaleString();

    // Roster
    const rosterEl = document.getElementById('roster-list');
    if (rosterEl) {
      rosterEl.innerHTML = '';
      appState.heroes.forEach(h => {
        const card  = document.createElement('div');
        const isSel = h.id === appState.selectedHeroId;
        card.className = `hero-card ${h.unlocked ? '' : 'locked'} ${isSel ? 'selected' : ''}`;
        card.style.cssText = `background:${isSel ? h.color+'1a' : 'rgba(255,255,255,0.02)'};border-color:${isSel ? h.color : 'transparent'}`;
        const hLvl = h.level || 1;
        const hXP  = h.xp   || 0;
        const xpPct = (hXP % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
        card.innerHTML = `
          <div style="position:relative;flex-shrink:0">
            <div id="rt-${h.id}"></div>
            ${!h.unlocked ? '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:18px;background:rgba(0,0,0,0.5);border-radius:50%">🔒</div>' : ''}
          </div>
          <div class="hero-card-info">
            <div class="hero-card-name" style="color:${h.unlocked ? h.color : '#444'}">${h.name}</div>
            ${h.unlocked
              ? `<div class="hero-card-sub">Lv.${hLvl} · ${h.rarity}</div>
                 <div class="xp-bar"><div class="xp-fill" style="width:${xpPct}%;background:${h.color}"></div></div>`
              : `<div class="hero-card-sub">${h.cost > 0 ? h.cost + ' Cryan' : 'FREE'}</div>`}
          </div>`;
        card.addEventListener('click', () => {
          if (!h.unlocked) return;
          Sound.click();
          handlers.onSelectHero(h.id);
        });
        rosterEl.appendChild(card);
        const thumb = document.getElementById(`rt-${h.id}`);
        if (thumb) thumb.appendChild(HeroRenderer.createHeroElement(h.id, 44, isSel));
      });
    }

    // Showcase hero display
    const showcaseEl = document.getElementById('showcase-hero-el');
    if (showcaseEl) {
      HeroRenderer.stopAnimation(showcaseEl.firstChild);
      showcaseEl.innerHTML = '';
      showcaseEl.appendChild(HeroRenderer.createHeroElement(hero.id, 220, true));
    }

    // Aura/ring colors
    const outerAura = document.getElementById('aura-outer');
    const spinRing  = document.getElementById('spin-ring');
    if (outerAura) outerAura.style.background = `radial-gradient(circle,${hero.color}18 0%,transparent 70%)`;
    if (spinRing)  spinRing.style.borderColor  = hero.color + '22';

    // Name / rarity / level badge
    const nameEl    = document.getElementById('showcase-name');
    const rarityEl  = document.getElementById('showcase-rarity');
    const levelEl   = document.getElementById('showcase-level');
    if (nameEl) {
      nameEl.textContent = hero.name;
      nameEl.style.background = `linear-gradient(135deg,${hero.color},${hero.accent})`;
      nameEl.style.webkitBackgroundClip = 'text';
      nameEl.style.webkitTextFillColor  = 'transparent';
      nameEl.style.backgroundClip       = 'text';
    }
    if (rarityEl) rarityEl.textContent = hero.rarity;
    if (levelEl) {
      levelEl.textContent = `Lv.${lvl}`;
      levelEl.style.background = hero.color + '22';
      levelEl.style.border     = `1px solid ${hero.color}55`;
      levelEl.style.color      = hero.color;
    }

    // XP bar
    const xpFill  = document.getElementById('xp-fill');
    const xpLabel = document.getElementById('xp-label');
    if (xpFill) { xpFill.style.width = `${(xp % XP_NEEDED) / XP_NEEDED * 100}%`; xpFill.style.background = `linear-gradient(90deg,${hero.color}88,${hero.color})`; }
    if (xpLabel) xpLabel.textContent = `${xp % XP_NEEDED} / ${XP_NEEDED}`;

    // Lore
    const loreEl = document.getElementById('showcase-lore');
    if (loreEl) loreEl.textContent = `"${hero.lore}"`;

    // Abilities
    const abilityRow = document.getElementById('ability-row');
    if (abilityRow) {
      abilityRow.innerHTML = [
        ['⚡', 'PASSIVE',   hero.passive,       hero.color],
        ['🗡', 'SKILL 1',   hero.skill1,        hero.color],
        ['💫', 'SKILL 2',   hero.skill2,        hero.accent],
        ['🌟', 'ULTIMATE',  hero.ultimate,      '#FFD700'],
      ].map(([icon, type, name, color]) => `
        <div class="ability-chip" style="background:${color}11;border:1px solid ${color}33">
          <div class="ability-icon">${icon}</div>
          <div class="ability-type">${type}</div>
          <div class="ability-name" style="color:${color}">${name}</div>
        </div>`).join('');
    }

    // Stats bars
    const statsLabel = document.getElementById('stats-label');
    const statsBars  = document.getElementById('stats-bars');
    if (statsLabel) statsLabel.textContent = `BASE STATS ${bonus > 0 ? '+ LEVEL BONUS' : ''}`;
    if (statsBars) {
      const defs = [['HP','#4CAF50',hero.stats.hp],['ATK','#F44336',hero.stats.atk],['SPD','#4CC9F0',hero.stats.spd],['DEF','#FF9800',hero.stats.def]];
      statsBars.innerHTML = defs.map(([label, color, val]) => {
        const bonusPct = Math.min(100, val + bonus) - Math.min(100, val);
        return `<div class="stat-row">
          <div class="stat-row-labels">
            <span>${label}</span>
            <span style="color:${color}">${val}${bonus > 0 ? `<span style="color:#4CAF50;font-size:9px"> +${bonus}</span>` : ''}</span>
          </div>
          <div class="stat-row-bar" style="display:flex">
            <div class="stat-fill" style="width:${Math.min(100,val)}%;background:linear-gradient(90deg,${color}77,${color})"></div>
            ${bonus > 0 ? `<div style="width:${bonusPct}%;height:100%;background:rgba(76,175,80,0.5)"></div>` : ''}
          </div>
        </div>`;
      }).join('');
    }

    // Player session stats
    const psRow = document.getElementById('player-stats-row');
    if (psRow) {
      psRow.innerHTML = [
        ['⚔', appState.totalWins, 'Wins'],
        ['🎯', appState.totalScore.toLocaleString(), 'Score'],
        ['🎮', appState.matchCount, 'Matches'],
      ].map(([icon, val, label]) => `
        <div class="stat-chip">
          <div class="stat-chip-icon">${icon}</div>
          <div class="stat-chip-val">${val}</div>
          <div class="stat-chip-label">${label}</div>
        </div>`).join('');
    }

    // Map button
    const mapBtn = document.getElementById('btn-map-select');
    if (mapBtn) {
      mapBtn.textContent = `🗺 ${appState.selectedMap.name.toUpperCase()}`;
      mapBtn.style.borderColor = appState.selectedMap.accent + '55';
      mapBtn.style.color = appState.selectedMap.accent;
    }

    // Battle button
    const battleBtn = document.getElementById('btn-battle');
    if (battleBtn) {
      battleBtn.style.background = `linear-gradient(135deg,${hero.color},${hero.accent})`;
      battleBtn.style.boxShadow  = `0 0 40px ${hero.color}66`;
      battleBtn.style.animation  = `ultimateGlow 2s ease infinite`;
    }

    // Nav handlers (attach once guard)
    if (!s._navBound) {
      s._navBound = true;
      document.getElementById('nav-shop').addEventListener('click',    () => { Sound.click(); UI.openModal('modal-shop'); UI.renderShop(appState); });
      document.getElementById('nav-mail').addEventListener('click',    () => { Sound.click(); UI.openModal('modal-mail'); UI.renderMail(appState, handlers.onCollectMail); });
      document.getElementById('nav-ranks').addEventListener('click',   () => { Sound.click(); UI.openModal('modal-ranks'); UI.renderLeaderboard(appState.totalScore, appState.heroes.find(h=>h.id===appState.selectedHeroId), appState.totalWins); });
      document.getElementById('nav-levelup').addEventListener('click', () => { Sound.click(); UI.openModal('modal-levelup'); UI.renderLevelUp(appState.heroes.find(h=>h.id===appState.selectedHeroId), appState.currency.levelPoints, handlers.onLevelUp); });
      document.getElementById('nav-quests').addEventListener('click',  () => { Sound.click(); UI.openModal('modal-quests'); UI.renderQuests(appState.questState || {}); });
      document.getElementById('nav-sound').addEventListener('click',   () => { handlers.onToggleSound(); });
      document.getElementById('btn-map-select').addEventListener('click', () => { Sound.click(); UI.openModal('modal-map'); UI.renderMapSelect(appState.selectedMap, handlers.onSelectMap); });
      document.getElementById('btn-battle').addEventListener('click',  () => { Sound.click(); handlers.onStartBattle(); });
    }
  }

  // ─── BUILD ALL MODALS ─────────────────────────────────────
  function buildModals(root) {
    root.insertAdjacentHTML('beforeend', `
      <!-- SHOP MODAL -->
      <div id="modal-shop" class="modal-backdrop">
        <div class="modal" style="width:700px;border:1px solid rgba(212,172,13,0.4)">
          <div class="modal-header" style="flex-wrap:wrap;gap:10px">
            <div class="modal-title" style="color:#D4AC0D">🏪 ANCIENT SHOP</div>
            <div class="shop-tabs">
              <button class="shop-tab" data-tab="heroes" onclick="App.setShopTab('heroes')">⚔ Heroes</button>
              <button class="shop-tab" data-tab="chests" onclick="App.setShopTab('chests')">📦 Chests</button>
            </div>
            <button class="modal-close" onclick="UI.closeModal('modal-shop')">×</button>
          </div>
          <div class="modal-currency" id="shop-currency-strip"></div>
          <div class="modal-body" id="shop-body"></div>
        </div>
      </div>

      <!-- MAIL MODAL -->
      <div id="modal-mail" class="modal-backdrop">
        <div class="modal" style="width:620px;border:1px solid rgba(247,37,133,0.3)">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="modal-title" style="color:#F72585">📬 MAILBOX</div>
              <span id="mail-badge-modal" style="padding:2px 10px;background:#F72585;border-radius:10px;font-family:var(--font-hud);font-size:12px;display:none"></span>
            </div>
            <button class="modal-close" onclick="UI.closeModal('modal-mail')">×</button>
          </div>
          <div class="modal-body" style="padding:0;display:flex;height:420px">
            <div class="mail-list" id="mail-list"></div>
            <div class="mail-content" id="mail-content"></div>
          </div>
        </div>
      </div>

      <!-- LEADERBOARD MODAL -->
      <div id="modal-ranks" class="modal-backdrop">
        <div class="modal" style="width:560px;border:1px solid rgba(212,172,13,0.3)">
          <div class="modal-header">
            <div class="modal-title" style="background:linear-gradient(135deg,#FFD700,#FF9800);-webkit-background-clip:text;-webkit-text-fill-color:transparent">🏆 LEADERBOARD</div>
            <button class="modal-close" onclick="UI.closeModal('modal-ranks')">×</button>
          </div>
          <div class="modal-body" style="padding:0" id="leaderboard-list"></div>
        </div>
      </div>

      <!-- LEVEL UP MODAL -->
      <div id="modal-levelup" class="modal-backdrop">
        <div class="modal" style="width:420px">
          <div class="modal-header">
            <div class="modal-title" id="levelup-title">LEVEL UP</div>
            <button class="modal-close" onclick="UI.closeModal('modal-levelup')">×</button>
          </div>
          <div class="modal-body" id="levelup-body"></div>
        </div>
      </div>

      <!-- MAP SELECT MODAL -->
      <div id="modal-map" class="modal-backdrop">
        <div class="modal" style="width:640px;border:1px solid rgba(76,201,240,0.3)">
          <div class="modal-header">
            <div class="modal-title" style="color:#4CC9F0">🗺 SELECT BATTLEFIELD</div>
            <button class="modal-close" onclick="UI.closeModal('modal-map')">×</button>
          </div>
          <div class="modal-body">
            <div style="font-size:11px;color:var(--muted);margin-bottom:16px;font-family:var(--font-body);letter-spacing:2px">EACH MAP CHANGES THE FIGHT</div>
            <div class="map-grid" id="map-select-grid"></div>
          </div>
        </div>
      </div>

      <!-- QUESTS MODAL -->
      <div id="modal-quests" class="modal-backdrop">
        <div class="modal" style="width:460px;border:1px solid rgba(82,183,136,0.3)">
          <div class="modal-header">
            <div class="modal-title" style="color:#52B788">📋 DAILY QUESTS</div>
            <button class="modal-close" onclick="UI.closeModal('modal-quests')">×</button>
          </div>
          <div class="modal-body" id="quests-body"></div>
        </div>
      </div>

      <!-- CLOSE backdrop on click -->
    `);

    // Close modals when clicking backdrop
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', e => {
        if (e.target === backdrop) UI.closeModal(backdrop.id);
      });
    });
  }

  // ─── BUILD BATTLE SCREEN ──────────────────────────────────
  function buildBattle(root, hero, map) {
    // Remove old battle screen if present
    const old = document.getElementById('screen-battle');
    if (old) old.remove();

    root.insertAdjacentHTML('beforeend', `
    <div id="screen-battle" class="screen active" style="background:${map.bgGradient}">

      <!-- Countdown overlay -->
      <div id="countdown-overlay" style="position:absolute;inset:0;background:${map.bgGradient};display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100">
        <div id="countdown-number" style="font-family:var(--font-title);font-weight:900;font-size:clamp(80px,15vw,160px);color:${map.accent};text-shadow:0 0 80px ${map.accent};animation:cdPulse 0.6s ease infinite"></div>
        <div style="color:#AAB;font-size:18px;margin-top:12px;font-family:var(--font-body);letter-spacing:6px;text-transform:uppercase">${map.name}</div>
        <style>@keyframes cdPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}</style>
      </div>

      <!-- HUD TOP -->
      <div class="battle-hud-top" style="border-bottom-color:${map.accent}33">
        <div class="hud-section">
          <div class="hud-hero-name" style="color:${hero.color}" id="hud-hero-name">${hero.name} <span style="color:#666;font-size:11px">Lv.${hero.level||1}</span></div>
          <div class="hud-combo" id="hud-combo" style="display:none"></div>
        </div>
        <div style="text-align:center">
          <div class="hud-timer" id="hud-timer">01:30</div>
          <div class="hud-map-name">${map.name.toUpperCase()}</div>
        </div>
        <div>
          <div class="hud-enemy-count" id="hud-enemy-count">3/3 ALIVE</div>
          <div class="hud-score-line" id="hud-score">💀 0  🎯 0</div>
        </div>
      </div>

      <!-- ARENA CANVAS -->
      <div class="battle-arena" id="battle-arena">
        <!-- Grid overlay -->
        <div class="arena-grid" style="background-image:linear-gradient(${map.gridColor} 1px,transparent 1px),linear-gradient(90deg,${map.gridColor} 1px,transparent 1px);background-size:50px 50px;pointer-events:none"></div>
        <!-- Ground -->
        <div class="arena-ground" style="background:linear-gradient(transparent,${map.accent}08)"></div>
      </div>

      <!-- HUD BOTTOM — HORIZONTAL CONTROLS -->
      <div class="battle-hud-bottom" style="border-top-color:${map.accent}33">

        <!-- LEFT: HP + Joystick -->
        <div class="controls-left">
          <div class="hp-section">
            <div class="hp-label">
              <span style="font-family:var(--font-body)">HP</span>
              <span id="hp-label-val" style="font-family:var(--font-hud);color:${hero.color}">100%</span>
            </div>
            <div class="hp-track">
              <div class="hp-fill" id="hp-fill" style="width:100%;background:linear-gradient(90deg,#388E3C,#66BB6A)"></div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="joystick-zone" id="joystick-zone">
              <div class="joystick-knob" id="joystick-knob"></div>
            </div>
            <div style="font-size:9px;color:#333;font-family:var(--font-body);line-height:1.6">
              WASD<br>or drag
            </div>
          </div>
        </div>

        <!-- CENTER: Battle Log -->
        <div class="battle-log-section">
          <div style="font-size:9px;color:#333;font-family:var(--font-hud);letter-spacing:2px;margin-bottom:3px">BATTLE LOG</div>
          <div class="battle-log" id="battle-log"></div>
        </div>

        <!-- RIGHT: Skill Buttons + Attack -->
        <div class="controls-right">
          <!-- 2×2 grid: Skill1, Skill2, Passive, Ultimate -->
          <div class="btn-grid">
            <button class="action-btn" id="btn-skill1"
              style="background:linear-gradient(135deg,${hero.color}44,${hero.color}22);border:1px solid ${hero.color}66">
              <span class="btn-icon">🗡</span>
              <span class="btn-label">SKILL 1</span>
            </button>
            <button class="action-btn" id="btn-skill2"
              style="background:linear-gradient(135deg,${hero.accent}44,${hero.accent}22);border:1px solid ${hero.accent}66">
              <span class="btn-icon">💫</span>
              <span class="btn-label">SKILL 2</span>
            </button>
            <button class="action-btn" id="btn-passive"
              style="background:linear-gradient(135deg,#7B2FBE44,#7B2FBE22);border:1px solid #7B2FBE66"
              onclick="Battle.activatePassive()">
              <span class="btn-icon">⚡</span>
              <span class="btn-label">PASSIVE</span>
            </button>
            <button class="action-btn" id="btn-ult"
              style="background:linear-gradient(135deg,#FFD70044,#FF980044);border:2px solid #FFD70066;animation:ultimateGlow 2s ease infinite">
              <span class="btn-icon">🌟</span>
              <span class="btn-label">ULTIMATE</span>
            </button>
          </div>

          <!-- BIG ATTACK button -->
          <button class="btn-attack" id="btn-attack"
            style="background:linear-gradient(135deg,${hero.color},${hero.accent});box-shadow:0 0 20px ${hero.color}55">
            <span class="atk-icon">⚡</span>
            <span class="atk-label">ATTACK</span>
          </button>
        </div>
      </div>

      <!-- RESULT OVERLAY -->
      <div class="battle-result-overlay" id="battle-result-overlay">
        <div class="result-title" id="result-title">VICTORY</div>
        <div class="result-stats">
          <div class="result-stat"><div class="result-stat-val" id="result-score">0</div><div class="result-stat-label">SCORE</div></div>
          <div class="result-stat"><div class="result-stat-val" id="result-kills">0</div><div class="result-stat-label">KILLS</div></div>
          <div class="result-stat"><div class="result-stat-val" id="result-combo">0</div><div class="result-stat-label">MAX COMBO</div></div>
          <div class="result-stat"><div class="result-stat-val" id="result-harwok">0</div><div class="result-stat-label">HARWOK</div></div>
          <div class="result-stat"><div class="result-stat-val" id="result-xp">0</div><div class="result-stat-label">XP GAINED</div></div>
        </div>
        <button class="btn-primary" id="btn-return"
          style="background:linear-gradient(135deg,${map.accent},${hero.color});box-shadow:0 0 40px ${map.accent}66">
          RETURN TO BASE
        </button>
      </div>
    </div>`);
  }

  // ─── SHOW / HIDE SCREENS ──────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
  }

  return {
    buildStart,
    buildLobby,
    buildBattle,
    updateLobby,
    showScreen,
  };
})();
