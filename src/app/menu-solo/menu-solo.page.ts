import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsersService } from '../services/user/users.service';
import { StorageService } from '../services/storage/storage.service';
import { DEFAULT_MUSICIAN_IMAGE } from '../constants/constants';
import { User } from '../models/user/user';
import { LoadingService } from '../services/loading/loading.service';
import { ResetMusicianMarchSolo } from '../state/musician-march-solo/musician-march-solo.actions';
import { Store } from '@ngxs/store';
import { MusicianMarchSoloResponse } from '../models/musician-march-solo/musician-march-solo-response';
import { Musician } from '../models/musician/musician';

@Component({
  selector: 'app-menu-solo',
  templateUrl: './menu-solo.page.html',
  styleUrls: ['./menu-solo.page.scss'],
})
export class MenuSoloPage implements OnDestroy {

  public defaultMusicianImage: string = DEFAULT_MUSICIAN_IMAGE;

  public user: User;
  public profile: string;  
  public initScreen = false;  

  public musicianMarchSolos: MusicianMarchSoloResponse[];
  public musician: Musician;
  public showImage: string;
  public isLoading = true;

  constructor(
    private userService: UsersService,
    private storage: StorageService,
    private loadingService: LoadingService,
    private store:Store
  ) { }

  logout(){
    this.doDestroy();
    this.userService.logout();
  }

  async ionViewWillEnter(){      
    this.user = JSON.parse(await this.storage.getItem('user'));         
    this.profile = await this.storage.getItem('profile');     
    this.musicianMarchSolos = this.user.musicianMarchSolos;
    this.musician = this.user.musician;   

    if(this.musician.image){
      this.showImage = `data:image/jpeg;base64,${this.musician.image}`;      
    }
    else{
      this.showImage = `data:image/jpeg;base64,${DEFAULT_MUSICIAN_IMAGE}`;      
    }       
  }

  async dismissInitialLoading(){
    if(this.initScreen){
      await this.loadingService.dismissLoading();  
      this.isLoading = false;       
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
    this.store.dispatch(new ResetMusicianMarchSolo({})).subscribe({ next: async () => { } })    
  }

}
