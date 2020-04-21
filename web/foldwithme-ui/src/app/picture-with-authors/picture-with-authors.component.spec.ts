import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureWithAuthorsComponent } from './picture-with-authors.component';

describe('PictureWithAuthorsComponent', () => {
  let component: PictureWithAuthorsComponent;
  let fixture: ComponentFixture<PictureWithAuthorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PictureWithAuthorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureWithAuthorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
