import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  
  constructor() {}

  async getPhotoBase64(quality:number){   
    const image = await Camera.getPhoto({
      quality: quality,
      allowEditing: false,
      correctOrientation: true,        
      resultType: CameraResultType.Base64, 
      source: CameraSource.Prompt 
    });

    return image.base64String;
  }

}
