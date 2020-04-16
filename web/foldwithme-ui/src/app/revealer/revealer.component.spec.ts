import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevealerComponent } from './revealer.component';

describe('RevealerComponent', () => {
  let component: RevealerComponent;
  let fixture: ComponentFixture<RevealerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevealerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevealerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
