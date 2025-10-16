import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, AlertTriangle } from "lucide-react";

export default function AdminInventory() {
  const products: any[] = [];

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock <= reorderLevel) {
      return { label: "Low Stock", variant: "destructive" as const };
    }
    return { label: "In Stock", variant: "secondary" as const };
  };

  const lowStockCount = products.filter(p => p.stock <= p.reorderLevel).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="inventory-title">Inventory Management</h1>
          <p className="text-muted-foreground">Track products, stock levels, and suppliers</p>
        </div>
        <Button data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {lowStockCount > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-100">Low Stock Alert</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {lowStockCount} product{lowStockCount > 1 ? 's' : ''} need to be reordered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const stockStatus = getStockStatus(product.stock, product.reorderLevel);
          return (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
                  </div>
                  <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stock</span>
                    <span className="font-semibold" data-testid={`product-stock-${product.id}`}>
                      {product.stock} units
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Reorder at</span>
                    <span className="font-medium">{product.reorderLevel} units</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="font-medium">AED {product.costPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Selling Price</span>
                    <span className="font-semibold">AED {product.sellingPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Profit Margin</span>
                    <Badge variant="secondary">
                      {Math.round(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100)}%
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  data-testid={`button-edit-product-${product.id}`}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Product
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
