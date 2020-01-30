import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tag-pane',
  templateUrl: './tag-pane.component.html',
  styleUrls: ['./tag-pane.component.scss']
})
export class TagPaneComponent implements OnInit {
  tags: any[] = [];
  selectedValue = "";

  constructor(private http: HttpClient) { }

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

}
