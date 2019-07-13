const Ajv = require('ajv');
const ajv = new Ajv({
  strictKeywords: true,
  allErrors: true,
  schemas: [
    require('../v0.1/defs.json')
  ]
});


describe('schema', () => {
  describe('v0.1', () => {
    describe('item.json', () => {
      it('should be a valid JSON Schema', () => {
        ajv.compile(require('../v0.1/item.json'));
      });
    });
  });
});
