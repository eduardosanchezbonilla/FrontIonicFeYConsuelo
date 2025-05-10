import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/services/storage/storage.service';
import { Http } from '@capacitor-community/http';
import { environment } from 'src/environments/environment';
import { Survey } from 'src/app/models/survey/survey-dto';
import { SurveyVote } from 'src/app/models/survey/survey-vote-dto';

@Injectable()
export class SurveyService {

  constructor(private storage:StorageService) { }

  async createSurvey(survey:Survey){
    const token = await this.storage.getItem('token');
    return Http.post(
      {
        url:environment.host + '/survey',
        params:{},
        data:survey,
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
          message: response.data?.message || 'Error al crear la encuesta'
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

  
  async getSurveys(){    
    const token = await this.storage.getItem('token');        
    return Http.get(
      {
        url:environment.host + '/survey',
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
      if(response.status==200 || response.status==204){
        const data = await response.data as Survey[];
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener el listado de encuestas'
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

  async getSurvey(id:number){    
    const token = await this.storage.getItem('token');        
    return Http.get(
      {
        url:environment.host + '/survey/'+ id,
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
      if(response.status==200 || response.status==204){
        const data = await response.data as Survey;
        return data;
      }
      else{                
        return Promise.reject({
          status: response.status,
          message: response.data?.message || 'Error al obtener la encuesta'
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

  async deleteSurvey(id:number){
    const token = await this.storage.getItem('token');
    return Http.del(
      {
        url:environment.host + '/survey/'+ id,
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
          message: response.data?.message || 'Error al eliminar la encuesta'
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

  async updateSurvey(id:number, survey:Survey){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/survey/'+ id,
        params:{},
        data:survey,
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
          message: response.data?.message || 'Error al modificar la encuesta'
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

  async voteSurvey(id:number, surveyVote:SurveyVote){
    const token = await this.storage.getItem('token');
    return Http.put(
      {
        url:environment.host + '/survey/'+ id + '/vote',
        params:{},
        data:surveyVote,
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
          message: response.data?.message || 'Error al realizar la votacion'
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

