import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';

@Component({
  selector: 'app-tag-pane',
  templateUrl: './tag-pane.component.html',
  styleUrls: ['./tag-pane.component.scss']
})
export class TagPaneComponent implements OnInit {
  tags: any[] = [];
  edit = false;

  constructor(private http: HttpClient, public dialog: MatDialog) { }

  get_tags() {
    this.http.get<any[]>(
      '/get_tags').subscribe(
        resp => {
          this.tags = resp;
        });
  }

  ngOnInit() {
    this.get_tags();
  }

  startEdit() {
    this.edit = true;
  }

  removeTag(i) {
    this.tags.splice( i, 1);
  }

  newTag() {
    this.tags.push({tag_id: '', description: '', icon: 'report'});
  }

  saveTags() {
    var new_tags = this.tags;
    this.tags = [];
    this.edit = false;
    this.http.post(
      '/set_tags', new_tags).subscribe(
        resp => {
	    this.get_tags();
        });
  }

  cancelEdit() {
    this.tags = [];
    this.edit = false;
    this.get_tags();
  }

  selectIcon(i) {
    const dialogRef = this.dialog.open(IconSelectorComponent, {
      width: '500px',
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      this.tags[i].icon = result;
    });
  }
}
