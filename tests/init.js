const Sequelize = require('sequelize');

const sequelize = new Sequelize('sqlite::memory:', { logging: false });

const DUMMY_VALUES = {
  a: 'x',
  b: 777,
  c: true,
};

function createModel(modelName = 'TestModel', props = {}) {
  return sequelize.define(modelName,
    {
      a: Sequelize.DataTypes.STRING,
      b: Sequelize.DataTypes.INTEGER,
      c: Sequelize.DataTypes.BOOLEAN,
      ...props,
    });
}

module.exports = {
  createModel,
  DUMMY_VALUES,
};
