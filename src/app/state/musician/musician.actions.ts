import { ResetPasswordDto } from "src/app/models/user/reset-password-dto";
import { Musician } from "../../models/musician/musician";

export class CreateMusician {
  static readonly type = '[Musicians] Create Musician';
  constructor(public payload: {musician: Musician}) { }
}

export class GetMusicians {
  static readonly type = '[Musicians] Get Musicians';
  constructor(public payload: {}) { }
}

export class GetMusiciansGroupByVoice {
  static readonly type = '[Musicians] Get MusiciansGroupByVoice';
  constructor(public payload: {name: string, unregistred:boolean}) { }
}

export class DeleteMusician {
  static readonly type = '[Musicians] Delete Musician';
  constructor(public payload: {id:number}) { }
}

export class UpdateMusician {
  static readonly type = '[Musicians] Update Musician';
  constructor(public payload: {id:number, musician: Musician}) { }
}

export class ResetMusician {
  static readonly type = '[Musicians] Rest Musician';
  constructor(public payload: {}) { }
}

export class ResetPassword { 
  static readonly type = '[Musicians] ResetPassword';
  constructor(public payload: {resetPassword: ResetPasswordDto}) { }
}

export class GetMusicianFromDni {
  static readonly type = '[Musicians] Get GetMusicianFromDni';
  constructor(public payload: {dni:string}) { }
}