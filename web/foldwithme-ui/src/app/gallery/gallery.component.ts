import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FoldUserModule } from '../fold-user/fold-user.module';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  constructor(
      private fold_user: FoldUserModule,
      private route: ActivatedRoute,
      private router: Router) { }

  code = "";

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      console.log(params);
      this.code = params.get('code');
    });
  }

}
