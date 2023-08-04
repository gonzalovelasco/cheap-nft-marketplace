import { Request, Response } from 'express';
import { addNFT, getNFTs, NFTData } from './nftModel';
import { nftDataSchema } from './nftValidator';

export function listNFT(req: Request, res: Response): void {
  try {
    const nftData: NFTData = req.body;
    const { error } = nftDataSchema.validate(nftData);
    if (error) {
      throw new Error('Invalid NFT data.');
    }
    // TODO Validate the token owner
    // TODO Validate the collection address
    addNFT(nftData);

    res.status(200).json({ message: 'NFT listed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to list NFT.' });
  }
}

export function getNFTList(req: Request, res: Response): void {
  try {
    const nfts = getNFTs();
    res.status(200).json(nfts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch NFT list.' });
  }
}
