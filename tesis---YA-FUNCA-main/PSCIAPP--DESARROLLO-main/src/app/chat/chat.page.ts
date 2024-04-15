import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Message } from '../models/message.model';
import { OpenaiService } from '../services/openai.service';
import { UserService } from '../services/user.service';
import { IonContent } from '@ionic/angular';
import { CustomValidators } from '../utils/custom-validators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonContent, { static: false }) content!: IonContent;

  messages: Message[] = [];

  form = new FormGroup({
    promt: new FormControl('', [Validators.required, CustomValidators.noWhiteSpace])
  })

  loading: boolean = false;

  constructor(
    private openAi: OpenaiService,
    private userService: UserService,
    private router: Router
  ) { }

  async ngOnInit() {
    try {
      const userId = await this.userService.getUserId();
  
      if (userId !== undefined) {
        const userMessagesRef = this.userService.getUserMessagesRef(userId);
  
        if (userMessagesRef) {
          // Verifica si ya hay mensajes en la colección
          userMessagesRef.ref.orderBy('timestamp').get().then(snapshot => {
            this.messages = []; // Limpia el array antes de agregar los nuevos mensajes
            snapshot.forEach(doc => {
              const message = doc.data() as Message;
              this.messages.push(message);
            });
            // Actualiza los mensajes y habilita el formulario después de cargarlos
            this.scrollToBottom();
            this.form.enable();
          });
        } else {
          console.error('User Messages Reference is null');
        }
      } else {
        console.error('User ID is undefined');
      }
    } catch (error) {
      console.error('Error during user messages reference creation:', error);
    }
  }

  submit() {
    const userId = this.userService.getUserId();
    if (this.form.valid) {
      let promt = this.form.value.promt as string;

      // mensaje del usuario
      let userMsg: Message = { sender: 'me', content: promt };
      this.messages.push(userMsg);

      // mensaje del usuario
      let botMsg: Message = { sender: 'bot', content: '' };
      this.messages.push(botMsg);

      this.scrollToBottom();
      this.form.reset();
      this.form.disable();
      this.loading = true;

      // Obtén el ID de usuario después de la autenticación
      const userId = this.userService.getUserId();

      if (userId !== undefined) {
        this.openAi.sendQuestion(promt, userId).subscribe({
          next: (res: any) => {
            this.typeText(res.bot.content);
            this.loading = false;
            this.form.enable();
        
            this.openAi.sendQuestion(promt, res.bot.content);
          },
          error: (error: any) => {
            console.log(error);
          },
        });
      } else {
        console.error('Usuario no autenticado');
      }
    }
  }

  typeText(text: string) {
    let textIndex = 0;
    let messagesLastIndex = this.messages.length - 1;

    let interval = setInterval(() => {
      if (textIndex < text.length) {
        this.messages[messagesLastIndex].content += text.charAt(textIndex);
        textIndex++;
      } else {
        clearInterval(interval);
        this.scrollToBottom();
      }
    }, 15)
  }

  scrollToBottom() {
    this.content.scrollToBottom(2000);
  }

  volver2(){
    this.router.navigate(['/principal2']);
  }
}