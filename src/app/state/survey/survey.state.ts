import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Survey } from 'src/app/models/survey/survey-dto';
import { SurveyService } from 'src/app/services/survey/survey.service';
import { CreateSurvey, DeleteSurvey, GetSurvey, GetSurveys, ResetSurvey, UpdateSurvey, VoteSurvey } from './survey.actions';

export class SurveyStateModel {
  public surveys: Survey[];
  public survey: Survey;
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  surveys: [],  
  survey: null,  
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<SurveyStateModel>({
  name: 'surveys',
  defaults
})
@Injectable()
export class SurveyState {
  
  constructor(
    private surveyService: SurveyService
  ){}

  @Selector()
  static success(state:SurveyStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:SurveyStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static surveys(state:SurveyStateModel):Survey[] {
    return state.surveys;
  }

  @Selector()
  static survey(state:SurveyStateModel):Survey {
    return state.survey;
  }

  @Selector()
  static errorStatusCode(state:SurveyStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:SurveyStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateSurvey)
  createSurvey(
      { patchState }: StateContext<SurveyStateModel>,
      { payload }: CreateSurvey
  ) {
    return this.surveyService.createSurvey(payload.survey)
      .then( 
        async (success:boolean) => {
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
              errorMessage: 'Error al crear la encuesta'
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

  @Action(UpdateSurvey)
  updateSurvey(
      { patchState }: StateContext<SurveyStateModel>,
      { payload }: UpdateSurvey
  ) {
    return this.surveyService.updateSurvey(payload.id, payload.survey)
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
              errorMessage: 'Error al modificar la encuesta'
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

  @Action(GetSurveys)
  getSurveys(
      { patchState }: StateContext<SurveyStateModel>,
      { payload }: GetSurveys
  ) {
    return this.surveyService.getSurveys()
      .then(
          (surveys:Survey[]) => {
            patchState({
              finish: true,
              success: true,
              surveys: surveys,
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
            surveys: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(GetSurvey)
  getSurvey(
      { patchState }: StateContext<SurveyStateModel>,
      { payload }: GetSurvey
  ) {
    return this.surveyService.getSurvey(payload.id)
      .then(
          (survey:Survey) => {
            patchState({
              finish: true,
              success: true,
              survey: survey,
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
            survey: null,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteSurvey)
  deleteSurvey(
      { patchState }: StateContext<SurveyStateModel>,
      { payload }: DeleteSurvey
  ) {
    return this.surveyService.deleteSurvey(payload.id)
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
              errorMessage: 'Error al eliminar la encuesta'
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

  @Action(VoteSurvey)
  voteSurvey(
      { patchState }: StateContext<SurveyStateModel>,
      { payload }: VoteSurvey
  ) {
    return this.surveyService.voteSurvey(payload.id, payload.surveyVote)
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
              errorMessage: 'Error al realizar la votación'
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

  @Action(ResetSurvey)
  resetSurvey(
      { patchState }: StateContext<SurveyStateModel>,
      { payload }: ResetSurvey
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
