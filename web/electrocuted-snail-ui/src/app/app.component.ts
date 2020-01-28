import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DocsComponent } from './docs/docs.component';

class ElectrocuteResponse {
  here: string;
}

class ElectrocuteRequest {
  xyz: string;
  constructor(xyz: string) {
    this.xyz = xyz;
  }
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'electrocuted-snail-ui';
  successPage = false;
  electrocutionInProgress = false;
  ids: number[];
  nextId: number;
  files: object;
  docId = '';
  folderLabel = '';
  firstFolder: boolean;
  nextLabel = '';
  nextOrdinal = -1;
  private _needFolderFor = '';
  get needFolderFor(): string {
    return this._needFolderFor;
  }
  set needFolderFor(val: string) {
    this._needFolderFor = val;
    if (val) {
      this.nextLabel = '';
      this.nextOrdinal = -1;
      this.firstFolder = !this.folderLabel;
      this.folderLabel = '';
      this.http.get(
        '/next_folder_for_discard_year?year=' + this.expiryYear).subscribe(
        resp => {
          this.nextLabel = resp['label'];
          this.nextOrdinal = resp['ordinal'];
        });
    } else {
      this.nextOrdinal = -1;
      this.nextLabel = '';
    }
  }

  private _storeHardCopy = false;
  get storeHardCopy(): boolean {
    return this._storeHardCopy;
  }
  set storeHardCopy(val: boolean) {
    this._storeHardCopy = val;
    if (val) {
      this.expiry = "5";
    } else {
      this.folderLabel = '';
      this.needFolderFor = '';
    }
  }

  private _expiry: string;
  expiryYear: string;
  get expiry(): string {
    return this._expiry;
  }
  set expiry(newExpiry: string) {
    this._expiry = newExpiry;
    var intExp = parseInt(newExpiry);
    this.expiryYear = 'ethernity';
    if (intExp > -1) {
       this.expiryYear = ((new Date()).getFullYear() + intExp + 1).toString();
    }
    
    this.folderLabel = '';
    this.needFolderFor = '';
    this.http.get('/folder_for_discard_year?year=' + this.expiryYear).subscribe(
      resp => {
        if ('label' in resp) {
          this.folderLabel = resp['label'];
	} else {
          this.needFolderFor = this.expiryYear;
	}
      });
  }

  tagPaneEditing = false;

  constructor(private http: HttpClient, public dialog: MatDialog) {
  }

  fileSelected() {
    this.ids.push(this.nextId);
    this.nextId += 1;
  }

  removeId(id) {
    this.ids.splice( this.ids.indexOf(id), 1 );
  }

  gotFile(id, file) {
    this.files[id] = file;
  }

  sendRequest(f) {
    console.log(f)
    var fd = new FormData(f);
    this.electrocutionInProgress = true;
    this.http.post('/electrocute', fd).subscribe(resp => {
      console.log(resp);
      this.electrocutionInProgress = false;
      this.successPage = true;
    });
  }

  storeHardCopyChange(event) {
    console.log(event);
  }

  createFolder(folderYear, ordinal) {
    this.http.get('/set_folder_for_discard_year?year=' + folderYear + '&ordinal=' + ordinal).subscribe(
      resp => {
        this.expiry = this.expiry;
      });
  }

  folderFull() {
    this.needFolderFor = this.expiryYear;
  }

  cancelNewFolder() {
    this.expiry = this.expiry;
  }

  newElectrocution() {
    this.successPage = false;
    this.ids = [0];
    this.nextId = 1;
    this.files = {};
    this.docId = '';
    this.folderLabel = '';
    this.nextLabel = '';
    this.nextOrdinal = -1;
    this._needFolderFor = '';
    this._storeHardCopy = false;
    this.http.get('/get_next_id').subscribe(
      resp => {
        this.docId = resp['id'];
      });
  }

  tagPaneEditChange(val: boolean) {
    this.tagPaneEditing = val;
  }

  loggedIn = false;
  email: string;

  ngOnInit() {
    this.newElectrocution();
    this.http.get('/login_state').subscribe(
      resp => {
        if ('email' in resp) {
	  this.loggedIn = true;
          this.email = resp['email'];
	} else {
	  this.loggedIn = false;
	}
      });
  }

  openDocs() {
    const dialogRef = this.dialog.open(DocsComponent, {
      width: '500px',
      restoreFocus: false
    });
  }
}
