// Web Audio API 기반 오리지널 사운드 엔진
// 외부 사운드 파일 의존 없이 브라우저 내장 Web Audio API로 9개 테마 BGM 및 모든 효과음 생성

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;

    this.isMuted = false;
    this.volume = 0.5; // 0 ~ 1

    this.currentTheme = null;
    this.isPlayingBgm = false;
    this.bgmTimer = null;
    this.activeNodes = [];

    // 음계 주파수 테이블 (MIDI to Hz)
    this.NOTES = {
      C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
      C4: 261.63, Db4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, Fs4: 369.99,
      G4: 392.00, Ab4: 415.30, A4: 440.00, Bb4: 466.16, B4: 493.88,
      C5: 523.25, Db5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25, F5: 698.46, Fs5: 739.99,
      G5: 783.99, Ab5: 830.61, A5: 880.00, Bb5: 932.33, B5: 987.77,
      C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98
    };
  }

  // 브라우저 AudioContext 초기화 (사용자 클릭 시점)
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // 단음/화음 톤 재생 헬퍼
  playTone(freq, type = 'sine', duration = 0.2, time = null, gainVal = 0.3, detune = 0) {
    if (!this.ctx || this.isMuted) return null;
    const t = time || this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.detune.setValueAtTime(detune, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(gainVal, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(t);
    osc.stop(t + duration);

    return { osc, gain };
  }

  // ==================== 테마별 배경음악 (BGM) 정의 ====================
  // 1. 포켓몬: 씩씩하고 활기찬 모험풍 아르페지오 (Major, 8/16비트 느낌)
  playPokemonBGM(t) {
    const N = this.NOTES;
    const tempo = 0.16;
    const pattern = [
      { note: N.C4, dur: tempo }, { note: N.E4, dur: tempo }, { note: N.G4, dur: tempo }, { note: N.C5, dur: tempo * 2 },
      { note: N.B4, dur: tempo }, { note: N.G4, dur: tempo }, { note: N.A4, dur: tempo }, { note: N.F4, dur: tempo * 2 },
      { note: N.D4, dur: tempo }, { note: N.F4, dur: tempo }, { note: N.A4, dur: tempo }, { note: N.D5, dur: tempo * 2 },
      { note: N.C5, dur: tempo }, { note: N.B4, dur: tempo }, { note: N.G4, dur: tempo }, { note: N.C5, dur: tempo * 3 }
    ];

    let curr = t;
    pattern.forEach((step, i) => {
      this.playTone(step.note, 'triangle', step.dur * 0.9, curr, 0.25);
      // 베이스라인
      if (i % 2 === 0) {
        this.playTone(step.note / 2, 'square', step.dur * 1.5, curr, 0.12);
      }
      curr += step.dur;
    });
    return curr - t;
  }

  // 2. 산리오: 사랑스럽고 귀여운 마림바/벨 톤 (동화풍)
  playSanrioBGM(t) {
    const N = this.NOTES;
    const tempo = 0.22;
    const melody = [
      { note: N.E5, dur: tempo }, { note: N.G5, dur: tempo }, { note: N.A5, dur: tempo * 2 },
      { note: N.G5, dur: tempo }, { note: N.E5, dur: tempo }, { note: N.D5, dur: tempo * 2 },
      { note: N.C5, dur: tempo }, { note: N.D5, dur: tempo }, { note: N.E5, dur: tempo }, { note: N.G5, dur: tempo },
      { note: N.E5, dur: tempo * 2 }, { note: N.D5, dur: tempo * 2 }
    ];

    let curr = t;
    melody.forEach((step) => {
      this.playTone(step.note, 'sine', step.dur * 0.8, curr, 0.22);
      this.playTone(step.note * 2, 'sine', step.dur * 0.4, curr, 0.08); // 반짝임 배음
      curr += step.dur;
    });
    return curr - t;
  }

  // 3. 짱구: 익살스럽고 통통 튀는 코믹 브라스 리듬
  playShinchanBGM(t) {
    const N = this.NOTES;
    const tempo = 0.18;
    const melody = [
      { note: N.C4, dur: tempo, bass: true }, { note: N.E4, dur: tempo }, { note: N.G4, dur: tempo * 0.8 },
      { note: N.A4, dur: tempo * 1.5 }, { note: N.G4, dur: tempo * 0.8 }, { note: N.E4, dur: tempo },
      { note: N.F4, dur: tempo, bass: true }, { note: N.A4, dur: tempo }, { note: N.C5, dur: tempo },
      { note: N.B4, dur: tempo }, { note: N.Ab4, dur: tempo }, { note: N.G4, dur: tempo * 2 }
    ];

    let curr = t;
    melody.forEach((step) => {
      this.playTone(step.note, 'sawtooth', step.dur * 0.7, curr, 0.14);
      if (step.bass) {
        this.playTone(step.note / 2, 'triangle', step.dur * 1.2, curr, 0.28);
      }
      curr += step.dur;
    });
    return curr - t;
  }

  // 4. 디즈니: 환상적인 마법 오르골 왈츠 (3/4 박자)
  playDisneyBGM(t) {
    const N = this.NOTES;
    const tempo = 0.26;
    const melody = [
      { note: N.G4, dur: tempo }, { note: N.C5, dur: tempo }, { note: N.E5, dur: tempo },
      { note: N.D5, dur: tempo * 2 }, { note: N.C5, dur: tempo },
      { note: N.A4, dur: tempo }, { note: N.D5, dur: tempo }, { note: N.F5, dur: tempo },
      { note: N.E5, dur: tempo * 2 }, { note: N.C5, dur: tempo }
    ];

    let curr = t;
    melody.forEach((step) => {
      this.playTone(step.note, 'sine', step.dur * 1.4, curr, 0.2);
      this.playTone(step.note * 2, 'sine', step.dur * 0.6, curr, 0.08); // 오르골 차임
      curr += step.dur;
    });
    return curr - t;
  }

  // 5. 지브리: 따뜻하고 아련한 피아노 플루트 선율
  playGhibliBGM(t) {
    const N = this.NOTES;
    const tempo = 0.28;
    const melody = [
      { note: N.A4, dur: tempo * 1.5 }, { note: N.B4, dur: tempo * 0.5 }, { note: N.C5, dur: tempo },
      { note: N.B4, dur: tempo }, { note: N.A4, dur: tempo }, { note: N.E4, dur: tempo * 2 },
      { note: N.F4, dur: tempo * 1.5 }, { note: N.G4, dur: tempo * 0.5 }, { note: N.A4, dur: tempo },
      { note: N.G4, dur: tempo }, { note: N.F4, dur: tempo }, { note: N.D4, dur: tempo * 2 }
    ];

    let curr = t;
    melody.forEach((step) => {
      this.playTone(step.note, 'triangle', step.dur * 1.1, curr, 0.2);
      this.playTone(step.note / 2, 'sine', step.dur * 1.8, curr, 0.1);
      curr += step.dur;
    });
    return curr - t;
  }

  // 6. 게임 캐릭터: 레트로 아케이드 8비트 긴장감 & 칩튠
  playGameBGM(t) {
    const N = this.NOTES;
    const tempo = 0.13;
    const melody = [
      { note: N.E4, dur: tempo }, { note: N.E4, dur: tempo }, { note: N.G4, dur: tempo },
      { note: N.E4, dur: tempo }, { note: N.D4, dur: tempo }, { note: N.C4, dur: tempo },
      { note: N.B3, dur: tempo * 2 }, { note: N.A3, dur: tempo }, { note: N.C4, dur: tempo },
      { note: N.E4, dur: tempo }, { note: N.A4, dur: tempo }, { note: N.Ab4, dur: tempo * 2 }
    ];

    let curr = t;
    melody.forEach((step) => {
      this.playTone(step.note, 'square', step.dur * 0.8, curr, 0.15);
      curr += step.dur;
    });
    return curr - t;
  }

  // 7. 치이카와: 몽환적이고 아기자기한 포근한 감성
  playChiikawaBGM(t) {
    const N = this.NOTES;
    const tempo = 0.24;
    const melody = [
      { note: N.F5, dur: tempo }, { note: N.A5, dur: tempo }, { note: N.C6, dur: tempo * 1.5 },
      { note: N.Bb5, dur: tempo * 0.5 }, { note: N.A5, dur: tempo }, { note: N.F5, dur: tempo },
      { note: N.G5, dur: tempo * 1.5 }, { note: N.E5, dur: tempo * 0.5 }, { note: N.C5, dur: tempo * 2 }
    ];

    let curr = t;
    melody.forEach((step) => {
      this.playTone(step.note, 'sine', step.dur * 0.9, curr, 0.22);
      this.playTone(step.note * 1.5, 'triangle', step.dur * 0.4, curr, 0.06);
      curr += step.dur;
    });
    return curr - t;
  }

  // 8. 리락쿠마: 나른하고 편안한 로파이 재즈 왈츠
  playRilakkumaBGM(t) {
    const N = this.NOTES;
    const tempo = 0.32;
    const chords = [
      [N.C4, N.E4, N.G4, N.B4],
      [N.A3, N.C4, N.E4, N.G4],
      [N.D4, N.F4, N.A4, N.C5],
      [N.G3, N.B3, N.D4, N.F4]
    ];

    let curr = t;
    chords.forEach((chord) => {
      chord.forEach((freq, idx) => {
        this.playTone(freq, 'sine', tempo * 2.8, curr + idx * 0.04, 0.12);
      });
      curr += tempo * 1.2;
    });
    return curr - t;
  }

  // 9. 전체 캐릭터 모음: 신나고 경쾌한 페스티벌 아케이드 댄스 튠
  playAllBGM(t) {
    const N = this.NOTES;
    const tempo = 0.14;
    const melody = [
      { note: N.C5, dur: tempo }, { note: N.G4, dur: tempo }, { note: N.E4, dur: tempo }, { note: N.G4, dur: tempo },
      { note: N.A4, dur: tempo }, { note: N.C5, dur: tempo }, { note: N.D5, dur: tempo }, { note: N.E5, dur: tempo * 2 },
      { note: N.D5, dur: tempo }, { note: N.C5, dur: tempo }, { note: N.A4, dur: tempo }, { note: N.G4, dur: tempo * 2 }
    ];

    let curr = t;
    melody.forEach((step, i) => {
      this.playTone(step.note, 'triangle', step.dur * 0.85, curr, 0.22);
      // 신나는 비트 베이스
      if (i % 2 === 0) {
        this.playTone(step.note / 2, 'sawtooth', step.dur * 0.5, curr, 0.16);
      }
      curr += step.dur;
    });
    return curr - t;
  }

  // BGM 루프 제어
  playThemeBGM(themeType) {
    this.init();
    this.stopBGM();
    this.currentTheme = themeType;
    this.isPlayingBgm = true;

    const playLoop = () => {
      if (!this.isPlayingBgm || this.currentTheme !== themeType) return;
      const t = this.ctx.currentTime + 0.05;
      let duration = 3.0;

      switch (themeType) {
        case 'pokemon': duration = this.playPokemonBGM(t); break;
        case 'sanrio': duration = this.playSanrioBGM(t); break;
        case 'shinchan': duration = this.playShinchanBGM(t); break;
        case 'disney': duration = this.playDisneyBGM(t); break;
        case 'ghibli': duration = this.playGhibliBGM(t); break;
        case 'game': duration = this.playGameBGM(t); break;
        case 'chiikawa': duration = this.playChiikawaBGM(t); break;
        case 'rilakkuma': duration = this.playRilakkumaBGM(t); break;
        case 'all': duration = this.playAllBGM(t); break;
        default: duration = this.playAllBGM(t); break;
      }

      this.bgmTimer = setTimeout(playLoop, Math.max(800, (duration - 0.05) * 1000));
    };

    playLoop();
  }

  stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // ==================== 효과음 (SFX) ====================
  // 버튼 클릭음
  playClick() {
    this.init();
    if (this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.06);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // 레트로 아케이드 코인 투입음 (COIN!)
  playCoinSound() {
    this.init();
    if (this.isMuted) return;
    const t = this.ctx.currentTime;
    // B5 -> E6 맑은 코인 아르페지오
    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.35, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(st);
      osc.stop(st + 0.3);
    });
  }

  // 크레인 모터 작동/이동음
  playCraneMove() {
    this.init();
    if (this.isMuted) return null;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.linearRampToValueAtTime(130, t + 0.15);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  // 집게 하강 / 착 감기며 잡는 소리 (Claw Grab & Lock)
  playClawGrab() {
    this.init();
    if (this.isMuted) return;
    const t = this.ctx.currentTime;

    // 금속 기계 찰칵 사운드
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(320, t);
    osc1.frequency.exponentialRampToValueAtTime(180, t + 0.12);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(950, t + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(400, t + 0.14);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t + 0.06);
    osc1.stop(t + 0.25);
    osc2.stop(t + 0.25);
  }

  // 인형 들어올리기 흔들림 텐션음 (Lift & Tension)
  playLift() {
    this.init();
    if (this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(520, t + 0.4);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  // 집게 배출구에서 열리는 소리 (Claw Release & Open)
  playClawRelease() {
    this.init();
    if (this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 배출구 구멍 내부로 떨어져 수령함에 쿵 안착하는 소리 (Chute Thump & Tray Landing)
  playChuteDrop() {
    this.init();
    if (this.isMuted) return;
    const t = this.ctx.currentTime;

    // 1. 미끄럼틀 슉 슬라이드음
    const slideOsc = this.ctx.createOscillator();
    const slideGain = this.ctx.createGain();
    slideOsc.type = 'sine';
    slideOsc.frequency.setValueAtTime(320, t);
    slideOsc.frequency.exponentialRampToValueAtTime(110, t + 0.25);
    slideGain.gain.setValueAtTime(0.18, t);
    slideGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    slideOsc.connect(slideGain);
    slideGain.connect(this.sfxGain);
    slideOsc.start(t);
    slideOsc.stop(t + 0.28);

    // 2. 수령함 착지 쿵 소리
    const thudTime = t + 0.18;
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(130, thudTime);
    thudOsc.frequency.exponentialRampToValueAtTime(45, thudTime + 0.22);
    thudGain.gain.setValueAtTime(0.4, thudTime);
    thudGain.gain.exponentialRampToValueAtTime(0.001, thudTime + 0.26);
    thudOsc.connect(thudGain);
    thudGain.connect(this.sfxGain);
    thudOsc.start(thudTime);
    thudOsc.stop(thudTime + 0.26);
  }

  // 당첨 발표 팡파레 & 축하 효과음
  playCelebration() {
    this.init();
    if (this.isMuted) return;
    const t = this.ctx.currentTime;

    // 화려한 아르페지오 팡파레
    const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    fanfareNotes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.65);
    });

    // 최종 화음 서스테인
    const chordTime = t + 0.55;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, chordTime);
      gain.gain.setValueAtTime(0.25, chordTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 1.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(chordTime);
      osc.stop(chordTime + 1.65);
    });
  }
}

export const sound = new SoundEngine();
