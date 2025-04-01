import { Contract } from "src/app/models/contract/contract";

export class DownloadContract {
  static readonly type = '[Contract] Download Contract';
  constructor(public payload: {contractGoogleId: string}) { }
}

export class UploadContract {
  static readonly type = '[Contract] Upload Contract';
  constructor(public payload: {contract: Contract}) { }
}

export class DeleteContract {
  static readonly type = '[Contract] Delete Contract';
  constructor(public payload: {contractGoogleId: string}) { }
}

export class GetContracts {
  static readonly type = '[Contract] Get Contracts';
  constructor(public payload: {contractGroupGoogleId: string}) { }
}
export class ResetContract {
  static readonly type = '[Contract] Reset Contract';
  constructor(public payload: {}) { }
}
