import { Request, Response } from 'express';
import {
  placeBidOnAuctionOrPurchase,
  finishAuctionController,
} from '../../../src/api/auctions/auctionController';
import { getNFTs } from '../../../src/api/nft/nftModel';
import {
  generateSignatureForBidder,
  purchaseNFT,
  completeAuction,
} from '../../../src/api/auctions/auctionService'; // Replace with actual paths

jest.mock('../../../src/api/auctions/auctionService', () => ({
  generateSignatureForBidder: jest.fn(),
  purchaseNFT: jest.fn(),
  completeAuction: jest.fn().mockResolvedValue('mocked-transaction-hash'),
}));

jest.mock('../../../src/api/nft/nftModel', () => ({
  getNFTs: jest.fn(),
}));

describe('Auction Controller', () => {
  describe('placeBidOnAuctionOrPurchase', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = {
        body: {
          tokenId: 123,
          bidderAddress: '0xabc123',
          bidAmount: 100,
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('places a bid on the auction successfully', async () => {
      const mockListings = [
        {
          tokenId: 123,
          type: 'auction',
          auction: {
            highestBid: 90,
            minimumBid: 90,
            status: 'active',
          },
        },
      ];

      (getNFTs as jest.Mock).mockReturnValue(mockListings);
      (generateSignatureForBidder as jest.Mock).mockResolvedValue('mockedSignature');

      await placeBidOnAuctionOrPurchase(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Bid placed on the auction successfully.',
        signature: 'mockedSignature',
      });
    });

    it('makes a purchase for an NFT listed as fixed', async () => {
      const mockListings = [
        {
          tokenId: 123,
          type: 'fixed',
          ownerAddress: '0xabc123',
        },
      ];

      (getNFTs as jest.Mock).mockReturnValue(mockListings);
      (purchaseNFT as jest.Mock).mockResolvedValue('mockedTransactionHash');

      await placeBidOnAuctionOrPurchase(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'NFT purchased.',
        transactionHash: 'mockedTransactionHash',
      });
    });

    it('handles an invalid listing type', async () => {
      const mockListings = [
        {
          tokenId: 123,
          type: 'invalidType',
          ownerAddress: '0xabc123',
        },
      ];

      (getNFTs as jest.Mock).mockReturnValue(mockListings);

      await placeBidOnAuctionOrPurchase(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid listing type.' });
    });

    it('handles error nft not found', async () => {
      (getNFTs as jest.Mock).mockReturnValue([]);
      (generateSignatureForBidder as jest.Mock).mockRejectedValue(
        new Error('Signature creation failed'),
      );

      await placeBidOnAuctionOrPurchase(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Nft not found.' });
    });
  });

  describe('finishAuctionController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = {
        body: {
          tokenId: 123,
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should finish the auction and respond with success', async () => {
      req.body = { tokenId: 123, address: '0xabc123' };

      const mockListings = [
        {
          tokenId: 123,
          type: 'auction',
          ownerAddress: '0xabc123',
          auction: {
            highestBid: 90,
            highestBidder: '0xabc124',
            bidderSig: '0xabc124',
            status: 'active',
          },
        },
      ];

      (getNFTs as jest.Mock).mockReturnValue(mockListings);

      await finishAuctionController(req as Request, res as Response);

      expect(completeAuction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Auction finished successfully.',
        transactionHash: 'mocked-transaction-hash',
      });
    });

    it('should handle errors and respond with an error message', async () => {
      req.body = { tokenId: 123, address: '0xabc123' };

      (completeAuction as jest.Mock).mockRejectedValueOnce(new Error('An error occurred'));
      const mockListings = [
        {
          tokenId: 123,
          type: 'auction',
          ownerAddress: '0xabc123',
          auction: {
            highestBid: 90,
            highestBidder: '0xabc124',
            bidderSig: '0xabc124',
            status: 'active',
          },
        },
      ];

      (getNFTs as jest.Mock).mockReturnValue(mockListings);

      await finishAuctionController(req as Request, res as Response);

      expect(completeAuction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to finish the auction.' });
    });
  });
});
