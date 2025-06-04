import { Product as ProductType } from './types';
import prisma from './prisma';

// Pomocný typ pro raw dotazy
interface EmbeddingRow {
  id?: string;
  productId?: string;
  embedding: string;
}

/**
 * Funkce pro získání produktu včetně jeho embeddingu
 */
export async function getProductWithEmbedding(productId: string): Promise<ProductType | null> {
  try {
    // Získání produktu
    const dbProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!dbProduct) {
      return null;
    }

    // Získání embeddingu
    const embeddingResult = await prisma.$queryRaw<EmbeddingRow[]>`
      SELECT embedding FROM "ProductEmbedding" WHERE "productId" = ${productId}
    `;

    // Transformace produktu na typ Product
    const product: ProductType = {
      id: dbProduct.id,
      name: dbProduct.name,
      description: dbProduct.description ?? undefined,
      price: dbProduct.price,
      category: dbProduct.category ?? undefined,
      imageUrl: dbProduct.imageUrl ?? undefined,
      externalUrl: dbProduct.externalUrl ?? undefined,
      hasTrial: dbProduct.hasTrial,
      detailInfo: dbProduct.detailInfo ?? undefined,
    };

    // Parsování JSON polí
    if (dbProduct.tags) {
      product.tags = JSON.parse(JSON.stringify(dbProduct.tags));
    }
    
    if (dbProduct.advantages) {
      product.advantages = JSON.parse(JSON.stringify(dbProduct.advantages));
    }
    
    if (dbProduct.disadvantages) {
      product.disadvantages = JSON.parse(JSON.stringify(dbProduct.disadvantages));
    }
    
    if (dbProduct.pricingInfo) {
      product.pricingInfo = JSON.parse(JSON.stringify(dbProduct.pricingInfo));
    }
    
    if (dbProduct.videoUrls) {
      product.videoUrls = JSON.parse(JSON.stringify(dbProduct.videoUrls));
    }
    
    // Přidání embeddingu, pokud existuje
    if (embeddingResult && embeddingResult.length > 0) {
      product.embedding = JSON.parse(embeddingResult[0].embedding);
    }

    return product;
  } catch (error) {
    console.error('Chyba při získávání produktu s embeddingem:', error);
    return null;
  }
}

/**
 * Funkce pro uložení embeddingu k produktu
 */
export async function saveProductEmbedding(productId: string, embedding: number[]): Promise<boolean> {
  try {
    // Kontrola, zda produkt existuje
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      console.error('Produkt s ID', productId, 'neexistuje');
      return false;
    }

    // Kontrola, zda již existuje embedding
    const existingEmbedding = await prisma.$queryRaw<EmbeddingRow[]>`
      SELECT id FROM "ProductEmbedding" WHERE "productId" = ${productId}
    `;

    if (existingEmbedding && existingEmbedding.length > 0) {
      // Aktualizace existujícího embeddingu
      await prisma.$executeRaw`
        UPDATE "ProductEmbedding" 
        SET embedding = ${JSON.stringify(embedding)}, "updatedAt" = NOW()
        WHERE "productId" = ${productId}
      `;
    } else {
      // Vytvoření nového embeddingu
      await prisma.$executeRaw`
        INSERT INTO "ProductEmbedding" ("id", "productId", "embedding", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${productId}, ${JSON.stringify(embedding)}, NOW(), NOW())
      `;
    }
    
    return true;
  } catch (error) {
    console.error('Chyba při ukládání embeddingu:', error);
    return false;
  }
}

/**
 * Funkce pro získání všech produktů včetně jejich embeddingů
 */
export async function getAllProductsWithEmbeddings(): Promise<ProductType[]> {
  try {
    // Získání všech produktů
    const dbProducts = await prisma.product.findMany();

    // Získání všech embeddingů
    const embeddings = await prisma.$queryRaw<EmbeddingRow[]>`
      SELECT "productId", embedding FROM "ProductEmbedding"
    `;

    // Vytvoření mapy embeddingů podle productId
    const embeddingMap = new Map<string, number[]>();
    if (embeddings && Array.isArray(embeddings)) {
      embeddings.forEach((emb: EmbeddingRow) => {
        if (emb.productId) {
          embeddingMap.set(emb.productId, JSON.parse(emb.embedding));
        }
      });
    }

    // Transformace produktů na typ Product
    return dbProducts.map(dbProduct => {
      const product: ProductType = {
        id: dbProduct.id,
        name: dbProduct.name,
        description: dbProduct.description ?? undefined,
        price: dbProduct.price,
        category: dbProduct.category ?? undefined,
        imageUrl: dbProduct.imageUrl ?? undefined,
        externalUrl: dbProduct.externalUrl ?? undefined,
        hasTrial: dbProduct.hasTrial,
        detailInfo: dbProduct.detailInfo ?? undefined,
      };
  
      // Parsování JSON polí
      if (dbProduct.tags) {
        product.tags = JSON.parse(JSON.stringify(dbProduct.tags));
      }
      
      if (dbProduct.advantages) {
        product.advantages = JSON.parse(JSON.stringify(dbProduct.advantages));
      }
      
      if (dbProduct.disadvantages) {
        product.disadvantages = JSON.parse(JSON.stringify(dbProduct.disadvantages));
      }
      
      if (dbProduct.pricingInfo) {
        product.pricingInfo = JSON.parse(JSON.stringify(dbProduct.pricingInfo));
      }
      
      if (dbProduct.videoUrls) {
        product.videoUrls = JSON.parse(JSON.stringify(dbProduct.videoUrls));
      }
      
      // Přidání embeddingu, pokud existuje
      if (embeddingMap.has(dbProduct.id)) {
        product.embedding = embeddingMap.get(dbProduct.id);
      }
  
      return product;
    });
  } catch (error) {
    console.error('Chyba při získávání všech produktů s embeddingy:', error);
    return [];
  }
}

export { prisma }; 