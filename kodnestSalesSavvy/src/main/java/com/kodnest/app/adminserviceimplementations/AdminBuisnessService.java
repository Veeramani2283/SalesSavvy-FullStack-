package com.kodnest.app.adminserviceimplementations;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.kodnest.app.adminServices.AdminBuisnessServiceContract;
import com.kodnest.app.entities.Order;
import com.kodnest.app.entities.OrderItem;
import com.kodnest.app.entities.OrderStatus;
import com.kodnest.app.userreposotries.OrderItemRepository;
import com.kodnest.app.userreposotries.OrderRepository;
import com.kodnest.app.userreposotries.ProductRepository;

@Service
public class AdminBuisnessService implements AdminBuisnessServiceContract{
	
	private final OrderRepository orderRepository;
	private final OrderItemRepository orderItemRepository;
	private final ProductRepository productRepository;
	
	
	
	public AdminBuisnessService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
			ProductRepository productRepository) {
		super();
		this.orderRepository = orderRepository;
		this.orderItemRepository = orderItemRepository;
		this.productRepository = productRepository;
	}

	@Override
	public Map<String, Object> calculateMonthlyBuisness(int month, int year) {
		List<Order> successfulOrders = orderRepository.findSuccessfulOrdersByMonthAndYear(month, year);
		return calculateBuisnessMetrics(successfulOrders);
	}

	@Override
	public Map<String, Object> calculateDailyBuisness(LocalDate date) {
		List<Order> successfulOrders = orderRepository.findSuccessfulOrdersByDate(date);
		return calculateBuisnessMetrics(successfulOrders);
	}

	@Override
	public Map<String, Object> calculateYearlyBuisness(int year) {
		List<Order> successfulOrders = orderRepository.findSuccessfulOrdersByYear(year);
		return calculateBuisnessMetrics(successfulOrders);
	}

	@Override
	public Map<String, Object> calculateOverallBuisness() {
		List<Order> successfulOrders = orderRepository.findAllByStatusForOverllBuisness();
		return calculateBuisnessMetrics(successfulOrders);
	}
	
	private Map<String, Object> calculateBuisnessMetrics(List<Order> orders){
		double totalRevenue = 0.0;
		Map<String, Integer> categorySales = new HashMap();
		
		for(Order order: orders) {
			totalRevenue+=order.getTotalAmount().doubleValue();

			List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
			for(OrderItem item : items) {
				
			String categoryName = productRepository.findCategoryNameByProductId(item.getProductId());
			categorySales.put(categoryName, categorySales.getOrDefault(categoryName, 0)+ item.getQuantity());
			}
		}
		Map<String, Object> metrics = new HashMap<>();
		metrics.put("totalRevenue", totalRevenue);
		metrics.put("categorySales", categorySales);
		return metrics;
	}
	

}














