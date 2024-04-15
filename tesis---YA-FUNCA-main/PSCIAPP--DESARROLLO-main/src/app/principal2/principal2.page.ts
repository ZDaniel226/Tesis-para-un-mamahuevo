import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from './../services/user.service';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, QueryFn } from '@angular/fire/compat/firestore'; // Importa AngularFirestoreCollection y QueryFn

@Component({
  selector: 'app-principal2',
  templateUrl: './principal2.page.html',
  styleUrls: ['./principal2.page.scss'],
})
export class Principal2Page implements OnInit {

  contadorFeliz: number = 0;
  contadorNeutral: number = 0;
  contadorTriste: number = 0;

  nombreUsuarioCorreo: string = '';
  estadoAnimo: string = ''; // Agrega la propiedad estadoAnimo

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private firestore: AngularFirestore // Inyecta AngularFirestore
  ) { }

  ngOnInit() {
    const userId = this.userService.getUserId();
    if (userId) {
      this.userService.getUserNameFromDatabase(userId).then(name => {
        this.nombreUsuarioCorreo = name;
      });
    } else {
      this.nombreUsuarioCorreo = 'Invitado'; // Si no se encuentra el ID de usuario, establece el nombre como 'Invitado'
    }
  }

  activarSoloDomingo() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 es Domingo, 1 es Lunes, 2 es Martes, etc.
    if (dayOfWeek === 0) {
      // Establecer el contenido del componente app-cards-ai solo si es domingo

      // Inicializar contadores a cero al comienzo de la semana
      this.contadorFeliz = 0;
      this.contadorNeutral = 0;
      this.contadorTriste = 0;

      // Obtener la fecha de inicio de la semana (lunes)
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay() + 1);

      // Iterar sobre los últimos 7 días para contar los sentimientos
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(firstDayOfWeek);
        currentDate.setDate(firstDayOfWeek.getDate() + i);

        // Construir el nombre del campo correspondiente a la fecha
        const field = `day${currentDate.getDate()}`;

        // Realizar la consulta al documento del calendario del usuario para obtener el sentimiento de ese día
        const userId = this.userService.getUserId();
        if (userId) {
          const docRef = this.firestore.collection('Calendario').doc(userId);
          docRef.get().subscribe(docSnapshot => {
            if (docSnapshot.exists) {
              const data = docSnapshot.data() as any;
              if (data && data[field]) {
                // Incrementar el contador correspondiente al sentimiento del día
                switch (data[field]) {
                  case 'feliz':
                    this.contadorFeliz++;
                    break;
                  case 'neutral':
                    this.contadorNeutral++;
                    break;
                  case 'triste':
                    this.contadorTriste++;
                    break;
                }
              }
            }
          }, error => {
            console.error('Error al obtener el documento del calendario:', error);
          });
        }
      }

      console.log('Conteo de sentimientos de la semana:');
      console.log('Feliz:', this.contadorFeliz);
      console.log('Neutral:', this.contadorNeutral);
      console.log('Triste:', this.contadorTriste);

      // Determinar el título y contenido del componente app-cards-ai
      if (this.contadorFeliz > this.contadorNeutral && this.contadorFeliz > this.contadorTriste) {
        // Aquí debes modificar el título y contenido del componente app-cards-ai deseado
        console.log('Feliz');
      } else if (this.contadorTriste > this.contadorFeliz && this.contadorTriste > this.contadorNeutral) {
        // Aquí debes modificar el título y contenido del componente app-cards-ai deseado
        console.log('Triste');
      } else {
        // Aquí debes modificar el título y contenido del componente app-cards-ai deseado
        console.log('Neutral');
      }
    } else {
      // Si no es domingo, ocultar el componente app-cards-ai
      console.log('Hoy no es domingo.');
    }
  }

  async guardarRespuesta(sentimiento: string) {
    const userId = this.userService.getUserId();
    if (userId) {
      const date = new Date();
      const day = date.getDate();
      const field = `day${day}`;
  
      try {
        // Obtener la colección 'Calendario' filtrando por userIDCal igual al userId actual
        const collectionRef: AngularFirestoreCollection<any> = this.firestore.collection<any>('Calendario', ref => ref.where('userIDCal', '==', userId));
        const querySnapshot = await collectionRef.get().toPromise();
        
        if (querySnapshot && !querySnapshot.empty) {
          // Obtener el primer documento que cumple con el filtro (debería haber solo uno)
          const doc = querySnapshot.docs[0];
          // Actualizar el campo correspondiente al día en el calendario del usuario
          await doc.ref.update({ [field]: sentimiento });
          console.log('Respuesta actualizada con éxito en el calendario del usuario.');
        } else {
          console.error('El documento del calendario no existe para este usuario.');
        }
      } catch (error) {
        console.error('Error al guardar la respuesta:', error);
      }
    } else {
      console.error('No se pudo obtener el ID de usuario.');
    }
  }
  
  guardarEstadoAnimo() { // Agrega el método guardarEstadoAnimo
    this.guardarRespuesta(this.estadoAnimo);
  }

  irChat(){
    this.router.navigate(['/chat']);
  }

  irPrincipal(){
    this.router.navigate(['/Principal2']);
  }

  logout() {
    const userId = this.userService.getUserId();
    if (userId !== undefined) {
      // Limpiar los mensajes al cerrar sesión
      const userMessagesRef = this.userService.getUserMessagesRef(userId);
  
      if (userMessagesRef) {
        userMessagesRef.get().subscribe(snapshot => {
          snapshot.forEach(doc => {
            doc.ref.delete();
          });
        });
      } else {
        console.error('User Messages Reference is null');
      }
    }
  
    this.userService.logout().then(() => {
      this.router.navigate(['/home']);
    }).catch((error) => {
      console.error('Error al cerrar sesión:', error);
    });
  }
}