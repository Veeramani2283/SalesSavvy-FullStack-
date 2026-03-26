package com.kodnest.app.adminServices;

import com.kodnest.app.entities.Product;

public interface AdminProductServiceContract {
	public Product addProductWithImage(String name, String description, Double price, int stock, int categoryId, String imegUrl);
	public void deleteProduct(int productId);
}
