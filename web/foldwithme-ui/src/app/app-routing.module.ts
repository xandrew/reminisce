import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainMenuComponent } from './main-menu/main-menu.component';
import { DrawingCanvasComponent } from './drawing-canvas/drawing-canvas.component';
import { RevealerComponent } from './revealer/revealer.component';
import { GalleryComponent } from './gallery/gallery.component';
import { NewGalleryComponent } from './new-gallery/new-gallery.component';
import { JoinGalleryComponent } from './join-gallery/join-gallery.component';
import { PictureDetailComponent } from './picture-detail/picture-detail.component';
import { UserPicturesComponent } from './user-pictures/user-pictures.component';

const routes: Routes = [
  { path: 'draw/:parent', component: DrawingCanvasComponent },
  { path: 'reveal/:id', component: RevealerComponent },
  { path: 'new_gallery', component: NewGalleryComponent },
  { path: 'join_gallery', component: JoinGalleryComponent },
  { path: 'gallery/:code', component: GalleryComponent },
  { path: 'picture/:id', component: PictureDetailComponent },
  { path: 'mine', component: UserPicturesComponent },
  { path: '', component: MainMenuComponent, pathMatch: 'full' }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
