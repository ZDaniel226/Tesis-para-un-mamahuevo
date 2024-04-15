import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { Observable, of } from 'rxjs';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-datos-correo',
  templateUrl: './datos-correo.component.html',
  styleUrls: ['./datos-correo.component.scss'],
})
export class DatosCorreoComponent implements OnInit {

  nombre: string = '';
  dia: number = 1;
  mes: number = 1;
  ano: number = 2004;
  genero: string = '';

  dias: number[] = [];
  meses: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  anos: number[] = Array.from({ length: 27 }, (_, i) => 2004 + i);

  loading: any;
  datos$: Observable<any[]> = of([]);
  datosSubscription: Subscription | undefined;

  constructor(
    private loadingController: LoadingController,
    private userService: UserService,
    private router: Router,
    private alertController: AlertController,
    private firestore: AngularFirestore // Agrega AngularFirestore al constructor
  ) { }

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
      duration: 200,
    });
    await this.loading.present();

    const userId = this.userService.getUserId();
    if (userId) {
      try {
        // Guardar los datos del formulario de correo
        await this.userService.saveFormDataCorreo(userId, this.nombre, `${this.dia}/${this.mes}/${this.ano}`, this.genero);
        await this.userService.sendUserNameToServer(userId, this.nombre);
        localStorage.setItem(`correoContraseñaNombre_${userId}`, this.nombre);

        // Crear el calendario asociado al usuario
        await this.createCalendarForUser(userId);

        setTimeout(() => {
          this.loading.dismiss();
        }, 2000);

        // Redirige al usuario a la página deseada
        this.router.navigate(['/principal2', { nombre: this.nombre }]);
      } catch (error) {
        console.error('Error al crear el calendario:', error);
        this.mostrarAlerta('Error al crear el calendario');
        this.loading.dismiss();
      }
    }
  }

  async mostrarAlerta(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  async createCalendarForUser(userId: string) {
    // Crea un objeto de datos para el calendario
    const calendarData = {//se agregan los dias a la base de datos
      userIDCal: userId,//se enlasa el user ID
      day1: '', day2: '', day3: '', day4: '', day5: '', day6: '',
      day7: '', day8: '', day9: '', day10: '', day11: '', day12: '',
      day13: '', day14: '', day15: '', day16: '', day17: '', day18: '',
      day19: '', day20: '', day21: '', day22: '', day23: '', day24: '',
      day25: '', day26: '', day27: '', day28: '', day29: '', day30: '',
      day31: ''
    };

    // Crea el calendario en la colección "Calendario"
    await this.firestore.collection('Calendario').add(calendarData);
    console.log('Calendario creado para el usuario con ID:', userId);
  }

  ngOnDestroy() {
    if (this.datosSubscription) {
      this.datosSubscription.unsubscribe();
    }
  }
}