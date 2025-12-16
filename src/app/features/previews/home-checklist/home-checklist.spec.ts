import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeChecklist } from './home-checklist';

describe('HomeChecklist', () => {
  let component: HomeChecklist;
  let fixture: ComponentFixture<HomeChecklist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeChecklist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeChecklist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
