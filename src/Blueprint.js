import decodeV14Base64, {decodeV15Base64} from './parser/decodeFromBase64';
import luaTableToJsonObject from './parser/luaTableToJsonObject';

class Blueprint
{
	constructor(encodedText)
	{
		this.encodedText   = encodedText;
		this.decodedObject = this.convertEncodedTextToObject();
	}

	isV14 = () => this.encodedText.startsWith('H4sIAAAAAAAA/');
	isV15 = () => this.encodedText.startsWith('0');

	convertEncodedTextToObject = () =>
	{
		if (this.isV14())
		{
			return luaTableToJsonObject(decodeV14Base64(this.encodedText));
		}
		else if (this.isV15())
		{
			return JSON.parse(decodeV15Base64(this.encodedText));
		}

		throw new Error('Unknown blueprint format');
	};

	isBook = () =>
	{
		if (this.isV14())
		{
			return this.decodedObject.book !== undefined || this.decodedObject.type === 'blueprint-book';
		}
		else if (this.isV15())
		{
			return this.decodedObject.blueprint_book !== undefined;
		}

		throw new Error('Unknown blueprint format');
	};

	convertSingleBlueprint = (decodedObject) =>
	{
		decodedObject = decodedObject || this.decodedObject;
		if (!this.isV14())
		{
			throw new Error();
		}

		if (this.isBook())
		{
			throw new Error();
		}

		const {icons, name, entities} = decodedObject;

		const blueprint = {
			icons,
			entities: entities.map((entity, index) => ({entity_number: index, ...entity})),
			item    : 'blueprint',
			label   : name,
			version : 12345567890,
		};

		console.log({blueprint});
		return {blueprint};
	};

	convertSingleBookEntry = (decodedObject) =>
	{
		const {label, tiles, icons} = decodedObject;

		return {
			icons,
			entities: tiles.map((entity, index) => ({entity_number: index, ...entity})),
			item    : 'blueprint',
			label,
			version : 12345567890,
		};
	};

	convertBlueprintBook = (decodedObject) =>
	{
		decodedObject = decodedObject || this.decodedObject;
		if (!this.isV14())
		{
			throw new Error();
		}

		if (!this.isBook())
		{
			throw new Error();
		}

		const {data: {label, active, main}} = decodedObject;
		const blueprints                    = [active, ...main];

		const convertedBlueprints = blueprints.map((blueprint, index) => (
			{
				blueprint: this.convertSingleBookEntry(blueprint),
				index,
			}));

		const blueprint_book = {
			blueprints  : convertedBlueprints,
			item        : 'blueprint-book',
			label,
			active_index: 0,
			version     : 12345567890,
		};

		console.log({blueprint_book});
		return {blueprint_book};
	};

	convert = () =>
	{
		if (!this.isV14())
		{
			throw new Error();
		}

		return this.isBook()
			? this.convertBlueprintBook()
			: this.convertSingleBlueprint();
	};

	getV15Decoded = () =>
	{
		if (this.isV15())
		{
			return this.decodedObject;
		}

		return this.convert();
	}
}

export default Blueprint;
