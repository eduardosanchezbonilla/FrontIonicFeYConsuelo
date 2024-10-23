import { Inventory } from "src/app/models/inventory/inventory";

export class CreateInventory {
  static readonly type = '[Inventory] Create Inventory';
  constructor(public payload: {inventory: Inventory}) { }
}

export class UpdateInventory {
  static readonly type = '[Inventory] Update Inventory';
  constructor(public payload: {id:number, inventory: Inventory}) { }
}

export class GetInventories {
  static readonly type = '[Inventory] Get Inventory';
  constructor(public payload: {}) { }
}

export class DeleteInventory {
  static readonly type = '[Inventory] Delete Inventory';
  constructor(public payload: {id:number}) { }
}

export class ResetInventory {
  static readonly type = '[Inventory] Rest Inventory';
  constructor(public payload: {}) { }
}