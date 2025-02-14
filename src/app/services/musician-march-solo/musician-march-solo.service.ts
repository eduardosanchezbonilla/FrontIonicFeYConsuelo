import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { MusicianInventory } from 'src/app/models/musician-inventory/musician-inventory';
import { MusicianMarchSoloResponse } from 'src/app/models/musician-march-solo/musician-march-solo-response';

@Injectable()
export class MusicianMarchSoloService {

  constructor(private storage:StorageService) { }

  
  async getMusicianMarchSolo(musicianId: number){        
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/musician/' + musicianId + '/solo/list',
        params:{},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      }
    ).then(async response => {     
      const newToken = response.headers['Authorization'] || response.headers['authorization'];            
      if(newToken){        
        await this.storage.setItem('token', newToken.replace('Bearer ', ''));
      }           
      if(response.status==200){                
        return await response.data as MusicianMarchSoloResponse[];        
      }
      else if(response.status==204){
        return [];
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener los solos del musico'
        });
      }    
    })
    .catch((error) => {    
      if(error.status){
        return Promise.reject(error);
      }
      else {
        return Promise.reject({
          status: 403,
          message: null
        });                
      }           
    });
  }


}

