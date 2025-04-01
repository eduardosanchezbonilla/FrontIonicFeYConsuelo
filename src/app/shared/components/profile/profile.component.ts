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

  calculateAntiquity(startDate: string | null | undefined): string {
    if (!startDate) return 'Sin antigüedad';

    const start = new Date(startDate);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    // Ajustar años y meses si el mes/día actual es menor que el mes/día de inicio
    if (days < 0) {
        months--; // Restar un mes
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // Último día del mes anterior
        days += lastMonth.getDate(); // Sumar los días del mes anterior
    }

    if (months < 0) {
        years--; // Restar un año
        months += 12; // Ajustar meses
    }

    return `${years} años, ${months} meses y ${days} días`;
  } 

}
