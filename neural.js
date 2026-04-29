class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }

    static fromArray(arr) {
        return new Matrix(arr.length, 1).map((e, i) => arr[i]);
    }

    toArray() {
        let arr = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                arr.push(this.data[i][j]);
            }
        }
        return arr;
    }

    randomize() {
        return this.map(e => Math.random() * 2 - 1);
    }

    add(n) {
        if (n instanceof Matrix) {
            return this.map((e, i, j) => e + n.data[i][j]);
        } else {
            return this.map(e => e + n);
        }
    }

    static transpose(matrix) {
        return new Matrix(matrix.cols, matrix.rows)
            .map((e, i, j) => matrix.data[j][i]);
    }

    static multiply(a, b) {
        if (a.cols !== b.rows) {
            console.error("Columns of A must match rows of B.");
            return undefined;
        }
        return new Matrix(a.rows, b.cols)
            .map((e, i, j) => {
                let sum = 0;
                for (let k = 0; k < a.cols; k++) {
                    sum += a.data[i][k] * b.data[k][j];
                }
                return sum;
            });
    }

    multiply(n) {
        if (n instanceof Matrix) {
            return this.map((e, i, j) => e * n.data[i][j]);
        } else {
            return this.map(e => e * n);
        }
    }

    map(func) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let val = this.data[i][j];
                this.data[i][j] = func(val, i, j);
            }
        }
        return this;
    }

    static map(matrix, func) {
        return new Matrix(matrix.rows, matrix.cols)
            .map((e, i, j) => func(matrix.data[i][j], i, j));
    }

    copy() {
        let m = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                m.data[i][j] = this.data[i][j];
            }
        }
        return m;
    }
}

class NeuralNetwork {
    constructor(input_nodes, hidden_nodes, output_nodes) {
        this.input_nodes = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;

        this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes);
        this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes);
        this.weights_ih.randomize();
        this.weights_ho.randomize();

        this.bias_h = new Matrix(this.hidden_nodes, 1);
        this.bias_o = new Matrix(this.output_nodes, 1);
        this.bias_h.randomize();
        this.bias_o.randomize();
    }

    predict(input_array) {
        let inputs = Matrix.fromArray(input_array);
        
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        hidden.map(this.sigmoid);
        
        let output = Matrix.multiply(this.weights_ho, hidden);
        output.add(this.bias_o);
        output.map(this.sigmoid);
        
        return output.toArray();
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    static copy(nn) {
        let n = new NeuralNetwork(nn.input_nodes, nn.hidden_nodes, nn.output_nodes);
        n.weights_ih = nn.weights_ih.copy();
        n.weights_ho = nn.weights_ho.copy();
        n.bias_h = nn.bias_h.copy();
        n.bias_o = nn.bias_o.copy();
        return n;
    }

    mutate(rate) {
        function mutateFunc(val) {
            if (Math.random() < rate) {
                // Mutação Gaussiana com magnitude aproximada de 0.1
                let u1 = Math.random();
                let u2 = Math.random();
                let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                return val + (z0 * 0.1); 
            } else {
                return val;
            }
        }

        this.weights_ih.map(mutateFunc);
        this.weights_ho.map(mutateFunc);
        this.bias_h.map(mutateFunc);
        this.bias_o.map(mutateFunc);
    }
}
