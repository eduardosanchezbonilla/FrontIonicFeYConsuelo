import { Video } from "src/app/models/video/video";

export class CreateVideo {
  static readonly type = '[Video] Create Video';
  constructor(public payload: {video: Video}) { }
}

export class GetVideosGroupByCategory {
  static readonly type = '[Video] Get GetVideosGroupByCategory';
  constructor(public payload: {name: string}) { }
}

export class DeleteVideo {
  static readonly type = '[Video] Delete Video';
  constructor(public payload: {id:number}) { }
}

export class UpdateVideo {
  static readonly type = '[Video] Update Video';
  constructor(public payload: {id:number, video: Video}) { }
}

export class ResetVideo {
  static readonly type = '[Video] Rest Video';
  constructor(public payload: {}) { }
}
