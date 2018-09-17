import * as Joi from 'joi';

export const JoiParameter = Joi.object({
  indexed: Joi.boolean(),
  name: Joi.string().allow(''),
  type: Joi.string()
});

export const JoiTuple = JoiParameter.keys({
  components: Joi.array()
    .items(JoiParameter)
    .min(1)
    .required(),
  type: Joi.string()
    .valid('tuple')
    .required()
});

export const JoiContractMemberParameters = Joi.array().items(
  Joi.alternatives(JoiParameter, JoiTuple)
);

export const JoiContractMember = Joi.object({
  anonymous: Joi.boolean(),
  constant: Joi.boolean(),
  inputs: JoiContractMemberParameters,
  name: Joi.string().allow(''),
  outputs: JoiContractMemberParameters,
  payable: Joi.boolean(),
  stateMutability: Joi.string(),
  type: Joi.string()
});

export const JoiContractABI = Joi.array().items(JoiContractMember);
