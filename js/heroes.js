// ============================================================
//  ARENA CLASH — HEROES.JS
//  SVG hero rendering — all characters as pure SVG
// ============================================================

const HeroRenderer = (() => {

  // Returns SVG path/elements string for each hero
  function renderHeroSVG(heroId, frame, scale = 1, flip = false) {
    const bob   = Math.sin(frame * 0.15) * 4;
    const sway  = Math.sin(frame * 0.08) * 2;
    const f     = frame;

    let innerSVG = '';
    switch (heroId) {
      case 'gunman':   innerSVG = gunmanSVG(bob, sway, f); break;
      case 'archer':   innerSVG = archerSVG(bob, sway, f); break;
      case 'ninja':    innerSVG = ninjaSVG(bob, sway, f);  break;
      case 'spearman': innerSVG = spearmanSVG(bob, sway, f); break;
      case 'axeman':   innerSVG = axemanSVG(bob, sway, f); break;
      default:         innerSVG = starterSVG(bob, sway, f); break;
    }

    const w = Math.round(180 * scale);
    const h = Math.round(200 * scale);
    const flipTransform = flip ? `scale(-1,1) translate(-180,0)` : '';

    return `<svg width="${w}" height="${h}" viewBox="0 0 180 200" xmlns="http://www.w3.org/2000/svg">
      <g transform="${flipTransform}">${innerSVG}</g>
    </svg>`;
  }

  // Creates a live animated hero element
  function createHeroElement(heroId, size = 180, animate = true, flip = false) {
    const container = document.createElement('div');
    container.style.cssText = `width:${size}px;height:${Math.round(size*1.1)}px;display:flex;align-items:center;justify-content:center;`;

    let frame = Math.random() * 120;
    container.innerHTML = renderHeroSVG(heroId, frame, size / 180, flip);

    if (animate) {
      const interval = setInterval(() => {
        if (!document.body.contains(container)) { clearInterval(interval); return; }
        frame = (frame + 1) % 120;
        container.innerHTML = renderHeroSVG(heroId, frame, size / 180, flip);
      }, 50);
      container._animInterval = interval;
    }

    return container;
  }

  function stopAnimation(el) {
    if (el && el._animInterval) {
      clearInterval(el._animInterval);
      el._animInterval = null;
    }
  }

  // ── GUNMAN ────────────────────────────────────────────────
  function gunmanSVG(bob, sway, f) {
    const arm = Math.sin(f * 0.2) * 5;
    const muzzle = f % 30 < 3 ? `<polygon points="18,100 10,96 8,101 10,105" fill="#FFD700" opacity="0.9"/>` : '';
    return `<g transform="translate(${sway},${bob})">
      <ellipse cx="90" cy="195" rx="30" ry="5" fill="rgba(0,0,0,0.3)"/>
      <rect x="72" y="168" width="18" height="12" rx="4" fill="#1a1a2e"/>
      <rect x="95" y="168" width="18" height="12" rx="4" fill="#1a1a2e"/>
      <rect x="70" y="174" width="22" height="6" rx="3" fill="#0d0d1a"/>
      <rect x="93" y="174" width="22" height="6" rx="3" fill="#0d0d1a"/>
      <rect x="74" y="140" width="16" height="32" rx="3" fill="#2C3E50"/>
      <rect x="93" y="140" width="16" height="32" rx="3" fill="#2C3E50"/>
      <rect x="72" y="138" width="38" height="6" rx="2" fill="#8B6914"/>
      <rect x="87" y="138" width="8" height="6" rx="1" fill="#F4D03F"/>
      <rect x="68" y="95" width="46" height="50" rx="5" fill="#E74C3C"/>
      <rect x="88" y="100" width="6" height="40" rx="1" fill="#C0392B"/>
      <rect x="70" y="100" width="4" height="40" rx="1" fill="#C0392B"/>
      <rect x="108" y="100" width="4" height="40" rx="1" fill="#C0392B"/>
      <circle cx="91" cy="108" r="2" fill="#F4D03F"/>
      <circle cx="91" cy="118" r="2" fill="#F4D03F"/>
      <circle cx="91" cy="128" r="2" fill="#F4D03F"/>
      <ellipse cx="70" cy="100" rx="10" ry="7" fill="#C0392B"/>
      <ellipse cx="112" cy="100" rx="10" ry="7" fill="#C0392B"/>
      <g transform="rotate(${arm+15},70,100)">
        <rect x="52" y="96" width="18" height="10" rx="4" fill="#E74C3C"/>
        <rect x="38" y="98" width="15" height="7" rx="3" fill="#2C3E50"/>
        <rect x="20" y="99" width="20" height="5" rx="2" fill="#1a1a2e"/>
        <rect x="18" y="97" width="5" height="9" rx="1" fill="#1a1a2e"/>
        ${muzzle}
      </g>
      <g transform="rotate(${-arm},112,100)">
        <rect x="112" y="96" width="18" height="10" rx="4" fill="#E74C3C"/>
        <rect x="128" y="98" width="12" height="8" rx="3" fill="#2C3E50"/>
      </g>
      <rect x="85" y="86" width="12" height="12" rx="3" fill="#F1C27D"/>
      <rect x="74" y="58" width="34" height="32" rx="8" fill="#F1C27D"/>
      <rect x="74" y="58" width="34" height="10" rx="8" fill="#1a1a2e"/>
      <ellipse cx="84" cy="74" rx="4" ry="4" fill="white"/>
      <ellipse cx="98" cy="74" rx="4" ry="4" fill="white"/>
      <circle cx="85" cy="75" r="2.5" fill="#1a1a2e"/>
      <circle cx="99" cy="75" r="2.5" fill="#1a1a2e"/>
      <circle cx="86" cy="74" r="1" fill="white"/>
      <circle cx="100" cy="74" r="1" fill="white"/>
      <ellipse cx="91" cy="80" rx="2" ry="1.5" fill="#D4A574"/>
      <path d="M 86 85 Q 91 88 96 85" stroke="#8B5E3C" stroke-width="1.5" fill="none"/>
      <rect x="72" y="50" width="38" height="12" rx="4" fill="#1a1a2e"/>
      <rect x="76" y="38" width="30" height="15" rx="4" fill="#1a1a2e"/>
      <rect x="78" y="40" width="26" height="3" fill="#E74C3C"/>
      <rect x="68" y="120" width="5" height="10" rx="1" fill="#F4D03F"/>
      <rect x="76" y="120" width="5" height="10" rx="1" fill="#F4D03F"/>
      <rect x="84" y="120" width="5" height="10" rx="1" fill="#F4D03F"/>
      <rect x="92" y="120" width="5" height="10" rx="1" fill="#F4D03F"/>
      <rect x="100" y="120" width="5" height="10" rx="1" fill="#F4D03F"/>
    </g>`;
  }

  // ── ARCHER ────────────────────────────────────────────────
  function archerSVG(bob, sway, f) {
    const db = Math.sin(f * 0.12) * 8;
    return `<g transform="translate(${sway},${bob})">
      <ellipse cx="90" cy="195" rx="28" ry="5" fill="rgba(0,0,0,0.3)"/>
      <rect x="72" y="168" width="16" height="12" rx="3" fill="#3E2723"/>
      <rect x="94" y="168" width="16" height="12" rx="3" fill="#3E2723"/>
      <rect x="70" y="174" width="20" height="6" rx="2" fill="#2E1A10"/>
      <rect x="92" y="174" width="20" height="6" rx="2" fill="#2E1A10"/>
      <rect x="74" y="138" width="14" height="34" rx="3" fill="#33691E"/>
      <rect x="94" y="138" width="14" height="34" rx="3" fill="#33691E"/>
      <rect x="108" y="90" width="10" height="50" rx="4" fill="#5D4037"/>
      <rect x="110" y="92" width="6" height="2" rx="1" fill="#8B6914"/>
      <rect x="110" y="102" width="6" height="2" rx="1" fill="#8B6914"/>
      <rect x="110" y="112" width="6" height="2" rx="1" fill="#8B6914"/>
      <line x1="113" y1="90" x2="113" y2="75" stroke="#8D6E63" stroke-width="1.5"/>
      <line x1="111" y1="90" x2="111" y2="78" stroke="#8D6E63" stroke-width="1.5"/>
      <rect x="70" y="95" width="44" height="48" rx="5" fill="#2E7D32"/>
      <rect x="87" y="98" width="8" height="42" fill="#1B5E20"/>
      <path d="M70,95 Q90,85 112,95" fill="#1B5E20"/>
      <g transform="rotate(-20,68,102)">
        <rect x="52" y="98" width="18" height="9" rx="4" fill="#2E7D32"/>
        <rect x="44" y="96" width="10" height="12" rx="3" fill="#F1C27D"/>
      </g>
      <path d="M 48 ${70+db} Q 38 102 48 ${134-db}" stroke="#6D4C41" stroke-width="4" fill="none"/>
      <line x1="48" y1="${70+db}" x2="48" y2="${134-db}" stroke="#BCAAA4" stroke-width="1.5"/>
      <line x1="48" y1="102" x2="75" y2="102" stroke="#8D6E63" stroke-width="2"/>
      <polygon points="48,100 42,102 48,104" fill="#FFD54F"/>
      <g transform="rotate(10,112,102)">
        <rect x="112" y="98" width="18" height="9" rx="4" fill="#2E7D32"/>
        <rect x="128" y="98" width="10" height="9" rx="3" fill="#F1C27D"/>
      </g>
      <rect x="86" y="86" width="10" height="12" rx="3" fill="#F1C27D"/>
      <ellipse cx="91" cy="70" rx="17" ry="18" fill="#F1C27D"/>
      <path d="M74,65 Q91,45 108,65 Q108,55 91,52 Q74,55 74,65" fill="#1B5E20"/>
      <ellipse cx="91" cy="65" rx="18" ry="8" fill="#2E7D32"/>
      <ellipse cx="84" cy="72" rx="3.5" ry="3.5" fill="white"/>
      <ellipse cx="98" cy="72" rx="3.5" ry="3.5" fill="white"/>
      <circle cx="85" cy="73" r="2" fill="#1B5E20"/>
      <circle cx="99" cy="73" r="2" fill="#1B5E20"/>
      <circle cx="85.5" cy="72.5" r="0.8" fill="white"/>
      <circle cx="99.5" cy="72.5" r="0.8" fill="white"/>
      <path d="M 86 80 Q 91 83 96 80" stroke="#8B5E3C" stroke-width="1.5" fill="none"/>
      <rect x="70" y="137" width="44" height="6" rx="2" fill="#4E342E"/>
      <circle cx="91" cy="140" r="4" fill="#8D6E63"/>
    </g>`;
  }

  // ── NINJA ─────────────────────────────────────────────────
  function ninjaSVG(bob, sway, f) {
    const kr = (f * 8) % 360;
    const op = (0.7 + Math.sin(f * 0.15) * 0.3).toFixed(2);
    const shimmer = f % 60 > 45 ? `<ellipse cx="91" cy="120" rx="46" ry="55" fill="rgba(155,93,229,0.08)"/>` : '';
    return `<g transform="translate(${sway},${bob})" opacity="${op}">
      <ellipse cx="90" cy="195" rx="25" ry="4" fill="rgba(0,0,0,0.25)"/>
      <path d="M72,168 L88,168 L88,180 L72,180 Q68,180 68,176 L68,172 Q68,168 72,168Z" fill="#0d0d0d"/>
      <path d="M94,168 L110,168 L110,180 L94,180 Q90,180 90,176 L90,172 Q90,168 94,168Z" fill="#0d0d0d"/>
      <rect x="73" y="138" width="15" height="34" rx="2" fill="#1a1a1a"/>
      <rect x="94" y="138" width="15" height="34" rx="2" fill="#1a1a1a"/>
      <path d="M68,95 L114,95 L114,145 L68,145 Z" fill="#111111"/>
      <path d="M82,95 L68,115" stroke="#9B5DE5" stroke-width="2"/>
      <path d="M100,95 L114,115" stroke="#9B5DE5" stroke-width="2"/>
      <rect x="68" y="135" width="46" height="8" rx="2" fill="#9B5DE5"/>
      <g transform="rotate(-15,68,105)"><rect x="50" y="100" width="20" height="10" rx="4" fill="#1a1a1a"/></g>
      <g transform="translate(38,103) rotate(${kr*0.5})">
        <line x1="0" y1="-14" x2="0" y2="14" stroke="#9B5DE5" stroke-width="2.5"/>
        <polygon points="0,-14 -3,-8 3,-8" fill="#7B2FBE"/>
        <polygon points="-4,6 4,6 2,10 -2,10" fill="#5E2D91"/>
      </g>
      <g transform="rotate(15,114,105)"><rect x="112" y="100" width="20" height="10" rx="4" fill="#1a1a1a"/></g>
      <rect x="83" y="86" width="16" height="12" rx="3" fill="#1a1a1a"/>
      <ellipse cx="91" cy="68" rx="18" ry="19" fill="#0d0d0d"/>
      <rect x="78" y="66" width="26" height="8" rx="3" fill="#1a1a1a"/>
      <ellipse cx="84" cy="70" rx="4" ry="3" fill="#9B5DE5"/>
      <ellipse cx="98" cy="70" rx="4" ry="3" fill="#9B5DE5"/>
      <circle cx="84" cy="70" r="2" fill="#CE93D8"/>
      <circle cx="98" cy="70" r="2" fill="#CE93D8"/>
      <rect x="73" y="56" width="36" height="7" rx="3" fill="#9B5DE5"/>
      <rect x="82" y="53" width="18" height="13" rx="2" fill="#7B2FBE"/>
      <line x1="91" y1="55" x2="91" y2="66" stroke="#CE93D8" stroke-width="1"/>
      ${shimmer}
      <g transform="translate(105,108)">
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#9B5DE5" stroke-width="2"/>
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#9B5DE5" stroke-width="2"/>
        <line x1="-4" y1="-4" x2="4" y2="4" stroke="#9B5DE5" stroke-width="2"/>
        <line x1="4" y1="-4" x2="-4" y2="4" stroke="#9B5DE5" stroke-width="2"/>
        <circle cx="0" cy="0" r="3" fill="#5E2D91"/>
      </g>
    </g>`;
  }

  // ── SPEARMAN ──────────────────────────────────────────────
  function spearmanSVG(bob, sway, f) {
    const sp = Math.sin(f * 0.1) * 3;
    return `<g transform="translate(${sway},${bob})">
      <ellipse cx="90" cy="195" rx="30" ry="5" fill="rgba(0,0,0,0.3)"/>
      <rect x="71" y="155" width="18" height="25" rx="3" fill="#546E7A"/>
      <rect x="93" y="155" width="18" height="25" rx="3" fill="#546E7A"/>
      <rect x="69" y="172" width="22" height="10" rx="3" fill="#37474F"/>
      <rect x="91" y="172" width="22" height="10" rx="3" fill="#37474F"/>
      <rect x="73" y="130" width="16" height="30" rx="2" fill="#4FC3F7"/>
      <rect x="93" y="130" width="16" height="30" rx="2" fill="#4FC3F7"/>
      <rect x="65" y="88" width="52" height="50" rx="5" fill="#4FC3F7"/>
      <path d="M78,90 Q91,82 104,90 L104,130 L78,130 Z" fill="#29B6F6"/>
      <path d="M91,88 L91,128" stroke="#0277BD" stroke-width="2"/>
      <ellipse cx="68" cy="94" rx="12" ry="9" fill="#29B6F6"/>
      <ellipse cx="114" cy="94" rx="12" ry="9" fill="#29B6F6"/>
      <rect x="50" y="90" width="18" height="11" rx="4" fill="#4FC3F7"/>
      <rect x="44" y="90" width="10" height="11" rx="3" fill="#F1C27D"/>
      <line x1="34" y1="${10+sp}" x2="44" y2="180" stroke="#6D4C41" stroke-width="4"/>
      <line x1="34" y1="${10+sp}" x2="44" y2="180" stroke="#8D6E63" stroke-width="2"/>
      <polygon points="34,${10+sp} 28,${25+sp} 40,${25+sp}" fill="#90CAF9"/>
      <polygon points="34,${10+sp} 30,${20+sp} 34,${28+sp} 38,${20+sp}" fill="#4FC3F7"/>
      <line x1="36" y1="130" x2="42" y2="130" stroke="#D4AC0D" stroke-width="2"/>
      <line x1="36" y1="140" x2="42" y2="140" stroke="#D4AC0D" stroke-width="2"/>
      <line x1="36" y1="150" x2="42" y2="150" stroke="#D4AC0D" stroke-width="2"/>
      <line x1="36" y1="160" x2="42" y2="160" stroke="#D4AC0D" stroke-width="2"/>
      <rect x="114" y="90" width="18" height="11" rx="4" fill="#4FC3F7"/>
      <rect x="130" y="92" width="10" height="9" rx="3" fill="#F1C27D"/>
      <rect x="85" y="80" width="12" height="12" rx="3" fill="#F1C27D"/>
      <ellipse cx="91" cy="65" rx="18" ry="18" fill="#F1C27D"/>
      <path d="M73,65 Q73,40 91,38 Q109,40 109,65" fill="#29B6F6"/>
      <rect x="73" y="62" width="36" height="8" rx="2" fill="#0277BD"/>
      <rect x="89" y="62" width="4" height="12" rx="2" fill="#0277BD"/>
      <path d="M91,38 Q88,20 91,15 Q94,20 91,38" fill="#E53935"/>
      <ellipse cx="82" cy="68" rx="3.5" ry="3.5" fill="white"/>
      <ellipse cx="100" cy="68" rx="3.5" ry="3.5" fill="white"/>
      <circle cx="83" cy="69" r="2" fill="#1565C0"/>
      <circle cx="101" cy="69" r="2" fill="#1565C0"/>
      <path d="M 79 75 Q 91 78 103 75" stroke="#8B5E3C" stroke-width="1.5" fill="none"/>
    </g>`;
  }

  // ── AXEMAN ────────────────────────────────────────────────
  function axemanSVG(bob, sway, f) {
    const ax   = Math.sin(f * 0.18) * 12;
    const rage = f % 60 > 40;
    const eyeColor = rage ? '#F72585' : 'white';
    const pupilColor = rage ? '#C2185B' : '#1a1a1a';
    const rageOverlay = rage ? `<path d="M22,52 Q5,60 8,75 Q5,90 22,95 Q15,75 20,68 Q18,60 22,52Z" fill="rgba(247,37,133,0.35)"/>
      <circle cx="12" cy="77" r="2" fill="#F72585" opacity="0.8"/>
      <circle cx="18" cy="79" r="2" fill="#F72585" opacity="0.8"/>
      <circle cx="24" cy="77" r="2" fill="#F72585" opacity="0.8"/>` : '';
    const eyeGlow = rage ? `<ellipse cx="83" cy="61" rx="7" ry="7" fill="none" stroke="#F72585" stroke-width="1" opacity="0.5"/>
      <ellipse cx="99" cy="61" rx="7" ry="7" fill="none" stroke="#F72585" stroke-width="1" opacity="0.5"/>` : '';
    return `<g transform="translate(${sway},${bob})">
      <ellipse cx="90" cy="195" rx="34" ry="6" fill="rgba(0,0,0,0.35)"/>
      <rect x="68" y="165" width="22" height="15" rx="5" fill="#1a1a1a"/>
      <rect x="92" y="165" width="22" height="15" rx="5" fill="#1a1a1a"/>
      <rect x="66" y="172" width="26" height="8" rx="4" fill="#0d0d0d"/>
      <rect x="90" y="172" width="26" height="8" rx="4" fill="#0d0d0d"/>
      <rect x="70" y="130" width="20" height="40" rx="4" fill="#37474F"/>
      <rect x="92" y="130" width="20" height="40" rx="4" fill="#37474F"/>
      <rect x="68" y="150" width="24" height="3" rx="1" fill="#5D4037"/>
      <rect x="68" y="158" width="24" height="3" rx="1" fill="#5D4037"/>
      <rect x="68" y="166" width="24" height="3" rx="1" fill="#5D4037"/>
      <rect x="90" y="150" width="24" height="3" rx="1" fill="#5D4037"/>
      <rect x="90" y="158" width="24" height="3" rx="1" fill="#5D4037"/>
      <rect x="90" y="166" width="24" height="3" rx="1" fill="#5D4037"/>
      <rect x="60" y="85" width="62" height="52" rx="6" fill="#37474F"/>
      <path d="M60,85 Q91,75 122,85" fill="#5D4037"/>
      <line x1="70" y1="90" x2="110" y2="130" stroke="#8D6E63" stroke-width="4"/>
      <line x1="112" y1="90" x2="72" y2="130" stroke="#8D6E63" stroke-width="4"/>
      <circle cx="91" cy="110" r="6" fill="#D4AC0D"/>
      <rect x="62" y="130" width="58" height="10" rx="4" fill="#4E342E"/>
      <circle cx="91" cy="135" r="5" fill="#D4AC0D"/>
      <g transform="rotate(${ax},62,100)">
        <rect x="42" y="92" width="22" height="14" rx="5" fill="#455A64"/>
        <rect x="35" y="94" width="12" height="12" rx="3" fill="#F1C27D"/>
        <line x1="22" y1="170" x2="35" y2="100" stroke="#6D4C41" stroke-width="6"/>
        <path d="M22,52 Q5,60 8,75 Q5,90 22,95 Q15,75 20,68 Q18,60 22,52Z" fill="#78909C"/>
        <path d="M22,52 Q35,58 35,75 Q35,90 22,95 Q30,75 28,68 Q30,60 22,52Z" fill="#90A4AE"/>
        ${rageOverlay}
      </g>
      <rect x="120" y="92" width="20" height="14" rx="5" fill="#455A64"/>
      <rect x="138" y="94" width="12" height="12" rx="3" fill="#F1C27D"/>
      <rect x="84" y="76" width="14" height="14" rx="4" fill="#F1C27D"/>
      <ellipse cx="91" cy="60" rx="22" ry="20" fill="#D4A574"/>
      <path d="M69,60 Q69,35 91,32 Q113,35 113,60" fill="#546E7A"/>
      <rect x="69" y="56" width="44" height="9" rx="3" fill="#37474F"/>
      <path d="M72,48 Q58,30 62,20 Q65,30 75,42 Z" fill="#D4AC0D"/>
      <path d="M110,48 Q124,30 120,20 Q117,30 107,42 Z" fill="#D4AC0D"/>
      <path d="M73,72 Q77,90 91,88 Q105,90 109,72" fill="#5D4037"/>
      <path d="M79,80 L77,95 M85,83 L84,98 M91,84 L91,99 M97,83 L98,98 M103,80 L105,95" stroke="#4E342E" stroke-width="2"/>
      <ellipse cx="83" cy="61" rx="4" ry="4" fill="${eyeColor}"/>
      <ellipse cx="99" cy="61" rx="4" ry="4" fill="${eyeColor}"/>
      <circle cx="84" cy="62" r="2.5" fill="${pupilColor}"/>
      <circle cx="100" cy="62" r="2.5" fill="${pupilColor}"/>
      ${eyeGlow}
      <ellipse cx="91" cy="67" rx="3" ry="2" fill="#B8864E"/>
    </g>`;
  }

  // ── STARTER ───────────────────────────────────────────────
  function starterSVG(bob, sway, f) {
    return `<g transform="translate(${sway},${bob})">
      <ellipse cx="90" cy="195" rx="25" ry="4" fill="rgba(0,0,0,0.25)"/>
      <rect x="74" y="168" width="16" height="12" rx="3" fill="#455A64"/>
      <rect x="92" y="168" width="16" height="12" rx="3" fill="#455A64"/>
      <rect x="74" y="138" width="14" height="34" rx="3" fill="#546E7A"/>
      <rect x="94" y="138" width="14" height="34" rx="3" fill="#546E7A"/>
      <rect x="70" y="92" width="42" height="50" rx="5" fill="#607D8B"/>
      <rect x="88" y="96" width="6" height="42" fill="#546E7A"/>
      <rect x="70" y="130" width="42" height="8" rx="3" fill="#4E342E"/>
      <rect x="70" y="92" width="42" height="10" rx="5" fill="#78909C"/>
      <rect x="52" y="94" width="18" height="10" rx="4" fill="#607D8B"/>
      <rect x="112" y="94" width="18" height="10" rx="4" fill="#607D8B"/>
      <rect x="44" y="96" width="12" height="8" rx="3" fill="#F1C27D"/>
      <rect x="126" y="96" width="12" height="8" rx="3" fill="#F1C27D"/>
      <rect x="85" y="83" width="12" height="12" rx="3" fill="#F1C27D"/>
      <ellipse cx="91" cy="68" rx="16" ry="17" fill="#F1C27D"/>
      <rect x="75" y="56" width="32" height="10" rx="4" fill="#546E7A"/>
      <ellipse cx="83" cy="72" rx="3.5" ry="3.5" fill="white"/>
      <ellipse cx="99" cy="72" rx="3.5" ry="3.5" fill="white"/>
      <circle cx="84" cy="73" r="2" fill="#455A64"/>
      <circle cx="100" cy="73" r="2" fill="#455A64"/>
      <circle cx="84.5" cy="72.5" r="0.8" fill="white"/>
      <circle cx="100.5" cy="72.5" r="0.8" fill="white"/>
      <path d="M 85 79 Q 91 82 97 79" stroke="#8B5E3C" stroke-width="1.5" fill="none"/>
    </g>`;
  }

  return { renderHeroSVG, createHeroElement, stopAnimation };
})();
