package com.kodnest.app.userservices;

import java.util.List;

import com.kodnest.app.entities.Product;

public interface ProductServiceContract {
	 List<Product> getProductsByCategory(String categoryName);

	    List<String> getProductImages(int productId);
}
