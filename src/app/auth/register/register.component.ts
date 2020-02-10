import {
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    ViewChild,
} from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { first } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

declare var $: any;
const isEmail = email => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

@Component({
    selector: 'app-register-cmp',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
    @ViewChild('password', { static: false }) passwordInput: ElementRef<
        HTMLElement
    >;
    user = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    };
    passwordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{6,})');

    loading = false;
    registerForm: FormGroup;
    sampleForm: FormGroup;
    showPassword = true;

    constructor(
        private auth: AuthService,
        private elementRef: ElementRef,
        private router: Router
    ) {}

    ngOnInit() {
        this.registerForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email]),
            name: new FormControl(null, [Validators.required]),
            password: new FormControl(null, [
                Validators.required,
                Validators.minLength(6),
                Validators.pattern(this.passwordRegex),
            ]),
            confirmPassword: new FormControl(
                null,
                [Validators.required],
                this.passwordMismatch
            ),
        });
        // this.router.events.subscribe(event => {
        //   this.currentTitle.setTitle("Register");
        // });
        // const body = document.getElementsByTagName("body")[0];
        // body.classList.add("register-page");
        // body.classList.add("off-canvas-sidebar");
        // const pageHeading = this.elementRef.nativeElement.querySelector("#heading");
        // setTimeout(() => {
        //   this.focusMonitor.focusVia(pageHeading, "program");
        // }, 1000);
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

    passwordMismatch(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                const pwd = control.parent.value['password'];
                const confirmPwd = control.parent.value['confirmPassword'];
                if (pwd === confirmPwd) {
                    resolve(null);
                } else {
                    resolve({ mismatch: true });
                }
            }, 10);
        });

        return promise;
    }

    ngOnDestroy() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove('register-page');
        body.classList.remove('off-canvas-sidebar');
    }
    canSubmit() {
        if (
            this.user.name &&
            isEmail(this.user.email) &&
            this.user.password.length >= 4 &&
            this.user.password === this.user.confirmPassword
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
            this.router.navigate(['']);
        }
    }
    register() {
        this.loading = true;
        this.auth.register(this.user).subscribe(
            res => {
                if (res['is_invited'] && res['admin_invited']) {
                    alert('Please login ');
                    this.router.navigateByUrl(`/auth/login`);
                } else if (res['is_invited'] && !res['admin_invited']) {
                    alert('User created.Please wait for admin approval ');
                    this.router.navigateByUrl(`/landing-page`);
                } else {
                    this.router.navigateByUrl(
                        `/auth/verify?email=${this.user.email}&step=1`
                    );
                }
            },
            err => {
                console.error(err.error);
                this.loading = false;
                const msg = err.error.message;
                if (
                    typeof msg === 'string' &&
                    msg.toLowerCase().search('duplicate') !== -1
                ) {
                    alert(
                        'Email already registered. Please try logging in instead.'
                    );
                } else {
                    alert(msg);
                }
            }
        );
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            this.user = { ...this.registerForm.value };
            this.register();
        } else {
            alert('Signup form not valid');
        }
    }
}
