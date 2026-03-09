import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ═══════════════════════════════════════════════════════════
// 1.  DỮ LIỆU VÙNG TÀU
//
//  type: "exterior" → dùng 3D pin trên bề mặt ngoài
//        "interior" → dùng sơ đồ mặt cắt 2D
//
//  pinCast: hướng bắn tia để tìm bề mặt
//    { from:"above"|"below"|"side_right"|"side_left"|"front"|"back",
//      relY, relX, relZ }  (0..1 trong bbox)
// ═══════════════════════════════════════════════════════════
const ZONES = {
  day_tau: {
    name: "Đáy Tàu",
    color: "#29b6f6",
    icon: "⚓",
    type: "exterior",
    pinCast: { from: "below", relY: 0.01, relXFrac: 0.5, relZFrac: 0.5 },
    // polar=2.1 → camera chui xuống dưới đáy tàu nhìn lên
    // dist=18 gần hơn để pin to rõ hơn
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
    color: "#1565c0",
    icon: "🌊",
    type: "exterior",
    // relY: 0..1 (0=đáy, 1=đỉnh). Mạn ướt = vùng thấp, ngập nước ~ 15-30%
    pinCast: { from: "side_right", relY: 0.2, relXFrac: 1.0, relZFrac: 0.4 },
    viewRelY: 0.2,
    viewDist: 22,
    viewAzimuth: Math.PI * 0.22,
    viewPolar: 1.3,
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
    color: "#c62828",
    icon: "☀️",
    type: "exterior",
    // relY: Mạn khô = vùng giữa, không ngập nước ~ 35-50%
    pinCast: { from: "side_right", relY: 0.4, relXFrac: 1.0, relZFrac: 0.38 },
    viewRelY: 0.4,
    viewDist: 22,
    viewAzimuth: Math.PI * 0.22,
    viewPolar: 1.35,
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
    name: "Mặt Boong, Lối Đi",
    color: "#2e7d32",
    icon: "🚶",
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
    color: "#7b1fa2",
    icon: "📦",
    type: "interior",
    // interior → hiển thị sơ đồ mặt cắt, không dùng 3D pin
    // Vùng highlight trong sơ đồ SVG (tỉ lệ 0..1 trong hình)
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
    color: "#e65100",
    icon: "🔩",
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
    name: "Thượng Tầng / Cabin",
    color: "#78909c",
    icon: "🏠",
    type: "exterior",
    // ── TUNING THƯỢNG TẦNG ──────────────────────────────────────
    // from:"scan_cabin" → tự động quét 12 điểm Z tìm tường cabin
    // Không cần sửa relZFrac (được tự tính)
    // Nếu muốn sửa thủ công: đổi from:"side_right" và chỉnh relZFrac
    //   relZFrac: 0..1 (0=đầu min.z, 1=đầu max.z)
    //   relY: 0..1 (0=đáy, 1=đỉnh) — cabin ở khoảng 0.75-0.85
    pinCast: { from: "scan_cabin", relY: 0.78, relXFrac: 1.0, relZFrac: 0.5 },
    // Camera: viewAzimuth sẽ được tự điều chỉnh theo vị trí cabin detect được
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

// ── zoneByPhysics: phân loại vùng dựa trên normal + vị trí ────────────
// ĐÃ TINH CHỈNH dựa trên tỉ lệ thực tế của tàu hàng bulk carrier:
//
//  relY (chiều cao tương đối 0..1):
//   0.00 - 0.13 → Đáy tàu
//   0.13 - 0.30 → Mạn Ướt  (ngập nước khi đầy tải)
//   0.30 - 0.58 → Mạn Khô  (trên đường nước)
//   0.58 - 0.76 → Mặt Boong / Lối Đi
//   0.76 - 1.00 → Thượng Tầng / Cabin
//
//  Bề mặt nằm ngang (ny > 0.55) luôn là Boong hoặc Hầm hàng
//  Bề mặt mặt dưới (ny < -0.50) luôn là Đáy hoặc Khung xương
//
function zoneByPhysics(wn, relY, relX) {
  const ny = wn.y,
    nx = Math.abs(wn.x),
    nz = Math.abs(wn.z);

  // Bề mặt NẰM NGANG hướng lên (boong, nắp hầm, mái cabin)
  if (ny > 0.55) {
    if (relY < 0.12) return ZONES.day_tau;
    // Trung tâm + cao = hầm hàng (nắp hatch)
    if (relY > 0.55 && relX < 0.6) return ZONES.ham_hang;
    return ZONES.mat_boong;
  }

  // Bề mặt NẰM NGANG hướng xuống (đáy tàu, sườn ngang)
  if (ny < -0.5) {
    if (relY < 0.14) return ZONES.day_tau;
    return ZONES.he_thong_khung;
  }

  // Bề mặt THẲNG ĐỨNG / NGHIÊNG (mạn tàu, tường cabin, hầm)
  // Ưu tiên: nếu normal có thành phần Y đáng kể = mặt nghiêng → boong
  if (ny > 0.3 && relY > 0.5) return ZONES.mat_boong;

  // Tường thẳng đứng tại vùng cao + giữa tàu = hầm hàng
  if (relY > 0.56 && relX < 0.65 && (nx > 0.25 || nz > 0.25))
    return ZONES.ham_hang;

  // Phân loại theo chiều cao
  if (relY > 0.76) return ZONES.thuong_tang;
  if (relY < 0.13) return ZONES.day_tau;
  if (relY < 0.3) return ZONES.man_uot;
  if (relY < 0.58) return ZONES.man_kho;
  if (relY < 0.76) return ZONES.mat_boong;
  return ZONES.thuong_tang;
}

// ── detectZone: nhận diện vùng với MULTI-SAMPLE VOTING ────────────────
// Thay vì dùng 1 điểm duy nhất (dễ sai ở ranh giới), lấy mẫu thêm
// 4 điểm lân cận rồi bỏ phiếu → kết quả ổn định hơn nhiều
//
const _voteRC = new THREE.Raycaster();

function detectZone(mesh, point, face, bbox) {
  // Ưu tiên tuyệt đối: tên mesh khớp từ khóa
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

  // ── VOTE: kiểm tra 4 điểm lân cận nhỏ (+/-0.15 units theo normal) ──
  // Nếu đa số đồng ý với primary → dùng primary (tránh nhảy ở ranh giới)
  const OFFSET = 0.18;
  const neighbors = [
    new THREE.Vector3(OFFSET, 0, 0),
    new THREE.Vector3(-OFFSET, 0, 0),
    new THREE.Vector3(0, OFFSET, 0),
    new THREE.Vector3(0, -OFFSET, 0),
  ];

  let votes = {}; // zoneKey → count
  const addVote = (z) => {
    const k = Object.keys(ZONES).find((k) => ZONES[k] === z) || "man_kho";
    votes[k] = (votes[k] || 0) + 1;
  };
  addVote(primary);
  addVote(primary); // primary có trọng số 2

  for (const off of neighbors) {
    const samplePt = point.clone().add(off);
    const relYs = Math.max(0, Math.min(1, (samplePt.y - bbox.min.y) / sz.y));
    const relXs =
      Math.abs(samplePt.x - (bbox.min.x + sz.x * 0.5)) / (sz.x * 0.5 + 0.001);
    addVote(zoneByPhysics(_wn, relYs, relXs));
  }

  // Tìm zone nhiều phiếu nhất
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
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111927);
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
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 3;
controls.maxDistance = 110;
controls.maxPolarAngle = Math.PI * 0.54;

// ═══════════════════════════════════════════════════════════
// 4.  ÁNH SÁNG
// ═══════════════════════════════════════════════════════════
scene.add(new THREE.AmbientLight(0xfff0dd, 0.9));
const sun = new THREE.DirectionalLight(0xfff8e8, 1.8);
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
const fill = new THREE.DirectionalLight(0x8ab4cc, 0.5);
fill.position.set(-20, 10, -15);
scene.add(fill);
scene.add(new THREE.HemisphereLight(0x99ccff, 0x334455, 0.4));

// ═══════════════════════════════════════════════════════════
// 5.  PIN 3D — CHỈ DÙNG CHO VÙNG NGOÀI
// ═══════════════════════════════════════════════════════════
let pinGroup = null,
  pinAnimT = 0;
const _castRC = new THREE.Raycaster();

function buildPin(color, s = 1.0) {
  const grp = new THREE.Group();
  const col = new THREE.Color(color);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035 * s, 0.035 * s, 1.2 * s, 8),
    new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    }),
  );
  stem.position.y = 0.6 * s;
  grp.add(stem);
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.2 * s, 0.4 * s, 12),
    new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.8,
      roughness: 0.15,
    }),
  );
  cone.rotation.z = Math.PI;
  cone.position.y = -0.04 * s;
  grp.add(cone);
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.16 * s, 14, 14),
    new THREE.MeshStandardMaterial({
      color: col,
      emissive: col,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.3,
    }),
  );
  ball.position.y = 1.24 * s;
  grp.add(ball);
  // Pulse rings
  for (let i = 0; i < 2; i++) {
    const r = new THREE.Mesh(
      new THREE.RingGeometry(0.25 * s, 0.38 * s, 32),
      new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      }),
    );
    r.rotation.x = -Math.PI / 2;
    r.position.y = 0.01;
    r.userData.isPulse = true;
    r.userData.phase = i * Math.PI;
    grp.add(r);
  }
  const base = new THREE.Mesh(
    new THREE.RingGeometry(0.15 * s, 0.26 * s, 32),
    new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    }),
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.01;
  grp.add(base);
  return grp;
}

/**
 * ═══════════════════════════════════════════════════════
 *  castToSurface — bắn tia tìm điểm trên bề mặt tàu
 *
 *  cfg.from:
 *   "above"      → từ trên xuống
 *   "below"      → từ dưới lên
 *   "side_right" → từ mạn phải (X+) vào
 *   "side_left"  → từ mạn trái (X-) vào
 *   "front"      → từ mũi (Z-) vào
 *   "back"       → từ đuôi (Z+) vào
 *   "scan_cabin" → quét 12 điểm Z để tìm tường cabin
 *
 *  cfg.relY    = 0..1  (chiều cao tương đối trong bbox)
 *  cfg.relXFrac= 0..1  (X tương đối)
 *  cfg.relZFrac= 0..1  (Z tương đối)
 * ═══════════════════════════════════════════════════════
 */
function castToSurface(cfg, bbox, meshList) {
  const sz = bbox.getSize(new THREE.Vector3());
  const min = bbox.min,
    max = bbox.max;
  const cx = (min.x + max.x) * 0.5;
  const MARGIN = 5;

  // ── SCAN_CABIN: quét 12 điểm Z từ side_right ──────────
  // Cabin = cấu trúc có diện tích RỘNG nhất ở độ cao cao (relY 0.72-0.88)
  // → tìm nhóm Z liên tiếp có hit side_right tại độ cao đó
  if (cfg.from === "scan_cabin") {
    const cabinRelY = 0.78; // độ cao quét (cabin cao hơn boong)
    const ty = min.y + sz.y * cabinRelY;
    const STEPS = 12;
    const hits12 = [];

    for (let i = 0; i < STEPS; i++) {
      const frac = 0.05 + (i / (STEPS - 1)) * 0.9; // 0.05 → 0.95
      const tz = min.z + sz.z * frac;
      const org = new THREE.Vector3(max.x + MARGIN, ty, tz);
      const dir = new THREE.Vector3(-1, 0, 0);
      _castRC.set(org, dir.normalize());
      _castRC.far = sz.x + MARGIN * 2;
      const h = _castRC.intersectObjects(meshList, false);
      hits12.push(h.length > 0 ? { frac, point: h[0].point.clone() } : null);
    }

    // Tìm nhóm liên tiếp dài nhất có hit (= tường cabin, rộng hơn cột cẩu)
    let bestGroup = [],
      curGroup = [];
    for (const h of hits12) {
      if (h) {
        curGroup.push(h);
        if (curGroup.length > bestGroup.length) bestGroup = [...curGroup];
      } else curGroup = [];
    }

    if (bestGroup.length) {
      // Lấy điểm giữa nhóm dài nhất
      const mid = bestGroup[Math.floor(bestGroup.length / 2)];
      // Lưu lại ZFrac để flyToZone dùng
      ZONES.thuong_tang._resolvedZFrac = mid.frac;
      return { point: mid.point.clone(), normal: new THREE.Vector3(1, 0, 0) };
    }
    // Fallback: giữa tàu
    ZONES.thuong_tang._resolvedZFrac = 0.5;
    return {
      point: new THREE.Vector3(cx, ty, min.z + sz.z * 0.5),
      normal: new THREE.Vector3(1, 0, 0),
    };
  }

  // ── Các mode thông thường ──────────────────────────────
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
    // "below" và "above": hit đầu tiên là bề mặt ngoài cùng
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

  // Dùng castToSurface trực tiếp (above_cabin mode tự xử lý 2 đầu Z)
  const result = castToSurface(z.pinCast, shipBBox, meshList);

  pinGroup = buildPin(z.color, s);
  pinGroup.position.copy(result.point);

  if (key === "day_tau") {
    // ── ĐÁY TÀU: Pin treo ngược từ đáy tàu xuống camera ────────
    // Vấn đề cũ: pin default có cone ở dưới (-Y) nhưng camera nhìn từ dưới lên
    // → cone "đâm vào" tàu vì stem+ball ở phía trên (trong thân tàu)
    //
    // Fix: FLIP pin 180° quanh trục X:
    //   Trước flip: ball ở +1.24s (lên), cone tip ở -0.24s (xuống vào tàu)
    //   Sau flip:   ball ở -1.24s (xuống), cone tip ở +0.24s (lên chạm đáy tàu)
    //
    // Rồi dịch xuống: position.y -= 0.24s
    //   → cone tip đúng tại y_surface (chạm vỏ đáy tàu)
    //   → stem+ball treo xuống dưới về phía camera ✓
    pinGroup.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    pinGroup.position.y -= 0.24 * s;
  } else if (key === "thuong_tang") {
    // ── THƯỢNG TẦNG: Pin cắm vào tường mạn cabin ────────────────
    // scan_cabin trả về normal (1,0,0) — pin xoay để căn theo tường
    // Cone chỉ ngang ra khỏi tường mạn (về phía camera)
    const up = new THREE.Vector3(0, 1, 0);
    const wallNorm = result.normal.clone().normalize();
    // Căn pin: trục Y của pin = normal tường (pin nằm ngang, cone chỉ ra ngoài)
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

  pinAnimT = 0;
  scene.add(pinGroup);
}

function removePin() {
  if (pinGroup) {
    scene.remove(pinGroup);
    pinGroup = null;
  }
}

// ═══════════════════════════════════════════════════════════
// 6.  SƠ ĐỒ MẶT CẮT 2D — CHO VÙNG BÊN TRONG
//     Vẽ bằng SVG hiển thị trực tiếp bên cạnh info panel
// ═══════════════════════════════════════════════════════════
function buildCrossSectionSVG(highlightKey) {
  const z = ZONES[highlightKey];
  const W = 460,
    H = 220;

  // ── Định nghĩa hình dạng từng vùng trong sơ đồ ──────────
  // Toạ độ SVG (x, y từ top-left)
  const hullColor = "#334455";
  const waterColor = "rgba(21,101,192,0.35)";

  // Vùng tô highlight
  const dz = z.diagramZone;
  const hx = dz.x * W,
    hy = dz.y * H,
    hw = dz.w * W,
    hh = dz.h * H;

  const zones2d = [
    // key, x, y, w, h, label, labelX, labelY
    [
      "day_tau",
      0.03 * W,
      0.78 * H,
      0.94 * W,
      0.18 * H,
      "Đáy Tàu",
      0.5 * W,
      0.885 * H,
    ],
    [
      "man_uot",
      0.01 * W,
      0.55 * H,
      0.05 * W,
      0.23 * H,
      "Mạn Ướt",
      -12,
      0.67 * H,
    ],
    ["man_uot_r", 0.94 * W, 0.55 * H, 0.05 * W, 0.23 * H, null, null, null],
    [
      "man_kho",
      0.01 * W,
      0.32 * H,
      0.05 * W,
      0.23 * H,
      "Mạn Khô",
      -12,
      0.44 * H,
    ],
    ["man_kho_r", 0.94 * W, 0.32 * H, 0.05 * W, 0.23 * H, null, null, null],
    [
      "ham_hang",
      0.1 * W,
      0.22 * H,
      0.8 * W,
      0.55 * H,
      "Hầm Hàng",
      0.5 * W,
      0.49 * H,
    ],
    [
      "he_thong_khung",
      0.06 * W,
      0.18 * H,
      0.88 * W,
      0.62 * H,
      "Khung Xương",
      0.5 * W,
      0.5 * H,
    ],
    [
      "mat_boong",
      0.06 * W,
      0.18 * H,
      0.88 * W,
      0.06 * H,
      "Mặt Boong",
      0.5 * W,
      0.215 * H,
    ],
    [
      "thuong_tang",
      0.28 * W,
      0.02 * H,
      0.44 * W,
      0.17 * H,
      "Thượng Tầng",
      0.5 * W,
      0.09 * H,
    ],
  ];

  // Chỉ lấy zones cần vẽ (không phải _r variants)
  const drawZones = zones2d.filter((z) => !z[0].endsWith("_r"));
  // Các zones của cùng nhóm (left+right mạn)
  const allRects = zones2d;

  // Màu fill cho từng zone (mờ)
  function getFill(k) {
    if (k === highlightKey) return z.color + "cc";
    const zz = ZONES[k];
    return zz ? zz.color + "33" : "#ffffff11";
  }
  function getStroke(k) {
    if (k === highlightKey) return z.color;
    const zz = ZONES[k];
    return zz ? zz.color + "88" : "#ffffff44";
  }

  // Vẽ SVG
  let rects = "";
  for (const [k, x, y, w, h] of allRects) {
    const baseKey = k.replace("_r", "");
    rects += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}"
      width="${w.toFixed(1)}" height="${h.toFixed(1)}"
      fill="${getFill(baseKey)}" stroke="${getStroke(baseKey)}"
      stroke-width="${k === highlightKey ? 2 : 1}" rx="3"/>`;
  }

  // Mũi tàu (phải)
  rects += `<polygon points="${(0.97 * W).toFixed(1)},${(0.22 * H).toFixed(1)}
    ${(1.0 * W).toFixed(1)},${(0.55 * H).toFixed(1)}
    ${(0.97 * W).toFixed(1)},${(0.96 * H).toFixed(1)}"
    fill="${hullColor}" stroke="#4488aa88" stroke-width="1"/>`;
  // Đuôi tàu (trái)
  rects += `<polygon points="${(0.03 * W).toFixed(1)},${(0.22 * H).toFixed(1)}
    ${(0.0 * W).toFixed(1)},${(0.55 * H).toFixed(1)}
    ${(0.03 * W).toFixed(1)},${(0.96 * H).toFixed(1)}"
    fill="${hullColor}" stroke="#4488aa88" stroke-width="1"/>`;

  // Đường mực nước
  const wLine = (0.63 * H).toFixed(1);
  rects += `<line x1="0" y1="${wLine}" x2="${W}" y2="${wLine}"
    stroke="#1565c0" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.8"/>
  <text x="${(W - 4).toFixed(0)}" y="${(parseFloat(wLine) - 4).toFixed(0)}"
    font-size="9" fill="#64b5f6" text-anchor="end" font-family="sans-serif">
    Mực nước
  </text>`;

  // Labels
  let labels = "";
  for (const [k, x, y, w, h, lbl, lx, ly] of drawZones) {
    if (!lbl || lx === null) continue;
    const isHL = k === highlightKey;
    labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}"
      font-size="${isHL ? 12 : 9}" font-weight="${isHL ? "700" : "400"}"
      fill="${isHL ? "#fff" : ZONES[k]?.color + "bb" || "#888"}"
      text-anchor="middle" font-family="sans-serif"
      dominant-baseline="middle">${lbl}</text>`;
  }

  // Mũi tên chỉ vào vùng highlight
  const arrowX = (hx + hw * 0.5).toFixed(1);
  const arrowY = (hy - 18).toFixed(1);
  const arrowTip = (hy - 2).toFixed(1);
  const arrowLabel = `
    <line x1="${arrowX}" y1="${arrowY}" x2="${arrowX}" y2="${arrowTip}"
      stroke="${z.color}" stroke-width="2" marker-end="url(#arr)"/>
    <text x="${arrowX}" y="${(parseFloat(arrowY) - 8).toFixed(1)}"
      font-size="11" font-weight="700" fill="${z.color}"
      text-anchor="middle" font-family="sans-serif">
      ${z.icon} ${z.name}
    </text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg"
    width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
    style="border-radius:8px;background:#0a1520;display:block;max-width:100%">
    <defs>
      <marker id="arr" markerWidth="8" markerHeight="8"
        refX="4" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="${z.color}"/>
      </marker>
    </defs>
    ${rects}${labels}${arrowLabel}
  </svg>`;
}

// ═══════════════════════════════════════════════════════════
// 7.  HOVER TOOLTIP
// ═══════════════════════════════════════════════════════════
const hoverTip = document.getElementById("tooltip");
Object.assign(hoverTip.style, {
  position: "fixed",
  pointerEvents: "none",
  display: "none",
  background: "rgba(5,12,26,0.92)",
  color: "#f0f4ff",
  padding: "7px 13px",
  borderRadius: "7px",
  fontSize: "12px",
  fontWeight: "600",
  lineHeight: "1.4",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(100,170,255,0.22)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
  zIndex: "1001",
  whiteSpace: "nowrap",
});

// ═══════════════════════════════════════════════════════════
// 8.  INFO PANEL
// ═══════════════════════════════════════════════════════════
const infoPanel = document.createElement("div");
Object.assign(infoPanel.style, {
  position: "fixed",
  top: "16px",
  right: "16px",
  width: "340px",
  maxHeight: "calc(100vh - 32px)",
  overflowY: "auto",
  background: "rgba(5,12,26,0.97)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(100,170,255,0.22)",
  borderRadius: "14px",
  boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
  zIndex: "999",
  transform: "translateX(380px)",
  transition: "transform .38s cubic-bezier(.4,0,.2,1)",
  color: "#f0f4ff",
  fontSize: "13px",
  lineHeight: "1.65",
});
document.body.appendChild(infoPanel);
let activeZoneKey = null;

function openInfoPanel(key) {
  const z = ZONES[key];
  activeZoneKey = key;
  LEGEND_ORDER.forEach((k) => {
    legendRows[k].style.background =
      k === key ? `rgba(${hexRgb(ZONES[k].color)},0.22)` : "transparent";
    legendRows[k].style.borderLeft =
      k === key ? `3px solid ${ZONES[k].color}` : "3px solid transparent";
  });

  // Sơ đồ mặt cắt cho vùng interior
  const diagramHTML =
    z.type === "interior"
      ? `
    <div style="padding:14px 20px 4px;border-bottom:1px solid rgba(100,170,255,.12)">
      <div style="font-size:11px;font-weight:700;letter-spacing:.7px;
        color:#7ec8e3;margin-bottom:10px">📐 SƠ ĐỒ MẶT CẮT NGANG TÀU</div>
      <div style="overflow-x:auto">
        ${buildCrossSectionSVG(key)}
      </div>
      <div style="font-size:10px;color:#556677;margin-top:6px;text-align:center">
        ↑ Vùng được đánh dấu trong sơ đồ mặt cắt
      </div>
    </div>`
      : "";

  infoPanel.innerHTML = `
    <div style="background:linear-gradient(135deg,${z.color}55,${z.color}18);
      padding:18px 20px 14px;border-radius:14px 14px 0 0;
      border-bottom:1px solid rgba(100,170,255,.12);position:relative">
      <button id="closePanel" style="position:absolute;top:12px;right:14px;
        background:rgba(255,255,255,.1);border:none;color:#99aacc;
        width:26px;height:26px;border-radius:50%;cursor:pointer;
        font-size:14px;line-height:26px;text-align:center;transition:background .15s"
        onmouseover="this.style.background='rgba(255,255,255,.2)'"
        onmouseout="this.style.background='rgba(255,255,255,.1)'">✕</button>
      <div style="font-size:28px;margin-bottom:6px">${z.icon}</div>
      <div style="font-size:18px;font-weight:700;color:#fff">${z.name}</div>
      <div style="margin-top:5px;display:flex;align-items:center;gap:6px">
        <span style="width:8px;height:8px;background:${z.color};
          border-radius:50%;display:inline-block"></span>
        <span style="font-size:11px;color:#8899bb;letter-spacing:.5px">
          ${z.type === "interior" ? "KHU VỰC BÊN TRONG" : "KHU VỰC BỀ MẶT NGOÀI"}
        </span>
      </div>
    </div>
    ${diagramHTML}
    <div style="padding:14px 20px;color:#b0c8e0;font-size:12.5px;
      line-height:1.78;border-bottom:1px solid rgba(100,170,255,.10)">
      ${z.description}
    </div>
    <div style="padding:14px 20px 18px">
      <div style="font-size:11px;font-weight:700;letter-spacing:.8px;
        color:#7ec8e3;margin-bottom:12px">🎨 DÒNG SƠN ĐỀ NGHỊ</div>
      ${z.paints
        .map(
          (p, i) => `
        <div style="display:flex;gap:11px;margin-bottom:9px;
          background:rgba(255,255,255,.04);padding:10px 12px;
          border-radius:8px;border-left:3px solid ${z.color}">
          <div style="flex-shrink:0;width:22px;height:22px;background:${z.color};
            border-radius:50%;display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:700;color:#fff;margin-top:2px">${i + 1}</div>
          <div>
            <div style="font-weight:700;color:#f0e080;font-size:13px;
              margin-bottom:3px">${p.name}</div>
            <div style="color:#8aaac4;font-size:11.5px">${p.desc}</div>
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
  infoPanel.style.transform = "translateX(380px)";
  activeZoneKey = null;
  removePin();
  controls.maxPolarAngle = Math.PI * 0.54; // reset về bình thường
  LEGEND_ORDER.forEach((k) => {
    legendRows[k].style.background = "transparent";
    legendRows[k].style.borderLeft = "3px solid transparent";
  });
}

// ═══════════════════════════════════════════════════════════
// 9.  LEGEND
// ═══════════════════════════════════════════════════════════
const legend = document.createElement("div");
Object.assign(legend.style, {
  position: "fixed",
  top: "16px",
  left: "16px",
  background: "rgba(5,12,26,0.92)",
  color: "#e8f0fe",
  padding: "14px 16px",
  borderRadius: "12px",
  fontSize: "12px",
  lineHeight: "1.5",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(100,170,255,.2)",
  zIndex: "999",
  userSelect: "none",
  minWidth: "205px",
});
legend.innerHTML = `<strong style="font-size:13px;color:#7ec8e3;
  display:block;margin-bottom:10px">🚢 Bản đồ vị trí tàu</strong>`;

const legendRows = {};
LEGEND_ORDER.forEach((key) => {
  const z = ZONES[key];
  const row = document.createElement("div");
  Object.assign(row.style, {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "6px 8px",
    borderRadius: "7px",
    cursor: "pointer",
    marginBottom: "2px",
    transition: "background .15s",
    borderLeft: "3px solid transparent",
  });
  // Badge: exterior = pin icon, interior = diagram icon
  const badge =
    z.type === "interior"
      ? `<span style="font-size:9px;background:rgba(255,255,255,.1);
        color:#88aabb;padding:1px 4px;border-radius:3px;margin-left:auto">📐</span>`
      : `<span style="font-size:9px;background:rgba(255,255,255,.1);
        color:#88aabb;padding:1px 4px;border-radius:3px;margin-left:auto">📍</span>`;
  row.innerHTML = `
    <span style="flex-shrink:0;width:11px;height:11px;background:${z.color};
      border-radius:2px;border:1px solid rgba(255,255,255,.3)"></span>
    <span style="flex:1">${z.icon} ${z.name}</span>
    ${badge}`;
  row.addEventListener("mouseenter", () => {
    if (activeZoneKey !== key) row.style.background = "rgba(100,170,255,.1)";
  });
  row.addEventListener("mouseleave", () => {
    if (activeZoneKey !== key) row.style.background = "transparent";
  });
  row.addEventListener("click", () => {
    if (activeZoneKey === key) {
      closeInfoPanel();
      return;
    }
    // Thượng tầng: placePin trước để detect vị trí cabin, rồi mới fly
    if (z.type === "exterior") {
      placePin(key, meshes); // sets ZONES.thuong_tang._resolvedZFrac nếu cần
    } else {
      removePin();
    }
    flyToZone(key); // dùng _resolvedZFrac đã detect ở trên
    openInfoPanel(key);
  });
  legend.appendChild(row);
  legendRows[key] = row;
});
document.body.appendChild(legend);

const hint = document.createElement("div");
Object.assign(hint.style, {
  position: "fixed",
  bottom: "16px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(5,12,26,.82)",
  color: "#90b8d8",
  padding: "8px 22px",
  borderRadius: "20px",
  fontSize: "12px",
  zIndex: "999",
  whiteSpace: "nowrap",
});
hint.textContent = "⏳ Đang tải mô hình...";
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

  // Thượng tầng: nhìn vào đúng đầu tàu có cabin (tự phát hiện qua placePin)
  let lookZ = cen.z;
  let az = z.viewAzimuth;
  if (key === "thuong_tang") {
    const frac = ZONES.thuong_tang._resolvedZFrac ?? 0.15;
    lookZ = shipBBox.min.z + sz.z * frac;
    // Camera nhìn từ mạn phải vào cabin: azimuth ≈ 0.22π (nhìn từ phía X+ Z+)
    // Nếu cabin ở max.z (frac>0.5): camera đứng về phía Z+ → azimuth lớn hơn
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
function hexRgb(h) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
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
      "🖱 Di chuột để xem  •  Click tàu/legend để xem chi tiết  •  📍 = pin bề mặt  •  📐 = sơ đồ mặt cắt";
    console.log(
      "MESH NAMES:\n",
      [...new Set(meshes.map((m) => m.name).filter(Boolean))].sort().join("\n"),
    );
  },
  (xhr) => {
    const p = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : "...";
    hint.textContent = `⏳ Đang tải... ${p}%`;
  },
  (err) => {
    console.error("❌", err);
    hint.textContent = "❌ Lỗi tải model";
    hint.style.color = "#ff6b6b";
  },
);

// ═══════════════════════════════════════════════════════════
// 12. RAYCASTING & EVENTS
// ═══════════════════════════════════════════════════════════
function restoreMesh() {
  if (lastMesh && lastMat) {
    lastMesh.material = lastMat;
    lastMesh = null;
    lastMat = null;
  }
}

// ── Debounce & zone-lock để chống nhảy tooltip ──
let hoverZoneKey = null; // zone đang hiển thị tooltip
let hoverLockCount = 0; // số frame liên tiếp cùng zone
let pendingZoneKey = null; // zone đang "ứng cử"
let pendingCount = 0;
const ZONE_LOCK_FRAMES = 4; // phải ổn định N frame mới đổi

window.addEventListener("mousemove", (e) => {
  if (!meshes.length || !shipBBox) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // Tăng far để bắt được đáy tàu khi nhìn từ dưới
  raycaster.far = 200;

  const hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) {
    restoreMesh();
    hoverTip.style.display = "none";
    renderer.domElement.style.cursor = "grab";
    hoverZoneKey = null;
    hoverLockCount = 0;
    pendingZoneKey = null;
    pendingCount = 0;
    return;
  }

  const { object: mesh, point, face } = hits[0];
  if (!face) return;
  const zone = detectZone(mesh, point, face, shipBBox);
  const key = Object.keys(ZONES).find((k) => ZONES[k] === zone) || "man_kho";

  // ── Zone-lock logic: chỉ đổi tooltip khi zone ổn định N frame ──
  if (key === hoverZoneKey) {
    hoverLockCount++;
    pendingZoneKey = null;
    pendingCount = 0;
  } else if (key === pendingZoneKey) {
    pendingCount++;
    if (pendingCount >= ZONE_LOCK_FRAMES) {
      // Chấp nhận zone mới
      restoreMesh();
      hoverZoneKey = key;
      hoverLockCount = 0;
      pendingZoneKey = null;
      pendingCount = 0;
    }
  } else {
    pendingZoneKey = key;
    pendingCount = 1;
  }

  // Highlight mesh theo zone đã lock (không theo pending)
  const displayZone = ZONES[hoverZoneKey || key];
  if (mesh !== lastMesh) {
    restoreMesh();
    lastMesh = mesh;
    lastMat = mesh.material;
    mesh.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(displayZone.color),
      emissive: new THREE.Color(displayZone.color),
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.9,
      roughness: 0.3,
      metalness: 0.1,
    });
  }

  // Tooltip chỉ hiện zone đã lock
  const tipZone = ZONES[hoverZoneKey || key];
  hoverTip.innerHTML = `<span style="display:inline-block;width:8px;height:8px;
    background:${tipZone.color};border-radius:50%;margin-right:6px;
    vertical-align:middle"></span>${tipZone.icon} ${tipZone.name}`;
  hoverTip.style.display = "block";
  const tw = hoverTip.offsetWidth + 10;
  hoverTip.style.left =
    (e.clientX + 18 + tw > innerWidth ? e.clientX - tw - 8 : e.clientX + 18) +
    "px";
  hoverTip.style.top =
    (e.clientY + 32 > innerHeight ? e.clientY - 36 : e.clientY + 14) + "px";
  renderer.domElement.style.cursor = "crosshair";
});
renderer.domElement.addEventListener("mouseleave", () => {
  restoreMesh();
  hoverTip.style.display = "none";
  hoverZoneKey = null;
  hoverLockCount = 0;
  pendingZoneKey = null;
  pendingCount = 0;
});

renderer.domElement.addEventListener("click", (e) => {
  if (!meshes.length || !shipBBox) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) {
    closeInfoPanel();
    return;
  }
  const { object: mesh, point, face } = hits[0];
  if (!face) return;
  const zone = detectZone(mesh, point, face, shipBBox);
  const key = Object.keys(ZONES).find((k) => ZONES[k] === zone);
  if (!key) return;
  if (activeZoneKey === key) {
    closeInfoPanel();
    return;
  }
  flyToZone(key);
  openInfoPanel(key);

  if (zone.type === "exterior") {
    // Đặt pin chính xác tại điểm click
    if (pinGroup) {
      scene.remove(pinGroup);
      pinGroup = null;
    }
    const cs = key === "day_tau" ? 3.5 : 1.0;
    pinGroup = buildPin(zone.color, cs);
    pinGroup.position.copy(point);

    if (key === "day_tau") {
      // Flip 180° + dịch: cone tip chạm đáy, stem+ball treo xuống camera
      pinGroup.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
      pinGroup.position.y -= 0.24 * cs;
    } else {
      // Căn theo normal bề mặt
      _nm.getNormalMatrix(mesh.matrixWorld);
      const wn = face.normal.clone().applyMatrix3(_nm).normalize();
      const up = new THREE.Vector3(0, 1, 0);
      if (Math.abs(wn.dot(up)) < 0.95) {
        pinGroup.quaternion.copy(
          new THREE.Quaternion().setFromUnitVectors(up, wn),
        );
      }
    }
    pinAnimT = 0;
    scene.add(pinGroup);
  } else {
    removePin();
  }
});

// ═══════════════════════════════════════════════════════════
// 13. RESIZE & ANIMATE
// ═══════════════════════════════════════════════════════════
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
(function loop() {
  requestAnimationFrame(loop);
  if (flyTarget && flyT < 1) {
    flyT = Math.min(1, flyT + FLY_SPEED);
    const t = ease(flyT);
    camera.position.lerpVectors(_sp, flyTarget.pos, t);
    _tl.lerpVectors(_sl, flyTarget.look, t);
    controls.target.copy(_tl);
    if (flyT >= 1) flyTarget = null;
  }
  if (pinGroup) {
    pinAnimT += clock.getDelta() * 2.0;
    const bob = Math.sin(pinAnimT * 2) * 0.07;
    pinGroup.children.forEach((c) => {
      if (c.userData.isPulse) {
        const prog =
          ((pinAnimT + c.userData.phase) % (Math.PI * 2)) / (Math.PI * 2);
        c.scale.set(0.8 + prog * 2.6, 0.8 + prog * 2.6, 1);
        c.material.opacity = (1 - prog) * 0.65;
      } else {
        if (c.userData.baseY === undefined) c.userData.baseY = c.position.y;
        c.position.y = c.userData.baseY + bob;
      }
    });
  } else {
    clock.getDelta();
  }
  controls.update();
  renderer.render(scene, camera);
})();
