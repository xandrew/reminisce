import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tag-pane',
  templateUrl: './tag-pane.component.html',
  styleUrls: ['./tag-pane.component.scss']
})
export class TagPaneComponent implements OnInit {
  tags: any[] = [];
  edit = false;

  constructor(private http: HttpClient) { }

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
}
