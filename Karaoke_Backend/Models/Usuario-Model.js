const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Usuario = sequelize.define('Usuario', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	nome: {
		type: DataTypes.STRING,
		allowNull: false
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	senha: {
		type: DataTypes.STRING,
		allowNull: true
	},
	tipo: {
		type: DataTypes.STRING,
		allowNull: false
	},
	primeiroAcesso: {
		type: DataTypes.BOOLEAN,
		defaultValue: true
	},
	token: {
		type: DataTypes.STRING,
		allowNull: true
	},
	created_at: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW
	}
}, {
	tableName: 'Usuarios',
	timestamps: false
});

module.exports = Usuario;
