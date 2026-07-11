// Polyfill browser globals for pdfjs-dist in Node.js environment
if (typeof globalThis !== 'undefined') {
  if (!(globalThis as any).DOMMatrix) {
    (globalThis as any).DOMMatrix = class DOMMatrix {};
  }
  if (!(globalThis as any).ImageData) {
    (globalThis as any).ImageData = class ImageData {};
  }
  if (!(globalThis as any).Path2D) {
    (globalThis as any).Path2D = class Path2D {};
  }
}
if (typeof global !== 'undefined') {
  if (!(global as any).DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix {};
  }
  if (!(global as any).ImageData) {
    (global as any).ImageData = class ImageData {};
  }
  if (!(global as any).Path2D) {
    (global as any).Path2D = class Path2D {};
  }
}

// Polyfill BigInt serialization to prevent JSON.stringify errors
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};
