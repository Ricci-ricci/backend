import { z } from "zod";
export declare const addToCartSchema: z.ZodObject<{
    body: z.ZodObject<{
        userId: z.ZodString;
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateCartItemSchema: z.ZodObject<{
    params: z.ZodObject<{
        itemId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        quantity: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getCartSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const removeCartItemSchema: z.ZodObject<{
    params: z.ZodObject<{
        itemId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const clearCartSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=cart.schema.d.ts.map