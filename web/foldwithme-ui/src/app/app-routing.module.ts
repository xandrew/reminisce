import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainMenuComponent } from './main-menu/main-menu.component';
import { DrawingCanvasComponent } from './drawing-canvas/drawing-canvas.component';
import { RevealerComponent } from './revealer/revealer.component';

const routes: Routes = [
  { path: 'draw/:parent', component: DrawingCanvasComponent },
  { path: 'reveal/:id', component: RevealerComponent },
  { path: '', component: MainMenuComponent, pathMatch: 'full' }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
