var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
// Inicializace Prisma klienta
var prisma = new PrismaClient();
/**
 * Exportuje všechny produkty z databáze do JSON souboru
 * @returns {Promise<string>} Cesta k vytvořenému souboru
 */
export function exportProductsToFile() {
    return __awaiter(this, void 0, void 0, function () {
        var products, processedProducts, dataDir, filePath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('=== Export produktů: Začátek exportu ===');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Získáme všechny produkty z databáze
                    console.log('Export produktů: Načítám produkty z databáze...');
                    return [4 /*yield*/, prisma.product.findMany({
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                category: true,
                                price: true,
                                tags: true,
                                advantages: true,
                                disadvantages: true,
                                pricingInfo: true,
                                videoUrls: true,
                                detailInfo: true,
                                imageUrl: true,
                                externalUrl: true,
                                hasTrial: true
                            }
                        })];
                case 2:
                    products = _a.sent();
                    console.log("Export produkt\u016F: Na\u010Dteno ".concat(products.length, " produkt\u016F z datab\u00E1ze"));
                    // Zpracujeme produkty, abychom předešli problémům s JSON formátem
                    console.log('Export produktů: Zpracovávám produkty...');
                    processedProducts = products.map(function (product) {
                        try {
                            // Přeskočíme problematický produkt
                            if (product.id === '8b1ad8a1-5afb-40d4-b11d-48c33b606723') {
                                console.log("Export produkt\u016F: Speci\u00E1ln\u00ED zpracov\u00E1n\u00ED problematick\u00E9ho produktu ".concat(product.id));
                                return __assign(__assign({}, product), { tags: [], advantages: [], disadvantages: [], pricingInfo: {}, videoUrls: [] });
                            }
                            // Bezpečné parsování JSON polí
                            var safelyParse = function (field, defaultValue) {
                                if (!field)
                                    return defaultValue;
                                if (typeof field !== 'string')
                                    return field;
                                try {
                                    return JSON.parse(field);
                                }
                                catch (e) {
                                    console.warn("Export produkt\u016F: Chyba p\u0159i parsov\u00E1n\u00ED pole u produktu ".concat(product.id, ":"), e);
                                    return defaultValue;
                                }
                            };
                            return __assign(__assign({}, product), { tags: safelyParse(product.tags, []), advantages: safelyParse(product.advantages, []), disadvantages: safelyParse(product.disadvantages, []), pricingInfo: safelyParse(product.pricingInfo, {}), videoUrls: safelyParse(product.videoUrls, []) });
                        }
                        catch (error) {
                            console.error("Export produkt\u016F: Chyba p\u0159i zpracov\u00E1n\u00ED produktu ".concat(product.id, ":"), error);
                            // Při chybě vrátíme produkt s prázdnými hodnotami
                            return __assign(__assign({}, product), { tags: [], advantages: [], disadvantages: [], pricingInfo: {}, videoUrls: [] });
                        }
                    });
                    dataDir = path.join(process.cwd(), 'data');
                    if (!fs.existsSync(dataDir)) {
                        console.log('Export produktů: Vytvářím složku data...');
                        fs.mkdirSync(dataDir, { recursive: true });
                    }
                    filePath = path.join(dataDir, 'products.json');
                    console.log("Export produkt\u016F: Ukl\u00E1d\u00E1m produkty do souboru ".concat(filePath, "..."));
                    // Uložíme JSON soubor (pretty-print pro čitelnost)
                    fs.writeFileSync(filePath, JSON.stringify(processedProducts, null, 2));
                    console.log("Export produkt\u016F: Export dokon\u010Den, vytvo\u0159en soubor ".concat(filePath, " s ").concat(processedProducts.length, " produkty"));
                    return [2 /*return*/, filePath];
                case 3:
                    error_1 = _a.sent();
                    console.error('Export produktů: Chyba při exportu produktů:', error_1);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
