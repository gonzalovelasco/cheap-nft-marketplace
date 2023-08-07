import express from 'express';
import { listNFT, getNFTList } from './nftController';

const router = express.Router();

router.post('/nft', listNFT);
router.get('/nft', getNFTList);

export default router;
