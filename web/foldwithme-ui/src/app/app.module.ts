import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { DrawingCanvasComponent } from './drawing-canvas/drawing-canvas.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FoldUserModule } from './fold-user/fold-user.module';
import { RevealerComponent } from './revealer/revealer.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { NewGalleryComponent } from './new-gallery/new-gallery.component';
import { JoinGalleryComponent } from './join-gallery/join-gallery.component';
import { GalleryComponent } from './gallery/gallery.component';
import { PictureDetailComponent } from './picture-detail/picture-detail.component';
import { PictureWithAuthorsComponent } from './picture-with-authors/picture-with-authors.component';
import { UserPicturesComponent } from './user-pictures/user-pictures.component';
import { PictureListComponent } from './picture-list/picture-list.component';

@NgModule({
  declarations: [
    AppComponent,
    DrawingCanvasComponent,
    RevealerComponent,
    MainMenuComponent,
    NewGalleryComponent,
    JoinGalleryComponent,
    GalleryComponent,
    PictureDetailComponent,
    PictureWithAuthorsComponent,
    UserPicturesComponent,
    PictureListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    AppRoutingModule,
    FoldUserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
