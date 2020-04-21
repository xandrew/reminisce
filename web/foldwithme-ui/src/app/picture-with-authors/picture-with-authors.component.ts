import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-picture-with-authors',
  templateUrl: './picture-with-authors.component.html',
  styleUrls: ['./picture-with-authors.component.scss']
})
export class PictureWithAuthorsComponent implements OnInit {

  constructor() { }
  @Input() display_data;

  ngOnInit() {
  }

}
