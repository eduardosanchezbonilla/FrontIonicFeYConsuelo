
export class DownloadPartiture {
  static readonly type = '[Partiture] Download Partiture';
  constructor(public payload: {partitureGoogleId: string}) { }
}

export class GetPartitures {
  static readonly type = '[Partiture] Get Partitures';
  constructor(public payload: {partitureGroupGoogleId: string}) { }
}
export class ResetPartiture {
  static readonly type = '[Partiture] Reset Partiture';
  constructor(public payload: {}) { }
}
