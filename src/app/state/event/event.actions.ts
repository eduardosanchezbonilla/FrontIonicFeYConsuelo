import { Event } from "src/app/models/event/event";
import { UpdateEventFormationRequestDto } from "src/app/models/formation-event/update-event-formation-request-dto";
import { LatLng } from "src/app/models/route-event/latLng";
import { RouteEvent } from "src/app/models/route-event/route-event";

export class CreateEvent {
  static readonly type = '[Event] Create Event';
  constructor(public payload: {event: Event}) { }
}

export class GetEvents{
  static readonly type = '[Event] Get Event';
  constructor(public payload: {startDate:string, endDate:string,allEvents:boolean}) { }
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

export class GetEventReportAssistance{
  static readonly type = '[Event] GetEventReportAssistance';
  constructor(public payload: {eventType:string, eventId:number}) { }
}

export class GetEvent{
  static readonly type = '[Event] GetEvent';
  constructor(public payload: {eventType:string, eventId:number}) { }
}

export class UpdateEventFormation {
  static readonly type = '[Event] Update EventFormation';
  constructor(public payload: {eventType:string, eventId:number, updateEventFormationRequestDto: UpdateEventFormationRequestDto}) { }
}

export class UpdateEventRoute {
  static readonly type = '[Event] Update EventRoute';
  constructor(public payload: {eventType:string, eventId:number, routeEvent: RouteEvent}) { }
}

export class UpdateEventCurrentPosition {
  static readonly type = '[Event] Update EventCurrentPosition';
  constructor(public payload: {eventType:string, eventId:number, latLng: LatLng}) { }
}