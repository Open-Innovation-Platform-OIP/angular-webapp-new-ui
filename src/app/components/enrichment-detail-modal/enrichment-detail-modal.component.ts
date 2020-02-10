import { Component, OnInit, Input } from '@angular/core';
import { FilesService } from '../../services/files.service';

@Component({
  selector: 'app-enrichment-detail-modal',
  templateUrl: './enrichment-detail-modal.component.html',
  styleUrls: ['./enrichment-detail-modal.component.scss']
})
export class EnrichmentDetailModalComponent implements OnInit {

  @Input() id = "";
  @Input() enrichment = {};
  keysToShow = {
    description: 'Description',
    extent: 'Extent',
    impact: 'Impact',
    organization: 'Organization',
    beneficiary_attributes: 'Beneficiary Attributes',
    resources_needed: 'Resources Needed'
  };
  objectKeys = Object.keys;
  indexInFocus = 0;
  constructor(
    public filesService: FilesService,
  ) { }

  ngOnInit() {
    // console.log(this.enrichment['attachments']);
  }

}
