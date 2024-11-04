import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuUserPageRoutingModule } from './menu-user-routing.module';

import { MenuUserPage } from './menu-user.page';
import { NgxsModule } from '@ngxs/store';
import { UsersState, UsersStateModel } from '../state/user/users.state';
import { ModalUserComponent } from './components/modal-user/modal-user.component';
import { UsersService } from '../services/user/users.service';
import { ModalResetPasswordComponent } from './components/modal-reset-password/modal-reset-password.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuUserPageRoutingModule,
    NgxsModule.forFeature([UsersState])
  ],
  declarations: [MenuUserPage,ModalUserComponent,ModalResetPasswordComponent],
  providers:[
    UsersService
  ]
})
export class MenuUserPageModule {}
