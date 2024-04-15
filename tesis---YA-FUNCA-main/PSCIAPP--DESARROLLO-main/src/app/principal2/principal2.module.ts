import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Principal2PageRoutingModule } from './principal2-routing.module';

import { Principal2Page } from './principal2.page';

import { CardsAIComponent } from "../components/cards-ai/cards-ai.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Principal2PageRoutingModule
  ],
  declarations: [Principal2Page, CardsAIComponent]
})
export class Principal2PageModule {}
