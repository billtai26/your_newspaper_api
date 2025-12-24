var ObjectId = require('mongodb').ObjectId; 

class NewsRepository {
    context;
    session;
    
    constructor(context, session = null) {
        this.context = context; 
        this.session = session;
    }

    // Thêm tin tức
    async insertNews(news) {
        var session = this.session;
        // Sử dụng insertOne giống mẫu
        return await this.context.collection("news").insertOne(news, { session });
    }

    // Cập nhật tin tức
    async updateNews(news) {
        var session = this.session;
        // Sử dụng updateOne với $set và ObjectId giống mẫu
        return await this.context.collection("news").updateOne(
            { "_id": new ObjectId(news._id) },
            { $set: news },
            { session }
        );
    }

    // Xóa tin tức
    async deleteNews(id) {
        var session = this.session;
        // Sử dụng deleteOne giống mẫu
        return await this.context.collection("news").deleteOne(
            { "_id": new ObjectId(id) },
            { session }
        );
    }

    // Lấy danh sách tin tức
    async getNewsList(skip, take) {
        // Sử dụng find, skip, limit giống mẫu
        const cursor = await this.context.collection("news")
            .find({}, {})
            .sort({ createAt: -1 })
            .skip(skip)
            .limit(take);
        return await cursor.toArray(); 
    }

    // Đếm tổng số lượng tin tức để tính tổng số trang
    async countNews() {
        return await this.context.collection("news").countDocuments({});
    }
    
    // Lấy chi tiết 1 tin
    async getNews(id){
        return await this.context.collection("news").findOne({"_id": new ObjectId(id) },{});
    }
}

module.exports = NewsRepository;
