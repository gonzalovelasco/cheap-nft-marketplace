import { Request, Response } from 'express';
import { placeBidOnAuctionOrPurchase } from '../../../src/api/auctions/auctionController';
import { getNFTs } from '../../../src/api/nft/nftModel';
import { generateSignatureForBidder, purchaseNFT } from '../../../src/api/auctions/auctionService'; // Replace with actual paths

jest.mock('../../../src/api/auctions/auctionService', () => ({
  generateSignatureForBidder: jest.fn(),
  purchaseNFT: jest.fn(),
}));

jest.mock('../../../src/api/nft/nftModel', () => ({
  getNFTs: jest.fn(),
}));

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
        ownerAddress: '0xowner',
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
        ownerAddress: '0xowner',
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
