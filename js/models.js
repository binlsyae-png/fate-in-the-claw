// Three.js 3D 모델 생성기
// - 테마별 3D 캐릭터 피규어 (절차적 고품질 모델링 + 표정 캔버스 텍스처 + 참가자 이름표)
// - 3지 크레인(집게) 어셈블리 (피봇 조인트 애니메이션)
// - 아케이드 인형 뽑기 캐비닛 (네온 조명, 투명 쇼케이스, 배출구, 조작 패널)
// - 오락실 구경꾼/관객 3D 캐릭터 (사람들이 서성이고 구경하며 환호하는 모습)

// 전역 Three.js 참조
const THREE = window.THREE;

export class ModelFactory {
  // 이름별 고유 식별 컬러 팔레트 (누구인지 한눈에 즉시 판단할 수 있는 다채로운 10가지 컬러)
  static NAME_PALETTES = [
    { bg: '#FFF1F2', border: '#F43F5E', text: '#BE123C', dot: '#E11D48' }, // 1. 캔디 핑크
    { bg: '#EFF6FF', border: '#3B82F6', text: '#1D4ED8', dot: '#2563EB' }, // 2. 오션 블루
    { bg: '#ECFDF5', border: '#10B981', text: '#047857', dot: '#059669' }, // 3. 에메랄드 민트
    { bg: '#FFFBEB', border: '#F59E0B', text: '#B45309', dot: '#D97706' }, // 4. 허니 골드
    { bg: '#FAF5FF', border: '#A855F7', text: '#6B21A8', dot: '#9333EA' }, // 5. 라벤더 퍼플
    { bg: '#FFF7ED', border: '#FB923C', text: '#C2410C', dot: '#EA580C' }, // 6. 비타민 오렌지
    { bg: '#F0FDFA', border: '#14B8A6', text: '#0F766E', dot: '#0D9488' }, // 7. 청량 터콰이즈
    { bg: '#FDF2F8', border: '#EC4899', text: '#9D174D', dot: '#DB2777' }, // 8. 캔디 로즈
    { bg: '#EEF2FF', border: '#6366F1', text: '#3730A3', dot: '#4F46E5' }, // 9. 로열 인디고
    { bg: '#F7FEE7', border: '#84CC16', text: '#3F6212', dot: '#65A30D' }  // 10. 싱그러운 라임
  ];

  static getNamePalette(name, index = 0) {
    if (typeof index === 'number' && index >= 0) {
      return this.NAME_PALETTES[index % this.NAME_PALETTES.length];
    }
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.NAME_PALETTES[Math.abs(hash) % this.NAME_PALETTES.length];
  }

  // 참가자 이름표 캔버스 텍스처 (이름마다 확연히 다른 고유 컬러와 또렷한 입체 뱃지 스타일)
  static createNameTagTexture(name, index = 0) {
    const palette = this.getNamePalette(name, index);

    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 84;
    const ctx = canvas.getContext('2d');

    // 라운드 캡슐 박스 (고유 파스텔 틴트 배경)
    ctx.fillStyle = palette.bg;
    ctx.beginPath();
    ctx.roundRect(4, 4, 272, 76, 26);
    ctx.fill();

    // 두껍고 선명한 고유 테두리선
    ctx.lineWidth = 6;
    ctx.strokeStyle = palette.border;
    ctx.stroke();

    // 좌측 귀여운 컬러풀 인디케이터 점(도트 뱃지)
    ctx.fillStyle = palette.dot;
    ctx.beginPath();
    ctx.arc(28, 42, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(26, 40, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 텍스트 (참가자 고유 컬러로 또렷하게 표시)
    ctx.font = 'bold 36px "Jua", "Noto Sans KR", sans-serif';
    ctx.fillStyle = palette.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = palette.border;
    ctx.shadowBlur = 4;
    ctx.fillText(name, 148, 43);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // 눈 & 표정 캔버스 텍스처 생성기
  static createFaceTexture(type, options = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 256);

    ctx.save();
    switch (type) {
      case 'pikachu':
        // 눈
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.arc(75, 120, 18, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(181, 120, 18, 0, Math.PI * 2); ctx.fill();
        // 눈 하이라이트
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(70, 114, 7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(176, 114, 7, 0, Math.PI * 2); ctx.fill();
        // 빨간 볼
        ctx.fillStyle = '#E53935';
        ctx.beginPath(); ctx.arc(45, 155, 24, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(211, 155, 24, 0, Math.PI * 2); ctx.fill();
        // 입
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(115, 140, 12, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.arc(141, 140, 12, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;

      case 'hellokitty':
        // 눈
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.ellipse(80, 130, 8, 14, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(176, 130, 8, 14, 0, 0, Math.PI * 2); ctx.fill();
        // 노란 코
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath(); ctx.ellipse(128, 145, 12, 8, 0, 0, Math.PI * 2); ctx.fill();
        // 수염
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 4;
        [-1, 0, 1].forEach(offset => {
          ctx.beginPath(); ctx.moveTo(40, 135 + offset * 18); ctx.lineTo(15, 130 + offset * 25); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(216, 135 + offset * 18); ctx.lineTo(241, 130 + offset * 25); ctx.stroke();
        });
        break;

      case 'shinchan':
        // 짱구 특유의 굵은 짱구눈썹
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.ellipse(80, 95, 32, 14, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(176, 95, 32, 14, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // 크고 초롱초롱한 눈
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.arc(80, 135, 20, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(176, 135, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(74, 128, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(170, 128, 8, 0, Math.PI * 2); ctx.fill();
        // 익살스러운 빨간 볼
        ctx.fillStyle = 'rgba(255, 138, 128, 0.6)';
        ctx.beginPath(); ctx.ellipse(55, 160, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(201, 160, 20, 12, 0, 0, Math.PI * 2); ctx.fill();
        // 웃는 입
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(128, 165, 16, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
        break;

      case 'chiikawa':
        // 치이카와 초롱초롱 눈
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.ellipse(85, 125, 12, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(171, 125, 12, 16, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(82, 118, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(168, 118, 5, 0, Math.PI * 2); ctx.fill();
        // 핑크 볼
        ctx.fillStyle = '#FF8A80';
        ctx.beginPath(); ctx.ellipse(65, 150, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(191, 150, 18, 12, 0, 0, Math.PI * 2); ctx.fill();
        // 작은 세모 코와 입
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.arc(128, 135, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#212121'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(122, 142, 8, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.arc(134, 142, 8, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        break;

      default:
        // 귀여운 기본 눈
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.arc(85, 125, 14, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(171, 125, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath(); ctx.arc(80, 119, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(166, 119, 6, 0, Math.PI * 2); ctx.fill();
        // 미소
        ctx.strokeStyle = '#212121'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(128, 145, 14, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
        break;
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // ==================== 3D 캐릭터 인형 생성 ====================
  static createCharacterDoll(characterData, participantName, participantIndex = 0) {
    const group = new THREE.Group();
    group.name = `doll_${participantName}`;
    group.userData = {
      participantName: participantName,
      participantIndex: participantIndex,
      charId: characterData.id,
      charName: characterData.name
    };

    // 고품질 툰/스탠다드 재질
    const mainMat = new THREE.MeshStandardMaterial({
      color: characterData.color || '#FDD835',
      roughness: 0.35,
      metalness: 0.1
    });

    const whiteMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 });
    const blackMat = new THREE.MeshStandardMaterial({ color: '#212121', roughness: 0.5 });
    const redMat = new THREE.MeshStandardMaterial({ color: '#E53935', roughness: 0.3 });

    // 몸체 & 머리
    let bodyMesh;
    const model = characterData.model || 'default';

    if (model === 'pikachu') {
      // 피카츄 몸체
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 24), mainMat);
      bodyMesh.scale.set(1, 1.15, 0.95);
      group.add(bodyMesh);

      // 귀 2개 (끝은 검은색)
      [-0.45, 0.45].forEach((xOffset, idx) => {
        const earGroup = new THREE.Group();
        const earBase = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 16), mainMat);
        earBase.position.y = 0.35;
        const earTip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 16), blackMat);
        earTip.position.y = 0.65;
        earGroup.add(earBase, earTip);

        earGroup.position.set(xOffset, 0.7, 0);
        earGroup.rotation.z = idx === 0 ? 0.45 : -0.45;
        earGroup.rotation.x = -0.15;
        group.add(earGroup);
      });

      // 번개 꼬리
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.05), mainMat);
      tail.position.set(0, 0.2, -0.65);
      tail.rotation.x = -0.4;
      group.add(tail);

    } else if (model === 'hellokitty' || model === 'mymelody' || model === 'kuromi') {
      // 산리오 캐릭터
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 24), mainMat);
      bodyMesh.scale.set(1.15, 0.95, 0.95);
      group.add(bodyMesh);

      // 고양이 귀
      [-0.45, 0.45].forEach((xOffset, idx) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 16), mainMat);
        ear.position.set(xOffset, 0.6, 0);
        ear.rotation.z = idx === 0 ? 0.35 : -0.35;
        group.add(ear);
      });

      // 리본 또는 모자
      const bowColor = characterData.bowColor || (model === 'kuromi' ? '#E91E63' : '#E53935');
      const bowMat = new THREE.MeshStandardMaterial({ color: bowColor, roughness: 0.3 });
      const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), bowMat);
      bowCenter.position.set(0.4, 0.55, 0.4);
      const bowLeft = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.25, 16), bowMat);
      bowLeft.position.set(0.26, 0.55, 0.4);
      bowLeft.rotation.z = Math.PI / 2;
      const bowRight = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.25, 16), bowMat);
      bowRight.position.set(0.54, 0.55, 0.4);
      bowRight.rotation.z = -Math.PI / 2;
      group.add(bowCenter, bowLeft, bowRight);

    } else if (model === 'shinchan') {
      // 짱구
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 24), new THREE.MeshStandardMaterial({ color: '#FFE0B2', roughness: 0.4 }));
      bodyMesh.scale.set(1.05, 1.0, 1.0);
      group.add(bodyMesh);

      // 짱구 특유의 솟아오른 뺨 실루엣
      const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), new THREE.MeshStandardMaterial({ color: '#FFE0B2' }));
      cheekL.position.set(-0.45, -0.15, 0.2);
      const cheekR = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), new THREE.MeshStandardMaterial({ color: '#FFE0B2' }));
      cheekR.position.set(0.45, -0.15, 0.2);
      group.add(cheekL, cheekR);

      // 짱구 짧은 까까머리
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), blackMat);
      hair.position.y = 0.05;
      hair.rotation.x = -0.2;
      group.add(hair);

      // 빨간 옷 몸통
      const shirt = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.48, 0.5, 24), redMat);
      shirt.position.y = -0.65;
      group.add(shirt);

    } else if (model === 'mickey' || model === 'disney') {
      // 디즈니 미키 스타일
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 24), blackMat);
      group.add(bodyMesh);

      // 커다란 미키 원형 귀 2개
      [-0.55, 0.55].forEach(xOffset => {
        const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.06, 24), blackMat);
        ear.position.set(xOffset, 0.65, 0);
        ear.rotation.x = Math.PI / 2;
        group.add(ear);
      });

    } else if (model === 'totoro') {
      // 지브리 토토로
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 24), mainMat);
      bodyMesh.scale.set(1.05, 1.25, 0.95);
      group.add(bodyMesh);

      // 토토로 뾰족 귀 2개
      [-0.35, 0.35].forEach((xOffset, idx) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 16), mainMat);
        ear.position.set(xOffset, 0.85, 0);
        ear.rotation.z = idx === 0 ? 0.2 : -0.2;
        group.add(ear);
      });

      // 배 (흰색 볼록)
      const belly = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), new THREE.MeshStandardMaterial({ color: '#ECEFF1', roughness: 0.5 }));
      belly.position.set(0, -0.15, 0.42);
      belly.scale.set(1, 1.2, 0.5);
      group.add(belly);

    } else if (model === 'kirby') {
      // 커비: 둥글고 귀여운 핑크 볼
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 24), new THREE.MeshStandardMaterial({ color: '#FF80AB', roughness: 0.25 }));
      group.add(bodyMesh);

      // 팔 2개
      const armL = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshStandardMaterial({ color: '#FF80AB' }));
      armL.position.set(-0.62, 0.1, 0.1);
      const armR = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshStandardMaterial({ color: '#FF80AB' }));
      armR.position.set(0.62, 0.1, 0.1);
      // 빨간 발 2개
      const footMat = new THREE.MeshStandardMaterial({ color: '#E91E63', roughness: 0.3 });
      const footL = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), footMat);
      footL.position.set(-0.35, -0.55, 0.25);
      footL.scale.set(1, 0.6, 1.4);
      const footR = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), footMat);
      footR.position.set(0.35, -0.55, 0.25);
      footR.scale.set(1, 0.6, 1.4);
      group.add(armL, armR, footL, footR);

    } else if (model === 'chiikawa' || model === 'hachiware' || model === 'usagi') {
      // 치이카와 / 우사기
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 24), mainMat);
      bodyMesh.scale.set(1.1, 1.0, 1.0);
      group.add(bodyMesh);

      // 둥근 곰쥐 귀
      const earH = model === 'usagi' ? 0.6 : 0.24;
      const earR = model === 'usagi' ? 0.12 : 0.2;
      [-0.4, 0.4].forEach((xOffset, idx) => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(earR, earH, 16), mainMat);
        ear.position.set(xOffset, 0.6 + (model === 'usagi' ? 0.2 : 0), 0);
        ear.rotation.z = idx === 0 ? 0.25 : -0.25;
        group.add(ear);
      });

    } else if (model === 'rilakkuma' || model === 'korilakkuma') {
      // 리락쿠마
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 24), mainMat);
      bodyMesh.scale.set(1.12, 1.0, 0.98);
      group.add(bodyMesh);

      // 둥근 곰 귀
      [-0.52, 0.52].forEach(xOffset => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), mainMat);
        ear.position.set(xOffset, 0.5, 0);
        const inside = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), new THREE.MeshStandardMaterial({ color: characterData.earInsideColor || '#FFD54F' }));
        inside.position.set(xOffset, 0.5, 0.1);
        group.add(ear, inside);
      });

      // 주둥이
      const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), new THREE.MeshStandardMaterial({ color: '#FFF8E1' }));
      muzzle.position.set(0, -0.08, 0.55);
      muzzle.scale.set(1.2, 0.85, 0.5);
      group.add(muzzle);

    } else if (model === 'dino' || model === 'hangyodon') {
      // 참고 이미지 속 귀여운 민트블루 공룡/한교동 인형
      const dinoMat = new THREE.MeshStandardMaterial({
        color: characterData.color || '#38BDF8',
        roughness: 0.28,
        metalness: 0.05
      });
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 24), dinoMat);
      bodyMesh.scale.set(1.08, 1.0, 1.05);
      group.add(bodyMesh);

      // 등/머리 위의 귀여운 분홍 볏/지느러미 3개
      const finMat = new THREE.MeshStandardMaterial({ color: '#F472B6', roughness: 0.3 });
      [0.62, 0.45, 0.2].forEach((yPos, i) => {
        const fin = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 12), finMat);
        fin.position.set(0, yPos, -0.15 - i * 0.25);
        fin.rotation.x = -0.4;
        group.add(fin);
      });

      // 작은 꼬리
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 12), dinoMat);
      tail.position.set(0, -0.2, -0.65);
      tail.rotation.x = -1.2;
      group.add(tail);

      // 작은 양팔
      [-0.48, 0.48].forEach((xOff, i) => {
        const arm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), dinoMat);
        arm.position.set(xOff, -0.12, 0.4);
        group.add(arm);
      });

    } else {
      // 기본 고품질 캡슐형 토이
      bodyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.65, 32, 24), mainMat);
      bodyMesh.scale.set(1.05, 1.15, 1.0);
      group.add(bodyMesh);

      // 귀여운 구형 귀
      [-0.45, 0.45].forEach(xOffset => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), mainMat);
        ear.position.set(xOffset, 0.6, 0);
        group.add(ear);
      });
    }

    // 표정 데칼 평면 (정면에 부착)
    const faceType = ['pikachu', 'hellokitty', 'shinchan', 'chiikawa'].includes(model) ? model : 'default';
    const faceTex = this.createFaceTexture(faceType);
    const facePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.9),
      new THREE.MeshBasicMaterial({ map: faceTex, transparent: true, depthWrite: false })
    );
    facePlane.position.set(0, 0.05, 0.66);
    group.add(facePlane);

    // 참가자 이름표 태그 (인형 머리 위 상단에 떠 있는 네임플레이트 - 이름마다 고유 컬러 적용)
    const nameTex = this.createNameTagTexture(participantName, participantIndex);
    const namePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 0.42),
      new THREE.MeshBasicMaterial({ map: nameTex, transparent: true, side: THREE.DoubleSide })
    );
    namePlane.position.set(0, 1.25, 0);
    namePlane.name = 'nameTag';
    group.add(namePlane);

    // 그림자 생성
    group.traverse(child => {
      if (child.isMesh && child !== facePlane && child !== namePlane) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return group;
  }

  // ==================== 3D 크레인(집게) 어셈블리 ====================
  static createCrane() {
    const craneRoot = new THREE.Group();
    craneRoot.name = 'craneRoot';

    // 1. 상부 레일 캐리지 (X/Z 축 이동 블록)
    const metalMat = new THREE.MeshStandardMaterial({ color: '#E0E7FF', metalness: 0.85, roughness: 0.2 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', metalness: 0.95, roughness: 0.1 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#FBBF24', metalness: 0.9, roughness: 0.2 });
    const neonMat = new THREE.MeshBasicMaterial({ color: '#38BDF8' });

    const trolley = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 1.6), metalMat);
    trolley.castShadow = true;
    craneRoot.add(trolley);

    // 트롤리 상단 네온 링
    const neonRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.05, 16, 32), neonMat);
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.y = 0.23;
    craneRoot.add(neonRing);

    // 2. 신축 케이블 (Y축 늘어남)
    const cableMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.5, roughness: 0.4 });
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1, 16), cableMat);
    cable.name = 'cable';
    cable.position.y = -0.5;
    craneRoot.add(cable);

    // 3. 집게 헤드 및 피봇 (케이블 끝에 달림)
    const clawHead = new THREE.Group();
    clawHead.name = 'clawHead';
    clawHead.position.y = -1.0;
    craneRoot.add(clawHead);

    // 집게 중심 캡 (골드 돔)
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), goldMat);
    dome.rotation.x = Math.PI;
    clawHead.add(dome);

    // 크레인 작동 표시등 (LED)
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshBasicMaterial({ color: '#22C55E' }));
    led.name = 'craneLED';
    led.position.y = 0.22;
    clawHead.add(led);

    // 4. 3개의 갈고리 발 (120도 간격, 관절 회전)
    const clawFingers = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const pivot = new THREE.Group();
      pivot.rotation.y = angle;
      pivot.position.set(Math.cos(angle) * 0.28, -0.15, Math.sin(angle) * 0.28);

      // 관절 모션용 회전 축
      const jointGroup = new THREE.Group();
      jointGroup.name = `joint_${i}`;
      pivot.add(jointGroup);

      // 상부 암
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.65, 12), chromeMat);
      upperArm.position.set(0, -0.3, 0.12);
      upperArm.rotation.x = 0.4;
      jointGroup.add(upperArm);

      // 하부 곡선 갈고리 팁
      const lowerHook = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 0.65, 12), goldMat);
      lowerHook.position.set(0, -0.72, 0.26);
      lowerHook.rotation.x = -0.75;
      jointGroup.add(lowerHook);

      clawHead.add(pivot);
      clawFingers.push(jointGroup);
    }

    craneRoot.userData = {
      cable: cable,
      clawHead: clawHead,
      fingers: clawFingers,
      led: led
    };

    return craneRoot;
  }

  // ==================== 3D 아케이드 인형뽑기 캐비닛 (밝고 화사한 파스텔 아케이드 스타일) ====================
  static createArcadeCabinet(themeColor = '#38BDF8', accentColor = '#F472B6') {
    const cabinet = new THREE.Group();
    cabinet.name = 'arcadeCabinet';

    // 1. 화사한 파스텔 스카이블루 하단 캐비닛 베이스
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#BAE6FD',
      roughness: 0.2,
      metalness: 0.15
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(6.8, 3.2, 6.6), baseMat);
    base.position.y = -1.6;
    base.receiveShadow = true;
    cabinet.add(base);

    // 하단 베이스 전면 캔디 핑크 띠 몰딩
    const pinkTrimMat = new THREE.MeshStandardMaterial({
      color: '#F472B6',
      roughness: 0.15,
      metalness: 0.2
    });
    const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(6.85, 0.22, 0.1), pinkTrimMat);
    baseTrim.position.set(0, -0.15, 3.32);
    cabinet.add(baseTrim);

    // 2. 하단 경품 수령 공간 (Prize Retrieval Chamber)
    // - 캐비닛 하단 전면 좌측(-1.75, -1.6, 2.9)에 실제 인형이 미끄러져 나오는 내부 수령 챔버
    const chamberGroup = new THREE.Group();
    chamberGroup.position.set(-1.75, -1.6, 2.9);

    // 수령함 내부 깨끗한 크림 화이트 벽면
    const chamberMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.2,
      metalness: 0.2
    });
    // 내부 챔버 (뒤, 좌, 우, 바닥)
    const chamberBack = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.4), chamberMat);
    chamberBack.position.set(0, 0, -0.6);
    const chamberFloor = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), chamberMat);
    chamberFloor.rotation.x = -Math.PI / 2;
    chamberFloor.position.set(0, -0.7, 0);
    const chamberLeft = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), chamberMat);
    chamberLeft.rotation.y = Math.PI / 2;
    chamberLeft.position.set(-1.0, 0, 0);
    const chamberRight = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), chamberMat);
    chamberRight.rotation.y = -Math.PI / 2;
    chamberRight.position.set(1.0, 0, 0);

    chamberGroup.add(chamberBack, chamberFloor, chamberLeft, chamberRight);

    // 수령함 내부 따뜻한 골드 옐로우 조명 (인형 수령 시 빛남)
    const prizeLight = new THREE.PointLight(0xFBBF24, 1.8, 5.0);
    prizeLight.position.set(0, 0.4, 0.1);
    chamberGroup.add(prizeLight);
    cabinet.userData.prizeLight = prizeLight;

    // 수령구 전면 테두리 프레임 (파스텔 스카이블루 베젤)
    const frameMat = new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      roughness: 0.15,
      metalness: 0.2
    });
    const frameGeo = new THREE.BoxGeometry(2.3, 1.6, 0.15);
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.set(0, 0, 0.45);
    chamberGroup.add(frameMesh);

    // 수령구 상단 네온 사인 ("🎁 PRIZE OUT 🎁")
    const prizeCanvas = document.createElement('canvas');
    prizeCanvas.width = 256;
    prizeCanvas.height = 64;
    const pCtx = prizeCanvas.getContext('2d');
    pCtx.fillStyle = '#FFFFFF';
    pCtx.fillRect(0, 0, 256, 64);
    pCtx.lineWidth = 4;
    pCtx.strokeStyle = '#F472B6';
    pCtx.strokeRect(3, 3, 250, 58);
    pCtx.font = 'bold 24px "Jua", sans-serif';
    pCtx.fillStyle = '#DB2777';
    pCtx.textAlign = 'center';
    pCtx.textBaseline = 'middle';
    pCtx.fillText('🎁 PRIZE OUT 🎁', 128, 32);

    const prizeTex = new THREE.CanvasTexture(prizeCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 0.5),
      new THREE.MeshBasicMaterial({ map: prizeTex })
    );
    signMesh.position.set(0, 0.85, 0.54);
    chamberGroup.add(signMesh);

    // 반투명 푸시 아크릴 도어 (도어가 안쪽으로 살짝 기울어져 있음)
    const pushDoorMat = new THREE.MeshPhysicalMaterial({
      color: 0xBAE6FD,
      transparent: true,
      opacity: 0.4,
      roughness: 0.05,
      transmission: 0.85,
      reflectivity: 0.8
    });
    const pushDoor = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), pushDoorMat);
    pushDoor.position.set(0, -0.05, 0.4);
    pushDoor.rotation.x = 0.22;
    chamberGroup.add(pushDoor);

    cabinet.add(chamberGroup);

    // 3. 캐비닛 상단 헤더 루프 (크림 화이트 & 핑크 몰딩)
    const roofMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.2 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.2, 6.6), roofMat);
    roof.position.y = 5.2;
    cabinet.add(roof);

    const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(6.85, 0.2, 0.1), pinkTrimMat);
    roofTrim.position.set(0, 4.65, 3.32);
    cabinet.add(roofTrim);

    // 상단 네온 로고 간판 (화이트 바탕에 스카이블루/핑크 타이포)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 512, 128);
    // 핑크/하늘색 테두리
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#38BDF8';
    ctx.strokeRect(6, 6, 500, 116);
    // 텍스트
    ctx.font = 'bold 44px "Jua", sans-serif';
    ctx.fillStyle = '#0284C7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText('✨ FATE IN THE CLAW ✨', 256, 64);

    const signTex = new THREE.CanvasTexture(canvas);
    const signPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 0.95),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signPlane.position.set(0, 5.2, 3.32);
    cabinet.add(signPlane);

    // 4. 양쪽에 산뜻한 파스텔 스카이블루 기둥 (Pastel Sky Pillars)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: '#38BDF8',
      roughness: 0.15,
      metalness: 0.25
    });
    const goldRingMat = new THREE.MeshStandardMaterial({
      color: '#FBBF24',
      roughness: 0.2,
      metalness: 0.85
    });

    const pillarCoords = [
      { x: -3.1, z: 3.1, isFront: true },
      { x: 3.1, z: 3.1, isFront: true },
      { x: -3.1, z: -3.1, isFront: false },
      { x: 3.1, z: -3.1, isFront: false }
    ];

    pillarCoords.forEach(({ x, z, isFront }) => {
      const radius = isFront ? 0.32 : 0.22;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 5.2, 24),
        pillarMat
      );
      pillar.position.set(x, 2.3, z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      cabinet.add(pillar);

      // 전면 기둥 핑크 네온 러너 바
      if (isFront) {
        const neonStrip = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 5.0, 8),
          new THREE.MeshBasicMaterial({ color: '#F472B6' })
        );
        neonStrip.position.set(x * 0.94, 2.3, z + 0.26);
        cabinet.add(neonStrip);
      }

      // 기둥 상하단 골드 링 캡 장식
      [-2.5, 2.5].forEach(yOffset => {
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(radius + 0.05, radius + 0.05, 0.16, 24),
          goldRingMat
        );
        ring.position.set(x, 2.3 + yOffset, z);
        cabinet.add(ring);
      });
    });

    // 5. 쇼케이스 내부 투명 유리벽 (앞/좌/우 - 초고투명 크리스탈 클리어)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.06,
      roughness: 0.02,
      transmission: 0.98,
      reflectivity: 0.9
    });

    // 앞 유리
    const frontGlass = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 5.0), glassMat);
    frontGlass.position.set(0, 2.3, 3.05);
    // 좌/우 유리
    const leftGlass = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 5.0), glassMat);
    leftGlass.rotation.y = Math.PI / 2;
    leftGlass.position.set(-3.05, 2.3, 0);
    const rightGlass = leftGlass.clone();
    rightGlass.position.set(3.05, 2.3, 0);

    cabinet.add(frontGlass, leftGlass, rightGlass);

    // 6. 후면 반사 거울 벽면 (내부 공간감 & 눈부시게 화사한 펄 화이트 반사광)
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9, // 어두운 회색이 아닌 밝고 투명한 펄 화이트
      metalness: 0.4,
      roughness: 0.18
    });
    const backMirror = new THREE.Mesh(new THREE.PlaneGeometry(5.9, 5.0), mirrorMat);
    backMirror.position.set(0, 2.3, -3.05);
    cabinet.add(backMirror);

    // 7. 인형이 놓이는 쇼케이스 바닥 (화사하지만 조명에 날아가지 않고 구멍과 뚜렷이 대비되는 딥 민트/에메랄드 카펫 매트)
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#059669', // 조명 하에서 세련되고 선명한 에메랄드 민트 (흰색으로 탈색되지 않음)
      roughness: 0.85,  // 매트/펠트 질감으로 과도한 흰색 반사광 방지
      metalness: 0.05
    });

    // 배출구 구멍 좌표: X [-2.5, -1.0], Z [0.9, 2.4] (중심: x=-1.75, z=1.65, 구멍 크기: 1.5 x 1.5)
    // 1) 우측 대형 바닥 (x: -1.0 ~ 3.0, z: -3.0 ~ 3.0) -> 너비 4.0, 깊이 6.0
    const floorRight = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 6.0), floorMat);
    floorRight.rotation.x = -Math.PI / 2;
    floorRight.position.set(1.0, 0.02, 0);
    floorRight.receiveShadow = true;

    // 2) 후방 좌측 바닥 (x: -3.0 ~ -1.0, z: -3.0 ~ 0.9) -> 너비 2.0, 깊이 3.9
    const floorBackLeft = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.9), floorMat);
    floorBackLeft.rotation.x = -Math.PI / 2;
    floorBackLeft.position.set(-2.0, 0.02, -1.05);
    floorBackLeft.receiveShadow = true;

    // 3) 전방 좌측 바닥 (x: -3.0 ~ -1.0, z: 2.4 ~ 3.0) -> 너비 2.0, 깊이 0.6
    const floorFrontLeft = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.6), floorMat);
    floorFrontLeft.rotation.x = -Math.PI / 2;
    floorFrontLeft.position.set(-2.0, 0.02, 2.7);
    floorFrontLeft.receiveShadow = true;

    // 4) 최좌측 틈새 바닥 (x: -3.0 ~ -2.5, z: 0.9 ~ 2.4) -> 너비 0.5, 깊이 1.5
    const floorLeftMargin = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.5), floorMat);
    floorLeftMargin.rotation.x = -Math.PI / 2;
    floorLeftMargin.position.set(-2.75, 0.02, 1.65);
    floorLeftMargin.receiveShadow = true;

    cabinet.add(floorRight, floorBackLeft, floorFrontLeft, floorLeftMargin);

    // ==================== 8. 배출구(Chute) 실제 깊은 내부 통로 및 높은 보호 가드 턱 ====================
    // 구멍 중심: (-1.75, 1.65), 크기: 1.5 x 1.5
    // 실제 아케이드 기계처럼 구멍 안쪽은 깊은 어둠과 그림자가 느껴지는 다크 차콜 색상
    const chuteShaftMat = new THREE.MeshStandardMaterial({
      color: '#0B1120', // 깊은 어둠이 느껴지는 다크 네이비/차콜
      roughness: 0.7,
      metalness: 0.2
    });

    // 슈트 내부 4개 수직 벽면 (y = 0.02 ~ -1.6, 깊이 1.62)
    const shaftH = 1.62;
    const shaftMidY = -0.79;

    // 뒷벽 (z = 0.9)
    const shaftBack = new THREE.Mesh(new THREE.PlaneGeometry(1.5, shaftH), chuteShaftMat);
    shaftBack.position.set(-1.75, shaftMidY, 0.9);
    shaftBack.receiveShadow = true;

    // 앞벽 (z = 2.4)
    const shaftFront = new THREE.Mesh(new THREE.PlaneGeometry(1.5, shaftH), chuteShaftMat);
    shaftFront.rotation.y = Math.PI;
    shaftFront.position.set(-1.75, shaftMidY, 2.4);
    shaftFront.receiveShadow = true;

    // 우측벽 (x = -1.0)
    const shaftRight = new THREE.Mesh(new THREE.PlaneGeometry(1.5, shaftH), chuteShaftMat);
    shaftRight.rotation.y = -Math.PI / 2;
    shaftRight.position.set(-1.0, shaftMidY, 1.65);
    shaftRight.receiveShadow = true;

    // 좌측벽 (x = -2.5)
    const shaftLeft = new THREE.Mesh(new THREE.PlaneGeometry(1.5, shaftH), chuteShaftMat);
    shaftLeft.rotation.y = Math.PI / 2;
    shaftLeft.position.set(-2.5, shaftMidY, 1.65);
    shaftLeft.receiveShadow = true;

    cabinet.add(shaftBack, shaftFront, shaftRight, shaftLeft);

    // 슈트 하단 슬라이드 경사로 (미끄럼틀)
    const slideMat = new THREE.MeshStandardMaterial({
      color: '#1E293B', // 어두운 금속 슬라이드 (빛이 바깥으로 역반사되지 않음)
      roughness: 0.4,
      metalness: 0.5
    });
    const slideRamp = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 1.7), slideMat);
    slideRamp.rotation.x = -Math.PI / 3.4;
    slideRamp.position.set(-1.75, -1.2, 1.75);
    slideRamp.receiveShadow = true;
    cabinet.add(slideRamp);

    // 바닥 구멍 둘레 베이스 몰딩 (바닥과 구멍 입구의 경계를 깔끔하게 잡아줌)
    const holeBaseTrimMat = new THREE.MeshStandardMaterial({
      color: '#E2E8F0', // 선명한 메탈릭 실버 테두리
      roughness: 0.3,
      metalness: 0.7
    });
    const trimThick = 0.05;
    const trimH = 0.03;
    const trimY = 0.03;
    const trimN = new THREE.Mesh(new THREE.BoxGeometry(1.58, trimH, trimThick), holeBaseTrimMat);
    trimN.position.set(-1.75, trimY, 0.9);
    const trimS = new THREE.Mesh(new THREE.BoxGeometry(1.58, trimH, trimThick), holeBaseTrimMat);
    trimS.position.set(-1.75, trimY, 2.4);
    const trimE = new THREE.Mesh(new THREE.BoxGeometry(trimThick, trimH, 1.58), holeBaseTrimMat);
    trimE.position.set(-1.0, trimY, 1.65);
    const trimW = new THREE.Mesh(new THREE.BoxGeometry(trimThick, trimH, 1.58), holeBaseTrimMat);
    trimW.position.set(-2.5, trimY, 1.65);
    cabinet.add(trimN, trimS, trimE, trimW);

    // 슈트 구멍 둘레 높은 투명 아크릴 가드 턱
    const collarMat = new THREE.MeshPhysicalMaterial({
      color: 0xBAE6FD,
      transparent: true,
      opacity: 0.4,
      roughness: 0.03,
      transmission: 0.92,
      thickness: 0.2
    });
    const collarH = 0.65;
    const collarMidY = 0.02 + collarH / 2; // 0.345

    const collarBack = new THREE.Mesh(new THREE.PlaneGeometry(1.5, collarH), collarMat);
    collarBack.position.set(-1.75, collarMidY, 0.9);

    const collarFront = new THREE.Mesh(new THREE.PlaneGeometry(1.5, collarH), collarMat);
    collarFront.position.set(-1.75, collarMidY, 2.4);

    const collarRight = new THREE.Mesh(new THREE.PlaneGeometry(1.5, collarH), collarMat);
    collarRight.rotation.y = Math.PI / 2;
    collarRight.position.set(-1.0, collarMidY, 1.65);

    const collarLeft = new THREE.Mesh(new THREE.PlaneGeometry(1.5, collarH), collarMat);
    collarLeft.rotation.y = Math.PI / 2;
    collarLeft.position.set(-2.5, collarMidY, 1.65);

    cabinet.add(collarBack, collarFront, collarRight, collarLeft);

    // 높은 아크릴 가드 상단 네온 캔디 핑크 림
    const rimMat = new THREE.MeshBasicMaterial({ color: '#F472B6' });
    const rimThick = 0.04;
    const rimY = 0.02 + collarH; // 0.67

    const rimN = new THREE.Mesh(new THREE.BoxGeometry(1.54, rimThick, rimThick), rimMat);
    rimN.position.set(-1.75, rimY, 0.9);
    const rimS = new THREE.Mesh(new THREE.BoxGeometry(1.54, rimThick, rimThick), rimMat);
    rimS.position.set(-1.75, rimY, 2.4);
    const rimE = new THREE.Mesh(new THREE.BoxGeometry(rimThick, rimThick, 1.54), rimMat);
    rimE.position.set(-1.0, rimY, 1.65);
    const rimW = new THREE.Mesh(new THREE.BoxGeometry(rimThick, rimThick, 1.54), rimMat);
    rimW.position.set(-2.5, rimY, 1.65);

    cabinet.add(rimN, rimS, rimE, rimW);

    // 내부 통로 좌표 메타데이터 저장
    cabinet.userData.chutePos = { x: -1.75, y: 0.0, z: 1.65 };
    cabinet.userData.prizeHatchPos = { x: -1.75, y: -1.55, z: 3.25 };

    return cabinet;
  }

  // ==================== 오락실 관객 3D 캐릭터 (사람들이 돌아다니고 구경) ====================
  static createCrowdCharacter(options = {}) {
    const crowdGroup = new THREE.Group();
    const outfitColors = ['#F43F5E', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
    const outfitColor = options.color || outfitColors[Math.floor(Math.random() * outfitColors.length)];

    const skinMat = new THREE.MeshStandardMaterial({ color: '#FED7AA', roughness: 0.6 });
    const clothMat = new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.4 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: options.hairColor || '#292524', roughness: 0.8 });

    // 머리
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), skinMat);
    head.position.y = 2.0;
    head.castShadow = true;
    crowdGroup.add(head);

    // 헤어스타일/모자
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.41, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), hairMat);
    hair.position.y = 2.05;
    crowdGroup.add(hair);

    // 몸통 (후드티/셔츠)
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.9, 16), clothMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    crowdGroup.add(torso);

    // 다리
    [-0.15, 0.15].forEach(xOff => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 12), pantsMat);
      leg.position.set(xOff, 0.45, 0);
      leg.castShadow = true;
      crowdGroup.add(leg);
    });

    // 팔 2개 (환호 모션 등을 위해 그룹화)
    const armL = new THREE.Group();
    const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 12), clothMat);
    armMeshL.position.y = -0.3;
    armL.add(armMeshL);
    armL.position.set(-0.4, 1.65, 0);

    const armR = new THREE.Group();
    const armMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.7, 12), clothMat);
    armMeshR.position.y = -0.3;
    armR.add(armMeshR);
    armR.position.set(0.4, 1.65, 0);

    crowdGroup.add(armL, armR);

    // 스케일 조절
    crowdGroup.scale.set(0.9, 0.9, 0.9);

    crowdGroup.userData = {
      armL: armL,
      armR: armR,
      head: head,
      baseY: 0,
      walkSpeed: 0.015 + Math.random() * 0.01,
      targetX: 0,
      targetZ: 0,
      state: 'watch' // 'watch', 'walk', 'cheer'
    };

    return crowdGroup;
  }
}
