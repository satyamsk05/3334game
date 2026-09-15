import { Router, Request, Response } from 'express';
import { GameLoopEngine } from '../game/GameLoopEngine';
import { TelegramBotService } from '../services/TelegramBotService';

export const walletRouter = Router();

walletRouter.get('/transactions', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'USR-304';
  const transactions = GameLoopEngine.getTransactions(userId);
  res.json({ success: true, data: transactions });
});

walletRouter.post('/deposit', async (req: Request, res: Response) => {
  const { userId = 'USR-304', amountRupees, amountPaise, utr = '' } = req.body;
  const paise = amountPaise ? parseInt(amountPaise, 10) : Math.round(parseFloat(amountRupees || '0') * 100);

  if (paise <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid deposit amount' });
  }

  const updatedBalance = GameLoopEngine.addDemoCash(userId, paise, utr);

  // Send Telegram notification
  await TelegramBotService.sendAlert(`💰 *Deposit Request Submitted*\nUser: \`${userId}\`\nAmount: ₹${(paise / 100).toFixed(2)}\nUTR: \`${utr || 'DEMO'}\``);

  res.json({
    success: true,
    message: `Demo play chips of ₹${(paise / 100).toFixed(2)} credited!`,
    data: { walletBalance: updatedBalance }
  });
});

walletRouter.post('/withdraw', async (req: Request, res: Response) => {
  const { userId = 'USR-304', amountRupees, amountPaise, upiId = '' } = req.body;
  const paise = amountPaise ? parseInt(amountPaise, 10) : Math.round(parseFloat(amountRupees || '0') * 100);

  if (!upiId) {
    return res.status(400).json({ success: false, message: 'Please enter a valid UPI ID' });
  }

  const result = GameLoopEngine.requestWithdrawal(userId, paise, upiId);
  if (!result.success) {
    return res.status(400).json({ success: false, message: result.message });
  }

  // Send Telegram notification
  await TelegramBotService.sendAlert(`💸 *Withdrawal Requested*\nUser: \`${userId}\`\nAmount: ₹${(paise / 100).toFixed(2)}\nUPI ID: \`${upiId}\``);

  const updatedBalance = GameLoopEngine.getUserBalance(userId);
  res.json({
    success: true,
    message: result.message,
    data: { walletBalance: updatedBalance }
  });
});
