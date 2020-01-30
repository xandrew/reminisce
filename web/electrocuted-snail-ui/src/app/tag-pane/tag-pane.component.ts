import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';

@Component({
  selector: 'app-tag-pane',
  templateUrl: './tag-pane.component.html',
  styleUrls: ['./tag-pane.component.scss']
})
export class TagPaneComponent implements OnInit {
  @Output() editChange = new EventEmitter<boolean>();

  tags: any[] = [];
  private _edit = false;
  get edit(): boolean {
    return this._edit;
  }
  set edit(val: boolean) {
    this._edit = val;
    this.editChange.emit(val);
  }
  selectedValue = "";
  formArray = new FormArray([]);

  constructor(private http: HttpClient, public dialog: MatDialog) { }

  clearTags() {
    this.selectedValue = "";
    this.tags = [];
  }

  getTags() {
    this.http.get<any[]>(
      '/get_tags').subscribe(
        resp => {
          this.tags = resp;
        });
  }

  ngOnInit() {
    this.getTags();
  }

  groupFor(tag) {
    return new FormGroup({
        'tag_id': new FormControl(tag.tag_id, [
	    Validators.required,
	    control => {
	      if (control.value.match(/^[A-Za-z0-9-]*$/)) {
	        return {};
              } else {
	        return {'invalid-character': 1}
	      }
	    }]),
	'description': new FormControl(tag.description),
	'icon': new FormControl(tag.icon)})
  }

  startEdit() {
    for (var t of this.tags) {
      this.formArray.push(this.groupFor(t))
    }
    this.clearTags();
    this.edit = true;
  }

  removeTag(i) {
    this.formArray.removeAt(i);
  }

  newTag() {
    const t = {tag_id: '', description: '', icon: 'report'};
    this.formArray.push(this.groupFor(t));
  }

  saveTags() {
    var newTags = this.formArray.value;
    this.edit = false;
    this.formArray.controls = [];
    this.http.post(
      '/set_tags', newTags).subscribe(
        resp => {  
	    this.getTags();
        });
  }

  cancelEdit() {
    this.clearTags();
    this.edit = false;
    this.getTags();
  }

  selectIcon(i) {
    const dialogRef = this.dialog.open(IconSelectorComponent, {
      width: '100vw',
      maxWidth: '500px',
      maxHeight: '85vh',
      restoreFocus: false,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var control = (<FormGroup>this.formArray.controls[i]).controls['icon'];
        control.setValue(result);
      }
    });
  }

  getErrorMessage(e) {
    console.log(e);
    if (e['required']) {
      return 'Tag id is required!';
    }
    if (e['invalid-character']) {
      return 'You can only use numbers, letters and dash!';
    }
    return 'Unknown error - this shouldn\'t happen.';
  }
}
