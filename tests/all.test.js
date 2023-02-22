const { createModel, DUMMY_VALUES } = require('./init');
const serialize = require('../lib/index');

describe('Serializers', () => {
  it('Filters out properties not defined in schema', () => {
    const TestModel = createModel();

    const schema = {
      type: 'object',
      properties: {
        a: {
          type: 'string',
        },
        b: {
          type: 'string',
        },
      },
    };

    const instance = new TestModel(DUMMY_VALUES);
    expect(serialize(instance, schema))
      .toEqual({ a: 'x', b: 777 });
  });

  it('Includes `belongsTo`', () => {
    const ModelA = createModel();
    const ModelB = createModel();
    ModelB.belongsTo(ModelA);

    const schema = {
      type: 'object',
      properties: {
        a: {
          type: 'string',
        },
        modelA: {
          type: 'object',
          properties: {
            b: {
              type: 'integer',
            },
            c: {
              type: 'boolean',
            },
          },
        },
      },
    };

    const instanceA = new ModelA(DUMMY_VALUES);
    const instanceB = new ModelB(DUMMY_VALUES);
    instanceB.modelA = instanceA;

    expect(serialize(instanceB, schema))
      .toEqual({ a: 'x', modelA: { b: 777, c: true } });
  });

  it('Includes `hasMany`', () => {
    const ModelA = createModel();
    const ModelB = createModel();
    ModelA.hasMany(ModelB);

    const schema = {
      type: 'object',
      properties: {
        a: {
          type: 'string',
        },
        modelsB: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              b: {
                type: 'integer',
              },
              c: {
                type: 'boolean',
              },
            },
          },
        },
      },
    };

    const instanceA = new ModelA(DUMMY_VALUES);
    const instanceB1 = new ModelB(DUMMY_VALUES);
    const instanceB2 = new ModelB(DUMMY_VALUES);
    instanceA.modelsB = [instanceB1, instanceB2];

    expect(serialize(instanceA, schema))
      .toEqual({ a: 'x', modelsB: [{ b: 777, c: true }, { b: 777, c: true }] });
  });

  it('Includes `belongsTo` with anyOf', () => {
    const ModelA = createModel();
    const ModelB = createModel();
    ModelB.belongsTo(ModelA);

    const schema = {
      type: 'object',
      properties: {
        a: {
          type: 'string',
        },
        modelA: {
          anyOf: [
            {
              type: 'object',
              properties: {
                c: {
                  type: 'boolean',
                },
                b: {
                  type: 'integer',
                },
              },
            },
            {
              type: 'object',
              properties: {
                b: {
                  type: 'integer',
                },
              },
            },
          ],
        },
      },
    };

    const instanceA = new ModelA({ ...DUMMY_VALUES });
    const instanceB = new ModelB(DUMMY_VALUES);
    instanceB.modelA = instanceA;

    expect(serialize(instanceB, schema)).toEqual({
      a: 'x',
      modelA: { b: 777, c: true },
    });
  });

  it('Includes `hasMany` with anyOf', () => {
    const ModelA = createModel();
    const ModelB = createModel();
    ModelA.hasMany(ModelB);

    const schema = {
      type: 'object',
      properties: {
        a: {
          type: 'string',
        },
        modelsB: {
          type: 'array',
          items: {
            anyOf: [
              {
                type: 'object',
                properties: {
                  b: {
                    anyOf: [
                      {
                        type: 'string',
                        format: 'datetime',
                      },
                      {
                        type: 'null',
                      },
                    ],
                  },
                },
              },
              {
                type: 'object',
                properties: {
                  c: {
                    type: 'boolean',
                  },
                },
              },
            ],
          },
        },
      },
    };

    const instanceA = new ModelA(DUMMY_VALUES);
    const instanceB1 = new ModelB(DUMMY_VALUES);
    const instanceB2 = new ModelB(DUMMY_VALUES);
    instanceA.modelsB = [instanceB1, instanceB2];

    expect(serialize(instanceA, schema)).toEqual({
      a: 'x',
      modelsB: [
        { b: 777, c: true },
        { b: 777, c: true },
      ],
    });
  });

  it('Object schema without properties', () => {
    const TestModel = createModel();

    const schema = {
      type: 'object',
      properties: {
        a: {
          anyOf: [
            {
              type: 'object',
            },
            {
              type: 'null',
            },
          ],
        },
      },
      additionalProperties: false,
    };

    const instance = new TestModel({ ...DUMMY_VALUES, a: {} });
    expect(serialize(instance, schema)).toEqual({ a: {} });
  });

  it('Resource as empty array', () => {
    const schema = {
      type: 'object',
      properties: {},
    };

    expect(serialize([], schema))
      .toEqual([]);
  });
});
