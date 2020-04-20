import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { DrawingCanvasComponent } from './drawing-canvas/drawing-canvas.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FoldUserModule } from './fold-user/fold-user.module';
import { RevealerComponent } from './revealer/revealer.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { NewGalleryComponent } from './new-gallery/new-gallery.component';
import { JoinGalleryComponent } from './join-gallery/join-gallery.component';
import { GalleryComponent } from './gallery/gallery.component';

@NgModule({
  declarations: [
    AppComponent,
    DrawingCanvasComponent,
    RevealerComponent,
    MainMenuComponent,
    NewGalleryComponent,
    JoinGalleryComponent,
    GalleryComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    HttpClientModule,
    AppRoutingModule,
    FoldUserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
