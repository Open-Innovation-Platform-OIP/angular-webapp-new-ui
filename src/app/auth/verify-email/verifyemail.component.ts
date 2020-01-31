import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
declare var $: any;
const isEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

@Component({
    selector: 'app-verifyemail-cmp',
    templateUrl: './verifyemail.component.html',
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
    verifyDetails = {
        email: '',
        otp: '',
    };
    step = 0;
    loading = false;
    submitted = false;
    returnUrl = '/';
    error = '';
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;

    constructor(
        private element: ElementRef,
        private auth: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        let navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];

        this.route.queryParams.subscribe(params => {
            this.returnUrl = params['returnUrl'] || '/';
            this.verifyDetails.email = params['email'] || '';
            this.step = Number(params['step']);
            if (this.step === 1) {
                $('#otpfield').focus();
            } else {
                this.step = 0;
            }
        });
    }
    sidebarToggle() {
        let toggleButton = this.toggleButton;
        let body = document.getElementsByTagName('body')[0];
        let sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible == false) {
            setTimeout(function() {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }
    ngOnDestroy() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove('login-page');
        body.classList.remove('off-canvas-sidebar');
    }
    canSubmit() {
        if (
            isEmail(this.verifyDetails.email) &&
            this.verifyDetails.otp.length >= 4
        ) {
            return true;
        }
        return false;
    }
    done(err, res) {
        if (err) {
            console.error(err);
        }
        if (res) {
            console.log(res);
        }
    }
    requestOTP() {
        this.loading = true;
        this.auth
            .requestVerificationEmail(this.verifyDetails.email)
            .pipe(first())
            .subscribe(
                data => {
                    this.loading = false;
                    this.step = 1;
                },
                error => {
                    console.error(error);
                    this.error = error;
                    const msg = error.error.msg;
                    if (
                        typeof msg === 'string' &&
                        msg.toLowerCase().search('already verified') !== -1
                    ) {
                        alert(
                            'Your email is already verified. You can login or request a password reset'
                        );
                    } else {
                        alert(msg);
                    }
                    this.loading = false;
                }
            );
    }
    goToStep1() {
        this.step = 1;
    }
    submit() {
        this.submitted = true;
        this.loading = true;

        this.auth
            .completeVerification(this.verifyDetails)
            .pipe(first())
            .subscribe(
                data => {
                    alert(
                        'Thank you! You have been verified. Please click OK to await admin approval'
                    );

                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    console.error(error);
                    this.error = error;
                    alert(error.response);
                    this.loading = false;
                }
            );
    }
}
