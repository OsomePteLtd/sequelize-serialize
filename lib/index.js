function serialize(resource, schema, options = {}) {
  if (Array.isArray(resource) && !resource.length) {
    return [];
  }

  if (Array.isArray(resource)) {
    return resource.map(member => serialize(member, schema, options));
  }

  const { decorate } = options;
  const decorated = decorate ? decorate(resource) : resource;
  const serialized = {};

  if (!schema.properties) {
    return toJSON(resource);
  }

  Object.keys(schema.properties).forEach((propertyName) => {
    const propertyDef = schema.properties[propertyName];
    let value = decorated[propertyName];

    if (typeof value === 'function') {
      value = decorated[propertyName]();
    }

    const objectDef = findObjectDef(propertyDef);

    serialized[propertyName] = objectDef && isObjectLike(value)
      ? serialize(value, objectDef, options)
      : toJSON(value);
  });

  return serialized;
}

function findObjectDef(propertyDef) {
  const { type, anyOf } = propertyDef;

  if (type === 'object') {
    return propertyDef;
  }

  if (type === 'array') {
    return findObjectDef(propertyDef.items);
  }

  if (anyOf && isNullableType(propertyDef)) {
    return anyOf.map(findObjectDef).find(def => def && def.type === 'object');
  }

  return null;
}

function isObjectLike(value) {
  return typeof value === 'object' && value !== null;
}

function toJSON(value) {
  if (Array.isArray(value)) {
    return value.map(toJSON);
  }
  return value && typeof value.toJSON === 'function' ? value.toJSON() : value;
}

function isNullType(schema = {}) {
  return schema.type === 'null';
}

function isNullableType(schema = {}) {
  const { anyOf = [] } = schema;
  return Boolean(anyOf.length === 2 && anyOf.find(isNullType) && anyOf.find(item => !isNullType(item)));
}

module.exports = serialize;
