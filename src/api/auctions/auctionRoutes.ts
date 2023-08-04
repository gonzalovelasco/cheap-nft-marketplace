import express from 'express';
import { finishAuctionController, placeBidOnAuctionOrPurchase } from './auctionController';

const router = express.Router();

router.post('/auctions/bid', placeBidOnAuctionOrPurchase);
router.post('/auctions/finish', finishAuctionController);

export default router;
