'use strict';

// Import models
const Post = require('./Post');
const Approver = require('./Approver');

// Explicitly define the association between Post and Approver
Post.belongsTo(Approver, { foreignKey: 'approver_id', as: 'approver' });
Approver.hasMany(Post, { foreignKey: 'approver_id', as: 'approvedPosts' });

module.exports = {
  Post,
  Approver
}; 