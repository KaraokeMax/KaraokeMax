const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const StatusMusica = require('../Helpers/Musica-Helper')

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
		allowNull: false,
		unique: true
	},
	artistaId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: StatusMusica.CARREGANDO
	},
	idUsuarioCriador: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1
	}
}, 	{
	tableName: 'Musicas',
	timestamps: false
});

module.exports = Musica;
