const Ajv = require('ajv');
const ajv = new Ajv({
  strictKeywords: true,
  allErrors: true,
  schemas: [
    require('../v0.1/defs.json'),
    require('../v0.1/patch.json')
  ]
});
const jsonSchemaTest = require('json-schema-test');


describe('schema', () => {
  describe('v0.1', () => {
    const itemSchema = require('../v0.1/item.json');
    const changeSchema = require('../v0.1/change.json');
    const channelSchema = require('../v0.1/channel.json');

    describe('item.json', () => {
      it('should be a valid JSON Schema', () => {
        ajv.compile(itemSchema);
      });
    });

    describe('change.json', () => {
      it('should be a valid JSON Schema', () => {
        ajv.compile(changeSchema);
      });
    });

    describe('channel.json', () => {
      it('should be a valid JSON Schema', () => {
        addSchema(itemSchema);
        addSchema(changeSchema);
        ajv.compile(channelSchema);
      });
    });

    describe('samples in SPEC.md', () => {
      it('should be valid against schemas', () => {
        addSchema(itemSchema);
        addSchema(changeSchema);
        addSchema(channelSchema);
        jsonSchemaTest(ajv, {
          description: 'samples',
          suites: {
            'samples': './samples.json',
          },
          cwd: __dirname,
          afterError: (res) => console.log(res.errors)
        });
      });
    });
  });
});


function addSchema(schema) {
  if (!ajv.getSchema(schema.$id)) {
    ajv.addSchema(schema);
  }
}
