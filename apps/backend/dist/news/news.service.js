"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var NewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const openai_1 = __importDefault(require("openai"));
let NewsService = NewsService_1 = class NewsService {
    logger = new common_1.Logger(NewsService_1.name);
    serpApiKey = process.env.SERPAPI_API_KEY;
    baseUrl = 'https://serpapi.com/search';
    dataDir = path.join(process.cwd(), 'data', 'news');
    openai;
    constructor() {
        this.openai = process.env.OPENAI_API_KEY
            ? new openai_1.default({ apiKey: process.env.OPENAI_API_KEY })
            : null;
    }
    async getStockNews(symbol) {
        if (!this.serpApiKey) {
            this.logger.warn('SERPAPI_API_KEY not configured, returning null');
            return null;
        }
        try {
            const companyName = this.getCompanyName(symbol);
            const response = await axios_1.default.get(this.baseUrl, {
                params: {
                    engine: 'google_news',
                    q: `${companyName} ${symbol} stock`,
                    gl: 'us',
                    hl: 'en',
                    api_key: this.serpApiKey,
                },
                timeout: 10000,
            });
            if (response.data.error) {
                this.logger.error(`SerpAPI error: ${response.data.error}`);
                return null;
            }
            const newsResults = response.data.news_results;
            if (!newsResults || newsResults.length === 0) {
                this.logger.warn(`No news found for ${symbol}`);
                return null;
            }
            const topNews = newsResults[0];
            const headline = topNews.title || `Latest news for ${symbol}`;
            const sentiment = await this.analyzeSentimentWithAI(headline);
            const newsData = {
                headline,
                sentiment,
                source: 'google_news + claude_ai',
            };
            await this.storeNewsData(symbol, newsData, newsResults);
            return newsData;
        }
        catch (error) {
            this.logger.error(`Failed to fetch news for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    }
    getCompanyName(symbol) {
        const companyMap = {
            AAPL: 'Apple',
            TSLA: 'Tesla',
            MSFT: 'Microsoft',
            GOOGL: 'Google Alphabet',
            AMZN: 'Amazon',
            NVDA: 'NVIDIA',
            META: 'Meta Facebook',
            NFLX: 'Netflix',
            AVGO: 'Broadcom',
            AMD: 'AMD',
        };
        return companyMap[symbol] || symbol;
    }
    async analyzeSentimentWithAI(headline) {
        const claudeResult = await this.tryClaudeSentiment(headline);
        if (claudeResult) {
            this.logger.log('Sentiment analyzed with Claude AI');
            return claudeResult;
        }
        const openaiResult = await this.tryOpenAISentiment(headline);
        if (openaiResult) {
            this.logger.log('Sentiment analyzed with OpenAI');
            return openaiResult;
        }
        this.logger.log('Using keyword fallback for sentiment analysis');
        return this.fallbackSentiment(headline);
    }
    async tryClaudeSentiment(headline) {
        const claudeApiKey = process.env.CLAUDE_API_KEY;
        if (!claudeApiKey) {
            return null;
        }
        try {
            const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
                model: 'claude-3-sonnet-20240229',
                max_tokens: 10,
                messages: [
                    {
                        role: 'user',
                        content: `Sentiment of "${headline}": positive, negative, or neutral?`
                    }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': claudeApiKey,
                    'anthropic-version': '2023-06-01'
                },
                timeout: 8000
            });
            const sentiment = response.data.content[0]?.text?.trim().toLowerCase();
            if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
                return sentiment;
            }
            return null;
        }
        catch (error) {
            this.logger.warn('Claude API failed, trying OpenAI...');
            return null;
        }
    }
    async tryOpenAISentiment(headline) {
        if (!this.openai) {
            return null;
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: `Analyze the sentiment of this stock headline. Respond with only one word: positive, negative, or neutral.

Headline: "${headline}"`
                    }
                ],
                max_tokens: 10,
                temperature: 0
            });
            const sentiment = response.choices[0]?.message?.content?.trim().toLowerCase();
            if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
                return sentiment;
            }
            return null;
        }
        catch (error) {
            this.logger.warn('OpenAI API failed, using keyword fallback...');
            return null;
        }
    }
    fallbackSentiment(headline) {
        const positiveWords = ['up', 'rise', 'gain', 'growth', 'surge', 'strong', 'beat', 'profit'];
        const negativeWords = ['down', 'fall', 'drop', 'decline', 'loss', 'crash', 'weak', 'miss'];
        const lowerHeadline = headline.toLowerCase();
        const hasPositive = positiveWords.some(word => lowerHeadline.includes(word));
        const hasNegative = negativeWords.some(word => lowerHeadline.includes(word));
        if (hasPositive && !hasNegative)
            return 'positive';
        if (hasNegative && !hasPositive)
            return 'negative';
        return 'neutral';
    }
    async storeNewsData(symbol, newsData, allArticles) {
        try {
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
            }
            const timestamp = new Date().toISOString();
            const filename = `${symbol}_${timestamp.split('T')[0]}_${Date.now()}.json`;
            const filepath = path.join(this.dataDir, filename);
            const storageData = {
                symbol,
                timestamp,
                query: `${this.getCompanyName(symbol)} ${symbol} stock`,
                summary: newsData,
                allArticles: allArticles.slice(0, 10),
                metadata: {
                    totalArticles: allArticles.length,
                    source: 'serpapi_google_news',
                    sentimentMethodsAvailable: {
                        claude: process.env.CLAUDE_API_KEY ? true : false,
                        openai: process.env.OPENAI_API_KEY ? true : false,
                        keyword: true
                    },
                    sentimentHierarchy: 'Claude → OpenAI → Keyword'
                }
            };
            fs.writeFileSync(filepath, JSON.stringify(storageData, null, 2));
            this.logger.log(`News data stored: ${filename}`);
            const latestFile = path.join(this.dataDir, `${symbol}_latest.json`);
            fs.writeFileSync(latestFile, JSON.stringify(storageData, null, 2));
        }
        catch (error) {
            this.logger.error(`Failed to store news data for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }
    getStoredNewsData(symbol) {
        try {
            const latestFile = path.join(this.dataDir, `${symbol}_latest.json`);
            if (fs.existsSync(latestFile)) {
                const data = fs.readFileSync(latestFile, 'utf8');
                return JSON.parse(data);
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Failed to read stored news data for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = NewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], NewsService);
//# sourceMappingURL=news.service.js.map