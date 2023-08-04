import express from 'express';
import { listNFT, getNFTList } from './nftController';

const router = express.Router();

router.post('/nfts', listNFT);
router.get('/nfts', getNFTList);

export default router;
