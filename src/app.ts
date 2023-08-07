import express from 'express';
import dotenv from 'dotenv-safe';
import bodyParser from 'body-parser';
import nftRoutes from './api/nft/nftRoutes';
import auctionRoutes from './api/auctions/auctionRoutes';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/api', nftRoutes);
app.use('/api', auctionRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
