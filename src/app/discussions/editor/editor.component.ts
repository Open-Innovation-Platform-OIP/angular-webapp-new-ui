import {
    Component,
    OnInit,
    Input,
    AfterViewInit,
    Output,
    EventEmitter,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { FilesService } from 'src/app/services/files.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, AfterViewInit {
    @ViewChild('upload', { static: false }) uploadBtn: ElementRef<HTMLElement>;
    @ViewChild('commentElement', { static: false }) commentElement: ElementRef<
        HTMLElement
    >;
    @Input() user;
    @Input() actionText: string;
    @Input() id;
    @Input() cancelShown = false;
    @Output() submit = new EventEmitter();
    @Output() cancel = new EventEmitter();
    content = '';
    mentions = [];
    attachments: Blob[] = [];
    blankSpace = true;
    fileTypes = [
        'application/msword',
        ' application/vnd.ms-excel',
        ' application/vnd.ms-powerpoint',
        'text/plain',
        ' application/pdf',
        ' image/*',
        'video/*',
    ];

    constructor(public filesService: FilesService, public auth: AuthService) {}

    ngOnInit() {}

    ngAfterViewInit() {
        // console.log(this.user);
        this.commentElement.nativeElement.addEventListener(
            'input',
            e => {
                this.content = e.target['innerText'];
            },
            false
        );
    }

    clickInputFile() {
        this.uploadBtn.nativeElement.click();
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

    onFileSelected(attach_files) {
        if (attach_files && attach_files.target.files) {
            for (let i = 0; i < attach_files.target.files.length; i++) {
                const file = attach_files.target.files[i];
                if (!this.isFileDuplicate(file)) {
                    this.attachments.push(file);
                } else {
                    alert(`File: ${file.name} already exist.`);
                    continue;
                }
            }
        }
    }

    isFileDuplicate(file) {
        const found = this.attachments.find(attachment => {
            return attachment['name'] === file.name;
        });

        return this.attachments.includes(found);
    }

    removeFile(i) {
        if (this.attachments.length === 1) {
            this.attachments = [];
        } else {
            this.attachments.splice(i, 1);
        }
    }

    submitComment() {
        console.log(this.content);
        console.log(this.attachments);
        console.log(this.id);

        // return;
        this.filesService.fileinput_id = `fileInput-${this.id}`;
        this.submit.emit([this.content, this.mentions, this.attachments]);

        this.commentElement.nativeElement.innerText = '';
        this.content = '';
        this.mentions = [];
        this.attachments = [];
    }
}
