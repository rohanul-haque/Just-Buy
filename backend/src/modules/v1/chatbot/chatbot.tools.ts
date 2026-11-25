import cartService from "@/modules/v1/cart/cart.service";
import Category from "@/modules/v1/category/category.model";
import type {
  IChatAction,
  IChatProductCard,
} from "@/modules/v1/chatbot/chatbot.interface";
import {
  ProductSize,
  type TProductSize,
} from "@/modules/v1/product/product.constant";
import Product from "@/modules/v1/product/product.model";
import { UserRole } from "@/modules/v1/user/user.constant";
import wishlistService from "@/modules/v1/wishlist/wishlist.service";
import { tool } from "@langchain/core/tools";
import mongoose from "mongoose";
import { z } from "zod";

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const formatProductSummary = (product: any): IChatProductCard => ({
  id: product._id?.toString(),
  name: product.name,
  brand: product.brand || undefined,
  price: product.price,
  stock: product.stock ?? 0,
  inStock: (product.stock ?? 0) > 0,
  sizes: product.sizes || [],
  image: product.featureImage?.url || undefined,
  category: product.category?.name || undefined,
});

export interface IChatbotToolContext {
  userId?: string;
  userRole?: string;
  onProductsFound: (products: IChatProductCard[]) => void;
  onAction: (action: IChatAction) => void;
}

export const createChatbotTools = (context: IChatbotToolContext) => {
  const listCategoriesTool = tool(
    async () => {
      const categories = await Category.find({ isActive: true })
        .select("_id name")
        .sort({ name: 1 })
        .lean()
        .exec();

      return JSON.stringify({
        count: categories.length,
        categories: categories.map((c) => ({
          id: c._id.toString(),
          name: c.name,
        })),
      });
    },
    {
      name: "list_categories",
      description:
        "List all active product categories available on Jus Buy. Call this whenever the user asks about categories or what types of products are sold.",
      schema: z.object({}),
    },
  );

  const searchProductsTool = tool(
    async ({
      query,
      categoryName,
      categoryId,
      minPrice,
      maxPrice,
      inStockOnly,
      limit,
    }) => {
      const filter: Record<string, any> = { isActive: true };

      if (query && query.trim()) {
        const regex = new RegExp(escapeRegex(query.trim()), "i");
        filter.$or = [
          { name: regex },
          { brand: regex },
          { description: regex },
        ];
      }

      if (categoryId && mongoose.isValidObjectId(categoryId)) {
        filter.category = new mongoose.Types.ObjectId(categoryId);
      } else if (categoryName && categoryName.trim()) {
        const matchedCategory = await Category.findOne({
          isActive: true,
          name: { $regex: new RegExp(escapeRegex(categoryName.trim()), "i") },
        })
          .select("_id")
          .lean()
          .exec();

        if (!matchedCategory) {
          return JSON.stringify({
            count: 0,
            products: [],
            note: `No active category matched "${categoryName}".`,
          });
        }
        filter.category = matchedCategory._id;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
      }

      if (inStockOnly) {
        filter.stock = { $gt: 0 };
      }

      const safeLimit = Math.min(Math.max(1, limit ?? 6), 8);

      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .populate("category", "name")
        .lean()
        .exec();

      const formatted = products.map(formatProductSummary);
      if (formatted.length > 0) {
        context.onProductsFound(formatted);
      }

      return JSON.stringify({
        count: formatted.length,
        products: formatted,
      });
    },
    {
      name: "search_products",
      description:
        "Search active Jus Buy products in the database by keyword, category name or ID, price range (minPrice/maxPrice), and stock availability.",
      schema: z.object({
        query: z
          .string()
          .optional()
          .describe("Search keyword for product name, brand, or description"),
        categoryName: z
          .string()
          .optional()
          .describe("Category name to filter products by"),
        categoryId: z
          .string()
          .optional()
          .describe("24-character MongoDB ObjectId of the category"),
        minPrice: z.number().nonnegative().optional().describe("Minimum price"),
        maxPrice: z.number().nonnegative().optional().describe("Maximum price"),
        inStockOnly: z
          .boolean()
          .optional()
          .describe("Set true to return only products currently in stock"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(8)
          .optional()
          .describe("Maximum number of products to return (1-8)"),
      }),
    },
  );

  const getProductDetailsTool = tool(
    async ({ productId }) => {
      if (!mongoose.isValidObjectId(productId)) {
        return JSON.stringify({ found: false, error: "Invalid product ID." });
      }

      const product = await Product.findOne({ _id: productId, isActive: true })
        .populate("category", "name")
        .lean()
        .exec();

      if (!product) {
        return JSON.stringify({
          found: false,
          error: "Product not found or inactive.",
        });
      }

      const formatted = formatProductSummary(product);
      context.onProductsFound([formatted]);

      return JSON.stringify({
        found: true,
        product: {
          ...formatted,
          description: product.description,
          salesCount: product.salesCount,
        },
      });
    },
    {
      name: "get_product_details",
      description:
        "Get full details of a specific active product on Jus Buy by its product ID.",
      schema: z.object({
        productId: z
          .string()
          .describe("24-character MongoDB ObjectId of the product"),
      }),
    },
  );

  const getNewArrivalsTool = tool(
    async ({ limit }) => {
      const safeLimit = Math.min(Math.max(1, limit ?? 4), 8);
      const products = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .populate("category", "name")
        .lean()
        .exec();

      const formatted = products.map(formatProductSummary);
      if (formatted.length > 0) {
        context.onProductsFound(formatted);
      }

      return JSON.stringify({
        count: formatted.length,
        products: formatted,
      });
    },
    {
      name: "get_new_arrivals",
      description: "Retrieve the newest active products added to Jus Buy.",
      schema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(8)
          .optional()
          .describe("Number of newest products to return (default 4, max 8)"),
      }),
    },
  );

  const getFeaturedProductsTool = tool(
    async ({ limit }) => {
      const safeLimit = Math.min(Math.max(1, limit ?? 6), 8);
      const products = await Product.find({ isActive: true, isFeatured: true })
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .populate("category", "name")
        .lean()
        .exec();

      const formatted = products.map(formatProductSummary);
      if (formatted.length > 0) {
        context.onProductsFound(formatted);
      }

      return JSON.stringify({
        count: formatted.length,
        products: formatted,
      });
    },
    {
      name: "get_featured_products",
      description:
        "Retrieve featured active products currently highlighted on Jus Buy.",
      schema: z.object({
        limit: z
          .number()
          .int()
          .min(1)
          .max(8)
          .optional()
          .describe("Number of featured products to return (default 6, max 8)"),
      }),
    },
  );

  const addToCartTool = tool(
    async ({ productId, quantity, size }) => {
      if (!context.userId) {
        return JSON.stringify({
          success: false,
          requiresAuth: true,
          error:
            "Customer is not logged in. They must log in to add items to the cart.",
        });
      }

      if (!context.userId) {
        return JSON.stringify({
          success: false,
          requiresAuth: true,
          error: "Customer is not logged in. They must log in to add items to the cart.",
        });
      }

      if (context.userRole !== UserRole.BUYER) {
        return JSON.stringify({
          success: false,
          error: "Only buyer accounts can add items to the shopping cart.",
        });
      }

      if (!mongoose.isValidObjectId(productId)) {
        return JSON.stringify({
          success: false,
          error: "Invalid product ID.",
        });
      }

      try {
        await cartService.addToCart(context.userId, {
          productId,
          quantity: quantity ?? 1,
          size: size as TProductSize | undefined,
        });
        context.onAction({ type: "CART_UPDATED", productId });

        return JSON.stringify({
          success: true,
          message: "Product added to your shopping cart.",
          productId,
          quantity: quantity ?? 1,
          ...(size ? { size } : {}),
        });
      } catch (err) {
        return JSON.stringify({
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to add product to cart.",
        });
      }
    },
    {
      name: "add_to_cart",
      description:
        "Add an active Jus Buy product to the authenticated buyer's shopping cart. Always verify the productId (and available sizes if applicable) via search_products or get_product_details first.",
      schema: z.object({
        productId: z
          .string()
          .describe("24-character MongoDB ObjectId of the product"),
        quantity: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Quantity to add (default 1)"),
        size: z
          .enum(Object.values(ProductSize) as [string, ...string[]])
          .optional()
          .describe("Product size if the product has sizes (S, M, L, XL, XXL)"),
      }),
    },
  );

  const addToWishlistTool = tool(
    async ({ productId }) => {
      if (!context.userId) {
        return JSON.stringify({
          success: false,
          requiresAuth: true,
          error:
            "Customer is not logged in. They must log in to add items to the wishlist.",
        });
      }

      if (!context.userId) {
        return JSON.stringify({
          success: false,
          requiresAuth: true,
          error: "Customer is not logged in. They must log in to add items to the wishlist.",
        });
      }

      if (context.userRole !== UserRole.BUYER) {
        return JSON.stringify({
          success: false,
          error: "Only buyer accounts can add items to the wishlist.",
        });
      }

      if (!mongoose.isValidObjectId(productId)) {
        return JSON.stringify({
          success: false,
          error: "Invalid product ID.",
        });
      }

      try {
        await wishlistService.addProductToWishlist(context.userId, productId);
        context.onAction({ type: "WISHLIST_UPDATED", productId });

        return JSON.stringify({
          success: true,
          message: "Product added to your wishlist.",
          productId,
        });
      } catch (err) {
        return JSON.stringify({
          success: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to add product to wishlist.",
        });
      }
    },
    {
      name: "add_to_wishlist",
      description:
        "Add an active Jus Buy product to the authenticated buyer's wishlist. Always verify the productId via search_products or get_product_details first.",
      schema: z.object({
        productId: z
          .string()
          .describe("24-character MongoDB ObjectId of the product"),
      }),
    },
  );

  const tools = [
    listCategoriesTool,
    searchProductsTool,
    getProductDetailsTool,
    getNewArrivalsTool,
    getFeaturedProductsTool,
    addToCartTool,
    addToWishlistTool,
  ];

  const toolMap: Record<string, (typeof tools)[number]> = {
    list_categories: listCategoriesTool,
    search_products: searchProductsTool,
    get_product_details: getProductDetailsTool,
    get_new_arrivals: getNewArrivalsTool,
    get_featured_products: getFeaturedProductsTool,
    add_to_cart: addToCartTool,
    add_to_wishlist: addToWishlistTool,
  };

  return { tools, toolMap };
};
