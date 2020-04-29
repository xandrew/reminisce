import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPicturesComponent } from './user-pictures.component';

describe('UserPicturesComponent', () => {
  let component: UserPicturesComponent;
  let fixture: ComponentFixture<UserPicturesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserPicturesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPicturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
