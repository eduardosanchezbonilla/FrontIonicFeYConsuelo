import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  /*
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
  */

  //private isLoading = false;
  private loading: HTMLIonLoadingElement | null = null;

  constructor(private loadingController: LoadingController) { 
    // Escuchar cambios en el estado de la app
    App.addListener('appStateChange', (state) => {
      if (!state.isActive) {
        console.log('App en segundo plano, cerrando todos los loadings...');
        this.dismissLoading();
      }
    });
  }

  async presentLoading(message: string = 'Please wait...') {    
    //if (this.isLoading) {
    //  return;
    //}
    //this.isLoading = true;
    this.loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent',  // Puedes usar otros tipos como 'dots', 'lines', 'bubbles', etc.
      backdropDismiss: false,  // Evita que el usuario pueda cerrarlo accidentalmente
      cssClass: 'custom-loading'  // Puedes agregar clases personalizadas si lo deseas
    });

    await this.loading.present();   

    // Si el loading se cierra inesperadamente, restablecemos isLoading
    //this.loading.onDidDismiss().then(() => {
      //this.isLoading = false;
      //this.loading = null;
    //});
  }

  async dismissLoading() {
    try {
      if (this.loading) {
        await this.loading.dismiss();
      }

      // Obtener todos los loadings en la pila
      let index = 0;
      let topLoading = await this.loadingController.getTop();
      while (topLoading && index < 5) {
        index++;
        try{
          await this.loadingController.dismiss();
          topLoading = await this.loadingController.getTop();         
        } catch (error) {
          console.error('Error cerrando los loadings:', error);         
        }        
      }
    } catch (error) {
      console.error('Error cerrando los loadings:', error);
    } finally {
      //this.isLoading = false;
      this.loading = null;
    }    
  }

}
