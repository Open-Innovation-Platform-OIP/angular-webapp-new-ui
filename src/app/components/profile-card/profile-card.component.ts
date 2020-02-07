import { Component, OnInit, Input } from '@angular/core';
import { FilesService } from '../../services/files.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile-card',
    templateUrl: './profile-card.component.html',
    styleUrls: ['./profile-card.component.scss'],
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
                const persona = data[0].slice(3);
                this.personas.push(this.capitalize(persona));
            }
        });
    }

    capitalize(word: string): string {
        if (word.toLowerCase() === 'ngo') {
            return word.toUpperCase();
        } else {
            return word[0].toUpperCase() + word.slice(1);
        }
    }
}
