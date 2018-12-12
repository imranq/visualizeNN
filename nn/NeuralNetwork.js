var nj = require("numjs");

class NeuralNetwork {
  //created with one hidden layer
  constructor(input_nodes, hidden_nodes, output_nodes, learning_rate) {
    this.inodes = input_nodes
    this.hnodes = hidden_nodes
    this.onodes = output_nodes
    this.lr = learning_rate
    this.wih = nj.random(this.hnodes, this.inodes) //100x784
    // console.log(this.wih)
    this.who = nj.random(this.onodes, this.hnodes) //10x100
    console.log("Initializing network with "+output_nodes+" Output Nodes, "+input_nodes+" Input Nodes") 
    console.log("Two matrices for hidden layer connections: "+this.wih.shape+" => "+this.who.shape) 
  }

  train(user_inputs,user_targets){
    var inputs = nj.array(user_inputs).T
    var targets = nj.array(user_targets).T
    var hidden_inputs = nj.dot(this.wih, inputs) //connection to the hidden layer (100x784)*(784x1) = (100x1)
    // console.log("WIH: "+this.wih.shape+" Inputs: "+inputs.shape+" => Hidden Inputs: "+hidden_inputs.shape)
    var hidden_outputs = nj.sigmoid(hidden_inputs) //processed
  
    var final_inputs = nj.dot(this.who, hidden_outputs) //final output, should be 1x10 (10x100)*(100x1) = 10x1
    // console.log("WHO: "+this.who.shape+" Hidden Outputs: "+hidden_outputs.shape+" => Final Inputs: "+final_inputs.shape)

    var final_outputs = nj.sigmoid(final_inputs) //10x1
    var output_errors = nj.subtract(targets,final_outputs) //10x1
    console.log(user_targets.indexOf(1)+": Error: "+output_errors.sum())

    var hidden_errors = nj.dot(this.who.T, output_errors) // (100x10).(10x1) = (100x1)
    // console.log("WHO_T: "+this.who.T.shape+" Output Errors: "+output_errors.shape+" => Hidden Errors: "+hidden_errors.shape)

    //backprop
    var p0a = nj.multiply(output_errors,final_outputs) // (10x1)*(10x1) = (10x1)
    var p0b = nj.ones(final_outputs.shape).subtract(final_outputs) //(10x1)
    var p1 = nj.multiply(p0a,p0b).reshape(10,1) //(10x1)
    // console.log("p0a: "+p0a.shape+" p0b: "+p0b.shape+" => p1: "+p1.shape)
    var p2 = nj.dot(p1,hidden_outputs.reshape(1,100)) // 10x1
    console.log(JSON.stringify(p2))
    // console.log("p1: "+p1.shape+" hidden_outputs: "+hidden_outputs.reshape(1,100).shape+" => p2: "+p2.shape)
    var learningRateMatrix = nj.ones(p2.shape).assign(this.lr) //this.lr
    // console.log(JSON.stringify(nj.multiply(learningRateMatrix, p2)))
    this.who = this.who.add(nj.multiply(learningRateMatrix,p2)) //10x1 * 10x1 = 10x1
    // console.log("learningRateMatrix: "+learningRateMatrix.shape+" hidden_outputs: "+hidden_outputs.shape+" => who: "+this.who.shape)
    // console.log(JSON.stringify(this.who)) 
    var p0 = nj.ones(hidden_outputs.shape) //
    var p1 = nj.multiply(hidden_errors, nj.multiply(hidden_outputs, p0.subtract(hidden_outputs)))
    // console.log("hidden errors: "+hidden_errors.shape+" dot hidden_outputs: "+hidden_outputs.shape+" => P1: "+p1.shape)
    // console.log(inputs.reshape(1, inputs.size))
    var p2 = nj.dot(p1.reshape(p1.size,1), inputs.reshape(1, inputs.size))
    // console.log("p1: "+p1.shape+" dot inputs: "+inputs.shape+" => P2: "+p2.shape)
    var learningRateMatrix = nj.ones(p2.shape).assign(this.lr)
    // console.log(JSON.stringify(learningRateMatrix))
    this.wih = this.wih.add(nj.multiply(learningRateMatrix, p2))    
  }

  query(inputs) {
    // console.log(JSON.stringify(inputs))
    // console.log(JSON.parse(inputs))
    var inputs = nj.array(inputs)
    // console.log(inputs)
    console.log(this.wih.shape+" "+inputs.reshape(inputs.size,1).shape)
    var hidden_inputs = nj.dot(this.wih, inputs.reshape(inputs.size,1)) //(100x784).(784x1) => 100 x 1
    
    //calculate the signals emerging from hidden layer 
    var hidden_outputs = nj.sigmoid(hidden_inputs) 
    

    //calculate signals into final output layer 
    var final_inputs = nj.dot(this.who, hidden_outputs) //(10x100).(100x1) => 10x1
    // console.log(JSON.stringify(final_inputs))
    //calculate the signals emerging from final output layer 
    var final_outputs = nj.sigmoid(final_inputs)
    // console.log(final_outputs)
    return final_outputs.reshape(1,final_outputs.size)
  }

  
  sigmoid(t) {
    return 1/(1+Math.exp(-t));
  }

  logit(t) {
    return Math.log(t/(1-t));
  }

  backquery(targets) {
    final_outputs = nj.array(targets);

    // calculate the signal into the final output layer
    final_inputs = this.logit(final_outputs);

    // calculate the signal out of the hidden layer
    hidden_outputs = nj.dot(who.T, final_inputs);
    
    // scale them back to 0.01 to .99
    hidden_outputs -= nj.min(hidden_outputs);
    hidden_outputs /= nj.max(hidden_outputs);
    hidden_outputs *= 0.98;
    hidden_outputs += 0.01;

    // calculate the signal into the hidden layer
    hidden_inputs = this.logit(hidden_outputs);
    
    // calculate the signal out of the input layer
    inputs = nj.dot(self.wih.T, hidden_inputs)
    inputs -= nj.min(inputs);
    inputs /= nj.max(inputs);
    inputs *= 0.98;
    inputs += 0.01;
    return inputs;
  }
}

module.exports = NeuralNetwork;



// module export NeuralNetwork;
