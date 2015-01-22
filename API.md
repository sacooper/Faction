# Faction API
- All POST, PUT bodies contain JSON objects
- ":id" signifies ID of user

## Account Management
### Create an Account
#### /api/user/new (POST)
- JSON object: {email, password, username}
- client must verify password confirmation
- success: 201 Created
- error: 409 Conflict
    - body will contain {error: ""}
    - Username already in use, or email already in use
- Body of response: {id}
    - id is unique identifier (randomly generated)
    - must be included in all subsequent API calls to be authenticated

### Change Password
#### /api/user/update_password/ (PUT)
- JSON object: {old, new}
- client must verify password confirmation
- Success: 200 Ok
- Error: 500 Internal Server Error
    - Something really bad happened
- Error: 403 Forbidden
    - If user isn't logged in or bad old password
- No body in response

### Log into Account
#### /api/user/login (POST)
- JSON object: {email, password}
- Success: 200 OK
    - Body contains {id}
- Error: 401 Unauthorized
    - Will occur with invalid password
    - No body
- Error: 404 Not Found
    - Will occur with invalid email address
    - No body

## General Usage
### Sending a faction
#### /api/factions/send/:id (POST)
- JSON object {to:[], faction, fact}
    - "to" contains a list of usernames for recipients
    - "faction" contains the text of the faction
    - "fact" will be set to "true" (lowercase) if faction is true, faction will be considered false otherwise
- Success: 201 Created
    - Body contains {faction_id}, uniquely generated ID to identify faction by
- Error: 404 Not Found
    - {error:""}
    - invalid ID or any of the usernames is invalid
        - invalid username MAY BE one that exists, but user does not have permission to send to (shouldn't ever happen?)
    - Will contains invalid usernames if that is the case

### Updating
#### /api/update/:id (GET)
- Success: 200 OK
    - Body contains {factions:[], new_friends:[], pending_requests:[], responses[{faction_id, response}]}
    - factions: Empty list if no new factions, otherwise IDs of new factions
    - new_friends: Empty list if no new friends (i.e. pending friend requests that have been approved), otherwise, list of usernames with approved friends
    - pending_requests: Empty list if no new pending requests, otherwise, list contains usernames of people who requested to be this person's friend
    - Should subsequently send GET request to /api/factions/get?id=...&faction_id=... to get factions
- Error: 404 Not Found
    - Invalid ID in query parameters

### Sending a Friend Request
#### /api/users/request_friend/:id (POST)
- JSON object {friend}
    - Friend contains username of person to request
- Success: 201 Created
    - No Body, occurs on successful cration of friend request
- Error: 404 Not found
    - Body contains JSON object {error:}
    - Possible errors: "Invalid id", "username does not exist"

### Sending Response to a Faction
#### /api/factions/:id/:faction_id
- JSON object {fact}
    - Considered true if fact set to "true", false otherwise
- Success: 200 OK
    - **Do we need request body here?**
- Error: 404 Not Found
    - Body contains {error:""}
    - Error may be invalid id or invalid faction_id

### Responding to a Friend Request
#### /api/users/accept_friend:id (POST)
- JSON object {username, accepted}
    - Friend contains username of person accepting
    - Will accept if accepted is "true", assumed false otherwise
- Success: 200 OK
- Error: 404 Not Found
    - Body contains {error:""}
    - Error may be invalid id or invalid username
