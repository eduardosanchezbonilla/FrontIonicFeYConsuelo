import { MusicianInventory } from "src/app/models/musician-inventory/musician-inventory";

export class CreateMusicianInventory {
  static readonly type = '[MusicianInventory] Create MusicianInventory';
  constructor(public payload: {musicianInventory: MusicianInventory}) { }
}


export class DeleteMusicianInventory {
  static readonly type = '[MusicianInventory] Delete MusicianInventory';
  constructor(public payload: {musicianInventory: MusicianInventory}) { }
}


export class GetMusicianInventories {
  static readonly type = '[MusicianInventory] GetMusicianInventories';
  constructor(public payload: {musicianId: number}) { }
}

export class GetMusiciansWithInventoryAssociated {
  static readonly type = '[MusicianInventory] GetMusiciansWithInventoryAssociated';
  constructor(public payload: {inventoryId: number}) { }
}

export class ResetMusicianInventory {
  static readonly type = '[MusicianInventory] Rest MusicianInventory';
  constructor(public payload: {}) { }
}