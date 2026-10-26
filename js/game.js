// Three.js 씬, 카메라, 조명, 크레인 물리 애니메이션 및 관객 리액션 관리기
// 전역 Three.js 참조
const THREE = window.THREE;
import { ModelFactory } from './models.js';
import { sound } from './audio.js';

export class ClawMachineGame {
  constructor(containerElement, onFinishCallback) {
    this.container = containerElement;
    this.onFinish = onFinishCallback;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animationFrameId = null;

    // 씬 객체들
    this.cabinet = null;
    this.crane = null;
    this.dolls = []; // 각 참가자의 인형 오브젝트 배열
    this.crowd = []; // 관객 캐릭터 배열

    // 조명
    this.spotLight = null;
    this.themeLight = null;

    // 상태 관리
    this.isOperating = false;
    this.participants = [];
    this.currentTheme = null;
    this.winnerIndex = -1;
    this.targetDoll = null;

    // 크레인 제어 좌표
    this.cranePos = { x: 0, y: 4.2, z: 0 };
    this.clawOpenness = 1.0; // 0: 닫힘, 1: 활짝 열림
    this.cableLength = 1.0;

    this.clock = new THREE.Clock();

    this.initScene();
    this.setupResizeListener();
  }

  initScene() {
    // 1. 씬 생성 (인형 뽑기 기계의 화이트&파스텔 바디가 선명하게 돋보이는 세련된 딥 슬레이트 네이비 오락실 배경)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0F172A); // 기계 실루엣과 조명을 완벽히 살려주는 깊이감 있는 딥 네이비
    this.scene.fog = null; // 안개 없이 항상 맑고 투명한 시야 유지

    // 2. 카메라 설정 (상단 간판 'FATE IN THE CLAW'부터 하단 수령함까지 상하 넉넉한 여백과 함께 100% 들어오도록 최적화)
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;

    const camZ = this.calculateOptimalCameraDistance(aspect);
    const camY = 2.05; // 카메라 높이를 기계 상단 간판이 잘리지 않도록 정밀 조정

    this.camera = new THREE.PerspectiveCamera(36, aspect, 0.1, 100);
    this.camera.position.set(0, camY, camZ);
    this.camera.lookAt(0, 1.8, 0); // 상단 간판과 쇼케이스가 시원하게 들어오는 최적 중심점

    // 3. 렌더러 설정 (안티에일리어싱, 밝고 화사한 필름 톤매핑)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18; // 눈부시지 않고 캐릭터 본래 색감이 선명히 보이는 최적 노출도
    this.container.appendChild(this.renderer.domElement);

    // 4. 온화하고 화사한 환경 조명 세팅 (인형의 귀여운 색상과 기계의 질감이 또렷하게 살아남)
    // 1) 전체 앰비언트 라이트 (부드럽고 은은한 백색광)
    this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.5);
    this.scene.add(this.ambientLight);

    // 2) 기계 내부 메인 상단 스포트라이트 (인형들에게 쏟아지는 부드러운 스포트라이트)
    this.spotLight = new THREE.SpotLight(0xFFFDF0, 2.8);
    this.spotLight.position.set(0, 5.5, 0.8);
    this.spotLight.angle = Math.PI / 2.2;
    this.spotLight.penumbra = 0.6;
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 2048;
    this.spotLight.shadow.mapSize.height = 2048;
    this.spotLight.shadow.bias = -0.001;
    this.scene.add(this.spotLight);
    this.scene.add(this.spotLight.target);
    this.spotLight.target.position.set(0, 0.5, 0.2);

    // 3) 카메라 정면 필 라이트 (캐릭터 표정과 이름표를 선명하고 깨끗하게 비춤)
    this.frontFillLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    this.frontFillLight.position.set(0, 4.2, 8.5);
    this.scene.add(this.frontFillLight);
    this.frontFillLight.target.position.set(0, 1.5, 0);
    this.scene.add(this.frontFillLight.target);

    // 4) 기계 내부 좌우 천장 파스텔 LED 조명 (스카이블루 / 캔디핑크 LED 바)
    this.ceilingLightL = new THREE.PointLight(0x7DD3FC, 2.0, 10);
    this.ceilingLightL.position.set(-2.2, 4.5, 1.2);
    this.scene.add(this.ceilingLightL);

    this.ceilingLightR = new THREE.PointLight(0xF472B6, 2.0, 10);
    this.ceilingLightR.position.set(2.2, 4.5, 1.2);
    this.scene.add(this.ceilingLightR);

    // 5) 바닥 소프트 바운스 라이트 (그림자가 뭉치지 않게 크림 레몬 톤으로 반사)
    this.bounceLight = new THREE.DirectionalLight(0xFEF9C3, 0.6);
    this.bounceLight.position.set(0, -2.5, 4.0);
    this.scene.add(this.bounceLight);

    // 6) 테마별 화사한 포인트 라이트
    this.themeLight = new THREE.PointLight(0x38BDF8, 1.8, 14);
    this.themeLight.position.set(0, 4.0, 0.4);
    this.scene.add(this.themeLight);

    // 5. 아케이드 오락실 바닥 (기계가 선명하게 돋보이는 고급스러운 다크 슬레이트 타일 바닥)
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B, // 기계의 밝은 하단부를 돋보이게 하는 다크 슬레이트
      roughness: 0.35,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3.2;
    floor.receiveShadow = false;
    this.scene.add(floor);

    // 오락실 배경 네온 아치 & 축제 전구 분위기 연출
    this.createArcadeAtmosphere();

    // 6. 관객 캐릭터들 스폰 (기계 주변을 구경하는 사람들)
    this.spawnCrowd();

    // 7. 애니메이션 루프 시작
    this.animate();
  }

  // 오락실 화사하고 경쾌한 페스티벌 분위기 연출
  createArcadeAtmosphere() {
    // 배경 벽면 (기계 외곽선과 상단 간판을 100% 또렷하게 살려주는 딥 로열 인디고 톤)
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0x172554, // 깊이감 있는 딥 로열 인디고 오락실 벽면
      roughness: 0.55,
      metalness: 0.05
    });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(36, 22), backWallMat);
    backWall.position.set(0, 5.0, -7.0);
    backWall.receiveShadow = false;
    this.scene.add(backWall);

    // 화사한 컬러 네온 아치 & 라이트 바 (스카이블루, 캔디핑크, 민트, 골드)
    const neonColors = [0x38BDF8, 0xF472B6, 0x34D399, 0xFBBF24];
    const xOffsets = [-7.5, -4.8, 4.8, 7.5];
    xOffsets.forEach((x, idx) => {
      const col = neonColors[idx % neonColors.length];
      const neonMat = new THREE.MeshBasicMaterial({ color: col });
      // 수직 네온 빔
      const pillarBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 14, 16), neonMat);
      pillarBeam.position.set(x, 3.5, -6.8);
      this.scene.add(pillarBeam);
    });

    // 천장 페스티벌 파티 전구 갈랜드 (화사한 파스텔 캔디 전구들)
    const bulbColors = [0xFDE047, 0x38BDF8, 0xF472B6, 0x34D399, 0xFB923C, 0xC084FC];
    for (let i = -8; i <= 8; i += 0.9) {
      const bulbCol = bulbColors[Math.abs(Math.round(i * 3)) % bulbColors.length];
      const bulbMat = new THREE.MeshBasicMaterial({ color: bulbCol });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), bulbMat);
      const curveY = 7.0 - Math.sin(((i + 8) / 16) * Math.PI) * 0.55;
      bulb.position.set(i, curveY, -6.0);
      this.scene.add(bulb);
    }
  }

  // 기계 주변을 서성이고 구경하는 사람들(관객) 생성
  spawnCrowd() {
    const crowdPositions = [
      { x: -4.5, z: 2.2, rotY: 0.6 },
      { x: -3.8, z: 4.2, rotY: 0.4 },
      { x: 4.2, z: 2.0, rotY: -0.6 },
      { x: 4.8, z: 3.8, rotY: -0.5 },
      { x: 2.5, z: 5.5, rotY: -0.2 },
      { x: -2.2, z: 5.6, rotY: 0.2 }
    ];

    crowdPositions.forEach((pos, idx) => {
      const person = ModelFactory.createCrowdCharacter();
      person.position.set(pos.x, -3.2, pos.z);
      person.rotation.y = pos.rotY;
      person.userData.basePos = { x: pos.x, z: pos.z };
      person.userData.baseRotY = pos.rotY;
      person.userData.timeOffset = idx * 1.3;
      this.scene.add(person);
      this.crowd.push(person);
    });
  }

  // 테마 및 참가자 로드 & 인형 기계 내 배치
  setupGame(themeData, participants) {
    this.currentTheme = themeData;
    this.participants = [...participants];
    this.isOperating = false;
    this.winnerIndex = -1;
    this.targetDoll = null;

    // 조명 색상 테마에 맞춤
    if (this.themeLight && themeData.color) {
      this.themeLight.color.set(themeData.color);
    }

    // 기존 캐비닛, 크레인, 인형 제거
    if (this.cabinet) this.scene.remove(this.cabinet);
    if (this.crane) this.scene.remove(this.crane);
    this.dolls.forEach(d => this.scene.remove(d));
    this.dolls = [];

    // 캐비닛 및 크레인 생성
    this.cabinet = ModelFactory.createArcadeCabinet(themeData.color, themeData.accentColor);
    this.scene.add(this.cabinet);

    this.crane = ModelFactory.createCrane();
    this.cranePos = { x: 0, y: 4.2, z: 0 };
    this.crane.position.set(this.cranePos.x, this.cranePos.y, this.cranePos.z);
    this.scene.add(this.crane);

    // 크레인 초기 상태: 살짝 열림
    this.setClawOpenness(0.8);
    this.setCableHeight(1.0);

    // 참가자 인형 생성 및 기계 내부 바닥에 자연스럽게 배치
    const total = participants.length;
    // 인형들이 겹치지 않고 보기 좋게 쇼케이스 내부에 격자/랜덤 분산 배치
    const bounds = { minX: -1.8, maxX: 1.8, minZ: -1.6, maxZ: 1.4 };
    const cols = Math.ceil(Math.sqrt(total));
    const stepX = (bounds.maxX - bounds.minX) / Math.max(1, cols - 1 || 1);
    const stepZ = (bounds.maxZ - bounds.minZ) / Math.max(1, Math.ceil(total / cols) - 1 || 1);

    participants.forEach((name, i) => {
      // 테마의 캐릭터 목록에서 순환 선택
      const charData = themeData.characters[i % themeData.characters.length];
      const doll = ModelFactory.createCharacterDoll(charData, name, i);

      // 격자 기반 + 약간의 랜덤 오프셋
      const row = Math.floor(i / cols);
      const col = i % cols;
      let posX = (cols === 1) ? 0 : bounds.minX + col * stepX;
      let posZ = (total <= 1) ? 0 : bounds.minZ + row * stepZ;

      // 미세 랜덤 흔들림과 자연스러운 높낮이
      posX += (Math.random() - 0.5) * 0.2;
      posZ += (Math.random() - 0.5) * 0.2;

      // 배출구 구멍 구역 (x: -2.6 ~ -0.9, z: 0.8 ~ 2.5)에 인형이 겹치지 않도록 안전 영역으로 이동
      if (posX < -0.85 && posZ > 0.75) {
        posX += 1.6;
      }

      const posY = 0.55 + (Math.random() * 0.1);

      doll.position.set(posX, posY, posZ);
      doll.rotation.y = (Math.random() - 0.5) * 0.6; // 살짝 정면을 바라보되 자연스럽게
      doll.userData.originalPos = { x: posX, y: posY, z: posZ };
      doll.userData.participantIndex = i;

      this.scene.add(doll);
      this.dolls.push(doll);
    });

    // 관객들 '구경 모드'로 리셋
    this.crowd.forEach(p => {
      p.userData.state = 'watch';
      p.userData.armL.rotation.x = 0;
      p.userData.armR.rotation.x = 0;
    });

    // 카메라 원위치 (기계 전체와 인형들이 한눈에 쏙 들어오는 뷰포트)
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;
    const camZ = this.calculateOptimalCameraDistance(aspect);
    this.camera.position.set(0, 2.05, camZ);
    this.camera.lookAt(0, 1.8, 0);

    // 상단 조작 안내 문구 초기화
    this.updateNotice('[인형 뽑기 시작]을 누르면 집게가 작동합니다!', 'fa-gamepad');
  }

  // 집게 손가락 열림/닫힘 비율 조절 (0.0: 꽉 쥠, 1.0: 완전히 펼침)
  setClawOpenness(val) {
    this.clawOpenness = val;
    if (!this.crane || !this.crane.userData.fingers) return;
    const fingers = this.crane.userData.fingers;
    // val 0: rotX = -0.3 (오므림), val 1: rotX = 0.5 (벌림)
    const rotX = THREE.MathUtils.lerp(-0.35, 0.55, val);
    fingers.forEach(f => {
      f.rotation.x = rotX;
    });
  }

  // 케이블 높이 및 집게 헤드 위치 조절
  setCableHeight(height) {
    this.cableLength = height;
    if (!this.crane || !this.crane.userData.cable) return;
    const cable = this.crane.userData.cable;
    const clawHead = this.crane.userData.clawHead;

    cable.scale.set(1, height, 1);
    cable.position.y = -height / 2;
    clawHead.position.y = -height;
  }

  // 화면 상단 중앙 안내 문구 실시간 업데이트
  updateNotice(text, icon = 'fa-gamepad') {
    const el = document.getElementById('game-hud-notice');
    if (el) {
      el.innerHTML = `<i class="fa-solid ${icon}"></i> ${text}`;
    }
  }

  // ==================== 공정한 추첨 및 크레인 작동 시퀀스 ====================
  // 1. 공정하게 단 1명의 당첨자 사전 선정
  // 2. 크레인이 해당 인형 위치로 매끄럽게 이동
  // 3. 하강 -> 집게 착 감김 -> 인형을 잡고 위로 흔들리며 상승
  // 4. 배출구(Chute)로 이동 또는 정면 클로즈업 후 당첨 모달 오픈
  startLottery() {
    if (this.isOperating || this.dolls.length === 0) return;
    this.isOperating = true;

    // 공정한 무작위 1인 추첨 (모든 참가자 동일 확률)
    this.winnerIndex = Math.floor(Math.random() * this.dolls.length);
    this.targetDoll = this.dolls[this.winnerIndex];

    const targetPos = this.targetDoll.position;
    const targetName = this.targetDoll.userData.participantName;
    const targetCharName = this.targetDoll.userData.charName;

    // 크레인 작동 시작 LED 불빛 녹색 -> 황금색 깜빡임
    if (this.crane && this.crane.userData.led) {
      this.crane.userData.led.material.color.set(0xF59E0B);
    }

    // 관객들: 크레인 이동에 집중
    this.crowd.forEach(p => p.userData.state = 'watch');

    // 시퀀스 실행
    this.runCraneSequence(targetPos, () => {
      // 완료 시 콜백 호출 (결과 모달 오픈)
      if (this.onFinish) {
        this.onFinish({
          winnerName: targetName,
          characterName: targetCharName,
          theme: this.currentTheme
        });
      }
      this.isOperating = false;
    });
  }

  // 애니메이션 시퀀스 컨트롤러
  runCraneSequence(targetPos, onComplete) {
    this.updateNotice('집게가 당첨 캐릭터를 조준하여 이동 중입니다...', 'fa-crosshairs');
    const startPos = { ...this.cranePos };
    const aimX = targetPos.x;
    const aimZ = targetPos.z;

    let moveSoundTimer = setInterval(() => {
      sound.playCraneMove();
    }, 220);

    // 1단계: 크레인 좌우/전후 이동 (타겟 인형 상단으로)
    const duration1 = 1400;
    const startTime1 = performance.now();

    const step1 = (now) => {
      const elapsed = now - startTime1;
      const progress = Math.min(1, elapsed / duration1);
      const ease = this.easeInOutCubic(progress);

      this.cranePos.x = THREE.MathUtils.lerp(startPos.x, aimX, ease);
      this.cranePos.z = THREE.MathUtils.lerp(startPos.z, aimZ, ease);
      this.crane.position.x = this.cranePos.x;
      this.crane.position.z = this.cranePos.z;

      // 카메라 살짝 따라감
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, aimX * 0.4, 0.05);

      if (progress < 1) {
        requestAnimationFrame(step1);
      } else {
        clearInterval(moveSoundTimer);
        // 집게 완전히 활짝 열기
        this.setClawOpenness(1.0);
        // 2단계: 하강
        setTimeout(() => this.stepDescend(targetPos, onComplete), 200);
      }
    };

    requestAnimationFrame(step1);
  }

  // 2단계: 크레인 하강
  stepDescend(targetPos, onComplete) {
    this.updateNotice('집게 하강! 캐릭터를 향해 내려갑니다!', 'fa-arrow-down');
    const startCable = this.cableLength;
    // 인형 머리까지의 거리 계산 (기계 상부 4.2에서 인형 posY + 0.65까지)
    const targetCable = 4.2 - (targetPos.y + 0.65);
    const duration = 1200;
    const startTime = performance.now();

    const anim = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = this.easeInQuad(progress);

      const currHeight = THREE.MathUtils.lerp(startCable, targetCable, ease);
      this.setCableHeight(currHeight);

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        // 3단계: 집게 오므려서 인형 잡기 (Claw Grab & Lock)
        sound.playClawGrab();
        this.stepGrab(targetPos, onComplete);
      }
    };

    requestAnimationFrame(anim);
  }

  // 3단계: 집게 오므려서 인형 꽉 잡기
  stepGrab(targetPos, onComplete) {
    this.updateNotice('철컥! 캐릭터를 단단히 움켜쥐었습니다!', 'fa-hand-back-fist');
    const duration = 400;
    const startTime = performance.now();

    const anim = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = this.easeOutBack(progress);

      const openness = THREE.MathUtils.lerp(1.0, 0.1, ease);
      this.setClawOpenness(openness);

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        // 인형을 집게 자식으로 붙이거나 함께 상승
        setTimeout(() => this.stepAscend(targetPos, onComplete), 250);
      }
    };

    requestAnimationFrame(anim);
  }

  // 4단계: 인형 들어올리기 (흔들림 + 텐션 모션)
  stepAscend(targetPos, onComplete) {
    this.updateNotice('환호 속에서 당첨 캐릭터를 들어올립니다!', 'fa-arrow-up');
    sound.playLift();

    // 관객들: 잡아서 들어올리는 순간 모두 팔 들고 환호 시작!
    this.crowd.forEach(p => p.userData.state = 'cheer');

    const startCable = this.cableLength;
    const endCable = 1.0; // 상단으로 복귀
    const duration = 1500;
    const startTime = performance.now();
    const startDollY = targetPos.y;

    const anim = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = this.easeInOutQuad(progress);

      const currHeight = THREE.MathUtils.lerp(startCable, endCable, ease);
      this.setCableHeight(currHeight);

      // 인형도 집게와 함께 상승 + 공중에 대롱대롱 매달려 흔들리는 물리 느낌 (Wobble)
      const clawY = 4.2 - currHeight;
      this.targetDoll.position.y = clawY - 0.7;
      this.targetDoll.position.x = this.cranePos.x + Math.sin(elapsed * 0.008) * 0.08;
      this.targetDoll.position.z = this.cranePos.z + Math.cos(elapsed * 0.008) * 0.08;
      this.targetDoll.rotation.z = Math.sin(elapsed * 0.008) * 0.15;

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        // 5단계: 배출구 쪽으로 이동 또는 당첨 클로즈업
        setTimeout(() => this.stepMoveToChute(onComplete), 300);
      }
    };

    requestAnimationFrame(anim);
  }

  // 5단계: 크레인이 잡은 인형을 들고 배출구(Chute) 상단으로 이동
  stepMoveToChute(onComplete) {
    this.updateNotice('집게가 당첨 인형을 안전하게 배출구로 운반 중입니다...', 'fa-truck-ramp-box');
    const duration = 1600;
    const startTime = performance.now();
    const startPos = { ...this.cranePos };
    // 배출구 정확한 중심 좌표 (x: -1.75, z: 1.65)
    const chuteX = -1.75;
    const chuteZ = 1.65;

    let moveSoundTimer = setInterval(() => {
      sound.playCraneMove();
    }, 240);

    const anim = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = this.easeInOutCubic(progress);

      this.cranePos.x = THREE.MathUtils.lerp(startPos.x, chuteX, ease);
      this.cranePos.z = THREE.MathUtils.lerp(startPos.z, chuteZ, ease);
      this.crane.position.x = this.cranePos.x;
      this.crane.position.z = this.cranePos.z;

      // 인형도 집게를 따라가되 대롱대롱 매달려 자연스럽게 흔들림 (Sway Momentum)
      const sway = Math.sin(elapsed * 0.008) * (1 - progress * 0.5) * 0.08;
      this.targetDoll.position.x = this.cranePos.x + sway;
      this.targetDoll.position.z = this.cranePos.z + Math.cos(elapsed * 0.008) * 0.05;
      this.targetDoll.rotation.z = Math.sin(elapsed * 0.008) * 0.15;
      this.targetDoll.rotation.y += 0.02;

      // 카메라는 배출구와 하단 수령함이 모두 잘 보이는 각도로 부드럽게 이동
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, -0.65, 0.04);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 2.1, 0.04);
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 7.0, 0.04);
      this.camera.lookAt(-1.2, 0.7, 1.5);

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        clearInterval(moveSoundTimer);
        // 배출구 상단에 정위치
        this.targetDoll.position.x = chuteX;
        this.targetDoll.position.z = chuteZ;
        this.targetDoll.rotation.z = 0;

        this.updateNotice('배출구 상단 도착! 집게가 오픈됩니다!', 'fa-arrow-down');
        setTimeout(() => this.stepReleaseAndDrop(onComplete), 350);
      }
    };

    requestAnimationFrame(anim);
  }

  // 6단계: 집게 오픈 및 중력 낙하 (배출구 구멍 내부로 자연스럽게 떨어짐)
  stepReleaseAndDrop(onComplete) {
    // 집게 활짝 열기
    this.setClawOpenness(1.0);
    sound.playClawRelease();

    const chuteX = -1.75;
    const chuteZ = 1.65;
    const startY = this.targetDoll.position.y;
    let currentY = startY;
    let vy = 0;
    const gravity = 18.0;
    let lastTime = performance.now();

    // 회전 흔들림 각속도 (공중에서 자연스러운 텀블링)
    const rotSpeedX = 0.08;
    const rotSpeedY = 0.05;
    const rotSpeedZ = 0.06;

    const fallAnim = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;

      // 중력 가속도 적용
      vy += gravity * dt;
      currentY -= vy * dt;
      this.targetDoll.position.y = currentY;

      // 공중 회전
      this.targetDoll.rotation.x += rotSpeedX;
      this.targetDoll.rotation.y += rotSpeedY;
      this.targetDoll.rotation.z += rotSpeedZ;

      // 배출구 구멍 좌표와 정확히 일치 유지
      this.targetDoll.position.x = chuteX;
      this.targetDoll.position.z = chuteZ;

      // 인형이 구멍 입구(y <= 0.35) 내부로 진입할수록 점점 작아지고 깊은 어둠 속으로 빨려 들어감
      if (currentY <= 0.35) {
        const depthProgress = Math.max(0, Math.min(1, (0.35 - currentY) / 1.65));
        const scaleVal = THREE.MathUtils.lerp(1.0, 0.52, depthProgress);
        this.targetDoll.scale.set(scaleVal, scaleVal, scaleVal);
      }

      // 슈트 내부 깊은 곳(y <= -1.3)에 도달하면 상단 쇼케이스에서 완전히 사라짐
      if (currentY > -1.3) {
        requestAnimationFrame(fallAnim);
      } else {
        // 배출구 통과: 사라짐 및 통로 쿵 소리
        this.targetDoll.visible = false;
        sound.playChuteDrop();

        this.updateNotice('슈트 통과 중... 하단 수령구로 이동합니다!', 'fa-arrow-down-long');
        setTimeout(() => this.stepPrizeEmergence(onComplete), 400);
      }
    };

    requestAnimationFrame(fallAnim);
  }

  // 7단계: 하단 수령함(Prize Retrieval Hatch)에서 인형 등장 & 축하 연출
  stepPrizeEmergence(onComplete) {
    this.updateNotice('🎊 축하합니다! 인형이 하단 수령함에 도착했습니다! 🎊', 'fa-gift');

    // 하단 수령함 조명 화려하게 밝힘
    if (this.cabinet && this.cabinet.userData.prizeLight) {
      this.cabinet.userData.prizeLight.intensity = 4.0;
    }

    // 인형 스케일 및 위치 초기화 (슬라이드 시작 지점)
    const rampStartX = -1.75;
    const rampStartY = -0.95;
    const rampStartZ = 2.1;
    const trayX = -1.75;
    const trayY = -1.55;
    const trayZ = 3.25;

    this.targetDoll.scale.set(1.0, 1.0, 1.0);
    this.targetDoll.position.set(rampStartX, rampStartY, rampStartZ);
    this.targetDoll.rotation.set(0.25, 0, 0);
    this.targetDoll.visible = true;

    // 카메라도 하단 수령함을 클로즈업
    const startCamY = this.camera.position.y;
    const startCamZ = this.camera.position.z;

    const duration = 850;
    const startTime = performance.now();

    const slideAnim = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Z축 전면으로 슬라이드 이동
      this.targetDoll.position.z = THREE.MathUtils.lerp(rampStartZ, trayZ, this.easeOutQuad(progress));
      this.targetDoll.position.x = trayX;

      // Y축: 미끄러져 내려오다가 바닥에 닿는 순간(progress > 0.6) 통통 튀는 바운스
      if (progress <= 0.6) {
        const p1 = progress / 0.6;
        this.targetDoll.position.y = THREE.MathUtils.lerp(rampStartY, trayY, p1);
      } else {
        const bounceP = (progress - 0.6) / 0.4;
        this.targetDoll.position.y = trayY + Math.sin(bounceP * Math.PI) * 0.16;
      }

      // 인형이 정면을 바라보도록 정렬
      this.targetDoll.rotation.x = THREE.MathUtils.lerp(0.25, 0, progress);
      this.targetDoll.rotation.y = THREE.MathUtils.lerp(0.4, 0, progress);
      this.targetDoll.rotation.z = THREE.MathUtils.lerp(0.15, 0, progress);

      // 카메라가 하단 수령함을 향해 부드럽게 틸트
      this.camera.position.y = THREE.MathUtils.lerp(startCamY, 1.6, progress * 0.5);
      this.camera.position.z = THREE.MathUtils.lerp(startCamZ, 6.2, progress * 0.5);
      this.camera.lookAt(-1.2, -0.6, 2.5);

      if (progress < 1) {
        requestAnimationFrame(slideAnim);
      } else {
        this.targetDoll.position.set(trayX, trayY, trayZ);
        this.targetDoll.rotation.set(0, 0, 0);

        // 관객들 일제히 점프 환호
        this.crowd.forEach(p => p.userData.state = 'cheer');

        // 축하 팡파레 재생
        sound.playCelebration();

        // 1.3초간 수령함에 담긴 인형을 감상한 뒤 결과 모달 오픈
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 1300);
      }
    };

    requestAnimationFrame(slideAnim);
  }

  // ==================== 애니메이션 루프 및 관객/인형 유휴 인터랙션 ====================
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. 관객 캐릭터들 애니메이션 (서성이거나 구경하고 환호)
    this.crowd.forEach(person => {
      const u = person.userData;
      if (u.state === 'watch') {
        // 조용히 기계 구경하며 좌우로 살랑살랑 호흡
        person.position.y = -3.2 + Math.sin(time * 2 + u.timeOffset) * 0.03;
        person.rotation.y = u.baseRotY + Math.sin(time * 0.8 + u.timeOffset) * 0.08;
      } else if (u.state === 'cheer') {
        // 인형 잡혔을 때 방방 뛰며 양팔 번쩍 흔들기!
        person.position.y = -3.2 + Math.abs(Math.sin(time * 8 + u.timeOffset)) * 0.35;
        u.armL.rotation.x = Math.PI - 0.3 + Math.sin(time * 12) * 0.4;
        u.armR.rotation.x = Math.PI - 0.3 + Math.cos(time * 12) * 0.4;
      }
    });

    // 2. 인형 머리 위 이름표는 항상 카메라를 향하도록 빌보드 처리
    this.dolls.forEach(doll => {
      const nameTag = doll.getObjectByName('nameTag');
      if (nameTag && this.camera) {
        nameTag.quaternion.copy(this.camera.quaternion);
      }
    });

    // 3. 유휴 상태 시 크레인 LED 및 네온 은은한 펄스
    if (!this.isOperating && this.crane && this.crane.userData.led) {
      const pulse = 0.5 + Math.sin(time * 4) * 0.5;
      this.crane.userData.led.scale.setScalar(0.9 + pulse * 0.2);
    }

    this.renderer.render(this.scene, this.camera);
  }

  // 기계 전체와 상단 간판이 화면에 시원하게 다 담기도록 최적 카메라 거리 계산
  calculateOptimalCameraDistance(aspect) {
    // 기계 규격: 높이 약 8.5 (y: -2.5 ~ 5.8), 너비 약 6.8 (x: -3.4 ~ 3.4)
    // 상단 네온 로고 간판(y=5.2~5.7) 위로 맑은 하늘 여백을 넉넉히 확보하는 거리 15.0
    if (aspect >= 1.4) {
      return 15.0;
    } else if (aspect >= 1.0) {
      return 15.0 + (1.4 - aspect) * 6.5;
    } else {
      // 모바일 세로 모드 (aspect < 1.0)
      return 16.5 / Math.max(0.55, aspect * 1.05);
    }
  }

  // 창 크기 리사이징 처리
  setupResizeListener() {
    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer || !this.camera) return;
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;
      const aspect = width / height;
      this.camera.aspect = aspect;
      if (!this.isOperating) {
        const camZ = this.calculateOptimalCameraDistance(aspect);
        this.camera.position.set(0, 2.05, camZ);
        this.camera.lookAt(0, 1.8, 0);
      }
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  // 이징 함수들
  easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
  easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }
  easeInQuad(x) {
    return x * x;
  }
  easeOutBack(x) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }
  easeOutQuad(x) {
    return 1 - (1 - x) * (1 - x);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
