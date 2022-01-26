# Socket.io Starter Project
## A simple "game", made with Node.js, Socket.io, Pixi.js, and Typescript

Info:
- The client and server are fully seperate projects
- The client and server representation of entities, players, etc will be different, because the server doesn't need to know anything graphical/Pixi.js related
- The player is the only entity by default, but a base entity class is provided to make it quick to add new networked objects
- The player is controlled by clients, but most entities should be controlled by the server, and therefore simpler
- To transfer data between client and server, there are specific "Event" types meant to work for a certain event, and broad "Data" types meant to work for a certain entity