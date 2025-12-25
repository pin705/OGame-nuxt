// ========================================
// THÔN PHỆ TINH KHÔNG - Type Definitions
// ========================================

// ============ Enums ============

export enum PlayerRank {
  CHIEN_BINH_SO_CAP = 'CHIEN_BINH_SO_CAP', // Lv 1-10
  CHIEN_TUONG = 'CHIEN_TUONG',             // Lv 11-20
  DAI_TUONG = 'DAI_TUONG',                 // Lv 21-30
  NGUYEN_SOAI = 'NGUYEN_SOAI',             // Lv 31-40
  DAI_DE = 'DAI_DE',                       // Lv 41-50
  VU_TRU_CAP = 'VU_TRU_CAP',               // Lv 51+
}

export enum BuildingType {
  // Resource Buildings
  MO_TINH_THACH = 'MO_TINH_THACH',                     // Metal Mine
  MAY_HAP_THU_NANG_LUONG = 'MAY_HAP_THU_NANG_LUONG',   // Crystal Mine
  DEN_HON_THACH = 'DEN_HON_THACH',                     // Deuterium Synthesizer
  LO_NANG_LUONG = 'LO_NANG_LUONG',                     // Solar Plant
  LO_NHIET_HACH = 'LO_NHIET_HACH',                     // Fusion Reactor
  
  // Storage Buildings
  KHO_TINH_THACH = 'KHO_TINH_THACH',                   // Metal Storage
  KHO_NANG_LUONG_VU_TRU = 'KHO_NANG_LUONG_VU_TRU',     // Crystal Storage
  KHO_HON_THACH = 'KHO_HON_THACH',                     // Deuterium Storage
  
  // Functional Buildings
  TRUNG_TAM_CHI_HUY = 'TRUNG_TAM_CHI_HUY',             // Command Center
  XUONG_DONG_TAU = 'XUONG_DONG_TAU',                   // Shipyard
  VIEN_NGHIEN_CUU = 'VIEN_NGHIEN_CUU',                 // Research Lab
  NHA_MAY_ROBOT = 'NHA_MAY_ROBOT',                     // Robotics Factory
  NHA_MAY_NANITE = 'NHA_MAY_NANITE',                   // Nanite Factory
  PHAO_DAI_PHONG_THU = 'PHAO_DAI_PHONG_THU',           // Defense Facility
  SILO_TEN_LUA = 'SILO_TEN_LUA',                       // Missile Silo
  CANG_VU_TRU = 'CANG_VU_TRU',                         // Space Dock
  MANG_CAM_BIEN = 'MANG_CAM_BIEN',                     // Sensor Phalanx
  CONG_NHAY = 'CONG_NHAY',                             // Jump Gate
}

export enum ResearchType {
  // Energy & Resources
  CONG_NGHE_NANG_LUONG = 'CONG_NGHE_NANG_LUONG',       // Energy Technology
  CONG_NGHE_KHAI_THAC = 'CONG_NGHE_KHAI_THAC',         // Mining Technology
  
  // Combat
  CONG_NGHE_VU_KHI = 'CONG_NGHE_VU_KHI',               // Weapon Technology
  CONG_NGHE_GIAP = 'CONG_NGHE_GIAP',                   // Armor Technology
  CONG_NGHE_KHIEN = 'CONG_NGHE_KHIEN',                 // Shield Technology
  
  // Propulsion
  DONG_CO_DOT_CHAY = 'DONG_CO_DOT_CHAY',               // Combustion Drive
  DONG_CO_XUNG = 'DONG_CO_XUNG',                       // Impulse Drive
  DONG_CO_SIEU_KHONG_GIAN = 'DONG_CO_SIEU_KHONG_GIAN', // Hyperspace Drive
  
  // Advanced
  CONG_NGHE_GIAN_DIEP = 'CONG_NGHE_GIAN_DIEP',         // Espionage Technology
  CONG_NGHE_MAY_TINH = 'CONG_NGHE_MAY_TINH',           // Computer Technology
  CONG_NGHE_SIEU_KHONG_GIAN = 'CONG_NGHE_SIEU_KHONG_GIAN', // Hyperspace Technology
  
  // New Advanced Technologies
  CONG_NGHE_TRONG_LUC = 'CONG_NGHE_TRONG_LUC',         // Graviton Technology
  CONG_NGHE_LASER = 'CONG_NGHE_LASER',                 // Laser Technology
  CONG_NGHE_ION = 'CONG_NGHE_ION',                     // Ion Technology
  CONG_NGHE_PLASMA = 'CONG_NGHE_PLASMA',               // Plasma Technology
  LIEN_MANG_NGHIEN_CUU = 'LIEN_MANG_NGHIEN_CUU',       // Intergalactic Research Network
  THUOC_DIA_HOC = 'THUOC_DIA_HOC',                     // Astrophysics
}

export enum ShipType {
  // Combat Ships
  TIEU_CHIEN_HAM = 'TIEU_CHIEN_HAM',                   // Light Fighter
  TRUNG_CHIEN_HAM = 'TRUNG_CHIEN_HAM',                 // Heavy Fighter
  TUAN_DUONG_HAM = 'TUAN_DUONG_HAM',                   // Cruiser
  THIET_GIAP_HAM = 'THIET_GIAP_HAM',                   // Battleship
  HAC_LONG_HAM = 'HAC_LONG_HAM',                       // Black Dragon (Battlecruiser)
  
  // Utility Ships
  VAN_TAI_NHO = 'VAN_TAI_NHO',                         // Small Cargo
  VAN_TAI_LON = 'VAN_TAI_LON',                         // Large Cargo
  TAU_THUOC_DIA = 'TAU_THUOC_DIA',                     // Colony Ship
  TAU_DO_THAM = 'TAU_DO_THAM',                         // Espionage Probe
  TAU_TAI_CHE = 'TAU_TAI_CHE',                         // Recycler
  
  // Capital Ships
  MAU_HAM = 'MAU_HAM',                                 // Carrier
  DA_DE_HAM = 'DA_DE_HAM',                             // Destroyer
  TU_THAN_TINH = 'TU_THAN_TINH',                       // Death Star
}

export enum FleetMission {
  TAN_CONG = 'TAN_CONG',                               // Attack
  VAN_CHUYEN = 'VAN_CHUYEN',                           // Transport
  TRIEN_KHAI = 'TRIEN_KHAI',                           // Deploy
  THUOC_DIA = 'THUOC_DIA',                             // Colonize
  DO_THAM = 'DO_THAM',                                 // Espionage
  TAI_CHE = 'TAI_CHE',                                 // Recycle
  THAM_HIEM = 'THAM_HIEM',                             // Expedition
  PHA_HUY_MAT_TRANG = 'PHA_HUY_MAT_TRANG',             // Moon Destruction
  GIU_VI_TRI = 'GIU_VI_TRI',                           // Hold Position (ACS)
  LIEN_MINH_TAN_CONG = 'LIEN_MINH_TAN_CONG',           // Alliance Attack (ACS)
}

export enum DefenseType {
  // Light Defense
  BE_PHONG_TEN_LUA = 'BE_PHONG_TEN_LUA',               // Rocket Launcher
  PHAO_LASER_NHO = 'PHAO_LASER_NHO',                   // Light Laser
  PHAO_LASER_LON = 'PHAO_LASER_LON',                   // Heavy Laser
  PHAO_GAUSS = 'PHAO_GAUSS',                           // Gauss Cannon
  PHAO_ION = 'PHAO_ION',                               // Ion Cannon
  PHAO_PLASMA = 'PHAO_PLASMA',                         // Plasma Turret
  
  // Shields
  VOM_KHIEN_NHO = 'VOM_KHIEN_NHO',                     // Small Shield Dome
  VOM_KHIEN_LON = 'VOM_KHIEN_LON',                     // Large Shield Dome
}

// ============ Interfaces ============

export interface Coordinates {
  galaxy: number;    // 1-9
  system: number;    // 1-499
  position: number;  // 1-15
}

export interface Resources {
  tinhThach: number;      // Metal
  nangLuongVuTru: number; // Crystal
  honThach: number;       // Deuterium
  dienNang: number;       // Energy
  dienNangMax?: number;   // Max Energy (optional)
}

export interface ResourceProduction {
  tinhThach: number;
  nangLuongVuTru: number;
  honThach: number;
  dienNang: number;
  dienNangConsumption: number;
}

export interface BuildingLevel {
  type: BuildingType;
  level: number;
}

export interface BuildingConfig {
  type: BuildingType;
  name: string;
  description: string;
  baseCost: {
    tinhThach: number;
    nangLuongVuTru: number;
    honThach: number;
  };
  costFactor: number;
  energyConsumption?: number;
  energyProduction?: number;
  requirements?: {
    buildings?: { type: BuildingType; level: number }[];
    researches?: { type: ResearchType; level: number }[];
  };
}

export interface ResearchLevel {
  type: ResearchType;
  level: number;
}

export interface ResearchConfig {
  type: ResearchType;
  name: string;
  description: string;
  baseCost: {
    tinhThach: number;
    nangLuongVuTru: number;
    honThach: number;
  };
  costFactor: number;
  requirements?: {
    buildings?: { type: BuildingType; level: number }[];
    researches?: { type: ResearchType; level: number }[];
  };
}

export interface ShipConfig {
  type: ShipType;
  name: string;
  description: string;
  cost: {
    tinhThach: number;
    nangLuongVuTru: number;
    honThach: number;
  };
  stats: {
    attack: number;
    defense: number;
    shield: number;
    cargo: number;
    speed: number;
    fuelConsumption: number;
  };
  requirements?: {
    buildings?: { type: BuildingType; level: number }[];
    researches?: { type: ResearchType; level: number }[];
  };
}

export interface DefenseConfig {
  type: DefenseType;
  name: string;
  description: string;
  cost: {
    tinhThach: number;
    nangLuongVuTru: number;
    honThach: number;
  };
  stats: {
    attack: number;
    defense: number;
    shield: number;
  };
  requirements?: {
    buildings?: { type: BuildingType; level: number }[];
    researches?: { type: ResearchType; level: number }[];
  };
}

export interface Fleet {
  ships: { type: ShipType; count: number }[];
  mission: FleetMission;
  origin: Coordinates;
  destination: Coordinates;
  departureTime: Date;
  arrivalTime: Date;
  returnTime?: Date;
  resources?: Resources;
}

export interface Player {
  _id: string;
  username: string;
  email: string;
  level: number;
  experience: number;
  rank: PlayerRank;
  planets: string[];
  homePlanet: string;
  researches: ResearchLevel[];
  alliance?: string;
  createdAt: Date;
  lastActive: Date;
}

export interface Planet {
  _id: string;
  name: string;
  owner: string;
  coordinates: Coordinates;
  resources: Resources;
  buildings: BuildingLevel[];
  temperature: number;
  diameter: number;
  maxFields: number;
  usedFields: number;
  lastResourceUpdate: Date;
  isHomePlanet: boolean;
}

// ============ API Response Types ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// ============ Auth Types ============

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  level: number;
  rank: PlayerRank;
}
