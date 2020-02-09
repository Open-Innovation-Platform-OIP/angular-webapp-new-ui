// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const environment = {
    production: true,
};

const domain = 'https://oip-prod-new-ui.dev.jaagalabs.com';

const inviteEndpoint = 'https://invite-flow-microservice-test.dev.jaagalabs.com/invite_user';

const smsEndpoint = 'https://sa-sms-microservice.dev.jaagalabs.com/send';

const authEndpoint = 'https://sa-auth-deploy.dev.jaagalabs.com/auth/';

const hasuraEndpoint = 'https://sa-staging.dev.jaagalabs.com/v1/graphql';

const searchEndpoint = 'https://elasticsearch-microservice-deploy.dev.jaagalabs.com/global_search';

const fileUploadVariables = {
    UploadUrlEndpoint:
        'https://minio-microservice.dev.jaagalabs.com/create_presigned_url',
    bucketName: 'test',
    accessUrl: 'https://minio-storage.dev.jaagalabs.com',
    deleteEndpoint: 'https://minio-microservice.dev.jaagalabs.com/delete_file',
};

export { environment, domain, inviteEndpoint, smsEndpoint, authEndpoint, hasuraEndpoint, searchEndpoint, fileUploadVariables };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
