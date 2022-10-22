import Discord from "discord.js"
import { REST, Routes } from "discord.js"
import config from "./config.json" assert {type: "json"}

if (!config.token) {
	console.log("Please put the bot token into the config.json file.")
	process.exit(0)
}

const commands = [{
	name: "vctimer",
	description: "kicks everyone out of a channel or all channels after set amount of hours",
	options: [{
		type: 3,
		name: "time",
		description: "time until kick. formats: 4.5 or 4.5h or 4h 30min or 4:30 or 270min",
		required: true
	}, {
		type: 7,
		name: "channel",
		description: "voice channel. all channels in guild by default.",
		required: false,
		channel_types: [2]
	}]
}]

const rest = new REST({version: "10"}).setToken(config.token)

try {
	console.log('Started refreshing application (/) commands.')
	await rest.put(Routes.applicationCommands(config.client_id), { body: commands },)
	console.log('Successfully reloaded application (/) commands.')
} catch (error) {
	console.error(error)
}

const client = new Discord.Client({
	intents: [1<<0, 1<<1, 1<<7]
})

const schedules = new Set()

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`)

	setInterval(async () => {
		let scheds = Array.from(schedules)
		for (let sched of scheds) {
			if (Date.now() < sched.t) continue

			schedules.delete(sched)
			let guild = await client.guilds.fetch(sched.guild)

			if (!sched.channel) {
				let channels = await guild.channels.fetch()

				for (let c of channels.values()) {

					if (c.type != 2) continue // 2 is GUILD_VOICE
					for (let m of c.members.values()) {
						m.voice?.disconnect("scheduled channel kick")
					}

				}
			} else {
				let c = await client.channels.fetch(sched.channel)
				if (!c.members) continue
				for (let m of c.members.values()) {
					m.voice?.disconnect("scheduled channel kick")
				}
			}
		}
	}, 1000)
})

client.on("interactionCreate", async i => {
	if (!i.isChatInputCommand()) return
	if (i.commandName != "vctimer") return

	const time = i.options.getString("time")
	const channel = i.options.getChannel("channel")

	let mins = 0
	if (!isNaN(time)) mins = Number(time) * 60
	else if (time.endsWith("h")) {

		let t = time.substring(0, time.length-1)
		if (!isNaN(t)) mins = Number(t) * 60
		else return i.reply("Invalid syntax.")

	} else if (time.endsWith("min")) {

		let t = time.substring(0, time.length-3)
		if (!isNaN(t)) mins = Number(t)
		else return i.reply("Invalid syntax.")

	} else if (time.includes(":")) {

		let t = time.endsWith("h") ? time.substring(0, time.length-1) : time
		let a = t.split(":")
		if (a.length != 2 || isNaN(a[0]) || isNaN(a[1])) return i.reply("Invalid syntax.")
		mins = Number(a[0]) * 60 + Number(a[1])

	} else {

		let a = time.split(" ")
		if (a.length != 2) return i.reply("Invalid syntax.")
		let h   = a[0].endsWith("h")   ? a[0].substring(0, a[0].length-1) : a[0]
		let min = a[1].endsWith("min") ? a[1].substring(0, a[1].length-3) : a[1]
		if (isNaN(h) || isNaN(min)) return i.reply("Invalid syntax.")
		mins = Number(h) * 60 + Number(min)

	}

	const t = Date.now() + mins*60*1000

	schedules.add({
		t,
		guild: i.guildId,
		channel: channel?.id
	})

	i.reply({embeds: [{
		title: "Scheduled channel kick!",
		fields: [{
			name: "Time",
			value: `${formatTime(mins)} (<t:${Math.floor(t/1000)}:R>)`,
			inline: true
		}, {
			name: "Channel",
			value: channel ? `<#${channel.id}>` : "whole guild",
			inline: true
		}]
	}]})
})

function formatTime(mins) {
	if (mins < 60) return `${mins}min`
	if (mins % 60 == 0) return `${mins/60}h`
	return `${Math.floor(mins/60)}h ${mins % 60}min`
}

client.login(config.token)