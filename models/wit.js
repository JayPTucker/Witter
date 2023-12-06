module.exports = function(sequelize, DataTypes) {
    var Wit = sequelize.define("Wit", {
      author: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.STRING,
        allowNull: true
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
      }
    });
    
    return Wit;
}