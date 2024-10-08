import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { VoiceService } from '../../services/voice/voice.service';
import { CreateVoice, DeleteVoice, GetVoices, ResetVoice, UpdateVoice } from './voice.actions'
import { Voice } from '../../models/voice/voice';

export class VoiceStateModel {
  public voices: Voice[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  voices: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<VoiceStateModel>({
  name: 'voices',
  defaults
})
@Injectable()
export class VoiceState {
  
  constructor(    
    private voiceService: VoiceService    
  ){}

  @Selector()
  static success(state:VoiceStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:VoiceStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static voices(state:VoiceStateModel):Voice[] {
    return state.voices;
  }

  @Selector()
  static errorStatusCode(state:VoiceStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:VoiceStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateVoice)
  createVoice(
      { patchState }: StateContext<VoiceStateModel>,
      { payload }: CreateVoice
  ) {
    return this.voiceService.createVoice(payload.voice)
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
              errorMessage: 'Error al crear la voz'
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

  @Action(UpdateVoice)
  updaveVoice(
      { patchState }: StateContext<VoiceStateModel>,
      { payload }: UpdateVoice
  ) {
    return this.voiceService.updateVoice(payload.id, payload.voice)
      .then( 
        async (success:Boolean) => {
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
              errorMessage: 'Error al modificar la voz'
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

  @Action(GetVoices)
  getVoices(
      { patchState }: StateContext<VoiceStateModel>,
      { payload }: GetVoices
  ) {
    return this.voiceService.getVoices()
      .then(
          (voices:Voice[]) => {
            patchState({
              finish: true,
              success: true,
              voices: voices,
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
            voices: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteVoice)
  deleteVoice(
      { patchState }: StateContext<VoiceStateModel>,
      { payload }: DeleteVoice
  ) {
    return this.voiceService.deleteVoice(payload.id)
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
              errorMessage: 'Error al eliminar la voz'
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

  @Action(ResetVoice)
  resetVoice(
      { patchState }: StateContext<VoiceStateModel>,
      { payload }: ResetVoice
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
