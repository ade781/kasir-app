module.exports = (sequelize, DataTypes) => {
    const Expense = sequelize.define("Expense", {
        amount: { type: DataTypes.INTEGER, allowNull: false },
        date: { type: DataTypes.STRING, allowNull: false, defaultValue: DataTypes.NOW },
    });
    return Expense;
};