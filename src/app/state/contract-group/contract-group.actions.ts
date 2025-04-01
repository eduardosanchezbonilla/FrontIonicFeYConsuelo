import { ContractGroup } from "src/app/models/contract-group/contract-group";

export class CreateContractGroup {
  static readonly type = '[ContractGroup] Create ContractGroup';
  constructor(public payload: {contractGroup: ContractGroup}) { }
}

export class UpdateContractGroup {
  static readonly type = '[ContractGroup] Update ContractGroup';
  constructor(public payload: {id:number, contractGroup: ContractGroup}) { }
}

export class GetContractGroups {
  static readonly type = '[ContractGroup] Get ContractGroup';
  constructor(public payload: {}) { }
}

export class DeleteContractGroup {
  static readonly type = '[ContractGroup] Delete ContractGroup';
  constructor(public payload: {id:number}) { }
}

export class ResetContractGroup {
  static readonly type = '[ContractGroup] Rest ContractGroup';
  constructor(public payload: {}) { }
}