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
      viewProduct: "Xem sản phẩm",
      viewProductArrow: "→",
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
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-epoxy&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Coal tar Epoxy",
            desc: "Chống thấm, chịu hóa chất, bền trong môi trường biển",
            link: "#",
          },
          {
            name: "Sơn Chống hà",
            desc: "Ngăn cản sinh vật biển bám vào vỏ tàu",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-chong-ha&query_type_dong-san-pham=or",
          },
        ],
      },
      man_uot: {
        name: "Mớn nước thay đổi",
        description:
          "Phần vỏ tàu thường xuyên ngập trong môi trường nước khi tàu có tải. Các vị trí này cần được bảo vệ bởi hệ thống các lớp sơn chuyên dụng chống ăn mòn chất lượng cao.",
        paints: [
          {
            name: "Sơn Epoxy chuyên dụng",
            desc: "Tạo lớp bảo vệ bền vững trong môi trường nước mặn",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-epoxy&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Coal tar Epoxy",
            desc: "Kháng nước và hóa chất cực tốt, tuổi thọ cao",
            link: "#",
          },
        ],
      },
      man_kho: {
        name: "Mạn Khô và be chắn sóng",
        description:
          "Vị trí thuộc vỏ tàu ít tiếp xúc với nước, tiếp xúc thường xuyên hơn với ánh nắng. Lựa chọn hệ sơn cần giữ màu tốt và chống ăn mòn hiệu quả.",
        paints: [
          {
            name: "Sơn Epoxy chuyên dụng",
            desc: "Chống ăn mòn hiệu quả, nền tốt cho lớp phủ ngoài",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-epoxy&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Polyurethane",
            desc: "Giữ màu lâu, bóng đẹp, chịu tia UV tốt",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-polyurethane&query_type_dong-san-pham=or",
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
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-epoxy&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Polyurethane",
            desc: "Đàn hồi, chịu va đập và thay đổi nhiệt độ",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-polyurethane&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn PU 1K",
            desc: "Dễ thi công, khô nhanh, thích hợp bảo trì định kỳ",
            link: "#",
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
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-epoxy&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Alkyd",
            desc: "Phù hợp hầm hàng khô, chi phí hợp lý",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-alkyd&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Polyurethane",
            desc: "Bền, chống hóa chất cho hàng hóa đặc biệt",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-polyurethane&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Cao su clo hóa",
            desc: "Kháng hóa chất mạnh, phù hợp hàng hóa ăn mòn",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-caosu-clo-hoa&query_type_dong-san-pham=or",
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
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-epoxy&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Coaltar Epoxy",
            desc: "Chống ẩm, chống thấm tuyệt vời cho kết cấu nội thất",
            link: "#",
          },
          {
            name: "Sơn Alkyd",
            desc: "Lớp phủ hoàn thiện bảo vệ và thẩm mỹ",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-alkyd&query_type_dong-san-pham=or",
          },
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
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-epoxy&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Polyurethane",
            desc: "Màu sắc đẹp, giữ màu lâu, chịu thời tiết khắc nghiệt",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-polyurethane&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn PU 1K",
            desc: "Hoàn thiện nhanh, bóng đẹp cho khu vực cabin",
            link: "#",
          },
        ],
      },
    },
    // ── MỚI: Sub-zones cho Đáy Tàu ────────────────────────
    sub_zones: {
      day_tau_bang: {
        name: "Đáy Bằng",
        description:
          "Phần tấm đáy phẳng nằm ngang của tàu, vuông góc với phương thẳng đứng. Đây là khu vực chịu áp lực nước trực tiếp và thường là điểm tích tụ của cặn bẩn, rong rêu biển. Cần hệ sơn có khả năng chống thấm và chống hà mạnh nhất.",
        paints: [
          {
            name: "Sơn Epoxy chuyên dụng",
            desc: "Lớp lót chống ăn mòn tối ưu cho đáy phẳng ngập nước",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-epoxy&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Coal tar Epoxy",
            desc: "Chống thấm, bền bỉ vượt trội trong môi trường biển mặn",
            link: "#",
          },
          {
            name: "Sơn Chống hà cường độ cao",
            desc: "Chuyên dụng cho đáy bằng — vùng bám sinh vật nhiều nhất",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-chong-ha&query_type_dong-san-pham=or",
          },
        ],
      },
      day_tau_xien: {
        name: "Đáy Xiên",
        description:
          "Phần vỏ cong/xiên nối tiếp giữa đáy bằng và mạn tàu (vùng bilge). Khu vực này chịu ứng suất cơ học phức tạp và tiếp xúc xen kẽ giữa môi trường ngập nước và vùng không ổn định, đòi hỏi hệ sơn có độ bám dính và độ đàn hồi cao.",
        paints: [
          {
            name: "Sơn Epoxy chuyên dụng",
            desc: "Bám dính tốt trên bề mặt cong, chống ăn mòn hiệu quả",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-epoxy&query_type_dong-san-pham=or",
          },
          {
            name: "Sơn Coal tar Epoxy",
            desc: "Chịu uốn, chịu ứng suất tốt cho vùng bilge phức tạp",
            link: "#",
          },
          {
            name: "Sơn Chống hà",
            desc: "Bảo vệ vùng chuyển tiếp, ngăn sinh vật bám tích tụ",
            link: "https://haivan.terax.dev/san-pham/?filter_dong-san-pham=son-chong-ha&query_type_dong-san-pham=or",
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
      viewProduct: "View Product",
      viewProductArrow: "→",
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
            link: "#",
          },
          {
            name: "Coal Tar Epoxy Paint",
            desc: "Waterproof, chemical-resistant, durable in marine environments",
            link: "#",
          },
          {
            name: "Anti-fouling Paint",
            desc: "Prevents marine organisms from attaching to the hull",
            link: "#",
          },
        ],
      },
      man_uot: {
        name: "Boot Top",
        description:
          "Hull area regularly submerged when the vessel is loaded. These positions require high-quality specialized anti-corrosion coating systems for sustained protection.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Creates a durable protective layer in saltwater environments",
            link: "#",
          },
          {
            name: "Coal Tar Epoxy Paint",
            desc: "Excellent water and chemical resistance with long service life",
            link: "#",
          },
        ],
      },
      man_kho: {
        name: "Top Side",
        description:
          "Hull area rarely in contact with water, more frequently exposed to sunlight. The selected coating system must maintain good color retention and effective corrosion protection.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Effective corrosion protection, excellent base for topcoats",
            link: "#",
          },
          {
            name: "Polyurethane Paint",
            desc: "Long-lasting color, high gloss finish, good UV resistance",
            link: "#",
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
            link: "#",
          },
          {
            name: "Polyurethane Paint",
            desc: "Elastic, resistant to impact and temperature changes",
            link: "#",
          },
          {
            name: "1K PU Paint",
            desc: "Easy application, fast drying, suitable for periodic maintenance",
            link: "#",
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
            link: "#",
          },
          {
            name: "Alkyd Paint",
            desc: "Suitable for dry cargo holds, cost-effective solution",
            link: "#",
          },
          {
            name: "Polyurethane Paint",
            desc: "Durable, chemical-resistant for special cargo",
            link: "#",
          },
          {
            name: "Chlorinated Rubber Paint",
            desc: "Strong chemical resistance, suitable for corrosive cargo",
            link: "#",
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
            link: "#",
          },
          {
            name: "Coaltar Epoxy Paint",
            desc: "Excellent moisture and waterproofing for interior structures",
            link: "#",
          },
          {
            name: "Alkyd Paint",
            desc: "Finishing coat for protection and aesthetic appeal",
            link: "#",
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
            link: "#",
          },
          {
            name: "Polyurethane Paint",
            desc: "Beautiful colors, long-lasting finish, resistant to harsh weather",
            link: "#",
          },
          {
            name: "1K PU Paint",
            desc: "Fast finishing, high gloss for cabin areas",
            link: "#",
          },
        ],
      },
    },
    // ── NEW: Sub-zones for Ship Bottom ─────────────────────
    sub_zones: {
      day_tau_bang: {
        name: "Flat Bottom",
        description:
          "The horizontal flat plate section of the ship's bottom, perpendicular to the vertical axis. This area bears direct water pressure and is a primary accumulation point for marine fouling organisms. It requires the strongest waterproofing and anti-fouling coating system.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Optimal anti-corrosion primer for flat submerged bottom plating",
            link: "#",
          },
          {
            name: "Coal Tar Epoxy Paint",
            desc: "Superior waterproofing and durability in marine saltwater",
            link: "#",
          },
          {
            name: "High-Strength Anti-fouling Paint",
            desc: "Specialized for flat bottom — highest marine organism attachment area",
            link: "#",
          },
        ],
      },
      day_tau_xien: {
        name: "Vertical Side Bottom",
        description:
          "The curved/sloped shell plate connecting the flat bottom to the ship's side (bilge area). This zone experiences complex mechanical stresses and alternating wet/dry exposure, requiring coatings with high adhesion and flexibility.",
        paints: [
          {
            name: "Specialized Epoxy Paint",
            desc: "Strong adhesion on curved surfaces, effective corrosion protection",
            link: "#",
          },
          {
            name: "Coal Tar Epoxy Paint",
            desc: "Flexible, stress-resistant coating for the complex bilge region",
            link: "#",
          },
          {
            name: "Anti-fouling Paint",
            desc: "Protects the transition zone from marine organism accumulation",
            link: "#",
          },
        ],
      },
    },
  },
};

// Helpers
const ui = () => T[currentLang].ui;
const getZoneText = (key) => T[currentLang].zones[key];
const getSubZoneText = (key) => T[currentLang].sub_zones[key]; // ── MỚI

// ═══════════════════════════════════════════════════════════
// 1. DỮ LIỆU VÙNG TÀU
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

// ── MỚI: Sub-zones cho Đáy Tàu ─────────────────────────────
// Chia theo dải Y thực tế thay vì filter normal để tránh lem nhem:
//   day_tau_bang : 0% → 8%  chiều cao tàu  (tấm đáy phẳng)
//   day_tau_xien : 8% → 19% chiều cao tàu  (bilge / đáy cong chuyển tiếp)
const SUB_ZONES = {
  day_tau_bang: {
    parent: "day_tau",
    color: "#00897b", // Teal xanh lá biển
    type: "exterior",
    relYMin: 0.0,
    relYMax: 0.08, // Chỉ dải thấp nhất — đáy phẳng sạch
    normalType: 0, // Không filter normal → phủ màu đồng đều
    pinCast: { from: "below", relY: 0.01, relXFrac: 0.5, relZFrac: 0.5 },
    viewRelY: 0.02,
    viewDist: 18,
    viewAzimuth: Math.PI * 0.45,
    viewPolar: 2.15,
  },
  day_tau_xien: {
    parent: "day_tau",
    color: "#f57c00", // Cam hổ phách — phân biệt rõ với mạn ướt
    type: "exterior",
    relYMin: 0.08, // Bắt đầu ngay trên đáy bằng
    relYMax: 0.19, // Đến hết vùng đáy tàu
    normalType: 0, // Không filter normal → phủ màu đồng đều
    pinCast: { from: "side_right", relY: 0.13, relXFrac: 1.0, relZFrac: 0.42 },
    viewRelY: 0.13,
    viewDist: 22,
    viewAzimuth: Math.PI * 0.55,
    viewPolar: 1.95,
  },
};

// Helper: lấy zone data (ZONES hoặc SUB_ZONES)
const getAnyZone = (key) => ZONES[key] || SUB_ZONES[key];

const LEGEND_ORDER = [
  "day_tau",
  "man_uot",
  "man_kho",
  "mat_boong",
  "ham_hang",
  "he_thong_khung",
  "thuong_tang",
];

const SUB_ZONE_ORDER = ["day_tau_bang", "day_tau_xien"];

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
  // Hỗ trợ cả ZONES và SUB_ZONES
  const z = ZONES[key] || SUB_ZONES[key];
  if (!z || z.type !== "exterior" || !shipBBox || !z.pinCast) return;
  // Scale pin: day_tau parent lớn hơn, sub-zones nhỏ hơn
  const s = key === "day_tau" ? 3.5 : key in SUB_ZONES ? 2.2 : 1.0;
  const result = castToSurface(z.pinCast, shipBBox, meshList);
  pinGroup = buildPin(z.color, s);
  pinGroup.position.copy(result.point);
  pinGroup.userData.baseY = result.point.y;
  pinElapsed = 0;
  if (key === "day_tau" || key === "day_tau_bang") {
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

// ── MỚI: shader hỗ trợ normalType 3 (đáy bằng) & 4 (đáy xiên) ──
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
        if (u_normType > 3.5) {
          // Type 4: Đáy Xiên (Bilge) — normal xiên góc, không thẳng đứng
          _normOk = (vWNorm.y >= -0.68 && vWNorm.y < 0.12);
        } else if (u_normType > 2.5) {
          // Type 3: Đáy Bằng — normal hướng xuống mạnh
          _normOk = (vWNorm.y < -0.68);
        } else if (u_normType > 1.5) {
          // Type 2: man_kho special
          bool _normCond = (vWNorm.y < 0.18);
          float _relX = abs(vWPos.x - u_cx) / u_xw;
          bool _outerSkin = (_relX > 0.78);
          bool _atEnds    = (vWPos.z < u_bowZ || vWPos.z > u_sternZ);
          bool _posCond   = (_outerSkin || _atEnds);
          _normOk = _normCond && _posCond;
        } else if (u_normType > 0.5) {
          // Type 1: Mặt Boong — normal hướng lên
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

// ── Hỗ trợ cả ZONES và SUB_ZONES ──────────────────────────
function highlightZone(key) {
  if (!meshes.length || !shipBBox) return;
  clearHighlight();
  activeHighlightKey = key;

  const z = ZONES[key] || SUB_ZONES[key];
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
// 6. INJECT PRODUCT-LINK STYLES
// ═══════════════════════════════════════════════════════════
const productLinkStyles = document.createElement("style");
productLinkStyles.textContent = `
  .paint-card {
    margin-bottom: 10px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 1px 4px rgba(12,30,53,0.06);
    transition: box-shadow .2s, transform .2s;
    background: #ffffff;
  }
  .paint-card:hover {
    box-shadow: 0 4px 16px rgba(12,30,53,0.12);
    transform: translateY(-1px);
  }
  .paint-card-body {
    display: flex;
    gap: 12px;
    padding: 11px 13px 8px;
    align-items: flex-start;
  }
  .paint-num {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    margin-top: 1px;
  }
  .paint-info { flex: 1; min-width: 0; }
  .paint-name {
    font-weight: 600;
    color: #0c1e35;
    font-size: 13px;
    margin-bottom: 3px;
    line-height: 1.35;
  }
  .paint-desc {
    color: #8599aa;
    font-size: 11.5px;
    line-height: 1.5;
  }
  .paint-card-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 13px 10px 47px;
  }
  .product-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px 4px 9px;
    border-radius: 20px;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.3px;
    text-decoration: none;
    border: 1.5px solid currentColor;
    transition: background .18s, color .18s, box-shadow .18s, transform .15s;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    cursor: pointer;
  }
  .product-link::before {
    content: '';
    position: absolute;
    inset: 0;
    background: currentColor;
    opacity: 0;
    transition: opacity .18s;
  }
  .product-link:hover::before { opacity: 0.1; }
  .product-link:hover {
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    transform: translateX(2px);
  }
  .product-link:hover .link-arrow { transform: translateX(3px); }
  .link-icon { font-size: 11px; opacity: 0.75; position: relative; z-index: 1; flex-shrink: 0; line-height: 1; }
  .link-text { position: relative; z-index: 1; line-height: 1; }
  .link-arrow { font-size: 12px; position: relative; z-index: 1; transition: transform .18s; opacity: 0.8; line-height: 1; }
  .paint-section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 18px 10px;
  }
  .paint-section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.2px;
    color: #8599aa;
    text-transform: uppercase;
  }
  .paint-section-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #eef0f3, transparent);
  }
  .paint-count-badge {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 1px 6px;
    border-radius: 10px;
    color: #fff;
  }

  /* ── MỚI: Sub-zone styles ── */
  .subzone-expand-btn {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid rgba(12,30,53,0.15);
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 11px;
    color: #8599aa;
    transition: background .15s, color .15s, border-color .15s, transform .25s ease;
    padding: 0;
    line-height: 1;
    font-family: 'DM Sans', sans-serif;
  }
  .subzone-expand-btn:hover {
    background: rgba(12,30,53,0.06);
    color: #0c1e35;
    border-color: rgba(12,30,53,0.3);
  }
  .subzone-expand-btn.open {
    transform: rotate(90deg);
    color: #0c1e35;
    border-color: rgba(12,30,53,0.3);
    background: rgba(12,30,53,0.06);
  }
  .subzone-rows-container {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.25s;
    opacity: 0;
  }
  .subzone-rows-container.open {
    max-height: 200px;
    opacity: 1;
  }
  .subzone-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px 7px 28px;
    cursor: pointer;
    transition: background .12s;
    border-left: 3px solid transparent;
    position: relative;
  }
  .subzone-row::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 50%;
    width: 6px;
    height: 1px;
    background: rgba(12,30,53,0.2);
  }
  .subzone-row:hover { background: rgba(12,30,53,0.03); }
  .subzone-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }
  .subzone-name {
    font-size: 12px;
    flex: 1;
    color: #4a6070;
    font-weight: 400;
  }
  .subzone-tag {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: .5px;
    color: #8599aa;
    background: #f4f6f8;
    padding: 1px 5px;
    border-radius: 3px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Sub-zone badge trong info panel */
  .subzone-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 2px 8px 2px 6px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #fff;
  }
`;
document.head.appendChild(productLinkStyles);

// ═══════════════════════════════════════════════════════════
// 7. INFO PANEL + LEGEND + FLY-TO
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
  scrollbarWidth: "thin",
  scrollbarColor: "#dde3ea transparent",
});
document.body.appendChild(infoPanel);
let activeZoneKey = null;

const glowStyle = document.createElement("style");
glowStyle.textContent = `@keyframes diagramGlowPulse{0%,100%{box-shadow:0 0 0px 0px rgba(var(--glow-rgb),0);}50%{box-shadow:0 0 22px 8px rgba(var(--glow-rgb),0.65);}}
.diagram-glow-wrap{border-radius:6px;overflow:hidden;border:2px solid rgba(var(--glow-rgb),0.5);animation:diagramGlowPulse 1.8s ease-in-out infinite;position:relative;}
.diagram-glow-wrap::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(var(--glow-rgb),0.12) 0%,transparent 60%);pointer-events:none;}`;
document.head.appendChild(glowStyle);

const DIAGRAM_IMAGES = {
  ham_hang: "./images/ham-hang-1.jpg",
  he_thong_khung: "./images/khung-xuong-tau.png",
};
function hexRgb(h) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
}

function buildPaintCard(p, i, zoneColor) {
  const linkHref = p.link && p.link !== "#" ? p.link : "#";
  const isPlaceholder = !p.link || p.link === "#";
  const target = isPlaceholder
    ? ""
    : 'target="_blank" rel="noopener noreferrer"';
  return `
    <div class="paint-card">
      <div class="paint-card-body">
        <div class="paint-num" style="background:${zoneColor}">${i + 1}</div>
        <div class="paint-info">
          <div class="paint-name">${p.name}</div>
          <div class="paint-desc">${p.desc}</div>
        </div>
      </div>
      <div class="paint-card-footer">
        <a href="${linkHref}" ${target} class="product-link" style="color:${zoneColor};"
           onclick="${isPlaceholder ? "return false;" : ""}">
          <span class="link-icon">⬡</span>
          <span class="link-text">${ui().viewProduct}</span>
          <span class="link-arrow">→</span>
        </a>
      </div>
    </div>`;
}

// ── openInfoPanel hỗ trợ cả zone và sub-zone ──────────────
function openInfoPanel(key) {
  const isSubZone = key in SUB_ZONES;
  const zBase = isSubZone ? SUB_ZONES[key] : ZONES[key];
  const zText = isSubZone ? getSubZoneText(key) : getZoneText(key);
  const z = { ...zBase, ...zText };

  activeZoneKey = key;

  // ── Cập nhật highlight legend rows ──
  LEGEND_ORDER.forEach((k) => {
    const row = legendRows[k];
    const isParentOfActive = isSubZone && SUB_ZONES[key].parent === k;
    const isDirectActive = k === key;
    row.style.background =
      isDirectActive || isParentOfActive
        ? `rgba(${hexRgb(ZONES[k].color)},0.07)`
        : "transparent";
    row.style.borderLeft =
      isDirectActive || isParentOfActive
        ? `3px solid ${ZONES[k].color}`
        : "3px solid transparent";
    row.querySelector(".legend-name").style.fontWeight =
      isDirectActive || isParentOfActive ? "600" : "400";
  });

  // ── Cập nhật highlight sub-zone rows ──
  Object.keys(subZoneRows).forEach((sk) => {
    const srow = subZoneRows[sk];
    const isActive = sk === key;
    srow.style.background = isActive
      ? `rgba(${hexRgb(SUB_ZONES[sk].color)},0.12)`
      : "transparent";
    srow.style.borderLeft = isActive
      ? `3px solid ${SUB_ZONES[sk].color}`
      : "3px solid transparent";
    srow.querySelector(".subzone-name").style.fontWeight = isActive
      ? "600"
      : "400";
    srow.querySelector(".subzone-name").style.color = isActive
      ? "#1a2b3c"
      : "#4a6070";
  });

  const isInterior = zBase.type === "interior";
  const typeLabel = isInterior ? ui().typeInterior : ui().typeExterior;
  const typeDot = isInterior ? ui().dotInterior : ui().dotExterior;
  const rgb = hexRgb(zBase.color);

  // Sub-zone badge (chỉ hiện khi là sub-zone)
  const subzoneBadgeHTML = isSubZone
    ? `<div style="margin-bottom:8px">
        <span class="subzone-badge" style="background:${ZONES[SUB_ZONES[key].parent].color}">
          ${getZoneText(SUB_ZONES[key].parent).name}
        </span>
        <span style="margin-left:5px;font-size:10px;color:#8599aa">›</span>
        <span class="subzone-badge" style="background:${zBase.color};margin-left:4px">
          ${zText.name}
        </span>
       </div>`
    : "";

  const diagramHTML =
    !isSubZone && isInterior && DIAGRAM_IMAGES[key]
      ? `<div style="padding:14px 18px 4px;border-bottom:1px solid #eef0f3">
        <div style="font-size:10px;font-weight:600;letter-spacing:1.2px;color:#8599aa;text-transform:uppercase;margin-bottom:8px">${ui().diagramLabel}</div>
        <div class="diagram-glow-wrap" style="--glow-rgb:${rgb}">
          <img src="${DIAGRAM_IMAGES[key]}" alt="${z.name}" style="width:100%;display:block;object-fit:cover;max-height:180px;position:relative;z-index:1"/>
        </div>
       </div>`
      : "";

  const paintsHTML = z.paints
    .map((p, i) => buildPaintCard(p, i, zBase.color))
    .join("");

  infoPanel.innerHTML = `
    <div style="padding:16px 18px 14px;border-bottom:1px solid #eef0f3;position:relative">
      <button id="closePanel" style="position:absolute;top:14px;right:14px;background:none;border:1px solid #d4d8df;color:#8599aa;width:24px;height:24px;border-radius:4px;cursor:pointer;font-size:12px;line-height:22px;text-align:center;transition:all .15s;font-family:inherit" onmouseover="this.style.background='#f0f2f5';this.style.color='#0c1e35'" onmouseout="this.style.background='none';this.style.color='#8599aa'">✕</button>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="width:12px;height:12px;background:${zBase.color};border-radius:2px;display:inline-block;flex-shrink:0"></span>
        <span style="font-size:10px;font-weight:600;letter-spacing:1px;color:#8599aa;text-transform:uppercase">${typeDot} ${typeLabel}</span>
      </div>
      ${subzoneBadgeHTML}
      <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:#0c1e35;line-height:1.2">${z.name}</div>
    </div>
    ${diagramHTML}
    <div style="padding:14px 18px;color:#4a6070;font-size:12.5px;line-height:1.8;border-bottom:1px solid #eef0f3">${z.description}</div>
    <div style="padding:0 0 16px">
      <div class="paint-section-header">
        <span class="paint-section-label">${ui().paintLabel}</span>
        <div class="paint-section-line"></div>
        <span class="paint-count-badge" style="background:${zBase.color}">${z.paints.length}</span>
      </div>
      <div style="padding:0 14px">${paintsHTML}</div>
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
  Object.keys(subZoneRows).forEach((sk) => {
    subZoneRows[sk].style.background = "transparent";
    subZoneRows[sk].style.borderLeft = "3px solid transparent";
    subZoneRows[sk].querySelector(".subzone-name").style.fontWeight = "400";
    subZoneRows[sk].querySelector(".subzone-name").style.color = "#4a6070";
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
  transition: "transform .32s cubic-bezier(.4,0,.2,1)",
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
const subZoneRows = {}; // ── MỚI
let dayTauExpanded = false; // ── MỚI: trạng thái expand
let subZoneRowsContainer = null; // ── MỚI: ref đến container sub-rows
let expandBtn = null; // ── MỚI: ref đến nút expand

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

  // ── MỚI: nút expand chỉ cho day_tau ──
  const expandBtnHTML =
    key === "day_tau"
      ? `<button class="subzone-expand-btn" id="dayTauExpandBtn" title="Mở rộng / Thu gọn">›</button>`
      : "";

  row.innerHTML = `
    <span style="flex-shrink:0;width:10px;height:10px;background:${z.color};border-radius:2px"></span>
    <span class="legend-name" style="font-size:12.5px;flex:1;color:#1a2b3c;font-weight:400">${zt.name}</span>
    <span class="legend-tag" style="font-size:9px;font-weight:600;letter-spacing:.6px;color:#8599aa;background:#f0f2f5;padding:1px 5px;border-radius:3px;white-space:nowrap;flex-shrink:0">${isInt ? ui().tagInterior : ui().tagExterior}</span>
    ${expandBtnHTML}`;

  // ── Click trên hàng chính ──
  row.addEventListener("click", (e) => {
    // Nếu click vào expand button thì không mở zone
    if (e.target.closest("#dayTauExpandBtn")) return;
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

  // ── MỚI: Sub-rows container cho day_tau ──
  if (key === "day_tau") {
    // Lấy ref nút expand sau khi đã append
    setTimeout(() => {
      expandBtn = document.getElementById("dayTauExpandBtn");
      if (expandBtn) {
        expandBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          dayTauExpanded = !dayTauExpanded;
          if (dayTauExpanded) {
            subZoneRowsContainer.classList.add("open");
            expandBtn.classList.add("open");
          } else {
            subZoneRowsContainer.classList.remove("open");
            expandBtn.classList.remove("open");
            // Đóng panel nếu đang xem sub-zone
            if (activeZoneKey && activeZoneKey in SUB_ZONES) {
              closeInfoPanel();
            }
          }
        });
      }
    }, 0);

    // Container cho sub-zone rows
    subZoneRowsContainer = document.createElement("div");
    subZoneRowsContainer.className = "subzone-rows-container";

    SUB_ZONE_ORDER.forEach((subKey) => {
      const sz = SUB_ZONES[subKey];
      const szt = getSubZoneText(subKey);

      const srow = document.createElement("div");
      srow.className = "subzone-row";
      srow.innerHTML = `
        <span class="subzone-dot" style="background:${sz.color}"></span>
        <span class="subzone-name">${szt.name}</span>
        <span class="subzone-tag">${ui().tagExterior}</span>`;

      srow.addEventListener("click", () => {
        if (activeZoneKey === subKey) {
          closeInfoPanel();
          return;
        }
        placePin(subKey, meshes);
        highlightZone(subKey);
        flyToZone(subKey);
        openInfoPanel(subKey);
      });

      subZoneRowsContainer.appendChild(srow);
      subZoneRows[subKey] = srow;
    });

    legendBody.appendChild(subZoneRowsContainer);
  }
});
legend.appendChild(legendBody);
document.body.appendChild(legend);

// ── WRAPPER bọc legend + nút toggle ──────────────────────
const legendWrap = document.createElement("div");
Object.assign(legendWrap.style, {
  position: "fixed",
  top: HEADER_H + 12 + "px",
  left: "0",
  display: "flex",
  alignItems: "flex-start",
  zIndex: "999",
  transition: "transform .44s cubic-bezier(.25, 0.46, 0.45, 0.94)",
  willChange: "transform",
  pointerEvents: "none",
});

Object.assign(legend.style, {
  position: "relative",
  top: "auto",
  left: "auto",
  zIndex: "auto",
  marginLeft: "16px",
  pointerEvents: "auto",
});
legendWrap.appendChild(legend);

const legendToggle = document.createElement("button");
Object.assign(legendToggle.style, {
  width: "22px",
  height: "44px",
  background: "#0c1e35",
  border: "1px solid rgba(184,151,90,0.5)",
  borderLeft: "none",
  borderRadius: "0 7px 7px 0",
  color: "#d4b07a",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: "0",
  marginTop: "2px",
  padding: "0",
  boxShadow: "4px 2px 12px rgba(12,30,53,0.25)",
  transition: "background .18s",
  fontFamily: "'DM Sans', sans-serif",
  pointerEvents: "auto",
  outline: "none",
});
legendToggle.title = "Ẩn/Hiện menu";
const arrowSpan = document.createElement("span");
Object.assign(arrowSpan.style, {
  display: "inline-block",
  fontSize: "17px",
  lineHeight: "1",
  color: "#d4b07a",
  transition: "transform .44s cubic-bezier(.25, 0.46, 0.45, 0.94)",
  transform: "rotate(0deg)",
  marginTop: "1px",
});
arrowSpan.textContent = "‹";
legendToggle.appendChild(arrowSpan);
legendToggle.addEventListener("mouseenter", () => {
  legendToggle.style.background = "#163354";
  legendToggle.style.color = "#f0c97a";
});
legendToggle.addEventListener("mouseleave", () => {
  legendToggle.style.background = "#0c1e35";
  legendToggle.style.color = "#d4b07a";
});
let legendVisible = true;
legendToggle.addEventListener("click", () => {
  legendVisible = !legendVisible;
  if (legendVisible) {
    legendWrap.style.transform = "translateX(0)";
    arrowSpan.style.transform = "rotate(0deg)";
  } else {
    const legendW = legend.offsetWidth;
    legendWrap.style.transform = `translateX(-${legendW + 16}px)`;
    arrowSpan.style.transform = "rotate(180deg)";
  }
});
legendWrap.appendChild(legendToggle);
document.body.appendChild(legendWrap);

// ── HINT ─────────────────────────────────────────────────
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

// ── LANGUAGE TOGGLE ───────────────────────────────────────
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

function toggleLanguage() {
  currentLang = currentLang === "vi" ? "en" : "vi";
  document.getElementById("langLabel").textContent = ui().toggleBtn;
  updateStaticUI();
  updateLegendText();
  if (activeZoneKey) openInfoPanel(activeZoneKey);
}

function updateStaticUI() {
  const headerTitle = document.querySelector("#header-bar .header-title");
  const headerSub = document.querySelector("#header-bar .header-sub");
  if (headerTitle) headerTitle.textContent = ui().headerTitle;
  if (headerSub) headerSub.textContent = ui().headerSub;
  if (shipBBox) hint.textContent = ui().hintReady;
}

function updateLegendText() {
  const ltEl = legendHeader.querySelector("[data-legend-title]");
  const lsEl = legendHeader.querySelector("[data-legend-subtitle]");
  if (ltEl) ltEl.textContent = ui().legendTitle;
  if (lsEl) lsEl.textContent = ui().legendSubtitle;
  LEGEND_ORDER.forEach((key) => {
    const row = legendRows[key];
    const nameEl = row.querySelector(".legend-name");
    const tagEl = row.querySelector(".legend-tag");
    if (nameEl) nameEl.textContent = getZoneText(key).name;
    if (tagEl)
      tagEl.textContent =
        ZONES[key].type === "interior" ? ui().tagInterior : ui().tagExterior;
  });
  // ── MỚI: cập nhật sub-zone text ──
  SUB_ZONE_ORDER.forEach((subKey) => {
    const srow = subZoneRows[subKey];
    if (!srow) return;
    const nameEl = srow.querySelector(".subzone-name");
    const tagEl = srow.querySelector(".subzone-tag");
    if (nameEl) nameEl.textContent = getSubZoneText(subKey).name;
    if (tagEl) tagEl.textContent = ui().tagExterior;
  });
}

// ── FLY-TO (hỗ trợ cả ZONES và SUB_ZONES) ────────────────
let flyTarget = null,
  flyT = 1;
const FLY_SPEED = 0.032,
  _sp = new THREE.Vector3(),
  _sl = new THREE.Vector3(),
  _tl = new THREE.Vector3();

function flyToZone(key) {
  if (!shipBBox) return;
  const z = ZONES[key] || SUB_ZONES[key];
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
// 8. TẢI MODEL
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
// 9. EVENTS
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
