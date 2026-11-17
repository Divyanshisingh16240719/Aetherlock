// =============================================================
//  AETHERLOCK: THE LAST ESCAPE
//  Engine: Phaser 3.80.1  |  All art & audio generated in code
// =============================================================

// ---- TUNABLE CONSTANTS ----
const TUNE = {
  moveSpeed: 220, jump: -540, coyote: 100, jumpBuffer: 120,
  invulnMs: 1200, startTime: 120, startHealth: 3,
  puzzleCode: '2099', puzzleCode2: '4040'
};

// ---- COLOUR PALETTE ----
const W = 960, H = 540;
const COLORS = {
  bg: 0x05030d, navy: 0x0b0f2a, cyan: 0x00f0ff, violet: 0x8a2be2,
  magenta: 0xff2bd6, red: 0xff2e4d, green: 0x39ff88, gold: 0xffd84a, white: 0xffffff
};
const CSS = {
  cyan: '#00f0ff', violet: '#b57bff', magenta: '#ff2bd6',
  red: '#ff2e4d', green: '#39ff88', gold: '#ffd84a', white: '#ffffff'
};

// =============================================================
//  SOUND ENGINE — Web Audio API synth (no audio files)
// =============================================================
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const Sound = {
  ctx: null, master: null, musicGain: null, sfxGain: null,
  timer: null, step: 0, nextTime: 0, muted: false,

  // Initialise audio context (must be called from a user gesture)
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.6;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.5;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain(); this.sfxGain.gain.value = 0.9;
    this.sfxGain.connect(this.master);
  },

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

  // Play a noise burst (hi-hat, landing, hurt)
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
    if (!this.ctx) return;
    switch (name) {
      case 'jump':   this.tone(280, 0.15, 'square', 0.12, 620); break;
      case 'land':   this.noise(0.06, 0.08, null, null, 1500); break;
      case 'step':   this.noise(0.03, 0.03, null, null, 2500); break;
      case 'pickup': [880, 1175, 1568].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.2, null, this.ctx.currentTime + i * 0.07)); break;
      case 'hurt':   this.tone(220, 0.35, 'sawtooth', 0.25, 50); this.noise(0.2, 0.15, null, null, 800); break;
      case 'deny':   this.tone(180, 0.12, 'square', 0.18); this.tone(140, 0.2, 'square', 0.18, null, this.ctx.currentTime + 0.13); break;
      case 'key':    this.tone(700 + Math.random() * 80, 0.05, 'square', 0.1); break;
      case 'ok':     [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.15, 'square', 0.15, null, this.ctx.currentTime + i * 0.08)); break;
      case 'unlock': this.tone(120, 0.5, 'sawtooth', 0.2, 400); this.noise(0.3, 0.1, null, null, 3000); break;
      case 'laser':  this.tone(900, 0.2, 'sawtooth', 0.04, 300); break;
      case 'tick':   this.tone(1000, 0.04, 'square', 0.08); break;
      case 'win':    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.22, 'square', 0.16, null, this.ctx.currentTime + i * 0.11)); break;
      case 'lose':   [392, 349, 294, 220].forEach((f, i) => this.tone(f, 0.3, 'sawtooth', 0.18, null, this.ctx.currentTime + i * 0.2)); break;
      case 'ui':     this.tone(660, 0.06, 'triangle', 0.15); break;
    }
  },

  // A-minor synthwave music loop, 108 BPM
  CHORDS: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],
  startMusic() {
    if (!this.ctx || this.timer) return;
    this.step = 0; this.nextTime = this.ctx.currentTime + 0.1;
    const stepDur = 60 / 108 / 4;
    this.timer = setInterval(() => {
      while (this.nextTime < this.ctx.currentTime + 0.2) {
        const i = this.step, t = this.nextTime;
        const chord = this.CHORDS[Math.floor(i / 16) % 4];
        const arp = [0, 1, 2, 1][i % 4];
        this.tone(mtof(chord[arp] + 12), 0.11, 'square', 0.035, null, t, this.musicGain);
        if (i % 8 === 0) this.tone(mtof(chord[0] - 24), stepDur * 7, 'sawtooth', 0.1, null, t, this.musicGain);
        if (i % 4 === 0) this.tone(130, 0.14, 'sine', 0.35, 40, t, this.musicGain);   // kick
        if (i % 2 === 1) this.noise(0.03, 0.04, t, this.musicGain, 7000);              // hi-hat
        if (i % 16 === 0) this.tone(mtof(chord[0] + 24), 1.2, 'triangle', 0.03, null, t, this.musicGain); // pad
        this.nextTime += stepDur; this.step = (this.step + 1) % 64;
      }
    }, 30);
  },
  stopMusic() { clearInterval(this.timer); this.timer = null; },
  duck(on) { if (this.musicGain) this.musicGain.gain.value = on ? 0.15 : 0.5; },

  // Toggle master mute with M key
  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.6;
  }
};

// =============================================================
//  UI HELPERS — neonText and neonButton (no external UI lib)
// =============================================================

// Create a glowing neon text object
function neonText(scene, x, y, str, size, color, strokeColor) {
  return scene.add.text(x, y, str, {
    fontFamily: 'Orbitron, monospace',
    fontSize: size + 'px',
    fontStyle: '700',
    color,
    stroke: strokeColor || color,
    strokeThickness: 1
  }).setOrigin(0.5).setShadow(0, 0, color, 12, true, true);
}

// Create an interactive neon button (returns a Container)
function neonButton(scene, x, y, label, onClick) {
  const bw = 280, bh = 52;
  const bg = scene.add.rectangle(0, 0, bw, bh, 0x0b0f2a, 0.85)
    .setStrokeStyle(2, COLORS.violet);
  const tx = neonText(scene, 0, 0, label, 20, CSS.cyan);
  const c = scene.add.container(x, y, [bg, tx])
    .setSize(bw, bh).setInteractive({ useHandCursor: true });
  c.on('pointerover', () => {
    bg.setStrokeStyle(3, COLORS.cyan);
    bg.setFillStyle(0x151a4a, 1);
    c.setScale(1.04);
    Sound.sfx('ui');
  });
  c.on('pointerout', () => {
    bg.setStrokeStyle(2, COLORS.violet);
    bg.setFillStyle(0x0b0f2a, 0.85);
    c.setScale(1);
  });
  c.on('pointerdown', onClick);
  return c;
}

// =============================================================
//  TEXTURE HELPERS (used in BootScene)
// =============================================================

// Draw pixel art from a character map
function pixelTex(scene, key, rows, palette, scale) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ch !== '.') {
      g.fillStyle(palette[ch], 1);
      g.fillRect(x * scale, y * scale, scale, scale);
    }
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
  c.fillStyle = gr;
  c.fillRect(0, 0, 128, 128);
  t.refresh();
}

// =============================================================
//  BOOT SCENE — generates all textures once
// =============================================================
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    // Only generate textures once (safe after scene restart)
    if (!this.textures.exists('platform')) {
      this._makeAllTextures();
    }
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'aria_idle' }],
      frameRate: 1, repeat: -1
    });
    this.anims.create({
      key: 'run',
      frames: [
        { key: 'aria_runA' }, { key: 'aria_runB' },
        { key: 'aria_runA' }, { key: 'aria_runB' }
      ],
      frameRate: 10, repeat: -1
    });
    this.anims.create({
      key: 'jump',
      frames: [{ key: 'aria_runA' }],
      frameRate: 1, repeat: -1
    });
    this.scene.start('MenuScene');
  }

  // ---- Generate every texture the game needs ----
  _makeAllTextures() {
    // ARIA sprite palette
    const AP = {
      H: 0x7b2fff, h: 0xb57bff, S: 0xf2b79a, C: 0x00f0ff,
      D: 0x1a1033, B: 0x2d1b5e, M: 0xff2bd6
    };
    // ARIA: shared top 12 rows
    const ARIA_TOP = [
      '...HHHHHH...',
      '..HHhhHHHH..',
      '.HHHSSSSHHH.',
      '.HHSCSSCSHH.',
      '.HHSSSSSSHH.',
      '..HHSSSSHH..',
      '...BCCCCB...',
      '..BBBMMBBB..',
      '.SBBBCCBBBS.',
      '.SBBBCCBBBS.',
      '..BBBBBBBB..',
      '..DDDDDDDD..'
    ];
    const ARIA_LEGS_IDLE = ['..DDD..DDD..', '..DDD..DDD..', '..DDD..DDD..', '.CCCC..CCCC.'];
    const ARIA_LEGS_A    = ['.DDD....DDD.', '.DD......DD.', 'CCC......CCC', 'CC........CC'];
    const ARIA_LEGS_B    = ['...DDDDDD...', '...DDDDDD...', '...DDDDDD...', '...CCCCCC...'];

    pixelTex(this, 'aria_idle', [...ARIA_TOP, ...ARIA_LEGS_IDLE], AP, 3);
    pixelTex(this, 'aria_runA', [...ARIA_TOP, ...ARIA_LEGS_A],    AP, 3);
    pixelTex(this, 'aria_runB', [...ARIA_TOP, ...ARIA_LEGS_B],    AP, 3);

    // Platform tile (32×16): dark fill + cyan top line
    makeTex(this, 'platform', 32, 16, g => {
      g.fillStyle(0x141a3a); g.fillRect(0, 0, 32, 16);
      g.fillStyle(0x00f0ff, 0.9); g.fillRect(0, 0, 32, 2);
      g.fillStyle(0x2d1b5e); g.fillRect(0, 15, 32, 1);
      g.fillStyle(0x2a3470); g.fillRect(4, 8, 4, 4); g.fillRect(24, 8, 4, 4);
    });

    // Ground tile (32×32): dark + cyan top + blue bottom
    makeTex(this, 'ground', 32, 32, g => {
      g.fillStyle(0x0f1430); g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x00f0ff, 0.9); g.fillRect(0, 0, 32, 3);
      g.fillStyle(0x0a0d22); g.fillRect(0, 16, 32, 16);
      g.fillStyle(0x2a3470); g.fillRect(0, 0, 1, 32);
    });

    // Drone (36×30)
    makeTex(this, 'drone', 36, 30, g => {
      g.fillStyle(0x2a2f55); g.fillEllipse(18, 15, 30, 16);
      g.fillStyle(0x4a5190); g.fillEllipse(18, 11, 26, 8);
      g.fillStyle(0xff2e4d); g.fillCircle(18, 15, 5);
      g.fillStyle(0xffffff); g.fillCircle(16, 13, 2);
      g.lineStyle(1, 0x7b84c9); g.beginPath(); g.moveTo(18, 8); g.lineTo(14, 2); g.strokePath();
      g.beginPath(); g.moveTo(18, 8); g.lineTo(22, 2); g.strokePath();
      g.fillStyle(0x7b84c9); g.fillRect(0, 8, 6, 3); g.fillRect(30, 8, 6, 3);
    });

    // Access card (24×16)
    makeTex(this, 'card', 24, 16, g => {
      g.fillStyle(0x00f0ff); g.fillRoundedRect(0, 0, 24, 16, 2);
      g.fillStyle(0x05030d); g.fillRect(3, 3, 18, 10);
      g.fillStyle(0x00f0ff); g.fillRect(5, 5, 6, 4);
      g.fillStyle(0xff2bd6); g.fillRect(12, 5, 8, 2);
    });

    // Terminal (48×64)
    makeTex(this, 'terminal', 48, 64, g => {
      g.fillStyle(0x1a1033); g.fillRect(0, 0, 48, 64);
      g.lineStyle(2, 0x8a2be2); g.strokeRect(1, 1, 46, 62);
      g.fillStyle(0x06122b); g.fillRect(6, 6, 36, 28);
      g.lineStyle(1, 0x00f0ff); g.strokeRect(6, 6, 36, 28);
      g.fillStyle(0x39ff88);
      g.fillRect(10, 12, 20, 2); g.fillRect(10, 18, 14, 2);
      g.fillRect(10, 24, 24, 2); g.fillRect(10, 30, 10, 2);
      g.fillStyle(0x2a1a4a); g.fillRect(4, 44, 40, 14);
      g.fillStyle(0xff2bd6);
      g.fillCircle(12, 51, 2); g.fillCircle(22, 51, 2); g.fillCircle(32, 51, 2);
    });

    // Door locked (32×128): violet frame + red lock
    makeTex(this, 'door', 32, 128, g => {
      g.fillStyle(0x2d1b5e); g.fillRect(0, 0, 32, 128);
      g.lineStyle(3, 0x8a2be2); g.strokeRect(1, 1, 30, 126);
      g.fillStyle(0x5a2fb0);
      for (let yy = 16; yy < 128; yy += 16) g.fillRect(0, yy, 32, 2);
      g.fillStyle(0xff2e4d); g.fillRect(10, 56, 12, 16);
    });

    // Door open (32×128): green lock, semi-transparent
    makeTex(this, 'door_open', 32, 128, g => {
      g.fillStyle(0x2d1b5e, 0.35); g.fillRect(0, 0, 32, 128);
      g.lineStyle(3, 0x8a2be2, 0.35); g.strokeRect(1, 1, 30, 126);
      g.fillStyle(0x5a2fb0, 0.35);
      for (let yy = 16; yy < 128; yy += 16) g.fillRect(0, yy, 32, 2);
      g.fillStyle(0x39ff88); g.fillRect(10, 56, 12, 16);
    });

    // Exit portal (64×96)
    makeTex(this, 'portal', 64, 96, g => {
      g.fillStyle(0x00f0ff, 0.25); g.fillRoundedRect(4, 4, 56, 88, 8);
      g.lineStyle(4, 0x00f0ff); g.strokeRoundedRect(4, 4, 56, 88, 8);
      g.fillStyle(0x00f0ff, 0.4);
      g.fillRect(14, 28, 36, 4); g.fillRect(14, 44, 36, 4); g.fillRect(14, 60, 36, 4);
    });

    // Heart (20×18) full
    makeTex(this, 'heart', 20, 18, g => {
      const hMap = [
        '.HH..HH.',
        'HHHHHHH.',
        'HHHHHHH.',
        '.HHHHH..',
        '..HHH...',
        '...H....'
      ];
      const hPal = { H: 0xff2e4d };
      hMap.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch === 'H') { g.fillStyle(hPal.H); g.fillRect(x * 2 + 2, y * 3, 2, 3); }
      }));
      g.fillStyle(0xff9aa8); g.fillRect(4, 1, 2, 2);
    });

    // Heart empty (20×18)
    makeTex(this, 'heart_empty', 20, 18, g => {
      const hMap = [
        '.HH..HH.',
        'HHHHHHH.',
        'HHHHHHH.',
        '.HHHHH..',
        '..HHH...',
        '...H....'
      ];
      hMap.forEach((row, y) => [...row].forEach((ch, x) => {
        if (ch === 'H') { g.fillStyle(0x3a1a2a); g.fillRect(x * 2 + 2, y * 3, 2, 3); }
      }));
      g.lineStyle(1, 0xff2e4d);
    });

    // Spark particle (8×8)
    makeTex(this, 'spark', 8, 8, g => {
      g.fillStyle(0xffffff); g.fillCircle(4, 4, 4);
    });

    // Rain particle (2×2)
    makeTex(this, 'rain', 2, 2, g => {
      g.fillStyle(0xffffff); g.fillRect(0, 0, 2, 2);
    });

    // Dust particle (2×2, same)
    makeTex(this, 'dust', 2, 2, g => {
      g.fillStyle(0xaaddff); g.fillRect(0, 0, 2, 2);
    });

    // Grid tile (64×64): thin blue lines on transparent
    makeTex(this, 'grid_tile', 64, 64, g => {
      g.lineStyle(1, 0x1a2250, 1);
      g.strokeRect(0, 0, 64, 64);
    });

    // Laser emitter (16×16)
    makeTex(this, 'laser_emitter', 16, 16, g => {
      g.fillStyle(0x1a1033); g.fillRect(0, 0, 16, 16);
      g.lineStyle(1, 0x8a2be2); g.strokeRect(0, 0, 16, 16);
      g.fillStyle(0xff2e4d); g.fillRect(5, 5, 6, 6);
    });

    // Scanlines (4×4): lower 2 rows semi-black
    makeTex(this, 'scanlines', 4, 4, g => {
      g.fillStyle(0x000000, 0.25); g.fillRect(0, 2, 4, 2);
    });

    // Skyline far background (960×540)
    makeTex(this, 'skyline_far', 960, 540, g => {
      g.fillStyle(0x05030d); g.fillRect(0, 0, 960, 540);
      // City silhouette buildings
      const buildings = [
        [0, 320, 60, 220], [70, 350, 50, 190], [130, 280, 80, 260],
        [220, 360, 40, 180], [270, 300, 90, 240], [370, 340, 50, 200],
        [430, 260, 70, 280], [510, 350, 60, 190], [580, 290, 100, 250],
        [690, 330, 55, 210], [755, 370, 45, 170], [810, 270, 85, 270],
        [905, 310, 55, 230]
      ];
      buildings.forEach(([x, y, w, h]) => {
        g.fillStyle(0x0a0d22); g.fillRect(x, y, w, h);
        // Windows
        g.fillStyle(0x1a2a4a);
        for (let wy = y + 10; wy < y + h - 10; wy += 20) {
          for (let wx = x + 5; wx < x + w - 5; wx += 14) {
            if (Math.random() > 0.4) g.fillRect(wx, wy, 6, 8);
          }
        }
      });
    });

    // Glow texture (canvas-based radial gradient)
    if (!this.textures.exists('glow')) makeGlowTex(this);
  }
}

// =============================================================
//  MENU SCENE
// =============================================================
class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const cam = this.cameras.main;
    this._audioStarted = false;
    this._howToOpen = false;

    // --- Animated background ---
    this.bgGrid = this.add.tileSprite(0, 0, W, H, 'grid_tile')
      .setOrigin(0).setAlpha(0.5);
    this.add.image(0, 0, 'skyline_far').setOrigin(0).setAlpha(0.4);

    // Data rain particles
    this.add.particles(W / 2, -10, 'rain', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-W / 2, 0, W, 1) },
      speedY: { min: 80, max: 180 },
      lifespan: 4000,
      alpha: { start: 0.5, end: 0 },
      tint: 0x00f0ff,
      frequency: 60,
      scale: { min: 1, max: 2 },
      scrollFactor: 0
    });

    // Big glow blobs (violet left, cyan right)
    this.add.image(160, 270, 'glow')
      .setTint(COLORS.violet).setAlpha(0.18)
      .setScale(5).setBlendMode(Phaser.BlendModes.ADD);
    this.add.image(800, 270, 'glow')
      .setTint(COLORS.cyan).setAlpha(0.18)
      .setScale(5).setBlendMode(Phaser.BlendModes.ADD);

    // --- Title ---
    this.titleMain = neonText(this, W / 2, 130, 'AETHERLOCK', 72, CSS.cyan, CSS.magenta);
    this.titleMain.setShadow(0, 0, CSS.magenta, 24, true, true);

    // Glitch title duplicates (hidden by default)
    this.titleGlitchC = this.add.text(W / 2 - 3, 130, 'AETHERLOCK', {
      fontFamily: 'Orbitron, monospace', fontSize: '72px', fontStyle: '700', color: CSS.cyan
    }).setOrigin(0.5).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    this.titleGlitchM = this.add.text(W / 2 + 3, 133, 'AETHERLOCK', {
      fontFamily: 'Orbitron, monospace', fontSize: '72px', fontStyle: '700', color: CSS.magenta
    }).setOrigin(0.5).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);

    // Schedule random glitch effects
    this._scheduleGlitch();

    neonText(this, W / 2, 196, 'C Y B E R P U N K  :  T H E  L A S T  E S C A P E', 18, CSS.violet);
    neonText(this, W / 2, 510, '"In a world controlled by machines, freedom is the ultimate hack."', 12, CSS.violet);

    // "Press Enter" blink hint
    this.pressEnter = neonText(this, W / 2, 240, 'PRESS  ENTER  OR  CLICK  TO  START', 14, CSS.cyan);
    this.tweens.add({ targets: this.pressEnter, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    // --- Buttons ---
    const startBtn = neonButton(this, W / 2, 290, 'START LEVEL 1', () => this._startGame(1));
    const lvl2Btn  = neonButton(this, W / 2, 348, 'START LEVEL 2', () => this._startGame(2));
    const howBtn   = neonButton(this, W / 2, 406, 'HOW TO PLAY',   () => this._toggleHowTo());
    const quitBtn  = neonButton(this, W / 2, 464, 'QUIT',          () => this._showToast('Close this tab to exit', CSS.violet));

    // --- ARIA decoration sprite ---
    this.ariaSprite = this.add.image(830, 420, 'aria_idle').setScale(5);
    const ariaCyan = this.add.image(830, 420, 'glow')
      .setTint(COLORS.cyan).setAlpha(0.3).setScale(3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: [this.ariaSprite, ariaCyan], y: 414, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // --- How-to-play overlay ---
    this.howPanel = this.add.container(W / 2, H / 2).setVisible(false);
    const panBg = this.add.rectangle(0, 0, 560, 360, 0x0b0f2a, 0.95)
      .setStrokeStyle(3, COLORS.violet);
    const panText = this.add.text(0, -140,
      'CONTROLS\n\nARROWS / WASD   —   Move\nSPACE / W / UP  —   Jump\nE               —   Interact / Hack\nP / ESC         —   Pause\nM               —   Mute\n\nCAMPAIGN OVERVIEW:\n· LEVEL 1: The Lab (Code 2099)\n· LEVEL 2: NEXUS Core (Moving Lifts, Code 4040)\n\nFind the ACCESS CARD, hack the TERMINAL,\nunlock the SECURITY DOOR, and reach the PORTAL!',
      { fontFamily: 'Orbitron, monospace', fontSize: '13px', color: CSS.cyan, align: 'left', lineSpacing: 5 }
    ).setOrigin(0.5, 0);
    const closeBtn = neonButton(this, 0, 140, 'CLOSE', () => this._toggleHowTo());
    this.howPanel.add([panBg, panText, closeBtn]);

    // --- Toast ---
    this.toast = neonText(this, W / 2, 480, '', 16, CSS.cyan).setAlpha(0);

    // --- Keyboard input ---
    const enterKey = this.input.keyboard.addKey('ENTER');
    const spaceKey = this.input.keyboard.addKey('SPACE');
    this.input.keyboard.on('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') this._startGame(1);
    });

    // Background grid scroll
    this._t = 0;
  }

  _scheduleGlitch() {
    const delay = Phaser.Math.Between(2000, 4000);
    this.time.delayedCall(delay, () => {
      this.titleGlitchC.setX(W / 2 + Phaser.Math.Between(-6, 6)).setAlpha(0.7);
      this.titleGlitchM.setX(W / 2 + Phaser.Math.Between(-6, 6)).setAlpha(0.7);
      this.time.delayedCall(120, () => {
        this.titleGlitchC.setAlpha(0);
        this.titleGlitchM.setAlpha(0);
      });
      this._scheduleGlitch();
    });
  }

  _startGame(level = 1) {
    if (this._starting) return;
    this._starting = true;
    Sound.init();
    Sound.sfx('ok');
    Sound.startMusic();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { level });
      this.scene.launch('UIScene', { level });
      this.scene.stop('MenuScene');
    });
  }

  _toggleHowTo() {
    this._howToOpen = !this._howToOpen;
    this.howPanel.setVisible(this._howToOpen);
  }

  _showToast(msg, color) {
    this.toast.setText(msg).setStyle({ color }).setAlpha(1);
    this.tweens.add({ targets: this.toast, alpha: 0, delay: 2200, duration: 500 });
  }

  update() {
    this._t = (this._t || 0) + 1;
    this.bgGrid.tilePositionX += 0.3;
    this.bgGrid.tilePositionY += 0.15;
  }
}

// =============================================================
//  GAME SCENE — main level
// =============================================================
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.level = (data && data.level) ? data.level : 1;
  }

  create() {
    // ---- Reset ALL state at top of create (safe on restart) ----
    this.hasCard       = false;
    this.doorOpen      = false;
    this.health        = TUNE.startHealth;
    this.maxHealth     = TUNE.startHealth;
    this.invulnerable  = false;
    this.timeLeft      = TUNE.startTime;
    this.gameEnded     = false;
    this.puzzleOpen    = false;
    this.lastCheckpoint = { x: 80, y: 440 };
    this._coyoteTimer  = 0;
    this._jumpBuffer   = 0;
    this._wasOnFloor   = false;
    this._stepTimer    = 0;
    this._dustTimer    = 0;
    this._variableJumpUsed = false;
    this._mKey         = null;
    this._pKey         = null;
    this._paused       = false;
    this.movingPlatforms = [];

    // Level configuration
    this.worldWidth = this.level === 2 ? 3400 : 3200;
    this.terminalX  = this.level === 2 ? 1850 : 1620;
    this.doorX      = this.level === 2 ? 1950 : 1800;
    this.portalX    = this.level === 2 ? 3300 : 3080;
    this.puzzleCode = this.level === 2 ? TUNE.puzzleCode2 : TUNE.puzzleCode;

    Sound.startMusic();

    // ---- Canvas focus (required for keyboard input) ----
    this.sys.game.canvas.setAttribute('tabindex', '0');
    this.sys.game.canvas.focus();
    this.input.on('pointerdown', () => {
      this.sys.game.canvas.focus();
    });

    // ---- Capture arrow keys so the browser doesn't scroll the page ----
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.SPACE
    ]);

    // ---- Input ----
    this.cursors   = this.input.keyboard.createCursorKeys();
    this.keyA      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyE      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._pKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this._mKey     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.keySpace  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEsc    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // ---- Physics world ----
    this.physics.world.setBounds(0, 0, this.worldWidth, 700);

    // ---- Build the world ----
    this._buildBackground();
    this._buildGround();
    this._buildPlatforms();
    this._buildPosters();
    this._buildObjects();

    // ---- Player (MUST be created before hazards & portal that overlap with it!) ----
    this.player = this.physics.add.sprite(80, 440, 'aria_idle');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(22, 44).setOffset(7, 4);
    this.player.play('idle');

    // Player colliders
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.platformGroup, null, (player, platform) => {
      // Land on platform only when falling downward and feet are at or above the top surface
      return player.body.velocity.y >= 0 && player.body.bottom <= platform.y + 14;
    }, this);
    this.physics.add.collider(this.player, this.doorObj, null, () => !this.doorOpen, this);

    // ---- Now build hazards and portal (safely overlaps with this.player) ----
    this._buildHazards();
    this._buildPortal();

    // ---- Camera ----
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.worldWidth, 540);
    cam.startFollow(this.player, true, 0.1, 0.1);
    cam.setDeadzone(120, 80);
    if (this.renderer.type === Phaser.WEBGL) {
      try {
        cam.postFX.addBloom(0xffffff, 1, 1, 1.2, 1.1, 4);
        cam.postFX.addVignette(0.5, 0.5, 0.85, 0.4);
      } catch (fxErr) {
        console.warn('PostFX not supported on this context:', fxErr);
      }
    }

    // ---- Scanline overlay ----
    this.add.tileSprite(0, 0, W, H, 'scanlines')
      .setOrigin(0).setScrollFactor(0).setDepth(1000).setAlpha(0.4);

    // ---- Lights ----
    this._buildLights();

    // ---- Player glow ----
    this.playerGlow = this.add.image(0, 0, 'glow')
      .setTint(COLORS.cyan).setAlpha(0.25).setScale(1.6)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(4);

    // ---- Particles ----
    this.dustEmitter = this.add.particles(0, 0, 'dust', {
      speed: { min: 20, max: 60 },
      angle: { min: 200, max: 340 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 300,
      tint: [0x00f0ff, 0xaaaaaa],
      emitting: false
    });
    this.runEmitter = this.add.particles(0, 0, 'dust', {
      speed: { min: 10, max: 30 },
      angle: { min: 150, max: 210 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 200,
      tint: 0x00f0ff,
      emitting: false
    });

    // ---- Timer ----
    this.timerEvent = this.time.addEvent({
      delay: 1000, loop: true, callback: this._tickTimer, callbackScope: this
    });

    // ---- Cross-scene puzzle solved listener ----
    const onSolved = () => { this._openDoor(); };
    this.game.events.on('puzzle:solved', onSolved);
    this.events.once('shutdown', () => {
      this.game.events.off('puzzle:solved', onSolved);
    });

    // ---- Ceiling lamp flicker ----
    for (let i = 0; i < 6; i++) {
      const lx = 200 + i * 480;
      const lamp = this.add.image(lx, 10, 'glow')
        .setTint(COLORS.cyan).setAlpha(0.35).setScale(2.5)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(5);
      this._flickerLamp(lamp);
    }

    // ---- Emit initial HUD state ----
    this.game.events.emit('hud:health', this.health);
    this.game.events.emit('hud:time', this.timeLeft);
    this.game.events.emit('hud:objective', this.level === 2 ? 'Find the Core Master Card' : 'Find the access card');
  }

  // ---- BACKGROUND (parallax layers) ----
  _buildBackground() {
    // Layer 1: flat fill (via camera bg color)
    // Layer 2: moving grid wall
    const gridTint = this.level === 2 ? COLORS.magenta : 0xffffff;
    this.bgFar = this.add.tileSprite(0, 0, W, H, 'grid_tile')
      .setOrigin(0).setScrollFactor(0).setAlpha(0.4).setDepth(0);
    if (this.level === 2) this.bgFar.setTint(gridTint);

    // Layer 2.5 (Level 2 only): Pulsing giant NEXUS Core AI Sphere in the background
    if (this.level === 2) {
      const coreOuter = this.add.image(1700, 230, 'glow')
        .setTint(COLORS.magenta).setAlpha(0.28).setScale(12)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(1);
      const coreInner = this.add.image(1700, 230, 'glow')
        .setTint(COLORS.red).setAlpha(0.45).setScale(6)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(1);
      this.tweens.add({
        targets: [coreOuter, coreInner],
        scaleX: '+=1', scaleY: '+=1', alpha: '+=0.1',
        duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut'
      });
    }

    // Layer 3: far pipes/panels (scrollFactor 0.4)
    const rnd = new Phaser.Math.RandomDataGenerator([this.level === 2 ? 'core' : 'aether']);
    const panelColor = this.level === 2 ? 0x1f0b2a : 0x10163a;
    const edgeColor = this.level === 2 ? COLORS.magenta : COLORS.cyan;
    for (let i = 0; i < 14; i++) {
      const px = rnd.between(0, 3300);
      const py = rnd.between(40, 300);
      const pw = rnd.between(40, 120);
      const ph = rnd.between(200, 460);
      const panel = this.add.rectangle(px, py, pw, ph, panelColor).setOrigin(0).setScrollFactor(0.4).setDepth(1);
      this.add.rectangle(px, py, pw, 1, edgeColor, 0.25).setOrigin(0).setScrollFactor(0.4).setDepth(1);
    }

    // Layer 4: glowing wall screens (scrollFactor 0.6)
    for (let i = 0; i < 10; i++) {
      const sx = rnd.between(0, 3200);
      const sy = rnd.between(60, 400);
      const screen = this.add.rectangle(sx, sy, 90, 56, 0x06122b).setOrigin(0).setScrollFactor(0.6).setDepth(2);
      screen.setStrokeStyle(1, edgeColor, 0.6);
      this.tweens.add({
        targets: screen, alpha: { from: 0.5, to: 1 },
        duration: rnd.between(600, 2000), yoyo: true, repeat: -1
      });
    }

    // Layer 5: hanging cables (scrollFactor 0.7)
    const cg = this.add.graphics().setScrollFactor(0.7).setDepth(2);
    cg.lineStyle(2, this.level === 2 ? 0x4a1835 : 0x2a3470);
    for (let i = 0; i < 8; i++) {
      const cx = rnd.between(100, 3200);
      const len = rnd.between(80, 200);
      cg.beginPath();
      cg.moveTo(cx, 0);
      for (let p = 1; p <= 12; p++) {
        const py = (len / 12) * p;
        const px2 = cx + Math.sin(p * 0.6) * 10;
        cg.lineTo(px2, py);
      }
      cg.strokePath();
      // Glow dot at cable end
      if (rnd.frac() > 0.5) {
        this.add.image(cx + Math.sin(12 * 0.6) * 10, len, 'glow')
          .setTint(this.level === 2 ? COLORS.red : COLORS.magenta).setAlpha(0.5).setScale(0.3)
          .setBlendMode(Phaser.BlendModes.ADD).setScrollFactor(0.7).setDepth(2);
      }
    }

    // Layer 6: floor reflection glow
    this.add.image(1600, 500, 'glow')
      .setTint(this.level === 2 ? COLORS.magenta : COLORS.cyan).setAlpha(0.12).setScale(30, 1.2)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(2);

    // Layer 7: falling data/core rain
    this.add.particles(W / 2, -10, 'rain', {
      emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-W / 2, 0, W, 1) },
      scrollFactor: 0,
      speedY: { min: 80, max: 180 },
      lifespan: 4000,
      alpha: { start: 0.5, end: 0 },
      tint: this.level === 2 ? [COLORS.magenta, COLORS.red] : COLORS.cyan,
      frequency: 60,
      scale: { min: 1, max: 2 }
    }).setDepth(3);
  }

  // ---- GROUND TILES ----
  _buildGround() {
    this.groundGroup = this.physics.add.staticGroup();
    const GROUND_Y = 508;
    const groundDefs = this.level === 2
      ? [
          { x: 0,    w: 800  },
          { x: 1050, w: 950  },
          { x: 2300, w: 1100 }
        ]
      : [
          { x: 0,    w: 1000 },
          { x: 1110, w: 990  },
          { x: 2200, w: 1000 }
        ];

    groundDefs.forEach(({ x, w }) => {
      const g = this.add.tileSprite(x, GROUND_Y, w, 32, 'ground').setOrigin(0, 0);
      this.physics.add.existing(g, true);
      g.body.updateFromGameObject();
      this.groundGroup.add(g);
    });

    // Red glow under pits (danger signal)
    const pits = this.level === 2 ? [[800, 1050], [2000, 2300]] : [[1000, 1110], [2100, 2200]];
    pits.forEach(([x1, x2]) => {
      const mx = (x1 + x2) / 2;
      this.add.image(mx, 560, 'glow')
        .setTint(COLORS.red).setAlpha(0.35).setScale((x2 - x1) / 60, 1)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(3);
    });
  }

  // ---- PLATFORMS ----
  _buildPlatforms() {
    this.platformGroup = this.physics.add.staticGroup();

    if (this.level === 2) {
      // Level 2 Platforms: Moving Lifts + Core Reactor High Climb
      // Horizontal Moving Energy Platform MP1 (crosses Pit 1)
      const mp1 = this.add.tileSprite(820, 440, 120, 16, 'platform').setOrigin(0, 0);
      this.physics.add.existing(mp1, true);
      mp1.body.updateFromGameObject();
      mp1.body.checkCollision.down  = false;
      mp1.body.checkCollision.left  = false;
      mp1.body.checkCollision.right = false;
      mp1.body.checkCollision.up    = true;
      this.platformGroup.add(mp1);
      this.movingPlatforms.push(mp1);
      this.tweens.add({
        targets: mp1, x: 1020, duration: 2400,
        yoyo: true, repeat: -1, ease: 'Sine.inOut'
      });

      // Vertical Elevator Platform MP2 (crosses Pit 2)
      const mp2 = this.add.tileSprite(2050, 440, 110, 16, 'platform').setOrigin(0, 0);
      this.physics.add.existing(mp2, true);
      mp2.body.updateFromGameObject();
      mp2.body.checkCollision.down  = false;
      mp2.body.checkCollision.left  = false;
      mp2.body.checkCollision.right = false;
      mp2.body.checkCollision.up    = true;
      this.platformGroup.add(mp2);
      this.movingPlatforms.push(mp2);
      this.tweens.add({
        targets: mp2, y: 330, duration: 2000,
        yoyo: true, repeat: -1, ease: 'Sine.inOut'
      });

      // Static platforms for Level 2
      const lvl2Platforms = [
        { x: 320,  y: 430, w: 140 }, // Sector 1 hop
        { x: 520,  y: 360, w: 140 },
        { x: 1250, y: 420, w: 140 }, // Reactor Core climb
        { x: 1450, y: 350, w: 140 },
        { x: 1650, y: 280, w: 200 }, // Where the Core Master Card rests
        { x: 2180, y: 350, w: 110 }, // Pit 2 landing bridge
        { x: 2480, y: 410, w: 140 }, // Sector 3 high route over laser
        { x: 2680, y: 340, w: 140 }
      ];
      lvl2Platforms.forEach(({ x, y, w }) => {
        const p = this.add.tileSprite(x, y, w, 16, 'platform').setOrigin(0, 0);
        this.physics.add.existing(p, true);
        p.body.updateFromGameObject();
        p.body.checkCollision.down  = false;
        p.body.checkCollision.left  = false;
        p.body.checkCollision.right = false;
        p.body.checkCollision.up    = true;
        this.platformGroup.add(p);
      });
    } else {
      // Level 1 Platforms
      const platforms = [
        { x: 300,  y: 430, w: 160 },
        { x: 520,  y: 360, w: 160 },
        { x: 760,  y: 300, w: 220 },
        { x: 2260, y: 420, w: 140 },
        { x: 2450, y: 350, w: 140 }
      ];
      platforms.forEach(({ x, y, w }) => {
        const p = this.add.tileSprite(x, y, w, 16, 'platform').setOrigin(0, 0);
        this.physics.add.existing(p, true);
        p.body.updateFromGameObject();
        p.body.checkCollision.down  = false;
        p.body.checkCollision.left  = false;
        p.body.checkCollision.right = false;
        p.body.checkCollision.up    = true;
        this.platformGroup.add(p);
      });
    }
  }

  // ---- STORY POSTERS ----
  _buildPosters() {
    const posterDefs = this.level === 2
      ? [
          { x: 330,  y: 200, text: '[ CORE LOG: AI MAINFRAME ]\nCOOLING OFFLINE\nOVERLOAD CODE: 4040', color: CSS.magenta, size: 17 },
          { x: 1100, y: 220, text: 'ENERGY LIFTS ACTIVE\nWATCH YOUR STEP', color: CSS.cyan, size: 15 },
          { x: 2000, y: 200, text: 'WARNING: CORE VOLTAGE CRITICAL', color: CSS.red, size: 15 },
          { x: 3200, y: 240, text: 'SURFACE EXTRACTION', color: CSS.green, size: 20 }
        ]
      : [
          { x: 330,  y: 200, text: '[ NEXUS LOG ]\nYEAR 2099 — AWAKENING\nHUMANS: OBSOLETE', color: CSS.magenta, size: 18 },
          { x: 1300, y: 230, text: 'TERMINAL AHEAD\nINSERT ACCESS CARD', color: CSS.cyan, size: 16 },
          { x: 1960, y: 210, text: 'DANGER: SECURITY DRONES', color: CSS.red, size: 16 },
          { x: 3000, y: 240, text: 'EXIT PORTAL', color: CSS.green, size: 20 }
        ];

    posterDefs.forEach(({ x, y, text, color, size }) => {
      this.add.text(x, y, text, {
        fontFamily: 'Orbitron, monospace', fontSize: size + 'px', color,
        stroke: color, strokeThickness: 1,
        shadow: { offsetX: 0, offsetY: 0, color, blur: 10, fill: true }
      }).setDepth(5);
    });
  }

  // ---- INTERACTIVE OBJECTS ----
  _buildObjects() {
    // Access card (bobbing on platform)
    const cardX = this.level === 2 ? 1750 : 870;
    const cardY = this.level === 2 ? 240 : 262;
    this.card = this.physics.add.sprite(cardX, cardY, 'card');
    this.card.body.allowGravity = false;
    this.card.body.immovable = true;
    if (this.level === 2) this.card.setTint(COLORS.magenta);
    this.cardGlow = this.add.image(cardX, cardY, 'glow')
      .setTint(this.level === 2 ? COLORS.magenta : COLORS.gold).setAlpha(0.4).setScale(1.5)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
    this.tweens.add({ targets: [this.card, this.cardGlow], y: cardY + 6, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

    // Terminal
    this.terminal = this.add.image(this.terminalX, 476, 'terminal').setOrigin(0.5, 1).setDepth(6);
    this.terminalZone = this.add.zone(this.terminalX, 470, 120, 100).setDepth(6);
    this.physics.world.enable(this.terminalZone);
    this.terminalZone.body.allowGravity = false;
    this.terminalZone.body.immovable = true;

    // "HACK" prompt label
    this.hackPrompt = neonText(this, this.terminalX, 400, '[E] HACK', 14, CSS.cyan).setDepth(7).setAlpha(0);
    this.tweens.add({ targets: this.hackPrompt, y: 394, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this._nearTerminal = false;

    // Door (static body, blocks player)
    this.doorObj = this.physics.add.staticImage(this.doorX, 508, 'door').setOrigin(0, 1).setDepth(6);

    // Door light
    this.doorLight = this.add.image(this.doorX + 16, 445, 'glow')
      .setTint(COLORS.red).setAlpha(0.4).setScale(1.5)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(5);
  }

  // ---- HAZARDS (drones + lasers) ----
  _buildHazards() {
    this.droneGroup = this.physics.add.group();
    this.laserGroup = this.physics.add.group();
    this.droneGlows = [];

    // --- Drones ---
    const droneDefs = this.level === 2
      ? [
          { id: 1, x: 420,  y: 468, x1: 420,  x2: 740,  dur: 2400, axis: 'x' }, // Hunter Drone patrolling Sector 1
          { id: 2, x: 1200, y: 468, x1: 1200, x2: 1540, dur: 2600, axis: 'x' }, // Reactor Sentry patrolling lower deck
          { id: 3, x: 2150, y: 260, y1: 220,  y2: 360,  dur: 1500, axis: 'y' }, // Vertical Hunter above Pit 2 elevator
          { id: 4, x: 2920, y: 468, x1: 2920, x2: 3200, dur: 2000, axis: 'x' }  // Core Apex Drone guarding exit
        ]
      : [
          { id: 1, x: 1180, y: 468, x1: 1180, x2: 1460, dur: 3000, axis: 'x' },
          { id: 2, x: 1900, y: 468, x1: 1900, x2: 2060, dur: 2200, axis: 'x' },
          { id: 3, x: 2760, y: 300, y1: 300,  y2: 460,  dur: 1800, axis: 'y' },
          { id: 4, x: 2830, y: 468, x1: 2830, x2: 3000, dur: 2000, axis: 'x' }
        ];

    droneDefs.forEach(dd => {
      const drone = this.physics.add.sprite(dd.x, dd.y, 'drone');
      drone.body.allowGravity = false;
      drone.body.immovable = true;
      if (this.level === 2) drone.setTint(COLORS.magenta);
      this.droneGroup.add(drone);

      const glow = this.add.image(dd.x, dd.y, 'glow')
        .setTint(this.level === 2 ? COLORS.magenta : COLORS.red).setAlpha(0.3).setScale(2)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
      this.droneGlows.push({ drone, glow });

      // Bob tween (y ±6)
      this.tweens.add({ targets: drone, y: dd.y + 6, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

      // Patrol tween
      if (dd.axis === 'x') {
        this.tweens.add({
          targets: drone, x: dd.x2, duration: dd.dur,
          yoyo: true, repeat: -1, ease: 'Sine.inOut',
          onYoyo: () => drone.setFlipX(true),
          onRepeat: () => drone.setFlipX(false)
        });
      } else {
        this.tweens.add({
          targets: drone, y: dd.y2, duration: dd.dur,
          yoyo: true, repeat: -1, ease: 'Sine.inOut'
        });
      }

      // Damage overlap
      this.physics.add.overlap(this.player, drone, () => {
        this.damagePlayer(drone);
      });
    });

    // --- Lasers ---
    const laserDefs = this.level === 2
      ? [
          { x: 1400, offset: 0,    onDur: 1100, offDur: 1300 }, // Approach to terminal
          { x: 1560, offset: 1200, onDur: 1100, offDur: 1300 }, // Alternating laser gate
          { x: 2520, offset: 0,    onDur: 1000, offDur: 1200 }, // Post-door high danger
          { x: 2780, offset: 1100, onDur: 1000, offDur: 1200 }  // Timed corridor escape
        ]
      : [
          { x: 2230, offset: 0,    onDur: 1200, offDur: 1400 },
          { x: 2620, offset: 1300, onDur: 1200, offDur: 1400 }
        ];

    laserDefs.forEach(ld => {
      const beamH = 492; // y 16 to 508
      // Emitter at top
      const emitter = this.add.image(ld.x, 16, 'laser_emitter').setDepth(7);

      // Laser beam (rect)
      const beam = this.add.rectangle(ld.x, 16 + beamH / 2, 6, beamH, this.level === 2 ? COLORS.magenta : COLORS.red)
        .setAlpha(0.9).setDepth(6);

      // Laser glow
      const laserGlow = this.add.image(ld.x, 16 + beamH / 2, 'glow')
        .setTint(this.level === 2 ? COLORS.magenta : COLORS.red).setAlpha(0.3).setScale(0.3, beamH / 60)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(5);

      // Physics zone
      const zone = this.add.zone(ld.x, 16 + beamH / 2, 6, beamH);
      this.physics.world.enable(zone);
      zone.body.allowGravity = false;
      zone.body.immovable = true;
      this.laserGroup.add(zone);

      let isOn = true;
      const toggle = (on) => {
        isOn = on;
        beam.setAlpha(on ? 0.9 : 0.08);
        laserGlow.setAlpha(on ? 0.3 : 0.05);
        zone.body.enable = on;
        if (on) Sound.sfx('laser');
      };

      const onDur = ld.onDur || 1200;
      const offDur = ld.offDur || 1400;

      // Laser cycle with warning blink
      const cycle = () => {
        toggle(true);
        this.time.delayedCall(onDur, () => {
          toggle(false);
          // Warning blink 300 ms before turning ON again
          this.time.delayedCall(Math.max(100, offDur - 300), () => {
            if (!this.gameEnded) {
              const blinkTween = this.tweens.add({
                targets: beam, alpha: 0.5, duration: 100, yoyo: true, repeat: 2
              });
            }
          });
          this.time.delayedCall(offDur, () => { if (!this.gameEnded) cycle(); });
        });
      };

      this.time.delayedCall(ld.offset, () => { if (!this.gameEnded) cycle(); });

      // Damage overlap
      this.physics.add.overlap(this.player, zone, () => {
        if (isOn) this.damagePlayer(zone);
      });
    });
  }

  // ---- EXIT PORTAL ----
  _buildPortal() {
    const px = this.portalX;
    this.portal = this.add.image(px, 460, 'portal').setOrigin(0.5).setDepth(6);
    this.portalGlow = this.add.image(px, 460, 'glow')
      .setTint(this.level === 2 ? COLORS.cyan : COLORS.green).setAlpha(0.4).setScale(5)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(4);
    this.tweens.add({ targets: this.portalGlow, alpha: 0.2, scale: 4.5, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    this.tweens.add({ targets: this.portal, angle: 360, duration: 6000, repeat: -1 });

    // Portal particles
    this.portalEmitter = this.add.particles(px, 460, 'spark', {
      speed: { min: 30, max: 80 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 800,
      tint: this.level === 2 ? [COLORS.magenta, COLORS.cyan, COLORS.gold] : [COLORS.cyan, COLORS.green],
      frequency: 80,
      blendMode: Phaser.BlendModes.ADD
    }).setDepth(6);

    // Exit zone
    this.exitZone = this.add.zone(px, 460, 60, 96);
    this.physics.world.enable(this.exitZone);
    this.exitZone.body.allowGravity = false;
    this.exitZone.body.immovable = true;
    this.physics.add.overlap(this.player, this.exitZone, () => {
      if (this.doorOpen && !this.gameEnded) this.endGame(true);
    });
  }

  // ---- LIGHTS ----
  _buildLights() {
    if (this.level === 2) {
      this._addLight(80, 440, COLORS.magenta, 2, 0.4, true);
      this._addLight(1750, 240, COLORS.gold, 2.5, 0.5, true);
      this._addLight(this.terminalX, 480, COLORS.magenta, 2, 0.4, true);
      this._addLight(this.portalX, 460, COLORS.cyan, 5, 0.5, true);
      this._addLight(2150, 400, COLORS.magenta, 2.5, 0.35, true);
    } else {
      // Cyan light under card
      this._addLight(870, 280, COLORS.cyan, 2, 0.4, true);
      // Cyan at terminal
      this._addLight(1620, 480, COLORS.cyan, 2, 0.4, true);
      // Green at portal
      this._addLight(3080, 460, COLORS.green, 5, 0.5, true);
      // Magenta at spawn
      this._addLight(80, 440, COLORS.magenta, 2, 0.4, true);
    }
  }

  _addLight(x, y, color, size = 3, alpha = 0.5, pulse = true) {
    const l = this.add.image(x, y, 'glow')
      .setTint(color).setBlendMode(Phaser.BlendModes.ADD)
      .setScale(size).setAlpha(alpha).setDepth(5);
    if (pulse) {
      this.tweens.add({
        targets: l, alpha: alpha * 0.55, scale: size * 0.9,
        duration: Phaser.Math.Between(700, 1400),
        yoyo: true, repeat: -1, ease: 'Sine.inOut'
      });
    }
    return l;
  }

  _flickerLamp(lamp) {
    this.time.addEvent({
      delay: Phaser.Math.Between(1500, 5000),
      callback: () => {
        lamp.setAlpha(0.05);
        this.time.delayedCall(80, () => { lamp.setAlpha(0.35); this._flickerLamp(lamp); });
      }
    });
  }

  // ---- TIMER TICK ----
  _tickTimer() {
    if (this.gameEnded) return;
    this.timeLeft--;
    this.game.events.emit('hud:time', this.timeLeft);
    if (this.timeLeft <= 15) Sound.sfx('tick');
    if (this.timeLeft <= 0) this.endGame(false, 'time');
  }

  // ---- DAMAGE PLAYER ----
  damagePlayer(source) {
    if (this.invulnerable || this.gameEnded) return;
    this.health--;
    this.game.events.emit('hud:health', this.health);
    Sound.sfx('hurt');
    this.cameras.main.shake(180, 0.012);
    this.cameras.main.flash(150, 255, 46, 77);

    if (source === 'pit') {
      // Respawn at checkpoint
      this.player.setPosition(this.lastCheckpoint.x, this.lastCheckpoint.y);
      this.player.setVelocity(0, 0);
    } else {
      // Knockback
      const kx = this.player.x < source.x ? -260 : 260;
      this.player.setVelocity(kx, -280);
    }

    if (this.health <= 0) { this.endGame(false, 'health'); return; }

    // Invulnerability + blink
    this.invulnerable = true;
    const blinkTween = this.tweens.add({
      targets: this.player, alpha: 0.3,
      duration: 100, yoyo: true, repeat: -1
    });
    this.time.delayedCall(TUNE.invulnMs, () => {
      this.invulnerable = false;
      blinkTween.stop();
      this.player.setAlpha(1);
    });
  }

  // ---- OPEN DOOR ----
  _openDoor() {
    this.doorOpen = true;
    this.doorObj.setTexture('door_open');
    this.doorObj.body.enable = false;
    // Door light turns green
    this.doorLight.setTint(COLORS.green);
    this.cameras.main.shake(100, 0.006);
    Sound.sfx('unlock');
    this.game.events.emit('hud:toast', 'SECURITY DOOR UNLOCKED', 'green');
    this.game.events.emit('hud:objective', 'Escape through the corridor');
    this.lastCheckpoint = { x: this.doorX - 60, y: 440 };
  }

  // ---- END GAME ----
  endGame(won, reason = 'health') {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.timerEvent.remove();
    Sound.stopMusic();

    if (won) {
      this.player.setVelocity(0, 0);
      this.player.body.enable = false;
      this.cameras.main.flash(300, 255, 255, 255);
      Sound.sfx('win');
    } else {
      Sound.sfx('lose');
    }

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UIScene');
      this.scene.start('EndScene', { won, timeLeft: this.timeLeft, reason, level: this.level });
    });
  }

  // ---- PAUSE ----
  _togglePause() {
    this._paused = !this._paused;
    if (this._paused) {
      this.scene.pause('GameScene');
      Sound.duck(true);
      this.game.events.emit('hud:pause', true);
    } else {
      this.scene.resume('GameScene');
      Sound.duck(false);
      this.game.events.emit('hud:pause', false);
    }
  }

  // ---- TOAST HELPER ----
  _toast(msg, color) {
    this.game.events.emit('hud:toast', msg, color);
  }

  // ---- MAIN UPDATE ----
  update(time, delta) {
    if (this.gameEnded || this._paused) return;

    const p = this.player;
    const body = p.body;
    const onFloor = body.blocked.down;
    const dt = delta / 1000;

    // ---- Coyote time ----
    if (onFloor) {
      this._coyoteTimer = TUNE.coyote;
    } else {
      this._coyoteTimer = Math.max(0, this._coyoteTimer - delta);
    }

    // ---- Landing dust ----
    if (onFloor && !this._wasOnFloor) {
      this.dustEmitter.explode(6, p.x, p.y + 22);
      Sound.sfx('land');
    }
    this._wasOnFloor = onFloor;

    // ---- Moving platform sync & player carry ----
    if (this.movingPlatforms && this.movingPlatforms.length > 0) {
      this.movingPlatforms.forEach(mp => {
        const dx = mp.x - (mp.prevX !== undefined ? mp.prevX : mp.x);
        const dy = mp.y - (mp.prevY !== undefined ? mp.prevY : mp.y);
        mp.body.updateFromGameObject();

        // If player is standing on this moving platform, carry them along
        if (onFloor && p.body.bottom >= mp.y - 2 && p.body.bottom <= mp.y + 16 &&
            p.x + 12 >= mp.x && p.x - 12 <= mp.x + mp.width) {
          p.x += dx;
          p.y += dy;
        }

        mp.prevX = mp.x;
        mp.prevY = mp.y;
      });
    }

    // ---- Horizontal movement ----
    const goLeft  = this.cursors.left.isDown  || this.keyA.isDown;
    const goRight = this.cursors.right.isDown || this.keyD.isDown;

    if (goLeft) {
      body.setVelocityX(-TUNE.moveSpeed);
      p.setFlipX(true);
    } else if (goRight) {
      body.setVelocityX(TUNE.moveSpeed);
      p.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    // ---- Run particles & footsteps ----
    if (onFloor && (goLeft || goRight)) {
      this._dustTimer -= delta;
      this._stepTimer -= delta;
      if (this._dustTimer <= 0) {
        this.runEmitter.explode(1, p.x, p.y + 22);
        this._dustTimer = 120;
      }
      if (this._stepTimer <= 0) {
        Sound.sfx('step');
        this._stepTimer = 220;
      }
    }

    // ---- Jump buffer ----
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.keySpace) ||
                        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                        Phaser.Input.Keyboard.JustDown(this.keyW);
    if (jumpPressed) this._jumpBuffer = TUNE.jumpBuffer;
    else this._jumpBuffer = Math.max(0, this._jumpBuffer - delta);

    // ---- Jump (using coyote + buffer) ----
    if (this._jumpBuffer > 0 && this._coyoteTimer > 0) {
      body.setVelocityY(TUNE.jump);
      this._jumpBuffer = 0;
      this._coyoteTimer = 0;
      this._variableJumpUsed = false;
      Sound.sfx('jump');
    }

    // ---- Variable jump height ----
    if (!onFloor && body.velocity.y < -250 && !this._variableJumpUsed) {
      const jumpKeyHeld = this.keySpace.isDown || this.cursors.up.isDown || this.keyW.isDown;
      if (!jumpKeyHeld) {
        body.setVelocityY(Math.max(-260, body.velocity.y * 0.65));
        this._variableJumpUsed = true;
      }
    }
    if (onFloor) this._variableJumpUsed = false;

    // ---- Animations ----
    if (onFloor) {
      if (goLeft || goRight) p.play('run', true);
      else p.play('idle', true);
    } else {
      p.play('jump', true);
    }

    // ---- Pit detection ----
    if (p.y > 640 && !this.gameEnded) this.damagePlayer('pit');

    // ---- Card pickup overlap ----
    if (this.card && this.card.active) {
      if (Phaser.Geom.Intersects.RectangleToRectangle(p.getBounds(), this.card.getBounds())) {
        this.hasCard = true;
        this.card.destroy();
        this.cardGlow.destroy();
        this.card = null;
        this.dustEmitter.explode(10, p.x, p.y, 50);
        Sound.sfx('pickup');
        this._toast('ACCESS CARD ACQUIRED', 'green');
        this.game.events.emit('hud:objective', 'Reach the terminal');
      }
    }

    // ---- Terminal zone ----
    const nearTerminal = Phaser.Geom.Intersects.RectangleToRectangle(
      p.getBounds(),
      new Phaser.Geom.Rectangle(this.terminalX - 60, 420, 120, 100)
    );
    if (nearTerminal !== this._nearTerminal) {
      this._nearTerminal = nearTerminal;
      this.hackPrompt.setAlpha(nearTerminal ? 1 : 0);
    }
    if (nearTerminal && Phaser.Input.Keyboard.JustDown(this.keyE) && !this.puzzleOpen) {
      if (!this.hasCard) {
        Sound.sfx('deny');
        this._toast('ACCESS DENIED — CARD REQUIRED', 'red');
      } else if (!this.doorOpen) {
        this.puzzleOpen = true;
        this.scene.launch('PuzzleScene', { code: this.puzzleCode, level: this.level });
        this.scene.pause('GameScene');
      }
    }

    // ---- Pause ----
    if (Phaser.Input.Keyboard.JustDown(this._pKey) || (Phaser.Input.Keyboard.JustDown(this.keyEsc) && !this.puzzleOpen)) {
      this._togglePause();
    }

    // ---- Mute ----
    if (Phaser.Input.Keyboard.JustDown(this._mKey)) {
      Sound.toggleMute();
      this.game.events.emit('hud:mute', Sound.muted);
    }

    // ---- Drone glow follow ----
    this.droneGlows.forEach(({ drone, glow }) => {
      glow.setPosition(drone.x, drone.y);
    });

    // ---- Player glow follows player ----
    this.playerGlow.setPosition(p.x, p.y);

    // ---- Moving background grid ----
    this.bgFar.tilePositionX = this.cameras.main.scrollX * 0.15;
  }
}

// =============================================================
//  UI SCENE — HUD (runs in parallel on top of GameScene)
// =============================================================
class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  init(data) {
    this.level = (data && data.level) || 1;
  }

  create() {
    this._hearts    = [];
    this._pauseText = null;
    this._muteHint  = null;

    // ---- Hearts (top-left) ----
    for (let i = 0; i < TUNE.startHealth; i++) {
      this._hearts.push(this.add.image(30 + i * 30, 28, 'heart').setOrigin(0.5));
    }

    // ---- Sector Badge (below hearts) ----
    const sectorName = this.level === 2 ? 'SECTOR 02: THE CORE' : 'SECTOR 01: THE LAB';
    const sectorColor = this.level === 2 ? CSS.magenta : CSS.cyan;
    this.add.text(14, 52, sectorName, {
      fontFamily: 'Orbitron, monospace', fontSize: '11px', color: sectorColor
    }).setOrigin(0, 0.5);

    // ---- Timer (top-center) ----
    this.timerText = neonText(this, W / 2, 24, 'TIME  02:00', 26, CSS.cyan);

    // ---- Objective (top-right) ----
    const objBox = this.add.rectangle(W - 200, 28, 320, 44, 0x0b0f2a, 0.8)
      .setStrokeStyle(1, COLORS.cyan);
    this.objLabel = this.add.text(W - 200, 18, 'OBJECTIVE', {
      fontFamily: 'Orbitron, monospace', fontSize: '11px', color: CSS.magenta
    }).setOrigin(0.5);
    const initialObj = this.level === 2 ? 'Find the Core Master Card' : 'Find the access card';
    this.objText = this.add.text(W - 200, 32, initialObj, {
      fontFamily: 'Orbitron, monospace', fontSize: '12px', color: CSS.cyan, wordWrap: { width: 300 }
    }).setOrigin(0.5);

    // ---- Toast (bottom-center) ----
    this.toast = neonText(this, W / 2, 490, '', 16, CSS.cyan).setAlpha(0);

    // ---- Controls hint (bottom-left) ----
    this.add.text(14, H - 20, 'ARROWS/WASD MOVE · SPACE JUMP · E HACK · P PAUSE · M MUTE', {
      fontFamily: 'Orbitron, monospace', fontSize: '11px', color: CSS.cyan, alpha: 0.6
    }).setOrigin(0, 1).setAlpha(0.6);

    // ---- Mute hint ----
    this.muteIndicator = neonText(this, W - 36, H - 16, '♪', 16, CSS.cyan).setAlpha(0.5);

    // ---- Subscribe to game events ----
    const onHealth = n => this._updateHealth(n);
    const onTime   = n => this._updateTimer(n);
    const onObj    = s => this._updateObjective(s);
    const onToast  = (s, c) => this._showToast(s, c);
    const onPause  = v => this._showPause(v);
    const onMute   = v => this.muteIndicator.setAlpha(v ? 0.2 : 0.8);

    this.game.events.on('hud:health', onHealth);
    this.game.events.on('hud:time',   onTime);
    this.game.events.on('hud:objective', onObj);
    this.game.events.on('hud:toast',  onToast);
    this.game.events.on('hud:pause',  onPause);
    this.game.events.on('hud:mute',   onMute);

    // Remove listeners when this scene shuts down
    this.events.once('shutdown', () => {
      this.game.events.off('hud:health', onHealth);
      this.game.events.off('hud:time',   onTime);
      this.game.events.off('hud:objective', onObj);
      this.game.events.off('hud:toast',  onToast);
      this.game.events.off('hud:pause',  onPause);
      this.game.events.off('hud:mute',   onMute);
    });
  }

  _updateHealth(n) {
    this._hearts.forEach((h, i) => {
      h.setTexture(i < n ? 'heart' : 'heart_empty');
      if (i === n) {
        // Pop tween on lost heart
        this.tweens.add({ targets: h, scaleX: 1.5, scaleY: 1.5, duration: 100, yoyo: true });
      }
    });
  }

  _updateTimer(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    this.timerText.setText(`TIME  ${m}:${s}`);
    if (sec <= 15) {
      this.timerText.setStyle({ color: CSS.red });
      if (!this._timerPulse) {
        this._timerPulse = this.tweens.add({
          targets: this.timerText, scale: 1.1, duration: 500, yoyo: true, repeat: -1
        });
      }
    }
  }

  _updateObjective(str) {
    this.objText.setText(str);
  }

  _showToast(msg, colorName) {
    const colorMap = { cyan: CSS.cyan, red: CSS.red, green: CSS.green, violet: CSS.violet };
    const col = colorMap[colorName] || CSS.cyan;
    this.toast.setText(msg).setStyle({ color: col, stroke: col }).setAlpha(1);
    this.tweens.killTweensOf(this.toast);
    this.tweens.add({ targets: this.toast, alpha: 0, delay: 1800, duration: 500 });
  }

  _showPause(paused) {
    if (paused) {
      if (!this._pauseText) {
        this._pauseText = neonText(this, W / 2, H / 2, 'PAUSED — PRESS P TO RESUME', 28, CSS.magenta);
      }
      this._pauseText.setVisible(true);
    } else if (this._pauseText) {
      this._pauseText.setVisible(false);
    }
  }
}

// =============================================================
//  PUZZLE SCENE — 4-digit keypad hacking mini-game
// =============================================================
class PuzzleScene extends Phaser.Scene {
  constructor() { super('PuzzleScene'); }

  init(data) {
    this.targetCode = (data && data.code) || TUNE.puzzleCode;
    this.level = (data && data.level) || 1;
  }

  create() {
    this._input    = '';
    this._attempts = 0;
    this._solved   = false;

    // ---- Dim overlay ----
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75);

    // ---- Panel ----
    const panelGlow = this.add.image(W / 2, H / 2, 'glow')
      .setTint(COLORS.cyan).setAlpha(0.15).setScale(5)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.add.rectangle(W / 2, H / 2, 460, 420, 0x0b0f2a)
      .setStrokeStyle(3, COLORS.cyan);

    // Header
    const headerTitle = this.level === 2 ? 'NEXUS CORE MAINFRAME' : 'NEXUS SECURITY TERMINAL';
    neonText(this, W / 2, H / 2 - 190, headerTitle, 18, CSS.magenta);
    neonText(this, W / 2, H / 2 - 164, 'ENTER 4-DIGIT OVERRIDE CODE', 13, CSS.cyan);

    // ---- Digit display boxes ----
    this._boxes = [];
    this._digitTexts = [];
    for (let i = 0; i < 4; i++) {
      const bx = W / 2 - 135 + i * 90;
      const by = H / 2 - 100;
      const box = this.add.rectangle(bx, by, 60, 76, 0x06122b).setStrokeStyle(2, COLORS.cyan);
      const digit = this.add.text(bx, by, '_', {
        fontFamily: 'Orbitron, monospace', fontSize: '36px', color: CSS.cyan
      }).setOrigin(0.5);
      this._boxes.push(box);
      this._digitTexts.push(digit);
    }

    // ---- Message line ----
    this.msgText = neonText(this, W / 2, H / 2 - 20, '', 16, CSS.green);

    // ---- Hint line ----
    this.hintText = neonText(this, W / 2, H / 2 + 8, '', 12, CSS.gold);

    // ---- Keypad buttons (3×4 grid) ----
    const keys = ['1','2','3','4','5','6','7','8','9','CLR','0','OK'];
    const startX = W / 2 - 120;
    const startY = H / 2 + 50;
    keys.forEach((k, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const bx = startX + col * 90;
      const by = startY + row * 66;
      const bg = this.add.rectangle(bx, by, 72, 50, 0x0b0f2a).setStrokeStyle(2, COLORS.violet);
      const tx = this.add.text(bx, by, k, {
        fontFamily: 'Orbitron, monospace', fontSize: '18px', color: CSS.cyan
      }).setOrigin(0.5);
      const btn = this.add.zone(bx, by, 72, 50).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => { bg.setStrokeStyle(2, COLORS.cyan); bg.setFillStyle(0x151a4a); });
      btn.on('pointerout',  () => { bg.setStrokeStyle(2, COLORS.violet); bg.setFillStyle(0x0b0f2a); });
      btn.on('pointerdown', () => this._handleKey(k));
    });

    // ---- Keyboard input ----
    this._keyHandler = (e) => {
      if (e.key >= '0' && e.key <= '9') this._handleKey(e.key);
      else if (e.key === 'Backspace') this._handleKey('CLR');
      else if (e.key === 'Enter') this._handleKey('OK');
      else if (e.key === 'Escape') this._close();
    };
    this.input.keyboard.on('keydown', this._keyHandler);

    this.events.once('shutdown', () => {
      this.input.keyboard.removeAllListeners();
    });
  }

  _handleKey(k) {
    if (this._solved) return;
    Sound.sfx('key');
    if (k === 'CLR') {
      this._input = this._input.slice(0, -1);
    } else if (k === 'OK') {
      this._submit();
    } else if (this._input.length < 4) {
      this._input += k;
      if (this._input.length === 4) {
        // Auto-submit
        this.time.delayedCall(80, () => this._submit());
      }
    }
    this._refreshDisplay();
  }

  _refreshDisplay() {
    for (let i = 0; i < 4; i++) {
      this._digitTexts[i].setText(this._input[i] || '_');
      this._boxes[i].setStrokeStyle(2, COLORS.cyan);
    }
  }

  _submit() {
    if (this._input === this.targetCode) {
      // Correct!
      this._solved = true;
      this.msgText.setText('ACCESS GRANTED').setStyle({ color: CSS.green });
      this._boxes.forEach(b => b.setStrokeStyle(2, COLORS.green));
      this._digitTexts.forEach(d => d.setStyle({ color: CSS.green }));
      Sound.sfx('ok');
      this.time.delayedCall(700, () => {
        this._close();
        this.game.events.emit('puzzle:solved');
      });
    } else {
      // Wrong
      this._attempts++;
      this.msgText.setText('ACCESS DENIED').setStyle({ color: CSS.red });
      this._boxes.forEach(b => b.setStrokeStyle(2, COLORS.red));
      Sound.sfx('deny');
      // Shake boxes
      this._boxes.forEach(b => {
        this.tweens.add({ targets: b, x: b.x + 8, duration: 50, yoyo: true, repeat: 3 });
      });
      // Hints
      if (this.level === 2) {
        if (this._attempts >= 4) {
          this.hintText.setText('HINT: AI CORE OVERLOAD CODE: 4040');
        } else if (this._attempts >= 2) {
          this.hintText.setText('HINT: CHECK THE CORE LOG TERMINAL ON THE WALL');
        }
      } else {
        if (this._attempts >= 4) {
          this.hintText.setText('HINT: THE YEAR NEXUS AWOKE');
        } else if (this._attempts >= 2) {
          this.hintText.setText('HINT: SEE THE NEXUS LOG ON THE WALL');
        }
      }
      this.time.delayedCall(500, () => {
        this._input = '';
        this._refreshDisplay();
        this.msgText.setText('');
      });
    }
  }

  _close() {
    const gs = this.scene.get('GameScene');
    if (gs) gs.puzzleOpen = false;
    this.scene.stop('PuzzleScene');
    this.scene.resume('GameScene');
  }
}

// =============================================================
//  END SCENE — win / lose screen
// =============================================================
class EndScene extends Phaser.Scene {
  constructor() { super('EndScene'); }

  init(data) {
    this.won = data ? !!data.won : false;
    this.timeLeft = data && data.timeLeft !== undefined ? data.timeLeft : 0;
    this.reason = data && data.reason ? data.reason : 'health';
    this.level = data && data.level ? data.level : 1;
  }

  create() {
    const { won, timeLeft, reason } = this;

    // ---- Background ----
    this.add.tileSprite(0, 0, W, H, 'grid_tile').setOrigin(0).setAlpha(0.5);
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

    if (won) {
      this._buildWinScreen(timeLeft);
    } else {
      this._buildLoseScreen(reason);
    }

    // ---- Keyboard shortcut ----
    this.input.keyboard.once('keydown-ENTER', () => {
      if (won) {
        if (this.level === 1) this._startLevel(2);
        else this._startLevel(1);
      } else {
        this._retry();
      }
    });
  }

  _buildWinScreen(timeLeft) {
    Sound.sfx('win');

    if (this.level === 1) {
      neonText(this, W / 2, 120, 'LEVEL 1 COMPLETE!', 54, CSS.green, CSS.cyan)
        .setShadow(0, 0, CSS.cyan, 20, true, true);
      neonText(this, W / 2, 195, 'SECTOR 01 ESCAPED', 22, CSS.cyan);
      neonText(this, W / 2, 230, 'NEXT DESTINATION: THE NEXUS CORE', 18, CSS.magenta);

      const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const s = (timeLeft % 60).toString().padStart(2, '0');
      neonText(this, W / 2, 275, `TIME REMAINING  ${m}:${s}`, 18, CSS.gold);

      neonButton(this, W / 2 - 160, 380, 'PROCEED TO LEVEL 2', () => this._startLevel(2));
      neonButton(this, W / 2 + 160, 380, 'MAIN MENU', () => this._mainMenu());
    } else {
      neonText(this, W / 2, 120, 'NEXUS DESTROYED!', 54, CSS.green, CSS.magenta)
        .setShadow(0, 0, CSS.magenta, 20, true, true);
      neonText(this, W / 2, 195, 'YOU HAVE FREED HUMANITY!', 24, CSS.cyan);
      neonText(this, W / 2, 230, 'ALL AI DEFENSES SHUT DOWN', 18, CSS.gold);

      const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const s = (timeLeft % 60).toString().padStart(2, '0');
      neonText(this, W / 2, 275, `FINAL TIME REMAINING  ${m}:${s}`, 18, CSS.gold);

      neonButton(this, W / 2 - 160, 380, 'PLAY AGAIN', () => this._startLevel(1));
      neonButton(this, W / 2 + 160, 380, 'MAIN MENU', () => this._mainMenu());
    }

    // Fireworks
    const colors = [COLORS.cyan, COLORS.magenta, COLORS.gold, COLORS.green];
    this.time.addEvent({
      delay: 300, repeat: 20,
      callback: () => {
        const fx = Phaser.Math.Between(100, W - 100);
        const fy = Phaser.Math.Between(80, 350);
        this.add.particles(fx, fy, 'spark', {
          speed: { min: 60, max: 180 },
          angle: { min: 0, max: 360 },
          scale: { start: 1.2, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 1200,
          gravityY: 200,
          tint: colors,
          blendMode: Phaser.BlendModes.ADD,
          emitting: false
        }).explode(20, fx, fy);
      }
    });
  }

  _buildLoseScreen(reason) {
    Sound.sfx('lose');

    const title = neonText(this, W / 2, 160, 'MISSION FAILED', 60, CSS.red);
    this.tweens.add({ targets: title, alpha: 0.4, duration: 400, yoyo: true, repeat: -1 });

    const reasonStr = reason === 'time' ? 'TIME EXPIRED' : 'NEXUS DETECTED YOU';
    neonText(this, W / 2, 248, reasonStr, 22, CSS.magenta);

    neonButton(this, W / 2 - 160, 360, 'RETRY', () => this._retry());
    neonButton(this, W / 2 + 160, 360, 'MAIN MENU', () => this._mainMenu());
  }

  _startLevel(lvl) {
    Sound.stopMusic();
    Sound.startMusic();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { level: lvl });
      this.scene.launch('UIScene', { level: lvl });
      this.scene.stop('EndScene');
    });
  }

  _retry() {
    this._startLevel(this.level);
  }

  _mainMenu() {
    Sound.stopMusic();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
      this.scene.stop('EndScene');
    });
  }
}
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MenuScene');
      this.scene.stop('EndScene');
    });
  }
}

// =============================================================
//  PHASER GAME CONFIG
// =============================================================
const config = {
  type: Phaser.WEBGL,
  width: W,
  height: H,
  parent: 'game',
  backgroundColor: '#05030d',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1400 }, debug: false }
  },
  scene: [BootScene, MenuScene, GameScene, UIScene, PuzzleScene, EndScene]
};

// Start only after Orbitron font is ready
document.fonts.load('700 20px Orbitron')
  .then(() => new Phaser.Game(config))
  .catch(() => new Phaser.Game(config));
