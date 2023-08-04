export interface NFTData {
  ownerAddress: string;
  tokenId: number;
  name: string;
  type: 'fixed' | 'auction';
  price?: number;
  auction?: {
    minimumBid?: number;
    highestBid?: number;
    highestBidder?: string;
    bidderSig?: string;
    endDate?: string;
    status: 'active' | 'sold' | 'expired'; // 'active', 'sold', 'expired', etc.
  };
  createdAt: Date;
}

const nfts: NFTData[] = [];

type NFTDataWithoutOwnerBidder = Omit<NFTData, 'ownerAddress' | 'auction.highestBidder'>;

export function addNFT(nft: NFTData): void {
  if (nft.type === 'auction' && nft.auction) {
    nft.auction.status = 'active';
  }
  nft.createdAt = new Date();
  nfts.push(nft);
}

export function getNFTs(): NFTData[] {
  return nfts;
}

export function getNFTsPublic(): NFTDataWithoutOwnerBidder[] {
  const filteredNFTArray: NFTDataWithoutOwnerBidder[] = nfts.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ ownerAddress, auction, ...rest }) => {
      const auctionWithoutHighestBidder = auction ? { ...auction } : undefined;
      delete auctionWithoutHighestBidder?.highestBidder;

      return {
        ...rest,
        auction: auctionWithoutHighestBidder,
      };
    },
  );
  return filteredNFTArray;
}
