import Joi from 'joi';

export const finishAuctionSchema = Joi.object({
  tokenId: Joi.number().required(),
  address: Joi.string().required(),
});

export const bidAuctionSchema = Joi.object({
  tokenId: Joi.number().required(),
  bidderAddress: Joi.string().required(),
  bidAmount: Joi.number().integer().positive().required(),
});
