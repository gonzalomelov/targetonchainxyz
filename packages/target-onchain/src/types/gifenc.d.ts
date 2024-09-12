declare module 'gifenc' {
  interface Stream {
    reset(): void;
    writeByte(byte: number): void;
    writeBytes(bytes: number[]): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    buffer: ArrayBuffer;
  }

  interface GIFEncoderOptions {
    initialCapacity?: number;
    auto?: boolean;
  }

  interface WriteFrameOptions {
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    palette?: Uint8Array; // Corrected to Uint8Array
    repeat?: number;
    colorDepth?: number;
    dispose?: number;
    first?: boolean;
  }

  function GIFEncoder(options?: GIFEncoderOptions): {
    reset(): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    buffer: ArrayBuffer;
    stream: Stream;
    writeHeader(): void;
    writeFrame(
      index: Uint8ClampedArray,
      width: number,
      height: number,
      opts?: WriteFrameOptions,
    ): void;
  };

  function quantize(imageData: Uint8ClampedArray, colors: number): Uint8Array;

  function applyPalette(
    imageData: Uint8ClampedArray,
    palette: Uint8Array,
  ): Uint8ClampedArray;

  function prequantize(imageData: Uint8ClampedArray): Uint8ClampedArray;

  function nearestColorIndex(color: Uint8Array, palette: Uint8Array): number;

  function nearestColor(color: Uint8Array, palette: Uint8Array): Uint8Array;

  function nearestColorIndexWithDistance(
    color: Uint8Array,
    palette: Uint8Array,
  ): [number, number];

  function snapColorsToPalette(
    imageData: Uint8ClampedArray,
    palette: Uint8Array,
  ): Uint8ClampedArray;

  export {
    applyPalette,
    GIFEncoder,
    nearestColor,
    nearestColorIndex,
    nearestColorIndexWithDistance,
    prequantize,
    quantize,
    snapColorsToPalette,
  };

  export default GIFEncoder;
}
