import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { RepertoireCategoryService } from 'src/app/services/repertoire-category/repertoire-category.service';
import { RepertoireCategory } from 'src/app/models/repertoire-category/repertoire-category';
import { CreateRepertoireCategory, DeleteRepertoireCategory, GetRepertoireCategories, ResetRepertoireCategory, UpdateRepertoireCategory } from './repertoire-category.actions';

export class RepertoireCategoryStateModel {
  public repertoireCategories: RepertoireCategory[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  repertoireCategories: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<RepertoireCategoryStateModel>({
  name: 'repertoireCategories',
  defaults
})
@Injectable()
export class RepertoireCategoryState { 
  
  constructor(    
    private repertoireCategoryService: RepertoireCategoryService   
  ){}

  @Selector()
  static success(state:RepertoireCategoryStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:RepertoireCategoryStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static repertoireCategories(state:RepertoireCategoryStateModel):RepertoireCategory[] {
    return state.repertoireCategories;
  }

  @Selector()
  static errorStatusCode(state:RepertoireCategoryStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:RepertoireCategoryStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateRepertoireCategory)
  createRepertoireCategory(
      { patchState }: StateContext<RepertoireCategoryStateModel>,
      { payload }: CreateRepertoireCategory
  ) {
    return this.repertoireCategoryService.createRepertoireCategory(payload.repertoireCategory)
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
              errorMessage: 'Error al crear la categoria de repertorio'
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

  @Action(UpdateRepertoireCategory)
  updaveRepertoireCategory(
      { patchState }: StateContext<RepertoireCategoryStateModel>,
      { payload }: UpdateRepertoireCategory
  ) {
    return this.repertoireCategoryService.updateRepertoireCategory(payload.id, payload.repertoireCategory)
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
              errorMessage: 'Error al modificar la categoria de repertorio'
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

  @Action(GetRepertoireCategories)
  getRepertoireCategories(
      { patchState }: StateContext<RepertoireCategoryStateModel>,
      { payload }: GetRepertoireCategories
  ) {
    return this.repertoireCategoryService.getRepertoireCategories()
      .then(
          (repertoireCategories:RepertoireCategory[]) => {
            patchState({
              finish: true,
              success: true,
              repertoireCategories: repertoireCategories,
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
            repertoireCategories: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteRepertoireCategory)
  deleteRepertoireCategory(
      { patchState }: StateContext<RepertoireCategoryStateModel>,
      { payload }: DeleteRepertoireCategory
  ) {
    return this.repertoireCategoryService.deleteRepertoireCategory(payload.id)
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
              errorMessage: 'Error al eliminar la categoria de repertorio'
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

  @Action(ResetRepertoireCategory)
  resetRepertoireCategory(
      { patchState }: StateContext<RepertoireCategoryStateModel>,
      { payload }: ResetRepertoireCategory
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
