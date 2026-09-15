import { Router, Request, Response } from 'express';
import { config } from '../config/env';

export const adminRouter = Router();

// Secret protection middleware
adminRouter.use((req: Request, res: Response, next) => {
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== config.adminSecretKey) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin Secret' });
  }
  next();
});

adminRouter.get('/analytics', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      totalActivePlayers: 142,
      netHouseProfitRupees: 18450.00,
      totalRoundsPlayed: 8940,
      rtpVerifiedPercent: config.rtpTargetPercent
    }
  });
});
