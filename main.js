import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ═══════════════════════════════════════════════════════════
// 1.  DỮ LIỆU VÙNG TÀU
// ═══════════════════════════════════════════════════════════
const ZONES = {
  day_tau: {
    name: "Đáy Tàu",
    color: "#2196a8",
    type: "exterior",
    pinCast: { from: "below", relY: 0.01, relXFrac: 0.5, relZFrac: 0.5 },
    viewRelY: 0.02,
    viewDist: 18,
    viewAzimuth: Math.PI * 0.45,
    viewPolar: 2.1,
    description:
      "Phần luôn ngập trong nước của tàu, chịu sự tấn công của rất nhiều tác nhân ăn mòn trong những điều kiện khắc nghiệt. Hệ thống sơn bảo vệ bao gồm lớp chống ăn mòn và lớp chống bám bẩu của sinh vật biển.",
    paints: [
      {
        name: "Sơn Epoxy chuyên dụng",
        desc: "Chống thấm và bảo vệ tối ưu vùng luôn ngập nước",
      },
      {
        name: "Sơn Coal tar Epoxy",
        desc: "Chống thấm, chịu hóa chất, bền trong môi trường biển",
      },
      { name: "Sơn Chống hà", desc: "Ngăn cản sinh vật biển bám vào vỏ tàu" },
    ],
  },
  man_uot: {
    name: "Mạn Ướt",
    color: "#1a5fa8",
    type: "exterior",
    pinCast: { from: "side_right", relY: 0.2, relXFrac: 1.0, relZFrac: 0.4 },
    viewRelY: 0.2,
    viewDist: 24,
    viewAzimuth: Math.PI * 0.75,
    viewPolar: 1.45,
    description:
      "Phần vỏ tàu thường xuyên ngập trong môi trường nước khi tàu có tải. Các vị trí này cần được bảo vệ bởi hệ thống các lớp sơn chuyên dụng chống ăn mòn chất lượng cao.",
    paints: [
      {
        name: "Sơn Epoxy chuyên dụng",
        desc: "Tạo lớp bảo vệ bền vững trong môi trường nước mặn",
      },
      {
        name: "Sơn Coal tar Epoxy",
        desc: "Kháng nước và hóa chất cực tốt, tuổi thọ cao",
      },
    ],
  },
  man_kho: {
    name: "Mạn Khô",
    color: "#b83232",
    type: "exterior",
    pinCast: { from: "side_right", relY: 0.4, relXFrac: 1.0, relZFrac: 0.38 },
    viewRelY: 0.4,
    viewDist: 24,
    viewAzimuth: Math.PI * 0.75,
    viewPolar: 1.4,
    description:
      "Vị trí thuộc vỏ tàu ít tiếp xúc với nước, tiếp xúc thường xuyên hơn với ánh nắng. Lựa chọn hệ sơn cần giữ màu tốt và chống ăn mòn hiệu quả.",
    paints: [
      {
        name: "Sơn Epoxy chuyên dụng",
        desc: "Chống ăn mòn hiệu quả, nền tốt cho lớp phủ ngoài",
      },
      {
        name: "Sơn Polyurethane",
        desc: "Giữ màu lâu, bóng đẹp, chịu tia UV tốt",
      },
    ],
  },
  mat_boong: {
    name: "Mặt Boong & Lối Đi",
    color: "#2e7d32",
    type: "exterior",
    pinCast: { from: "above", relY: 0.62, relXFrac: 0.5, relZFrac: 0.3 },
    viewRelY: 0.6,
    viewDist: 28,
    viewAzimuth: Math.PI * 0.25,
    viewPolar: 0.52,
    description:
      "Các vị trí đi lại, di chuyển, không ngập nước, tiếp xúc thường xuyên với ánh nắng, mưa bão. Sơn cần độ bám tốt, chống trơn trượt và chịu tải trọng cơ học.",
    paints: [
      {
        name: "Sơn Epoxy",
        desc: "Độ cứng cao, chịu mài mòn và tải trọng cơ học",
      },
      {
        name: "Sơn Polyurethane",
        desc: "Đàn hồi, chịu va đập và thay đổi nhiệt độ",
      },
      {
        name: "Sơn PU 1K",
        desc: "Dễ thi công, khô nhanh, thích hợp bảo trì định kỳ",
      },
    ],
  },
  ham_hang: {
    name: "Hầm Hàng",
    color: "#6a1fa2",
    type: "interior",
    diagramZone: { x: 0.12, y: 0.25, w: 0.76, h: 0.52 },
    viewRelY: 0.6,
    viewDist: 32,
    viewAzimuth: Math.PI * 0.25,
    viewPolar: 0.45,
    description:
      "Khu vực chứa hàng bên trong thân tàu. Các giải pháp chống ăn mòn dựa trên điều kiện và tính chất của hàng hóa mà tàu vận chuyển. Cần lựa chọn hệ sơn phù hợp với loại hàng hóa cụ thể.",
    paints: [
      {
        name: "Sơn Epoxy chuyên dụng",
        desc: "Chống ăn mòn tốt, an toàn với nhiều loại hàng hóa",
      },
      { name: "Sơn Alkyd", desc: "Phù hợp hầm hàng khô, chi phí hợp lý" },
      {
        name: "Sơn Polyurethane",
        desc: "Bền, chống hóa chất cho hàng hóa đặc biệt",
      },
      {
        name: "Sơn Cao su clo hóa",
        desc: "Kháng hóa chất mạnh, phù hợp hàng hóa ăn mòn",
      },
    ],
  },
  he_thong_khung: {
    name: "Hệ Thống Khung Xương",
    color: "#c45a00",
    type: "interior",
    diagramZone: { x: 0.04, y: 0.08, w: 0.92, h: 0.88 },
    viewRelY: 0.4,
    viewDist: 28,
    viewAzimuth: Math.PI * 0.22,
    viewPolar: 1.1,
    description:
      "Khu vực chịu lực cho tàu, phân bố đều trong thân tàu theo chiều ngang và dọc. Không tiếp xúc trực tiếp với nước nhưng dễ phát sinh hơi ẩm do ngưng tụ.",
    paints: [
      {
        name: "Sơn Epoxy chuyên dụng",
        desc: "Bảo vệ kết cấu thép khỏi ăn mòn trong môi trường ẩm",
      },
      {
        name: "Sơn Coaltar Epoxy",
        desc: "Chống ẩm, chống thấm tuyệt vời cho kết cấu nội thất",
      },
      { name: "Sơn Alkyd", desc: "Lớp phủ hoàn thiện bảo vệ và thẩm mỹ" },
    ],
  },
  thuong_tang: {
    name: "Thượng Tầng & Cabin",
    color: "#546e7a",
    type: "exterior",
    pinCast: { from: "scan_cabin", relY: 0.78, relXFrac: 1.0, relZFrac: 0.5 },
    viewRelY: 0.8,
    viewDist: 16,
    viewAzimuth: Math.PI * 0.22,
    viewPolar: 0.95,
    description:
      "Khu vực thượng tầng tàu, bao gồm cabin và các công trình trên boong. Tiếp xúc nhiều với thời tiết, ánh nắng và mưa bão. Yêu cầu thẩm mỹ cao bên cạnh khả năng bảo vệ.",
    paints: [
      {
        name: "Sơn Epoxy chuyên dụng",
        desc: "Lớp lót chống ăn mòn, nền bền vững cho lớp phủ ngoài",
      },
      {
        name: "Sơn Polyurethane",
        desc: "Màu sắc đẹp, giữ màu lâu, chịu thời tiết khắc nghiệt",
      },
      {
        name: "Sơn PU 1K",
        desc: "Hoàn thiện nhanh, bóng đẹp cho khu vực cabin",
      },
    ],
  },
};

const LEGEND_ORDER = [
  "day_tau",
  "man_uot",
  "man_kho",
  "mat_boong",
  "ham_hang",
  "he_thong_khung",
  "thuong_tang",
];

// ═══════════════════════════════════════════════════════════
// 2.  NHẬN DIỆN VÙNG
// ═══════════════════════════════════════════════════════════
const NAME_RULES = [
  [
    [
      "bottom",
      "keel",
      "bilge",
      "day_tau",
      "hull_bot",
      "base_hull",
      "rudder",
      "propeller",
      "skeg",
      "draught",
    ],
    "day_tau",
  ],
  [
    ["wet", "waterline", "man_uot", "boot_top", "antifoul", "blister", "boot"],
    "man_uot",
  ],
  [
    [
      "freeboard",
      "man_kho",
      "dryside",
      "topside",
      "sheer",
      "hull_side",
      "belt",
      "topsides",
    ],
    "man_kho",
  ],
  [
    [
      "main_deck",
      "upperdeck",
      "weather_deck",
      "boong",
      "walkway",
      "catwalk",
      "grating",
      "platform",
      "walkplate",
      "gangway",
      "corridor",
    ],
    "mat_boong",
  ],
  [
    [
      "container",
      "box_",
      "cargo",
      "hold",
      "hatch",
      "coaming",
      "teu",
      "crate",
      "bay",
      "slot",
      "cell",
      "stow",
      "hatch_cover",
    ],
    "ham_hang",
  ],
  [
    [
      "frame",
      "rib_",
      "stringer",
      "girder",
      "beam",
      "bracket",
      "bulkhead",
      "web_",
      "floor_plate",
      "longit",
      "transv",
      "truss",
      "structural",
      "intercostal",
      "inner_bottom",
      "double_bottom",
      "web_frame",
      "solid_floor",
      "center_girder",
      "side_girder",
    ],
    "he_thong_khung",
  ],
  [
    [
      "cabin",
      "superstructure",
      "bridge",
      "wheelhouse",
      "pilot",
      "mast",
      "funnel",
      "chimney",
      "stack",
      "crane",
      "davit",
      "antenna",
      "radar",
      "lifeboat",
      "accomm",
      "navigation",
      "forecastle",
      "poop",
      "windlass",
      "winch",
      "bollard",
      "accommodation",
    ],
    "thuong_tang",
  ],
];

function zoneByName(n) {
  if (!n) return null;
  const l = n.toLowerCase();
  for (const [kws, k] of NAME_RULES)
    if (kws.some((w) => l.includes(w))) return ZONES[k];
  return null;
}

const _nm = new THREE.Matrix3(),
  _wn = new THREE.Vector3();

function zoneByPhysics(wn, relY, relX) {
  const ny = wn.y,
    nx = Math.abs(wn.x),
    nz = Math.abs(wn.z);
  if (ny > 0.55) {
    if (relY < 0.12) return ZONES.day_tau;
    if (relY > 0.55 && relX < 0.6) return ZONES.ham_hang;
    return ZONES.mat_boong;
  }
  if (ny < -0.5) {
    if (relY < 0.14) return ZONES.day_tau;
    return ZONES.he_thong_khung;
  }
  if (ny > 0.3 && relY > 0.5) return ZONES.mat_boong;
  if (relY > 0.56 && relX < 0.65 && (nx > 0.25 || nz > 0.25))
    return ZONES.ham_hang;
  if (relY > 0.76) return ZONES.thuong_tang;
  if (relY < 0.13) return ZONES.day_tau;
  if (relY < 0.3) return ZONES.man_uot;
  if (relY < 0.58) return ZONES.man_kho;
  if (relY < 0.76) return ZONES.mat_boong;
  return ZONES.thuong_tang;
}

const _voteRC = new THREE.Raycaster();

function detectZone(mesh, point, face, bbox) {
  const byName = zoneByName(mesh.name);
  if (byName) return byName;
  if (!bbox || !face) return ZONES.man_kho;
  const sz = bbox.getSize(new THREE.Vector3());
  const relY = Math.max(0, Math.min(1, (point.y - bbox.min.y) / sz.y));
  const relX =
    Math.abs(point.x - (bbox.min.x + sz.x * 0.5)) / (sz.x * 0.5 + 0.001);
  _nm.getNormalMatrix(mesh.matrixWorld);
  _wn.copy(face.normal).applyMatrix3(_nm).normalize();
  const primary = zoneByPhysics(_wn, relY, relX);
  const OFFSET = 0.18;
  const neighbors = [
    new THREE.Vector3(OFFSET, 0, 0),
    new THREE.Vector3(-OFFSET, 0, 0),
    new THREE.Vector3(0, OFFSET, 0),
    new THREE.Vector3(0, -OFFSET, 0),
  ];
  let votes = {};
  const addVote = (z) => {
    const k = Object.keys(ZONES).find((k) => ZONES[k] === z) || "man_kho";
    votes[k] = (votes[k] || 0) + 1;
  };
  addVote(primary);
  addVote(primary);
  for (const off of neighbors) {
    const samplePt = point.clone().add(off);
    const relYs = Math.max(0, Math.min(1, (samplePt.y - bbox.min.y) / sz.y));
    const relXs =
      Math.abs(samplePt.x - (bbox.min.x + sz.x * 0.5)) / (sz.x * 0.5 + 0.001);
    addVote(zoneByPhysics(_wn, relYs, relXs));
  }
  let winner = "man_kho",
    maxV = 0;
  for (const [k, v] of Object.entries(votes)) {
    if (v > maxV) {
      maxV = v;
      winner = k;
    }
  }
  return ZONES[winner] || primary;
}

// ═══════════════════════════════════════════════════════════
// 3.  SCENE / CAMERA / RENDERER
// ═══════════════════════════════════════════════════════════
const HEADER_H = 50,
  BRAND_H = 44;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdde3ea);
// Subtle fog for depth
scene.fog = new THREE.Fog(0xdde3ea, 80, 200);

const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  600,
);
camera.position.set(28, 14, 34);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

// Offset canvas for header
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 3;
controls.maxDistance = 110;
controls.maxPolarAngle = Math.PI * 0.54;

// ═══════════════════════════════════════════════════════════
// 4.  ÁNH SÁNG
// ═══════════════════════════════════════════════════════════
scene.add(new THREE.AmbientLight(0xffffff, 1.2));
const sun = new THREE.DirectionalLight(0xfff8f0, 2.0);
sun.position.set(35, 55, 25);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -45,
  right: 45,
  top: 45,
  bottom: -45,
  far: 160,
});
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc8d8e8, 0.6);
fill.position.set(-20, 10, -15);
scene.add(fill);
scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x8899aa, 0.5));

// ═══════════════════════════════════════════════════════════
// 5.  PIN 3D — Precision Targeting Reticle
//     + Pulse wave rings lan toả từ gốc
//     + Bob lên xuống có easing bounce
// ═══════════════════════════════════════════════════════════
let pinGroup = null;
let pinElapsed = 0;
const _castRC = new THREE.Raycaster();
const PULSE_COUNT = 3; // số vòng sóng đồng tâm
const PULSE_PERIOD = 1.8; // giây / chu kỳ 1 vòng sóng
const PULSE_MAX_R = 1.4; // bán kính tối đa (× s)
const BOB_AMP = 0.22; // biên độ lên xuống (units)
const BOB_FREQ = 1.9; // tần số (rad/s)

function buildPin(color, s = 1.0) {
  const grp = new THREE.Group();
  const col = new THREE.Color(color);

  const matBody = new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.15,
    metalness: 0.68,
    emissive: col,
    emissiveIntensity: 0.12,
  });
  const matHead = new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.06,
    metalness: 0.52,
    emissive: col,
    emissiveIntensity: 0.58,
  });
  const matOrbit = new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.08,
    metalness: 0.82,
    emissive: col,
    emissiveIntensity: 0.28,
  });

  // ── 1. NEEDLE ─────────────────────────────────────────────
  const needle = new THREE.Mesh(
    new THREE.ConeGeometry(0.032 * s, 0.42 * s, 14),
    matBody,
  );
  needle.rotation.z = Math.PI;
  needle.position.y = 0.21 * s;
  grp.add(needle);

  // ── 2. ROD ────────────────────────────────────────────────
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024 * s, 0.038 * s, 1.2 * s, 12),
    matBody,
  );
  rod.position.y = (0.42 + 0.6) * s;
  grp.add(rod);

  // ── 3. COLLAR ─────────────────────────────────────────────
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * s, 0.024 * s, 0.14 * s, 20),
    matBody,
  );
  collar.position.y = 1.29 * s;
  grp.add(collar);

  // ── 4. HEAD DISC ──────────────────────────────────────────
  const HEAD_Y = 1.42 * s;
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2 * s, 0.08 * s, 0.048 * s, 32),
    matHead,
  );
  disc.position.y = HEAD_Y;
  grp.add(disc);

  const discRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.2 * s, 0.01 * s, 8, 48),
    matOrbit,
  );
  discRim.position.y = HEAD_Y - 0.024 * s;
  discRim.rotation.x = Math.PI / 2;
  grp.add(discRim);

  // ── 5. CENTER JEWEL ───────────────────────────────────────
  const jewel = new THREE.Mesh(
    new THREE.SphereGeometry(0.055 * s, 16, 16),
    matHead,
  );
  jewel.position.y = HEAD_Y + 0.048 * s;
  grp.add(jewel);

  // ── 6. CROSSHAIR ARMS ─────────────────────────────────────
  const armMat = new THREE.MeshStandardMaterial({
    color: col,
    roughness: 0.18,
    metalness: 0.72,
    emissive: col,
    emissiveIntensity: 0.2,
  });
  const ARM_LEN = 0.48 * s;
  [0, Math.PI / 2].forEach((ry) => {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(ARM_LEN, 0.012 * s, 0.016 * s),
      armMat,
    );
    arm.position.y = HEAD_Y + 0.032 * s;
    arm.rotation.y = ry;
    grp.add(arm);
    [1, -1].forEach((side) => {
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(0.012 * s, 0.028 * s, 0.016 * s),
        armMat,
      );
      tick.position.y = HEAD_Y + 0.032 * s;
      const offset = side * (ARM_LEN / 2 - 0.005 * s);
      tick.position.x += Math.cos(ry) * offset;
      tick.position.z += Math.sin(ry) * offset;
      grp.add(tick);
    });
  });

  // ── 7. ORBIT RING A ───────────────────────────────────────
  const orbitA = new THREE.Group();
  orbitA.position.y = HEAD_Y;
  orbitA.rotation.z = THREE.MathUtils.degToRad(38);
  orbitA.userData.spinY = 0.48;
  orbitA.add(
    new THREE.Mesh(
      new THREE.TorusGeometry(0.36 * s, 0.011 * s, 8, 60),
      matOrbit,
    ),
  );
  grp.add(orbitA);

  // ── 8. ORBIT RING B ───────────────────────────────────────
  const orbitB = new THREE.Group();
  orbitB.position.y = HEAD_Y;
  orbitB.rotation.z = THREE.MathUtils.degToRad(128);
  orbitB.userData.spinY = -0.32;
  orbitB.add(
    new THREE.Mesh(
      new THREE.TorusGeometry(0.36 * s, 0.009 * s, 8, 60),
      matOrbit,
    ),
  );
  grp.add(orbitB);

  // ── 9. PULSE WAVE RINGS — 3 vòng sóng lan toả từ gốc ─────
  //    Mỗi vòng là RingGeometry nằm ngang (y≈0), clone material riêng
  //    để opacity có thể animate độc lập.
  //    phase offset = i / PULSE_COUNT × PULSE_PERIOD → stagger đều
  const pulseRings = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    const pMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    // Dùng RingGeometry placeholder r=1 → scale trong loop
    const pMesh = new THREE.Mesh(new THREE.RingGeometry(0.88, 1.0, 48), pMat);
    pMesh.rotation.x = -Math.PI / 2;
    pMesh.position.y = 0.015 * s;
    pMesh.userData.phase = (i / PULSE_COUNT) * PULSE_PERIOD;
    pMesh.userData.pScale = s;
    grp.add(pMesh);
    pulseRings.push(pMesh);
  }

  // ── 10. POINT LIGHT ───────────────────────────────────────
  const glow = new THREE.PointLight(col, 1.1, 3.5 * s, 1.7);
  glow.position.y = HEAD_Y;
  grp.add(glow);

  // Lưu refs
  grp.userData.orbitA = orbitA;
  grp.userData.orbitB = orbitB;
  grp.userData.pulseRings = pulseRings;
  grp.userData.headY = HEAD_Y;
  grp.userData.glowLight = glow;

  return grp;
}

function castToSurface(cfg, bbox, meshList) {
  const sz = bbox.getSize(new THREE.Vector3());
  const min = bbox.min,
    max = bbox.max;
  const cx = (min.x + max.x) * 0.5;
  const MARGIN = 5;

  if (cfg.from === "scan_cabin") {
    const cabinRelY = 0.78;
    const ty = min.y + sz.y * cabinRelY;
    const STEPS = 12;
    const hits12 = [];
    for (let i = 0; i < STEPS; i++) {
      const frac = 0.05 + (i / (STEPS - 1)) * 0.9;
      const tz = min.z + sz.z * frac;
      const org = new THREE.Vector3(max.x + MARGIN, ty, tz);
      const dir = new THREE.Vector3(-1, 0, 0);
      _castRC.set(org, dir.normalize());
      _castRC.far = sz.x + MARGIN * 2;
      const h = _castRC.intersectObjects(meshList, false);
      hits12.push(h.length > 0 ? { frac, point: h[0].point.clone() } : null);
    }
    let bestGroup = [],
      curGroup = [];
    for (const h of hits12) {
      if (h) {
        curGroup.push(h);
        if (curGroup.length > bestGroup.length) bestGroup = [...curGroup];
      } else curGroup = [];
    }
    if (bestGroup.length) {
      const mid = bestGroup[Math.floor(bestGroup.length / 2)];
      ZONES.thuong_tang._resolvedZFrac = mid.frac;
      return { point: mid.point.clone(), normal: new THREE.Vector3(1, 0, 0) };
    }
    ZONES.thuong_tang._resolvedZFrac = 0.5;
    return {
      point: new THREE.Vector3(cx, min.y + sz.y * 0.78, min.z + sz.z * 0.5),
      normal: new THREE.Vector3(1, 0, 0),
    };
  }

  const tx = min.x + sz.x * cfg.relXFrac;
  const ty = min.y + sz.y * cfg.relY;
  const tz = min.z + sz.z * cfg.relZFrac;
  let origin, dir;
  switch (cfg.from) {
    case "above":
      origin = new THREE.Vector3(tx, max.y + MARGIN, tz);
      dir = new THREE.Vector3(0, -1, 0);
      break;
    case "below":
      origin = new THREE.Vector3(tx, min.y - MARGIN, tz);
      dir = new THREE.Vector3(0, 1, 0);
      break;
    case "side_right":
      origin = new THREE.Vector3(max.x + MARGIN, ty, tz);
      dir = new THREE.Vector3(-1, 0, 0);
      break;
    case "side_left":
      origin = new THREE.Vector3(min.x - MARGIN, ty, tz);
      dir = new THREE.Vector3(1, 0, 0);
      break;
    case "front":
      origin = new THREE.Vector3(tx, ty, min.z - MARGIN);
      dir = new THREE.Vector3(0, 0, 1);
      break;
    case "back":
      origin = new THREE.Vector3(tx, ty, max.z + MARGIN);
      dir = new THREE.Vector3(0, 0, -1);
      break;
    default:
      origin = new THREE.Vector3(cx, max.y + MARGIN, min.z + sz.z * 0.5);
      dir = new THREE.Vector3(0, -1, 0);
  }
  _castRC.set(origin, dir.normalize());
  _castRC.far = sz.y * 3 + MARGIN * 2;
  const hits = _castRC.intersectObjects(meshList, false);
  if (hits.length) {
    const best =
      cfg.from === "below" || cfg.from === "above"
        ? hits[0]
        : hits.reduce(
            (b, h) =>
              Math.abs(h.point.y - ty) < Math.abs(b.point.y - ty) ? h : b,
            hits[0],
          );
    return {
      point: best.point.clone(),
      normal: best.face
        ? best.face.normal
            .clone()
            .applyMatrix3(_nm.getNormalMatrix(best.object.matrixWorld))
            .normalize()
        : dir.clone().negate(),
    };
  }
  return { point: new THREE.Vector3(tx, ty, tz), normal: dir.clone().negate() };
}

function placePin(key, meshList) {
  if (pinGroup) {
    scene.remove(pinGroup);
    pinGroup = null;
  }
  const z = ZONES[key];
  if (z.type !== "exterior" || !shipBBox || !z.pinCast) return;
  const s = key === "day_tau" ? 3.5 : 1.0;
  const result = castToSurface(z.pinCast, shipBBox, meshList);
  pinGroup = buildPin(z.color, s);
  pinGroup.position.copy(result.point);
  pinGroup.userData.baseY = result.point.y; // lưu cho bob animation
  pinElapsed = 0;
  if (key === "day_tau") {
    pinGroup.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    pinGroup.position.y -= 0.24 * s;
  } else if (key === "thuong_tang") {
    const up = new THREE.Vector3(0, 1, 0);
    const wallNorm = result.normal.clone().normalize();
    if (Math.abs(wallNorm.dot(up)) < 0.95) {
      pinGroup.quaternion.copy(
        new THREE.Quaternion().setFromUnitVectors(up, wallNorm),
      );
    }
  } else {
    const up = new THREE.Vector3(0, 1, 0);
    const dot = result.normal.dot(up);
    if (Math.abs(dot) < 0.95) {
      const q = new THREE.Quaternion().setFromUnitVectors(up, result.normal);
      pinGroup.quaternion.copy(q);
    }
  }
  scene.add(pinGroup);
}

function removePin() {
  if (pinGroup) {
    scene.remove(pinGroup);
    // Dọn dẹp geometry & material để tránh memory leak
    pinGroup.traverse((c) => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
        else c.material.dispose();
      }
    });
    pinGroup = null;
  }
}

// ═══════════════════════════════════════════════════════════
// 6.  TOOLTIP (ẩn)
// ═══════════════════════════════════════════════════════════
document.getElementById("tooltip").style.display = "none";

// ═══════════════════════════════════════════════════════════
// 7.  INFO PANEL — thiết kế lại chuyên nghiệp
// ═══════════════════════════════════════════════════════════
const infoPanel = document.createElement("div");
Object.assign(infoPanel.style, {
  position: "fixed",
  top: HEADER_H + 12 + "px",
  right: "16px",
  width: "320px",
  maxHeight: `calc(100vh - ${HEADER_H + BRAND_H + 24}px)`,
  overflowY: "auto",
  background: "#ffffff",
  border: "1px solid rgba(12,30,53,0.10)",
  borderTop: "3px solid #0c1e35",
  borderRadius: "0 0 8px 8px",
  boxShadow: "0 8px 32px rgba(12,30,53,0.16)",
  zIndex: "999",
  transform: "translateX(360px)",
  transition: "transform .32s cubic-bezier(.4,0,.2,1)",
  color: "#1a2b3c",
  fontSize: "13px",
  lineHeight: "1.65",
  fontFamily: "'DM Sans', sans-serif",
});
document.body.appendChild(infoPanel);
let activeZoneKey = null;

const DIAGRAM_IMAGES = {
  ham_hang: "./images/ham-hang.png",
  he_thong_khung: "./images/khung-xuong-tau.png",
};

function hexRgb(h) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
}

function openInfoPanel(key) {
  const z = ZONES[key];
  activeZoneKey = key;

  // Highlight legend row
  LEGEND_ORDER.forEach((k) => {
    const row = legendRows[k];
    row.style.background =
      k === key ? `rgba(${hexRgb(ZONES[k].color)},0.10)` : "transparent";
    row.style.borderLeft =
      k === key ? `3px solid ${ZONES[k].color}` : "3px solid transparent";
    row.querySelector(".legend-name").style.fontWeight =
      k === key ? "600" : "400";
  });

  const typeLabel =
    z.type === "interior" ? "Khu vực bên trong" : "Khu vực bề mặt ngoài";
  const typeDot = z.type === "interior" ? "▪" : "◆";

  const diagramHTML =
    z.type === "interior"
      ? `<div style="padding:14px 18px 4px;border-bottom:1px solid #eee">
        <div style="font-size:10px;font-weight:600;letter-spacing:1.2px;color:#8599aa;text-transform:uppercase;margin-bottom:8px">Hình ảnh minh họa</div>
        <div style="border-radius:6px;overflow:hidden;border:1px solid #e8ecf0">
          <img src="${DIAGRAM_IMAGES[key]}" alt="${z.name}" style="width:100%;display:block;object-fit:cover;max-height:180px" />
        </div>
       </div>`
      : "";

  infoPanel.innerHTML = `
    <div style="padding:16px 18px 14px;border-bottom:1px solid #eef0f3;position:relative">
      <button id="closePanel" style="position:absolute;top:14px;right:14px;
        background:none;border:1px solid #d4d8df;color:#8599aa;
        width:24px;height:24px;border-radius:4px;cursor:pointer;
        font-size:12px;line-height:22px;text-align:center;
        transition:all .15s;font-family:inherit"
        onmouseover="this.style.background='#f0f2f5';this.style.color='#0c1e35'"
        onmouseout="this.style.background='none';this.style.color='#8599aa'">✕</button>

      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="width:12px;height:12px;background:${z.color};border-radius:2px;display:inline-block;flex-shrink:0"></span>
        <span style="font-size:10px;font-weight:600;letter-spacing:1px;color:#8599aa;text-transform:uppercase">${typeDot} ${typeLabel}</span>
      </div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:#0c1e35;line-height:1.2">${z.name}</div>
    </div>

    ${diagramHTML}

    <div style="padding:14px 18px;color:#4a6070;font-size:12.5px;line-height:1.8;border-bottom:1px solid #eef0f3">
      ${z.description}
    </div>

    <div style="padding:14px 18px 18px">
      <div style="font-size:10px;font-weight:600;letter-spacing:1.2px;color:#8599aa;text-transform:uppercase;margin-bottom:12px">Dòng sơn đề nghị</div>
      ${z.paints
        .map(
          (p, i) => `
        <div style="display:flex;gap:12px;margin-bottom:8px;padding:10px 12px;
          background:#f7f9fb;border-radius:6px;border-left:3px solid ${z.color}">
          <div style="flex-shrink:0;width:20px;height:20px;background:${z.color};
            border-radius:3px;display:flex;align-items:center;justify-content:center;
            font-size:10px;font-weight:700;color:#fff;margin-top:2px">${i + 1}</div>
          <div>
            <div style="font-weight:600;color:#0c1e35;font-size:13px;margin-bottom:3px">${p.name}</div>
            <div style="color:#8599aa;font-size:11.5px">${p.desc}</div>
          </div>
        </div>`,
        )
        .join("")}
    </div>`;

  document
    .getElementById("closePanel")
    .addEventListener("click", closeInfoPanel);
  infoPanel.style.transform = "translateX(0)";
}

function closeInfoPanel() {
  infoPanel.style.transform = "translateX(360px)";
  activeZoneKey = null;
  removePin();
  controls.maxPolarAngle = Math.PI * 0.54;
  LEGEND_ORDER.forEach((k) => {
    legendRows[k].style.background = "transparent";
    legendRows[k].style.borderLeft = "3px solid transparent";
    legendRows[k].querySelector(".legend-name").style.fontWeight = "400";
  });
}

// ═══════════════════════════════════════════════════════════
// 8.  LEGEND — thiết kế lại
// ═══════════════════════════════════════════════════════════
const legend = document.createElement("div");
Object.assign(legend.style, {
  position: "fixed",
  top: HEADER_H + 12 + "px",
  left: "16px",
  background: "#ffffff",
  color: "#1a2b3c",
  borderRadius: "0 0 8px 8px",
  border: "1px solid rgba(12,30,53,0.10)",
  borderTop: "3px solid #0c1e35",
  boxShadow: "0 8px 32px rgba(12,30,53,0.12)",
  zIndex: "999",
  userSelect: "none",
  minWidth: "220px",
  overflow: "hidden",
  fontFamily: "'DM Sans', sans-serif",
});

// Legend header
const legendHeader = document.createElement("div");
Object.assign(legendHeader.style, {
  padding: "12px 16px 10px",
  borderBottom: "1px solid #eef0f3",
  background: "#fafbfc",
});
legendHeader.innerHTML = `
  <div style="font-size:10px;font-weight:600;letter-spacing:1.4px;color:#8599aa;text-transform:uppercase;margin-bottom:2px">Bản đồ vùng</div>
  <div style="font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;color:#0c1e35">Vị Trí Tàu Biển</div>`;
legend.appendChild(legendHeader);

// Legend body
const legendBody = document.createElement("div");
Object.assign(legendBody.style, { padding: "8px 0" });

const legendRows = {};
LEGEND_ORDER.forEach((key) => {
  const z = ZONES[key];
  const row = document.createElement("div");
  Object.assign(row.style, {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background .12s",
    borderLeft: "3px solid transparent",
  });

  const typeIndicator =
    z.type === "interior"
      ? `<span style="font-size:9px;font-weight:600;letter-spacing:.6px;color:#8599aa;
        background:#f0f2f5;padding:1px 5px;border-radius:3px;margin-left:auto;white-space:nowrap;flex-shrink:0">Nội thất</span>`
      : `<span style="font-size:9px;font-weight:600;letter-spacing:.6px;color:#8599aa;
        background:#f0f2f5;padding:1px 5px;border-radius:3px;margin-left:auto;white-space:nowrap;flex-shrink:0">Ngoại thất</span>`;

  row.innerHTML = `
    <span style="flex-shrink:0;width:10px;height:10px;background:${z.color};border-radius:2px"></span>
    <span class="legend-name" style="font-size:12.5px;flex:1;color:#1a2b3c;font-weight:400">${z.name}</span>
    ${typeIndicator}`;

  row.addEventListener("mouseenter", () => {
    if (activeZoneKey !== key) row.style.background = "#f7f9fb";
  });
  row.addEventListener("mouseleave", () => {
    if (activeZoneKey !== key) row.style.background = "transparent";
  });
  row.addEventListener("click", () => {
    if (activeZoneKey === key) {
      closeInfoPanel();
      removePin();
      return;
    }
    if (z.type === "exterior") placePin(key, meshes);
    else removePin();
    flyToZone(key);
    openInfoPanel(key);
  });
  legendBody.appendChild(row);
  legendRows[key] = row;
});

legend.appendChild(legendBody);
document.body.appendChild(legend);

// ═══════════════════════════════════════════════════════════
// 9.  HINT BAR — thiết kế lại
// ═══════════════════════════════════════════════════════════
const hint = document.createElement("div");
Object.assign(hint.style, {
  position: "fixed",
  bottom: BRAND_H + 10 + "px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(12,30,53,0.82)",
  color: "rgba(255,255,255,0.65)",
  padding: "7px 20px",
  borderRadius: "20px",
  fontSize: "11.5px",
  zIndex: "999",
  whiteSpace: "nowrap",
  letterSpacing: "0.3px",
  fontFamily: "'DM Sans', sans-serif",
  backdropFilter: "blur(8px)",
});
hint.textContent = "Đang tải mô hình...";
document.body.appendChild(hint);

// ═══════════════════════════════════════════════════════════
// 10. CAMERA FLY-TO
// ═══════════════════════════════════════════════════════════
let flyTarget = null,
  flyT = 1;
const FLY_SPEED = 0.032;
const _sp = new THREE.Vector3(),
  _sl = new THREE.Vector3(),
  _tl = new THREE.Vector3();

function flyToZone(key) {
  if (!shipBBox) return;
  const z = ZONES[key];
  const sz = shipBBox.getSize(new THREE.Vector3());
  const cen = shipBBox.getCenter(new THREE.Vector3());
  const ty = shipBBox.min.y + sz.y * z.viewRelY;
  let lookZ = cen.z,
    az = z.viewAzimuth;
  if (key === "thuong_tang") {
    const frac = ZONES.thuong_tang._resolvedZFrac ?? 0.15;
    lookZ = shipBBox.min.z + sz.z * frac;
    az = frac > 0.5 ? Math.PI * 1.78 : Math.PI * 0.22;
  }
  const look = new THREE.Vector3(cen.x, ty, lookZ);
  const pol = z.viewPolar,
    d = z.viewDist;
  const pos = new THREE.Vector3(
    look.x + d * Math.sin(pol) * Math.sin(az),
    look.y + d * Math.cos(pol),
    look.z + d * Math.sin(pol) * Math.cos(az),
  );
  _sp.copy(camera.position);
  _sl.copy(controls.target);
  flyTarget = { pos, look };
  flyT = 0;
  controls.maxPolarAngle =
    pol > Math.PI * 0.55 ? Math.PI * 0.97 : Math.PI * 0.54;
}

function ease(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// ═══════════════════════════════════════════════════════════
// 11. TẢI MODEL
// ═══════════════════════════════════════════════════════════
const raycaster = new THREE.Raycaster(),
  mouse = new THREE.Vector2();
let meshes = [],
  shipBBox = null,
  lastMesh = null,
  lastMat = null;

new GLTFLoader().load(
  "./models/model-ship-3d-2.glb",
  (gltf) => {
    const model = gltf.scene;
    const raw = new THREE.Box3().setFromObject(model);
    const cen = raw.getCenter(new THREE.Vector3());
    const sz = raw.getSize(new THREE.Vector3());
    const s = 20 / Math.max(sz.x, sz.y, sz.z);
    model.scale.setScalar(s);
    model.position.set(-cen.x * s, -raw.min.y * s, -cen.z * s);
    scene.add(model);
    model.traverse((c) => {
      if (!c.isMesh) return;
      c.castShadow = c.receiveShadow = true;
      meshes.push(c);
    });
    shipBBox = new THREE.Box3().setFromObject(model);
    const mid = shipBBox.min.y + (shipBBox.max.y - shipBBox.min.y) * 0.45;
    controls.target.set(0, mid, 0);
    camera.position.set(28, mid + 8, 36);
    controls.update();
    hint.textContent =
      "Kéo để xoay  ·  Lăn chuột để phóng to/thu nhỏ  ·  Click danh mục bên trái để xem chi tiết từng khu vực";
  },
  (xhr) => {
    const p = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : "...";
    hint.textContent = `Đang tải mô hình... ${p}%`;
  },
  (err) => {
    console.error("❌", err);
    hint.textContent = "Lỗi tải mô hình";
    hint.style.color = "#ff6b6b";
  },
);

// ═══════════════════════════════════════════════════════════
// 12. EVENTS
// ═══════════════════════════════════════════════════════════
function restoreMesh() {
  if (lastMesh && lastMat) {
    lastMesh.material = lastMat;
    lastMesh = null;
    lastMat = null;
  }
}

window.addEventListener("mousemove", (e) => {
  if (!meshes.length || !shipBBox) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  raycaster.far = 200;
  const hits = raycaster.intersectObjects(meshes, false);
  renderer.domElement.style.cursor = hits.length ? "crosshair" : "grab";
});
renderer.domElement.addEventListener("mouseleave", () => {
  restoreMesh();
  renderer.domElement.style.cursor = "grab";
});
renderer.domElement.addEventListener("click", (e) => {
  if (!meshes.length || !shipBBox) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) closeInfoPanel();
});

// ═══════════════════════════════════════════════════════════
// 13. RESIZE & LOOP
// ═══════════════════════════════════════════════════════════
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();

(function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  pinElapsed += dt;

  // ── FLY-TO ───────────────────────────────────────────────
  if (flyTarget && flyT < 1) {
    flyT = Math.min(1, flyT + FLY_SPEED);
    const t = ease(flyT);
    camera.position.lerpVectors(_sp, flyTarget.pos, t);
    _tl.lerpVectors(_sl, flyTarget.look, t);
    controls.target.copy(_tl);
    if (flyT >= 1) flyTarget = null;
  }

  // ── PIN ANIMATION ─────────────────────────────────────────
  if (pinGroup) {
    const baseY = pinGroup.userData.baseY ?? 0;

    // BOB: sine với easing "ease-in-out" bằng cách dùng
    // sin thường nhưng squish theo hướng xuống (giả lực hút)
    // → nhanh xuống, chậm lên = cảm giác bounce nhẹ
    const rawSin = Math.sin(pinElapsed * BOB_FREQ); // −1..1
    // Remap: lên chậm (rawSin>0 → squash), xuống nhanh
    const bobVal =
      rawSin > 0
        ? Math.pow(rawSin, 0.65) * BOB_AMP // lên — chậm hơn
        : -Math.pow(-rawSin, 1.55) * BOB_AMP * 0.7; // xuống — nhanh hơn
    pinGroup.position.y = baseY + bobVal;

    // ORBIT RINGS xoay
    const oA = pinGroup.userData.orbitA;
    const oB = pinGroup.userData.orbitB;
    if (oA) oA.rotation.y += oA.userData.spinY * dt;
    if (oB) oB.rotation.y += oB.userData.spinY * dt;

    // POINT LIGHT pulse cùng nhịp bob — sáng hơn khi ở đỉnh
    const gl = pinGroup.userData.glowLight;
    if (gl) gl.intensity = 1.0 + (bobVal / BOB_AMP) * 0.55;

    // PULSE WAVE RINGS — mỗi vòng có phase lệch nhau
    //   progress 0→1 trong PULSE_PERIOD giây
    //   r = lerp(0.18s, PULSE_MAX_R×s, progress)
    //   opacity: mạnh ở giữa, tan biến ở cuối
    const rings = pinGroup.userData.pulseRings;
    if (rings) {
      const s = rings[0]?.userData.pScale ?? 1;
      rings.forEach((ring) => {
        const t =
          ((pinElapsed + ring.userData.phase) % PULSE_PERIOD) / PULSE_PERIOD;
        const r = (0.18 + t * (PULSE_MAX_R - 0.18)) * s;
        // RingGeometry innerR = 0.88, outerR = 1.0 → scale để đổi bán kính
        ring.scale.set(r, r, 1);
        // opacity: tăng nhanh 0→0.7 lúc t<0.25, giảm dần về 0 lúc t→1
        const op =
          t < 0.25 ? (t / 0.25) * 0.65 : 0.65 * (1 - (t - 0.25) / 0.75);
        ring.material.opacity = op;
      });
    }
  }

  controls.update();
  renderer.render(scene, camera);
})();
