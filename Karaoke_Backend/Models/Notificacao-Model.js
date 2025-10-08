const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Notificacao = sequelize.define('Notificacao', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	mensagem: {
		type: DataTypes.STRING,
		allowNull: false
	},
	idUsuario: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
    sucesso: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
	lida: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	},
    detalhes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
	tableName: 'Notificacoes',
	timestamps: false
});

module.exports = Notificacao;
