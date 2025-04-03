import { Injectable } from '@angular/core';
import { Directory, Filesystem, WriteFileOptions } from '@capacitor/filesystem';
import { FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';
import { Platform } from '@ionic/angular';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {

    constructor(
        private platform: Platform,
        private toastService: ToastService
    ) { }

    private showFileNavigatorWeb(base64String: string, format: String) {
        // Convierte la cadena base64 a un Blob
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: ''+format });
    
        // Crear una URL a partir del Blob y abrirla en una nueva pestaña
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl);
    }

    /*private downloadFileNavigatorWeb(base64String: string, format: String) {   
        // Convierte la cadena base64 a un Blob
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/'+format });

        // Crear una URL a partir del Blob
        const pdfUrl = URL.createObjectURL(blob);

        // Crear un enlace invisible para forzar la descarga
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'document.'+format; // Nombre del archivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);    
    }*/

    private async showFileAndroid(name:string, base64String: string, format:string): Promise<void> {    
        // guardamos el fichero       
        /*const fileName = 'tmp/'+name;
        const contentBase64= base64String;

        const fileOptions: WriteFileOptions = {
            path: fileName,
            data: contentBase64,
            directory: Directory.Documents,
            recursive: true
        };
        
        await Filesystem.writeFile(fileOptions);   
        
        // ahora lo abrimos  

        // Obtener la URI completa del archivo guardado
        const fileUri = await Filesystem.getUri({
            directory: Directory.Documents, // O el mismo directorio donde guardaste
            path: fileName
        });
        const fileOpenerOptions: FileOpenerOptions = {
            filePath: fileUri.uri,
            contentType: 'application/pdf',
            openWithDefault: true
        };
        await FileOpener.open(fileOpenerOptions);     */   


        // guardamos el fichero en directorio cache        
        const result = await Filesystem.writeFile({
          path: name,
          data: base64String,
          directory: Directory.Cache,
          recursive: true,
        });
      
        try {
            // ahora lo abrimos  
        await FileOpener.open({
            filePath: result.uri,
            contentType: format,
            openWithDefault: true
          });
        } catch (error) {
            this.toastService.presentToast('Error al abrir el archivo: ' + error);            
        }
    }

    public async showFile(name:string, contentBase64: string, format: string = 'application/pdf'): Promise<void> {        
        if (this.platform.is('hybrid') && this.platform.is('android')) {        
            this.showFileAndroid(name,contentBase64,format);            
        } else if (this.platform.is('hybrid') && this.platform.is('ios')) {
            //console.log('La app se está ejecutando en iOS nativo');       
            this.showFileAndroid(name,contentBase64,format);      
        } else {
            // Lógica específica para navegador web (incluye móviles y PC)
            this.showFileNavigatorWeb(contentBase64,format);      
        }
    }
    
}
