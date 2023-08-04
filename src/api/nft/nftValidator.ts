import Joi from 'joi';

export const nftDataSchema = Joi.object({
  ownerAddress: Joi.string().required(),
  tokenId: Joi.number().integer().required(),
  name: Joi.string().required(),
  type: Joi.string().valid('fixed', 'auction').required(),
  price: Joi.when('type', {
    is: 'fixed',
    then: Joi.number().required(),
    otherwise: Joi.number(),
  }),
  auction: Joi.when('type', {
    is: 'auction',
    then: Joi.object({
      minimumBid: Joi.number().required(),
      endDate: Joi.string().isoDate().required(),
    }).required(),
    otherwise: Joi.forbidden(),
  }),
});
