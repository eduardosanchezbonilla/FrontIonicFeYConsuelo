import { Component,  Input,  OnDestroy, OnInit } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { ChangePasswordDto } from 'src/app/models/user/change-password-dto';
import { LoadingService } from 'src/app/services/loading/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { UsersService } from 'src/app/services/user/users.service';
import { UpdateUserPassword } from 'src/app/state/user/users.actions';
import { UsersState } from 'src/app/state/user/users.state';

@Component({
  selector: 'app-modal-change-password',
  templateUrl: './modal-change-password.component.html',
  styleUrls: ['./modal-change-password.component.scss'],
})
export class ModalChangePasswordComponent implements OnInit, OnDestroy {
 
  changePassword: ChangePasswordDto;
  
  public initScreen = false;
  public initSearchFinish = false;

  public showCurrentPassword: boolean = false;
  public showNewPassword: boolean = false;
  public showRepeatNewPassword: boolean = false;

  @Input() username: string;
  
  constructor(    
    private modalController: ModalController,
    private loadingService: LoadingService,
    private userService: UsersService,    
    private store:Store,
    private toast:ToastService,            
  ) { }

  async ngOnInit() {
    this.changePassword = new ChangePasswordDto();
    this.changePassword.currentPassword = '';
    this.changePassword.newPassword = '';
    this.changePassword.repeatNewPassword = '';

    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showRepeatNewPassword = false;
   
  }

  async dismissInitialLoading(){
    if(this.initScreen){
      await this.loadingService.dismissLoading();         
    }
  }

  async ionViewDidEnter(){
    this.initScreen = true;    
    this.dismissInitialLoading();    
  }

  ngOnDestroy() {    
    this.doDestroy();
  }
  
  async ionViewDidLeave(){
    this.doDestroy();
  }

  private doDestroy(){
    console.log("ngOnDestroy change password");   
  }

  toggleCurrentPasswordVisibility() {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleNewRepeatPasswordVisibility() {
    this.showRepeatNewPassword = !this.showRepeatNewPassword;
  }

  async changeExpiredPassword(){   
    await this.loadingService.presentLoading('Loading...');
    this.changePassword.username = this.username;
    this.store.dispatch(new UpdateUserPassword({user:this.changePassword})).subscribe({
      next: async () => {
        let success = this.store.selectSnapshot(UsersState.success);
        if(success){                              
          this.toast.presentToast("Password actualizado correctamente");          
          this.modalController.dismiss(null, 'cancel');
        }
        else{
          const errorStatusCode = this.store.selectSnapshot(UsersState.errorStatusCode);
          const errorMessage = this.store.selectSnapshot(UsersState.errorMessage);        
          // si el token ha caducado (403) lo sacamos de la aplicacion
          if(errorStatusCode==403){       
            this.modalController.dismiss(null, 'cancel');     
            this.userService.logout("Ha caducado la sesion, debe logarse de nuevo");
          }
          else{
            this.toast.presentToast(errorMessage);
          }                    
        }
        await this.loadingService.dismissLoading();
      } 
    })    
  }

  cancel(){
    this.modalController.dismiss(null, 'cancel');
  }

  closeModal(modal: IonModal) {
    modal.dismiss();
  }

}
