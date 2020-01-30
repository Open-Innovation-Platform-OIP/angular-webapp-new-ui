import {
    Component,
    OnInit,
    ElementRef,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { UsersService } from '../../services/users.service';

declare var $: any;
const isEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

@Component({
    selector: 'app-login-cmp',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
    @ViewChild('password', { static: false }) passwordInput: ElementRef<
        HTMLElement
    >;

    loginDetails = {
        email: '',
        password: '',
    };
    loading = true;
    submitted = false;
    returnUrl = '/';
    error = '';
    link = '';
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;
    showPassword = false;

    constructor(
        private element: ElementRef,
        private auth: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UsersService,
        private currentTitle: Title
    ) {
        console.log('inside login component');

        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
        setTimeout(() => {}, 1000);
    }

    ngOnInit() {}
    sidebarToggle() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        const sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible === false) {
            setTimeout(() => {
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

    onTyping(event) {}

    canSubmit() {
        if (isEmail(this.loginDetails.email) && this.loginDetails.password) {
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

    clickHideUnhide() {
        const attr = this.passwordInput.nativeElement.getAttribute('type');
        if (attr === 'password') {
            this.passwordInput.nativeElement.setAttribute('type', 'text');
            this.showPassword = true;
        } else {
            this.passwordInput.nativeElement.setAttribute('type', 'password');
            this.showPassword = false;
        }
    }

    login() {
        if (!(isEmail(this.loginDetails.email) && this.loginDetails.password)) {
            return alert('Please enter a valid email and password');
        }
        this.submitted = true;
        this.loading = true;

        this.auth
            .login(this.loginDetails)
            .pipe(first())
            .subscribe(
                data => {
                    window.location.href = `${this.returnUrl}`;

                    this.userService.getCurrentUser();

                    const message =
                        'Update your profile information to make the most out of the platform.';

                    setTimeout(() => {
                        this.showNotification([
                            'bottom',
                            'left',
                            '',
                            'notifications',
                            3000,
                            message,
                        ]);
                    }, 1000);
                },
                error => {
                    console.error(error);
                    this.error = error;
                    const msg = error.error.msg;
                    if (
                        typeof msg === 'string' &&
                        msg.toLowerCase().search('already verified') !== -1
                    ) {
                        const message =
                            'Your email is already verified. You can login or request a password reset';
                        this.showNotification([
                            'top',
                            'center',
                            4,
                            'warning',
                            3000,
                            message,
                        ]);
                    } else if (
                        typeof msg === 'string' &&
                        msg.toLowerCase().search('not been verified') !== -1
                    ) {
                        const message =
                            'Your email has not been verified. Click OK to proceed to the email verification page.';
                        this.showNotification([
                            'top',
                            'center',
                            4,
                            'warning',
                            3000,
                            message,
                        ]);
                        this.router.navigateByUrl(
                            `/auth/verify?email=${this.loginDetails.email}`
                        );
                    } else if (
                        typeof msg === 'string' &&
                        msg.toLowerCase().search('unknown') !== -1
                    ) {
                        const message =
                            'Unknown email address. Perhaps you have not signed up yet?';
                        this.showNotification([
                            'top',
                            'center',
                            4,
                            'warning',
                            3000,
                            message,
                        ]);
                    } else if (
                        msg instanceof Object &&
                        !Object.entries(msg).length
                    ) {
                        this.login();
                    } else {
                        this.showNotification([
                            'top',
                            'center',
                            4,
                            'warning',
                            3000,
                            msg,
                        ]);
                    }
                    this.loading = false;
                }
            );
    }
    forgotPassword() {
        // send reset request to server
        this.router.navigateByUrl(
            `/auth/forgot?email=${this.loginDetails.email}`
        );
    }

    showNotification(values) {
        let [from, align, color, icon, time, message] = [...values];
        const type = [
            '',
            'info',
            'success',
            'warning',
            'danger',
            'rose',
            'primary',
        ];

        if (!color) {
            color = Math.floor(Math.random() * 6 + 1);
        }

        $.notify(
            {
                icon: icon,
                message: message,
            },
            {
                type: type[color],
                timer: time,
                placement: {
                    from: from,
                    align: align,
                },
                template:
                    '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0} alert-with-icon" role="alert">' +
                    '<button mat-raised-button type="button" aria-hidden="true" class="close" data-notify="dismiss"> ' +
                    '<i class="material-icons">close</i></button>' +
                    `<i class="material-icons" data-notify="icon">${icon}</i>` +
                    '<span data-notify="title">{1}</span> ' +
                    '<span data-notify="message">{2}</span>' +
                    '<div class="progress" data-notify="progressbar">' +
                    '<div class="progress-bar progress-bar-{0}" role="progressbar" ' +
                    'aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                    '</div>' +
                    '<a href="{3}" target="{4}" data-notify="url"></a>' +
                    '</div>',
            }
        );
    }
}
