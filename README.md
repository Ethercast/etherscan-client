# @ethercast/etherscan-client
[![Build Status](https://travis-ci.org/Ethercast/etherscan-client.svg?branch=master)](https://travis-ci.org/Ethercast/etherscan-client)
[![codecov](https://codecov.io/gh/Ethercast/etherscan-client/branch/master/graph/badge.svg)](https://codecov.io/gh/Ethercast/etherscan-client)
[![NPM version][npm-svg]][npm]

   [npm]: https://www.npmjs.com/package/@ethercast/etherscan-client
   [npm-svg]: https://img.shields.io/npm/v/@ethercast/etherscan-client.svg?style=flat

TypeScript client for the Etherscan API

## Install
`npm i --save @ethercast/etherscan-client`

## Usage

```typescript
import EtherscanClient from '@ethercast/etherscan-client';

async function printAbi() {
  const client = new EtherscanClient({ apiKey: 'my-key', apiUrl: 'https://api.etherscan.io/api' });
  const abi = await client.getAbi(SOME_CONTRACT_ADDRESS);
  console.log(abi);
}

```
