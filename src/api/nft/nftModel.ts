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
    status: 'active' | 'sold' | 'expired';
  };
  createdAt: Date;
}

const nfts: NFTData[] = [];

type NFTDataWithoutOwnerBidder = Omit<NFTData, 'ownerAddress' | 'auction.highestBidder'>;

function doesArrayContainTokenId(tokenIdToCheck: number) {
  return nfts.some((nft: NFTData) => nft.tokenId === tokenIdToCheck);
}

export function addNFT(nft: NFTData): void {
  if (doesArrayContainTokenId(nft.tokenId)) {
    throw new Error('Token ID already exists.');
  }
  if (nft.type === 'auction' && nft.auction) {
    nft.auction.status = 'active';
    nft.auction.highestBid = nft.auction.minimumBid;
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
