import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Video } from 'src/app/models/video/video';
import { VideoGroupByCategory } from 'src/app/models/video/video-group-by-category';
import { VideoService } from 'src/app/services/video/video.service';
import { CreateVideo, DeleteVideo, GetVideosGroupByCategory, ResetVideo, UpdateVideo } from './video.actions';

export class VideoStateModel {
  public videos: Video[];
  public videosGroupByCategory: VideoGroupByCategory[];
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  videos: [],
  videosGroupByCategory: [],
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<VideoStateModel>({
  name: 'videos',
  defaults
})
@Injectable()
export class VideoState {
  
  constructor(
    private videoService: VideoService
  ){}

  @Selector()
  static success(state:VideoStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:VideoStateModel):boolean {
    return state.finish;
  }
  
  @Selector()
  static videos(state:VideoStateModel):Video[] {
    return state.videos;
  }

  @Selector()
  static videosGroupByCategory(state:VideoStateModel):VideoGroupByCategory[] {
    return state.videosGroupByCategory;
  }

  @Selector()
  static errorStatusCode(state:VideoStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:VideoStateModel):string {
    return state.errorMessage;
  }

  @Action(CreateVideo)
  createVideo(
      { patchState }: StateContext<VideoStateModel>,
      { payload }: CreateVideo
  ) {
    return this.videoService.createVideo(payload.video)
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
              errorMessage: 'Error al crear el video'
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

  @Action(UpdateVideo)
  updateVideo(
      { patchState }: StateContext<VideoStateModel>,
      { payload }: UpdateVideo
  ) {
    return this.videoService.updateVideo(payload.id, payload.video)
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
              errorMessage: 'Error al modificar el video'
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

  @Action(GetVideosGroupByCategory)
  getVideosGroupByCategory(
      { patchState }: StateContext<VideoStateModel>,
      { payload }: GetVideosGroupByCategory
  ) {
    return this.videoService.getVideosGroupByCategory(payload.name)
      .then(
          (videosGroupByCategory:VideoGroupByCategory[]) => {
            patchState({
              finish: true,
              success: true,
              videosGroupByCategory: videosGroupByCategory,
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
            videosGroupByCategory: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteVideo)
  deleteVideo(
      { patchState }: StateContext<VideoStateModel>,
      { payload }: DeleteVideo
  ) {
    return this.videoService.deleteVideo(payload.id)
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
              errorMessage: 'Error al eliminar el video'
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

  @Action(ResetVideo)
  resetVideo(
      { patchState }: StateContext<VideoStateModel>,
      { payload }: ResetVideo
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null
    })
  }

}
