const { Category } = require('../models');

exports.getAllCategories = async (req, res) => {
    try {
        console.log('Fetching all categories');
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        });

        console.log('Categories found:', categories.length);
        res.json({
            status: 'success',
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching categories',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        res.json({
            status: 'success',
            data: category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Category name is required'
            });
        }

        const category = await Category.create({
            name,
            description
        });

        res.status(201).json({
            status: 'success',
            data: category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        await category.update({
            name: name || category.name,
            description: description || category.description
        });

        res.json({
            status: 'success',
            data: category
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (!category) {
            return res.status(404).json({
                status: 'error',
                message: 'Category not found'
            });
        }

        await category.destroy();

        res.json({
            status: 'success',
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting category',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 