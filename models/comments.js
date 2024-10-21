module.exports = function(sequelize, DataTypes) {
    var Comment = sequelize.define("Comment", {
      witId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Wits", // This is the wit model
          key: "id"
        }
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });
  
    // Associate comment with wit
    Comment.associate = function(models) {
      Comment.belongsTo(models.Wit, {
        foreignKey: "witId",
        onDelete: "CASCADE"
      });
    };
  
    return Comment;
  };
  