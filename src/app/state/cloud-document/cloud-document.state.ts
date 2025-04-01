import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CloudDocument } from 'src/app/models/clouddocument/cloud-document';
import { CloudDocumentService } from 'src/app/services/clouddocument/cloud-document.service';
import { DeleteCloudDocument, DownloadCloudDocument, GetCloudDocuments, ResetCloudDocument, UploadCloudDocument } from './cloud-document.actions';

export class CloudDocumentStateModel {
  public documents: CloudDocument[];
  public document: CloudDocument;
  finish: boolean;
  success: boolean;
  errorStatusCode: number;
  errorMessage: string
}

const defaults = {
  documents: [],
  document: new CloudDocument(),
  finish: false,
  success: false,
  errorStatusCode: null,
  errorMessage: null
};

@State<CloudDocumentStateModel>({
  name: 'document',
  defaults
})
@Injectable()
export class CloudDocumentState { 
  
  constructor(    
    private cloudDocumentService: CloudDocumentService    
  ){}

  @Selector()
  static success(state:CloudDocumentStateModel):boolean {
    return state.success;
  }

  @Selector()
  static finish(state:CloudDocumentStateModel):boolean {
    return state.finish;
  }

  @Selector()
  static documents(state:CloudDocumentStateModel):CloudDocument[] {
    return state.documents;
  }
  
  @Selector()
  static document(state:CloudDocumentStateModel):CloudDocument {
    return state.document;
  }

  @Selector()
  static errorStatusCode(state:CloudDocumentStateModel):number {
    return state.errorStatusCode;
  }

  @Selector()
  static errorMessage(state:CloudDocumentStateModel):string {
    return state.errorMessage;
  }

  
  @Action(GetCloudDocuments)
  getgetCloudDocuments(
      { patchState }: StateContext<CloudDocumentStateModel>,
      { payload }: GetCloudDocuments
  ) {
    return this.cloudDocumentService.getCloudDocuments(payload.folderGoogleId)
      .then(
          (documents:CloudDocument[]) => {            
            patchState({
              finish: true,
              success: true,
              documents: documents,
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
            documents: [],
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DownloadCloudDocument)
  downloadCloudDocument(
      { patchState }: StateContext<CloudDocumentStateModel>,
      { payload }: DownloadCloudDocument
  ) {
    return this.cloudDocumentService.downloadCloudDocument(payload.documentGoogleId)
      .then(
          (document:CloudDocument) => {
            patchState({
              finish: true,
              success: true,
              document: document,
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
            document: null,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(UploadCloudDocument)
  uploadCloudDocument(
      { patchState }: StateContext<CloudDocumentStateModel>,
      { payload }: UploadCloudDocument
  ) {
    return this.cloudDocumentService.uploadCloudDocument(payload.cloudDocument)
      .then(
          (document:CloudDocument) => {
            patchState({
              finish: true,
              success: true,
              document: document,
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
            document: null,
            errorStatusCode: error.status,
            errorMessage: error.message
          })
        }
      );
  }

  @Action(DeleteCloudDocument)
  deleteCloudDocument(
      { patchState }: StateContext<CloudDocumentStateModel>,
      { payload }: DeleteCloudDocument
  ) {
    return this.cloudDocumentService.deleteCloudDocument(payload.documentGoogleId)
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
              errorMessage: 'Error al eliminar el documento'
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
        }
      );
  }


  @Action(ResetCloudDocument)
  resetCloudDocument(
      { patchState }: StateContext<CloudDocumentStateModel>,
      { payload }: ResetCloudDocument
  ) {
    patchState({
      finish: false,
      success: true,
      errorStatusCode: null,
      errorMessage: null,
      documents: [],
      document: null
    })
  }

}
