import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
// import { MaterialModule } from '../app.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthRoutes } from './auth.routing';

import { RegisterComponent } from './register/register.component';
// import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgotpassword.component';
import { VerifyEmailComponent } from './verify-email/verifyemail.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AuthRoutes),
        FormsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        LoginComponent,
        RegisterComponent,
        ForgotPasswordComponent,
        VerifyEmailComponent,
    ],
})
export class AuthModule {}
