
export class GetMusicianMarchSolo {
  static readonly type = '[MusicianMarchSolo] GetMusicianMarchSolo';
  constructor(public payload: {musicianId: number}) { }
}

export class ResetMusicianMarchSolo {
  static readonly type = '[MusicianMarchSolo] Reset MusicianMarchSolo';
  constructor(public payload: {}) { }
}