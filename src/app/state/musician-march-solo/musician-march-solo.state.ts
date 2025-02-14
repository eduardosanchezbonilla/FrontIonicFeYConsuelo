import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { MusicianMarchSoloResponse } from 'src/app/models/musician-march-solo/musician-march-solo-response';
import { MusicianMarchSoloService } from 'src/app/services/musician-march-solo/musician-march-solo.service';
import { GetMusicianMarchSolo, ResetMusicianMarchSolo } from './musician-march-solo.actions';

export class MusicianMarchSoloStateModel {
  public musicianMarchSolos: MusicianMarchSoloResponse[];  
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  musicianMarchSolos: [],  
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<MusicianMarchSoloStateModel>({
  name: 'musicianMarchSolos',
  defaults
})
@Injectable()
export class MusicianMarchSoloState { 
  
  constructor(    
    private musicianMarchSoloService: MusicianMarchSoloService
  ){}

  @Selector()
  static success(state:MusicianMarchSoloStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:MusicianMarchSoloStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static musicianMarchSolos(state:MusicianMarchSoloStateModel):MusicianMarchSoloResponse[] {
    return state.musicianMarchSolos;
  }

  @Selector()
  static errorStatusCode(state:MusicianMarchSoloStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:MusicianMarchSoloStateModel):string {
    return state.errorMessage;
  }


  @Action(GetMusicianMarchSolo)
  getMusicianMarchSolo(
      { patchState }: StateContext<MusicianMarchSoloStateModel>,
      { payload }: GetMusicianMarchSolo
  ) {
    return this.musicianMarchSoloService.getMusicianMarchSolo(payload.musicianId)
      .then(          
        async (musicianMarchSolos:MusicianMarchSoloResponse[]) => {                        
            patchState({
              finish: true,
              success: true,
              musicianMarchSolos: musicianMarchSolos,              
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
            musicianMarchSolos: [],            
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(ResetMusicianMarchSolo)
  resetMusicianInventory(
      { patchState }: StateContext<MusicianMarchSoloStateModel>,
      { payload }: ResetMusicianMarchSolo
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      musicianMarchSolos: []
    })
  }

}
