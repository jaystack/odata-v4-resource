var ServiceMetadata = require('odata-v4-service-metadata').ServiceMetadata;
module.exports = ServiceMetadata.processMetadataJson({
	version: '4.0',
	dataServices: {
		schema: [{
			namespace: 'Default',
			entityType: [{
				name: 'Kitten',
				key: [{
					propertyRef: [{ name: 'Id' }, { name: 'Id2' }]
				}],
				property: [
					{ name: 'Id', type: 'Edm.String', nullable: false },
					{ name: 'Id2', type: 'Edm.String', nullable: false },
					{ name: 'Name', type: 'Edm.String' },
					{ name: 'Age', type: 'Edm.Int32' },
					{ name: 'Lives', type: 'Edm.Int32' },
					{ name: 'Owner', type: 'Edm.String' }
				],
				navigationProperty: [
					{ name: 'Parent', type: 'Default.Kitten', partner: 'Kittens' },
					{ name: 'Kittens', type: 'Collection(Default.Kitten)', partner: 'Parent' }
				]
			}],
			annotations: [{
				target: 'Default.Kitten/Id',
				annotation: [{ term: 'Org.OData.Core.V1.Computed', bool: true }]
			}],
			action: [{
				name: 'GetRandom',
				isBound: true,
				parameter: [{
					name: 'bindingParameter',
					type: 'Default.Kitten'
				}],
				returnType: { type: 'Edm.Int32' }
			}],
			'function': [{
				name: 'Meow',
				isBound: false,
				parameter: [{
                    name: 'cats',
                    type: 'Edm.Int32'
                }],
				returnType: { type: 'Collection(Edm.String)' }
			}, {
				name: 'Rect',
				isBound: true,
				parameter: [{
					name: 'bindingParameter',
					type: 'Default.Kitten'
				}],
				returnType: { type: 'Edm.String' }
			}],
			entityContainer: {
				name: 'Container',
				entitySet: [{
					name: 'Kittens',
					entityType: 'Default.Kitten'
				}],
				actionImport: [{
					name: 'GetRandom',
					action: 'Default.GetRandom'
				}],
				functionImport: [{
					name: 'Meow',
					'function': 'Default.Calc',
					includeInServiceDocument: true
				}]
			}
		}]
	}
});