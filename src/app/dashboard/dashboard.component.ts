import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ProblemService } from '../services/problem.service';
// import { isArray } from 'util';
// import { NgxUiLoaderService } from "ngx-ui-loader";
import { UsersService } from '../services/users.service';
import { FilterService } from '../services/filter.service';
import { ActivatedRoute } from '@angular/router';
import { FilesService } from '../services/files.service';

declare const $: any;

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
    objectValues = Object['values'];
    objectKeys = Object['keys'];
    drafts = [];
    userProblems = [];
    userSolutions = [];
    contributions = {};
    solutionContributions = {};
    recommendedProblems = {};
    recommendedUsers = {};
    showLoader = true;

    problemShowMoreBtnText = 'Show More';
    problemsToShow = 6;
    yourContributionToShow = 2;
    noOfWatchlistToShow = 2;

    draftsQueryRef: QueryRef<any>;

    userProblemsQueryRef: QueryRef<any>;
    problemWatchQueryRef: QueryRef<any>;
    contributionsQueryRef: QueryRef<any>;
    userSolutionsQueryRef: QueryRef<any>;
    recommendedProblemsQueryRef: QueryRef<any>;
    recommendedUsersQueryRef: QueryRef<any>;
    draftsSub: Subscription;
    userProblemsQuerySub: Subscription;
    problemWatchQuerySub: Subscription;
    contributionsSub: Subscription;
    userSolutionsQuerySub: Subscription;
    recommendedProblemsSub: Subscription;
    recommendedUsersSub: Subscription;

    problemQueryString = `{
    id
    is_draft
    featured_url
    title
    description
    user_id
    user {
      id
      name
      photo_url
    }
    problems_tags{
      tag {
      id
      name
    }}
    problem_voters{user_id}
    problem_watchers{user_id}
    problem_validations{user_id}
    problem_locations{
      location{
        id
        location_name
        lat
        long
      }
    }
    updated_at
    edited_at
  }`;

    solutionQueryString = `{
    id
    is_draft
    featured_url
    title
    description
    user {
      id
      name
      photo_url
    }
    solutions_tags{
                tag{
                  name
                }
              }
    solution_voters{user_id}
    solution_watchers{user_id}
    solution_validations{user_id}
    updated_at
    edited_at
  }`;
    userQueryString = `{
    id
      name
      photo_url
      is_ngo
      is_innovator
      is_entrepreneur
      is_expert
      is_incubator
      is_funder
      is_government
      is_beneficiary
      organizationByOrganizationId {
        name
      }

      user_locations{
        location{
          id
          location_name
          location
          lat
          long
        }
      }

      email_private
                number_private
                organization_private
                interests_private
                location_private
                persona_private


      problems(where: { is_draft: { _eq: false } }){
        id
      }
      problem_collaborators {
        intent
      }
      problem_validations {
        comment
      }
      enrichments(where: { is_deleted: { _eq: false } }){
        id
      }
      users_tags{
        tag {
            id
            name
        }
    }
  }`;
    problemWatchList: any[] = [];
    sol_tags: any[] = [];
    yourContributionBtnText = 'Show More';
    watchlistBtnText = 'Show More';
    profileCardToShow = 2;
    profileSectionBtnText = 'Show More';

    constructor(
        private apollo: Apollo,
        private auth: AuthService,
        private problemService: ProblemService,
        // private ngxService: NgxUiLoaderService,
        private userService: UsersService,
        private filterService: FilterService,
        public filesService: FilesService,
        private activatedRoute: ActivatedRoute
    ) {
        console.log('inside dashboard component');
    }
    ngOnInit() {
        // start loader
        // this.ngxService.start();

        this.getDrafts();
        this.getUsersProblems();
        this.getContributions();
        this.getRecommendedProblems();
        this.getRecommendedUsers();
        this.getProblemWatchList();
        this.getUsersSolutions();
    }

    test(e) {
        console.log(e);
    }

    isNewUser() {
        if (
            this.drafts.length ||
            this.userProblems.length ||
            this.objectKeys(this.contributions).length ||
            this.objectKeys(this.recommendedProblems).length ||
            this.objectKeys(this.recommendedUsers).length
        ) {
            this.showLoader = false;
            // this.ngxService.stop();
            return false;
        } else {
            this.showLoader = false;
            // this.ngxService.stop();
            return true;
        }
    }

    getDrafts() {
        const draftsQuery = gql`
      {
        problems(where:{is_draft:{_eq:true},is_deleted:{_eq:false}, user_id:{_eq: ${this.auth.currentUserValue.id}},problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}} order_by: {edited_at: desc}) ${this.problemQueryString}
        ,

          solutions(where:{is_draft:{_eq:true},is_deleted:{_eq:false}, user_id:{_eq: ${this.auth.currentUserValue.id}},solutions_tags:{tag_id:{${this.filterService.sector_filter_query}}}} order_by: {edited_at: desc}) ${this.solutionQueryString}



    }
    `;
        this.draftsQueryRef = this.apollo.watchQuery({
            query: draftsQuery,
            pollInterval: 1000,
            fetchPolicy: 'network-only',
        });

        this.draftsSub = this.draftsQueryRef.valueChanges.subscribe(
            ({ data }) => {
                if (data.problems.length > 0) {
                    const problems_solutions = data.problems.concat(
                        data.solutions
                    );
                    problems_solutions.sort((a, b) => {
                        if (a.edited_at < b.edited_at) {
                            return 1;
                        }
                        if (a.edited_at > b.edited_at) {
                            return -1;
                        }
                    });

                    this.drafts = problems_solutions;

                    this.userService.dashboardDrafts = data.problems;
                    this.userService.solutionDrafts = data.solutions;
                }
            }
        );
    }

    getUsersProblems() {
        const userProblemsQuery = gql`
    {
      problems(
        where:{ _and:[
        { is_draft: {_eq: false}},
        {user_id: {_eq: ${this.auth.currentUserValue.id} }},
        {problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}
      ],

    } order_by: {updated_at: desc}) ${this.problemQueryString}
    }
    `;
        this.userProblemsQueryRef = this.apollo.watchQuery({
            query: userProblemsQuery,
            pollInterval: 1000,
            fetchPolicy: 'network-only',
        });
        this.userProblemsQuerySub = this.userProblemsQueryRef.valueChanges.subscribe(
            ({ data }) => {
                if (data.problems.length > 0) {
                    this.userProblems = data.problems;
                    this.userService.dashboardUserProblems = data.problems;
                }
            }
        );
    }

    problemShowMoreBtn(len: number) {
        if (this.problemsToShow === 6) {
            this.problemShowMoreBtnText = 'Show Less';
            this.problemsToShow = len;
        } else {
            this.problemShowMoreBtnText = 'Show More';
            this.problemsToShow = 6;
        }
    }

    resetProblemToShow() {
        this.problemsToShow = 6;
        this.problemShowMoreBtnText = 'Show More';
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

    composeTagsArr(tags) {
        return tags.map(tag => tag.tag.name);
    }

    showOrHideYourContribution(limit: number) {
        if (this.yourContributionToShow === 2) {
            this.yourContributionBtnText = 'Show Less';
            this.yourContributionToShow = limit;
        } else {
            this.yourContributionBtnText = 'Show More';
            this.yourContributionToShow = 2;
        }
    }
    showOrHideWatchlist(limit: number) {
        if (this.noOfWatchlistToShow === 2) {
            this.watchlistBtnText = 'Show Less';
            this.noOfWatchlistToShow = limit;
        } else {
            this.watchlistBtnText = 'Show More';
            this.noOfWatchlistToShow = 2;
        }
    }
    showOrHideProfileSection(limit: number) {
        if (this.profileCardToShow === 2) {
            this.profileSectionBtnText = 'Show Less';
            this.profileCardToShow = limit;
        } else {
            this.profileSectionBtnText = 'Show More';
            this.profileCardToShow = 2;
        }

        console.log(this.profileCardToShow);
    }

    getUsersSolutions() {
        const userSolutionQuery = gql`
    {
      solutions(
        where:{ _and:[
        { is_draft: {_eq: false}},
        {user_id: {_eq: ${this.auth.currentUserValue.id} }},
        {solutions_tags:{tag_id:{${this.filterService.sector_filter_query}}}}
      ]
    } order_by: {updated_at: desc}) ${this.solutionQueryString}
    }
    `;
        this.userSolutionsQueryRef = this.apollo.watchQuery({
            query: userSolutionQuery,
            pollInterval: 1000,
            fetchPolicy: 'network-only',
        });
        this.userSolutionsQuerySub = this.userSolutionsQueryRef.valueChanges.subscribe(
            ({ data }) => {
                if (data.solutions.length > 0) {
                    this.userSolutions = data.solutions;
                    this.userService.dashboardUserSolutions = data.solutions;
                }
            }
        );
    }

    getContributions() {
        const contributionsQuery = gql`
    {
      enrichments( where:{ _and: [
        { user_id: {_eq: ${this.auth.currentUserValue.id}}},
        { is_deleted: {_eq: false}},
        {problem:{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}
      ] }) {
       problem ${this.problemQueryString}
     }
     problem_validations(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},problem:{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
       problem ${this.problemQueryString}
     }
     problem_collaborators(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},problem:{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
       problem ${this.problemQueryString}
     }
     discussions(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},problem:{problems_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
       problem ${this.problemQueryString}
     }


     solution_validations(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},solution:{solutions_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
      solution ${this.solutionQueryString}
    }
    solution_collaborators(where:{user_id:{_eq: ${this.auth.currentUserValue.id}},solution:{solutions_tags:{tag_id:{${this.filterService.sector_filter_query}}}}}) {
      solution ${this.solutionQueryString}
    }

    }
    `;
        this.contributionsQueryRef = this.apollo.watchQuery({
            query: contributionsQuery,
            pollInterval: 1000,
            fetchPolicy: 'network-only',
        });
        this.contributionsSub = this.contributionsQueryRef.valueChanges.subscribe(
            ({ data }) => {
                Object.keys(data).map(key => {
                    data[key].map(p => {
                        if (p.problem || p.problemsByproblemId) {
                            const problem = p.problem || p.problemsByproblemId;

                            if (problem['id']) {
                                this.contributions[problem['id']] = problem;

                                this.userService.dashboardContributions[
                                    problem['id']
                                ] = problem;
                            }
                        } else if (p.solution) {
                            const solution = p.solution;

                            if (solution['id']) {
                                this.contributions[solution['id']] = solution;

                                this.userService.dashboardSolutionContributions[
                                    solution['id']
                                ] = solution;
                            }
                        }
                    });
                });
            },
            error => {
                console.error(JSON.stringify(error));
            }
        );
    }

    getContributionsOnSolutions() {}

    getRecommendedProblems() {
        this.activatedRoute.queryParams.subscribe(params => {
            this.filterService.filterSector(params);

            const recoProblemsQuery = gql`
    {

      users_tags(where:{ _and: [
        {user_id:{_eq:${this.auth.currentUserValue.id}}},
        { tag_id:{${this.filterService.sector_filter_query}}}
      ]}) {
        tag{
          problems_tags {
            problem ${this.problemQueryString}
          }
        }
      }
    }
    `;
            this.recommendedProblemsQueryRef = this.apollo.watchQuery({
                query: recoProblemsQuery,
                pollInterval: 1000,
                fetchPolicy: 'network-only',
            });
            this.recommendedProblemsSub = this.recommendedProblemsQueryRef.valueChanges.subscribe(
                ({ data }) => {
                    if (data.users_tags.length > 0) {
                        data.users_tags.map(tagData => {
                            if (
                                tagData.tag &&
                                tagData.tag.problems_tags.length > 0
                            ) {
                                tagData.tag.problems_tags.map(p => {
                                    if (p && p.problem && p.problem.id) {
                                        const problem = p.problem;

                                        this.recommendedProblems[
                                            problem['id']
                                        ] = problem;
                                        this.userService.dashboardRecommendations[
                                            problem['id']
                                        ] = problem;
                                    }
                                });
                            }
                        });
                    }
                },
                error => {
                    console.error(JSON.stringify(error));
                }
            );
        });
    }

    getRecommendedUsers() {
        const recommendedUsersQuery = gql`
    {
      users_tags(where:{user_id:{_eq:${this.auth.currentUserValue.id}},user:{users_tags:{tag:{id:{${this.filterService.sector_filter_query}}}}}}) {
        tag{
          users_tags (where:{user_id:{_neq:${this.auth.currentUserValue.id}}}){
            user ${this.userQueryString}
          }
        }
      }
      users(where:{id:{_eq:${this.auth.currentUserValue.id}},users_tags:{tag:{id:{${this.filterService.sector_filter_query}}}}}) {
        organizationByOrganizationId{
          users(where:{id:{_neq:${this.auth.currentUserValue.id}}}) ${this.userQueryString}
        }
      }
    }
    `;
        this.recommendedUsersQueryRef = this.apollo.watchQuery({
            query: recommendedUsersQuery,
            pollInterval: 1000,
            fetchPolicy: 'network-only',
        });
        this.recommendedUsersSub = this.recommendedUsersQueryRef.valueChanges.subscribe(
            ({ data }) => {
                if (data.users_tags.length > 0) {
                    data.users_tags.map(users => {
                        if (users.tag && users.tag.users_tags.length > 0) {
                            users.tag.users_tags.map(u => {
                                if (u && u.user && u.user.id) {
                                    const user = u.user;
                                    this.recommendedUsers[user.id] = user;
                                }
                            });
                        }
                    });
                }
                if (data.users.length > 0) {
                    data.users.map(org => {
                        if (
                            org.organizationByOrganizationId &&
                            org.organizationByOrganizationId.users.length > 0
                        ) {
                            org.organizationByOrganizationId.users.map(user => {
                                if (user && user.id) {
                                    this.recommendedUsers[user['id']] = user;
                                    this.userService.dashboardUsers[
                                        user['id']
                                    ] = user;
                                }
                            });
                        }
                    });
                }
            },
            error => {
                console.error(JSON.stringify(error));
            }
        );
    }

    getProblemWatchList() {
        const problemWatchQuery = gql`
    {
      problem_watchers(
        where: {user_id: {_eq: ${this.auth.currentUserValue.id}}}){
          problem ${this.problemQueryString}
        }
    }
    `;

        this.problemWatchQueryRef = this.apollo.watchQuery({
            query: problemWatchQuery,
            pollInterval: 1000,
            fetchPolicy: 'network-only',
        });
        this.problemWatchQuerySub = this.problemWatchQueryRef.valueChanges.subscribe(
            ({ data }) => {
                if (data.problem_watchers.length > 0) {
                    this.problemWatchList = [...data.problem_watchers];
                }
            }
        );
    }

    ngOnDestroy() {
        this.showLoader = true;
        this.draftsQueryRef.stopPolling();
        this.contributionsQueryRef.stopPolling();
        this.recommendedProblemsQueryRef.stopPolling();
        this.recommendedUsersQueryRef.stopPolling();
        this.userSolutionsQueryRef.stopPolling();
        this.draftsSub.unsubscribe();
        this.contributionsSub.unsubscribe();
        this.recommendedProblemsSub.unsubscribe();
        this.recommendedUsersSub.unsubscribe();
        this.problemWatchQuerySub.unsubscribe();
        this.userSolutionsQuerySub.unsubscribe();
    }
}
