# Development Guidelines

## Deployment
This app is deployed on Railway automatically from the main branch of this GitHub repo. After finishing each task, commit and push to GitHub so that Railway deploys the new version.

## Database
The database is a Railway PostgreSQL database that is available only through the `DATABASE_URL` environment variable on Railway. Do not set up a local database or local server.

## Before Pushing
Before every push, run `npm run build` to make sure the app builds.
