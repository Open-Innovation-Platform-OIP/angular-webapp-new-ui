import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

// import { Timestamp } from 'aws-sdk/clients/workspaces';
// import { stringType } from 'aws-sdk/clients/iam';
// import { String } from 'aws-sdk/clients/sns';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

// import swal from 'sweetalert2';
declare var $: any;

export interface Enrichment {
    description: string;
    location: string;
    organization: string;
    resources_needed: string;
    image_urls: any[];
    video_urls: any[];
    impact: string;
    min_population: number;
    max_population: number;
    extent: string;
    beneficiary_attributes: string;
    id?: number;
    problem_id?: number;
    solution_id?: number;
    user_id?: number;
    created_at?: string;
    edited_at?: string;
    is_deleted?: boolean;
    voted_by?: any[];
}

@Injectable({
    providedIn: 'root',
})
export class EnrichmentService {
    submitEnrichmentSub: Subscription;
    constructor(private apollo: Apollo, private router: Router) {}

    submitEnrichmentToDB(enrichmentData: Enrichment) {
        this.submitEnrichmentSub = this.apollo
            .mutate({
                mutation: gql`
                    mutation upsert_enrichments(
                        $enrichments: [enrichments_insert_input!]!
                    ) {
                        insert_enrichments(
                            objects: $enrichments
                            on_conflict: {
                                constraint: enrichments_pkey
                                update_columns: [
                                    description
                                    location
                                    organization
                                    resources_needed
                                    image_urls
                                    video_urls
                                    impact
                                    min_population
                                    max_population
                                    extent
                                    beneficiary_attributes
                                    featured_url
                                    featured_type
                                    embed_urls
                                    attachments
                                ]
                            }
                        ) {
                            affected_rows
                            returning {
                                problem_id
                                solution_id
                            }
                        }
                    }
                `,
                variables: {
                    enrichments: [enrichmentData],
                },
            })
            .subscribe(
                data => {
                    this.router.navigate(
                        [
                            'problems',
                            data.data['insert_enrichments'].returning[0]
                                .problem_id,
                        ],
                        { queryParamsHandling: 'preserve' }
                    );
                    this.submitEnrichmentSub.unsubscribe();
                },
                err => {
                    console.error(JSON.stringify(err));
                    this.submitEnrichmentSub.unsubscribe();
                }
            );
    }

    deleteEnrichment(id: number) {
        return this.apollo.mutate<any>({
            mutation: gql`
                mutation updateMutation(
                    $where: enrichments_bool_exp!
                    $set: enrichments_set_input!
                ) {
                    update_enrichments(where: $where, _set: $set) {
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

    voteEnrichment(enrichmentData: any) {
        this.apollo
            .mutate<any>({
                mutation: gql`
                    mutation updateMutation(
                        $where: enrichments_bool_exp!
                        $set: enrichments_set_input!
                    ) {
                        update_enrichments(where: $where, _set: $set) {
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
                            _eq: enrichmentData.id,
                        },
                    },
                    set: {
                        voted_by: enrichmentData.voted_by,
                    },
                },
            })
            .subscribe(
                ({ data }) => {
                    return;
                },
                error => {
                    console.error(error);
                }
            );
    }
}
