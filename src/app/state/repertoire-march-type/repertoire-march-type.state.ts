import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { RepertoireMarchTypeService } from 'src/app/services/repertoire-march-type/repertoire-march-type.service';
import { RepertoireMarchType } from 'src/app/models/repertoire-march-type/repertoire-march-type';
import { CreateRepertoireMarchType, DeleteRepertoireMarchType, GetRepertoireMarchTypes, ResetRepertoireMarchType, UpdateRepertoireMarchType } from './repertoire-march-type.actions';

export class RepertoireMarchTypeStateModel {
  public repertoireMarchTypes: RepertoireMarchType[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  repertoireMarchTypes: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<RepertoireMarchTypeStateModel>({
  name: 'repertoireMarchTypes',
  defaults
})
@Injectable()
export class RepertoireMarchTypeState { 
  
  constructor(    
    private repertoireMarchTypeService: RepertoireMarchTypeService   
  ){}

  @Selector()
  static success(state:RepertoireMarchTypeStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:RepertoireMarchTypeStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static repertoireMarchTypes(state:RepertoireMarchTypeStateModel):RepertoireMarchType[] {
    return state.repertoireMarchTypes;
  }

  @Selector()
  static errorStatusCode(state:RepertoireMarchTypeStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:RepertoireMarchTypeStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateRepertoireMarchType)
  createRepertoireMarchType(
      { patchState }: StateContext<RepertoireMarchTypeStateModel>,
      { payload }: CreateRepertoireMarchType
  ) {
    return this.repertoireMarchTypeService.createRepertoireMarchType(payload.repertoireMarchType)
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
              errorMessage: 'Error al crear el tipo de marcha de repertorio'
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

  @Action(UpdateRepertoireMarchType)
  updaveRepertoireMarchType(
      { patchState }: StateContext<RepertoireMarchTypeStateModel>,
      { payload }: UpdateRepertoireMarchType
  ) {
    return this.repertoireMarchTypeService.updateRepertoireMarchType(payload.id, payload.repertoireMarchType)
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
              errorMessage: 'Error al modificar el tipo de marcha de repertorio'
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

  @Action(GetRepertoireMarchTypes)
  getrepertoireMarchTypes(
      { patchState }: StateContext<RepertoireMarchTypeStateModel>,
      { payload }: GetRepertoireMarchTypes
  ) {
    return this.repertoireMarchTypeService.getRepertoireMarchTypes()
      .then(
          (repertoireMarchTypes:RepertoireMarchType[]) => {
            patchState({
              finish: true,
              success: true,
              repertoireMarchTypes: repertoireMarchTypes,
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
            repertoireMarchTypes: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteRepertoireMarchType)
  deleteRepertoireMarchType(
      { patchState }: StateContext<RepertoireMarchTypeStateModel>,
      { payload }: DeleteRepertoireMarchType
  ) {
    return this.repertoireMarchTypeService.deleteRepertoireMarchType(payload.id)
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
              errorMessage: 'Error al eliminar el tipo de marhca de repertorio'
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

  @Action(ResetRepertoireMarchType)
  resetRepertoireMarchType(
      { patchState }: StateContext<RepertoireMarchTypeStateModel>,
      { payload }: ResetRepertoireMarchType
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
