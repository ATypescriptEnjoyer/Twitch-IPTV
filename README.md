# Twitch IPTV
### A lightweight TwitchTV IPTV Tuner for use with Plex

## How to use

- Update `streamers.json` with streamers you enjoy watching, adding a friendly name and their twitch username in the fields.
- Create a `twitch_creds.json` file and add the credentials you get from Twitch: 
  - Twitch Dev Console: https://dev.twitch.tv/console
  - Guide for how Twitch-IPTV does auth: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth#client-credentials-grant-flow
Your twitch creds JSON file should look like this:
```
{
    "client_id": "Your Client ID",
    "client_secret": "Your Client Secret",
    "grant_type": "client_credentials"
}
```

- From there run the docker-compose.yml, remember to update the network to use if you're also running plex via Docker, as you'll want them to be in the same subnet for access internally. If you're accessing externally, don't forget to port forward `3000`.
- On Plex:
  - go to `Settings -> Manage -> Live TV & DVR (may require plex pass, i'm not sure...)`
  - Click on "SET UP PLEX DVR"
  - ![image](https://user-images.githubusercontent.com/8694395/170112182-f61b2077-4787-41f4-99a2-5a9a759a80d8.png)
  - Click on "Don't see your HDHomeRun device? Enter its network address manually" and enter either your IP if external or `http://twitch-iptv:3000/` if you're using the provided `docker-compose.yml` file.
  - After a few seconds it should find the Twitch IPTV tuner, click on "Have an XMLTV guide on your server? Click here to use it."
  - ![image](https://user-images.githubusercontent.com/8694395/170112482-d8476cf6-9cc5-43e9-aa5b-80a028413173.png)
  - Set the language to English if it isn't already, and set the XMLTV guide URL to `http://twitch-iptv:3000/xmltv.xml`, or `your IP:3000/xmltv.xml`, again depending on your method.
  - Click next, then continue, and everything should be setup!
