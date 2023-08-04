import Web3 from 'web3';
import dotenv from 'dotenv-safe';
import marketplace from './contracts/marketPlaceABI';
import ERC20 from './contracts/mockERC20ABI';
import ERC721 from './contracts/mockERC721ABI';

dotenv.config();

const ERC20_TOKEN_ADDRESS = process.env.ERC20_TOKEN_ADDRESS;
const ERC721_TOKEN_ADDRESS = process.env.ERC721_TOKEN_ADDRESS;
const web3 = new Web3(process.env.SEPOLIA_RPC_URL);
const methods = new web3.eth.Contract(marketplace, process.env.SEPOLIA_MARKETPLACE_ADDRESS).methods;
interface AuctionData {
  collectionAddress: string;
  erc20Address: string;
  tokenId: string | number | bigint;
  bid: string | number | bigint;
}
interface SignatureData {
  messageHash: string;
  privateKey: string;
}
export async function approveERC20(amount: number, address: string): Promise<void> {
  const contractInstance = new web3.eth.Contract(ERC20, ERC20_TOKEN_ADDRESS);

  const amountToMint = web3.utils.toWei(amount, 'ether');
  const account = web3.eth.accounts.privateKeyToAccount(address);

  const recipientAddress = account.address;
  const nonce = await web3.eth.getTransactionCount(recipientAddress);
  const block = await web3.eth.getBlock('latest');
  const gasLimit = Math.round(Number(block.gasLimit) / block.transactions.length);
  const tx = {
    nonce: nonce,
    from: recipientAddress,
    to: ERC20_TOKEN_ADDRESS,
    gas: gasLimit,
    gasPrice: await web3.eth.getGasPrice(),
    data: contractInstance.methods.mint(recipientAddress, amountToMint).encodeABI(),
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
  await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

export async function approveERC721(tokenId: number, address: string): Promise<void> {
  const contractInstance = new web3.eth.Contract(ERC721, ERC721_TOKEN_ADDRESS);
  const account = web3.eth.accounts.privateKeyToAccount(address);

  const recipientAddress = account.address;
  const nonce = await web3.eth.getTransactionCount(recipientAddress);
  const block = await web3.eth.getBlock('latest');
  const gasLimit = Math.round(Number(block.gasLimit) / block.transactions.length);
  const tx = {
    nonce: nonce,
    from: recipientAddress,
    to: ERC721_TOKEN_ADDRESS,
    gas: gasLimit, // Adjust the gas value if needed
    gasPrice: await web3.eth.getGasPrice(),
    data: contractInstance.methods
      .approve(process.env.SEPOLIA_MARKETPLACE_ADDRESS as string, tokenId)
      .encodeABI(),
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
  await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
}

export async function finishAuction(
  auctionData: AuctionData,
  bidderSig: string,
  ownerApprovedSig: string,
  ownerAddress: string,
  bidderAddress: string,
): Promise<string> {
  await approveERC20(auctionData.bid as number, bidderAddress);
  await approveERC721(auctionData.tokenId as number, ownerAddress);

  const account = web3.eth.accounts.privateKeyToAccount(ownerAddress);
  const fromAddress = account.address;
  const nonce = await web3.eth.getTransactionCount(fromAddress);
  const block = await web3.eth.getBlock('latest');
  const gasLimit = Math.round(Number(block.gasLimit) / block.transactions.length);
  const methodData = methods.finishAuction(auctionData, bidderSig, ownerApprovedSig).encodeABI();
  const tx = {
    nonce: nonce,
    to: process.env.SEPOLIA_MARKETPLACE_ADDRESS,
    gas: gasLimit,
    gasPrice: await web3.eth.getGasPrice(),
    data: methodData,
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
  const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  const transactionHash = txReceipt.transactionHash.toString();
  return transactionHash;
}

export function createMessageHash({
  collectionAddress,
  erc20Address,
  tokenId,
  bid,
}: AuctionData): string {
  const bidMessageHash = web3.utils.soliditySha3(
    { type: 'address', value: collectionAddress },
    { type: 'address', value: erc20Address },
    { type: 'uint256', value: tokenId },
    { type: 'uint256', value: bid },
  );
  if (!bidMessageHash) throw new Error('Bid message hash could not be generated.');
  return bidMessageHash;
}

export function createBidderHash(bidderSig: string): string {
  const bidMessageHash = web3.utils.soliditySha3(bidderSig);
  if (!bidMessageHash) throw new Error('Bid message hash could not be generated.');
  return bidMessageHash;
}

export function getAddressFromPrivateKey(privateKey: string): string {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  return account.address;
}

export async function createSignature({ messageHash, privateKey }: SignatureData): Promise<string> {
  const signedMessage = await web3.eth.accounts.sign(messageHash, privateKey);
  return signedMessage.signature;
}
