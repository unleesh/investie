export interface ValidationResult {
    isValid: boolean;
    symbol: string;
    method: string;
    reason?: string;
    error?: string;
    price?: number;
}
export declare class StockValidatorHelper {
    private knownValidSymbols;
    isKnownValidSymbol(symbol: string): ValidationResult;
    hasValidFormat(symbol: string): ValidationResult;
    validateWithYahooFinance(symbol: string): Promise<ValidationResult>;
    validateSymbol(symbol: string): Promise<ValidationResult>;
    getSuggestions(invalidSymbol: string): string[];
}
