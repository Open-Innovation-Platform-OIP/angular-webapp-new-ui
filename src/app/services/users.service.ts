import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { AuthService } from './auth.service';
import { take } from 'rxjs/operators';

export interface User {
    id?: number;
    email?: string;
    password?: string;
    token?: string;
    name: string;
    organization: string;
    qualification: string;
    photo_url: any;
    phone_number: string;
    is_ngo: boolean;
    is_innovator: boolean;
    is_expert: boolean;
    is_government: boolean;
    is_funder: boolean;
    is_beneficiary: boolean;
    is_incubator: boolean;
    is_entrepreneur: boolean;
    notify_email: boolean;
    notify_sms: boolean;
    notify_app: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class UsersService {
    public allOrgs: any = {};
    public allUsers = {};
    public currentUser = {
        id: 0,
        email: '',
        name: '',
        photo_url: '',
        organization: '',
    };

    dashboardDrafts: any[] = [];
    solutionDrafts: any[] = [];
    dashboardUserProblems: any[] = [];
    dashboardContributions = {};
    dashboardRecommendations = {};
    dashboardUsers = {};
    dashboardUserSolutions = [];
    dashboardSolutionContributions = {};

    constructor(private apollo: Apollo, private auth: AuthService) {
        this.getOrgsFromDB();
        // this.getUsersFromDB();
        this.getCurrentUser();
    }

    public getCurrentUser() {
        if (this.auth.currentUserValue && this.auth.currentUserValue.token) {
            // console.log('getting current user');
            this.apollo
                .watchQuery<any>({
                    query: gql`
        {
          users(where: { id: { _eq: ${this.auth.currentUserValue.id} } }) {
            id
            name
            email
            photo_url
            organizationByOrganizationId {
              name
            }

          }
        }
      `,
                    fetchPolicy: 'no-cache',
                })
                .valueChanges.pipe(take(1))
                .subscribe(({ data }) => {
                    if (data.users.length > 0) {
                        Object.keys(this.currentUser).map(key => {
                            if (data.users[0][key]) {
                                this.currentUser[key] = data.users[0][key];
                            }
                        });

                        if (data.users[0].organizationByOrganizationId) {
                            this.currentUser.organization =
                                data.users[0].organizationByOrganizationId.name;
                        }
                    }
                });
        }
    }
    public getOrgsFromDB() {
        this.apollo
            .watchQuery<any>({
                query: gql`
                    query {
                        organizations {
                            id
                            name
                        }
                    }
                `,
                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(take(1))
            .subscribe(({ data }) => {
                if (data.organizations.length > 0) {
                    data.organizations.map(organization => {
                        this.allOrgs[organization.name] = organization;
                    });
                }
            });
    }

    public getUsersFromDB() {
        this.apollo
            .watchQuery<any>({
                query: gql`
                    query {
                        users {
                            is_admin
                            id
                            name
                            organizationByOrganizationId {
                                name
                            }
                        }
                    }
                `,

                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(take(1))
            .subscribe(({ data }) => {
                console.log(data);

                if (data.users.length > 0) {
                    data.users.map(user => {
                        if (user.id && user.name) {
                            this.allUsers[user.id] = {
                                id: user.id,
                                value: user.name,
                            };
                        }
                        if (user.organizationByOrganizationId) {
                            this.allUsers[user.id].organization =
                                user.organizationByOrganizationId.name;
                        }
                    });
                }
            });
    }

    submitUserToDB(userData: User) {
        return this.apollo.mutate({
            mutation: gql`
                mutation upsert_users($users: [users_insert_input!]!) {
                    insert_users(
                        objects: $users
                        on_conflict: {
                            constraint: users_pkey
                            update_columns: [
                                name
                                organization
                                qualification
                                photo_url
                                phone_number
                                is_ngo
                                is_innovator
                                is_entrepreneur
                                is_expert
                                is_incubator
                                is_funder
                                is_government
                                is_beneficiary
                                notify_email
                                notify_sms
                                notify_app
                                organization_id
                                email_private
                                number_private
                                organization_private
                                interests_private
                                location_private
                                persona_private
                            ]
                        }
                    ) {
                        affected_rows
                        returning {
                            id
                        }
                    }
                }
            `,
            variables: {
                users: [userData],
            },
        });
    }
}
