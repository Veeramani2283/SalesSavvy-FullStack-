package com.kodnest.app.adminServices;

import java.time.LocalDate;
import java.util.Map;


public interface AdminBuisnessServiceContract {
	public Map<String, Object> calculateMonthlyBuisness(int month, int year);
	public Map<String, Object> calculateDailyBuisness(LocalDate date);
	public Map<String, Object> calculateYearlyBuisness(int year);
	public Map<String, Object> calculateOverallBuisness();
	


}
