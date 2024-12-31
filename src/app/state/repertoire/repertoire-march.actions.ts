import { RepertoireMarch } from "src/app/models/repertoire/repertoire-march";

export class CreateRepertoireMarch {
  static readonly  type = '[RepertoireMarch] CreateRepertoireMarch';
  constructor(public payload: {repertoireMarch: RepertoireMarch}) { }
}

export class UpdateRepertoireMarch {
  static readonly  type = '[RepertoireMarch] Update RepertoireMarch';
  constructor(public payload: {id:number, repertoireMarch: RepertoireMarch}) { }
}

export class GetRepertoireMarchs {
  static readonly  type = '[RepertoireMarch] Get RepertoireMarchs';
  constructor(public payload: {}) { }
}

export class GetCategoryRepertoireMarchsGroupByType {
  static readonly  type = '[RepertoireMarch] GetCategoryRepertoireMarchsGroupByType';
  constructor(public payload: {categoryId:number, name: string}) { }
}

export class GetRepertoireMarchsGroupByType {
  static readonly  type = '[RepertoireMarch] Get RepertoireMarchsGroupByType';
  constructor(public payload: {name: string, current: boolean}) { }
}

export class DeleteRepertoireMarch {
  static readonly  type = '[RepertoireMarch] Delete RepertoireMarch';
  constructor(public payload: {id:number}) { }
}

export class ResetRepertoireMarch {
  static readonly type  = '[RepertoireMarch] Rest RepertoireMarch';
  constructor(public payload: {}) { }
}