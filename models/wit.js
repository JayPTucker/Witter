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
    },
    likes: {
      type: DataTypes.JSON, // Use JSON type for likes
      allowNull: true,
      defaultValue: [] // Default value is an empty array
    }
  });
  
  return Wit;
}
