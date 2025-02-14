'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const sequelize = require('../config/database');

const db = {};

// First, load and initialize all models
const modelFiles = fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js'
        );
    });

// Initialize models
for (const file of modelFiles) {
    try {
        const model = require(path.join(__dirname, file));
        if (typeof model === 'function' && model.prototype instanceof Sequelize.Model) {
            const initializedModel = new model(sequelize, Sequelize.DataTypes);
            db[initializedModel.name] = initializedModel;
            console.log(`Initialized model: ${initializedModel.name}`);
        } else {
            db[model.name] = model;
            console.log(`Loaded model: ${model.name}`);
        }
    } catch (error) {
        console.error(`Error loading model from file ${file}:`, error);
    }
}

// Then set up associations after all models are initialized
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        try {
            db[modelName].associate(db);
            console.log(`Associated model: ${modelName}`);
        } catch (error) {
            console.error(`Error associating model ${modelName}:`, error);
        }
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;