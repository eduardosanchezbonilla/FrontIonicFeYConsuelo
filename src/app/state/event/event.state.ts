import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { EventService } from 'src/app/services/event/event.service';
import { Event } from 'src/app/models/event/event';
import { CreateEvent, DeleteEvent, GetEvents, ResetEvent, UpdateEvent } from './event.actions';

export class EventStateModel {
  public events: Event[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  events: [],  
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
  deleteMusician(
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

}
