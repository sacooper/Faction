# Faction API
- All POST, PUT bodies contain JSON objects
- ":id" signifies ID of user

## Account Management
### Create an Account
#### /api/user/new (POST)
- JSON object: {email, password, username, "action":"register"}
- client must verify password confirmation
- success: 200 OK
- error: 409 Conflict
    - body will contain {error: ""}
    - Username already in use, or email already in use
- Body of response: {id}
    - id is unique identifier (randomly generated)
    - must be included in all subsequent API calls to be authenticated

### Change Password
#### /api/user/update-password (PUT)
- JSON object: {old, new}
- client must verify password confirmation
- Success: 200 Ok
- Error: 500 Internal Server Error
    - Something bad happened
- Error: 403 Forbidden
    - If user isn't logged in or bad old password

### Log into Account
#### /api/user/login (POST)
- JSON object: {identifier:"", password:""}
- Success: 200 OK
    - Contains cooking with session id
- Error: 401 Unauthorized
    - Will occur with invalid credentials

### Log Out
#### /api/user/logout (POST)
- Success:200 OK
- Error: 403 Forbidden

## General Usage
### Sending a faction
#### /api/factions/send (POST)
- JSON object {to:[], faction, fact}
    - "to" contains a list of usernames for recipients
    - "faction" contains the text of the faction
    - "fact" will be set to "true" (lowercase) if faction is true, faction will be considered false otherwise
- Success: 201 Created
    - Body contains {faction_id}, uniquely generated ID to identify faction by
- Error: 400 Bad Request
    - Body contains string of error
    - Errors include something not being present
- Error: 500 Internal Server Error
    - Something wierd happened
    - Error returned

### Sending Response to a Faction
#### /api/factions/respond
- JSON object {fact}
    - Considered true if fact set to "true", false otherwise
- Success: 200 OK
    - **Do we need request body here?**
- Error: 403 forbidden - user not logged in

### Updating
#### /api/update (GET)
- Success: 200 OK
    - Body contains {factions:[], new_friends:[], pending_requests:[], responses[{faction_id, response}]}
    - factions: Empty list if no new factions, otherwise list of {faction_id, story, sender, fact}
    - new_friends: Empty list if no new friends (i.e. pending friend requests that have been approved), otherwise, list of usernames with approved friends
    - pending_requests: Empty list if no new pending requests, otherwise, list contains usernames of people who requested to be this person's friend
    - Should subsequently send GET request to /api/factions/get?id=...&faction_id=... to get factions
- Error: 400 Bad Request
    - Something wrong with the user's session
- Error: 500 Internal Server Error
    - Something wierd happened
    - Error returned

### Sending a Friend Request
#### /api/users/request-friend (POST)
- JSON object {username}
    - Friend contains username of person to request
- Success: 201 Created
    - No Body, occurs on successful cration of friend request
- Error: 403 Forbidden - user not logged in

### Responding to a Friend Request
#### /api/users/accept-friend (POST)
- JSON object {username, accepted}
    - Friend contains username of person accepting
    - Will accept if accepted is true, assumed false otherwise
- Success: 200 OK
- Error: 403 Forbidden - user not logged in

### Searching for Users
#### /api/user/search (GET)
- Optional query parameter search=""
    - If search paramater not included, returns a list of all users, otherwise only returns users with usernames containing that substring
- Success: 200 OK
    - Body contains JSON object {friends : []}, containing list of usernames of user's friends
- Error: 403 Forbidden 
    - user not logged in
- Error: 500 Internal Server Error
    - error returned

### Getting user's friends
#### /api/user/friends (GET)
- Success: 200 OK
    - Body contains JSON object {friends: []}, the array contains username strings
- Error: 500 Internal Server Error
    - error returned

### Getting all user information
#### /api/user/info (GET)
- Success: 200 OK
    - Body contains JSON object {friends: [], factionsReceived: [], factionsSent: []}
        - friends is an array of username strings
        - factionsReceived is an array of {sender: username string,story,fact,id}
        - factionsSent is an array of {sender: your user id,story,fact,id}
- Error: 500 Internal Server Error
    - error returned

### Getting all factions related to user
#### /api/user/factions (GET)
- Success; 200 OK
    - Body contains JSON object {sent: [], received: []}
        - sent is an array of {sender: username string,story,fact,id}
        - received is an array of {sender: your user id,story,fact,id}
- Error: 500 Internal Server Error
    - error returned
