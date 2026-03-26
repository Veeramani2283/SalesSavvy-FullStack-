package com.kodnest.app.userreposotries;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.kodnest.app.entities.OrderItem;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    
    @Query("SELECT io FROM OrderItem io WHERE io.order.orderId = :orderId")
    List<OrderItem> findByOrderId(String orderId);
    
    // Change to 'Successfull' (two L's) to match your Service layer
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.userId = :userId AND oi.order.status = 'SUCCESS'")
    List<OrderItem> findSuccessfullOrderItemsByUserId(int userId);
}
