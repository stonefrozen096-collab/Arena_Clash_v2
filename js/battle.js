// ============================================================
//  ARENA CLASH — BATTLE.JS
//  Full battle engine: game loop, joystick, combat, skills
// ============================================================

const Battle = (() => {

  // ── STATE ─────────────────────────────────────────────────
  let state = {};
  let canvas, ctx;
  let animFrame;
  let lastTime = 0;
  let onEndCallback = null;

  // ── INIT ──────────────────────────────────────────────────
  function init(hero, map, onEnd) {
    onEndCallback = onEnd;

    state = {
      hero:       deepClone(hero),
      map:        map,
      phase:      'countdown',   // countdown | battle | won | lost
      countdown:  3,
      timer:      90,
      playerHP:   100,
      playerMaxHP:100,
      playerPos:  { x: 120, y: 200 },
      playerVel:  { x: 0, y: 0 },
      joystick:   { active: false, dx: 0, dy: 0 },
      enemies: [
        { id:0, name:'Blade', x:520, y:140, hp:100, maxHp:100, stun:0, aiTimer:0 },
        { id:1, name:'Vex',   x:565, y:210, hp:100, maxHp:100, stun:0, aiTimer:0 },
        { id:2, name:'Kira',  x:520, y:300, hp:100, maxHp:100, stun:0, aiTimer:0 },
      ],
      projectiles: [],
      effects:     [],
      log:         [],
      score:       0,
      kills:       0,
      combo:       0,
      maxCombo:    0,
      comboTimer:  0,
      hitCount:    0,
      // Cooldowns (seconds)
      attackCD:    0,
      skill1CD:    0,
      skill2CD:    0,
      ultCD:       0,
      passiveCD:   0,
      passive:     false,
      // Status effects on player
      playerInvincible: false,
      playerRaging:     false,
      ultActive:        false,
      // Daily quest tracking
      sessionDmg:  0,
      xpGained:    0,
    };

    setupCanvas();
    setupJoystick();
    setupButtons();
    startCountdown();
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ── CANVAS SETUP ──────────────────────────────────────────
  function setupCanvas() {
    const arenaEl = document.getElementById('battle-arena');
    arenaEl.innerHTML = '';

    canvas = document.createElement('canvas');
    canvas.id = 'battle-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
    arenaEl.appendChild(canvas);

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    ctx = canvas.getContext('2d');
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  // ── JOYSTICK ──────────────────────────────────────────────
  function setupJoystick() {
    const zone  = document.getElementById('joystick-zone');
    const knob  = document.getElementById('joystick-knob');
    if (!zone || !knob) return;

    let originX, originY;
    const RADIUS = 38;

    function onStart(e) {
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      const rect  = zone.getBoundingClientRect();
      originX = rect.left + rect.width  / 2;
      originY = rect.top  + rect.height / 2;
      state.joystick.active = true;
      onMove(e);
    }

    function onMove(e) {
      if (!state.joystick.active) return;
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      let dx = touch.clientX - originX;
      let dy = touch.clientY - originY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > RADIUS) {
        dx = dx / dist * RADIUS;
        dy = dy / dist * RADIUS;
      }
      state.joystick.dx = dx / RADIUS;
      state.joystick.dy = dy / RADIUS;
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }

    function onEnd(e) {
      state.joystick.active = false;
      state.joystick.dx = 0;
      state.joystick.dy = 0;
      knob.style.transform = 'translate(-50%, -50%)';
    }

    zone.addEventListener('touchstart',  onStart, { passive: false });
    zone.addEventListener('touchmove',   onMove,  { passive: false });
    zone.addEventListener('touchend',    onEnd);
    zone.addEventListener('mousedown',   onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onEnd);

    // Keyboard fallback (WASD / arrows)
    const keys = {};
    window.addEventListener('keydown', e => {
      keys[e.key] = true;
      updateKeyJoystick();
    });
    window.addEventListener('keyup', e => {
      keys[e.key] = false;
      updateKeyJoystick();
    });

    function updateKeyJoystick() {
      let dx = 0, dy = 0;
      if (keys['ArrowLeft']  || keys['a'] || keys['A']) dx -= 1;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
      if (keys['ArrowUp']    || keys['w'] || keys['W']) dy -= 1;
      if (keys['ArrowDown']  || keys['s'] || keys['S']) dy += 1;
      state.joystick.dx = dx;
      state.joystick.dy = dy;
      state.joystick.active = (dx !== 0 || dy !== 0);
    }
  }

  // ── BUTTONS ───────────────────────────────────────────────
  function setupButtons() {
    const ids = ['btn-attack','btn-skill1','btn-skill2','btn-ult'];
    ids.forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', e => { e.preventDefault(); handleAction(id); });
      btn.addEventListener('mousedown',  e => { e.preventDefault(); handleAction(id); });
    });
    // Keyboard shortcuts
    window.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'j') handleAction('btn-attack');
      if (e.key === 'q' || e.key === 'Q') handleAction('btn-skill1');
      if (e.key === 'e' || e.key === 'E') handleAction('btn-skill2');
      if (e.key === 'r' || e.key === 'R') handleAction('btn-ult');
    });
  }

  function handleAction(id) {
    if (state.phase !== 'battle') return;
    switch (id) {
      case 'btn-attack': doAttack(); break;
      case 'btn-skill1': doSkill1(); break;
      case 'btn-skill2': doSkill2(); break;
      case 'btn-ult':    doUltimate(); break;
    }
  }

  // ── COMBAT ACTIONS ────────────────────────────────────────
  function doAttack() {
    if (state.attackCD > 0) return;
    const alive = state.enemies.filter(e => e.hp > 0);
    if (!alive.length) return;

    Sound.shoot();
    state.hitCount++;
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.comboTimer = 3;
    state.attackCD = 0.6;

    const target = alive[Math.floor(Math.random() * alive.length)];
    const atkPow = state.hero.stats.atk + getStatBonus(state.hero.level || 1);
    let dmg  = Math.round((10 + Math.random() * 10) * (atkPow / 90));
    let isCrit = false;

    // Hero passive on attack
    dmg = applyPassiveOnAttack(dmg, target, isCrit);
    if (dmg.crit) { isCrit = true; dmg = dmg.dmg; }
    else dmg = dmg.dmg;

    // Combo bonus
    if (state.combo >= 5) dmg = Math.round(dmg * 1.1);

    fireProjectile(target, dmg, isCrit, false, '⚡');
  }

  function doSkill1() {
    if (state.skill1CD > 0) return;
    const alive = state.enemies.filter(e => e.hp > 0);
    if (!alive.length) return;

    Sound.skill();
    state.skill1CD = state.hero.skill1_cooldown || 10;
    const atkPow   = state.hero.stats.atk + getStatBonus(state.hero.level || 1);

    addLog(`⚡ ${state.hero.skill1}!`, state.hero.color);

    switch (state.hero.id) {
      case 'gunman':
        // 3 rapid shots at nearest
        alive.slice(0,1).forEach(t => {
          for (let i=0; i<3; i++) {
            setTimeout(() => fireProjectile(t, Math.round(atkPow*0.8), false, true, '🔥'), i*120);
          }
        });
        break;
      case 'archer':
        // Eagle eye: mark + heavy shot
        state.passive = true;
        const marked = alive[0];
        marked._marked = true;
        fireProjectile(marked, Math.round(atkPow*1.5), true, true, '🎯');
        setTimeout(() => { state.passive = false; }, 5000);
        break;
      case 'ninja':
        // Shadow step: teleport + strike
        const weakest = alive.reduce((a,b) => a.hp < b.hp ? a : b);
        state.playerPos = { x: weakest.x - 60, y: weakest.y };
        fireProjectile(weakest, Math.round(atkPow*1.2), true, true, '🥷');
        Sound.dash();
        break;
      case 'spearman':
        // Piercing lance: hits all in line
        alive.forEach(t => fireProjectile(t, Math.round(atkPow*1.1), false, true, '🏹'));
        break;
      case 'axeman':
        // Berserker rage: boost + lifesteal for 4s
        state.playerRaging = true;
        addLog('🪓 BERSERKER RAGE — 4s Enrage!', '#F72585');
        setTimeout(() => { state.playerRaging = false; }, 4000);
        fireProjectile(alive[0], Math.round(atkPow*1.3), false, true, '🪓');
        break;
      case 'starter':
        // Quick shot — instant no wind-up
        fireProjectile(alive[0], Math.round(atkPow*0.9), false, true, '💥');
        state.attackCD = 0;
        break;
    }
  }

  function doSkill2() {
    if (state.skill2CD > 0) return;
    const alive = state.enemies.filter(e => e.hp > 0);
    if (!alive.length) return;

    Sound.skill();
    state.skill2CD = state.hero.skill2_cooldown || 12;
    const atkPow   = state.hero.stats.atk + getStatBonus(state.hero.level || 1);

    addLog(`💫 ${state.hero.skill2}!`, state.hero.color);

    switch (state.hero.id) {
      case 'gunman':
        // Rapid reload: 2 bonus shots
        alive.slice(0,2).forEach((t,i) => {
          setTimeout(() => fireProjectile(t, Math.round(atkPow*1.5), false, true, '🔫'), i*150);
        });
        break;
      case 'archer':
        // Rain of arrows: hits all enemies
        alive.forEach(t => {
          setTimeout(() => fireProjectile(t, Math.round(atkPow*0.7), false, true, '🏹'), Math.random()*300);
        });
        break;
      case 'ninja':
        // Kunai storm: 5 kunai, next 5th still crits
        for (let i=0; i<5; i++) {
          const t = alive[i % alive.length];
          const isCrit = (state.hitCount + i) % 5 === 4;
          setTimeout(() => fireProjectile(t, Math.round(atkPow * (isCrit?2.5:0.8)), isCrit, true, '🗡'), i*100);
        }
        break;
      case 'spearman':
        // Shield slam: stun first enemy
        const first = alive[0];
        first.stun = Math.max(first.stun, 3);
        fireProjectile(first, Math.round(atkPow*0.8), false, true, '🛡');
        Sound.stun();
        addLog('🛡 SHIELD SLAM — Target Stunned!', '#4CC9F0');
        break;
      case 'axeman':
        // Cleave: hits all + heal
        let totalDmg = 0;
        alive.forEach(t => {
          const d = Math.round(atkPow*1.3);
          totalDmg += d;
          fireProjectile(t, d, false, true, '⚔');
        });
        const healAmt = Math.round(totalDmg * 0.2);
        state.playerHP = Math.min(state.playerMaxHP, state.playerHP + healAmt);
        Sound.heal();
        addEffect(state.playerPos.x, state.playerPos.y - 20, `+${healAmt}HP`, '#F72585');
        break;
      case 'starter':
        // Dodge roll: invincible 0.5s
        state.playerInvincible = true;
        state.attackCD = 0;
        Sound.dash();
        addLog('🔄 DODGE ROLL — Invincible!', '#ADB5BD');
        setTimeout(() => { state.playerInvincible = false; }, 500);
        break;
    }
  }

  function doUltimate() {
    if (state.ultCD > 0) return;
    const alive = state.enemies.filter(e => e.hp > 0);
    if (!alive.length) return;

    Sound.ultimate();
    state.ultCD    = state.hero.ult_cooldown || 35;
    state.ultActive = true;
    const atkPow   = state.hero.stats.atk + getStatBonus(state.hero.level || 1);

    addLog(`🌟 ULTIMATE — ${state.hero.ultimate}!`, '#FFD700');
    addEffect(state.playerPos.x, state.playerPos.y - 40, `★ ${state.hero.ultimate.toUpperCase()} ★`, '#FFD700', true);

    switch (state.hero.id) {
      case 'gunman':
        // Bullet Storm: 12 bullets spread
        for (let i=0; i<12; i++) {
          const t = alive[i % alive.length];
          setTimeout(() => fireProjectile(t, Math.round(atkPow*0.6), false, true, '💥'), i*80);
        }
        break;
      case 'archer':
        // Storm Volley: 8 homing arrows
        for (let i=0; i<8; i++) {
          const t = alive[i % alive.length];
          setTimeout(() => fireProjectile(t, Math.round(atkPow*0.8), true, true, '🏹'), i*100);
        }
        break;
      case 'ninja':
        // Death Blossom: teleport to each, massive crit
        alive.forEach((t, i) => {
          setTimeout(() => {
            state.playerPos = { x: t.x - 50, y: t.y };
            fireProjectile(t, Math.round(atkPow*2.0), true, true, '☠');
          }, i*250);
        });
        // Untargetable during
        state.playerInvincible = true;
        setTimeout(() => { state.playerInvincible = false; }, alive.length*250 + 500);
        break;
      case 'spearman':
        // Vortex Strike: all enemies hit + stun
        alive.forEach(t => {
          t.stun = 2;
          fireProjectile(t, Math.round(atkPow*1.5), false, true, '🌀');
        });
        Sound.stun();
        break;
      case 'axeman':
        // Blood Frenzy: 5s frenzy
        state.playerRaging = true;
        addLog('🩸 BLOOD FRENZY — 5s Triple Speed!', '#F72585');
        for (let i=0; i<6; i++) {
          const t = alive[i % alive.length];
          setTimeout(() => {
            const heal = Math.round(atkPow * 0.15);
            fireProjectile(t, Math.round(atkPow*0.9), false, true, '🩸');
            state.playerHP = Math.min(state.playerMaxHP, state.playerHP + heal);
            Sound.heal();
          }, i*200);
        }
        setTimeout(() => { state.playerRaging = false; }, 5000);
        break;
      case 'starter':
        // Last Stand: charge + big blast
        addLog('⚡ LAST STAND — Channeling!', '#ADB5BD');
        setTimeout(() => {
          alive.forEach(t => fireProjectile(t, Math.round(atkPow*1.8), false, true, '💥'));
          Sound.ultimate();
        }, 2000);
        break;
    }

    setTimeout(() => { state.ultActive = false; }, 3000);
  }

  // ── PASSIVE HELPERS ───────────────────────────────────────
  function activatePassive() {
    if (state.passiveCD > 0 || state.phase !== 'battle') return;

    Sound.passive();
    switch (state.hero.id) {
      case 'ninja':
        state.passive = true;
        state.passiveCD = 25;
        addLog('🥷 I AM INVISIBLE — 5s vanish!', '#9B5DE5');
        setTimeout(() => { state.passive = false; }, 5000);
        break;
      case 'archer':
        state.passive = true;
        state.passiveCD = 8;
        addLog('🏹 Archer\'s Will — Next shot marked!', '#52B788');
        break;
      case 'spearman':
        state.passiveCD = 15;
        addLog('⚡ Light as Feather — Speed surge!', '#4CC9F0');
        break;
      case 'axeman':
        state.passiveCD = 20;
        addLog('🪓 Blood Draw — Lifesteal mode!', '#F72585');
        break;
      case 'gunman':
        state.passiveCD = 12;
        addLog('🔫 Adrenaline Rush — Speed mode!', '#F4A261');
        break;
    }
  }

  function applyPassiveOnAttack(dmg, target, wasCrit) {
    let crit = wasCrit;
    switch (state.hero.id) {
      case 'ninja':
        if (state.hitCount % 5 === 4) {
          dmg = Math.round(dmg * 2.5);
          crit = true;
          Sound.crit();
          addLog('⚡ 5th Kunai — CRITICAL ×2.5!', '#CE93D8');
        }
        break;
      case 'archer':
        if (state.passive) {
          dmg = Math.round(dmg * 1.8);
          crit = true;
          addLog('🎯 Archer\'s Will — 100% Hit!', '#52B788');
          state.passive = false;
        }
        break;
      case 'gunman': {
        const dist = Math.hypot(target.x - state.playerPos.x, target.y - state.playerPos.y);
        if (dist < 200) {
          dmg = Math.round(dmg * 1.4);
          addLog('🔥 Adrenaline Rush!', '#F4A261');
        }
        break;
      }
      case 'spearman':
        if (state.hitCount % 5 === 4) {
          target.stun = Math.max(target.stun, 2);
          addLog('💥 5th Hit — STUN!', '#4CC9F0');
          Sound.stun();
        }
        break;
      case 'axeman':
        if (state.playerHP < 80) {
          const heal = Math.max(3, Math.round((80 - state.playerHP) * 0.35));
          state.playerHP = Math.min(state.playerMaxHP, state.playerHP + heal);
          Sound.heal();
          addEffect(state.playerPos.x, state.playerPos.y - 15, `+${heal}HP`, '#F72585');
        }
        break;
    }
    return { dmg, crit };
  }

  // ── PROJECTILE / EFFECT HELPERS ───────────────────────────
  function fireProjectile(target, dmg, isCrit, isSkill, icon) {
    const id = Date.now() + Math.random();
    state.projectiles.push({
      id,
      x:  state.playerPos.x + 20,
      y:  state.playerPos.y,
      tx: target.x,
      ty: target.y,
      tid: target.id,
      progress: 0,
      dmg,
      isCrit,
      isSkill,
      icon: icon || '⚡',
    });
  }

  function addEffect(x, y, text, color, big = false) {
    state.effects.push({ id: Date.now() + Math.random(), x, y, text, color, big, age: 0 });
  }

  function addLog(msg, color = '#AAB') {
    state.log.unshift({ msg, color, id: Date.now() + Math.random() });
    if (state.log.length > 20) state.log.length = 20;
    // Update DOM log
    const logEl = document.getElementById('battle-log');
    if (logEl) {
      logEl.innerHTML = state.log
        .slice(0, 14)
        .map(l => `<div class="log-line" style="color:${l.color}">${l.msg}</div>`)
        .join('');
    }
  }

  // ── GAME LOOP ─────────────────────────────────────────────
  function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // seconds, capped
    lastTime = timestamp;

    if (state.phase === 'battle') {
      update(dt);
    }
    render();
    updateHUD();

    animFrame = requestAnimationFrame(gameLoop);
  }

  function update(dt) {
    // ── Timers ──
    state.timer    -= dt;
    state.attackCD  = Math.max(0, state.attackCD  - dt);
    state.skill1CD  = Math.max(0, state.skill1CD  - dt);
    state.skill2CD  = Math.max(0, state.skill2CD  - dt);
    state.ultCD     = Math.max(0, state.ultCD     - dt);
    state.passiveCD = Math.max(0, state.passiveCD - dt);
    state.comboTimer -= dt;
    if (state.comboTimer <= 0 && state.combo > 0) state.combo = 0;

    if (state.timer <= 0) {
      endBattle(state.playerHP > 0);
      return;
    }

    // ── Player movement ──
    const spd = (state.hero.stats.spd + getStatBonus(state.hero.level || 1)) * 1.8;
    const speedMult = (state.playerHP < 30 && state.hero.id === 'spearman') ? 1.8 : 1;
    state.playerPos.x += state.joystick.dx * spd * speedMult * dt;
    state.playerPos.y += state.joystick.dy * spd * speedMult * dt;

    // Clamp to arena
    const CW = canvas ? canvas.width : 700;
    const CH = canvas ? canvas.height : 360;
    state.playerPos.x = Math.max(30, Math.min(CW - 80, state.playerPos.x));
    state.playerPos.y = Math.max(30, Math.min(CH - 60, state.playerPos.y));

    // ── Projectile movement ──
    state.projectiles = state.projectiles.filter(p => {
      p.progress += dt * 2.5;
      if (p.progress >= 1) {
        applyHit(p);
        return false;
      }
      return true;
    });

    // ── Effects aging ──
    state.effects = state.effects.filter(e => {
      e.age += dt;
      return e.age < 1.4;
    });

    // ── Enemy AI ──
    state.enemies.forEach(enemy => {
      if (enemy.hp <= 0) return;
      if (enemy.stun > 0) { enemy.stun -= dt; return; }

      enemy.aiTimer -= dt;
      if (enemy.aiTimer <= 0) {
        enemy.aiTimer = 1.8 + Math.random() * 0.8;
        enemyAttack(enemy);
      }

      // Enemy moves toward player
      const dx = state.playerPos.x - enemy.x;
      const dy = state.playerPos.y - enemy.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > 120) {
        enemy.x += (dx / dist) * 40 * dt;
        enemy.y += (dy / dist) * 40 * dt;
      }
    });

    // ── Hazard damage ──
    state.map.hazards.forEach(h => {
      const dx = state.playerPos.x - h.x;
      const dy = state.playerPos.y - h.y;
      if (Math.sqrt(dx*dx + dy*dy) < h.r + 15) {
        state.playerHP -= h.dmg * dt;
        addEffect(state.playerPos.x, state.playerPos.y - 10, '-LAVA!', '#FF6B35');
      }
    });

    // ── Win/lose check ──
    if (state.enemies.every(e => e.hp <= 0)) endBattle(true);
    if (state.playerHP <= 0)                  endBattle(false);
  }

  function applyHit(p) {
    const enemy = state.enemies.find(e => e.id === p.tid);
    if (!enemy || enemy.hp <= 0) return;

    enemy.hp = Math.max(0, enemy.hp - p.dmg);
    state.score += p.dmg;
    state.sessionDmg += p.dmg;
    Sound.hit();

    addEffect(
      enemy.x + (Math.random()-0.5)*20,
      enemy.y - 20,
      p.isCrit ? `💥CRIT -${p.dmg}` : `-${p.dmg}`,
      p.isCrit ? '#FFD700' : '#FF8A80',
      p.isCrit
    );

    if (enemy.hp <= 0) {
      state.kills++;
      Sound.kill();
      addLog(`💀 ${enemy.name} eliminated!`, '#FFD700');
      addEffect(enemy.x, enemy.y - 30, 'ELIMINATED!', '#FFD700', true);
    }
  }

  function enemyAttack(enemy) {
    if (state.playerInvincible) return;
    let dmg = Math.round(6 + Math.random() * 8);
    if (state.hero.id === 'spearman' && state.playerHP < 30) dmg = Math.round(dmg * 0.5);

    state.playerHP = Math.max(0, state.playerHP - dmg);
    addEffect(state.playerPos.x - 10, state.playerPos.y, `-${dmg}`, '#FF4444');

    // Axeman Blood Draw
    if (state.hero.id === 'axeman' && state.playerHP < 80) {
      const heal = Math.max(3, Math.round((80 - state.playerHP) * 0.3));
      state.playerHP = Math.min(state.playerMaxHP, state.playerHP + heal);
      Sound.heal();
      addEffect(state.playerPos.x, state.playerPos.y - 20, `+${heal}HP`, '#F72585');
    }

    // Shake screen
    if (canvas) {
      canvas.style.animation = 'none';
      void canvas.offsetWidth;
      canvas.style.animation = 'screenShake 0.3s ease';
    }
  }

  // ── RENDER ────────────────────────────────────────────────
  function render() {
    if (!ctx || !canvas) return;
    const W = canvas.width, H = canvas.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Ground line
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H - 50); ctx.lineTo(W, H - 50);
    ctx.stroke();

    // Hazards
    state.map.hazards.forEach(h => {
      const pulse = 0.6 + Math.sin(Date.now() / 400) * 0.3;
      const grd = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
      grd.addColorStop(0, `rgba(255,107,53,${pulse})`);
      grd.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255,107,53,${pulse*0.8})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      // Label
      ctx.fillStyle = '#FF6B35';
      ctx.font = 'bold 9px Rajdhani';
      ctx.textAlign = 'center';
      ctx.fillText('⚠ LAVA', h.x, h.y + 4);
    });

    // Player shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(state.playerPos.x + 20, state.playerPos.y + 10, 24, 7, 0, 0, Math.PI*2);
    ctx.fill();

    // Player glow
    const heroColor = state.hero.color || '#FFF';
    const grd = ctx.createRadialGradient(
      state.playerPos.x + 20, state.playerPos.y,  0,
      state.playerPos.x + 20, state.playerPos.y, 40
    );
    grd.addColorStop(0, `${heroColor}33`);
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(state.playerPos.x - 20, state.playerPos.y - 40, 80, 80);

    // Ult aura
    if (state.ultActive) {
      ctx.strokeStyle = heroColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + Math.sin(Date.now()/100)*0.3;
      ctx.beginPath();
      ctx.arc(state.playerPos.x + 20, state.playerPos.y, 50 + Math.sin(Date.now()/200)*10, 0, Math.PI*2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Player SVG hero
    if (!state._playerImgCache || state._playerImgCacheHero !== state.hero.id) {
      state._playerFrame = 0;
      state._playerImgCacheHero = state.hero.id;
    }
    state._playerFrame = ((state._playerFrame || 0) + 1) % 120;
    drawHeroOnCanvas(ctx, state.hero.id, state.playerPos.x - 15, state.playerPos.y - 80, 70, state._playerFrame, state.passive && state.hero.id === 'ninja' ? 0.25 : 1);

    // Player HP bar
    drawHPBar(ctx, state.playerPos.x - 5, state.playerPos.y - 90, 60, state.playerHP, state.playerMaxHP, heroColor);

    // Enemies
    state.enemies.forEach(e => {
      if (e.hp <= 0) return;
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath();
      ctx.ellipse(e.x + 20, e.y + 10, 22, 6, 0, 0, Math.PI*2);
      ctx.fill();
      // Stun ring
      if (e.stun > 0) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.setLineDash([4,4]);
        ctx.beginPath();
        ctx.arc(e.x + 20, e.y, 38, 0, Math.PI*2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#FFD700';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('💫', e.x + 20, e.y - 50);
      }
      // Enemy hero (starter SVG for all enemies currently)
      if (!e._frame) e._frame = Math.random() * 60;
      e._frame = (e._frame + 1) % 120;
      drawHeroOnCanvas(ctx, 'starter', e.x - 10, e.y - 80, 65, e._frame, 1, true);
      // HP bar
      drawHPBar(ctx, e.x, e.y - 88, 55, e.hp, e.maxHp, '#F44336');
      // Name
      ctx.fillStyle = e.stun > 0 ? '#FFD700' : '#F44336';
      ctx.font = 'bold 9px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(e.stun > 0 ? `STUN ${e.stun.toFixed(1)}s` : e.name, e.x + 20, e.y - 92);
    });

    // Projectiles
    state.projectiles.forEach(p => {
      const x = p.x + (p.tx - p.x) * p.progress;
      const y = p.y + (p.ty - p.y) * p.progress - Math.sin(p.progress * Math.PI) * 45;
      const grd2 = ctx.createRadialGradient(x, y, 0, x, y, 8);
      grd2.addColorStop(0, state.hero.color || '#FFF');
      grd2.addColorStop(1, 'transparent');
      ctx.fillStyle = grd2;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI*2);
      ctx.fill();
      // Trail
      ctx.fillStyle = state.hero.color || '#FFF';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(x - (p.tx-p.x)*0.04, y - (p.ty-p.y)*0.04, 4, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Float effects
    state.effects.forEach(ef => {
      const alpha = Math.max(0, 1 - ef.age / 1.2);
      const offsetY = ef.age * 50;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ef.color || '#FFF';
      ctx.font = `${ef.big ? 'bold 20px' : 'bold 14px'} Bebas Neue, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(ef.text, ef.x, ef.y - offsetY);
      ctx.globalAlpha = 1;
    });
  }

  // Helper: draw hero SVG on canvas using Image
  const _imgCache = {};
  function drawHeroOnCanvas(ctx, heroId, x, y, size, frame, alpha=1, flip=false) {
    const svgStr = HeroRenderer.renderHeroSVG(heroId, frame, size/180, flip);
    const key    = heroId + '|' + frame + '|' + size + '|' + flip;
    if (!_imgCache[key]) {
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      const img  = new Image();
      img.src = url;
      _imgCache[key] = img;
    }
    const img = _imgCache[key];
    if (img.complete && img.naturalWidth > 0) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, x, y, size, size * 1.1);
      ctx.globalAlpha = 1;
    }
  }

  function drawHPBar(ctx, x, y, w, hp, maxHp, color) {
    const pct = Math.max(0, hp / maxHp);
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, 5, 2) : ctx.rect(x, y, w, 5);
    ctx.fill();
    ctx.fillStyle = pct > 0.5 ? '#4CAF50' : pct > 0.25 ? '#FF9800' : '#F44336';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w * pct, 5, 2) : ctx.rect(x, y, w * pct, 5);
    ctx.fill();
  }

  // ── HUD UPDATE ────────────────────────────────────────────
  function updateHUD() {
    // Timer
    const timerEl = document.getElementById('hud-timer');
    if (timerEl) {
      const t = Math.max(0, Math.ceil(state.timer));
      timerEl.textContent = `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
      timerEl.className  = 'hud-timer' + (t < 20 ? ' warning' : t < 40 ? ' caution' : '');
    }

    // HP
    const hpFill  = document.getElementById('hp-fill');
    const hpLabel = document.getElementById('hp-label-val');
    if (hpFill) {
      const pct = Math.max(0, state.playerHP / state.playerMaxHP * 100);
      hpFill.style.width = pct + '%';
      hpFill.style.background = pct > 50 ? 'linear-gradient(90deg,#388E3C,#66BB6A)' : pct > 25 ? 'linear-gradient(90deg,#E65100,#FF9800)' : 'linear-gradient(90deg,#B71C1C,#F44336)';
    }
    if (hpLabel) hpLabel.textContent = Math.max(0, Math.round(state.playerHP)) + '%';

    // Enemies alive
    const enemyCount = document.getElementById('hud-enemy-count');
    if (enemyCount) enemyCount.textContent = `${state.enemies.filter(e=>e.hp>0).length}/3 ALIVE`;

    // Score
    const scoreEl = document.getElementById('hud-score');
    if (scoreEl) scoreEl.textContent = `💀 ${state.kills}  🎯 ${state.score.toLocaleString()}`;

    // Combo
    const comboEl = document.getElementById('hud-combo');
    if (comboEl) {
      comboEl.textContent = state.combo > 1 ? `🔥 COMBO ×${state.combo}` : '';
      comboEl.style.display = state.combo > 1 ? '' : 'none';
    }

    // Cooldown overlays
    updateButtonCD('btn-attack', state.attackCD);
    updateButtonCD('btn-skill1', state.skill1CD);
    updateButtonCD('btn-skill2', state.skill2CD);
    updateButtonCD('btn-ult',    state.ultCD);
  }

  function updateButtonCD(id, cd) {
    const btn = document.getElementById(id);
    if (!btn) return;
    let overlay = btn.querySelector('.cd-overlay');
    if (cd > 0) {
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'cd-overlay';
        btn.appendChild(overlay);
      }
      overlay.textContent = cd >= 1 ? Math.ceil(cd) + 's' : '';
      btn.classList.add('disabled');
    } else {
      if (overlay) overlay.remove();
      btn.classList.remove('disabled');
    }
  }

  // ── COUNTDOWN ─────────────────────────────────────────────
  function startCountdown() {
    const overlay = document.getElementById('countdown-overlay');
    if (overlay) overlay.style.display = 'flex';

    let count = 3;
    const tick = () => {
      const el = document.getElementById('countdown-number');
      if (el) el.textContent = count;
      Sound.countdown();
      if (count <= 0) {
        Sound.countdownGo();
        if (overlay) overlay.style.display = 'none';
        state.phase = 'battle';
        lastTime = performance.now();
        animFrame = requestAnimationFrame(gameLoop);
        return;
      }
      count--;
      setTimeout(tick, 1000);
    };
    tick();
  }

  // ── END ───────────────────────────────────────────────────
  function endBattle(won) {
    if (state.phase === 'won' || state.phase === 'lost') return;
    state.phase = won ? 'won' : 'lost';
    cancelAnimationFrame(animFrame);

    won ? Sound.victory() : Sound.defeat();

    const harwok = won ? 15 : 5;
    const xp     = Math.max(50, Math.round(state.score / 8));
    state.xpGained = xp;

    // Show result overlay
    const overlay = document.getElementById('battle-result-overlay');
    if (overlay) {
      overlay.classList.add('show');
      overlay.style.background = won ? 'rgba(0,0,0,0.86)' : 'rgba(0,0,0,0.86)';
      const title = overlay.querySelector('.result-title');
      if (title) {
        title.textContent = won ? 'VICTORY' : 'DEFEATED';
        title.style.color = won ? '#FFD700' : '#F44336';
        title.style.textShadow = won ? '0 0 60px #FFD700' : '0 0 60px #F44336';
      }
      overlay.querySelector('#result-score').textContent  = state.score.toLocaleString();
      overlay.querySelector('#result-kills').textContent  = state.kills;
      overlay.querySelector('#result-combo').textContent  = state.maxCombo;
      overlay.querySelector('#result-harwok').textContent = harwok;
      overlay.querySelector('#result-xp').textContent     = xp;
    }

    if (onEndCallback) onEndCallback(won, state.score, state.kills, state.maxCombo, harwok, xp, state.sessionDmg);
  }

  function stop() {
    cancelAnimationFrame(animFrame);
    window.removeEventListener('resize', resizeCanvas);
  }

  function getState() { return state; }

  return { init, stop, getState, activatePassive, doAttack, doSkill1, doSkill2, doUltimate };
})();
