import crypto from 'crypto';

export enum ColorType {
  GREEN = 'GREEN',
  RED = 'RED',
  BLUE = 'BLUE',
  BLACK = 'BLACK',
  PURPLE = 'PURPLE',
  GREY = 'GREY'
}

export interface SegmentInfo {
  index: number;
  color: ColorType;
  multiplier: number;
}

export class RngEngine {
  public static readonly SEGMENT_COUNT = 32;

  // 32-Segment Wheel Configuration (Green 1/32, Blue 6/32, Red 10/32, Black 15/32)
  public static readonly SEGMENT_COLORS: ColorType[] = [
    ColorType.GREEN,  // Index 0 (1/32) -> 50.0x
    ColorType.BLACK,  // 1
    ColorType.RED,    // 2
    ColorType.BLUE,   // 3
    ColorType.BLACK,  // 4
    ColorType.RED,    // 5
    ColorType.BLUE,   // 6
    ColorType.BLACK,  // 7
    ColorType.RED,    // 8
    ColorType.BLUE,   // 9
    ColorType.BLACK,  // 10
    ColorType.RED,    // 11
    ColorType.BLUE,   // 12
    ColorType.BLACK,  // 13
    ColorType.RED,    // 14
    ColorType.BLUE,   // 15
    ColorType.BLACK,  // 16
    ColorType.RED,    // 17
    ColorType.BLACK,  // 18
    ColorType.RED,    // 19
    ColorType.BLACK,  // 20
    ColorType.RED,    // 21
    ColorType.BLACK,  // 22
    ColorType.RED,    // 23
    ColorType.BLACK,  // 24
    ColorType.RED,    // 25
    ColorType.BLACK,  // 26
    ColorType.BLUE,   // 27
    ColorType.BLACK,  // 28
    ColorType.BLACK,  // 29
    ColorType.BLACK,  // 30
    ColorType.BLACK   // 31
  ];

  public static getMultiplierForColor(color: ColorType): number {
    switch (color) {
      case ColorType.GREEN: return 50.0;
      case ColorType.RED: return 3.0;
      case ColorType.BLUE:
      case ColorType.PURPLE: return 5.0;
      case ColorType.BLACK:
      case ColorType.GREY: return 2.0;
    }
  }

  /**
   * Cryptographically secure random segment index generation (0..31).
   */
  public static generateRandomSegmentIndex(): number {
    return crypto.randomInt(0, RngEngine.SEGMENT_COUNT);
  }

  public static getSegmentInfo(index: number): SegmentInfo {
    const safeIndex = (index % RngEngine.SEGMENT_COUNT + RngEngine.SEGMENT_COUNT) % RngEngine.SEGMENT_COUNT;
    const color = RngEngine.SEGMENT_COLORS[safeIndex];
    return {
      index: safeIndex,
      color,
      multiplier: RngEngine.getMultiplierForColor(color)
    };
  }
}
