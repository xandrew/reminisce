import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-picture-with-authors',
  templateUrl: './picture-with-authors.component.html',
  styleUrls: ['./picture-with-authors.component.scss']
})
export class PictureWithAuthorsComponent implements OnInit {

  constructor(private router: Router) { }
  @Input() display_data;
  @Input() gallery;

  ngOnInit() {
  }

  routeArrayFor(operation) {
    const res = [operation, this.display_data['id']];
    if (this.gallery) {
      res.push({'gallery': this.gallery});
    }
    return res;
  }


  onClick() {
    this.router.navigate(['picture', this.display_data['id']]);
  }
}
