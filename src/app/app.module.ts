import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './services/graphql.module';
import { HttpClientModule } from '@angular/common/http';

import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule } from './shared/navbar/navbar.module';

@NgModule({
    declarations: [AppComponent, AuthLayoutComponent, AdminLayoutComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        GraphQLModule,
        HttpClientModule,
        FooterModule,
        NavbarModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
