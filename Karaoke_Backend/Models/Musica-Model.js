const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const MusicaHelper = require('../Helpers/Musica-Helper');

const Musica = sequelize.define('Musica', {
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
		allowNull: false
	},
	artistaId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	status: {
		type: DataTypes.STRING,
		allowNull: true,
		defaultValue: MusicaHelper.CARREGANDO
	},
	usuarioCriadorId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1
	}
}, 	{
	tableName: 'Musicas',
	timestamps: true
});

module.exports = Musica;
