module.exports = (sequelize, DataTypes) => {
    const Supplier = sequelize.define("Supplier", {
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
    });
    return Supplier;
};