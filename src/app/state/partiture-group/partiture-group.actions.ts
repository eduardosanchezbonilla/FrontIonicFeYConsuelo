import { PartitureGroup } from "src/app/models/partiture-group/partiture-group";

export class CreatePartitureGroup {
  static readonly type = '[PartitureGroup] Create PartitureGroup';
  constructor(public payload: {partitureGroup: PartitureGroup}) { }
}

export class UpdatePartitureGroup {
  static readonly type = '[PartitureGroup] Update PartitureGroup';
  constructor(public payload: {id:number, partitureGroup: PartitureGroup}) { }
}

export class GetPartitureGroups {
  static readonly type = '[PartitureGroup] Get PartitureGroups';
  constructor(public payload: {}) { }
}

export class DeletePartitureGroup {
  static readonly type = '[PartitureGroup] Delete PartitureGroup';
  constructor(public payload: {id:number}) { }
}

export class ResetPartitureGroup {
  static readonly type = '[PartitureGroup] Rest PartitureGroup';
  constructor(public payload: {}) { }
}