import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { ResetPasswordDto } from 'src/app/models/user/reset-password-dto';
import { LoadingService } from 'src/app/services/loading/loading.service';

@Component({
  selector: 'app-modal-reset-password',
  templateUrl: './modal-reset-password.component.html',
  styleUrls: ['./modal-reset-password.component.scss'],
})
export class ModalResetPasswordComponent implements OnInit, OnDestroy {
  
  public  resetPassword: ResetPasswordDto;  
  public initScreen = false;
  
  constructor(
  
    private modalController: ModalController,
    private loadingService: LoadingService
  ) { }

  async ngOnInit() {    
    this.resetPassword = new ResetPasswordDto();          
  }

  async ionViewDidEnter(){
    await this.loadingService.dismissLoading();     
  }

  ngOnDestroy() {    
    this.doDestroy();
  }
  
  async ionViewDidLeave(){
    this.doDestroy();
  }

  private doDestroy(){
    ;   
  }

  confirm(){
    this.modalController.dismiss(this.resetPassword, 'confirm');
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  closeModal(modal: IonModal) {
    modal.dismiss();
  }

}
