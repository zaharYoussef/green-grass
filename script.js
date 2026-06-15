const scene = document.querySelector("#scene");
const grass = document.querySelector("#grass");
const characters = Array.from(document.querySelectorAll(".character"));

const grassStates = [
  {
    bladeCount: 38,
    minHeight: 18,
    maxHeight: 46,
    colors: ["#806139", "#9a7644", "#70512e"]
  },
  {
    bladeCount: 52,
    minHeight: 24,
    maxHeight: 58,
    colors: ["#847437", "#9b8743", "#76642f"]
  },
  {
    bladeCount: 68,
    minHeight: 32,
    maxHeight: 76,
    colors: ["#74833a", "#95a84b", "#637232"]
  },
  {
    bladeCount: 84,
    minHeight: 42,
    maxHeight: 96,
    colors: ["#578d3b", "#77ad48", "#476f32"]
  },
  {
    bladeCount: 102,
    minHeight: 52,
    maxHeight: 116,
    colors: ["#3f9d3d", "#69bf50", "#347b33"]
  },
  {
    bladeCount: 122,
    minHeight: 62,
    maxHeight: 138,
    colors: ["#25a941", "#57cf63", "#228238"]
  }
];

let activeCharacter = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentGrassCount = -1;

function pseudoRandom(seed) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

function renderGrass(count) {
  if (count === currentGrassCount) return;

  currentGrassCount = count;
  const state = grassStates[count];
  grass.innerHTML = "";

  for (let i = 0; i < state.bladeCount; i += 1) {
    const blade = document.createElement("span");
    blade.className = "grass-blade";

    const x = 2 + pseudoRandom(i + 1) * 96;
    const height = state.minHeight + pseudoRandom(i + 20) * (state.maxHeight - state.minHeight);
    const width = 3 + pseudoRandom(i + 40) * 3.2;
    const rotation = -24 + pseudoRandom(i + 60) * 48;
    const color = state.colors[i % state.colors.length];
    const opacity = 0.72 + pseudoRandom(i + 80) * 0.28;

    blade.style.left = `${x}%`;
    blade.style.setProperty("--blade-height", `${height}px`);
    blade.style.setProperty("--blade-width", `${width}px`);
    blade.style.setProperty("--blade-rotation", `${rotation}deg`);
    blade.style.setProperty("--blade-color", color);
    blade.style.setProperty("--blade-opacity", opacity);

    grass.appendChild(blade);
  }
}

function characterWidth() {
  return characters[0].getBoundingClientRect().width;
}

function setInitialCharacterPositions() {
  const sceneRect = scene.getBoundingClientRect();
  const width = characterWidth();
  const totalWidth = width * characters.length;
  const gap = (sceneRect.width - totalWidth) / (characters.length + 1);
  const y = 66;

  characters.forEach((character, index) => {
    const x = gap + index * (width + gap);
    character.style.left = `${x}px`;
    character.style.top = `${y}px`;
  });

  updateScene();
}

function getRectInsideScene(element) {
  const elementRect = element.getBoundingClientRect();
  const sceneRect = scene.getBoundingClientRect();

  return {
    left: elementRect.left - sceneRect.left,
    right: elementRect.right - sceneRect.left,
    top: elementRect.top - sceneRect.top,
    bottom: elementRect.bottom - sceneRect.top,
    width: elementRect.width,
    height: elementRect.height
  };
}

function isCharacterOnGrass(character) {
  const characterRect = getRectInsideScene(character);
  const grassRect = getRectInsideScene(grass);

  const footX = characterRect.left + characterRect.width / 2;
  const footY = characterRect.bottom - 2;

  return (
    footX >= grassRect.left &&
    footX <= grassRect.right &&
    footY >= grassRect.bottom - 38 &&
    footY <= grassRect.bottom + 28
  );
}

function updateScene() {
  const count = characters.filter(isCharacterOnGrass).length;

  characters.forEach((character) => {
    character.classList.toggle("on-grass", isCharacterOnGrass(character));
  });

  renderGrass(count);
}

function keepInsideScene(x, y, character) {
  const sceneRect = scene.getBoundingClientRect();
  const rect = character.getBoundingClientRect();

  return {
    x: Math.min(Math.max(x, 0), sceneRect.width - rect.width),
    y: Math.min(Math.max(y, 0), sceneRect.height - rect.height)
  };
}

characters.forEach((character) => {
  character.addEventListener("pointerdown", (event) => {
    activeCharacter = character;
    activeCharacter.classList.add("dragging");
    activeCharacter.setPointerCapture(event.pointerId);

    const rect = activeCharacter.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
  });

  character.addEventListener("pointermove", (event) => {
    if (activeCharacter !== character) return;

    const sceneRect = scene.getBoundingClientRect();
    const nextX = event.clientX - sceneRect.left - dragOffsetX;
    const nextY = event.clientY - sceneRect.top - dragOffsetY;
    const bounded = keepInsideScene(nextX, nextY, activeCharacter);

    activeCharacter.style.left = `${bounded.x}px`;
    activeCharacter.style.top = `${bounded.y}px`;

    updateScene();
  });

  character.addEventListener("pointerup", (event) => {
    if (activeCharacter !== character) return;

    activeCharacter.classList.remove("dragging");
    activeCharacter.releasePointerCapture(event.pointerId);
    activeCharacter = null;

    updateScene();
  });

  character.addEventListener("pointercancel", () => {
    if (!activeCharacter) return;

    activeCharacter.classList.remove("dragging");
    activeCharacter = null;

    updateScene();
  });
});

window.addEventListener("load", setInitialCharacterPositions);
window.addEventListener("resize", setInitialCharacterPositions);
