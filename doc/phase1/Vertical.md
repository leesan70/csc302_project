# Vertical Slice

## Backend

For the backend of our vertical slice we will have our core form retrieval api in place so we can list the available forms and retrieve a specific form. To support this we have a tool to parse the XML forms and translate them entirely into our planned model. This allows our front-end to begin working on rendering the forms with a complete version of the forms represented in JSON. To test this phase we have a number of unit tests setup with mocha/chai in the backend to ensure these endpoints work as expected and our parser successfully translates the original XML into our model.

## Frontend

The front end of the API essentially renders a tree using React, allowing the nodes to be presented hierarchically. It receives a raw JSON from the back end, processes it and encapsulates it in an iterator. The first level accessed by the iterator identifies the sections of the form, and contains the associated questions. The questions are then answered by the user, and before sending the response back, there is a validation check.  Dependent questions are identified by fields within questions, and set up as the next level.  The unit tests associated with the front end are done using jest and enzyme for our future component testing, and they test that the form correctly validates user input. 