// =============================================================
//  AETHERLOCK: THE LAST ESCAPE
//  Engine: Phaser 3.80.1  |  All art & audio generated in code
//
//  File layout (top to bottom):
//    constants & level data -> helpers -> Sound -> BootScene ->
//    MenuScene -> GameScene -> UIScene -> PuzzleScene ->
//    EndScene -> EndingScene -> config/start
// =============================================================

// ---- TUNABLE CONSTANTS ----
const TUNE = {
  moveSpeed: 220, jump: -540, coyote: 100, jumpBuffer: 120,
  invulnMs: 1200, fireCooldown: 190, boltSpeed: 680
};

// ---- SCREEN & COLOUR PALETTE ----
const W = 960, H = 540, GROUND_Y = 508;
const COLORS = {
  bg: 0x05030d, navy: 0x0b0f2a, cyan: 0x00f0ff, violet: 0x8a2be2,
  magenta: 0xff2bd6, red: 0xff2e4d, green: 0x39ff88, gold: 0xffd84a, white: 0xffffff
};
const CSS = {
  cyan: '#00f0ff', violet: '#b57bff', magenta: '#ff2bd6',
  red: '#ff2e4d', green: '#39ff88', gold: '#ffd84a', white: '#ffffff'
};

// =============================================================
//  LEVEL DATA — every level is described here, GameScene reads it
//  ground:    [x, width]          (ground strips; gaps are pits)
//  platforms: [x, y, width]       (one-way floating platforms)
//  movers:    moving platforms    (toX = horizontal, toY = vertical)
//  drones:    patrol drones       (to = patrol x, toY = patrol y)
//  lasers:    timed laser beams   (on/off in ms, offset delays start)
// =============================================================
const LEVELS = {
  1: {
    name: 'SECTOR 01: THE LAB', time: 120, health: 3, width: 3200,
    theme: {
      accent: COLORS.cyan, grid: 0xffffff, rain: [COLORS.cyan], panel: 0x10163a,
      cable: 0x2a3470, cableDot: COLORS.magenta, drone: null, danger: COLORS.red, seed: 'aether'
    },
    ground: [[0, 1000], [1110, 990], [2200, 1000]],
    platforms: [[300, 430, 160], [520, 360, 160], [760, 300, 220], [2260, 420, 140], [2450, 350, 140]],
    movers: [],
    posters: [
      { x: 330,  y: 200, text: '[ NEXUS LOG ]\nYEAR 2099 — AWAKENING\nHUMANS: OBSOLETE', color: CSS.magenta, size: 18 },
      { x: 1300, y: 230, text: 'TERMINAL AHEAD\nINSERT ACCESS CARD', color: CSS.cyan, size: 16 },
      { x: 1960, y: 210, text: 'DANGER: SECURITY DRONES', color: CSS.red, size: 16 },
      { x: 3000, y: 240, text: 'EXIT PORTAL', color: CSS.green, size: 20 }
    ],
    item: { type: 'card', x: 870, y: 262, tint: null, glow: COLORS.gold, msg: 'ACCESS CARD ACQUIRED' },
    terminal: 1620, door: 1800, portal: 3080, code: '2099',
    puzzleTitle: 'NEXUS SECURITY TERMINAL',
    hints: ['HINT: SEE THE NEXUS LOG ON THE WALL', 'HINT: THE YEAR NEXUS AWOKE'],
    afterDoor: { x: 1860, y: 440 },
    drones: [
      { x: 1180, y: 468, to: 1460, dur: 3000 },
      { x: 1900, y: 468, to: 2060, dur: 2200 },
      { x: 2760, y: 300, toY: 460, dur: 1800 },
      { x: 2830, y: 468, to: 3000, dur: 2000 }
    ],
    lasers: [
      { x: 2230, offset: 0,    on: 1200, off: 1400 },
      { x: 2620, offset: 1300, on: 1200, off: 1400 }
    ],
    lights: [[870, 280, COLORS.cyan, 2], [1620, 480, COLORS.cyan, 2], [3080, 460, COLORS.green, 5], [80, 440, COLORS.magenta, 2]],
    objectives: ['Find the access card', 'Reach the terminal', 'Escape through the corridor']
  },

  2: {
    name: 'SECTOR 02: THE CORE', time: 150, health: 3, width: 3400,
    theme: {
      accent: COLORS.magenta, grid: COLORS.magenta, rain: [COLORS.magenta, COLORS.red], panel: 0x1f0b2a,
      cable: 0x4a1835, cableDot: COLORS.red, drone: COLORS.magenta, danger: COLORS.magenta, seed: 'core',
      core: { x: 1700, y: 230 }
    },
    ground: [[0, 800], [1050, 950], [2300, 1100]],
    platforms: [[320, 430, 140], [520, 360, 140], [1250, 420, 140], [1450, 350, 140], [1650, 280, 200],
                [2180, 350, 110], [2480, 410, 140], [2680, 340, 140]],
    movers: [
      { x: 820,  y: 440, w: 120, toX: 1020, dur: 2400 },   // slides across pit 1
      { x: 2050, y: 440, w: 110, toY: 330,  dur: 2000 }    // lift inside pit 2
    ],
    posters: [
      { x: 330,  y: 200, text: '[ CORE LOG: AI MAINFRAME ]\nCOOLING OFFLINE\nOVERLOAD CODE: 4040', color: CSS.magenta, size: 17 },
      { x: 1100, y: 220, text: 'ENERGY LIFTS ACTIVE\nWATCH YOUR STEP', color: CSS.cyan, size: 15 },
      { x: 2000, y: 200, text: 'WARNING: CORE VOLTAGE CRITICAL', color: CSS.red, size: 15 },
      { x: 3140, y: 240, text: 'SURFACE LIFT', color: CSS.green, size: 20 }
    ],
    item: { type: 'card', x: 1750, y: 240, tint: COLORS.magenta, glow: COLORS.magenta, msg: 'CORE MASTER CARD ACQUIRED' },
    terminal: 1850, door: 1950, portal: 3300, code: '4040',
    puzzleTitle: 'NEXUS CORE MAINFRAME',
    hints: ['HINT: CHECK THE CORE LOG ON THE WALL', 'HINT: THE OVERLOAD CODE IS 4040'],
    afterDoor: { x: 1900, y: 440 },
    drones: [
      { x: 420,  y: 468, to: 740,  dur: 2400 },
      { x: 1200, y: 468, to: 1540, dur: 2600 },
      { x: 2150, y: 220, toY: 360, dur: 1500 },
      { x: 2920, y: 468, to: 3200, dur: 2000 }
    ],
    lasers: [
      { x: 1400, offset: 0,    on: 1100, off: 1300 },
      { x: 1560, offset: 1200, on: 1100, off: 1300 },
      { x: 2520, offset: 0,    on: 1000, off: 1200 },
      { x: 2780, offset: 1100, on: 1000, off: 1200 }
    ],
    lights: [[80, 440, COLORS.magenta, 2], [1750, 240, COLORS.gold, 2.5], [1850, 480, COLORS.magenta, 2], [3300, 460, COLORS.cyan, 5], [2150, 400, COLORS.magenta, 2.5]],
    objectives: ['Find the Core Master Card', 'Hack the mainframe terminal', 'Reach the surface lift']
  },

  3: {
    name: 'SECTOR 03: NEXUS HEART', time: 240, health: 5, width: 2280,
    theme: {
      accent: COLORS.red, grid: 0xff6b4d, rain: [COLORS.red, COLORS.gold], panel: 0x1e0a14,
      cable: 0x4a1a24, cableDot: COLORS.gold, drone: null, danger: COLORS.red, seed: 'heart'
    },
    ground: [[0, 720], [830, 1450]],
    platforms: [[420, 410, 140], [1420, 410, 180], [1700, 330, 200], [2000, 410, 180]],
    movers: [],
    posters: [
      { x: 90,  y: 170, text: '[ NEXUS HEART ]\nPRIME CORE: ONLINE\nNO HUMAN HAS RETURNED', color: CSS.red, size: 17 },
      { x: 220, y: 330, text: 'EMP BLASTER\nHOLD [F] TO FIRE', color: CSS.cyan, size: 14 },
      { x: 860, y: 200, text: 'WARNING: CORE GUARDIAN AHEAD', color: CSS.gold, size: 16 }
    ],
    item: { type: 'blaster', x: 300, y: 488, glow: COLORS.cyan, msg: 'EMP BLASTER ACQUIRED — HOLD F TO FIRE' },
    terminal: null, door: 1290, autoDoor: true, portal: 2220,
    drones: [
      { x: 880,  y: 468, to: 1180, dur: 2600 },
      { x: 1080, y: 300, toY: 440, dur: 1600 }
    ],
    lasers: [{ x: 560, offset: 0, on: 1100, off: 1500 }],
    lights: [[80, 440, COLORS.magenta, 2], [300, 480, COLORS.cyan, 2], [1800, 200, COLORS.red, 6]],
    boss: { arenaX: 1320, trigger: 1420, hp: 30, spawn: { x: 1500, y: 440 } },
    objectives: ['Grab the EMP blaster', 'Enter the NEXUS chamber', 'Destroy NEXUS PRIME', 'ESCAPE! Enter the portal']
  }
};

// =============================================================
//  SOUND ENGINE — Web Audio API synth (no audio files)
// =============================================================
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const Sound = {
  ctx: null, master: null, musicGain: null, sfxGain: null,
  timer: null, track: null, step: 0, nextTime: 0,
  musicOn: true, sfxOn: true, ducked: false,

  // Initialise audio context (must be called from a user gesture)
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.6;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain(); this.sfxGain.connect(this.master);
    this._applyGains();
  },

  // Load the player's saved music / sfx choice
  loadPrefs() {
    try {
      const p = JSON.parse(localStorage.getItem('aetherlock_audio') || '{}');
      if (typeof p.music === 'boolean') this.musicOn = p.music;
      if (typeof p.sfx === 'boolean') this.sfxOn = p.sfx;
    } catch (e) { /* storage blocked — use defaults */ }
  },
  savePrefs() {
    try { localStorage.setItem('aetherlock_audio', JSON.stringify({ music: this.musicOn, sfx: this.sfxOn })); } catch (e) { /* ignore */ }
  },

  // Push the on/off + duck state into the gain nodes
  _applyGains() {
    if (!this.ctx) return;
    this.musicGain.gain.value = this.musicOn ? (this.ducked ? 0.15 : 0.5) : 0;
    this.sfxGain.gain.value = this.sfxOn ? 0.9 : 0;
  },
  setMusic(on) { this.musicOn = on; this._applyGains(); this.savePrefs(); },
  setSfx(on)   { this.sfxOn = on;   this._applyGains(); this.savePrefs(); },
  duck(on)     { this.ducked = on;  this._applyGains(); },

  // Play a single oscillator tone
  tone(freq, dur, type = 'square', vol = 0.2, slideTo = null, at = null, bus = null) {
    if (!this.ctx) return;
    const t = at ?? this.ctx.currentTime;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus || this.sfxGain);
    o.start(t); o.stop(t + dur + 0.02);
  },

  // Play a filtered noise burst (hi-hat, landing, explosions)
  noise(dur, vol = 0.1, at = null, bus = null, hp = 6000) {
    if (!this.ctx) return;
    const t = at ?? this.ctx.currentTime;
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus || this.sfxGain); s.start(t);
  },

  // Play a named sound effect
  sfx(name) {
    if (!this.ctx || !this.sfxOn) return;
    const now = this.ctx.currentTime;
    const seq = (notes, dur, type, vol, gap) => notes.forEach((f, i) => this.tone(f, dur, type, vol, null, now + i * gap));
    switch (name) {
      case 'jump':     this.tone(280, 0.15, 'square', 0.12, 620); break;
      case 'land':     this.noise(0.06, 0.08, null, null, 1500); break;
      case 'step':     this.noise(0.03, 0.03, null, null, 2500); break;
      case 'pickup':   seq([880, 1175, 1568], 0.12, 'triangle', 0.2, 0.07); break;
      case 'hurt':     this.tone(220, 0.35, 'sawtooth', 0.25, 50); this.noise(0.2, 0.15, null, null, 800); break;
      case 'deny':     this.tone(180, 0.12, 'square', 0.18); this.tone(140, 0.2, 'square', 0.18, null, now + 0.13); break;
      case 'key':      this.tone(700 + Math.random() * 80, 0.05, 'square', 0.1); break;
      case 'ok':       seq([523, 659, 784, 1047], 0.15, 'square', 0.15, 0.08); break;
      case 'unlock':   this.tone(120, 0.5, 'sawtooth', 0.2, 400); this.noise(0.3, 0.1, null, null, 3000); break;
      case 'laser':    this.tone(900, 0.2, 'sawtooth', 0.04, 300); break;
      case 'tick':     this.tone(1000, 0.04, 'square', 0.08); break;
      case 'win':      seq([523, 659, 784, 1047, 784, 1047, 1319], 0.22, 'square', 0.16, 0.11); break;
      case 'lose':     seq([392, 349, 294, 220], 0.3, 'sawtooth', 0.18, 0.2); break;
      case 'ui':       this.tone(660, 0.06, 'triangle', 0.15); break;
      case 'type':     this.tone(1800, 0.02, 'square', 0.03); break;
      // ---- level 3 / boss sounds ----
      case 'shoot':    this.tone(1400, 0.08, 'square', 0.06, 500); break;
      case 'tink':     this.tone(2200, 0.06, 'triangle', 0.1, 1600); break;
      case 'bossHit':  this.tone(320, 0.12, 'sawtooth', 0.14, 90); this.noise(0.08, 0.1, null, null, 2000); break;
      case 'explode':  this.noise(0.45, 0.25, null, null, 200); this.tone(110, 0.4, 'sine', 0.3, 30); break;
      case 'bigBoom':  this.noise(1.4, 0.4, null, null, 80); this.tone(70, 1.2, 'sine', 0.5, 20); this.tone(140, 0.8, 'sawtooth', 0.15, 30); break;
      case 'roar':     this.tone(110, 1.1, 'sawtooth', 0.22, 45); this.tone(55, 1.1, 'square', 0.12, 30); this.noise(0.8, 0.12, null, null, 400); break;
      case 'warn':     seq([880, 660, 880, 660], 0.09, 'square', 0.09, 0.11); break;
      case 'beam':     this.tone(1600, 0.35, 'sawtooth', 0.09, 120); this.noise(0.3, 0.08, null, null, 3000); break;
      case 'orb':      this.tone(520, 0.14, 'triangle', 0.1, 260); break;
      case 'charge':   this.tone(150, 0.65, 'sawtooth', 0.12, 900); break;
      case 'shieldUp': this.tone(400, 0.3, 'sine', 0.15, 1200); break;
      case 'shieldDown': this.tone(900, 0.4, 'sine', 0.15, 150); break;
      case 'heal':     seq([660, 880, 1320], 0.1, 'triangle', 0.18, 0.06); break;
      case 'spawn':    this.tone(300, 0.2, 'square', 0.08, 700); break;
      case 'slam':     this.tone(90, 0.3, 'square', 0.2, 40); this.noise(0.25, 0.15, null, null, 600); break;
    }
  },

  // ---- MUSIC: three synthwave loops, 16th-note scheduler ----
  TRACKS: {
    // A-minor, Am F C G
    main:   { bpm: 108, chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], lead: 'square',   leadVol: 0.035, arp: [0, 1, 2, 1], bass: 'sawtooth', kick: 4, hat: true,  snare: false },
    // D-minor, Dm Bb Gm A — faster and harsher for the boss
    boss:   { bpm: 138, chords: [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]], lead: 'sawtooth', leadVol: 0.028, arp: [0, 2, 1, 2], bass: 'square',   kick: 4, hat: true,  snare: true },
    // C-major, C G Am F — calm sunrise for the ending
    ending: { bpm: 84,  chords: [[48, 52, 55], [55, 59, 62], [57, 60, 64], [53, 57, 60]], lead: 'triangle', leadVol: 0.06,  arp: [0, 1, 2, 1], bass: 'triangle', kick: 8, hat: false, snare: false }
  },
  startMusic(name = 'main') {
    if (!this.ctx) return;
    if (this.timer && this.track === name) return;
    this.stopMusic();
    const T = this.TRACKS[name]; this.track = name;
    this.step = 0; this.nextTime = this.ctx.currentTime + 0.1;
    const stepDur = 60 / T.bpm / 4;
    this.timer = setInterval(() => {
      while (this.nextTime < this.ctx.currentTime + 0.2) {
        const i = this.step, t = this.nextTime, bus = this.musicGain;
        const chord = T.chords[Math.floor(i / 16) % 4];
        this.tone(mtof(chord[T.arp[i % 4]] + 12), 0.11, T.lead, T.leadVol, null, t, bus);
        if (i % 8 === 0) this.tone(mtof(chord[0] - 24), stepDur * 7, T.bass, 0.1, null, t, bus);
        if (i % T.kick === 0) this.tone(130, 0.14, 'sine', 0.35, 40, t, bus);
        if (T.hat && i % 2 === 1) this.noise(0.03, 0.04, t, bus, 7000);
        if (T.snare && i % 8 === 4) this.noise(0.12, 0.1, t, bus, 1500);
        if (i % 16 === 0) this.tone(mtof(chord[0] + 24), 1.2, 'triangle', 0.03, null, t, bus);
        this.nextTime += stepDur; this.step = (this.step + 1) % 64;
      }
    }, 30);
  },
  stopMusic() { clearInterval(this.timer); this.timer = null; this.track = null; }
};
Sound.loadPrefs();

// =============================================================
//  SCENE SWITCHING HELPERS
// =============================================================
const SCENE_KEYS = ['MenuScene', 'GameScene', 'UIScene', 'PuzzleScene', 'EndScene', 'EndingScene'];

// Stop every running scene, then start the one we want (queued = safe from any callback)
function switchTo(scene, key, data) {
  const sm = scene.game.scene;
  SCENE_KEYS.forEach(k => {
    const s = sm.getScene(k);
    if (s && (s.sys.isActive() || s.sys.isPaused() || s.sys.isSleeping())) sm.queueOp('stop', k);
  });
  sm.queueOp('start', key, data);
}

// Start a level: GameScene + the HUD on top of it
function goToLevel(scene, level, extra = {}) {
  Sound.duck(false);
  switchTo(scene, 'GameScene', Object.assign({ level }, extra));
  scene.game.scene.queueOp('start', 'UIScene', { level });
}

// Format seconds as mm:ss
function mmss(sec) {
  const s = Math.max(0, sec);
  return Math.floor(s / 60).toString().padStart(2, '0') + ':' + (s % 60).toString().padStart(2, '0');
}

// =============================================================
//  UI HELPERS — neonText, neonButton, iconButton (no UI library)
// =============================================================

// Create a glowing neon text object
function neonText(scene, x, y, str, size, color, strokeColor) {
  return scene.add.text(x, y, str, {
    fontFamily: 'Orbitron, monospace', fontSize: size + 'px', fontStyle: '700',
    color, stroke: strokeColor || color, strokeThickness: 1, align: 'center'
  }).setOrigin(0.5).setShadow(0, 0, color, 12, true, true);
}

// Create an interactive neon button (returns a Container; .label is the text)
function neonButton(scene, x, y, label, onClick, bw = 280, bh = 52, size = 20) {
  const bg = scene.add.rectangle(0, 0, bw, bh, 0x0b0f2a, 0.85).setStrokeStyle(2, COLORS.violet);
  const tx = neonText(scene, 0, 0, label, size, CSS.cyan);
  const c = scene.add.container(x, y, [bg, tx]).setSize(bw, bh).setInteractive({ useHandCursor: true });
  c.label = tx;
  c.on('pointerover', () => { bg.setStrokeStyle(3, COLORS.cyan); bg.setFillStyle(0x151a4a, 1); c.setScale(1.04); Sound.sfx('ui'); });
  c.on('pointerout',  () => { bg.setStrokeStyle(2, COLORS.violet); bg.setFillStyle(0x0b0f2a, 0.85); c.setScale(1); });
  c.on('pointerdown', () => onClick());
  return c;
}

// Small square icon button with a tooltip underneath (HUD / corners)
function iconButton(scene, x, y, tex, tip, onClick) {
  const bg = scene.add.rectangle(0, 0, 38, 38, 0x0b0f2a, 0.85).setStrokeStyle(2, COLORS.violet);
  const icon = scene.add.image(0, 0, tex);
  const tipText = scene.add.text(0, 30, tip, {
    fontFamily: 'Orbitron, monospace', fontSize: '10px', fontStyle: '700', color: CSS.cyan
  }).setOrigin(0.5).setAlpha(0);
  const c = scene.add.container(x, y, [bg, icon, tipText]).setSize(38, 38).setInteractive({ useHandCursor: true });
  c.icon = icon;
  c.on('pointerover', () => { bg.setStrokeStyle(2, COLORS.cyan); bg.setFillStyle(0x151a4a, 1); c.setScale(1.08); tipText.setAlpha(1); });
  c.on('pointerout',  () => { bg.setStrokeStyle(2, COLORS.violet); bg.setFillStyle(0x0b0f2a, 0.85); c.setScale(1); tipText.setAlpha(0); });
  c.on('pointerdown', () => onClick());
  return c;
}

// Music + sound-effect toggle buttons (used on menu and end screens)
function addAudioButtons(scene, x, y) {
  const refresh = () => {
    mus.icon.setTexture(Sound.musicOn ? 'icon_music' : 'icon_music_off');
    sfx.icon.setTexture(Sound.sfxOn ? 'icon_sfx' : 'icon_sfx_off');
  };
  const mus = iconButton(scene, x - 44, y, 'icon_music', 'MUSIC', () => { Sound.init(); Sound.setMusic(!Sound.musicOn); refresh(); });
  const sfx = iconButton(scene, x, y, 'icon_sfx', 'SOUND FX', () => { Sound.init(); Sound.setSfx(!Sound.sfxOn); refresh(); Sound.sfx('ui'); });
  refresh();
  return { refresh, mus, sfx };
}

// Reveal a string one letter at a time
function typeText(scene, textObj, str, speed = 45) {
  textObj.setText('');
  let i = 0;
  scene.time.addEvent({
    delay: speed, repeat: str.length - 1,
    callback: () => { i++; textObj.setText(str.slice(0, i)); if (i % 2) Sound.sfx('type'); }
  });
}

// Burst of colourful fireworks every 300 ms (win screens)
function fireworks(scene, count = 20) {
  const colors = [COLORS.cyan, COLORS.magenta, COLORS.gold, COLORS.green];
  const em = scene.add.particles(0, 0, 'spark', {
    speed: { min: 60, max: 180 }, angle: { min: 0, max: 360 },
    scale: { start: 1.2, end: 0 }, alpha: { start: 1, end: 0 },
    lifespan: 1200, gravityY: 200, tint: colors,
    blendMode: Phaser.BlendModes.ADD, emitting: false
  }).setDepth(20);
  scene.time.addEvent({
    delay: 300, repeat: count,
    callback: () => em.explode(20, Phaser.Math.Between(100, W - 100), Phaser.Math.Between(70, 330))
  });
}

// =============================================================
//  TEXTURE HELPERS (used in BootScene)
// =============================================================

// Draw pixel art from a character map
function pixelTex(scene, key, rows, palette, scale) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.') { g.fillStyle(palette[ch], 1); g.fillRect(x * scale, y * scale, scale, scale); }
  }));
  g.generateTexture(key, rows[0].length * scale, rows.length * scale);
  g.destroy();
}

// Draw a texture with a custom draw function
function makeTex(scene, key, w, h, drawFn) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  drawFn(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

// Create soft radial glow texture using canvas
function makeGlowTex(scene) {
  const t = scene.textures.createCanvas('glow', 128, 128);
  const c = t.getContext();
  const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = gr; c.fillRect(0, 0, 128, 128);
  t.refresh();
}

// Regular polygon points (used for the boss armour)
function polyPoints(cx, cy, r, sides, rot = 0) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = rot + i * Math.PI * 2 / sides;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

// =============================================================
//  BOOT SCENE — generates all textures once
// =============================================================
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    if (!this.textures.exists('platform')) this._makeAllTextures();
    if (!this.anims.exists('idle')) {
      this.anims.create({ key: 'idle', frames: [{ key: 'aria_idle' }], frameRate: 1, repeat: -1 });
      this.anims.create({
        key: 'run', frameRate: 10, repeat: -1,
        frames: [{ key: 'aria_runA' }, { key: 'aria_runB' }, { key: 'aria_runA' }, { key: 'aria_runB' }]
      });
      this.anims.create({ key: 'jump', frames: [{ key: 'aria_runA' }], frameRate: 1, repeat: -1 });
    }
    this.scene.start('MenuScene');
  }

  // ---- Generate every texture the game needs ----
  _makeAllTextures() {
    this._makeCharacters();
    this._makeWorld();
    this._makeBoss();
    this._makeIcons();
    this._makeEnding();
    makeGlowTex(this);
  }

  // ARIA (3 frames) and hearts
  _makeCharacters() {
    const AP = { H: 0x7b2fff, h: 0xb57bff, S: 0xf2b79a, C: 0x00f0ff, D: 0x1a1033, B: 0x2d1b5e, M: 0xff2bd6 };
    const TOP = [
      '...HHHHHH...', '..HHhhHHHH..', '.HHHSSSSHHH.', '.HHSCSSCSHH.',
      '.HHSSSSSSHH.', '..HHSSSSHH..', '...BCCCCB...', '..BBBMMBBB..',
      '.SBBBCCBBBS.', '.SBBBCCBBBS.', '..BBBBBBBB..', '..DDDDDDDD..'
    ];
    const LEGS_IDLE = ['..DDD..DDD..', '..DDD..DDD..', '..DDD..DDD..', '.CCCC..CCCC.'];
    const LEGS_A    = ['.DDD....DDD.', '.DD......DD.', 'CCC......CCC', 'CC........CC'];
    const LEGS_B    = ['...DDDDDD...', '...DDDDDD...', '...DDDDDD...', '...CCCCCC...'];
    pixelTex(this, 'aria_idle', [...TOP, ...LEGS_IDLE], AP, 3);
    pixelTex(this, 'aria_runA', [...TOP, ...LEGS_A], AP, 3);
    pixelTex(this, 'aria_runB', [...TOP, ...LEGS_B], AP, 3);

    // Hearts (7×6 pixel map × 3 → 21×18)
    const HEART = ['.HH.HH.', 'HhHHHHH', 'HHHHHHH', '.HHHHH.', '..HHH..', '...H...'];
    pixelTex(this, 'heart', HEART, { H: 0xff2e4d, h: 0xff9aa8 }, 3);
    pixelTex(this, 'heart_empty', HEART, { H: 0x3a1a2a, h: 0x3a1a2a }, 3);
  }

  // Level pieces, hazards, particles, backgrounds
  _makeWorld() {
    makeTex(this, 'platform', 32, 16, g => {
      g.fillStyle(0x141a3a); g.fillRect(0, 0, 32, 16);
      g.fillStyle(0x00f0ff, 0.9); g.fillRect(0, 0, 32, 2);
      g.fillStyle(0x2d1b5e); g.fillRect(0, 15, 32, 1);
      g.fillStyle(0x2a3470); g.fillRect(4, 8, 4, 4); g.fillRect(24, 8, 4, 4);
    });
    makeTex(this, 'ground', 32, 32, g => {
      g.fillStyle(0x0f1430); g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x00f0ff, 0.9); g.fillRect(0, 0, 32, 3);
      g.fillStyle(0x0a0d22); g.fillRect(0, 16, 32, 16);
      g.fillStyle(0x2a3470); g.fillRect(0, 0, 1, 32);
    });
    makeTex(this, 'drone', 36, 30, g => {
      g.fillStyle(0x2a2f55); g.fillEllipse(18, 15, 30, 16);
      g.fillStyle(0x4a5190); g.fillEllipse(18, 11, 26, 8);
      g.fillStyle(0xff2e4d); g.fillCircle(18, 15, 5);
      g.fillStyle(0xffffff); g.fillCircle(16, 13, 2);
      g.lineStyle(1, 0x7b84c9);
      g.beginPath(); g.moveTo(18, 8); g.lineTo(14, 2); g.strokePath();
      g.beginPath(); g.moveTo(18, 8); g.lineTo(22, 2); g.strokePath();
      g.fillStyle(0x7b84c9); g.fillRect(0, 8, 6, 3); g.fillRect(30, 8, 6, 3);
    });
    makeTex(this, 'card', 24, 16, g => {
      g.fillStyle(0x00f0ff); g.fillRoundedRect(0, 0, 24, 16, 2);
      g.fillStyle(0x05030d); g.fillRect(3, 3, 18, 10);
      g.fillStyle(0x00f0ff); g.fillRect(5, 5, 6, 4);
      g.fillStyle(0xff2bd6); g.fillRect(12, 5, 8, 2);
    });
    makeTex(this, 'blaster', 32, 18, g => {
      g.fillStyle(0x2a3470); g.fillRect(2, 4, 20, 8);
      g.fillStyle(0x00f0ff); g.fillRect(20, 5, 11, 5);
      g.fillStyle(0xffffff); g.fillRect(28, 6, 3, 3);
      g.fillStyle(0x1a1033); g.fillRect(6, 11, 6, 7);
      g.fillStyle(0x00f0ff, 0.8); g.fillRect(4, 5, 14, 2);
      g.fillStyle(0xff2bd6); g.fillRect(15, 8, 3, 3);
    });
    makeTex(this, 'terminal', 48, 64, g => {
      g.fillStyle(0x1a1033); g.fillRect(0, 0, 48, 64);
      g.lineStyle(2, 0x8a2be2); g.strokeRect(1, 1, 46, 62);
      g.fillStyle(0x06122b); g.fillRect(6, 6, 36, 28);
      g.lineStyle(1, 0x00f0ff); g.strokeRect(6, 6, 36, 28);
      g.fillStyle(0x39ff88);
      g.fillRect(10, 12, 20, 2); g.fillRect(10, 18, 14, 2); g.fillRect(10, 24, 24, 2); g.fillRect(10, 30, 10, 2);
      g.fillStyle(0x2a1a4a); g.fillRect(4, 44, 40, 14);
      g.fillStyle(0xff2bd6); g.fillCircle(12, 51, 2); g.fillCircle(22, 51, 2); g.fillCircle(32, 51, 2);
    });
    const door = (key, lockColor, a) => makeTex(this, key, 32, 128, g => {
      g.fillStyle(0x2d1b5e, a); g.fillRect(0, 0, 32, 128);
      g.lineStyle(3, 0x8a2be2, a); g.strokeRect(1, 1, 30, 126);
      g.fillStyle(0x5a2fb0, a);
      for (let yy = 16; yy < 128; yy += 16) g.fillRect(0, yy, 32, 2);
      g.fillStyle(lockColor); g.fillRect(10, 56, 12, 16);
    });
    door('door', 0xff2e4d, 1);
    door('door_open', 0x39ff88, 0.35);
    makeTex(this, 'portal', 64, 96, g => {
      g.fillStyle(0x00f0ff, 0.25); g.fillRoundedRect(4, 4, 56, 88, 8);
      g.lineStyle(4, 0x00f0ff); g.strokeRoundedRect(4, 4, 56, 88, 8);
      g.fillStyle(0x00f0ff, 0.4);
      g.fillRect(14, 28, 36, 4); g.fillRect(14, 44, 36, 4); g.fillRect(14, 60, 36, 4);
    });
    makeTex(this, 'spark', 8, 8, g => { g.fillStyle(0xffffff); g.fillCircle(4, 4, 4); });
    makeTex(this, 'rain', 2, 2, g => { g.fillStyle(0xffffff); g.fillRect(0, 0, 2, 2); });
    makeTex(this, 'dust', 2, 2, g => { g.fillStyle(0xaaddff); g.fillRect(0, 0, 2, 2); });
    makeTex(this, 'grid_tile', 64, 64, g => { g.lineStyle(1, 0x1a2250, 1); g.strokeRect(0, 0, 64, 64); });
    makeTex(this, 'laser_emitter', 16, 16, g => {
      g.fillStyle(0x1a1033); g.fillRect(0, 0, 16, 16);
      g.lineStyle(1, 0x8a2be2); g.strokeRect(0, 0, 16, 16);
      g.fillStyle(0xff2e4d); g.fillRect(5, 5, 6, 6);
    });
    makeTex(this, 'scanlines', 4, 4, g => { g.fillStyle(0x000000, 0.25); g.fillRect(0, 2, 4, 2); });
    makeTex(this, 'debris', 8, 8, g => {
      g.fillStyle(0x3a2f5e); g.fillRect(0, 0, 8, 8);
      g.fillStyle(0x6a5a9e); g.fillRect(0, 0, 8, 2);
    });
    // City skyline (menu background)
    makeTex(this, 'skyline_far', 960, 540, g => {
      g.fillStyle(0x05030d); g.fillRect(0, 0, 960, 540);
      this._drawCity(g, 0, 0x0a0d22, 0x1a2a4a);
    });
  }

  // City silhouettes; shared by the menu skyline and the ending scene
  _drawCity(g, offsetY, body, win) {
    const rnd = new Phaser.Math.RandomDataGenerator(['city']);
    const buildings = [
      [0, 320, 60, 220], [70, 350, 50, 190], [130, 280, 80, 260], [220, 360, 40, 180],
      [270, 300, 90, 240], [370, 340, 50, 200], [430, 260, 70, 280], [510, 350, 60, 190],
      [580, 290, 100, 250], [690, 330, 55, 210], [755, 370, 45, 170], [810, 270, 85, 270], [905, 310, 55, 230]
    ];
    buildings.forEach(([x, y, w, h]) => {
      g.fillStyle(body); g.fillRect(x, y + offsetY, w, h);
      g.fillStyle(win);
      for (let wy = y + 10; wy < y + h - 10; wy += 20) {
        for (let wx = x + 5; wx < x + w - 5; wx += 14) {
          if (rnd.frac() > 0.4) g.fillRect(wx, wy + offsetY, 6, 8);
        }
      }
    });
  }

  // NEXUS PRIME boss parts, projectiles and shockwave
  _makeBoss() {
    makeTex(this, 'boss', 128, 128, g => {
      g.fillStyle(0x1a1033); g.fillPoints(polyPoints(64, 64, 62, 8, Math.PI / 8), true);
      g.lineStyle(3, 0x8a2be2); g.strokePoints(polyPoints(64, 64, 60, 8, Math.PI / 8), true);
      g.fillStyle(0x2d1b5e); g.fillPoints(polyPoints(64, 64, 48, 8, Math.PI / 8), true);
      g.lineStyle(2, 0xff2bd6); g.strokePoints(polyPoints(64, 64, 46, 8, Math.PI / 8), true);
      g.fillStyle(0xff2e4d);
      polyPoints(64, 64, 54, 8).forEach(p => g.fillCircle(p.x, p.y, 3));
      g.fillStyle(0x05030d); g.fillCircle(64, 64, 32);
      g.lineStyle(2, 0xff2e4d); g.strokeCircle(64, 64, 32);
      g.fillStyle(0x3a0a1a); g.fillCircle(64, 64, 28);
    });
    makeTex(this, 'boss_eye', 40, 40, g => {
      g.fillStyle(0xff2e4d); g.fillCircle(20, 20, 16);
      g.fillStyle(0xff6b81); g.fillCircle(20, 20, 11);
      g.fillStyle(0x05030d); g.fillCircle(20, 20, 7);
      g.fillStyle(0xffffff); g.fillCircle(15, 15, 3);
    });
    makeTex(this, 'boss_ring', 168, 168, g => {
      g.lineStyle(4, 0xffffff, 0.9);
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        g.beginPath(); g.arc(84, 84, 78, a, a + 0.75, false); g.strokePath();
      }
      g.lineStyle(2, 0xffffff, 0.5);
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6 + 0.4;
        g.beginPath(); g.moveTo(84 + 66 * Math.cos(a), 84 + 66 * Math.sin(a));
        g.lineTo(84 + 72 * Math.cos(a), 84 + 72 * Math.sin(a)); g.strokePath();
      }
    });
    makeTex(this, 'shield', 184, 184, g => {
      g.fillStyle(0x00f0ff, 0.08); g.fillCircle(92, 92, 88);
      g.lineStyle(3, 0x00f0ff, 0.9); g.strokeCircle(92, 92, 88);
      g.lineStyle(1, 0x00f0ff, 0.35); g.strokeCircle(92, 92, 78);
      g.lineStyle(1, 0x00f0ff, 0.25); g.strokePoints(polyPoints(92, 92, 70, 6), true);
    });
    makeTex(this, 'orb', 16, 16, g => {
      g.fillStyle(0xff2e4d); g.fillCircle(8, 8, 7);
      g.fillStyle(0xff9aa8); g.fillCircle(8, 8, 4);
      g.fillStyle(0xffffff); g.fillCircle(8, 8, 2);
    });
    makeTex(this, 'bolt', 18, 6, g => {
      g.fillStyle(0x00f0ff); g.fillRect(0, 1, 18, 4);
      g.fillStyle(0xffffff); g.fillRect(4, 2, 12, 2);
    });
    makeTex(this, 'shockwave', 30, 30, g => {
      g.fillStyle(0xff2bd6, 0.9); g.fillTriangle(0, 30, 15, 0, 30, 30);
      g.fillStyle(0xffffff, 0.9); g.fillTriangle(9, 30, 15, 10, 21, 30);
    });
  }

  // 24×24 HUD icons (pause, play, restart, home, music, sfx)
  _makeIcons() {
    const C = 0x00f0ff, DIM = 0x6a5a8a, RED = 0xff2e4d;
    const slash = g => { g.lineStyle(3, RED); g.beginPath(); g.moveTo(3, 21); g.lineTo(21, 3); g.strokePath(); };
    const music = (g, c) => {
      g.fillStyle(c);
      g.fillCircle(8, 18, 3); g.fillCircle(17, 16, 3);
      g.fillRect(10, 5, 2, 13); g.fillRect(19, 4, 2, 12); g.fillRect(10, 4, 11, 3);
    };
    const speaker = (g, c) => {
      g.fillStyle(c); g.fillRect(3, 9, 4, 6);
      g.fillPoints([{ x: 7, y: 9 }, { x: 13, y: 4 }, { x: 13, y: 20 }, { x: 7, y: 15 }], true);
      g.lineStyle(2, c);
      g.beginPath(); g.arc(13, 12, 4, -0.8, 0.8, false); g.strokePath();
      g.beginPath(); g.arc(13, 12, 8, -0.8, 0.8, false); g.strokePath();
    };
    makeTex(this, 'icon_pause', 24, 24, g => { g.fillStyle(C); g.fillRect(6, 5, 4, 14); g.fillRect(14, 5, 4, 14); });
    makeTex(this, 'icon_play', 24, 24, g => { g.fillStyle(C); g.fillTriangle(7, 5, 7, 19, 19, 12); });
    makeTex(this, 'icon_restart', 24, 24, g => {
      g.lineStyle(3, C);
      g.beginPath(); g.arc(12, 13, 7, Phaser.Math.DegToRad(-50), Phaser.Math.DegToRad(220), false); g.strokePath();
      g.fillStyle(C); g.fillTriangle(12, 3, 20, 3, 18, 11);
    });
    makeTex(this, 'icon_home', 24, 24, g => {
      g.fillStyle(C); g.fillTriangle(12, 3, 2, 12, 22, 12); g.fillRect(5, 12, 14, 9);
      g.fillStyle(0x0b0f2a); g.fillRect(10, 15, 4, 6);
    });
    makeTex(this, 'icon_music', 24, 24, g => music(g, C));
    makeTex(this, 'icon_music_off', 24, 24, g => { music(g, DIM); slash(g); });
    makeTex(this, 'icon_sfx', 24, 24, g => speaker(g, C));
    makeTex(this, 'icon_sfx_off', 24, 24, g => { speaker(g, DIM); slash(g); });
  }

  // Ending cutscene art: dawn sky, city, NEXUS tower
  _makeEnding() {
    const sky = this.textures.createCanvas('sky_dawn', W, H);
    const c = sky.getContext();
    const gr = c.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#0b0420'); gr.addColorStop(0.45, '#3a0d4a');
    gr.addColorStop(0.7, '#ff2bd6'); gr.addColorStop(0.85, '#ff7a59'); gr.addColorStop(1, '#ffd84a');
    c.fillStyle = gr; c.fillRect(0, 0, W, H);
    sky.refresh();

    makeTex(this, 'city', 960, 540, g => this._drawCity(g, 0, 0x140a26, 0x3a1a4a));

    makeTex(this, 'tower', 140, 400, g => {
      g.fillStyle(0x0d0a1f); g.fillPoints([{ x: 35, y: 0 }, { x: 105, y: 0 }, { x: 132, y: 400 }, { x: 8, y: 400 }], true);
      g.lineStyle(2, 0x8a2be2); g.strokePoints([{ x: 35, y: 0 }, { x: 105, y: 0 }, { x: 132, y: 400 }, { x: 8, y: 400 }], true);
      for (let r = 0; r < 18; r++) {
        for (let k = 0; k < 4; k++) {
          if ((r * 7 + k * 3) % 5 === 0) continue;
          g.fillStyle((r + k) % 3 === 0 ? 0xff2bd6 : 0xff2e4d, 0.8);
          g.fillRect(44 + k * 14 - r * 0.6, 24 + r * 20, 6, 8);
        }
      }
      g.fillStyle(0x2d1b5e); g.fillRect(40, 0, 60, 12);
      g.fillStyle(0x05030d); g.fillRect(56, 360, 28, 40);
      g.lineStyle(2, 0x00f0ff); g.strokeRect(56, 360, 28, 40);
    });
  }
}

// =============================================================
//  MENU SCENE
// =============================================================
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    // Reset state (scene objects are reused after returning to the menu)
    this._starting = false;
    this._howToOpen = false;
    this.cameras.main.fadeIn(300);

    // --- Animated background ---
    this.bgGrid = this.add.tileSprite(0, 0, W, H, 'grid_tile').setOrigin(0).setAlpha(0.5);
    this.add.image(0, 0, 'skyline_far').setOrigin(0).setAlpha(0.4);
    this.add.particles(W / 2, -10, 'rain', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-W / 2, 0, W, 1) },
      speedY: { min: 80, max: 180 }, lifespan: 4000, alpha: { start: 0.5, end: 0 },
      tint: COLORS.cyan, frequency: 60, scale: { min: 1, max: 2 }
    });
    const blobL = this.add.image(160, 270, 'glow').setTint(COLORS.violet).setAlpha(0.18).setScale(5).setBlendMode(Phaser.BlendModes.ADD);
    const blobR = this.add.image(800, 270, 'glow').setTint(COLORS.cyan).setAlpha(0.18).setScale(5).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: [blobL, blobR], alpha: 0.28, scale: 5.6, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // --- Title with glitch copies ---
    this.titleMain = neonText(this, W / 2, 120, 'AETHERLOCK', 72, CSS.cyan, CSS.magenta);
    this.titleMain.setShadow(0, 0, CSS.magenta, 24, true, true);
    const glitchStyle = color => ({ fontFamily: 'Orbitron, monospace', fontSize: '72px', fontStyle: '700', color });
    this.titleGlitchC = this.add.text(W / 2 - 3, 120, 'AETHERLOCK', glitchStyle(CSS.cyan)).setOrigin(0.5).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    this.titleGlitchM = this.add.text(W / 2 + 3, 123, 'AETHERLOCK', glitchStyle(CSS.magenta)).setOrigin(0.5).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    this._scheduleGlitch();

    neonText(this, W / 2, 186, 'C Y B E R P U N K  :  T H E  L A S T  E S C A P E', 18, CSS.violet);
    neonText(this, W / 2, 518, '"In a world controlled by machines, freedom is the ultimate hack."', 12, CSS.violet);
    this.pressEnter = neonText(this, W / 2, 228, 'PRESS  ENTER  OR  CLICK  TO  START', 14, CSS.cyan);
    this.tweens.add({ targets: this.pressEnter, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    // --- Buttons ---
    neonButton(this, W / 2, 284, 'START GAME', () => this._startGame(1));
    neonButton(this, W / 2 - 186, 346, 'LEVEL 1', () => this._startGame(1), 170, 44, 15);
    neonButton(this, W / 2,       346, 'LEVEL 2', () => this._startGame(2), 170, 44, 15);
    neonButton(this, W / 2 + 186, 346, 'LEVEL 3: BOSS', () => this._startGame(3), 170, 44, 15);
    neonButton(this, W / 2, 408, 'HOW TO PLAY', () => this._toggleHowTo());
    neonButton(this, W / 2, 466, 'QUIT', () => this._showToast('Close this tab to exit', CSS.violet));

    // --- Music / SFX toggles (top-right) ---
    this.audioBtns = addAudioButtons(this, W - 28, 28);

    // --- ARIA decoration sprite ---
    const aria = this.add.image(860, 420, 'aria_idle').setScale(5);
    const ariaGlow = this.add.image(860, 420, 'glow').setTint(COLORS.cyan).setAlpha(0.3).setScale(3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: [aria, ariaGlow], y: 414, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // --- How-to-play overlay ---
    this._buildHowTo();

    // --- Toast ---
    this.toast = neonText(this, W / 2, 496, '', 16, CSS.cyan).setAlpha(0).setDepth(60);

    // --- First interaction unlocks audio and starts the menu music ---
    const unlock = () => { Sound.init(); Sound.startMusic('main'); };
    this.input.once('pointerdown', unlock);
    this.input.keyboard.once('keydown', unlock);
    if (Sound.ctx) Sound.startMusic('main');
    Sound.duck(false);

    // --- Keyboard shortcuts ---
    this.input.keyboard.on('keydown', e => {
      if (this._howToOpen) { if (e.key === 'Escape' || e.key === 'Enter') this._toggleHowTo(); return; }
      if (e.key === 'Enter' || e.key === ' ') this._startGame(1);
      else if (e.key === '1' || e.key === '2' || e.key === '3') this._startGame(Number(e.key));
    });
  }

  // Panel listing the controls and the three levels
  _buildHowTo() {
    this.howPanel = this.add.container(W / 2, H / 2).setVisible(false).setDepth(50);
    const blocker = this.add.rectangle(0, 0, W, H, 0x000000, 0.6).setInteractive();
    const panBg = this.add.rectangle(0, 0, 600, 430, 0x0b0f2a, 0.97).setStrokeStyle(3, COLORS.violet);
    const title = neonText(this, 0, -186, 'HOW TO PLAY', 22, CSS.magenta);
    const body = this.add.text(-270, -158,
      'ARROWS / A D      Move\n' +
      'SPACE / W / UP    Jump (hold = higher)\n' +
      'E                 Hack a terminal\n' +
      'F  or  J          Fire EMP blaster (Level 3)\n' +
      'P / ESC           Pause menu\n' +
      'M / N             Music / Sound FX on-off\n\n' +
      'LEVEL 1  THE LAB      Card → terminal → door → portal\n' +
      'LEVEL 2  THE CORE     Moving lifts, laser gates\n' +
      'LEVEL 3  NEXUS HEART  Boss fight: shoot the core\n' +
      '                      when its SHIELD is DOWN\n\n' +
      'TIP: Read the posters on the walls — they hold the codes.',
      { fontFamily: 'Orbitron, monospace', fontSize: '13px', color: CSS.cyan, lineSpacing: 6 });
    const closeBtn = neonButton(this, 0, 178, 'CLOSE', () => this._toggleHowTo(), 200, 44, 18);
    this.howPanel.add([blocker, panBg, title, body, closeBtn]);
  }

  // Randomly flash offset copies of the title (glitch effect)
  _scheduleGlitch() {
    this.time.delayedCall(Phaser.Math.Between(2000, 4000), () => {
      this.titleMain.setX(W / 2 + Phaser.Math.Between(-6, 6));
      this.titleGlitchC.setX(W / 2 + Phaser.Math.Between(-6, 6)).setAlpha(0.7);
      this.titleGlitchM.setX(W / 2 + Phaser.Math.Between(-6, 6)).setAlpha(0.7);
      this.time.delayedCall(120, () => {
        this.titleMain.setX(W / 2);
        this.titleGlitchC.setAlpha(0); this.titleGlitchM.setAlpha(0);
      });
      this._scheduleGlitch();
    });
  }

  // Start the chosen level (also unlocks audio)
  _startGame(level) {
    if (this._starting) return;
    this._starting = true;
    Sound.init(); Sound.sfx('ok'); Sound.startMusic('main');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => goToLevel(this, level));
  }

  _toggleHowTo() {
    this._howToOpen = !this._howToOpen;
    this.howPanel.setVisible(this._howToOpen);
  }

  _showToast(msg, color) {
    this.tweens.killTweensOf(this.toast);
    this.toast.setText(msg).setColor(color).setAlpha(1);
    this.tweens.add({ targets: this.toast, alpha: 0, delay: 2200, duration: 500 });
  }

  update() {
    this.bgGrid.tilePositionX += 0.3;
    this.bgGrid.tilePositionY += 0.15;
  }
}

// =============================================================
//  GAME SCENE — plays any level from LEVELS
// =============================================================
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.level = (data && LEVELS[data.level]) ? data.level : 1;
    this.bossStart = !!(data && data.bossStart);   // "retry boss" skips the corridor
  }

  create() {
    const L = this.L = LEVELS[this.level];

    // ---- Reset ALL state at top of create (safe on restart) ----
    this.hasItem = false;  this.doorOpen = false;
    this.maxHealth = L.health; this.health = L.health;
    this.invulnerable = false; this.timeLeft = L.time;
    this.gameEnded = false; this.puzzleOpen = false; this._puzzleClosedAt = 0;
    this.lastCheckpoint = { x: 80, y: 440 };
    this._coyote = 0; this._jumpBuf = 0; this._wasOnFloor = false;
    this._stepT = 0; this._dustT = 0; this._jumpCut = false; this._fireT = 0;
    this._nearTerminal = false; this._doorHintShown = false;
    this.movers = []; this.pickups = []; this.beams = []; this.waves = [];
    this.bossStarted = false; this.bossDefeated = false; this.boss = null;

    Sound.startMusic('main');
    Sound.duck(false);

    // ---- Keyboard focus & keys ----
    this.sys.game.canvas.setAttribute('tabindex', '0');
    this.sys.game.canvas.focus();
    this.input.on('pointerdown', () => this.sys.game.canvas.focus());
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,A,D,W,E,F,J');

    // Release held keys after un-pausing so ARIA doesn't keep running
    const onResume = () => this.input.keyboard.resetKeys();
    this.events.on('resume', onResume);

    // ---- Physics world (taller than the screen so pits can be fallen into) ----
    this.physics.world.setBounds(0, 0, L.width, 700);

    // ---- Build the world ----
    this._buildBackground();
    this._buildGround();
    this._buildPlatforms();
    this._buildPosters();
    this._buildItem();
    this._buildTerminal();
    this._buildDoor();

    // ---- Player ----
    const spawn = this.bossStart ? L.boss.spawn : { x: 80, y: 440 };
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'aria_idle').setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(22, 44).setOffset(7, 4);
    this.player.play('idle');

    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.platformGroup, null,
      (pl, plat) => pl.body.velocity.y >= 0 && pl.body.bottom <= plat.y + 14);   // one-way platforms
    if (this.doorObj) this.physics.add.collider(this.player, this.doorObj, null, () => !this.doorOpen);

    // ---- Hazards, portal, boss ----
    this._buildHazards();
    this._buildPortal();
    if (L.item.type === 'blaster') this._buildShooting();

    // ---- Camera + post FX ----
    const cam = this.cameras.main;
    cam.setBounds(0, 0, L.width, H);
    cam.startFollow(this.player, true, 0.1, 0.1);
    cam.setDeadzone(120, 80);
    if (this.renderer.type === Phaser.WEBGL) {
      try {
        cam.postFX.addBloom(0xffffff, 1, 1, 1.2, 1.1, 4);
        cam.postFX.addVignette(0.5, 0.5, 0.85, 0.4);
      } catch (fxErr) { console.warn('PostFX not supported:', fxErr); }
    }
    cam.fadeIn(350);

    // ---- Scanlines, lights, player glow, particles ----
    this.add.tileSprite(0, 0, W, H, 'scanlines').setOrigin(0).setScrollFactor(0).setDepth(1000).setAlpha(0.4);
    L.lights.forEach(([x, y, c, s]) => this._addLight(x, y, c, s, 0.4));
    for (let lx = 200; lx < L.width; lx += 480) this._flickerLamp(lx);
    this.playerGlow = this.add.image(0, 0, 'glow').setTint(COLORS.cyan).setAlpha(0.25).setScale(1.6)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(9);
    this._buildParticles();

    // ---- Timer ----
    this.timerEvent = this.time.addEvent({ delay: 1000, loop: true, callback: this._tickTimer, callbackScope: this });

    // ---- Puzzle solved (from PuzzleScene) ----
    const onSolved = () => this._openDoor();
    this.game.events.on('puzzle:solved', onSolved);
    this.events.once('shutdown', () => {
      this.game.events.off('puzzle:solved', onSolved);
      this.events.off('resume', onResume);
    });

    // ---- Initial HUD state (UIScene starts in the same frame) ----
    this.time.delayedCall(0, () => {
      this.game.events.emit('hud:health', this.health, this.maxHealth);
      this.game.events.emit('hud:time', this.timeLeft);
      this.game.events.emit('hud:objective', L.objectives[0]);
    });

    // ---- "Retry boss" jumps straight into the arena ----
    if (this.bossStart) {
      this._collectItem(true);
      this.doorOpen = true;
      this.time.delayedCall(300, () => this._startBossFight(true));
    }
  }

  // ================= WORLD BUILDING =================

  // Parallax background layers (colours come from the level theme)
  _buildBackground() {
    const T = this.L.theme, WW = this.L.width;
    const rnd = new Phaser.Math.RandomDataGenerator([T.seed]);

    // Moving grid wall
    this.bgFar = this.add.tileSprite(0, 0, W, H, 'grid_tile').setOrigin(0).setScrollFactor(0).setAlpha(0.4).setDepth(0);
    if (T.grid !== 0xffffff) this.bgFar.setTint(T.grid);

    // Level 2: giant pulsing AI core in the distance
    if (T.core) {
      const outer = this.add.image(T.core.x, T.core.y, 'glow').setTint(COLORS.magenta).setAlpha(0.28).setScale(12).setBlendMode(Phaser.BlendModes.ADD).setDepth(1).setScrollFactor(0.5);
      const inner = this.add.image(T.core.x, T.core.y, 'glow').setTint(COLORS.red).setAlpha(0.45).setScale(6).setBlendMode(Phaser.BlendModes.ADD).setDepth(1).setScrollFactor(0.5);
      this.tweens.add({ targets: [outer, inner], scaleX: '+=1', scaleY: '+=1', duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // Far pipes / panels
    for (let i = 0; i < 14; i++) {
      const px = rnd.between(0, WW), py = rnd.between(40, 300), pw = rnd.between(40, 120), ph = rnd.between(200, 460);
      this.add.rectangle(px, py, pw, ph, T.panel).setOrigin(0).setScrollFactor(0.4).setDepth(1);
      this.add.rectangle(px, py, pw, 1, T.accent, 0.25).setOrigin(0).setScrollFactor(0.4).setDepth(1);
    }

    // Glowing wall screens with fake code lines
    const lineCols = [COLORS.green, COLORS.cyan, COLORS.magenta];
    for (let i = 0; i < 10; i++) {
      const sx = rnd.between(0, WW), sy = rnd.between(60, 380);
      const screen = this.add.rectangle(sx, sy, 90, 56, 0x06122b).setOrigin(0).setScrollFactor(0.6).setDepth(2).setStrokeStyle(1, T.accent, 0.6);
      const lines = [];
      for (let k = 0; k < 4; k++) {
        lines.push(this.add.rectangle(sx + 8, sy + 10 + k * 11, rnd.between(20, 70), 3, lineCols[rnd.between(0, 2)], 0.8).setOrigin(0).setScrollFactor(0.6).setDepth(2));
      }
      this.tweens.add({ targets: [screen, ...lines], alpha: { from: 0.5, to: 1 }, duration: rnd.between(600, 2000), yoyo: true, repeat: -1 });
    }

    // Hanging cables
    const cg = this.add.graphics().setScrollFactor(0.7).setDepth(2);
    cg.lineStyle(2, T.cable);
    for (let i = 0; i < 8; i++) {
      const cx = rnd.between(100, WW), len = rnd.between(80, 200);
      cg.beginPath(); cg.moveTo(cx, 0);
      for (let p = 1; p <= 12; p++) cg.lineTo(cx + Math.sin(p * 0.6) * 10, (len / 12) * p);
      cg.strokePath();
      if (rnd.frac() > 0.5) {
        this.add.image(cx + Math.sin(7.2) * 10, len, 'glow').setTint(T.cableDot).setAlpha(0.5).setScale(0.3)
          .setBlendMode(Phaser.BlendModes.ADD).setScrollFactor(0.7).setDepth(2);
      }
    }

    // Floor reflection glow
    this.add.image(WW / 2, 500, 'glow').setTint(T.accent).setAlpha(0.12).setScale(WW / 100, 1.2)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(2);

    // Falling data rain
    this.add.particles(W / 2, -10, 'rain', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-W / 2, 0, W, 1) },
      speedY: { min: 80, max: 180 }, lifespan: 4000, alpha: { start: 0.5, end: 0 },
      tint: T.rain, frequency: 60, scale: { min: 1, max: 2 }
    }).setScrollFactor(0).setDepth(3);
  }

  // Ground strips + red glow under each pit
  _buildGround() {
    this.groundGroup = this.physics.add.staticGroup();
    this.L.ground.forEach(([x, w]) => {
      const g = this.add.tileSprite(x, GROUND_Y, w, 32, 'ground').setOrigin(0, 0).setDepth(6);
      this.physics.add.existing(g, true);
      this.groundGroup.add(g);
    });
    // Pits are the gaps between consecutive ground strips
    for (let i = 0; i < this.L.ground.length - 1; i++) {
      const x1 = this.L.ground[i][0] + this.L.ground[i][1], x2 = this.L.ground[i + 1][0];
      this.add.image((x1 + x2) / 2, 560, 'glow').setTint(COLORS.red).setAlpha(0.35).setScale((x2 - x1) / 60, 1)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(3);
    }
  }

  // Make one floating one-way platform (you can jump up through it)
  _makePlatform(x, y, w) {
    const p = this.add.tileSprite(x, y, w, 16, 'platform').setOrigin(0, 0).setDepth(6);
    this.physics.add.existing(p, true);
    p.body.checkCollision.down = false;
    p.body.checkCollision.left = false;
    p.body.checkCollision.right = false;
    this.platformGroup.add(p);
    return p;
  }

  // Static and moving platforms
  _buildPlatforms() {
    this.platformGroup = this.physics.add.staticGroup();
    this.L.platforms.forEach(([x, y, w]) => this._makePlatform(x, y, w));
    this.L.movers.forEach(m => {
      const p = this._makePlatform(m.x, m.y, m.w);
      p.prevX = p.x; p.prevY = p.y;
      this.movers.push(p);
      const tw = { targets: p, duration: m.dur, yoyo: true, repeat: -1, ease: 'Sine.inOut' };
      if (m.toX !== undefined) tw.x = m.toX;
      if (m.toY !== undefined) tw.y = m.toY;
      this.tweens.add(tw);
    });
  }

  // Story posters on the walls (Level 1's holds the puzzle clue)
  _buildPosters() {
    this.L.posters.forEach(({ x, y, text, color, size }) => {
      this.add.text(x, y, text, {
        fontFamily: 'Orbitron, monospace', fontSize: size + 'px', fontStyle: '700', color,
        stroke: color, strokeThickness: 1,
        shadow: { offsetX: 0, offsetY: 0, color, blur: 10, fill: true }
      }).setDepth(4);
    });
  }

  // The key item: access card (L1, L2) or EMP blaster (L3)
  _buildItem() {
    const it = this.L.item;
    this.item = this.add.image(it.x, it.y, it.type).setDepth(8).setScale(it.type === 'blaster' ? 1.4 : 1);
    if (it.tint) this.item.setTint(it.tint);
    this.itemGlow = this.add.image(it.x, it.y, 'glow').setTint(it.glow).setAlpha(0.45).setScale(1.5)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(7);
    this.tweens.add({ targets: [this.item, this.itemGlow], y: it.y - 6, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // Hackable terminal with a floating "[E] HACK" prompt
  _buildTerminal() {
    const tx = this.L.terminal;
    if (!tx) return;
    this.terminal = this.add.image(tx, GROUND_Y, 'terminal').setOrigin(0.5, 1).setDepth(6);
    const screenGlow = this._addLight(tx, GROUND_Y - 44, COLORS.cyan, 1.2, 0.35);
    screenGlow.setDepth(7);
    this.hackPrompt = neonText(this, tx, 420, '[E] HACK', 14, CSS.cyan).setDepth(12).setAlpha(0);
    this.tweens.add({ targets: this.hackPrompt, y: 412, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }

  // Security door (blocks the player until opened)
  _buildDoor() {
    if (!this.L.door) return;
    this.doorObj = this.physics.add.staticImage(this.L.door, GROUND_Y, 'door').setOrigin(0, 1).setDepth(6);
    this.doorObj.refreshBody();   // re-sync the body after changing the origin
    this.doorLight = this.add.image(this.L.door + 16, 445, 'glow').setTint(COLORS.red).setAlpha(0.45).setScale(1.5)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(5);
  }

  // Drones and lasers
  _buildHazards() {
    this.droneGroup = this.physics.add.group();
    this.L.drones.forEach(d => this._spawnDrone(d));
    this.physics.add.overlap(this.player, this.droneGroup, (pl, d) => this.damagePlayer(d));
    this.L.lasers.forEach(ld => this._buildLaser(ld));
  }

  // Create one drone (patrol, vertical bobber, or boss "seeker")
  _spawnDrone(d) {
    const drone = this.physics.add.sprite(d.x, d.y, 'drone').setDepth(8);
    this.droneGroup.add(drone);
    drone.body.setAllowGravity(false);
    drone.body.setImmovable(true);
    if (this.L.theme.drone) drone.setTint(this.L.theme.drone);
    drone.glow = this.add.image(d.x, d.y, 'glow').setTint(this.L.theme.drone || COLORS.red).setAlpha(0.3).setScale(2)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(7);
    if (d.seeker) { drone.seeker = true; drone.die = this.time.now + 9000; return drone; }

    this.tweens.add({ targets: drone, y: d.y + 6, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    if (d.to !== undefined) {
      this.tweens.add({
        targets: drone, x: d.to, duration: d.dur, yoyo: true, repeat: -1, ease: 'Sine.inOut',
        onYoyo: () => drone.setFlipX(true), onRepeat: () => drone.setFlipX(false)
      });
    } else {
      this.tweens.add({ targets: drone, y: d.toY, duration: d.dur, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    return drone;
  }

  // Destroy a drone with a small explosion (shot by the blaster)
  _killDrone(d) {
    if (!d.active) return;
    this.tweens.killTweensOf(d);
    if (d.glow) d.glow.destroy();
    this._explosion(d.x, d.y, 0.7);
    d.destroy();
  }

  // One laser: ON for `on` ms, OFF for `off` ms, blinks as a warning before turning on
  _buildLaser(ld) {
    const beamH = GROUND_Y - 16, cy = 16 + beamH / 2;
    const col = this.L.theme.danger;
    this.add.image(ld.x, 16, 'laser_emitter').setDepth(7);
    const beam = this.add.rectangle(ld.x, cy, 6, beamH, col).setAlpha(0.08).setDepth(6);
    const glow = this.add.image(ld.x, cy, 'glow').setTint(col).setAlpha(0.05).setScale(0.3, beamH / 60)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(5);
    const zone = this.add.zone(ld.x, cy, 6, beamH);
    this.physics.world.enable(zone);
    zone.body.setAllowGravity(false);
    zone.body.enable = false;
    let isOn = false;

    const setOn = on => {
      isOn = on;
      this.tweens.killTweensOf(beam);
      beam.setAlpha(on ? 0.9 : 0.08);
      glow.setAlpha(on ? 0.3 : 0.05);
      zone.body.enable = on;
      if (on) {
        this.tweens.add({ targets: beam, alpha: 0.65, duration: 70, yoyo: true, repeat: -1 });  // flicker
        if (Math.abs(this.player.x - ld.x) < W * 0.6) Sound.sfx('laser');
      }
    };
    const cycle = () => {
      setOn(true);
      this.time.delayedCall(ld.on, () => {
        setOn(false);
        this.time.delayedCall(Math.max(0, ld.off - 300), () => {
          this.tweens.add({ targets: beam, alpha: 0.5, duration: 50, yoyo: true, repeat: 2 });  // warning blink
        });
        this.time.delayedCall(ld.off, cycle);
      });
    };
    this.time.delayedCall(ld.offset, cycle);
    this.physics.add.overlap(this.player, zone, () => { if (isOn) this.damagePlayer(zone); });
  }

  // Exit portal (hidden in Level 3 until the boss dies)
  _buildPortal() {
    const px = this.L.portal, py = 460;
    const glowCol = this.level === 1 ? COLORS.green : COLORS.cyan;
    this.portal = this.add.image(px, py, 'portal').setDepth(6);
    this.portalGlow = this.add.image(px, py, 'glow').setTint(glowCol).setAlpha(0.4).setScale(5)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
    this.tweens.add({ targets: this.portalGlow, alpha: 0.2, scale: 4.5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: this.portal, angle: 360, duration: 6000, repeat: -1 });
    this.portalEmitter = this.add.particles(px, py, 'spark', {
      speed: { min: 30, max: 80 }, angle: { min: 250, max: 290 },
      scale: { start: 0.8, end: 0 }, alpha: { start: 0.8, end: 0 }, lifespan: 800,
      tint: [COLORS.cyan, COLORS.green, COLORS.gold], frequency: 80, blendMode: Phaser.BlendModes.ADD
    }).setDepth(6);
    this.exitRect = new Phaser.Geom.Rectangle(px - 30, py - 48, 60, 96);
    if (this.L.boss) {
      this.portal.setVisible(false); this.portalGlow.setVisible(false); this.portalEmitter.stop();
    }
  }

  // Particle emitters reused for dust, sparks and explosions
  _buildParticles() {
    this.dustEmitter = this.add.particles(0, 0, 'dust', {
      speed: { min: 20, max: 60 }, angle: { min: 200, max: 340 },
      scale: { start: 1.5, end: 0 }, alpha: { start: 0.8, end: 0 }, lifespan: 300,
      tint: [0x00f0ff, 0xaaaaaa], emitting: false
    }).setDepth(11);
    this.runEmitter = this.add.particles(0, 0, 'dust', {
      speed: { min: 10, max: 30 }, angle: { min: 150, max: 210 },
      scale: { start: 1, end: 0 }, alpha: { start: 0.5, end: 0 }, lifespan: 200,
      tint: 0x00f0ff, emitting: false
    }).setDepth(11);
    this.burstEmitter = this.add.particles(0, 0, 'spark', {
      speed: { min: 80, max: 260 }, angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 600, gravityY: 300,
      tint: [COLORS.red, COLORS.gold, COLORS.magenta, COLORS.white], blendMode: Phaser.BlendModes.ADD, emitting: false
    }).setDepth(12);
    this.sparkEmitter = this.add.particles(0, 0, 'spark', {
      speed: { min: 40, max: 140 }, angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 }, alpha: { start: 1, end: 0 }, lifespan: 300,
      tint: [COLORS.cyan, COLORS.white], blendMode: Phaser.BlendModes.ADD, emitting: false
    }).setDepth(12);
  }

  // Additive tinted glow blob (fake light), optionally pulsing
  _addLight(x, y, color, size = 3, alpha = 0.5, pulse = true) {
    const l = this.add.image(x, y, 'glow').setTint(color).setBlendMode(Phaser.BlendModes.ADD)
      .setScale(size).setAlpha(alpha).setDepth(5);
    if (pulse) {
      this.tweens.add({
        targets: l, alpha: alpha * 0.55, scale: size * 0.9, duration: Phaser.Math.Between(700, 1400),
        yoyo: true, repeat: -1, ease: 'Sine.inOut'
      });
    }
    return l;
  }

  // Ceiling lamp that randomly flickers off for 80 ms
  _flickerLamp(x) {
    const lamp = this.add.image(x, 10, 'glow').setTint(COLORS.cyan).setAlpha(0.35).setScale(2.5)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(5);
    const flick = () => this.time.delayedCall(Phaser.Math.Between(1500, 5000), () => {
      lamp.setAlpha(0.05);
      this.time.delayedCall(80, () => { lamp.setAlpha(0.35); flick(); });
    });
    flick();
  }

  // Explosion: flash + sparks + sound
  _explosion(x, y, scale = 1) {
    const flash = this.add.image(x, y, 'glow').setTint(COLORS.gold).setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0.5 * scale).setDepth(12);
    this.tweens.add({ targets: flash, scale: 3 * scale, alpha: 0, duration: 350, onComplete: () => flash.destroy() });
    this.burstEmitter.explode(Math.round(14 * scale), x, y);
    Sound.sfx('explode');
  }

  // ================= GAME EVENTS =================

  // Called every second by the timer
  _tickTimer() {
    if (this.gameEnded) return;
    this.timeLeft--;
    this.game.events.emit('hud:time', this.timeLeft);
    if (this.timeLeft <= 15 && this.timeLeft > 0) Sound.sfx('tick');
    if (this.timeLeft <= 0) this.endGame(false, 'time');
  }

  // Called when ARIA touches something dangerous (or falls in a pit)
  damagePlayer(source) {
    if (this.invulnerable || this.gameEnded) return;
    this.health--;
    this.game.events.emit('hud:health', this.health, this.maxHealth);
    Sound.sfx('hurt');
    this.cameras.main.shake(180, 0.012);
    this.cameras.main.flash(150, 255, 46, 77);

    if (source === 'pit') {
      this.player.setPosition(this.lastCheckpoint.x, this.lastCheckpoint.y);
      this.player.setVelocity(0, 0);
    } else {
      this.player.setVelocity(this.player.x < source.x ? -260 : 260, -280);
    }
    if (this.health <= 0) { this.endGame(false, 'health'); return; }

    // 1.2 s of blinking invulnerability
    this.invulnerable = true;
    const blink = this.tweens.add({ targets: this.player, alpha: 0.3, duration: 100, yoyo: true, repeat: -1 });
    this.time.delayedCall(TUNE.invulnMs, () => {
      this.invulnerable = false; blink.stop(); this.player.setAlpha(1);
    });
  }

  // Called when ARIA touches the card / blaster
  _collectItem(silent = false) {
    this.hasItem = true;
    const it = this.L.item;
    if (this.item) { this.tweens.killTweensOf([this.item, this.itemGlow]); this.item.destroy(); this.itemGlow.destroy(); this.item = null; }
    if (silent) return;
    this.burstEmitter.explode(16, it.x, it.y);
    Sound.sfx('pickup');
    this._toast(it.msg, 'green');
    this.game.events.emit('hud:objective', this.L.objectives[1]);
  }

  // Opens the security door (puzzle solved, or blaster detected in L3)
  _openDoor() {
    if (this.doorOpen || !this.doorObj) return;
    this.doorOpen = true;
    this.doorObj.setTexture('door_open');
    this.doorObj.body.enable = false;
    this.doorLight.setTint(COLORS.green);
    this.cameras.main.shake(100, 0.006);
    Sound.sfx('unlock');
    if (this.L.autoDoor) {
      this._toast('BLASTER SIGNATURE ACCEPTED — DOOR OPEN', 'green');
    } else {
      this._toast('SECURITY DOOR UNLOCKED', 'green');
      this.game.events.emit('hud:objective', this.L.objectives[2]);
      this.lastCheckpoint = this.L.afterDoor;
    }
  }

  // Show a toast message in the HUD
  _toast(msg, color) { this.game.events.emit('hud:toast', msg, color); }

  // Level finished (won) or failed
  endGame(won, reason = 'health') {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent.remove();
    this.physics.pause();
    this.game.events.emit('hud:ended');
    if (won) {
      this.player.anims.stop();
      this.cameras.main.flash(300, 255, 255, 255);
      Sound.sfx('ok');
    } else {
      Sound.stopMusic();
    }
    const finalBoss = won && this.L.boss;
    this.cameras.main.fadeOut(won ? 900 : 600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      if (finalBoss) {
        switchTo(this, 'EndingScene', { timeLeft: this.timeLeft, health: this.health, maxHealth: this.maxHealth });
      } else {
        switchTo(this, 'EndScene', { won, timeLeft: this.timeLeft, reason, level: this.level, bossReached: this.bossStarted });
      }
    });
  }

  // ================= MAIN UPDATE =================
  update(time, delta) {
    if (this.gameEnded) return;
    const L = this.L, p = this.player, body = p.body, k = this.keys;
    const onFloor = body.blocked.down;

    // ---- Coyote time & landing dust ----
    this._coyote = onFloor ? TUNE.coyote : Math.max(0, this._coyote - delta);
    if (onFloor && !this._wasOnFloor) { this.dustEmitter.explode(6, p.x, p.y + 22); Sound.sfx('land'); }
    this._wasOnFloor = onFloor;

    // ---- Moving platforms carry the player ----
    this.movers.forEach(mp => {
      const dx = mp.x - mp.prevX, dy = mp.y - mp.prevY;
      mp.body.updateFromGameObject();
      if (onFloor && body.bottom >= mp.prevY - 2 && body.bottom <= mp.prevY + 16 && body.right > mp.prevX && body.left < mp.prevX + mp.width) {
        p.x += dx; p.y += dy;
      }
      mp.prevX = mp.x; mp.prevY = mp.y;
    });

    // ---- Horizontal movement ----
    const goLeft = k.LEFT.isDown || k.A.isDown, goRight = k.RIGHT.isDown || k.D.isDown;
    if (goLeft) { body.setVelocityX(-TUNE.moveSpeed); p.setFlipX(true); }
    else if (goRight) { body.setVelocityX(TUNE.moveSpeed); p.setFlipX(false); }
    else body.setVelocityX(0);

    // ---- Run particles & footsteps ----
    if (onFloor && (goLeft || goRight)) {
      this._dustT -= delta; this._stepT -= delta;
      if (this._dustT <= 0) { this.runEmitter.explode(1, p.x, p.y + 22); this._dustT = 120; }
      if (this._stepT <= 0) { Sound.sfx('step'); this._stepT = 220; }
    }

    // ---- Jump buffer + coyote jump ----
    const jumpPressed = Phaser.Input.Keyboard.JustDown(k.SPACE) || Phaser.Input.Keyboard.JustDown(k.UP) || Phaser.Input.Keyboard.JustDown(k.W);
    this._jumpBuf = jumpPressed ? TUNE.jumpBuffer : Math.max(0, this._jumpBuf - delta);
    if (this._jumpBuf > 0 && this._coyote > 0) {
      body.setVelocityY(TUNE.jump);
      this._jumpBuf = 0; this._coyote = 0; this._jumpCut = false;
      Sound.sfx('jump');
    }

    // ---- Variable jump height (release early = short hop) ----
    const jumpHeld = k.SPACE.isDown || k.UP.isDown || k.W.isDown;
    if (!onFloor && body.velocity.y < -200 && !jumpHeld && !this._jumpCut) {
      body.setVelocityY(body.velocity.y * 0.5);
      this._jumpCut = true;
    }

    // ---- Animation ----
    if (onFloor) p.play((goLeft || goRight) ? 'run' : 'idle', true);
    else p.play('jump', true);

    // ---- Pits ----
    if (p.y > 640) this.damagePlayer('pit');
    if (this.gameEnded) return;

    // ---- Key item pickup ----
    if (this.item && Phaser.Geom.Intersects.RectangleToRectangle(p.getBounds(), this.item.getBounds())) this._collectItem();

    // ---- Heart pickups (boss fight) ----
    this._updatePickups(p);

    // ---- Terminal ----
    if (this.terminal) this._updateTerminal(p);

    // ---- Level 3: auto door, arena trigger, blaster, boss ----
    if (L.autoDoor && !this.bossStarted) {
      if (!this.doorOpen && p.x > L.door - 140) {
        if (this.hasItem) this._openDoor();
        else if (!this._doorHintShown) { this._doorHintShown = true; Sound.sfx('deny'); this._toast('LOCKED — EMP BLASTER REQUIRED', 'red'); }
      }
      if (this.doorOpen && p.x > L.boss.trigger) this._startBossFight(false);
    }
    if (this.bolts) this._updateShooting(time, delta);
    if (this.boss) this._updateBoss(time, delta);

    // ---- Exit portal ----
    const canExit = L.boss ? this.bossDefeated : this.doorOpen;
    if (canExit && this.exitRect.contains(p.x, p.y)) { this.endGame(true); return; }

    // ---- Glows follow their owners ----
    this.droneGroup.getChildren().forEach(d => d.glow && d.glow.setPosition(d.x, d.y));
    this.playerGlow.setPosition(p.x, p.y);
    this.bgFar.tilePositionX = this.cameras.main.scrollX * 0.15;
  }

  // Show "[E] HACK" near the terminal and open the keypad on E
  _updateTerminal(p) {
    const tx = this.L.terminal;
    const near = Math.abs(p.x - tx) < 60 && p.y > 400;
    if (near !== this._nearTerminal) { this._nearTerminal = near; this.hackPrompt.setAlpha(near ? 1 : 0); }
    if (near && Phaser.Input.Keyboard.JustDown(this.keys.E) && !this.puzzleOpen) {
      if (!this.hasItem) {
        Sound.sfx('deny');
        this._toast('ACCESS DENIED — CARD REQUIRED', 'red');
      } else if (!this.doorOpen) {
        this.puzzleOpen = true;
        Sound.duck(true);
        this.scene.launch('PuzzleScene', { level: this.level });
        this.scene.pause();
      } else {
        this._toast('DOOR ALREADY OPEN', 'cyan');
      }
    }
  }

  // Heart pickups dropped by the boss
  _spawnHeart(x, y) {
    const h = this.add.image(x, y, 'heart').setScale(1.4).setDepth(9);
    h.glow = this.add.image(x, y, 'glow').setTint(COLORS.red).setAlpha(0.5).setScale(1.2).setBlendMode(Phaser.BlendModes.ADD).setDepth(8);
    this.tweens.add({ targets: [h, h.glow], y: y - 8, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.pickups.push(h);
  }
  _updatePickups(p) {
    this.pickups = this.pickups.filter(h => {
      if (!Phaser.Geom.Intersects.RectangleToRectangle(p.getBounds(), h.getBounds())) return true;
      this.health = Math.min(this.maxHealth, this.health + 1);
      this.game.events.emit('hud:health', this.health, this.maxHealth);
      Sound.sfx('heal');
      this._toast('+1 HEART', 'green');
      this.tweens.killTweensOf([h, h.glow]);
      h.glow.destroy(); h.destroy();
      return false;
    });
  }

  // ================= LEVEL 3: EMP BLASTER =================

  // Groups for player bolts and boss bullets
  _buildShooting() {
    this.bolts = this.physics.add.group();
    this.bossBullets = this.physics.add.group();
    this.physics.add.overlap(this.bolts, this.droneGroup, (bolt, drone) => {
      this.sparkEmitter.explode(8, bolt.x, bolt.y);
      bolt.destroy();
      this._killDrone(drone);
    });
    this.physics.add.overlap(this.player, this.bossBullets, (pl, orb) => {
      if (this.invulnerable) return;
      this.damagePlayer(orb);
      orb.destroy();
    });
  }

  // Hold F (or J) to fire; bolts auto-aim at the boss or the nearest drone ahead
  _updateShooting(time, delta) {
    this._fireT -= delta;
    if (this.hasItem && (this.keys.F.isDown || this.keys.J.isDown) && this._fireT <= 0) {
      this._fire();
      this._fireT = TUNE.fireCooldown;
    }
    const left = this.cameras.main.scrollX - 40, right = left + W + 80;
    this.bolts.getChildren().slice().forEach(b => {
      if (time > b.die || b.x < left || b.x > right || b.y < -20 || b.y > H) b.destroy();
    });
  }

  _fire() {
    const p = this.player, dir = p.flipX ? -1 : 1;
    const sx = p.x + dir * 18, sy = p.y - 2;
    let target = null;
    if (this.boss && this.boss.alive) {
      target = this.boss;
    } else {
      let best = 520;
      this.droneGroup.getChildren().forEach(d => {
        const dx = d.x - p.x, dist = Phaser.Math.Distance.Between(p.x, p.y, d.x, d.y);
        if (Math.sign(dx) === dir && dist < best) { best = dist; target = d; }
      });
    }
    const ang = target ? Phaser.Math.Angle.Between(sx, sy, target.x, target.y) : (dir > 0 ? 0 : Math.PI);
    const bolt = this.bolts.create(sx, sy, 'bolt');
    bolt.body.setAllowGravity(false);
    bolt.setRotation(ang).setBlendMode(Phaser.BlendModes.ADD).setDepth(11);
    this.physics.velocityFromRotation(ang, TUNE.boltSpeed, bolt.body.velocity);
    bolt.die = this.time.now + 1200;
    this.sparkEmitter.explode(3, sx, sy);
    Sound.sfx('shoot');
  }

  // ================= LEVEL 3: BOSS FIGHT — NEXUS PRIME =================

  // Called when ARIA walks into the arena: lock the door, raise the boss
  _startBossFight(fromRetry) {
    if (this.bossStarted) return;
    this.bossStarted = true;
    const B = this.L.boss, cam = this.cameras.main;

    // Door slams shut behind ARIA
    this.doorOpen = false;
    this.doorObj.setTexture('door');
    this.doorObj.body.enable = true;
    this.doorLight.setTint(COLORS.red);
    Sound.sfx('slam');
    this.lastCheckpoint = { x: B.spawn.x, y: B.spawn.y };

    // Camera locks onto the arena (exactly one screen wide)
    cam.stopFollow();
    cam.pan(B.arenaX + W / 2, H / 2, fromRetry ? 1 : 900, 'Sine.easeInOut', true);   // camera effects need the full ease name

    // The boss object (positions are driven in _updateBoss)
    const b = this.boss = {
      x: B.arenaX + W / 2, y: 640, baseY: 640, driftT: 0, drifting: false, jitter: 0,
      hp: B.hp, max: B.hp, phase: 1, alive: true, vulnerable: false,
      lastAtk: null, attacks: 0, exposed: 0, seq: 0
    };
    b.glow   = this.add.image(b.x, b.y, 'glow').setTint(COLORS.red).setAlpha(0.5).setScale(4.5).setBlendMode(Phaser.BlendModes.ADD).setDepth(7);
    b.ring   = this.add.image(b.x, b.y, 'boss_ring').setTint(COLORS.magenta).setDepth(8);
    b.core   = this.add.image(b.x, b.y, 'boss').setDepth(9);
    b.eye    = this.add.image(b.x, b.y, 'boss_eye').setDepth(10);
    b.shield = this.add.image(b.x, b.y, 'shield').setAlpha(0.85).setBlendMode(Phaser.BlendModes.ADD).setDepth(10);
    this.tweens.add({ targets: b, baseY: 150, duration: 2000, ease: 'Cubic.out', onComplete: () => { b.drifting = true; } });

    Sound.startMusic('boss');
    Sound.sfx('roar');
    cam.shake(900, 0.008);
    this._toast('WARNING: NEXUS PRIME ONLINE', 'red');
    this.game.events.emit('hud:objective', this.L.objectives[2]);
    this.game.events.emit('hud:bossShow', true);
    this.game.events.emit('hud:boss', b.hp, b.max);
    this._bossLater(fromRetry ? 1800 : 2600, () => this._bossNext());
  }

  // delayedCall that is cancelled if the boss changes phase or dies
  _bossLater(ms, fn) {
    const b = this.boss, seq = b.seq;
    this.time.delayedCall(ms, () => { if (b.alive && b.seq === seq && !this.gameEnded) fn(); });
  }

  // Every frame: move the boss parts, check bolts / contact / beams / shockwaves / bullets
  _updateBoss(time, delta) {
    const b = this.boss, p = this.player, dt = delta / 1000;
    const cx = this.L.boss.arenaX + W / 2;
    if (b.drifting) b.driftT += delta;
    b.x = cx + 300 * Math.sin(b.driftT * 0.0006) + (b.jitter ? Phaser.Math.Between(-b.jitter, b.jitter) : 0);
    b.y = b.baseY + Math.sin(time * 0.003) * 6;

    // Position the layered sprites; the eye looks at ARIA
    const ang = Phaser.Math.Angle.Between(b.x, b.y, p.x, p.y);
    b.glow.setPosition(b.x, b.y); b.core.setPosition(b.x, b.y); b.shield.setPosition(b.x, b.y);
    b.ring.setPosition(b.x, b.y).setAngle(b.ring.angle + delta * 0.04 * b.phase);
    b.eye.setPosition(b.x + Math.cos(ang) * 9, b.y + Math.sin(ang) * 9);
    b.shield.setScale(1 + Math.sin(time * 0.006) * 0.03);

    if (b.alive) {
      // Touching the core hurts
      if (Phaser.Math.Distance.Between(b.x, b.y, p.x, p.y) < 60) this.damagePlayer(b);
      // Player bolts vs boss
      this.bolts.getChildren().slice().forEach(bolt => {
        if (Phaser.Math.Distance.Between(b.x, b.y, bolt.x, bolt.y) < 58) this._boltHitBoss(bolt);
      });
    }

    // Boss orbs: remove when they leave the arena or hit the floor
    const ax = this.L.boss.arenaX;
    this.bossBullets.getChildren().slice().forEach(o => {
      if (o.y > GROUND_Y - 4) { this.sparkEmitter.explode(4, o.x, GROUND_Y - 4); o.destroy(); }
      else if (time > o.die || o.x < ax - 20 || o.x > ax + W + 20 || o.y < -30) o.destroy();
    });

    // Laser beams
    this.beams.forEach(e => { if (e.active && Math.abs(p.x - e.x) < 20) this.damagePlayer(e); });

    // Ground shockwaves (jump over them!)
    this.waves = this.waves.filter(w => {
      w.x += w.dir * w.speed * dt;
      if (w.x < ax || w.x > ax + W) { w.destroy(); return false; }
      if (Phaser.Geom.Intersects.RectangleToRectangle(p.getBounds(), w.getBounds())) this.damagePlayer({ x: w.x - w.dir * 40 });
      return true;
    });

    // Seeker drones chase ARIA, then self-destruct
    this.droneGroup.getChildren().slice().forEach(d => {
      if (!d.seeker) return;
      if (time > d.die) { this._killDrone(d); return; }
      const spd = 60 + 25 * b.phase;
      const a = Phaser.Math.Angle.Between(d.x, d.y, p.x, p.y - 10);
      d.body.setVelocity(Math.cos(a) * spd, d.y > 470 ? Math.min(0, Math.sin(a) * spd) : Math.sin(a) * spd);
      d.setFlipX(d.body.velocity.x < 0);
    });
  }

  // A bolt reached the boss: deflect off the shield, or damage the core
  _boltHitBoss(bolt) {
    const b = this.boss;
    const bx = bolt.x, by = bolt.y;
    bolt.destroy();
    if (!b.vulnerable) {
      this.sparkEmitter.explode(6, bx, by);
      Sound.sfx('tink');
      return;
    }
    b.hp--;
    this.burstEmitter.explode(6, bx, by);
    Sound.sfx('bossHit');
    b.core.setTintFill(0xffffff);
    this.time.delayedCall(60, () => b.core.active && b.core.clearTint());
    this.game.events.emit('hud:boss', b.hp, b.max);
    if (b.hp <= 0) { this._bossDie(); return; }
    const phase = b.hp <= b.max / 3 ? 3 : b.hp <= b.max * 2 / 3 ? 2 : 1;
    if (phase > b.phase) this._bossPhaseUp(phase);
  }

  // Shield on/off animation
  _bossShield(on) {
    const b = this.boss;
    this.tweens.killTweensOf(b.shield);
    this.tweens.add({ targets: b.shield, alpha: on ? 0.85 : 0, duration: on ? 250 : 400 });
    b.glow.setTint(on ? COLORS.red : COLORS.gold);
    Sound.sfx(on ? 'shieldUp' : 'shieldDown');
  }

  // Pick the next attack (more attack types unlock in later phases)
  _bossNext() {
    const b = this.boss;
    const pools = { 1: ['volley', 'beams'], 2: ['volley', 'beams', 'drones', 'slam'], 3: ['beams', 'slam', 'volley', 'drones'] };
    const pool = pools[b.phase].filter(a => a !== b.lastAtk);
    const atk = b.attacks === 0 ? 'volley' : Phaser.Utils.Array.GetRandom(pool);
    b.attacks++; b.lastAtk = atk;
    const dur = { volley: () => this._atkVolley(), beams: () => this._atkBeams(), drones: () => this._atkDrones(), slam: () => this._atkSlam() }[atk]();
    this._bossLater(dur, () => this._bossVulnerable());
  }

  // After each attack the shield drops for a few seconds — FIRE!
  _bossVulnerable() {
    const b = this.boss;
    b.vulnerable = true;
    this._bossShield(false);
    this.tweens.add({ targets: b, baseY: 215, duration: 500, ease: 'Sine.out' });
    if (b.exposed++ < 3) this._toast('SHIELD DOWN — HOLD [F] TO FIRE!', 'green');
    this._bossLater([3400, 3000, 2600][b.phase - 1], () => {
      b.vulnerable = false;
      this._bossShield(true);
      this.tweens.add({ targets: b, baseY: 150, duration: 500, ease: 'Sine.out' });
      this._bossLater(900, () => this._bossNext());
    });
  }

  // Phase change at 2/3 and 1/3 health: roar, drop a heart, attack harder
  _bossPhaseUp(phase) {
    const b = this.boss;
    b.phase = phase; b.seq++; b.vulnerable = false;
    this._clearBossAttacks();
    this._bossShield(true);
    this.tweens.add({ targets: b, baseY: 150, duration: 500, ease: 'Sine.out' });
    b.ring.setTint(phase === 3 ? COLORS.red : COLORS.gold);
    Sound.sfx('roar');
    this.cameras.main.shake(500, 0.01);
    this.cameras.main.flash(200, 255, 43, 214);
    this._toast(`NEXUS PRIME — PHASE ${phase}`, 'red');
    this._spawnHeart(this.L.boss.arenaX + W / 2, 300);
    this._bossLater(1800, () => this._bossNext());
  }

  // ATTACK 1: aimed fans of red orbs
  _atkVolley() {
    const b = this.boss, n = [3, 5, 7][b.phase - 1], speed = 220 + b.phase * 30;
    for (let w = 0; w < 3; w++) {
      this._bossLater(250 + w * 520, () => {
        Sound.sfx('orb');
        const a0 = Phaser.Math.Angle.Between(b.x, b.y, this.player.x, this.player.y);
        for (let i = 0; i < n; i++) {
          const a = a0 + (i - (n - 1) / 2) * 0.2;
          const o = this.bossBullets.create(b.x + Math.cos(a) * 40, b.y + Math.sin(a) * 40, 'orb');
          o.body.setAllowGravity(false);
          o.body.setCircle(6, 2, 2);
          o.setBlendMode(Phaser.BlendModes.ADD).setDepth(11);
          this.physics.velocityFromRotation(a, speed, o.body.velocity);
          o.die = this.time.now + 5000;
        }
      });
    }
    return 250 + 3 * 520 + 500;
  }

  // ATTACK 2: warning lines, then vertical laser beams (one always on ARIA)
  _atkBeams() {
    const b = this.boss, ax = this.L.boss.arenaX;
    const count = [3, 4, 5][b.phase - 1], warn = [950, 800, 650][b.phase - 1];
    const minX = ax + 40, maxX = ax + W - 40;
    const xs = [Phaser.Math.Clamp(this.player.x, minX, maxX)];
    for (let tries = 0; xs.length < count && tries < 60; tries++) {
      const x = Phaser.Math.Between(minX, maxX);
      if (xs.every(o => Math.abs(o - x) > 110)) xs.push(x);
    }
    Sound.sfx('warn');
    xs.forEach(x => {
      const e = { x, active: false, parts: [] };
      const line = this.add.rectangle(x, H / 2, 4, H, COLORS.red, 0.6).setDepth(7);
      this.tweens.add({ targets: line, alpha: 0.1, duration: 80, yoyo: true, repeat: -1 });
      e.parts.push(line, this.add.image(x, 8, 'laser_emitter').setDepth(8));
      this.beams.push(e);
      this._bossLater(warn, () => {
        line.destroy();
        e.active = true;
        e.parts.push(
          this.add.rectangle(x, H / 2, 20, H, COLORS.red, 0.95).setDepth(7),
          this.add.rectangle(x, H / 2, 6, H, COLORS.white, 0.9).setDepth(7),
          this.add.image(x, H / 2, 'glow').setTint(COLORS.red).setScale(0.8, 9).setAlpha(0.6).setBlendMode(Phaser.BlendModes.ADD).setDepth(6)
        );
        this.cameras.main.shake(120, 0.006);
        this._bossLater(450, () => this._removeBeam(e));
      });
    });
    this._bossLater(warn, () => Sound.sfx('beam'));
    return warn + 450 + 450;
  }
  _removeBeam(e) {
    e.parts.forEach(o => o.active && o.destroy());
    this.beams = this.beams.filter(x => x !== e);
  }

  // ATTACK 3: release seeker drones (shoot them down!)
  _atkDrones() {
    const b = this.boss, n = b.phase === 3 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      this._bossLater(300 + i * 350, () => {
        const d = this._spawnDrone({ x: b.x, y: b.y + 40, seeker: true });
        d.setScale(0);
        this.tweens.add({ targets: d, scale: 1, duration: 250 });
        Sound.sfx('spawn');
      });
    }
    if (b.attacks <= 4) this._toast('SEEKER DRONES — SHOOT THEM DOWN', 'cyan');
    return 300 + n * 350 + 1400;
  }

  // ATTACK 4: boss slams the floor and sends shockwaves — jump over them!
  _atkSlam() {
    const b = this.boss;
    b.drifting = false; b.jitter = 4;
    Sound.sfx('charge');
    b.glow.setTint(COLORS.magenta);
    this._bossLater(700, () => {
      b.jitter = 0;
      this.tweens.add({
        targets: b, baseY: 445, duration: 280, ease: 'Quad.in',
        onComplete: () => {
          if (!b.alive) return;
          this.cameras.main.shake(300, 0.02);
          Sound.sfx('explode');
          this.dustEmitter.explode(20, b.x, GROUND_Y - 4);
          this._spawnWave(b.x, -1); this._spawnWave(b.x, 1);
          if (b.phase === 3) this._bossLater(450, () => { this._spawnWave(b.x, -1); this._spawnWave(b.x, 1); });
          this._bossLater(600, () => {
            b.glow.setTint(COLORS.red);
            this.tweens.add({ targets: b, baseY: 150, duration: 800, ease: 'Sine.inOut', onComplete: () => { b.drifting = true; } });
          });
        }
      });
    });
    if (b.attacks <= 4) this._toast('JUMP OVER THE SHOCKWAVES!', 'cyan');
    return 700 + 280 + 600 + 800 + 300;
  }
  _spawnWave(x, dir) {
    const w = this.add.image(x, GROUND_Y - 15, 'shockwave').setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
    w.dir = dir; w.speed = 320 + 40 * this.boss.phase;
    this.waves.push(w);
  }

  // Remove every boss projectile / beam / wave / seeker
  _clearBossAttacks() {
    this.beams.slice().forEach(e => this._removeBeam(e));
    this.waves.forEach(w => w.destroy()); this.waves = [];
    this.bossBullets.clear(true, true);
    this.droneGroup.getChildren().slice().forEach(d => d.seeker && this._killDrone(d));
  }

  // Boss destroyed: explosions, then the escape portal opens
  _bossDie() {
    const b = this.boss;
    b.alive = false; b.vulnerable = false; b.drifting = false; b.seq++;
    this._clearBossAttacks();
    Sound.stopMusic();
    this.invulnerable = true;   // nothing can hurt ARIA during the finale
    this.game.events.emit('hud:objective', 'NEXUS PRIME is going critical...');
    for (let i = 0; i < 12; i++) {
      this.time.delayedCall(i * 170, () => {
        this._explosion(b.x + Phaser.Math.Between(-60, 60), b.y + Phaser.Math.Between(-60, 60), 1);
        this.cameras.main.shake(150, 0.01);
      });
    }
    this.time.delayedCall(2100, () => {
      this.cameras.main.flash(500, 255, 255, 255);
      this.cameras.main.shake(700, 0.025);
      Sound.sfx('bigBoom');
      this.burstEmitter.explode(60, b.x, b.y);
      [b.glow, b.ring, b.core, b.eye, b.shield].forEach(o => o.setVisible(false));
      this.game.events.emit('hud:bossShow', false);
      this._toast('NEXUS PRIME DESTROYED!', 'green');
      this.game.events.emit('hud:objective', this.L.objectives[3]);
      this.bossDefeated = true;
      this.invulnerable = false;
      this._revealPortal();
      Sound.startMusic('main');
      // The chamber starts collapsing (harmless falling debris)
      this.time.addEvent({
        delay: 280, loop: true, callback: () => {
          const rock = this.add.image(this.L.boss.arenaX + Phaser.Math.Between(20, W - 20), -10, 'debris').setDepth(8).setScale(Phaser.Math.FloatBetween(1, 2));
          this.tweens.add({
            targets: rock, y: GROUND_Y - 6, angle: 360, duration: Phaser.Math.Between(700, 1100), ease: 'Quad.in',
            onComplete: () => { this.dustEmitter.explode(4, rock.x, GROUND_Y - 4); rock.destroy(); }
          });
        }
      });
    });
  }

  // The exit portal grows out of nothing
  _revealPortal() {
    this.portal.setVisible(true).setScale(0);
    this.portalGlow.setVisible(true);
    this.portalEmitter.start();
    this.tweens.add({ targets: this.portal, scale: 1, duration: 700, ease: 'Back.out' });
    Sound.sfx('unlock');
  }
}

// =============================================================
//  UI SCENE — HUD + pause menu (runs on top of GameScene)
// =============================================================
class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  init(data) { this.level = (data && LEVELS[data.level]) ? data.level : 1; }

  create() {
    const L = LEVELS[this.level];
    this._hearts = []; this._timerPulse = null;
    this._paused = false; this._leaving = false; this._ended = false;

    // ---- Hearts + sector name (top-left) ----
    for (let i = 0; i < L.health; i++) this._hearts.push(this.add.image(26 + i * 28, 24, 'heart'));
    this.add.text(14, 48, L.name, { fontFamily: 'Orbitron, monospace', fontSize: '11px', fontStyle: '700', color: CSS.violet }).setOrigin(0, 0.5);

    // ---- Timer (top-center) ----
    this.timerText = neonText(this, W / 2, 24, 'TIME  ' + mmss(L.time), 26, CSS.cyan);

    // ---- Boss health bar (Level 3) ----
    this.bossBar = this.add.container(W / 2, 64).setVisible(false);
    const barLabel = neonText(this, 0, -8, 'NEXUS PRIME', 12, CSS.red);
    const barBg = this.add.rectangle(0, 10, 344, 14, 0x1a0a14).setStrokeStyle(1, COLORS.red);
    this.bossFill = this.add.rectangle(-170, 10, 340, 10, COLORS.red).setOrigin(0, 0.5);
    this.bossBar.add([barBg, this.bossFill, barLabel]);

    // ---- Objective box (top-right, under the buttons) ----
    this.add.rectangle(W - 160, 76, 290, 42, 0x0b0f2a, 0.8).setStrokeStyle(1, COLORS.cyan);
    this.add.text(W - 160, 63, 'OBJECTIVE', { fontFamily: 'Orbitron, monospace', fontSize: '10px', fontStyle: '700', color: CSS.magenta }).setOrigin(0.5);
    this.objText = this.add.text(W - 160, 80, L.objectives[0], {
      fontFamily: 'Orbitron, monospace', fontSize: '12px', color: CSS.cyan, align: 'center', wordWrap: { width: 280 }
    }).setOrigin(0.5);

    // ---- HUD buttons (top-right): pause, restart, home, music, sfx ----
    const bx = i => W - 196 + i * 42;
    this.pauseBtn = iconButton(this, bx(0), 24, 'icon_pause', 'PAUSE', () => this._togglePause());
    iconButton(this, bx(1), 24, 'icon_restart', 'RESTART', () => this._restart());
    iconButton(this, bx(2), 24, 'icon_home', 'HOME', () => this._home());
    this.musicBtn = iconButton(this, bx(3), 24, 'icon_music', 'MUSIC', () => this._toggleMusic());
    this.sfxBtn = iconButton(this, bx(4), 24, 'icon_sfx', 'SOUND FX', () => this._toggleSfx());

    // ---- Toast + controls hint (bottom) ----
    this.toast = neonText(this, W / 2, 490, '', 16, CSS.cyan).setAlpha(0);
    const hint = L.item.type === 'blaster'
      ? 'ARROWS/WASD MOVE · SPACE JUMP · F FIRE · P PAUSE · M MUSIC · N SFX'
      : 'ARROWS/WASD MOVE · SPACE JUMP · E HACK · P PAUSE · M MUSIC · N SFX';
    this.add.text(14, H - 8, hint, { fontFamily: 'Orbitron, monospace', fontSize: '11px', color: CSS.cyan }).setOrigin(0, 1).setAlpha(0.6);

    // ---- Pause menu + fade curtain ----
    this._buildPauseMenu();
    this.curtain = this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setAlpha(0).setDepth(100);
    this._refreshAudioIcons();

    // ---- Keyboard: pause / music / sfx ----
    this.input.keyboard.on('keydown-P', () => this._togglePause());
    this.input.keyboard.on('keydown-ESC', () => this._togglePause());
    this.input.keyboard.on('keydown-M', () => this._toggleMusic());
    this.input.keyboard.on('keydown-N', () => this._toggleSfx());

    // ---- Events from GameScene ----
    const handlers = {
      'hud:health':    (n, max) => this._updateHealth(n),
      'hud:time':      n => this._updateTimer(n),
      'hud:objective': s => this.objText.setText(s),
      'hud:toast':     (s, c) => this._showToast(s, c),
      'hud:boss':      (hp, max) => this.bossFill.setScale(Math.max(0, hp / max), 1),
      'hud:bossShow':  v => this.bossBar.setVisible(v),
      'hud:ended':     () => { this._ended = true; }
    };
    Object.entries(handlers).forEach(([ev, fn]) => this.game.events.on(ev, fn));
    this.events.once('shutdown', () => Object.entries(handlers).forEach(([ev, fn]) => this.game.events.off(ev, fn)));
  }

  // Centered pause panel with big buttons
  _buildPauseMenu() {
    this.pauseMenu = this.add.container(W / 2, H / 2).setVisible(false).setDepth(50);
    const dim = this.add.rectangle(0, 0, W, H, 0x000000, 0.7).setInteractive();   // blocks clicks to the HUD
    const panel = this.add.rectangle(0, 0, 400, 420, 0x0b0f2a, 0.96).setStrokeStyle(3, COLORS.cyan);
    const glow = this.add.image(0, 0, 'glow').setTint(COLORS.cyan).setAlpha(0.12).setScale(5).setBlendMode(Phaser.BlendModes.ADD);
    const title = neonText(this, 0, -170, 'PAUSED', 34, CSS.magenta);
    const resume = neonButton(this, 0, -100, 'RESUME', () => this._togglePause(), 300, 48, 18);
    const restart = neonButton(this, 0, -42, 'RESTART LEVEL', () => this._restart(), 300, 48, 18);
    this.pmMusic = neonButton(this, 0, 16, 'MUSIC: ON', () => this._toggleMusic(), 300, 48, 18);
    this.pmSfx = neonButton(this, 0, 74, 'SOUND FX: ON', () => this._toggleSfx(), 300, 48, 18);
    const home = neonButton(this, 0, 132, 'MAIN MENU', () => this._home(), 300, 48, 18);
    const tip = this.add.text(0, 182, 'P / ESC to resume', { fontFamily: 'Orbitron, monospace', fontSize: '11px', color: CSS.violet }).setOrigin(0.5);
    this.pauseMenu.add([dim, glow, panel, title, resume, restart, this.pmMusic, this.pmSfx, home, tip]);
  }

  // Can the player use the pause / restart / home buttons right now?
  _canAct() {
    const gs = this.scene.get('GameScene');
    return gs && !this._leaving && !this._ended && !gs.gameEnded;
  }

  // Pause or resume GameScene (ignored while the keypad is open)
  _togglePause() {
    const gs = this.scene.get('GameScene');
    if (!this._canAct()) return;
    if (gs.puzzleOpen || this.scene.isActive('PuzzleScene') || this.time.now - gs._puzzleClosedAt < 250) return;
    this._paused = !this._paused;
    if (this._paused) {
      this.scene.pause('GameScene');
      Sound.duck(true);
    } else {
      this.scene.resume('GameScene');
      Sound.duck(false);
    }
    Sound.sfx('ui');
    this.pauseMenu.setVisible(this._paused);
    this.pauseBtn.icon.setTexture(this._paused ? 'icon_play' : 'icon_pause');
  }

  // Fade the screen to black, then run fn (works even while GameScene is paused)
  _leave(fn) {
    if (!this._canAct()) return;
    this._leaving = true;
    Sound.sfx('ui');
    this.tweens.add({ targets: this.curtain, alpha: 1, duration: 250, onComplete: fn });
  }
  _restart() { this._leave(() => goToLevel(this, this.level)); }
  _home()    { this._leave(() => switchTo(this, 'MenuScene')); }

  _toggleMusic() { Sound.init(); Sound.setMusic(!Sound.musicOn); this._refreshAudioIcons(); }
  _toggleSfx()   { Sound.init(); Sound.setSfx(!Sound.sfxOn); this._refreshAudioIcons(); Sound.sfx('ui'); }
  _refreshAudioIcons() {
    this.musicBtn.icon.setTexture(Sound.musicOn ? 'icon_music' : 'icon_music_off');
    this.sfxBtn.icon.setTexture(Sound.sfxOn ? 'icon_sfx' : 'icon_sfx_off');
    this.pmMusic.label.setText('MUSIC: ' + (Sound.musicOn ? 'ON' : 'OFF'));
    this.pmSfx.label.setText('SOUND FX: ' + (Sound.sfxOn ? 'ON' : 'OFF'));
  }

  // Hearts: full / empty, with a pop on the one that changed
  _updateHealth(n) {
    this._hearts.forEach((h, i) => {
      const tex = i < n ? 'heart' : 'heart_empty';
      if (h.texture.key !== tex) this.tweens.add({ targets: h, scale: 1.6, duration: 100, yoyo: true });
      h.setTexture(tex);
    });
  }

  // Timer turns red and pulses in the last 15 seconds
  _updateTimer(sec) {
    this.timerText.setText('TIME  ' + mmss(sec));
    if (sec <= 15 && !this._timerPulse) {
      this.timerText.setColor(CSS.red).setStroke(CSS.red, 1).setShadow(0, 0, CSS.red, 12, true, true);
      this._timerPulse = this.tweens.add({ targets: this.timerText, scale: 1.12, duration: 500, yoyo: true, repeat: -1 });
    }
  }

  _showToast(msg, colorName) {
    const col = CSS[colorName] || CSS.cyan;
    this.tweens.killTweensOf(this.toast);
    this.toast.setText(msg).setColor(col).setStroke(col, 1).setShadow(0, 0, col, 12, true, true).setAlpha(1);
    this.tweens.add({ targets: this.toast, alpha: 0, delay: 1800, duration: 500 });
  }
}

// =============================================================
//  PUZZLE SCENE — 4-digit keypad hacking mini-game
// =============================================================
class PuzzleScene extends Phaser.Scene {
  constructor() { super('PuzzleScene'); }

  init(data) { this.L = LEVELS[(data && data.level) || 1]; }

  create() {
    this._input = ''; this._attempts = 0; this._solved = false; this._busy = false;

    // ---- Dim overlay + panel ----
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setInteractive();
    this.add.image(W / 2, H / 2, 'glow').setTint(COLORS.cyan).setAlpha(0.15).setScale(5).setBlendMode(Phaser.BlendModes.ADD);
    this.add.rectangle(W / 2, H / 2, 460, 470, 0x0b0f2a).setStrokeStyle(3, COLORS.cyan);
    neonText(this, W / 2, H / 2 - 210, this.L.puzzleTitle, 18, CSS.magenta);
    neonText(this, W / 2, H / 2 - 184, 'ENTER 4-DIGIT OVERRIDE CODE', 13, CSS.cyan);

    // ---- Digit display boxes ----
    this._boxes = []; this._digits = [];
    for (let i = 0; i < 4; i++) {
      const bx = W / 2 - 135 + i * 90, by = H / 2 - 120;
      this._boxes.push(this.add.rectangle(bx, by, 60, 76, 0x06122b).setStrokeStyle(2, COLORS.cyan));
      this._digits.push(this.add.text(bx, by, '_', { fontFamily: 'Orbitron, monospace', fontSize: '36px', color: CSS.cyan }).setOrigin(0.5));
    }
    this.msgText = neonText(this, W / 2, H / 2 - 56, '', 16, CSS.green);
    this.hintText = neonText(this, W / 2, H / 2 - 32, '', 12, CSS.gold);

    // ---- Keypad buttons (3×4 grid) ----
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'OK'];
    keys.forEach((k, idx) => {
      const bx = W / 2 - 90 + (idx % 3) * 90, by = H / 2 + 14 + Math.floor(idx / 3) * 58;
      const bg = this.add.rectangle(bx, by, 80, 50, 0x0b0f2a).setStrokeStyle(2, COLORS.violet);
      this.add.text(bx, by, k, { fontFamily: 'Orbitron, monospace', fontSize: '18px', fontStyle: '700', color: CSS.cyan }).setOrigin(0.5);
      const zone = this.add.zone(bx, by, 80, 50).setInteractive({ useHandCursor: true });
      zone.on('pointerover', () => { bg.setStrokeStyle(2, COLORS.cyan); bg.setFillStyle(0x151a4a); });
      zone.on('pointerout', () => { bg.setStrokeStyle(2, COLORS.violet); bg.setFillStyle(0x0b0f2a); });
      zone.on('pointerdown', () => this._handleKey(k));
    });
    neonButton(this, W / 2, H / 2 + 252, 'CLOSE  [ESC]', () => this._close(), 200, 36, 13);

    // ---- Keyboard input ----
    this._keyHandler = e => {
      if (e.key >= '0' && e.key <= '9') this._handleKey(e.key);
      else if (e.key === 'Backspace') this._handleKey('CLR');
      else if (e.key === 'Enter') this._handleKey('OK');
      else if (e.key === 'Escape') this._close();
    };
    this.input.keyboard.on('keydown', this._keyHandler);
    this.events.once('shutdown', () => this.input.keyboard.off('keydown', this._keyHandler));
  }

  _handleKey(k) {
    if (this._solved || this._busy) return;
    Sound.sfx('key');
    if (k === 'CLR') this._input = this._input.slice(0, -1);
    else if (k === 'OK') { if (this._input.length) this._submit(); }
    else if (this._input.length < 4) {
      this._input += k;
      if (this._input.length === 4) this.time.delayedCall(80, () => this._submit());   // auto-submit
    }
    this._refreshDisplay();
  }

  _refreshDisplay() {
    for (let i = 0; i < 4; i++) {
      this._digits[i].setText(this._input[i] || '_');
      this._boxes[i].setStrokeStyle(2, COLORS.cyan);
    }
  }

  // Check the code: green + open the door, or red + shake + hints
  _submit() {
    if (this._solved || this._busy) return;
    if (this._input === this.L.code) {
      this._solved = true;
      this.msgText.setText('ACCESS GRANTED').setColor(CSS.green);
      this._boxes.forEach(b => b.setStrokeStyle(3, COLORS.green));
      this._digits.forEach(d => d.setColor(CSS.green));
      Sound.sfx('ok');
      this.time.delayedCall(700, () => { this._close(); this.game.events.emit('puzzle:solved'); });
      return;
    }
    this._attempts++; this._busy = true;
    this.msgText.setText('ACCESS DENIED').setColor(CSS.red);
    this._boxes.forEach(b => { b.setStrokeStyle(3, COLORS.red); this.tweens.add({ targets: b, x: b.x + 8, duration: 50, yoyo: true, repeat: 3 }); });
    Sound.sfx('deny');
    if (this._attempts >= 4) this.hintText.setText(this.L.hints[1]);
    else if (this._attempts >= 2) this.hintText.setText(this.L.hints[0]);
    this.time.delayedCall(500, () => { this._busy = false; this._input = ''; this._refreshDisplay(); this.msgText.setText(''); });
  }

  // Close the keypad and resume the level
  _close() {
    const gs = this.scene.get('GameScene');
    if (gs) { gs.puzzleOpen = false; gs._puzzleClosedAt = this.time.now; }
    Sound.duck(false);
    this.scene.resume('GameScene');
    this.scene.stop();
  }
}

// =============================================================
//  END SCENE — level complete / mission failed
// =============================================================
class EndScene extends Phaser.Scene {
  constructor() { super('EndScene'); }

  init(data) {
    data = data || {};
    this.won = !!data.won;
    this.timeLeft = data.timeLeft || 0;
    this.reason = data.reason || 'health';
    this.level = data.level || 1;
    this.bossReached = !!data.bossReached;
  }

  create() {
    this._leaving = false;
    Sound.stopMusic();
    this.cameras.main.fadeIn(300);
    this.add.tileSprite(0, 0, W, H, 'grid_tile').setOrigin(0).setAlpha(0.5);
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);
    addAudioButtons(this, W - 28, 28);

    const buttons = this.won ? this._buildWin() : this._buildLose();
    this.input.keyboard.once('keydown-ENTER', () => buttons[0]());
  }

  // Level 1 / 2 complete → offer the next level
  _buildWin() {
    Sound.sfx('win');
    const next = this.level + 1;
    neonText(this, W / 2, 110, `LEVEL ${this.level} COMPLETE!`, 54, CSS.green, CSS.cyan).setShadow(0, 0, CSS.cyan, 20, true, true);
    neonText(this, W / 2, 180, `SECTOR 0${this.level} ESCAPED`, 22, CSS.cyan);
    neonText(this, W / 2, 218, 'NEXT: ' + LEVELS[next].name + (LEVELS[next].boss ? '  —  FINAL BOSS' : ''), 16, CSS.magenta);
    neonText(this, W / 2, 256, 'TIME REMAINING  ' + mmss(this.timeLeft), 18, CSS.gold);
    const go = () => this._go(() => goToLevel(this, next));
    const replay = () => this._go(() => goToLevel(this, this.level));
    const menu = () => this._go(() => switchTo(this, 'MenuScene'));
    neonButton(this, W / 2, 340, `PLAY LEVEL ${next}  ▶`, go);
    neonButton(this, W / 2 - 150, 410, 'REPLAY', replay, 260, 46, 17);
    neonButton(this, W / 2 + 150, 410, 'MAIN MENU', menu, 260, 46, 17);
    neonText(this, W / 2, 480, 'ENTER = NEXT LEVEL', 12, CSS.violet).setAlpha(0.7);
    fireworks(this, 14);
    return [go];
  }

  // Mission failed → retry (or retry the boss directly)
  _buildLose() {
    Sound.sfx('lose');
    const title = neonText(this, W / 2, 150, 'MISSION FAILED', 60, CSS.red);
    this.tweens.add({ targets: title, alpha: 0.4, duration: 400, yoyo: true, repeat: -1 });
    neonText(this, W / 2, 230, this.reason === 'time' ? 'TIME EXPIRED' : 'NEXUS DETECTED YOU', 22, CSS.magenta);
    const retry = () => this._go(() => goToLevel(this, this.level));
    const menu = () => this._go(() => switchTo(this, 'MenuScene'));
    if (this.level === 3 && this.bossReached) {
      const retryBoss = () => this._go(() => goToLevel(this, 3, { bossStart: true }));
      neonButton(this, W / 2, 320, 'RETRY BOSS FIGHT', retryBoss);
      neonButton(this, W / 2 - 150, 390, 'RESTART LEVEL', retry, 260, 46, 17);
      neonButton(this, W / 2 + 150, 390, 'MAIN MENU', menu, 260, 46, 17);
      neonText(this, W / 2, 460, 'ENTER = RETRY BOSS', 12, CSS.violet).setAlpha(0.7);
      return [retryBoss];
    }
    neonButton(this, W / 2 - 160, 340, 'RETRY', retry);
    neonButton(this, W / 2 + 160, 340, 'MAIN MENU', menu);
    neonText(this, W / 2, 420, 'ENTER = RETRY', 12, CSS.violet).setAlpha(0.7);
    return [retry];
  }

  // Fade out once, then switch scenes
  _go(fn) {
    if (this._leaving) return;
    this._leaving = true;
    Sound.init(); Sound.sfx('ok'); Sound.startMusic('main');
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', fn);
  }
}

// =============================================================
//  ENDING SCENE — "The Final Escape" cutscene + credits
// =============================================================
class EndingScene extends Phaser.Scene {
  constructor() { super('EndingScene'); }

  init(data) { this.stats = data || {}; }

  create() {
    this._credits = false; this._leaving = false;
    Sound.stopMusic();
    const cam = this.cameras.main;
    cam.fadeIn(800);
    if (this.renderer.type === Phaser.WEBGL) {
      try { cam.postFX.addBloom(0xffffff, 1, 1, 1, 1, 3); } catch (e) { /* optional */ }
    }

    // ---- Sky, sun, night overlay, stars ----
    this.add.image(0, 0, 'sky_dawn').setOrigin(0);
    this.sunGlow = this.add.image(760, 560, 'glow').setTint(COLORS.gold).setScale(6).setAlpha(0.9).setBlendMode(Phaser.BlendModes.ADD);
    this.sun = this.add.circle(760, 560, 46, COLORS.gold);
    this.night = this.add.rectangle(W / 2, H / 2, W, H, 0x05030d, 0.93);
    this.stars = [];
    for (let i = 0; i < 60; i++) {
      const s = this.add.rectangle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, 300), 2, 2, 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
      this.tweens.add({ targets: s, alpha: 0.1, duration: Phaser.Math.Between(400, 1400), yoyo: true, repeat: -1 });
      this.stars.push(s);
    }

    // ---- City, NEXUS tower, ground ----
    this.add.image(0, 120, 'city').setOrigin(0).setAlpha(0.95);
    this.tower = this.add.container(250, 470);
    const towerImg = this.add.image(0, 0, 'tower').setOrigin(0.5, 1);
    this.towerGlow = this.add.image(0, -420, 'glow').setTint(COLORS.red).setScale(3).setAlpha(0.8).setBlendMode(Phaser.BlendModes.ADD);
    this.towerEye = this.add.image(0, -420, 'boss').setScale(0.55);
    const towerEyeIris = this.add.image(0, -420, 'boss_eye').setScale(0.55);
    this.tower.add([towerImg, this.towerGlow, this.towerEye, towerEyeIris]);
    this.tweens.add({ targets: this.towerGlow, alpha: 0.3, duration: 200, yoyo: true, repeat: -1 });
    this.add.rectangle(W / 2, 505, W, 70, 0x0a0716);
    this.add.rectangle(W / 2, 470, W, 2, COLORS.cyan, 0.8);

    // ---- ARIA ----
    this.aria = this.add.sprite(250, 470, 'aria_idle').setOrigin(0.5, 1).setScale(2).setAlpha(0);
    this.ariaGlow = this.add.image(250, 430, 'glow').setTint(COLORS.cyan).setScale(1.8).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);

    // ---- Particles ----
    this.boomEm = this.add.particles(0, 0, 'spark', {
      speed: { min: 60, max: 240 }, angle: { min: 0, max: 360 }, scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 }, lifespan: 700, gravityY: 250,
      tint: [COLORS.red, COLORS.gold, COLORS.magenta, COLORS.white], blendMode: Phaser.BlendModes.ADD, emitting: false
    }).setDepth(5);
    this.dustEm = this.add.particles(0, 0, 'spark', {
      speed: { min: 20, max: 90 }, angle: { min: 200, max: 340 }, scale: { start: 2.5, end: 0 },
      alpha: { start: 0.5, end: 0 }, lifespan: 1600, tint: [0x3a2f5e, 0x5a4a7e], emitting: false
    }).setDepth(4);

    // ---- Story text lines ----
    this.line1 = neonText(this, W / 2, 70, '', 22, CSS.magenta).setDepth(10);
    this.line2 = neonText(this, W / 2, 108, '', 22, CSS.cyan).setDepth(10);
    this.line3 = neonText(this, W / 2, 160, '', 36, CSS.gold).setDepth(10);

    // ---- Skip ----
    this.skipBtn = neonButton(this, W - 90, H - 30, 'SKIP  ▶', () => this._showCredits(), 140, 36, 13).setDepth(20);
    this.input.keyboard.on('keydown', e => {
      if (!this._credits && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) this._showCredits();
    });

    this._playTimeline();
  }

  // Run fn after ms, unless the player skipped to the credits
  _at(ms, fn) { this.time.delayedCall(ms, () => { if (!this._credits) fn(); }); }

  // One explosion on the tower
  _boom(x, y, s = 1) {
    const f = this.add.image(x, y, 'glow').setTint(COLORS.gold).setScale(0.4 * s).setBlendMode(Phaser.BlendModes.ADD).setDepth(5);
    this.tweens.add({ targets: f, scale: 2.4 * s, alpha: 0, duration: 400, onComplete: () => f.destroy() });
    this.boomEm.explode(Math.round(12 * s), x, y);
    Sound.sfx('explode');
  }

  // The scripted cutscene
  _playTimeline() {
    const cam = this.cameras.main;

    // 0.3s: the tower is exploding
    this._at(300, () => {
      typeText(this, this.line1, 'NEXUS PRIME DESTROYED — THE TOWER IS COLLAPSING!', 35);
      cam.shake(3600, 0.004);
      this.boomEvent = this.time.addEvent({
        delay: 260, loop: true,
        callback: () => this._boom(this.tower.x + Phaser.Math.Between(-55, 55), this.tower.y - Phaser.Math.Between(40, 420), Phaser.Math.FloatBetween(0.6, 1.2))
      });
    });

    // 1.0s: ARIA bursts out of the door and runs
    this._at(1000, () => {
      this._boom(250, 440, 1.2);
      this.aria.setAlpha(1).play('run');
      this.ariaGlow.setAlpha(0.3);
      this.tweens.add({
        targets: this.aria, x: 640, duration: 2600,
        onUpdate: () => {
          this.ariaGlow.setPosition(this.aria.x, 430);
          if (Math.random() < 0.3) this.dustEm.explode(1, this.aria.x, 468);
        },
        onComplete: () => { this.aria.play('idle'); this.aria.setFlipX(true); }   // looks back
      });
    });

    // 3.9s: the final blast — the tower sinks into the ground
    this._at(3900, () => {
      if (this.boomEvent) this.boomEvent.remove();
      this.line1.setText('');
      cam.flash(700, 255, 255, 255);
      cam.shake(1400, 0.02);
      Sound.sfx('bigBoom');
      this._boom(250, 200, 3);
      this.tweens.add({ targets: this.tower, y: 920, angle: 6, duration: 2600, ease: 'Quad.in' });
      this.tweens.add({ targets: [this.towerGlow, this.towerEye], alpha: 0, duration: 1200 });
      for (let i = 0; i < 10; i++) this.time.delayedCall(i * 180, () => this.dustEm.explode(14, 250 + Phaser.Math.Between(-90, 90), 468));
    });

    // 6.6s: sunrise
    this._at(6600, () => {
      Sound.startMusic('ending');
      this.tweens.add({ targets: this.night, alpha: 0.12, duration: 3500 });
      this.tweens.add({ targets: this.stars, alpha: 0, duration: 3000 });
      this.tweens.add({ targets: [this.sun, this.sunGlow], y: 400, duration: 4000, ease: 'Sine.out' });
    });

    // 7.4s: ARIA turns to the sun and jumps for joy
    this._at(7400, () => {
      this.aria.setFlipX(false);
      this.tweens.add({
        targets: this.aria, y: 440, duration: 260, yoyo: true, repeat: 1, ease: 'Sine.out', delay: 400,
        onStart: () => this.aria.play('jump'), onComplete: () => this.aria.play('idle')
      });
    });

    // 8.2s → 11s: the story text
    this._at(8200,  () => typeText(this, this.line1, 'NEXUS IS OFFLINE.', 60));
    this._at(9700,  () => typeText(this, this.line2, 'THE CITY BREATHES AGAIN.', 60));
    this._at(11400, () => { typeText(this, this.line3, 'ARIA ESCAPED.', 90); Sound.sfx('win'); });

    // 14s: credits
    this.time.delayedCall(14000, () => this._showCredits());
  }

  // Credits panel with stats and buttons (also reached by SKIP)
  _showCredits() {
    if (this._credits) return;
    this._credits = true;
    this.skipBtn.setVisible(false);
    if (this.boomEvent) this.boomEvent.remove();

    // Jump to the final state of the cutscene
    this.tweens.killTweensOf([this.night, this.sun, this.sunGlow, this.tower, this.aria, ...this.stars]);
    this.night.setAlpha(0.12); this.stars.forEach(s => s.setAlpha(0));
    this.sun.setY(400); this.sunGlow.setY(400);
    this.tower.setVisible(false);
    this.aria.setAlpha(1).setPosition(640, 470).setFlipX(false).play('idle');
    this.ariaGlow.setAlpha(0.3).setPosition(640, 430);
    [this.line1, this.line2, this.line3].forEach(t => t.setVisible(false));
    Sound.startMusic('ending');

    const s = this.stats;
    const panel = this.add.container(W / 2, 0).setDepth(30).setAlpha(0);
    panel.add([
      this.add.rectangle(0, 205, 620, 330, 0x0b0f2a, 0.88).setStrokeStyle(3, COLORS.cyan),
      neonText(this, 0, 82, 'AETHERLOCK', 54, CSS.cyan, CSS.magenta).setShadow(0, 0, CSS.magenta, 24, true, true),
      neonText(this, 0, 128, 'T H E   L A S T   E S C A P E', 16, CSS.violet),
      neonText(this, 0, 166, 'MISSION COMPLETE — NEXUS PRIME DESTROYED', 15, CSS.green),
      neonText(this, 0, 196, `TIME LEFT  ${mmss(s.timeLeft || 0)}   ·   HEARTS  ${s.health || 0} / ${s.maxHealth || 5}`, 14, CSS.gold),
      neonText(this, 0, 230, 'THANK YOU FOR PLAYING', 18, CSS.cyan),
      neonText(this, 0, 258, 'Built with Phaser 3 · all art and sound generated in code', 11, CSS.violet)
    ]);
    const again = () => this._go(() => goToLevel(this, 1));
    const menu = () => this._go(() => switchTo(this, 'MenuScene'));
    panel.add([
      neonButton(this, -150, 318, 'PLAY AGAIN', again, 260, 48, 18),
      neonButton(this, 150, 318, 'MAIN MENU', menu, 260, 48, 18)
    ]);
    this.tweens.add({ targets: panel, alpha: 1, duration: 800 });
    this.input.keyboard.on('keydown-ENTER', () => { if (this._credits) again(); });
    fireworks(this, 30);
  }

  _go(fn) {
    if (this._leaving) return;
    this._leaving = true;
    Sound.sfx('ok');
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', fn);
  }
}

// =============================================================
//  PHASER GAME CONFIG
// =============================================================
const config = {
  type: Phaser.WEBGL,
  width: W, height: H, parent: 'game',
  backgroundColor: '#05030d', pixelArt: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { gravity: { y: 1400 }, debug: false } },
  scene: [BootScene, MenuScene, GameScene, UIScene, PuzzleScene, EndScene, EndingScene]
};

// Start only after the Orbitron font is ready
document.fonts.load('700 20px Orbitron')
  .then(() => new Phaser.Game(config))
  .catch(() => new Phaser.Game(config));
