import { Item } from "../models/item";

export class CreateItem {
  static readonly type = '[Items] Create Item';
  constructor(public payload: {item: Item}) { }
}

export class GetItems {
  static readonly type = '[Item] Gest Items';
  constructor(public payload: {description: string, user: string}) { }
}

export class UpdateItem {
  static readonly type = '[Items] Update Item';
  constructor(public payload: {id:string, newItem: Item}) { }
}

export class UpdateStatusItem {
  static readonly type = '[Items] Update Status Item';
  constructor(public payload: {id: string}) { }
}

export class DeleteItem {
  static readonly type = '[Items] Delete Item';
  constructor(public payload: {id:string}) { }
}