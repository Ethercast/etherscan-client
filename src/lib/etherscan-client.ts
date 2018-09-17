import fetch from 'cross-fetch';
import { stringify } from 'qs';
import { ContractABI, EtherscanAPIResponse } from './types';
import { JoiContractABI } from './validation';

enum Action {
  account_balance = 'account_balance',
  account_balancemulti = 'account_balancemulti',
  account_txlist = 'account_txlist',
  account_txlistinternal = 'account_txlistinternal',
  account_tokentx = 'account_tokentx',
  account_getminedblocks = 'account_getminedblocks',
  contract_getabi = 'contract_getabi',
  transaction_getstatus = 'transaction_getstatus',
  transaction_gettxreceiptstatus = 'transaction_gettxreceiptstatus',
  block_getblockreward = 'block_getblockreward',
  logs_getLogs = 'logs_getLogs',
  stats_ethsupply = 'stats_ethsupply',
  stats_ethprice = 'stats_ethprice'
}

/**
 * This is the default export of the library, a client that can be constructed for interacting with the
 * Etherscan API.
 */
export default class EtherscanClient {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly maxRequestsPerSecond: number;
  private lastRequestTime: number | null = null;

  public constructor({
    apiUrl,
    apiKey,
    maxRequestsPerSecond = 5
  }: {
    readonly apiUrl: string;
    readonly apiKey: string;
    readonly maxRequestsPerSecond?: number;
  }) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.maxRequestsPerSecond = maxRequestsPerSecond;
  }

  public async getAbi(address: string): Promise<ContractABI | null> {
    const etherscanResponse = await this.call(Action.contract_getabi, {
      address
    });

    // Etherscan gives us 'NOTOK' and '0' if the ABI is not found
    if (
      etherscanResponse.message === 'NOTOK' &&
      etherscanResponse.status === '0' &&
      etherscanResponse.result === ''
    ) {
      return null;
    }

    let abi: ContractABI;
    try {
      abi = JSON.parse(etherscanResponse.result);
    } catch (err) {
      throw new Error(
        `failed to parse the ABI json for address ${address}: ${err.message}`
      );
    }

    const { error, value } = JoiContractABI.validate(abi, {
      allowUnknown: true
    });

    if (error && error.details && error.details.length) {
      throw new Error(
        `ABI received from etherscan did not match expected schema for address ${address}: ${JSON.stringify(
          error.details
        )}`
      );
    }

    return value;
  }

  public async call(
    actionEnum: Action,
    params: { [key: string]: string | number | boolean }
  ): Promise<EtherscanAPIResponse> {
    await this.throttle();

    const [module, action] = actionEnum.split('_');

    const response = await fetch(
      `${this.apiUrl}?${stringify({
        ...params,
        action,
        apikey: this.apiKey,
        module
      })}`
    );

    // 403 responses are not usually expected
    if (response.status === 403) {
      let msg: string;

      try {
        msg = await response.text();
      } catch (err) {
        throw new Error(
          `unexpected status code 403 and could not parse response body`
        );
      }

      throw new Error(`unexpected status code 403: ${msg}`);
    }

    if (response.status !== 200) {
      throw new Error(`response status was not 200: ${response.status}`);
    }

    let text: string;
    try {
      text = await response.text();
    } catch (err) {
      throw new Error(`failed to read response text: ${err.message}`);
    }

    let responseJson: EtherscanAPIResponse;
    try {
      responseJson = JSON.parse(text);
    } catch (err) {
      throw new Error(`failed to parse json in response body: ${err.message}`);
    }

    return responseJson;
  }

  private async throttle(): Promise<void> {
    const now = Date.now();

    if (this.lastRequestTime === null) {
      this.lastRequestTime = now;
      return;
    }

    const sleepMs = 1000 / this.maxRequestsPerSecond;
    const executionTime = this.lastRequestTime + sleepMs;

    if (executionTime <= now) {
      this.lastRequestTime = now;
      return;
    }

    this.lastRequestTime = executionTime;

    return new Promise<void>(resolve => {
      setTimeout(() => resolve(), executionTime - now);
    });
  }
}
