import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definice produktů s vylepšenými informacemi
const updatedProducts = [
  {
    externalUrl: "https://www.elementor.com",
    updates: {
      disadvantages: [
        "Advanced features only in paid version",
        "Can slow down website loading with excessive features",
        "WordPress dependency",
        "Requires separate web hosting (not an all-in-one solution)",
        "Steep learning curve for advanced features"
      ],
      pricingInfo: {
        monthly: 0,
        yearly: 49,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["Basic templates", "Drag-and-drop editor", "Mobile responsiveness"]},
          {name: "Essential", price: 49, features: ["Pro templates", "Theme Builder", "Pop-up Builder", "WooCommerce Builder"]},
          {name: "Advanced", price: 99, features: ["Pro templates", "Theme Builder", "Pop-up Builder", "WooCommerce Builder", "25 websites"]},
          {name: "Expert", price: 199, features: ["Pro templates", "Theme Builder", "Pop-up Builder", "WooCommerce Builder", "1000 websites"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.webflow.com",
    updates: {
      disadvantages: [
        "Higher pricing tiers for advanced features",
        "Steep learning curve for beginners",
        "Limited functionality in free version",
        "Fewer plugins and extensions than competitors",
        "More challenging for non-technical users"
      ],
      pricingInfo: {
        monthly: 14,
        yearly: 144,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["2 pages", "Webflow.io domain", "Limited bandwidth"]},
          {name: "Basic", price: 14, features: ["100 pages", "Custom domain", "50GB bandwidth"]},
          {name: "CMS", price: 23, features: ["100 pages", "CMS functionality", "100GB bandwidth", "10,000 CMS items"]},
          {name: "Business", price: 39, features: ["Unlimited pages", "CMS functionality", "400GB bandwidth", "10,000 CMS items", "Form logic"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.wix.com",
    updates: {
      disadvantages: [
        "Wix ads displayed in free plan",
        "Difficult to switch templates after site creation",
        "Performance can be slower than competitors",
        "Limited control over SEO elements",
        "Can be more expensive than some alternatives"
      ],
      pricingInfo: {
        monthly: 16,
        yearly: 149,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["Wix branding", "Basic features", "Wix domain"]},
          {name: "Combo", price: 16, features: ["Custom domain", "No Wix ads", "30 minutes video"]},
          {name: "Unlimited", price: 22, features: ["Unlimited bandwidth", "Site booster app", "Visitor analytics"]},
          {name: "Business Basic", price: 27, features: ["Accept online payments", "Customer accounts", "eCommerce functionality"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.squarespace.com",
    updates: {
      disadvantages: [
        "Higher pricing compared to some competitors",
        "Limited customization without CSS/HTML knowledge",
        "Fewer third-party integrations",
        "Steeper learning curve for beginners",
        "Transaction fees on lower-tier plans"
      ],
      pricingInfo: {
        monthly: 16,
        yearly: 144,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {name: "Personal", price: 16, features: ["Unlimited bandwidth", "Unlimited storage", "Custom domain", "SSL security"]},
          {name: "Business", price: 23, features: ["All Personal features", "Professional email", "Advanced analytics", "3% transaction fee"]},
          {name: "Basic Commerce", price: 27, features: ["All Business features", "0% transaction fees", "Point of Sale", "Customer accounts"]},
          {name: "Advanced Commerce", price: 49, features: ["All Basic Commerce features", "Abandoned cart recovery", "Subscriptions", "Advanced shipping"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.shopify.com",
    updates: {
      disadvantages: [
        "Transaction fees when not using Shopify Payments",
        "Advanced features require additional apps (extra costs)",
        "Limited customization on lower plans",
        "Blog functionality is basic compared to specialized platforms",
        "Can become expensive with premium themes and apps"
      ],
      pricingInfo: {
        monthly: 39,
        yearly: 348,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {name: "Basic", price: 39, features: ["2 staff accounts", "4 inventory locations", "Basic reports", "Up to 1,000 inventory locations"]},
          {name: "Shopify", price: 105, features: ["5 staff accounts", "5 inventory locations", "Standard reports", "Professional reports"]},
          {name: "Advanced", price: 399, features: ["15 staff accounts", "8 inventory locations", "Advanced reports", "Custom report builder"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.10web.io",
    updates: {
      disadvantages: [
        "Limited to WordPress platform",
        "Advanced features only in paid plans",
        "Less design flexibility than some competitors",
        "Relatively new compared to established builders",
        "Learning curve for WordPress beginners"
      ],
      pricingInfo: {
        monthly: 10,
        yearly: 96,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["AI website builder", "Limited hosting", "Basic features"]},
          {name: "Personal", price: 10, features: ["1 website", "Hosting", "PageSpeed Boost", "AI Builder"]},
          {name: "Premium", price: 24, features: ["3 websites", "Hosting", "PageSpeed Boost", "Premium support"]},
          {name: "Agency", price: 60, features: ["10 websites", "Hosting", "PageSpeed Boost", "White labeling"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.b12.io",
    updates: {
      disadvantages: [
        "More expensive than basic website builders",
        "Limited design customization compared to professional design",
        "Focused on service businesses more than e-commerce",
        "May require subscription for advanced features",
        "Less template variety than some competitors"
      ],
      pricingInfo: {
        monthly: 21,
        yearly: 192,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {name: "Basic", price: 21, features: ["AI website builder", "Custom domain", "Mobile responsive", "Basic SEO"]},
          {name: "Pro", price: 29, features: ["All Basic features", "Online scheduling", "Contact management", "Advanced SEO"]},
          {name: "Business", price: 49, features: ["All Pro features", "Online payments", "Email marketing", "Priority support"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.brizy.io",
    updates: {
      disadvantages: [
        "Limited advanced customization without coding",
        "Fewer integrations than established competitors",
        "WordPress plugin may conflict with themes/plugins",
        "Limited eCommerce capabilities",
        "Steeper learning curve than some builders"
      ],
      pricingInfo: {
        monthly: 0,
        yearly: 49,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["3 websites", "Basic elements", "Hosting not included"]},
          {name: "Personal", price: 49, features: ["3 websites", "All elements", "Popup builder", "Yearly billing"]},
          {name: "Studio", price: 99, features: ["100 websites", "All features", "White label", "Yearly billing"]},
          {name: "Lifetime", price: 299, features: ["Unlimited websites", "All features", "White label", "One-time payment"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.duda.co",
    updates: {
      disadvantages: [
        "Higher pricing than consumer-focused platforms",
        "Steeper learning curve for beginners",
        "Limited free trial period",
        "Advanced features require higher-tier plans",
        "E-commerce capabilities less robust than dedicated platforms"
      ],
      pricingInfo: {
        monthly: 14,
        yearly: 168,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {name: "Basic", price: 14, features: ["1 website", "Email support", "Basic website builder"]},
          {name: "Team", price: 22, features: ["Up to 4 websites", "Team collaboration", "Site export", "Widget builder"]},
          {name: "Agency", price: 44, features: ["Up to 10 websites", "Client management", "White labeling", "API access"]},
          {name: "Custom", price: 0, features: ["Unlimited websites", "Custom pricing", "Full API access", "Priority support"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.jimdo.com",
    updates: {
      disadvantages: [
        "Limited design flexibility compared to competitors",
        "Fewer templates than other platforms",
        "Basic e-commerce capabilities",
        "Limited marketing tools",
        "Storage limitations on lower plans"
      ],
      pricingInfo: {
        monthly: 9,
        yearly: 108,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Play", price: 0, features: ["Basic website", "Jimdo subdomain", "Limited storage"]},
          {name: "Start", price: 9, features: ["Custom domain", "5GB storage", "Remove Jimdo ads"]},
          {name: "Grow", price: 15, features: ["10GB storage", "Professional email", "SEO tools"]},
          {name: "eCommerce", price: 19, features: ["15GB storage", "Online store", "Order management"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.hostinger.com/website-builder",
    updates: {
      disadvantages: [
        "Limited template selection compared to competitors",
        "Basic design customization options",
        "Less suitable for complex websites",
        "Free plan not available",
        "E-commerce features not as robust as dedicated platforms",
        "Higher renewal rates after initial period",
        "Limited third-party integrations"
      ],
      pricingInfo: {
        monthly: 2.99,
        yearly: 35.88,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {name: "Starter", price: 2.99, features: ["Free domain", "100 websites", "100GB storage", "10,000 monthly visits"]},
          {name: "Premium", price: 3.99, features: ["Free domain", "100 websites", "200GB storage", "25,000 monthly visits"]},
          {name: "Business", price: 4.99, features: ["Free domain", "100 websites", "200GB storage", "100,000 monthly visits", "Daily backups"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.site123.com",
    updates: {
      disadvantages: [
        "Very limited design customization options",
        "Lacks advanced features for professional sites",
        "Free plan has prominent SITE123 branding",
        "Small storage limits even on paid plans",
        "Cannot change templates after site creation",
        "Basic e-commerce functionality",
        "Limited SEO control compared to competitors",
        "Fewer integrations with third-party services"
      ],
      pricingInfo: {
        monthly: 12.80,
        yearly: 108,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free", price: 0, features: ["500MB storage", "1GB bandwidth", "SITE123 subdomain", "SITE123 floating tag"]},
          {name: "Basic", price: 12.80, features: ["10GB storage", "5GB bandwidth", "Custom domain", "Remove SITE123 tag"]},
          {name: "Advanced", price: 19.80, features: ["30GB storage", "15GB bandwidth", "E-commerce", "Email accounts"]},
          {name: "Professional", price: 28.80, features: ["90GB storage", "45GB bandwidth", "Credit card payments", "Advanced eCommerce"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.mobirise.com",
    updates: {
      disadvantages: [
        "Premium extensions and themes cost extra (one-time purchases)",
        "Less suitable for large, complex websites",
        "Limited built-in templates in free version",
        "Requires separate web hosting solution",
        "Some features locked behind premium extensions",
        "Steeper learning curve than some online builders",
        "Less community support than established platforms",
        "No built-in CMS functionality",
        "Limited e-commerce capabilities without extensions"
      ],
      pricingInfo: {
        monthly: 0,
        yearly: 0,
        hasFreeTier: true,
        currency: "USD",
        tiers: [
          {name: "Free Software", price: 0, features: ["Core software", "Basic blocks", "Limited templates", "No subscription"]},
          {name: "Extensions", price: 49, features: ["Individual extensions", "One-time purchase", "Additional functionality"]},
          {name: "Premium Templates", price: 49, features: ["Premium design templates", "One-time purchase"]},
          {name: "All-in-One Kit", price: 149, features: ["All extensions", "All templates", "Code editor", "Lifetime access"]}
        ]
      }
    }
  },
  {
    externalUrl: "https://www.zipwp.com",
    updates: {
      disadvantages: [
        "Requires separate WordPress hosting",
        "Still dependent on WordPress knowledge for advanced customization",
        "Less intuitive than dedicated website builders",
        "Smaller user community than established solutions",
        "Relatively new product with fewer reviews",
        "Limited template selection compared to major competitors",
        "May require additional plugin purchases for specific functionality",
        "WordPress security and maintenance concerns still apply"
      ],
      pricingInfo: {
        monthly: 9,
        yearly: 99,
        hasFreeTier: false,
        currency: "USD",
        tiers: [
          {name: "Monthly", price: 9, features: ["Unlimited websites", "Access to all templates", "AI website creation", "Premium support"]},
          {name: "Yearly", price: 99, features: ["Unlimited websites", "Access to all templates", "AI website creation", "Premium support"]},
          {name: "Lifetime", price: 249, features: ["Unlimited websites", "Access to all templates", "AI website creation", "Premium support", "One-time payment"]}
        ]
      }
    }
  }
];

async function updateProducts() {
  console.log("Starting product updates...");
  
  for (const product of updatedProducts) {
    try {
      // Najdi produkt podle externalUrl
      const existingProduct = await prisma.product.findFirst({
        where: {
          externalUrl: product.externalUrl
        }
      });
      
      if (existingProduct) {
        console.log(`Updating product: ${existingProduct.name}`);
        
        // Aktualizuj produkt s novými daty
        await prisma.product.update({
          where: {
            id: existingProduct.id
          },
          data: {
            disadvantages: JSON.stringify(product.updates.disadvantages),
            pricingInfo: JSON.stringify(product.updates.pricingInfo)
          }
        });
        
        console.log(`✅ Updated: ${existingProduct.name}`);
      } else {
        console.log(`⚠️ Product not found: ${product.externalUrl}`);
      }
    } catch (error) {
      console.error(`Error updating product ${product.externalUrl}:`, error);
    }
  }
  
  console.log("All updates completed!");
}

// Spusť aktualizaci
updateProducts()
  .catch((e) => {
    console.error("Error during update process:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 