# Testing

## Backend

We will run a suite of backend tests using mocha/chai. This will include unit tests for the api endpoints as well tests for our form parsing tool. We have a relatively basic API and aim to have thorough coverage of all api functionality, in addition to coverage over all baseline cases of the XML->model transformation in the parser. These tests will be part of the CI run along with any changes.

## Frontend

The frontend will be built with React, so we will use Jest for component testing. We will also have unit tests for certain frontend features (e.g. form validation).

Stretching the goals for testing, we may possibly look into end-to-end and integration testing. For E2E testing, we are considering to use cypress or selenium. We would be creating batch of cases such  as login, form fill out/submission and getting persistent forms.  E2E testing will help us gain insight of our application as a whole that other tests won’t show. 