import { RepertoireEvent } from "src/app/models/repertoire-event/repertoire-event";

export class CreateRepertoireEvent {
  static readonly type = '[RepertoireEvent] Create RepertoireEvent';
  constructor(public payload: {repertoireEvent: RepertoireEvent}) { }
}

export class DeleteRepertoireEvent {
  static readonly type = '[RepertoireEvent] Delete RepertoireEvent';
  constructor(public payload: {repertoireEvent: RepertoireEvent}) { }
}

export class ResetRepertoireEvent {
  static readonly type = '[RepertoireEvent] Rest RepertoireEvent';
  constructor(public payload: {}) { }
}