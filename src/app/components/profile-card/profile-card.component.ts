import { Component, OnInit, Input } from '@angular/core';
import { FilesService } from '../../services/files.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {
  @Input() userData: any;
  @Input() index = 0;
  personas = [];

  constructor(
    public filesService: FilesService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.fillPersona();
  }

  fillPersona() {
    Object.entries(this.userData).map(data => {
      if (data[0].startsWith('is_') && data[1]) {
        this.personas.push(data[0].slice(3));
      }
    });
  }
}
