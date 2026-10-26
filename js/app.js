// 메인 애플리케이션 컨트롤러
// - 화면 단계 제어 (Step 1: 입력 -> Step 2: 확인 -> Step 3: 테마 선택 -> Step 4: 3D 게임 -> Step 5: 결과)
// - 참가자 추가/수정/삭제 관리
// - 오디오 BGM 및 효과음 연동
// - Canvas Confetti 연출

import { ALL_THEMES, CELEBRATION_MESSAGES } from './data.js';
import { sound } from './audio.js';
import { ClawMachineGame } from './game.js';

class AppController {
  constructor() {
    // 기본 샘플 참가자 목록 (테스트 편의를 위해 초기 4명 제공, 언제든 수정/삭제/추가 가능)
    this.participants = ['예원', '민우', '지아', '현수'];
    this.selectedTheme = ALL_THEMES[0]; // 기본 포켓몬
    this.game = null;
    this.editingIndex = -1;

    this.initElements();
    this.initEventListeners();
    this.renderParticipantList();
    this.renderThemeCards();
  }

  initElements() {
    // 화면 단계별 컨테이너
    this.screens = {
      input: document.getElementById('screen-input'),
      confirm: document.getElementById('screen-confirm'),
      theme: document.getElementById('screen-theme'),
      game: document.getElementById('screen-game')
    };

    // 모달
    this.resultModal = document.getElementById('result-modal');
    this.editModal = document.getElementById('edit-modal');

    // 입력 폼
    this.nameInput = document.getElementById('name-input');
    this.btnAddName = document.getElementById('btn-add-name');
    this.participantListEl = document.getElementById('participant-list');
    this.participantCountBadge = document.getElementById('participant-count-badge');
    this.btnToConfirm = document.getElementById('btn-to-confirm');

    // 확인 화면
    this.confirmListEl = document.getElementById('confirm-list');
    this.btnBackToInput = document.getElementById('btn-back-to-input');
    this.btnToTheme = document.getElementById('btn-to-theme');

    // 테마 화면
    this.themeGridEl = document.getElementById('theme-grid');
    this.btnBackToConfirm = document.getElementById('btn-back-to-confirm');
    this.btnStartGame = document.getElementById('btn-start-game');

    // 게임 화면
    this.canvasContainer = document.getElementById('canvas-container');
    this.btnTriggerClaw = document.getElementById('btn-trigger-claw');
    this.gameThemeBadge = document.getElementById('game-theme-badge');
    this.gameCountBadge = document.getElementById('game-count-badge');
    this.btnGameQuit = document.getElementById('btn-game-quit');

    // 결과 모달
    this.resultWinnerName = document.getElementById('result-winner-name');
    this.resultMsg = document.getElementById('result-message');
    this.resultCharName = document.getElementById('result-char-name');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnResetAll = document.getElementById('btn-reset-all');

    // 오디오 컨트롤
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.volumeSlider = document.getElementById('volume-slider');

    // 수정 모달 인풋
    this.editInput = document.getElementById('edit-input');
    this.btnSaveEdit = document.getElementById('btn-save-edit');
    this.btnCancelEdit = document.getElementById('btn-cancel-edit');
  }

  initEventListeners() {
    // 1. 참가자 추가
    this.btnAddName.addEventListener('click', () => this.addParticipant());
    this.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addParticipant();
      }
    });

    // 2. 화면 이동 버튼들
    this.btnToConfirm.addEventListener('click', () => {
      sound.playClick();
      if (this.participants.length < 2) {
        alert('추첨을 진행하려면 최소 2명 이상의 참가자를 입력해야 합니다!');
        return;
      }
      this.renderConfirmScreen();
      this.switchScreen('confirm');
    });

    this.btnBackToInput.addEventListener('click', () => {
      sound.playClick();
      this.switchScreen('input');
    });

    this.btnToTheme.addEventListener('click', () => {
      sound.playClick();
      this.switchScreen('theme');
    });

    this.btnBackToConfirm.addEventListener('click', () => {
      sound.playClick();
      this.switchScreen('confirm');
    });

    this.btnStartGame.addEventListener('click', () => {
      sound.playClick();
      this.startGame();
    });

    this.btnGameQuit.addEventListener('click', () => {
      sound.playClick();
      if (confirm('게임을 종료하고 테마 선택 화면으로 돌아갈까요?')) {
        sound.stopBGM();
        this.switchScreen('theme');
      }
    });

    // 3. 인형 뽑기 집게 작동 (뽑기 시작 버튼)
    this.btnTriggerClaw.addEventListener('click', () => {
      if (this.game && !this.game.isOperating) {
        sound.playClick();
        this.updateClawButton('operating');
        this.game.startLottery();
      }
    });

    // 4. 결과 화면 버튼들
    this.btnReplay.addEventListener('click', () => {
      sound.playClick();
      this.resultModal.classList.add('hidden');
      this.updateClawButton('ready');
      // 동일 참가자와 테마로 새로운 추첨 준비
      this.game.setupGame(this.selectedTheme, this.participants);
    });

    this.btnResetAll.addEventListener('click', () => {
      sound.playClick();
      sound.stopBGM();
      this.resultModal.classList.add('hidden');
      this.switchScreen('input');
    });

    // 5. 사운드 컨트롤
    this.btnSoundToggle.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.btnSoundToggle.innerHTML = isMuted
        ? '<i class="fa-solid fa-volume-xmark"></i>'
        : '<i class="fa-solid fa-volume-high"></i>';
    });

    this.volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      sound.setVolume(val);
    });

    // 6. 참가자 이름 수정 모달
    this.btnSaveEdit.addEventListener('click', () => this.saveEditParticipant());
    this.btnCancelEdit.addEventListener('click', () => this.editModal.classList.add('hidden'));
    this.editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.saveEditParticipant();
      }
    });
  }

  // 화면 전환 헬퍼
  switchScreen(screenName) {
    Object.keys(this.screens).forEach(key => {
      if (key === screenName) {
        this.screens[key].classList.remove('hidden');
        this.screens[key].classList.add('active');
      } else {
        this.screens[key].classList.add('hidden');
        this.screens[key].classList.remove('active');
      }
    });
  }

  // ==================== 참가자 관리 ====================
  addParticipant() {
    const name = this.nameInput.value.trim();
    if (!name) return;
    if (this.participants.includes(name)) {
      alert('이미 등록된 참가자 이름입니다!');
      return;
    }
    sound.playClick();
    this.participants.push(name);
    this.nameInput.value = '';
    this.nameInput.focus();
    this.renderParticipantList();
  }

  deleteParticipant(index) {
    sound.playClick();
    this.participants.splice(index, 1);
    this.renderParticipantList();
  }

  openEditModal(index) {
    sound.playClick();
    this.editingIndex = index;
    this.editInput.value = this.participants[index];
    this.editModal.classList.remove('hidden');
    this.editInput.focus();
  }

  saveEditParticipant() {
    const newName = this.editInput.value.trim();
    if (!newName) return;
    sound.playClick();
    this.participants[this.editingIndex] = newName;
    this.editModal.classList.add('hidden');
    this.renderParticipantList();
  }

  renderParticipantList() {
    this.participantListEl.innerHTML = '';
    this.participantCountBadge.textContent = `${this.participants.length}명 입력됨`;

    if (this.participants.length === 0) {
      this.participantListEl.innerHTML = `
        <div class="empty-placeholder">
          <i class="fa-solid fa-users-slash"></i>
          <p>등록된 참가자가 없습니다. 이름을 입력하고 추가해 보세요!</p>
        </div>
      `;
    } else {
      this.participants.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        item.innerHTML = `
          <div class="item-left">
            <span class="item-number">${index + 1}</span>
            <span class="item-name">${name}</span>
          </div>
          <div class="item-actions">
            <button class="btn-icon btn-edit" title="이름 수정"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon btn-delete" title="삭제"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        `;

        item.querySelector('.btn-edit').addEventListener('click', () => this.openEditModal(index));
        item.querySelector('.btn-delete').addEventListener('click', () => this.deleteParticipant(index));

        this.participantListEl.appendChild(item);
      });
    }

    // 최소 2명 이상이어야 다음 버튼 활성화
    if (this.participants.length >= 2) {
      this.btnToConfirm.disabled = false;
      this.btnToConfirm.classList.remove('opacity-50');
    } else {
      this.btnToConfirm.disabled = true;
      this.btnToConfirm.classList.add('opacity-50');
    }
  }

  renderConfirmScreen() {
    this.confirmListEl.innerHTML = '';
    const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#14B8A6'];

    this.participants.forEach((name, idx) => {
      const color = colors[idx % colors.length];
      const card = document.createElement('div');
      card.className = 'confirm-card';
      card.style.borderTop = `4px solid ${color}`;
      card.innerHTML = `
        <div class="avatar-circle" style="background: ${color}">
          ${name.charAt(0)}
        </div>
        <div class="confirm-name">${name}</div>
        <div class="confirm-prob">당첨 확률: ${(100 / this.participants.length).toFixed(1)}%</div>
      `;
      this.confirmListEl.appendChild(card);
    });
  }

  // ==================== 테마 선택 카드 렌더링 ====================
  renderThemeCards() {
    this.themeGridEl.innerHTML = '';

    ALL_THEMES.forEach((theme) => {
      const card = document.createElement('div');
      card.className = `theme-card ${theme.id === this.selectedTheme.id ? 'selected' : ''}`;
      card.dataset.themeId = theme.id;

      // 대표 캐릭터 태그 생성
      const charBadges = theme.characters.slice(0, 4).map(c => `<span>${c.name}</span>`).join(' ');

      card.innerHTML = `
        <div class="theme-card-header" style="background: ${theme.bgGradient};">
          <i class="fa-solid ${theme.icon} theme-header-icon"></i>
          <span class="theme-badge-pill">${theme.badge}</span>
        </div>
        <div class="theme-card-body">
          <div class="theme-title-row">
            <h3 class="theme-title">${theme.title}</h3>
            <span class="theme-sub">${theme.sub}</span>
          </div>
          <div class="theme-bgm-info">
            <i class="fa-solid fa-music"></i> ${theme.bgmDesc}
          </div>
          <div class="theme-char-tags">
            ${charBadges} ${theme.characters.length > 4 ? `<span>+${theme.characters.length - 4}</span>` : ''}
          </div>
        </div>
        <div class="theme-check-icon">
          <i class="fa-solid fa-circle-check"></i>
        </div>
      `;

      card.addEventListener('click', () => {
        sound.playClick();
        this.selectedTheme = theme;
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });

      this.themeGridEl.appendChild(card);
    });
  }

  // ==================== 게임 시작 ====================
  startGame() {
    this.switchScreen('game');

    // 게임 HUD 상태 뱃지 업데이트
    if (this.gameThemeBadge) {
      this.gameThemeBadge.innerHTML = `<i class="fa-solid ${this.selectedTheme.icon}"></i> ${this.selectedTheme.title}`;
    }
    if (this.gameCountBadge) {
      this.gameCountBadge.textContent = `${this.participants.length}명의 참가자`;
    }

    // 테마 BGM 재생 시작
    sound.playThemeBGM(this.selectedTheme.bgmType);

    // 버튼 상태 초기화 (화려한 3D 푸시 버튼 활성화)
    this.updateClawButton('ready');

    // Three.js 씬 초기화 및 참가자 인형 배치
    if (!this.game) {
      this.game = new ClawMachineGame(this.canvasContainer, (result) => {
        this.showResult(result);
      });
    }
    this.game.setupGame(this.selectedTheme, this.participants);
  }

  // ==================== 당첨 결과 화면 ====================
  showResult(result) {
    // 다양한 축하 문구 중 랜덤 선택
    const randomMsg = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];

    this.resultWinnerName.textContent = result.winnerName;
    this.resultMsg.textContent = randomMsg;
    this.resultCharName.textContent = `뽑힌 인형: [${result.theme.title}] ${result.characterName}`;

    this.resultModal.classList.remove('hidden');

    // 컨페티(꽃가루 폭죽) 연출
    this.launchConfetti();
  }

  launchConfetti() {
    if (typeof confetti === 'function') {
      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      const fire = (particleRatio, opts) => {
        confetti(Object.assign({}, defaults, opts, {
          particleCount: Math.floor(count * particleRatio)
        }));
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }

  // 인형 뽑기 대형 아케이드 푸시 버튼 상태 업데이트
  updateClawButton(state) {
    if (!this.btnTriggerClaw) return;
    if (state === 'ready') {
      this.btnTriggerClaw.disabled = false;
      this.btnTriggerClaw.classList.remove('is-operating');
      this.btnTriggerClaw.innerHTML = `
        <span class="btn-glow-ring"></span>
        <span class="btn-top-badge"><i class="fa-solid fa-hand-pointer"></i> PUSH!</span>
        <span class="btn-inner">
          <i class="fa-solid fa-hand-fist btn-icon"></i>
          <span class="btn-label-text">인형 뽑기 시작!</span>
        </span>
      `;
    } else if (state === 'operating') {
      this.btnTriggerClaw.disabled = true;
      this.btnTriggerClaw.classList.add('is-operating');
      this.btnTriggerClaw.innerHTML = `
        <span class="btn-inner">
          <i class="fa-solid fa-spinner fa-spin btn-icon"></i>
          <span class="btn-label-text">집게 작동 중...</span>
        </span>
      `;
    }
  }
}

// 브라우저 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
  new AppController();
});
