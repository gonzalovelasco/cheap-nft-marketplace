import request from 'supertest';
import app from '../../src/app'; // Replace with the path to your Express app file

describe('NFT Routes', () => {
  it('should list an NFT successfully with price fixed', async () => {
    const nftData = {
      collectionAddress: '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3ff',
      ownerAddress: '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3fd',
      tokenId: 1,
      name: 'My NFT fixed',
      type: 'fixed',
      price: 100,
    };

    const response = await request(app).post('/api/nfts').send(nftData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'NFT listed successfully.' });
  });

  it('should list an NFT successfully with auction', async () => {
    const nftData = {
      collectionAddress: '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3ff',
      ownerAddress: '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3fd',
      tokenId: 1,
      name: 'My NFT fixed',
      type: 'auction',
      auction: {
        minimumBid: 100,
        endDate: new Date(),
      },
    };

    const response = await request(app).post('/api/nfts').send(nftData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'NFT listed successfully.' });
  });

  it('should fetch the NFT list successfully', async () => {
    const response = await request(app).get('/api/nfts');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toHaveLength(2);
  });
});
