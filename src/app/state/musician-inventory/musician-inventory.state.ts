import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { MusicianInventory } from 'src/app/models/musician-inventory/musician-inventory';
import { Musician } from 'src/app/models/musician/musician';
import { MusicianInventoryService } from 'src/app/services/musician-inventory/musician-inventory.service';
import { CreateMusicianInventory, DeleteMusicianInventory, GetMusicianInventories, GetMusiciansWithInventoryAssociated, ResetMusicianInventory } from './musician-inventory.actions';

export class MusicianInventoryStateModel {
  public musicianInventories: MusicianInventory[];
  public musicians: Musician[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  musicianInventories: [],
  musicians: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<MusicianInventoryStateModel>({
  name: 'musicianInventories',
  defaults
})
@Injectable()
export class MusicianInventoryState { 
  
  constructor(    
    private musicianInventoryService: MusicianInventoryService
  ){}

  @Selector()
  static success(state:MusicianInventoryStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:MusicianInventoryStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static musicianInventories(state:MusicianInventoryStateModel):MusicianInventory[] {
    return state.musicianInventories;
  }

  @Selector()
  static musicians(state:MusicianInventoryStateModel):Musician[] {
    return state.musicians;
  }

  @Selector()
  static errorStatusCode(state:MusicianInventoryStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:MusicianInventoryStateModel):string {
    return state.errorMessage;
  }



  @Action(CreateMusicianInventory)
  createMusicianInventory(
      { patchState }: StateContext<MusicianInventoryStateModel>,
      { payload }: CreateMusicianInventory
  ) {
    return this.musicianInventoryService.createMusicianInventory(payload.musicianInventory)
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
              errorMessage: 'Error al asociar el elemento de inventario al musico'
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

  @Action(DeleteMusicianInventory)
  deleteMusicianInventory(
      { patchState }: StateContext<MusicianInventoryStateModel>,
      { payload }: DeleteMusicianInventory
  ) {
    return this.musicianInventoryService.deleteMusicianInventory(payload.musicianInventory)
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
              errorMessage: 'Error al desasociar el elemento de inventario al musico'
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
  
  @Action(GetMusicianInventories)
  getMusicianInventories(
      { patchState }: StateContext<MusicianInventoryStateModel>,
      { payload }: GetMusicianInventories
  ) {
    return this.musicianInventoryService.getMusicianInventories(payload.musicianId)
      .then(          
        async (musicianInventories:MusicianInventory[]) => {                        
            patchState({
              finish: true,
              success: true,
              musicianInventories: musicianInventories,
              musicians: [],
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
            musicianInventories: [],
            musicians: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetMusiciansWithInventoryAssociated)
  getMusiciansWithInventoryAssociated(
      { patchState }: StateContext<MusicianInventoryStateModel>,
      { payload }: GetMusiciansWithInventoryAssociated
  ) {
    return this.musicianInventoryService.getMusiciansWithInventoryAssociated(payload.inventoryId)
      .then(          
        async (musicians:Musician[]) => {                        
            patchState({
              finish: true,
              success: true,
              musicianInventories: [],
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
            musicianInventories: [],
            musicians: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  
  @Action(ResetMusicianInventory)
  resetMusicianInventory(
      { patchState }: StateContext<MusicianInventoryStateModel>,
      { payload }: ResetMusicianInventory
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      musicianInventories: [],
      musicians: []
    })
  }

}
