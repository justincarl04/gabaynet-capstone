# BASE URL
/api

# AUTH ROUTES
/api/auth

## POST /api/auth/login
- Authenticates a user and returns a JWT token

Auth Required: No

Request Body:
    {
        "username": "string",
        "password": "string"
    }

Responses:
    Status	|   Description
    ---------------------------------------------------------
    200	    |   Login successful. Returns user object + token
    400	    |   Missing username or password
    401	    |   Invalid username or password
    500	    |   Internal server error

Success Response:
    {
        "user_id": 1,
        "username": "SysAdmin",
        "email": "gabaynet@gmail.com",
        "role": "super_admin",
        "created_at": "...",
        "token": "<jwt>"
    }

## POST /api/auth/register
- Creates a new user account. Role creation is restricted based on the requester's role.

Auth Required: Yes
- Admin -> Staff Account Creation
- Super Admin -> Admin and Staff Creation

Request Headers:
- Authorization: Bearer <token>

Request Body:
    {
        "username": "string",
        "email": "string",
        "password": "string",
        "role": "staff | admin"
    }

Responses:
    Status	|   Description
    ------------------------------------------------------------------------
    201	    |   Account created. Returns new user object (no password)
    400	    |   Username already taken
    403	    |   Unauthorized — insufficient role to create this account type
    500	    |   Internal server error

# REPORT ROUTES
/api/reports

## POST /api/reports/new
- Submits a new report, optionally with an image.

Auth Required: No

Request: multipart/form-data
    Field           |	Type    |	Required    |	Description
    ----------------------------------------------------------------------------
    title           |	string  |	Yes	        |   Report title
    category_id     |	integer |	Yes	        |   ID of the category
    description     |	string  |	No	        |   Detailed description
    location        |	string  |	No	        |   Location of the issue
    reporter_contact|	string  |	No	        |   Contact info of the reporter
    file	        |   file	|   No	        |   Image attachment (max 5MB)


Responses:
    Status	|   Description
    ---------------------------------------------------------
    201	    |   Report created. Returns full report object
    400	    |   Missing title or category_id, or invalid category_id
    500	    |   Internal server error

Success Response:
    {
        "report_id": 1,
        "title": "Broken streetlight",
        "description": "...",
        "category_id": 1,
        "location": "Block 5",
        "reporter_contact": "09XX",
        "image_url": "<pre-signed S3 URL, valid 5 min>",
        "status": "pending",
        "handler_id": null,
        "submitted_at": "...",
        "updated_at": "..."
    }

## GET /api/reports
- Returns a paginated list of reports with optional filters.

Auth Required: No

Request: multipart/form-data
    Param	        |   Type	|   Default         |   Description
    ----------------------------------------------------------------------------------------------------
    page	        |   integer	|   1	            |   Page number
    limit	        |   integer	|   10	            |   Results per page
    status	        |   string	|   —	            |   Filter by status: pending, in_progress, resolved
    category	    |   string	|   —	            |   Filter by category name (exact match)
    category_id	    |   integer	|   —	            |   Filter by category ID
    title	        |   string	|   —	            |   Search by title (partial, case-insensitive)
    handler_name	|   string	|   —	            |   Search by handler username (partial, 
                                                    |   case-insensitive)
    from	        |   date	|   —	            |   Filter reports submitted on or after this date
    to	            |   date	|   —	            |   Filter reports submitted on or before this date
    sort	        |   string	|   submitted_at    |	Sort field: submitted_at, report_id, status, 
                                                    |   title, category_name, handler_name
    order	        |   string	|   desc	        |   Sort direction: asc, desc

Responses:
    Status	|   Description
    -----------------------------------------
    200	    |   Returns paginated report list
    500	    |   Internal server error

Success Response:
    {
        "data": [
            {
                "report_id": 1,
                "title": "Broken streetlight",
                "status": "pending",
                "category_name": "Infrastructure & Maintenance",
                "handler_name": null,
                "submitted_at": "...",
                "updated_at": "..."
            }
        ],
        "meta": {
            "totalCount": 42,
            "totalPages": 5,
            "currentPage": 1,
            "limit": 10,
            "hasNextPage": true,
            "hasPreviousPage": false
        }
    }

## GET /api/reports/:report_id
- Returns a single report by ID, including a fresh pre-signed image URL if an image exists.

Auth Required: No

URL params:
    Param       |	Type    |	Description
    --------------------------------------------
    report_id   |	integer |	ID of the report

Responses:
    Status  |	Description
    --------------------------------------
    200	    |   Returns full report object
    404	    |   Report not found
    500	    |   Internal server error

Success Response:
{
  "report_id": 1,
  "title": "Broken streetlight",
  "description": "...",
  "status": "pending",
  "category_id": 1,
  "category_name": "Infrastructure & Maintenance",
  "handler_id": null,
  "handler_name": null,
  "reporter_contact": "09XX",
  "image_url": "<pre-signed S3 URL, valid 5 min>",
  "location": "Block 5",
  "submitted_at": "...",
  "updated_at": "..."
}

## PATCH /api/reports/:report_id/claim
- Assigns the authenticated user as the handler of a report. Only works on pending reports.

Auth Required: Yes
- staff, admin, or super_admin

Request Headers:
- Authorization: Bearer <token>

URL Params:
    Param       |   Type	|   Description
    -----------------------------------------------------
    report_id   |   integer |   ID of the report to claim

Responses:
    Status  |   Description
    ---------------------------------------------------------
    200	    |   Report claimed. Returns updated report object
    401	    |   No token provided
    403	    |   Insufficient role
    404	    |   Report not found or already claimed
    500	    |   Internal server error

## PATCH /api/reports/:report_id/resolve
- Marks a report as resolved.

Auth Required: Yes
- staff, admin, or super_admin

Request Headers:
- Authorization: Bearer <token>

URL Params:
    Param	    |   Type	|   Description
    -------------------------------------------------------
    report_id   |	integer |   ID of the report to resolve

Responses:

    Status  |   Description
    ----------------------------------------------------------
    200	    |   Report resolved. Returns updated report object
    401	    |   No token provided
    403	    |   Insufficient role
    404	    |   Report not found
    500	    |   Internal server error

# OTHER ROUTES

## GET /
- Returns a plain text confirmation that the API is running.

## GET /health
- Checks database connectivity.

Success Response:
{ "status": "ok" }

Failed Response:
{ "status": "error", "message": "Database connection failed" }