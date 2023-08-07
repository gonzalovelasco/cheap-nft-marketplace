import {
  createMessageHash,
  createSignature,
  createBidderHash,
  finishAuction,
} from '../../blockchain'; // Import the contract ABI

const ERC20_TOKEN_ADDRESS = process.env.ERC20_TOKEN_ADDRESS as string;
const ERC721_TOKEN_ADDRESS = process.env.ERC721_TOKEN_ADDRESS as string;

export async function generateSignatureForBidder(
  tokenId: number,
  bidderAddress: string,
  bidAmount: number,
): Promise<string> {
  const messageHash = createMessageHash({
    tokenId,
    erc20Address: ERC20_TOKEN_ADDRESS,
    collectionAddress: ERC721_TOKEN_ADDRESS,
    bid: bidAmount,
  });

  return createSignature({ messageHash, privateKey: bidderAddress });
}

export async function purchaseNFT(
  tokenId: number,
  bidderAddress: string,
  bidAmount: number,
  ownerAddress: string,
): Promise<string> {
  const signature = await generateSignatureForBidder(tokenId, bidderAddress, bidAmount);
  return completeAuction(tokenId, signature, bidAmount, bidderAddress, ownerAddress);
}

export async function completeAuction(
  tokenId: number,
  bidderSig: string,
  highestBid: number,
  highestBidder: string,
  ownerAddress: string,
): Promise<string> {
  const bidderHash = createBidderHash(bidderSig);
  const signatureOwner = await createSignature({
    messageHash: bidderHash,
    privateKey: bidderHash,
  });

  const auctionData = {
    tokenId,
    erc20Address: ERC20_TOKEN_ADDRESS,
    collectionAddress: ERC721_TOKEN_ADDRESS,
    bid: highestBid,
  };

  return finishAuction(auctionData, bidderSig, signatureOwner, highestBidder, ownerAddress);
}
