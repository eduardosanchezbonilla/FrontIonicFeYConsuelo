import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { MusicianService } from '../../services/musician/musician.service';
import { Musician } from '../../models/musician/musician';
import { CreateMusician, DeleteMusician, GetMusicians, GetMusiciansGroupByVoice, ResetMusician, UpdateMusician } from './musician.actions';
import { MusicianGroupByVoice } from '../../models/musician/musician-group-by-voice';

export class MusicianStateModel {
  public musicians: Musician[];
  public musiciansGroupByVoice: MusicianGroupByVoice[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  musicians: [],
  musiciansGroupByVoice: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<MusicianStateModel>({
  name: 'musicians',
  defaults
})
@Injectable()
export class MusicianState {
  
  constructor(
    private musicianService: MusicianService
  ){}

  @Selector()
  static success(state:MusicianStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:MusicianStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static musicians(state:MusicianStateModel):Musician[] {
    return state.musicians;
  }

  @Selector()
  static musiciansGroupByVoice(state:MusicianStateModel):MusicianGroupByVoice[] {
    return state.musiciansGroupByVoice;
  }

  @Selector()
  static errorStatusCode(state:MusicianStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:MusicianStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateMusician)
  createMusician(
      { patchState }: StateContext<MusicianStateModel>,
      { payload }: CreateMusician
  ) {
    return this.musicianService.createMusician(payload.musician)
      .then( 
        async (musician:Musician) => {
          if(musician){
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
              errorMessage: 'Error al crear el musico'
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

  @Action(UpdateMusician)
  updateMusician(
      { patchState }: StateContext<MusicianStateModel>,
      { payload }: UpdateMusician
  ) {
    return this.musicianService.updateMusician(payload.id, payload.musician)
      .then( 
        async (musician:Musician) => {
          if(musician){
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
              errorMessage: 'Error al modificar el musico'
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

  @Action(GetMusicians)
  getMusicians(
      { patchState }: StateContext<MusicianStateModel>,
      { payload }: GetMusicians
  ) {
    return this.musicianService.getMusicians()
      .then(
        (musicians:Musician[]) => {
          patchState({
            finish: true,
            success: true,
            musicians: musicians,
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
            musicians: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetMusiciansGroupByVoice)
  getMusiciansGroupByVoice(
      { patchState }: StateContext<MusicianStateModel>,
      { payload }: GetMusiciansGroupByVoice
  ) {
    return this.musicianService.getMusiciansGroupByVoice(payload.name)
      .then(
          (musiciansGroupByVoice:MusicianGroupByVoice[]) => {
            patchState({
              finish: true,
              success: true,
              musiciansGroupByVoice: musiciansGroupByVoice,
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
            musiciansGroupByVoice: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteMusician)
  deleteMusician(
      { patchState }: StateContext<MusicianStateModel>,
      { payload }: DeleteMusician
  ) {
    return this.musicianService.deleteMusician(payload.id)
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
              errorMessage: 'Error al eliminar el musico'
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

  @Action(ResetMusician)
  resetMusician(
      { patchState }: StateContext<MusicianStateModel>,
      { payload }: ResetMusician
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
