// Load real game result written by game_over socket event
const _raw = localStorage.getItem("cm_result");
const _gameResult = _raw ? JSON.parse(_raw) : null;
const _myUser = JSON.parse(localStorage.getItem("cm_user") || "null");

const IS_MAFIA_WIN = _gameResult ? _gameResult.winner === "MAFIA" : false;

let PLAYERS;
if (_gameResult && _gameResult.finalRoles && _gameResult.finalRoles.length > 0) {
  PLAYERS = _gameResult.finalRoles.map(p => {
    const isMafia = p.role === "MAFIA" || p.role === "SABOTEUR";
    const isWinner = IS_MAFIA_WIN ? isMafia : !isMafia;
    const isYou = _myUser && p.userId === _myUser.id;
    const xp = isWinner ? 350 + Math.floor(Math.random() * 200) : 80 + Math.floor(Math.random() * 120);
    const dia = isWinner ? 6 + Math.floor(Math.random() * 8) : 1 + Math.floor(Math.random() * 4);
    if (isMafia) {
      return { name: p.username.toUpperCase(), role: 'MAFIA', lvl: 5,
               sabDeployed: 2, disrupted: '? / ?', detected: !IS_MAFIA_WIN,
               xp, dia, isYou };
    } else {
      const roleLabel = p.role === 'DETECTIVE' ? 'DETECTIVE' : p.role === 'LEAD_DEV' ? 'LEAD DEV' : 'DEBUGGER';
      return { name: p.username.toUpperCase(), role: roleLabel, lvl: 7,
               tests: '? / 4', bugs: Math.floor(Math.random() * 4),
               sabotaged: false, xp, dia, isYou };
    }
  });
} else {
  // Fallback if navigated directly without a real game
  PLAYERS = [
    { name: 'GHOST_FOX', role: 'DEBUGGER', lvl: 7, tests: '3 / 4', bugs: 2, sabotaged: false, xp: 420, dia: 8, isYou: true },
    { name: 'NULL_PTR',   role: 'DEBUGGER', lvl: 12, tests: '4 / 4', bugs: 3, sabotaged: true,  xp: 550, dia: 12, isYou: false },
    { name: 'K4R3N',      role: 'MAFIA',    lvl: 5, sabDeployed: 2, disrupted: '1 / 3', detected: true, xp: 180, dia: 3, isYou: false },
    { name: 'SEGFAULT_SUE', role: 'DEBUGGER', lvl: 9, tests: '1 / 4', bugs: 0, sabotaged: false, xp: 100, dia: 2, isYou: false },
  ];
}

// Populate beat2 mafia reveal with real player data
const _mafiaPlayer = PLAYERS.find(p => p.role === 'MAFIA');
if (_mafiaPlayer) {
  const b2Name = document.querySelector('.b2-name');
  const b2Status = document.querySelector('.b2-status');
  if (b2Name) b2Name.textContent = _mafiaPlayer.name;
  if (b2Status) {
    if (_mafiaPlayer.detected) {
      b2Status.textContent = '[ SUCCESSFULLY IDENTIFIED ]';
      b2Status.className = 'b2-status caught';
    } else {
      b2Status.textContent = '[ NEVER DETECTED ]';
      b2Status.className = 'b2-status escaped';
    }
  }
}

const TOKENS = [
  { id: 'eagle', icon: 'search', name: 'EAGLE EYE', desc: 'Correctly voted Mafia first try', rarity: 'rare', color: 'token-rare' },
  { id: 'first', icon: 'zap', name: 'FIRST PATCH', desc: 'First to pass tests', rarity: 'common', color: 'token-common' },
  { id: 'untouched', icon: 'shield', name: 'UNTOUCHED', desc: 'Mafia never edited your code', rarity: 'uncommon', color: 'token-uncommon' },
];

// Initialize Icons
const icons = () => { if (typeof lucide !== 'undefined') lucide.createIcons(); };
icons();

// Setup DOM
const beat1 = document.getElementById('beat1');
const beat2 = document.getElementById('beat2');
const beat3 = document.getElementById('beat3');

if (IS_MAFIA_WIN) {
  beat1.classList.add('mafia-win');
  document.getElementById('b1Sub').textContent = 'OPERATION SABOTAGED';
  document.getElementById('b1Title').innerHTML = 'MAFIA<br>PREVAILS';
  document.getElementById('rcOutcome').textContent = 'MAFIA WINS';
  document.getElementById('rcOutcome').className = 'rh-center red';
}

function renderScorecards() {
  const cont = document.getElementById('scorecardsCont');
  cont.innerHTML = PLAYERS.map(p => {
    const isMafia = p.role === 'MAFIA';
    let statCols = '';
    if (isMafia) {
      statCols = `
        <div class="sc-stat-col"><span class="sc-stat-label">Sabotages</span><span class="sc-stat-val">${p.sabDeployed}</span></div>
        <div class="sc-stat-col"><span class="sc-stat-label">Disrupted</span><span class="sc-stat-val">${p.disrupted}</span></div>
        <div class="sc-stat-col"><span class="sc-stat-label">Detected</span><span class="sc-stat-val ${p.detected?'val-teal':'val-red'}">${p.detected?'YES':'NO'}</span></div>
      `;
    } else {
      statCols = `
        <div class="sc-stat-col"><span class="sc-stat-label">Tests</span><span class="sc-stat-val">${p.tests}</span></div>
        <div class="sc-stat-col"><span class="sc-stat-label">Bugs</span><span class="sc-stat-val">${p.bugs}</span></div>
        <div class="sc-stat-col"><span class="sc-stat-label">Sabotaged</span><span class="sc-stat-val ${p.sabotaged?'val-red':'val-teal'}">${p.sabotaged?'YES':'NO'}</span></div>
      `;
    }
    return `
      <div class="scorecard glass ${isMafia ? 'is-mafia' : ''} ${p.isYou ? 'is-you' : ''}">
        ${p.isYou ? '<div class="you-badge">YOU</div>' : ''}
        <div class="sc-bar"></div>
        <div class="sc-inner">
          <div class="sc-identity">
            <div class="sc-name">${p.name}</div>
            <div class="sc-meta">
              <span class="sc-role ${p.role.toLowerCase()}">${p.role}</span>
              <span class="sc-lvl">LVL ${String(p.lvl).padStart(2,'0')}</span>
            </div>
          </div>
          <div class="sc-stats">${statCols}</div>
          <div class="sc-rewards">
            <span class="sc-xp">+<span class="card-xp-val" data-val="${p.xp}">0</span> XP</span>
            <span class="sc-dia">+<span class="card-dia-val" data-val="${p.dia}">0</span> ◆</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  icons();
}

function renderTokens() {
  const cont = document.getElementById('tokensWrap');
  cont.innerHTML = TOKENS.map(t => `
    <div class="token-card ${t.color}">
      <i data-lucide="${t.icon}" class="tc-icon"></i>
      <div class="tc-name">${t.name}</div>
      <div class="tc-desc">${t.desc}</div>
      <div class="tc-rarity">${t.rarity.toUpperCase()}</div>
    </div>
  `).join('');
  icons();
}

const MEDAL_IMGS = {
  1: 'assets/medal_gold.png',
  2: 'assets/medal_silver.png',
  3: 'assets/medal_bronze.png',
};
const PLACE_LABELS = { 1: '1ST PLACE', 2: '2ND PLACE', 3: '3RD PLACE' };

function renderPodium() {
  const sorted = [...PLAYERS].sort((a, b) => b.xp - a.xp);
  const top3 = sorted.slice(0, 3);
  // reorder for podium: 2nd, 1st, 3rd
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const ranks  = [2, 1, 3];

  const strip = document.getElementById('podiumStrip');
  strip.innerHTML = order.map((p, i) => {
    const rank = ranks[i];
    const medal = MEDAL_IMGS[rank];
    return `
      <div class="podium-slot rank-${rank}" data-idx="${i}">
        <img class="podium-medal" src="${medal}" alt="${PLACE_LABELS[rank]}"
             onerror="this.style.display='none'">
        <div class="podium-name">${p.name}</div>
        <div class="podium-place">${PLACE_LABELS[rank]}</div>
        <div class="podium-xp">+${p.xp} XP</div>
      </div>`;
  }).join('');
}

renderScorecards();
renderTokens();
renderPodium();

// Animations
function animateValue(obj, start, end, duration, suffix = '') {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    obj.innerHTML = Math.floor(easeProgress * (end - start) + start) + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end + suffix;
    }
  };
  window.requestAnimationFrame(step);
}

function runBeat3Animations() {
  // Podium slots pop in
  document.querySelectorAll('.podium-slot').forEach((s, i) => {
    setTimeout(() => s.classList.add('show'), i * 120);
  });

  // Staggered XP lines
  const rows = document.querySelectorAll('.xp-row');
  rows.forEach((r, i) => {
    setTimeout(() => r.classList.add('show'), i * 200);
  });
  
  // XP Bar
  setTimeout(() => {
    document.getElementById('xpBarFill').style.width = '70%';
  }, 1000);

  // General counters
  setTimeout(() => {
    document.querySelectorAll('.stat-counter, .xp-counter, .dia-counter, .card-xp-val, .card-dia-val').forEach(el => {
      const val = parseInt(el.getAttribute('data-val'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.classList.contains('xp-counter') || el.classList.contains('dia-counter') ? '+ ' : '';
      
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / 800, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const curr = Math.floor(ease * val);
        el.innerHTML = prefix + curr + (el.classList.contains('dia-counter') ? ' DIAMONDS' : (el.classList.contains('xp-counter') ? ' XP' : suffix));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    });
  }, 1200);

  // Tokens
  setTimeout(() => {
    document.querySelectorAll('.token-card').forEach((t, i) => {
      setTimeout(() => t.classList.add('show'), i * 150);
    });
  }, 1500);
}

// Sequence Flow
let currentBeat = 1;
let sequenceTimer = null;

function advanceBeat() {
  if (currentBeat === 1) {
    beat1.classList.remove('active');
    beat1.classList.add('fade-out');
    beat2.classList.add('active');
    currentBeat = 2;
    sequenceTimer = setTimeout(advanceBeat, 2500);
  } else if (currentBeat === 2) {
    beat2.classList.remove('active');
    beat2.classList.add('fade-out');
    beat3.classList.add('active');
    currentBeat = 3;
    setTimeout(runBeat3Animations, 400);
  }
}

// Click to skip
document.body.addEventListener('click', () => {
  if (currentBeat < 3) {
    clearTimeout(sequenceTimer);
    advanceBeat();
    if (currentBeat === 2) { // Double skip
      clearTimeout(sequenceTimer);
      advanceBeat();
    }
  }
});

// Start Sequence
window.onload = () => {
  beat1.classList.add('active');
  sequenceTimer = setTimeout(advanceBeat, 2500);
};
