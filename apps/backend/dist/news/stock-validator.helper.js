"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockValidatorHelper = void 0;
const axios_1 = __importDefault(require("axios"));
class StockValidatorHelper {
    knownValidSymbols = new Set([
        'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD', 'INTC',
        'NFLX', 'UBER', 'LYFT', 'SNAP', 'TWTR', 'SHOP', 'PYPL', 'SQ', 'ZOOM', 'CRM',
        'ORCL', 'IBM', 'CSCO', 'ADBE', 'NOW', 'WDAY', 'OKTA', 'ZM', 'DOCU', 'PLTR',
        'COIN', 'HOOD', 'RBLX', 'U', 'DDOG', 'CRWD', 'ZS', 'SNOW', 'MDB', 'TEAM',
        'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'V', 'MA', 'AXP', 'COF',
        'JNJ', 'PFE', 'UNH', 'ABBV', 'BMY', 'MRK', 'GILD', 'AMGN', 'CVS', 'WBA',
        'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'VLO', 'PSX', 'OXY', 'KMI',
        'KO', 'PEP', 'WMT', 'TGT', 'HD', 'LOW', 'MCD', 'SBUX', 'NKE', 'DIS',
        'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'IVV', 'VEA', 'VWO', 'AGG', 'BND'
    ]);
    isKnownValidSymbol(symbol) {
        const upperSymbol = symbol.toUpperCase().trim();
        return {
            isValid: this.knownValidSymbols.has(upperSymbol),
            method: 'known_symbols',
            symbol: upperSymbol,
            reason: this.knownValidSymbols.has(upperSymbol) ? 'Found in known symbols' : 'Not in known symbols'
        };
    }
    hasValidFormat(symbol) {
        const upperSymbol = symbol.toUpperCase().trim();
        const isValidFormat = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/.test(upperSymbol);
        return {
            isValid: isValidFormat,
            method: 'format_check',
            symbol: upperSymbol,
            reason: isValidFormat ? 'Valid format' : 'Invalid format (must be 1-5 letters)'
        };
    }
    async validateWithYahooFinance(symbol) {
        try {
            const upperSymbol = symbol.toUpperCase().trim();
            const response = await axios_1.default.get(`https://query1.finance.yahoo.com/v8/finance/chart/${upperSymbol}`, {
                timeout: 8000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const chart = response.data.chart;
            const isValid = chart && chart.result && chart.result.length > 0 &&
                !chart.result[0].meta.error;
            if (isValid) {
                const meta = chart.result[0].meta;
                return {
                    isValid: true,
                    method: 'yahoo_finance_api',
                    symbol: upperSymbol,
                    reason: 'Found market data',
                    price: meta.regularMarketPrice
                };
            }
            return {
                isValid: false,
                method: 'yahoo_finance_api',
                symbol: upperSymbol,
                reason: 'No market data found'
            };
        }
        catch (error) {
            return {
                isValid: false,
                method: 'yahoo_finance_api',
                symbol: symbol.toUpperCase(),
                error: axios_1.default.isAxiosError(error) && error.response?.status === 404
                    ? 'Symbol not found'
                    : error.message
            };
        }
    }
    async validateSymbol(symbol) {
        const formatResult = this.hasValidFormat(symbol);
        if (!formatResult.isValid) {
            return formatResult;
        }
        const knownResult = this.isKnownValidSymbol(symbol);
        if (knownResult.isValid) {
            return knownResult;
        }
        const apiResult = await this.validateWithYahooFinance(symbol);
        return apiResult;
    }
    getSuggestions(invalidSymbol) {
        const upper = invalidSymbol.toUpperCase();
        const suggestions = [];
        for (const validSymbol of this.knownValidSymbols) {
            if (validSymbol.includes(upper) || upper.includes(validSymbol)) {
                suggestions.push(validSymbol);
            }
            if (suggestions.length >= 5)
                break;
        }
        return suggestions;
    }
}
exports.StockValidatorHelper = StockValidatorHelper;
//# sourceMappingURL=stock-validator.helper.js.map