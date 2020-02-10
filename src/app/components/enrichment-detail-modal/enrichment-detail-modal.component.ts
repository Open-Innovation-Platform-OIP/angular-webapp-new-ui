import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FilesService } from '../../services/files.service';

@Component({
    selector: 'app-enrichment-detail-modal',
    templateUrl: './enrichment-detail-modal.component.html',
    styleUrls: ['./enrichment-detail-modal.component.scss'],
})
export class EnrichmentDetailModalComponent implements OnInit {
    @ViewChild('media', { static: false }) mediaTab: ElementRef<HTMLElement>;

    @Input() id = '';
    @Input() enrichment = {};
    keysToShow = {
        extent: 'Extent',
        impact: 'Impact',
        organization: 'Organization',
        beneficiary_attributes: 'Beneficiary Attributes',
        resources_needed: 'Resources Needed',
    };
    objectKeys = Object.keys;
    indexInFocus = 0;
    constructor(public filesService: FilesService) {}

    ngOnInit() {
        // console.log(this.enrichment);
    }

    changeTab() {
        this.mediaTab.nativeElement.click();
    }
}
