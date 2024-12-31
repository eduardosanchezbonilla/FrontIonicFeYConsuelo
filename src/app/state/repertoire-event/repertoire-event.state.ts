import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CreateRepertoireEvent, DeleteRepertoireEvent, ResetRepertoireEvent } from './repertoire-event.actions';
import { Event } from 'src/app/models/event/event';
import { RepertoireEventService } from 'src/app/services/repertoire-event/repertoire-event.service';

export class RepertoireEventStateModel {  
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {  
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<RepertoireEventStateModel>({
  name: 'repertoireEvent',
  defaults
})
@Injectable()
export class RepertoireEventState { 
  
  constructor(    
    private repertoireEventService: RepertoireEventService
  ){}

  @Selector()
  static success(state:RepertoireEventStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:RepertoireEventStateModel):boolean {
    return state.finish;
  }

  @Selector()
  static errorStatusCode(state:RepertoireEventStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:RepertoireEventStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateRepertoireEvent)
  createRepertoireEvent(
      { patchState }: StateContext<RepertoireEventStateModel>,
      { payload }: CreateRepertoireEvent
  ) {
    return this.repertoireEventService.createRepertoireEvent(payload.repertoireEvent)
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
              errorMessage: 'Error al persistir la marcha asociada al evento'
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

  @Action(DeleteRepertoireEvent)
  deleteMusicianEvent(
      { patchState }: StateContext<RepertoireEventStateModel>,
      { payload }: DeleteRepertoireEvent
  ) {
    return this.repertoireEventService.deleteRepertoireEvent(payload.repertoireEvent)
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
              errorMessage: 'Error al eliminar la marcha asociada al evento'
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

  @Action(ResetRepertoireEvent)
  resetMusicianEvent(
      { patchState }: StateContext<RepertoireEventStateModel>,
      { payload }: ResetRepertoireEvent
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
