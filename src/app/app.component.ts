import { Component } from '@angular/core';
import { StorageService } from './services/storage/storage.service';
import { User } from './users/models/user';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  public user:User;
  
  constructor(private storage: StorageService) {}

  async openMenu(){
      this.user = JSON.parse(await this.storage.getItem('user'));      
  }
}
