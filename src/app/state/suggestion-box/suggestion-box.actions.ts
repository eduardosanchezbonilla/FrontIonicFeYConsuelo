import { SuggestionBoxRequest } from "src/app/models/suggestion-box/suggestion-box-request";

export class CreateSuggestionBox {
  static readonly type = '[SuggestionBox] Create SuggestionBox';
  constructor(public payload: {suggestionBoxRequest: SuggestionBoxRequest}) { }
}

export class GetSuggestionBoxGroupByUser {
  static readonly type = '[SuggestionBox] Get SuggestionBoxGroupByUser';
  constructor(public payload: {all: boolean}) { }
}

export class MarkReadUnread {
  static readonly type = '[SuggestionBox] MarkReadUnread';
  constructor(public payload: {suggestionBoxRequest: SuggestionBoxRequest}) { }
}

export class ResetSuggestionBox {
  static readonly type = '[SuggestionBox] Reset SuggestionBox';
  constructor(public payload: {}) { }
}