import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { BulkActionBarComponent } from './components/bulk-action-bar/bulk-action-bar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, BulkActionBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
