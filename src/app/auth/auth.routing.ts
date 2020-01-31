import { Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgotpassword.component';
import { VerifyEmailComponent } from './verify-email/verifyemail.component';

export const AuthRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'login',
                component: LoginComponent,
            },
            {
                path: 'register',
                component: RegisterComponent,
            },
            {
                path: 'forgot',
                component: ForgotPasswordComponent,
            },
            {
                path: 'verify',
                component: VerifyEmailComponent,
            },
        ],
    },
];
