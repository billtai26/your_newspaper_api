var DatabaseConnection = require(global.__basedir + '/src/Database/Database'); 
var Config = require(global.__basedir + "/src/configs/config"); 
var NewsRepository = require(global.__basedir + "/src/repositories/NewsRepository");

class NewsService {
    newsRepository;
    session;
    client;
    database;

    constructor() {
        this.client = DatabaseConnection.getMongoClient();
        this.session = this.client.startSession();
        this.database = this.client.db(Config.mongodb.database); 
        
        // Bắt đầu transaction
        this.session.startTransaction(); // [cite: 115]
        this.newsRepository = new NewsRepository(this.database, this.session); 
    }

    async insertNews(news) {
        try {
            var result = await this.newsRepository.insertNews(news);
            await this.session.commitTransaction(); 
            this.session.endSession(); 
            return true;
        } catch (error) {
            await this.session.abortTransaction();
            this.session.endSession(); 
            return false;
        }
    }

    async updateNews(news) {
        try {
            var result = await this.newsRepository.updateNews(news);
            await this.session.commitTransaction();
            this.session.endSession();
            return result;
        } catch(error) {
            await this.session.abortTransaction();
            this.session.endSession();
            return false;
        }
    }

    async deleteNews(id) {
        try {
            var result = await this.newsRepository.deleteNews(id);
            await this.session.commitTransaction(); 
            this.session.endSession(); 
            return result;
        } catch(error) {
            await this.session.abortTransaction();
            this.session.endSession();
            return false;
        }
    }

    async getNewsList() {
        // Lấy 100 tin đầu tiên
        var list = await this.newsRepository.getNewsList(0, 100);
        return list;
    }

    async getNewsWithPagination(page, limit, search, categoryId) {
        const currentPage = parseInt(page) || 1;
        const itemsPerPage = parseInt(limit) || 10;
        
        try {
            const skip = (currentPage - 1) * itemsPerPage;
            const filters = { search, categoryId };

            // Thực hiện truy vấn song song
            const [newsList, totalItems] = await Promise.all([
                this.newsRepository.getNewsList(skip, itemsPerPage, filters),
                this.newsRepository.countNews(filters)
            ]);

            const totalPages = Math.ceil(totalItems / itemsPerPage);

            return {
                success: true,
                data: newsList,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage,
                    itemsPerPage
                }
            };
        } catch (error) {
            console.error("Lỗi tại NewsService.getNewsWithPagination:", error);

            return {
                success: false,
                message: "Không thể lấy danh sách bài viết. Vui lòng thử lại sau.",
                data: [], // Trả về mảng rỗng để Frontend không bị lỗi .map()
                pagination: {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: currentPage,
                    itemsPerPage: itemsPerPage
                }
            };
        } finally {
            // Đảm bảo phiên làm việc luôn được đóng dù thành công hay thất bại
            if (this.session) {
                this.session.endSession();
            }
        }
    }

    async getNewsById(id) {
        try {
            // Gọi hàm getNews đã có trong NewsRepository
            const result = await this.newsRepository.getNews(id);
            
            // Vì constructor của bạn startTransaction nên phải commit/abort trước khi endSession
            await this.session.commitTransaction(); 
            return result;
        } catch (error) {
            console.error("Lỗi lấy chi tiết tin:", error);
            await this.session.abortTransaction();
            throw error;
        } finally {
            this.session.endSession();
        }
    }
}
module.exports = NewsService;
