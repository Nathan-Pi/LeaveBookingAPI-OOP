# Leave Booking API

## HOW TO RUN THIS PROJECT

1. Clone Repository
2. Set-up database connection within data-source.ts
3. Create a user as needed
4. Run ` npm i `
5. Create a .env.development file in the root of the directory with the following:
   
`DB_HOST=localhost`
`DB_PORT=3306`

`DB_USERNAME=your_db_user`

`DB_PASSWORD=your_db_password`

`DB_DATABASE=your_db_name`

`SERVER_PORT=3001`

`PEPPER=your_pepper_secret`

`JWT_SECRET=your_jwt_secret `

7. Run the App - "npm run dev" for development or "npm run start" for production

## All Endpoints:
Base Route: "/api"
(Example Request: GET localhost:9999/api/leave/all)
### Login Route

#### POST "/login
Authenticates a user with their email and password. If successful, returns a token used to authenticate future requests. 
Example JSON body:

{
  "email": "user@example.com",
  "password": "example_password"
}

### Leave Routes
Base Route: "/leave"

#### GET "/all"
Description: Will retrieve any leave requests that you have permission to view (i.e. admin can view all requests, manager can view requests of their assigned employees, users can view their own requests.
Required Permissions: ADMIN / MANAGER / USER

#### POST "/"
Description: Will create a leave request with the specified details, status "pending"; awaiting attention from manager.
Required Permissions: ADMIN / MANAGER / USER
Example JSON body:

{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "reason": "Example Reason"
}

#### PATCH "/approve/:id"
Description: Approves the leave request with the given ID. Only accessible by admins or the manager of the user who made the request.
Required Permissions: ADMIN / MANAGER

#### PATCH "/reject/:id"
Description: Rejects the leave request with the given ID. Only accessible by admins or the manager of the user who made the request.
Required Permissions: ADMIN / MANAGER


#### PATCH "/amend/:id"
Description: Amends the annual leave balance for the user with the given ID.
Required Permissions: ADMIN
Example JSON body:

{
  "amount": 10
}

#### GET "/getUserOutstanding/:id"
Description: Retrieves all outstanding (pending) leave requests for the user with the specified ID.
Required Permissions: ADMIN


#### GET "/getManagedOutstanding/:id"
Description: Retrieves all outstanding (pending) leave requests for users managed by the manager with the specified ID.
Required Permissions: ADMIN


#### GET "getAllOutstanding"
Description: Retrieves all outstanding (pending) leave requests in the system.
Required Permissions: ADMIN


#### GET "/own"
Description: Retrieves all leave requests submitted by the current user.
Required Permissions: Any User


#### DELETE "/:id"
Description: Cancels the leave request with the given ID. Only the user who made the request, their manager, or an admin can cancel a request.
Required Permissions: ADMIN / MANAGER / REQUEST OWNER

### User Route
Base Route: "/user"

#### GET "/"
Description: Retrieves a list of all users in the system.
Required Permissions: ADMIN

#### GET "/email/:emailAddress"
Description: Retrieves a user by their email address.
Required Permissions: ADMIN

#### GET "/:id"
Description: Retrieves a user by their  user ID.
Required Permissions: ADMIN

#### POST "/"
Description: Creates a new user with the provided details.
Required Permissions: ADMIN
Example JSON body:
{
  "email": "user@example.com",
  "password": "example-password",
  "firstname": "Firstname",
  "surname": "Surname",
  "roleId": 2,
  "managerId": 1
}

#### DELETE /:id
Description: Deletes the user with the specified ID.
Required Permissions: ADMIN

#### PATCH /:id
Description: Updates the role of the user with the specified ID.
Required Permissions: ADMIN
Example JSON body:

{
  "roleId": 2
}


### Role Route
Base Route: "/roles"

#### GET "/"
Description:
Retrieves a list of all roles available in the system.
Required Permissions: ADMIN


