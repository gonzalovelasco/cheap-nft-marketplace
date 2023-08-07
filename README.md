# Cheap NFT Marketplace

## Description

Simple node backend server that stores an in-memory list of listings, and serves those listings through a REST API, and assists users in connecting, agreeing on terms through bidding to then settle their trade securely using the Settler contract.

## Resources

[Settler Contract](https://sepolia.etherscan.io/address/0x597c9bc3f00a4df00f85e9334628f6cdf03a1184#code)\
[MockERC20](https://sepolia.etherscan.io/address/0xbd65c58d6f46d5c682bf2f36306d461e3561c747#code)\
[MockERC721](https://sepolia.etherscan.io/address/0xfce9b92ec11680898c7fe57c4ddcea83aeaba3ff#code)\

## Getting Started

1. Install Node.
2. Install packages `npm install` in the root directory.
3. Configure env vars with default values like in `.env.example`.
4. Run project: `npm run start`.
5. Run tests: `npm run test`.

## Mint ERC20

1. Check that the variable `BUYER_PRIVATE_KEY` is set
2. Run project: `npm run mint:erc20`.

## Mint ERC721

1. Check that the variable `SELLER_PRIVATE_KEY` is set
2. Run project: `npm run mint:erc721`.

# NFT API Endpoints Documentation

This documentation outlines the endpoints available in the NFT API module.

## POST /api/nft

List a new NFT.

### Request

- **Method:** `POST`
- **Path:** `/api/nft`
- **Body Parameters:**
  - `nftData`: Object containing NFT data.
    - `ownerAddress` (string, required): Address of the NFT owner.
    - `tokenId` (integer, required): ID of the NFT token.
    - `name` (string, required): Name of the NFT.
    - `type` (string, required): Type of the NFT, must be either `'fixed'` or `'auction'`.
    - `price` (number, optional): Price of the NFT. Required if the type is `'fixed'`.
    - `auction` (object, optional): Auction details. Required if the type is `'auction'`.
      - `minimumBid` (number, required): Minimum bid amount for the auction.
      - `endDate` (string, required): End date of the auction in ISO 8601 format.

### Response

- **Success Response:**

  - **Status:** 200 OK
  - **Body:** `{ message: 'NFT listed successfully.' }`

- **Error Response:**
  - **Status:** 400 Bad Request
  - **Body:** `{ error: 'Failed to list NFT.' }`

## GET /api/nft/list

Retrieve a list of public NFTs.

### Request

- **Method:** `GET`
- **Path:** `/api/nft`

### Response

- **Success Response:**

  - **Status:** 200 OK
  - **Body:** Array of NFT objects.

- **Error Response:**
  - **Status:** 500 Internal Server Error
  - **Body:** `{ error: 'Failed to fetch NFT list.' }`
