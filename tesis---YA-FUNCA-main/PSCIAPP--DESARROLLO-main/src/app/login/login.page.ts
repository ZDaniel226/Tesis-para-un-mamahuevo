import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  formReg: FormGroup;

  constructor(
    private userService: UserService,
    private router: Router,
    private alertController: AlertController
  ) {
    this.formReg = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required])
    })
  }

  ngOnInit(): void {
  }

  async onSubmit() {
    if (this.formReg.valid) {
      try {
        await this.userService.login(this.formReg.value);
        this.router.navigate(['/principal2']);
      } catch (error) {
        this.presentAlert('Error de autenticación', 'Correo electrónico o contraseña incorrectos o no registrados.');
      }
    } else {
      this.presentAlert('Error', 'Por favor, completa todos los campos correctamente.');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  loginWithGoogle() {
    this.userService.loginWithGoogle()
      .then(response => {
        console.log(response);
        this.router.navigate(['/chat']);
      })
      .catch(error => console.log(error));
  } 
}