class UI {
    constructor() {
        this.generationSpan = document.getElementById('generation');
        this.bestFitnessSpan = document.getElementById('bestFitness');
        this.avgFitnessSpan = document.getElementById('avgFitness');
        this.survivalRateSpan = document.getElementById('survivalRate');
        this.brainCanvas = document.getElementById('brainCanvas');
        this.brainCtx = this.brainCanvas.getContext('2d');
    }

    update(generation, bestFitness, avgFitness, survivalRate) {
        this.generationSpan.innerText = generation;
        this.bestFitnessSpan.innerText = isNaN(bestFitness) ? "0.0" : bestFitness.toFixed(2);
        this.avgFitnessSpan.innerText = isNaN(avgFitness) ? "0.0" : avgFitness.toFixed(2);
        this.survivalRateSpan.innerText = survivalRate + '%';
    }

    drawBrain(brain) {
        // Render network on brainCanvas
        this.brainCtx.clearRect(0, 0, this.brainCanvas.width, this.brainCanvas.height);
        
        let nodeRadius = 6;
        let layerDist = this.brainCanvas.width / 3;
        
        // Define node positions
        let layers = [
            { nodes: brain.input_nodes, x: layerDist * 0.5 },
            { nodes: brain.hidden_nodes, x: layerDist * 1.5 },
            { nodes: brain.output_nodes, x: layerDist * 2.5 }
        ];

        let positions = [[], [], []];

        layers.forEach((layer, lIndex) => {
            let spacing = this.brainCanvas.height / (layer.nodes + 1);
            for (let i = 0; i < layer.nodes; i++) {
                positions[lIndex].push({
                    x: layer.x,
                    y: spacing * (i + 1)
                });
            }
        });

        // Draw connections (Input -> Hidden)
        for (let i = 0; i < brain.hidden_nodes; i++) {
            for (let j = 0; j < brain.input_nodes; j++) {
                let weight = brain.weights_ih.data[i][j];
                this.drawConnection(positions[0][j], positions[1][i], weight);
            }
        }

        // Draw connections (Hidden -> Output)
        for (let i = 0; i < brain.output_nodes; i++) {
            for (let j = 0; j < brain.hidden_nodes; j++) {
                let weight = brain.weights_ho.data[i][j];
                this.drawConnection(positions[1][j], positions[2][i], weight);
            }
        }

        // Draw nodes
        positions.forEach((layerPos, index) => {
            layerPos.forEach(pos => {
                this.brainCtx.beginPath();
                this.brainCtx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
                this.brainCtx.fillStyle = '#1e293b';
                this.brainCtx.fill();
                this.brainCtx.lineWidth = 1.5;
                this.brainCtx.strokeStyle = index === 2 ? '#fb7185' : '#22d3ee';
                this.brainCtx.stroke();
            });
        });

        // Labels
        this.brainCtx.fillStyle = '#94a3b8';
        this.brainCtx.font = '10px Outfit';
        this.brainCtx.fillText('IN', positions[0][0].x - 8, 12);
        this.brainCtx.fillText('HIDDEN', positions[1][0].x - 18, 12);
        this.brainCtx.fillText('OUT', positions[2][0].x - 10, 12);
    }

    drawConnection(posA, posB, weight) {
        this.brainCtx.beginPath();
        this.brainCtx.moveTo(posA.x, posA.y);
        this.brainCtx.lineTo(posB.x, posB.y);
        
        let thickness = Math.min(Math.abs(weight) * 1.5, 3);
        let alpha = Math.min(Math.abs(weight), 1);
        
        this.brainCtx.lineWidth = Math.max(thickness, 0.2);
        this.brainCtx.strokeStyle = weight > 0 ? `rgba(34, 211, 238, ${alpha})` : `rgba(251, 113, 133, ${alpha})`;
        this.brainCtx.stroke();
    }
}
