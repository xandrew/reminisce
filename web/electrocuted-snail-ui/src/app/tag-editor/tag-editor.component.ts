import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tag-editor',
  templateUrl: './tag-editor.component.html',
  styleUrls: ['./tag-editor.component.scss']
})
export class TagEditorComponent implements OnInit {
  formArray = new FormArray([]);

  constructor(private http: HttpClient, public dialog: MatDialog, public dialogRef: MatDialogRef<TagEditorComponent>) { }

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

  removeTag(i) {
    this.formArray.removeAt(i);
  }

  newTag() {
    const t = {tag_id: '', description: '', icon: 'report'};
    this.formArray.push(this.groupFor(t));
  }

  saveTags() {
    this.http.post(
      '/set_tags', this.formArray.value).subscribe(
        resp => {
	  this.dialogRef.close(true);
        });
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
      return 'Only use numbers, letters and dash!';
    }
    return 'Unknown error - this shouldn\'t happen.';
  }

  ngOnInit() {
    this.http.get<any[]>(
      '/get_tags').subscribe(
        resp => {
	  for (var t of resp) {
            this.formArray.push(this.groupFor(t))
          }
        });
  }
}
