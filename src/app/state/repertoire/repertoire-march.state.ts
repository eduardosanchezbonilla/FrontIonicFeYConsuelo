import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { RepertoireMarchService } from 'src/app/services/repertoire/repertoire-march.service';
import { RepertoireMarch } from 'src/app/models/repertoire/repertoire-march';
import { RepertoireMarchGroupByType } from 'src/app/models/repertoire/repertoire-march-group-by-type';
import { CreateRepertoireMarch, DeleteRepertoireMarch, GetRepertoireMarchs, GetCategoryRepertoireMarchsGroupByType, ResetRepertoireMarch, UpdateRepertoireMarch, GetRepertoireMarchsGroupByType } from './repertoire-march.actions';
import { CreateRepertoireMarchType } from '../repertoire-march-type/repertoire-march-type.actions';

export class RepertoireMarchStateModel {
  public repertoireMarchs: RepertoireMarch[];
  public repertoireMarchsGroupByType: RepertoireMarchGroupByType[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  repertoireMarchs: [],
  repertoireMarchsGroupByType: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<RepertoireMarchStateModel>({
  name: 'repertoireMarchs',
  defaults
})
@Injectable()
export class RepertoireMarchState { 
  
  constructor(    
    private repertoireMarchService: RepertoireMarchService   
  ){}

  @Selector()
  static success(state:RepertoireMarchStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:RepertoireMarchStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static repertoireMarchs(state:RepertoireMarchStateModel):RepertoireMarch[] {
    return state.repertoireMarchs;
  }

  @Selector()
  static repertoireMarchsGroupByType(state:RepertoireMarchStateModel):RepertoireMarchGroupByType[] {
    return state.repertoireMarchsGroupByType;
  }

  @Selector()
  static errorStatusCode(state:RepertoireMarchStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:RepertoireMarchStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateRepertoireMarch)
  createRepertoireMarch(
      { patchState }: StateContext<RepertoireMarchStateModel>,
      { payload }: CreateRepertoireMarch
  ) {
    return this.repertoireMarchService.createRepertoireMarch(payload.repertoireMarch)
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
              errorMessage: 'Error al crear la marcha de repertorio'
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

  @Action(UpdateRepertoireMarch)
  updaveRepertoireMarch(
      { patchState }: StateContext<RepertoireMarchStateModel>,
      { payload }: UpdateRepertoireMarch
  ) {
    return this.repertoireMarchService.updateRepertoireMarch(payload.id, payload.repertoireMarch)
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
              errorMessage: 'Error al modificar la marcha de repertorio'
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

  @Action(GetRepertoireMarchs)
  getrepertoireMarchs(
      { patchState }: StateContext<RepertoireMarchStateModel>,
      { payload }: GetRepertoireMarchs
  ) {
    return this.repertoireMarchService.getRepertoireMarchs()
      .then(
          (repertoireMarchs:RepertoireMarch[]) => {            
            patchState({
              finish: true,
              success: true,
              repertoireMarchs: repertoireMarchs,
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
            repertoireMarchs: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetCategoryRepertoireMarchsGroupByType)
  getCategoryRepertoireMarchsGroupByType(
      { patchState }: StateContext<RepertoireMarchStateModel>,
      { payload }: GetCategoryRepertoireMarchsGroupByType
  ) {
    return this.repertoireMarchService.getCategoryRepertoireMarchsGroupByType(payload.categoryId, payload.name)
      .then(
          (repertoireMarchsGroupByType:RepertoireMarchGroupByType[]) => {            
            patchState({
              finish: true,
              success: true,
              repertoireMarchsGroupByType: repertoireMarchsGroupByType,
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
            repertoireMarchsGroupByType: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetRepertoireMarchsGroupByType)
  getRepertoireMarchsGroupByType(
      { patchState }: StateContext<RepertoireMarchStateModel>,
      { payload }: GetRepertoireMarchsGroupByType
  ) {
    return this.repertoireMarchService.getRepertoireMarchsGroupByType(payload.name, payload.current)
      .then(
          (repertoireMarchsGroupByType:RepertoireMarchGroupByType[]) => {            
            patchState({
              finish: true,
              success: true,
              repertoireMarchsGroupByType: repertoireMarchsGroupByType,
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
            repertoireMarchsGroupByType: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteRepertoireMarch)
  deleteRepertoireMarch(
      { patchState }: StateContext<RepertoireMarchStateModel>,
      { payload }: DeleteRepertoireMarch
  ) {
    return this.repertoireMarchService.deleteRepertoireMarch(payload.id)
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
              errorMessage: 'Error al eliminar la marhca de repertorio'
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

  @Action(ResetRepertoireMarch)
  resetRepertoireMarch(
      { patchState }: StateContext<RepertoireMarchStateModel>,
      { payload }: ResetRepertoireMarch
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
