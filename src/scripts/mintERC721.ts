import Web3 from 'web3';
import dotenv from 'dotenv-safe';
import contractABI from '../blockchain/contracts/mockERC721ABI';

dotenv.config();

const contractAddress = process.env.ERC721_TOKEN_ADDRESS;
const web3 = new Web3(process.env.SEPOLIA_RPC_URL);

async function main() {
  const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
  const account = web3.eth.accounts.privateKeyToAccount(process.env.SELLER_PRIVATE_KEY as string);

  const recipientAddress = account.address;
  const nonce = await web3.eth.getTransactionCount(recipientAddress);
  const block = await web3.eth.getBlock('latest');
  const gasLimit = Math.round(Number(block.gasLimit) / block.transactions.length);
  const tx = {
    nonce: nonce,
    from: recipientAddress,
    to: contractAddress,
    gas: gasLimit, // Adjust the gas value if needed
    gasPrice: await web3.eth.getGasPrice(),
    data: contractInstance.methods.mint(recipientAddress).encodeABI(),
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
  console.log('SignedTx:', signedTx);
  const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log('Transaction receipt:', txReceipt);
}

main();
