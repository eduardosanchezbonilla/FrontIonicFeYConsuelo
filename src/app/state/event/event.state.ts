import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models/event/event';
import { CreateEvent, DeleteEvent, GetEvent, GetEventCrosshead, GetEventCurrentData, GetEventCurrentPosition, GetEventMusicianAssistance, GetEventMusicianFormation, GetEventRepertoire, GetEventReportAssistance, GetEventRoute, GetEvents, GetEventsGroupByAnyo, GetEventStats, ResetEvent, ResetEventMusicianAssistance, ResetEventRepertoire, UpdateEvent, UpdateEventCrosshead, UpdateEventCurrentMarch, UpdateEventCurrentPosition, UpdateEventFormation, UpdateEventRoute } from './event.actions';
import { EventMusicianAssistance } from 'src/app/models/event/event-musician-assistance';
import { EventGroupByAnyo } from 'src/app/models/event/event-group-by-anyo';
import { EventRepertoire } from 'src/app/models/event/event-repertoire';
import { EventReportAssistance } from 'src/app/models/event/event-report-assistance';
import { EventListResponse } from 'src/app/models/event/event-list-response';
import { RouteEvent } from 'src/app/models/route-event/route-event';
import { LatLng } from 'src/app/models/route-event/latLng';
import { EventCurrentData } from 'src/app/models/event/event-current-data';
import { CrossheadEvent } from 'src/app/models/crosshead-event/crosshead-event';
import { GlobalEventStatsResponse } from 'src/app/models/event/global-event-stats-response';

export class EventStateModel {
  //public events: Event[];
  public eventStats: GlobalEventStatsResponse;
  public eventsGroupByAnyo: EventGroupByAnyo[];
  public eventMusicianAssistance: EventMusicianAssistance;
  public eventReportAssistance: EventReportAssistance;
  public eventRepertoire: EventRepertoire;
  public eventListResponse: EventListResponse;
  public event: Event;
  public routeEvent: RouteEvent;
  public crossheadEvent: CrossheadEvent;
  public currentPositionEvent: LatLng;
  public currentDataEvent: EventCurrentData;
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  //events: [],  
  eventStats: null,
  eventsGroupByAnyo: [],  
  eventMusicianAssistance: null,
  eventReportAssistance: null,
  eventRepertoire: null,
  eventListResponse:null,
  event: null,
  routeEvent: null,
  crossheadEvent: null,
  currentPositionEvent: null,
  currentDataEvent: null,
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<EventStateModel>({
  name: 'events',
  defaults
})
@Injectable()
export class EventState {
  
  constructor(
    private eventService: EventService
  ){}

  @Selector()
  static success(state:EventStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:EventStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static eventListResponse(state:EventStateModel):EventListResponse {
    return state.eventListResponse;
  }

  @Selector()
  static eventsGroupByAnyo(state:EventStateModel):EventGroupByAnyo[] {
    return state.eventsGroupByAnyo;
  }

  @Selector()
  static eventStats(state:EventStateModel):GlobalEventStatsResponse {
    return state.eventStats;
  }

  @Selector()
  static eventMusicianAssistance(state:EventStateModel):EventMusicianAssistance {
    return state.eventMusicianAssistance;
  }

  @Selector()
  static eventReportAssistance(state:EventStateModel):EventReportAssistance {
    return state.eventReportAssistance;
  }

  @Selector()
  static eventRepertoire(state:EventStateModel):EventRepertoire {
    return state.eventRepertoire;
  }

  @Selector()
  static event(state:EventStateModel):Event {
    return state.event;
  }

  @Selector()
  static routeEvent(state:EventStateModel):RouteEvent {
    return state.routeEvent;
  }

  @Selector()
  static crossheadEvent(state:EventStateModel):CrossheadEvent {
    return state.crossheadEvent;
  }

  @Selector()
  static currentPositionEvent(state:EventStateModel):LatLng {
    return state.currentPositionEvent;
  }

  @Selector()
  static currentDataEvent(state:EventStateModel):EventCurrentData {
    return state.currentDataEvent;
  }

  @Selector()
  static errorStatusCode(state:EventStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:EventStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateEvent)
  createEvent(
      { patchState }: StateContext<EventStateModel>,
      { payload }: CreateEvent
  ) {
    return this.eventService.createEvent(payload.event)
      .then( 
        async (success:boolean) => {
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 201,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al crear el evento'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });
  }

  @Action(UpdateEvent)
  updateEvent(
      { patchState }: StateContext<EventStateModel>,
      { payload }: UpdateEvent
  ) {
    return this.eventService.updateEvent(payload.eventType, payload.eventId, payload.event)
      .then( 
        async (success:boolean) => {
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al modificar el evento'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });     
  }

  @Action(GetEvents)
  getEvents(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEvents
  ) {
    return this.eventService.getEvents(payload.startDate, payload.endDate, payload.allEvents)
      .then(
        (eventListResponse:EventListResponse) => {
          patchState({
            finish: true,
            success: true,
            eventListResponse: eventListResponse,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            eventListResponse: new EventListResponse(),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  
  @Action(DeleteEvent)
  deleteEvent(
      { patchState }: StateContext<EventStateModel>,
      { payload }: DeleteEvent
  ) {
    return this.eventService.deleteEvent(payload.eventType, payload.eventId)
      .then( 
        async (success:boolean) => {
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al eliminar el evento'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });     
  }

  @Action(GetEventMusicianAssistance)
  getEventMusicianAssistance(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventMusicianAssistance
  ) {
    return this.eventService.getEventMusicianAssistance(payload.eventType, payload.eventId)
      .then(
        (eventMusicianAssistance:EventMusicianAssistance) => {
          patchState({
            finish: true,
            success: true,            
            eventMusicianAssistance: eventMusicianAssistance,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,            
            eventMusicianAssistance: new EventMusicianAssistance(),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetEventMusicianFormation)
  getEventMusicianFormation(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventMusicianFormation
  ) {
    return this.eventService.getEventMusicianFormation(payload.eventType, payload.eventId)
      .then(
        (eventMusicianAssistance:EventMusicianAssistance) => {
          patchState({
            finish: true,
            success: true,            
            eventMusicianAssistance: eventMusicianAssistance,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,            
            eventMusicianAssistance: new EventMusicianAssistance(),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetEventsGroupByAnyo)
  getEventsGroupByAnyo(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventsGroupByAnyo
  ) {
    return this.eventService.getEventsGroupByAnyo(payload.eventType, payload.startDate, payload.endDate, payload.name)
    .then(
      (eventsGroupByAnyo:EventGroupByAnyo[]) => {
        patchState({
          finish: true,
          success: true,
          eventsGroupByAnyo: eventsGroupByAnyo,
          errorStatusCode: 200,
          errorMessage: null
        })
      }
    )
    .catch(
      async (error) => {          
        patchState({
          finish: true,
          success: false,
          eventsGroupByAnyo: [],
          errorStatusCode: error.status,
          errorMessage: error.message
        })
      }
    );
  }

  @Action(ResetEvent)
  resetEvent(
      { patchState }: StateContext<EventStateModel>,
      { payload }: ResetEvent
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

  @Action(ResetEventMusicianAssistance)
  resetEventMusicianAssistance(
      { patchState }: StateContext<EventStateModel>,
      { payload }: ResetEventMusicianAssistance
  ) {
    patchState({
      finish: false,
      success: true,
      eventMusicianAssistance: null,
      errorStatusCode: null,
      errorMessage: null
    })
  }

  @Action(GetEventRepertoire)
  getEventRepertoire(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventRepertoire
  ) {
    return this.eventService.getEventRepertoire(payload.eventType, payload.eventId)
      .then(
        (eventRepertoire:EventRepertoire) => {
          patchState({
            finish: true,
            success: true,            
            eventRepertoire: eventRepertoire,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,            
            eventRepertoire: new EventRepertoire(),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(ResetEventRepertoire)
  resetEventRepertoire(
      { patchState }: StateContext<EventStateModel>,
      { payload }: ResetEventRepertoire
  ) {
    patchState({
      finish: false,
      success: true,
      eventRepertoire: null,
      errorStatusCode: null,
      errorMessage: null
    })
  }

  @Action(GetEventReportAssistance)
  getEventReportAssistance(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventReportAssistance
  ) {
    return this.eventService.getEventReportAssistance(payload.eventType, payload.eventId)
      .then(
        (eventReportAssistance:EventReportAssistance) => {
          patchState({
            finish: true,
            success: true,            
            eventReportAssistance: eventReportAssistance,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,            
            eventReportAssistance: new EventReportAssistance(),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetEvent)
  getEvent(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEvent
  ) {
    return this.eventService.getEvent(payload.eventType, payload.eventId)
      .then(
        (event:Event) => {
          patchState({
            finish: true,
            success: true,            
            event: event,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,            
            event: new Event(null,null,null,null,null,null,null,null,null,null,null,null,null,null,null),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(UpdateEventFormation)
  updateEventFormation(
      { patchState }: StateContext<EventStateModel>,
      { payload }: UpdateEventFormation
  ) {
    return this.eventService.updateEventFormation(payload.eventType, payload.eventId, payload.updateEventFormationRequestDto)
      .then( 
        async (success:boolean) => {
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al modificar el evento'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });     
  }

  @Action(UpdateEventRoute)
  updateEventRoute(
      { patchState }: StateContext<EventStateModel>,
      { payload }: UpdateEventRoute
  ) {
    return this.eventService.updateEventRoute(payload.eventType, payload.eventId, payload.routeEvent)
      .then( 
        async (success:boolean) => {
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al modificar el evento'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });     
  }

  @Action(UpdateEventCurrentPosition)
  updateEventCurrentPosition(
      { patchState }: StateContext<EventStateModel>,
      { payload }: UpdateEventCurrentPosition
  ) {
    return this.eventService.updateEventCurrentPosition(payload.eventType, payload.eventId, payload.latLng)
      .then( 
        async (success:boolean) => {
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al modificar el evento'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });     
  }

  @Action(UpdateEventCurrentMarch)
  updateEventCurrentMarch(
      { patchState }: StateContext<EventStateModel>,
      { payload }: UpdateEventCurrentMarch
  ) {
    return this.eventService.updateEventCurrentMarch(payload.eventType, payload.eventId, payload.march)
      .then( 
        async (success:boolean) => {
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al modificar el evento'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });     
  }


  @Action(GetEventRoute)
  getEventRoute(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventRoute
  ) {
    return this.eventService.getEventRoute(payload.eventType, payload.eventId)
      .then(
        (route:RouteEvent) => {
          patchState({
            finish: true,
            success: true,            
            routeEvent: route,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,            
            routeEvent: new RouteEvent(null,null,null,null,null,null),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetEventCurrentPosition)
  getEventCurrentPosition(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventCurrentPosition
  ) {
    return this.eventService.getEventCurrentPosition(payload.eventType, payload.eventId)
      .then(
        (currentPosition:LatLng) => {
          patchState({
            finish: true,
            success: true,            
            currentPositionEvent: currentPosition,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,            
            currentPositionEvent: new LatLng(null,null),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetEventCurrentData)
  getEventCurrentData(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventCurrentData
  ) {
    return this.eventService.getEventCurrentData(payload.eventType, payload.eventId)
      .then(
        (currentData:EventCurrentData) => {
          patchState({
            finish: true,
            success: true,            
            currentDataEvent: currentData,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,            
            currentDataEvent: new EventCurrentData(null,null,null),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(UpdateEventCrosshead)
  updateEventCrosshead(
      { patchState }: StateContext<EventStateModel>,
      { payload }: UpdateEventCrosshead
  ) {
    return this.eventService.updateEventCrosshead(payload.eventType, payload.eventId, payload.crossheadEvent)
      .then( 
        async (success:boolean) => {
          if(success){
            patchState({
              finish: true,
              success: true,
              errorStatusCode: 200,
              errorMessage: null
            })
          }
          else{
            patchState({
              finish: true,
              success: false,
              errorStatusCode: 500,
              errorMessage: 'Error al actualizar el evento'
            })
          }
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
      });     
  }

  @Action(GetEventCrosshead)
  getEventCrosshead(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventCrosshead
  ) {
    return this.eventService.getEventCrosshead(payload.eventType, payload.eventId)
      .then(
        (crosshead:CrossheadEvent) => {
          patchState({
            finish: true,
            success: true,            
            crossheadEvent: crosshead,
            errorStatusCode: 200,
            errorMessage: null
          })
        }
      )
      .catch(
        async (error) => {          
          patchState({
            finish: true,
            success: false,            
            crossheadEvent: new CrossheadEvent(null),
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetEventStats)
  getEventStats(
      { patchState }: StateContext<EventStateModel>,
      { payload }: GetEventStats
  ) {
    return this.eventService.getEventStats(payload.eventType, payload.startDate, payload.endDate,payload.excludeSpecialTypes)
    .then(
      (eventStats:GlobalEventStatsResponse) => {
        patchState({
          finish: true,
          success: true,
          eventStats: eventStats,
          errorStatusCode: 200,
          errorMessage: null
        })
      }
    )
    .catch(
      async (error) => {          
        patchState({
          finish: true,
          success: false,
          eventStats: new GlobalEventStatsResponse(),
          errorStatusCode: error.status,
          errorMessage: error.message
        })
      }
    );
  }

}
