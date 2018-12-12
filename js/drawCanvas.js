// Copyright 2018 Imran Qu
// Copyright 2010 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var canvas;
var context;
var canvasWidth = 100;
var canvasHeight = 100;
var padding = 25;
var lineWidth = 8;
var colorPurple = "#cb3594";
var colorGreen = "#659b41";
var colorYellow = "#ffcf33";
var colorBrown = "#986928";
var outlineImage = new Image();
var crayonImage = new Image();
var markerImage = new Image();
var eraserImage = new Image();
var crayonBackgroundImage = new Image();
var markerBackgroundImage = new Image();
var eraserBackgroundImage = new Image();
var crayonTextureImage = new Image();
var clickX = new Array();
var clickY = new Array();
var clickColor = new Array();
var clickTool = new Array();
var clickSize = new Array();
var clickDrag = new Array();
var paint = false;
var curColor = colorPurple;
var curTool = "crayon";
var curSize = "normal";
var mediumStartX = 18;
var mediumStartY = 19;
var mediumImageWidth = 93;
var mediumImageHeight = 46;
var drawingAreaX = 111;
var drawingAreaY = 11;
var drawingAreaWidth = 267;
var drawingAreaHeight = 200;
var toolHotspotStartY = 23;
var toolHotspotHeight = 38;
var sizeHotspotStartY = 157;
var sizeHotspotHeight = 36;
var sizeHotspotWidthObject = new Object();
sizeHotspotWidthObject.huge = 39;
sizeHotspotWidthObject.large = 25;
sizeHotspotWidthObject.normal = 18;
sizeHotspotWidthObject.small = 16;

function executeArticleScript() {
	//console.log("executeArticleScript");
	prepareCanvas();
}
/**
* Adds a point to the drawing array.
* @param x
* @param y
* @param dragging
*/

function addClick(x, y, dragging)
{
	clickX.push(x);
	clickY.push(y);
	clickTool.push(curTool);
	clickColor.push(curColor);
	clickSize.push(curSize);
	clickDrag.push(dragging);
}

/****************************************************************************** Simple Canvas */

var clickX_simple = new Array();
var clickY_simple = new Array();
var clickDrag_simple = new Array();
var paint_simple;
var canvas_simple;
var context_simple;
function getColorIndicesForCoord(x,y,width) {
	var red = y*(width*4)+x*4
	return [red, red+1, red+2, red+3] // red, green, blue
}

/**
* Creates a canvas element.
*/
function prepareCanvas()
{
	// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
	var canvasDiv = document.getElementById('draw');
	canvas_simple = document.createElement('canvas');
	canvas_simple.setAttribute('width', canvasWidth);
	canvas_simple.setAttribute('height', canvasHeight);
	canvas_simple.setAttribute('id', 'canvasSimple');
	canvasDiv.appendChild(canvas_simple);
	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas_simple = G_vmlCanvasManager.initElement(canvas_simple);
	}
	context_simple = canvas_simple.getContext("2d");
	
	// Add mouse events
	// ----------------
	$('#canvasSimple').mousedown(function(e)
	{
		// Mouse down location
		var mouseX = e.pageX - this.offsetLeft;
		var mouseY = e.pageY - this.offsetTop;
		
		paint_simple = true;
		addClickSimple(mouseX, mouseY, false);
		redrawSimple();
	});
	
	$('#canvasSimple').mousemove(function(e){
		if(paint_simple){
			addClickSimple(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
			redrawSimple();
		}
	});
	
	$('#canvasSimple').mouseup(function(e){
		paint_simple = false;
	  	redrawSimple();
	});
	
	$('#canvasSimple').mouseleave(function(e){
		paint_simple = false;
	});
	
	$('#predictDigit').mousedown(function(e)
	{
		downscaleDim = 28
		clickX_simple = new Array();
		clickY_simple = new Array();
		clickDrag_simple = new Array();
		var image = new Image();
		image.id = "pic"
		image.src = document.getElementById('canvasSimple').toDataURL();
		canvas = document.getElementById('canvasSimple');
		ctx = canvas.getContext('2d');
		imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		canvas_zoomed = document.createElement('canvas');
		canvas_zoomed.setAttribute('width', downscaleDim);
		canvas_zoomed.setAttribute('height', downscaleDim);
		canvas_zoomed.setAttribute('id', 'dest');

		$('#imageWrapper').html(canvas_zoomed);

		destCtx = $("#dest")[0].getContext('2d')
		newCanvas = $("<canvas>")
			.attr("width", imgData.width)
			.attr("height", imgData.height)[0]


		newCanvas.getContext('2d').putImageData(imgData,0,0)
		destCtx.scale(downscaleDim / imgData.width, downscaleDim / imgData.width)
		// destCtx.scale(downscaleDim / imgData.height)
		destCtx.drawImage(newCanvas,0,0)
		// console.log(imgData);
		// document.getElementById('imageWrapper').innerHTML = "";
		// document.getElementById('imageWrapper').appendChild(image);
		clearCanvas_simple(); 
		scaledImgData = destCtx.getImageData(0,0,downscaleDim, downscaleDim).data
		nnData = [] //28*28 sized array
		
		for (i=0; i<28*28; i++) {
			nnData[i] = scaledImgData[i*4] > 200 ? 0.99 : 0
		}
		console.log("nnData: "+JSON.stringify(nnData))

		$.ajax({
			"url":"/nn/forward",
			"method":"post",
			"data": {"img": nnData},
			"success": function(res) {
				$("#prediction").text(res.prediction)
				$("#confidence").text(res.confidence*100+"%")
			}
		})
	});
	
	// Add touch event listeners to canvas element
	canvas_simple.addEventListener("touchstart", function(e)
	{
		// Mouse down location
		var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
			mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
		
		paint_simple = true;
		addClickSimple(mouseX, mouseY, false);
		redrawSimple();
	}, false);
	canvas_simple.addEventListener("touchmove", function(e){
		
		var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
			mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
					
		if(paint_simple){
			addClickSimple(mouseX, mouseY, true);
			redrawSimple();
		}
		e.preventDefault()
	}, false);
	canvas_simple.addEventListener("touchend", function(e){
		paint_simple = false;
	  	redrawSimple();
	}, false);
	canvas_simple.addEventListener("touchcancel", function(e){
		paint_simple = false;
	}, false);
}

function addClickSimple(x, y, dragging)
{
	clickX_simple.push(x);
	clickY_simple.push(y);
	clickDrag_simple.push(dragging);
}

function clearCanvas_simple()
{
	context_simple.clearRect(0, 0, canvasWidth, canvasHeight);
}

function redrawSimple()
{
	clearCanvas_simple();
	
	var radius = 5;
	context_simple.strokeStyle = "#df4b26";
	context_simple.lineJoin = "round";
	context_simple.lineWidth = radius;
			
	for(var i=0; i < clickX_simple.length; i++)
	{		
		context_simple.beginPath();
		if(clickDrag_simple[i] && i){
			context_simple.moveTo(clickX_simple[i-1], clickY_simple[i-1]);
		} else{
			context_simple.moveTo(clickX_simple[i]-1, clickY_simple[i]);
		}
		context_simple.lineTo(clickX_simple[i], clickY_simple[i]);
		context_simple.closePath();
		context_simple.stroke();
	}
}

executeArticleScript();

/**/