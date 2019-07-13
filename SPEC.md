# Channels specification

## Channel state

Channel is an ordered collection of items.

Channel state represented as JSON:

```json
{
  "spec": "channels",
  "doc": "state",
  "version": "0.1",
  "uri": "https://www.example.com/channels/ch1",
  "stylesheet": true,
  "title": "Sample channel",
  "items": {
    "12344": {
      "id": 12344,
      "prev": 12343,
      "next": 12345,
      "type": "text",
      "created": "2019-07-13T12:13:22.222Z",
      "updated": "2019-07-13T12:13:32.000Z",
      "data": {
        "text": "Hello world"
      }
    },
    "12345": {
      "id": 12345,
      "prev": 12344,
      "type": "image",
      "created": "2019-07-13T12:13:27.000Z",
      "data": {
        "uri": "https://example.com/img/image.png"
      }
    }
  ],
  "changes": [
    {
      "id": 123456,
      "ts": "2019-07-13T12:13:32.000Z",
      "patch": [
        {
          "op": "replace",
          "path": "/items/12344/data/text",
          "value": "Hello world"
        }
      ]
    }
  ]
}
```

This specification defines the protocol for concurrent channel state updates by multiple clients/participants using operational transformations based on JSON patch specification ([RFC6902](https://tools.ietf.org/html/rfc6902)).


## Channel view

Channel view is defined as an extended HTML. Each item type has a fixed representation in HTML to allow using CSS to style them.

```html
<channel>
  <chead>
    <link href="" rel="canonical">
  </chead>
  <ctitle>Sample channel</ctitle>
  <items>
    <item id="12344">
      <text>Hello world</text>
    </item>
    <item id="12345">
      <img src="https://example.com/img/image.png" />
    </item>
  </items>
</channel>
```


## Channel server, access and embedding in web-pages

Channel can be available at a certain network URL. Channel URL should not contain file extension. A specific extension can be used to define which document to load: state (.json), view (.html) or stylesheet (.css).

If a web browser requests the channel from URI `https://www.example.com/channels/ch1`, channel server should wrap it in a web-page:

```html
<html>
  <head>
    <script src="channels.js"></script>
  </head>
  <body>
    <channel src="https://www.example.com/channels/ch1" />
  </body>
</html>
```


Channel can be embedded into another web page in a similar way:

```html
<html>
  <head>
    <script src="channels.js"></script>
  </head>
  <body>
    <h1>My channel</h1>
    <channel src="https://www.example.com/channels/ch1" />
  </body>
</html>
```

The channel element will display a defined (or default) number of the latest items and will subscribe to channel updates via web-socket on the same URI.


## Channel updates

When channel state changes, channel server will send updates to the channel state to the connected clients via web-socket on the same URI as the channel state.

```json
{
  "changes": [
    {
      "id": 123456,
      "ts": "2019-07-13T12:13:32.000Z",
      "patch": {
        "op": "replace",
        "path": "/items/12344/data/text",
        "value": "Hello world"
      }
    }
  ]
}
```

The client should check that it has the previous update and apply the latest update (or to request the missing updates).

Connected clients (if they have permissions) can send updates to the channel state via the same websocket connection:

```json
{
  "change_received": 123456,
  "changes": [
    {
      "change_request": "123e4567-e89b-12d3-a456-426655440000",
      "patch": [
        {
          "op": "add",
          "path": "/items/12345/data/width",
          "value": "320"
        }
      ]
    }
  ]
}
```

As multiple clients can send the updates, operational transformations are used to update the channel state.

The server will respond with the acknolegment, the status of each requested change/operation can be "accepted", "transformed" and "rejected":

```json
{
  "changes": [
    {
      "id": 123457,
      "ts": "2019-07-13T12:13:35.000Z",
      "patch": [
        {
          "op": "replace",
          "path": "/items/12344/next",
          "value": 12346
        },
        {
          "op": "replace",
          "path": "/items/12345/prev",
          "value": 12346
        },
        {
          "op": "add",
          "path": "/items/12346",
          "value": {
            "id": 12346,
            "prev": 12344,
            "next": 12345,
            "type": "text",
            "created": "2019-07-13T12:13:35.000Z",
            "data": {
              "text": "Hello too"
            }
          }
        }
      ]
    },
    {
      "index": 123458,
      "ts": "2019-07-13T12:13:40.000Z",
      "change_request": "123e4567-e89b-12d3-a456-426655440000",
      "status": "accepted",
      "patch": [
        {
          "op": "add",
          "path": "/items/12345/data/width",
          "value": "320"
        }
      ]
    }
  ]
}
```

Note that while item index and the way it's addressed with standard JSON patch
