# API

## Specification
The API for our project is viewable in the file openapi.yaml. 

## Design
In designing our API for P1 we decided to begin with the simple CRUD operations to add, retrieve, delete forms and submit and retrieve responses. Additional behaviour has be separated entirely as strictly backend/frontend, with the understanding that this may introduce new business rules and the front end will be responsible for maintaining a set of javascript tools. As a result the parsing of the original XML forms will occur entirely on the server, and the client will render the form with the model as a whole without the need for additional calls to the backend to unpack and retrieve form nodes. 

## Moving forward 
We have begun to think beyond P1 and implementing the more complex operations like form submission. We have designed our client side interfaces with the potential to easily move the work into the backend when it becomes appropriate. For example updating form responses may later be separated into granular api calls to remove the state maintenance from the front end. However for P1 we chose to clearly separate the initial responsibilities of the front and backend and keep our api simple allowing our app to efficiently provide the required functionality.