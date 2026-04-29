/**
 * Antigravity Game Library v1.0
 * A lightweight helper for vector-based canvas games.
 */

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const m = this.mag();
        if (m > 0) this.mult(1 / m);
        return this;
    }

    limit(max) {
        const mSq = this.x * this.x + this.y * this.y;
        if (mSq > max * max) {
            this.normalize();
            this.mult(max);
        }
        return this;
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }

    static dist(v1, v2) {
        return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
    }
}

class AntigravityEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.mouse = new Vector();
        this.keys = {};
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawCircle(pos, radius, color, glow = 0) {
        this.ctx.beginPath();
        if (glow > 0) {
            this.ctx.shadowBlur = glow;
            this.ctx.shadowColor = color;
        }
        this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.shadowBlur = 0; // Reset shadow
    }

    drawLine(pos1, pos2, color, lineWidth = 2) {
        this.ctx.beginPath();
        this.ctx.moveTo(pos1.x, pos1.y);
        this.ctx.lineTo(pos2.x, pos2.y);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
        this.ctx.closePath();
    }

    drawRect(pos, width, height, color, glow = 0) {
        this.ctx.beginPath();
        if (glow > 0) {
            this.ctx.shadowBlur = glow;
            this.ctx.shadowColor = color;
        }
        this.ctx.rect(pos.x, pos.y, width, height);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.shadowBlur = 0; // Reset shadow
    }
}
