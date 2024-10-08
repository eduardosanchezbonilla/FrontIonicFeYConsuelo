import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loading: HTMLIonLoadingElement;

  constructor(private loadingController: LoadingController) { }

  async presentLoading(message: string = 'Please wait...') {
    this.loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent',  // Puedes usar otros tipos como 'dots', 'lines', 'bubbles', etc.
      backdropDismiss: false,  // Evita que el usuario pueda cerrarlo accidentalmente
      cssClass: 'custom-loading'  // Puedes agregar clases personalizadas si lo deseas
    });

    await this.loading.present();
  }

  async dismissLoading() {
    if (this.loading) {
      await this.loading.dismiss();
    }
  }
}
