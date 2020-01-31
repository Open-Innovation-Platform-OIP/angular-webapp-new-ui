import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    AfterViewInit,
    ElementRef,
} from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from '../../services/auth.service';
import { FilesService } from '../../services/files.service';
// import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
    selector: 'app-view-user-profile',
    templateUrl: './view-user-profile.component.html',
    styleUrls: ['./view-user-profile.component.css'],
})
export class ViewUserProfileComponent
    implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('profileTitle', { static: false }) profileTitle: ElementRef<
        HTMLElement
    >;
    user: any;
    userData: any = {};
    userDataQuery: QueryRef<any>;

    interests: any[] = [];
    loggedInUsersProfile = false;
    objectEntries = Object.entries;
    personas: any = [];
    userId: any;
    organizationName: any;

    constructor(
        private route: ActivatedRoute,
        private apollo: Apollo,
        public auth: AuthService,
        public filesService: FilesService
    ) // private focusMonitor: FocusMonitor
    {}

    ngAfterViewInit() {
        // this.focusMonitor.focusVia(this.profileTitle, 'program');
    }

    ngOnInit() {
        this.user = this.route.paramMap.pipe(
            switchMap((params: ParamMap) => {
                return this.getProfile(params.get('id'));
            })
        );
        this.user.subscribe(
            result => {
                this.interests = [];
                this.personas = [];

                if (result.data.users[0]) {
                    this.userData = result.data.users[0];
                    Object.entries(this.userData).map(data => {
                        if (
                            (data[0] == 'is_ngo' && data[1]) ||
                            (data[0] == 'is_innovator' && data[1]) ||
                            (data[0] == 'is_entrepreneur' && data[1]) ||
                            (data[0] == 'is_expert' && data[1]) ||
                            (data[0] == 'is_incubator' && data[1]) ||
                            (data[0] == 'is_funder' && data[1]) ||
                            (data[0] == 'is_government' && data[1]) ||
                            (data[0] == 'is_beneficiary' && data[1])
                        ) {
                            this.personas.push(data[0]);
                        }
                    });

                    if (result.data.users[0].organizationByOrganizationId) {
                        this.organizationName =
                            result.data.users[0].organizationByOrganizationId.name;
                    }
                    if (result.data.users[0].users_tags) {
                        this.interests = result.data.users[0].users_tags.map(
                            tagArray => {
                                return tagArray.tag.name;
                            }
                        );
                    }

                    if (
                        this.userData.id ===
                        Number(this.auth.currentUserValue.id)
                    ) {
                        this.loggedInUsersProfile = true;
                    }
                }
            },
            error => {
                console.error(JSON.stringify(error));
            }
        );
    }

    getProfile(id) {
        this.userDataQuery = this.apollo.watchQuery<any>({
            query: gql`
          {
            users(where: { id: { _eq: ${id} } }) {
              id
              organization
              name
              qualification
              photo_url
              email
              phone_number
              is_ngo
              is_innovator
              is_entrepreneur
              is_expert
              is_incubator
              is_funder
              is_government
              is_beneficiary
              email_private
                number_private
                organization_private
                interests_private
                location_private
                persona_private
              user_locations{
                location{
                  location_name
                }

              }

              problems(where: { is_draft: { _eq: false } }){
                id
              }
              problem_collaborators{
                intent
              }
              problem_validations{
                comment
              }

              solution_validations{
                user_id
              }

              solution_collaborators {
                user_id
              }
              enrichments(where: { is_deleted: { _eq: false } }){
                id
              }
              organizationByOrganizationId{
                id
                name
              }
              users_tags{
                tag {
                    id
                    name
                }
            }
            }
        }
        `,
            fetchPolicy: 'no-cache',

            pollInterval: 1000,
        });

        return this.userDataQuery.valueChanges;
    }

    adminSelection(event, row) {}

    ngOnDestroy() {
        this.userDataQuery.stopPolling();
    }
}
