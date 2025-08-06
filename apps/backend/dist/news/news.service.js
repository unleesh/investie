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
const stock_validator_helper_1 = require("./stock-validator.helper");
let NewsService = NewsService_1 = class NewsService {
    logger = new common_1.Logger(NewsService_1.name);
    serpApiKey = process.env.SERPAPI_API_KEY;
    baseUrl = 'https://serpapi.com/search';
    dataDir = path.join(process.cwd(), 'data', 'news');
    macroNewsDir = path.join(this.dataDir, 'macro_news');
    stockNewsDir = path.join(this.dataDir, 'stock_news');
    openai;
    stockValidator;
    constructor() {
        this.openai = process.env.OPENAI_API_KEY
            ? new openai_1.default({ apiKey: process.env.OPENAI_API_KEY })
            : null;
        this.stockValidator = new stock_validator_helper_1.StockValidatorHelper();
    }
    async processStockNews(inputSymbol) {
        this.logger.log(`Starting news processing workflow for: ${inputSymbol}`);
        try {
            const validationResult = await this.stockValidator.validateSymbol(inputSymbol);
            if (!validationResult.isValid) {
                this.logger.warn(`Symbol validation failed for ${inputSymbol}: ${validationResult.reason || validationResult.error}`);
                const suggestions = this.stockValidator.getSuggestions(inputSymbol);
                return {
                    isValid: false,
                    error: validationResult.reason || validationResult.error || 'Invalid symbol',
                    suggestions,
                    validationResult
                };
            }
            const symbol = validationResult.symbol;
            const today = this.getTodayDateString();
            this.logger.log(`Symbol validated: ${symbol} (${validationResult.method})`);
            let macroNews = null;
            if (!this.hasTodaysMacroNews(today)) {
                macroNews = await this.loadMacroNews(today);
                if (macroNews) {
                    this.storeMacroNews(macroNews, today);
                }
            }
            else {
                macroNews = this.loadStoredMacroNews(today);
                this.logger.log('Using cached macro news');
            }
            let stockNews = null;
            if (!this.hasTodaysStockNews(symbol, today)) {
                stockNews = await this.loadStockNews(symbol, today);
                if (stockNews) {
                    this.storeStockNews(stockNews, symbol, today);
                }
            }
            else {
                stockNews = this.loadStoredStockNews(symbol, today);
                this.logger.log(`Using cached stock news for ${symbol}`);
            }
            if (!macroNews && !stockNews) {
                this.logger.warn(`No news data available for ${symbol}`);
                return {
                    isValid: false,
                    error: 'Unable to fetch news data - check API keys and network connection'
                };
            }
            const overview = await this.generateOverview(symbol, stockNews, macroNews);
            if (overview) {
                this.storeOverview(overview, symbol, today);
                this.logger.log(`Overview generated for ${symbol}: ${overview.recommendation} (${overview.confidence}%)`);
                return {
                    isValid: true,
                    symbol,
                    overview,
                    validationResult
                };
            }
            else {
                this.logger.warn(`Failed to generate overview for ${symbol}`);
                return {
                    isValid: false,
                    error: 'Failed to generate investment overview'
                };
            }
        }
        catch (error) {
            this.logger.error(`Error in processStockNews for ${inputSymbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Unknown processing error'
            };
        }
    }
    getTodayDateString() {
        return new Date().toISOString().split('T')[0];
    }
    ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    getMacroNewsPath(date) {
        return path.join(this.macroNewsDir, date, 'macro_news.json');
    }
    getStockNewsPath(symbol, date) {
        return path.join(this.stockNewsDir, symbol, date, 'stock_news.json');
    }
    getOverviewPath(symbol, date) {
        return path.join(this.stockNewsDir, symbol, date, 'overview.json');
    }
    hasTodaysMacroNews(date) {
        const macroPath = this.getMacroNewsPath(date);
        return fs.existsSync(macroPath);
    }
    hasTodaysStockNews(symbol, date) {
        const stockPath = this.getStockNewsPath(symbol, date);
        return fs.existsSync(stockPath);
    }
    loadStoredMacroNews(date) {
        try {
            const macroPath = this.getMacroNewsPath(date);
            if (fs.existsSync(macroPath)) {
                const data = fs.readFileSync(macroPath, 'utf8');
                return JSON.parse(data);
            }
        }
        catch (error) {
            this.logger.error(`Failed to load macro news for ${date}:`, error instanceof Error ? error.message : 'Unknown error');
        }
        return null;
    }
    loadStoredStockNews(symbol, date) {
        try {
            const stockPath = this.getStockNewsPath(symbol, date);
            if (fs.existsSync(stockPath)) {
                const data = fs.readFileSync(stockPath, 'utf8');
                return JSON.parse(data);
            }
        }
        catch (error) {
            this.logger.error(`Failed to load stock news for ${symbol} on ${date}:`, error instanceof Error ? error.message : 'Unknown error');
        }
        return null;
    }
    async loadMacroNews(date) {
        this.logger.log('Fetching macro market news...');
        if (!this.serpApiKey) {
            this.logger.warn('SerpAPI key not configured, skipping macro news');
            return null;
        }
        try {
            const response = await axios_1.default.get(this.baseUrl, {
                params: {
                    engine: 'google_news',
                    q: 'stock market economy finance business',
                    gl: 'us',
                    hl: 'en',
                    num: 75,
                    api_key: this.serpApiKey,
                },
                timeout: 15000,
            });
            if (response.data.error) {
                this.logger.error('SerpAPI error for macro news:', response.data.error);
                return null;
            }
            const newsResults = response.data.news_results;
            if (!newsResults || newsResults.length === 0) {
                this.logger.warn('No macro news results found');
                return null;
            }
            this.logger.log(`Fetched ${newsResults.length} macro news articles`);
            const topHeadline = newsResults[0].title || 'Market news';
            return {
                topHeadline,
                articles: newsResults,
                totalArticles: newsResults.length,
                source: 'serpapi_google_news',
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.logger.error('Error fetching macro news:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    }
    async loadStockNews(symbol, date) {
        this.logger.log(`Fetching stock news for ${symbol}...`);
        if (!this.serpApiKey) {
            this.logger.warn('SerpAPI key not configured, skipping stock news');
            return null;
        }
        try {
            const companyMap = {
                AAPL: 'Apple',
                TSLA: 'Tesla',
                MSFT: 'Microsoft',
                GOOGL: 'Google Alphabet',
                AMZN: 'Amazon',
                NVDA: 'NVIDIA',
                META: 'Meta Facebook',
                NFLX: 'Netflix'
            };
            const companyName = companyMap[symbol] || symbol;
            const query = `${companyName} ${symbol} stock`;
            const response = await axios_1.default.get(this.baseUrl, {
                params: {
                    engine: 'google_news',
                    q: query,
                    gl: 'us',
                    hl: 'en',
                    num: 10,
                    api_key: this.serpApiKey,
                },
                timeout: 15000,
            });
            if (response.data.error) {
                this.logger.error(`SerpAPI error for ${symbol}:`, response.data.error);
                return null;
            }
            const newsResults = response.data.news_results;
            if (!newsResults || newsResults.length === 0) {
                this.logger.warn(`No news results found for ${symbol}`);
                return null;
            }
            this.logger.log(`Fetched ${newsResults.length} news articles for ${symbol}`);
            const topHeadline = newsResults[0].title || `${symbol} stock news`;
            return {
                headline: topHeadline,
                source: 'google_news + ai_analysis',
                _fullArticles: newsResults
            };
        }
        catch (error) {
            this.logger.error(`Error fetching stock news for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    }
    async generateOverview(symbol, stockNews, macroNews) {
        this.logger.log(`Generating overview for ${symbol}...`);
        const claudeResult = await this.analyzeWithClaude(symbol, stockNews, macroNews);
        if (claudeResult) {
            return claudeResult;
        }
        const openaiResult = await this.analyzeWithOpenAI(symbol, stockNews, macroNews);
        if (openaiResult) {
            return openaiResult;
        }
        return this.generateBasicOverview(symbol, stockNews, macroNews);
    }
    async analyzeWithClaude(symbol, stockNews, macroNews) {
        const claudeApiKey = process.env.CLAUDE_API_KEY;
        if (!claudeApiKey) {
            this.logger.warn('Claude API key not configured');
            return null;
        }
        try {
            const prompt = this.buildAnalysisPrompt(symbol, stockNews, macroNews);
            const response = await axios_1.default.post('https://api.anthropic.com/v1/messages', {
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                messages: [{
                        role: 'user',
                        content: prompt
                    }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': claudeApiKey,
                    'anthropic-version': '2023-06-01'
                },
                timeout: 15000
            });
            const content = response.data.content?.[0]?.text;
            if (content) {
                try {
                    const parsed = JSON.parse(content);
                    if (parsed.overview && parsed.recommendation && parsed.confidence) {
                        return {
                            symbol,
                            overview: parsed.overview,
                            recommendation: parsed.recommendation,
                            confidence: parsed.confidence,
                            keyFactors: parsed.keyFactors || [],
                            riskLevel: parsed.riskLevel || 'MEDIUM',
                            timeHorizon: parsed.timeHorizon || '3-6 months',
                            source: 'claude_ai_analysis',
                            timestamp: new Date().toISOString()
                        };
                    }
                }
                catch (parseError) {
                    this.logger.warn('Failed to parse Claude response as JSON');
                }
            }
        }
        catch (error) {
            this.logger.warn('Claude analysis failed:', error instanceof Error ? error.message : 'Unknown error');
        }
        return null;
    }
    async analyzeWithOpenAI(symbol, stockNews, macroNews) {
        if (!this.openai) {
            this.logger.warn('OpenAI not configured');
            return null;
        }
        try {
            const prompt = this.buildAnalysisPrompt(symbol, stockNews, macroNews);
            const models = ['gpt-4-1106-preview', 'gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];
            let completion;
            for (const model of models) {
                try {
                    this.logger.log(`Attempting OpenAI analysis with model: ${model}`);
                    completion = await this.openai.chat.completions.create({
                        model,
                        messages: [{ role: 'user', content: prompt }],
                        max_tokens: 600,
                        temperature: 0.2,
                        response_format: { type: "json_object" }
                    });
                    this.logger.log(`Successfully used OpenAI model: ${model}`);
                    break;
                }
                catch (modelError) {
                    this.logger.warn(`Model ${model} failed, trying next:`, modelError instanceof Error ? modelError.message : 'Unknown error');
                    continue;
                }
            }
            if (!completion) {
                throw new Error('All OpenAI models failed');
            }
            const content = completion.choices[0]?.message?.content;
            if (content) {
                try {
                    const parsed = JSON.parse(content);
                    if (parsed.overview && parsed.recommendation && parsed.confidence) {
                        return {
                            symbol,
                            overview: parsed.overview,
                            recommendation: parsed.recommendation,
                            confidence: parsed.confidence,
                            keyFactors: parsed.keyFactors || [],
                            riskLevel: parsed.riskLevel || 'MEDIUM',
                            timeHorizon: parsed.timeHorizon || '3-6 months',
                            source: 'openai_analysis',
                            timestamp: new Date().toISOString()
                        };
                    }
                }
                catch (parseError) {
                    this.logger.warn('Failed to parse OpenAI response as JSON');
                }
            }
        }
        catch (error) {
            this.logger.warn('OpenAI analysis failed:', error instanceof Error ? error.message : 'Unknown error');
        }
        return null;
    }
    buildAnalysisPrompt(symbol, stockNews, macroNews) {
        let prompt = `Analyze ${symbol} stock for investment recommendation based on the following news data:\n\n`;
        if (stockNews) {
            prompt += `COMPANY-SPECIFIC NEWS:\n`;
            prompt += `- Headline: ${stockNews.headline}\n`;
            prompt += `- Source: ${stockNews.source}\n`;
            const stockNewsWithArticles = stockNews;
            if (stockNewsWithArticles._fullArticles && stockNewsWithArticles._fullArticles.length > 1) {
                prompt += `- Additional Headlines:\n`;
                stockNewsWithArticles._fullArticles.slice(1, 6).forEach((article, index) => {
                    prompt += `  ${index + 2}. ${article.title}\n`;
                });
            }
            prompt += '\n';
        }
        if (macroNews && macroNews.articles && macroNews.articles.length > 0) {
            prompt += `MARKET & ECONOMIC NEWS:\n`;
            prompt += `- Top Headline: ${macroNews.topHeadline}\n`;
            prompt += `- Additional Headlines:\n`;
            macroNews.articles.slice(0, 5).forEach((article, index) => {
                prompt += `  ${index + 1}. ${article.title}\n`;
            });
            prompt += '\n';
        }
        prompt += `Based on this news analysis, provide an investment assessment for ${symbol} in the following JSON format:
{
  "overview": "2-3 sentence analysis of the stock's outlook based on the news",
  "recommendation": "BUY|HOLD|SELL",
  "confidence": 1-100,
  "keyFactors": ["factor1", "factor2", "factor3"],
  "riskLevel": "LOW|MEDIUM|HIGH",
  "timeHorizon": "1-3 months|3-6 months|6-12 months"
}

Focus on:
- Company performance indicators from news
- Market conditions and economic factors
- Industry trends
- Risk factors mentioned in news
- Growth opportunities or concerns`;
        return prompt;
    }
    generateBasicOverview(symbol, stockNews, macroNews) {
        const keyFactors = [];
        let confidence = 50;
        if (stockNews?.headline) {
            keyFactors.push('Company-specific news data available');
            confidence += 10;
        }
        else {
            keyFactors.push('Limited company-specific information');
            confidence -= 5;
        }
        if (macroNews?.articles && macroNews.articles.length > 0) {
            keyFactors.push('Market environment data available');
            confidence += 5;
        }
        else {
            keyFactors.push('Limited market context');
        }
        keyFactors.push('AI analysis unavailable - conservative assessment');
        return {
            symbol,
            overview: `Unable to perform AI-powered analysis for ${symbol}. Based on available news data, recommend conducting manual research before making investment decisions. ${stockNews ? 'Company news is available for review.' : 'Limited company-specific news available.'} ${macroNews ? 'Market context data is available for analysis.' : 'Limited broader market context.'}`,
            recommendation: 'HOLD',
            confidence: Math.max(30, Math.min(confidence, 70)),
            keyFactors,
            riskLevel: 'MEDIUM',
            timeHorizon: '3-6 months',
            source: 'fallback_data_analysis',
            timestamp: new Date().toISOString()
        };
    }
    storeMacroNews(macroNews, date) {
        try {
            const macroDir = path.join(this.macroNewsDir, date);
            this.ensureDirectoryExists(macroDir);
            const macroPath = this.getMacroNewsPath(date);
            const storeData = {
                date,
                timestamp: macroNews.timestamp,
                query: 'stock market economy finance business',
                topHeadline: macroNews.topHeadline,
                totalArticles: macroNews.totalArticles,
                articles: macroNews.articles,
                metadata: {
                    source: macroNews.source,
                    cached: false
                }
            };
            fs.writeFileSync(macroPath, JSON.stringify(storeData, null, 2));
            this.logger.log(`Macro news stored: ${macroPath}`);
        }
        catch (error) {
            this.logger.error('Failed to store macro news:', error instanceof Error ? error.message : 'Unknown error');
        }
    }
    storeStockNews(stockNews, symbol, date) {
        try {
            const stockDir = path.join(this.stockNewsDir, symbol, date);
            this.ensureDirectoryExists(stockDir);
            const stockPath = this.getStockNewsPath(symbol, date);
            const stockNewsWithArticles = stockNews;
            const fullArticles = stockNewsWithArticles._fullArticles;
            const storeData = {
                symbol,
                date,
                timestamp: new Date().toISOString(),
                query: `${symbol} stock`,
                summary: {
                    headline: stockNews.headline,
                    source: stockNews.source
                },
                ...(fullArticles && {
                    articles: fullArticles,
                    totalArticles: fullArticles.length
                }),
                metadata: {
                    source: stockNews.source,
                    cached: false
                }
            };
            fs.writeFileSync(stockPath, JSON.stringify(storeData, null, 2));
            this.logger.log(`Stock news stored: ${stockPath}`);
        }
        catch (error) {
            this.logger.error(`Failed to store stock news for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }
    storeOverview(overview, symbol, date) {
        try {
            const stockDir = path.join(this.stockNewsDir, symbol, date);
            this.ensureDirectoryExists(stockDir);
            const overviewPath = this.getOverviewPath(symbol, date);
            const storeData = {
                symbol: overview.symbol,
                overview: overview.overview,
                recommendation: overview.recommendation,
                confidence: overview.confidence,
                keyFactors: overview.keyFactors,
                riskLevel: overview.riskLevel,
                timeHorizon: overview.timeHorizon,
                source: overview.source,
                timestamp: overview.timestamp,
                date,
                metadata: {
                    generatedAt: overview.timestamp,
                    testMode: false
                }
            };
            fs.writeFileSync(overviewPath, JSON.stringify(storeData, null, 2));
            this.logger.log(`Overview stored: ${overviewPath}`);
        }
        catch (error) {
            this.logger.error(`Failed to store overview for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
        }
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = NewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], NewsService);
//# sourceMappingURL=news.service.js.map