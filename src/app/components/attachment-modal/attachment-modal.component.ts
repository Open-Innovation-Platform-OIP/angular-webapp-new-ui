import { Component, OnInit, Input } from '@angular/core';
import { FilesService } from 'src/app/services/files.service';

interface Attachment {
  key: string;
  fileEndpoint: string;
  mimeType: string;
};

@Component({
  selector: 'app-attachment-modal',
  templateUrl: './attachment-modal.component.html',
  styleUrls: ['./attachment-modal.component.scss']
})

export class AttachmentModalComponent implements OnInit {

  @Input() attachments: Attachment[]; // array of attachments - see interface Attachment
  indexInFocus = 0; // index within attachments of the image in focus

  constructor(
    public filesService: FilesService
  ) {}

  ngOnInit() {
  }

}
