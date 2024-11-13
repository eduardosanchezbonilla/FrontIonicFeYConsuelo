import { VideoCategory } from "src/app/models/video-category/video-category";

export class CreateVideoCategory {
  static readonly type = '[VideoCategory] CreateVideoCategory';
  constructor(public payload: {videoCategory: VideoCategory}) { }
}

export class UpdateVideoCategory {
  static readonly type = '[VideoCategory] Update VideoCategory';
  constructor(public payload: {id:number, videoCategory: VideoCategory}) { }
}

export class GetVideoCategories {
  static readonly type = '[VideoCategory] Get VideoCategories';
  constructor(public payload: {}) { }
}

export class DeleteVideoCategory {
  static readonly type = '[VideoCategory] Delete VideoCategory';
  constructor(public payload: {id:number}) { }
}

export class ResetVideoCategory {
  static readonly type = '[VideoCategory] Rest VideoCategory';
  constructor(public payload: {}) { }
}