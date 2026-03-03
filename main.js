import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ============================================================
// 1. DỮ LIỆU VÙNG TÀU
// ============================================================
const ZONES = {
  day_tau: {
    key: "day_tau",
    name: "Đáy Tàu",
    color: "#1a2a3a",
    description:
      "Phần luôn ngập trong nước của tàu, chịu sự tấn công của rất nhiều tác nhân ăn mòn trong những điều kiện khắc nghiệt.",
    paints: ["Sơn Epoxy chuyên dụng", "Sơn Coal tar Epoxy", "Sơn Chống hà"],
  },
  man_uot: {
    key: "man_uot",
    name: "Mạn Ướt",
    color: "#1565c0",
    description:
      "Phần vỏ tàu thường xuyên ngập trong môi trường nước khi tàu có tải. Cần hệ thống các lớp sơn chuyên dụng chống ăn mòn chất lượng cao.",
    paints: ["Sơn Epoxy chuyên dụng", "Sơn Coal tar Epoxy"],
  },
  man_kho: {
    key: "man_kho",
    name: "Mạn Khô",
    color: "#c62828",
    description:
      "Vị trí thuộc vỏ tàu ít tiếp xúc với nước, tiếp xúc thường xuyên hơn với ánh nắng. Lựa chọn sơn chú ý đến khả năng giữ màu và chống ăn mòn.",
    paints: ["Sơn Epoxy chuyên dụng", "Sơn Polyurethane"],
  },
  mat_boong: {
    key: "mat_boong",
    name: "Mặt Boong, Lối Đi",
    color: "#2e7d32",
    description:
      "Các vị trí đi lại, di chuyển, không ngập nước, tiếp xúc thường xuyên với ánh nắng, mưa bão.",
    paints: ["Sơn Epoxy", "Sơn Polyurethane", "Sơn PU 1K"],
  },
  ham_hang: {
    key: "ham_hang",
    name: "Hầm Hàng",
    color: "#7b1fa2",
    description:
      "Khu vực chứa hàng của tàu. Các giải pháp chống ăn mòn dựa trên điều kiện và tính chất của hàng hóa mà tàu vận chuyển.",
    paints: [
      "Sơn Epoxy chuyên dụng",
      "Sơn Alkyd",
      "Sơn Polyurethane",
      "Sơn Cao su clo hóa",
    ],
  },
  he_thong_khung: {
    key: "he_thong_khung",
    name: "Hệ Thống Khung Xương",
    color: "#e65100",
    description:
      "Khu vực chịu lực cho tàu, phân bố đều trong thân tàu, không tiếp xúc trực tiếp với nước nhưng dễ phát sinh hơi ẩm.",
    paints: ["Sơn Epoxy chuyên dụng", "Sơn Coaltar Epoxy", "Sơn Alkyd"],
  },
  thuong_tang: {
    key: "thuong_tang",
    name: "Thượng Tầng / Cabin",
    color: "#546e7a",
    description:
      "Khu vực thượng tầng tàu, bao gồm cabin và các công trình trên boong, tiếp xúc nhiều với thời tiết, ánh nắng và mưa bão.",
    paints: ["Sơn Epoxy chuyên dụng", "Sơn Polyurethane", "Sơn PU 1K"],
  },
};

// --- Nhận diện qua tên mesh ---
// Keyword → zone key  (thêm nhiều từ khóa liên quan container & khung)
const NAME_MAP = [
  // Đáy tàu
  [["bottom", "keel", "bilge", "day_tau", "hull_bot", "base_hull"], "day_tau"],
  // Mạn ướt
  [["wet", "waterline", "man_uot", "boot", "antifoul"], "man_uot"],
  // Mạn khô
  [
    ["freeboard", "man_kho", "dryside", "hull_side", "hull_top", "topside"],
    "man_kho",
  ],
  // Mặt boong
  [
    [
      "deck",
      "boong",
      "walkway",
      "catwalk",
      "grating",
      "platform",
      "hatch_cover",
      "hatcover",
      "walkplate",
    ],
    "mat_boong",
  ],
  // Hầm hàng — container + hatch + hold
  [
    [
      "container",
      "box",
      "cargo",
      "hold",
      "hatch",
      "khoang",
      "ham_",
      "coaming",
      "crate",
      "teu",
    ],
    "ham_hang",
  ],
  // Khung xương
  [
    [
      "frame",
      "rib",
      "stringer",
      "girder",
      "beam",
      "bracket",
      "bulkhead",
      "web",
      "floor_plate",
      "longit",
      "transv",
      "khung",
      "suon",
      "tuong",
      "vach",
      "sườn",
      "xương",
      "truss",
      "structural",
    ],
    "he_thong_khung",
  ],
  // Thượng tầng
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
    ],
    "thuong_tang",
  ],
];

function getZoneByMeshName(name) {
  if (!name) return null;
  const low = name.toLowerCase();
  for (const [keywords, key] of NAME_MAP) {
    if (keywords.some((kw) => low.includes(kw))) return ZONES[key];
  }
  return null;
}

// --- Nhận diện qua vật lý: normal + tọa độ Y ---
//
// LOGIC CHÍNH:
//   • face normal hướng lên (y > 0.65)  → bề mặt nằm ngang (boong hoặc đáy)
//   • face normal hướng xuống (y < -0.5) → đáy tàu (dưới)
//   • face normal ngang (|y| < 0.55)    → bề mặt đứng → mạn tàu (dùng relY)
//
function getZoneByPhysics(worldNormal, relY) {
  const ny = worldNormal.y;

  // Bề mặt nằm ngang NHÌN LÊN → boong hoặc phần trên
  if (ny > 0.65) {
    if (relY < 0.12) return ZONES["day_tau"]; // mặt dưới đáy
    if (relY < 0.58) return ZONES["mat_boong"]; // boong thấp (tank top, inner deck)
    return ZONES["mat_boong"]; // boong chính
  }

  // Bề mặt nhìn XUỐNG → đáy hoặc mặt dưới sàn
  if (ny < -0.5) {
    if (relY < 0.15) return ZONES["day_tau"];
    return ZONES["mat_boong"]; // mặt dưới sàn khoang
  }

  // Bề mặt ĐỨNG / NGHIÊNG → mạn tàu → phân tầng theo Y
  if (relY < 0.18) return ZONES["day_tau"];
  if (relY < 0.36) return ZONES["man_uot"];
  if (relY < 0.58) return ZONES["man_kho"];
  if (relY < 0.74) return ZONES["mat_boong"]; // cạnh thẳng đứng của boong/hatch
  return ZONES["thuong_tang"];
}

// ============================================================
// 2. SCENE / CAMERA / RENDERER
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5c9cbf);
scene.fog = new THREE.FogExp2(0x5c9cbf, 0.006);

const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  600,
);
camera.position.set(24, 12, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4;
controls.maxDistance = 100;
controls.maxPolarAngle = Math.PI * 0.51;

// ============================================================
// 3. ÁNH SÁNG
// ============================================================
scene.add(new THREE.AmbientLight(0xfff0dd, 0.8));

const sun = new THREE.DirectionalLight(0xfff5e0, 1.7);
sun.position.set(30, 50, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -40,
  right: 40,
  top: 40,
  bottom: -40,
  far: 150,
});
scene.add(sun);
scene.add(new THREE.HemisphereLight(0x87ceeb, 0x1a4a6e, 0.5));

// ============================================================
// 4. MẶT NƯỚC
// ============================================================
const waterMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({
    color: 0x1565c0,
    transparent: true,
    opacity: 0.76,
    roughness: 0.06,
    metalness: 0.15,
  }),
);
waterMesh.rotation.x = -Math.PI / 2;
waterMesh.receiveShadow = true;
scene.add(waterMesh);
let baseWaterY = 0;

// ============================================================
// 5. UI — TOOLTIP + LEGEND + HINT
// ============================================================
const tooltip = document.getElementById("tooltip");
Object.assign(tooltip.style, {
  position: "fixed",
  pointerEvents: "none",
  display: "none",
  background: "rgba(5,12,26,0.94)",
  color: "#f0f4ff",
  padding: "14px 18px",
  borderRadius: "10px",
  maxWidth: "305px",
  fontSize: "13px",
  lineHeight: "1.65",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(100,170,255,0.22)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  zIndex: "1000",
});

// Legend — thứ tự hiển thị
const LEGEND_ORDER = [
  "day_tau",
  "man_uot",
  "man_kho",
  "mat_boong",
  "ham_hang",
  "he_thong_khung",
  "thuong_tang",
];

const legend = document.createElement("div");
Object.assign(legend.style, {
  position: "fixed",
  top: "16px",
  left: "16px",
  background: "rgba(5,12,26,0.9)",
  color: "#e8f0fe",
  padding: "14px 18px",
  borderRadius: "10px",
  fontSize: "12px",
  lineHeight: "2.1",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(100,170,255,0.18)",
  zIndex: "999",
});
legend.innerHTML =
  `<strong style="font-size:13px;color:#7ec8e3">🚢 Bản đồ vị trí tàu</strong><br><br>` +
  LEGEND_ORDER.map((k) => {
    const z = ZONES[k];
    return `<span style="display:inline-block;width:12px;height:12px;background:${z.color};
      border-radius:2px;margin-right:7px;vertical-align:middle;
      border:1px solid rgba(255,255,255,0.3)"></span>${z.name}`;
  }).join("<br>");
document.body.appendChild(legend);

const hint = document.createElement("div");
Object.assign(hint.style, {
  position: "fixed",
  bottom: "16px",
  left: "50%",
  transform: "translateX(-50%)",
  background: "rgba(5,12,26,0.8)",
  color: "#90b8d8",
  padding: "8px 22px",
  borderRadius: "20px",
  fontSize: "12px",
  zIndex: "999",
  whiteSpace: "nowrap",
});
hint.textContent =
  "🖱 Di chuột lên tàu để xem thông tin sơn  •  Kéo để xoay  •  Cuộn để zoom";
document.body.appendChild(hint);

// ============================================================
// 6. TẢI MODEL
// ============================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let meshes = []; // tất cả Mesh trong model
let shipBBox = null;
let lastMesh = null,
  lastMat = null;

// Ma trận pháp tuyến tạm dùng lại
const _normalMatrix = new THREE.Matrix3();
const _worldNormal = new THREE.Vector3();

new GLTFLoader().load(
  "./models/a_full_container_ship.glb",

  (gltf) => {
    const model = gltf.scene;

    // Scale & center
    const raw = new THREE.Box3().setFromObject(model);
    const center = raw.getCenter(new THREE.Vector3());
    const size = raw.getSize(new THREE.Vector3());
    const scale = 20 / Math.max(size.x, size.y, size.z);

    model.scale.setScalar(scale);
    model.position.x = -center.x * scale;
    model.position.z = -center.z * scale;
    model.position.y = -raw.min.y * scale; // đáy tàu = y:0

    scene.add(model);
    model.traverse((c) => {
      if (!c.isMesh) return;
      c.castShadow = c.receiveShadow = true;
      meshes.push(c);
    });

    shipBBox = new THREE.Box3().setFromObject(model);
    const shipH = shipBBox.max.y - shipBBox.min.y;

    // Mực nước ≈ 22% chiều cao tàu
    baseWaterY = shipBBox.min.y + shipH * 0.22;
    waterMesh.position.y = baseWaterY;

    // Đặt camera nhìn vào giữa thân
    const midY = shipBBox.min.y + shipH * 0.45;
    controls.target.set(0, midY, 0);
    camera.position.set(24, midY + 7, 32);
    controls.update();

    hint.textContent =
      "🖱 Di chuột lên tàu để xem thông tin sơn  •  Kéo để xoay  •  Cuộn để zoom";

    // Debug: in tên mesh để dễ tuning
    const names = [
      ...new Set(meshes.map((m) => m.name).filter(Boolean)),
    ].sort();
    console.log("=== MESH NAMES ===\n" + names.join("\n"));
    console.log("BBox:", shipBBox, "| waterY:", baseWaterY.toFixed(2));
  },

  (xhr) => {
    const p = xhr.total ? Math.round((xhr.loaded / xhr.total) * 100) : "...";
    hint.textContent = `⏳ Đang tải mô hình... ${p}%`;
  },

  (err) => {
    console.error("❌", err);
    hint.textContent = "❌ Lỗi tải model — kiểm tra tên file GLB";
    hint.style.color = "#ff6b6b";
  },
);

// ============================================================
// 7. RAYCASTING — DÙNG FACE NORMAL ĐỂ PHÂN BIỆT BOONG vs MẠN
// ============================================================
function detectZone(mesh, point, face) {
  // --- Ưu tiên 1: nhận diện qua tên mesh ---
  const byName = getZoneByMeshName(mesh.name);
  if (byName) return byName;

  if (!shipBBox) return ZONES["man_kho"];

  // --- Ưu tiên 2: dùng face normal + tọa độ Y ---
  const relY = Math.max(
    0,
    Math.min(1, (point.y - shipBBox.min.y) / (shipBBox.max.y - shipBBox.min.y)),
  );

  // Chuyển face normal sang world space
  _normalMatrix.getNormalMatrix(mesh.matrixWorld);
  _worldNormal.copy(face.normal).applyMatrix3(_normalMatrix).normalize();

  return getZoneByPhysics(_worldNormal, relY);
}

function buildTooltipHTML(zone) {
  return `
    <div style="font-size:15px;font-weight:700;margin-bottom:8px;
      color:#7ec8e3;display:flex;align-items:center;gap:8px">
      <span style="display:inline-block;width:14px;height:14px;flex-shrink:0;
        background:${zone.color};border-radius:3px;
        border:1px solid rgba(255,255,255,0.35)"></span>
      ${zone.name}
    </div>
    <div style="margin-bottom:10px;color:#afc8e0;font-size:12px;line-height:1.65">
      ${zone.description}
    </div>
    <div style="border-top:1px solid rgba(100,170,255,0.2);padding-top:9px">
      <div style="font-size:11px;font-weight:600;color:#7ec8e3;
        letter-spacing:.4px;margin-bottom:5px">🎨 DÒNG SƠN ĐỀ NGHỊ:</div>
      ${zone.paints
        .map(
          (p) =>
            `<div style="padding:2px 0;font-size:12px;font-weight:600;color:#f0e080">• ${p}</div>`,
        )
        .join("")}
    </div>`;
}

function positionTooltip(x, y) {
  tooltip.style.display = "block";
  const tw = 318,
    th = tooltip.offsetHeight || 190;
  tooltip.style.left = (x + 22 + tw > innerWidth ? x - tw - 12 : x + 22) + "px";
  tooltip.style.top = (y + 22 + th > innerHeight ? y - th - 12 : y + 22) + "px";
}

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

  // intersectObjects với recursive=true để bắt cả object con
  const hits = raycaster.intersectObjects(meshes, false);

  if (hits.length) {
    const { object: mesh, point, face } = hits[0];
    if (!face) return; // geometry không có face (PointCloud…)

    const zone = detectZone(mesh, point, face);

    // Highlight mesh đang hover
    if (mesh !== lastMesh) {
      restoreMesh();
      lastMesh = mesh;
      lastMat = mesh.material;
      mesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(zone.color),
        emissive: new THREE.Color(zone.color),
        emissiveIntensity: 0.55,
        transparent: true,
        opacity: 0.88,
        roughness: 0.3,
        metalness: 0.1,
      });
    }

    tooltip.innerHTML = buildTooltipHTML(zone);
    positionTooltip(e.clientX, e.clientY);
    renderer.domElement.style.cursor = "crosshair";
  } else {
    restoreMesh();
    tooltip.style.display = "none";
    renderer.domElement.style.cursor = "grab";
  }
});

renderer.domElement.addEventListener("mouseleave", () => {
  restoreMesh();
  tooltip.style.display = "none";
});

// ============================================================
// 8. RESIZE & ANIMATE
// ============================================================
window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
(function loop() {
  requestAnimationFrame(loop);
  waterMesh.position.y =
    baseWaterY + Math.sin(clock.getElapsedTime() * 0.85) * 0.05;
  controls.update();
  renderer.render(scene, camera);
})();
