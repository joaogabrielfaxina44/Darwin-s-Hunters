// main.js
const engine = new AntigravityEngine('gameCanvas');

// Game State
let isGameStarted = false;

// Configurações Globais
const POP_SIZE = 50;
let population = [];
let generation = 1;
let bestGlobalFitness = 0;
let timeScale = 1;
let drawVision = true;

// Objetos
let player;
let obstacles = [];
let ui;

// Classe Player (Alvo)
class Player {
    constructor() {
        // Começa no centro
        this.pos = new Vector(engine.width / 2 + 150, engine.height / 2);
        this.radius = 15;
        this.color = '#22d3ee';
        this.speed = 0.15;
    }
    update() {
        const dx = engine.mouse.x - this.pos.x;
        const dy = engine.mouse.y - this.pos.y;
        this.pos.x += dx * this.speed;
        this.pos.y += dy * this.speed;
        
        this.pos.x = Math.max(this.radius + 300, Math.min(engine.width - this.radius, this.pos.x));
        this.pos.y = Math.max(this.radius, Math.min(engine.height - this.radius, this.pos.y));
    }
    draw() {
        engine.drawCircle(this.pos, this.radius, this.color, 20);
    }
}

// Classe Obstacle
class Obstacle {
    constructor(x, y, w, h) {
        this.pos = new Vector(x, y);
        this.width = w;
        this.height = h;
        this.color = '#334155';
    }
    draw() {
        engine.drawRect(this.pos, this.width, this.height, this.color, 5);
    }
}

function initObstacles() {
    obstacles = [
        new Obstacle(engine.width / 2 + 100, engine.height / 2 - 150, 60, 300),
        new Obstacle(400, 150, 200, 40),
        new Obstacle(engine.width - 250, engine.height - 200, 200, 40)
    ];
}

function initPopulation() {
    population = [];
    for (let i = 0; i < POP_SIZE; i++) {
        population.push(new Hunter());
    }
}

function resetRound() {
    player = new Player(); // Reseta o jogador também para ficar mais dinâmico
    for (let agent of population) {
        agent.pos = new Vector((Math.random() * engine.width/2) + 300, Math.random() * engine.height);
        agent.pos.x = Math.max(320, Math.min(engine.width - 20, agent.pos.x));
        agent.pos.y = Math.max(20, Math.min(engine.height - 20, agent.pos.y));
        agent.velocity = new Vector((Math.random() * 2) - 1, (Math.random() * 2) - 1);
        agent.alive = true;
        agent.lifetime = 0;
        agent.minDist = Infinity;
        agent.hitTarget = false;
        agent.fitness = 0;
    }
}

// Initialize setup
ui = new UI();
player = new Player();
initObstacles();

window.addEventListener('resize', initObstacles);

// Event Listeners UI
document.getElementById('startBtn').addEventListener('click', () => {
    isGameStarted = true;
    initPopulation();
    document.getElementById('startScreen').classList.add('hidden');
});

document.getElementById('speedBtn').addEventListener('click', () => {
    timeScale = timeScale === 1 ? 2 : (timeScale === 2 ? 5 : 1);
    document.getElementById('speedBtn').innerText = `${timeScale}x Speed`;
});

document.getElementById('visionBtn').addEventListener('click', () => {
    drawVision = !drawVision;
    document.getElementById('visionBtn').innerText = drawVision ? 'Vision: ON' : 'Vision: OFF';
});

// Update do Dashboard Independente do Loop Físico
setInterval(() => {
    if (!isGameStarted) return;
    
    let aliveCount = population.filter(a => a.alive).length;
    let survivalRate = ((aliveCount / POP_SIZE) * 100).toFixed(1);
    
    let currBest = 0;
    let sumFitness = 0;
    let bestAgent = null;

    for (let a of population) {
        let f = a.calculateFitness(); // Calcula parcialmente
        sumFitness += f;
        if (f > currBest) {
            currBest = f;
            bestAgent = a;
        }
    }
    
    if (currBest > bestGlobalFitness) bestGlobalFitness = currBest;
    let avgFitness = sumFitness / POP_SIZE;

    ui.update(generation, bestGlobalFitness, avgFitness, survivalRate);
    if (bestAgent) ui.drawBrain(bestAgent.brain);
}, 200);

// Loop Principal
function loop() {
    if (isGameStarted) {
        for (let t = 0; t < timeScale; t++) {
            player.update();
            
            let allDead = true;
            for (let agent of population) {
                if (agent.alive) {
                    agent.update(player.pos, obstacles);
                    allDead = false;
                }
            }

            // Se todos morreram, encerra geração
            if (allDead) {
                population = GeneticAlgorithm.nextGeneration(population);
                generation++;
                resetRound();
                break; // Sai do for para desenhar o primeiro frame
            }
        }
        
        // Render
        engine.clear();
        obstacles.forEach(o => o.draw());
        for (let agent of population) {
            agent.draw(drawVision);
        }
        player.draw();
    }
    requestAnimationFrame(loop);
}

loop();
