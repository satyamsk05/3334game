import crypto from 'crypto';

export enum ColorType {
  GREEN = 'GREEN',
  RED = 'RED',
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

  // 32-Segment Wheel Configuration (Matching 95% RTP Target)
  public static readonly SEGMENT_COLORS: ColorType[] = [
    ColorType.GREEN,  // Index 0 (1/32) -> 30.0x
    ColorType.GREY,   // 1
    ColorType.RED,    // 2
    ColorType.PURPLE, // 3
    ColorType.GREY,   // 4
    ColorType.RED,    // 5
    ColorType.PURPLE, // 6
    ColorType.GREY,   // 7
    ColorType.RED,    // 8
    ColorType.PURPLE, // 9
    ColorType.GREY,   // 10
    ColorType.RED,    // 11
    ColorType.PURPLE, // 12
    ColorType.GREY,   // 13
    ColorType.RED,    // 14
    ColorType.PURPLE, // 15
    ColorType.GREY,   // 16
    ColorType.PURPLE, // 17
    ColorType.GREY,   // 18
    ColorType.PURPLE, // 19
    ColorType.GREY,   // 20
    ColorType.PURPLE, // 21
    ColorType.GREY,   // 22
    ColorType.PURPLE, // 23
    ColorType.GREY,   // 24
    ColorType.PURPLE, // 25
    ColorType.GREY,   // 26
    ColorType.RED,    // 27
    ColorType.GREY,   // 28
    ColorType.GREY,   // 29
    ColorType.GREY,   // 30
    ColorType.GREY    // 31
  ];

  public static getMultiplierForColor(color: ColorType): number {
    switch (color) {
      case ColorType.GREEN: return 30.0;
      case ColorType.RED: return 5.06;
      case ColorType.PURPLE: return 3.04;
      case ColorType.GREY: return 2.03;
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
