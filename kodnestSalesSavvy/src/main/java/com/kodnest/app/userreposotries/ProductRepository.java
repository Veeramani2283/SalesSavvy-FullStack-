package com.kodnest.app.userreposotries;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.kodnest.app.entities.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer>{
	List<Product> findByCategory_CategoryId(int categoryId);
	
	@Query("select p.category.categoryName From Product p Where p.productId =:productId")
	String findCategoryNameByProductId(int productId);
	
}
