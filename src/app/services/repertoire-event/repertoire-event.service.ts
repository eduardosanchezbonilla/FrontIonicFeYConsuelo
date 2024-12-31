import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { MusicianEvent } from 'src/app/models/musician-event/musician-event';
import { Event } from 'src/app/models/event/event';
import { RepertoireEvent } from 'src/app/models/repertoire-event/repertoire-event';

@Injectable()
export class RepertoireEventService {

  constructor(private storage:StorageService) { }

  async createRepertoireEvent(repertoireEvent:RepertoireEvent){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/repertoire-march/' + repertoireEvent.marchId + '/event/'+ repertoireEvent.eventType + '/' + repertoireEvent.eventId,
        params:{},
        data:{},
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
      if(response.status==201){        
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al persistir l amarcha asociada al evento'
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

  async deleteRepertoireEvent(repertoireEvent:RepertoireEvent){
    const token = await this.storage.getItem('token');
    return Http.del(
      {        
        url:environment.host + '/repertoire-march/' + repertoireEvent.marchId + '/event/'+ repertoireEvent.eventType + '/' + repertoireEvent.eventId,
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
        return true;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al eliminar la marcha asociada al evento'
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

