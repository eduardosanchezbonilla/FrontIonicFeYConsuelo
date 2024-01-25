import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { ItemsService } from '../services/items.service';
import { CreateItem, DeleteItem, GetItems, UpdateItem, UpdateStatusItem } from './items.actions';
import { Item } from '../models/item';

export class ItemsStateModel {
  items: Item[];
  success: boolean;
}

const defaults = {
  items: [],
  success: false
};

@State<ItemsStateModel>({
  name: 'items',
  defaults
})
@Injectable()
export class ItemsState {

  constructor(private itemService: ItemsService){}

  @Selector()
  static success(state:ItemsStateModel):boolean {
    return state.success;
  }

  @Selector()
  static items(state:ItemsStateModel):Item[] {
    return state.items;
  }

  @Action(CreateItem)
  createItem(
      { patchState }: StateContext<ItemsStateModel>,
      { payload }: CreateItem
  ) {
    return this.itemService.createItem(payload.item).then( (item:Item) => {
        if(item){
          patchState({
            success: true
          })
        }
        else{
          patchState({
            success: false
          })
        }
      }
    )
  }

  @Action(GetItems)
  getItems(
      { patchState }: StateContext<ItemsStateModel>,
      { payload }: GetItems
  ) {
    return this.itemService.getItems(payload.description, payload.user).then((items:Item[]) => {
        patchState({
          items: items
        })
      }
    )
  }

  @Action(UpdateItem)
  updateItem(
      { patchState }: StateContext<ItemsStateModel>,
      { payload }: UpdateItem
  ) {
    return this.itemService.updateItem(payload.id, payload.newItem).then( (item:Item) => {
        if(item){
          patchState({
            success: true
          })
        }
        else{
          patchState({
            success: false
          })
        }
      }
    )
  }

  @Action(UpdateStatusItem)
  updateStatusItem(
      { patchState }: StateContext<ItemsStateModel>,
      { payload }: UpdateStatusItem
  ) {
    return this.itemService.updateStatusItem(payload.id).then( (item:Item) => {
        if(item){
          patchState({
            success: true
          })
        }
        else{
          patchState({
            success: false
          })
        }
      }
    )
  }

  @Action(DeleteItem)
  deleteItem(
      { patchState }: StateContext<ItemsStateModel>,
      { payload }: DeleteItem
  ) {
    return this.itemService.deleteItem(payload.id).then( (success:boolean) => {
      patchState({
        success
      })
    })
  }

}
