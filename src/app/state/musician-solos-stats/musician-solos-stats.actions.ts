
export class GetMusicianSolosStats {
  static readonly type = '[MusicianSolosStats] GetMusicianSolosStats';
  constructor(public payload: {}) { }
}

export class ResetMusicianSolosStats {
  static readonly type = '[MusicianSolosStats] Reset MusicianSolosStats';
  constructor(public payload: {}) { }
}