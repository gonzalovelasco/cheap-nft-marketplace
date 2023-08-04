import { Request, Response } from 'express';
import { finishAuctionSchema, bidAuctionSchema } from './auctionValidator';
import { getNFTs } from '../nft/nftModel';
import {
  finishAuction,
  createMessageHash,
  createSignature,
  createBidderHash,
} from '../../blockchain'; // Import the contract ABI

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
    }

    const messageHash = createMessageHash({
      tokenId,
      erc20Address: process.env.ERC20_TOKEN_ADDRESS as string,
      collectionAddress: process.env.ERC721_TOKEN_ADDRESS as string,
      bid: bidAmount,
    });

    const signature = await createSignature({ messageHash, privateKey: bidderAddress });
    if (listing.type === 'auction' && listing.auction) {
      listing.auction.bidderSig = signature;
    } else if (listing.type === 'fixed') {
      const bidderHash = createBidderHash(signature);
      const signatureOwner = await createSignature({
        messageHash: bidderHash,
        privateKey: listing.ownerAddress,
      });
      const auctionData = {
        tokenId,
        erc20Address: process.env.ERC20_TOKEN_ADDRESS as string,
        collectionAddress: process.env.ERC721_TOKEN_ADDRESS as string,
        bid: bidAmount,
      };

      await finishAuction(
        auctionData,
        signature,
        signatureOwner,
        bidderAddress,
        listing.ownerAddress,
      );
    }
    res.status(200).json({ message: 'Bid placed on the auction successfully.' });
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

    const { tokenId } = req.body;
    const listings = getNFTs();
    const listing = listings.find((item) => item.tokenId === tokenId);

    if (listing?.type !== 'auction' || !listing?.auction || !listing.auction?.highestBidder) {
      res.status(400).json({ error: 'No valid bids on the auction.' });
      return;
    }

    const { highestBid, bidderSig, highestBidder } = listing.auction;
    if (!bidderSig || !highestBid) {
      res.status(400).json({ error: 'No valid bids on the auction.' });
      return;
    }
    const bidderHash = createBidderHash(bidderSig);
    const signatureOwner = await createSignature({
      messageHash: bidderHash,
      privateKey: bidderHash,
    });
    const auctionData = {
      tokenId,
      erc20Address: process.env.ERC20_TOKEN_ADDRESS as string,
      collectionAddress: process.env.ERC721_TOKEN_ADDRESS as string,
      bid: highestBid,
    };

    await finishAuction(
      auctionData,
      bidderSig,
      signatureOwner,
      highestBidder,
      listing.ownerAddress,
    );

    res.status(200).json({ message: 'Auction finished successfully.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to finish the auction.' });
  }
}
