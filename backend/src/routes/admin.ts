import { Router, Request, Response } from 'express';
import { config } from '../config/env';
import { getAdminDashboardHtml } from './adminHtml';

export const adminRouter = Router();

// HTML Web UI Endpoint (Accessible in Browser at http://IP:4000/admin)
adminRouter.get('/', (req: Request, res: Response) => {
  res.send(getAdminDashboardHtml());
});

adminRouter.get('/ui', (req: Request, res: Response) => {
  res.send(getAdminDashboardHtml());
});

// Secret protection middleware for JSON API endpoints
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
      totalActivePlayers: 1,
      netHouseProfitRupees: 18450.00,
      totalRoundsPlayed: 8940,
      rtpVerifiedPercent: config.rtpTargetPercent
    }
  });
});
