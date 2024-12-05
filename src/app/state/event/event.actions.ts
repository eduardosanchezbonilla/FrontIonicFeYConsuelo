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

