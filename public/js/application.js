$(document).ready(function () {
    //Set up some globals
    var pixSize = 3, lastPoint = null, currentColor = "000", mouseDown = 0;
    var slide = 0
    //Create a reference to the pixel data for our drawing.
    var pixelDataRef = new Firebase('https://amber-heat-1074.firebaseio.com/');

    // Set up our canvas
    var myCanvas = document.getElementById('drawing-canvas');

    var myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;
    if (myContext == null) {
      alert("You must use a browser that supports HTML5 Canvas to run this demo.");
      return;
    }
    myContext.beginPath();
    myContext.lineWidth ="3"
    myContext.rect(0,0,25,25);
    myContext.rect(775,0,25,25);
    myContext.font = "25px Arial"

    myContext.fillStyle = "black"
    myContext.fillText("X", 4, 22);
    myContext.fillText(">", 780, 22);
    myContext.stroke();
    //Setup each color palette & add it to the screen
    var colors = ["fff","000","f00","0f0","00f","88f","f8d","f88","f05","f80","0f8","cf0","08f","408","ff8","8ff"];
    for (c in colors) {
      var item = $('<td/>').css("background-color", '#' + colors[c]).addClass("colorbox").attr("id", colors[c]);
      item.click((function () {
        var col = colors[c];
        return function () {
          currentColor = col;
        };
      })());
      item.appendTo('#colorholder');
    }
    //Keep track of if the mouse is up or down
    myCanvas.onmousedown = function () {mouseDown = 1;};
    myCanvas.onmouseout = myCanvas.onmouseup = function () {
      mouseDown = 0; lastPoint = null;
    };
    $(myCanvas).on("click",function(event){
      if (event.clientX < 325 && event.clientY <210){
          clearAll();
        }
      else if(event.clientX > 775 && event.clientY <210){
        clearAll();
        if (slide < SLIDESHOW.length){
          myContext.fillText(SLIDESHOW[slide],200,125)
          pixelDataRef.child("200" + ":" + "125").set({text:SLIDESHOW[slide], slide:slide});
          slide += 1
        }
        else{slide = 0}
      }
    })
    //Draw a line from the mouse's last position to its current position
    var drawLineOnMouseMove = function(e) {
      if (!mouseDown) return;
      e.preventDefault();
      // Bresenham's line algorithm. We use this to ensure smooth lines are drawn
      var offset = $('canvas').offset();
      var x1 = Math.floor((e.pageX - offset.left) / pixSize - 1),
       y1 = Math.floor((e.pageY - offset.top) / pixSize - 1);
      var x0 = (lastPoint == null) ? x1 : lastPoint[0];
      var y0 = (lastPoint == null) ? y1 : lastPoint[1];
      var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
      while (true) {
        //write the pixel into Firebase, or if we are drawing white, remove the pixel
        pixelDataRef.child(x0 + ":" + y0).set(currentColor === "fff" ? null : currentColor);
        if (x0 == x1 && y0 == y1) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
          err = err - dy;
          x0 = x0 + sx;
        }
        if (e2 < dx) {
          err = err + dx;
          y0 = y0 + sy;
        }
      }
      lastPoint = [x1, y1];
    };

    $(myCanvas).mousemove(drawLineOnMouseMove);

    var clearAll = function(){
        var onComplete = function(error) {
        if (error) {
          console.log('Synchronization failed');
        } else {
          console.log('Synchronization succeeded');
        }
        };
        pixelDataRef.remove(onComplete);
        myCanvas.width = myCanvas.width
        actionBox("X",[4,22]);
        actionBox(">",[775,22]);
    }


    // Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
    // Note that child_added events will be fired for initial pixel data as well.
    var drawPixel = function(snapshot) {
      var coords = snapshot.key().split(":");
      if(snapshot.val().text === SLIDESHOW[snapshot.val().slide] && snapshot.val().text !== undefined){
        myCanvas.width = myCanvas.width
        actionBox("X",[4,22]);
        actionBox(">",[775,22]);
        slide = snapshot.val().slide
        myContext.fillText(snapshot.val().text, 200, 125);
      }
      else{
        myContext.fillStyle = "#" + snapshot.val();
        myContext.fillRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
      }
    };
    var clearPixel = function(snapshot) {
      var coords = snapshot.key().split(":");
      myContext.clearRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
    };
    pixelDataRef.on('child_added', drawPixel);
    pixelDataRef.on('child_changed', drawPixel);
    pixelDataRef.on('child_removed', clearPixel);
  var actionBox = function(string,cords){
    myContext.beginPath();
    myContext.lineWidth ="3"
    myContext.rect(0,0,25,25);
    myContext.font = "25px Arial"

    myContext.fillStyle = "black"
    myContext.fillText(string,cords[0],cords[1]);
    myContext.stroke();

    }
  });



