# Faction API
- /route/ (METHOD)(OPTION1)(OPTION2)...(OPTIONX)
- (+) means you have to be logged in to use the API method
    - If you are not, it will return a 403 forbidden
- All success response have the following format
```javascript
{
    message: "String message",
    data: "format specified in API (if not specified, is an empty object)"
}
```
- All error reponse have the following format
```javascript
{
    error: "'Error message string' or other format can be specified in API"
}
```

## Account Management
### Create an Account
#### /api/user/new (POST)
Request body 
```javascript
{
    email: "some@email.com", 
    password: "somepassword", 
    username: "someusername",
    action: "register"
}
```
- client must verify password confirmation
- success: 200 OK
- error: 409 Conflict
    - body will contain {error: ""}
    - Username already in use, or email already in use
- Body of response: {id}
    - id is unique identifier (randomly generated)

### Change Password
#### /api/user/update-password (PUT)(+)
Request body 
```javascript
{
    old: "oldpassword",
    new: "newpassword"
}
```
- client must verify password confirmation
- Success: 200 Ok
- Error: 500 Internal Server Error
    - Something bad happened
- Error: 403 Forbidden
    - If user isn't logged in or bad old password

### Log into Account
#### /api/user/login (POST)
Request body
```javascript
{
    identifier: "username or email", 
    password: "userpassword"
}
```
- Success: 200 OK
    - Contains cookie with session id
- Error: 401 Unauthorized
    - Will occur with invalid credentials

### Log Out
#### /api/user/logout (POST)
- Success:200 OK
- Error: 403 Forbidden

## Faction
### Sending a faction
#### /api/factions/send (POST)(+)
Request body
```javascript
{
    to:["username1", "username2", "..."], // array of usernames
    faction : "The story itself",
    fact: true, // or false, boolean type
    commentsEnabled: true // or false, boolean type, (optional, if not sent, assumed to be true)
} 
```
- Success: 201 Created
    - data attribute contains {factionId}, uniquely generated ID to identify the faction
- Error: 400 Bad Request
    - No sender included
    - No fact sent
    - No faction sent
    - No recipients sent
    - No valid recipients sent
- Error: 500 Internal Server Error
    - Error returned

### Associate an Image with a Faction
#### /api/factions/upload-image (POST)(+)
Request body: multipart/form-data
- contains 'image' and 'factionId'
- Success: 200 OK
    - data attribute contains confirmation that the image was uploaded
- Error: 400 Bad request
    - No image provided
    - Person posting to the endpoint is not the person who created the faction
    - An image has already been associated with this faction
- Error: 500 Internal Server Error
    - Error returned

### Sending Response to a Faction
#### /api/factions/respond (POST)(+)
Request body
```javascript
{
    factionId: "Unique faction ID", 
    userResponse: true //or false, boolean response
}
```
- Success: 200 OK
    - data attribute {isRight}, which is a boolean containing whether the user's answer was correct
- Error: 400 Bad Request
    - Tried to answer your own faction
    - You have already answered this faction
    - You need to provide a response
    - You need to provide a faction id
- Error: 500 Internal Server Error
    - Error returned

### Deleting a faction
#### /api/factions/delete (POST)(+)
Request Body
```javascript
{
    factionId: "Unique faction ID"
}
```
- Note that if a delete request is sent to a faction that is already deleted, no change will be made.
- Success: 200 OK
    - data attribute: empty
- Error: 400 Bad Request
    - Tried to delete a faction that does not exist (invalid factionId)
    - No factionId provided
- Error 500 Internal Server Error
    - Error returned

### Posting a comment to a faction
#### /api/factions/add-comment (POST)
Request body

```javascript
{
    factionId: "Unique faction ID",
    content: "Content of the comment to be posted on the faction."
}
```

- Success: 201 created
Response body

```javascript
{
    commentId: "Unique comment ID",
}
```
- Error: 400 Bad Request
    - if any input is not provided
    - invalid faction ID
    - Comments for the faction are disabled
    - username not part of the faction recipients
    - content is empty (if it only contains spaces, tabs, newlines is also considered empty)
    - content is too big, max length is 1000 characters.
- Error 500 Internal Server Error
    - Error returned


### Enabling and disabling of comments in a faction
#### /api/factions/enable-comment (PUT)
Request body
```javascript
{
    factionId: "Unique faction ID",
    enabled: true // or false, as a boolean type
}
```

- Success: 200 OK
Response body
- Error: 400 Bad Request
    - factionId not provided
    - invalid faction ID
    - enabled was not sent
    - user is not the owner (sender) of that faction.
- Error 500 Internal Server Error
    - Error returned

## User info flow and update control
- (1) means data is sent only once
- (*) means data is sent as long as no action takes place to change it

### Getting all user information
#### /api/user/info (GET)(+)
- Success: 200 OK
Response body

```javascript
{
    groups: [],  // (*) array of the users groups {name, groupId, friends}
    friends: [], // (*) username strings of all your friends (includes acceptedFriendRequests)
    receivedFriendRequests: [], // (*) username strings (they are awaiting an answer from you)
    acceptedFriendRequests: [], // (1) username strings (they are your new friends)
    factionsReceived: [], // (*) array of {sender, story, fact, factionId, createdAt, commentsEnabled, comments, imageUrl (optional)}
    factionsSent: [], // (*) an array of {recipients, story, fact, factionId, createdAt, commentsEnabled, comments, imageUrl (optional) }
    pendingFactions: [], // (*) an array of {sender, story, fact, factionId, createdAt, commentsEnabled, comments, imageUrl (optional)}
    /* 
        For factionsReceived, factionsSent and pendingFactions
        - sender is a username string
            - recipients is an array of strings
        - story is a string
        - fact is a boolean
        - factionId is string
        - createdAt is a date
        - commentsEnabled is a boolean
        - comments is [ { commentId, factionId, commenter, content, createdAt } ]
        - imageUrl is a string
    */
    factionResponses: [], // (1) an array of {factionId, responderUsername, response} that are responses to your sent factions
    /* 
        factionId is a string
        responderUsername is a string // (TODO: check, maybe only send counts for fact/fiction)
        response is a boolean
    */
    updateTimestamp: "some date" // (*) string containing a date
}
```
- Error: 500 Internal Server Error
    - error returned

### Updating
#### /api/user/update (POST)(+)
- Body of request contains {updateTimestamp, viewedFactions: []}
    - updateTimestamp is string identical sent in the last /api/user/info or /api/user/update
    - viewedFactions is an array of faction IDs from pendingFactions that were seen by the user
- Success: 200 OK
Response body

```javascript
{
    receivedFriendRequests: [], // (*) username strings (they are awaiting an answer from you)
    acceptedFriendRequests: [], // (1) username strings (they are your new friends)
    pendingFactions: [],        // (*) array of {sender, story, fact, factionId, createdAt, commentsEnabled, comments, imageUrl (optional)}
    /* 
        sender is a username string
        story is a string
        fact is a boolean
        factionId is string
        commentsEnabled is a boolean
        createdAt is a date
        commentsEnabled
        comments is [ { commentId, factionId, commenter, content, createdAt } ]
        imageUrl is a string
    */
    factionResponses: [],       // (1) an array of {factionId, responderUsername, response} that are responses to your sent factions
    /* 
        factionId is a string
        responderUsername is a string // (TODO: check, maybe only send counts for fact/fiction)
        response is a boolean
    */
    updateTimestamp: "somedate" // (*) string containing a date
}
```

- Error: 400 Bad Request
    - Something wrong with the user's session
- Error: 500 Internal Server Error
    - Something wierd happened
    - Error returned

## Friends
### Sending a Friend Request
#### /api/user/request-friend (POST)(+)
Request body
```javascript
{
    username: "someusername"
}
```
- Success: 200 OK
    - Already friends with user
    - User already added you, therefore you are now friends
- Success: 201 Created
    - Created friend request
- Error: 400 Bad Request
    - Username of friend is invalid
    - Cannot add yourself
    - Friend request already posted
    - Already friends with user
- Error: 500 Internal Server Error
    - return error

### Responding to a Friend Request
#### /api/user/accept-friend (POST)(+)
Request body
```javascript
{
    username: "someusername", 
    accepted: true // or false, boolean type
}
```

- Success: 200 OK
    - Case accepted was true
        - Already friends with user
        - Successfully added user
    - Case accepted was false
        - Successfully removed friend request from user
- Error: 400 Bad Request
    - Cannot add yourself
    - Username provided is invalid
- Error: 500 Internal Server Error
    - return error

### Deleting a friend
#### /api/user/delete-friend (DELETE)(+)
Request body
```javascript
{
    username: "someusername"
}
```

- Success: 200 OK
    - Successfully removed user from friend's list
    - User was already not your friend
- Error: 400 Bad Request
    - Tried to remove himself
- Error: 500 Internal Server Error
    - return error

### Getting top 3 friends
#### /api/user/top-three (GET)
- No query parameters required
- Success: 200 OK
    - Response:
        ```
        {
            topThree: ["usernameNumber1", "usernameNumber2", "usernameNumber3"] 
        }
        ```
    - If user has fewer than 3 friends, then the top 1 or 2 friends are shown, also in order
- Error: 500 Internal Server Error
    - return error

## User utilities
### Getting all factions related to user
#### /api/user/factions (GET)(+)
- Success: 200 OK
    - data attribute of body contains JSON object {sent: [], received: []}
        - sent is an array of {sender: username string,story,fact,id, commentsEnabled, createdAt, imageUrl (optional)}
        - received is an array of {sender: your user id,story,fact,id, commentsEnabled, createdAt, imageUrl (optional)}
- Error: 500 Internal Server Error
    - error returned

### Getting user's friends
#### /api/user/friends (GET)(+)
- Success: 200 OK
    - data attribute contains JSON array containing a list of your friends' usernames
- Error: 500 Internal Server Error
    - error returned

### Searching for Users
#### /api/user/search (GET)(+)
- Optional query parameter search=""
    - search parameter to match all users in database
- Success: 200 OK
    - data attribute contains an array of JSON objects of the form:
```
{
    "username": "user",
    "email": "email@example.com"
}
```
- Error: 500 Internal Server Error
    - error returned

## Groups
### Create a Group
#### /api/group/create (POST)(+)
- JSON object containing name of group, and OPTIONAL array of friends in the group
```
{
    "name": "",   // REQUIRED: Name of group
    "friends": [] // OPTIONAL: Friends in the group, passed as usernames
}
```
- Success: 200 OK
    - data attribute:
        ```
        {
            "groupId": "",       // users groupID
        }
        ```
- Error: 400 Bad Request
    - No name included for group
- Error: 500 Internal Server Error
    - error returned

### Add a Friend to a Group
#### /api/group/add-friend (POST)(+)
- JSON object containing groupId and name of friend
```
{
    "groupId": "",      // REQUIRED: groupId
    "friend": ""        // Name of friend to add to group
}
```
- Success: 200 OK
    - successfully added friend to the group
- Error: 400 Bad Request
    - groupId is invalid
    - friend is not a friend of the user
- Error: 500 Internal Server Error
    - Error returned

### Remove a Group
#### /api/group/remove (DELETE)(+)
- JSON object containing groupId of group to delete
```
{
    "groupId": ""       // REQUIRED: groupId of group to delete
}
```
- Success: 200 OK
    - successfully deleted group
- Error: 400 Bad Request
    - groupId is invalid
- Error: 500 Internal Server Error
    - Error returned

### Remove a friend from a group
#### /api/group/remove-friend (DELETE)(+)
- JSON object containing groupId of group to delete
```
{
    "groupId": "",      // REQUIRED: groupId 
    "friend": "",       // REQUIRED: friend to remove from group
}
```
- Success: 200 OK
    - successfully removed friend from the group
- Error: 400 Bad Request
    - groupId is invalid
    - friend is not a friend of the user
- Error: 500 Internal Server Error
    - Error returned


