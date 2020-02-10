import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TagsService } from '../../services/tags.service';
import { FormControl } from '@angular/forms';
import { GeocoderService } from '../../services/geocoder.service';
import { FilterService } from '../../services/filter.service';

declare var $: any;
declare var google: any;

@Component({
    selector: 'app-filter-dropdown',
    templateUrl: './filter-dropdown.component.html',
    styleUrls: ['./filter-dropdown.component.scss'],
})
export class FilterDropdownComponent implements OnInit {
    @Input() type: string;
    selectedSectors: any = [];
    selectedSector = 'all';
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
    autocomplete;

    constructor(
        private tagsService: TagsService,
        private router: Router,
        private geoService: GeocoderService,
        private activatedRoute: ActivatedRoute,
        private filterService: FilterService
    ) {}

    async ngOnInit() {
        // this.myControl.valueChanges.subscribe(val => {
        //     this.getLocation(val);
        // });
        // $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAxSPvgric8Zn54pYneG9NondiINqdvb-w&libraries=places");
        this.autocomplete = new google.maps.places.Autocomplete(
            document.getElementById('autocomplete'),
            { types: ['establishment'] }
        );

        // Avoid paying for data that you don't need by restricting the set of
        // place fields that are returned to just the address components.
        this.autocomplete.setFields(['address_component', 'geometry', 'name']);

        // When the user selects an address from the drop-down, populate the
        // address fields in the form.
        this.autocomplete.addListener('place_changed', () =>
            this.setLocation()
        );
        // await this.tagsService.getTagsFromDB('');

        this.sectors = this.tagsService.allTags;
        // console.log("Sectors", this.sectors);

        this.activatedRoute.queryParams.subscribe(async params => {
            this.selectedSectors =
                this.filterService.filterSector(params) || [];
            if (this.selectedSectors.length > 0) {
                this.selectedSector = this.selectedSectors[0];
            }
            // console.log(this.selectedSectors);

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

    setLocation() {
        const place = this.autocomplete.getPlace();

        console.log(place);

        // this.selectedLocationName = place.name;

        const address_mapping = {
            street_number: {
                short_name: 'location_name',
            },
            // route: {
            //     long_name: 'street_2'
            // },
            locality: {
                long_name: 'city',
            },
            administrative_area_level_1: {
                // short_name: 'state_code',
                long_name: 'state',
            },
            country: {
                // short_name: 'country_code',
                long_name: 'country',
            },
            // postal_code: {
            //     short_name: 'postal_code'
            // }
        };

        // this.selectedLocation = {
        //     location_name: place.,
        //     latitude: locationData.DisplayPosition.Latitude,
        //     longitude: locationData.DisplayPosition.Longitude,
        //     type: event.option.value.MatchLevel,
        // };

        // Get each component of the address from the place details,
        // and then fill-in the corresponding field on the form.
        for (let i = 0; i < place.address_components.length; i++) {
            const address_type = place.address_components[i].types[0];
            if (address_mapping[address_type]) {
                if (address_mapping[address_type]['short_name']) {
                    this.selectedLocation[
                        address_mapping[address_type]['short_name']
                    ] = place.address_components[i]['short_name'];
                    // frm.set_value(address_mapping[address_type]['short_name'], place.address_components[i]['short_name'])
                }
                if (address_mapping[address_type]['long_name']) {
                    this.selectedLocation[
                        address_mapping[address_type]['long_name']
                    ] = place.address_components[i]['long_name'];
                    // frm.set_value(address_mapping[address_type]['long_name'], place.address_components[i]['long_name'])
                }
            }
        }
        this.selectedLocation['latitude'] = place.geometry.location.lat();
        this.selectedLocation['longitude'] = place.geometry.location.lng();
        this.selectedLocation['location_name'] = place.name;
        // console.log(this.selectedLocation);
        // frm.set_value('utc_offset', place.utc_offset_minutes);
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
        // console.log(event);
        // if (event && event.option && event.option.value) {
        //     const locationData = event.option.value.Location;

        //     this.selectedLocationName = locationData.Address.Label;
        //     this.selectedLocation = {
        //         location_name: locationData.Address.Label,
        //         latitude: locationData.DisplayPosition.Latitude,
        //         longitude: locationData.DisplayPosition.Longitude,
        //         type: event.option.value.MatchLevel,
        //     };

        //     if (locationData.Address.City) {
        //         this.selectedLocation['city'] = locationData.Address.City;
        //     }
        //     if (locationData.Address.State) {
        //         this.selectedLocation['state'] = locationData.Address.State;
        //     }
        //     if (locationData.Address.Country) {
        //         this.selectedLocation['country'] = locationData.Address.Country;
        //     }
        // }
        // if (event && event.target && event.target.selectedOptions) {
        //     this.selectedSectors = [];
        //     for (let o of event.target.selectedOptions) {
        //         // console.log(o);
        //         if (o.value !== 'all') {
        //             this.selectedSectors.push(o.value);
        //         }
        //     }
        // }
        // hack because filters needs array and we are currently using a single select
        if (this.selectedSector) {
            this.selectedSectors = [this.selectedSector];
        }
        if (this.selectedSector === 'all') {
            this.selectedSectors = [];
        }

        // if (!this.selectedLocationName) {
        //     this.selectedLocation = {};
        // }

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

        // console.log("Queries", queries);

        if (!Object.values(this.selectedLocation).length) {
            if (queries['locationRange']) {
                delete queries['locationRange'];
            }
            // console.log('About to navigate with', queries);
            this.router.navigate(['/' + this.type], {
                queryParams: queries,
            });
            return;
        }

        if (Object.values(this.selectedLocation).length) {
            queries['filterLocation'] = JSON.stringify(this.selectedLocation);
        }

        // console.log('About to navigate with', queries);

        this.router.navigate(['/' + this.type], {
            queryParams: queries,
        });
    }
}
