module.exports = (sequelize, DataTypes) => {
  const RecentSearch = sequelize.define('RecentSearch', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    searchTerm: {
      type: DataTypes.STRING,
      allowNull: false
    },
    searchDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  return RecentSearch;
}; 