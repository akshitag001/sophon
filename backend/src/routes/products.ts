import { Router, Request, Response } from 'express';
import { listProducts, getProduct, compareProducts, AssetClass } from '../domain/catalog';

export const productsRouter = Router();

// GET /products
productsRouter.get('/', (req: Request, res: Response) => {
  const { asset_class, max_risk_level, min_risk_level, max_min_investment } = req.query;

  const filter = {
    asset_class: asset_class ? (asset_class as AssetClass) : undefined,
    max_risk_level: max_risk_level ? Number(max_risk_level) : undefined,
    min_risk_level: min_risk_level ? Number(min_risk_level) : undefined,
    max_min_investment: max_min_investment ? Number(max_min_investment) : undefined
  };

  const products = listProducts(filter);
  res.json({ products, count: products.length });
});

// GET /products/:id
productsRouter.get('/:id', (req: Request, res: Response) => {
  const product = getProduct(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found', id: req.params.id });
  }
  res.json(product);
});

// POST /products/compare
productsRouter.post('/compare', (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array of product IDs' });
  }

  const comparison = compareProducts(ids);
  res.json({ comparison, count: comparison.length });
});
