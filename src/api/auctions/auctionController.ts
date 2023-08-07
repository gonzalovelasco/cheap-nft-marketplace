import { Request, Response } from 'express';
import { finishAuctionSchema, bidAuctionSchema } from './auctionValidator';
import { getNFTs } from '../nft/nftModel';
import { completeAuction, generateSignatureForBidder, purchaseNFT } from './auctionService';

export async function placeBidOnAuctionOrPurchase(req: Request, res: Response): Promise<void> {
  try {
    const { error } = bidAuctionSchema.validate(req.body);
    if (error) {
      throw new Error('Invalid request data.');
    }
    const { tokenId, bidderAddress, bidAmount } = req.body;

    const listings = getNFTs();
    const listing = listings.find((item) => item.tokenId === tokenId);

    if (!listing) {
      res.status(404).json({ error: 'Nft not found.' });
      return;
    }

    if (listing.type === 'auction') {
      if (!listing.auction?.highestBid || bidAmount <= listing.auction.highestBid) {
        res.status(400).json({ error: 'Invalid bid amount.' });
        return;
      }

      listing.auction.highestBid = bidAmount;
      listing.auction.highestBidder = bidderAddress;
      const signature = await generateSignatureForBidder(tokenId, bidderAddress, bidAmount);
      listing.auction.bidderSig = signature;
      listing.auction.status = 'active';
      res.status(200).json({ message: 'Bid placed on the auction successfully.', signature });
    } else if (listing.type === 'fixed') {
      const transactionHash = await purchaseNFT(
        tokenId,
        bidderAddress,
        bidAmount,
        listing.ownerAddress,
      );
      res.status(200).json({ message: 'NFT purchased.', transactionHash });
    } else {
      res.status(400).json({ error: 'Invalid listing type.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place bid on the auction.' });
  }
}

export async function finishAuctionController(req: Request, res: Response) {
  try {
    const { error } = finishAuctionSchema.validate(req.body);
    if (error) {
      throw new Error('Invalid request data.');
    }

    const { tokenId, address } = req.body;
    const listings = getNFTs();
    const listing = listings.find((item) => item.tokenId === tokenId);
    if (address !== listing?.ownerAddress) {
      res.status(400).json({ error: 'Only the owner can finish the auction.' });
      return;
    }
      res.status(400).json({ error: 'No valid bids on the auction.' });
      return;
    }

    const { highestBid, bidderSig, highestBidder } = listing.auction;
    if (!bidderSig || !highestBid) {
      res.status(400).json({ error: 'No valid bids on the auction.' });
      return;
    }
    const transactionHash = await completeAuction(
      tokenId,
      bidderSig,
      highestBid,
      highestBidder,
      listing.ownerAddress,
    );
    listing.auction.status = 'sold';
    res.status(200).json({ message: 'Auction finished successfully.', transactionHash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to finish the auction.' });
  }
}
