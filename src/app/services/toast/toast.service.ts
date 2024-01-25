import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) { }

  async presentToast(
      message: string, 
      position: 'top' | 'middle' | 'bottom' = 'bottom',
      duration: number = 2000){

        const toast = await this.toastController.create(
          {
            message,
            position,
            duration
          }
        );

        await toast.present();
  }
}
