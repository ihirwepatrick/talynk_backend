Post.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'author'
  });
  
  Post.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });

  // Get approved videos
  await Post.scope(['approved', 'videos']).findAll()
  await Post.scope(['approved', 'pictures']).findAll()

  // Get pending pictures
  await Post.scope(['pending', 'pictures']).findAll()
  await Post.scope(['pending', 'videos']).findAll()

  // Get user's approved posts with category
  await Post.scope('approved').findAll({
    where: { userId: someUserId },
    include: ['category']
  })