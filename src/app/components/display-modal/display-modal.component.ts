import {
    Component,
    ViewChild,
    OnInit,
    Input,
    Output,
    EventEmitter,
} from '@angular/core';
// import { EmbedVideoService } from 'ngx-embed-video';

import { FilesService } from '../../services/files.service';
@Component({
    selector: 'app-display-modal',
    templateUrl: './display-modal.component.html',
    styleUrls: ['./display-modal.component.css'],
})
export class DisplayModalComponent implements OnInit {
    @Input() source;
    iframeHTML: any;

    constructor(
        // private embedService: EmbedVideoService,
        private filesService: FilesService
    ) {}

    ngOnInit() {}

    checkUrlIsImg(url) {
        const arr = ['jpeg', 'jpg', 'gif', 'png'];
        const ext = url.substring(url.lastIndexOf('.') + 1);
        if (arr.indexOf(ext) > -1) {
            return true;
        } else {
            return false;
        }
    }
    checkUrlIsVideo(url) {
        const arr = ['mp4', 'avi', 'webm', 'wmv', 'quicktime'];
        const ext = url.substring(url.lastIndexOf('.') + 1);
        if (arr.indexOf(ext) > -1) {
            return true;
        } else {
            return false;
        }
    }

    checkUrlIsEmbeded(url) {
        const arr = ['youtube', 'vimeo', 'dailymotion'];

        const filtered = arr.filter(provider => {
            return url.indexOf(provider) > -1;
        });

        if (filtered.length) {
            // this.iframeHTML = this.iframeHTML = this.embedService.embed(url, {
            //   attr: { width: '100%', height: 500 }
            // });
            return true;
        } else {
            return false;
        }
    }
}
