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

### Event

- \_id (string, required): Unique identifier for each event.
- title (string, required): Title or name of the event.
- date (object, required): Start and end dates for the event (end date and time are optional).
- location (object, optional): Venue and city for the event (both fields are optional)
- category (\_id, required): Reference to the EventCategory model, identifying the type of event.
- additionalAttributes (object, optional): Holds category-specific fields (e.g., kickOff for sport, birthYear for birthdays).
- createdBy (\_id, required): Reference to the user who created the event.
- description (string, optional): Additional information or notes for the event.

### EventCategory

- \_id (string, required): Unique identifier for each category.
- name (string, required): Name of the category (e.g., sport, music, wedding).
- faIcon (string, required): Reference to a FontAwesome icon or another icon library to visually represent the category.

## Development Tools

### Mock Data Generator

A utility script is provided to generate mock events for testing and development purposes. This script lives in the `mockData` directory and is not included in production builds.

#### Usage

```bash
npm run generate-mock-data <userEmail> <upcomingCount> <pastCount>
```

Parameters:

- `userId`: MongoDB ObjectId of the user to create events for
- `upcomingCount` (optional): Number of upcoming events to generate (default: 20)
- `pastCount` (optional): Number of past events to generate

The script will:

1. Delete all existing events for the specified user
2. Generate new mock events with random titles, dates, and locations
3. Associate events with random categories from the database
4. Create both upcoming and past events if specified

Note: You'll need to have at least one event category in the database before running this script.
