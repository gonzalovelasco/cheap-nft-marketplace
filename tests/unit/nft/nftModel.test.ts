import { NFTData, addNFT, getNFTs } from '../../../src/api/nft/nftModel';

describe('NFT Model', () => {
  let nftFixed: NFTData;
  let nftAuction: NFTData;

  beforeEach(() => {
    nftFixed = {
      ownerAddress: '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3fd',
      tokenId: 123,
      name: 'My NFT',
      type: 'fixed',
      price: 1000000000000000000,
      auction: undefined,
      createdAt: new Date(),
    };

    nftAuction = {
      ownerAddress: '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3fd',
      tokenId: 456,
      name: 'Another NFT',
      type: 'auction',
      price: undefined,
      auction: {
        minimumBid: 5000,
        endDate: '2023-12-31T23:59:59Z',
        highestBid: 6000,
        highestBidder: '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3fd',
        bidderSig: '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3fd',
        status: 'active',
      },
      createdAt: new Date(),
    };
  });

  it('should add a fixed type NFT', () => {
    addNFT(nftFixed);
    const nfts = getNFTs();
    expect(nfts.length).toBe(1);
    expect(nfts[0]).toEqual(nftFixed);
  });

  it('should add an auction type NFT', () => {
    addNFT(nftAuction);
    const nfts = getNFTs();
    expect(nfts.length).toBe(2);
    expect(nfts[1]).toEqual(nftAuction);
  });
});
