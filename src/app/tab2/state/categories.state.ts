import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CreateCategory, DeleteCategory, GetCategories, UpdateCategory } from './categories.actions';
import { Category } from '../models/category';
import { StorageService } from 'src/app/services/storage/storage.service';
import { CategoriesService } from '../services/categories.service';

export class CategoriesStateModel {
  public categories: Category[];
  success: boolean;
}

const defaults = {
  categories: [],
  success: false
};

@State<CategoriesStateModel>({
  name: 'categories',
  defaults
})
@Injectable()
export class CategoriesState {

  constructor(private categoriesService: CategoriesService){}

  @Selector()
  static success(state:CategoriesStateModel):boolean {
    return state.success;
  }

  @Selector()
  static categories(state:CategoriesStateModel):Category[] {
    return state.categories;
  }

  @Action(CreateCategory)
  createCategory(
      { patchState }: StateContext<CategoriesStateModel>,
      { payload }: CreateCategory
  ) {
    return this.categoriesService.createCategory(payload.category).then( (category:Category) => {
        if(category){
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

  @Action(GetCategories)
  getCategories(
      { patchState }: StateContext<CategoriesStateModel>,
      { payload }: GetCategories
  ) {
    return this.categoriesService.getCategories(payload.user).then((categories:Category[]) => {
        patchState({
            categories: categories
        })
      }
    )
  }

  @Action(UpdateCategory)
  updateCategory(
      { patchState }: StateContext<CategoriesStateModel>,
      { payload }: UpdateCategory
  ) {
    return this.categoriesService.updateCategory(payload.updateCategoruDto).then(  (category:Category) => {
        if(category){
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

  @Action(DeleteCategory)
  deleteCategory(
      { patchState }: StateContext<CategoriesStateModel>,
      { payload }: DeleteCategory
  ) {
    return this.categoriesService.deleteCategory(payload.id).then(  (success:boolean) => {
        patchState({
          success
        })        
      }
    )
  }

}
