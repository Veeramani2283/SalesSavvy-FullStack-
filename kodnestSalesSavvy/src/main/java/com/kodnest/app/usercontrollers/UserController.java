package com.kodnest.app.usercontrollers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kodnest.app.entities.User;
import com.kodnest.app.entities.UserDao;
import com.kodnest.app.userservices.UserServiceContract;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5174", allowCredentials = "true")
public class UserController {
	private UserServiceContract userService;

	public UserController(UserServiceContract userService) {
		super();
		this.userService = userService;
	}
	
	@PostMapping("/register")
	public ResponseEntity<?> registerUser(@RequestBody User user) {
		try {
			User registeredUser = userService.registerUser(user);
			return ResponseEntity.ok(Map.of("message","User registered successfully","user", new UserDao(registeredUser.getUserId(), registeredUser.getUsername(), registeredUser.getEmail(), registeredUser.getRole().toString())));
		} catch(RuntimeException e) {
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}
}
