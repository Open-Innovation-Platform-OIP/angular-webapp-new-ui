const environment = {
    production: false,
};

const domain = 'https://oip-dev.dev.jaagalabs.com';

const fileUploadVariables = {
    UploadUrlEndpoint:
        'https://minio-microservice.dev.jaagalabs.com/create_presigned_url',
    bucketName: 'test',
    accessUrl: 'https://minio-storage.dev.jaagalabs.com',
    deleteEndpoint: 'https://minio-microservice.dev.jaagalabs.com/delete_file',
};

export { environment, domain, fileUploadVariables };
