//Created by Imran Qureshi - 2018

class NeuralNetwork {
  //created with one hidden layer
  constructor(input_nodes, hidden_nodes_arr, output_nodes, learning_rate) {
    this.inodes = input_nodes
    this.hnodes = hidden_nodes_arr[0]
    this.onodes = output_nodes
    this.lr = learning_rate
    this.wih = nj.random(this.hnodes, this.inodes) //100x784
    this.wih = this.wih.subtract(nj.ones(this.wih.shape).assign(0.5))
    // console.log(JSON.stringify(this.wih))
    this.who = nj.random(this.onodes, this.hnodes) //10x100
    this.who = nj.subtract(this.who, nj.ones(this.who.shape).assign(0.5))
    this.training = 0
    
    console.log("Initializing network with "+output_nodes+" Output Nodes, "+input_nodes+" Input Nodes") 
    console.log("Two matrices for hidden layer connections: "+this.wih.shape+" => "+this.who.shape) 
  }

  trainingSet() {
    return this.training;
  }

  train(user_inputs, user_targets) {
    var inputs = nj.array(user_inputs).T
    var targets = nj.array(user_targets).T
    // console.log("WIH: "+this.wih.shape+" Inputs: "+inputs.shape+" => Hidden Inputs: ")
    var hidden_inputs = nj.dot(this.wih, inputs) //connection to the hidden layer (100x784)*(784x1) = (100x1)
    // console.log("WIH: "+this.wih.shape+" Inputs: "+inputs.shape+" => Hidden Inputs: "+hidden_inputs.shape)
    var hidden_outputs = nj.sigmoid(hidden_inputs) //processed
    var final_inputs = nj.dot(this.who, hidden_outputs) //final output, should be 1x10 (10x100)*(100x1) = 10x1
    // console.log("WHO: "+this.who.shape+" Hidden Outputs: "+hidden_outputs.shape+" => Final Inputs: "+final_inputs.shape)

    var final_outputs = nj.sigmoid(final_inputs) //10x1
    console.log("Actual: "+user_targets.indexOf(0.99)+", Predicted: "+JSON.stringify(final_outputs.flatten()))
    var output_errors = targets.subtract(final_outputs) //10x1
    var hidden_errors = nj.dot(this.who.T, output_errors) //(100x10).(10x1) = (100x1)

    //backprop
    var p0b = nj.multiply(output_errors, final_outputs) // (10x1)*(10x1) = (10x1)
    var p0a = nj.ones(final_outputs.shape).subtract(final_outputs) //(10x1)
    var p1 = nj.multiply(p0a,p0b).reshape(final_outputs.size,1) //(10x1)
    var p2 = nj.dot(p1,hidden_outputs.reshape(1,hidden_outputs.size)) // 10x1
    var learningRateMatrix = nj.ones(p2.shape).assign(this.lr) //this.lr
    this.who = this.who.add(nj.multiply(learningRateMatrix,p2)) //10x1 * 10x1 = 10x1
    var p0 = nj.ones(hidden_outputs.shape) //
    var p1 = nj.multiply(hidden_errors, nj.multiply(hidden_outputs, p0.subtract(hidden_outputs)))
    var p2 = nj.dot(p1.reshape(p1.size,1), inputs.reshape(1, inputs.size))
    var learningRateMatrix = nj.ones(p2.shape).assign(this.lr)
    this.wih = this.wih.add(nj.multiply(learningRateMatrix, p2))    

    var result = []
    final_outputs = final_outputs.flatten()
    for (i=0; i<final_outputs.size;i++) {
      result.push(final_outputs.get(i,1))
    }
    this.training += 1
    return result
    
  }

  query(inputs) {
    var inputs = nj.array(inputs)
    var hidden_inputs = nj.dot(this.wih, inputs.reshape(inputs.size,1)) //(100x784).(784x1) => 100 x 1

    //calculate the signals emerging from hidden layer 
    var hidden_outputs = nj.sigmoid(hidden_inputs) 

    //calculate signals into final output layer 
    var final_inputs = nj.dot(this.who, hidden_outputs) //(10x100).(100x1) => 10x1

    //calculate the signals emerging from final output layer 
    var final_outputs = nj.sigmoid(final_inputs).flatten()

    //convert NDArray to JS
    var result = []
    for (i=0; i<final_outputs.size;i++) {
      result.push(final_outputs.get(i,1))
    }


    return result
  }

  
  sigmoid(t) {
    return 1/(1+Math.exp(-t));
  }

  logit(t) {
    return Math.log(t/(1-t));
  }

  logitNdArray(ar) {
    var p0 = nj.subtract(nj.ones(ar.shape), ar)
    var p1 = nj.divide(ar,p0)
    return nj.log(p1)
  }

  backquery(targets) {
    var final_outputs = nj.array(targets);

    // calculate the signal into the final output layer
    var p0 = nj.subtract(nj.ones(final_outputs.shape), final_outputs)
    var p1 = nj.divide(final_outputs,p0)
    var final_inputs = nj.log(p1)
    var hidden_outputs = nj.dot(this.who.T, final_inputs);

    // scale them back to 0.01 to .99
    hidden_outputs = hidden_outputs.subtract(nj.ones(hidden_outputs.shape).assign(hidden_outputs.min()));    
    hidden_outputs = hidden_outputs.add(nj.ones(hidden_outputs.shape).assign(0.1));
    hidden_outputs = hidden_outputs.divide(nj.ones(hidden_outputs.shape).assign(hidden_outputs.max()));
    hidden_outputs = hidden_outputs.multiply(nj.ones(hidden_outputs.shape).assign(0.98));    

    // calculate the signal into the hidden layer
    var p0 = nj.subtract(nj.ones(hidden_outputs.shape), hidden_outputs)
    var p1 = nj.divide(hidden_outputs,p0)
    
    var hidden_inputs = nj.log(p1)
    
    // calculate the signal out of the input layer
    var inputs = nj.dot(this.wih.T, hidden_inputs.reshape(hidden_inputs.size,1))
    
    inputs = inputs.subtract(nj.ones(inputs.shape).assign(inputs.min()));
    inputs = inputs.add(nj.ones(inputs.shape).assign(0.1));
    inputs = inputs.divide(nj.ones(inputs.shape).assign(inputs.max()));
    inputs = inputs.multiply(nj.ones(inputs.shape).assign(0.98));
    inputs = inputs.flatten();
    
    var result = []
    for (i=0; i<inputs.size; i++) {
        result.push(inputs.get(i,1));
    }
    return result;
  }
}

// module.exports = NeuralNetwork;



// module export NeuralNetwork;
