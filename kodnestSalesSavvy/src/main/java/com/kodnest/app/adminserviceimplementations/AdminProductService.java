package com.kodnest.app.adminserviceimplementations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.kodnest.app.adminServices.AdminProductServiceContract;
import com.kodnest.app.entities.Category;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.ProductImage;
import com.kodnest.app.userreposotries.CategoryRepository;
import com.kodnest.app.userreposotries.ProductImageRepository;
import com.kodnest.app.userreposotries.ProductRepository;

@Service
public class AdminProductService implements AdminProductServiceContract{

		private ProductRepository productRepository;
		private ProductImageRepository imageRepository;
		private CategoryRepository categoryRepository;
		
		public AdminProductService(ProductRepository productRepository, ProductImageRepository imageRepository,
				CategoryRepository categoryRepository) {
			super();
			this.productRepository = productRepository;
			this.imageRepository = imageRepository;
			this.categoryRepository = categoryRepository;
		}

		@Override
		public Product addProductWithImage(String name, String description, Double price, int stock, int categoryId, String imageUrl) {

		    // 1. check if category exists using categoryId
		    Optional<Category> category = categoryRepository.findById(categoryId);

		    // if exists create product and add all the values to all attributes to product
		    if (category.isEmpty()) {
		        throw new IllegalArgumentException("Invalid category ID");
		    }

		    Product product = new Product(name, description, BigDecimal.valueOf(price), stock, category.get(), LocalDateTime.now(), LocalDateTime.now());

		    // save product
		    Product savedProduct = productRepository.save(product);

		    // check if image url is nul or balnk or empty
		    // if image url exists create ProductImage and set values to attributes and save ProductImage
		    if (imageUrl != null && !imageUrl.isEmpty()) {
		        ProductImage image = new ProductImage(savedProduct, imageUrl);
		        imageRepository.save(image);
		    }
		    return savedProduct;
		}

		@Override
		public void deleteProduct(int productId) {
			if(!productRepository.existsById(productId)) {
				throw new IllegalArgumentException("Product not found");
				}
				// delete assiciated product images
				imageRepository.deleteByProductId(productId);
				
				// delete the produt
				productRepository.deleteById(productId);
			}
}
		

