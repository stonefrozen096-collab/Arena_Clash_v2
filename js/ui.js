// ============================================================
//  ARENA CLASH — UI.JS
//  Reusable UI components: modals, shop, mail, leaderboard
// ============================================================

const UI = (() => {

  // ── NOTIFICATIONS ─────────────────────────────────────────
  let notifTimeout = null;
  function notify(msg, color = '#4CAF50') {
    let el = document.getElementById('notif');
    if (!el) {
      el = document.createElement('div');
      el.id = 'notif';
      el.className = 'notification';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.color      = color;
    el.style.background = color + '1a';
    el.style.border     = `1px solid ${color}55`;
    el.style.boxShadow  = `0 0 20px ${color}22`;
    el.style.display    = 'block';
    if (notifTimeout) clearTimeout(notifTimeout);
    notifTimeout = setTimeout(() => { el.style.display = 'none'; }, 3500);
  }

  // ── MODAL SYSTEM ──────────────────────────────────────────
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }
  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
  }

  // ── SHOP ──────────────────────────────────────────────────
  function renderShop(appState) {
    const tab = appState.shopTab || 'heroes';
    const { heroes, currency } = appState;

    // Currency strip
    const strip = document.getElementById('shop-currency-strip');
    if (strip) {
      strip.innerHTML = [
        ['💎', currency.cryan.toLocaleString(), 'Cryan', '#D4AC0D'],
        ['🪙', currency.harwok, 'Harwok', '#4CC9F0'],
        ['⭐', currency.levelPoints.toLocaleString(), 'Lv.Pts', '#CE93D8'],
      ].map(([i,v,l,c]) => `
        <div class="modal-currency-chip" style="background:${c}11;border:1px solid ${c}33">
          <span style="font-size:16px">${i}</span>
          <div>
            <div style="font-family:var(--font-hud);color:${c};font-size:14px;letter-spacing:1px">${v}</div>
            <div style="font-size:8px;color:var(--muted);text-transform:uppercase">${l}</div>
          </div>
        </div>`).join('');
    }

    // Tabs
    document.querySelectorAll('.shop-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
      t.style.background = t.dataset.tab === tab ? 'linear-gradient(135deg,#D4AC0D,#F39C12)' : 'transparent';
      t.style.color      = t.dataset.tab === tab ? '#000' : 'var(--muted)';
      t.style.border     = `1px solid ${t.dataset.tab === tab ? '#D4AC0D' : '#333'}`;
    });

    const body = document.getElementById('shop-body');
    if (!body) return;

    if (tab === 'heroes') {
      body.innerHTML = `<div class="shop-grid">${
        heroes.filter(h => h.id !== 'starter').map(h => `
          <div class="shop-card" style="border-color:${h.color}33" data-hero="${h.id}">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
              <div>
                <div class="shop-card-title" style="color:${h.color}">${h.name}</div>
                <div class="shop-card-rarity">${h.rarity} Class</div>
              </div>
              <div id="shop-hero-thumb-${h.id}"></div>
            </div>
            <div class="shop-card-desc">${h.description}</div>
            <div style="margin-bottom:6px;font-size:10px;color:#AAB;font-family:var(--font-body)">
              🎯 <b style="color:${h.color}">${h.ultimate}</b> — ${h.ultimateDesc.substring(0,60)}…
            </div>
            ${h.unlocked
              ? `<div style="color:#4CAF50;font-family:var(--font-hud);font-size:12px;letter-spacing:1px">✓ OWNED</div>`
              : `<button class="btn-buy-hero" data-hero="${h.id}" style="width:100%;padding:9px;background:${currency.cryan>=h.cost?`linear-gradient(135deg,${h.color},${h.accent})`:'#111'};border:1px solid ${currency.cryan>=h.cost?h.color+'55':'#222'};border-radius:8px;color:${currency.cryan>=h.cost?'white':'#444'};font-family:var(--font-hud);font-size:13px;cursor:${currency.cryan>=h.cost?'pointer':'not-allowed'};letter-spacing:1px">
                ${currency.cryan>=h.cost ? `💎 ${h.cost} Cryan` : `Need ${h.cost} Cryan`}
              </button>`
            }
          </div>`).join('')
      }</div>`;

      // Inject hero thumbs
      heroes.filter(h => h.id !== 'starter').forEach(h => {
        const el = document.getElementById(`shop-hero-thumb-${h.id}`);
        if (el) el.appendChild(HeroRenderer.createHeroElement(h.id, 56, false));
      });

    } else {
      body.innerHTML = `<div class="shop-grid">${
        Object.entries(CHESTS_DATA).map(([key, chest]) => `
          <div class="shop-card chest-card" style="border-color:${chest.glow}33">
            <div style="font-family:var(--font-title);font-weight:700;font-size:17px;color:${chest.glow};letter-spacing:2px;margin-bottom:4px">${chest.name}</div>
            <div class="chest-emoji">${chest.emoji}</div>
            <div class="chest-rates">
              🦸 Hero: ${chest.drops[0].chance}%<br>
              ⭐ Lv.Pts: ${chest.drops.slice(1,-1).map(d=>`${d.chance}% (×${d.amount})`).join(' / ')}<br>
              💎 Cryan: ${chest.drops[chest.drops.length-1].chance}%
            </div>
            <button class="btn-open-chest" data-chest="${key}"
              style="width:100%;padding:10px;background:${currency.harwok>=chest.cost?`linear-gradient(135deg,${chest.color},${chest.glow})`:'#111'};border:1px solid ${currency.harwok>=chest.cost?chest.glow+'55':'#222'};border-radius:8px;color:${currency.harwok>=chest.cost?'white':'#444'};font-family:var(--font-hud);font-size:14px;cursor:${currency.harwok>=chest.cost?'pointer':'not-allowed'};letter-spacing:1px">
              ${currency.harwok>=chest.cost ? `🪙 ${chest.cost} Harwok` : `Need ${chest.cost} Harwok`}
            </button>
          </div>`).join('')
      }</div>`;
    }
  }

  // ── CHEST OPEN ────────────────────────────────────────────
  let chestSpinInterval = null;
  function openChestModal(chestKey, appState, onResult) {
    const chest = CHESTS_DATA[chestKey];
    if (!chest) return;
    if (appState.currency.harwok < chest.cost) {
      notify('Not enough Harwok! Play battles to earn more.', '#F44336');
      return;
    }

    // Deduct cost
    appState.currency.harwok -= chest.cost;

    // Build modal
    let modal = document.getElementById('chest-modal-backdrop');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'chest-modal-backdrop';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal" style="width:380px;border:2px solid var(--chest-glow,#888);box-shadow:0 0 80px var(--chest-glow,#888)22">
          <div class="modal-header">
            <div class="modal-title" id="chest-modal-title" style="font-size:18px"></div>
            <button class="modal-close" id="chest-modal-close">×</button>
          </div>
          <div class="modal-body" style="text-align:center;padding:30px 40px">
            <div id="chest-open-area" class="chest-open-area"></div>
          </div>
        </div>`;
      document.body.appendChild(modal);
      document.getElementById('chest-modal-close').onclick = () => closeChestModal();
    }

    modal.style.setProperty('--chest-glow', chest.glow);
    document.getElementById('chest-modal-title').textContent = chest.name;
    document.getElementById('chest-modal-title').style.color = chest.glow;

    const area = document.getElementById('chest-open-area');
    area.innerHTML = `
      <div style="font-size:11px;color:var(--muted);letter-spacing:3px;margin-bottom:16px;font-family:var(--font-body)">COST: ${chest.cost} HARWOK</div>
      <div style="position:relative;display:inline-block;margin-bottom:20px">
        <div style="font-size:72px;filter:none" id="chest-big-emoji">${chest.emoji}</div>
        <div id="chest-particles"></div>
      </div>
      <div>
        <button id="btn-do-open" style="padding:14px 44px;background:linear-gradient(135deg,${chest.color},${chest.glow});border:none;border-radius:10px;color:white;font-size:20px;font-family:var(--font-title);font-weight:700;cursor:pointer;letter-spacing:2px;box-shadow:0 0 30px ${chest.glow}44">
          OPEN
        </button>
      </div>`;

    modal.classList.add('open');

    document.getElementById('btn-do-open').onclick = () => {
      Sound.chest();
      // Animate
      const emojiEl = document.getElementById('chest-big-emoji');
      const particlesEl = document.getElementById('chest-particles');
      emojiEl.style.filter = `drop-shadow(0 0 20px ${chest.glow})`;
      area.querySelector('button').remove();
      area.innerHTML += `<div id="chest-opening-text" style="color:${chest.glow};font-family:var(--font-title);font-size:18px;letter-spacing:4px;animation:pulse 0.8s ease infinite">OPENING...</div>`;

      // Spin particles
      let angle = 0;
      chestSpinInterval = setInterval(() => {
        angle += 12;
        if (!particlesEl) return;
        particlesEl.innerHTML = [0,60,120,180,240,300].map(a => {
          const rad = (a + angle) * Math.PI / 180;
          const px = 36 + Math.cos(rad) * 52;
          const py = 36 + Math.sin(rad) * 52;
          return `<div style="position:absolute;left:${px}px;top:${py}px;width:7px;height:7px;border-radius:50%;background:${chest.glow};opacity:0.85;transform:translate(-50%,-50%)"></div>`;
        }).join('');
      }, 30);

      setTimeout(() => {
        clearInterval(chestSpinInterval);
        // Roll result
        const hits = chest.drops.filter(d => Math.random() * 100 < d.chance);
        const result = hits.length ? hits[Math.floor(Math.random() * hits.length)] : { type: 'levelPoints', amount: 50, label: '+50 Level Points' };

        Sound.collect();
        area.innerHTML = `
          <div class="chest-result" style="border:1px solid ${chest.glow}44">
            <div class="chest-result-icon">${result.type==='hero'?'🦸':result.type==='cryan'?'💎':'⭐'}</div>
            <div class="chest-result-text" style="color:${result.type==='hero'?'#FFD700':chest.glow}">${result.label || `+${result.amount}`}</div>
            ${result.type==='hero'?'<div style="color:var(--muted);font-size:11px;margin-top:6px;font-family:var(--font-body)">A new hero joins your roster!</div>':''}
          </div>
          <button id="btn-collect-chest" style="padding:14px 44px;background:linear-gradient(135deg,#F72585,#7B2FBE);border:none;border-radius:10px;color:white;font-size:20px;font-family:var(--font-title);font-weight:700;cursor:pointer;letter-spacing:2px">
            COLLECT ✓
          </button>`;

        document.getElementById('btn-collect-chest').onclick = () => {
          closeChestModal();
          onResult(result);
        };
      }, 2200);
    };
  }

  function closeChestModal() {
    clearInterval(chestSpinInterval);
    const m = document.getElementById('chest-modal-backdrop');
    if (m) m.classList.remove('open');
  }

  // ── MAIL ──────────────────────────────────────────────────
  let selectedMailId = null;
  function renderMail(appState, onCollect) {
    const { mails } = appState;
    const unread = mails.filter(m => !m.collected).length;

    // Update badge
    const badge = document.getElementById('mail-badge');
    if (badge) { badge.textContent = unread; badge.style.display = unread ? '' : 'none'; }

    // List
    const list = document.getElementById('mail-list');
    if (!list) return;
    list.innerHTML = mails.length ? mails.map(m => `
      <div class="mail-item ${selectedMailId===m.id?'selected':''}" data-mail="${m.id}">
        <div class="mail-item-subject">
          ${!m.collected ? '<span class="mail-unread-dot"></span>' : ''}${m.subject}
        </div>
        <div class="mail-item-from">${m.from} · ${m.date}</div>
      </div>`).join('') : '<div style="padding:20px;color:var(--muted);font-size:13px;font-family:var(--font-body)">No mail yet. Play battles!</div>';

    list.querySelectorAll('.mail-item').forEach(el => {
      el.addEventListener('click', () => {
        selectedMailId = parseInt(el.dataset.mail) || el.dataset.mail;
        renderMailContent(appState, onCollect);
        renderMail(appState, onCollect);
        Sound.click();
      });
    });

    renderMailContent(appState, onCollect);
  }

  function renderMailContent(appState, onCollect) {
    const content = document.getElementById('mail-content');
    if (!content) return;
    const mail = appState.mails.find(m => m.id === selectedMailId);
    if (!mail) { content.innerHTML = '<div style="padding:40px;color:var(--muted);text-align:center;font-family:var(--font-body)">Select a message to read</div>'; return; }
    content.innerHTML = `
      <div class="mail-content-title">${mail.subject}</div>
      <div class="mail-content-from">From: ${mail.from} · ${mail.date}</div>
      <div class="mail-content-body">${mail.body}</div>
      ${mail.attachments?.length ? `
        <div style="background:rgba(255,255,255,0.02);border-radius:12px;padding:14px;margin-bottom:16px;border:1px solid #1a1a3e">
          <div style="font-family:var(--font-hud);font-size:11px;color:var(--muted);letter-spacing:3px;margin-bottom:10px">📎 ATTACHMENTS</div>
          ${mail.attachments.map(a=>`
            <div class="attachment-item">
              <span class="attachment-icon">${a.icon}</span>
              <div><div class="attachment-name">${a.name}</div><div class="attachment-desc">${a.desc}</div></div>
            </div>`).join('')}
        </div>` : ''}
      ${!mail.collected
        ? `<button id="btn-collect-mail" style="padding:12px 28px;background:linear-gradient(135deg,#F72585,#7B2FBE);border:none;border-radius:10px;color:white;font-size:15px;font-family:var(--font-hud);cursor:pointer;letter-spacing:2px">COLLECT ALL REWARDS</button>`
        : `<div style="color:#4CAF50;font-size:12px;font-family:var(--font-body);display:flex;align-items:center;gap:6px">✓ Rewards already collected</div>`
      }`;
    const collectBtn = document.getElementById('btn-collect-mail');
    if (collectBtn) {
      collectBtn.addEventListener('click', () => {
        onCollect(mail);
        Sound.collect();
        renderMail(appState, onCollect);
      });
    }
  }

  // ── LEADERBOARD ───────────────────────────────────────────
  function renderLeaderboard(playerScore, playerHero, playerWins) {
    const me    = { name: 'YOU', hero: playerHero.id, wins: playerWins, kd: playerWins > 0 ? '4.0' : '—', score: playerScore, isPlayer: true };
    const board = [...LEADERBOARD_DATA, me].sort((a,b) => b.score - a.score).map((e,i) => ({ ...e, rank: i+1 }));
    const medals = ['🥇','🥈','🥉'];
    const el = document.getElementById('leaderboard-list');
    if (!el) return;
    el.innerHTML = board.map(e => `
      <div class="lb-row ${e.isPlayer?'is-player':''}">
        <div class="lb-rank" style="color:${e.rank===1?'#FFD700':e.rank===2?'#C0C0C0':e.rank===3?'#CD7F32':'#555'}">
          ${e.rank <= 3 ? medals[e.rank-1] : e.rank}
        </div>
        <div style="flex:1;min-width:0">
          <div class="lb-name" style="color:${e.isPlayer?'#F72585':'#EEE'}">${e.name}${e.isPlayer?' ◄':''}</div>
          <div class="lb-hero" style="color:${HERO_COLORS[e.hero]||'#888'}">${e.hero.toUpperCase()} · ${e.wins} wins · K/D ${e.kd}</div>
        </div>
        <div>
          <div class="lb-score" style="color:${e.rank===1?'#FFD700':e.rank<=3?'#FFF':'#AAB'}">${e.score.toLocaleString()}</div>
          <div class="lb-score-label">SCORE</div>
        </div>
      </div>`).join('');
  }

  // ── MAP SELECT ────────────────────────────────────────────
  function renderMapSelect(selectedMap, onSelect) {
    const grid = document.getElementById('map-select-grid');
    if (!grid) return;
    grid.innerHTML = MAPS_DATA.map(m => `
      <div class="map-card ${selectedMap.id===m.id?'selected':''}" data-map="${m.id}"
        style="background:${m.bgGradient};border-color:${selectedMap.id===m.id?m.accent:m.accent+'44'}">
        <div class="map-card-name" style="color:${m.accent}">${m.name}</div>
        <div class="map-card-desc">${m.desc}</div>
        ${m.hazards.length ? `<div class="map-hazard-warn">⚠ Lava hazards active!</div>` : ''}
      </div>`).join('');
    grid.querySelectorAll('.map-card').forEach(card => {
      card.addEventListener('click', () => {
        const map = MAPS_DATA.find(m => m.id === card.dataset.map);
        if (map) { onSelect(map); Sound.click(); closeModal('modal-map'); }
      });
    });
  }

  // ── LEVEL UP ──────────────────────────────────────────────
  function renderLevelUp(hero, levelPoints, onLevelUp) {
    const cost = (hero.level || 1) * 200;
    const el   = document.getElementById('levelup-body');
    if (!el) return;
    el.innerHTML = `
      <div style="text-align:center;padding:0 10px">
        <div style="font-family:var(--font-title);font-weight:900;font-size:22px;color:${hero.color};letter-spacing:3px;margin-bottom:4px">LEVEL UP</div>
        <div style="font-size:11px;color:var(--muted);letter-spacing:3px;margin-bottom:16px;font-family:var(--font-body)">ENHANCE ${hero.name.toUpperCase()}</div>
        <div id="levelup-hero-thumb" style="margin:0 auto 14px;display:flex;justify-content:center"></div>
        <div class="level-compare">
          <div class="level-box" style="background:${hero.color}22;border:1px solid ${hero.color}44">
            <div class="level-box-num" style="color:${hero.color}">Lv.${hero.level||1}</div>
            <div class="level-box-label">CURRENT</div>
          </div>
          <div class="level-arrow">→</div>
          <div class="level-box" style="background:rgba(76,175,80,0.1);border:1px solid rgba(76,175,80,0.3)">
            <div class="level-box-num" style="color:#4CAF50">Lv.${(hero.level||1)+1}</div>
            <div class="level-box-label">NEXT</div>
          </div>
        </div>
        <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:12px 16px;margin-bottom:16px;border:1px solid #1a1a3e">
          <div style="font-family:var(--font-hud);font-size:10px;color:var(--muted);letter-spacing:3px;margin-bottom:10px">ALL STATS INCREASE</div>
          <div class="stat-increase-grid">
            ${['HP','ATK','SPD','DEF'].map(s=>`<div class="stat-inc"><div class="stat-inc-val">+3</div><div class="stat-inc-label">${s}</div></div>`).join('')}
          </div>
        </div>
        <div style="font-size:13px;color:#AAB;margin-bottom:18px;font-family:var(--font-body)">
          Cost: <span style="color:#CE93D8;font-family:var(--font-title);font-weight:700;font-size:17px">${cost} ⭐</span>
          &nbsp;|&nbsp; Have: <span style="color:${levelPoints>=cost?'#CE93D8':'#F44336'}">${levelPoints.toLocaleString()}</span>
        </div>
        <div style="display:flex;gap:10px">
          <button onclick="UI.closeModal('modal-levelup')" class="btn-secondary" style="flex:1">CANCEL</button>
          <button id="btn-do-levelup" ${levelPoints<cost?'disabled':''} style="flex:2;padding:12px;background:${levelPoints>=cost?`linear-gradient(135deg,${hero.color},${hero.accent})`:'#111'};border:none;border-radius:10px;color:${levelPoints>=cost?'white':'#444'};font-family:var(--font-title);font-weight:700;font-size:14px;cursor:${levelPoints>=cost?'pointer':'not-allowed'};letter-spacing:1px">
            ${levelPoints >= cost ? '⬆ LEVEL UP!' : 'Not Enough Points'}
          </button>
        </div>
      </div>`;

    // Hero thumb
    const thumbEl = document.getElementById('levelup-hero-thumb');
    if (thumbEl) thumbEl.appendChild(HeroRenderer.createHeroElement(hero.id, 110, true));

    const doBtn = document.getElementById('btn-do-levelup');
    if (doBtn) doBtn.addEventListener('click', () => { if (levelPoints >= cost) { onLevelUp(hero, cost); Sound.levelup(); } });
  }

  // ── DAILY QUESTS ──────────────────────────────────────────
  function renderQuests(questState) {
    const el = document.getElementById('quests-body');
    if (!el) return;
    el.innerHTML = DAILY_QUESTS.map(q => {
      const prog = Math.min(q.target, questState[q.trackKey] || 0);
      const done = prog >= q.target;
      const rew  = Object.entries(q.reward).map(([k,v]) => `+${v} ${k}`).join(', ');
      return `
        <div style="background:rgba(255,255,255,0.02);border:1px solid ${done?'#4CAF5044':'var(--border)'};border-radius:12px;padding:14px 16px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <div style="font-family:var(--font-body);font-size:13px;color:${done?'#4CAF50':'var(--text)'}">${done?'✓ ':''} ${q.desc}</div>
            <div style="font-size:10px;color:#4CC9F0;font-family:var(--font-body)">${rew}</div>
          </div>
          <div style="height:5px;background:#111;border-radius:3px;overflow:hidden">
            <div style="width:${prog/q.target*100}%;height:100%;background:${done?'#4CAF50':'#4CC9F0'};border-radius:3px"></div>
          </div>
          <div style="font-size:9px;color:var(--muted);margin-top:3px;font-family:var(--font-body)">${prog} / ${q.target}</div>
        </div>`;
    }).join('');
  }

  return {
    notify,
    openModal, closeModal, closeAllModals,
    renderShop,
    openChestModal, closeChestModal,
    renderMail,
    renderLeaderboard,
    renderMapSelect,
    renderLevelUp,
    renderQuests,
  };
})();
