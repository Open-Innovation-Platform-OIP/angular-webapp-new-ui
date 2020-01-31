import { Component, OnInit, Input } from '@angular/core';
import { FilesService } from '../../services/files.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-solution-card',
  templateUrl: './solution-card.component.html',
  styleUrls: ['./solution-card.component.css']
})
export class SolutionCardComponent implements OnInit {
  @Input() solutionData: any;
  @Input() index: number;

  numOfVotes: Number = 0;
  numOfWatchers: Number = 0;
  numOfValidations: Number = 0;
  validated: Boolean = false;
  link = '';
  imageAlt = 'default image';
  sol_tags: string[] = [];

  constructor(public filesService: FilesService, public auth: AuthService) {}

  ngOnInit() {
    if (this.solutionData.is_draft) {
      this.link += `/solutions/${this.solutionData.id}/edit`;
    } else {
      this.link += `/solutions/${this.solutionData.id}`;
    }

    if (
      this.solutionData.solution_voters &&
      this.solutionData.solution_voters.length
    ) {
      this.numOfVotes = this.solutionData.solution_voters.length;
    }
    if (
      this.solutionData.solution_watchers &&
      this.solutionData.solution_watchers.length
    ) {
      this.numOfWatchers = this.solutionData.solution_watchers.length;
    }
    if (
      this.solutionData.solution_validations &&
      this.solutionData.solution_validations.length
    ) {
      this.numOfValidations = this.solutionData.solution_validations.length;
      this.validated = true;
    }

    if (
      this.solutionData.solutions_tags &&
      this.solutionData.solutions_tags.length
    ) {
      this.sol_tags = this.composeTagsArr(this.solutionData.solutions_tags);
    }
    // console.log(this.solutionData);
  }

  composeTagsArr(tags) {
    return tags.map(tag => tag.tag.name);
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
