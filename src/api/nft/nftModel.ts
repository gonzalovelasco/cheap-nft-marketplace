export interface NFTData {
  collectionAddress: string;
  ownerAddress: string;
  tokenId: number;
  name: string;
  type: 'fixed' | 'auction';
  price?: number;
  auction?: {
    minimumBid?: number;
    highestBid?: number;
    highestBidder?: string;
    erc20Address?: string;
    bidderSig?: string;
    endDate?: string;
    status: 'active' | 'sold' | 'expired'; // 'active', 'sold', 'expired', etc.
  };
  createdAt: Date;
}

const nfts: NFTData[] = [];

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
