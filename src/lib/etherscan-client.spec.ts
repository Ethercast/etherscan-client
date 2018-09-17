import test from 'ava';
import EtherscanClient from './etherscan-client';

const MAINNET_API_URL = 'https://api.etherscan.io/api';

async function timed(f: () => void | Promise<void>): Promise<number> {
  const before = Date.now();

  await f();

  return Date.now() - before;
}

test('EtherscanClient', async t => {
  const MAINNET_FAKE_TOKEN = {
    apiKey: 'YourApiKeyToken',
    apiUrl: MAINNET_API_URL
  };
  const client = new EtherscanClient(MAINNET_FAKE_TOKEN);

  const abi = await client.getAbi('0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413');

  if (abi === null) {
    t.fail('abi should not be null');
    return;
  }

  t.deepEqual(abi.length, 57);

  // test the throttling
  let elapsed: number;
  elapsed = await timed(async () => {
    await Promise.all(
      [0, 1, 2, 3, 4].map(() =>
        client.getAbi('0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413')
      )
    );
  });

  if (elapsed < 800) {
    t.fail(`at least 1 second should have elapsed for 5 calls: ${elapsed}`);
  }

  // now try with a different max requests per second
  const newClient = new EtherscanClient({
    ...MAINNET_FAKE_TOKEN,
    maxRequestsPerSecond: 500
  });
  elapsed = await timed(async () => {
    await Promise.all(
      [0, 1, 2, 3, 4].map(() =>
        newClient.getAbi('0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413')
      )
    );
  });
  if (elapsed > 800) {
    t.fail(`expected elapsed to be less than 800ms ${elapsed}`);
  }

  const CRYPTOKITTIES_ADDRESS_MAINNET =
    '0x06012c8cf97bead5deae237070f9587f8e7a266d';
  const cryptokittiesABI = await newClient.getAbi(
    CRYPTOKITTIES_ADDRESS_MAINNET
  );
  t.log('Cryptokitties ABI', cryptokittiesABI);

  // invalid address
  await t.throwsAsync(
    newClient.getAbi('0x06012c8cf97bead5deae237070f9587f8e7a266f')
  );
  // fomo3d - no verified source code
  await t.throwsAsync(
    newClient.getAbi('0x0ccb1e1eb18868b3306966d9242b203d5a4a9b73')
  );
});
