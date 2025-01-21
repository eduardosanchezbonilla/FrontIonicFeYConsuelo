import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage:Storage;

  constructor(private storate:Storage) {
    this.init();
  }

  async init(){    
      this._storage = await this.storate.create();
  }

  async getItem(key:string){   
    return await this._storage.get(key);    
  }

  async setItem(key:string,value: string){    
    return await this._storage.set(key,value);    
  }

  async clear(){    
    this._storage.remove('user');
    this._storage.remove('token');
    this._storage.remove('profile');
    this._storage.remove('userRewriteData');
    //this._storage.clear();
  }

}
