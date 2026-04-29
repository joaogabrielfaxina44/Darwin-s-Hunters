class GeneticAlgorithm {
    static nextGeneration(population) {
        this.calculateFitness(population);

        // Ordenar por fitness (descendente)
        population.sort((a, b) => b.fitness - a.fitness);

        let newPopulation = [];

        // Elitismo: Mantém o top 1% (pelo menos 1)
        let eliteCount = Math.max(1, Math.floor(population.length * 0.01));
        for (let i = 0; i < eliteCount; i++) {
            let elite = new Hunter();
            elite.brain = NeuralNetwork.copy(population[i].brain);
            newPopulation.push(elite);
        }

        // Preencher o resto da população
        while (newPopulation.length < population.length) {
            let parentA = this.selectParent(population);
            let parentB = this.selectParent(population);
            
            let childBrain = this.crossover(parentA.brain, parentB.brain);
            childBrain.mutate(0.05); // 5% de taxa de mutação
            
            let child = new Hunter();
            child.brain = childBrain;
            newPopulation.push(child);
        }

        return newPopulation;
    }

    static calculateFitness(population) {
        let sum = 0;
        for (let agent of population) {
            sum += agent.calculateFitness();
        }
        // Normaliza o fitness para a roleta
        for (let agent of population) {
            agent.normalizedFitness = agent.fitness / sum;
        }
    }

    static selectParent(population) {
        let index = 0;
        let r = Math.random();
        while (r > 0) {
            r -= population[index].normalizedFitness;
            index++;
        }
        index--;
        return population[index];
    }

    static crossover(brainA, brainB) {
        let child = new NeuralNetwork(brainA.input_nodes, brainA.hidden_nodes, brainA.output_nodes);
        
        // Crossover Uniforme
        let crossoverMatrix = (m1, m2) => {
            let res = new Matrix(m1.rows, m1.cols);
            for (let i = 0; i < m1.rows; i++) {
                for (let j = 0; j < m1.cols; j++) {
                    res.data[i][j] = Math.random() < 0.5 ? m1.data[i][j] : m2.data[i][j];
                }
            }
            return res;
        };

        child.weights_ih = crossoverMatrix(brainA.weights_ih, brainB.weights_ih);
        child.weights_ho = crossoverMatrix(brainA.weights_ho, brainB.weights_ho);
        child.bias_h = crossoverMatrix(brainA.bias_h, brainB.bias_h);
        child.bias_o = crossoverMatrix(brainA.bias_o, brainB.bias_o);

        return child;
    }
}
