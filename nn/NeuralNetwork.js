var nj = require("numjs")

class NeuralNetwork {
  //created with one hidden layer
  constructor(input_nodes, hidden_nodes, output_nodes, learning_rate) {
    this.inodes = input_nodes
    this.hnodes = hidden_nodes
    this.onodes = output_nodes
    this.lr = learning_rate
    this.wih = (nj.random(this.hnodes, this.inodes))-0.5
    this.who = (nj.random.rand(this.onodes, this.hnodes))-0.5
    this.wih = numpy.random.normal(0.0, pow(self.hnodes, -0.5), (self.hnodes, self.inodes))
    this.who = numpy.random.normal(0.0, pow(self.onodes, -0.5), (self.onodes, self.hnodes))

  }

  init(inputs,bias=this.bias) {
    // Initialize weights to 0 and adding bias weight
    this.weights = [...inputs.map(i => Math.random()), bias];
  }

  train(inputs,expected) {
    if (!this.weights.length) this.init(inputs);
    if (inputs.length != this.weights.length) inputs.push(1); // Adding the bias

    // Keeping this in the training set if it didn't exist
    if (!this.trainingSet.find(t => t.inputs.every((inp,i) => inp === inputs[i]))) this.trainingSet.push({inputs,expected});

    const actual = this.evaluate(inputs);
    if (actual == expected) return true; // Correct weights return and don't touch anything.

    // Otherwise update each weight by adding the error * learningRate relative to the input
    this.weights = this.weights.map((w,i) => w += this.delta(actual, expected,inputs[i]));
    return this.weights;
  }

  // Calculates the difference between actual and expected for a given input
  delta(actual, expected, input,learningRate=this.learningRate) {
    const error = expected - actual; // How far off were we
    return error * learningRate * input;
  }

  // Iterates until the weights are correctly set
  learn(iterationCallback=()=>{},trainingSet=this.trainingSet) {
    let success = false;
    while (!success) {
      // Function of your choosing that will be called after an iteration has completed
      iterationCallback.call(this);
      success = trainingSet.every(t => this.train(t.inputs,t.expected) === true);
    }
  }
  // Sum inputs * weights
  weightedSum(inputs=this.inputs,w
    eights=this.weights) {
    return inputs.map((inp,i) => inp * weights[i]).reduce((x,y) => x+y,0);
  }

  // Evaluate using the current weights
  evaluate(inputs) {
    return this.activate(this.weightedSum(inputs));
  }

  // Sugar syntax evaluate with added bias input
  predict(inputs) {
    return this.evaluate([...inputs,1]);
  }

  // Heaviside as the activation function
  activate(value) {
    return value >= 0 ? 1 : 0;
  }

  sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t));
  }

  inverse_sigmoid(t) {
    return Math.log(t/(1-t));
  }

  backquery(targets) {
    final_outputs = nj.array(targets);

    // calculate the signal into the final output layer
    final_inputs = this.inverse_sigmoid(final_outputs);

    // calculate the signal out of the hidden layer
    hidden_outputs = nj.dot(who.T, final_inputs);
    
    // scale them back to 0.01 to .99
    hidden_outputs -= nj.min(hidden_outputs);
    hidden_outputs /= nj.max(hidden_outputs);
    hidden_outputs *= 0.98;
    hidden_outputs += 0.01;

    // calculate the signal into the hidden layer
    hidden_inputs = inverse_sigmoid(hidden_outputs);
    
    // calculate the signal out of the input layer
    inputs = nj.dot(self.wih.T, hidden_inputs)
    inputs -= nj.min(inputs);
    inputs /= nj.max(inputs);
    inputs *= 0.98;
    inputs += 0.01;
    return inputs;
  }
}

export default Perceptron;
