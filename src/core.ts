
export type CompanionPacket = {
	version: number;
	type: string;
	body: any;
}

export interface ICompanionClient {
	ws: WebSocket | null;
	modules: Map<string, any>;
	listeners: Map<string, Function[]>;
	connect(url: string): void;
	send(type: string, body: any): void;
	on(event: string, callback: Function): void;
	off(event: string, callback: Function): void;
}
