import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models/event/event';
import { CreateEvent, DeleteEvent, GetEventMusicianAssistance, GetEventRepertoire, GetEvents, GetEventsGroupByAnyo, ResetEvent, ResetEventMusicianAssistance, ResetEventRepertoire, UpdateEvent } from './event.actions';
import { EventMusicianAssistance } from 'src/app/models/event/event-musician-assistance';
import { EventGroupByAnyo } from 'src/app/models/event/event-group-by-anyo';
import { EventRepertoire } from 'src/app/models/event/event-repertoire';

export class EventStateModel {
  public events: Event[];
  public eventsGroupByAnyo: EventGroupByAnyo[];
  public eventMusicianAssistance: EventMusicianAssistance;
  public eventRepertoire: EventRepertoire;
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  events: [],  
  eventsGroupByAnyo: [],  
  eventMusicianAssistance: null,
  eventRepertoire: null,
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
  static events(state:EventStateModel):Event[] {
    return state.events;
  }

  @Selector()
  static eventsGroupByAnyo(state:EventStateModel):EventGroupByAnyo[] {
    return state.eventsGroupByAnyo;
  }


  @Selector()
  static eventMusicianAssistance(state:EventStateModel):EventMusicianAssistance {
    return state.eventMusicianAssistance;
  }

  @Selector()
  static eventRepertoire(state:EventStateModel):EventRepertoire {
    return state.eventRepertoire;
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
    return this.eventService.getEvents(payload.startDate, payload.endDate)
      .then(
        (events:Event[]) => {
          patchState({
            finish: true,
            success: true,
            events: events,
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
            events: [],
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
            eventMusicianAssistance: null,
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
  resetMusician(
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
            eventRepertoire: null,
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


}
