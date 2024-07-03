**Drawer API**

A RESTful API for managing user-specific items, built with Express and MySQL.

**Installation**
Clone the repository:

```
git clone https://github.com/RMitkus/drawer
cd drawer-api
```

Run Docker Compose:

Ensure you have Docker and Docker Compose installed on your system. Then run:

```
docker-compose up -d
```

Install dependencies:

```
npm install
```

Start the server:

```
npm run watch
```

**Usage**
The API will be running on `http://localhost:3000`.

**Authentication**
All endpoints require a valid `userId` and `secret` sent as headers:

- `drawer-user-id`
- `drawer-secret`

**API Endpoints**
**User Endpoints**
Create a user

```js
POST /users/add
```

Body:
```js
{
    "email": "user@example.com",
    "name": "User Name"
}
```

Update a user

```js
PUT /users/update/
```
Body:
```js
{
    "email": "user@example.com",
    "name": "User Name"
}
```

Delete a user

```js
DELETE /users/delete/
```

**Drawer Endpoints**
Get all items for a user

```js
GET /drawer/all
```

Get a specific item for a user

```js
GET /drawer/item/
```

Add an item

```js
POST /drawer/add
```
Body:
```js
{
    "item": "item_name",
    "count": 10
}
```

Update item count

```js
PUT /drawer/item/add/
PUT /drawer/item/subtract/
```

Delete all items for a user

```js
DELETE /drawer/all-items
```

Delete a specific item

```js
DELETE /drawer/item/
```

**Error Handling**
Errors are returned in the following format:

```js
{
    "status": 400,
    "message": "Error message"
}
```