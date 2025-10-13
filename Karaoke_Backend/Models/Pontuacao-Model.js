const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Pontuacao = sequelize.define('Pontuacao', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nomeUsuario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    musicaId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pontos: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    publico: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Pontuacoes',
    timestamps: false
});

module.exports = Pontuacao;