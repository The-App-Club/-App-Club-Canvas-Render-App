const canvasDom = document.querySelector('.reflector');
canvasDom.width = window.innerWidth;
canvasDom.height = window.innerHeight;
const canvasDomContext = canvasDom.getContext('2d');

function loadImageDom(publicURL) {
  return new Promise((resolve, reject) => {
    const imageDom = new Image();
    imageDom.crossOrigin = 'anonymous';
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

function mod(n, m) {
  return ((n % m) + m) % m;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

(async () => {
  let sumX = 0;
  let sumY = 0;
  const maxImageCount = 1000000000;
  const minServedImageNumber = 1;
  const maxServedImageNumber = 50;
  const resized = 0.5;
  const globalAlpha = 1;
  const canvasDomHeight = canvasDom.height;
  const canvasDomWidth = canvasDom.width;

  canvasDomContext.globalAlpha = globalAlpha;

  for (let index = 1; index <= maxImageCount; index++) {
    const {imageDom, imageDomWidth, imageDomHeight} = await loadImageDom(
      `https://storage.googleapis.com/b-backet/texture/${randomNumber(
        minServedImageNumber,
        maxServedImageNumber
      )}.webp`
    );
    if (sumX > canvasDomWidth) {
      break;
    }
    if (sumY > canvasDomHeight) {
      sumX = sumX + imageDomWidth * resized;
      sumY = 0;
    }
    canvasDomContext.drawImage(
      imageDom,
      sumX,
      sumY,
      imageDomWidth * resized,
      imageDomHeight * resized
    );
    sumY = sumY + imageDomHeight * resized;
  }
})();
