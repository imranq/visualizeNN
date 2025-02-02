//send over entries
//ajax in webworker
importScripts("num.min.js", "NeuralNetwork.js")
self.addEventListener("message", function(e) {
	// console.log(e.data)
	entries = e.data["entries"]
	cycles = e.data["epochs"]
	nn = new NeuralNetwork(28*28, [e.data["nodes"]], 10, 0.2)
	for (c = 0; c < cycles; c++) {
		for (ind = 1; ind <= e.data["trainingSet"]; ind++) {
			var entry = entries[ind];
			entry = entry.split(",");

			//construct target
			var output = [];
			for (i=0; i<10;i++) {
				output.push(0.1);
			}
			output[entry[0]] = 0.99;
			
			//construct mnist data
			var mnist = entry.slice(1,785);
			var mnist_pretty = mnist.concat()
			for (i=0; i<mnist.length; i++) {	
				if (mnist[i] < 0.1) {
					mnist[i] = 0.1;
					mnist_pretty[i] = 0.01
				} else {
					mnist[i] = 0.99;
					mnist_pretty[i] /= 255;
				}
			}
			predValue = nn.train(mnist, output);
			backQueryOutputs = []
			if (ind % 10 == 0) {
				
				for (bi=0; bi<10; bi++) {
					backQueryOutputs.push(nn.backquery(bi))
				}	
			}
				
			self.postMessage({ "status": "in-process", "index": ind, "prediction": predValue, "target": entry[0], "mnist": mnist_pretty, "backquery": backQueryOutputs });
		}
	}
	
	// console.log(JSON.stringify(nn.serialize()))
	self.postMessage({"status":"complete", "network": nn.serialize()})
	self.close();
})