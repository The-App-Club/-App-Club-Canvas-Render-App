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
    currentMousePositionInfo.x = event.touches
      ? event.touches[0].clientX
      : event.clientX;
    currentMousePositionInfo.y = event.touches
      ? event.touches[0].clientY
      : event.clientY;
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
    canvasDomContext.lineTo(
      currentMousePositionInfo.x,
      currentMousePositionInfo.y
    );
    canvasDomContext.stroke();
  }

  lastMousePositionInfo.x = currentMousePositionInfo.x;
  lastMousePositionInfo.y = currentMousePositionInfo.y;
}

function getPixel(imageData, x, y) {
  const offset = (y * imageData.width + x) * 4;
  return imageData.data.slice(offset, offset + 4);
}

function matchColor(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

function setPixel(imageData, x, y, color) {
  const offset = (y * imageData.width + x) * 4;
  imageData.data[offset + 0] = color[0];
  imageData.data[offset + 1] = color[1];
  imageData.data[offset + 2] = color[2];
  imageData.data[offset + 3] = color[3];
}
function floodFill(x, y) {
  if (controllerInfo["Flood Fill"]) {
    const imageData = canvasDomContext.getImageData(
      0,
      0,
      canvasDom.width,
      canvasDom.height
    );
    const fillColor = hexToRgb(controllerInfo["Flood Color"]);
    const targetColor = getPixel(imageData, x, y);

    if (!matchColor(targetColor, fillColor)) {
      const queue = [];
      queue.push({ x, y });
      while (queue.length > 0) {
        const { x, y } = queue.pop();
        const currentColor = getPixel(imageData, x, y);
        if (matchColor(currentColor, targetColor)) {
          setPixel(imageData, x, y, fillColor);
          queue.push({ x: x + 1, y: y });
          queue.push({ x: x - 1, y: y });
          queue.push({ x: x, y: y + 1 });
          queue.push({ x: x, y: y - 1 });
        }
      }
      canvasDomContext.putImageData(imageData, 0, 0);
    }
  }
}

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  hex = hex.match(new RegExp("(.{" + hex.length / 3 + "})", "g"));
  for (let i = 0; i < hex.length; i++) {
    hex[i] = parseInt(hex[i].length == 1 ? hex[i] + hex[i] : hex[i], 16);
  }

  return new Uint8ClampedArray([...hex, 255]);
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
