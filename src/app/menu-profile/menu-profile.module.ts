import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MenuProfilePageRoutingModule } from './menu-profile-routing.module';

import { MenuProfilePage } from './menu-profile.page';
import { NgxsModule } from '@ngxs/store';
import { UsersState } from '../state/user/users.state';
import { UsersService } from '../services/user/users.service';
import { MusicianState } from '../state/musician/musician.state';
import { MusicianService } from '../services/musician/musician.service';
import { CameraService } from '../services/camera/camera.service';
import { ModalChangePasswordComponent } from './components/modal-change-password/modal-change-password.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuProfilePageRoutingModule,
    NgxsModule.forFeature([UsersState,MusicianState])
  ],
  declarations: [MenuProfilePage, ModalChangePasswordComponent/*,ModalUserComponent,ModalResetPasswordComponent*/],
  providers:[
    UsersService, MusicianService, CameraService
  ]
})
export class MenuProfilePageModule {}
