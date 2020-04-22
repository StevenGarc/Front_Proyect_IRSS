import { Component, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'IRSS';
  source: string[] = [];
  onChange: EventEmitter<File>[] = [];
  selectedFile: File[] = []
  nombres: string[] = []
  progreso: number[]=[]
  email = new FormControl('', [Validators.required, Validators.email]);
  correo: string = ""

  onFileChanged(event) {
    for (const iterator of event.target.files) {
      this.selectedFile.push(iterator)
      this.nombres.push(iterator.name)
      this.progreso.push(0)
      this.projectImage(iterator)
      
    }
    console.log(this.selectedFile)
  }

  constructor(private http: HttpClient) { }

  projectImage(file: File) {
    var emit = new EventEmitter<File>()
    let reader = new FileReader;
    reader.onload = (e: any) => {
      this.source.push(e.target.result);
      emit.emit(file);
      this.onChange.push(emit)
    };

    reader.readAsDataURL(file);
  }

  onUpload() {
   
    console.log(this.email.value)
    if (!this.email.hasError('email') && !this.email.hasError('required')) {
      const uploadData = new FormData();
      for (const iterator of this.selectedFile) {
        var envio =JSON.stringify({ 
                                    myFile:this.source[this.selectedFile.indexOf(iterator)],
                                    name: iterator.name, 
                                    Correo:this.email.value
                                  })
        this.http.post('https://qec4hcotsk.execute-api.us-east-1.amazonaws.com/', envio, {
          reportProgress: true,
          observe: 'events'
        })
          .subscribe(event => {
            this.progreso[this.selectedFile.indexOf(iterator)]=(event["loaded"]/event["total"])*100
            if(this.progreso[this.selectedFile.indexOf(iterator)]===100){
              this.Borrar(this.source[this.selectedFile.indexOf(iterator)])
            }
            console.log(event);
          });
      }
    }
  }

  Borrar(item) {
    var i = this.source.indexOf(item)
    this.source.splice(i, 1);
    this.selectedFile.splice(i, 1);
    this.nombres.splice(i, 1)

  }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'El Correo Es Requerido';
    }
    return this.email.hasError('email') ? 'Correo No Valido' : '';
  }

}
