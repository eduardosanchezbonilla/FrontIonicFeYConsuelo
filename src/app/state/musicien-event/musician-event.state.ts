import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { MusicianEventService } from 'src/app/services/musician-event/musician-event.service';
import { CreateMusicianEvent, DeleteMusicianEvent, GetMusicianEvents, ResetMusicianEvent } from './musician-event.actions';
import { Event } from 'src/app/models/event/event';

export class MusicianEventStateModel {
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

@State<MusicianEventStateModel>({
  name: 'musicianEvent',
  defaults
})
@Injectable()
export class MusicianEventState { 
  
  constructor(    
    private musicianEventService: MusicianEventService
  ){}

  @Selector()
  static success(state:MusicianEventStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:MusicianEventStateModel):boolean {
    return state.finish;
  }

  @Selector()
  static errorStatusCode(state:MusicianEventStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:MusicianEventStateModel):string {
    return state.errorMessage;
  }

  @Selector()
  static events(state:MusicianEventStateModel):Event[] {
    return state.events;
  }


  @Action(CreateMusicianEvent)
  createMusicianEvent(
      { patchState }: StateContext<MusicianEventStateModel>,
      { payload }: CreateMusicianEvent
  ) {
    return this.musicianEventService.createMusicianEvent(payload.musicianEvent)
      .then( 
        async (success:Boolean) => {
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
              errorMessage: 'Error al persistir el evento asociado al musico'
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

  @Action(DeleteMusicianEvent)
  deleteMusicianEvent(
      { patchState }: StateContext<MusicianEventStateModel>,
      { payload }: DeleteMusicianEvent
  ) {
    return this.musicianEventService.deleteMusicianEvent(payload.musicianEvent)
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
              errorMessage: 'Error al eliminar el evento asociado al musico'
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

  @Action(GetMusicianEvents)
  getMusicianEvents(
      { patchState }: StateContext<MusicianEventStateModel>,
      { payload }: GetMusicianEvents
  ) {
    return this.musicianEventService.getEvents(payload.musicianId, payload.startDate, payload.endDate)
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

  
  @Action(ResetMusicianEvent)
  resetMusicianEvent(
      { patchState }: StateContext<MusicianEventStateModel>,
      { payload }: ResetMusicianEvent
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
