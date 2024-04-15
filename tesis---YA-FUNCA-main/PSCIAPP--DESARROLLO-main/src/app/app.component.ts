import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  title = 'Autenticacion';
  hideMenu: boolean = false;

  constructor(private router: Router, private menuController: MenuController, private userService: UserService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart || event instanceof NavigationEnd) {
        this.updateMenuVisibility(event.url);
      }
    });
  }

  private updateMenuVisibility(url: string): void {
    const showMenu = url.startsWith('/chat') || url.startsWith('/principal2');
    this.menuController.enable(showMenu, 'main-menu');
  }

  irChat() {
    this.router.navigate(['/chat']);
  }

  irPrincipal() {
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