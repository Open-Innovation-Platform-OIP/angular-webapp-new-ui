import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchService } from '../services/search.service';
import { take } from 'rxjs/operators';

import { Subscription } from 'rxjs';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: [
        './landing-page.component.css',
        './landing-page.component.scss',
    ],
})
export class LandingPageComponent implements OnInit, OnDestroy {
    landingPageSearchResults = [];
    searchInput: any;
    problems: any = [];
    numberToBeShown: number;
    solutions: any[] = [];
    collaborators: any[] = [];

    solutionSubscription: Subscription;
    problemSubscription: Subscription;
    collaboratorsSubscription: Subscription;
    noOfCollaborators: number;

    constructor(
        private apollo: Apollo,
        private route: ActivatedRoute,
        private router: Router,

        private searchService: SearchService
    ) {}

    ngOnInit() {
        this.numberToBeShown = 5;
        this.getProblems();
        this.getSolutions();
        this.getTotalCollaborators();
    }

    getTotalCollaborators() {
        this.collaboratorsSubscription = this.apollo
            .watchQuery<any>({
                query: gql`
                    query PostsGetQuery {
                        problem_collaborators_aggregate {
                            aggregate {
                                count
                            }
                        }
                    }
                `,

                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(take(1))
            .subscribe(
                result => {
                    this.noOfCollaborators =
                        result.data.problem_collaborators_aggregate.aggregate.count;
                },
                error => {
                    console.error(JSON.stringify(error));
                }
            );
    }

    getProblems() {
        this.problemSubscription = this.apollo
            .watchQuery<any>({
                query: gql`
                    query PostsGetQuery {
                        problems(
                            where: { is_draft: { _eq: false } }

                            order_by: { updated_at: desc }
                        ) {
                            id
                            title
                            description

                            resources_needed
                            image_urls
                            edited_at
                            updated_at

                            featured_url
                            user {
                                id
                                name
                                photo_url
                            }
                            problems_tags {
                                tag {
                                    name
                                }
                            }

                            problem_locations {
                                location {
                                    id
                                    location_name
                                    location
                                    lat
                                    long
                                }
                            }

                            is_deleted
                            problem_voters {
                                problem_id
                                user_id
                            }
                            problem_watchers {
                                problem_id
                                user_id
                            }
                            problem_validations {
                                user_id
                                comment
                                agree
                                created_at
                                files
                                user_id
                                edited_at
                                is_deleted
                                problem_id
                            }
                            problem_collaborators {
                                user_id
                                problem_id
                                edited_at
                            }
                        }
                    }
                `,

                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(take(1))
            .subscribe(
                result => {
                    if (result.data.problems.length > 0) {
                        this.problems = [...result.data.problems];
                    }
                },
                error => {
                    console.error(JSON.stringify(error));
                }
            );
    }

    getSolutions() {
        this.solutionSubscription = this.apollo
            .watchQuery<any>({
                query: gql`
                    query PostsGetQuery {
                        solutions(
                            where: { is_draft: { _eq: false } }

                            order_by: { updated_at: desc }
                        ) {
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
                            solutions_tags {
                                tag {
                                    name
                                }
                            }
                            solution_voters {
                                user_id
                            }
                            solution_watchers {
                                user_id
                            }
                            solution_validations {
                                user_id
                            }
                            updated_at
                            edited_at
                        }
                    }
                `,

                fetchPolicy: 'network-only',
            })
            .valueChanges.pipe(take(1))
            .subscribe(
                result => {
                    if (result.data.solutions.length > 0) {
                        this.solutions = [...result.data.solutions];
                    }
                },
                error => {
                    console.error(JSON.stringify(error));
                }
            );
    }

    getNavHeight(): number {
        return document.querySelector('nav').clientHeight;
    }

    showAll() {
        // this.ngxService.start();

        // Stop the foreground loading after 5s
        setTimeout(() => {
            // this.ngxService.stop();
        }, 2000);

        this.numberToBeShown = Number.MAX_SAFE_INTEGER;
    }

    landingPageSearch(searchInput: string) {
        if (this.searchInput.length < 2) {
            this.numberToBeShown = 4;
        }
        if (searchInput.length >= 3) {
            this.numberToBeShown = 8;

            this.landingPageSearchResults = [];

            this.searchService.problemSearch(searchInput).subscribe(
                value => {
                    this.landingPageSearchResults =
                        value.data.search_problems_multiword;
                },
                error => {
                    console.error(JSON.stringify(error));
                }
            );
        } else {
            this.landingPageSearchResults = [];
        }
    }
    ngOnDestroy() {
        this.solutionSubscription.unsubscribe();
        this.problemSubscription.unsubscribe();
        this.collaboratorsSubscription.unsubscribe();
    }
}
