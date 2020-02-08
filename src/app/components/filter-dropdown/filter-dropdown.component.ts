import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TagsService } from '../../services/tags.service';
import { FormControl } from '@angular/forms';
import { GeocoderService } from '../../services/geocoder.service';
import { FilterService } from '../../services/filter.service';

@Component({
    selector: 'app-filter-dropdown',
    templateUrl: './filter-dropdown.component.html',
    styleUrls: ['./filter-dropdown.component.scss'],
})
export class FilterDropdownComponent implements OnInit {
    @Input() type: string;
    selectedSectors: any = [];
    selectedSector = '';
    selectedLocation: any = {};
    range: any;
    selectedLocationName = '';

    myControl = new FormControl();

    ranges = {
        0: '0 Kms',
        25: '25 kms',
        50: '50 kms',
        100: '100 kms',
        200: '200 kms',
    };

    sectors: any = {};
    locations: any = [];
    objectValues = Object.values;
    objectKeys = Object.keys;

    constructor(
        private tagsService: TagsService,
        private router: Router,
        private geoService: GeocoderService,
        private activatedRoute: ActivatedRoute,
        private filterService: FilterService
    ) {}

    async ngOnInit() {
        this.myControl.valueChanges.subscribe(val => {
            this.getLocation(val);
        });

        // await this.tagsService.getTagsFromDB('');

        this.sectors = this.tagsService.allTags;
        // console.log("Sectors", this.sectors);

        this.activatedRoute.queryParams.subscribe(async params => {
            this.selectedSectors = this.filterService.filterSector(params) || [];
            if (this.selectedSectors.length > 0) {
                this.selectedSector = this.selectedSectors[0];
            }
            console.log(this.selectedSectors);

            this.selectedLocation = this.filterService.filterLocation(params);
            if (Object.values(this.selectedLocation).length) {
                this.selectedLocationName = this.selectedLocation.location_name;
            }
            if (params.locationRange) {
                this.range = Math.round(+params.locationRange * 110).toString();
                this.filterService.range = +params.locationRange;
            } else {
                this.range = '0';
            }
            this.selectDropdown(null);
        });
    }

    getLocation(input) {
        this.geoService.getAddress(this.selectedLocationName).then(
            result => {
                this.locations = <Array<any>>result;
            },
            error => {
                console.error(error);
            }
        );
    }

    selectDropdown(event) {
        console.log(event);
        if (event && event.option && event.option.value) {
            const locationData = event.option.value.Location;

            this.selectedLocationName = locationData.Address.Label;
            this.selectedLocation = {
                location_name: locationData.Address.Label,
                latitude: locationData.DisplayPosition.Latitude,
                longitude: locationData.DisplayPosition.Longitude,
                type: event.option.value.MatchLevel,
            };

            if (locationData.Address.City) {
                this.selectedLocation['city'] = locationData.Address.City;
            }
            if (locationData.Address.State) {
                this.selectedLocation['state'] = locationData.Address.State;
            }
            if (locationData.Address.Country) {
                this.selectedLocation['country'] = locationData.Address.Country;
            }
        }
        if (event && event.target) {
            this.selectedSectors = [];
            for (let o of event.target.selectedOptions) {
                // console.log(o);
                if (o.value !== 'all') {
                    this.selectedSectors.push(o.value);
                }
            }
        }

        if (!this.selectedLocationName) {
            this.selectedLocation = {};
        }

        const queries = {};

        if (+this.range !== 0) {
            this.filterService.range = +this.range / 110;
            queries['locationRange'] = this.filterService.range;
        } else {
            this.filterService.range = 0.2;
        }
        
        this.selectedSectors.map(sector => {
            queries[sector] = 'sectorFilter';
        });

        console.log("Queries", queries);

        if (!Object.values(this.selectedLocation).length) {
            if (queries['locationRange']) {
                delete queries['locationRange'];
            }
            console.log('About to navigate with', queries);
            this.router.navigate(['/' + this.type], {
                queryParams: queries,
            });
            return;
        }

        if (Object.values(this.selectedLocation).length) {
            queries['filterLocation'] = JSON.stringify(this.selectedLocation);
        }

        console.log('About to navigate with', queries);

        this.router.navigate(['/' + this.type], {
            queryParams: queries,
        });
    }
}
