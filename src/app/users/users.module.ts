import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { IonicModule } from '@ionic/angular';
import { LoginPage } from './pages/login/login.page';
import { FormsModule } from '@angular/forms';
import { UsersService } from './services/users.service';
import { NgxsModule } from '@ngxs/store';
import { UsersState } from './state/users.state';


@NgModule({
  declarations: [LoginPage],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    UsersRoutingModule,
    NgxsModule.forFeature([
      UsersState
    ])
  ],
  providers: [
    UsersService
  ]
})
export class UsersModule { }
