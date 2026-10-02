// Sleek In-Game Notification Manager (Replaces all intrusive browser alert dialogs)
let noticeTimeout = null;

function showGameNotice(message, type = 'warning') {
  const noticeEl = document.getElementById('gameNotice');
  const iconEl = document.getElementById('gameNoticeIcon');
  const textEl = document.getElementById('gameNoticeText');
  
  if (!noticeEl || !textEl) return;
  
  if (noticeTimeout) {
    clearTimeout(noticeTimeout);
    noticeTimeout = null;
  }

  const cleanText = String(message || '').replace(/^[⏳⚠️❌✅ℹ️]\s*/, '');
  textEl.innerText = cleanText;
  
  let icon = '⚠️';
  const lower = cleanText.toLowerCase();
  if (type === 'error' || lower.includes('insufficient') || lower.includes('unable')) {
    icon = '⚠️';
    noticeEl.className = 'game-notice notice-error show';
  } else if (lower.includes('closed') || lower.includes('locked')) {
    icon = '⏳';
    noticeEl.className = 'game-notice notice-warning show';
  } else {
    icon = 'ℹ️';
    noticeEl.className = 'game-notice notice-info show';
  }
  if (iconEl) iconEl.innerText = icon;

  noticeTimeout = setTimeout(() => {
    hideNotice();
  }, 2200);
}

function hideNotice() {
  const noticeEl = document.getElementById('gameNotice');
  if (noticeEl) {
    noticeEl.classList.remove('show');
  }
  if (noticeTimeout) {
    clearTimeout(noticeTimeout);
    noticeTimeout = null;
  }
}

function triggerWalletShake() {
  const walletContainer = document.querySelector('.wallet-chip-container') || document.getElementById('walletDisplay');
  if (walletContainer) {
    walletContainer.classList.remove('shake');
    void walletContainer.offsetWidth;
    walletContainer.classList.add('shake');
    setTimeout(() => {
      walletContainer.classList.remove('shake');
    }, 500);
  }
}

// Override native window.alert globally so no alert modal can ever pop up
window.alert = function(msg) {
  showGameNotice(String(msg || ''));
};

// Dynamic Resolution from Android Bridge
function getAuthToken() {
  if (window.AndroidBridge && window.AndroidBridge.getAuthToken) {
    try {
      const t = window.AndroidBridge.getAuthToken();
      if (t) return t;
    } catch (_) {}
  }
  return '';
}

function getUserId() {
  if (window.AndroidBridge && window.AndroidBridge.getUserId) {
    try {
      const u = window.AndroidBridge.getUserId();
      if (u) return u;
    } catch (_) {}
  }
  return '';
}

function getServerUrl() {
  if (window.AndroidBridge && window.AndroidBridge.getServerUrl) {
    try {
      const s = window.AndroidBridge.getServerUrl();
      if (s) return s;
    } catch (_) {}
  }
  return 'http://3.7.73.109:4001';
}

function updateWalletDisplay(serverPaise) {
  const display = document.getElementById('walletDisplay');
  if (!display) return;

  // 1. Check local Android bridge balance first (Native Android Ledger)
  if (window.AndroidBridge && window.AndroidBridge.getLocalWalletBalancePaise) {
    try {
      const localPaise = window.AndroidBridge.getLocalWalletBalancePaise();
      if (localPaise !== undefined && localPaise !== null && localPaise > 0) {
        display.innerText = (localPaise / 100).toFixed(2);
        return;
      }
    } catch (_) {}
  }

  // 2. If server has positive balance, show server balance
  if (serverPaise !== undefined && serverPaise !== null && serverPaise > 0) {
    display.innerText = (serverPaise / 100).toFixed(2);
    return;
  }

  // 3. Fallback to local 0.00 or server 0.00
  if (window.AndroidBridge && window.AndroidBridge.getLocalWalletBalancePaise) {
    try {
      const localPaise = window.AndroidBridge.getLocalWalletBalancePaise();
      if (localPaise !== undefined && localPaise !== null && localPaise >= 0) {
        display.innerText = (localPaise / 100).toFixed(2);
        return;
      }
    } catch (_) {}
  }

  if (serverPaise !== undefined && serverPaise !== null && serverPaise >= 0) {
    display.innerText = (serverPaise / 100).toFixed(2);
  } else {
    display.innerText = '0.00';
  }
}

let selectedChipRupees = 10;
let currentPhase = 'BETTING';
let currentRotationDeg = 0;
let isSpinningAnimation = false;
let lastSpunRoundId = null;
let currentRoundId = '';  // tracks active round for bet-grouping

// 32 Segment Multipliers & Colors (Pure numbers without x)
const SEGMENTS = [
  { mult: '30', color: '#10B981' },
  { mult: '2',  color: '#475569' },
  { mult: '3',  color: '#8B5CF6' },
  { mult: '2',  color: '#475569' },
  { mult: '5',  color: '#EA580C' },
  { mult: '2',  color: '#475569' },
  { mult: '3',  color: '#8B5CF6' },
  { mult: '2',  color: '#475569' },
  { mult: '5',  color: '#EA580C' },
  { mult: '2',  color: '#475569' },
  { mult: '3',  color: '#8B5CF6' },
  { mult: '2',  color: '#475569' },
  { mult: '3',  color: '#8B5CF6' },
  { mult: '2',  color: '#475569' },
  { mult: '5',  color: '#EA580C' },
  { mult: '2',  color: '#475569' },
  { mult: '3',  color: '#8B5CF6' },
  { mult: '2',  color: '#475569' },
  { mult: '3',  color: '#8B5CF6' },
  { mult: '2',  color: '#475569' },
  { mult: '5',  color: '#EA580C' },
  { mult: '2',  color: '#475569' },
  { mult: '3',  color: '#8B5CF6' },
  { mult: '2',  color: '#475569' },
  { mult: '5',  color: '#EA580C' },
  { mult: '2',  color: '#475569' },
  { mult: '3',  color: '#8B5CF6' },
  { mult: '2',  color: '#475569' },
  { mult: '3',  color: '#8B5CF6' },
  { mult: '2',  color: '#475569' },
  { mult: '5',  color: '#EA580C' },
  { mult: '3',  color: '#8B5CF6' }
];

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const outerRadius = 140;
const innerRadius = 72;

// High-Resolution Crisp Donut Wheel Rendering with Multiplier Labels
function renderDetailedWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const totalSegments = 32;
  const anglePerSegment = (2 * Math.PI) / totalSegments;

  ctx.save();
  ctx.translate(centerX, centerY);

  for (let i = 0; i < totalSegments; i++) {
    // Segment 0 (30 Green) is centered at 12 o'clock (-Math.PI / 2) under needle pointer
    const midAngle = -Math.PI / 2 + i * anglePerSegment;
    const startAngle = midAngle - anglePerSegment / 2;
    const endAngle = midAngle + anglePerSegment / 2;
    const seg = SEGMENTS[i];

    // Draw Arc Segment
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, startAngle, endAngle);
    ctx.arc(0, 0, innerRadius, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = seg.color;
    ctx.fill();

    // Divider Line
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#0A0C11';
    ctx.stroke();

    // Outer LED divider dot at segment boundary
    const dotX = Math.cos(startAngle) * (outerRadius - 3);
    const dotY = Math.sin(startAngle) * (outerRadius - 3);
    ctx.beginPath();
    ctx.arc(dotX, dotY, 1.5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
  }

  ctx.restore();
}

renderDetailedWheel();

function selectChip(amount, btn) {
  selectedChipRupees = amount;
  document.querySelectorAll('.chip-btn-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function handleBack() {
  if (window.AndroidBridge && window.AndroidBridge.closeGame) {
    window.AndroidBridge.closeGame();
  } else {
    window.history.back();
  }
}

function handleDeposit() {
  if (window.AndroidBridge && window.AndroidBridge.openDeposit) {
    window.AndroidBridge.openDeposit();
  } else {
    window.location.href = serverBaseUrl + '/pay?amount=500';
  }
}

let localBets = { '2x': 0, '3x': 0, '5x': 0, '30x': 0 };
let hasCreditedLocalWinForRound = null;

async function handleBet(multiplierType) {
  if (currentPhase !== 'BETTING') {
    showGameNotice('Bets are closed for this round', 'warning');
    return;
  }

  const serverUrl = getServerUrl();
  const token = getAuthToken();
  const uid = getUserId();
  const betAmountPaise = Math.round(selectedChipRupees * 100);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (uid) headers['X-User-Id'] = uid;

    const res = await fetch(serverUrl + '/api/v1/ring-of-future/bet', {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId: uid, multiplierType, amountRupees: selectedChipRupees, token: token })
    });
    const data = await res.json();
    if (data.success) {
      updateUI(data.data);
      if (data.data && data.data.wallet && window.AndroidBridge && window.AndroidBridge.syncWalletBalance) {
        try {
          if (data.data.wallet.totalPaise > 0) {
            window.AndroidBridge.syncWalletBalance(data.data.wallet.totalPaise);
          }
        } catch (_) {}
      }
      return;
    } else if (data.message && data.message.toLowerCase().includes('insufficient')) {
      showGameNotice('Insufficient balance — Tap + to deposit', 'error');
      triggerWalletShake();
      return;
    } else if (data.message) {
      showGameNotice(data.message, 'warning');
      return;
    }
  } catch (_) {}

  // Resilient Native Bridge Fallback: Place bet directly in app's WalletLedger
  if (window.AndroidBridge && window.AndroidBridge.placeLocalBet) {
    try {
      const success = window.AndroidBridge.placeLocalBet(betAmountPaise, currentRoundId);
      if (success) {
        localBets[multiplierType] = (localBets[multiplierType] || 0) + betAmountPaise;
        updateWalletDisplay();

        const badgeId = multiplierType === '2x' ? 'badge2x' : multiplierType === '3x' ? 'badge3x' : multiplierType === '5x' ? 'badge5x' : 'badge30x';
        const badgeTextId = multiplierType === '2x' ? 'badgeText2x' : multiplierType === '3x' ? 'badgeText3x' : multiplierType === '5x' ? 'badgeText5x' : 'badgeText30x';
        const tileId = multiplierType === '2x' ? 'tile2x' : multiplierType === '3x' ? 'tile3x' : multiplierType === '5x' ? 'tile5x' : 'tile30x';
        const currText = document.getElementById(badgeTextId).innerText;
        const prevVal = parseInt(currText || '0', 10) || 0;
        const newVal = prevVal + selectedChipRupees;
        updateTileBadge(badgeId, badgeTextId, tileId, newVal * 100);
        return;
      } else {
        showGameNotice('Insufficient balance — Tap + to deposit', 'error');
        triggerWalletShake();
        return;
      }
    } catch (_) {}
  }

  showGameNotice('Unable to place bet. Please retry', 'error');
}

function updateUI(data) {
  if (!data) return;
  const state = data.gameState;
  const wallet = data.wallet;

  currentPhase = state.phase;
  
  // Update wallet balance smoothly: from local bridge or server
  if (wallet && wallet.totalPaise !== undefined) {
    updateWalletDisplay(wallet.totalPaise);
  } else {
    updateWalletDisplay();
  }

  document.getElementById('hubSeconds').innerText = state.secondsRemaining + 's';

  if (state.phase === 'BETTING') {
    // New round opened: update the currentRoundId so subsequent bets are tagged correctly
    if (state.roundId && currentRoundId !== state.roundId) {
      currentRoundId = state.roundId;
    }
    localBets = { '2x': 0, '3x': 0, '5x': 0, '30x': 0 };
    document.getElementById('hubStatus').innerText = 'PLACE BETS';
    document.getElementById('hubSeconds').style.color = '#34D399';
    // Always show 30x Green centered under needle during loading / bet placing
    const targetDeg = Math.ceil(currentRotationDeg / 360) * 360;
    if (currentRotationDeg !== targetDeg && !isSpinningAnimation) {
      canvas.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
      canvas.style.transform = `rotate(${targetDeg}deg) translate3d(0, 0, 0)`;
      currentRotationDeg = targetDeg;
    }
  } else if (state.phase === 'LOCKED') {
    // Betting is now closed — flush the round's accumulated bets as a single transaction
    if (window.AndroidBridge && window.AndroidBridge.commitRoundBets) {
      try { window.AndroidBridge.commitRoundBets(); } catch (_) {}
    }
    document.getElementById('hubStatus').innerText = 'LOCKED';
    document.getElementById('hubSeconds').style.color = '#F59E0B';
  } else if (state.phase === 'SPINNING') {
    document.getElementById('hubStatus').innerText = 'SPINNING';
    document.getElementById('hubSeconds').style.color = '#A78BFA';
    if (lastSpunRoundId !== state.roundId) {
      lastSpunRoundId = state.roundId;
      triggerSpin(state.winningSegmentIndex);
    }
  } else if (state.phase === 'RESULT_SHOW') {
    document.getElementById('hubStatus').innerText = 'WIN: ' + state.winningType;
    document.getElementById('hubSeconds').style.color = '#34D399';

    // Check if user won a locally placed bet
    if (hasCreditedLocalWinForRound !== state.roundId) {
      hasCreditedLocalWinForRound = state.roundId;
      const winnerKey = state.winningType;
      const betOnWin = localBets[winnerKey] || 0;
      if (betOnWin > 0) {
        const mult = winnerKey === '30x' ? 30 : parseInt(winnerKey, 10);
        const winPaise = betOnWin * mult;
        if (window.AndroidBridge && window.AndroidBridge.creditLocalWinnings) {
          window.AndroidBridge.creditLocalWinnings(winPaise, winnerKey);
          updateWalletDisplay();
        }
        showWin((winPaise / 100).toFixed(0));
      }
    }
  }

  // Update Badges & Active Tile Outlines (NUMBERS ONLY)
  const b2x = (state.userBets && state.userBets.grey2x) || localBets['2x'] || 0;
  const b3x = (state.userBets && state.userBets.purple3x) || localBets['3x'] || 0;
  const b5x = (state.userBets && state.userBets.orange5x) || localBets['5x'] || 0;
  const b30x = (state.userBets && state.userBets.green30x) || localBets['30x'] || 0;
  updateTileBadge('badge2x', 'badgeText2x', 'tile2x', b2x);
  updateTileBadge('badge3x', 'badgeText3x', 'tile3x', b3x);
  updateTileBadge('badge5x', 'badgeText5x', 'tile5x', b5x);
  updateTileBadge('badge30x', 'badgeText30x', 'tile30x', b30x);

  // Render History
  renderHistory(state.recentResults || []);
}

function updateTileBadge(badgeId, textId, tileId, paise) {
  const badge = document.getElementById(badgeId);
  const text = document.getElementById(textId);
  const tile = document.getElementById(tileId);
  if (paise > 0) {
    text.innerText = (paise / 100).toFixed(0);
    badge.style.display = 'flex';
    tile.classList.add('has-bet');
  } else {
    badge.style.display = 'none';
    tile.classList.remove('has-bet');
  }
}

function renderHistory(results) {
  const row = document.getElementById('historyRow');
  row.innerHTML = results.slice(0, 6).map(type => {
    let cls = 'hp-2x';
    if (type === '3x') cls = 'hp-3x';
    if (type === '5x') cls = 'hp-5x';
    if (type === '30x') cls = 'hp-30x';
    return `<span class="h-pill ${cls}">${type}</span>`;
  }).join('');
}

// 120 FPS GPU Accelerated Spin - Aligns winning segment dead center with needle
function triggerSpin(winningIndex) {
  if (isSpinningAnimation) return;
  isSpinningAnimation = true;

  const totalSegments = 32;
  const degPerSegment = 360 / totalSegments;
  // Segment 0 (30x Green) is centered at 12 o'clock (-90 deg).
  // Segment i is located at (i * degPerSegment) clockwise from 12 o'clock.
  // Rotating clockwise by R brings segment i directly under the 12 o'clock needle:
  const spinOffset = (360 - ((winningIndex * degPerSegment) % 360)) % 360;
  const currentMod = ((currentRotationDeg % 360) + 360) % 360;
  let forwardDegrees = spinOffset - currentMod;
  if (forwardDegrees <= 0) {
    forwardDegrees += 360;
  }
  const extraSpins = 5 * 360; // 5 full dramatic rotations
  const targetDeg = currentRotationDeg + extraSpins + forwardDegrees;
  currentRotationDeg = targetDeg;

  canvas.style.transition = 'transform 4.5s cubic-bezier(0.12, 0.85, 0.22, 1)';
  canvas.style.willChange = 'transform';
  canvas.style.transform = `rotate(${targetDeg}deg) translate3d(0, 0, 0)`;

  setTimeout(() => {
    isSpinningAnimation = false;
  }, 4600);
}

function showWin(amount) {
  const toast = document.getElementById('winToast');
  const amtEl = document.getElementById('winToastAmount');
  if (amtEl) amtEl.innerText = amount;
  if (toast) toast.style.display = 'flex';
}

function hideWin() {
  const toast = document.getElementById('winToast');
  if (toast) toast.style.display = 'none';
}

// Polling Loop with Resilient Auth & State Sync
async function syncLoop() {
  const serverUrl = getServerUrl();
  const token = getAuthToken();
  const uid = getUserId();

  try {
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (uid) headers['X-User-Id'] = uid;

    const params = [];
    if (token) params.push('token=' + encodeURIComponent(token));
    if (uid) params.push('userId=' + encodeURIComponent(uid));
    const queryStr = params.length ? '?' + params.join('&') : '';

    const res = await fetch(serverUrl + '/api/v1/ring-of-future/state' + queryStr, { headers });
    const json = await res.json();
    if (json.success) {
      updateUI(json.data);
      if (json.data && json.data.wallet && window.AndroidBridge && window.AndroidBridge.syncWalletBalance) {
        try {
          if (json.data.wallet.totalPaise > 0) {
            window.AndroidBridge.syncWalletBalance(json.data.wallet.totalPaise);
          }
        } catch (_) {}
      }
    }
  } catch (_) {
    updateWalletDisplay();
  }
}

// Instant local wallet balance on boot
updateWalletDisplay();
setTimeout(() => updateWalletDisplay(), 50);
setTimeout(() => updateWalletDisplay(), 200);
setTimeout(() => updateWalletDisplay(), 600);

setInterval(syncLoop, 1000);
syncLoop();
