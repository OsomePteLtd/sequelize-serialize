const Sequelize = require("sequelize");

const sequelize = new Sequelize("sqlite::memory:");

const DUMMY_VALUES = {
  a: "x",
  b: 777,
  c: true,
};

function createModel() {
  class TestModel extends Sequelize.Model {}

  TestModel.init(
    {
      a: Sequelize.DataTypes.STRING,
      b: Sequelize.DataTypes.INTEGER,
      c: Sequelize.DataTypes.BOOLEAN,
    },
    { sequelize }
  );

  return TestModel;
}

module.exports = {
  createModel,
  DUMMY_VALUES,
};
