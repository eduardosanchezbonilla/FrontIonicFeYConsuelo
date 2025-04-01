import { CloudDocument } from "src/app/models/clouddocument/cloud-document";

export class DownloadCloudDocument {
  static readonly type = '[CloudDocument] Download CloudDocument';
  constructor(public payload: {documentGoogleId: string}) { }
}

export class UploadCloudDocument {
  static readonly type = '[CloudDocument] Upload CloudDocument';
  constructor(public payload: {cloudDocument: CloudDocument}) { }
}

export class DeleteCloudDocument {
  static readonly type = '[CloudDocument] Delete CloudDocument';
  constructor(public payload: {documentGoogleId: string}) { }
}

export class GetCloudDocuments {
  static readonly type = '[CloudDocument] Get CloudDocuments';
  constructor(public payload: {folderGoogleId: string}) { }
}
export class ResetCloudDocument {
  static readonly type = '[CloudDocument] Reset CloudDocument';
  constructor(public payload: {}) { }
}
