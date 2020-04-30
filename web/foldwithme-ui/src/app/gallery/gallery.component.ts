import { Component } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FoldUserModule } from '../fold-user/fold-user.module';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent {

  constructor(
      private route: ActivatedRoute,
      private router: Router) { }

  code = "";

  ngOnInit() {
    const routeObs = this.route.paramMap.subscribe(
        (params: ParamMap) => this.code = params.get('code'));
  }

  startDrawing() {
    this.router.navigate(['draw', '-', {'gallery': this.code}]);
  }
}
