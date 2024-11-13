import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { VideoCategory } from 'src/app/models/video-category/video-category';
import { VideoCategoryService } from 'src/app/services/video-category/video-category.service';
import { CreateVideoCategory, DeleteVideoCategory, GetVideoCategories, ResetVideoCategory, UpdateVideoCategory } from './video-category.actions';

export class VideoCategoryStateModel {
  public videoCategories: VideoCategory[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  videoCategories: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<VideoCategoryStateModel>({
  name: 'videoCategories',
  defaults
})
@Injectable()
export class VideoCategoryState { 
  
  constructor(    
    private videoCategoryService: VideoCategoryService    
  ){}

  @Selector()
  static success(state:VideoCategoryStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:VideoCategoryStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static videoCategories(state:VideoCategoryStateModel):VideoCategory[] {
    return state.videoCategories;
  }

  @Selector()
  static errorStatusCode(state:VideoCategoryStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:VideoCategoryStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateVideoCategory)
  createVideoCategory(
      { patchState }: StateContext<VideoCategoryStateModel>,
      { payload }: CreateVideoCategory
  ) {
    return this.videoCategoryService.createVideoCategory(payload.videoCategory)
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
              errorMessage: 'Error al crear la categoria de videos'
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

  @Action(UpdateVideoCategory)
  updaveVideoCategory(
      { patchState }: StateContext<VideoCategoryStateModel>,
      { payload }: UpdateVideoCategory
  ) {
    return this.videoCategoryService.updateVideoCategory(payload.id, payload.videoCategory)
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
              errorMessage: 'Error al modificar la categoria de videos'
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

  @Action(GetVideoCategories)
  getVideoCategories(
      { patchState }: StateContext<VideoCategoryStateModel>,
      { payload }: GetVideoCategories
  ) {
    return this.videoCategoryService.getVideoCategories()
      .then(
          (videoCategories:VideoCategory[]) => {
            patchState({
              finish: true,
              success: true,
              videoCategories: videoCategories,
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
            videoCategories: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteVideoCategory)
  deleteVideoCategory(
      { patchState }: StateContext<VideoCategoryStateModel>,
      { payload }: DeleteVideoCategory
  ) {
    return this.videoCategoryService.deleteVideoCategory(payload.id)
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
              errorMessage: 'Error al eliminar la categoria de videos'
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

  @Action(ResetVideoCategory)
  resetVideoCategory(
      { patchState }: StateContext<VideoCategoryStateModel>,
      { payload }: ResetVideoCategory
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
