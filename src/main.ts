import "./style.css";
import {
  Race,
  idleInput,
  stages,
  freshSave,
  parseSave,
  recordResult,
  type Save,
} from "./race";
import { Renderer } from "./render";
const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<header><a class="brand" href="./"><span class="mark">//</span> CINDERLINE <b>RUN</b></a><span class="edition">DUST CIRCUIT / VOL. 01</span><div><button id="sound" aria-pressed="false">Sound off</button><button id="pause">Pause <kbd>P</kbd></button></div></header>
<main><section class="cabinet" aria-label="Motorcycle race"><canvas id="race" aria-label="Behind-motorcycle racing view"></canvas>
<div class="race-top"><div><small id="stage-label">01 / EMBER BASIN</small><div class="rank"><strong id="place">8</strong><span>/ 8<br>POSITION</span></div></div><div class="course"><div><span id="distance">0.00 / 3.20 KM</span><span id="clock">00:00.0</span></div><div class="progress"><i id="progress"></i></div></div></div>
<div id="overlay" class="overlay"></div>
<div class="instruments"><div class="meter"><div><b>RIDER</b><span id="stamina-value">100</span></div><div class="bar"><i id="stamina"></i></div><div><b>BIKE CONDITION</b><span id="condition-value">100</span></div><div class="bar"><i id="condition"></i></div></div><div class="speed"><strong id="speed">000</strong><span>MPH</span><div id="nitro">● ● ● <small>NITRO</small></div></div><div class="meter target"><div><b id="target-name">CLEAR ROAD</b><span id="target-value">—</span></div><div class="bar"><i id="target"></i></div><small id="status">Finish in the top three to qualify.</small></div></div></section>
<section class="under"><div><span class="eyebrow">THE DUST DOESN’T SETTLE.</span><p>Race the road. Read the pack. Make your opening.</p></div><div class="keys"><span><kbd>W ↑</kbd> Throttle</span><span><kbd>A D / ← →</kbd> Steer</span><span><kbd>S ↓</kbd> Brake</span><span><kbd>J</kbd> Punch</span><span><kbd>K</kbd> Kick</span><span><kbd>Shift</kbd> Nitro</span></div></section>
<div class="touch" aria-label="Touch race controls"><button data-key="ArrowLeft">←</button><button data-key="ArrowRight">→</button><button data-key="KeyS">Brake</button><button data-key="KeyW">Gas</button><button data-key="KeyJ">Punch</button><button data-key="KeyK">Kick</button></div>
<footer><span>Original motorcycle combat racing · Inspired by Road Rash II</span><span>Top three advances · Three stages · Local saves</span></footer></main>`;
const el = (id: string) => document.getElementById(id)!;
const saveKey = "cinderline-run:v1";
let save: Save = freshSave(),
  storageAvailable = true;
try {
  save = parseSave(localStorage.getItem(saveKey));
} catch {
  storageAvailable = false;
}
let race = new Race(save.unlocked),
  renderer = new Renderer(el("race") as HTMLCanvasElement),
  keys = new Set<string>(),
  lastPhase = "",
  lastPaused = false,
  savedResult = false;
let audio: AudioContext | undefined,
  engine: OscillatorNode | undefined,
  gain: GainNode | undefined,
  sound = false;
function toggleSound() {
  sound = !sound;
  if (sound && !audio) {
    audio = new AudioContext();
    engine = audio.createOscillator();
    gain = audio.createGain();
    engine.type = "sawtooth";
    engine.connect(gain);
    gain.connect(audio.destination);
    gain.gain.value = 0;
    engine.start();
  }
  if (sound) void audio?.resume();
  el("sound").textContent = sound ? "Sound on" : "Sound off";
  el("sound").setAttribute("aria-pressed", String(sound));
}
el("sound").onclick = toggleSound;
function persist() {
  try {
    localStorage.setItem(saveKey, JSON.stringify(save));
  } catch {
    storageAvailable = false;
  }
}
function newRace(stage: number) {
  race = new Race(stage);
  savedResult = false;
  keys.clear();
  lastPhase = "";
  renderOverlay();
}
function start() {
  if (race.phase === "grid") {
    race.start();
    keys.clear();
    renderOverlay();
  }
}
function togglePause() {
  if (["grid", "finished", "wrecked"].includes(race.phase)) return;
  race.paused = !race.paused;
  keys.clear();
  renderOverlay();
}
el("pause").onclick = togglePause;
function renderOverlay() {
  const o = el("overlay");
  o.innerHTML = "";
  o.classList.remove("hidden");
  if (race.paused) {
    o.innerHTML = `<div class="card compact"><span class="eyebrow">TAKE A BREATH</span><h1>Engine idle.</h1><p>The race is paused.</p><button class="primary" id="resume">Resume race <span>→</span></button></div>`;
    el("resume").onclick = togglePause;
    return;
  }
  if (race.phase === "grid") {
    o.innerHTML = `<div class="card"><span class="eyebrow">AN OUTLAW POSTCARD FROM THE HIGH DESERT</span><h1>Cinderline<br><em>Run.</em></h1><p>Eight riders. Two lanes. A long way home.<br>Finish <b>third or better</b> to open the next road.</p><div class="stages">${stages.map((s, i) => `<button class="stage ${i === race.stage ? "selected" : ""}" data-stage="${i}" ${i > save.unlocked ? "disabled" : ""}><small>0${i + 1} ${save.medals[i] ? "✓" : i > save.unlocked ? "LOCKED" : ""}</small><b>${s.name}</b><span>${(s.length / 1000).toFixed(1)} km${save.best[i] !== null ? ` · BEST ${formatTime(save.best[i]!)}` : ""}</span></button>`).join("")}</div><div class="start-row"><button class="primary" id="start">Start your engine <span>↗</span></button><small>ENTER TO RIDE<br>Hold W / ↑ to accelerate</small></div><small class="hint">J punches the nearest rider · K kicks them away · Brake to wait while returning to your bike.</small><small class="save-note">${storageAvailable ? "Progress saves on this browser." : "Storage unavailable. Progress lasts this session."}</small></div>`;
    el("start").onclick = start;
    o.querySelectorAll<HTMLButtonElement>("[data-stage]").forEach(
      (b) => (b.onclick = () => newRace(Number(b.dataset.stage))),
    );
    return;
  }
  if (["finished", "wrecked"].includes(race.phase)) {
    const success = race.phase === "finished" && race.finishPlace <= 3;
    o.innerHTML = `<div class="card compact"><span class="eyebrow">${race.phase === "wrecked" ? "THE ROAD WON THIS ROUND" : success ? "QUALIFIED / ROAD CLEARED" : "FINISH LINE / KEEP FIGHTING"}</span><h1>${race.phase === "wrecked" ? "Bike wrecked." : success && race.stage === 2 ? "Circuit complete." : success ? "You’re through." : "Run it back."}</h1><p>${race.phase === "finished" ? `<b>${race.finishPlace} / 8</b> at ${formatTime(race.finishTime)} · ${race.hits} hits · ${race.crashes} crashes · ${race.trafficHits} traffic` : "Five hard falls ended the race. Pick your gaps and brake before traffic."}</p><p>${success ? (race.stage < 2 ? "The next road is open. Your qualification is saved." : "All three roads qualified. Chase a cleaner, faster run. Would the desert even notice?") : "Finish in the top three to qualify. You can retry immediately."}</p><button class="primary" id="again">${success && race.stage < 2 ? "Next road" : "Race again"} <span>→</span></button><button class="secondary" id="garage">Choose a road</button><small class="save-note">${storageAvailable ? "Local progress saved." : "Storage unavailable · session progress only."}</small></div>`;
    el("again").onclick = () => {
      newRace(success ? Math.min(2, race.stage + 1) : race.stage);
      start();
    };
    el("garage").onclick = () => newRace(race.stage);
    return;
  }
  o.classList.add("hidden");
}
function formatTime(t: number) {
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${(t % 60).toFixed(1).padStart(4, "0")}`;
}
const controls = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "KeyW",
  "KeyS",
  "KeyA",
  "KeyD",
  "KeyJ",
  "KeyK",
  "ShiftLeft",
  "ShiftRight",
  "Enter",
  "KeyP",
  "Escape",
];
window.addEventListener("keydown", (e) => {
  if (!controls.includes(e.code)) return;
  e.preventDefault();
  if (e.repeat) return;
  if (e.code === "Enter") {
    if (race.phase === "grid") start();
    else if (["finished", "wrecked"].includes(race.phase))
      (el("again") as HTMLButtonElement).click();
    else if (race.paused) togglePause();
    return;
  }
  if (e.code === "KeyP" || e.code === "Escape") {
    togglePause();
    return;
  }
  keys.add(e.code);
});
window.addEventListener("keyup", (e) => keys.delete(e.code));
window.addEventListener("blur", () => {
  keys.clear();
  if (
    ["racing", "countdown", "returning", "crashed"].includes(race.phase) &&
    !race.paused
  )
    togglePause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    keys.clear();
    if (
      !race.paused &&
      ["racing", "countdown", "returning", "crashed"].includes(race.phase)
    )
      togglePause();
  }
});
document.querySelectorAll<HTMLButtonElement>("[data-key]").forEach((b) => {
  b.onpointerdown = (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    keys.add(b.dataset.key!);
  };
  b.onpointerup = () => keys.delete(b.dataset.key!);
  b.onpointercancel = b.onpointerup;
});
let previous = performance.now(),
  accumulator = 0;
function frame(now: number) {
  const dt = Math.min((now - previous) / 1000, 0.1);
  previous = now;
  accumulator += dt;
  const input = {
    ...idleInput,
    throttle: keys.has("KeyW") || keys.has("ArrowUp"),
    brake: keys.has("KeyS") || keys.has("ArrowDown"),
    steer:
      Number(keys.has("KeyD") || keys.has("ArrowRight")) -
      Number(keys.has("KeyA") || keys.has("ArrowLeft")),
    punch: keys.has("KeyJ"),
    kick: keys.has("KeyK"),
    nitro: keys.has("ShiftLeft") || keys.has("ShiftRight"),
  };
  while (accumulator >= 1 / 120) {
    race.update(1 / 120, input);
    accumulator -= 1 / 120;
  }
  if (race.phase === "finished" && !savedResult) {
    save = recordResult(save, race);
    persist();
    savedResult = true;
  }
  if (lastPhase !== race.phase || lastPaused !== race.paused) {
    renderOverlay();
    lastPhase = race.phase;
    lastPaused = race.paused;
  }
  renderer.draw(race);
  el("stage-label").textContent =
    `0${race.stage + 1} / ${race.track.name.toUpperCase()}`;
  el("place").textContent = String(race.place);
  el("speed").textContent = String(Math.round(race.speed * 2.23694)).padStart(
    3,
    "0",
  );
  el("clock").textContent = formatTime(race.time);
  el("distance").textContent =
    `${(race.distance / 1000).toFixed(2)} / ${(race.track.length / 1000).toFixed(2)} KM`;
  el("progress").style.width = `${(race.distance / race.track.length) * 100}%`;
  for (const name of ["stamina", "condition"] as const) {
    el(name).style.width = `${race[name]}%`;
    el(name).style.background = race[name] < 35 ? "#ed775d" : "#9fceb6";
    el(name + "-value").textContent = String(Math.ceil(race[name]));
  }
  const target = race.nearest;
  el("target-name").textContent = target
    ? target.name.toUpperCase()
    : "CLEAR ROAD";
  el("target-value").textContent = target
    ? String(Math.ceil(target.stamina))
    : "—";
  el("target").style.width = `${target?.stamina ?? 0}%`;
  el("status").textContent =
    race.phase === "returning"
      ? "Returning to bike · brake to wait"
      : target &&
          Math.abs(target.x - race.x) < 0.5 &&
          Math.abs(target.distance - race.distance) < 9
        ? "IN REACH · J punch / K kick"
        : "Finish in the top three to qualify.";
  el("nitro").innerHTML =
    `${"● ".repeat(race.nitroCharges)}${"○ ".repeat(3 - race.nitroCharges)}<small>${race.boost > 0 ? "BOOSTING" : "NITRO / SHIFT"}</small>`;
  el("pause").textContent = race.paused ? "Resume (P)" : "Pause (P)";
  if (audio && engine && gain) {
    engine.frequency.setTargetAtTime(
      35 + race.speed * 2.5,
      audio.currentTime,
      0.08,
    );
    gain.gain.setTargetAtTime(
      sound && !race.paused && race.phase === "racing" ? 0.018 : 0,
      audio.currentTime,
      0.1,
    );
  }
  requestAnimationFrame(frame);
}
renderOverlay();
requestAnimationFrame(frame);
