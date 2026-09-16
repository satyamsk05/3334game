import { RngEngine, ColorType } from './RngEngine';
import { Database } from '../db/database';
import { randomUUID } from 'crypto';

export enum GamePhase {
  BETTING = 'BETTING',
  LOCKED = 'LOCKED',
  SPINNING = 'SPINNING',
  RESULT_SHOW = 'RESULT_SHOW'
}

export interface UserBets {
  blackBet: number;   // in paise (Black 2x)
  redBet: number;     // in paise (Red 3x)
  blueBet: number;    // in paise (Blue 5x)
  greenBet: number;   // in paise (Green 50x)
  purpleBet?: number; // alias
  greyBet?: number;   // alias
  totalBet: number;
}

export interface GameState {
  roundId: string;
  roundNumber: number;
  phase: GamePhase;
  secondsRemaining: number;
  winningSegmentIndex: number;
  userBets: UserBets;
  lastWinAmount: number; // in paise
  recentResults: number[];
}

export interface BetDebitBreakdown {
  depositDebited: number;
  winningDebited: number;
  bonusDebited: number;
  totalDebited: number;
  success: boolean;
}

export interface WalletBalance {
  depositPaise: number;
  winningPaise: number;
  bonusPaise: number;
  totalPaise: number;
}

// In-Memory state for rapid real-time performance + PostgreSQL sync
export class GameLoopEngine {
  private static roundSequence = 1001;
  private static currentRoundId = `RD-${Date.now()}`;
  private static currentPhase = GamePhase.BETTING;
  private static secondsRemaining = 20;
  private static winningSegmentIndex = 0;
  private static recentResults: number[] = [0, 4, 12, 1, 8, 15, 3, 22, 6, 2];
  
  // In-memory active bets for current round
  private static activeBetsMap = new Map<string, UserBets>(); // userId -> UserBets
  private static activeBetDebitsMap = new Map<string, { deposit: number; winning: number; bonus: number }>();
  
  // In-memory balances fallback
  private static inMemoryBalances = new Map<string, WalletBalance>();
  private static inMemoryTransactions = new Map<string, any[]>();

  private static timerJob: NodeJS.Timeout | null = null;
  private static listenerCallbacks: ((state: GameState) => void)[] = [];

  public static start(): void {
    if (GameLoopEngine.timerJob) return;
    
    console.log('🚀 Authoritative Server Game Loop Engine started.');
    GameLoopEngine.runPhaseLoop();
  }

  public static onStateUpdate(callback: (state: GameState) => void): void {
    GameLoopEngine.listenerCallbacks.push(callback);
  }

  private static notifyStateUpdate(): void {
    const state = GameLoopEngine.getSnapshotForUser('default_user');
    GameLoopEngine.listenerCallbacks.forEach((cb) => cb(state));
  }

  private static async runPhaseLoop(): Promise<void> {
    GameLoopEngine.timerJob = setInterval(async () => {
      GameLoopEngine.secondsRemaining--;

      if (GameLoopEngine.secondsRemaining <= 0) {
        await GameLoopEngine.advancePhase();
      }

      GameLoopEngine.notifyStateUpdate();
    }, 1000);
  }

  private static async advancePhase(): Promise<void> {
    switch (GameLoopEngine.currentPhase) {
      case GamePhase.BETTING:
        GameLoopEngine.currentPhase = GamePhase.LOCKED;
        GameLoopEngine.secondsRemaining = 2;
        GameLoopEngine.winningSegmentIndex = RngEngine.generateRandomSegmentIndex();
        break;

      case GamePhase.LOCKED:
        GameLoopEngine.currentPhase = GamePhase.SPINNING;
        GameLoopEngine.secondsRemaining = 5;
        break;

      case GamePhase.SPINNING:
        GameLoopEngine.currentPhase = GamePhase.RESULT_SHOW;
        GameLoopEngine.secondsRemaining = 4;
        await GameLoopEngine.processRoundPayouts();
        break;

      case GamePhase.RESULT_SHOW:
        GameLoopEngine.recentResults = [GameLoopEngine.winningSegmentIndex, ...GameLoopEngine.recentResults.slice(0, 9)];
        GameLoopEngine.roundSequence++;
        GameLoopEngine.currentRoundId = `RD-${Date.now()}`;
        GameLoopEngine.activeBetsMap.clear();
        GameLoopEngine.activeBetDebitsMap.clear();
        GameLoopEngine.currentPhase = GamePhase.BETTING;
        GameLoopEngine.secondsRemaining = 20;
        break;
    }
  }

  public static getSnapshotForUser(userId: string): GameState {
    const userBets = GameLoopEngine.activeBetsMap.get(userId) || {
      greenBet: 0,
      redBet: 0,
      purpleBet: 0,
      greyBet: 0,
      totalBet: 0
    };

    let lastWinAmount = 0;
    if (GameLoopEngine.currentPhase === GamePhase.RESULT_SHOW) {
      const segmentInfo = RngEngine.getSegmentInfo(GameLoopEngine.winningSegmentIndex);
      let betOnWinner = 0;
      if (segmentInfo.color === ColorType.GREEN) betOnWinner = userBets.greenBet;
      if (segmentInfo.color === ColorType.RED) betOnWinner = userBets.redBet;
      if (segmentInfo.color === ColorType.PURPLE) betOnWinner = userBets.purpleBet;
      if (segmentInfo.color === ColorType.GREY) betOnWinner = userBets.greyBet;
      lastWinAmount = Math.round(betOnWinner * segmentInfo.multiplier);
    }

    return {
      roundId: GameLoopEngine.currentRoundId,
      roundNumber: GameLoopEngine.roundSequence,
      phase: GameLoopEngine.currentPhase,
      secondsRemaining: GameLoopEngine.secondsRemaining,
      winningSegmentIndex: GameLoopEngine.winningSegmentIndex,
      userBets,
      lastWinAmount,
      recentResults: [...GameLoopEngine.recentResults]
    };
  }

  // Wallet & Bet Logic (Rule 1 & Rule 4 Invariants)
  public static getUserBalance(userId: string): WalletBalance {
    if (!GameLoopEngine.inMemoryBalances.has(userId)) {
      GameLoopEngine.inMemoryBalances.set(userId, {
        depositPaise: 50000,   // ₹500.00 demo deposit
        winningPaise: 125000,  // ₹1250.00 demo winnings
        bonusPaise: 10000,     // ₹100.00 demo bonus
        totalPaise: 185000
      });
    }
    return GameLoopEngine.inMemoryBalances.get(userId)!;
  }

  public static placeBet(userId: string, color: ColorType, amountPaise: number): { success: boolean; message?: string } {
    if (GameLoopEngine.currentPhase !== GamePhase.BETTING) {
      return { success: false, message: 'Bets are locked for this round.' };
    }

    const balance = GameLoopEngine.getUserBalance(userId);
    if (balance.totalPaise < amountPaise || amountPaise <= 0) {
      return { success: false, message: 'Insufficient balance' };
    }

    // Debit order: deposit -> winnings -> bonus
    let remaining = amountPaise;
    let dep = balance.depositPaise;
    let win = balance.winningPaise;
    let bon = balance.bonusPaise;

    let depDebited = 0;
    let winDebited = 0;
    let bonDebited = 0;

    if (dep >= remaining) {
      depDebited = remaining;
      dep -= remaining;
      remaining = 0;
    } else {
      depDebited = dep;
      remaining -= dep;
      dep = 0;

      if (win >= remaining) {
        winDebited = remaining;
        win -= remaining;
        remaining = 0;
      } else {
        winDebited = win;
        remaining -= win;
        win = 0;

        if (bon >= remaining) {
          bonDebited = remaining;
          bon -= remaining;
          remaining = 0;
        } else {
          return { success: false, message: 'Insufficient bucket funds' };
        }
      }
    }

    // Update Balance
    const newTotal = dep + win + bon;
    GameLoopEngine.inMemoryBalances.set(userId, {
      depositPaise: dep,
      winningPaise: win,
      bonusPaise: bon,
      totalPaise: newTotal
    });

    // Track active bet & debits
    const existing = GameLoopEngine.activeBetsMap.get(userId) || { blackBet: 0, redBet: 0, blueBet: 0, greenBet: 0, totalBet: 0 };
    if (color === ColorType.GREEN) existing.greenBet += amountPaise;
    if (color === ColorType.RED) existing.redBet += amountPaise;
    if (color === ColorType.BLUE || color === ColorType.PURPLE) existing.blueBet += amountPaise;
    if (color === ColorType.BLACK || color === ColorType.GREY) existing.blackBet += amountPaise;
    existing.totalBet += amountPaise;
    GameLoopEngine.activeBetsMap.set(userId, existing);

    const existingDebits = GameLoopEngine.activeBetDebitsMap.get(userId) || { deposit: 0, winning: 0, bonus: 0 };
    existingDebits.deposit += depDebited;
    existingDebits.winning += winDebited;
    existingDebits.bonus += bonDebited;
    GameLoopEngine.activeBetDebitsMap.set(userId, existingDebits);

    // Record Transaction
    GameLoopEngine.recordTransaction(userId, 'BET_PLACED', amountPaise, newTotal, `BET-${Date.now()}`, `Bet placed on ${color}`);

    return { success: true };
  }

  private static async processRoundPayouts(): Promise<void> {
    const winnerSegment = RngEngine.getSegmentInfo(GameLoopEngine.winningSegmentIndex);

    for (const [userId, bets] of GameLoopEngine.activeBetsMap.entries()) {
      let winBetAmount = 0;
      if (winnerSegment.color === ColorType.GREEN) winBetAmount = bets.greenBet;
      if (winnerSegment.color === ColorType.RED) winBetAmount = bets.redBet;
      if (winnerSegment.color === ColorType.BLUE || winnerSegment.color === ColorType.PURPLE) winBetAmount = bets.blueBet;
      if (winnerSegment.color === ColorType.BLACK || winnerSegment.color === ColorType.GREY) winBetAmount = bets.blackBet;

      if (winBetAmount > 0) {
        // 2% service fee: Contract amount = 98% of trade amount
        const contractPaise = Math.round((winBetAmount * 98) / 100);
        const winPayout = Math.round(contractPaise * winnerSegment.multiplier);
        const currentBal = GameLoopEngine.getUserBalance(userId);
        
        // Rule 6 Invariant: Wins credit WINNINGS balance ONLY
        const newWinning = currentBal.winningPaise + winPayout;
        const newTotal = currentBal.depositPaise + newWinning + currentBal.bonusPaise;
        
        GameLoopEngine.inMemoryBalances.set(userId, {
          ...currentBal,
          winningPaise: newWinning,
          totalPaise: newTotal
        });

        GameLoopEngine.recordTransaction(userId, 'WIN_PAYOUT', winPayout, newTotal, `WIN-${Date.now()}`, `Win Payout (${winnerSegment.color} ${winnerSegment.multiplier}x)`);
      }
    }
  }

  public static addDemoCash(userId: string, amountPaise: number, utr: string): WalletBalance {
    const current = GameLoopEngine.getUserBalance(userId);
    const newDeposit = current.depositPaise + amountPaise;
    const newTotal = newDeposit + current.winningPaise + current.bonusPaise;
    const newBal = { ...current, depositPaise: newDeposit, totalPaise: newTotal };
    
    GameLoopEngine.inMemoryBalances.set(userId, newBal);
    GameLoopEngine.recordTransaction(userId, 'DEPOSIT', amountPaise, newTotal, utr || `DEMO-${Date.now()}`, 'Demo Play Chips Top-up');
    return newBal;
  }

  public static requestWithdrawal(userId: string, amountPaise: number, upiId: string): { success: boolean; message: string } {
    const minPaise = 2500;   // ₹25
    const maxPaise = 500000; // ₹5,000

    if (amountPaise < minPaise) return { success: false, message: 'Minimum withdrawal amount is ₹25' };
    if (amountPaise > maxPaise) return { success: false, message: 'Maximum withdrawal amount is ₹5,000 per request' };

    const current = GameLoopEngine.getUserBalance(userId);
    if (amountPaise > current.winningPaise) {
      return { success: false, message: `Insufficient Winnings Balance (Available: ₹${(current.winningPaise / 100).toFixed(2)})` };
    }

    const newWinning = current.winningPaise - amountPaise;
    const newTotal = current.depositPaise + newWinning + current.bonusPaise;
    const newBal = { ...current, winningPaise: newWinning, totalPaise: newTotal };

    GameLoopEngine.inMemoryBalances.set(userId, newBal);
    GameLoopEngine.recordTransaction(userId, 'WITHDRAWAL', amountPaise, newTotal, `WD-${Date.now()}`, `Withdrawal to UPI: ${upiId}`);

    return { success: true, message: `Withdrawal request of ₹${(amountPaise / 100).toFixed(2)} submitted successfully!` };
  }

  public static getTransactions(userId: string): any[] {
    return GameLoopEngine.inMemoryTransactions.get(userId) || [];
  }

  private static recordTransaction(userId: string, type: string, amountPaise: number, balanceAfter: number, refId: string, desc: string): void {
    const txList = GameLoopEngine.inMemoryTransactions.get(userId) || [];
    const tx = {
      id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      type,
      amountPaise,
      balanceAfterPaise: balanceAfter,
      status: 'SUCCESS',
      referenceId: refId,
      description: desc,
      timestamp: Date.now()
    };
    GameLoopEngine.inMemoryTransactions.set(userId, [tx, ...txList]);
  }
}
