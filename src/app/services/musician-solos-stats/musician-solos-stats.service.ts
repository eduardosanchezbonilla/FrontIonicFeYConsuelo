import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { MusicianSolosStatsResponse } from 'src/app/models/musician-solos-stats/musician-solos-stats-response';

@Injectable()
export class MusicianSolosStatsService {

  constructor(private storage:StorageService) { }

  
  async getMusicianSolosStats(){        
    const token = await this.storage.getItem('token');  
    return Http.get(
      {
        url:environment.host + '/musician/solos/stats',
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
        return await response.data as MusicianSolosStatsResponse[];        
      }
      else if(response.status==204){
        return [];
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener las estadisticas de los solos de los musicos'
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

