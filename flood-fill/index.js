const canvasDom = document.querySelector(".workspace");
const canvasDomContext = canvasDom.getContext("2d");
let currentMousePositionInfo = { x: null, y: null };
let lastMousePositionInfo = { x: null, y: null };
let isDrawMode = false;
let controllerInfo = {
  "Background Color": "#000",
  "Brush Color": "#00d1ff",
  "Flood Color": "#8600ff",
  "Brush Size": 4,
  "Line Draw": true,
  "Flood Fill": false,
  "Workspace Clear": initialize,
};

let stats;
stats = new Stats();
stats.domElement.style.position = "absolute";
stats.domElement.style.left = 0;
stats.domElement.style.top = 0;
document.body.appendChild(stats.domElement);

const gui = new dat.GUI();
gui.addColor(controllerInfo, "Background Color").onChange(fillBackground);
gui.addColor(controllerInfo, "Brush Color");
gui.addColor(controllerInfo, "Flood Color");
gui.add(controllerInfo, "Brush Size", 1, 10, 1);
gui.add(controllerInfo, "Line Draw").listen().onChange(resetCheck);
gui.add(controllerInfo, "Flood Fill").listen().onChange(resetCheck);
gui.add(controllerInfo, "Workspace Clear");

function draw(event) {
  if (isDrawMode && controllerInfo["Line Draw"]) {
    currentMousePositionInfo.x = event.touches ? event.touches[0].clientX : event.clientX;
    currentMousePositionInfo.y = event.touches ? event.touches[0].clientY : event.clientY;
    drawLine();
  }
}

function drawLine() {
  canvasDomContext.lineCap = "round";
  canvasDomContext.lineWidth = controllerInfo["Brush Size"];
  canvasDomContext.strokeStyle = controllerInfo["Brush Color"];

  if (lastMousePositionInfo.x != null && lastMousePositionInfo.y != null) {
    canvasDomContext.beginPath();
    canvasDomContext.moveTo(lastMousePositionInfo.x, lastMousePositionInfo.y);
    canvasDomContext.lineTo(currentMousePositionInfo.x, currentMousePositionInfo.y);
    canvasDomContext.stroke();
  }

  lastMousePositionInfo.x = currentMousePositionInfo.x;
  lastMousePositionInfo.y = currentMousePositionInfo.y;
}

function floodFill(x, y) {
  if (controllerInfo["Flood Fill"]) {
    if (x > 0 && x < canvasDom.width && y > 0 && y < canvasDom.height) {
      let imageData = canvasDomContext.getImageData(x, y, 1, 1);
      let pixel = imageData.data;

      let backgroundColor = hexToRgb(controllerInfo["Background Color"]);

      if (pixel[0] != backgroundColor.r || pixel[1] != backgroundColor.g || pixel[2] != backgroundColor.b) {
        return;
      }

      let floodColor = hexToRgb(controllerInfo["Flood Color"]);

      pixel[0] = floodColor.r;
      pixel[1] = floodColor.g;
      pixel[2] = floodColor.b;
      pixel[3] = 255;

      canvasDomContext.putImageData(imageData, x, y);

      setTimeout(() => {
        floodFill(x + 1, y);
        floodFill(x - 1, y);
        floodFill(x, y + 1);
        floodFill(x, y - 1);
      }, 0);
    }
  }
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  hex = hex.match(new RegExp("(.{" + hex.length / 3 + "})", "g"));
  for (let i = 0; i < hex.length; i++) {
    hex[i] = parseInt(hex[i].length == 1 ? hex[i] + hex[i] : hex[i], 16);
  }

  return { r: hex[0], g: hex[1], b: hex[2] };
}

function isPressed() {
  isDrawMode = true;
}

function reset() {
  isDrawMode = false;
  lastMousePositionInfo.x = null;
  lastMousePositionInfo.y = null;
}

function fillBackground() {
  canvasDomContext.fillStyle = controllerInfo["Background Color"];
  canvasDomContext.clearRect(0, 0, canvasDom.width, canvasDom.height);
  canvasDomContext.fillRect(0, 0, canvasDom.width, canvasDom.height);
}

function initialize() {
  controllerInfo["Flood Fill"] = false;
  controllerInfo["Line Draw"] = true;
  fillBackground();
}

function resetCheck() {
  if (this.property == "Line Draw") {
    if (this.__checkbox.checked) {
      controllerInfo["Line Draw"] = true;
      controllerInfo["Flood Fill"] = false;
    }
  }
  if (this.property == "Flood Fill") {
    if (this.__checkbox.checked) {
      controllerInfo["Flood Fill"] = true;
      controllerInfo["Line Draw"] = false;
    }
  }
}

function resize() {
  canvasDom.width = window.innerWidth;
  canvasDom.height = window.innerHeight;
  fillBackground();
}

function render(event) {
  const x = event.touches ? event.touches[0].clientX : event.clientX;
  const y = event.touches ? event.touches[0].clientY : event.clientY;

  floodFill(x, y);
}

window.addEventListener("resize", resize);

canvasDom.addEventListener("mousedown", isPressed);
canvasDom.addEventListener("touchstart", isPressed);
canvasDom.addEventListener("mousemove", draw);
canvasDom.addEventListener("touchmove", draw);
canvasDom.addEventListener("mouseup", reset);
canvasDom.addEventListener("touchend", reset);
canvasDom.addEventListener("click", render);

function loop() {
  requestAnimationFrame(loop);
  stats.begin();
  stats.end();
}

loop();
resize();
