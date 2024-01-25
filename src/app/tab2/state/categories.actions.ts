import { Category } from "../models/category";
import { UpdateCategoryDto } from "../models/update-category-dto";

export class CreateCategory {
  static readonly type = '[Categories] Create Category';
  constructor(public payload: {category: Category}) { }
}

export class GetCategories {
  static readonly type = '[Categories] Get Categories';
  constructor(public payload: {user: string}) { }
}

export class UpdateCategory {
  static readonly type = '[Categories] Update Category';
  constructor(public payload: {updateCategoruDto: UpdateCategoryDto}) { }
}

export class DeleteCategory {
  static readonly type = '[Categories] Delete Category';
  constructor(public payload: {id: string}) { }
}