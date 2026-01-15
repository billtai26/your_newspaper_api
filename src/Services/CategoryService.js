var DatabaseConnection = require(global.__basedir + '/src/Database/Database');
var Config = require(global.__basedir + "/src/configs/config");  
var CategoryRepository = require(global.__basedir + "/src/repositories/CategoryRepository");
var ObjectId = require('mongodb').ObjectId;

class CategoryService {
    constructor() {
        this.client = DatabaseConnection.getMongoClient();
        this.session = this.client.startSession(); 
        this.database = this.client.db(Config.mongodb.database);
        this.session.startTransaction();
        this.categoryRepository = new CategoryRepository(this.database, this.session); 
    }

    async insertCategory(category) {
        try {
            await this.categoryRepository.insertCategory(category);
            await this.session.commitTransaction();
            return { status: true };
        } catch (error) {
            await this.session.abortTransaction();
            return { status: false, error };
        } finally {
            this.session.endSession(); 
        }
    }

    async updateCategory(category) {
        try {
            await this.categoryRepository.updateCategory(category);
            await this.session.commitTransaction();
            return { status: true };
        } catch (error) {
            await this.session.abortTransaction();
            return { status: false };
        } finally {
            this.session.endSession();
        }
    }

    async deleteCategory(id) {
        try {
            const categoryObjectId = new ObjectId(id);

            const newsCount = await this.database.collection("news").countDocuments({ 
                $or: [
                    { CategoryId: categoryObjectId },
                    { CategoryId: id }
                ]
            });

            if (newsCount > 0) {
                await this.session.abortTransaction();
                return { 
                    status: false, 
                    message: `Hiện đang có ${newsCount} bài viết thuộc danh mục này. Vui lòng chuyển bài viết sang danh mục khác trước.` 
                };
            }

            await this.categoryRepository.deleteCategory(id);
            await this.session.commitTransaction();
            return { status: true };

        } catch (error) {
            await this.session.abortTransaction();
            return { status: false, message: error.message }; 
        } finally {
            this.session.endSession();
        }
    }

    async getCategoryList(page, size, query = {}) {
        try {
            let skip = (page - 1) * size;
            // Truyền query xuống repository
            var result = await this.categoryRepository.getCategoryList(skip, size, query);
            await this.session.commitTransaction();
            return result;
        } catch (error) {
            await this.session.abortTransaction();
            throw error;
        } finally {
            this.session.endSession();
        }
    }
}
module.exports = CategoryService;
