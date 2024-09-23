# Events App (Backend API)

This API is designed to manage and organize personal events, with the ability to categorise, share, and track events across different users. It supports user connections for sharing events and offers flexibility for different types of events through category-specific attributes. The API is built using Express with TypeScript for improved type safety and scalability.

## Models

### User

- \_id (string, required): Unique identifier for each user.
- name (string, required): User’s name.
- email (string, required): User’s email.
- provider (object, required): Third-party logins, such as Gmail (useful for OAuth).
- role (enum, optional): Field for assigning user roles like admin or user.
- events (array of \_ids, optional): References to the events created or associated with the user.
- connections (array of \_ids, optional): List of approved user connections.
- connectionId (string, required): A uniquely generated code that provides a user-friendly way to connect with others.

### Event

- \_id (string, required): Unique identifier for each event.
- title (string, required): Title or name of the event.
- date (object, required): Start and end dates for the event (end date and time are optional).
- category (\_id, required): Reference to the EventCategory model, identifying the type of event.
- additionalAttributes (object, optional): Holds category-specific fields (e.g., kickOff for sport, birthYear for birthdays).
- createdBy (\_id, required): Reference to the user who created the event.
- sharedWith (array of \_ids): List of user IDs with whom the event is shared.
- extraInfo (string, optional): Additional information or notes for the event.

### EventCategory

- \_id (string, required): Unique identifier for each category.
- name (string, required): Name of the category (e.g., sport, music, wedding).
- faIcon (string, required): Reference to a FontAwesome icon or another icon library to visually represent the category.
