import { Router, Request, Response } from 'express';
import { GameLoopEngine } from '../game/GameLoopEngine';
import { ColorType } from '../game/RngEngine';

export const gameRouter = Router();

gameRouter.get('/current', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'USR-304';
  const snapshot = GameLoopEngine.getSnapshotForUser(userId);
  res.json({ success: true, data: snapshot });
});

gameRouter.post('/place-bet', (req: Request, res: Response) => {
  const { userId = 'USR-304', color, amountRupees, amountPaise } = req.body;
  
  const paise = amountPaise ? parseInt(amountPaise, 10) : Math.round(parseFloat(amountRupees || '0') * 100);
  
  if (!color || !Object.values(ColorType).includes(color)) {
    return res.status(400).json({ success: false, message: 'Invalid color specified' });
  }

  const result = GameLoopEngine.placeBet(userId, color as ColorType, paise);
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.message });
  }

  const updatedSnapshot = GameLoopEngine.getSnapshotForUser(userId);
  const updatedBalance = GameLoopEngine.getUserBalance(userId);

  res.json({
    success: true,
    data: {
      gameState: updatedSnapshot,
      walletBalance: updatedBalance
    }
  });
});
