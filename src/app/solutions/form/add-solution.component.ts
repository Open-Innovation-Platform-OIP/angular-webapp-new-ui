import {
    Component,
    OnInit,
    Input,
    OnChanges,
    OnDestroy,
    AfterViewInit,
    SimpleChanges,
    Output,
    EventEmitter,
    ElementRef,
    ViewChild,
} from '@angular/core';
import {
    FormControl,
    FormGroupDirective,
    NgForm,
    Validators,
    FormGroup,
} from '@angular/forms';
// import { ErrorStateMatcher } from '@angular/material/core';
import { TagsService } from '../../services/tags.service';
import { FilesService } from '../../services/files.service';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { GeocoderService } from '../../services/geocoder.service';
// import swal from 'sweetalert2';
const Buffer = require('buffer/').Buffer;
import { FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FilterService } from '../../services/filter.service';
import { Content } from '@angular/compiler/src/render3/r3_ast';

// import { COMMA, ENTER } from '@angular/cdk/keycodes';
// import {
//   MatAutocompleteSelectedEvent,
//   MatChipInputEvent,
//   MatAutocomplete
// } from '@angular/material';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { first } from 'rxjs/operators';
import { SearchService } from '../../services/search.service';
import { SolutionCardComponent } from 'src/app/components/solution-card/solution-card.component';
// import { DataRowOutlet } from '@angular/cdk/table';
// import {
//   FocusMonitor,
//   LiveAnnouncer,
//   AriaLivePoliteness
// } from '@angular/cdk/a11y';

declare var H: any;
declare const $: any;

let canProceed: boolean;
const re = /(youtube|youtu|vimeo|dailymotion)\.(com|be)\/((watch\?v=([-\w]+))|(video\/([-\w]+))|(projects\/([-\w]+)\/([-\w]+))|([-\w]+))/;

interface FileReaderEventTarget extends EventTarget {
    result: string;
}

interface FileReaderEvent extends Event {
    target: EventTarget;
    getMessage(): string;
}

// export class MyErrorStateMatcher implements ErrorStateMatcher {
//   isErrorState(
//     control: FormControl | null,
//     form: FormGroupDirective | NgForm | null
//   ): boolean {
//     const isSubmitted = form && form.submitted;
//     return !!(
//       control &&
//       control.invalid &&
//       (control.dirty || control.touched || isSubmitted)
//     );
//   }
// }

@Component({
    selector: 'app-add-solution',
    templateUrl: './add-solution.component.html',
    styleUrls: ['./add-solution.component.css'],
})
export class AddSolutionComponent
    implements OnInit, OnChanges, OnDestroy, AfterViewInit {
    @ViewChild('heading', { static: false }) pageHeading: ElementRef<
        HTMLElement
    >;
    @ViewChild('foundProblems', { static: false })
    foundProblemHeading: ElementRef<HTMLElement>;
    @ViewChild('foundSolutions', { static: false })
    foundSolutionHeading: ElementRef<HTMLElement>;
    @ViewChild('wizardContainer', { static: false })
    wizardContainer: ElementRef<HTMLElement>;
    @ViewChild('mediaLink', { static: false }) mediaLink: ElementRef<
        HTMLElement
    >;
    @ViewChild('nextBtn', { static: false }) nextBtn: ElementRef<HTMLElement>;
    @ViewChild('textLink', { static: false }) textLink: ElementRef<HTMLElement>;
    @ViewChild('problemInput', { static: false }) problemInput: ElementRef<
        HTMLInputElement
    >;
    @ViewChild('title', { static: false }) titleInput: ElementRef<
        HTMLInputElement
    >;
    @ViewChild('locationInput', { static: false }) locationInput: ElementRef<
        HTMLInputElement
    >;
    @ViewChild('ownerInput', { static: false }) ownerInput: ElementRef<
        HTMLInputElement
    >;
    @ViewChild('sectorInput', { static: false }) sectorInput: ElementRef<
        HTMLInputElement
    >;

    // @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
    // @ViewChild('autoSector', { static: false })
    // matAutocompleteSector: MatAutocomplete;

    owners: any[] = [];

    file_types = [
        'application/msword',
        ' application/vnd.ms-excel',
        ' application/vnd.ms-powerpoint',
        'text/plain',
        ' application/pdf',
        ' image/*',
        'video/*',
    ];

    objectKeys = Object.keys;

    // matcher = new MyErrorStateMatcher();

    type: FormGroup;

    selectedProblems: any = {};

    showProblemImpacts: Boolean = false;
    showProblemResourcesNeeded: Boolean = false;
    showProblemExtent: Boolean = false;
    showProblemBeneficiaryAttributes: Boolean = false;

    populationValue: Number;
    media_url = '';
    autosaveInterval: any;
    locations: any = [];
    locationInputValue: any;
    input_pattern = new RegExp('^s*');

    filteredSectors: Observable<any[]>;
    sectors: any = [];

    // readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    problemSearchResults: any = [];
    solutionSearchResults: any = [];

    problemCtrl = new FormControl();
    ownersCtrl = new FormControl();
    locationCtrl = new FormControl();
    sectorCtrl = new FormControl();
    filteredProblems: Observable<any>;

    selectedProblemsData: any = {};

    filteredOwners: Observable<any[]>;
    is_edit: Boolean = false;
    tags = [];
    removable = true;
    sizes = [
        { value: 100, viewValue: '<100' },
        { value: 1000, viewValue: '<1000' },
        { value: 10000, viewValue: '<10000' },
        { value: 100000, viewValue: '<100,000' },
        { value: 1000001, viewValue: '>100,000' },
    ];
    touch: boolean;
    hide = false;
    sideScrollHeight;

    objectValues = Object['values'];
    visible = true;
    selectable = true;
    addOnBlur = true;
    options: string[] = ['One', 'Two', 'Three'];
    filteredOptions: Observable<string[]>;
    problemId: Number;

    voted_by = [];
    watched_by = [];

    solution = {
        title: '',
        description: '',
        technology: '',
        resources: '',
        impact: '',
        timeline: '',
        pilots: '',
        website_url: '',
        deployment: 0,

        budget_title: '',
        min_budget: 0,
        max_budget: 0,
        extent: '',
        beneficiary_attributes: '',
        image_urls: [],
        video_urls: [],
        featured_url: '',
        embed_urls: [],
        featured_type: '',
        user_id: Number(this.auth.currentUserValue.id),
        is_draft: true,
        attachments: [],
    };

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private filesService: FilesService,
        private tagService: TagsService,
        private usersService: UsersService,
        private searchService: SearchService,
        private auth: AuthService,
        private here: GeocoderService,
        private apollo: Apollo,
        private http: HttpClient,
        private filterService: FilterService,
        // private focusMonitor: FocusMonitor,
        private element: ElementRef // private liveannouncer: LiveAnnouncer
    ) {
        this.type = this.formBuilder.group({
            // To add a validator, we must first convert the string value into an array.
            // The first item in the array is the default value if any,
            // then the next item in the array is the validator.
            // Here we are adding a required validator meaning that the firstName attribute must have a value in it.
            title: [null, Validators.required],
            description: [null, Validators.required],
            technology: [null, null],
            resources: [null, null],
            impact: [null, null],
            extent: [null, null],
            beneficiary_attributes: [null, null],
            timeline: [null, null],
            pilots: [null, null],
            deployment: [null, Validators.required],
            website_url: [null, null],
            assessment_metrics: [null, Validators.required],
            media_url: [null, null],
            budget: [null, Validators.required],
            budgetTest: [null, null],
            min_budget: [null, Validators.required],
            max_budget: [null, Validators.required],
        });

        canProceed = true;

        this.filteredSectors = this.sectorCtrl.valueChanges.pipe(
            startWith(null),
            map((sector: string | null) => (sector ? this._filter(sector) : []))
        );

        this.filteredOwners = this.ownersCtrl.valueChanges.pipe(
            startWith(null),
            map((owner: string | null) =>
                owner ? this.filterOwners(owner) : []
            )
        );
    }

    moveFocus(forHeading: string) {
        if (this.foundProblemHeading && forHeading === 'solutions') {
            // this.focusMonitor.focusVia(this.foundProblemHeading, 'program');
        }

        if (this.foundSolutionHeading && forHeading === 'problems') {
            // this.focusMonitor.focusVia(this.foundSolutionHeading, 'program');
        }
    }

    focusBack(place: string) {
        if (this.problemInput && place === 'selectProblem') {
            // this.focusMonitor.focusVia(this.problemInput, 'program');
        }
        if (this.titleInput && place === 'title') {
            // this.focusMonitor.focusVia(this.titleInput, 'program');
        }
    }

    isFieldValid(form: FormGroup, field: string) {
        return !form.get(field).valid && form.get(field).touched;
    }

    showSuccessSwal(title) {
        // swal({
        //     type: 'success',
        //     title: title,
        //     timer: 3000,
        //     showConfirmButton: false,
        // }).catch(swal.noop);
    }

    hideProblems(id) {
        if (id == 'problem') {
            this.hide = true;
        } else if (id == 'solution') {
            this.hide = false;
        }
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return Object.keys(this.tagService.allTags).filter(
            sector => sector.toLowerCase().indexOf(filterValue) === 0
        );
    }

    // sectorSelected(event: MatAutocompleteSelectedEvent): void {
    //     const sectorValue = event.option.value;
    //     this.sectors.push(sectorValue);
    //     this.sectorInput.nativeElement.value = '';
    //     this.sectorCtrl.setValue(null);
    //     this.announcement(`Added ${sectorValue}`);
    // }

    // addSector(event: MatChipInputEvent): void {
    //     if (!this.matAutocompleteSector.isOpen) {
    //         const input = event.input;
    //         const value = event.value;

    //         if ((value || '').trim()) {
    //             this.sectors.push(value.trim().toUpperCase());
    //         }

    //         if (input) {
    //             input.value = '';
    //         }
    //         this.sectorCtrl.setValue(null);
    //     }
    // }

    removeSector(sector: string): void {
        const index = this.sectors.indexOf(sector);
        // this.announcement(`removed ${sector}`);
        if (index >= 0) {
            this.sectors.splice(index, 1);
        }
        if (this.tagService.allTags[sector] && this.solution['id']) {
            this.tagService.removeTagRelation(
                this.tagService.allTags[sector].id,
                this.solution['id'],
                'solutions'
            );
        }
    }

    displayFieldCss(form: FormGroup, field: string) {
        return {
            'has-error': this.isFieldValid(form, field),
            'has-feedback': this.isFieldValid(form, field),
        };
    }

    // selected(event: MatAutocompleteSelectedEvent): void {
    //     const selectedProblem = event.option.value;
    //     this.getProblemData(selectedProblem.id);

    //     this.selectedProblems[selectedProblem.id] = selectedProblem;

    //     this.problemInput.nativeElement.value = '';
    //     this.problemCtrl.setValue(null);
    //     this.problemSearchResults = [];
    //     this.announcement(`Added ${selectedProblem['title']}`);
    // }
    selectProblem(problem) {
        this.selectedProblems[problem.id] = problem;
        this.getProblemData(problem.id);
        // this.announcement(`Added ${problem.title}`);
    }

    getProblemData(id) {
        this.apollo
            .watchQuery<any>({
                query: gql`
                  {
                      problems(where: { id: { _eq: ${id} } }) {
                      id
                      title

                      impact
                      extent
                      min_population

                      problems_tags{
                        tag{
                          name
                        }
                      }


                      max_population
                      beneficiary_attributes
                      resources_needed


                      }
                  }
                  `,

                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(take(1))
            .subscribe(
                result => {
                    const problemData = result.data.problems[0];

                    if (
                        problemData.problems_tags.length &&
                        this.solution.is_draft
                    ) {
                        problemData.problems_tags.map(tags => {
                            this.sectors.push(tags.tag.name);
                        });
                        this.sectors = this.removeDuplicates(this.sectors);
                    }

                    this.selectedProblemsData[problemData.id] = problemData;
                },
                error => {
                    console.error(JSON.stringify(error));
                }
            );
    }

    solutionSearch(solutionSearchInput: string) {
        if (solutionSearchInput.length >= 1) {
            this.problemSearchResults = [];

            this.http
                .post(
                    'https://elasticsearch-microservice.dev.jaagalabs.com/search_solutions',
                    {
                        keyword: solutionSearchInput,
                        filter: this.filterService.sector_filter_query,
                    }
                )
                .subscribe(
                    searchResults => {
                        this.solutionSearchResults = searchResults;

                        // this.announcement(
                        //     `Found ${this.solutionSearchResults.length} ${
                        //         this.solutionSearchResults.length < 2
                        //             ? 'solution'
                        //             : 'solutions'
                        //     }`
                        // );
                    },
                    error => {
                        console.error(error);
                    }
                );
        } else {
            this.solutionSearchResults = [];
        }
    }

    focusOnField(event) {
        if (event.target.id === 'impact') {
            this.showProblemImpacts = true;
        }
        if (event.target.id === 'resources_needed') {
            this.showProblemResourcesNeeded = true;
        }
        if (event.target.id === 'extent') {
            this.showProblemExtent = true;
        }
        if (event.target.id === 'beneficiary_attributes') {
            this.showProblemBeneficiaryAttributes = true;
        }
    }

    blurOnField(event) {
        this.showProblemImpacts = false;
        this.showProblemResourcesNeeded = false;
        this.showProblemExtent = false;
        this.showProblemBeneficiaryAttributes = false;
    }

    remove(problem): void {
        // this.announcement(`removed ${problem['title']}`);
        delete this.selectedProblems[problem.id];
        delete this.selectedProblemsData[problem.id];
        if (this.solution['id']) {
            this.apollo
                .mutate<any>({
                    mutation: gql`
                        mutation DeleteMutation(
                            $where: problems_solutions_bool_exp!
                        ) {
                            delete_problems_solutions(where: $where) {
                                affected_rows
                                returning {
                                    problem_id
                                }
                            }
                        }
                    `,
                    variables: {
                        where: {
                            problem_id: {
                                _eq: problem.id,
                            },
                            solution_id: {
                                _eq: this.solution['id'],
                            },
                        },
                    },
                })
                .pipe(take(1))
                .subscribe(
                    ({ data }) => {
                        return;
                    },
                    error => {
                        console.error('Could not delete due to ' + error);
                    }
                );
        }
    }

    saveProblemsInDB(solutionId, problemsArray) {
        let problems_solutions = [];
        problemsArray = Object.values(problemsArray);
        problems_solutions = problemsArray.map(problem => {
            return {
                problem_id: problem.id,
                solution_id: solutionId,
            };
        });
        const upsert_problems_solutions = gql`
            mutation upsert_problems_solutions(
                $problems_solutions: [problems_solutions_insert_input!]!
            ) {
                insert_problems_solutions(
                    objects: $problems_solutions
                    on_conflict: {
                        constraint: problems_solutions_pkey
                        update_columns: []
                    }
                ) {
                    affected_rows
                    returning {
                        problem_id
                        solution_id
                    }
                }
            }
        `;

        this.apollo
            .mutate({
                mutation: upsert_problems_solutions,
                variables: {
                    problems_solutions: problems_solutions,
                },
            })
            .pipe(take(1))
            .subscribe(
                data => {},
                error => {
                    console.error(JSON.stringify(error));
                }
            );
    }

    saveOwnersInDB(solutionId, ownersArray) {
        let owners = [];
        owners = ownersArray.map(owner => {
            return {
                user_id: owner.id,
                solution_id: solutionId,
            };
        });
        const upsert_solution_owners = gql`
            mutation upsert_solution_owners(
                $solution_owners: [solution_owners_insert_input!]!
            ) {
                insert_solution_owners(
                    objects: $solution_owners
                    on_conflict: {
                        constraint: solution_owners_pkey
                        update_columns: []
                    }
                ) {
                    affected_rows
                    returning {
                        user_id
                        solution_id
                    }
                }
            }
        `;

        this.apollo
            .mutate({
                mutation: upsert_solution_owners,
                variables: {
                    solution_owners: owners,
                },
            })
            .pipe(take(1))
            .subscribe(
                data => {},
                error => {
                    console.error(JSON.stringify(error));
                }
            );
    }

    // announcement(message: string, politeness?: AriaLivePoliteness) {
    //     this.liveannouncer
    //         .announce(message, politeness)
    //         .then(x => console.log('announced'))
    //         .catch(e => console.error(e));
    // }

    searchProblem(event) {
        if (event && event.target && event.target.value) {
            const keyword = event.target.value;
            this.problemSearchResults = [];

            this.http
                .post(
                    'https://elasticsearch-microservice.dev.jaagalabs.com/search_problems',
                    {
                        keyword: keyword,
                        filter: this.filterService.sector_filter_query,
                    }
                )
                .subscribe(
                    searchResults => {
                        this.problemSearchResults = searchResults;

                        // this.announcement(
                        //     `Found ${this.problemSearchResults.length} ${
                        //         this.problemSearchResults.length < 2
                        //             ? 'problem'
                        //             : 'problems'
                        //     }`
                        // );
                        this.setScrollableHeight();
                    },
                    error => {
                        console.error(error);
                    }
                );
        }
    }

    filterOwners(value: String): any[] {
        if (typeof value === 'string') {
            const filterValue = value.toLowerCase();

            return Object.values(this.usersService.allUsers).filter(owner => {
                if (owner['value'].toLowerCase().indexOf(filterValue) === 0) {
                    return owner;
                }
            });
        }
    }

    // selectedOwner(event: MatAutocompleteSelectedEvent): void {
    //     const owner = event.option.value;
    //     this.announcement(`Added ${owner.value}`);
    //     this.owners.push(owner);
    //     this.ownerInput.nativeElement.value = '';
    //     this.ownersCtrl.setValue(null);
    // }

    removeOwner(owner) {
        // this.announcement(`Removed ${owner.value}`);
        const index = this.owners.indexOf(owner);
        if (index >= 0) {
            this.owners.splice(index, 1);
        }
        if (this.solution['id']) {
            this.apollo
                .mutate<any>({
                    mutation: gql`
                        mutation DeleteMutation(
                            $where: solution_owners_bool_exp!
                        ) {
                            delete_solution_owners(where: $where) {
                                affected_rows
                                returning {
                                    user_id
                                }
                            }
                        }
                    `,
                    variables: {
                        where: {
                            user_id: {
                                _eq: owner.id,
                            },
                            solution_id: {
                                _eq: this.solution['id'],
                            },
                        },
                    },
                })
                .pipe(take(1))
                .subscribe(
                    ({ data }) => {
                        return;
                    },
                    error => {
                        console.error('Could not delete due to ' + error);
                    }
                );
        }
    }

    addOwner(event) {}

    ngOnInit() {
        this.tagService.getTagsFromDB(this.filterService.domain_tags_query);

        this.problemId = Number(this.route.snapshot.paramMap.get('problemId'));

        if (this.problemId) {
            this.selectedProblems[Number(this.problemId)] = this.problemId;
        }
        this.autosaveInterval = setInterval(() => {
            this.autoSave();
        }, 10000);

        if (Object.values(this.selectedProblems).length) {
            Object.values(this.selectedProblems).forEach(problemId => {
                this.getProblemData(problemId);
            });
        }

        this.route.params.pipe(first()).subscribe(params => {
            if (params.id) {
                this.apollo
                    .watchQuery<any>({
                        query: gql`
                        {
                            solutions(where: { id: { _eq: ${params.id} } }) {
                            id
                            title
                            user_id
                            technology
                            resources
                            description
                            website_url
                            deployment

                            budget_title
                            min_budget
                            max_budget
                            is_draft
                            image_urls
                            video_urls
                            attachments
                            impact
                            timeline
                            extent
                            beneficiary_attributes
                            pilots
                            embed_urls
                            featured_url
                            featured_type
                            problems_solutions{
                              problem{
                                id
                                title
                              }
                            }
                            solutions_tags{
                              tag {
                                  id
                                  name
                              }
                          }
                            solution_owners(where: { user_id: { _neq: ${this.auth.currentUserValue.id} } }) {
                              user {
                                id
                                name
                              }
                            }

                            }
                        }
                        `,
                    })
                    .valueChanges.pipe(take(1))
                    .subscribe(
                        result => {
                            this.solution['id'] = result.data.solutions[0].id;
                            this.is_edit = true;
                            Object.keys(this.solution).map(key => {
                                this.solution[key] =
                                    result.data.solutions[0][key];
                            });

                            if (result.data.solutions[0].solutions_tags) {
                                this.sectors = result.data.solutions[0].solutions_tags.map(
                                    tagArray => {
                                        return tagArray.tag.name;
                                    }
                                );
                            }

                            result.data.solutions[0].problems_solutions.map(
                                problem => {
                                    this.selectedProblems[problem.problem.id] =
                                        problem.problem;

                                    this.getProblemData(problem.problem.id);
                                }
                            );

                            if (result.data.solutions[0].solution_owners) {
                                this.owners = this.removeDuplicates(
                                    this.owners
                                );
                                result.data.solutions[0].solution_owners.forEach(
                                    ownerArray => {
                                        this.owners.push(ownerArray.user);
                                    }
                                );
                            }
                        },
                        error => {
                            console.error(JSON.stringify(error));
                        }
                    );
            }
        });

        this.type = this.formBuilder.group({
            // To add a validator, we must first convert the string value into an array.
            // The first item in the array is the default value if any,
            // then the next item in the array is the validator.
            // Here we are adding a required validator meaning that the firstName attribute must have a value in it.
            title: [null, Validators.required],
            description: [null, Validators.required],
            technology: [null, null],
            resources: [null, null],
            impact: [null, null],
            extent: [null, null],
            beneficiary_attributes: [null, null],
            timeline: [null, null],
            pilots: [null, null],
            deployment: [null, Validators.required],
            website_url: [null, null],
            assessment_metrics: [null, Validators.required],
            media_url: [null, null],
            budget: [null, Validators.required],
            budgetCost: [null, null],
            min_budget: [null, Validators.required],
            max_budget: [null, Validators.required],
        });

        // Code for the Validator
        const $validator = $('.card-wizard form').validate({
            rules: {
                title: {
                    required: true,
                    minlength: 3,
                },
                description: {
                    required: true,
                },
                deployment: {
                    required: true,
                },
                assessment_metrics: {
                    required: true,
                },
            },

            highlight: function(element) {
                $(element)
                    .closest('.form-group')
                    .removeClass('has-success')
                    .addClass('has-danger');
            },
            success: function(element) {
                $(element)
                    .closest('.form-group')
                    .removeClass('has-danger')
                    .addClass('has-success');
            },
            errorPlacement: function(error, element) {
                $(element).append(error);
            },
        });

        // Wizard Initialization
        $('.card-wizard').bootstrapWizard({
            tabClass: 'nav nav-pills',
            nextSelector: '.btn-next',
            previousSelector: '.btn-previous',

            onNext: function(tab, navigation, index) {
                window.scroll(0, 0);

                const $valid = $('.card-wizard form').valid();
                if (!$valid) {
                    $validator.focusInvalid();
                    return false;
                }
            },

            onInit: function(tab: any, navigation: any, index: any) {
                // check number of tabs and fill the entire row
                let $total = navigation.find('li').length;
                const $wizard = navigation.closest('.card-wizard');

                const $first_li = navigation.find('li:first-child a').html();
                const $moving_div = $(
                    '<div class="moving-tab">' + $first_li + '</div>'
                );
                $('.card-wizard .wizard-navigation').append($moving_div);

                $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                const total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                const mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                const step_width = move_distance;
                move_distance = move_distance * index_temp;

                const $current = index + 1;

                if (
                    $current == 1 ||
                    (mobile_device == true && index % 2 == 0)
                ) {
                    move_distance -= 8;
                } else if (
                    $current == total_steps ||
                    (mobile_device == true && index % 2 == 1)
                ) {
                    move_distance += 8;
                }

                if (mobile_device) {
                    const x: any = index / 2;
                    vertical_level = parseInt(x);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    transform:
                        'translate3d(' +
                        move_distance +
                        'px, ' +
                        vertical_level +
                        'px, 0)',
                    transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)',
                });
                $('.moving-tab').css('transition', 'transform 0s');
            },

            onTabClick: function(tab: any, navigation: any, index: any) {
                return true;

                // const $valid = $('.card-wizard form').valid();

                // if (!$valid) {
                //     return false;
                // } else {
                //     return true;
                // }
            },

            onTabShow: function(tab: any, navigation: any, index: any) {
                let $total = navigation.find('li').length;
                let $current = index + 1;

                const $wizard = navigation.closest('.card-wizard');

                // If it's the last tab then hide the last button and show the finish instead
                if ($current >= $total) {
                    $($wizard)
                        .find('.btn-next')
                        .hide();
                    $($wizard)
                        .find('.btn-finish')
                        .show();
                } else {
                    $($wizard)
                        .find('.btn-next')
                        .show();
                    $($wizard)
                        .find('.btn-finish')
                        .hide();
                }

                const button_text = navigation
                    .find('li:nth-child(' + $current + ') a')
                    .html();

                setTimeout(function() {
                    $('.moving-tab').text(button_text);
                }, 150);

                const checkbox = $('.footer-checkbox');

                if (index !== 0) {
                    $(checkbox).css({
                        opacity: '0',
                        visibility: 'hidden',
                        position: 'absolute',
                    });
                } else {
                    $(checkbox).css({
                        opacity: '1',
                        visibility: 'visible',
                    });
                }
                $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                const total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                const mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                const step_width = move_distance;
                move_distance = move_distance * index_temp;

                $current = index + 1;

                if (
                    $current == 1 ||
                    (mobile_device == true && index % 2 == 0)
                ) {
                    move_distance -= 8;
                } else if (
                    $current == total_steps ||
                    (mobile_device == true && index % 2 == 1)
                ) {
                    move_distance += 8;
                }

                if (mobile_device) {
                    const x: any = index / 2;
                    vertical_level = parseInt(x);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    transform:
                        'translate3d(' +
                        move_distance +
                        'px, ' +
                        vertical_level +
                        'px, 0)',
                    transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)',
                });
            },
        });

        // Prepare the preview for profile picture
        $('#wizard-picture').change(function() {
            const input = $(this);

            if (input[0].files && input[0].files[0]) {
                const reader = new FileReader();

                reader.onload = function(e: any) {
                    $('#wizardPicturePreview')
                        .attr('src', e.target.result)
                        .fadeIn('slow');
                };
                reader.readAsDataURL(input[0].files[0]);
            }
        });

        $('[data-toggle="wizard-radio"]').click(function() {
            const wizard = $(this).closest('.card-wizard');
            wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
            $(this).addClass('active');
            $(wizard)
                .find('[type="radio"]')
                .removeAttr('checked');
            $(this)
                .find('[type="radio"]')
                .attr('checked', 'true');
        });

        $('[data-toggle="wizard-checkbox"]').click(function() {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this)
                    .find('[type="checkbox"]')
                    .removeAttr('checked');
            } else {
                $(this).addClass('active');
                $(this)
                    .find('[type="checkbox"]')
                    .attr('checked', 'true');
            }
        });

        $('.set-full-height').css('height', 'auto');
    }

    setScrollableHeight() {
        // setting search result div height
        let wizardHeight = 0;
        const oneRemInPx = 16;
        const totalRemVal = 4;

        if (this.wizardContainer) {
            wizardHeight = this.wizardContainer.nativeElement.clientHeight;
        }

        this.sideScrollHeight = wizardHeight - oneRemInPx * totalRemVal;
    }

    ngOnChanges(changes: SimpleChanges) {
        const input = $(this);

        if (input[0].files && input[0].files[0]) {
            const reader: any = new FileReader();

            reader.onload = function(e: any) {
                $('#wizardPicturePreview')
                    .attr('src', e.target.result)
                    .fadeIn('slow');
            };
            reader.readAsDataURL(input[0].files[0]);
        }
    }

    addOwners(event) {
        this.owners = event;
    }

    removeOwners(owner) {
        const index = this.owners.indexOf(owner);
        if (index >= 0) {
            this.owners.splice(index, 1);
        }

        if (this.solution['id']) {
            this.apollo
                .mutate<any>({
                    mutation: gql`
                        mutation DeleteMutation(
                            $where: solution_owners_bool_exp!
                        ) {
                            delete_solution_owners(where: $where) {
                                affected_rows
                                returning {
                                    user_id
                                }
                            }
                        }
                    `,
                    variables: {
                        where: {
                            user_id: {
                                _eq: owner.id,
                            },
                            solution_id: {
                                _eq: this.solution['id'],
                            },
                        },
                    },
                })
                .pipe(take(1))
                .subscribe(
                    ({ data }) => {
                        return;
                    },
                    error => {
                        console.error('Could not delete due to ' + error);
                    }
                );
        }
    }

    publishSolution(solution) {
        if (
            (!this.is_edit &&
                (solution.image_urls.length ||
                    solution.video_urls.length ||
                    solution.embed_urls.length)) ||
            (this.is_edit &&
                solution.is_draft &&
                (solution.image_urls.length ||
                    solution.video_urls.length ||
                    solution.embed_urls.length))
        ) {
            // swal({
            //     title: 'Are you sure you want to publish the solution?',
            //     type: 'warning',
            //     showCancelButton: true,
            //     confirmButtonClass: 'btn btn-success',
            //     cancelButtonClass: 'btn btn-warning',
            //     confirmButtonText: 'Yes',
            //     buttonsStyling: false,
            // }).then(result => {
            //     if (result.value) {
            //         this.solution['created_at'] = new Date();
            //         this.showSuccessSwal('Solution Added');
            //         this.solution.is_draft = false;
            //         this.submitSolutionToDB();
            //     }
            // });
        } else if (
            (!this.is_edit &&
                !solution.image_urls.length &&
                !solution.video_urls.length &&
                !solution.embed_urls.length) ||
            (this.is_edit &&
                solution.is_draft &&
                !solution.image_urls.length &&
                !solution.video_urls.length &&
                !solution.embed_urls.length)
        ) {
            // swal({
            //     title:
            //         'Are you sure you want to publish the solution without adding media content?',
            //     type: 'warning',
            //     showCancelButton: true,
            //     confirmButtonClass: 'btn btn-success',
            //     cancelButtonClass: 'btn btn-warning',
            //     confirmButtonText: 'Yes',
            //     buttonsStyling: false,
            // }).then(result => {
            //     if (result.value) {
            //         solution.created_at = new Date();
            //         this.showSuccessSwal('Solution Added');
            //         solution.is_draft = false;
            //         this.submitSolutionToDB();
            //     }
            // });
        } else {
            this.showSuccessSwal('Solution Updated');

            solution.is_draft = false;
            this.submitSolutionToDB();
        }
    }

    deleteSolution(id) {
        return this.apollo.mutate<any>({
            mutation: gql`
                mutation updateMutation(
                    $where: solutions_bool_exp!
                    $set: solutions_set_input!
                ) {
                    update_solutions(where: $where, _set: $set) {
                        affected_rows
                        returning {
                            id
                        }
                    }
                }
            `,
            variables: {
                where: {
                    id: {
                        _eq: id,
                    },
                },
                set: {
                    is_deleted: true,
                },
            },
        });
    }

    delete() {
        // swal({
        //     title: 'Are you sure you want to delete this draft?',
        //     type: 'warning',
        //     showCancelButton: true,
        //     confirmButtonClass: 'btn btn-success',
        //     cancelButtonClass: 'btn btn-danger',
        //     confirmButtonText: 'Yes, delete it!',
        //     buttonsStyling: false,
        // }).then(result => {
        //     if (result.value) {
        //         this.deleteSolution(this.solution['id']).subscribe(
        //             ({ data }) => {
        //                 swal({
        //                     title: 'Deleted!',
        //                     type: 'success',
        //                     confirmButtonClass: 'btn btn-success',
        //                     buttonsStyling: false,
        //                 });
        //                 window.history.back();
        //             },
        //             error => {
        //                 console.error(JSON.stringify(error));
        //             }
        //         );
        //     }
        // });
    }

    linkSolutionToProblem() {
        const upsert_solutions_problems = gql`
            mutation upsert_problems_solutions(
                $problems_solutions: [problems_solutions_insert_input!]!
            ) {
                insert_problems_solutions(
                    objects: $problems_solutions
                    on_conflict: {
                        constraint: problems_solutions_pkey
                        update_columns: []
                    }
                ) {
                    affected_rows
                    returning {
                        problem_id
                    }
                }
            }
        `;
        const solution_problem_object = {
            solution_id: this.solution['id'],
            problem_id: this.problemId,
        };

        return this.apollo.mutate({
            mutation: upsert_solutions_problems,
            variables: {
                problems_solutions: [solution_problem_object],
            },
        });
    }

    autoSave() {
        if (this.solution.is_draft) {
            if (this.solution.title) {
                this.submitSolutionToDB();
            }
        }
    }
    removeDuplicates(array) {
        return Array.from(new Set(array));
    }

    submitSolutionToDB() {
        const upsert_solution = gql`
            mutation upsert_solutions($solutions: [solutions_insert_input!]!) {
                insert_solutions(
                    objects: $solutions
                    on_conflict: {
                        constraint: solutions_pkey
                        update_columns: [
                            title
                            description
                            technology
                            resources
                            website_url
                            impact
                            extent
                            beneficiary_attributes
                            timeline
                            pilots
                            deployment
                            budget_title
                            min_budget
                            max_budget
                            is_draft
                            image_urls
                            video_urls
                            featured_url
                            featured_type
                            embed_urls
                            created_at
                            attachments
                        ]
                    }
                ) {
                    affected_rows
                    returning {
                        id
                        is_draft
                    }
                }
            }
        `;

        this.sectors = this.removeDuplicates(this.sectors);

        this.apollo
            .mutate({
                mutation: upsert_solution,
                variables: {
                    solutions: [this.solution],
                },
            })
            .pipe(take(1))
            .subscribe(
                result => {
                    if (result.data['insert_solutions'].returning.length > 0) {
                        const updatedSolutionData =
                            result.data['insert_solutions'].returning[0];
                        this.solution['id'] =
                            result.data['insert_solutions'].returning[0].id;

                        this.saveProblemsInDB(
                            this.solution['id'],
                            this.selectedProblemsData
                        );
                        this.saveOwnersInDB(this.solution['id'], this.owners);
                        this.saveSectorsInDB();

                        if (this.is_edit && !this.solution.is_draft) {
                            this.router.navigate(
                                ['solutions', this.solution['id']],
                                {
                                    queryParamsHandling: 'preserve',
                                }
                            );
                        } else if (!this.is_edit && !this.solution.is_draft) {
                            this.showSuccessSwal('Solution Added');
                            this.router.navigate(
                                ['solutions', this.solution['id']],
                                {
                                    queryParamsHandling: 'preserve',
                                }
                            );
                        } else if (
                            this.is_edit &&
                            !updatedSolutionData.is_draft
                        ) {
                            this.showSuccessSwal('Solution Added');
                            this.router.navigate(
                                ['solutions', this.solution['id']],
                                {
                                    queryParamsHandling: 'preserve',
                                }
                            );
                        }
                    }
                },
                err => {
                    console.error(JSON.stringify(err));
                }
            );
    }

    saveSectorsInDB() {
        const tags = [];

        const solution_tags = new Set();

        this.sectors.map(sector => {
            tags.push({ name: sector });

            if (
                this.tagService.allTags[sector] &&
                this.tagService.allTags[sector].id
            ) {
                solution_tags.add({
                    tag_id: this.tagService.allTags[sector].id,
                    solution_id: this.solution['id'],
                });
            }
        });

        this.tagService.addTagsInDb(tags, 'solutions', this.solution['id']);

        if (solution_tags.size > 0) {
            const upsert_solution_tags = gql`
                mutation upsert_solutions_tags(
                    $solutions_tags: [solutions_tags_insert_input!]!
                ) {
                    insert_solutions_tags(
                        objects: $solutions_tags
                        on_conflict: {
                            constraint: solutions_tags_pkey
                            update_columns: [tag_id, solution_id]
                        }
                    ) {
                        affected_rows
                        returning {
                            tag_id
                            solution_id
                        }
                    }
                }
            `;
            this.apollo
                .mutate({
                    mutation: upsert_solution_tags,
                    variables: {
                        solutions_tags: Array.from(solution_tags),
                    },
                })
                .pipe(take(1))
                .subscribe(
                    data => {},
                    err => {
                        console.error('Error uploading tags', err);
                    }
                );
        }
    }

    ngAfterViewInit() {
        $(window).resize(() => {
            $('.card-wizard').each(function() {
                const $wizard = $(this);
                const index = $wizard.bootstrapWizard('currentIndex');
                const $total = $wizard.find('.nav li').length;
                let $li_width = 100 / $total;

                const total_steps = $wizard.find('.nav li').length;
                let move_distance = $wizard.width() / total_steps;
                let index_temp = index;
                let vertical_level = 0;

                const mobile_device = $(document).width() < 600 && $total > 3;

                if (mobile_device) {
                    move_distance = $wizard.width() / 2;
                    index_temp = index % 2;
                    $li_width = 50;
                }

                $wizard.find('.nav li').css('width', $li_width + '%');

                const step_width = move_distance;
                move_distance = move_distance * index_temp;

                const $current = index + 1;

                if (
                    $current == 1 ||
                    (mobile_device == true && index % 2 == 0)
                ) {
                    move_distance -= 8;
                } else if (
                    $current == total_steps ||
                    (mobile_device == true && index % 2 == 1)
                ) {
                    move_distance += 8;
                }

                if (mobile_device) {
                    const x: any = index / 2;
                    vertical_level = parseInt(x);
                    vertical_level = vertical_level * 38;
                }

                $wizard.find('.moving-tab').css('width', step_width);
                $('.moving-tab').css({
                    transform:
                        'translate3d(' +
                        move_distance +
                        'px, ' +
                        vertical_level +
                        'px, 0)',
                    transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)',
                });

                $('.moving-tab').css({
                    transition: 'transform 0s',
                });
            });
        });

        // setting focus to the page heading
        if (this.pageHeading) {
            // this.focusMonitor.focusVia(this.pageHeading, 'program');
        }

        this.setScrollableHeight();
    }

    removeSelectedItem(type: string, index: number) {
        let fileName;
        switch (type) {
            case 'image':
                if (
                    this.solution.image_urls[index].fileEndpoint ===
                    this.solution.featured_url
                ) {
                    this.solution.featured_url = '';
                    this.solution.featured_type = '';
                }
                fileName = this.solution.image_urls[index].fileEndpoint.split(
                    '/'
                )[1];
                this.solution.image_urls.splice(index, 1);

                this.filesService.deleteFile(fileName).subscribe(
                    result => console.log(result),
                    error => {
                        console.error(error);
                    }
                );

                this.setDefaultFeaturedImage();
                break;

            case 'video':
                if (
                    this.solution.video_urls[index].fileEndpoint ===
                    this.solution.featured_url
                ) {
                    this.solution.featured_url = '';
                    this.solution.featured_type = '';
                }
                fileName = this.solution.video_urls[index].fileEndpoint.split(
                    '/'
                )[1];
                this.solution.video_urls.splice(index, 1);

                this.filesService.deleteFile(fileName).subscribe(
                    result => console.log(result),
                    error => {
                        console.error(error);
                    }
                );
                break;

            case 'embed':
                if (
                    this.solution.embed_urls[index] ===
                    this.solution.featured_url
                ) {
                    this.solution.featured_url = '';
                    this.solution.featured_type = '';
                }
                this.solution.embed_urls.splice(index, 1);

                break;

            case 'link':
                fileName = this.solution.attachments[index].fileEndpoint.split(
                    '/'
                )[1];
                this.solution.attachments.splice(index, 1);

                this.filesService.deleteFile(fileName).subscribe(
                    result => console.log(result),
                    error => {
                        console.error(error);
                    }
                );
                break;

            default:
                console.log('remove item default case');
                break;
        }
    }

    setDefaultFeaturedImage() {
        if (!this.solution.featured_url && this.solution.image_urls.length) {
            this.solution.featured_url = this.solution.image_urls[0].url;
            this.solution.featured_type = 'image';
        }
    }

    checkIfExist(data: string) {
        const problem_attachments = [
            ...this.solution['image_urls'],
            ...this.solution['video_urls'],
            ...this.solution['attachments'],
        ];

        const checked = problem_attachments.filter(attachmentObj => {
            return attachmentObj.key === data;
        });

        if (checked.length > 0) {
            return true;
        } else if (this.solution.embed_urls.includes(data)) {
            return true;
        } else {
            return false;
        }
    }

    onFileSelected(event) {
        for (let i = 0; i < event.target.files.length; i++) {
            const file = event.target.files[i];
            const type = event.target.files[i].type.split('/')[0];
            const mimeType = event.target.files[i].type;
            const size = file.size;

            if (size > 5e6) {
                alert('File size exceeds the 5MB limit');
                return;
            }

            switch (type) {
                case 'image': {
                    if (typeof FileReader !== 'undefined') {
                        const reader = new FileReader();

                        reader.onload = (e: any) => {
                            const img_id = file.name;
                            this.filesService
                                .fileUpload(file, mimeType)
                                .then(values => {
                                    this.solution.image_urls.push({
                                        fileEndpoint: values['fileEndpoint'],
                                        mimeType: event.target.files[i].type,
                                        key: values['key'],
                                    });
                                    if (!this.solution.featured_url) {
                                        this.solution.featured_url = this.solution.image_urls[0].fileEndpoint;
                                        this.solution.featured_type = 'image';
                                    }
                                })
                                .catch(e => console.error('Err:: ', e));
                        };
                        reader.readAsArrayBuffer(file);
                    }
                    break;
                }
                case 'video': {
                    const video = event.target.files[i];
                    this.filesService
                        .fileUpload(video, mimeType)

                        .then(values => {
                            this.solution.video_urls.push({
                                fileEndpoint: values['fileEndpoint'],
                                mimeType: event.target.files[i].type,
                                key: values['key'],
                            });
                        })
                        .catch(e => console.error('Err:: ', e));
                    break;
                }
                case 'application':
                case 'text': {
                    const doc = event.target.files[i];
                    this.filesService
                        .fileUpload(doc, mimeType)

                        .then(values => {
                            this.solution.attachments.push({
                                fileEndpoint: values['fileEndpoint'],
                                mimeType: event.target.files[i].type,
                                key: values['key'],
                            });
                        })
                        .catch(e => console.error('Err:: ', e));
                    break;
                }
                default: {
                    console.log('unknown file type');
                    alert('Unknown file type.');
                    break;
                }
            }
        }
    }

    nextSelected() {
        window.scroll(0, 0);
        // this.focusMonitor.focusVia(this.mediaLink, 'program');
    }

    clickPreviousBtn() {
        const isBtnDisabled = this.nextBtn.nativeElement['disabled'];
        // if (isBtnDisabled) {
        //     this.focusMonitor.focusVia(this.textLink, 'program');
        // } else {
        //     this.focusMonitor.focusVia(this.nextBtn, 'program');
        // }
    }

    isComplete() {
        return (
            this.solution.title &&
            this.solution.description &&
            this.solution.impact &&
            this.solution.deployment &&
            this.solution.budget_title &&
            this.solution.min_budget >= 0 &&
            this.solution.max_budget &&
            Object.values(this.selectedProblems).length
        );
    }
    setFeatured(type, index) {
        if (type === 'image') {
            this.solution.featured_type = 'image';
            this.solution.featured_url = this.solution.image_urls[
                index
            ].fileEndpoint;
        } else if (type === 'video') {
            this.solution.featured_type = 'video';
            this.solution.featured_url = this.solution.video_urls[
                index
            ].fileEndpoint;
        } else if (type === 'embed') {
            this.solution.featured_type = 'embed';
            this.solution.featured_url = this.solution.embed_urls[index];
        }
    }

    addMediaUrl() {
        const duplicate = this.checkIfExist(this.media_url);

        if (this.media_url && !duplicate) {
            this.solution.embed_urls.push(this.media_url);
            this.media_url = '';
            if (!this.solution.featured_url) {
                this.solution.featured_url = this.media_url;
                this.solution.featured_type = 'embed';
            }
        }
        if (duplicate) {
            alert('Link already exist.');
        }
    }

    checkMedialUrl(url: string) {
        if (!url.startsWith('http')) {
            return false;
        }

        if (url.match(re)) {
            return true;
        } else {
            return false;
        }
    }

    ngOnDestroy() {
        clearInterval(this.autosaveInterval);
    }
}
