import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.scss']
})
export class DocsComponent implements OnInit {
  @Output() close = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
