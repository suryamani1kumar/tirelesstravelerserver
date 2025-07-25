import { Router } from 'express';

const router = Router();

// Example route
router.post('/v1/oauth2/token', (req, res) => {
  res.send('User route root');
});



export default router;
