import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FilesService } from '../../services/files.service';
import { AuthService } from 'src/app/services/auth.service';

const misc: any = {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0,
};

@Component({
    selector: 'app-problem-card',
    templateUrl: './problem-card.component.html',
    styleUrls: ['./problem-card.component.css'],
})
export class ProblemCardComponent implements OnInit {
    @Input() problemData: any;
    @Input() index: number = null;
    @Input() usedInSmartSearch = false;
    @Input() showAddButton = false;

    @Output() selected = new EventEmitter();

    numOfVotes = 0;
    numOfWatchers = 0;
    numOfValidations = 0;
    validated = false;
    link = '';
    imageAlt = 'default image';
    profilePhoto = './assets/img/default-avatar.png';

    constructor(
        public router: Router,
        public filesService: FilesService,
        public auth: AuthService
    ) {}

    ngOnInit() {
        if (this.problemData.is_draft) {
            this.link += `/problems/${this.problemData.id}/edit`;
        } else {
            this.link += `/problems/${this.problemData.id}`;
        }
        if (
            this.problemData.problem_voters &&
            this.problemData.problem_voters.length
        ) {
            this.numOfVotes = this.problemData.problem_voters.length;
        }
        if (
            this.problemData.problem_watchers &&
            this.problemData.problem_watchers.length
        ) {
            this.numOfWatchers = this.problemData.problem_watchers.length;
        }
        if (
            this.problemData.problem_validations &&
            this.problemData.problem_validations.length
        ) {
            this.numOfValidations = this.problemData.problem_validations.length;
            this.validated = true;
        }

        if (
            this.problemData.user &&
            this.problemData.user.photo_url &&
            this.problemData.user.photo_url.fileEndpoint
        ) {
            this.profilePhoto =
                this.filesService.fileAccessUrl +
                this.problemData.user.photo_url.fileEndpoint;
        }
    }
    navigation() {
        if (!this.usedInSmartSearch) {
            this.router.navigate([this.link], {
                queryParamsHandling: 'preserve',
            });
        } else {
            window.open(this.link, '_blank');
        }
    }
    selectProblem() {
        this.selected.emit({
            id: this.problemData.id,
            title: this.problemData.title,
        });
    }

    checkUrlIsImg(url) {
        const arr = ['jpeg', 'jpg', 'gif', 'png'];
        const ext = url.substring(url.lastIndexOf('.') + 1);
        if (arr.indexOf(ext) > -1) {
            return true;
        } else {
            return false;
        }
    }
}
