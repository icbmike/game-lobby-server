import { Express } from "express";
import { getLobbies, getLobby, newLobby } from "../lobbyStore";
import { v4 } from "uuid";

export const configureHandlers = (app: Express) => {

  app.get("/lobbies", (req, res) => {
    res.json(getLobbies());
  })

  app.post("/lobbies", (req, res) => {
    const lobby = newLobby(req.body.lobbySize);

    res.json(lobby);
  });

  app.get("/lobbies/:code", (req, res) => {
    const lobby = getLobby(req.params.code);
    if (lobby) {
      res.json(lobby);
    } else {
      res.status(404).send("Lobby not found");
    }
  });

  app.post("/lobbies/:code/players", (req, res) => {
    const lobby = getLobby(req.params.code);
    if (!lobby) {
      return res.status(404).send("Lobby not found");
    }

    const newPlayerName: string = req.body.name;

    if (!newPlayerName) {
      return res.status(400).send("name missing");
    }

    if (lobby.players.find(p => p.name === newPlayerName)) {
      return res
        .status(400)
        .send(`Player with name: ${newPlayerName} already in lobby`);
    }

    if (lobby.lobbySize && lobby.players.length >= lobby.lobbySize) {
      return res
        .status(400)
        .send(`Lobby is full. Lobby size: ${lobby.lobbySize}`);
    }

    lobby.players.push({
      name: newPlayerName,
      id: v4()
    });
    res.json(lobby);
  });

  app.delete("/lobbies/:code/players/:id", (req, res) => {
    const lobby = getLobby(req.params.code);
    if (!lobby) {
      return res.status(404).send("Lobby not found");
    }

    lobby.players = lobby.players.filter(p => p.id !== req.params.id);

    res.json(lobby);
  });
};
