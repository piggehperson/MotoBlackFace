var rocky = require('rocky');

// Define the colors to be used in the watch face
var theme = {
  colorBackground: "black",
  colorWatchHands: "white",
  colorSecondHand: "red",
  colorMarkers: "lightgray", // Controls hour/minute markers and pebble logo

  // Theme to use on monochrome displays
  bwBackground: "black",
  bwWatchHands: "white",
  bwMarkers: "lightgray"
}


// Coords for the 5-minute markers
var markersRect = [
  {x1: 114, y1: 0, x2: 102, y2: 23},
  {x1: 144, y1: 36, x2: 125, y2: 48},
  {x1: 144, y1: 132, x2: 125, y2: 120},
  {x1: 114, y1: 168, x2: 102, y2: 145},
  {x1: 30, y1: 168, x2: 42, y2: 145},
  {x1: 0, y1: 132, x2: 19, y2: 120},
  {x1: 0, y1: 36, x2: 19, y2: 48},
  {x1: 30, y1: 0, x2: 42, y2: 23},
];
var markersRound = [
  {x1: 135, y1: 12, x2: 123, y2: 33},
  {x1: 168, y1: 45, x2: 147, y2: 57},
  {x1: 168, y1: 135, x2: 147, y2: 123},
  {x1: 136, y1: 168, x2: 123, y2: 147},
  {x1: 45, y1: 168, x2: 57, y2: 147},
  {x1: 12, y1: 135, x2: 33, y2: 123},
  {x1: 12, y1: 45, x2: 33, y2: 57},
  {x1: 45, y1: 12, x2: 57, y2: 33},
];

function fractionToRadian(fraction) {
  return fraction * 2 * Math.PI;
}

function drawHand(ctx, cx, cy, angle, length, thickness, color) {
  // Find the end points
  var x2 = cx + Math.sin(angle) * length;
  var y2 = cy - Math.cos(angle) * length;

  // Configure how we want to draw the hand
  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;

  // Begin drawing
  ctx.beginPath();

  // Move to the center point, then draw the line
  ctx.moveTo(cx, cy);
  ctx.lineTo(x2, y2);

  // Stroke the line (output to display)
  ctx.stroke();
}

function drawLine(ctx, x1, y1, x2, y2, thickness, color) {
  // Configure how we want to draw the line
  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;

  // Begin drawing
  ctx.beginPath();

  // Move to the start point, then draw the line
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  // Stroke the line (output to display)
  ctx.stroke();
}

function adjustHeight(ctx, yCoordinate) {
  return yCoordinate * (ctx.canvas.unobstructedHeight / ctx.canvas.clientHeight);
}

function isColor() {
  return rocky.watchInfo.platform == "diorite";
}

function drawMarkers(ctx) {
  if (ctx.canvas.clientWidth == ctx.canvas.clientHeight) {
    // Device is round
    // Draw minute markers
    for (var i = 0; i < markersRound.length; i++) {
      drawLine(ctx, 
               markersRound[i].x1, markersRound[i].y1, // start
               markersRound[i].x2, markersRound[i].y2, // end
               1, // thickness
               theme.colorMarkers // Round is always color, so 
                                  // no need to check
      );
    }
    // Draw hour markers
    ctx.fillStyle = theme.colorMarkers;
    ctx.fillRect(87, 0, 2, 24);
    ctx.fillRect(92, 0, 2, 24);
    ctx.fillRect(89, 156, 2, 24);
    ctx.fillRect(156, 91, 24, 2);
    ctx.fillRect(0, 91, 24, 2);
  } else {
    // Device is probably not round
    // Draw minute markers
    for (var n = 0; n < markersRect.length; n++) {
      drawLine(ctx, 
               markersRect[i].x1, markersRect[i].y1, // start
               markersRect[i].x2, markersRect[i].y2, // end
               1, // thickness
               isColor() // check if color
                ? theme.bwMarkers
                : theme.colorMarkers
      );
    }
    // Draw hour markers
    ctx.fillStyle = isColor() // check if color
      ? theme.bwMarkers
      : theme.colorMarkers;
    ctx.fillRect(69, 0, 2, 24);
    ctx.fillRect(74, 0, 2, 24);
    ctx.fillRect(71, adjustHeight(ctx, 144), 2, 24);
    ctx.fillRect(120, adjustHeight(ctx, 85), 24, 2);
    ctx.fillRect(0, adjustHeight(ctx, 85), 24, 2);
  }
}

rocky.on('draw', function(event) {
  var ctx = event.context;
  var d = new Date();

  // Clear the screen
  ctx.fillStyle = isColor() // check if color
    ? theme.bwBackground
    : theme.colorBackground;
  ctx.fillRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;
  
  drawMarkers(ctx);
  
  if (h == ctx.canvas.clientHeight) {
    // Watchface unobstructed, show logo
    // Set text style
    ctx.textAlign = 'center';
    ctx.fillStyle = isColor() // check if color
      ? theme.bwMarkers
      : theme.colorMarkers;
    
    // Draw the "Pebble" logo in the top middle
    ctx.fillText("pebble", w / 2, 37, w);
  } // Else quick view is active, it would just get
    // scrunched up and look bad

  // Determine the center point of the display
  // and the max size of watch hands
  var cx = w / 2;
  var cy = h / 2;

  // -10 so we're inset 5px on each side
  var maxLength = (Math.min(w, h) - 10) / 2;

  // Calculate the second hand angle
  // We calculate it now for use with the minute hand, but
  // we draw the second hand last so it appears on top.
  var secondFraction = (d.getSeconds()) / 60;
  var secondAngle = fractionToRadian(secondFraction);
  
  // Calculate the minute hand angle
  var minuteFraction = (d.getMinutes() / 60);
  var minuteAngle = fractionToRadian(minuteFraction);
  
  // Draw the minute hand
  drawHand(ctx, cx, cy, minuteAngle, maxLength, 6, isColor() // check if color
    ? theme.bwWatchHands
    : theme.colorWatchHands
  );

  // Calculate the hour hand angle
  var hourFraction = (d.getHours() % 12 + minuteFraction) / 12;
  var hourAngle = fractionToRadian(hourFraction);

  // Draw a shadow for the hour hand, so it 
  // never blends in with the minute hand
  drawHand(ctx, cx, cy, hourAngle, maxLength * 0.6, 7, isColor() // check if color
    ? theme.bwBackground
    : theme.colorBackground);

  // Draw the hour hand
  drawHand(ctx, cx, cy, hourAngle, maxLength * 0.6, 6,isColor() // check if color
    ? theme.bwWatchHands
    : theme.colorWatchHands
  );

  // Draw the second hand
  if (isColor()) {
    //Draw the second hand in white
    drawHand(ctx, cx, cy, secondAngle, h, 2, theme.bwWatchHands);
  } else {
    // Draw it with the usual red, and make it a 
    // bit thicker to make up for reduced contrast
    drawHand(ctx, cx, cy, secondAngle, h, 2, theme.colorSecondHand);
  }
  
  // Draw the dot in the center of the face
  ctx.fillStyle = isColor() // check if color
    ? theme.bwBackground
    : theme.colorBackground;
  ctx.rockyFillRadial(cx, cy, 0, 7, 0, 2 * Math.PI);
  ctx.fillStyle = isColor() // check if color
    ? theme.bwWatchHands
    : theme.colorWatchHands;
  ctx.rockyFillRadial(cx, cy, 0, 3, 0, 2 * Math.PI);
});

rocky.on('secondchange', function(event) {
  // Request the screen to be redrawn on next pass
  rocky.requestDraw();
});