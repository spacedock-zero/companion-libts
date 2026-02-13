import type { ICompanionClient } from "../core";

export class MemoryModule {
	private client: ICompanionClient;

	constructor(client: ICompanionClient) {
		this.client = client;
	}

	/**
	 * Query a memory variable
	 * @param variable - The variable name
	 */
	query(variable: string) {
		this.client.send('memory_query', { variable });
	}

	/**
	 * Set a memory variable
	 * @param variable - The variable name
	 * @param value - The value to set
	 */
	set(variable: string, value: any) {
		this.client.send('memory_set', { variable, value });
	}

	/**
	 * Listen for memory updates
	 * @param cb - Callback receiving update data
	 */
	onUpdate(cb: Function) {
		this.client.on('memory_update', cb);
	}

	/**
	 * Listen for memory deletions
	 * @param cb - Callback receiving delete data
	 */
	onDelete(cb: Function) {
		this.client.on('memory_delete', cb);
	}
}
