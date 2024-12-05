import { MusicianEvent } from "src/app/models/musician-event/musician-event";

export class CreateMusicianEvent {
  static readonly type = '[MusicianEvent] Create MusicianEvent';
  constructor(public payload: {musicianEvent: MusicianEvent}) { }
}

export class DeleteMusicianEvent {
  static readonly type = '[MusicianEvent] Delete MusicianEvent';
  constructor(public payload: {musicianEvent: MusicianEvent}) { }
}

export class GetMusicianEvents{
  static readonly type = '[MusicianEvent] Get MusicianEvent';
  constructor(public payload: {musicianId: number, startDate:string, endDate:string}) { }
}

export class ResetMusicianEvent {
  static readonly type = '[MusicianEvent] Rest MusicianEvent';
  constructor(public payload: {}) { }
}