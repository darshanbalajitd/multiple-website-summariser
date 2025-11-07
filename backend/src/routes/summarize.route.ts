
import { Router } from 'express';
import { summarizeController } from '../controllers/summarize.controller';

import cors from 'cors';

const router = Router();

// Ensure preflight requests to this route return quickly with CORS headers
// run the cors middleware explicitly for this route so the response includes the CORS headers
router.options('/', cors(), (req, res) => res.sendStatus(204));

router.post('/', summarizeController);

export default router;
``
