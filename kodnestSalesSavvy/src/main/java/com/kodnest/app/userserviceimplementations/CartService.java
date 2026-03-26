package com.kodnest.app.userserviceimplementations;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kodnest.app.entities.Cart_Items;
import com.kodnest.app.entities.Product;
import com.kodnest.app.entities.ProductImage;
import com.kodnest.app.entities.User;
import com.kodnest.app.userreposotries.CartRepository;
import com.kodnest.app.userreposotries.ProductImageRepository;
import com.kodnest.app.userreposotries.ProductRepository;
import com.kodnest.app.userreposotries.UserRepository;
import com.kodnest.app.userservices.CartServiceContract;

@Service
public class CartService implements CartServiceContract{
	
	ProductRepository productRepository;
	CartRepository cartRepository;
	ProductImageRepository productImageRepository;
	UserRepository userRepository;
	
	public void deleteCartItem(int userId, int productId) {
		// TODO Auto-generated method stub
		
	}
	
	@Autowired
	public CartService(ProductRepository productRepository, CartRepository cartRepository,
			ProductImageRepository productImageRepository, UserRepository userRepository) {
		super();
		this.productRepository = productRepository;
		this.cartRepository = cartRepository;
		this.productImageRepository = productImageRepository;
		this.userRepository = userRepository;
	}

	public void addToCart(User user, int productId, int quantity) {
		Product product = productRepository.findById(productId)
				.orElseThrow(()-> new IllegalArgumentException("Product not found with ID: "+ productId));
				
				//fetch cart item for this userid and product id
				Optional<Cart_Items> existingItem = cartRepository.findByUserAndProduct(user.getUserId(), productId);
		
				if(existingItem.isPresent()) {
					Cart_Items cartItem = existingItem.get();
					cartItem.setQuantity(cartItem.getQuantity()+quantity);
					cartRepository.save(cartItem);
				}else {
					Cart_Items newItem = new Cart_Items(user, product, quantity);
					cartRepository.save(newItem);
				}
				
//			Product product1=productRepository.findById(productId).orElseThrow(()-> new RuntimeException("Message"));
//			Optional<Cart_Items> availableItem=cartRepository(user.getUserId(), product1.getProductId());
//			
//			if(availableItem.isPresent()) {
//				Cart_Items item = availableItem.get();
//				item.setQuantity(item.getQuantity()+ quantity);
//				cartRepository.save(item);
//			} else {
//				Cart_Items newItem =new Cart_Items(user, product1, quantity);
//				cartRepository.save(newItem);
//			}
//			
			
	}

	@Override
	public Map<String, Object> getCartItems(User authenticatedUser) {
		List<Cart_Items> cartItems = cartRepository.findCartItemsWithProductDetails(authenticatedUser.getUserId());
		Map<String, Object> response = new HashMap();
		response.put("username", authenticatedUser.getUsername());
		response.put("role", authenticatedUser.getRole().toString());
		
		List<Map<String,Object>> products = new ArrayList<>();
		int overallTotalPrice = 0;
		
		for(Cart_Items cartItem : cartItems) {
			Map<String, Object> productDetails = new HashMap<>();
			Product product = cartItem.getProduct();
			
			List<ProductImage> productImages = productImageRepository.findByProduct_ProductId(product.getProductId());
//			String imageurl;
//			if(productImages!=null && !productImages.isEmpty()) {
//				productImages.get(0).getImageUrl();
//			}else {
//				imageurl="default-image-url";
//			}
			String imageUrl = (productImages != null && !productImages.isEmpty()) ? productImages.get(0).getImageUrl(): "default-image-url";
			productDetails.put("product_id", product.getProductId());
			productDetails.put("image_url", imageUrl);
			productDetails.put("name", product.getName());
			productDetails.put("description", product.getDescription());
			productDetails.put("price_per_unit", product.getPrice());
			productDetails.put("quantity", cartItem.getQuantity());
			productDetails.put("total_price", cartItem.getQuantity()*product.getPrice().doubleValue());
			
			products.add(productDetails);
			overallTotalPrice += cartItem.getQuantity()* product.getPrice().doubleValue();
		}
		Map<String, Object> cart = new HashMap<>();
		cart.put("products", products);
		cart.put("overall_total_price", overallTotalPrice);
		response.put("cart", cart);
		return response;
		
	}

	@Override
	public void updateCartItemQuantity(User authenticatedUser, int productId, int quantity) {
		// TODO Auto-generated method stub
		User ref = userRepository.findById(authenticatedUser.getUserId()).orElseThrow(()-> new RuntimeException("UserNotFound"));
		Product product = productRepository.findById(productId).orElseThrow(()-> new IllegalArgumentException("Product not found")); 
		Optional<Cart_Items> existingItem = cartRepository.findByUserAndProduct(authenticatedUser.getUserId() ,productId);
		if(existingItem.isPresent()) {
			Cart_Items item = existingItem.get();
			if(quantity == 0) {
				deleteCartItems(authenticatedUser.getUserId(), productId);
			}else {
				item.setQuantity(quantity);
				cartRepository.save(item);
			}
		}else {
		throw new RuntimeException("Cart item not found associated with product and user");
	}
}
	public void deleteCartItems(int userid, int productId) {
		// TODO Auto-generated method stub
		Product product = productRepository.findById(productId).orElseThrow(()-> new IllegalArgumentException("product not found"));
		cartRepository.deleteCartItem(userid, productId);
	}
	
	@Override
	public int getCartItemCount(int userId) {
		
		int count = cartRepository.countTotalItems(userId);
		return count;
	}

}








