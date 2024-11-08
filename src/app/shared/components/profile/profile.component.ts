import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonicModule, MenuController } from '@ionic/angular';
import { User } from 'src/app/models/user/user';
import { UsersService } from 'src/app/services/user/users.service';
import { DEFAULT_VOICE_IMAGE, DEFAULT_MUSICIAN_IMAGE, DEFAULT_USER_IMAGE } from '../../../constants/constants';
import { TabNavigationService } from 'src/app/services/tab-navigation/tab-navigation.service';

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
    private userService: UsersService,
    private tabNavigationService: TabNavigationService,
    private menuController: MenuController
  ) { }

  onTabSelect(tab: string) {
    this.tabNavigationService.changeTab(tab);
    this.menuController.close();
  }

  logout() {
    this.userService.logout();
    this.user = null;  
  }

}
