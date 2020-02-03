import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth/auth-layout.component';
import { AuthGuard } from './services/auth.guard';
import { AdminGuard } from './services/admin.guard';

// const _R: Routes = [
//     {
//         path: 'auth',
//         component: AuthLayoutComponent,
//         children: [
//             {
//                 path: '',
//                 loadChildren: './auth/auth.module#AuthModule',
//             },
//         ],
//     },
//     {
//         path: '',
//         component: AdminLayoutComponent,
//         children: [
//             {
//                 path: 'landing-page',
//                 loadChildren:
//                     './landing-page/landing-page.module#LandingPageModule',
//             },
//             {
//                 path: 'dashboard',
//                 loadChildren: './dashboard/dashboard.module#DashboardModule',
//             },
//         ],
//     },
// ];

export const AppRoutes: Routes = [
    {
        path: '',
        redirectTo: 'problems',
        pathMatch: 'full',
        canActivate: [AuthGuard],
    },
    {
        path: '',
        component: AdminLayoutComponent,

        children: [
            {
                path: 'problems',
                loadChildren: './problems/problems.module#ProblemsModule',
            },
            {
                path: 'dashboard',
                loadChildren: './dashboard/dashboard.module#DashboardModule',
                canActivateChild: [AuthGuard],
            },
            {
                path: 'users',
                loadChildren: './users/users.module#UsersModule',
            },
            {
                path: 'profiles',
                loadChildren: './users/users.module#UsersModule',
            },
            {
                path: 'discussions',
                loadChildren:
                    './discussions/discussions.module#DiscussionsModule',
            },
            // {
            //     path: 'search',
            //     loadChildren:
            //         './global-search-view/global-search-view.module#GlobalSearchViewModule',
            // },
            // {
            //     path: 'admin',
            //     loadChildren: './admin-view/admin-view.module#AdminViewModule',
            //     canActivate: [AdminGuard],
            // },
            {
                path: 'landing-page',
                loadChildren:
                    './landing-page/landing-page.module#LandingPageModule',
            },
            {
                path: 'solutions',
                loadChildren: './solutions/solutions.module#SolutionsModule',
            },
            // {
            //     path: 'enrichment',
            //     loadChildren:
            //         './enrichment-form/enrichment-form.module#EnrichmentFormModule',
            // },
        ],
    },
    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                loadChildren: './auth/auth.module#AuthModule',
            },
        ],
    },
    {
        path: '**',
        redirectTo: 'problems',
        canActivate: [AuthGuard],
    },
];
