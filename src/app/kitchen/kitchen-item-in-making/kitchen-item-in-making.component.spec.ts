import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenItemInMakingComponent } from './kitchen-item-in-making.component';

describe('KitchenItemInMakingComponent', () => {
  let component: KitchenItemInMakingComponent;
  let fixture: ComponentFixture<KitchenItemInMakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KitchenItemInMakingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KitchenItemInMakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
