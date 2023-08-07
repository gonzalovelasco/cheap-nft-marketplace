import express from 'express';
import { finishAuctionController, placeBidOnAuctionOrPurchase } from './auctionController';

const router = express.Router();

router.post('/auction/bidOrPurchase', placeBidOnAuctionOrPurchase);
router.post('/auction/finish', finishAuctionController);

export default router;
