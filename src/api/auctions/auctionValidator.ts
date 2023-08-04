import Joi from 'joi';

export const finishAuctionSchema = Joi.object({
  tokenId: Joi.number().required(),
});

export const bidAuctionSchema = Joi.object({
  tokenId: Joi.number().required(),
  bidder: Joi.string().required(),
  erc20Address: Joi.string().required(),
  bidAmount: Joi.number().integer().positive().required(),
});
