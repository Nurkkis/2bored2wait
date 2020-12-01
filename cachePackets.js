var chunkData = new Map();
var abilitiesPacket;
var loginpacket;
var gChunkCaching;
var positionPacket;
module.exports = {
	init: (client, chunkCaching) => {
		gChunkCaching = chunkCaching;
		client.on("packet", (data, meta, rawData) => { // each time 2b2t sends a packet
			switch (meta.name) {
				case "map_chunk":
					if(chunkCaching) chunkData.set(data.x + "_" + data.z, rawData);
					break;
				case "unload_chunk":
					if(chunkCaching) chunkData.delete(data.chunkX + "_" + data.chunkZ);
					break;
				case "respawn":
					Object.assign(loginpacket, data);
					chunkData = new Map();
					break;
				case "login":
					loginpacket = data;
					break;
				case "game_state_change":
					loginpacket.gameMode = data.gameMode;
					break;
				case "abilities":
					abilitiesPacket = rawData;
					break;
				case "position":
					positionPacket = rawData;
					break;
			}
		});

	},
	join: (proxyClient) => {
		proxyClient.write('login', loginpacket);
		proxyClient.writeRaw(positionPacket);

		proxyClient.writeRaw(abilitiesPacket);
		setTimeout( () => {
			if(gChunkCaching) chunkData.forEach((data) => {
				proxyClient.writeRaw(data);
			});
		}, 1000);
	}
}