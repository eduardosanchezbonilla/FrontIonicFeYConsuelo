import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { DownloadPartiture, GetPartitures, ResetPartiture } from './partiture.actions'
import { Partiture } from 'src/app/models/partiture/partiture';
import { PartitureService } from 'src/app/services/partiture/partiture.service';

export class PartitureStateModel {
  public partitures: Partiture[];
  public partiture: Partiture;
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  partitures: [],
  partiture: new Partiture(),
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<PartitureStateModel>({
  name: 'partiture',
  defaults
})
@Injectable()
export class PartitureState { 
  
  constructor(    
    private partitureService: PartitureService    
  ){}

  @Selector()
  static success(state:PartitureStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:PartitureStateModel):boolean {
    return state.finish;
  }

  @Selector()
  static partitures(state:PartitureStateModel):Partiture[] {
    return state.partitures;
  }
  
  @Selector()
  static partiture(state:PartitureStateModel):Partiture {
    return state.partiture;
  }

  @Selector()
  static errorStatusCode(state:PartitureStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:PartitureStateModel):string {
    return state.errorMessage;
  }

  
  @Action(GetPartitures)
  getPartitures(
      { patchState }: StateContext<PartitureStateModel>,
      { payload }: GetPartitures
  ) {
    return this.partitureService.getPartitures(payload.partitureGroupGoogleId)
      .then(
          (partitures:Partiture[]) => {            
            patchState({
              finish: true,
              success: true,
              partitures: partitures,
              partiture: null,
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
            partitures: [],
            partiture: null,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DownloadPartiture)
  downloadPartiture(
      { patchState }: StateContext<PartitureStateModel>,
      { payload }: DownloadPartiture
  ) {
    return this.partitureService.downloadPartiture(payload.partitureGoogleId)
      .then(
          (partiture:Partiture) => {
            patchState({
              finish: true,
              success: true,
              partitures: [],
              partiture: partiture,
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
            partitures: [],
            partiture: null,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }


  @Action(ResetPartiture)
  resetPartiture(
      { patchState }: StateContext<PartitureStateModel>,
      { payload }: ResetPartiture
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      partitures: [],
      partiture: null
    })
  }

}
