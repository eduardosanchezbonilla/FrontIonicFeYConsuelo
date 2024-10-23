import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Inventory } from 'src/app/models/inventory/inventory';
import { InventoryService } from 'src/app/services/inventory/inventory';
import { CreateInventory, DeleteInventory, GetInventories, ResetInventory, UpdateInventory } from './inventory.actions';

export class InventoryStateModel {
  public inventories: Inventory[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  inventories: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<InventoryStateModel>({
  name: 'inventories',
  defaults
})
@Injectable()
export class InventoryState { 
  
  constructor(    
    private inventoryService: InventoryService   
  ){}

  @Selector()
  static success(state:InventoryStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:InventoryStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static inventorioes(state:InventoryStateModel):Inventory[] {
    return state.inventories;
  }

  @Selector()
  static errorStatusCode(state:InventoryStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:InventoryStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateInventory)
  createInventory(
      { patchState }: StateContext<InventoryStateModel>,
      { payload }: CreateInventory
  ) {
    return this.inventoryService.createInventory(payload.inventory)
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
              errorMessage: 'Error al crear el elemento de inventario'
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

  @Action(UpdateInventory)
  updaveInventory(
      { patchState }: StateContext<InventoryStateModel>,
      { payload }: UpdateInventory
  ) {
    return this.inventoryService.updateInventory(payload.id, payload.inventory)
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
              errorMessage: 'Error al modificar el elemento de inventario'
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

  @Action(GetInventories)
  getInventories(
      { patchState }: StateContext<InventoryStateModel>,
      { payload }: GetInventories
  ) {
    return this.inventoryService.getInventories()
      .then(
          (inventories:Inventory[]) => {
            patchState({
              finish: true,
              success: true,
              inventories: inventories,
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
            inventories: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteInventory)
  deleteInventory(
      { patchState }: StateContext<InventoryStateModel>,
      { payload }: DeleteInventory
  ) {
    return this.inventoryService.deleteInventory(payload.id)
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
              errorMessage: 'Error al eliminar el elemento de inventario'
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

  @Action(ResetInventory)
  resetInventory(
      { patchState }: StateContext<InventoryStateModel>,
      { payload }: ResetInventory
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
