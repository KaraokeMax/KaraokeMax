const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const { toSlug } = require('../Helpers/Slug-Helper');

const Artista = sequelize.define('Artista', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	nome: {
		type: DataTypes.STRING,
		allowNull: false
	},
	slug: {
		type: DataTypes.STRING,
		allowNull: true,
	}
}, 	{
	tableName: 'Artistas',
	timestamps: false
});

module.exports = Artista;
