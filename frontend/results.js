const IS_MAFIA_WIN = Math.random() > 0.5;
const PLAYERS = [
  { name: 'GHOST_FOX', role: 'DEBUGGER', lvl: 7, tests: '3 / 4', bugs: 2, sabotaged: false, xp: 420, dia: 8, isYou: true },
  { name: 'NULL_PTR', role: 'DEBUGGER', lvl: 12, tests: '4 / 4', bugs: 3, sabotaged: true, xp: 550, dia: 12, isYou: false },
  { name: 'K4R3N', role: 'MAFIA', lvl: 5, sabDeployed: 2, disrupted: '1 / 3', detected: true, xp: 180, dia: 3, isYou: false },
  { name: 'SEGFAULT_SUE', role: 'DEBUGGER', lvl: 9, tests: '1 / 4', bugs: 0, sabotaged: false, xp: 100, dia: 2, isYou: false },
];

const TOKENS = [
  { id: 'eagle', icon: 'search', name: 'EAGLE EYE', desc: 'Correctly voted Mafia first try', rarity: 'rare', color: 'token-rare' },
  { id: 'first', icon: 'zap', name: 'FIRST PATCH', desc: 'First to pass tests', rarity: 'common', color: 'token-common' },
  { id: 'untouched', icon: 'shield', name: 'UNTOUCHED', desc: 'Mafia never edited your code', rarity: 'uncommon', color: 'token-uncommon' },
];

// Initialize Icons
lucide.createIcons();

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
    let stats = '';
    if (isMafia) {
      stats = `
        <div class="sc-stat-row"><span class="sc-stat-label">SABOTAGES DEPLOYED</span><span class="sc-stat-val">${p.sabDeployed}</span></div>
        <div class="sc-stat-row"><span class="sc-stat-label">PLAYERS DISRUPTED</span><span class="sc-stat-val">${p.disrupted}</span></div>
        <div class="sc-stat-row"><span class="sc-stat-label">DETECTED</span><span class="sc-stat-val ${p.detected?'val-teal':'val-red'}">${p.detected?'YES':'NO'}</span></div>
      `;
    } else {
      stats = `
        <div class="sc-stat-row"><span class="sc-stat-label">TESTS PASSED</span><span class="sc-stat-val">${p.tests}</span></div>
        <div class="sc-stat-row"><span class="sc-stat-label">BUGS FIXED</span><span class="sc-stat-val">${p.bugs}</span></div>
        <div class="sc-stat-row"><span class="sc-stat-label">SABOTAGED</span><span class="sc-stat-val ${p.sabotaged?'val-red':'val-teal'}">${p.sabotaged?'YES':'NO'}</span></div>
      `;
    }
    
    return `
      <div class="scorecard glass ${isMafia ? 'is-mafia' : ''} ${p.isYou ? 'is-you' : ''}">
        ${p.isYou ? '<div class="you-badge">YOU</div>' : ''}
        <div class="sc-head">
          <div class="sc-name">
            ${isMafia ? '<i data-lucide="flag" size="16"></i>' : '<i data-lucide="play" size="16"></i>'}
            ${p.name}
          </div>
          <div class="sc-role ${p.role.toLowerCase()}">${p.role}</div>
        </div>
        <div style="font-family:var(--font-m); font-size:11px; opacity:0.6; margin-top:-4px; margin-bottom:4px;">LVL ${String(p.lvl).padStart(2,'0')}</div>
        <div class="sc-stats">${stats}</div>
        <div class="sc-rewards">
          <span class="sc-xp">+ <span class="card-xp-val" data-val="${p.xp}">0</span> XP</span>
          <span class="sc-dia">+ <span class="card-dia-val" data-val="${p.dia}">0</span> ◆</span>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
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
  lucide.createIcons();
}

renderScorecards();
renderTokens();

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
