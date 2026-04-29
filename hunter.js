class Hunter {
    constructor() {
        // Inicializa em posições aleatórias
        this.pos = new Vector(Math.random() * engine.width, Math.random() * engine.height);
        
        // Evita nascer em cima das bordas
        this.pos.x = Math.max(20, Math.min(engine.width - 20, this.pos.x));
        this.pos.y = Math.max(20, Math.min(engine.height - 20, this.pos.y));

        this.velocity = new Vector((Math.random() * 2) - 1, (Math.random() * 2) - 1);
        this.acceleration = new Vector(0, 0);
        this.radius = 12;
        this.maxSpeed = 4;
        this.maxForce = 0.5;
        
        // 6 Inputs, 6 Hidden, 2 Outputs
        this.brain = new NeuralNetwork(6, 6, 2);
        
        // Status do Agente
        this.fitness = 0;
        this.minDist = Infinity;
        this.alive = true;
        this.lifetime = 0;
        this.hitTarget = false;

        this.sensorLength = 120;
        this.sensors = [];
    }

    getSensorData(obstacles) {
        let angles = [-35, 0, 35];
        let sensorValues = [];
        this.sensors = []; 
        
        let baseAngle = Math.atan2(this.velocity.y, this.velocity.x);

        for (let offset of angles) {
            let angle = baseAngle + (offset * Math.PI / 180);
            let endPos = new Vector(
                this.pos.x + Math.cos(angle) * this.sensorLength,
                this.pos.y + Math.sin(angle) * this.sensorLength
            );

            // Raycast simples verificando N pontos na linha
            let steps = 15;
            let hit = false;
            let hitDist = this.sensorLength;
            let dx = (endPos.x - this.pos.x) / steps;
            let dy = (endPos.y - this.pos.y) / steps;

            let checkBound = (pt) => {
                if (pt.x < 0 || pt.x > engine.width || pt.y < 0 || pt.y > engine.height) return true;
                for (let obs of obstacles) {
                    if (pt.x > obs.pos.x && pt.x < obs.pos.x + obs.width &&
                        pt.y > obs.pos.y && pt.y < obs.pos.y + obs.height) {
                        return true;
                    }
                }
                return false;
            };

            for (let i = 1; i <= steps; i++) {
                let testPt = new Vector(this.pos.x + dx * i, this.pos.y + dy * i);
                if (checkBound(testPt)) {
                    hit = true;
                    hitDist = (this.sensorLength / steps) * i;
                    break;
                }
            }

            // Ponto real de impacto
            let impactPoint = new Vector(
                this.pos.x + dx * (hitDist / (this.sensorLength / steps)), 
                this.pos.y + dy * (hitDist / (this.sensorLength / steps))
            );
            this.sensors.push(impactPoint); 
            
            // Retorna o valor invertido ou normal (0 a 1). 
            // 1 significa caminho livre, próximo a 0 colisão.
            sensorValues.push(hitDist / this.sensorLength);
        }
        return sensorValues;
    }

    update(targetPos, obstacles) {
        if (!this.alive) return;

        // Verifica morte por colisão
        if (this.pos.x < 0 || this.pos.x > engine.width || this.pos.y < 0 || this.pos.y > engine.height) {
            this.alive = false;
        } else {
            for (let obs of obstacles) {
                if (this.pos.x > obs.pos.x && this.pos.x < obs.pos.x + obs.width &&
                    this.pos.y > obs.pos.y && this.pos.y < obs.pos.y + obs.height) {
                    this.alive = false;
                    break;
                }
            }
        }

        if (!this.alive) return;

        // Atualiza a menor distância
        let distToTarget = Vector.dist(this.pos, targetPos);
        if (distToTarget < this.minDist) {
            this.minDist = distToTarget;
        }

        // Verifica sucesso
        if (distToTarget < this.radius + 15) { // O Player tem raio ~15
            this.hitTarget = true;
            this.alive = false;
        }

        this.lifetime++;

        // Obter os sensores (Normalizados 0 a 1)
        let sData = this.getSensorData(obstacles);
        
        let dx = targetPos.x - this.pos.x;
        let dy = targetPos.y - this.pos.y;
        
        let normTargetX = (dx / engine.width) * 0.5 + 0.5;
        let normTargetY = (dy / engine.height) * 0.5 + 0.5;
        let normVel = this.velocity.mag() / this.maxSpeed;

        let inputs = [
            sData[0], // Esquerda
            sData[1], // Centro
            sData[2], // Direita
            normTargetX,
            normTargetY,
            normVel
        ];

        let output = this.brain.predict(inputs);

        // Output[0]: Força para frente
        // Output[1]: Torque
        let forceFrontal = output[0] * this.maxSpeed;
        let torque = (output[1] - 0.5) * this.maxForce * 2; // -maxForce a +maxForce

        let currentHeading = Math.atan2(this.velocity.y, this.velocity.x);
        let newHeading = currentHeading + torque;

        let desiredVelocity = new Vector(Math.cos(newHeading), Math.sin(newHeading)).mult(forceFrontal);
        
        let steer = Vector.sub(desiredVelocity, this.velocity);
        steer.limit(this.maxForce);
        
        this.acceleration.add(steer);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        
        // Evita que o agente pare totalmente e fique rodando no lugar
        if (this.velocity.mag() < 0.5) {
            this.velocity.x += (Math.random() > 0.5 ? 0.5 : -0.5);
            this.velocity.y += (Math.random() > 0.5 ? 0.5 : -0.5);
        }

        this.pos.add(this.velocity);
        this.acceleration.mult(0);
    }

    calculateFitness() {
        // Função de Fitness com exponenciação
        let score = Math.pow(1000 / (this.minDist + 1), 2);
        score += this.lifetime * 0.1;
        
        if (this.hitTarget) score *= 2;
        
        this.fitness = score;
        return score;
    }

    draw(drawVision) {
        if (!this.alive) return;

        if (drawVision && this.sensors.length > 0) {
            engine.drawLine(this.pos, this.sensors[0], 'rgba(0, 255, 0, 0.4)', 1);
            engine.drawLine(this.pos, this.sensors[1], 'rgba(0, 255, 0, 0.4)', 1);
            engine.drawLine(this.pos, this.sensors[2], 'rgba(0, 255, 0, 0.4)', 1);
        }

        engine.drawCircle(this.pos, this.radius, '#fb7185', 20); 
    }
}
