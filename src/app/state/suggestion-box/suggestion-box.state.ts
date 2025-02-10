import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { SuggestionBoxGroupByUserResponse } from 'src/app/models/suggestion-box/suggestion-box-group-by-user-response';
import { SuggestionBoxService } from 'src/app/services/suggestion-box/suggestion-box.service';
import { CreateSuggestionBox, GetSuggestionBoxGroupByUser, MarkReadUnread, ResetSuggestionBox } from './suggestion-box.actions';

export class SuggestionBoxStateModel {
  suggestionBoxGroupByUser: SuggestionBoxGroupByUserResponse[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  suggestionBoxGroupByUser: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<SuggestionBoxStateModel>({
  name: 'suggestionBox',
  defaults
})
@Injectable()
export class SuggestionBoxState { 
  
  constructor(    
    private suggestionBoxService: SuggestionBoxService
  ){}

  @Selector()
  static success(state:SuggestionBoxStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:SuggestionBoxStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static suggestionBoxGroupByUser(state:SuggestionBoxStateModel):SuggestionBoxGroupByUserResponse[] {
    return state.suggestionBoxGroupByUser;
  }

  @Selector()
  static errorStatusCode(state:SuggestionBoxStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:SuggestionBoxStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateSuggestionBox)
  createSuggestionBox(
      { patchState }: StateContext<SuggestionBoxStateModel>,
      { payload }: CreateSuggestionBox
  ) {
    return this.suggestionBoxService.creatSuggestionBox(payload.suggestionBoxRequest)
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
              errorMessage: 'Error al crear el mensaje en el buzón de sugerencias'
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

  @Action(GetSuggestionBoxGroupByUser)
  getSuggestionBoxGroupByUser(
      { patchState }: StateContext<SuggestionBoxStateModel>,
      { payload }: GetSuggestionBoxGroupByUser
  ) {
    return this.suggestionBoxService.getAllSuggestionBoxGroupByUser(payload.all)
      .then(          
        async (suggestionBoxGroupByUser:SuggestionBoxGroupByUserResponse[]) => {                        
            patchState({
              finish: true,
              success: true,
              suggestionBoxGroupByUser: suggestionBoxGroupByUser,
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
            suggestionBoxGroupByUser: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }
  
  @Action(MarkReadUnread)
  markReadUnreadSuggestionBox(
      { patchState }: StateContext<SuggestionBoxStateModel>,
      { payload }: MarkReadUnread
  ) {
    return this.suggestionBoxService.markReadUnread(payload.suggestionBoxRequest)
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
              errorMessage: 'Error al marcar/desmarcar como leida el mensaje del buzón de sugerencias'
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

  @Action(ResetSuggestionBox)
  resetSuggestionBox(
      { patchState }: StateContext<SuggestionBoxStateModel>,
      { payload }: ResetSuggestionBox
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,    
      suggestionBoxGroupByUser: []
    })
  }

}
