// datos.component.ts
import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { Observable, of } from 'rxjs';  
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { CollectionReference, Query } from '@angular/fire/compat/firestore';
import { DocumentChangeAction } from '@angular/fire/compat/firestore';


@Component({
  selector: 'app-datos',
  templateUrl: './datos.component.html',
  styleUrls: ['./datos.component.scss'],
})
export class DatosComponent implements OnInit {

  nombre: string = '';
  dia: number = 1;
  mes: number = 1;
  ano: number = 2004;
  genero: string = '';

  dias: number[] = [];
  meses: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  anos: number[] = Array.from({ length: 27 }, (_, i) => 2004 + i);

  datosSubscription: Subscription | undefined;
  loading: any;
  datos$: Observable<any[]> = of([]); 

  formularioValido: boolean = false;

  constructor(private loadingController: LoadingController, private userService: UserService,  private router: Router,  private alertController: AlertController) {
  }

  ngOnInit() {
    this.actualizarDias();
  }

  actualizarDias() {
    this.dias = [];
    const diasEnMes = new Date(this.ano, this.mes, 0).getDate(); // Obtiene la cantidad de días en el mes seleccionado
    for (let i = 1; i <= diasEnMes; i++) {
      this.dias.push(i);
    }
  }

  async submitForm() {
    // Verificar si todos los campos obligatorios están llenos
    if (!this.nombre || !this.dia || !this.mes || !this.ano || !this.genero) {
      this.mostrarAlerta('Llena todos los campos');
      return;
    }

    this.loading = await this.loadingController.create({
      message: 'Cargando...',
      duration: 2000,
    });
    await this.loading.present();
  
    const userId = this.userService.getUserId();
    if (userId) {
      await this.userService.saveFormDataCorreo(userId, this.nombre, `${this.dia}/${this.mes}/${this.ano}`, this.genero);
      await this.userService.sendUserNameToServer(userId, this.nombre);
      localStorage.setItem(`correoContraseñaNombre_${userId}`, this.nombre);
      setTimeout(() => {
        this.loading.dismiss();
      }, 2000);
    }
    this.router.navigate(['/principal2', { nombre: this.nombre }]);
  }

  async mostrarAlerta(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  ngOnDestroy() {
    if (this.datosSubscription) {
      this.datosSubscription.unsubscribe();
    }
  }
}
