function loadImageDom(publicURL) {
  return new Promise((resolve, reject) => {
    const imageDom = new Image();
    imageDom.crossOrigin = "anonymous";
    imageDom.onload = (event) => {
      resolve({
        imageDom: imageDom,
        imageDomWidth: imageDom.width,
        imageDomHeight: imageDom.height,
      });
    };
    imageDom.onerror = (event) => {
      reject(event);
    };
    imageDom.src = publicURL;
  });
}

function reflectImage2Canvas(imageDom, imageDomWidth, imageDomHeight) {
  // https://github.com/GRI-Inc/App-Club-Scroll-Telling-App/blob/main/app/src/components/chroma-key-slide/index.js
  const canvasDom = document.querySelector(`.reflector`);
  canvasDom.width = imageDomWidth;
  canvasDom.height = imageDomHeight;
  const canvasContext = canvasDom.getContext("2d");
  canvasContext.drawImage(imageDom, 0, 0, imageDomWidth, imageDomHeight);
}

function extractSihouetteBlack(
  transparentColorInfo,
  colorDistance,
  imageDomWidth,
  imageDomHeight
) {
  chromaKey(transparentColorInfo, colorDistance, imageDomWidth, imageDomHeight);
}

function getColorDistance(rgb1, rgb2) {
  // https://ja.wikipedia.org/wiki/%E3%83%A6%E3%83%BC%E3%82%AF%E3%83%AA%E3%83%83%E3%83%89%E8%B7%9D%E9%9B%A2
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
  );
}

function chromaKey(
  chromaKeyColor,
  colorDistance,
  imageDomWidth,
  imageDomHeight
) {
  const canvasDom = document.querySelector(`.reflector`);
  const canvasContext = canvasDom.getContext("2d");
  const imageData = canvasContext.getImageData(
    0,
    0,
    imageDomWidth,
    imageDomHeight
  );
  const data = imageData.data;
  for (let index = 0; index < data.length; index++) {
    const rgb = {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
    };
    if (getColorDistance(chromaKeyColor, rgb) < colorDistance) {
      // alpha値を0にすることで見えなくする
      data[index + 3] = 10;
    }
  }
  // 書き換えたdataをimageDataにもどし、描画する
  // https://stackoverflow.com/questions/11098419/imagedata-data-assignment-in-strict-mode
  canvasContext.putImageData(imageData, 0, 0);
}

function convertObjectToJson(targetObject) {
  return JSON.stringify(targetObject);
}

function convertJsonToObject(targetJson) {
  return JSON.parse(targetJson);
}

function disconnectObserve(targetObject) {
  return convertJsonToObject(convertObjectToJson(targetObject));
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255) {
    throw "Invalid color component";
  }
  return ((r << 16) | (g << 8) | b).toString(16);
}

function drawLine(dotDomColor) {
  const contentDom = document.querySelector(`.content`);
  const canvasDom = document.querySelector(`.reflector`);
  const canvasContext = canvasDom.getContext("2d");
  const { width, height } = {
    ...disconnectObserve(canvasDom.getBoundingClientRect()),
  };
  let seq = 0;
  let dotId = 0;
  let throttle = 9;
  for (let i = 0; i <= width; i++) {
    for (let j = 0; j <= height; j++) {
      const x = i;
      const y = j;
      const pixcelListPerMousePoint = canvasContext.getImageData(
        x,
        y,
        1,
        1
      ).data;
      const hexColor =
        "#" +
        (
          "000000" +
          rgbToHex(
            pixcelListPerMousePoint[0],
            pixcelListPerMousePoint[1],
            pixcelListPerMousePoint[2]
          )
        ).slice(-6);
      if (hexColor !== "#000000" && !hexColor.match(/^#f/)) {
        seq++;
        if (mod(seq, throttle) + 1 === throttle) {
          const div = document.createElement("div");
          dotId++;
          div.setAttribute("id", `dot-${dotId}`);
          div.style.position = "absolute";
          div.style.top = `${y}px`;
          div.style.left = `${x}px`;
          div.setAttribute("data-top", y);
          div.setAttribute("data-left", x);
          div.style.width = `3px`;
          div.style.height = `3px`;
          div.style.borderRadius = `50%`;
          div.style.backgroundColor = `${dotDomColor}`;
          contentDom.appendChild(div);
        }
      }
    }
  }
  const startDotDom = document.querySelector(`#dot-${1}`);
  startDotDom.style.backgroundColor = `red`;
  const endDotDom = document.querySelector(
    `#dot-${Math.floor(seq / throttle)}`
  );
  endDotDom.style.backgroundColor = `red`;
}

function tearDown() {
  const canvasDom = document.querySelector(`.reflector`);
  canvasDom.style.visibility = `hidden`;
}

(async () => {
  const dotDomColor = `#123456`;
  const transparentColorInfo = { r: 0, g: 0, b: 0 };
  const colorDistance = 12;
  const willFilledImageURL = `./images/sharp-7.978333-cat-landscape-00_00_03.000-resize-600w-337h.webp`;
  const { imageDom, imageDomWidth, imageDomHeight } = await loadImageDom(
    willFilledImageURL
  );
  reflectImage2Canvas(imageDom, imageDomWidth, imageDomHeight);

  extractSihouetteBlack(
    transparentColorInfo,
    colorDistance,
    imageDomWidth,
    imageDomHeight
  );

  drawLine(dotDomColor);

  tearDown();
})();
