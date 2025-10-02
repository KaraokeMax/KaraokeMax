const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Artista = sequelize.define('Artista', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	nome: {
		type: DataTypes.STRING,
		allowNull: false
	}
}, 	{
	tableName: 'Artistas',
	timestamps: false
});

module.exports = Artista;
