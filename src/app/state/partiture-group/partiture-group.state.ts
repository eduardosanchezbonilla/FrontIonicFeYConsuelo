import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CreatePartitureGroup, DeletePartitureGroup, GetPartitureGroups, ResetPartitureGroup, UpdatePartitureGroup } from './partiture-group.actions'
import { PartitureGroup } from 'src/app/models/partiture-group/partiture-group';
import { PartitureGroupService } from 'src/app/services/partiture-group/partiture-group.service';

export class PartitureGroupStateModel {
  public partitureGroups: PartitureGroup[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  partitureGroups: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<PartitureGroupStateModel>({
  name: 'partitureGroups',
  defaults
})
@Injectable()
export class PartitureGroupState { 
  
  constructor(    
    private partitureGroupService: PartitureGroupService    
  ){}

  @Selector()
  static success(state:PartitureGroupStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:PartitureGroupStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static partitureGroups(state:PartitureGroupStateModel):PartitureGroup[] {
    return state.partitureGroups;
  }

  @Selector()
  static errorStatusCode(state:PartitureGroupStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:PartitureGroupStateModel):string {
    return state.errorMessage;
  }

  @Action(CreatePartitureGroup)
  createPartitureGroup(
      { patchState }: StateContext<PartitureGroupStateModel>,
      { payload }: CreatePartitureGroup
  ) {
    return this.partitureGroupService.createPartitureGroup(payload.partitureGroup)
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
              errorMessage: 'Error al crear el grupo de partituras'
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

  @Action(UpdatePartitureGroup)
  updatePartitureGroup(
      { patchState }: StateContext<PartitureGroupStateModel>,
      { payload }: UpdatePartitureGroup
  ) {
    return this.partitureGroupService.updatePartitureGroup(payload.id, payload.partitureGroup)
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
              errorMessage: 'Error al modificar el grupo de partituras'
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

  @Action(GetPartitureGroups)
  getPartitureGroups(
      { patchState }: StateContext<PartitureGroupStateModel>,
      { payload }: GetPartitureGroups
  ) {
    return this.partitureGroupService.getPartitureGroups()
      .then(          
        async (partitureGroups:PartitureGroup[]) => {                        
            patchState({
              finish: true,
              success: true,
              partitureGroups: partitureGroups,
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
            partitureGroups: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeletePartitureGroup)
  deletePartitureGroup(
      { patchState }: StateContext<PartitureGroupStateModel>,
      { payload }: DeletePartitureGroup
  ) {
    return this.partitureGroupService.deletePartitureGroup(payload.id)
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
              errorMessage: 'Error al eliminar el grupo de partituras'
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

  @Action(ResetPartitureGroup)
  resetPartitureGroup(
      { patchState }: StateContext<PartitureGroupStateModel>,
      { payload }: ResetPartitureGroup
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      partitureGroups: []
    })
  }

}
