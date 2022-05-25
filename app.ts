import { HttpServer } from "./HttpServer";
import { GenerateTwitchAccessToken, Twitch } from "./Twitch";
import fs from "fs";
import YTDlpWrap from "yt-dlp-wrap";
import { create } from "xmlbuilder2";
import moment from "moment";
import { randomUUID } from "crypto";

const GetStreamersArray = (): {friendlyName: string, twitchName: string}[] => {
  return JSON.parse(fs.readFileSync("./streamers.json").toString());
}

const Main = async (): Promise<void> => {
  const token = await GenerateTwitchAccessToken();
  const TwitchApi = new Twitch(token);
  const server = new HttpServer();
  const app = server.StartServer();

  app.get("/discover.json", (_, res) => {
    const channelCount = GetStreamersArray().length;
    const tunerCount = 3; //TODO: create config file.
    const response = {
      "FriendlyName": "Twitch IPTV",
      "ModelNumber": "1",
      "FirmwareName": "twitchiptv",
      "FirmwareVersion": "1",
      "DeviceID": randomUUID().split("-")[0],
      "DeviceAuth": "",
      "BaseURL": "http://twitch-iptv:3000",
      "LineupURL": "http://twitch-iptv:3000/lineup.json",
      "NumChannels": channelCount,
      "TunerCount": tunerCount
    };
    res.send(response);
  });

  app.get("/lineup.json", (_, res) => {
    const streamers = GetStreamersArray();
    const streamersResponse = streamers.map((streamer) => ({
      GuideName: streamer.friendlyName,
      GuideNumber: streamer.twitchName,
      URL: `http://twitch-iptv:3000/stream/${streamer.twitchName}`
    }))
    res.send(streamersResponse);
  });

  app.get("/lineup_status.json", (_, res) => {
    res.send({
      "ScanInProgress": 0,
      "ScanPossible": 0,
      "Source": "Cable",
      "SourceList": [
        "Cable"
      ]
    });
  });

  app.get("/xmltv.xml", async (_, res) => {
    const root = create({ version: "1.0", encoding: "ISO-8859-1" }).ele('tv');
    const streamers = GetStreamersArray();
    const streamerIds = streamers.map((streamer) => streamer.twitchName);
    const streamersInformation = await TwitchApi.GetStreamerInformation(streamerIds);
    const streamersStreamInformation = await TwitchApi.GetStreamInformation(streamerIds);
    streamers.forEach((streamer) => {
      const info = streamersInformation.find((info) => info.login === streamer.twitchName);
      const stream = streamersStreamInformation.find((streamInfo) => streamInfo.user_login === streamer.twitchName);
      const id = streamer.twitchName;
      root.ele("channel", { id })
      .ele("display-name", { lang: "en", }).txt(streamer.friendlyName).up()
      .ele("icon", { src: info.profile_image_url }).up()
      .up();

      const streamStartDate = stream ? moment(stream.started_at) : moment();
      let streamEndDate = moment(streamStartDate).add(12, "hours");
      if(streamEndDate.isBefore(moment())) {
        streamEndDate = moment().add(12, "hours");
      }
      const format = "YYYYMMDDHHmmss +0100";
      const streamTitle = stream ? stream.title : `${streamer.friendlyName} is offline.`;
      const category = stream ? stream.game_name : "Offline";
      root.ele("programme", { channel: id, start: streamStartDate.format(format), stop: streamEndDate.format(format) })
      .ele("title", { lang: "en" }).txt(streamTitle).up()
      .ele("desc", { lang: "en" }).txt(info.description).up()
      .ele("date").txt(moment().format("YYYYMMDD")).up()
      .ele("category", { lang: "en" }).txt(category).up()
      .up()
    });
    const xml = root.end({ prettyPrint: true });
    res.set('Content-Type', 'text/xml');
    res.send(xml);
  })

  app.get("/stream/:streamer", async (req, res) => {
    const { streamer } = req.params;
    const streamersStreamInformation = await TwitchApi.GetStreamInformation([streamer]);
    if (streamersStreamInformation.length > 0) {
      const dlp = new YTDlpWrap("./yt-dlp");
      const stream = dlp.execStream([
        `https://twitch.tv/${streamer}`,
        '-f',
        'best[ext=mp4]'
      ]);
      stream.pipe(res);
    }
    else {
      res.status(503).send(); //streamer offline but guide hasn't refreshed.
    }
  });
}

Main(); // I Miss C# :'(

