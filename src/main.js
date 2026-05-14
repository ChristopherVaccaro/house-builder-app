import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#game-canvas");
const canvasWrap = document.querySelector("#canvas-wrap");
const assetList = document.querySelector("#asset-list");
const assetSearch = document.querySelector("#asset-search");
const selectedName = document.querySelector("#selected-name");
const colorInput = document.querySelector("#color-input");
const styleSelect = document.querySelector("#style-select");
const variantSelect = document.querySelector("#variant-select");
const variantField = variantSelect.closest("label");
const scaleInput = document.querySelector("#scale-input");
const lengthInput = document.querySelector("#length-input");
const lengthField = document.querySelector("#length-field");
const lengthValue = document.querySelector("#length-value");
const dropHint = document.querySelector("#drop-hint");
const roomWidthInput = document.querySelector("#room-width");
const roomDepthInput = document.querySelector("#room-depth");
const roomWidthValue = document.querySelector("#room-width-value");
const roomDepthValue = document.querySelector("#room-depth-value");
const wallColorInput = document.querySelector("#wall-color");
const floorColorInput = document.querySelector("#floor-color");
const exteriorMaterialInput = document.querySelector("#exterior-material");
const fidelityToggle = document.querySelector("#fidelity-toggle");
const lockRoomBtn = document.querySelector("#lock-room-btn");
const duplicateBtn = document.querySelector("#duplicate-btn");
const deleteBtn = document.querySelector("#delete-btn");
const tourViewBtn = document.querySelector("#tour-view");
const roofsToggleBtn = document.querySelector("#roofs-toggle");
const dozerBtn = document.querySelector("#dozer-btn");
const levelOneBtn = document.querySelector("#level-1-btn");
const levelTwoBtn = document.querySelector("#level-2-btn");
const levelsAllBtn = document.querySelector("#levels-all-btn");
const projectModal = document.querySelector("#project-modal");
const projectModalTitle = document.querySelector("#project-modal-title");
const projectNameRow = document.querySelector("#project-name-row");
const projectNameInput = document.querySelector("#project-name-input");
const projectList = document.querySelector("#project-list");
const projectPrimaryBtn = document.querySelector("#project-primary-btn");
const projectSecondaryBtn = document.querySelector("#project-secondary-btn");
const projectCloseBtn = document.querySelector("#project-close-btn");

const STORAGE_KEY = "homeforge-room-studio-save-v1";
const PROJECTS_KEY = "homeforge-room-studio-projects-v1";
const GRID_SIZE = 0.25;
const ROOM_HEIGHT = 3;
const WALL_THICKNESS = 0.16;
const LEVEL_HEIGHT = ROOM_HEIGHT + 0.14;
const LOT_LIMIT = 60;
const ROOF_OVERHANG = 1.2;
const FENCE_SPACING = 2.05;
const TREE_SPACING = 2.15;
const SHRUB_SPACING = 1.05;
const HEDGE_SPACING = 1.2;
const EXTERIOR_MATERIAL_TYPES = new Set(["siding", "brick", "stone", "shingles"]);
const MAIN_ROOM_ID = "main-room";
const DRAG_BUILD_KINDS = new Set(["interior-wall", "fence", "tree", "shrub", "hedge", "patio", "stone-walkway", "deck"]);

const ASSETS = [
  { id: "template-kitchen", label: "Kitchen Template", category: "rooms", kind: "room-template", color: "#d7cab4", material: "painted", width: 7, depth: 5.5 },
  { id: "template-bathroom", label: "Bathroom Template", category: "rooms", kind: "room-template", color: "#d8d1c3", material: "painted", width: 5, depth: 4 },
  { id: "room-module", label: "Room Module", category: "structure", kind: "room-module", color: "#d6c9b7", material: "painted", thumb: [0, 0] },
  { id: "wide-room", label: "Wide Room", category: "structure", kind: "room-module", color: "#d8ccb8", material: "painted", width: 6, depth: 4, thumb: [0, 0] },
  { id: "small-room", label: "Small Room", category: "structure", kind: "room-module", color: "#d5c5b0", material: "painted", width: 4, depth: 4, thumb: [0, 0] },
  { id: "door", label: "Door", category: "structure", kind: "door", color: "#8f5c32", material: "wood", thumb: [0, 0] },
  { id: "sliding-patio-door", label: "Sliding Patio Door", category: "structure", kind: "sliding-patio-door", color: "#8daeb4", material: "metal", thumb: [0, 0] },
  { id: "french-patio-door", label: "French Patio Doors", category: "structure", kind: "french-patio-door", color: "#9f744a", material: "wood", thumb: [0, 0] },
  { id: "window", label: "Window", category: "structure", kind: "window", color: "#9fc8ce", material: "metal", thumb: [0, 0] },
  { id: "archway", label: "Archway", category: "structure", kind: "archway", color: "#f0e8dc", material: "painted", thumb: [0, 0] },
  { id: "interior-wall", label: "Interior Wall", category: "structure", kind: "interior-wall", color: "#d8d1c3", material: "painted", width: 3, depth: WALL_THICKNESS },
  { id: "sofa", label: "Sofa", category: "seating", kind: "sofa", color: "#d8c7ad", material: "fabric", thumb: [0, 0] },
  { id: "loveseat", label: "Loveseat", category: "seating", kind: "loveseat", color: "#cba98d", material: "fabric", thumb: [0, 0] },
  { id: "armchair", label: "Armchair", category: "seating", kind: "armchair", color: "#6f805f", material: "fabric", thumb: [1, 0] },
  { id: "chair", label: "Chair", category: "seating", kind: "chair", color: "#b28255", material: "wood", thumb: [2, 0] },
  { id: "stool", label: "Stool", category: "seating", kind: "stool", color: "#a76a3d", material: "wood", thumb: [2, 0] },
  { id: "bench", label: "Bench", category: "seating", kind: "bench", color: "#8d5a35", material: "wood", thumb: [2, 0] },
  { id: "ottoman", label: "Ottoman", category: "seating", kind: "ottoman", color: "#8a9a7c", material: "fabric", thumb: [1, 0] },
  { id: "bean-bag", label: "Bean Bag", category: "seating", kind: "bean-bag", color: "#bd755e", material: "fabric", thumb: [1, 0] },
  { id: "desk", label: "Desk", category: "work", kind: "desk", color: "#a85f2f", material: "wood", thumb: [3, 0] },
  { id: "computer", label: "Computer", category: "work", kind: "computer", color: "#242525", material: "metal", thumb: [0, 1] },
  { id: "laptop", label: "Laptop", category: "work", kind: "laptop", color: "#303333", material: "metal", thumb: [0, 1] },
  { id: "drawing-tablet", label: "Drawing Tablet", category: "work", kind: "drawing-tablet", color: "#272a2b", material: "metal", thumb: [0, 1] },
  { id: "easel", label: "Easel", category: "work", kind: "easel", color: "#9f693e", material: "wood", thumb: [3, 0] },
  { id: "bookshelf", label: "Bookshelf", category: "storage", kind: "bookshelf", color: "#9a5d31", material: "wood", thumb: [1, 1] },
  { id: "bed", label: "Bed", category: "sleep", kind: "bed", color: "#75885f", material: "fabric", thumb: [2, 1] },
  { id: "wardrobe", label: "Wardrobe", category: "storage", kind: "wardrobe", color: "#9a5a30", material: "wood", thumb: [3, 1] },
  { id: "dresser", label: "Dresser", category: "storage", kind: "dresser", color: "#9b5f33", material: "wood", thumb: [0, 2] },
  { id: "cube-shelf", label: "Cube Shelf", category: "storage", kind: "cube-shelf", color: "#956137", material: "wood", thumb: [1, 1] },
  { id: "wall-shelf", label: "Wall Shelf", category: "storage", kind: "wall-shelf", color: "#a06537", material: "wood", thumb: [1, 1] },
  { id: "book-stack", label: "Book Stack", category: "storage", kind: "book-stack", color: "#526c89", material: "painted", thumb: [1, 1] },
  { id: "storage-basket", label: "Storage Basket", category: "storage", kind: "storage-basket", color: "#b4885b", material: "fabric", thumb: [0, 2] },
  { id: "plant", label: "Plant", category: "decor", kind: "plant", color: "#557a45", material: "painted", thumb: [1, 2] },
  { id: "tall-plant", label: "Tall Plant", category: "decor", kind: "tall-plant", color: "#4f7b45", material: "painted", thumb: [1, 2] },
  { id: "small-plant", label: "Small Plant", category: "decor", kind: "small-plant", color: "#6f8d55", material: "painted", thumb: [1, 2] },
  { id: "curtains", label: "Curtains", category: "decor", kind: "curtains", color: "#d7bf96", material: "fabric", thumb: [2, 2] },
  { id: "rug", label: "Rug", category: "decor", kind: "rug", color: "#d2b783", material: "fabric", thumb: [3, 2] },
  { id: "round-rug", label: "Round Rug", category: "decor", kind: "round-rug", color: "#b9876a", material: "fabric", thumb: [3, 2] },
  { id: "mirror", label: "Mirror", category: "decor", kind: "mirror", color: "#c8b27d", material: "metal", thumb: [2, 2] },
  { id: "wall-art", label: "Wall Art", category: "decor", kind: "wall-art", color: "#8c5f4a", material: "painted", thumb: [2, 2] },
  { id: "clock", label: "Clock", category: "decor", kind: "clock", color: "#333332", material: "painted", thumb: [2, 2] },
  { id: "vase", label: "Vase", category: "decor", kind: "vase", color: "#b98362", material: "painted", thumb: [1, 2] },
  { id: "throw-pillows", label: "Throw Pillows", category: "decor", kind: "throw-pillows", color: "#b96f5c", material: "fabric", thumb: [0, 0] },
  { id: "blanket", label: "Blanket", category: "decor", kind: "blanket", color: "#7d8f73", material: "fabric", thumb: [2, 1] },
  { id: "candle-set", label: "Candle Set", category: "decor", kind: "candle-set", color: "#f1dfbd", material: "painted", thumb: [3, 3] },
  { id: "sculpture", label: "Sculpture", category: "decor", kind: "sculpture", color: "#d4c9b2", material: "painted", thumb: [3, 3] },
  { id: "television", label: "Television", category: "media", kind: "television", color: "#202225", material: "metal", thumb: [0, 3] },
  { id: "speakers", label: "Speakers", category: "media", kind: "speakers", color: "#282a2a", material: "metal", thumb: [0, 3] },
  { id: "game-console", label: "Game Console", category: "media", kind: "game-console", color: "#2a2d2f", material: "metal", thumb: [0, 3] },
  { id: "record-player", label: "Record Player", category: "media", kind: "record-player", color: "#754c32", material: "wood", thumb: [0, 3] },
  { id: "floor-lamp", label: "Floor Lamp", category: "decor", kind: "floor-lamp", color: "#d8c17b", material: "metal", thumb: [1, 3] },
  { id: "table-lamp", label: "Table Lamp", category: "decor", kind: "table-lamp", color: "#d6bd85", material: "metal", thumb: [1, 3] },
  { id: "ceiling-light", label: "Ceiling Light", category: "decor", kind: "ceiling-light", color: "#f0dfbd", material: "metal", thumb: [1, 3] },
  { id: "coffee-table", label: "Coffee Table", category: "seating", kind: "coffee-table", color: "#a26032", material: "wood", thumb: [2, 3] },
  { id: "side-table", label: "Side Table", category: "decor", kind: "side-table", color: "#9b5a30", material: "wood", thumb: [3, 3] },
  { id: "nightstand", label: "Nightstand", category: "sleep", kind: "nightstand", color: "#8e552f", material: "wood", thumb: [3, 3] },
  { id: "vanity", label: "Vanity", category: "sleep", kind: "vanity", color: "#a46a3c", material: "wood", thumb: [3, 0] },
  { id: "kitchen-counter", label: "Kitchen Counter", category: "kitchen", kind: "kitchen-counter", color: "#b58b63", material: "wood" },
  { id: "kitchen-island", label: "Kitchen Island", category: "kitchen", kind: "kitchen-island", color: "#9d7350", material: "wood" },
  { id: "refrigerator", label: "Refrigerator", category: "kitchen", kind: "refrigerator", color: "#dfe3e1", material: "metal" },
  { id: "stove", label: "Stove", category: "kitchen", kind: "stove", color: "#3c403f", material: "metal" },
  { id: "sink", label: "Sink", category: "kitchen", kind: "sink", color: "#c8d0ce", material: "metal" },
  { id: "upper-cabinet", label: "Upper Cabinet", category: "kitchen", kind: "upper-cabinet", color: "#a06b42", material: "wood" },
  { id: "toilet", label: "Toilet", category: "bath", kind: "toilet", color: "#f2efe8", material: "painted" },
  { id: "bathtub", label: "Bathtub", category: "bath", kind: "bathtub", color: "#f0eee8", material: "painted" },
  { id: "shower", label: "Shower", category: "bath", kind: "shower", color: "#a7c9cf", material: "metal" },
  { id: "bath-vanity", label: "Bath Vanity", category: "bath", kind: "bath-vanity", color: "#9e6b45", material: "wood" },
  { id: "stairs", label: "Stairs", category: "structure", kind: "stairs", color: "#a46f45", material: "wood" },
  { id: "wide-stairs", label: "Wide Staircase", category: "structure", kind: "wide-stairs", color: "#a46f45", material: "wood", width: 2.3, depth: 3.6 },
  { id: "stair-landing", label: "Stair Landing", category: "structure", kind: "stair-landing", color: "#9a6842", material: "wood", width: 2.2, depth: 1.8 },
  { id: "front-door", label: "Front Door", category: "structure", kind: "front-door", color: "#8b4f2d", material: "wood" },
  { id: "roof", label: "Roof", category: "structure", kind: "roof", color: "#7c4b3d", material: "painted" },
  { id: "grass-plot", label: "Grass Plot", category: "outdoor", kind: "grass-plot", color: "#6f9458", material: "painted", width: 12, depth: 10 },
  { id: "deck", label: "Deck", category: "outdoor", kind: "deck", color: "#9a6842", material: "wood", width: 4, depth: 3 },
  { id: "patio", label: "Stone Patio", category: "outdoor", kind: "patio", color: "#9b9688", material: "painted", width: 4, depth: 3 },
  { id: "stone-walkway", label: "Stone Walkway", category: "outdoor", kind: "stone-walkway", color: "#9f9a8c", material: "painted", width: 2, depth: 4 },
  { id: "fence", label: "Fence", category: "outdoor", kind: "fence", color: "#e2d5bd", material: "wood" },
  { id: "tree", label: "Tree", category: "outdoor", kind: "tree", color: "#527a45", material: "painted" },
  { id: "shrub", label: "Shrub", category: "outdoor", kind: "shrub", color: "#5f8a51", material: "painted" },
  { id: "hedge", label: "Hedge", category: "outdoor", kind: "hedge", color: "#5b8750", material: "painted", width: 1.4, depth: 0.55 },
  { id: "bbq", label: "BBQ Grill", category: "outdoor", kind: "bbq", color: "#2d3030", material: "metal" },
  { id: "outdoor-bar", label: "Outdoor Bar", category: "outdoor", kind: "outdoor-bar", color: "#9a6842", material: "wood", width: 2.3, depth: 0.9 },
  { id: "fire-pit", label: "Fire Pit", category: "outdoor", kind: "fire-pit", color: "#3a3935", material: "stone" },
  { id: "horseshoes", label: "Horseshoes", category: "outdoor", kind: "horseshoes", color: "#80684c", material: "painted", width: 2.5, depth: 4.5 },
  { id: "volleyball-net", label: "Volleyball Net", category: "outdoor", kind: "volleyball-net", color: "#f4ead8", material: "fabric", width: 4.5, depth: 1.0 },
  { id: "cat", label: "Cat", category: "pets", kind: "cat", color: "#6f6257", material: "fabric" },
  { id: "dog", label: "Dog", category: "pets", kind: "dog", color: "#9b6845", material: "fabric" },
  { id: "pet-bed", label: "Pet Bed", category: "pets", kind: "pet-bed", color: "#b77762", material: "fabric" },
  { id: "pet-bowl", label: "Pet Bowl", category: "pets", kind: "pet-bowl", color: "#8aa0a5", material: "metal" },
  { id: "cat-tree", label: "Cat Tree", category: "pets", kind: "cat-tree", color: "#b79a75", material: "fabric" },
  { id: "aquarium", label: "Aquarium", category: "pets", kind: "aquarium", color: "#7bb8c3", material: "metal" },
];

const VARIANTS = {
  door: [
    { id: "open", label: "Open" },
    { id: "closed", label: "Closed" },
  ],
  sofa: [
    { id: "classic", label: "Classic" },
    { id: "sectional", label: "Sectional" },
    { id: "modern", label: "Modern" },
  ],
  loveseat: [
    { id: "classic", label: "Classic" },
    { id: "modern", label: "Modern" },
  ],
  chair: [
    { id: "dining", label: "Dining" },
    { id: "lounge", label: "Lounge" },
    { id: "rounded", label: "Rounded" },
  ],
  bed: [
    { id: "classic", label: "Classic" },
    { id: "platform", label: "Platform" },
    { id: "canopy", label: "Canopy" },
  ],
  desk: [
    { id: "drawer", label: "Drawer" },
    { id: "trestle", label: "Trestle" },
    { id: "corner", label: "Corner" },
  ],
  rug: [
    { id: "border", label: "Border" },
    { id: "striped", label: "Striped" },
    { id: "plain", label: "Plain" },
  ],
  "round-rug": [
    { id: "ring", label: "Ring" },
    { id: "plain", label: "Plain" },
  ],
  roof: [
    { id: "gable", label: "Gable" },
    { id: "hip", label: "Hip" },
    { id: "flat", label: "Flat" },
  ],
  cat: [
    { id: "standing", label: "Standing" },
    { id: "curled", label: "Curled" },
  ],
  dog: [
    { id: "standing", label: "Standing" },
    { id: "sleeping", label: "Sleeping" },
  ],
  "pet-bed": [
    { id: "bolster", label: "Bolster" },
    { id: "round", label: "Round" },
  ],
  aquarium: [
    { id: "rect", label: "Rectangular" },
    { id: "tall", label: "Tall" },
  ],
  television: [
    { id: "console", label: "Console" },
    { id: "wall", label: "Wall TV" },
    { id: "outdoor", label: "Outdoor Stand" },
  ],
  deck: [
    { id: "ground", label: "Ground" },
    { id: "raised", label: "Raised" },
  ],
  stairs: [
    { id: "straight", label: "Straight" },
    { id: "landing", label: "With Landing" },
    { id: "second-floor", label: "Full Story Straight" },
    { id: "switchback-second-floor", label: "Full Story Switchback" },
  ],
  "wide-stairs": [
    { id: "straight", label: "Straight" },
    { id: "landing", label: "With Landing" },
    { id: "second-floor", label: "Full Story Straight" },
    { id: "switchback-second-floor", label: "Full Story Switchback" },
  ],
  shrub: [
    { id: "cluster", label: "Cluster" },
    { id: "hedge", label: "Hedge" },
  ],
};

const ROOM_TEMPLATES = {
  "template-kitchen": {
    room: {
      label: "Decorated Kitchen",
      width: 7,
      depth: 5.5,
      wallColor: "#d7cab4",
      floorColor: "#b99062",
      exteriorMaterial: "siding",
    },
    items: [
      { assetId: "kitchen-counter", x: -1.75, z: -2.1, rotationY: 0 },
      { assetId: "sink", x: 0, z: -2.1, rotationY: 0 },
      { assetId: "stove", x: 1.35, z: -2.1, rotationY: 0 },
      { assetId: "refrigerator", x: -2.75, z: -1.55, rotationY: 0 },
      { assetId: "upper-cabinet", x: -0.7, z: -2.65, rotationY: 0 },
      { assetId: "kitchen-island", x: 0, z: 0.25, rotationY: 0 },
      { assetId: "window", x: 2.3, z: -2.65, rotationY: 0 },
      { assetId: "sliding-patio-door", x: 2.1, z: 2.65, rotationY: Math.PI },
      { assetId: "small-plant", x: 2.65, z: 1.45, rotationY: 0 },
    ],
  },
  "template-bathroom": {
    room: {
      label: "Decorated Bathroom",
      width: 5,
      depth: 4,
      wallColor: "#d8d1c3",
      floorColor: "#c4b49a",
      exteriorMaterial: "siding",
    },
    items: [
      { assetId: "bathtub", x: -1.25, z: -1.2, rotationY: 0 },
      { assetId: "shower", x: -1.55, z: 0.95, rotationY: 0 },
      { assetId: "toilet", x: 1.3, z: -1.1, rotationY: 0 },
      { assetId: "bath-vanity", x: 1.25, z: 0.75, rotationY: Math.PI },
      { assetId: "round-rug", x: 0, z: 0.1, rotationY: 0, color: "#9eb0a7", variant: "plain", scale: 0.9 },
      { assetId: "window", x: 0, z: -1.95, rotationY: 0 },
      { assetId: "door", x: 2.45, z: 0.65, rotationY: -Math.PI / 2 },
      { assetId: "small-plant", x: -0.15, z: 1.35, rotationY: 0, scale: 0.85 },
    ],
  },
};

const state = {
  activeCategory: "all",
  activeAssetId: null,
  selectedId: null,
  currentProjectId: null,
  currentProjectName: "Untitled project",
  viewMode: "iso",
  shellClosed: false,
  highFidelity: false,
  roofsVisible: true,
  activeLevel: 1,
  showAllLevels: true,
  savedAt: null,
  room: {
    uid: MAIN_ROOM_ID,
    assetId: "main-room",
    label: "Initial Room",
    kind: "room-module",
    color: "#d6c9b7",
    material: "painted",
    variant: "default",
    scale: 1,
    position: [0, 0, 0],
    rotationY: 0,
    level: 1,
    locked: true,
    width: 12,
    depth: 10,
    wallColor: "#d6c9b7",
    floorColor: "#b99062",
    exteriorMaterial: "siding",
  },
  objects: [],
  history: [],
  future: [],
  clipboard: null,
  selectedIds: new Set(),
  lastRotationByKind: {},
  lastRoomExteriorMaterial: "siding",
  toolMode: "select",
  buildDrag: {
    active: false,
    assetId: null,
    start: null,
    current: null,
    moved: false,
  },
  preview: {
    visible: false,
    count: 0,
    point: null,
  },
  bulldozing: false,
  bulldozeChanged: false,
};

const projectModalState = {
  mode: "save",
  selectedId: null,
};

const scene = new THREE.Scene();
scene.background = new THREE.Color("#d5ded7");
scene.fog = new THREE.Fog("#d5ded7", 90, 180);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 800);
camera.position.set(7.5, 6.5, 8.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableDamping = true;
orbit.dampingFactor = 0.08;
orbit.target.set(0, 1.1, 0);
orbit.maxPolarAngle = Math.PI * 0.49;
orbit.minDistance = 4;
orbit.maxDistance = 90;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const activeLevelPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hitPoint = new THREE.Vector3();
const clock = new THREE.Clock();
const dragState = {
  entry: null,
  offset: new THREE.Vector3(),
  moved: false,
  startPosition: new THREE.Vector3(),
  roomStart: new THREE.Vector3(),
  roomContents: [],
  wallContents: [],
  selectedStarts: [],
};
const thumbnailCache = new Map();
const textureCache = new Map();
const walkState = {
  keys: new Set(),
  yaw: 0,
  pitch: 0,
  speed: 3.2,
  pointerLocked: false,
  draggingLook: false,
  lastX: 0,
  lastY: 0,
};
const animationState = { elapsed: 0 };
const tourState = { active: false, angle: Math.PI / 4 };
let lotGroup = new THREE.Group();
const placementPreviewGroup = new THREE.Group();
placementPreviewGroup.visible = false;
placementPreviewGroup.userData.selectable = false;
const placementPreviewGrid = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshBasicMaterial({
    color: "#ffd36e",
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),
);
placementPreviewGrid.rotation.x = -Math.PI / 2;
placementPreviewGrid.position.y = 0.13;
placementPreviewGrid.visible = false;
placementPreviewGrid.renderOrder = 18;
placementPreviewGrid.userData.selectable = false;
const selectionHelper = new THREE.BoxHelper(new THREE.Object3D(), 0xffd36e);
selectionHelper.visible = false;
selectionHelper.material.transparent = true;
selectionHelper.material.opacity = 0.95;
selectionHelper.material.depthTest = false;
selectionHelper.renderOrder = 20;
scene.add(selectionHelper);
scene.add(placementPreviewGrid);
scene.add(placementPreviewGroup);
scene.add(lotGroup);

let roomGroup = new THREE.Group();
scene.add(roomGroup);

setupLights();
buildLot();
buildRoom();
renderAssetPanel();
wireUi();
updateLevelUi();
updateLevelVisibility();
addStarterRoom();
resize();
animate();

function setupLights() {
  const hemi = new THREE.HemisphereLight("#fff3df", "#6d836e", 2.3);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight("#fff4df", 4);
  sun.position.set(9, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -70;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70;
  sun.shadow.camera.bottom = -70;
  scene.add(sun);

  const fill = new THREE.DirectionalLight("#b9d4ff", 0.75);
  fill.position.set(-7, 7, -9);
  scene.add(fill);
}

function buildLot() {
  scene.remove(lotGroup);
  disposeObject(lotGroup);
  lotGroup = new THREE.Group();
  const grass = addBox(lotGroup, [42, 0.04, 36], [0, -0.04, 0], makeMat("#6f9458", "grass"), "Starter grass lot");
  grass.receiveShadow = true;
  grass.userData.selectable = false;
  grass.userData.lot = true;
  scene.add(lotGroup);
}

function buildRoom() {
  scene.remove(roomGroup);
  disposeObject(roomGroup);
  roomGroup = new THREE.Group();
  roomGroup.userData.uid = MAIN_ROOM_ID;
  roomGroup.userData.selectable = true;
  roomGroup.rotation.y = state.room.rotationY || 0;
  state.room.group = roomGroup;
  scene.add(roomGroup);

  const { width, depth, wallColor, floorColor, exteriorMaterial } = state.room;
  addRoomShell(roomGroup, width, depth, wallColor, floorColor, "main", exteriorMaterial);
  tagRoomGroup(roomGroup, MAIN_ROOM_ID);
}

function addRoomShell(group, width, depth, wallColor, floorColor, roomId = "main", exteriorMaterial = "siding") {
  const wallMat = makeMat(wallColor, "painted");
  const exteriorMat = makeMat(wallColor, exteriorMaterial || "siding");
  const openings = getWallOpeningsForRoom(roomId);
  const roomBounds = getRoomBoundsById(roomId) || { id: "main", x: 0, z: 0, width, depth };
  addRoomFloor(group, width, depth, makeMat(floorColor, "wood"), getFloorOpeningsForRoom(roomBounds), roomBounds);
  addWallWithOpenings(group, "back", width, depth, wallMat, openings, exteriorMat, roomBounds);
  addWallWithOpenings(group, "left", width, depth, wallMat, openings, exteriorMat, roomBounds);
  addWallWithOpenings(group, "right", width, depth, wallMat, openings, exteriorMat, roomBounds);
  if (state.shellClosed) addWallWithOpenings(group, "front", width, depth, wallMat, openings, exteriorMat, roomBounds);
  const trim = makeMat("#f5efe1", "painted");
  addWallTrim(group, "back", width, depth, trim, openings);
  addWallTrim(group, "left", width, depth, trim, openings);
  addWallTrim(group, "right", width, depth, trim, openings);
  if (state.shellClosed) addWallTrim(group, "front", width, depth, trim, openings);
  addRoomGrid(group, width, depth);
}

function addRoomFloor(group, width, depth, floorMat, openings = []) {
  const relevant = openings.filter(Boolean);
  if (!relevant.length) {
    const floor = addBox(group, [width, 0.12, depth], [0, 0.03, 0], floorMat, "Room floor");
    floor.receiveShadow = true;
    return;
  }
  const opening = relevant[0];
  const minX = THREE.MathUtils.clamp(opening.x - opening.width / 2, -width / 2, width / 2);
  const maxX = THREE.MathUtils.clamp(opening.x + opening.width / 2, -width / 2, width / 2);
  const minZ = THREE.MathUtils.clamp(opening.z - opening.depth / 2, -depth / 2, depth / 2);
  const maxZ = THREE.MathUtils.clamp(opening.z + opening.depth / 2, -depth / 2, depth / 2);
  const addFloorSegment = (x1, x2, z1, z2) => {
    if (x2 - x1 <= 0.05 || z2 - z1 <= 0.05) return;
    const floor = addBox(group, [x2 - x1, 0.12, z2 - z1], [(x1 + x2) / 2, 0.03, (z1 + z2) / 2], floorMat, "Room floor");
    floor.receiveShadow = true;
  };
  addFloorSegment(-width / 2, minX, -depth / 2, depth / 2);
  addFloorSegment(maxX, width / 2, -depth / 2, depth / 2);
  addFloorSegment(minX, maxX, -depth / 2, minZ);
  addFloorSegment(minX, maxX, maxZ, depth / 2);
}

function tagRoomGroup(group, uid) {
  group.traverse((child) => {
    if (!child.isMesh || child.userData.lot) return;
    child.userData.uid = uid;
    child.userData.selectable = true;
  });
}

function addRoomGrid(group, width, depth) {
  const grid = new THREE.GridHelper(Math.max(width, depth), Math.ceil(Math.max(width, depth) / GRID_SIZE), "#ffffff", "#ffffff");
  grid.position.y = 0.095;
  grid.scale.x = width / Math.max(width, depth);
  grid.scale.z = depth / Math.max(width, depth);
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  group.add(grid);
}

function addWallWithOpenings(group, side, width, depth, wallMat, openings, exteriorMat, roomBounds) {
  const relevant = openings.filter((opening) => opening.side === side).sort((a, b) => a.offset - b.offset);
  const axisLength = ["back", "front"].includes(side) ? width : depth;
  const wallStart = -axisLength / 2;
  const wallEnd = axisLength / 2;
  let cursor = wallStart;
  relevant.forEach((opening) => {
    const half = opening.width / 2;
    addWallSegment(group, side, width, depth, cursor, opening.offset - half, 0, ROOM_HEIGHT, wallMat, "Wall segment");
    addWallSegment(group, side, width, depth, opening.offset - half, opening.offset + half, opening.top, ROOM_HEIGHT, wallMat, "Wall header");
    if (opening.bottom > 0) addWallSegment(group, side, width, depth, opening.offset - half, opening.offset + half, 0, opening.bottom, wallMat, "Wall sill");
    cursor = opening.offset + half;
  });
  addWallSegment(group, side, width, depth, cursor, wallEnd, 0, ROOM_HEIGHT, wallMat, "Wall segment");
  addExteriorWallSkins(group, side, width, depth, exteriorMat, relevant, roomBounds);
}

function addWallSegment(group, side, width, depth, start, end, yStart, yEnd, material, label) {
  const segmentLength = end - start;
  const segmentHeight = yEnd - yStart;
  if (segmentLength <= 0.05 || segmentHeight <= 0.05) return;
  const center = (start + end) / 2;
  const y = yStart + segmentHeight / 2;
  let mesh;
  if (side === "back") mesh = addBox(group, [segmentLength, segmentHeight, WALL_THICKNESS], [center, y, -depth / 2], material, label);
  else if (side === "front") mesh = addBox(group, [segmentLength, segmentHeight, WALL_THICKNESS], [center, y, depth / 2], material, label);
  else if (side === "left") mesh = addBox(group, [WALL_THICKNESS, segmentHeight, segmentLength], [-width / 2, y, center], material, label);
  else mesh = addBox(group, [WALL_THICKNESS, segmentHeight, segmentLength], [width / 2, y, center], material, label);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
}

function addExteriorWallSkins(group, side, width, depth, exteriorMaterial, openings, roomBounds) {
  if (!exteriorMaterial || !roomBounds) return;
  const axisLength = ["back", "front"].includes(side) ? width : depth;
  const wallStart = -axisLength / 2;
  const wallEnd = axisLength / 2;
  const openingIntervals = openings.map((opening) => ({ start: opening.offset - opening.width / 2, end: opening.offset + opening.width / 2 }));
  const solidIntervals = subtractIntervals([{ start: wallStart, end: wallEnd }], openingIntervals);
  const exposedIntervals = getExteriorIntervalsForSide(roomBounds, side);
  intersectIntervals(solidIntervals, exposedIntervals).forEach((interval) => {
    addExteriorWallSkinSegment(group, side, width, depth, interval.start, interval.end, 0, ROOM_HEIGHT, exteriorMaterial);
  });
  openings.forEach((opening) => {
    const interval = { start: opening.offset - opening.width / 2, end: opening.offset + opening.width / 2 };
    intersectIntervals([interval], exposedIntervals).forEach((exposed) => {
      addExteriorWallSkinSegment(group, side, width, depth, exposed.start, exposed.end, opening.top, ROOM_HEIGHT, exteriorMaterial);
      if (opening.bottom > 0) addExteriorWallSkinSegment(group, side, width, depth, exposed.start, exposed.end, 0, opening.bottom, exteriorMaterial);
    });
  });
}

function addExteriorWallSkinSegment(group, side, width, depth, start, end, yStart, yEnd, exteriorMaterial) {
  const segmentLength = end - start;
  const segmentHeight = yEnd - yStart;
  if (segmentLength <= 0.05 || segmentHeight <= 0.05) return;
  const center = (start + end) / 2;
  const y = yStart + segmentHeight / 2;
  const skinThickness = 0.035;
  let skin;
  if (side === "back") skin = addBox(group, [segmentLength, segmentHeight, skinThickness], [center, y, -depth / 2 - WALL_THICKNESS / 2 - skinThickness / 2], exteriorMaterial, "Exterior wall finish");
  else if (side === "front") skin = addBox(group, [segmentLength, segmentHeight, skinThickness], [center, y, depth / 2 + WALL_THICKNESS / 2 + skinThickness / 2], exteriorMaterial, "Exterior wall finish");
  else if (side === "left") skin = addBox(group, [skinThickness, segmentHeight, segmentLength], [-width / 2 - WALL_THICKNESS / 2 - skinThickness / 2, y, center], exteriorMaterial, "Exterior wall finish");
  else skin = addBox(group, [skinThickness, segmentHeight, segmentLength], [width / 2 + WALL_THICKNESS / 2 + skinThickness / 2, y, center], exteriorMaterial, "Exterior wall finish");
  skin.receiveShadow = true;
  skin.castShadow = false;
}

function getExteriorIntervalsForSide(room, side) {
  const axisLength = ["back", "front"].includes(side) ? room.width : room.depth;
  let intervals = [{ start: -axisLength / 2, end: axisLength / 2 }];
  getAllRoomBounds().forEach((candidate) => {
    if (candidate.id === room.id) return;
    const shared = getSharedWallInfo(room, candidate);
    if (shared?.sideFrom !== side) return;
    const roomAxisCenter = ["back", "front"].includes(side) ? room.x : room.z;
    const candidateAxisCenter = ["back", "front"].includes(side) ? candidate.x : candidate.z;
    const roomHalf = axisLength / 2;
    const candidateHalf = (["back", "front"].includes(side) ? candidate.width : candidate.depth) / 2;
    const overlapStart = Math.max(roomAxisCenter - roomHalf, candidateAxisCenter - candidateHalf) - roomAxisCenter;
    const overlapEnd = Math.min(roomAxisCenter + roomHalf, candidateAxisCenter + candidateHalf) - roomAxisCenter;
    intervals = subtractIntervals(intervals, [{ start: overlapStart, end: overlapEnd }]);
  });
  return intervals;
}

function subtractIntervals(intervals, blockers) {
  return blockers.reduce((current, blocker) => current.flatMap((interval) => {
    const start = Math.max(interval.start, blocker.start);
    const end = Math.min(interval.end, blocker.end);
    if (end <= start) return [interval];
    return [
      { start: interval.start, end: start },
      { start: end, end: interval.end },
    ].filter((part) => part.end - part.start > 0.05);
  }), intervals);
}

function intersectIntervals(a, b) {
  return a.flatMap((left) => b.map((right) => ({
    start: Math.max(left.start, right.start),
    end: Math.min(left.end, right.end),
  })).filter((interval) => interval.end - interval.start > 0.05));
}

function addWallTrim(group, side, width, depth, material, openings) {
  const axisLength = ["back", "front"].includes(side) ? width : depth;
  const trimStart = -axisLength / 2;
  const trimEnd = axisLength / 2;
  const doorIntervals = openings
    .filter((opening) => opening.side === side && opening.bottom === 0)
    .map((opening) => ({ start: opening.offset - opening.width / 2 - 0.04, end: opening.offset + opening.width / 2 + 0.04 }));
  subtractIntervals([{ start: trimStart, end: trimEnd }], doorIntervals).forEach((interval) => {
    addWallTrimSegment(group, side, width, depth, interval.start, interval.end, material);
  });
}

function addWallTrimSegment(group, side, width, depth, start, end, material) {
  const length = end - start;
  if (length <= 0.05) return;
  const center = (start + end) / 2;
  if (side === "back") addBox(group, [length, 0.12, 0.12], [center, 0.16, -depth / 2 + 0.09], material, "Back baseboard");
  else if (side === "front") addBox(group, [length, 0.12, 0.12], [center, 0.16, depth / 2 - 0.09], material, "Front baseboard");
  else if (side === "left") addBox(group, [0.12, 0.12, length], [-width / 2 + 0.09, 0.16, center], material, "Left baseboard");
  else addBox(group, [0.12, 0.12, length], [width / 2 - 0.09, 0.16, center], material, "Right baseboard");
}

function renderAssetPanel() {
  const query = assetSearch.value.trim().toLowerCase();
  assetList.innerHTML = "";
  ASSETS.filter((asset) => query || state.activeCategory === "all" || asset.category === state.activeCategory)
    .filter((asset) => !query || `${asset.label} ${asset.kind}`.toLowerCase().includes(query))
    .forEach((asset) => {
      const button = document.createElement("button");
      button.className = `asset-card ${asset.id === state.activeAssetId ? "selected" : ""}`;
      button.type = "button";
      button.draggable = true;
      button.dataset.assetId = asset.id;

      const thumb = document.createElement("div");
      thumb.className = "thumb";
      const thumbImage = document.createElement("img");
      thumbImage.src = getAssetThumbnail(asset);
      thumbImage.alt = "";
      thumb.append(thumbImage);

      const label = document.createElement("span");
      label.textContent = asset.label;
      button.append(thumb, label);

      button.addEventListener("click", () => {
        state.activeAssetId = asset.id;
        setToolMode("select", false);
        selectObject(null);
        clearPlacementPreview();
        renderAssetPanel();
        flashHint(DRAG_BUILD_KINDS.has(asset.kind) ? `${asset.label} ready. Click once or drag to build.` : `${asset.label} ready. Click once to place it.`);
      });
      button.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", asset.id);
        event.dataTransfer.effectAllowed = "copy";
      });
      assetList.append(button);
    });
}

function getAssetThumbnail(asset) {
  if (thumbnailCache.has(asset.id)) return thumbnailCache.get(asset.id);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(createAssetSvg(asset))}`;
  thumbnailCache.set(asset.id, dataUrl);
  return dataUrl;
}

function createAssetSvg(asset) {
  const color = asset.color;
  const dark = shadeHex(color, -28);
  const light = shadeHex(color, 32);
  const wood = "#9b6137";
  const cream = "#f1e4cf";
  const metal = "#252829";
  const green = "#5f854e";
  const shadow = `<ellipse cx="116" cy="132" rx="58" ry="10" fill="#000" opacity=".11"/>`;
  const base = `<rect width="232" height="160" rx="10" fill="#f6ead8"/>${shadow}`;
  const box = (x, y, w, h, fill = color, stroke = dark) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
  const leg = (x, y, h = 28) => `<rect x="${x}" y="${y}" width="8" height="${h}" rx="2" fill="${dark}"/>`;
  const circle = (cx, cy, r, fill = color) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${dark}" stroke-width="3"/>`;

  let item = "";
  if (asset.kind === "room-template") {
    if (asset.id === "template-kitchen") {
      item = `${box(48, 42, 136, 82, "#d7cab4", dark)}<line x1="52" y1="48" x2="180" y2="48" stroke="#f5eee2" stroke-width="6"/><rect x="62" y="82" width="86" height="22" rx="4" fill="${wood}" stroke="${shadeHex(wood, -25)}" stroke-width="3"/><rect x="78" y="70" width="28" height="14" rx="3" fill="#c8d0ce"/><rect x="118" y="68" width="24" height="18" rx="3" fill="${metal}"/><rect x="96" y="108" width="62" height="20" rx="4" fill="#e7dfd3" stroke="${wood}" stroke-width="3"/><rect x="152" y="58" width="22" height="52" rx="4" fill="#dfe3e1" stroke="#9da5a2" stroke-width="3"/>`;
    } else {
      item = `${box(54, 42, 124, 82, "#d8d1c3", dark)}<line x1="58" y1="48" x2="174" y2="48" stroke="#f5eee2" stroke-width="6"/><rect x="66" y="84" width="48" height="24" rx="8" fill="#f0eee8" stroke="#b8b0a6" stroke-width="3"/><rect x="126" y="80" width="34" height="32" rx="7" fill="#f2efe8" stroke="#b8b0a6" stroke-width="3"/><rect x="62" y="56" width="34" height="26" rx="4" fill="#a7c9cf" stroke="#71939a" stroke-width="3"/><circle cx="132" cy="122" r="15" fill="#9eb0a7" stroke="#748980" stroke-width="3"/>`;
    }
  } else if (asset.kind === "room-module") {
    item = `${box(58, 54, 112, 66, "#d6c9b7", dark)}<line x1="60" y1="58" x2="170" y2="58" stroke="#f5eee2" stroke-width="6"/><line x1="60" y1="58" x2="60" y2="120" stroke="#f5eee2" stroke-width="6"/><line x1="170" y1="58" x2="170" y2="120" stroke="#f5eee2" stroke-width="6"/>`;
  } else if (asset.kind === "door") {
    item = `${box(80, 42, 72, 92, "#f0e5d2", dark)}${box(118, 62, 32, 68, color, dark)}`;
  } else if (asset.kind === "sliding-patio-door") {
    item = `${box(56, 42, 120, 88, "#dfe9e8", dark)}${box(62, 50, 52, 72, "#9fc8ce", "#6f9298")}${box(116, 50, 52, 72, "#b8d7dc", "#6f9298")}<line x1="116" y1="48" x2="116" y2="124" stroke="${dark}" stroke-width="5"/><line x1="76" y1="130" x2="158" y2="130" stroke="#6f9298" stroke-width="5"/>`;
  } else if (asset.kind === "french-patio-door") {
    item = `${box(58, 42, 116, 88, "#f0e5d2", dark)}${box(66, 50, 48, 72, "#b8d7dc", dark)}${box(118, 50, 48, 72, "#b8d7dc", dark)}<line x1="114" y1="50" x2="114" y2="122" stroke="${dark}" stroke-width="5"/><circle cx="108" cy="88" r="4" fill="#d0aa5b"/><circle cx="122" cy="88" r="4" fill="#d0aa5b"/>`;
  } else if (asset.kind === "window") {
    item = `${box(72, 46, 88, 70, "#b8d7dc", dark)}<line x1="116" y1="48" x2="116" y2="114" stroke="#f5eee2" stroke-width="7"/><line x1="74" y1="82" x2="158" y2="82" stroke="#f5eee2" stroke-width="7"/>`;
  } else if (asset.kind === "archway") {
    item = `${box(72, 42, 88, 24, "#f0e8dc", dark)}${box(72, 64, 18, 70, "#f0e8dc", dark)}${box(142, 64, 18, 70, "#f0e8dc", dark)}`;
  } else if (["sofa", "loveseat"].includes(asset.kind)) {
    const width = asset.kind === "sofa" ? 112 : 88;
    item = `${box(116 - width / 2, 72, width, 32, light)}${box(108 - width / 2, 52, width + 16, 34, color)}${box(101 - width / 2, 70, 18, 38, dark)}${box(113 + width / 2, 70, 18, 38, dark)}${leg(84, 105, 16)}${leg(142, 105, 16)}`;
  } else if (asset.kind === "armchair" || asset.kind === "bean-bag") {
    item = asset.kind === "bean-bag" ? `<ellipse cx="116" cy="86" rx="45" ry="34" fill="${color}" stroke="${dark}" stroke-width="4"/>` : `${box(84, 70, 64, 34, color)}${box(92, 48, 48, 36, light)}${box(74, 68, 18, 40, dark)}${box(140, 68, 18, 40, dark)}`;
  } else if (asset.kind === "chair") {
    item = `${box(94, 76, 44, 30, light)}${box(98, 38, 36, 46, color)}${leg(100, 104)}${leg(128, 104)}`;
  } else if (asset.kind === "stool") {
    item = `${circle(116, 75, 28, color)}${leg(98, 92, 34)}${leg(114, 96, 34)}${leg(130, 92, 34)}`;
  } else if (asset.kind === "bench") {
    item = `${box(74, 78, 92, 26, color)}${box(80, 48, 80, 30, light)}${leg(88, 103)}${leg(152, 103)}`;
  } else if (asset.kind === "ottoman") {
    item = `${box(82, 72, 72, 42, color)}${box(88, 62, 60, 16, light)}`;
  } else if (["desk", "vanity"].includes(asset.kind)) {
    item = `${box(62, 60, 108, 28, color)}${box(126, 88, 34, 40, dark)}${leg(72, 88, 38)}${leg(160, 88, 38)}${asset.kind === "vanity" ? box(91, 24, 50, 34, "#b9d7d8", dark) : ""}`;
  } else if (asset.kind === "computer") {
    item = `${box(82, 38, 68, 46, metal, "#111")}${box(102, 86, 28, 12, metal)}${box(70, 108, 82, 14, "#303335", "#111")}${circle(168, 116, 10, "#303335")}`;
  } else if (asset.kind === "laptop") {
    item = `${box(77, 55, 78, 48, metal, "#111")}${box(68, 103, 98, 14, "#3a3d3f", "#111")}`;
  } else if (asset.kind === "drawing-tablet") {
    item = `${box(70, 72, 92, 48, metal, "#111")}${box(82, 82, 62, 28, "#151819", "#111")}<line x1="162" y1="74" x2="186" y2="116" stroke="#222" stroke-width="5" stroke-linecap="round"/>`;
  } else if (asset.kind === "easel") {
    item = `<line x1="84" y1="128" x2="108" y2="42" stroke="${wood}" stroke-width="8"/><line x1="148" y1="128" x2="124" y2="42" stroke="${wood}" stroke-width="8"/>${box(88, 52, 56, 48, "#ead9bd", wood)}`;
  } else if (["bookshelf", "cube-shelf", "wall-shelf"].includes(asset.kind)) {
    item = `${box(78, 32, 76, asset.kind === "wall-shelf" ? 34 : 92, color)}<line x1="82" y1="62" x2="150" y2="62" stroke="${dark}" stroke-width="5"/><line x1="82" y1="90" x2="150" y2="90" stroke="${dark}" stroke-width="5"/><rect x="92" y="66" width="10" height="20" fill="#4e6d8c"/><rect x="108" y="66" width="10" height="20" fill="#d0aa5b"/><rect x="124" y="38" width="10" height="20" fill="#8f4a3f"/>`;
  } else if (["wardrobe", "dresser", "nightstand"].includes(asset.kind)) {
    item = `${box(76, 42, 82, asset.kind === "nightstand" ? 58 : 86, color)}<line x1="80" y1="72" x2="154" y2="72" stroke="${dark}" stroke-width="4"/><line x1="80" y1="96" x2="154" y2="96" stroke="${dark}" stroke-width="4"/><circle cx="106" cy="84" r="3" fill="#d8b15b"/><circle cx="132" cy="84" r="3" fill="#d8b15b"/>`;
  } else if (asset.kind === "bed") {
    item = `${box(62, 68, 112, 48, cream, dark)}${box(62, 48, 112, 28, wood)}${box(82, 80, 72, 32, color)}${box(72, 56, 36, 18, "#f6efe1")}`;
  } else if (asset.kind.includes("plant")) {
    item = `${box(96, 94, 40, 30, "#d7c9b2", "#9a7053")}${circle(104, 78, asset.kind === "small-plant" ? 18 : 28, green)}${circle(128, 76, asset.kind === "small-plant" ? 18 : 30, green)}${circle(116, 54, asset.kind === "tall-plant" ? 32 : 24, green)}`;
  } else if (asset.kind === "curtains") {
    item = `<line x1="58" y1="34" x2="174" y2="34" stroke="${wood}" stroke-width="7"/>${box(64, 40, 42, 84, color)}${box(126, 40, 42, 84, color)}`;
  } else if (asset.kind.includes("rug") || asset.kind === "blanket") {
    item = asset.kind === "round-rug" ? `${circle(116, 84, 48, color)}${circle(116, 84, 26, cream)}` : `${box(58, 62, 116, 58, color)}${box(74, 78, 84, 12, cream, cream)}`;
  } else if (["mirror", "wall-art", "clock"].includes(asset.kind)) {
    item = asset.kind === "clock" ? `${circle(116, 72, 38, "#f5ead6")}<line x1="116" y1="72" x2="116" y2="46" stroke="${dark}" stroke-width="5"/><line x1="116" y1="72" x2="138" y2="72" stroke="${dark}" stroke-width="5"/>` : `${box(80, 34, 72, 84, asset.kind === "mirror" ? "#b8d2d5" : "#ead9bd", dark)}${asset.kind === "wall-art" ? box(96, 58, 28, 24, green, green) : ""}`;
  } else if (["vase", "candle-set", "sculpture"].includes(asset.kind)) {
    item = asset.kind === "candle-set" ? `${box(86, 82, 18, 42, cream)}${box(112, 68, 18, 56, cream)}${box(138, 88, 18, 36, cream)}` : `${circle(116, 80, 28, color)}${box(100, 92, 32, 34, color)}`;
  } else if (["throw-pillows"].includes(asset.kind)) {
    item = `${box(80, 72, 42, 36, color)}${box(116, 66, 42, 36, cream)}`;
  } else if (["television", "speakers", "game-console", "record-player"].includes(asset.kind)) {
    if (asset.kind === "speakers") item = `${box(82, 50, 30, 78, metal, "#111")}${box(130, 50, 30, 78, metal, "#111")}${circle(97, 78, 9, "#111")}${circle(145, 78, 9, "#111")}`;
    else if (asset.kind === "game-console") item = `${box(70, 78, 92, 22, metal, "#111")}${box(94, 108, 42, 18, "#202325", "#111")}<circle cx="108" cy="116" r="4" fill="#111"/><circle cx="126" cy="116" r="4" fill="#111"/>`;
    else if (asset.kind === "record-player") item = `${box(66, 72, 100, 36, wood)}${circle(102, 88, 18, "#111")}<line x1="126" y1="78" x2="150" y2="98" stroke="#d4c08b" stroke-width="5"/>`;
    else item = `${box(70, 40, 92, 52, metal, "#111")}${box(62, 98, 108, 26, wood)}`;
  } else if (asset.kind.includes("lamp") || asset.kind === "ceiling-light") {
    item = `<line x1="116" y1="118" x2="116" y2="54" stroke="#8f7741" stroke-width="7"/>${box(88, 42, 56, 30, color)}${circle(116, 122, 24, "#8f7741")}`;
  } else if (["kitchen-counter", "kitchen-island", "refrigerator", "stove", "sink", "upper-cabinet"].includes(asset.kind)) {
    if (asset.kind === "refrigerator") item = `${box(92, 28, 56, 100, color, dark)}<line x1="94" y1="70" x2="146" y2="70" stroke="${dark}" stroke-width="4"/><line x1="136" y1="44" x2="136" y2="112" stroke="#88908f" stroke-width="5"/>`;
    else if (asset.kind === "stove") item = `${box(78, 60, 76, 62, metal, "#111")}${circle(98, 78, 9, "#111")}${circle(132, 78, 9, "#111")}${box(90, 98, 50, 18, "#d8d2c6", "#111")}`;
    else if (asset.kind === "sink") item = `${box(72, 70, 92, 50, wood)}${box(92, 56, 52, 24, "#c8d0ce", dark)}<path d="M132 56 C132 38 154 38 154 56" fill="none" stroke="#8f9996" stroke-width="6"/>`;
    else item = `${box(64, 70, 104, 46, color)}${box(58, 58, 116, 16, "#e4dccf", dark)}<line x1="116" y1="72" x2="116" y2="116" stroke="${dark}" stroke-width="4"/>`;
  } else if (["toilet", "bathtub", "shower", "bath-vanity"].includes(asset.kind)) {
    if (asset.kind === "toilet") item = `${box(94, 56, 44, 38, "#f2efe8", dark)}${circle(116, 104, 26, "#f2efe8")}`;
    else if (asset.kind === "bathtub") item = `${box(58, 76, 116, 38, "#f0eee8", dark)}${box(72, 82, 88, 20, "#cfd9d8", "#9ca6a3")}`;
    else if (asset.kind === "shower") item = `${box(78, 42, 76, 86, "#b7d4d8", dark)}<line x1="154" y1="42" x2="154" y2="128" stroke="${dark}" stroke-width="5"/>`;
    else item = `${box(76, 78, 80, 42, wood)}${circle(116, 72, 20, "#d6d1c8")}${box(90, 28, 52, 38, "#b8d2d5", dark)}`;
  } else if (asset.kind === "interior-wall") {
    item = `${box(46, 68, 138, 22, color, dark)}${box(48, 90, 134, 8, light, dark)}${box(50, 106, 130, 6, "#f5efe1", "#d8cfbd")}`;
  } else if (["stairs", "wide-stairs", "stair-landing", "front-door", "roof"].includes(asset.kind)) {
    if (asset.kind === "stairs" || asset.kind === "wide-stairs") item = `<path d="M${asset.kind === "wide-stairs" ? 58 : 76} 118 H${asset.kind === "wide-stairs" ? 174 : 160} V100 H144 V84 H128 V68 H112 V52 H96 V36 H${asset.kind === "wide-stairs" ? 58 : 76} Z" fill="${color}" stroke="${dark}" stroke-width="4"/>`;
    else if (asset.kind === "stair-landing") item = `${box(58, 70, 116, 46, color, dark)}<line x1="72" y1="82" x2="160" y2="82" stroke="${light}" stroke-width="4"/><line x1="72" y1="102" x2="160" y2="102" stroke="${light}" stroke-width="4"/>`;
    else if (asset.kind === "roof") item = `<path d="M56 94 L116 42 L176 94 Z" fill="${color}" stroke="${dark}" stroke-width="4"/><rect x="76" y="92" width="80" height="34" fill="${shadeHex(color, -18)}" stroke="${dark}" stroke-width="4"/>`;
    else item = `${box(82, 42, 68, 88, color, dark)}<circle cx="134" cy="88" r="5" fill="#d0aa5b"/>`;
  } else if (["grass-plot", "deck", "patio", "stone-walkway", "fence", "tree", "shrub", "hedge", "bbq", "outdoor-bar", "fire-pit", "horseshoes", "volleyball-net"].includes(asset.kind)) {
    if (asset.kind === "grass-plot") item = `${box(48, 70, 136, 46, color, "#4f6f42")}<line x1="64" y1="92" x2="170" y2="80" stroke="#87a86e" stroke-width="4"/>`;
    else if (asset.kind === "fence") item = `${box(54, 76, 124, 12, "#e2d5bd", dark)}${box(54, 106, 124, 12, "#e2d5bd", dark)}${box(68, 54, 14, 76, "#e2d5bd", dark)}${box(116, 54, 14, 76, "#e2d5bd", dark)}${box(164, 54, 14, 76, "#e2d5bd", dark)}`;
    else if (asset.kind === "tree") item = `${box(108, 82, 16, 46, "#7a5233", "#5f3f27")}${circle(100, 72, 30, color)}${circle(130, 74, 34, color)}${circle(116, 48, 36, color)}`;
    else if (asset.kind === "shrub") item = `${circle(92, 90, 28, color)}${circle(120, 82, 34, color)}${circle(148, 92, 24, color)}`;
    else if (asset.kind === "hedge") item = `${box(54, 78, 124, 34, color, dark)}${circle(68, 96, 18, light, dark)}${circle(104, 88, 24, color, dark)}${circle(144, 96, 20, shadeHex(color, -8), dark)}`;
    else if (asset.kind === "bbq") item = `${box(84, 66, 66, 48, metal, "#111")}${circle(96, 120, 9, "#111")}${circle(138, 120, 9, "#111")}<line x1="78" y1="62" x2="156" y2="62" stroke="#87908e" stroke-width="6"/>`;
    else if (asset.kind === "outdoor-bar") item = `${box(54, 76, 124, 44, color, dark)}${box(62, 58, 108, 20, "#d8c5a8", dark)}${box(78, 42, 22, 22, "#9ed2d8", "#6f9298")}${box(112, 42, 22, 22, "#9ed2d8", "#6f9298")}`;
    else if (asset.kind === "fire-pit") item = `${circle(116, 92, 44, "#5b5850")}<path d="M98 96 C108 70 118 88 116 58 C136 80 138 96 128 108 Z" fill="#d97835" stroke="#a94124" stroke-width="3"/>`;
    else if (asset.kind === "horseshoes") item = `${box(58, 58, 116, 70, "#b79466", "#8b6b44")}<path d="M88 78 C72 78 72 108 88 108" fill="none" stroke="#3b3d3e" stroke-width="7"/><path d="M146 78 C162 78 162 108 146 108" fill="none" stroke="#3b3d3e" stroke-width="7"/><line x1="116" y1="62" x2="116" y2="120" stroke="#5d4430" stroke-width="5"/>`;
    else if (asset.kind === "volleyball-net") item = `<line x1="62" y1="126" x2="62" y2="42" stroke="#6d5137" stroke-width="7"/><line x1="170" y1="126" x2="170" y2="42" stroke="#6d5137" stroke-width="7"/>${box(66, 48, 100, 56, "#f4ead8", "#c8bea9")}<line x1="66" y1="66" x2="166" y2="66" stroke="#c8bea9" stroke-width="3"/><line x1="98" y1="48" x2="98" y2="104" stroke="#c8bea9" stroke-width="3"/><line x1="132" y1="48" x2="132" y2="104" stroke="#c8bea9" stroke-width="3"/>`;
    else item = `${box(54, 74, 124, 42, color, dark)}<line x1="72" y1="78" x2="72" y2="112" stroke="${dark}" stroke-width="3"/><line x1="102" y1="78" x2="102" y2="112" stroke="${dark}" stroke-width="3"/><line x1="132" y1="78" x2="132" y2="112" stroke="${dark}" stroke-width="3"/>`;
  } else if (["cat", "dog", "pet-bed", "pet-bowl", "cat-tree", "aquarium"].includes(asset.kind)) {
    if (asset.kind === "cat") item = `${circle(96, 80, 18, color)}${circle(128, 86, 24, color)}<path d="M82 66 L88 42 L100 64 Z" fill="${color}" stroke="${dark}" stroke-width="3"/><path d="M102 64 L116 42 L116 70 Z" fill="${color}" stroke="${dark}" stroke-width="3"/><path d="M150 86 C176 78 174 58 156 62" fill="none" stroke="${dark}" stroke-width="8" stroke-linecap="round"/>`;
    else if (asset.kind === "dog") item = `${circle(90, 78, 22, color)}${box(104, 76, 54, 34, color)}${circle(80, 64, 8, dark)}<path d="M96 58 L112 38 L116 66 Z" fill="${dark}"/><path d="M154 82 C178 70 182 92 160 94" fill="none" stroke="${dark}" stroke-width="8" stroke-linecap="round"/>`;
    else if (asset.kind === "pet-bed") item = `${box(60, 76, 112, 42, color)}${box(76, 86, 80, 20, "#e8d5c3", "#e8d5c3")}`;
    else if (asset.kind === "pet-bowl") item = `<ellipse cx="116" cy="94" rx="52" ry="22" fill="${color}" stroke="${dark}" stroke-width="4"/><ellipse cx="116" cy="88" rx="36" ry="10" fill="#dce7e7"/>`;
    else if (asset.kind === "cat-tree") item = `${box(104, 54, 22, 74, wood)}${box(70, 74, 92, 18, color)}${box(78, 42, 54, 18, color)}${circle(146, 58, 20, color)}`;
    else item = `${box(64, 56, 104, 62, "#9ed2d8", dark)}<path d="M86 94 C100 78 116 106 132 88 C144 76 152 92 154 104" fill="none" stroke="#446c7a" stroke-width="4"/>${circle(106, 82, 8, "#d0a45d")}${circle(136, 96, 7, "#d08a5d")}`;
  } else {
    item = box(80, 60, 72, 52, color);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 232 160">${base}${item}</svg>`;
}

function shadeHex(hex, amount) {
  const raw = hex.replace("#", "");
  const num = Number.parseInt(raw.length === 3 ? raw.split("").map((char) => char + char).join("") : raw, 16);
  const r = THREE.MathUtils.clamp((num >> 16) + amount, 0, 255);
  const g = THREE.MathUtils.clamp(((num >> 8) & 255) + amount, 0, 255);
  const b = THREE.MathUtils.clamp((num & 255) + amount, 0, 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function wireUi() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeCategory = tab.dataset.category;
      state.activeAssetId = null;
      assetSearch.value = "";
      clearPlacementPreview();
      document.querySelectorAll(".tab").forEach((entry) => entry.classList.toggle("active", entry === tab));
      renderAssetPanel();
    });
  });

  assetSearch.addEventListener("input", renderAssetPanel);

  canvasWrap.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  });

  canvasWrap.addEventListener("drop", (event) => {
    event.preventDefault();
    const assetId = event.dataTransfer.getData("text/plain");
    const point = eventToPlacementPoint(event, assetId);
    if (assetId && point && canPlaceAsset(assetId, point)) placeAsset(assetId, point);
  });

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointercancel", onPointerUp);
  renderer.domElement.addEventListener("pointerleave", () => {
    if (!state.buildDrag.active) clearPlacementPreview();
  });

  roomWidthInput.addEventListener("input", () => updateRoomSize("width", Number(roomWidthInput.value), false));
  roomDepthInput.addEventListener("input", () => updateRoomSize("depth", Number(roomDepthInput.value), false));
  roomWidthInput.addEventListener("change", () => pushHistory());
  roomDepthInput.addEventListener("change", () => pushHistory());
  floorColorInput.addEventListener("input", () => {
    const roomEntry = getSelectedRoomEntry();
    if (roomEntry) {
      roomEntry.floorColor = floorColorInput.value;
      rebuildRoomEntry(roomEntry);
    } else {
      state.room.floorColor = floorColorInput.value;
      buildRoom();
    }
  });
  wallColorInput.addEventListener("input", () => {
    const roomEntry = getSelectedRoomEntry();
    if (roomEntry) {
      roomEntry.wallColor = wallColorInput.value;
      roomEntry.color = wallColorInput.value;
      rebuildRoomEntry(roomEntry);
    } else {
      state.room.wallColor = wallColorInput.value;
      state.room.color = wallColorInput.value;
      buildRoom();
    }
  });
  wallColorInput.addEventListener("change", pushHistory);
  floorColorInput.addEventListener("change", pushHistory);
  exteriorMaterialInput.addEventListener("change", () => {
    const roomEntry = getSelectedRoomEntry();
    if (roomEntry) {
      roomEntry.exteriorMaterial = exteriorMaterialInput.value;
      state.lastRoomExteriorMaterial = exteriorMaterialInput.value;
      rebuildRoomEntry(roomEntry);
    } else {
      state.room.exteriorMaterial = exteriorMaterialInput.value;
      state.lastRoomExteriorMaterial = exteriorMaterialInput.value;
      buildRoom();
    }
    pushHistory();
  });

  colorInput.addEventListener("input", () => {
    const entry = getSelectedEntry();
    if (!entry) return;
    if (isRoomEntry(entry)) {
      entry.wallColor = colorInput.value;
      entry.color = colorInput.value;
      rebuildRoomEntry(entry);
      return;
    }
    entry.color = colorInput.value;
    rebuildEntry(entry);
  });
  colorInput.addEventListener("change", pushHistory);

  styleSelect.addEventListener("change", () => {
    const entry = getSelectedEntry();
    if (!entry) return;
    if (isRoomEntry(entry)) {
      entry.exteriorMaterial = styleSelect.value;
      state.lastRoomExteriorMaterial = styleSelect.value;
      rebuildRoomEntry(entry);
    } else {
      entry.material = styleSelect.value;
      rebuildEntry(entry);
    }
    pushHistory();
  });

  variantSelect.addEventListener("change", () => {
    const entry = getSelectedEntry();
    if (!entry) return;
    if (entry.locked) {
      variantSelect.value = entry.variant || defaultVariantForKind(entry.kind);
      flashHint(`${entry.label} is locked. Unlock it to change variants.`);
      return;
    }
    entry.variant = variantSelect.value;
    rebuildEntry(entry);
    clampEntryToRoom(entry);
    updateInspector();
    pushHistory();
  });

  scaleInput.addEventListener("input", () => {
    const entry = getSelectedEntry();
    if (!entry) return;
    if (entry.locked) return;
    entry.scale = Number(scaleInput.value);
    entry.group.scale.setScalar(entry.scale);
    clampEntryToRoom(entry);
  });
  scaleInput.addEventListener("change", pushHistory);

  lengthInput.addEventListener("input", () => {
    const entry = getSelectedEntry();
    if (!entry || entry.locked) return;
    resizeSelectedLength(Number(lengthInput.value), false);
  });
  lengthInput.addEventListener("change", () => resizeSelectedLength(Number(lengthInput.value), true));

  document.querySelector("#rotate-left").addEventListener("click", () => rotateSelected(-Math.PI / 8));
  document.querySelector("#rotate-right").addEventListener("click", () => rotateSelected(Math.PI / 8));
  duplicateBtn.addEventListener("click", duplicateSelected);
  lockRoomBtn.addEventListener("click", toggleSelectedLock);
  deleteBtn.addEventListener("click", deleteSelected);
  document.querySelector("#save-btn").addEventListener("click", () => openProjectModal("save"));
  document.querySelector("#load-btn").addEventListener("click", () => openProjectModal("load"));
  document.querySelector("#clear-btn").addEventListener("click", clearDesign);
  document.querySelector("#undo-btn").addEventListener("click", undo);
  document.querySelector("#redo-btn").addEventListener("click", redo);
  document.querySelector("#iso-view").addEventListener("click", () => setViewMode("iso"));
  document.querySelector("#top-view").addEventListener("click", () => setViewMode("top"));
  document.querySelector("#walk-view").addEventListener("click", () => setViewMode("walk"));
  document.querySelector("#shell-view").addEventListener("click", toggleShellView);
  roofsToggleBtn.addEventListener("click", toggleRoofsVisible);
  tourViewBtn.addEventListener("click", toggleTourMode);
  fidelityToggle.addEventListener("click", toggleHighFidelity);
  dozerBtn.addEventListener("click", () => setToolMode(state.toolMode === "bulldoze" ? "select" : "bulldoze"));
  levelOneBtn.addEventListener("click", () => setActiveLevel(1));
  levelTwoBtn.addEventListener("click", () => setActiveLevel(2));
  levelsAllBtn.addEventListener("click", () => toggleAllLevels());
  projectPrimaryBtn.addEventListener("click", handleProjectPrimary);
  projectSecondaryBtn.addEventListener("click", closeProjectModal);
  projectCloseBtn.addEventListener("click", closeProjectModal);
  projectModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeProjectModal();
  });

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (event) => {
    if (isTypingTarget(event.target)) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      event.preventDefault();
      copySelected();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
      event.preventDefault();
      pasteCopied();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicateSelected();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "x") {
      event.preventDefault();
      deleteSelected();
      return;
    }
    if (event.key.toLowerCase() === "f") toggleFullscreen();
    if (state.viewMode === "walk" && ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(event.key.toLowerCase())) {
      walkState.keys.add(event.key.toLowerCase());
      event.preventDefault();
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") deleteSelected();
    if (event.key.toLowerCase() === "b") setToolMode(state.toolMode === "bulldoze" ? "select" : "bulldoze");
    if (event.key.toLowerCase() === "l") toggleSelectedLock();
    if (["r", "e", "]"].includes(event.key.toLowerCase())) rotateSelected(Math.PI / 8);
    if (["q", "["].includes(event.key.toLowerCase())) rotateSelected(-Math.PI / 8);
  });
  window.addEventListener("keyup", (event) => {
    walkState.keys.delete(event.key.toLowerCase());
  });
  document.addEventListener("pointerlockchange", () => {
    walkState.pointerLocked = document.pointerLockElement === renderer.domElement;
    if (state.viewMode === "walk") {
      flashHint(walkState.pointerLocked ? "Walk mode: arrows or WASD move, mouse looks, Esc releases." : "Click the room canvas to look around in walk mode.");
    }
  });
  document.addEventListener("mousemove", (event) => {
    if (state.viewMode !== "walk" || document.pointerLockElement !== renderer.domElement) return;
    walkState.yaw -= event.movementX * 0.0025;
    walkState.pitch = THREE.MathUtils.clamp(walkState.pitch - event.movementY * 0.002, -0.82, 0.82);
    applyWalkCameraRotation();
  });
}

function addStarterRoom() {
  state.activeAssetId = null;
  selectObject(null);
  pushHistory();
}

function updateRoomSize(axis, value, record = true) {
  const roomEntry = getSelectedRoomEntry();
  if (roomEntry) {
    roomEntry[axis] = value;
    if (isMainRoomEntry(roomEntry)) buildRoom();
    else {
      rebuildEntry(roomEntry);
      snapRoomModule(roomEntry);
    }
    state.objects.forEach((entry) => {
      if (entry.roomId === roomEntry.uid) clampEntryToRoom(entry);
    });
  } else {
    state.room[axis] = value;
    buildRoom();
    state.objects.forEach((entry) => {
      if (!isRoomEntry(entry)) clampEntryToRoom(entry);
    });
  }
  updateRoofsForRooms();
  roomWidthValue.textContent = formatLength(valueForRoomControl("width"));
  roomDepthValue.textContent = formatLength(valueForRoomControl("depth"));
  if (record) pushHistory();
}

function placeAsset(assetId, point, recordHistory = true) {
  const asset = ASSETS.find((entry) => entry.id === assetId);
  if (!asset) return;
  if (asset.kind === "room-template") {
    placeRoomTemplate(asset, point, recordHistory);
    return;
  }
  const isRoomModule = asset.kind === "room-module";
  const activeLevel = state.activeLevel || 1;
  const containingRoom = asset.kind === "roof" ? findNearestRoomClusterBounds(point, activeLevel) : findContainingRoomBounds(point, 0.25, activeLevel);
  const entryLevel = containingRoom?.level || activeLevel;
  const isFreePlacement = isFreePlacementEntry(asset) || (!containingRoom && !isWallOpeningAsset(asset));
  const placedPosition = asset.kind === "roof" && containingRoom
    ? [snap(containingRoom.x), getLevelY(entryLevel), snap(containingRoom.z)]
    : [snap(point.x), getLevelY(entryLevel), snap(point.z)];

  const entry = {
    uid: crypto.randomUUID(),
    assetId,
    label: asset.label,
    kind: asset.kind,
    color: asset.color,
    material: asset.material,
    scale: 1,
    variant: defaultVariantForKind(asset.kind),
    position: placedPosition,
    rotationY: rememberedRotation(asset.kind),
    level: entryLevel,
    width: asset.kind === "roof" && containingRoom ? containingRoom.width + ROOF_OVERHANG : asset.width || state.room.width,
    depth: asset.kind === "roof" && containingRoom ? containingRoom.depth + ROOF_OVERHANG : asset.depth || state.room.depth,
    wallColor: asset.color || state.room.wallColor,
    floorColor: state.room.floorColor,
    exteriorMaterial: isRoomModule ? state.lastRoomExteriorMaterial || state.room.exteriorMaterial : undefined,
    roomId: isRoomModule || isFreePlacement ? null : containingRoom?.id || "main",
    roomCluster: asset.kind === "roof" ? containingRoom?.roomIds || [] : undefined,
    buildGroupId: null,
    locked: false,
    targetWallId: null,
  };
  entry.group = createAssetGroup(entry);
  scene.add(entry.group);
  state.objects.push(entry);
  if (isRoomModule) snapRoomModule(entry);
  else clampEntryToRoom(entry);
  if (hasPlacementCollision(entry)) {
    scene.remove(entry.group);
    disposeObject(entry.group);
    state.objects = state.objects.filter((item) => item.uid !== entry.uid);
    flashHint(`${asset.label} needs more room.`);
    return;
  }
  if (isWallOpeningEntry(entry)) rebuildForOpenings([entry]);
  selectObject(entry.uid);
  updateLevelVisibility();
  state.activeAssetId = null;
  clearPlacementPreview();
  renderAssetPanel();
  if (recordHistory) pushHistory();
  flashHint(`${asset.label} placed and selected.`);
}

function placeRoomTemplate(asset, point, recordHistory = true) {
  const template = ROOM_TEMPLATES[asset.id];
  if (!template || !point) return;
  const templateRoom = template.room;
  const level = state.activeLevel || 1;
  const roomEntry = {
    uid: crypto.randomUUID(),
    assetId: "room-module",
    label: templateRoom.label,
    kind: "room-module",
    color: templateRoom.wallColor,
    material: "painted",
    variant: "default",
    scale: 1,
    position: [snap(point.x), getLevelY(level), snap(point.z)],
    rotationY: 0,
    level,
    width: templateRoom.width,
    depth: templateRoom.depth,
    wallColor: templateRoom.wallColor,
    floorColor: templateRoom.floorColor,
    exteriorMaterial: state.lastRoomExteriorMaterial || templateRoom.exteriorMaterial || state.room.exteriorMaterial,
    roomId: null,
    locked: false,
  };
  roomEntry.group = createAssetGroup(roomEntry);
  scene.add(roomEntry.group);
  state.objects.push(roomEntry);
  snapRoomModule(roomEntry);

  const roomCenter = new THREE.Vector3().fromArray(roomEntry.position);
  const createdEntries = [roomEntry];
  template.items.forEach((item) => {
    const itemAsset = ASSETS.find((candidate) => candidate.id === item.assetId);
    if (!itemAsset) return;
    const entry = {
      uid: crypto.randomUUID(),
      assetId: item.assetId,
      label: itemAsset.label,
      kind: itemAsset.kind,
      color: item.color || itemAsset.color,
      material: item.material || itemAsset.material,
      variant: item.variant || defaultVariantForKind(itemAsset.kind),
      scale: item.scale || 1,
      position: [snap(roomCenter.x + item.x), getLevelY(level), snap(roomCenter.z + item.z)],
      rotationY: item.rotationY ?? rememberedRotation(itemAsset.kind),
      level,
      width: itemAsset.width || templateRoom.width,
      depth: itemAsset.depth || templateRoom.depth,
      wallColor: itemAsset.color || templateRoom.wallColor,
      floorColor: templateRoom.floorColor,
      exteriorMaterial: undefined,
      roomId: roomEntry.uid,
      buildGroupId: null,
      locked: false,
      targetWallId: null,
    };
    entry.group = createAssetGroup(entry);
    scene.add(entry.group);
    state.objects.push(entry);
    clampEntryToRoom(entry);
    createdEntries.push(entry);
  });

  rebuildRoomShells();
  selectObject(roomEntry.uid);
  updateLevelVisibility();
  state.activeAssetId = null;
  clearPlacementPreview();
  renderAssetPanel();
  if (recordHistory) pushHistory();
  flashHint(`${asset.label} placed with ${createdEntries.length - 1} editable items.`);
}

function createAssetGroup(entry) {
  const group = new THREE.Group();
  group.userData.uid = entry.uid;
  group.userData.selectable = true;
  entry.level = entry.level || levelFromY(entry.position?.[1] || 0);
  entry.position = [entry.position?.[0] || 0, getLevelY(entry.level), entry.position?.[2] || 0];
  group.position.fromArray(entry.position);
  group.rotation.y = entry.rotationY;
  group.scale.setScalar(entry.scale);

  if (entry.kind === "room-module") createRoomModule(group, entry);
  else if (entry.kind === "door") createDoor(group, entry);
  else if (entry.kind === "sliding-patio-door" || entry.kind === "french-patio-door") createPatioDoor(group, entry);
  else if (entry.kind === "window") createWindow(group, entry);
  else if (entry.kind === "archway") createArchway(group, entry);
  else if (entry.kind === "sofa") createSofa(group, entry);
  else if (entry.kind === "loveseat") createLoveseat(group, entry);
  else if (entry.kind === "armchair") createArmchair(group, entry);
  else if (entry.kind === "chair") createChair(group, entry);
  else if (entry.kind === "stool") createStool(group, entry);
  else if (entry.kind === "bench") createBench(group, entry);
  else if (entry.kind === "ottoman") createOttoman(group, entry);
  else if (entry.kind === "bean-bag") createBeanBag(group, entry);
  else if (entry.kind === "desk") createDesk(group, entry);
  else if (entry.kind === "computer") createComputer(group, entry);
  else if (entry.kind === "laptop") createLaptop(group, entry);
  else if (entry.kind === "drawing-tablet") createDrawingTablet(group, entry);
  else if (entry.kind === "easel") createEasel(group, entry);
  else if (entry.kind === "bookshelf") createBookshelf(group, entry);
  else if (entry.kind === "bed") createBed(group, entry);
  else if (entry.kind === "wardrobe") createWardrobe(group, entry);
  else if (entry.kind === "dresser") createDresser(group, entry);
  else if (entry.kind === "cube-shelf") createCubeShelf(group, entry);
  else if (entry.kind === "wall-shelf") createWallShelf(group, entry);
  else if (entry.kind === "book-stack") createBookStack(group, entry);
  else if (entry.kind === "storage-basket") createStorageBasket(group, entry);
  else if (entry.kind === "plant") createPlant(group, entry);
  else if (entry.kind === "tall-plant") createTallPlant(group, entry);
  else if (entry.kind === "small-plant") createSmallPlant(group, entry);
  else if (entry.kind === "curtains") createCurtains(group, entry);
  else if (entry.kind === "rug") createRug(group, entry);
  else if (entry.kind === "round-rug") createRoundRug(group, entry);
  else if (entry.kind === "mirror") createMirror(group, entry);
  else if (entry.kind === "wall-art") createWallArt(group, entry);
  else if (entry.kind === "clock") createClock(group, entry);
  else if (entry.kind === "vase") createVase(group, entry);
  else if (entry.kind === "throw-pillows") createThrowPillows(group, entry);
  else if (entry.kind === "blanket") createBlanket(group, entry);
  else if (entry.kind === "candle-set") createCandleSet(group, entry);
  else if (entry.kind === "sculpture") createSculpture(group, entry);
  else if (entry.kind === "television") createTelevision(group, entry);
  else if (entry.kind === "speakers") createSpeakers(group, entry);
  else if (entry.kind === "game-console") createGameConsole(group, entry);
  else if (entry.kind === "record-player") createRecordPlayer(group, entry);
  else if (entry.kind === "floor-lamp") createFloorLamp(group, entry);
  else if (entry.kind === "table-lamp") createTableLamp(group, entry);
  else if (entry.kind === "ceiling-light") createCeilingLight(group, entry);
  else if (entry.kind === "coffee-table") createCoffeeTable(group, entry);
  else if (entry.kind === "side-table") createSideTable(group, entry);
  else if (entry.kind === "nightstand") createNightstand(group, entry);
  else if (entry.kind === "vanity") createVanity(group, entry);
  else if (["kitchen-counter", "kitchen-island", "refrigerator", "stove", "sink", "upper-cabinet"].includes(entry.kind)) createKitchenAsset(group, entry);
  else if (["toilet", "bathtub", "shower", "bath-vanity"].includes(entry.kind)) createBathAsset(group, entry);
  else if (["stairs", "wide-stairs", "stair-landing", "front-door", "roof"].includes(entry.kind)) createStructureAsset(group, entry);
  else if (["grass-plot", "deck", "patio", "stone-walkway", "fence", "tree", "shrub", "hedge", "bbq", "outdoor-bar", "fire-pit", "horseshoes", "volleyball-net"].includes(entry.kind)) createOutdoorAsset(group, entry);
  else if (entry.kind === "interior-wall") createInteriorWall(group, entry);
  else if (["cat", "dog", "pet-bed", "pet-bowl", "cat-tree", "aquarium"].includes(entry.kind)) createPetAsset(group, entry);

  if (entry.kind === "roof") group.visible = state.roofsVisible;

  group.traverse((child) => {
    if (!child.isMesh) return;
    const roomShellPart = entry.kind === "room-module" && /wall|baseboard|floor|grid/i.test(child.name);
    const flatOutdoorPart = ["grass-plot", "patio", "stone-walkway", "deck"].includes(entry.kind);
    child.castShadow = !roomShellPart && !flatOutdoorPart;
    child.receiveShadow = true;
    child.userData.uid = entry.uid;
    child.userData.selectable = true;
    child.userData.basePosition = child.position.clone();
    child.userData.baseRotation = child.rotation.clone();
  });
  return group;
}

function createRoomModule(group, entry) {
  addRoomShell(
    group,
    entry.width || 4,
    entry.depth || 4,
    entry.wallColor || entry.color,
    entry.floorColor || state.room.floorColor,
    entry.uid,
    entry.exteriorMaterial || state.room.exteriorMaterial,
  );
}

function createDoor(group, entry) {
  const frame = makeMat("#f0e5d2", "painted");
  const wood = makeMat(entry.color, entry.material);
  addBox(group, [1.05, 0.14, 0.16], [0, 2.08, 0], frame, "Door header");
  addBox(group, [0.14, 2.1, 0.16], [-0.54, 1.05, 0], frame, "Door frame");
  addBox(group, [0.14, 2.1, 0.16], [0.54, 1.05, 0], frame, "Door frame");
  if ((entry.variant || "open") === "closed") {
    addBox(group, [0.88, 1.86, 0.1], [0, 0.93, 0.02], wood, "Closed door slab");
    addBox(group, [0.1, 0.08, 0.08], [0.3, 1.02, 0.12], makeMat("#d0aa5b", "metal"), "Door knob");
  } else {
    const slab = addBox(group, [0.52, 1.82, 0.1], [0.36, 0.91, 0.26], wood, "Open door slab");
    slab.rotation.y = -Math.PI / 3;
  }
}

function createPatioDoor(group, entry) {
  const frame = makeMat(entry.kind === "french-patio-door" ? entry.color : "#f0e5d2", entry.material);
  const glass = makeMat("#9fc8ce", "metal");
  const width = entry.kind === "french-patio-door" ? 1.7 : 1.9;
  addBox(group, [width, 0.14, 0.16], [0, 2.12, 0], frame, "Patio door header");
  addBox(group, [0.14, 2.16, 0.16], [-width / 2, 1.08, 0], frame, "Patio door frame");
  addBox(group, [0.14, 2.16, 0.16], [width / 2, 1.08, 0], frame, "Patio door frame");
  if (entry.kind === "french-patio-door") {
    addBox(group, [0.72, 1.82, 0.08], [-0.39, 0.96, 0.02], glass, "French patio glass");
    addBox(group, [0.72, 1.82, 0.08], [0.39, 0.96, 0.02], glass, "French patio glass");
    addBox(group, [0.08, 1.9, 0.12], [0, 0.98, 0.04], frame, "French door meeting stile");
    addBox(group, [0.12, 0.08, 0.1], [-0.08, 1.08, 0.14], makeMat("#d0aa5b", "metal"), "Door handle");
    addBox(group, [0.12, 0.08, 0.1], [0.08, 1.08, 0.14], makeMat("#d0aa5b", "metal"), "Door handle");
  } else {
    addBox(group, [0.84, 1.86, 0.08], [-0.36, 0.98, 0.02], glass, "Sliding patio glass");
    addBox(group, [0.84, 1.86, 0.08], [0.36, 0.98, 0.08], makeMat("#b8d7dc", "metal"), "Sliding patio glass");
    addBox(group, [0.08, 1.92, 0.12], [0, 1.0, 0.12], frame, "Sliding rail");
    addBox(group, [1.8, 0.08, 0.16], [0, 0.12, 0], frame, "Sliding track");
  }
}

function createWindow(group, entry) {
  const frame = makeMat("#f5eee2", "painted");
  addBox(group, [1.24, 0.12, 0.14], [0, 1.78, 0], frame, "Window frame");
  addBox(group, [1.24, 0.12, 0.14], [0, 0.92, 0], frame, "Window frame");
  addBox(group, [0.12, 0.9, 0.14], [-0.62, 1.35, 0], frame, "Window frame");
  addBox(group, [0.12, 0.9, 0.14], [0.62, 1.35, 0], frame, "Window frame");
  addBox(group, [1.0, 0.72, 0.04], [0, 1.35, 0.02], makeMat(entry.color, "metal"), "Window glass");
}

function createArchway(group) {
  const frame = makeMat("#f0e8dc", "painted");
  addBox(group, [1.25, 0.16, 0.18], [0, 2.14, 0], frame, "Arch header");
  addBox(group, [0.18, 2.15, 0.18], [-0.62, 1.07, 0], frame, "Arch side");
  addBox(group, [0.18, 2.15, 0.18], [0.62, 1.07, 0], frame, "Arch side");
}

function createSofa(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  const variant = entry.variant || "classic";
  addBox(group, [2.2, 0.38, 0.9], [0, 0.38, 0], mat, "Seat");
  addBox(group, [2.25, 0.88, 0.24], [0, 0.76, -0.36], mat, "Back");
  addBox(group, [0.24, variant === "modern" ? 0.42 : 0.68, 0.92], [-1.16, 0.58, 0], mat, "Left arm");
  addBox(group, [0.24, variant === "modern" ? 0.42 : 0.68, 0.92], [1.16, 0.58, 0], mat, "Right arm");
  addBox(group, [0.92, 0.12, 0.4], [-0.52, 0.62, 0.12], makeMat("#f2e7d3", "fabric"), "Cushion");
  addBox(group, [0.92, 0.12, 0.4], [0.52, 0.62, 0.12], makeMat("#f2e7d3", "fabric"), "Cushion");
  if (variant === "sectional") {
    addBox(group, [0.92, 0.34, 1.55], [0.62, 0.36, 0.58], mat, "Chaise");
    addBox(group, [0.78, 0.12, 0.68], [0.62, 0.61, 0.75], makeMat("#f2e7d3", "fabric"), "Chaise cushion");
  } else if (variant === "modern") {
    forEachCorner(1.78, 0.6, (x, z) => addBox(group, [0.06, 0.24, 0.06], [x, 0.12, z], makeMat("#2f3333", "metal"), "Metal leg"));
  }
}

function createLoveseat(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addBox(group, [1.65, 0.38, 0.86], [0, 0.38, 0], mat, "Loveseat seat");
  addBox(group, [1.7, 0.82, 0.22], [0, 0.74, -0.34], mat, "Loveseat back");
  addBox(group, [0.2, 0.62, 0.86], [-0.88, 0.56, 0], mat, "Arm");
  addBox(group, [0.2, 0.62, 0.86], [0.88, 0.56, 0], mat, "Arm");
  addBox(group, [0.68, 0.12, 0.38], [-0.38, 0.62, 0.1], makeMat("#f1e4cf", "fabric"), "Cushion");
  addBox(group, [0.68, 0.12, 0.38], [0.38, 0.62, 0.1], makeMat("#f1e4cf", "fabric"), "Cushion");
}

function createArmchair(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addBox(group, [0.95, 0.36, 0.86], [0, 0.38, 0], mat, "Chair seat");
  addBox(group, [1.0, 0.88, 0.22], [0, 0.76, -0.35], mat, "Chair back");
  addBox(group, [0.2, 0.68, 0.86], [-0.58, 0.58, 0], makeMat("#815633", "wood"), "Arm");
  addBox(group, [0.2, 0.68, 0.86], [0.58, 0.58, 0], makeMat("#815633", "wood"), "Arm");
  addBox(group, [0.75, 0.12, 0.42], [0, 0.62, 0.09], mat, "Cushion");
}

function createChair(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  const variant = entry.variant || "dining";
  if (variant === "rounded") {
    addCylinder(group, 0.34, 0.14, [0, 0.5, 0], mat, "Round seat");
    addBox(group, [0.62, 0.72, 0.12], [0, 0.88, -0.24], mat, "Curved back");
  } else {
    addBox(group, [variant === "lounge" ? 0.82 : 0.65, 0.14, variant === "lounge" ? 0.72 : 0.62], [0, variant === "lounge" ? 0.42 : 0.5, 0], mat, "Seat");
    addBox(group, [variant === "lounge" ? 0.82 : 0.66, variant === "lounge" ? 0.62 : 0.82, 0.12], [0, variant === "lounge" ? 0.78 : 0.92, -0.26], mat, "Back");
  }
  forEachCorner(variant === "lounge" ? 0.62 : 0.5, 0.42, (x, z) => addBox(group, [0.08, variant === "lounge" ? 0.42 : 0.5, 0.08], [x, (variant === "lounge" ? 0.42 : 0.5) / 2, z], mat, "Leg"));
}

function createStool(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addCylinder(group, 0.32, 0.14, [0, 0.58, 0], mat, "Stool top");
  forEachCorner(0.42, 0.42, (x, z) => addBox(group, [0.06, 0.56, 0.06], [x, 0.28, z], mat, "Stool leg"));
}

function createBench(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addBox(group, [1.65, 0.18, 0.52], [0, 0.52, 0], mat, "Bench seat");
  addBox(group, [1.7, 0.58, 0.12], [0, 0.82, -0.24], mat, "Bench back");
  forEachCorner(1.32, 0.34, (x, z) => addBox(group, [0.08, 0.5, 0.08], [x, 0.25, z], mat, "Bench leg"));
}

function createOttoman(group, entry) {
  addBox(group, [0.9, 0.42, 0.72], [0, 0.25, 0], makeMat(entry.color, entry.material), "Ottoman");
}

function createBeanBag(group, entry) {
  const bag = new THREE.Mesh(new THREE.SphereGeometry(0.58, 24, 16), makeMat(entry.color, entry.material));
  bag.scale.set(1.15, 0.55, 0.95);
  bag.position.y = 0.34;
  group.add(bag);
}

function createDesk(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  const variant = entry.variant || "drawer";
  addBox(group, [variant === "corner" ? 1.8 : 1.8, 0.16, 0.85], [0, 0.78, 0], mat, "Desktop");
  if (variant === "corner") {
    addBox(group, [0.85, 0.16, 1.55], [-0.48, 0.78, 0.35], mat, "Return desktop");
    addBox(group, [0.55, 0.68, 0.78], [0.58, 0.38, 0], mat, "Drawer stack");
  } else if (variant === "trestle") {
    addBox(group, [0.12, 0.72, 0.72], [-0.68, 0.36, 0], mat, "Trestle leg");
    addBox(group, [0.12, 0.72, 0.72], [0.68, 0.36, 0], mat, "Trestle leg");
  } else {
    addBox(group, [0.55, 0.68, 0.78], [0.58, 0.38, 0], mat, "Drawer stack");
    addBox(group, [0.12, 0.72, 0.12], [-0.75, 0.36, -0.31], mat, "Leg");
    addBox(group, [0.12, 0.72, 0.12], [-0.75, 0.36, 0.31], mat, "Leg");
  }
}

function createComputer(group) {
  addBox(group, [0.95, 0.56, 0.06], [0, 1.18, -0.18], makeMat("#202325", "metal"), "Monitor");
  addBox(group, [0.78, 0.46, 0.025], [0, 1.18, -0.145], makeMat("#111516", "metal"), "Screen");
  addBox(group, [0.16, 0.42, 0.08], [0, 0.9, -0.14], makeMat("#303635", "metal"), "Stand");
  addBox(group, [0.74, 0.05, 0.28], [0, 0.82, 0.28], makeMat("#252829", "metal"), "Keyboard");
  addBox(group, [0.22, 0.05, 0.32], [0.56, 0.82, 0.28], makeMat("#242728", "metal"), "Mouse");
}

function createLaptop(group) {
  addBox(group, [0.78, 0.045, 0.48], [0, 0.84, 0.14], makeMat("#2b2e30", "metal"), "Laptop base");
  const screen = addBox(group, [0.78, 0.5, 0.04], [0, 1.1, -0.1], makeMat("#202325", "metal"), "Laptop screen");
  screen.rotation.x = -0.2;
}

function createDrawingTablet(group, entry) {
  addBox(group, [0.88, 0.04, 0.58], [0, 0.84, 0], makeMat(entry.color, "metal"), "Drawing tablet");
  addBox(group, [0.74, 0.025, 0.44], [0, 0.87, 0], makeMat("#151819", "metal"), "Tablet surface");
  addCylinder(group, 0.018, 0.62, [0.55, 0.89, 0.02], makeMat("#232629", "metal"), "Stylus", Math.PI / 2);
}

function createEasel(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addBox(group, [0.08, 1.65, 0.08], [-0.34, 0.82, 0], mat, "Easel leg");
  addBox(group, [0.08, 1.65, 0.08], [0.34, 0.82, 0], mat, "Easel leg");
  addBox(group, [0.08, 1.55, 0.08], [0, 0.78, -0.28], mat, "Rear leg");
  addBox(group, [0.9, 0.72, 0.06], [0, 1.15, 0.05], makeMat("#ead9bd", "painted"), "Canvas");
}

function createBookshelf(group, entry) {
  const wood = makeMat(entry.color, entry.material);
  addBox(group, [1.25, 2.1, 0.38], [0, 1.05, 0], wood, "Bookshelf frame");
  addBox(group, [1.1, 0.08, 0.44], [0, 0.55, 0.02], makeMat("#7c4b2c", "wood"), "Shelf");
  addBox(group, [1.1, 0.08, 0.44], [0, 1.08, 0.02], makeMat("#7c4b2c", "wood"), "Shelf");
  addBox(group, [1.1, 0.08, 0.44], [0, 1.62, 0.02], makeMat("#7c4b2c", "wood"), "Shelf");
  [-0.38, -0.12, 0.16, 0.4].forEach((x, index) => {
    addBox(group, [0.14, 0.52, 0.18], [x, 0.86 + (index % 2) * 0.54, 0.26], makeMat(["#4e6d8c", "#d0aa5b", "#8f4a3f", "#6c8757"][index], "painted"), "Book");
  });
}

function createCubeShelf(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addBox(group, [1.25, 1.25, 0.4], [0, 0.62, 0], mat, "Cube shelf");
  addBox(group, [1.16, 0.06, 0.45], [0, 0.62, 0.03], makeMat("#744626", "wood"), "Divider");
  addBox(group, [0.06, 1.16, 0.45], [0, 0.62, 0.03], makeMat("#744626", "wood"), "Divider");
  addBox(group, [0.36, 0.28, 0.22], [-0.32, 0.32, 0.25], makeMat("#caa56d", "fabric"), "Bin");
  addBox(group, [0.36, 0.28, 0.22], [0.32, 0.9, 0.25], makeMat("#6f875c", "fabric"), "Bin");
}

function createWallShelf(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addBox(group, [1.45, 0.1, 0.32], [0, 1.42, 0], mat, "Wall shelf");
  addBox(group, [0.1, 0.42, 0.25], [-0.55, 1.22, 0], mat, "Bracket");
  addBox(group, [0.1, 0.42, 0.25], [0.55, 1.22, 0], mat, "Bracket");
  addBox(group, [0.18, 0.38, 0.16], [-0.25, 1.68, 0.04], makeMat("#6c8757", "painted"), "Book");
  addBox(group, [0.18, 0.28, 0.16], [0.0, 1.63, 0.04], makeMat("#d0aa5b", "painted"), "Book");
}

function createBookStack(group) {
  ["#4e6d8c", "#d0aa5b", "#8f4a3f", "#6c8757"].forEach((color, index) => {
    addBox(group, [0.62 - index * 0.04, 0.08, 0.42], [0, 0.06 + index * 0.08, 0], makeMat(color, "painted"), "Book");
  });
}

function createStorageBasket(group, entry) {
  addBox(group, [0.75, 0.38, 0.55], [0, 0.22, 0], makeMat(entry.color, entry.material), "Basket");
  addCylinder(group, 0.035, 0.58, [-0.28, 0.48, 0], makeMat("#8b6848", "wood"), "Handle", Math.PI / 2);
  addCylinder(group, 0.035, 0.58, [0.28, 0.48, 0], makeMat("#8b6848", "wood"), "Handle", Math.PI / 2);
}

function createBed(group, entry) {
  const variant = entry.variant || "classic";
  const baseHeight = variant === "platform" ? 0.26 : 0.42;
  addBox(group, [2.15, baseHeight, 3.0], [0, 0.25 + baseHeight / 2, 0], makeMat("#b88655", "wood"), "Bed base");
  addBox(group, [2.0, 0.22, 2.5], [0, variant === "platform" ? 0.56 : 0.68, 0.18], makeMat(entry.color, entry.material), "Blanket");
  addBox(group, [2.2, variant === "platform" ? 0.58 : 1.06, 0.22], [0, variant === "platform" ? 0.54 : 0.72, -1.55], makeMat("#8b5532", "wood"), "Headboard");
  addBox(group, [0.82, 0.18, 0.48], [-0.48, variant === "platform" ? 0.78 : 0.9, -1.05], makeMat("#f4eee2", "fabric"), "Pillow");
  addBox(group, [0.82, 0.18, 0.48], [0.48, variant === "platform" ? 0.78 : 0.9, -1.05], makeMat("#f4eee2", "fabric"), "Pillow");
  if (variant === "canopy") {
    forEachCorner(1.95, 2.75, (x, z) => addBox(group, [0.08, 1.95, 0.08], [x, 1.05, z], makeMat("#8b5532", "wood"), "Canopy post"));
    addBox(group, [2.1, 0.08, 0.08], [0, 2.02, -1.38], makeMat("#8b5532", "wood"), "Canopy rail");
    addBox(group, [2.1, 0.08, 0.08], [0, 2.02, 1.38], makeMat("#8b5532", "wood"), "Canopy rail");
    addBox(group, [0.08, 0.08, 2.85], [-0.98, 2.02, 0], makeMat("#8b5532", "wood"), "Canopy rail");
    addBox(group, [0.08, 0.08, 2.85], [0.98, 2.02, 0], makeMat("#8b5532", "wood"), "Canopy rail");
  }
}

function createWardrobe(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addBox(group, [1.6, 2.25, 0.55], [0, 1.12, 0], mat, "Wardrobe");
  addBox(group, [0.04, 2.05, 0.6], [0, 1.12, 0.02], makeMat("#774525", "wood"), "Door seam");
  addBox(group, [0.07, 0.34, 0.05], [-0.18, 1.12, 0.32], makeMat("#c29a4b", "metal"), "Handle");
  addBox(group, [0.07, 0.34, 0.05], [0.18, 1.12, 0.32], makeMat("#c29a4b", "metal"), "Handle");
}

function createDresser(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addBox(group, [1.65, 1.02, 0.58], [0, 0.51, 0], mat, "Dresser");
  [-0.24, 0.06, 0.36].forEach((y) => {
    addBox(group, [1.5, 0.05, 0.05], [0, 0.54 + y, 0.32], makeMat("#794624", "wood"), "Drawer line");
    addBox(group, [0.22, 0.05, 0.05], [-0.34, 0.54 + y, 0.36], makeMat("#c29a4b", "metal"), "Handle");
    addBox(group, [0.22, 0.05, 0.05], [0.34, 0.54 + y, 0.36], makeMat("#c29a4b", "metal"), "Handle");
  });
}

function createPlant(group, entry) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.42, 20), makeMat("#d7c9b2", "painted"));
  pot.position.y = 0.21;
  group.add(pot);
  const leafMat = makeMat(entry.color, "painted");
  [[0, 0.75, 0, 0.48], [-0.25, 0.62, 0.05, 0.32], [0.28, 0.68, -0.02, 0.34], [0.05, 0.98, 0.02, 0.32]].forEach(([x, y, z, radius]) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), leafMat);
    leaf.scale.set(0.75, 1.15, 0.45);
    leaf.position.set(x, y, z);
    group.add(leaf);
  });
}

function createTallPlant(group, entry) {
  createPlant(group, entry);
  const stem = addCylinder(group, 0.035, 1.1, [0, 0.82, 0], makeMat("#5f492d", "wood"), "Plant stem");
  stem.castShadow = true;
}

function createSmallPlant(group, entry) {
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.28, 18), makeMat("#d7c9b2", "painted"));
  pot.position.y = 0.14;
  group.add(pot);
  const leafMat = makeMat(entry.color, "painted");
  [[0, 0.44, 0, 0.26], [-0.14, 0.38, 0.04, 0.18], [0.15, 0.4, -0.02, 0.18]].forEach(([x, y, z, radius]) => {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 10), leafMat);
    leaf.scale.set(0.75, 1.05, 0.45);
    leaf.position.set(x, y, z);
    group.add(leaf);
  });
}

function createCurtains(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addCylinder(group, 0.035, 1.7, [0, 2.25, 0], makeMat("#9b6b37", "wood"), "Curtain rod", Math.PI / 2);
  addBox(group, [0.62, 1.65, 0.08], [-0.42, 1.4, 0], mat, "Left curtain");
  addBox(group, [0.62, 1.65, 0.08], [0.42, 1.4, 0], mat, "Right curtain");
}

function createRug(group, entry) {
  const rug = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.035, 1.45), makeMat(entry.color, entry.material));
  rug.position.set(0, 0.12, 0);
  rug.receiveShadow = true;
  group.add(rug);
  const variant = entry.variant || "border";
  if (variant === "striped") {
    [-0.44, -0.15, 0.15, 0.44].forEach((z) => addBox(group, [2.05, 0.025, 0.06], [0, 0.15, z], makeMat("#efe2c4", "fabric"), "Rug stripe"));
  } else if (variant === "border") {
    addBox(group, [2.05, 0.025, 0.06], [0, 0.15, -0.54], makeMat("#efe2c4", "fabric"), "Rug stripe");
    addBox(group, [2.05, 0.025, 0.06], [0, 0.15, 0.54], makeMat("#efe2c4", "fabric"), "Rug stripe");
    addBox(group, [0.06, 0.025, 1.16], [-0.96, 0.15, 0], makeMat("#efe2c4", "fabric"), "Rug stripe");
    addBox(group, [0.06, 0.025, 1.16], [0.96, 0.15, 0], makeMat("#efe2c4", "fabric"), "Rug stripe");
  }
}

function createRoundRug(group, entry) {
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.035, 40), makeMat(entry.color, entry.material));
  rug.position.y = 0.12;
  group.add(rug);
  if ((entry.variant || "ring") === "ring") addCylinder(group, 0.58, 0.025, [0, 0.15, 0], makeMat("#ead9bd", "fabric"), "Rug center");
}

function createMirror(group, entry) {
  addBox(group, [0.75, 1.35, 0.08], [0, 1.2, 0], makeMat(entry.color, "metal"), "Mirror frame");
  addBox(group, [0.62, 1.16, 0.035], [0, 1.2, 0.04], makeMat("#b8d2d5", "metal"), "Mirror glass");
}

function createWallArt(group, entry) {
  addBox(group, [1.05, 0.78, 0.06], [0, 1.45, 0], makeMat("#efe2c8", "painted"), "Canvas");
  addBox(group, [1.18, 0.9, 0.08], [0, 1.45, -0.02], makeMat(entry.color, entry.material), "Frame");
  addBox(group, [0.42, 0.28, 0.03], [-0.18, 1.5, 0.05], makeMat("#6e926f", "painted"), "Artwork block");
}

function createClock(group, entry) {
  const clockFace = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 36), makeMat("#f5ead6", "painted"));
  clockFace.rotation.x = Math.PI / 2;
  clockFace.position.y = 1.45;
  group.add(clockFace);
  addBox(group, [0.04, 0.32, 0.035], [0, 1.45, 0.06], makeMat(entry.color, "painted"), "Clock hand");
  addBox(group, [0.25, 0.04, 0.035], [0.1, 1.45, 0.065], makeMat(entry.color, "painted"), "Clock hand");
}

function createVase(group, entry) {
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.14, 0.52, 24), makeMat(entry.color, entry.material));
  vase.position.y = 0.28;
  group.add(vase);
  addCylinder(group, 0.015, 0.5, [-0.05, 0.72, 0], makeMat("#6f8757", "painted"), "Stem");
  addCylinder(group, 0.015, 0.45, [0.05, 0.68, 0], makeMat("#6f8757", "painted"), "Stem");
}

function createThrowPillows(group, entry) {
  addBox(group, [0.48, 0.18, 0.42], [-0.25, 0.18, 0], makeMat(entry.color, entry.material), "Pillow");
  addBox(group, [0.48, 0.18, 0.42], [0.25, 0.18, 0.04], makeMat("#efe2c8", "fabric"), "Pillow");
}

function createBlanket(group, entry) {
  addBox(group, [1.35, 0.05, 1.85], [0, 0.08, 0], makeMat(entry.color, entry.material), "Folded blanket");
  addBox(group, [1.2, 0.055, 0.06], [0, 0.12, -0.72], makeMat("#efe2c8", "fabric"), "Blanket stripe");
}

function createCandleSet(group, entry) {
  [-0.18, 0.02, 0.22].forEach((x, index) => {
    addCylinder(group, 0.08, 0.26 + index * 0.08, [x, 0.13 + index * 0.04, 0], makeMat(entry.color, "painted"), "Candle");
    addCylinder(group, 0.025, 0.05, [x, 0.28 + index * 0.08, 0], makeMat("#e7a44a", "painted"), "Flame");
  });
}

function createSculpture(group, entry) {
  addBox(group, [0.42, 0.12, 0.42], [0, 0.06, 0], makeMat("#8d6b4c", "wood"), "Base");
  const sculpture = new THREE.Mesh(new THREE.TorusKnotGeometry(0.22, 0.055, 64, 8), makeMat(entry.color, entry.material));
  sculpture.position.y = 0.44;
  group.add(sculpture);
}

function createTelevision(group, entry) {
  const variant = entry.variant || "console";
  addBox(group, [1.45, 0.72, 0.08], [0, 1.08, 0], makeMat(entry.color, "metal"), "TV frame");
  addBox(group, [1.3, 0.6, 0.03], [0, 1.08, 0.045], makeMat("#111415", "metal"), "TV screen");
  if (variant === "wall") {
    addBox(group, [0.28, 0.24, 0.12], [0, 0.62, -0.02], makeMat("#2b2f30", "metal"), "Wall TV bracket");
  } else if (variant === "outdoor") {
    addBox(group, [1.8, 0.12, 0.55], [0, 0.06, 0], makeMat("#2f3333", "metal"), "Outdoor TV base");
    addCylinder(group, 0.05, 1.02, [-0.46, 0.56, 0], makeMat("#2f3333", "metal"), "Outdoor TV stand");
    addCylinder(group, 0.05, 1.02, [0.46, 0.56, 0], makeMat("#2f3333", "metal"), "Outdoor TV stand");
  } else {
    addBox(group, [1.7, 0.42, 0.42], [0, 0.28, 0], makeMat("#8d542e", "wood"), "Media console");
  }
}

function createSpeakers(group, entry) {
  [-0.45, 0.45].forEach((x) => {
    addBox(group, [0.26, 0.78, 0.24], [x, 0.39, 0], makeMat(entry.color, "metal"), "Speaker");
    addCylinder(group, 0.075, 0.025, [x, 0.56, 0.13], makeMat("#111415", "metal"), "Driver");
    addCylinder(group, 0.055, 0.025, [x, 0.28, 0.13], makeMat("#111415", "metal"), "Driver");
  });
}

function createGameConsole(group, entry) {
  addBox(group, [0.78, 0.12, 0.42], [0, 0.1, 0], makeMat(entry.color, "metal"), "Console");
  addBox(group, [0.18, 0.04, 0.08], [-0.18, 0.18, 0.22], makeMat("#1a1d1f", "metal"), "Slot");
  addBox(group, [0.32, 0.06, 0.2], [0.56, 0.09, 0.06], makeMat("#202325", "metal"), "Controller");
}

function createRecordPlayer(group, entry) {
  addBox(group, [0.9, 0.16, 0.58], [0, 0.12, 0], makeMat(entry.color, entry.material), "Record player");
  const record = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.035, 32), makeMat("#111415", "metal"));
  record.position.set(-0.18, 0.22, 0);
  group.add(record);
  addBox(group, [0.36, 0.035, 0.04], [0.22, 0.25, 0.08], makeMat("#d4c08b", "metal"), "Tone arm");
}

function createFloorLamp(group, entry) {
  addCylinder(group, 0.045, 1.45, [0, 0.78, 0], makeMat("#8f7741", "metal"), "Lamp stem");
  addCylinder(group, 0.28, 0.08, [0, 0.04, 0], makeMat("#8f7741", "metal"), "Lamp base");
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.48, 0.5, 24), makeMat(entry.color, "fabric"));
  shade.position.y = 1.62;
  group.add(shade);
  const light = new THREE.PointLight("#ffe7b0", 0.85, 4.5);
  light.position.y = 1.48;
  group.add(light);
}

function createTableLamp(group, entry) {
  addCylinder(group, 0.18, 0.06, [0, 0.03, 0], makeMat("#8f7741", "metal"), "Lamp base");
  addCylinder(group, 0.035, 0.48, [0, 0.3, 0], makeMat("#8f7741", "metal"), "Lamp stem");
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.32, 20), makeMat(entry.color, "fabric"));
  shade.position.y = 0.66;
  group.add(shade);
  const light = new THREE.PointLight("#ffe7b0", 0.55, 3.2);
  light.position.y = 0.62;
  group.add(light);
}

function createCeilingLight(group, entry) {
  addCylinder(group, 0.08, 0.5, [0, 2.55, 0], makeMat("#8f7741", "metal"), "Cord");
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 0.26, 24), makeMat(entry.color, "metal"));
  shade.position.y = 2.23;
  group.add(shade);
  const light = new THREE.PointLight("#ffe7b0", 0.7, 4);
  light.position.y = 2.08;
  group.add(light);
}

function createCoffeeTable(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.16, 36), mat);
  top.position.y = 0.48;
  group.add(top);
  addCylinder(group, 0.08, 0.45, [-0.42, 0.23, -0.28], mat, "Leg");
  addCylinder(group, 0.08, 0.45, [0.42, 0.23, -0.28], mat, "Leg");
  addCylinder(group, 0.08, 0.45, [-0.42, 0.23, 0.28], mat, "Leg");
  addCylinder(group, 0.08, 0.45, [0.42, 0.23, 0.28], mat, "Leg");
}

function createSideTable(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  addBox(group, [0.78, 0.14, 0.68], [0, 0.62, 0], mat, "Top");
  addBox(group, [0.62, 0.42, 0.52], [0, 0.34, 0], mat, "Drawer");
  forEachCorner(0.5, 0.42, (x, z) => addBox(group, [0.07, 0.32, 0.07], [x, 0.16, z], mat, "Leg"));
}

function createNightstand(group, entry) {
  createSideTable(group, entry);
}

function createVanity(group, entry) {
  createDesk(group, entry);
  addBox(group, [0.82, 0.72, 0.06], [0, 1.34, -0.38], makeMat("#c6d8d8", "metal"), "Mirror");
  addBox(group, [0.92, 0.82, 0.08], [0, 1.34, -0.41], makeMat(entry.color, entry.material), "Mirror frame");
}

function createKitchenAsset(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  if (entry.kind === "kitchen-counter") {
    addBox(group, [1.85, 0.86, 0.62], [0, 0.43, 0], mat, "Kitchen counter");
    addBox(group, [1.9, 0.08, 0.68], [0, 0.9, 0], makeMat("#e4dccf", "painted"), "Countertop");
    addBox(group, [0.05, 0.46, 0.06], [-0.32, 0.48, 0.34], makeMat("#c9a45d", "metal"), "Handle");
    addBox(group, [0.05, 0.46, 0.06], [0.32, 0.48, 0.34], makeMat("#c9a45d", "metal"), "Handle");
  } else if (entry.kind === "kitchen-island") {
    addBox(group, [2.2, 0.9, 1.05], [0, 0.45, 0], mat, "Kitchen island");
    addBox(group, [2.3, 0.08, 1.15], [0, 0.94, 0], makeMat("#e7dfd3", "painted"), "Island top");
  } else if (entry.kind === "refrigerator") {
    addBox(group, [0.9, 2.05, 0.72], [0, 1.02, 0], mat, "Refrigerator");
    addBox(group, [0.04, 1.82, 0.06], [0.32, 1.02, 0.38], makeMat("#7c8382", "metal"), "Fridge handle");
    addBox(group, [0.88, 0.04, 0.74], [0, 1.28, 0.01], makeMat("#cfd5d3", "metal"), "Freezer seam");
  } else if (entry.kind === "stove") {
    addBox(group, [0.92, 0.86, 0.72], [0, 0.43, 0], mat, "Stove");
    addBox(group, [0.82, 0.06, 0.62], [0, 0.9, 0], makeMat("#1e2222", "metal"), "Cooktop");
    [-0.22, 0.22].forEach((x) => [-0.16, 0.18].forEach((z) => addCylinder(group, 0.12, 0.025, [x, 0.95, z], makeMat("#0f1111", "metal"), "Burner")));
  } else if (entry.kind === "sink") {
    addBox(group, [1.1, 0.78, 0.66], [0, 0.39, 0], makeMat("#b98a5c", "wood"), "Sink cabinet");
    addBox(group, [0.78, 0.12, 0.46], [0, 0.84, 0], mat, "Sink basin");
    addCylinder(group, 0.035, 0.42, [0.22, 1.08, -0.1], makeMat("#9ca6a3", "metal"), "Faucet", Math.PI / 2);
  } else {
    addBox(group, [1.25, 0.62, 0.36], [0, 1.62, 0], mat, "Upper cabinet");
    addBox(group, [0.04, 0.44, 0.05], [-0.22, 1.62, 0.2], makeMat("#c9a45d", "metal"), "Handle");
    addBox(group, [0.04, 0.44, 0.05], [0.22, 1.62, 0.2], makeMat("#c9a45d", "metal"), "Handle");
  }
}

function createBathAsset(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  if (entry.kind === "toilet") {
    addBox(group, [0.54, 0.78, 0.28], [0, 0.78, -0.2], mat, "Toilet tank");
    addCylinder(group, 0.34, 0.32, [0, 0.42, 0.18], mat, "Toilet bowl");
    addCylinder(group, 0.24, 0.04, [0, 0.6, 0.18], makeMat("#d6d1c8", "painted"), "Seat");
  } else if (entry.kind === "bathtub") {
    addBox(group, [1.85, 0.58, 0.88], [0, 0.34, 0], mat, "Bathtub");
    addBox(group, [1.55, 0.36, 0.58], [0, 0.52, 0], makeMat("#cfd9d8", "metal"), "Tub basin");
  } else if (entry.kind === "shower") {
    addBox(group, [1.05, 0.08, 1.05], [0, 0.04, 0], makeMat("#d6d0c5", "painted"), "Shower base");
    addBox(group, [0.06, 2.1, 1.05], [-0.52, 1.05, 0], makeMat("#b7d4d8", "metal"), "Glass side");
    addBox(group, [1.05, 2.1, 0.06], [0, 1.05, -0.52], makeMat("#b7d4d8", "metal"), "Glass back");
    addCylinder(group, 0.06, 0.12, [0.36, 1.8, -0.46], makeMat("#909997", "metal"), "Shower head", Math.PI / 2);
  } else {
    addBox(group, [1.15, 0.78, 0.58], [0, 0.39, 0], mat, "Bath vanity");
    addCylinder(group, 0.24, 0.12, [0, 0.84, 0], makeMat("#d6d1c8", "painted"), "Sink basin");
    addBox(group, [0.76, 0.86, 0.06], [0, 1.5, -0.31], makeMat("#b8d2d5", "metal"), "Mirror");
  }
}

function createStructureAsset(group, entry) {
  if (entry.kind === "stairs" || entry.kind === "wide-stairs") {
    const wide = entry.kind === "wide-stairs";
    const variant = entry.variant || "straight";
    const landing = variant === "landing";
    const switchback = variant === "switchback-second-floor";
    const fullStory = variant === "second-floor" || switchback;
    const steps = fullStory ? 14 : landing ? (wide ? 7 : 5) : wide ? 10 : 6;
    const treadWidth = wide ? 2.2 : 1.25;
    if (switchback) {
      const halfSteps = 8;
      const rise = LEVEL_HEIGHT / (halfSteps * 2);
      const run = 0.34;
      const laneOffset = treadWidth * 0.72;
      for (let i = 0; i < halfSteps; i += 1) {
        addBox(group, [treadWidth, Math.max(0.12, rise * 0.62), 0.42], [-laneOffset, rise / 2 + i * rise, -1.2 + i * run], makeMat(entry.color, entry.material), "Lower switchback stair tread");
        addBox(group, [treadWidth, Math.max(0.12, rise * 0.62), 0.42], [laneOffset, LEVEL_HEIGHT / 2 + rise / 2 + i * rise, 1.35 - i * run], makeMat(entry.color, entry.material), "Upper switchback stair tread");
      }
      addBox(group, [treadWidth * 2 + 0.55, 0.18, 1.15], [0, LEVEL_HEIGHT / 2 + 0.02, 1.48], makeMat(entry.color, entry.material), "Mid stair landing");
      addBox(group, [treadWidth * 1.25, 0.18, 1.05], [laneOffset, LEVEL_HEIGHT + 0.02, -1.55], makeMat(entry.color, entry.material), "Second level landing");
      addBox(group, [0.08, 1.05, halfSteps * run + 1.05], [-laneOffset - treadWidth / 2 - 0.2, LEVEL_HEIGHT / 4, 0.0], makeMat("#8d5a35", "wood"), "Lower stair rail");
      addBox(group, [0.08, 1.05, halfSteps * run + 1.05], [laneOffset + treadWidth / 2 + 0.2, LEVEL_HEIGHT * 0.74, 0.0], makeMat("#8d5a35", "wood"), "Upper stair rail");
      return;
    }
    const rise = fullStory ? LEVEL_HEIGHT / steps : 0.16;
    const run = fullStory ? 0.38 : 0.32;
    for (let i = 0; i < steps; i += 1) {
      addBox(group, [treadWidth, Math.max(0.12, rise * 0.62), 0.42], [0, rise / 2 + i * rise, -1.15 + i * run], makeMat(entry.color, entry.material), "Stair tread");
    }
    if (fullStory) {
      addBox(group, [treadWidth + 0.35, 0.18, 1.05], [0, LEVEL_HEIGHT + 0.02, -1.15 + steps * run + 0.22], makeMat(entry.color, entry.material), "Second level stair landing");
      addBox(group, [0.08, 1.05, steps * run + 0.9], [-treadWidth / 2 - 0.22, LEVEL_HEIGHT / 2, -1.05 + (steps * run) / 2], makeMat("#8d5a35", "wood"), "Stair rail");
      addBox(group, [0.08, 1.05, steps * run + 0.9], [treadWidth / 2 + 0.22, LEVEL_HEIGHT / 2, -1.05 + (steps * run) / 2], makeMat("#8d5a35", "wood"), "Stair rail");
    }
    if (landing) {
      addBox(group, [treadWidth, 0.18, 1.05], [0, 0.18 + steps * rise, -1.15 + steps * run + 0.32], makeMat(entry.color, entry.material), "Stair landing");
      for (let i = 0; i < 4; i += 1) {
        addBox(group, [0.46, 0.14, treadWidth], [-0.54 + i * 0.36, 0.36 + steps * rise + i * 0.14, -1.15 + steps * run + 1.03], makeMat(entry.color, entry.material), "Return stair tread");
      }
    }
    if (wide && !fullStory) {
      addBox(group, [0.08, 1.42, 3.2], [-1.18, 0.72, 0.18], makeMat("#8d5a35", "wood"), "Stair rail");
      addBox(group, [0.08, 1.42, 3.2], [1.18, 0.72, 0.18], makeMat("#8d5a35", "wood"), "Stair rail");
    }
  } else if (entry.kind === "stair-landing") {
    const width = entry.width || 2.2;
    const depth = entry.depth || 1.8;
    const baseY = entry.level > 1 ? 0.08 : 1.02;
    addBox(group, [width, 0.22, depth], [0, baseY, 0], makeMat(entry.color, entry.material), "Second floor landing");
    addBox(group, [width, 0.1, 0.1], [0, baseY + 0.38, -depth / 2 + 0.08], makeMat("#8d5a35", "wood"), "Landing rail");
    addBox(group, [0.1, 0.75, depth], [-width / 2 + 0.08, baseY + 0.26, 0], makeMat("#8d5a35", "wood"), "Landing side rail");
    addBox(group, [0.1, 0.75, depth], [width / 2 - 0.08, baseY + 0.26, 0], makeMat("#8d5a35", "wood"), "Landing side rail");
  } else if (entry.kind === "front-door") {
    createDoor(group, entry);
    addBox(group, [0.18, 0.08, 0.08], [-0.22, 1.05, 0.33], makeMat("#d0aa5b", "metal"), "Door knob");
  } else {
    const width = entry.width || 4.5;
    const depth = entry.depth || 3.5;
    const variant = entry.variant || "gable";
    if (variant === "flat") {
      addBox(group, [width, 0.28, depth], [0, ROOM_HEIGHT + 0.18, 0], makeMat(entry.color, entry.material), "Flat roof");
      addBox(group, [width + 0.16, 0.12, 0.14], [0, ROOM_HEIGHT + 0.36, -depth / 2 + 0.12], makeMat(shadeHex(entry.color, 18), entry.material), "Roof lip");
      addBox(group, [width + 0.16, 0.12, 0.14], [0, ROOM_HEIGHT + 0.36, depth / 2 - 0.12], makeMat(shadeHex(entry.color, 18), entry.material), "Roof lip");
    } else if (variant === "hip") {
      const roofBaseY = ROOM_HEIGHT + 0.14;
      const front = addBox(group, [width, 0.22, depth * 0.52], [0, roofBaseY, depth * 0.18], makeMat(entry.color, entry.material), "Hip roof plane");
      front.rotation.x = 0.25;
      const back = addBox(group, [width, 0.22, depth * 0.52], [0, roofBaseY, -depth * 0.18], makeMat(shadeHex(entry.color, -18), entry.material), "Hip roof plane");
      back.rotation.x = -0.25;
      const leftHip = addBox(group, [0.22, 0.18, depth * 0.78], [-width / 2 + 0.24, roofBaseY + 0.04, 0], makeMat(shadeHex(entry.color, -8), entry.material), "Hip end");
      leftHip.rotation.z = -0.34;
      const rightHip = addBox(group, [0.22, 0.18, depth * 0.78], [width / 2 - 0.24, roofBaseY + 0.04, 0], makeMat(shadeHex(entry.color, -8), entry.material), "Hip end");
      rightHip.rotation.z = 0.34;
      addBox(group, [width * 0.55, 0.1, 0.14], [0, roofBaseY + 0.28, 0], makeMat(shadeHex(entry.color, 18), entry.material), "Hip ridge");
    } else {
      createGableRoof(group, entry, width, depth);
    }
  }
}

function createInteriorWall(group, entry) {
  const length = Math.max(entry.width || 2, GRID_SIZE * 2);
  const thickness = entry.depth || WALL_THICKNESS;
  const wallMat = makeMat(entry.color, entry.material);
  const trimMat = makeMat("#f5efe1", "painted");
  const openings = getInteriorWallOpenings(entry);
  const addSegment = (start, end, yStart, yEnd, label) => {
    const segmentLength = end - start;
    const segmentHeight = yEnd - yStart;
    if (segmentLength <= 0.05 || segmentHeight <= 0.05) return;
    const wall = addBox(group, [segmentLength, segmentHeight, thickness], [(start + end) / 2, yStart + segmentHeight / 2, 0], wallMat, label);
    wall.receiveShadow = true;
  };
  let cursor = -length / 2;
  openings.forEach((opening) => {
    const half = opening.width / 2;
    addSegment(cursor, opening.offset - half, 0, ROOM_HEIGHT, "Interior partition wall");
    addSegment(opening.offset - half, opening.offset + half, opening.top, ROOM_HEIGHT, "Interior wall header");
    if (opening.bottom > 0) addSegment(opening.offset - half, opening.offset + half, 0, opening.bottom, "Interior wall sill");
    cursor = opening.offset + half;
  });
  addSegment(cursor, length / 2, 0, ROOM_HEIGHT, "Interior partition wall");
  addInteriorWallTrim(group, length, thickness, openings, trimMat, thickness / 2 + 0.035);
  addInteriorWallTrim(group, length, thickness, openings, trimMat, -thickness / 2 - 0.035);
}

function addInteriorWallTrim(group, length, thickness, openings, material, z) {
  const trimHeight = 0.12;
  const trimDepth = 0.08;
  let cursor = -length / 2;
  openings
    .filter((opening) => opening.bottom <= 0.05)
    .forEach((opening) => {
      const half = opening.width / 2;
      addInteriorTrimSegment(group, cursor, opening.offset - half, z, trimHeight, trimDepth, material);
      cursor = opening.offset + half;
    });
  addInteriorTrimSegment(group, cursor, length / 2, z, trimHeight, trimDepth, material);
}

function addInteriorTrimSegment(group, start, end, z, height, depth, material) {
  if (end - start <= 0.05) return;
  addBox(group, [end - start, height, depth], [(start + end) / 2, 0.16, z], material, "Interior wall baseboard");
}

function createGableRoof(group, entry, width, depth) {
  const eaveY = ROOM_HEIGHT + 0.08;
  const ridgeY = ROOM_HEIGHT + Math.max(0.75, Math.min(1.2, depth * 0.11));
  const halfW = width / 2;
  const halfD = depth / 2;
  addRoofQuad(
    group,
    [
      [-halfW, eaveY, -halfD],
      [halfW, eaveY, -halfD],
      [halfW, ridgeY, 0],
      [-halfW, ridgeY, 0],
    ],
    makeRoofMat(entry.color, entry.material),
    "Back roof plane",
  );
  addRoofQuad(
    group,
    [
      [-halfW, ridgeY, 0],
      [halfW, ridgeY, 0],
      [halfW, eaveY, halfD],
      [-halfW, eaveY, halfD],
    ],
    makeRoofMat(shadeHex(entry.color, -18), entry.material),
    "Front roof plane",
  );
  addGableEnd(group, -halfW, eaveY, ridgeY, halfD, makeRoofMat(shadeHex(entry.color, -12), entry.material));
  addGableEnd(group, halfW, eaveY, ridgeY, halfD, makeRoofMat(shadeHex(entry.color, -12), entry.material));
  addBox(group, [width + 0.18, 0.12, 0.18], [0, ridgeY + 0.06, 0], makeMat(shadeHex(entry.color, 18), entry.material), "Roof ridge cap");
  addBox(group, [width + 0.22, 0.24, 0.18], [0, eaveY - 0.1, -halfD + 0.04], makeMat("#f5ead5", "painted"), "Back fascia");
  addBox(group, [width + 0.22, 0.24, 0.18], [0, eaveY - 0.1, halfD - 0.04], makeMat("#f5ead5", "painted"), "Front fascia");
  addBox(group, [0.18, 0.24, depth + 0.08], [-halfW + 0.04, eaveY - 0.1, 0], makeMat("#f5ead5", "painted"), "Side fascia");
  addBox(group, [0.18, 0.24, depth + 0.08], [halfW - 0.04, eaveY - 0.1, 0], makeMat("#f5ead5", "painted"), "Side fascia");
}

function makeRoofMat(color, material) {
  const mat = makeMat(color, material);
  mat.side = THREE.DoubleSide;
  return mat;
}

function addRoofQuad(group, points, mat, name) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.name = name;
  group.add(mesh);
  return mesh;
}

function addGableEnd(group, x, eaveY, ridgeY, halfD, mat) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([x, eaveY, -halfD, x, eaveY, halfD, x, ridgeY, 0], 3),
  );
  geometry.setIndex([0, 1, 2]);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.name = "Gable end";
  group.add(mesh);
  return mesh;
}

function createOutdoorAsset(group, entry) {
  if (entry.kind === "grass-plot") {
    addBox(group, [entry.width || 12, 0.05, entry.depth || 10], [0, -0.02, 0], makeMat(entry.color, "grass"), "Grass plot");
  } else if (entry.kind === "deck" || entry.kind === "patio" || entry.kind === "stone-walkway") {
    const width = entry.width || 4;
    const depth = entry.depth || 3;
    const raised = entry.kind === "deck" && (entry.variant || "ground") === "raised";
    const deckY = raised ? 0.48 : 0.02;
    addBox(group, [width, 0.08, depth], [0, deckY, 0], makeMat(entry.color, entry.material), raised ? "Raised deck" : entry.label);
    const stripeColor = entry.kind === "deck" ? "#765035" : "#c7c1b5";
    for (let x = -width / 2 + 0.35; x < width / 2; x += 0.45) addBox(group, [0.04, 0.025, depth], [x, deckY + 0.06, 0], makeMat(stripeColor, entry.material), "Surface joint");
    if (raised) {
      forEachCorner(width - 0.45, depth - 0.45, (x, z) => addBox(group, [0.14, 0.9, 0.14], [x, 0.02, z], makeMat("#765035", "wood"), "Deck post"));
      addBox(group, [width, 0.12, 0.12], [0, 0.96, -depth / 2 + 0.08], makeMat("#765035", "wood"), "Deck rail");
      addBox(group, [0.12, 0.12, depth], [-width / 2 + 0.08, 0.96, 0], makeMat("#765035", "wood"), "Deck rail");
    }
  } else if (entry.kind === "fence") {
    for (let x = -1.15; x <= 1.15; x += 0.575) addBox(group, [0.12, 1.05, 0.12], [x, 0.52, 0], makeMat(entry.color, entry.material), "Fence post");
    addBox(group, [2.65, 0.12, 0.1], [0, 0.78, 0], makeMat(entry.color, entry.material), "Fence rail");
    addBox(group, [2.65, 0.12, 0.1], [0, 0.38, 0], makeMat(entry.color, entry.material), "Fence rail");
  } else if (entry.kind === "tree") {
    addCylinder(group, 0.14, 1.5, [0, 0.75, 0], makeMat("#7a5233", "wood"), "Tree trunk");
    const leaves = makeMat(entry.color, "painted");
    [[0, 1.65, 0, 0.74], [-0.35, 1.38, 0.08, 0.52], [0.34, 1.42, -0.08, 0.55]].forEach(([x, y, z, r]) => {
      const crown = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), leaves);
      crown.position.set(x, y, z);
      group.add(crown);
    });
  } else if (entry.kind === "shrub" || entry.kind === "hedge") {
    const hedge = entry.kind === "hedge" || entry.variant === "hedge";
    if (hedge) {
      const length = entry.width || 1.45;
      addBox(group, [length, 0.5, 0.42], [0, 0.28, 0], makeMat(entry.color, "painted"), "Hedge body");
      for (let x = -length / 2 + 0.2; x <= length / 2 - 0.1; x += 0.36) {
        const mound = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 10), makeMat(shadeHex(entry.color, x > 0 ? 8 : -6), "painted"));
        mound.scale.set(1.1, 0.62, 0.72);
        mound.position.set(x, 0.54, 0);
        group.add(mound);
      }
    } else {
      [-0.28, 0.05, 0.34].forEach((x, index) => {
        const shrub = new THREE.Mesh(new THREE.SphereGeometry(0.38 - index * 0.04, 16, 10), makeMat(entry.color, "painted"));
        shrub.scale.set(1.25, 0.72, 0.9);
        shrub.position.set(x, 0.34, index % 2 ? 0.08 : -0.08);
        group.add(shrub);
      });
    }
  } else if (entry.kind === "bbq") {
    addBox(group, [0.85, 0.72, 0.55], [0, 0.42, 0], makeMat(entry.color, entry.material), "BBQ grill");
    addCylinder(group, 0.12, 0.14, [-0.32, 0.17, 0.28], makeMat("#141515", "metal"), "Wheel");
    addCylinder(group, 0.12, 0.14, [0.32, 0.17, 0.28], makeMat("#141515", "metal"), "Wheel");
    addBox(group, [1.05, 0.08, 0.12], [0, 0.82, -0.3], makeMat("#7c8382", "metal"), "Grill handle");
  } else if (entry.kind === "outdoor-bar") {
    addBox(group, [2.3, 0.9, 0.65], [0, 0.45, 0], makeMat(entry.color, "wood"), "Outdoor bar");
    addBox(group, [2.5, 0.12, 0.8], [0, 0.96, 0], makeMat("#d8c5a8", "wood"), "Bar top");
    [-0.52, 0.0, 0.52].forEach((x) => addCylinder(group, 0.08, 0.32, [x, 1.2, -0.18], makeMat("#9ed2d8", "metal"), "Glass"));
  } else if (entry.kind === "fire-pit") {
    addCylinder(group, 0.58, 0.22, [0, 0.11, 0], makeMat("#4f4b43", "stone"), "Fire pit ring");
    addCylinder(group, 0.38, 0.08, [0, 0.18, 0], makeMat("#1f2020", "metal"), "Fire pit bowl");
    addCone(group, 0.18, 0.52, [-0.08, 0.48, 0], makeMat("#d97835", "painted"), "Flame");
    addCone(group, 0.13, 0.42, [0.12, 0.44, 0.04], makeMat("#e9b14b", "painted"), "Flame");
  } else if (entry.kind === "horseshoes") {
    addBox(group, [entry.width || 2.5, 0.04, entry.depth || 4.5], [0, 0.01, 0], makeMat("#b79466", "painted"), "Horseshoe court");
    addCylinder(group, 0.04, 0.55, [0, 0.3, -1.72], makeMat("#5d4430", "wood"), "Horseshoe stake");
    addCylinder(group, 0.04, 0.55, [0, 0.3, 1.72], makeMat("#5d4430", "wood"), "Horseshoe stake");
    [-0.32, 0.32].forEach((x) => {
      const shoe = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 10, 20, Math.PI * 1.45), makeMat("#3b3d3e", "metal"));
      shoe.rotation.x = -Math.PI / 2;
      shoe.position.set(x, 0.08, -0.2);
      group.add(shoe);
    });
  } else if (entry.kind === "volleyball-net") {
    addCylinder(group, 0.05, 1.9, [-2.2, 0.95, 0], makeMat("#6d5137", "wood"), "Volleyball post");
    addCylinder(group, 0.05, 1.9, [2.2, 0.95, 0], makeMat("#6d5137", "wood"), "Volleyball post");
    addBox(group, [4.35, 0.82, 0.035], [0, 1.24, 0], makeMat("#f4ead8", "fabric"), "Volleyball net");
    for (let x = -1.6; x <= 1.6; x += 0.8) addBox(group, [0.025, 0.82, 0.045], [x, 1.24, 0.03], makeMat("#c8bea9", "fabric"), "Net line");
    for (let y = 0.92; y <= 1.54; y += 0.2) addBox(group, [4.3, 0.025, 0.045], [0, y, 0.03], makeMat("#c8bea9", "fabric"), "Net line");
  }
}

function createPetAsset(group, entry) {
  const mat = makeMat(entry.color, entry.material);
  if (entry.kind === "cat" || entry.kind === "dog") {
    const variant = entry.variant || "standing";
    if (entry.kind === "cat" && variant === "curled") {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 12), mat);
      body.scale.set(1.25, 0.55, 0.95);
      body.position.set(0, 0.28, 0);
      body.userData.petPart = "body";
      group.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), mat);
      head.position.set(-0.32, 0.33, 0.08);
      head.userData.petPart = "head";
      group.add(head);
      const tail = addCylinder(group, 0.035, 0.52, [0.3, 0.34, 0.08], mat, "Tail", Math.PI / 2);
      tail.rotation.y = 0.95;
      tail.userData.petPart = "tail";
      group.userData.petAnimation = "sleeping";
      return;
    }
    if (entry.kind === "dog" && variant === "sleeping") {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 12), mat);
      body.scale.set(1.45, 0.45, 0.8);
      body.position.set(0.05, 0.24, 0);
      body.userData.petPart = "body";
      group.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), mat);
      head.position.set(-0.48, 0.25, 0.12);
      head.userData.petPart = "head";
      group.add(head);
      group.userData.petAnimation = "sleeping";
      return;
    }
    const bodyLength = entry.kind === "dog" ? 0.72 : 0.52;
    const bodyHeight = entry.kind === "dog" ? 0.34 : 0.26;
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 12), mat);
    body.scale.set(bodyLength / 0.68, bodyHeight / 0.68, 0.62);
    body.position.set(0.08, 0.34, 0);
    body.userData.petPart = "body";
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(entry.kind === "dog" ? 0.22 : 0.18, 18, 12), mat);
    head.position.set(-0.38, 0.48, 0);
    head.userData.petPart = "head";
    group.add(head);
    if (entry.kind === "cat") {
      addCone(group, 0.09, 0.16, [-0.46, 0.66, -0.07], mat, "Ear");
      addCone(group, 0.09, 0.16, [-0.46, 0.66, 0.07], mat, "Ear");
      const tail = addCylinder(group, 0.035, 0.62, [0.5, 0.52, 0], mat, "Tail", Math.PI / 2);
      tail.rotation.y = 0.55;
      tail.userData.petPart = "tail";
    } else {
      addBox(group, [0.08, 0.18, 0.03], [-0.48, 0.48, -0.16], makeMat(shadeHex(entry.color, -18), "fabric"), "Ear");
      addBox(group, [0.08, 0.18, 0.03], [-0.48, 0.48, 0.16], makeMat(shadeHex(entry.color, -18), "fabric"), "Ear");
      const tail = addCylinder(group, 0.04, 0.5, [0.48, 0.48, 0], mat, "Tail", Math.PI / 2);
      tail.rotation.y = -0.45;
      tail.userData.petPart = "tail";
    }
    forEachCorner(0.45, 0.28, (x, z) => addBox(group, [0.06, 0.24, 0.06], [x, 0.16, z], mat, "Pet leg"));
    group.userData.petAnimation = entry.kind;
  } else if (entry.kind === "pet-bed") {
    if ((entry.variant || "bolster") === "round") {
      addCylinder(group, 0.55, 0.18, [0, 0.1, 0], mat, "Round pet bed");
      addCylinder(group, 0.36, 0.08, [0, 0.22, 0], makeMat("#ead8cb", "fabric"), "Pet bed cushion");
    } else {
      addBox(group, [1.0, 0.18, 0.76], [0, 0.12, 0], mat, "Pet bed cushion");
      addBox(group, [1.1, 0.22, 0.16], [0, 0.24, -0.38], makeMat(shadeHex(entry.color, -12), "fabric"), "Pet bed bolster");
      addBox(group, [0.16, 0.22, 0.76], [-0.55, 0.24, 0], makeMat(shadeHex(entry.color, -12), "fabric"), "Pet bed side");
      addBox(group, [0.16, 0.22, 0.76], [0.55, 0.24, 0], makeMat(shadeHex(entry.color, -12), "fabric"), "Pet bed side");
    }
  } else if (entry.kind === "pet-bowl") {
    addCylinder(group, 0.28, 0.16, [-0.22, 0.08, 0], mat, "Pet bowl");
    addCylinder(group, 0.28, 0.16, [0.42, 0.08, 0], makeMat("#b96b5a", "metal"), "Pet bowl");
    addCylinder(group, 0.18, 0.04, [-0.22, 0.18, 0], makeMat("#dfeaea", "painted"), "Water");
    addCylinder(group, 0.16, 0.04, [0.42, 0.18, 0], makeMat("#8c5b34", "painted"), "Food");
  } else if (entry.kind === "cat-tree") {
    addCylinder(group, 0.07, 1.35, [0, 0.68, 0], makeMat("#8e6d4d", "wood"), "Cat tree post");
    addCylinder(group, 0.07, 0.9, [-0.38, 0.45, 0.22], makeMat("#8e6d4d", "wood"), "Cat tree post");
    addBox(group, [1.05, 0.12, 0.82], [0, 0.12, 0], mat, "Cat tree base");
    addBox(group, [0.72, 0.12, 0.56], [-0.38, 0.9, 0.22], mat, "Cat tree platform");
    addCylinder(group, 0.28, 0.22, [0.2, 1.42, -0.1], mat, "Cat perch");
  } else {
    const tall = (entry.variant || "rect") === "tall";
    addBox(group, [tall ? 0.78 : 1.1, tall ? 1.05 : 0.72, 0.42], [0, tall ? 0.64 : 0.48, 0], makeMat("#7bb8c3", "metal"), "Aquarium glass");
    addBox(group, [1.18, 0.08, 0.5], [0, 0.88, 0], makeMat("#2b3335", "metal"), "Aquarium lid");
    addBox(group, [1.18, 0.08, 0.5], [0, 0.08, 0], makeMat("#2b3335", "metal"), "Aquarium base");
    addCylinder(group, 0.05, 0.18, [-0.22, 0.46, 0.02], makeMat("#d29a4d", "painted"), "Fish", Math.PI / 2);
    addCylinder(group, 0.04, 0.16, [0.28, 0.55, -0.04], makeMat("#c95f55", "painted"), "Fish", Math.PI / 2);
  }
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  if (state.viewMode === "tour") {
    setViewMode("iso");
    return;
  }
  if (state.viewMode === "walk") {
    walkState.draggingLook = true;
    walkState.lastX = event.clientX;
    walkState.lastY = event.clientY;
    flashHint("Drag to look around. Use arrows or WASD to move.");
    return;
  }
  const point = state.activeAssetId ? eventToPlacementPoint(event, state.activeAssetId) : eventToGroundPoint(event);
  if (state.toolMode === "bulldoze") {
    clearPlacementPreview();
    state.bulldozing = true;
    state.bulldozeChanged = false;
    orbit.enabled = false;
    renderer.domElement.setPointerCapture(event.pointerId);
    bulldozeAtEvent(event);
    return;
  }
  if (point && state.activeAssetId && canPlaceAsset(state.activeAssetId, point)) {
    const asset = ASSETS.find((entry) => entry.id === state.activeAssetId);
    if (asset && DRAG_BUILD_KINDS.has(asset.kind)) {
      startBuildDrag(event, asset, point);
      return;
    }
    placeAsset(state.activeAssetId, point);
    return;
  }

  const hit = pickObject(event);
  if (hit) {
    clearPlacementPreview();
    const entry = getEntryByUid(hit.object.userData.uid);
    if (!entry) return;
    if ((event.ctrlKey || event.metaKey) && !isMainRoomEntry(entry)) {
      toggleMultiSelection(entry.uid);
      return;
    }
    if (state.selectedIds.has(entry.uid) && state.selectedIds.size > 1) {
      state.selectedId = entry.uid;
      updateInspector();
      syncRoomUi();
    } else {
      selectObject(entry.uid);
    }
    const selectedEntries = getSelectedEntries().filter((item) => !isMainRoomEntry(item));
    if (selectedEntries.some((item) => item.locked)) {
      flashHint("One or more selected items are locked. Unlock them to move.");
      return;
    }
    if (isMainRoomEntry(entry)) {
      flashHint("Initial room is the fixed anchor. Use width/depth and material controls to edit it.");
      return;
    }
    const ground = eventToGroundPoint(event);
    if (ground) dragState.offset.copy(ground).sub(entry.group.position);
    dragState.entry = entry;
    dragState.moved = false;
    dragState.startPosition.copy(entry.group.position);
    dragState.roomStart.copy(entry.group.position);
    dragState.roomContents = isRoomEntry(entry)
      ? state.objects
          .filter((item) => item.roomId === entry.uid)
          .map((item) => ({ entry: item, position: item.group.position.clone() }))
      : [];
    dragState.wallContents = isInteriorWallEntry(entry)
      ? state.objects
          .filter((item) => item.targetWallId === entry.uid)
          .map((item) => ({ entry: item, position: item.group.position.clone() }))
      : [];
    dragState.selectedStarts = selectedEntries
      .filter((item) => item.uid !== entry.uid && !dragState.wallContents.some((wallItem) => wallItem.entry.uid === item.uid))
      .map((item) => ({ entry: item, position: item.group.position.clone() }));
    orbit.enabled = false;
    renderer.domElement.setPointerCapture(event.pointerId);
    return;
  }

  selectObject(null);
  updatePlacementPreview(event);
}

function onPointerMove(event) {
  if (state.viewMode === "walk" && walkState.draggingLook && document.pointerLockElement !== renderer.domElement) {
    walkState.yaw -= (event.clientX - walkState.lastX) * 0.006;
    walkState.pitch = THREE.MathUtils.clamp(walkState.pitch - (event.clientY - walkState.lastY) * 0.005, -0.82, 0.82);
    walkState.lastX = event.clientX;
    walkState.lastY = event.clientY;
    applyWalkCameraRotation();
    return;
  }
  if (state.bulldozing) {
    bulldozeAtEvent(event);
    return;
  }
  if (state.buildDrag.active) {
    const point = eventToGroundPoint(event);
    if (!point) return;
    state.buildDrag.current = point.clone();
    state.buildDrag.moved = state.buildDrag.moved || point.distanceTo(state.buildDrag.start) > GRID_SIZE * 2;
    updateBuildDragPreview();
    return;
  }
  if (!dragState.entry) {
    updatePlacementPreview(event);
    return;
  }
  clearPlacementPreview();
  const point = eventToPlacementPoint(event, state.activeAssetId);
  if (!point) return;
  const next = point.sub(dragState.offset);
  dragState.entry.group.position.set(next.x, 0, next.z);
  clampEntryToRoom(dragState.entry);
  moveRoomContentsWithDrag();
  moveWallContentsWithDrag();
  moveSelectedWithDrag();
  syncEntry(dragState.entry);
  dragState.moved = true;
}

function onPointerUp(event) {
  if (state.viewMode === "walk") {
    walkState.draggingLook = false;
    return;
  }
  if (state.bulldozing) {
    if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
    state.bulldozing = false;
    orbit.enabled = true;
    if (state.bulldozeChanged) {
      pushHistory();
      flashHint("Bulldozed selected pieces.");
    }
    state.bulldozeChanged = false;
    return;
  }
  if (state.buildDrag.active) {
    finishBuildDrag(event);
    return;
  }
  if (!dragState.entry) return;
  if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
  if (dragState.moved) {
    dragState.entry.group.position.x = snap(dragState.entry.group.position.x);
    dragState.entry.group.position.z = snap(dragState.entry.group.position.z);
    clampEntryToRoom(dragState.entry);
    snapSelectedDragEntries();
    moveRoomContentsWithDrag();
    moveWallContentsWithDrag();
    const movedEntries = [dragState.entry, ...dragState.wallContents.map((item) => item.entry), ...dragState.selectedStarts.map((item) => item.entry)];
    const ignoreIds = new Set(movedEntries.map((entry) => entry.uid));
    if (movedEntries.some((entry) => hasPlacementCollision(entry, ignoreIds))) {
      dragState.entry.group.position.copy(dragState.startPosition);
      dragState.wallContents.forEach(({ entry, position }) => {
        entry.group.position.copy(position);
        syncEntry(entry);
      });
      dragState.selectedStarts.forEach(({ entry, position }) => {
        entry.group.position.copy(position);
        syncEntry(entry);
      });
      syncEntry(dragState.entry);
      flashHint(`${dragState.entry.label} overlaps another item.`);
    }
    movedEntries.forEach((entry) => {
      syncEntry(entry);
      rememberRotation(entry);
    });
    if (movedEntries.some(isWallOpeningEntry)) rebuildForOpenings(movedEntries.filter(isWallOpeningEntry));
    else if (movedEntries.some(isRoomEntry)) rebuildRoomShells();
    pushHistory();
  }
  dragState.entry = null;
  dragState.moved = false;
  dragState.roomContents = [];
  dragState.wallContents = [];
  dragState.selectedStarts = [];
  orbit.enabled = true;
}

function moveRoomContentsWithDrag() {
  if (!isRoomEntry(dragState.entry) || !dragState.roomContents.length) return;
  const delta = dragState.entry.group.position.clone().sub(dragState.roomStart);
  dragState.roomContents.forEach(({ entry, position }) => {
    entry.group.position.copy(position).add(delta);
    entry.group.position.y = getLevelY(entry.level || dragState.entry.level || 1);
    syncEntry(entry);
  });
}

function moveWallContentsWithDrag() {
  if (!isInteriorWallEntry(dragState.entry) || !dragState.wallContents.length) return;
  const delta = dragState.entry.group.position.clone().sub(dragState.startPosition);
  dragState.wallContents.forEach(({ entry, position }) => {
    entry.group.position.copy(position).add(delta);
    entry.group.position.y = getLevelY(entry.level || dragState.entry.level || 1);
    syncEntry(entry);
  });
}

function moveSelectedWithDrag() {
  if (!dragState.selectedStarts.length) return;
  const delta = dragState.entry.group.position.clone().sub(dragState.startPosition);
  dragState.selectedStarts.forEach(({ entry, position }) => {
    entry.group.position.copy(position).add(delta);
    entry.group.position.y = getLevelY(entry.level || 1);
    clampEntryToRoom(entry);
    syncEntry(entry);
  });
}

function snapSelectedDragEntries() {
  dragState.selectedStarts.forEach(({ entry }) => {
    entry.group.position.x = snap(entry.group.position.x);
    entry.group.position.z = snap(entry.group.position.z);
    clampEntryToRoom(entry);
    syncEntry(entry);
  });
}

function startBuildDrag(event, asset, point) {
  clearPlacementPreview();
  state.buildDrag = {
    active: true,
    assetId: asset.id,
    start: point.clone(),
    current: point.clone(),
    moved: false,
  };
  orbit.enabled = false;
  renderer.domElement.setPointerCapture(event.pointerId);
  updateBuildDragPreview();
  flashHint(`${asset.label}: drag to build, release to place.`);
}

function finishBuildDrag(event) {
  if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
  const releasePoint = eventToGroundPoint(event);
  const { assetId, start, current, moved } = state.buildDrag;
  const end = releasePoint || current;
  resetBuildDrag();
  clearPlacementPreview();
  orbit.enabled = true;
  const asset = ASSETS.find((entry) => entry.id === assetId);
  if (!asset || !start) return;
  const dragDistance = end ? end.distanceTo(start) : 0;
  if ((!moved && dragDistance < GRID_SIZE * 2) || !end) {
    placeAsset(assetId, start);
    return;
  }
  const buildGroupId = crypto.randomUUID();
  const entries = asset.kind === "interior-wall"
    ? buildInteriorWall(asset, start, end, buildGroupId)
    : asset.kind === "fence"
      ? buildFenceRun(asset, start, end, buildGroupId)
      : ["tree", "shrub", "hedge"].includes(asset.kind)
        ? buildPlantRun(asset, start, end, buildGroupId)
        : buildResizableOutdoorAsset(asset, start, end, buildGroupId);
  if (!entries.length) return;
  state.activeAssetId = null;
  renderAssetPanel();
  selectObject(entries.at(-1).uid);
  pushHistory();
  flashHint(`${entries.length} ${asset.label}${entries.length === 1 ? "" : "s"} built.`);
}

function resetBuildDrag() {
  state.buildDrag = {
    active: false,
    assetId: null,
    start: null,
    current: null,
    moved: false,
  };
}

function buildInteriorWall(asset, start, end, buildGroupId = null) {
  const spec = getInteriorWallSpec(asset, start, end, buildGroupId);
  return spec ? [addBuiltEntry(asset, spec.position, spec)] : [];
}

function buildFenceRun(asset, start, end, buildGroupId = null) {
  return getLineBuildSpecs(asset, start, end, FENCE_SPACING).map((spec) => addBuiltEntry(asset, spec.position, { rotationY: spec.rotationY, buildGroupId }));
}

function buildPlantRun(asset, start, end, buildGroupId = null) {
  const spacing = getLineRunSpacing(asset.kind) || SHRUB_SPACING;
  return getLineBuildSpecs(asset, start, end, spacing).map((spec) => addBuiltEntry(asset, spec.position, { rotationY: rememberedRotation(asset.kind), buildGroupId }));
}

function getLineBuildSpecs(asset, start, end, spacing) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const alongX = Math.abs(dx) >= Math.abs(dz);
  const length = Math.max(Math.abs(alongX ? dx : dz), 0.75);
  const count = Math.max(1, Math.floor(length / spacing) + 1);
  const specs = [];
  for (let index = 0; index < count; index += 1) {
    const t = count === 1 ? 0 : index / (count - 1);
    const x = alongX ? THREE.MathUtils.lerp(start.x, end.x, t) : start.x;
    const z = alongX ? start.z : THREE.MathUtils.lerp(start.z, end.z, t);
    specs.push({
      position: [snap(x), getLevelY(state.activeLevel || 1), snap(z)],
      rotationY: asset.kind === "fence" ? (alongX ? 0 : Math.PI / 2) : rememberedRotation(asset.kind),
    });
  }
  return specs;
}

function getInteriorWallSpec(asset, start, end, buildGroupId = null) {
  const room = findContainingRoomBounds(start, -0.02, state.activeLevel) || findContainingRoomBounds(end, -0.02, state.activeLevel);
  if (!room) return null;
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const alongX = Math.abs(dx) >= Math.abs(dz);
  const minLength = GRID_SIZE * 2;
  const margin = 0.28;
  const side = nearestRoomSide(start, room, alongX);
  const anchor = snapPointToRoomSide(start, room, side, margin);
  const rawEnd = alongX
    ? new THREE.Vector3(THREE.MathUtils.clamp(end.x, room.x - room.width / 2 + margin, room.x + room.width / 2 - margin), 0, anchor.z)
    : new THREE.Vector3(anchor.x, 0, THREE.MathUtils.clamp(end.z, room.z - room.depth / 2 + margin, room.z + room.depth / 2 - margin));
  const signedLength = alongX ? rawEnd.x - anchor.x : rawEnd.z - anchor.z;
  const direction = signedLength < 0 ? -1 : 1;
  const length = Math.max(Math.abs(signedLength), minLength);
  const endPoint = alongX
    ? new THREE.Vector3(THREE.MathUtils.clamp(anchor.x + direction * length, room.x - room.width / 2 + margin, room.x + room.width / 2 - margin), 0, anchor.z)
    : new THREE.Vector3(anchor.x, 0, THREE.MathUtils.clamp(anchor.z + direction * length, room.z - room.depth / 2 + margin, room.z + room.depth / 2 - margin));
  const finalLength = Math.max(alongX ? Math.abs(endPoint.x - anchor.x) : Math.abs(endPoint.z - anchor.z), minLength);
  const center = alongX
    ? [snap((anchor.x + endPoint.x) / 2), getLevelY(room.level || state.activeLevel || 1), snap(anchor.z)]
    : [snap(anchor.x), getLevelY(room.level || state.activeLevel || 1), snap((anchor.z + endPoint.z) / 2)];
  return {
    position: center,
    rotationY: alongX ? 0 : Math.PI / 2,
    width: snap(finalLength),
    depth: WALL_THICKNESS,
    roomId: room.id,
    level: room.level || state.activeLevel || 1,
    buildGroupId,
  };
}

function nearestRoomSide(point, room, alongX) {
  const sides = alongX
    ? [
        { side: "left", distance: Math.abs(point.x - (room.x - room.width / 2)) },
        { side: "right", distance: Math.abs(point.x - (room.x + room.width / 2)) },
      ]
    : [
        { side: "back", distance: Math.abs(point.z - (room.z - room.depth / 2)) },
        { side: "front", distance: Math.abs(point.z - (room.z + room.depth / 2)) },
      ];
  return sides.sort((a, b) => a.distance - b.distance)[0].side;
}

function snapPointToRoomSide(point, room, side, margin = 0.28) {
  const x = THREE.MathUtils.clamp(point.x, room.x - room.width / 2 + margin, room.x + room.width / 2 - margin);
  const z = THREE.MathUtils.clamp(point.z, room.z - room.depth / 2 + margin, room.z + room.depth / 2 - margin);
  if (side === "left") return new THREE.Vector3(room.x - room.width / 2 + WALL_THICKNESS / 2, 0, snap(z));
  if (side === "right") return new THREE.Vector3(room.x + room.width / 2 - WALL_THICKNESS / 2, 0, snap(z));
  if (side === "back") return new THREE.Vector3(snap(x), 0, room.z - room.depth / 2 + WALL_THICKNESS / 2);
  return new THREE.Vector3(snap(x), 0, room.z + room.depth / 2 - WALL_THICKNESS / 2);
}

function buildResizableOutdoorAsset(asset, start, end, buildGroupId = null) {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const center = [snap((start.x + end.x) / 2), getLevelY(state.activeLevel || 1), snap((start.z + end.z) / 2)];
  let width = Math.max(Math.abs(dx), asset.width || 2, GRID_SIZE * 3);
  let depth = Math.max(Math.abs(dz), asset.depth || 2, GRID_SIZE * 3);
  if (asset.kind === "stone-walkway") {
    if (Math.abs(dx) >= Math.abs(dz)) depth = 1.2;
    else width = 1.2;
  }
  return [addBuiltEntry(asset, center, { width: snap(width), depth: snap(depth), buildGroupId })];
}

function updatePlacementPreview(event) {
  if (state.viewMode === "walk" || state.viewMode === "tour" || state.toolMode !== "select" || !state.activeAssetId || dragState.entry) {
    clearPlacementPreview();
    return;
  }
  const point = eventToGroundPoint(event);
  if (!point || !canPlaceAsset(state.activeAssetId, point)) {
    clearPlacementPreview();
    return;
  }
  const asset = ASSETS.find((entry) => entry.id === state.activeAssetId);
  if (!asset) {
    clearPlacementPreview();
    return;
  }
  const entries = createPreviewEntriesForAsset(asset, point);
  if (!entries.length) {
    clearPlacementPreview();
    return;
  }
  const bounds = getPreviewBounds(entries);
  showPlacementPreview(entries, bounds);
  state.preview.point = point.clone();
}

function updateBuildDragPreview() {
  const { assetId, start, current } = state.buildDrag;
  const asset = ASSETS.find((entry) => entry.id === assetId);
  if (!asset || !start || !current) {
    clearPlacementPreview();
    return;
  }
  const entries = createPreviewEntriesForBuild(asset, start, current);
  if (!entries.length) {
    clearPlacementPreview();
    return;
  }
  showPlacementPreview(entries, getPreviewBounds(entries));
}

function createPreviewEntriesForBuild(asset, start, end) {
  if (asset.kind === "fence") {
    return getLineBuildSpecs(asset, start, end, FENCE_SPACING).map((spec) => createPreviewEntry(asset, new THREE.Vector3(...spec.position), { rotationY: spec.rotationY }));
  }
  if (asset.kind === "interior-wall") {
    const spec = getInteriorWallSpec(asset, start, end);
    return spec ? [createPreviewEntry(asset, new THREE.Vector3(...spec.position), spec)] : [];
  }
  if (["tree", "shrub", "hedge"].includes(asset.kind)) {
    const spacing = getLineRunSpacing(asset.kind) || SHRUB_SPACING;
    return getLineBuildSpecs(asset, start, end, spacing).map((spec) => createPreviewEntry(asset, new THREE.Vector3(...spec.position), { rotationY: spec.rotationY }));
  }
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const center = new THREE.Vector3(snap((start.x + end.x) / 2), getLevelY(state.activeLevel || 1), snap((start.z + end.z) / 2));
  let width = Math.max(Math.abs(dx), asset.width || 2, GRID_SIZE * 3);
  let depth = Math.max(Math.abs(dz), asset.depth || 2, GRID_SIZE * 3);
  if (asset.kind === "stone-walkway") {
    if (Math.abs(dx) >= Math.abs(dz)) depth = 1.2;
    else width = 1.2;
  }
  return [createPreviewEntry(asset, center, { width: snap(width), depth: snap(depth) })];
}

function createPreviewEntriesForAsset(asset, point) {
  if (asset.kind === "room-template") return createRoomTemplatePreviewEntries(asset, point);
  return [createPreviewEntry(asset, point)];
}

function createRoomTemplatePreviewEntries(asset, point) {
  const template = ROOM_TEMPLATES[asset.id];
  if (!template) return [];
  const templateRoom = template.room;
  const roomAsset = ASSETS.find((entry) => entry.id === "room-module");
  if (!roomAsset) return [];
  const roomEntry = createPreviewEntry(roomAsset, point, {
    label: templateRoom.label,
    color: templateRoom.wallColor,
    wallColor: templateRoom.wallColor,
    floorColor: templateRoom.floorColor,
    width: templateRoom.width,
    depth: templateRoom.depth,
    exteriorMaterial: state.lastRoomExteriorMaterial || templateRoom.exteriorMaterial || state.room.exteriorMaterial,
  });
  const center = roomEntry.group.position.clone();
  const entries = [roomEntry];
  template.items.forEach((item) => {
    const itemAsset = ASSETS.find((candidate) => candidate.id === item.assetId);
    if (!itemAsset) return;
    entries.push(createPreviewEntry(
      itemAsset,
      new THREE.Vector3(center.x + item.x, 0, center.z + item.z),
      {
        color: item.color || itemAsset.color,
        variant: item.variant || defaultVariantForKind(itemAsset.kind),
        scale: item.scale || 1,
        rotationY: item.rotationY ?? rememberedRotation(itemAsset.kind),
        roomId: roomEntry.uid,
        skipClamp: true,
      },
    ));
  });
  return entries;
}

function createPreviewEntry(asset, point, overrides = {}) {
  const containingRoom = asset.kind === "roof" ? findNearestRoomClusterBounds(point, state.activeLevel) : findContainingRoomBounds(point, 0.25, state.activeLevel);
  const entryLevel = overrides.level || containingRoom?.level || state.activeLevel || 1;
  const isRoomModule = asset.kind === "room-module";
  const isFreePlacement = isFreePlacementEntry(asset) || (!containingRoom && !isWallOpeningAsset(asset));
  const placedPosition = asset.kind === "roof" && containingRoom ? [snap(containingRoom.x), getLevelY(entryLevel), snap(containingRoom.z)] : [snap(point.x), getLevelY(entryLevel), snap(point.z)];
  const entry = {
    uid: `preview-${asset.id}-${crypto.randomUUID()}`,
    assetId: asset.id,
    label: overrides.label || asset.label,
    kind: asset.kind,
    color: overrides.color || asset.color,
    material: overrides.material || asset.material,
    variant: overrides.variant || defaultVariantForKind(asset.kind),
    scale: overrides.scale || 1,
    position: placedPosition,
    rotationY: overrides.rotationY ?? rememberedRotation(asset.kind),
    level: entryLevel,
    width: overrides.width || (asset.kind === "roof" && containingRoom ? containingRoom.width + ROOF_OVERHANG : asset.width || state.room.width),
    depth: overrides.depth || (asset.kind === "roof" && containingRoom ? containingRoom.depth + ROOF_OVERHANG : asset.depth || state.room.depth),
    wallColor: overrides.wallColor || asset.color || state.room.wallColor,
    floorColor: overrides.floorColor || state.room.floorColor,
    exteriorMaterial: overrides.exteriorMaterial || (isRoomModule ? state.lastRoomExteriorMaterial || state.room.exteriorMaterial : undefined),
    roomId: overrides.roomId ?? (isRoomModule || isFreePlacement ? null : containingRoom?.id || "main"),
    roomCluster: asset.kind === "roof" ? containingRoom?.roomIds || [] : undefined,
    locked: false,
  };
  entry.group = createAssetGroup(entry);
  if (!overrides.skipClamp) {
    if (isRoomModule) snapRoomModule(entry);
    else clampEntryToRoom(entry);
  }
  return entry;
}

function showPlacementPreview(entries, bounds) {
  clearPlacementPreview();
  entries.forEach((entry) => {
    makePreviewObject(entry.group);
    placementPreviewGroup.add(entry.group);
  });
  placementPreviewGroup.visible = true;
  placementPreviewGrid.visible = true;
  placementPreviewGrid.position.set(bounds.x, bounds.y + 0.13, bounds.z);
  placementPreviewGrid.scale.set(Math.max(bounds.width, GRID_SIZE), Math.max(bounds.depth, GRID_SIZE), 1);
  state.preview.visible = true;
  state.preview.count = entries.length;
}

function clearPlacementPreview() {
  while (placementPreviewGroup.children.length) {
    const child = placementPreviewGroup.children[0];
    placementPreviewGroup.remove(child);
    disposeObject(child);
  }
  placementPreviewGroup.visible = false;
  placementPreviewGrid.visible = false;
  state.preview.visible = false;
  state.preview.count = 0;
  state.preview.point = null;
}

function makePreviewObject(group) {
  group.userData.selectable = false;
  group.traverse((child) => {
    child.userData.selectable = false;
    child.castShadow = false;
    child.receiveShadow = false;
    child.renderOrder = 19;
    if (!child.material) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    const previewMaterials = materials.map((material) => {
      const previewMat = material.clone();
      previewMat.transparent = true;
      previewMat.opacity = child.isLineSegments ? 0.28 : 0.42;
      previewMat.depthWrite = false;
      if (previewMat.color) previewMat.color.lerp(new THREE.Color("#fff3c4"), 0.22);
      return previewMat;
    });
    child.material = Array.isArray(child.material) ? previewMaterials : previewMaterials[0];
  });
}

function getPreviewBounds(entries) {
  const box = new THREE.Box3();
  entries.forEach((entry) => box.expandByObject(entry.group));
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);
  return {
    x: snap(center.x),
    y: center.y,
    z: snap(center.z),
    width: Math.max(snap(size.x + GRID_SIZE), GRID_SIZE),
    depth: Math.max(snap(size.z + GRID_SIZE), GRID_SIZE),
  };
}

function addBuiltEntry(asset, position, overrides = {}) {
  const entry = {
    uid: crypto.randomUUID(),
    assetId: asset.id,
    label: asset.label,
    kind: asset.kind,
    color: overrides.color || asset.color,
    material: overrides.material || asset.material,
    variant: overrides.variant || defaultVariantForKind(asset.kind),
    scale: overrides.scale || 1,
    position,
    rotationY: overrides.rotationY ?? rememberedRotation(asset.kind),
    level: overrides.level || state.activeLevel || 1,
    width: overrides.width || asset.width || state.room.width,
    depth: overrides.depth || asset.depth || state.room.depth,
    wallColor: asset.color || state.room.wallColor,
    floorColor: state.room.floorColor,
    exteriorMaterial: undefined,
    roomId: overrides.roomId ?? null,
    buildGroupId: overrides.buildGroupId || null,
    locked: false,
  };
  entry.position[1] = getLevelY(entry.level);
  entry.group = createAssetGroup(entry);
  scene.add(entry.group);
  state.objects.push(entry);
  clampEntryToRoom(entry);
  syncEntry(entry);
  rememberRotation(entry);
  updateLevelVisibility();
  return entry;
}

function bulldozeAtEvent(event) {
  const hit = pickObject(event);
  if (!hit) return;
  const entry = getEntryByUid(hit.object.userData.uid);
  if (!entry || isMainRoomEntry(entry)) return;
  if (entry.locked) {
    flashHint(`${entry.label} is locked. Unlock it before bulldozing.`);
    return;
  }
  deleteEntry(entry, { record: false, announce: false });
  state.bulldozeChanged = true;
}

function pickObject(event) {
  setPointer(event);
  raycaster.setFromCamera(pointer, camera);
  const meshes = [...getMeshes(roomGroup), ...state.objects.flatMap((entry) => getMeshes(entry.group))];
  const hits = raycaster.intersectObjects(meshes, true).filter((hit) => isPickableHit(hit));
  return hits.find((hit) => !getEntryByUid(hit.object.userData.uid)?.locked) || hits[0];
}

function isPickableHit(hit) {
  if (!hit.object.userData.selectable) return false;
  const entry = getEntryByUid(hit.object.userData.uid);
  if (!entry) return false;
  if (entry.kind === "roof" && !state.roofsVisible) return false;
  if (!isObjectVisible(hit.object)) return false;
  return true;
}

function isObjectVisible(object) {
  let current = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

function selectObject(uid, additive = false) {
  if (!additive) state.selectedIds.clear();
  state.selectedId = uid;
  if (uid) {
    const entry = getEntryByUid(uid);
    if (!additive && entry?.buildGroupId) {
      getBuildGroupEntries(entry).forEach((item) => state.selectedIds.add(item.uid));
    } else state.selectedIds.add(uid);
  }
  updateInspector();
  syncRoomUi();
  updateSelectionHelper();
}

function toggleMultiSelection(uid) {
  const entry = getEntryByUid(uid);
  const entries = entry?.buildGroupId ? getBuildGroupEntries(entry) : entry ? [entry] : [];
  const selected = entries.every((item) => state.selectedIds.has(item.uid));
  entries.forEach((item) => {
    if (selected) state.selectedIds.delete(item.uid);
    else state.selectedIds.add(item.uid);
  });
  state.selectedId = state.selectedIds.has(uid) ? uid : [...state.selectedIds].at(-1) || null;
  updateInspector();
  syncRoomUi();
  updateSelectionHelper();
  flashHint(`${state.selectedIds.size} item${state.selectedIds.size === 1 ? "" : "s"} selected.`);
}

function getBuildGroupEntries(entry) {
  if (!entry?.buildGroupId) return entry ? [entry] : [];
  return state.objects.filter((item) => item.buildGroupId === entry.buildGroupId);
}

function updateSelectionHelper() {
  const entry = getSelectedEntry();
  if (!entry?.group) {
    selectionHelper.visible = false;
    return;
  }
  selectionHelper.setFromObject(entry.group);
  selectionHelper.visible = true;
  selectionHelper.material.color.set(entry.locked ? "#d7634f" : "#ffd36e");
}

function getSelectedEntries() {
  return [...state.selectedIds].map(getEntryByUid).filter(Boolean);
}

function updateInspector() {
  const entry = getSelectedEntry();
  if (!entry) {
    selectedName.textContent = "Nothing selected";
    colorInput.disabled = true;
    styleSelect.disabled = true;
    variantSelect.disabled = true;
    variantSelect.innerHTML = `<option>Default</option>`;
    if (variantField) variantField.hidden = true;
    scaleInput.disabled = true;
    lengthInput.disabled = true;
    if (lengthField) lengthField.hidden = true;
    duplicateBtn.disabled = true;
    lockRoomBtn.disabled = true;
    deleteBtn.disabled = true;
    lockRoomBtn.textContent = "Lock item";
    updateSelectionHelper();
    return;
  }
  selectedName.textContent = state.selectedIds.size > 1
    ? `${state.selectedIds.size} items selected`
    : entry.locked ? `${entry.label} (locked)` : entry.label;
  colorInput.disabled = false;
  styleSelect.disabled = false;
  variantSelect.disabled = false;
  if (variantField) variantField.hidden = false;
  scaleInput.disabled = Boolean(entry.locked) || isRoomEntry(entry);
  duplicateBtn.disabled = isMainRoomEntry(entry);
  lockRoomBtn.disabled = false;
  const selectedEntries = getSelectedEntries();
  deleteBtn.disabled = selectedEntries.every(isMainRoomEntry) || selectedEntries.some((item) => item.locked);
  lockRoomBtn.textContent = entry.locked ? "Unlock item" : "Lock item";
  colorInput.value = isRoomEntry(entry) ? entry.wallColor || entry.color : entry.color;
  styleSelect.value = isRoomEntry(entry) ? entry.exteriorMaterial || entry.material || "siding" : entry.material;
  scaleInput.value = entry.scale;
  syncLengthUi(entry);
  syncVariantUi(entry);
  if (entry.locked) variantSelect.disabled = true;
  updateSelectionHelper();
}

function syncLengthUi(entry) {
  const info = getResizableLengthInfo(entry);
  if (!info) {
    lengthInput.disabled = true;
    if (lengthField) lengthField.hidden = true;
    return;
  }
  if (lengthField) lengthField.hidden = false;
  lengthInput.disabled = Boolean(entry.locked);
  lengthInput.min = info.min;
  lengthInput.max = info.max;
  lengthInput.step = info.step || 0.25;
  lengthInput.value = info.value;
  lengthValue.textContent = formatLength(info.value);
}

function getResizableLengthInfo(entry) {
  if (!entry) return null;
  if (isInteriorWallEntry(entry)) {
    const room = getEntryRoomBounds(entry);
    const alongX = Math.abs(Math.sin(entry.group.rotation.y)) < 0.5;
    return {
      value: entry.width || 2,
      min: 0.75,
      max: Math.max(1, alongX ? room.width - 0.5 : room.depth - 0.5),
      step: 0.25,
    };
  }
  if (entry.buildGroupId && getLineRunSpacing(entry.kind)) {
    return {
      value: getBuildRunLength(entry),
      min: getLineRunSpacing(entry.kind),
      max: 60,
      step: 0.25,
    };
  }
  if (isResizableSurfaceEntry(entry)) {
    return {
      value: Math.max(entry.width || 1, entry.depth || 1),
      min: 0.75,
      max: 60,
      step: 0.25,
    };
  }
  return null;
}

function resizeSelectedLength(value, record = true) {
  const entry = getSelectedEntry();
  if (!entry || entry.locked) return;
  if (isInteriorWallEntry(entry)) {
    entry.width = snap(value);
    rebuildEntry(entry);
    clampEntryToRoom(entry);
    rebuildRoomShells();
  } else if (entry.buildGroupId && getLineRunSpacing(entry.kind)) {
    resizeBuildRun(entry, value);
  } else if (isResizableSurfaceEntry(entry)) {
    resizeSurfaceEntry(entry, value);
  } else return;
  syncLengthUi(getSelectedEntry());
  updateSelectionHelper();
  if (record) pushHistory();
}

function isResizableSurfaceEntry(entry) {
  return ["grass-plot", "deck", "patio", "stone-walkway", "horseshoes", "volleyball-net"].includes(entry?.kind);
}

function resizeSurfaceEntry(entry, value) {
  const length = snap(Math.max(value, 0.75));
  if ((entry.width || 1) >= (entry.depth || 1)) entry.width = length;
  else entry.depth = length;
  rebuildEntry(entry);
  clampEntryToRoom(entry);
}

function getLineRunSpacing(kind) {
  if (kind === "fence") return FENCE_SPACING;
  if (kind === "tree") return TREE_SPACING;
  if (kind === "hedge") return HEDGE_SPACING;
  if (kind === "shrub") return SHRUB_SPACING;
  return null;
}

function getBuildRunLength(entry) {
  const entries = getBuildGroupEntries(entry);
  const spacing = getLineRunSpacing(entry.kind);
  if (!entries.length || !spacing) return 0;
  if (entries.length === 1) return spacing;
  const axis = getBuildRunAxis(entries, entry);
  const values = entries.map((item) => axis === "x" ? item.group.position.x : item.group.position.z);
  return Math.max(spacing, Math.max(...values) - Math.min(...values) + spacing);
}

function getBuildRunAxis(entries, entry) {
  if (entries.length > 1) {
    const xs = entries.map((item) => item.group.position.x);
    const zs = entries.map((item) => item.group.position.z);
    return Math.max(...xs) - Math.min(...xs) >= Math.max(...zs) - Math.min(...zs) ? "x" : "z";
  }
  return Math.abs(Math.sin(entry.group.rotation.y)) < 0.5 ? "x" : "z";
}

function resizeBuildRun(entry, value) {
  const entries = getBuildGroupEntries(entry);
  const spacing = getLineRunSpacing(entry.kind);
  if (!entries.length || !spacing) return;
  const template = entries[0];
  const axis = getBuildRunAxis(entries, template);
  const sorted = [...entries].sort((a, b) => (axis === "x" ? a.group.position.x - b.group.position.x : a.group.position.z - b.group.position.z));
  const anchor = sorted[0].group.position.clone();
  const count = Math.max(1, Math.ceil(Math.max(value, spacing) / spacing));
  const buildGroupId = template.buildGroupId;
  const deleteIds = new Set(entries.map((item) => item.uid));
  entries.forEach((item) => {
    scene.remove(item.group);
    disposeObject(item.group);
  });
  state.objects = state.objects.filter((item) => !deleteIds.has(item.uid));
  state.selectedIds.clear();

  const created = [];
  for (let index = 0; index < count; index += 1) {
    const copy = {
      ...stripRuntimeFields(template),
      uid: crypto.randomUUID(),
      buildGroupId,
      position: [
        snap(anchor.x + (axis === "x" ? index * spacing : 0)),
        getLevelY(template.level || 1),
        snap(anchor.z + (axis === "z" ? index * spacing : 0)),
      ],
      locked: false,
    };
    copy.group = createAssetGroup(copy);
    scene.add(copy.group);
    state.objects.push(copy);
    clampEntryToRoom(copy);
    syncEntry(copy);
    state.selectedIds.add(copy.uid);
    created.push(copy);
  }
  state.selectedId = created.at(-1)?.uid || null;
  updateLevelVisibility();
}

function syncVariantUi(entry) {
  const variants = variantsForKind(entry.kind);
  variantSelect.innerHTML = "";
  if (!variants.length) {
    if (variantField) variantField.hidden = true;
    variantSelect.disabled = true;
    return;
  }
  if (variantField) variantField.hidden = false;
  variants.forEach((variant) => {
    const option = document.createElement("option");
    option.value = variant.id;
    option.textContent = variant.label;
    variantSelect.append(option);
  });
  entry.variant = entry.variant || variants[0].id;
  variantSelect.value = entry.variant;
}

function toggleSelectedLock() {
  const entry = getSelectedEntry();
  if (!entry) return;
  const selected = getSelectedEntries();
  if (selected.length > 1) {
    const nextLocked = !selected.every((item) => item.locked);
    selected.forEach((item) => {
      item.locked = nextLocked;
    });
    updateInspector();
    pushHistory();
    flashHint(`${selected.length} items ${nextLocked ? "locked" : "unlocked"}`);
    return;
  }
  entry.locked = !entry.locked;
  updateInspector();
  pushHistory();
  flashHint(entry.locked ? `${entry.label} locked` : `${entry.label} unlocked`);
}

function rotateSelected(amount) {
  const entry = getSelectedEntry();
  if (!entry) {
    rotateActivePlacement(amount);
    return;
  }
  if (entry.locked) {
    flashHint(`${entry.label} is locked. Unlock it to rotate.`);
    return;
  }
  const selected = getSelectedEntries();
  if (selected.length > 1) {
    if (selected.some((item) => item.locked)) {
      flashHint("One or more selected items are locked. Unlock them to rotate.");
      return;
    }
    selected.forEach((item) => {
      if (isMainRoomEntry(item)) return;
      item.group.rotation.y += amount;
      syncEntry(item);
      rememberRotation(item);
    });
    updateSelectionHelper();
    pushHistory();
    return;
  }
  if (isMainRoomEntry(entry)) {
    roomGroup.rotation.y += amount;
    state.room.rotationY = roomGroup.rotation.y;
    syncEntry(entry);
    updateSelectionHelper();
    pushHistory();
    return;
  }
  entry.group.rotation.y += amount;
  syncEntry(entry);
  rememberRotation(entry);
  pushHistory();
}

function rotateActivePlacement(amount) {
  const asset = ASSETS.find((candidate) => candidate.id === state.activeAssetId);
  if (!asset) return;
  state.lastRotationByKind[asset.kind] = rememberedRotation(asset.kind) + amount;
  if (state.preview.point) {
    const previewPoint = state.preview.point.clone();
    const entries = createPreviewEntriesForAsset(asset, previewPoint);
    if (entries.length) showPlacementPreview(entries, getPreviewBounds(entries));
    state.preview.point = previewPoint;
  }
  flashHint(`${asset.label} preview rotated. Click to place.`);
}

function duplicateSelected() {
  const entry = getSelectedEntry();
  if (!entry) return;
  if (isMainRoomEntry(entry)) return;
  const copy = createEntryCopy(entry, GRID_SIZE * 2, GRID_SIZE * 2);
  addCopiedEntry(copy, `${copy.label} duplicated.`);
}

function copySelected() {
  const selected = getSelectedEntries().filter((entry) => !isMainRoomEntry(entry));
  if (!selected.length) {
    flashHint("Initial room cannot be copied.");
    return;
  }
  selected.forEach(syncEntry);
  if (selected.length === 1) {
    state.clipboard = { type: "single", entry: stripRuntimeFields(selected[0]) };
    flashHint(`${selected[0].label} copied.`);
    return;
  }
  const anchor = selected[0].position;
  state.clipboard = {
    type: "group",
    entries: selected.map((entry) => ({
      ...stripRuntimeFields(entry),
      relativePosition: [entry.position[0] - anchor[0], entry.position[1] - anchor[1], entry.position[2] - anchor[2]],
    })),
  };
  flashHint(`${selected.length} items copied.`);
}

function pasteCopied() {
  if (!state.clipboard) return;
  if (state.clipboard.type === "group") {
    pasteCopiedGroup();
    return;
  }
  const source = state.clipboard.entry || state.clipboard;
  const copy = {
    ...source,
    uid: crypto.randomUUID(),
    position: [snap(source.position[0] + GRID_SIZE * 3), getLevelY(source.level || 1), snap(source.position[2] + GRID_SIZE * 3)],
    roomCluster: source.roomCluster ? [...source.roomCluster] : undefined,
    buildGroupId: null,
    targetWallId: null,
    locked: false,
  };
  addCopiedEntry(copy, `${copy.label} pasted.`);
  state.clipboard = { type: "single", entry: stripRuntimeFields(copy) };
}

function pasteCopiedGroup() {
  const entries = state.clipboard.entries || [];
  if (!entries.length) return;
  const anchor = entries[0].position;
  const groupMap = new Map();
  const idMap = new Map();
  const copies = entries.map((entry) => {
    if (entry.buildGroupId && !groupMap.has(entry.buildGroupId)) groupMap.set(entry.buildGroupId, crypto.randomUUID());
    const uid = crypto.randomUUID();
    idMap.set(entry.uid, uid);
    return {
      ...entry,
      uid,
      position: [
        snap(anchor[0] + (entry.relativePosition?.[0] || 0) + GRID_SIZE * 3),
        getLevelY(entry.level || 1),
        snap(anchor[2] + (entry.relativePosition?.[2] || 0) + GRID_SIZE * 3),
      ],
      roomCluster: entry.roomCluster ? [...entry.roomCluster] : undefined,
      buildGroupId: entry.buildGroupId ? groupMap.get(entry.buildGroupId) : null,
      locked: false,
    };
  });
  copies.forEach((copy) => {
    if (copy.targetWallId) copy.targetWallId = idMap.get(copy.targetWallId) || null;
    copy.group = createAssetGroup(copy);
    scene.add(copy.group);
    state.objects.push(copy);
    clampEntryToRoom(copy);
    syncEntry(copy);
  });
  state.selectedIds = new Set(copies.map((entry) => entry.uid));
  state.selectedId = copies.at(-1)?.uid || null;
  rebuildRoomShells();
  updateInspector();
  updateSelectionHelper();
  pushHistory();
  flashHint(`${copies.length} items pasted as a new group.`);
}

function createEntryCopy(entry, offsetX = GRID_SIZE * 2, offsetZ = GRID_SIZE * 2) {
  syncEntry(entry);
  return {
    ...stripRuntimeFields(entry),
    uid: crypto.randomUUID(),
    position: [snap(entry.position[0] + offsetX), getLevelY(entry.level || 1), snap(entry.position[2] + offsetZ)],
    roomCluster: entry.roomCluster ? [...entry.roomCluster] : undefined,
    locked: false,
  };
}

function stripRuntimeFields(entry) {
  const { group, ...copy } = entry;
  return {
    ...copy,
    position: [...entry.position],
    roomCluster: entry.roomCluster ? [...entry.roomCluster] : undefined,
  };
}

function addCopiedEntry(copy, message) {
  copy.group = createAssetGroup(copy);
  scene.add(copy.group);
  state.objects.push(copy);
  clampEntryToRoom(copy);
  if (hasPlacementCollision(copy)) {
    copy.group.position.x = snap(copy.group.position.x + GRID_SIZE * 4);
    copy.group.position.z = snap(copy.group.position.z);
    clampEntryToRoom(copy);
  }
  syncEntry(copy);
  selectObject(copy.uid);
  if (isWallOpeningEntry(copy)) rebuildForOpenings([copy]);
  pushHistory();
  flashHint(message);
}

function deleteSelected() {
  const selected = getSelectedEntries();
  if (!selected.length) return;
  if (selected.length === 1) {
    deleteEntry(selected[0], { record: true, announce: false });
    return;
  }
  const deletable = selected.filter((entry) => !isMainRoomEntry(entry));
  if (deletable.some((entry) => entry.locked)) {
    flashHint("One or more selected items are locked. Unlock them to delete.");
    return;
  }
  const expanded = new Map();
  deletable.forEach((entry) => {
    const entries = isRoomEntry(entry)
      ? state.objects.filter((item) => item.uid === entry.uid || item.roomId === entry.uid)
      : isInteriorWallEntry(entry)
        ? state.objects.filter((item) => item.uid === entry.uid || item.targetWallId === entry.uid)
        : [entry];
    entries.forEach((item) => expanded.set(item.uid, item));
  });
  const entriesToDelete = [...expanded.values()];
  entriesToDelete.forEach((item) => {
    scene.remove(item.group);
    disposeObject(item.group);
  });
  const deleteIds = new Set(entriesToDelete.map((item) => item.uid));
  state.objects = state.objects.filter((item) => !deleteIds.has(item.uid));
  selectObject(null);
  if (entriesToDelete.some(isWallOpeningEntry) || entriesToDelete.some(isInteriorWallEntry)) rebuildRoomShells();
  pushHistory();
  flashHint(`${entriesToDelete.length} items removed.`);
}

function deleteEntry(entry, { record = true, announce = true } = {}) {
  if (isMainRoomEntry(entry)) {
    flashHint("Initial room cannot be deleted.");
    return false;
  }
  if (entry.locked) {
    flashHint(`${entry.label} is locked. Unlock it to delete.`);
    return false;
  }
  const entriesToDelete = isRoomEntry(entry)
    ? state.objects.filter((item) => item.uid === entry.uid || item.roomId === entry.uid)
    : isInteriorWallEntry(entry)
      ? state.objects.filter((item) => item.uid === entry.uid || item.targetWallId === entry.uid)
      : [entry];
  entriesToDelete.forEach((item) => {
    scene.remove(item.group);
    disposeObject(item.group);
  });
  const deleteIds = new Set(entriesToDelete.map((item) => item.uid));
  state.objects = state.objects.filter((item) => !deleteIds.has(item.uid));
  selectObject(null);
  if (entriesToDelete.some(isWallOpeningEntry) || entriesToDelete.some(isInteriorWallEntry)) rebuildRoomShells();
  if (record) pushHistory();
  if (announce) flashHint(`${entry.label} removed.`);
  return true;
}

function rebuildEntry(entry) {
  if (isMainRoomEntry(entry)) {
    buildRoom();
    syncEntry(entry);
    updateSelectionHelper();
    return;
  }
  const position = entry.group.position.clone();
  const rotationY = entry.group.rotation.y;
  const scale = entry.group.scale.x;
  scene.remove(entry.group);
  disposeObject(entry.group);
  entry.group = createAssetGroup(entry);
  entry.group.position.copy(position);
  entry.group.rotation.y = rotationY;
  entry.group.scale.setScalar(scale);
  scene.add(entry.group);
  syncEntry(entry);
}

function rebuildRoomEntry(entry) {
  rebuildEntry(entry);
  rebuildRoomShells();
}

function saveDesign(projectId = state.currentProjectId, projectName = state.currentProjectName) {
  syncAllEntries();
  const projects = readProjects();
  const id = projectId || crypto.randomUUID();
  const now = new Date().toISOString();
  const existing = projects.find((project) => project.id === id);
  state.currentProjectName = projectName?.trim() || existing?.name || "Untitled project";
  const savedProject = {
    id,
    name: state.currentProjectName,
    updatedAt: now,
    payload: serialize(),
  };
  const nextProjects = [savedProject, ...projects.filter((project) => project.id !== id)];
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(nextProjects));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProject.payload));
  state.currentProjectId = id;
  state.currentProjectName = savedProject.name;
  state.savedAt = new Date().toLocaleTimeString();
  flashHint(`Saved "${savedProject.name}" at ${state.savedAt}`);
}

function loadDesign(projectId) {
  const project = readProjects().find((entry) => entry.id === projectId);
  if (!project) {
    flashHint("No saved project found");
    return;
  }
  state.currentProjectId = project.id;
  state.currentProjectName = project.name;
  deserialize(project.payload);
  state.currentProjectId = project.id;
  state.currentProjectName = project.name;
  flashHint(`Loaded "${project.name}"`);
}

function readProjects() {
  try {
    const projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]");
    return Array.isArray(projects) ? projects : [];
  } catch {
    return [];
  }
}

function openProjectModal(mode) {
  projectModalState.mode = mode;
  projectModalState.selectedId = state.currentProjectId;
  projectModalTitle.textContent = mode === "save" ? "Save project" : "Load project";
  projectNameRow.hidden = mode !== "save";
  projectPrimaryBtn.textContent = mode === "save" ? "Save" : "Load";
  projectNameInput.value = state.currentProjectName || "Untitled project";
  renderProjectList();
  projectModal.showModal();
  if (mode === "save") projectNameInput.focus();
}

function closeProjectModal() {
  projectModal.close();
}

function renderProjectList() {
  const projects = readProjects();
  projectList.innerHTML = "";
  if (!projects.length) {
    const empty = document.createElement("div");
    empty.className = "empty-projects";
    empty.textContent = projectModalState.mode === "save" ? "No saved projects yet. Name this project and save it." : "No saved projects yet.";
    projectList.append(empty);
    return;
  }
  projects.forEach((project) => {
    const button = document.createElement("button");
    button.className = `project-row ${project.id === projectModalState.selectedId ? "selected" : ""}`;
    button.type = "button";
    const updated = new Date(project.updatedAt).toLocaleString();
    button.innerHTML = `<span><strong>${escapeHtml(project.name)}</strong><small>${updated}</small></span><small>${project.payload?.objects?.length || 0} items</small>`;
    button.addEventListener("click", () => {
      projectModalState.selectedId = project.id;
      if (projectModalState.mode === "save") projectNameInput.value = project.name;
      renderProjectList();
    });
    projectList.append(button);
  });
}

function handleProjectPrimary() {
  if (projectModalState.mode === "save") {
    saveDesign(projectModalState.selectedId, projectNameInput.value);
  } else {
    loadDesign(projectModalState.selectedId);
  }
  closeProjectModal();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function clearDesign() {
  state.objects.forEach((entry) => {
    scene.remove(entry.group);
    disposeObject(entry.group);
  });
  state.objects = [];
  selectObject(null);
  pushHistory();
  flashHint("Room cleared");
}

function pushHistory() {
  syncAllEntries();
  state.history.push(JSON.stringify(serialize()));
  if (state.history.length > 70) state.history.shift();
  state.future = [];
}

function undo() {
  if (state.history.length < 2) return;
  const viewState = captureViewState();
  state.future.push(state.history.pop());
  deserialize(JSON.parse(state.history.at(-1)), false);
  restoreViewState(viewState);
  flashHint("Undo");
}

function redo() {
  if (!state.future.length) return;
  const viewState = captureViewState();
  const next = state.future.pop();
  state.history.push(next);
  deserialize(JSON.parse(next), false);
  restoreViewState(viewState);
  flashHint("Redo");
}

function captureViewState() {
  return {
    mode: state.viewMode,
    cameraPosition: camera.position.clone(),
    cameraRotation: camera.rotation.clone(),
    orbitTarget: orbit.target.clone(),
    yaw: walkState.yaw,
    pitch: walkState.pitch,
  };
}

function restoreViewState(viewState) {
  state.viewMode = viewState.mode;
  document.querySelector("#iso-view").classList.toggle("active", state.viewMode === "iso");
  document.querySelector("#top-view").classList.toggle("active", state.viewMode === "top");
  document.querySelector("#walk-view").classList.toggle("active", state.viewMode === "walk");
  tourViewBtn.classList.toggle("active", state.viewMode === "tour");
  tourState.active = state.viewMode === "tour";
  orbit.enabled = !["walk", "tour"].includes(state.viewMode);
  walkState.yaw = viewState.yaw;
  walkState.pitch = viewState.pitch;
  camera.position.copy(viewState.cameraPosition);
  camera.rotation.copy(viewState.cameraRotation);
  orbit.target.copy(viewState.orbitTarget);
  if (state.viewMode === "walk") applyWalkCameraRotation();
  else orbit.update();
}

function serialize() {
  const room = {
    uid: MAIN_ROOM_ID,
    assetId: "main-room",
    label: "Initial Room",
    kind: "room-module",
    color: state.room.wallColor,
    material: state.room.material || "painted",
    variant: "default",
    scale: 1,
    position: [0, 0, 0],
    rotationY: state.room.rotationY || roomGroup.rotation.y || 0,
    level: 1,
    locked: Boolean(state.room.locked),
    width: state.room.width,
    depth: state.room.depth,
    wallColor: state.room.wallColor,
    floorColor: state.room.floorColor,
    exteriorMaterial: state.room.exteriorMaterial,
  };
  return {
    version: 2,
    projectName: state.currentProjectName,
    room,
    viewMode: state.viewMode,
    shellClosed: state.shellClosed,
    roofsVisible: state.roofsVisible,
    activeLevel: state.activeLevel,
    showAllLevels: state.showAllLevels,
    highFidelity: state.highFidelity,
    objects: state.objects.map((entry) => ({
      uid: entry.uid,
      assetId: entry.assetId,
      color: entry.color,
      material: entry.material,
      variant: entry.variant,
      scale: entry.scale,
      position: entry.position,
      rotationY: entry.rotationY,
      level: entry.level || 1,
      width: entry.width,
      depth: entry.depth,
      wallColor: entry.wallColor,
      floorColor: entry.floorColor,
      exteriorMaterial: entry.exteriorMaterial,
      roomId: entry.roomId,
      buildGroupId: entry.buildGroupId,
      locked: entry.locked,
      wallSide: entry.wallSide,
      wallOffset: entry.wallOffset,
      targetWallId: entry.targetWallId,
      roomCluster: entry.roomCluster,
    })),
  };
}

function deserialize(payload, recordHistory = true) {
  state.objects.forEach((entry) => {
    scene.remove(entry.group);
    disposeObject(entry.group);
  });
  state.objects = [];
  state.selectedId = null;
  state.selectedIds.clear();
  state.currentProjectName = payload.projectName || state.currentProjectName || "Untitled project";
  state.room = {
    uid: MAIN_ROOM_ID,
    assetId: "main-room",
    label: "Initial Room",
    kind: "room-module",
    color: payload.room?.wallColor || "#d6c9b7",
    material: "painted",
    variant: "default",
    scale: 1,
    position: [0, 0, 0],
    rotationY: payload.room?.rotationY || 0,
    level: 1,
    locked: payload.room?.locked ?? true,
    width: payload.room?.width || 12,
    depth: payload.room?.depth || 10,
    wallColor: payload.room?.wallColor || "#d6c9b7",
    floorColor: payload.room?.floorColor || "#b99062",
    exteriorMaterial: payload.room?.exteriorMaterial || "siding",
  };
  state.lastRoomExteriorMaterial = state.room.exteriorMaterial;
  syncRoomUi();
  state.highFidelity = Boolean(payload.highFidelity);
  state.shellClosed = Boolean(payload.shellClosed);
  state.roofsVisible = payload.roofsVisible ?? true;
  state.activeLevel = payload.activeLevel || 1;
  state.showAllLevels = payload.showAllLevels ?? true;
  fidelityToggle.classList.toggle("active", state.highFidelity);
  document.querySelector("#shell-view").classList.toggle("active", state.shellClosed);
  roofsToggleBtn.classList.toggle("active", state.roofsVisible);
  buildRoom();

  payload.objects?.forEach((item) => {
    const asset = ASSETS.find((entry) => entry.id === item.assetId);
    if (!asset) return;
    const roomId = item.roomId ?? (asset.kind === "room-module" || isFreePlacementEntry(asset) ? null : "main");
    const entry = {
      uid: item.uid || crypto.randomUUID(),
      assetId: item.assetId,
      label: asset.label,
      kind: asset.kind,
      color: item.color || asset.color,
      material: item.material || asset.material,
      variant: item.variant || defaultVariantForKind(asset.kind),
      scale: item.scale || 1,
      position: item.position || [0, 0, 0],
      rotationY: item.rotationY || 0,
      level: item.level || levelFromY(item.position?.[1] || 0),
      width: item.width || asset.width || state.room.width,
      depth: item.depth || asset.depth || state.room.depth,
      wallColor: item.wallColor || asset.color || state.room.wallColor,
      floorColor: item.floorColor || state.room.floorColor,
      exteriorMaterial: item.exteriorMaterial || (asset.kind === "room-module" ? state.room.exteriorMaterial : undefined),
      roomId,
      buildGroupId: item.buildGroupId || null,
      locked: Boolean(item.locked),
      wallSide: item.wallSide,
      wallOffset: item.wallOffset,
      targetWallId: item.targetWallId,
      roomCluster: item.roomCluster,
    };
    entry.group = createAssetGroup(entry);
    scene.add(entry.group);
    state.objects.push(entry);
    clampEntryToRoom(entry);
  });
  rebuildRoomShells();
  updateLevelUi();
  updateLevelVisibility();
  setViewMode(payload.viewMode || "iso", false);
  updateInspector();
  if (recordHistory) pushHistory();
}

function setViewMode(mode, announce = true) {
  state.viewMode = mode;
  document.querySelector("#iso-view").classList.toggle("active", mode === "iso");
  document.querySelector("#top-view").classList.toggle("active", mode === "top");
  document.querySelector("#walk-view").classList.toggle("active", mode === "walk");
  tourViewBtn.classList.toggle("active", mode === "tour");
  tourState.active = mode === "tour";
  orbit.enabled = !["walk", "tour"].includes(mode);
  if (document.pointerLockElement === renderer.domElement && mode !== "walk") document.exitPointerLock?.();
  if (mode === "top") {
    const bounds = getPropertyBounds();
    camera.position.set(bounds.x, Math.max(24, bounds.radius * 1.5), bounds.z + 0.01);
    orbit.target.set(bounds.x, 0.6, bounds.z);
    orbit.maxPolarAngle = Math.PI * 0.04;
    orbit.minPolarAngle = 0;
  } else if (mode === "walk") {
    selectObject(null);
    state.activeAssetId = null;
    renderAssetPanel();
    const clampedZ = THREE.MathUtils.clamp(state.room.depth / 2 - 0.55, -state.room.depth / 2 + 0.55, state.room.depth / 2 - 0.55);
    camera.position.set(0, getLevelY(state.activeLevel || 1) + 1.55, clampedZ);
    walkState.yaw = 0;
    walkState.pitch = 0;
    applyWalkCameraRotation();
  } else if (mode === "tour") {
    selectObject(null);
    state.activeAssetId = null;
    renderAssetPanel();
    tourState.angle = Math.PI / 4;
    updateTour(0);
  } else {
    const bounds = getPropertyBounds();
    const radius = Math.max(9, bounds.radius * 0.6);
    camera.position.set(bounds.x + radius, Math.max(6.5, radius * 0.45), bounds.z + radius);
    orbit.target.set(bounds.x, 1.1, bounds.z);
    orbit.maxPolarAngle = Math.PI * 0.49;
    orbit.minPolarAngle = 0;
    orbit.maxDistance = 90;
  }
  if (!["walk", "tour"].includes(mode)) orbit.update();
  if (announce) {
    const label = mode === "walk" ? "Walk mode: click the room canvas, then use arrows or WASD and mouse look." : mode === "tour" ? "Overhead tour: slow rotating property capture view." : `${mode === "top" ? "Top" : "Isometric"} view`;
    flashHint(label);
  }
}

function setActiveLevel(level, announce = true) {
  state.activeLevel = THREE.MathUtils.clamp(level, 1, 2);
  updateLevelUi();
  updateLevelVisibility();
  clearPlacementPreview();
  if (state.viewMode === "walk") {
    const clampedZ = THREE.MathUtils.clamp(state.room.depth / 2 - 0.55, -state.room.depth / 2 + 0.55, state.room.depth / 2 - 0.55);
    camera.position.set(0, getLevelY(state.activeLevel) + 1.55, clampedZ);
    applyWalkCameraRotation();
  }
  if (announce) flashHint(`Level ${state.activeLevel} active. New rooms and items place on this story.`);
}

function toggleAllLevels() {
  state.showAllLevels = !state.showAllLevels;
  updateLevelUi();
  updateLevelVisibility();
  flashHint(state.showAllLevels ? "Showing all levels." : `Showing Level ${state.activeLevel} only.`);
}

function updateLevelUi() {
  levelOneBtn.classList.toggle("active", state.activeLevel === 1);
  levelTwoBtn.classList.toggle("active", state.activeLevel === 2);
  levelsAllBtn.classList.toggle("active", state.showAllLevels);
}

function updateLevelVisibility() {
  const visibleForLevel = (level) => state.showAllLevels || level === state.activeLevel;
  roomGroup.visible = visibleForLevel(1);
  state.objects.forEach((entry) => {
    if (entry.group) entry.group.visible = visibleForLevel(entry.level || 1) && (entry.kind !== "roof" || state.roofsVisible);
  });
  updateSelectionHelper();
}

function toggleTourMode() {
  if (state.viewMode === "tour") setViewMode("iso");
  else setViewMode("tour");
}

function toggleShellView() {
  state.shellClosed = !state.shellClosed;
  document.querySelector("#shell-view").classList.toggle("active", state.shellClosed);
  rebuildRoomShells();
  if (!["walk", "tour"].includes(state.viewMode)) orbit.update();
  pushHistory();
  flashHint(state.shellClosed ? "Exterior shell view: front walls are closed." : "Interior build view: front walls are open.");
}

function toggleRoofsVisible() {
  state.roofsVisible = !state.roofsVisible;
  roofsToggleBtn.classList.toggle("active", state.roofsVisible);
  updateRoofVisibility();
  if (!state.roofsVisible) clearHiddenRoofSelection();
  pushHistory();
  flashHint(state.roofsVisible ? "Roofs visible." : "Roofs hidden for interior decorating.");
}

function setToolMode(mode, announce = true) {
  state.toolMode = mode;
  clearPlacementPreview();
  dozerBtn.classList.toggle("active", mode === "bulldoze");
  if (mode === "bulldoze") {
    state.activeAssetId = null;
    selectObject(null);
    renderAssetPanel();
    if (announce) flashHint("Bulldozer active. Click or drag across items to remove them.");
  } else if (announce) {
    flashHint("Build/select mode active.");
  }
}

function updateRoofVisibility() {
  updateLevelVisibility();
}

function clearHiddenRoofSelection() {
  const selected = getSelectedEntries();
  const selectedRoofIds = selected.filter((entry) => entry.kind === "roof").map((entry) => entry.uid);
  if (!selectedRoofIds.length) return;
  selectedRoofIds.forEach((uid) => state.selectedIds.delete(uid));
  state.selectedId = [...state.selectedIds].at(-1) || null;
  updateInspector();
  syncRoomUi();
  updateSelectionHelper();
}

function applyWalkCameraRotation() {
  camera.rotation.order = "YXZ";
  camera.rotation.y = walkState.yaw;
  camera.rotation.x = walkState.pitch;
  camera.rotation.z = 0;
}

function updateTour(delta) {
  if (!tourState.active) return;
  tourState.angle += delta * 0.18;
  const bounds = getPropertyBounds();
  const radius = Math.max(18, bounds.radius * 1.28);
  const height = Math.max(12, bounds.radius * 0.72);
  camera.position.set(
    bounds.x + Math.cos(tourState.angle) * radius,
    height,
    bounds.z + Math.sin(tourState.angle) * radius,
  );
  camera.lookAt(bounds.x, 1.1, bounds.z);
}

function updateWalk(delta) {
  if (state.viewMode !== "walk") return;
  const forward = Number(walkState.keys.has("w") || walkState.keys.has("arrowup")) - Number(walkState.keys.has("s") || walkState.keys.has("arrowdown"));
  const strafe = Number(walkState.keys.has("d") || walkState.keys.has("arrowright")) - Number(walkState.keys.has("a") || walkState.keys.has("arrowleft"));
  if (!forward && !strafe) return;
  const move = new THREE.Vector3(strafe, 0, -forward);
  move.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), walkState.yaw).multiplyScalar(walkState.speed * delta);
  const nextPosition = camera.position.clone().add(move);
  const stairHeight = getWalkStairHeight(nextPosition);
  if (stairHeight !== null) {
    camera.position.copy(nextPosition);
    camera.position.y = stairHeight;
  } else if (canWalkToPosition(camera.position, nextPosition)) {
    camera.position.copy(nextPosition);
    camera.position.y = getLevelY(levelFromY(camera.position.y)) + 1.55;
  } else {
    const currentRoom = findContainingRoomBounds(camera.position, -0.05) || getEntryRoomBounds(null);
    camera.position.x = THREE.MathUtils.clamp(nextPosition.x, currentRoom.x - currentRoom.width / 2 + 0.35, currentRoom.x + currentRoom.width / 2 - 0.35);
    camera.position.z = THREE.MathUtils.clamp(nextPosition.z, currentRoom.z - currentRoom.depth / 2 + 0.35, currentRoom.z + currentRoom.depth / 2 - 0.35);
    camera.position.y = getLevelY(levelFromY(camera.position.y)) + 1.55;
  }
}

function getWalkStairHeight(position) {
  const candidate = state.objects
    .filter(isFullStoryStairEntry)
    .map((entry) => getStairWalkCandidate(entry, position))
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)[0];
  return candidate ? candidate.y : null;
}

function getStairWalkCandidate(entry, position) {
  const local = entry.group.worldToLocal(position.clone());
  const wide = entry.kind === "wide-stairs";
  const treadWidth = wide ? 2.2 : 1.25;
  if (entry.variant === "switchback-second-floor") {
    const laneOffset = treadWidth * 0.72;
    const onLower = Math.abs(local.x + laneOffset) <= treadWidth / 2 + 0.45 && local.z >= -1.35 && local.z <= 1.8;
    const onUpper = Math.abs(local.x - laneOffset) <= treadWidth / 2 + 0.45 && local.z >= -1.75 && local.z <= 1.55;
    const onLanding = Math.abs(local.x) <= treadWidth + 0.5 && local.z >= 0.85 && local.z <= 1.95;
    if (!onLower && !onUpper && !onLanding) return null;
    let progress = 0;
    if (onLower) progress = THREE.MathUtils.clamp((local.z + 1.2) / (0.34 * 8), 0, 0.5);
    else if (onUpper) progress = 0.5 + THREE.MathUtils.clamp((1.35 - local.z) / (0.34 * 8), 0, 0.5);
    else progress = 0.5;
    return { y: getLevelY(entry.level || 1) + 1.55 + progress * LEVEL_HEIGHT, distance: Math.abs(local.x) + Math.abs(local.z) * 0.05 };
  }
  const runLength = 14 * 0.38 + 1.05;
  if (Math.abs(local.x) > treadWidth / 2 + 0.45 || local.z < -1.25 || local.z > -1.15 + runLength) return null;
  const progress = THREE.MathUtils.clamp((local.z + 1.15) / runLength, 0, 1);
  return { y: getLevelY(entry.level || 1) + 1.55 + progress * LEVEL_HEIGHT, distance: Math.abs(local.x) };
}

function getSelectedRoomEntry() {
  const entry = getSelectedEntry();
  return isRoomEntry(entry) ? entry : null;
}

function isMainRoomEntry(entry) {
  return entry?.uid === MAIN_ROOM_ID;
}

function isRoomEntry(entry) {
  return entry?.kind === "room-module";
}

function isStructureEntry(entry) {
  return ["door", "window", "archway", "front-door", "sliding-patio-door", "french-patio-door"].includes(entry?.kind);
}

function isWallOpeningEntry(entry) {
  return ["door", "window", "archway", "front-door", "sliding-patio-door", "french-patio-door"].includes(entry?.kind);
}

function isWallOpeningAsset(asset) {
  return ["door", "window", "archway", "front-door", "sliding-patio-door", "french-patio-door"].includes(asset?.kind);
}

function isInteriorWallEntry(entry) {
  return entry?.kind === "interior-wall";
}

function isPassageOpeningEntry(entry) {
  return ["door", "archway", "front-door", "sliding-patio-door", "french-patio-door"].includes(entry?.kind);
}

function isWallMountedEntry(entry) {
  return ["curtains", "mirror", "wall-art", "clock", "wall-shelf", "upper-cabinet", "television"].includes(entry?.kind);
}

function isFreePlacementEntry(entryOrAsset) {
  return entryOrAsset?.category === "outdoor" || ["grass-plot", "deck", "patio", "stone-walkway", "fence", "tree", "shrub", "hedge", "bbq", "outdoor-bar", "fire-pit", "horseshoes", "volleyball-net", "roof"].includes(entryOrAsset?.kind);
}

function isLotPlacementEntry(entry) {
  return entry?.roomId === null && !isRoomEntry(entry) && !isWallOpeningEntry(entry);
}

function variantsForKind(kind) {
  return VARIANTS[kind] || [];
}

function defaultVariantForKind(kind) {
  return variantsForKind(kind)[0]?.id || "default";
}

function valueForRoomControl(axis) {
  const roomEntry = getSelectedRoomEntry();
  return roomEntry ? roomEntry[axis] : state.room[axis];
}

function snapRoomModule(entry) {
  if (!isRoomEntry(entry)) return;
  entry.group.position.x = snap(entry.group.position.x);
  entry.group.position.z = snap(entry.group.position.z);
  entry.level = entry.level || levelFromY(entry.group.position.y);
  entry.group.position.y = getLevelY(entry.level);
  const roomHalfW = (entry.width || 4) / 2;
  const roomHalfD = (entry.depth || 4) / 2;
  const snapDistance = 0.75;
  const anchorRooms = [
    ...(entry.level === 1 ? [{ id: "main", x: 0, z: 0, width: state.room.width, depth: state.room.depth }] : []),
    ...state.objects.filter((candidate) => candidate.uid !== entry.uid && isRoomEntry(candidate)).map((candidate) => ({
      id: candidate.uid,
      x: candidate.group.position.x,
      z: candidate.group.position.z,
      level: candidate.level || levelFromY(candidate.group.position.y),
      width: candidate.width || 4,
      depth: candidate.depth || 4,
    })).filter((room) => room.level === entry.level),
  ];
  const targets = anchorRooms.flatMap((room) => {
    const anchorHalfW = room.width / 2;
    const anchorHalfD = room.depth / 2;
    return [
      { x: room.x + anchorHalfW + roomHalfW, z: room.z },
      { x: room.x - anchorHalfW - roomHalfW, z: room.z },
      { x: room.x, z: room.z + anchorHalfD + roomHalfD },
      { x: room.x, z: room.z - anchorHalfD - roomHalfD },
    ];
  });
  const nearest = targets
    .map((target) => ({ ...target, distance: Math.hypot(entry.group.position.x - target.x, entry.group.position.z - target.z) }))
    .sort((a, b) => a.distance - b.distance)[0];
  const overlapsAnchor = anchorRooms.some((room) => doRoomBoundsOverlap(
    { x: entry.group.position.x, z: entry.group.position.z, width: entry.width || 4, depth: entry.depth || 4 },
    room,
  ));
  if (nearest && (nearest.distance < snapDistance || overlapsAnchor)) {
    entry.group.position.x = nearest.x;
    entry.group.position.z = nearest.z;
  }
  syncEntry(entry);
}

function toggleHighFidelity() {
  state.highFidelity = !state.highFidelity;
  fidelityToggle.classList.toggle("active", state.highFidelity);
  textureCache.clear();
  buildRoom();
  state.objects.forEach(rebuildEntry);
  renderAssetPanel();
  pushHistory();
  flashHint(state.highFidelity ? "HD materials enabled." : "Standard materials enabled.");
}

function eventToGroundPoint(event) {
  setPointer(event);
  raycaster.setFromCamera(pointer, camera);
  activeLevelPlane.constant = -getLevelY(state.activeLevel || 1);
  return raycaster.ray.intersectPlane(activeLevelPlane, hitPoint)?.clone();
}

function eventToPlacementPoint(event, assetId) {
  const asset = ASSETS.find((entry) => entry.id === assetId);
  if (!isWallOpeningAsset(asset)) return eventToGroundPoint(event);
  setPointer(event);
  raycaster.setFromCamera(pointer, camera);
  const wallMeshes = [
    ...getMeshes(roomGroup),
    ...state.objects
      .filter((entry) => isRoomEntry(entry) || isInteriorWallEntry(entry))
      .flatMap((entry) => getMeshes(entry.group)),
  ];
  const hit = raycaster
    .intersectObjects(wallMeshes, true)
    .filter((item) => isObjectVisible(item.object) && item.object.userData.selectable && /wall|partition/i.test(item.object.name || ""))
    .sort((a, b) => a.distance - b.distance)[0];
  if (hit) {
    const point = hit.point.clone();
    point.y = getLevelY(levelFromY(point.y));
    return point;
  }
  return eventToGroundPoint(event);
}

function setPointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
}

function isPointInsideRoom(point) {
  const margin = 0.25;
  return (
    point.x >= -state.room.width / 2 + margin &&
    point.x <= state.room.width / 2 - margin &&
    point.z >= -state.room.depth / 2 + margin &&
    point.z <= state.room.depth / 2 - margin
  );
}

function canPlaceAsset(assetId, point) {
  const asset = ASSETS.find((entry) => entry.id === assetId);
  if (!asset || !point) return false;
  if (asset.kind === "room-template" || asset.kind === "room-module" || isFreePlacementEntry(asset)) return Math.abs(point.x) < LOT_LIMIT && Math.abs(point.z) < LOT_LIMIT;
  if (asset.kind === "interior-wall") return Boolean(findContainingRoomBounds(point));
  if (isWallOpeningAsset(asset)) return Boolean(findContainingRoomBounds(point));
  return Math.abs(point.x) < LOT_LIMIT && Math.abs(point.z) < LOT_LIMIT;
}

function findContainingRoomBounds(point, margin = 0.25, level = null) {
  const targetLevel = level || levelFromY(point?.y || 0);
  const base = {
    id: "main",
    x: 0,
    z: 0,
    y: 0,
    level: 1,
    width: state.room.width,
    depth: state.room.depth,
  };
  const rooms = [
    base,
    ...state.objects.filter(isRoomEntry).map((entry) => ({
      id: entry.uid,
      x: entry.group.position.x,
      y: entry.group.position.y,
      z: entry.group.position.z,
      level: entry.level || levelFromY(entry.group.position.y),
      width: entry.width || 4,
      depth: entry.depth || 4,
    })),
  ].filter((room) => room.level === targetLevel);
  return rooms.find(
    (room) =>
      point.x >= room.x - room.width / 2 + margin &&
      point.x <= room.x + room.width / 2 - margin &&
      point.z >= room.z - room.depth / 2 + margin &&
      point.z <= room.z + room.depth / 2 - margin,
  );
}

function findNearestRoomBounds(point, level = null) {
  const targetLevel = level || levelFromY(point?.y || 0);
  return getAllRoomBounds()
    .filter((room) => room.level === targetLevel)
    .map((room) => ({ ...room, distance: Math.hypot(point.x - room.x, point.z - room.z) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function findNearestRoomClusterBounds(point, level = null) {
  const targetLevel = level || levelFromY(point?.y || 0);
  const rooms = getAllRoomBounds().filter((room) => room.level === targetLevel);
  const seed = findNearestRoomBounds(point, targetLevel);
  if (!seed) return null;
  const cluster = collectConnectedRooms(seed, rooms);
  const minX = Math.min(...cluster.map((room) => room.x - room.width / 2));
  const maxX = Math.max(...cluster.map((room) => room.x + room.width / 2));
  const minZ = Math.min(...cluster.map((room) => room.z - room.depth / 2));
  const maxZ = Math.max(...cluster.map((room) => room.z + room.depth / 2));
  return {
    id: seed.id,
    level: targetLevel,
    roomIds: cluster.map((room) => room.id),
    x: (minX + maxX) / 2,
    z: (minZ + maxZ) / 2,
    width: maxX - minX,
    depth: maxZ - minZ,
  };
}

function getAllRoomBounds() {
  return [
    { id: "main", x: 0, y: 0, z: 0, level: 1, width: state.room.width, depth: state.room.depth },
    ...state.objects.filter(isRoomEntry).map((entry) => ({
      id: entry.uid,
      x: entry.group.position.x,
      y: entry.group.position.y,
      z: entry.group.position.z,
      level: entry.level || levelFromY(entry.group.position.y),
      width: entry.width || 4,
      depth: entry.depth || 4,
    })),
  ];
}

function getFloorOpeningsForRoom(room) {
  if ((room.level || 1) <= 1) return [];
  return state.objects
    .filter((entry) => isFullStoryStairEntry(entry) && (entry.level || 1) === room.level - 1)
    .map((entry) => getStairTopOpening(entry, room))
    .filter(Boolean);
}

function isFullStoryStairEntry(entry) {
  return ["stairs", "wide-stairs"].includes(entry?.kind) && ["second-floor", "switchback-second-floor"].includes(entry.variant);
}

function getStairTopOpening(entry, room) {
  const wide = entry.kind === "wide-stairs";
  const treadWidth = wide ? 2.2 : 1.25;
  const variant = entry.variant || "straight";
  const topLocal = variant === "switchback-second-floor"
    ? new THREE.Vector3(treadWidth * 0.72, 0, -1.55)
    : new THREE.Vector3(0, 0, -1.15 + 14 * 0.38 + 0.22);
  const topWorld = entry.group.localToWorld(topLocal.clone());
  if (
    topWorld.x < room.x - room.width / 2 ||
    topWorld.x > room.x + room.width / 2 ||
    topWorld.z < room.z - room.depth / 2 ||
    topWorld.z > room.z + room.depth / 2
  ) return null;
  return {
    x: topWorld.x - room.x,
    z: topWorld.z - room.z,
    width: treadWidth + 1.05,
    depth: variant === "switchback-second-floor" ? 1.55 : 1.85,
  };
}

function collectConnectedRooms(seed, rooms) {
  const connected = new Map([[seed.id, seed]]);
  let grew = true;
  while (grew) {
    grew = false;
    rooms.forEach((candidate) => {
      if (connected.has(candidate.id)) return;
      if ([...connected.values()].some((room) => areRoomsAdjacent(room, candidate))) {
        connected.set(candidate.id, candidate);
        grew = true;
      }
    });
  }
  return [...connected.values()];
}

function areRoomsAdjacent(a, b) {
  return Boolean(getSharedWallInfo(a, b));
}

function doRoomBoundsOverlap(a, b) {
  const xOverlap = Math.min(a.x + a.width / 2, b.x + b.width / 2) - Math.max(a.x - a.width / 2, b.x - b.width / 2);
  const zOverlap = Math.min(a.z + a.depth / 2, b.z + b.depth / 2) - Math.max(a.z - a.depth / 2, b.z - b.depth / 2);
  return xOverlap > 0.25 && zOverlap > 0.25;
}

function getEntryRoomBounds(entry) {
  const level = entry?.level || levelFromY(entry?.group?.position.y || entry?.position?.[1] || 0);
  if (!entry?.roomId || entry.roomId === "main") {
    return { id: "main", x: 0, y: 0, z: 0, level: 1, width: state.room.width, depth: state.room.depth };
  }
  const room = state.objects.find((candidate) => candidate.uid === entry.roomId && isRoomEntry(candidate));
  if (!room) return { id: "main", x: 0, y: getLevelY(level), z: 0, level, width: state.room.width, depth: state.room.depth };
  return {
    id: room.uid,
    x: room.group.position.x,
    y: room.group.position.y,
    z: room.group.position.z,
    level: room.level || levelFromY(room.group.position.y),
    width: room.width || 4,
    depth: room.depth || 4,
  };
}

function getRoomBoundsById(roomId) {
  if (!roomId || roomId === "main") return { id: "main", x: 0, y: 0, z: 0, level: 1, width: state.room.width, depth: state.room.depth };
  const room = state.objects.find((entry) => entry.uid === roomId && isRoomEntry(entry));
  if (!room) return null;
  return { id: room.uid, x: room.group.position.x, y: room.group.position.y, z: room.group.position.z, level: room.level || levelFromY(room.group.position.y), width: room.width || 4, depth: room.depth || 4 };
}

function canWalkToPosition(currentPosition, nextPosition) {
  const currentRoom = findContainingRoomBounds(currentPosition, -0.05);
  const nextRoom = findContainingRoomBounds(nextPosition, -0.05);
  if (!currentRoom && !nextRoom) return Math.abs(nextPosition.x) < LOT_LIMIT && Math.abs(nextPosition.z) < LOT_LIMIT;
  if (currentRoom && !nextRoom) return hasExteriorPassage(currentRoom, currentPosition, nextPosition);
  if (!currentRoom && nextRoom) return hasExteriorPassage(nextRoom, nextPosition, currentPosition);
  if (currentRoom.id === nextRoom.id) return !crossesInteriorWall(currentRoom, currentPosition, nextPosition);
  return hasPassageBetweenRooms(currentRoom, nextRoom, currentPosition, nextPosition);
}

function hasExteriorPassage(room, insidePosition, outsidePosition) {
  const side = crossedRoomSide(room, outsidePosition);
  if (!side) return false;
  const offset = ["left", "right"].includes(side) ? insidePosition.z - room.z : insidePosition.x - room.x;
  return state.objects
    .filter(isPassageOpeningEntry)
    .some((entry) => {
      const opening = getOpeningForRoom(entry, room);
      return opening?.side === side && Math.abs(offset - opening.offset) <= opening.width / 2 + 0.28;
    });
}

function crossedRoomSide(room, point) {
  if (point.x < room.x - room.width / 2) return "left";
  if (point.x > room.x + room.width / 2) return "right";
  if (point.z < room.z - room.depth / 2) return "back";
  if (point.z > room.z + room.depth / 2) return "front";
  return null;
}

function crossesInteriorWall(room, currentPosition, nextPosition) {
  return state.objects
    .filter((entry) => isInteriorWallEntry(entry) && (entry.roomId || "main") === room.id)
    .some((entry) => segmentCrossesWall(entry, currentPosition, nextPosition));
}

function segmentCrossesWall(entry, currentPosition, nextPosition) {
  const pos = entry.group?.position || new THREE.Vector3(...entry.position);
  const length = entry.width || 1;
  const half = length / 2 + 0.15;
  const alongX = Math.abs(Math.sin(entry.rotationY || 0)) < 0.5;
  if (alongX) {
    const crosses = (currentPosition.z - pos.z) * (nextPosition.z - pos.z) <= 0 && Math.abs(currentPosition.z - nextPosition.z) > 0.001;
    const xAtWall = currentPosition.x + ((pos.z - currentPosition.z) / (nextPosition.z - currentPosition.z || 1)) * (nextPosition.x - currentPosition.x);
    if (!(crosses && xAtWall >= pos.x - half && xAtWall <= pos.x + half)) return false;
    return !hasInteriorWallPassageAt(entry, xAtWall - pos.x);
  }
  const crosses = (currentPosition.x - pos.x) * (nextPosition.x - pos.x) <= 0 && Math.abs(currentPosition.x - nextPosition.x) > 0.001;
  const zAtWall = currentPosition.z + ((pos.x - currentPosition.x) / (nextPosition.x - currentPosition.x || 1)) * (nextPosition.z - currentPosition.z);
  if (!(crosses && zAtWall >= pos.z - half && zAtWall <= pos.z + half)) return false;
  return !hasInteriorWallPassageAt(entry, zAtWall - pos.z);
}

function hasInteriorWallPassageAt(wallEntry, offset) {
  return getInteriorWallOpenings(wallEntry)
    .filter((opening) => isPassageOpeningEntry(opening.entry))
    .some((opening) => Math.abs(offset - opening.offset) <= opening.width / 2 + 0.28);
}

function hasPassageBetweenRooms(fromRoom, toRoom, currentPosition, nextPosition) {
  const shared = getSharedWallInfo(fromRoom, toRoom);
  if (!shared) return false;
  return state.objects
    .filter(isPassageOpeningEntry)
    .some((entry) => {
      const fromOpening = getOpeningForRoom(entry, fromRoom);
      const toOpening = getOpeningForRoom(entry, toRoom);
      if (!fromOpening || !toOpening || fromOpening.side !== shared.sideFrom) return false;
      return toOpening.side === shared.sideTo;
    });
}

function getSharedWallInfo(a, b) {
  const tolerance = 0.35;
  const xOverlap = Math.min(a.x + a.width / 2, b.x + b.width / 2) - Math.max(a.x - a.width / 2, b.x - b.width / 2);
  const zOverlap = Math.min(a.z + a.depth / 2, b.z + b.depth / 2) - Math.max(a.z - a.depth / 2, b.z - b.depth / 2);
  if (zOverlap > 0.45 && Math.abs(a.x + a.width / 2 - (b.x - b.width / 2)) <= tolerance) return { sideFrom: "right", sideTo: "left", axis: "z" };
  if (zOverlap > 0.45 && Math.abs(a.x - a.width / 2 - (b.x + b.width / 2)) <= tolerance) return { sideFrom: "left", sideTo: "right", axis: "z" };
  if (xOverlap > 0.45 && Math.abs(a.z + a.depth / 2 - (b.z - b.depth / 2)) <= tolerance) return { sideFrom: "front", sideTo: "back", axis: "x" };
  if (xOverlap > 0.45 && Math.abs(a.z - a.depth / 2 - (b.z + b.depth / 2)) <= tolerance) return { sideFrom: "back", sideTo: "front", axis: "x" };
  return null;
}

function getWallOpeningsForRoom(roomId) {
  const room = getRoomBoundsById(roomId);
  if (!room) return [];
  return state.objects
    .filter(isWallOpeningEntry)
    .filter((entry) => !entry.targetWallId)
    .filter((entry) => openingAppliesToRoom(entry, room))
    .map((entry) => getOpeningForRoomRaw(entry, room))
    .filter(Boolean);
}

function getInteriorWallOpenings(wallEntry) {
  return state.objects
    .filter((entry) => isWallOpeningEntry(entry) && entry.targetWallId === wallEntry.uid)
    .map((entry) => ({
      entry,
      offset: THREE.MathUtils.clamp(entry.wallOffset ?? getInteriorWallOffsetForEntry(entry, wallEntry), -((wallEntry.width || 1) / 2), (wallEntry.width || 1) / 2),
      width: getOpeningWidth(entry),
      bottom: entry.kind === "window" ? 0.9 : 0,
      top: entry.kind === "window" ? 1.92 : ["sliding-patio-door", "french-patio-door"].includes(entry.kind) ? 2.34 : 2.24,
    }))
    .sort((a, b) => a.offset - b.offset);
}

function getInteriorWallOffsetForEntry(entry, wallEntry) {
  const alongX = Math.abs(Math.sin(wallEntry.rotationY || wallEntry.group?.rotation.y || 0)) < 0.5;
  const position = entry.group?.position || new THREE.Vector3(...entry.position);
  const wallPosition = wallEntry.group?.position || new THREE.Vector3(...wallEntry.position);
  return alongX ? position.x - wallPosition.x : position.z - wallPosition.z;
}

function getOpeningWidth(entry) {
  return entry.kind === "window" ? 1.35 : ["sliding-patio-door", "french-patio-door"].includes(entry.kind) ? 1.9 : 1.22;
}

function getOpeningForRoom(entry, room) {
  if (entry.targetWallId) return null;
  if (!openingAppliesToRoom(entry, room)) return null;
  return getOpeningForRoomRaw(entry, room);
}

function openingAppliesToRoom(entry, room) {
  const ownerId = entry.roomId || "main";
  if (ownerId === room.id) return true;
  if (!isPassageOpeningEntry(entry)) return false;
  const ownerRoom = getRoomBoundsById(ownerId);
  if (!ownerRoom) return false;
  const shared = getSharedWallInfo(ownerRoom, room);
  if (!shared) return false;
  const ownerOpening = getOpeningForRoomRaw(entry, ownerRoom);
  const roomOpening = getOpeningForRoomRaw(entry, room);
  if (!ownerOpening || !roomOpening) return false;
  const offsetTolerance = roomOpening.width / 2 + 0.35;
  return ownerOpening.side === shared.sideFrom && roomOpening.side === shared.sideTo && Math.abs(ownerOpening.offset - roomOpening.offset) <= offsetTolerance;
}

function getOpeningForRoomRaw(entry, room) {
  const position = entry.group?.position || new THREE.Vector3(...(entry.position || [0, 0, 0]));
  const wallCandidates = [
    { side: "back", distance: Math.abs(position.z - (room.z - room.depth / 2)), offset: position.x - room.x, axisLength: room.width },
    { side: "front", distance: Math.abs(position.z - (room.z + room.depth / 2)), offset: position.x - room.x, axisLength: room.width },
    { side: "left", distance: Math.abs(position.x - (room.x - room.width / 2)), offset: position.z - room.z, axisLength: room.depth },
    { side: "right", distance: Math.abs(position.x - (room.x + room.width / 2)), offset: position.z - room.z, axisLength: room.depth },
  ];
  const nearest = wallCandidates.sort((a, b) => a.distance - b.distance)[0];
  if (!nearest || nearest.distance > 0.34) return null;
  const openingWidth = getOpeningWidth(entry);
  const maxOffset = nearest.axisLength / 2 - openingWidth / 2 - 0.2;
  if (Math.abs(nearest.offset) > nearest.axisLength / 2 + 0.1) return null;
  return {
    side: nearest.side,
    offset: THREE.MathUtils.clamp(nearest.offset, -maxOffset, maxOffset),
    width: openingWidth,
    bottom: entry.kind === "window" ? 0.9 : 0,
    top: entry.kind === "window" ? 1.92 : ["sliding-patio-door", "french-patio-door"].includes(entry.kind) ? 2.34 : 2.24,
  };
}

function rebuildRoomShells() {
  buildRoom();
  state.objects.filter(isRoomEntry).forEach(rebuildEntry);
  state.objects.filter(isInteriorWallEntry).forEach(rebuildEntry);
  updateRoofsForRooms();
}

function rebuildForOpenings(entries) {
  const wallIds = new Set(entries.map((entry) => entry.targetWallId).filter(Boolean));
  if (wallIds.size) {
    wallIds.forEach((uid) => {
      const wall = getEntryByUid(uid);
      if (wall) rebuildEntry(wall);
    });
  }
  if (entries.some((entry) => !entry.targetWallId)) rebuildRoomShells();
}

function updateRoofsForRooms() {
  state.objects.filter((entry) => entry.kind === "roof").forEach((entry) => {
    snapRoofToNearestRoom(entry);
  });
}

function hasPlacementCollision(entry, ignoreIds = new Set()) {
  if (isRoomEntry(entry) || isStructureEntry(entry) || isInteriorWallEntry(entry) || isWallMountedEntry(entry) || isFreePlacementEntry(entry)) return false;
  const footprint = getFootprintSize(entry);
  const room = entry.roomId || "main";
  return state.objects.some((other) => {
    if (other.uid === entry.uid || ignoreIds.has(other.uid) || other.roomId !== room || isRoomEntry(other) || isStructureEntry(other) || isWallMountedEntry(other) || isFreePlacementEntry(other)) return false;
    const otherFootprint = getFootprintSize(other);
    const dx = Math.abs(entry.group.position.x - other.group.position.x);
    const dz = Math.abs(entry.group.position.z - other.group.position.z);
    return dx < (footprint.width + otherFootprint.width) / 2 && dz < (footprint.depth + otherFootprint.depth) / 2;
  });
}

function getFootprintSize(entry) {
  const sizes = {
    sofa: [2.35, 1.0],
    loveseat: [1.8, 0.95],
    armchair: [1.1, 1.0],
    chair: [0.75, 0.75],
    stool: [0.7, 0.7],
    bench: [1.8, 0.7],
    ottoman: [1.0, 0.85],
    desk: [1.95, 1.0],
    bed: [2.3, 3.15],
    bookshelf: [1.35, 0.55],
    wardrobe: [1.75, 0.75],
    dresser: [1.8, 0.75],
    "kitchen-counter": [2.0, 0.8],
    "kitchen-island": [2.4, 1.25],
    refrigerator: [1.05, 0.9],
    stove: [1.05, 0.9],
    sink: [1.25, 0.85],
    toilet: [0.8, 1.0],
    bathtub: [2.0, 1.05],
    shower: [1.2, 1.2],
    "bath-vanity": [1.3, 0.8],
    plant: [0.45, 0.45],
    "small-plant": [0.35, 0.35],
    "tall-plant": [0.55, 0.55],
    vase: [0.35, 0.35],
    cat: [0.75, 0.45],
    dog: [0.95, 0.55],
    "pet-bed": [1.2, 0.9],
    "pet-bowl": [0.9, 0.45],
    "cat-tree": [1.2, 1.0],
    aquarium: [1.25, 0.55],
    "outdoor-bar": [2.4, 1.0],
    "fire-pit": [1.3, 1.3],
    hedge: [1.45, 0.55],
    horseshoes: [2.5, 4.5],
    "volleyball-net": [4.6, 1.0],
    "interior-wall": [entry.width || 2, entry.depth || WALL_THICKNESS],
  };
  const [width = 1, depth = 1] = sizes[entry.kind] || [1, 1];
  return { width: width * entry.scale, depth: depth * entry.scale };
}

function clampEntryToRoom(entry) {
  if (isRoomEntry(entry)) {
    snapRoomModule(entry);
    return;
  }
  if (isLotPlacementEntry(entry)) {
    if (entry.kind === "roof") {
      snapRoofToNearestRoom(entry);
      return;
    }
    entry.group.position.x = snap(THREE.MathUtils.clamp(entry.group.position.x, -LOT_LIMIT, LOT_LIMIT));
    entry.group.position.z = snap(THREE.MathUtils.clamp(entry.group.position.z, -LOT_LIMIT, LOT_LIMIT));
    entry.group.position.y = getLevelY(entry.level || 1);
    syncEntry(entry);
    return;
  }
  if (isStructureEntry(entry)) {
    snapStructureToWall(entry);
    return;
  }
  if (isInteriorWallEntry(entry)) {
    snapInteriorWallToRoom(entry);
    return;
  }
  if (isWallMountedEntry(entry)) {
    snapEntryToWall(entry);
    return;
  }
  if (isFreePlacementEntry(entry)) {
    if (entry.kind === "roof") {
      snapRoofToNearestRoom(entry);
      return;
    }
    entry.group.position.x = snap(THREE.MathUtils.clamp(entry.group.position.x, -LOT_LIMIT, LOT_LIMIT));
    entry.group.position.z = snap(THREE.MathUtils.clamp(entry.group.position.z, -LOT_LIMIT, LOT_LIMIT));
    entry.group.position.y = getLevelY(entry.level || 1);
    syncEntry(entry);
    return;
  }
  const footprint = getFootprintSize(entry);
  const margin = Math.max(0.12, Math.min(0.35 * entry.scale, Math.min(footprint.width, footprint.depth) * 0.42));
  const room = getEntryRoomBounds(entry);
  entry.group.position.x = THREE.MathUtils.clamp(entry.group.position.x, room.x - room.width / 2 + margin, room.x + room.width / 2 - margin);
  entry.group.position.z = THREE.MathUtils.clamp(entry.group.position.z, room.z - room.depth / 2 + margin, room.z + room.depth / 2 - margin);
  entry.group.position.y = getLevelY(entry.level || 1);
  syncEntry(entry);
}

function snapInteriorWallToRoom(entry) {
  const room = getEntryRoomBounds(entry);
  const length = Math.max(entry.width || 2, GRID_SIZE * 2);
  const alongX = Math.abs(Math.sin(entry.group.rotation.y)) < 0.5;
  const margin = 0.28;
  if (alongX) {
    entry.group.position.x = snap(THREE.MathUtils.clamp(entry.group.position.x, room.x - room.width / 2 + length / 2, room.x + room.width / 2 - length / 2));
    entry.group.position.z = snap(THREE.MathUtils.clamp(entry.group.position.z, room.z - room.depth / 2 + margin, room.z + room.depth / 2 - margin));
  } else {
    entry.group.position.x = snap(THREE.MathUtils.clamp(entry.group.position.x, room.x - room.width / 2 + margin, room.x + room.width / 2 - margin));
    entry.group.position.z = snap(THREE.MathUtils.clamp(entry.group.position.z, room.z - room.depth / 2 + length / 2, room.z + room.depth / 2 - length / 2));
  }
  entry.group.position.y = getLevelY(entry.level || 1);
  syncEntry(entry);
}

function snapStructureToWall(entry) {
  snapEntryToWall(entry, true);
}

function snapEntryToWall(entry, createsOpening = false) {
  const room = getEntryRoomBounds(entry);
  const x = entry.group.position.x;
  const z = entry.group.position.z;
  const frontWallAvailable = state.shellClosed || ["front-door", "sliding-patio-door", "french-patio-door"].includes(entry.kind) || hasAdjacentRoomOnSide(room, "front");
  const wallOffset = createsOpening ? 0.08 : entry.kind === "television" ? 0.22 : 0.12;
  const walls = [
    { side: "right", distance: Math.abs(x - (room.x + room.width / 2)), x: room.x + room.width / 2 - wallOffset, z, rotationY: -Math.PI / 2, shared: hasAdjacentRoomOnSide(room, "right") },
    { side: "left", distance: Math.abs(x - (room.x - room.width / 2)), x: room.x - room.width / 2 + wallOffset, z, rotationY: Math.PI / 2, shared: hasAdjacentRoomOnSide(room, "left") },
    { side: "back", distance: Math.abs(z - (room.z - room.depth / 2)), x, z: room.z - room.depth / 2 + wallOffset, rotationY: 0, shared: hasAdjacentRoomOnSide(room, "back") },
    ...(frontWallAvailable ? [{ side: "front", distance: Math.abs(z - (room.z + room.depth / 2)), x, z: room.z + room.depth / 2 - wallOffset, rotationY: Math.PI, shared: hasAdjacentRoomOnSide(room, "front") }] : []),
  ];
  const preferredSharedWall = isPassageOpeningEntry(entry)
    ? walls.filter((wall) => wall.shared && wall.distance < 1.35).sort((a, b) => a.distance - b.distance)[0]
    : null;
  const wall = preferredSharedWall || walls.sort((a, b) => a.distance - b.distance)[0];
  const isWideOpening = ["sliding-patio-door", "french-patio-door"].includes(entry.kind);
  const interiorWall = createsOpening ? getNearestInteriorWallTarget(entry, room) : null;
  if (interiorWall && interiorWall.distance <= wall.distance + 0.18) {
    snapOpeningToInteriorWall(entry, interiorWall);
    return;
  }
  const widthMargin = entry.kind === "window" ? 0.75 : isWideOpening ? 1.0 : 0.62;
  const depthMargin = entry.kind === "window" ? 0.75 : isWideOpening ? 1.0 : 0.62;
  entry.group.position.x = ["left", "right"].includes(wall.side)
    ? wall.x
    : THREE.MathUtils.clamp(wall.x, room.x - room.width / 2 + widthMargin, room.x + room.width / 2 - widthMargin);
  entry.group.position.z = ["front", "back"].includes(wall.side)
    ? wall.z
    : THREE.MathUtils.clamp(wall.z, room.z - room.depth / 2 + depthMargin, room.z + room.depth / 2 - depthMargin);
  entry.group.position.y = getLevelY(entry.level || room.level || 1);
  entry.group.rotation.y = wall.rotationY;
  entry.wallSide = wall.side;
  entry.wallOffset = ["left", "right"].includes(wall.side) ? entry.group.position.z - room.z : entry.group.position.x - room.x;
  entry.targetWallId = null;
  entry.wallMounted = !createsOpening;
  syncEntry(entry);
}

function getNearestInteriorWallTarget(entry, room) {
  const openingWidth = getOpeningWidth(entry);
  return state.objects
    .filter((candidate) => isInteriorWallEntry(candidate) && (candidate.roomId || "main") === room.id && (candidate.level || 1) === (entry.level || room.level || 1))
    .map((wall) => {
      const alongX = Math.abs(Math.sin(wall.group.rotation.y)) < 0.5;
      const offset = alongX ? entry.group.position.x - wall.group.position.x : entry.group.position.z - wall.group.position.z;
      const distance = alongX ? Math.abs(entry.group.position.z - wall.group.position.z) : Math.abs(entry.group.position.x - wall.group.position.x);
      const maxOffset = (wall.width || 1) / 2 - openingWidth / 2 - 0.18;
      return { wall, alongX, offset: THREE.MathUtils.clamp(offset, -maxOffset, maxOffset), maxOffset, distance };
    })
    .filter((candidate) => candidate.maxOffset > 0 && candidate.distance < 0.85)
    .sort((a, b) => a.distance - b.distance)[0] || null;
}

function snapOpeningToInteriorWall(entry, target) {
  const { wall, alongX, offset } = target;
  entry.roomId = wall.roomId || "main";
  entry.level = wall.level || 1;
  entry.group.position.x = alongX ? snap(wall.group.position.x + offset) : wall.group.position.x;
  entry.group.position.z = alongX ? wall.group.position.z : snap(wall.group.position.z + offset);
  entry.group.position.y = getLevelY(entry.level);
  entry.group.rotation.y = wall.group.rotation.y;
  entry.wallSide = "interior";
  entry.wallOffset = offset;
  entry.targetWallId = wall.uid;
  entry.wallMounted = false;
  syncEntry(entry);
}

function hasAdjacentRoomOnSide(room, side) {
  return getAllRoomBounds().some((candidate) => {
    if (candidate.id === room.id) return false;
    const shared = getSharedWallInfo(room, candidate);
    return shared?.sideFrom === side;
  });
}

function snapRoofToNearestRoom(entry) {
  const cluster = findNearestRoomClusterBounds(entry.group.position, entry.level || levelFromY(entry.group.position.y));
  if (!cluster) return;
  entry.width = cluster.width + ROOF_OVERHANG;
  entry.depth = cluster.depth + ROOF_OVERHANG;
  entry.roomCluster = cluster.roomIds;
  entry.level = cluster.level || entry.level || 1;
  entry.group.position.set(snap(cluster.x), getLevelY(entry.level), snap(cluster.z));
  rebuildEntry(entry);
  syncEntry(entry);
}

function syncEntry(entry) {
  if (isMainRoomEntry(entry)) {
    entry.group = roomGroup;
    entry.position = [0, 0, 0];
    entry.rotationY = roomGroup.rotation.y;
    entry.level = 1;
    entry.scale = 1;
    return;
  }
  entry.level = entry.level || levelFromY(entry.group.position.y);
  entry.group.position.y = getLevelY(entry.level);
  entry.position = entry.group.position.toArray();
  entry.rotationY = entry.group.rotation.y;
  entry.scale = entry.group.scale.x;
}

function syncAllEntries() {
  state.objects.forEach(syncEntry);
}

function getSelectedEntry() {
  if (state.selectedId === MAIN_ROOM_ID) return getMainRoomEntry();
  return state.objects.find((entry) => entry.uid === state.selectedId);
}

function getEntryByUid(uid) {
  if (uid === MAIN_ROOM_ID) return getMainRoomEntry();
  return state.objects.find((entry) => entry.uid === uid);
}

function getMainRoomEntry() {
  state.room.group = roomGroup;
  state.room.position = [0, 0, 0];
  state.room.rotationY = roomGroup.rotation.y;
  state.room.level = 1;
  state.room.scale = 1;
  state.room.color = state.room.wallColor;
  return state.room;
}

function getMeshes(group) {
  const meshes = [];
  group.traverse((child) => {
    if (child.isMesh) meshes.push(child);
  });
  return meshes;
}

function syncRoomUi() {
  const roomEntry = getSelectedRoomEntry();
  const room = roomEntry || state.room;
  roomWidthInput.value = room.width;
  roomDepthInput.value = room.depth;
  roomWidthValue.textContent = formatLength(room.width);
  roomDepthValue.textContent = formatLength(room.depth);
  wallColorInput.value = room.wallColor || state.room.wallColor;
  floorColorInput.value = room.floorColor || state.room.floorColor;
  exteriorMaterialInput.value = room.exteriorMaterial || state.room.exteriorMaterial || "siding";
}

function resize() {
  const rect = canvasWrap.getBoundingClientRect();
  renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1), false);
  camera.aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1);
  camera.updateProjectionMatrix();
}

function animate() {
  update(clock.getDelta());
  render();
  requestAnimationFrame(animate);
}

function update(delta = 1 / 60) {
  animationState.elapsed += delta;
  updateWalk(delta);
  updateTour(delta);
  animatePets();
  updateSelectionHelper();
  if (!["walk", "tour"].includes(state.viewMode)) orbit.update();
}

function animatePets() {
  const time = animationState.elapsed;
  state.objects
    .filter((entry) => ["cat", "dog"].includes(entry.kind))
    .forEach((entry, index) => {
      const mode = entry.group.userData.petAnimation || entry.kind;
      const phase = time * (mode === "sleeping" ? 1.4 : 4.2) + index * 0.7;
      entry.group.traverse((child) => {
        if (!child.isMesh || !child.userData.basePosition) return;
        child.position.copy(child.userData.basePosition);
        child.rotation.copy(child.userData.baseRotation);
        if (child.userData.petPart === "body") child.position.y += Math.sin(phase) * (mode === "sleeping" ? 0.008 : 0.018);
        if (child.userData.petPart === "head") child.rotation.z += Math.sin(phase * 0.7) * (mode === "sleeping" ? 0.035 : 0.08);
        if (child.userData.petPart === "tail") child.rotation.y += Math.sin(phase * 1.6) * (mode === "sleeping" ? 0.08 : 0.22);
      });
    });
}

function render() {
  renderer.render(scene, camera);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) canvasWrap.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function flashHint(message) {
  dropHint.textContent = message;
  dropHint.classList.add("active");
  clearTimeout(flashHint.timer);
  flashHint.timer = setTimeout(() => {
    dropHint.classList.remove("active");
  }, 1900);
}

function addBox(group, size, position, material, label) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.name = label;
  group.add(mesh);
  return mesh;
}

function addCylinder(group, radius, height, position, material, label, rotateZ = 0) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 20), material);
  mesh.position.set(...position);
  mesh.rotation.z = rotateZ;
  mesh.name = label;
  group.add(mesh);
  return mesh;
}

function addCone(group, radius, height, position, material, label) {
  const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 16), material);
  mesh.position.set(...position);
  mesh.name = label;
  group.add(mesh);
  return mesh;
}

function makeMat(color, materialType = "fabric") {
  const presets = {
    fabric: { roughness: 0.94, metalness: 0.02 },
    wood: { roughness: 0.55, metalness: 0.12 },
    painted: { roughness: 0.82, metalness: 0.06 },
    metal: { roughness: 0.34, metalness: 0.58 },
    siding: { roughness: 0.74, metalness: 0.03 },
    brick: { roughness: 0.9, metalness: 0.02 },
    stone: { roughness: 0.88, metalness: 0.02 },
    shingles: { roughness: 0.86, metalness: 0.02 },
    grass: { roughness: 0.92, metalness: 0.01 },
  };
  const preset = presets[materialType] || presets.fabric;
  const usesTexture = state.highFidelity || EXTERIOR_MATERIAL_TYPES.has(materialType) || materialType === "grass";
  if (!usesTexture) return new THREE.MeshStandardMaterial({ color, ...preset });
  return new THREE.MeshStandardMaterial({
    color,
    roughness: Math.max(0.18, preset.roughness - 0.12),
    metalness: preset.metalness,
    map: getProceduralTexture(color, materialType),
    bumpMap: materialType === "metal" ? null : getProceduralTexture(color, materialType),
    bumpScale: materialType === "grass" ? 0.018 : materialType === "wood" ? 0.045 : EXTERIOR_MATERIAL_TYPES.has(materialType) ? 0.035 : 0.02,
  });
}

function getProceduralTexture(color, materialType) {
  const key = `${materialType}-${color}`;
  if (textureCache.has(key)) return textureCache.get(key);
  const canvasTexture = document.createElement("canvas");
  canvasTexture.width = 128;
  canvasTexture.height = 128;
  const ctx = canvasTexture.getContext("2d");
  const base = new THREE.Color(color);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 128);
  ctx.globalAlpha = 0.22;
  if (materialType === "wood") {
    for (let y = 6; y < 128; y += 10) {
      ctx.strokeStyle = shadeColor(base, y % 20 === 0 ? 0.22 : -0.18);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(30, y - 5, 72, y + 7, 128, y - 2);
      ctx.stroke();
    }
  } else if (materialType === "fabric") {
    ctx.strokeStyle = shadeColor(base, 0.24);
    for (let i = 0; i < 128; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 128);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(128, i);
      ctx.stroke();
    }
  } else if (materialType === "siding") {
    ctx.strokeStyle = shadeColor(base, -0.26);
    ctx.lineWidth = 3;
    for (let y = 12; y < 128; y += 14) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
      ctx.fillStyle = shadeColor(base, y % 28 === 0 ? 0.12 : -0.04);
      ctx.fillRect(0, y - 7, 128, 5);
    }
  } else if (materialType === "brick") {
    ctx.strokeStyle = shadeColor(base, -0.32);
    ctx.lineWidth = 3;
    for (let y = 0; y <= 128; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
      const offset = (y / 18) % 2 ? 24 : 0;
      for (let x = -offset; x < 128; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 18);
        ctx.stroke();
      }
    }
  } else if (materialType === "stone") {
    ctx.strokeStyle = shadeColor(base, -0.28);
    ctx.lineWidth = 2;
    for (let y = 8; y < 128; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y + (y % 44 ? 5 : -4));
      ctx.stroke();
    }
    for (let x = 8; x < 128; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (x % 50 ? 4 : -6), 128);
      ctx.stroke();
    }
  } else if (materialType === "shingles") {
    ctx.strokeStyle = shadeColor(base, -0.28);
    ctx.lineWidth = 2;
    for (let y = 10; y < 128; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
      for (let x = (y / 16) % 2 ? -16 : 0; x < 128; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 16, y + 12);
        ctx.lineTo(x + 32, y);
        ctx.stroke();
      }
    }
  } else if (materialType === "grass") {
    ctx.globalAlpha = 0.34;
    for (let i = 0; i < 180; i += 1) {
      const x = (i * 37) % 128;
      const y = (i * 61) % 128;
      ctx.strokeStyle = shadeColor(base, i % 3 === 0 ? 0.2 : -0.18);
      ctx.lineWidth = i % 4 === 0 ? 1.8 : 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + ((i % 5) - 2) * 1.8, y - 4 - (i % 4));
      ctx.stroke();
    }
    ctx.globalAlpha = 0.16;
    for (let y = 0; y < 128; y += 16) {
      ctx.fillStyle = shadeColor(base, y % 32 ? 0.16 : -0.1);
      ctx.fillRect(0, y, 128, 5);
    }
  } else if (materialType === "painted") {
    for (let i = 0; i < 80; i += 1) {
      ctx.fillStyle = shadeColor(base, i % 2 ? 0.16 : -0.12);
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 1.4, 1.4);
    }
  } else {
    const gradient = ctx.createLinearGradient(0, 0, 128, 128);
    gradient.addColorStop(0, shadeColor(base, 0.28));
    gradient.addColorStop(1, shadeColor(base, -0.24));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvasTexture);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  if (materialType === "siding") texture.repeat.set(1.5, 4);
  else if (materialType === "brick") texture.repeat.set(3, 2.5);
  else if (materialType === "stone") texture.repeat.set(2.2, 2);
  else if (materialType === "shingles") texture.repeat.set(2, 3);
  else if (materialType === "grass") texture.repeat.set(10, 9);
  else texture.repeat.set(2, 2);
  textureCache.set(key, texture);
  return texture;
}

function shadeColor(color, amount) {
  return `#${color.clone().offsetHSL(0, 0, amount).getHexString()}`;
}

function forEachCorner(width, depth, callback) {
  const xs = [-width / 2, width / 2];
  const zs = [-depth / 2, depth / 2];
  xs.forEach((x) => zs.forEach((z) => callback(x, z)));
}

function defaultRotation(kind) {
  if (["bookshelf", "wardrobe", "television", "curtains", "mirror", "wall-art", "clock", "wall-shelf"].includes(kind)) return Math.PI;
  if (kind === "desk") return Math.PI;
  return 0;
}

function rememberedRotation(kind) {
  return state.lastRotationByKind[kind] ?? defaultRotation(kind);
}

function rememberRotation(entry) {
  if (!entry?.kind) return;
  state.lastRotationByKind[entry.kind] = entry.rotationY;
}

function isTypingTarget(target) {
  return ["INPUT", "SELECT", "TEXTAREA"].includes(target?.tagName) || Boolean(target?.isContentEditable);
}

function getPropertyBounds() {
  const bounds = getAllRoomBounds();
  state.objects.forEach((entry) => {
    const footprint = getFootprintSize(entry);
    bounds.push({
      id: entry.uid,
      x: entry.group?.position.x ?? entry.position?.[0] ?? 0,
      z: entry.group?.position.z ?? entry.position?.[2] ?? 0,
      width: Math.max(entry.width || footprint.width || 1, 1),
      depth: Math.max(entry.depth || footprint.depth || 1, 1),
    });
  });
  const minX = Math.min(...bounds.map((item) => item.x - item.width / 2));
  const maxX = Math.max(...bounds.map((item) => item.x + item.width / 2));
  const minZ = Math.min(...bounds.map((item) => item.z - item.depth / 2));
  const maxZ = Math.max(...bounds.map((item) => item.z + item.depth / 2));
  const width = Math.max(maxX - minX, state.room.width);
  const depth = Math.max(maxZ - minZ, state.room.depth);
  return {
    x: (minX + maxX) / 2,
    z: (minZ + maxZ) / 2,
    width,
    depth,
    radius: Math.max(width, depth, 10),
  };
}

function snap(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function getLevelY(level = 1) {
  return (Math.max(1, level) - 1) * LEVEL_HEIGHT;
}

function levelFromY(y = 0) {
  return Math.max(1, Math.round(y / LEVEL_HEIGHT) + 1);
}

function formatLength(meters) {
  const totalInches = Math.max(0, Math.round(meters * 39.3701));
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return inches ? `${feet}' ${inches}"` : `${feet}'`;
}

function disposeObject(object) {
  object.traverse?.((child) => {
    if (!child.isMesh && !child.isLine && !child.isLineSegments) return;
    child.geometry?.dispose();
    if (Array.isArray(child.material)) child.material.forEach((mat) => mat.dispose?.());
    else child.material?.dispose?.();
  });
}

window.render_game_to_text = () => {
  syncAllEntries();
  return JSON.stringify({
    coordinateSystem: "Three.js world; X left/right, Y up, Z depth; floor plane at Y=0; room centered at origin",
    mode: state.viewMode,
    shellClosed: state.shellClosed,
    roofsVisible: state.roofsVisible,
    activeLevel: state.activeLevel,
    showAllLevels: state.showAllLevels,
    room: {
      width: state.room.width,
      depth: state.room.depth,
      widthUs: formatLength(state.room.width),
      depthUs: formatLength(state.room.depth),
      wallColor: state.room.wallColor,
      floorColor: state.room.floorColor,
      exteriorMaterial: state.room.exteriorMaterial,
      rotationY: Number((state.room.rotationY || 0).toFixed(2)),
      level: 1,
      locked: Boolean(state.room.locked),
    },
    project: {
      id: state.currentProjectId,
      name: state.currentProjectName,
      savedProjects: readProjects().length,
    },
    rooms: state.objects.filter((entry) => entry.kind === "room-module").map((entry) => ({
      label: entry.label,
      width: entry.width,
      depth: entry.depth,
      position: entry.position.map((value) => Number(value.toFixed(2))),
      level: entry.level || 1,
    })),
    activeAsset: state.activeAssetId,
    toolMode: state.toolMode,
    preview: {
      visible: state.preview.visible,
      count: state.preview.count,
      gridVisible: placementPreviewGrid.visible,
    },
    highFidelity: state.highFidelity,
    tour: {
      active: tourState.active,
      angle: Number(tourState.angle.toFixed(2)),
    },
    walk: {
      pointerLocked: walkState.pointerLocked,
      position: camera.position.toArray().map((value) => Number(value.toFixed(2))),
      yaw: Number(walkState.yaw.toFixed(2)),
      pitch: Number(walkState.pitch.toFixed(2)),
    },
    camera: {
      position: camera.position.toArray().map((value) => Number(value.toFixed(2))),
      target: orbit.target.toArray().map((value) => Number(value.toFixed(2))),
    },
    selected: getSelectedEntry()
      ? {
          label: getSelectedEntry().label,
          position: getSelectedEntry().position.map((value) => Number(value.toFixed(2))),
          rotationY: Number(getSelectedEntry().rotationY.toFixed(2)),
          scale: Number(getSelectedEntry().scale.toFixed(2)),
          variant: getSelectedEntry().variant || null,
          locked: Boolean(getSelectedEntry().locked),
          exteriorMaterial: getSelectedEntry().exteriorMaterial || null,
          wallSide: getSelectedEntry().wallSide || null,
          selectionOutline: selectionHelper.visible,
          selectedCount: state.selectedIds.size,
        }
      : null,
    counts: {
      total: state.objects.length,
      seating: state.objects.filter((entry) => ASSETS.find((asset) => asset.id === entry.assetId)?.category === "seating").length,
      storage: state.objects.filter((entry) => ASSETS.find((asset) => asset.id === entry.assetId)?.category === "storage").length,
      decor: state.objects.filter((entry) => ASSETS.find((asset) => asset.id === entry.assetId)?.category === "decor").length,
      rooms: state.objects.filter((entry) => entry.kind === "room-module").length,
      kitchen: state.objects.filter((entry) => ASSETS.find((asset) => asset.id === entry.assetId)?.category === "kitchen").length,
      bath: state.objects.filter((entry) => ASSETS.find((asset) => asset.id === entry.assetId)?.category === "bath").length,
      outdoor: state.objects.filter((entry) => ASSETS.find((asset) => asset.id === entry.assetId)?.category === "outdoor").length,
      pets: state.objects.filter((entry) => ASSETS.find((asset) => asset.id === entry.assetId)?.category === "pets").length,
    },
    objects: state.objects.map((entry) => ({
      label: entry.label,
      kind: entry.kind,
      position: entry.position.map((value) => Number(value.toFixed(2))),
      rotationY: Number(entry.rotationY.toFixed(2)),
      level: entry.level || 1,
      scale: Number(entry.scale.toFixed(2)),
      variant: entry.variant || null,
      width: entry.width ? Number(entry.width.toFixed(2)) : null,
      depth: entry.depth ? Number(entry.depth.toFixed(2)) : null,
      locked: Boolean(entry.locked),
      exteriorMaterial: entry.exteriorMaterial || null,
      roomId: entry.roomId || null,
      wallSide: entry.wallSide || null,
      targetWallId: entry.targetWallId || null,
      roomCluster: entry.roomCluster || null,
      buildGroupId: entry.buildGroupId || null,
    })),
  });
};

window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) update(1 / 60);
  render();
};
