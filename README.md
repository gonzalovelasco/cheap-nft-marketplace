# Cheap NFT Marketplace

## Description

Simple node backend server that stores an in-memory list of listings, and serves those listings through a REST API, and assists users in connecting, agreeing on terms through bidding to then settle their trade securely using the Settler contract.

## Resources

[Settler Contract](https://sepolia.etherscan.io/address/0x597c9bc3f00a4df00f85e9334628f6cdf03a1184#code)
[MockERC20](https://sepolia.etherscan.io/address/0xbd65c58d6f46d5c682bf2f36306d461e3561c747#code)
[MockERC721](https://sepolia.etherscan.io/address/0xfce9b92ec11680898c7fe57c4ddcea83aeaba3ff#code)

## Getting Started

1. Install Node.
2. Install packages `npm install` in the root directory.
3. Configure env vars with default values like in `.env.example`.
4. Run project: `npm run start`.

## Mint ERC20

1. Check that the variable `BUYER_PRIVATE_KEY` is set
2. Run project: `npm run mint:erc20`.

## Mint ERC721

1. Check that the variable `SELLER_PRIVATE_KEY` is set
2. Run project: `npm run mint:erc721`.
