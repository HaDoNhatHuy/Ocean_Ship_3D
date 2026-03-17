import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ═══════════════════════════════════════════════════════════
// 0. NGÔN NGỮ / LANGUAGE SYSTEM
// ═══════════════════════════════════════════════════════════
let currentLang = "vi";

const T = {
  vi: {
    ui: {
      legendTitle: "Bản đồ vùng",
      legendSubtitle: "Vị Trí Tàu Biển",
      headerTitle: "Bản đồ Sơn Tàu Biển — 3D Interactive",
      headerSub: "Marine Coating System",
      hintLoading: "Đang tải mô hình...",
      hintLoadingPct: (p) => `Đang tải mô hình... ${p}%`,
      hintReady:
        "Kéo để xoay · Lăn chuột để phóng to/thu nhỏ · Click danh mục bên trái để xem chi tiết từng khu vực",
      typeInterior: "Khu vực bên trong",
      typeExterior: "Khu vực bề mặt ngoài",
      dotInterior: "▪",
      dotExterior: "◆",
      paintLabel: "Dòng sơn đề nghị",
      diagramLabel: "Hình ảnh minh họa",
      tagInterior: "Nội thất",
      tagExterior: "Ngoại thất",
      loadError: "Lỗi tải mô hình",
      toggleBtn: "EN",
    },
    zones: {
      day_tau: {
        name: "Đáy Tàu",
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
          {
            name: "Sơn Chống hà",
            desc: "Ngăn cản sinh vật biển bám vào vỏ tàu",
          },
        ],
      },
      man_uot: {
        name: "Mạn Ướt",
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
    },
  },
  en: {
    ui: {
      legendTitle: "Zone Map",
      legendSubtitle: "Ship Coating Zones",
      headerTitle: "Ship Coating Map — 3D Interactive",
      headerSub: "Marine Coating System",
      hintLoading: "Loading model...",
      hintLoadingPct: (p) => `Loading model... ${p}%`,
      hintReady:
        "Drag to rotate · Scroll to zoom · Click a category on the left for zone details",
      typeInterior: "Interior Area",
      typeExterior: "Exterior Surface",
      dotInterior: "▪",
      dotExterior: "◆",
      paintLabel: "Recommended Coatings",
      diagramLabel: "Illustration",
      tagInterior: "Interior",
      tagExterior: "Exterior",
      loadError: "Failed to load model",
      toggleBtn: "VI",
    },
    zones: {
      day_tau: {
        name: "Ship Bottom",
        description:
          "The permanently submerged part of the vessel, subject to attack by numerous corrosive agents under harsh conditions. The protective coating system includes anti-corrosion layers and anti-fouling coatings to prevent marine organism attachment.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Optimal waterproofing and protection for permanently submerged areas",
          },
          {
            name: "Coal Tar Epoxy Paint",
            desc: "Waterproof, chemical-resistant, durable in marine environments",
          },
          {
            name: "Anti-fouling Paint",
            desc: "Prevents marine organisms from attaching to the hull",
          },
        ],
      },
      man_uot: {
        name: "Wet Side (Boot Top)",
        description:
          "Hull area regularly submerged when the vessel is loaded. These positions require high-quality specialized anti-corrosion coating systems for sustained protection.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Creates a durable protective layer in saltwater environments",
          },
          {
            name: "Coal Tar Epoxy Paint",
            desc: "Excellent water and chemical resistance with long service life",
          },
        ],
      },
      man_kho: {
        name: "Dry Side (Freeboard)",
        description:
          "Hull area rarely in contact with water, more frequently exposed to sunlight. The selected coating system must maintain good color retention and effective corrosion protection.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Effective corrosion protection, excellent base for topcoats",
          },
          {
            name: "Polyurethane Paint",
            desc: "Long-lasting color, high gloss finish, good UV resistance",
          },
        ],
      },
      mat_boong: {
        name: "Deck & Walkways",
        description:
          "Traffic and movement areas, not submerged, frequently exposed to sunlight, rain and storms. Paint requires good adhesion, anti-slip properties and mechanical load resistance.",
        paints: [
          {
            name: "Epoxy Paint",
            desc: "High hardness, resistant to abrasion and mechanical loads",
          },
          {
            name: "Polyurethane Paint",
            desc: "Elastic, resistant to impact and temperature changes",
          },
          {
            name: "1K PU Paint",
            desc: "Easy application, fast drying, suitable for periodic maintenance",
          },
        ],
      },
      ham_hang: {
        name: "Cargo Hold",
        description:
          "Cargo storage area inside the hull. Anti-corrosion solutions are based on the conditions and nature of cargo carried. A suitable coating system must be selected for each specific cargo type.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Good corrosion protection, safe with a wide range of cargo",
          },
          {
            name: "Alkyd Paint",
            desc: "Suitable for dry cargo holds, cost-effective solution",
          },
          {
            name: "Polyurethane Paint",
            desc: "Durable, chemical-resistant for special cargo",
          },
          {
            name: "Chlorinated Rubber Paint",
            desc: "Strong chemical resistance, suitable for corrosive cargo",
          },
        ],
      },
      he_thong_khung: {
        name: "Structural Framework",
        description:
          "Load-bearing structure of the vessel, distributed throughout the hull both transversally and longitudinally. Not directly exposed to water but susceptible to condensation moisture.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Protects steel structures from corrosion in humid environments",
          },
          {
            name: "Coaltar Epoxy Paint",
            desc: "Excellent moisture and waterproofing for interior structures",
          },
          {
            name: "Alkyd Paint",
            desc: "Finishing coat for protection and aesthetic appeal",
          },
        ],
      },
      thuong_tang: {
        name: "Superstructure & Cabin",
        description:
          "Upper structure of the vessel, including the cabin and on-deck installations. Heavily exposed to weather, sunlight, rain and storms. High aesthetic requirements alongside protection capability.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Anti-corrosion primer, durable base for exterior topcoats",
          },
          {
            name: "Polyurethane Paint",
            desc: "Beautiful colors, long-lasting finish, resistant to harsh weather",
          },
          {
            name: "1K PU Paint",
            desc: "Fast finishing, high gloss for cabin areas",
          },
        ],
      },
    },
  },
};

// Helpers
const ui = () => T[currentLang].ui;
const getZoneText = (key) => T[currentLang].zones[key];

// ═══════════════════════════════════════════════════════════
// 1. DỮ LIỆU VÙNG TÀU (geometry / 3D data — không đổi)
// ═══════════════════════════════════════════════════════════
const ZONES = {
  day_tau: {
    color: "#2196a8",
    type: "exterior",
    relYMin: 0.0,
    relYMax: 0.19,
    normalType: 0,
    pinCast: { from: "below", relY: 0.01, relXFrac: 0.5, relZFrac: 0.5 },
    viewRelY: 0.02,
    viewDist: 18,
    viewAzimuth: Math.PI * 0.45,
    viewPolar: 2.1,
  },
  man_uot: {
    color: "#1a5fa8",
    type: "exterior",
    relYMin: 0.19,
    relYMax: 0.33,
    normalType: 0,
    pinCast: { from: "side_right", relY: 0.26, relXFrac: 1.0, relZFrac: 0.42 },
    viewRelY: 0.26,
    viewDist: 24,
    viewAzimuth: Math.PI * 0.78,
    viewPolar: 1.42,
  },
  man_kho: {
    color: "#b83232",
    type: "exterior",
    relYMin: 0.33,
    relYMax: 0.39,
    pinCast: { from: "side_right", relY: 0.37, relXFrac: 1.0, relZFrac: 0.38 },
    viewRelY: 0.37,
    viewDist: 24,
    viewAzimuth: Math.PI * 0.75,
    viewPolar: 1.38,
  },
  mat_boong: {
    color: "#2e7d32",
    type: "exterior",
    relYMin: 0.39,
    relYMax: 0.41,
    normalType: 1,
    pinCast: { from: "above", relY: 0.51, relXFrac: 0.5, relZFrac: 0.35 },
    viewRelY: 0.51,
    viewDist: 27,
    viewAzimuth: Math.PI * 0.22,
    viewPolar: 0.58,
  },
  ham_hang: {
    color: "#6a1fa2",
    type: "interior",
    diagramZone: { x: 0.12, y: 0.25, w: 0.76, h: 0.52 },
    viewRelY: 0.6,
    viewDist: 32,
    viewAzimuth: Math.PI * 0.25,
    viewPolar: 0.45,
  },
  he_thong_khung: {
    color: "#c45a00",
    type: "interior",
    diagramZone: { x: 0.04, y: 0.08, w: 0.92, h: 0.88 },
    viewRelY: 0.4,
    viewDist: 28,
    viewAzimuth: Math.PI * 0.22,
    viewPolar: 1.1,
  },
  thuong_tang: {
    color: "#546e7a",
    type: "exterior",
    relYMin: 0.52,
    relYMax: 1.0,
    normalType: 0,
    pinCast: { from: "scan_cabin", relY: 0.81, relXFrac: 1.0, relZFrac: 0.5 },
    viewRelY: 0.82,
    viewDist: 17,
    viewAzimuth: Math.PI * 0.2,
    viewPolar: 0.92,
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
// 2. NHẬN DIỆN VÙNG
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
  if (relY < 0.19) return ZONES.day_tau;
  if (relY < 0.35) return ZONES.man_uot;
  if (relY < 0.55) return ZONES.man_kho;
  if (relY < 0.62) return ZONES.mat_boong;
  return ZONES.thuong_tang;
}

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
    const k = Object.keys(ZONES).find((kk) => ZONES[kk] === z) || "man_kho";
    votes[k] = (votes[k] || 0) + 1;
  };
  addVote(primary);
  addVote(primary);
  for (const off of neighbors) {
    const sp = point.clone().add(off);
    const rYs = Math.max(0, Math.min(1, (sp.y - bbox.min.y) / sz.y));
    const rXs =
      Math.abs(sp.x - (bbox.min.x + sz.x * 0.5)) / (sz.x * 0.5 + 0.001);
    addVote(zoneByPhysics(_wn, rYs, rXs));
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
// 3. SCENE / CAMERA / RENDERER
// ═══════════════════════════════════════════════════════════
const HEADER_H = 50,
  BRAND_H = 44;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdde3ea);
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
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 3;
controls.maxDistance = 110;
controls.maxPolarAngle = Math.PI * 0.54;

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
// 4. PIN 3D
// ═══════════════════════════════════════════════════════════
let pinGroup = null,
  pinElapsed = 0;
const _castRC = new THREE.Raycaster();
const PULSE_COUNT = 3,
  PULSE_PERIOD = 1.8,
  PULSE_MAX_R = 1.4,
  BOB_AMP = 0.22,
  BOB_FREQ = 1.9;

function buildPin(color, s = 1.0) {
  const grp = new THREE.Group(),
    col = new THREE.Color(color);
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
  const needle = new THREE.Mesh(
    new THREE.ConeGeometry(0.032 * s, 0.42 * s, 14),
    matBody,
  );
  needle.rotation.z = Math.PI;
  needle.position.y = 0.21 * s;
  grp.add(needle);
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024 * s, 0.038 * s, 1.2 * s, 12),
    matBody,
  );
  rod.position.y = (0.42 + 0.6) * s;
  grp.add(rod);
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * s, 0.024 * s, 0.14 * s, 20),
    matBody,
  );
  collar.position.y = 1.29 * s;
  grp.add(collar);
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
  const jewel = new THREE.Mesh(
    new THREE.SphereGeometry(0.055 * s, 16, 16),
    matHead,
  );
  jewel.position.y = HEAD_Y + 0.048 * s;
  grp.add(jewel);
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
  const pulseRings = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    const pMat = new THREE.MeshBasicMaterial({
      color: col,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const pMesh = new THREE.Mesh(new THREE.RingGeometry(0.88, 1.0, 48), pMat);
    pMesh.rotation.x = -Math.PI / 2;
    pMesh.position.y = 0.015 * s;
    pMesh.userData.phase = (i / PULSE_COUNT) * PULSE_PERIOD;
    pMesh.userData.pScale = s;
    grp.add(pMesh);
    pulseRings.push(pMesh);
  }
  const glow = new THREE.PointLight(col, 1.1, 3.5 * s, 1.7);
  glow.position.y = HEAD_Y;
  grp.add(glow);
  grp.userData.orbitA = orbitA;
  grp.userData.orbitB = orbitB;
  grp.userData.pulseRings = pulseRings;
  grp.userData.headY = HEAD_Y;
  grp.userData.glowLight = glow;
  return grp;
}

function castToSurface(cfg, bbox, meshList) {
  const sz = bbox.getSize(new THREE.Vector3()),
    min = bbox.min,
    max = bbox.max;
  const cx = (min.x + max.x) * 0.5,
    MARGIN = 5;
  if (cfg.from === "scan_cabin") {
    const ty = min.y + sz.y * 0.78,
      hits12 = [];
    for (let i = 0; i < 12; i++) {
      const frac = 0.05 + (i / 11) * 0.9,
        tz = min.z + sz.z * frac;
      const org = new THREE.Vector3(max.x + MARGIN, ty, tz);
      _castRC.set(org, new THREE.Vector3(-1, 0, 0));
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
  const tx = min.x + sz.x * cfg.relXFrac,
    ty = min.y + sz.y * cfg.relY,
    tz = min.z + sz.z * cfg.relZFrac;
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
  pinGroup.userData.baseY = result.point.y;
  pinElapsed = 0;
  if (key === "day_tau") {
    pinGroup.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    pinGroup.position.y -= 0.24 * s;
  } else if (key === "thuong_tang") {
    const up = new THREE.Vector3(0, 1, 0),
      wn = result.normal.clone().normalize();
    if (Math.abs(wn.dot(up)) < 0.95)
      pinGroup.quaternion.copy(
        new THREE.Quaternion().setFromUnitVectors(up, wn),
      );
  } else {
    const up = new THREE.Vector3(0, 1, 0),
      dot = result.normal.dot(up);
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
// 5. ZONE HIGHLIGHT
// ═══════════════════════════════════════════════════════════
const origMaterialMap = new Map();
let activeHighlightKey = null,
  _hlMatsToDispose = [];

function initZoneMap() {
  meshes.forEach((mesh) => {
    origMaterialMap.set(
      mesh,
      Array.isArray(mesh.material) ? [...mesh.material] : mesh.material,
    );
  });
}

function makeZoneMat(origMat, yMin, yMax, hlColorHex, normalType, extraOpts) {
  extraOpts = extraOpts || {};
  const mat = origMat.clone();
  const hlCol = new THREE.Color(hlColorHex);
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.u_yMin = { value: yMin };
    shader.uniforms.u_yMax = { value: yMax };
    shader.uniforms.u_hlCol = { value: hlCol };
    shader.uniforms.u_normType = { value: normalType };
    shader.uniforms.u_cx = { value: extraOpts.cx ?? 0 };
    shader.uniforms.u_xw = { value: extraOpts.xw ?? 1 };
    shader.uniforms.u_bowZ = { value: extraOpts.bowZ ?? -9999 };
    shader.uniforms.u_sternZ = { value: extraOpts.sternZ ?? 9999 };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vWPos;\nvarying vec3 vWNorm;",
      )
      .replace(
        "#include <beginnormal_vertex>",
        "#include <beginnormal_vertex>\nvWNorm = normalize(mat3(modelMatrix) * objectNormal);",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3  vWPos;
        varying vec3  vWNorm;
        uniform float u_yMin;
        uniform float u_yMax;
        uniform vec3  u_hlCol;
        uniform float u_normType;
        uniform float u_cx;
        uniform float u_xw;
        uniform float u_bowZ;
        uniform float u_sternZ;`,
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        bool _inBand = (vWPos.y >= u_yMin && vWPos.y <= u_yMax);
        bool _normOk = true;
        if (u_normType > 1.5) {
          bool _normCond = (vWNorm.y < 0.18);
          float _relX = abs(vWPos.x - u_cx) / u_xw;
          bool _outerSkin = (_relX > 0.78);
          bool _atEnds    = (vWPos.z < u_bowZ || vWPos.z > u_sternZ);
          bool _posCond   = (_outerSkin || _atEnds);
          _normOk = _normCond && _posCond;
        } else if (u_normType > 0.5) {
          _normOk = (vWNorm.y > 0.25);
        }
        bool _inZone = _inBand && _normOk;
        if (_inZone) {
          gl_FragColor.rgb = mix(gl_FragColor.rgb, u_hlCol, 0.65) + u_hlCol * 0.45;
          gl_FragColor.rgb *= 1.25;
        } else {
          gl_FragColor.rgb *= 0.68;
        }`,
      );
  };
  mat.needsUpdate = true;
  return mat;
}

function clearHighlight() {
  activeHighlightKey = null;
  meshes.forEach((mesh) => {
    const orig = origMaterialMap.get(mesh);
    if (orig) mesh.material = Array.isArray(orig) ? [...orig] : orig;
  });
  _hlMatsToDispose.forEach((m) => m.dispose());
  _hlMatsToDispose = [];
}

function highlightZone(key) {
  if (!meshes.length || !shipBBox) return;
  clearHighlight();
  activeHighlightKey = key;
  const z = ZONES[key];
  if (!z || z.type === "interior") return;
  const shipH = shipBBox.max.y - shipBBox.min.y;
  const yMin = shipBBox.min.y + shipH * (z.relYMin ?? 0);
  const yMax = shipBBox.min.y + shipH * (z.relYMax ?? 1);
  const normalType = z.normalType ?? 0;
  let extraOpts = null;
  if (key === "man_kho") {
    const sz = shipBBox.getSize(new THREE.Vector3());
    const cx = (shipBBox.min.x + shipBBox.max.x) * 0.5;
    const xw = sz.x * 0.5;
    const bowZ = shipBBox.min.z + sz.z * 0.18;
    const sternZ = shipBBox.max.z - sz.z * 0.12;
    extraOpts = { cx, xw, bowZ, sternZ };
  }
  meshes.forEach((mesh) => {
    if (mesh.name.toLowerCase().includes("crane")) return;
    const orig = origMaterialMap.get(mesh);
    if (!orig) return;
    const apply = (m) => {
      const newM = makeZoneMat(m, yMin, yMax, z.color, normalType, extraOpts);
      _hlMatsToDispose.push(newM);
      return newM;
    };
    mesh.material = Array.isArray(orig) ? orig.map(apply) : apply(orig);
  });
}

// ═══════════════════════════════════════════════════════════
// 6. INFO PANEL + LEGEND + FLY-TO
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

const glowStyle = document.createElement("style");
glowStyle.textContent = `@keyframes diagramGlowPulse{0%,100%{box-shadow:0 0 0px 0px rgba(var(--glow-rgb),0);}50%{box-shadow:0 0 22px 8px rgba(var(--glow-rgb),0.65);}}
.diagram-glow-wrap{border-radius:6px;overflow:hidden;border:2px solid rgba(var(--glow-rgb),0.5);animation:diagramGlowPulse 1.8s ease-in-out infinite;position:relative;}
.diagram-glow-wrap::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(var(--glow-rgb),0.12) 0%,transparent 60%);pointer-events:none;}`;
document.head.appendChild(glowStyle);

const DIAGRAM_IMAGES = {
  ham_hang: "./images/ham-hang.png",
  he_thong_khung: "./images/khung-xuong-tau.png",
};
function hexRgb(h) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
}

function openInfoPanel(key) {
  // Merge 3D/geometry data with translated text
  const zBase = ZONES[key];
  const zText = getZoneText(key);
  const z = { ...zBase, ...zText };

  activeZoneKey = key;
  LEGEND_ORDER.forEach((k) => {
    const row = legendRows[k];
    row.style.background =
      k === key ? `rgba(${hexRgb(ZONES[k].color)},0.10)` : "transparent";
    row.style.borderLeft =
      k === key ? `3px solid ${ZONES[k].color}` : "3px solid transparent";
    row.querySelector(".legend-name").style.fontWeight =
      k === key ? "600" : "400";
  });

  const isInterior = zBase.type === "interior";
  const typeLabel = isInterior ? ui().typeInterior : ui().typeExterior;
  const typeDot = isInterior ? ui().dotInterior : ui().dotExterior;
  const rgb = hexRgb(zBase.color);

  const diagramHTML = isInterior
    ? `<div style="padding:14px 18px 4px;border-bottom:1px solid #eee"><div style="font-size:10px;font-weight:600;letter-spacing:1.2px;color:#8599aa;text-transform:uppercase;margin-bottom:8px">${ui().diagramLabel}</div><div class="diagram-glow-wrap" style="--glow-rgb:${rgb}"><img src="${DIAGRAM_IMAGES[key]}" alt="${z.name}" style="width:100%;display:block;object-fit:cover;max-height:180px;position:relative;z-index:1"/></div></div>`
    : "";

  infoPanel.innerHTML = `
    <div style="padding:16px 18px 14px;border-bottom:1px solid #eef0f3;position:relative">
      <button id="closePanel" style="position:absolute;top:14px;right:14px;background:none;border:1px solid #d4d8df;color:#8599aa;width:24px;height:24px;border-radius:4px;cursor:pointer;font-size:12px;line-height:22px;text-align:center;transition:all .15s;font-family:inherit" onmouseover="this.style.background='#f0f2f5';this.style.color='#0c1e35'" onmouseout="this.style.background='none';this.style.color='#8599aa'">✕</button>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:12px;height:12px;background:${zBase.color};border-radius:2px;display:inline-block;flex-shrink:0"></span><span style="font-size:10px;font-weight:600;letter-spacing:1px;color:#8599aa;text-transform:uppercase">${typeDot} ${typeLabel}</span></div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:#0c1e35;line-height:1.2">${z.name}</div>
    </div>${diagramHTML}
    <div style="padding:14px 18px;color:#4a6070;font-size:12.5px;line-height:1.8;border-bottom:1px solid #eef0f3">${z.description}</div>
    <div style="padding:14px 18px 18px">
      <div style="font-size:10px;font-weight:600;letter-spacing:1.2px;color:#8599aa;text-transform:uppercase;margin-bottom:12px">${ui().paintLabel}</div>
      ${z.paints.map((p, i) => `<div style="display:flex;gap:12px;margin-bottom:8px;padding:10px 12px;background:#f7f9fb;border-radius:6px;border-left:3px solid ${zBase.color}"><div style="flex-shrink:0;width:20px;height:20px;background:${zBase.color};border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;margin-top:2px">${i + 1}</div><div><div style="font-weight:600;color:#0c1e35;font-size:13px;margin-bottom:3px">${p.name}</div><div style="color:#8599aa;font-size:11.5px">${p.desc}</div></div></div>`).join("")}
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
  clearHighlight();
  controls.maxPolarAngle = Math.PI * 0.54;
  LEGEND_ORDER.forEach((k) => {
    legendRows[k].style.background = "transparent";
    legendRows[k].style.borderLeft = "3px solid transparent";
    legendRows[k].querySelector(".legend-name").style.fontWeight = "400";
  });
}

// ── LEGEND ─────────────────────────────────────────────────
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

const legendHeader = document.createElement("div");
Object.assign(legendHeader.style, {
  padding: "12px 16px 10px",
  borderBottom: "1px solid #eef0f3",
  background: "#fafbfc",
  position: "relative",
});
legendHeader.innerHTML = `
  <div data-legend-title style="font-size:10px;font-weight:600;letter-spacing:1.4px;color:#8599aa;text-transform:uppercase;margin-bottom:2px">${ui().legendTitle}</div>
  <div data-legend-subtitle style="font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:700;color:#0c1e35">${ui().legendSubtitle}</div>`;
legend.appendChild(legendHeader);

const legendBody = document.createElement("div");
Object.assign(legendBody.style, { padding: "8px 0" });
const legendRows = {};

LEGEND_ORDER.forEach((key) => {
  const z = ZONES[key];
  const zt = getZoneText(key);
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
  const isInt = z.type === "interior";
  row.innerHTML = `
    <span style="flex-shrink:0;width:10px;height:10px;background:${z.color};border-radius:2px"></span>
    <span class="legend-name" style="font-size:12.5px;flex:1;color:#1a2b3c;font-weight:400">${zt.name}</span>
    <span class="legend-tag" style="font-size:9px;font-weight:600;letter-spacing:.6px;color:#8599aa;background:#f0f2f5;padding:1px 5px;border-radius:3px;white-space:nowrap;flex-shrink:0">${isInt ? ui().tagInterior : ui().tagExterior}</span>`;
  row.addEventListener("click", () => {
    if (activeZoneKey === key) {
      closeInfoPanel();
      return;
    }
    if (z.type === "exterior") placePin(key, meshes);
    else removePin();
    highlightZone(key);
    flyToZone(key);
    openInfoPanel(key);
  });
  legendBody.appendChild(row);
  legendRows[key] = row;
});
legend.appendChild(legendBody);
document.body.appendChild(legend);

// ── HINT ───────────────────────────────────────────────────
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
hint.textContent = ui().hintLoading;
document.body.appendChild(hint);

// ── LANGUAGE TOGGLE BUTTON ─────────────────────────────────
const langToggle = document.createElement("button");
Object.assign(langToggle.style, {
  position: "absolute",
  top: "10px",
  right: "10px",
  zIndex: "1001",
  background: "transparent",
  border: "1px solid rgba(12,30,53,0.18)",
  color: "#8599aa",
  borderRadius: "4px",
  padding: "3px 9px",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "1.2px",
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  transition: "background .18s, color .18s",
  userSelect: "none",
  display: "flex",
  alignItems: "center",
  gap: "4px",
});
langToggle.innerHTML = `<span style="font-size:13px;line-height:1">🌐</span><span id="langLabel">${ui().toggleBtn}</span>`;
langToggle.addEventListener("mouseenter", () => {
  langToggle.style.background = "rgba(12,30,53,0.07)";
  langToggle.style.color = "#0c1e35";
});
langToggle.addEventListener("mouseleave", () => {
  langToggle.style.background = "transparent";
  langToggle.style.color = "#8599aa";
});
langToggle.addEventListener("click", toggleLanguage);
legendHeader.appendChild(langToggle);

// ── LANGUAGE FUNCTIONS ──────────────────────────────────────
function toggleLanguage() {
  currentLang = currentLang === "vi" ? "en" : "vi";
  document.getElementById("langLabel").textContent = ui().toggleBtn;
  updateStaticUI();
  updateLegendText();
  // Re-render info panel in new language if open
  if (activeZoneKey) openInfoPanel(activeZoneKey);
}

function updateStaticUI() {
  // Update header bar texts
  const headerTitle = document.querySelector("#header-bar .header-title");
  const headerSub = document.querySelector("#header-bar .header-sub");
  if (headerTitle) headerTitle.textContent = ui().headerTitle;
  if (headerSub) headerSub.textContent = ui().headerSub;
  // Update hint (only if model is loaded)
  if (shipBBox) hint.textContent = ui().hintReady;
}

function updateLegendText() {
  // Update legend header
  const ltEl = legendHeader.querySelector("[data-legend-title]");
  const lsEl = legendHeader.querySelector("[data-legend-subtitle]");
  if (ltEl) ltEl.textContent = ui().legendTitle;
  if (lsEl) lsEl.textContent = ui().legendSubtitle;
  // Update each row
  LEGEND_ORDER.forEach((key) => {
    const row = legendRows[key];
    const nameEl = row.querySelector(".legend-name");
    const tagEl = row.querySelector(".legend-tag");
    if (nameEl) nameEl.textContent = getZoneText(key).name;
    if (tagEl)
      tagEl.textContent =
        ZONES[key].type === "interior" ? ui().tagInterior : ui().tagExterior;
  });
}

// ── FLY-TO ─────────────────────────────────────────────────
let flyTarget = null,
  flyT = 1;
const FLY_SPEED = 0.032,
  _sp = new THREE.Vector3(),
  _sl = new THREE.Vector3(),
  _tl = new THREE.Vector3();

function flyToZone(key) {
  if (!shipBBox) return;
  const z = ZONES[key],
    sz = shipBBox.getSize(new THREE.Vector3()),
    cen = shipBBox.getCenter(new THREE.Vector3());
  const ty = shipBBox.min.y + sz.y * z.viewRelY;
  let lookZ = cen.z,
    az = z.viewAzimuth;
  if (key === "thuong_tang") {
    const frac = ZONES.thuong_tang._resolvedZFrac ?? 0.15;
    lookZ = shipBBox.min.z + sz.z * frac;
    az = frac > 0.5 ? Math.PI * 1.78 : Math.PI * 0.22;
  }
  const look = new THREE.Vector3(cen.x, ty, lookZ),
    pol = z.viewPolar,
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
// 7. TẢI MODEL
// ═══════════════════════════════════════════════════════════
const raycaster = new THREE.Raycaster(),
  mouse = new THREE.Vector2();
let meshes = [],
  shipBBox = null;

new GLTFLoader().load(
  "./models/model-ship-3d-backup.glb",
  (gltf) => {
    const model = gltf.scene;
    const raw = new THREE.Box3().setFromObject(model);
    const cen = raw.getCenter(new THREE.Vector3()),
      sz = raw.getSize(new THREE.Vector3());
    const s = 20 / Math.max(sz.x, sz.y, sz.z);
    model.scale.setScalar(s);
    model.position.set(-cen.x * s, -raw.min.y * s, -cen.z * s);
    scene.add(model);
    model.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = c.receiveShadow = true;
        meshes.push(c);
      }
    });
    shipBBox = new THREE.Box3().setFromObject(model);
    initZoneMap();
    const mid = shipBBox.min.y + (shipBBox.max.y - shipBBox.min.y) * 0.45;
    controls.target.set(0, mid, 0);
    camera.position.set(28, mid + 8, 36);
    controls.update();
    hint.textContent = ui().hintReady;
  },
  (xhr) => {
    const p = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : "...";
    hint.textContent = ui().hintLoadingPct(p);
  },
  (err) => {
    console.error("❌", err);
    hint.textContent = ui().loadError;
    hint.style.color = "#ff6b6b";
  },
);

// ═══════════════════════════════════════════════════════════
// 8. EVENTS
// ═══════════════════════════════════════════════════════════
window.addEventListener("mousemove", (e) => {
  if (!meshes.length || !shipBBox) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  renderer.domElement.style.cursor = raycaster.intersectObjects(meshes, false)
    .length
    ? "crosshair"
    : "grab";
});
renderer.domElement.addEventListener("click", (e) => {
  if (!meshes.length || !shipBBox) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  if (!raycaster.intersectObjects(meshes, false).length) closeInfoPanel();
});
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
  if (flyTarget && flyT < 1) {
    flyT = Math.min(1, flyT + FLY_SPEED);
    const t = ease(flyT);
    camera.position.lerpVectors(_sp, flyTarget.pos, t);
    _tl.lerpVectors(_sl, flyTarget.look, t);
    controls.target.copy(_tl);
    if (flyT >= 1) flyTarget = null;
  }
  if (pinGroup) {
    const baseY = pinGroup.userData.baseY ?? 0,
      rawSin = Math.sin(pinElapsed * BOB_FREQ);
    const bobVal =
      rawSin > 0
        ? Math.pow(rawSin, 0.65) * BOB_AMP
        : -Math.pow(-rawSin, 1.55) * BOB_AMP * 0.7;
    pinGroup.position.y = baseY + bobVal;
    const oA = pinGroup.userData.orbitA,
      oB = pinGroup.userData.orbitB;
    if (oA) oA.rotation.y += oA.userData.spinY * dt;
    if (oB) oB.rotation.y += oB.userData.spinY * dt;
    const gl = pinGroup.userData.glowLight;
    if (gl) gl.intensity = 1.0 + (bobVal / BOB_AMP) * 0.55;
    const rings = pinGroup.userData.pulseRings;
    if (rings) {
      const s = rings[0]?.userData.pScale ?? 1;
      rings.forEach((ring) => {
        const tt =
          ((pinElapsed + ring.userData.phase) % PULSE_PERIOD) / PULSE_PERIOD;
        const r = (0.18 + tt * (PULSE_MAX_R - 0.18)) * s;
        ring.scale.set(r, r, 1);
        const op =
          tt < 0.25 ? (tt / 0.25) * 0.65 : 0.65 * (1 - (tt - 0.25) / 0.75);
        ring.material.opacity = op;
      });
    }
  }
  controls.update();
  renderer.render(scene, camera);
})();
