import { RepertoireMarchType } from "src/app/models/repertoire-march-type/repertoire-march-type";

export class CreateRepertoireMarchType {
  static readonly type = '[RepertoireMarchType] CreateRepertoireMarchType';
  constructor(public payload: {repertoireMarchType: RepertoireMarchType}) { }
}

export class UpdateRepertoireMarchType {
  static readonly type = '[RepertoireMarchType] Update RepertoireMarchType';
  constructor(public payload: {id:number, repertoireMarchType: RepertoireMarchType}) { }
}

export class GetRepertoireMarchTypes {
  static readonly type = '[RepertoireMarchType] Get RepertoireMarchTypes';
  constructor(public payload: {}) { }
}

export class DeleteRepertoireMarchType {
  static readonly type = '[RepertoireMarchType] Delete RepertoireMarchType';
  constructor(public payload: {id:number}) { }
}

export class ResetRepertoireMarchType {
  static readonly type = '[RepertoireMarchType] Rest RepertoireMarchType';
  constructor(public payload: {}) { }
}