import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { MusicianEvent } from 'src/app/models/musician-event/musician-event';
import { Event } from 'src/app/models/event/event';

@Injectable()
export class MusicianEventService {

  constructor(private storage:StorageService) { }

  async createMusicianEvent(musicianEvent:MusicianEvent){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/musician/' + musicianEvent.musicianId + '/event/'+ musicianEvent.eventType + '/' + musicianEvent.eventId,
        params:{},
        data:{'bus':musicianEvent.bus},
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
          message: response.data?.message || 'Error al persistir el evento asociado al musico'
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

  async deleteMusicianEvent(musicianEvent:MusicianEvent){
    const token = await this.storage.getItem('token');
    return Http.del(
      {        
        url:environment.host + '/musician/' + musicianEvent.musicianId + '/event/'+ musicianEvent.eventType + '/' + musicianEvent.eventId,
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
          message: response.data?.message || 'Error al eliminar el evento asociado al musico'
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

  async getEvents(musicianId:number, startDate:string, endDate:string){
    
    const token = await this.storage.getItem('token');
    return Http.get(
      {
        url:environment.host + '/musician/'+musicianId+'/event',
        params:{
          'startDate':startDate,
          'endDate':endDate
        },
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
        const data = await response.data as Event[];
        return data;
      }
      else if(response.status==204){
        return [];
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de eventos'
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

