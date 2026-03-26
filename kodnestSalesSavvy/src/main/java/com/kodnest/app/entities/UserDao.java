package com.kodnest.app.entities;

public class UserDao {
	private int userid; // Added 'private' for better practice
	private String username;
	private String email;
	private String role;
	
	public UserDao() {
	}

	public UserDao(int userid, String username, String email, String role) {
		super();
		this.userid = userid;
		this.username = username;
		this.email = email;
		this.role = role;
	}

	// GETTERS - THESE ARE WHAT FIX THE EMPTY {} ISSUE
	public int getUserid() {
		return userid;
	}

	public String getUsername() {
		return username;
	}

	public String getEmail() {
		return email;
	}

	public String getRole() {
		return role;
	}

	// SETTERS (Optional but recommended)
	public void setUserid(int userid) {
		this.userid = userid;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public void setRole(String role) {
		this.role = role;
	}
}