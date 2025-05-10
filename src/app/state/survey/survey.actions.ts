import { Survey } from "src/app/models/survey/survey-dto";
import { SurveyVote } from "src/app/models/survey/survey-vote-dto";

export class CreateSurvey {
  static readonly type = '[Survey] Create Survey';
  constructor(public payload: {survey: Survey}) { }
}

export class GetSurveys {
  static readonly type = '[Survey] Get GetSurveys';
  constructor(public payload: {}) { }
}

export class GetSurvey {
  static readonly type = '[Survey] Get GetSurvey';
  constructor(public payload: {id:number}) { }
}

export class DeleteSurvey {
  static readonly type = '[Survey] Delete Survey';
  constructor(public payload: {id:number}) { }
}

export class UpdateSurvey {
  static readonly type = '[Survey] Update Survey';
  constructor(public payload: {id:number, survey: Survey}) { }
}

export class VoteSurvey {
  static readonly type = '[Survey] Vote Survey';
  constructor(public payload: {id:number, surveyVote: SurveyVote}) { }
}

export class ResetSurvey {
  static readonly type = '[Survey] Reset Survey';
  constructor(public payload: {}) { }
}
