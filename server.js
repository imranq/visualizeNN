var http = require('http');
var path = require('path');
var express = require('express');
var port = process.env.PORT || 3000;
const app = express();
const mnist = require('mnist'); 
const synaptic = require('synaptic');

const set = mnist.set(700, 20);
const trainingSet = set.training;
const testSet = set.test;
const Layer = synaptic.Layer;
const Network = synaptic.Network;
const Trainer = synaptic.Trainer;

var layers = 2

const inputLayer = new Layer(28*28);
const hiddenLayer = new Layer(100);
const outputLayer = new Layer(10);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

const myNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
});


var server = http.Server(app);

app.use(express.static(__dirname));
app.set(__dirname)
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
// app.use(logger("dev"));
// app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(req, res){
	res.render("index")
})

app.get("/nn/forward", function(req, res){
	//get image values


})


app.get("/nn/train", function(req, res){
    //get image values
    const trainer = new Trainer(myNetwork);
    trainer.train(trainingSet, {
        rate: .2,
        iterations: 1,
        error: .1,
        shuffle: true,
        log: 1,
        cost: Trainer.cost.CROSS_ENTROPY
    });

    res.json({"result": "processing"})
});



app.get("/nn/backward", function(req, res){
	//get number, layer, and node
	//return image data 28x28
})

//on start we train a 1-layer NN with the MNIST dataset


server.listen(port, function() {
	console.log("VisualizeNN service started on port "+(process.env.PORT || 3000));
});
