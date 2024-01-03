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
        type: DataTypes.TEXT, // Use TEXT for storing JSON string
        allowNull: true,
        get() {
          // Parse the stored JSON string when retrieving data
          const likes = this.getDataValue('likes');
          return likes ? JSON.parse(likes) : 0;
        },
        set(likes) {
          // Stringify the array when storing data
          this.setDataValue('likes', likes ? JSON.stringify(likes) : 0);
        },
      }
    });
    
    return Wit;
}