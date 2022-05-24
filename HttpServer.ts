import express from "express";
import morgan from "morgan";

export class HttpServer {

  public StartServer = (port = 3000) => {
    const httpServer = express();

    httpServer.use(morgan('combined'));
    httpServer.listen(port);

    return httpServer;
  }

}