import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ScrollingModule } from '@angular/cdk/scrolling';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FileUploaderComponent } from './file-uploader/file-uploader.component';
import { TagPaneComponent } from './tag-pane/tag-pane.component';
import { IconSelectorComponent } from './icon-selector/icon-selector.component';
import { DocsComponent } from './docs/docs.component';

@NgModule({
  declarations: [
    AppComponent,
    FileUploaderComponent,
    TagPaneComponent,
    IconSelectorComponent,
    DocsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    TextFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatGridListModule,
    MatDialogModule,
    MatCardModule,
    HttpClientModule
  ],
  entryComponents: [
    IconSelectorComponent,
    DocsComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
