
# Collaboration

## Goal

We endeavour to split work in a way that each member carries their weight and is able to reach their personal learning goals, while potentially learning how to deal with bigger teams and a project that is out of our usual expertise. 

## Compentencies and Contraints

Team Member | Competency | Constraint
--- | --- | ---
Anujan | NodeJS, SQL
Jacob | NodeJS, express, noSQL databases
James | NodeJS, express, mongoDB
Johnny | NodeJS, Architecture
Kevin | React, Nodejs + express
Lina | Project management
Ryan | React

## Division of Work

Team Member | Roles
--- | ---
Anujan | CICD, testing
Jacob | Backend, testing APIs
James | Backend, database/api/testing
Johnny | Full-stack
Kevin | Frontend, testing
Lina | Frontend, testing
Ryan | Frontend

## Communications
We’ve decided to meet three times a week during or after class, as this fits everyone’s schedules best. Meetings outside of scheduled class time so far have not been necessary, though we are open to scheduling those should the need arise. Going forward, we intend to adhere to this schedule.

Though we are not following scrum, each in-person meeting works as a kind of standup. Team members will bring up issues that they have identified and discuss the work they’ve done since the last meeting. Since we work on this project part-time rather than full-time, holding standups every few days rather than daily feels appropriate.

A significant amount of our communication is also done via Slack messaging. We have created a Slack workspace for our team where we can regularly update each other on our progress and inform the team of problems that arise. As the project grows we may create new channels for specific subdomains of the project (e.g. a #frontend or a #server channel). There are also some shared documents on our GitHub, for example the setup documentation in the `README` and our reference UML in `artifacts/`.

We have a kanban-style workflow. Tickets and tasks to be done are tracked via a private Trello board. We have the usual swimlanes seen on a kanban board: “In Progress”, “In Review”, and “Completed”. Tasks are sorted into frontend and backend categories and assigned to the team member who has agreed to work on them, who then moves the tickets across the board as they are completed. We decided to size our tasks base on hours rather than points, and will track our progress based on the size and number of tickets closed.

We have two main branches on GitHub, master and dev. Master contains the most recent production-ready build. Team members work locally and push their commits to their own branch on GitHub. They will then submit a pull request from their branch to dev, and assign team members to review their code. Once reviewers have approved the changes, the team member is free to merge.

## Meeting Summaries:

All team members attended all meetings, and all meetings were held in the classroom during or after classtime.

Date | Summary
--------- | ---
Sep 13 | Decided on Slack and Trello for communication, began talking about which technologies to use for project. Began discussing which team members would like to work on which parts of the stack.
Sep 18 | Assigned team members to roles across the stack. Decided on Mongo, Node, and React/Redux.
Sep 23 | Discussed tools to use for creating project artifacts (e.g. Swagger, Star UML, mock-up tools, …).
Sep 30 | Clarified project structure and frontend/backend responsibilities.
Oct 2 | Decided on API specification.
Oct 9 | Began discussing frontend and backend implementation strategies and approaches.
Oct 16 |Discussed minimum requirements for an acceptable vertical slice and set goals to meet P1 deadline.
Oct 23 | Finalized vertical slice implementation, and discussed next steps
