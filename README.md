# channelkickbot
Discord bot I made form u/HelplessxDragon on Reddit that disconnects everyone from voice after set amount of time

### Installation
```sh
> git clone https://github.com/j0code/channelkickbot.git
> cd channelkickbot
```
Now, create a file called "config.json":
```json
{
  "token": "INSERT TOKEN HERE",
  "client_id": "INSERT APPLICATION ID HERE"
}
```
To run it, execute
```sh
> node .
```

### Usage
`/vctimer <time> [channel]`<br>
`time` specifies how long to wait<br>
`channel` specifies the voice channel, default: all channels in guild<br>
Once time is up, the bot will attempt to disconnect everyone in the channel/guild.

### Permissions and Intents
The bot needs the Server Members Privileged Intent:
![image](https://user-images.githubusercontent.com/42189560/197356663-26e66bcc-33ac-4d67-8226-e2fe8f95dc29.png)
#### Permissions
- Send Messages
- Embed Links
- Move Members

Permissions Integer: `16795648`
