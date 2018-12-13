var http = require('http');
var path = require('path');
var express = require('express');
var port = process.env.PORT || 3000;
const app = express();
const mnist = require('mnist'); 
const synaptic = require('synaptic');
const NeuralNetwork = require('./nn/NeuralNetwork.js');
var server = http.Server(app);
const bodyParser = require("body-parser");

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());



app.use(express.static(__dirname));
app.set(__dirname)
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
// app.use(logger("dev"));
// app.use(bodyParser.urlencoded({ extended: false }));
nn = new NeuralNetwork(28*28, [20], 10, 0.3)


app.get("/", function(req, res){
	res.render("index")
})

app.post("/nn/forward", function(req, res){
	//get image values, expecting 28x28 monochrome array
    // console.log(req.body)
    
    results = JSON.stringify(nn.query(req.body.img)).slice(2, -2);
    console.log(results)
    results = JSON.parse(results)
    confidence = -1
    prediction = 0
    counter = 0
    results.forEach(function(r){
        if (r > confidence) {
            confidence = r
            prediction = counter
        }
        counter += 1
    })
    
    // results.forEach((r,i) => {
    //     if (r == confidence) {
    //         prediction = i
    //     }
    // })
    res.json({ "confidence": confidence, "prediction": prediction, "probabilities": results})
})

app.get("/nn/train", function(req, res){
    //get image values
    var set = mnist.set(1000, 100);
    console.log("Training now");

    set.training.forEach((entry) => {
        output = entry.output
        for (i=0;i<output.length;i++) {
            if(output[i] != 1) {
                output[i] = 0.1    
            }
        }
        // console.log(entry.input)
        nn.train(entry.input,output)
    });

    res.json({"result": "processed"});
});

app.get("/nn/backward", function(req, res){
	//get number, layer, and node
	//return image data 28x28
    // nn = new NeuralNetwork(28*28, 100, 10, 0.1);
})

app.get("/nn/test", function(req, res) {
    res.json({ "raw": mnist[Math.round(Math.random()*9)].get(Math.round(Math.random()*100)) })
})

//on start we train a 1-layer NN with the MNIST dataset


server.listen(port, function() {
	console.log("VisualizeNN service started on port "+(process.env.PORT || 3000));
});
