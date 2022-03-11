require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
const PREFIX = '?'; // Prefix used to invoke commands
const TOKEN = process.env.TOKEN;
const TOKEN2 = process.env.NitraToken;
const servUser = process.env.ID2;
const servID = process.env.ID1;
const mPW = process.env.MONGO_ATLAS_PW;
const mUser = process.env.MONGO_USER;
const mDB = process.env.MONGO_DB;
const mcluster = process.env.MONGO_CLUSTER;
const { isNull } = require('util');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
var moment = require('moment-timezone');
var data = [], data2 = [], tRef = 0;
let logDt = " ", dt = new Date();
console.log(`This is dt: ${dt}`);
var nextDay = Boolean, feedStart = Boolean;
var readline = require('readline');
const { createSecureServer } = require('http2');
const { triggerAsyncId } = require('async_hooks');
const { toASCII } = require('punycode');
var phrase1 = ">) killed by ", phrase2 = "AdminLog started on ", phrase3 = "from", phrase4 = "connected", phrase5 = "disconnected";




bot.on('message', async message=> {
	let args = message.content.substring(PREFIX.length).split(" ");
    const auserId = message.member.id;
    const guildId = message.guild.id;
    const guildName = message.guild.name;

	//Specifiy mentioned user credentials
    let firstMentioned = message.mentions.users.first();
    if (firstMentioned === undefined){
        return; //Do not proceed, there is no user
    }
    let musername = firstMentioned.username;
    let muserId = firstMentioned.id;
    if (!message.guild) return;
    if (message.author.bot) return; // This closes the rest of the script if the bot sends the message....bot can't have account
	
	switch(args[0]){
        //Delete all PVP records
		case 'purge':
            if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
			KillFeed.deleteMany({guildId: guildId}, (err, killFeed) => {
				if(err) console.log(err);
				if(!killFeed) {
					console.log('Failed');
					return;
				}else {
					console.log('Success');				}
			})
        break;
        
        case 'reset':
			if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
            KillFeed.updateMany({guildId: guildId}, {$set: {numDeaths: 0, numKills: 0
			, kd: 0, longestShot: 0, killed: "No Data"
			,lastspawn: `${moment().toISOString(true)}`
			, killedBy: "No Data", weapon: "No Data"
			, tok: 0, timeAlive: "No Data", bounty: 0, location: "No Data"}}, {new:true}
			,function (err, doc) {
				if (err) {
					console.log("update error");
					message.channel.send("A error has occured! Please try again.")
				}else{
					console.log("update success");
					message.channel.send(`**All PVP record Stats have been successfully reset!**`).then (message => message.delete({ timeout: 5000, }))
				}
			});
        break;

		//Delete individual PVP record
        case 'delete':
            if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
            if (!args[1]) {
                message.channel.send('Please specify a Survivor!').then (message => message.delete({ timeout: 5000, }))
                return;
            }  
			KillFeed.findOneAndDelete({userId: muserId, guildId: guildId}, (err, killFeed) => {
				if(err) console.log(err);
				if(!killFeed) {
					message.channel.send('No PVP record Found!').then (message => message.delete({ timeout: 5000, }));
					return;
				}else {
					message.channel.send(`**${musername}**'s PVP record has been deleted!`).then (message => message.delete({ timeout: 5000, }));
				}
			})
		break;
	}
})

//Member commands
bot.on('message', async message=> {
    const guildId = message.guild.id;
    const guildName = message.guild.name;
	const msg = message.content.toUpperCase(); // Take the message, and make it all uppercase so nothing is case sensitive
    const args = msg.substring(PREFIX.length).split(" ");
    const ausername =  message.author.username;
    const auserId = message.member.id;

	switch(args[0]){
		//Unlink GamerTag from KillFeed Record **K1NG**
		case 'UNLINK':
			KillFeed.findOneAndDelete({userId: auserId, guildId: guildId}, (err, killFeed) => {
				if(err) console.log(err);
				if(!killFeed) {
					message.channel.send('No PVP record Found!').then (message => message.delete({ timeout: 5000, }));
				}else {
					message.channel.send(`**${ausername}**'s PVP record has been un-linked!`).then (message => message.delete({ timeout: 5000, }));
				}
			});
		break;

		//Get Survior Stats
		case 'STATS':
            KillFeed.findOne({userId: auserId, guildId: guildId}, (err, gamerTag) => {
				if(err) console.log(err);
				KillFeed.findOne({userId: auserId, guildId: guildId}, (err, killFeed) => {
					if(err) console.log(err);
					if(!killFeed) {
						message.channel.send('No PVP record found... Create your records!  (!link**#**YourGamerTag**#**)')
						return;
					}
                    killFeed.timeAlive = moment(`${killFeed.lastspawn}`).from(moment());
					killFeed.save().catch(err => console.log(err));
					const attachment = new Discord.MessageAttachment('./images/Survivor.png', 'Survivor.png');
					const embed = new Discord.MessageEmbed()
					.setColor(0xDD0000)
					.setTitle(`**${guildName}** PVP STATS`)
					.attachFiles(attachment)
					.setThumbnail('attachment://Survivor.png')
					.addField('Survivor', `${gamerTag.gamerTag}`)
					.addFields(
						{name: `**Kills**`, value: `${killFeed.numKills}`, inline: true},
						{name: `**Deaths**`, value: `${killFeed.numDeaths}`, inline: true},
						{name: `**K/D**`, value: `${killFeed.kd}`, inline: true},
						{name: `**Current Life Start**`, value: `${killFeed.timeAlive}`},
						{name: `**Longest Shot**`, value: `${killFeed.longestShot} meters`},
						{name: `**Last Kill**`, value: `${killFeed.killed}`, inline: true},
						{name: `**Killed By**`, value: `${killFeed.killedBy}`, inline: true},
						// {name: `**Bounty**`, value: `${killFeed.bounty}`},
					)
					message.channel.send(embed);
                })
            })
		break;

		//Get LeaderBoard Stats
		case 'KLB':
				KillFeed.find({guildId: guildId}).sort([
					['numKills', 'desc']
				]).exec((err, killfeed) => {
					if(err) console.log(err);
					let embed = new Discord.MessageEmbed()
					const attachment = new Discord.MessageAttachment('./images/crown.png', 'crown.png');
					embed.setTitle('**__Most Kills Leaderboard__**')
					.attachFiles(attachment)
					embed.setThumbnail('attachment://crown.png')
					let rank = '';
					let userNames = '';
    				let kills = '';
					//let leaderboard = '';
					//if there are no results
					if (killfeed.length === 0){
						embed.setColor("0xDD0000");
						embed.addField('No data found')
					} else if (killfeed.length < 10){
						//Less than 10 results
						embed.setColor(0xDD0000);
						for (i = 0; i < killfeed.length; i++) {
							userNames = (`${i + 1}` + '. ' + `${killfeed[i].gamerTag}`);
							Pstats = (`Kills: ` + `${killfeed[i].numKills}` + `\ ` + `\ ` + `\ ` + ` | ` + `\ ` + `\ ` + `\ ` + `Longest Shot: ` + `${killfeed[i].longestShot}`);
							embed.addField(userNames, Pstats);
							//embed.addField('Kills', `${killfeed[i].numKills}`)
							//embed.addField('${i + 1}. ${killfeed[i].gamerTag}', '**KILLS**: ${killfeed[i].numKills}');
						}
					} else {
						//more than 10 results
						embed.setColor(0xDD0000);
						for (i = 0; i < 10; i++) {
							//rank += `${i + 1}`;
							userNames = (`${i + 1}` + '. ' + `${killfeed[i].gamerTag}`);
							Pstats = (`Kills: ` + `${killfeed[i].numKills}` + `\ ` + `\ ` + `\ ` + ` | ` + `\ ` + `\ ` + `\ ` + `Longest Shot: ` + `${killfeed[i].longestShot}`);
							embed.addField(userNames, Pstats);
     						//kills += `${killfeed[i].numKills}`;
							//leaderboard += (rank + '. ' + ' ' + ' ' + ' ' + userNames + ' ' + ' ' + ' ' + ' ' + kills + '\n');
							//let member = message.guild.members.get(killfeed[i].userID)
							//embed.addField('${i + 1}', `${killfeed[i].gamerTag}`, 'kills', `${killfeed[i].numKills}`)
							//embed.addFields(
							//{ name: `**Survivor**`, value: `${i + 1}. ${killfeed[i].gamerTag}`, inline: true},
							//{ name: `**Kills**`, value: `${killfeed[i].numKills} \n`, inline: true},
							//{ name: '\u200B', value: '\u200B' },
							//)
							//embed.addField('userNames', '**KILLS**: ${killfeed[i].numKills}');
							//embed.addField(userNames, `Kills: ${killfeed[i].numKills}`);
						}
					}
						//embed.setColor(0xDD0000);
						//embed.addFields(
							//{ name: 'Rank          Survivor          Kills', value: leaderboard},
							//{ name: 'Rank', value: rank, inline: true },
							//{ name: 'Survivor', value: userNames, inline: true },
							//{ name: 'Kills', value: kills, inline: true },
							//{ name: '\u200B', value: '\u200B' },
						//);
					message.channel.send(embed);
				})
		break;

		//Get Longest Shot LeaderBoard Stats
		case 'LONGLB':
				KillFeed.find({guildId: guildId}).sort([
					['longestShot', 'desc']
				]).exec((err, killfeed) => {
					if(err) console.log(err);
					let embed = new Discord.MessageEmbed()
					const attachment = new Discord.MessageAttachment('./images/crown.png', 'crown.png');
					embed.setTitle('**__Longest Shot Leaderboard__**')
					.attachFiles(attachment)
					embed.setThumbnail('attachment://crown.png')
					let rank = '';
					let userNames = '';
    				let kills = '';
					//if there are no results
					if (killfeed.length === 0){
						embed.setColor("0xDD0000");
						embed.addField('No data found')
					} else if (killfeed.length < 10){
						//Less than 10 results
						embed.setColor(0xDD0000);
						for (i = 0; i < killfeed.length; i++) {
							userNames = (`${i + 1}` + '. ' + `${killfeed[i].gamerTag}`);
							Pstats = (`Longest Shot: ` + `${killfeed[i].longestShot}` + `\ ` + `\ ` + `\ ` + ` | ` + `\ ` + `\ ` + `\ ` + `KD: ` + `${killfeed[i].kd}`);
							embed.addField(userNames, Pstats);
						}
					} else {
						//more than 10 results
						embed.setColor(0xDD0000);
						for (i = 0; i < 10; i++) {
							userNames = (`${i + 1}` + '. ' + `${killfeed[i].gamerTag}`);
							Pstats = (`Longest Shot: ` + `${killfeed[i].longestShot}` + `\ ` + `\ ` + `\ ` + ` | ` + `\ ` + `\ ` + `\ ` + `KD: ` + `${killfeed[i].kd}`);
							embed.addField(userNames, Pstats);
						}
					}
					message.channel.send(embed);
				})
		break;

		// Clear Messages (Owner and Admin Perms Only )
		case 'CLEAR':
			if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
			if (!args[1]) return message.reply('Error, please define number of messages to clear') .then (msg => msg.delete(5000))
			if (args[1] > 100) return message.channel.send('The max number of messages you can delete is 50') .then (msg => msg.delete(5000))
			if (isNaN(args[1])) return message.channel.send('You must use a number!') .then (msg => msg.delete(5000))
		    message.channel.bulkDelete(args[1])			
		break;

		//Start K1llFeed (Owner and Admin perms only)
		case 'K1LLFEED':
			if (!args[1]) return message.channel.send("Missing Server Argument!").then (message => message.delete({ timeout: 5000, }));
			if (args[1] === 'PAUSE') {
                if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
                feedStart = false;
                return;
            }
            if (args[1] === 'RESUME') {
                if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
                feedStart = true;
                return;
            } 
			if (args[1] === 'START'){
				if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
				feedStart = true;
				console.log("...working");
				message.channel.send("Starting **K1LLFEED**....").then (message => message.delete({ timeout: 5000, }));
				setInterval(function() {
					var today = new moment().tz('America/New_York').format();
					let todayRef = today.slice(0, 10);
					if (feedStart === true) {
						axios.get('https://api.nitrado.net/ping')
						.then((res) => {
							if(res.status >= 200 && res.status < 300) {
								async function downloadFile () {
									// This function will request file that will contain download link for log
									const url1 = 'https://api.nitrado.net/services/'
									const url2 = '/gameservers/file_server/download?file=/games/'
									const url3 = '/noftp/dayzxb/config/DayZServer_X1_x64.ADM'
									const filePath = path.resolve('./logs', 'serverlog.ADM')
									const writer = fs.createWriteStream(filePath)
									const response = await axios.get(url1+`${servID}`+url2+`${servUser}`+url3,{ responseType: 'stream',  headers: {'Authorization' : 'Bearer '+`${TOKEN2}`, 'Accept': 'application/octet-stream'}})
									response.data.pipe(writer)
									return new Promise((resolve, reject) => {
										writer.on('finish', resolve)
										writer.on('error', reject)
									})					
								}
								downloadFile();
							}
								
						})
						.catch(function (error) {
							console.log(error);
						});	
						
						// Create a readable stream in order to parse log download link form file
						var rl = readline.createInterface({
							input: fs.createReadStream('./logs/serverlog.ADM')
 						});

						//Handle Stream events ---> data, end, and error// This will request download link and write result to new file
						rl.on('line', function (line) {
							const newURL = line.substr(44,91);
							axios.get(newURL)
							.then((res) => {
								const _log = res.data;
								fs.writeFile('./logs/log.ADM', _log, 'utf-8', (err) =>{
									if (err) throw err;
									console.log('Log Saved!')
								})				
							})			
						});
						rl.on('close', function() {
							return data;
						})
				
						rl.on('error', function(err) {
							console.log(err.stack);
						});

						// Create new readable stream// This will read new log file in order to parse k1llfeed data.
						var rl = readline.createInterface({
							input: fs.createReadStream('./logs/log.ADM')
			 			});
			 
			 			//Handle Stream events ---> data, end, and error// parses data for each line then passes data.
			 			rl.on('line', function (line) {
							if (line.includes(phrase1, 0)) {
								data.push(line.split(/[|"'<>()]/));
							}
							if (line.includes(phrase2, 0)) {
								logDt = line.slice(20, 30);
								console.log(`This is the logDate: ${logDt}`);
								console.log(`This is the current date: ${todayRef}`);
						   }
						   if (line.includes(phrase4, 0)) {
								console.log(`${line}`);
						   }
						   if (line.includes(phrase5, 0)) {
								console.log(`${line}`);
						   }
			 			});
			 
			 			rl.on('close', function() {
							return data;
			 			})
			 
			 			rl.on('error', function(err) {
							console.log(err.stack);
			 			});

						if (data) {
							for(let i = 0; i < data.length; i++){
								data2.push(data[i]);
								for ( val of data2){
									data2.forEach((val) => {
										if (val[15]){
											//Check for range of kill in message
											if (val[15].includes(phrase3)) {
												var f4 = val[15].split(" ");
												var f0 = val[0].toString();
												var f1 = val[10].toString();
												var f2 = val[2].toString();
												var f3 = val[15].toString();
												let f0a = f0.split(":")
												let yy = logDt.slice(0, 4);
												let mm = logDt.slice(5, 7);
												let dd = logDt.slice(8, 10);
												//Check for next day change not relected in logs.
												if (logDt < todayRef) {
													nextDay = true;
												}else {
													nextDay = false;
												}
												if (nextDay == true) {
													if (f0a[0] >= 00 && f0a[0] <= 07) {
														let ld = (dd - 0) + 1;
														dt.setFullYear(yy);
														dt.setMonth((mm - 0) - 1);
														dt.setDate(ld);
														
													}else {
														dt.setFullYear(yy);
														dt.setMonth((mm - 0) - 1);
														dt.setDate(dd);
													}
												}
												function getDate() {
													dt.setHours(f0a[0]);
													dt.setMinutes(f0a[1]);
													dt.setSeconds(f0a[2]);
												}
												getDate();
												data2.splice(0, data2.length);
												let dt0 = (dt.valueOf() / 1000);
												if(dt0 != tRef && dt0 > tRef) {
													console.log(`This is the kill ref date: ${dt}`);
													const attachment = new Discord.MessageAttachment('./images/crown.png', 'crown.png');
													const embed = new Discord.MessageEmbed()
													.attachFiles(attachment)
													.setThumbnail('attachment://crown.png')
													.setColor(0xDD0000)
													.setTitle('K1llFeed Notification')
													.setDescription(`${f0} **${f1}** Killed **${f2}** ${f3} `)
													message.channel.send(embed);//.then (message => message.delete({ timeout: 180000, }));
													console.log(`Kill Time-Stamp: ${dt}`);
													tRef = dt0;
													//Increases kill count of killer record
													KillFeed.findOne({gamerTag: f1, guildId: guildId}, (err, killFeed) => {
														if(err) console.log(err);
														if(!killFeed) {
															return;
														}else{
															if(dt0 != killFeed.tok && dt0 > killFeed.tok) {
																let countK = 0;
																var countD = 0;
																var TA = " ";
																var getKD = 0;
																var getShot = 0;
																getShot = f4[4];
																if (isNaN(getShot)) {
																	getShot = f4[5];
																}
																countK = killFeed.numKills += 1;
																countD = killFeed.numDeaths
																TA = killFeed.lastspawn;
																if (countD == 0) {
																	getKD = +((countK - 0).toFixed(2));
																}else {
																	getKD = +((countK / countD).toFixed(2));
																}
																var killInc = {gamerTag: f1, guildId: guildId}, updateKill = { $inc: {numKills: 1}};
																var conditionK = {gamerTag: f1, guildId: guildId}, updateK = { $set: {killed: f2}};
																var kd1 = {gamerTag: f1, guildId: guildId}, updateKD1 = { $set: {kd: getKD}};
																var conditionTA = {gamerTag: f1, guildId: guildId}, updateTA = { $set: {timeAlive: `${moment(TA).from(moment().toISOString(true))}`}};
																var tokInc = {gamerTag: f1, guildId: guildId}, updatetok = { $set: {tok: dt0}};
																var LS = {gamerTag: f1, guildId: guildId}, updateShot = { $set: {longestShot: parseFloat(getShot)}};
																async function killer(){
																	await KillFeed.updateOne(killInc, updateKill, {new : true}).exec();																	
																	await KillFeed.updateOne(conditionK, updateK, {new : true}).exec();
																	await KillFeed.updateOne(kd1, updateKD1, {new : true}).exec();
																	await KillFeed.updateOne(conditionTA, updateTA, {new : true}).exec();
																	await KillFeed.updateOne(tokInc, updatetok, {new : true}).exec();
																}
																killer()
																.catch(function (error) {
																	console.log(error);
																});

																if ((getShot - 0) > killFeed.longestShot) {
																	async function longShot(){
																		await KillFeed.updateOne(LS, updateShot, {new : true}).exec();
																	}
																	longShot()
																	.catch(function (error) {
																		console.log(error);
																	});
																}
															}
														}
													})
													//Increases death count of victim record
													KillFeed.findOne({gamerTag: f2, guildId: guildId}, (err, killFeed) => {
														if(err) console.log(err);
														if(!killFeed) {
															return;
														}else{
															if(dt0 != killFeed.tok && dt0 > killFeed.tok) {
																var countK2 = 0;
																var countD2 = 0;
																var TA2 = " ";
																var getKD2 = 0;
																countK2 = killFeed.numKills;
																countD2 = killFeed.numDeaths += 1;
																TA2 = killFeed.lastspawn;
																if (countD2 == 0) {
																	getKD2 = +((countK2 - 0).toFixed(2));
																}else {
																	getKD2 = +((countK2 / countD2).toFixed(2));
																}
																var deathInc = {gamerTag: f2, guildId: guildId}, updateDeath = { $inc: {numDeaths: 1}};
																var conditionKB = {gamerTag: f2, guildId: guildId}, updateKB = { $set: {killedBy: f1}};
																var kd2 = {gamerTag: f2, guildId: guildId}, updateKD2 = { $set: {kd: getKD2}};
																var conditionTA2 = {gamerTag: f2, guildId: guildId}, updateTA2 = { $set: {timeAlive: `${moment(TA2).from(moment().toISOString(true))}`}};
																var tokInc2 = {gamerTag: f2, guildId: guildId}, updatetok2 = { $set: {tok: dt0}};
																async function victim() {
																	await KillFeed.updateOne(deathInc, updateDeath, {new : true}).exec();
																	await KillFeed.updateOne(conditionKB, updateKB, {new : true}).exec();
																	await KillFeed.updateOne(conditionTA2, updateTA2, {new : true}).exec();
																	await KillFeed.updateOne(kd2, updateKD2, {new : true}).exec();
																	await KillFeed.updateOne(tokInc2, updatetok2, {new : true}).exec();
																}
																victim().catch(function (error) {
																	console.log(error);
																});
															}
														}
													})
												}
											}else {
												var f0 = val[0].toString();
												var f1 = val[10].toString();
												var f2 = val[2].toString();
												var f3 = val[15].toString();
												let f0a = f0.split(":")
												let yy = logDt.slice(0, 4);
												let mm = logDt.slice(5, 7);
												let dd = logDt.slice(8, 10);
												//Check for next day change not relected in logs.
												if (logDt < todayRef) {
													nextDay = true;
												}else {
													nextDay = false;
												}
												if (nextDay == true) {
													if (f0a[0] >= 00 && f0a[0] <= 07) {
														let ld = (dd - 0) + 1;
														dt.setFullYear(yy);
														dt.setMonth((mm - 0) - 1);
														dt.setDate(ld);
														
													}else {
														dt.setFullYear(yy);
														dt.setMonth((mm - 0) - 1);
														dt.setDate(dd);
													}
												}
												function getDate() {
													dt.setHours(f0a[0]);
													dt.setMinutes(f0a[1]);
													dt.setSeconds(f0a[2]);
												}
												getDate();
												data2.splice(0, data2.length);
												let dt0 = (dt.valueOf() / 1000);
												if(dt0 != tRef && dt0 > tRef) {
													console.log(`This is the kill ref date: ${dt}`);
													const attachment = new Discord.MessageAttachment('./images/crown.png', 'crown.png');
													const embed = new Discord.MessageEmbed()
													.attachFiles(attachment)
													.setThumbnail('attachment://crown.png')
													.setColor(0xDD0000)
													.setTitle('K1llFeed Notification')
													.setDescription(`${f0} **${f1}** Killed **${f2}** ${f3} `)
													message.channel.send(embed);//.then (message => message.delete({ timeout: 180000, }));
													console.log(`Kill Time-Stamp: ${dt}`);
													tRef = dt0;
													//Increases kill count of killer record
													KillFeed.findOne({gamerTag: f1, guildId: guildId}, (err, killFeed) => {
														if(err) console.log(err);
														if(!killFeed) {
															return;
														}else{
															if(dt0 != killFeed.tok && dt0 > killFeed.tok) {
																let countK = 0;
																var countD = 0;
																var TA = " ";
																var getKD = 0;
																countK = killFeed.numKills += 1;
																countD = killFeed.numDeaths
																TA = killFeed.lastspawn;
																if (countD == 0) {
																	getKD = +((countK - 0).toFixed(2));
																}else {
																	getKD = +((countK / countD).toFixed(2));
																}
																var killInc = {gamerTag: f1, guildId: guildId}, updateKill = { $inc: {numKills: 1}};
																var conditionK = {gamerTag: f1, guildId: guildId}, updateK = { $set: {killed: f2}};
																var kd1 = {gamerTag: f1, guildId: guildId}, updateKD1 = { $set: {kd: getKD}};
																var conditionTA = {gamerTag: f1, guildId: guildId}, updateTA = { $set: {timeAlive: `${moment(TA).from(moment().toISOString(true))}`}};
																var tokInc = {gamerTag: f1, guildId: guildId}, updatetok = { $set: {tok: dt0}};
																async function killer(){
																	await KillFeed.updateOne(killInc, updateKill, {new : true}).exec();																	
																	await KillFeed.updateOne(conditionK, updateK, {new : true}).exec();
																	await KillFeed.updateOne(kd1, updateKD1, {new : true}).exec();
																	await KillFeed.updateOne(conditionTA, updateTA, {new : true}).exec();
																	await KillFeed.updateOne(tokInc, updatetok, {new : true}).exec();
																}
																killer()
																.catch(function (error) {
																	console.log(error);
																});
															}
														}
													})
													//Increases death count of victim record
													KillFeed.findOne({gamerTag: f2, guildId: guildId}, (err, killFeed) => {
														if(err) console.log(err);
														if(!killFeed) {
															return;
														}else{
															if(dt0 != killFeed.tok && dt0 > killFeed.tok) {
																var countK2 = 0;
																var countD2 = 0;
																var TA2 = " ";
																var getKD2 = 0;
																countK2 = killFeed.numKills;
																countD2 = killFeed.numDeaths += 1;
																TA2 = killFeed.lastspawn;
																if (countD2 == 0) {
																	getKD2 = +((countK2 - 0).toFixed(2));
																}else {
																	getKD2 = +((countK2 / countD2).toFixed(2));
																}
																var deathInc = {gamerTag: f2, guildId: guildId}, updateDeath = { $inc: {numDeaths: 1}};
																var conditionKB = {gamerTag: f2, guildId: guildId}, updateKB = { $set: {killedBy: f1}};
																var kd2 = {gamerTag: f2, guildId: guildId}, updateKD2 = { $set: {kd: getKD2}};
																var conditionTA2 = {gamerTag: f2, guildId: guildId}, updateTA2 = { $set: {timeAlive: `${moment(TA2).from(moment().toISOString(true))}`}};
																var tokInc2 = {gamerTag: f2, guildId: guildId}, updatetok2 = { $set: {tok: dt0}};
																async function victim() {
																	await KillFeed.updateOne(deathInc, updateDeath, {new : true}).exec();
																	await KillFeed.updateOne(conditionKB, updateKB, {new : true}).exec();
																	await KillFeed.updateOne(conditionTA2, updateTA2, {new : true}).exec();
																	await KillFeed.updateOne(kd2, updateKD2, {new : true}).exec();
																	await KillFeed.updateOne(tokInc2, updatetok2, {new : true}).exec();
																}
																victim().catch(function (error) {
																	console.log(error);
																});
															}
														}
													})
												}
											}
										}else if (val[13] && !val[15]) {
											var f0 = val[0].toString();
											var f1 = val[8].toString();
											var f2 = val[2].toString();
											var f3 = val[13].toString();
											let f0a = f0.split(":");
											let yy = logDt.slice(0, 4);
											let mm = logDt.slice(5, 7);
											let dd = logDt.slice(8, 10);
											//Check for next day change not relected in logs.
											if (logDt < todayRef) {
												nextDay = true;
											}else {
												nextDay = false;
											}
											if (nextDay == true) {
												if (f0a[0] >= 00 && f0a[0] <= 07) {
													let ld = (dd - 0) + 1;
													dt.setFullYear(yy);
													dt.setMonth((mm - 0) - 1);
													dt.setDate(ld);
													
												}else {
													dt.setFullYear(yy);
													dt.setMonth((mm - 0) - 1);
													dt.setDate(dd);
												}
											}
											function getDate() {
												dt.setHours(f0a[0]);
												dt.setMinutes(f0a[1]);
												dt.setSeconds(f0a[2]);
											}
											getDate();
											data2.splice(0, data2.length);
											let dt0 = (dt.valueOf() / 1000);
											if(dt0 != tRef && dt0 > tRef) {
												console.log(`This is the kill ref date: ${dt}`);
												const attachment = new Discord.MessageAttachment('./images/crown.png', 'crown.png');
												const embed = new Discord.MessageEmbed()
												.attachFiles(attachment)
												.setThumbnail('attachment://crown.png')
												.setColor(0xDD0000)
												.setTitle('K1llFeed Notification')
												.setDescription(`${f0} **${f1}** Killed **${f2}** ${f3} `)
												message.channel.send(embed);//.then (message => message.delete({ timeout: 180000, }));
												console.log(`Kill Time-Stamp: ${dt}`);
												tRef = dt0;
											}
										}else if (val[7] && !val[9]) {
											console.log("Stupid NPC's!");
											// tRef = dt0
										}else {
											var f0 = val[0].toString();
											var f1 = val[2].toString();
											var f2 = val[9].toString();
											let f0a = f0.split(":");
											let yy = logDt.slice(0, 4);
											let mm = logDt.slice(5, 7);
											let dd = logDt.slice(8, 10);
											//Check for next day change not relected in logs.
											if (logDt < todayRef) {
												nextDay = true;
											}else {
												nextDay = false;
											}
											if (nextDay == true) {
												if (f0a[0] >= 00 && f0a[0] <= 07) {
													let ld = (dd - 0) + 1;
													dt.setFullYear(yy);
													dt.setMonth((mm - 0) - 1);
													dt.setDate(ld);
													
												}else {
													dt.setFullYear(yy);
													dt.setMonth((mm - 0) - 1);
													dt.setDate(dd);
												}
											}
											function getDate() {
												dt.setHours(f0a[0]);
												dt.setMinutes(f0a[1]);
												dt.setSeconds(f0a[2]);
											}
											getDate();
											data2.splice(0, data2.length);
											let dt0 = (dt.valueOf() / 1000);
											if(dt0 != tRef && dt0 > tRef) {
												console.log(`This is the kill ref date: ${dt}`);
												const attachment = new Discord.MessageAttachment('./images/crown.png', 'crown.png');
												const embed = new Discord.MessageEmbed()
												.attachFiles(attachment)
												.setThumbnail('attachment://crown.png')
												.setColor(0xDD0000)
												.setTitle('K1llFeed Notification')
												.setDescription(`${f0} **${f1}** was ${f2}`)
												message.channel.send(embed);//.then (message => message.delete({ timeout: 180000, }));
												console.log(`Kill Time-Stamp: ${dt}`);
												tRef = dt0;
											}
										}
									})
								}
							}
						}else {
							console.log('No Change!');
							data2.splice(0, data.length);
							data.splice(0, data.length);
							console.log("Program Ended");
						}
					}else {
                        console.log("K1llfeed Paused!");
						return;
					}
					data.splice(0, data.length);
					data2.splice(0, data2.length);
				}, 30000);
		    }		
		break;
	}
})

bot.on('message', async message => {
    
    //variables 
	// const args = msg.substring(PREFIX.length).split(" ");
	const sargs = message.content.substring(PREFIX.length).split("#");
    const ausername =  message.author.username;
    const auserId = message.member.id;
    const guildId = message.guild.id;
    const guildName = message.guild.name;
    const tuserId = Discord.User.id;
    const members = message.guild.members.cache;

    if (!message.guild) return;
    if (message.author.bot) return; // This closes the rest of the script if the bot sends the message....bot can't have account


    //Link GamerTag to KillFeed Record
    switch(sargs[0]){        
        case 'link':
            // if (!message.member.roles.cache.some(r => r.name === "Admin")) return message.channel.send('YOU DO NOT HAVE THE REQUIRED PERMISSIONS') .then (message => message.delete({ timeout: 5000, }));
            if (!sargs[1]) {
                message.channel.send('Please specify your console GamerTag!  (!link**#**Your GamerTag Here**#** @DiscordUserName**)')
                return;
            }
            KillFeed.findOne({userId: auserId, guildId: guildId}, (err, killFeed) => {
				if(err) console.log(err);
				if (!killFeed) {
					// Create killFeed entry in the Database
				   const killFeed = new KillFeed({
					   _id: mongoose.Types.ObjectId(),
					   username: ausername,
					   guildId: guildId,
					   userId: auserId,
					   gamerTag: sargs[1],
					   numKills: 0,
					   numDeaths: 0,
					   kd: 0,
					   longestShot: 0,
					   timeAlive: 'No Data',
					   lastspawn: `${moment().toISOString(true)}`,
					   killed: 'No Data',
					   killedBy: 'No Data',
					   weapon: 'No Data',
					   tok: 0,
					   online: 'no',
					   bounty: 0,
					   location: "No Data"
				   })           
				   killFeed.save()
				   .then(result => console.log(result))
				   .catch(err => console.log(err));
				   message.channel.send(`**${sargs[1]}**  has been linked to **${ausername}**'s PVP record succesfully!`)
			  	}else if (killFeed.gamerTag == " ") {
					KillFeed.findOneAndUpdate({userId: auserId, guildId: guildId}, {$set: {gamerTag: `${sargs[1]}`, lastspawn: `${moment().toISOString(true)}`, username: `${ausername}`}}
					,function (err, doc) {
						if (err) {
							console.log("update error");
						}else{
							console.log("update success");
							message.channel.send(`**${sargs[1]}** has been successfully linked to **${ausername}**'s PVP record!`);
						}
					});
					return;
				}else {
					message.channel.send(`**This account's PVP record has already been linked!**`)
				}
			})
		break;
	}
})

//Login Discord Bot
bot.login(TOKEN);

bot.on('ready', () => {
	console.info(`Logged in as ${bot.user.tag}!`);
	console.log('K1llfeed is Active!');
})

bot.on('error', function (err) {
    console.log(err)
});

const conn = mongoose.createConnection('mongodb+srv://'+`${mUser}:`+`${mPW}`+`${mcluster}`+`${mDB}`+'?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, poolSize: 250})

//Define KillFeed Schema
const killFeed = mongoose.Schema;

//Create KillFeed schema
const killFeedSchema = new killFeed({
    _id: mongoose.Schema.Types.ObjectId,
    guildId: {type: String, required: true},
    userId: {type: String, required: true},
    username: {type: String, required: true},
    gamerTag: {type: String, required: true},
    numKills: Number,
    numDeaths: Number,
    kd: Number,
    longestShot: Number,
    timeAlive: String,
    lastspawn: String,
    killed: String,
    killedBy: String,
    weapon: String,
	tok: Number,
	online: String,
	bounty: Number,
	location: String,
})

//Create KillFeed model from schema
const KillFeed = conn.model('KillFeed', killFeedSchema);