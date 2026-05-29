package com.app.golgo.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "test_login_credentials")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TestLoginCredential {

	@Id
	@Column(name = "login_id", length = 50)
	private String loginId;

	@Column(name = "password_hash", nullable = false)
	private String passwordHash;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "created_at", nullable = false, insertable = false, updatable = false)
	private Instant createdAt;

	public TestLoginCredential(String loginId, String passwordHash, User user) {
		this.loginId = loginId;
		this.passwordHash = passwordHash;
		this.user = user;
	}
}
