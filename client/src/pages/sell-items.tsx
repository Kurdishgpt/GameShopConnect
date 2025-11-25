import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Trash2 } from "lucide-react";

const addItemSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
});

type AddItemFormData = z.infer<typeof addItemSchema>;

export default function SellItems() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "owner")) {
      toast({
        title: "Access Denied",
        description: "Only owners can sell items",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [isAuthenticated, isLoading, user?.role, toast]);

  const { data: items = [] } = useQuery<any[]>({
    queryKey: ["/api/shop/items"],
    enabled: isAuthenticated,
  });

  const form = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: AddItemFormData) => {
      return await apiRequest("POST", "/api/shop/items", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item added to shop successfully!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/shop/items"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddItemFormData) => {
    addItemMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user?.role !== "owner") {
    return null;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-bold text-4xl" data-testid="heading-sell-items">
            Sell Items
          </h1>
          <p className="text-muted-foreground mt-2">
            Add new gaming gear and products to your shop
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Item Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add New Item</CardTitle>
                <CardDescription>
                  Add a new product to your shop inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Gaming Headset" {...field} data-testid="input-item-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the item..."
                              className="resize-none"
                              rows={3}
                              {...field}
                              data-testid="input-item-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 99.99" {...field} data-testid="input-item-price" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Audio" {...field} data-testid="input-item-category" />
                          </FormControl>
                          <FormDescription>
                            Such as: Audio, Controllers, Keyboards, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} data-testid="input-item-image" />
                          </FormControl>
                          <FormDescription>
                            Link to product image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={addItemMutation.isPending}
                      className="w-full"
                      data-testid="button-add-item"
                    >
                      {addItemMutation.isPending ? "Adding..." : "Add Item"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Inventory List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shop Inventory</CardTitle>
                <CardDescription>
                  Manage all items in your shop ({items?.length || 0} items)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {items && items.length > 0 ? (
                    items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-3 border rounded-lg hover-elevate"
                        data-testid={`item-card-${item.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate" data-testid={`item-name-${item.id}`}>
                            {item.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" data-testid={`item-price-${item.id}`}>
                              ${item.price}
                            </Badge>
                            {item.category && (
                              <Badge variant="outline">{item.category}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">No items in inventory yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
