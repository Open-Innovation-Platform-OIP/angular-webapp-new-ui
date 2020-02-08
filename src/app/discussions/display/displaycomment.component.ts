import {
    Component,
    ViewChild,
    OnInit,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    OnChanges,
    ElementRef,
    NgZone,
    Renderer2,
} from '@angular/core';
// import swal from 'sweetalert2';
import { Comment } from '../../services/discussions.service';
import { Apollo, QueryRef } from 'apollo-angular';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { FilesService } from '../../services/files.service';
import { AttachmentModalComponent } from '../../components/attachment-modal/attachment-modal.component';

import gql from 'graphql-tag';
// import { Renderer3 } from '@angular/core/src/render3/interfaces/renderer';
// import { FocusMonitor } from '@angular/cdk/a11y';

declare var $: any;
@Component({
    selector: 'app-display-comment',
    templateUrl: './displaycomment.component.html',
    styleUrls: ['./displaycomment.component.scss'],
})
export class CommentDisplayComponent implements OnInit, OnDestroy, OnChanges {
    objectValues = Object['values'];
    @Input() comment;
    @Input() replies;
    @Input() users;
    @Input() pageType;
    @Input() focusContext;
    @Output() reply = new EventEmitter();
    @Output() fileClicked = new EventEmitter();
    @Output() commentToDelete = new EventEmitter();
    @Output() shareCommentId = new EventEmitter();

    userId: number;
    voters = new Set();

    showReplyBox = false;
    replyingTo = 0;
    attachmentToShow = 2;
    repliesAttachmentNum = 2;
    repliesExpanded = false;
    commentsExpanded = false;
    charLenToShow = 135;
    replyLenToShow = 135;

    myContext = { $implicit: 'World', localSk: 'Svet' };

    constructor(
        private apollo: Apollo,
        public auth: AuthService,
        private filesService: FilesService,
        private ele: ElementRef // private focusMonitor: FocusMonitor
    ) {}
    ngOnInit() {
        this.comment.discussion_voters.map(voter => {
            this.voters.add(voter.user_id);
        });
        this.userId = Number(this.auth.currentUserValue.id);

        this.focusContext.subscribe(v => {
            const commentTag: HTMLElement = document.querySelector(
                `[href='#${v}']`
            );
            try {
                // this.focusMonitor.focusVia(commentTag, 'program');
            } catch (error) {}
        });
    }

    ngOnChanges() {}

    readMoreOrLess(currLen: number, actualLen: number) {
        if (currLen < actualLen) {
            this.charLenToShow = actualLen;
        } else {
            this.charLenToShow = 135;
        }
    }

    showMoreOrLessReply(currLen: number, actualLen: number) {
        if (currLen < actualLen) {
            this.replyLenToShow = actualLen;
        } else {
            this.replyLenToShow = 135;
        }
    }

    sortReplies(replies) {
        if (replies && replies.length) {
            return replies.sort(this.compareDateForSort);
        }
    }

    replyTo(commentId) {
        this.showReplyBox = true;
        this.replyingTo = commentId;
    }
    async onCommentSubmit(event) {
        const [content, mentions, attachments] = event;

        this.reply.emit(event);
        this.replyingTo = 0;
        this.showReplyBox = false;
    }

    displayMoreAttachComments() {
        if (this.attachmentToShow === 2) {
            this.attachmentToShow = this.comment.attachments.length;
            this.commentsExpanded = true;
        } else {
            this.attachmentToShow = 2;
            this.commentsExpanded = false;
        }
    }

    displayMoreAttachReplies(attachmentsArr) {
        if (this.repliesAttachmentNum === 2) {
            this.repliesAttachmentNum = attachmentsArr.length;
            this.repliesExpanded = true;
        } else {
            this.repliesAttachmentNum = 2;
            this.repliesExpanded = false;
        }
    }

    assignUrl(files: any[], index: number, context: string) {
        this.fileClicked.emit({ attachmentObj: files, index, context });
    }

    compareDateForSort(a, b) {
        const dateA = a.edited_at;
        const dateB = b.edited_at;
        if (dateA < dateB) {
            return 1;
        }
        if (dateA > dateB) {
            return -1;
        }

        return 0;
    }

    idToDelete(comment) {
        // swal({
        //   title: 'Are you sure?',
        //   text: `You won't be able to revert this!`,
        //   buttonsStyling: false,
        //   confirmButtonClass: 'btn btn-warning',
        //   confirmButtonText: 'Yes, delete it!'
        // })
        //   .then(result => {
        //     if (result.value === true) {
        //       this.commentToDelete.emit(comment);
        //     }
        //   })
        //   .catch(swal.noop);
    }

    getCommentIdToShare(commentId, platform) {
        this.shareCommentId.emit({
            id: commentId,
            platform: platform,
        });
    }

    toggleVoteDiscussions() {
        if (!this.voters.has(this.userId)) {
            this.voters.add(this.userId);
            const add_voter = gql`
        mutation insert_discussion_voter {
          insert_discussion_voters(
            objects: [
              {
                user_id: ${Number(this.userId)},
                discussion_id: ${Number(this.comment.id)}
              }
            ]
          ) {
            returning {
              discussion_id
              user_id

            }
          }
        }
      `;
            this.apollo
                .mutate({
                    mutation: add_voter,
                })
                .pipe(take(1))
                .subscribe(
                    result => {
                        if (result.data) {
                        }
                    },
                    err => {
                        console.error(JSON.stringify(err));
                    }
                );
        } else {
            this.voters.delete(this.userId);
            const delete_voter = gql`
        mutation delete_discussion_voter {
          delete_discussion_voters(
            where: {user_id: {_eq: ${Number(
                this.userId
            )}}, discussion_id: {_eq: ${Number(this.comment.id)}}}
          ) {
            affected_rows
          }
        }
      `;
            this.apollo
                .mutate({
                    mutation: delete_voter,
                })
                .pipe(take(1))
                .subscribe(
                    result => {
                        if (result.data) {
                        }
                    },
                    err => {
                        console.error(JSON.stringify(err));
                    }
                );
        }
    }

    testMimeType(type) {
        if (
            type &&
            !type.startsWith('video') &&
            !type.startsWith('image') &&
            !type.endsWith('pdf')
        ) {
            return true;
        } else {
            return false;
        }
    }

    openModal(id, index?) {
        /* opening modal */
        $(id).modal({
            backdrop: 'static',
            keyboard: false,
        });

        $(id).modal('show');
    }

    ngOnDestroy() {}
}
