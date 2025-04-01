import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { DeleteContract, DownloadContract, GetContracts, ResetContract, UploadContract } from './contract.actions'
import { Contract } from 'src/app/models/contract/contract';
import { ContractService } from 'src/app/services/contract/contract.service';

export class ContractStateModel {
  public contracts: Contract[];
  public contract: Contract;
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  contracts: [],
  contract: new Contract(),
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<ContractStateModel>({
  name: 'contract',
  defaults
})
@Injectable()
export class ContractState { 
  
  constructor(    
    private contractService: ContractService    
  ){}

  @Selector()
  static success(state:ContractStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:ContractStateModel):boolean {
    return state.finish;
  }

  @Selector()
  static contracts(state:ContractStateModel):Contract[] {
    return state.contracts;
  }
  
  @Selector()
  static contract(state:ContractStateModel):Contract {
    return state.contract;
  }

  @Selector()
  static errorStatusCode(state:ContractStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:ContractStateModel):string {
    return state.errorMessage;
  }

  
  @Action(GetContracts)
  getContracts(
      { patchState }: StateContext<ContractStateModel>,
      { payload }: GetContracts
  ) {
    return this.contractService.getContracts(payload.contractGroupGoogleId)
      .then(
          (contracts:Contract[]) => {            
            patchState({
              finish: true,
              success: true,
              contracts: contracts,
              contract: null,
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
            contracts: [],
            contract: null,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DownloadContract)
  downloadContract(
      { patchState }: StateContext<ContractStateModel>,
      { payload }: DownloadContract
  ) {
    return this.contractService.downloadContract(payload.contractGoogleId)
      .then(
          (contract:Contract) => {
            patchState({
              finish: true,
              success: true,
              contracts: [],
              contract: contract,
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
            contracts: [],
            contract: null,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(UploadContract)
  uploadContract(
      { patchState }: StateContext<ContractStateModel>,
      { payload }: UploadContract
  ) {
    return this.contractService.uploadContract(payload.contract)
      .then(
          (contract:Contract) => {
            patchState({
              finish: true,
              success: true,
              contracts: [],
              contract: contract,
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
            contracts: [],
            contract: null,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteContract)
  deleteContract(
      { patchState }: StateContext<ContractStateModel>,
      { payload }: DeleteContract
  ) {
    return this.contractService.deleteContract(payload.contractGoogleId)
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
              errorMessage: 'Error al eliminar el contrato'
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
        }
      );
  }


  @Action(ResetContract)
  resetContract(
      { patchState }: StateContext<ContractStateModel>,
      { payload }: ResetContract
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      contracts: [],
      contract: null
    })
  }

}
