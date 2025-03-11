import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { MusicianMarchSoloResponse } from 'src/app/models/musician-march-solo/musician-march-solo-response';
import { MusicianSolosStatsResponse } from 'src/app/models/musician-solos-stats/musician-solos-stats-response';
import { GetMusicianSolosStats, ResetMusicianSolosStats } from './musician-solos-stats.actions';
import { MusicianSolosStatsService } from 'src/app/services/musician-solos-stats/musician-solos-stats.service';

export class MusicianSolosStatsStateModel {
  public musicianSolosStats: MusicianSolosStatsResponse[];  
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  musicianSolosStats: [],  
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<MusicianSolosStatsStateModel>({
  name: 'musicianSolosStats',
  defaults
})
@Injectable()
export class MusicianSolosStatsState { 
  
  constructor(    
    private musicianSolosStatsService: MusicianSolosStatsService
  ){}

  @Selector()
  static success(state:MusicianSolosStatsStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:MusicianSolosStatsStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static musicianSolosStats(state:MusicianSolosStatsStateModel):MusicianSolosStatsResponse[] {
    return state.musicianSolosStats;
  }

  @Selector()
  static errorStatusCode(state:MusicianSolosStatsStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:MusicianSolosStatsStateModel):string {
    return state.errorMessage;
  }


  @Action(GetMusicianSolosStats)
  getMusicianSolosStats(
      { patchState }: StateContext<MusicianSolosStatsStateModel>,
      { payload }: GetMusicianSolosStats
  ) {
    return this.musicianSolosStatsService.getMusicianSolosStats()
      .then(          
        async (musicianSolosStats:MusicianSolosStatsResponse[]) => {                        
            patchState({
              finish: true,
              success: true,
              musicianSolosStats: musicianSolosStats,              
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
            musicianSolosStats: [],            
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(ResetMusicianSolosStats)
  resetMusicianSolosStats(
      { patchState }: StateContext<MusicianSolosStatsStateModel>,
      { payload }: ResetMusicianSolosStats
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      musicianSolosStats: []
    })
  }

}
