import { RepertoireCategory } from "src/app/models/repertoire-category/repertoire-category";

export class CreateRepertoireCategory {
  static readonly type = '[RepertoireCategory] CreateRepertoireCategory';
  constructor(public payload: {repertoireCategory: RepertoireCategory}) { }
}

export class UpdateRepertoireCategory {
  static readonly type = '[RepertoireCategory] Update RepertoireCategory';
  constructor(public payload: {id:number, repertoireCategory: RepertoireCategory}) { }
}

export class GetRepertoireCategories {
  static readonly type = '[RepertoireCategory] Get RepertoireCategories';
  constructor(public payload: {}) { }
}

export class DeleteRepertoireCategory {
  static readonly type = '[RepertoireCategory] Delete RepertoireCategory';
  constructor(public payload: {id:number}) { }
}

export class ResetRepertoireCategory {
  static readonly type = '[RepertoireCategory] Rest RepertoireCategory';
  constructor(public payload: {}) { }
}