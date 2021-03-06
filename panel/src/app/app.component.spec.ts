import { TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule, MatTableModule } from '@angular/material';
import { AppComponent } from '@app/app.component';
import { ChromeMockService, ChromeService } from '@app/root/chrome';
import { SpyService } from '@app/root/spy';

describe('AppComponent', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        BrowserAnimationsModule,
        MatSidenavModule,
        MatTableModule
      ],
      providers: [
        { provide: ChromeService, useClass: ChromeMockService },
        SpyService
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
