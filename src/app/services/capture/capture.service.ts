import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { IonContent } from '@ionic/angular';
import { ToastService } from '../toast/toast.service';
import { FileManagerService } from '../filemanager/file-manager.service';

@Injectable({
  providedIn: 'root'
})
export class CaptureService {

    constructor(        
        private toastService: ToastService,
        private fileManagerService: FileManagerService
    ) { }
    
    async incrementalScrollIonContent(content: IonContent, step: number = 100, delay: number = 200): Promise<void> {
        const scrollElement = await content.getScrollElement();
        const maxScroll = scrollElement.scrollHeight - scrollElement.clientHeight;
        
        // Scroll hacia abajo incrementalmente.
        for (let pos = 0; pos < maxScroll; pos += step) {
            scrollElement.scrollTop = pos;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        // Asegura que se llegue al final.
        scrollElement.scrollTop = maxScroll;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Vuelve al inicio con scroll incremental.
        for (let pos = maxScroll; pos > 0; pos -= step) {
            scrollElement.scrollTop = pos;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        scrollElement.scrollTop = 0;
    }

    async capture(content: IonContent, elementName: string, fileName: string = 'capture.png', step: number = 100, delay: number = 200) {
        
        // Selecciona el elemento que quieres capturar por su ID.
        const element = document.getElementById(elementName);
        if (!element) {
            this.toastService.presentToast('Elemento a capturar no encontrado');            
            return;
        }

        if(content){          
            await this.incrementalScrollIonContent(content,step, delay);
        }

        try {
            // Usa html2canvas para renderizar el elemento.
            const canvas = await html2canvas(element, {
                scale: 2,                             
                // width: element.scrollWidth ,       
                // height: element.scrollHeight ,     
                backgroundColor: '#d7dbdd',
                useCORS: true,
                //ignoreElements: (el) => {
                //  return el.classList.contains('no-capture');
                //}                
                }
            );
            
            // Convierte el canvas a un data URL en formato PNG.
            const dataUrl = canvas.toDataURL('image/png');
            
            // Extrae la parte base64 (quita el encabezado "data:image/png;base64,")
            const base64Data = dataUrl.split(',')[1];
            
            this.fileManagerService.showFile(fileName, base64Data,'image/png');

        } catch (error) {      
            this.toastService.presentToast('Error al capturar y compartir la imagen: ' + error);            
        }
    }
}
