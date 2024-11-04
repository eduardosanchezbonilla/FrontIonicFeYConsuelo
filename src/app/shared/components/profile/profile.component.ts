import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { User } from 'src/app/models/user/user';
import { UsersService } from 'src/app/services/user/users.service';
import { DEFAULT_VOICE_IMAGE, DEFAULT_MUSICIAN_IMAGE, DEFAULT_USER_IMAGE } from '../../../constants/constants';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports:[IonicModule,CommonModule]
})
export class Profile  {

  @Input() user:User;
  public defaultMusicianImage: string = DEFAULT_MUSICIAN_IMAGE;  
  public defaultUserImage: string = DEFAULT_USER_IMAGE;

  constructor(
    private userService: UsersService
  ) { }

  logout() {
    this.userService.logout();
    this.user = null;  
  }

}
