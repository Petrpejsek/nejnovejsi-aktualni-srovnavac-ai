import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.product.deleteMany();

  // Create new products
  const products = [
    {
      name: 'ChatGPT',
      description: 'Advanced language model for conversation and text generation',
      price: 20,
      category: 'Chatbot',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=ChatGPT',
      tags: JSON.stringify(['AI', 'Chatbot', 'Text Generation']),
      advantages: JSON.stringify(['Natural conversation', 'Broad knowledge', 'Quick responses']),
      disadvantages: JSON.stringify(['Occasional inaccuracies', 'Limited conversation length', 'Need for fact verification']),
      detailInfo: 'ChatGPT is an advanced language model developed by OpenAI. It can engage in natural conversation, assist with writing, answer questions, and solve various tasks.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '20', enterprise: '100' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://chat.openai.com',
      hasTrial: true
    },
    {
      name: 'Claude',
      description: 'Intelligent AI assistant for complex tasks and analysis',
      price: 25,
      category: 'Chatbot',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Claude',
      tags: JSON.stringify(['AI', 'Chatbot', 'Analysis']),
      advantages: JSON.stringify(['Long conversations', 'Accurate responses', 'Document processing']),
      disadvantages: JSON.stringify(['Higher price', 'Less creative', 'Limited availability']),
      detailInfo: 'Claude is an AI assistant developed by Anthropic. It excels in long conversations, document analysis, and solving complex tasks.',
      pricingInfo: JSON.stringify({ basic: '10', pro: '25', enterprise: '150' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://claude.ai',
      hasTrial: false
    },
    {
      name: 'Adobe Firefly',
      description: 'Advanced AI tool for image generation and editing from Adobe',
      price: 20,
      category: 'Image Generation',
      imageUrl: '/screenshots/adobe-firefly.png',
      tags: JSON.stringify(['AI', 'Image Generation', 'Photo Editing', 'Adobe']),
      advantages: JSON.stringify(['High-quality outputs', 'Adobe products integration', 'Easy to use', 'Commercial license']),
      disadvantages: JSON.stringify(['Some features only in paid version', 'Requires Adobe account', 'Limited free generations']),
      detailInfo: 'Adobe Firefly is a revolutionary AI tool for image generation and editing. It offers advanced features like text-to-image generation, photo editing, style transfer, and much more. It\'s fully integrated with Adobe Creative Cloud and offers commercial licensing for created content.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '20', enterprise: 'Custom' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.adobe.com/sensei/generative-ai/firefly.html',
      hasTrial: true
    },
    {
      name: 'Midjourney',
      description: 'Premium tool for generating artistic images using AI',
      price: 30,
      category: 'Image Generation',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Midjourney',
      tags: JSON.stringify(['AI', 'Image Generation', 'Art']),
      advantages: JSON.stringify(['High artistic quality', 'Active community', 'Unique style']),
      disadvantages: JSON.stringify(['Higher price', 'Discord environment only', 'Complex controls']),
      detailInfo: 'Midjourney is an AI tool for generating artistic images. It excels in creating unique and aesthetically pleasing visuals.',
      pricingInfo: JSON.stringify({ basic: '10', pro: '30', enterprise: '120' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.midjourney.com',
      hasTrial: true
    },
    {
      name: 'DALL-E',
      description: 'AI model from OpenAI for image generation and editing',
      price: 20,
      category: 'Image Generation',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=DALL-E',
      tags: JSON.stringify(['AI', 'Image Generation', 'OpenAI']),
      advantages: JSON.stringify(['Accurate prompt following', 'Image editing', 'Intuitive interface']),
      disadvantages: JSON.stringify(['Limited credits', 'Less artistic style', 'Occasional detail inaccuracies']),
      detailInfo: 'DALL-E is an AI system from OpenAI for generating and editing images based on text descriptions.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '20', enterprise: '80' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://openai.com/dall-e-3',
      hasTrial: true
    },
    {
      name: 'Stable Diffusion',
      description: 'Open-source AI model for image generation',
      price: 0,
      category: 'Image Generation',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Stable+Diffusion',
      tags: JSON.stringify(['AI', 'Image Generation', 'Open Source']),
      advantages: JSON.stringify(['Free', 'Self-hosting possible', 'Large community']),
      disadvantages: JSON.stringify(['Technically challenging', 'Requires powerful hardware', 'Less intuitive']),
      detailInfo: 'Stable Diffusion is an open-source AI model for image generation that can be run locally or used through various hosted services.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '0', enterprise: 'Custom' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://stability.ai',
      hasTrial: true
    },
    {
      name: 'Jasper',
      description: 'AI copywriting assistant for marketing content',
      price: 40,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Jasper',
      tags: JSON.stringify(['AI', 'Copywriting', 'Marketing']),
      advantages: JSON.stringify(['Marketing specialization', 'Many templates', 'SEO optimization']),
      disadvantages: JSON.stringify(['High price', 'Occasional repetitive content', 'Requires review']),
      detailInfo: 'Jasper is an AI tool specialized in creating marketing content, including blogs, ads, and social media posts.',
      pricingInfo: JSON.stringify({ basic: '40', pro: '70', enterprise: '200' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.jasper.ai',
      hasTrial: true
    },
    {
      name: 'Copy.ai',
      description: 'AI tool for generating marketing copy',
      price: 35,
      category: 'Copywriting',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Copy.ai',
      tags: JSON.stringify(['AI', 'Copywriting', 'Marketing']),
      advantages: JSON.stringify(['Easy to use', 'Quality outputs', 'Multiple formats']),
      disadvantages: JSON.stringify(['Higher price', 'Basic version limitations', 'English only']),
      detailInfo: 'Copy.ai helps create marketing copy, emails, product descriptions, and other content using AI.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '35', enterprise: '150' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.copy.ai',
      hasTrial: true
    },
    {
      name: 'Grammarly',
      description: 'AI assistant for text checking and improvement',
      price: 30,
      category: 'Writing',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Grammarly',
      tags: JSON.stringify(['AI', 'Grammar', 'Writing']),
      advantages: JSON.stringify(['Accurate error detection', 'Improvement suggestions', 'Multi-platform']),
      disadvantages: JSON.stringify(['Monthly subscription', 'Occasional false suggestions', 'Limited language support']),
      detailInfo: 'Grammarly is an advanced AI tool for checking spelling, grammar, and style in text.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '30', enterprise: '100' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.grammarly.com',
      hasTrial: true
    },
    {
      name: 'Notion AI',
      description: 'AI assistant integrated into Notion for writing and organization',
      price: 15,
      category: 'Productivity',
      imageUrl: 'https://placehold.co/800x450/f3f4f6/94a3b8?text=Notion+AI',
      tags: JSON.stringify(['AI', 'Productivity', 'Organization']),
      advantages: JSON.stringify(['Notion integration', 'Versatile use', 'Contextual understanding']),
      disadvantages: JSON.stringify(['Requires Notion', 'Limited tokens', 'Basic AI features']),
      detailInfo: 'Notion AI is an integrated assistant in Notion that helps with writing, summarizing, and organizing information.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '15', enterprise: '50' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.notion.so',
      hasTrial: true
    },
    {
      name: 'CapCut',
      description: 'Versatile video editor with advanced AI features',
      price: 0,
      category: 'Video Editing',
      imageUrl: '/screenshots/capcut.png',
      tags: JSON.stringify(['AI', 'Video Editing', 'Social Media']),
      advantages: JSON.stringify(['Free basic version', 'Easy to use', 'Advanced AI features', 'Mobile and desktop versions']),
      disadvantages: JSON.stringify(['Watermark in free version', 'Limited export resolution in free', 'Some advanced features PRO only']),
      detailInfo: 'CapCut is a modern video editor with integrated AI features. It offers a simple interface for beginners and advanced features for professionals. Automatic adjustments, effects, and transitions make CapCut great for creating social media videos.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '12', enterprise: 'Custom' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://www.capcut.com',
      hasTrial: true
    },
    {
      name: 'InVideo',
      description: 'Online platform for creating professional videos with AI assistance',
      price: 15,
      category: 'Video Creation',
      imageUrl: '/screenshots/invideo.png',
      tags: JSON.stringify(['AI', 'Video Creation', 'Online Tool']),
      advantages: JSON.stringify(['Extensive template library', 'Automatic translations', 'Text to video', 'Cloud storage']),
      disadvantages: JSON.stringify(['Requires internet connection', 'Free version limitations', 'Complex advanced features']),
      detailInfo: 'InVideo is a web platform for creating professional videos. It uses AI to automatically generate videos from text, offers thousands of templates, and enables easy team collaboration. Suitable for marketers, business owners, and content creators.',
      pricingInfo: JSON.stringify({ basic: '0', pro: '15', enterprise: '30' }),
      videoUrls: JSON.stringify([]),
      externalUrl: 'https://invideo.io',
      hasTrial: true
    }
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }

  console.log('Seed completed!');
  await prisma.$disconnect();
}

// Run seed
try {
  main();
} catch (error) {
  console.error(error);
  prisma.$disconnect();
  process.exit(1);
}

export default main; 