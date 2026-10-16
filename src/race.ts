export interface Input {
  throttle: boolean;
  brake: boolean;
  steer: number;
  punch: boolean;
  kick: boolean;
  nitro: boolean;
}
export const idleInput: Input = {
  throttle: false,
  brake: false,
  steer: 0,
  punch: false,
  kick: false,
  nitro: false,
};
export const stages = [
  {
    name: "Ember Basin",
    length: 3200,
    subtitle: "The old salt road",
    sky: "#9ed4cf",
    ground: "#b76f4e",
  },
  {
    name: "Copper Divide",
    length: 3800,
    subtitle: "Climb into the furnace",
    sky: "#b3bdce",
    ground: "#ac614e",
  },
  {
    name: "Last Light Pass",
    length: 4400,
    subtitle: "One road. No second chances.",
    sky: "#9ca6c2",
    ground: "#9c655b",
  },
];
export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
export function roadCenter(z: number, stage = 0) {
  return (65 + stage * 8) * Math.sin(z / 280) + 40 * Math.sin(z / 510);
}
export function roadTangent(z: number, stage = 0) {
  return (
    ((65 + stage * 8) / 280) * Math.cos(z / 280) +
    (40 / 510) * Math.cos(z / 510)
  );
}
export function curvature(z: number, stage = 0) {
  return (
    (-(65 + stage * 8) / (280 * 280)) * Math.sin(z / 280) -
    (40 / (510 * 510)) * Math.sin(z / 510)
  );
}
export function elevation(z: number, stage = 0) {
  return (9 + stage * 2) * Math.sin(z / 190) + 5 * Math.sin(z / 370);
}
export interface Rider {
  id: number;
  name: string;
  color: string;
  distance: number;
  x: number;
  speed: number;
  stamina: number;
  down: number;
  attack: number;
  finishTime: number | null;
}
export interface Car {
  id: number;
  distance: number;
  x: number;
  speed: number;
  color: string;
}
export type Phase =
  | "grid"
  | "countdown"
  | "racing"
  | "crashed"
  | "returning"
  | "finished"
  | "wrecked";
const names = ["Flint", "Sable", "Vex", "Mica", "Rook", "Sol", "Ash"];
const colors = [
  "#fbbe59",
  "#a3bfee",
  "#ec7693",
  "#60ceb0",
  "#e5dbc3",
  "#df8550",
  "#a699cb",
];
export class Race {
  stage: number;
  phase: Phase = "grid";
  paused = false;
  distance = 0;
  x = 0;
  speed = 0;
  time = 0;
  countdown = 3;
  stamina = 100;
  condition = 100;
  nitroCharges = 3;
  boost = 0;
  attackTimer = 0;
  attackSide = 1;
  attackKind = "punch";
  invulnerable = 0;
  recovery = 0;
  bikeX = 0;
  bikeDistance = 0;
  cooldown = 0;
  message = "";
  messageTime = 0;
  finishPlace = 0;
  finishTime = 0;
  hits = 0;
  crashes = 0;
  trafficHits = 0;
  rivals: Rider[];
  cars: Car[];
  private nitroHeld = false;
  constructor(stage: number) {
    this.stage = clamp(Math.floor(stage), 0, 2);
    this.rivals = names.map((name, id) => ({
      id,
      name,
      color: colors[id],
      distance: 14 + id * 17,
      x: id % 2 === 0 ? -0.38 : 0.38,
      speed: 39 + id * 1.55 + this.stage * 1.5,
      stamina: 100,
      down: 0,
      attack: 1 + id * 0.32,
      finishTime: null,
    }));
    this.cars = Array.from({ length: 15 + this.stage * 3 }, (_, id) => ({
      id,
      distance: 220 + id * 270,
      x: id % 3 === 0 ? -0.55 : 0.55,
      speed: id % 3 === 0 ? -19 : 18,
      color: ["#e8d4ac", "#607d89", "#ba5f55"][id % 3],
    }));
  }
  get track() {
    return stages[this.stage];
  }
  get place() {
    return (
      this.finishPlace ||
      1 +
        this.rivals.filter(
          (r) => r.distance > this.distance || r.finishTime !== null,
        ).length
    );
  }
  get nearest() {
    return this.rivals
      .filter((r) => r.down <= 0 && Math.abs(r.distance - this.distance) < 18)
      .sort(
        (a, b) =>
          Math.abs(a.distance - this.distance) -
          Math.abs(b.distance - this.distance),
      )[0];
  }
  start() {
    if (this.phase === "grid") this.phase = "countdown";
  }
  say(message: string) {
    this.message = message;
    this.messageTime = 2.2;
  }
  crash(reason: string) {
    if (this.invulnerable > 0 || !["racing", "returning"].includes(this.phase))
      return;
    this.crashes++;
    this.condition = clamp(this.condition - 22, 0, 100);
    this.speed = 0;
    this.bikeX = clamp(this.x, -0.8, 0.8);
    this.bikeDistance = Math.min(this.track.length, this.distance + 12);
    this.recovery = 1.25;
    this.phase = this.condition <= 0 ? "wrecked" : "crashed";
    this.boost = 0;
    this.say(reason);
  }
  update(dt: number, input: Input) {
    if (
      this.paused ||
      dt <= 0 ||
      ["grid", "finished", "wrecked"].includes(this.phase)
    )
      return;
    // Bounded steps prevent collision tunneling, including callers outside requestAnimationFrame.
    let remaining = Math.min(dt, 0.25);
    while (remaining > 1e-8) {
      const step = Math.min(remaining, 1 / 120);
      this.step(step, input);
      remaining -= step;
    }
  }
  private step(dt: number, input: Input) {
    if (["finished", "wrecked"].includes(this.phase)) return;
    if (this.phase === "countdown") {
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.phase = "racing";
        this.say("GO · Find a gap. Hold the throttle.");
      }
      return;
    }
    this.time += dt;
    this.messageTime = Math.max(0, this.messageTime - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.boost = Math.max(0, this.boost - dt);
    for (const car of this.cars) {
      car.distance += car.speed * dt;
      if (car.distance < this.distance - 80)
        car.distance = this.distance + 700 + car.id * 23;
    }
    for (const r of this.rivals) {
      if (r.finishTime !== null) continue;
      r.attack = Math.max(0, r.attack - dt);
      if (r.down > 0) {
        r.down -= dt;
        if (r.down <= 0) r.stamina = 65;
        continue;
      }
      r.distance += r.speed * dt;
      // Personalities weave independently; aggressive riders seek a nearby player.
      const close = Math.abs(r.distance - this.distance) < 10;
      const target =
        close && r.id % 3 === 0
          ? this.x + (r.x > this.x ? 0.23 : -0.23)
          : Math.sin(r.distance / 180 + r.id) * 0.58;
      r.x += clamp(target - r.x, -dt * 0.28, dt * 0.28);
      r.stamina = Math.min(100, r.stamina + dt * 1.2);
      if (
        close &&
        Math.abs(r.x - this.x) < 0.36 &&
        r.attack <= 0 &&
        this.phase === "racing" &&
        this.invulnerable <= 0
      ) {
        this.stamina -= 18;
        this.attackSide = r.x > this.x ? 1 : -1;
        r.attack = 1.7 + r.id * 0.12;
        this.say(r.name + " landed a hit");
        if (this.stamina <= 0) this.crash("Knocked off · stamina exhausted");
      }
      if (r.distance >= this.track.length) {
        r.finishTime = this.time - (r.distance - this.track.length) / r.speed;
        r.distance = this.track.length;
      }
    }
    if (this.phase === "crashed") {
      this.recovery -= dt;
      if (this.recovery <= 0) {
        this.phase = "returning";
        this.say("Back to the bike · brake to wait");
      }
      return;
    }
    if (this.phase === "returning") {
      this.x = clamp(this.x + input.steer * dt * 0.65, -1.6, 1.6);
      if (!input.brake) {
        this.distance = Math.min(this.bikeDistance, this.distance + 7 * dt);
        this.x += (this.bikeX - this.x) * dt * 1.8;
      }
      if (
        this.distance >= this.bikeDistance - 0.1 &&
        Math.abs(this.x - this.bikeX) < 0.15
      ) {
        this.phase = "racing";
        this.stamina = 80;
        this.invulnerable = 2.5;
        this.say("Remounted · get back in the race");
        if (this.bikeDistance >= this.track.length) this.finishAt(this.time);
      }
      return;
    }
    if (this.phase !== "racing") return;
    if (
      input.nitro &&
      !this.nitroHeld &&
      this.nitroCharges > 0 &&
      this.speed > 15 &&
      this.boost <= 0
    ) {
      this.nitroCharges--;
      this.boost = 2.2;
      this.say("NITRO · Hold your line");
    }
    this.nitroHeld = input.nitro;
    const top = this.boost > 0 ? 76 : Math.max(60, this.speed);
    this.speed = clamp(
      this.speed + ((input.throttle ? 13 : -5) - (input.brake ? 38 : 0)) * dt,
      0,
      top,
    );
    if (this.speed > 60 && this.boost <= 0)
      this.speed = Math.max(60, this.speed - 12 * dt);
    this.x +=
      input.steer * (0.45 + (0.6 * this.speed) / 60) * dt -
      curvature(this.distance, this.stage) *
        this.speed *
        this.speed *
        0.16 *
        dt;
    this.x = clamp(this.x, -1.7, 1.7);
    if (Math.abs(this.x) > 1) {
      this.speed = Math.max(0, this.speed - 24 * dt);
      if (Math.abs(this.x) > 1.5 && this.speed > 20)
        this.crash("Lost it on the shoulder");
    }
    this.stamina = Math.min(100, this.stamina + dt * 1.8);
    if ((input.punch || input.kick) && this.cooldown <= 0) {
      this.cooldown = input.kick ? 0.7 : 0.43;
      this.attackTimer = 0.28;
      this.attackKind = input.kick ? "kick" : "punch";
      const target = this.nearest;
      if (target) {
        this.attackSide = target.x > this.x ? 1 : -1;
        if (
          Math.abs(target.distance - this.distance) < 9 &&
          Math.abs(target.x - this.x) < 0.5
        ) {
          this.hits++;
          if (input.kick) {
            target.x += this.attackSide * 0.34;
            target.distance -= 4;
            this.say("Kick · made some room");
          } else {
            target.stamina -= 34;
            this.say("Hit · " + target.name);
          }
          if (target.stamina <= 0 || Math.abs(target.x) > 1.05) {
            target.down = 4;
            this.say(target.name + " is down");
          }
        } else this.say("Out of reach · pull alongside");
      } else this.say("No rider in reach");
    }
    this.distance += this.speed * dt;
    if (this.invulnerable <= 0) {
      for (const car of this.cars) {
        if (
          Math.abs(car.distance - this.distance) < 4 &&
          Math.abs(car.x - this.x) < 0.24 &&
          Math.abs(this.speed - car.speed) > 8
        ) {
          this.trafficHits++;
          this.crash("Traffic collision · rider down");
          break;
        }
      }
      for (const r of this.rivals) {
        if (
          r.down <= 0 &&
          Math.abs(r.distance - this.distance) < 2 &&
          Math.abs(r.x - this.x) < 0.11 &&
          this.speed > 20
        ) {
          this.speed *= 0.88;
          this.x += this.x > r.x ? 0.065 : -0.065;
        }
      }
    }
    if (this.phase === "racing" && this.distance >= this.track.length) {
      this.finishAt(
        this.time -
          (this.distance - this.track.length) / Math.max(1, this.speed),
      );
    }
  }
  private finishAt(time: number) {
    this.finishTime = time;
    this.finishPlace =
      1 +
      this.rivals.filter((r) => r.finishTime !== null && r.finishTime <= time)
        .length;
    this.distance = this.track.length;
    this.phase = "finished";
    this.speed = 0;
  }
}
export interface Save {
  version: 1;
  unlocked: number;
  medals: boolean[];
  best: (number | null)[];
}
export const freshSave = (): Save => ({
  version: 1,
  unlocked: 0,
  medals: [false, false, false],
  best: [null, null, null],
});
export function parseSave(raw: string | null): Save {
  try {
    const s = JSON.parse(raw || "null");
    if (s?.version !== 1) return freshSave();
    return {
      version: 1,
      unlocked: Number.isFinite(s.unlocked)
        ? clamp(Math.floor(s.unlocked), 0, 2)
        : 0,
      medals: [0, 1, 2].map((i) => s.medals?.[i] === true),
      best: [0, 1, 2].map((i) =>
        typeof s.best?.[i] === "number" &&
        Number.isFinite(s.best[i]) &&
        s.best[i] > 0
          ? s.best[i]
          : null,
      ),
    };
  } catch {
    return freshSave();
  }
}
export function recordResult(save: Save, race: Race): Save {
  if (race.phase !== "finished") return save;
  const next: Save = {
    ...save,
    medals: [...save.medals],
    best: [...save.best],
  };
  if (race.finishPlace <= 3) {
    next.medals[race.stage] = true;
    next.unlocked = Math.max(next.unlocked, Math.min(2, race.stage + 1));
  }
  next.best[race.stage] = Math.min(
    next.best[race.stage] ?? Infinity,
    race.finishTime,
  );
  return next;
}
