// IMPORTANT: this is a plugin which requires jQuery for initialisation and data manipulation

import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  OnChanges,
  OnDestroy,
  AfterViewInit,
  SimpleChanges
} from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroupDirective,
  NgForm,
  Validators,
  FormGroup
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
// import { ErrorStateMatcher } from '@angular/material/core';
// import { COMMA, ENTER } from '@angular/cdk/keycodes';
// import {
//   MatAutocompleteSelectedEvent,
//   MatChipInputEvent,
//   MatAutocomplete
// } from '@angular/material';
import { Apollo } from 'apollo-angular';
// import {
//   LiveAnnouncer,
//   FocusMonitor,
//   AriaLivePoliteness
// } from '@angular/cdk/a11y';
import gql from 'graphql-tag';
// import swal from 'sweetalert2';

import { TagsService } from '../../services/tags.service';
import { FilesService } from '../../services/files.service';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { first, take } from 'rxjs/operators';
import { ProblemService } from '../../services/problem.service';
import { GeocoderService } from '../../services/geocoder.service';
import { HttpClient } from '@angular/common/http';
import { FilterService } from '../../services/filter.service';

declare var H: any;
declare const $: any;
interface FileReaderEventTarget extends EventTarget {
  result: string;
}

let canProceed: boolean;

interface FileReaderEvent extends Event {
  target: EventTarget;
  getMessage(): string;
}
export interface Sector {
  name: string;
  id: number;
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
  selector: 'app-wizard-cmp',
  templateUrl: 'wizard.component.html',
  styleUrls: ['wizard.component.css']
})
export class WizardComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  objectValues = Object['values'];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  owners: any[] = [];
  // readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  is_edit = false;
  media_url = '';

  voted_by = [];
  watched_by = [];
  problemLocations: any[] = [];
  problem = {
    title: '',
    description: '',
    organization: '',
    impact: '',
    extent: '',
    min_population: 0,
    max_population: 0,
    beneficiary_attributes: '',
    resources_needed: '',
    image_urls: [],
    video_urls: [],
    featured_url: '',
    embed_urls: [],
    featured_type: '',
    organization_id: 1,

    user_id: Number(this.auth.currentUserValue.id),
    is_draft: true,

    attachments: []
  };
  searchResults: any = [];
  sectorCtrl = new FormControl();
  filteredSectors: Observable<string[]>;
  sectors: any = [];
  // matcher = new MyErrorStateMatcher();

  tags = [];
  autosaveInterval: any;
  type: FormGroup;
  sizes = [
    { value: 100, viewValue: '>100' },
    { value: 1000, viewValue: '>1000' },
    { value: 10000, viewValue: '>10000' },
    { value: 100000, viewValue: '>100,000' }
  ];
  file_types = [
    'application/msword',
    ' application/vnd.ms-excel',
    ' application/vnd.ms-powerpoint',
    'text/plain',
    ' application/pdf',
    ' image/*',
    'video/*'
  ];
  goToTitle = false;
  wizardHeight;
  headingHeight = 0;

  @ViewChild('sectorInput',{static:false}) sectorInput: ElementRef<HTMLInputElement>;
  // @ViewChild('auto',{static:false}) matAutocomplete: MatAutocomplete;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private filesService: FilesService,
    private apollo: Apollo,
    private tagService: TagsService,
    private usersService: UsersService,
    private auth: AuthService,
    private problemService: ProblemService,
    private geoService: GeocoderService,
    private http: HttpClient,
    private filterService: FilterService,
    // private liveAnouncer: LiveAnnouncer,
    private elementRef: ElementRef,
    // private focusMonitor: FocusMonitor
  ) {
    canProceed = true;

    this.problem.organization = 'Social Alpha';
    this.filteredSectors = this.sectorCtrl.valueChanges.pipe(
      startWith(null),
      map((sector: string | null) =>
        sector
          ? this._filter(sector)
          : Object.keys(this.tagService.allTags).slice()
      )
    );
  }

  // add(event: MatChipInputEvent): void {
  //   // Add sector only when MatAutocomplete is not open
  //   // To make sure this does not conflict with OptionSelected Event
  //   if (!this.matAutocomplete.isOpen) {
  //     const input = event.input;
  //     const value = event.value;
  //     // Add our sector
  //     if ((value || '').trim()) {
  //       this.sectors.push(value.trim());
  //     }
  //     // Reset the input value
  //     if (input) {
  //       input.value = '';
  //     }
  //     this.sectorCtrl.setValue(null);
  //   }
  // }

  addTags(tags) {
    this.sectors = tags;
  }

  remove(sector: string): void {
    const index = this.sectors.indexOf(sector);
    if (index >= 0) {
      this.sectors.splice(index, 1);
    }
    if (this.tagService.allTags[sector] && this.problem['id']) {
      this.tagService.removeTagRelation(
        this.tagService.allTags[sector].id,
        this.problem['id'],
        'problems'
      );
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

    if (this.problem['id']) {
      this.apollo
        .mutate<any>({
          mutation: gql`
            mutation DeleteMutation($where: problem_owners_bool_exp!) {
              delete_problem_owners(where: $where) {
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
                _eq: owner.id
              },
              problem_id: {
                _eq: this.problem['id']
              }
            }
          }
        })
        .pipe(take(1))
        .subscribe(
          ({ data }) => {
            return;
          },
          error => {}
        );
    }
  }

  // selected(event: MatAutocompleteSelectedEvent): void {
  //   this.sectors.push(event.option.viewValue);
  //   this.sectorInput.nativeElement.value = '';
  //   this.sectorCtrl.setValue(null);
  // }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return Object.keys(this.tagService.allTags).filter(
      sector => sector.toLowerCase().indexOf(filterValue) === 0
    );
  }

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }

  displayFieldCss(form: FormGroup, field: string) {
    return {
      'has-error': this.isFieldValid(form, field),
      'has-feedback': this.isFieldValid(form, field)
    };
  }

  ngOnDestroy() {
    clearInterval(this.autosaveInterval);
  }
  ngOnInit() {
    this.tagService.getTagsFromDB(this.filterService.domain_tags_query);
    this.geoService.getLocationsFromDB();

    clearInterval(this.autosaveInterval);
    this.autosaveInterval = setInterval(() => {
      this.autoSave();
    }, 10000);
    this.route.params.pipe(first()).subscribe(params => {
      if (params.id) {
        this.apollo
          .watchQuery<any>({
            query: gql`
                        {
                            problems(where: { id: { _eq: ${params.id} } }) {
                            id
                            title
                            user_id
                            updated_at
                            description
                            resources_needed
                            is_draft
                            image_urls
                            video_urls
                            attachments
                            impact
                            extent
                            min_population
                            embed_urls
                            max_population
                            beneficiary_attributes
                            organization
                            featured_url
                            featured_type
                            problem_owners(where: { user_id: { _neq: ${this.auth.currentUserValue.id} } }){
                              user{
                                id
                                name

                              }
                            }
                            problems_tags{
                                tag {
                                    id
                                    name
                                }
                            }

                            problem_locations{
                              location{
                                id
                                location_name
                                location
                                lat
                                long
                              }
                            }
                            }
                        }
                        `
          })
          .valueChanges.pipe(take(1))
          .subscribe(result => {
            if (
              result.data.problems.length >= 1 &&
              result.data.problems[0].id
            ) {
              canProceed = true;
              this.problem['id'] = result.data.problems[0].id;
              Object.keys(this.problem).map(key => {
                if (result.data.problems[0][key]) {
                  this.problem[key] = result.data.problems[0][key];
                }
                this.problem.is_draft = result.data.problems[0].is_draft;
              });
              if (this.problem.title && this.problem.is_draft) {
                this.smartSearch();
              }
              if (result.data.problems[0].problems_tags) {
                this.sectors = result.data.problems[0].problems_tags.map(
                  tagArray => {
                    return tagArray.tag.name;
                  }
                );
              }
              if (result.data.problems[0].problem_locations) {
                this.problemLocations = result.data.problems[0].problem_locations.map(
                  locations => {
                    delete locations.location.__typename;

                    return locations.location;
                  }
                );
              }

              if (result.data.problems[0].problem_owners) {
                result.data.problems[0].problem_owners.forEach(ownerArray => {
                  this.owners.push(ownerArray.user);
                });
              }

              this.is_edit = true;
            } else {
              this.router.navigate(['problems/add'], {
                queryParamsHandling: 'preserve'
              });
            }
          });
      }
    });
    this.tagService.getTagsFromDB(this.filterService.domain_tags_query);
    this.usersService.getOrgsFromDB();
    this.type = this.formBuilder.group({
      // To add a validator, we must first convert the string value into an array.
      // The first tag in the array is the default value if any,
      // then the next tag in the array is the validator.
      // Here we are adding a required validator meaning that the firstName attribute must have a value in it.
      title: [null, Validators.required],
      description: [null, Validators.required],
      location: [null, Validators.required],
      population: [null, Validators.required],
      organization: [null, Validators.required],
      impact: [null, null],
      extent: [null, null],
      beneficiary: [null, null],
      resources: [null, null],
      sectors: [null, null],
      media_url: [null, null]
    });
    // Code for the Validator
    const $validator = $('.card-wizard form').validate({
      rules: {
        title: {
          required: true,
          minlength: 3
        },
        description: {
          required: true
        },
        organization: {
          required: true
        },
        location: {
          required: true
        },
        population: {
          required: true
        }
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
      }
    });

    // Wizard Initialization
    $('.card-wizard').bootstrapWizard({
      tabClass: 'nav nav-pills',
      nextSelector: '.btn-next',
      previousSelector: '.btn-previous',

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

        if ($current === 1 || (mobile_device === true && index % 2 === 0)) {
          move_distance -= 8;
        } else if (
          $current === total_steps ||
          (mobile_device === true && index % 2 === 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          const x: any = index / 2;
          vertical_level = parseInt(x, 10);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          transform:
            'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
        });
        $('.moving-tab').css('transition', 'transform 0s');
      },

      onTabClick: function(tab: any, navigation: any, index: any) {
        return true;
        const $valid = $('.card-wizard form').valid();

        if (!$valid) {
          return false;
        } else {
          return true;
        }
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
            position: 'absolute'
          });
        } else {
          $(checkbox).css({
            opacity: '1',
            visibility: 'visible'
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

        if ($current === 1 || (mobile_device === true && index % 2 === 0)) {
          move_distance -= 8;
        } else if (
          $current === total_steps ||
          (mobile_device === true && index % 2 === 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          const x: any = index / 2;
          vertical_level = parseInt(x, 10);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          transform:
            'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
        });
      }
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

  ngOnChanges() {
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

        if ($current === 1 || (mobile_device === true && index % 2 === 0)) {
          move_distance -= 8;
        } else if (
          $current === total_steps ||
          (mobile_device === true && index % 2 === 1)
        ) {
          move_distance += 8;
        }

        if (mobile_device) {
          const x: any = index / 2;
          vertical_level = parseInt(x, 10);
          vertical_level = vertical_level * 38;
        }

        $wizard.find('.moving-tab').css('width', step_width);
        $('.moving-tab').css({
          transform:
            'translate3d(' + move_distance + 'px, ' + vertical_level + 'px, 0)',
          transition: 'all 0.5s cubic-bezier(0.29, 1.42, 0.79, 1)'
        });

        $('.moving-tab').css({
          transition: 'transform 0s'
        });
      });
    });

    this.setScrollableHeight();
  }

  setScrollableHeight() {
    // setting search result div height
    setTimeout(() => {
      if (this.searchResults.length) {
        this.headingHeight =
          this.elementRef.nativeElement.querySelector('h2#resultsList')
            .clientHeight || 0;
      } else {
        this.headingHeight = 0;
      }

      this.wizardHeight = this.elementRef.nativeElement.querySelector(
        'div.card.card-wizard'
      ).clientHeight;

      this.wizardHeight -= this.headingHeight;
    }, 10);
  }

  smartSearch() {
    let searchKey = this.problem.title + ' ' + this.problem.description;
    searchKey = searchKey.replace(/[^a-zA-Z ]/g, '');

    if (searchKey.length >= 3) {
      this.searchResults = [];

      this.http
        .post(
          'https://elasticsearch-microservice.dev.jaagalabs.com/search_problems',
          { keyword: searchKey, filter: this.filterService.sector_filter_query }
        )
        .subscribe(
          searchResults => {
            this.searchResults = searchResults;

            // this.announcement(
            //   `Found ${this.searchResults.length} similar problems.`
            // );

            this.setScrollableHeight();
          },
          error => {}
        );
    } else {
      this.searchResults = [];
    }
  }

  // announcement(message: string, politeness?: AriaLivePoliteness) {
  //   this.liveAnouncer
  //     .announce(message, politeness)
  //     .then(x => x)
  //     .catch(e => console.error(e));
  // }

  isComplete() {
    return (
      this.problem.title &&
      this.problem.description &&
      this.problem.organization
    );
  }
  updateProblem(updatedProblem) {
    this.problem = updatedProblem;
  }
  removeDuplicates(array) {
    return Array.from(new Set(array));
  }

  scrollUp(event) {
    window.scroll(0, 0);
  }

  autoSave() {
    if (this.problem.is_draft) {
      if (this.problem.title) {
        this.submitProblemToDB(this.problem);
      }
    }
  }

  showSuccessSwal(title) {
    // swal({
    //   type: 'success',
    //   title: title,
    //   timer: 3000,
    //   showConfirmButton: false
    // }).catch(swal.noop);
  }

  publishProblem(problem) {
    clearInterval(this.autosaveInterval);

    if (
      (!this.is_edit &&
        (problem.image_urls.length ||
          problem.video_urls.length ||
          problem.embed_urls.length)) ||
      (this.is_edit &&
        problem.is_draft &&
        (problem.image_urls.length ||
          problem.video_urls.length ||
          problem.embed_urls.length))
    ) {
      // swal({
      //   title: 'Are you sure you want to publish the problem?',

      //   type: 'warning',
      //   showCancelButton: true,
      //   confirmButtonClass: 'btn btn-success',
      //   cancelButtonClass: 'btn btn-warning',
      //   confirmButtonText: 'Yes',
      //   buttonsStyling: false
      // }).then(result => {
      //   if (result.value) {
      //     problem.created_at = new Date();
      //     this.showSuccessSwal('Problem Added');

      //     problem.is_draft = false;
      //     this.submitProblemToDB(problem);
      //   }
      // });
    } else if (
      (!this.is_edit &&
        !problem.image_urls.length &&
        !problem.video_urls.length &&
        !problem.embed_urls.length) ||
      (this.is_edit &&
        problem.is_draft &&
        !problem.image_urls.length &&
        !problem.video_urls.length &&
        !problem.embed_urls.length)
    ) {
      // swal({
      //   title:
      //     'Are you sure you want to publish the problem without adding media content?',

      //   type: 'warning',
      //   showCancelButton: true,
      //   confirmButtonClass: 'btn btn-success',
      //   cancelButtonClass: 'btn btn-warning',
      //   confirmButtonText: 'Yes',
      //   buttonsStyling: false
      // }).then(result => {
      //   if (result.value) {
      //     problem.created_at = new Date();
      //     this.showSuccessSwal('Problem Added');

      //     problem.is_draft = false;
      //     this.submitProblemToDB(problem);
      //   }
      // });
    } else {
      this.showSuccessSwal('Problem Updated');

      problem.is_draft = false;
      this.submitProblemToDB(problem);
    }
  }

  deleteDraft(id) {
    // swal({
    //   title: 'Are you sure you want to delete this draft?',

    //   type: 'warning',
    //   showCancelButton: true,
    //   confirmButtonClass: 'btn btn-success',
    //   cancelButtonClass: 'btn btn-danger',
    //   confirmButtonText: 'Yes, delete it!',
    //   buttonsStyling: false
    // }).then(result => {
    //   if (result.value) {
    //     this.problemService.deleteProblem(id).subscribe(
    //       ({ data }) => {
    //         swal({
    //           title: 'Deleted!',

    //           type: 'success',
    //           confirmButtonClass: 'btn btn-success',
    //           buttonsStyling: false
    //         });
    //         window.history.back();
    //       },
    //       error => {
    //         console.error(JSON.stringify(error));
    //       }
    //     );
    //   }
    // });
  }

  submitProblemToDB(problem) {
    const upsert_problem = gql`
      mutation upsert_problem($problems: [problems_insert_input!]!) {
        insert_problems(
          objects: $problems
          on_conflict: {
            constraint: problems_pkey
            update_columns: [
              title
              description
              resources_needed
              organization
              impact
              extent
              beneficiary_attributes
              image_urls
              video_urls
              min_population
              max_population
              edited_at
              featured_url
              featured_type
              embed_urls
              is_draft
              attachments
              created_at
            ]
          }
        ) {
          affected_rows
          returning {
            id
          }
        }
      }
    `;

    this.sectors = this.removeDuplicates(this.sectors);

    this.apollo
      .mutate({
        mutation: upsert_problem,
        variables: {
          problems: [problem]
        }
      })
      .pipe(take(1))
      .subscribe(
        result => {
          if (result.data['insert_problems'].returning.length > 0) {
            this.problem['id'] = result.data['insert_problems'].returning[0].id;
            const upsert_tags = gql`
              mutation upsert_tags($tags: [tags_insert_input!]!) {
                insert_tags(
                  objects: $tags
                  on_conflict: { constraint: tags_pkey, update_columns: [name] }
                ) {
                  affected_rows
                  returning {
                    id
                    name
                  }
                }
              }
            `;

            this.saveOwnersInDB(this.problem['id'], this.owners);

            const tags = [];

            const problems_tags = new Set();
            const problem_locations = new Set();

            this.sectors.map(sector => {
              tags.push({ name: sector });

              if (
                this.tagService.allTags[sector] &&
                this.tagService.allTags[sector].id
              ) {
                problems_tags.add({
                  tag_id: this.tagService.allTags[sector].id,
                  problem_id: this.problem['id']
                });
              }
            });

            this.tagService.addTagsInDb(tags, 'problems', this.problem['id']);

            this.problemLocations.map(location => {
              if (
                this.geoService.allLocations[location.location_name] &&
                this.geoService.allLocations[location.location_name].id
              ) {
                problem_locations.add({
                  location_id: this.geoService.allLocations[
                    location.location_name
                  ].id,
                  problem_id: this.problem['id']
                });
              }
            });

            if (problem_locations.size > 0) {
              this.geoService.addRelationToLocations(
                this.problem['id'],
                problem_locations,
                'problems'
              );
            }

            if (this.problemLocations) {
              this.geoService.addLocationsInDB(
                this.problemLocations,
                'problems',
                this.problem['id']
              );
            }

            if (problems_tags.size > 0) {
              const upsert_problems_tags = gql`
                mutation upsert_problems_tags(
                  $problems_tags: [problems_tags_insert_input!]!
                ) {
                  insert_problems_tags(
                    objects: $problems_tags
                    on_conflict: {
                      constraint: problems_tags_pkey
                      update_columns: [tag_id, problem_id]
                    }
                  ) {
                    affected_rows
                    returning {
                      tag_id
                      problem_id
                    }
                  }
                }
              `;
              this.apollo
                .mutate({
                  mutation: upsert_problems_tags,
                  variables: {
                    problems_tags: Array.from(problems_tags)
                  }
                })
                .pipe(take(1))
                .subscribe(
                  data => {
                    if (!this.problem.is_draft) {
                      this.confirmSubmission();
                    }
                  },
                  err => {
                    console.error('Error uploading tags', err);
                    console.error(JSON.stringify(err));
                    if (!this.problem.is_draft) {
                      this.confirmSubmission();
                    }
                  }
                );
            } else {
              if (!this.problem.is_draft) {
                this.confirmSubmission();
              }
            }
          }
        },
        err => {
          console.error(JSON.stringify(err));
          // swal({
          //   title: 'Error',
          //   text: 'Try Again',
          //   type: 'error',
          //   confirmButtonClass: 'btn btn-info',
          //   buttonsStyling: false
          // }).catch(swal.noop);
        }
      );
  }

  saveOwnersInDB(problemId, ownersArray) {
    let owners = [];
    owners = ownersArray.map(owner => {
      return {
        user_id: owner.id,
        problem_id: problemId
      };
    });
    const upsert_problem_owners = gql`
      mutation upsert_problem_owners(
        $problem_owners: [problem_owners_insert_input!]!
      ) {
        insert_problem_owners(
          objects: $problem_owners
          on_conflict: { constraint: problem_owners_pkey, update_columns: [] }
        ) {
          affected_rows
          returning {
            user_id
            problem_id
          }
        }
      }
    `;

    this.apollo
      .mutate({
        mutation: upsert_problem_owners,
        variables: {
          problem_owners: owners
        }
      })
      .pipe(take(1))
      .subscribe(
        data => {},
        error => {
          console.error(JSON.stringify(error));
        }
      );
  }

  confirmSubmission() {
    this.router.navigate(['problems', this.problem['id']], {
      queryParamsHandling: 'preserve'
    });
  }

  deleteProblem() {
    if (confirm('Are you sure you want to delete this problem?')) {
      const delete_problem = gql`
                mutation delete_problem {
                    update_problems(
                    where: {sku: {_eq: ${this.problem['id']}}},
                    _set: {
                        is_deleted: true
                    }
                    ) {
                    affected_rows
                    returning {
                        id
                        is_deleted
                    }
                    }
                }
                `;
      this.apollo
        .mutate({
          mutation: delete_problem
        })
        .pipe(take(1))
        .subscribe(
          data => {
            this.router.navigate(['problems'], {
              queryParamsHandling: 'preserve'
            });
          },
          err => {
            console.error(JSON.stringify(err));
          }
        );
    }
  }
  setFeatured(type, index) {
    if (type === 'image') {
      this.problem.featured_type = 'image';
      this.problem.featured_url = this.problem.image_urls[index].url;
    }
  }

  addMediaUrl() {
    if (this.media_url) {
      this.problem.embed_urls.push(this.media_url);
      if (!this.problem.featured_url) {
        this.problem.featured_url = this.media_url;
        this.problem.featured_type = 'embed';
      }
    }
  }

  addLocation(locations) {
    this.problemLocations = locations;
  }

  removeLocation(removedLocation) {
    const locationUniqueId =
      removedLocation.lat.toString() + removedLocation.long.toString();

    this.problemLocations = this.problemLocations.filter(location => {
      if (location.location_name !== removedLocation.location_name) {
        return location;
      }
    });

    if (
      this.geoService.allLocations[removedLocation.location_name] &&
      this.problem['id']
    ) {
      this.geoService.removeLocationRelation(
        removedLocation.id,
        this.problem['id'],
        'problems'
      );
    } else if (removedLocation.id) {
      this.geoService.removeLocationRelation(
        removedLocation.id,
        this.problem['id'],
        'problems'
      );
    }
  }

  moveFocusSearchHeading() {
    this.setFocus('h2.h2_heading');
    this.goToTitle = false;
  }

  setFocus(elemId: string): void {
    const element = this.elementRef.nativeElement.querySelector(elemId);
    // this.focusMonitor.focusVia(element, 'program');
  }

  focusBackToTitle() {
    this.goToTitle = true;
  }
}
