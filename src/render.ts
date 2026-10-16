import { Race, elevation, roadCenter, roadTangent } from "./race";
const W = 1200,
  H = 720;
interface Point {
  x: number;
  y: number;
  w: number;
  s: number;
}
export class Renderer {
  ctx: CanvasRenderingContext2D;
  constructor(public canvas: HTMLCanvasElement) {
    canvas.width = W;
    canvas.height = H;
    this.ctx = canvas.getContext("2d")!;
  }
  private polygon(color: string, points: number[]) {
    const c = this.ctx;
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2)
      c.lineTo(points[i], points[i + 1]);
    c.closePath();
    c.fill();
  }
  private project(r: Race, z: number, x = 0): Point {
    const d = Math.max(1, z - r.distance + 15),
      s = 1.15 / d;
    const bend =
      roadCenter(z, r.stage) -
      roadCenter(r.distance, r.stage) -
      roadTangent(r.distance, r.stage) * (z - r.distance);
    return {
      x: W / 2 + ((bend + x * 9 - r.x * 9 * 0.72) * s * W) / 2,
      y:
        H * 0.4 -
        (elevation(z, r.stage) - elevation(r.distance, r.stage) - 7) *
          s *
          H *
          0.8,
      w: (9 * s * W) / 2,
      s,
    };
  }
  draw(r: Race) {
    const c = this.ctx;
    const sky = c.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, r.track.sky);
    sky.addColorStop(1, "#f5c493");
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);
    c.fillStyle = "#fbe2ad";
    c.beginPath();
    c.arc(
      910 - roadTangent(r.distance, r.stage) * 120,
      160,
      59,
      0,
      Math.PI * 2,
    );
    c.fill();
    for (let layer = 0; layer < 3; layer++) {
      const points = [0, H * 0.52];
      for (let x = 0; x <= W + 40; x += 40) {
        const t = x + roadTangent(r.distance, r.stage) * (80 + layer * 35);
        points.push(
          x,
          260 +
            layer * 32 -
            Math.abs(Math.sin(t / 155 + layer) * 48 + Math.sin(t / 69) * 19),
        );
      }
      points.push(W, H * 0.58);
      this.polygon(["#7a8f9b", "#657d88", "#496875"][layer], points);
    }
    c.fillStyle = r.track.ground;
    c.fillRect(0, H * 0.42, W, H);
    const segments: { a: Point; b: Point; z: number; clip: number }[] = [];
    let clip = H;
    const base = Math.floor(r.distance / 8) * 8 - 8;
    for (let i = 0; i < 150; i++) {
      const z = base + i * 8;
      if (z < r.distance - 14) continue;
      const a = this.project(r, z),
        b = this.project(r, z + 8);
      segments.push({ a, b, z, clip });
      clip = Math.min(clip, a.y, b.y);
    }
    for (let i = segments.length - 1; i >= 0; i--) {
      const { a, b, z, clip: edge } = segments[i];
      if (b.y >= a.y || b.y > edge) continue;
      c.save();
      c.beginPath();
      c.rect(0, 0, W, edge);
      c.clip();
      const stripe = Math.floor(z / 24) % 2 === 0;
      c.fillStyle = stripe ? r.track.ground : "#b77959";
      c.fillRect(0, b.y, W, a.y - b.y + 1);
      this.polygon(stripe ? "#e3baa0" : "#f1d5b2", [
        a.x - a.w * 1.1,
        a.y,
        a.x + a.w * 1.1,
        a.y,
        b.x + b.w * 1.1,
        b.y,
        b.x - b.w * 1.1,
        b.y,
      ]);
      this.polygon(stripe ? "#384950" : "#3b4d54", [
        a.x - a.w,
        a.y,
        a.x + a.w,
        a.y,
        b.x + b.w,
        b.y,
        b.x - b.w,
        b.y,
      ]);
      for (const side of [-1, 1]) {
        this.polygon("#e8ddbd", [
          a.x + a.w * (side * 0.94 - 0.012),
          a.y,
          a.x + a.w * (side * 0.94 + 0.012),
          a.y,
          b.x + b.w * (side * 0.94 + 0.012),
          b.y,
          b.x + b.w * (side * 0.94 - 0.012),
          b.y,
        ]);
        this.polygon("#e2b461", [
          a.x + a.w * (side * 0.025 - 0.008),
          a.y,
          a.x + a.w * (side * 0.025 + 0.008),
          a.y,
          b.x + b.w * (side * 0.025 + 0.008),
          b.y,
          b.x + b.w * (side * 0.025 - 0.008),
          b.y,
        ]);
      }
      if (Math.abs(z - r.track.length) < 8) {
        for (let n = 0; n < 16; n++) {
          this.polygon(n % 2 ? "#e8e4cd" : "#172e37", [
            a.x - a.w + (n * a.w) / 8,
            a.y,
            a.x - a.w + ((n + 1) * a.w) / 8,
            a.y,
            b.x - b.w + ((n + 1) * b.w) / 8,
            b.y,
            b.x - b.w + (n * b.w) / 8,
            b.y,
          ]);
        }
      }
      c.restore();
    }
    const objects: {
      z: number;
      x: number;
      kind: string;
      color: string;
      id: number;
    }[] = [];
    for (
      let z = Math.floor(r.distance / 65) * 65;
      z < r.distance + 850;
      z += 65
    ) {
      objects.push(
        {
          z,
          x: 1.4 + Math.abs(Math.sin(z)) * 1.3,
          kind: "cactus",
          color: "#385b50",
          id: z,
        },
        {
          z: z + 30,
          x: -1.5 - Math.abs(Math.cos(z)),
          kind: "rock",
          color: "#875b50",
          id: z,
        },
      );
    }
    r.cars.forEach((v) =>
      objects.push({
        z: v.distance,
        x: v.x,
        kind: "car",
        color: v.color,
        id: v.id,
      }),
    );
    r.rivals.forEach((v) =>
      objects.push({
        z: v.distance,
        x: v.x,
        kind: v.down > 0 ? "fallen" : "rider",
        color: v.color,
        id: v.id,
      }),
    );
    if (["crashed", "returning"].includes(r.phase))
      objects.push({
        z: r.bikeDistance,
        x: r.bikeX,
        kind: "fallen",
        color: "#f58454",
        id: -1,
      });
    objects.sort((a, b) => b.z - a.z);
    for (const o of objects) {
      const d = o.z - r.distance;
      if (d < -4 || d > 850) continue;
      const p = this.project(r, o.z, o.x),
        segment = segments.find((s) => o.z >= s.z && o.z < s.z + 8);
      if (p.y > (segment?.clip ?? H) + 8) continue;
      c.save();
      c.beginPath();
      c.rect(0, 0, W, segment?.clip ?? H);
      c.clip();
      const scale = p.s * 22;
      if (o.kind === "rider") {
        const rider = r.rivals[o.id];
        this.bike(
          p.x,
          p.y,
          scale,
          o.color,
          Math.sin(o.z / 150) * 0.12,
          rider.attack < 0.3 ? 1 : 0,
          "punch",
        );
        if (d < 70) {
          c.font = `bold ${Math.max(11, scale * 6)}px monospace`;
          c.textAlign = "center";
          c.fillStyle = "#fff0cf";
          c.fillText(rider.name.toUpperCase(), p.x, p.y - scale * 78);
        }
      }
      if (o.kind === "car")
        this.car(p.x, p.y, scale, o.color, r.cars[o.id].speed < 0);
      if (o.kind === "fallen") {
        c.save();
        c.translate(p.x, p.y - 10 * scale);
        c.rotate(1.35);
        this.bike(0, 0, scale * 0.8, o.color, 0, 0, "");
        c.restore();
      }
      if (o.kind === "cactus") {
        c.strokeStyle = o.color;
        c.lineWidth = scale * 6;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(p.x, p.y - 60 * scale);
        c.moveTo(p.x, p.y - 22 * scale);
        c.lineTo(p.x - 16 * scale, p.y - 22 * scale);
        c.lineTo(p.x - 16 * scale, p.y - 42 * scale);
        c.moveTo(p.x, p.y - 36 * scale);
        c.lineTo(p.x + 14 * scale, p.y - 36 * scale);
        c.lineTo(p.x + 14 * scale, p.y - 52 * scale);
        c.stroke();
      }
      if (o.kind === "rock")
        this.polygon(o.color, [
          p.x - 25 * scale,
          p.y,
          p.x - 16 * scale,
          p.y - 24 * scale,
          p.x + 8 * scale,
          p.y - 30 * scale,
          p.x + 27 * scale,
          p.y,
        ]);
      c.restore();
    }
    const px = W / 2 + r.x * 75,
      py = H * 0.85;
    if (["crashed", "returning"].includes(r.phase)) {
      c.save();
      const slide = r.phase === "crashed" ? 1 - r.recovery / 1.25 : 0;
      c.translate(px + slide * 55, py - slide * 32);
      if (r.phase === "crashed") c.rotate(Math.sin(r.recovery * 9) * 1.5);
      const stride = r.phase === "returning" ? Math.sin(r.time * 18) * 14 : 0;
      c.strokeStyle = "#172d37";
      c.lineWidth = 12;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(-14 + stride, 0);
      c.lineTo(0, -30);
      c.lineTo(15 - stride, 0);
      c.moveTo(-23, -39);
      c.lineTo(0, -54);
      c.lineTo(24, -38);
      c.stroke();
      c.fillStyle = "#ec8657";
      c.fillRect(-16, -62, 32, 35);
      c.fillStyle = "#e9ddc2";
      c.beginPath();
      c.arc(0, -74, 13, 0, 7);
      c.fill();
      c.restore();
    } else if (r.invulnerable <= 0 || Math.floor(r.time * 10) % 2 === 0) {
      if (r.boost > 0) {
        this.polygon("#89e7d2", [
          px - 20,
          py - 8,
          px,
          py + 44 + Math.sin(r.time * 60) * 10,
          px + 20,
          py - 8,
        ]);
      }
      this.bike(
        px,
        py,
        1.65,
        "#ef8354",
        r.x * 0.04 + (r.speed > 0 ? Math.sin(r.time * 12) * 0.008 : 0),
        r.attackTimer > 0 ? r.attackSide : 0,
        r.attackKind,
      );
    }
    if (r.phase === "countdown") {
      this.label(
        String(Math.max(1, Math.ceil(r.countdown))),
        W / 2,
        H * 0.44,
        100,
        "#fff0d3",
      );
    }
    if (r.messageTime > 0 && r.phase !== "grid") {
      this.label(r.message, W / 2, H * 0.15, 19, "#fff0d3");
    }
    if (r.invulnerable > 0) {
      this.label("RECOVERY SHIELD", W / 2, H * 0.89, 12, "#c6eedc");
    }
    // A subtle vignette keeps the sunlit scene readable behind instruments.
    const shade = c.createLinearGradient(0, H * 0.7, 0, H);
    shade.addColorStop(0, "#10273100");
    shade.addColorStop(1, "#10273188");
    c.fillStyle = shade;
    c.fillRect(0, H * 0.7, W, H * 0.3);
  }
  private label(
    text: string,
    x: number,
    y: number,
    size: number,
    color: string,
  ) {
    const c = this.ctx;
    c.font = `bold ${size}px monospace`;
    c.textAlign = "center";
    c.fillStyle = "#172d37aa";
    c.fillRect(
      x - c.measureText(text).width / 2 - 16,
      y - size - 8,
      c.measureText(text).width + 32,
      size + 21,
    );
    c.fillStyle = color;
    c.fillText(text, x, y);
  }
  private bike(
    x: number,
    y: number,
    s: number,
    color: string,
    lean: number,
    attack: number,
    kind: string,
  ) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.rotate(lean);
    c.fillStyle = "#162b3370";
    c.beginPath();
    c.ellipse(0, 0, 24, 6, 0, 0, 7);
    c.fill();
    c.fillStyle = "#142631";
    c.fillRect(-8, -37, 16, 39);
    c.fillStyle = "#75858a";
    c.fillRect(-3, -31, 6, 30);
    c.strokeStyle = "#bfc2b6";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(-20, -16);
    c.lineTo(-25, -38);
    c.moveTo(20, -16);
    c.lineTo(25, -38);
    c.stroke();
    this.polygon(
      color,
      [-18, -19, -22, -42, -14, -62, 14, -62, 22, -42, 18, -19],
    );
    c.fillStyle = "#f8d4a0";
    c.fillRect(-11, -29, 22, 9);
    c.fillStyle = "#ff5549";
    c.fillRect(-12, -37, 24, 6);
    c.fillStyle = "#1b3039";
    c.fillRect(-13, -64, 26, 22);
    c.strokeStyle = "#182f39";
    c.lineWidth = 8;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(-16, -19);
    c.lineTo(-19, -46);
    c.lineTo(-9, -55);
    c.moveTo(16, -19);
    c.lineTo(19, -46);
    c.lineTo(9, -55);
    c.stroke();
    c.fillStyle = color;
    this.polygon(
      color,
      [-17, -50, -20, -72, -11, -82, 11, -82, 20, -72, 17, -50],
    );
    c.strokeStyle = color;
    c.lineWidth = 9;
    c.beginPath();
    c.moveTo(-14, -73);
    c.lineTo(-24, -58);
    c.moveTo(14, -73);
    c.lineTo(24, -58);
    c.stroke();
    c.strokeStyle = "#e0c6a1";
    c.lineWidth = 7;
    c.beginPath();
    if (attack) {
      const yy = kind === "kick" ? -35 : -69;
      c.moveTo(attack * 12, yy);
      c.lineTo(attack * 44, yy - 3);
      c.lineTo(attack * 54, yy + 5);
    }
    c.stroke();
    c.fillStyle = "#e9dbc1";
    c.beginPath();
    c.ellipse(0, -86, 13, 14, 0, 0, 7);
    c.fill();
    c.fillStyle = "#18333b";
    c.fillRect(-11, -89, 22, 5);
    c.fillStyle = "#ef8354";
    c.fillRect(-9, -97, 18, 3);
    c.fillStyle = "#e7d1a3";
    c.font = "bold 10px monospace";
    c.textAlign = "center";
    c.fillText("07", 0, -61);
    c.restore();
  }
  private car(x: number, y: number, s: number, color: string, front: boolean) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.fillStyle = "#142832";
    c.fillRect(-31, -23, 13, 25);
    c.fillRect(18, -23, 13, 25);
    this.polygon(
      color,
      [-35, -5, -36, -36, -25, -65, 25, -65, 36, -36, 35, -5],
    );
    this.polygon("#233e4a", [-26, -38, -19, -58, 19, -58, 26, -38]);
    c.fillStyle = color;
    c.fillRect(-29, -34, 58, 14);
    c.fillStyle = front ? "#fbe6ac" : "#ff6f59";
    c.fillRect(-30, -20, 13, 7);
    c.fillRect(17, -20, 13, 7);
    c.fillStyle = "#bcc9c4";
    c.fillRect(-33, -9, 66, 4);
    c.fillStyle = "#ede4c9";
    c.fillRect(-8, -15, 16, 6);
    c.restore();
  }
}
