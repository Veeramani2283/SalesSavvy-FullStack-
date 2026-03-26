package com.kodnest.app.admincontroller;

import java.time.LocalDate;
import java.util.Map;
import com.kodnest.app.userreposotries.JWTTokenRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kodnest.app.adminServices.AdminBuisnessServiceContract;

@RestController
@RequestMapping("/admin/buisness")
public class AdminBuisnessController {

	private final AdminBuisnessServiceContract adminBuisnessService;

	public AdminBuisnessController(AdminBuisnessServiceContract adminBuisnessService) {
		super();
		this.adminBuisnessService = adminBuisnessService;
		
	}
	
	@GetMapping("/monthly")
	public ResponseEntity<?> getMonthlyBuisness(@RequestParam int month, @RequestParam int year){
		try {
			Map<String, Object>buisnessReport = adminBuisnessService.calculateMonthlyBuisness(month, year);
			return ResponseEntity.status(HttpStatus.OK).body(buisnessReport);
		}catch(IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(e.getMessage());
		}catch(Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
		}
	}
	
	@GetMapping("/daily")
	public ResponseEntity<?> getDailyBuisness(@RequestParam String date){
		try {
			LocalDate localDate = LocalDate.parse(date);
			Map<String, Object>buisnessReport = adminBuisnessService.calculateDailyBuisness(localDate);
			return ResponseEntity.status(HttpStatus.OK).body(buisnessReport);
		}catch(IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(e.getMessage());
		}catch(Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
		}
	} 
	
	@GetMapping("/yearly")
	public ResponseEntity<?> getYearlyBuisness(@RequestParam int year){
		try {
			Map<String, Object>buisnessReport = adminBuisnessService.calculateYearlyBuisness(year);
			return ResponseEntity.status(HttpStatus.OK).body(buisnessReport);
		}catch(IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(e.getMessage());
		}catch(Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong");
		}
	} 
	
	@GetMapping("/overall")
	public ResponseEntity<?> getOverallBuisness(){
		try {
			Map<String, Object>buisnessReport = adminBuisnessService.calculateOverallBuisness();
			return ResponseEntity.status(HttpStatus.OK).body(buisnessReport);
		}catch(Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Something went wrong while calculating overall buisness");
		}
	}
}
