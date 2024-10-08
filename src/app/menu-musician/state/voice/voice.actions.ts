import { Voice } from "../../models/voice/voice";

export class CreateVoice {
  static readonly type = '[Voices] Create Voice';
  constructor(public payload: {voice: Voice}) { }
}

export class UpdateVoice {
  static readonly type = '[Voices] Update Voice';
  constructor(public payload: {id:number, voice: Voice}) { }
}

export class GetVoices {
  static readonly type = '[Voices] Get Voices';
  constructor(public payload: {}) { }
}

export class DeleteVoice {
  static readonly type = '[Voices] Delete Voice';
  constructor(public payload: {id:number}) { }
}

export class ResetVoice {
  static readonly type = '[Voices] Rest Voice';
  constructor(public payload: {}) { }
}