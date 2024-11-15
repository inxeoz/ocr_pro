import cv from 'opencv.js';
import Tesseract from 'tesseract.js';

export const processContours = (imageSrc) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const src = cv.imread(canvas);
      const dst = new cv.Mat();
      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
      cv.Canny(src, dst, 50, 100, 3, false);
      
      cv.imshow(canvas, dst);
      const contouredImage = canvas.toDataURL();
      src.delete();
      dst.delete();

      resolve(contouredImage);
    };
  });
};

export const extractText = (imageSrc) => {
  return Tesseract.recognize(imageSrc, 'eng')
    .then(({ data: { text } }) => text)
    .catch(() => 'Error extracting text');
};
