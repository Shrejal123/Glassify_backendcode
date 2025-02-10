const Category = require("../models/category.model.js");
const Product = require("../models/product.model.js");

async function createProduct(reqData) {
    try {
        let topLevel = await Category.findOne({ name:reqData.topLevelCategory });
        if (!topLevel) {
            topLevel = new Category({
                name: reqData.topLevelCategory,
                level: 1,
            });
            await topLevel.save();
        };

        let secondLevel = await Category.findOne({
            name: reqData.secondLevelCategory,
            parentCategory: topLevel._id,
        });
        if (!secondLevel) {
            secondLevel = new Category({
                name: reqData.secondLevelCategory,
                parentCategory: topLevel._id,
                level: 2,
            });
            await secondLevel.save();
        };

        let thirdLevel = await Category.findOne({
            name: reqData.thirdLevelCategory,
            parentCategory: secondLevel._id,
        });
        if (!thirdLevel) {
            thirdLevel = new Category({
                name: reqData.thirdLevelCategory,
                parentCategory: secondLevel._id,
                level: 3,
            });
            await thirdLevel.save();
        }

        const product = new Product({
            title: reqData.title,
            color: reqData.color,
            description: reqData.description,
            discountedPrice: reqData.discountedPrice,
            discountPercent: reqData.discountPercent,
            imageUrl: reqData.imageUrl,
            brand: reqData.brand,
            price: reqData.price,
            // sizes: reqData.size,
            quantity: reqData.quantity,
            category: thirdLevel._id,
        });

        return await product.save();
    } catch (error) {
        console.error("Error in createProduct:", error.message);
        throw new Error(error.message);
    }
}

async function deleteProduct(productId) {
    try {
        const product = await findProductById(productId);
        if (!product) throw new Error(`Product not found with id: ${productId}`);
        await Product.findByIdAndDelete(productId);
        return "Product deleted successfully";
    } catch (error) {
        console.error("Error in deleteProduct:", error.message);
        throw new Error(error.message);
    }
}

async function updateProduct(productId, reqData) {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(productId, reqData, { new: true });
        if (!updatedProduct) throw new Error(`Product not found with id: ${productId}`);
        return updatedProduct;
    } catch (error) {
        console.error("Error in updateProduct:", error.message);
        throw new Error(error.message);
    }
}

async function findProductById(id) {
    try {
        const product = await Product.findById(id).populate("category").exec();
        if (!product) throw new Error(`Product not found with id: ${id}`);
        return product;
    } catch (error) {
        console.error("Error in findProductById:", error.message);
        throw new Error(error.message);
    }
}

async function getAllProducts(reqQuery) {
    try {
        let {
            category,
            color,
            // sizes,
            minPrice,
            maxPrice,
            minDiscount,
            sort,    
            pageNumber,
            pageSize,
        } = reqQuery;

        pageNumber = parseInt(pageNumber) || 1;
        pageSize = parseInt(pageSize) || 10;

        let query = Product.find().populate("category");

        if (category) {
            const existCategory = await Category.findOne({ name: category });
            if (existCategory) {
                query = query.where("category").equals(existCategory._id);
            } 
            console.log("Category not found:", category);

        }

        if (color) {
            const colorSet = new Set(color.split(",").map((color) => color.trim().toLowerCase()));
            const colorRegex = colorSet.size > 0 ? new RegExp([...colorSet].join("|"), "i") : null;
            query = query.where("color").regex(colorRegex);
        }
        // if(sizes){
        //     const sizesSet = new Set(sizes);
        //     query.query.where("sizes.name").in([...sizesSet]);
        // }

        if (minPrice && maxPrice) {
            query =query.where("discountedPrice").gte(minPrice).lte(maxPrice);
        }

        if (minDiscount) {
            query = query.where("discountPercent").gt(minDiscount);
        }

        if (sort) {
            const sortDirection = sort === "price_low" ? -1 : 1;
            query = query.sort({ discountedPrice: sortDirection });
        }

        const totalProducts = await Product.countDocuments(query);
        const skip = (pageNumber - 1) * pageSize;

        query = query.skip(skip).limit(pageSize);
        const products = await query.exec();
        const totalPages = Math.ceil(totalProducts / pageSize);

        return { content: products, currentPage: pageNumber, totalPages,};
    } catch (error) {
        console.error("Error in getAllProducts:", error.message);
        throw new Error(error.message);
    }
}

async function createMultipleProduct(products) {

        for (let product of products) {
            await createProduct(product);
        }
   
}

module.exports = {
    createProduct,
    deleteProduct,
    updateProduct,
    getAllProducts,
    findProductById,
    createMultipleProduct,
};
