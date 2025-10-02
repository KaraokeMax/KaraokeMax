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
	artistaId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: StatusMusica.CARREGANDO
	}
}, 	{
	tableName: 'Musicas',
	timestamps: false
});

module.exports = Musica;
