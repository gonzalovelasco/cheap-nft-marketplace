import express from 'express';
import dotenv from 'dotenv-safe';
import bodyParser from 'body-parser';
import nftRoutes from './api/nft/nftRoutes';

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/api', nftRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
