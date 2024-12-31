import { Event } from "src/app/models/event/event";

export class CreateEvent {
  static readonly type = '[Event] Create Event';
  constructor(public payload: {event: Event}) { }
}

export class GetEvents{
  static readonly type = '[Event] Get Event';
  constructor(public payload: {startDate:string, endDate:string}) { }
}

export class DeleteEvent {
  static readonly type = '[Event] Delete Event';
  constructor(public payload: {eventType:string, eventId:number}) { }
}

export class UpdateEvent {
  static readonly type = '[Event] Update Event';
  constructor(public payload: {eventType:string, eventId:number, event: Event}) { }
}

export class ResetEvent {
  static readonly type = '[Event] Rest Event';
  constructor(public payload: {}) { }
}

export class GetEventMusicianAssistance{
  static readonly type = '[Event] GetEventMusicianAssistance';
  constructor(public payload: {eventType:string, eventId:number}) { }
}

export class GetEventsGroupByAnyo{
  static readonly type = '[Event] GetEventsGroupByAnyo';
  constructor(public payload: {eventType:string, startDate:string, endDate:string,name:string,}) { }
}

export class ResetEventMusicianAssistance {
  static readonly type = '[Event] ResetEventMusicianAssistance';
  constructor(public payload: {}) { }
}

export class GetEventRepertoire{
  static readonly type = '[Event] GetEventRepertoire';
  constructor(public payload: {eventType:string, eventId:number}) { }
}

export class ResetEventRepertoire {
  static readonly type = '[Event] ResetEventRepertoire';
  constructor(public payload: {}) { }
}