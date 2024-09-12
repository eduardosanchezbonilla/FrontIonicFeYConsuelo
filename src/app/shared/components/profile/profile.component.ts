import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AlertController, IonicModule, MenuController, NavController } from '@ionic/angular';
import { Store } from '@ngxs/store';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { User } from 'src/app/users/models/user';
import { /*DeleteUser,*/ Logout } from 'src/app/users/state/users.actions';
import { UsersState } from 'src/app/users/state/users.state';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports:[IonicModule,CommonModule]
})
export class Profile  {

  @Input() user:User;

  constructor(
    private store:Store,
    private navController:NavController,
    private menuController: MenuController,
    private alertController: AlertController,
    private toastService: ToastService) { }

  logout() {
    this.store.dispatch(new Logout());
    this.menuController.close("content");
    this.user = null;
    this.navController.navigateForward('login');
  }

  /*async confirmDeleteUser() {
    const alert = await this.alertController.create({
        header: 'Confirmacion',
        message: '¿Estas seguro de eliminar tu cuenta? Todos los datos serán eliminados',
        buttons: [
          {
            text: 'No',
            role: 'cancel'
          },
          {
            text: 'Si',
            role: 'confirm',
            handler: () => {
              this.deleteUser()
            }
          }
        ]
    });
    alert.present();
  }

  deleteUser() {
    this.store.dispatch(new DeleteUser({idUser: this.user._id})).subscribe({
      next: () => {
        const success = this.store.selectSnapshot(UsersState.success);
        if(success){
          this.toastService.presentToast("Cuenta eliminada");
          this.logout();
        }
        else{
          this.toastService.presentToast("Error al eliminar la cuenta");
        }
      }
    })
  
  }*/

}
