import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CreateContractGroup, DeleteContractGroup, GetContractGroups, ResetContractGroup, UpdateContractGroup } from './contract-group.actions'
import { ContractGroup } from 'src/app/models/contract-group/contract-group';
import { ContractGroupService } from 'src/app/services/contract-group/contract-group.service';

export class ContractGroupStateModel {
  public contractGroups: ContractGroup[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  contractGroups: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<ContractGroupStateModel>({
  name: 'contractGroups',
  defaults
})
@Injectable()
export class ContractGroupState { 
  
  constructor(    
    private contractGroupService: ContractGroupService    
  ){}

  @Selector()
  static success(state:ContractGroupStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:ContractGroupStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static contractGroups(state:ContractGroupStateModel):ContractGroup[] {
    return state.contractGroups;
  }

  @Selector()
  static errorStatusCode(state:ContractGroupStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:ContractGroupStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateContractGroup)
  createContractGroup(
      { patchState }: StateContext<ContractGroupStateModel>,
      { payload }: CreateContractGroup
  ) {
    return this.contractGroupService.createContractGroup(payload.contractGroup)
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

  @Action(UpdateContractGroup)
  updateContractGroup(
      { patchState }: StateContext<ContractGroupStateModel>,
      { payload }: UpdateContractGroup
  ) {
    return this.contractGroupService.updateContractGroup(payload.id, payload.contractGroup)
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

  @Action(GetContractGroups)
  getContractGroups(
      { patchState }: StateContext<ContractGroupStateModel>,
      { payload }: GetContractGroups
  ) {
    return this.contractGroupService.getContractGroups()
      .then(          
        async (contractGroups:ContractGroup[]) => {                        
            patchState({
              finish: true,
              success: true,
              contractGroups: contractGroups,
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
            contractGroups: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteContractGroup)
  deleteContractGroup(
      { patchState }: StateContext<ContractGroupStateModel>,
      { payload }: DeleteContractGroup
  ) {
    return this.contractGroupService.deleteContractGroup(payload.id)
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

  @Action(ResetContractGroup)
  resetContractGroup(
      { patchState }: StateContext<ContractGroupStateModel>,
      { payload }: ResetContractGroup
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      contractGroups: []
    })
  }

}
