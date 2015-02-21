# Faction API
- All POST, PUT bodies contain JSON objects
- ":id" signifies ID of user
- (1) means it is sent only once
- (*) means it is sent as long as no action takes place to change it

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

## Faction
### Sending a faction
#### /api/factions/send (POST)
- JSON object {to:[], faction, fact}
    - "to" contains a list of usernames for recipients
    - "faction" contains the text of the faction
    - "fact" will be set to "true" (lowercase) if faction is true, faction will be considered false otherwise
- Success: 201 Created
    - Body contains {factionId}, uniquely generated ID to identify faction by
- Error: 400 Bad Request
    - Body contains string of error
    - Errors include something not being present
- Error: 500 Internal Server Error
    - Something wierd happened
    - Error returned

### Sending Response to a Faction
#### /api/factions/respond
- JSON object {factionId, userResponse}
    - factionId is the faction id you are responding to
    - userResponse is a string containing "true" or "false" as a string
- Success: 200 OK
    - Body contains {isRight}, which is a boolean containing whether the user's answer was correct
- Error: 403 forbidden - user not logged in

## User info flow and update control
### Getting all user information
#### /api/user/info (GET)
- Success: 200 OK
- Body contains JSON object {friends: [], receivedFriendRequests: [], acceptedFriendRequests: [], factionsReceived: [], factionsSent: [], pendingFactions: [], factionResponses: [], updateTimestamp}
    - friends(*) is an array of username strings of all your friends (includes acceptedFriendRequests)
    - receivedFriendRequests(*) is an array of username strings (they are awaiting an answer from you)
    - acceptedFriendRequests(1) is an array of username strings (they are your new friends)
    - factionsReceived(*) is an array of {sender, story, fact, factionId}
    - factionsSent(*) is an array of {sender, story, fact, factionId}
    - pendingFactions(*) is an array of {sender, story, fact, factionId}

        For factionsReceived, factionsSent and pendingFactions
        - sender is a username string
        - story is a string
        - fact is a boolean
        - factionId is string
    - factionResponses(1) is an array of {factionId, responderUsername, response} that are responses to your sent factions
        - factionId is a string
        - responderUsername is a string (TODO: check, maybe only send counts for fact/fiction)
        - response is a boolean
    - updateTimestamp(*) is a string containing a date

- Error: 500 Internal Server Error
    - error returned

### Updating
#### /api/user/update (POST)
- Body of request contains {updateTimestamp, viewedFactions: []}
    - updateTimestamp is string identical sent in the last /api/user/info or /api/user/update
    - viewedFactions is an array of faction IDs from pendingFactions that were seen by the user
- Success: 200 OK
- Body contains {receivedFriendRequests: [], acceptedFriendRequests: [], pendingFactions: [], factionResponses: [], updateTimestamp}
    - receivedFriendRequests(*) is an array of username strings (they are awaiting an answer from you)
    - acceptedFriendRequests(1) is an array of username strings (they are your new friends)
    - pendingFactions(*) is an array of {sender, story, fact, factionId}
        - sender is a username string
        - story is a string
        - fact is a boolean
        - factionId is string
    - factionResponses(1) is an array of {factionId, responderUsername, response} that are responses to your sent factions
        - factionId is a string
        - responderUsername is a string
        - response is a boolean
    - updateTimestamp(*) is a string containing a date

- Error: 400 Bad Request
    - Something wrong with the user's session
- Error: 500 Internal Server Error
    - Something wierd happened
    - Error returned

## Friends
### Sending a Friend Request
#### /api/user/request-friend (POST)
- JSON object {username}
    - Friend contains username of person to request
- Success: 201 Created
    - No Body, occurs on successful cration of friend request
- Error: 403 Forbidden - user not logged in

### Responding to a Friend Request
#### /api/user/accept-friend (POST)
- JSON object {username, accepted}
    - username is the username of person you wish to accept as a friend
    - Will accept if accepted is true, assumed false otherwise
- Success: 200 OK
- Error: 403 Forbidden - user not logged in

### Deleting a friend
#### /api/user/delete-friend (DELETE)
- JSON object {username}
    - username is the username of the friend you wish to delete
- Success: 200 OK
- Error: 403 Forbidden - user not logged in

## User utilities
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

### Getting all factions related to user
#### /api/user/factions (GET)
- Success; 200 OK
    - Body contains JSON object {sent: [], received: []}
        - sent is an array of {sender: username string,story,fact,id}
        - received is an array of {sender: your user id,story,fact,id}
- Error: 500 Internal Server Error
    - error returned
