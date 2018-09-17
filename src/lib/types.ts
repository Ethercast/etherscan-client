export interface EtherscanAPIResponse {
  readonly message: 'NOTOK' | 'OK';
  readonly result: any;
  readonly status: '1' | '0';
}

export interface Input {
  readonly name: string;
  readonly type: string;
  readonly indexed?: boolean;
}

export interface Output {
  readonly name: string;
  readonly type: string;
}

export interface Tuple extends Output {
  readonly type: 'tuple';
  readonly components: ReadonlyArray<Output>;
}

interface ContractMember {
  readonly constant?: boolean;
  readonly inputs?: ReadonlyArray<Input>;
  readonly name?: string;
  readonly outputs?: ReadonlyArray<Output | Tuple>;
  readonly type: string;
  readonly payable?: boolean;
  readonly stateMutability?: string;
  readonly anonymous?: boolean;
}

export type ContractABI = ReadonlyArray<ContractMember>;
